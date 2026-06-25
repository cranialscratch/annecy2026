const CACHE = 'annecy2026-v289';
const CORE = [
  './index.html',
  './styles.v113.css',
  './app.js',
  './data.js',
  './manifest.json',
];

// CDN libraries pre-fetched at install so they survive going offline after first use.
// These must match the exact URLs (with crossorigin="" on the script tags) so cached
// CORS responses can be matched and served by the fetch handler below.
const CDN_CACHE = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/@phosphor-icons/web@2.1.1',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled([
        ...CORE.map(url =>
          fetch(new Request(url, { cache: 'reload' }))
            .then(r => r.ok ? c.put(url, r) : null)
        ),
        // CDN libs: CORS fetch so we can cache a readable response.
        // Silently skipped if network unavailable during install.
        ...CDN_CACHE.map(url =>
          fetch(new Request(url, { cache: 'reload', mode: 'cors', credentials: 'omit' }))
            .then(r => r.ok ? c.put(url, r) : null)
            .catch(() => null)
        ),
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' })))
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Navigation: always network-first, fall back to cached index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }

  const url = new URL(e.request.url);

  // CDN libraries we pre-cache: cache-first so they work offline.
  // Only intercept the specific URLs we know about — don't touch other CDN traffic.
  if (CDN_CACHE.includes(e.request.url)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        // Not cached yet — fetch, cache, and return
        return fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // All other cross-origin (Wikipedia, OSRM, Google, weather, Firebase): never intercept
  if (url.origin !== self.location.origin) return;

  // Same-origin assets: network-first, cache fallback for offline
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

/* ── Server push → show notification (fires even when app is closed) */
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Annecy 2026', {
      body:     data.body  || '',
      tag:      data.tag   || 'push',
      icon:     './icons/icon-180.png',
      badge:    './icons/icon-72.png',
      vibrate:  [200, 100, 200],
      renotify: false,
    })
  );
});

/* ── Show notification on behalf of the page (works when backgrounded) */
self.addEventListener('message', e => {
  if (e.data?.type !== 'SHOW_NOTIF') return;
  const { title, body, tag } = e.data;
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      icon:  './icons/icon-180.png',
      badge: './icons/icon-72.png',
      vibrate: [200, 100, 200],
      renotify: false,
    })
  );
});

/* Tap notification → focus the app */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        const c = clients.find(c => c.url.includes(self.location.origin));
        return c ? c.focus() : self.clients.openWindow('./');
      })
  );
});

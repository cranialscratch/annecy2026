const CACHE = 'annecy2026-v232';
const CORE = [
  './index.html',
  './styles.v113.css',
  './app.js',
  './data.js',
  './manifest.json',
];

// CDN assets pre-fetched at install so they work offline from first use
const CDN_PREFETCH = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/@phosphor-icons/web@2.1.1',
];

// CDN origins whose responses are cached at runtime (covers icon font files etc.)
const CDN_ORIGINS = ['unpkg.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled([
        // Core same-origin files
        ...CORE.map(url =>
          fetch(new Request(url, { cache: 'reload' })).then(r => r.ok ? c.put(url, r) : null)
        ),
        // CDN libraries — network only, don't block activation on failure
        ...CDN_PREFETCH.map(url =>
          fetch(new Request(url, { cache: 'reload', mode: 'cors' }))
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

  // CDN libraries (Leaflet, Phosphor, etc.): cache-first so they work offline
  if (CDN_ORIGINS.some(o => url.hostname.endsWith(o))) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request, { mode: 'cors' }).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        }).catch(() => cached); // return undefined if both fail — browser handles gracefully
      })
    );
    return;
  }

  // Other cross-origin (Wikipedia, OSRM, Google, weather, Firebase): never intercept
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

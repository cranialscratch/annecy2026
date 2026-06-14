const CACHE = 'annecy2026-v105';
const CORE = [
  './index.html',
  './styles.v104.css',
  './app.js',
  './data.js',
  './manifest.json',
];

self.addEventListener('install', e => {
  // Pre-cache core assets, but don't block activation
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(CORE.map(url =>
        fetch(new Request(url, { cache: 'reload' })).then(r => r.ok ? c.put(url, r) : null)
      )))
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

  // Navigation: always network-first
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }

  // Cross-origin (Wikipedia, OSRM, Leaflet, CDN): never intercept
  const url = new URL(e.request.url);
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

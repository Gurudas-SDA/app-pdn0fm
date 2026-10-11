// Bump VERSION on every content update so clients fetch a fresh copy.
const VERSION = 'slokas-v1';
const ASSETS = ['index.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png',
  'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon-180.png', 'icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Navigations ("./" or "index.html") are served from the single cached index.html (avoids storing 13.6 MB twice).
  const req = e.request.mode === 'navigate' ? 'index.html' : e.request;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => {
    if (hit) return hit;
    return fetch(e.request).catch(() =>
      e.request.mode === 'navigate' ? caches.match('index.html') : Response.error());
  }));
});

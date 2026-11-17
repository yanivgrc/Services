// Offline cache for the card. Bump VERSION when files other than card.json change.
const VERSION = 'card-v4';
const CORE = ['./', 'index.html', 'card.css?v=3', 'card.js?v=4', 'matrix.js', 'card.json', 'manifest.webmanifest',
  'qr.svg', 'qr.png', 'assets/portrait.jpg', 'assets/grc-mark.svg',
  'assets/icons/icon-192.png', 'assets/icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin && url.pathname.startsWith(new URL('./', location.href).pathname);
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return; // external links always go to the network

  // HTML and card.json: network first, so content edits show up immediately; cache when offline.
  const fresh = req.mode === 'navigate' || url.pathname.endsWith('/card.json');
  if (fresh) {
    e.respondWith(fetch(req).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./'))));
    return;
  }
  // Everything else: cache first, then network (and keep a copy).
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return r;
  })));
});

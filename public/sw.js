// FatiaBill PWA service worker.
// Strategy:
//   - Static assets (Vite-hashed in /assets/*): cache-first (immutable per build)
//   - HTML navigation: network-first with offline fallback
//   - API requests (/api/*): network-only, never cached (auth + freshness)
//   - Anything else: network-first
//
// Cache name is bumped automatically on each deploy via the Date.now()-ish
// version string baked at SW install time. Old caches are purged.

const VERSION = 'v1';
const SHELL_CACHE = `fb-shell-${VERSION}`;
const ASSET_CACHE = `fb-assets-${VERSION}`;
const OFFLINE_URL = '/offline.html';

const SHELL_FILES = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests (POST to API etc.)
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Same-origin only — let cross-origin requests pass through
  if (url.origin !== self.location.origin) return;

  // Never cache the API
  if (url.pathname.startsWith('/api/')) return;

  // Vite-hashed assets: cache-first (filename embeds hash → safe forever)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // HTML navigation: network-first with offline fallback
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Other same-origin GETs (favicon, manifest): network-first → cache
  event.respondWith(networkFirstWithCache(request, SHELL_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    return cached || Response.error();
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response('Offline', { status: 503 });
  }
}

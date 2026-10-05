/* eslint-disable no-restricted-globals */
/**
 * ZESA Fault Management System service worker.
 *
 * Strategy
 *  - navigations      -> network first, fall back to the cached shell (offline SPA)
 *  - hashed assets    -> cache first (they are immutable, filename includes a hash)
 *  - same-origin GETs -> stale-while-revalidate
 *  - API traffic      -> never intercepted, always straight to the network
 */

const VERSION = 'v1';
const SHELL_CACHE = `zesa-shell-${VERSION}`;
const RUNTIME_CACHE = `zesa-runtime-${VERSION}`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/images.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-64.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // addAll is atomic: a single 404 would leave the SW permanently uninstalled.
      await Promise.all(
        SHELL_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[sw] precache skipped', url, err);
          })
        )
      );
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('zesa-') && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function isAsset(url) {
  return url.pathname.startsWith('/assets/') || /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // backend lives on another origin
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put('/index.html', preload.clone());
            return preload;
          }
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put('/index.html', fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match('/index.html');
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  if (isAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok && fresh.type === 'basic') {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((fresh) => {
          if (fresh.ok && fresh.type === 'basic') cache.put(request, fresh.clone());
          return fresh;
        })
        .catch(() => cached);
      return cached || network;
    })()
  );
});
/* ================================================================
   sw.js — Service Worker v1.0
   Lain Sthid Ramirez Rueda Portfolio
   Estrategia: Cache-First para assets estáticos,
               Network-First para HTML (siempre fresco)
================================================================ */

const CACHE_NAME    = 'lsrr-portfolio-v2';
const ASSETS_CACHE  = 'lsrr-assets-v2';

/* Recursos críticos que se cachean en la instalación */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/i18n.js',
  '/assets/img/profile.png',
  '/assets/img/favicon.svg',
  '/assets/img/favicon.png',
  '/manifest.json',
];

/* ── INSTALL: precachear recursos críticos ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: limpiar caches antiguas ── */
self.addEventListener('activate', event => {
  const validCaches = [CACHE_NAME, ASSETS_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !validCaches.includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH: estrategia híbrida ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Solo interceptar mismo origen */
  if (url.origin !== location.origin) return;

  /* HTML → Network-First (siempre fresco para SEO) */
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  /* Assets (CSS, JS, imágenes) → Cache-First + actualización en background */
  if (
    request.url.match(/\.(css|js|png|svg|webp|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          caches.open(ASSETS_CACHE).then(cache => cache.put(request, response.clone()));
          return response;
        });
        return cached || networkFetch;
      })
    );
    return;
  }
});

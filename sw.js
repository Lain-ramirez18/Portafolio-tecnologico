/* ================================================================
   sw.js — Service Worker v2.0
   Lain Sthid Ramirez Rueda Portfolio
   Estrategia: Network-First para HTML, CSS y JS (siempre fresco)
               Cache-First para assets (imágenes, fuentes)
================================================================ */

const CACHE_NAME    = 'lsrr-portfolio-v7';
const ASSETS_CACHE  = 'lsrr-assets-v7';

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

/* ── FETCH: estrategia Network-First para código, Cache-First para media ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Solo interceptar mismo origen */
  if (url.origin !== location.origin) return;

  /* HTML, CSS, JS → Network-First (siempre fresco) */
  if (
    request.headers.get('accept')?.includes('text/html') ||
    request.url.match(/\.(css|js)$/) ||
    request.url.endsWith('manifest.json')
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(res => res || caches.match('/index.html')))
    );
    return;
  }

  /* Assets (imágenes, fuentes) → Cache-First + actualización en background */
  if (
    request.url.match(/\.(png|svg|webp|woff2?|ttf|jpg|jpeg|gif)$/)
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

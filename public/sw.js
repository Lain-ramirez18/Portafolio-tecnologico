/* ================================================================
   sw.js — Service Worker v3.0 (PRO MAX)
   Lain Sthid Ramirez Rueda Portfolio
   Estrategia: Stale-While-Revalidate para máxima velocidad (Instant Load)
               + Background Sync para mantener todo actualizado.
================================================================ */

const CACHE_NAME    = 'lsrr-portfolio-v8';
const ASSETS_CACHE  = 'lsrr-assets-v8';

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
  // skipWaiting garantiza que el nuevo SW se active inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: limpiar caches antiguas y tomar control ── */
self.addEventListener('activate', event => {
  const validCaches = [CACHE_NAME, ASSETS_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => !validCaches.includes(key)).map(key => caches.delete(key))
      ))
      // claim() asegura que los clientes actuales sean controlados inmediatamente
      .then(() => self.clients.claim())
  );
});

/* ── FETCH: Stale-While-Revalidate (Carga instantánea + Delta update) ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  const isAsset = request.url.match(/\.(png|svg|webp|woff2?|ttf|jpg|jpeg|gif)$/);
  const cacheName = isAsset ? ASSETS_CACHE : CACHE_NAME;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Si hay red, traemos la última versión en segundo plano (Revalidate)
      const fetchPromise = fetch(request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        // Actualizamos la caché con la versión fresca
        const responseToCache = networkResponse.clone();
        caches.open(cacheName).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Fallback offline
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });

      // Retornamos la respuesta en caché INMEDIATAMENTE (Instant Load)
      // Si no está en caché, esperamos a la red.
      return cachedResponse || fetchPromise;
    })
  );
});

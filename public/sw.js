/*
 * Service worker di Tessera — offline-first, senza dipendenze.
 *
 * - App shell precaricata all'installazione.
 * - Il nuovo worker NON si attiva da solo: resta in attesa finché la pagina non
 *   dà l'ok (messaggio SKIP_WAITING). Attivarsi a metà sessione servirebbe
 *   asset di due build diverse alla stessa pagina.
 * - Navigazioni: network-first con fallback all'index in cache (SPA offline).
 * - Asset con hash: stale-while-revalidate (rispondi dalla cache, aggiorna dietro).
 * Cambia CACHE per forzare l'aggiornamento a un nuovo rilascio.
 */
const CACHE = 'tessera-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)),
  );
});

// La pagina chiede l'attivazione quando il giocatore accetta l'aggiornamento.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit ?? caches.match('./index.html'))),
    );
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});

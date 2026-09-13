const CACHE_NAME = 'moodbeat-v2';
const APP_SHELL = [
  'index.html',
  'manifest.json',
  '00-onboarding-boas-vindas/index.html',
  '01-onboarding-permissoes/index.html',
  '02-check-in/index.html',
  '03-diario/index.html',
  '04-relatorios/index.html',
  '05-ajustes/index.html',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
  'assets/data-store.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Network-first, falling back to cache when offline — keeps the PWA
// showing the latest deploy while this is still actively iterated on.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

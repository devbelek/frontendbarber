const CACHE_NAME = 'barberhub-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/vite.svg',
  '/src/main.tsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
const CACHE_NAME = 'bible-app-v1.015';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './textPage.js',
  './bibleText.json',
  './manifest.webmanifest',
  './fone.jpg',
  './icon192.png',
  './icon512.png'
];

// Інсталяція: кешуємо всі файли
self.addEventListener('install', event => {
  self.skipWaiting(); // Примусово активуємо новий SW
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Активація: видаляємо старий кеш (важливо для оновлень!)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Стратегія: спочатку кеш, якщо немає — мережа
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

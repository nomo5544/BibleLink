const CACHE_NAME = 'bible-app-v1.01111';
const urlsToCache = [
  './',
  './textPage.html',
  './style.css',
  './textPage.js',
  './bibleText.json',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

// Інсталяція: кешуємо всі файли
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Стратегія: спочатку кеш, якщо немає — мережа
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

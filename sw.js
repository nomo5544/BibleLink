const CACHE_NAME = 'bible-app-v1.0161';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './textPage.js',
  './bibleText.json',
  './sw.js', // Додаємо сам себе, щоб функція displayVersion працювала офлайн
  './manifest.webmanifest',
  './fone.jpg',
  './icon192.png',
  './icon512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

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

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }) // Ігноруємо параметри в URL
      .then(response => {
        // Повертаємо файл з кешу, або пробуємо мережу
        return response || fetch(event.request).catch(() => {
          // Якщо немає ні в кеші, ні в мережі (наприклад, для JSON)
          console.log("Ресурс не знайдено офлайн");
        });
      })
  );
});

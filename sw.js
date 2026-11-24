const CACHE_NAME = 'bible-app-v1.0167';

// Без цих файлів застосунок не працює офлайн — якщо один не завантажиться, установка скасовується
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './textPage.js',
  './bibleText.json',
  './manifest.webmanifest'
];

// Другорядні файли: помилка завантаження одного з них не блокує установку
const OPTIONAL_ASSETS = [
  './sw.js', // кешуємо сам себе, щоб номер версії показувався офлайн
  './fone.jpg',
  './icon192.png',
  './icon512.png'
];

// cache: 'reload' — під час установки йдемо в обхід HTTP-кешу браузера/CDN, щоб у кеш застосунку
// гарантовано потрапили файли однієї, свіжої версії (а не суміш старих і нових)
const fresh = (url) => new Request(url, { cache: 'reload' });

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS.map(fresh));
    await Promise.all(OPTIONAL_ASSETS.map(url => cache.add(fresh(url)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith('bible-app-') && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

// Усе віддається з локального кешу: застосунок відкривається миттєво й працює без інтернету.
// Нова версія підхоплюється, коли змінюється CACHE_NAME вище.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === 'basic') {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (err) {
      if (request.mode === 'navigate') {
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
      }
      return new Response('Ресурс недоступний офлайн', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});

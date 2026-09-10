const CACHE_NAME = 'nuqui-offline-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icons/icon.svg',
  './vendor/html5-qrcode.min.js',
  './vendor/zxing.min.js',
  './vendor/dexie.min.js',
  './vendor/jspdf.umd.min.js',
  './vendor/xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});

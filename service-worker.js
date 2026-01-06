const cacheName = 'cache-v4';

const files = [
  '/mastermind/',
  'index.html',
  'css/style.css',
  'js/mastermind.js',
  'images/arrow.svg',
  'images/rotate.svg',
  'fonts/liberation-serif-regular.woff2',
  'fonts/liberation-serif-bold.woff2'
];

self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            await cache.addAll(files);
        })()
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(key => key !== cacheName)
                    .map(key => caches.delete(key))
            );
        })()
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            try {
                return await fetch(event.request);
            } catch {
                return caches.match(event.request);
            }
        })()
    );
});
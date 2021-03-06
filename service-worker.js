const cacheName = 'cache-v1';
const files = [
  'https://alex-berson.github.io/15-puzzle/',
  'index.html',
  'css/style.css',
  'css/flip.css',
  'js/mastermind.js',
  'images/refresh.svg',
  'fonts/LiberationSerif-Regular.ttf',
  'fonts/LiberationSerif-Bold.ttf'
];

self.addEventListener('install', event => {
  console.log('Service worker install event!');
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
      cache.addAll(files);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      )
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

//self.addEventListener('fetch', event => {
//  event.respondWith(caches.match(event.request)
//    .then(response => {
//      return response || fetch(event.request);
//    })
//  );
//});
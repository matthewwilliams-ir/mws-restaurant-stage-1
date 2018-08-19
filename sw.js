var staticCacheName = 'restaurant-info';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        //cache all static files
        '/',
        'index.html',
        'restaurant.html',
        'js/dbhelper.js',
        'js/main.js',
        'sw.js',
        'img/',
        'js/restaurant_info.js',
        'css/styles.css'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {

  var requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === './restaurant.html') {
      event.respondWith(caches.match('./restaurant.html'));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );

});

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

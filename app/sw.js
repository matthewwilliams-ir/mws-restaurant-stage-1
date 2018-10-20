import idb from 'idb';

const staticCacheName = 'restaurant-info-v3';
const urlsToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'sw.js',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  '/restaurant.html?id=1',
  '/restaurant.html?id=2',
  '/restaurant.html?id=3',
  '/restaurant.html?id=4',
  '/restaurant.html?id=5',
  '/restaurant.html?id=6',
  '/restaurant.html?id=7',
  '/restaurant.html?id=8',
  '/restaurant.html?id=9',
  '/restaurant.html?id=10',
  'css/styles.css',
  // 'data/restaurants.json',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
];

const dbPromise = idb.open("restaurant-db", 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants');
  }
});

const idbKeyval = {
  get(key) {
    return dbPromise.then(db => {
      return db.transaction('restaurants')
        .objectStore('restaurants').get(key);
    });
  },
  set(key, val) {
    return dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      tx.objectStore('restaurants').put(val, key);
      return tx.complete;
    });
  }
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {

  var requestUrl = new URL(event.request.url);

  if (requestUrl.port === '1337') {
    event.respondWith(idbResponse(event.request));
  } else {
    event.respondWith(cacheResponse(event.request));
  }
});

function cacheResponse(request) {
  return caches.match(request).then(response => {
    return response || fetch(request, {
      mode: 'no-cors'
    });
  }).catch(error => new Response(error));
}

function idbResponse(request) {
  return idbKeyval.get("restaurants").then(restaurants => {
    return (restaurants || fetch(request)
      .then(response => response.json())
      .then(json => {
        idbKeyval.set("restaurants", json);
        return json;
      })
    );
  })
  .then(response => new Response(JSON.stringify(response)))
  .catch(error => {
    return new Response(error, {
      status: 400,
      statusText: 'Error fetching data from IDB.'
    });
  });
}

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  var cacheWhitelist = ['restaurant-info-v3'];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

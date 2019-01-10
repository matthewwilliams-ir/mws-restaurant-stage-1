import idb from 'idb';

const dbPromise = idb.open("restaurant-db", 3, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants',
        { keyPath: 'id', unique: true });
    case 1:
      const reviewStore = upgradeDB.createObjectStore('reviews',
        { autoIncrement: true });
      reviewStore.createIndex('restaurant_id', 'restaurant_id');
    case 2:
    upgradeDB.createObjectStore('offline',
      { autoIncrement: true });
  }
});

const idbKeyVal = {
  get(store, key) {
    return dbPromise.then(db => {
      return db
        .transaction(store)
        .objectStore(store)
        .get(key);
    });
  },
  getAll(store) {
    return dbPromise.then(db => {
      return db
        .transaction(store)
        .objectStore(store)
        .getAll();
    });
  },
  getAllIdx(store, idx, key) {
    return dbPromise.then(db => {
      return db
        .transaction(store)
        .objectStore(store)
        .index(idx)
        .getAll(key);
    });
  },
  set(store, val) {
    return dbPromise.then(db => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(val);
      return tx.complete;
    });
  },
  setReturnId(store, val) {
    return dbPromise.then(db => {
      const tx = db.transaction(store, 'readwrite');
      const pk = tx
        .objectStore(store)
        .put(val);
      tx.complete;
      return pk;
    });
  }
};

self.idbKeyVal = idbKeyVal;

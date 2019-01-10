/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(`${DBHelper.DATABASE_URL}/restaurants`)
      .then(response => {
        if (!response.ok) {
          throw Error(`Request failed. Returned status of ${response.statusText}`);
        }
        const restaurants = response.json();
        return restaurants;
      })
      .then(restaurants => callback(null, restaurants))
      .catch(err => callback(err, null));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  static fetchReviewsById(id, callback) {
    fetch(DBHelper.DATABASE_URL + `/reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then(json => callback(null, json))
      .catch(error => callback(error, null));
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph === undefined) {
      return (`/img/${restaurant.id}.jpg`);
    } else {
      return (`/img/${restaurant.photograph}.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

  /**
   * Mark restaurant as favorite
   */
  static markFavorite(id) {
    fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}/?is_favorite=true`, {
      method: 'PUT'
    })
    .then(response => console.log(response))
    .catch(err => console.log(err));
  }

  /**
   * Unmark restaurant as favorite
   */
  static unMarkFavorite(id) {
    fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}/?is_favorite=false`, {
      method: 'PUT'
    })
    .then(response => console.log(response))
    .catch(err => console.log(err));
  }

  static createRestaurantReview(restaurant_id, name, rating, comments, callback) {
    const data = {
      restaurant_id: restaurant_id,
      name: name,
      rating: +rating,
      comments: comments
    };
    const body = JSON.stringify(data);

    fetch(DBHelper.DATABASE_URL + '/reviews/', {
      headers: { 'Content-Type': 'application/form-data' },
      method: 'POST',
      body: body
    })
    .then(response => response.json())
    .then(data => callback(null, data))
    .catch(err => {
      // Offline create review
      DBHelper.createIDBReview(data)
        .then(reviewKey => {
          console.log('returned reviewKey', reviewKey);
          DBHelper.addRequestToQueue(url, headers, method, data, reviewKey)
            .then(offlineKey => console.log('offlineKey', offlineKey));
        });
      callback(err, null);
    });
  }

  static createIDBReview(review) {
    return idbKeyVal.setReturnId('reviews', review)
      .then(id => {
        console.log('Saved to IDB: reviews', review);
        return id;
      });
  }

  static addRequestToQueue(url, headers, method, data, review_key) {
    const request = {
      url: url,
      headers: headers,
      method: method,
      data: data,
      review_key: review_key
    };
    return idbKeyVal.setReturnId('offline', request)
      .then(id => {
        console.log('Saved to IDB: offline', request);
        return id;
      });
  }

}

window.DBHelper = DBHelper;

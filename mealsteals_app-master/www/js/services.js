angular.module('starter.services', [])

.factory('DealProcessor', ['$q', function($q) {
    return {
        Process: function(deals) {

            return $q.all(deals.map(function(d){
              return $q(function(resolve){
                var img = new Image();
                img.onload = function(){
                  resolve(d);
                };
                img.onerror = function(){
                  d['icon'] = 'img/defaulticon.png';
                  resolve(d); // resolve anyways on error
                };
                img.src = d.icon;
                return;
              });
            }));

        }
    }
}])

/*.factory('Storage', function($rootScope, $cordovaNativeStorage){


        $cordovaNativeStorage.getItem("email").then(function (email) {
               console.log('services email: '+email);
               $rootScope.email = email;
               $rootScope.$emit('emailPulled');
                    }, function (error) {
                        console.log(error);
        });

        $cordovaNativeStorage.getItem("password").then(function (password) {
               console.log('services password: '+password);
               $rootScope.password = password;
               $rootScope.$emit('passwordPulled');
                    }, function (error) {
                        console.log(error);
        });


})*/

.factory('Timestamp', function($interval, $rootScope) {



  // time shift value for simulating other times of the day
  var timeShift = 0;

  //actual timestamp
  var timestamp = new Date().getTime();
  $interval(function(){
      timestamp = (new Date().getTime());
  }, 1000);

  return {
    getTimestamp: function(){
      var newTimeMath = parseInt(timestamp) + parseInt(timeShift);
      return newTimeMath;
    },
    setTimeShift: function(n) {
      timeShift = n;
      //$rootScope.timeAdjustedBy = n;
      return;
    }
  };
})

.factory('DealData', function($rootScope, $q, $http) {

  // This service grabs a single by key, and caches it in device.

  var dealData = {};
  $rootScope.featArrayEmpty = false;


  return {
    fetch: function(key) {
      return $q(function(resolve) {
        if (dealData.hasOwnProperty(key)){
          resolve(dealData[key]);
        } else {
          (new Firebase('https://mealsteals.firebaseio.com/deals/' + key)).once('value', function(snapshot){
              console.log("bottleneck");
            var data = snapshot.val();
            dealData[key] = data;
            resolve(data);
          }, function(error){
            resolve(null);
          });
        }
      });
    },
    remove: function(key) {
      delete dealData[key];
      return true;
    }
  };
})

.factory("PopupAds", function($rootScope, $q, $http) {
  var featDealData = {};
  // $rootScope.featArrayEmpty = false;

  return {
    fetch: function(key) {
      return $q(function(resolve) {
        if (featDealData.hasOwnProperty(key)){
          resolve(featDealData[key]);
        } else {
          (new Firebase('https://mealsteals.firebaseio.com/popupAdDeals/')).once('value', function(snapshot){
            var data = snapshot.val();
            featDealData[key] = data;
            resolve(data);
          }, function(error){
            resolve(null);
          });
        }
      });
    }
  };

    console.log(featDealData);

})

.factory('Location', function($ionicPlatform, $rootScope, $q, $interval, DealData, $ionicPopup) {


  var geoFire = new GeoFire(new Firebase('https://mealsteals.firebaseio.com/dealGeoFireKeys'));

  var geoQuery = null;
  var currentLat = 0; //43.045
  var currentLon = 0; // -87.9
  var radius = 50; // 50 kilometers (31 miles)
  var dealsNearMe = {};
  var lastUpdate = 0;
  var gpsError = false;

  /*  These options are causing gps issues on android, removing for now... - sean
  var gpsOptions = {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 10000
  };*/

  /* Every 180 seconds update GPS coordinates and update GeoQuery object */
  function routine(force, cb){
    // only update if it has for sure been at least 180 seconds. remember this function gets called on
    // app "resume" (from background) so we need to check this
    if (force==false && (new Date().getTime()) - lastUpdate < 180000) return;

    lastUpdate = new Date().getTime();

    // If cb is set, this callback function will be triggered once location is locked in on
    // it will be passed [lat, lon]
    $q(function(resolve){
      if ($rootScope.hasOwnProperty('gps')){
        currentLat = $rootScope.gps.lat;
        currentLon = $rootScope.gps.lon;
        resolve();
      } else {
        navigator.geolocation.getCurrentPosition(function(position) {
          currentLat = position.coords.latitude;
          currentLon = position.coords.longitude;
          (cb && cb([currentLat, currentLon]));
          gpsError = false;
          resolve();
        }, function(error){
          gpsError = true;
          resolve();
          // alert('Error accessing GPS.');
          /*$ionicPopup.alert({
            cssClass: "popup-vertical-buttons",
				    template: 'Please choose a city or allow GPS',
				    title: 'GPS Error',
				    subTitle: '',
				    // scope: $scope,
				    buttons: [
				      {
				        text: '<b>Milwaukee</b>',
				        type: 'button-positive',
				        onTap: function(e) {
				            $rootScope.gps = {'lat': cities['Milwaukee'].loc[0], 'lon': cities['Milwaukee'].loc[1]};
							$scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
							Location.forceRefresh();
				        }
				      },
				      {
				        text: '<b>Boston</b>',
				        type: 'button-positive',
				        onTap: function(e) {
							$rootScope.gps = {'lat': cities['Boston'].loc[0], 'lon': cities['Boston'].loc[1]};
							$scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
							Location.forceRefresh();
				        }
				      },
				      {
				        text: '<b>Allow GPS</b>',
				        type: 'button-positive',
				        onTap: function(e) {
							$scope.showLoading();
							delete $rootScope.gps;
							Location.forceRefresh($scope.centerOnMe);
				        }
				      },

				      { text: 'Cancel' }
				    ]
          });*/
        });
      }
    }).then(function(){
      if (geoQuery !== null){
        geoQuery.updateCriteria({
          center: [currentLat, currentLon],
          radius: radius
        });
      } else {
        $rootScope.$emit('firstGPS');
        console.log('first gps');
        initializeGeoQuery();
      }
    });

    return;
  }

  routine(true); // force to refresh (in this instance, it would refresh even if force==false)
  var updateInterval = $interval(routine, 180000);

  pause = $ionicPlatform.on('pause', function(){
    $interval.cancel(updateInterval);
  });
  resume = $ionicPlatform.on('resume', function(){
    $scope.showLoading();
    currentTime = new Date().getTime();
    if (currentTime - lastUpdate > 900000){
      $rootScope.$emit('app reload');
    }
    routine(false); // only refresh on resume if the last refresh was more than 3 minutes ago
    updateInterval = $interval(routine, 180000);
  });
  /* End update routine */

  function initializeGeoQuery(){
    geoQuery = geoFire.query({
      center: [currentLat, currentLon],
      radius: radius
    });

    geoQuery.on("ready", function() {
      // emit message so the view pulls new set of objects into view
      $rootScope.$emit('dealsNearMeChanged');

    });

    geoQuery.on("key_entered", function(key, location, distance) {
      dealsNearMe[key] = true;
      // this will take effect after the normal 3-minute refresh period.
    });

    geoQuery.on("key_exited", function(key, location, distance) {
      delete dealsNearMe[key];
      // do not immediately trigger a dealsNearMeChanged
      // because the user moving around on their own could trigger multiple key exists
      // in a short period of time and cause refresh-mania. It will be updated within the normal 3-minute period.
    });

    geoQuery.on("key_moved", function(key, location, distance) {
      // this should not happen very often. only with food trucks pretty much.
      DealData.remove(key); // this will remove this deal from the cache, so it will be forced to re-fetch
      $rootScope.$emit('dealsNearMeChanged'); // and now force a refresh in app since we want this change to be immediate
    });
  }

  return {
    getDealsNearMe: function() {
      return Object.keys(dealsNearMe);
    },
    currentLocation: function(refreshGPS){
      if (refreshGPS==true){
        return $q(function(resolve){
          navigator.geolocation.getCurrentPosition(function(position) {

            currentLat = position.coords.latitude;
            $rootScope.currentLat = currentLat;
            currentLon = position.coords.longitude;
            $rootScope.currentLon = currentLon;
            gpsError = false;
            resolve([currentLat, currentLon]);
          }, function(error){
            gpsError = true;
            resolve([currentLat, currentLon]);
            $ionicPopup.alert({
              title: 'GPS Error',
              template: 'Could not get location.'
            });
          });
        });
      } else {
        return [currentLat, currentLon];
      }
    },
    forceRefresh: function(cb){
      routine(true, cb);
      return true;
    },
    hasGPSError: function(){
      return gpsError;
    }
  };
});

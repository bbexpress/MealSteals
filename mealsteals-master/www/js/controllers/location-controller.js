angular.module('starter.controllers')


.controller('LocationCtrl', function(DealProcessor, Auth, Timestamp, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, Location, $ionicLoading, $location, $compile, $q, $ionDrawerVerticalDelegate, $ionicHistory, $state) {
    
    var cities = {
					'Boston': { 
						'loc': [42.36,-71.06],
						'stage': 'soon'
					},
					'Milwaukee': {
						'loc': [43.045,-87.9],
						'stage': 'active'
					},
                    'Chicago': { 
						'loc': [41.88,-87.63],
						'stage': 'active'
					},
                    'Madison': { 
						'loc': [43.07,-89.40],
						'stage': 'active'
					},
                    // Default GPS, used to trigger zip code prompt
					'Error': { 
						'loc': [0,0],
						'stage': 'error'
					}
    };
    
  $scope.activeCities = [];
  $scope.activeCities = ['Chicago', 'Milwaukee'];

  $scope.changedValue = function(city) {
        if (city == 'Milwaukee'){
            $scope.milwaukeeLoc();
        }
        if (city == 'Chicago'){
            $scope.chicagoLoc();
        }
  }       
    
    $scope.myGoBack = function() {
       $state.go('app.deals');
    };
    
    $scope.closeChangeLocation = function () {
        $state.go('app.deals');
    };
    
    /*$scope.realGps = function() {
        $scope.showLoading();
        delete $rootScope.gps;
        Location.forceRefresh($scope.centerOnMe);
        $scope.chooseAd();
    };*/
    
     $scope.realGps = function() {
        window.localStorage.setItem("userLocation", "GPS");
        delete $rootScope.gps;
        $state.go('app.deals');
        $timeout(function() {
            $rootScope.$broadcast('realGPS');
        }, 1000);
    };
    
    $scope.milwaukeeLoc = function() {
        $rootScope.gps = {'lat': cities['Milwaukee'].loc[0], 'lon': cities['Milwaukee'].loc[1]};
       $state.go('app.deals');
        $timeout(function() {
            $rootScope.$broadcast('changeLocation');
        }, 1000);
    };
    
    $scope.madisonLoc = function() {
       $rootScope.gps = {'lat': cities['Madison'].loc[0], 'lon': cities['Madison'].loc[1]};
       $state.go('app.deals');
        $timeout(function() {
            $rootScope.$broadcast('changeLocation');
        }, 1000);
    };
    
    $scope.chicagoLoc = function() {
        $rootScope.gps = {'lat': cities['Chicago'].loc[0], 'lon': cities['Chicago'].loc[1]};
        $state.go('app.deals');
        $timeout(function() {
            $rootScope.$broadcast('changeLocation');
        }, 1000);
    };
    
    $scope.chooseLocation = function() {
        $rootScope.test = "In Directive!";
        console.log('working');
    }
    
    $scope.submitLocation = function(lat,lon) {
        var userLocation = [lat, lon];
        window.localStorage.setItem("userLocation", userLocation);
        $rootScope.gps = {'lat': lat, 'lon': lon};
        $state.go('app.deals');
        $timeout(function() {
            $rootScope.$broadcast('changeLocation');
        }, 1000);
    };
    
    $scope.enableGPS = function() {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);        
    };
    
    $scope.data = {};
    $scope.data.location = {};
    
    $scope.type = "establishment"

    $scope.onAddressSelection = function (location) {
  
        console.log(location);
        
        var geocoder = new google.maps.Geocoder();
        var address = location.formatted_address;

        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat();
                var lon = results[0].geometry.location.lng();
                if (status == "OK"){
                    //var userLocation = [];
                    var userLocation = [lat, lon];
                    $rootScope.gps = {'lat': lat, 'lon': lon};
                    window.localStorage.setItem("userLocation", "custom");
                    window.localStorage.setItem("lat", lat);
                    window.localStorage.setItem("lon", lon);
                    $state.go('app.deals');
                    $timeout(function() {
                        $rootScope.$broadcast('changeLocation');
                    }, 1000);
                } else {
                    alert('Oops, something went wrong.  Please try again. ');
                }
            }
        });
        
    };
    
    $scope.disableTap = function(){
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function(){
        document.getElementById('searchBar').blur();
    });
    };
    
})
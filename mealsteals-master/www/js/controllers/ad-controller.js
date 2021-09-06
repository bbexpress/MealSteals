
angular.module('starter.controllers')
.controller('AdCtrl', function(DealProcessor,$state, Timestamp, $cordovaSocialSharing, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, Location, DealData, $ionicLoading, $location, $ionicActionSheet, $compile, $q, $ionDrawerVerticalDelegate, $cordovaAppRate, PopupAds, $firebase, $ionicHistory, $cordovaLaunchNavigator, $window) {
    
   $scope.myGoBack = function() {
        $state.go('app.deals');
        $rootScope.doMapResize = false;
    };
    
    $rootScope.$on('dealDetailRefresh', function(){
        $state.go('app.deals');
    });
    
    $scope.deal = $rootScope.thisAd;
    
    /*$scope.swipe = function (direction) {
         if(direction == 'down') 
            $state.go('app.deals');
    }*/
    
    // Generic function for changing path with optional delay
	$scope.go = function(path, delay){
        console.log(path, delay);
		if (delay){
			$timeout(function(){
				$location.path(path);
			}, delay);
		} else {
			$location.path(path);
            
		}       
	}; 
    
    
    
    $scope.launchNavigator = function() {
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Navigator", {"Email": $rootScope.userAuthEmail});
        }
        var destination = [$scope.deal.lat, $scope.deal.lon];
        var start = null;
        $cordovaLaunchNavigator.navigate(destination, start).then(function() {
          console.log("Navigator launched");
        }, function (err) {
          console.error(err);
        });
    };
    
    $scope.launchUber = function() {
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Uber", {"Email": $rootScope.userAuthEmail});
        }
        launchnavigator.isAppAvailable(launchnavigator.APP.UBER, function(isAvailable){
            var app;
            if(isAvailable){
                app = launchnavigator.APP.UBER;
            }else{
                $ionicPopup.alert({
                    title: 'You dont have Uber downloaded'
                });
            }
            var destination = [$scope.deal.lat, $scope.deal.lon];
            var start = null;
            launchnavigator.navigate(destination, {
                app: app
            });
        });
    };
    
    /*$timeout(function(){
            initialize();
	     },1000);
    
    function initialize() {
		var pos = Location.currentLocation();
		var loc = new google.maps.LatLng(pos[0],pos[1]);
        console.log(pos);
        console.log(loc);
        
		var bizLoc = new google.maps.LatLng($scope.deal.lat, $scope.deal.lon);

	    var mapOptions = {
	      center: bizLoc,
	      zoom: 15,
	      mapTypeId: google.maps.MapTypeId.ROADMAP,
	      streetViewControl: false,
	      mapTypeControl: false,
	      zoomControl: false,
	      fitBounds: true,
          draggable: true
	    };
            
        var icon = {
            url: $scope.deal.icon,
            scaledSize: new google.maps.Size(40, 40),// scaled size
        };    
            
	    $scope.map = new google.maps.Map(document.getElementById("adDetailMap"),mapOptions);
        
        var infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService($scope.map);

	    var marker1 = new google.maps.Marker({
	      position: loc,
	      map: $scope.map,
          //scaledSize: new google.maps.Size(40, 40), // scaled size
	    });

	    var marker2 = new google.maps.Marker({
	      position: bizLoc,
	      map: $scope.map,
	      icon: icon,
          //scaledSize: new google.maps.Size(40, 40), // scaled size
	    });
        
        var markers = [marker1, marker2];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
         bounds.extend(markers[i].getPosition());
        }

        map.fitBounds(bounds);
    }*/
    function mapLocation() {
        var directionsDisplay;
        var directionsService = new google.maps.DirectionsService();
        var map;

        function initialize() {
            directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
            var bizLoc = new google.maps.LatLng($scope.deal.lat, $scope.deal.lon);
            var mapOptions = {
                zoom: 7,
                center: bizLoc,
                //draggable: false,
                streetViewControl: false,
                mapTypeControl: false,
                zoomControl: false,
            };
            map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            directionsDisplay.setMap(map);
            google.maps.event.addDomListener(document.getElementById('routebtn'), 'click', calcRoute);
        }
        $timeout(function(){
            initialize();
	     },1000);

        function calcRoute() {
            var pos = Location.currentLocation();
		    var loc = new google.maps.LatLng(pos[0],pos[1]);
            var start = loc;
            var end = new google.maps.LatLng($scope.deal.lat, $scope.deal.lon);;
            
            var icon = {
                url: $scope.deal.icon,
                scaledSize: new google.maps.Size(40, 40),// scaled size
            }; 
            
            var startMarker = new google.maps.Marker({
                position: start,
                map: map,
                //draggable: true
            });
            var endMarker = new google.maps.Marker({
                position: end,
                map: map,
                icon: icon,
                zIndex:9999
                //draggable: true
            });
    
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(start);
            bounds.extend(end);
            map.fitBounds(bounds);
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                    directionsDisplay.setMap(map);
                } else {
                    //alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                }
            });
        }
        
        $timeout(function(){
            calcRoute();
	     },2000);

        google.maps.event.addDomListener(window, 'load', initialize);
    }
    mapLocation();
    
})

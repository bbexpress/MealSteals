angular.module('starter.controllers')

.controller('BizDetailCtrl', function(Timestamp, $state, $ionicHistory, Auth, $state, $firebaseAuth, $cordovaSocialSharing, $firebaseObject, $firebaseArray, $scope, $rootScope, $stateParams, Location, $interval, $timeout, $ionicLoading, $ionicPopup, $ionicPopover, $ionicActionSheet, $ionicNavBarDelegate, $http,  $ionicModal, $cordovaLaunchNavigator) {
    
    $scope.biz = $rootScope.busFB[$stateParams.bizId];
    $scope.busRecurringDeals = $firebaseArray(($rootScope.recurringFB).orderByChild('businessID').equalTo($stateParams.bizId));
    console.log($scope.busRecurringDeals.length);
    
    
    $rootScope.$on('dealDetailRefresh', function(){
        $state.go('app.deals');
    });
    
    $scope.showLoading = function() {
    	$ionicLoading.show({
	      template: "<img src='img/rotating.png' class='spinner' style='height:60px;width:auto;opacity: 0.7;'/>",
	      duration: 2000
	    });
	};
    
    $scope.showLoading();
    
    $scope.viewOptions = {'bizPage':'detail'};
    
    /*$scope.busObj = $firebaseObject(($rootScope.mealsteals.child('/businesses/'+$stateParams.bizId)));
      $scope.busObj.$loaded(function(){
        //alert($scope.busObj.placeId);
        var placeId = $scope.busObj.placeId;
        var service = new google.maps.places.PlacesService();
        service.getDetails({
          placeId: placeId
        }, function(place, status) {
            console.log(status);
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              console.log(place);
              $scope.openNow = place.opening_hours.open_now;
          }
        });

    });*/

    console.log($rootScope.busFB[$stateParams.bizId]);
     if(!angular.isUndefined($rootScope.authUserData)){  
        if(!angular.isUndefined($rootScope.currentFavs) &&
            !angular.isUndefined($rootScope.currentFavs.businesses)){
            if(!angular.isUndefined($rootScope.currentFavs.businesses[$stateParams.bizId])){
                $scope.favoriteBus = true;
            }else{
                $scope.favoriteBus = false;
            }
        } else {
            $scope.favoriteBus = false;
        }
     }else{
         $scope.favoriteBus = false;
     }
    
    $scope.promptLogin = function () {
        var myPopup = $ionicPopup.show({
                    title: '<div><i class="ion-person"></i><div><div class="popup-title-generic">Login</div>',
                    subTitle: 'Must be logged in to favorite deals',
                    cssClass: 'generic-popup',
                    //scope: $scope,
                    buttons: [
                      {
                        text: 'Cancel',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                        }
                      },
                      {
                        text: '<b>Login</b>',
                        type: 'button-popup-clear',
                        onTap: function(e) {


                            $state.go('app.account');
                        }
                      }
                    ]
            });  
    };
     
    $scope.followBus = function(){
        
        if($scope.favoriteBus == false){
          if(!angular.isUndefined($rootScope.authUserData)){  

            $rootScope.addFavBus($stateParams.bizId, $rootScope.busFB[$stateParams.bizId]);
            $scope.favoriteBus = true;
            $ionicPopup.alert({
                        title: '<div><i class="ion-heart"></i><div><div class="popup-title-generic">Favorited '+$scope.biz.businessName+'</div>',
                        cssClass: 'generic-popup generic-alert',
                        buttons: [
                      {
                        text: 'OK',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          
                        }
                      }]
                });
          }else{
              $scope.promptLogin();
          }
        }else{
            $rootScope.removeFavBus($stateParams.bizId);
            $scope.favoriteBus = false;
            $ionicPopup.alert({
                        title: '<div><i class="ion-heart-broken"></i><div><div class="popup-title-generic">Unfavorited '+$scope.biz.businessName+'</div>',
                        cssClass: 'generic-popup generic-alert',
                        buttons: [
                      {
                        text: 'OK',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          
                        }
                      }]
                });
        }
        
    };   
    //console.log($rootScope.busFB[$stateParams.bizId]);
    
//    $scope.photos = [
//   {
//      "html_attributions" : [],
//      "height" : 600,
//      "width" : 800,
//      "photo_reference" :  $rootScope.busFB[$stateParams.bizId].placeId
//   }];

    
    $scope.getEvents = function(){
        
        if(!angular.isUndefined($rootScope.busFB[$stateParams.bizId].facebook)){
            var parseURL = $rootScope.busFB[$stateParams.bizId].facebook.replace('https://www.facebook.com/', '');
            parseURL = parseURL.replace('www.facebook.com/','');
            parseURL = parseURL.replace('http://www.facebook.com/','');
            parseURL = parseURL.replace('/','');
            var eventURL = 'https://graph.facebook.com/v2.4/' + parseURL + '/events?access_token=1597614350474803|07a27bad3d6507f2cd6826042e075bcb';
            var Httpreq = new XMLHttpRequest(); // a new request
            Httpreq.open("GET" ,eventURL ,false);
            Httpreq.send(null);
            return Httpreq.responseText;       
        }

    }
    
     $scope.getCover = function(id){
        //var eventURL = 

        var Httpreq = new XMLHttpRequest(); // a new request
        Httpreq.open("GET",'https://graph.facebook.com/' + id + '/photos?access_token=1597614350474803|07a27bad3d6507f2cd6826042e075bcb',false);

        Httpreq.send(null);
        return Httpreq.responseText;          

    }
    
    
    $scope.buildEvents = function(){
       // $scope.openFBEvents();
        if($rootScope.analyticsFlag!=true){
                mixpanel.track("FB Events", {"Email": $rootScope.userAuthEmail});
        }
        
        $scope.eventsObj = [];
        var obj = {};
        obj = JSON.parse($scope.getEvents());
        angular.forEach(obj.data, function(event){
            $scope.cover = JSON.parse($scope.getCover(event.id));
            console.log($scope.cover);
            console.log($scope.eventsObj);
            event['cover'] = $scope.cover.data[0].images[0].source;
            $scope.eventsObj.push(event);
        });
         $ionicLoading.hide();
    }
        
    var eventsPopup;
    
    $scope.openFBEvents = function(){
            $ionicLoading.show({
              template: "<img src='img/rotating.png' class='spinner' style='height:60px;width:auto;opacity: 0.7;'/>",
              duration: 10000
            });
            eventsPopup = $ionicPopup.show({
              cssClass: 'events-popup',
              //okText: 'Close',
              scope: $scope,
              templateUrl: 'templates/fb-events.html',
            })
            $timeout(function(){
            $scope.buildEvents();
	        },1000);
            
     };
    $scope.closeFBEvents = function() {
        eventsPopup.close();
        $ionicLoading.hide();
    };
    
    
      
    $scope.isMonday = function(deal) {
      return deal.daysOfWeek.monday == 'yes'; 
    };
    
    $scope.isTuesday = function(deal) {
      return deal.daysOfWeek.tuesday == 'yes'; 
    };
    
    $scope.isWednesday = function(deal) {
      return deal.daysOfWeek.wednesday == 'yes'; 
    };
    
    $scope.isThursday = function(deal) {
      return deal.daysOfWeek.thursday == 'yes'; 
    };
    
    $scope.isFriday = function(deal) {
      return deal.daysOfWeek.friday == 'yes'; 
    };
    
    $scope.isSaturday = function(deal) {
      return deal.daysOfWeek.saturday == 'yes'; 
    };

    
    $scope.isSunday = function(deal) {
      return deal.daysOfWeek.sunday == 'yes'; 
    };
    
    
    $scope.optionsBiz = {
          loop: true,
        }

        $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
          // data.slider is the instance of Swiper
          $scope.slider = data.slider;
          console.log(event);
          console.log(data);
        });

        $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
          console.log('Slide change is beginning');
          //console.log(event);
          //console.log(data);
        });

        $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
          // note: the indexes are 0-based
          $scope.activeIndex = data.slider.activeIndex;
          $scope.previousIndex = data.slider.previousIndex;
          console.log($scope.activeIndex);
    });
    
    $scope.changeBizSlide = function(number) {
        console.log('change to: '+number);
        data.slider.slideTo(number);
    }

    
    // the back button RARELY doesn't show, so this is the failsafe that will kick the user to deals
    $ionicNavBarDelegate.showBackButton(false);
    
    $scope.myGoBack = function() {
        //$ionicHistory.clearCache();
        //$ionicHistory.clearHistory();
        //$rootScope.doMapResize = true;
        //$state.go('app.deals');
        $ionicHistory.goBack();
        if ($ionicHistory.backView() == null) {
            $state.go('app.deals');
            console.log('app.deals!!!!');
        }
    };
    
    
    /*var map = new google.maps.Map(document.getElementById('bizMap'), {
          center: {lat: -33.866, lng: 151.196},
          zoom: 15
        });*/
  
    
    // map requires 1 second delay to load
    $timeout(function(){
            initialize();
	     },1000);
    
    function initialize() {
		var pos = Location.currentLocation();
		var loc = new google.maps.LatLng(pos[0],pos[1]);
        
		var bizLoc = new google.maps.LatLng($scope.biz.lat, $scope.biz.lon);

	    var mapOptions = {
	      center: bizLoc,
	      zoom: 15,
	      mapTypeId: google.maps.MapTypeId.ROADMAP,
	      streetViewControl: false,
	      mapTypeControl: false,
	      zoomControl: false,
	      fitBounds: true,
          draggable: false
	    };
            
        var icon = {
            url: $scope.biz.icon,
            scaledSize: new google.maps.Size(40, 40),// scaled size
        };    
            
	    $scope.map = new google.maps.Map(document.getElementById("bizDetailMap"),mapOptions);
        
        var infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService($scope.map);

        service.getDetails({
          placeId: $rootScope.busFB[$stateParams.bizId].placeId
        }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {

              $scope.placeDetails = place;
              console.log(place);
              $scope.photos = [];
              angular.forEach(place.photos, function(photo){
                  $scope.photos.push(photo.getUrl({'maxWidth': 800, 'maxHeight': 600}));
              });
          }
        });

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
    }
    
    function mapLocation() {
        var directionsDisplay;
        var directionsService = new google.maps.DirectionsService();
        var map;

        function reinitialize() {
            directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
            var bizLoc = new google.maps.LatLng($scope.biz.lat, $scope.biz.lon);
            var mapOptions = {
                zoom: 7,
                center: bizLoc,
                //draggable: false,
                streetViewControl: false,
                mapTypeControl: false,
                zoomControl: false,
            };
            map = new google.maps.Map(document.getElementById('biz-map-canvas'), mapOptions);
            directionsDisplay.setMap(map);
            google.maps.event.addDomListener(document.getElementById('routebtnbiz'), 'click', calcRoute);
        }
        $timeout(function(){
            reinitialize();
	     },1000);

        function calcRoute() {
            var pos = Location.currentLocation();
		    var loc = new google.maps.LatLng(pos[0],pos[1]);
            var start = loc;
            var end = new google.maps.LatLng($scope.biz.lat, $scope.biz.lon);;
            
            var icon = {
                url: $scope.biz.icon,
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
    
    $scope.launchNavigator = function() {
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Navigator", {"Email": $rootScope.userAuthEmail});
        }
        var destination = [$scope.biz.lat, $scope.biz.lon];
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
            var destination = [$scope.biz.lat, $scope.biz.lon];
            var start = null;
            launchnavigator.navigate(destination, {
                app: app
            });
        });
    };
    
    $scope.thisRec = [];
    
    $scope.busRecurringDeals.$loaded(function(){
       $scope.thisRec = $scope.busRecurringDeals;
        
        
    $scope.daySort = function(a){
            if ( a.daysOfWeek.monday == 'yes' )
                return 0;
            if ( a.daysOfWeek.tuesday == 'yes' )
                return 1;
            if ( a.daysOfWeek.wednesday == 'yes' )
                return 2;
            if ( a.daysOfWeek.thursday == 'yes' )
                return 3;
            if ( a.daysOfWeek.friday == 'yes' )
                return 4;
            if ( a.daysOfWeek.saturday == 'yes' )
                return 5;
            if ( a.daysOfWeek.sunday == 'yes' )
                return 6;
    }
    
    });
    
    console.log($scope.busRecurringDeals);
    
    
    
    /*$ionicModal.fromTemplateUrl('templates/fb-events.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.eventsModal = modal;
    });
    
    $scope.openFBEvents = function() {
        $scope.eventsModal.show();
    };
    
    $scope.closeFBEvents = function() {
        $scope.eventsModal.hide();
        //$rootScope.doMapResize = true;
    };*/
    
});

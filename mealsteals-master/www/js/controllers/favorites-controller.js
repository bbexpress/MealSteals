angular.module('starter.controllers')

.controller('FavoritesCtrl', function(Timestamp, $ionicHistory, Auth, Profile, $firebaseAuth, $cordovaSocialSharing, $firebaseArray, $firebaseObject, $scope, $rootScope, $stateParams, Location, $location, $interval, $timeout, $ionicLoading, $ionicScrollDelegate, $state, $ionicPopup, $ionicModal, $q, $compile, $interval) {
    

    $scope.favoriteBus = false;
    
	var geoFire = new GeoFire($rootScope.mealsteals.child('/dealGeoFireKeys'));
    
        $scope.currentLocation = Location.currentLocation();
    
        $scope.currentLocation = [parseFloat($scope.currentLocation[0]), parseFloat($scope.currentLocation[1])];
        //console.log($scope.userLocation);
    
        
        
    
    	$scope.kmToMile = function(km){
		var miles = km * 0.621371;
		return miles;
	};
    
    
     //tell the system which active state, since there are at least two different controllers running at any given time there currently isn't an accurate way to determine this.  This should be added in the three main views.  It will be attached to a button in AppCtrl as well.  
    $rootScope.activeState = 'profile';
    console.log("Active State: "+$rootScope.activeState);
    
  
    $scope.distAway = function(loc){
        if(!angular.isUndefined($scope.currentLocation)){
        var distance = GeoFire.distance(loc, $scope.currentLocation);
    	return distance;
        }
    };
    
    
	$scope.distanceSort = function(d) {
       
        if(!angular.isUndefined(d.lat) && !angular.isUndefined(d.lon)){
            //var distance = (Math.round($scope.kmToMile(GeoFire.distance([d.lat, d.lon], Location.currentLocation()))*10)/10) + ' mi';
            
            if(!angular.isUndefined($rootScope.authUserData)){
                if(!angular.isUndefined($rootScope.currentFavs.businesses)){
                    if(!angular.isUndefined($rootScope.currentFavs.businesses[d.$id])){
                        $scope.favoriteBus = true;
                    }else{
                        $scope.favoriteBus = false;
                       }
                }
            }
	       return $scope.distAway([parseFloat(d.lat), parseFloat(d.lon)]);
        }
	};
    
    if(!angular.isUndefined($rootScope.authUserData)){
        $rootScope.busArray.$loaded(function(bus){
        $scope.busObj = bus;
        });
    
      var favRef = $rootScope.userFB.child('/favorites/deals/');
      $scope.favorites = $firebaseArray(favRef);
        //console.log($scope.favorites);
      var query = favRef.orderByChild("locName");
 
        
      var folRef = $rootScope.userFB.child('/favorites/businesses/');
      $scope.following = $firebaseArray(folRef);
        //console.log($scope.following);
      var query = folRef.orderByChild("locName");

      var checkInRef = $rootScope.userFB.child('/checkIns/');
      $scope.checkIns = $firebaseArray(checkInRef);
        //console.log($scope.checkIns);
      var query = folRef.orderByChild("locName");
        
    }else{
        $rootScope.busArray.$loaded(function(bus){
            $scope.busObj = bus;
            $scope.favorites = bus;
            $scope.following = bus;
            $scope.checkins = bus;
        });
    }
  
  // sets default tab    
  $scope.viewOptions = {'favoriteTab':'gallery'};
    
  $scope.Math = Math;
    
  $scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop();
  };
  
  $scope.deleteFavoriteDeal = function(id, deal){
    var myPopup = $ionicPopup.show({
        title: 'Remove '+deal.name,
        scope: $scope,
        buttons: [
          {
            text: '<b>Cancel</b>',
            onTap: function(e) { 
            console.log(id, deal);
              
            }
          },
          {
            text: '<b>Yes</b>',
            type: 'button-positive',
            onTap: function(e) {

                $rootScope.removeFavDeal(id);
            }
          }
        ]
        });  
    };
  $scope.deleteFollowedBusiness = function(id, bus){
console.log(bus);
    var myPopup = $ionicPopup.show({
        
        title: 'Remove '+bus.businessName,
        scope: $scope,
        buttons: [
          {
            text: '<b>Cancel</b>',
            onTap: function(e) { 
              
            }
          },
          {
            text: '<b>Yes</b>',
            type: 'button-positive',
            onTap: function(e) {

                $rootScope.removeFavBus(id);
                
            }
          }
        ]
        });  
    };
    
    
  $scope.galleryInfo = function(id, d){
    var myPopup = $ionicPopup.show({
        //title: d.locName,
        templateUrl: 'templates/highlight-gallery.html',
        scope: $scope,
        cssClass: 'gallery-popup',
        buttons: [
          {
            text: '<b>Close</b>',
            onTap: function(e) { 
            console.log(id, d);
              
            }
          },
          {
            text: '<b>Delete</b>',
            type: 'button-positive',
            onTap: function(e) {
                $rootScope.removeFavDeal(id);
            }
          }
        ]
        });   
  };
    
  $scope.quickHighlight = function(d) {
      $scope.galleryObject = d;
  };
    
  $ionicModal.fromTemplateUrl('templates/explore.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalExplore = modal;
  });
    
  $ionicModal.fromTemplateUrl('templates/business-deals.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalExploreDeals = modal;
  });
    
  $scope.explore = function(){
    if ($rootScope.analyticsFlag==false){
          mixpanel.track("explore");
    }
    console.log($rootScope.gps);
    $scope.modalExplore.show();
    $rootScope.doMapResize = true;
    
  };
    
  $scope.exploreDeals = function(){
      if ($rootScope.analyticsFlag==false){
          mixpanel.track("explore deals");
          }
      $scope.modalExploreDeals.show();
  };
    
  $scope.closeExplore = function(){
    $scope.modalExplore.hide();  
  };
    
  $scope.closeExploreDeals = function(){
    $scope.modalExploreDeals.hide();  
    $rootScope.doMapResize=true;
  };    
    
  $scope.exploreBusiness = function($id, business){
    var myPopup = $ionicPopup.show({
        title: business.businessName,
        scope: $scope,
        cssClass: 'explore-popup',
        buttons: [
          {
            text: 'Follow',
            onTap: function(e) { 
              if(angular.isUndefined($rootScope.authUserdata)){  
                console.log(business.$id);
                console.log(business);
                $rootScope.addFavBus(business.$id, $rootScope.busFB[business.$id]);
              }else{
                  alert('must be logged in to follow a business');
              }
                
              
            }
          },
          {
            text: 'Deals',
            onTap: function(e) {
                console.log(business.$id);
                $scope.exploreDeals();
                $scope.busRecurringDeals = $firebaseArray(($rootScope.recurringFB).orderByChild('businessID').equalTo(business.$id));
                console.log($scope.busRecurringDeals);
                myPopup.close();
            }
          },
          {
            text: 'Close',
            type: 'button-positive',
            onTap: function(e) {

                console.log("close");
            }
          }
        ]
        });   
  };
    
    $scope.test = function(){
      console.log($scope.busRecurringDeals);  
    };
    
    $scope.goToDeals = function(){
        console.log('closing explore');
        
        $scope.modalExploreDeals.hide();
        $state.go('app.deals');
    }
    
    
   $scope.userLocation = function(userAddress, userLat, userLon, userCity){
        console.log(userAddress, userLat, userLon, userCity);  
        $scope.busObj = $rootScope.busArray;
//        return function(d){
//            if (d.city==userCity) return true;
//        }
        console.log($scope.busObj);
    };
    
    $scope.disableExploreTap = function(){
        container = document.getElementsByClassName('pac-container');
        // disable ionic data tab
        angular.element(container).attr('data-tap-disabled', 'true');
        // leave input field if google-address-entry is selected
        angular.element(container).on("click", function(){
            document.getElementById('explore-location').blur();
        });
    };

    $scope.checkFavDeals = function(deal){
        
        if(!angular.isUndefined($rootScope.recurringObj[deal.$id])){
            
          $rootScope.addFavDeal(deal.$id, $rootScope.recurringObj[deal.$id]);
        }else{
            $rootScope.removeFavDeal(deal.$id);
        }
    };
    
    $scope.checkFavBus = function(bus){
        if(!angular.isUndefined(authUserData)){
            if(!angular.isUndefined($rootScope.busFB[bus.$id])){
              $rootScope.addFavBus(bus.$id, $rootScope.busFB[bus.$id]);
              $scope.favoriteBus = true;
            }else{
                $rootScope.removeFavBus(bus.$id);
                $scope.favoriteBus = false;
            }
        }
    };

        
    
});

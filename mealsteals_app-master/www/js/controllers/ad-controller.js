
angular.module('starter.controllers')
.controller('AdCtrl', function(DealProcessor,$state, Timestamp, $cordovaSocialSharing, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, Location, DealData, $ionicLoading, $location, $ionicActionSheet, $compile, $q, $ionDrawerVerticalDelegate, $cordovaAppRate, PopupAds, $firebase, $ionicHistory) {
    
    /*
    $rootScope.$on('selectPopupAd', function(){
		console.log('popup ad controller');
	});
    
    
    var ref = PopupAds.fetch();
    var featDealsArry = [];
    var randDealIndex = 0;
    var date = new Date();
    var time = date.getTime();
    console.log(time);
    
    var weekday = new Array(7);
      weekday[0]=  "sunday";
      weekday[1] = "monday";
      weekday[2] = "tuesday";
      weekday[3] = "wednesday";
      weekday[4] = "thursday";
      weekday[5] = "friday";
      weekday[6] = "saturday";
    var todayDay = weekday[date.getDay()];
    ref.then(function(snapshot) {
      Object.keys(snapshot).forEach(function (childSnapshot) {
        var childData = snapshot[childSnapshot];
        var currentLocation = Location.currentLocation();
        var distanceAway = GeoFire.distance([childData.lat, childData.lon], currentLocation);
   // && distanceAway < 30
        if(distanceAway < 30 && time > childData.startTime){
            if (childData.daysOfWeek[todayDay] == "yes" ) {
              featDealsArry.push(childData);
            }
        }
      });
      console.log(featDealsArry);
      if (featDealsArry.length == 0) {
        $rootScope.featArrayEmpty = true;
      }

      randDealIndex = Math.floor(Math.random() * featDealsArry.length);
        $scope.thisAd = featDealsArry[randDealIndex];
        $timeout(function(){
				          		$(".popup-ad").addClass("show-ad");
			          	},0); // removes the CSS that hides the popup once the popup is readys
        
        mixpanel.track("Ad Served", {"Ad": $scope.thisAd.locName+': '+$scope.thisAd.name})
          mixpanel.track("Ad Business", {"Business": $scope.thisAd.locName})
   }); 
    
    $scope.timestamp = Timestamp.getTimestamp();
	var cancelInterval = $interval(function(){
	  	$scope.timestamp = Timestamp.getTimestamp();
	}, 1000);
    console.log($scope.timestamp);
    
//    $scope.myGoBack = function() {
//    $ionicHistory.goBack();
//    };
    
    
  */
    
})

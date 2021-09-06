angular.module('starter.controllers')


.controller('WalkthroughCtrl', function(DealProcessor, Auth, Timestamp, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, $ionicLoading, $compile, $q, $ionDrawerVerticalDelegate, $ionicHistory, $state) {
    
    var userLocation = window.localStorage.getItem("userLocation");
    var seenWalkthrough = window.localStorage.getItem("seenWalkthrough");
    var lat = window.localStorage.getItem("lat");
    var lon = window.localStorage.getItem("lon");
    console.log('User Location: ', userLocation);
        
    
    
    $scope.options = {
      loop: false,
      //effect: 'fade',
      //speed: 500,
    }

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
    });

    $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
      console.log('Slide change is beginning');
    });

    $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
      // note: the indexes are 0-based
      $scope.activeIndex = data.slider.activeIndex;
      $scope.previousIndex = data.slider.previousIndex;
        if ($scope.activeIndex==7){
            $scope.allowGotIt = true;
        }
        console.log($scope.activeIndex);
    });
    
    $scope.gotIt = function() {
        if ($scope.allowGotIt == true){
            window.localStorage.setItem("seenWalkthrough", true);
            if (userLocation == "GPS"){
                $state.go('app.deals');
                } else if (lat && lon && userLocation == "custom"){
                    $rootScope.gps = {};
                    $rootScope.gps.lat = Number(lat);
                    $rootScope.gps.lon = Number(lon);
                    console.log(lat, lon);
                    console.log($rootScope.gps.lat, $rootScope.gps.lon);
                    $state.go('app.deals');
                } else {
                    $state.go('app.location');
                }
            } else {
                //alert('finish slide show');
            }
    };
    
})
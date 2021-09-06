(function(angular) {
  "use strict"; 
    var app = angular.module('myApp.admap', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services']);

app.controller('AdMapCtrl', function ($scope, $rootScope, $uibModalInstance, $timeout, adDetails, lat, lon, radius, $firebaseObject, $firebaseArray, fbutil) {

    console.log(lat+', '+lon);
    console.log(radius);
    
    $scope.adDetails = adDetails;
    
    $scope.adPreview = 'map';
    
    $scope.previewAd = function() {
        $scope.adPreview = 'ad';
    }
    
    $scope.showMap = function(){
        $scope.adPreview = 'map';
        $timeout(function(){
            $scope.initializeMap();
        }, 1000)
    }
    
    $scope.closeAdMap = function () {
        $uibModalInstance.dismiss();
    };
    
    if (radius == undefined) {
        radius = 30;
    };

    var map;
    var latlng = new google.maps.LatLng(lat, lon);
    $scope.initializeMap = function(){
        if (radius > 30){
            var dynamicZoom = 9;   
        } else {
            var dynamicZoom = 11;  
        }
        
        var mapOptions = {
            center: latlng,
            zoom: dynamicZoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var el=document.getElementById("ad-map");
        map = new google.maps.Map(el, mapOptions);

        var marker = new google.maps.Marker({
            map: map,
            position: latlng
        });
        
        // Add circle overlay and bind to marker
        var circle = new google.maps.Circle({
          map: map,
          radius: radius * 1000,    // measured in meters
          fillColor: '#9db3f3'
        });
        circle.bindTo('center', marker, 'position');
    };
    
    $timeout(function(){
        $scope.initializeMap();
    }, 1000)
    //initialize();
});
    
})(angular);
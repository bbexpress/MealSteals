(function(angular) {
  "use strict"; 
    var app = angular.module('myApp.heatmap', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services']);

app.controller('HeatMapCtrl', function ($scope, $rootScope, $uibModalInstance, $timeout, bizID, bizObj, $firebaseObject, $firebaseArray, fbutil, FBURL, $q) {

    console.log(bizID);
    console.log(bizObj);
    
    $scope.closeHeatMap = function () {
        $uibModalInstance.dismiss();
    };
    
    $scope.last30Days = function() {
        var today = new Date()
        var past30 = new Date().setDate(today.getDate()-30)
        $scope.heatMap.startDate = past30;
        $scope.heatMap.endDate = today;
        $scope.heatMapDateRange = 'Last 30 Days';
    };
        
    $scope.last7Days = function() {
        var today = new Date()
        var past7 = new Date().setDate(today.getDate()-7)
        $scope.heatMap.startDate = past7;
        $scope.heatMap.endDate = today;
        $scope.heatMapDateRange = 'Last 7 Days';
    };
        
    $scope.lastDay = function() {
        var today = new Date()
        var yesterday = new Date().setDate(today.getDate()-1)
        $scope.heatMap.startDate = yesterday;
        $scope.heatMap.endDate = today;
        $scope.heatMapDateRange = 'Last Day';
    };
        
    $scope.customDate = function() {
        var customStart = moment($scope.heatMap.startDate).format("ll");
        var customEnd = moment($scope.heatMap.endDate).format("ll");
        $scope.heatMapDateRange = customStart+' - '+customEnd;
    };
        
    $scope.heatMap = {
        startDate: '',
        endDate: '',
        length: 0
    };
        
    $scope.last30Days();
        
    $scope.toggleCustomDateSelector = function(){
        if ($scope.showCustomDateSelector!=true){
            $scope.showCustomDateSelector = true;
        } else {
            $scope.showCustomDateSelector = false;
        }
    };

    $scope.initializeHeatMap = function(){
        var defaultLat = bizObj.lat;
        var defaultLon = bizObj.lon;
       // var icon = bizObj.icon;
        var icon = {
                url: bizObj.icon,
                scaledSize: new google.maps.Size(40, 40),// scaled size
        };
        
        $timeout(function() {
              
            $scope.cityCount = 0;
            var locations = [];
            $scope.heatMap.length = 0;
            //console.log($scope.heatMap.startDate);
            //console.log($scope.heatMap.endDate)
            var start = new Date($scope.heatMap.startDate);
            var day = moment($scope.heatMap.startDate).format("YYYYMMDD");
            var end = moment($scope.heatMap.endDate).format("YYYYMMDD");

            console.log(start);
            console.log(day);
            console.log(end);

            var map = new google.maps.Map(document.getElementById('heat-map'), {
                 zoom: 12,
                 center: new google.maps.LatLng(defaultLat, defaultLon),
                 mapTypeId: google.maps.MapTypeId.ROADMAP,
                 disableDefaultUI: true, // a way to quickly hide all controls
                 mapTypeControl: false,
                 scaleControl: true,
                 zoomControl: true,
                 zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE 
                 }
            });
            var infowindow = new google.maps.InfoWindow;

            $scope.userLocObj = $firebaseObject(fbutil.ref('adminAnalytics/appLoads'));
            $scope.userLocObj.$loaded(function(){
                do{
                    angular.forEach($scope.userLocObj[day], function(loc){
                        console.log(loc);
                        var marker;

                        var distanceAway = GeoFire.distance([loc.lat, loc.lon], [defaultLat, defaultLon]);
                        
                        if(distanceAway < 50){
                            marker = new google.maps.Marker({
                                 position: new google.maps.LatLng(loc.lat, loc.lon),
                                 map: map,
                                 icon: 'home/transparenticon.png',
                                 zIndex:9,
                            });
                            
                            marker = new google.maps.Marker({
                                map: map,
                                animation: google.maps.Animation.DROP,
                                position: {lat: defaultLat, lng: defaultLon},
                                icon: icon,
                                zIndex:99,
                              });

                            if(!angular.isUndefined(loc.id)){
                                loc['id'] = 'unknown';
                            }else{
                                console.log(loc.id);
                                loc.id = String(loc.id);
                            }

                            /*google.maps.event.addListener(marker, 'click', (function(marker) {
                                 return function() {
                                     infowindow.setContent(loc.id);
                                     infowindow.open(map, marker);
                                 }
                            })(marker));*/
    //                        locations.push(new google.maps.LatLng(loc.lat, loc.lon));

                            $scope.cityCount += 1;
                        }


                    });
                    $scope.heatMap.length += parseInt(Object.keys($scope.userLocObj[day]).length);
                    var tomorrow = new Date(start);
                    tomorrow.setDate(start.getDate()+1);
                    day  = moment(tomorrow).format("YYYYMMDD");
                    start = tomorrow;
                    console.log(start);
                }
                while (day <= end){
    //
    //               var heatmap = new google.maps.visualization.HeatmapLayer({
    //                  data: locations,
    //                  map: map
    //                });
                };
            });
        }, 1000);
    };
    
  $scope.initializeHeatMap();
        
    $scope.initializeCustomHeatMap = function(){
        var defaultLat = $scope.customHeatLat;
        var defaultLon = $scope.customHeatLon;
       // var icon = bizObj.icon;
        var icon = {
                url: bizObj.icon,
                scaledSize: new google.maps.Size(40, 40),// scaled size
        };
        
        $timeout(function() {
              
            $scope.cityCount = 0;
            var locations = [];
            $scope.heatMap.length = 0;
            //console.log($scope.heatMap.startDate);
            //console.log($scope.heatMap.endDate)
            var start = new Date($scope.heatMap.startDate);
            var day = moment($scope.heatMap.startDate).format("YYYYMMDD");
            var end = moment($scope.heatMap.endDate).format("YYYYMMDD");

            console.log(start);
            console.log(day);
            console.log(end);

            var map = new google.maps.Map(document.getElementById('heat-map'), {
                 zoom: 12,
                 center: new google.maps.LatLng(defaultLat, defaultLon),
                 mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            var infowindow = new google.maps.InfoWindow;

            $scope.userLocObj = $firebaseObject(fbutil.ref('adminAnalytics/appLoads'));
            $scope.userLocObj.$loaded(function(){
                do{
                    angular.forEach($scope.userLocObj[day], function(loc){
                        console.log(loc);
                        var marker;

                        var distanceAway = GeoFire.distance([loc.lat, loc.lon], [defaultLat, defaultLon]);
                        
                        if(distanceAway < 50){
                            marker = new google.maps.Marker({
                                 position: new google.maps.LatLng(loc.lat, loc.lon),
                                 map: map,
                                 icon: 'home/transparenticon.png',
                                 zIndex:9,
                            });
                            
                            marker = new google.maps.Marker({
                                map: map,
                                animation: google.maps.Animation.DROP,
                                position: {lat: defaultLat, lng: defaultLon},
                                icon: icon,
                                zIndex:99,
                              });

                            if(!angular.isUndefined(loc.id)){
                                loc['id'] = 'unknown';
                            }else{
                                console.log(loc.id);
                                loc.id = String(loc.id);
                            }

                            /*google.maps.event.addListener(marker, 'click', (function(marker) {
                                 return function() {
                                     infowindow.setContent(loc.id);
                                     infowindow.open(map, marker);
                                 }
                            })(marker));*/
    //                        locations.push(new google.maps.LatLng(loc.lat, loc.lon));

                            $scope.cityCount += 1;
                        }


                    });
                    $scope.heatMap.length += parseInt(Object.keys($scope.userLocObj[day]).length);
                    var tomorrow = new Date(start);
                    tomorrow.setDate(start.getDate()+1);
                    day  = moment(tomorrow).format("YYYYMMDD");
                    start = tomorrow;
                    console.log(start);
                }
                while (day <= end){
    //
    //               var heatmap = new google.maps.visualization.HeatmapLayer({
    //                  data: locations,
    //                  map: map
    //                });
                };
            });
        }, 1000);
    };


});
    
})(angular);
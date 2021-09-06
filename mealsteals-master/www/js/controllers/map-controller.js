angular.module('starter.controllers')

.controller('MapCtrl', function(
  $rootScope, $scope, $state, $stateParams, Location,
  $ionicModal, $ionicHistory, $ionicPopup, $ionicPlatform) {

  //controller map variable
  var map = null;
  var currentPos = null;

  var init = function() {
        //initialize the map
        currentPos = Location.currentLocation();
        map = plugin.google.maps.Map.getMap(document.getElementById("native-map"), {
                        'backgroundColor': '#F9F2E7',
                        'mapType': plugin.google.maps.MapTypeId.ROADMAP,
                        'controls': {
                            'compass': false,
                            'myLocationButton': false,
                            'indoorPicker': true,
                            'zoom': true,
                        },
                        'gestures': {
                            'scroll': true,
                            'tilt': false,
                            'rotate': true,
                            'zoom': true,
                        },
                        'camera': {
                            'latLng': new plugin.google.maps.LatLng(currentPos[0], currentPos[1], 11.87),
                            'zoom': 12,
                        }
                    });
        // You have to wait the MAP_READY event.
        map.on(plugin.google.maps.event.MAP_READY, onMapInit);

        //Use map.setClickable(false) when a popup is displayed.
  }

  init(); //call init on controller load

  /** Called when google map in initialized */
  function onMapInit(){
      //add our location marker
      map.addMarker({
        'position': new plugin.google.maps.LatLng(currentPos[0], currentPos[1])
      }, function(marker) {
        //marker.showInfoWindow();
      });
  }

})

angular.module('starter.controllers', [])


.controller('DealsCtrl', function(DealProcessor, Auth, Timestamp, $cordovaSocialSharing, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, Location, DealData, $ionicLoading, $location, $ionicPopover, $ionicActionSheet, $ionicModal, $compile, $q, $ionDrawerVerticalDelegate, $cordovaAppRate, PopupAds, $ionicHistory, $state, $ionicScrollDelegate, $cordovaNativeStorage, $cordovaNetwork, $cordovaNativeAudio, $stateParams, $window, $ionicBackdrop, $ionicBody) {
    
    // grabs deep link from storage and deletes the storage for next time
    var deepLinkUrl = window.localStorage.getItem("deepLink");
    if (deepLinkUrl != null){
        $rootScope.deepLinkUrl = deepLinkUrl.replace('mealsteals://','');
    }
    localStorage.removeItem("deepLink");
    
    $rootScope.$on('deepLinkResume', function(){
        if($rootScope.deepLinkUrl!=null && $rootScope.deepLinkUrl!='served'){
                $timeout(function(){
				    $location.path($rootScope.deepLinkUrl);
                    $rootScope.deepLinkUrl='served';
                }, 0);
        }
    });
    
    
    var today = new Date();
    
    //if(typeof analytics !== undefined) { analytics.trackView("App Load"); }
    
    // Use these to show/hide the loading spinner
	$scope.showLoading = function() {
    	$ionicLoading.show({
	      template: "<img src='img/rotating.png' class='spinner' style='height:60px;width:auto;opacity: 0.7;'/>",
	      duration: 10000
	    });
	};
    
    $scope.showSmartLoading = function() {
        $ionicLoading.show({
               templateUrl: 'templates/smart-load.html',
               scope: $scope, 
              //template: "<img src='img/rotating.png' class='spinner' style='height:60px;width:auto;opacity: 0.7;'/><span>"+$scope.loadingText+"</span>",
               duration: 15000
        });
    };
    
    $scope.hideSmartLoading = function(){
        console.log('checking hide smart load');
        if ($scope.tilesLoaded == true && $scope.dealsProcessed != true){
            console.log('taking too much time');
            $timeout(function(){
                $scope.loadingText = "Taking longer than expected";
            },3000);
           
        } 
        if ($scope.tilesLoaded == true && $scope.dealsProcessed == true){
           console.log('HIDE LOADING!!!!!')
           $scope.loadingText = "Cheers!";
            $timeout(function(){
                        $ionicLoading.hide();
            },1500);
        }       
    };
    
    // Notifies users if they are using an outdated version
    var currentVersion = "3";
    var firebaseAppVersion = new Firebase('https://mealsteals.firebaseio.com/adminAnalytics/currentVersion');
    var firebaseAppVersionObj = $firebaseObject(firebaseAppVersion);
    firebaseAppVersionObj.$loaded( function(){
        if (currentVersion < firebaseAppVersionObj.$value){
            $ionicPopup.alert({
             title: 'Update Required',
             template: '<center>You are using an outdated version of MealSteals, to get the best possible experience please go to you app store and update the app</center>'
            });
        }
    });
    
    
    $scope.showSmartLoading();
    
    // used for analytics, outputs either email, fb email or no email
    console.log('user email is: '+$rootScope.userAuthEmail);
    
        
        
    
//    $rootScope.recurringObj.$loaded( function(){
//        $rootScope.recurringObj.forEach(function(thisRec, key){
//            
//
//              if(!angular.isUndefined(thisRec.ratings)){
//
//
//                  $scope.score = 0;
//
//
//                     for (var rate in thisRec.ratings) { 
//
//                         $scope.score += thisRec.ratings[rate].rating;
//                      }
//
//                      $scope.dealRating = $scope.score / Object.keys(thisRec.ratings).length;
//                      $scope.totalRatings = Object.keys(thisRec.ratings).length;
//                      var showRate = $scope.dealRating;
//                      $scope.showRate = showRate;
//                  
//                      
//                  console.log(thisRec);
//                  console.log($scope.dealRating);
//                  console.log(Object.keys(thisRec.ratings).length);
//                  
//                  $rootScope.mealsteals.child('/recurringDeals/' + key + '/totalRating/').set($scope.dealRating);
//                  
//                    var today = new Date();
//                    var todayDate = moment(today.getTime()).format('YYYYMMDD');
//                  if(!angular.isUndefined(thisRec.deals) && !angular.isUndefined(thisRec.deals[todayDate])){
//                      
//                      var thisDeal = $rootScope.todayObj[thisRec.deals[todayDate]];
//                      
//                      
//                      var start = new Date(thisDeal.startTime);
//                      var startDate = moment(start.getTime()).format('YYYYMMDD');
//                      var end = new Date(thisDeal.endTime);
//                      var endDate = moment(end.getTime()).format('YYYYMMDD');
//                      
//                    $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + thisDeal.key + '/totalRating/').set($scope.dealRating);
//                    $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + thisDeal.key + '/totalRating/').set($scope.dealRating);
//                      
//                  }
//                    
//
//              }else{
//
//                  $scope.score = 0;
//                  $scope.dealRating = 0;
//                  var showRate = $scope.dealRating;
//                  $scope.showRate = showRate;
//
//              }
//
//          
//        });
//    });
    
    
    function checkConnection() {
        if(!angular.isUndefined(navigator.connection)){
                    
        $scope.networkState = navigator.connection.type;
        
        $scope.states = {};
        $scope.states[Connection.UNKNOWN]  = 'Unknown connection';
        $scope.states[Connection.ETHERNET] = 'Ethernet connection';
        $scope.states[Connection.WIFI]     = 'WiFi connection';
        $scope.states[Connection.CELL_2G]  = 'Cell 2G connection';
        $scope.states[Connection.CELL_3G]  = 'Cell 3G connection';
        $scope.states[Connection.CELL_4G]  = 'Cell 4G connection';
        $scope.states[Connection.CELL]     = 'Cell generic connection';
        $scope.states[Connection.NONE]     = 'No network connection';

       //  alert('Connection type: ' + $scope.states[networkState]);
       
        }
    } 

    checkConnection();
        
    //var eventsRef = new Firebase("https://mealsteals.firebaseio.com/events");
    
    $rootScope.$on('gpsError', function(){
        $state.go('app.location'); 
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("GPS Error", {"Email": $rootScope.userAuthEmail});
        };
        $ionicPopup.alert({
             title: 'Dang.',
             template: '<center>We couldnt quite find your location, please enter your location or make sure your GPS settings are turned on</center>'
        });
        $ionicLoading.hide();
    })
    
//    $timeout(function(){
//        var userLocation = window.localStorage.getItem("userLocation");
//        var userLat = window.localStorage.getItem("lat");
//        var userLon = window.localStorage.getItem("lon");
//        console.log(userLat, userLon);
//            if (userLat && userLon && userLocation != "GPS"){
//                 //console.log('sldkfjsdl;fj;lsdfj');
//                  $rootScope.gps = {};
//                  $rootScope.gps.lat = userLat;
//                  $rootScope.gps.lon = userLon;
//                  $rootScope.$emit('changeLocation');
//        }
//    },1000);
    
    $timeout(function(){
        var userLocation = window.localStorage.getItem("userLocation");
        var userLat = window.localStorage.getItem("lat");
        var userLon = window.localStorage.getItem("lon");
        console.log(userLat, userLon);
            if (userLat && userLon && userLocation != "GPS"){
                  $rootScope.$emit('changeLocation');
        }
    },1000);
        
    
    $rootScope.$on('changeLocation', function(){
        console.log('CUSTOM LOCATION');
        $scope.loadingText = "Loading Deals...";
        $scope.showSmartLoading();
        $scope.viewOptions = {'displayType':'map'};
        $timeout(function(){
            $scope.grabTodaysDeals();
            initialize();
            $scope.currentLocation = [$rootScope.gps.lat, $rootScope.gps.lon];
            $scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
            Location.forceRefresh();  
            $scope.clearAndAddMarkers();
            //console.log('CHANGE LOCATION');
            $scope.chooseAd();

            var geocoder;
                geocoder = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng($rootScope.gps.lat, $rootScope.gps.lon);

                geocoder.geocode(
                    {'latLng': latlng}, 
                    function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    var add= results[0].formatted_address ;
                                    var  value=add.split(",");

                                    console.log(value);
                                    count=value.length;
                                    country=value[count-1];
                                    state=value[count-2];
                                    city=value[count-3];
                                    //alert('You are currently in', city);
                                    $rootScope.userCity = city;
                                    $rootScope.userState = state;
                                    mixpanel.people.set({
                                        "fakeGPS": city,
                                    });
                                    if($rootScope.analyticsFlag!=true){
                                        mixpanel.track("Change Location", {"Fake City":city+', '+state, "Email": $rootScope.userAuthEmail});
                                        //window.FirebasePlugin.logEvent("app_load", {content_type: "Change_location", item_id: city});
                                    }
                                }
                                else  {
                                    //alert("address not found");
                                }
                        }
                         else {
                            //alert("Geocoder failed due to: " + status);
                        }
                    }
                );
                // check for city and partition subscription/user properties
                var distanceAwayMilwaukee = GeoFire.distance([43.0389, -87.9065], $scope.currentLocation);
                var distanceAwayChicago = GeoFire.distance([41.8781, -87.6298], $scope.currentLocation);
                if(distanceAwayMilwaukee < 50){
                    if($rootScope.analyticsFlag!=true){
                        mixpanel.track("App Load", {"Real City": "Milwaukee", "Email": $rootScope.userAuthEmail});
                        window.FirebasePlugin.logEvent("select_content", {content_type: "app_load", item_id: "Milwaukee - custom"});
                    }
                    console.log('You are in Milwaukee');
                    //alert('milwaukee');
                    window.FirebasePlugin.setUserProperty("City", "Milwaukee");
                    window.FirebasePlugin.subscribe('Milwaukee',
                        function(success){
                          //Success is being ran here with "OK" response
                          //Update user to latest city
                        },
                        function(error){
                          // Not seeing any errors here
                        }
                    );
                    window.FirebasePlugin.unsubscribe('Chicago');

                } else if(distanceAwayChicago < 50){
                    if($rootScope.analyticsFlag!=true){
                        mixpanel.track("App Load", {"Real City": "Chicago", "Email": $rootScope.userAuthEmail});
                        window.FirebasePlugin.logEvent("select_content", {content_type: "app_load", item_id: "Chicago - custom"});
                    }
                    console.log('You are in Chicago');
                    //alert('chicago');
                    window.FirebasePlugin.setUserProperty("City", "Chicago");
                    window.FirebasePlugin.subscribe('Chicago',
                        function(success){
                          //Success is being ran here with "OK" response
                          //Update user to latest city
                        },
                        function(error){
                          // Not seeing any errors here
                        }
                    );
                    window.FirebasePlugin.unsubscribe('Milwaukee');

                } else {
                    //alert('other')
                    if($rootScope.analyticsFlag!=true){
                        mixpanel.track("App Load", {"Real City": "Chicago", "Email": $rootScope.userAuthEmail});
                        window.FirebasePlugin.logEvent("select_content", {content_type: "app_load", item_id: "Other - custom"});
                    }
                    window.FirebasePlugin.setUserProperty("City", "Other");
                }
            
        }, 1000);
    })
    
    // firstGPS is now ran every 3 minutes, need first load to only run an initial set of functions right when GPS is locked.  The map breaks if initialized outside of the DOM.  And ads shouldn't be served every 3 minutes. 
    $rootScope.firstLoad = true;
          //  App loads stored
    $rootScope.$on('firstGPS', function(){
            
            var currentLoc = Location.currentLocation();
            $scope.currentLocation = currentLoc;
            $scope.grabTodaysDeals();
            console.log('first load: ',$rootScope.firstLoad);
            if ($rootScope.firstLoad == true) {
                $scope.showSmartLoading();
                console.log('GPS FIRST LOAD');
                //$scope.chooseAd();
                initialize();
                $timeout(function(){
				    $scope.mapLoaded = true;
                }, 3000);
                $rootScope.firstLoad = false;
                $scope.checkCity();
                $scope.subscribeByCity();
            } else {
                //$scope.showLoading();
                initialize();
            }           
    });
    
    $rootScope.$on('realGPS', function(){
            $scope.loadingText = "Loading Deals...";
            $scope.showSmartLoading();
            var currentLoc = Location.currentLocation();
            $scope.currentLocation = currentLoc;
            Location.forceRefresh($scope.centerOnMe);
            //$scope.grabTodaysDeals();
            console.log('first load: ',$rootScope.firstLoad);
            if ($rootScope.firstLoad == true) {
                console.log('GPS FIRST LOAD');
                $scope.chooseAd();
                initialize();
                $timeout(function(){
				    $scope.mapLoaded = true;
                }, 3000);
                $rootScope.firstLoad = false;
                $scope.checkCity();
            }            
    });
    
    $scope.subscribeByCity = function(){
        var currentLoc = Location.currentLocation();
        $scope.currentLocation = currentLoc;
        var distanceAwayMilwaukee = GeoFire.distance([43.0389, -87.9065], currentLoc);
        var distanceAwayChicago = GeoFire.distance([41.8781, -87.6298], currentLoc);
                //milwaukee Topic Check
                if(distanceAwayMilwaukee < 50){
                    if($rootScope.analyticsFlag!=true){
                        mixpanel.track("App Load", {"Real City": "Milwaukee", "Email": $rootScope.userAuthEmail});
                        window.FirebasePlugin.logEvent("select_content", {content_type: "app_load", item_id: "Milwaukee"});
                    }
                    console.log('You are in Milwaukee');
                    //alert('milwaukee');
                    window.FirebasePlugin.setUserProperty("City", "Milwaukee");
                    window.FirebasePlugin.subscribe('Milwaukee',
                        function(success){
                          //Success is being ran here with "OK" response
                          //Update user to latest city
                        },
                        function(error){
                          // Not seeing any errors here
                        }
                    );
                    window.FirebasePlugin.unsubscribe('Chicago');

                } else if(distanceAwayChicago < 50){
                    if($rootScope.analyticsFlag!=true){
                        mixpanel.track("App Load", {"Real City": "Chicago", "Email": $rootScope.userAuthEmail});
                        window.FirebasePlugin.logEvent("select_content", {content_type: "app_load", item_id: "Chicago"});
                    }
                    console.log('You are in Chicago');
                    //alert('chicago');
                    window.FirebasePlugin.setUserProperty("City", "Chicago");
                    window.FirebasePlugin.subscribe('Chicago',
                        function(success){
                          //Success is being ran here with "OK" response
                          //Update user to latest city
                        },
                        function(error){
                          // Not seeing any errors here
                        }
                    );
                    window.FirebasePlugin.unsubscribe('Milwaukee');

                } else {
                    if($rootScope.analyticsFlag!=true){
                        mixpanel.track("App Load", {"Real City": "Chicago", "Email": $rootScope.userAuthEmail});
                        window.FirebasePlugin.logEvent("select_content", {content_type: "app_load", item_id: "Other"});
                    }
                    window.FirebasePlugin.setUserProperty("City", "Other");
                }
                if($rootScope.analyticsFlag==true){
                    window.FirebasePlugin.setUserProperty("Admin", "true");
                    window.FirebasePlugin.subscribe('Admin',
                        function(success){
                          //Success is being ran here with "OK" response
                          //Update user to latest city
                        },
                        function(error){
                          // Not seeing any errors here
                        }
                    );
                }
    };
    
    
    
    $scope.checkCity = function() {
        var currentLoc = Location.currentLocation();
        $scope.currentLocation = currentLoc;
   
            var time = new Date();
            var stamp = time.getTime();
            var day = moment(time).format("YYYYMMDD");
            var loc = {};
            loc['lat'] = currentLoc[0];
            loc['lon'] = currentLoc[1];
        
            if(!angular.isUndefined($rootScope.authUserData) && !angular.isUndefined($rootScope.authUserData.uid)){
                loc['id'] = $rootScope.authUserData.uid; 
            }

            
            if($rootScope.analyticsFlag!=true){
                $rootScope.mealsteals.child('/adminAnalytics/appLoads/' + day + "/" + stamp).set(loc);
                if(!angular.isUndefined($rootScope.userFB)){
                    $rootScope.userFB.child('/location/').set(currentLoc);
                }
                console.log('in app load counter');
            }
            
            var geocoder;
            geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(loc['lat'], loc['lon']);

            geocoder.geocode(
                {'latLng': latlng}, 
                function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                var add= results[0].formatted_address ;
                                var  value=add.split(",");

                                console.log(value);
                                count=value.length;
                                country=value[count-1];
                                state=value[count-2];
                                city=value[count-3];
                                //alert('You are currently in', city);
                                $rootScope.userCity = city;
                                $rootScope.userState = state;
                                mixpanel.people.set({
                                    "realGPS": city,
                                });
                                if($rootScope.analyticsFlag!=true){
                                    mixpanel.track("Load By City", {"City":city+', '+state, "Email": $rootScope.userAuthEmail});
                                }
                            }
                            else  {
                                //alert("address not found");
                            }
                    }
                     else {
                        //alert("Geocoder failed due to: " + status);
                    }
                }
            );
    };
    
    /*$rootScope.$on('serveAd', function(){
            $scope.trackAppLoad();
            $scope.chooseAd();
    });*/
    
    $rootScope.$on('refreshController', function(){
        console.log('refreshing');
        //if ($rootScope.reloadController==true){
        $timeout(function(){
				$window.location.reload();
        }, 1000);
            
        //}
    });
    
    
    $scope.grabTodaysDeals = function(){
        //console.log('GRABBBBBING');
        $scope.loadingText = "Loading Deals...";
        //$scope.showLoading();
        $scope.deals = [];
        $scope.flashArray = [];
		$scope.topRated = [];
        $scope.events = [];
		$scope.dealKey_index = {};
		var promises = [];
            
        $rootScope.todayObj.$loaded(function(){
            $rootScope.todayObj.forEach(function(data, id){
                
                if (data && $rootScope.dataError !== true){
                        if ($scope.timestamp > data.startTime && $scope.timestamp < data.endTime){
                          if(!angular.isUndefined(data.lat) && data.approved != false){
                                    //var currentLocation = Location.currentLocation();
                                    var distanceAway = GeoFire.distance([data.lat, data.lon], $scope.currentLocation);



                              // && distanceAway < 30
                              if(distanceAway < 30){

                                  
                                        if(!angular.isUndefined(data.boost)){
                                            if(!angular.isUndefined(data.boost.start) && !angular.isUndefined(data.boost.end)){
                                                if($scope.timestamp > data.boost.start && $scope.timestamp < data.boost.end){
                                                    data.boost['valid'] = true;
                                                }else{
                                                    data.boost['valid'] = false;
                                                }
                                            }
                                        }      
                                  
                                        data.key = id;
                                        console.log('pushing todays deals')

                                        $scope.deals.push(data);
                                  
                                        if (data.recurringDealID==undefined) { $scope.flashArray.push(data) }
                                        
                                       
                                }
                              
                                /*if(distanceAway < 20 && data.locName=='Camino'){
                                    $scope.flashArray.push(data);
                                }*/
                          }else{
                              console.log(data);
                          }
                        }

                }
            });


                DealProcessor.Process($scope.deals).then(function(filteredDeals){
                    console.log('deal processing');
                    $scope.dealsProcessed=true;
                    $scope.hideSmartLoading();
                    filteredDeals.forEach(function(d){
                         // replace spaces in all deal images
                         //d.dealFullImage = d.dealFullImage.replace(/ /gi, "%20");
                        var re = / /gi;
                        var str = d.dealFullImage;		
                        var newstr = str.replace(re, "%20");		
                        d.dealFullImage = newstr;
                    });
                    // update markers on map
                    $scope.clearAndAddMarkers();
                    // update current location marker
                    refreshCurrentLocationMarker();
                    
                    if ($scope.deals.length==0){
                        
                        var currentLoc = Location.currentLocation();
                        if ($rootScope.gps && $rootScope.gps.lat && $rootScope.gps.lon) currentLoc = [$rootScope.gps.lat, $rootScope.gps.lon];
                        var likelyCity = identifyCity(currentLoc);
                         console.log(identifyCity(currentLoc));
                        var message = '';
                        if (likelyCity==null){
                            console.log('likelyCity = null');
                            $ionicPopup.alert({
                                 title: 'Dang.',
                                 template: '<center>We have not yet launched in your city, feel free change your location by using the navigation menu in the upper left hand corner.</center>'
                            });
                            
                        } else {
                            if (cities[likelyCity]['stage'] == 'active'){
                                message = 'No active deals right now but use the time surf feature below or use Explore to see future specials!';
                                $ionicPopup.alert({
                                 title: 'Well, this is awkward.',
                                 template: '<center>'+message+'</center>'
                                });
                                $scope.toggleDrawer();
                            } else if (cities[likelyCity]['stage'] == 'error'){
                                 $state.go('app.location');
                            }
                        }
                        
				    }
                });

        });
    };
    
    $rootScope.$on('dealsNearMeChanged', function(){
        // $scope.grabTodaysDeals();
	});

    
    /*$rootScope.$on('mapRefresh', function(){
        $timeout(function(){
				$scope.refreshMap()
        }, 1000);
    });*/
     // Hack to resize map after modal ruins the sizing, add $rootScope.doMapResize = true; after every hide modal.  Probably an awful way of doing this, should be fixed at some point.
    
    //FOR WHATEVER REASON THIS ISN'T NEED ANYMORE?

    $scope.$on('$ionicView.afterEnter', function() {
        if ($rootScope.doMapResize==true){
            ionic.trigger('resize');
            console.log('map resize')
        } else {
        console.log('no map resize');
        }
    });  
    
    $scope.triggerMapResize = function() {
        //alert('map resize!');
        //$rootScope.doMapResize=true;
    };
    

    //tell the system which active state, since there are at least two different controllers running at any given time there currently isn't an accurate way to determine this.  This should be added in the three main views.  It will be attached to a button in AppCtrl as well.  
    $rootScope.activeState = 'deals';
    console.log("Active State: "+$rootScope.activeState);
    
    if (!angular.isUndefined($rootScope.currentUser)) {
        $rootScope.currentUser.$loaded(function(data){
            if(!angular.isUndefined(data.username)){
                var timestamp = new Date().getTime();
                if($rootScope.analyticsFlag!=true){
                    $rootScope.userFB.child('/logins/' + timestamp).set(timestamp);
                    mixpanel.track("User Logged In", {"Username": data.username, "Email": $rootScope.userAuthEmail});
                }
            }
        });
    }
  
    
    var lastAdServed = false;
    
    $scope.chooseAd = function(){
        currentTime = new Date().getTime();
        console.log(lastAdServed);
        if (currentTime-lastAdServed>300000 || lastAdServed==false){
            console.log('serve ad');
        
            console.log("Last ad served: ",lastAdServed);

            console.log('looking for ad');

            var ref = PopupAds.fetch();
            var featDealsArry = [];
            var randDealIndex = 0;
            var date = new Date();
            var time = date.getTime();

            var weekday = new Array(7);
              weekday[0]=  "sunday";
              weekday[1] = "monday";
              weekday[2] = "tuesday";
              weekday[3] = "wednesday";
              weekday[4] = "thursday";
              weekday[5] = "friday";
              weekday[6] = "saturday";

            var nowTime = parseInt(moment(time).format('HHmmss'));



            if(nowTime < 30000){
                var dayCheck = date.getDay() - 1;
                if(dayCheck == -1){
                    dayCheck = 6;
                }
                var todayDay = weekday[dayCheck];
            }else{

                var todayDay = weekday[date.getDay()];
            }


            ref.then(function(snapshot) {
                if(snapshot != undefined){
                  Object.keys(snapshot).forEach(function (childSnapshot) {
                    var childData = snapshot[childSnapshot];
                    //console.log(childData);
                    childData['key'] = childSnapshot;
                    var currentLocation = Location.currentLocation();
                    var distanceAway = GeoFire.distance([childData.lat, childData.lon], currentLocation);

                    var endTime = new Date(childData.endTime);
                    var dealEnd = parseInt(moment(endTime).format('HHmmss'));

                    var startTime = new Date(childData.startTime);
                    var dealStart = parseInt(moment(startTime).format('HHmmss'));

                    
                    if(dealEnd < 30000 && nowTime > 30000 ){
                        dealEnd = dealEnd + 240000;
                    }

                   // if(!angular.isUndefined(childData.active) && childData.active != false){
                          if(!angular.isUndefined(childData.type) && childData.type == 'general' || !angular.isUndefined(childData.type) && childData.type == 'alert'){
                              
                              //if(!angular.isUndefined(childData.active) && childData.active != false){
                              
                                  if(!angular.isUndefined(childData.daysOfWeek)){
                                      if(distanceAway < childData.radius && childData.daysOfWeek[todayDay] == "yes"){
                                          if(!angular.isUndefined(childData.daysOfWeek)){
                                            if(nowTime < 30000) {
                                                if (dealEnd < 30000) {
                                                    featDealsArry.push(childData);
                                                    //console.log(childData)
                                                }
                                            }
                                              else if ( dealEnd > nowTime  && dealStart < nowTime) {
                                                featDealsArry.push(childData);
                                              }
                                          }
                                      }
                                  }
                              //}

                          }else{
                              // && distanceAway < 30
                              if(distanceAway < 30 && childData.daysOfWeek[todayDay] == "yes"){
                                  if(!angular.isUndefined(childData.daysOfWeek)){
                                    if(nowTime < 30000) {
                                        if (dealEnd < 30000) {
                                            featDealsArry.push(childData);
                                            //console.log(childData)
                                        }
                                    }
                                      else if ( dealEnd > nowTime  && dealStart < nowTime) {

                                        featDealsArry.push(childData);
                                      }
                                  }
                              }
                          }
                   // }

                  });
                }

              if (featDealsArry.length > 0) {

                randDealIndex = Math.floor(Math.random() * featDealsArry.length);
                console.log(randDealIndex);
                var thisAd = featDealsArry[randDealIndex];
                  $scope.todayAd = thisAd;
                  if($rootScope.analyticsFlag!=true){
                      console.log('Subtracing impressions');
                      if (thisAd.impressions > 0) {
                        var newImpressions = thisAd.impressions - 1;
                        if(!angular.isUndefined(thisAd.spentAds)){
                            var spent = thisAd.spentAds + 1;
                        }else{
                            var spent = 1;
                        }





                        $rootScope.mealsteals.child('/popupAdDeals/' + thisAd.key).update({impressions:newImpressions}); 
                        $rootScope.mealsteals.child('/popupAdDeals/' + thisAd.key + '/spentAds').set(spent); 
                        if (newImpressions < 1 && newImpressions > -9){
                            //$rootScope.mealSteals.child('/popupAdDeals/' + thisAd.key).update({impressions:newImpressions}); 
                            var time = new Date();
                            var stamp = time.getTime();
                            var day = moment(time).format("YYYYMMDDhhmm");
                            $rootScope.mealsteals.child('/businesses/' + thisAd.businessID + '/adHistory/' + day).set(thisAd);
                            $rootScope.mealsteals.child('/popupAdDeals/' + thisAd.key).set(null);
                            
                        }
                      }
                  }
                  console.log(thisAd);
                
                if (!$rootScope.deepLinkUrl){
                    $scope.serveAd(thisAd);  
                }
                  
              }

           }); 
        }
    };
    
    
    /*******************************************************************************
        POPUPS
    ********************************************************************************/
    var adPopup;
    var filterPopup;
    var exploreIntroPopup;
    var trendingIntroPopup;
    
    $scope.serveAd = function(thisAd){
        lastAdServed = new Date().getTime();
        console.log("Last ad served: ",lastAdServed);
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Serve Ad", {"Email": $rootScope.userAuthEmail});
            
        }
        console.log(thisAd);
            $rootScope.thisAd = thisAd;
            if(angular.isUndefined($rootScope.usernameFlag)){
             adPopup = $ionicPopup.show({
             cssClass: 'popup-ad',
             //scope: $scope,
             templateUrl: 'templates/popup-ad.html',
            });
        }
    };
    $rootScope.closeAd = function() {
        adPopup.close();
        
        noop = angular.noop;
        elevated = false;
        var popupStack = $ionicPopup._popupStack;
        if (popupStack.length > 0) {
          popupStack.forEach(function(popup, index) {
            if (popup.isShown === true) {
              popup.remove();
              popupStack.pop();
            }
          });
        }

        $ionicBackdrop.release();
        //Remove popup-open & backdrop if this is last popup
        $timeout(function() {
          // wait to remove this due to a 300ms delay native
          // click which would trigging whatever was underneath this
          $ionicBody.removeClass('popup-open');
          // $ionicPopup._popupStack.pop();
        }, 400, false);
        ($ionicPopup._backButtonActionDone || noop)();
  
    };
    
    $rootScope.learnMore = function(){
        
       window.open($scope.thisAd.description, '_blank', 'location=yes');
       if($rootScope.analyticsFlag!=true){
            mixpanel.track("Ad Link Click", {"Email": $rootScope.userAuthEmail, "Ad Link":  $scope.thisAd.locName+', '+$scope.thisAd.name});
        }
    };
    
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
                          //$scope.popover.hide();
                        }
                      },
                      {
                        text: '<b>Login</b>',
                        type: 'button-popup-clear',
                        onTap: function(e) {

                          //$scope.popover.hide();

                            $state.go('app.account');
                        }
                      }
                    ]
            });  
    };
    
    $scope.timePopupAlert = function (){
        var timePopup = $ionicPopup.alert({
            title: 'Time Surf',
            cssClass: 'custom-popup',
            scope: $scope,
            templateUrl: 'templates/time-popup.html',
            buttons: [{
            text: 'Ok',
            type: 'button-positive',
            onTap: function(e) {
            }
            }]
        });
    }
    
    $scope.exploreIntroAlert = function(){
             exploreIntroPopup = $ionicPopup.show({
             cssClass: 'got-it',
             scope: $scope,
             templateUrl: 'templates/gotit-explore.html',
            });      
    };
    $scope.closeExploreIntro = function() {
        exploreIntroPopup.close();
    };
    
    
    $scope.trendingIntroAlert = function(){
             trendingIntroPopup = $ionicPopup.show({
             cssClass: 'got-it',
             scope: $scope,
             templateUrl: 'templates/gotit-trending.html',
            });      
    };
    $scope.closeTrendingIntro = function() {
        trendingIntroPopup.close();
    };
    
    $scope.openFilter = function(){
            filterPopup = $ionicPopup.show({
              cssClass: 'popup-filter',
              //okText: 'Close',
              scope: $scope,
              templateUrl: 'templates/filter.html',
         });
     };
    $scope.closeFilter = function() {
        //alert('close ad');
        filterPopup.close();
    };
    
    
     /*******************************************************************************
        SETTINGS AND DEFINITIONS
    ********************************************************************************/
    
	/* Native and local storage */
    /*
	$scope.hasSeenTimeShiftBefore = 'yes';
	if(window.localStorage['hasSeenTimeShiftBefore']){
		// do nothing
	} else {
		$scope.hasSeenTimeShiftBefore = 'no';
	}
    
   $rootScope.clickedClockButton = function(){
        console.log('clock');
        $cordovaNativeStorage.setItem("seenClock", true).then(function (value) {
                $log.log(value);
        $cordovaNativeStorage.getItem("seenClock").then(function (value) {
                    $log.log(value);
                }, function (error) {
                    $log.log(error);
                });
            }, function (error) {
                $log.log(error);
            });
    };*/
    

    /* store a list of gps locations that represent cities */

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

	var identifyCity = function(userLoc){
		var likelyCity = null;
		for (var city in cities){
			var kmAway = GeoFire.distance([cities[city].loc[0], cities[city].loc[1]], userLoc);
			if (kmAway < 50){
				likelyCity = city;
			}
		}
        
		return likelyCity;
	}

	$scope.millisecondsToTimer = function(milliseconds){
		// Returns a timer in format HH:MM:SS, or returns 'Expired'
		// if there is no time left
		if (milliseconds >= 1000){
			var timeLeftMoment = moment.duration(milliseconds);
			var hoursLeft = String(timeLeftMoment.hours());
			var minutesLeft = String(timeLeftMoment.minutes());
			var secondsLeft = String(timeLeftMoment.seconds());
			var out = hoursLeft + 'h ' + minutesLeft + 'm ' + secondsLeft + 's';
			return out;
		} else {
			return 'Expired';
		}
	};
    
	$scope.kmToMile = function(km){
		var miles = km * 0.621371;
		return miles;
	};

	$scope.timestamp = Timestamp.getTimestamp();
	var cancelInterval = $interval(function(){
	  	$scope.timestamp = Timestamp.getTimestamp();
	}, 1000);

	$scope.$on('$destroy', function(){
		$interval.cancel(cancelInterval);
	});

	
    
    
    $scope.loadingText = "Pinning Location...";

    
    $ionicLoading.show({
           templateUrl: 'templates/smart-load.html',
           scope: $scope, 
	      //template: "<img src='img/rotating.png' class='spinner' style='height:60px;width:auto;opacity: 0.7;'/><span>"+$scope.loadingText+"</span>",
	       duration: 15000
    });
    
  	// Set some initial variables
  	$scope.fuHeight=window.innerHeight;
	$scope.fuWidth=window.innerWidth;
	$scope.inputWidth = Math.round($scope.fuWidth / 1.6);
	$scope.inputMargin = Math.round((($scope.fuWidth-$scope.inputWidth) / 2) / 1);

	// Show loading spinner until geoquery has initialized
	//$scope.showLoading();
	
    /*$rootScope.$on('firstGPS', function(){
		initialize(); // google map init
		//alert('firstGPS');
	});*/

	// Initial state for filtering tabs, sorting, and display type (map/list)
	$rootScope.filterOptions = {
         'categoryTab':'all', 
         'filterTo':'all', 
         'searchVal':'',
         'searchBiz':'',
         'featuredOnly':'no',
         'showTopRated':false,
         'showFlash':false,
         'showFavorite':false,
         'showPatio':false,
         'showRooftop':false,
         'showAddedType':false,
         'showVerifiedMo':false
     };
	// $scope.categoryTab = 'all'; //or food, drinks, exclusive
	// $scope.filterTo = 'all'; // or breakfast, brunch, lunch, dinner, happy hour
	$scope.sortMethod = 'endTime'; //or endTime, locName
	$scope.viewOptions = {'displayType':'map'};
    
    $rootScope.goToMap = function(){
        $scope.viewOptions = {'displayType':'map'};
        $(".list-icon-tab").removeClass("list-filled");
        $(".list-icon-tab").addClass("list");
        
        //angular.element('.map-icon-tab').removeClass(attrs.onIcon);
        //angular.element('.nonmap-icon-tab').addClass(attrs.offIcon);
    };
   
//
//	$scope.distanceSort = function(d) {
//	   return $scope.distAway([d.lat, d.lon]);
//	};

    $scope.filterTopRated = function(showTopRated){
 		return function(d){
 			if (showTopRated==false) return true;
 			if (d.totalRating > 4) return true;
 			return false;
 		}
 	};
     
     $scope.toggleTopRatedFilter = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "Top Rated", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showTopRated==false){
             $rootScope.filterOptions.showTopRated=true;
         } else {
             $rootScope.filterOptions.showTopRated=false;
         }
     }
     
     
     $scope.filterFlash = function(showFlash){
 		return function(d){
 			if (showFlash==false) return true;
 			if (d.recurringDealID==undefined) return true;
 			return false;
 		}
 	};
    
    
    $scope.toggleFavoriteFilter = function() {
          if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "Favorites", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showFavorite==false){
             $rootScope.filterOptions.showFavorite=true;
         } else {
             $rootScope.filterOptions.showFavorite=false;
         }
     }
    
    $scope.filterCheck = function() {
          if(angular.isUndefined($rootScope.currentUser)){
              
          
              if($rootScope.filterOptions.showFavorite==true){
                  $scope.promptLogin();
              }
          }
    };
    
    
    $scope.filterFav = function(showFav) {
        
        return function(d){
            
 			if (showFav==false)return true;
                if(!angular.isUndefined($rootScope.currentUser)){
                    
                    if(!angular.isUndefined($rootScope.currentFavs.deals) && !angular.isUndefined($rootScope.currentFavs.businesses)){
                         if (!angular.isUndefined($rootScope.currentFavs.deals[d.recurringDealID]) ||           !angular.isUndefined($rootScope.currentFavs.businesses[d.businessID])){ 
                             return true;
                         }else{
                             return false;
                         }
                        
                    }else if(!angular.isUndefined($rootScope.currentFavs.deals)){
                        
                        if (!angular.isUndefined($rootScope.currentFavs.deals[d.recurringDealID])){ 
                            return true;
                        }else{
                            return false;
                        }
                        
                    }else if(!angular.isUndefined($rootScope.currentFavs.businesses)){
                        
                        if (!angular.isUndefined($rootScope.currentFavs.businesses[d.businessID])){ 
                            return true;
                        }else{
                            return false;
                        }
                        
                    }else{
                        return false;
                    }

                }else{
                    return false;
                }
            }
        
     }
    
    //filterOptions.categoryTab='favorite';clearAndAddMarkers();favoriteClick();favoritesCheck();
     
     $scope.toggleFlashFilter = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "FlashSteals", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showFlash==false){
             $rootScope.filterOptions.showFlash=true;
         } else {
             $rootScope.filterOptions.showFlash=false;
         }
     }
     
     
     $scope.filterPatio = function(showPatio){
 		return function(d){
 			if (showPatio==false) return true;
 			if (d.patio==true) return true;
 			return false;
 		}
 	};
    
     
     $scope.togglePatioFilter = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "Patio", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showPatio==false){
             $rootScope.filterOptions.showPatio=true;
         } else {
             $rootScope.filterOptions.showPatio=false;
         }
     }
     
     $scope.toggleBizVer = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "Biz Verified", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showAddedType!='biz'){
             $rootScope.filterOptions.showAddedType='biz';
         } else {
             $rootScope.filterOptions.showAddedType=false;
         }
     }
     
     $scope.toggleUserSub = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "User Submitted", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showAddedType!='user'){
             $rootScope.filterOptions.showAddedType='user';
         } else {
             $rootScope.filterOptions.showAddedType=false;
         }
     };
     
    
     $scope.toggle12Mo = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "12 Mo Verified", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showVerifiedMo!=12){
             $rootScope.filterOptions.showVerifiedMo=12;
         } else {
             $rootScope.filterOptions.showVerifiedMo=false;
         }
     };
     
     $scope.toggle6Mo = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "6 Mo Verified", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showVerifiedMo!=6){
             $rootScope.filterOptions.showVerifiedMo=6;
         } else {
             $rootScope.filterOptions.showVerifiedMo=false;
         }
     }
     
     $scope.filterRooftop = function(showRooftop){
 		return function(d){
 			if (showRooftop==false) return true;
 			if (d.rooftop==true) return true;
 			return false;
 		}
 	};
     
     $scope.toggleRooftopFilter = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "Rooftop", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.showRooftop==false){
             $rootScope.filterOptions.showRooftop=true;
         } else {
             $rootScope.filterOptions.showRooftop=false;
         }
     }
     
     $scope.toggleFoodFilter = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "Food", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.categoryTab!='food'){
             $rootScope.filterOptions.categoryTab='food';
         } else {
             $rootScope.filterOptions.categoryTab='all';
         }
     }
     
     $scope.toggleDrinkFilter = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "Drinks", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.categoryTab!='drinks'){
             $rootScope.filterOptions.categoryTab='drinks';
         } else {
             $rootScope.filterOptions.categoryTab='all';
         }
     }
     
     $scope.toggleEventFilter = function() {
         if($rootScope.analyticsFlag!=true){
            mixpanel.track("Filter", {"Filter": "Events", "Email": $rootScope.userAuthEmail});
         }
         if ($rootScope.filterOptions.categoryTab!='events'){
             $rootScope.filterOptions.categoryTab='events';
         } else {
             $rootScope.filterOptions.categoryTab='all';
         }
     }
     
     //$scope.flashStealNearby=true; 
     $scope.flashStealAlert=true;
     $scope.closeFlashStealAlert = function() {
        $scope.flashStealAlert=false;  
     };
     
    
    $scope.ratingSort = function(d) {
        return -(d.totalRating);
	};
    
    
    $scope.clickSort = function(deal) {
         var totalClicks = 0;
        //console.log(deal);
            if(!angular.isUndefined(deal.analytics)){
                if(!angular.isUndefined(deal.analytics.listAnalytics)){
                   totalClicks = totalClicks + parseInt(deal.analytics.listAnalytics);
                }
                if(!angular.isUndefined(deal.analytics.mapAnalytics)){
                   totalClicks = totalClicks + parseInt(deal.analytics.mapAnalytics);
                }
                if(!angular.isUndefined(deal.analytics.iconAnalytics)){
                   totalClicks = totalClicks + parseInt(deal.analytics.iconAnalytics);
                }
                if(!angular.isUndefined(deal.analytics.topRatedAnalytics)){
                   totalClicks = totalClicks + parseInt(deal.analytics.topRatedAnalytics);
                }
            }
        //console.log(totalClicks);
        return -(totalClicks);
	};
    
    $scope.boostSort = function(d) {
        if(!angular.isUndefined(d.boost) && d.boost.valid == true) {return 1};
	};
    
    
    $scope.flashSort = function(d) {
        if(d.recurringDealID !=true) {return 1};
	};
    
    $scope.featuredFilter = function(d){
		if ($scope.timestamp > d.startTime && $scope.timestamp < d.endTime && d.totalRating > 3) return true;
		return false;
	};
    $scope.filterFeatures = function(d){
 		if ($scope.totalRating > 3) return true;
 		return false;
 	};
    
	$scope.expiredFilter = function(d){
		if ($scope.timestamp > d.startTime && $scope.timestamp < d.endTime) return true;
		return false;
	};
    
    $scope.mapTabSelected = function() {
        if ($rootScope.analyticsFlag!=true){
            mixpanel.track("Map Tab", {"Email": $rootScope.userAuthEmail});
            window.FirebasePlugin.setScreenName("Map");
            window.FirebasePlugin.logEvent("select_content", {content_type: "page_view", item_id: "Map"});
        }
        
       // if(typeof analytics !== undefined) { analytics.trackView("Map Tab"); }
    };
    
    $scope.listTabSelected = function() {
        $scope.listToMap = false;
        if ($rootScope.analyticsFlag!=true){
            mixpanel.track("List Tab", {"Email": $rootScope.userAuthEmail});
            window.FirebasePlugin.setScreenName("List");
            window.FirebasePlugin.logEvent("select_content", {content_type: "page_view", item_id: "List"});
        }
        
       // if(typeof analytics !== undefined) { analytics.trackView("List Tab"); }
    };
    
    $scope.trendingTab = function(){
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Trending Tab", {"Email": $rootScope.userAuthEmail});
            window.FirebasePlugin.setScreenName("Trending");
            window.FirebasePlugin.logEvent("select_content", {content_type: "page_view", item_id: "Trending"});
        }
        
        //if(typeof analytics !== undefined) { analytics.trackView("Trending Tab"); }
    };
    
    
    $scope.businessClick = function(){
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Business Detail Click", {"Email": $rootScope.userAuthEmail});
        }
    };
    
    $scope.eventTabSelected = function() {
    };

	// Filter function for top row of tabs in app
	$scope.topTabFilter = function(categoryTab){
		return function(d){
			if (categoryTab=='all') return true;
            // add favorites call here
//            
//            if(!angular.isUndefined($rootScope.currentUser)){
//           
//                if(!angular.isUndefined($rootScope.currentFavs.deals) && !angular.isUndefined($rootScope.currentFavs.businesses)){
//                     if (categoryTab=='favorite' && (!angular.isUndefined($rootScope.currentFavs.deals[d.recurringDealID]) || !angular.isUndefined($rootScope.currentFavs.businesses[d.businessID]))) return true;
//                }else if(!angular.isUndefined($rootScope.currentFavs.deals)){
//                    if (categoryTab=='favorite' && (!angular.isUndefined($rootScope.currentFavs.deals[d.recurringDealID]))) return true;
//                }else if(!angular.isUndefined($rootScope.currentFavs.businesses)){
//                    if (categoryTab=='favorite' && (!angular.isUndefined($rootScope.currentFavs.businesses[d.businessID]))) return true;
//                }else{
//                    if (categoryTab=='favorite') return false;
//                }
//            
//            }
            
            if (categoryTab=='featured' && (d.featured=='yes')) return true;
//            if (categoryTab=='exclusive' && (d.exclusive=='yes')) return true;
//          if (categoryTab=='exclusive' && (d.exclusive=='yes')) return true;
            if (categoryTab=='events' && (d.timeType=='event')) return true;
			if (categoryTab=='food' && (d.foodOrDrink == 'food' || d.foodOrDrink == 'both')) return true;
			if (categoryTab=='drinks' && (d.foodOrDrink == 'drink' || d.foodOrDrink == 'both')) return true;
			return false;
		}
	};
    
    $scope.verifiedTypeFilter = function(showAddedType){
		return function(d){
			if (showAddedType==false) return true;            
            if (showAddedType=='user' && (d.userSubmitted==true)) return true;
            if (showAddedType=='biz' && (d.bizAccount==true && d.userSubmitted!=true)) return true;
			return false;
		}
	};
    
    var timeOnLoad = new Date().getTime();
    $scope.verifiedMoFilter = function(showVerifiedMo){
        console.log(timeOnLoad);
		return function(d){
			if (showVerifiedMo==false) return true;            
            if (showVerifiedMo==6 && ((timeOnLoad - d.lastVerified) < 15552000000 )) return true;
            if (showVerifiedMo==12 && ((timeOnLoad - d.lastVerified) < 31104000000)) return true;
			return false;
		}
	};

	// Filter function for action sheet that pops up from bottom of app after tapping filter icon in top left
	$scope.bottomSheetFilter = function(filterTo){
		return function(d){
			if (filterTo=='all') return true;
			if (filterTo=='happyhour' && d.locName.trim().toLowerCase().indexOf('happy') >= 0 && d.locName.trim().toLowerCase().indexOf('hour') >= 0) return true;
			if (filterTo=='happyhour' && d.description.trim().toLowerCase().indexOf('happy') >= 0 && d.description.trim().toLowerCase().indexOf('hour') >= 0) return true;
			if (filterTo==d.timeType) return true;
			return false;
		}
	};

	$rootScope.searchValueFilter = function(searchVal){
		return function(d){
			if (searchVal.trim()=='') return true;
			if (d.name.trim().toLowerCase().indexOf(searchVal.toLowerCase()) >= 0) return true;
			if (d.locName.trim().toLowerCase().indexOf(searchVal.toLowerCase()) >= 0) return true;
			if (d.description.trim().toLowerCase().indexOf(searchVal.toLowerCase()) >= 0) return true;
			return false;
		}
	};
    
       
    $scope.searchValueFilterBiz = function(searchBiz, biz){
		return function(b){
            if (searchBiz.trim()=='') return true;
            if (biz.businessName.trim().toLowerCase().indexOf(searchBiz.toLowerCase()) >= 0) return true;
			//if (b.locName.trim().toLowerCase().indexOf(searchBiz.toLowerCase()) >= 0) return true;
			//if (b.description.trim().toLowerCase().indexOf(searchBiz.toLowerCase()) >= 0) return true;
			return false;
		}
	};
    
	$scope.featuredFilter = function(featured){
		return function(d){
			if (featured=='no') return true;
			if (d.featured=='yes') return true;
			return false;
		}
	};

	// This is used to show a really quick highlight when tapping a list element in ionic lists
	$scope.quickHighlight = function($event){
		var ele = angular.element($event.currentTarget)[0];
		ele.style.background = "#d9d9d9";
		$timeout(function(){
			ele.style.removeProperty('background');
		}, 80);
	};

	// Generic function for changing path with optional delay
	$rootScope.go = function(path, delay){
        console.log(path, delay);
		if (delay){
			$timeout(function(){
				$location.path(path);
			}, delay);
		} else {
			$location.path(path);
            
		}       
	};
    
    $scope.openAddDeal = function () {
        if(!$rootScope.currentUser){
            $scope.promptLogin();
//              var myPopup = $ionicPopup.show({
//                    title: 'Must be logged in to add deals.',
//                    scope: $scope,
//                    buttons: [
//                      {
//                        text: '<b>Cancel</b>',
//                        onTap: function(e) {   
//                          $scope.popover.hide();
//                        }
//                      },
//                      {
//                        text: '<b>Login</b>',
//                        type: 'button-positive',
//                        onTap: function(e) {
//
//                            $scope.popover.hide();
//                            $state.go('app.account');
//
//                        }
//                      }
//                    ]
//              });
            } else {
                $state.go('app.add-deal');
            }
    };
    
    $rootScope.popupClick = function() {
        if ($rootScope.analyticsFlag!=true){
            $scope.trackAd($scope.thisAd);
         mixpanel.track("Popup Click", {"Email": $rootScope.userAuthEmail});  
        }
    };

	// var searchBoxInterval = null;
	$rootScope.searchBoxSubmit = function($event){
		// if (searchBoxInterval !== null){ $timeout.cancel(searchBoxInterval); searchBoxInterval = null; }
		// if ($scope.filterOptions.searchVal.trim() == '') return;
		$scope.clearAndAddMarkers();
		$(angular.element($event.target)[0][0]).blur();
	};
    
    $rootScope.searchBoxSubmitBiz = function($event){
		// if (searchBoxInterval !== null){ $timeout.cancel(searchBoxInterval); searchBoxInterval = null; }
		// if ($scope.filterOptions.searchVal.trim() == '') return;
		//$scope.clearAndAddMarkers();
		$(angular.element($event.target)[0][0]).blur();
	};
	// $scope.searchBoxChanged = function($event){
	// 	if (searchBoxInterval !== null){ $timeout.cancel(searchBoxInterval); searchBoxInterval = null; }
	// 	searchBoxInterval = $timeout(function(){
	// 		$scope.clearAndAddMarkers();
	// 	},3000);
	// };

	// Triggered on a button click, or some other target
	$scope.showActionSheet = function() {

		var index_filterVal = {};
		var useButtons = [];
		var selectedText = '';

		index = 0;
		[['all', 'All'], 
		['happyhour', 'Happy Hour'],
		//['nightlyspecial', 'Nightly Specials'], 
        ['nightlyspecial', 'Nightly Specials'],  
		['event', 'Events'],
		// ['lunch', 'Lunch'],
		// ['dinner', 'Dinner']
		].forEach(function(e){
			if ($scope.filterOptions.filterTo !== e[0]){
				useButtons.push({text:'&nbsp;&nbsp;' + e[1]});
				index_filterVal[index] = e[0];
				index += 1;
			} else {
				selectedText = 'Current: ' + e[1];
			}
		});

	   // Show the action sheet
	   var hideSheet = $ionicActionSheet.show({
	     buttons: useButtons,
	     titleText: 'Filter:',
	     buttonClicked: function(index) {
	     	$scope.filterOptions.filterTo = index_filterVal[index];
	     	$scope.clearAndAddMarkers();
	       return true;
	     },
	     destructiveText:selectedText,
	     destructiveButtonClicked: function(){

	     }
	   });

	};

     /*******************************************************************************
        MAP AND DEALS
    ********************************************************************************/
    
    
    $scope.loadFutureEvents = function(){
        $scope.futureEvents = $firebaseArray(eventsRef);
        // create a query for the most recent 25 messages on the server
        var query = eventsRef.orderByChild("timestamp");
        // the $firebaseArray service properly handles database queries as well
        $scope.filteredEvents = $firebaseArray(query);
        //var emaiObject = new GeoFire(firebaseRef.child('/emails'));
    
    };
 
	

	var mapMarkers = [];
	var lastInfoWindow = null;
	var currentLocationMarker = null;
    $scope.markers = [];
    var markerCluster = undefined;

	$rootScope.clearAndAddMarkers = function(){
        console.log('start clear and add markers');
        var sortArray = $scope.deals;
        
        sortArray.sort(function(a) {
            if ( a.recurringDealID == undefined || a.recurringDealID == false )
                return -1;
            if ( a.recurringDealID != undefined && a.recurringDealID != false )
                return 1;
            return 0;
        });
        
        
		// this triggers when we change a filter
		// we need to know so we can update the map accordingly

		// We fake a loading screen for a particular reason. It is far easier to apply filter changes by
		// removing all map markers and re-adding only the relevant markers. Instead of seeing a screen
		// flash/blip, we fake a 1 second loading which is more visually pleasing
			// $scope.showLoading();
                if(!angular.isUndefined($scope.markers) && $scope.markers.length > 0){
			         clearMapMarkers();
                }
				addMapMarkers();
                //console.log('hide loading');
                $scope.hideSmartLoading();
                //$ionicLoading.hide();
                
                $timeout(function(){
				    
                    $scope.chooseAd();
                    //$scope.loadingText = "Loading...";
				},2000);
                console.log($scope.deals);
                console.log('map markers: ',$scope.markers.length);
                if ($scope.markers.length==0 && $scope.deals.length>0){
                    $ionicPopup.alert({
                             title: 'Dang.',
                             template: '<center>0 search results... Try adjusting your filters</center>'
				   });
                }
            if($rootScope.deepLinkUrl!=null && $rootScope.deepLinkUrl!='served'){
                $location.path($rootScope.deepLinkUrl);
                console.log('deep link ',$rootScope.deepLinkUrl)
                $rootScope.deepLinkUrl='served';
            }
				/*if ($scope.deals.length==0){
                    
          //wait for popup to be closed before message is shown
                    
					// determine what message to show
					var currentLoc = Location.currentLocation();
					if ($rootScope.gps && $rootScope.gps.lat && $rootScope.gps.lon) currentLoc = [$rootScope.gps.lat, $rootScope.gps.lon];
					var likelyCity = identifyCity(currentLoc);
                     console.log(identifyCity(currentLoc));
					var message = '';
					if (likelyCity==null){
                        console.log('likelyCity = null');
						//message = 'We have not launched in your city yet!'
                        $ionicPopup.alert({
                             title: 'Dang.',
                             template: '<center>We have not yet launched in your city, feel free change your location by using the navigation menu in the upper left hand corner.</center>'
				        });
					} else {
						if (cities[likelyCity]['stage'] == 'active'){
							message = 'No active deals right now but use the time surf feature below or use Explore to see future specials!';
                            $ionicPopup.alert({
                             title: 'Well, this is awkward.',
                             template: '<center>'+message+'</center>'
				   });
						} else if (cities[likelyCity]['stage'] == 'error'){
                            
                             
                             $state.go('app.location');
						}
					}
				}*/
    
	};
    
    
    
	var addMapMarkers = function(){

		var locName_infoWindow = {};
        
//        if(!angular.isUndefined($scope.markers)){
//            markerCluster.setMap(null); 
//        }
//        
        
            
        
        $scope.deals.forEach(function(e){
            //console.log('deal for loops'); 
            $scope.thisDeal = e;
            
            var tracking_key = String(e.lat) + String(e.lon);
            /*filter:verifiedMoFilter(filterOptions.showVerifiedMo) | 
                           filter:filterPatio(filterOptions.showPatio) |
                            $scope.verifiedTypeFilter = function(showAddedType)
                           
                           */
            
            var topRatedPass = ($scope.filterTopRated($scope.filterOptions.showTopRated))(e);
            var flashPass = ($scope.filterFlash($scope.filterOptions.showFlash))(e);
            var favoritePass = ($scope.filterFav($scope.filterOptions.showFavorite))(e);
            var patioPass = ($scope.filterPatio($scope.filterOptions.showPatio))(e);
            var rooftopPass = ($scope.filterRooftop($scope.filterOptions.showRooftop))(e);
            
        	var verTypePass = ($scope.verifiedTypeFilter($scope.filterOptions.showAddedType))(e);
            var verMoPass = ($scope.verifiedMoFilter($scope.filterOptions.showVerifiedMo))(e);
            
            var topFilterPass = ($scope.topTabFilter($scope.filterOptions.categoryTab))(e);
        	var bottomFilterPass = ($scope.bottomSheetFilter($scope.filterOptions.filterTo))(e);
        	var searchValuePass = ($scope.searchValueFilter($scope.filterOptions.searchVal))(e);
            
        	var featuredPass = ($scope.featuredFilter($scope.filterOptions.featuredOnly))(e);
        	if (topFilterPass==false || bottomFilterPass==false || searchValuePass==false || featuredPass==false || topRatedPass==false || flashPass==false || favoritePass==false || patioPass==false || rooftopPass==false || verTypePass==false || verMoPass==false) return;

        	var loc = new google.maps.LatLng(parseFloat(e.lat),parseFloat(e.lon));
            
        	var userLocation = Location.currentLocation();

        	var distance = (Math.round($scope.kmToMile(GeoFire.distance([e.lat, e.lon], userLocation))*10)/10) + ' mi';
            
            if (e.recurringDealID == undefined){
                var icon = {
                url: 'img/flamegif.gif',
                scaledSize: new google.maps.Size(20, 50), // scaled size
                };
                
            } else if (!angular.isUndefined(e.boost) && e.boost.valid == true){
                var icon = {
                url: e.icon,
                scaledSize: new google.maps.Size(55, 55),// scaled size
                };
            
            }   else {
                var icon = {
                url: e.icon ,
                scaledSize: new google.maps.Size(40, 40),// scaled size
                };
            }
            if ($scope.timeAdjusted == 'yes'){    
                if (e.recurringDealID == undefined){
                    var content = "<div style='width:250px;height:130px;'>" +
                                      "<div style='height:30px;text-align:center;font-weight:900;padding-top:3px;font-size:16px;'><span>FlashSteal!</span></div>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b><img src='img/verified-blue.png' class='map-tag-img-flash'/></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                            "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><span>{{"+e.startTime+" | date : 'shortTime'}} - {{"+e.endTime+" | date : 'shortTime'}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                  "</div>";
                } else {
                    if(e.userSubmitted==true){
                        var content = "<div style='width:250px;height:100px;'>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><img src='img/user-added.png' class='map-tag-img-user'/>"+e.name+"</div>" +
                                            "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><i ng-show='timer.checked==true' class='icon ion-ios-clock-outline' style='color:red;'></i> <span ng-show='timer.checked==true' style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span><span ng-show='timer.checked==false'>{{"+e.startTime+" | date : 'shortTime'}} - {{"+e.endTime+" | date : 'shortTime'}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                      "</div>";
                    } else if (e.bizAccount==true){
                        var content = "<div style='width:250px;height:100px;'>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;display:flex;'><div style='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div><img src='img/verified-blue.png' class='map-tag-img-biz'/></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                            "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><i ng-show='timer.checked==true' class='icon ion-ios-clock-outline' style='color:red;'></i> <span ng-show='timer.checked==true' style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span><span ng-show='timer.checked==false'>{{"+e.startTime+" | date : 'shortTime'}} - {{"+e.endTime+" | date : 'shortTime'}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                      "</div>";
                    } else {
                        var content = "<div style='width:250px;height:100px;'>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                            "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><i ng-show='timer.checked==true' class='icon ion-ios-clock-outline' style='color:red;'></i> <span ng-show='timer.checked==true' style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span><span ng-show='timer.checked==false'>{{"+e.startTime+" | date : 'shortTime'}} - {{"+e.endTime+" | date : 'shortTime'}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                      "</div>";
                    }
                }        
            } else {
                if (e.recurringDealID == undefined){
                        var content = "<div style='width:250px;height:130px;'>" +
                                          "<div style='height:30px;text-align:center;font-weight:900;padding-top:3px;font-size:16px;'><span>FlashSteal!</span></div>" +
                                            "<div style='display:inline-block;height:60px;'>" +
                                                    "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px' >" + 
                                            "</div>" +
                                            "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                                "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b><img src='img/verified-blue.png' class='map-tag-img-flash'/></div>" +
                                                "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                                "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><i class='icon ion-ios-clock-outline' style='color:red;'></i> <span style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +



                                            "</div>" +
                                            "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                      "</div>";
                } else if (e.recurringDealID == false){
                    var content = "<div style='width:250px;height:130px;'>" +
                                      "<div style='height:30px;text-align:center;font-weight:900;padding-top:3px;font-size:16px;'><span>" + e.specialEventName + "</span></div>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px' >" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                            "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><i class='icon ion-ios-clock-outline' style='color:red;'></i> <span style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                        
                                          
                        
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                  "</div>";
                    
                } else {
                    if (e.userSubmitted==true){
                        var content = "<div style='width:250px;height:100px;'>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><img src='img/user-added.png' class='map-tag-img-user'/>"+e.name+"</div>" +
                                            "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><i class='icon ion-ios-clock-outline' style='color:red;'></i> <span style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                      "</div>";
                    } else if (e.bizAccount==true){
                        var content = "<div style='width:250px;height:100px;'>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;display:flex;'><div style='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div><img src='img/verified-blue.png' class='map-tag-img-biz'/></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                            "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><i class='icon ion-ios-clock-outline' style='color:red;'></i> <span style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                      "</div>";
                    } else {
                        var content = "<div style='width:250px;height:100px;'>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px; border-radius:10px'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                            "<div style='width:180px;margin-bottom: 9px;overflow:hidden;'><i class='icon ion-ios-clock-outline' style='color:red;'></i> <span style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                      "</div>";
                    }  
                }
            }
            if (tracking_key in locName_infoWindow){
            content = content.replace(e.locName, 'Also...');
            content = content.replace("<img src='img/verified-blue.png' class='map-tag-img'/>", '');
            content = content.replace("<img src='img/verified-blue.png' class='map-tag-img-flash'/>", '');
            var currentContent = locName_infoWindow[tracking_key][1];
            locName_infoWindow[tracking_key][0].setContent($compile('<div>' + currentContent + content + '</div>')($scope)[0]);
            locName_infoWindow[tracking_key][1] = currentContent + content;
             
		    } else {
		    	var infowindow = new google.maps.InfoWindow({
			      content: $compile(content)($scope)[0]
			    });
                
                if (e.recurringDealID == undefined){
                    var marker = new google.maps.Marker({
                      position: loc,
                      //map: $scope.map,
                      icon: icon,
                      //labelClass: "hide",
                      zIndex:9999,
                      optimized: false,

                    });
                } else if (!angular.isUndefined(e.boost) && e.boost.valid == true){
                    var marker = new google.maps.Marker({
                      position: loc,
                      //map: $scope.map,
                      icon: icon,
                      zIndex:9999,
                    });
                } else {
                    var marker = new google.maps.Marker({
                      position: loc,
                      //map: $scope.map,
                      icon: icon,
                    });
                }
                
                
                
                // need to somehow figure out how to determine if map isn't working
                /*google.maps.event.addListener(map, "idle", function(){
                    //alert('idle');
                    google.maps.event.trigger(map, 'resize'); 
                });*/
                
                /*google.maps.event.addListenerOnce($scope.map, "tilesloaded", function() {
                    //search hiding was here before!
                    console.log('finished loading map markers, hide loading now')
                    $ionicLoading.hide();
                });*/

			    google.maps.event.addListener(marker, 'click', function() {
			      if (lastInfoWindow !== null) lastInfoWindow.close();
			      lastInfoWindow = infowindow;
  			      infowindow.open($scope.map,marker);
                    
                    if($rootScope.analyticsFlag!=true){
                        //mixpanel analytics
                        //mixpanel.track(e.locName, {"Click": "Map Icon"});
                        mixpanel.track("Map Icon", {"Business": e.locName, "Email": $rootScope.userAuthEmail});
                        $scope.iconAnalytics(e);

                        if (e.featured=='yes'){
                            mixpanel.track(e.locName, {"Click": "Featured"});
                            mixpanel.track("Featured Map Icon", {"Business": e.locName, "Email": $rootScope.userAuthEmail});
                            
                        }

                        if (!angular.isUndefined(e.boost) && e.boost.valid == true ){
                            mixpanel.track(e.locName, {"Click": "Boosted"});
                            mixpanel.track("Boosted Map Icon", {"Business": e.locName, "Email": $rootScope.userAuthEmail});

                        }

                        if (e.recurringDealID == undefined){
                            mixpanel.track(e.locName, {"Click": "Flash Deal"});
                            mixpanel.track("Flash Deal", {"Business": e.locName, "Email": $rootScope.userAuthEmail});
                        }
                    }
			    });
                

			    mapMarkers.push(marker);

			    locName_infoWindow[tracking_key] = [infowindow, content];
                
		    }
            
            
//            
//            Map Analytics
//            
//            
        $scope.mapAnalytics = function(dealID){
                var deal = $rootScope.todayObj[dealID];
                console.log(dealID);
                console.log($rootScope.todayObj);
                if($rootScope.analyticsFlag!=true){
                        
                    var start = new Date(deal.startTime);
                    var startDate = moment(start.getTime()).format('YYYYMMDD');
                    var end = new Date(deal.endTime);
                    var endDate = moment(end.getTime()).format('YYYYMMDD');

                    if(!angular.isUndefined(deal.analytics)){
                        if(angular.isUndefined(deal.analytics.mapAnalytics) ){
                            $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/mapAnalytics').set(1);
                            $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/mapAnalytics').set(1);
                        }else{

                            var incrementData = deal.analytics.mapAnalytics+1;
                            $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/mapAnalytics').set(incrementData);
                            $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/mapAnalytics').set(incrementData);
                        }
                    }else{
                        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/mapAnalytics').set(1);
                        $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/mapAnalytics').set(1);
                    }

                    //mixpanel.track(e.locName, {"Click": "Map detail"});
                    mixpanel.track("Map Detail Click", {"Business": deal.locName, "Email": $rootScope.userAuthEmail});
                    console.log("Map Detail Click");
                    console.log(deal);
                    
                    //firebase analytics
                    if(!angular.isUndefined(window.FirebasePlugin)){
                        window.FirebasePlugin.logEvent("select_content", {content_type: "deal_view", item_id: "map-click"});
                    }
                    
                }
            };
                          

            
//            
//            Map Analytics
//            
//           
            if(!angular.isUndefined(marker)){
                $scope.markers.push(marker);
            }
//            else{
//                console.log('undefined');
//                console.log(e);
//                
//                
//            if (e.recurringDealID == undefined){
//                var icon = {
//                url: 'img/flamegif.gif',
//                scaledSize: new google.maps.Size(20, 50), // scaled size
//                };
//                
//            } else if (e.boost == true){
//                var icon = {
//                url: e.icon,
//                scaledSize: new google.maps.Size(55, 55),// scaled size
//                };
//            
//            }   else {
//                var icon = {
//                url: e.icon,
//                scaledSize: new google.maps.Size(40, 40),// scaled size
//                };
//            }
//                
//                
//                
//                               
//                if (e.recurringDealID == undefined){
//                    var marker = new google.maps.Marker({
//                      position: loc,
//                      //map: $scope.map,
//                      icon: icon,
//                      //labelClass: "hide",
//                      zIndex:9999,
//                      optimized: false,
//
//                    });
//                } else if (e.boost == true){
//                    var marker = new google.maps.Marker({
//                      position: loc,
//                      //map: $scope.map,
//                      icon: icon,
//                      zIndex:9999,
//                    });
//                } else {
//                    var marker = new google.maps.Marker({
//                      position: loc,
//                      //map: $scope.map,
//                      icon: icon,
//                    });
//                }
//                
//                 
//                if(!angular.isUndefined(marker)){
//                    $scope.markers.push(marker);
//                }
//                
//                
//            }
            
            
        });
        
        
        
        $q.all($scope.markers).then(function(){
            // This callback function will be called when all the promises are resolved.    (when all the albums are retrived)
            
            if(!angular.isUndefined(markerCluster)){
                markerCluster.clearMarkers();
            }
            
            
            var clusterStyles = [
                  {
                    textColor: 'white',
                    url: 'img/pulsegreen2.gif',
                    //scaledSize: new google.maps.Size(40, 40),// scaled size
                    height: 52,
                    width: 52
                  }/*,
                 {
                    textColor: 'white',
                    url: 'img/m/m2.png',
                    height: 56,
                    width: 55
                  },
                 {
                    textColor: 'white',
                    url: 'img/m/m3.png',
                    height: 50,
                    width: 50
                  }*/
                ];
            
            
            
            var mcOptions = {
              gridSize: 80, 
              maxZoom: 14, 
              styles: clusterStyles,
              minimumClusterSize: 5};
              markerCluster = new MarkerClusterer($scope.map, $scope.markers, mcOptions);
            
            google.maps.event.addListenerOnce($scope.map, "tilesloaded", function() {
                    //search hiding was here before!
                    console.log('tiles loaded')
                    $scope.tilesLoaded=true;
                    $scope.hideSmartLoading();
                });
              
       
        });
            //hiding was here before!!!
            //console.log('hide loading');
            $scope.hideSmartLoading();
		    //$ionicLoading.hide();
	};

	var clearMapMarkers = function(){
//		mapMarkers.forEach(function(e){
//			e.setMap(null);
//		});
        
        $scope.markers.forEach(function(e){
			e.setMap(null);
        });
           
        
		mapMarkers = [];
        $scope.markers = [];
	};

	function initialize() {
             $scope.loadingText = "Loading Deals...";
            
            var pos = Location.currentLocation();
		    var loc = new google.maps.LatLng(parseFloat(pos[0]),parseFloat(pos[1]));

          // Create an array of styles.
          var styles = [
               {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                  { "hue": "#0091ff" }
                ]
              },{
                "featureType": "landscape",
                "stylers": [
                  { "color": "#fffbf3" }
                ]
              },{
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                  { "color": "#c0e5af" }
                ]
              },{
                "featureType": "road.arterial",
                "elementType": "geometry.fill",
                "stylers": [
                  { "color": "#fffbdb" }
                ]
              },{
                "featureType": "road.local",
                "elementType": "geometry.fill",
                "stylers": [
                  { "color": "#ffffff" }
                ]
              },{
                "featureType": "poi",
                "elementType": "labels",
                "stylers": [
                  { "visibility": "off" }
                ]
              },{
                "featureType": "landscape",
                "elementType": "labels.text",
                "stylers": [
                  { "visibility": "off" }
                ]
              },{
                "featureType": "water",
                "elementType": "labels",
                "stylers": [
                  { "visibility": "off" }
                ]
              },{
                "elementType": "geometry",
                "stylers": [
                  { "visibility": "on" },
                  { "gamma": 1.8 }
                ]
              }
            ];

          // Create a new StyledMapType object, passing it the array of styles,
          // as well as the name to be displayed on the map type control.
          var styledMap = new google.maps.StyledMapType(styles,
            {name: "Styled Map"});

          // Create a map object, and include the MapTypeId to add
          // to the map type control.
          var mapOptions = {
            center: loc,
	        zoom: 14,
            streetViewControl: false,
	        mapTypeControl: false,
	        zoomControl: false,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, 'map_style']
            }
          };
          
          //var map = new google.maps.Map(document.getElementById("map"),mapOptions);
            
          $scope.map = new google.maps.Map(document.getElementById("map"),mapOptions);
            

          //Associate the styled map with the MapTypeId and set it to display.
          $scope.map.mapTypes.set('map_style', styledMap);
          $scope.map.setMapTypeId('map_style');
            
          currentLocationMarker = new google.maps.Marker({
	      position: loc,
          
	      //map: $scope.map
	    });
        
        
        

        
        
    }
    
    $scope.dealLimit = 20;
    $scope.expandDealLimit = function() {
    	$ionicLoading.show({
	      template: "<img src='img/rotating.png' class='spinner' style='height:60px;width:auto;opacity: 0.7;'/>",
	      duration: 1000
	    });
        $scope.dealLimit = $scope.dealLimit + 20;
    };
    
    $rootScope.refreshMap = function(){
        if($rootScope.analyticsFlag!=true){
                mixpanel.track("Refresh Map", {"Email": $rootScope.userAuthEmail});
        }
        initialize();
        //Location.forceRefresh();
        $scope.grabTodaysDeals();
    };
    
    $scope.refreshMapError = function(){
        initialize();
        Location.forceRefresh();
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Map Load Error", {"Email": $rootScope.userAuthEmail});
        }
    };
      
    $scope.centerOnMe = function(lat, lon) {
      refreshCurrentLocationMarker();
      google.maps.event.trigger(map, 'resize');
      if(!$scope.map) return;

      $q(function(resolve){
      	  if (lat && lon){
	      	// Get latest location directly. This is only used when "faking" locations
	      	resolve([lat, lon]);
	      } else {
	      	// Get latest location from Location service
	      	if (Location.hasGPSError()==true){
	      		$scope.showLoading();
	      		Location.currentLocation(true).then(function(latlon){
	      		resolve(latlon); 
	      		});
	      		
	      		/*
	      		 var lat = '';
    var lng = '';
    var address = 53186;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
         lat = results[0].geometry.location.lat();
         lng = results[0].geometry.location.lng();
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
    alert('Latitude: ' + lat + ' Logitude: ' + lng);
	      		
	      		
							$rootScope.gps = {'lat': lat, 'lon': lng};
							$scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
							Location.forceRefresh();

	      		*/

	      		
	      	} else {
	      		resolve(Location.currentLocation());
	      	}
		    
	      }
      }).then(function(pos){
          $timeout(function(){
              //hiding was here before!!!
              $scope.hideSmartLoading();
            //$ionicLoading.hide();
          },1500);
        
      	var loc = new google.maps.LatLng(pos[0],pos[1]);

		  // Ensure map marker is in the correct spot
		  if (currentLocationMarker !== null) currentLocationMarker.setMap(null);
		  currentLocationMarker = new google.maps.Marker({
	        position: loc,
            zIndex:9999999,
	        map: $scope.map
	      });

	      // Center the map
	      $scope.map.setCenter(loc);
      });
	           
    };

    var refreshCurrentLocationMarker = function(){
    	  // Get latest location from Location service
	      var pos = Location.currentLocation();
		  var loc = new google.maps.LatLng(pos[0],pos[1]);

		  // Ensure map marker is in the correct spot
		  if (currentLocationMarker !== null) currentLocationMarker.setMap(null);
		  currentLocationMarker = new google.maps.Marker({
	        position: loc,
	        map: $scope.map
	      });
    };
    
     /*******************************************************************************
        ANALYTICS
    ********************************************************************************/
    
    $scope.trackAppLoad = function(){
        var currentLoc = Location.currentLocation();
        if ($rootScope.gps && $rootScope.gps.lat && $rootScope.gps.lon) currentLoc = [$rootScope.gps.lat, $rootScope.gps.lon];
        var city = identifyCity(currentLoc);
        
        
    };
    
   /* $rootScope.$on('app reload', function(){
		$scope.trackAppLoad();
        $scope.chooseAd();
        if($rootScope.analyticsFlag!=true){
            if (city != undefined) {
                 console.log(city);
                 mixpanel.track("App Load", {"Active city": city});
            } else {
                console.log(currentLoc);
                mixpanel.track("App Load", {"Inactive city": currentLoc});
            }
        }
	});*/
    
//    $scope.distAway = function(loc){
//    	return GeoFire.distance(loc, Location.currentLocation());
//    };

    $scope.eventToday = 1;
    
    $scope.eventTabClicked = function(){
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Event Tab", {"Email": $rootScope.userAuthEmail});
        }
    };
    
    $scope.boostClick = function(d){
        //console.log(d.locName);
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Boost Click", {"Business": d.locName, "Email": $rootScope.userAuthEmail});
        }
    };
    $scope.topRatedClick = function(deal){
        
        if($rootScope.analyticsFlag!=true){

            var start = new Date(deal.startTime);
            var startDate = moment(start.getTime()).format('YYYYMMDD');
            var end = new Date(deal.endTime);
            var endDate = moment(end.getTime()).format('YYYYMMDD');

            if(!angular.isUndefined(deal.analytics)){
                if(angular.isUndefined(deal.analytics.topRatedAnalytics) ){
                    $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/topRatedAnalytics').set(1);
                    $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/topRatedAnalytics').set(1);
                }else{

                    var incrementData = deal.analytics.topRatedAnalytics+1;
                    $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/topRatedAnalytics').set(incrementData);
                    $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/topRatedAnalytics').set(incrementData);
                }
            }else{
                $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/topRatedAnalytics').set(1);
                $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/topRatedAnalytics').set(1);
            }

            mixpanel.track("Trending Click", {"Email": $rootScope.userAuthEmail});
            console.log("top rated Click");
            
            //firebase analytics
            if(!angular.isUndefined(window.FirebasePlugin)){
                window.FirebasePlugin.logEvent("select_content", {content_type: "deal_view", item_id: "trending-click"});
            }
        }
            
         
    };
    
    
    
//   
//    
//    Analytics
//    
    
    $scope.listAnalytics = function(deal){
        console.log(deal);
        
        if($rootScope.analyticsFlag!=true){

            var start = new Date(deal.startTime);
            var startDate = moment(start.getTime()).format('YYYYMMDD');
            var end = new Date(deal.endTime);
            var endDate = moment(end.getTime()).format('YYYYMMDD');

            if(!angular.isUndefined(deal.analytics)){
                if(angular.isUndefined(deal.analytics.listAnalytics) ){
                    $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/listAnalytics').set(1);
                    $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/listAnalytics').set(1);
                }else{

                    var incrementData = deal.analytics.listAnalytics+1;
                    $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/listAnalytics').set(incrementData);
                    $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/listAnalytics').set(incrementData);
                }
            }else{
                $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/listAnalytics').set(1);
                $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/listAnalytics').set(1);
            }

            //mixpanel.track(deal.locName, {"Click": "List detail"});
            mixpanel.track("List Click", {"Email": $rootScope.userAuthEmail});
            console.log("List Detail Click");
                        console.log(deal);
            
            //firebase analytics
            window.FirebasePlugin.logEvent("select_content", {content_type: "deal_view", item_id: "list-click"});
        }
	};
    
    
    
    
    $scope.iconAnalytics = function(deal){
       
        console.log(deal);
        if($rootScope.analyticsFlag!=true){

            var start = new Date(deal.startTime);
            var startDate = moment(start.getTime()).format('YYYYMMDD');
            var end = new Date(deal.endTime);
            var endDate = moment(end.getTime()).format('YYYYMMDD');

            if(!angular.isUndefined(deal.analytics)){
                if(angular.isUndefined(deal.analytics.iconAnalytics) ){
                    $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/iconAnalytics').set(1);
                    $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/iconAnalytics').set(1);
                }else{

                    var incrementData = deal.analytics.iconAnalytics+1;
                    $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/iconAnalytics').set(incrementData);
                    $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/iconAnalytics').set(incrementData);
                }
            }else{
                $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/iconAnalytics').set(1);
                $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/iconAnalytics').set(1);
            }

            mixpanel.track("Map Click", {"Email": $rootScope.userAuthEmail});
            console.log(deal);
        }
	};
      
    
         $scope.trackAd = function(ad){
           console.log('in trackad');

            if(!angular.isUndefined(ad.clicks)){
                ad.clicks = ad.clicks + 1;
                $rootScope.mealsteals.child('/popupAdDeals/' + ad.key + '/clicks').set(ad.clicks); 

            }else{
                console.log('creating click');
                $rootScope.mealsteals.child('/popupAdDeals/' + ad.key + '/clicks').set(1); 
            }
                   
         };
    
    
  /*******************************************************************************
        FEATURES
    ********************************************************************************/
    
    
    // Timeshift drawer
    $scope.toggleDrawer = function(handle) {
        $ionDrawerVerticalDelegate.$getByHandle(handle).toggleDrawer();
    }

    $scope.drawerIs = function(state) {
        return $ionDrawerVerticalDelegate.getState() == state;
    }
    
    
    // Timeshift slider
    $scope.data = {};
    $scope.data.timeSelection = 0;
    $scope.timeAdjusted = 'no';
    $scope.timeAdjustedBy = '0';
    $scope.timer = true;
    
    $scope.timerChange = function() {
    console.log('Timer Change', $scope.timer.checked);
    };
    $scope.timer = { checked: true };
    
    // This will pass data to timeshift fucntion.  The slider passes data.timeSelection into the timeshift function, and then the data.timeSelection is saved as timeAdjustedBy.  This was done to keep an active log on what the timeshift is relative to true time. 
    
    
    $scope.setNewTime = function(){
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Time Surf", {"Email": $rootScope.userAuthEmail});
        }
        if ($scope.data.timeSelection > 0){
            Timestamp.setTimeShift($scope.data.timeSelection);
            $scope.timeAdjusted = 'yes';
            $scope.timeAdjustedBy = $scope.data.timeSelection;
            $scope.showLoading();
            
            $timeout(function(){
				          		//Location.forceRefresh();
                                $scope.grabTodaysDeals();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
            $timeout(function(){
                            if($scope.deals.length>0){
				          		$scope.timePopupAlert();
                            }
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
            $scope.dealLimit = 20;
        } else {
            Timestamp.setTimeShift(0);
            $scope.timeAdjusted = 'no';
            $scope.timeAdjustedBy = $scope.data.timeSelection;
            $scope.showLoading();
            $timeout(function(){
				          		//Location.forceRefresh();
                                $scope.grabTodaysDeals();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
            $timeout(function(){
                                if($scope.deals.length>0){
				          		$scope.timePopupAlert();
                                }
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
            $scope.dealLimit = 20;
        }
    }
    
   
    
    $scope.resetTime = function(){
        $scope.data.timeSelection = 0;
    }
    
    /* secret data functionality */
	$scope.holding = false;
	$scope.holdDataButton = function(){
		$scope.holding = true;
		$timeout(function(){
			if ($scope.holding==true){
                //$scope.toggleDrawer('data');
                $scope.modalChangeLocation.show();
			}
		},6000);
	};
	$scope.releaseDataButton = function(){
		$scope.holding = false;
	};
    
    $ionicModal.fromTemplateUrl('templates/location.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modalChangeLocation = modal;
      });
    
    
      $scope.openChangeLocation = function(){
        $scope.modalChangeLocation.show();
        $rootScope.doMapResize = true;

      };

      $scope.closeChangeLocation = function(){
        $scope.modalChangeLocation.hide();  
      };
    
    $scope.realGps = function() {
        $scope.showLoading();
        delete $rootScope.gps;
        Location.forceRefresh($scope.centerOnMe);
        $scope.chooseAd();
    };
    
    $scope.milwaukeeLoc = function() {
        $rootScope.gps = {'lat': cities['Milwaukee'].loc[0], 'lon': cities['Milwaukee'].loc[1]};
        $scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
        Location.forceRefresh();  
        $scope.chooseAd();
    };
    
    $scope.madisonLoc = function() {
        $rootScope.gps = {'lat': cities['Madison'].loc[0], 'lon': cities['Madison'].loc[1]};
        $scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
        Location.forceRefresh();  
        $scope.chooseAd();
    };
    
    $scope.chicagoLoc = function() {
        $rootScope.gps = {'lat': cities['Chicago'].loc[0], 'lon': cities['Chicago'].loc[1]};
        $scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
        Location.forceRefresh();  
        $scope.chooseAd();
    };
    
    $scope.submitLocation = function(lat,lon) {
        $rootScope.gps = {'lat': lat, 'lon': lon};
        $scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
        Location.forceRefresh();
        $scope.chooseAd();
    };
	
    $scope.storeSearch = function(){
    };
    
    //refresh
    $scope.doRefresh = function() {
    $timeout(function(){
            Location.forceRefresh();
        },0); // wait 2 seconds because timestamps only update on a 1-second interval
    $scope.$broadcast('scroll.refreshComplete'); 
    };
    
    $scope.favoritesCheck = function(){
        
        if(angular.isUndefined($rootScope.currentUser)){
            $scope.promptLogin();
        }
    }
    
    // .fromTemplate() method
      var template = '<ion-popover-view><ion-header-bar> <h1 class="title">My Popover Title</h1> </ion-header-bar> <ion-content> Hello! </ion-content></ion-popover-view>';

      $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
      });
    

      // .fromTemplateUrl() method
      $ionicPopover.fromTemplateUrl('flag-popover.html', {
        scope: $scope
      }).then(function(popover) {
        $scope.popover = popover;
      });


      $scope.openPopover = function($event) {
        $scope.popover.show($event);
      };
      $scope.closePopover = function() {
        $scope.popover.hide();
      };
      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.popover.remove();
      });
      // Execute action on hide popover
      $scope.$on('popover.hidden', function() {
        // Execute action
      });
      // Execute action on remove popover
      $scope.$on('popover.removed', function() {
        // Execute action
      });
    
    // Trigger flag or redeem data will be populated
    $scope.flagPopoverClicked = 'no';
    $scope.redeemPopoverClicked = 'no';
    
    $scope.flagPopover = function(){
         $scope.flagPopoverClicked = 'yes';
    };
    
    $scope.redeemPopover = function(){
         $scope.redeemPopoverClicked = 'yes';
    };
    
    $scope.closePopoverReset = function(){
        $scope.flagPopoverClicked = 'no';
        $scope.redeemPopoverClicked = 'no';
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

    
    /*  */
//    
//     $scope.currentLocation = Location.currentLocation();
//    
//        $scope.currentLocation = [parseFloat($scope.currentLocation[0]), parseFloat($scope.currentLocation[1])];
    
      $scope.distAway = function(loc){
        if(!angular.isUndefined($scope.currentLocation) && 
           !angular.isUndefined(loc[0]) &&
           !angular.isUndefined(loc[1])){
        var distance = GeoFire.distance([parseFloat(loc[0]),parseFloat(loc[1])],$scope.currentLocation);
            
    	return distance;
        }
    };
    
    if(!angular.isUndefined($rootScope.authUserData)){
        $rootScope.busArray.$loaded(function(bus){
        $scope.busObj = bus;
        });
    
      var favRef = $rootScope.userFB.child('/favorites/deals/');
      $scope.favorites = $firebaseObject(favRef);
        //console.log($scope.favorites);
      var query = favRef.orderByChild("locName");
 
        console.log($scope.favorites);
      var folRef = $rootScope.userFB.child('/favorites/businesses/');
      $scope.following = $firebaseObject(folRef);
        //console.log($scope.following);
      var query = folRef.orderByChild("locName");

        console.log($scope.following);
      var checkInRef = $rootScope.userFB.child('/checkIns/');
      $scope.checkIns = $firebaseArray(checkInRef);
        //console.log($scope.checkIns);
      var query = folRef.orderByChild("locName");
        
    }else{
//        
//        $rootScope.businessesFB.once("value")
//              .then(function(snapshot) {
//                $scope.busObj = snapshot;
//                $scope.favorites = snapshot;
//                $scope.following = snapshot;
//                $scope.checkins = snapshot;
//            });
//        
        $scope.busObj = [];
        $scope.favorites = [];
        $scope.following = [];
        $scope.checkins = [];
        
        $rootScope.busArray.$loaded(function(business){
//            $rootScope.busFB.forEach(function(bus){
//                $scope.busObj.push(bus);
//                $scope.favorites.push(bus);
//                $scope.following.push(bus);
//                $scope.checkins.push(bus);
//            });
        $scope.busObj = business;
        $scope.favorites = business;
        $scope.following = business;
        $scope.checkins = business;
        });
    }
    
	$scope.distanceSort = function(d) {
       //console.log('in distance sort');
        if(!angular.isUndefined(d.lat) && !angular.isUndefined(d.lon)){
            //var distance = (Math.round($scope.kmToMile(GeoFire.distance([d.lat, d.lon], Location.currentLocation()))*10)/10) + ' mi';

	       return $scope.distAway([d.lat, d.lon]);
        }
	};
 
     /* $scope.filterPatio = function(showPatio){
 		return function(d){
 			if (showPatio==false) return true;
 			if (d.patio==true) return true;
 			return false;
 		}
 	};*/
    
    $scope.favoritesSort = function(d) {
        if(!angular.isUndefined($rootScope.authUserData)){
                if(!angular.isUndefined($rootScope.currentFavs.businesses)){
                    if(!angular.isUndefined($rootScope.currentFavs.businesses[d.$id])) return true;
                }
        }
    };
    
    $scope.userLocation = function(userAddress, userLat, userLon, userCity){
        console.log(userAddress, userLat, userLon, userCity);  
        $rootScope.busArray.$loaded(function(bus){
            $scope.busObj = bus;
            console.log($scope.busObj.length);
        });
        if ($rootScope.analyticsFlag!=true){
            mixpanel.track("Explore Tab", {"Email": $rootScope.userAuthEmail});
            window.FirebasePlugin.setScreenName("Explore");
            window.FirebasePlugin.logEvent("select_content", {content_type: "page_view", item_id: "Explore"});
        }
       /* if(typeof analytics !== undefined) { 
            analytics.trackView("Explore Tab");
            console.log('explore tab GA');
        }*/
//        return function(d){
//            if (d.city==userCity) return true;
//        }
       
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
    if ($rootScope.analyticsFlag!=true){
          mixpanel.track("explore", {"Email": $rootScope.userAuthEmail});
    }
    console.log($rootScope.gps);
    $scope.modalExplore.show();
    $rootScope.doMapResize = true;
    
  };
    
  $scope.exploreDeals = function(biz){
      if ($rootScope.analyticsFlag!=true){
          mixpanel.track("explore deals", {"Email": $rootScope.userAuthEmail});
          }
      //$scope.modalExploreDeals.show();
      $rootScope.$broadcast('business-detail', biz);
  };
    
  $scope.closeExplore = function(){
    $scope.modalExplore.hide();  
  };
    
  $scope.closeExploreDeals = function(){
    $scope.modalExploreDeals.hide();  
    $rootScope.doMapResize=true;
  };    
    
  var favPopup;
    
  $scope.openFavPopup = function(){
            favPopup = $ionicPopup.show({
              cssClass: 'events-popup',
              //okText: 'Close',
              scope: $scope,
              templateUrl: 'templates/fav-popup.html',
         });
     };
    $scope.closeFavPopup = function() {
        favPopup.close();
    };    
    
  $scope.followBusiness = function(business){
      $scope.glow = true;
      $timeout(function(){
          $scope.glow = false;
      }, 2000);
         
     if(!angular.isUndefined($rootScope.authUserData)){  
        if(!angular.isUndefined($rootScope.currentFavs) &&
           !angular.isUndefined($rootScope.currentFavs.businesses)){
            if(!angular.isUndefined($rootScope.currentFavs.businesses[business.$id])){
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

    if($scope.favoriteBus == false){
      if(!angular.isUndefined($rootScope.authUserData)){  

        $rootScope.addFavBus(business.$id, $rootScope.busFB[business.$id]);
        $scope.favoriteBus = true;
        $ionicPopup.alert({
                        title: '<div><i class="ion-heart"></i><div><div class="popup-title-generic">Favorited '+business.businessName+'</div>',
                        cssClass: 'generic-popup generic-alert',
                        buttons: [
                      {
                        text: 'OK',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          $scope.popover.hide();
                        }
                      }]
                });
      }else{
          $scope.promptLogin();
      }
    }else{
        $rootScope.removeFavBus(business.$id);
        $scope.favoriteBus = false;
         $ionicPopup.alert({
                        title: '<div><i class="ion-heart-broken"></i><div><div class="popup-title-generic">Unfavorited '+business.businessName+'</div>',
                        cssClass: 'generic-popup generic-alert',
                        buttons: [
                      {
                        text: 'OK',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          $scope.popover.hide();
                        }
                      }]
                });
        
    }
        
      
   
   };
       
       
    $scope.favCheck = function(biz){
      
        if(!angular.isUndefined($rootScope.authUserData)){
//            $rootScope.currentFavs.$loaded(function(business){
                if(!angular.isUndefined($rootScope.currentFavs.businesses)){
                    if(!angular.isUndefined($rootScope.currentFavs.businesses[biz.$id])){
                        return true;
                    }else{
                        return false;
                       }
                }
//            });
        }else{
            return false;
        }
    };
    
  $scope.exploreBusiness = function($id, business){
      
      if(!angular.isUndefined($rootScope.currentUser) &&
         !angular.isUndefined($rootScope.currentUser.favorites) &&
         !angular.isUndefined($rootScope.currentUser.favorites.businesses) &&
         !angular.isUndefined($rootScope.currentUser.favorites.businesses[$id])){ 
        var follow = "Unfollow";
      }else{
          var follow = "Follow";
      }
      
    var myPopup = $ionicPopup.show({
        title: business.businessName,
        scope: $scope,
        cssClass: 'explore-popup',
        buttons: [
          {
            text: follow,
            onTap: function(e) { 
                
              if(!angular.isUndefined($rootScope.authUserData)){
                  if(follow == 'Follow'){
                    console.log(business.$id);
                    console.log(business);
                    $rootScope.addFavBus(business.$id, $rootScope.busFB[business.$id]);
                    $ionicPopup.alert({
                        title: '<div><i class="ion-heart"></i><div><div class="popup-title-generic">Favorited '+business.businessName+'</div>',
                        cssClass: 'generic-popup generic-alert',
                        buttons: [
                      {
                        text: 'OK',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          $scope.popover.hide();
                        }
                      }]
                });
                  }else{
                      $rootScope.removeFavBus(business.$id);
                      $ionicPopup.alert({
                        title: '<div><i class="ion-heart-broken"></i><div><div class="popup-title-generic">Unfavorited '+business.businessName+'</div>',
                        cssClass: 'generic-popup generic-alert',
                        buttons: [
                      {
                        text: 'OK',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          $scope.popover.hide();
                        }
                      }]
                });
                  }
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
   
    
})

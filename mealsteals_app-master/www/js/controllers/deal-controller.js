angular.module('starter.controllers', [])


.controller('DealsCtrl', function(DealProcessor, Auth, Timestamp, $cordovaSocialSharing, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, Location, DealData, $ionicLoading, $location, $ionicPopover, $ionicActionSheet, $ionicModal, $compile, $q, $ionDrawerVerticalDelegate, $cordovaAppRate, PopupAds, $ionicHistory, $state, $ionicScrollDelegate, $cordovaNativeStorage) {
     
	// Firebase location and geofire object
	var firebaseRef = new Firebase('https://mealsteals.firebaseio.com');
	var geoFire = new GeoFire(firebaseRef.child('/dealGeoFireKeys'));
    var eventsRef = new Firebase("https://mealsteals.firebaseio.com/events");
    
    
    
          //  App loads stored
    $rootScope.$on('firstGPS', function(){
            var currentLoc = Location.currentLocation();

            var time = new Date();
            var stamp = time.getTime();
            var day = moment(time).format("YYYYMMDD");
            var loc = {};
            loc['lat'] = currentLoc[0];
            loc['lon'] = currentLoc[1];

            
            if($rootScope.analyticsFlag == false){
                $rootScope.mealsteals.child('/adminAnalytics/appLoads/' + day + "/" + stamp).set(loc);
                if(!angular.isUndefined($rootScope.userFB)){
                    $rootScope.userFB.child('/location/').set(currentLoc);
                }
                console.log('in app load counter');
            }

    });
    
    
     // Hack to resize map after modal ruins the sizing, add $rootScope.doMapResize = true; after every hide modal.  Probably an awful way of doing this, should be fixed at some point.

    $scope.$on('$ionicView.afterEnter', function() {
        if ($rootScope.doMapResize==true){
            ionic.trigger('resize');
            console.log('map resize')
        } else {
        console.log('no map resize');
        }
    });  

    //tell the system which active state, since there are at least two different controllers running at any given time there currently isn't an accurate way to determine this.  This should be added in the three main views.  It will be attached to a button in AppCtrl as well.  
    $rootScope.activeState = 'deals';
    console.log("Active State: "+$rootScope.activeState);
    
    if (!angular.isUndefined($rootScope.currentUser)) {
        $rootScope.currentUser.$loaded(function(data){
            if(!angular.isUndefined(data.username)){
                var timestamp = new Date().getTime();
                if($rootScope.analyticsFlag == false){
                    $rootScope.userFB.child('/logins/' + timestamp).set(timestamp);
                    mixpanel.track("User Logged In", {"Username": data.username});
                }
            }
        });
    }
  
    $scope.chooseAd = function(){
      
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
    
        var nowTime = parseInt(moment(time).format('HHMMSS'));



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
          Object.keys(snapshot).forEach(function (childSnapshot) {
            var childData = snapshot[childSnapshot];
            //console.log(childData);
            childData['key'] = childSnapshot;
            var currentLocation = Location.currentLocation();
            var distanceAway = GeoFire.distance([childData.lat, childData.lon], currentLocation);

            var endTime = new Date(childData.endTime);



            var dealEnd = parseInt(moment(endTime).format('HHMMSS'));


            if(dealEnd < 30000 && nowTime > 30000 ){
                dealEnd = dealEnd + 240000;
            }

	          // && distanceAway < 30
	          if(distanceAway < 30 && childData.daysOfWeek[todayDay] == "yes"){
	              if(!angular.isUndefined(childData.daysOfWeek)){
	              	if(nowTime < 30000) {
	              		if (dealEnd < 30000) {
	              			featDealsArry.push(childData);
	              		}
	              	}
                  else if ( dealEnd > nowTime ) {
                    featDealsArry.push(childData);
                  }
	              }
	          }

          });
          if (featDealsArry.length > 0) {

            randDealIndex = Math.floor(Math.random() * featDealsArry.length);
            console.log(randDealIndex);
            var thisAd = featDealsArry[randDealIndex];
              $scope.todayAd = thisAd;
              if (thisAd.impressions > 0) {
                var newImpressions = thisAd.impressions - 1;
                
                  
             
                  
                  
                $rootScope.mealsteals.child('/popupAdDeals/' + thisAd.key).update({impressions:newImpressions}); 
                if (newImpressions < 1 && newImpressions > -9){
                    //$rootScope.mealSteals.child('/popupAdDeals/' + thisAd.key).update({impressions:newImpressions}); 
                    $rootScope.mealsteals.child('/popupAdDeals/' + thisAd.key).set(null);
                }
              }
            $scope.serveAd(thisAd);  
          }
            $scope.trackAd();
       }); 
    };
    
    $scope.serveAd = function(thisAd){
            $rootScope.thisAd = thisAd;
            if(angular.isUndefined($rootScope.usernameFlag)){
            var alertPopup = $ionicPopup.alert({
             cssClass: 'popup-ad',
             okText: 'X',
             templateUrl: 'templates/popup-ad.html',
            });
        }
    };

    $rootScope.$on('firstGPS', function(){ 
        $scope.chooseAd();
	});
    
    
	/* show message until user has clicked it once in lifetime */
	$scope.hasSeenTimeShiftBefore = 'yes';
	if(window.localStorage['hasSeenTimeShiftBefore']){
		// do nothing
	} else {
		$scope.hasSeenTimeShiftBefore = 'no';
	}
	/*$scope.clickedClockButton = function(){
		if ($scope.deals.length > 0){
			$scope.hasSeenTimeShiftBefore = 'yes';
			window.localStorage['hasSeenTimeShiftBefore'] = 'yes';
		}	
	}*/
    
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
    };
    

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

	// Use these to show/hide the loading spinner
	$scope.showLoading = function() {
    	$ionicLoading.show({
	      template: "<img src='img/rotating.png' class='spinner' style='height:60px;width:auto;opacity: 0.7;'/>",
	      duration: 7000
	    });
	};

  	// Set some initial variables
  	$scope.fuHeight=window.innerHeight;
	$scope.fuWidth=window.innerWidth;
	$scope.inputWidth = Math.round($scope.fuWidth / 1.6);
	$scope.inputMargin = Math.round((($scope.fuWidth-$scope.inputWidth) / 2) / 1);

	// Show loading spinner until geoquery has initialized
	$scope.showLoading();
	$rootScope.$on('firstGPS', function(){
		initialize(); // google map init
		//alert('firstGPS');
	});

	// Initial state for filtering tabs, sorting, and display type (map/list)
	$rootScope.filterOptions = {'categoryTab':'all', 'filterTo':'all', 'searchVal':'', 'featuredOnly':'no'};
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

	$scope.distanceSort = function(d) {
	   return $scope.distAway([d.lat, d.lon]);
	};

    $scope.ratingSort = function(d) {
        return -(d.totalRating);
	};
    
    $scope.boostSort = function(d) {
        if(d.boost) {return 1};
	};
    
    $scope.featuredFilter = function(d){
		if ($scope.timestamp > d.startTime && $scope.timestamp < d.endTime && d.totalRating > 3) return true;
		return false;
	};
    
    
	$scope.expiredFilter = function(d){
		if ($scope.timestamp > d.startTime && $scope.timestamp < d.endTime) return true;
		return false;
	};
    
    $scope.mapTabSelected = function() {
    
    };
    
    $scope.listTabSelected = function() {
        $scope.listToMap = false;
    };
    
    $scope.eventTabSelected = function() {
    };

	// Filter function for top row of tabs in app
	$scope.topTabFilter = function(categoryTab){
		return function(d){
			if (categoryTab=='all') return true;
            // add favorites call here
            
            
            if(!angular.isUndefined($rootScope.currentFavs.deals) && !angular.isUndefined($rootScope.currentFavs.businesses)){
                 if (categoryTab=='favorite' && (!angular.isUndefined($rootScope.currentFavs.deals[d.recurringDealID]) || !angular.isUndefined($rootScope.currentFavs.businesses[d.businessID]))) return true;
            }else if(!angular.isUndefined($rootScope.currentFavs.deals)){
                if (categoryTab=='favorite' && (!angular.isUndefined($rootScope.currentFavs.deals[d.recurringDealID]))) return true;
            }else if(!angular.isUndefined($rootScope.currentFavs.businesses)){
                if (categoryTab=='favorite' && (!angular.isUndefined($rootScope.currentFavs.businesses[d.businessID]))) return true;
            }else{
                if (categoryTab=='favorite') return false;
            }
            
            if (categoryTab=='featured' && (d.featured=='yes')) return true;
            if (categoryTab=='exclusive' && (d.exclusive=='yes')) return true;
            if (categoryTab=='events' && (d.timeType=='event')) return true;
			if (categoryTab=='food' && (d.foodOrDrink == 'food' || d.foodOrDrink == 'both')) return true;
			if (categoryTab=='drinks' && (d.foodOrDrink == 'drink' || d.foodOrDrink == 'both')) return true;
			return false;
		}
	};
    
    $scope.filterPosition = 0;
    $scope.getScrollPosition = function(){
       $scope.filterPosition = $ionicScrollDelegate.$getByHandle('filter').getScrollPosition().left; 
        console.log($scope.filterPosition);
    };
    
    // Only loads 10 list items until user scrolls to improve load time
    $scope.limitList = 10;
    
    $scope.listPosition = 0;
    $scope.getListPosition = function(){
        $scope.listPosition = $ionicScrollDelegate.$getByHandle('list').getScrollPosition().top; 
        //console.log($scope.listPosition);
        if ($scope.listPosition > 20){
            $scope.limitList = 9999;  
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
	$scope.go = function(path, delay){
		if (delay){
			$timeout(function(){
				$location.path(path);
			}, delay);
		} else {
			$location.path(path);
            
		}       
	};

	// var searchBoxInterval = null;
	$rootScope.searchBoxSubmit = function($event){
		// if (searchBoxInterval !== null){ $timeout.cancel(searchBoxInterval); searchBoxInterval = null; }
		// if ($scope.filterOptions.searchVal.trim() == '') return;
		$scope.clearAndAddMarkers();
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

    
    $scope.loadFutureEvents = function(){
        $scope.futureEvents = $firebaseArray(eventsRef);
        // create a query for the most recent 25 messages on the server
        var query = eventsRef.orderByChild("timestamp");
        // the $firebaseArray service properly handles database queries as well
        $scope.filteredEvents = $firebaseArray(query);
        //var emaiObject = new GeoFire(firebaseRef.child('/emails'));
    
    };
 
	$rootScope.$on('dealsNearMeChanged', function(){
        $scope.showLoading();
		$scope.deals = [];
		$scope.topRated = [];
        $scope.events = [];
		$scope.dealKey_index = {};
		var promises = [];
		Location.getDealsNearMe().forEach(function(key){
			promises.push(DealData.fetch(key));
		});

		$q.all(promises).then(function(allFetchedDeals){
            
			allFetchedDeals.forEach(function(data){
				if (data && $rootScope.dataError !== true){
					if ($scope.timestamp > data.startTime && $scope.timestamp < data.endTime){
                      
                        if(angular.isUndefined(data.boost)){
                            //console.log(data);
                            if(!angular.isUndefined($rootScope.recurringObj[data.recurringDealID].boosts) && 
                               $rootScope.recurringObj[data.recurringDealID].boosts > 0){
                                
                                var newTotal = parseInt($rootScope.recurringObj[data.recurringDealID].boosts) - 1;
                                
                                $rootScope.mealsteals.child('/recurringDeals/' + data.recurringDealID + '/boosts').set(newTotal);
                                $rootScope.mealsteals.child('/deals/' + data.key + '/boost').set(true);
                                console.log("boosting deal");
                                console.log($rootScope.recurringObj[data.recurringDealID]);
                                console.log(data);
                            }
                        }
                        
                        
						$scope.deals.push(data);
						if(data.totalRating >= 3.5 || data.boost==true) { $scope.topRated.push(data) };
                        if(data.timeType=='event') { $scope.events.push(data) };
					} else if (data.endTime < $scope.timestamp) {
  						//geoFire.remove(data.key);
					} else {
						var s = '(' + moment(data.startTime).format('M-D-YY HH:mm') + ')';
						var c = '(' + moment($scope.timestamp).format('M-D-YY HH:mm') + ')';
						var e = '(' + moment(data.endTime).format('M-D-YY HH:mm') + ')';
					}     
                    
				}	
			});

			DealProcessor.Process($scope.deals).then(function(filteredDeals){
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
			});
				
		});
	});

	var mapMarkers = [];
	var lastInfoWindow = null;
	var currentLocationMarker = null;

	$rootScope.clearAndAddMarkers = function(){
        
        var sortArray = $scope.deals;
        
        sortArray.sort(function(a) {
            if ( a.recurringDealID == undefined )
                return -1;
            if ( a.recurringDealID != undefined )
                return 1;
            return 0;
        });
        
        
        
        
		// this triggers when we change a filter
		// we need to know so we can update the map accordingly

		// We fake a loading screen for a particular reason. It is far easier to apply filter changes by
		// removing all map markers and re-adding only the relevant markers. Instead of seeing a screen
		// flash/blip, we fake a 1 second loading which is more visually pleasing
			// $scope.showLoading();
			    clearMapMarkers();
				addMapMarkers();
				$ionicLoading.hide();
				if ($scope.deals.length==0){
                    
          //wait for popup to be closed before message is shown
                    
					// determine what message to show
					var currentLoc = Location.currentLocation();
					if ($rootScope.gps && $rootScope.gps.lat && $rootScope.gps.lon) currentLoc = [$rootScope.gps.lat, $rootScope.gps.lon];
					var likelyCity = identifyCity(currentLoc);
					var message = '';
					if (likelyCity==null){
						message = 'We have not launched in your city yet!'
					} else {
						if (cities[likelyCity]['stage'] == 'active'){
							message = 'Check back later today or press the clock to jump to a new time!';
                            $ionicPopup.alert({
                             title: 'No Active Deals',
                             template: '<center>'+message+'</center>'
				   });
						} else if (cities[likelyCity]['stage'] == 'error'){
                            if($rootScope.analyticsFlag == false){
                                mixpanel.track("App Load", {"GPS Error": "controller"});
                            }
							$ionicPopup.prompt({ 
   									title: 'GPS error',
                                    subTitle: 'Please ensure your GPS is enabled',
   									//template: 'Could not get location',
   									inputType: 'zipcode',
   									inputPlaceholder: 'Zip code',
                                    cssClass: "gps-error-popup"
 										}).then(function(res) {
												var lat = '';
    											var lng = '';
    											var address = res;
    											var geocoder= new google.maps.Geocoder();
    									geocoder.geocode( { 'address': address}, function(results, status) {
      										if (status == google.maps.GeocoderStatus.OK) {
         										lat = results[0].geometry.location.lat();
        										lng = results[0].geometry.location.lng();
         

 												$rootScope.gps = {'lat': lat, 'lon': lng};
              									$scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
              									Location.forceRefresh();
                                $scope.chooseAd();
            								    } 
    								});

							});
						}
					}
				}
   
	};
    
    
    
	var addMapMarkers = function(){

		var locName_infoWindow = {};
        
        
        $scope.deals.forEach(function(e){
                 
            $scope.thisDeal = e;
            
            var tracking_key = String(e.lat) + String(e.lon);
            
        	var topFilterPass = ($scope.topTabFilter($scope.filterOptions.categoryTab))(e);
        	var bottomFilterPass = ($scope.bottomSheetFilter($scope.filterOptions.filterTo))(e);
        	var searchValuePass = ($scope.searchValueFilter($scope.filterOptions.searchVal))(e);
        	var featuredPass = ($scope.featuredFilter($scope.filterOptions.featuredOnly))(e);
        	if (topFilterPass==false || bottomFilterPass==false || searchValuePass==false || featuredPass==false) return;

        	var loc = new google.maps.LatLng(e.lat,e.lon);
            
        	var userLocation = Location.currentLocation();

        	var distance = (Math.round($scope.kmToMile(GeoFire.distance([e.lat, e.lon], userLocation))*10)/10) + ' mi';
            
            if (e.recurringDealID == undefined){
                var icon = {
                url: 'img/flamegif.gif',
                scaledSize: new google.maps.Size(20, 50), // scaled size
                };
                
            } else if (e.boost == true){
                var icon = {
                url: e.icon,
                scaledSize: new google.maps.Size(55, 55),// scaled size
                };
            
            }   else {
                var icon = {
                url: e.icon,
                scaledSize: new google.maps.Size(40, 40),// scaled size
                };
            }
            if ($scope.timeAdjusted == 'yes'){    
                if (e.recurringDealID == undefined){
                    var content = "<div style='width:250px;height:130px;'>" +
                                      "<div style='height:30px;text-align:center;font-weight:900;padding-top:3px;font-size:16px;'><span>FLASH DEAL!</span></div>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px;'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                            "<div style='width:180px;overflow:hidden;'><span>{{"+e.startTime+" | date : 'shortTime'}} - {{"+e.endTime+" | date : 'shortTime'}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                  "</div>";
                } else {
                    var content = "<div style='width:250px;height:100px;'>" +
                                    "<div style='display:inline-block;height:60px;'>" +
                                            "<img src='" + e.dealFullImage +"' style='width:58px;height:58px;'>" + 
                                    "</div>" +
                                    "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                        "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                        "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                        "<div style='width:180px;overflow:hidden;'><i ng-show='timer.checked==true' class='icon ion-ios-clock-outline' style='color:red;'></i> <span ng-show='timer.checked==true' style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span><span ng-show='timer.checked==false'>{{"+e.startTime+" | date : 'shortTime'}} - {{"+e.endTime+" | date : 'shortTime'}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                    "</div>" +
                                    "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                  "</div>";
                }        
            } else {
                if (e.recurringDealID == undefined){
                    var content = "<div style='width:250px;height:130px;'>" +
                                      "<div style='height:30px;text-align:center;font-weight:900;padding-top:3px;font-size:16px;'><span>FLASH DEAL!</span></div>" +
                                        "<div style='display:inline-block;height:60px;'>" +
                                                "<img src='" + e.dealFullImage +"' style='width:58px;height:58px;'>" + 
                                        "</div>" +
                                        "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                            "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                            "<div style='width:180px;overflow:hidden;'><i class='icon ion-ios-clock-outline' style='color:red;'></i> <span style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                        "</div>" +
                                        "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                  "</div>";
                } else {
                    var content = "<div style='width:250px;height:100px;'>" +
                                    "<div style='display:inline-block;height:60px;'>" +
                                            "<img src='" + e.dealFullImage +"' style='width:58px;height:58px;'>" + 
                                    "</div>" +
                                    "<div style='display:inline-block;height:60px;padding-left:7px;'>" +
                                        "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
                                        "<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
                                        "<div style='width:180px;overflow:hidden;'><i class='icon ion-ios-clock-outline' style='color:red;'></i> <span style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
                                    "</div>" +
                                    "<button ng-click='mapAnalytics(\""+e.key+"\"); go(\"/deals/"+e.key+"\") ' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
                                  "</div>";
                }        
            }
            if (tracking_key in locName_infoWindow){
            content = content.replace(e.locName, 'Also...');
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
                      map: $scope.map,
                      icon: icon,
                      //labelClass: "hide",
                      zIndex:9999,
                      optimized: false,

                    });
                } else if (e.boost == true){
                    var marker = new google.maps.Marker({
                      position: loc,
                      map: $scope.map,
                      icon: icon,
                      zIndex:9999,
                    });
                } else {
                    var marker = new google.maps.Marker({
                      position: loc,
                      map: $scope.map,
                      icon: icon,
                    });
                }
                
                // need to somehow figure out how to determine if map isn't working
                /*google.maps.event.addListener(map, "idle", function(){
                    alert('idle');
                    google.maps.event.trigger(map, 'resize'); 
                });*/

			    google.maps.event.addListener(marker, 'click', function() {
			      if (lastInfoWindow !== null) lastInfoWindow.close();
			      lastInfoWindow = infowindow;
			      infowindow.open($scope.map,marker);
                 
                    
                    if($rootScope.analyticsFlag == false){
                        //mixpanel analytics
                        mixpanel.track(e.locName, {"Click": "Map Icon"});
                        mixpanel.track("Map Icon", {"Business": e.locName});
                        $scope.iconAnalytics(e);

                        if (e.featured=='yes'){
                            mixpanel.track(e.locName, {"Click": "Featured"});
                            mixpanel.track("Featured Map Icon", {"Business": e.locName});
                            $scope.featuredAnalytics(e);
                        }

                        if (e.boost=='yes'){
                            mixpanel.track(e.locName, {"Click": "Boosted"});
                            mixpanel.track("Boosted Map Icon", {"Business": e.locName});

                        }

                        if (e.recurringDealID == undefined){
                            mixpanel.track(e.locName, {"Click": "Flash Deal"});
                            mixpanel.track("Flash Deal", {"Business": e.locName});
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
            
            
                if($rootScope.analyticsFlag == false){
                    var deal = $firebaseObject($rootScope.mealsteals.child("/deals/" + dealID));
                    deal.$loaded(function(deal){

                            if(!angular.isUndefined(deal.analytics)){
                                if(angular.isUndefined(deal.analytics.mapAnalytics) ){
                                    $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/mapAnalytics').set(1);
                                }else{

                                    var incrementData = deal.analytics.mapAnalytics+1;
                                    $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/mapAnalytics').set(incrementData);
                                }
                            }else{
                                $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/mapAnalytics').set(1);
                            }

                        mixpanel.track(e.locName, {"Click": "Map detail"});
                        mixpanel.track("Map Detail Click", {"Business": deal.locName});
                        console.log("Map Detail Click");
                        console.log(deal);
                     });
                }
            };
                          

            
//            
//            Map Analytics
//            
//           
            
            
            
            
        });
    
		    
	};

	var clearMapMarkers = function(){
		mapMarkers.forEach(function(e){
			e.setMap(null);
		});
		mapMarkers = [];
	};

	function initialize() {
            $scope.showLoading();
            
            var pos = Location.currentLocation();
		    var loc = new google.maps.LatLng(pos[0],pos[1]);

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
	      map: $scope.map
	    });
        
        
    }
    
    $scope.refreshMap = function(){
        initialize();
        Location.forceRefresh();
    };
    
    $scope.refreshMapError = function(){
        initialize();
        Location.forceRefresh();
        if($rootScope.analyticsFlag == false){
            mixpanel.track("Map Load Error");
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
      	$ionicLoading.hide();
      	var loc = new google.maps.LatLng(pos[0],pos[1]);

		  // Ensure map marker is in the correct spot
		  if (currentLocationMarker !== null) currentLocationMarker.setMap(null);
		  currentLocationMarker = new google.maps.Marker({
	        position: loc,
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
    
    $scope.trackAppLoad = function(){
        var currentLoc = Location.currentLocation();
        if ($rootScope.gps && $rootScope.gps.lat && $rootScope.gps.lon) currentLoc = [$rootScope.gps.lat, $rootScope.gps.lon];
        var city = identifyCity(currentLoc);
        
        if($rootScope.analyticsFlag == false){
            if (city != undefined) {
                 console.log(city);
                 mixpanel.track("App Load", {"Active city": city});
            } else {
                console.log(currentLoc);
                mixpanel.track("App Load", {"Inactive city": currentLoc});
            }
        }
    };
    
    $rootScope.$on('app reload', function(){
		$scope.trackAppLoad();
        $scope.chooseAd();
        if($rootScope.analyticsFlag == false){
            if (city != undefined) {
                 console.log(city);
                 mixpanel.track("App Load", {"Active city": city});
            } else {
                console.log(currentLoc);
                mixpanel.track("App Load", {"Inactive city": currentLoc});
            }
        }
	});
    
    $scope.distAway = function(loc){
    	return GeoFire.distance(loc, Location.currentLocation());
    };

    $scope.eventToday = 1;
    
    $scope.eventTabClicked = function(){
        if($rootScope.analyticsFlag == false){
            mixpanel.track("Event Tab");
        }
    };
    
    $scope.boostClick = function(d){
        //console.log(d.locName);
        if($rootScope.analyticsFlag == false){
            mixpanel.track("Boost Click", {"Business": d.locName});
        }
    };
    $scope.topRatedClick = function(d){
        
        if($rootScope.analyticsFlag == false){
             if(!angular.isUndefined(deal.analytics)){
                 if(angular.isUndefined(deal.analytics.topRatedAnalytics) ){
                        $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/topRatedAnalytics').set(1);
                    }else{

                        var incrementData = deal.analytics.topRatedAnalytics+1;
                        $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/topRatedAnalytics').set(incrementData);
                    }
             }else{
                 $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/topRatedAnalytics').set(1);
             }

            mixpanel.track("Top Rated", {"Business": d.locName});
            console.log("top rated Click");
         }
    };
    
    $scope.topRatedTab = function(){
        if($rootScope.analyticsFlag == false){
            mixpanel.track("Top Rated Tab Clicked");
        }
    };
    
//   
//    
//    Analytics
//    
    
    $scope.listAnalytics = function(deal){
        
        if($rootScope.analyticsFlag == false){
               
                console.log("in list click");


                if(!angular.isUndefined(deal.analytics)){
                    if(angular.isUndefined(deal.analytics.listAnalytics) ){
                        $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/listAnalytics').set(1);
                    }else{

                        var incrementData = deal.analytics.listAnalytics+1;
                        $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/listAnalytics').set(incrementData);
                    }
                }else{
                    $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/listAnalytics').set(1);
                }

            mixpanel.track(deal.locName, {"Click": "List detail"});
            mixpanel.track("List Detail Click", {"Business": deal.locName});
            console.log("List Detail Click");
                        console.log(deal);
        }
	};
    
    
    
    
    $scope.iconAnalytics = function(deal){
       
        if($rootScope.analyticsFlag == false){
            console.log("in iconClick");


                if(!angular.isUndefined(deal.analytics)){
                    if(angular.isUndefined(deal.analytics.iconAnalytics) ){
                        $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/iconAnalytics').set(1);
                    }else{

                        var incrementData = deal.analytics.iconAnalytics+1;
                        $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/iconAnalytics').set(incrementData);
                    }
                }else{
                    $rootScope.mealsteals.child( '/deals/' + deal.key + '/analytics/iconAnalytics').set(1);
                }

            mixpanel.track("Map Click");
            console.log(deal);
        }
	};
      
    
         $scope.trackAd = function(){
                var time = new Date($scope.todayAd.startTime);
                var day = parseInt(moment(time).format("YYYYMMDD"));
                
                var thisDeal = $firebaseObject($rootScope.mealsteals.child('recurringDeals/' + $scope.todayAd.key)); // + '/deals/' + day
                  thisDeal.$loaded(function(deal){
                      console.log(deal);
                      console.log(deal.deals);
                      console.log(deal.deals[day]);

                      if(!angular.isUndefined(deal.deals) && !angular.isUndefined(deal.deals[day])){
                          $scope.dealAd = $firebaseObject($rootScope.mealsteals.child('deals/' + deal.deals[day]));  // + '/adsServed/'
                          $scope.dealAd.$loaded(function(served){
                              console.log(served);
                              if(!angular.isUndefined(served) && !angular.isUndefined(served.adsServed)){
                                  served.adsServed = parseInt(served.adsServed) + 1;
                                  $rootScope.mealsteals.child('deals/' + served.$id + '/adsServed/').set(served.adsServed);
                              }else{
                                  $rootScope.mealsteals.child('deals/' + served.$id + '/adsServed/').set(1);
                              }
                          });
                      }
                  });
         }
    
    
//   
//    
//    Analytics END
//    
    
    
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
        if ($scope.data.timeSelection > 0){
            Timestamp.setTimeShift($scope.data.timeSelection);
            $scope.timeAdjusted = 'yes';
            $scope.timeAdjustedBy = $scope.data.timeSelection;
            $scope.showLoading();
            
            $timeout(function(){
				          		Location.forceRefresh();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
            var alertPopup = $ionicPopup.alert({
            title: 'Time Changed',
            template: ''
            });
        } else {
            Timestamp.setTimeShift(0);
            $scope.timeAdjusted = 'no';
            $scope.timeAdjustedBy = $scope.data.timeSelection;
            $scope.showLoading();
            $timeout(function(){
				          		Location.forceRefresh();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
            var alertPopup = $ionicPopup.alert({
            title: 'Real-time',
            template: ''
            });
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
            var myPopup = $ionicPopup.show({
                title: 'Must be logged in to filter favorites.',
                scope: $scope,
                buttons: [
                  {
                    text: '<b>Cancel</b>',
                    onTap: function(e) {   
                      $scope.popover.hide();
                    }
                  },
                  {
                    text: '<b>Login</b>',
                    type: 'button-positive',
                    onTap: function(e) {

                      $scope.popover.hide();
                      
                        $state.go('app.account');
                    }
                  }
                ]
                });
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

    
})

angular.module('starter.controllers', [])

.controller('DealsCtrl', function(DealProcessor, Timestamp, $cordovaSocialSharing, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, Location, DealData, FakeDataPop, $ionicLoading, $location, $ionicActionSheet, $ionicModal, $compile, $q, $ionDrawerVerticalDelegate, $cordovaAppRate, PopupAds) {
    
   /* APP RATE

    document.addEventListener("deviceready", function () {
        
   var customLocale = {};
        customLocale.title = "Rate MealSteals";
        customLocale.message = "If you enjoy using %@, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!";
        customLocale.cancelButtonLabel = "No, Thanks";
        customLocale.laterButtonLabel = "Remind Me Later";
        customLocale.rateButtonLabel = "Rate It Now";

        AppRate.preferences.openStoreInApp = true;
        AppRate.preferences.storeAppURL.ios = '967099243';
        AppRate.preferences.storeAppURL.android = 'https://play.google.com/store/apps/details?id=com.mealstealsnew.mealstealsnew';
        AppRate.preferences.customLocale = customLocale;
        AppRate.preferences.displayAppName = 'MealSteals';
        AppRate.preferences.usesUntilPrompt = 1;
        AppRate.preferences.promptAgainForEachNewVersion = true;
        AppRate.promptForRating(false); 
        //If false is not present it will ignore usesUntilPrompt, promptAgainForEachNewVersion, and button logic, it will prompt every time.
    }); */

    
    
    
    
    // hack to resize map after modal ruins the sizing, still need to figure out resizing after backing out of deal detail
    $scope.$on('$ionicView.afterEnter', function() {
    ionic.trigger('resize');
    });
    
    
    
	// Firebase location and geofire object
	var firebaseRef = new Firebase('https://mealsteals.firebaseio.com');
	var geoFire = new GeoFire(firebaseRef.child('/dealGeoFireKeys'));
    var eventsRef = new Firebase("https://mealsteals.firebaseio.com/events");
    
    
    
    
    // Popup on load
    
    //var myArray = ['Bel Air', 'Scaffitis', 'Jacks']; 
    //var rand = myArray[Math.floor(Math.random() * myArray.length)];
    
    var alertPopup = $ionicPopup.alert({
    
     //title: 'Ad',
     cssClass: 'popup-ad',
     okText: 'X', // String (default: 'OK'). The text of the OK button.
     templateUrl: 'templates/popup-ad.html', // String (optional). The URL of an html template to place in the popup   body.
     //template: 'It might taste good'
     
    });
    
    console.log('Ad Served');

   alertPopup.then(function(res) {
     console.log('Ad Closed');
   });
    
    
       
        
    
    

	/* show message until user has clicked it once in lifetime */
	$scope.hasSeenTimeShiftBefore = 'yes';
    console.log($scope.hasSeenTimeShiftBefore);
	if(window.localStorage['hasSeenTimeShiftBefore']){
		// do nothing
	} else {
		$scope.hasSeenTimeShiftBefore = 'no';
	}
	$scope.clickedClockButton = function(){
		if ($scope.deals.length > 0){
			$scope.hasSeenTimeShiftBefore = 'yes';
			window.localStorage['hasSeenTimeShiftBefore'] = 'yes';
		}	
	}
    
    
    /* login controller/modals 
    
      // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
    
     end login controller/modals */
   

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

	/* end */

	$scope.upToDate = true;
	var thisVersion = '110';
	var outDatedVersions = $firebaseObject(firebaseRef.child('outDatedVersions'));
	var unwatch = outDatedVersions.$watch(function(){
		var badVersions = {};
		angular.forEach(outDatedVersions, function(v, k){
			badVersions[k] = true;
		});
		if (badVersions.hasOwnProperty(thisVersion)){
			$scope.upToDate = false;
			// $scope.$apply();
			console.log('outdated!');
		} else {
			$scope.upToDate = true;
			// $scope.$apply();
			console.log('up to date!');
		}
	});
	$scope.updateFlag = function(){
		unwatch();
		$scope.upToDate = true;
		$ionicPopup.alert({
	      title: 'Please Update',
	      template: 'New update available. Please visit the app store to apply this update now!'
	    });
	};

	/* secret button functionality */
	$scope.holding = false;
	$scope.holdSecretButton = function(){
		console.log('hold');
		$scope.holding = true;
		$timeout(function(){
			if ($scope.holding==true){
				// now pop up secret menu
				$ionicPopup.show({
					cssClass: "popup-vertical-buttons",
				    template: 'With great power comes great responsibility.',
				    title: 'Secret Menu',
				    subTitle: '',
				    scope: $scope,
				    buttons: [
				      {
				        text: '<b>Milwaukee</b>',
				        type: 'button-positive',
				        onTap: function(e) {
				            $rootScope.gps = {'lat': cities['Milwaukee'].loc[0], 'lon': cities['Milwaukee'].loc[1]};
							$scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
							Location.forceRefresh();
				        }
				      },
				      {
				        text: '<b>Boston</b>',
				        type: 'button-positive',
				        onTap: function(e) {
							$rootScope.gps = {'lat': cities['Boston'].loc[0], 'lon': cities['Boston'].loc[1]};
							$scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
							Location.forceRefresh();
				        }
				      },
				      {
				        text: '<b>Real GPS</b>',
				        type: 'button-positive',
				        onTap: function(e) {
							$scope.showLoading();
							delete $rootScope.gps;
							Location.forceRefresh($scope.centerOnMe);
				        }
				      },
				      {
				        text: '<b>Force Refresh</b>',
				        type: 'button-positive',
				        onTap: function(e) {
				        	$scope.showLoading();
				          	Location.forceRefresh();
				        }
				      },
				      
				      /*{
				        text: '<b>Database Reload</b>',
				        type: 'button-energized',
				        onTap: function(e) {
				        	$scope.showLoading();
				          	$scope.loadDemoData().then(function(){
				          		Location.forceRefresh();
				          	});
				        }
				      },*/
				      {
				        text: '<b>Rewind 2 Hours</b>',
				        type: 'button-positive',
				        onTap: function(e) {
				        	$scope.showLoading();
				          	Timestamp.setTimeShift(-7200000);
				          	$timeout(function(){
				          		Location.forceRefresh();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
				        }
				      },
				      
				      {
				        text: '<b>Rewind 4 Hours</b>',
				        type: 'button-positive',
				        onTap: function(e) {
				        	$scope.showLoading();
				          	Timestamp.setTimeShift(-14400000);
				          	$timeout(function(){
				          		Location.forceRefresh();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
				        }
				      },
				      
				      {
				        text: '<b>Rewind 6 Hours</b>',
				        type: 'button-positive',
				        onTap: function(e) {
				        	$scope.showLoading();
				          	Timestamp.setTimeShift(-21600000);
				          	$timeout(function(){
				          		Location.forceRefresh();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
				        }
				      },
				      
				      {
				        text: '<b>Rewind 8 Hours</b>',
				        type: 'button-positive',
				        onTap: function(e) {
				        	$scope.showLoading();
				          	Timestamp.setTimeShift(-28800000);
				          	$timeout(function(){
				          		Location.forceRefresh();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
				        }
				      },
				      {
				        text: '<b>Real Time</b>',
				        type: 'button-positive',
				        onTap: function(e) {
				        	$scope.showLoading();
				          	Timestamp.setTimeShift(0);
				          	$timeout(function(){
				          		Location.forceRefresh();
				          	},2000); // wait 2 seconds because timestamps only update on a 1-second interval
				        }
				      },
				      { text: 'Cancel' }
				    ]
				  });
			}
		},2500);
	};
	$scope.releaseSecretButton = function(){
		$scope.holding = false;
	};
	/* end secret button */

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
		// alert('firstGPS');
	});

	// Initial state for filtering tabs, sorting, and display type (map/list)
	$scope.filterOptions = {'categoryTab':'all', 'filterTo':'all', 'searchVal':'', 'featuredOnly':'no'};
	// $scope.categoryTab = 'all'; //or food, drinks, exclusive
	// $scope.filterTo = 'all'; // or breakfast, brunch, lunch, dinner, happy hour
	$scope.sortMethod = 'endTime'; //or endTime, locName
	$scope.viewOptions = {'displayType':'map'};

	$scope.distanceSort = function(d) {
	   return $scope.distAway([d.lat, d.lon]);
	};

	$scope.expiredFilter = function(d){
		if ($scope.timestamp > d.startTime && $scope.timestamp < d.endTime) return true;
		return false;
	};
    
    $scope.mapTabSelected = function() {
        console.log('map selected'); 
    
    };
    
    $scope.listTabSelected = function() {
        console.log('list selected'); 
    };
    
    $scope.eventTabSelected = function() {
        console.log('event selected');  
    };

	// Filter function for top row of tabs in app
	$scope.topTabFilter = function(categoryTab){
		return function(d){
			if (categoryTab=='all' && (d.timeType!='event')) return true;
			if (categoryTab=='featured' && (d.featured=='yes')) return true;
            if (categoryTab=='exclusive' && (d.exclusive=='yes')) return true;
            if (categoryTab=='events' && (d.timeType=='event')) return true;
			if (categoryTab=='food' && (d.foodOrDrink == 'food' || d.foodOrDrink == 'both')) return true;
			if (categoryTab=='drinks' && (d.foodOrDrink == 'drink' || d.foodOrDrink == 'both')) return true;
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

	$scope.searchValueFilter = function(searchVal){
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
	$scope.searchBoxSubmit = function($event){
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

	$scope.fake = function(){
		FakeDataPop.go();
	};

	$scope.loadDemoData = function(){
		return FakeDataPop.loadDemoData();
	};
    
    $scope.loadFutureEvents = function(){
        $scope.events = $firebaseArray(eventsRef);
        // create a query for the most recent 25 messages on the server
        var query = eventsRef.orderByChild("timestamp");
        // the $firebaseArray service properly handles database queries as well
        $scope.filteredEvents = $firebaseArray(query);
        //var emaiObject = new GeoFire(firebaseRef.child('/emails'));  
    
    };
    
    
    
   
    
    

	$scope.deals = [];
	$rootScope.$on('dealsNearMeChanged', function(){
		console.log('received $emit dealsNearMeChanged. clearing and re-populating deals object...');
		$scope.deals = [];
		$scope.dealKey_index = {};
		var promises = [];
		Location.getDealsNearMe().forEach(function(key){
			promises.push(DealData.fetch(key));
		});

		$q.all(promises).then(function(allFetchedDeals){

			allFetchedDeals.forEach(function(data){
				if (data && $rootScope.dataError !== true){
					if ($scope.timestamp > data.startTime && $scope.timestamp < data.endTime){
						$scope.deals.push(data);
					} else if (data.endTime < $scope.timestamp) {
						console.log('deal expired. removing from firebase');
  						//geoFire.remove(data.key);
					} else {
						var s = '(' + moment(data.startTime).format('M-D-YY HH:mm') + ')';
						var c = '(' + moment($scope.timestamp).format('M-D-YY HH:mm') + ')';
						var e = '(' + moment(data.endTime).format('M-D-YY HH:mm') + ')';
						console.log('filtering out deal (time range)', s, c, e);
					}
				} else {
					console.log('deal fetch returned something bad:', data);
				}
					
			});

			DealProcessor.Process($scope.deals).then(function(filteredDeals){
				console.log('deals processed! clearing and adding markers');
				$scope.deals = [];
				filteredDeals.forEach(function(d){
					$scope.deals.push(d);
					$scope.dealKey_index[d.key] = $scope.deals.length-1;
					var img1 = new Image();
					img1.src = d.img;
					var img2 = new Image();
					img2.src = d.largeImg;
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

	$scope.clearAndAddMarkers = function(){
		// this triggers when we change a filter
		// we need to know so we can update the map accordingly

		// We fake a loading screen for a particular reason. It is far easier to apply filter changes by
		// removing all map markers and re-adding only the relevant markers. Instead of seeing a screen
		// flash/blip, we fake a 1 second loading which is more visually pleasing
		if (1==1 || $scope.viewOptions.displayType=='map'){
			$scope.showLoading();
			clearMapMarkers();
			$timeout(function(){
				addMapMarkers();
				$ionicLoading.hide();
				if ($scope.deals.length==0){
					// determine what message to show
					var currentLoc = Location.currentLocation();
					if ($rootScope.gps && $rootScope.gps.lat && $rootScope.gps.lon) currentLoc = [$rootScope.gps.lat, $rootScope.gps.lon];
					var likelyCity = identifyCity(currentLoc);
					var message = '';
					if (likelyCity==null){
						message = 'We have not launched in your city yet!'
					} else {
						if (cities[likelyCity]['stage'] == 'active'){
							message = 'Check back later today!';
						} else if (cities[likelyCity]['stage'] == 'error'){
							$ionicPopup.prompt({ 
   									title: 'GPS error',
   									template: 'Could not get location, please enter zip code',
   									inputType: 'zipcode',
   									inputPlaceholder: 'your zip code'
 										}).then(function(res) {
  										 console.log('Your zipcode is', res);
												var lat = '';
    											var lng = '';
    											var address = res;
    											var geocoder= new google.maps.Geocoder();
    									geocoder.geocode( { 'address': address}, function(results, status) {
      										if (status == google.maps.GeocoderStatus.OK) {
         										lat = results[0].geometry.location.lat();
        										lng = results[0].geometry.location.lng();
         
         										console.log('Latitude: ' + lat + ' Logitude: ' + lng);

 												$rootScope.gps = {'lat': lat, 'lon': lng};
              									$scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
              									Location.forceRefresh();
            										} else {
        												console.log("Geocode was not successful for the following reason: " + status);
      														}
    												}); 
   									 console.log('Latitude: ' + lat + ' Logitude: ' + lng);


							});
						}
					}


					$ionicPopup.alert({
				     title: 'No Active Deals',
				     template: '<center>'+message+'</center>'
				   });
				}

			},1000);
		} else {
			clearMapMarkers();
			addMapMarkers();
		}
        
        
        
	};

	var addMapMarkers = function(){

		console.log('adding markers for ' + String($scope.deals.length) + ' deals');
        

		var locName_infoWindow = {};

        $scope.deals.forEach(function(e){
            
            //console.log('e object', e)

        	var tracking_key = String(e.lat) + String(e.lon);

        	var topFilterPass = ($scope.topTabFilter($scope.filterOptions.categoryTab))(e);
        	var bottomFilterPass = ($scope.bottomSheetFilter($scope.filterOptions.filterTo))(e);
        	var searchValuePass = ($scope.searchValueFilter($scope.filterOptions.searchVal))(e);
        	var featuredPass = ($scope.featuredFilter($scope.filterOptions.featuredOnly))(e);
        	if (topFilterPass==false || bottomFilterPass==false || searchValuePass==false || featuredPass==false) return;

        	var loc = new google.maps.LatLng(e.lat,e.lon);

        	var userLocation = Location.currentLocation();

        	var distance = (Math.round($scope.kmToMile(GeoFire.distance([e.lat, e.lon], userLocation))*10)/10) + ' mi';
            
            var icon = {
            url: e.icon,
            scaledSize: new google.maps.Size(40, 40), // scaled size
            };
                    
                

        	var content = "<div style='width:250px;height:100px;'>" +
        					"<div style='display:inline-block;height:60px;'>" +
		      						"<img src='" + e.img +"' style='width:58px;height:58px;'>" + 
		      				"</div>" +
		      				"<div style='display:inline-block;height:60px;padding-left:7px;'>" +
		      					"<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'><b>" + e.locName + "</b></div>" +
		      					"<div style='width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'>"+e.name+"</div>" +
		      					"<div style='width:180px;overflow:hidden;'><i class='icon ion-ios-clock-outline' style='color:red;'></i> <span style='color:red;'>{{millisecondsToTimer("+e.endTime+" - timestamp)}}</span>&nbsp;&nbsp;<i class='icon ion-ios-location-outline'></i> "+distance+"</div>" +
		      				"</div>" +
		      				"<button ng-click='go(\"/deals/"+e.key+"\");mapClick();' class='button button-block button-positive button-small' style='margin-top:0px;'>View Details</button>" + 
		      			  "</div>";
            

		    if (tracking_key in locName_infoWindow){
		    	content = content.replace(e.locName, 'Also...');
		    	var currentContent = locName_infoWindow[tracking_key][1];
		    	locName_infoWindow[tracking_key][0].setContent($compile('<div>' + currentContent + content + '</div>')($scope)[0]);
		    	locName_infoWindow[tracking_key][1] = currentContent + content;
                
		    } else {
		    	var infowindow = new google.maps.InfoWindow({
			      content: $compile(content)($scope)[0]
			    });
			    var marker = new google.maps.Marker({
			      position: loc,
			      map: $scope.map,
			      icon: icon,
                  
			    });

			    google.maps.event.addListener(marker, 'click', function() {
			      if (lastInfoWindow !== null) lastInfoWindow.close();
			      lastInfoWindow = infowindow;
			      infowindow.open($scope.map,marker);
                 
                    //mixpanel analytics
                    mixpanel.track(e.locName, {"Click": "Map Icon"});
                    mixpanel.track("Map Icon", {"Business": e.locName});
                    if (e.featured=='yes'){
                        mixpanel.track(e.locName, {"Click": "Featured"});
                        mixpanel.track("Featured Map Icon", {"Business": e.locName});
                    }
                        
                    console.log("Map Icon: "+e.locName+": "+e.name);
                    console.log(e.icon);
                    
                    
			    });

			    mapMarkers.push(marker);

			    locName_infoWindow[tracking_key] = [infowindow, content];
                
                
		    }

        });
		    
	};

	var clearMapMarkers = function(){
		console.log('clearing all map markers for all deals');
		mapMarkers.forEach(function(e){
			e.setMap(null);
		});
		mapMarkers = [];
	};

	function initialize() {
            
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
      
    $scope.centerOnMe = function(lat, lon) {
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

    $scope.distAway = function(loc){
    	return GeoFire.distance(loc, Location.currentLocation());
    };

    $scope.eventToday = 1;
    
    //mixpanel analytics
    
   $scope.listClick = function($event){
        mixpanel.track("List Detail Click");
		console.log("List Detail Click");
	};
    
    $scope.mapClick = function($event){
        mixpanel.track("Map Detail Click");
		console.log("Map Detail Click");
	};
    
     $scope.featuredClick = function($event){
        mixpanel.track("Featured Tab Click");
		console.log("Map Detail Click");
	};
    
    $scope.eventTabClicked = function(){
        mixpanel.track("Event Tab");
    }
    
   
    
    // Timeshift drawer
    $scope.toggleDrawer = function(handle) {
        $ionDrawerVerticalDelegate.$getByHandle(handle).toggleDrawer();
        console.log(Upgraded[0].$id);
    }

    $scope.drawerIs = function(state) {
        return $ionDrawerVerticalDelegate.getState() == state;
    }
    
    // Timeshift slider
    $scope.data = {};
    $scope.data.timeSelection = 0;
    $scope.timeAdjusted = 'no';
    $scope.timeAdjustedBy = '0';
    
    
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
		console.log('hold');
		$scope.holding = true;
		$timeout(function(){
			if ($scope.holding==true){
                $scope.toggleDrawer('data');
			}
		},5000);
	};
	$scope.releaseDataButton = function(){
		$scope.holding = false;
	};
	
    $scope.storeSearch = function(){
        console.log(searchValuePass);
    };
    
    //refresh
    $scope.doRefresh = function() {
    $timeout(function(){
            Location.forceRefresh();
        },0); // wait 2 seconds because timestamps only update on a 1-second interval
    $scope.$broadcast('scroll.refreshComplete'); 
    };
    
    
    $scope.realGps = function() {
        $scope.showLoading();
        delete $rootScope.gps;
        Location.forceRefresh($scope.centerOnMe);
    };
    
    $scope.submitLocation = function(lat,lon) {
        console.log(lat + " " + lon);
         $rootScope.gps = {'lat': lat, 'lon': lon};
        $scope.centerOnMe($rootScope.gps.lat, $rootScope.gps.lon);
        Location.forceRefresh();
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

.controller('DealDetailCtrl', function(Timestamp, $cordovaSocialSharing, $scope, $rootScope, $stateParams, Location, DealData, $interval, $timeout, $ionicLoading, $ionicScrollDelegate, $ionicPopup, $ionicPopover) {

  $scope.showLoadingProperTimes = function() {
    $ionicLoading.show({
      templateUrl:"templates/loading.html",
        duration: 1500
    });
  };

  $scope.hideLoadingProperTimes = function() {
    //$ionicLoading.hide();
  };

  $scope.showLoadingProperTimes();  
    
  $scope.fuWidth=window.innerWidth;

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

	// $scope.shareViaFacebook = function(dealName, locName, imageURL){
	// 	var message = dealName + ' at ' + locName + '!';
	// 	var image = imageURL;
	// 	var link = 'https://play.google.com/store/apps/details?id=mealsteals.mealsteals.com.mealsteals';
	// 	$cordovaSocialSharing
	// 	    .shareViaFacebook(message, image, link)
	// 	    .then(function(result) {
	// 	      // Success!
	// 	    }, function(err) {
	// 	      // An error occurred. Show a message to the user
	// 	    });
	// };

  DealData.fetch($stateParams.dealId).then(function(d){

  	  $scope.deal = d;
      
      //mixpanel analytics
      console.log(d);
      mixpanel.track(d.locName, {"Deal Detail": d.name});
      mixpanel.track(d.name, {"Business": d.locName});
      mixpanel.track("Deal Viewed", {"Business": d.locName});
      if (d.featured=='yes'){
                        mixpanel.track(d.locName, {"Click": "Featured"});
                        mixpanel.track("Featured Deal Detail", {"Business": d.locName});
                    }
      console.log(d.locName+": "+d.name);
      
      $scope.redeemClicked = function (){
        
        mixpanel.track("Redeem", {"Clicked": d.locName+d.name+distanceAway});
        if (distanceAway<0.1){
                       mixpanel.track("Redeem at location!", {"Clicked": d.locName+d.name+distanceAway});
                    }
    };
    
    $scope.redeemConfirmed = function (){
         
         mixpanel.track("Redeem", {"Confirmed": d.locName+d.name+distanceAway});
         if (distanceAway<0.1){
                       mixpanel.track("Redeem at location!", {"Confirmed": d.locName+d.name+distanceAway});
                    }
    };
      
      
      

  	  var currentLocation = Location.currentLocation();
	  var distanceAway = GeoFire.distance([$scope.deal.lat, $scope.deal.lon], currentLocation);

	  $scope.distanceAway = Math.round(distanceAway * 10) / 10;

	  $scope.tab = 'info';

	  $scope.startTime = moment($scope.deal.startTime).format("h:mm A");
	  $scope.endTime = moment($scope.deal.endTime).format("h:mm A");

	  $timeout(function(){
		initialize();
	  },1000);

  });

	  
    function initialize() {

  		console.log('init!');
		
		var pos = Location.currentLocation();
		var loc = new google.maps.LatLng(pos[0],pos[1]);
        
        

		var bizLoc = new google.maps.LatLng($scope.deal.lat, $scope.deal.lon);

		console.log(loc);
        
        

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
	    $scope.map = new google.maps.Map(document.getElementById("detailMap"),mapOptions);

	    var marker1 = new google.maps.Marker({
	      position: loc,
	      map: $scope.map
	    });

	    var marker2 = new google.maps.Marker({
	      position: bizLoc,
	      map: $scope.map,
	      icon: $scope.deal.icon
	    });
        
        

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
         console.log("flag clicked");
    };
    
    $scope.redeemPopover = function(){
         $scope.redeemPopoverClicked = 'yes';
         console.log("redeem clicked");
    };
    
    $scope.closePopoverReset = function(){
        $scope.flagPopoverClicked = 'no';
        $scope.redeemPopoverClicked = 'no';
    };
    
    

    $scope.dealFlagged = 'no';
    
    $scope.flagDeal = function($event){
        var myPopup = $ionicPopup.show({
        title: 'Are you sure you want to flag this deal?',
        scope: $scope,
        buttons: [
          {
            text: '<b>Cancel</b>',
            onTap: function(e) {   
              $scope.popover.hide();
            }
          },
          {
            text: '<b>Yes</b>',
            type: 'button-positive',
            onTap: function(e) {
              //parameters: service_id, template_id, template_parameters
              emailjs.send("gmail","flag",{name: "MealSteals: Flagged", content: $event.target.id});
              console.log($event.target.id);    
              $scope.dealFlagged = 'yes';
              $scope.popover.hide();
              var myPopup = $ionicPopup.show({
                    title: 'Thank you, we will fix this immediately'
              });
              $timeout(function() {
                myPopup.close(); //close the popup after 4 seconds
              }, 4000);
            }
          }
        ]
      });
    };
    
    $scope.imageEnlarge = function(){
      $("#deal-image").addClass("grow");
      $timeout(function() {
                myPopup.close(); //close the popup after 4 seconds
              }, 0);
    };
    $scope.imageReturn = function(){
      $("#deal-image").removeClass("grow"); 
    };
    
    
    
    


})

.controller('AdCtrl', function(DealProcessor, Timestamp, $cordovaSocialSharing, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, Location, DealData, $ionicLoading, $location, $ionicActionSheet, $compile, $q, $ionDrawerVerticalDelegate, $cordovaAppRate, PopupAds, $firebase) {
    
    
    /*$scope.deals = [];
	$rootScope.$on('dealsNearMeChanged', function(){
		console.log('received $emit dealsNearMeChanged. clearing and re-populating deals object...');
		$scope.deals = [];
		$scope.dealKey_index = {};
		var promises = [];
		Location.getDealsNearMe().forEach(function(key){
			promises.push(DealData.fetch(key));
		});

		$q.all(promises).then(function(allFetchedDeals){

			allFetchedDeals.forEach(function(data){
				if (data && $rootScope.dataError !== true){
					if ($scope.timestamp > data.startTime && $scope.timestamp < data.endTime && data.featured =='yes'){
						$scope.deals.push(data);
					} else if (data.endTime < $scope.timestamp) {
						console.log('deal expired. removing from firebase');
  						//geoFire.remove(data.key);
					} else {
						var s = '(' + moment(data.startTime).format('M-D-YY HH:mm') + ')';
						var c = '(' + moment($scope.timestamp).format('M-D-YY HH:mm') + ')';
						var e = '(' + moment(data.endTime).format('M-D-YY HH:mm') + ')';
						console.log('filtering out deal (time range)', s, c, e);
					}
				} else {
					console.log('deal fetch returned something bad:', data);
				}
					
			});
        console.log($scope.deals.dealFullImage);
            $scope.rand = $scope.deals[Math.floor(Math.random() * $scope.deals.length)];
            console.log($scope.rand);
        

				
		});
	});*/
    
    /* Firebase array retrieval 
    
    var popupRef = new Firebase("https://mealsteals.firebaseio.com/popupAdDeals");
    // download the data from a Firebase reference into a (pseudo read-only) array
    // all server changes are applied in realtime
    $scope.popupAdArray = [];
    $scope.popupAdArray = $firebaseArray(popupRef);
    console.log($scope.popupAdArray);
    console.log($scope.popupAdArray[0]);
    // create a query for the most recent 25 messages on the server
        //var query = popupRef.orderByChild("timestamp").limitToLast(25);
    // the $firebaseArray service properly handles database queries as well
        //$scope.filteredMessages = $firebaseArray(query);

    $scope.randPopup = $scope.popupAdArray[Math.floor(Math.random() * $scope.popupAdArray.length)];
    console.log($scope.randPopup);*/
    
     /*FIREBASE OBJECT RETREIVAL*/
    
    //[Math.floor(Math.random() * Object.keys($scope.popupAdArray).length)]
     var ref = new Firebase("https://mealsteals.firebaseio.com/popupAdDeals");
    
    

     var obj = $firebaseObject(ref.orderByChild('name'));

     // to take an action after the data loads, use the $loaded() promise
     obj.$loaded().then(function() {
        //console.log("loaded record:", obj.$id, obj.someOtherKeyInData);

       // To iterate the key/value pairs of the object, use angular.forEach()
       angular.forEach(obj, function(value, key) {
          //console.log(value);
          $scope.rand = value;
          //console.log($scope.popupDealSet);   
          //$scope.rand = $scope.popupDealSet[Math.floor(Math.random() * $scope.popupDealSet.length)];
          
          console.log($scope.rand);  
          var popupObj = [$scope.rand];
          // console.log(popupObj);
          mixpanel.track("Ad Served", {"Ad": $scope.rand.locName+': '+$scope.rand.name})
          mixpanel.track("Ad Business", {"Business": $scope.rand.locName})
           
       });
     });
        
     // To make the data available in the DOM, assign it to $scope
     $scope.data = obj;
     //console.log($scope.data)
     //console.log($scope.data.key);
    
     // For three-way data bindings, bind it to the scope instead
     obj.$bindTo($scope, "data");
    
    
    //$scope.rand = $scope.data[Math.floor(Math.random() * $scope.data.length)];
    //console.log($scope.rand);
    
   $scope.closePopup = function(){
       myPopup.close();
   };

    
    
    $scope.timestamp = Timestamp.getTimestamp();
	var cancelInterval = $interval(function(){
	  	$scope.timestamp = Timestamp.getTimestamp();
	}, 1000);
  
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});


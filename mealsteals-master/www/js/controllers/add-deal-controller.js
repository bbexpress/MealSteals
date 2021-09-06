angular.module('starter.controllers')


.controller('AddDealCtrl', function(DealProcessor, Auth, Timestamp, $cordovaSocialSharing, $ionicPopup, $scope, $firebaseObject, $firebaseArray, $rootScope, $interval, $timeout, Location, DealData, $ionicLoading, $location, $ionicPopover, $ionicActionSheet, $ionicModal, $compile, $q, $ionDrawerVerticalDelegate, $cordovaAppRate, PopupAds, $ionicHistory, $state, $ionicScrollDelegate, $cordovaNativeStorage, $cordovaNetwork, $cordovaNativeAudio, $stateParams, $window, CordovaCamera) {
    

    $rootScope.busArray.$loaded(function(bus){
        $scope.busObj = bus;
        console.log($scope.busObj);
        
        if(!angular.isUndefined($rootScope.authUserData)){
            var folRef = $rootScope.userFB.child('/favorites/businesses/');
            $scope.following = $firebaseArray(folRef);
            var query = folRef.orderByChild("locName");
            console.log($scope.following);
        }
    });
    
    
    var hasSeenAddDeal = window.localStorage.getItem("hasSeenAddDeal");
  
    if (!hasSeenAddDeal){
          $timeout(function(){       
                var myPopup = $ionicPopup.show({
                    title: 'New Feature!',
                    subTitle: 'Add deals',
                    //scope: $scope,
                    templateUrl: 'templates/nf-add-deal.html',
                    cssClass: 'generic-notification',
                    buttons: [
                      {
                        text: '<i class="ion-close-round"></i>',
                        type: 'notification-close-x dark-gray',
                        onTap: function(e) {   
                        }
                      },
                        {
                        text: 'Do not show this alert again',
                        type: 'notification-terminate-button',
                        onTap: function(e) {   
                            window.localStorage.setItem("hasSeenAddDeal", true);
                        }
                      }
                    ]
                });
            },0);
    }
    
    // Initially was trying to broadcast an event to this controller passing the deal into it from deal detail, it was choppy and wasn't working the best 
    
    /*$rootScope.$on('editDeal', function(event, data){
        console.log('editing existing deal');
        var dealId = data;
        $scope.newDeal = $firebaseObject($rootScope.mealsteals.child('/recurringDeals/'+dealId));
        $scope.newDeal.$loaded(function(){
            $scope.page = 2;
            console.log($scope.newDeal);
            var startdate = new Date($scope.newDeal.startTime);
            var enddate = new Date($scope.newDeal.endTime);
            $scope.newDeal.date = new Date();
            var zone = $scope.newDeal.timezone;
            var startClockTime = moment(startdate).tz(zone).format('HH:mm');
            var endClockTime = moment(enddate).tz(zone).format('HH:mm');
            var startTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + startClockTime);
            var endTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + endClockTime);
            $scope.newDeal.startTime = new Date(startTimeOffset);
            $scope.newDeal.endTime = new Date(endTimeOffset);
            $scope.biz = {};
            $scope.biz.businessName = $scope.newDeal.locName;
            $scope.editDealState = true;
        });  
	});*/
    
    // Initial state for filtering tabs, sorting, and display type (map/list)
	$scope.addFilterOptions = {
         'showFavorite':false, 
     };
    
    $scope.fuHeight=window.innerHeight;
    
    $scope.kmToMile = function(km){
		var miles = km * 0.621371;
		return miles;
	};
    
    $scope.distanceSort = function(d) {
       //console.log('in distance sort');
        if(!angular.isUndefined(d.lat) && !angular.isUndefined(d.lon)){
            var distance = (Math.round($scope.kmToMile(GeoFire.distance([d.lat, d.lon], Location.currentLocation()))*10)/10) + ' mi';
            //console.log(distance);

	       return $scope.distAway([d.lat, d.lon]);
        }
	};
    
    $scope.distAway = function(loc){
        if(!angular.isUndefined(Location.currentLocation()) && 
           !angular.isUndefined(loc[0]) &&
           !angular.isUndefined(loc[1])){
        var distance = GeoFire.distance([parseFloat(loc[0]),parseFloat(loc[1])],Location.currentLocation());
            
    	return distance;
        }
    };
    
      
    /*$scope.filterBizFav = function(showFavorite) {   
        return function(d){     
 			if (showFavorite==false)return true;
            
            if (showFavorite==true){
                //console.log('show favorites')
                console.log($rootScope.currentFavs.businesses[d.businessID])
                if(!angular.isUndefined($rootScope.currentFavs.businesses)){
                    if (!angular.isUndefined($rootScope.currentFavs.businesses[d.businessID])){ 
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }
        }
    };*/
    
    $scope.addAnotherDeal=false;
    $scope.page = 1;
    $scope.showDeals='list';
    $scope.biz = {};
    
    $scope.page1 = function() {
        $scope.page = 1;
        $scope.biz = {};
        $scope.data.location = {};
    };
    
    $scope.page2 = function() {
        $scope.page = 2;
        $ionicScrollDelegate.scrollTop();
    };
    
    
    // running this twice for whatever reason
    $scope.goBack = function() {
        if ($scope.editDealState == true) {
            $ionicHistory.goBack();
            if ($ionicHistory.backView() == null) {
                console.log('state.deals');
                $state.go('app.deals');
            }
        } else {
            if ($scope.page==1){
                $state.go('app.deals');
            } else {
                $scope.page = 1;
                $scope.biz = {};
            }  
        }
    };
    
    $scope.backToDeals = function() {
        $state.go('app.deals');
    };
    
    $scope.addAnotherDealBtn = function() {
        $scope.addAnotherDeal=true;
    };
    
    $scope.resetAddAnother = function(){
        if (!angular.isUndefined(placesObj[$scope.data.location.place_id])){
            console.log('existing business');
            $scope.startNewDeal();
        } else {
            console.log('new business');
            $scope.startNewDealNewBiz();
        }
        $scope.addAnotherDeal=false;
    };
    
    $scope.closeAddDeal = function (){
        $state.go('app.deals');  
    };
    
    var firebasePlaces = new Firebase('https://mealsteals.firebaseio.com/adminAnalytics/places');
    var placesObj = $firebaseObject(firebasePlaces);
    
    $scope.data = {};

    $scope.onAddressSelection = function (location) {
  
        console.log(location);
        var geocoder = new google.maps.Geocoder();
        var address = location.formatted_address;

        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $scope.data.location.lat = results[0].geometry.location.lat();
                $scope.data.location.lon = results[0].geometry.location.lng();
                $scope.data.location.city = location.address_components[3].short_name;
                $scope.data.location.state = location.address_components[5].short_name;
                $scope.selectPlace();
            }
        });
        
    };
    
    $scope.selectBizFromList = function (biz) {
        console.log(biz);
        $scope.data.location = {};
        $scope.data.location.name = biz.businessName;
        $scope.data.location.lat = biz.lat;
        $scope.data.location.lon = biz.lon;
        $scope.data.location.city = biz.city;
        $scope.data.location.state = biz.state;
        $scope.data.location.place_id = biz.placeId;
        console.log($scope.data.location);
        $scope.selectPlace();
    };
    
    $scope.selectPlace = function(){
        if (!$scope.data.location) {
            alert('Please select business');
        } else{
            console.log($scope.data.location);
              //this is where it checks our ids in our database
            if ($scope.data.location.place_id != undefined || $scope.data.location.lat != undefined) {
                        if (!angular.isUndefined(placesObj[$scope.data.location.place_id])) {
                            var firebaseBusiness = new Firebase('https://mealsteals.firebaseio.com/businesses');
                            $scope.businessObj = $firebaseArray((firebaseBusiness).orderByChild('placeId').equalTo($scope.data.location.place_id));
                            $scope.businessObj.$loaded().then(function () {
                                $scope.biz = $scope.businessObj[0];
                                console.log($scope.biz);
                                if ($scope.biz.timezone == undefined){
                                    $scope.biz.timezone = "America/Chicago";
                                }
                                console.log('existing business');
                                $scope.startNewDeal();
                                $scope.loadMap();
                                $scope.openConfirmPopup();
                            });
                        } else {
                            console.log('new business');
                            console.log($scope.data.location);
                            $scope.biz.businessName = $scope.data.location.name;
                            $scope.biz.address = $scope.data.location.formatted_address;
                            $scope.biz.phone = $scope.data.location.formatted_phone_number;
                            $scope.biz.lat = $scope.data.location.lat;
                            $scope.biz.lon = $scope.data.location.lon;
                            $scope.biz.city = $scope.data.location.city;
                            $scope.biz.state = $scope.data.location.state;
                            // set all timezones to central for now
                            $scope.biz.timezone = "America/Chicago";
                            console.log($scope.biz);
                            $scope.startNewDealNewBiz();
                            $scope.loadMap();
                            $scope.openConfirmPopup();
                            //alert('available!');
                        }                
           } else {
              alert('Please try again');
           }
        }  
    };
    
    var confirmPopup;
    
    $scope.openConfirmPopup = function(){
            confirmPopup = $ionicPopup.show({
              cssClass: 'confirm-popup',
              //okText: 'Close',
              scope: $scope,
              templateUrl: 'templates/confirm-biz-popup.html',
         });
     };
    
    $scope.closeConfirmPopup = function() {
        confirmPopup.close();
    };
    
    var successPopup;
    
    $scope.openSuccessPopup = function(){
            successPopup = $ionicPopup.show({
              cssClass: 'confirm-popup',
              //okText: 'Close',
              scope: $scope,
              templateUrl: 'templates/success-popup.html',
         });
     };
    
    $scope.closeSuccessPopup = function() {
        successPopup.close();
    };
    
    var dealsPopup;
    
    $scope.viewDeals = function(){
            dealsPopup = $ionicPopup.show({
              cssClass: 'deals-popup',
              //okText: 'Close',
              scope: $scope,
              templateUrl: 'templates/deals-biz-popup.html',
         });
        $scope.busRecurringDeals = $firebaseArray(($rootScope.recurringFB).orderByChild('businessID').equalTo($scope.biz.$id));
        $scope.busRecurringDeals.$loaded(function(bus){
            console.log($scope.busRecurringDeals.length);
        })
     };
    
    $scope.closeDealsPopup = function() {
        dealsPopup.close();
        $scope.dealDetails = {};
        $scope.showDeals='list';
    };
    
    $scope.showDaysOfWeek = function(deal){
      var ret = '';
      if (deal.daysOfWeek['monday']=='yes'){ ret += 'Mon/'; }
      if (deal.daysOfWeek['tuesday']=='yes'){ ret += 'Tue/'; }
      if (deal.daysOfWeek['wednesday']=='yes'){ ret += 'Wed/'; }
      if (deal.daysOfWeek['thursday']=='yes'){ ret += 'Thu/'; }
      if (deal.daysOfWeek['friday']=='yes'){ ret += 'Fri/'; }
      if (deal.daysOfWeek['saturday']=='yes'){ ret += 'Sat/'; }
      if (deal.daysOfWeek['sunday']=='yes'){ ret += 'Sun/'; }
      return ret.substr(0, ret.length-1);
    }
    
    $scope.showDealDetails = function (dealDetails){
        $scope.showDeals='details';
        $scope.dealDetails = dealDetails;  
    };
    
    $scope.showDealList = function () {
        $scope.showDeals='list';
        $scope.dealDetails = {};
    };
    
    $scope.loadMap = function() {
        $timeout(function(){
            initialize();
	     },1000);
    
    function initialize() {
        console.log($scope.biz);
		//var pos = Location.currentLocation();
		//var loc = new google.maps.LatLng(pos[0],pos[1]);
        
		var bizLoc = new google.maps.LatLng($scope.biz.lat, $scope.biz.lon);

	    var mapOptions = {
	      center: bizLoc,
	      zoom: 15,
	      mapTypeId: google.maps.MapTypeId.ROADMAP,
	      streetViewControl: false,
	      mapTypeControl: false,
	      //zoomControl: false,
	      fitBounds: true,
          //draggable: false
	    };
            
        var icon = {
            url: $scope.biz.icon,
            scaledSize: new google.maps.Size(40, 40),// scaled size
        };    
            
	    $scope.map = new google.maps.Map(document.getElementById("addDealMap"),mapOptions);
        
        var infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService($scope.map);

        /*service.getDetails({
          placeId: $scope.biz.placeId
        }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {

              $scope.placeDetails = place;
              console.log(place);
          }
        });*/

	    /*var marker1 = new google.maps.Marker({
	      position: loc,
	      map: $scope.map
	    });*/

	    var marker = new google.maps.Marker({
	      position: bizLoc,
	      map: $scope.map,
	      icon: icon,
          //scaledSize: new google.maps.Size(40, 40), // scaled size
	    }); 
    }  
    };
    
    $scope.newDeal = {};
    
    $scope.startNewDeal = function(){
        var today = Date.now();
        var date = new Date(); // 4:55
        roundMinutes(date); // 5:00

        function roundMinutes(date) {
                date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
                date.setMinutes(0);
                return date;
        }
        
        var verifiedObj = {};
        var verifiedArr = {};
        verifiedArr[ today ] = $rootScope.authUserData.uid;
        
        console.log(today);
        $scope.newDeal = {
          date:'',
          name: '',
          description: '',
          locName: $scope.biz.businessName,
          icon: $scope.biz.icon,
          dealFullImage: false, //NEW CODE
          largeImg: $scope.biz.detailBackground,
          detailBackgroundFull: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
          address: $scope.biz.address,
          phone: $scope.biz.phone,
          lat: $scope.biz.lat,
          lon: $scope.biz.lon,
          city: $scope.biz.city,
          state: $scope.biz.state,
          featured: 'no',
          daysOfWeek: {
            'monday': 'no',
            'tuesday': 'no',
            'wednesday': 'no',
            'thursday': 'no',
            'friday': 'no',
            'saturday': 'no',
            'sunday': 'no' 
          },
          type: false,
          startTime: roundMinutes(date), //new Date()
          endTime: roundMinutes(date), //new Date()
          foodOrDrink: false,
          exclusive: 'no',
          timeType: 'deal',
          redeemable: 'no',
          totalRating: 0,
          businessID: $scope.biz.$id,
          tags: [],
          userSubmitted: true,
          approved: false,
          submittedByUsername:$rootScope.currentUser.username,
          submittedByUID:$rootScope.authUserData.uid,
          verifiedObj: verifiedArr, 
          tags: [],
          createdAt:today
        };
          if(!angular.isUndefined($scope.biz.vegan)){
              $scope.newDeal['vegan'] = $scope.biz.vegan;
          } else {
              $scope.newDeal['vegan'] = false;
          }
          if(!angular.isUndefined($scope.biz.rooftop)){
              $scope.newDeal['rooftop'] = $scope.biz.rooftop;
          } else {
              $scope.newDeal['rooftop'] = false;
          }
          if(!angular.isUndefined($scope.biz.patio)){
              $scope.newDeal['patio'] = $scope.biz.patio;
          } else {
              $scope.newDeal['patio'] = false;
          }
          if(!angular.isUndefined($scope.biz.games)){
              $scope.newDeal['games'] = $scope.biz.games;
          } else {
              $scope.newDeal['games'] = false;
          }

    };
    
    $scope.startNewDealNewBiz = function(){
        var today = Date.now();
        var date = new Date(); // 4:55
        roundMinutes(date); // 5:00

        function roundMinutes(date) {
                date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
                date.setMinutes(0);
                return date;
        }
        console.log(today);
        
        var verifiedObj = {};
        var verifiedArr = {};
        verifiedArr[ today ] = $rootScope.authUserData.uid;
        
        $scope.newDeal = {
          date:'',
          name: '',
          description: '',
          locName: $scope.biz.businessName,
          icon: 'http://dashboard.mealsteals.com/app/images/user-submitted-icon.png',
          dealFullImage: false, //NEW CODE
          //largeImg: $scope.biz.detailBackground,
          detailBackgroundFull: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
          address: $scope.biz.address,
          phone: $scope.biz.phone,
          lat: $scope.biz.lat,
          lon: $scope.biz.lon,
          city: $scope.biz.city,
          state: $scope.biz.state,
          featured: 'no',
          daysOfWeek: {
            'monday': 'no',
            'tuesday': 'no',
            'wednesday': 'no',
            'thursday': 'no',
            'friday': 'no',
            'saturday': 'no',
            'sunday': 'no'
          },
          type: false,
          startTime: roundMinutes(date), //new Date()
          endTime: roundMinutes(date), //new Date()
          foodOrDrink: false,
          exclusive: 'no',
          timeType: 'deal',
          redeemable: 'no',
          totalRating: 0,
          //businessID: $scope.biz.$id,
          businessID: false,
          userSubmitted: true,
          approved: false,
          submittedByUsername:$rootScope.currentUser.username,
          submittedByUID:$rootScope.authUserData.uid,
          verifiedObj: verifiedArr, 
          tags: [],
          createdAt:today
        };
          if(!angular.isUndefined($scope.biz.vegan)){
              $scope.newDeal['vegan'] = $scope.biz.vegan;
          } else {
              $scope.newDeal['vegan'] = false;
          }
          if(!angular.isUndefined($scope.biz.rooftop)){
              $scope.newDeal['rooftop'] = $scope.biz.rooftop;
          } else {
              $scope.newDeal['rooftop'] = false;
          }
          if(!angular.isUndefined($scope.biz.patio)){
              $scope.newDeal['patio'] = $scope.biz.patio;
          } else {
              $scope.newDeal['patio'] = false;
          }
          if(!angular.isUndefined($scope.biz.games)){
              $scope.newDeal['games'] = $scope.biz.games;
          } else {
              $scope.newDeal['games'] = false;
          }

    };
    
    $scope.selectMonday = function() {
          if ($scope.newDeal.daysOfWeek.monday=='no'){
              $scope.newDeal.daysOfWeek.monday='yes';
          } else {
              $scope.newDeal.daysOfWeek.monday='no';
          }
    }

    $scope.selectTuesday = function() {
          if ($scope.newDeal.daysOfWeek.tuesday=='no'){
              $scope.newDeal.daysOfWeek.tuesday='yes';
          } else {
              $scope.newDeal.daysOfWeek.tuesday='no';
          }
    }

    $scope.selectWednesday = function() {
          if ($scope.newDeal.daysOfWeek.wednesday=='no'){
              $scope.newDeal.daysOfWeek.wednesday='yes';
          } else {
              $scope.newDeal.daysOfWeek.wednesday='no';
          }
    }

    $scope.selectThursday = function() {
          if ($scope.newDeal.daysOfWeek.thursday=='no'){
              $scope.newDeal.daysOfWeek.thursday='yes';
          } else {
              $scope.newDeal.daysOfWeek.thursday='no';
          }
    }

    $scope.selectFriday = function() {
          if ($scope.newDeal.daysOfWeek.friday=='no'){
              $scope.newDeal.daysOfWeek.friday='yes';
          } else {
              $scope.newDeal.daysOfWeek.friday='no';
          }
    }

    $scope.selectSaturday = function() {
          if ($scope.newDeal.daysOfWeek.saturday=='no'){
              $scope.newDeal.daysOfWeek.saturday='yes';
          } else {
              $scope.newDeal.daysOfWeek.saturday='no';
          }
    }

    $scope.selectSunday = function() {
          if ($scope.newDeal.daysOfWeek.sunday=='no'){
              $scope.newDeal.daysOfWeek.sunday='yes';
          } else {
              $scope.newDeal.daysOfWeek.sunday='no';
          }
    }
    
    function convertToUnixOffset(startClockTime, endClockTime, timezone, date){
      // We assume that this function is running on the same day as when the deal is supposed to start

      // startClockTime and endClockTime should be in format: "HH:mm" (this is 24-hour format)
        
        if(date == 0 || date == undefined){
          var nowMoment = moment().tz(timezone);

          var startTimeString = nowMoment.format('YYYY-MM-DD') + ' ' + startClockTime;
          var endTimeString = nowMoment.format('YYYY-MM-DD') + ' ' + endClockTime;

            
            console.log("start time string " + startTimeString);
            console.log("end time string " + endTimeString);
            
            
          var startMoment = moment.tz(startTimeString, timezone);
          var endMoment = moment.tz(endTimeString, timezone);
            
             console.log("start moment " + startMoment);
            console.log("end moment " + endMoment);
            

          if (startMoment.valueOf() > endMoment.valueOf()){
            // this covers instances like deals that go from 10pm - 2am
            endMoment.add(1, 'days');
          }

          if (parseInt(startMoment.format('HH')) >= 0 && parseInt(startMoment.format('HH')) <= 3){
            // this covers instances for deals with a starting time of 12:00am - 2:59am
            if (parseInt(nowMoment.format('HH')) >= 0 && parseInt(nowMoment.format('HH')) <= 3){
              // no action required
            } else {
              // in this case, both start time and end time should be advanced by 1 day
              startMoment.add(1, 'days');
              endMoment.add(1, 'days');
            }
          }

          return [startMoment.valueOf(), endMoment.valueOf()];
       }else{
            
            var nowMoment = moment().tz(timezone);

          var startTimeString = date + ' ' + startClockTime;
          var endTimeString = date + ' ' + endClockTime;

          var startMoment = moment.tz(startTimeString, timezone);
          var endMoment = moment.tz(endTimeString, timezone);

          if (startMoment.valueOf() > endMoment.valueOf()){
            // this covers instances like deals that go from 10pm - 2am
            endMoment.add(1, 'days');
          }

          if (parseInt(startMoment.format('HH')) >= 0 && parseInt(startMoment.format('HH')) <= 3){
            // this covers instances for deals with a starting time of 12:00am - 2:59am
            if (parseInt(nowMoment.format('HH')) >= 0 && parseInt(nowMoment.format('HH')) <= 3){
              // no action required
            } else {
              // in this case, both start time and end time should be advanced by 1 day
              startMoment.add(1, 'days');
              endMoment.add(1, 'days');
            }
          }

          return [startMoment.valueOf(), endMoment.valueOf()];
        }
    }
    
    $scope.addDeal = function() {
        if ($scope.newDeal.name == '' || $scope.newDeal.description == '' ||
           $scope.newDeal.endTime == undefined ||
           $scope.newDeal.startTime == undefined ||
           $scope.newDeal.foodOrDrink == false){
            alert('Please fill in all fields');        
        } else if ($scope.newDeal.daysOfWeek.sunday=='no' && $scope.newDeal.daysOfWeek.monday=='no' && $scope.newDeal.daysOfWeek.tuesday=='no' && $scope.newDeal.daysOfWeek.wednesday=='no' && $scope.newDeal.daysOfWeek.thursday=='no' && $scope.newDeal.daysOfWeek.friday=='no' && $scope.newDeal.daysOfWeek.saturday=='no'){
            alert('Please select valid dates');
        } else {
            $scope.newDeal.lat = parseFloat($scope.newDeal.lat);
                    $scope.newDeal.lon = parseFloat($scope.newDeal.lon);

                    if($scope.newDeal.timeType == "event"){
                          delete $scope.newDeal.foodOrDrink;
                    }

                    var startdate = new Date($scope.newDeal.startTime);
                    var enddate = new Date($scope.newDeal.endTime);

                    var startClockTime = moment(startdate.getTime()).format('HH:mm');
                    var endClockTime = moment(enddate.getTime()).format('HH:mm');

                    var timeRange = convertToUnixOffset(startClockTime, endClockTime, $scope.biz.timezone);

                    $scope.newDeal.startTime = timeRange[0];
                    $scope.newDeal.endTime = timeRange[1];

                    $scope.newDeal.timezone = $scope.biz.timezone;

                    console.log($scope.newDeal);  

                    var start = new Date($scope.newDeal.startTime);
                    var startDate = moment(start.getTime()).format('YYYYMMDD');
                    var end = new Date($scope.newDeal.endTime);
                    var endDate = moment(end.getTime()).format('YYYYMMDD');

                    var currentDay = moment().tz($scope.newDeal.timezone).format('dddd').toLowerCase();

                    // create recurring template
                    $rootScope.mealsteals.child('crowdSource').push($scope.newDeal, function(){
                        $timeout(function(){
                            $scope.openSuccessPopup();
                         },1000);
                    });

                    //$scope.startNewDeal();
        //       // if ($rootScope.blackList != true) {  
        //            mixpanel.track("Add Deal", {"Email": Auth.AuthData.password.email, "Business": biz.businessName});
        //       // }
        }
    };
    
    $scope.uploadPictureMessage = function() {
         var myPopup = $ionicPopup.show({
                title: 'Upload Photo',
                template: 'We review each photo submission carefully. Only upload photos that relate to this deal, are high resolution, and engaging. The more artsy the better! :)',
                cssClass: 'got-it',
                scope: $scope,
                buttons: [
                  {
                    text: 'Got it',
                    type: 'button-positive',
                    onTap: function(e) {   
                      $scope.uploadPicture();
                    }
                  }
                ]
                });
     }
     
      // update deal image Action Sheet
    $scope.uploadPicture = function() {
         // Show the action sheet
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a new picture' },
                    { text: 'Import from phone library' },
                ],
                titleText: 'Update Deal Image',
                cancelText: 'Cancel',
                cancel: function() {
                    // add cancel code..
                },
                buttonClicked: function(sourceTypeIndex) {
                    proceed(sourceTypeIndex)
                    return true;
                }
            });
            function proceed(sourceTypeIndex) {
              $scope.uploadCamera(sourceTypeIndex).then(
                function(success){
                  //loadProfileData();
                }
              );
            };
    };
    
    
    // capture deal image
    $scope.uploadCamera = function(sourceTypeIndex) {
        console.log('in UploadCamera');
        return CordovaCamera.newImage(sourceTypeIndex, 600).then(
          function(imageData){
            if(imageData != undefined) {
                console.log("image data defined");
                $scope.uploadFiles(imageData, 'sharedImage');
            } else {
                console.log("image data undefined");
              return imageData;
            }
          }, function(error){
            Codes.handleError(error);
          }
        );
    };
    
    function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {type:mimeString});
    }
    
    $scope.uploadFiles = function(image, fileName) {

        var blob = dataURItoBlob(image);
        var file = new FormData(document.forms[0]);

        file.append(fileName, blob);

        var timeID = String(new Date().getTime());

            //var file = image;
            var fd = new FormData();

            var key = timeID + fileName;
                console.log(key);

            fd.append('key', key);
            fd.append('acl', 'public-read'); 
            fd.append('Content-Type', "image.jpeg");      
            fd.append('AWSAccessKeyId', 'AKIAJ46C4XJRMO6JBATA');
            fd.append('policy', $rootScope.policy)
            fd.append('signature',$rootScope.signature);

            fd.append("file",blob);
                console.log(fd);

            var xhr = new XMLHttpRequest();

            xhr.open('POST', 'http://s3.amazonaws.com/mealstealsyes/', true); //MUST BE LAST LINE BEFORE YOU SEND 

            xhr.send(fd);

            var url = "http://s3.amazonaws.com/mealstealsyes/" + key;
        
            $timeout(function(){
                $scope.newDeal.dealFullImage = url;
            },2000);
        
            /*$rootScope.mealsteals.child('/businesses/' + $scope.deal.businessID + '/sharedImages/' + timeID + '/').set({
                'user': $rootScope.authUserData.uid,
                'url':  url,
                'verified': false
            });*/

//            var start = new Date($scope.deal.startTime);
//            var startDate = moment(start.getTime()).format('YYYYMMDD');
//            var end = new Date($scope.deal.endTime);
//            var endDate = moment(end.getTime()).format('YYYYMMDD');

            /*if(!angular.isUndefined($scope.deal.recurringDealID)){
                $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/sharedImages/' + timeID + '/').set({
                'user': $rootScope.authUserData.uid,
                'url':  url,
                'verified': false
                });
            }else{
                $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/sharedImages/' + timeID + '/').set({
                'user': $rootScope.authUserData.uid,
                'url':  url,
                'verified': false
                });
                $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + $scope.deal.key + '/sharedImages/' + timeID + '/').set({
                'user': $rootScope.authUserData.uid,
                'url':  url,
                'verified': false
                });

            }*/

            
    }
    
    
    
})
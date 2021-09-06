angular.module('starter.controllers')


.controller('DealDetailCtrl', function(Timestamp, $state, $ionicHistory, Auth, $state, $firebaseAuth, $cordovaSocialSharing, $firebaseObject, $firebaseArray, $scope, $rootScope, $stateParams, Location, $location, DealData, $interval, $timeout, $ionicLoading, $ionicPopup, $ionicPopover, $ionicActionSheet, CordovaCamera, $cordovaLaunchNavigator, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicNavBarDelegate) {

    
  $rootScope.$on('dealDetailRefresh', function(){
        $state.go('app.deals');
    });
    
  // paralax and pull
  $ionicSlideBoxDelegate.update();
  $scope.onUserDetailContentScroll = onUserDetailContentScroll
  
  var hasSeenDealDetail = window.localStorage.getItem("hasSeenDealDetail");
  
    if (!hasSeenDealDetail){
          $timeout(function(){       
                var myPopup = $ionicPopup.show({
                    title: 'New Feature!',
                    subTitle: 'Edit & verify deals',
                    //scope: $scope,
                    templateUrl: 'templates/nf-deal-detail.html',
                    cssClass: 'generic-notification',
                    buttons: [
                      {
                        text: '<i class="ion-close-round"></i>',
                        type: 'notification-close-x dark-gray',
                        onTap: function(e) {
                           /* $scope.illuminateNewFeatures = true;
                            $timeout(function(){  
                                $scope.illuminateNewFeatures = false;
                             },3000);*/
                        }
                      },
                        {
                        text: 'Do not show this alert again',
                        type: 'notification-terminate-button',
                        onTap: function(e) {
                            window.localStorage.setItem("hasSeenDealDetail", true);
                            /*$scope.illuminateNewFeatures = true;
                            $timeout(function(){  
                                $scope.illuminateNewFeatures = false;
                             },3000);*/
                        }
                      }
                    ]
                });
            },0);
    }
  
  function onUserDetailContentScroll(){
    var scrollDelegate = $ionicScrollDelegate.$getByHandle('userDetailContent');
    var scrollView = scrollDelegate.getScrollView();
    $scope.$broadcast('userDetailContent.scroll', scrollView);
  }
    
    
    
  // Generic function for changing path with optional delay
	$scope.go = function(path, delay){
        console.log(path, delay);
		if (delay){
			$timeout(function(){
				$location.path(path);
			}, delay);
		} else {
			$location.path(path);
            
		}       
	}; 
    
     var editPopup;
    
    $scope.openEditPopup = function(){
            editPopup = $ionicPopup.show({
              cssClass: 'edit-popup',
              //okText: 'Close',
              //title: "<button ng-click='closeEditPopup()' class='button-positive button'>Close</button>",
              scope: $scope,
              templateUrl: 'templates/edit-deal-popup.html',
         });
     };
    
    $rootScope.closeEditPopup = function() {
        editPopup.close();
    };
    
    $scope.openEditDeal = function (){
        if(!$rootScope.currentUser){
              $scope.promptLogin();
            } else {
                var myPopup = $ionicPopup.show({
                    title: '<div><i class="ion-edit"></i><div><div class="popup-title-generic">Edit Deal?</div>',
                    subTitle: 'Help maintain a great deal hunting experience by editing deals and keeping them current',
                    //scope: $scope,
                    cssClass: 'generic-popup',
                    buttons: [
                      {
                        text: 'Cancel',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          $scope.popover.hide();
                        }
                      },
                      {
                        text: '<b>Edit</b>',
                        type: 'button-popup-clear',
                        onTap: function(e) {
                            //console.log(deal.recurringDealID);
                            $scope.popover.hide();
                            //$state.go('app.add-deal');
                           //$rootScope.$broadcast('editDeal', $scope.deal.recurringDealID);
                           $scope.openEditPopup();
                           $scope.newDeal = $firebaseObject($rootScope.mealsteals.child('/recurringDeals/'+$scope.deal.recurringDealID));
                            $scope.newDeal.$loaded(function(){
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
                            });  
                        }
                      }
                    ]
              });
            }
    };

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
            //$scope.newDeal.lat = parseFloat($scope.newDeal.lat);
            //$scope.newDeal.lon = parseFloat($scope.newDeal.lon);

            /*if($scope.newDeal.timeType == "event"){
                  delete $scope.newDeal.foodOrDrink;
            }*/

            var today = Date.now();
            
            var startdate = new Date($scope.newDeal.startTime);
            var enddate = new Date($scope.newDeal.endTime);

            var startClockTime = moment(startdate.getTime()).format('HH:mm');
            var endClockTime = moment(enddate.getTime()).format('HH:mm');

            var timeRange = convertToUnixOffset(startClockTime, endClockTime, $scope.newDeal.timezone);

            $scope.newDeal.startTime = timeRange[0];
            $scope.newDeal.endTime = timeRange[1];

            //$scope.newDeal.timezone = $scope.biz.timezone;

            console.log($scope.newDeal);  

            var start = new Date($scope.newDeal.startTime);
            var startDate = moment(start.getTime()).format('YYYYMMDD');
            var end = new Date($scope.newDeal.endTime);
            var endDate = moment(end.getTime()).format('YYYYMMDD');

            var currentDay = moment().tz($scope.newDeal.timezone).format('dddd').toLowerCase();

            
            //$scope.newDeal.lastVerified = today;
            


            // create recurring template
            /*var recKey = fbutil.ref('recurringDeals').push().key();
            $scope.newDeal['key'] = recKey;
            fbutil.ref('recurringDeals/' + recKey).set($scope.newDeal);*/

            //$scope.startNewDeal();
            //       // if ($rootScope.blackList != true) {  
            //            mixpanel.track("Add Deal", {"Email": Auth.AuthData.password.email, "Business": biz.businessName});
            //       // }
            $scope.dealSubmitted = {};
            $scope.dealSubmitted = {
                approved: false,
                editedDeal: true,
                editedAt: today,
                submittedByUID: $rootScope.authUserData.uid,
                submittedByUsername: $rootScope.currentUser.username,
                userSubmitted: true,
                recurringDealID: $scope.newDeal.$id,
                daysOfWeek: $scope.newDeal.daysOfWeek,
                description: $scope.newDeal.description,
                foodOrDrink: $scope.newDeal.foodOrDrink,
                name: $scope.newDeal.name,
                startTime: $scope.newDeal.startTime,
                endTime: $scope.newDeal.endTime,
                locName: $scope.newDeal.locName,
                businessID: $scope.newDeal.businessID
            }
            
//            var recKey = $rootScope.mealsteals.child('crowdSource').push().key();
//            $scope.dealSubmitted['key'] = recKey;
//            $rootScope.mealsteals.child('crowdSource/' + recKey).set($scope.dealSubmitted, function(){
//                alert('success!');
//            });
          
            $rootScope.mealsteals.child('crowdSource').push($scope.dealSubmitted, function(){
                //console.log($scope.newDeal);
                $scope.showEditDealBtn = true;
                editPopup.close();
                $timeout(function(){
                    $scope.openSuccessPopup();
                 },1000);
            });
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
    
    
  $scope.viewOptions = {'displayBizInfo':'deals'};  
  //$scope.viewOptions = {'displayRating':'total'}; 
    
  $scope.totalRatings = 0;
    
  $scope.showLoading = function() {
    $ionicLoading.show({
      templateUrl:"templates/loading.html",
        duration: 3000
    });
  };

  $scope.hideLoading = function() {
    $ionicLoading.hide();
  };

  //$scope.showLoadingProperTimes();  
  
    
  $scope.fuWidth=window.innerWidth;

  $scope.kmToMile = function(km){
		var miles = km * 0.621371;
		return miles;
	};
    
  
    
    

	$scope.timestamp = Timestamp.getTimestamp();
	var cancelInterval = $interval(function(){
	  	$scope.timestamp = Timestamp.getTimestamp();
	}, 1000);

    $scope.trueTime = new Date().getTime();
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
    
    $scope.launchNavigator = function() {
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Navigator", {"Email": $rootScope.userAuthEmail});
        }
        var destination = [$scope.deal.lat, $scope.deal.lon];
        var start = null;
        $cordovaLaunchNavigator.navigate(destination, start).then(function() {
          console.log("Navigator launched");
        }, function (err) {
          console.error(err);
        });
    };
    
    $scope.launchUber = function() {
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Uber", {"Email": $rootScope.userAuthEmail});
        }
        launchnavigator.isAppAvailable(launchnavigator.APP.UBER, function(isAvailable){
            var app;
            if(isAvailable){
                app = launchnavigator.APP.UBER;
            }else{
                $ionicPopup.alert({
                    title: 'You dont have Uber downloaded'
                });
            }
            var destination = [$scope.deal.lat, $scope.deal.lon];
            var start = null;
            launchnavigator.navigate(destination, {
                app: app
            });
        });
    };
    
    $scope.shareFbPlugin = function() {
        facebookConnectPlugin.showDialog({
            method: "share",
            picture:$scope.deal.dealFullImage,
            name:'Test Post',
            message:'First photo post',
            caption: $scope.deal.locName,
            description: $scope.deal.name
          }, function (response) {
            console.log(response)
          }, function (response) {
            console.log(response)
          }
        );
    };
    
    
    $scope.inviteFriends = function (){
        facebookConnectPlugin.appInvite(
    {
        url: "https://fb.me/1982324792003755",
        picture: "http://mealsteals.com/images/mealsteals/appicon.png"
    },
    function(obj){
        if(obj) {
            if(obj.completionGesture == "cancel") {
                // user canceled, bad guy
            } else {
                // user really invited someone :)
            }
        } else {
            // user just pressed done, bad guy
        }
    },
    function(obj){
        // error
        console.log(obj);
    }
);  
    };
    
    $scope.share = function(){
        var myPopup = $ionicPopup.show({
        title: '<span style="color:#444444;">Tell your friends!</span>',
        templateUrl: 'templates/share.html',
        scope: $scope,
        cssClass: 'share-popup',
        buttons: [
          {
            text: '<b>Cancel</b>',
            onTap: function(e) { 
            
            }
          }
        ]
        });
        
    };
    
    
    $scope.shareFB = function(dealName, locName, imageURL){
	 	var message = dealName + ' at ' + locName + '!';
	 	var image = imageURL;
	 	var link = 'q-r.to/badwFH';
        console.log(message, image, link);
        console.log($rootScope.currentUser);
        $cordovaSocialSharing
         .shareViaFacebookWithPasteMessageHint(message, image, null)
        .then(function(result) {
          // Success!
            if(!angular.isUndefined($rootScope.currentUser)){
                var time = new Date();
                var stamp = time.getTime();
                var day = moment(time).format("YYYYMMDDhhmm");
                 if(!angular.isUndefined($rootScope.currentUser.shares)){
                    $rootScope.currentUser.shares[day] = $scope.deal;
                 }else{
                     $rootScope.currentUser['shares'] = {};
                     $rootScope.currentUser.shares[day] = $scope.deal;
                 }
                $rootScope.currentUser.$save();
                //console.log($rootScope.currentUser);
            }
            
        }, function(err) {
          // An error occurred. Show a message to the user
            console.log('error');
        });
    };
    
    
    $scope.shareTW = function(dealName, locName, imageURL){
	 	var message = dealName + ' at ' + locName + '!';
	 	var image = imageURL;
	 	var link = 'q-r.to/badwFH';
         console.log(message, image, link);
        $cordovaSocialSharing
        .shareViaTwitter(message, image, link)
        .then(function(result) {
          // Success!
            
            if(!angular.isUndefined($rootScope.currentUser)){
                var time = new Date();
                var stamp = time.getTime();
                var day = moment(time).format("YYYYMMDDhhmm");
                 if(!angular.isUndefined($rootScope.currentUser.shares)){
                    $rootScope.currentUser.shares[day] = $scope.deal;
                 }else{
                     $rootScope.currentUser['shares'] = {};
                     $rootScope.currentUser.shares[day] = $scope.deal;
                 }
                $rootScope.currentUser.$save();
                console.log($rootScope.currentUser);
            }
            
        }, function(err) {
          // An error occurred. Show a message to the user
        });
    };
    
    $scope.shareWA = function(dealName, locName, imageURL){
	 	var message = dealName + ' at ' + locName + '!';
	 	var image = imageURL;
	 	var link = 'q-r.to/badwFH';
         console.log(message, image, link);
        $cordovaSocialSharing
        .shareViaWhatsApp(message, image, link)
        .then(function(result) {
          // Success!
        }, function(err) {
          // An error occurred. Show a message to the user
        });
    };
    
    $scope.shareSMS = function(dealName, locName, imageURL){
        console.log('text');
	 	var message = dealName + ' at ' + locName + '!';
         
         $cordovaSocialSharing
        .shareViaSMS(message)
        .then(function(result) {
          // Success!
             if(!angular.isUndefined($rootScope.currentUser)){
                var time = new Date();
                var stamp = time.getTime();
                var day = moment(time).format("YYYYMMDDhhmm");
                 if(!angular.isUndefined($rootScope.currentUser.shares)){
                    $rootScope.currentUser.shares[day] = $scope.deal;
                 }else{
                     $rootScope.currentUser['shares'] = {};
                     $rootScope.currentUser.shares[day] = $scope.deal;
                 }
                 $rootScope.currentUser.$save();
                 console.log($rootScope.currentUser);
             }
             
        }, function(err) {
          // An error occurred. Show a message to the user
        });
    };
    
    $scope.shareEM = function(dealName, locName, imageURL){
        //console.log('email');
        //var subject = '';
	 	var message = dealName + ' at ' + locName + '!';
         
        $cordovaSocialSharing
        .shareViaEmail(message)
        .then(function(result) {
          // Success!
        }, function(err) {
          // An error occurred. Show a message to the user
        });

    };
    
    var verifyBizDetailsPopup;
    $scope.verifyBizDetails = function(){
        verifyBizDetailsPopup = $ionicPopup.show({
        title: $scope.deal.locName,
        templateUrl: 'templates/verify-biz-popup.html',
        scope: $scope,
        animation: 'slide-in-up',
        cssClass: 'verify-biz-popup',
        });   
    }; 
    
    $scope.closeVerifyBizDetails = function(){
        verifyBizDetailsPopup.close();  
    };
    
    $scope.verifyDeal = function(){
        var today = Date.now();
        var start = new Date($scope.deal.startTime);
        var startDate = moment(start.getTime()).format('YYYYMMDD');
        var verifiedObj = {};
        var verifiedArr = {};
        verifiedArr[ today ] = $rootScope.authUserData.uid;

        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/lastVerified').set(today);
        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/verifiedObject/' + today).set($rootScope.authUserData.uid);

        //'/recurringDeals/' + $scope.deal.recurringDealID
        if ($scope.deal.recurringDealID){ 
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/lastVerified').set(today);
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/verifiedObject/' + today).set($rootScope.authUserData.uid);
        }

        $scope.popover.hide();
        $scope.daysVerified = 'Verified today by '+$rootScope.currentUser.username; 
    };
    
    $scope.makeUserSubmitted = function () {
        var today = Date.now();
        var start = new Date($scope.deal.startTime);
        var startDate = moment(start.getTime()).format('YYYYMMDD');
        var verifiedObj = {};
        var verifiedArr = {};
        verifiedArr[ today ] = $rootScope.authUserData.uid;

        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/userSubmitted').set(true);
        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/icon').set('http://dashboard.mealsteals.com/app/images/user-submitted-icon.png');
        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/submittedByUID').set($rootScope.authUserData.uid);
        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/submittedByUsername').set($rootScope.currentUser.username);

        //'/recurringDeals/' + $scope.deal.recurringDealID
        if ($scope.deal.recurringDealID){ 
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/icon').set('http://dashboard.mealsteals.com/app/images/user-submitted-icon.png');
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/userSubmitted').set(true);
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/submittedByUID').set($rootScope.authUserData.uid);
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/submittedByUsername').set($rootScope.currentUser.username);
        }

        $scope.popover.hide();
        
    };
    
    $scope.removeUserSubmitted = function () {
        var today = Date.now();
        var start = new Date($scope.deal.startTime);
        var startDate = moment(start.getTime()).format('YYYYMMDD');
        var verifiedObj = {};
        var verifiedArr = {};
        verifiedArr[ today ] = $rootScope.authUserData.uid;

        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/userSubmitted').set(null);
        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/icon').set($scope.biz.icon);
        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/submittedByUID').set(null);
        $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/submittedByUsername').set(null);

        //'/recurringDeals/' + $scope.deal.recurringDealID
        if ($scope.deal.recurringDealID){ 
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/icon').set($scope.biz.icon);
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/userSubmitted').set(null);
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/submittedByUID').set(null);
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/submittedByUsername').set(null);
        }

        $scope.popover.hide();
        
    };
    
    $scope.verifyDealPopupAdmin = function() {
        if($rootScope.currentUser){
                console.log($scope.deal);
                console.log($scope.biz);
                    var myPopup = $ionicPopup.show({
                    title: 'Verify deal?',
                    subTitle: 'Help maintain a great deal hunting experience by verifying if deals are still current',
                    scope: $scope,
                    cssClass: 'verify-popup',
                    buttons: [
                      {
                        text: '<b>Verify</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            $scope.verifyDeal();
                        }
                      },
                        {
                        text: '<b>User Submitted</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            $scope.makeUserSubmitted();
                        }
                      },
                        {
                        text: '<b>Remove User Submitted</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            $scope.removeUserSubmitted();
                        }
                      },
                        {
                        text: '<b>Cancel</b>',
                        onTap: function(e) {   
                          $scope.popover.hide();
                        }
                      }
                    ]
                    });
                }else{

                    $scope.promptLogin();
            }  
    };
    
    
    $scope.verifyDealPopup = function() {
        if($rootScope.currentUser){
                console.log($scope.deal);
                console.log($scope.biz);
                    var myPopup = $ionicPopup.show({
                    title: '<div><i class="ion-checkmark-round"></i><div><div class="popup-title-generic">Verify Deal?</div>',
                    subTitle: 'Help maintain a great deal hunting experience by verifying if deals are still current',
                    scope: $scope,
                    cssClass: 'generic-popup',
                    buttons: [
                        
                        {
                        text: 'Cancel',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          $scope.popover.hide();
                        }
                      },
                      {
                        text: '<b>Verify</b>',
                        type: 'button-popup-clear',
                        onTap: function(e) {
                            $scope.verifyDeal();
                        }
                      }
                    ]
                    });
                }else{

                    $scope.promptLogin();
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
                          $scope.popover.hide();
                        }
                      },
                      {
                        text: '<b>Login</b>',
                        type: 'button-popup-clear',
                        onTap: function(e) {

                          $scope.popover.hide();

                            $state.go('app.account');
                        }
                      }
                    ]
            });  
    };
	
    // got it popup
    var gotitPopup;
    $scope.gotitPopup = function(){
      /*$timeout(function(){
      var popupElements = document.getElementsByClassName("popup-container")
      if (popupElements.length) {
        $scope.popupElement = angular.element(popupElements[0]);
          $scope.popupElement.addClass('animated')
          $scope.popupElement.addClass('slideInUp')
      };
    }, 1)*/
        gotitPopup = $ionicPopup.show({
        //title: '<span style="color:#444444;">Tell your friends!</span>',
        templateUrl: 'templates/gotit.html',
        scope: $scope,
        animation: 'slide-in-up',
        cssClass: 'gotit-popup',
        });
        
    };
    //$scope.gotitPopup(); 
    
    $scope.closeGotitPopup = function(){
        gotitPopup.close();  
    };

//  DealData.fetch($stateParams.dealId).then(function(d){
      console.log($stateParams.dealId);
    
      var d = $rootScope.todayObj[$stateParams.dealId];
      $scope.score = 0;
      
      $scope.deal = d;
    
      if ($scope.deal.lastVerified && $scope.deal.createdAt) {
            //take lastVerified 
      } else if (!$scope.deal.lastVerified && $scope.deal.createdAt) {
            //take createdAt
      } else if (!$scope.deal.lastVerified && !$scope.deal.createdAt) {
            $scope.daysVerified = "Be the first to verify this deal"
      } else {
            // take lastVerified
            var daysVerified = Math.floor(($scope.trueTime - $scope.deal.lastVerified)/86400000);
      }
    
      if ($scope.deal.verifiedObject) {
          var verifiedUID = $scope.deal.verifiedObject[$scope.deal.lastVerified];
          $scope.verifiedByUser = $firebaseObject(($rootScope.mealsteals.child('/users_app/'+verifiedUID+'/meta')));
          $scope.verifiedByUser.$loaded(function(){
              console.log($scope.verifiedByUser.username);
              console.log($scope.verifiedByUser);
              if (daysVerified == 0) {
                  $scope.daysVerified = 'Verified today by '+$scope.verifiedByUser.username;
              }
              if (daysVerified > 0) {
                  $scope.daysVerified = 'Verified '+daysVerified+' ago by '+$scope.verifiedByUser.username;
              }
          });
      }
    
      console.log($scope.deal);
      //ratings check
      
      if(!angular.isUndefined(d.recurringDealID)){
          
          var recurringFB = new Firebase($rootScope.mealsteals + '/recurringDeals/' + d.recurringDealID);
          var recurringObj = $firebaseObject(recurringFB);
          
          recurringObj.$loaded(function(thisRec){
          
              $scope.recurringObj = thisRec;
              
              if(!angular.isUndefined(thisRec.ratings)){


                  $scope.score = 0;


                     for (var rate in thisRec.ratings) { 

                         $scope.score += thisRec.ratings[rate].rating;
                      }

                      $scope.dealRating = $scope.score / Object.keys(thisRec.ratings).length;
                      $scope.totalRatings = Object.keys(thisRec.ratings).length;
                      var showRate = $scope.dealRating;
                      $scope.showRate = showRate;

              }else{

                  $scope.score = 0;
                  $scope.dealRating = 0;
                  var showRate = $scope.dealRating;
                  $scope.showRate = showRate;

              }
      });
          
      }else{
          
          if(!angular.isUndefined(d.ratings)){
              
              $scope.score = 0;  
              
                 for (var rate in $scope.deal.ratings) { 
                    $scope.score += $scope.deal.ratings[rate].rating;
                  }

                  $scope.dealRating = $scope.score / Object.keys($scope.deal.ratings).length;
                  $scope.totalRatings = Object.keys($scope.deal.ratings).length;
                  var showRate = $scope.dealRating;
                  $scope.showRate = showRate;
              
              
          }else{
              $scope.score = 0;
              $scope.dealRating = 0;
              var showRate = $scope.dealRating;
              $scope.showRate = showRate;
          }
      }
        
      if($rootScope.currentUser){
      
      if(!angular.isUndefined($scope.deal.recurringDealID)){
          
          if(!angular.isUndefined($rootScope.currentFavs.deals)){
              if(!angular.isUndefined($rootScope.currentFavs.deals[$scope.deal.recurringDealID])){
                  $scope.dealFavorited = true;
              }else{
                  $scope.dealFavorited = false;
              }
            }
      }
          if(!angular.isUndefined($rootScope.currentFavs.businesses)){
              if(!angular.isUndefined($rootScope.currentFavs.businesses[$scope.deal.businessID])){
                  $scope.busFavorited = true;
              }else{
                  $scope.busFavorited = false;
              }
          }
      }
  
      
     // mixpanel.track("Serve Ad", {"Email": $rootScope.userAuthEmail});
      //mixpanel analytics
      
      if($rootScope.analyticsFlag!=true){
          mixpanel.track("Deal Detail Viewed", {"Email": $rootScope.userAuthEmail});
      }
      
      
      $scope.redeemCheck = function($event){
           if($rootScope.currentUser){
            
               $scope.redeemConfirmed();
               $scope.redeemPopover();
               $scope.openPopover($event);
               
            }else{
                
                $scope.promptLogin();
            }
      }
      

    
    $scope.redeemConfirmed = function (){
        
        if(!angular.isUndefined($rootScope.currentUser)){
        
                if (distanceAway<0.1){
             
                    if(!angular.isUndefined($rootScope.currentUser.lastCheckIn)){
                        
                        var halfHour = 30 * 60 * 1000; /* ms */
                        
                            
                           if(($scope.trueTime - $rootScope.currentUser.lastCheckIn) < halfHour){
                               //cannot check in multiple times this quickly you crazy person
                                var alertPopup = $ionicPopup.alert({
                                     title: 'Cannot check in or redeem again so soon!',

                                   });
                           }else{
                               $rootScope.redeemed($scope.deal);
                                var alertPopup = $ionicPopup.alert({
                                 title: 'Redeemed!',

                               });
                               
                               if($rootScope.analyticsFlag!=true){
                                    mixpanel.track("Redeem at location!", {"Confirmed": d.locName+d.name+distanceAway});
                               }
                           }
                       }else{
                           
                               $rootScope.redeemed($scope.deal);
                                var alertPopup = $ionicPopup.alert({
                                 title: 'Redeemed!',

                               });
                           
                                if($rootScope.analyticsFlag!=true){
                                    mixpanel.track("Redeem at location!", {"Confirmed": d.locName+d.name+distanceAway});
                                }
                       }
                           
                    }else{
                        
                        var alertPopup = $ionicPopup.alert({
                         title: 'Too far away!',

                       });
                    }
        }else{
                
                $scope.promptLogin();
            }
            
            
            
        
    };
      
      // for limit to to work, needs to be converted 
      $scope.comments = []

     
      var recurringFB = new Firebase($rootScope.mealsteals + '/recurringDeals/' + d.recurringDealID);
      var recurringObj = $firebaseObject(recurringFB);
          
      recurringObj.$loaded(function(){
          $scope.recurringObj = recurringObj;
          if(!angular.isUndefined($scope.recurringObj.ratings)){
               angular.forEach($scope.recurringObj.ratings, function(rate, key){
                   rate['uid'] = key;
                   console.log(rate);
                   console.log(key);

                    var image = $firebaseObject($rootScope.mealsteals.child('/users_app/' + key));
                    image.$loaded(function(){
                        //console.log(image);
                       if(!angular.isUndefined(image.profilePicture)){
                           rate['profilePicture'] = image.profilePicture;
                       } else {
                           rate['profilePicture'] = undefined;
                       }


                       console.log(rate);
                       $scope.comments.push(rate);
                    });
                });
            }
        });
//       var comment = new Firebase("https://mealsteals.firebaseio.com/recurringDeals/" + $scope.deal.recurringDealID + "/ratings");
//        $scope.comments = $firebaseObject(comment);

      console.log($scope.comments);
      
  	  var currentLocation = Location.currentLocation();
	  var distanceAway = GeoFire.distance([$scope.deal.lat, $scope.deal.lon], currentLocation);

	  $scope.distanceAway = Math.round(distanceAway * 10) / 10;

	  $scope.tab = 'info';

	  $scope.startTime = moment($scope.deal.startTime).format("h:mm A");
	  $scope.endTime = moment($scope.deal.endTime).format("h:mm A");

	  //this is currently loaded first load of every deal detail, eventually when this wont be the default it should go in a button to improve load times.
      $scope.busRecurringDeals = $firebaseArray((recurringFB).orderByChild('businessID').equalTo($scope.deal.businessID));
      //$scope.thisDealObj = $firebaseArray($rootScope.mealsteals.child('/deals/' + $scope.deal.key));
      
      
    
    
    
        $timeout(function(){
            initialize();
	     },1000);
    
    function initialize() {
        $scope.biz = $firebaseObject(($rootScope.mealsteals.child('/businesses/'+$scope.deal.businessID)));
        $scope.biz.$loaded(function(){
        console.log($scope.biz);
		var pos = Location.currentLocation();
		var loc = new google.maps.LatLng(pos[0],pos[1]);
        
		var bizLoc = new google.maps.LatLng($scope.biz.lat, $scope.biz.lon);

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
            
        var icon = {
            url: $scope.biz.icon,
            scaledSize: new google.maps.Size(40, 40),// scaled size
        };    
            
	    $scope.map = new google.maps.Map(document.getElementById("dealDetailMap"),mapOptions);
        
        var infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService($scope.map);

        service.getDetails({
          placeId: $scope.biz.placeId
        }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {

              $scope.placeDetails = place;
              console.log(place);
          }
        });

	    var marker1 = new google.maps.Marker({
	      position: loc,
	      map: $scope.map,
          //scaledSize: new google.maps.Size(40, 40), // scaled size
	    });

	    var marker2 = new google.maps.Marker({
	      position: bizLoc,
	      map: $scope.map,
	      icon: icon,
          //scaledSize: new google.maps.Size(40, 40), // scaled size
	    });  
        });
    }
    
      // alert for google place id   
      // right now innerHTML is coming back undefined??
      /*$scope.busObj = $firebaseObject(($rootScope.mealsteals.child('/businesses/'+$scope.deal.businessID)));
      $scope.busObj.$loaded(function(){
        //alert($scope.busObj.placeId);
        var placeId = $scope.busObj.placeId;
        var service = new google.maps.places.PlacesService();
        service.getDetails({
          placeId: placeId
        }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              console.log(place);
              $scope.openNow = place.opening_hours.open_now;
          }
        });
      });*/

//  });

    $scope.loadMap = function(){
	   
        //needs 1 sec delay otherwise map breaks, also needs cache which was added into app.js for controller
        $timeout(function(){
            initialize();
	     },1000);
   
        function initialize() {

		
		var pos = Location.currentLocation();
		var loc = new google.maps.LatLng(pos[0],pos[1]);
        
        

		var bizLoc = new google.maps.LatLng($scope.deal.lat, $scope.deal.lon);

        
        

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
            
        var icon = {
            url: $scope.deal.icon,
            scaledSize: new google.maps.Size(40, 40),// scaled size
        };    
            
	    $scope.map = new google.maps.Map(document.getElementById("detailMap"),mapOptions);

	    var marker1 = new google.maps.Marker({
	      position: loc,
	      map: $scope.map,
          //scaledSize: new google.maps.Size(40, 40), // scaled size
	    });

	    var marker2 = new google.maps.Marker({
	      position: bizLoc,
	      map: $scope.map,
	      icon: icon,
          //scaledSize: new google.maps.Size(40, 40), // scaled size
	    });
        

	   }
    };
    
    
    
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
    
//    
//    Follow Deal & Business
//    
//    
//    
    
    
        $scope.followDeal = function(){
            
            if($scope.dealFavorited!=true){
        
                if($rootScope.currentUser){
                    $rootScope.addFavDeal($scope.deal.recurringDealID, $scope.recurringObj);
                    $scope.dealFavorited = true;
                     var myPopup = $ionicPopup.show({
                        title: 'Favorited '+$scope.deal.name
                      });
                      $timeout(function() {
                        myPopup.close(); //close the popup after 4 seconds
                      }, 2000);
                }else{

                    $scope.promptLogin();
                }
            } else {
                $rootScope.removeFavDeal($scope.deal.recurringDealID);
                $scope.dealFavorited = false;
            }
        };
    
        /* $scope.unFollowDeal = function(){
        
             
            $rootScope.removeFavDeal($scope.deal.recurringDealID);
            $scope.dealFavorited = false;
        };*/
    
         $scope.followBus = function(){
        
             if($scope.busFavorited!=true){
             
                if($rootScope.currentUser){
                     var bizID = $scope.deal.businessID;
                     $rootScope.addFavBus(bizID, $rootScope.busFB[bizID]);
                     $scope.busFavorited = true;
                     $ionicPopup.alert({
                        title: '<div><i class="ion-heart"></i><div><div class="popup-title-generic">Favorited '+$scope.deal.locName+'</div>',
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
             } else {
                 var bizID = $scope.deal.businessID;
                $rootScope.removeFavBus(bizID);
                $scope.busFavorited = false;
                $ionicPopup.alert({
                        title: '<div><i class="ion-heart-broken"></i><div><div class="popup-title-generic">Unfavorited '+$scope.deal.locName+'</div>',
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
    
    /*
     title: '<div><i class="ion-person"></i><div><div class="popup-title-generic">Login</div>',
                    subTitle: 'Must be logged in to favorite deals',
                    cssClass: 'generic-popup',
                    scope: $scope,
                    buttons: [
                      {
                        text: 'Cancel',
                        type: 'button-popup-clear',
                        onTap: function(e) {   
                          $scope.popover.hide();
                        }
                      },
                      {
                        text: '<b>Login</b>',
                        type: 'button-popup-clear',
                        onTap: function(e) {

                          $scope.popover.hide();

                            $state.go('app.account');
                        }
                      }
    */
    
    /*     $scope.unFollowBus = function(){
        
             var bizID = $scope.deal.businessID;
            $rootScope.removeFavBus(bizID);
             $scope.busFavorited = false;
            
        };*/

//    
//    Follow Deal & Business
//    END
   
    
        //      
        //      Check-In
        //      

    
    $scope.checkIn = function(){
        
        if($rootScope.currentUser){
             
            
                if ($scope.distanceAway<0.1){
                    
                    if(!angular.isUndefined($rootScope.currentUser.lastCheckIn)){
                        
                        var halfHour = 30 * 60 * 1000; /* ms */
                        
                            
                           if(($scope.trueTime - $rootScope.currentUser.lastCheckIn) < halfHour){
                               //cannot check in multiple times this quickly you crazy person
                                var alertPopup = $ionicPopup.alert({
                                     title: 'Cannot check in again so soon!',

                                   });
                           }else{
                               $rootScope.checkIn($scope.deal);
                                var alertPopup = $ionicPopup.alert({
                                 title: 'Checked In!',

                               });
                           }
                       }else{
                           
                               $rootScope.checkIn($scope.deal);
                                var alertPopup = $ionicPopup.alert({
                                 title: 'Checked In!',

                               });
                           
                       }
                    
                    
                    
                    
                }else{
                    
                    var alertPopup = $ionicPopup.alert({
                     title: 'Too Far away!',
                   
                   });

                }

            
                 
            }else{
                
                $scope.promptLogin();
            }
        
    }
      
      
      
        //      
        //      Check-In END
        //      
      
    
//    
//    Ratings
//   
    $scope.commentLimit = 9999999;
    $scope.moreComments = function() {
        $scope.commentLimit = 99999;
        $(".comments-body").removeClass("comment-fade");
       // $(".comments-body").addClass("more-padding");
    };
    
    /*$scope.submitRating = function(rate, comment) {
        if (comment !=undefined && comment !=''){
            $scope.submitComment(comment);
        }
        ratePopup.close();
        if (rate != undefined) {
            $scope.rate(rate, rate);
            $timeout(function() {
                ratePopup.close();
            }, 2000);
        }
    };*/
    var ratePopup;
    
    $scope.closeRating = function() {
        ratePopup.close();  
    };
    
    $scope.commentPopup = function(){
        if(!angular.isUndefined($rootScope.currentUser)){
            ratePopup = $ionicPopup.show({
                //template: '<textarea ng-model="data.comment"></textarea>',
                templateUrl:"templates/rate-deal.html",
                cssClass: 'rating-popup',
                title: 'Tell us about your experience.',
                scope: $scope,     
            });
        } else{
            $scope.promptLogin();
            
        }
    }; 
    
    $scope.getImage = function(uid){
      
        var image = $firebaseObject($rootScope.mealsteals.child('/users_app/' + uid));
//        image.$loaded(function(){
            console.log(image);
           if(!angular.isUndefined(image.profilePicture)){
               return image.profilePicture;
           } else {
               return undefined;
           }
//        });
    };
    
    $scope.submitComment = function(comment) {
            
             if(!angular.isUndefined(comment)){
                var start = new Date($scope.deal.startTime);
                var startDate = moment(start.getTime()).format('YYYYMMDD');
                var end = new Date($scope.deal.endTime);
                var endDate = moment(end.getTime()).format('YYYYMMDD');

                if(!angular.isUndefined($scope.deal.recurringDealID)){

                    $scope.recurringObj.ratings[$rootScope.authUserData.uid]['comment'] = comment;
                    
                    //set in recurring
                    $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/ratings/' + $rootScope.authUserData.uid).set($scope.recurringObj.ratings[$rootScope.authUserData.uid]);

                    //set in business
                    $rootScope.mealsteals.child('/businesses/' + $scope.deal.businessID + '/ratings/recurring/' + $scope.deal.recurringDealID  + '/' + $rootScope.authUserData.uid).set($scope.recurringObj.ratings[$rootScope.authUserData.uid]);

                   
                    console.log($scope.recurringObj.ratings[$rootScope.authUserData.uid]);

                }else{
                    
                    $scope.deal.ratings[$rootScope.authUserData.uid]['comment'] = comment;
                    //set one time deal
                    $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + $scope.deal.key + '/ratings/' + $rootScope.authUserData.uid).set($scope.deal.ratings[$rootScope.authUserData.uid]);
                    $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + $scope.deal.key + '/ratings/' + $rootScope.authUserData.uid).set($scope.deal.ratings[$rootScope.authUserData.uid]);

                    //set in business
                    $rootScope.mealsteals.child('/businesses/' + $scope.deal.businessID + '/ratings/onetime/' + $scope.deal.key  + '/' + $rootScope.authUserData.uid).set($scope.deal.ratings[$rootScope.authUserData.uid]);
                }
             }
        };
        
    
    
    
    
    
    $scope.submitRating = function(rating, comment){
        if(rating == undefined || rating == ''){
            
            
                    var alertPopup = $ionicPopup.alert({
                     title: 'You did not rate',
                     subTitle: 'click the stars to rate.',
                    });
            
        }else if(comment == undefined || comment == ''){
            
            
                    var alertPopup = $ionicPopup.alert({
                     title: 'You did not leave a comment',
                     subTitle: 'How was your experience?',
                    });
            
        }else{
                if($rootScope.analyticsFlag!=true){
                    mixpanel.track("Rate Deal", {"Email": $rootScope.userAuthEmail});
                }
                $scope.closeRating();
                $scope.popover.hide();

                $scope.score = 0;

                if(!angular.isUndefined($scope.deal.recurringDealID)){

                    if(!angular.isUndefined($scope.recurringObj.ratings)){
                            $scope.recurringObj.ratings[$rootScope.authUserData.uid] = {
                            'username': $rootScope.currentUser.username,
                            'rating': rating,
                            'timeStamp': $scope.trueTime};


                             for (var rate in $scope.recurringObj.ratings) { 

                                 console.log("in recurring for: ");
                                 console.log($scope.recurringObj.ratings[rate].rating);

                                 $scope.score += $scope.recurringObj.ratings[rate].rating;
                              }

                                console.log("score: " + $scope.score);
                                var objLength = Object.keys($scope.recurringObj.ratings).length;
                                console.log("length: " + objLength);
                                $scope.ratingCount = objLength;



                              $scope.dealRating = $scope.score / Object.keys($scope.recurringObj.ratings).length;
                              $scope.totalRatings = Object.keys($scope.recurringObj.ratings).length;




                            console.log("recurring ratings exist deal rating: " + $scope.dealRating);

                            $rootScope.newRating($scope.deal, 'recurring', $scope.dealRating, $scope.recurringObj.ratings[$rootScope.authUserData.uid]);
                           // $scope.commentPopup();

                            // highlight user rating
                            /*$scope.showRate = highlightRate;
                            console.log("show user rating: "+$scope.showRate);

                            $timeout(function() {
                                console.log($scope.dealRating);
                                 var showDealRate = $scope.dealRating;
                                 $scope.showRate = showDealRate;
                                 console.log("show total rating: "+$scope.showRate);
                                  }, 0);*/
                            if (comment !=undefined && comment !=''){
                                $scope.submitComment(comment);
                            }
    //                        ratePopup.close();
    //                        $scope.popover.hide();


                    }else{



                                $scope.dealRating =  rating;
                                $scope.recurringObj['ratings'] = {};
                                $scope.recurringObj.ratings[$rootScope.authUserData.uid] = {
                                'username': $rootScope.currentUser.username,
                                'rating': rating,
                                'timeStamp': $scope.trueTime};

                                $rootScope.newRating($scope.deal, 'recurring', $scope.dealRating, $scope.recurringObj.ratings[$rootScope.authUserData.uid]);
                                 //$scope.commentPopup();
                                console.log("recurring ratings doesn't exist: " + $scope.dealRating);

                                var showRate = $scope.dealRating;
                                $scope.showRate = showRate;

                                $scope.totalRatings = 1;

                                if (comment !=undefined && comment !=''){
                                    $scope.submitComment(comment);
                                }
    //                            ratePopup.close();
    //                            $scope.popover.hide();

                        }


                }else{

                    if(!angular.isUndefined($scope.deal.ratings)){

                            $scope.deal.ratings[$rootScope.authUserData.uid] = {
                            'username': $rootScope.currentUser.username,
                            'rating': rating,
                            'timeStamp': $scope.trueTime};

                             for (var rate in $scope.deal.ratings) { 
                                $scope.score += $scope.deal.ratings[rate].rating;
                              }

                              $scope.dealRating = $scope.score / Object.keys($scope.deal.ratings).length;
                              $scope.totalRatings = Object.keys($scope.deal.ratings).length;

                            console.log("deal ratings exist: " + $scope.dealRating);


                            $rootScope.newRating($scope.deal, 'onetime', $scope.dealRating, $scope.deal.ratings[$rootScope.authUserData.uid]);
                            //$scope.commentPopup();
                            var showRate = $scope.dealRating;
                            $scope.showRate = showRate;

                            if (comment !=undefined && comment !=''){
                                $scope.submitComment(comment);
                            }
                            //ratePopup.close();
                            //$scope.popover.hide();

                    }else{

                            $scope.deal['ratings'] = {};
                            $scope.deal.ratings[$rootScope.authUserData.uid] = {
                                'username': $rootScope.currentUser.username,
                                'rating': rating,
                                'timeStamp': $scope.trueTime};

                            $scope.dealRating = rating;

                            $rootScope.newRating($scope.deal, 'onetime', $scope.dealRating, $scope.deal.ratings[$rootScope.authUserData.uid]);
                            //$scope.commentPopup();

                            console.log("deal ratings doesn't exist: " + $scope.dealRating);
                            var showRate = $scope.dealRating;
                            $scope.showRate = showRate;

                            $scope.totalRatings = 1;

                            if (comment !=undefined && comment !=''){
                                $scope.submitComment(comment);
                            }
    //                        ratePopup.close();
    //                        $scope.popover.hide();

                    }
                }     
        
            $scope.closeRating();
        }
        
    }
    
    
    $scope.rateThisDeal = function () {
       
        if(!angular.isUndefined($rootScope.authUserData)){
            $scope.userRate = true; 

            if(!angular.isUndefined($scope.recurringObj.ratings)){
                if(!angular.isUndefined($scope.recurringObj.ratings[$rootScope.authUserData.uid])){
                    $scope.userRating = $scope.recurringObj.ratings[$rootScope.authUserData.uid].rating;
                }else{
                    $scope.userRating = 0;
                }

            }
        } else {
            
                            
                $scope.promptLogin();
            
        }
    };
    
    $scope.confirmRate = function () {
        $scope.userRate = false;
    };
    


    $scope.moreDeals = function() {
                if($rootScope.analyticsFlag!=true){
                    mixpanel.track("More Deals", {"Email": $rootScope.userAuthEmail});
                }
                console.log($scope.deal.businessID);
                $scope.busRecurringDeals = $firebaseArray(($rootScope.recurringFB).orderByChild('businessID').equalTo($scope.deal.businessID));
                console.log($scope.busRecurringDeals); 
    };
    
    $scope.imageEnlarge = function(){
      $(".deal-detail-image").addClass("grow");
      $(".deal-image-slider").addClass("grow");
      /*$timeout(function() {
                myPopup.close(); //close the popup after 4 seconds
              }, 0);*/
    };
    $scope.imageReturn = function(){
      $(".deal-detail-image").removeClass("grow"); 
      $(".deal-image-slider").removeClass("grow");
    };
    
    
    
    
    $scope.slideOptions = {
      //loop: true,
      //effect: 'fade',
      //speed: 500,
    }

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
    });
    
    function dataChangeHandler(){
      // call this function when data changes, such as an HTTP request, etc
      if ( $scope.slider ){
        $scope.slider.updateLoop();
      }
    }

    $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
      console.log('Slide change is beginning');
    });

    $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
      // note: the indexes are 0-based
      $scope.activeIndex = data.slider.activeIndex;
      $scope.previousIndex = data.slider.previousIndex;
    });
      
    $scope.myGoBack = function() {
        //console.log($ionicHistory.backView());
        $ionicHistory.goBack();
        $rootScope.doMapResize = false;
        if ($ionicHistory.backView() == null) {
            console.log('state.deals');
            $state.go('app.deals');
        }
    };
    
   /* $scope.myGoBack = function() {
        $ionicHistory.goBack();
        $rootScope.doMapResize = false;
    };*/
    
    /*$scope.swipe = function (direction) {
         if(direction == 'down') 
            $state.go('app.deals');
    }*/
    
     $scope.CallTel = function(tel) {
            //var tel = $scope.deal.phone;
            window.location.href = 'tel:'+ tel;
        }
     
     $scope.uploadPictureMessage = function() {
         var myPopup = $ionicPopup.show({
                title: '<div><i class="ion-images"></i><div><div class="popup-title-generic">Upload Photo</div>',
                template: 'We review each photo submission carefully. Only upload photos that relate to this deal, are high resolution, and engaging. The more artsy the better! :)',
                cssClass: 'generic-popup',
                scope: $scope,
                buttons: [
                  {
                    text: 'Cancel',
                    type: 'button-popup-clear',
                    onTap: function(e) {   
                    }
                  },
                    {
                    text: '<b>Got it</b>',
                    type: 'button-popup-clear',
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

        //xhr.upload.addEventListener("progress", uploadProgress, false);
//        xhr.addEventListener("load", uploadComplete, false);
//        xhr.addEventListener("error", uploadFailed, false);
//        xhr.addEventListener("abort", uploadCanceled, false);

        xhr.open('POST', 'http://s3.amazonaws.com/mealstealsyes/', true); //MUST BE LAST LINE BEFORE YOU SEND 

        xhr.send(fd);
        
        var url = "http://s3.amazonaws.com/mealstealsyes/" + key;
        
         $rootScope.mealsteals.child('/businesses/' + $scope.deal.businessID + '/sharedImages/' + timeID + '/').set({
            'user': $rootScope.authUserData.uid,
            'url':  url,
            'verified': false
            });
        

        var start = new Date($scope.deal.startTime);
        var startDate = moment(start.getTime()).format('YYYYMMDD');
        var end = new Date($scope.deal.endTime);
        var endDate = moment(end.getTime()).format('YYYYMMDD');
        
        if(!angular.isUndefined($scope.deal.recurringDealID)){
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
            
        }
        
        
                    var alertPopup = $ionicPopup.alert({
                     title: 'Thanks for sharing!',
                     subTitle: 'Verifying before the world can see.',
                    });
        
        
  }
    
    
    
   /* function uploadProgress(evt) {
    if (evt.lengthComputable) {
      var percentComplete = Math.round(evt.loaded * 100 / evt.total);
      document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    }
    else {
      document.getElementById('progressNumber').innerHTML = 'unable to compute';
    }
  }*/
     
     
})

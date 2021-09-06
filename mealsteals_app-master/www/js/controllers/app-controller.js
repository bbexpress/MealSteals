angular.module('starter.controllers')


.controller('AppCtrl', function($scope, $ionicPlatform, $ionicModal, $timeout, Auth, Profile, $ionDrawerVerticalDelegate, Timestamp, $ionicPopup, $state, $rootScope, $cordovaAppRate, $cordovaNativeStorage) {

    // native storage for clock
   /*  $ionicPlatform.ready(function () {
        // $scope.$apply(function () {
            $cordovaNativeStorage.getItem("seenClock").then(function (hasSeenClock) {
                    if (hasSeenClock = true){
                        $rootScope.hasSeenTimeShift = true;
                        console.log($rootScope.hasSeenTimeShift);
                    }
            });
         //});
     });*/
    //tell the system which active state, since there are at least two different controllers running at any given time there currently isn't an accurate way to determine this.  This should be added in the three main views.  It will be attached to a button in AppCtrl as well.  
    
    $scope.dealState = function() {
        $rootScope.activeState = 'deals';
        console.log("Active State: "+$rootScope.activeState);
    };
    
    $scope.accountState = function() {
        $rootScope.activeState = 'account';
        console.log("Active State: "+$rootScope.activeState);
    };
    
    $scope.profileState = function() {
        $rootScope.activeState = 'profile';
        console.log("Active State: "+$rootScope.activeState);
    };
    

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
    
  $scope.rateApp = function(){
      
      var myPopup = $ionicPopup.show({
        title: 'Rate MealSteals',
        subTitle: 'Tell everyone how much you love us!',
        scope: $scope,
        buttons: [
          {
            text: '<b>Cancel</b>',
            onTap: function(e) {                
            }
          },
          {
            text: '<b>Rate</b>',
            type: 'button-positive',
            onTap: function(e) {
                document.addEventListener("deviceready", function () {

                $cordovaAppRate.navigateToAppStore().then(function (result) {
                        // success
                    });
                  }, false);
            }
          }
        ]
        });
      
        

 /*  document.addEventListener("deviceready", function () {
        
   var customLocale = {};
        customLocale.title = "Rate MealSteals";
        customLocale.message = "If you enjoy using %@, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!";
        customLocale.cancelButtonLabel = "Cancel";
       // customLocale.laterButtonLabel = "Remind Me Later";
        customLocale.rateButtonLabel = "Rate It Now";

        AppRate.preferences.openStoreInApp = true;
        AppRate.preferences.storeAppURL.ios = '967099243';
        AppRate.preferences.storeAppURL.android = 'https://play.google.com/store/apps/details?id=com.mealstealsnew.mealstealsnew';
        AppRate.preferences.customLocale = customLocale;
        AppRate.preferences.displayAppName = 'MealSteals';
        AppRate.preferences.usesUntilPrompt = 0;
        AppRate.preferences.promptAgainForEachNewVersion = true;
        AppRate.promptForRating(false); 
        //If false is not present it will ignore usesUntilPrompt, promptAgainForEachNewVersion, and button logic, it will prompt every time.
    });   */
  };
    
  $scope.loadFacebook = function(){
        window.open('https://www.facebook.com/mealstealsmilwaukee/', '_blank', 'location=yes');  
  };
    
  $scope.loadTwitter = function(){
        window.open('https://twitter.com/mealsteals', '_blank', 'location=yes');  
  };
    
  $scope.loadInstagram = function(){
        window.open('https://www.instagram.com/mealsteals/', '_blank', 'location=yes');  
  };
    
  /* show message until user has clicked it once in lifetime 
    $rootScope.hasSeenTimeShiftBefore = 'yes';
    if(window.localStorage['hasSeenTimeShiftBefore']){
        // do nothing
    } else {
        $rootScope.hasSeenTimeShiftBefore = 'no';
    }
    $scope.clickedClockButton = function(){
        $rootScope.hasSeenTimeShiftBefore = 'yes';
        window.localStorage['hasSeenTimeShiftBefore'] = 'yes';
        //need CSS to hide it on first click, ng-class not dynamically updating?
        $("#timeshift-walkthrough").addClass("hide");
        $("#timeshift-walkthrough-under").addClass("hide");
    }*/
    
    $scope.clickedClockButton = function(){
        $rootScope.hasSeenTimeShift = true;
        $cordovaNativeStorage.setItem("seenClock", true).then(function (value) {
                console.log(value);
        $cordovaNativeStorage.getItem("seenClock").then(function (value) {
                    console.log(value);
                }, function (error) {
                    console.log(error);
                });
            }, function (error) {
                console.log(error);
            });
    };

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

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
    
    $scope.promptLogin = function(){
        var myPopup = $ionicPopup.show({
        title: 'Must be logged in to view future deals',
        scope: $scope,
        buttons: [
          {
            text: '<b>Cancel</b>',
            onTap: function(e) {                
            }
          },
          {
            text: '<b>Login</b>',
            type: 'button-positive',
            onTap: function(e) {
                $state.go('app.account');
            }
          }
        ]
        });    
    };    
    
     $rootScope.promptImageLogin = function(){
         
         var myPopup = $ionicPopup.show({
                title: 'Must be logged in to upload a photo',
                scope: $scope,
                buttons: [
                  {
                    text: '<b>Cancel</b>',
                    onTap: function(e) {                
                    }
                  },
                  {
                    text: '<b>Login</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $state.go('app.account');
                        //alertPopup.close();
                        
                    }
                  }
                ]
                });
     };
    
  // Timeshift drawer
    $scope.toggleDrawer = function(handle) {
        if ($rootScope.currentUser!=undefined){
        $ionDrawerVerticalDelegate.$getByHandle(handle).toggleDrawer();
        } else {
            $scope.promptLogin();
        }
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
            $rootScope.timeAdjustedBy = $scope.timeAdjustedBy;
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
            $rootScope.timeAdjustedBy = $scope.timeAdjustedBy;
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
    
    $scope.goToMap = function(){
        $rootScope.goToMap();  
    };
    
    $scope.feedback = function() {
        $scope.data = {};
          var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.feedback">',
            title: 'Feedback',
            //subTitle: 'whatever',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Send</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.data.feedback) {
                    //don't allow the user to send undefined data
                    e.preventDefault();
                  } else {
                    return $scope.data.feedback;
                  }
                }
              }
            ]
          });

      myPopup.then(function(feedback) {
        if (feedback != undefined){
            if ($rootScope.currentUser!=undefined){
            
                var timestamp = new Date().getTime();

                $rootScope.mealsteals.child('/feedback/' + timestamp).set({
                'username' : $rootScope.currentUser.username,
                'id' : $rootScope.authUserData.uid,
                'message' : feedback
                });
                // This is where the firebase call will go
            } else {
                var timestamp = new Date().getTime();

                $rootScope.mealsteals.child('/feedback/' + timestamp).set({
                'username' : 'None',
                'id' : 'None',
                'message' : feedback
                });
                // This is where the firebase call will go
                
            }
            var alertPopup = $ionicPopup.alert({
            title: 'Feedback',
            template: 'Thank you for your feedback!'
        });
        }
        
      });
    };
     
    
})

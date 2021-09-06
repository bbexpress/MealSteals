angular.module('starter.controllers')


.controller('AppCtrl', function($scope, $ionicPlatform, $ionicModal, $timeout, Auth, Profile, $ionDrawerVerticalDelegate, Timestamp, $ionicPopup, $state, $rootScope, $cordovaAppRate, $cordovaNativeStorage, $ionicSideMenuDelegate) {


    //tell the system which active state, since there are at least two different controllers running at any given time there currently isn't an accurate way to determine this.  This should be added in the three main views.  It will be attached to a button in AppCtrl as well.

    /**
    * Fixes native google map issue from showing menu over it
    */
    $scope.$watch(function(){
      return $ionicSideMenuDelegate.getOpenRatio();
      }, function(newValue, oldValue) {
        if (newValue == 0){
          $scope.hideLeft = true;
        } else{
          $scope.hideLeft = false;
        }
    });

    $scope.mapState = function(){
      $rootScope.activeState = 'map';
      console.log("Active State: "+$rootScope.activeState);
    }
    
     $scope.locationState = function(){
      $rootScope.activeState = 'location';
      console.log("Active State: "+$rootScope.activeState);
    }

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
    
  $scope.goToExplore = function() {
        $state.go('app.favorites');  
  };
    
  $scope.clearAllData = function () {
        localStorage.clear();
        alert('success');
  };
    
  $scope.inviteFriends = function (){
        if($rootScope.analyticsFlag!=true){
            mixpanel.track("Facebook invitation click", {"Email": $rootScope.userAuthEmail});
        }
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
                        if($rootScope.analyticsFlag!=true){
                            mixpanel.track("Facebook invitation sent", {"Email": $rootScope.userAuthEmail});
                        }
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
    
  $scope.rateAppMenu = function(){

      var myPopup = $ionicPopup.show({
        title: 'If you adore MealSteals, show some love with a review',
        //subTitle: 'If you adore MealSteals, show some love with a review',
        scope: $scope,
        cssClass: 'custom-popup',
        buttons: [
          {
            text: 'No thanks',
           // type: 'button-light',
            onTap: function(e) {
                
            }
          },
          {
            text: 'Rate',
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
  };

  $scope.rateApp = function(){

      var myPopup = $ionicPopup.show({
        title: 'If you adore MealSteals, show some love with a review',
        //subTitle: 'If you adore MealSteals, show some love with a review',
        scope: $scope,
        cssClass: 'custom-popup',
        buttons: [
          {
            text: 'No thanks',
            type: 'button-light',
            onTap: function(e) {
                 $rootScope.mealsteals.child('/users_app/' + $rootScope.authUserData.uid + '/meta/').update({
                    'dontShowRating': true
                  });
            }
          },
            {
            text: 'Maybe later',
            type: 'button-light',
            onTap: function(e) {
                
            }
          },
          {
            text: 'Rate',
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
  };
    
  $scope.$on('promptRating', function(event, args) {
        console.log('prompt');
        $timeout(function() {
            $scope.rateApp();
        }, 10000);
        
  });
    

  $scope.loadFacebook = function(){
        window.open('https://www.facebook.com/mealstealsapp/', '_blank', 'location=yes');
  };

  $scope.loadTwitter = function(){
        window.open('https://twitter.com/mealsteals', '_blank', 'location=yes');
  };

  $scope.loadInstagram = function(){
        window.open('https://www.instagram.com/mealsteals/', '_blank', 'location=yes');
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
           // $scope.promptLogin();
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
            template: '<textarea ng-model="data.feedback"></textarea>',
            title: 'Feedback',
            subTitle: 'We are always updating and looking for new ideas, please leave any feedback you may have below',
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

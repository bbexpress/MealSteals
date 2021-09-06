angular.module('starter.controllers')


.controller('DealDetailCtrl', function(Timestamp, $state, $ionicHistory, Auth, $state, $firebaseAuth, $cordovaSocialSharing, $firebaseObject, $firebaseArray, $scope, $rootScope, $stateParams, Location, DealData, $interval, $timeout, $ionicLoading, $ionicPopup, $ionicPopover, $ionicActionSheet, CordovaCamera) {

    
  $scope.viewOptions = {'displayBizInfo':'deals'};  
  //$scope.viewOptions = {'displayRating':'total'}; 
    
  $scope.totalRatings = 0;
    
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
    
    
    $scope.shareActionSheet = function(){
        // Triggered on a button click, or some other target
        

           // Show the action sheet
           var hideSheet = $ionicActionSheet.show({
             buttons: [
               { text: '<i class="action-fb ion-social-facebook"></i> Share via Facebook'},
               { text: '<i class="action-tw ion-social-twitter"></i> Share via Twitter' }
             ],
             //titleText: 'Share',
             cancelText: 'Cancel',
             cancel: function() {
                  // add cancel code..
                },
             buttonClicked: function(index) {
               return true;
             }
           });

         
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
            //console.log(id, d);
              
            }
          }
        ]
        });
        
    };
    
    
    $scope.shareFB = function(dealName, locName, imageURL){
	 	var message = dealName + ' at ' + locName + '!';
	 	var image = imageURL;
	 	var link = 'mealsteals.com';
        console.log(message, image, link);
        $cordovaSocialSharing
         .shareViaFacebook(message, image, link)
        .then(function(result) {
          // Success!
        }, function(err) {
          // An error occurred. Show a message to the user
        });
    };
    
    
    $scope.shareTW = function(dealName, locName, imageURL){
	 	var message = dealName + ' at ' + locName + '!';
	 	var image = imageURL;
	 	var link = 'mealsteals.com';
         console.log(message, image, link);
        $cordovaSocialSharing
        .shareViaTwitter(message, image, link)
        .then(function(result) {
          // Success!
        }, function(err) {
          // An error occurred. Show a message to the user
        });
    };
    
    $scope.shareWA = function(dealName, locName, imageURL){
	 	var message = dealName + ' at ' + locName + '!';
	 	var image = imageURL;
	 	var link = 'mealsteals.com';
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
	

  DealData.fetch($stateParams.dealId).then(function(d){
      
      

      $scope.score = 0;
      
      $scope.deal = d;
      
      //ratings check
      
      if(!angular.isUndefined(d.recurringDealID)){
          
         
          if(!angular.isUndefined($rootScope.recurringObj[d.recurringDealID].ratings)){
              
              
              $scope.score = 0;
              

                 for (var rate in $rootScope.recurringObj[$scope.deal.recurringDealID].ratings) { 

                     $scope.score += $rootScope.recurringObj[$scope.deal.recurringDealID].ratings[rate].rating;
                  }

                  $scope.dealRating = $scope.score / Object.keys($rootScope.recurringObj[$scope.deal.recurringDealID].ratings).length;
                  $scope.totalRatings = Object.keys($rootScope.recurringObj[$scope.deal.recurringDealID].ratings).length;
                  var showRate = $scope.dealRating;
                  $scope.showRate = showRate;

          }else{
              
              $scope.score = 0;
              $scope.dealRating = 0;
              var showRate = $scope.dealRating;
              $scope.showRate = showRate;
              
          }
          
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
  
      
      
      //mixpanel analytics
      
      if($rootScope.analyticsFlag == false){
          mixpanel.track(d.locName, {"Deal Detail": d.name});
          mixpanel.track(d.name, {"Business": d.locName});
          mixpanel.track("Deal Viewed", {"Business": d.locName});
          if (d.featured=='yes'){
                            mixpanel.track(d.locName, {"Click": "Featured"});
                            mixpanel.track("Featured Deal Detail", {"Business": d.locName});
                        }
      }
      
      
      $scope.redeemCheck = function($event){
           if($rootScope.currentUser){
            
               $scope.redeemConfirmed();
               $scope.redeemPopover();
               $scope.openPopover($event);
               
            }else{
                
                var myPopup = $ionicPopup.show({
                title: 'Must be logged in to Redeem this Deal.',
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
                               
                               if($rootScope.analyticsFlag == false){
                                    mixpanel.track("Redeem at location!", {"Confirmed": d.locName+d.name+distanceAway});
                               }
                           }
                       }else{
                           
                               $rootScope.redeemed($scope.deal);
                                var alertPopup = $ionicPopup.alert({
                                 title: 'Redeemed!',

                               });
                           
                                if($rootScope.analyticsFlag == false){
                                    mixpanel.track("Redeem at location!", {"Confirmed": d.locName+d.name+distanceAway});
                                }
                       }
                           
                    }else{
                        
                        var alertPopup = $ionicPopup.alert({
                         title: 'Too Far away!',

                       });
                    }
        }else{
                
                var myPopup = $ionicPopup.show({
                title: 'Must be logged in to Redeem.',
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
            
            
            
        
    };
      
      
      

  	  var currentLocation = Location.currentLocation();
	  var distanceAway = GeoFire.distance([$scope.deal.lat, $scope.deal.lon], currentLocation);

	  $scope.distanceAway = Math.round(distanceAway * 10) / 10;

	  $scope.tab = 'info';

	  $scope.startTime = moment($scope.deal.startTime).format("h:mm A");
	  $scope.endTime = moment($scope.deal.endTime).format("h:mm A");

	  //this is currently loaded first load of every deal detail, eventually when this wont be the default it should go in a button to improve load times.
      $scope.busRecurringDeals = $firebaseArray(($rootScope.recurringFB).orderByChild('businessID').equalTo($scope.deal.businessID));
      //$scope.thisDealObj = $firebaseArray($rootScope.mealsteals.child('/deals/' + $scope.deal.key));
      
      
      console.log(d);
      

  });

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
                    $rootScope.addFavDeal($scope.deal.recurringDealID, $rootScope.recurringObj[$scope.deal.recurringDealID]);
                    $scope.dealFavorited = true;
                     var myPopup = $ionicPopup.show({
                        title: 'Favorited '+$scope.deal.name
                      });
                      $timeout(function() {
                        myPopup.close(); //close the popup after 4 seconds
                      }, 2000);
                }else{

                    var myPopup = $ionicPopup.show({
                    title: 'Must be logged in to Favorite this Deal.',
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
                    var myPopup = $ionicPopup.show({
                        title: 'Favorited '+$scope.deal.locName
                      });
                      $timeout(function() {
                        myPopup.close(); //close the popup after 4 seconds
                      }, 2000);

                }else{

                    var myPopup = $ionicPopup.show({
                    title: 'Must be logged in to follow this Business.',
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
             } else {
                 var bizID = $scope.deal.businessID;
                $rootScope.removeFavBus(bizID);
                $scope.busFavorited = false;
             }
            
        };
    
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
                
                var myPopup = $ionicPopup.show({
                title: 'Must be logged in to Check-In.',
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
      
      
      
        //      
        //      Check-In END
        //      
      
    
//    
//    Ratings
//   
    $scope.comment = undefined;
    
    $scope.commentPopup = function($event){
        var myPopup = $ionicPopup.show({
        template: '<input type=textarea ng-model="comment">',
        title: 'Tell us about your experience.',
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
              $scope.popover.hide();
            }
          }
        ]
      });
    };
    
    
    
    
    
    $scope.rate = function(rating, highlightRate){
        
        //$scope.userRating = highlightRate;
        
        if(!angular.isUndefined($rootScope.currentUser)){
            
            
            
            $scope.score = 0;
            
            if(!angular.isUndefined($scope.deal.recurringDealID)){
                
                if(!angular.isUndefined($rootScope.recurringObj[$scope.deal.recurringDealID].ratings)){
                    
            
                    
                    $rootScope.recurringObj[$scope.deal.recurringDealID].ratings[$rootScope.authUserData.uid] = {
                    'username': $rootScope.currentUser.username,
                    'rating': rating,
                    'timeStamp': $scope.trueTime};
                    
                    
                     for (var rate in $rootScope.recurringObj[$scope.deal.recurringDealID].ratings) { 
                         
                         console.log("in recurring for: ");
                         console.log($rootScope.recurringObj[$scope.deal.recurringDealID].ratings[rate].rating);
                         
                         $scope.score += $rootScope.recurringObj[$scope.deal.recurringDealID].ratings[rate].rating;
                      }

                        console.log("score: " + $scope.score);
                    var objLength = Object.keys($rootScope.recurringObj[$scope.deal.recurringDealID].ratings).length;
                        console.log("length: " + objLength);
                        $scope.ratingCount = objLength;
                    
                       
                    
                      $scope.dealRating = $scope.score / Object.keys($rootScope.recurringObj[$scope.deal.recurringDealID].ratings).length;
                      $scope.totalRatings = Object.keys($rootScope.recurringObj[$scope.deal.recurringDealID].ratings).length;
                        
                     

            
                    console.log("recurring ratings exist deal rating: " + $scope.dealRating);
                    
                    $scope.commentPopup();
                    $rootScope.newRating($scope.deal, 'recurring', $scope.dealRating, $scope.comment);
                    
                    
                    // highlight user rating
                    $scope.showRate = highlightRate;
                    console.log("show user rating: "+$scope.showRate);

                    $timeout(function() {
                        console.log($scope.dealRating);
                         var showDealRate = $scope.dealRating;
                         $scope.showRate = showDealRate;
                         console.log("show total rating: "+$scope.showRate);
                          }, 0);
        
                    
                }else{
                    
                    $scope.dealRating =  rating;
                    $rootScope.recurringObj[$scope.deal.recurringDealID]['ratings'] = {};
                    $rootScope.recurringObj[$scope.deal.recurringDealID].ratings[$rootScope.authUserData.uid] = {
                    'username': $rootScope.currentUser.username,
                    'rating': rating,
                    'timeStamp': $scope.trueTime};
                    
                    $scope.commentPopup();
                    $rootScope.newRating($scope.deal, 'recurring',$scope.dealRating, $scope.comment);
                    
                    console.log("recurring ratings doesn't exist: " + $scope.dealRating);
                    
                    var showRate = $scope.dealRating;
                    $scope.showRate = showRate;
                    
                    $scope.totalRatings = 1;
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
                    
                    $scope.commentPopup();
                    $rootScope.newRating($scope.deal, 'onetime', $scope.dealRating, $scope.comment);
                    var showRate = $scope.dealRating;
                    $scope.showRate = showRate;

                }else{

                    $scope.deal['ratings'] = {};
                    $scope.deal.ratings[$rootScope.authUserData.uid] = {
                        'username': $rootScope.currentUser.username,
                        'rating': rating,
                        'timeStamp': $scope.trueTime};
                    $scope.dealRating = rating;
                    $scope.commentPopup();
                    $rootScope.newRating($scope.deal, 'onetime', $scope.dealRating, $scope.comment);
                    
                    console.log("deal ratings doesn't exist: " + $scope.dealRating);
                    var showRate = $scope.dealRating;
                    $scope.showRate = showRate;
                    
                    $scope.totalRatings = 1;
                    
                }
            }
            
        }else{
            var myPopup = $ionicPopup.show({
                title: 'Must be logged in for Rating.',
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
    
    
    
    
     $scope.rateHighlight = function(){
         //$scope.userRating = rating;
         //console.log("show user rating");
         //$timeout(function(){
				//console.log("show total rating");        
		//		          	},2000); // wait 5 seconds to allow time for featArray
        //$scope.viewOptions = {'displayRating':'user'};
        //$timeout(function() {
        //      $scope.viewOptions = {'displayRating':'total'}; //close the popup after 4 seconds
        //      }, 3000);
    };
    
//    
//    Ratings END
//    
    
    $scope.rateThisDeal = function () {
        $scope.userRate = true; 
        
        if(!angular.isUndefined($rootScope.recurringObj[$scope.deal.recurringDealID].ratings)){
            if(!angular.isUndefined($rootScope.recurringObj[$scope.deal.recurringDealID].ratings[$rootScope.authUserData.uid])){
                $scope.userRating = $rootScope.recurringObj[$scope.deal.recurringDealID].ratings[$rootScope.authUserData.uid].rating;
            }else{
                $scope.userRating = 0;
            }
    
        }
    };
    
    $scope.confirmRate = function () {
        $scope.userRate = false;
    };
    


    $scope.moreDeals = function() {
                console.log($scope.deal.businessID);
                $scope.busRecurringDeals = $firebaseArray(($rootScope.recurringFB).orderByChild('businessID').equalTo($scope.deal.businessID));
                console.log($scope.busRecurringDeals); 
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
    
       
    $scope.myGoBack = function() {
        $ionicHistory.goBack();
        $rootScope.doMapResize = false;
    };
    
     $scope.CallTel = function(tel) {
            //var tel = $scope.deal.phone;
            window.location.href = 'tel:'+ tel;
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

        xhr.upload.addEventListener("progress", uploadProgress, false);
//        xhr.addEventListener("load", uploadComplete, false);
//        xhr.addEventListener("error", uploadFailed, false);
//        xhr.addEventListener("abort", uploadCanceled, false);

        xhr.open('POST', 'http://s3.amazonaws.com/mealstealsyes/', true); //MUST BE LAST LINE BEFORE YOU SEND 

        xhr.send(fd);
        
        var url = "http://s3.amazonaws.com/mealstealsyes/" + key;
        
        if(!angular.isUndefined($scope.deal.recurringDealID)){
            $rootScope.mealsteals.child('/recurringDeals/' + $scope.deal.recurringDealID + '/sharedImages/' + timeID + '/').set({
            'user': $rootScope.authUserData.uid,
            'url':  url,
            'verified': false
            });
        }else{
            $rootScope.mealsteals.child('/deals/' + $scope.deal.key + '/sharedImages/' + timeID + '/').set({
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
    
    
    
    function uploadProgress(evt) {
    if (evt.lengthComputable) {
      var percentComplete = Math.round(evt.loaded * 100 / evt.total);
      document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    }
    else {
      document.getElementById('progressNumber').innerHTML = 'unable to compute';
    }
  }
     
     
})

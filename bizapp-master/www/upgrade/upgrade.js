angular.module('starter.controllers-upgrade', ['firebase', 'firebase.utils'])

.controller('UpgradeCtrl', function($scope, $rootScope, AccountBase, Auth, $timeout, $firebaseArray, $firebaseObject, fbutil, $state, $ionicPopup, $ionicModal, $ionicLoading, $ionicPlatform, $cordovaDialogs, $cordovaToast) {

  console.log('upgrade ctrl');
  
    $scope.AuthData = Auth.AuthData;
    
   if(window.localStorage['hasSeenUpgrade']){
        var hasSeenUpgrade = true;
    } else {
        var hasSeenUpgrade = false;
    }

   $ionicLoading.show({
      template: 'Loading...',
      duration: 1000
    });
    
  // Set some initial variables
  	$scope.fuHeight=window.innerHeight;
	$scope.fuWidth=window.innerWidth;
	$scope.inputWidth = Math.round($scope.fuWidth / 1.6);
	$scope.inputMargin = Math.round((($scope.fuWidth-$scope.inputWidth) / 2) / 1);
    
  var testKey = "pk_test_K6dCrNGaeDoyZhjU0Uypxh0M";
  var liveKey = "pk_live_e7cqyQsxGbRGtQL9CpNhNV9g";
        
  var commenceKey = liveKey;

  var userUid = Auth.getAuthState().$$state.value.uid;
  AccountBase.init(userUid);
    
    $scope.adminBeta = function(){
        $rootScope.betaApproved= true;
    }
    
  

//  // Run once initially
//  $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
//  if ($scope.currentLoc['id']) $scope.loadMyDeals($scope.currentLoc['id']);
//  // Run again every time the location changes
//  $rootScope.$on('locationChanged', function(){
//    $scope.loadMyDeals($rootScope.getCurrentLoc());
//  });
  
 $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
  console.log($scope.currentLoc);
  $rootScope.$on('locationChanged', function(){
    $scope.currentLoc['id'] = $rootScope.getCurrentLoc();
    //$scope.loadMyDeals();
  });

  $scope.triggerLocUpdate = function(){
    $rootScope.updateLoc($scope.currentLoc['id']);
  };
    
    var date = new Date();
    var time = date.getTime();
    var nowTime = parseInt(moment(time).format('HHMMSS'));
    var nowDate = parseInt(moment(time).format('DDMMYY'));  
    
    var weekDate = parseInt(moment(time).format('e'));
    $scope.currentTime = time;
    $scope.milliseconds = 36000000;
    $scope.duration = moment.duration($scope.milliseconds);
    
    
    $scope.isTodayAd = function(ad){
        if (weekDate == 0) {
            console.log('today is sunday');
            if (ad.daysOfWeek.sunday=='yes') {
                return ad;
            }
        }
        if (weekDate == 1) {
            console.log('today is monday');
            if (ad.daysOfWeek.monday=='yes') {
                return ad;
            }
        }
        if (weekDate == 2) {
            console.log('today is tuesday');
            if (ad.daysOfWeek.tuesday=='yes') {
                return ad;
            }
        }
        if (weekDate == 3) {
            console.log('today is wednesday');
            if (ad.daysOfWeek.wednesday=='yes') {
                return ad;
            }
        }
        if (weekDate == 4) {
            console.log('today is thursday');
            if (ad.daysOfWeek.thursday=='yes') {
                return ad;
            }
        }
        if (weekDate == 5) {
            console.log('today is friday');
            if (ad.daysOfWeek.friday=='yes') {
                return ad;
            }
        }
        if (weekDate == 6) {
            console.log('today is saturday');
            if (ad.daysOfWeek.saturday=='yes') {
                return ad;
            }
        }
        
    };
    //$scope.isTodayAd();
    
    $scope.isTodayBoost = function(d){
     
        if(!angular.isUndefined(d.dealFullImage)){
            d.dealFullImage = d.dealFullImage.replace(" ", "%20");
        }
     
        var dealTime = parseInt(moment(d.endTime).format('HHMMSS'));
        var dealDate = parseInt(moment(d.endTime).format('DDMMYY'));
        
        var dealStartTime = parseInt(moment(d.startTime).format('HHMMSS'));
        var dealStartDate = parseInt(moment(d.startTime).format('DDMMYY'));


         if(nowTime < 30000 && dealTime < 30000 && dealDate == nowDate && d.boost==true){
                return d;
        }else if(dealStartDate == nowDate && dealStartTime > 30000 && d.boost==true){
            
                return d;
        }    
    };
    
    /*$scope.deniedBeta = function(){
         $cordovaDialogs.alert('Were sorry, but your request has been denied.  Please email contact@mealsteals.com for more assistance', 'Beta Denied', 'Ok')
                .then(function() {
                  
            }); 
    };*/
     
    $scope.requestedBeta = function(){
        $cordovaDialogs.alert('You will receive an email within 24 hours of your original request', 'Thank you!', 'Ok')
                .then(function() {
                  
            });  
    };
    
    $scope.requestBeta = function(){
        if ($rootScope.profileSet==true){
            $cordovaDialogs.confirm('Request free access to our powerful revenue driving tools for bars and restaurants?', 'Request Information', ['Request', 'Cancel'])
            .then(function(buttonIndex) {
              // FOR BROWSER TEST    
              // OK == Agree (1), Cancel == Cancel (2)
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                   var bizID = $rootScope.getCurrentLoc();
                        fbutil.ref('businesses', bizID, 'beta').set('requested');
                        $rootScope.beta.status = 'requested';
                        //console.log($rootScope.bizInfo[bizID].businessName, $scope.AuthData.password.email, $rootScope.bizInfo[bizID].city)
                        emailjs.send("flash_deal","app_contact",{
                            message: '', 
                            subject: 'Beta Request', 
                            businessName: $rootScope.bizInfo[bizID].businessName, 
                            email: $scope.AuthData.password.email, 
                            priority: $rootScope.bizInfo[bizID].city, 
                            id: bizID})
                        .then(function(response) {
                           console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                        }, function(err) {
                           console.log("FAILED. error=", err);
                        });
                        $cordovaDialogs.alert('You will receive an email within 24 hours regarding your request', 'Requested', 'Ok')
                            .then(function() {
                        });
              }
              if (btnIndex == 2){
                  console.log('cancel');
              }        

            }); 
            
        } else {
            $cordovaDialogs.alert('You must finish creating your business profile before you can request information', 'Finish Profile', 'Ok')
                .then(function() {
                  $state.go('tab.account');
            });  
        }
        
    };
    
  /*  
  $scope.requestBeta = function(id) {
        if ($rootScope.profileSet==true){
            
            fbutil.ref('businesses', id, 'upgradeAccess').set("requested"); 
            
                // parameters: service_id, template_id, template_parameters
                emailjs.send("sign_up","newSignupTemplate",{content: "email: "+$scope.AuthData.password.email+" business: "+$rootScope.bizInfo[id].businessName + " contact: " + $rootScope.bizInfo[id].contactName + " Upgrade Request "})
                .then(function(response) {
                   console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                }, function(err) {
                   console.log("FAILED. error=", err);
                });
           
        } else {
             $cordovaDialogs.alert('You must finish creating your business profile before you can request access to our beta features', 'Finish Profile', 'Ok')
                .then(function() {
                  $state.go('tab.account');
                });
        }       
  };  */  
    
  $ionicModal.fromTemplateUrl('upgrade/boost.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalBoost = modal;
  });
  $scope.openBoostModal = function(){
        $scope.modalBoost.show();
        if ($rootScope.blackList != true) {  
                mixpanel.track("Open Boost Modal", {"Email": Auth.AuthData.password.email, "Business": $rootScope.bizInfo[$scope.currentLoc['id']].businessName});
        } 
      
  };

  $scope.closeBoostModal = function(){
        $scope.modalBoost.hide();   
  };
    
  $ionicModal.fromTemplateUrl('upgrade/purchase.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalPurchase = modal;
  });
  $scope.openPurchaseModal = function(){
        $scope.modalPurchase.show();
  };

  $scope.closePurchaseModal = function(){
        $scope.modalPurchase.hide();   
  };
       
  $ionicModal.fromTemplateUrl('upgrade/popupad.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modalPopupAd = modal;
  });
  $scope.openPopupAdModal = function(){
        $scope.modalPopupAd.show();
        if ($rootScope.blackList != true) {  
                mixpanel.track("Open Ad Modal", {"Email": Auth.AuthData.password.email, "Business": $rootScope.bizInfo[$scope.currentLoc['id']].businessName});
        } 
  };
    
  $scope.closePopupAdModal = function(){
    $scope.modalPopupAd.hide();     
  };
    
  $ionicModal.fromTemplateUrl('upgrade/transaction-history.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modalTransactions = modal;
  });
  $scope.openTransactionsModal = function(){
        $scope.modalTransactions.show();
  };

  $scope.closeTransactionsModal = function(){
        $scope.modalTransactions.hide();   
  }; 
    
  /* TUTORIAL */    
  /*  
  $ionicModal.fromTemplateUrl('upgrade/tutorial.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalTutorial = modal;
        if(hasSeenUpgrade!=true){
             $scope.modalTutorial.show();
             $scope.tutorialSlide = 1;
             window.localStorage['hasSeenUpgrade'] = true;
        }    
  });
  $scope.openTutorialModal = function(){
        $scope.modalTutorial.show();
        $scope.tutorialSlide = 1;
  };

  $scope.closeTutorialModal = function(){
        $scope.modalTutorial.hide();   
  };
    
  $scope.next = function() {
      if($scope.tutorialSlide < 7){
        $scope.tutorialSlide = $scope.tutorialSlide + 1;
      } else {
          $scope.modalTutorial.hide();
      }
  };
    
  $scope.previous = function() {
      if ($scope.tutorialSlide > 1){
        $scope.tutorialSlide = $scope.tutorialSlide - 1;
      }
  };
  */
    
  $scope.analyticsPremium = function() {
      window.plugins.toast.showWithOptions({
        message: 'Coming Soon',
        duration: "short", // 2000 ms
        position: "center",
        styling: {
          opacity: 0.8, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
          backgroundColor: '#333333', // make sure you use #RRGGBB. Default #333333
          textColor: '#FFFFFF', // Ditto. Default #FFFFFF
          textSize: 13, // Default is approx. 13.
          //cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
          //horizontalPadding: 20, // iOS default 16, Android default 50
          //verticalPadding: 16 // iOS default 12, Android default 30
        }
      });
  };
    
  /*    
  $ionicModal.fromTemplateUrl('upgrade/analytics.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalAnalytics = modal;
        }    
  });
  $scope.openAnalyticsModal = function(){
        $scope.modalAnalytics.show();
  };

  $scope.closeAnalyticsModal = function(){
        $scope.modalAnalytics.hide();   
  };
   */ 
    
    
    
  $scope.purchaseBoost = function(){
        $scope.ammount = {};
      
        var myPopup = $ionicPopup.show({
        template: '<input type="number" ng-model="ammount.boost">',
        title: '$5 per boost',
        //subTitle: '$'+($scope.ammount.boost*5),
        scope: $scope,
        buttons: [
          { text: 'Cancel',
            onTap: function(e) {
              $scope.ammount.boost = 0;
            }
          },
          {
            text: '<b>Buy</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.ammount.boost) {
                //don't allow the user to close unless he enters boost
                e.preventDefault();
              } else {
                return $scope.ammount.boost;
              }
            }
          }
        ]
      });

      myPopup.then(function(boost) {
          if ($scope.ammount.boost > 0) {
             var ammount = boost*500;
             var bizID = $rootScope.getCurrentLoc();
             if (!$rootScope.myUpgrades.boostCount){
                 var boostTotal = boost;
             } else {
                 var boostTotal = $rootScope.myUpgrades.boostCount+boost;
             }
             console.log(boostTotal);
             $timeout(function() {
                 $scope.modalPurchase.hide(); 
              }, 2000);
             commenceHandler({dataset:{
              name: "MealSteals",
              key: commenceKey,
              description: 'purchase of '+boost+' boosts',
              //zipCode: true,
              amount: ammount,//$("#amount").val()
              callback: function(charge){
                    //alert('email sent to '+charge.receipt_email);
                    //console.log(charge);
                    $scope.historyObject = {createdAt: charge.created*1000, payment: ammount, boosts: boost};
                    fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                    fbutil.ref('businesses', bizID, 'currentPlan').update({boostCount:boostTotal}); 
                }
            }}); 
          }
          
        });
  };
    
  $scope.purchaseAd = function(){
        $scope.ammount = {};
      
        var myPopup = $ionicPopup.show({
        template: '<input type="number" ng-model="ammount.ad">',
        title: '$0.10 per ad',
        subTitle: '100 ad minimum',
        scope: $scope,
        buttons: [
          { text: 'Cancel',
            onTap: function(e) {
              $scope.ammount.ad = 0;
            }
          },
          {
            text: '<b>Buy</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ($scope.ammount.ad<100) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.ammount.ad;
              }
            }
          }
        ]
      });

      myPopup.then(function(ad) {
          if ($scope.ammount.ad>99){
             var bizID = $rootScope.getCurrentLoc();
                if (!$rootScope.myUpgrades.adCount){
                     var adTotal = ad;
                 } else {
                     var adTotal = $rootScope.myUpgrades.adCount+ad;
                 }  
             var ammount = ad*10;
             $timeout(function() {
                 $scope.modalPurchase.hide(); 
              }, 2000);
             commenceHandler({dataset:{
              name: "MealSteals",
              key: commenceKey,
              description: 'purchase of '+ad+' ads',
              //zipCode: true,
              amount: ammount,//$("#amount").val()
              callback: function(charge){
                    alert('email sent to '+charge.receipt_email);
                    console.log(charge);
                    $scope.historyObject = {createdAt: charge.created*1000, payment: ammount, ads: ad};
                    fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                    fbutil.ref('businesses', bizID, 'currentPlan').update({adCount:adTotal}); 
                }
            }}); 
          }
      });  
  };
    
    //console.log(commenceKey);
        
    $scope.commencePayment = function(){
      //console.log('payment'); 
        
        commenceHandler({dataset:{
          name: "MealSteals",
          key: commenceKey,
          description: 'test',
          //zipCode: true,
          amount: 200,//$("#amount").val()
          callback: function(charge){
                        alert('email sent to '+charge.receipt_email);
                        alert('created at'+charge.created*1000);
                        alert(charge.outcome.seller_message);
                        alert(charge.status);
                        console.log(charge);
                        /*$scope.historyObject = {createdAt: charge.created*1000, payment: amount, ads: purchaseAd};
                        fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                        //fbutil.ref('businesses', bizID, 'currentPlan').update({createdAt:charge.created*1000});
                        fbutil.ref('businesses', bizID, 'currentPlan').update({adCount:adTotal}); 
                        console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan);
                        $scope.displayOptions.mainTab='adspace';*/
            }
        }});    
    };
        
     $scope.payPremium = function(){
      //console.log('payment'); 
        
        commenceHandler({dataset:{
          name: "MealSteals",
          key: commenceKey,
          description: 'Premium',
          plan: "premiumpackage",
          //zipCode: true,
          amount: 11900//$("#amount").val()
        }});    
    };
    
    /*$scope.boostDealNative = function(deal){ 
        
        
        
        $cordovaDialogs.confirm('Boost '+deal.name+' for the day?', 'Boost', ['Boost', 'Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                  var dealID = deal.$id;
                      var boostCount = $rootScope.myUpgrades.boostCount;
                      var newBoostCount = boostCount - 1;
                      console.log(newBoostCount);
                      console.log(dealID);
                      console.log($rootScope.myUpgrades);
                      fbutil.ref('deals/', dealID, '/boost').set(true);
                    fbutil.ref('businesses', deal.businessID, 'currentPlan').update({boostCount:newBoostCount});
                      alert('boosted');
              }
        });  
        
    };*/
    
     $scope.boostDealNative = function(deal){
         if($rootScope.myUpgrades.boostCount > 0 && deal.boost!=true){
             $cordovaDialogs.confirm('Boost '+deal.name+' for the day?', 'Boost', ['Boost', 'Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                  var dealID = deal.$id;
                      var boostCount = $rootScope.myUpgrades.boostCount;
                      var newBoostCount = boostCount - 1;
                      console.log(newBoostCount);
                      console.log(dealID);
                      console.log($rootScope.myUpgrades);
                  
                        var start = new Date(deal.startTime);
                        var startDate = moment(start.getTime()).format('YYYYMMDD');
                        var end = new Date(deal.endTime);
                        var endDate = moment(end.getTime()).format('YYYYMMDD');

                        fbutil.ref('todaysDeals/' + startDate + '/' + deal.$id + '/boost').set(true);
                         if(startDate != endDate){
                                fbutil.ref('todaysDeals/' + endDate + '/' + deal.$id + '/boost').set(true);
                            }
                  
//                      fbutil.ref('deals/', dealID, '/boost').set(true);
                      fbutil.ref('businesses', deal.businessID, 'currentPlan').update({boostCount:newBoostCount});
                      $cordovaDialogs.alert(newBoostCount+' boosts remaining', 'Boosted!', 'Ok')
                            .then(function() {     
                        });
                    if ($rootScope.blackList != true) {  
                        mixpanel.track("Boost", {"Email": Auth.AuthData.password.email, "Business": $rootScope.bizInfo[$scope.currentLoc['id']].businessName});
                        }  
              }
        });  
         }
         if(deal.boost==true){
             $cordovaDialogs.alert('Already boosted', 'Boost', 'Ok')
                .then(function() {     
             });
         }
         
         if($rootScope.myUpgrades.boostCount == 0 || !$rootScope.myUpgrades.boostCount){
              $cordovaDialogs.alert('0 boosts remaining', 'Boost', 'Ok')
                .then(function() {     
             });
         }
         
     };
    
    
    
     $scope.boostRecurring = function(deal){
         console.log('click');
            if($rootScope.myUpgrades.boostCount > 0 && deal.boosts < 1){
             var confirmPopup = $ionicPopup.confirm({
             title: 'Boost',
             template: 'Are you sure you want boost this deal?',
             okText: 'Boost', // String (default: 'OK'). The text of the OK button.
             });

             confirmPopup.then(function(res) {
                 if(res) {
                      var dealID = deal.$id;
                      var boostCount = $rootScope.myUpgrades.boostCount;
                      var newBoostCount = boostCount - 1;
                      console.log(newBoostCount);
                      console.log(dealID);
                      console.log($rootScope.myUpgrades);
                     if(!angular.isUndefined(deal.boosts)){
                         var boosts = parseInt(deal.boosts) + 1;
                     }else{
                         boosts = 1;
                     }
                      fbutil.ref('recurringDeals/', dealID, '/boosts').set(boosts);
                    fbutil.ref('businesses', deal.businessID, 'currentPlan').update({boostCount:newBoostCount});
                      alert('boosted');
                     }
             });
         }
         if(deal.boosts>0){
             var alertPopup = $ionicPopup.alert({
                title: 'Already Boosted',
                //template: 'It might taste good'
            });
         }
         
         if($rootScope.myUpgrades.boostCount == 0){
              var alertPopup = $ionicPopup.alert({
                title: '0 Boosts Remaining',
                //template: 'It might taste good'
            });
         }
         
         
     
     };
    
      $scope.addPopupNative = function(deal) {
        $cordovaDialogs.prompt('Please select number of ads', 'Add Ads', ['Add','Cancel'], '')
            .then(function(result) {
              var popupAds = result.input1;
              // no button = 0, 'OK' = 1, 'Cancel' = 2
              var btnIndex = result.buttonIndex;
              if (btnIndex == 1){
                    $scope.addPopupAds(popupAds, deal);
              }
            });  
     }; 
    
     $scope.addPopupAds = function(popupAds, deal){
         if (popupAds > 0 && popupAds <= $rootScope.myUpgrades.adCount) {
              $scope.popup = {};   
              $scope.popup = $firebaseObject(fbutil.ref('popupAdDeals/' + deal.$id));  
              $scope.popup.$loaded().then(function () {
                    var adCount = $rootScope.myUpgrades.adCount; 
                    var dealID = deal.$id;
                    $scope.newAdTotal = adCount - popupAds;
                      if ($scope.popup.impressions==undefined){
                          //console.log('first time popup: '+ad);
                          $scope.popupDealObj = $firebaseObject(fbutil.ref('recurringDeals/' + dealID));
                            var dealName = {};
                            dealName = $scope.popupDealObj;

                            $scope.popupDealData = {
                            name: deal.name,
                            description: deal.description,
                            locName: deal.locName,
                            icon: deal.icon,
                            //img: deal.img,
                            dealFullImage: deal.dealFullImage,
                            largeImg: deal.largeImg,
                            //detailBackgroundFull: deal.detailBackgroundFull,
                            address: deal.address,
                            city: deal.city,
                            state: deal.state,
                            phone: deal.phone,
                            lat: deal.lat,
                            lon: deal.lon,
                            //featured: deal.featured,
                            daysOfWeek: {
                              'monday': deal.daysOfWeek.monday,
                              'tuesday': deal.daysOfWeek.tuesday,
                              'wednesday': deal.daysOfWeek.wednesday,
                              'thursday': deal.daysOfWeek.thursday,
                              'friday': deal.daysOfWeek.friday,
                              'saturday': deal.daysOfWeek.saturday,
                              'sunday': deal.daysOfWeek.sunday
                            },
                            //type: deal.type,
                            startTime: deal.startTime,
                            endTime: deal.endTime,
                            foodOrDrink: deal.foodOrDrink,
                            exclusive: deal.exclusive,
                            timeType: deal.timeType,
                            redeemable: deal.redeemable,
                            businessID: deal.businessID,
                            impressions: popupAds // do math on app side to subtract this number, when impressions = 0 then delete or hide
                            };
                            console.log($scope.popupDealData);
                            fbutil.ref('popupAdDeals', dealID).update($scope.popupDealData);
                            
                      } else {
                          if (popupAds > 0){
                            var newImpressions = parseInt($scope.popup.impressions) + parseInt(popupAds);
                            console.log('previous popup: '+newImpressions);
                            fbutil.ref('popupAdDeals', dealID).update({impressions:newImpressions});
                          }
                      }
                    console.log('new ad total: '+$scope.newAdTotal);
                    if ($scope.newAdTotal > -1 && $scope.newAdTotal < 999999999) {
                        fbutil.ref('businesses', deal.businessID, 'currentPlan').update({adCount:$scope.newAdTotal});
                        if ($rootScope.blackList != true) {  
                                mixpanel.track("Change Ads", {"Email": Auth.AuthData.password.email, "Business": $rootScope.bizInfo[$scope.currentLoc['id']].businessName});
                        }
                    }
              }); 
         }else{
             $cordovaDialogs.alert('Please enter valid number of ads', 'Re-enter', 'Ok')
                .then(function() {     
             });
         }
         
     };
    
     /*$scope.addPopupAd1 = function(deal){
         console.log(deal);
         console.log(deal.$id);
         console.log($rootScope.myUpgrades.adCount);
         $scope.ammount = {};
      
        var myPopup = $ionicPopup.show({
        template: '<input type="number" ng-model="ammount.ad">',
        title: 'Select number of ads',
        subTitle: $rootScope.myUpgrades.adCount+' remaining',
        scope: $scope,
        buttons: [
          { text: 'Cancel',
            onTap: function(e) {
              //$scope.ammount.ad = 0;
            }
          },
          {
            text: '<b>Add</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ($scope.ammount.ad>$rootScope.myUpgrades.adCount || $scope.ammount.ad == 0) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.ammount.ad;
              }
            }
          }
        ]
      });

      myPopup.then(function(ad) {
          if ($scope.ammount.ad<$rootScope.myUpgrades.adCount || $scope.ammount.ad == $rootScope.myUpgrades.adCount){
              $scope.popup = {};   
              $scope.popup = $firebaseObject(fbutil.ref('popupAdDeals/' + deal.$id));  
              $scope.popup.$loaded().then(function () {
                    var adCount = $rootScope.myUpgrades.adCount; 
                    var dealID = deal.$id;
                    $scope.newAdTotal = adCount - ad;
                      if ($scope.popup.impressions==undefined){
                          //console.log('first time popup: '+ad);
                          $scope.popupDealObj = $firebaseObject(fbutil.ref('recurringDeals/' + dealID));
                            var dealName = {};
                            dealName = $scope.popupDealObj;

                            $scope.popupDealData = {
                            name: deal.name,
                            description: deal.description,
                            locName: deal.locName,
                            icon: deal.icon,
                            //img: deal.img,
                            dealFullImage: deal.dealFullImage,
                            largeImg: deal.largeImg,
                            //detailBackgroundFull: deal.detailBackgroundFull,
                            address: deal.address,
                            city: deal.city,
                            state: deal.state,
                            phone: deal.phone,
                            lat: deal.lat,
                            lon: deal.lon,
                            //featured: deal.featured,
                            daysOfWeek: {
                              'monday': deal.daysOfWeek.monday,
                              'tuesday': deal.daysOfWeek.tuesday,
                              'wednesday': deal.daysOfWeek.wednesday,
                              'thursday': deal.daysOfWeek.thursday,
                              'friday': deal.daysOfWeek.friday,
                              'saturday': deal.daysOfWeek.saturday,
                              'sunday': deal.daysOfWeek.sunday
                            },
                            //type: deal.type,
                            startTime: deal.startTime,
                            endTime: deal.endTime,
                            foodOrDrink: deal.foodOrDrink,
                            exclusive: deal.exclusive,
                            timeType: deal.timeType,
                            redeemable: deal.redeemable,
                            businessID: deal.businessID,
                            impressions: ad // do math on app side to subtract this number, when impressions = 0 then delete or hide
                            };
                            //console.log($scope.popupDealData);
                            fbutil.ref('popupAdDeals', dealID).update($scope.popupDealData);
                      } else {
                          if (ad > 0){
                            var newImpressions = $scope.popup.impressions + ad;
                            //console.log('previous popup: '+newImpressions);
                            fbutil.ref('popupAdDeals', dealID).update({impressions:newImpressions});
                          }
                      }
                    console.log('new ad total: '+$scope.newAdTotal);
                    if ($scope.newAdTotal > -1 && $scope.newAdTotal < 999999999) {
                        fbutil.ref('businesses', deal.businessID, 'currentPlan').update({adCount:$scope.newAdTotal});
                    }
              }); 
            }
      });
         
         
     };  */ 
       
     $scope.deletePopupAdNative = function(ad){
        $cordovaDialogs.confirm('Remove '+ad.name+' from running ads?', 'Remove', ['Remove', 'Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                  var adCount = $rootScope.myUpgrades.adCount;
                  var adID = ad.$id;
                  if (ad.impressions > 0) {
                      $scope.newAdTotal = parseInt(adCount) + parseInt(ad.impressions);
                      console.log('deleting popup ad deal', adID);
                      console.log($scope.newAdTotal);
                      fbutil.ref('popupAdDeals/' + adID).set(null);
                      fbutil.ref('businesses', ad.businessID, 'currentPlan').update({adCount:$scope.newAdTotal});
                  } else {
                      fbutil.ref('popupAdDeals/' + dealID).set(null);
                  }
              }
        });  
     };
    
     /*$scope.deletePopupAd = function(ad){
         var confirmPopup = $ionicPopup.confirm({
         title: 'Delete',
         template: 'Are you sure you want delete this ad?',
         okText: 'Delete', // String (default: 'OK'). The text of the OK button.
       });

       confirmPopup.then(function(res) {
         if(res) {
              var adCount = $rootScope.myUpgrades.adCount;
              var adID = ad.$id;
              if (ad.impressions > 0) {
                  $scope.newAdTotal = parseInt(adCount) + parseInt(ad.impressions);
                  console.log('deleting popup ad deal', adID);
                  console.log($scope.newAdTotal);
                  fbutil.ref('popupAdDeals/' + adID).set(null);
                  fbutil.ref('businesses', ad.businessID, 'currentPlan').update({adCount:$scope.newAdTotal});
              } else {
                  fbutil.ref('popupAdDeals/' + dealID).set(null);
              }
         }
       });      
    };*/
    
    
    $scope.notExpired = function(deal){
      
        var stamp = String(new Date().getTime());
        if(deal.endTime < stamp){
            return false;
        }else{
            return true;
        }
        
        
    };
    
    
    
    
    
    //$ionicLoading.hide();

})
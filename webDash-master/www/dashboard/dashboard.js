angular.module('starter.controllers-dash', ['firebase', 'firebase.utils'])

.controller('DashCtrl', function($scope, $rootScope, AccountBase, Auth, $timeout, $firebaseArray, $firebaseObject, fbutil, $state, $ionicPopup, $ionicLoading, $cordovaDialogs, $ionicModal) {
    
  console.log($scope.hasSeenApp);

  /*if($rootScope.noBiz = true) {
      $state.go('tab.account'); 
  } */ 
    
  $ionicLoading.show({
      template: 'Loading...',
      duration: 1000
    });    
    
  console.log('dash ctrl');

  var userUid = Auth.getAuthState().$$state.value.uid;
  AccountBase.init(userUid);
    
        
  $scope.seenDash = function(){  
      fbutil.ref('users/' + userUid + '/walkthrough/' + 'seenDash').set(true);
  };
       

//  // Run once initially
//  $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
//  if ($scope.currentLoc['id']) $scope.loadMyDeals($scope.currentLoc['id']);
//  // Run again every time the location changes
//  $rootScope.$on('locationChanged', function(){
//    $scope.loadMyDeals($rootScope.getCurrentLoc());
//  });
//  
 $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
  console.log($scope.currentLoc);
  $rootScope.$on('locationChanged', function(){
    $scope.currentLoc['id'] = $rootScope.getCurrentLoc();
    //Dash is loaded first if profile is complete so these need to be in dash controller as rootscope to put toggle in correct position
    $scope.approved = { checked: $rootScope.bizInfo[$scope.currentLoc.id].approved};
    if ($rootScope.bizInfo[$scope.currentLoc.id].dealsOn==undefined){
          $rootScope.bizInfo[$scope.currentLoc.id].dealsOn = true;
      }
      $rootScope.dealsOn = { checked: $rootScope.bizInfo[$scope.currentLoc.id].dealsOn};    
  });

  $scope.triggerLocUpdate = function(){
    $rootScope.updateLoc($scope.currentLoc['id']);
  };
    
 // set todays deal window star time @3AM 
// var d = new Date();
// d.setUTCHours(-16,0,0,0);
// $scope.todayAM = +d
    
    var date = new Date();
    var time = date.getTime();
    $scope.today = time;
    var nowTime = parseInt(moment(time).format('HHMMSS'));
    var nowDate = parseInt(moment(time).format('DDMMYY'));
   
   
     
 $scope.isActive = function(d){
      //console.log(d.startTime);
      return d.startTime < time && d.endTime > time;
 };
     
 $scope.isToday = function(d){
     
        if(!angular.isUndefined(d.dealFullImage)){
            d.dealFullImage = d.dealFullImage.replace(" ", "%20");
        }
     
        var dealTime = parseInt(moment(d.endTime).format('HHMMSS'));
        var dealDate = parseInt(moment(d.endTime).format('DDMMYY'));
        
        var dealStartTime = parseInt(moment(d.startTime).format('HHMMSS'));
        var dealStartDate = parseInt(moment(d.startTime).format('DDMMYY'));


         if(nowTime < 30000 && dealTime < 30000 && dealDate == nowDate){
                return d;
        }else if(dealStartDate == nowDate && dealStartTime > 30000){
                
                return d;
        }    
    };
 
  $ionicModal.fromTemplateUrl('edit/edit-deal.html', {
         scope: $scope,

      }).then(function(modal) {
        $scope.modalEditDeal = modal;
  });

  $rootScope.closeEditDeal = function() {
    console.log('close');
    $scope.modalEditDeal.hide();
  };

  $scope.editDeal = function(deal) {

      if(!angular.isUndefined(deal.recurringDealID)){
      
            angular.forEach($rootScope.myRecurringDeals, function(thisDeal){
                 
            if(thisDeal.$id == deal.recurringDealID){
                  $rootScope.$broadcast('editDeal', thisDeal);
                  $scope.modalEditDeal.show();
            }
                
            });
          
      }else{
          $rootScope.$broadcast('editDeal', deal);
          $scope.modalEditDeal.show();
      }

  };

  $scope.$on('closeEditDeal', function() {
      $scope.modalEditDeal.hide();
  });    

  $scope.editDealDash = function(deal){
      console.log(deal);
      
      
           var retVal = confirm("Do you want to edit this deal?");
           if( retVal == true ){
              
               console.log('edit');
                $scope.editDeal(deal);
              return true;
           }
           else{
              
              return false;
           }

      
//      
//        $cordovaDialogs.confirm(deal.name, 'Edit Deal', ['Edit', 'Cancel'])
//        .then(function(buttonIndex) {
//          // FOR BROWSER TEST    
//          // OK == Edit (1), Cancel == Delete (2)
//          var btnIndex = buttonIndex;
//          if (btnIndex == 1){
//              console.log('edit');
//              $scope.editDeal(deal);
//          }
//          if (btnIndex == 2){
//              console.log('cancel');
//          }
//        });  
  };
    
      $scope.deleteDealDash = function(deal){
      console.log(deal);

           var retVal = confirm("Do you want to delete this deal?");
           if( retVal == true ){
              
               console.log('delete');

            var start = new Date(deal.startTime);
            var startDate = moment(start.getTime()).format('YYYYMMDD');
            var end = new Date(deal.endTime);
            var endDate = moment(end.getTime()).format('YYYYMMDD');

            fbutil.ref('todaysDeals/' + startDate + '/' + deal.$id).remove();
            if(startDate != endDate){
                fbutil.ref('todaysDeals/' + endDate + '/' + deal.$id).remove();
            }
              return true;
           }
           else{
              
              return false;
           }

          
//          
//          
//        $cordovaDialogs.confirm(deal.name, 'Delete Deal', ['Delete', 'Cancel'])
//        .then(function(buttonIndex) {
//          // FOR BROWSER TEST    
//          // OK == Edit (1), Cancel == Delete (2)
//          var btnIndex = buttonIndex;
//          if (btnIndex == 1){
//              console.log('delete');
//              
//            var start = new Date(deal.startTime);
//            var startDate = moment(start.getTime()).format('YYYYMMDD');
//            var end = new Date(deal.endTime);
//            var endDate = moment(end.getTime()).format('YYYYMMDD');
//
//            fbutil.ref('todaysDeals/' + startDate + '/' + deal.$id).remove();
//            if(startDate != endDate){
//                fbutil.ref('todaysDeals/' + endDate + '/' + deal.$id).remove();
//            }
//              
//          }
//          if (btnIndex == 2){
//              console.log('cancel');
//          }
//        });  
  };
    
    
    
  $scope.boostDealDash = function(deal){
     if ($rootScope.beta.status=='approved') {
      
         if($rootScope.myUpgrades.boostCount > 0 && deal.boost!=true){
             
             
           var retVal = confirm('Boost '+deal.name+' for the day?');
           if( retVal == true ){
              
               console.log('boost');
                var dealID = deal.$id;
                  var boostCount = $rootScope.myUpgrades.boostCount;
                  var newBoostCount = boostCount - 1;
                  console.log(newBoostCount);
                  console.log(dealID);
                  console.log($rootScope.myUpgrades);
                  fbutil.ref('deals/', dealID, '/boost').set(true);
                  fbutil.ref('businesses', deal.businessID, 'currentPlan').update({boostCount:newBoostCount});
               alert (newBoostCount+' boosts remaining');
              return true;
           }
           else{
              
              return false;
           }
//             
//             $cordovaDialogs.confirm('Boost '+deal.name+' for the day?', 'Boost', ['Boost', 'Cancel'])
//            .then(function(buttonIndex) {
//              var btnIndex = buttonIndex;
//              if (btnIndex == 1){
//                  var dealID = deal.$id;
//                      var boostCount = $rootScope.myUpgrades.boostCount;
//                      var newBoostCount = boostCount - 1;
//                      console.log(newBoostCount);
//                      console.log(dealID);
//                      console.log($rootScope.myUpgrades);
//                      fbutil.ref('deals/', dealID, '/boost').set(true);
//                      fbutil.ref('businesses', deal.businessID, 'currentPlan').update({boostCount:newBoostCount});
//                      $cordovaDialogs.alert(newBoostCount+' boosts remaining', 'Boosted!', 'Ok')
//                            .then(function() {     
//                        });
//               }
//            });  
            if ($rootScope.blackList != true) {  
                mixpanel.track("Boost", {"Email": Auth.AuthData.password.email, "Business": deal.locName});
            } 
            
         }
         if(deal.boost==true){
             alert ('Already boosted');
//             $cordovaDialogs.alert('Already boosted', 'Boost', 'Ok')
//                .then(function() {     
//             });
         }
         
         if(deal.boost!=true && $rootScope.myUpgrades.boostCount == 0 || deal.boost!=true && !$rootScope.myUpgrades.boostCount){
             alert ('0 boosts remaining');
//              $cordovaDialogs.alert('0 boosts remaining', 'Boost', 'Ok')
//                .then(function() {     
//             });
         }
     } else {
         alert ('You must request access in the premium tab to use this feature');
//         $cordovaDialogs.alert('You must request access in the premium tab to use this feature', 'Not Available', 'Ok')
//                .then(function() {     
//             });
         
     }
  };
    
 // display options     
 $scope.displayOptions = {
      'dashMain': 'today'
 };
    
  $scope.goToAdd = function(){
        $state.go('tab.add-deal');  
  };
    
  $scope.waitingOnApproval = function(){
        $cordovaDialogs.alert('It can take up to 24 hours for your account to be approved.  If you need immediate assistance please use the contact form in the account tab.', 'Waiting on approval', 'Ok')
            .then(function() {
        });
  };    

//  $scope.todaysDealOptions = function(deal) {
//      console.log(deal);
//   var confirmPopup = $ionicPopup.confirm({
//     title: 'Options',
//     //template: 'Feature this deal?',
//     cssClass: "popup-vertical-buttons",
//     scope: $scope,
//				    buttons: [
//                      {
//				        text: '<b>Edit</b>',
//				        type: 'button-positive',
//				        onTap: function(e) {
//							console.log('edit');
//                            if(angular.isUndefined(deal.recurringDealID)){
//                                $scope.editDeal(deal);
//                            }else{
//                                var alertPopup = $ionicPopup.alert({
//                                     title: 'Go to Deals Tab to edit Recurring Deals.',
//                                });
//                            }
//				        }
//				      },
//                        {
//				        text: '<b>Delete</b>',
//				        type: 'button-positive',
//				        onTap: function(e) {
//                            
//                            if(angular.isUndefined(deal.recurringDealID)){
//                                console.log('delete');
//                                
//                                var start = new Date(deal.startTime);
//                                var startDate = moment(start.getTime()).format('YYYYMMDD');
//                                var end = new Date(deal.endTime);
//                                var endDate = moment(end.getTime()).format('YYYYMMDD');
//
//                                fbutil.ref('todaysDeals/' + startDate + '/' + deal.$id).remove();
//                                 if(startDate != endDate){
//                                        fbutil.ref('todaysDeals/' + endDate + '/' + todayDeal.$id).remove();
//                                    }
//                                
//                                
//                            }else{
//                                var alertPopup = $ionicPopup.alert({
//                                     title: 'Go to Deals Tab to delete Recurring Deals.',
//                                });
//                            }
//							
//				        }
//				      },
//                      {
//				        text: '<b>Close</b>',
//				        type: 'button-positive',
//				        onTap: function(e) {
//							console.log('close');
//				        }
//				      }
//                    ]
//   });
//
//   
// }; 
    
  $scope.boostDeal = function(deal){
         if($rootScope.myUpgrades.boostCount > 0 && deal.boost!=true){
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
                      fbutil.ref('deals/', dealID, '/boost').set(true);
                    fbutil.ref('businesses', deal.businessID, 'currentPlan').update({boostCount:newBoostCount});
                      alert('boosted');
                     }
             });
         }
         if(deal.boost==true){
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
      
        if($rootScope.myUpgrades.boostCount == undefined){
              var alertPopup = $ionicPopup.alert({
                title: 'Purchase Boost From Upgrade Tab',
                //template: 'It might taste good'
            });
         }
         
     };
    
$scope.grabDeal = function(deal, dealID){
     
      //console.log($firebaseObject(fbutil.ref('recurringDeals/' + dealID)));
      $scope.popupDealObj = $firebaseObject(fbutil.ref('deals/' + dealID));
      
        
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
        detailBackgroundFull: deal.detailBackground,
        address: deal.address,
        city: deal.city,
        state: deal.state,
        phone: deal.phone,
        lat: deal.lat,
        lon: deal.lon,
        featured: deal.featured,
        
        //type: deal.type,
        startTime: deal.startTime,
        endTime: deal.endTime,
        foodOrDrink: deal.foodOrDrink,
        exclusive: deal.exclusive,
        timeType: deal.timeType,
        redeemable: deal.redeemable,
        businessID: deal.businessID,
        impressions: 20 // do math on app side to subtract this number, when impressions = 0 then delete or hide
            
       
      };
        //console.log($scope.popupDealData);
      
//      fbutil.ref('popupAdDeals').push($scope.popupDealData, function(){
//          $scope.displayOptions.mainTab='mydeals';
//          $scope.displayOptions.viewDealsType='popupad';
//          $scope.$apply();
//        });
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
        return totalClicks;
	};
    
    
        
    $scope.impressionCount = function(d) {
        var totalImpressions = 0;
        
        var date = new Date();
        var day = moment(date).format("YYYYMMDD");
        angular.forEach($rootScope.appImpressions , function(load){

            var loadDate = new Date(parseInt(load.$id));
            var loadTime = loadDate.getTime();
            if(d.startTime < loadTime && d.endTime > loadTime){

                var distanceAway = GeoFire.distance([d.lat, d.lon], [load.lat,load.lon]);
                if(distanceAway < 30){

                    totalImpressions += 1;
                }

            }


        });
        
        return totalImpressions;
	};
    
         
    $scope.checkIns = function(d) {
        var checkins = 0;
        
        if(!angular.isUndefined(d.checkIns)){
           checkins = d.checkIns.length;
        }
        
        return checkins;
	};
    
    
    
    $scope.detailClicks = function(deal){
        
        
        if(!angular.isUndefined(deal.analytics)){
            
            if(!angular.isUndefined(deal.analytics.mapAnalytics) && !angular.isUndefined(deal.analytics.listAnalytics)){
                
                $scope.dealClicks = deal.analytics.mapAnalytics + deal.analytics.listAnalytics;
                
            }else if(!angular.isUndefined(deal.analytics.mapAnalytics)){
                
                $scope.dealClicks = deal.analytics.mapAnalytics;
                
            }else if(!angular.isUndefined(deal.analytics.listAnalytics)){
                     
                     $scope.dealClicks = deal.analytics.listAnalytics;
            }else{
                     
                     $scope.dealClicks = 0;
            }
            
            if(!angular.isUndefined(deal.analytics.iconAnalytics)){
                $scope.iconClicks = deal.analytics.iconAnalytics;
            }else{
                $scope.iconClicks = 0;
            }
                     
            
        }else{
            $scope.dealClicks = 0;
            $scope.iconClicks = 0;
        }
        
        
    }    

})
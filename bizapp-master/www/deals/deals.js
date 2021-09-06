angular.module('starter.controllers-deals', ['firebase', 'firebase.utils'])


.controller('DealsCtrl', function($scope, $rootScope, AccountBase, Auth, CordovaCamera, $firebaseArray, $firebaseObject, fbutil, $state, $ionicPopup, $ionicModal, $ionicLoading, $cordovaDialogs, $ionicScrollDelegate) {

  $ionicLoading.show({
      template: 'Loading...',
      duration: 1000
    });
    
  
  $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
  console.log($scope.currentLoc);
  $rootScope.$on('locationChanged', function(){
    $scope.currentLoc['id'] = $rootScope.getCurrentLoc();
    //$scope.loadMyDeals();
  });    
    
  $scope.seenDeals = function(){      
      fbutil.ref('users/' + userUid + '/walkthrough/' + 'seenDeals').set(true);
  };
    
  $scope.scrollToTop = function(){
        $ionicScrollDelegate.scrollTop();  
  };
    
  var userUid = Auth.getAuthState().$$state.value.uid;
  AccountBase.init(userUid);
    
    $scope.oneWeekAgo = new Date();
    $scope.oneWeekAgo.setDate($scope.oneWeekAgo.getDate() - 7);
    $scope.oneWeekAgo = $scope.oneWeekAgo.getTime();

    
     // display options     
     $scope.displayOptions = {
          'dashMain': 'recurring'
     };

//  // Run once initially
//  $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
//  if ($scope.currentLoc['id']) $scope.loadMyDeals($scope.currentLoc['id']);
//  // Run again every time the location changes
//  $rootScope.$on('locationChanged', function(){
//    $scope.loadMyDeals($rootScope.getCurrentLoc()); 
//  });

   $scope.isActive = function(d){
      var time = new Date();
      var now = time.getTime();
      return d.startTime < now && d.endTime > now;
    };
   
   $scope.isFlash = function(d) {
      return d.recurringDealID == undefined; 
   };
   
   $scope.goToAdd = function(){
        $state.go('tab.add-deal');  
  };
   
   $scope.isMonday = function(d){
        if (d.daysOfWeek.monday=='yes'){
            return d;
        }    
    }
    $scope.isTuesday = function(d){
        if (d.daysOfWeek.tuesday=='yes'){
            return d;
        }    
    }
    $scope.isWednesday = function(d){
        if (d.daysOfWeek.wednesday=='yes'){
            return d;
        }    
    }
    $scope.isThursday = function(d){
        if (d.daysOfWeek.thursday=='yes'){
            return d;
        }    
    }
    $scope.isFriday = function(d){
        if (d.daysOfWeek.friday=='yes'){
            return d;
        }    
    }
    $scope.isSaturday = function(d){
        if (d.daysOfWeek.saturday=='yes'){
            return d;
        }    
    }
    $scope.isSunday = function(d){
        if (d.daysOfWeek.sunday=='yes'){
            return d;
        }    
    }
    
    $scope.editFlashDeal = function(deal) {
        var date = new Date();
        var time = date.getTime();
        console.log(deal);
        
       if (time > deal.startTime && time < deal.endTime){
           $cordovaDialogs.alert('You cannot edit actively running FlashSteals', 'Expired', 'Ok')
                .then(function() {      
            });
        } else if (time > deal.endTime) {
            $cordovaDialogs.alert('You cannot edit expired FlashSteals', 'Not editable', 'Ok')
                .then(function() {      
            }); 
        } else {
           $scope.dealsTabOptions(deal);
        }  
    };
    
    $scope.dealsTabOptions = function(deal) {
        console.log(deal);
        $cordovaDialogs.confirm('', deal.name, ['Edit','Delete', 'Cancel'])
        .then(function(buttonIndex) {
          // FOR BROWSER TEST    
          // OK == Edit (1), Cancel == Delete (2)
          var btnIndex = buttonIndex;
          if (btnIndex == 1){
              console.log('edit');
              $scope.editDeal(deal);
              if ($rootScope.blackList != true) {  
                mixpanel.track("Edit", {"Email": Auth.AuthData.password.email, "Business": deal.locName});
              } 
          }
          if (btnIndex == 2){
              console.log('delete?');
              $cordovaDialogs.confirm(deal.name, 'Delete', ['Delete', 'Cancel'])
                // FOR BROWSER TEST    
                // OK == Delete (1), Cancel == Cancel (2)
                .then(function(buttonIndex) {
                  // 
                  var btnIndex = buttonIndex;
                  if (btnIndex == 1){
                      console.log('delete');
                      if(!angular.isUndefined(deal.daysOfWeek)){
                          
                            var start = new Date();
                            var startDate = moment(start.getTime()).format('YYYYMMDD');

                            if(!angular.isUndefined($rootScope.myRecurringObj[deal.$id].deals) && !angular.isUndefined($rootScope.myRecurringObj[deal.$id].deals[startDate])){
                               var todayDeal = $firebaseObject(fbutil.ref('todaysDeals/' + startDate + '/' + $rootScope.myRecurringObj[deal.$id].deals[startDate]));
                                todayDeal.$loaded(function(deals){

                                    var start = new Date(todayDeal.startTime);
                                    var startDate = moment(start.getTime()).format('YYYYMMDD');
                                    var end = new Date(todayDeal.endTime);
                                    var endDate = moment(end.getTime()).format('YYYYMMDD');

                                    fbutil.ref('todaysDeals/' + startDate + '/' + todayDeal.$id).remove();
                                    if(startDate != endDate){
                                        fbutil.ref('todaysDeals/' + endDate + '/' + todayDeal.$id).remove();
                                    }
                                });
                            
                            }

                          console.log('deleting', deal.$id);
                          fbutil.ref('recurringDeals/' + deal.$id).set(null);

                        }else{

                            var start = new Date(deal.startTime);
                            var startDate = moment(start.getTime()).format('YYYYMMDD');
                            var end = new Date(deal.endTime);
                            var endDate = moment(end.getTime()).format('YYYYMMDD');

                            fbutil.ref('todaysDeals/' + startDate + '/' + deal.$id).remove();
                             if(startDate != endDate){
                                    fbutil.ref('todaysDeals/' + endDate + '/' + deal.$id).remove();
                                }
                        }
                  }
                  if (btnIndex == 2){
                      console.log('cancel');
                  }
                });
          }
        });
    };
    
    $ionicModal.fromTemplateUrl('edit/edit-deal.html', {
         scope: $scope,

      }).then(function(modal) {
        $scope.modalEditDeal = modal;
      });
    
    
      //for some reason $rootScope was only talking to one controller, so I change it to $broadcast
      /*$rootScope.closeEditDeal = function() {
        console.log('close');
        $scope.modalEditDeal.hide();
      };*/
    
      $scope.$on('closeEditDeal', function() {
            $scope.modalEditDeal.hide();
      }); 

      $scope.editDeal = function(deal) {

          $rootScope.$broadcast('editDeal', deal);
          $scope.modalEditDeal.show();

      };
    
      $scope.$on('closeEditDeal', function() {
          $scope.modalEditDeal.hide();
      });
    
    

    
    
  
})
angular.module('starter.services', ['firebase.utils'])

.factory('AccountBase', ['$firebaseObject', '$firebaseArray', '$rootScope', 'Auth', 'fbutil', 
  function($firebaseObject, $firebaseArray, $rootScope, Auth, fbutil){

  console.log('AccountBase factory. Should only see once.');
      
    //Has Seen Before  
    $rootScope.hasSeen = {
        dash: false,
        deals: false,
        add: false,
        upgrade: false
    };  
   
    if ($rootScope.blackList != true && Auth.AuthData.password) {
        
        $rootScope.dashTabClick = function(){
            mixpanel.track("Dash Click", {"Email": Auth.AuthData.password.email});
        };

        $rootScope.dealsTabClick = function(){
             mixpanel.track("Deals Click", {"Email": Auth.AuthData.password.email});
        };

        $rootScope.addTabClick = function(){
             mixpanel.track("Add Click", {"Email": Auth.AuthData.password.email});
        };

        $rootScope.accountTabClick = function(){
             mixpanel.track("Account Click", {"Email": Auth.AuthData.password.email});
        };

        $rootScope.upgradeTabClick = function(){
             mixpanel.track("Upgrade Click", {"Email": Auth.AuthData.password.email});
        };   
    };
      
      
    // Set some initial variables
  	$rootScope.fuHeight=window.innerHeight;
    //$rootScope.fullvh='100vh';
	$rootScope.fuWidth=window.innerWidth;
	$rootScope.inputWidth = Math.round($rootScope.fuWidth / 1.6);
	$rootScope.inputMargin = Math.round((($rootScope.fuWidth-$rootScope.inputWidth) / 2) / 1);
//      
//    if(localStorage.getItem('hasSeenDash')!=undefined){
//        $rootScope.hasSeen.dash = true;
//    };
//      
//    if(localStorage.getItem('hasSeenDeals')!=undefined){
//        $rootScope.hasSeen.deals = true;
//    };
//    
//    if(localStorage.getItem('hasSeenAdd')!=undefined){
//        $rootScope.hasSeen.add = true;
//    };
//      
//    if(localStorage.getItem('hasSeenUpgrade')!=undefined){
//        $rootScope.hasSeen.upgrade = true;
//    };
//      
    
          
  /* update location */
      
     
    $rootScope.isFiltered = false;
    $rootScope.changeProfileObj = {};
      
  // was null  '-K79fogP4DisKl5s-yFL'     
  var currentLoc = null;
  $rootScope.updateLoc = function(bizID){
    currentLoc = bizID;
      $rootScope.locID = bizID;
      $rootScope.changeProfileObj = {};
      
      var time = new Date();
      var day = moment(time).format("YYYYMMDD");
      
    //$rootScope.myDeals = $firebaseArray(fbutil.ref('deals').orderByChild('businessID').equalTo(bizID).limitToLast(75));
    $rootScope.todaysDeals = $firebaseArray(fbutil.ref('todaysDeals/' + day).orderByChild('businessID').equalTo(bizID));
    $rootScope.myRecurringDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo(bizID));
    $rootScope.myRecurringObj = $firebaseObject(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo(bizID));
    $rootScope.myUpgrades = $firebaseObject(fbutil.ref('businesses/'+bizID+'/currentPlan'));
    $rootScope.myHistory = $firebaseArray(fbutil.ref('businesses/'+bizID+'/currentPlan/upgradeHistory'));
    $rootScope.myPopupAds = $firebaseArray(fbutil.ref('popupAdDeals').orderByChild('businessID').equalTo(bizID));
      
     $rootScope.bizInfo[bizID].$loaded().then(function(){  
         console.log($rootScope.bizInfo[bizID]);
          if(!angular.isUndefined($rootScope.bizInfo[bizID].about) &&
             !angular.isUndefined($rootScope.bizInfo[bizID].contactName) &&
             !angular.isUndefined($rootScope.bizInfo[bizID].timezone) &&
             !angular.isUndefined($rootScope.bizInfo[bizID].address) &&
             !angular.isUndefined($rootScope.bizInfo[bizID].phone) &&
             //!angular.isUndefined($rootScope.bizInfo[bizID].icon) &&
             !angular.isUndefined($rootScope.bizInfo[bizID].businessName)){  
              $rootScope.profileSet = true;
              $rootScope.$broadcast('profileStatus', $rootScope.profileSet);
          }else{
              $rootScope.profileSet = false;
              $rootScope.$broadcast('profileStatus', $rootScope.profileSet);
          }
         
         
              $rootScope.changeProfileObj['businessName'] = $rootScope.bizInfo[bizID].businessName;
              $rootScope.changeProfileObj['address'] = $rootScope.bizInfo[bizID].address;
              $rootScope.changeProfileObj['timezone'] = $rootScope.bizInfo[bizID].timezone;
              $rootScope.changeProfileObj['detailBackground'] = $rootScope.bizInfo[bizID].detailBackground;
              $rootScope.changeProfileObj['lat'] = $rootScope.bizInfo[bizID].lat;
              $rootScope.changeProfileObj['lon'] = $rootScope.bizInfo[bizID].lon;
              $rootScope.changeProfileObj['city'] = $rootScope.bizInfo[bizID].city;
              $rootScope.changeProfileObj['state'] = $rootScope.bizInfo[bizID].state;
              $rootScope.changeProfileObj['website'] = $rootScope.bizInfo[bizID].website;
              $rootScope.changeProfileObj['facebook'] = $rootScope.bizInfo[bizID].facebook;
              $rootScope.changeProfileObj['twitter'] = $rootScope.bizInfo[bizID].twitter;
              $rootScope.changeProfileObj['instagram'] = $rootScope.bizInfo[bizID].instagram;
              $rootScope.changeProfileObj['phone'] = $rootScope.bizInfo[bizID].phone;
              $rootScope.changeProfileObj['icon'] = $rootScope.bizInfo[bizID].icon;
              $rootScope.changeProfileObj['about'] = $rootScope.bizInfo[bizID].about;
              $rootScope.changeProfileObj['contactName'] = $rootScope.bizInfo[bizID].contactName;
              $rootScope.changeProfileObj['rooftop'] = $rootScope.bizInfo[bizID].rooftop;
              $rootScope.changeProfileObj['patio'] = $rootScope.bizInfo[bizID].patio;
              $rootScope.changeProfileObj['vegan'] = $rootScope.bizInfo[bizID].vegan;
          
              
         
         //console.log("change profile obj");
         //console.log($rootScope.changeProfileObj);
     });
      
    $rootScope.bizInfo[bizID].$loaded().then(function(){  
         //console.log($rootScope.bizInfo[bizID]);
         //console.log($rootScope.bizInfo[bizID].beta);
         $rootScope.beta = {}
         if($rootScope.bizInfo[bizID].beta=='approved' || $rootScope.bizInfo[bizID].beta=='denied' || $rootScope.bizInfo[bizID].beta=='requested'){  
              $rootScope.beta.status = $rootScope.bizInfo[bizID].beta;
              //console.log('SERVICES: ', $rootScope.beta.status);
              //$rootScope.$broadcast('betaStatus', $rootScope.beta.status);
          }else{
              $rootScope.beta.status = 'fresh';
               //console.log('SERVICES: ', $rootScope.beta.status);
              //$rootScope.$broadcast('betaStatus', $rootScope.beta.status);
          }
        
     });
    $rootScope.$emit('locationChanged', {'bizID':bizID});
  };
  $rootScope.getCurrentLoc = function(){
    //console.log('current location: '+currentLoc);
    return currentLoc;
  };
  
  $rootScope.resetAccount = function(){
      //console.log('resetting account');
      accountInit = false;
      $rootScope.bizIDs = [];
      $rootScope.bizInfo = {};
      $rootScope.userOptions = {};
  }

  /* account stuff */
  var accountInit = false;
  $rootScope.bizIDs = [];
  $rootScope.bizInfo = {};
  $rootScope.userOptions = {};

  Auth.onFirebaseAuth(function(authData) {
     if (authData==null){
        // user logged out
        accountInit = false;
        $rootScope.bizIDs.$destroy();
        $rootScope.userOptions.$destroy();
        $rootScope.bizIDs = [];
        $rootScope.bizInfo = {};
        $rootScope.userOptions = {};
     } else {
        $rootScope.initFunc(Auth.user);
     }
  });
           

  $rootScope.initFunc = function(userUid){
      
      
      
      if (accountInit==false){
      
      if (!angular.isUndefined(userUid)){
          if ($rootScope.blackList != true) { 
                mixpanel.track("App Load", {"Email": Auth.AuthData.password.email});
          }
          //console.log(Auth.AuthData.password.email);
          accountInit = true;
            //console.log(" in initFunc ");
            //console.log( userUid);
          $rootScope.userOptions = $firebaseObject(fbutil.ref('users/' + userUid));
          $rootScope.currentUser = $firebaseObject(fbutil.ref('users_app/' + userUid));
          $rootScope.bizIDs = $firebaseArray(fbutil.ref('users/'+userUid+'/bizIDs'));
          $rootScope.hasSeen = $firebaseObject(fbutil.ref('users/'+userUid+'/walkthrough'));
          
//          $rootScope.managed = $firebaseArray(fbutil.ref('users/'));
//          
//          $rootScope.managedBiz = [];
//          
//          $rootScope.managed.$loaded().then(function(){
//              $rootScope.managed.forEach(function(users){
//                  $rootScope.managed.forEach(function(thisBiz){
//                      $rootScope.managedBiz.push(thisBiz);
//                  });
//              });
//              
//
//          });
//              console.log($rootScope.managedBiz);
         
          /*$rootScope.hasSeen.$loaded().then(function(){
                if(!angular.isUndefined($rootScope.hasSeen.seenDash)){
                    console.log('seen dash');
                    $rootScope.seenDashBefore = true;
                }
                 if(!angular.isUndefined($rootScope.hasSeen.seenDeals)){
                    console.log('seen deals');
                     $rootScope.seenDealsBefore = true;
                }
                 if(!angular.isUndefined($rootScope.hasSeen.seenAdd)){
                    console.log('seen add');
                     $rootScope.seenAddBefore = true;
                }
          });*/
          console.log($rootScope.hasSeen);
          
          $rootScope.bizIDs.$loaded().then(function(){
              $rootScope.bizIDs.forEach(function(bizID){
              $rootScope.bizInfo[bizID.$id] = $firebaseObject(fbutil.ref('businesses/' + bizID.$id));
              });

              if ($rootScope.bizIDs.length > 0){
                //console.log('INIT LOC', $rootScope.bizIDs[0].$id);
               
                $rootScope.bizInfo[$rootScope.bizIDs[0].$id].$loaded().then(function(){
                     
                     $rootScope.updateLoc($rootScope.bizIDs[0].$id);
                     if (!angular.isUndefined($rootScope.bizInfo[currentLoc].businessName)){
                         console.log($rootScope.bizInfo[currentLoc].businessName);
                         if ($rootScope.blackList != true) { 
                            mixpanel.track("Active Business", {"Main Biz": $rootScope.bizInfo[currentLoc].businessName, "Email": Auth.AuthData.password.email});
                         }
                     };
                     //console.log($rootScope.bizInfo[$rootScope.bizIDs[0].$id].address);
                      if(!angular.isUndefined($rootScope.bizInfo[currentLoc].about) &&
                         !angular.isUndefined($rootScope.bizInfo[currentLoc].timezone) &&
                         !angular.isUndefined($rootScope.bizInfo[currentLoc].address) &&
                         !angular.isUndefined($rootScope.bizInfo[currentLoc].contactName) &&
                         !angular.isUndefined($rootScope.bizInfo[currentLoc].address) &&
                         !angular.isUndefined($rootScope.bizInfo[currentLoc].phone) &&
                         //!angular.isUndefined($rootScope.bizInfo[currentLoc].icon) &&
                         !angular.isUndefined($rootScope.bizInfo[currentLoc].businessName)){  
                          $rootScope.profileSet = true;
                          $rootScope.accountTab = 'account';
                      }else{
                          $rootScope.profileSet = false;
                          $rootScope.accountTab = 'change';
                      }
                    $rootScope.$broadcast('profileStatus', $rootScope.profileSet);
                 });
              } else {
                  $rootScope.profileSet = false;
                  $rootScope.noBiz = true;
                  $rootScope.accountTab = 'add';
                  $rootScope.beta = {};
                  $rootScope.beta.status = 'fresh';
                  $rootScope.$broadcast('profileStatus', $rootScope.noBiz);
                  
                  //$rootScope.googlePlaces = $firebaseArray(fbutil.ref('businesses/**/placeID'));
                  //console.log($rootScope.googlePlaces);
              }

              $rootScope.bizIDs.$watch(function(){

                // add or take away biz objects from $rootScope.bizInfo based on new ids or removed ids
                $rootScope.bizIDs.forEach(function(bizID){
                  if (!$rootScope.bizInfo.hasOwnProperty(bizID.$id)){
                    console.log('adding');
                    $rootScope.bizInfo[bizID.$id] = $firebaseObject(fbutil.ref('businesses/' + bizID.$id)); 
                    $rootScope.updateLoc(bizID.$id);
                  }
                });

              });
             
              $rootScope.userOptions.$loaded(function(){

                if ($rootScope.userOptions.superadmin == 'yes'){
                  console.log('superadmin!');
                  var allBizIDs = $firebaseArray(fbutil.ref('allBizIDs'));
                  allBizIDs.$loaded(function(){
                    allBizIDs.forEach(function(bizid){
                      $rootScope.bizInfo[bizid.$id] = $firebaseObject(fbutil.ref('businesses/' + bizid.$id)); 
                      // $rootScope.bizIDs.push(bizid.$id);
                      // console.log(bizid.$id);
                    });
                  });
                  // allBizIDs.forEach(function(id){
                  //   $rootScope.bizIDs.push(id);
                  // });
                }
                  
                if (Auth.AuthData.password.email == 'bmkopp@ymail.com' ||
                    Auth.AuthData.password.email == 'bmkopp10@gmail.com'  ||
                    Auth.AuthData.password.email == 'bbexpress@gmail.com'  ||
                    Auth.AuthData.password.email == 'ben@mealsteals.com'  ||
                    Auth.AuthData.password.email == 'brian@mealsteals.com'  ||
                    Auth.AuthData.password.email == 'signup@mealsteals.com'  ||
                    Auth.AuthData.password.email == 'lemarc@mealsteals.com'  ||
                    Auth.AuthData.password.email == 'aram@mealsteals.com'  ||
                    Auth.AuthData.password.email == 'patrick@mealsteals.com' ||
                    Auth.AuthData.password.email == 'sean@mealsteals.com' ||
                    Auth.AuthData.password.email == 'lemarcfj@me.com'
                    ){

                    $rootScope.blackList = true;
                    //console.log("black list1: "+$rootScope.blackList);
                } else {
                    $rootScope.blackList = false;
                   // console.log("black list2: "+$rootScope.blackList);
                }
                  console.log("black list: "+$rootScope.blackList);

              });

          });

      }
            
      }

      return;
    }

  return {
    init: $rootScope.initFunc
  };
}]);

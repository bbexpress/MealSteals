angular.module('services', ['firebase.utils', 'firebase.auth'])

.factory('AccountBase', function($firebaseObject, $firebaseArray, $rootScope, fbutil, Auth){

    $rootScope.mealsteals = new Firebase("https://mealsteals.firebaseio.com");

    $rootScope.businessesFB = new Firebase("https://mealsteals.firebaseio.com/businesses/");

    $rootScope.busFB = $firebaseArray($rootScope.businessesFB);

    $rootScope.userFB = new Firebase("https://mealsteals.firebaseio.com/users_app/");

    $rootScope.currentUser = $firebaseArray($rootScope.userFB);

    $rootScope.recurringFB = new Firebase($rootScope.mealsteals + '/recurringDeals');

    $rootScope.recurringObj = $firebaseArray($rootScope.recurringFB);
    
//    
//    $rootScope.userAccess = new Firebase('https://mealsteals.firebaseio.com/businesses', bizID, 'userids' , uid).set({uid:uid});
//        fbutil.ref('businesses', bizID, 'emails', email).set({comma_email:email});

    //$rootScope.busArray = $firebaseArray(($rootScope.businessesFB).orderByChild('businessID'));
    
    
  var accountInit = false;
  $rootScope.bizIDs = [];
  $rootScope.bizInfo = {};
  $rootScope.userOptions = {};

  Auth.$onAuth(function(authData) {
     if (authData==null){
        // user logged out
        accountInit = false;
        $rootScope.bizIDs.$destroy();
        $rootScope.userOptions.$destroy();
        $rootScope.bizIDs = [];
        $rootScope.bizInfo = {};
        $rootScope.userOptions = {};
     } else {
        initFunc(Auth.user);
     }
  });

  var initFunc = function(user){

      if (accountInit==false){

          accountInit = true;

          $rootScope.userOptions = $firebaseObject(fbutil.ref('users/' + user.uid));
          $rootScope.bizIDs = $firebaseArray(fbutil.ref('users/'+user.uid+'/bizIDs'));

          
           $rootScope.userOptions.$loaded().then(function(){
               //c2c7b05c-7a8a-402e-b9dc-b8fcfee5c9d6 = bmkopp@ymail.com
               //f5b9a5e5-9422-45f2-9ad7-9c69ab21c88b = lemarcfj@me.com
               //928a8908-8161-4074-94dc-915834bb56e6 = test@mealsteals.com
               
               if (user.uid == 'c2c7b05c-7a8a-402e-b9dc-b8fcfee5c9d6' || user.uid == 'f5b9a5e5-9422-45f2-9ad7-9c69ab21c88b'){
                   $rootScope.userOptions.admin = 'yes';
                   console.log('admin '+ $rootScope.userOptions.admin);
               } else {
                   $rootScope.userOptions.admin = 'no';
                   console.log('admin '+ $rootScope.userOptions.admin);
               }
               //console.log($rootScope.userOptions.admin);
               //console.log(user.uid);
               console.log($rootScope.userOptions);
           });
          
          
          $rootScope.bizIDs.$loaded().then(function(){
         
              
              $rootScope.bizIDs.forEach(function(bizID){
                $rootScope.bizInfo[bizID.$id] = $firebaseObject(fbutil.ref('businesses/' + bizID.$id));
              });

              $rootScope.bizIDs.$watch(function(){

                // add or take away biz objects from $rootScope.bizInfo based on new ids or removed ids
                $rootScope.bizIDs.forEach(function(bizID){
                  if (!$rootScope.bizInfo.hasOwnProperty(bizID.$id)){
                    console.log('adding');
                    $rootScope.bizInfo[bizID.$id] = $firebaseObject(fbutil.ref('businesses/' + bizID.$id)); 
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

              });

          });


            
      }

      return;
    }

  return {
    init: initFunc
  };
});
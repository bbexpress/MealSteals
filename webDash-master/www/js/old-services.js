angular.module('services', ['firebase.utils', 'firebase.auth'])

.factory('AccountBase', function($firebaseObject, $firebaseArray, $rootScope, fbutil, Auth){

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
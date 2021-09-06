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
    $rootScope.appImpressions = $firebaseArray(fbutil.ref('adminAnalytics/appLoads/' + day));
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
             !angular.isUndefined($rootScope.bizInfo[bizID].icon) &&
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
                         !angular.isUndefined($rootScope.bizInfo[currentLoc].icon) &&
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
                    Auth.AuthData.password.email == 'alissa@mealsteals.com' ||
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
      
      
      
    function imageToDataUri(URI, originalWidth, originalHeight, newWidth, newHeight) {

      return $q(function(resolve, reject){
        var img = new Image();
        img.onload = function(){
          // create an off-screen canvas
          // var canvas = document.createElement('canvas');
          // var ctx = canvas.getContext('2d');

          // set its dimension to target size
          // canvas.width = newWidth;
          // canvas.height = newHeight;
          var widthSteps = [];
          var heightSteps = [];
          var numSteps = 10;

          var delta = originalWidth - newWidth;
          var step = Math.round(delta / numSteps);
          for (var i=1; i<=numSteps; i++){
            if (step > 1){
              widthSteps.push(originalWidth-i*step);
            } else {
              widthSteps.push(newWidth);
            }
          }

          var delta = originalHeight - newHeight;
          var step = Math.round(delta / numSteps);
          for (var i=1; i<=numSteps; i++){
            if (step > 1){
              heightSteps.push(originalHeight-i*step);
            } else {
              heightSteps.push(newHeight);
            }
          }

          // draw source image into the off-screen canvas:
          for (var i=1; i<=numSteps; i++){
            var canvas = document.createElement('canvas');
            canvas.width = widthSteps[i-1];
            canvas.height = heightSteps[i-1];
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, widthSteps[i-1], heightSteps[i-1]);
            console.log(widthSteps[i-1], heightSteps[i-1]);
            img = canvas;  
          }

          resolve(canvas.toDataURL());
        }
        img.src = URI;
      });

  }
      
      
      $scope.currentDate = Date.now();

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

    $scope.policy = 'eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJtZWFsc3RlYWxzeWVzIn0seyJhY2wiOiAicHVibGljLXJlYWQifSxbInN0YXJ0cy13aXRoIiwiJENvbnRlbnQtVHlwZSIsIiJdLFsic3RhcnRzLXdpdGgiLCIka2V5IiwiIl1dfQ==';
    $scope.signature = 'OIiCj+2av3cmeabevQ4t9QtceMs=';
    $scope.timeID = String(new Date().getTime());

    $rootScope.uploadFiles = function(file, saveTo, saveToKey, maxWidth, maxHeight) {
        $scope.f = file;
        if (file && !file.$error) {
            $scope.loadingImage = true;

            var newWidth = file.width;
            var newHeight = file.height;

            if (maxWidth){
              if (maxHeight){
                // if both are set, we force resize
                if (file.width > maxWidth || file.height > maxHeight){
                  newWidth = maxWidth;
                  newHeight = maxHeight;
                }
              } else {
                if (file.width > maxWidth){
                  newWidth = maxWidth;
                  newHeight = Math.round(file.height * (newWidth / file.width));
                }
              }
            }    

            var reader  = new FileReader();
            reader.onloadend = function () {
              imageToDataUri(reader.result, file.width, file.height, newWidth, newHeight).then(function(hmm){

                var newBlob = dataURItoBlob(hmm);

                  console.log(file.name);
                  
                  var fileName = file.name.replace(' ', '_');
                  
                  console.log(file.name);
                  $scope.timeID = String(new Date().getTime());
                file.upload = Upload.upload({
                  url: 'http://s3.amazonaws.com/mealstealsyes', //S3 upload url including bucket name
                  method: 'POST',
                  fields : {
                    key: $scope.timeID + saveToKey + fileName, // the key to store the file on S3, could be file name or customized
                    AWSAccessKeyId: 'AKIAJ46C4XJRMO6JBATA',
                    acl: 'public-read', // sets the access to the uploaded file in the bucket: private or public
                    policy: $scope.policy, // base64-encoded json policy (see article below)
                    signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
                    "Content-Type": file.type != '' ? file.type : 'application/octet-stream' // content type of the file (NotEmpty)
                  },
                  file: newBlob,
                });

                file.upload.then(function (response) {
                  //success
                  $scope.loadingImage = false;
                    $timeout(function () {
                        file.result = response.data;
                        saveTo[saveToKey] = 'http://s3.amazonaws.com/mealstealsyes/' + $scope.timeID + saveToKey + fileName;
                        console.log($scope.dealObj.dealFullImage);
                    });
                }, function (response) {
                  //error
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                });

                file.upload.progress(function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 * 
                                                           evt.loaded / evt.total));
                });

              });
            }
            reader.readAsDataURL(file);

              
        }   
    }
      
      
      
      
}]);

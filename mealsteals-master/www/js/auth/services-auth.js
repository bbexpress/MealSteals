angular.module('starter.services-auth', [])

/**
 * General Wrapper for Auth
 * This version: 25/07/2015
 * See also: https://www.firebase.com/docs/web/libraries/ionic/guide.html
 */

.factory('Auth', function($cordovaOauth, $q, $rootScope, $state, $firebaseObject, CordovaCamera, $firebaseArray, Firebase, Timestamp, $cordovaNativeStorage) {

    $rootScope.userAuthEmail = 'Not logged In';
    var time = new Date();
    var stamp = time.getTime();
    var day = moment(time).format("YYYYMMDD");
    
    $rootScope.todayFB = new Firebase("https://mealsteals.firebaseio.com/todaysDeals/" + day);
    
    $rootScope.todayObj = $firebaseObject($rootScope.todayFB);
    
    
//  $cordovaNativeStorage.getItem("email").then(function (email) {
//           console.log('services email: '+email);
//           $rootScope.emailInStorage = email;
//           console.log('rootscope in services: '+$rootScope.emailInStorage);
//           $rootScope.$broadcast('emailPulled');
//                }, function (error) {
//                    console.log('no email found');
//    });
//
//    $cordovaNativeStorage.getItem("password").then(function (password) {
//           console.log('services password: '+password);
//           $rootScope.passwordInStorage = password;
//           $rootScope.$broadcast('passwordPulled');
//                }, function (error) {
//                    console.log('no password found');
//    });


  var self = this;


  self.AuthData = {};

  /**
   * Init the global variable AuthData
   */
  onAuth().then(
      function(AuthData){
        self.AuthData = AuthData;
      }
  );

  /**
   * unAuthenticate the user
   * independent of method (password, twitter, etc.)
   */
  self.unAuth = function() {
    var ref = new Firebase(FBURL);
    self.AuthData = {};
    return ref.unauth();
  };



//
//    -------Fav Functions
//

   $rootScope.addFavDeal = function(id, deal){

       var timestamp = new Date().getTime();

       if(angular.isUndefined($rootScope.currentFavs.deals)){

           $rootScope.currentFavs['deals'] = id;
       }

       $rootScope.currentFavs.deals[id] = deal;
       $rootScope.userFavs.child('/deals/' + id).set(deal);
       $rootScope.mealsteals.child('/recurringDeals/' + id  + '/favorites/' + $rootScope.authUserData.uid).set(
       {
          'username': $rootScope.currentUser.username,
          'timestamp': timestamp
        });

   }

   $rootScope.removeFavDeal = function(id){


       delete $rootScope.currentFavs.deals[id];
       $rootScope.userFavs.child( "/deals/" + id).remove();
       $rootScope.mealsteals.child('/recurringDeals/' + id  + '/favorites/' + $rootScope.authUserData.uid).remove();
   }

   $rootScope.addFavBus = function(id, bus){

       if(angular.isUndefined($rootScope.currentFavs.businesses)){

           console.log("in IF statement");
           $rootScope.currentFavs['businesses'] = id;
       }

       $rootScope.currentFavs.businesses[id] = bus;


       $rootScope.userFavs.child('/businesses/' + id).set(bus);
       $rootScope.businessesFB.child('/' + id + '/followers/' + $rootScope.authUserData.uid).set($rootScope.currentUser.username);
   }

   $rootScope.removeFavBus = function(id){
       console.log("in remove fav bus");
       delete $rootScope.currentFavs.businesses[id];
       $rootScope.userFavs.child("/businesses/" + id ).remove();
       $rootScope.businessesFB.child('/' + id + '/followers/' + $rootScope.authUserData.uid).remove();
   }


//
//    -------Fav Functions
//

//
//  Check In
//
   $rootScope.checkIn = function(deal){



       deal['checkInTime'] = new Date().getTime();


        var start = new Date(deal.startTime);
        var startDate = moment(start.getTime()).format('YYYYMMDD');
        var end = new Date(deal.endTime);
        var endDate = moment(end.getTime()).format('YYYYMMDD');

       $rootScope.userFB.child('/lastCheckIn').set(deal.checkInTime);
       $rootScope.userFB.child('/checkIns/' + deal.key).set(deal);
       $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/checkIn/' + $rootScope.authUserData.uid).set({'username': $rootScope.currentUser.username, 'timestamp': deal.checkInTime});
       $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/checkIn/' + $rootScope.authUserData.uid).set({'username': $rootScope.currentUser.username, 'timestamp': deal.checkInTime});
   }


   $rootScope.redeemed = function(deal){


       deal['checkInTime'] = new Date().getTime();
       
       
        var start = new Date(deal.startTime);
        var startDate = moment(start.getTime()).format('YYYYMMDD');
        var end = new Date(deal.endTime);
        var endDate = moment(end.getTime()).format('YYYYMMDD');

       
       $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/analytics/redeemAnalytics/' + $rootScope.authUserData.uid).set({'username' : $rootScope.currentUser.username, 'timestamp': deal.checkInTime});
       $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/analytics/redeemAnalytics/' + $rootScope.authUserData.uid).set({'username' : $rootScope.currentUser.username, 'timestamp': deal.checkInTime});


       $rootScope.userFB.child('/redeems/' + deal.key).set(deal);
       $rootScope.mealsteals.child('/deals/' + deal.key + '/redeems/' + $rootScope.authUserData.uid).set({'username' : $rootScope.currentUser.username, 'timestamp' : deal.checkInTime});
       
       
       $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/redeems/' + $rootScope.authUserData.uid).set({'username' : $rootScope.currentUser.username, 'timestamp' : deal.checkInTime});
       $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/redeems/' + $rootScope.authUserData.uid).set({'username' : $rootScope.currentUser.username, 'timestamp' : deal.checkInTime});

       $rootScope.checkIn(deal);
   }


    $rootScope.newRating = function(deal, type, total, rec){

        var start = new Date(deal.startTime);
        var startDate = moment(start.getTime()).format('YYYYMMDD');
        var end = new Date(deal.endTime);
        var endDate = moment(end.getTime()).format('YYYYMMDD');
        
        if(type == 'recurring'){

            //set in recurring
            $rootScope.mealsteals.child('/recurringDeals/' + deal.recurringDealID + '/ratings/' + $rootScope.authUserData.uid).set(rec.rating);
            
            $rootScope.mealsteals.child('/recurringDeals/' + deal.recurringDealID + '/totalRating/').set(total);

            //set in business
            $rootScope.mealsteals.child('/businesses/' + deal.businessID + '/ratings/recurring/' + deal.recurringDealID  + '/' + $rootScope.authUserData.uid).set(rec.rating);

            $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/totalRating/').set(total);
            $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/totalRating/').set(total);

        }else{
            //set one time deal
            $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/ratings/' + $rootScope.authUserData.uid).set(deal.ratings[$rootScope.authUserData.uid]);
            $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/ratings/' + $rootScope.authUserData.uid).set(deal.ratings[$rootScope.authUserData.uid]);
            
            $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/totalRating/').set(total);
            $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/totalRating/').set(total);
            
            //set in business
            $rootScope.mealsteals.child('/businesses/' + deal.businessID + '/ratings/onetime/' + deal.key  + '/' + $rootScope.authUserData.uid).set(deal.ratings[$rootScope.authUserData.uid]);
        }

    }

    // update deal image Action Sheet
   function uploadPicture() {
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
              uploadCamera(sourceTypeIndex).then(
                function(success){
                  //loadProfileData();
                }
              );
            };
  };


  // capture deal image
  function uploadCamera(sourceTypeIndex) {
      console.log('in UploadCamera');
    return CordovaCamera.newImage(sourceTypeIndex, 600).then(
      function(imageData){
        if(imageData != undefined) {
            console.log("image data defined");
            uploadFiles(imageData, 'profilePicture');
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

    $rootScope.policy = 'eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJtZWFsc3RlYWxzeWVzIn0seyJhY2wiOiAicHVibGljLXJlYWQifSxbInN0YXJ0cy13aXRoIiwiJENvbnRlbnQtVHlwZSIsIiJdLFsic3RhcnRzLXdpdGgiLCIka2V5IiwiIl1dfQ==';
    $rootScope.signature = 'OIiCj+2av3cmeabevQ4t9QtceMs=';




    function uploadFiles(image, fileName) {

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

//
//        $scope.newImage = "http://s3.amazonaws.com/mealstealsyes/" + key;
//
//        $scope.newDeal.img = "http://s3.amazonaws.com/mealstealsyes/" + key;
//        $scope.newDeal.largeImg = "http://s3.amazonaws.com/mealstealsyes/" + key;
//        $scope.newDeal.detailBackgroundFull = "http://s3.amazonaws.com/mealstealsyes/" + key;
//        $scope.newDeal.dealFullImage = "http://s3.amazonaws.com/mealstealsyes/" + key;
//
//        console.log($scope.newDeal);
  }


    //$scope.uploadFiles($rootScope.currentUser.profilePicture, 'dealImage');



    function uploadProgress(evt) {
    if (evt.lengthComputable) {
      var percentComplete = Math.round(evt.loaded * 100 / evt.total);
      document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    }
    else {
      document.getElementById('progressNumber').innerHTML = 'unable to compute';
    }
  }



  /**
   * Monitor the current authentication state
   * returns on success:  AuthData
   * returns on fail:     AUTH_LOGGED_OUT
   */
  function onAuth() {
      console.log("on auth!!");
      $cordovaNativeStorage.getItem("email").then(function (email) {
           console.log('services email: '+email);
           $rootScope.emailInStorage = email;
           console.log('rootscope in services: '+$rootScope.emailInStorage);
           $rootScope.$broadcast('emailPulled');
                }, function (error) {
                    console.log('no email found');
      });

      $cordovaNativeStorage.getItem("password").then(function (password) {
           console.log('services password: '+password);
           $rootScope.passwordInStorage = password;
           $rootScope.$broadcast('passwordPulled');
                }, function (error) {
                    console.log('no password found');
      });
    var qAuthState = $q.defer();
    function AuthDataCallback(AuthData) {
        if (AuthData) {
            self.AuthData = AuthData;//gv
            qAuthState.resolve(AuthData);

            //
            //    Access User information
            //
            //


                var ref = new Firebase("https://mealsteals.firebaseio.com");
                $rootScope.authUserData = ref.getAuth();
                if (!angular.isUndefined($rootScope.authUserData)) {
                    mixpanel.identify($rootScope.authUserData.uid);
                    //console.log("Authenticated user with uid:", $rootScope.authUserData.uid);
                    //bmkopp@ymail.com, bmkopp10@gmail.com, brian facebook, brian@mealsteals.com, lemarc@mealsteals.com, ben@mealsteals.com, bbexpress@gmail.com, aram@mealsteals.com
                    
                    if($rootScope.authUserData.uid == 'c2c7b05c-7a8a-402e-b9dc-b8fcfee5c9d6'  ||
                       $rootScope.authUserData.uid == 'c615ea89-b0b6-4249-b8fa-46d445a2e5ec'  ||
                       $rootScope.authUserData.uid == '43b989fd-55ee-4110-9ef9-62ecffadaec3'  ||
                       $rootScope.authUserData.uid == '390e38a0-9811-4569-9ebf-d1327a678b55'  ||
                       $rootScope.authUserData.uid == '392b2938-5bef-43e6-b474-8b94d9a40216'  ||
                       $rootScope.authUserData.uid == '513bad1b-55f6-4377-92fa-9a7d9656be6e'  ||
                       $rootScope.authUserData.uid == '0f4de114-479a-4355-9762-2573f6b6c6fb'  ||
                       $rootScope.authUserData.uid == 'ceec7d6b-ce1c-4d74-9336-854e0beeedc3'  ||
                       $rootScope.authUserData.uid == '0f4de114-479a-4355-9762-2573f6b6c6fb'  ||
                       $rootScope.authUserData.uid == '31952025-53d4-4e07-b31a-7897b1e6a9ae'){
                       $rootScope.analyticsFlag = true;
                       console.log('Admin user');
                    }

                }

                    $rootScope.mealsteals = new Firebase("https://mealsteals.firebaseio.com/")
                    

                    $rootScope.businessesFB = new Firebase("https://mealsteals.firebaseio.com/businesses/");

                    $rootScope.busFB = $firebaseObject($rootScope.businessesFB);

                    $rootScope.userFB = new Firebase("https://mealsteals.firebaseio.com/users_app/" + $rootScope.authUserData.uid + "/meta");

                    $rootScope.currentUser = $firebaseObject($rootScope.userFB);

                    $rootScope.userFB1 = new Firebase("https://mealsteals.firebaseio.com/users_app/" + $rootScope.authUserData.uid);

                    $rootScope.currentUser1 = $firebaseObject($rootScope.userFB1);

                    $rootScope.userFavs = new Firebase("https://mealsteals.firebaseio.com/users_app/" + $rootScope.authUserData.uid + "/meta/favorites");
            
                    $rootScope.userFavsBusinesses = new Firebase("https://mealsteals.firebaseio.com/users_app/" + $rootScope.authUserData.uid + "/meta/favorites/businesses");

                    $rootScope.currentFavs = $firebaseObject($rootScope.userFavs);
                
                    $rootScope.currentFavsBizArray = $firebaseArray($rootScope.userFavsBusinesses);

                    $rootScope.recurringFB = new Firebase($rootScope.mealsteals + '/recurringDeals');
//
//                    $rootScope.recurringObj = $firebaseObject($rootScope.recurringFB);

                    $rootScope.busArray = $firebaseArray(($rootScope.businessesFB).orderByChild('businessID'));

                    $rootScope.popupFB = new Firebase('https://mealsteals.firebaseio.com/popupAdDeals/');

                    $rootScope.popupObj = $firebaseObject($rootScope.popupFB);
//            
//                    $rootScope.userFBs = new Firebase("https://mealsteals.firebaseio.com/users_app/");
//
//                    $rootScope.users = $firebaseObject($rootScope.userFBs);
                   


                    //$rootScope.dealsArray = $firebaseArray($rootScope.mealsteals.child('/deals/'));
                     $rootScope.currentFavsBizArray.$loaded(function(){
                         // console.log('flsadkjfl;sdjf: ',$rootScope.currentFavsBizArray.length)
                     });
                    
                    if(!angular.isUndefined($rootScope.authUserData) && !angular.isUndefined($rootScope.authUserData.password) && !angular.isUndefined($rootScope.authUserData.password.email)){
                        var email = $rootScope.authUserData.password.email;
                        console.log(email);
                        $rootScope.userAuthEmail = $rootScope.authUserData.password.email;
                    }else if (!angular.isUndefined($rootScope.authUserData.facebook) && !angular.isUndefined($rootScope.authUserData.facebook.email)){
                        var email = $rootScope.authUserData.facebook.email;
                        $rootScope.userAuthEmail = $rootScope.authUserData.facebook.email;
                    } else {
                        $rootScope.userAuthEmail = 'Not logged In';
                    }


                    if(!angular.isUndefined(email)){
                        $rootScope.userFB.child('/email/').set(email);
                    }

                    console.log($rootScope.authUserData);

                    $rootScope.firstGPSload == true;

                    $rootScope.currentUser.$loaded(function(data){
                    if(!angular.isUndefined(data)){
                        console.log($rootScope.currentUser);
                        
                        // determines the integer of how often to trigger rating
                        /*var loginKeys = Object.keys($rootScope.currentUser.logins);
                        var loginTrigger = loginKeys.length/3;
                        console.log(loginTrigger);
                        if (loginTrigger % 1 == 0 && $rootScope.currentUser.dontShowRating != true){
                            console.log('serve rating');  
                            $rootScope.$broadcast('promptRating');
                        }*/
                        
                        if(angular.isUndefined(data.username)){
                            $rootScope.usernameFlag = true;
                            console.log('changing state for username');
                            $state.go('app.account');
                        }
                    }
                        });


            //
            //    Access User information
            //
            //



            console.log("logged in");
        } else {
            qAuthState.reject("AUTH_LOGGED_OUT");
            console.log("logged out");

            $rootScope.mealsteals = new Firebase("https://mealsteals.firebaseio.com/");
            $rootScope.businessesFB = new Firebase("https://mealsteals.firebaseio.com/businesses/");
            $rootScope.busFB = $firebaseObject($rootScope.businessesFB);
            $rootScope.busArray = $firebaseArray($rootScope.businessesFB);
            $rootScope.recurringFB = new Firebase($rootScope.mealsteals + '/recurringDeals');
//            $rootScope.recurringObj = $firebaseObject($rootScope.recurringFB);
            $rootScope.popupFB = new Firebase('https://mealsteals.firebaseio.com/popupAdDeals/');
            $rootScope.popupObj = $firebaseObject($rootScope.popupFB);
//            $rootScope.userFBs = new Firebase("https://mealsteals.firebaseio.com/users_app/");
//            $rootScope.users = $firebaseObject($rootScope.userFBs);
            $rootScope.firstGPSload == true;
            $rootScope.analyticsFlag = false;
        }
    };
    var ref = new Firebase(FBURL);
    ref.onAuth(AuthDataCallback);
    return qAuthState.promise;
  }
  self.getAuthState = function() {
    return onAuth();
  };

  /**
   * Authenticate the user with password
   * returns on success: AuthData
   * returns on error: error
   *
   * common error.code:
   * INVALID_USER (user does not exist)
   * INVALID_EMAIL (email incorrect)
   * INVALID_PASSWORD
   */
  self.signInPassword = function(userEmail, userPassword) {
      var qSignIn = $q.defer();
      var ref = new Firebase(FBURL);
      ref.authWithPassword({
          email    : userEmail,
          password : userPassword
      }, function(error, AuthData) {
          if (error) {
              //console.log("Login Failed!", error);
              qSignIn.reject(error);
          } else {
              //console.log("Authenticated successfully with payload:", AuthData);
              self.AuthData = AuthData; //gv
              qSignIn.resolve(AuthData);
          }
      });
      $rootScope.userEmail = userEmail;
      console.log($rootScope.userEmail);
      return qSignIn.promise;
  };


  /**
   * Create a new user with password
   * method: does not require confirmation of email
   * returns on success: userData =/= AuthData (??)
   * returns on error: error
   *
   */
  self.signUpPassword = function(userEmail, userPassword) {
    var qSignup = $q.defer();
    var ref = new Firebase(FBURL);
    ref.createUser({
        email    : userEmail,
        password : userPassword
    }, function(error, userData) {
        if (error) {
            qSignup.reject(error)
        } else {
            qSignup.resolve(userData)
      }
    });

    // ** initiate profile settings here
    // ** or set new userBoolean to true and then handle it in onAuth
    // https://www.firebase.com/docs/web/guide/user-auth.html#section-configuring
    return qSignup.promise;
  };

  /**
   * Change Password or Email / Reset Password
   */
  self.changePassword = function(userEmail, oldPassword, newPassword) {
    var qChange = $q.defer();
    var ref = new Firebase(FBURL);
    ref.changePassword({
        email       : userEmail,
        oldPassword : oldPassword,
        newPassword : newPassword
    }, function(error) {
        if (error === null) {
            qChange.resolve("CHANGE_PASSWORD_SUCCESS");
        } else {
            qChange.reject(error);
        }
    });
    return qChange.promise;
  };

  self.changeEmail = function(oldEmail, newEmail, userPassword) {
    var qChange = $q.defer();
    var ref = new Firebase(FBURL);
    ref.changeEmail({
        oldEmail : oldEmail,
        newEmail : newEmail,
        password : userPassword
    }, function(error) {
        if (error === null) {
            qChange.resolve("CHANGE_EMAIL_SUCCESS");
        } else {
            qChange.reject(error);
        }
    });
    return qChange.promise;
  };

  self.resetPassword = function(userEmail) {
    var qConfirm = $q.defer();
    var ref = new Firebase(FBURL);
    ref.resetPassword({
        email: userEmail
    },
    function(error) {
        if (error) {
            qConfirm.reject(error);
        } else {
            qConfirm.resolve("RESET_PASSWORD_SUCCESS");
        }
    });
    return qConfirm.promise;
  };

  return self;
})

angular.module('starter.controllers-account', [])

.controller('AccountCtrl', function(
  $rootScope, $scope, $state, $stateParams, $timeout, fbutil, 
  $ionicModal, $ionicHistory, $ionicPopup, $ionicActionSheet,
  Auth, Profile, Codes, Utils, $rootScope, AccountBase, CordovaCamera, $firebaseArray, $firebaseObject, $ionicLoading, $cordovaToast, $cordovaDialogs, $jrCrop, $ionicScrollDelegate, $ionicPopover) {

   $scope.places = $firebaseObject(fbutil.ref('adminAnalytics/places'));    
    
   //$scope.changeProfile = false;    
    
      
    
   $ionicLoading.show({
      template: 'Loading...',
      duration: 1000
    });
  // ----
  // Init other

    $scope.timezones = moment.tz.names();
    
  // global variables
  $scope.AuthData = Auth.AuthData;
    //console.log(Auth.AuthData.uid);
  $scope.$watch(
      // This function returns the value being watched. It is called for each turn of the $digest loop
      function() {return $scope.AuthData},
      // This is the change listener, called when the value returned from the above function changes
      function(newValue, oldValue) {
        if (!angular.isUndefined(newValue)) {
          // Only increment the counter if the value changed
          $rootScope.initFunc(newValue.uid);
        }
      }
  );
    
 
//  if (Auth.AuthData.password.email){
//      console.log(Auth.AuthData.password.email);    
//  };    
    
  // communicates with the DOM
  $scope.status = {
    //profile: "account",
    loading: true,
    loadingProfile: true,
    changePasswordMode: "lost",
    updateMessage: "Update account", //default
    updateButtonClass: 'button-positive', //default
    toggleLoginManual: false,
  };
    
        
    
  $rootScope.$on('profileStatus', function(){
        if ($rootScope.profileSet==true){
            $rootScope.accountTab = "account";
            console.log('profile set');
        } else {
             $rootScope.accountTab = "change";
             console.log('profile not set');
        }
        if ($rootScope.noBiz==true){
            $rootScope.accountTab = "add";
            $scope.noBiz==true;
            console.log('no business');
        }
  }); 

  var userUid = Auth.getAuthState().$$state.value.uid;
  AccountBase.init(userUid);

  //console.log('account ctrl');
    
  $rootScope.goToAccount = function() {
        $state.go('tab.account');
        if ($scope.noBiz==true){
            $timeout(function(){
             // $scope.addBiz();
             $rootScope.accountTab = 'add';
            }, 500);
        } else {
        $rootScope.accountTab = 'change';
        }
  };
    
  $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
  //console.log($scope.currentLoc);
  $rootScope.$on('locationChanged', function(){
    $scope.currentLoc['id'] = $rootScope.getCurrentLoc(); 
      console.log( $scope.currentLoc['id']);
      $scope.approved = { checked: $rootScope.bizInfo[$scope.currentLoc.id].approved};
      if ($rootScope.bizInfo[$scope.currentLoc.id].dealsOn==undefined){
          $rootScope.bizInfo[$scope.currentLoc.id].dealsOn = true;
      }
      $scope.dealsOn = { checked: $rootScope.bizInfo[$scope.currentLoc.id].dealsOn};     
  });

  $scope.triggerLocUpdate = function(){
      userUid = Auth.getAuthState().$$state.value.uid;
     if(!angular.isUndefined(userUid)){
        $rootScope.updateLoc($scope.currentLoc['id']);
        $ionicLoading.show({
          template: 'Loading...',
          duration: 1000
        });
     }
  };

 /* $scope.changeLocation = false;

  $scope.openChangeLocation = function (){
     $scope.changeLocation = true;  
  };
    
  $scope.closeChangeLocation = function(){
     $scope.changeLocation = false;  
  };*/
    
  $scope.betaAdminChange = function() {
      console.log('Beta is now', $scope.beta.status);
      status = $scope.beta.status;
      fbutil.ref('businesses', $scope.currentLoc.id, 'beta').set(status);
     // $rootScope.betaApproved = status;
      $scope.showBetaAdmin = false;
  };
    
  
    
    
  /**
  * ---------------------------------------------------------------------------------------
  * AuthState monitoring
  * ---------------------------------------------------------------------------------------
  */

  $scope.$on('$ionicView.enter', function(e) {
    
    // -->
    checkAuth();

   // console.log('enter');

  });

  // monitor and redirect the user based on its authentication state
  function checkAuth() {
    $scope.AuthData = Auth.AuthData;
    if(!$scope.AuthData.hasOwnProperty('uid')){
      Auth.getAuthState().then(
        function(AuthData){
            console.log("is this user ID? " + AuthData);
          $scope.AuthData = AuthData;
          
          handleLoggedIn();
        },
        function(notLoggedIn){
          handleLoggedOut();
        }
      )
    } else {
      handleLoggedIn();
      
    };
  }; // ./ checkAuth()

  // handles when the user is logged in
  function handleLoggedIn() {

    // @dependency
    loadProfileData();
     
      
      

    // proceed to next state if specified (for instance when user comes from foreign state)
    if($stateParams.nextState != undefined && $stateParams.nextState != null && $stateParams.nextState != "") {
      $state.go($stateParams.nextState);
    }

    
  };

  // handles when the user is logged out
  function handleLoggedOut() {
    openLogin();
    $scope.status['loadingProfile'] = false;
    
    // if for some reason the modals are not automatically opened, show a button
    $timeout(function(){
      $scope.status['toggleLoginManual'] = true;
    }, 1500);
  };

  // update auth status in other controllers
  function broadcastAuthChange() {
    $rootScope.$broadcast('rootScope:authChange', {});
  };

  


  /**
  * ---------------------------------------------------------------------------------------
  * MODAL: Login
  * ---------------------------------------------------------------------------------------
  */

  // Form data for the login modal
  $scope.loginData = {};

  $ionicModal.fromTemplateUrl('auth/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    $state.go('tab.dash');
  };

  // Open the login modal
  $rootScope.login = function() {
    openLogin();
  };
  function openLogin() {
    if($scope.modal != undefined) {
      $scope.modal.show();
    } else {
      $timeout(function(){
        openLogin();
      }, 1500)
    }
  };
    // for testing purposes only
   $scope.noLogin = function(){
        $scope.modal.hide();
  };

    
  $scope.signOut = function() {
      $cordovaDialogs.confirm('Are you sure you want to sign out?', 'Sign Out', ['Sign Out', 'Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                  $scope.unAuth();  
              }
        });  
  };    

  $scope.unAuth = function() {
    $rootScope.resetAccount();
    Auth.unAuth();
    
    $scope.AuthData = {};
    $scope.ProfileData = {};
    
    $scope.loginData = {};  
    $scope.signUpData = {};           $scope.closeSignUp();
    $scope.changeEmailData = {};      $scope.closeChangeEmail();
    $scope.changePasswordData = {};   //$scope.closeChangePassword();
    $scope.setProfileData = {};       $scope.closeSetProfile();
    
    broadcastAuthChange();
    handleLoggedOut();
  };
    
   if(window.localStorage['hasSeenApp']){
        $rootScope.hasSeenApp = true;
    } else {
        $rootScope.hasSeenApp = false;
    }   
           
    
  if(!angular.isUndefined(localStorage.getItem('loginData.userEmail')) && !angular.isUndefined(localStorage.getItem('loginData.userEmail'))){
    
      $scope.loginData.userEmail = localStorage.getItem('loginData.userEmail');
      $scope.loginData.userPassword = localStorage.getItem('loginData.userPassword');
  };      

  // Perform the login action when the user submits the login form
  
  $scope.doLoginSocial = function(provider) {
    Auth.signInSocial(provider).then(
      function(AuthData){
        // -->
        proceedLogin(AuthData);
      },
      function(error){
        Codes.handleError(error);
      }
    )
  };
  
  $scope.doLogin = function() {
    localStorage.setItem('loginData.userEmail', $scope.loginData.userEmail);
    localStorage.setItem('loginData.userPassword', $scope.loginData.userPassword);
      
    if($scope.loginData.userEmail && $scope.loginData.userPassword) {
      Utils.showMessage("Signing in user... ");
      Auth.signInPassword($scope.loginData.userEmail, $scope.loginData.userPassword).then(
        function(AuthData){
          
          // -->
          proceedLogin(AuthData);
          
        },
        function(error){
          Codes.handleError(error);
        }
      )
    }
  };
  
  // wrapper for email and social login
  function proceedLogin(AuthData) {
    // hide modals
    $scope.modal.hide();
    $scope.modalSignUp.hide();
    //$scope.modalChangePassword.hide();

    broadcastAuthChange();
    Utils.showMessage("Signed in!", 500);
    /*if(angular.isUndefined($rootScope.userOptions.walkthroughSeen)){
            $scope.openWalkthroughModal();
    }*/
    mixpanel.track("App Load", {"Email": $scope.loginData.userEmail});
    // handle logged in
    $scope.AuthData = AuthData;
    handleLoggedIn();
      
      
  };


  // ---------------------------------------------------------------------------
  //
  // MODAL: Sign Up
  //
  // ---------------------------------------------------------------------------

  // Form data for the signUp modal
  $scope.signUpData = {};

  // Create the signUp modal that we will use later
  $ionicModal.fromTemplateUrl('auth/signup.html', {
    scope: $scope,
     animation: 'none'
  }).then(function(modal) {
    $scope.modalSignUp = modal;
  });
  $scope.closeSignUp = function() {
    $scope.modalSignUp.hide();
    $scope.modal.show();
  };
  $scope.signUp = function() {
    console.log('test')
    $scope.modal.hide();
    $scope.modalSignUp.show();
  };
    
  $scope.doSignUp = function() { 
    if ($scope.signUpData.userPassword1 == $scope.signUpData.userPassword2){
        $scope.signUpData.userPassword =$scope.signUpData.userPassword1;
        //console.log('passwords match and the password is: ', $scope.signUpData.userPassword);
        //console.log('Doing signUp', $scope.signUpData);
        if($scope.signUpData.userEmail && $scope.signUpData.userPassword) {
            Utils.showMessage("Creating user... ");
            Auth.signUpPassword($scope.signUpData.userEmail, $scope.signUpData.userPassword).then(
                function(AuthData){
                    console.log('authdata');
                    console.log(AuthData);
            var ref = fbutil.ref('users', AuthData.uid);
              ref.set({email: $scope.signUpData.userEmail});
              fbutil.ref('emails', $scope.signUpData.userEmail.replace('.', ',')).set({uid:AuthData.uid});
                    
              mixpanel.track("New Sign Up", {"Email": $scope.signUpData.userEmail});        
            
//              fbutil.ref('lastUserCreatedAt').set(Firebase.ServerValue.TIMESTAMP);
//              fbutil.ref('newUserLog', AuthData.uid).set({'createdAt':Firebase.ServerValue.TIMESTAMP, 'email':$scope.signUpData.userEmail});  
      
                    
                   
               /* mixpanel.track("New Sign Up", {"Email": $scope.signUpData.userEmail});
                            
                // parameters: service_id, template_id, template_parameters
                emailjs.send("sign_up","newSignupTemplate",{content: "email: "+$scope.signUpData.userEmail, type: "New Sign Up", data: $scope.signUpData.userEmail})
                .then(function(response) {
                   console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                }, function(err) {
                   console.log("FAILED. error=", err);
                });
            */
            
                    
                    
                    $scope.loginData = $scope.signUpData;
                    $scope.doLogin();

                }, function(error){
                    //console.log(error);
                
                    Codes.handleError(error)
                }
            )
        } else {
            Codes.handleError({code: "INVALID_INPUT"})
            
        }
    } else {
        Codes.handleError({code: "PASSWORDS_DONTMATCH"})
    }
  };
    
  // ---------------------------------------------------------------------------
  //
  // MODAL: Initial Walkthrough
  //
  // ---------------------------------------------------------------------------

    
  $ionicModal.fromTemplateUrl('auth/walkthrough.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalWalkthrough = modal;    
  });
  $scope.openWalkthroughModal = function(){
        $scope.modalWalkthrough.show();
        $scope.walkthroughSlide = 1;
  };

  $scope.closeWalkthroughModal = function(){
        $scope.modalWalkthrough.hide();
        //$rootScope.userOptions['walkthroughSeen'] = true;
        //$rootScope.userOptions.$save();
  };
    
  $scope.next = function() {
      if($scope.walkthroughSlide < 3){
        $scope.walkthroughSlide = $scope.walkthroughSlide + 1;
      } else {
          $scope.closeWalkthroughModal();
          
      }
  };
    
  $scope.previous = function() {
      if ($scope.walkthroughSlide > 1){
        $scope.walkthroughSlide = $scope.walkthroughSlide - 1;
      }
  };

  // ---------------------------------------------------------------------------
  //
  // MODAL: Change Password
  //
  // ---------------------------------------------------------------------------

    
  // Form data for the signUp modal
  $scope.changePasswordData = {};


  //
  // step 1: reset password
  // 
    
    $scope.resetPasswordPopup = function() {
        $cordovaDialogs.prompt('Enter Email', 'Reset Password', ['Reset','Cancel'], '')
            .then(function(result) {
              var email = result.input1;
              // no button = 0, 'OK' = 1, 'Cancel' = 2
              var btnIndex = result.buttonIndex;
              if (btnIndex == 1){
                    $scope.resetPassword(email);   
              }
            });  
    };    
  
    $scope.resetPassword = function(email) {
      $scope.changePasswordData.userEmail = email;
      if($scope.changePasswordData.userEmail) {
        Utils.showMessage("Resetting password");
        Auth.resetPassword(
            $scope.changePasswordData.userEmail).then(
            function(success){
                Utils.showMessage("Password has been reset. Please check your email for the temporary password", 2000);
                $scope.status['changePasswordMode'] = 'change';
            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };

  //
  // step 2: change password
  //
  $scope.doChangePassword = function(email, oldPassword, newPassword) {
    $scope.changePasswordData.userEmail = email;
    $scope.changePasswordData.oldPassword = oldPassword;
    $scope.changePasswordData.newPassword = newPassword;
      
    if($scope.changePasswordData.userEmail && $scope.changePasswordData.oldPassword && $scope.changePasswordData.newPassword) {
        Utils.showMessage("Changing password... ");
        Auth.changePassword(
            $scope.changePasswordData.userEmail,
            $scope.changePasswordData.oldPassword,
            $scope.changePasswordData.newPassword).then(
            function(AuthData){

                //
                Utils.showMessage("Password Changed!");
                //
                $scope.loginData = {
                    userEmail:      $scope.changePasswordData.userEmail,
                    userPassword:   $scope.changePasswordData.newPassword,
                }
                $scope.doLogin();

            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };
        
    
  $scope.changePasswordPopup = function() {
        if($scope.AuthData.hasOwnProperty('password')){
          $scope.changePasswordData = {
              userEmail: $scope.AuthData.password.email
          }
        }
        $cordovaDialogs.prompt('Old Password', 'Change Password', ['Enter','Cancel'], '')
        .then(function(result) {
          var oldPassword = result.input1;
          // no button = 0, 'OK' = 1, 'Cancel' = 2
          var btnIndex = result.buttonIndex;
              if (btnIndex == 1){
                  $cordovaDialogs.prompt('New Password', 'Change Password', ['Enter','Cancel'], '')
                        .then(function(result) {
                          var newPassword = result.input1;
                          // no button = 0, 'OK' = 1, 'Cancel' = 2
                          var btnIndex = result.buttonIndex;
                          if (btnIndex == 1){ 
                              $scope.doChangePassword($scope.changePasswordData.userEmail, oldPassword, newPassword);
                          }
                  });
              } else {
                  console.log('cancel');
              }
        });
  };    


  // ---------------------------------------------------------------------------
  //
  // MODAL: Change E-mail
  //
  // ---------------------------------------------------------------------------

  // Form data for the login modal
  $scope.changeEmailData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('auth/change-email.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalChangeEmail = modal;
  });
  $scope.closeChangeEmail = function() {
    $scope.modalChangeEmail.hide();
  };
  $scope.changeEmail = function() {
    // when authenticated
    if($scope.AuthData.hasOwnProperty('password')){
        $scope.changeEmailData = {
            oldEmail: $scope.AuthData.password.email
        }
    }
    $scope.modal.hide();
    $scope.modalChangeEmail.show();
  };
  $scope.doChangeEmail = function() {       console.log('changeEmail', $scope.changeEmailData);
    if($scope.changeEmailData.oldEmail && $scope.changeEmailData.newEmail && $scope.changeEmailData.userPassword) {

        Utils.showMessage("Changing e-mail...")

        Auth.changeEmail(
            $scope.changeEmailData.oldEmail,
            $scope.changeEmailData.newEmail,
            $scope.changeEmailData.userPassword).then(
            function(success){

                //
                $scope.closeChangeEmail();
                Utils.showMessage("E-mail changed!", 500)

            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };
  
  
  
  
  // ---------------------------------------------------------------------------
  //
  // MODAL: Set username and displayname
  //
  // ---------------------------------------------------------------------------

  // Form data for the login modal
  $scope.setProfileData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('auth/change-profile.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalSetProfile = modal;
  });
  
  $scope.closeSetProfile = function() {
    $scope.modalSetProfile.hide();
  };
  
  $scope.setProfile = function() {
    openSetProfile();
  };
  function openSetProfile() {
    if($scope.modalSetProfile != undefined) {
      $scope.modalSetProfile.show();
    } else {
      $timeout(function(){
        openSetProfile();
      }, 1500)
    }
  };
  
  $scope.finishSetProfile = function() {
    if($scope.ProfileData.hasOwnProperty('meta')){
      if($scope.ProfileData.meta.hasOwnProperty('username') && $scope.ProfileData.meta.hasOwnProperty('displayName')) {
        $scope.modalSetProfile.hide();
        $state.go('tab.account');
      } else {
        Codes.handleError({code: "PROFILE_NOT_SET"})
      }
    } else {
      Codes.handleError({code: "PROFILE_NOT_SET"})
    }
  };
  
  
  
   /**
  * ---------------------------------------------------------------------------------------
  * MODAL: change business profile modal
  * ---------------------------------------------------------------------------------------
  */
  
    $ionicModal.fromTemplateUrl('auth/business-profile.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modalBizProfile = modal;
      });
    
      $scope.closeAccountProfile = function() {
            $rootScope.accountTab = 'account';  
      };
    
      $scope.openAccountProfile = function() {
            $rootScope.accountTab = 'change';  
      };

      $scope.closeProfile = function(id){
          
              $rootScope.changeProfileObj['businessName'] = $rootScope.bizInfo[id].businessName;
              $rootScope.changeProfileObj['address'] = $rootScope.bizInfo[id].address;
              $rootScope.changeProfileObj['timezone'] = $rootScope.bizInfo[id].timezone;
              $rootScope.changeProfileObj['detailBackground'] = $rootScope.bizInfo[id].detailBackground;
              $rootScope.changeProfileObj['lat'] = $rootScope.bizInfo[id].lat;
              $rootScope.changeProfileObj['lon'] = $rootScope.bizInfo[id].lon;
              $rootScope.changeProfileObj['city'] = $rootScope.bizInfo[id].city;
              $rootScope.changeProfileObj['state'] = $rootScope.bizInfo[id].state;
              $rootScope.changeProfileObj['website'] = $rootScope.bizInfo[id].website;
              $rootScope.changeProfileObj['facebook'] = $rootScope.bizInfo[id].facebook;
              $rootScope.changeProfileObj['twitter'] = $rootScope.bizInfo[id].twitter;
              $rootScope.changeProfileObj['instagram'] = $rootScope.bizInfo[id].instagram;
              $rootScope.changeProfileObj['phone'] = $rootScope.bizInfo[id].phone;
              $rootScope.changeProfileObj['icon'] = $rootScope.bizInfo[id].icon;
              $rootScope.changeProfileObj['about'] = $rootScope.bizInfo[id].about;
              $rootScope.changeProfileObj['contactName'] = $rootScope.bizInfo[id].contactName;
              $rootScope.changeProfileObj['rooftop'] = $rootScope.bizInfo[id].rooftop;
              $rootScope.changeProfileObj['patio'] = $rootScope.bizInfo[id].patio;
              $rootScope.changeProfileObj['vegan'] = $rootScope.bizInfo[id].vegan;
          
              $ionicScrollDelegate.scrollTop();
  
      }
    
      $scope.closeBizProfile = function(id) {
              
              $rootScope.changeProfileObj['businessName'] = $rootScope.bizInfo[id].businessName;
              $rootScope.changeProfileObj['address'] = $rootScope.bizInfo[id].address;
              $rootScope.changeProfileObj['timezone'] = $rootScope.bizInfo[id].timezone;
              $rootScope.changeProfileObj['detailBackground'] = $rootScope.bizInfo[id].detailBackground;
              $rootScope.changeProfileObj['lat'] = $rootScope.bizInfo[id].businessName;
              $rootScope.changeProfileObj['lon'] = $rootScope.bizInfo[id].lat;
              $rootScope.changeProfileObj['city'] = $rootScope.bizInfo[id].city;
              $rootScope.changeProfileObj['state'] = $rootScope.bizInfo[id].state;
              $rootScope.changeProfileObj['website'] = $rootScope.bizInfo[id].website;
              $rootScope.changeProfileObj['facebook'] = $rootScope.bizInfo[id].facebook;
              $rootScope.changeProfileObj['twitter'] = $rootScope.bizInfo[id].twitter;
              $rootScope.changeProfileObj['instagram'] = $rootScope.bizInfo[id].instagram;
              $rootScope.changeProfileObj['phone'] = $rootScope.bizInfo[id].phone;
              $rootScope.changeProfileObj['icon'] = $rootScope.bizInfo[id].icon;
              $rootScope.changeProfileObj['about'] = $rootScope.bizInfo[id].about;
              $rootScope.changeProfileObj['rooftop'] = $rootScope.bizInfo[id].rooftop;
              $rootScope.changeProfileObj['patio'] = $rootScope.bizInfo[id].patio;
              $rootScope.changeProfileObj['vegan'] = $rootScope.bizInfo[id].vegan;
        $scope.modalBizProfile.hide();
      };

      $scope.changeBizProfile = function() {
        openBizProfile();
      };
      function openBizProfile() {
          $scope.modalBizProfile.show();
           $scope.profileNotSetToast();
        /*if($scope.modalBizProfile != undefined) {
          $scope.modalSetProfile.show();
        } else {
          $timeout(function(){
            openSetProfile();
          }, 1500)
        }*/
      };

      $scope.closeBizProfile = function() {
          $scope.modalBizProfile.hide();
      };
    
      $scope.finishBizProfile = function() {
          $scope.modalBizProfile.hide();
          $state.go('tab.account');
        /*if($scope.ProfileData.hasOwnProperty('meta')){
          if($scope.ProfileData.meta.hasOwnProperty('username') && $scope.ProfileData.meta.hasOwnProperty('displayName')) {
            $scope.modalBizProfile.hide();
          } else {
            Codes.handleError({code: "PROFILE_NOT_SET"})
          }
        } else {
          Codes.handleError({code: "PROFILE_NOT_SET"})
        }*/
      };
    
      $rootScope.$on('promptProfile', function(){
        $scope.modalBizProfile.show();
        $scope.profileNotSetToast();
      });
  
  
  /**
  * ---------------------------------------------------------------------------------------
  * Update profile (delivery details in this exercise)
  * ---------------------------------------------------------------------------------------
  */

  $scope.ProfileData = {};
  function loadProfileData() {
    $scope.status['loadingProfile'] = true;
    if($scope.AuthData.hasOwnProperty('uid')){
      Profile.get($scope.AuthData.uid).then(
        function(ProfileData) {
          
          // bind to scope
          if(ProfileData != null) {
            $scope.ProfileData = ProfileData;
          };
            
          $scope.status['loadingProfile'] = false; // duplicate**
          $scope.status['loading'] = false;
          
          
          // @dependency
          // Must have set username and displayname
          /*if(preparePopupData('meta', 'username') && preparePopupData('meta', 'displayName')) {
            $scope.status['loadingProfile'] = false; // duplicate**
            $scope.status['loading'] = false;
          } else {
            $scope.status['loadingProfile'] = false; // duplicate**
            $scope.setProfile();
          }*/
        }
      ),
      function(error){
        $scope.status['loadingProfile'] = false;
        $scope.status['loading'] = false;
      }
    };
  };
  
        $scope.disableTap = function(){
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function(){
        document.getElementById('searchBar').blur();
    });
  };
    
    
  // popup generic
  var myPopup;
  $scope.popupData = {};
  function showPopup(title, inputStr) {
    $scope.popupData['inputStr'] = inputStr;
    myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="popupData.inputStr">',
    title: title,
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.popupData.inputStr) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.popupData.inputStr;
          }
        }
      }
    ]
    });
  }
    
  // add location popup
  var myPopup;
  $scope.popupData = {};
  function showLocPopup(title, inputStr) {
    $scope.popupData['inputStr'] = inputStr;
    myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="popupData.inputStr">',
    title: title,
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Add</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.popupData.inputStr) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.popupData.inputStr;
          }
        }
      }
    ]
    });
  }

     //live updating
  // changeProfile
  $scope.changeProfile = function(id) {

      id = $rootScope.getCurrentLoc(); 
      
      if(!angular.isUndefined($rootScope.changeProfileObj['businessName'])){
          $rootScope.bizInfo[id].businessName = $rootScope.changeProfileObj['businessName'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['address'])){
          $rootScope.bizInfo[id].address = $rootScope.changeProfileObj['address'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['timezone'])){
          $rootScope.bizInfo[id].timezone = $rootScope.changeProfileObj['timezone'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['detailBackground'])){
          $rootScope.bizInfo[id].detailBackground = $rootScope.changeProfileObj['detailBackground'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['lat'])){
          $rootScope.bizInfo[id].lat = $rootScope.changeProfileObj['lat'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['lon'])){
          $rootScope.bizInfo[id].lon = $rootScope.changeProfileObj['lon'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['city'])){
          $rootScope.bizInfo[id].city = $rootScope.changeProfileObj['city'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['state'])){
          $rootScope.bizInfo[id].state = $rootScope.changeProfileObj['state'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['website'])){
          $rootScope.bizInfo[id].website = $rootScope.changeProfileObj['website'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['facebook'])){
          $rootScope.bizInfo[id].facebook = $rootScope.changeProfileObj['facebook'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['twitter'])){
          $rootScope.bizInfo[id].twitter = $rootScope.changeProfileObj['twitter'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['instagram'])){
          $rootScope.bizInfo[id].instagram = $rootScope.changeProfileObj['instagram'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['phone'])){
          $rootScope.bizInfo[id].phone = $rootScope.changeProfileObj['phone'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['icon'])){
          $rootScope.bizInfo[id].icon = $rootScope.changeProfileObj['icon'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['about'])){
          $rootScope.bizInfo[id].about = $rootScope.changeProfileObj['about'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['contactName'])){
          $rootScope.bizInfo[id].contactName = $rootScope.changeProfileObj['contactName'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['rooftop'])){
          $rootScope.bizInfo[id].rooftop = $rootScope.changeProfileObj['rooftop'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['patio'])){
          $rootScope.bizInfo[id].patio = $rootScope.changeProfileObj['patio'];
      }
      if(!angular.isUndefined($rootScope.changeProfileObj['vegan'])){
          $rootScope.bizInfo[id].vegan = $rootScope.changeProfileObj['vegan'];
      }
      
      $rootScope.bizInfo[id].$save();


      
      $rootScope.myRecurringDeals.$loaded(function(deals){
              
          angular.forEach(deals, function(deal){

              console.log(deal);
              
              
              if(!angular.isUndefined($rootScope.bizInfo[id].businessName)){
                fbutil.ref('recurringDeals/', deal.$id, '/locName').set($rootScope.bizInfo[id].businessName);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].about)){
                fbutil.ref('recurringDeals/', deal.$id, '/about').set($rootScope.bizInfo[id].about);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].address)){
                fbutil.ref('recurringDeals/', deal.$id, '/address').set($rootScope.bizInfo[id].address);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].timezone)){
                fbutil.ref('recurringDeals/', deal.$id, '/timezone').set($rootScope.bizInfo[id].timezone);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].detailBackground)){
                fbutil.ref('recurringDeals/', deal.$id, '/detailBackgroundFull').set($rootScope.bizInfo[id].detailBackground);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].lat)){
                fbutil.ref('recurringDeals/', deal.$id, '/lat').set($rootScope.bizInfo[id].lat);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].lon)){
                fbutil.ref('recurringDeals/', deal.$id, '/lon').set($rootScope.bizInfo[id].lon);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].city)){
                fbutil.ref('recurringDeals/', deal.$id, '/city').set($rootScope.bizInfo[id].city);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].state)){
                fbutil.ref('recurringDeals/', deal.$id, '/state').set($rootScope.bizInfo[id].state);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].website)){
                fbutil.ref('recurringDeals/', deal.$id, '/website').set($rootScope.bizInfo[id].website);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].facebook)){
                fbutil.ref('recurringDeals/', deal.$id, '/facebook').set($rootScope.bizInfo[id].facebook);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].twitter)){
                fbutil.ref('recurringDeals/', deal.$id, '/twitter').set($rootScope.bizInfo[id].twitter);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].instagram)){
                fbutil.ref('recurringDeals/', deal.$id, '/instagram').set($rootScope.bizInfo[id].instagram);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].phone)){
                fbutil.ref('recurringDeals/', deal.$id, '/phone').set($rootScope.bizInfo[id].phone);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].icon)){
                fbutil.ref('recurringDeals/', deal.$id, '/icon').set($rootScope.bizInfo[id].icon);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].rooftop)){
                fbutil.ref('recurringDeals/', deal.$id, '/rooftop').set($rootScope.bizInfo[id].rooftop);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].patio)){
                fbutil.ref('recurringDeals/', deal.$id, '/patio').set($rootScope.bizInfo[id].patio);
              }
              if(!angular.isUndefined($rootScope.bizInfo[id].vegan)){
                fbutil.ref('recurringDeals/', deal.$id, '/vegan').set($rootScope.bizInfo[id].vegan);
              }
             
            });
        });
                angular.forEach($rootScope.todaysDeals, function(thisDeal){

                    var start = new Date(thisDeal.startTime);
                    var verifyStart = moment(start.getTime()).format('YYMMDD');
                    
                       
                    var date = new Date();
                    var time = date.getTime();

                    var todayDate = moment(time).format('YYMMDD');

                    if(verifyStart == todayDate){

                         
//                           todayDeals obj
                        var time = new Date();
                        
                        var day = moment(time).format("YYYYMMDD");
                        
                        
                         
                        if(!angular.isUndefined($rootScope.bizInfo[id].twitter)){
                            fbutil.ref('todaysDeals/' , day , thisDeal.$id , '/twitter').set($rootScope.bizInfo[id].twitter);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].about)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/about').set($rootScope.bizInfo[id].about);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].address)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/address').set($rootScope.bizInfo[id].address);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].city)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/city').set($rootScope.bizInfo[id].city);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].detailBackgroundFull)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/detailBackground').set($rootScope.bizInfo[id].detailBackgroundFull);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].businessName)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/locName').set($rootScope.bizInfo[id].businessName);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].icon)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/icon').set($rootScope.bizInfo[id].icon);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].facebook)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/facebook').set($rootScope.bizInfo[id].facebook);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].phone)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/phone').set($rootScope.bizInfo[id].phone);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].state)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/state').set($rootScope.bizInfo[id].state);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].website)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/website').set($rootScope.bizInfo[id].website);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].lat)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/lat').set($rootScope.bizInfo[id].lat);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].lon)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/lon').set($rootScope.bizInfo[id].lon);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].rooftop)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/rooftop').set($rootScope.bizInfo[id].rooftop);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].patio)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/patio').set($rootScope.bizInfo[id].patio);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[id].vegan)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/vegan').set($rootScope.bizInfo[id].vegan);
                        }
                        
                        var end = new Date(thisDeal.endTime);
                        var verifyEnd = moment(end.getTime()).format('YYYYMMDD');
                        if(verifyEnd != day){
                            
                            if(!angular.isUndefined($rootScope.bizInfo[id].twitter)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/twitter').set($rootScope.bizInfo[id].twitter);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].about)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/about').set($rootScope.bizInfo[id].about);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].address)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/address').set($rootScope.bizInfo[id].address);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].city)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/city').set($rootScope.bizInfo[id].city);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].detailBackgroundFull)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/detailBackground').set($rootScope.bizInfo[id].detailBackgroundFull);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].facebook)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/facebook').set($rootScope.bizInfo[id].facebook);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].icon)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/icon').set($rootScope.bizInfo[id].icon);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].businessName)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/locName').set($rootScope.bizInfo[id].businessName);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].phone)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/phone').set($rootScope.bizInfo[id].phone);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].state)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/state').set($rootScope.bizInfo[id].state);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].website)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/website').set($rootScope.bizInfo[id].website);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].lat)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/lat').set($rootScope.bizInfo[id].lat);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].lon)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/lon').set($rootScope.bizInfo[id].lon);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].rooftop)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/rooftop').set($rootScope.bizInfo[id].rooftop);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].patio)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/patio').set($rootScope.bizInfo[id].patio);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[id].vegan)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/vegan').set($rootScope.bizInfo[id].vegan);
                            }
                            
                            
                        }
                        
                        
                    }

                });
        
              
       
 
      console.log('checking attributes')
      console.log($rootScope.bizInfo[id]);
      if(!angular.isUndefined($rootScope.bizInfo[id].about) &&
         !angular.isUndefined($rootScope.bizInfo[id].timezone) &&
         !angular.isUndefined($rootScope.bizInfo[id].contactName) &&
         !angular.isUndefined($rootScope.bizInfo[id].address) &&
         !angular.isUndefined($rootScope.bizInfo[id].phone) &&
         //!angular.isUndefined($rootScope.bizInfo[id].icon) &&
         !angular.isUndefined($rootScope.bizInfo[id].businessName)){  
            $rootScope.profileSet = true;
            console.log('profile finally set!!!');
            Utils.showMessage("Profile Saved!", 1500)
            
         }else{
            $rootScope.profileSet = false;
            console.log('still need more info!');
            Utils.showMessage("Profile Saved, still need more info!", 1500)
           
         }
      $timeout(function(){
          $rootScope.accountTab = 'account';
      }, 1500)
     
      $ionicScrollDelegate.scrollTop();
  };
    
  $scope.profileNotSetToast = function(){
      var id = $scope.currentLoc.id;
      if(!angular.isUndefined($rootScope.bizInfo[id].about) &&
         !angular.isUndefined($rootScope.bizInfo[id].timezone) &&
         !angular.isUndefined($rootScope.bizInfo[id].contactName) &&
         !angular.isUndefined($rootScope.bizInfo[id].address) &&
         !angular.isUndefined($rootScope.bizInfo[id].phone) &&
         !angular.isUndefined($rootScope.bizInfo[id].icon) &&
         !angular.isUndefined($rootScope.bizInfo[id].businessName)){  
            console.log('Do nothing');
         }else{
            console.log('toast bitch');
            window.plugins.toast.showWithOptions({
                message: "Items in red are required!",
                duration: "short", // 2000 ms
                position: "bottom",
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
         }
  };
    
    $scope.passwordFailToast = function(){
  
        window.plugins.toast.showWithOptions({
            message: "passwords don't match!",
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
    
    
//    
//    
//    image upload
//    
//    
    
  $scope.iconStyleGuide = function(){
         $cordovaDialogs.confirm('A high quality icon will help you stand out from your competition.  Its important to chose an icon thats clear and easy to see when shrunk down.  Transparencies rendering a unique shape will help your icon stand out the most. Contact us if you would like assistance.', 'Icon Style Guide', ['Contact', 'Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                   $scope.modalContact.show();
                   $scope.mail = {};
                   $scope.mail.subject = "Icon help";
                   $scope.mail.email =  $scope.AuthData.password.email;
                   $scope.mail.priority = 'Low';
              }
        });  
  };    
        
  // update deal image Action Sheet
  $scope.uploadPicture = function(id,type) {
         // Show the action sheet
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a new picture' },
                    { text: 'Import from phone library' },
                ],
                titleText: 'Update Image',
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
              $scope.uploadCamera(sourceTypeIndex, id, type).then(
                function(success){
                  //loadProfileData();
                }
              );
            };
  };
    
    
  // capture deal image
  $scope.uploadCamera = function(sourceTypeIndex, id, type) {
      console.log('in UploadCamera');
      
      if(type == 'detailBackground'){
          
      
      var options = {
            quality:            100,
		    allowEdit :         true,
		    targetWidth:        600,
            targetHeight:       400,
            correctOrientation: true,
		    saveToPhotoAlbum:   true
	    };
          
      }
      
      if(type == 'icon'){
          
      
      var options = {
            quality:            100,
		    allowEdit :         true,
		    targetWidth:        160,
            targetHeight:       160,
            correctOrientation: true,
            encodingType:       'png',
		    saveToPhotoAlbum:   true
	    };
          
      }
      
    return CordovaCamera.newImage(sourceTypeIndex, options).then(
     
        function(imageData){
        if(imageData != undefined) {
            console.log("image data defined");
            
            
//            
//            $jrCrop.crop({
//                url: imageData,
//                width: 160,
//                height: 160,
//                circle: true
//            }).then(function(canvas) {
//                // success!
//                var image = canvas.toDataURL();
//                $scope.uploadFiles(image, 'dealImage');
//            });
//            
            
        $scope.uploadFiles(imageData, type, id);
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
    $rootScope.timeID = String(new Date().getTime());
        
        
        
    $scope.uploadFiles = function(image, fileName, id) {

                var blob = dataURItoBlob(image);
                var file = new FormData(document.forms[0]);

                file.append(fileName, blob);



        //var file = image;
        var fd = new FormData();

        var stamp = String(new Date().getTime());
        
        var key = stamp + fileName;
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

        xhr.addEventListener("progress", updateProgress);
        xhr.addEventListener("load", transferComplete);
        xhr.addEventListener("error", transferFailed);
        xhr.addEventListener("abort", transferCanceled);

        xhr.open('POST', 'http://s3.amazonaws.com/mealstealsyes/', true); //MUST BE LAST LINE BEFORE YOU SEND 

        xhr.send(fd);
        
        
        $scope.newImage = "http://s3.amazonaws.com/mealstealsyes/" + key;
        $scope.id = id;
        $scope.fileName = fileName;
    
        $ionicLoading.show({
              template: 'Uploading...',
              duration: 3000
        });
  }
    
   // progress on transfers from the server to the client (downloads)
function updateProgress (oEvent) {
  if (oEvent.lengthComputable) {
    var percentComplete = oEvent.loaded / oEvent.total;
    // ...
  } else {
    // Unable to compute progress information since the total size is unknown
  }
}

function transferComplete(evt) {
  console.log("The transfer is complete.");
    $timeout(function(){
         $rootScope.changeProfileObj[$scope.fileName] = $scope.newImage;
      }, 1000)
       
    
    
}

function transferFailed(evt) {
  console.log("An error occurred while transferring the file.");
}

function transferCanceled(evt) {
  console.log("The transfer has been canceled by the user.");
}
    
    
    
    
//    
//    
//   END UPLOAD Image 
//    
//    
    
    
  // fn change 
  $scope.changeDisplayName = function() {
    showPopup('Change display name', preparePopupData('meta', 'displayName'));
    myPopup.then(function(newDisplayName) {
      if(newDisplayName != undefined && newDisplayName != null) {
          
        Profile.setSub(Auth.AuthData.uid, "meta", "displayName", newDisplayName).then(
          function(success){
            loadProfileData();
            $scope.addNewLoc(newDisplayName);
          }
        );
      };
    });
  };
    
      // fn change 
  /*$scope.addBiz = function() {
    showLocPopup('Add Business');
    myPopup.then(function(newDisplayName) {
      if(newDisplayName != undefined && newDisplayName != null) {
            $scope.addNewLoc(newDisplayName);
          }
    });
  };*/
    
  /*  $scope.addBiz = function() {
        $cordovaDialogs.prompt('Please enter the name of your bar or restaurant', 'Add Business', ['Add','Cancel'], '')
            .then(function(result) {
              var newDisplayName = result.input1;
              // no button = 0, 'OK' = 1, 'Cancel' = 2
              var btnIndex = result.buttonIndex;
              if (btnIndex == 1){
                   if(newDisplayName != undefined && newDisplayName != null && newDisplayName != '') {
                        $scope.addNewLoc(newDisplayName);
                        // console.log(newDisplayName);
                    } 
              }
            });  
    }*/
    
    $scope.deleteBiz = function(biz, bizObj){
        //console.log(bizObj);
         $cordovaDialogs.confirm('Deleting your business cannot be undone!', 'Warning!', ['Delete', 'Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                   $cordovaDialogs.confirm('Deleting your business cannot be undone!', 'Are you sure?', ['Delete', 'Cancel'])
                        .then(function(buttonIndex) {
                          var btnIndex = buttonIndex;
                          if (btnIndex == 1){
                             $scope.deleteBizConfirm(biz, bizObj);
                          }
                    });
              }
        });  
    };
    
    
     
    $scope.deleteBizConfirm = function(biz, bizObj){
        
        var id = biz;
        
        var recurring = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo(id));
        var users = $firebaseArray(fbutil.ref('users'));
        
        
        
        recurring.$loaded().then(function(){
            angular.forEach(recurring, function(rec){

                if(rec.businessID == id){
                    fbutil.ref('recurringDeals/' + rec.$id).remove();
                }

            });
            console.log('removed recurring');
        });
        
       
             angular.forEach($rootScope.todaysDeals, function(deal){

                var start = new Date(deal.startTime);
                var verifyStart = moment(start.getTime()).format('YYYYMMDD');
                 
                var end = new Date(deal.endTime);
                var verifyEnd = moment(end.getTime()).format('YYYYMMDD');
                 
                fbutil.ref('todaysDeals/' + verifyStart + '/' + deal.$id).remove();
                
                 if(verifyStart != verifyEnd){
                     fbutil.ref('todaysDeals/' + verifyend + '/' + deal.$id).remove();
                 }

            });
        
        users.$loaded().then(function(){
             angular.forEach(users, function(user){

                if(!angular.isUndefined(user.bizIDs) && !angular.isUndefined(user.bizIDs[id])){
                    fbutil.ref('users', user.$id, 'bizIDs', id).remove();
                }

            });
            console.log('removed access in users');
        });
        
    
        fbutil.ref('businesses/' + id).remove();
        fbutil.ref('allBizIDs/' + id).remove();
        
        if (!angular.isUndefined(bizObj.placeId)){
            fbutil.ref('adminAnalytics/places/',bizObj.placeId).set(null);
        }
        console.log('removed business');
    };
    
    $scope.cantFindBiz = function(){
         $cordovaDialogs.confirm('If your business isnt listed, contact us and we will assist you in settting up your account', 'Cant Find Business', ['Contact', 'Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                   $scope.modalRequest.show();
                   $scope.request = {};
                   $scope.request.email =  $scope.AuthData.password.email;
                   $scope.request.type = 'request';
              }
        });  
  };    
    
    $scope.options = {
      types: ['establishment'],
      componentRestrictions: { country: 'US' }
    }
    
  
    
   
    $scope.addPlace = function(place, lat, lon, city, state){
        
        if (place) {
            console.log(place);
              //this is where it would check our ids in our database
           if (place.place_id != undefined) {
//                if (place.types.indexOf('bar') > -1 ||
//                    place.types.indexOf('restaurant') > -1 ||
//                    place.types.indexOf('food') > -1 ||
//                    place.types.indexOf('bakery') > -1 ||
//                    place.types.indexOf('cafe') > -1 ||
//                    place.types.indexOf('meal_delivery') > -1 ||
//                    place.types.indexOf('meal_takeout') > -1 ||
//                    place.types.indexOf('night_club') > -1
//                   ) {
                        if (!angular.isUndefined($scope.places[place.place_id])) {
                            $scope.addBizMessage = place.name+' taken';
                            $cordovaDialogs.confirm('This business has already been added to the MealSteals app, would you like to claim this business?', 'Claim '+place.name, ['Claim', 'Cancel'])
                                .then(function(buttonIndex) {
                                  var btnIndex = buttonIndex;
                                  if (btnIndex == 1){
                                      console.log(place);
                                       $scope.modalRequest.show();
                                       $scope.request = {};
                                       $scope.request.email =  Auth.AuthData.password.email;
                                       $scope.request.type = 'claim';
                                       $scope.request.business = place.name;
                                       $scope.request.city = city;
                                       $scope.request.address = place.formatted_address;
                                       
                                  }
                            });
                        } else {
                            $scope.addBizMessage = place.name+' available!';
                            $cordovaDialogs.confirm(place.formatted_address, 'Add '+place.name, ['Add', 'Cancel'])
                                .then(function(buttonIndex) {
                                  var btnIndex = buttonIndex;
                                  if (btnIndex == 1){ 
                                       $scope.addNewLoc(place, lat, lon, city, state);
                                  }
                            });
                        }
//                } else {
//                    console.log(place);
//                    $scope.addBizMessage = 'Not a valid bar or restaurant';
//                    $cordovaDialogs.alert('Please enter a valid bar or restaurant', 'Invalid entry', 'Ok')
//                            .then(function() {     
//                    });
//                }
                
           } else {
              $cordovaDialogs.alert('Please enter a valid bar or restaurant', 'Invalid entry', 'Ok')
                            .then(function() {     
              });
           }
        }  
    };
    
    $scope.clearMessage = function() {
        
        $scope.addBizMessage = '';
    };
  
    $scope.addNewPlace = function (name){
        console.log(name);  
    };
    
   /* $scope.writePlace = function (place, lat, lon){
        console.log('Address: ', place.formatted_address);
        console.log('Phone: ', place.formatted_phone_number);
        console.log('Lat: ', lat);
        console.log('Lon: ', lon);
        console.log('ID: ', place.place_id);
        
    };*/
       
    $scope.closeAddLoc = function() {
        $rootScope.accountTab = 'account';
    };
    
    $scope.addLocView = function() {
        $rootScope.accountTab = 'add';  
    };
    $scope.addNewLoc = function(place, lat, lon, city, state){
      console.log(place);
      var locName = place.name;
      var newLocRef = fbutil.ref('users/' + Auth.AuthData.uid + '/bizIDs').push();
      var newLocKey = newLocRef.key();

      var updateObj = {};
      updateObj['users/' + Auth.AuthData.uid + '/bizIDs/' + newLocKey] = true;
      if (place.utc_offset == -360  || place.utc_offset == -300){
        updateObj['businesses/' + newLocKey] = {
          'businessName':locName, 
          'approved':false, 
          'lat': lat,
          'lon': lon,
          'placeId': place.place_id,
          'address': place.formatted_address,
          'phone': place.formatted_phone_number,
          'city': city,
          'state': state,
          'timezone': 'America/Chicago',
          'icon': "",
            'patio': false,
          'rooftop': false,
          'vegan': false
          
        };
      } else {
          updateObj['businesses/' + newLocKey] = {
          'businessName':locName, 
          'approved':false, 
          'lat': lat,
          'lon': lon,
          'placeId': place.place_id,
          'address': place.formatted_address,
          'phone': place.formatted_phone_number,
          'city': city,
          'state': state,
          'timezone': 'America/Chicago',
          'icon': "",
          'patio': false,
          'rooftop': false,
          'vegan': false
        };
      }
      updateObj['allBizIDs/' + newLocKey] = true;
      fbutil.ref().update(updateObj, function(error){
        //$scope.chooseLocation(newLocKey);
      fbutil.ref('adminAnalytics/places/',place.place_id).set(newLocKey);  
          
       if ($rootScope.blackList != true) {  
                mixpanel.track("Add Business", {"Email": Auth.AuthData.password.email, "Business": locName});
                            
                // parameters: service_id, template_id, template_parameters
                emailjs.send("sign_up","newSignupTemplate",{content: "email: "+Auth.AuthData.password.email+" business: "+locName, type: "New "+city+" Business Added", data: locName})
                .then(function(response) {
                   console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                }, function(err) {
                   console.log("FAILED. error=", err);
                });
            
                 // parameters: service_id, template_id, template_parameters
                emailjs.send("sign_up","business_welcome",{email: Auth.AuthData.password.email})
                .then(function(response) {
                   console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                }, function(err) {
                   console.log("FAILED. error=", err);
                });
        }
          
        $scope.$apply();
        $scope.addUserAccess(Auth.AuthData.password.email, newLocKey);
      });
      $rootScope.accountTab = 'change';
      $scope.noBiz = false;
      $rootScope.noBiz = false;
      $scope.openAddedPopup();
    };
    
    
    $scope.addAccess = function(bizID){
        $cordovaDialogs.prompt('Email must be signed up with MealSteals before access can be granted', 'Add Access', ['Add','Cancel'], '')
            .then(function(result) {
              var email = result.input1;
              // no button = 0, 'OK' = 1, 'Cancel' = 2
              var btnIndex = result.buttonIndex;
              if (btnIndex == 1){
                    $scope.addUserAccess(email, bizID)
              }
            });
    };
    
    $scope.addUserAccess = function(email, bizID){

      // look up uid from email
      $firebaseObject(fbutil.ref('emails', email.replace('.', ','))).$loaded().then(function(o){
        var uid = o.uid; 
          console.log(o);

        var comma_email = email.replace('.', ',');

        // add userid and email to business object
        fbutil.ref('businesses', bizID, 'userids', uid).update({uid:uid});
        fbutil.ref('businesses', bizID, 'emails', comma_email).update({comma_email:email});

        // add business id to user object
        fbutil.ref('users', uid, 'bizIDs', bizID).set(true);
        $scope.accessList();

      });

    };
    
    $scope.removeAccess = function(email, bizID){
        $cordovaDialogs.confirm('Remove email from access list?', 'Remove Access', ['Remove', 'Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                  $scope.removeUserAccess(email, bizID); 
              }
        }); 
    };
    
    
    $scope.removeUserAccess = function(email, bizID){
        console.log(email, bizID);
        
       if(!angular.isUndefined(email.comma_email)){
            email = email.comma_email;
        }
        var comma_email = email.replace('.', ',');
        
      // look up uid from email
      $firebaseObject(fbutil.ref('emails', comma_email)).$loaded().then(function(o){
        var uid = o.uid;

        

        // add userid and email to business object
        fbutil.ref('businesses', bizID, 'userids', uid).remove();
        fbutil.ref('businesses', bizID, 'emails', comma_email).remove();

        // add business id to user object
        fbutil.ref('users', uid, 'bizIDs', bizID).set(null);

      });

    }
    
    
        // .fromTemplateUrl() method
          $ionicPopover.fromTemplateUrl('auth/access.html', {
            scope: $scope
          }).then(function(popover) {
            $scope.popoverPopup = popover;
          });

          $scope.accessList = function($event) {
            $scope.popoverPopup.show($event);
          };



          $scope.closePopup = function() {
            $scope.popoverPopup.hide();
          };
          //Cleanup the popover when we're done with it!
          $scope.$on('$destroy', function() {
            $scope.popoverPopup.remove();
          });
          // Execute action on hidden popover
          $scope.$on('popover.hidden', function() {
            // Execute action
          });
          // Execute action on remove popover
          $scope.$on('popover.removed', function() {
            // Execute action
          });
    
         //live updated
    $scope.changeDealStatus = function(id, status){
        
        $cordovaDialogs.confirm('This will change the status of all your deals!', 'Warning!', ['Change','Cancel'])
            .then(function(buttonIndex) {
              var btnIndex = buttonIndex;
              if (btnIndex == 1){
                   $ionicLoading.show({
                          template: 'Updating profile...',
                          duration: 3000
                    });
                 console.log(id);
                    console.log(status);
                    $rootScope.bizInfo[id].dealsOn = status;
                    $rootScope.bizInfo[id].$save();
                    console.log($rootScope.bizInfo[id]);

                  $rootScope.myRecurringDeals.$loaded(function(deals){
                          console.log($rootScope.myRecurringDeals);
                      angular.forEach(deals, function(deal){

                          console.log(deal);

                          fbutil.ref('recurringDeals/', deal.$id, '/approved').set(status);
                        

                        });
                    });

                  angular.forEach($rootScope.todaysDeals, function(data){
                            var end = new Date(data.endTime);
                            var verifyEnd = moment(end.getTime()).format('YYYYMMDD');

                            var time = new Date();
                            var day = moment(time).format("YYYYMMDD");
                            fbutil.ref('todaysDeals/' , day , data.$id , '/approved').set(status);

                            if(verifyEnd != day){
                                fbutil.ref('todaysDeals/' , verifyEnd , data.$id , '/approved').set(status);
                            }
                                
                  });
                       


              } else {
                  if (status == true){
                  $scope.dealsOn = { checked: false};
                  } else {
                      $scope.dealsOn = { checked: true};
                  }
              }
            });  
        
    };    
        
    //live updated
    $scope.changeApproveStatus = function(id, status){
     $ionicLoading.show({
              template: 'Updating profile...',
              duration: 3000
        });
     console.log(id);
        console.log(status);
        $rootScope.bizInfo[id].approved = status;
        $rootScope.bizInfo[id].$save();
        console.log($rootScope.bizInfo[id]);

     
                  $rootScope.myRecurringDeals.$loaded(function(deals){
                          console.log($rootScope.myRecurringDeals);
                      angular.forEach(deals, function(deal){

                          console.log(deal);

                          fbutil.ref('recurringDeals/', deal.$id, '/approved').set(status);

                        });
                    });
                          

                    angular.forEach($rootScope.todaysDeals, function(data){
                        var end = new Date(data.endTime);
                        var verifyEnd = moment(end.getTime()).format('YYYYMMDD');

                        var time = new Date();
                        var day = moment(time).format("YYYYMMDD");
                        fbutil.ref('todaysDeals/' , day , data.$id , '/approved').set(status);

                        if(verifyEnd != day){
                            fbutil.ref('todaysDeals/' , verifyEnd , data.$id , '/approved').set(status);
                        }


                    });
      
  };
    
    

  // fn change username
  $scope.changeUsername = function() {
    showPopup('Change username', preparePopupData('meta', 'username'));
    myPopup.then(function(newUsername) {
      if(newUsername != undefined && newUsername != null) {
        Profile.changeUserName($scope.AuthData.uid, newUsername).then(
          function(returnObj){
            if(returnObj != "USERNAME_TAKEN") {
              loadProfileData();
            } else {
              $timeout(function(){
                $scope.changeUsername();  //reopen
              }, 1500)
            }
          }
        )
      }
    });
  };
  
  // fn helper
  function preparePopupData(globalProperty, subProperty){
    if($scope.ProfileData.hasOwnProperty(globalProperty)){
      if($scope.ProfileData[globalProperty].hasOwnProperty(subProperty)){
        return $scope.ProfileData[globalProperty][subProperty];
      } else { return "";};
    } else { return "";};
  };

  // fn update profile picture
  $scope.changeProfilePicture = function() {
    // Show the action sheet
    $ionicActionSheet.show({
        buttons: [
            { text: 'Take a new picture' },
            { text: 'Import from phone library' },
        ],
        titleText: 'Change your profile picture',
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
      Profile.changeProfilePicture(sourceTypeIndex, $scope.AuthData.uid).then(
        function(success){
          loadProfileData();
        }
      );
    };
  };
    
  /**
  * ---------------------------------------------------------------------------------------
  * Stripe/Commence payment
  * ---------------------------------------------------------------------------------------
  */    
  
    var testKey = "pk_test_K6dCrNGaeDoyZhjU0Uypxh0M";
    var liveKey = "pk_live_e7cqyQsxGbRGtQL9CpNhNV9g";
        
    var commenceKey = testKey;
    
    //console.log(commenceKey);
        
    $scope.commencePayment = function(){
      //console.log('payment'); 
        
        commenceHandler({dataset:{
          name: "MealSteals",
          key: commenceKey,
          description: '2 widgets',
          zipCode: true,
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
                        console.log($rootScope.bizInfo[id].currentPlan);
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
          zipCode: true,
          amount: 11900//$("#amount").val()
        }});    
    }; 
    
   /**
  * ---------------------------------------------------------------------------------------
  * MODAL: Admin
  * ---------------------------------------------------------------------------------------
  */
    
    
   $scope.adminAddBoosts = function() {
       $cordovaDialogs.prompt('Valued at $5 per boost', 'Add Boosts', ['Add','Cancel'], '')
            .then(function(result) {
              var boost = result.input1;
              // no button = 0, 'OK' = 1, 'Cancel' = 2
              var btnIndex = result.buttonIndex;
              if (btnIndex == 1){
                    var date = new Date();
                    var time = date.getTime();
                    if (!$rootScope.myUpgrades.boostCount){
                         var boostTotal = boost;
                     } else {
                         var boostTotal = parseInt($rootScope.myUpgrades.boostCount) + parseInt(boost);
                     }
                    console.log(boostTotal);
                    var bizID = $scope.currentLoc.id;
                  
                    $scope.historyObject = {createdAt: time, payment: 'Beta', boosts: boost};
                    console.log($scope.historyObject);
                    fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                    fbutil.ref('businesses', bizID, 'currentPlan').update({boostCount:boostTotal});   
              }
            });
   };
    
   $scope.adminAddAds = function() {
       $cordovaDialogs.prompt('Valued at $0.10 per ad', 'Add Ads', ['Add','Cancel'], '')
            .then(function(result) {
              var ad = result.input1;
              // no button = 0, 'OK' = 1, 'Cancel' = 2
              var btnIndex = result.buttonIndex;
              if (btnIndex == 1){
                    var date = new Date();
                    var time = date.getTime();
                    if (!$rootScope.myUpgrades.adCount){
                         var adTotal = ad;
                     } else {
                         var adTotal = parseInt($rootScope.myUpgrades.adCount) + parseInt(ad);
                     }
                    console.log(adTotal);
                    var bizID = $scope.currentLoc.id;
                  
                    $scope.historyObject = {createdAt: time, payment: 'Beta', ads: adTotal};
                    console.log($scope.historyObject);
                    fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                    fbutil.ref('businesses', bizID, 'currentPlan').update({adCount:adTotal});    
              }
            });
   };
    
    
    
    $scope.filter = {};
    
    $scope.adminFilter = function() {
        
        console.log($scope.filter.fake);
        
        $scope.filterBiz = [];
        
        angular.forEach($rootScope.bizInfo, function(biz){
            var added = false;
            
            if(!angular.isUndefined(biz.fakeBusiness)){
                if(!angular.isUndefined($scope.filter.fake) && $scope.filter.fake == true){
                    $scope.filterBiz.push(biz);
                    added = true
                }
                
            }else{
                


                if(!angular.isUndefined($scope.filter.businessName) && added == false){
                    var bizCheck = biz.businessName.includes($scope.filter.businessName);
                    if(bizCheck == true){
                        $scope.filterBiz.push(biz);
                        added = true;
                    }
                }


                if(!angular.isUndefined($scope.filter.city) && added == false){
                    if(!angular.isUndefined(biz.city)){
                        var bizCheck = biz.city.includes($scope.filter.city);
                    }
                    if(bizCheck == true){
                        $scope.filterBiz.push(biz);
                        added = true;
                    }
                }


                if(!angular.isUndefined($scope.filter.upgrade) && $scope.filter.upgrade == true && added == false){

                    if(!angular.isUndefined(biz.currentPlan)){
                        $scope.filterBiz.push(biz);
                        added = true;
                    }
                }


                if(!angular.isUndefined($scope.filter.controlled) && $scope.filter.controlled == true && added == false){

                    if(!angular.isUndefined(biz.currentPlan)){
                        $scope.filterBiz.push(biz);
                        added = true;
                    }
                }
            }
        });
        
        $rootScope.updateLoc($scope.filterBiz[0].$id);
    };
    
    
      
    
      $ionicModal.fromTemplateUrl('auth/search-business.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalSearchBiz = modal;    
      });
      $scope.openSearchBiz = function(){
            $scope.modalSearchBiz.show();
      };

      $scope.closeSearchBiz = function(){
            $scope.modalSearchBiz.hide();   
      };
    
      $scope.filterBusiness = function() {
          //return search results here
          delete $scope.filterBiz;
          $scope.adminFilter();
          $rootScope.isFiltered = true;
          $scope.modalSearchBiz.hide();
      };
    
      $scope.clearFilter = function() {
          //clear filter  
          $scope.modalSearchBiz.hide();
          delete $scope.filterBiz;
          $scope.filter = {};
          $rootScope.isFiltered = false; 
          $rootScope.updateLoc($rootScope.bizIDs[0].$id);
      };
    
     // ---------------------------------------------------------------------------
  //
  // MODAL: Custom popup
  //
  // --------------------------------------------------------------------------- 
    
    
    $scope.openAddedPopup = function() {
        var alertPopup = $ionicPopup.alert({
             title: 'Thank You!',
             //template: 'It might taste good',
             //scope: $scope,
             templateUrl: 'auth/popup-added.html',
             cssClass: 'custom-popup'
           });

           alertPopup.then(function(res) {
             $scope.popoverPopup.hide();
           });
    };
    
    $scope.closePopup = function() {
        alertPopup.close();
        $scope.popoverPopup.hide();
    };
    
    $scope.openRequestedPopup = function() {
        var alertPopup = $ionicPopup.alert({
             title: 'Thank You!',
             //template: 'It might taste good',
             scope: $scope,
             templateUrl: 'auth/popup-request.html',
             cssClass: 'custom-popup'
           });

           alertPopup.then(function(res) {
             //console.log('Thank you for not eating my delicious ice cream cone');
           });
    };
    
    $scope.closePopup = function() {
        alertPopup.close();
    };
    
    
    // .fromTemplateUrl() method
  /*$ionicPopover.fromTemplateUrl('auth/popup.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popoverPopup = popover;
  });
    
  $scope.openPopup = function() {
    $scope.popoverPopup.show();
  };
    
   

  $scope.closePopup = function() {
    $scope.popoverPopup.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popoverPopup.remove();
  });
  // Execute action on hidden popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });
     */  
     // ---------------------------------------------------------------------------
  //
  // MODAL: Settings Popover
  //
  // --------------------------------------------------------------------------- 
    
    // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('auth/settings.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popoverSettings = popover;
  });


  $scope.openSettings = function($event) {
    $scope.popoverSettings.show($event);
  };
  $scope.closeSettings = function() {
    $scope.popoverSettings.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popoverSettings.remove();
  });
  // Execute action on hidden popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });
    
    
  // ---------------------------------------------------------------------------
  //
  // MODAL: Instrustions
  //
  // ---------------------------------------------------------------------------


    
    $ionicModal.fromTemplateUrl('auth/instructions.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalInstructions = modal;    
      });
      $scope.openInstructions = function(){
            $scope.modalInstructions.show();
      };

      $scope.closeInstructions = function(){
          $scope.modalInstructions.hide();  
      };
        
    
  // ---------------------------------------------------------------------------
  //
  // MODAL: Terms
  //
  // ---------------------------------------------------------------------------
    // Set some initial variables
  	$scope.fuHeight=window.innerHeight;
	$scope.fuWidth=window.innerWidth;
	$scope.inputWidth = Math.round($scope.fuWidth / 1.6);
	$scope.inputMargin = Math.round((($scope.fuWidth-$scope.inputWidth) / 2) / 1);

    
    $ionicModal.fromTemplateUrl('auth/terms.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalTerms = modal;    
      });
      $scope.openTerms = function(){
            $scope.modalTerms.show();
      };
    
      // stupid work around since you can't guarentee each modal will stack properly
      $scope.openTermsFromSignup = function(){
            $scope.modalTerms.show();
            console.log('please work');
            $scope.openedTermsFromSignup = true;
      };

      $scope.closeTerms = function(){
          $scope.modalTerms.hide();  
            if ($scope.openedTermsFromSignup==true) {
                console.log('from signup');   
            }
      };
    
      
    
  /**
  * ---------------------------------------------------------------------------------------
  * MODAL: Contact forms
  * ---------------------------------------------------------------------------------------
  */
    
  
  $ionicModal.fromTemplateUrl('auth/request.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalRequest = modal;    
  });
  $scope.openRequestModal = function(){
        $scope.modalRequest.show();
        $scope.request.email =  $scope.AuthData.password.email;
  };

  $scope.closeRequestModal = function(){
        $scope.modalRequest.hide();   
  };
    
  $scope.request = {}; 
  $scope.request.type = 'request';
    
  $scope.sendRequest = function(type, business, address, city, zip, contactName, contactPhone, email) {
        
        if (contactName==undefined || contactPhone==undefined || address==undefined || business==undefined || city==undefined){
            //console.log('fill more shit out');
            window.plugins.toast.showWithOptions({
                message: "All fields must be completed",
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
        } else {
            $ionicLoading.show({
              template: 'sending...',
              duration: 2000
            });
            //$scope.openRequestedPopup();
            emailjs.send("flash_deal","app_contact",{message: 'Name: '+contactName+' Phone: '+contactPhone, subject: 'New business '+type, businessName: business, email: email, priority: city, id: address+' '+city+' '+zip})
            .then(function(response) {
               console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
               $scope.modalRequest.hide();
               $ionicLoading.show({
               template: 'Request Sent',
               duration: 1000
               });
               $scope.openRequestedPopup();
               $scope.request = {};
            }, function(err) {
               $scope.modalRequest.hide();
               $ionicLoading.show({
               template: 'Request failed: please email contact@mealsteals.com for further assistance',
               duration: 6000
               });
               console.log("FAILED. error=", err);
            });
        }
  };    
    
  
  $ionicModal.fromTemplateUrl('auth/mail.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalContact = modal;    
  });
  $scope.openContactModal = function(){
        $scope.modalContact.show();
        $scope.mail.email =  $scope.AuthData.password.email;
  };

  $scope.closeContactModal = function(){
        $scope.modalContact.hide();   
  };
    
  $scope.mail = {}; 
  $scope.mail.priority = 'Low';
    
  $scope.sendMail = function(email, subject, message, priority) {
        var id = $scope.currentLoc.id;
        var businessName = $rootScope.bizInfo[id].businessName;
        if (email==undefined || subject==undefined || message==undefined){
            //console.log('fill more shit out');
            window.plugins.toast.showWithOptions({
                message: "All fields must be completed",
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
        } else {
            $ionicLoading.show({
              template: 'sending...',
              duration: 2000
            });
            emailjs.send("flash_deal","app_contact",{message: message, subject: subject, businessName: businessName, email: email, priority: priority, id: id})
            .then(function(response) {
               console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
               $scope.modalContact.hide();
               $ionicLoading.show({
               template: 'sent',
               duration: 1000
               });
               $scope.mail = {};
            }, function(err) {
               $scope.modalContact.hide();
               $ionicLoading.show({
               template: 'failed',
               duration: 1000
               });
               console.log("FAILED. error=", err);
            });
        }
  };
    
  /**
  * ---------------------------------------------------------------------------------------
  * Update other settings
  * ---------------------------------------------------------------------------------------
  */
  
  $ionicModal.fromTemplateUrl('auth/change-account-other.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.otherModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeOther = function() {
    $scope.otherModal.hide();
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    $state.go('tab.account');
  };

  // Open the login modal
  $scope.other = function() {
    openOther();
  };
  function openOther() {
    if($scope.otherModal != undefined) {
      $scope.otherModal.show();
      loadOtherData();
    } else {
      $timeout(function(){
        openOther();
      }, 1500)
    }
  };

  $scope.OtherData = {};
  function loadOtherData() {
    $scope.status['loadingOtherData'] = true;
    if($scope.AuthData.hasOwnProperty('uid')){
      Profile.get($scope.AuthData.uid).then(
        function(ProfileData) {
          
          // bind to scope
          if(ProfileData != null) {
            $scope.ProfileData  = ProfileData;
            if(ProfileData.hasOwnProperty('other')) {
              $scope.OtherData    = ProfileData.other;
            }
          };
          
          $scope.status['loadingOtherData'] = false;
        }
      ),
      function(error){
        $scope.status['loadingOtherData'] = false;
      }
    };
  };
  
  $scope.saveOtherData = function() {
    if($scope.OtherData.city || $scope.OtherData.month || $scope.OtherData.bio) {
      Profile.setGlobal($scope.AuthData.uid, 'other', $scope.OtherData);
    }
  };

    

});

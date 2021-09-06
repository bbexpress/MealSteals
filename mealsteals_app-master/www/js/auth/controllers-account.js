angular.module('starter.controllers-account', [])

.controller('AccountCtrl', function(
  $rootScope, $scope, $state, $stateParams, $timeout, 
  $ionicModal, $ionicHistory, $ionicPopup, $ionicActionSheet,
  Auth, Profile, Codes, Utils, $cordovaNativeStorage, $ionicPlatform) {

    
    $scope.$on('emailPulled', function() {
        console.log('rootscope in account: '+$rootScope.emailInStorage);
        $scope.loginData.userEmail = $rootScope.emailInStorage;
        console.log('scope in account: '+$scope.loginData.userEmail);
    });
    
    $scope.$on('passwordPulled', function() {
        $scope.loginData.userPassword = $rootScope.passwordInStorage;
    });
    
  //tell the system which active state, since there are at least two different controllers running at any given time there currently isn't an accurate way to determine this.  This should be added in the three main views.  It will be attached to a button in AppCtrl as well.  
    $rootScope.activeState = 'account';
    console.log("Active State: "+$rootScope.activeState);    
  
    
  // Since the deals controller might already be loaded in the background, this function is triggered on state change to deals to re activate hidden deal functions such as timeshift button.    
  $scope.goToDeals = function(){
       $rootScope.activeState = 'deals';
    console.log("Active State: "+$rootScope.activeState);  
  };
  //after every modal trigger resize    
  $scope.$on('modal.shown', function() {
        $rootScope.doMapResize = true;
  });
    
    
  // ----
  // Init other
 
  // global variables
    
    console.log("in Account controller");
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: true,
    loadingProfile: true,
    changePasswordMode: "lost",
    updateMessage: "Update account", //default
    updateButtonClass: 'button-positive', //default
    toggleLoginManual: false,
  };
    
//  $scope.busObj = $rootScope.busFB;    
//    console.log($scope.busObj);


  /**
  * ---------------------------------------------------------------------------------------
  * AuthState monitoring
  * ---------------------------------------------------------------------------------------
  */

    
    
  $scope.$on('$ionicView.enter', function(e) {
    
    // -->
    checkAuth();

  });

  // monitor and redirect the user based on its authentication state
  function checkAuth() {
    $scope.AuthData = Auth.AuthData;
    if(!$scope.AuthData.hasOwnProperty('uid')){
      Auth.getAuthState().then(
        function(AuthData){
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

  $ionicModal.fromTemplateUrl('templates/auth/login.html', {
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
    $state.go('app.deals');
    $scope.goToDeals();
  };

  // Open the login modal
  $scope.login = function() {
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

  $scope.unAuth = function() {
    Auth.unAuth();
    
    $scope.AuthData = {};
    $scope.ProfileData = {};
    
    $scope.loginData = {};  
    $scope.signUpData = {};           $scope.closeSignUp();
    $scope.changeEmailData = {};      $scope.closeChangeEmail();
    $scope.changePasswordData = {};   $scope.closeChangePassword();
    $scope.setProfileData = {};       $scope.closeSetProfile();
    
    broadcastAuthChange();
    handleLoggedOut();
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
    
    
    


  /*$scope.loginData.userEmail = $rootScope.email;
  $scope.loginData.userPassword = $rootScope.password;
  console.log('email in account: '+$scope.loginData.userEmail);
  console.log('password in account: '+$scope.loginData.userPassword);*/
  
    
  $scope.doLogin = function() {
      
    $cordovaNativeStorage.setItem("email", $scope.loginData.userEmail).then(function (email) {
                console.log('set email: '+email);
        $cordovaNativeStorage.getItem("email").then(function (email) {
                    console.log('get email: '+email);
                }, function (error) {
                    console.log(error);
                });
            }, function (error) {
                console.log(error);
    });
    $cordovaNativeStorage.setItem("password", $scope.loginData.userPassword).then(function (password) {
                console.log('set password: '+password);
        $cordovaNativeStorage.getItem("password").then(function (password) {
                    console.log('get password: '+password);
                }, function (error) {
                    console.log(error);
                });
            }, function (error) {
                console.log(error);
    });
     
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
    
  $scope.noLogin = function() {
    
    var myPopup = $ionicPopup.show({
        title: "By not logging in, you won't have access to all features"
    });
    $timeout(function() {
        myPopup.close();
        $scope.modal.hide();
        $scope.modalSignUp.hide();
        $scope.modalChangePassword.hide();
        
        $rootScope.currentUser = undefined;
        $state.go('app.deals');
        $scope.goToDeals();
      }, 3000);
      mixpanel.track("Not logged in");
    //close popup and direct state after continuing without logging in
    
    
  };    
  
  // wrapper for email and social login
  function proceedLogin(AuthData) {

    // hide modals
    $scope.modal.hide();
    $scope.modalSignUp.hide();
    $scope.modalChangePassword.hide();
    


    broadcastAuthChange();
    Utils.showMessage("Signed in!", 500);

    // handle logged in
    $scope.AuthData = AuthData;
    //handleLoggedIn();
     initialLoggedIn();
    
  };

    
    // ---------------------------------------------------------------------------
  //
  // MODAL: Initial log in flow, purpose is to to direct states based on meta data
  //
  // ---------------------------------------------------------------------------

    function initialLoggedIn() {

            // @dependency
            loadInitialProfileData();

           // proceed to next state if specified (for instance when user comes from foreign state)
            if($stateParams.nextState != undefined && $stateParams.nextState != null && $stateParams.nextState != "") {
              $state.go($stateParams.nextState);
            }
    };
    
    $scope.ProfileData = {};
    function loadInitialProfileData() {
        $scope.status['loadingProfile'] = true;
        if($scope.AuthData.hasOwnProperty('uid')){
          Profile.get($scope.AuthData.uid).then(
            function(ProfileData) {

              // bind to scope
              if(ProfileData != null) {
                $scope.ProfileData = ProfileData;
              };

              // @dependency
              // Must have set username and displayname
              if(preparePopupData('meta', 'username')) {
                $scope.status['loadingProfile'] = false; // duplicate**
                $scope.status['loading'] = false;
                console.log('profile set');
                $rootScope.firstLogin = true;
                $state.go('app.deals');
                $scope.goToDeals();
              } else {
                $scope.status['loadingProfile'] = false; // duplicate**
                $state.go('app.account');  
                $scope.setProfile();
                //$state.go('app.account');
                console.log('profile not set');  
              }
            }
          ),
          function(error){
            $scope.status['loadingProfile'] = false;
            $scope.status['loading'] = false;
          }
        };
    };
    
  // ---------------------------------------------------------------------------
  //
  // MODAL: Sign Up
  //
  // ---------------------------------------------------------------------------

  // Form data for the signUp modal
  $scope.signUpData = {};

  // Create the signUp modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalSignUp = modal;
  });
  $scope.closeSignUp = function() {
    $scope.modalSignUp.hide();
    
    $scope.modal.show();
  };
  $scope.signUp = function() {
    
    $scope.modal.hide();
    
    $scope.modalSignUp.show();
  };
  $scope.doSignUp = function() {       console.log('Doing signUp', $scope.signUpData);
    if($scope.signUpData.userEmail && $scope.signUpData.userPassword) {
        Utils.showMessage("Creating user... ");
        Auth.signUpPassword($scope.signUpData.userEmail, $scope.signUpData.userPassword).then(
            function(AuthData){
                
                //localStorage.setItem('loginData.userEmail', $scope.signUpData.userEmail);
                //localStorage.setItem('loginData.userPassword', $scope.signUpData.userPassword);

                $scope.loginData = $scope.signUpData;
                $scope.doLogin();

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
  // MODAL: Change Password
  //
  // ---------------------------------------------------------------------------

  // Form data for the signUp modal
  $scope.changePasswordData = {};

  // Create the signUp modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth/change-password.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalChangePassword = modal;
  });
  $scope.closeChangePassword = function() {
    $scope.modalChangePassword.hide();
    
    if($scope.status.changePasswordMode == 'lost') {
      $scope.modal.show();
    }
  };
  $scope.changePassword = function(mode) {
    // when authenticated
    if($scope.AuthData.hasOwnProperty('password')){
      $scope.changePasswordData = {
          userEmail: $scope.AuthData.password.email
      }
    }
    $scope.status['changePasswordMode'] = mode;
    $scope.modal.hide();
    
    $scope.modalChangePassword.show();
  };

  //
  // step 1: reset password
  //
  $scope.resetPassword = function() {
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
  $scope.doChangePassword = function() {
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


  // ---------------------------------------------------------------------------
  //
  // MODAL: Change E-mail
  //
  // ---------------------------------------------------------------------------

  // Form data for the login modal
  $scope.changeEmailData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth/change-email.html', {
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
  // MODAL: Set username 
  //
  // ---------------------------------------------------------------------------

  // Form data for the login modal
  $scope.setProfileData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth/change-profile.html', {
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
      console.log('profile not set');
      $scope.modalSetProfile.show();
    } else {
      $timeout(function(){
        openSetProfile();
      }, 1500)
    }
  };
  
  $scope.finishSetProfile = function() {
    if($scope.ProfileData.hasOwnProperty('meta')){
      if($scope.ProfileData.meta.hasOwnProperty('username')) {
        $scope.modalSetProfile.hide();
        $state.go('app.deals');
        $scope.goToDeals();
        
      } else {
        Codes.handleError({code: "PROFILE_NOT_SET"})
      }
    } else {
      Codes.handleError({code: "PROFILE_NOT_SET"})
    }
  };
  
  
  // ---------------------------------------------------------------------------
  //
  // MODAL: Set profile data 
  //
  // ---------------------------------------------------------------------------
  
    $scope.userLocation = function(userAddress, userLat, userLon, userCity){
        console.log(userAddress, userLat, userLon, userCity);  
        $scope.busObj = $rootScope.busFB;
//        return function(d){
//            if (d.city==userCity) return true;
//        }
        console.log($scope.busObj);
    };

    
    /*
    $scope.featuredFilter = function(featured){
		return function(d){
			if (featured=='no') return true;
			if (d.featured=='yes') return true;
			return false;
		}
	};
    */
    
  
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
          
          // @dependency
          // Must have set username and displayname
          if(preparePopupData('meta', 'username')) {
            $scope.status['loadingProfile'] = false; // duplicate**
            $scope.status['loading'] = false;
            
          } else {
            $scope.status['loadingProfile'] = false; // duplicate** 
            $scope.setProfile();
              
          }
        }
      ),
      function(error){
        $scope.status['loadingProfile'] = false;
        $scope.status['loading'] = false;
      }
    };
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
  $rootScope.changeProfilePicture = function() {
      if ($rootScope.currentUser!=undefined){
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
        } else {
            $scope.promptImageLogin();
            
        }
  };
  
  
  
  /**
  * ---------------------------------------------------------------------------------------
  * Update other settings
  * ---------------------------------------------------------------------------------------
  */
  
  $ionicModal.fromTemplateUrl('templates/auth/change-account-other.html', {
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
    $state.go('app.account');
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

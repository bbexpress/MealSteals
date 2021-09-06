angular.module('starter.services-auth', ['firebase', 'firebase.utils', 'config'])

// angular.module('firebase.auth', ['firebase', 'firebase.utils'])
//   .factory('Auth', ['$firebaseAuth', 'fbutil', function($firebaseAuth, fbutil) {
//     return $firebaseAuth(fbutil.ref());
//   }]);

/**
 * General Wrapper for Auth
 * This version: 25/07/2015
 * See also: https://www.firebase.com/docs/web/libraries/ionic/guide.html
 */
.factory('Auth', ['FBURL', '$q', 'fbutil', '$firebaseAuth', '$rootScope', function(FBURL, $q, fbutil, $firebaseAuth, $rootScope, $state, $cordovaNativeStorage) {
  
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

  self.onFirebaseAuth = function(){
    return $firebaseAuth(fbutil.ref()).$onAuth;
  };

  /**
   * unAuthenticate the user
   * independent of method (password, twitter, etc.)
   */
  self.unAuth = function() {
    var ref = new Firebase(FBURL);
    self.AuthData = {};
    return ref.unauth();
  };

  /**
   * Monitor the current authentication state
   * returns on success:  AuthData
   * returns on fail:     AUTH_LOGGED_OUT
   */
  function onAuth() {
    var qAuthState = $q.defer();
    function AuthDataCallback(AuthData) {
        if (AuthData) {

            
            self.AuthData = AuthData;//gv
            qAuthState.resolve(AuthData);
            //console.log("logged in");
            //console.log(self.AuthData);
            
            var date = new Date();
            var timeNow = date.getTime();
            
            console.log('LOGGED IN!!!! at :', timeNow);
            
                    $rootScope.userFB = new Firebase("https://mealsteals.firebaseio.com/users_app/" + self.AuthData.uid);
            
//            AccountBase.initFunc(self.AuthData.uid);
           
            
        } else {
            qAuthState.reject("AUTH_LOGGED_OUT");
            
            
        }
    };
    var ref = new Firebase(FBURL);
    ref.onAuth(AuthDataCallback);
    return qAuthState.promise;
      $state.go('tab.account');
      
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
   * INVALID_USER (user does not excist)
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
  
  /**
   * ---------------------------------------------------------------------------
   * Social Authentication
   * Setup your providers as follows: https://www.firebase.com/docs/web/guide/user-auth.html#section-providers
   */
   self.signInSocial = function(provider) {
       console.log("signInSocial", provider)
      var qSignIn = $q.defer();
      var ref = new Firebase(FBURL);
      ref.authWithOAuthPopup(provider, function(error, AuthData) {
        if (error) {
            qSignIn.reject(error);
            console.log("Login Failed!", error);
        } else {
            self.AuthData = AuthData; //gv
             qSignIn.resolve(AuthData);
            console.log("Authenticated successfully with payload:", AuthData);
        }
      });
      return qSignIn.promise;
  };

  return self;
} ] ) ;

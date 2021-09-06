"use strict";
angular.module('myApp.login', ['firebase.utils', 'firebase.auth', 'ngRoute', 'vsGoogleAutocomplete'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {
      controller: 'LoginCtrl',
      templateUrl: 'login/login.html'
    });

  }])

  .controller('LoginCtrl', ['$scope', 'Auth', '$location', 'fbutil', '$http', function($scope, Auth, $location, fbutil, $http) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;

    $scope.login = function(email, pass) {
      $scope.err = null;
      Auth.$authWithPassword({ email: email, password: pass }, {rememberMe: true})
        .then(function(/* user */) {
          $location.path('/account');
          
           mixpanel.track("Log in", { "user": email });
           mixpanel.track(email);
          
        }, function(err) {
          $scope.err = "Invalid email or password";
          
        });
    };
      
    $scope.inputTypePw1 = 'password';
    $scope.inputTypePw2 = 'password';
    $scope.inputTypePw3 = 'password';
    $scope.hideShowPassword1 = function(){
        if ($scope.inputTypePw1 == 'password')
        $scope.inputTypePw1 = 'text';
        else
        $scope.inputTypePw1 = 'password';
    };
      
    $scope.hideShowPassword2 = function(){
        if ($scope.inputTypePw2 == 'password')
        $scope.inputTypePw2 = 'text';
        else
        $scope.inputTypePw2 = 'password';
    };
      
    $scope.hideShowPassword3 = function(){
        if ($scope.inputTypePw3 == 'password')
        $scope.inputTypePw3 = 'text';
        else
        $scope.inputTypePw3 = 'password';
    };

    $scope.createAccount = function() {
      $scope.err = null;
      if( assertValidAccountProps() ) {
        var email = $scope.email;
        var pass = $scope.pass;
        var firstName = $scope.firstName;
        var businessName = $scope.businessName;
        // create user credentials in Firebase auth system
        Auth.$createUser({email: email, password: pass})
          .then(function() {
            // authenticate so we have permission to write to Firebase
            return Auth.$authWithPassword({ email: email, password: pass });
          })
          .then(function(user) {
            // create a user profile in our data store
            var ref = fbutil.ref('users', user.uid);
            return fbutil.handler(function(cb) {
              ref.set({email: email, name: name||firstPartOfEmail(email)}, cb);
              fbutil.ref('emails', email.replace('.', ',')).set({uid:user.uid});
              fbutil.ref('lastUserCreatedAt').set(Firebase.ServerValue.TIMESTAMP);
              fbutil.ref('newUserLog', user.uid).set({'createdAt':Firebase.ServerValue.TIMESTAMP, 'email':email});

          
                
            });
          })
          .then(function(/* user */) {
            // redirect to the account page
            $location.path('/home');
            // parameters: service_id, template_id, template_parameters
            emailjs.send("sign_up","newSignupTemplate",{content: "email: "+email})
            .then(function(response) {
               console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
            }, function(err) {
               console.log("FAILED. error=", err);
            });
          }, function(err) {
            $scope.err = errMessage(err);
          });
      }
        
            

    };

    function assertValidAccountProps() {
      if( !$scope.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.pass || !$scope.confirm ) {
        $scope.err = 'Please enter a password';
      }
      else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code? err.code : err + '';
    }

    function firstPartOfEmail(email) {
      return ucfirst(email.substr(0, email.indexOf('@'))||'');
    }

    function ucfirst (str) {
      // inspired by: http://kevin.vanzonneveld.net
      str += '';
      var f = str.charAt(0).toUpperCase();
      return f + str.substr(1);
    }
  }]);
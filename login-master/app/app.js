'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'myApp.config',
    'myApp.security',
    'myApp.home',
    'myApp.account',
    'myApp.login',
    'myApp.admin',
    'myApp.transaction',
    'ngFileUpload',
    'ui.bootstrap',
    'services',
    //'angularPayments',
    //'stripe.checkout',
    //'stripe',
    'ngMaterial'
    //'angular-stripe'
  ])

  

  .run(['$rootScope', 'Auth', '$location', function($rootScope, Auth, $location) {
    // track status of authentication
    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;

      /* added by lee */
      if (user){
        $location.path('/home');
      } else {
        $location.path('/login');
      }
      /* end */

    });
  }]);



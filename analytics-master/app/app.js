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
    'myApp.upgrade-deal',
    'myApp.heatmap',
    'myApp.admap',
    'myApp.addDeal',
    'myApp.mail',
    'ngFileUpload',
    'ui.bootstrap',
    'services',
    'ngMaterial', 
    'ngMessages'
    //'angularPayments',
    //'stripe.checkout',
    //'stripe',
    //'angular-stripe'
  ])

  .config(['$mdIconProvider', function($mdIconProvider) {
        $mdIconProvider.icon('md-close', 'img/icons/ic_close_24px.svg', 24);
   }])

    .filter('escape', function() {
        console.log(window.encodeURIComponent);
    })

  .run(['$rootScope', 'Auth', '$location', function($rootScope, Auth, $location, $route) {
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



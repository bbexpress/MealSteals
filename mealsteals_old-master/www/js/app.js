/**
 * Firebase Auth Pack
 * 
 * @version: v1.1
 * @date: 2016-02-09
 * @author: Noodlio <noodlio@seipel-ibisevic.com>
 * @website: www.noodl.io
 * 
 * versions: {
 *  ionic:        1.2.4
 *  firebase:     2.4.0
 *  angularfire:  1.1.3
 * }
 * 
 * To edit the SASS, please install gulp first:
 * npm install -g gulp
 * 
 * Also make sure that you have installed the following ngCordova dependencies:
 *  cordova plugin add cordova-plugin-inappbrowser
 * 
 */
 
var FBURL                 = "mealsteals.firebaseIO.com";

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js


angular.module('starter', [
  'ionic', 
  'ngCordova',
  'firebase',
  
  // ionic pre-defined
  'starter.controllers',
  
  // auth and profile
  'starter.controllers-account',
  'starter.services-auth',
  'starter.services-profile',
  
  // cordova
  'starter.services-cordova-camera',
  
  // helpers
  'starter.services-codes',
  'starter.services-utils',
  'starter.services-fb-functions',
    
  // MealSteals    
  'starter.services',
  'ionic.contrib.drawer.vertical', 
  'gm', 
  'vsGoogleAutocomplete'
  
  ]
)

.run(function($ionicPlatform, $rootScope, $ionicHistory, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      //cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
  
  // Redirect the user to the login state if unAuthenticated
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    console.log("$stateChangeError", error);
    event.preventDefault(); // http://goo.gl/se4vxu
    if(error == "AUTH_LOGGED_OUT") {
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        //disableBack: true
      });
      $state.go('app.account');
    }
  });
  
  // not sure if this is needed    
  $rootScope.dataError = false;
    var ref = new Firebase('https://mealsteals.firebaseio.com/rand');
    ref.on('value', function(snapshot){
      if (snapshot.val() == 'abort'){
        $rootScope.dataError = true;
      } else {
        $rootScope.dataError = false;
      }
    });    
    
})



.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $cordovaAppRateProvider) {
  
  $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
  $ionicConfigProvider.tabs.style("standard"); //Makes them all look the same across all OS
  $ionicConfigProvider.navBar.alignTitle('center');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js    
    
  // Define the resolve function, which checks whether the user is Authenticated
  // It fires $stateChangeError if not the case
  var authResolve = function (Auth) {
    return Auth.getAuthState();
  };
  
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  
    .state('deal-detail', {
      url: '/deals/:dealId',
          templateUrl: 'templates/deal-detail.html',
          controller: 'DealDetailCtrl'
    })
    .state('ad-detail', {
      url: '/ad-detail',
          templateUrl: 'templates/ad-detail.html',
          controller: 'AdCtrl'
    })

    .state('app.deals', {
      url: '/deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals.html',
          controller: 'DealsCtrl',
         // resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })
  
  .state('app.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/auth/account.html',
        controller: 'AccountCtrl'
      }
    }
  });
  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/deals');
});





angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase', 'ngCordova','ionic.contrib.drawer.vertical', 'gm', 'vsGoogleAutocomplete'])

.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    //Push shit inits here LOL
    var push = new Ionic.Push({
      "debug": true
    });

    push.register(function(token) {
      console.log("Device token:",token.token);
      push.saveToken(token);  // persist the token in the Ionic Platform
    });

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    $rootScope.dataError = false;
    var ref = new Firebase('https://mealsteals.firebaseio.com/rand');
    ref.on('value', function(snapshot){
      if (snapshot.val() == 'abort'){
        $rootScope.dataError = true;
      } else {
        $rootScope.dataError = false;
      }
    });

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
  $stateProvider

  // Each tab has its own nav history stack:

  .state('deals', {
      url: '/deals',
          templateUrl: 'templates/tab-deals.html',
          controller: 'DealsCtrl'
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

  .state('account', {
    url: '/account',
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/deals');
    
    /* APP RATE

    //listening for device to load up to prompt rating
    document.addEventListener("deviceready", function () {

        var customLocale = {};
        customLocale.title = "Rate MealSteals";
        customLocale.message = "If you enjoy using %@, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!";
        customLocale.cancelButtonLabel = "No, Thanks";
        customLocale.laterButtonLabel = "Remind Me Later";
        customLocale.rateButtonLabel = "Rate It Now";

        AppRate.preferences.openStoreInApp = true;
        AppRate.preferences.storeAppURL.ios = '967099243';
        AppRate.preferences.storeAppURL.android = 'https://play.google.com/store/apps/details?id=com.mealstealsnew.mealstealsnew';
        AppRate.preferences.customLocale = customLocale;
        AppRate.preferences.displayAppName = 'MealSteals';
        AppRate.preferences.usesUntilPrompt = 1;
        AppRate.preferences.promptAgainForEachNewVersion = true;
        AppRate.promptForRating(false); 
        //If false is not present it will ignore usesUntilPrompt, promptAgainForEachNewVersion, and button logic, it will prompt every time.

        
        
       $cordovaAppRateProvider.setPreferences(prefs)

     }, true);
*/

});


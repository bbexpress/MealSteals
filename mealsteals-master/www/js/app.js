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

var handleOpenURL = function(url) {
    window.localStorage.setItem("deepLink", url);
};

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js


angular.module('starter', [
  'ionic',
  'ionic.cloud',
  'ngCordova',
  'ngCordovaOauth',
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
  'vsGoogleAutocomplete',
  'ngCordova.plugins.nativeStorage',
  'ionicLazyLoad',
  'ion-google-autocomplete'

  ]
)

.run(function($ionicPlatform, $rootScope, $ionicHistory, $state, $cordovaNativeStorage, Auth, $cordovaNetwork, $window, $timeout) {
  $ionicPlatform.ready(function() {
      
     // Android was having an issue with hiding the splash screen before it was ready
       // navigator.splashscreen.hide();

    // check to see if user is logged in, and direct state on initial load
    if ($rootScope.authUserData != undefined) {
        var userLocation = window.localStorage.getItem("userLocation");
        var seenWalkthrough = window.localStorage.getItem("seenWalkthrough");
        var lat = window.localStorage.getItem("lat");
        var lon = window.localStorage.getItem("lon");
        console.log('User Location: ', userLocation);
        console.log(seenWalkthrough);
        if(seenWalkthrough){
            if (userLocation == "GPS"){
                $state.go('app.deals');
                } else if (lat && lon && userLocation == "custom"){
                    $rootScope.gps = {};
                    $rootScope.gps.lat = Number(lat);
                    $rootScope.gps.lon = Number(lon);
                    console.log(lat, lon);
                    console.log($rootScope.gps.lat, $rootScope.gps.lon);
                    $state.go('app.deals');
                } else {
                    $state.go('app.location');
                }

              if ($rootScope.analyticsFlag!=true){
              mixpanel.track("logged user");
              }
        } else {
            $state.go('app.walkthrough');
        }
        
        $window.fbAsyncInit = function() {
            FB.init({ 
              appId: '1597614350474803',
              status: true, 
              cookie: true, 
              xfbml: true,
              version: 'v2.4'
            });
        };
        
    }

      

//      window.fbAsyncInit = function() {
//    FB.init({
//      appId      : '1597614350474803',
//      xfbml      : true,
//      version    : 'v2.9'
//    });
//    FB.AppEvents.logPageView();
//  };
//
//  (function(d, s, id){
//     var js, fjs = d.getElementsByTagName(s)[0];
//     if (d.getElementById(id)) {return;}
//     js = d.createElement(s); js.id = id;
//     js.src = "//connect.facebook.net/en_US/sdk.js";
//     fjs.parentNode.insertBefore(js, fjs);
//   }(document, 'script', 'facebook-jssdk'));


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
      
    // google analytics
    /*if(typeof analytics !== undefined) {
        analytics.startTrackerWithId("UA-58883458-2");
        console.log("Google Analytics Working");
    } else {
        console.log("Google Analytics Unavailable");
    }*/

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
    
    // might to keep this so it will only refresh if in the background for more than a certain time 
    
     //var dateStart = new Date();
     //var timeStart = dateStart.getTime(); 

     document.addEventListener("pause", function() {
            //console.log("The application is paused");
            //var dateStart = new Date();
            //var timeStart = 'test'; 
     }, false);

     document.addEventListener("resume", function() {
            // always recheck for new deals on app resume
            /*$rootScope.$emit('dealsNearMeChanged');
            var dateResume = new Date();
            var timeResume = dateResume.getTime();
            console.log('paused: ',timeStart);
            console.log('resumed: ',timeResume);
            if (timeResume - timeStart > 3600000){
                  console.log('add will reserve');
                  $rootScope.$emit('serveAd');
            };*/
            //$window.location.reload()
          var deepLinkUrl = window.localStorage.getItem("deepLink");
          localStorage.removeItem("deepLink");
          if (deepLinkUrl!=null){
              $rootScope.deepLinkUrl = deepLinkUrl.replace('mealsteals://','');
              $rootScope.$emit('deepLinkResume');
          }
         
     }, false); 
    
    
   //  document.addEventListener("deviceready", function () {

        $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            $rootScope.connection = true;
        });

        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
           $rootScope.connection = false;
        });

        window.addEventListener("online", function(e) {
            $rootScope.connection = true;
        }, false);    

        window.addEventListener("offline", function(e) {
            $rootScope.connection = false;
        }, false);  

   // }, false);
})


.directive('disableTap', function($timeout) {
  return {
    link: function() {
      $timeout(function() {
        // Find google places div
        _.findIndex(angular.element(document.querySelectorAll('.pac-container')), function(container) {
          // disable ionic data tab
          container.setAttribute('data-tap-disabled', 'true');
          // leave input field if google-address-entry is selected
          container.onclick = function() {
            document.getElementById('searchBar').blur();
          };
        });
      },500);
    }
  };
})

.directive('disableTapAdd', function($timeout) {
  return {
    link: function() {
      $timeout(function() {
        // Find google places div
        _.findIndex(angular.element(document.querySelectorAll('.pac-container')), function(container) {
          // disable ionic data tab
          container.setAttribute('data-tap-disabled', 'true');
          // leave input field if google-address-entry is selected
          container.onclick = function() {
            document.getElementById('searchBarAdd').blur();
          };
        });
      },500);
    }
  };
})

.directive('headerShrink', function($document) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      var resizeFactor, scrollFactor, blurFactor;
      var header = $document[0].body.querySelector('.about-header');
      $scope.$on('userDetailContent.scroll', function(event,scrollView) {
        if (scrollView.__scrollTop >= 0) {
          scrollFactor = scrollView.__scrollTop/3.5;
          header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, +' + scrollFactor + 'px, 0)';
        } else if (scrollView.__scrollTop > -670) {
          resizeFactor = -scrollView.__scrollTop/100 + 0.99;
            console.log(resizeFactor);
          // blurFactor = -scrollView.__scrollTop/50;
          header.style[ionic.CSS.TRANSFORM] = 'scale('+(1+(resizeFactor/5))+','+(1+(resizeFactor/5))+')';
          // header.style.webkitFilter = 'blur('+blurFactor+'px)';
        }
      });
    }
  }
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $cordovaAppRateProvider, $ionicCloudProvider) {

  $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
  $ionicConfigProvider.tabs.style("standard"); //Makes them all look the same across all OS
  $ionicConfigProvider.navBar.alignTitle('center');
    
  //disable swipe to go back, map was breaking with this sometimes    
  $ionicConfigProvider.views.swipeBackEnabled(false);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  // Define the resolve function, which checks whether the user is Authenticated
  // It fires $stateChangeError if not the case
  var authResolve = function (Auth) {
    return Auth.getAuthState();
  };

  $ionicCloudProvider.init({
    "core": {
      "app_id": "86777dcb"
    }
  });

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
          controller: 'DealDetailCtrl',
          cache: false
    })
  
    .state('biz-detail', {
      url: '/deals/biz/:bizId',
          templateUrl: 'templates/biz-detail.html',
          controller: 'BizDetailCtrl',
          cache: false
    })

    .state('ad-detail', {
      url: '/deals/ad/:adID',
          templateUrl: 'templates/ad-detail.html',
          controller: 'AdCtrl'
    })

    .state('app.deals', {
      url: '/deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals.html',
          controller: 'DealsCtrl',
          cache: false
          // cache needs to be off in order to keep map from resizing
          //resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })
  
  .state('app.add-deal', {
      url: '/add-deal',
      views: {
        'menuContent': {
          templateUrl: 'templates/add-deal.html',
          controller: 'AddDealCtrl',
          cache: false
          // cache needs to be off in order to keep map from resizing
          //resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })
  
  .state('app.location', {
      url: '/location',
      views: {
        'menuContent': {
          templateUrl: 'templates/location.html',
          controller: 'LocationCtrl'
          //cache: false
          //resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })
  
  .state('app.walkthrough', {
      url: '/walkthrough',
      views: {
        'menuContent': {
          templateUrl: 'templates/walkthrough.html',
          controller: 'WalkthroughCtrl'
          //cache: false
          //resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })

    .state('app.map', {
      url: '/map',
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapCtrl'
        }
      }
    })

  .state('app.favorites', {
      url: '/favorites',
      views: {
        'menuContent': {
          templateUrl: 'templates/explore.html',
          controller: 'FavoritesCtrl',
          //resolve: {authResolve: authResolve} // require the user to be logged in to see the view
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
  $urlRouterProvider.otherwise('/app/account');
    
  window.addEventListener('native.keyboardshow', function(){
  document.body.classList.add('keyboard-open');
  });


  document.addEventListener("deviceready", function () {

   var prefs = {
     language: 'en',
     appName: 'MealSteals',
     iosURL: '967099243',
     androidURL: 'market://details?id=com.mealstealsnew.mealstealsnew',
     //https://play.google.com/store/apps/details?id=com.mealstealsnew.mealstealsnew

   };

   $cordovaAppRateProvider.setPreferences(prefs)

 }, false);

});

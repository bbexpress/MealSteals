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

// var FBURL                 = "mealsteals.firebaseio.com";

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'ngCordova',
  'firebase',
  
  'config',
  'firebase.utils',
    
  //google autocomplete
  'vsGoogleAutocomplete',

  // ionic pre-defined
  'starter.controllers-dash',
  'starter.controllers-add',
  'starter.controllers-deals',
  'starter.controllers-upgrade',
  'starter.controllers-edit',
  'starter.services',

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

  // more stuff,
  'ngFileUpload',
  'ui.bootstrap',
  'jrCrop',
  'ng-clamp'
  
  ]
)

.run(function($ionicPlatform, $rootScope, $window, $ionicHistory, $state, Auth) {
  $ionicPlatform.ready(function() {
      navigator.splashscreen.hide();
      
      $window.fbAsyncInit = function() {
    // Executed when the SDK is loaded

    FB.init({

      /*
       The app id of the web app;
       To register a new app visit Facebook App Dashboard
       ( https://developers.facebook.com/apps/ )
      */

      appId: '1220530954691180',

      /*
       Adding a Channel File improves the performance
       of the javascript SDK, by addressing issues
       with cross-domain communication in certain browsers.
      */

      channelUrl: 'app/channel.html',

      /*
       Set if you want to check the authentication status
       at the start up of the app
      */

      status: true,

      /*
       Enable cookies to allow the server to access
       the session
      */

      cookie: true,

      /* Parse XFBML */

      xfbml: true
    });

    sAuth.watchAuthenticationStatusChange();

  };

  (function(d){
    // load the Facebook javascript SDK

    var js,
    id = 'facebook-jssdk',
    ref = d.getElementsByTagName('script')[0];

    if (d.getElementById(id)) {
      return;
    }

    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "//connect.facebook.net/en_US/sdk.js";

    ref.parentNode.insertBefore(js, ref);

  }(document));

      
      
      
      
      
      
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
      
     var dateStart = new Date();
     var timeStart = dateStart.getTime();
     var weekDateStart = parseInt(moment(timeStart).format('e')); 
      
     document.addEventListener("pause", function() {
            console.log("The application is paused");
     }, false);
      
     document.addEventListener("resume", function() {
            var dateResume = new Date();
            var timeResume = dateResume.getTime();
            var weekDateResume = parseInt(moment(timeResume).format('e'));
            //console.log('resume ',weekDate);
        
            console.log('paused: ',timeStart);
            console.log('resumed: ',timeResume);
            var resumeInterval = timeResume - timeStart;
            console.log(resumeInterval);
            
            // Restarts the app if its been in the background for more than 1 day, it needs to do a refresh to grab new daily deals. It also triggers a refresh if the app has been open in the background for more than 33 minutes.  Only refreshes on re-open. 
            if (weekDateStart != weekDateResume || resumeInterval > 2000000){
                  $ionicHistory.clearCache();
                  $ionicHistory.clearHistory();
                  $window.location.reload()
                  /*$ionicHistory.clearCache();
                  $ionicHistory.clearHistory();
                  $state.go('tab.dash', {}, {reload: true})*/  
            };
        
            $rootScope.$emit('authCheckResume');
            
     }, false);
        
  });
    

  // Redirect the user to the login state if unAuthenticated
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    
    console.log("$stateChangeError", error);
    event.preventDefault(); // http://goo.gl/se4vxu
    if(error == "AUTH_LOGGED_OUT") {
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
        
      // must clear cache, history and then reload the account controller to refresh the app at intial login stage to fix error of random logouts    
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('tab.account', {}, {reload: true})
      //$rootScope.login();
      
      
      
    }
  });
    
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    
  $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
  $ionicConfigProvider.tabs.style("standard"); //Makes them all look the same across all OS
  $ionicConfigProvider.navBar.alignTitle('center');

  //disable swipe to go back, map was breaking with this sometimes    
  $ionicConfigProvider.views.swipeBackEnabled(false);


  // Define the resolve function, which checks whether the user is Authenticated
  // It fires $stateChangeError if not the case
  var authResolve = function (Auth) {
    return Auth.getAuthState();
  };
    


  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'dashboard/tab-dash.html',
        controller: 'DashCtrl',
        resolve: {authResolve: authResolve} // require the user to be logged in to see the view
      }
    }
  })

  .state('tab.add-deal', {
      url: '/add-deal',
      views: {
        'tab-add-deal': {
          templateUrl: 'add/tab-add-deal.html',
          controller: 'AddDealCtrl',
          resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })

    .state('tab.deals', {
      url: '/deals',
      views: {
        'tab-deals': {
          templateUrl: 'deals/tab-deals.html',
          controller: 'DealsCtrl',
          resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })
  
    .state('edit', {
      url: '/edit',
      views: {
        'tab-deals': {
          templateUrl: 'edit/edit-deal.html',
          controller: 'EditDealCtrl',
          resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })
  
   .state('tab.upgrade', {
      url: '/upgrade',
      views: {
        'tab-upgrade': {
          templateUrl: 'upgrade/tab-upgrade.html',
          controller: 'UpgradeCtrl',
          resolve: {authResolve: authResolve} // require the user to be logged in to see the view
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'auth/tab-account.html',
        controller: 'AccountCtrl',
      }
    }
  });
    

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');
  

  // add css class to manipulate screen when keyboard is open    
  window.addEventListener('native.keyboardshow', function(){
        document.body.classList.add('keyboard-open');
  });

});




//use this if i want to change whether or not the 'done' appears on the keyboard
/*.directive('select', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      element.bind('focus', function(e) {
        if (window.cordova && window.cordova.plugins.Keyboard) {
          // console.log("show bar (hide = false)");
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        }
      });
      element.bind('blur', function(e) {
        if (window.cordova && window.cordova.plugins.Keyboard) {
          // console.log("hide bar (hide = true)");
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
      });
    }
  };
});*/

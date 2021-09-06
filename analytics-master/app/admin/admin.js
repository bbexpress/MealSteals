(function (angular) {
  "use strict";

  var app = angular.module('myApp.admin', ['firebase', 'firebase.utils', 'firebase.auth', 'ngRoute']);

  app.controller('AdminCtrl', ['$scope', 'Auth', 'fbutil', 'user', '$location', '$firebaseObject', '$firebaseArray',
    function($scope, Auth, fbutil, user, $location, $firebaseObject, $firebaseArray) {
      
      $scope.newUserLog = $firebaseArray(fbutil.ref('newUserLog'));
      
      
      
    }
  ]);

  app.config(['$routeProvider', function($routeProvider) {
    // require user to be authenticated before they can access this page
    // this is handled by the .whenAuthenticated method declared in
    // components/router/router.js
    $routeProvider.whenAuthenticated('/admin', {
      templateUrl: 'admin/admin.html',
      controller: 'AdminCtrl'
    })
  }]);

})(angular);
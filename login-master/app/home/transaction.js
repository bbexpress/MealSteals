(function(angular) {
  "use strict"; 
    var app = angular.module('myApp.transaction', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services']);

app.controller('TransactionCtrl', function ($scope, $rootScope, $uibModalInstance, $timeout, bizID, bizObj, $firebaseObject, $firebaseArray, fbutil) {

    console.log(bizID);
    console.log(bizObj);
    
    $scope.myTransactions = $firebaseArray(fbutil.ref('businesses/' + bizID + '/currentPlan/upgradeHistory'));
    console.log($scope.myTransactions);
    
    $scope.closeTransaction = function () {
        $uibModalInstance.dismiss();
    };


});
    
})(angular);
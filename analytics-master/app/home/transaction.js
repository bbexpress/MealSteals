(function(angular) {
  "use strict"; 
    var app = angular.module('myApp.transaction', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services']);

app.controller('TransactionCtrl', function ($scope, $rootScope, $uibModalInstance, $timeout, bizID, bizObj, $firebaseObject, $firebaseArray, fbutil, FBURL, $q) {

    console.log(bizID);
    console.log(bizObj);
    
    var testKey = "pk_test_K6dCrNGaeDoyZhjU0Uypxh0M";
    var liveKey = "pk_live_e7cqyQsxGbRGtQL9CpNhNV9g";
        
    var commenceKey = testKey;
    
    $scope.myTransactions = $firebaseArray(fbutil.ref('businesses/' + bizID + '/currentPlan/upgradeHistory'));
    $scope.myBizObj = $firebaseObject(fbutil.ref('businesses/' + bizID));
    console.log($scope.myTransactions);
    console.log($scope.myBizObj);
    
    $scope.closeTransaction = function () {
        $uibModalInstance.dismiss();
    };
    
    $scope.payCustom = function(bizID, purchaseAd){
        var amount = purchaseAd*10;
        
         if (purchaseAd > 99){
            if ($scope.myBizObj.currentPlan != undefined){
                var adTotal = parseInt(purchaseAd) + parseInt($scope.myBizObj.currentPlan.adCount);

                commenceHandler({dataset:{
                  name: "MealSteals",
                  key: commenceKey,
                  description: 'One-time payment',
                  zipCode: true,
                  amount: amount,//$("#amount").val()
                  callback: function(charge){
                        $scope.historyObject = {createdAt: charge.created*1000, payment: amount, ads: purchaseAd};
                      
                        $scope.myBizObj.currentPlan['adCount'] = adTotal;
                      
                        var time = new Date();
                        var stamp = time.getTime();
                      
                        if(!angular.isUndefined($scope.myBizObj.currentPlan.upgradeHistory)){
                            $scope.myBizObj.currentPlan.upgradeHistory[stamp] = $scope.historyObject;  
                        }else{
                            $scope.myBizObj.currentPlan['upgradeHistory'] = {};
                            $scope.myBizObj.currentPlan.upgradeHistory[stamp] = $scope.historyObject;  
                        }
                        
                      
//                      
//                        fbutil.ref('businesses/' + bizID + '/currentPlan/upgradeHistory').push($scope.historyObject);
//                        fbutil.ref('businesses/' + bizID + '/currentPlan').update({adCount:adTotal}); 
                      $scope.myBizObj.$save();
                        console.log($scope.myBizObj.currentPlan);
                        $uibModalInstance.dismiss();
                    }
                }});
            } else {
                console.log(purchaseAd);
                 commenceHandler({dataset:{
                  name: "MealSteals",
                  key: commenceKey,
                  description: 'One-time payment',
                  zipCode: true,
                  amount: amount,//$("#amount").val()
                  callback: function(charge){
                        $scope.historyObject = {createdAt: charge.created*1000, payment: amount, ads: purchaseAd};
                      
                      
                        $scope.myBizObj['currentPlan'] = {};
                        $scope.myBizObj.currentPlan['adCount'] = purchaseAd;
                      
                        var time = new Date();
                        var stamp = time.getTime();
                      
                        $scope.myBizObj.currentPlan['upgradeHistory'] = {};
                        $scope.myBizObj.currentPlan.upgradeHistory[stamp] = $scope.historyObject;  
                        
                      
                      
                      
                        $scope.myBizObj.$save();
//                        fbutil.ref('businesses/' + bizID + '/currentPlan/upgradeHistory').push($scope.historyObject);
//                        fbutil.ref('businesses/' + bizID + '/currentPlan').update({adCount:purchaseAd}); 
                        //console.log($scope.historyObject);
                        $uibModalInstance.dismiss();
                    }
                }});
            }
         } 
    }; 
    
    $scope.subscriptionPayment = function(type){
        if (type=='Starter'){
            var amount = 3900;
        }
        if (type=='Plus'){
            var amount = 6900;
        }
        if (type=='Premium'){
            var amount = 11900;
        }
        
        commenceHandler({dataset:{
          name: "MealSteals",
          key: commenceKey,
          description: type,
          plan: "premiumpackage",
          zipCode: true,
          amount: amount//$("#amount").val()
        }});    
    }; 


});
    
})(angular);
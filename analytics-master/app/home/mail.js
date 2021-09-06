(function(angular) {
  "use strict"; 
    var app = angular.module('myApp.mail', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services']);

app.controller('MailCtrl', function ($scope, $rootScope, $uibModalInstance, $timeout, place, user, type, $firebaseObject, $firebaseArray, fbutil, FBURL, $q) {

    console.log(place);
    console.log(user);
    console.log(type);
    $scope.type = type;
    $scope.mail = {};
    $scope.mail.email = user.email;
    
    if (place != null){
        $scope.mail.place = place.businessName;
        $scope.address = place.address;
    }

    
    $scope.mailStatus = false;
    
    $scope.cancelMail = function () {
        $uibModalInstance.dismiss();
    };
    
    $scope.retry = function(){
       $scope.mailStatus = false;  
    };
    
    $scope.sendClaim = function(email, message, contactName, contactPhone) {
        if (contactName!=undefined && email!=undefined && contactPhone!=undefined){
            $scope.mailStatus = 'sending';
            emailjs.send("flash_deal","app_contact",{message: 'Name: '+contactName+' Phone: '+contactPhone, subject: 'New business '+type, businessName: $scope.mail.place, email: email, id: $scope.address})
                    .then(function(response) {
                       console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                       $scope.mail = {};
                       $scope.mailStatus = 'success'; 
                       $scope.$apply();
                    }, function(err) {
                       $scope.mailStatus = 'fail'; 
                       $scope.$apply();
                       console.log("FAILED. error=", err);
                    });
            
        } else {
            alert('please fill in all fields');
        }
    };
    
    $scope.sendRequest = function(email, message, contactName, contactPhone, place, address) {
        if (contactName!=undefined && email!=undefined && contactPhone!=undefined && address!=undefined && place!=undefined){
            $scope.mailStatus = 'sending';
            emailjs.send("flash_deal","app_contact",{message: 'Name: '+contactName+' Phone: '+contactPhone, subject: 'New business '+$scope.type, businessName: place, email: email, id: address})
                    .then(function(response) {
                       console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                       $scope.mail = {};
                       $scope.mailStatus = 'success'; 
                       $scope.$apply();
                    }, function(err) {
                       $scope.mailStatus = 'fail'; 
                       $scope.$apply();
                       console.log("FAILED. error=", err);
                    });
        } else {
            alert('please fill in all fields');
        }
    };
    
});
    
})(angular);
(function(angular) {
  "use strict"; 

  var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services', 'vsGoogleAutocomplete'
                                         // , 'gm','initialValue', 'auto-value'
                                         ]);

  app.controller('EditDealCtrl', function ($scope, $uibModalInstance, $q, Upload, $timeout, dealID, type, $firebaseObject, $firebaseArray, fbutil, convertToUnixOffset) {

    console.log(dealID, type);

    function imageToDataUri(URI, originalWidth, originalHeight, newWidth, newHeight) {

      return $q(function(resolve, reject){
        var img = new Image();
        img.onload = function(){
          // create an off-screen canvas
          // var canvas = document.createElement('canvas');
          // var ctx = canvas.getContext('2d');

          // set its dimension to target size
          // canvas.width = newWidth;
          // canvas.height = newHeight;
          var widthSteps = [];
          var heightSteps = [];
          var numSteps = 10;

          var delta = originalWidth - newWidth;
          var step = Math.round(delta / numSteps);
          for (var i=1; i<=numSteps; i++){
            if (step > 1){
              widthSteps.push(originalWidth-i*step);
            } else {
              widthSteps.push(newWidth);
            }
          }

          var delta = originalHeight - newHeight;
          var step = Math.round(delta / numSteps);
          for (var i=1; i<=numSteps; i++){
            if (step > 1){
              heightSteps.push(originalHeight-i*step);
            } else {
              heightSteps.push(newHeight);
            }
          }

          // draw source image into the off-screen canvas:
          for (var i=1; i<=numSteps; i++){
            var canvas = document.createElement('canvas');
            canvas.width = widthSteps[i-1];
            canvas.height = heightSteps[i-1];
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, widthSteps[i-1], heightSteps[i-1]);
            console.log(widthSteps[i-1], heightSteps[i-1]);
            img = canvas;  
          }

          resolve(canvas.toDataURL());
        }
        img.src = URI;
      });

  }
      
      
      $scope.currentDate = Date.now();

  function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {type:mimeString});
  }

    $scope.policy = 'eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJtZWFsc3RlYWxzeWVzIn0seyJhY2wiOiAicHVibGljLXJlYWQifSxbInN0YXJ0cy13aXRoIiwiJENvbnRlbnQtVHlwZSIsIiJdLFsic3RhcnRzLXdpdGgiLCIka2V5IiwiIl1dfQ==';
    $scope.signature = 'OIiCj+2av3cmeabevQ4t9QtceMs=';
    $scope.timeID = String(new Date().getTime());

    $scope.uploadFiles = function(file, saveTo, saveToKey, maxWidth, maxHeight) {
        $scope.f = file;
        if (file && !file.$error) {
            $scope.loadingImage = true;

            var newWidth = file.width;
            var newHeight = file.height;

            if (maxWidth){
              if (maxHeight){
                // if both are set, we force resize
                if (file.width > maxWidth || file.height > maxHeight){
                  newWidth = maxWidth;
                  newHeight = maxHeight;
                }
              } else {
                if (file.width > maxWidth){
                  newWidth = maxWidth;
                  newHeight = Math.round(file.height * (newWidth / file.width));
                }
              }
            }    

            var reader  = new FileReader();
            reader.onloadend = function () {
              imageToDataUri(reader.result, file.width, file.height, newWidth, newHeight).then(function(hmm){

                var newBlob = dataURItoBlob(hmm);

                  console.log(file.name);
                  
                  var fileName = file.name.replace(' ', '_');
                  
                  console.log(file.name);
                  
                file.upload = Upload.upload({
                  url: 'http://s3.amazonaws.com/mealstealsyes', //S3 upload url including bucket name
                  method: 'POST',
                  fields : {
                    key: $scope.timeID + saveToKey + fileName, // the key to store the file on S3, could be file name or customized
                    AWSAccessKeyId: 'AKIAJ46C4XJRMO6JBATA',
                    acl: 'public-read', // sets the access to the uploaded file in the bucket: private or public
                    policy: $scope.policy, // base64-encoded json policy (see article below)
                    signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
                    "Content-Type": file.type != '' ? file.type : 'application/octet-stream' // content type of the file (NotEmpty)
                  },
                  file: newBlob,
                });

                file.upload.then(function (response) {
                  //success
                  $scope.loadingImage = false;
                    $timeout(function () {
                        file.result = response.data;
                        saveTo[saveToKey] = 'http://s3.amazonaws.com/mealstealsyes/' + $scope.timeID + saveToKey + fileName;
                        console.log($scope.dealObj.dealFullImage);
                    });
                }, function (response) {
                  //error
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                });

                file.upload.progress(function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 * 
                                                           evt.loaded / evt.total));
                });

              });
            }
            reader.readAsDataURL(file);

              
        }   
    }

    if (type=='recurring'){
      $scope.dealObj = $firebaseObject(fbutil.ref('recurringDeals/' + dealID));
      $scope.dealObj.$loaded().then(function(){
          $scope.recurringCheck = true;
          console.log($scope.dealObj);
           $scope.dealObj.date = new Date($scope.dealObj.startTime);   
        var startClockTime = moment($scope.dealObj.startTime).tz($scope.dealObj.timezone).format('HH:mm');
        var endClockTime = moment($scope.dealObj.endTime).tz($scope.dealObj.timezone).format('HH:mm');
        var startTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + startClockTime);
        var endTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + endClockTime);
        $scope.dealObj.startTime = new Date(startTimeOffset);
        $scope.dealObj.endTime = new Date(endTimeOffset);
      });
    } else{
      $scope.dealObj = $firebaseObject(fbutil.ref('deals/' + dealID));
      $scope.dealObj.$loaded().then(function(){
          console.log($scope.dealObj);
        $scope.dealObj.date = new Date($scope.dealObj.startTime);   
        var startClockTime = moment($scope.dealObj.startTime).tz($scope.dealObj.timezone).format('HH:mm');
        var endClockTime = moment($scope.dealObj.endTime).tz($scope.dealObj.timezone).format('HH:mm');
        var startTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + startClockTime);
        var endTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + endClockTime);
        $scope.dealObj.startTime = new Date(startTimeOffset);
        $scope.dealObj.endTime = new Date(endTimeOffset);
      });
    }

    $scope.save = function () {
      var startClockTime = moment($scope.dealObj.startTime.getTime()).format('HH:mm');
      var endClockTime = moment($scope.dealObj.endTime.getTime()).format('HH:mm');

        
      console.log(startClockTime);
      console.log(endClockTime);
        
      
      $scope.dealDate = moment($scope.dealObj.date.getTime()).format('YYYY-MM-DD'); 
        
      var timeRange = convertToUnixOffset(startClockTime, endClockTime, $scope.dealObj.timezone, $scope.dealDate);

      $scope.dealObj.startTime = timeRange[0];
      $scope.dealObj.endTime = timeRange[1];


      console.log($scope.dealObj);
        
       
     
      $scope.dealObj.$save();
        
        var date = new Date();
      var time = date.getTime();
        
      var todayDate = moment(time).format('YY:MM:DD');
        
        var startdate = new Date($scope.dealObj.startTime);
        
        
            if(!angular.isUndefined($scope.recurringCheck)){
        
          $scope.updateRunning = $firebaseArray(fbutil.ref('deals').orderByChild('recurringDealID').equalTo(dealID));

            $scope.updateRunning.$loaded(function(data){
                console.log($scope.updateRunning);
                angular.forEach($scope.updateRunning, function(deal){

                    var start = new Date(deal.startTime);
                    var verifyStart = moment(startdate.getTime()).format('YY:MM:DD');

                    if(verifyStart == todayDate){

                      fbutil.ref('deals/',deal.$id).remove();
                      var geoFire = new GeoFire(fbutil.ref('/dealGeoFireKeys/',deal.$id));
                      geoFire.remove();
                    }

                });
            });
        }else{

            fbutil.ref('deals/',$scope.dealID).set($scope.dealObj);

        }
        
        
        
        
        
        

      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.hstep = 1;
    $scope.mstep = 15;

    $scope.ismeridian = true;

  });

  app.controller('HomeCtrl', ['$scope', '$rootScope', '$q', 'fbutil', 'user', '$firebaseObject', '$firebaseArray', 'FBURL', 'Upload', '$timeout', 'AccountBase', '$uibModal', 
    function ($scope, $rootScope, $q, fbutil, user, $firebaseObject, $firebaseArray, FBURL, Upload, $timeout, AccountBase, $uibModal, $uibModalInstance, $mdDialog) {
    
    AccountBase.init(user);
        
        
     $scope.places = $firebaseObject(fbutil.ref('adminAnalytics/places'));
    
    //$scope.flashDeals = $firebaseArray(fbutil.ref('deals').orderByChild('recurringDealID').equalTo(undefined));

    $scope.timezones = moment.tz.names();

    $rootScope.bizIDs.$loaded().then(function(bizIDs){
      if (bizIDs.length > 0) $scope.chooseLocation(bizIDs[0].$id);
    });

    $scope.displayOptions = {
      'section': 'locView',
      'currentLoc': null,
      'mainTab': 'dashboard',
      'viewDealsType': 'recurring',
      'viewDealsAdmin': 'featured',
      'selectCity': 'all',
      'analyticsTab': 'users',
      'advancedOptions': 'hide'
    };

    $scope.user = user;
        
    $scope.eventObj = {
          'eventAddress': "",
          'eventLat': "", 
          'eventLon': "",
          'eventCity': "",
          'eventState': "",
          'eventLargeImage': "",
          'eventIcon': "",
          'eventDesc': "",
          'eventId': "",
          'eventStartTime': new Date(),
          'eventEndTime': new Date(),
          'eventName': "",
          'eventPhone': "",
          'eventFlag': "false"

    };
        
   
        
    $scope.addNewEvent = function(){
        
       var eventRef = new Firebase('https://mealsteals.firebaseio.com/' + 'events/').push();
        
        $scope.eventObj['eventId'] = eventRef.key();
        
        $scope.eventObj.eventFlag = "true";

        
        
        console.log($scope.eventObj);
        
        eventRef.set($scope.eventObj);
        
        
        

    }
    
    
    $scope.getTimezone = function(address){
          var startClockTime = moment($scope.dealObj.startTime).tz($scope.dealObj.timezone).format('HH:mm');
    }
    
    
    
    
    $scope.addNewLoc = function(locName){
      var newLocRef = fbutil.ref('users/' + user.uid + '/bizIDs').push();
      var newLocKey = newLocRef.key();

      var updateObj = {};
      updateObj['users/' + user.uid + '/bizIDs/' + newLocKey] = true;
      updateObj['businesses/' + newLocKey] = {'businessName':locName, 'approved':'no', 'allDealsToggle':'yes'};
      updateObj['allBizIDs/' + newLocKey] = true;
      fbutil.ref().update(updateObj, function(error){
        $scope.chooseLocation(newLocKey);
        $scope.$apply();
        $scope.addUserAccess($rootScope.userOptions.email, newLocKey);
      });

    };

    $scope.chooseLocation = function(bizID){
        
          $scope.displayOptions.section = 'locView';
          $scope.displayOptions.currentLoc = bizID;
        console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc]);
          // $scope.displayOptions.mainTab = 'profile';
          $scope.loadMyDeals();
          $scope.startNewDeal();
    };
        
    $scope.convertLoc = function(lat,lon,streetnumber,street,state,city,zip){
        console.log(lat + " " + lon);
        console.log(streetnumber+street+city+state+zip);
        
    };
    
    $scope.sendUniqueBizMessage = function(){
        $rootScope.bizInfo[$scope.displayOptions.currentLoc].$save()
    };   
        
    $scope.saveProfile = function(place){
        console.log(place);
          $rootScope.bizInfo[$scope.displayOptions.currentLoc]['businessName'] = place.name; 
          $rootScope.bizInfo[$scope.displayOptions.currentLoc]['address'] = place.formatted_address;
        
        if(!angular.isUndefined(place.formatted_phone_number)){
            $rootScope.bizInfo[$scope.displayOptions.currentLoc]['phone'] = place.formatted_phone_number;
        }
        
        if(!angular.isUndefined(place.website)){
            $rootScope.bizInfo[$scope.displayOptions.currentLoc]['website'] = place.website;
        }
          delete $rootScope.bizInfo[$scope.displayOptions.currentLoc].place;
        console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc]);
      $rootScope.bizInfo[$scope.displayOptions.currentLoc].$save().then(function(){
        // alert('Saved!');

          console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc]);
          
          fbutil.ref('adminAnalytics/places/',$rootScope.bizInfo[$scope.displayOptions.currentLoc].placeId).set($rootScope.bizInfo[$scope.displayOptions.currentLoc].$id);
          
        // now update any recurring deals with new information

        $scope.myRecurringDeals.forEach(function(mrd){
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].address)){
              $scope.myRecurringObj[mrd.$id].address = $rootScope.bizInfo[$scope.displayOptions.currentLoc].address;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].about)){
              $scope.myRecurringObj[mrd.$id].about = $rootScope.bizInfo[$scope.displayOptions.currentLoc].about;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].city)){
              $scope.myRecurringObj[mrd.$id].city = $rootScope.bizInfo[$scope.displayOptions.currentLoc].city;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].state)){
              $scope.myRecurringObj[mrd.$id].state = $rootScope.bizInfo[$scope.displayOptions.currentLoc].state;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat)){
              $scope.myRecurringObj[mrd.$id].lat = parseFloat($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat);
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon)){
              $scope.myRecurringObj[mrd.$id].lon = parseFloat($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon);
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName)){
              $scope.myRecurringObj[mrd.$id].locName = $rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].phone)){
              $scope.myRecurringObj[mrd.$id].phone = $rootScope.bizInfo[$scope.displayOptions.currentLoc].phone;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone)){
              $scope.myRecurringObj[mrd.$id].timezone = $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].icon)){
              $scope.myRecurringObj[mrd.$id].icon = $rootScope.bizInfo[$scope.displayOptions.currentLoc].icon;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground)){
              $scope.myRecurringObj[mrd.$id].largeImg = $rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground;
              $scope.myRecurringObj[mrd.$id].detailBackgroundFull = $rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground;
              $scope.myRecurringObj[mrd.$id].largeImg = $rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].website)){
              $scope.myRecurringObj[mrd.$id].website = $rootScope.bizInfo[$scope.displayOptions.currentLoc].website;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].facebook)){
              $scope.myRecurringObj[mrd.$id].facebook = $rootScope.bizInfo[$scope.displayOptions.currentLoc].facebook;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].twitter)){
              $scope.myRecurringObj[mrd.$id].twitter = $rootScope.bizInfo[$scope.displayOptions.currentLoc].twitter;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].instagram)){
              $scope.myRecurringObj[mrd.$id].instagram = $rootScope.bizInfo[$scope.displayOptions.currentLoc].instagram;
            }
              //mrd.fakeBusiness = $rootScope.bizInfo[$scope.displayOptions.currentLoc].fakeBusiness;
           
                    var date = new Date();
                    var time = date.getTime();
                    var todayDate = moment(time).format('YYYYMMDD');
            
              $scope.updateRunning = $firebaseArray(fbutil.ref('todaysDeals/' , todayDate).orderByChild('recurringDealID').equalTo(mrd.$id));
              $scope.updateRunning.$loaded(function(data){
                angular.forEach(data, function(thisDeal){
                    console.log(thisDeal);
                    var start = new Date(thisDeal.startTime);
                    var verifyStart = moment(start.getTime()).format('YYYYMMDD');
                    
                       
                    var date = new Date();
                    var time = date.getTime();

                    var todayDate = moment(time).format('YYYYMMDD');

//                    console.log(verifyStart);
//                    console.log(todayDate);
                    
                    if(verifyStart >= todayDate){
                        console.log('updating todays deals');
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].twitter)){
                            fbutil.ref('deals/',thisDeal.$id, '/twitter').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].twitter);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].about)){
                            fbutil.ref('deals/',thisDeal.$id, '/about').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].about);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].address)){
                            fbutil.ref('deals/',thisDeal.$id, '/address').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].address);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].city)){
                            fbutil.ref('deals/',thisDeal.$id, '/city').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].city);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackgroundFull)){
                            fbutil.ref('deals/',thisDeal.$id, '/detailBackgroundFull').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].facebook)){
                            fbutil.ref('deals/',thisDeal.$id, '/facebook').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].facebook);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].icon)){
                            fbutil.ref('deals/',thisDeal.$id, '/icon').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].icon);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName)){
                            fbutil.ref('deals/',thisDeal.$id, '/locName').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].phone)){
                            fbutil.ref('deals/',thisDeal.$id, '/phone').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].phone);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].state)){
                            fbutil.ref('deals/',thisDeal.$id, '/state').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].state);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].website)){
                            fbutil.ref('deals/',thisDeal.$id, '/website').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].website);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat)){
                            fbutil.ref('deals/',thisDeal.$id, '/lat').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon)){
                            fbutil.ref('deals/',thisDeal.$id, '/lon').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon);
                        }
                      
                      
//                      var geoFire = new GeoFire(fbutil.ref('/dealGeoFireKeys/',thisDeal.$id));
//                      geoFire.remove();
                        
                        //                           todayDeals obj
                        var time = new Date(thisDeal.startTime);
                        var day = moment(time).format("YYYYMMDD");
                        
                        
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].twitter)){
                            fbutil.ref('todaysDeals/' , day , thisDeal.$id , '/twitter').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].twitter);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].about)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/about').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].about);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].address)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/address').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].address);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].city)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/city').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].city);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackgroundFull)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/detailBackground').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackgroundFull);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/locName').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].icon)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/icon').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].icon);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].facebook)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/facebook').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].facebook);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].phone)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/phone').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].phone);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].state)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/state').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].state);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].website)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/website').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].website);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/lat').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/lon').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon);
                        }
                        
                        
                        
                        var end = new Date(thisDeal.endTime);
                        var verifyEnd = moment(end.getTime()).format('YYYYMMDD');
                        if(verifyEnd != day){

                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].twitter)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/twitter').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].twitter);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].about)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/about').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].about);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].address)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/address').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].address);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].city)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/city').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].city);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackgroundFull)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/detailBackground').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackgroundFull);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].facebook)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/facebook').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].facebook);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].icon)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/icon').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].icon);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/locName').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].phone)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/phone').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].phone);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].state)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/state').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].state);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].website)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/website').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].website);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/lat').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/lon').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon);
                            }
                            
                        }
                        
                    }

                });
                  
                    
            });
            $scope.myRecurringObj.$save();
            console.log('updating recurring');
            console.log($scope.myRecurringDeals);
        });
        
      });
        
        
        $scope.saveAlert();
        console.log("DONE!!!");
    };

    $scope.dealTest = function(img){
        console.log(img);
    };    
    
    // round time to nearest hour for easier deal adding
    var roundedTime = new Date();
    roundMinutes(roundedTime);

    function roundMinutes(roundedTime) {

        roundedTime.setHours(roundedTime.getHours() + Math.round(roundedTime.getMinutes()/60));
        roundedTime.setMinutes(0);
        return roundedTime;
    }
        
    $scope.newDeal = {};
    $scope.startNewDeal = function(){
      $scope.newDeal = {
        name: '',
        description: '',
        locName: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName),
        icon: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].icon),
        img: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
        dealFullImage: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png', //NEW CODE
        largeImg: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground),
        detailBackgroundFull: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
        address: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].address),
        city: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].city),
        state: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].state),
        phone: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].phone),
        lat: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat),
        lon: String($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon),
        featured: 'no',
        daysOfWeek: {
          'monday': 'no',
          'tuesday': 'no',
          'wednesday': 'no',
          'thursday': 'no',
          'friday': 'no',
          'saturday': 'no',
          'sunday': 'no'
        },
        type: 'recurring',
        startTime: roundedTime,
        endTime: roundedTime,
        foodOrDrink: 'food',
        exclusive: 'no',
        timeType: 'happyhour',
        redeemable: 'no',
        businessID: $scope.displayOptions.currentLoc
      };
    };

    function convertToUnixOffset(startClockTime, endClockTime, timezone, date){
      // We assume that this function is running on the same day as when the deal is supposed to start

      // startClockTime and endClockTime should be in format: "HH:mm" (this is 24-hour format)

        
        if(date == 0 || date == undefined){
          var nowMoment = moment().tz(timezone);

          var startTimeString = nowMoment.format('YYYY-MM-DD') + ' ' + startClockTime;
          var endTimeString = nowMoment.format('YYYY-MM-DD') + ' ' + endClockTime;

            
            console.log("start time string " + startTimeString);
            console.log("end time string " + endTimeString);
            
            
          var startMoment = moment.tz(startTimeString, timezone);
          var endMoment = moment.tz(endTimeString, timezone);
            
             console.log("start moment " + startMoment);
            console.log("end moment " + endMoment);
            

          if (startMoment.valueOf() > endMoment.valueOf()){
            // this covers instances like deals that go from 10pm - 2am
            endMoment.add(1, 'days');
          }

          if (parseInt(startMoment.format('HH')) >= 0 && parseInt(startMoment.format('HH')) <= 3){
            // this covers instances for deals with a starting time of 12:00am - 2:59am
            if (parseInt(nowMoment.format('HH')) >= 0 && parseInt(nowMoment.format('HH')) <= 3){
              // no action required
            } else {
              // in this case, both start time and end time should be advanced by 1 day
              startMoment.add(1, 'days');
              endMoment.add(1, 'days');
            }
          }

          return [startMoment.valueOf(), endMoment.valueOf()];
       }else{
            
            var nowMoment = moment().tz(timezone);

          var startTimeString = date + ' ' + startClockTime;
          var endTimeString = date + ' ' + endClockTime;

          var startMoment = moment.tz(startTimeString, timezone);
          var endMoment = moment.tz(endTimeString, timezone);

          if (startMoment.valueOf() > endMoment.valueOf()){
            // this covers instances like deals that go from 10pm - 2am
            endMoment.add(1, 'days');
          }

          if (parseInt(startMoment.format('HH')) >= 0 && parseInt(startMoment.format('HH')) <= 3){
            // this covers instances for deals with a starting time of 12:00am - 2:59am
            if (parseInt(nowMoment.format('HH')) >= 0 && parseInt(nowMoment.format('HH')) <= 3){
              // no action required
            } else {
              // in this case, both start time and end time should be advanced by 1 day
              startMoment.add(1, 'days');
              endMoment.add(1, 'days');
            }
          }

          return [startMoment.valueOf(), endMoment.valueOf()];
        }
    }

    $scope.flashDeal = function(){     
      var d = new Date();
      //console.log(d);
      var date = d.getDate();
      var month = d.getMonth()+1;
      var year = d.getFullYear();
      var today = (year+'-'+month+'-'+date);
      console.log(today);
    };
        
    $scope.addNewDeal = function(){
       
      if($scope.eventObj.eventFlag == "true"){
        $scope.newDeal['address'] = $scope.eventObj.eventAddress;
        $scope.newDeal['businessID'] = $scope.eventObj.eventName;
        $scope.newDeal['city'] = $scope.eventObj.eventCity;
        $scope.newDeal['dealFullImage'] = $scope.eventObj.eventLargeImage;
        $scope.newDeal['description'] = $scope.eventObj.eventDesc;
        $scope.newDeal['detailBackgroundFull'] = $scope.eventObj.eventLargeImage;
        $scope.newDeal['endTime'] = $scope.eventObj.eventEndTime;
        $scope.newDeal['exclusive'] = "no";
        $scope.newDeal['featured'] = "yes";
        $scope.newDeal['foodOrDrink'] = "both";
        $scope.newDeal['icon'] = $scope.eventObj.eventIcon;
        $scope.newDeal['img'] = $scope.eventObj.eventLargeImage;
        $scope.newDeal['icon'] = $scope.eventObj.eventIcon;
        $scope.newDeal['key'] = $scope.eventObj.eventId;
        $scope.newDeal['largeImg'] = $scope.eventObj.eventLargeImage;
        $scope.newDeal['lat'] = $scope.eventObj.eventLat;
        $scope.newDeal['locName'] = $scope.eventObj.eventName;
        $scope.newDeal['lon'] = $scope.eventObj.eventLon;
        $scope.newDeal['name'] = $scope.eventObj.eventName;
        $scope.newDeal['phone'] = $scope.eventObj.eventPhone;
        $scope.newDeal['redeemable'] = "no";
        $scope.newDeal['startTime'] = $scope.eventObj.eventStartTime;
        $scope.newDeal['state'] = $scope.eventObj.eventState;
        $scope.newDeal['timeType'] = "event";
        $scope.newDeal['timezone'] = "America/Chicago";
        $scope.newDeal['type'] = "event";

      }
        
        
       
        
        console.log($scope.newDeal);
    
      
        
      $scope.newDeal.lat = parseFloat($scope.newDeal.lat);
      $scope.newDeal.lon = parseFloat($scope.newDeal.lon);

      if ($scope.newDeal.type == 'recurring'){

        delete $scope.newDeal.type;

        var startClockTime = moment($scope.newDeal.startTime.getTime()).format('HH:mm');
        var endClockTime = moment($scope.newDeal.endTime.getTime()).format('HH:mm');

        var timeRange = convertToUnixOffset(startClockTime, endClockTime, $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone,0);

        $scope.newDeal.startTime = timeRange[0];
          
          console.log($scope.newDeal.startTime);
        $scope.newDeal.endTime = timeRange[1];

        $scope.newDeal.timezone = $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone;

        // create recurring template
        fbutil.ref('recurringDeals').push($scope.newDeal, function(){
          $scope.displayOptions.mainTab='mydeals';
          $scope.displayOptions.viewDealsType='recurring';
          $scope.$apply();
            
            if ($rootScope.userOptions.superadmin != 'yes'){
                mixpanel.track("Add Recurring Deal", { "user": $scope.newDeal.locName+": "+$rootScope.userOptions.email });
                mixpanel.track($scope.newDeal.locName, { "deal": "deal: "+$scope.newDeal.name+" exclusive: "+$scope.newDeal.exclusive+" user: "+$rootScope.userOptions.email });
                //console.log("email: "+$rootScope.userOptions.email);
                //console.log("deal: "+$scope.newDeal.name);
                //console.log("business: "+$scope.newDeal.locName);
                //console.log("days: "+$scope.newDeal.daysOfWeek);
                //console.log("exclusive: "+$scope.newDeal.exclusive);
            }
        });
          
       $scope.imageObject = {largeImage: $scope.newDeal['dealFullImage'], smallImage: $scope.newDeal['img']};
       var bizID = $scope.newDeal['businessID'];
       //console.log(bizID);
       fbutil.ref('businesses', bizID, 'dealImages').push($scope.imageObject);

      } else { 
        
        if ($scope.dealDate == undefined){
            alert('please select valid date');
        }  
         
        //temporarily removed the today function, currently the timestamp for today isn't running through the timezone appropriately  
          
        if ($scope.dealDay == 'today'){
            var d = new Date();
              //console.log(d);
              var date = d.getDate();
              var month = d.getMonth()+1;
              var year = d.getFullYear();
              var today = (year+'-'+month+'-'+date);
              console.log(today);
            var startdate = today;
        } else {
            var startdate = moment($scope.dealDate.getTime()).format('YYYY-MM-DD');
            console.log(startdate); 
        }  
          
         
          
        delete $scope.newDeal.type;
        delete $scope.newDeal.daysOfWeek;

        var startClockTime = moment($scope.newDeal.startTime.getTime()).format('HH:mm');
          
        var endClockTime = moment($scope.newDeal.endTime.getTime()).format('HH:mm');

        var timeRange = convertToUnixOffset(startClockTime, endClockTime, $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone,startdate);

        $scope.newDeal.startTime = timeRange[0];
          console.log($scope.newDeal.startTime);
        $scope.newDeal.endTime = timeRange[1];
        $scope.newDeal.timezone = $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone;
          
        $scope.newDeal.flashDeal = 'yes';

        $scope.newDeal.lat = parseFloat($scope.newDeal.lat);
        $scope.newDeal.lon = parseFloat($scope.newDeal.lon);

        console.log($scope.newDeal.startTime);  
        
       if($scope.eventObj.eventFlag == "true"){

            var eventsFB = new Firebase('https://mealsteals.firebaseio.com/events/');
                    
            eventsFB.child( '/' + $scope.eventObj.eventId).update({eventStartTime: $scope.newDeal.startTime});
            eventsFB.child( '/' + $scope.eventObj.eventId).update({eventEndTime: $scope.newDeal.endTime});
        }
            
            
        // insert into deals and create geofire key
        var newKey = fbutil.ref('deals/').push().key();
        $scope.newDeal.key = newKey;
        fbutil.ref('deals/' + newKey).set($scope.newDeal, function(){
          var geoFire = new GeoFire(fbutil.ref('dealGeoFireKeys'));
          geoFire.set(newKey, [parseFloat($scope.newDeal.lat), parseFloat($scope.newDeal.lon)]);
          $scope.displayOptions.mainTab='mydeals';
          $scope.displayOptions.viewDealsType='actual';
          $scope.$apply();
          console.log('good!');
        });
        
          if ($rootScope.userOptions.superadmin != 'yes'){
              
          mixpanel.track("Add One Time Deal", { "user": $scope.newDeal.locName+": "+$rootScope.userOptions.email });
          mixpanel.track($scope.newDeal.locName, { "deal": "flash deal: "+$scope.newDeal.name+" user: "+$rootScope.userOptions.email });
              
          emailjs.send("flash_deal","template_flash",{content: "business: "+$scope.newDeal.locName+" deal: "+$scope.newDeal.name})
            .then(function(response) {
               console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
            }, function(err) {
               console.log("FAILED. error=", err);
            });
          }
      }

    };
        
    $scope.boostDeal = function(dealID, deal){
      //console.log($firebaseObject(fbutil.ref('recurringDeals/' + dealID)));
      fbutil.ref('deals/', dealID, '/boost').set(true);
      alert('boosted');
    };
        
    
    //Popup ads recurring
        
        
    $scope.adminPopupAdDeal = function(dealID, deal){
     
      //console.log($firebaseObject(fbutil.ref('recurringDeals/' + dealID)));
      $scope.popupDealObj = $firebaseObject(fbutil.ref('recurringDeals/' + dealID));
      
        
        var dealName = {};
        dealName = $scope.popupDealObj;
        
        $scope.popupDealData = {
        name: deal.name,
        description: deal.description,
        locName: $rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName,
        icon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].icon,
        img: deal.img,
        dealFullImage: deal.dealFullImage,
        largeImg: deal.largeImg,
        detailBackgroundFull: $rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground,
        address: $rootScope.bizInfo[$scope.displayOptions.currentLoc].address,
        city: $rootScope.bizInfo[$scope.displayOptions.currentLoc].city,
        state: $rootScope.bizInfo[$scope.displayOptions.currentLoc].state,
        phone: $rootScope.bizInfo[$scope.displayOptions.currentLoc].phone,
        lat: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lat,
        lon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lon,
        featured: deal.featured,
        daysOfWeek: {
          'monday': deal.daysOfWeek.monday,
          'tuesday': deal.daysOfWeek.tuesday,
          'wednesday': deal.daysOfWeek.wednesday,
          'thursday': deal.daysOfWeek.thursday,
          'friday': deal.daysOfWeek.friday,
          'saturday': deal.daysOfWeek.saturday,
          'sunday': deal.daysOfWeek.sunday
        },
        //type: deal.type,
        startTime: deal.startTime,
        endTime: deal.endTime,
        foodOrDrink: deal.foodOrDrink,
        exclusive: deal.exclusive,
        timeType: deal.timeType,
        redeemable: deal.redeemable,
        businessID: deal.businessID,
        impressions: -10 // do math on app side to subtract this number, when impressions = 0 then delete or hide
            
       
      };
        console.log($scope.popupDealData);
      
      fbutil.ref('popupAdDeals').push($scope.popupDealData);
    };
    
    // Popup ad scheduled    
        
    $scope.oneTimePopupAdDeal = function(dealID, deal){
     
      //console.log($firebaseObject(fbutil.ref('recurringDeals/' + dealID)));
      $scope.popupDealObj = $firebaseObject(fbutil.ref('deals/' + dealID));
      
        console.log($scope.popupDealObj);
        
        var dealName = {};
        dealName = $scope.popupDealObj;
        
        
        $scope.popupDealData = {
        name: deal.name,
        description: deal.description,
        locName: deal.locName,
        icon: deal.icon,
        img: deal.img,
        dealFullImage: deal.dealFullImage,
        largeImg: deal.largeImg,
        detailBackgroundFull: deal.detailBackgroundFull,
        address: deal.address,
        city: deal.city,
        state: deal.state,
        phone: deal.phone,
        lat: deal.lat,
        lon: deal.lon,
        featured: deal.featured,
        //type: deal.type,
        startTime: deal.startTime,
        endTime: deal.endTime,
        foodOrDrink: deal.foodOrDrink,
        exclusive: deal.exclusive,
        timeType: deal.timeType,
        redeemable: deal.redeemable,
        businessID: deal.businessID,
        //impressions: 20 // do math on app side to subtract this number, when impressions = 0 then delete or hide
            
       
      };
        console.log($scope.popupDealData);
      
      fbutil.ref('popupAdDeals').push($scope.popupDealData, function(){
          $scope.displayOptions.mainTab='mydeals';
          $scope.displayOptions.viewDealsType='popupad';
          $scope.$apply();
        });
    };    
        
    $scope.deletePopupAdDeal = function(dealID){
      console.log('deleting popup ad deal', dealID);
      fbutil.ref('popupAdDeals/' + dealID).set(null);
    };
        
    $scope.paidPopupAdDeal = function(dealID, deal, impressions, adCount){
      $scope.popup = {};   
      $scope.popup = $firebaseObject(fbutil.ref('popupAdDeals/' + dealID));  
      $scope.popup.$loaded().then(function () {
        if(impressions!=undefined){
            $scope.impressions = impressions;
            $scope.newAdTotal = adCount - impressions;
              if ($scope.popup.impressions==undefined){
                  console.log('first time popup: '+impressions);
                  $scope.popupDealObj = $firebaseObject(fbutil.ref('recurringDeals/' + dealID));
                    var dealName = {};
                    dealName = $scope.popupDealObj;

                    $scope.popupDealData = {
                    name: deal.name,
                    description: deal.description,
                    locName: $rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName,
                    icon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].icon,
                    img: deal.img,
                    dealFullImage: deal.dealFullImage,
                    largeImg: deal.largeImg,
                    detailBackgroundFull: $rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground,
                    address: $rootScope.bizInfo[$scope.displayOptions.currentLoc].address,
                    city: $rootScope.bizInfo[$scope.displayOptions.currentLoc].city,
                    state: $rootScope.bizInfo[$scope.displayOptions.currentLoc].state,
                    phone: $rootScope.bizInfo[$scope.displayOptions.currentLoc].phone,
                    lat: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lat,
                    lon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lon,
                    featured: deal.featured,
                    daysOfWeek: {
                      'monday': deal.daysOfWeek.monday,
                      'tuesday': deal.daysOfWeek.tuesday,
                      'wednesday': deal.daysOfWeek.wednesday,
                      'thursday': deal.daysOfWeek.thursday,
                      'friday': deal.daysOfWeek.friday,
                      'saturday': deal.daysOfWeek.saturday,
                      'sunday': deal.daysOfWeek.sunday
                    },
                    //type: deal.type,
                    startTime: deal.startTime,
                    endTime: deal.endTime,
                    foodOrDrink: deal.foodOrDrink,
                    exclusive: deal.exclusive,
                    timeType: deal.timeType,
                    redeemable: deal.redeemable,
                    businessID: deal.businessID,
                    impressions: impressions // do math on app side to subtract this number, when impressions = 0 then delete or hide


                  };
                    console.log($scope.popupDealData);
                    fbutil.ref('popupAdDeals', dealID).update($scope.popupDealData);
              } else {
                  var newImpressions = $scope.popup.impressions + impressions;
                  console.log('previous popup: '+newImpressions);
                 
                  fbutil.ref('popupAdDeals', dealID).update({impressions:newImpressions});
              }
            console.log('new ad total: '+$scope.newAdTotal);
            fbutil.ref('businesses', deal.businessID, 'currentPlan').update({adCount:$scope.newAdTotal});
        } else {
            alert('select number of ads');
        }
      }); 
    };
        
        
        
     $scope.deletePaidPopupAdDeal = function(dealID, deal, adCount){
      if (deal.impressions > 0) {
          $scope.newAdTotal = parseInt(adCount) + parseInt(deal.impressions);
          console.log('deleting popup ad deal', dealID);
          console.log($scope.newAdTotal);
          fbutil.ref('popupAdDeals/' + dealID).set(null);
          fbutil.ref('businesses', deal.businessID, 'currentPlan').update({adCount:$scope.newAdTotal});
      } else {
          fbutil.ref('popupAdDeals/' + dealID).set(null);
      }
    };
        
    // Verify deal and update business information    
        
    $scope.verifyDeal = function(dealID, deal){
     
      //console.log($firebaseObject(fbutil.ref('recurringDeals/' + dealID)));
      $scope.grabRecurringDealObj = $firebaseObject(fbutil.ref('recurringDeals/' + dealID));
      
        
        //var dealName = {};
        //dealName = $scope.popupDealObj;
        
        $scope.dateNow = Date.now();
           
        $scope.verifiedDealObj = {
        name: deal.name,
        description: deal.description,
        about: $rootScope.bizInfo[$scope.displayOptions.currentLoc].about,
        locName: $rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName,
        icon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].icon,
        img: deal.img,
        dealFullImage: deal.dealFullImage,
        largeImg: deal.largeImg,
        detailBackgroundFull: $rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground,
        address: $rootScope.bizInfo[$scope.displayOptions.currentLoc].address,
        city: $rootScope.bizInfo[$scope.displayOptions.currentLoc].city,
        state: $rootScope.bizInfo[$scope.displayOptions.currentLoc].state,
        phone: $rootScope.bizInfo[$scope.displayOptions.currentLoc].phone,
        lat: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lat,
        lon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lon,
        featured: deal.featured,
        daysOfWeek: {
          'monday': deal.daysOfWeek.monday,
          'tuesday': deal.daysOfWeek.tuesday,
          'wednesday': deal.daysOfWeek.wednesday,
          'thursday': deal.daysOfWeek.thursday,
          'friday': deal.daysOfWeek.friday,
          'saturday': deal.daysOfWeek.saturday,
          'sunday': deal.daysOfWeek.sunday
        },
        //type: deal.type,
        startTime: deal.startTime,
        endTime: deal.endTime,
        foodOrDrink: deal.foodOrDrink,
        exclusive: deal.exclusive,
        timeType: deal.timeType,
        redeemable: deal.redeemable,
        businessID: deal.businessID,
        verified: $scope.dateNow,
      };
        console.log($scope.verifiedDealObj);
        fbutil.ref('recurringDeals', dealID).update({
            
            name: deal.name,
            description: deal.description,
            about: $rootScope.bizInfo[$scope.displayOptions.currentLoc].about,
            locName: $rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName,
            icon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].icon,
            img: deal.img,
            dealFullImage: deal.dealFullImage,
            largeImg: deal.largeImg,
            detailBackgroundFull: $rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground,
            address: $rootScope.bizInfo[$scope.displayOptions.currentLoc].address,
            city: $rootScope.bizInfo[$scope.displayOptions.currentLoc].city,
            state: $rootScope.bizInfo[$scope.displayOptions.currentLoc].state,
            phone: $rootScope.bizInfo[$scope.displayOptions.currentLoc].phone,
            lat: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lat,
            lon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lon,
            featured: deal.featured,
            daysOfWeek: {
              'monday': deal.daysOfWeek.monday,
              'tuesday': deal.daysOfWeek.tuesday,
              'wednesday': deal.daysOfWeek.wednesday,
              'thursday': deal.daysOfWeek.thursday,
              'friday': deal.daysOfWeek.friday,
              'saturday': deal.daysOfWeek.saturday,
              'sunday': deal.daysOfWeek.sunday
            },
            //type: deal.type,
            startTime: deal.startTime,
            endTime: deal.endTime,
            foodOrDrink: deal.foodOrDrink,
            exclusive: deal.exclusive,
            timeType: deal.timeType,
            redeemable: deal.redeemable,
            businessID: deal.businessID,
            verified: $scope.dateNow,
        });
        
        console.log(deal.name+' deal updated and verfied in firebase');
        alert('icon updated');
        
         
      
      /*fbutil.ref('popupAdDeals').push($scope.popupDealData, function(){
          $scope.displayOptions.mainTab='mydeals';
          $scope.displayOptions.viewDealsType='popupad';
          $scope.$apply();
        });*/
    };    
        

    $scope.showHistoryAnalytics = 'no';    
        
    $scope.showAnalytics = function(){
        if ($scope.showHistoryAnalytics=='no') {
            $scope.showHistoryAnalytics = 'yes';
        } else {
            $scope.showHistoryAnalytics = 'no';
        }
    };
        
        //$scope.currentDealID = [];
        //$scope.recurringCounter = -1;
        
    
    $scope.mapClicks = 0;    
    $scope.recurringAnalytics = function(deal){
        
        if(deal.listAnalytics != undefined){
            $scope.listClicks += deal.listAnalytics;
        }
        if(deal.mapAnalytics != undefined){
            $scope.mapClicks += deal.mapAnalytics;
        }
        if(deal.detailAnalytics != undefined){
            $scope.detailClicks += deal.detailAnalytics;
        }
        if(deal.redeemAnalytics != undefined){
            $scope.redeemClicks += deal.redeemAnalytics;
        }
       
        
    }
    
    
        
               
        
    $scope.daysOfWeek = function(d){
      var ret = '';
      if (d.daysOfWeek['monday']=='yes'){ ret += 'M/'; }
      if (d.daysOfWeek['tuesday']=='yes'){ ret += 'T/'; }
      if (d.daysOfWeek['wednesday']=='yes'){ ret += 'W/'; }
      if (d.daysOfWeek['thursday']=='yes'){ ret += 'TR/'; }
      if (d.daysOfWeek['friday']=='yes'){ ret += 'F/'; }
      if (d.daysOfWeek['saturday']=='yes'){ ret += 'SA/'; }
      if (d.daysOfWeek['sunday']=='yes'){ ret += 'SU/'; }
      return ret.substr(0, ret.length-1);
    }

    $scope.formatTimestamp = function(ts, timezone){
      return moment(ts).tz(timezone).format('h:mm a');
    }

    $scope.timestampDay = function(ts, timezone){
      return moment(ts).tz(timezone).format('ddd MM-DD');
    }

    $scope.isActive = function(d){
      var now = moment().valueOf();
      return d.startTime < now && d.endTime > now;
    }
    
    $scope.isUpcoming = function(d){
      var now = moment().valueOf();
      var plusTwelveHours = parseInt(now) + parseInt(43200);
      var minusTwelveHours = parseInt(now) - parseInt(43200);
      return d.endTime > minusTwelveHours;
    }
    
    $scope.isFeatured = function(d){
        if (d.featured=='yes'){
            return d;
        }    
    }
    
    $scope.isFeaturedMonday = function(d){
        if (d.featured=='yes' && d.daysOfWeek.monday=='yes'){
            return d;
        }    
    }
    $scope.isFeaturedTuesday = function(d){
        if (d.featured=='yes' && d.daysOfWeek.tuesday=='yes'){
            return d;
        }    
    }
    $scope.isFeaturedWednesday = function(d){
        if (d.featured=='yes' && d.daysOfWeek.wednesday=='yes'){
            return d;
        }    
    }
    $scope.isFeaturedThursday = function(d){
        if (d.featured=='yes' && d.daysOfWeek.thursday=='yes'){
            return d;
        }    
    }
    $scope.isFeaturedFriday = function(d){
        if (d.featured=='yes' && d.daysOfWeek.friday=='yes'){
            return d;
        }    
    }
    $scope.isFeaturedSaturday = function(d){
        if (d.featured=='yes' && d.daysOfWeek.saturday=='yes'){
            return d;
        }    
    }
    $scope.isFeaturedSunday = function(d){
        if (d.featured=='yes' && d.daysOfWeek.sunday=='yes'){
            return d;
        }    
    }
    
   $scope.isMonday = function(d){
        if (d.daysOfWeek.monday=='yes'){
            return d;
        }    
    }
    $scope.isTuesday = function(d){
        if (d.daysOfWeek.tuesday=='yes'){
            return d;
        }    
    }
    $scope.isWednesday = function(d){
        if (d.daysOfWeek.wednesday=='yes'){
            return d;
        } 
    }
        $scope.isThursday = function(d){
        if (d.daysOfWeek.thursday=='yes'){
            return d;
        }
    }
    $scope.isFeaturedThursday = function(d){
        if (d.featured=='yes' && d.daysOfWeek.thursday=='yes'){
            return d;
        }    
    }
    $scope.isFriday = function(d){
        if (d.daysOfWeek.friday=='yes'){
            return d;
        }    
    }
    $scope.isSaturday = function(d){
        if (d.daysOfWeek.saturday=='yes'){
            return d;
        }    
    }
    $scope.isSunday = function(d){
        if (d.daysOfWeek.sunday=='yes'){
            return d;
        }    
    }

    
    $scope.checkinCalc = function(deal){
        if(!angular.isUndefined(deal.checkIn)){            
            $scope.checkin = Object.keys(deal.checkIn).length;
        }
    }
    
    $scope.loadMyDeals = function(){

      $scope.myDeals = $firebaseArray(fbutil.ref('deals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc).limitToLast(25));
    
      $scope.myRecurringDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));
        
      $scope.myRecurringObj = $firebaseObject(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));
        
      $scope.myPopupAdDeals = $firebaseArray(fbutil.ref('popupAdDeals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));
        
     // $scope.allPopupAdDeals = $firebaseArray(fbutil.ref('popupAdDeals').orderByChild('businessID'));
        
      //$scope.allDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('locName'));
    
    };
        
    $scope.loadAnalytics = function(){
         $scope.myDeals = $firebaseArray(fbutil.ref('deals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));        
    };
        
    $scope.loadBizUsers = function(){
         $scope.bizUsers = $firebaseArray(fbutil.ref('users'));
         $scope.bizLocations = $firebaseArray(fbutil.ref('businesses'));
    };
        
    $scope.loadAdminDeals = function(){
        
      $scope.allPopupAdDeals = $firebaseArray(fbutil.ref('popupAdDeals').orderByChild('businessID'));
        
      $scope.allDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('locName'));
    
    };
        
    $scope.loadFeedback = function(){
      $scope.feedback = $firebaseArray(fbutil.ref('feedback').orderByChild('businessID'));
    };
        
    $scope.loadAdminEvents = function(){
      
        
      $scope.allEventDeals = $firebaseArray(fbutil.ref('deals').orderByChild('timeType').equalTo('event'));
      
    
    };    
        
        /*$scope.expandRecurringDeal = function(dealID){
        //$scope.recurringCounter += 1;
        //$scope.currentDealID.push(dealID);
        //console.log($scope.currentDealID[$scope.recurringCounter]);
        $scope.currentDealID = dealID;
        
    }    */
        
    $scope.loadRecurringHistory = function(dealID){
        $scope.currentDealID = dealID;
        console.log(dealID);
        $scope.individualRecurringDeal = $firebaseArray(fbutil.ref('deals').orderByChild('recurringDealID').equalTo( $scope.currentDealID));
    };

    $scope.deleteRecurringDeal = function(dealID){
      console.log('deleting', dealID);
      fbutil.ref('recurringDeals/' + dealID).set(null);
    };

    $scope.deleteDeal = function(dealID){
      console.log('deleting', dealID);
      fbutil.ref('deals/' + dealID).set(null);
      var geoFire = new GeoFire(fbutil.ref('dealGeoFireKeys'));
      geoFire.remove(dealID);
    };

    /*
    >>> aws_secret_key = 'XXXXXXXXXXXXXXXXXXXXX'
    >>> policy_json = '{"expiration":"2020-01-01T00:00:00Z","conditions":[{"bucket":"bucketname"},{"acl": "public-read"},["starts-with","$Content-Type",""],["starts-with","$key",""]]}'
    >>> import base64, hmac, sha
    >>> encoded_policy = base64.b64encode(policy_json)
    >>> signature = base64.b64encode(hmac.new(aws_secret_key, encoded_policy, sha).digest())
    >>> print signature
    >>> print encoded_policy
    >>>
    */

    function imageToDataUri(URI, originalWidth, originalHeight, newWidth, newHeight) {

      return $q(function(resolve, reject){
        var img = new Image();
        img.onload = function(){
          // create an off-screen canvas
          // var canvas = document.createElement('canvas');
          // var ctx = canvas.getContext('2d');

          // set its dimension to target size
          // canvas.width = newWidth;
          // canvas.height = newHeight;
          var widthSteps = [];
          var heightSteps = [];
          var numSteps = 10;

          var delta = originalWidth - newWidth;
          var step = Math.round(delta / numSteps);
          for (var i=1; i<=numSteps; i++){
            if (step > 1){
              widthSteps.push(originalWidth-i*step);
            } else {
              widthSteps.push(newWidth);
            }
          }

          var delta = originalHeight - newHeight;
          var step = Math.round(delta / numSteps);
          for (var i=1; i<=numSteps; i++){
            if (step > 1){
              heightSteps.push(originalHeight-i*step);
            } else {
              heightSteps.push(newHeight);
            }
          }

          // draw source image into the off-screen canvas:
          for (var i=1; i<=numSteps; i++){
            var canvas = document.createElement('canvas');
            canvas.width = widthSteps[i-1];
            canvas.height = heightSteps[i-1];
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, widthSteps[i-1], heightSteps[i-1]);
            console.log(widthSteps[i-1], heightSteps[i-1]);
            img = canvas;  
          }

          resolve(canvas.toDataURL());
        }
        img.src = URI;
      });

  }

  function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {type:mimeString});
  }

    $scope.policy = 'eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJtZWFsc3RlYWxzeWVzIn0seyJhY2wiOiAicHVibGljLXJlYWQifSxbInN0YXJ0cy13aXRoIiwiJENvbnRlbnQtVHlwZSIsIiJdLFsic3RhcnRzLXdpdGgiLCIka2V5IiwiIl1dfQ==';
    $scope.signature = 'OIiCj+2av3cmeabevQ4t9QtceMs=';
    $scope.timeID = String(new Date().getTime());
        
        
        

    $scope.uploadFiles = function(file, saveTo, saveToKey, maxWidth, maxHeight) {
        $scope.f = file;
        if (file && !file.$error) {
            $scope.loadingImage = true;
            
            console.log(saveTo);
            
            

            var newWidth = file.width;
            var newHeight = file.height;

          	// if (saveToKey == 'detailBackground'){
           //  	saveTo['detailBackgroundFull'] = 'http://s3.amazonaws.com/mealstealsyes/' + $scope.timeID + file.name + 'detailBackgroundFull';
           //  	$rootScope.bizInfo[$scope.displayOptions.currentLoc].$save();
          	// }else if (saveToKey == 'img'){
           //  	saveTo['dealFullImage'] = 'http://s3.amazonaws.com/mealstealsyes/' + $scope.timeID + file.name + 'dealFullImage';
           //  	$rootScope.bizInfo[$scope.displayOptions.currentLoc].$save();
          	// }


            if (maxWidth){
              if (maxHeight){
                // if both are set, we force resize
                if (file.width > maxWidth || file.height > maxHeight){
                
                
                  newWidth = maxWidth;
                  newHeight = maxHeight;
                }
              } else {
                if (file.width > maxWidth){
                
                
                
                
                
                
                  newWidth = maxWidth;
                  newHeight = Math.round(file.height * (newWidth / file.width));
                }
              }
            }
                

            var reader  = new FileReader();
            reader.onloadend = function () {
              imageToDataUri(reader.result, file.width, file.height, newWidth, newHeight).then(function(hmm){

                var newBlob = dataURItoBlob(hmm);

                  console.log(file.name);
                  
                  var fileName = file.name.replace(' ', '_');
                  
                  console.log(fileName);
                  
                file.upload = Upload.upload({
                  url: 'http://s3.amazonaws.com/mealstealsyes', //S3 upload url including bucket name
                  method: 'POST',
                  fields : {
                    key: $scope.timeID + saveToKey + fileName, // the key to store the file on S3, could be file name or customized
                    AWSAccessKeyId: 'AKIAJ46C4XJRMO6JBATA',
                    acl: 'public-read', // sets the access to the uploaded file in the bucket: private or public
                    policy: $scope.policy, // base64-encoded json policy (see article below)
                    signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
                    "Content-Type": file.type != '' ? file.type : 'application/octet-stream' // content type of the file (NotEmpty)
                  },
                  file: newBlob,
                });

                file.upload.then(function (response) {
                  //success
                  $scope.loadingImage = false;
                    $timeout(function () {
                        file.result = response.data;

                        // $rootScope.bizInfo[$scope.displayOptions.currentLoc][saveToKey] = 'http://s3.amazonaws.com/mealstealsyes/' + $scope.timeID + file.name;
                        saveTo[saveToKey] = 'http://s3.amazonaws.com/mealstealsyes/' + $scope.timeID + saveToKey + fileName;
                        
                        console.log(saveToKey);
                        
                        if(saveToKey != 'eventLargeImage' && saveToKey != 'eventIcon'){
                            console.log('not an event');
                            $rootScope.bizInfo[$scope.displayOptions.currentLoc].$save();
                        }
                    });
                }, function (response) {
                  //error
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                });

                file.upload.progress(function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 * 
                                                           evt.loaded / evt.total));
                });

              });
            }
            reader.readAsDataURL(file);

              
        }   
    }

  
    $scope.addUserAccess = function(email, bizID){

        var comma_email = email.replace('.', ',');
        
      // look up uid from email
      $firebaseObject(fbutil.ref('emails', comma_email)).$loaded().then(function(o){
        var uid = o.uid;

        

        // add userid and email to business object
        fbutil.ref('businesses', bizID, 'userids', uid).update({uid:uid});
        fbutil.ref('businesses', bizID, 'emails', comma_email).update({comma_email:email});

        // add business id to user object
        fbutil.ref('users', uid, 'bizIDs', bizID).set(true);

      });

    }

    $scope.removeUserAccess = function(email, bizID){

        if(!angular.isUndefined(email.comma_email)){
            email = email.comma_email;
        }
        var comma_email = email.replace('.', ',');
        
      // look up uid from email
      $firebaseObject(fbutil.ref('emails', comma_email)).$loaded().then(function(o){
        var uid = o.uid;

        

        // add userid and email to business object
        fbutil.ref('businesses', bizID, 'userids', uid).remove();
        fbutil.ref('businesses', bizID, 'emails', comma_email).remove();

        // add business id to user object
        fbutil.ref('users', uid, 'bizIDs', bizID).set(null);

      });

    }
    
     







    // $scope.mytime = new Date();

    $scope.hstep = 1;
    $scope.mstep = 15;

    // $scope.options = {
    //   hstep: [1, 2, 3],
    //   mstep: [1, 5, 10, 15, 25, 30]
    // };

    $scope.ismeridian = true;
    // $scope.toggleMode = function() {
    //   $scope.ismeridian = ! $scope.ismeridian;
    // };

    // $scope.update = function() {
    //   var d = new Date();
    //   d.setHours( 14 );
    //   d.setMinutes( 0 );
    //   $scope.mytime = d;
    // };

    // $scope.changed = function () {
    //   $log.log('Time changed to: ' + $scope.mytime);
    // };

    // $scope.clear = function() {
    //   $scope.mytime = null;
    // };


    $scope.openEditBox = function (dealID, type) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'home/editDeal.html',
        controller: 'EditDealCtrl',
        size: 'lg',
        resolve: {
          $q: function(){
            return $q;
          },
          Upload: function(){
            return Upload;
          },
          $timeout: function(){
            return $timeout;
          },
          dealID: function () {
            return dealID;
          },
          type: function () {
            return type;
          },
          $firebaseObject: function() {
            return $firebaseObject;
          },
          fbutil: function() {
            return fbutil;
          },
          convertToUnixOffset: function() {
            return convertToUnixOffset;
          }
        }
      });
    };
        
   
    //custom navbar
        
    $scope.navState = "close";    
        
    $scope.openNav = function() {
        console.log("open");  
        $("#mealsteals-nav").addClass("nav-open");
        $("#mealsteals-nav").removeClass("nav-close");
        $("#slideout-container").addClass("container-open");
        $("#slideout-container").removeClass("container-close");
        $scope.navState = "open";
    };
        
    $scope.closeNav = function() {
        console.log("close");
        $("#mealsteals-nav").addClass("nav-close");
        $("#mealsteals-nav").removeClass("nav-open");
        $("#slideout-container").addClass("container-close");
        $("#slideout-container").removeClass("container-open");
        $scope.navState = "closed";
    };
        
    $scope.saveAlert = function() {
        $("#saved").removeClass("saved");
        $timeout(function() {
                 $("#saved").addClass("saved"); //close the popup after 4 seconds
              }, 2500);
        
    }
    
    $scope.exclusiveAlert = function() {
        $("#exclusive").removeClass("hidden-alert");
    }
    
    $scope.removeExclusiveAlert = function() {
        $("#exclusive").addClass("hidden-alert");
    }
    
    $scope.redeemableAlert = function() {
        $("#redeemable").removeClass("hidden-alert");
    }
    
    $scope.removeRedeemableAlert = function() {
        $("#redeemable").addClass("hidden-alert");
    }
    
    $scope.featuredAlert = function() {
        $("#featured").removeClass("hidden-alert");
    }
    
    $scope.removeFeaturedAlert = function() {
        $("#featured").addClass("hidden-alert");
    }
        
    
  
  $scope.address = {
    name: '',
    place: '',
    components: {
      placeId: '',
      streetNumber: '', 
      street: '',
      city: '',
      state: '',
      countryCode: '',
      country: '',
      postCode: '',
      district: '',
      location: {
        lat: '',
        long: ''
      }
    }
  };

    $scope.help = function() {
      console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc].address);  
    };

        
        
        
    $scope.loadAdminAnalytics = function(bus) {
        
        
        console.log(bus);
        $scope.recurringAnalytics = {};
        
        $rootScope.recurringObj.$loaded()
        .then(function(){
        
            angular.forEach($rootScope.recurringObj, function(recurring){

                $scope.recurringAnalytics[recurring.$id] = {'obj': recurring};
                
                $scope.getCheckins(recurring,bus);
                $scope.getFav(recurring,bus);
                $scope.getRatings(recurring,bus);

                if(angular.isUndefined($scope.recurringAnalytics[recurring.$id].checkin)){
                    $scope.recurringAnalytics[recurring.$id]['checkin'] = 0;
                }
                
                if(angular.isUndefined($scope.recurringAnalytics[recurring.$id].favs)){
                    $scope.recurringAnalytics[recurring.$id]['favs'] = 0;
                }
                
                if(angular.isUndefined($scope.recurringAnalytics[recurring.$id].rating)){
                    $scope.recurringAnalytics[recurring.$id]['favs'] = 'No Ratings';
                }


            })
        });
    };    
    
    $scope.getCheckins = function(recurringDeal, bus){
        $scope.recurringCheckin = 0;
        
        $rootScope.currentUser.$loaded()
         .then(function(){
        
            angular.forEach($rootScope.currentUser, function(user) { 
                
                if(!angular.isUndefined(user.meta)){ 
                   if(!angular.isUndefined(user.meta.checkIns)){
                    
                        angular.forEach(user.meta.checkIns, function(checkin){
                            if(recurringDeal.$id == checkin.recurringDealID){
                                if(checkin.businessID == bus.$id){
                                    $scope.recurringCheckin += 1;
                                    $scope.recurringAnalytics[recurringDeal.$id]['checkin'] = $scope.recurringCheckin;
                                }

                            }
                        })
                    } 
                }
            })
        });
    };
        
    
        
    $scope.getFav = function(recurringDeal, bus){
        
        $scope.recurringFavs = 0;
        
        $rootScope.currentUser.$loaded()
         .then(function(){
        
            angular.forEach($rootScope.currentUser, function(user) { 

                if(!angular.isUndefined(user.meta)){ 

                   if(!angular.isUndefined(user.meta.favorites)){
                       if(!angular.isUndefined(user.meta.favorites.deals)){
                            angular.forEach(user.meta.favorites.deals, function(deal, key){
                                if(recurringDeal.$id == key){
                                    if(deal.businessID == bus.$id){
                                        $scope.recurringFavs += 1;
                                        $scope.recurringAnalytics[recurringDeal.$id]['favs'] = $scope.recurringFavs;
                                    }

                                }
                            })
                       }
                    }
                }
            })
        });
    };
        
        
    $scope.getFollow = function(bus){
        console.log(bus);
        $scope.recurringFollow = 0;
        
        $rootScope.currentUser.$loaded()
         .then(function(){
        
            angular.forEach($rootScope.currentUser, function(user) { 

                if(!angular.isUndefined(user.meta)){ 
                   if(!angular.isUndefined(user.meta.favorites)){
                       if(!angular.isUndefined(user.meta.favorites.businesses)){
                            angular.forEach(user.meta.favorites.businesses, function(follow){

                                if(follow.$id == bus.$id){
                                    $scope.recurringFollow += 1;
                                }

                                
                            })
                       }
                    }
                }
            })
        });
    };
        
        
    $scope.getRedeems = function(bus){
        
        $scope.redeems = {};
        
        $rootScope.currentUser.$loaded()
         .then(function(){
        
            angular.forEach($rootScope.currentUser, function(user) { 

                if(!angular.isUndefined(user.meta)){ 
                   if(!angular.isUndefined(user.meta.redeems)){
                        angular.forEach(user.meta.redeems, function(redeem){

                                if(redeem.businessID == bus.$id){
                                    if(!angular.isUndefined(redeem.redeems)){
                                        redeem.redeems += 1;
                                        $scope.redeems[redeem.$id] = redeem;
                                    }else{
                                        redeem['redeems'] = 1;
                                        $scope.redeems[redeem.$id] = redeem;
                                    }
                                }
                        })
                       
                    }
                }
            })
        });
    };
        
        
         
    $scope.getRatings = function(recurring, bus){
        
        //currently only counts recurring deals
        //still need to add onetime and overall business
        
        
        $scope.dealRating = 0;
        var dealRating = 0;
        var dealCounter = 0;
      
        
        if(!angular.isUndefined(bus.ratings)){ 
           if(!angular.isUndefined(bus.ratings.recurring)){
                angular.forEach(bus.ratings.recurring, function(rate, key){
                        console.log('in recurring for')
                   
                    if(recurring.$id == key){
                        
                        angular.forEach(rate, function(rating){
                            console.log('in rating');
                            console.log(rating);
                            dealRating += rating.rating;
                            dealCounter += 1;
                            
                        })
                        
                    }

                })
                
                if(dealCounter != 0){
                    $scope.dealRating = Math.round( (dealRating/dealCounter) * 10 ) / 10;
                    $scope.recurringAnalytics[recurring.$id]['rating'] = $scope.dealRating;
                }

            }
            
            
        }
    };
        
    $scope.userAnalytics = function(){
        	
        $scope.user = {};
        $rootScope.currentUser.$loaded()
        .then(function(){
            
            angular.forEach($rootScope.currentUser, function(user){
                $scope.user[user.$id] = {};
                if(!angular.isUndefined(user.meta)){
                    $scope.user[user.$id]['username'] = user.meta.username;

                    if(!angular.isUndefined(user.meta.favorites)){
                        if(!angular.isUndefined(user.meta.favorites.deals)){
                            $scope.user[user.$id]['favorites'] = Object.keys(user.meta.favorites.deals).length;
                        }else{
                            $scope.user[user.$id]['favorites'] = 0;
                        }
                        if(!angular.isUndefined(user.meta.favorites.businesses)){
                            $scope.user[user.$id]['follows'] = Object.keys(user.meta.favorites.businesses).length;
                        }else{
                            $scope.user[user.$id]['follows'] = 0;  
                        }
                    }else{
                        $scope.user[user.$id]['favorites'] = 0;
                        $scope.user[user.$id]['follows'] = 0; 
                    }
                    if(!angular.isUndefined(user.meta.checkIns)){
                        $scope.user[user.$id]['checkins'] = Object.keys(user.meta.checkIns).length;
                    }else{
                        $scope.user[user.$id]['checkins'] = 0;
                    }
                    
                    if(!angular.isUndefined(user.meta.logins)){
                        $scope.user[user.$id]['logins'] = Object.keys(user.meta.logins).length;
                    }else{
                        $scope.user[user.$id]['logins'] = 0;
                    }
                    if(!angular.isUndefined(user.meta.email)){
                        $scope.user[user.$id]['email'] = user.meta.email;
                    }
                }else{
                    $scope.user[user.$id]['username'] = 'no Username';
                    $scope.user[user.$id]['checkins'] = 0;
                    $scope.user[user.$id]['favorites'] = 0;
                    $scope.user[user.$id]['follows'] = 0; 
                    $scope.user[user.$id]['logins'] = 0;
                    $scope.user[user.$id]['email'] = 'no email';
                }
            })
            
            console.log($scope.user);
        
        });
    };
        
    var testKey = "pk_test_K6dCrNGaeDoyZhjU0Uypxh0M";
    var liveKey = "pk_live_e7cqyQsxGbRGtQL9CpNhNV9g";
        
    var commenceKey = testKey;
    
    //console.log(commenceKey);
        
    $scope.commencePayment = function(){
      //console.log('payment'); 
        
        commenceHandler({dataset:{
          name: "MealSteals",
          key: commenceKey,
          description: '2 widgets',
          zipCode: true,
          amount: 200//$("#amount").val()
        }});    
    };
        
     $scope.payPremium = function(){
      //console.log('payment'); 
        
        commenceHandler({dataset:{
          name: "MealSteals",
          key: commenceKey,
          description: 'Premium',
          plan: "premiumpackage",
          zipCode: true,
          amount: 11900//$("#amount").val()
        }});    
    }; 
        
        /*
        $scope.addUserAccess = function(email, bizID){

      // look up uid from email
      $firebaseObject(fbutil.ref('emails', email.replace('.', ','))).$loaded().then(function(o){
        var uid = o.uid;

        var comma_email = email.replace('.', ',');

        // add userid and email to business object
        fbutil.ref('businesses', bizID, 'userids').update({uid:uid});
        fbutil.ref('businesses', bizID, 'emails').update({comma_email:email});

        // add business id to user object
        fbutil.ref('users', uid, 'bizIDs', bizID).set(true);

      });

    }
        */
        
     $scope.adServed = function(dealID, deal, bizID, adCount){
        $scope.newImpressions = deal.impressions - 1;
        //$scope.newAdTotal = adCount - 1; 
         
        fbutil.ref('popupAdDeals', dealID).update({impressions:$scope.newImpressions});
        console.log(deal.impressions);
        if (deal.impressions < 1){
            fbutil.ref('popupAdDeals/' + dealID).set(null);
        }
         
        //fbutil.ref('businesses', bizID, 'currentPlan').update({adCount:$scope.newAdTotal});
    
     };   
        
    //$scope.purchaseAd = 100;   
        
     $scope.adminPopupCredits = function(bizID, adCredits){
         var amount = adCredits*10;
         var date = new Date();
         var time = date.getTime();
         console.log(time);
         if ($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan != undefined){
                var adTotal = parseInt(adCredits) + parseInt($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan.adCount);
                $scope.historyObject = {createdAt: time, payment: amount, ads: adCredits, type: 'Free credit'};
                console.log($scope.historyObject);
                fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                fbutil.ref('businesses', bizID, 'currentPlan').update({adCount:adTotal}); 
         } else {
                $scope.historyObject = {createdAt: time, payment: amount, ads: adCredits, type: 'Free credit'};
                console.log($scope.historyObject);
                fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                fbutil.ref('businesses', bizID, 'currentPlan').update({adCount:adCredits});
         }
     };    
        
  /*  fbutil.ref('recurringDeals').push($scope.newDeal, function(){
          $scope.displayOptions.mainTab='mydeals';
          $scope.displayOptions.viewDealsType='recurring';
          $scope.$apply();
            
            if ($rootScope.userOptions.superadmin != 'yes'){
                mixpanel.track("Add Recurring Deal", { "user": $scope.newDeal.locName+": "+$rootScope.userOptions.email });
                mixpanel.track($scope.newDeal.locName, { "deal": "deal: "+$scope.newDeal.name+" exclusive: "+$scope.newDeal.exclusive+" user: "+$rootScope.userOptions.email });
                //console.log("email: "+$rootScope.userOptions.email);
                //console.log("deal: "+$scope.newDeal.name);
                //console.log("business: "+$scope.newDeal.locName);
                //console.log("days: "+$scope.newDeal.daysOfWeek);
                //console.log("exclusive: "+$scope.newDeal.exclusive);
            }
        });    */
        
     $scope.payCustom = function(bizID, purchaseAd){
        var amount = purchaseAd*10;
        
         if (purchaseAd > 99){
            if ($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan != undefined){
                var adTotal = parseInt(purchaseAd) + parseInt($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan.adCount);

                commenceHandler({dataset:{
                  name: "MealSteals",
                  key: commenceKey,
                  description: 'One-time payment',
                  zipCode: true,
                  amount: amount,//$("#amount").val()
                  callback: function(charge){
                        alert('email sent to '+charge.receipt_email);
                        alert('created at'+charge.created*1000);
                        alert(charge.outcome.seller_message);
                        alert(charge.status);
                        console.log(charge);
                        $scope.historyObject = {createdAt: charge.created*1000, payment: amount, ads: purchaseAd};
                        fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                        //fbutil.ref('businesses', bizID, 'currentPlan').update({createdAt:charge.created*1000});
                        fbutil.ref('businesses', bizID, 'currentPlan').update({adCount:adTotal}); 
                        console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan);
                        $scope.displayOptions.mainTab='adspace';
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
                        alert('email sent to '+charge.receipt_email);
                        alert('created at'+charge.created*1000);
                        alert(charge.outcome.seller_message);
                        alert(charge.status);
                        console.log(charge);
                        $scope.historyObject = {createdAt: charge.created*1000, payment: amount, ads: purchaseAd};
                        fbutil.ref('businesses', bizID, 'currentPlan', 'upgradeHistory').push($scope.historyObject);
                        //fbutil.ref('businesses', bizID, 'currentPlan').update({createdAt:charge.created*1000});
                        fbutil.ref('businesses', bizID, 'currentPlan').update({adCount:purchaseAd}); 
                        $scope.displayOptions.mainTab='adspace';
                    }
                }});
            }
         } 
    };        
        
    $scope.payPlus = function(){
      //console.log('payment'); 
        
        commenceHandler({dataset:{
          name: "MealSteals",
          key: commenceKey,
          description: 'Plus',
          plan: "pluspackage",
          zipCode: true,
          amount: 7900//$("#amount").val()
        }});    
    };    
        
    $scope.payStarter = function(){
      //console.log('payment'); 
        
        commenceHandler({dataset:{
          name: "MealSteals",
          key: commenceKey,
          description: 'Starter',
          plan: "starterpackage",
          zipCode: true,
          amount: 5900//$("#amount").val()
        }});    
    };    
        
    $scope.openTransactionHistory = function (bizID, bizObj) {
      //console.log(bizID);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'home/transaction.html',
        controller: 'TransactionCtrl',
        size: 'lg',
        resolve: {
          bizID: function () {
            return bizID;
          },
          bizObj: function () {
            return bizObj;
          }
        }
      });    
    };  
            
       
    $scope.loadImages = function(){
        
        //$scope.flashDeals = $firebaseArray(fbutil.ref('deals').orderByChild('recurringDealID').equalTo(undefined));
        
        
    }
        
    
    $scope.options = {
      types: ['establishment'],
      componentRestrictions: { country: 'US' }
    }
    
    // screaming tuna, scaffidi's, stubbys
    var placeIds = ['ChIJyQySJqMZBYgRbG6HPTLN-e4', 'ChIJpSuLwx4ZBYgRQGc4brwz2Kg', 'ChIJS6mobh8ZBYgRYD2oELl5fIo'];
    
    $scope.addPlace = function(place, lat, lon, city, state){
        
        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].placeId)){
            $scope.saveProfile(place);
        }else{

            if (place) {
                  //this is where it would check our ids in our database
               if (place.place_id != undefined) {
                    if (angular.isUndefined($scope.places[place.place_id])) {
                        $scope.saveProfile(place);
                        console.log(place);
                    } else {

                        $scope.addBizMessage = place.name+' taken';
                        alert('business already taken');
                    }

               } else {
                   $scope.addBizMessage = 'Not a valid bar or restaurant';
                   alert('not a valid bar or restaurant');
               }
            }  
        }
    };
    
    $scope.clearMessage = function() {
        
        $scope.addBizMessage = '';
    };
    
    
    $scope.deleteBiz = function(biz){
        
        var id = $scope.displayOptions.currentLoc;
        
        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].placeId)){
            fbutil.ref('adminAnalytics/places/',$rootScope.bizInfo[$scope.displayOptions.currentLoc].placeId).remove();
        }
          
        
        var recurring = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo(id));
        var deals = $firebaseArray(fbutil.ref('deals').orderByChild('businessID').equalTo(id));
        var users = $firebaseArray(fbutil.ref('users'));
        
        
        recurring.$loaded().then(function(){
            angular.forEach(recurring, function(rec){

                if(rec.businessID == id){
                    fbutil.ref('recurringDeals/' + rec.$id).remove();
                }

            });
            console.log('removed recurring');
        });
        
        deals.$loaded().then(function(){
             angular.forEach(deals, function(deal){

                if(deal.businessID == id){
                    fbutil.ref('deals/' + deal.$id).remove();
                }

            });
            console.log('removed deals');
        });
        
        users.$loaded().then(function(){
             angular.forEach(users, function(user){

                if(!angular.isUndefined(user.bizIDs) && !angular.isUndefined(user.bizIDs[id])){
                    fbutil.ref('users', user.$id, 'bizIDs', id).remove();
                }

            });
            console.log('removed access in users');
        });
        
    
        fbutil.ref('businesses/' + id).remove();
        fbutil.ref('allBizIDs/' + id).remove();
        
        console.log('removed business');
    }
        
        
    $scope.verifyImage = function(deal){
      
        
          
        if(!angular.isUndefined($scope.deal.recurringDealID)){
            $rootScope.mealsteals.child('/recurringDeals/' + deal.recurringDealID + '/sharedImages/' + timeID + '/').set({
            'user': $rootScope.authUserData.uid,
            'url':  url,
            'verified': false
            });
        }else{
            $rootScope.mealsteals.child('/todaysDeals/' + startDate + '/' + deal.key + '/sharedImages/' + timeID + '/').set({
            'user': $rootScope.authUserData.uid,
            'url':  url,
            'verified': false
            });
            $rootScope.mealsteals.child('/todaysDeals/' + endDate + '/' + deal.key + '/sharedImages/' + timeID + '/').set({
            'user': $rootScope.authUserData.uid,
            'url':  url,
            'verified': false
            });
        
        
    };
    
        
    /*
    $scope.hoverDash = function(){
        $(".dash").removeClass("hide");
    }; 
        
    $scope.unHoverDash = function(){
        $(".dash").addClass("hide");
    };
        
     $scope.hoverProfile = function(){
        $(".profile").removeClass("hide");
    }; 
        
    $scope.unHoverProfile = function(){
        $(".profile").addClass("hide");
    };
        
     $scope.hoverDeals = function(){
        $(".deals").removeClass("hide");
    }; 
        
    $scope.unHoverDeals = function(){
        $(".deals").addClass("hide");
    };
        
     $scope.hoverAdd = function(){
        $(".add").removeClass("hide");
    }; 
        
    $scope.unHoverAdd = function(){
        $(".add").addClass("hide");
    };
    */

        
    $scope.restoreDeals = function(){
        
//        var ref = new Firebase('https://mealsteals.firebaseio.com/deals').orderByChild('startTime').limitToLast(250);
//        var deals = $firebaseObject(ref);
//        
//        var time = new Date();
//        var stamp = time.getTime();
//        var day = moment(time).format("YYYYMMDD");
//        var todaysDeals = [];
//        
//        
//        
//        deals.$loaded().then(function(){
//            angular.forEach(deals, function(deal){
//                
//                var dealTime = new Date(deal.startTime);
//                var dealDay = parseInt(moment(dealTime).format("YYYYMMDD"));
//                
//                if(day == dealDay){
//                    
////                    todaysDeals.push(deal);
////                    console.log(deal);
//                    
//                    fbutil.ref('todaysDeals/' + deal.key).set(deal);
//                }
//                
//                
//            });
//            
//            //console.log(todaysDeals);
//            console.log('finished adding');
//        });
//        
        //fbutil.ref('todaysDeals/').set(null);
        
        
    };
            
//         setInterval(function() {
//
//        
//            function convertToUnixOffset(startClockTime, endClockTime, timezone){
//  // We assume that this function is running on the same day as when the deal is supposed to start
//
//  // startClockTime and endClockTime should be in format: "HH:mm" (this is 24-hour format)
//
//  var nowMoment = moment().tz(timezone);
//
//  var startTimeString = nowMoment.format('YYYY-MM-DD') + ' ' + startClockTime;
//  var endTimeString = nowMoment.format('YYYY-MM-DD') + ' ' + endClockTime;
//
//  var startMoment = moment.tz(startTimeString, timezone);
//  var endMoment = moment.tz(endTimeString, timezone);
//
//  if (startMoment.valueOf() > endMoment.valueOf()){
//    // this covers instances like deals that go from 10pm - 2am
//    endMoment.add(1, 'days');
//  }
//
//  return [startMoment.valueOf(), endMoment.valueOf()];
//}
//
//var ref = new Firebase('https://mealsteals.firebaseio.com/recurringDeals');
//
//var geoFire = new GeoFire(new Firebase('https://mealsteals.firebaseio.com/dealGeoFireKeys'));
//    
//
//    ref.once("value", function(snapshot) {
//
//
//      var numChildren = snapshot.numChildren();
//      var numChecked = 0;
//      if (numChecked == numChildren){
//          // process.exit();
//      }
//
//      snapshot.forEach(function(childSnapshot) {
//        var key = childSnapshot.key();
//        var d = childSnapshot.val();
//
//          if(!angular.isUndefined(d.timezone)){
//        var currentDay = moment().tz(d.timezone).format('dddd').toLowerCase();
//          }
//
//        // If we have a day match
//        if (!angular.isUndefined(d.daysOfWeek) && d.daysOfWeek[currentDay] =='yes'){
//            // then lets add it in NOW (assuming it hasn't been added already).
//            // this way it will appear in the business's dashboard as a current deal that will start later in the day
//
//            var startClockTime = moment(d.startTime).tz(d.timezone).format('HH:mm');
//            var endClockTime = moment(d.endTime).tz(d.timezone).format('HH:mm');
//            var timeRange = convertToUnixOffset(startClockTime, endClockTime, d.timezone);
//            var startTime = timeRange[0];
//            var endTime = timeRange[1];
//
//            var subRef = (new Firebase('https://mealsteals.firebaseio.com/deals')).orderByChild('recurringDealID').equalTo(key);
//            subRef.once('value', function(subSnapshot){
//                var subNumChildren = subSnapshot.numChildren();
//                var subNumChecked = 0;
//                if (subNumChildren > 0){
//                    var found = false;
//                    var foundKeys = [];
//                    subSnapshot.forEach(function(subChildSnapshot){
//                        var subD = subChildSnapshot.val();
//
//                        if (subD.startTime == startTime && subD.endTime == endTime){
//                            found = true;
//                            foundKeys.push(subD.key);
//                        } else {
//                            // do nothing
//                        }
//
//                        subNumChecked += 1;
//                        if (subNumChecked == subNumChildren){
//                            if (found==true){
//                                // then we don't need to add a deal
//                                numChecked += 1;
//                                if (numChecked == numChildren){
//                                    // process.exit();
//                                }
//                                if (foundKeys.length > 1){
//                                    console.log('found duplicates...');
//                                    for (var ii = 0; ii < foundKeys.length - 1; ii++) {
//                                      console.log('deleting deal with key ' + foundKeys[ii]);
//                                      geoFire.remove(foundKeys[ii]);
//                                      (new Firebase('https://mealsteals.firebaseio.com/deals')).child(foundKeys[ii]).remove();
//                                    }
//                                }
//                            } else {
//                                // we need to add the deal then
//                                var addThisDeal = JSON.parse(JSON.stringify(d));
//                                
//                               
//                                if(!angular.isUndefined(d.boosts) && d.boosts > 0){
//                                    var newTotal = parseInt(d.boosts) - 1;
//                                    ref.child('/' + key + '/boosts').set(newTotal);
//                                    addThisDeal.boost = true;
//                                }
//                                
//                                delete addThisDeal.daysOfWeek;
//                                addThisDeal.startTime = startTime;
//                                addThisDeal.endTime = endTime;
//                                addThisDeal.recurringDealID = key;
//                                addThisDeal.lat = parseFloat(addThisDeal.lat);
//                                addThisDeal.lon = parseFloat(addThisDeal.lon);
//                                console.log('addThisDeal');
//                                console.log(addThisDeal);
//                                if(angular.isUndefined(addThisDeal.approved) || addThisDeal.approved!=false){
//                                    var dealsRef = new Firebase('https://mealsteals.firebaseio.com/deals');
//                                    var newDealKey = dealsRef.push().key();
//                                    addThisDeal.key = newDealKey;
//                                    dealsRef.child(newDealKey).set(addThisDeal, function(err){
//                                        geoFire.set(newDealKey, [addThisDeal.lat, addThisDeal.lon]);
//                                        console.log('adding', newDealKey);
//                                        var end = new Date(endTime);
//                                        var endDay = parseInt(moment(end).format("YYYYMMDD"));
//                                        var time = new Date();
//                                        var day = parseInt(moment(time).format("YYYYMMDD"));
//                                        console.log(day);
//                                        ref.child( key + '/deals/' + day).set(newDealKey);
//                                        fbutil.ref('todaysDeals/'  + day + '/' + newDealKey).set(addThisDeal);
//                                        fbutil.ref('todaysDeals/'  + endDay + '/' + newDealKey).set(addThisDeal);
//                                        numChecked += 1;
//                                        if (numChecked == numChildren){
//                                            // process.exit();
//                                        }
//                                    });
//                                } else {
//                                    numChecked += 1;
//                                }
//                            }
//
//                                    
//                        }
//                    });
//                } else {
//                    // then we definitely need to add this deal for today
//                    var addThisDeal = JSON.parse(JSON.stringify(d));
//                    
//                    
//                    if(!angular.isUndefined(d.boosts) && d.boosts > 0){
//                        var newTotal = parseInt(d.boosts) - 1;
//                        ref.child('/' + key + '/boosts').set(newTotal);
//                        addThisDeal.boost = true;
//                    }
//                    
//                    delete addThisDeal.daysOfWeek;
//                    addThisDeal.startTime = startTime;
//                    addThisDeal.endTime = endTime;
//                    addThisDeal.recurringDealID = key;
//                    addThisDeal.lat = parseFloat(addThisDeal.lat);
//                    addThisDeal.lon = parseFloat(addThisDeal.lon);
//                    if(angular.isUndefined(addThisDeal.approved) || addThisDeal.approved!=false){
//                        var dealsRef = new Firebase('https://mealsteals.firebaseio.com/deals');
//                        var newDealKey = dealsRef.push().key();
//                        addThisDeal.key = newDealKey;
//                        dealsRef.child(newDealKey).set(addThisDeal, function(err){
//                            geoFire.set(newDealKey, [addThisDeal.lat, addThisDeal.lon]);
//                            console.log('addThisDeal');
//                            console.log(addThisDeal);
//                            console.log('adding', newDealKey);
//                            var end = new Date(endTime);
//                            var endDay = parseInt(moment(end).format("YYYYMMDD"));
//                            var time = new Date();
//                            var day = parseInt(moment(time).format("YYYYMMDD"));
//                            console.log(day);
//                            ref.child( key + '/deals/' + day).set(newDealKey);
//                            fbutil.ref('todaysDeals/'  + day + '/' + newDealKey).set(addThisDeal);
//                            fbutil.ref('todaysDeals/'  + endDay + '/' + newDealKey).set(addThisDeal);
//                            numChecked += 1;
//                            if (numChecked == numChildren){
//                                // process.exit();
//                            }
//                        });
//                    } else{
//                        numChecked += 1;
//                    }
//                }
//                    
//            });
//
//        } else {
//            numChecked += 1;
//            if (numChecked == numChildren){
//                // process.exit();
//            }
//        }
//        
//        
//
//      });
//
//    });
//
//
//
//}, 60 * 1000); // 60 * 1000 milsec
//


            
       // }
        
        
        
//        
//    setInterval(function() {
//        
//        var time = new Date();
//        var day = moment(time).format("YYYYMMDD");
//        
//        
//        var updateRunning = $firebaseArray(fbutil.ref('todaysDeals/', day));
//
//        updateRunning.$loaded(function(data){
//            
//            angular.forEach(updateRunning, function(deal){
//            
//                
//                angular.forEach(updateRunning, function(deal2){
//
//                    if(!angular.isUndefined(deal.recurringDealID) && deal.recurringDealID == deal2.recurringDealID){
//                        if(deal.$id != deal2.$id){
//                            
//
//                                var date = new Date();
//                                var time = date.getTime();
//                                var nowTime = parseInt(moment(time).format('HHMMSS'));
//
//                                  if(deal.startTime < time && deal.endTime > time){
//
//                                    console.log('duplicate');
//                                    console.log(deal);
//                                    console.log(deal2);
//                                      fbutil.ref('todaysDeals/', day,deal2.$id).remove();
//                                  }
//                             
//                            
//                        }
//                    }
//                    
//
//                });
//                
//            });
//            
//        });
//      
//        
//
//    }, 60 * 1000); // 60 * 1000 milsec
//
//        
//        
        
        
        
        
        
        
        
        
        
        
  }]);
    
    

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.whenAuthenticated('/home', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl',
      resolve: {
        // forces the page to wait for this promise to resolve before controller is loaded
        // the controller can then inject `user` as a dependency. This could also be done
        // in the controller, but this makes things cleaner (controller doesn't need to worry
        // about auth status or timing of accessing data or displaying elements)
        user: ['Auth', function (Auth) {
          return Auth.$waitForAuth();
        }]
      }
    });
  }]);

    
    
    
})(angular);
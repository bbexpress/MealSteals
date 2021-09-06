(function(angular) {
  "use strict";

  var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services']);

  app.controller('EditDealCtrl', function ($scope, $uibModalInstance, $q, Upload, $timeout, dealID, type, $firebaseObject, fbutil, convertToUnixOffset) {

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

                file.upload = Upload.upload({
                  url: 'http://s3.amazonaws.com/mealstealsyes', //S3 upload url including bucket name
                  method: 'POST',
                  fields : {
                    key: $scope.timeID + saveToKey + file.name, // the key to store the file on S3, could be file name or customized
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
                        saveTo[saveToKey] = 'http://s3.amazonaws.com/mealstealsyes/' + $scope.timeID + saveToKey + file.name;
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
        var startClockTime = moment($scope.dealObj.startTime).tz($scope.dealObj.timezone).format('HH:mm');
        var endClockTime = moment($scope.dealObj.endTime).tz($scope.dealObj.timezone).format('HH:mm');
        var startTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + startClockTime);
        var endTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + endClockTime);
        $scope.dealObj.startTime = new Date(startTimeOffset);
        $scope.dealObj.endTime = new Date(endTimeOffset);
      });
    } else if (type=='actual'){
      $scope.dealObj = $firebaseObject(fbutil.ref('deals/' + dealID));
      $scope.dealObj.$loaded().then(function(){
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

      var timeRange = convertToUnixOffset(startClockTime, endClockTime, $scope.dealObj.timezone);

      $scope.dealObj.startTime = timeRange[0];
      $scope.dealObj.endTime = timeRange[1];

      $scope.dealObj.$save();

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
    function ($scope, $rootScope, $q, fbutil, user, $firebaseObject, $firebaseArray, FBURL, Upload, $timeout, AccountBase, $uibModal) {
    
    AccountBase.init(user);

    $scope.timezones = moment.tz.names();

    $rootScope.bizIDs.$loaded().then(function(bizIDs){
      if (bizIDs.length > 0) $scope.chooseLocation(bizIDs[0].$id);
    });

    $scope.displayOptions = {
      'section': 'locView',
      'currentLoc': null,
      'mainTab': 'profile',
      'viewDealsType': 'actual'
    };

    $scope.user = user;

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
          // $scope.displayOptions.mainTab = 'profile';
          $scope.loadMyDeals();
          $scope.startNewDeal();
    };
    
    $scope.saveProfile = function(){
      $rootScope.bizInfo[$scope.displayOptions.currentLoc].$save().then(function(){
        // alert('Saved!');

        // now update any recurring deals with new information

        $scope.myRecurringDeals.forEach(function(mrd){
          mrd.address = $rootScope.bizInfo[$scope.displayOptions.currentLoc].address;
          mrd.lat = parseFloat($rootScope.bizInfo[$scope.displayOptions.currentLoc].lat);
          mrd.lon = parseFloat($rootScope.bizInfo[$scope.displayOptions.currentLoc].lon);
          mrd.locName = $rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName;
          mrd.phone = $rootScope.bizInfo[$scope.displayOptions.currentLoc].phone;
          mrd.timezone = $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone;
          mrd.icon = $rootScope.bizInfo[$scope.displayOptions.currentLoc].icon;
          mrd.largeImg = $rootScope.bizInfo[$scope.displayOptions.currentLoc].detailBackground;
        });
        $scope.myRecurringDeals.$save();        
      });
    };

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
        startTime: new Date(),
        endTime: new Date(),
        foodOrDrink: 'food',
        exclusive: 'no',
        timeType: 'nightlyspecial',
        redeemable: 'no',
        businessID: $scope.displayOptions.currentLoc
      };
    };

    function convertToUnixOffset(startClockTime, endClockTime, timezone){
      // We assume that this function is running on the same day as when the deal is supposed to start

      // startClockTime and endClockTime should be in format: "HH:mm" (this is 24-hour format)

      var nowMoment = moment().tz(timezone);

      var startTimeString = nowMoment.format('YYYY-MM-DD') + ' ' + startClockTime;
      var endTimeString = nowMoment.format('YYYY-MM-DD') + ' ' + endClockTime;

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

    $scope.addNewDeal = function(){

      $scope.newDeal.lat = parseFloat($scope.newDeal.lat);
      $scope.newDeal.lon = parseFloat($scope.newDeal.lon);

      if ($scope.newDeal.type == 'recurring'){

        delete $scope.newDeal.type;

        var startClockTime = moment($scope.newDeal.startTime.getTime()).format('HH:mm');
        var endClockTime = moment($scope.newDeal.endTime.getTime()).format('HH:mm');

        var timeRange = convertToUnixOffset(startClockTime, endClockTime, $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone);

        $scope.newDeal.startTime = timeRange[0];
        $scope.newDeal.endTime = timeRange[1];

        $scope.newDeal.timezone = $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone;

        // create recurring template
        fbutil.ref('recurringDeals').push($scope.newDeal, function(){
          $scope.displayOptions.mainTab='mydeals';
          $scope.displayOptions.viewDealsType='recurring';
          $scope.$apply();
        });

      } else {

        delete $scope.newDeal.type;
        delete $scope.newDeal.daysOfWeek;

        var startClockTime = moment($scope.newDeal.startTime.getTime()).format('HH:mm');
        var endClockTime = moment($scope.newDeal.endTime.getTime()).format('HH:mm');

        var timeRange = convertToUnixOffset(startClockTime, endClockTime, $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone);

        $scope.newDeal.startTime = timeRange[0];
        $scope.newDeal.endTime = timeRange[1];
        $scope.newDeal.timezone = $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone;

        $scope.newDeal.lat = parseFloat($scope.newDeal.lat);
        $scope.newDeal.lon = parseFloat($scope.newDeal.lon);

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

      }

    };

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

    $scope.loadMyDeals = function(){

      $scope.myDeals = $firebaseArray(fbutil.ref('deals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));
    
      $scope.myRecurringDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));
    
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

                file.upload = Upload.upload({
                  url: 'http://s3.amazonaws.com/mealstealsyes', //S3 upload url including bucket name
                  method: 'POST',
                  fields : {
                    key: $scope.timeID + saveToKey + file.name, // the key to store the file on S3, could be file name or customized
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
                        saveTo[saveToKey] = 'http://s3.amazonaws.com/mealstealsyes/' + $scope.timeID + saveToKey + file.name;
                        $rootScope.bizInfo[$scope.displayOptions.currentLoc].$save();
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

    $scope.removeUserAccess = function(email, bizID){

      // look up uid from email
      $firebaseObject(fbutil.ref('emails', email.replace('.', ','))).$loaded().then(function(o){
        var uid = o.uid;

        var comma_email = email.replace('.', ',');

        // add userid and email to business object
        fbutil.ref('businesses', bizID, 'userids').update({uid:null});
        fbutil.ref('businesses', bizID, 'emails').update({comma_email:null});

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
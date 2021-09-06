(function(angular) {
  "use strict"; 

  var app = angular.module('myApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services', 'vsGoogleAutocomplete'
                                         // , 'gm','initialValue', 'auto-value'
                                         ]);

  app.controller('EditDealCtrl', function ($scope, $uibModalInstance, $rootScope, $q, Upload, $timeout, thisDeal, type, $firebaseObject, $firebaseArray, fbutil, convertToUnixOffset) {
// $ionicActionSheet, $firebaseObject, AccountBase, Upload, CordovaCamera, Auth, $state, $q, $cordovaToast, $ionicLoading
    console.log(thisDeal);
    console.log(type);

    $scope.selectMonday = function() {
          if ($scope.dealObj.daysOfWeek.monday=='no'){
              $scope.dealObj.daysOfWeek.monday='yes';
          } else {
              $scope.dealObj.daysOfWeek.monday='no';
          }
      }

      $scope.selectTuesday = function() {
          if ($scope.dealObj.daysOfWeek.tuesday=='no'){
              $scope.dealObj.daysOfWeek.tuesday='yes';
          } else {
              $scope.dealObj.daysOfWeek.tuesday='no';
          }
      }

      $scope.selectWednesday = function() {
          if ($scope.dealObj.daysOfWeek.wednesday=='no'){
              $scope.dealObj.daysOfWeek.wednesday='yes';
          } else {
              $scope.dealObj.daysOfWeek.wednesday='no';
          }
      }

      $scope.selectThursday = function() {
          if ($scope.dealObj.daysOfWeek.thursday=='no'){
              $scope.dealObj.daysOfWeek.thursday='yes';
          } else {
              $scope.dealObj.daysOfWeek.thursday='no';
          }
      }

      $scope.selectFriday = function() {
          if ($scope.dealObj.daysOfWeek.friday=='no'){
              $scope.dealObj.daysOfWeek.friday='yes';
          } else {
              $scope.dealObj.daysOfWeek.friday='no';
          }
      }

      $scope.selectSaturday = function() {
          if ($scope.dealObj.daysOfWeek.saturday=='no'){
              $scope.dealObj.daysOfWeek.saturday='yes';
          } else {
              $scope.dealObj.daysOfWeek.saturday='no';
          }
      }

      $scope.selectSunday = function() {
          if ($scope.dealObj.daysOfWeek.sunday=='no'){
              $scope.dealObj.daysOfWeek.sunday='yes';
          } else {
              $scope.dealObj.daysOfWeek.sunday='no';
          }
      }

      $scope.selectExclusive = function() {
          if ($scope.dealObj.exclusive=='no'){
              $scope.dealObj.exclusive='yes';
          } else {
              $scope.dealObj.exclusive='no';
          }
      }

      $scope.selectRedeemable = function() {
          if ($scope.dealObj.redeemable=='no'){
              $scope.dealObj.redeemable='yes';
          } else {
              $scope.dealObj.redeemable='no';
          }
      }
    
//  $scope.startEdit = function (){ 
    console.log('in start edit');
        
          if(!angular.isUndefined(thisDeal.daysOfWeek)){
               $scope.dealObj = $firebaseObject(fbutil.ref('recurringDeals/', thisDeal.$id));
                $scope.dealObj.$loaded().then(function(){ 
                     if($scope.dealObj.timeType !='deal' && $scope.dealObj.timeType != 'event'){
                          console.log('in if');
                          $scope.dealObj.timeType = 'deal';
                      }
                    
                      if(!$scope.dealObj.tags){
                          $scope.dealObj.tags = [];
                      }
                    console.log($scope.dealObj);
                    console.log('is recurring');
                    $scope.recurringCheck = true;

                    var startdate = new Date($scope.dealObj.startTime);
                    var enddate = new Date($scope.dealObj.endTime);



                    $scope.dealObj.date = new Date();

                    var zone = $scope.dealObj.timezone;
                    var startClockTime = moment(startdate).tz(zone).format('HH:mm');
                    var endClockTime = moment(enddate).tz(zone).format('HH:mm');
                    var startTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + startClockTime);
                    var endTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + endClockTime);
                    $scope.dealObj.startTime = new Date(startTimeOffset);
                    $scope.dealObj.endTime = new Date(endTimeOffset);
              });
          } else{
              $scope.dealObj = thisDeal;
               if($scope.dealObj.timeType !='deal' && $scope.dealObj.timeType != 'event'){
                      console.log('in if');
                      $scope.dealObj.timeType = 'deal';
                  }
              
                if(!$scope.dealObj.tags){
                    $scope.dealObj.tags = [];
                }
                $scope.recurringCheck = false;
              
                var time = new Date($scope.thisDeal.startTime);
                var day = moment(time).format("YYYYMMDD");
              
                $scope.dealObj = $firebaseObject(fbutil.ref('todaysDeals/', day , $scope.thisDeal.key));
                $scope.dealObj.$loaded().then(function(){ 

                    $scope.dealObj.date = new Date($scope.dealObj.startTime); 
                    console.log($scope.dealObj.date);
                    var startdate = new Date($scope.dealObj.startTime);
                    var enddate = new Date($scope.dealObj.endTime);

                    var startClockTime = moment(startdate).tz($scope.dealObj.timezone).format('HH:mm');
                    var endClockTime = moment(enddate).tz($scope.dealObj.timezone).format('HH:mm');
                    var startTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + startClockTime);
                    var endTimeOffset = moment(moment().format('YYYY-MM-DD') + ' ' + endClockTime);
                    $scope.dealObj.startTime = new Date(startTimeOffset);
                    $scope.dealObj.endTime = new Date(endTimeOffset);
                });
            
          }
     
//    }

    
    
    
    
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
           
           console.log(startTimeString);
           console.log(endTimeString);

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
    


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.hstep = 1;
    $scope.mstep = 15;

    $scope.ismeridian = true;


  $scope.loadImageGallery = function(){
      $scope.bizImages = $firebaseArray(fbutil.ref('businesses/'+$scope.dealObj.businessID+'/dealImages')); 
      console.log($scope.bizImages);
      $scope.modalImageGallery.show();
      alert ('Hold down on image to delete');
//      window.plugins.toast.showWithOptions({
//        message: "Hold down on image to delete",
//        duration: "short", // 2000 ms
//        position: "bottom",
//        styling: {
//          opacity: 0.8, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
//          backgroundColor: '#333333', // make sure you use #RRGGBB. Default #333333
//          textColor: '#FFFFFF', // Ditto. Default #FFFFFF
//          textSize: 13, // Default is approx. 13.
//          //cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
//          //horizontalPadding: 20, // iOS default 16, Android default 50
//          //verticalPadding: 16 // iOS default 12, Android default 30
//        }
//      });
  };  
    
  $scope.selectImage = function(img) {
       $scope.dealObj.dealFullImage = img.largeImage;
      //$scope.newDeal.img = img.smallImage;
      $scope.modalImageGallery.hide();
  };
   
  $scope.showDeleteButton = false;    
  $scope.holding = false;
  $scope.holdGalleryButton = function(){
    $scope.holding = true;
    $timeout(function(){
        if ($scope.holding==true){
            $scope.showDeleteButton = true;
        }
    },1000);
  };
  $scope.releaseGalleryButton = function(){
    $scope.holding = false;
  }; 
    
  $scope.hideDeleteButton = function(){
      $scope.showDeleteButton = false;
  }

  $scope.deleteGalleryImage = function(img){
    var bizID = $scope.dealObj.businessID;
    fbutil.ref('businesses', bizID, 'dealImages', img.$id).set(null);      
  };
    
//    
//   $ionicModal.fromTemplateUrl('add/image-gallery.html', {
//        scope: $scope
//      }).then(function(modal) {
//        $scope.modalImageGallery = modal;
//   });

   $scope.closeImageGallery = function() {
    $scope.modalImageGallery.hide();
   };
    

      
      
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

    $scope.uploadFilesEdit = function(file, saveToKey, maxWidth, maxHeight) {
        $scope.f = file;
        if (file && !file.$error) {
            $scope.loadingImage = true;

            
            
            var newWidth = file.width;
            var newHeight = file.height;

//            if (maxWidth){
//              if (maxHeight){
//                // if both are set, we force resize
//                if (file.width > maxWidth || file.height > maxHeight){
//                  newWidth = maxWidth;
//                  newHeight = maxHeight;
//                }
//              } else {
//                if (file.width > maxWidth){
//                  newWidth = maxWidth;
//                  newHeight = Math.round(file.height * (newWidth / file.width));
//                }
//              }
//            }    

            var reader  = new FileReader();
            reader.onloadend = function () {
              imageToDataUri(reader.result, file.width, file.height, newWidth, newHeight).then(function(hmm){

                var newBlob = dataURItoBlob(hmm);

                  console.log(file.name);
                  
                  var fileName = file.name.replace(' ', '_');
                  var key = $scope.timeID + saveToKey;
                  console.log(file.name);
                  $scope.timeID = String(new Date().getTime());
                file.upload = Upload.upload({
                  url: 'http://s3.amazonaws.com/mealstealsyes', //S3 upload url including bucket name
                  method: 'POST',
                  fields : {
                    key: key, // the key to store the file on S3, could be file name or customized
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

                    $scope.newImage = "http://s3.amazonaws.com/mealstealsyes/" + key;

                    //$scope.newDeal.img = "http://s3.amazonaws.com/mealstealsyes/" + key;
                    $scope.dealObj.largeImg = "http://s3.amazonaws.com/mealstealsyes/" + key;
                    $scope.dealObj.detailBackgroundFull = "http://s3.amazonaws.com/mealstealsyes/" + key;
                        
                    $scope.dealObj[saveToKey] = $scope.newImage;
                         console.log($scope.dealObj.dealFullImage);

                    $scope.imageObject = {largeImage: $scope.newImage};
                    var bizID = $scope.currentLoc['id'];
                    fbutil.ref('businesses', bizID, 'dealImages').push($scope.imageObject);
//                    $ionicLoading.show({
//                          template: 'Uploading...',
//                          duration: 3000
//                    });
                        
                        
                        
                        
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
    
    
    
    
    
    
    
    
    
    $scope.addDealObj = function(){
        
        if($scope.dealObj.timeType == "event"){
            delete $scope.dealObj.foodOrDrink;
        }
        
      var startdate = new Date($scope.dealObj.startTime);
      var enddate = new Date($scope.dealObj.endTime);
  
      var startClockTime = moment(startdate.getTime()).format('HH:mm');
      var endClockTime = moment(enddate.getTime()).format('HH:mm');
        
      var date = new Date();
      var time = date.getTime();
        
      var todayDate = moment(time).format('YYYYMMDD');

        if(!angular.isUndefined($scope.dealObj.date)){
            console.log($scope.dealObj.date);
          //$scope.dealObj.date = new Date($scope.dealObj.date);

          $scope.dealDate = moment($scope.dealObj.date.getTime()).format('YYYY-MM-DD'); 
        }
      var timeRange = convertToUnixOffset(startClockTime, endClockTime, $scope.dealObj.timezone, $scope.dealDate);

      $scope.dealObj.startTime = timeRange[0];
      $scope.dealObj.endTime = timeRange[1];
        
      console.log($scope.dealObj);
      
        if($scope.recurringCheck == true){
            $scope.dealObj.$save();
            if(!angular.isUndefined($scope.dealObj.deals) && !angular.isUndefined($scope.dealObj.deals[todayDate])){
                
//Recurring
//                
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id, '/dealFullImage').set($scope.dealObj.dealFullImage);
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/description').set($scope.dealObj.description);
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/endTime').set($scope.dealObj.endTime);
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/exclusive').set($scope.dealObj.exclusive);
//                if(!angular.isUndefined($scope.dealObj.foodOrDrink)){
//                    fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/foodOrDrink').set($scope.dealObj.foodOrDrink);
//                }else{
//                    fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/foodOrDrink').remove();
//                }
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id, '/featured').set($scope.dealObj.featured);
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/name').set($scope.dealObj.name);
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id, '/redeemable').set($scope.dealObj.redeemable);
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/timeType').set($scope.dealObj.timeType);
//                if(!angular.isUndefined($scope.dealObj.type)){
//                    fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/type').set($scope.dealObj.type);
//                }
//                if(!angular.isUndefined($scope.dealObj.date)){
//                    fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/date').set($scope.dealObj.date);
//                }
//                fbutil.ref('recurringDeals/', $scope.dealObj.$id , '/startTime').set($scope.dealObj.startTime);
                
//          Recurring End      
                
                
                
                var time = new Date($scope.dealObj.startTime);
                var day = moment(time).format("YYYYMMDD");
                var end = new Date($scope.dealObj.endTime);
                var verifyEnd = moment(end.getTime()).format('YYYYMMDD');

                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/dealFullImage').set($scope.dealObj.dealFullImage);
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/description').set($scope.dealObj.description);
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/endTime').set($scope.dealObj.endTime);
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/exclusive').set($scope.dealObj.exclusive);
                if(!angular.isUndefined($scope.dealObj.foodOrDrink)){
                    fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/foodOrDrink').set($scope.dealObj.foodOrDrink);
                }else{
                    fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/foodOrDrink').remove();
                }
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/featured').set($scope.dealObj.featured);
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/name').set($scope.dealObj.name);
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/redeemable').set($scope.dealObj.redeemable);
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/timeType').set($scope.dealObj.timeType);
                if(!angular.isUndefined($scope.dealObj.type)){
                    fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/type').set($scope.dealObj.type);
                }
                if(!angular.isUndefined($scope.dealObj.date)){
                    fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/date').set($scope.dealObj.date);
                }
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.deals[todayDate] , '/startTime').set($scope.dealObj.startTime);

                if(verifyEnd != day){

                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/dealFullImage').set($scope.dealObj.dealFullImage);
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/description').set($scope.dealObj.description);
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/endTime').set($scope.dealObj.endTime);
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/exclusive').set($scope.dealObj.exclusive);
                    if(!angular.isUndefined($scope.dealObj.foodOrDrink)){
                        fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/foodOrDrink').set($scope.dealObj.foodOrDrink);
                    }else{
                        fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/foodOrDrink').remove();
                    }
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/featured').set($scope.dealObj.featured);
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/name').set($scope.dealObj.name);
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/redeemable').set($scope.dealObj.redeemable);
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/timeType').set($scope.dealObj.timeType);
                    if(!angular.isUndefined($scope.dealObj.type)){
                        fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/type').set($scope.dealObj.type);
                    }
                    if(!angular.isUndefined($scope.dealObj.date)){
                        fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/date').set($scope.dealObj.date);
                    }
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.deals[todayDate] , '/startTime').set($scope.dealObj.startTime);
                }
                
                
            }
            
            
            
            
            
        } else {
            
//            $scope.dealObj.$save();
            
            var time = new Date($scope.dealObj.startTime);
            var day = moment(time).format("YYYYMMDD");
            var end = new Date($scope.dealObj.endTime);
            var verifyEnd = moment(end.getTime()).format('YYYYMMDD');
            
            //fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day).set($scope.newDeal);
            
            //rewrite biz Flash
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day + '/key').set($scope.dealObj.$id);
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/dealFullImage').set($scope.dealObj.dealFullImage);
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/description').set($scope.dealObj.description);
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/endTime').set($scope.dealObj.endTime);
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/exclusive').set($scope.dealObj.exclusive);
            if(!angular.isUndefined($scope.dealObj.foodOrDrink)){
                fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/foodOrDrink').set($scope.dealObj.foodOrDrink);
            }else{
                fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/foodOrDrink').remove();
            }
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/featured').set($scope.dealObj.featured);
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/name').set($scope.dealObj.name);
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/redeemable').set($scope.dealObj.redeemable);
            if(!angular.isUndefined($scope.dealObj.timeType)){
                fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/timeType').set($scope.dealObj.timeType);
            }
            if(!angular.isUndefined($scope.dealObj.type)){
                fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/type').set($scope.dealObj.type);
            }
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/date').set($scope.dealObj.date);
            fbutil.ref('businesses/' + $scope.dealObj.businessID + '/flash/' + day +  '/startTime').set($scope.dealObj.startTime);
          

            
            //rewrite today deal
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/key').set($scope.dealObj.$id);
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/dealFullImage').set($scope.dealObj.dealFullImage);
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/description').set($scope.dealObj.description);
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/endTime').set($scope.dealObj.endTime);
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/exclusive').set($scope.dealObj.exclusive);
            if(!angular.isUndefined($scope.dealObj.foodOrDrink)){
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/foodOrDrink').set($scope.dealObj.foodOrDrink);
            }else{
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/foodOrDrink').remove();
            }
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/featured').set($scope.dealObj.featured);
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/name').set($scope.dealObj.name);
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/redeemable').set($scope.dealObj.redeemable);
            if(!angular.isUndefined($scope.dealObj.timeType)){
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/timeType').set($scope.dealObj.timeType);
            }
            if(!angular.isUndefined($scope.dealObj.type)){
                fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/type').set($scope.dealObj.type);
            }
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/date').set($scope.dealObj.date);
            fbutil.ref('todaysDeals/' , day , $scope.dealObj.$id , '/startTime').set($scope.dealObj.startTime);
          
            if(verifyEnd != day){
                
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/key').set($scope.dealObj.$id);
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/dealFullImage').set($scope.dealObj.dealFullImage);
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/description').set($scope.dealObj.description);
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/endTime').set($scope.dealObj.endTime);
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/exclusive').set($scope.dealObj.exclusive);
                if(!angular.isUndefined($scope.dealObj.foodOrDrink)){
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/foodOrDrink').set($scope.dealObj.foodOrDrink);
                }else{
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/foodOrDrink').remove();
                }
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/featured').set($scope.dealObj.featured);
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/name').set($scope.dealObj.name);
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/redeemable').set($scope.dealObj.redeemable);
                if(!angular.isUndefined($scope.dealObj.timeType)){
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/timeType').set($scope.dealObj.timeType);
                }
                if(!angular.isUndefined($scope.dealObj.type)){
                    fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/type').set($scope.dealObj.type);
                }
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/date').set($scope.dealObj.date);
                fbutil.ref('todaysDeals/' , verifyEnd , $scope.dealObj.$id , '/startTime').set($scope.dealObj.startTime);
            }
            console.log($scope.dealObj);
        }
        $uibModalInstance.close();
        
    }
    
    
        

      
    

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

//    $scope.hstep = 1;
//    $scope.mstep = 15;
//
//    $scope.ismeridian = true;

  });

  app.controller('HomeCtrl', ['$scope', '$rootScope', '$q', 'fbutil', 'user', '$firebaseObject', '$firebaseArray', 'FBURL', 'Upload', '$timeout', 'AccountBase', '$uibModal', '$mdDialog', 
    function ($scope, $rootScope, $q, fbutil, user, $firebaseObject, $firebaseArray, FBURL, Upload, $timeout, AccountBase, $uibModal, $uibModalInstance, $mdDialog, $window) {
        
    $scope.hideBanner = function() {
        $('#dash-banner').addClass('hide');  
    };
    
    AccountBase.init(user);
        
        
    $scope.places = $firebaseObject(fbutil.ref('adminAnalytics/places'));

    $scope.timezones = moment.tz.names();


    $scope.displayOptions = {
      //'section': 'main',
      'currentLoc': null,
      'topTab': 'dashboard',
      'mainTab': 'dashboard',
      'profileTopTab': 'profile',
      'campaignTopTab': 'manager',
      'analyticsTopTab': 'dashboard',
      'adminTopTab': 'dashboard',
      'viewDealsType': 'recurring',
      'viewDealsAdmin': 'all',
      'selectCity': 'all',
      'analyticsTab': 'users',
      'advancedOptions': 'hide'
    };
        
    $rootScope.bizIDs.$loaded().then(function(bizIDs){
      if (bizIDs.length == 0) {
            $scope.noCreatedBiz = true; 
            $scope.displayOptions.section = 'newLoc';
      } else {
          $scope.noCreatedBiz = false;
      }
        
      if (bizIDs.length > 0) {
          if ($rootScope.userOptions.superadmin == 'yes'){
              $scope.chooseLocation('-KlaR7zPlO6OvzprEd11');
          } else {
              $scope.chooseLocation(bizIDs[0].$id);
          }
      }

      //if (bizIDs.length > 0) $scope.chooseLocation(bizIDs[0].$id);
    });
        
    $scope.options = {
      types: ['establishment'],
      componentRestrictions: { country: 'US' }
    }
    
  
    $scope.startNewLoc = function() {
        $scope.newLocObj = {}
    };
        
    
   
    $scope.addPlace = function(place, lat, lon, city, state){
        if (!place) {
            alert('please enter valid business');
        }else if (place.name == place.formatted_address){
            alert('try clicking on drop down instead of pressing enter');
        } else{
            console.log(place);
              //this is where it would check our ids in our database
           if (place.place_id != undefined) {
                        if (!angular.isUndefined($scope.places[place.place_id])) {
                            $scope.displayOptions.section = 'locTaken';
                            $scope.takenBizObj = $firebaseArray(fbutil.ref('businesses').orderByChild('placeId').equalTo(place.place_id));
                            $scope.takenBizObj.$loaded().then(function () {
                                console.log($scope.takenBizObj[0]);
                            });
                        } else {
                            //alert('available!');
                            //$scope.displayOptions.section='basicProfile';
                            $scope.addNewLoc(place, lat, lon, city, state);
                        }                
           } else {
              alert('please select business from dropdown');
           }
        }  
    };
        
    $scope.addNewLoc = function(place, lat, lon, city, state){
      console.log(place);
      var locName = place.name;
      var newLocRef = fbutil.ref('users/' + user.uid + '/bizIDs').push();
      var newLocKey = newLocRef.key();

      var updateObj = {};
      updateObj['users/' + user.uid + '/bizIDs/' + newLocKey] = true;
      if (place.utc_offset == -360  || place.utc_offset == -300){
        updateObj['businesses/' + newLocKey] = {
          'businessName':locName, 
          'approved':false, 
          'lat': lat,
          'lon': lon,
          'placeId': place.place_id,
          'address': place.formatted_address,
          'phone': place.formatted_phone_number,
          'city': city,
          'state': state,
          'timezone': 'America/Chicago',
          'icon': "",
          'patio': false,
          'rooftop': false,
          'vegan': false,
          'games': false
          
        };
      } else {
          updateObj['businesses/' + newLocKey] = {
          'businessName':locName, 
          'approved':false, 
          'lat': lat,
          'lon': lon,
          'placeId': place.place_id,
          'address': place.formatted_address,
          'phone': place.formatted_phone_number,
          'city': city,
          'state': state,
          'timezone': 'America/Chicago',
          'icon': "",
          'patio': false,
          'rooftop': false,
          'vegan': false,
          'games': false
        };
      }
      updateObj['allBizIDs/' + newLocKey] = true;
      fbutil.ref().update(updateObj, function(error){
        //$scope.chooseLocation(newLocKey);  
           
          //$scope.displayOptions.section = 'locView';
          $scope.displayOptions.currentLoc = newLocKey;
          $rootScope.bizInfo[$scope.displayOptions.currentLoc].$loaded().then(function () {
              $scope.displayOptions.section = 'basicProfile';
              $scope.bizComplete = false;
              $scope.loadMyDeals();
              $scope.loadBizData();
              $scope.startNewDeal();
              $scope.clearAdDealSelected();
                /*console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc]);
                var bizObj = $rootScope.bizInfo[$scope.displayOptions.currentLoc];
                if (bizObj.address &&
                    //bizObj.icon &&
                    bizObj.businessName &&
                    bizObj.lat &&
                    bizObj.timezone
                   ) {
                    $scope.bizComplete = true;
                    $scope.displayOptions.section = 'main';
                } else {
                    $scope.bizComplete = false;
                    $scope.displayOptions.section = 'basicProfile';
                }*/
          });
          
       if ($rootScope.userOptions.superadmin != 'yes') {  
                            
                // parameters: service_id, template_id, template_parameters
                emailjs.send("sign_up","newSignupTemplate",{content: "email: "+$rootScope.userOptions.email+" business: "+locName, type: "New "+city+" Business Added", data: locName})
                .then(function(response) {
                   console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                }, function(err) {
                   console.log("FAILED. error=", err);
                });
            
                 // parameters: service_id, template_id, template_parameters
                emailjs.send("sign_up","business_welcome",{email: $rootScope.userOptions.email})
                .then(function(response) {
                   console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                }, function(err) {
                   console.log("FAILED. error=", err);
                });
        }
          
        $scope.$apply();
        $scope.displayOptions.section='basicProfile';
        $scope.noCreatedBiz = false;
        //$scope.addUserAccess($rootScope.userOptions.email, newLocKey);
      });
      fbutil.ref('adminAnalytics/places/',place.place_id).set(newLocKey);
    };    
        
    /*$scope.addNewLoc = function(locName){
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
        $scope.noCreatedBiz=false;
    };*/

    $scope.chooseLocation = function(bizID){
          //$scope.displayOptions.section = 'locView';
          $scope.displayOptions.currentLoc = bizID;
          $scope.loadMyDeals();
          $scope.loadBizData();
          $scope.startNewDeal();
          $scope.clearAdDealSelected();
          $rootScope.bizInfo[$scope.displayOptions.currentLoc].$loaded().then(function () {
                console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc]);
                var bizObj = $rootScope.bizInfo[$scope.displayOptions.currentLoc];
                if (
                    bizObj.address &&
                    bizObj.about &&
                    bizObj.contactName &&
                    bizObj.businessName &&
                    bizObj.lat &&
                    bizObj.timezone
                   ) {
                    $scope.bizComplete = true;
                    $scope.displayOptions.section = 'main';
                } else {
                    $scope.bizComplete = false;
                    $scope.displayOptions.section = 'basicProfile';
                }
          });
    };
        
    $scope.myDate = new Date();

    $scope.minDate = new Date(
        $scope.myDate.getFullYear(),
        $scope.myDate.getMonth(),
        $scope.myDate.getDate()
    );

    $scope.maxDate = new Date(
        $scope.myDate.getFullYear(),
        $scope.myDate.getMonth() + 2,
        $scope.myDate.getDate()
    );

    $scope.availableDates = function(date) {
        var day = date.getDay();
        return day === 0 || day === 6;
    };    
        
    $scope.deleteDeal = function(deal){
      if(!angular.isUndefined(deal.daysOfWeek)){
                          
            var start = new Date();
            var startDate = moment(start.getTime()).format('YYYYMMDD');

            if(!angular.isUndefined(deal.deals) && !angular.isUndefined(deal.deals[startDate])){
               var todayDeal = $firebaseObject(fbutil.ref('todaysDeals/' + startDate + '/' + deal.deals[startDate]));

                todayDeal.$loaded(function(){

                    var start = new Date(todayDeal.startTime);
                    var startDate = moment(start.getTime()).format('YYYYMMDD');
                    var end = new Date(todayDeal.endTime);
                    var endDate = moment(end.getTime()).format('YYYYMMDD');

                    fbutil.ref('todaysDeals/' + startDate + '/' + todayDeal.$id).remove();
                    if(startDate != endDate){
                        fbutil.ref('todaysDeals/' + endDate + '/' + todayDeal.$id).remove();
                    }
                });

            }

          console.log('deleting', deal.$id);
          fbutil.ref('recurringDeals/' + deal.$id).remove();

        }else{

            var start = new Date(deal.startTime);
            var startDate = moment(start.getTime()).format('YYYYMMDD');
            var end = new Date(deal.endTime);
            var endDate = moment(end.getTime()).format('YYYYMMDD');

            fbutil.ref('todaysDeals/' + startDate + '/' + deal.$id).remove();
             if(startDate != endDate){
                    fbutil.ref('todaysDeals/' + endDate + '/' + deal.$id).remove();
                }
        }  
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
    
        
    $scope.convertLoc = function(lat,lon,streetnumber,street,state,city,zip){
        console.log(lat + " " + lon);
        console.log(streetnumber+street+city+state+zip);
        
    };
    
    $scope.sendUniqueBizMessage = function(){
        $rootScope.bizInfo[$scope.displayOptions.currentLoc].$save()
    };
        
    $scope.completeBasicProfile = function(){
        if($scope.bizInfo[$scope.displayOptions.currentLoc].phone &&
           $scope.bizInfo[$scope.displayOptions.currentLoc].contactName &&
           $scope.bizInfo[$scope.displayOptions.currentLoc].timezone &&
           $scope.bizInfo[$scope.displayOptions.currentLoc].about) {
            $scope.displayOptions.section='advancedProfile';
            //alert('finished');    
        } else {
            alert('Please fill in all required fields');
        } 
    };
        
    $scope.completeImageProfile = function(){
        if($scope.bizInfo[$scope.displayOptions.currentLoc].icon) {
            $scope.displayOptions.section='main';
            //alert('finished');    
        } else {
            alert('Please fill in all required fields');
        } 
    };
        
    $scope.showEditProfile = function(){
        $scope.editProfile=true;  
    };
        
    $scope.cancelEditProfile = function() {
        $scope.editProfile=false;  
    };
        
    $scope.approveUserDeal = function (d) {
        //fbutil.ref('crowdSource/' , d.$id , '/approved').set(true);
        console.log(d);
        if (d.businessID==false || d.businessID==undefined){
            alert('add business bro');
        }
    };
        
    $scope.unapproveUserDeal = function (d) {
        fbutil.ref('crowdSource/' , d.$id , '/approved').set(false);
    }
    
    $scope.deleteUserDeal = function (d) {
        fbutil.ref('crowdSource/' , d.$id).remove();
    }
    
    $scope.openUserSubmittedDeal = function (dealType, audience, d) {
      console.log(dealType, audience);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'home/addDeal.html',
        controller: 'AddDealCtrl',
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
          fbutil: function() {
            return fbutil;
          },
          convertToUnixOffset: function() {
            return convertToUnixOffset;
          },
          biz: function(){
            return $rootScope.bizInfo[d.businessID];
          },
          dealType: function(){
            return dealType;
          },
          audience: function(){
            return audience;
          },
            
          crowdSourceObj: function(){
            return d;
          }
        }
      });
    };
    
     
    $scope.syncToBiz = function (d) {
          if (d.businessID==false || !d.businessID){
              var biz = $firebaseArray(fbutil.ref('businesses').orderByChild('lat').equalTo(d.lat));
              biz.$loaded().then(function () {
                console.log(biz[0]);
                if (biz.length==0){
                    $scope.createUserSubmittedBizObj(d)
                } else if (biz.length==1) {
                    //alert(biz[0].businessName);
                    //console.log(d);
                    //console.log(biz[0]);
                    fbutil.ref('crowdSource/' , d.$id , '/businessID').set(biz[0].$id);
                    alert('Deal synced to business, still need to approve')
                } else {
                    alert('too many results, add deal manually')
                }
              });
          } else {
              alert('businesss exists')
          }
          
    };
    
    $scope.createUserSubmittedBizObj = function (d){
        console.log(d);
              var geocoder = new google.maps.Geocoder;
              var latitude=d.lat;               
              var longitude=d.lon;
              var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};

              geocoder.geocode({'location': latlng}, function(results, status) {
                  if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        var newUserBiz = {};
                        newUserBiz = {
                              'city':d.city,
                              'address':d.address,
                              'icon':d.icon,
                              'lat':d.lat,
                              'lon':d.lon,
                              'businessName':d.locName,
                              'patio':false,
                              'games':false,
                              'vegan':false,
                              'rooftop':false,
                              'phone':d.phone,
                              'state':d.state,
                              'placeId':results[1].place_id,
                              'timezone': 'America/Chicago',
                          }
                         console.log(newUserBiz);
                         $scope.addUserSubmittedBiz(newUserBiz, d);
                    } else {
                        window.alert('Try again or add business manually');
                    }
                  } else {
                      window.alert('Geocoder failed due to: ' + status);
                    }
              });
    }
    
   
        
    $scope.addUserSubmittedBiz = function(biz, deal){
      console.log(biz);
      var newLocRef = fbutil.ref('users/' + user.uid + '/bizIDs').push();
      var newLocKey = newLocRef.key();        
      var updateObj = {};
      updateObj['users/' + user.uid + '/bizIDs/' + newLocKey] = true;
      updateObj['businesses/' + newLocKey] = biz;
      updateObj['allBizIDs/' + newLocKey] = true;
      console.log(updateObj);
      console.log(deal);
      fbutil.ref().update(updateObj, function(error){
          alert(biz.businessName+' added and deal synced with business, still need to approve deal');     
      });
      fbutil.ref('adminAnalytics/places/',biz.placeId).set(newLocKey);
      fbutil.ref('crowdSource/' , deal.$id , '/businessID').set(newLocKey);
    };  
    
    
        
    $scope.saveProfile = function(){
//        console.log(place);
//          $rootScope.bizInfo[$scope.displayOptions.currentLoc]['businessName'] = place.name; 
//          $rootScope.bizInfo[$scope.displayOptions.currentLoc]['address'] = place.formatted_address;
//        
//        if(!angular.isUndefined(place.formatted_phone_number)){
//            $rootScope.bizInfo[$scope.displayOptions.currentLoc]['phone'] = place.formatted_phone_number;
//        }
//        
//        if(!angular.isUndefined(place.website)){
//            $rootScope.bizInfo[$scope.displayOptions.currentLoc]['website'] = place.website;
//        }
//          delete $rootScope.bizInfo[$scope.displayOptions.currentLoc].place;
//        console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc]);
      $rootScope.bizInfo[$scope.displayOptions.currentLoc].$save().then(function(){
        // alert('Saved!');

          console.log($rootScope.bizInfo[$scope.displayOptions.currentLoc]);
          
//          fbutil.ref('adminAnalytics/places/',$rootScope.bizInfo[$scope.displayOptions.currentLoc].placeId).set($rootScope.bizInfo[$scope.displayOptions.currentLoc].$id);
          
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
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].vegan)){
              $scope.myRecurringObj[mrd.$id]['vegan'] = $rootScope.bizInfo[$scope.displayOptions.currentLoc].vegan;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].rooftop)){
              $scope.myRecurringObj[mrd.$id]['rooftop'] = $rootScope.bizInfo[$scope.displayOptions.currentLoc].rooftop;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].patio)){
              $scope.myRecurringObj[mrd.$id]['patio'] = $rootScope.bizInfo[$scope.displayOptions.currentLoc].patio;
            }
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].games)){
              $scope.myRecurringObj[mrd.$id]['games'] = $rootScope.bizInfo[$scope.displayOptions.currentLoc].games;
            }
            
            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].bizAccount)){
              $scope.myRecurringObj[mrd.$id].bizAccount = $rootScope.bizInfo[$scope.displayOptions.currentLoc].bizAccount;
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
                    
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].patio)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/patio').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].patio);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].rooftop)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/rooftop').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].rooftop);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].vegan)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/vegan').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].vegan);
                        }
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].games)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/games').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].games);
                        }
                    
                        if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].bizAccount)){
                            fbutil.ref('todaysDeals/' , day, thisDeal.$id , '/bizAccount').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].bizAccount);
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
                            
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].rooftop)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/rooftop').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].rooftop);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].patio)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/patio').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].patio);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].vegan)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/vegan').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].vegan);
                            }
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].games)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/games').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].games);
                            }
                            
                            if(!angular.isUndefined($rootScope.bizInfo[$scope.displayOptions.currentLoc].bizAccount)){
                                fbutil.ref('todaysDeals/' , verifyEnd , thisDeal.$id , '/bizAccount').set($rootScope.bizInfo[$scope.displayOptions.currentLoc].bizAccount);
                            }
                            
                        }
                        
                    

                });
                  
                    
            });
            $scope.myRecurringObj.$save();
            console.log('updating recurring');
            console.log($scope.myRecurringDeals);
        });
        
      });
        
        $scope.cancelEditProfile();
        $scope.saveAlert();
        console.log("DONE!!!");
    };
        
    $scope.bizAccountTrue = function() {
        fbutil.ref('businesses/' , $scope.displayOptions.currentLoc , '/bizAccount').set(true, function(error){
            $scope.saveProfile();
        })
    };
        
    $scope.bizAccountFalse = function() {
        fbutil.ref('businesses/' , $scope.displayOptions.currentLoc , '/bizAccount').set(false, function(error){
            $scope.saveProfile();
        })
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
      var today = Date.now();
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
        createdAt:today,
        businessID: $scope.displayOptions.currentLoc
      };
        console.log(today);
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
        
    /*$scope.boostRecurringDeal = function(dealID, deal){
      //console.log($firebaseObject(fbutil.ref('recurringDeals/' + dealID)));
      fbutil.ref('deals/', dealID, '/boost').set(true);
      alert('boosted');
    };*/
        
    $scope.boostTodayDeal = function(dealID, deal){
      //console.log($firebaseObject(fbutil.ref('recurringDeals/' + dealID)));
      fbutil.ref('deals/', dealID, '/boost').set(true);
      alert('boosted');
    };
        
    
    /*****************************************************************************************
    
        POPUP ADS
    
    *****************************************************************************************/
     
    $scope.showAdRadius = function(lat, lon, radius){
        if (lat==undefined || lon==undefined){
            alert('select valid location');
        } else {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'home/admap.html',
                controller: 'AdMapCtrl',
                size: 'lg',
                resolve: {
                  lat: function () {
                    return lat;
                  },
                  lon: function () {
                    return lon;
                  },
                  radius: function () {
                    return radius;
                  }
                }
              });     
        }
    };
        
    $scope.showAdPreview = function(adDetails, lat, lon, radius){
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'home/admap.html',
                controller: 'AdMapCtrl',
                size: 'lg',
                resolve: {
                  adDetails: function () {
                    return adDetails;
                  },
                    lat: function () {
                    return lat;
                  },
                  lon: function () {
                    return lon;
                  },
                  radius: function () {
                    return radius;
                  }
                }
              });     
    };
        
    $scope.closeAdMap = function () {
        $uibModalInstance.dismiss();
    };
        
    $scope.customAdStatus = 'first';  
    $scope.toggleCustomAd = function() {
        if ($scope.customAdStatus == 'first') {
            $scope.customAdStatus = 'second';  
        } else {
            $scope.customAdStatus = 'first';  
        }
    };
    
    $scope.customAd = {};  
    
        
    $scope.popupAdBuilder = function(){ 
        
        $scope.customAd = {
            name: $scope.customAd.name,
            description: $scope.customAd.description,
            locName: $scope.customAd.locName,
            //icon: $scope.customAd.icon,
            //img: false,
            dealFullImage: $scope.customAd.dealFullImage,
            //largeImg: $scope.customAd.largeImg,
            //detailBackgroundFull: false,
            address: $scope.customAd.address,
            city: $scope.customAd.city,
            state: $scope.customAd.state,
            //phone: $scope.customAd.phone,
            lat: $scope.customAd.lat,
            lon: $scope.customAd.lon,
            radius: $scope.customAd.radius,
            //featured: 'false',
            daysOfWeek: {
              'monday': $scope.customAd.daysOfWeek.monday,
              'tuesday': $scope.customAd.daysOfWeek.tuesday,
              'wednesday': $scope.customAd.daysOfWeek.wednesday,
              'thursday': $scope.customAd.daysOfWeek.thursday,
              'friday': $scope.customAd.daysOfWeek.friday,
              'saturday': $scope.customAd.daysOfWeek.saturday,
              'sunday': $scope.customAd.daysOfWeek.sunday
            },
            type: $scope.customAd.type,
            startTime: $scope.customAd.startTime,
            endTime: $scope.customAd.endTime,
            //showTime: $scope.customAd.showTime,
            //exclusive: 'no', 
            //timeType: 'deal',
            //redeemable: 'no',
            businessID: $scope.displayOptions.currentLoc,
            impressions: $scope.customAd.impressions
        };
        
        console.log($scope.customAd);
        
        
        var startdate = new Date($scope.customAd.startTime);
        var enddate = new Date($scope.customAd.endTime);
  
        var startClockTime = moment(startdate.getTime()).format('HH:mm');
        var endClockTime = moment(enddate.getTime()).format('HH:mm');

        var timeRange = convertToUnixOffset(startClockTime, endClockTime, "America/Chicago",0);

        $scope.customAd.startTime = timeRange[0];
        $scope.customAd.endTime = timeRange[1];
        
        if ( $scope.customAd.daysOfWeek.monday==undefined) {
             $scope.customAd.daysOfWeek.monday='no'
        }
        if ( $scope.customAd.daysOfWeek.tuesday==undefined) {
             $scope.customAd.daysOfWeek.tuesday='no'
        }
        if ( $scope.customAd.daysOfWeek.wednesday==undefined) {
             $scope.customAd.daysOfWeek.wednesday='no'
        }
        if ( $scope.customAd.daysOfWeek.thursday==undefined) {
             $scope.customAd.daysOfWeek.thursday='no'
        }
        if ( $scope.customAd.daysOfWeek.friday==undefined) {
             $scope.customAd.daysOfWeek.friday='no'
        }
        if ( $scope.customAd.daysOfWeek.saturday==undefined) {
             $scope.customAd.daysOfWeek.saturday='no'
        }
        if ( $scope.customAd.daysOfWeek.sunday==undefined) {
             $scope.customAd.daysOfWeek.sunday='no'
        }
        
        console.log($scope.customAd);
        
        
        if($scope.customAd.name==undefined || $scope.customAd.locName==undefined || $scope.customAd.lat==undefined || $scope.customAd.dealFullImage==undefined) {
            alert('please enter all fields');
        } else if ($scope.customAd.impressions==undefined){
            alert('please enter valid number of impressions');
        } else {
            if ($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan!=undefined) {
                if($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan.adCount!=undefined){
                    if($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan.adCount - $scope.customAd.impressions > -1 ){
                        $scope.newAdTotal = $rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan.adCount - $scope.customAd.impressions;
                        console.log($scope.newAdTotal);
                    } else {
                        alert('you dont have enough impressions');
                    }
                } else {
                    $scope.openPaymentModal($scope.displayOptions.currentLoc);
                }
                
            } else {
                $scope.openPaymentModal($scope.displayOptions.currentLoc);
            }
            
            fbutil.ref('popupAdDeals').push($scope.customAd, function(){
                $scope.displayOptions.mainTab='adspace';
                $scope.$apply();
                $scope.customAd = {};
            });
            fbutil.ref('businesses', $scope.displayOptions.currentLoc, 'currentPlan').update({adCount:$scope.newAdTotal});
        }  
    };
       
    $scope.daysPerWeek = 0;
    $scope.selectDealForPopup = function(dealID, deal){
        /*$scope.popupAd = $firebaseObject(fbutil.ref('popupAdDeals/', dealID));
        $scope.popupAd.$loaded(function(){
            console.log($scope.popupAd);
        });*/
        
          $scope.daysPerWeek = 0;
          if (deal.daysOfWeek['monday']=='yes'){ $scope.daysPerWeek += 1; }
          if (deal.daysOfWeek['tuesday']=='yes'){ $scope.daysPerWeek += 1; }
          if (deal.daysOfWeek['wednesday']=='yes'){ $scope.daysPerWeek += 1; }
          if (deal.daysOfWeek['thursday']=='yes'){ $scope.daysPerWeek += 1; }
          if (deal.daysOfWeek['friday']=='yes'){ $scope.daysPerWeek += 1; }
          if (deal.daysOfWeek['saturday']=='yes'){ $scope.daysPerWeek += 1; }
          if (deal.daysOfWeek['sunday']=='yes'){ $scope.daysPerWeek += 1; }

        $scope.dealSelectedForPopup = {
        id: dealID,
        name: deal.name,
        description: deal.description,
        locName: $rootScope.bizInfo[$scope.displayOptions.currentLoc].businessName,
        icon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].icon,
        dealFullImage: deal.dealFullImage,
        address: $rootScope.bizInfo[$scope.displayOptions.currentLoc].address,
        city: $rootScope.bizInfo[$scope.displayOptions.currentLoc].city,
        state: $rootScope.bizInfo[$scope.displayOptions.currentLoc].state,
        phone: $rootScope.bizInfo[$scope.displayOptions.currentLoc].phone,
        lat: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lat,
        lon: $rootScope.bizInfo[$scope.displayOptions.currentLoc].lon,
        timezone: $rootScope.bizInfo[$scope.displayOptions.currentLoc].timezone,
        daysOfWeek: {
          'monday': deal.daysOfWeek.monday,
          'tuesday': deal.daysOfWeek.tuesday,
          'wednesday': deal.daysOfWeek.wednesday,
          'thursday': deal.daysOfWeek.thursday,
          'friday': deal.daysOfWeek.friday,
          'saturday': deal.daysOfWeek.saturday,
          'sunday': deal.daysOfWeek.sunday
        },
        startTime: deal.startTime,
        endTime: deal.endTime,
        businessID: deal.businessID,
        //impressions: -10 // do math on app side to subtract this number, when impressions = 0 then delete or hide
      };
        
        // puts the dates into an array for the calendar filter
        $scope.availableDatesObj = {};
        $scope.availableDatesObj = $scope.dealSelectedForPopup.daysOfWeek;
        if ($scope.availableDatesObj['sunday']=='yes'){$scope.availableDatesObj['sunday']=0}
        if ($scope.availableDatesObj['monday']=='yes'){$scope.availableDatesObj['monday']=1}
        if ($scope.availableDatesObj['tuesday']=='yes'){$scope.availableDatesObj['tuesday']=2}
        if ($scope.availableDatesObj['wednesday']=='yes'){$scope.availableDatesObj['wednesday']=3}
        if ($scope.availableDatesObj['thursday']=='yes'){$scope.availableDatesObj['thursday']=4}
        if ($scope.availableDatesObj['friday']=='yes'){$scope.availableDatesObj['friday']=5}
        if ($scope.availableDatesObj['saturday']=='yes'){$scope.availableDatesObj['saturday']=6}
        $scope.availableDates = [];
        angular.forEach($scope.availableDatesObj, function (value) {
            if (value != "no"){
                $scope.availableDates.push(value);
            }
        });
        $scope.availableDates.sort(function(a, b){return a-b});
        console.log($scope.availableDates);
        $scope.availablePopupDates = function(date) {
            var day = date.getDay(); 
            var available = [];
            var available = $scope.availableDates;
            //currently only filtering 3 days
            for(var i = 0; i < available.length; i++){

                var len = available.length; //length of available array

                var currentPos = available[i]; //current position of array

                var nextPos = available[(i+1)%len]; //next position of array

                var previousPos = available[(i+len-1)%len]; //previous position of array

                return day === currentPos || day === nextPos || day === previousPos; //THE RETURN
            } 
      }; 
        
      
      $('html, body').animate({ scrollTop: 0 }, 'fast');
    };
        
    $scope.clearAdDealSelected = function(){
        $scope.dealSelectedForPopup = null;
    };
        
    $scope.testPopup = function(d){
        if (d.impressions > 0 && d.radius > 0){
            fbutil.ref('popupAdDeals').push(d, function(){
                $scope.displayOptions.campaignTopTab='manager';
                $scope.$apply();
            });
            
        } else {
            alert ('Please fill out impressions and radius');
        }
        console.log(d);
    };
     
    $scope.paidPopupAdDeal = function(d){
        if ($rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan) {
            if(d.impressions > 0 && d.radius > 0){
                $scope.newAdTotal = $rootScope.bizInfo[$scope.displayOptions.currentLoc].currentPlan.adCount - d.impressions;
                fbutil.ref('popupAdDeals').push(d);
                fbutil.ref('businesses', $scope.displayOptions.currentLoc, 'currentPlan').update({adCount:$scope.newAdTotal});
                $scope.displayOptions.campaignTopTab='manager';
                //$scope.$apply();   
            } else {
                alert('Please fill in impressions and radius');
            }
        } else {
            alert('You must upgrae your account to create ads');
        }
    };
        
    $scope.adminPopupAdDeal = function(d){
        if (d.radius > 0){
            fbutil.ref('popupAdDeals').push(d);
            $scope.displayOptions.campaignTopTab='manager';
        } else {
            alert('Please enter radius');
        }
    };
        
    $scope.showConfirm = function(ev) {
        $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title('This is an alert title')
        .textContent('You can specify some description text in here.')
        .ariaLabel('Alert Dialog Demo')
        .ok('Got it!')
        .targetEvent(ev)
    );
        // Appending dialog to document.body to cover sidenav in docs app
        /*var confirm = $mdDialog.confirm()
              .title('Would you like to delete your debt?')
              .textContent('All of the banks have agreed to forgive you your debts.')
              .ariaLabel('Lucky day')
              .targetEvent(ev)
              .ok('Please do it!')
              .cancel('Sounds like a scam');

        $mdDialog.show(confirm).then(function() {
          $scope.status = 'You decided to get rid of your debt.';
        }, function() {
          $scope.status = 'You decided to keep your debt.';
        });*/
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
                
        
          
    $scope.deletePopupAdDeal = function(dealID){
      console.log('deleting popup ad deal', dealID);
      fbutil.ref('popupAdDeals/' + dealID).set(null);
    };
     
        
        
    $scope.heatMap = {
        startDate: '',
        endDate: '',
        length: 0
    };
        
    /*$scope.calculateEstimatedReach = function(){
        $scope.cityCount = 0;
        var locations = [];
        $scope.heatMap.length = 0;
        var start = new Date(past30);
        var day = moment(past30).format("YYYYMMDD");
        var end = moment(today).format("YYYYMMDD");
        var today = new Date()
        var past30 = new Date().setDate(today.getDate()-30)
        var defaultLat = $rootScope.bizInfo[$scope.displayOptions.currentLoc].lat;
        var defaultLon = $rootScope.bizInfo[$scope.displayOptions.currentLoc].lon;

        $scope.userLocObj = $firebaseArray(fbutil.ref('adminAnalytics/appLoads'));
            $scope.userLocObj.$loaded(function(){
                do{
                    angular.forEach($scope.userLocObj[day], function(loc){
                        

                        var distanceAway = GeoFire.distance([loc.lat, loc.lon], [defaultLat, defaultLon]);
                        
                        if(distanceAway < 30){                            
                            console.log(loc);
                        }


                    });
                    
                }
            });
    };*/
        
    
    // This function is half finished
   
   /* $scope.userLocObj = $firebaseArray(fbutil.ref('adminAnalytics/appLoads').limitToLast(30));
    $scope.userLocObj.$loaded(function(){
        console.log($scope.userLocObj.id);
        $scope.userLocObj.forEach(function(data, id){
            //console.log(id);
        });
    });*/
        
    // This function is half finished
        
    $scope.calculateEstimatedReach = function(){
        var today = new Date()
        var past30 = new Date().setDate(today.getDate()-30)
        var defaultLat = $rootScope.bizInfo[$scope.displayOptions.currentLoc].lat;
        var defaultLon = $rootScope.bizInfo[$scope.displayOptions.currentLoc].lon;
        
        $scope.cityCount = 0;
        var locations = [];
        $scope.heatMap.length = 0;
        var start = new Date(past30);
        var day = moment(past30).format("YYYYMMDD");
        var end = moment(today).format("YYYYMMDD");
        
        $scope.userLocObj.$loaded(function(){
                $scope.userLocObj.forEach(function(){
                    console.log($scope.userLocObj);
                    /*if(distanceAway < 20 && data.locName=='Camino'){
                         $scope.flashArray.push(data);
                    }*/
                });
        });
    };

    $scope.initializeAdMap = function(){
        var today = new Date()
        var past30 = new Date().setDate(today.getDate()-30)
        var defaultLat = $rootScope.bizInfo[$scope.displayOptions.currentLoc].lat;
        var defaultLon = $rootScope.bizInfo[$scope.displayOptions.currentLoc].lon;
        var icon = {
                url: $rootScope.bizInfo[$scope.displayOptions.currentLoc].icon,
                scaledSize: new google.maps.Size(40, 40),// scaled size
        };
        
        $timeout(function() {
              
            $scope.cityCount = 0;
            var locations = [];
            $scope.heatMap.length = 0;
            var start = new Date(past30);
            var day = moment(past30).format("YYYYMMDD");
            var end = moment(today).format("YYYYMMDD");

            console.log(start);
            console.log(day);
            console.log(end);

            var map = new google.maps.Map(document.getElementById('deal-ad-map'), {
                 zoom: 7,
                 center: new google.maps.LatLng(defaultLat, defaultLon),
                 mapTypeId: google.maps.MapTypeId.ROADMAP,
                 disableDefaultUI: true, // a way to quickly hide all controls
                 mapTypeControl: false,
                 scaleControl: true,
                 zoomControl: true,
                 zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE 
                 }
            });
            var infowindow = new google.maps.InfoWindow;

            $scope.userLocObj = $firebaseObject(fbutil.ref('adminAnalytics/appLoads'));
            $scope.userLocObj.$loaded(function(){
                do{
                    angular.forEach($scope.userLocObj[day], function(loc){
                        //console.log(loc);
                        var marker;

                        var distanceAway = GeoFire.distance([loc.lat, loc.lon], [defaultLat, defaultLon]);
                        
                        if(distanceAway < 30){                            
                            marker = new google.maps.Marker({
                                map: map,
                                //animation: google.maps.Animation.DROP,
                                position: {lat: defaultLat, lng: defaultLon},
                                //icon: icon,
                                zIndex:99,
                              });
                            // Add circle overlay and bind to marker
                            var circle = new google.maps.Circle({
                              map: map,
                              radius: 30 * 1000,    // measured in meters
                              //fillColor: 'rgba(88, 176, 251, 0.43)'
                            });
                            circle.bindTo('center', marker, 'position');

                            if(!angular.isUndefined(loc.id)){
                                loc['id'] = 'unknown';
                            }else{
                                //console.log(loc.id);
                                loc.id = String(loc.id);
                            }
                            $scope.cityCount += 1;
                        }


                    });
                    $scope.heatMap.length += parseInt(Object.keys($scope.userLocObj[day]).length);
                    var tomorrow = new Date(start);
                    tomorrow.setDate(start.getDate()+1);
                    day  = moment(tomorrow).format("YYYYMMDD");
                    start = tomorrow;
                    console.log(start);
                }
                while (day <= end){
                };
            });
        }, 1000);
    };
    
  
        
    
    $scope.showHistoryAnalytics = 'no';    
        
    $scope.showAnalytics = function(){
        if ($scope.showHistoryAnalytics=='no') {
            $scope.showHistoryAnalytics = 'yes';
        } else {
            $scope.showHistoryAnalytics = 'no';
        }
    };
        
    
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
    
    
    /*********************************************************************************
    
    DEFINITIONS FOR FILTERING
    
    *********************************************************************************/
               
        
    $scope.showDaysOfWeek = function(d){
      var ret = '';
      if (d.daysOfWeek['monday']=='yes'){ ret += 'Mon/'; }
      if (d.daysOfWeek['tuesday']=='yes'){ ret += 'Tue/'; }
      if (d.daysOfWeek['wednesday']=='yes'){ ret += 'Wed/'; }
      if (d.daysOfWeek['thursday']=='yes'){ ret += 'Thu/'; }
      if (d.daysOfWeek['friday']=='yes'){ ret += 'Fri/'; }
      if (d.daysOfWeek['saturday']=='yes'){ ret += 'Sat/'; }
      if (d.daysOfWeek['sunday']=='yes'){ ret += 'Sun/'; }
      return ret.substr(0, ret.length-1);
    }
    
    $scope.daysPerWeek = function(d){
      var num = 0;
      if (d.daysOfWeek['monday']=='yes'){ num += 1; }
      if (d.daysOfWeek['tuesday']=='yes'){ num += 1; }
      if (d.daysOfWeek['wednesday']=='yes'){ num += 1; }
      if (d.daysOfWeek['thursday']=='yes'){ num += 1; }
      if (d.daysOfWeek['friday']=='yes'){ num += 1; }
      if (d.daysOfWeek['saturday']=='yes'){ num += 1; }
      if (d.daysOfWeek['sunday']=='yes'){ num += 1; }
      return num;
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
    
    $scope.isBoosted = function(d){
        if (!angular.isUndefined(d.boost) && d.boost=='yes'){
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
    
    $scope.clearRatings = function(thisDeal){
        
        var deal = $firebaseObject(fbutil.ref('recurringDeals/', thisDeal.$id));
        deal.$loaded().then(function(){ 
        

            if(!angular.isUndefined(deal.ratings)){
                delete deal.ratings;
            }
            deal.totalRating = 0;
            deal.$save();
        });
        
    };
        
    $scope.loadBizData = function(){
        $scope.myFollowers = $firebaseArray(fbutil.ref('businesses/'+$scope.displayOptions.currentLoc+'/followers'));
        $scope.myFollowers.$loaded().then(function () {
            console.log($scope.myFollowers);
        });
        
    }
    
    $scope.loadMyDeals = function(){
        
        

        var start = new Date();
        var startDate = moment(start.getTime()).format('YYYYMMDD');
//        var end = new Date($scope.deal.endTime);
//        var endDate = moment(end.getTime()).format('YYYYMMDD');

      $scope.myDeals = $firebaseArray(fbutil.ref('todaysDeals', startDate).orderByChild('businessID').equalTo($scope.displayOptions.currentLoc).limitToLast(100));
    
      $scope.myRecurringDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));
        
      $scope.myRecurringObj = $firebaseObject(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));
        
      $scope.myPopupAdDeals = $firebaseArray(fbutil.ref('popupAdDeals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));
        
     // $scope.allPopupAdDeals = $firebaseArray(fbutil.ref('popupAdDeals').orderByChild('businessID'));
        
      //$scope.allDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('locName'));
    
    };
        
//    $scope.loadAnalytics = function(){
//         $scope.myDeals = $firebaseArray(fbutil.ref('deals').orderByChild('businessID').equalTo($scope.displayOptions.currentLoc));        
//    };
//        
    $scope.loadBizUsers = function(){
         $scope.bizUsers = $firebaseArray(fbutil.ref('users'));
         $scope.bizLocations = $firebaseArray(fbutil.ref('businesses'));
          console.log($scope.bizLocations);
    };
        
    $scope.loadAdminDeals = function(){
        
      $scope.allPopupAdDeals = $firebaseArray(fbutil.ref('popupAdDeals').orderByChild('businessID'));
        
      $scope.allDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('locName'));
    
    };
        
    $scope.loadCrowdSourceData = function () {
      $scope.userSubDeals = $firebaseArray(fbutil.ref('crowdSource').orderByChild('businessID'));
      $scope.userVerDeals = $firebaseArray(fbutil.ref('recurringDeals').orderByKey('verifiedObj'));
      $scope.userVerDeals.$loaded().then(function(){ 
          console.log($scope.userVerDeals);
      });
    };
        
    $scope.loadFeedback = function(){
      $scope.feedback = $firebaseArray(fbutil.ref('feedback').orderByChild('businessID'));
    };
        
    $scope.loadUsers = function() {
        $scope.userData = $firebaseObject(fbutil.ref('users_app'));
    };
        
    $scope.loadAdminEvents = function(){
      
        
      $scope.allEventDeals = $firebaseArray(fbutil.ref('deals').orderByChild('timeType').equalTo('event'));
      
    
    };    
        
        
    $scope.loadRecurringHistory = function(dealID){
        $scope.currentDealID = dealID;
        console.log(dealID);
    
        var start = new Date();
        var startDate = moment(start.getTime()).format('YYYYMMDD');
        
        $scope.individualRecurringDeal = $firebaseArray(fbutil.ref('todaysDeals', startDate).orderByChild('recurringDealID').equalTo( $scope.currentDealID));
    };

    $scope.deleteRecurringDeal = function(dealID){
        
        var start = new Date();
        var startDate = moment(start.getTime()).format('YYYYMMDD');
       
        if(!angular.isUndefined($scope.myRecurringObj[dealID].deals) && !angular.isUndefined($scope.myRecurringObj[dealID].deals[startDate])){
           var todayDeal = $firebaseObject(fbutil.ref('todaysDeals/' + startDate + '/' + $scope.myRecurringObj[dealID].deals[startDate]));
            
            var start = new Date(todayDeal.startTime);
            var startDate = moment(start.getTime()).format('YYYYMMDD');
            var end = new Date(todayDeal.endTime);
            var endDate = moment(end.getTime()).format('YYYYMMDD');
            
            fbutil.ref('todaysDeals/' + startDate + '/' + todayDeal.$id).set(null);
            if(startDate != endDate){
                fbutil.ref('todaysDeals/' + endDate + '/' + todayDeal.$id).set(null);
            }
        }
        
      console.log('deleting', dealID);
      fbutil.ref('recurringDeals/' + dealID).set(null);
        

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
        if (o.uid) {
            var uid = o.uid;



            // add userid and email to business object
            fbutil.ref('businesses', bizID, 'userids', uid).update({uid:uid});
            fbutil.ref('businesses', bizID, 'emails', comma_email).update({comma_email:email});

            // add business id to user object
            fbutil.ref('users', uid, 'bizIDs', bizID).set(true);
        } else {
            alert('Email must be signed up with MealSteals before access can be given');
        }

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


    $scope.openEditBox = function (thisDeal, type) {
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
          thisDeal: function () {
            return thisDeal;
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
 
        
        
        
    $scope.openAddBox = function (dealType, audience) {
      console.log(dealType, audience);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'home/addDeal.html',
        controller: 'AddDealCtrl',
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
          fbutil: function() {
            return fbutil;
          },
          convertToUnixOffset: function() {
            return convertToUnixOffset;
          },
          biz: function(){
            return $rootScope.bizInfo[$scope.displayOptions.currentLoc];
          },
          dealType: function(){
            return dealType;
          },
          audience: function(){
            return audience;
          },
            
          crowdSourceObj: function(){
            return null;
          }
        }
      });
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
        
    /******************************************************************************************
    
        PAYMENT
    
    *******************************************************************************************/
        
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
        
    $scope.openUpgradeModal = function (bizID, bizObj) {
      //console.log(bizID);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'home/upgrade.html',
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
        
    $scope.openPaymentModal = function (bizID, bizObj) {
      //console.log(bizID);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'home/purchase.html',
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
        
    $scope.showHeatMap = function (bizID, bizObj) {
      //console.log(bizID);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'home/heatmap.html',
        controller: 'HeatMapCtrl',
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
        
    $scope.openUpgradeDealModal = function (upgradeDeal, type) {
      var biz = $rootScope.bizInfo[$scope.displayOptions.currentLoc]
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'home/upgrade-deal.html',
        controller: 'UpgradeDealCtrl',
        size: 'lg',
        resolve: {
          upgradeDeal: function () {
            return upgradeDeal;
          },
          type: function () {
            return type;
          },
          biz: function () {
            return biz;
          }
        }
      });    
    };
        
    $scope.requestMailModal = function(place, type){
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'home/mail.html',
            controller: 'MailCtrl',
            size: 'lg',
            resolve: {
              place: function () {
                return place;
              },
              user: function () {
                return $rootScope.userOptions;
              },
              type: function () {
                return type;
              }
            }
          });     
    };
        
     $scope.requestNameChangeModal = function(place, type){
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'home/request-change.html',
            controller: 'MailCtrl',
            size: 'sm',
            resolve: {
              place: function () {
                return place;
              },
              user: function () {
                return $rootScope.userOptions;
              },
              type: function () {
                return type;
              }
            }
          });     
    };
        
     $scope.requestAddressChangeModal = function(place, type){
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'home/request-change.html',
            controller: 'MailCtrl',
            size: 'sm',
            resolve: {
              place: function () {
                return place;
              },
              user: function () {
                return $rootScope.userOptions;
              },
              type: function () {
                return type;
              }
            }
          });     
    };
        
    $scope.changeMailModal = function(place, type){
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'home/mail.html',
            controller: 'MailCtrl',
            size: 'lg',
            resolve: {
              place: function () {
                return place;
              },
              user: function () {
                return $rootScope.userOptions;
              },
              type: function () {
                return type;
              }
            }
          });     
    };
            
       
    $scope.loadImages = function(){
        
        //$scope.flashDeals = $firebaseArray(fbutil.ref('deals').orderByChild('recurringDealID').equalTo(undefined));
        
        
    }
        
    /*
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
    };*/
    
    $scope.clearMessage = function() {
        
        $scope.addBizMessage = '';
    };
    
    
    $scope.deleteBizConfirm = function(){
        
        var id = $scope.displayOptions.currentLoc;
        var placeId = $rootScope.bizInfo[$scope.displayOptions.currentLoc].placeId;
        
        var recurring = $firebaseArray(fbutil.ref('recurringDeals').orderByChild('businessID').equalTo(id));
        var users = $firebaseArray(fbutil.ref('users'));
        
        
        
        recurring.$loaded().then(function(){
            angular.forEach(recurring, function(rec){

                if(rec.businessID == id){
                    fbutil.ref('recurringDeals/' + rec.$id).remove();
                }

            });
            console.log('removed recurring');
        });
        
             angular.forEach($rootScope.todaysDeals, function(deal){

                var start = new Date(deal.startTime);
                var verifyStart = moment(start.getTime()).format('YYYYMMDD');
                 
                var end = new Date(deal.endTime);
                var verifyEnd = moment(end.getTime()).format('YYYYMMDD');
                 
                fbutil.ref('todaysDeals/' + verifyStart + '/' + deal.$id).remove();
                
                 if(verifyStart != verifyEnd){
                     fbutil.ref('todaysDeals/' + verifyend + '/' + deal.$id).remove();
                 }

            });
        
        users.$loaded().then(function(){
             angular.forEach(users, function(user){

                if(!angular.isUndefined(user.bizIDs) && !angular.isUndefined(user.bizIDs[id])){
                    fbutil.ref('users', user.uid, 'bizIDs', id).remove();
                }

            });
            console.log('removed access in users');
        });
        
    
        fbutil.ref('businesses/' + id).remove();
        fbutil.ref('allBizIDs/' + id).remove();
        
        if (!angular.isUndefined(placeId)){
            fbutil.ref('adminAnalytics/places/',placeId).set(null);
        }
        console.log('removed business');
    };
        
    
    $scope.verifyDeal = function(deal){
        
        if(!angular.isUndefined(deal.daysOfWeek)){
            
           
            var time = new Date();
            var stamp = time.getTime();
            console.log(deal);
            console.log(stamp);
          console.log('verifying', deal.$id);
            console.log('email: ', $rootScope.userOptions.email);
          fbutil.ref('recurringDeals/' + deal.$id + '/verified').set(stamp);
            fbutil.ref('recurringDeals/' + deal.$id + '/verifiedBy').set($rootScope.userOptions.email);

        }
        
    };
        
        
        
        
    $scope.updateDeals = function(){
        
             var ref = new Firebase('https://mealsteals.firebaseio.com/recurringDeals');

//var geoFire = new GeoFire(new Firebase('https://mealsteals.firebaseio.com/dealGeoFireKeys'));
var fbutil = new Firebase('https://mealsteals.firebaseio.com/');
    console.log('starting update deals script');

    ref.once("value", function(snapshot) {

      var numChildren = snapshot.numChildren();
      var numChecked = 0;
      if (numChecked == numChildren){
//          exitScript();
      }

      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key();
        var d = childSnapshot.val();

          if(!isUndefined(d.timezone)){
        var currentDay = moment().tz(d.timezone).format('dddd').toLowerCase();
          }
 
        // If we have a day match
        if (!isUndefined(d.daysOfWeek) && d.daysOfWeek[currentDay] =='yes'){
            // then lets add it in NOW (assuming it hasn't been added already).
            // this way it will appear in the business's dashboard as a current deal that will start later in the day

            var startClockTime = moment(d.startTime).tz(d.timezone).format('HH:mm');
            var endClockTime = moment(d.endTime).tz(d.timezone).format('HH:mm');
            var timeRange = convertToUnixOffset(startClockTime, endClockTime, d.timezone);
            var startTime = timeRange[0];
            var endTime = timeRange[1];

            var subRef = (new Firebase('https://mealsteals.firebaseio.com/deals')).orderByChild('recurringDealID').equalTo(key);
            subRef.once('value', function(subSnapshot){
                var subNumChildren = subSnapshot.numChildren();
                var subNumChecked = 0;
                if (subNumChildren > 0){
                    var found = false;
                    var foundKeys = [];
                    subSnapshot.forEach(function(subChildSnapshot){
                        var subD = subChildSnapshot.val();

                        if (subD.startTime == startTime && subD.endTime == endTime){
                            found = true;
                            foundKeys.push(subD);
                        } else {
                            // do nothing
                        }

                        subNumChecked += 1;
                        if (subNumChecked == subNumChildren){
                            if (found==true){
                                // then we don't need to add a deal
                                numChecked += 1;
                                if (numChecked == numChildren){
//                                    exitScript();
                                }
                                if (foundKeys.length > 1){
                                    console.log('found duplicates...');
                                    for (var ii = 0; ii < foundKeys.length - 1; ii++) {
                                      console.log('deleting deal with key ' + foundKeys[ii].key);
                                        
                                        var st = new Date(foundKeys[ii].startTime);
                                        var start = parseInt(moment(st).format("YYYYMMDD"));
                                        var en = new Date(foundKeys[ii].endTime);
                                        var end = parseInt(moment(en).format("YYYYMMDD"));
                                        
                                        fbutil.child('todaysDeals/'  + start + '/' + foundKeys[ii].key).remove();
                                        fbutil.child('todaysDeals/'  + end + '/' + foundKeys[ii].key).remove();
                                        
                                        
//                                      geoFire.remove(foundKeys[ii].key);
//                                      (new Firebase('https://mealsteals.firebaseio.com/deals')).child(foundKeys[ii].key).remove();
                                    }
                                }
                            } else {
                                // we need to add the deal then
                                var addThisDeal = JSON.parse(JSON.stringify(d));
                                
                               
                                if(!isUndefined(d.boosts) && d.boosts > 0){
                                    var newTotal = parseInt(d.boosts) - 1;
                                    ref.child('/' + key + '/boosts').set(newTotal);
                                    addThisDeal.boost = true;
                                }
                                
                                delete addThisDeal.daysOfWeek;
                                addThisDeal.startTime = startTime;
                                addThisDeal.endTime = endTime;
                                addThisDeal.recurringDealID = key;
                                addThisDeal.lat = parseFloat(addThisDeal.lat);
                                addThisDeal.lon = parseFloat(addThisDeal.lon);
                                console.log('addThisDeal');
                                console.log(addThisDeal);
                                if(isUndefined(addThisDeal.approved) || addThisDeal.approved!=false){
                                    var end = new Date(endTime);
                                        var endDay = moment(end).format("YYYYMMDD");
                                        var time = new Date();
                                        var day = moment(time).format("YYYYMMDD");
                                        console.log(day);
                                    
                                    var dealsRef = new Firebase('https://mealsteals.firebaseio.com/todaysDeals/' + day);
                                    var newDealKey = dealsRef.push().key();
                                    addThisDeal.key = newDealKey;
                                        var time2 = new Date();
                                        var day2 = moment(time).format("YYYYMMDD");
                                    
                                        if(isUndefined(addThisDeal.deals) || isUndefined(addThisDeal.deals[day])){
                                            ref.child( key + '/deals/' + day).set(newDealKey);  
                                            fbutil.child('recurringDeals/' + newDealKey.recurringDealID + '/deals/' + day).set(addThisDeal.key);
                                            fbutil.child('todaysDeals/'  + day + '/' + newDealKey).set(addThisDeal);
                                            fbutil.child('todaysDeals/'  + endDay + '/' + newDealKey).set(addThisDeal);
                                        }
                                    
                                        numChecked += 1;
                                        if (numChecked == numChildren){
//                                            exitScript();
                                        }

                                } else {
                                    numChecked += 1;
                                }
                            }

                                    
                        }
                    });
                } else {
                    // then we definitely need to add this deal for today
                    var addThisDeal = JSON.parse(JSON.stringify(d));
                    
                    
                    if(!isUndefined(d.boosts) && d.boosts > 0){
                        var newTotal = parseInt(d.boosts) - 1;
                        ref.child('/' + key + '/boosts').set(newTotal);
                        addThisDeal.boost = true;
                    }
                    
                    delete addThisDeal.daysOfWeek;
                    addThisDeal.startTime = startTime;
                    addThisDeal.endTime = endTime;
                    addThisDeal.recurringDealID = key;
                    addThisDeal.lat = parseFloat(addThisDeal.lat);
                    addThisDeal.lon = parseFloat(addThisDeal.lon);
                    if(isUndefined(addThisDeal.approved) || addThisDeal.approved!=false){
                        var end = new Date(endTime);
                            var endDay = moment(end).format("YYYYMMDD");
                            var time = new Date();
                            var day = moment(time).format("YYYYMMDD");
                            
                            var dealsRef = new Firebase('https://mealsteals.firebaseio.com/todaysDeals/' + day);
                            var newDealKey = dealsRef.push().key();
                            addThisDeal.key = newDealKey;
                           
                            if(isUndefined(addThisDeal.deals) || isUndefined(addThisDeal.deals[day])){
                                ref.child( key + '/deals/' + day).set(newDealKey);  
                                fbutil.child('recurringDeals/' + newDealKey.recurringDealID + '/deals/' + day).set(addThisDeal.key);
                                fbutil.child('todaysDeals/'  + day + '/' + newDealKey).set(addThisDeal);
                                fbutil.child('todaysDeals/'  + endDay + '/' + newDealKey).set(addThisDeal);
                            }
                        
                            numChecked += 1;
                            if (numChecked == numChildren){
//                                exitScript();
                            }
                        
                    } else{
                        numChecked += 1;
                    }
                }
                    
            });

        } else {
            numChecked += 1;
            if (numChecked == numChildren){
//                exitScript();
            }
        }
        
        

      });
			
    });

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

  return [startMoment.valueOf(), endMoment.valueOf()];
}


/**
 * Undefined function ported from angular
 */
function isUndefined(value) {return typeof value === 'undefined';}

function exitScript()
{
	console.log('finished update deals script');
//	process.exit();
}    
        
        
    };
        
        
        
        
    $scope.notVerified = function(deal){
        if(angular.isUndefined(deal.verified)){
            return 0;
        }else{
            return deal.verified;
        }
    };
    
    // intial filter options for catalog    
    $rootScope.filterOptions = {
         'showCity':'all',
         'showDay':'all',
         'showVerifiedBy':'all',
         'showUserSubmitted':false,
         'searchBiz':'',
         'showRooftop':false,
     };
        
    $scope.filterCity = function(showCity){
		return function(d){
			if (showCity=='all') return true;            
            if (showCity=='milwaukee' && (d.city=='Milwaukee')) return true;
            if (showCity=='chicago' && (d.city=='Chicago')) return true;
			if (showCity=='other' && (d.city!='Chicago' && d.city!='Milwaukee')) return true;
			return false;
		}
	};
        
    $scope.filterVerifiedBy = function(showVerifiedBy){
		return function(d){
			if (showVerifiedBy=='all') return true;
            if (showVerifiedBy=='user' && (d.verifiedObject)) return true;
            if (showVerifiedBy=='ben' && (d.verifiedBy=='bbexpress@gmail.com')) return true;
            if (showVerifiedBy=='brian' && (d.verifiedBy=='bmkopp10@gmail.com')) return true;
			if (showVerifiedBy=='lemarc' && (d.verifiedBy=='lemarcfj@me.com')) return true;
			return false;
		}
	};    
        
    $scope.filterUserSubmitted = function(showUserSubmitted){
		return function(d){
			if (showUserSubmitted==false) return true;
            if (showUserSubmitted==true && (d.userSubmitted)) return true;
			return false;
		}
	};    
        
    $scope.filterDay = function(showDay){
		return function(d){
            if(!angular.isUndefined(d.daysOfWeek)){
                if (showDay=='all') return true;            
                if (showDay=='monday' && (d.daysOfWeek.monday=='yes')) return true;
                if (showDay=='tuesday' && (d.daysOfWeek.tuesday=='yes')) return true;
                if (showDay=='wednesday' && (d.daysOfWeek.wednesday=='yes')) return true;
                if (showDay=='thursday' && (d.daysOfWeek.thursday=='yes')) return true;
                if (showDay=='friday' && (d.daysOfWeek.friday=='yes')) return true;
                if (showDay=='saturday' && (d.daysOfWeek.saturday=='yes')) return true;
                if (showDay=='sunday' && (d.daysOfWeek.sunday=='yes')) return true;
                return false;
            }
		}
	};
        
    $scope.filterRooftop = function(showRooftop){
 		return function(d){
 			if (showRooftop==false) return true;
 			if (d.rooftop==true) return true;
 			return false;
 		}
 	};
     
     $scope.toggleRooftopFilter = function() {
         if ($rootScope.filterOptions.showRooftop==false){
             $rootScope.filterOptions.showRooftop=true;
         } else {
             $rootScope.filterOptions.showRooftop=false;
         }
     }
        
    $scope.verifyImage = function(image, deal){
      
      angular.forEach(deal.sharedImages, function(thisImage, key){
          console.log(thisImage);
          console.log(key);
          if(image.url = thisImage.url){
              if(!angular.isUndefined(deal.daysOfWeek)){
                  console.log(deal);
                  fbutil.ref('recurringDeals', deal.$id, 'sharedImages', key, 'verified').set(true);
              }else{
                  
                    var start = new Date(deal.startTime);
                    var startDate = moment(start.getTime()).format('YYYYMMDD');
                    var end = new Date(deal.endTime);
                    var endDate = moment(end.getTime()).format('YYYYMMDD');

                    fbutil.ref('todaysDeals/' + startDate + '/' + deal.$id + '/sharedImages/' + key + '/verified').set(true);
                    if(startDate != endDate){
                        fbutil.ref('todaysDeals/' + endDate + '/' + deal.$id + '/sharedImages/' + key + '/verified').set(true);
                    }
                  
              }
          }
          
      });
        
    };
    
        
             
    $scope.deleteImage = function(image, deal){
      
      angular.forEach(deal.sharedImages, function(thisImage, key){
          console.log(thisImage);
          console.log(key);
          if(image.url = thisImage.url){
              if(!angular.isUndefined(deal.daysOfWeek)){
                  console.log(deal);
                  fbutil.ref('recurringDeals', deal.$id, 'sharedImages', key).remove();
              }else{
                  
                    var start = new Date(deal.startTime);
                    var startDate = moment(start.getTime()).format('YYYYMMDD');
                    var end = new Date(deal.endTime);
                    var endDate = moment(end.getTime()).format('YYYYMMDD');

                    fbutil.ref('todaysDeals/' + startDate + '/' + deal.$id + '/sharedImages/' + key).remove();
                    if(startDate != endDate){
                        fbutil.ref('todaysDeals/' + endDate + '/' + deal.$id + '/sharedImages/' + key).remove();
                    }
                  
              }
              
              fbutil.ref('businesses', deal.businessID, 'sharedImages', key).remove();
              
          }
          
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
    
angular.module('myApp.home').directive('ngReallyClick', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                var message = attrs.ngReallyMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngReallyClick);
                }
            });
        }
    }
}]);

    
    
    
})(angular);
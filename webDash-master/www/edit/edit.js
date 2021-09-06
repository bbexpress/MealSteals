angular.module('starter.controllers-edit', ['firebase', 'firebase.utils'])

.controller('EditDealCtrl', function($scope, $ionicModal, $rootScope, $firebaseArray, fbutil, $stateParams, $timeout, $ionicActionSheet, $firebaseObject, AccountBase, Upload, CordovaCamera, Auth, $state, $q, $cordovaToast, $ionicLoading) {
  
    
    $scope.$on('editDeal', function (event, args) {
        $scope.thisDeal = args;
        $scope.dealID = args.$id;
        $scope.startEdit();
     
    });
    
    $scope.closeEditDeal = function() {
        $rootScope.$broadcast('closeEditDeal');  
    };
    
    $scope.backgroundImage = 'img/adddealbg.png';
    
    $scope.moreInformationNeeded = function(info){
        alert (info);
//      window.plugins.toast.showWithOptions({
//        message: info,
//        duration: "short", // 2000 ms
//        position: "center",
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
    
  $scope.startEdit = function (){ 
    
   
          if(!angular.isUndefined($scope.thisDeal.daysOfWeek)){
               $scope.dealObj = $firebaseObject(fbutil.ref('recurringDeals/', $scope.dealID));
                $scope.dealObj.$loaded().then(function(){ 
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
     
    }

    
    
    
    
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
    
    
   $ionicModal.fromTemplateUrl('add/image-gallery.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modalImageGallery = modal;
   });

   $scope.closeImageGallery = function() {
    $scope.modalImageGallery.hide();
   };
    
//     // update deal image Action Sheet
//  $scope.uploadPicture = function() {
//         // Show the action sheet
//            $ionicActionSheet.show({
//                buttons: [
//                    { text: 'Take a new picture' },
//                    { text: 'Import from phone library' },
//                ],
//                titleText: 'Update Deal Image',
//                cancelText: 'Cancel',
//                cancel: function() {
//                    // add cancel code..
//                },
//                buttonClicked: function(sourceTypeIndex) {
//                    proceed(sourceTypeIndex)
//                    return true;
//                }
//            });
//            function proceed(sourceTypeIndex) {
//              $scope.uploadCamera(sourceTypeIndex).then(
//                function(success){
//                  //loadProfileData();
//                }
//              );
//            };
//  };
//    
//    
//    
//  // capture deal image
//  $scope.uploadCamera = function(sourceTypeIndex) {
//      console.log('in UploadCamera');
//      
//      var options = {
//            quality:            100,
//		    allowEdit :         true,
////		    targetWidth:        800,
////            targetHeight:       600,
//            correctOrientation: true,
//		    saveToPhotoAlbum:   true
//	    };
//      
//    CordovaCamera.newImage(sourceTypeIndex, options).then(
//      function(imageData){
//        if(imageData != undefined) {
//            console.log("image data defined");
//            $scope.uploadFiles(imageData, 'dealFullImage');
//        } else {
//            console.log("image data undefined");
//          return imageData;
//        }
//      }, function(error){
//        Codes.handleError(error);
//      }
//    );
////      
////      
////          var options = {
////            quality:            50,
////		    allowEdit :         false,
////		    targetWidth:        100,
////            targetHeight:       75,
////            correctOrientation: true,
////		    saveToPhotoAlbum:   false
////	    };
////      
////    CordovaCamera.newImage(sourceTypeIndex, options).then(
////      function(imageData){
////        if(imageData != undefined) {
////            console.log("image data defined");
////            $scope.uploadFiles(imageData, 'img');
////        } else {
////            console.log("image data undefined");
////          return imageData;
////        }
////      }, function(error){
////        Codes.handleError(error);
////      }
////    );  
//  };
//   
//    
//        
//      function dataURItoBlob(dataURI) {
//          // convert base64/URLEncoded data component to raw binary data held in a string
//          var byteString;
//          if (dataURI.split(',')[0].indexOf('base64') >= 0)
//              byteString = atob(dataURI.split(',')[1]);
//          else
//              byteString = unescape(dataURI.split(',')[1]);
//
//          // separate out the mime component
//          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
//
//          // write the bytes of the string to a typed array
//          var ia = new Uint8Array(byteString.length);
//          for (var i = 0; i < byteString.length; i++) {
//              ia[i] = byteString.charCodeAt(i);
//          }
//
//          return new Blob([ia], {type:mimeString});
//      }
//
//    $rootScope.policy = 'eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJtZWFsc3RlYWxzeWVzIn0seyJhY2wiOiAicHVibGljLXJlYWQifSxbInN0YXJ0cy13aXRoIiwiJENvbnRlbnQtVHlwZSIsIiJdLFsic3RhcnRzLXdpdGgiLCIka2V5IiwiIl1dfQ==';
//    $rootScope.signature = 'OIiCj+2av3cmeabevQ4t9QtceMs=';
//    $rootScope.timeID = String(new Date().getTime());
//        
//        
//        
//
//    $scope.uploadFiles = function(image, fileName) {
//
//                var blob = dataURItoBlob(image);
//                var file = new FormData(document.forms[0]);
//
//                file.append(fileName, blob);
//
//        $scope.imageName = fileName;
//
//        //var file = image;
//        var fd = new FormData();
//
//        var stamp = String(new Date().getTime());
//        
//        var key = stamp + fileName;
//            console.log(key);
//
//        fd.append('key', key);
//        fd.append('acl', 'public-read'); 
//        fd.append('Content-Type', "image.jpeg");      
//        fd.append('AWSAccessKeyId', 'AKIAJ46C4XJRMO6JBATA');
//        fd.append('policy', $rootScope.policy)
//        fd.append('signature',$rootScope.signature);
//
//        fd.append("file",blob);
//            console.log(fd);
//
//        $scope.newImage = "http://s3.amazonaws.com/mealstealsyes/" + key; 
//        console.log($scope.newImage);
//        
//        var xhr = new XMLHttpRequest();
//
//        xhr.addEventListener("progress", updateProgress);
//        xhr.addEventListener("load", transferComplete);
//        xhr.addEventListener("error", transferFailed);
//        xhr.addEventListener("abort", transferCanceled);
//
//        xhr.open('POST', 'http://s3.amazonaws.com/mealstealsyes/', true); //MUST BE LAST LINE BEFORE YOU SEND 
//
//        xhr.send(fd);
//        
//        
//        
//        $scope.imageObject = {largeImage: $scope.newImage};
//        fbutil.ref('businesses', $scope.dealObj.businessID, 'dealImages').push($scope.imageObject);
//        $ionicLoading.show({
//              template: 'Uploading...',
//              duration: 3000
//        });
//             
//    }
//
//  
//    
//  // progress on transfers from the server to the client (downloads)
//function updateProgress (oEvent) {
//  if (oEvent.lengthComputable) {
//    var percentComplete = oEvent.loaded / oEvent.total;
//    // ...
//  } else {
//    // Unable to compute progress information since the total size is unknown
//  }
//}
//
//function transferComplete(evt) {
//  console.log("The transfer is complete.");
//    $timeout(function(){
//         $scope.dealObj[$scope.imageName] = $scope.newImage;
//      }, 2000)
//       
//    
//    
//}
//
//function transferFailed(evt) {
//  console.log("An error occurred while transferring the file.");
//}
//
//function transferCanceled(evt) {
//  console.log("The transfer has been canceled by the user.");
//}
//    

      
      
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

    $scope.uploadFiles = function(file, saveToKey, maxWidth, maxHeight) {
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
                         console.log($scope.newDeal.dealFullImage);

                    $scope.imageObject = {largeImage: $scope.newImage};
                    var bizID = $scope.currentLoc['id'];
                    fbutil.ref('businesses', bizID, 'dealImages').push($scope.imageObject);
                    $ionicLoading.show({
                          template: 'Uploading...',
                          duration: 3000
                    });
                        
                        
                        
                        
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
      
      
        console.log($scope.dealObj);
      
        if($scope.recurringCheck == true){
            $scope.dealObj.$save();
            if(!angular.isUndefined($scope.dealObj.deals) && !angular.isUndefined($scope.dealObj.deals[todayDate])){
                

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
            
            $scope.dealObj.$save();
            
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
        $state.go('tab.deals');    
        
    }
    
    
})

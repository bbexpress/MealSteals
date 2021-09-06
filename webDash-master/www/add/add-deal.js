angular.module('starter.controllers-add', ['firebase', 'firebase.utils'])

.controller('AddDealCtrl', function($scope, $state, $uibModal, AccountBase, $ionicActionSheet, Auth, $timeout, CordovaCamera, Upload, fbutil, Utils, Firebase, $firebaseArray, $firebaseObject, $q, $rootScope, $ionicModal, $cordovaToast, $ionicLoading) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
    $ionicLoading.show({
      template: 'Loading...',
      duration: 1000
    });
    
    $scope.seenAdd = function(){      
        fbutil.ref('users/' + userUid + '/walkthrough/' + 'seenAdd').set(true);
    };
    
        //$rootScope.currentUser = $firebaseObject($rootScope.userFB);
    
    console.log($rootScope.currentUser);

  var userUid = Auth.getAuthState().$$state.value.uid;
  AccountBase.init(userUid);
  console.log($rootScope.currentUser);
    
    $scope.testImage = function(){
        $scope.uploadFiles($rootScope.currentUser.profilePicture,'dealFullImage');
    }
    
  $scope.loadStyleGuide = function(){
        window.open('http://mealsteals.com/styleguide.html', '_blank', 'location=yes');  
  };    
    
  $scope.newDeal = {};
  $scope.startNewDeal = function(){
      
    var date = new Date(); // 4:55
    roundMinutes(date); // 5:00

    function roundMinutes(date) {
            date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
            date.setMinutes(0);
            return date;
    }

    $scope.backgroundImage = 'img/adddealbg.png';

    $scope.newDeal = {
      date:'',
      name: '',
      description: '',
      locName: String($rootScope.bizInfo[$scope.currentLoc['id']].businessName),
      icon: String($rootScope.bizInfo[$scope.currentLoc['id']].icon),
      //img: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
      dealFullImage: $scope.backgroundImage, //NEW CODE
      largeImg: String($rootScope.bizInfo[$scope.currentLoc['id']].detailBackground),
      detailBackgroundFull: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
      address: String($rootScope.bizInfo[$scope.currentLoc['id']].address),
      phone: String($rootScope.bizInfo[$scope.currentLoc['id']].phone),
      lat: String($rootScope.bizInfo[$scope.currentLoc['id']].lat),
      lon: String($rootScope.bizInfo[$scope.currentLoc['id']].lon),
      city: String($rootScope.bizInfo[$scope.currentLoc['id']].city),
      state: String($rootScope.bizInfo[$scope.currentLoc['id']].state),
      rooftop: String($rootScope.bizInfo[$scope.currentLoc['id']].rooftop),
      patio: String($rootScope.bizInfo[$scope.currentLoc['id']].patio),
      vegan: String($rootScope.bizInfo[$scope.currentLoc['id']].vegan),
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
      startTime: roundMinutes(date), //new Date()
      //startTime: new Date(),
      endTime: roundMinutes(date), //new Date()
      //endTime: new Date(),
      foodOrDrink: 'food',
      exclusive: 'no',
      timeType: 'deal',
      redeemable: 'no',
      totalRating: 0,
      businessID: $scope.currentLoc['id']
    };
      
      if(angular.isUndefined(
      $scope.currentLoc['id'].approved) || $scope.currentLoc['id'].approved != false){
          $scope.newDeal['approved'] = true;
      }else{
          $scope.newDeal['approved'] = false;
      }
  };

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
    
  // Run once initially
  $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
  if ($scope.currentLoc['id'] != null) $scope.startNewDeal();
  // Run again every time the location changes
  $rootScope.$on('locationChanged', function(){
    $scope.currentLoc = {'id':$rootScope.getCurrentLoc()};
    if ($scope.currentLoc['id'] != null) $scope.startNewDeal();
  });

  $scope.hstep = 1;
  $scope.mstep = 15;
  $scope.ismeridian = true;


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

    $scope.addNewDeal = function(){

      $scope.newDeal.lat = parseFloat($scope.newDeal.lat);
      $scope.newDeal.lon = parseFloat($scope.newDeal.lon);
        
      if(!angular.isUndefined($rootScope.bizInfo[$scope.currentLoc['id']].approved) && $rootScope.bizInfo[$scope.currentLoc['id']].approved == false){
          $scope.newDeal.approved = false;
      } else {
          $scope.newDeal.approved = true;
      }

      if($scope.newDeal.name == '' ||
      $scope.newDeal.description == ''){
          
          $scope.moreInformationNeeded('Fill out name and description');
          
      }else{
      
          if($scope.newDeal.timeType == "event"){
              delete $scope.newDeal.foodOrDrink;
          }

          if ($scope.newDeal.type == 'recurring'){

            if($scope.newDeal.daysOfWeek.monday == 'no' &&
               $scope.newDeal.daysOfWeek.tuesday == 'no' &&
               $scope.newDeal.daysOfWeek.wednesday == 'no' &&
               $scope.newDeal.daysOfWeek.thursday == 'no' &&
               $scope.newDeal.daysOfWeek.friday == 'no' &&
               $scope.newDeal.daysOfWeek.saturday == 'no' &&
               $scope.newDeal.daysOfWeek.sunday == 'no'){
                
                    $scope.moreInformationNeeded('pick days of the week to run');
                
            }else{

                var startdate = new Date($scope.newDeal.startTime);
                var enddate = new Date($scope.newDeal.endTime);


                var startClockTime = moment(startdate.getTime()).format('HH:mm');
                var endClockTime = moment(enddate.getTime()).format('HH:mm');

                var timeRange = convertToUnixOffset(startClockTime, endClockTime, $rootScope.bizInfo[$scope.currentLoc['id']].timezone);

                $scope.newDeal.startTime = timeRange[0];
                $scope.newDeal.endTime = timeRange[1];

                $scope.newDeal.timezone = $rootScope.bizInfo[$scope.currentLoc['id']].timezone;

                console.log($scope.newDeal);  

                var start = new Date($scope.newDeal.startTime);
                var startDate = moment(start.getTime()).format('YYYYMMDD');
                var end = new Date($scope.newDeal.endTime);
                var endDate = moment(end.getTime()).format('YYYYMMDD');

                var currentDay = moment().tz($scope.newDeal.timezone).format('dddd').toLowerCase();
                
                if ($scope.newDeal.daysOfWeek[currentDay] =='yes'){
                    var newKey = fbutil.ref('todaysDeals/' + startDate).push().key();

                    $scope.newDeal['deals'] = {};
                    $scope.newDeal.deals[startDate] = newKey;
                }
                // create recurring template
                var recKey = fbutil.ref('recurringDeals').push().key();
                $scope.newDeal['key'] = recKey;
               fbutil.ref('recurringDeals/' + recKey).set($scope.newDeal);

  
                if ($scope.newDeal.daysOfWeek[currentDay] =='yes'){
                    delete $scope.newDeal.daysOfWeek;
                    $scope.newDeal.recurringDealID = recKey;
                    $scope.newDeal.key = newKey;

                    fbutil.ref('todaysDeals/' + startDate + '/' + newKey).set($scope.newDeal);
                    if(startDate != endDate){
                        fbutil.ref('todaysDeals/' + endDate + '/' + newKey).set($scope.newDeal);
                    }
                }
                    
            $scope.startNewDeal();
                alert ('Deal Added!');
//            window.plugins.toast.showWithOptions({
//                    message: "Deal added!",
//                    duration: "short", // 2000 ms
//                    position: "center",
//                    styling: {
//                      opacity: 0.8, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
//                      backgroundColor: '#333333', // make sure you use #RRGGBB. Default #333333
//                      textColor: '#FFFFFF', // Ditto. Default #FFFFFF
//                      textSize: 13, // Default is approx. 13.
//                      //cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
//                      //horizontalPadding: 20, // iOS default 16, Android default 50
//                      //verticalPadding: 16 // iOS default 12, Android default 30
//                    }
//            });
            $state.go('tab.deals');
            // Utils.showMessage("Deal Added!");
            if ($rootScope.blackList != true) {ion  
                mixpanel.track("Add Deal", {"Email": Auth.AuthData.password.email, "Business": $rootScope.bizInfo[$scope.currentLoc['id']].businessName});
            } 
            
                
          }


          } else {

              console.log('deal date');
              console.log($scope.newDeal.date);
              
             if($scope.newDeal.date == ''){
              
                 $scope.moreInformationNeeded('Must pick a date');
                 
             }else{
              
                $scope.newDeal.type = 'onetime';
                delete $scope.newDeal.daysOfWeek;



                  console.log($scope.newDeal.date);
                var dealDate = moment($scope.newDeal.date.getTime()).format('YYYY-MM-DD');
                  console.log(dealDate);
                var startdate = new Date($scope.newDeal.startTime);
                var enddate = new Date($scope.newDeal.endTime);

                var startClockTime = moment(startdate.getTime()).format('HH:mm');
                var endClockTime = moment(enddate.getTime()).format('HH:mm');

                var timeRange = convertToUnixOffset(startClockTime, endClockTime, $rootScope.bizInfo[$scope.currentLoc['id']].timezone, dealDate);

                $scope.newDeal.startTime = timeRange[0];
                $scope.newDeal.endTime = timeRange[1];
                $scope.newDeal.timezone = $rootScope.bizInfo[$scope.currentLoc['id']].timezone;

                $scope.newDeal.lat = parseFloat($scope.newDeal.lat);
                $scope.newDeal.lon = parseFloat($scope.newDeal.lon);

                // insert into deals and create geofire key
                 

                var start = new Date($scope.newDeal.startTime);
                var startDate = moment(start.getTime()).format('YYYYMMDD');
                var end = new Date($scope.newDeal.endTime);
                var endDate = moment(end.getTime()).format('YYYYMMDD');

                var newKey = fbutil.ref('todaysDeals/' + startDate).push().key();

                 $scope.newDeal['key'] = newKey;
                fbutil.ref('todaysDeals/' + startDate + '/' + newKey).set($scope.newDeal);
                if(startDate != endDate){
                    fbutil.ref('todaysDeals/' + endDate + '/' + newKey).set($scope.newDeal);
                }
                 
                fbutil.ref('businesses/' + $scope.newDeal.businessID + '/flash/' + startDate).set($scope.newDeal);
                console.log('good!');
  		  
                console.log('adding flash deal!');
                console.log($scope.newDeal);
                 
                 

                if ($rootScope.blackList != true) { 
                 
                            emailjs.send("flash_deal","template_flash",{
                                city: $scope.newDeal.city,
                                date: $scope.newDeal.date,
                                businessName: $scope.newDeal.locName,
                                start: $scope.newDeal.startTime,
                                end: $scope.newDeal.endTime,
                                name:  $scope.newDeal.name,
                                description:  $scope.newDeal.description,
                            })
                    .then(function(response) {
                       console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                    }, function(err) {
                       console.log("FAILED. error=", err);
                    });
                 
                }

                $scope.startNewDeal();
                 alert ('FlashSteal added!');
//                window.plugins.toast.showWithOptions({
//                    message: "FlashSteal added!",
//                    duration: "short", // 2000 ms
//                    position: "center",
//                    styling: {
//                      opacity: 0.8, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
//                      backgroundColor: '#333333', // make sure you use #RRGGBB. Default #333333
//                      textColor: '#FFFFFF', // Ditto. Default #FFFFFF
//                      textSize: 13, // Default is approx. 13.
//                      //cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
//                      //horizontalPadding: 20, // iOS default 16, Android default 50
//                      //verticalPadding: 16 // iOS default 12, Android default 30
//                    }
//                  });
                $state.go('tab.deals');
                if ($rootScope.blackList != true) {  
                mixpanel.track("Add FlashSteal", {"Email": Auth.AuthData.password.email, "Business": $rootScope.bizInfo[$scope.currentLoc['id']].businessName});
                } 
                
            }

          }

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
    
     
  $scope.loadImageGallery = function(){
      $scope.bizImages = $firebaseArray(fbutil.ref('businesses/'+$scope.currentLoc['id']+'/dealImages')); 
      console.log($scope.bizImages);
      $scope.modalImageGallery.show();
      alert ("Hold down on image to delete");
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
      $scope.newDeal.dealFullImage = img.largeImage;
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
    var bizID = $scope.currentLoc['id'];
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
    
//  // update deal image Action Sheet
//  $scope.uploadPicture = function() {
//         // Show the action sheet
//            $ionicActionSheet.show({
//                buttons: [
//                    { text: 'Take a new picture' },
//                    { text: 'Import from phone library' },
//                    //{ text: 'Import from MealSteals library' },
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
//              $scope.uploadCamera(sourceTypeIndex);
//            };
//  };
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
//      
//  /*    
//          var options = {
//            quality:            50,
//		    allowEdit :         false,
//		    targetWidth:        100,
//            targetHeight:       75,
//            correctOrientation: true,
//		    saveToPhotoAlbum:   false
//	    };
//      
//   CordovaCamera.newImage(sourceTypeIndex, options).then(
//      function(imageData){
//        if(imageData != undefined) {
//            console.log("image data defined");
//            $scope.uploadFiles(imageData, 'img');
//        } else {
//            console.log("image data undefined");
//          return imageData;
//        }
//      }, function(error){
//        Codes.handleError(error);
//      }
//    );*/  
//  };
//   
//        
//      function dataURItoBlob(dataURI) {
//      // convert base64/URLEncoded data component to raw binary data held in a string
//      var byteString;
//      if (dataURI.split(',')[0].indexOf('base64') >= 0)
//          byteString = atob(dataURI.split(',')[1]);
//      else
//          byteString = unescape(dataURI.split(',')[1]);
//
//      // separate out the mime component
//      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
//
//      // write the bytes of the string to a typed array
//      var ia = new Uint8Array(byteString.length);
//      for (var i = 0; i < byteString.length; i++) {
//          ia[i] = byteString.charCodeAt(i);
//      }
//
//      return new Blob([ia], {type:mimeString});
//  }
//
//    $rootScope.policy = 'eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJtZWFsc3RlYWxzeWVzIn0seyJhY2wiOiAicHVibGljLXJlYWQifSxbInN0YXJ0cy13aXRoIiwiJENvbnRlbnQtVHlwZSIsIiJdLFsic3RhcnRzLXdpdGgiLCIka2V5IiwiIl1dfQ==';
//    $rootScope.signature = 'OIiCj+2av3cmeabevQ4t9QtceMs=';
//    $rootScope.timeID = String(new Date().getTime());
//        
//        
//        
//    $scope.uploadFiles = function(image, fileName) {
//
//        $scope.imageName = fileName;
//        
//                var blob = dataURItoBlob(image);
//                var file = new FormData(document.forms[0]);
//
//                file.append(fileName, blob);
//
//
//        var stamp = String(new Date().getTime());
//
//        //var file = image;
//        var fd = new FormData();
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
//        $scope.newImage = "http://s3.amazonaws.com/mealstealsyes/" + key;
//
//        //$scope.newDeal.img = "http://s3.amazonaws.com/mealstealsyes/" + key;
//        $scope.newDeal.largeImg = "http://s3.amazonaws.com/mealstealsyes/" + key;
//        $scope.newDeal.detailBackgroundFull = "http://s3.amazonaws.com/mealstealsyes/" + key;
//
//        $scope.imageObject = {largeImage: $scope.newImage};
//        var bizID = $scope.currentLoc['id'];
//        fbutil.ref('businesses', bizID, 'dealImages').push($scope.imageObject);
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
//         $scope.newDeal[$scope.imageName] = $scope.newImage;
//        console.log($scope.newImage);
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
                    $scope.newDeal.largeImg = "http://s3.amazonaws.com/mealstealsyes/" + key;
                    $scope.newDeal.detailBackgroundFull = "http://s3.amazonaws.com/mealstealsyes/" + key;
                        
                    $scope.newDeal[saveToKey] = $scope.newImage;
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
      
    
    
  
})
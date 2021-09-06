(function(angular) {
  "use strict"; 
    var app = angular.module('myApp.addDeal', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services']);

app.controller('AddDealCtrl', function($scope, $uibModalInstance, $timeout, $firebaseObject, $firebaseArray, fbutil, biz, $q, Upload, dealType, audience, $mdToast, $rootScope, crowdSourceObj) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //

    console.log(biz);
    $scope.biz = biz;
    console.log(dealType);
    console.log(audience);
    console.log(crowdSourceObj);
    
    
    
    
    $scope.displayOptions = {
      'addDeal': 'details',
    };
    
    $scope.myDate = new Date();

    $scope.minDate = new Date(
        $scope.myDate.getFullYear(),
        $scope.myDate.getMonth(),
        $scope.myDate.getDate()
    );
    
    $scope.closeAddDeal = function(){
        $uibModalInstance.dismiss();
    };
    
  $scope.newDeal = {};
    
  $scope.startNewDeal = function(){
    var today = Date.now();
    var date = new Date(); // 4:55
    roundMinutes(date); // 5:00

    function roundMinutes(date) {
            date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
            date.setMinutes(0);
            return date;
    }
      console.log(today);
    $scope.newDeal = {
      date:'',
      name: '',
      description: '',
      locName: biz.businessName,
      icon: biz.icon,
      //img: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
      dealFullImage: false, //NEW CODE
      largeImg: biz.detailBackground,
      detailBackgroundFull: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
      address: biz.address,
      phone: biz.phone,
      lat: biz.lat,
      lon: biz.lon,
      city: biz.city,
      state: biz.state,
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
      type: false,
      startTime: roundMinutes(date), //new Date()
      //startTime: new Date(),
      endTime: roundMinutes(date), //new Date()
      //endTime: new Date(),
      foodOrDrink: false,
      exclusive: 'no',
      timeType: dealType,
      redeemable: 'no',
      totalRating: 0,
      businessID: biz.$id,
      tags: [],
      restrictedTo: [],
      createdAt:today
    };
      if(!angular.isUndefined(biz.vegan)){
          $scope.newDeal['vegan'] = biz.vegan;
      } else {
          $scope.newDeal['vegan'] = false;
      }
      if(!angular.isUndefined(biz.rooftop)){
          $scope.newDeal['rooftop'] = biz.rooftop;
      } else {
          $scope.newDeal['rooftop'] = false;
      }
      if(!angular.isUndefined(biz.patio)){
          $scope.newDeal['patio'] = biz.patio;
      } else {
          $scope.newDeal['patio'] = false;
      }
      if(!angular.isUndefined(biz.games)){
          $scope.newDeal['games'] = biz.games;
      } else {
          $scope.newDeal['games'] = false;
      }
      
      
      if (audience!='all'){
          $scope.newDeal.type='restricted';
      }
      
      if(angular.isUndefined(
      biz.approved) || biz.approved != false){
          $scope.newDeal['approved'] = true;
      }else{
          $scope.newDeal['approved'] = false;
      }
      
  };
    
  $scope.createCrowdSourceObj = function(){
    var today = Date.now();
    var date = new Date(); // 4:55
    roundMinutes(date); // 5:00

    function roundMinutes(date) {
            date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
            date.setMinutes(0);
            return date;
    }
      console.log(today);
    $scope.newDeal = {
      date:'',
      name:crowdSourceObj.name,
      description: crowdSourceObj.description,
      locName: biz.businessName,
      icon: crowdSourceObj.icon,
      //img: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
      dealFullImage: crowdSourceObj.dealFullImage, //NEW CODE
      //largeImg: biz.detailBackground,
      detailBackgroundFull: 'http://s3.amazonaws.com/mealstealsyes/1445043359608food-icon.png',
      address: biz.address,
      phone: biz.phone,
      lat: biz.lat,
      lon: biz.lon,
      city: biz.city,
      state: biz.state,
      featured: 'no',
      daysOfWeek: crowdSourceObj.daysOfWeek,
      type: 'recurring',
      startTime: crowdSourceObj.startTime, //new Date()
      //startTime: new Date(),
      endTime: crowdSourceObj.endTime, //new Date()
      //endTime: new Date(),
      foodOrDrink: crowdSourceObj.foodOrDrink,
      exclusive: 'no',
      timeType: crowdSourceObj.timeType,
      redeemable: 'no',
      totalRating: 0,
      businessID: biz.$id,
      tags: [],
      restrictedTo: [],
      createdAt:crowdSourceObj.createdAt,
      submittedByUID: crowdSourceObj.submittedByUID,
      submittedByUsername: crowdSourceObj.submittedByUsername,
      userSubmitted: crowdSourceObj.userSubmitted
    };
      if(!angular.isUndefined(biz.vegan)){
          $scope.newDeal['vegan'] = biz.vegan;
      } else {
          $scope.newDeal['vegan'] = false;
      }
      if(!angular.isUndefined(biz.rooftop)){
          $scope.newDeal['rooftop'] = biz.rooftop;
      } else {
          $scope.newDeal['rooftop'] = false;
      }
      if(!angular.isUndefined(biz.patio)){
          $scope.newDeal['patio'] = biz.patio;
      } else {
          $scope.newDeal['patio'] = false;
      }
      if(!angular.isUndefined(biz.games)){
          $scope.newDeal['games'] = biz.games;
      } else {
          $scope.newDeal['games'] = false;
      }
      
      if(angular.isUndefined(
      biz.approved) || biz.approved != false){
          $scope.newDeal['approved'] = true;
      }else{
          $scope.newDeal['approved'] = false;
      }
      
  };
    
  if (crowdSourceObj){
    console.log('openning crowdsource object');
    $scope.createCrowdSourceObj();  
  } else {
    console.log('creating new deal object');
    $scope.startNewDeal();
  }
    
  $scope.specialEvent = function() {
      $scope.newDeal.specialEventName = 'Happy Birthday Happy Hour';
      $scope.newDeal.specialEventDealIcon = 'http://dashboard.mealsteals.com/app/images/hbhh-deal-icon.png';
      $scope.newDeal.type='onetime';
      $scope.newDeal.redeemable='yes';
      $scope.newDeal.recurringDealID = false;
      $scope.newDeal.icon = 'http://dashboard.mealsteals.com/app/images/hbhh-icon.png'; 
      $scope.newDeal.date = new Date();
      $scope.newDeal.date.setDate(15);
      $scope.newDeal.date.setMonth(5);
      //$scope.newDeal.date = 'Sat Jul 15 2017 00:00:00 GMT-0500 (CDT)';
  };
    
  $scope.testDeal = function(){
        console.log($scope.newDeal);  
  };
    
    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };

  $scope.toastPosition = angular.extend({},last);

  $scope.getToastPosition = function() {
    sanitizePosition();

    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  function sanitizePosition() {
    var current = $scope.toastPosition;

    if ( current.bottom && last.top ) current.top = false;
    if ( current.top && last.bottom ) current.bottom = false;
    if ( current.right && last.left ) current.left = false;
    if ( current.left && last.right ) current.right = false;

    last = angular.extend({},current);
  }
    
  $scope.showSimpleToast = function() {
    var pinTo = $scope.getToastPosition();

    $mdToast.show(
      $mdToast.simple()
        .textContent('Simple Toast!')
        .position(pinTo )
        .hideDelay(3000)
    );
  };
    
  $scope.showError = function(error) {
      $scope.errorMessage = error;
      $scope.dealError = true;
      $timeout(function(){
        $scope.dealError = false;
        $scope.errorMessage = null;
    },5000);
  };
    
  $scope.selectMonday = function() {
      if ($scope.newDeal.daysOfWeek.monday=='no'){
          $scope.newDeal.daysOfWeek.monday='yes';
      } else {
          $scope.newDeal.daysOfWeek.monday='no';
      }
  }
  
  $scope.selectTuesday = function() {
      if ($scope.newDeal.daysOfWeek.tuesday=='no'){
          $scope.newDeal.daysOfWeek.tuesday='yes';
      } else {
          $scope.newDeal.daysOfWeek.tuesday='no';
      }
  }
  
  $scope.selectWednesday = function() {
      if ($scope.newDeal.daysOfWeek.wednesday=='no'){
          $scope.newDeal.daysOfWeek.wednesday='yes';
      } else {
          $scope.newDeal.daysOfWeek.wednesday='no';
      }
  }
  
  $scope.selectThursday = function() {
      if ($scope.newDeal.daysOfWeek.thursday=='no'){
          $scope.newDeal.daysOfWeek.thursday='yes';
      } else {
          $scope.newDeal.daysOfWeek.thursday='no';
      }
  }
  
  $scope.selectFriday = function() {
      if ($scope.newDeal.daysOfWeek.friday=='no'){
          $scope.newDeal.daysOfWeek.friday='yes';
      } else {
          $scope.newDeal.daysOfWeek.friday='no';
      }
  }
  
  $scope.selectSaturday = function() {
      if ($scope.newDeal.daysOfWeek.saturday=='no'){
          $scope.newDeal.daysOfWeek.saturday='yes';
      } else {
          $scope.newDeal.daysOfWeek.saturday='no';
      }
  }
  
  $scope.selectSunday = function() {
      if ($scope.newDeal.daysOfWeek.sunday=='no'){
          $scope.newDeal.daysOfWeek.sunday='yes';
      } else {
          $scope.newDeal.daysOfWeek.sunday='no';
      }
  }
  
  $scope.selectExclusive = function() {
      if ($scope.newDeal.exclusive=='no'){
          $scope.newDeal.exclusive='yes';
      } else {
          $scope.newDeal.exclusive='no';
      }
  }
  
  $scope.selectRedeemable = function() {
      if ($scope.newDeal.redeemable=='no'){
          $scope.newDeal.redeemable='yes';
      } else {
          $scope.newDeal.redeemable='no';
      }
  }
   
  $scope.daysOfWeekAdd = function(d){
      var ret = '';
      if (d.daysOfWeek['monday']=='yes'){ ret += 'Mon, '; }
      if (d.daysOfWeek['tuesday']=='yes'){ ret += 'Tues, '; }
      if (d.daysOfWeek['wednesday']=='yes'){ ret += 'Wed, '; }
      if (d.daysOfWeek['thursday']=='yes'){ ret += 'Thur, '; }
      if (d.daysOfWeek['friday']=='yes'){ ret += 'Fri, '}
      if (d.daysOfWeek['saturday']=='yes'){ ret += 'Sat, '; }
      if (d.daysOfWeek['sunday']=='yes'){ ret += 'Sun, '; }
      return ret.substr(0, ret.length-2);
    }

  
  
  $scope.goImage = function() {
      //$scope.newDeal.startTime > $scope.newDeal.endTime || 
      if ($scope.newDeal.startTime == $scope.newDeal.endTime){
          $scope.showError('End time must be greater than start time');
      } else {
         if ($scope.newDeal.name.length<3 || $scope.newDeal.description.length<3) {
             $scope.showError('Please enter valid deal name & description');
         } else {
             if ($scope.newDeal.type=='recurring' &&
                 $scope.newDeal.daysOfWeek.sunday=='no' &&
                 $scope.newDeal.daysOfWeek.monday=='no' &&
                 $scope.newDeal.daysOfWeek.tuesday=='no' &&
                 $scope.newDeal.daysOfWeek.wednesday=='no' &&
                 $scope.newDeal.daysOfWeek.thursday=='no' &&
                 $scope.newDeal.daysOfWeek.friday=='no' &&
                 $scope.newDeal.daysOfWeek.saturday=='no') {
                 $scope.showError('No dates selected');
             } else if ($scope.newDeal.type=='onetime' && $scope.newDeal.date.length==''){
                 $scope.showError('No date selected');
             } else {
                 $scope.displayOptions = {'addDeal': 'image'};  
                 $scope.dealError = false;
                 $scope.errorMessage = null;
             }
         }
      }
  };
    
  $scope.goOptions = function() {
      if ($scope.newDeal.dealFullImage==false){
          $scope.showError('Must upload image');
      } else {
          $scope.displayOptions = {'addDeal': 'options'};
          $scope.dealError = false;
          $scope.errorMessage = null;
      }
  };
    
  $scope.finishDeal = function(){
      if($scope.newDeal.timeType=='event'){
          $scope.addNewDeal();
      } else {
          if ($scope.newDeal.foodOrDrink==false){
              $scope.showError('Must identify deal as food, drink or both');
          } else {
              $scope.addNewDeal();
          }
      }
  };

  $scope.moreInformationNeeded = function(info){
      alert (info);
  };    
 
 

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
        
      if(!angular.isUndefined(biz.approved) && biz.approved == false){
          $scope.newDeal.approved = false;
      } else {
          $scope.newDeal.approved = true;
      }
        
      if($scope.newDeal.timeType == "event"){
          delete $scope.newDeal.foodOrDrink;
      }

          if ($scope.newDeal.type == 'recurring'){
              
                delete $scope.newDeal.restrictedTo;  
              
                var startdate = new Date($scope.newDeal.startTime);
                var enddate = new Date($scope.newDeal.endTime);

                var startClockTime = moment(startdate.getTime()).format('HH:mm');
                var endClockTime = moment(enddate.getTime()).format('HH:mm');

                var timeRange = convertToUnixOffset(startClockTime, endClockTime, biz.timezone);

                $scope.newDeal.startTime = timeRange[0];
                $scope.newDeal.endTime = timeRange[1];

                $scope.newDeal.timezone = biz.timezone;

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
                //alert('weekly deal added');
                console.log($scope.newDeal);
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
              
                if (crowdSourceObj){
                    fbutil.ref('crowdSource/' , crowdSourceObj.$id).remove();
                }
                    
                $scope.startNewDeal();
                $uibModalInstance.dismiss();
           /* if ($rootScope.blackList != true) {  
                mixpanel.track("Add Deal", {"Email": Auth.AuthData.password.email, "Business": biz.businessName});
            }*/ 

          } else if ($scope.newDeal.type == 'onetime') {

                console.log('deal date');
                console.log($scope.newDeal.date);
              
                $scope.newDeal.type = 'onetime';
                delete $scope.newDeal.daysOfWeek;
                delete $scope.newDeal.restrictedTo;

                console.log($scope.newDeal.date);
                var dealDate = moment($scope.newDeal.date.getTime()).format('YYYY-MM-DD');
                console.log(dealDate);
                var startdate = new Date($scope.newDeal.startTime);
                var enddate = new Date($scope.newDeal.endTime);

                var startClockTime = moment(startdate.getTime()).format('HH:mm');
                var endClockTime = moment(enddate.getTime()).format('HH:mm');

                var timeRange = convertToUnixOffset(startClockTime, endClockTime, biz.timezone, dealDate);

                $scope.newDeal.startTime = timeRange[0];
                $scope.newDeal.endTime = timeRange[1];
                $scope.newDeal.timezone = biz.timezone;

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
                 
                //alert('flashsteal added');
                console.log($scope.newDeal);
                 
                fbutil.ref('businesses/' + $scope.newDeal.businessID + '/flash/' + startDate).set($scope.newDeal);
                console.log('good!');
  		  
                console.log('adding flash deal!');
                console.log($scope.newDeal);
                 
                 
              // auth data not populating atm
               /* if ($rootScope.userOptions.superadmin != 'yes' && $rootScope.userOptions.admin != 'yes') { 
                 
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
                 
                }*/

                $scope.startNewDeal();
                $uibModalInstance.dismiss();
                //if ($rootScope.blackList != true) {  
                //mixpanel.track("Add FlashSteal", {"Email": Auth.AuthData.password.email, "Business": biz.businessName});
                //} 
                
            

          } else {
              console.log($scope.newDeal);
              console.log(audience);
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
      $scope.showGallery = true;
      $scope.bizImages = $firebaseArray(fbutil.ref('businesses/' + biz.$id + '/dealImages')); 
  };  
    
  $scope.closeGallery = function(){
      $scope.showGallery = false;
  };
    
  $scope.selectImage = function(img) {
      $scope.newDeal.dealFullImage = img.largeImage;
      $scope.showGallery = false;
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
    var bizID = biz.$id;
    fbutil.ref('businesses', bizID, 'dealImages', img.$id).set(null);      
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
                    var bizID = biz.$id;
                    fbutil.ref('businesses', bizID, 'dealImages').push($scope.imageObject);
                
//                        
//                        $timeout(function() {
//                        }, 2500);
                        
                        
                        
                        
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
})(angular);
(function(angular) {
  "use strict"; 
    var app = angular.module('myApp.upgrade-deal', ['firebase.auth', 'firebase', 'firebase.utils', 'ngRoute', 'services']);

app.controller('UpgradeDealCtrl', function ($scope, $rootScope, $uibModalInstance, $timeout, upgradeDeal, type, biz, $firebaseObject, $firebaseArray, fbutil, FBURL, $q) {

    console.log(upgradeDeal);
    console.log(type);
    console.log(biz);
    
    $scope.deal = upgradeDeal;
    $scope.type = type;
    $scope.biz = biz;
    
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
    
    var availableDatesObj = {};
    availableDatesObj = upgradeDeal.daysOfWeek;

    $scope.availableDates = [];
    angular.forEach(availableDatesObj, function (value) {
        if (value != "no"){
            $scope.availableDates.push(value);
        }
    });
    $scope.availableDates.sort(function(a, b){return a-b});
    console.log($scope.availableDates);
    $scope.availablePopupDates = function(date) {
    
        var day = date.getDay(); 
        
        if(day == 0 && $scope.deal.daysOfWeek['sunday'] == 'yes'){
            return true;
        }
        if(day == 1 && $scope.deal.daysOfWeek['monday'] == 'yes'){
            return true;
        }
        if(day == 2 && $scope.deal.daysOfWeek['tuesday'] == 'yes'){
            return true;
        }
        if(day == 3 && $scope.deal.daysOfWeek['wednesday'] == 'yes'){
            return true;
        }
        if(day == 4 && $scope.deal.daysOfWeek['thursday'] == 'yes'){
            return true;
        }
        if(day == 5 && $scope.deal.daysOfWeek['friday'] == 'yes'){
            return true;
        }
        if(day == 6 && $scope.deal.daysOfWeek['saturday'] == 'yes'){
            return true;
        }
    
    };
    
    $scope.boost = {};
    $scope.boost.daysOfWeek = {};
    $scope.boost.daysOfWeek.monday='no';
    $scope.boost.daysOfWeek.tuesday='no';
    $scope.boost.daysOfWeek.wednesday='no';
    $scope.boost.daysOfWeek.thursday='no';
    $scope.boost.daysOfWeek.friday='no';
    $scope.boost.daysOfWeek.saturday='no';
    $scope.boost.daysOfWeek.sunday='no';
    
    $scope.boost.start = upgradeDeal.startTime;
    $scope.boost.end = upgradeDeal.endTime;
    
    $scope.selectMonday = function() {
      if ($scope.boost.daysOfWeek.monday=='no'){
          $scope.boost.daysOfWeek.monday='yes';
      } else {
          $scope.boost.daysOfWeek.monday='no';
      }
    }

    $scope.selectTuesday = function() {
      if ($scope.boost.daysOfWeek.tuesday=='no'){
          $scope.boost.daysOfWeek.tuesday='yes';
      } else {
          $scope.boost.daysOfWeek.tuesday='no';
      }
    }

    $scope.selectWednesday = function() {
      if ($scope.boost.daysOfWeek.wednesday=='no'){
          $scope.boost.daysOfWeek.wednesday='yes';
      } else {
          $scope.boost.daysOfWeek.wednesday='no';
      }
    }

    $scope.selectThursday = function() {
      if ($scope.boost.daysOfWeek.thursday=='no'){
          $scope.boost.daysOfWeek.thursday='yes';
      } else {
          $scope.boost.daysOfWeek.thursday='no';
      }
    }

    $scope.selectFriday = function() {
      if ($scope.boost.daysOfWeek.friday=='no'){
          $scope.boost.daysOfWeek.friday='yes';
      } else {
          $scope.boost.daysOfWeek.friday='no';
      }
    }

    $scope.selectSaturday = function() {
      if ($scope.boost.daysOfWeek.saturday=='no'){
          $scope.boost.daysOfWeek.saturday='yes';
      } else {
          $scope.boost.daysOfWeek.saturday='no';
      }
    }

    $scope.selectSunday = function() {
      if ($scope.boost.daysOfWeek.sunday=='no'){
          $scope.boost.daysOfWeek.sunday='yes';
      } else {
          $scope.boost.daysOfWeek.sunday='no';
      }
    }
    
    $scope.boostDeal= function() {
        if (!$scope.biz.currentPlan){
            alert('You must upgrade your account')
        } else {
            if ($scope.boost.type=='recurring'){
                if ($scope.boost.daysOfWeek.monday=='no' &&
                $scope.boost.daysOfWeek.tuesday=='no' &&
                $scope.boost.daysOfWeek.wednesday=='no' &&
                $scope.boost.daysOfWeek.thursday=='no' &&
                $scope.boost.daysOfWeek.friday=='no' &&
                $scope.boost.daysOfWeek.saturday=='no' &&
                $scope.boost.daysOfWeek.sunday=='no'){
                alert('Please select a date');
                } else {
                    if ($scope.boost.start >= $scope.boost.end){
                        alert('Please select valid timeframe')
                    } else {
                        $scope.totalHours = ($scope.boost.end - $scope.boost.start)/3600000;
                        if ($scope.totalHours >= 24){
                            $scope.totalHours = $scope.totalHours - 24;
                        }
                        if ($scope.totalHours > $scope.biz.currentPlan.boostCount || $scope.biz.currentPlan.boostCount == 0){
                            alert('You do not have enough boosts')
                        } else {
                            
                            
                            var time = new Date(upgradeDeal.startTime);
                            //var stamp = time.getTime();
                            var start = moment(time).format("HH");
                            var time = new Date(upgradeDeal.endTime);
                            //var stamp = time.getTime();
                            var end = moment(time).format("HH");
                            
                            
                            var time = new Date($scope.boost.start);
                            //var stamp = time.getTime();
                            var boostStart = moment(time).format("HH");
                            var time = new Date($scope.boost.end);
                            //var stamp = time.getTime();
                            var boostEnd = moment(time).format("HH");
                            
                            console.log("start: " + start);
                            console.log("End: " + end);
                            
                          
                            
                            if(boostStart< start){
                                alert('You cannot start boost before the deal begins!');
                            }else if (boostEnd > end){
                                alert('You cannot run boost after the deal ends!');
                            }else{
                                
                                
                                    
                            var time = new Date($scope.boost.start);
                            //var stamp = time.getTime();
                            var boostStartDay = moment(time).format("MMDD");
                            var time = new Date($scope.boost.end);
                            //var stamp = time.getTime();
                            var boostEndDay = moment(time).format("MMDD");

                            console.log('start mmdd: ' + boostStartDay);
                            console.log('end mmdd: ' + boostEndDay);
                                
                                
                                console.log($scope.boost);
                                alert('success!');
                            
                                upgradeDeal['boosts'] = {};
                                upgradeDeal.boosts['recurring'] = {};
                                upgradeDeal.boosts.recurring['valid'] = true;
                                upgradeDeal.boosts.recurring['start'] = $scope.boost.start;
                                upgradeDeal.boosts.recurring['end'] = $scope.boost.end;
                                
                                if(boostEndDay != boostStartDay){
                                    boostEnd = Number(boostEnd) + 24;
                                }
                                
                                upgradeDeal.boosts.recurring['hours'] = Number(boostEnd) - Number(boostStart);
                                upgradeDeal.boosts.recurring['daysOfWeek'] = $scope.boost.daysOfWeek;

                                console.log(upgradeDeal);
                                fbutil.ref('recurringDeals/' , upgradeDeal.$id, '/boosts').set(upgradeDeal.boosts);
                        
                                var today = new Date();
                                var todayDate = moment(today.getTime()).format('YYYYMMDD');
                                
                                if(!angular.isUndefined(upgradeDeal.deals) && !angular.isUndefined(upgradeDeal.deals[todayDate])){
                                    
                                    var updateToday = {};
                                    updateToday['start'] =  $scope.boost.start;
                                    updateToday['end'] =  $scope.boost.end;
                                    updateToday['valid'] =  false;
                                    updateToday['hours'] = Number(boostEnd) - Number(boostStart);
                                    
                                    fbutil.ref('todaysDeals/' , todayDate, upgradeDeal.deals[todayDate], '/boost').set(updateToday);
                                    
                                    var time = new Date($scope.boost.start);
                                    //var stamp = time.getTime();
                                    var boostStart = moment(time).format("MMDD");
                                    var time = new Date($scope.boost.end);
                                    //var stamp = time.getTime();
                                    var boostEnd = moment(time).format("MMDD");
                                    
                                    console.log('start mmdd: ' + boostStart);
                                    console.log('end mmdd: ' + boostEnd);
                                    
                                    
                                    
                                    var boostCount = $scope.biz.currentPlan.boostCount - upgradeDeal.boosts.recurring.hours;
                                    fbutil.ref('businesses/' , upgradeDeal.businessID, '/currentPlan/boostCount').set(boostCount);
                                    
                                    var timestamp = new Date();
                                    var history = {type: "recurring",
                                                   id: upgradeDeal.$id,
                                                   start: $scope.boost.start,
                                                   end: $scope.boost.end,
                                                   hours: upgradeDeal.boosts.recurring.hours};
                                    fbutil.ref('businesses/' , upgradeDeal.businessID, '/currentPlan/boostHistory/', timestamp).set(history);
                                    
                                }
                            }
                        }
                    }
                }
            }
            if ($scope.boost.type=='onetime'){
                if (!$scope.boost.date){
                alert('Please select a date');
                } else {
                    if ($scope.boost.start >= $scope.boost.end){
                        alert('Please select valid timeframe')
                    } else {
                        $scope.totalHours = ($scope.boost.end - $scope.boost.start)/3600000;
                        if ($scope.totalHours >= 24){
                            $scope.totalHours = $scope.totalHours - 24;
                        }
                        if ($scope.totalHours > $scope.biz.currentPlan.boostCount || $scope.biz.currentPlan.boostCount == 0){
                            alert('You do not have enough boosts')
                        } else {
                            
                            
                            var time = new Date(upgradeDeal.startTime);
                            //var stamp = time.getTime();
                            var start = moment(time).format("HH");
                            var time = new Date(upgradeDeal.endTime);
                            //var stamp = time.getTime();
                            var end = moment(time).format("HH");
                            
                            
                            var time = new Date($scope.boost.start);
                            //var stamp = time.getTime();
                            var boostStart = moment(time).format("HH");
                            var time = new Date($scope.boost.end);
                            //var stamp = time.getTime();
                            var boostEnd = moment(time).format("HH");
                            
                            console.log("start: " + start);
                            console.log("End: " + end);
                            
                            if(boostStart< start){
                                alert('You cannot start boost before the deal begins!');
                            }else if (boostEnd > end){
                                alert('You cannot run boost after the deal ends!');
                            }else{

                                
                                
                                $scope.newBoostTotal = $scope.biz.currentPlan.boostCount - $scope.totalHours;
                                console.log("totalHours: " + $scope.totalHours);
                                console.log($scope.boost);
                                console.log("New boost total: ",$scope.newBoostTotal);
                                alert('success!');

                                console.log($scope.totalHours);
                                var time = new Date($scope.boost.date);
                                //var stamp = time.getTime();
                                var day = moment(time).format("YYYYMMDD");
                                console.log(day);
                                
                                var today = new Date();
                                var todayDate = moment(today.getTime()).format('YYYYMMDD');
                                
                                if(!angular.isUndefined(upgradeDeal.deals) && !angular.isUndefined(upgradeDeal.deals[day])){
                                    
                                    var updateToday = {};
                                    updateToday['start'] =  $scope.boost.start;
                                    updateToday['end'] =  $scope.boost.end;
                                    updateToday['hours'] = $scope.totalHours;
                                    updateToday['valid'] =  false;
                                    
                                    fbutil.ref('todaysDeals/' , day, upgradeDeal.deals[day], '/boost').set(updateToday);
                                    
                                    fbutil.ref('businesses/' , upgradeDeal.businessID, '/currentPlan/boostCount').set($scope.newBoostTotal);
                                    
                                    var timestamp = new Date();
                                    var history = {type: "onetime",
                                                   id: upgradeDeal.$id,
                                                   start: $scope.boost.start,
                                                   end: $scope.boost.end,
                                                   hours: $scope.totalHours};
                                    fbutil.ref('businesses/' , upgradeDeal.businessID, '/currentPlan/boostHistory/', timestamp).set(history);
                                    
                                }else{
                                    

                                    var ref = new Firebase('https://mealsteals.firebaseio.com/recurringDeals/' + upgradeDeal.$id);

                                    ref.once("value", function(snapshot) {

                                        //var addThisDeal = JSON.parse(JSON.stringify(snapshot));
                                        

                                        console.log(snapshot.val());
                                        console.log(upgradeDeal);
                                        
                                        var newDeal = snapshot.val();

                                        console.log('deal date');
                                        console.log($scope.boost.date);

                                        upgradeDeal.type = 'onetime';
                                        delete newDeal.daysOfWeek;
                                        delete newDeal.restrictedTo;

                                        newDeal['date'] = $scope.boost.date;
                                        console.log(newDeal.date);

                                        var dealDate = moment(newDeal.date.getTime()).format('YYYY-MM-DD');
                                        console.log(dealDate);
                                        var startdate = new Date(newDeal.startTime);
                                        var enddate = new Date(newDeal.endTime);

                                        var startClockTime = moment(startdate.getTime()).format('HH:mm');
                                        var endClockTime = moment(enddate.getTime()).format('HH:mm');

                                        var timeRange = convertToUnixOffset(startClockTime, endClockTime, $scope.biz.timezone, dealDate);

                                        newDeal.startTime = timeRange[0];
                                        newDeal.endTime = timeRange[1];
                                        newDeal.timezone = biz.timezone;

                                        newDeal.lat = parseFloat(upgradeDeal.lat);
                                        newDeal.lon = parseFloat(upgradeDeal.lon);

                                        // insert into deals and create geofire key


                                        var start = new Date(newDeal.startTime);
                                        var startDate = moment(start.getTime()).format('YYYYMMDD');
                                        var end = new Date(newDeal.endTime);
                                        var endDate = moment(end.getTime()).format('YYYYMMDD');

                                        var newKey = fbutil.ref('todaysDeals/' + startDate).push().key();
                                        
                                                                                
                                        var updateToday = {};
                                        updateToday['start'] =  $scope.boost.start;
                                        updateToday['end'] =  $scope.boost.end;
                                        updateToday['hours'] = $scope.totalHours;
                                        updateToday['valid'] =  false;

                                        newDeal['key'] = newKey;
                                        newDeal['boost'] = {};
                                        newDeal.boost = updateToday;
                                        
                                        fbutil.ref('todaysDeals/' , startDate , newKey).set(newDeal);
                                        if(startDate != endDate){
                                            fbutil.ref('todaysDeals/' , endDate , newKey).set(newDeal);
                                        }


                                        fbutil.ref('recurringDeals/' , snapshot.key(), '/deals/' , startDate).set(newDeal.key);

                                        fbutil.ref('businesses/' , upgradeDeal.businessID, '/currentPlan/boostCount').set($scope.newBoostTotal);

                                        var timestamp = new Date();
                                        var history = {type: "onetime",
                                                       id: upgradeDeal.$id,
                                                       start: $scope.boost.start,
                                                       end: $scope.boost.end,
                                                       hours: $scope.totalHours};
                                        fbutil.ref('businesses/' , newDeal.businessID, '/currentPlan/boostHistory/', String(timestamp)).set(history);
                                        

                                        console.log(newDeal);
                                    });

                                }
                                
                                
                            }
                        }
                    }
                }
            }
        }
    };
    
    
    $scope.formatTimestamp = function(ts, timezone){
      return moment(ts).tz(timezone).format('h:mm a');
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
    
    
    $scope.popup = {};
    
//    $scope.myTransactions = $firebaseArray(fbutil.ref('businesses/' + bizID + '/currentPlan/upgradeHistory'));
//    $scope.myBizObj = $firebaseObject(fbutil.ref('businesses/' + bizID));
//    console.log($scope.myTransactions);
//    console.log($scope.myBizObj);
    
    $scope.closeModal = function () {
        $uibModalInstance.dismiss();
    };
    


});
    
})(angular);
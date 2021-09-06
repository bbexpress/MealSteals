var Firebase = require("firebase");
var GeoFire = require("geofire")
// var moment = require('moment');
var moment = require('moment-timezone');
var crontab = require('node-crontab');

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

var ref = new Firebase('https://mealsteals.firebaseio.com/recurringDeals');

var geoFire = new GeoFire(new Firebase('https://mealsteals.firebaseio.com/dealGeoFireKeys'));

var jobId = crontab.scheduleJob("*/1 * * * *", function(){
    

    ref.once("value", function(snapshot) {


      var numChildren = snapshot.numChildren();
      var numChecked = 0;
      if (numChecked == numChildren){
          // process.exit();
      }

      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key();
        var d = childSnapshot.val();

        var currentDay = moment().tz(d.timezone).format('dddd').toLowerCase();

        // If we have a day match
        if (d.daysOfWeek[currentDay]=='yes'){
            // then lets add it in NOW (assuming it hasn't been added already).
            // this way it will appear in the business's dashboard as a current deal that will start later in the day

            var startClockTime = moment(d.startTime).tz(d.timezone).format('HH:mm');
            var endClockTime = moment(d.endTime).tz(d.timezone).format('HH:mm');
            var timeRange = convertToUnixOffset(startClockTime, endClockTime, d.timezone);
            var startTime = timeRange[0];
            var endTime = timeRange[1];
            
            console.log(key);
            console.log(d);

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
                            foundKeys.push(subD.key);
                        } else {
                            // do nothing
                        }

                        subNumChecked += 1;
                        if (subNumChecked == subNumChildren){
                            if (found==true){
                                // then we don't need to add a deal
                                numChecked += 1;
                                if (numChecked == numChildren){
                                    // process.exit();
                                }
                                if (foundKeys.length > 1){
                                    console.log('found duplicates...');
                                    for (var ii = 0; ii < foundKeys.length - 1; ii++) {
                                      console.log('deleting deal with key ' + foundKeys[ii]);
                                      geoFire.remove(foundKeys[ii]);
                                      (new Firebase('https://mealsteals.firebaseio.com/deals')).child(foundKeys[ii]).remove();
                                    }
                                }
                            } else {
                                // we need to add the deal then
                                var addThisDeal = JSON.parse(JSON.stringify(d));
                                delete addThisDeal.daysOfWeek;
                                addThisDeal.startTime = startTime;
                                addThisDeal.endTime = endTime;
                                addThisDeal.recurringDealID = key;
                                var dealsRef = new Firebase('https://mealsteals.firebaseio.com/deals');
                                var newDealKey = dealsRef.push().key();
                                addThisDeal.key = newDealKey;
                                addThisDeal.lat = parseFloat(addThisDeal.lat);
                                addThisDeal.lon = parseFloat(addThisDeal.lon);
                                dealsRef.child(newDealKey).set(addThisDeal, function(err){
                                    geoFire.set(newDealKey, [addThisDeal.lat, addThisDeal.lon]);
                                    console.log('adding', newDealKey);
                                    numChecked += 1;
                                    if (numChecked == numChildren){
                                        // process.exit();
                                    }
                                });
                            }

                                    
                        }
                    });
                } else {
                    // then we definitely need to add this deal for today
                    var addThisDeal = JSON.parse(JSON.stringify(d));
                    delete addThisDeal.daysOfWeek;
                    addThisDeal.startTime = startTime;
                    addThisDeal.endTime = endTime;
                    addThisDeal.recurringDealID = key;
                    var dealsRef = new Firebase('https://mealsteals.firebaseio.com/deals');
                    var newDealKey = dealsRef.push().key();
                    addThisDeal.key = newDealKey;
                    addThisDeal.lat = parseFloat(addThisDeal.lat);
                    addThisDeal.lon = parseFloat(addThisDeal.lon);
                    dealsRef.child(newDealKey).set(addThisDeal, function(err){
                        geoFire.set(newDealKey, [addThisDeal.lat, addThisDeal.lon]);
                        console.log('adding', newDealKey);
                        numChecked += 1;
                        if (numChecked == numChildren){
                            // process.exit();
                        }
                    }); 
                }
                    
            });

        } else {
            numChecked += 1;
            if (numChecked == numChildren){
                // process.exit();
            }
        }
        
        

      });

    });




});

    
var express = require('express');
var router = express.Router();

var cfg = require('../config/cred');

var client = require('twilio')(cfg.twilio.clientID, cfg.twilio.token);

var nest = require('unofficial-nest-api');

var action = require('../config/admin');

router.get('/fall', function(req, res, next) {

    sendMessages('fall');

    res.send('lol');




}); 


router.get('/stroke', function(req,res,next){

    sendMessages('stroke')



    nest.login(cfg.nest.email, cfg.nest.password, function(err, data){
        if (err) {
            console.log(err.message);
            process.exit(1);
            return;
        }

        nest.fetchStatus(function (data) {
            for (var deviceId in data.device) {
                if (data.device.hasOwnProperty(deviceId)) {
                    var device = data.shared[deviceId];
                    // here's the device and ID
                    nest.setTemperature(deviceId, nest.ftoc(48.2));
                }
            }
        });

    });

    res.send('lol');
});

router.get('/heartattack', function(req,res,next){

    sendMessages('heartattack');
    res.send('lol');
});



router.get('/other', function(req,res,next){

    sendMessages('other');
    res.send('lol');
});


router.get('/hot', function(req,res,next){
    console.log('hot');
     nest.login(cfg.nest.email, cfg.nest.password, function(err, data){
        if (err) {
            console.log(err.message);
            process.exit(1);
            return;
        }

        nest.fetchStatus(function (data) {
            for (var deviceId in data.device) {
                if (data.device.hasOwnProperty(deviceId)) {
                    var device = data.shared[deviceId];
                    // here's the device and ID
                    nest.setTemperature(deviceId, nest.ftoc(48.2));
                }
            }
        });

    });
     res.send('lol');
});

router.get('/cold', function(req,res,next){
    console.log('cold');
     nest.login(cfg.nest.email, cfg.nest.password, function(err, data){
        if (err) {
            console.log(err.message);
            process.exit(1);
            return;
        }

        nest.fetchStatus(function (data) {
            for (var deviceId in data.device) {
                if (data.device.hasOwnProperty(deviceId)) {
                    var device = data.shared[deviceId];
                    // here's the device and ID
                    nest.setTemperature(deviceId, nest.ftoc(89));
                }
            }
        });

    });
          res.send('lol');

});



/* Function for sending text messages to list */
function sendMessages(type){

    var message = "";
    switch(type){
        case 'fall':
            message = 'I think I\'m falling';
            break;
        case 'stroke':
            message = 'I think I\'m having a stroke';
            break;
        case 'heartattack':
            message = 'I think I\'m having a heart attack';
            break;
        case 'other':
            message = 'You fokin wot m8.'
            break;
    }


    action.forEach(function(profile){

        console.log(profile);

        client.sendMessage({
            from: '+16473609283',
            to: profile.phoneNumber,
            body: message
        }, function(err, responseData){
            if (!err){
                console.log('Hello, it\'s me.');
            }else{
                console.log(err);
            }
        });
    });

}


module.exports = router;

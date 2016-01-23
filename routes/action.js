var express = require('express');
var router = express.Router();

var cfg = require('../config/twilio');

var client = require('twilio')(cfg.twilio.clientID, cfg.twilio.token);

var action = require('../config/admin');

// var accountSid = "AP3a6a3c6b195651d80adb945a3f869b54";
// var authToken = "";
// var senderNum = ""


/* GET users listing. */
router.get('/fall', function(req, res, next) {
    
    action.forEach(function(profile){

        console.log(profile);

        client.sendMessage({
            from: '+16473609283',
            to: profile.phoneNumber,
            body: 'I think I\'m having a stroke'

        }, function(err, responseData){
            if (!err){
                console.log('Hello, Its me.');
            }else{
                console.log(err);
            }

        });
    });

    res.send('lol');


}); 


router.get('/stroke', function(req,res,next){


});

router.get('/heartattacks', function(req,res,next){

});

module.exports = router;

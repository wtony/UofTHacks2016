var express = require('express');
var router = express.Router();

var cfg = require('../config/cred');

var client = require('twilio')(cfg.twilio.clientID, cfg.twilio.token);

var action = require('../config/admin');

var NestApi = require('nest-api');
var nestApi = new NestApi(cfg.nest.email, cfg.nest.pass);

var Firebase = require('firebase');



router.get('/fall', function(req, res, next) {

    sendMessages('fall');

    res.send('lol');


}); 


router.get('/stroke', function(req,res,next){

    sendMessages('stroke')

    res.send('lol');
});

router.get('/heartattack', function(req,res,next){

    sendMessages('heartattack');

});

router.get('/testing', function(req,res,next){

    nestApi.login(function(data) {

        var ref = new Firebase('wss://developer-api.nest.com');

        ref.authWithCustomToken(data.access_token);
        

        


    });

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
    }


    action.forEach(function(profile){

        console.log(profile);

        client.sendMessage({
            from: '+16473609283',
            to: profile.phoneNumber,
            body: message
        }, function(err, responseData){
            if (!err){
                console.log('Hello, Its me.');
            }else{
                console.log(err);
            }
        });
    });

}


module.exports = router;

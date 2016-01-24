var express = require('express');
var router = express.Router();

var cfg = require('../config/cred');

var client = require('twilio')(cfg.twilio.clientID, cfg.twilio.token);

var action = require('../config/admin');

var NestApi = require('nest-api');
var nestApi = new NestApi(cfg.nest.email, cfg.nest.pass);

var Firebase = require('firebase');


var passport = require('passport');
var bodyParser = require('body-parser');
var NestStrategy = require('passport-nest').Strategy;


passport.use(new NestStrategy({
    clientID: cfg.nest.clientID,
    clientSecret: cfg.nest.clientSecret
  }
));


/**
  No user data is available in the Nest OAuth
  service, just return the empty user object.
*/
passport.serializeUser(function(user, done) {
  done(null, user);
});


/**
  No user data is available in the Nest OAuth
  service, just return the empty user object.
*/
passport.deserializeUser(function(user, done) {
  done(null, user);
});



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

router.get('/auth/nest', passport.authenticate('nest'),function(req,res,next){
    console.log(req);
});

/**
  Upon return from the Nest OAuth endpoint, grab the user's
  accessToken and set a cookie so jQuery can access, then
  return the user back to the root app.
*/
router.get('/auth/nest/callback',
        passport.authenticate('nest', { }),
        function(req, res, next) {
          console.log(req.user.accessToken);
        }
);


router.get('/testing', function(req,res,next){

    nestApi.login(function(data) {

        var ref = new Firebase('wss://developer-api.nest.com');
        console.log(data.access_token);
        ref.authWithCustomToken(data.access_token, function(err){
            console.log(err);
        });
        
        ref.on("value", function(snapshot){
            console.log(snapshot.val());
        },function(err){
            console.log(err.code);
        });

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

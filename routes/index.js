
require('dotenv').load();

var AccessToken = require('twilio').AccessToken;
var VideoGrant = AccessToken.VideoGrant;

var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var randomUsername = require('../models/randos');

var request = require('request');

var router = express.Router();



router.get('/', function (req, res) {
  // console.log(req.user);
  // console.log(req.session.roomid);
  // var roomid = req.session.roomid ? req.session.roomid : false;
  // delete req.session.roomid;
  res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
  res.render('register', { });
});

router.get('/search', function(req, res) {
  res.render('userlist', { });
});

router.get('/settings', function(req, res) {
  res.render('setting', { });
});

router.get('/userlist/', function(req, res) {
  // res.render('userlist', { });
  Account.find({}, function (err, docs) {
    res.json(docs);
    // console.log(docs);
  });
});

router.get('/department/:department', function(req, res){
  var department = req.params.department;
  console.log(department);

  Account.find({'department': department}, function(err, docs){
    res.json(docs);
  });
});

router.get('/userlist/:user', function(req, res) {
  // res.render('userlist', { });
  Account.find({ _id: req.params.user}, function (err, docs) {
    res.json(docs);
    console.log('user info:' + docs);
  });
});


var accountSid = process.env.TWILIO_ACCOUNT_SID;
  var authToken = process.env.TWILIO_AUTH_TOKEN;
  //require the Twilio module and create a REST client
  var client = require('twilio')(accountSid, authToken);

router.get('/page/:user', function(req, res){
  // Twilio Credentials
  Account.findOne({ _id: req.params.user}, function (err, docs) {
    var caller = loggedUser.firstname + ' ' + loggedUser.lastname + ' from ' + loggedUser.department;

    res.json(docs);
    // console.log('user info:' + docs);
    console.log(docs);
    // var phone = docs['phone'];
    // console.log('phone: ' + phone);

    client.messages.create({
      // to: process.env.GVOICE_NUMBER,
      to: '+1' + docs.phone,
    from: process.env.TWILIO_NUMBER,
    body: caller +" says: You are being paged. https://aqueous-ocean-66422.herokuapp.com/join/" + loggedUser._id,

    }, function(err, message) {
      console.log(err);
    });
  });

  

});
router.get('/join/:roomid', function(req, res) {
  var roomid = req.params.roomid;
  res.render('join', { roomid : roomid });
});

router.get('/getdoctors/:department', function(req, res) {

  // Latitude: 40.7265486
  // Longitude: -74.0074612
  request(
      { method: 'GET',
        uri: 'https://api.betterdoctor.com/2016-03-01/doctors?query=' + req.params.department + '&location=40.7265486%2C-74.0074612%2C10&user_location=37.773%2C-122.413&skip=0&limit=10&user_key=' + process.env.BETTER_DOCTOR_KEY
      },
      function (error, response, body) {
        // body is the decompressed response body
        console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'));
        console.log('the decoded data is: ' + body);
        var data = JSON.parse(body);
        res.json( data.data );
      }).on('data', function(data) {
    // decompressed data as it is received
        console.log('decoded chunk: ' + data);
      }).on('response', function(response) {
        // unmodified http.IncomingMessage object
        response.on('data', function(data) {
          // compressed data as it is received
          console.log('received ' + data.length + ' bytes of compressed data');
        });
      });

});


router.get('/token', function(request, response) {
  //'user' = from passport
  // var identity = request.user.username;
  var identity = randomUsername();
  console.log('identity: ' + identity);

  // var identity = 

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  var token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token
  token.identity = identity;

  //grant the access token Twilio Video capabilities
  var grant = new VideoGrant();
  grant.configurationProfileSid = process.env.TWILIO_CONFIGURATION_SID;
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});

router.post('/register', function(req, res) {
  Account.register(new Account({ lastname : req.body.lastname, firstname : req.body.firstname, department : req.body.department, phone:req.body.phone, email: req.body.email, username:req.body.email }), req.body.password, function(err, account) {
    if (err) {
      console.log(err);
      return res.render('register', { account : account });
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

// router.post('/login', passport.authenticate('local'), function(req, res) {
//   res.redirect('/');
// });
var loggedUser;
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (! user) {
      return res.send({ success : false, message : 'authentication failed' });
    }
    // ***********************************************************************
    // "Note that when using a custom callback, it becomes the application's
    // responsibility to establish a session (by calling req.login()) and send
    // a response."
    // Source: http://passportjs.org/docs
    // ***********************************************************************
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      loggedUser = user;
      console.log('logged user: ' + loggedUser.firstname);
      return res.redirect('/');
    });      
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});





module.exports = router;
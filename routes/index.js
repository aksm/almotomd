
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
})

router.get('/userlist/:user', function(req, res) {
  // res.render('userlist', { });
  Account.find({ _id: req.params.user}, function (err, docs) {
    res.json(docs);
    console.log(docs);
  });
});



router.get('/getdoctors/', function(req, res) {

  // Latitude: 40.7265486
  // Longitude: -74.0074612
  request(
      { method: 'GET'
        , uri: 'https://api.betterdoctor.com/2016-03-01/doctors?query=neuro%20surgery%20&location=40.7265486%2C-74.0074612%2C10&user_location=37.773%2C-122.413&skip=0&limit=10&user_key=8800c209a89885a1afb0a793713df6cb'
      }
      , function (error, response, body) {
        // body is the decompressed response body
        console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
        console.log('the decoded data is: ' + body);
        var data = JSON.parse(body);
        res.json( data.data );
      }
  ).on('data', function(data) {
    // decompressed data as it is received
    console.log('decoded chunk: ' + data)
  })
      .on('response', function(response) {
        // unmodified http.IncomingMessage object
        response.on('data', function(data) {
          // compressed data as it is received
          console.log('received ' + data.length + ' bytes of compressed data')
        })
      });

});


router.get('/token', function(request, response) {
  //'user' = from passport
  var identity = request.user.username;
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
  Account.register(new Account({ lastname : req.body.lastname, firstname : req.body.firstname, department : req.body.department, phone:req.body.phone, username:req.body.email }), req.body.password, function(err, account) {
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

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});



module.exports = router;
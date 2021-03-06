
console.log("Starting web...");


/* SOCIAL MIRROR FACEBOOK */
var SocialMirrorFB = require("./social-mirror-fb");
var smfb = new SocialMirrorFB({
    appId      : process.env.FACEBOOK_APP_ID,
    appSecret  : process.env.FACEBOOK_APP_SECRET,
    version    : 'v2.8'
  });
/* SOCIAL MIRROR FACEBOOK */


/* FIREBASE */
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.DATABASE_URL
});
/* FIREBASE */



/* EXPRESS */
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
// Initialize the app.
var app = express();
app.use(bodyParser.json());
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});
app.use(function(req, res, next){
    res.setTimeout(120000, function(){
        console.log('Request has timed out.');
            res.send(408);
        });

    next();
});
/* EXPRESS */




app.get("/schedule/:id", function(req, res) {

  var tasksRef = admin.database().ref('queue/tasks');
  tasksRef.push({
    'id': req.params.id
  });
  res.status(200).end();
});


app.get("/photos/:id/:profileId?", function(req, res) {

  var profileId = req.params.profileId? req.params.profileId: 'me';

  admin.database().ref("private/users/" + req.params.id + "/last_access_token").once("value", function(accessToken) {
    smfb.photos(accessToken.val(), profileId)
      .then(function(fbres) {
        res.status(200).json(fbres);
      }, function (errorObject) {
        res.status(500).json({"error": errorObject});
      });
  });

});

app.get("/albums/:id/:profileId?", function(req, res) {

  var profileId = req.params.profileId? req.params.profileId: 'me';

  admin.database().ref("private/users/" + req.params.id + "/last_access_token").once("value", function(accessToken) {
    smfb.albums(accessToken.val(), profileId)
      .then(function(fbres) {
        res.status(200).json(fbres);
      }, function (errorObject) {
        res.status(500).json({"error": errorObject});
      });
  });

});


app.get("/profiles/:id", function(req, res) {

  admin.database().ref("private/users/" + req.params.id + "/last_access_token").once("value", function(accessToken) {
    smfb.profiles(accessToken.val())
      .then(function(fbres) {
        res.status(200).json(fbres);
      }, function (errorObject) {
        res.status(500).json({"error": errorObject});
      });
  });

});


/*
app.get("/extendToken/:id", function(req, res) {

  admin.database().ref("private/users/" + req.params.id + "/last_access_token").once("value", function(accessToken) {

    FB.api('oauth/access_token', {
        client_id    : process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: accessToken.val()
      }, function (fbres) {
        if(!fbres || fbres.error) {
          console.log(!fbres ? 'error occurred' : fbres.error);
          return;
        }
        res.status(200).json(fbres);
    });

  }, function (errorObject) {
    res.status(200).json({"error": errorObject});
  });

});
*/


/* FACEBOOK */
var FB = require('fb');
var fb = new FB.Facebook({
    appId      : process.env.FACEBOOK_APP_ID,
    appSecret  : process.env.FACEBOOK_APP_SECRET,
    version    : 'v2.8'
  });
/* FACEBOOK */



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



/* SOCIAL MIRROR */
var async = require("async");
var q = require("q");
var SocialMirrorFB = require("./social-mirror-fb");
var smfb = new SocialMirrorFB(FB, async, q);
/* SOCIAL MIRROR */



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
/* EXPRESS */





/* --- API --- */

/*
app.get("/:id/me", function(req, res) {

  admin.database().ref("users/" + req.params.id + "/lastAccessToken").once("value", function(snapshot) {

    FB.api('me', { fields: ['id', 'name'], access_token: snapshot.val() }, function (fbres) {
      res.status(200).json(fbres);
    });

  }, function (errorObject) {
    res.status(200).json({"error": errorObject});
  });

});
*/

app.get("/refresh/:id", function(req, res) {

  admin.database().ref("private/users/" + req.params.id + "/last_access_token").once("value", function(accessToken) {

    smfb.getData(accessToken.val())
      .then(function(fbres) {

        admin.database().ref('/public/tinchodias').set({
          'last_update': (+ new Date()),
          'data': fbres
        });

        res.status(200).json(fbres);
      }, function (errorObject) {
        res.status(500).json({"error": errorObject});
      });
  });

});



/*
todo: IS THIS NEEDED?

app.get("/extendToken/:id", function(req, res) {

  admin.database().ref("users/" + req.params.id + "/lastAccessToken").once("value", function(snapshot) {

    FB.api('oauth/access_token', {
        client_id    : process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        grant_type: 'fb_exchange_token',
        fb_exchange_token: snapshot.val()
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

/*
app.get("/peng", function(req, res) {

  var newRef = admin.database().ref('/timestamps/peng').push();
  var timestampSuper = (+ new Date());
  newRef.set(timestampSuper);
  res.status(200).json({"result": "listoooeee"});
});
*/

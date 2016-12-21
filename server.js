var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var admin = require("firebase-admin");
var FB = require('fb');

var fb = new FB.Facebook({
    appId      : process.env.FACEBOOK_APP_ID,
    appSecret  : process.env.FACEBOOK_APP_SECRET,
    version    : 'v2.8'
  });


admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.DATABASE_URL
});
var db = admin.database();
var ref = db.ref();


// Initialize the app.
var app = express();
app.use(bodyParser.json());
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});





app.get("/ping", function(req, res) {

  ref.once("value", function(snapshot) {
    res.status(200).json({"result": snapshot.val()});
  }, function (errorObject) {
    res.status(200).json({"error": errorObject});
  });

});



app.get("/me/:id", function(req, res) {

  admin.database().ref("users/" + req.params.id + "/lastAccessToken").once("value", function(snapshot) {

    FB.api('me', { fields: ['id', 'name'], access_token: snapshot.val() }, function (fbres) {
      res.status(200).json(fbres);
    });

  }, function (errorObject) {
    res.status(200).json({"error": errorObject});
  });

});



app.get("/me/:id/photos", function(req, res) {

  admin.database().ref("users/" + req.params.id + "/lastAccessToken").once("value", function(snapshot) {

    FB.api('me/photos', { fields:'id, picture,  name', access_token: snapshot.val() }, function (fbres) {
      res.status(200).json(fbres);
    });

  }, function (errorObject) {
    res.status(200).json({"error": errorObject});
  });

});



/*
app.get("/me/:id/photos2", function(req, res) {

FB.api('oauth/access_token', {
    client_id    : process.env.FACEBOOK_APP_ID,
    client_secret: process.env.FACEBOOK_APP_SECRET,
    grant_type: 'client_credentials'
//    redirect_uri: 'http://yoururl.com/callback'
}, function (fbres) {
    if(!fbres || fbres.error) {
        console.log(!fbres ? 'error occurred' : fbres.error);
        return;
    }

    var accessToken = fbres.access_token;
    FB.api('10157867157070537/photos', { fields:'id, picture,  name', access_token: accessToken }, function (fbres2) {
      res.status(200).json(fbres2);
    });

});

});
*/



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

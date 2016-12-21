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


app.get("/miii", function(req, res) {

  ref.once("value", function(snapshot) {

    FB.api('me', { fields: ['id', 'name'], access_token: snapshot.val().users[0].lastAccessToken }, function (res) {
      console.log(":D");
      console.log(res);
      res.status(200).json(res);
    });


  }, function (errorObject) {
    res.status(200).json({"error": errorObject});
  });


});
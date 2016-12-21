var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var admin = require("firebase-admin");

var app = express();
//app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());



admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.DATABASE_URL
});


// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});





app.get("/ping", function(req, res) {

  admin.auth().getUser("as8Rf5YctVZxwasHBZavj2Ohyw83")
    .then(function(userRecord) {
      // See the tables below for the contents of userRecord
      console.log("Successfully fetched user data:", userRecord.toJSON());
      res.status(200).json({"result": "bien"});
    })
    .catch(function(error) {
      console.log("Error fetching user data:", error);
      res.status(200).json({"result": "mal"});
    });


});

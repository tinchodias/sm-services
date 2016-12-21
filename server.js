var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");

var app = express();
//app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());


// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});


app.get("/ping", function(req, res) {
  console.log("ping received!");
  res.status(200).json({"result": "buenisimo"});
});

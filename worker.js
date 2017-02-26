
console.log("Worker starting...");


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
var queueRef = admin.database().ref('queue');
/* FIREBASE */


var Queue = require('firebase-queue');
var queue = new Queue(queueRef, function(data, progress, resolve, reject) {

  console.log("processing " + data);


  admin.database().ref("private/users/" + data.id + "/last_access_token").once("value", function(accessToken) {

    progress(25);

    smfb.profiles(accessToken.val()).then(function(fbres) {

      progress(50);

      admin.database().ref("private/users/" + data.id + "/last_data").set({
        'timestamp': (+ new Date()),
        'data': fbres
      }).then(resolve, reject);

    }, function (error) {
      reject(error)
    });
  });


});


// https://github.com/firebase/firebase-queue/blob/master/docs/guide.md#graceful-shutdown
process.on('SIGINT', function() {
  console.log('Starting graceful queue shutdown ;-)');
  queue.shutdown().then(function() {
    console.log('Finished graceful queue shutdown ;-)');
    process.exit(0);
  });
});

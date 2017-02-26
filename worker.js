
console.log("Worker starting...");


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
var queueRef = admin.database().ref('queue');
/* FIREBASE */


/* FIREBASE QUEUE */
var FirebaseQueue = require('firebase-queue');
/* FIREBASE QUEUE */


var queue = new FirebaseQueue(queueRef, function(data, progress, resolve, reject) {

  console.log("processing ", data);

  admin.database().ref("private/users/" + data.id + "/last_access_token").once("value", function(accessToken) {
    progress(25);
    smfb.profiles(accessToken.val()).then(function(fbres) {
      progress(50);
      admin.database().ref("private/users/" + data.id + "/last_data").set({
        'timestamp': (+ new Date()),
        'data': fbres
      }).then(function() {
        console.log("done ", data);
        resolve();
      }, function(error) {
        console.log("fail ", data);
        reject(error);
      });
    }, function(error) {
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

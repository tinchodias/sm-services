
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
  // Read and process task data
  console.log(data);

  // Do some work
  progress(50);

  // Finish the task asynchronously
  setTimeout(function() {
    resolve();
  }, 1000);
});


// https://github.com/firebase/firebase-queue/blob/master/docs/guide.md#graceful-shutdown
process.on('SIGINT', function() {
  console.log('Starting graceful queue shutdown ;-)');
  queue.shutdown().then(function() {
    console.log('Finished graceful queue shutdown ;-)');
    process.exit(0);
  });
});

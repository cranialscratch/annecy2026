const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const webpush   = require('web-push');

admin.initializeApp();

// VAPID key pair — generated 2026-06-17, matched pair hardcoded for reliability
const VAPID_PUBLIC  = 'BNvSQJpqlgvQw-dEAH21uUZR-ehcDFYoq77I40RgNMppVbkFmGbOi7QClKANJ51ShZ4FQ5ajncmvPumLLp93K0Q';
const VAPID_PRIVATE = 'vbNF4h5bCz82Tjpeo1JGB3S-HhaveW-JR1YTCCgYV8I';

webpush.setVapidDetails('mailto:matt@uservox.com', VAPID_PUBLIC, VAPID_PRIVATE);

// Runs every minute — sends any push notification whose fireAt is now due
exports.sendPushNotifs = functions
  .region('europe-west1')
  .pubsub.schedule('every 1 minutes')
  .onRun(async () => {
    const db  = admin.database();
    const now = Date.now();
    const WINDOW_MS = 5 * 60 * 1000;

    const [queueSnap, subSnap] = await Promise.all([
      db.ref('pushQueue').once('value'),
      db.ref('pushSubs').once('value'),
    ]);

    const allQueues = queueSnap.val() || {};
    const allSubs   = subSnap.val()   || {};

    const removes = [];
    const sends   = [];

    for (const [deviceId, queue] of Object.entries(allQueues)) {
      const sub = allSubs[deviceId];

      for (const [key, notif] of Object.entries(queue || {})) {
        const age = now - notif.fireAt;
        if (age < 0 || age > WINDOW_MS) continue;

        removes.push(db.ref(`pushQueue/${deviceId}/${key}`).remove());

        if (!sub) {
          console.warn(`No subscription for device ${deviceId}`);
          continue;
        }
        sends.push(
          webpush.sendNotification(sub, JSON.stringify({
            title: notif.title,
            body:  notif.body,
            tag:   notif.tag,
          })).then(() => {
            console.log(`Sent push to ${deviceId}: ${notif.title}`);
          }).catch(err => {
            console.error(`Push failed for ${deviceId}: ${err.statusCode} ${err.message}`);
            db.ref(`pushErrors/${deviceId}`).push({
              ts: now, key, status: err.statusCode || 0, msg: err.message || String(err),
            });
            if (err.statusCode === 410 || err.statusCode === 404) {
              removes.push(db.ref(`pushSubs/${deviceId}`).remove());
            }
          })
        );
      }
    }

    await Promise.allSettled([...sends, ...removes]);
    return null;
  });

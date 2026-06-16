const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const webpush   = require('web-push');

admin.initializeApp();

// VAPID keys stored via: firebase functions:config:set vapid.public="..." vapid.private="..."
const cfg = functions.config();
try {
  webpush.setVapidDetails(
    'mailto:matt@uservox.com',
    cfg.vapid?.public,
    cfg.vapid?.private,
  );
} catch(e) {
  console.error('VAPID init failed:', e.message);
}

// Runs every minute — sends any push notification whose fireAt is now due
exports.sendPushNotifs = functions
  .region('europe-west1')
  .pubsub.schedule('every 1 minutes')
  .onRun(async () => {
    const db  = admin.database();
    const now = Date.now();
    const WINDOW_MS = 5 * 60 * 1000; // send if up to 5 min overdue (handles cold starts)

    const [queueSnap, subSnap] = await Promise.all([
      db.ref('pushQueue').once('value'),
      db.ref('pushSubs').once('value'),
    ]);

    const allQueues = queueSnap.val() || {};
    const allSubs   = subSnap.val()   || {};

    const removes  = [];
    const sends    = [];

    for (const [deviceId, queue] of Object.entries(allQueues)) {
      const sub = allSubs[deviceId];

      for (const [key, notif] of Object.entries(queue || {})) {
        const age = now - notif.fireAt;
        if (age < 0 || age > WINDOW_MS) continue; // not yet due, or too old

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
            // Log to Firebase so client can read it
            db.ref(`pushErrors/${deviceId}`).push({
              ts: now, key, status: err.statusCode || 0, msg: err.message || String(err),
            });
            // Subscription gone — clean it up
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

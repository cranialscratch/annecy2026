#!/usr/bin/env node
// Runs every 5 min via GitHub Actions cron.
// Reads /pushQueue from Firebase, sends any due Web Push notifications,
// then removes sent entries from the queue.

const webpush = require('web-push');

const VAPID_PUBLIC  = 'BAWWgB9Fd6E6bRrhjgYfbDIwi1uHpKWVeBW9QyZLOz6WtYw4FvIJRUXGsaWYXKbspGfzCCg8-QMF_ONzsAdYhtI';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const DB_URL        = 'https://annecy-2026-default-rtdb.europe-west1.firebasedatabase.app';
// API key is already public in sync.js; used only for authenticated REST writes
const API_KEY       = 'AIzaSyCC7zZCbmlbxow7--sNniAw2FKgnso46cw';

if (!VAPID_PRIVATE) { console.error('VAPID_PRIVATE_KEY not set'); process.exit(1); }

webpush.setVapidDetails('mailto:matt@uservox.com', VAPID_PUBLIC, VAPID_PRIVATE);

async function fbGet(path)        { return fetch(`${DB_URL}/${path}.json`).then(r => r.json()); }
async function fbDelete(path)     { return fetch(`${DB_URL}/${path}.json?auth=${API_KEY}`, { method: 'DELETE' }); }

async function main() {
  const now    = Date.now();
  const WINDOW = 60 * 60 * 1000; // 1-hour window so manual test runs always catch queued entries

  const [queue, subs] = await Promise.all([fbGet('pushQueue'), fbGet('pushSubs')]);
  console.log('pushQueue devices:', queue ? Object.keys(queue).length : 0,
              '| pushSubs devices:', subs ? Object.keys(subs).length : 0);
  if (!queue) { console.log('Nothing in queue'); return; }

  let sent = 0, expired = 0;
  const ops = [];

  for (const [deviceId, entries] of Object.entries(queue)) {
    const sub = subs[deviceId];

    console.log(`Device ${deviceId.slice(0,8)}: ${Object.keys(entries||{}).length} queued, sub: ${!!sub}`);
    for (const [key, notif] of Object.entries(entries || {})) {
      const age = now - notif.fireAt;
      console.log(`  Entry ${key}: age=${Math.round(age/1000)}s, title="${notif.title}"`);
      if (age < 0 || age > WINDOW) { console.log('  -> skipped (out of window)'); continue; }

      // Always remove from queue once we've processed it
      ops.push(fbDelete(`pushQueue/${deviceId}/${key}`));

      if (!sub) continue;
      ops.push(
        webpush.sendNotification(sub, JSON.stringify({
          title: notif.title,
          body:  notif.body,
          tag:   notif.tag,
        })).then(() => { sent++; })
          .catch(err => {
            console.error(`Push failed for ${deviceId}:`, err.statusCode || err.message);
            if (err.statusCode === 410 || err.statusCode === 404) {
              expired++;
              ops.push(fbDelete(`pushSubs/${deviceId}`));
            }
          })
      );
    }
  }

  await Promise.allSettled(ops);
  console.log(`Sent: ${sent}, expired subs removed: ${expired}`);
}

main().catch(e => { console.error(e); process.exit(1); });

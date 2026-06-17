/**
 * One-time script: clears time overrides and cross-day moves from Firebase.
 * Run with: node reset-times.js
 * Preserves: checked stops, location overrides, type/priority/reason overrides.
 */
const admin = require('firebase-admin');

const FIREBASE_CONFIG = {
  databaseURL: 'https://annecy-2026-default-rtdb.europe-west1.firebasedatabase.app',
};

admin.initializeApp({ ...FIREBASE_CONFIG, credential: admin.credential.applicationDefault() });

const db = admin.database();

async function run() {
  const ref = db.ref('shared/state');
  const snap = await ref.once('value');
  const current = snap.val() || {};

  // Null out only the time/cascade fields; leave everything else intact
  await ref.update({
    overrides:    null,
    durOverrides: null,
    crossDayMoves: null,
  });

  console.log('Done. Cleared overrides, durOverrides, crossDayMoves.');
  console.log('Preserved keys:', Object.keys(current).filter(k => !['overrides','durOverrides','crossDayMoves'].includes(k)).join(', '));
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

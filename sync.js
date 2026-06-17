/* ── Firebase sync ─────────────────────────────────────────────────────
   Single shared state for all devices. Last-write-wins per key.
   Offline edits are queued by Firebase SDK and flushed on reconnect.
──────────────────────────────────────────────────────────────────────── */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCC7zZCbmlbxow7--sNniAw2FKgnso46cw",
  authDomain:        "annecy-2026.firebaseapp.com",
  databaseURL:       "https://annecy-2026-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "annecy-2026",
  storageBucket:     "annecy-2026.firebasestorage.app",
  messagingSenderId: "276799646622",
  appId:             "1:276799646622:web:1741bce7d545ec50d3c48f",
};

const DB_PATH = 'shared/state';

let _db = null;
let _ignoreNextRemote = false; // suppress echo after local save

function syncInit() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.database();
    // Realtime Database queues writes offline automatically.
    // State is also persisted to localStorage via localSave() as fallback.

    // Listen for remote changes and apply them
    _db.ref(DB_PATH).on('value', snap => {
      if (_ignoreNextRemote) { _ignoreNextRemote = false; return; }
      const remote = snap.val();
      if (!remote) return;
      applyRemoteState(remote);
    });

    setSyncStatus('connected');
    console.log('[sync] Firebase connected');
  } catch (e) {
    console.warn('[sync] Firebase init failed:', e);
    setSyncStatus('error');
  }
}

/* Merge remote state into local, re-render if anything changed */
function applyRemoteState(remote) {
  // Don't let stale remote data overwrite a more recent local save
  if (remote._ts && state._localTs && remote._ts < state._localTs) return;

  let changed = false;
  const keys = ['overrides','checked','locOverrides','durOverrides',
                 'typeOverrides','priorityOverrides','reasonOverrides','veganOverrides','addedStops'];
  keys.forEach(k => {
    const incoming = remote[k] || {};
    // Local wins for keys we've touched more recently; remote fills in anything we don't have
    const merged = Object.assign({}, incoming, state[k]);
    if (JSON.stringify(merged) !== JSON.stringify(state[k])) {
      state[k] = merged;
      changed = true;
    }
  });
  if (changed) {
    localSave();
    if (typeof renderView === 'function') renderView(false);
    setSyncStatus('synced');
  }
}

/* Push local state to Firebase */
function syncSave() {
  if (!_db) return;
  _ignoreNextRemote = true;
  const payload = {
    overrides:         state.overrides,
    checked:           state.checked,
    locOverrides:      state.locOverrides,
    durOverrides:      state.durOverrides,
    typeOverrides:     state.typeOverrides,
    priorityOverrides: state.priorityOverrides,
    reasonOverrides:   state.reasonOverrides,
    veganOverrides:    state.veganOverrides,
    addedStops:        state.addedStops,
    _ts:               Date.now(),
  };
  state._localTs = payload._ts;
  _db.ref(DB_PATH).set(payload)
    .then(() => setSyncStatus('synced'))
    .catch(() => setSyncStatus('error'));
}

/* ── Sync status dot ──────────────────────────────────────────────────── */
function setSyncStatus(status) {
  const dot = document.getElementById('sync-dot');
  if (!dot) return;
  dot.dataset.status = status;
  dot.title = { connected:'Sync connected', synced:'Synced', error:'Sync error — changes saved locally' }[status] || '';
}

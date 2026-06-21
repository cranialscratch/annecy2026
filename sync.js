/* ── Firebase sync ─────────────────────────────────────────────────────
   Shared trip state at shared/state (all authenticated members).
   Personal state at users/{uid}/personal (per-user, isolated).
   Auth via Firebase Auth email/password.
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

const OWNER_EMAIL   = 'matt@cranialscratch.com';
const SHARED_PATH   = 'shared/state';
const TRIP_ID       = 'annecy_2026';
const USER_PATH     = uid => 'users/' + uid + '/personal';
const MEMBER_PATH   = uid => 'trips/' + TRIP_ID + '/members/' + uid;

/* Keys that belong to the shared trip state (visible to all members) */
const SHARED_KEYS = ['overrides','crossDayMoves','locOverrides','durOverrides',
                     'typeOverrides','priorityOverrides','reasonOverrides',
                     'veganOverrides','addedStops','removed'];

/* Keys that belong to personal state (per-user only) */
const PERSONAL_KEYS = ['checked','skipped','bucketList',
                       'personalStops','personalTickets','personalPinned','notifLeadMins'];

let _db  = null;
let _auth = null;
let _uid  = null;
let _ignoreNextShared   = false;
let _ignoreNextPersonal = false;

/* Allow app.js push-notification code to reach the DB handle */
function getDb() { return _db; }

/* ── Auth ─────────────────────────────────────────────────────────── */
function getAuthUser() { return firebase.auth().currentUser; }

function signOut() {
  if (typeof state !== 'undefined') {
    state.checked = {}; state.skipped = {}; state.removed = {};
    state.bucketList = []; state.personalStops = {}; state.personalTickets = {};
    state.personalPinned = {}; state.userId = null; state.userName = null;
    state.isOwner = false; state.memberRole = 'viewer';
  }
  if (_db) { _db.ref('shared/state').off(); if (_uid) _db.ref('users/' + _uid + '/personal').off(); }
  _db = null; _uid = null;
  firebase.auth().signOut().catch(() => {});
}

async function authLogin(email, password) {
  return firebase.auth().signInWithEmailAndPassword(email, password);
}

async function authRegister(email, password, displayName) {
  const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({ displayName });
  return cred;
}

/* ── Invite helpers ───────────────────────────────────────────────── */
function _randomToken() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function createInvite() {
  if (!_db || !_uid) return null;
  const token = _randomToken();
  await _db.ref('invites/' + token).set({
    tripId: TRIP_ID,
    role: 'editor',
    createdAt: Date.now(),
    used: false,
  });
  return token;
}

async function consumeInvite(token) {
  if (!_db || !_uid) return;
  const snap = await _db.ref('invites/' + token).get();
  if (!snap.exists()) return;
  const invite = snap.val();
  if (invite.used || invite.tripId !== TRIP_ID) return;
  const user = firebase.auth().currentUser;
  await _db.ref(MEMBER_PATH(_uid)).set({
    name:  user.displayName || user.email,
    email: user.email,
    role:  invite.role || 'editor',
    active: true,
  });
  await _db.ref('invites/' + token).update({ used: true });
}

async function getMembers() {
  if (!_db) return {};
  const snap = await _db.ref('trips/' + TRIP_ID + '/members').get();
  return snap.exists() ? snap.val() : {};
}

async function setMemberActive(uid, active) {
  if (!_db) return;
  await _db.ref(MEMBER_PATH(uid)).update({ active });
}

/* ── DB sync ──────────────────────────────────────────────────────── */
function syncInit(user) {
  _uid = user.uid;
  try {
    _db = firebase.database();

    /* Listen: shared trip state */
    _db.ref(SHARED_PATH).on('value', snap => {
      if (_ignoreNextShared) { _ignoreNextShared = false; return; }
      const remote = snap.val();
      if (!remote) return;
      applyRemoteState(remote, false);
    });

    /* Listen: personal state */
    _db.ref(USER_PATH(_uid)).on('value', snap => {
      if (_ignoreNextPersonal) { _ignoreNextPersonal = false; return; }
      const remote = snap.val();
      if (!remote) return;
      applyRemoteState(remote, true);
    });

    setSyncStatus('connected');

    if (typeof subscribePush === 'function' && typeof state !== 'undefined' && state.notifsEnabled) {
      subscribePush();
    }
  } catch (e) {
    console.warn('[sync] Firebase DB init failed:', e);
    setSyncStatus('error');
  }
}

/* Merge remote state into local, re-render if anything changed */
function applyRemoteState(remote, isPersonal) {
  if (!isPersonal) {
    if (remote._ts && state._localTs && remote._ts < state._localTs) return;
  }

  let changed = false;
  const keys = isPersonal ? PERSONAL_KEYS : SHARED_KEYS;
  keys.forEach(k => {
    const incoming = remote[k];
    if (incoming === undefined || incoming === null) return;
    if (JSON.stringify(incoming) !== JSON.stringify(state[k])) {
      state[k] = incoming;
      changed = true;
    }
  });
  if (changed) {
    localSave();
    if (typeof renderView === 'function') renderView(false);
    setSyncStatus('synced');
  }
}

/* Push local state to Firebase — split shared vs personal */
function syncSave() {
  if (!_db || !_uid) return;

  _ignoreNextShared = true;
  const sharedPayload = {
    overrides:         state.overrides         || {},
    locOverrides:      state.locOverrides       || {},
    durOverrides:      state.durOverrides       || {},
    typeOverrides:     state.typeOverrides      || {},
    priorityOverrides: state.priorityOverrides  || {},
    reasonOverrides:   state.reasonOverrides    || {},
    veganOverrides:    state.veganOverrides     || {},
    addedStops:        state.addedStops         || {},
    crossDayMoves:     state.crossDayMoves      || {},
    removed:           state.removed            || {},
    _ts:               Date.now(),
  };
  state._localTs = sharedPayload._ts;
  _db.ref(SHARED_PATH).set(sharedPayload)
    .then(() => setSyncStatus('synced'))
    .catch(() => setSyncStatus('error'));

  _ignoreNextPersonal = true;
  const personalPayload = {
    checked:        state.checked        || {},
    skipped:        state.skipped        || {},
    bucketList:     state.bucketList     || [],
    personalStops:  state.personalStops  || {},
    personalTickets:state.personalTickets|| {},
    personalPinned:  state.personalPinned  || {},
    notifLeadMins:   state.notifLeadMins   || {},
  };
  _db.ref(USER_PATH(_uid)).set(personalPayload)
    .catch(() => {});
}

/* ── Sync status dot ──────────────────────────────────────────────────── */
function setSyncStatus(status) {
  const dot = document.getElementById('sync-dot');
  if (!dot) return;
  dot.dataset.status = status;
  dot.title = { connected:'Sync connected', synced:'Synced', error:'Sync error — changes saved locally' }[status] || '';
}

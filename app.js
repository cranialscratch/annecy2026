/* ── Version & error capture ───────────────────────────────────────── */
const APP_VERSION = 'v181';
const _errorLog = [];
window.addEventListener('error', e => {
  _errorLog.push({ ts: new Date().toISOString(), msg: e.message || String(e), src: (e.filename||'').split('/').pop() + ':' + (e.lineno||'?') });
  if (_errorLog.length > 30) _errorLog.shift();
});
window.addEventListener('unhandledrejection', e => {
  _errorLog.push({ ts: new Date().toISOString(), msg: String(e.reason) });
  if (_errorLog.length > 30) _errorLog.shift();
});

/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  currentDayId: null,
  currentView: 'day',
  cascadeEnabled: false,
  cardView: 'full',
  notifsEnabled: false,
  useMetric: true,
  overrides: {},        // stopId → time string
  checked: {},          // stopId → bool
  locOverrides: {},     // stopId → { name, lat, lng }
  durOverrides: {},     // stopId → minutes
  typeOverrides: {},    // stopId → type string
  priorityOverrides: {}, // stopId → 0-3
  reasonOverrides: {},  // stopId → string
  veganOverrides: {},   // stopId → bool
  addedStops: {},       // dayId → [stop, ...]
};

/* ── Helpers ───────────────────────────────────────────────────────── */
function timeToMinutes(t) {
  if (!t || t === 'Daily' || t === 'All week' || t === 'Nearby' || t === 'Later') return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2,'0')}:${String(mins % 60).padStart(2,'0')}`;
}
function getStopTime(stop)     { return state.overrides[stop.id]          ?? stop.time; }
function getStopLat(stop)      { return state.locOverrides[stop.id]?.lat  ?? stop.lat; }
function getStopLng(stop)      { return state.locOverrides[stop.id]?.lng  ?? stop.lng; }
function getStopName(stop)     { return state.locOverrides[stop.id]?.name ?? stop.location; }
function getStopDuration(stop) { return state.durOverrides[stop.id]       ?? stop.duration ?? 30; }
function getStopType(stop)     { return state.typeOverrides[stop.id]     ?? stop.type; }

const TYPE_ICON = {
  depart:       'ph-car',
  charging:     'ph-lightning',
  transport:    'ph-train',
  food:         'ph-fork-knife',
  hotel:        'ph-bed',
  town:         'ph-buildings',
  village:      'ph-house',
  wander:       'ph-footprints',
  architecture: 'ph-building',
  experience:   'ph-star',
  scenic:       'ph-mountains',
  historic:     'ph-castle-turret',
  work:         'ph-laptop',
  festival:     'ph-film-slate',
};
function stopTypeIcon(stop) {
  const ph = TYPE_ICON[getStopType(stop)] || 'ph-map-pin';
  return `<i class="ph ${ph} card-type-icon"></i>`;
}
function getStopPriority(stop) { return state.priorityOverrides[stop.id] ?? stop.priority ?? 0; }
function getStopReason(stop)   { return state.reasonOverrides[stop.id]   ?? stop.reason; }
function getStopVegan(stop)    { return stop.id in state.veganOverrides ? state.veganOverrides[stop.id] : !!stop.veganFriendly; }
function priorityStars(p) { return p >= 1 ? '★'.repeat(p) + '☆'.repeat(3-p) : ''; }
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}
function getDayLabel(day) {
  if (day.isCountdown) return '<i class="ph ph-mountains"></i>';
  if (day.isFestival) return 'Fest';
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return names[new Date(day.date + 'T00:00:00').getDay()];
}
function findTodayDayId() {
  const today = new Date().toISOString().slice(0,10);
  // Exact date match first (test days, travel days) — before countdown catch-all
  for (const day of TRIP_DATA.days) {
    if (day.date === today) return day.id;
    if (day.isFestival && today >= day.date && today <= day.dateEnd) return day.id;
  }
  // Fallback: countdown period
  for (const day of TRIP_DATA.days) {
    if (day.isCountdown && today <= day.dateEnd) return day.id;
  }
  return null;
}
function typeLabel(type) {
  return { charging:'Charging', hotel:'Hotel', transport:'Transport', food:'Food',
    architecture:'Architecture', village:'Village', town:'Town',
    experience:'Experience', wander:'Explore', depart:'Depart',
    scenic:'Scenic', historic:'Historic', festival:'Festival' }[type] || type;
}
function nowMinutes() {
  const n = new Date(); return n.getHours() * 60 + n.getMinutes();
}
/* ── Traffic polling ────────────────────────────────────────────────── */
let _trafficPollTimer    = null;
let _trafficBaseline     = {};   // stopId → baseline travel seconds
let _trafficLastFired    = {};   // stopId → timestamp of last alert

function findNextDrivingLeg() {
  // Returns { from: {lat,lng}, to: stop } for the next stop we're driving to,
  // based on current time vs today's itinerary. Returns null if not a driving day.
  const today = new Date().toISOString().slice(0, 10);
  const day = TRIP_DATA.days.find(d =>
    d.date === today || (d.isFestival && today >= d.date && today <= (d.dateEnd || d.date))
  );
  if (!day || day.isCountdown) return null;
  const now = nowMinutes();
  const timedStops = day.stops.filter(s => timeToMinutes(getStopTime(s)) !== null);
  for (let i = 0; i < timedStops.length - 1; i++) {
    const cur  = timedStops[i];
    const next = timedStops[i + 1];
    const depMins = timeToMinutes(getStopTime(cur)) + getStopDuration(cur);
    const arrMins = timeToMinutes(getStopTime(next));
    // We're in the travel window between cur and next
    if (now >= depMins - 10 && now < arrMins + 15) {
      const toLat = getStopLat(next), toLng = getStopLng(next);
      if (!toLat || !toLng) continue;
      return { fromStop: cur, toStop: next, scheduledMins: arrMins - depMins };
    }
  }
  return null;
}

async function pollTraffic() {
  if (!state.notifsEnabled || !notifGranted()) return;
  if (_userLat === null || _userLng === null) return;
  const leg = findNextDrivingLeg();
  if (!leg) return;

  try {
    const body = {
      origin:      { location: { latLng: { latitude: _userLat, longitude: _userLng } } },
      destination: { location: { latLng: { latitude: getStopLat(leg.toStop), longitude: getStopLng(leg.toStop) } } },
      travelMode:  'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      departureTime: new Date().toISOString(),
    };
    const r = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes?key=${GKEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-FieldMask': 'routes.duration,routes.staticDuration' },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    const route = d.routes?.[0];
    if (!route) return;

    const trafficSecs = parseInt(route.duration);           // with traffic
    const staticSecs  = parseInt(route.staticDuration);     // without traffic
    const delaySecs   = trafficSecs - staticSecs;
    const id = leg.toStop.id;

    // Establish baseline on first poll for this leg
    if (!_trafficBaseline[id]) {
      _trafficBaseline[id] = staticSecs;
      return;
    }

    const delayMins = Math.round(delaySecs / 60);
    if (delayMins >= 5) {
      // Only re-alert if last alert for this leg was >20 min ago
      const now = Date.now();
      if (_trafficLastFired[id] && now - _trafficLastFired[id] < 20 * 60 * 1000) return;
      _trafficLastFired[id] = now;

      const trafficMins = Math.round(trafficSecs / 60);
      const tH = Math.floor(trafficMins/60), tM = trafficMins%60;
      const tStr = trafficMins >= 60 ? `${tH}h ${tM}m` : `${trafficMins}m`;
      const title = '🚦 Traffic delay ahead';
      const msg   = `${delayMins} min delay to ${getStopName(leg.toStop)}. Journey now ~${tStr}. Consider leaving earlier.`;
      try {
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIF', title, body: msg, tag: `traffic-${id}` });
        } else {
          new Notification(title, { body: msg, icon: './icons/icon-180.png', tag: `traffic-${id}` });
        }
      } catch {}
    }
  } catch {}
}

function startTrafficPolling() {
  stopTrafficPolling();
  pollTraffic();
  _trafficPollTimer = setInterval(pollTraffic, 5 * 60 * 1000);
}
function stopTrafficPolling() {
  clearInterval(_trafficPollTimer);
  _trafficPollTimer = null;
}

function fmtDist(km) {
  if (state.useMetric) return `${Math.round(km)} km`;
  return `${Math.round(km * 0.621371)} mi`;
}
function openWeatherApp(lat, lng) {
  // yr.no (Norwegian Met Office) accepts lat/lng directly — no search needed, great EU coverage
  window.open(`https://www.yr.no/en/forecast/daily-table/${lat},${lng}`, '_blank');
}
function openDirections(toLat, toLng) {
  // Use geo: URI — iOS opens Apple Maps, Android opens Google Maps
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: fLat, longitude: fLng } = pos.coords;
      window.open(`https://maps.apple.com/?saddr=${fLat},${fLng}&daddr=${toLat},${toLng}&dirflg=d`, '_blank');
    },
    () => {
      // No location permission — just open destination
      window.open(`https://maps.apple.com/?daddr=${toLat},${toLng}&dirflg=d`, '_blank');
    },
    { timeout: 5000 }
  );
}

/* ── Leave-by countdown helpers ────────────────────────────────────── */
function hasExplicitDuration(stop) {
  return stop.id in state.durOverrides || stop.duration !== undefined;
}
function leaveByInfo(stop) {
  if (!hasExplicitDuration(stop)) return null;
  const arrMins = timeToMinutes(getStopTime(stop));
  if (arrMins === null) return null;
  const leaveMins = arrMins + getStopDuration(stop);
  const leaveStr  = minutesToTime(leaveMins);
  const now       = nowMinutes();
  if (now >= arrMins && now <= leaveMins) {
    const rem     = leaveMins - now;
    const urgent  = rem <= 15;
    const remStr  = rem < 60
      ? `${rem}m`
      : `${Math.floor(rem/60)}h ${rem % 60 ? (rem%60)+'m' : ''}`.trim();
    return { active: true, label: rem <= 0 ? 'Time to leave!' : `Leave in ${remStr}`, leaveStr, urgent };
  }
  return { active: false, label: `Leave by ${leaveStr}`, leaveStr, urgent: false };
}
function renderLeaveByEl(el, stop) {
  const info = leaveByInfo(stop);
  if (!info) { el.style.display = 'none'; return; }
  const icon = info.urgent ? 'ph-bell-ringing' : 'ph-clock';
  el.innerHTML = `<i class="ph ${icon}"></i> ${info.label}`;
  el.className = `leave-by-pill${info.urgent ? ' urgent' : ''}${info.active ? ' active' : ''}`;
  el.style.display = '';
}
/* ── Departure notifications ────────────────────────────────────────
   Fires a local notification 15 min before every leave-by time or
   depart stop on today's day. Uses setTimeout scheduled from the
   current time; also re-checked by the leave-by ticker so rescheduling
   after the page wakes from background still works.
──────────────────────────────────────────────────────────────────── */
const _firedNotifs  = new Set(); // stopId → fired today, reset at midnight
let   _notifTimers  = [];
let   _notifMidnightTimer = null;

function notifSupported() {
  return 'Notification' in window;
}
function notifGranted() {
  return notifSupported() && Notification.permission === 'granted';
}

/* ── Web Push (server-side delivery so notifications fire when backgrounded) */
const VAPID_PUBLIC_KEY = 'BO4iAHni_Sj3kSZdr5x7Zcg755jVTIQ66zKCQT42psEvHCu_ia_8ABg-Z7UT1xPgoUusTVyH5Ftp0D9acj0Zvzg';

function getDeviceId() {
  let id = localStorage.getItem('annecy_device_id');
  if (!id) {
    id = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
    try { localStorage.setItem('annecy_device_id', id); } catch {}
  }
  return id;
}

function urlB64ToUint8(b64) {
  const p = '='.repeat((4 - b64.length % 4) % 4);
  const s = atob((b64 + p).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...s].map(c => c.charCodeAt(0)));
}

async function subscribePush() {
  if (!('PushManager' in window) || !_db) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    // Re-subscribe if VAPID key changed (stored key version tracks this)
    const storedKeyVer = localStorage.getItem('vapid_key_ver');
    const currentKeyVer = VAPID_PUBLIC_KEY.slice(-12);
    let sub = await reg.pushManager.getSubscription();
    if (sub && storedKeyVer !== currentKeyVer) {
      await sub.unsubscribe();
      sub = null;
    }
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8(VAPID_PUBLIC_KEY),
      });
      localStorage.setItem('vapid_key_ver', currentKeyVer);
    }
    await _db.ref(`pushSubs/${getDeviceId()}`).set(JSON.parse(JSON.stringify(sub)));
  } catch (e) { console.warn('Push subscribe failed', e); }
}

async function writePushQueue() {
  if (!_db || !state.notifsEnabled || !notifGranted()) return;
  const now = new Date();
  const nowMs = now.getTime();
  const todayStartMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const newEntries = {};
  collectTodayLeaveEvents().forEach(({ stop, notifMins, label }) => {
    if (notifMins < 0) return;
    const fireMs = todayStartMs + notifMins * 60000;
    if (fireMs < nowMs - 60000) return;
    newEntries['sched_' + stop.id + '_' + notifMins] = {
      fireAt: fireMs,
      title: '🕐 Departure reminder',
      body: label,
      tag: `depart-${stop.id}`,
    };
  });
  // Use update() so test_* and countdown_* entries are never wiped
  const deviceRef = _db.ref(`pushQueue/${getDeviceId()}`);
  const snap = await deviceRef.once('value');
  const existing = snap.val() || {};
  const updates = {};
  // Remove stale sched_ entries not in the new set
  Object.keys(existing).filter(k => k.startsWith('sched_') && !newEntries[k]).forEach(k => { updates[k] = null; });
  Object.assign(updates, newEntries);
  if (Object.keys(updates).length) await deviceRef.update(updates);
}

async function scheduleHourlyCountdown() {
  if (!_db || !state.notifsEnabled || !notifGranted()) return;
  const day1 = TRIP_DATA.days.find(d => d.id === 'day1');
  if (!day1) return;
  // Departure = first stop of Day 1 (read its time field)
  const firstStop = day1.stops?.[0];
  const firstTime = firstStop?.time || '10:30';
  const departureMs = new Date(day1.date + 'T' + firstTime + ':00').getTime();
  const nowMs = Date.now();
  if (nowMs >= departureMs) return;

  const deviceRef = _db.ref(`pushQueue/${getDeviceId()}`);
  const snap = await deviceRef.once('value');
  const existing = snap.val() || {};
  const updates = {};
  // Clear stale countdown_ entries
  Object.keys(existing).filter(k => k.startsWith('countdown_')).forEach(k => { updates[k] = null; });

  // Generate one entry per hour from next full hour until departure
  const start = new Date(); start.setMinutes(0, 0, 0); start.setHours(start.getHours() + 1);
  for (let t = start.getTime(); t < departureMs; t += 3600000) {
    const h = new Date(t).getHours();
    if (h >= 0 && h < 8) continue; // skip midnight–8am
    const hoursLeft = Math.max(1, Math.floor((departureMs - t) / 3600000));
    updates[`countdown_${t}`] = {
      fireAt: t,
      title: '🚗 Departure countdown',
      body: `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} to go until we leave for Annecy!`,
      tag: 'countdown',
    };
  }
  if (Object.keys(updates).length) await deviceRef.update(updates);
}


function updateNotifBtn() {
  const btn = document.getElementById('notif-btn');
  const lbl = document.getElementById('notif-label');
  const testBtn = document.getElementById('notif-test-btn');
  if (!btn || !lbl) return;
  if (!notifSupported()) {
    btn.style.opacity = '0.4';
    lbl.textContent = 'Alerts not supported';
    if (testBtn) testBtn.style.display = 'none';
    return;
  }
  const on = state.notifsEnabled && notifGranted();
  lbl.textContent = on ? 'Departure alerts on' : 'Departure alerts off';
  btn.querySelector('.ph').className = on
    ? 'ph ph-bell-ringing drawer-icon'
    : 'ph ph-bell drawer-icon';
}


async function testServerPush() {
  if (!_db) { showToast('Firebase not connected'); return; }
  await subscribePush();
  const key = 'test_' + Date.now();
  await _db.ref(`pushQueue/${getDeviceId()}/${key}`).set({
    fireAt: Date.now(),
    title: '🔔 Test notification',
    body: 'Server push is working!',
    tag: 'push-test',
  });
  // Also fire immediately via SW so there's instant feedback
  sendNotif('🔔 Test notification', 'Server push queued — will also arrive via server within 5 min', 'push-test-local');
  showToast('Test sent + queued for server delivery');
}

/* ── Version panel ─────────────────────────────────────────────────── */
function getFeatureStatuses() {
  const placesTotal      = Object.keys(_placesCache).length;
  const placesWithPhotos = Object.values(_placesCache).filter(v => v?.photos?.length).length;
  const wikiCached       = Object.keys(_wikiCache).filter(k => _wikiCache[k] != null).length;
  const weatherCached    = Object.keys(_weatherCache).filter(k => _weatherCache[k] != null).length;
  const notifPerm        = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  const hasPush          = 'PushManager' in window;
  const swCtrl           = !!navigator.serviceWorker?.controller;
  const hasSW            = 'serviceWorker' in navigator;

  return [
    { cat:'UI',            name:'Timeline / full-card view',        status:'ok',                                                         note:'Always available' },
    { cat:'UI',            name:'Compact view',                     status:'ok',                                                         note:'Always available' },
    { cat:'UI',            name:'Calendar view',                    status:'ok',                                                         note:'Fixed v164 — DOM insertBefore crash' },
    { cat:'UI',            name:'Festival calendar (date+weather)', status:'ok',                                                         note:'Redesigned v161' },
    { cat:'UI',            name:'Dark / light mode toggle',         status:'ok',                                                         note:'Always available' },
    { cat:'UI',            name:'Detail overlay',                   status:'ok',                                                         note:'Always available' },
    { cat:'UI',            name:'Leave-by countdown pills',         status:'ok',                                                         note:'Always available' },
    { cat:'UI',            name:'Edit times + ripple cascade',      status:'ok',                                                         note:'Always available' },
    { cat:'UI',            name:'Add / edit stops',                 status:'ok',                                                         note:'Always available' },
    { cat:'UI',            name:'Map view (Leaflet)',               status: typeof L !== 'undefined' ? 'ok' : 'warn',                    note: typeof L !== 'undefined' ? 'Leaflet loaded' : 'Leaflet not yet loaded — loads on first use' },
    { cat:'Data',          name:'Trip itinerary',                   status: TRIP_DATA?.days?.length > 3 ? 'ok' : 'error',               note: `${TRIP_DATA?.days?.length || 0} days in TRIP_DATA` },
    { cat:'Data',          name:'Firebase sync',                    status: _db ? 'ok' : 'error',                                       note: _db ? 'Connected — shared state live' : 'Not connected' },
    { cat:'Photos',        name:'Google Places photo pipeline',     status: placesTotal === 0 ? 'warn' : placesWithPhotos > 0 ? 'ok' : 'warn', note: `${placesWithPhotos} of ${placesTotal} stops have photos cached` },
    { cat:'Photos',        name:'Wikipedia article photos',         status: wikiCached > 0 ? 'ok' : 'warn',                            note: `${wikiCached} articles cached` },
    { cat:'Photos',        name:'Street View / Satellite fallback', status:'ok',                                                         note:'Always available via Google Static Maps' },
    { cat:'Weather',       name:'Open-Meteo forecast',              status: weatherCached > 0 ? 'ok' : 'warn',                          note: `${weatherCached} day(s) cached` },
    { cat:'Notifications', name:'Notification permission',          status: notifPerm === 'granted' ? 'ok' : notifPerm === 'denied' ? 'error' : 'warn', note: notifPerm },
    { cat:'Notifications', name:'Departure alerts',                 status: state.notifsEnabled && notifPerm === 'granted' ? 'ok' : 'warn', note: state.notifsEnabled ? 'Enabled' : 'Disabled in settings' },
    { cat:'Notifications', name:'Push API (browser support)',       status: hasPush ? 'ok' : 'error',                                   note: hasPush ? 'PushManager available' : 'PushManager not available' },
    { cat:'Notifications', name:'Server push (Cloud Function)',     status:'warn',                                                       note:'Cannot verify from client — use test push to check' },
    { cat:'SW / Cache',    name:'Service Worker support',           status: hasSW ? 'ok' : 'error',                                     note: hasSW ? 'serviceWorker in navigator' : 'Not supported' },
    { cat:'SW / Cache',    name:'Service Worker active',            status: swCtrl ? 'ok' : 'warn',                                     note: swCtrl ? `Active (cache ${APP_VERSION})` : 'Not yet controlling — reload after first install' },
    { cat:'SW / Cache',    name:'Offline / PWA cache',              status: swCtrl ? 'ok' : 'warn',                                     note: swCtrl ? 'Core assets cached' : 'SW not active yet' },
  ];
}

function showVersionPanel() {
  const panel = document.getElementById('version-overlay');
  if (!panel) return;
  panel.classList.remove('hidden');
  requestAnimationFrame(() => panel.classList.add('open'));

  // Populate feature list
  const body = document.getElementById('version-body');
  if (!body) return;
  const statuses = getFeatureStatuses();
  const cats = [...new Set(statuses.map(f => f.cat))];

  const iconMap = { ok:'ph-check-circle', warn:'ph-warning', error:'ph-x-circle' };
  const colMap  = { ok:'vs-ok', warn:'vs-warn', error:'vs-error' };

  body.innerHTML = cats.map(cat => {
    const items = statuses.filter(f => f.cat === cat);
    return `
      <div class="vs-cat-label">${cat}</div>
      ${items.map(f => `
        <div class="vs-item">
          <i class="ph ${iconMap[f.status]} ${colMap[f.status]}"></i>
          <div class="vs-item-text">
            <div class="vs-item-name">${f.name}</div>
            <div class="vs-item-note">${f.note}</div>
          </div>
        </div>`).join('')}`;
  }).join('');
}

function hideVersionPanel() {
  const panel = document.getElementById('version-overlay');
  if (!panel) return;
  panel.classList.remove('open');
  setTimeout(() => panel.classList.add('hidden'), 280);
}

async function copyDevData() {
  let statuses, pushEndpoint = null;
  try { statuses = getFeatureStatuses(); } catch(e) { showToast('getFeatureStatuses error: ' + e.message); return; }
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    const sub = await reg?.pushManager?.getSubscription?.();
    if (sub) pushEndpoint = '…' + sub.endpoint.slice(-40);
  } catch {}

  const data = {
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform || navigator.userAgentData?.platform || 'unknown',
    online: navigator.onLine,
    today: new Date().toISOString().slice(0, 10),
    currentDayId: state.currentDayId,
    cardView: state.cardView,
    notifsEnabled: state.notifsEnabled,
    notifPermission: typeof Notification !== 'undefined' ? Notification.permission : 'N/A',
    pushAPISupported: 'PushManager' in window,
    pushEndpoint,
    firebaseConnected: !!_db,
    swController: !!navigator.serviceWorker?.controller,
    placesCacheStops: Object.keys(_placesCache).length,
    placesWithPhotos: Object.values(_placesCache).filter(v => v?.photos?.length).length,
    wikiCached: Object.keys(_wikiCache).filter(k => _wikiCache[k] != null).length,
    weatherDaysCached: Object.keys(_weatherCache).filter(k => _weatherCache[k] != null).length,
    tripDays: TRIP_DATA?.days?.length,
    features: statuses.map(f => ({ cat: f.cat, name: f.name, status: f.status, note: f.note })),
    recentErrors: _errorLog.slice(-15),
  };

  // Read push diagnostics from Firebase
  if (_db) {
    try {
      const deviceId = getDeviceId();
      const [subSnap, qSnap] = await Promise.all([
        _db.ref(`pushSubs/${deviceId}`).once('value'),
        _db.ref(`pushQueue/${deviceId}`).once('value'),
      ]);
      const errSnap = await _db.ref(`pushErrors/${deviceId}`).limitToLast(5).once('value');
      data.pushSubInFirebase  = subSnap.exists() ? '…' + (subSnap.val()?.endpoint || '').slice(-40) : null;
      data.pushQueueEntries   = qSnap.exists() ? Object.keys(qSnap.val() || {}).length : 0;
      data.pushErrors         = errSnap.exists() ? Object.values(errSnap.val()) : [];
    } catch(e) { data.pushFirebaseReadError = e.message; }
  }

  let text;
  try { text = JSON.stringify(data, null, 2); } catch(e) { showToast('JSON error: ' + e.message); return; }

  // Show full-screen copyable text overlay
  let box = document.getElementById('devdata-overlay');
  if (!box) {
    box = document.createElement('div');
    box.id = 'devdata-overlay';
    box.innerHTML = `
      <div id="devdata-panel">
        <div id="devdata-header">
          <span>Dev Data — select all &amp; copy</span>
          <button id="devdata-close" class="icon-btn glass-btn"><i class="ph ph-x"></i></button>
        </div>
        <textarea id="devdata-ta" spellcheck="false" autocorrect="off" autocomplete="off"></textarea>
        <div id="devdata-footer">
          <button class="pill-btn primary full-width" id="devdata-copy-btn"><i class="ph ph-clipboard-text"></i> Copy to clipboard</button>
        </div>
      </div>`;
    document.getElementById('app').appendChild(box);
    document.getElementById('devdata-close').addEventListener('click', () => box.classList.add('hidden'));
    document.getElementById('devdata-copy-btn').addEventListener('click', () => {
      const ta = document.getElementById('devdata-ta');
      ta.select();
      ta.setSelectionRange(0, 99999);
      try { navigator.clipboard.writeText(ta.value).then(() => showToast('Copied!')).catch(() => {}); } catch {}
      try { document.execCommand('copy'); showToast('Copied!'); } catch {}
    });
  }
  const ta = document.getElementById('devdata-ta');
  ta.value = text;
  box.classList.remove('hidden');
  // Select all text so it's ready to copy on devices that support it
  setTimeout(() => { ta.focus(); ta.select(); ta.setSelectionRange(0, 99999); }, 100);
}

function showToast(msg, durationMs = 2800) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    document.getElementById('app').appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('visible'), durationMs);
}

async function enableNotifs() {
  if (!notifSupported()) return;
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    state.notifsEnabled = true;
    try { localStorage.setItem('annecy_notifs', '1'); } catch {}
    subscribePush();
    scheduleNotifs();
    startTrafficPolling();
    showToast('🔔 Departure alerts on');
  } else {
    state.notifsEnabled = false;
    try { localStorage.setItem('annecy_notifs', '0'); } catch {}
    showToast('Notifications blocked — check iOS Settings');
  }
  updateNotifBtn();
}

function disableNotifs() {
  state.notifsEnabled = false;
  try { localStorage.setItem('annecy_notifs', '0'); } catch {}
  _notifTimers.forEach(clearTimeout);
  _notifTimers = [];
  stopTrafficPolling();
  updateNotifBtn();
  showToast('🔕 Departure alerts off');
}

function collectTodayLeaveEvents() {
  const today = new Date().toISOString().slice(0, 10);
  const events = [];
  for (const day of TRIP_DATA.days) {
    const covers = day.date === today ||
      (day.isFestival && today >= day.date && today <= (day.dateEnd || day.date));
    if (!covers) continue;
    for (const stop of getDayStops(day)) {
      const type = getStopType(stop);
      // depart stops: notify at stop time - 15
      if (type === 'depart') {
        const m = timeToMinutes(getStopTime(stop));
        if (m !== null) events.push({ stop, notifMins: m - 15, label: `Departing from ${getStopName(stop)}` });
      }
      // stops with explicit duration: notify at leaveBy - 15
      if (hasExplicitDuration(stop) && type !== 'depart') {
        const arr = timeToMinutes(getStopTime(stop));
        if (arr !== null) {
          const leaveBy = arr + getStopDuration(stop);
          events.push({ stop, notifMins: leaveBy - 15, label: `Leave ${getStopName(stop)} in 15 min` });
        }
      }
    }
  }
  return events;
}

async function sendNotif(title, body, tag) {
  try {
    // Wait up to 3s for SW controller to be available (may be null on cold resume)
    let ctrl = navigator.serviceWorker?.controller;
    if (!ctrl) {
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise(r => setTimeout(r, 3000)),
      ]);
      ctrl = navigator.serviceWorker?.controller;
    }
    if (ctrl) {
      ctrl.postMessage({ type: 'SHOW_NOTIF', title, body, tag });
    } else {
      new Notification(title, { body, tag, icon: './icons/icon-180.png' });
    }
  } catch {}
}

function scheduleNotifs() {
  _notifTimers.forEach(clearTimeout);
  _notifTimers = [];
  if (!notifGranted() || !state.notifsEnabled) return;

  const now    = new Date();
  const nowMs  = now.getTime();
  const todayStartMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  collectTodayLeaveEvents().forEach(({ stop, notifMins, label }) => {
    if (notifMins < 0) return;
    const fireMs = todayStartMs + notifMins * 60000;
    const delay  = fireMs - nowMs;
    const key    = stop.id + ':' + notifMins;

    // Catch-up: fire immediately if missed within last 30 min
    if (delay < 0 && delay > -1800000 && !_firedNotifs.has(key)) {
      _firedNotifs.add(key);
      sendNotif('🕐 Departure reminder', label, `depart-${stop.id}`);
      return;
    }
    if (delay < 0) return;

    const t = setTimeout(() => {
      if (!state.notifsEnabled || !notifGranted()) return;
      if (_firedNotifs.has(key)) return;
      _firedNotifs.add(key);
      sendNotif('🕐 Departure reminder', label, `depart-${stop.id}`);
    }, delay);
    _notifTimers.push(t);
  });

  // Write queue to Firebase for server-side delivery while backgrounded
  writePushQueue();
  scheduleHourlyCountdown();

  // Reset fired set at midnight
  clearTimeout(_notifMidnightTimer);
  const msToMidnight = todayStartMs + 86400000 - nowMs;
  _notifMidnightTimer = setTimeout(() => {
    _firedNotifs.clear();
    scheduleNotifs();
  }, msToMidnight);
}

let _leaveByInterval = null;
let _renderCount = 0;
function startLeaveByTicker() {
  clearInterval(_leaveByInterval);
  updateAllLeaveBy();
  _leaveByInterval = setInterval(() => { updateAllLeaveBy(); scheduleNotifs(); }, 30000);
}
function updateAllLeaveBy() {
  document.querySelectorAll('[data-leaveby]').forEach(el => {
    const stop = findStop(el.dataset.leaveby);
    if (!stop) return;
    if (el.classList.contains('compact-leaveby')) {
      // compact span: update text+class in place
      const info = leaveByInfo(stop);
      if (info) {
        const icon = info.urgent ? 'ph-bell-ringing' : 'ph-clock';
        el.innerHTML = `<i class="ph ${icon}"></i> ${info.label}`;
        el.className = `compact-leaveby${info.urgent ? ' urgent' : ''}`;
      }
    } else {
      renderLeaveByEl(el, stop);
    }
  });
  const detailEl = document.getElementById('detail-leaveby');
  if (detailEl && _detailStop) renderLeaveByEl(detailEl, _detailStop);

  // Keep Now pill time current
  const nowPill = document.getElementById('tl-now-time');
  if (nowPill) nowPill.textContent = minutesToTime(nowMinutes());
  const calNow = document.getElementById('cal-now-time');
  if (calNow) {
    calNow.textContent = minutesToTime(nowMinutes());
    const marker = document.getElementById('cal-now-marker');
    // Can't reposition without knowing dayStart - just update text
  }
}
function buildTags(stop) {
  const tags = [];
  if (getStopVegan(stop))              tags.push(`<span class="tl-tag vegan"><i class="ph ph-leaf"></i> Vegan-friendly</span>`);
  if (getStopType(stop) === 'charging') tags.push(`<span class="tl-tag charge"><i class="ph ph-lightning"></i> Supercharger</span>`);
  if (getStopPriority(stop) >= 3)       tags.push(`<span class="tl-tag poi">★ Must-see</span>`);
  return tags.length ? `<div class="tl-card-tags">${tags.join('')}</div>` : '';
}

/* ── Wikipedia article titles per stop (free API, no key needed) ───── */
// Explicit Wikipedia article per stop. Only stops listed here get a Wikipedia photo.
// Everything else falls through to Street View (unique per GPS coordinate, no duplicates).
const WIKI_TITLES = {
  // Day 1
  'd1s3':  'Eurotunnel_Le_Shuttle',
  'd1s4':  'Eurotunnel_Le_Shuttle',
  'd1s5':  'Calais',
  'd1s6':  'Saint-Valery-sur-Somme',
  // Day 2
  'd2s2':  "Hortillonnages_d'Amiens",
  'd2s6':  'Gerberoy',
  'd2s10': 'Ruelle_des_Chats',
  // Day 3
  'd3s2':  'Flavigny-sur-Ozerain',
  'd3s4':  'Fontenay_Abbey',
  'd3s10': 'Hospices_de_Beaune',
  // Day 4
  'd4s4':  'Menthon-Saint-Bernard',
  'd4s5':  'Geneva_Airport',
  // Festival
  'fs1':   'Annecy_International_Animation_Film_Festival',
  'fs2':   'Menthon-Saint-Bernard',
  'fs3':   'Lake_Annecy',
  'fs4':   'Annecy',
  'fs5':   "Château_d'Annecy",
  'fs6':   'Château_de_Menthon-Saint-Bernard',
  'fs7':   'Talloires',
  'fs8':   'Gorges_du_Fier',
  'fs9':   'Château_de_Thorens',
  'fs10':  'Pont_des_Amours,_Annecy',
  'fs14':  "Palais_de_l'Isle",
  // Day 5
  'd5s2':  'Royal_Saltworks_of_Arc-et-Senans',
  'd5s5':  'Citadel_of_Besançon',
  // Day 6
  'd6s3':  'Giverny',
  'd6s5':  'Rouen_Cathedral',
  // Day 7
  'd7s3':  'Calais',
  'd7s4':  'Eurotunnel_Le_Shuttle',
  'd7s5':  'Folkestone',
};

function wikiSearchName(stop) {
  const t = WIKI_TITLES[stop.id];
  if (t) return t.replace(/_/g, ' ');
  return stop.placesQuery || stop.location || null;
}

/* ── Wikipedia data cache ──────────────────────────────────────────── */
const _wikiCache = {}; // stopId → { img, extract } | null
const _poiCache  = {}; // stopId → [{ title, img, dist, url }]

/* ── Google Places photo cache ─────────────────────────────────────── */
// _placesCache[stopId] = { placeId, photos:[url,...], attributions:[str,...], ts }
const _placesCache = {};
function loadPlacesCache() {
  try { const s = localStorage.getItem('annecy_places_v2'); if (s) Object.assign(_placesCache, JSON.parse(s)); } catch {}
}
function savePlacesCache() {
  try { localStorage.setItem('annecy_places_v2', JSON.stringify(_placesCache)); } catch {}
}

function _scorePlacesPhoto(ref, idx) {
  const w = ref.widthPx || 0, h = ref.heightPx || 0;
  let s = Math.min(w, 2000) / 20;
  if (w > h)    s += 40;   // landscape
  if (w > 1400) s += 20;   // high-res
  if (idx === 0) s += 30;  // Google's cover photo
  if (w < 400 || h < 300) s -= 60;
  return s;
}

async function fetchPlacesPhotos(stop) {
  const cached = _placesCache[stop.id];
  // Return cached if < 7 days old
  if (cached?.photos?.length && cached.ts && Date.now() - cached.ts < 7 * 86400_000) return cached.photos;

  const type = getStopType(stop);
  if (type === 'charging' || type === 'depart') return [];

  try {
    // Step 1: Text Search to resolve Place ID
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GKEY,
        'X-Goog-FieldMask': 'places.id,places.location',
      },
      body: JSON.stringify({
        textQuery: stop.placesQuery || stop.location,
        locationBias: { circle: { center: { latitude: stop.lat, longitude: stop.lng }, radius: 3000 } },
        maxResultCount: 3,
      }),
    });
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const candidates = searchData.places || [];
    if (!candidates.length) return [];

    // Pick closest candidate to stop coordinates
    let best = candidates[0], bestDist = Infinity;
    for (const p of candidates) {
      const d = Math.hypot((p.location?.latitude||0) - stop.lat, (p.location?.longitude||0) - stop.lng);
      if (d < bestDist) { bestDist = d; best = p; }
    }
    const placeId = best.id;

    // Step 2: Place Details to get photo references
    const detailRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { 'X-Goog-Api-Key': GKEY, 'X-Goog-FieldMask': 'photos' },
    });
    if (!detailRes.ok) return [];
    const detailData = await detailRes.json();
    const refs = detailData.photos || [];
    if (!refs.length) return [];

    // Step 3: Score, sort, cap at 20
    const scored = refs
      .map((ref, idx) => ({ ref, score: _scorePlacesPhoto(ref, idx) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const photos = scored.map(({ ref }) =>
      `https://places.googleapis.com/v1/${ref.name}/media?maxWidthPx=1200&key=${GKEY}`
    );
    const attributions = scored.map(({ ref }) =>
      (ref.authorAttributions || []).map(a => a.displayName).filter(Boolean).join(', ')
    );

    _placesCache[stop.id] = { placeId, photos, attributions, ts: Date.now() };
    savePlacesCache();
    return photos;
  } catch { return []; }
}

function getPlacesAttribution(stop, idx) {
  return _placesCache[stop.id]?.attributions?.[idx] || '';
}

function loadWikiCache() {
  try {
    const saved = localStorage.getItem('annecy_wiki_v6');
    if (saved) Object.assign(_wikiCache, JSON.parse(saved));
  } catch {}
}
function saveWikiCache() {
  try { localStorage.setItem('annecy_wiki_v6', JSON.stringify(_wikiCache)); } catch {}
}

/* ── Google Places photos ──────────────────────────────────────────── */
const _googlePhotos = {}; // stopId → [url, ...] | null

function loadGooglePhotos() {
  try {
    const saved = localStorage.getItem('annecy_gplaces_v2');
    if (saved) Object.assign(_googlePhotos, JSON.parse(saved));
  } catch {}
}
function saveGooglePhotos() {
  try { localStorage.setItem('annecy_gplaces_v2', JSON.stringify(_googlePhotos)); } catch {}
}

function googleSearchQuery(stop) {
  const type = getStopType(stop);
  if (type === 'charging') return null; // satellite used instead
  if (type === 'depart')   return null; // no photo on depart rows
  // Use the location name as-is — it's specific enough for Places search
  return stop.location;
}

async function fetchGooglePlacesPhotos(stop) {
  // null = no photos found (retry allowed); undefined = never fetched
  if (_googlePhotos[stop.id]?.length) return _googlePhotos[stop.id];
  const query = googleSearchQuery(stop);
  if (!query) { _googlePhotos[stop.id] = []; return []; }
  try {
    // Text search for the place
    const searchRes = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GKEY,
        'X-Goog-FieldMask': 'places.photos,places.id',
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: { circle: { center: { latitude: stop.lat, longitude: stop.lng }, radius: 5000 } },
        maxResultCount: 1,
      }),
    });
    if (!searchRes.ok) { _googlePhotos[stop.id] = []; saveGooglePhotos(); return []; }
    const searchData = await searchRes.json();
    const place = searchData.places?.[0];
    if (!place?.photos?.length) { _googlePhotos[stop.id] = null; saveGooglePhotos(); return []; }
    // Take up to 5 photos, build display URLs
    const urls = place.photos.slice(0, 5).map(photo =>
      `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&key=${GKEY}`
    );
    _googlePhotos[stop.id] = urls;
    saveGooglePhotos();
    return urls;
  } catch {
    // Don't cache failures — retry next load
    return [];
  }
}

async function fetchWikiData(stop) {
  if (_wikiCache[stop.id] !== undefined) return _wikiCache[stop.id];

  // Only fetch Wikipedia for stops with an explicit article assigned.
  // Everything else uses Street View — no geosearch fallback, no duplicates.
  const article = WIKI_TITLES[stop.id];
  if (!article) { _wikiCache[stop.id] = null; saveWikiCache(); return null; }

  let result = null;
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article.replace(/\s+/g,'_'))}`);
    if (r.ok) {
      const d = await r.json();
      if (d.type !== 'disambiguation') result = { img: d.thumbnail?.source || null, extract: d.extract || null };
    }
  } catch {}

  _wikiCache[stop.id] = result;
  saveWikiCache();
  return result;
}

async function fetchNearbyPOI(stop) {
  if (_poiCache[stop.id] !== undefined) return _poiCache[stop.id];
  try {
    const gr = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${stop.lat}|${stop.lng}&gsradius=8000&gslimit=15&format=json&origin=*`);
    const gd = await gr.json();
    const places = (gd.query?.geosearch || []).filter(p => p.dist > 100);
    const summaries = await Promise.all(places.slice(0, 10).map(async p => {
      try {
        const sr = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.title)}`);
        if (!sr.ok) return null;
        const sd = await sr.json();
        if (!sd.thumbnail?.source) return null;
        return { title: p.title, img: sd.thumbnail.source, dist: p.dist,
          url: `https://en.m.wikipedia.org/wiki/${encodeURIComponent(p.title)}` };
      } catch { return null; }
    }));
    const poi = summaries.filter(Boolean);
    _poiCache[stop.id] = poi;
    return poi;
  } catch {
    _poiCache[stop.id] = [];
    return [];
  }
}

function findStop(stopId) {
  for (const day of TRIP_DATA.days)
    for (const s of day.stops) if (s.id === stopId) return s;
  for (const arr of Object.values(state.addedStops || {}))
    for (const s of arr) if (s.id === stopId) return s;
  return null;
}

function getDayStops(day) {
  const added = (state.addedStops || {})[day.id] || [];
  const all = [...day.stops, ...added];
  return all.sort((a, b) => {
    const ta = timeToMinutes(getStopTime(a)), tb = timeToMinutes(getStopTime(b));
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return ta - tb;
  });
}

function injectStopPhotos(stopId) {
  const item = document.getElementById(`stop-${stopId}`);
  if (!item) return;
  const stop = findStop(stopId);
  if (!stop) return;
  const photos = getPhotos(stop);
  // Only inject if we have real photos (not just satellite fallback placeholder)
  if (!photos.length) return;
  const oldSlider = item.querySelector('.card-slider');
  if (!oldSlider) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = buildSlider(stop, 'card');
  const newSlider = tmp.firstChild;
  oldSlider.replaceWith(newSlider);
  initSlider(newSlider, stop, 'card');
}

// Keep old name as alias for detail page calls
const injectWikiPhoto = injectStopPhotos;

function lazyLoadWikiImages(stops) {
  stops.forEach(stop => {
    const type = getStopType(stop);
    if (type === 'depart' || type === 'charging') return;
    // Kick off Places fetch; inject photos when it resolves
    if (_placesCache[stop.id]?.photos?.length) {
      injectStopPhotos(stop.id);
    } else {
      fetchPlacesPhotos(stop).then(() => injectStopPhotos(stop.id));
    }
    // Also fetch wiki in parallel (for extract text)
    if (_wikiCache[stop.id] === undefined) fetchWikiData(stop);
  });
}

/* ── Type gradient colours for placeholder slides ──────────────────── */
const TYPE_GRAD = {
  charging:     ['#0f3', '#064'],
  hotel:        ['#38bdf8','#0369a1'],
  transport:    ['#a78bfa','#4c1d95'],
  food:         ['#fb923c','#92400e'],
  architecture: ['#fbbf24','#78350f'],
  village:      ['#2dd4bf','#134e4a'],
  town:         ['#2dd4bf','#134e4a'],
  experience:   ['#fb7185','#881337'],
  wander:       ['#34d399','#064e3b'],
  depart:       ['#94a3b8','#1e293b'],
  scenic:       ['#4ade80','#14532d'],
  historic:     ['#fcd34d','#713f12'],
  festival:     ['#c084fc','#3b0764'],
};

/* ── Get slides for a stop ─────────────────────────────────────────── */
const GKEY = 'AIzaSyCiV3X0vUMJBkIpU_UgBWwyPzIAjyjJM9I';

// Satellite aerial as a fallback — much more interesting than Street View
function satelliteUrl(stop) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${stop.lat},${stop.lng}&zoom=16&size=640x380&maptype=satellite&key=${GKEY}`;
}
function streetViewUrl(stop) {
  return `https://maps.googleapis.com/maps/api/streetview?size=640x380&location=${stop.lat},${stop.lng}&fov=90&pitch=10&key=${GKEY}`;
}

/* ── Weather cache & fetch (Open-Meteo — free, no key needed) ───────── */
// dayId → { ts: fetchedAt, map: Map<dateString, Map<hour, {tempC, icon, conditionText}>> }
const _weatherCache = {};

// WMO weather code → Phosphor icon
// WMO code → {icon (day), icon (night), label}
function wmoToWeather(code, isNight) {
  if (code === 0)              return { icon: isNight ? 'ph-moon-stars' : 'ph-sun',       label: isNight ? 'Clear night' : 'Clear sky' };
  if (code <= 2)               return { icon: isNight ? 'ph-cloud-moon' : 'ph-cloud-sun', label: 'Partly cloudy' };
  if (code === 3)              return { icon: 'ph-cloud',            label: 'Overcast' };
  if (code <= 48)              return { icon: 'ph-cloud-fog',        label: 'Fog' };
  if (code <= 55)              return { icon: 'ph-cloud-drizzle',    label: 'Drizzle' };
  if (code <= 57)              return { icon: 'ph-cloud-sleet',      label: 'Freezing drizzle' };
  if (code <= 65)              return { icon: 'ph-cloud-rain',       label: code >= 63 ? 'Heavy rain' : 'Rain' };
  if (code <= 67)              return { icon: 'ph-cloud-sleet',      label: 'Freezing rain' };
  if (code <= 77)              return { icon: 'ph-snowflake',        label: 'Snow' };
  if (code <= 82)              return { icon: 'ph-cloud-rain',       label: 'Rain showers' };
  if (code <= 86)              return { icon: 'ph-snowflake',        label: 'Snow showers' };
  if (code === 95)             return { icon: 'ph-cloud-lightning',  label: 'Thunderstorm' };
  if (code <= 99)              return { icon: 'ph-cloud-lightning',  label: 'Thunderstorm with hail' };
  return { icon: 'ph-thermometer', label: 'Unknown' };
}

function isNightTime(timeStr) {
  const mins = timeToMinutes(timeStr);
  if (mins === null) return false;
  return mins >= 18 * 60 || mins < 6 * 60;
}

async function fetchWeatherForDay(day) {
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const cached = _weatherCache[day.id];
  if (cached && (Date.now() - cached.ts) < TWO_HOURS) return cached.map;

  let lat = day.lat, lng = day.lng;
  if (lat == null || lng == null) {
    for (const s of (day.stops || [])) {
      const sLat = getStopLat(s), sLng = getStopLng(s);
      if (sLat && sLng) { lat = sLat; lng = sLng; break; }
    }
  }
  if (lat == null || lng == null) { _weatherCache[day.id] = { ts: Date.now(), map: null }; return null; }

  try {
    // Hourly data gives accurate temperature for each stop's specific time
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,weathercode&timezone=auto&forecast_days=16`;
    const res = await fetch(url);
    if (!res.ok) { _weatherCache[day.id] = { ts: Date.now(), map: null }; return null; }
    const data = await res.json();

    // map: dateString → Map<hour(0-23), {tempC, icon, conditionText}>
    const map = new Map();
    (data.hourly?.time || []).forEach((t, i) => {
      const [date, hStr] = t.split('T');
      const hour  = parseInt(hStr, 10);
      const tempC = Math.round(data.hourly.temperature_2m[i]);
      const isNight = hour >= 20 || hour < 6;
      const w = wmoToWeather(data.hourly.weathercode[i], isNight);
      if (!map.has(date)) map.set(date, new Map());
      map.get(date).set(hour, { tempC, icon: w.icon, conditionText: w.label });
    });

    _weatherCache[day.id] = { ts: Date.now(), map };
    return map;
  } catch (e) {
    _weatherCache[day.id] = { ts: Date.now(), map: null };
    return null;
  }
}

// Look up hourly weather from map for a given date + time string
function lookupHourlyWeather(wMap, dateStr, timeStr) {
  if (!wMap) return null;
  const hourMap = wMap.get(dateStr);
  if (!hourMap) return null;
  const hour = parseInt((timeStr || '12:00').split(':')[0], 10);
  return hourMap.get(hour) || hourMap.get(Math.min(23, hour + 1)) || hourMap.get(Math.max(0, hour - 1)) || [...hourMap.values()][0] || null;
}

function getWeatherForStop(weatherMap, stop) {
  if (!weatherMap) return null;
  const day = TRIP_DATA.days.find(d => d.stops?.some(s => s.id === stop.id));
  // For festival/multi-day spans use today's date so weather is current
  const today = new Date().toISOString().slice(0, 10);
  const dateStr = (day?.isFestival) ? today : (day?.date || today);
  const hourMap = weatherMap.get(dateStr);
  if (!hourMap) return null;

  const timeStr = getStopTime(stop) || '12:00';
  const hour = parseInt(timeStr.split(':')[0], 10);
  // Exact hour match, or nearest available
  return hourMap.get(hour) || hourMap.get(Math.min(23, hour + 1)) || hourMap.get(Math.max(0, hour - 1)) || [...hourMap.values()][0] || null;
}

const _commonsCache = {}; // stopId → [url, ...]
async function fetchCommonsPhotos(stop) {
  if (_commonsCache[stop.id] !== undefined) return _commonsCache[stop.id];
  const name = wikiSearchName(stop);
  if (!name) { _commonsCache[stop.id] = []; return []; }
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=640&format=json&origin=*`;
    const r = await fetch(url);
    const d = await r.json();
    const pages = Object.values(d.query?.pages || {});
    const imgs = pages
      .filter(p => {
        const ii = p.imageinfo?.[0];
        if (!ii) return false;
        const mime = ii.mime || '';
        if (!mime.startsWith('image/')) return false;
        if (mime === 'image/svg+xml') return false;
        const title = (p.title || '').toLowerCase();
        // Skip maps, flags, coats of arms, icons
        if (/map|flag|coat|arms|logo|icon|seal|blank|locator/i.test(title)) return false;
        return true;
      })
      .map(p => p.imageinfo[0].thumburl)
      .filter(Boolean)
      .slice(0, 5);
    _commonsCache[stop.id] = imgs;
    return imgs;
  } catch {
    _commonsCache[stop.id] = [];
    return [];
  }
}

function getPhotos(stop) {
  const type = getStopType(stop);
  if (type === 'charging') return [satelliteUrl(stop), streetViewUrl(stop)];

  // Stop-level override (e.g. custom local image set in data.js)
  if (stop.photos?.length) return stop.photos;

  // Google Places photos — venue-specific, quality-scored
  const gp = _placesCache[stop.id]?.photos;
  if (gp?.length) return gp;

  // Fallback while Places loads: Wikipedia thumbnail + Street View
  const photos = [];
  const wiki = _wikiCache[stop.id]?.img;
  if (wiki) photos.push(wiki);
  photos.push(streetViewUrl(stop));
  return photos;
}

/* ── Nav URLs ──────────────────────────────────────────────────────── */
function teslaNavUrl(stop) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.location)}`;
}
function chargingNearbyUrl(stop) {
  return `https://www.plugshare.com/?latitude=${stop.lat}&longitude=${stop.lng}&spanLat=0.2&spanLng=0.2`;
}
function veganNearbyUrl(stop) {
  return `https://www.happycow.net/searchmap?lat=${stop.lat}&lng=${stop.lng}&zoom=13`;
}
function poiNearbyUrl(stop) {
  return `https://www.google.com/maps/search/attractions/@${stop.lat},${stop.lng},14z`;
}

/* ── Persist ───────────────────────────────────────────────────────── */
function localSave() {
  try {
    localStorage.setItem('annecy_overrides',          JSON.stringify(state.overrides));
    localStorage.setItem('annecy_checked',            JSON.stringify(state.checked));
    localStorage.setItem('annecy_loc_overrides',      JSON.stringify(state.locOverrides));
    localStorage.setItem('annecy_dur_overrides',      JSON.stringify(state.durOverrides));
    localStorage.setItem('annecy_type_overrides',     JSON.stringify(state.typeOverrides));
    localStorage.setItem('annecy_priority_overrides', JSON.stringify(state.priorityOverrides));
    localStorage.setItem('annecy_reason_overrides',   JSON.stringify(state.reasonOverrides));
    localStorage.setItem('annecy_vegan_overrides',    JSON.stringify(state.veganOverrides));
    localStorage.setItem('annecy_added_stops',        JSON.stringify(state.addedStops));
  } catch {}
}
function save() {
  localSave();
  if (typeof syncSave === 'function') syncSave();
}
function load() {
  try {
    const o  = localStorage.getItem('annecy_overrides');
    const c  = localStorage.getItem('annecy_checked');
    const lo = localStorage.getItem('annecy_loc_overrides');
    const du = localStorage.getItem('annecy_dur_overrides');
    const ty = localStorage.getItem('annecy_type_overrides');
    const pr = localStorage.getItem('annecy_priority_overrides');
    const re = localStorage.getItem('annecy_reason_overrides');
    const ve = localStorage.getItem('annecy_vegan_overrides');
    const as = localStorage.getItem('annecy_added_stops');
    if (o)  state.overrides         = JSON.parse(o);
    if (c)  state.checked           = JSON.parse(c);
    if (lo) state.locOverrides      = JSON.parse(lo);
    if (du) state.durOverrides      = JSON.parse(du);
    if (ty) state.typeOverrides     = JSON.parse(ty);
    if (pr) state.priorityOverrides = JSON.parse(pr);
    if (re) state.reasonOverrides   = JSON.parse(re);
    if (ve) state.veganOverrides    = JSON.parse(ve);
    if (as) state.addedStops        = JSON.parse(as);
  } catch {}
  try {
    if (localStorage.getItem('annecy_theme') === 'light') document.body.classList.add('light');
  } catch {}
  try {
    const cv = localStorage.getItem('annecy_cardview'); if (cv) state.cardView = cv;
  } catch {}
  try {
    if (localStorage.getItem('annecy_notifs') === '1') {
      state.notifsEnabled = true;
      // Re-register push subscription in case it lapsed
      subscribePush();
    }
  } catch {}
  try {
    if (localStorage.getItem('annecy_units') === 'imperial') state.useMetric = false;
  } catch {}
}

/* ── Day strip ─────────────────────────────────────────────────────── */
function buildDayStrip() {
  const strip = document.getElementById('day-strip');
  strip.innerHTML = '';
  TRIP_DATA.days.forEach(day => {
    const chip = document.createElement('button');
    chip.className = 'day-chip';
    chip.dataset.dayId = day.id;
    const today = new Date().toISOString().slice(0,10);
    const isTodayChip = day.isCountdown
      ? today <= day.dateEnd
      : day.isFestival
        ? (today >= day.date && today <= day.dateEnd)
        : today === day.date;
    const isPast = !day.isCountdown && !day.isFestival && day.date < today;
    if (isTodayChip) chip.classList.add('today');
    if (isPast)      chip.classList.add('past');
    const dateStr = day.isCountdown ? 'soon' : day.isFestival ? '20–27' : formatDate(day.date);
    chip.innerHTML = `<span class="day-chip-label">${getDayLabel(day)}</span><span class="day-chip-date">${dateStr}</span><span class="day-dot"></span>`;
    chip.addEventListener('click', () => selectDay(day.id));
    strip.appendChild(chip);
  });
  updateDayStrip();
  if (typeof updateHeaderHeight === 'function') updateHeaderHeight();
}
function updateDayStrip() {
  document.querySelectorAll('.day-chip').forEach(c =>
    c.classList.toggle('active', c.dataset.dayId === state.currentDayId));
  const active = document.querySelector('.day-chip.active');
  if (active) active.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
}
function selectDay(dayId) {
  state.currentDayId = dayId;
  if (!['day','map'].includes(state.currentView)) state.currentView = 'day';
  updateDayStrip();
  const isToday = dayId === findTodayDayId();
  renderView(isToday);
}

/* ── Header ────────────────────────────────────────────────────────── */
function updateHeader() {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  const label = document.getElementById('header-day-label');
  const sub   = document.getElementById('header-day-subtitle');
  if (state.currentView === 'vegan')    { label.textContent = 'Vegan Spots'; }
  else if (state.currentView === 'charging') { label.textContent = 'Charging'; }
  else if (day) { label.textContent = day.title; }
}

/* ── Render dispatcher ─────────────────────────────────────────────── */
function setBgClass(cls) {
  const app = document.getElementById('app');
  app.classList.remove('bg-day', 'bg-soon');
  if (cls) app.classList.add(cls);
}

function renderView(scrollToNow) {
  // Always reset scroll to top when switching views or days
  if (!scrollToNow) document.getElementById('main-content').scrollTop = 0;
  // Stop tickers when leaving that view
  if (state.currentView !== 'day' || TRIP_DATA.days.find(d => d.id === state.currentDayId)?.isCountdown === false) {
    clearInterval(_countdownInterval);
  }
  if (state.currentView !== 'day') clearInterval(_leaveByInterval);
  updateHeader();
  const tl = document.getElementById('timeline');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === state.currentView));
  const mapEl = document.getElementById('map-container');
  const mainEl = document.getElementById('main-content');
  if (state.currentView === 'map') {
    setBgClass(null);
    tl.classList.add('hidden');
    mapEl.classList.remove('hidden');
    mainEl.classList.add('map-active');
    renderMapView();
  } else {
    mapEl.classList.add('hidden');
    mainEl.classList.remove('map-active');
    tl.classList.remove('hidden');
    if (state.currentView === 'overview')      { setBgClass(null); renderOverview(tl); }
    else if (state.currentView === 'vegan')    { setBgClass(null); renderFilterList(tl, 'vegan'); }
    else if (state.currentView === 'charging') { setBgClass(null); renderFilterList(tl, 'charging'); }
    else if (state.cardView === 'calendar') renderCalView(tl);
    else renderTimeline(tl, scrollToNow);
  }
}

/* ── Map view ──────────────────────────────────────────────────────── */
let _leafletMap      = null;
let _mapDayId        = null;
let _userLat         = null, _userLng = null;
let _locMarker       = null, _locCircle = null;
let _geoWatchId      = null;

const TYPE_COLOR = {
  charging:'#16a34a', hotel:'#0284c7', transport:'#7c3aed', food:'#ea580c',
  architecture:'#d97706', village:'#0d9488', town:'#0d9488', experience:'#db2777',
  wander:'#059669', depart:'#475569', scenic:'#16a34a', historic:'#b45309', festival:'#7c3aed',
};

function startLocationWatch() {
  if (!navigator.geolocation || _geoWatchId !== null) return;
  _geoWatchId = navigator.geolocation.watchPosition(pos => {
    const firstFix = _userLat === null;
    _userLat = pos.coords.latitude;
    _userLng = pos.coords.longitude;
    updateLocMarker(pos.coords.accuracy);
    refreshMapCarouselOrder();
    // On first fix: re-fetch countdown POIs (which used fallback coords)
    if (firstFix && _leafletMap) {
      const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
      if (day?.isCountdown) {
        _leafletMap.setView([_userLat, _userLng], 13);
        const carousel = document.getElementById('map-poi-carousel');
        if (carousel) {
          carousel.innerHTML = '<div style="padding:4px 8px;font-size:12px;color:rgba(255,255,255,.5);white-space:nowrap">Updating for your location…</div>';
          fetchRoutePOIs(day).then(pois => {
            carousel.innerHTML = '';
            pois.forEach(poi => carousel.appendChild(buildMapPOICard(poi)));
          });
        }
      }
    }
  }, null, { enableHighAccuracy: true, maximumAge: 20000, timeout: 15000 });
}

function updateLocMarker(accuracy) {
  if (!_leafletMap) return;
  const ll = [_userLat, _userLng];
  if (!_locMarker) {
    _locMarker = L.marker(ll, {
      icon: L.divIcon({ className:'', html:'<div class="user-loc-dot"></div>', iconSize:[16,16], iconAnchor:[8,8] }),
      zIndexOffset: 2000
    }).addTo(_leafletMap);
    _locCircle = L.circle(ll, { radius: accuracy, color:'#38bdf8', fillColor:'#38bdf8', fillOpacity:.1, weight:1 }).addTo(_leafletMap);
  } else {
    _locMarker.setLatLng(ll);
    _locCircle.setLatLng(ll);
    _locCircle.setRadius(accuracy);
  }
}

function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function fetchRoutePOIs(day) {
  // Countdown: search near user's GPS only (no fallback — no point showing random UK articles)
  if (day.isCountdown) {
    if (_userLat === null) return [];
    try {
      const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${_userLat}|${_userLng}&gsradius=20000&gslimit=20&format=json&origin=*`);
      const d = await r.json();
      return resolvePOISummaries(d.query?.geosearch || [], []);
    } catch { return []; }
  }

  // Travel days: search near interesting stops only.
  // Depart/transport/charging stops are motorway legs — nothing tourist-worthy nearby.
  const stops = day.stops.filter(s => s.lat && s.lng);
  const searchStops = stops.filter(s => !['depart','transport','charging'].includes(getStopType(s))).slice(0, 6);
  if (!searchStops.length) return [];

  const seen = new Set();
  const candidates = [];
  for (const s of searchStops) {
    try {
      const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${getStopLat(s)}|${getStopLng(s)}&gsradius=8000&gslimit=8&format=json&origin=*`);
      if (!r.ok) continue;
      const d = await r.json();
      for (const p of (d.query?.geosearch || [])) {
        if (!seen.has(p.title)) { seen.add(p.title); candidates.push(p); }
      }
    } catch {}
  }
  return resolvePOISummaries(candidates, stops);
}

async function resolvePOISummaries(candidates, itineraryStops) {
  if (!candidates.length) return [];
  const results = await Promise.all(candidates.slice(0, 20).map(async p => {
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.title)}`);
      if (!r.ok) return null;
      const d = await r.json();
      if (!d.title) return null;
      const match = itineraryStops.find(s => {
        const wt = WIKI_TITLES[s.id];
        return (wt && wt.replace(/_/g,' ').toLowerCase() === p.title.toLowerCase()) ||
               wikiSearchName(s)?.toLowerCase() === p.title.toLowerCase();
      });
      return {
        title: p.title, img: d.thumbnail?.source || null,
        lat: p.lat, lng: p.lon, dist: p.dist,
        url: `https://en.m.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
        itineraryStop: match || null,
      };
    } catch { return null; }
  }));
  return results.filter(Boolean);
}

function refreshMapCarouselOrder() {
  const wrap = document.getElementById('map-poi-carousel');
  if (!wrap || _userLat === null) return;
  const cards = [...wrap.children];
  cards.sort((a, b) => {
    const da = parseFloat(a.dataset.dist || 999999);
    const db = parseFloat(b.dataset.dist || 999999);
    return da - db;
  });
  cards.forEach(c => wrap.appendChild(c));
}

function buildMapPOICard(poi) {
  const isItinerary = !!poi.itineraryStop;
  const stop        = poi.itineraryStop;
  const stars       = stop ? priorityStars(getStopPriority(stop)) : '';
  // Live distance from user
  const distM = (_userLat !== null)
    ? haversineM(_userLat, _userLng, poi.lat, poi.lng)
    : null;
  const distStr = distM !== null
    ? distM < 1000 ? `${Math.round(distM)}m` : `${(distM/1000).toFixed(1)}km`
    : '';

  const card = document.createElement(isItinerary ? 'button' : 'a');
  card.className = `map-poi-card${isItinerary ? ' itinerary' : ''}`;
  if (!isItinerary) { card.href = poi.url; card.target = '_blank'; card.rel = 'noopener'; }
  card.dataset.dist = distM ?? poi.dist ?? 999999;
  card.innerHTML = `
    ${poi.img ? `<img class="map-poi-card-img" src="${poi.img}" loading="lazy" alt="${poi.title}">` : `<div class="map-poi-card-img map-poi-no-img"><i class="ph ph-map-pin"></i></div>`}
    <div class="map-poi-card-body">
      <div class="map-poi-card-name">${isItinerary ? stopTypeIcon(stop) + ' ' : ''}${poi.title}</div>
      ${stars ? `<div class="map-poi-card-stars">${stars}</div>` : ''}
      <div class="map-poi-card-meta">${distStr}</div>
    </div>`;
  if (isItinerary) card.addEventListener('click', () => openDetail(stop));
  return card;
}

async function fetchDayRoute(stops) {
  const pts = stops.filter(s => s.lat && s.lng);
  if (pts.length < 2) return null;
  const coords = pts.map(s => `${s.lng},${s.lat}`).join(';');
  try {
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
    const d = await r.json();
    return (d.routes?.[0]?.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);
  } catch { return null; }
}

function renderMapView() {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!day) return;

  const container = document.getElementById('map-container');

  // Destroy old map if day changed
  if (_leafletMap && _mapDayId !== state.currentDayId) {
    _leafletMap.remove();
    _leafletMap = null;
    _locMarker = null; _locCircle = null;
    container.innerHTML = '';
  }

  if (_leafletMap) {
    _leafletMap.invalidateSize();
    return;
  }

  _mapDayId = state.currentDayId;
  startLocationWatch();

  const isDark = !document.body.classList.contains('light');
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const stops = day.stops.filter(s => s.lat && s.lng);

  // Countdown day: no route stops, just show user location
  if (!stops.length) {
    const fallback = L.map(container, { zoomControl: false, attributionControl: false });
    _leafletMap = fallback;
    L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(fallback);
    L.control.zoom({ position: 'topright' }).addTo(fallback);
    fallback.setView([51.0333, -2.5333], 10); // North Cadbury as default
    if (_userLat !== null) {
      fallback.setView([_userLat, _userLng], 13);
      updateLocMarker(500);
    }
    buildAndAppendPOIWrap(container, day);
    return;
  }

  const map = L.map(container, { zoomControl: false, attributionControl: false });
  _leafletMap = map;

  L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Fit bounds — leave room for the POI carousel at bottom
  const bounds = L.latLngBounds(stops.map(s => [getStopLat(s), getStopLng(s)]));
  map.fitBounds(bounds, { paddingTopLeft: [32, 48], paddingBottomRight: [32, 160] });

  // If we already have a user location, add the marker immediately
  if (_userLat !== null) updateLocMarker(200);

  // Determine next unvisited stop
  const now = nowMinutes();
  let nextStopId = null;
  for (const s of stops) {
    const t = timeToMinutes(getStopTime(s));
    if (t !== null && t >= now && !state.checked[s.id]) { nextStopId = s.id; break; }
  }

  // Draw stop markers
  stops.forEach((stop, idx) => {
    const visited = !!state.checked[stop.id];
    const isNext  = stop.id === nextStopId;
    const icon = L.divIcon({
      className: '',
      html: `<div class="map-marker type-${getStopType(stop)}${visited?' visited':''}${isNext?' next-stop':''}">
               <span>${stopTypeIcon(stop)}</span>
               <span class="map-marker-seq">${idx + 1}</span>
             </div>`,
      iconSize: [36,36], iconAnchor: [18,18], popupAnchor: [0,-20],
    });
    const m = L.marker([getStopLat(stop), getStopLng(stop)], { icon }).addTo(map);
    m.on('click', () => openDetail(stop));
  });

  // Road route
  fetchDayRoute(stops).then(latlngs => {
    if (!latlngs || _mapDayId !== state.currentDayId) return;
    L.polyline(latlngs, {
      color: !document.body.classList.contains('light') ? '#38bdf8' : '#0284c7',
      weight: 4, opacity: 0.7,
    }).addTo(map);
  });

  buildAndAppendPOIWrap(container, day);
}

function buildAndAppendPOIWrap(container, day) {
  const wrap = document.createElement('div');
  wrap.id = 'map-poi-wrap';
  const carousel = document.createElement('div');
  carousel.id = 'map-poi-carousel';
  carousel.innerHTML = '<div style="padding:4px 8px;font-size:12px;color:rgba(255,255,255,.5);white-space:nowrap">Loading nearby places…</div>';
  // Prevent Leaflet from capturing touch events on the carousel
  carousel.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  carousel.addEventListener('touchmove',  e => e.stopPropagation(), { passive: true });
  wrap.appendChild(carousel);
  container.appendChild(wrap);

  fetchRoutePOIs(day).then(pois => {
    if (_mapDayId !== state.currentDayId) return;
    carousel.innerHTML = '';
    if (!pois.length) { wrap.remove(); return; }
    // Itinerary-matched POIs first, then others
    const sorted = [...pois].sort((a, b) => (b.itineraryStop ? 1 : 0) - (a.itineraryStop ? 1 : 0));
    sorted.forEach(poi => carousel.appendChild(buildMapPOICard(poi)));
  });
}

/* ── Overview ──────────────────────────────────────────────────────── */
function renderOverview(c) {
  c.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'overview-grid';
  TRIP_DATA.days.forEach(day => {
    const card = document.createElement('div');
    card.className = 'overview-card';
    const dateStr = day.isCountdown ? 'Until 16 Jun' : day.isFestival ? '20–27 Jun' : formatDate(day.date);
    card.innerHTML = `<div class="ov-day">${getDayLabel(day)} · ${dateStr}</div><div class="ov-title">${day.title}</div><div class="ov-sub">${day.subtitle||''}</div><div class="ov-stops">${day.isCountdown ? '' : day.stops.length + ' stops'}</div>`;
    card.addEventListener('click', () => selectDay(day.id));
    grid.appendChild(card);
  });
  c.appendChild(grid);
}

/* ── Filter list ───────────────────────────────────────────────────── */
function renderFilterList(container, kind) {
  container.innerHTML = '';
  TRIP_DATA.days.forEach(day => {
    day.stops.forEach(stop => {
      if (kind === 'vegan' ? !stop.veganFriendly : stop.type !== 'charging') return;
      const card = document.createElement('div');
      card.className = 'filter-card';
      card.innerHTML = `
        <span class="filter-icon">${stopTypeIcon(stop)}</span>
        <div class="filter-info">
          <div class="filter-day">${getDayLabel(day)} · ${day.isFestival ? '20–27 Jun' : formatDate(day.date)}</div>
          <div class="filter-loc">${stop.location}</div>
          <div class="filter-reason">${stop.reason}</div>
        </div>
        <div><a class="act-btn tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i></a></div>`;
      container.appendChild(card);
    });
  });
}

/* ── Countdown banner ──────────────────────────────────────────────── */
let _countdownInterval = null;

/* Returns { state:'travelling'|'at_stop'|'done', stop, nextStop, targetMs, day }
   based on today's trip day stops and current time. */
function getTripState() {
  const todayStr = new Date().toISOString().slice(0, 10);
  // Find the trip day for today (non-countdown, non-festival, matching date; or festival matching range)
  const today = TRIP_DATA.days.find(d => {
    if (d.isCountdown) return false;
    if (d.isFestival) return todayStr >= d.date && todayStr <= d.dateEnd;
    return d.date === todayStr;
  });
  if (!today) return null;
  const stops = getDayStops(today);
  if (!stops.length) return null;

  const nowMs = Date.now();
  const dayDate = today.date;

  // Build stop schedule: { stop, arrivalMs, leaveMs }
  const schedule = stops.map(s => {
    const timeStr = getStopTime(s);
    const arrivalMs = timeStr ? new Date(dayDate + 'T' + timeStr + ':00+01:00').getTime() : null;
    const dur = getStopDuration(s);
    const leaveMs = arrivalMs !== null ? arrivalMs + dur * 60000 : null;
    return { stop: s, arrivalMs, leaveMs };
  }).filter(s => s.arrivalMs !== null);

  if (!schedule.length) return null;

  // Are we at a stop? (arrived but not yet left)
  for (let i = 0; i < schedule.length; i++) {
    const { stop, arrivalMs, leaveMs } = schedule[i];
    if (nowMs >= arrivalMs && nowMs < leaveMs) {
      return { state: 'at_stop', stop, nextStop: schedule[i + 1]?.stop || null, targetMs: leaveMs, day: today };
    }
  }

  // Are we travelling to a stop? (past leave time of previous, before arrival of next)
  for (let i = 0; i < schedule.length; i++) {
    const { stop, arrivalMs } = schedule[i];
    if (nowMs < arrivalMs) {
      return { state: 'travelling', stop, nextStop: null, targetMs: arrivalMs, day: today };
    }
  }

  // Past all stops
  return { state: 'done', stop: schedule[schedule.length - 1].stop, nextStop: null, targetMs: null, day: today };
}

function renderCountdownBanner(container) {
  // Departure: Wed 17 Jun 2026 10:30 UK time
  const DEPARTURE = new Date('2026-06-17T10:30:00+01:00');

  function formatCountdown() {
    const diff = DEPARTURE - Date.now();
    if (diff <= 0) return { days:0, hours:0, mins:0, secs:0, departed:true };
    const secs  = Math.floor(diff / 1000);
    const mins  = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    return { days, hours: hours % 24, mins: mins % 60, secs: secs % 60, departed: false };
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  const banner = document.createElement('div');
  banner.className = 'countdown-banner';
  container.appendChild(banner);

  function tick() {
    const { days, hours, mins, secs, departed } = formatCountdown();
    if (departed) {
      renderTripProgressBanner(container, banner);
      clearInterval(_countdownInterval);
      return;
    }
    banner.innerHTML = `
      <div class="cd-emoji"><i class="ph ph-mountains"></i></div>
      <h2 class="cd-title">Holiday Countdown</h2>
      <p class="cd-sub">Annecy · 17 Jun 2026 · North Cadbury 10:30</p>
      <div class="cd-units">
        <div class="cd-unit"><span class="cd-num">${days}</span><span class="cd-label">days</span></div>
        <div class="cd-sep">:</div>
        <div class="cd-unit"><span class="cd-num">${pad(hours)}</span><span class="cd-label">hrs</span></div>
        <div class="cd-sep">:</div>
        <div class="cd-unit"><span class="cd-num">${pad(mins)}</span><span class="cd-label">min</span></div>
        <div class="cd-sep">:</div>
        <div class="cd-unit"><span class="cd-num">${pad(secs)}</span><span class="cd-label">sec</span></div>
      </div>`;
  }

  clearInterval(_countdownInterval);
  tick();
  _countdownInterval = setInterval(tick, 1000);
}

/* ── Trip progress banner (shown after departure countdown hits zero) ── */
function renderTripProgressBanner(container, existingBanner) {
  if (existingBanner) existingBanner.remove();
  container.innerHTML = '';

  const banner = document.createElement('div');
  banner.className = 'countdown-banner';
  container.appendChild(banner);

  function pad2(n) { return String(n).padStart(2, '0'); }

  function fmtHMS(ms) {
    if (ms <= 0) return '00:00:00';
    const s = Math.floor(ms / 1000);
    return `${pad2(Math.floor(s/3600))}:${pad2(Math.floor(s/3600*60)%60 || Math.floor((s%3600)/60))}:${pad2(s%60)}`;
  }

  function fmtHMSfromMs(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  let _stopCard = null;
  let _lastStopId = null;
  let _weatherStr = '<i class="ph ph-spinner ph-spin" style="opacity:.4"></i>';

  function getDistStr(stop) {
    if (!stop.lat || !stop.lng) return null;
    if (!navigator.geolocation) return null;
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(pos => {
        const R = 6371;
        const dLat = (stop.lat - pos.coords.latitude) * Math.PI / 180;
        const dLon = (stop.lng - pos.coords.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(pos.coords.latitude*Math.PI/180)*Math.cos(stop.lat*Math.PI/180)*Math.sin(dLon/2)**2;
        const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        resolve(fmtDist(km));
      }, () => resolve(null), { timeout: 5000 });
    });
  }

  async function loadWeather(stop, day) {
    if (!day) return;
    try {
      const wMap = await fetchWeatherForDay(day);
      if (!wMap) return;
      const w = lookupHourlyWeather(wMap, day.date, getStopTime(stop) || '12:00');
      if (!w) return;
      _weatherStr = `<i class="ph ${w.icon}"></i> ${w.tempC}°C`;
      const dist = await getDistStr(stop);
      if (dist) _weatherStr += ` · ${dist}`;
    } catch(e) {}
  }

  function renderStopCard(stop, day) {
    if (_lastStopId === stop.id && _stopCard) return;
    _lastStopId = stop.id;
    if (_stopCard) _stopCard.remove();
    _stopCard = buildTimelineItem(stop, false, day, null);
    _stopCard.style.marginTop = '12px';
    container.appendChild(_stopCard);
    loadWeather(stop, day);
  }

  function tick() {
    const ts = getTripState();
    if (!ts) {
      banner.innerHTML = `<div class="cd-emoji"><i class="ph ph-confetti"></i></div><h2 class="cd-title">Enjoy the festival!</h2>`;
      clearInterval(_countdownInterval);
      return;
    }

    const remaining = ts.targetMs ? ts.targetMs - Date.now() : 0;
    const timeStr = ts.targetMs ? fmtHMSfromMs(Math.max(0, remaining)) : '—';

    if (ts.state === 'travelling') {
      const name = getStopName(ts.stop);
      banner.innerHTML = `
        <div class="cd-emoji"><i class="ph ph-car"></i></div>
        <h2 class="cd-title">${name}</h2>
        <p class="cd-sub">Time to next stop</p>
        <div class="cd-units">
          <div class="cd-unit"><span class="cd-num">${timeStr.split(':')[0]}</span><span class="cd-label">hrs</span></div>
          <div class="cd-sep">:</div>
          <div class="cd-unit"><span class="cd-num">${timeStr.split(':')[1]}</span><span class="cd-label">min</span></div>
          <div class="cd-sep">:</div>
          <div class="cd-unit"><span class="cd-num">${timeStr.split(':')[2]}</span><span class="cd-label">sec</span></div>
        </div>
        <p class="cd-sub" style="margin-top:12px;margin-bottom:0">${_weatherStr}</p>`;
      renderStopCard(ts.stop, ts.day);

    } else if (ts.state === 'at_stop') {
      const name = getStopName(ts.stop);
      banner.innerHTML = `
        <div class="cd-emoji"><i class="ph ph-smiley"></i></div>
        <p class="cd-sub" style="margin-bottom:4px">Enjoy</p>
        <h2 class="cd-title">${name}</h2>
        <p class="cd-sub">Back on the road in</p>
        <div class="cd-units">
          <div class="cd-unit"><span class="cd-num">${timeStr.split(':')[0]}</span><span class="cd-label">hrs</span></div>
          <div class="cd-sep">:</div>
          <div class="cd-unit"><span class="cd-num">${timeStr.split(':')[1]}</span><span class="cd-label">min</span></div>
          <div class="cd-sep">:</div>
          <div class="cd-unit"><span class="cd-num">${timeStr.split(':')[2]}</span><span class="cd-label">sec</span></div>
        </div>
        <p class="cd-sub" style="margin-top:12px;margin-bottom:0">${_weatherStr}</p>`;
      renderStopCard(ts.stop, ts.day);

    } else {
      banner.innerHTML = `<div class="cd-emoji"><i class="ph ph-confetti"></i></div><h2 class="cd-title">You've arrived!</h2><p class="cd-sub">Enjoy Annecy 2026</p>`;
      clearInterval(_countdownInterval);
    }
  }

  clearInterval(_countdownInterval);
  tick();
  _countdownInterval = setInterval(tick, 1000);
}

/* ── Date+weather header for regular calendar days ─────────────────── */
function buildCalDayHeader(day, containerId) {
  const dateStr = day.date;
  const dateLabel = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
  const header = document.createElement('div');
  header.className = 'cal-day-header';
  const weatherId = containerId + '-weather';
  header.innerHTML = `
    <div class="cal-day-header-date">${dateLabel}</div>
    <div class="cal-day-header-weather" id="${weatherId}"><i class="ph ph-spinner ph-spin" style="opacity:.4"></i></div>`;
  fetchWeatherForDay(day).then(wMap => {
    const el = document.getElementById(weatherId);
    if (!el || !wMap) { if (el) el.innerHTML = ''; return; }
    // Use midday (12:00) as representative temperature for the day header
    const w = lookupHourlyWeather(wMap, dateStr, '12:00');
    if (!w) { el.innerHTML = ''; return; }
    el.innerHTML = `<i class="ph ${w.icon}"></i> <strong>${w.tempC}°C</strong> <span>${w.conditionText}</span>`;
  });
  return header;
}

/* ── Festival banner — title + today's date + weather ──────────────── */
function buildFestivalBanner(day) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dateStr  = (todayStr >= day.date && todayStr <= day.dateEnd) ? todayStr : day.date;
  const dateLabel = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });

  const banner = document.createElement('div');
  banner.className = 'festival-banner';
  banner.innerHTML = `
    <div class="cd-emoji"><i class="ph ph-film-slate"></i></div>
    <h2>International Animation<br>Film Festival 2026</h2>
    <p>Annecy, France</p>
    <div class="festival-banner-row">
      <div class="festival-banner-date"><i class="ph ph-calendar-blank"></i> ${dateLabel}</div>
      <div class="festival-banner-weather" id="fest-banner-weather"><i class="ph ph-spinner ph-spin" style="opacity:.5"></i></div>
    </div>`;

  fetchWeatherForDay(day).then(wMap => {
    const el = document.getElementById('fest-banner-weather');
    if (!el || !wMap) { if (el) el.innerHTML = ''; return; }
    const w = lookupHourlyWeather(wMap, dateStr, '14:00'); // afternoon representative
    if (!w) { el.innerHTML = ''; return; }
    el.innerHTML = `<i class="ph ${w.icon}"></i> ${w.tempC}°C &middot; ${w.conditionText}`;
  });

  return banner;
}

/* ── Festival calendar view ────────────────────────────────────────── */
function renderFestivalCalView(container, day) {
  container.appendChild(buildFestivalBanner(day));

  // Venue list
  const list = document.createElement('div');
  list.className = 'fest-cal-list';

  const TYPE_COL = {
    charging:'#16a34a', hotel:'#0284c7', transport:'#7c3aed', food:'#ea580c',
    architecture:'#d97706', village:'#0d9488', town:'#0d9488', experience:'#db2777',
    wander:'#059669', depart:'#475569', scenic:'#16a34a', historic:'#b45309', festival:'#7c3aed', work:'#6366f1',
  };

  getDayStops(day).forEach(stop => {
    const type = getStopType(stop);
    const col  = TYPE_COL[type] || '#334155';
    const item = document.createElement('div');
    item.className = 'fest-cal-item';
    item.style.borderLeftColor = col;
    if (state.checked[stop.id]) item.classList.add('visited');
    item.innerHTML = `
      <div class="fest-cal-item-name">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
      <div class="fest-cal-item-meta">${typeLabel(type)}${stop.veganFriendly ? ' · <i class="ph ph-leaf"></i> Vegan' : ''}</div>`;
    item.addEventListener('click', () => openDetail(stop));
    list.appendChild(item);
  });

  container.appendChild(list);
}

/* ── Calendar view ─────────────────────────────────────────────────── */
const CAL_PX_MIN = 1.5; // px per minute (90px/hour)

function renderCalView(container) {
  container.innerHTML = '';
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!day || day.isCountdown) { renderTimeline(container, false); return; }
  setBgClass('bg-day');

  if (day.isFestival) { renderFestivalCalView(container, day); return; }

  const timedStops = getDayStops(day).filter(s => timeToMinutes(getStopTime(s)) !== null);
  if (!timedStops.length) return;

  const _calToday = new Date().toISOString().slice(0, 10);
  const isToday = day.date === _calToday || (day.isFestival && _calToday >= day.date && _calToday <= (day.dateEnd || day.date));
  const isPastDay = day.date && day.date < _calToday;

  const times    = timedStops.map(s => timeToMinutes(getStopTime(s)));
  const dayStart = Math.floor((Math.min(...times) - 10) / 5) * 5;
  const lastT    = Math.max(...times);
  const lastStop = timedStops.find(s => timeToMinutes(getStopTime(s)) === lastT);
  const dayEnd   = lastT + getStopDuration(lastStop) + 15;
  const totalH   = Math.ceil((dayEnd - dayStart) * CAL_PX_MIN);

  const outer = document.createElement('div');
  outer.className = 'cal-outer';

  const wrap = document.createElement('div');
  wrap.className = 'cal-wrap';
  wrap.style.height = totalH + 'px';

  // Hour labels + grid lines
  const hourStart = Math.ceil(dayStart / 60) * 60;
  for (let m = hourStart; m <= dayEnd; m += 60) {
    const top = (m - dayStart) * CAL_PX_MIN;
    const lbl = document.createElement('div');
    lbl.className = 'cal-hour-lbl';
    lbl.style.top = top + 'px';
    lbl.textContent = minutesToTime(m);
    wrap.appendChild(lbl);
    const line = document.createElement('div');
    line.className = 'cal-hour-line';
    line.style.top = top + 'px';
    wrap.appendChild(line);
  }

  // 5-min minor ticks
  for (let m = Math.ceil(dayStart / 5) * 5; m <= dayEnd; m += 5) {
    if (m % 60 === 0) continue;
    const tick = document.createElement('div');
    tick.className = (m % 15 === 0) ? 'cal-tick cal-tick-15' : 'cal-tick';
    tick.style.top = (m - dayStart) * CAL_PX_MIN + 'px';
    wrap.appendChild(tick);
  }

  // Stop cards + travel gaps
  const TYPE_COL = {
    charging:'#16a34a', hotel:'#0284c7', transport:'#7c3aed', food:'#ea580c',
    architecture:'#d97706', village:'#0d9488', town:'#0d9488', experience:'#db2777',
    wander:'#059669', depart:'#475569', scenic:'#16a34a', historic:'#b45309', festival:'#7c3aed',
  };

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  timedStops.forEach((stop, idx) => {
    const t    = timeToMinutes(getStopTime(stop));
    const dur  = getStopDuration(stop);
    const top  = (t - dayStart) * CAL_PX_MIN;
    const h    = Math.max(dur * CAL_PX_MIN, 40);
    const col  = TYPE_COL[getStopType(stop)] || '#334155';
    const card = document.createElement('div');
    card.className = 'cal-card';
    card.id = `cal-${stop.id}`;
    card.style.cssText = `top:${top}px;height:${h}px;border-left-color:${col};`;
    const isVisited = !!state.checked[stop.id];
    if (isVisited) card.classList.add('visited');
    if (!isVisited) {
      const depMins = t !== null ? t + dur : null;
      if (isToday && depMins !== null && depMins < nowMinutes())
        card.classList.add('cal-card--past');
    }
    const dur_h = Math.floor(dur/60), dur_m = dur%60;
    const durStr = dur >= 60 ? `${dur_h}h${dur_m ? dur_m+'m':''}` : `${dur}m`;
    card.innerHTML = `
      <div class="cal-card-name">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
      <div class="cal-card-meta">${getStopTime(stop)}${stop.tz?' '+stop.tz:''} · ${durStr} <span class="cal-weather-pill" data-stop-id="${stop.id}"></span></div>`;
    card.addEventListener('click', () => openDetail(stop));
    wrap.appendChild(card);

    // Lazily populate cal weather pill
    const calWPill = card.querySelector('.cal-weather-pill');
    if (calWPill) {
      fetchWeatherForDay(day).then(wMap => {
        if (!wMap || !calWPill.isConnected) return;
        const today = new Date().toISOString().slice(0, 10);
        const dateStr = day.isFestival ? today : (day.date || '');
        const w = lookupHourlyWeather(wMap, dateStr, getStopTime(stop));
        if (!w) return;
        calWPill.innerHTML = `<i class="ph ${w.icon}"></i> ${w.tempC}°`;
      });
    }

    // Travel gap to next stop
    const next = timedStops[idx + 1];
    if (next) {
      const depMins  = t + dur;
      const arrMins  = timeToMinutes(getStopTime(next));
      const gapMins  = arrMins - depMins;
      if (gapMins > 0) {
        const gapTop = (depMins - dayStart) * CAL_PX_MIN;
        const gapH   = gapMins * CAL_PX_MIN;
        const gap    = document.createElement('div');
        gap.className = 'cal-travel-gap';
        gap.id = `cal-gap-${stop.id}`;
        gap.style.cssText = `top:${gapTop}px;height:${gapH}px;`;
        const gapH_h = Math.floor(gapMins/60), gapH_m = gapMins%60;
        const gapStr = gapMins >= 60 ? `${gapH_h}h${gapH_m?gapH_m+'m':''}` : `${gapMins}m`;
        const toLat = getStopLat(next), toLng = getStopLng(next);
        gap.innerHTML = `<span class="cal-travel-label" id="cal-travel-${stop.id}" role="button" tabindex="0"><i class="ph ph-car"></i> ${gapStr}</span>`;
        wrap.appendChild(gap);

        // Tap → open directions to next stop
        const lbl = gap.querySelector(`#cal-travel-${stop.id}`);
        if (toLat && toLng) {
          lbl.classList.add('tappable');
          lbl.addEventListener('click', e => { e.stopPropagation(); openDirections(toLat, toLng); });
        }

        // Async: fetch road distance and update label
        const fromLat = getStopLat(stop), fromLng = getStopLng(stop);
        if (fromLat && fromLng && toLat && toLng) {
          const straightKm = haversineKm(fromLat, fromLng, toLat, toLng);
          if (straightKm > 0.5) {
            lbl.innerHTML = `<i class="ph ph-car"></i> ${gapStr} · ~${fmtDist(straightKm)}`;
          }
          fetch(`https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`)
            .then(r => r.json())
            .then(d => {
              const route = d.routes?.[0];
              if (!route) return;
              const roadKm = route.distance / 1000;
              const roadMins = Math.ceil(route.duration / 60);
              const rH = Math.floor(roadMins/60), rM = roadMins%60;
              const rStr = roadMins >= 60 ? `${rH}h${rM?rM+'m':''}` : `${roadMins}m`;
              const el = document.getElementById(`cal-travel-${stop.id}`);
              if (el) el.innerHTML = `<i class="ph ph-car"></i> ${rStr} · ${fmtDist(roadKm)} <i class="ph ph-arrow-square-out" style="font-size:11px;opacity:0.6"></i>`;
            })
            .catch(() => {});
        }
      }
    }
  });

  // Now line
  if (isToday) {
    const now = nowMinutes();
    const nl = document.createElement('div');
    nl.className = 'cal-now-line';
    nl.id = 'cal-now-marker';
    // Clamp to visible range so the line always shows on today
    const clampedNow = Math.max(dayStart, Math.min(dayEnd, now));
    nl.style.top = (clampedNow - dayStart) * CAL_PX_MIN + 'px';
    nl.innerHTML = `<div class="cal-now-pill" id="cal-now-time">${minutesToTime(now)}</div><div class="cal-now-bar"></div>`;
    wrap.appendChild(nl);
  }

  outer.appendChild(wrap);
  container.appendChild(buildCalDayHeader(day, 'cal'));
  container.appendChild(outer);

  if (isToday) {
    requestAnimationFrame(() => {
      const mc = document.getElementById('main-content');
      const now = nowMinutes();
      const scrollY = Math.max(0, (now - dayStart - 30) * CAL_PX_MIN - 100);
      mc.scrollTo({ top: scrollY, behavior: 'smooth' });
    });
  }

  startLeaveByTicker();
}

/* ── Timeline ──────────────────────────────────────────────────────── */
function renderTimeline(container, scrollToNow) {
  container.innerHTML = '';
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!day) return;

  if (day.isCountdown) {
    setBgClass('bg-soon');
    renderCountdownBanner(container);
    return;
  }
  setBgClass('bg-day');

  if (day.isFestival) {
    container.appendChild(buildFestivalBanner(day));
  }

  const today = new Date().toISOString().slice(0,10);
  const isToday = day.date === today || (day.isFestival && today >= day.date && today <= day.dateEnd);
  const now = nowMinutes();
  let nowLineEl = null;
  let nowInserted = false;

  // In compact mode wrap everything in a single glass card
  const compactCard = state.cardView === 'compact' ? (() => {
    const c = document.createElement('div');
    c.className = 'compact-card';
    container.appendChild(c);
    return c;
  })() : null;

  const _tlStops = getDayStops(day);
  _tlStops.forEach((stop, idx) => {
    const stopMins = timeToMinutes(getStopTime(stop));
    if (isToday && !nowInserted && stopMins !== null && stopMins > now) {
      nowInserted = true;
      const nowLine = document.createElement('div');
      nowLine.className = 'tl-item tl-now-line';
      nowLine.id = 'tl-now-marker';
      const _nowTimeCol = state.cardView === 'compact'
        ? `<div class="compact-time"><button class="tl-time-btn tl-now-pill" id="tl-now-time" disabled>${minutesToTime(now)}</button></div>`
        : `<div class="tl-left"><button class="tl-time-btn tl-now-pill" id="tl-now-time" disabled>${minutesToTime(now)}</button></div>`;
      nowLine.innerHTML = _nowTimeCol +
        `<div class="tl-now-track"><div class="tl-now-dot"></div><div class="tl-now-bar"></div></div>`;
      (compactCard || container).appendChild(nowLine);
      nowLineEl = nowLine;
    }
    const nextStop = _tlStops[idx + 1] || null;
    const item = state.cardView === 'compact'
      ? buildCompactItem(stop, idx === _tlStops.length - 1, day)
      : buildTimelineItem(stop, idx === _tlStops.length - 1, day, nextStop);
    (compactCard || container).appendChild(item);
  });

  // If now is after all stops, append now-line at the end
  if (isToday && !nowInserted) {
    const nowLine = document.createElement('div');
    nowLine.className = 'tl-now-line';
    nowLine.id = 'tl-now-marker';
    const _nowTimeColEnd = state.cardView === 'compact'
      ? `<div class="compact-time"><button class="tl-time-btn tl-now-pill" id="tl-now-time" disabled>${minutesToTime(now)}</button></div>`
      : `<div class="tl-left"><button class="tl-time-btn tl-now-pill" id="tl-now-time" disabled>${minutesToTime(now)}</button></div>`;
    nowLine.innerHTML = _nowTimeColEnd +
      `<div class="tl-now-track"><div class="tl-now-dot"></div><div class="tl-now-bar"></div></div>`;
    (compactCard || container).appendChild(nowLine);
    nowLineEl = nowLine;
  }

  // Fetch Wikipedia extracts for detail page descriptions
  lazyLoadWikiImages(day.stops);

  setTimeout(() => {
    TRIP_DATA.days.forEach(d => {
      if (d.id === state.currentDayId || !d.stops?.length) return;
      d.stops.forEach(stop => {
        if (_wikiCache[stop.id]    === undefined) fetchWikiData(stop);
        if (_commonsCache[stop.id] === undefined) fetchCommonsPhotos(stop);
      });
    });
  }, 1500);

  // Scroll to now on today's view — wait for layout then measure
  // Use a render token so a subsequent renderView() cancels any pending scroll
  const _myRender = ++_renderCount;
  if (scrollToNow && isToday) {
    setTimeout(() => {
      if (_renderCount !== _myRender) return; // superseded by a later render
      const mc = document.getElementById('main-content');
      const headerH = document.getElementById('app-header').offsetHeight;
      const target = document.getElementById('tl-now-marker');
      if (target) {
        mc.scrollTo({ top: Math.max(0, target.offsetTop - headerH - 60), behavior: 'smooth' });
      }
    }, 120);
  }

  startLeaveByTicker();
}

/* ── Compact concertina item ───────────────────────────────────────── */
function buildCompactItem(stop, isLast, day) {
  const item = document.createElement('div');
  item.className = 'tl-compact-item';
  item.id = `stop-${stop.id}`;
  item.dataset.type = getStopType(stop);

  const time      = getStopTime(stop);
  const isVisited = !!state.checked[stop.id];
  const info      = leaveByInfo(stop);
  const _cTodayStr = new Date().toISOString().slice(0, 10);
  const _cDay = day || TRIP_DATA.days.find(d => d.stops.some(s => s.id === stop.id));
  const _cIsToday = _cDay && (_cDay.date === _cTodayStr ||
    (_cDay.isFestival && _cTodayStr >= _cDay.date && _cTodayStr <= (_cDay.dateEnd || _cDay.date)));
  const _cIsPastDay = _cDay?.date && _cDay.date < _cTodayStr;
  const _cStopMins = timeToMinutes(time);
  const _cDepMins = _cStopMins !== null ? _cStopMins + getStopDuration(stop) : null;
  const cIsPast = !isVisited && _cIsToday && _cDepMins !== null && _cDepMins < nowMinutes();

  let metaHtml = '';
  if (info) {
    const icon = info.urgent ? 'ph-bell-ringing' : 'ph-clock';
    metaHtml = `<span class="compact-leaveby${info.urgent ? ' urgent' : ''}" data-leaveby="${stop.id}"><i class="ph ${icon}"></i> ${info.label}</span>`;
  }

  item.innerHTML = `
    <div class="compact-time">
      <span>${time}</span>${stop.tz ? `<div class="tl-tz">${stop.tz}</div>` : ''}
    </div>
    <div class="tl-line-wrap">
      <div class="tl-dot"></div>
      ${isLast ? '' : '<div class="tl-line"></div>'}
    </div>
    <div class="compact-body${isVisited ? ' visited' : ''}">
      <div class="compact-name">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
      <div class="compact-meta">
        ${metaHtml}
        ${isVisited ? '<div class="compact-visited-dot"><i class="ph ph-check"></i></div>' : ''}
      </div>
    </div>`;

  item.addEventListener('click', () => openDetail(stop));
  return item;
}

/* ── Build one timeline item ───────────────────────────────────────── */
function buildTimelineItem(stop, isLast, day, nextStop) {
  const item = document.createElement('div');
  item.className = 'tl-item';
  item.dataset.type = getStopType(stop);
  item.id = `stop-${stop.id}`;

  const time = getStopTime(stop);
  const isEditable = timeToMinutes(time) !== null;
  const isVisited = !!state.checked[stop.id];

  const _todayStr = new Date().toISOString().slice(0, 10);
  const _currentDay = day || TRIP_DATA.days.find(d => d.id === state.currentDayId);
  const _isToday = _currentDay && (_currentDay.date === _todayStr ||
    (_currentDay.isFestival && _todayStr >= _currentDay.date && _todayStr <= (_currentDay.dateEnd || _currentDay.date)));
  const _isPastDay = _currentDay?.date && _currentDay.date < _todayStr;
  const _stopMins = timeToMinutes(time);
  const _depMins = _stopMins !== null ? _stopMins + getStopDuration(stop) : null;
  const isPast = !isVisited && _isToday && _depMins !== null && _depMins < nowMinutes();

  // Departure stops: slim row showing where you're heading next, no photo
  if (getStopType(stop) === 'depart') {
    const nextName = nextStop ? getStopName(nextStop) : null;
    const nextIcon = nextStop ? stopTypeIcon(nextStop) : '';
    item.innerHTML = `
      <div class="tl-left">
        <button class="tl-time-btn" data-stop-id="${stop.id}">
          <span>${time}</span>${stop.tz ? `<div class="tl-tz">${stop.tz}</div>` : ''}
        </button>
      </div>
      <div class="tl-line-wrap">
        <div class="tl-dot tl-dot--depart"></div>
        ${isLast ? '' : '<div class="tl-line"></div>'}
      </div>
      <div class="tl-depart-row" data-stop-id="${stop.id}">
        <div class="tl-depart-from">${getStopName(stop)}</div>
        ${nextName ? `<div class="tl-depart-arrow"><i class="ph ph-arrow-right"></i></div><div class="tl-depart-to">${nextIcon} ${nextName}</div>` : ''}
        <div class="tl-depart-note">${getStopReason(stop)}</div>
      </div>`;
    if (isEditable) {
      const _d = TRIP_DATA.days.find(d => d.id === state.currentDayId);
      item.querySelector('.tl-time-btn').addEventListener('click', () => openTimeModal(stop, _d));
    }
    return item;
  }

  item.innerHTML = `
    <div class="tl-left">
      <button class="tl-time-btn" data-stop-id="${stop.id}">
        <span>${time}</span>${stop.tz ? `<div class="tl-tz">${stop.tz}</div>` : ''}
      </button>
    </div>
    <div class="tl-line-wrap">
      <div class="tl-dot"></div>
      ${isLast ? '' : '<div class="tl-line"></div>'}
    </div>
    <div class="tl-card${isVisited ? ' visited' : ''}" data-stop-id="${stop.id}">
      <div class="card-visited-badge">✓</div>
      ${buildSlider(stop, 'card')}
      <div class="card-body">
        <div class="card-top-row">
          <div class="card-name">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
          <button class="check-btn${isVisited ? ' checked' : ''}" data-stop-id="${stop.id}" aria-label="Mark visited"><i class="ph ${isVisited ? 'ph-check-circle' : 'ph-circle'}"></i></button>
        </div>
        <div class="card-meta-row">
          <span class="tl-card-badge">${typeLabel(getStopType(stop))}</span>
          ${getStopPriority(stop) > 0 ? `<span class="priority-stars">${priorityStars(getStopPriority(stop))}</span>` : ''}
          <a class="weather-pill" data-stop-id="${stop.id}" data-lat="${getStopLat(stop)||''}" data-lng="${getStopLng(stop)||''}" href="#" onclick="return false;"></a>
        </div>
        <div class="card-reason">${getStopReason(stop)}</div>
        ${buildTags(stop)}
        ${hasExplicitDuration(stop) ? `<div data-leaveby="${stop.id}" class="leave-by-pill" style="display:none"></div>` : ''}
        <div class="tl-actions">${buildIconActions(stop)}</div>
      </div>
    </div>`;

  if (isEditable) {
    const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
    item.querySelector('.tl-time-btn').addEventListener('click', () => openTimeModal(stop, day));
  }
  item.querySelector('.check-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleCheck(stop.id, item);
  });

  // Whole card opens detail; action icon links and check button stop propagation
  const card = item.querySelector('.tl-card');
  card.style.cursor = 'pointer';
  card.addEventListener('click', e => {
    // Let act-btn links and check-btn handle themselves
    if (e.target.closest('.act-btn, .check-btn')) return;
    openDetail(stop);
  });

  // Photo slider still handles its own swipe; tap on slider already calls openDetail,
  // so prevent the card click from double-firing
  const slider = item.querySelector('.card-slider');
  if (slider) {
    slider.addEventListener('click', e => e.stopPropagation());
  }

  initSlider(item.querySelector('.card-slider'), stop, 'card');

  // Lazily fetch weather and update pill
  const _weatherPill = item.querySelector('.weather-pill');
  if (_weatherPill && _currentDay) {
    fetchWeatherForDay(_currentDay).then(wMap => {
      if (!wMap || !_weatherPill.isConnected) return;
      const today = new Date().toISOString().slice(0, 10);
      const dateStr = _currentDay.isFestival ? today : (_currentDay.date || '');
      const w = lookupHourlyWeather(wMap, dateStr, getStopTime(stop));
      if (!w) return;
      const { icon, tempC } = w;
      const lat   = _weatherPill.dataset.lat;
      const lng   = _weatherPill.dataset.lng;
      _weatherPill.innerHTML = `<i class="ph ${icon}"></i> ${tempC}°C`;
      _weatherPill.title = entry.conditionText;
      if (lat && lng) {
        _weatherPill.addEventListener('click', e => {
          e.stopPropagation();
          openWeatherApp(lat, lng);
        });
      }
    });
  }

  return item;
}

/* ── Image slider HTML ─────────────────────────────────────────────── */
function buildSlider(stop, prefix) {
  const photos = getPhotos(stop);
  const [c1, c2] = TYPE_GRAD[getStopType(stop)] || ['#334155','#0f172a'];
  const slides = photos.map((url) => {
    if (url === '__placeholder__') {
      return `<div class="${prefix}-slide ${prefix}-slide-placeholder" style="background:linear-gradient(145deg,${c1}55,${c2})">
        <div class="ph-icon">${stopTypeIcon(stop)}</div>
        <div class="ph-name">${stop.location}</div>
      </div>`;
    }
    return `<img class="${prefix}-slide" src="${url}" loading="lazy" alt="${stop.location}">`;
  }).join('');
  const dots = photos.length > 1
    ? `<div class="${prefix}-dots">${photos.map((_,i) => `<span class="${prefix}-dot${i===0?' active':''}"></span>`).join('')}</div>`
    : '';
  // loading class removed once first image fires onload
  const hasRealImg = photos.some(u => u !== '__placeholder__');
  return `<div class="${prefix}-slider${hasRealImg ? ' loading' : ''}"><div class="${prefix}-slides">${slides}</div>${dots}</div>`;
}

/* ── Slider touch logic ────────────────────────────────────────────── */
function initSlider(sliderEl, stop, prefix) {
  if (!sliderEl) return;
  const slidesEl = sliderEl.querySelector(`.${prefix}-slides`);
  const total = getPhotos(stop).length;
  let current = 0, startX = 0, startY = 0, diffX = 0, isDragging = false, isHoriz = null;
  let _tappedByTouch = false;
  const [c1, c2] = TYPE_GRAD[getStopType(stop)] || ['#334155','#0f172a'];

  // Shimmer: remove once any image loads; replace broken images with placeholder
  const imgs = sliderEl.querySelectorAll(`img.${prefix}-slide`);
  imgs.forEach((img, i) => {
    if (img.complete && img.naturalWidth) { sliderEl.classList.remove('loading'); return; }
    img.addEventListener('load',  () => sliderEl.classList.remove('loading'), { once: true });
    img.addEventListener('error', () => {
      // Swap broken img → styled placeholder
      const ph = document.createElement('div');
      ph.className = `${prefix}-slide ${prefix}-slide-placeholder`;
      ph.style.background = `linear-gradient(145deg,${c1}55,${c2})`;
      ph.innerHTML = `<div class="ph-icon">${stopTypeIcon(stop)}</div><div class="ph-name">${stop.location}</div>`;
      img.replaceWith(ph);
      sliderEl.classList.remove('loading');
    }, { once: true });
  });

  function goTo(idx) {
    current = Math.max(0, Math.min(total - 1, idx));
    slidesEl.style.transform = `translateX(-${current * 100}%)`;
    sliderEl.querySelectorAll(`.${prefix}-dot`).forEach((d,i) => d.classList.toggle('active', i === current));
  }

  sliderEl.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    diffX = 0; isDragging = true; isHoriz = null;
    slidesEl.style.transition = 'none';
  }, { passive: true });

  sliderEl.addEventListener('touchmove', e => {
    if (!isDragging) return;
    diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - startY;
    if (isHoriz === null) isHoriz = Math.abs(diffX) > Math.abs(diffY);
    if (isHoriz) {
      e.preventDefault();
      slidesEl.style.transform = `translateX(calc(-${current * 100}% + ${diffX}px))`;
    }
  }, { passive: false });

  sliderEl.addEventListener('touchend', () => {
    isDragging = false;
    slidesEl.style.transition = 'transform .3s ease';
    if (isHoriz) {
      if (diffX < -40) goTo(current + 1);
      else if (diffX > 40) goTo(current - 1);
      else goTo(current);
    } else if (Math.abs(diffX) < 8) {
      _tappedByTouch = true;
      setTimeout(() => { _tappedByTouch = false; }, 400);
      openDetail(stop);
    }
    isHoriz = null;
  });

  // Click fallback for when touchend doesn't fire (e.g. desktop, or iOS edge cases)
  sliderEl.addEventListener('click', () => {
    if (!_tappedByTouch) openDetail(stop);
  });
}

/* ── Action buttons — icon only ───────────────────────────────────── */
function buildIconActions(stop) {
  const parts = [`<a class="act-btn tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i></a>`];
  const sType = getStopType(stop);
  if (sType !== 'depart' && sType !== 'transport') {
    if (getStopVegan(stop) || sType === 'food')
      parts.push(`<a class="act-btn vegan" href="${veganNearbyUrl(stop)}" target="_blank" rel="noopener"><i class="ph ph-leaf"></i></a>`);
    parts.push(`<a class="act-btn charge" href="${chargingNearbyUrl(stop)}" target="_blank" rel="noopener"><i class="ph ph-lightning"></i></a>`);
    if (getStopPriority(stop) >= 2)
      parts.push(`<a class="act-btn poi" href="${poiNearbyUrl(stop)}" target="_blank" rel="noopener"><i class="ph ph-map-pin"></i></a>`);
  }
  if (stop.mapsUrl && stop.mapsUrl !== 'N/A')
    parts.push(`<a class="act-btn maps" href="${stop.mapsUrl}" target="_blank" rel="noopener"><i class="ph ph-map-trifold"></i></a>`);
  return parts.join('');
}

function minsToHHMM(mins) {
  return `${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`;
}
function HHMMtoMins(str) {
  if (!str) return 30;
  const [h,m] = str.split(':').map(Number);
  return (h||0)*60+(m||0);
}

/* ── Stop edit sheet ────────────────────────────────────────────────── */
let _editStop = null, _editDay = null, _addMode = false;
let _editLocMap = null, _editLocMarker = null;
let _editLat = null, _editLng = null;
let _editSearchTimer = null;
let _editSelectedType = null;
let _editSelectedPriority = null;

const TYPE_DEFS = [
  { type:'depart',       ph:'ph-car',            label:'Depart' },
  { type:'transport',    ph:'ph-train',           label:'Transport' },
  { type:'charging',     ph:'ph-lightning',       label:'Charging' },
  { type:'hotel',        ph:'ph-bed',             label:'Hotel' },
  { type:'food',         ph:'ph-fork-knife',      label:'Food' },
  { type:'wander',       ph:'ph-footprints',      label:'Explore' },
  { type:'architecture', ph:'ph-building',        label:'Architecture' },
  { type:'village',      ph:'ph-house',           label:'Village' },
  { type:'town',         ph:'ph-buildings',       label:'Town' },
  { type:'experience',   ph:'ph-star',            label:'Experience' },
  { type:'scenic',       ph:'ph-mountains',       label:'Scenic' },
  { type:'historic',     ph:'ph-castle-turret',   label:'Historic' },
  { type:'festival',     ph:'ph-film-slate',      label:'Festival' },
];
// Helper: render a Phosphor icon element for a type def
function typePh(type) {
  const td = TYPE_DEFS.find(d => d.type === type);
  return td ? `<i class="ph ${td.ph}"></i>` : '<i class="ph ph-map-pin"></i>';
}

const PRIORITY_DEFS = [
  { value:3, stars:'★★★', label:'Must-see' },
  { value:2, stars:'★★☆', label:'Should do' },
  { value:1, stars:'★☆☆', label:'Could do' },
  { value:0, stars:'○○○', label:'Can skip' },
];

function buildDurPicker(totalMins) {
  const hrs = Math.floor(totalMins / 60);
  const minVal = totalMins % 60;
  const hCol = document.getElementById('dur-hours');
  const mCol = document.getElementById('dur-mins');
  if (!hCol || !mCol) return;
  hCol.innerHTML = '<div class="dur-pad"></div>' +
    Array.from({length:9},(_,i)=>`<div class="dur-item">${i}h</div>`).join('') +
    '<div class="dur-pad"></div>';
  mCol.innerHTML = '<div class="dur-pad"></div>' +
    Array.from({length:12},(_,i)=>`<div class="dur-item">${String(i*5).padStart(2,'0')}</div>`).join('') +
    '<div class="dur-pad"></div>';
  requestAnimationFrame(() => {
    hCol.scrollTop = hrs * 44;
    mCol.scrollTop = (minVal / 5) * 44;
  });
}

function getDurPickerMins() {
  const hCol = document.getElementById('dur-hours');
  const mCol = document.getElementById('dur-mins');
  if (!hCol || !mCol) return 30;
  const hrs = Math.min(8, Math.max(0, Math.round(hCol.scrollTop / 44)));
  const minIdx = Math.min(11, Math.max(0, Math.round(mCol.scrollTop / 44)));
  return hrs * 60 + minIdx * 5;
}

function initEditLocMap(lat, lng) {
  const el = document.getElementById('edit-map-el');
  if (!el || !window.L) return;
  if (_editLocMap) { _editLocMap.remove(); _editLocMap = null; _editLocMarker = null; }
  _editLat = lat; _editLng = lng;
  const isDark = !document.body.classList.contains('light');
  const tiles = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  _editLocMap = L.map(el, { zoomControl: true, attributionControl: false, tap: true, dragging: true });
  L.tileLayer(tiles, { maxZoom: 19, subdomains: 'abcd' }).addTo(_editLocMap);
  _editLocMap.setView([lat, lng], 14);
  _editLocMarker = L.marker([lat, lng], { draggable: true }).addTo(_editLocMap);
  _editLocMarker.on('drag dragend', e => {
    const p = e.target.getLatLng();
    _editLat = p.lat; _editLng = p.lng;
  });
  // Tap anywhere on map to move pin
  _editLocMap.on('click', e => {
    _editLat = e.latlng.lat; _editLng = e.latlng.lng;
    _editLocMarker.setLatLng(e.latlng);
  });
  setTimeout(() => _editLocMap && _editLocMap.invalidateSize(), 150);
}

function placeEditPin(lat, lng, label) {
  _editLat = lat; _editLng = lng;
  if (_editLocMap && _editLocMarker) {
    _editLocMap.setView([lat, lng], 15);
    _editLocMarker.setLatLng([lat, lng]);
  }
  const el = document.getElementById('edit-loc-results');
  el.innerHTML = '';
  if (label) document.getElementById('edit-loc-search').value = label;
}

async function runEditSearch() {
  const input = document.getElementById('edit-loc-search');
  const query = input ? input.value.trim() : '';
  const el = document.getElementById('edit-loc-results');
  if (query.length < 2) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="edit-loc-no-results">Searching…</div>';
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=en`);
    const results = await r.json();
    if (!results.length) { el.innerHTML = '<div class="edit-loc-no-results">No results found</div>'; return; }
    el.innerHTML = results.map((item, i) =>
      `<button class="edit-loc-result" data-lat="${item.lat}" data-lng="${item.lon}">${item.display_name}</button>`
    ).join('');
    el.querySelectorAll('.edit-loc-result').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        placeEditPin(parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lng), btn.textContent);
      });
    });
  } catch(err) {
    el.innerHTML = '<div class="edit-loc-no-results">Search failed — check connection</div>';
  }
}

function renderEditTypeGrid(selectedType) {
  _editSelectedType = selectedType;
  const sel = document.getElementById('edit-type-select');
  if (!sel) return;
  sel.innerHTML = TYPE_DEFS.map(td =>
    `<option value="${td.type}" ${td.type === selectedType ? 'selected' : ''}>${td.label}</option>`
  ).join('');
  sel.onchange = () => { _editSelectedType = sel.value; };
}

function renderEditPriority(priority) {
  _editSelectedPriority = priority ?? 1;
  const el = document.getElementById('edit-stars');
  if (!el) return;
  function render() {
    el.innerHTML = [1,2,3].map(i =>
      `<span class="star${i <= _editSelectedPriority ? ' filled' : ''}" data-val="${i}">★</span>`
    ).join('');
    el.querySelectorAll('.star').forEach(s => {
      s.addEventListener('click', () => {
        const v = parseInt(s.dataset.val);
        _editSelectedPriority = (v === _editSelectedPriority) ? 0 : v;
        render();
      });
    });
  }
  render();
}

async function fetchTravelMins(fromLat, fromLng, toLat, toLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const r = await fetch(url);
    const d = await r.json();
    return Math.ceil((d.routes?.[0]?.duration ?? 0) / 60);
  } catch { return null; }
}

async function recalculateFromStop(day, fromIdx, statusCb) {
  const btn = document.getElementById('edit-recalc-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Recalculating…'; }
  const allStops = getDayStops(day);

  for (let i = fromIdx; i < allStops.length - 1; i++) {
    const from = allStops[i];
    const to   = allStops[i + 1];
    const fromLat = getStopLat(from), fromLng = getStopLng(from);
    const toLat   = getStopLat(to),   toLng   = getStopLng(to);
    if (!fromLat || !toLat) continue;

    const arrMins  = timeToMinutes(getStopTime(from));
    if (arrMins === null) continue;
    const durMins  = getStopDuration(from);
    const depMins  = arrMins + durMins;
    const travelMins = await fetchTravelMins(fromLat, fromLng, toLat, toLng);
    if (travelMins === null) continue;
    state.overrides[to.id] = minutesToTime(depMins + travelMins);

    if (btn) btn.textContent = `Recalculating… (${i - fromIdx + 1}/${allStops.length - 1 - fromIdx})`;
    if (statusCb) statusCb(i - fromIdx + 1, allStops.length - 1 - fromIdx);
  }

  save();
  renderView(false);
  if (_editStop !== null) closeEditSheet();
  if (btn) { btn.disabled = false; btn.textContent = 'Recalculate following stops'; }
}

function openEditSheet(stop, addToDayId) {
  if (!stop && addToDayId) {
    // Add mode
    _addMode = true;
    _editStop = null;
    _editDay = TRIP_DATA.days.find(d => d.id === addToDayId);
    _editLat = _editDay?.stops?.[0] ? getStopLat(_editDay.stops[0]) : null;
    _editLng = _editDay?.stops?.[0] ? getStopLng(_editDay.stops[0]) : null;
    document.getElementById('edit-name').value   = '';
    document.getElementById('edit-time').value   = '';
    document.getElementById('edit-reason').value = '';
    document.getElementById('edit-vegan').checked = false;
    document.getElementById('edit-loc-search').value = '';
    document.getElementById('edit-loc-results').innerHTML = '';
    const durEl = document.getElementById('edit-dur-native');
    if (durEl) durEl.value = '00:30';
    renderEditTypeGrid('depart');
    renderEditPriority(2);
    document.querySelector('.edit-sheet-title').textContent = 'Add stop';
    document.getElementById('edit-delete-btn').style.display = 'none';
  } else {
    _addMode = false;
    const day = TRIP_DATA.days.find(d => d.stops.some(s => s.id === stop.id))
             || Object.entries(state.addedStops || {}).reduce((found, [dayId, arr]) => {
               if (found) return found;
               return arr.some(s => s.id === stop.id) ? TRIP_DATA.days.find(d => d.id === dayId) : null;
             }, null);
    _editStop = stop; _editDay = day;
    _editLat = getStopLat(stop); _editLng = getStopLng(stop);
    document.getElementById('edit-name').value   = getStopName(stop);
    document.getElementById('edit-time').value   = getStopTime(stop) ?? '';
    document.getElementById('edit-reason').value = getStopReason(stop);
    document.getElementById('edit-vegan').checked = getStopVegan(stop);
    document.getElementById('edit-loc-search').value = '';
    document.getElementById('edit-loc-results').innerHTML = '';
    const durEl = document.getElementById('edit-dur-native');
    if (durEl) durEl.value = minsToHHMM(getStopDuration(stop));
    renderEditTypeGrid(getStopType(stop));
    renderEditPriority(getStopPriority(stop));
    document.querySelector('.edit-sheet-title').textContent = 'Edit stop';
    // Show delete button only for added stops
    const isAdded = Object.values(state.addedStops || {}).some(arr => arr.some(s => s.id === stop.id));
    document.getElementById('edit-delete-btn').style.display = isAdded ? '' : 'none';
  }

  const sheet = document.getElementById('edit-sheet-overlay');
  sheet.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    sheet.classList.add('open');
    setTimeout(() => initEditLocMap(_editLat, _editLng), 350);
  }));
}

function closeEditSheet() {
  const sheet = document.getElementById('edit-sheet-overlay');
  sheet.classList.remove('open');
  sheet.addEventListener('transitionend', () => sheet.classList.add('hidden'), { once: true });
  if (_editLocMap) { _editLocMap.remove(); _editLocMap = null; _editLocMarker = null; }
  _editStop = _editDay = null; _addMode = false;
}

function saveEditSheet() {
  const name   = document.getElementById('edit-name').value.trim();
  const time   = document.getElementById('edit-time').value;
  const reason = document.getElementById('edit-reason').value.trim();
  const vegan  = document.getElementById('edit-vegan').checked;
  const dur    = HHMMtoMins(document.getElementById('edit-dur-native')?.value);

  if (_addMode) {
    if (!_editDay) return;
    const newStop = {
      id:           'added_' + Date.now(),
      time:         time || '12:00',
      location:     name || 'New stop',
      type:         _editSelectedType || 'depart',
      duration:     dur >= 0 ? dur : 30,
      reason:       reason,
      lat:          _editLat,
      lng:          _editLng,
      veganFriendly: vegan,
      order:        999,
    };
    if (!state.addedStops[_editDay.id]) state.addedStops[_editDay.id] = [];
    state.addedStops[_editDay.id].push(newStop);
    save();
    renderView(false);
    closeEditSheet();
    return;
  }

  if (!_editStop) return;
  state.locOverrides[_editStop.id] = {
    name: name || _editStop.location,
    lat: _editLat ?? getStopLat(_editStop),
    lng: _editLng ?? getStopLng(_editStop),
  };
  if (dur >= 0) state.durOverrides[_editStop.id] = dur;
  if (time) state.overrides[_editStop.id] = time;
  if (reason) state.reasonOverrides[_editStop.id] = reason;
  state.veganOverrides[_editStop.id] = vegan;
  if (_editSelectedType) state.typeOverrides[_editStop.id] = _editSelectedType;
  if (_editSelectedPriority !== null) state.priorityOverrides[_editStop.id] = _editSelectedPriority;

  save();
  renderView(false);
  if (_detailStop?.id === _editStop.id) {
    document.getElementById('detail-name').innerHTML = stopTypeIcon(_editStop) + ' ' + getStopName(_editStop);
    document.getElementById('detail-time').textContent = getStopTime(_editStop) + (_editStop.tz ? ' ' + _editStop.tz : '');
  }
  closeEditSheet();
}

/* ── Detail page ───────────────────────────────────────────────────── */
let _detailStop = null, _detailCurrent = 0, _detailTotal = 0;

function buildDetailSlides(photos, stop) {
  const [dc1, dc2] = TYPE_GRAD[stop.type] || ['#334155','#0f172a'];
  return photos.map(url => {
    if (url === '__placeholder__') {
      return `<div class="detail-slide detail-slide-placeholder" style="background:linear-gradient(145deg,${dc1}55,${dc2})">
        <div class="ph-icon" style="font-size:72px">${stopTypeIcon(stop)}</div>
        <div class="ph-name" style="font-size:18px;margin-top:12px;padding:0 24px;text-align:center">${stop.location}</div>
      </div>`;
    }
    return `<img class="detail-slide" src="${url}" loading="lazy" alt="${stop.location}">`;
  }).join('');
}

function setDetailSlides(photos, stop) {
  const slidesEl = document.getElementById('detail-slides');
  const dotsEl   = document.getElementById('detail-dots');
  _detailTotal = photos.length;
  slidesEl.innerHTML = buildDetailSlides(photos, stop);
  dotsEl.innerHTML = photos.length > 1
    ? photos.map((_,i) => `<span class="detail-dot${i===0?' active':''}"></span>`).join('') : '';
  initDetailSlider();
}

function openDetail(stop) {
  _detailStop = stop;
  _detailCurrent = 0;
  const overlay = document.getElementById('detail-overlay');
  overlay.scrollTop = 0;
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));

  // Render immediately with whatever photos are available now
  const slidesEl = document.getElementById('detail-slides');
  slidesEl.style.transition = 'none';
  slidesEl.style.transform  = 'translateX(0)';
  setDetailSlides(getPhotos(stop), stop);

  document.getElementById('detail-body').dataset.type = getStopType(stop);
  document.getElementById('detail-badge').textContent = typeLabel(getStopType(stop));
  document.getElementById('detail-time').textContent  = getStopTime(stop) + (stop.tz ? ' ' + stop.tz : '');
  const detailLeaveBy = document.getElementById('detail-leaveby');
  if (detailLeaveBy) renderLeaveByEl(detailLeaveBy, stop);
  document.getElementById('detail-stars').textContent = priorityStars(getStopPriority(stop));
  document.getElementById('detail-name').innerHTML = stopTypeIcon(stop) + ' ' + getStopName(stop);
  document.getElementById('detail-reason').textContent = _wikiCache[stop.id]?.extract || getStopReason(stop);

  const tagsEl = document.getElementById('detail-tags');
  tagsEl.innerHTML = '';
  if (getStopVegan(stop))                    tagsEl.innerHTML += '<span class="tl-tag vegan"><i class="ph ph-leaf"></i> Vegan-friendly</span>';
  if (getStopType(stop) === 'charging')      tagsEl.innerHTML += '<span class="tl-tag charge"><i class="ph ph-lightning"></i> Supercharger</span>';
  if (getStopPriority(stop) >= 3)            tagsEl.innerHTML += '<span class="tl-tag poi">★ Must-see</span>';

  const actEl = document.getElementById('detail-actions');
  const parts = [`<a class="act-btn-full tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i> Navigate</a>`];
  if (getStopVegan(stop) || getStopType(stop) === 'food')
    parts.push(`<a class="act-btn-full vegan" href="${veganNearbyUrl(stop)}" target="_blank" rel="noopener"><i class="ph ph-leaf"></i> Vegan nearby</a>`);
  parts.push(`<a class="act-btn-full charge" href="${chargingNearbyUrl(stop)}" target="_blank" rel="noopener"><i class="ph ph-lightning"></i> Chargers</a>`);
  if (stop.mapsUrl && stop.mapsUrl !== 'N/A')
    parts.push(`<a class="act-btn-full maps" href="${stop.mapsUrl}" target="_blank" rel="noopener"><i class="ph ph-map-trifold"></i> Maps</a>`);
  actEl.innerHTML = parts.join('');
  document.getElementById('detail-edit-btn').onclick = () => openEditSheet(stop);

  const poiSection  = document.getElementById('detail-poi-section');
  const poiCarousel = document.getElementById('detail-poi-carousel');
  poiSection.classList.add('hidden');
  poiCarousel.innerHTML = '';

  updateDetailCheckBtn();
  overlay.scrollTop = 0;

  // Populate detail weather row
  const detailWeatherEl = document.getElementById('detail-weather');
  if (detailWeatherEl) {
    detailWeatherEl.classList.add('hidden');
    detailWeatherEl.innerHTML = '';
    const _dDay = TRIP_DATA.days.find(d => d.stops?.some(s => s.id === stop.id));
    if (_dDay) {
      fetchWeatherForDay(_dDay).then(wMap => {
        if (!wMap || !detailWeatherEl.isConnected) return;
        if (_detailStop?.id !== stop.id) return;
        const today = new Date().toISOString().slice(0, 10);
        const dateStr = _dDay.isFestival ? today : (_dDay.date || '');
        const w = lookupHourlyWeather(wMap, dateStr, getStopTime(stop));
        if (!w) return;
        const { icon, tempC } = w;
        const lat   = getStopLat(stop) || _dDay.lat || '';
        const lng   = getStopLng(stop) || _dDay.lng || '';
        detailWeatherEl.innerHTML = `
          <span class="weather-icon"><i class="ph ${icon}"></i></span>
          <span class="weather-temp">${tempC}°C</span>
          <span class="weather-desc">${entry.conditionText}</span>
          ${lat && lng ? `<a href="#" class="weather-link" onclick="openWeatherApp(${lat},${lng}); return false;">
            <i class="ph ph-cloud-sun"></i> Open Weather
          </a>` : ''}`;
        detailWeatherEl.classList.remove('hidden');
      });
    }
  }

  // Fetch wiki + Places data; refresh slides + description when done
  const tasks = [];
  if (_wikiCache[stop.id] === undefined) tasks.push(fetchWikiData(stop));
  const type = getStopType(stop);
  if (type !== 'depart' && type !== 'charging' && !_placesCache[stop.id]?.photos?.length)
    tasks.push(fetchPlacesPhotos(stop));

  if (tasks.length) {
    Promise.all(tasks).then(() => {
      if (!_detailStop || _detailStop.id !== stop.id) return;
      const data = _wikiCache[stop.id];
      if (data?.extract) document.getElementById('detail-reason').textContent = data.extract;
      slidesEl.style.transition = 'none';
      slidesEl.style.transform  = 'translateX(0)';
      _detailCurrent = 0;
      setDetailSlides(getPhotos(stop), stop);
      injectWikiPhoto(stop.id);
    });
  } else {
    // already cached — just make sure extract is shown
    const data = _wikiCache[stop.id];
    if (data?.extract) document.getElementById('detail-reason').textContent = data.extract;
  }

  // Fetch nearby POIs — add to both the carousel and the detail slider
  fetchNearbyPOI(stop).then(pois => {
    if (!_detailStop || _detailStop.id !== stop.id || !pois.length) return;

    // Append nearby photos to the detail slider
    const basePhotos = getPhotos(stop).filter(u => u !== '__placeholder__');
    const nearbyImgs = pois.map(p => p.img);
    const allPhotos  = [...basePhotos, ...nearbyImgs];
    slidesEl.style.transition = 'none';
    slidesEl.style.transform  = `translateX(-${_detailCurrent * 100}%)`;
    setDetailSlides(allPhotos, stop);
    // Restore position
    const slidesElNew = document.getElementById('detail-slides');
    slidesElNew.style.transition = 'none';
    slidesElNew.style.transform  = `translateX(-${_detailCurrent * 100}%)`;

    // Render POI cards
    poiCarousel.innerHTML = pois.map(p => `
      <a class="poi-card" href="${p.url}" target="_blank" rel="noopener">
        <img class="poi-card-img" src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="poi-card-label">
          <div class="poi-card-name">${p.title.replace(/_/g,' ')}</div>
          <div class="poi-card-dist">${p.dist < 1000 ? Math.round(p.dist)+'m' : (p.dist/1000).toFixed(1)+'km'}</div>
        </div>
      </a>`).join('');
    poiSection.classList.remove('hidden');
  });
}

function closeDetail() {
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('open');
  overlay.addEventListener('transitionend', () => {
    overlay.classList.add('hidden');
    _detailStop = null;
  }, { once: true });
}

function updateDetailCheckBtn() {
  const btn = document.getElementById('detail-check-btn');
  const checked = _detailStop && !!state.checked[_detailStop.id];
  btn.textContent = checked ? '✓ Visited' : 'Mark visited';
  btn.classList.toggle('checked', checked);
}

function initDetailSlider() {
  const wrap = document.getElementById('detail-slider-wrap');
  const slidesEl = document.getElementById('detail-slides');
  let startX = 0, diffX = 0, isDragging = false, isHoriz = null;

  function goTo(idx) {
    _detailCurrent = Math.max(0, Math.min(_detailTotal - 1, idx));
    slidesEl.style.transform = `translateX(-${_detailCurrent * 100}%)`;
    document.querySelectorAll('.detail-dot').forEach((d,i) => d.classList.toggle('active', i === _detailCurrent));
  }

  const newWrap = wrap.cloneNode(false);
  while (wrap.firstChild) newWrap.appendChild(wrap.firstChild);
  wrap.parentNode.replaceChild(newWrap, wrap);
  newWrap.id = 'detail-slider-wrap';

  newWrap.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; diffX = 0; isDragging = true; isHoriz = null;
    slidesEl.style.transition = 'none';
  }, { passive: true });
  newWrap.addEventListener('touchmove', e => {
    if (!isDragging) return;
    diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - e.touches[0].clientY;
    if (isHoriz === null) isHoriz = true;
    if (isHoriz) {
      e.preventDefault();
      slidesEl.style.transform = `translateX(calc(-${_detailCurrent * 100}% + ${diffX}px))`;
    }
  }, { passive: false });
  newWrap.addEventListener('touchend', () => {
    isDragging = false;
    slidesEl.style.transition = 'transform .3s ease';
    if (diffX < -40) goTo(_detailCurrent + 1);
    else if (diffX > 40) goTo(_detailCurrent - 1);
    else goTo(_detailCurrent);
    isHoriz = null;
  });
}

/* ── Detail page nav swipe (right = back, left = next stop) ────────── */
function initDetailNavSwipe() {
  const page    = document.getElementById('detail-page');
  const sliderWrapId = 'detail-slider-wrap';

  let startX = 0, startY = 0, diffX = 0, isHoriz = null, active = false;

  page.addEventListener('touchstart', e => {
    const sliderWrap  = document.getElementById(sliderWrapId);
    const poiCarousel = document.getElementById('detail-poi-carousel');
    if (sliderWrap  && sliderWrap.contains(e.target))  return; // photo slider owns this
    if (poiCarousel && poiCarousel.contains(e.target)) return; // POI carousel owns this
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    diffX = 0; isHoriz = null; active = true;
  }, { passive: true });

  page.addEventListener('touchmove', e => {
    if (!active) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (isHoriz === null) {
      if (Math.abs(dx) > Math.abs(dy) + 6)       isHoriz = true;
      else if (Math.abs(dy) > Math.abs(dx) + 6)  isHoriz = false;
      else return;
    }
    if (!isHoriz) return;
    diffX = dx;
    page.style.transition = 'none';
    // right-swipe: slide out right; left-swipe: slide out left (dampened)
    page.style.transform = `translateX(${diffX * 0.35}px)`;
    e.preventDefault();
  }, { passive: false });

  page.addEventListener('touchend', () => {
    if (!active) return;
    active = false;
    page.style.transition = 'transform .25s ease';
    page.style.transform  = '';

    if (!isHoriz) return;

    const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
    const _ds = day ? getDayStops(day) : [];
    const idx  = day && _detailStop ? _ds.findIndex(s => s.id === _detailStop.id) : -1;

    if (diffX > 60) {
      const prev = idx > 0 ? _ds[idx - 1] : null;
      if (prev) openDetail(prev);
      else closeDetail();
    } else if (diffX < -60) {
      const next = idx >= 0 ? _ds[idx + 1] : null;
      if (next) openDetail(next);
    }
  });
}

/* ── Check off ─────────────────────────────────────────────────────── */
function toggleCheck(stopId, itemEl) {
  state.checked[stopId] = !state.checked[stopId];
  save();
  const card = itemEl && itemEl.querySelector('.tl-card');
  const btn  = itemEl && itemEl.querySelector('.check-btn');
  if (card) card.classList.toggle('visited', !!state.checked[stopId]);
  if (btn)  { btn.classList.toggle('checked', !!state.checked[stopId]); btn.innerHTML = `<i class="ph ${state.checked[stopId] ? 'ph-check-circle' : 'ph-circle'}"></i>`; }
}

/* ── Time modal ────────────────────────────────────────────────────── */
let _modalStop = null, _modalDay = null;
function openTimeModal(stop, day) {
  _modalStop = stop; _modalDay = day;
  document.getElementById('modal-location').innerHTML = stopTypeIcon(stop) + ' ' + stop.location;
  document.getElementById('modal-time-input').value = getStopTime(stop);
  document.getElementById('modal-cascade').checked = state.cascadeEnabled;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  _modalStop = _modalDay = null;
}
function saveModal() {
  if (!_modalStop || !_modalDay) return;
  const newTime = document.getElementById('modal-time-input').value;
  const cascade = document.getElementById('modal-cascade').checked;
  const delta = timeToMinutes(newTime) - timeToMinutes(getStopTime(_modalStop));
  state.overrides[_modalStop.id] = newTime;
  if (cascade && delta !== 0) {
    let found = false;
    _modalDay.stops.forEach(s => {
      if (s.id === _modalStop.id) { found = true; return; }
      if (!found) return;
      const cur = timeToMinutes(getStopTime(s));
      if (cur !== null) state.overrides[s.id] = minutesToTime(cur + delta);
    });
  }
  save(); closeModal(); renderView(false);
}

/* ── Day swipe (edge swipe left/right to change day) ───────────────── */
function initDaySwipe() {
  const mc = document.getElementById('main-content');
  const EDGE = 44; // px from screen edge that activates the gesture
  let startX = 0, startY = 0, diffX = 0, active = false, isHoriz = null;

  function adjacentDayId(delta) {
    const days = TRIP_DATA.days;
    const idx  = days.findIndex(d => d.id === state.currentDayId);
    const next = days[idx + delta];
    return next ? next.id : null;
  }

  mc.addEventListener('touchstart', e => {
    // Only on day view; ignore if detail/edit/modal is open
    if (state.currentView !== 'day') return;
    if (!document.getElementById('detail-overlay').classList.contains('hidden')) return;
    if (!document.getElementById('edit-sheet-overlay').classList.contains('hidden')) return;
    const x = e.touches[0].clientX;
    // Must start from the left or right screen edge
    if (x > EDGE && x < window.innerWidth - EDGE) return;
    startX = x;
    startY = e.touches[0].clientY;
    diffX = 0; isHoriz = null; active = true;
  }, { passive: true });

  mc.addEventListener('touchmove', e => {
    if (!active) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (isHoriz === null) {
      if (Math.abs(dx) > Math.abs(dy) + 6)      isHoriz = true;
      else if (Math.abs(dy) > Math.abs(dx) + 6) isHoriz = false;
      else return;
    }
    if (!isHoriz) { active = false; return; }
    diffX = dx;
  }, { passive: true });

  mc.addEventListener('touchend', () => {
    if (!active || !isHoriz) { active = false; return; }
    active = false;
    if (Math.abs(diffX) < 60) return;
    const delta = diffX < 0 ? 1 : -1; // left = next day, right = previous day
    const nextId = adjacentDayId(delta);
    if (nextId) selectDay(nextId);
  });
}

/* ── Init ──────────────────────────────────────────────────────────── */
function updateHeaderHeight() {
  const h = document.getElementById('app-header');
  if (h) document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px');
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  loadWikiCache();
  loadPlacesCache();
  loadGooglePhotos();
  state.currentDayId = findTodayDayId() || TRIP_DATA.days[0].id;
  buildDayStrip();
  renderView(true); // scroll to now only on first load
  updateHeaderHeight();
  new ResizeObserver(updateHeaderHeight).observe(document.getElementById('app-header'));
  if (typeof syncInit === 'function') syncInit();
  scheduleNotifs(); // schedule any pending departure alerts for today
  if (state.notifsEnabled && notifGranted()) startTrafficPolling();

  /* Gyroscope parallax */
  (function() {
    const bg = document.getElementById('bg-layer');
    if (!bg) return;

    let gyroX = 0, gyroY = 0, targetX = 0, targetY = 0;
    const MAX = 14;

    function applyTransform() {
      gyroX += (targetX - gyroX) * 0.07;
      gyroY += (targetY - gyroY) * 0.07;
      bg.style.transform = `translateX(${gyroX}px) translateY(${gyroY}px)`;
      requestAnimationFrame(applyTransform);
    }
    applyTransform();

    function handleOrientation(e) {
      if (e.gamma === null) return;
      const g = Math.max(-45, Math.min(45, e.gamma));
      const b = Math.max(-45, Math.min(45, (e.beta || 0) - 30));
      targetX = -(g / 45) * MAX;
      targetY = -(b / 45) * MAX;
    }

    let _gyroActive = false;
    function setGyroActive() {
      _gyroActive = true;
      window.addEventListener('deviceorientation', handleOrientation, true);
      const lbl = document.getElementById('gyro-label');
      if (lbl) lbl.textContent = 'Motion enabled';
      try { localStorage.setItem('annecy_gyro', '1'); } catch {}
    }

    function startGyro() {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(result => {
            if (result === 'granted') {
              setGyroActive();
            } else {
              const lbl = document.getElementById('gyro-label');
              if (lbl) lbl.textContent = 'Motion denied — check Settings';
              try { localStorage.removeItem('annecy_gyro'); } catch {}
            }
          }).catch(() => {});
      } else {
        setGyroActive();
      }
    }

    // Show enable button; hook up click
    const btn = document.getElementById('gyro-btn');
    if (btn) btn.addEventListener('click', startGyro);

    // Notification toggle
    const notifBtn = document.getElementById('notif-btn');
    const notifTestBtn = document.getElementById('notif-test-btn');
    if (notifBtn) {
      updateNotifBtn();
      // Show test button only when alerts are on
      if (notifTestBtn) notifTestBtn.style.display = state.notifsEnabled && notifGranted() ? '' : 'none';
      notifBtn.addEventListener('click', () => {
        if (state.notifsEnabled) {
          disableNotifs();
          if (notifTestBtn) notifTestBtn.style.display = 'none';
        } else {
          enableNotifs().then(() => {
            if (notifTestBtn) notifTestBtn.style.display = state.notifsEnabled ? '' : 'none';
          });
        }
      });
    }
    if (notifTestBtn) {
      notifTestBtn.addEventListener('click', () => testServerPush());
    }

    // Version panel
    const versionBtn = document.getElementById('version-btn');
    if (versionBtn) versionBtn.addEventListener('click', () => { closeDrawer(); showVersionPanel(); });
    const versionClose = document.getElementById('version-close');
    if (versionClose) versionClose.addEventListener('click', hideVersionPanel);
    const copyDevBtn = document.getElementById('copy-dev-data-btn');
    if (copyDevBtn) copyDevBtn.addEventListener('click', copyDevData);

    // Units toggle (km / miles)
    function updateUnitsBtn() {
      const lbl = document.getElementById('units-label');
      if (lbl) lbl.textContent = state.useMetric ? 'Distances in km' : 'Distances in miles';
    }
    updateUnitsBtn();
    const unitsBtn = document.getElementById('units-btn');
    if (unitsBtn) unitsBtn.addEventListener('click', () => {
      state.useMetric = !state.useMetric;
      try { localStorage.setItem('annecy_units', state.useMetric ? 'metric' : 'imperial'); } catch {}
      updateUnitsBtn();
      if (state.cardView === 'calendar') renderView(false); // re-render so labels update
    });

    // Auto-start: Android (no permission API) — no gesture needed
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission !== 'function') {
      startGyro();
    } else {
      // iOS: requestPermission() needs a user gesture, so re-trigger on first touch
      try {
        if (localStorage.getItem('annecy_gyro') === '1') {
          document.addEventListener('touchstart', function restore() {
            document.removeEventListener('touchstart', restore);
            startGyro();
          }, { once: true, passive: true });
        }
      } catch {}
    }
  })();

  /* Nav buttons */
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      state.currentView = btn.dataset.view;
      renderView(false);
    }));

  /* Compact toggle */
  function updateCompactBtn() {
    const btn = document.getElementById('compact-btn');
    if (!btn) return;
    const icons = { full: 'ph-rows', compact: 'ph-calendar', calendar: 'ph-cards' };
    const titles = { full: 'Compact view', compact: 'Calendar view', calendar: 'Full cards' };
    btn.querySelector('i').className = `ph ${icons[state.cardView]}`;
    btn.title = titles[state.cardView];
    btn.classList.toggle('compact-on', state.cardView !== 'full');
  }
  document.getElementById('compact-btn').addEventListener('click', () => {
    const next = { full: 'compact', compact: 'calendar', calendar: 'full' };
    state.cardView = next[state.cardView] || 'full';
    try { localStorage.setItem('annecy_cardview', state.cardView); } catch {}
    updateCompactBtn();
    renderView(false);
  });
  updateCompactBtn();

  /* More menu */
  const _moreBtn  = document.getElementById('more-btn');
  const _moreMenu = document.getElementById('more-menu');
  function closeMoreMenu() { _moreMenu.classList.add('hidden'); }
  function updateRippleLabel() {} // ripple is now an action, not a toggle
  _moreBtn.addEventListener('click', e => {
    e.stopPropagation();
    _moreMenu.classList.toggle('hidden');
  });
  document.addEventListener('click', e => {
    if (!_moreMenu.classList.contains('hidden') && !document.getElementById('more-menu-wrap').contains(e.target))
      closeMoreMenu();
  });
  document.getElementById('mm-today').addEventListener('click', () => {
    closeMoreMenu();
    const todayId = findTodayDayId();
    if (todayId) selectDay(todayId);
    else showToast('No itinerary for today');
  });
  document.getElementById('mm-add-stop').addEventListener('click', () => {
    closeMoreMenu();
    openEditSheet(null, state.currentDayId);
  });
  document.getElementById('mm-ripple').addEventListener('click', async () => {
    closeMoreMenu();
    const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
    if (!day || day.isCountdown) { showToast('No itinerary for this day'); return; }
    const allStops = getDayStops(day);
    const now = nowMinutes();
    const todayStr = new Date().toISOString().slice(0, 10);
    const isToday = day.date === todayStr;
    let fromIdx = 0;
    if (isToday) {
      const idx = allStops.findIndex(s => {
        const t = timeToMinutes(getStopTime(s));
        return t !== null && t + getStopDuration(s) >= now;
      });
      fromIdx = idx >= 0 ? idx : allStops.length - 1;
    }
    const fromStop = allStops[fromIdx];
    if (!fromStop) { showToast('No stops to recalculate'); return; }
    showToast(`Recalculating from ${getStopTime(fromStop) || 'start'}…`);
    await recalculateFromStop(day, fromIdx);
    showToast('Times updated');
  });

  /* Drawer */
  function updateDrawerLabels() {
    const isLight = document.body.classList.contains('light');
    const lbl = document.getElementById('dark-mode-label');
    const ico = document.getElementById('dark-mode-icon');
    if (lbl) lbl.textContent = isLight ? 'Light mode' : 'Dark mode';
    if (ico) { ico.className = isLight ? 'ph ph-sun drawer-icon' : 'ph ph-moon drawer-icon'; }
  }
  updateDrawerLabels();

  const openDrawer = () => {
    document.getElementById('drawer').classList.remove('hidden');
    document.getElementById('drawer-overlay').classList.remove('hidden');
  };
  const closeDrawer = () => {
    document.getElementById('drawer').classList.add('hidden');
    document.getElementById('drawer-overlay').classList.add('hidden');
    // Collapse settings accordion
    const body  = document.getElementById('settings-body');
    const caret = document.getElementById('settings-caret');
    if (body)  body.classList.remove('open');
    if (caret) caret.style.transform = '';
  };
  document.getElementById('menu-btn').addEventListener('click', openDrawer);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

  // Settings accordion
  document.getElementById('settings-toggle').addEventListener('click', () => {
    const body  = document.getElementById('settings-body');
    const caret = document.getElementById('settings-caret');
    const open  = body.classList.toggle('open');
    caret.style.transform = open ? 'rotate(90deg)' : '';
  });

  document.querySelectorAll('.drawer-item[data-action]').forEach(btn =>
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'home')         { state.currentView = 'day'; renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'reset-times')  { state.overrides = {}; state.locOverrides = {}; state.durOverrides = {}; state.typeOverrides = {}; state.priorityOverrides = {}; state.reasonOverrides = {}; state.veganOverrides = {}; save(); renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'reset-checks') { state.checked   = {}; save(); renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'toggle-dark')  {
        document.body.classList.toggle('light');
        try { localStorage.setItem('annecy_theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch {}
        updateDrawerLabels();
        if (_leafletMap) { _leafletMap.remove(); _leafletMap = null; _locMarker = null; _locCircle = null; document.getElementById('map-container').innerHTML = ''; }
        if (state.currentView === 'map') renderMapView();
        closeDrawer();
      }
    }));


  /* Time modal */
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') closeModal(); });
  document.getElementById('modal-save').addEventListener('click', saveModal);
  document.querySelectorAll('.time-adj').forEach(btn =>
    btn.addEventListener('click', () => {
      const input = document.getElementById('modal-time-input');
      const cur = timeToMinutes(input.value || '00:00');
      if (cur !== null) input.value = minutesToTime(cur + parseInt(btn.dataset.delta, 10));
    }));

  /* Detail page */
  document.getElementById('detail-back').addEventListener('click', closeDetail);
  initDetailNavSwipe();
  initDaySwipe();

  /* Edit sheet */
  document.getElementById('edit-sheet-close').addEventListener('click', closeEditSheet);
  // Segmented control: Departure / Arrival
  document.getElementById('time-type-seg').addEventListener('click', e => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    document.querySelectorAll('#time-type-seg .seg-btn').forEach(b => b.classList.toggle('active', b === btn));
  });
    document.getElementById('edit-sheet-overlay').addEventListener('click', e => {
    if (e.target.id === 'edit-sheet-overlay') closeEditSheet();
  });
  document.getElementById('edit-save-btn').addEventListener('click', saveEditSheet);
  document.getElementById('edit-delete-btn').addEventListener('click', () => {
    if (!_editStop || !_editDay) return;
    const arr = state.addedStops[_editDay.id];
    if (!arr) return;
    state.addedStops[_editDay.id] = arr.filter(s => s.id !== _editStop.id);
    save();
    renderView(false);
    closeEditSheet();
  });
  document.getElementById('edit-recalc-btn').onclick = async () => {
    if (!_editStop || !_editDay) return;
    const stop = _editStop, day = _editDay;
    const name   = document.getElementById('edit-name').value.trim();
    const time   = document.getElementById('edit-time').value;
    const reason = document.getElementById('edit-reason').value.trim();
    const vegan  = document.getElementById('edit-vegan').checked;
    const dur    = HHMMtoMins(document.getElementById('edit-dur-native')?.value);
    state.locOverrides[stop.id] = { name: name || getStopName(stop), lat: _editLat ?? getStopLat(stop), lng: _editLng ?? getStopLng(stop) };
    if (dur >= 0) state.durOverrides[stop.id] = dur;
    if (time) state.overrides[stop.id] = time;
    if (reason) state.reasonOverrides[stop.id] = reason;
    state.veganOverrides[stop.id] = vegan;
    if (_editSelectedType) state.typeOverrides[stop.id] = _editSelectedType;
    if (_editSelectedPriority !== null) state.priorityOverrides[stop.id] = _editSelectedPriority;
    save();
    const fromIdx = getDayStops(day).findIndex(s => s.id === stop.id);
    await recalculateFromStop(day, fromIdx);
  };
  document.getElementById('edit-loc-search').addEventListener('input', () => {
    clearTimeout(_editSearchTimer);
    _editSearchTimer = setTimeout(runEditSearch, 500);
  });
  document.getElementById('edit-loc-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); clearTimeout(_editSearchTimer); runEditSearch(); }
  });
  document.getElementById('edit-loc-search-btn').addEventListener('click', () => {
    clearTimeout(_editSearchTimer); runEditSearch();
  });
  document.getElementById('detail-check-btn').addEventListener('click', () => {
    if (!_detailStop) return;
    state.checked[_detailStop.id] = !state.checked[_detailStop.id];
    save();
    updateDetailCheckBtn();
    const itemEl = document.getElementById(`stop-${_detailStop.id}`);
    if (itemEl) {
      const card = itemEl.querySelector('.tl-card');
      const btn  = itemEl.querySelector('.check-btn');
      if (card) card.classList.toggle('visited', !!state.checked[_detailStop.id]);
      if (btn)  { btn.classList.toggle('checked', !!state.checked[_detailStop.id]); btn.textContent = state.checked[_detailStop.id] ? '✓' : '○'; }
    }
  });

  /* Service worker */
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  /* Resume from background / screen wake: return to today after 15+ min away */
  const RESUME_THRESHOLD = 15 * 60 * 1000; // 15 minutes
  let _lastVisible = Date.now();

  function handleResume() {
    if (document.hidden) { _lastVisible = Date.now(); return; }
    const away = Date.now() - _lastVisible;
    if (away < RESUME_THRESHOLD) return;
    _lastVisible = Date.now();
    const todayId = findTodayDayId();
    if (todayId) {
      state.currentDayId = todayId;
      state.currentView  = 'day';
      updateDayStrip();
    }
    renderView(true);
    scheduleNotifs();
  }

  // visibilitychange covers most cases; pageshow catches iOS PWA cold-resume
  document.addEventListener('visibilitychange', handleResume);
  window.addEventListener('pageshow', handleResume);
});

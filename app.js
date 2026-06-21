/* ── Version & error capture ───────────────────────────────────────── */
const APP_VERSION = 'v247';

const CHANGELOG = [
  { version: 'v244', title: 'Swipe to Skip or Remove, compact skipped cards, Bucket List', items: [
    { type: 'feature', text: 'Swipe left on any stop to reveal two options: Skip (or Restore) and Remove' },
    { type: 'feature', text: 'Skipped stops collapse to a compact single-line card; swipe Restore to expand' },
    { type: 'feature', text: 'Remove sends a stop to the Bucket List — accessible from the drawer menu' },
    { type: 'feature', text: 'Bucket List shows removed stops; tap + to re-add to any day, or trash to delete permanently (with confirmation)' },
    { type: 'feature', text: '"Move to Bucket List" button available inside each stop\'s detail page' },
  ]},
  { version: 'v243', title: 'Ripple fixed, next-leg travel info on stop pages', items: [
    { type: 'fix', text: 'Ripple when adding a vegan/search stop now correctly shifts following stops by the new stop\'s duration' },
    { type: 'feature', text: 'Each stop page shows the next stop name, drive time and distance (live from OSRM routing)' },
  ]},
  { version: 'v242', title: 'Fix false "already on itinerary" on place search', items: [
    { type: 'fix', text: '"Already on itinerary" no longer fires falsely — name-based substring matching removed, proximity check tightened to 80m' },
  ]},
  { version: 'v241', title: 'Search for any place and add to stops', items: [
    { type: 'feature', text: 'Search bar at top of Vegan view — type any place name to find it via Google Places' },
    { type: 'feature', text: 'Search results show rating, address, type and distance, then open the full detail page with photos, hours, reviews' },
    { type: 'feature', text: 'From the detail page, use "Add to day" to add the found place to your itinerary as a stop' },
  ]},
  { version: 'v240', title: 'Toolbar fixed, time picker stays open, Now buttons', items: [
    { type: 'fix', text: 'Toolbar now truly fixed to viewport bottom on planned stop pages (detail-overlay scroll restructured)' },
    { type: 'fix', text: 'Native time picker no longer closes mid-scroll — inputs update in-place without re-rendering the strip' },
    { type: 'fix', text: '"Arrived now" and "Departed now" are two clear buttons below the time strip (force-update if you still see the old layout)' },
  ]},
  { version: 'v239', title: 'Arrived/Departed now buttons, hotel cascade stop', items: [
    { type: 'fix', text: '"Arrived now" and "Departed now" are now two visible buttons below the time strip — no longer hidden as tiny icons' },
    { type: 'fix', text: 'Cascade stops at hotel/sleep stops — arriving early no longer incorrectly shifts next morning\'s departure' },
  ]},
  { version: 'v238', title: 'Fix departure cascade — anchor to original plan', items: [
    { type: 'fix', text: 'Departure cascade now anchors downstream stops to actual departure + original travel gaps — no longer compounds errors from earlier arrival cascades' },
    { type: 'fix', text: 'Setting departure to 11:24 with 1h55m travel to next stop now correctly shows next arrival as 13:19' },
  ]},
  { version: 'v237', title: 'Departure now + departure ripple fix', items: [
    { type: 'fix', text: 'Departure chip now has a "Now" clock button — sets departure to current time and ripples following stops' },
    { type: 'fix', text: 'Changing departure time now correctly ripples following stops (was only updating duration, not cascading)' },
  ]},
  { version: 'v236', title: 'Inline time picker, fixed stops, cascade fix', items: [
    { type: 'feature', text: 'Arrived and Depart chips now show inline time inputs — tap to pick a time using the native picker, or tap the clock to set to now' },
    { type: 'feature', text: 'Changing arrival auto-updates departure (keeps duration); changing departure auto-updates duration' },
    { type: 'fix', text: 'Teams Presentation at 16:00 is now a fixed anchor — cascade stops there and will not move it' },
    { type: 'fix', text: 'Cascade logic extracted into shared helper used by all time-editing flows' },
  ]},
  { version: 'v235', title: 'Arrived now ripples following stops', items: [
    { type: 'fix', text: '"Arrived now" now cascades the time delta to all following stops on the day' },
    { type: 'fix', text: 'Duration stepper (±5 min) now ripples following stops by the same amount' },
  ]},
  { version: 'v234', title: 'Toolbar fix, arrived-now, broader vegan search', items: [
    { type: 'fix', text: 'Toolbar now fixed to bottom of screen on vegan and charger detail pages' },
    { type: 'fix', text: '"Arrived now" sets your arrival time to the current time (was wrongly calculating duration)' },
    { type: 'fix', text: 'Travel action strip simplified — Skip stop only; time/duration handled by time strip' },
    { type: 'fix', text: 'Google Maps button readable in dark mode (was unreadable with brand-colour SVG)' },
    { type: 'fix', text: 'Vegan search now finds health food shops and cuisine=vegan venues (e.g. Hemp in Troyes)' },
  ]},
  { version: 'v233', title: 'Fix icons — safe CDN caching', items: [
    { type: 'fix', text: 'Icons restored — CDN fetch interception removed (was breaking Phosphor script loading)' },
    { type: 'feature', text: 'Leaflet and Phosphor pre-cached at SW install for offline use (cache-first on match)' },
    { type: 'feature', text: 'crossorigin=anonymous on CDN scripts so cached CORS responses are matched correctly' },
  ]},
  { version: 'v232', title: 'Offline resilience — icons & map cached', items: [
    { type: 'feature', text: 'Leaflet map library and Phosphor icons now cached offline at install' },
    { type: 'feature', text: 'CDN fonts/assets cached on first use — survive loss of signal' },
    { type: 'feature', text: 'Orange "No internet" banner when offline — shows cached content continues working' },
    { type: 'fix', text: 'App updates no longer auto-reload mid-journey — blue banner with Reload button instead' },
  ]},
  { version: 'v231', title: 'Navigation fix, time strip, map refresh', items: [
    { type: 'fix', text: 'navUrl function restored — Navigate buttons now work (were throwing ReferenceError)' },
    { type: 'fix', text: 'Apple Maps is the default; switch to Google Maps in Settings drawer' },
    { type: 'fix', text: 'Arrived/Depart chips now correctly open the time-entry sheet' },
    { type: 'fix', text: 'Pull-to-refresh on map view clears both vegan and charger caches' },
  ]},
  { version: 'v230', title: 'Google data, ratings on cards, font fixes', items: [
    { type: 'fix', text: 'Google photo now loads on planned stop detail pages' },
    { type: 'fix', text: 'Google rating shows in correct position (below name, not at top)' },
    { type: 'fix', text: 'Removed duplicate HappyCow/Google links on stop pages' },
    { type: 'feature', text: 'Star ratings from Google shown on day-view cards for food/vegan stops' },
    { type: 'design', text: 'Font sizes increased on vegan search result cards' },
    { type: 'design', text: 'Address, phone, website, opening hours use consistent styling on stop pages' },
  ]},
  { version: 'v229', title: 'Stop detail matches search results', items: [
    { type: 'fix', text: 'Toolbar Vegan/Charge buttons now open own search views (not PlugShare/HappyCow)' },
    { type: 'fix', text: 'Duration stepper: +/− buttons always visible, each tap commits immediately' },
    { type: 'fix', text: 'Time strip no longer duplicates rows on repeated taps' },
    { type: 'feature', text: 'Stop detail pages now show address, opening hours, phone, website' },
    { type: 'feature', text: 'HappyCow and Google Maps links shown in stop detail body' },
    { type: 'design', text: '"Set duration to now" button below time strip' },
  ]},
  { version: 'v228', title: 'Stop detail consistency & time strip', items: [
    { type: 'fix', text: 'Arrived / Duration / Departed time strip now works on stop pages' },
    { type: 'fix', text: 'Map pins for vegan & charger spots now render from session cache' },
    { type: 'fix', text: 'PlugShare and HappyCow removed from drawer menu' },
    { type: 'feature', text: 'HappyCow and Google Maps links added to food/vegan stop pages' },
    { type: 'design', text: 'Day-view cards show address subtitle for consistency with search results' },
  ]},
  { version: 'v227', title: 'Navigation, palette & stop timing', items: [
    { type: 'feature', text: 'Apple Maps navigation (switch to Google Maps in settings)' },
    { type: 'feature', text: 'Arrived / Duration / Departed time strip on stop pages' },
    { type: 'feature', text: 'Vegan & charger pins shown on map view' },
    { type: 'feature', text: 'Google Places data (photos, reviews) shown on planned food/vegan stops' },
    { type: 'design', text: 'Simplified colour palette — reduced accent colours throughout' },
    { type: 'design', text: 'Improved text contrast (text2/text3 opacity bumped)' },
    { type: 'design', text: 'Nearest stop chip now visible with strong glass background' },
    { type: 'fix', text: 'Removed PlugShare and HappyCow from drawer (use own lookup + per-page link)' },
  ]},
  {
    version: 'v226',
    title: 'Version panel with changelog',
    items: [
      { type: 'feature', text: 'Version menu now shows What\'s new — fix/feature/design entries per release' },
      { type: 'feature', text: 'Current release highlighted; older releases listed below' },
      { type: 'design',  text: 'System status section below changelog with async push refresh' },
    ],
  },
  {
    version: 'v225',
    title: 'Reviews, ratings & charger filter',
    items: [
      { type: 'fix',     text: 'Reviews no longer duplicate when revisiting a place' },
      { type: 'fix',     text: '"Opens HH:MM" shown when closed mid-day (not just "Closed")' },
      { type: 'feature', text: 'Star ratings and review counts shown on vegan list cards' },
      { type: 'feature', text: 'Charger min-kW stepper (default 50 kW); Tesla-compatible only' },
      { type: 'feature', text: 'Charger cards show connector types, price badge, bay count' },
      { type: 'design',  text: 'All toolbar icons white in dark mode — no accent colours' },
      { type: 'design',  text: 'Body base font raised to 17px; badges/labels all bumped up' },
    ],
  },
  {
    version: 'v224',
    title: 'Session cache & unified cards',
    items: [
      { type: 'feature', text: 'Vegan & charger results cached for session — instant on return' },
      { type: 'feature', text: 'Pull-to-refresh clears cache and re-fetches' },
      { type: 'design',  text: 'Itinerary stops use same card layout as nearby results' },
      { type: 'design',  text: 'Card names 17px, detail name 32px, badges 12px' },
    ],
  },
  {
    version: 'v223',
    title: 'Photos, toolbar pinned & reviews',
    items: [
      { type: 'fix',     text: 'Google Place photos now display correctly' },
      { type: 'fix',     text: 'Pill toolbar always visible — no longer scrolls away' },
      { type: 'fix',     text: 'Reviews sorted latest-first (not by relevance)' },
      { type: 'design',  text: 'Toolbar icon base colour raised to full white' },
    ],
  },
];
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
  navApp: 'apple',      // 'apple' | 'google'
  overrides: {},        // stopId → time string
  checked: {},          // stopId → bool (visited)
  skipped: {},          // stopId → bool (deliberately skipped)
  removed: {},          // stopId → true (hidden from timeline, moved to bucket list)
  bucketList: [],       // [{ stop, dayLabel, originalDayId, removedAt }]
  typeFilter: new Set(), // types to show; empty = all
  locOverrides: {},     // stopId → { name, lat, lng }
  durOverrides: {},     // stopId → minutes
  typeOverrides: {},    // stopId → type string
  priorityOverrides: {}, // stopId → 0-3
  reasonOverrides: {},  // stopId → string
  veganOverrides: {},   // stopId → bool
  addedStops: {},       // dayId → [stop, ...]
  crossDayMoves: {},    // stopId → dayId (stops moved to a different day by cascade overflow)
  customTags: [],       // user-defined type strings
  fixedOverrides: {},   // stopId → bool (true = fixed anchor, false = explicitly flexible)
  /* Auth / multi-user */
  userId:          null,
  userName:        null,
  isOwner:         false,
  memberRole:      'viewer',   // 'editor' | 'viewer'
  /* Personal state (per-user, not shared) */
  personalStops:   {},   // dayId → [stop, ...]
  personalTickets: {},   // showingId → bool (user has ticket)
  personalPinned:  {},   // stopId → bool (absorb ripple)
  notifLeadMins:      {},   // stopId → int (minutes before departBy to notify; default 30)
  ownerCurrentStopId: null, // shared: owner's last checked-in stop (drives group "Now" display)
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
function getStopDuration(stop) {
  if (getStopType(stop) === 'depart') return 0;
  return state.durOverrides[stop.id] ?? stop.duration ?? 30;
}
function getStopType(stop)     { return state.typeOverrides[stop.id]     ?? stop.type; }
function isStopFixed(stop)     {
  if (!stop) return false;
  if (stop.id in (state.fixedOverrides || {})) return state.fixedOverrides[stop.id];
  return stop.fixed === true;
}
function isPinned(stopId) { return !!(state.personalPinned || {})[stopId]; }
function hasTicket(stop)  { return (state.personalTickets || {})[stop.id] ?? stop.ticketed ?? false; }
function canUnpin()       { return state.isOwner || state.memberRole === 'editor'; }
function getNotifLead(stopId) { return state.notifLeadMins?.[stopId] ?? 30; }
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
  shopping:     'ph-shopping-bag',
  showing:      'ph-film-strip',
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
  if (day.isFestival && day.dateEnd) return 'Fest';
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return names[new Date(day.date + 'T00:00:00').getDay()];
}
/* Local-timezone date string — avoids UTC offset shifting "today" by hours */
function localDateStr(d) {
  const dt = d || new Date();
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function findTodayDayId() {
  const today = localDateStr();
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
    scenic:'Scenic', historic:'Historic', festival:'Festival',
    shopping:'Shopping', showing:'Showing' }[type] || type;
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
  const today = localDateStr();
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
const VAPID_PUBLIC_KEY = 'BNvSQJpqlgvQw-dEAH21uUZR-ehcDFYoq77I40RgNMppVbkFmGbOi7QClKANJ51ShZ4FQ5ajncmvPumLLp93K0Q';

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
  if (!('PushManager' in window) || !getDb()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    // Re-subscribe whenever VAPID key changes — track by full key hash
    const storedKeyVer = localStorage.getItem('vapid_key_ver');
    const currentKeyVer = 'v2-' + VAPID_PUBLIC_KEY.slice(-8);
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
    await getDb().ref(`pushSubs/${getDeviceId()}`).set(JSON.parse(JSON.stringify(sub)));
  } catch (e) { console.warn('Push subscribe failed', e); }
}

async function writePushQueue() {
  if (!getDb() || !state.notifsEnabled || !notifGranted()) return;
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
  const deviceRef = getDb().ref(`pushQueue/${getDeviceId()}`);
  const snap = await deviceRef.once('value');
  const existing = snap.val() || {};
  const updates = {};
  // Remove stale sched_ entries not in the new set
  Object.keys(existing).filter(k => k.startsWith('sched_') && !newEntries[k]).forEach(k => { updates[k] = null; });
  Object.assign(updates, newEntries);
  if (Object.keys(updates).length) await deviceRef.update(updates);
}

async function scheduleHourlyCountdown() {
  if (!getDb() || !state.notifsEnabled || !notifGranted()) return;
  const day1 = TRIP_DATA.days.find(d => d.id === 'day1');
  if (!day1) return;
  // Departure = first stop of Day 1 (read its time field)
  const firstStop = day1.stops?.[0];
  const firstTime = firstStop?.time || '10:30';
  const departureMs = new Date(day1.date + 'T' + firstTime + ':00').getTime();
  const nowMs = Date.now();
  if (nowMs >= departureMs) return;

  const deviceRef = getDb().ref(`pushQueue/${getDeviceId()}`);
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
  if (!getDb()) { showToast('Firebase not connected'); return; }
  await subscribePush();
  const key = 'test_' + Date.now();
  await getDb().ref(`pushQueue/${getDeviceId()}/${key}`).set({
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
let _serverPushStatus = 'warn';
let _serverPushNote   = 'Checking…';
async function refreshServerPushStatus() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      _serverPushStatus = 'error'; _serverPushNote = 'Push not supported'; return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) {
      _serverPushStatus = 'warn'; _serverPushNote = 'No push subscription — tap "Send test push" to subscribe'; return;
    }
    if (getDb()) {
      const snap = await getDb().ref(`pushSubs/${getDeviceId()}`).once('value');
      if (snap.exists()) {
        _serverPushStatus = 'ok'; _serverPushNote = 'Subscribed + registered in Firebase';
      } else {
        _serverPushStatus = 'warn'; _serverPushNote = 'Local subscription exists but not in Firebase';
      }
    } else {
      _serverPushStatus = 'warn'; _serverPushNote = 'Subscribed locally — Firebase not connected';
    }
  } catch (e) {
    _serverPushStatus = 'warn'; _serverPushNote = 'Cannot verify — use test push to check';
  }
}

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
    { cat:'Data',          name:'Firebase sync',                    status: getDb() ? 'ok' : 'error',                                       note: getDb() ? 'Connected — shared state live' : 'Not connected' },
    { cat:'Photos',        name:'Google Places photo pipeline',     status: placesTotal === 0 ? 'warn' : placesWithPhotos > 0 ? 'ok' : 'warn', note: `${placesWithPhotos} of ${placesTotal} stops have photos cached` },
    { cat:'Photos',        name:'Wikipedia article photos',         status: wikiCached > 0 ? 'ok' : 'warn',                            note: `${wikiCached} articles cached` },
    { cat:'Photos',        name:'Street View / Satellite fallback', status:'ok',                                                         note:'Always available via Google Static Maps' },
    { cat:'Weather',       name:'Open-Meteo forecast',              status: weatherCached > 0 ? 'ok' : 'warn',                          note: `${weatherCached} day(s) cached` },
    { cat:'Notifications', name:'Notification permission',          status: notifPerm === 'granted' ? 'ok' : notifPerm === 'denied' ? 'error' : 'warn', note: notifPerm },
    { cat:'Notifications', name:'Departure alerts',                 status: state.notifsEnabled && notifPerm === 'granted' ? 'ok' : 'warn', note: state.notifsEnabled ? 'Enabled' : 'Disabled in settings' },
    { cat:'Notifications', name:'Push API (browser support)',       status: hasPush ? 'ok' : 'error',                                   note: hasPush ? 'PushManager available' : 'PushManager not available' },
    { cat:'Notifications', name:'Server push (Cloud Function)',     status: _serverPushStatus, note: _serverPushNote },
    { cat:'SW / Cache',    name:'Service Worker support',           status: hasSW ? 'ok' : 'error',                                     note: hasSW ? 'serviceWorker in navigator' : 'Not supported' },
    { cat:'SW / Cache',    name:'Service Worker active',            status: swCtrl ? 'ok' : 'warn',                                     note: swCtrl ? `Active (cache ${APP_VERSION})` : 'Not yet controlling — reload after first install' },
    { cat:'SW / Cache',    name:'Offline / PWA cache',              status: swCtrl ? 'ok' : 'warn',                                     note: swCtrl ? 'Core assets cached' : 'SW not active yet' },
  ];
}

function renderChangelogHtml() {
  const typeIcon  = { fix:'ph-wrench', feature:'ph-sparkle', design:'ph-paint-brush' };
  const typeLabel = { fix:'Fix', feature:'New', design:'Design' };
  const typeClass = { fix:'cl-fix', feature:'cl-feature', design:'cl-design' };
  return CHANGELOG.map((rel, i) => `
    <div class="cl-release${i === 0 ? ' cl-release-latest' : ''}">
      <div class="cl-release-header">
        <span class="cl-ver">${rel.version}</span>
        <span class="cl-title">${rel.title}</span>
        ${i === 0 ? '<span class="cl-current-badge">Current</span>' : ''}
      </div>
      <div class="cl-items">
        ${rel.items.map(item => `
          <div class="cl-item">
            <span class="cl-badge ${typeClass[item.type] || ''}"><i class="ph ${typeIcon[item.type] || 'ph-dot'}"></i> ${typeLabel[item.type] || item.type}</span>
            <span class="cl-text">${item.text}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function renderFeatureStatusHtml(statuses) {
  const cats   = [...new Set(statuses.map(f => f.cat))];
  const iconMap = { ok:'ph-check-circle', warn:'ph-warning', error:'ph-x-circle' };
  const colMap  = { ok:'vs-ok', warn:'vs-warn', error:'vs-error' };
  return cats.map(cat => {
    const items = statuses.filter(f => f.cat === cat);
    return `<div class="vs-cat-label">${cat}</div>${items.map(f => `
      <div class="vs-item">
        <i class="ph ${iconMap[f.status]} ${colMap[f.status]}"></i>
        <div class="vs-item-text">
          <div class="vs-item-name">${f.name}</div>
          <div class="vs-item-note">${f.note}</div>
        </div>
      </div>`).join('')}`;
  }).join('');
}

function showVersionPanel() {
  const panel = document.getElementById('version-overlay');
  if (!panel) return;
  panel.classList.remove('hidden');
  requestAnimationFrame(() => panel.classList.add('open'));

  const body = document.getElementById('version-body');
  if (!body) return;

  // Render changelog immediately, then feature status (async push check)
  const statuses = getFeatureStatuses();
  body.innerHTML =
    `<div class="cl-section-label">What's new</div>` +
    renderChangelogHtml() +
    `<div class="cl-section-label cl-section-status">System status</div>` +
    renderFeatureStatusHtml(statuses);

  // Refresh push status async and update status section only
  refreshServerPushStatus().then(() => {
    const updated = getFeatureStatuses();
    const statusSection = body.querySelector('.cl-section-status');
    if (statusSection) {
      // Replace everything from status label onwards
      const idx = [...body.children].indexOf(statusSection);
      while (body.children.length > idx + 1) body.lastChild.remove();
      body.insertAdjacentHTML('beforeend', renderFeatureStatusHtml(updated));
    }
  });
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
    today: localDateStr(),
    currentDayId: state.currentDayId,
    cardView: state.cardView,
    notifsEnabled: state.notifsEnabled,
    notifPermission: typeof Notification !== 'undefined' ? Notification.permission : 'N/A',
    pushAPISupported: 'PushManager' in window,
    pushEndpoint,
    firebaseConnected: !!getDb(),
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
  if (getDb()) {
    try {
      const deviceId = getDeviceId();
      const [subSnap, qSnap] = await Promise.all([
        getDb().ref(`pushSubs/${deviceId}`).once('value'),
        getDb().ref(`pushQueue/${deviceId}`).once('value'),
      ]);
      const errSnap = await getDb().ref(`pushErrors/${deviceId}`).limitToLast(5).once('value');
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

let _detailConfirmTimer = null;
function showDetailConfirm(container, msg) {
  let el = container.querySelector('.detail-confirm-msg');
  if (!el) {
    el = document.createElement('span');
    el.className = 'detail-confirm-msg';
    container.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_detailConfirmTimer);
  _detailConfirmTimer = setTimeout(() => el.classList.remove('visible'), 2000);
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
  const today = localDateStr();
  const events = [];
  for (const day of TRIP_DATA.days) {
    const covers = day.date === today ||
      (day.isFestival && today >= day.date && today <= (day.dateEnd || day.date));
    if (!covers) continue;
    const stops = getDayStops(day).filter(s => !state.skipped[s.id]);
    // Travel-aware departure reminder for each stop → next stop
    for (let i = 0; i < stops.length - 1; i++) {
      const stop = stops[i];
      const next = stops[i + 1];
      if (getStopType(stop) === 'depart') continue; // handled separately below
      const nextMins = timeToMinutes(getStopTime(next));
      if (nextMins === null) continue;
      const travelKey = _travelKey(stop, next);
      const travelMins = _travelCache[travelKey] ?? 0;
      const departBy = nextMins - travelMins;
      const lead = getNotifLead(stop.id);
      const travelStr = travelMins > 0 ? ` (~${travelMins} min drive)` : '';
      events.push({
        stop,
        notifMins: departBy - lead,
        label: `Leave ${getStopName(stop)} for ${getStopName(next)}${travelStr}`,
      });
    }
    // Depart stops: notify 15 min before departure time
    for (const stop of stops) {
      if (getStopType(stop) !== 'depart') continue;
      const m = timeToMinutes(getStopTime(stop));
      if (m !== null) events.push({ stop, notifMins: m - 15, label: `Departing from ${getStopName(stop)}` });
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

/* ── Showing stop meta (ticket toggle + arrive-by) ─────────────────── */
function buildShowingMeta(stop) {
  const ticketed = hasTicket(stop);
  const timeMins = timeToMinutes(getStopTime(stop));
  const bufferMins = ticketed ? 20 : 120;
  const arriveMins = timeMins !== null ? timeMins - bufferMins : null;
  const arriveStr  = arriveMins !== null ? minutesToTime(arriveMins) : null;
  const venue = stop.location || '';
  return `<div class="showing-meta">
    ${venue ? `<span style="font-size:12px;color:var(--text2)">${venue}</span>` : ''}
    <button class="ticket-badge ${ticketed ? 'have' : 'queuing'}" data-toggle-ticket="${stop.id}" onclick="toggleTicket('${stop.id}',event)">
      <i class="ph ph-ticket"></i> ${ticketed ? 'Have ticket' : 'Queuing'}
    </button>
    ${arriveStr ? `<span class="arrive-by-pill"><i class="ph ph-clock"></i> Arrive by ${arriveStr}</span>` : ''}
  </div>`;
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

    // Step 2: Place Details to get photo references + opening hours
    const detailRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { 'X-Goog-Api-Key': GKEY, 'X-Goog-FieldMask': 'photos,regularOpeningHours' },
    });
    if (!detailRes.ok) return [];
    const detailData = await detailRes.json();
    const refs = detailData.photos || [];
    const openingHours = detailData.regularOpeningHours?.periods || null;
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

    _placesCache[stop.id] = { placeId, photos, attributions, openingHours, ts: Date.now() };
    savePlacesCache();
    return photos;
  } catch { return []; }
}

/* Returns 'open'|'closed'|'unknown' for a stop at a given "HH:MM" time on a given JS Date */
function isStopOpenAt(stop, timeStr, date) {
  const periods = _placesCache[stop.id]?.openingHours;
  if (!periods) return 'unknown';
  const mins = timeToMinutes(timeStr);
  if (mins === null) return 'unknown';
  const dayOfWeek = date.getDay(); // 0=Sun
  const h = Math.floor(mins / 60), m = mins % 60;
  const nowTotal = h * 60 + m;

  for (const p of periods) {
    const openDay  = p.open?.day  ?? -1;
    const openH    = p.open?.hour ?? 0;
    const openM    = p.open?.minute ?? 0;
    const closeDay = p.close?.day ?? p.open?.day ?? -1;
    const closeH   = p.close?.hour ?? 23;
    const closeM   = p.close?.minute ?? 59;

    if (openDay !== dayOfWeek) continue;
    const openTotal  = openH  * 60 + openM;
    const closeTotal = closeH * 60 + closeM + (closeDay !== openDay ? 1440 : 0);
    if (nowTotal >= openTotal && nowTotal <= closeTotal) return 'open';
  }
  // No period matched
  return 'closed';
}

/* Fetch opening hours for a stop that already has a placeId but no hours cached */
async function fetchOpeningHours(stop) {
  const cached = _placesCache[stop.id];
  if (!cached?.placeId) return null;
  if (cached.openingHours !== undefined) return cached.openingHours;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${cached.placeId}`, {
      headers: { 'X-Goog-Api-Key': GKEY, 'X-Goog-FieldMask': 'regularOpeningHours' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const periods = data.regularOpeningHours?.periods || null;
    _placesCache[stop.id] = { ...cached, openingHours: periods };
    savePlacesCache();
    return periods;
  } catch { return null; }
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
  const added = [
    ...((state.addedStops || {})[day.id] || []),
    ...((state.personalStops || {})[day.id] || []),
  ];
  const crossMoves = state.crossDayMoves || {};

  const removed = state.removed || {};
  // Base stops for this day, excluding any moved to a different day or removed to bucket
  const baseStops = day.stops.filter(s => {
    if (removed[s.id]) return false;
    const movedTo = crossMoves[s.id];
    return !movedTo || movedTo === day.id;
  });
  const addedFiltered = added.filter(s => {
    if (removed[s.id]) return false;
    const movedTo = crossMoves[s.id];
    return !movedTo || movedTo === day.id;
  });

  // Stops moved INTO this day from another day
  const movedIn = [];
  Object.entries(crossMoves).forEach(([stopId, targetDayId]) => {
    if (targetDayId !== day.id) return;
    for (const d of TRIP_DATA.days) {
      const s = d.stops.find(s => s.id === stopId)
             || ((state.addedStops || {})[d.id] || []).find(s => s.id === stopId);
      if (s) { movedIn.push(s); return; }
    }
  });

  const all = [...baseStops, ...addedFiltered, ...movedIn];
  return all.sort((a, b) => {
    const ta = timeToMinutes(getStopTime(a)), tb = timeToMinutes(getStopTime(b));
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return ta - tb;
  });
}

function _doInjectStopPhotos(stopId) {
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

function injectStopPhotos(stopId) {
  const item = document.getElementById(`stop-${stopId}`);
  if (!item) {
    // Card may be mid-render (e.g. sync re-render); retry after a frame
    requestAnimationFrame(() => _doInjectStopPhotos(stopId));
    return;
  }
  _doInjectStopPhotos(stopId);
}

// Keep old name as alias for detail page calls
const injectWikiPhoto = injectStopPhotos;

function updateDepartByPill(stop, nextStop) {
  const el = document.querySelector(`[data-departby="${stop.id}"]`);
  if (!el || !nextStop) return;
  const travelMins = _travelCache[_travelKey(stop, nextStop)];
  if (travelMins == null) return;
  const nextMins = timeToMinutes(getStopTime(nextStop));
  if (nextMins === null) return;
  const departBy = nextMins - travelMins;
  const lead = getNotifLead(stop.id);
  el.classList.remove('hidden');
  el.innerHTML = `<i class="ph ph-car-simple"></i> Depart by <strong>${minutesToTime(departBy)}</strong><span class="depart-travel-mins"> · ~${travelMins} min</span><button class="depart-lead-btn" data-stop-id="${stop.id}" onclick="openLeadTimePicker('${stop.id}',this,event)" title="Reminder ${lead} min before departure"><i class="ph ph-bell"></i> ${lead}m</button>`;
}

function openLeadTimePicker(stopId, anchorEl, e) {
  e && e.stopPropagation();
  const existing = document.getElementById('lead-picker-pop');
  if (existing) { existing.remove(); return; }
  const cur = getNotifLead(stopId);
  const pop = document.createElement('div');
  pop.id = 'lead-picker-pop';
  pop.className = 'lead-picker-pop';
  pop.innerHTML = `
    <div class="lead-picker-label">Remind me before departure</div>
    <div class="lead-picker-row">
      <button class="lead-picker-step" data-delta="-5">−5</button>
      <span class="lead-picker-val">${cur} min</span>
      <button class="lead-picker-step" data-delta="5">+5</button>
    </div>`;
  pop.querySelectorAll('.lead-picker-step').forEach(btn => {
    btn.addEventListener('click', e2 => {
      e2.stopPropagation();
      const delta = parseInt(btn.dataset.delta);
      const newVal = Math.max(5, Math.min(120, getNotifLead(stopId) + delta));
      if (!state.notifLeadMins) state.notifLeadMins = {};
      state.notifLeadMins[stopId] = newVal;
      save();
      pop.querySelector('.lead-picker-val').textContent = newVal + ' min';
      // Update the bell button label
      const bell = document.querySelector(`.depart-lead-btn[data-stop-id="${stopId}"]`);
      if (bell) bell.innerHTML = `<i class="ph ph-bell"></i> ${newVal}m`;
      scheduleNotifs();
    });
  });
  document.body.appendChild(pop);
  const rect = anchorEl.getBoundingClientRect();
  pop.style.position = 'fixed';
  pop.style.top  = (rect.bottom + 6) + 'px';
  pop.style.left = Math.min(rect.left, window.innerWidth - 200) + 'px';
  const dismiss = ev => { if (!pop.contains(ev.target) && ev.target !== anchorEl) { pop.remove(); document.removeEventListener('click', dismiss); } };
  setTimeout(() => document.addEventListener('click', dismiss), 0);
}

function lazyLoadWikiImages(stops) {
  stops.forEach(stop => {
    const type = getStopType(stop);
    if (type === 'depart' || type === 'charging') return;
    // Kick off Places fetch; inject photos when it resolves
    if (_placesCache[stop.id]?.photos?.length) {
      requestAnimationFrame(() => injectStopPhotos(stop.id));
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
  shopping:     ['#f472b6','#831843'],
  showing:      ['#c084fc','#3b0764'],
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

function saveWeatherCache() {
  try {
    const serialisable = {};
    for (const [dayId, entry] of Object.entries(_weatherCache)) {
      if (!entry.map) continue;
      const mapObj = {};
      entry.map.forEach((hourMap, date) => {
        mapObj[date] = {};
        hourMap.forEach((w, hour) => { mapObj[date][hour] = w; });
      });
      serialisable[dayId] = { ts: entry.ts, map: mapObj };
    }
    localStorage.setItem('annecy_weather_v1', JSON.stringify(serialisable));
  } catch(e) {}
}

function loadWeatherCache() {
  try {
    const saved = localStorage.getItem('annecy_weather_v1');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    for (const [dayId, entry] of Object.entries(parsed)) {
      const map = new Map();
      for (const [date, hours] of Object.entries(entry.map)) {
        const hourMap = new Map();
        for (const [hour, w] of Object.entries(hours)) hourMap.set(Number(hour), w);
        map.set(date, hourMap);
      }
      _weatherCache[dayId] = { ts: entry.ts, map };
    }
  } catch(e) {}
}

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
    saveWeatherCache();
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
  const today = localDateStr();
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
function navUrl(name, address, lat, lng) {
  const dest = [name, address].filter(Boolean).join(', ');
  if (state.navApp !== 'google') {
    const q = encodeURIComponent(dest || `${lat},${lng}`);
    return `maps://?daddr=${q}&dirflg=d`;
  }
  const gdest = dest ? encodeURIComponent(dest) : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${gdest}&travelmode=driving`;
}
function teslaNavUrl(stop) {
  return navUrl(stop.name, stop.address, stop.lat, stop.lng);
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
    localStorage.setItem('annecy_skipped',            JSON.stringify(state.skipped));
    localStorage.setItem('annecy_loc_overrides',      JSON.stringify(state.locOverrides));
    localStorage.setItem('annecy_dur_overrides',      JSON.stringify(state.durOverrides));
    localStorage.setItem('annecy_type_overrides',     JSON.stringify(state.typeOverrides));
    localStorage.setItem('annecy_priority_overrides', JSON.stringify(state.priorityOverrides));
    localStorage.setItem('annecy_reason_overrides',   JSON.stringify(state.reasonOverrides));
    localStorage.setItem('annecy_vegan_overrides',    JSON.stringify(state.veganOverrides));
    localStorage.setItem('annecy_added_stops',        JSON.stringify(state.addedStops));
    localStorage.setItem('annecy_cross_day_moves',    JSON.stringify(state.crossDayMoves || {}));
    localStorage.setItem('annecy_removed',            JSON.stringify(state.removed || {}));
    localStorage.setItem('annecy_bucket_list',        JSON.stringify(state.bucketList || []));
    localStorage.setItem('annecy_custom_tags',        JSON.stringify(state.customTags || []));
    localStorage.setItem('annecy_fixed_overrides',    JSON.stringify(state.fixedOverrides || {}));
    localStorage.setItem('annecy_personal_stops',    JSON.stringify(state.personalStops  || {}));
    localStorage.setItem('annecy_personal_tickets',  JSON.stringify(state.personalTickets || {}));
    localStorage.setItem('annecy_personal_pinned',   JSON.stringify(state.personalPinned  || {}));
    localStorage.setItem('annecy_notif_lead',         JSON.stringify(state.notifLeadMins   || {}));
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
    const sk = localStorage.getItem('annecy_skipped'); if (sk) state.skipped = JSON.parse(sk);
    if (lo) state.locOverrides      = JSON.parse(lo);
    if (du) state.durOverrides      = JSON.parse(du);
    if (ty) state.typeOverrides     = JSON.parse(ty);
    if (pr) state.priorityOverrides = JSON.parse(pr);
    if (re) state.reasonOverrides   = JSON.parse(re);
    if (ve) state.veganOverrides    = JSON.parse(ve);
    if (as) state.addedStops        = JSON.parse(as);
    const cdm = localStorage.getItem('annecy_cross_day_moves');
    if (cdm) state.crossDayMoves = JSON.parse(cdm);
    const rm = localStorage.getItem('annecy_removed');
    if (rm) state.removed = JSON.parse(rm);
    const bl = localStorage.getItem('annecy_bucket_list');
    if (bl) state.bucketList = JSON.parse(bl);
    const ct = localStorage.getItem('annecy_custom_tags');
    if (ct) state.customTags = JSON.parse(ct);
    const fx = localStorage.getItem('annecy_fixed_overrides');
    if (fx) state.fixedOverrides = JSON.parse(fx);
    const ps = localStorage.getItem('annecy_personal_stops');
    if (ps) state.personalStops = JSON.parse(ps);
    const pt = localStorage.getItem('annecy_personal_tickets');
    if (pt) state.personalTickets = JSON.parse(pt);
    const pp = localStorage.getItem('annecy_personal_pinned');
    if (pp) state.personalPinned = JSON.parse(pp);
    const nl = localStorage.getItem('annecy_notif_lead');
    if (nl) state.notifLeadMins = JSON.parse(nl);
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
    const today = localDateStr();
    const isTodayChip = day.isCountdown
      ? today <= day.dateEnd
      : (day.isFestival && day.dateEnd)
        ? (today >= day.date && today <= day.dateEnd)
        : today === day.date;
    const isPast = !day.isCountdown && !(day.isFestival && day.dateEnd) && day.date < today;
    if (isTodayChip) chip.classList.add('today');
    if (isPast)      chip.classList.add('past');
    const dateStr = day.isCountdown ? 'soon' : (day.isFestival && day.dateEnd) ? '20–27' : formatDate(day.date);
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
  state.typeFilter = new Set(); // clear filter when switching days
  if (!['day','map'].includes(state.currentView)) state.currentView = 'day';
  updateDayStrip();
  const isToday = dayId === findTodayDayId();
  renderView(isToday);
  const day = TRIP_DATA.days.find(d => d.id === dayId);
  if (day) precomputeTravelTimes(day);
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
  updateFilterBtn();
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
    // Update bucket badge
    const _bucketBadge = document.getElementById('bucket-badge');
    if (_bucketBadge) _bucketBadge.textContent = state.bucketList.length > 0 ? state.bucketList.length : '';
    if (state.currentView === 'bucket')        { setBgClass(null); renderBucketView(tl); return; }
    else if (state.currentView === 'overview') { setBgClass(null); renderOverview(tl); }
    else if (state.currentView === 'vegan')    { setBgClass(null); renderVeganView(tl); }
    else if (state.currentView === 'charging') { setBgClass(null); renderChargerView(tl); }
    else if (state.currentView === 'find')     { setBgClass(null); renderFindView(tl); return; }
    else if (state.currentView === 'more')     { setBgClass(null); renderMoreView(tl); return; }
    else if (state.cardView === 'calendar') renderCalView(tl);
    else {
      // Inject GPS chip before timeline if not present
      let _gpsChip = document.getElementById('gps-nearest-chip');
      if (!_gpsChip) {
        _gpsChip = document.createElement('div');
        _gpsChip.id = 'gps-nearest-chip';
        _gpsChip.className = 'gps-nearest-chip hidden';
        tl.parentElement.insertBefore(_gpsChip, tl);
      }
      renderNearestStopChip();
      renderTimeline(tl, scrollToNow);
    }
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
    renderNearestStopChip();
    // On first fix: refresh vegan/charger/find view if open (renders before GPS is ready)
    if (firstFix && (state.currentView === 'vegan' || state.currentView === 'charging' || state.currentView === 'find')) {
      const tl = document.getElementById('timeline');
      if (tl) renderView(false);
    }
    // Refresh Now panel if on today's day view
    if (state.currentView === 'day') {
      const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
      if (day) { const tl = document.getElementById('timeline'); if (tl) renderNowPanel(tl, day); }
    }
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

function renderNearestStopChip() {
  const chip = document.getElementById('gps-nearest-chip');
  if (!chip || _userLat === null) { chip?.classList.add('hidden'); return; }
  const today = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!today || today.isCountdown) { chip.classList.add('hidden'); return; }
  const active = getDayStops(today).filter(s => !state.skipped[s.id] && s.lat && s.lng);
  if (!active.length) { chip.classList.add('hidden'); return; }
  let nearest = null, bestDist = Infinity;
  active.forEach(s => {
    const d = haversineM(_userLat, _userLng, s.lat, s.lng);
    if (d < bestDist) { bestDist = d; nearest = s; }
  });
  if (!nearest || bestDist > 50000) { chip.classList.add('hidden'); return; }
  const distStr = bestDist < 1000 ? `${Math.round(bestDist)}m` : `${(bestDist / 1000).toFixed(1)}km`;
  chip.classList.remove('hidden');
  chip.innerHTML = `<i class="ph ph-map-pin-simple-area"></i> ${distStr} from ${getStopName(nearest)}`;
  chip.onclick = () => openDetail(nearest);
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

function getCurrentStop(day) {
  const stops = getDayStops(day).filter(s => !state.skipped[s.id] && !state.removed[s.id] && getStopType(s) !== 'depart');
  if (!stops.length) return null;
  // 1. GPS: nearest stop within 500 m
  if (_userLat && _userLng) {
    const candidates = stops.filter(s => s.lat && s.lng)
      .map(s => ({ s, d: haversineM(_userLat, _userLng, s.lat, s.lng) }))
      .sort((a, b) => a.d - b.d);
    if (candidates.length && candidates[0].d < 500) return candidates[0].s;
  }
  // 2. Owner's last check-in (synced via shared state)
  if (state.ownerCurrentStopId) {
    const s = stops.find(s => s.id === state.ownerCurrentStopId);
    if (s) return s;
  }
  // 3. Time-based: last stop whose scheduled time has passed
  const now = nowMinutes();
  const passed = stops.filter(s => (timeToMinutes(getStopTime(s)) ?? Infinity) <= now);
  return passed[passed.length - 1] || stops[0];
}

function renderNowPanel(container, day) {
  const existing = document.getElementById('now-panel');
  if (existing) existing.remove();

  const current = getCurrentStop(day);
  if (!current) return;

  const stops = getDayStops(day).filter(s => !state.skipped[s.id] && !state.removed[s.id] && getStopType(s) !== 'depart');
  const curIdx = stops.findIndex(s => s.id === current.id);
  const next   = stops[curIdx + 1] || null;

  const arrTime   = getStopTime(current);
  const arrMins   = timeToMinutes(arrTime);
  const durMins   = getStopDuration(current);
  const leaveInfo = leaveByInfo(current);

  let nextHtml = '';
  if (next) {
    const tKey     = _travelKey(current, next);
    const travelM  = _travelCache[tKey];
    const nextTime = getStopTime(next);
    const nextMins = timeToMinutes(nextTime);
    const departM  = (travelM != null && nextMins != null) ? nextMins - travelM : null;
    const travelStr = travelM != null ? `~${travelM} min drive` : '';
    const departStr = departM != null ? `Depart ${minutesToTime(departM)}` : '';
    const arrStr   = nextTime && timeToMinutes(nextTime) !== null ? `Arrive ${nextTime}` : '';
    nextHtml = `
      <div class="now-next">
        <div class="now-next-label"><i class="ph ph-arrow-down"></i> Next stop</div>
        <div class="now-next-name">${stopTypeIcon(next)} ${getStopName(next)}</div>
        <div class="now-next-timing">${[travelStr, departStr, arrStr].filter(Boolean).join(' · ')}</div>
      </div>`;
  }

  const checkedIn = !!state.checked[current.id];
  const arrivedStr = checkedIn && arrTime && timeToMinutes(arrTime) !== null
    ? `Arrived ${arrTime}`
    : (arrTime && timeToMinutes(arrTime) !== null ? `Scheduled ${arrTime}` : '');
  const leaveStr = leaveInfo ? leaveInfo.label : (arrMins !== null && durMins ? `Leave by ${minutesToTime(arrMins + durMins)}` : '');

  const panel = document.createElement('div');
  panel.id = 'now-panel';
  panel.className = 'now-panel glass';
  panel.innerHTML = `
    <div class="now-here">
      <div class="now-here-label"><i class="ph ph-map-pin-simple-area"></i> You are at</div>
      <div class="now-here-row">
        <div class="now-here-name">${getStopName(current)}</div>
        <a class="now-navigate-btn" href="${navUrl(current.location, current.address, current.lat, current.lng)}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i></a>
      </div>
      <div class="now-timing">${[arrivedStr, leaveStr].filter(Boolean).join(' · ')}</div>
    </div>
    ${nextHtml}`;

  container.insertBefore(panel, container.firstChild);
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

// Tracked Leaflet layers so we can update them in-place
let _mapMarkerLayer  = null;
let _mapRouteLayer   = null;

function renderMapView() {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!day) return;

  const container = document.getElementById('map-container');

  // All stops for this day (base + user-added), in original order
  const allDayStops = [...(day.stops || []), ...(state.addedStops?.[day.id] || [])]
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  const stops       = allDayStops.filter(s => s.lat && s.lng);
  const activeStops = stops.filter(s => !state.skipped[s.id]);

  // Destroy map only when the day changes
  if (_leafletMap && _mapDayId !== state.currentDayId) {
    _leafletMap.remove();
    _leafletMap = null; _mapMarkerLayer = null; _mapRouteLayer = null;
    _locMarker = null; _locCircle = null;
    container.innerHTML = '';
  }

  const isDark = !document.body.classList.contains('light');
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  // Countdown day: no route stops, just show user location
  if (!stops.length) {
    if (!_leafletMap) {
      const fallback = L.map(container, { zoomControl: false, attributionControl: false });
      _leafletMap = fallback;
      _mapDayId   = state.currentDayId;
      L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(fallback);
      L.control.zoom({ position: 'topright' }).addTo(fallback);
      fallback.setView([51.0333, -2.5333], 10);
      if (_userLat !== null) { fallback.setView([_userLat, _userLng], 13); updateLocMarker(500); }
      buildAndAppendPOIWrap(container, day);
      startLocationWatch();
    } else {
      _leafletMap.invalidateSize();
    }
    return;
  }

  // ── First build ────────────────────────────────────────────────────
  if (!_leafletMap) {
    const map = L.map(container, { zoomControl: false, attributionControl: false });
    _leafletMap = map;
    _mapDayId   = state.currentDayId;
    L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    if (_userLat !== null) updateLocMarker(200);
    startLocationWatch();
    buildAndAppendPOIWrap(container, day);
  } else {
    _leafletMap.invalidateSize();
  }

  const map = _leafletMap;

  // ── Fit bounds to active stops ─────────────────────────────────────
  const boundsStops = activeStops.length >= 2 ? activeStops : stops;
  map.fitBounds(
    L.latLngBounds(boundsStops.map(s => [getStopLat(s), getStopLng(s)])),
    { paddingTopLeft: [32, 48], paddingBottomRight: [32, 160] }
  );

  // ── Markers: remove old layer, draw fresh (active stops only) ───────
  if (_mapMarkerLayer) { _mapMarkerLayer.remove(); _mapMarkerLayer = null; }
  const markerGroup = L.layerGroup().addTo(map);
  _mapMarkerLayer = markerGroup;

  const now = nowMinutes();
  let nextStopId = null;
  for (const s of activeStops) {
    const t = timeToMinutes(getStopTime(s));
    if (t !== null && t >= now && !state.checked[s.id]) { nextStopId = s.id; break; }
  }

  activeStops.forEach((stop, idx) => {
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
    const m = L.marker([getStopLat(stop), getStopLng(stop)], { icon }).addTo(markerGroup);
    m.on('click', () => openDetail(stop));
  });

  // Vegan POI pins from session cache
  if (_veganCache?.places?.length) {
    _veganCache.places.forEach(p => {
      const icon = L.divIcon({
        html: `<div class="map-marker-poi vegan-poi"><i class="ph ph-leaf"></i></div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14]
      });
      L.marker([p.lat, p.lng], { icon }).addTo(markerGroup).on('click', () => openVeganDetail(p));
    });
  }
  // Charger POI pins from session cache
  if (_chargerCache?.chargers?.length) {
    applyChargerFilters(_chargerCache.chargers).forEach(c => {
      const icon = L.divIcon({
        html: `<div class="map-marker-poi charger-poi"><i class="ph ph-lightning"></i></div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14]
      });
      L.marker([c.lat, c.lng], { icon }).addTo(markerGroup).on('click', () => openChargerDetail(c));
    });
  }

  // ── Route: remove old polyline, fetch fresh (active stops only) ───
  if (_mapRouteLayer) { _mapRouteLayer.remove(); _mapRouteLayer = null; }
  const routeColor = isDark ? '#38bdf8' : '#0284c7';
  fetchDayRoute(activeStops).then(latlngs => {
    if (!latlngs || _mapDayId !== state.currentDayId) return;
    if (_mapRouteLayer) { _mapRouteLayer.remove(); }
    _mapRouteLayer = L.polyline(latlngs, { color: routeColor, weight: 4, opacity: 0.7 }).addTo(map);
  });
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
    const dateStr = day.isCountdown ? 'Until 16 Jun' : (day.isFestival && day.dateEnd) ? '20–27 Jun' : formatDate(day.date);
    card.innerHTML = `<div class="ov-day">${getDayLabel(day)} · ${dateStr}</div><div class="ov-title">${day.title}</div><div class="ov-sub">${day.subtitle||''}</div><div class="ov-stops">${day.isCountdown ? '' : day.stops.length + ' stops'}</div>`;
    card.addEventListener('click', () => selectDay(day.id));
    grid.appendChild(card);
  });
  c.appendChild(grid);
}

/* ── Bucket List view ──────────────────────────────────────────────── */
function renderBucketView(container) {
  container.innerHTML = '';
  const hdr = document.createElement('div');
  hdr.className = 'vegan-view-header';
  hdr.innerHTML = '<i class="ph ph-bookmark-simple"></i> Bucket List';
  container.appendChild(hdr);

  if (!state.bucketList.length) {
    const empty = document.createElement('div');
    empty.className = 'bucket-empty';
    empty.innerHTML = `<i class="ph ph-bookmark-simple" style="font-size:40px;opacity:.3"></i>
      <div style="margin-top:12px;font-size:16px;font-weight:600">No saved places yet</div>
      <div style="margin-top:6px;font-size:14px;opacity:.6">Save places from the Vegan search, or swipe left on any stop and tap Remove</div>`;
    container.appendChild(empty);
    return;
  }

  renderFilterBar(container, state.bucketList.map(e => getStopType(e.stop)));

  const filtered = state.bucketList.filter(e => passesFilter(e.stop));

  if (!filtered.length) {
    const none = document.createElement('div');
    none.className = 'bucket-empty';
    none.innerHTML = `<div style="font-size:14px;opacity:.6">No matching stops in bucket list</div>`;
    container.appendChild(none);
    return;
  }

  filtered.forEach((entry, idx) => {
    const realIdx = state.bucketList.indexOf(entry);
    const { stop } = entry;
    const wrapper = document.createElement('div');
    wrapper.className = 'bucket-card-wrap';

    // Photo/hero + card body — mirrors the timeline card look
    const [c1, c2] = TYPE_GRAD[getStopType(stop)] || ['#334155','#0f172a'];
    const sliderHtml = buildSlider(stop, 'card');
    const addr = stop.address || stop.location || '';
    wrapper.innerHTML = `
      <div class="tl-card bucket-tl-card">
        ${sliderHtml}
        <div class="card-body">
          <div class="card-top-row">
            <div class="card-name">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
          </div>
          ${addr ? `<div class="card-address">${addr}</div>` : ''}
          <div class="card-meta-row">
            <span class="tl-card-badge">${typeLabel(getStopType(stop))}</span>
            ${isStopFixed(stop) ? '<span class="fixed-badge"><i class="ph ph-lock"></i> Fixed</span>' : ''}
            ${stop.rating ? `<span style="font-size:13px;opacity:.8">⭐ ${stop.rating}</span>` : ''}
          </div>
          ${stop.reason ? `<div class="card-reason">${stop.reason}</div>` : ''}
        </div>
        <div class="bucket-card-actions">
          <button class="bucket-add-btn pill-btn primary" style="flex:1"><i class="ph ph-calendar-plus"></i> Add to trip</button>
          <button class="bucket-delete-btn pill-btn danger" style="flex:0 0 44px;padding:0"><i class="ph ph-trash"></i></button>
        </div>
      </div>`;

    // Open detail on card tap (not on buttons)
    wrapper.querySelector('.tl-card').addEventListener('click', e => {
      if (e.target.closest('.bucket-card-actions')) return;
      if (stop.osmId || stop.id?.startsWith('vegan_') || stop.id?.startsWith('gplace_')) {
        const place = { ...stop, name: stop.location || stop.name, dist: 0 };
        openVeganDetail(place);
      } else {
        openDetail(stop);
      }
    });

    wrapper.querySelector('.bucket-add-btn').addEventListener('click', e => {
      e.stopPropagation();
      openBucketAddSheet(entry, realIdx);
    });

    const deleteBtn = wrapper.querySelector('.bucket-delete-btn');
    deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (deleteBtn._confirming) return;
      deleteBtn._confirming = true;
      const confirmDiv = document.createElement('div');
      confirmDiv.className = 'bucket-delete-confirm';
      confirmDiv.innerHTML = 'Delete permanently? <button class="bucket-confirm-yes">Yes, delete</button> <button class="bucket-confirm-no">Cancel</button>';
      wrapper.appendChild(confirmDiv);
      confirmDiv.querySelector('.bucket-confirm-yes').addEventListener('click', ev => {
        ev.stopPropagation();
        state.bucketList.splice(realIdx, 1);
        save(); renderView(false);
        showToast('Deleted permanently');
      });
      confirmDiv.querySelector('.bucket-confirm-no').addEventListener('click', ev => {
        ev.stopPropagation();
        deleteBtn._confirming = false;
        confirmDiv.remove();
      });
    });

    initSlider(wrapper.querySelector('.card-slider'), stop, 'card');
    container.appendChild(wrapper);
  });
}

function openRescheduleSheet(stop) {
  const sheet = document.getElementById('vd-add-overlay');
  if (!sheet) return;

  // Customise the sheet title
  const titleEl = sheet.querySelector('.edit-sheet-title');
  if (titleEl) titleEl.textContent = 'Reschedule stop';
  const confirmBtn = document.getElementById('vd-add-confirm');
  if (confirmBtn) confirmBtn.textContent = 'Move to this day';

  const daysEl = document.getElementById('vd-add-days');
  daysEl.innerHTML = '';
  const currentDay = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  let selectedDayId = null; // no default — user must actively choose
  TRIP_DATA.days.filter(d => !d.isCountdown && d.id !== state.currentDayId).forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'vd-day-btn';
    btn.dataset.dayId = day.id;
    btn.innerHTML = `<span class="vd-day-btn-name">${getDayLabel(day)}</span><span class="vd-day-btn-date">${formatDate(day.date)}</span>`;
    btn.addEventListener('click', () => {
      daysEl.querySelectorAll('.vd-day-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDayId = day.id;
    });
    daysEl.appendChild(btn);
  });

  document.getElementById('vd-add-time').value = stop.time || '10:00';
  document.getElementById('vd-add-ripple').checked = true;
  sheet.classList.remove('hidden');

  document.getElementById('vd-add-close').onclick  = () => { sheet.classList.add('hidden'); resetAddSheetTitle(); };
  document.getElementById('vd-add-cancel').onclick = () => { sheet.classList.add('hidden'); resetAddSheetTitle(); };

  document.getElementById('vd-add-confirm').onclick = () => {
    if (!selectedDayId) { showToast('Pick a day first'); return; }
    const targetDay = TRIP_DATA.days.find(d => d.id === selectedDayId);
    if (!targetDay) return;
    const time = document.getElementById('vd-add-time').value;

    // For added stops: move between addedStops arrays
    const isAdded = (state.addedStops[state.currentDayId] || []).some(s => s.id === stop.id);
    if (isAdded) {
      state.addedStops[state.currentDayId] = (state.addedStops[state.currentDayId] || []).filter(s => s.id !== stop.id);
      const movedStop = { ...stop, id: 'added_' + Date.now(), time };
      if (!state.addedStops[selectedDayId]) state.addedStops[selectedDayId] = [];
      state.addedStops[selectedDayId].push(movedStop);
    } else {
      // Original trip stop — use crossDayMoves + time override
      if (!state.crossDayMoves) state.crossDayMoves = {};
      state.crossDayMoves[stop.id] = selectedDayId;
      state.overrides[stop.id] = time;
    }

    delete state.skipped[stop.id];
    save();
    sheet.classList.add('hidden');
    resetAddSheetTitle();
    closeDetail();
    state.currentDayId = selectedDayId;
    renderView(false);
    showToast(`Moved to ${getDayLabel(targetDay)}`);
  };
}

function resetAddSheetTitle() {
  const titleEl = document.querySelector('#vd-add-overlay .edit-sheet-title');
  if (titleEl) titleEl.textContent = 'Add to trip';
  const confirmBtn = document.getElementById('vd-add-confirm');
  if (confirmBtn) confirmBtn.textContent = 'Add stop';
}

function openBucketAddSheet(entry, idx) {
  const sheet = document.getElementById('vd-add-overlay');
  if (!sheet) return;
  const daysEl = document.getElementById('vd-add-days');
  daysEl.innerHTML = '';
  let selectedDayId = entry.originalDayId || state.currentDayId;
  TRIP_DATA.days.filter(d => !d.isCountdown).forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'vd-day-btn' + (day.id === selectedDayId ? ' selected' : '');
    btn.dataset.dayId = day.id;
    btn.innerHTML = `<span class="vd-day-btn-name">${getDayLabel(day)}</span><span class="vd-day-btn-date">${formatDate(day.date)}</span>`;
    btn.addEventListener('click', () => {
      daysEl.querySelectorAll('.vd-day-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDayId = day.id;
    });
    daysEl.appendChild(btn);
  });
  document.getElementById('vd-add-time').value = entry.stop.time || '12:00';
  document.getElementById('vd-add-ripple').checked = false;
  sheet.classList.remove('hidden');

  document.getElementById('vd-add-confirm').onclick = () => {
    const day = TRIP_DATA.days.find(d => d.id === selectedDayId);
    if (!day) return;
    const time = document.getElementById('vd-add-time').value;
    const newStop = { ...entry.stop, id: 'added_' + Date.now() };
    if (time) newStop.time = time;
    if (!state.addedStops[day.id]) state.addedStops[day.id] = [];
    state.addedStops[day.id].push(newStop);
    state.bucketList.splice(idx, 1);
    save();
    sheet.classList.add('hidden');
    state.currentDayId = day.id;
    state.currentView = 'day';
    renderView(false);
    showToast(`${newStop.location || newStop.name} added to ${getDayLabel(day)}`);
  };
}

/* ── Find view (unified nearby: food + charger) ─────────────────────── */
function renderFindView(container) {
  container.innerHTML = '';
  const filter = state._findFilter || 'food';

  const header = document.createElement('div');
  header.className = 'find-header';
  header.innerHTML = `
    <div class="find-title"><i class="ph ph-magnifying-glass"></i> Find nearby</div>
    <div class="find-tabs">
      <button class="find-tab${filter === 'food' ? ' active' : ''}" data-filter="food"><i class="ph ph-fork-knife"></i> Food &amp; Drink</button>
      <button class="find-tab${filter === 'charging' ? ' active' : ''}" data-filter="charging"><i class="ph ph-lightning"></i> Charging</button>
    </div>`;
  header.querySelectorAll('.find-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state._findFilter = btn.dataset.filter;
      renderFindView(container);
    });
  });
  container.appendChild(header);

  if (filter === 'food') {
    renderVeganView(container);
  } else {
    renderChargerView(container);
  }
}

function renderMoreView(container) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'more-view';
  wrap.innerHTML = `
    <div class="more-section-title">Trip</div>
    <button class="more-row" onclick="state.currentView='overview';renderView(false)"><i class="ph ph-list-bullets"></i> All days</button>
    <button class="more-row" onclick="state.currentView='bucket';renderView(false)"><i class="ph ph-bookmark-simple"></i> Saved for later</button>
    <div class="more-section-title">Settings</div>
    <button class="more-row" onclick="document.getElementById('menu-btn').click()"><i class="ph ph-gear"></i> Preferences &amp; info</button>`;
  container.appendChild(wrap);
}

/* ── Filter list ───────────────────────────────────────────────────── */
async function renderVeganView(container) {
  container.innerHTML = '';

  const hdr = document.createElement('div');
  hdr.className = 'vegan-view-header';
  hdr.innerHTML = '<i class="ph ph-leaf"></i> Vegan near you';
  container.appendChild(hdr);

  // ── Place search bar ──────────────────────────────────────────────
  const searchWrap = document.createElement('div');
  searchWrap.className = 'place-search-wrap';
  searchWrap.innerHTML = `
    <div class="place-search-bar">
      <i class="ph ph-magnifying-glass"></i>
      <input class="place-search-input" id="place-search-input" type="search" placeholder="Search for a place by name…" autocomplete="off">
      <button class="place-search-btn" id="place-search-btn"><i class="ph ph-arrow-right"></i></button>
    </div>
    <div id="place-search-results" class="place-search-results hidden"></div>`;
  container.appendChild(searchWrap);

  const searchInput   = searchWrap.querySelector('#place-search-input');
  const searchBtn     = searchWrap.querySelector('#place-search-btn');
  const searchResults = searchWrap.querySelector('#place-search-results');

  const doSearch = async () => {
    const q = searchInput.value.trim();
    if (!q) return;
    searchResults.classList.remove('hidden');
    searchResults.innerHTML = `<div class="vegan-searching"><i class="ph ph-spinner vegan-spin"></i> Searching…</div>`;
    try {
      const body = {
        textQuery: q + (_userLat !== null ? '' : ''),
        maxResultCount: 5,
        languageCode: 'en',
      };
      if (_userLat !== null) {
        body.locationBias = { circle: { center: { latitude: _userLat, longitude: _userLng }, radius: 20000 } };
      }
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GPLACES_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.regularOpeningHours,places.currentOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.reviews,places.photos',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const places = data.places || [];
      if (!places.length) {
        searchResults.innerHTML = `<div class="vegan-no-gps">No results found for "<strong>${q}</strong>"</div>`;
        return;
      }
      searchResults.innerHTML = '';
      places.forEach(p => {
        const lat = p.location?.latitude, lng = p.location?.longitude;
        const dist = (_userLat !== null && lat && lng)
          ? Math.round(haversineM(_userLat, _userLng, lat, lng))
          : null;
        const distStr = dist !== null ? (dist < 1000 ? `${dist}m` : `${(dist/1000).toFixed(1)}km`) : '';
        const typeLabel = (p.primaryType || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Place';
        const ratingHtml = p.rating
          ? `<span class="vcard-rating"><i class="ph ph-star-fill" style="color:#f59e0b"></i> ${p.rating.toFixed(1)} <span class="vcard-rating-count">(${(p.userRatingCount||0).toLocaleString()})</span></span>`
          : '';
        const card = document.createElement('div');
        card.className = 'vegan-place-card';
        card.innerHTML = `
          <div class="vegan-place-main">
            <div class="vegan-place-name">${p.displayName?.text || q}</div>
            <div class="vegan-place-meta">
              <span class="vegan-place-type">${typeLabel}</span>
            </div>
            <div class="vcard-bottom-row">
              ${ratingHtml}
              ${p.formattedAddress ? `<span class="vegan-place-hours-mini">${p.formattedAddress}</span>` : ''}
            </div>
          </div>
          <div class="vegan-place-right">
            ${distStr ? `<div class="vegan-place-dist">${distStr}</div>` : ''}
            <div class="vegan-place-chevron"><i class="ph ph-caret-right"></i></div>
          </div>`;
        card.addEventListener('click', () => {
          // Convert Google Places result to the internal place format and open detail
          const osmPlace = {
            osmId:        'gplace_' + p.id,
            osmType:      'node',
            name:         p.displayName?.text || q,
            type:         (p.primaryType || 'restaurant').replace(/_/g,' '),
            veganLevel:   'yes',
            cuisine:      '',
            address:      p.formattedAddress || '',
            phone:        p.nationalPhoneNumber || '',
            website:      p.websiteUri || '',
            openingHours: p.regularOpeningHours?.weekdayDescriptions?.join('; ') || '',
            lat,
            lng,
            dist:         dist ?? 0,
          };
          // Pre-populate Google cache so detail page shows instantly
          _placeGoogleCache[osmPlace.osmId] = {
            rating:      p.rating || null,
            ratingCount: p.userRatingCount || 0,
            reviews:     (p.reviews || []).sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime)).slice(0, 3),
            photos:      (p.photos || []).slice(0, 5),
            hours:       p.regularOpeningHours?.weekdayDescriptions || [],
          };
          openVeganDetail(osmPlace);
        });
        searchResults.appendChild(card);
      });
    } catch (e) {
      searchResults.innerHTML = `<div class="vegan-no-gps"><i class="ph ph-warning"></i> Search failed — check your connection</div>`;
    }
  };

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });

  const nearbySection = document.createElement('div');
  nearbySection.className = 'vegan-nearby-section';
  container.appendChild(nearbySection);

  if (_userLat === null) {
    nearbySection.innerHTML = `<div class="vegan-no-gps"><i class="ph ph-map-pin-slash"></i><div>Enable location to find vegan places nearby</div><button class="pill-btn primary" id="vegan-gps-btn">Share location</button></div>`;
    nearbySection.querySelector('#vegan-gps-btn')?.addEventListener('click', () => {
      startLocationWatch();
      nearbySection.innerHTML = `<div class="vegan-searching"><i class="ph ph-spinner vegan-spin"></i> Getting your location…</div>`;
    });
  } else {
    const isCached = _veganCache &&
      Math.abs(_veganCache.lat - _userLat) < 0.05 &&
      Math.abs(_veganCache.lng - _userLng) < 0.05;
    const doRender = (places, fromCache) => {
      nearbySection.innerHTML = '';
      const lat = _userLat, lng = _userLng;
      if (places.length === 0) {
        nearbySection.innerHTML = `<div class="vegan-empty"><i class="ph ph-smiley-sad"></i><div>No tagged vegan places found within 8 km.<br>Try HappyCow for community tips.</div></div>
          <a class="vegan-happycow-btn" href="https://www.happycow.net/searchmap?lat=${lat}&lng=${lng}&zoom=13" target="_blank" rel="noopener"><i class="ph ph-leaf"></i> Open HappyCow</a>`;
      } else {
        const sub = document.createElement('div');
        sub.className = 'vegan-nearby-subtitle';
        sub.textContent = `${places.length} place${places.length !== 1 ? 's' : ''} found${fromCache ? ' · pull to refresh' : ''}`;
        nearbySection.appendChild(sub);
        places.forEach(p => nearbySection.appendChild(buildVeganCard(p)));
        // Background-fetch Google ratings for first 8 places
        places.slice(0, 8).forEach(p => {
          if (_placeGoogleCache[p.osmId]) return;
          fetchGooglePlace(p.name, p.address, p.lat, p.lng).then(gData => {
            if (!gData) return;
            _placeGoogleCache[p.osmId] = gData;
            const el = nearbySection.querySelector(`[data-osmid="${p.osmId}"] .vcard-rating-loading`);
            if (el && gData.rating) {
              el.className = 'vcard-rating';
              el.innerHTML = `<i class="ph ph-star-fill" style="color:#f59e0b"></i> ${gData.rating.toFixed(1)} <span class="vcard-rating-count">(${gData.ratingCount.toLocaleString()})</span>`;
            }
          });
        });
        const hcLink = document.createElement('a');
        hcLink.className = 'vegan-happycow-btn';
        hcLink.href = `https://www.happycow.net/searchmap?lat=${lat}&lng=${lng}&zoom=13`;
        hcLink.target = '_blank'; hcLink.rel = 'noopener';
        hcLink.innerHTML = '<i class="ph ph-leaf"></i> More on HappyCow';
        nearbySection.appendChild(hcLink);
      }
    };
    if (isCached) {
      doRender(_veganCache.places, true);
    } else {
      nearbySection.innerHTML = `<div class="vegan-searching"><i class="ph ph-spinner vegan-spin"></i> Finding vegan places within 8 km…</div>`;
      try {
        const places = await fetchVeganNearby(_userLat, _userLng, 8000);
        _veganCache = { lat: _userLat, lng: _userLng, places };
        doRender(places, false);
      } catch {
        nearbySection.innerHTML = `<div class="vegan-empty"><i class="ph ph-wifi-slash"></i><div>Couldn't load nearby places — check connection.</div></div>
          <a class="vegan-happycow-btn" href="https://www.happycow.net/searchmap?lat=${_userLat}&lng=${_userLng}&zoom=13" target="_blank" rel="noopener"><i class="ph ph-leaf"></i> Open HappyCow</a>`;
      }
    }
  }

  const planHdr = document.createElement('div');
  planHdr.className = 'vegan-plan-header';
  planHdr.innerHTML = '<i class="ph ph-calendar-check"></i> On your itinerary';
  container.appendChild(planHdr);

  let found = false;
  TRIP_DATA.days.forEach(day => {
    getDayStops(day).forEach(stop => {
      if (!getStopVegan(stop) && getStopType(stop) !== 'food') return;
      found = true;
      const card = document.createElement('div');
      card.className = 'vegan-place-card';
      const dateStr = (day.isFestival && day.dateEnd) ? '20–27 Jun' : formatDate(day.date);
      card.innerHTML = `
        <div class="vegan-place-main">
          <div class="vegan-place-name">${stop.location} <span class="vp-planned-badge"><i class="ph ph-calendar-check"></i> ${getDayLabel(day)} · ${dateStr}</span></div>
          <div class="vegan-place-meta">
            <span class="vegan-place-type">${stopTypeIcon(stop)} ${getStopType(stop)}</span>
            <span class="alt-card-vegan full">On itinerary</span>
          </div>
          ${stop.reason ? `<div class="vegan-place-hours-mini">${stop.reason}</div>` : ''}
        </div>
        <div class="vegan-place-right">
          <div class="vegan-place-chevron"><i class="ph ph-caret-right"></i></div>
        </div>`;
      card.addEventListener('click', () => openDetail(stop));
      container.appendChild(card);
    });
  });
  if (!found) {
    const empty = document.createElement('div');
    empty.className = 'vegan-empty';
    empty.innerHTML = '<i class="ph ph-calendar-x"></i><div>No vegan stops on current itinerary.</div>';
    container.appendChild(empty);
  }
}

async function fetchVeganNearby(lat, lng, radiusM) {
  const query = `[out:json][timeout:20];(
nwr["diet:vegan"~"^(yes|only)$"]["amenity"~"^(restaurant|cafe|bar|fast_food|bakery|pub)$"](around:${radiusM},${lat},${lng});
nwr["diet:vegan"~"^(yes|only)$"]["shop"~"^(health_food|organic|deli|supermarket|convenience|bakery)$"](around:${radiusM},${lat},${lng});
nwr["cuisine"~"vegan"]["amenity"~"^(restaurant|cafe|bar|fast_food|bakery)$"](around:${radiusM},${lat},${lng});
);out center body qt;`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  let res;
  try {
    res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error('Overpass error');
  const json = await res.json();
  return (json.elements || []).map(el => {
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (!elLat || !elLng) return null;
    const t = el.tags || {};
    return {
      osmId:        el.id,
      osmType:      el.type,
      name:         t.name || 'Unnamed place',
      type:         t.amenity || t.shop || 'place',
      veganLevel:   t['diet:vegan'] || 'yes',
      vegetarian:   t['diet:vegetarian'],
      cuisine:      t.cuisine ? t.cuisine.replace(/_/g,' ').replace(/;/g, ', ') : '',
      address:      [t['addr:housenumber'], t['addr:street'], t['addr:city']].filter(Boolean).join(' '),
      phone:        t.phone || t['contact:phone'] || '',
      website:      t.website || t['contact:website'] || '',
      openingHours: t.opening_hours || '',
      image:        t.image || t['wikimedia_commons'] || '',
      lat: elLat, lng: elLng,
      dist: haversineM(lat, lng, elLat, elLng),
    };
  }).filter(Boolean).sort((a, b) => a.dist - b.dist).slice(0, 30);
}

/* ── Opening hours parser ───────────────────────────────────────────── */
function parseOpeningHours(str) {
  if (!str) return { open: null, todayStr: '' };
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Sun
  const todayAbbr = dayNames[todayIdx];
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // Normalise: replace — with -, trim
  const norm = str.replace(/–/g, '-').replace(/\s+/g, ' ').trim();

  // Split by ; into rules
  const rules = norm.split(/\s*;\s*/);

  let todayHours = '';
  let isOpen = null;

  for (const rule of rules) {
    // "24/7"
    if (rule === '24/7') { return { open: true, todayStr: 'Open 24/7' }; }

    // Match "DAY_RANGE TIME_RANGE[, TIME_RANGE]" or "DAY TIME" or "off/closed"
    const m = rule.match(/^([A-Za-z,\-]+)?\s*(.*)$/);
    if (!m) continue;
    let [, dayPart, timePart] = m;

    // Check if this rule applies to today
    let appliesToToday = false;
    if (!dayPart || dayPart === '') {
      appliesToToday = true;
    } else {
      // Parse day part e.g. "Mo-Fr", "Mo,We,Fr", "Mo-Fr,Su"
      const segments = dayPart.split(',');
      for (const seg of segments) {
        if (seg.includes('-')) {
          const [start, end] = seg.split('-');
          const si = dayNames.indexOf(start.trim());
          const ei = dayNames.indexOf(end.trim());
          if (si !== -1 && ei !== -1) {
            if (si <= ei ? (todayIdx >= si && todayIdx <= ei) : (todayIdx >= si || todayIdx <= ei))
              appliesToToday = true;
          }
        } else if (dayNames.indexOf(seg.trim()) === todayIdx) {
          appliesToToday = true;
        }
      }
    }

    if (!appliesToToday) continue;

    timePart = timePart.trim().toLowerCase();
    if (timePart === 'off' || timePart === 'closed') {
      todayHours = 'Closed today';
      isOpen = false;
      continue;
    }

    // Parse time ranges e.g. "08:00-18:00" or "08:00-12:00,14:00-18:00"
    const timeSegs = timePart.split(',');
    const ranges = [];
    let openNow = false;
    let nextOpen = null;
    for (const ts of timeSegs) {
      const tm = ts.trim().match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (!tm) continue;
      const toMins = s => { const [h,min] = s.split(':').map(Number); return h*60+min; };
      const start = toMins(tm[1]), end = toMins(tm[2]);
      ranges.push(`${tm[1]}–${tm[2]}`);
      if (nowMins >= start && nowMins < end) openNow = true;
      else if (start > nowMins && (!nextOpen || start < toMins(nextOpen))) nextOpen = tm[1];
    }
    if (ranges.length) {
      todayHours = ranges.join(', ');
      isOpen = openNow;
    }
    if (!openNow && nextOpen) {
      return { open: false, todayStr: todayHours, nextOpen };
    }
  }

  return { open: isOpen, todayStr: todayHours, nextOpen: null };
}

/* ── Google Places API ──────────────────────────────────────────────── */
const GPLACES_KEY = 'AIzaSyCiV3X0vUMJBkIpU_UgBWwyPzIAjyjJM9I';

async function fetchGooglePlace(name, address, lat, lng) {
  try {
    const query = [name, address].filter(Boolean).join(', ');
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GPLACES_KEY,
        'X-Goog-FieldMask': 'places.id,places.rating,places.userRatingCount,places.reviews,places.photos,places.currentOpeningHours',
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 300 } },
        maxResultCount: 1,
        languageCode: 'en',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const p = data.places?.[0];
    if (!p) return null;
    return {
      rating:      p.rating || null,
      ratingCount: p.userRatingCount || 0,
      reviews:     (p.reviews || []).sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime)).slice(0, 3),
      photos:      (p.photos || []).slice(0, 5),
      hours:       p.currentOpeningHours?.weekdayDescriptions || [],
    };
  } catch { return null; }
}

async function gPhotoUrl(photoName, maxWidth = 800) {
  const res = await fetch(`https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GPLACES_KEY}&skipHttpRedirect=true`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.photoUri || null;
}

async function injectGoogleData(gData, heroEl, bodyEl) {
  if (!gData) return;
  // Remove any previously injected elements to avoid duplication on re-entry
  bodyEl.querySelectorAll('.gp-rating-row, .gp-reviews').forEach(el => el.remove());

  // Photo — resolve photo URI then set as background
  if (gData.photos.length && heroEl) {
    try {
      const photoUri = await gPhotoUrl(gData.photos[0].name);
      if (photoUri) {
        heroEl.style.background = `url(${photoUri}) center/cover no-repeat`;
        heroEl.innerHTML = '<div class="vd-hero-scrim"></div>';
        heroEl.classList.remove('hidden');
      }
    } catch {}
  }

  // Rating row
  if (gData.rating) {
    const stars = Math.round(gData.rating * 2) / 2;
    const filled = Math.floor(stars);
    const half   = stars % 1 >= 0.5 ? 1 : 0;
    const empty  = 5 - filled - half;
    const starHtml =
      '<i class="ph ph-star-fill" style="color:#f59e0b"></i>'.repeat(filled) +
      (half ? '<i class="ph ph-star-half" style="color:#f59e0b"></i>' : '') +
      '<i class="ph ph-star" style="color:rgba(255,255,255,.25)"></i>'.repeat(empty);
    const ratingEl = document.createElement('div');
    ratingEl.className = 'gp-rating-row';
    ratingEl.innerHTML = `${starHtml} <span class="gp-rating-num">${gData.rating.toFixed(1)}</span> <span class="gp-rating-count">(${gData.ratingCount.toLocaleString()} reviews)</span>`;
    // Use dedicated slot if available (detail page), else insert at top of body
    const gratingSlot = bodyEl.querySelector('#detail-grating');
    if (gratingSlot) gratingSlot.replaceWith(ratingEl);
    else bodyEl.insertBefore(ratingEl, bodyEl.firstChild);
  }

  // Reviews
  if (gData.reviews.length) {
    const reviewsEl = document.createElement('div');
    reviewsEl.className = 'gp-reviews';
    reviewsEl.innerHTML = '<div class="vd-links-label" style="margin-bottom:10px"><i class="ph ph-quotes"></i> Recent reviews</div>';
    gData.reviews.forEach(r => {
      const div = document.createElement('div');
      div.className = 'gp-review-card';
      const rStars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
      div.innerHTML = `
        <div class="gp-review-header">
          <span class="gp-review-author">${r.authorAttribution?.displayName || 'Guest'}</span>
          <span class="gp-review-stars">${rStars}</span>
          <span class="gp-review-time">${r.relativePublishTimeDescription || ''}</span>
        </div>
        <div class="gp-review-text">${r.text?.text || ''}</div>`;
      reviewsEl.appendChild(div);
    });
    // Insert before links row
    const linksRow = bodyEl.querySelector('#vd-links-row,#cd-links-row');
    if (linksRow) bodyEl.insertBefore(reviewsEl, linksRow);
    else bodyEl.appendChild(reviewsEl);
  }
}

/* ── Maps URL helpers ───────────────────────────────────────────────── */
function mapsSearchUrl(name, address, lat, lng) {
  const q = [name, address].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || (lat + ',' + lng))}`;
}
function mapsDirectionsUrl(name, address, lat, lng) {
  const dest = address ? encodeURIComponent([name, address].filter(Boolean).join(', '))
                       : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

/* ── Wikimedia photo fetch ──────────────────────────────────────────── */
async function fetchWikimediaPhoto(tag) {
  if (!tag) return null;
  // tag may be "File:foo.jpg" or just a filename
  const title = tag.startsWith('File:') ? tag : `File:${tag}`;
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&origin=*`;
    const res = await fetch(url);
    const json = await res.json();
    const pages = json?.query?.pages || {};
    const page = Object.values(pages)[0];
    return page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url || null;
  } catch { return null; }
}

/* ── Find matching planned stop by proximity ────────────────────────── */
function findMatchingPlannedStop(place) {
  if (!place.lat || !place.lng) return null;
  for (const day of TRIP_DATA.days) {
    for (const stop of getDayStops(day)) {
      if (!stop.lat || !stop.lng) continue;
      if (haversineM(place.lat, place.lng, stop.lat, stop.lng) < 80) return { stop, day };
    }
  }
  return null;
}

function openHoursBadge(open, nextOpen, todayStr) {
  if (open === true)  return '<span class="vp-open-badge open">Open now</span>';
  if (nextOpen)       return `<span class="vp-open-badge opening">Opens ${nextOpen}</span>`;
  if (open === false) return '<span class="vp-open-badge closed">Closed</span>';
  return '';
}

function buildVeganCard(place) {
  const card = document.createElement('div');
  card.className = 'vegan-place-card';
  card.dataset.osmid = place.osmId;
  const distStr = place.dist < 1000 ? `${Math.round(place.dist)}m` : `${(place.dist / 1000).toFixed(1)}km`;
  const typeLabel = { restaurant:'Restaurant', cafe:'Café', bar:'Bar', fast_food:'Takeaway', bakery:'Bakery', pub:'Pub' }[place.type] || place.type;
  const levelLabel = place.veganLevel === 'only' ? 'Fully vegan' : 'Vegan options';
  const levelClass = place.veganLevel === 'only' ? 'full' : '';
  const { open, todayStr, nextOpen } = parseOpeningHours(place.openingHours);
  const openBadge = openHoursBadge(open, nextOpen, todayStr);
  const planned = findMatchingPlannedStop(place);
  const cached = _placeGoogleCache[place.osmId];
  const ratingHtml = cached?.rating
    ? `<span class="vcard-rating"><i class="ph ph-star-fill" style="color:#f59e0b"></i> ${cached.rating.toFixed(1)} <span class="vcard-rating-count">(${cached.ratingCount.toLocaleString()})</span></span>`
    : '<span class="vcard-rating vcard-rating-loading" data-osmid="' + place.osmId + '"></span>';
  card.innerHTML = `
    <div class="vegan-place-main">
      <div class="vegan-place-name">${place.name}${planned ? ' <span class="vp-planned-badge"><i class="ph ph-calendar-check"></i> On itinerary</span>' : ''}</div>
      <div class="vegan-place-meta">
        <span class="vegan-place-type">${typeLabel}</span>
        <span class="alt-card-vegan ${levelClass}">${levelLabel}</span>
        ${openBadge}
      </div>
      <div class="vcard-bottom-row">
        ${ratingHtml}
        ${todayStr ? `<span class="vegan-place-hours-mini">${todayStr}</span>` : ''}
      </div>
    </div>
    <div class="vegan-place-right">
      <div class="vegan-place-dist">${distStr}</div>
      <div class="vegan-place-chevron"><i class="ph ph-caret-right"></i></div>
    </div>`;
  card.addEventListener('click', () => openVeganDetail(place));
  return card;
}

/* ── Vegan place detail overlay ─────────────────────────────────────── */
let _vdPlace = null;
let _vdMiniMap = null;
let _cdMiniMap = null;
let _veganCache = null;        // { lat, lng, places }
let _chargerCache = null;      // { lat, lng, chargers }
let _placeGoogleCache = {};    // osmId → gData
let _chargerMinKW = 50;        // minimum kW filter for charger list

function initMiniMap(containerId, lat, lng, mapRef) {
  const el = document.getElementById(containerId);
  if (!el) return mapRef;
  if (mapRef) {
    mapRef.setView([lat, lng], 16);
    mapRef._vdMarker?.setLatLng([lat, lng]);
    return mapRef;
  }
  const m = L.map(el, {
    zoomControl: false, dragging: false, touchZoom: false,
    scrollWheelZoom: false, doubleClickZoom: false, keyboard: false,
    attributionControl: false,
  }).setView([lat, lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
  m._vdMarker = L.circleMarker([lat, lng], { radius: 8, fillColor: '#0a84ff', fillOpacity: 1, color: '#fff', weight: 2 }).addTo(m);
  setTimeout(() => m.invalidateSize(), 50);
  return m;
}

function openVeganDetail(place) {
  _vdPlace = place;
  const overlay = document.getElementById('vd-overlay');
  if (!overlay) return;

  const typeLabel = { restaurant:'Restaurant', cafe:'Café', bar:'Bar', fast_food:'Takeaway', bakery:'Bakery', pub:'Pub' }[place.type] || 'Place';
  const typeIcon  = { restaurant:'🍽', cafe:'☕', bar:'🍷', fast_food:'🥡', bakery:'🥐', pub:'🍺' }[place.type] || '🌿';
  const levelLabel = place.veganLevel === 'only' ? 'Fully vegan' : 'Vegan options';
  const levelClass = place.veganLevel === 'only' ? 'full' : '';
  const distStr = place.dist < 1000 ? `${Math.round(place.dist)}m away` : `${(place.dist / 1000).toFixed(1)}km away`;
  const mapsUrl = mapsSearchUrl(place.name, place.address, place.lat, place.lng);
  const mapsNavUrl = mapsDirectionsUrl(place.name, place.address, place.lat, place.lng);
  const happycowUrl = `https://www.happycow.net/searchmap?lat=${place.lat}&lng=${place.lng}&zoom=16`;
  const planned = findMatchingPlannedStop(place);
  const { open, todayStr } = parseOpeningHours(place.openingHours);

  // Hero: mini-map always shown; photo loads on top if available
  const hero = document.getElementById('vd-hero');
  const typeColors = { restaurant:'#ea580c', cafe:'#d97706', bar:'#7c3aed', fast_food:'#dc2626', bakery:'#b45309', pub:'#4f46e5' };
  const heroColor = typeColors[place.type] || '#16a34a';
  hero.style.background = '';
  hero.innerHTML = '<div id="vd-mini-map" style="width:100%;height:100%"></div>';
  _vdMiniMap = initMiniMap('vd-mini-map', place.lat, place.lng, null);
  // Try to overlay a photo if one is available
  const tryPhoto = place.image?.startsWith('http') ? Promise.resolve(place.image)
    : place.image ? fetchWikimediaPhoto(place.image) : Promise.resolve(null);
  tryPhoto.then(url => {
    if (url && !document.getElementById('vd-overlay').classList.contains('hidden')) {
      hero.style.background = `url(${url}) center/cover no-repeat`;
      hero.innerHTML = '<div class="vd-hero-scrim"></div>';
    }
  });

  // Meta row
  document.getElementById('vd-meta-row').innerHTML =
    `<span class="tl-card-badge" style="background:${heroColor}22;color:${heroColor}">${typeLabel}</span>` +
    `<span class="alt-card-vegan ${levelClass}" style="margin-left:8px">${levelLabel}</span>` +
    (planned ? `<span class="vp-planned-badge" style="margin-left:8px"><i class="ph ph-calendar-check"></i> On itinerary</span>` : '') +
    `<span class="vd-dist-label">${distStr}</span>`;

  // Name
  document.getElementById('vd-name').textContent = place.name;

  // Hours
  const hoursEl = document.getElementById('vd-hours-row');
  if (place.openingHours) {
    const statusClass = open === true ? 'open' : open === false ? 'closed' : '';
    const statusText  = open === true ? 'Open now' : open === false ? 'Closed now' : '';
    hoursEl.className = 'vd-hours-row';
    hoursEl.innerHTML =
      `<i class="ph ph-clock"></i>` +
      (statusText ? `<span class="vp-open-badge ${statusClass}" style="margin-right:6px">${statusText}</span>` : '') +
      `<span class="vd-hours-text">${todayStr || place.openingHours}</span>`;
    if (place.openingHours && todayStr !== place.openingHours) {
      hoursEl.innerHTML += `<button class="vd-hours-expand" id="vd-hours-toggle"><i class="ph ph-caret-down"></i></button>
        <div class="vd-full-hours hidden" id="vd-full-hours">${place.openingHours}</div>`;
      hoursEl.querySelector('#vd-hours-toggle')?.addEventListener('click', () => {
        const fh = document.getElementById('vd-full-hours');
        const btn = document.getElementById('vd-hours-toggle');
        fh.classList.toggle('hidden');
        btn.innerHTML = fh.classList.contains('hidden') ? '<i class="ph ph-caret-down"></i>' : '<i class="ph ph-caret-up"></i>';
      });
    }
    hoursEl.classList.remove('hidden');
  } else {
    hoursEl.className = 'hidden';
  }

  // Address
  const addrEl = document.getElementById('vd-address');
  addrEl.innerHTML = place.address ? `<i class="ph ph-map-pin"></i> ${place.address}` : '';
  addrEl.className = place.address ? 'vd-info-line' : 'hidden';

  // Info rows (phone, website, cuisine)
  const infoEl = document.getElementById('vd-info-rows');
  const rows = [];
  if (place.cuisine) rows.push(`<div class="vd-info-line"><i class="ph ph-fork-knife"></i> ${place.cuisine}</div>`);
  if (place.phone)   rows.push(`<a class="vd-info-line vd-info-link" href="tel:${place.phone}"><i class="ph ph-phone"></i> ${place.phone}</a>`);
  if (place.website) rows.push(`<a class="vd-info-line vd-info-link" href="${place.website}" target="_blank" rel="noopener"><i class="ph ph-globe"></i> Website</a>`);
  infoEl.innerHTML = rows.join('');

  // Links row (reviews/photos)
  document.getElementById('vd-links-row').innerHTML =
    `<div class="vd-links-label"><i class="ph ph-star"></i> Ratings, reviews &amp; photos</div>
     <div class="vd-links-btns">
       <a class="vd-link-btn gmaps" href="${mapsUrl}" target="_blank" rel="noopener">
         <i class="ph ph-google-logo"></i><div><span class="vd-link-title">Google Maps</span><span class="vd-link-sub">Reviews &amp; photos</span></div>
       </a>
       <a class="vd-link-btn happycow" href="${happycowUrl}" target="_blank" rel="noopener">
         <i class="ph ph-leaf"></i><div><span class="vd-link-title">HappyCow</span><span class="vd-link-sub">Vegan reviews</span></div>
       </a>
     </div>`;

  // Maps link in topbar
  document.getElementById('vd-maps-link').href = mapsUrl;

  // Toolbar
  const addLabel = planned ? 'Already on itinerary' : 'Add to trip';
  const addDisabled = planned ? 'disabled' : '';
  const alreadyBucketed = state.bucketList.some(e => e.stop.osmId === place.osmId || e.stop.id === place.osmId);
  document.getElementById('vd-toolbar').innerHTML =
    `<a class="detail-tool-btn nav-tool" href="${mapsNavUrl}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i>Navigate</a>` +
    `<button class="detail-tool-btn vd-add-tool" id="vd-add-btn" ${addDisabled}><i class="ph ph-calendar-plus"></i>${addLabel}</button>` +
    `<button class="detail-tool-btn" id="vd-bucket-btn" ${alreadyBucketed ? 'disabled' : ''}><i class="ph ph-bookmark-simple"></i>${alreadyBucketed ? 'Saved' : 'Save'}</button>`;

  document.getElementById('vd-add-btn')?.addEventListener('click', () => {
    if (!planned) openVeganAddSheet();
  });
  document.getElementById('vd-bucket-btn')?.addEventListener('click', () => {
    if (alreadyBucketed) return;
    const stop = {
      id: 'vegan_' + Date.now(),
      osmId: place.osmId,
      location: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      type: 'food',
      veganLevel: place.veganLevel,
      rating: place.rating,
      reason: place.openingHours ? '' : '',
    };
    const day = TRIP_DATA.days.find(d => d.id === state.currentDayId) || TRIP_DATA.days[0];
    state.bucketList.unshift({ stop, dayLabel: 'Vegan search', originalDayId: day.id, removedAt: Date.now() });
    save();
    document.getElementById('vd-bucket-btn').disabled = true;
    document.getElementById('vd-bucket-btn').innerHTML = '<i class="ph ph-bookmark-simple"></i> Saved';
    showToast('Saved to Bucket List');
  });

  // Back button
  document.getElementById('vd-back').onclick = () => {
    overlay.classList.add('hidden');
    _vdPlace = null;
  };

  overlay.classList.remove('hidden');

  // Async: fetch Google Places data (use cache if available)
  const _vdFetch = _placeGoogleCache[place.osmId]
    ? Promise.resolve(_placeGoogleCache[place.osmId])
    : fetchGooglePlace(place.name, place.address, place.lat, place.lng);
  _vdFetch.then(gData => {
    if (!gData) return;
    _placeGoogleCache[place.osmId] = gData;
    if (!overlay.classList.contains('hidden') && _vdPlace === place)
      injectGoogleData(gData, hero, document.getElementById('vd-body'));
  });
}

/* ── Add vegan place to trip ────────────────────────────────────────── */
function openVeganAddSheet() {
  const sheet = document.getElementById('vd-add-overlay');
  if (!sheet) return;

  // Populate day buttons
  const daysEl = document.getElementById('vd-add-days');
  daysEl.innerHTML = '';
  let selectedDayId = state.currentDayId;
  TRIP_DATA.days.filter(d => !d.isCountdown).forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'vd-day-btn' + (day.id === selectedDayId ? ' selected' : '');
    btn.dataset.dayId = day.id;
    btn.innerHTML = `<span class="vd-day-btn-name">${getDayLabel(day)}</span><span class="vd-day-btn-date">${formatDate(day.date)}</span>`;
    btn.addEventListener('click', () => {
      daysEl.querySelectorAll('.vd-day-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDayId = day.id;
    });
    daysEl.appendChild(btn);
  });

  // Scroll selected day into view
  setTimeout(() => daysEl.querySelector('.selected')?.scrollIntoView({ block:'nearest', behavior:'smooth' }), 50);

  document.getElementById('vd-add-close').onclick = () => sheet.classList.add('hidden');
  document.getElementById('vd-add-cancel').onclick = () => sheet.classList.add('hidden');
  document.getElementById('vd-add-confirm').onclick = () => {
    const time    = document.getElementById('vd-add-time').value || '12:00';
    const ripple  = document.getElementById('vd-add-ripple').checked;
    const day     = TRIP_DATA.days.find(d => d.id === selectedDayId);
    if (!day || !_vdPlace) return;

    saveUndoSnapshot();
    const newStop = {
      id:       'vegan_' + Date.now(),
      time,
      location: _vdPlace.name,
      type:     _vdPlace.type === 'bakery' ? 'food' : (_vdPlace.type === 'cafe' ? 'food' : 'food'),
      duration: 45,
      reason:   (_vdPlace.cuisine ? _vdPlace.cuisine + ' — ' : '') + 'Vegan ' + (_vdPlace.veganLevel === 'only' ? '(fully vegan)' : 'options'),
      lat:      _vdPlace.lat,
      lng:      _vdPlace.lng,
      mapsUrl:  `https://www.google.com/maps/search/?api=1&query=${_vdPlace.lat},${_vdPlace.lng}`,
      veganFriendly: true,
      order:    999,
    };

    if (!state.addedStops[day.id]) state.addedStops[day.id] = [];
    state.addedStops[day.id].push(newStop);

    if (ripple) {
      // Shift all stops that come after this one by the new stop's duration
      cascadeTimeDelta(newStop, newStop.duration);
    }

    save();
    sheet.classList.add('hidden');
    document.getElementById('vd-overlay').classList.add('hidden');
    _vdPlace = null;

    // Switch to day view for that day
    state.currentDayId = day.id;
    state.currentView = 'day';
    renderView(false);
    showToast(`${newStop.location} added to ${getDayLabel(day)}`);
  };

  sheet.classList.remove('hidden');
}

/* ═══════════════════════════════════════════════════════════════════════
   EV CHARGER FINDER
   ═══════════════════════════════════════════════════════════════════════ */

const CHARGER_BRANDS = {
  tesla:    { label:'Tesla Supercharger', color:'#cc0000', icon:'⚡' },
  ionity:   { label:'Ionity',             color:'#6d28d9', icon:'⚡' },
  fastned:  { label:'Fastned',            color:'#f59e0b', icon:'⚡' },
  electra:  { label:'Electra',            color:'#0ea5e9', icon:'⚡' },
  'bp pulse':{ label:'BP Pulse',          color:'#16a34a', icon:'⚡' },
  default:  { label:'Charger',            color:'#3b82f6', icon:'⚡' },
};

function chargerBrand(op) {
  if (!op) return CHARGER_BRANDS.default;
  const lo = op.toLowerCase();
  for (const [key, val] of Object.entries(CHARGER_BRANDS)) {
    if (key !== 'default' && lo.includes(key)) return { ...val, isTesla: key === 'tesla' };
  }
  return { ...CHARGER_BRANDS.default, label: op };
}

function parseKW(str) {
  if (!str) return null;
  const m = str.match(/(\d+(?:\.\d+)?)\s*(?:kW|KW|kw)?/);
  return m ? parseFloat(m[1]) : null;
}

async function fetchChargersNearby(lat, lng, radiusM) {
  const query = `[out:json][timeout:15];(nwr["amenity"="charging_station"](around:${radiusM},${lat},${lng}););out center body qt;`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  let res;
  try {
    res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
      signal: ctrl.signal,
    });
  } finally { clearTimeout(timer); }
  if (!res.ok) throw new Error('Overpass error');
  const json = await res.json();

  return (json.elements || []).map(el => {
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (!elLat || !elLng) return null;
    const t = el.tags || {};

    // Operator / network
    const operator = t.operator || t.network || t.brand || '';

    // Max kW — scan all socket output tags
    let maxKW = null;
    for (const [k, v] of Object.entries(t)) {
      if (k.endsWith(':output') || k === 'maxpower' || k === 'charging_station:output') {
        const kw = parseKW(v);
        if (kw && kw > (maxKW || 0)) maxKW = kw;
      }
    }

    // Connector types and counts
    const connectors = [];
    const socketKeys = { 'socket:type2_combo':'CCS', 'socket:ccs':'CCS', 'socket:chademo':'CHAdeMO',
      'socket:tesla_supercharger':'Tesla', 'socket:type2':'Type 2', 'socket:type1':'Type 1' };
    for (const [sk, label] of Object.entries(socketKeys)) {
      const count = parseInt(t[sk]) || 0;
      const kw    = parseKW(t[`${sk}:output`]);
      if (count > 0 || t[sk]) connectors.push({ label, count: count || null, kw });
    }

    return {
      osmId:        el.id,
      name:         t.name || t['name:en'] || operator || 'Charging station',
      operator,
      address:      [t['addr:housenumber'], t['addr:street'], t['addr:city']].filter(Boolean).join(' '),
      openingHours: t.opening_hours || '',
      fee:          t.fee,
      charge:       t.charge || t['charge:description'] || '',
      capacity:     parseInt(t.capacity) || null,
      maxKW,
      connectors,
      phone:        t.phone || '',
      website:      t.website || '',
      lat: elLat, lng: elLng,
      dist: haversineM(lat, lng, elLat, elLng),
    };
  }).filter(Boolean).sort((a, b) => a.dist - b.dist).slice(0, 40);
}

const TESLA_CONNECTORS = new Set(['CCS', 'Tesla', 'Type 2']);

function isTeslaCompatible(charger) {
  // Must have at least one CCS, Tesla, or high-power Type 2 connector
  return charger.connectors.some(c => TESLA_CONNECTORS.has(c.label)) ||
    (charger.maxKW && charger.maxKW >= _chargerMinKW);
}

function applyChargerFilters(chargers) {
  return chargers.filter(c => {
    const compatible = isTeslaCompatible(c);
    const kw = c.maxKW || c.connectors.reduce((mx, cn) => Math.max(mx, cn.kw || 0), 0);
    const meetsKW = kw >= _chargerMinKW;
    return compatible && meetsKW;
  });
}

async function renderChargerView(container) {
  container.innerHTML = '';

  const hdr = document.createElement('div');
  hdr.className = 'vegan-view-header';
  hdr.style.color = 'var(--teal)';
  hdr.innerHTML = '<i class="ph ph-lightning"></i> EV Chargers near you';
  container.appendChild(hdr);

  // Min kW filter stepper
  const KW_STEPS = [22, 50, 75, 100, 150, 350];
  const filterRow = document.createElement('div');
  filterRow.className = 'charger-filter-row';
  const updateStepperLabel = () => `${_chargerMinKW} kW min`;
  filterRow.innerHTML = `
    <span class="charger-filter-label"><i class="ph ph-lightning"></i> Min power</span>
    <div class="charger-kw-stepper">
      <button class="charger-kw-btn" id="charger-kw-dec"><i class="ph ph-minus"></i></button>
      <span class="charger-kw-val" id="charger-kw-val">${_chargerMinKW} kW</span>
      <button class="charger-kw-btn" id="charger-kw-inc"><i class="ph ph-plus"></i></button>
    </div>
    <span class="charger-filter-note">Tesla-compatible only</span>`;
  container.appendChild(filterRow);

  const nearbySection = document.createElement('div');
  nearbySection.className = 'vegan-nearby-section';
  container.appendChild(nearbySection);

  const renderFilteredChargers = (allChargers, fromCache) => {
    const filtered = applyChargerFilters(allChargers);
    nearbySection.innerHTML = '';
    if (filtered.length === 0) {
      nearbySection.innerHTML = `<div class="vegan-empty"><i class="ph ph-charging-station"></i><div>No compatible chargers found at ${_chargerMinKW}kW+.<br>Try lowering the minimum power.</div></div>`;
    } else {
      const sub = document.createElement('div');
      sub.className = 'vegan-nearby-subtitle';
      sub.textContent = `${filtered.length} station${filtered.length !== 1 ? 's' : ''} found${fromCache ? ' · pull to refresh' : ''}`;
      nearbySection.appendChild(sub);
      filtered.forEach(c => nearbySection.appendChild(buildChargerCard(c)));
    }
  };

  // Wire stepper buttons — re-filter without re-fetching
  container.addEventListener('click', e => {
    const allChargers = _chargerCache?.chargers;
    if (!allChargers) return;
    const cidx = KW_STEPS.indexOf(_chargerMinKW);
    if (e.target.closest('#charger-kw-dec') && cidx > 0) {
      _chargerMinKW = KW_STEPS[cidx - 1];
    } else if (e.target.closest('#charger-kw-inc') && cidx < KW_STEPS.length - 1) {
      _chargerMinKW = KW_STEPS[cidx + 1];
    } else return;
    document.getElementById('charger-kw-val').textContent = `${_chargerMinKW} kW`;
    renderFilteredChargers(allChargers, true);
  });

  if (_userLat === null) {
    nearbySection.innerHTML = `<div class="vegan-no-gps"><i class="ph ph-map-pin-slash"></i><div>Enable location to find chargers near you</div><button class="pill-btn primary" id="charger-gps-btn">Share location</button></div>`;
    nearbySection.querySelector('#charger-gps-btn')?.addEventListener('click', () => {
      startLocationWatch();
      nearbySection.innerHTML = `<div class="vegan-searching"><i class="ph ph-spinner vegan-spin"></i> Getting your location…</div>`;
    });
  } else {
    const isCached = _chargerCache &&
      Math.abs(_chargerCache.lat - _userLat) < 0.05 &&
      Math.abs(_chargerCache.lng - _userLng) < 0.05;
    if (isCached) {
      renderFilteredChargers(_chargerCache.chargers, true);
    } else {
      nearbySection.innerHTML = `<div class="vegan-searching"><i class="ph ph-spinner vegan-spin"></i> Finding chargers within 20 km…</div>`;
      try {
        const chargers = await fetchChargersNearby(_userLat, _userLng, 20000);
        _chargerCache = { lat: _userLat, lng: _userLng, chargers };
        renderFilteredChargers(chargers, false);
      } catch {
        nearbySection.innerHTML = `<div class="vegan-empty"><i class="ph ph-wifi-slash"></i><div>Couldn't load chargers — check connection.</div></div>`;
      }
    }
  }

  // Planned charging stops
  const planHdr = document.createElement('div');
  planHdr.className = 'vegan-plan-header';
  planHdr.innerHTML = '<i class="ph ph-calendar-check"></i> On your itinerary';
  container.appendChild(planHdr);

  let found = false;
  TRIP_DATA.days.forEach(day => {
    getDayStops(day).forEach(stop => {
      if (stop.type !== 'charging') return;
      found = true;
      const card = document.createElement('div');
      card.className = 'vegan-place-card';
      const dateStr = (day.isFestival && day.dateEnd) ? '20–27 Jun' : formatDate(day.date);
      card.innerHTML = `
        <div class="vegan-place-main">
          <div class="vegan-place-name">${stop.location} <span class="vp-planned-badge"><i class="ph ph-calendar-check"></i> ${getDayLabel(day)} · ${dateStr}</span></div>
          <div class="vegan-place-meta">
            <span class="vegan-place-type">${stopTypeIcon(stop)} Charging stop</span>
            <span class="alt-card-vegan full" style="background:rgba(56,189,248,.15);color:var(--teal);border-color:rgba(56,189,248,.3)">On itinerary</span>
          </div>
          ${stop.reason ? `<div class="vegan-place-hours-mini">${stop.reason}</div>` : ''}
        </div>
        <div class="vegan-place-right">
          <div class="vegan-place-chevron"><i class="ph ph-caret-right"></i></div>
        </div>`;
      card.addEventListener('click', () => openDetail(stop));
      container.appendChild(card);
    });
  });
  if (!found) {
    const empty = document.createElement('div');
    empty.className = 'vegan-empty';
    empty.innerHTML = '<i class="ph ph-calendar-x"></i><div>No charging stops on current itinerary.</div>';
    container.appendChild(empty);
  }
}

function buildChargerCard(charger) {
  const card = document.createElement('div');
  card.className = 'charger-card';
  const distStr = charger.dist < 1000 ? `${Math.round(charger.dist)}m` : `${(charger.dist / 1000).toFixed(1)}km`;
  const brand = chargerBrand(charger.operator);
  const { open, todayStr, nextOpen } = parseOpeningHours(charger.openingHours);
  const openBadge = openHoursBadge(open, nextOpen, todayStr);
  const kw = charger.maxKW || charger.connectors.reduce((mx, c) => Math.max(mx, c.kw || 0), 0);
  const kwBadge = kw ? `<span class="charger-kw-badge">${Math.round(kw)} kW</span>` : '';
  const bays = charger.capacity ? `<span class="charger-bays"><i class="ph ph-charging-station"></i> ${charger.capacity}</span>` : '';
  const priceBadge = charger.charge ? `<span class="charger-price-badge">${charger.charge}</span>` : (charger.fee === 'no' ? '<span class="charger-price-badge free">Free</span>' : '');

  const sameName = !charger.name || charger.name === charger.operator || charger.name === 'Charging station';
  const displayName = sameName ? (charger.address || brand.label + ' station') : charger.name;
  const displayAddr = (sameName || !charger.address) ? '' : charger.address;

  const connChips = charger.connectors
    .filter(c => TESLA_CONNECTORS.has(c.label))
    .slice(0, 3).map(c =>
      `<span class="charger-conn-chip">${c.label}${c.kw ? ' · ' + Math.round(c.kw) + 'kW' : ''}</span>`
    ).join('');

  card.innerHTML = `
    <div class="charger-card-row">
      <div class="charger-card-left">
        <div class="charger-brand-pill" style="background:${brand.color}22;color:${brand.color}">
          ${brand.isTesla ? '⚡ ' : '<i class="ph ph-charging-station"></i> '}${brand.label}
        </div>
        <div class="charger-card-name">${displayName}</div>
        ${displayAddr ? `<div class="charger-card-addr">${displayAddr}</div>` : ''}
        <div class="charger-card-chips">${kwBadge}${bays}${openBadge}${priceBadge}${connChips}</div>
      </div>
      <div class="charger-card-right">
        <div class="vegan-place-dist">${distStr}</div>
        <div class="vegan-place-chevron"><i class="ph ph-caret-right"></i></div>
      </div>
    </div>`;
  card.addEventListener('click', () => openChargerDetail(charger));
  return card;
}

/* ── Charger detail overlay ─────────────────────────────────────────── */
let _cdPlace = null;

function openChargerDetail(charger) {
  _cdPlace = charger;
  const overlay = document.getElementById('cd-overlay');
  if (!overlay) return;

  const brand = chargerBrand(charger.operator);
  const distStr = charger.dist < 1000 ? `${Math.round(charger.dist)}m away` : `${(charger.dist / 1000).toFixed(1)}km away`;
  const mapsUrl = mapsSearchUrl(charger.name, charger.address, charger.lat, charger.lng);
  const mapsNav = mapsDirectionsUrl(charger.name, charger.address, charger.lat, charger.lng);
  const teslaNav = `https://www.tesla.com/_tsla/journey/?lat=${charger.lat}&lng=${charger.lng}`;
  const { open, todayStr } = parseOpeningHours(charger.openingHours);

  // Hero
  const hero = document.getElementById('cd-hero');
  hero.style.background = '';
  hero.innerHTML = '<div id="cd-mini-map" style="width:100%;height:100%"></div>';
  _cdMiniMap = initMiniMap('cd-mini-map', charger.lat, charger.lng, null);

  // Meta row
  document.getElementById('cd-meta-row').innerHTML =
    `<span class="tl-card-badge" style="background:${brand.color}22;color:${brand.color}">${brand.label}</span>` +
    (charger.maxKW ? `<span class="charger-kw-badge" style="margin-left:8px">${Math.round(charger.maxKW)}kW max</span>` : '') +
    `<span class="vd-dist-label">${distStr}</span>`;

  document.getElementById('cd-name').textContent = charger.name;

  // Hours
  const hoursEl = document.getElementById('cd-hours-row');
  if (charger.openingHours) {
    const statusClass = open === true ? 'open' : open === false ? 'closed' : '';
    const statusText  = open === true ? 'Open now' : open === false ? 'Closed now' : '';
    hoursEl.className = 'vd-hours-row';
    hoursEl.innerHTML = `<i class="ph ph-clock"></i>` +
      (statusText ? `<span class="vp-open-badge ${statusClass}">${statusText}</span>` : '') +
      `<span class="vd-hours-text">${todayStr || charger.openingHours}</span>`;
  } else {
    hoursEl.className = 'hidden';
  }

  // Address
  const addrEl = document.getElementById('cd-address');
  addrEl.innerHTML = charger.address ? `<i class="ph ph-map-pin"></i> ${charger.address}` : '';
  addrEl.className = charger.address ? 'vd-info-line' : 'hidden';

  // Connectors table
  const infoEl = document.getElementById('cd-info-rows');
  const rows = [];
  if (charger.connectors.length) {
    rows.push('<div class="cd-connectors">');
    charger.connectors.forEach(c => {
      rows.push(`<div class="cd-connector-row">
        <span class="cd-connector-label">${c.label}</span>
        ${c.kw ? `<span class="charger-kw-badge">${Math.round(c.kw)}kW</span>` : ''}
        ${c.count ? `<span class="cd-connector-count">${c.count} bay${c.count !== 1 ? 's' : ''}</span>` : ''}
      </div>`);
    });
    rows.push('</div>');
  }
  if (charger.capacity && !charger.connectors.length)
    rows.push(`<div class="vd-info-line"><i class="ph ph-stack"></i> ${charger.capacity} charging bays total</div>`);
  if (charger.charge)
    rows.push(`<div class="vd-info-line"><i class="ph ph-currency-circle-dollar"></i> ${charger.charge}</div>`);
  else if (charger.fee === 'no')
    rows.push(`<div class="vd-info-line"><i class="ph ph-currency-circle-dollar"></i> Free to use</div>`);
  if (charger.phone)
    rows.push(`<a class="vd-info-line vd-info-link" href="tel:${charger.phone}"><i class="ph ph-phone"></i> ${charger.phone}</a>`);
  if (charger.website)
    rows.push(`<a class="vd-info-line vd-info-link" href="${charger.website}" target="_blank" rel="noopener"><i class="ph ph-globe"></i> Operator website</a>`);

  // Real-time note
  rows.push(`<div class="cd-realtime-note"><i class="ph ph-info"></i> Live bay availability requires the operator's app</div>`);
  infoEl.innerHTML = rows.join('');

  // Links row
  document.getElementById('cd-links-row').innerHTML =
    `<div class="vd-links-label">Open in</div>
     <div class="vd-links-btns">
       <a class="vd-link-btn gmaps" href="${mapsUrl}" target="_blank" rel="noopener"><i class="ph ph-google-logo"></i><span>Google Maps</span></a>
       ${brand.isTesla ? `<a class="vd-link-btn" style="color:#cc0000;background:rgba(204,0,0,.1);border-color:rgba(204,0,0,.2)" href="https://www.tesla.com/en_gb/charging" target="_blank" rel="noopener"><span>⚡</span><span>Tesla app</span></a>` : ''}
     </div>`;

  document.getElementById('cd-maps-link').href = mapsUrl;

  // Toolbar
  const isPlanned = TRIP_DATA.days.some(d => getDayStops(d).some(s => s.lat && haversineM(s.lat, s.lng, charger.lat, charger.lng) < 200));
  document.getElementById('cd-toolbar').innerHTML =
    `<a class="detail-tool-btn nav-tool" href="${mapsNav}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i>Navigate</a>` +
    `<button class="detail-tool-btn vd-add-tool" id="cd-add-btn" ${isPlanned ? 'disabled' : ''}><i class="ph ph-calendar-plus"></i>${isPlanned ? 'On itinerary' : 'Add to trip'}</button>`;

  document.getElementById('cd-add-btn')?.addEventListener('click', () => {
    if (!isPlanned) openChargerAddSheet();
  });

  document.getElementById('cd-back').onclick = () => { overlay.classList.add('hidden'); _cdPlace = null; };
  overlay.classList.remove('hidden');

  // Async: fetch Google Places data for charger (ratings/photos where available)
  fetchGooglePlace(charger.name, charger.address, charger.lat, charger.lng).then(gData => {
    if (!overlay.classList.contains('hidden') && _cdPlace === charger)
      injectGoogleData(gData, hero, document.getElementById('cd-body'));
  });
}

function openChargerAddSheet() {
  const sheet = document.getElementById('cd-add-overlay');
  if (!sheet) return;
  const daysEl = document.getElementById('cd-add-days');
  daysEl.innerHTML = '';
  let selectedDayId = state.currentDayId;
  TRIP_DATA.days.filter(d => !d.isCountdown).forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'vd-day-btn' + (day.id === selectedDayId ? ' selected' : '');
    btn.dataset.dayId = day.id;
    btn.innerHTML = `<span class="vd-day-btn-name">${getDayLabel(day)}</span><span class="vd-day-btn-date">${formatDate(day.date)}</span>`;
    btn.addEventListener('click', () => {
      daysEl.querySelectorAll('.vd-day-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected'); selectedDayId = day.id;
    });
    daysEl.appendChild(btn);
  });
  setTimeout(() => daysEl.querySelector('.selected')?.scrollIntoView({ block:'nearest', behavior:'smooth' }), 50);

  document.getElementById('cd-add-close').onclick  = () => sheet.classList.add('hidden');
  document.getElementById('cd-add-cancel').onclick = () => sheet.classList.add('hidden');
  document.getElementById('cd-add-confirm').onclick = () => {
    const time   = document.getElementById('cd-add-time').value || '12:00';
    const ripple = document.getElementById('cd-add-ripple').checked;
    const day    = TRIP_DATA.days.find(d => d.id === selectedDayId);
    if (!day || !_cdPlace) return;
    saveUndoSnapshot();
    const newStop = {
      id: 'charger_' + Date.now(), time, type: 'charging', duration: 30,
      location: _cdPlace.name || 'Charging stop',
      reason: [_cdPlace.operator, _cdPlace.maxKW ? `${Math.round(_cdPlace.maxKW)}kW` : '', _cdPlace.charge].filter(Boolean).join(' · '),
      lat: _cdPlace.lat, lng: _cdPlace.lng,
      mapsUrl: mapsSearchUrl(_cdPlace.name, _cdPlace.address, _cdPlace.lat, _cdPlace.lng),
      order: 999,
    };
    if (!state.addedStops[day.id]) state.addedStops[day.id] = [];
    state.addedStops[day.id].push(newStop);
    if (ripple) applyTravelAction(day, newStop, time, true);
    save();
    sheet.classList.add('hidden');
    document.getElementById('cd-overlay').classList.add('hidden');
    _cdPlace = null;
    state.currentDayId = day.id; state.currentView = 'day';
    renderView(false);
    showToast(`Charging stop added to ${getDayLabel(day)}`);
  };
  sheet.classList.remove('hidden');
}

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
          <div class="filter-day">${getDayLabel(day)} · ${(day.isFestival && day.dateEnd) ? '20–27 Jun' : formatDate(day.date)}</div>
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
  const todayStr = localDateStr();
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
  const todayStr = localDateStr();
  const dateStr  = day.dateEnd
    ? ((todayStr >= day.date && todayStr <= day.dateEnd) ? todayStr : day.date)
    : day.date;
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

  const festStops = getDayStops(day);
  festStops.forEach((stop, idx) => {
    const type = getStopType(stop);
    const col  = TYPE_COL[type] || '#334155';
    const item = document.createElement('div');
    item.className = 'fest-cal-item';
    item.id = `stop-${stop.id}`;
    item.style.borderLeftColor = col;
    if (state.checked[stop.id]) item.classList.add('visited');
    const timeStr = getStopTime(stop);
    const timeDisplay = timeToMinutes(timeStr) !== null ? `<span class="fest-cal-item-time">${timeStr}</span>` : '';
    item.innerHTML = `
      <div class="fest-cal-item-name">${stopTypeIcon(stop)} ${getStopName(stop)}${timeDisplay}</div>
      <div class="fest-cal-item-meta">${typeLabel(type)}${stop.veganFriendly ? ' · <i class="ph ph-leaf"></i> Vegan' : ''}</div>
      <div data-departby="${stop.id}" class="depart-by-pill hidden"></div>`;
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

  const _calToday = localDateStr();
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
    const isSkipped = !!state.skipped[stop.id];
    if (isVisited) card.classList.add('visited');
    if (isSkipped) card.classList.add('skipped');
    if (!isVisited && !isSkipped) {
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
        const today = localDateStr();
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

/* ── Type filter popup ─────────────────────────────────────────────── */
const HIDE_FROM_FILTER = new Set(['depart','hotel','work','festival']);
const ALL_FILTER_TYPES = ['food','shopping','experience','wander','architecture','historic','scenic','village','town','transport','charging','showing'];

function filterActive() { return state.typeFilter.size > 0; }
function passesFilter(stop) {
  if (!filterActive()) return true;
  return state.typeFilter.has(getStopType(stop));
}

function renderFilterBar(container, _typeList) { /* no-op — filter is now in header popup */ }

function openFilterPopup(presentTypes) {
  const popup = document.getElementById('filter-popup');
  if (!popup) return;
  popup.innerHTML = '';
  popup.classList.remove('hidden');

  // All option
  const allRow = document.createElement('button');
  allRow.className = 'filter-pop-item' + (!filterActive() ? ' active' : '');
  allRow.innerHTML = '<i class="ph ph-check-circle"></i> All types';
  allRow.addEventListener('click', e => {
    e.stopPropagation();
    state.typeFilter = new Set();
    updateFilterBtn();
    renderView(false);
    popup.classList.add('hidden');
  });
  popup.appendChild(allRow);

  const sep = document.createElement('div');
  sep.className = 'filter-pop-sep';
  popup.appendChild(sep);

  ALL_FILTER_TYPES.forEach(type => {
    const present = presentTypes.has(type);
    const selected = state.typeFilter.has(type);
    const row = document.createElement('button');
    row.className = 'filter-pop-item' + (selected ? ' active' : '') + (!present ? ' dimmed' : '');
    row.innerHTML = `<i class="ph ${TYPE_ICON[type] || 'ph-map-pin'}"></i> ${typeLabel(type)}${selected ? '<i class="ph ph-check filter-pop-check"></i>' : ''}`;
    row.addEventListener('click', e => {
      e.stopPropagation();
      if (state.typeFilter.has(type)) state.typeFilter.delete(type);
      else state.typeFilter.add(type);
      updateFilterBtn();
      renderView(false);
      // Re-render popup in place with updated state
      openFilterPopup(presentTypes);
    });
    popup.appendChild(row);
  });

  // Bulk actions — shown when filter active
  if (filterActive()) {
    const sep2 = document.createElement('div');
    sep2.className = 'filter-pop-sep';
    popup.appendChild(sep2);

    if (state.currentView === 'bucket') {
      // Bucket list: delete matching entries
      const delBtn = document.createElement('button');
      delBtn.className = 'filter-pop-item filter-pop-action filter-pop-danger';
      delBtn.innerHTML = '<i class="ph ph-trash"></i> Delete matching';
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        popup.classList.add('hidden');
        applyFilterBucketDelete();
      });
      popup.appendChild(delBtn);
    } else {
      // Day view: Skip hidden + Restore all
      const skipBtn = document.createElement('button');
      skipBtn.className = 'filter-pop-item filter-pop-action filter-pop-only';
      skipBtn.innerHTML = '<i class="ph ph-skip-forward-circle"></i> Skip hidden';
      skipBtn.addEventListener('click', e => {
        e.stopPropagation();
        popup.classList.add('hidden');
        applyFilterSkip(true);
      });
      popup.appendChild(skipBtn);

      const restoreBtn = document.createElement('button');
      restoreBtn.className = 'filter-pop-item filter-pop-action filter-pop-restore';
      restoreBtn.innerHTML = '<i class="ph ph-arrow-counter-clockwise"></i> Restore all';
      restoreBtn.addEventListener('click', e => {
        e.stopPropagation();
        popup.classList.add('hidden');
        applyFilterRestore();
      });
      popup.appendChild(restoreBtn);
    }
  }
}

function getPresentTypes() {
  const types = new Set();
  if (state.currentView === 'bucket') {
    state.bucketList.forEach(e => types.add(getStopType(e.stop)));
  } else {
    const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
    if (day) getDayStops(day).forEach(s => types.add(getStopType(s)));
  }
  return types;
}

function updateFilterBtn() {
  const btn = document.getElementById('filter-btn');
  if (!btn) return;
  btn.classList.toggle('filter-active', filterActive());
  btn.title = filterActive() ? `Filter: ${[...state.typeFilter].map(typeLabel).join(', ')}` : 'Filter by type';
}

function applyFilterSkip() {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!day) return;
  let skippedAny = false;
  getDayStops(day).forEach(s => {
    if (getStopType(s) === 'depart') return;
    if (!passesFilter(s)) {
      state.skipped[s.id] = true;
      skippedAny = true;
    }
  });
  if (skippedAny) {
    const stops = getDayStops(day).filter(s => !state.skipped[s.id] && getStopType(s) !== 'depart');
    if (stops.length) cascadeTimeDelta(stops[0], 0);
  }
  save();
  state.typeFilter = new Set();
  updateFilterBtn();
  renderView(false);
  showToast('Hidden stops skipped');
}

function applyFilterRestore() {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!day) return;
  const restored = [];
  getDayStops(day).forEach(s => {
    if (state.skipped[s.id]) { delete state.skipped[s.id]; restored.push(s); }
  });
  save();
  state.typeFilter = new Set();
  updateFilterBtn();
  renderView(false);
  showToast('All stops restored');
  if (restored.length) postCascadeCheck(restored.map(s => ({ stop: s, newTime: getStopTime(s), dayDate: day.date })));
}

function applyFilterBucketDelete() {
  state.bucketList = state.bucketList.filter(e => !passesFilter(e.stop));
  save();
  state.typeFilter = new Set();
  updateFilterBtn();
  renderView(false);
  showToast('Matching entries deleted');
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

  const today = localDateStr();
  const isToday = day.date === today || (day.isFestival && today >= day.date && today <= (day.dateEnd || day.date));
  const now = nowMinutes();
  let nowLineEl = null;

  // Now panel + FAB — only on today's day view
  if (isToday) {
    renderNowPanel(container, day);
    const fab = document.getElementById('fab-add');
    if (fab) fab.classList.remove('hidden');
  } else {
    const fab = document.getElementById('fab-add');
    if (fab) fab.classList.add('hidden');
  }
  let nowInserted = false;

  // Filter bar — collect types present in this day's stops
  const allDayStops = getDayStops(day).filter(s => getStopType(s) !== 'depart');
  renderFilterBar(container, allDayStops.map(s => getStopType(s)));

  // In compact mode wrap everything in a single glass card
  const compactCard = state.cardView === 'compact' ? (() => {
    const c = document.createElement('div');
    c.className = 'compact-card';
    container.appendChild(c);
    return c;
  })() : null;

  // Depart stops removed from timeline; overnight lead card injected instead
  const _allDayStops = getDayStops(day);
  const _tlStops = _allDayStops.filter(s => getStopType(s) !== 'depart' && (passesFilter(s)));

  // Overnight lead: first depart on this day → find its matching non-depart stop from another day
  const _overnight = (() => {
    const firstDepart = _allDayStops.find(s => getStopType(s) === 'depart');
    if (!firstDepart) return null;
    const name = getStopName(firstDepart).toLowerCase();
    for (const d of TRIP_DATA.days) {
      if (d.id === day.id) continue;
      const all = [...d.stops, ...(state.addedStops?.[d.id] || [])];
      const match = all.find(s => getStopType(s) !== 'depart' && getStopName(s).toLowerCase() === name);
      if (match) return { stop: match, checkoutTime: getStopTime(firstDepart) };
    }
    return null;
  })();

  if (_overnight) {
    const oCard = buildOvernightCard(_overnight.stop, _overnight.checkoutTime, day);
    (compactCard || container).appendChild(oCard);
  }

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
    const prevStop = _tlStops[idx - 1] || null;
    const item = state.cardView === 'compact'
      ? buildCompactItem(stop, idx === _tlStops.length - 1, day)
      : buildTimelineItem(stop, idx === _tlStops.length - 1, day, nextStop, prevStop);
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
  const isSkipped = !!state.skipped[stop.id];
  const info      = leaveByInfo(stop);
  const _cTodayStr = localDateStr();
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
    <div class="compact-body${isVisited ? ' visited' : ''}${isSkipped ? ' skipped' : ''}">
      <div class="compact-name">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
      <div class="compact-meta">
        ${metaHtml}
        ${isVisited ? '<div class="compact-visited-dot"><i class="ph ph-check"></i></div>' : ''}
        ${isSkipped ? '<div class="compact-visited-dot skipped-dot"><i class="ph ph-x"></i></div>' : ''}
      </div>
    </div>`;

  item.addEventListener('click', () => openDetail(stop));
  return item;
}

/* ── Overnight lead card ───────────────────────────────────────────── */
function buildOvernightCard(stop, checkoutTime, day) {
  const item = document.createElement('div');
  item.className = 'tl-item';
  item.dataset.type = getStopType(stop);
  item.id = `overnight-${stop.id}`;

  item.innerHTML = `
    <div class="tl-left">
      <div class="tl-time-overnight">
        <span class="overnight-label">Overnight</span>
        ${checkoutTime ? `<span class="overnight-checkout"><i class="ph ph-sign-out"></i>${checkoutTime}</span>` : ''}
      </div>
    </div>
    <div class="tl-line-wrap">
      <div class="tl-dot tl-dot--overnight"></div>
      <div class="tl-line"></div>
    </div>
    <div class="tl-swipe-wrap">
      <div class="tl-swipe-track">
      <div class="tl-card tl-card--overnight" data-stop-id="${stop.id}" style="cursor:pointer">
        ${buildSlider(stop, 'card')}
        <div class="card-body">
          <div class="card-top-row">
            <div class="card-name">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
            <span class="overnight-stay-badge"><i class="ph ph-moon"></i> Overnight</span>
          </div>
          ${stop.address || stop.location ? `<div class="card-address">${stop.address || stop.location}</div>` : ''}
          <div class="card-meta-row">
            <span class="tl-card-badge">${typeLabel(getStopType(stop))}</span>
            ${isStopFixed(stop) ? '<span class="fixed-badge"><i class="ph ph-lock"></i> Fixed</span>' : ''}
          </div>
          ${getStopReason(stop) ? `<div class="card-reason">${getStopReason(stop)}</div>` : ''}
        </div>
      </div>
      </div>
    </div>`;

  item.querySelector('.tl-card--overnight').addEventListener('click', () => openDetail(stop));
  return item;
}

/* ── Build one timeline item ───────────────────────────────────────── */
function buildTimelineItem(stop, isLast, day, nextStop, prevStop) {
  const item = document.createElement('div');
  item.className = 'tl-item';
  item.dataset.type = getStopType(stop);
  item.id = `stop-${stop.id}`;

  const time = getStopTime(stop);
  const isEditable = timeToMinutes(time) !== null;
  const isVisited  = !!state.checked[stop.id];
  const isSkipped  = !!state.skipped[stop.id];

  const _todayStr = localDateStr();
  const _currentDay = day || TRIP_DATA.days.find(d => d.id === state.currentDayId);
  const _isToday = _currentDay && (_currentDay.date === _todayStr ||
    (_currentDay.isFestival && _todayStr >= _currentDay.date && _todayStr <= (_currentDay.dateEnd || _currentDay.date)));
  const _isPastDay = _currentDay?.date && _currentDay.date < _todayStr;
  const _stopMins = timeToMinutes(time);
  const _depMins = _stopMins !== null ? _stopMins + getStopDuration(stop) : null;
  const isPast = !isVisited && _isToday && _depMins !== null && _depMins < nowMinutes();

  // Departure stops: slim row showing where you're heading next, no photo
  if (getStopType(stop) === 'depart') {
    const linkedSkipped = prevStop && !!state.skipped[prevStop.id];
    const nextName = nextStop ? getStopName(nextStop) : null;
    const nextIcon = nextStop ? stopTypeIcon(nextStop) : '';
    item.innerHTML = `
      <div class="tl-left">
        <button class="tl-time-btn" data-stop-id="${stop.id}">
          <span>${time}</span>${stop.tz ? `<div class="tl-tz">${stop.tz}</div>` : ''}
        </button>
      </div>
      <div class="tl-line-wrap">
        <div class="tl-dot tl-dot--depart${linkedSkipped ? ' tl-dot--skipped' : ''}"></div>
        ${isLast ? '' : '<div class="tl-line"></div>'}
      </div>
      <div class="tl-depart-row${linkedSkipped ? ' depart-skipped' : ''}" data-stop-id="${stop.id}">
        ${linkedSkipped ? '<span class="depart-skipped-badge"><i class="ph ph-x-circle"></i> Skipped</span>' : ''}
        <div class="tl-depart-from">${getStopName(stop)}</div>
        ${nextName ? `<div class="tl-depart-arrow"><i class="ph ph-arrow-right"></i></div><div class="tl-depart-to">${nextIcon} ${nextName}</div>` : ''}
        <div class="tl-depart-note">${getStopReason(stop)}</div>
        <div class="depart-edit-hint"><i class="ph ph-caret-right"></i> View stop details</div>
      </div>`;
    const _d = TRIP_DATA.days.find(d => d.id === state.currentDayId);
    item.querySelector('.tl-time-btn').addEventListener('click', () => openTimeModal(stop, _d));
    item.querySelector('.tl-depart-row').addEventListener('click', () => {
      // Find the real stop for this location (may be on a previous day, e.g. overnight hotel)
      const name = getStopName(stop).toLowerCase();
      let target = null;
      for (const d of TRIP_DATA.days) {
        const all = [...d.stops, ...(state.addedStops?.[d.id] || [])];
        target = all.find(s => s.id !== stop.id && getStopType(s) !== 'depart' && getStopName(s).toLowerCase() === name);
        if (target) break;
      }
      openDetail(target || stop);
    });
    item.querySelector('.tl-depart-row').style.cursor = 'pointer';
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
    <div class="tl-swipe-wrap">
      <div class="tl-swipe-track">
      <div class="tl-card${isVisited ? ' visited' : ''}${isSkipped ? ' skipped' : ''}" data-stop-id="${stop.id}">
        <div class="card-visited-badge">✓</div>
        <div class="card-skipped-badge"><i class="ph ph-x"></i> Skipped</div>
        ${buildSlider(stop, 'card')}
        <div class="card-body">
          <div class="card-top-row">
            <div class="card-name">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
            <div class="card-top-btns">
              <button class="check-btn${isVisited ? ' checked' : ''}" data-stop-id="${stop.id}" aria-label="Mark visited"><i class="ph ${isVisited ? 'ph-check-circle' : 'ph-circle'}"></i></button>
              <button class="more-btn" data-stop-id="${stop.id}" aria-label="More options"><i class="ph ph-dots-three"></i></button>
            </div>
          </div>
          <div class="card-meta-row">
            <span class="tl-card-badge">${typeLabel(getStopType(stop))}</span>
            <a class="weather-pill" data-stop-id="${stop.id}" data-lat="${getStopLat(stop)||''}" data-lng="${getStopLng(stop)||''}" href="#" onclick="return false;"></a>
          </div>
          ${getStopType(stop) === 'showing' ? buildShowingMeta(stop) : ''}
          ${hasExplicitDuration(stop) ? `<div data-leaveby="${stop.id}" class="leave-by-pill" style="display:none"></div>` : ''}
          <div data-departby="${stop.id}" class="depart-by-pill hidden"></div>
        </div>
      </div>
      <div class="tl-swipe-actions">
        <button class="swipe-skip-btn">${isSkipped ? '<i class="ph ph-arrow-u-up-left"></i> Restore' : '<i class="ph ph-x-circle"></i> Skip'}</button>
        <button class="swipe-remove-btn"><i class="ph ph-trash"></i> Remove</button>
      </div>
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
  item.querySelector('.more-btn').addEventListener('click', e => {
    e.stopPropagation();
    openStopSheet(stop.id);
  });

  // Whole card opens detail; check/more buttons stop propagation
  const card = item.querySelector('.tl-card');
  card.style.cursor = 'pointer';
  card.addEventListener('click', e => {
    if (e.target.closest('.check-btn, .more-btn, .depart-lead-btn')) return;
    openDetail(stop);
  });

  // Swipe-left to reveal Skip / Restore button
  const swipeWrap  = item.querySelector('.tl-swipe-wrap');
  const swipeTrack = item.querySelector('.tl-swipe-track');
  const SWIPE_REVEAL = 88;
  let _sx = 0, _sy = 0, _sActive = false, _sOpen = false, _sMoved = false;
  swipeWrap.addEventListener('touchstart', e => {
    _sx = e.touches[0].clientX; _sy = e.touches[0].clientY;
    _sActive = true; _sMoved = false;
  }, { passive: true });
  swipeWrap.addEventListener('touchmove', e => {
    if (!_sActive) return;
    const dx = e.touches[0].clientX - _sx;
    const dy = e.touches[0].clientY - _sy;
    if (!_sMoved && Math.abs(dy) > Math.abs(dx) + 4) { _sActive = false; return; }
    _sMoved = true;
    const base = _sOpen ? -SWIPE_REVEAL : 0;
    const tx = Math.min(0, Math.max(-SWIPE_REVEAL, base + dx));
    swipeTrack.style.transition = 'none';
    swipeTrack.style.transform = `translateX(${tx}px)`;
  }, { passive: true });
  swipeWrap.addEventListener('touchend', e => {
    if (!_sActive || !_sMoved) { _sActive = false; return; }
    _sActive = false;
    const dx = e.changedTouches[0].clientX - _sx;
    swipeTrack.style.transition = 'transform .22s ease';
    if (!_sOpen && dx < -SWIPE_REVEAL / 2) {
      swipeTrack.style.transform = `translateX(-${SWIPE_REVEAL}px)`;
      _sOpen = true;
    } else {
      swipeTrack.style.transform = '';
      _sOpen = false;
    }
  });
  // Tap the card while open → close
  card.addEventListener('click', () => {
    if (_sOpen) { swipeTrack.style.transition = 'transform .22s ease'; swipeTrack.style.transform = ''; _sOpen = false; }
  }, true);
  // Skip / Restore button
  item.querySelector('.swipe-skip-btn').addEventListener('click', e => {
    e.stopPropagation();
    swipeTrack.style.transition = 'transform .22s ease'; swipeTrack.style.transform = ''; _sOpen = false;
    if (state.skipped[stop.id]) {
      delete state.skipped[stop.id];
      save(); renderView(false);
      // Re-check the restored stop's own time against opening hours
      const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
      if (day) postCascadeCheck([{ stop, newTime: getStopTime(stop), dayDate: day.date }]);
    } else {
      skipStop(stop);
    }
  });

  // Remove button — moves stop to bucket list
  item.querySelector('.swipe-remove-btn').addEventListener('click', e => {
    e.stopPropagation();
    swipeTrack.style.transition = 'transform .22s ease'; swipeTrack.style.transform = ''; _sOpen = false;
    moveStopToBucketList(stop);
    renderView(false);
    showToast('Moved to Bucket List');
  });

  // Photo slider still handles its own swipe; tap on slider already calls openDetail,
  // so prevent the card click from double-firing
  const slider = item.querySelector('.card-slider');
  if (slider) {
    slider.addEventListener('click', e => e.stopPropagation());
  }

  initSlider(item.querySelector('.card-slider'), stop, 'card');

  // Lazily populate Google star rating on card
  const _ratingEl = item.querySelector('.vcard-rating-loading[data-stopid]');
  if (_ratingEl && stop.lat && stop.lng) {
    const _cacheKey = 'stop_' + stop.id;
    const _showRating = (gData) => {
      if (!_ratingEl.isConnected || !gData?.rating) return;
      _ratingEl.className = 'vcard-rating';
      _ratingEl.innerHTML = `<i class="ph ph-star-fill" style="color:#f59e0b"></i> ${gData.rating.toFixed(1)} <span class="vcard-rating-count">(${gData.ratingCount?.toLocaleString()})</span>`;
    };
    if (_placeGoogleCache[_cacheKey]) {
      _showRating(_placeGoogleCache[_cacheKey]);
    } else if (getStopType(stop) === 'food' || getStopType(stop) === 'vegan' || getStopVegan(stop)) {
      fetchGooglePlace(stop.name, stop.address, stop.lat, stop.lng).then(gData => {
        if (gData) { _placeGoogleCache[_cacheKey] = gData; _showRating(gData); }
      });
    }
  }

  // Lazily fetch weather and update pill
  const _weatherPill = item.querySelector('.weather-pill');
  if (_weatherPill && _currentDay) {
    fetchWeatherForDay(_currentDay).then(wMap => {
      if (!wMap || !_weatherPill.isConnected) return;
      const today = localDateStr();
      const dateStr = _currentDay.isFestival ? today : (_currentDay.date || '');
      const w = lookupHourlyWeather(wMap, dateStr, getStopTime(stop));
      if (!w) return;
      const { icon, tempC } = w;
      const lat   = _weatherPill.dataset.lat;
      const lng   = _weatherPill.dataset.lng;
      _weatherPill.innerHTML = `<i class="ph ${icon}"></i> ${tempC}°C`;
      _weatherPill.title = w.conditionText;
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
  const parts = [`<a class="act-btn tesla" href="${navUrl(stop.name, stop.address, stop.lat, stop.lng)}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i></a>`];
  const sType = getStopType(stop);
  if (sType !== 'depart' && sType !== 'transport') {
    if (getStopVegan(stop) || sType === 'food' || sType === 'vegan')
      parts.push(`<button class="act-btn vegan" data-stopid="${stop.id}" data-action="vegan-view"><i class="ph ph-leaf"></i></button>`);
    parts.push(`<button class="act-btn charge" data-stopid="${stop.id}" data-action="charge-view"><i class="ph ph-lightning"></i></button>`);
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
let _editFixed = false;
let _editGpsLat = null, _editGpsLng = null;

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
  { type:'shopping',     ph:'ph-shopping-bag',    label:'Shopping' },
  { type:'showing',      ph:'ph-film-strip',      label:'Showing' },
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
    // If we have a GPS bias, search near current location
    const lat = _editGpsLat, lng = _editGpsLng;
    const biasParam = (lat && lng) ? `&viewbox=${lng-0.3},${lat+0.2},${lng+0.3},${lat-0.2}&bounded=0` : '';
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=en${biasParam}`);
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

async function runNearbySearch() {
  const el = document.getElementById('edit-loc-results');
  const btn = document.getElementById('edit-loc-gps-btn');
  if (!navigator.geolocation) { el.innerHTML = '<div class="edit-loc-no-results">Location not available on this device</div>'; return; }
  el.innerHTML = '<div class="edit-loc-no-results"><i class="ph ph-crosshair"></i> Getting location…</div>';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i>'; }
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    _editGpsLat = lat; _editGpsLng = lng;
    placeEditPin(lat, lng, null);
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ph ph-crosshair" style="color:var(--accent)"></i>'; }
    el.innerHTML = '<div class="edit-loc-no-results"><i class="ph ph-spinner"></i> Finding nearby places…</div>';
    try {
      // Overpass API — grab named amenity/shop/tourism/leisure nodes within 400m
      const r = 400;
      const q = `[out:json][timeout:15];(
        node(around:${r},${lat},${lng})[name][amenity];
        node(around:${r},${lat},${lng})[name][shop];
        node(around:${r},${lat},${lng})[name][tourism];
        node(around:${r},${lat},${lng})[name][leisure];
        node(around:${r},${lat},${lng})[name][historic];
      );out body 40;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST', body: 'data=' + encodeURIComponent(q),
      });
      const data = await res.json();
      let items = (data.elements || []).filter(n => n.tags?.name);
      if (!items.length) {
        // Widen to 1km if nothing close
        const q2 = `[out:json][timeout:15];(
          node(around:1000,${lat},${lng})[name][amenity];
          node(around:1000,${lat},${lng})[name][shop];
          node(around:1000,${lat},${lng})[name][tourism];
          node(around:1000,${lat},${lng})[name][leisure];
        );out body 40;`;
        const res2 = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q2) });
        const data2 = await res2.json();
        items = (data2.elements || []).filter(n => n.tags?.name);
      }
      if (!items.length) { el.innerHTML = '<div class="edit-loc-no-results">No named places found nearby — try typing a name</div>'; return; }

      // Sort by distance from GPS
      items.sort((a, b) => {
        const da = Math.hypot(a.lat - lat, a.lon - lng);
        const db = Math.hypot(b.lat - lat, b.lon - lng);
        return da - db;
      });

      renderNearbyResults(el, items, lat, lng);
    } catch {
      el.innerHTML = '<div class="edit-loc-no-results">Could not load nearby places — check connection or type a name</div>';
    }
  }, () => {
    el.innerHTML = '<div class="edit-loc-no-results">Location permission denied</div>';
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ph ph-crosshair"></i>'; }
  }, { enableHighAccuracy: true, timeout: 12000 });
}

function renderNearbyResults(el, items, originLat, originLng) {
  const distM = (a) => Math.round(Math.hypot((a.lat - originLat) * 111320, (a.lon - originLng) * 111320 * Math.cos(originLat * Math.PI / 180)));
  const typeLabel = t => ({ restaurant:'Restaurant', cafe:'Café', bar:'Bar', pub:'Pub', fast_food:'Fast food',
    hotel:'Hotel', attraction:'Attraction', museum:'Museum', viewpoint:'Viewpoint', gallery:'Gallery',
    shop:'Shop', supermarket:'Supermarket', bakery:'Bakery', clothes:'Clothing', convenience:'Convenience',
    hairdresser:'Salon', pharmacy:'Pharmacy', bank:'Bank' })[t] || (t ? t.replace(/_/g,' ') : '');
  el.innerHTML = `<div class="edit-loc-nearby-label"><i class="ph ph-map-pin"></i> ${items.length} nearby places</div>` +
    items.map(item => {
      const name = item.tags.name;
      const kind = typeLabel(item.tags.amenity || item.tags.shop || item.tags.tourism || item.tags.leisure || item.tags.historic || '');
      const dist = distM(item);
      const distStr = dist < 1000 ? `${dist}m` : `${(dist/1000).toFixed(1)}km`;
      return `<button class="edit-loc-result" data-lat="${item.lat}" data-lng="${item.lon}">
        <span class="edit-loc-result-name">${name}</span>
        <span class="edit-loc-result-sub">${[kind, distStr].filter(Boolean).join(' · ')}</span>
      </button>`;
    }).join('');
  el.querySelectorAll('.edit-loc-result').forEach(b => {
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      const name = b.querySelector('.edit-loc-result-name')?.textContent || b.textContent;
      placeEditPin(parseFloat(b.dataset.lat), parseFloat(b.dataset.lng), name);
      const nameInput = document.getElementById('edit-name');
      if (nameInput && !nameInput.value.trim()) nameInput.value = name;
    });
  });
}

function renderEditTypeGrid(selectedType) {
  _editSelectedType = selectedType;
  const sel = document.getElementById('edit-type-select');
  if (!sel) return;
  const customOpts = (state.customTags || []).map(tag =>
    `<option value="${tag}" ${tag === selectedType ? 'selected' : ''}>${tag}</option>`
  ).join('');
  sel.innerHTML = TYPE_DEFS.map(td =>
    `<option value="${td.type}" ${td.type === selectedType ? 'selected' : ''}>${td.label}</option>`
  ).join('') + (customOpts ? `<optgroup label="Custom">${customOpts}</optgroup>` : '');
  sel.onchange = () => { _editSelectedType = sel.value; };

  // Render custom tag input row
  const wrap = document.getElementById('edit-custom-tag-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (state.customTags && state.customTags.length) {
    const chips = document.createElement('div');
    chips.className = 'custom-tag-chips';
    state.customTags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'custom-tag-chip';
      chip.innerHTML = `${tag}<button class="custom-tag-del" data-tag="${tag}" title="Remove tag"><i class="ph ph-x"></i></button>`;
      chip.querySelector('.custom-tag-del').addEventListener('click', () => {
        state.customTags = state.customTags.filter(t => t !== tag);
        if (_editSelectedType === tag) _editSelectedType = 'food';
        save();
        renderEditTypeGrid(_editSelectedType);
      });
      chips.appendChild(chip);
    });
    wrap.appendChild(chips);
  }
  const addRow = document.createElement('div');
  addRow.className = 'custom-tag-add-row';
  addRow.innerHTML = `<input type="text" id="edit-custom-tag-input" class="edit-input custom-tag-input" placeholder="New tag name…" maxlength="24"><button id="edit-custom-tag-btn" class="edit-search-btn" type="button"><i class="ph ph-plus"></i></button>`;
  wrap.appendChild(addRow);
  addRow.querySelector('#edit-custom-tag-btn').addEventListener('click', () => {
    const inp = addRow.querySelector('#edit-custom-tag-input');
    const val = inp.value.trim();
    if (!val) return;
    if (!state.customTags) state.customTags = [];
    const key = val.toLowerCase().replace(/\s+/g, '_');
    if (!state.customTags.includes(key)) {
      state.customTags.push(key);
      save();
    }
    _editSelectedType = key;
    renderEditTypeGrid(key);
  });
  addRow.querySelector('#edit-custom-tag-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addRow.querySelector('#edit-custom-tag-btn').click(); }
  });
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

const _travelCache = {};  // "lat1,lng1-lat2,lng2" → minutes

function _travelKey(a, b) {
  return `${(a.lat||0).toFixed(4)},${(a.lng||0).toFixed(4)}-${(b.lat||0).toFixed(4)},${(b.lng||0).toFixed(4)}`;
}

async function getCachedTravelMins(fromStop, toStop) {
  const key = _travelKey(fromStop, toStop);
  if (key in _travelCache) return _travelCache[key];
  const mins = await fetchTravelMins(fromStop.lat, fromStop.lng, toStop.lat, toStop.lng);
  _travelCache[key] = mins;
  return mins;
}

async function precomputeTravelTimes(day) {
  const stops = getDayStops(day).filter(s => !state.skipped[s.id] && s.lat && s.lng);
  const pairs = [];
  for (let i = 0; i < stops.length - 1; i++) pairs.push([stops[i], stops[i+1]]);
  // Fetch all pairs in parallel, then update depart-by pills
  await Promise.all(pairs.map(([a, b]) => getCachedTravelMins(a, b)));
  // Update all depart-by pills now that cache is warm
  for (let i = 0; i < stops.length - 1; i++) {
    updateDepartByPill(stops[i], stops[i+1]);
  }
  // Also re-arm notifications with accurate travel times
  if (day.date === localDateStr() || (day.isFestival && localDateStr() >= day.date && localDateStr() <= (day.dateEnd || day.date))) {
    scheduleNotifs();
  }
}

async function recalculateFromStop(day, fromIdx, statusCb) {
  const btn = document.getElementById('edit-recalc-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Recalculating…'; }

  await _recalcChain(day, fromIdx, (done, total) => {
    if (btn) btn.textContent = `Recalculating… (${done}/${total})`;
    if (statusCb) statusCb(done, total);
  });

  save();
  renderView(false);
  if (_editStop !== null) closeEditSheet();
  if (btn) { btn.disabled = false; btn.textContent = 'Recalculate following stops'; }
}

/* Core chain: compute arrival at each stop from fromIdx onwards using OSRM.
   Stops at any fixed stop. Skips depart-type stops in timing (they have 0 duration)
   but uses their location as a routing waypoint. */
async function _recalcChain(day, fromIdx, progressCb) {
  const allStops = getDayStops(day).filter(s => !state.skipped[s.id]);
  const total = allStops.length - 1 - fromIdx;
  for (let i = fromIdx; i < allStops.length - 1; i++) {
    const from = allStops[i];
    const to   = allStops[i + 1];
    if (isStopFixed(to)) break;
    const fromLat = getStopLat(from), fromLng = getStopLng(from);
    const toLat   = getStopLat(to),   toLng   = getStopLng(to);
    if (!fromLat || !toLat) continue;
    const arrMins    = timeToMinutes(getStopTime(from));
    if (arrMins === null) continue;
    const depMins    = arrMins + getStopDuration(from);
    const travelMins = await fetchTravelMins(fromLat, fromLng, toLat, toLng);
    if (travelMins === null) continue;
    state.overrides[to.id] = minutesToTime(depMins + travelMins);
    if (progressCb) progressCb(i - fromIdx + 1, total);
  }
}

/* Ripple from a stop using actual OSRM travel times. Used by travel action. */
async function rippleFromStop(stop, day, onProgress) {
  const allStops = getDayStops(day);
  const fromIdx = allStops.findIndex(s => s.id === stop.id);
  if (fromIdx < 0) return;
  await _recalcChain(day, fromIdx, onProgress);
  save();
  renderView(false);
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
    _editGpsLat = null; _editGpsLng = null;
    const gpsBtn = document.getElementById('edit-loc-gps-btn');
    if (gpsBtn) gpsBtn.innerHTML = '<i class="ph ph-crosshair"></i>';
    const durEl = document.getElementById('edit-dur-native');
    if (durEl) durEl.value = '00:30';
    renderEditTypeGrid('depart');
    renderEditPriority(2);
    _editFixed = false;
    const fixedCb = document.getElementById('edit-fixed');
    if (fixedCb) fixedCb.checked = false;
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
    _editFixed = isStopFixed(stop);
    const fixedCb = document.getElementById('edit-fixed');
    if (fixedCb) fixedCb.checked = _editFixed;
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
  _editFixed   = document.getElementById('edit-fixed')?.checked ?? _editFixed;

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
  const prevTime = getStopTime(_editStop);
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
  state.fixedOverrides[_editStop.id] = _editFixed;

  // Cascade if time changed
  const newTime = time || prevTime;
  const delta = newTime && prevTime ? timeToMinutes(newTime) - timeToMinutes(prevTime) : 0;
  let changed = [];
  if (delta !== 0) changed = cascadeTimeDelta(_editStop, delta);

  save();
  renderView(false);
  if (_detailStop?.id === _editStop.id) {
    document.getElementById('detail-name').innerHTML = stopTypeIcon(_editStop) + ' ' + getStopName(_editStop);
    document.getElementById('detail-time').textContent = getStopTime(_editStop) + (_editStop.tz ? ' ' + _editStop.tz : '');
  }
  closeEditSheet();
  if (changed.length) postCascadeCheck(changed);
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

function renderDetailPlanSection(stop) {
  const planEl = document.getElementById('detail-plan-section');
  const altsEl = document.getElementById('detail-alts-section');
  if (!planEl || !altsEl) return;

  const ps = stop.planStatus;
  const statusLabels = {
    'conditional': '<i class="ph ph-warning"></i> Conditional stop — check before visiting',
    'weak-vegan':  '<i class="ph ph-leaf"></i> Weak vegan fit — limited plant-based options',
    'anchor':      '<i class="ph ph-anchor-simple"></i> Fixed commitment — do not skip',
    'booked':      '<i class="ph ph-check-circle"></i> Booked — confirmed reservation',
  };

  if (ps && statusLabels[ps]) {
    planEl.classList.remove('hidden');
    let html = `<div class="plan-status-banner status-${ps}">${statusLabels[ps]}</div>`;
    const rows = [];
    if (stop.trigger)           rows.push(['When', stop.trigger]);
    if (stop.sameDayAction)     rows.push(['Today', stop.sameDayAction]);
    if (stop.decisionDeadline)  rows.push(['Decide by', `<span class="plan-info-value deadline">${stop.decisionDeadline}</span>`]);
    if (rows.length) {
      html += '<div class="plan-info-rows">' + rows.map(([label, val]) =>
        `<div class="plan-info-row"><span class="plan-info-label">${label}</span><span class="plan-info-value">${val}</span></div>`
      ).join('') + '</div>';
    }
    planEl.innerHTML = html;
  } else if (ps === 'primary' && (stop.trigger || stop.sameDayAction || stop.decisionDeadline)) {
    planEl.classList.remove('hidden');
    const rows = [];
    if (stop.trigger)           rows.push(['Note', stop.trigger]);
    if (stop.sameDayAction)     rows.push(['Today', stop.sameDayAction]);
    if (stop.decisionDeadline)  rows.push(['By', `<span class="plan-info-value deadline">${stop.decisionDeadline}</span>`]);
    planEl.innerHTML = '<div class="plan-info-rows">' + rows.map(([label, val]) =>
      `<div class="plan-info-row"><span class="plan-info-label">${label}</span><span class="plan-info-value">${val}</span></div>`
    ).join('') + '</div>';
  } else {
    planEl.classList.add('hidden');
    planEl.innerHTML = '';
  }

  const alts = stop.alternatives || [];
  if (alts.length) {
    altsEl.classList.remove('hidden');
    const veganLabel = { full:'Fully vegan', wide:'Wide vegan choice', limited:'Limited vegan', single:'One vegan dish' };
    const altCards = alts.map((alt, idx) => {
      const vLabel = alt.veganFit ? veganLabel[alt.veganFit] || alt.veganFit : (alt.veganFriendly ? 'Vegan-friendly' : '');
      const vClass = { full:'full', wide:'', limited:'limited', single:'limited' }[alt.veganFit] || '';
      return `<div class="alt-card">
        <div class="alt-card-header">
          <div class="alt-card-name">${stopTypeIcon(alt)} ${alt.location}</div>
          ${vLabel ? `<span class="alt-card-vegan ${vClass}">${vLabel}</span>` : ''}
        </div>
        <div class="alt-card-reason">${alt.reason}</div>
        ${alt.trigger ? `<div class="alt-card-trigger">Use when: ${alt.trigger}</div>` : ''}
        ${alt.sameDayAction ? `<div class="plan-info-row" style="margin:4px 0 0;font-size:12px"><span class="plan-info-label">Today</span><span class="plan-info-value">${alt.sameDayAction}</span></div>` : ''}
        <div class="alt-card-actions">
          <button class="alt-card-btn switch-btn" data-alt-idx="${idx}"><i class="ph ph-shuffle"></i> Use this instead</button>
          <a class="alt-card-btn maps-btn" href="${alt.mapsUrl}" target="_blank" rel="noopener"><i class="ph ph-map-trifold"></i> Maps</a>
        </div>
      </div>`;
    }).join('');
    altsEl.innerHTML =
      `<div class="detail-alts-toggle" id="detail-alts-toggle">
        <div class="detail-alts-toggle-label"><i class="ph ph-shuffle"></i> Alternatives <span class="detail-alts-toggle-count">${alts.length}</span></div>
        <i class="ph ph-caret-down detail-alts-chevron"></i>
      </div>
      <div id="detail-alts-list">${altCards}</div>`;
    altsEl.querySelector('#detail-alts-toggle').addEventListener('click', () => {
      const toggle = altsEl.querySelector('#detail-alts-toggle');
      const list   = altsEl.querySelector('#detail-alts-list');
      toggle.classList.toggle('open');
      list.classList.toggle('open');
    });
    altsEl.querySelectorAll('.switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const altIdx = parseInt(btn.dataset.altIdx, 10);
        switchToAlternative(stop, alts[altIdx]);
      });
    });
  } else {
    altsEl.classList.add('hidden');
    altsEl.innerHTML = '';
  }
}

function switchToAlternative(primaryStop, alt) {
  saveUndoSnapshot();
  // Find the day containing the primary stop
  const day = TRIP_DATA.days.find(d => getDayStops(d).some(s => s.id === primaryStop.id));
  if (!day) return;

  // Skip the primary stop
  state.skipped[primaryStop.id] = true;
  delete state.checked[primaryStop.id];

  // Build a new stop object from the alternative, inheriting the primary's time and order
  const newStop = {
    id:           alt.id,
    order:        primaryStop.order + 0.5,   // insert right after primary
    time:         getStopTime(primaryStop),
    tz:           primaryStop.tz || 'FR',
    location:     alt.location,
    type:         alt.type || primaryStop.type,
    priority:     primaryStop.priority,
    lat:          alt.lat,
    lng:          alt.lng,
    mapsUrl:      alt.mapsUrl,
    reason:       alt.reason,
    duration:     alt.duration || primaryStop.duration,
    veganFriendly: alt.veganFriendly || false,
    planStatus:   'primary',
  };

  // Add to addedStops for this day
  if (!state.addedStops[day.id]) state.addedStops[day.id] = [];
  // Remove any prior switch to the same alt
  state.addedStops[day.id] = state.addedStops[day.id].filter(s => s.id !== alt.id);
  state.addedStops[day.id].push(newStop);

  // If primary had a linked depart stop, skip that too
  const dayStops = getDayStops(day);
  const pIdx = dayStops.findIndex(s => s.id === primaryStop.id);
  const next = dayStops[pIdx + 1];
  if (next && getStopType(next) === 'depart') state.skipped[next.id] = true;

  save();
  closeDetail();
  renderView(false);
  showToast(`Switched to ${alt.location}`);
}

function renderDetailTimeStrip(stop, container) {
  const todayStr = localDateStr();
  const today = TRIP_DATA.days.find(d => getDayStops(d).some(s => s.id === stop.id));
  const isToday = today && today.date === todayStr;
  const stopType = getStopType(stop);
  const interactive = isToday && stopType !== 'depart';

  const arrVal  = getStopTime(stop) || '';
  const durMins = getStopDuration(stop) || 0;
  const durH    = Math.floor(durMins / 60);
  const durM    = durMins % 60;
  const durStr  = durH > 0 ? `${durH}h${durM > 0 ? durM + 'm' : ''}` : `${durMins}m`;
  const arrMins = timeToMinutes(arrVal) ?? null;
  const depVal  = (arrMins !== null && durMins > 0) ? minutesToTime(arrMins + durMins) : '';

  if (interactive) {
    container.innerHTML = `
      <div class="dts-row">
        <div class="dts-chip dts-input-chip">
          <span class="dts-label">Arrived</span>
          <input class="dts-time-input" id="dts-arr-input" type="time" value="${arrVal}">
        </div>
        <div class="dts-chip dts-dur-chip">
          <button class="dts-step-btn" id="dts-dur-minus"><i class="ph ph-minus"></i></button>
          <div class="dts-dur-inner">
            <i class="ph ph-timer" style="font-size:13px;color:var(--text2)"></i>
            <span class="dts-time" id="dts-dur-val">${durStr}</span>
          </div>
          <button class="dts-step-btn" id="dts-dur-plus"><i class="ph ph-plus"></i></button>
        </div>
        <div class="dts-chip dts-input-chip">
          <span class="dts-label">Depart</span>
          <input class="dts-time-input" id="dts-dep-input" type="time" value="${depVal}">
        </div>
      </div>
      <div class="dts-now-row">
        <button class="dts-now-full-btn" id="dts-arr-now"><i class="ph ph-clock"></i> Arrived now</button>
        <button class="dts-now-full-btn" id="dts-dep-now"><i class="ph ph-sign-out"></i> Departed now</button>
      </div>`;
    container.classList.remove('hidden');

    const arrInput = document.getElementById('dts-arr-input');
    const depInput = document.getElementById('dts-dep-input');
    const durVal   = document.getElementById('dts-dur-val');

    // Update dep input and duration display in-place — avoids destroying the
    // native iOS time picker by never calling renderDetailTimeStrip during input.
    const refreshDisplay = () => {
      const arr = timeToMinutes(getStopTime(stop));
      const dur = getStopDuration(stop) || 0;
      const h = Math.floor(dur / 60), m = dur % 60;
      if (durVal) durVal.textContent = h > 0 ? `${h}h${m > 0 ? m + 'm' : ''}` : `${dur}m`;
      if (depInput && arr !== null && dur > 0) depInput.value = minutesToTime(arr + dur);
    };

    arrInput?.addEventListener('change', () => {
      const newArr = timeToMinutes(arrInput.value);
      if (newArr === null) return;
      saveUndoSnapshot();
      const oldArr = timeToMinutes(getStopTime(stop)) ?? newArr;
      const delta  = newArr - oldArr;
      state.overrides[stop.id] = minutesToTime(newArr);
      cascadeTimeDelta(stop, delta);
      save(); renderView(false); refreshDisplay();
      showUndoToast('Arrival updated — times rippled');
    });

    depInput?.addEventListener('change', () => {
      const newDep = timeToMinutes(depInput.value);
      if (newDep === null) return;
      saveUndoSnapshot();
      const curArr = timeToMinutes(getStopTime(stop));
      if (curArr !== null) state.durOverrides[stop.id] = Math.max(0, newDep - curArr);
      cascadeFromDeparture(stop, newDep);
      save(); renderView(false); refreshDisplay();
      showUndoToast('Departure updated — times rippled');
    });

    document.getElementById('dts-arr-now')?.addEventListener('click', () => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      saveUndoSnapshot();
      const oldArr = timeToMinutes(getStopTime(stop)) ?? nowMins;
      state.overrides[stop.id] = minutesToTime(nowMins);
      cascadeTimeDelta(stop, nowMins - oldArr);
      save(); renderView(false); renderDetailTimeStrip(stop, container);
      showUndoToast('Arrival set to now — times updated');
    });

    document.getElementById('dts-dep-now')?.addEventListener('click', () => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      saveUndoSnapshot();
      const curArr = timeToMinutes(getStopTime(stop));
      if (curArr !== null) state.durOverrides[stop.id] = Math.max(0, nowMins - curArr);
      cascadeFromDeparture(stop, nowMins);
      save(); renderView(false); renderDetailTimeStrip(stop, container);
      showUndoToast('Departed now — times updated');
    });

    document.getElementById('dts-dur-minus')?.addEventListener('click', () => {
      saveUndoSnapshot();
      state.durOverrides[stop.id] = Math.max(0, (getStopDuration(stop) || 0) - 5);
      cascadeTimeDelta(stop, -5);
      save(); renderView(false); refreshDisplay();
    });

    document.getElementById('dts-dur-plus')?.addEventListener('click', () => {
      saveUndoSnapshot();
      state.durOverrides[stop.id] = (getStopDuration(stop) || 0) + 5;
      cascadeTimeDelta(stop, 5);
      save(); renderView(false); refreshDisplay();
    });

  } else {
    container.innerHTML = `
      <div class="dts-row">
        <div class="dts-chip">
          <span class="dts-label">Arrived</span>
          <span class="dts-time">${arrVal || '—'}</span>
        </div>
        <div class="dts-chip dts-dur-chip">
          <div class="dts-dur-inner">
            <i class="ph ph-timer" style="font-size:13px;color:var(--text2)"></i>
            <span class="dts-time">${durStr}</span>
          </div>
        </div>
        <div class="dts-chip">
          <span class="dts-label">Depart</span>
          <span class="dts-time">${depVal || '—'}</span>
        </div>
      </div>`;
    container.classList.remove('hidden');
  }
}

function renderLegInfo(stop) {
  const el = document.getElementById('detail-leg-info');
  if (!el) return;
  el.classList.add('hidden');
  el.innerHTML = '';

  // Find next non-skipped stop in the day
  const day = TRIP_DATA.days.find(d => getDayStops(d).some(s => s.id === stop.id));
  if (!day) return;
  const sorted = getDayStops(day).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  const idx = sorted.findIndex(s => s.id === stop.id);
  const next = sorted.slice(idx + 1).find(s => !state.skipped[s.id] && s.lat && s.lng);
  if (!next || !stop.lat || !stop.lng) return;

  const straightKm = haversineM(stop.lat, stop.lng, next.lat, next.lng) / 1000;
  const depMins  = (timeToMinutes(getStopTime(stop)) ?? 0) + (getStopDuration(stop) ?? 0);
  const arrMins  = timeToMinutes(getStopTime(next));
  const gapMins  = arrMins !== null ? arrMins - depMins : null;
  const gapStr   = gapMins !== null && gapMins > 0
    ? (gapMins >= 60 ? `${Math.floor(gapMins/60)}h${gapMins%60?gapMins%60+'m':''}` : `${gapMins}m`)
    : null;

  el.innerHTML = `<i class="ph ph-arrow-right"></i>
    <span class="leg-next-name">${next.location || getStopName(next)}</span>
    <span class="leg-travel" id="leg-travel-val">
      <i class="ph ph-spinner vegan-spin"></i>
    </span>`;
  el.classList.remove('hidden');

  // Async: fetch OSRM driving route
  const url = `https://router.project-osrm.org/route/v1/driving/${stop.lng},${stop.lat};${next.lng},${next.lat}?overview=false`;
  fetch(url).then(r => r.json()).then(d => {
    const route = d.routes?.[0];
    const travelEl = document.getElementById('leg-travel-val');
    if (!travelEl) return;
    if (route) {
      const roadKm   = (route.distance / 1000).toFixed(1);
      const roadMins = Math.ceil(route.duration / 60);
      const rH = Math.floor(roadMins / 60), rM = roadMins % 60;
      const rStr = roadMins >= 60 ? `${rH}h${rM ? rM + 'm' : ''}` : `${roadMins}m`;
      travelEl.innerHTML = `${rStr} drive &middot; ${roadKm}km`;
    } else {
      travelEl.innerHTML = `~${straightKm.toFixed(1)}km${gapStr ? ' &middot; ' + gapStr + ' planned' : ''}`;
    }
  }).catch(() => {
    const travelEl = document.getElementById('leg-travel-val');
    if (travelEl) travelEl.innerHTML = `~${straightKm.toFixed(1)}km${gapStr ? ' &middot; ' + gapStr : ''}`;
  });
}

function openStopSheet(stopId) {
  const stop = findStop(stopId);
  if (!stop) return;
  const existing = document.getElementById('stop-sheet');
  if (existing) existing.remove();

  const isVisited = !!state.checked[stopId];
  const isSkipped = !!state.skipped[stopId];
  const pinned    = isPinned(stopId);
  const canPin    = canUnpin();
  const canEdit   = state.isOwner || state.memberRole === 'editor';

  const sheet = document.createElement('div');
  sheet.id = 'stop-sheet';
  sheet.className = 'stop-sheet';
  sheet.innerHTML = `
    <div class="stop-sheet-handle"></div>
    <div class="stop-sheet-header">
      <div class="stop-sheet-title">${stopTypeIcon(stop)} ${getStopName(stop)}</div>
      <button class="stop-sheet-close" aria-label="Close"><i class="ph ph-x"></i></button>
    </div>
    <div class="stop-sheet-body">
      ${getStopReason(stop) ? `<p class="stop-sheet-reason">${getStopReason(stop)}</p>` : ''}
      ${buildTags(stop)}
      <div class="stop-sheet-actions">
        <a class="sheet-action-btn" href="${navUrl(stop.location, stop.address, stop.lat, stop.lng)}" target="_blank" rel="noopener">
          <i class="ph ph-navigation-arrow"></i> Navigate
        </a>
        <button class="sheet-action-btn" onclick="openStopSheetFind('${stopId}','food')">
          <i class="ph ph-fork-knife"></i> Food nearby
        </button>
        <button class="sheet-action-btn" onclick="openStopSheetFind('${stopId}','charging')">
          <i class="ph ph-lightning"></i> Charger nearby
        </button>
        ${canEdit ? `<button class="sheet-action-btn" onclick="openTimeModal(findStop('${stopId}'),TRIP_DATA.days.find(d=>d.id===state.currentDayId));closeStopSheet()">
          <i class="ph ph-clock"></i> Edit time
        </button>` : ''}
        <button class="sheet-action-btn${pinned ? ' active' : ''}${!canPin && pinned ? ' locked' : ''}"
          onclick="${canPin ? `togglePinSheet('${stopId}')` : 'showToast(\"Only editors can unpin\")'}"
        >
          <i class="ph ${pinned ? 'ph-push-pin' : 'ph-push-pin-slash'}"></i> ${pinned ? 'Unpin' : 'Pin'}
        </button>
        <button class="sheet-action-btn${isVisited ? ' active' : ''}" onclick="toggleCheck('${stopId}',null);closeStopSheet()">
          <i class="ph ${isVisited ? 'ph-check-circle' : 'ph-circle'}"></i> ${isVisited ? 'Visited' : 'Mark visited'}
        </button>
        <button class="sheet-action-btn sheet-skip-btn${isSkipped ? ' active' : ''}" onclick="toggleSkip('${stopId}');closeStopSheet()">
          <i class="ph ph-x-circle"></i> ${isSkipped ? 'Restore' : 'Skip'}
        </button>
        <button class="sheet-action-btn sheet-remove-btn" onclick="removeStopFromSheet('${stopId}')">
          <i class="ph ph-trash"></i> Remove
        </button>
      </div>
    </div>`;
  sheet.querySelector('.stop-sheet-close').addEventListener('click', closeStopSheet);

  const overlay = document.createElement('div');
  overlay.id = 'stop-sheet-overlay';
  overlay.className = 'stop-sheet-overlay';
  overlay.addEventListener('click', closeStopSheet);
  document.body.appendChild(overlay);
  document.body.appendChild(sheet);
  requestAnimationFrame(() => { sheet.classList.add('open'); overlay.classList.add('open'); });
}

function closeStopSheet() {
  const sheet   = document.getElementById('stop-sheet');
  const overlay = document.getElementById('stop-sheet-overlay');
  if (sheet)   { sheet.classList.remove('open'); sheet.addEventListener('transitionend', () => sheet.remove(), { once: true }); }
  if (overlay) { overlay.classList.remove('open'); overlay.addEventListener('transitionend', () => overlay.remove(), { once: true }); }
}

function togglePinSheet(stopId) {
  togglePin(stopId, null);
  closeStopSheet();
}

function toggleSkip(stopId) {
  if (state.skipped[stopId]) {
    delete state.skipped[stopId];
  } else {
    state.skipped[stopId] = true;
  }
  save();
  renderView(false);
}

function removeStopFromSheet(stopId) {
  const stop = findStop(stopId);
  if (stop) moveStopToBucketList(stop);
  closeStopSheet();
}

function openStopSheetFind(stopId, filter) {
  const stop = findStop(stopId);
  if (stop?.lat) { _userLat = stop.lat; _userLng = stop.lng; }
  closeStopSheet();
  state.currentView = 'find';
  state._findFilter = filter;
  renderView(false);
}

function openDetail(stop) {
  _detailStop = stop;
  _detailCurrent = 0;
  const overlay = document.getElementById('detail-overlay');
  document.getElementById('detail-page').scrollTop = 0;
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

  // ── Plan status + alternatives ──────────────────────────────────────
  renderDetailPlanSection(stop);

  // ── Address / info / links (match vegan search result style) ──────────
  const _hoursEl = document.getElementById('detail-hours-row');
  const _addrEl  = document.getElementById('detail-address-row');
  const _infoEl  = document.getElementById('detail-info-rows');
  const _extEl   = document.getElementById('detail-ext-links');
  [_hoursEl, _addrEl, _infoEl, _extEl].forEach(el => { if (el) { el.innerHTML = ''; el.classList.add('hidden'); } });

  if (_hoursEl && stop.openingHours) {
    const oh = parseOpeningHours(stop.openingHours);
    _hoursEl.innerHTML = `${openHoursBadge(oh.open, oh.nextOpen, oh.todayStr)}${oh.todayStr ? `<span class="vd-hours-str">${oh.todayStr}</span>` : ''}`;
    _hoursEl.classList.remove('hidden');
  }

  const _addr = stop.address || stop.location;
  if (_addrEl && _addr) {
    _addrEl.innerHTML = `<div class="vd-info-row"><i class="ph ph-map-pin"></i><span>${_addr}</span></div>`;
    _addrEl.classList.remove('hidden');
  }

  if (_infoEl) {
    const _rows = [];
    if (stop.cuisine)  _rows.push(`<div class="vd-info-row"><i class="ph ph-fork-knife"></i><span>${stop.cuisine}</span></div>`);
    if (stop.phone)    _rows.push(`<div class="vd-info-row"><i class="ph ph-phone"></i><a href="tel:${stop.phone}" class="vd-link">${stop.phone}</a></div>`);
    if (stop.website)  _rows.push(`<div class="vd-info-row"><i class="ph ph-globe"></i><a href="${stop.website}" target="_blank" rel="noopener" class="vd-link">Website</a></div>`);
    if (_rows.length) { _infoEl.innerHTML = _rows.join(''); _infoEl.classList.remove('hidden'); }
  }

  if (_extEl && stop.lat && stop.lng) {
    const _st = getStopType(stop);
    const _hcUrl = `https://www.happycow.net/searchmap?lat=${stop.lat}&lng=${stop.lng}&zoom=15`;
    const _gmUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((stop.name||'') + ' ' + (_addr||''))}`;
    const _extBtns = [];
    if (_st === 'food' || _st === 'vegan' || getStopVegan(stop))
      _extBtns.push(`<a class="vd-link-btn happycow" href="${_hcUrl}" target="_blank" rel="noopener"><i class="ph ph-leaf"></i><div><strong>HappyCow</strong><small>Vegan reviews</small></div></a>`);
    _extBtns.push(`<a class="vd-link-btn gmaps" href="${_gmUrl}" target="_blank" rel="noopener"><i class="ph ph-google-logo"></i><div><span class="vd-link-title">Google Maps</span><span class="vd-link-sub">Reviews &amp; photos</span></div></a>`);
    _extEl.innerHTML = `<div class="vd-links-row">${_extBtns.join('')}</div>`;
    _extEl.classList.remove('hidden');
  }

  const toolbarEl = document.getElementById('detail-toolbar');
  const toolBtns = [`<a class="detail-tool-btn nav-tool" href="${navUrl(stop.name, stop.address, stop.lat, stop.lng)}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i>Navigate</a>`];
  if (getStopVegan(stop) || getStopType(stop) === 'food' || getStopType(stop) === 'vegan')
    toolBtns.push(`<button class="detail-tool-btn vegan-tool" id="dtb-vegan"><i class="ph ph-leaf"></i>Vegan</button>`);
  toolBtns.push(`<button class="detail-tool-btn charge-tool" id="dtb-charge"><i class="ph ph-lightning"></i>Charge</button>`);
  if (stop.mapsUrl && stop.mapsUrl !== 'N/A')
    toolBtns.push(`<a class="detail-tool-btn maps-tool" href="${stop.mapsUrl}" target="_blank" rel="noopener"><i class="ph ph-map-trifold"></i>Maps</a>`);
  toolbarEl.innerHTML = toolBtns.join('');
  toolbarEl.querySelector('#dtb-vegan')?.addEventListener('click', () => {
    if (stop.lat) { _userLat = stop.lat; _userLng = stop.lng; }
    closeDetail();
    state.currentView = 'vegan';
    renderView(true);
  });
  toolbarEl.querySelector('#dtb-charge')?.addEventListener('click', () => {
    if (stop.lat) { _userLat = stop.lat; _userLng = stop.lng; }
    closeDetail();
    state.currentView = 'charging';
    renderView(true);
  });
  document.getElementById('detail-edit-btn').onclick = () => openEditSheet(stop);

  // Time strip
  const timeStripEl = document.getElementById('detail-time-strip');
  if (timeStripEl) {
    timeStripEl.innerHTML = '';
    timeStripEl.classList.add('hidden');
    renderDetailTimeStrip(stop, timeStripEl);
  }

  // Leg info — distance + drive time to next stop
  renderLegInfo(stop);

  // Travel action buttons — Skip stop only (time/duration handled by time strip above)
  const travelActEl = document.getElementById('detail-travel-actions');
  if (travelActEl) {
    const stopType = getStopType(stop);
    if (stopType !== 'depart') {
      const isSkippedNow = !!state.skipped[stop.id];
      travelActEl.innerHTML = `<button class="travel-action-btn detail-skip-btn${isSkippedNow ? ' active' : ''}" data-stop-id="${stop.id}">
        <i class="ph ${isSkippedNow ? 'ph-arrow-u-up-left' : 'ph-x-circle'}"></i> ${isSkippedNow ? 'Restore stop' : 'Skip stop'}
      </button>`;
      travelActEl.classList.remove('hidden');
      travelActEl.classList.remove('hidden');
      travelActEl.querySelector('.detail-skip-btn')?.addEventListener('click', () => {
        if (state.skipped[stop.id]) {
          delete state.skipped[stop.id];
          save(); renderView(false); closeDetail();
        } else {
          closeDetail();
          skipStop(stop);
        }
      });
      const bucketBtn = document.createElement('button');
      bucketBtn.className = 'travel-action-btn detail-bucket-btn';
      bucketBtn.innerHTML = '<i class="ph ph-bookmark-simple"></i> Move to Bucket List';
      bucketBtn.addEventListener('click', () => {
        moveStopToBucketList(stop);
        closeDetail();
        showToast('Moved to Bucket List');
      });
      travelActEl.appendChild(bucketBtn);
      const rescheduleBtn = document.createElement('button');
      rescheduleBtn.className = 'travel-action-btn detail-reschedule-btn';
      rescheduleBtn.innerHTML = '<i class="ph ph-calendar-dots"></i> Reschedule to another day';
      rescheduleBtn.addEventListener('click', () => openRescheduleSheet(stop));
      travelActEl.appendChild(rescheduleBtn);
    } else {
      travelActEl.innerHTML = '';
      travelActEl.classList.add('hidden');
    }
  }

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
        const today = localDateStr();
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

  // Inject Google data for food/vegan planned stops
  const stopType = getStopType(stop);
  if ((stopType === 'food' || stopType === 'vegan') && stop.lat && stop.lng) {
    const cacheKey = 'stop_' + stop.id;
    const heroEl = document.getElementById('detail-hero');
    const bodyEl = document.getElementById('detail-body');
    // Check cache first
    if (_placeGoogleCache[cacheKey]) {
      injectGoogleData(_placeGoogleCache[cacheKey], heroEl, bodyEl);
    } else {
      const query = [stop.name, stop.address].filter(Boolean).join(', ');
      fetchGooglePlace(query, stop.lat, stop.lng).then(gData => {
        if (gData) {
          _placeGoogleCache[cacheKey] = gData;
          injectGoogleData(gData, heroEl, bodyEl);
        }
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
    if (sliderWrap  && sliderWrap.contains(e.target))  return;
    if (poiCarousel && poiCarousel.contains(e.target)) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    diffX = 0; isHoriz = null; active = true;
  }, { passive: true });

  page.addEventListener('touchmove', e => {
    if (!active) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (isHoriz === null) {
      if (Math.abs(dy) > 30)                      { active = false; return; }
      if (Math.abs(dx) > Math.abs(dy) + 8)        isHoriz = true;
      else if (Math.abs(dy) > Math.abs(dx) + 8)   { active = false; return; }
      else return;
    }
    if (!isHoriz) { active = false; return; }
    diffX = dx;
    page.style.transition = 'none';
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

    if (diffX > 100) {
      const prev = idx > 0 ? _ds[idx - 1] : null;
      if (prev) openDetail(prev);
      else closeDetail();
    } else if (diffX < -100) {
      const next = idx >= 0 ? _ds[idx + 1] : null;
      if (next) openDetail(next);
    }
  });
}

/* ── Ticket toggle (showing stops) ─────────────────────────────────── */
function toggleTicket(stopId, e) {
  if (e) e.stopPropagation();
  if (!state.personalTickets) state.personalTickets = {};
  const cur = hasTicket({ id: stopId });
  state.personalTickets[stopId] = !cur;
  save();
  renderView(false);
}

/* ── Pin toggle ─────────────────────────────────────────────────────── */
function togglePin(stopId, e) {
  if (e) e.stopPropagation();
  if (!canUnpin() && isPinned(stopId)) {
    showToast('Only editors can unpin stops');
    return;
  }
  if (!state.personalPinned) state.personalPinned = {};
  state.personalPinned[stopId] = !state.personalPinned[stopId];
  save();
  // Re-render just the pin button without full re-render
  document.querySelectorAll(`[data-pin-btn="${stopId}"]`).forEach(btn => {
    btn.classList.toggle('pinned', !!state.personalPinned[stopId]);
    btn.title = state.personalPinned[stopId] ? 'Pinned — tap to unpin' : 'Unpinned — tap to pin';
  });
}

/* ── Check off ─────────────────────────────────────────────────────── */
function toggleCheck(stopId, itemEl) {
  state.checked[stopId] = !state.checked[stopId];
  // Auto-pin when checking; auto-unpin only if editor/owner
  if (state.checked[stopId]) {
    if (!state.personalPinned) state.personalPinned = {};
    state.personalPinned[stopId] = true;
    // Owner check-in drives shared group position
    if (state.isOwner) state.ownerCurrentStopId = stopId;
  }
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
  const stopType = getStopType(stop);
  document.getElementById('modal-cascade').checked = (stopType === 'depart' || stopType === 'transport');
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function resetDayTimes() {
  if (!_modalDay) return;
  // Clear time overrides and cross-day moves for all stops originating from this day
  const stops = [
    ..._modalDay.stops,
    ...(state.addedStops?.[_modalDay.id] || []),
  ];
  stops.forEach(s => {
    delete state.overrides[s.id];
    delete state.crossDayMoves[s.id];
  });
  save(); closeModal(); renderView(false);
  showToast('Day times reset to defaults');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  _modalStop = _modalDay = null;
}
function getStopHomeDayIdx(stop) {
  for (let i = 0; i < TRIP_DATA.days.length; i++) {
    const d = TRIP_DATA.days[i];
    if (d.stops?.find(s => s.id === stop.id)) return i;
    if ((state.addedStops?.[d.id] || []).find(s => s.id === stop.id)) return i;
  }
  return -1;
}

function saveModal() {
  if (!_modalStop || !_modalDay) return;
  const newTime = document.getElementById('modal-time-input').value;
  const cascade = document.getElementById('modal-cascade').checked;
  const delta = timeToMinutes(newTime) - timeToMinutes(getStopTime(_modalStop));
  state.overrides[_modalStop.id] = newTime;

  if (cascade && delta !== 0) {
    const days = TRIP_DATA.days;
    const dayIdx = days.findIndex(d => d.id === _modalDay.id);
    if (!state.crossDayMoves) state.crossDayMoves = {};

    // Only cascade stops that ORIGINATE from _modalDay (not stops independently
    // scheduled on later days). Include stops previously moved out of _modalDay.
    const homeDayStops = [
      ..._modalDay.stops,
      ...(state.addedStops?.[_modalDay.id] || []),
    ];
    const homeDayIds = new Set(homeDayStops.map(s => s.id));

    // Also include stops previously moved from _modalDay into later days
    const movedFromThisDay = Object.entries(state.crossDayMoves)
      .filter(([stopId]) => homeDayIds.has(stopId))
      .map(([stopId]) => homeDayStops.find(s => s.id === stopId))
      .filter(Boolean);

    // Collect stops after the edited stop (by current time order)
    const allHomeDayStops = [...homeDayStops];
    allHomeDayStops.sort((a, b) => {
      const ta = timeToMinutes(getStopTime(a)) ?? Infinity;
      const tb = timeToMinutes(getStopTime(b)) ?? Infinity;
      return ta - tb;
    });

    let found = false;
    const toUpdate = [];
    allHomeDayStops.forEach(s => {
      if (!found) { if (s.id === _modalStop.id) found = true; return; }
      toUpdate.push(s);
    });
    // Also bring back any that were moved out (they may not be in sorted order above)
    movedFromThisDay.forEach(s => {
      if (!toUpdate.find(t => t.id === s.id) && s.id !== _modalStop.id) toUpdate.push(s);
    });

    const changedStops = [];
    toUpdate.forEach(stop => {
      const cur = timeToMinutes(getStopTime(stop));
      if (cur === null) return;

      // Compute current absolute position: home day * 1440 + time on that day
      const currentDayIdx = state.crossDayMoves[stop.id]
        ? days.findIndex(d => d.id === state.crossDayMoves[stop.id])
        : dayIdx;
      const absoluteMins = currentDayIdx * 1440 + cur;
      const newAbsolute  = absoluteMins + delta;
      const targetDayIdx = Math.min(Math.max(0, Math.floor(newAbsolute / 1440)), days.length - 1);
      const newTimeStr   = minutesToTime(newAbsolute);

      state.overrides[stop.id] = newTimeStr;

      if (targetDayIdx !== dayIdx) {
        state.crossDayMoves[stop.id] = days[targetDayIdx].id;
      } else {
        delete state.crossDayMoves[stop.id];
      }
      changedStops.push({ stop, newTime: newTimeStr, dayDate: days[targetDayIdx]?.date });
    });

    if (changedStops.length) postCascadeCheck(changedStops);
  }
  save(); closeModal(); renderView(false);
}

/* ── Travel actions: Departed / Arrived / Extend ───────────────────── */

function snapshotState() {
  return {
    overrides:         JSON.parse(JSON.stringify(state.overrides)),
    checked:           JSON.parse(JSON.stringify(state.checked)),
    durOverrides:      JSON.parse(JSON.stringify(state.durOverrides)),
    crossDayMoves:     JSON.parse(JSON.stringify(state.crossDayMoves || {})),
  };
}

let _undoSnapshot = null;
let _undoTimer = null;

function saveUndoSnapshot() {
  _undoSnapshot = snapshotState();
}

function showUndoToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) { el = document.createElement('div'); el.id = 'app-toast'; document.getElementById('app').appendChild(el); }
  el.innerHTML = `${msg} <button id="undo-btn" style="margin-left:10px;font-weight:700;text-decoration:underline;background:none;border:none;color:inherit;cursor:pointer;font-size:inherit">Undo</button>`;
  el.classList.add('visible');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.classList.remove('visible'); _undoSnapshot = null; }, 10000);
  document.getElementById('undo-btn').addEventListener('click', () => {
    if (!_undoSnapshot) return;
    Object.assign(state.overrides,     _undoSnapshot.overrides);
    Object.assign(state.checked,       _undoSnapshot.checked);
    Object.assign(state.durOverrides,  _undoSnapshot.durOverrides);
    state.crossDayMoves = _undoSnapshot.crossDayMoves;
    _undoSnapshot = null;
    save(); renderView(false);
    el.classList.remove('visible');
    showToast('Changes undone');
  });
}

function extendStop(stop, deltaMins) {
  saveUndoSnapshot();
  const cur  = state.durOverrides[stop.id] ?? stop.duration ?? 30;
  const next = Math.max(5, cur + deltaMins);
  state.durOverrides[stop.id] = next;
  // Duration only — arrival times of other stops are not touched.
  // Use the time modal (ripple) to shift following stops.
  save(); renderView(false);
}

function moveStopToBucketList(stop) {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId) || TRIP_DATA.days[0];
  const isAdded = (state.addedStops[day.id] || []).some(s => s.id === stop.id);
  if (stop.id.startsWith('vegan_') || stop.id.startsWith('gplace_') || isAdded) {
    if (state.addedStops[day.id]) {
      state.addedStops[day.id] = state.addedStops[day.id].filter(s => s.id !== stop.id);
    }
  } else {
    state.removed[stop.id] = true;
  }
  state.bucketList.unshift({ stop: { ...stop }, dayLabel: getDayLabel(day), originalDayId: day.id, removedAt: Date.now() });
  delete state.skipped[stop.id];
  delete state.checked[stop.id];
  save();
}

async function skipStop(stop) {
  saveUndoSnapshot();
  state.skipped[stop.id] = true;
  delete state.checked[stop.id];

  // Find the day and surrounding stops to calculate time saving
  const day = TRIP_DATA.days.find(d => getDayStops(d).some(s => s.id === stop.id));
  if (!day) { save(); renderView(false); return; }

  const dayStops = getDayStops(day).filter(s => getStopType(s) !== 'depart');
  const idx = dayStops.findIndex(s => s.id === stop.id);
  const prevStop = idx > 0 ? dayStops[idx - 1] : null;
  const nextStop = idx < dayStops.length - 1 ? dayStops[idx + 1] : null;

  // Auto-skip the immediately following depart stop (it's linked to this stop)
  const departAfter = dayStops[idx + 1];
  if (departAfter && getStopType(departAfter) === 'depart') {
    state.skipped[departAfter.id] = true;
  }

  if (!nextStop) { save(); renderView(false); return; }

  // Time freed = duration of skipped stop
  const freedMins = getStopDuration(stop);

  // Routing delta: (prev→skip→next) vs (prev→next) if we have coords
  let routingDelta = 0;
  if (prevStop && getStopLat(prevStop) && getStopLng(prevStop) &&
      getStopLat(stop) && getStopLng(stop) &&
      getStopLat(nextStop) && getStopLng(nextStop)) {
    const [viaTime, directTime] = await Promise.all([
      fetchTravelMins(getStopLat(prevStop), getStopLng(prevStop), getStopLat(stop),    getStopLng(stop)),
      fetchTravelMins(getStopLat(stop),     getStopLng(stop),     getStopLat(nextStop), getStopLng(nextStop)),
    ]).then(([a, b]) => [
      // via skip: prev→skip + skip→next
      (a ?? 0) + (b ?? 0),
      // direct: just fetch prev→next
      null,
    ]);
    const directOnlyTime = await fetchTravelMins(
      getStopLat(prevStop), getStopLng(prevStop),
      getStopLat(nextStop), getStopLng(nextStop)
    );
    if (directOnlyTime !== null) routingDelta = viaTime - directOnlyTime; // positive = time saved by skipping
  }

  const totalSaving = freedMins + routingDelta;

  if (totalSaving > 0) {
    // Shift all following non-skipped stops on this day earlier
    let found = false;
    dayStops.forEach(s => {
      if (!found) { if (s.id === stop.id) found = true; return; }
      if (state.skipped[s.id]) return;
      const t = timeToMinutes(getStopTime(s));
      if (t !== null) state.overrides[s.id] = minutesToTime(t - totalSaving);
    });
    showToast(`Skipped · ${totalSaving}m saved · stops brought forward`);
  } else {
    showToast('Stop skipped');
  }

  save(); renderView(false);
}

function resetStopDuration(stop) {
  saveUndoSnapshot();
  delete state.durOverrides[stop.id];
  save(); renderView(false);
}

let _travelActionStop = null;
let _travelActionType = null;

function openTravelAction(stop, type) {
  _travelActionStop = stop;
  _travelActionType = type;
  const planned = getStopTime(stop);
  const actual  = minutesToTime(nowMinutes());
  const delta   = nowMinutes() - (timeToMinutes(planned) || 0);
  const lateStr = delta > 0 ? `${delta} min late` : delta < 0 ? `${-delta} min early` : 'on time';
  const label   = type === 'departed' ? 'Departed' : 'Arrived';

  document.getElementById('travel-action-title').textContent = `${label}: ${getStopName(stop)}`;
  document.getElementById('travel-action-summary').textContent =
    `Planned ${planned} · Actual ${actual} · ${lateStr}`;

  const skipList = document.getElementById('travel-action-skip-list');
  skipList.innerHTML = '';
  if (delta > 0) {
    // Show remaining stops for today so user can choose to skip
    const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
    if (day) {
      const remaining = getDayStops(day).filter(s => {
        const t = timeToMinutes(getStopTime(s));
        return t !== null && t > (timeToMinutes(planned) || 0) && s.id !== stop.id
          && !['depart','transport','hotel','charging'].includes(getStopType(s));
      });
      remaining.forEach(s => {
        const alreadySkipped = !!state.skipped[s.id];
        const row = document.createElement('label');
        row.className = 'skip-stop-row' + (alreadySkipped ? ' already-skipped' : '');
        row.innerHTML = `<input type="checkbox" value="${s.id}"${alreadySkipped ? '' : ' checked'}><span style="flex:1">${stopTypeIcon(s)} ${getStopName(s)}${alreadySkipped ? ' <em style="opacity:.5;font-style:normal;font-size:.8em">skipped</em>' : ''}</span><span class="skip-time">${getStopTime(s)}</span>`;
        skipList.appendChild(row);
      });
    }
  }

  document.getElementById('travel-action-ripple').style.display = delta !== 0 ? '' : 'none';
  document.getElementById('travel-action-overlay').classList.remove('hidden');
}

function closeTravelAction() {
  document.getElementById('travel-action-overlay').classList.add('hidden');
  _travelActionStop = _travelActionType = null;
}

// Cascade a time delta to all following stops on the same day, stopping at fixed stops.
// skipSet: Set of stop ids to skip over (already-skipped stops stay un-updated but don't block cascade).
// Departure cascade: anchors all following stops to actualDepMins using ORIGINAL
// data times as the base. Avoids compounding errors from earlier arrival cascades.
function cascadeFromDeparture(fromStop, actualDepMins) {
  const origArr = timeToMinutes(fromStop.time);
  const origDur = fromStop.duration ?? 30;
  if (origArr === null) {
    const curArr = timeToMinutes(getStopTime(fromStop));
    if (curArr === null) return [];
    const curDur = getStopDuration(fromStop);
    return cascadeTimeDelta(fromStop, actualDepMins - (curArr + curDur));
  }
  const origDep = origArr + origDur;
  const delta = actualDepMins - origDep;

  const day = TRIP_DATA.days.find(d => d.stops.concat(state.addedStops?.[d.id] || []).some(s => s.id === fromStop.id));
  if (!day) return [];
  const days = TRIP_DATA.days;
  const dayIdx = days.findIndex(d => d.id === day.id);
  if (!state.crossDayMoves) state.crossDayMoves = {};
  const allStops = [...day.stops, ...(state.addedStops?.[day.id] || [])];
  const sorted = [...allStops].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  let found = false;
  const changed = [];
  for (const s of sorted) {
    if (!found) { if (s.id === fromStop.id) found = true; continue; }
    if (isStopFixed(s)) break;
    if (isPinned(s.id)) break;
    if (state.skipped[s.id]) continue;
    const origTime = timeToMinutes(s.time) ?? timeToMinutes(getStopTime(s));
    if (origTime === null) continue;
    const newAbsolute = dayIdx * 1440 + origTime + delta;
    const targetDayIdx = Math.min(Math.max(0, Math.floor(newAbsolute / 1440)), days.length - 1);
    state.overrides[s.id] = minutesToTime(newAbsolute);
    if (targetDayIdx !== dayIdx) state.crossDayMoves[s.id] = days[targetDayIdx].id;
    else delete state.crossDayMoves[s.id];
    changed.push({ stop: s, newTime: minutesToTime(newAbsolute), dayDate: days[targetDayIdx]?.date || day.date });
  }
  return changed;
}

function cascadeTimeDelta(fromStop, delta, skipSet = new Set()) {
  if (!delta) return [];
  const day = TRIP_DATA.days.find(d => d.stops.concat(state.addedStops?.[d.id] || []).some(s => s.id === fromStop.id));
  if (!day) return [];
  const days = TRIP_DATA.days;
  const dayIdx = days.findIndex(d => d.id === day.id);
  if (!state.crossDayMoves) state.crossDayMoves = {};
  const homeDayStops = [...day.stops, ...(state.addedStops?.[day.id] || [])];
  const sorted = [...homeDayStops].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  let found = false;
  const changed = [];
  for (const s of sorted) {
    if (!found) { if (s.id === fromStop.id) found = true; continue; }
    if (isStopFixed(s)) break;
    if (isPinned(s.id)) break;
    if (skipSet.has(s.id) || state.skipped[s.id]) continue;
    const cur = timeToMinutes(getStopTime(s));
    if (cur === null) continue;
    const currentDayIdx = state.crossDayMoves[s.id] ? days.findIndex(d => d.id === state.crossDayMoves[s.id]) : dayIdx;
    const newAbsolute = currentDayIdx * 1440 + cur + delta;
    const targetDayIdx = Math.min(Math.max(0, Math.floor(newAbsolute / 1440)), days.length - 1);
    state.overrides[s.id] = minutesToTime(newAbsolute);
    if (targetDayIdx !== dayIdx) state.crossDayMoves[s.id] = days[targetDayIdx].id;
    else delete state.crossDayMoves[s.id];
    changed.push({ stop: s, newTime: minutesToTime(newAbsolute), dayDate: days[targetDayIdx]?.date || day.date });
  }
  return changed;
}

function applyTravelAction(ripple) {
  if (!_travelActionStop) return;
  saveUndoSnapshot();

  // Mark skipped stops
  document.querySelectorAll('#travel-action-skip-list input:checked').forEach(cb => {
    state.skipped[cb.value] = true;
    delete state.checked[cb.value];
  });

  // Record actual time
  const actual = nowMinutes();
  state.overrides[_travelActionStop.id] = minutesToTime(actual);

  save(); closeTravelAction(); renderView(false);
  const toastMsg = _travelActionType === 'departed' ? 'Departed recorded' : 'Arrival recorded';

  if (ripple) {
    // Use OSRM travel times rather than a fixed delta — prevents compounding errors
    const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
    if (day) {
      showToast(`${toastMsg} · Recalculating times…`);
      rippleFromStop(_travelActionStop, day, (done, total) => {
        showToast(`Recalculating… ${done}/${total}`);
      }).then(() => {
        showUndoToast(`${toastMsg} · Times updated`);
        const allStops = getDayStops(day);
        const fromIdx = allStops.findIndex(s => s.id === _travelActionStop.id);
        if (fromIdx >= 0) {
          const changed = allStops.slice(fromIdx + 1)
            .filter(s => !state.skipped[s.id])
            .map(s => ({ stop: s, newTime: getStopTime(s), dayDate: day.date }));
          if (changed.length) postCascadeCheck(changed);
        }
      });
      return;
    }
  }

  showUndoToast(toastMsg);
}

/* ── Opening hours check after cascade — auto-skip closed stops ─────── */
async function postCascadeCheck(changedStops) {
  if (!changedStops || !changedStops.length) return;
  const SKIP_TYPES = new Set(['depart','charging','sleep','work','festival']);
  const byDate = {};
  changedStops.forEach(entry => {
    if (!entry.dayDate) return;
    (byDate[entry.dayDate] = byDate[entry.dayDate] || []).push(entry);
  });
  const toSkip = [];
  for (const [dayDate, entries] of Object.entries(byDate)) {
    const date = new Date(dayDate + 'T12:00:00');
    const toCheck = entries.filter(({ stop }) => !SKIP_TYPES.has(getStopType(stop)) && !state.skipped[stop.id]);
    if (!toCheck.length) continue;
    await Promise.allSettled(toCheck.map(({ stop }) => fetchOpeningHours(stop)));
    toCheck.forEach(({ stop, newTime }) => {
      if (isStopOpenAt(stop, newTime, date) === 'closed') toSkip.push(stop);
    });
  }
  if (!toSkip.length) return;
  toSkip.forEach(s => { state.skipped[s.id] = true; delete state.checked[s.id]; });
  save();
  renderView(false);
  showClosedSkipToast(toSkip);
}

function showClosedSkipToast(stops) {
  let el = document.getElementById('app-toast');
  if (!el) { el = document.createElement('div'); el.id = 'app-toast'; document.getElementById('app').appendChild(el); }
  const names = stops.map(s => getStopName(s));
  const msg = names.length === 1
    ? `"${names[0]}" skipped — may be closed`
    : `${names.length} stops skipped (may be closed)`;
  el.innerHTML = `${msg} <button id="closed-restore-btn" style="margin-left:10px;font-weight:700;text-decoration:underline;background:none;border:none;color:inherit;cursor:pointer;font-size:inherit">Restore</button>`;
  el.classList.add('visible');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('visible'), 12000);
  document.getElementById('closed-restore-btn').addEventListener('click', () => {
    stops.forEach(s => { delete state.skipped[s.id]; });
    save(); renderView(false);
    el.classList.remove('visible');
    showToast('Stops restored');
  });
}

function closeSkipPrompt() {
  document.getElementById('skip-prompt-overlay').classList.add('hidden');
}

/* ── Day swipe (edge swipe left/right to change day) ───────────────── */
function initDaySwipe() {
  const mc = document.getElementById('main-content');
  const EDGE = 22; // px from screen edge that activates the gesture
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
      else if (Math.abs(dy) > Math.abs(dx) + 6) { active = false; return; }
      else return;
    }
    if (!isHoriz) { active = false; return; }
    diffX = dx;
  }, { passive: true });

  mc.addEventListener('touchend', () => {
    if (!active || !isHoriz) { active = false; return; }
    active = false;
    if (Math.abs(diffX) < 80) return;
    const delta = diffX < 0 ? 1 : -1; // left = next day, right = previous day
    const nextId = adjacentDayId(delta);
    if (nextId) selectDay(nextId);
  });
}

/* ── Pull-to-refresh ───────────────────────────────────────────────── */
function initPullToRefresh() {
  const mc      = document.getElementById('main-content');
  const THRESHOLD = 72; // px pulled before release triggers refresh
  let startY = 0, pulling = false, triggered = false;

  // Spinner element
  const spinner = document.createElement('div');
  spinner.id = 'ptr-spinner';
  spinner.innerHTML = '<i class="ph ph-arrow-clockwise"></i>';
  document.getElementById('app').appendChild(spinner);

  mc.addEventListener('touchstart', e => {
    if (mc.scrollTop !== 0) return;
    if (!document.getElementById('detail-overlay').classList.contains('hidden')) return;
    startY   = e.touches[0].clientY;
    pulling  = true;
    triggered = false;
  }, { passive: true });

  mc.addEventListener('touchmove', e => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) { spinner.style.transform = ''; spinner.classList.remove('visible'); return; }
    const progress = Math.min(dy / THRESHOLD, 1);
    spinner.style.transform = `translateY(${Math.min(dy * 0.4, THRESHOLD * 0.5)}px) rotate(${progress * 360}deg)`;
    spinner.classList.toggle('visible', dy > 16);
    spinner.classList.toggle('ready', dy >= THRESHOLD);
  }, { passive: true });

  mc.addEventListener('touchend', async () => {
    if (!pulling) return;
    pulling = false;
    if (!spinner.classList.contains('ready')) {
      spinner.style.transform = '';
      spinner.classList.remove('visible', 'ready');
      return;
    }
    // Triggered — spin and refresh
    spinner.classList.add('spinning');
    spinner.classList.remove('ready');
    try {
      if (state.currentView === 'vegan') { _veganCache = null; }
      else if (state.currentView === 'charging') { _chargerCache = null; }
      else if (state.currentView === 'map') { _veganCache = null; _chargerCache = null; }
      const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
      if (day && state.currentView !== 'vegan' && state.currentView !== 'charging') {
        _weatherCache.delete(day.id);
        await fetchWeatherForDay(day);
      }
      renderView(false);
      showToast('Refreshed');
    } finally {
      setTimeout(() => {
        spinner.style.transform = '';
        spinner.classList.remove('visible', 'spinning');
      }, 400);
    }
  });
}

/* ── Init ──────────────────────────────────────────────────────────── */
function updateHeaderHeight() {
  const h = document.getElementById('app-header');
  if (h) document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px');
}

// Auto-reload when a new service worker activates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.type === 'SW_UPDATED') window.location.reload(true);
  });
}

/* ── Auth overlay UI ─────────────────────────────────────────────────── */
let _pendingInviteToken = null;

function initAuthOverlay() {
  // Check for invite token in URL hash
  const hash = location.hash;
  const inviteMatch = hash.match(/[#&]invite=([a-f0-9]+)/i);
  if (inviteMatch) {
    _pendingInviteToken = inviteMatch[1];
    history.replaceState(null, '', location.pathname + location.search);
    const notice = document.getElementById('auth-invite-notice');
    if (notice) notice.classList.remove('hidden');
  }

  const overlay   = document.getElementById('auth-overlay');
  const tabLogin  = document.getElementById('auth-tab-login');
  const tabReg    = document.getElementById('auth-tab-register');
  const nameWrap  = document.getElementById('auth-name-wrap');
  const submitBtn = document.getElementById('auth-submit');
  const errEl     = document.getElementById('auth-error');
  let isRegister  = false;

  function switchTab(reg) {
    isRegister = reg;
    tabLogin.classList.toggle('active', !reg);
    tabReg.classList.toggle('active',  reg);
    nameWrap.classList.toggle('hidden', !reg);
    submitBtn.textContent = reg ? 'Create account' : 'Sign in';
    document.getElementById('auth-password').autocomplete = reg ? 'new-password' : 'current-password';
    errEl.textContent = ''; errEl.classList.add('hidden');
  }
  tabLogin.addEventListener('click', () => switchTab(false));
  tabReg.addEventListener('click',   () => switchTab(true));
  if (_pendingInviteToken) switchTab(true);

  submitBtn.addEventListener('click', async () => {
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name     = document.getElementById('auth-name').value.trim();
    errEl.classList.add('hidden');
    submitBtn.disabled = true; submitBtn.textContent = '…';
    try {
      if (isRegister) {
        if (!name) throw new Error('Enter your name');
        await authRegister(email, password, name);
      } else {
        await authLogin(email, password);
      }
      // Auth state change handler fires next
    } catch (err) {
      errEl.textContent = err.message || 'Authentication failed';
      errEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = isRegister ? 'Create account' : 'Sign in';
    }
  });

  // Allow Enter key to submit
  [document.getElementById('auth-email'),
   document.getElementById('auth-password'),
   document.getElementById('auth-name')].forEach(el => {
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') submitBtn.click(); });
  });
}

async function onAuthSuccess(user) {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.add('hidden');

  // Set user state
  state.userId   = user.uid;
  state.userName = user.displayName || user.email;
  state.isOwner  = user.email === 'matt@cranialscratch.com';

  // Check membership (non-owners)
  if (!state.isOwner) {
    try {
      const snap = await firebase.database().ref('trips/annecy_2026/members/' + user.uid).get();
      if (snap.exists()) {
        const member = snap.val();
        state.memberRole = member.role || 'viewer';
        if (member.active === false) {
          document.getElementById('access-disabled-overlay').classList.remove('hidden');
          document.getElementById('access-signout-btn').addEventListener('click', () => signOut());
          return;
        }
      } else {
        state.memberRole = 'viewer';
      }
    } catch (e) {
      console.warn('[auth] membership check failed:', e);
    }
  } else {
    state.memberRole = 'editor';
  }

  // Consume pending invite
  if (_pendingInviteToken) {
    try { await consumeInvite(_pendingInviteToken); } catch (e) {}
    _pendingInviteToken = null;
  }

  // Owner drawer controls
  if (state.isOwner) {
    document.getElementById('invite-btn').classList.remove('hidden');
    document.getElementById('members-btn').classList.remove('hidden');
  }

  // Sign-out label
  const signoutLabel = document.getElementById('signout-label');
  if (signoutLabel) signoutLabel.textContent = `Sign out (${state.userName})`;
  document.getElementById('signout-btn').addEventListener('click', () => signOut());

  // Init DB sync
  syncInit(user);

  // Boot the app
  bootApp();
}

function bootApp() {
  // Show app frame (was hidden until auth)
  const appEl = document.getElementById('app');
  if (appEl) appEl.style.display = '';

  // One-time reset trigger: open app with ?reset=times to clear all time data
  if (new URLSearchParams(location.search).get('reset') === 'times') {
    ['annecy_overrides','annecy_dur_overrides','annecy_cross_day_moves'].forEach(k => localStorage.removeItem(k));
    window._pendingResetTimes = true;
    history.replaceState(null, '', location.pathname);
  }
  document.getElementById('version-badge').textContent = APP_VERSION;
  document.getElementById('version-number').textContent = APP_VERSION;
  load();
  loadWikiCache();
  loadPlacesCache();
  loadGooglePhotos();
  loadWeatherCache();
  state.currentDayId = findTodayDayId() || TRIP_DATA.days[0].id;
  buildDayStrip();
  renderView(true);
  updateHeaderHeight();
  new ResizeObserver(updateHeaderHeight).observe(document.getElementById('app-header'));
  scheduleNotifs();
  if (state.notifsEnabled && notifGranted()) startTrafficPolling();
  // Kick off travel time computation for the initial day so depart-by
  // pills appear and notifications use real routing times
  const initDay = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (initDay) precomputeTravelTimes(initDay);
}

document.addEventListener('DOMContentLoaded', () => {
  // Init Firebase app + auth
  firebase.initializeApp(FIREBASE_CONFIG);
  const auth = firebase.auth();

  initAuthOverlay();

  // Wire invite + members drawer buttons
  document.getElementById('invite-btn').addEventListener('click', async () => {
    const token = await createInvite();
    if (!token) return;
    const url = `${location.origin}${location.pathname}#invite=${token}`;
    const input = document.getElementById('invite-url-input');
    input.value = url;
    document.getElementById('invite-url-wrap').classList.remove('hidden');
  });
  document.getElementById('invite-url-copy').addEventListener('click', () => {
    const input = document.getElementById('invite-url-input');
    navigator.clipboard.writeText(input.value).catch(() => input.select());
    showToast('Invite link copied!');
  });
  document.getElementById('members-btn').addEventListener('click', async () => {
    const list = document.getElementById('members-list');
    list.classList.toggle('hidden');
    if (list.classList.contains('hidden')) return;
    list.innerHTML = '<div style="padding:8px 0;font-size:13px;color:var(--text3)">Loading…</div>';
    try {
      const members = await getMembers();
      if (!Object.keys(members).length) {
        list.innerHTML = '<div style="padding:8px 0;font-size:13px;color:var(--text3)">No members yet</div>';
        return;
      }
      list.innerHTML = Object.entries(members).map(([uid, m]) => `
        <div class="member-row">
          <div>
            <div class="member-name">${m.name || m.email}</div>
            <div class="member-role">${m.role || 'viewer'}${m.email ? ' · ' + m.email : ''}</div>
          </div>
          <button class="member-toggle${m.active !== false ? ' active' : ''}" data-uid="${uid}" title="${m.active !== false ? 'Active — click to disable' : 'Disabled — click to enable'}"></button>
        </div>`).join('');
      list.querySelectorAll('.member-toggle').forEach(btn => {
        btn.addEventListener('click', async () => {
          const uid = btn.dataset.uid;
          const active = !btn.classList.contains('active');
          await setMemberActive(uid, active);
          btn.classList.toggle('active', active);
        });
      });
    } catch (e) {
      list.innerHTML = '<div style="padding:8px 0;font-size:13px;color:#f87171">Failed to load members</div>';
    }
  });

  // FAB quick-action sheet
  document.getElementById('fab-add').addEventListener('click', () => {
    const existing = document.getElementById('fab-sheet');
    if (existing) { existing.remove(); return; }
    const overlay = document.createElement('div');
    overlay.id = 'fab-sheet';
    overlay.className = 'stop-sheet-overlay';
    const currentStop = (() => {
      const day = TRIP_DATA.days.find(d => d.id === state.currentDay);
      return day ? getCurrentStop(day) : null;
    })();
    overlay.innerHTML = `
      <div class="stop-sheet" id="fab-sheet-panel">
        <div class="stop-sheet-handle"></div>
        <div class="stop-sheet-header">
          <div class="stop-sheet-title">Quick actions</div>
          <button class="stop-sheet-close" aria-label="Close"><i class="ph ph-x"></i></button>
        </div>
        <div class="stop-sheet-body" style="padding-bottom:24px">
          <button class="sheet-action-btn" id="fab-food"><i class="ph ph-fork-knife"></i> Find food nearby</button>
          <button class="sheet-action-btn" id="fab-charge"><i class="ph ph-charging-station"></i> Find charger nearby</button>
          <button class="sheet-action-btn" id="fab-lost"><i class="ph ph-map-pin"></i> Navigate to current stop</button>
          <button class="sheet-action-btn" id="fab-addstop"><i class="ph ph-plus-circle"></i> Add a stop</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.classList.add('open');
      const panel = document.getElementById('fab-sheet-panel');
      if (panel) panel.classList.add('open');
    });
    const close = () => { overlay.remove(); };
    overlay.querySelector('.stop-sheet-close').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('#fab-food').addEventListener('click', () => {
      close();
      state.currentView = 'find';
      state._findFilter = 'food';
      renderView();
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'find'));
    });
    overlay.querySelector('#fab-charge').addEventListener('click', () => {
      close();
      state.currentView = 'find';
      state._findFilter = 'charging';
      renderView();
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'find'));
    });
    overlay.querySelector('#fab-lost').addEventListener('click', () => {
      close();
      if (currentStop && currentStop.lat && currentStop.lng) {
        window.open(`https://maps.apple.com/?daddr=${currentStop.lat},${currentStop.lng}&dirflg=d`, '_blank');
      } else {
        showToast('Current stop location not available');
      }
    });
    overlay.querySelector('#fab-addstop').addEventListener('click', () => {
      close();
      openEditSheet(null, state.currentDayId);
    });
  });

  // Auth state observer — fires once on load and again on sign-in/out
  auth.onAuthStateChanged(user => {
    if (user) {
      onAuthSuccess(user);
    } else {
      // Show auth overlay
      document.getElementById('auth-overlay').classList.remove('hidden');
    }
  });

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
    const forceUpdateBtn = document.getElementById('force-update-btn');
    if (forceUpdateBtn) forceUpdateBtn.addEventListener('click', async () => {
      forceUpdateBtn.disabled = true;
      forceUpdateBtn.innerHTML = '<i class="ph ph-spinner"></i> Clearing…';
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        // Do NOT unregister the SW — that destroys the push subscription
      } catch (e) { /* ignore */ }
      window.location.reload(true);
    });

    // Nav app preference (Apple Maps / Google Maps)
    try { const saved = localStorage.getItem('annecy_nav_app'); if (saved === 'google') state.navApp = 'google'; } catch {}
    function updateNavAppBtn() {
      const lbl = document.getElementById('nav-app-label');
      if (lbl) lbl.textContent = state.navApp === 'google' ? 'Navigate with Google Maps' : 'Navigate with Apple Maps';
    }
    updateNavAppBtn();
    const navAppBtn = document.getElementById('nav-app-btn');
    if (navAppBtn) navAppBtn.addEventListener('click', () => {
      state.navApp = state.navApp === 'apple' ? 'google' : 'apple';
      try { localStorage.setItem('annecy_nav_app', state.navApp); } catch {}
      updateNavAppBtn();
    });

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
  /* Filter popup */
  const _filterBtn = document.getElementById('filter-btn');
  const _filterPopup = document.getElementById('filter-popup');
  _filterBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!_filterPopup.classList.contains('hidden')) {
      _filterPopup.classList.add('hidden');
    } else {
      openFilterPopup(getPresentTypes());
    }
  });
  // Dismiss on tap outside — capture phase so we intercept before card handlers fire
  document.addEventListener('click', e => {
    if (!_filterPopup.classList.contains('hidden') &&
        !document.getElementById('filter-wrap').contains(e.target)) {
      _filterPopup.classList.add('hidden');
      e.stopPropagation();
    }
  }, true);
  // Dismiss on vertical scroll
  document.getElementById('main-content').addEventListener('scroll', () => {
    _filterPopup.classList.add('hidden');
  }, { passive: true });

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
    const todayStr = localDateStr();
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
      if (btn.dataset.action === 'bucket')       { state.currentView = 'bucket'; renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'reset-times')  { state.overrides = {}; state.locOverrides = {}; state.durOverrides = {}; state.typeOverrides = {}; state.priorityOverrides = {}; state.reasonOverrides = {}; state.veganOverrides = {}; save(); renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'reset-checks') { state.checked   = {}; save(); renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'toggle-dark')  {
        document.body.classList.toggle('light');
        try { localStorage.setItem('annecy_theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch {}
        updateDrawerLabels();
        if (_leafletMap) { _leafletMap.remove(); _leafletMap = null; _mapMarkerLayer = null; _mapRouteLayer = null; _locMarker = null; _locCircle = null; document.getElementById('map-container').innerHTML = ''; }
        if (state.currentView === 'map') renderMapView();
        closeDrawer();
      }
    }));


  /* Time modal */
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-reset-day').addEventListener('click', resetDayTimes);
  document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') closeModal(); });
  document.getElementById('modal-save').addEventListener('click', saveModal);
  document.querySelectorAll('.time-adj').forEach(btn =>
    btn.addEventListener('click', () => {
      const input = document.getElementById('modal-time-input');
      const cur = timeToMinutes(input.value || '00:00');
      if (cur !== null) input.value = minutesToTime(cur + parseInt(btn.dataset.delta, 10));
    }));

  /* Travel action sheet */
  document.getElementById('travel-action-close').addEventListener('click', closeTravelAction);
  document.getElementById('travel-action-ripple').addEventListener('click', () => applyTravelAction(true));
  document.getElementById('travel-action-done').addEventListener('click',   () => applyTravelAction(false));

  /* Skip prompt */
  document.getElementById('skip-prompt-close').addEventListener('click', closeSkipPrompt);
  document.getElementById('skip-prompt-cancel').addEventListener('click', closeSkipPrompt);
  document.getElementById('skip-prompt-confirm').addEventListener('click', () => {
    document.querySelectorAll('#skip-prompt-list input[type=checkbox]:checked').forEach(cb => {
      state.skipped[cb.value] = true;
      delete state.checked[cb.value];
    });
    save(); renderView(false); closeSkipPrompt();
  });

  /* Detail page */
  document.getElementById('detail-back').addEventListener('click', closeDetail);
  initDetailNavSwipe();
  initDaySwipe();
  initPullToRefresh();

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
    _editFixed = document.getElementById('edit-fixed')?.checked ?? _editFixed;
    state.fixedOverrides[stop.id] = _editFixed;
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
  document.getElementById('edit-loc-gps-btn').addEventListener('click', () => runNearbySearch());
  document.getElementById('detail-check-btn').addEventListener('click', () => {
    if (!_detailStop) return;
    state.checked[_detailStop.id] = !state.checked[_detailStop.id];
    if (state.checked[_detailStop.id]) {
      if (!state.personalPinned) state.personalPinned = {};
      state.personalPinned[_detailStop.id] = true;
    }
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

  // Midnight advance — schedule a tick at the next local midnight so the day
  // tab advances automatically without needing to reopen the app
  function scheduleMidnightTick() {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime() - now.getTime();
    setTimeout(() => {
      const todayId = findTodayDayId();
      if (todayId && todayId !== state.currentDayId) {
        state.currentDayId = todayId;
        state.currentView  = 'day';
        updateDayStrip();
        renderView(true);
        scheduleNotifs();
      }
      scheduleMidnightTick(); // re-arm for the following midnight
    }, msUntilMidnight);
  }
  scheduleMidnightTick();
});

/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  currentDayId: null,
  currentView: 'day',
  cascadeEnabled: false,
  overrides: {},        // stopId → time string
  checked: {},          // stopId → bool
  locOverrides: {},     // stopId → { name, lat, lng }
  durOverrides: {},     // stopId → minutes
  typeOverrides: {},    // stopId → type string
  priorityOverrides: {}, // stopId → 0-3
  reasonOverrides: {},  // stopId → string
  veganOverrides: {},   // stopId → bool
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
  if (day.isCountdown) return '<i class="ph ph-sun-horizon"></i>';
  if (day.isFestival) return 'Fest';
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return names[new Date(day.date + 'T00:00:00').getDay()];
}
function findTodayDayId() {
  const today = new Date().toISOString().slice(0,10);
  for (const day of TRIP_DATA.days) {
    if (day.isCountdown && today <= day.dateEnd) return day.id;
    if (day.date === today) return day.id;
    if (day.isFestival && today >= day.date && today <= day.dateEnd) return day.id;
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
function buildTags(stop) {
  const tags = [];
  if (getStopVegan(stop))              tags.push(`<span class="tl-tag vegan"><i class="ph ph-leaf"></i> Vegan-friendly</span>`);
  if (getStopType(stop) === 'charging') tags.push(`<span class="tl-tag charge"><i class="ph ph-lightning"></i> Supercharger</span>`);
  if (getStopPriority(stop) >= 3)       tags.push(`<span class="tl-tag poi">★ Must-see</span>`);
  return tags.length ? `<div class="tl-card-tags">${tags.join('')}</div>` : '';
}

/* ── Wikipedia article titles per stop (free API, no key needed) ───── */
const WIKI_TITLES = {
  'd1s6':  'Saint-Valery-sur-Somme',
  'd1s7':  'Saint-Valery-sur-Somme',
  'd1s8':  'Saint-Valery-sur-Somme',
  'd1s13': 'Amiens_Cathedral',
  'd2s2':  "Hortillonnages_d'Amiens",
  'd2s3':  "Hortillonnages_d'Amiens",
  'd2s6':  'Gerberoy',
  'd2s7':  'Gerberoy',
  'd2s10': 'Troyes',
  'd2s11': 'Ruelle_des_Chats',
  'd2s12': 'Troyes_Cathedral',
  'd3s2':  'Flavigny-sur-Ozerain',
  'd3s3':  'Flavigny-sur-Ozerain',
  'd3s4':  'Fontenay_Abbey',
  'd3s5':  'Fontenay_Abbey',
  'd3s6':  'Semur-en-Auxois',
  'd3s7':  'Semur-en-Auxois',
  'd3s8':  'Clos_de_Vougeot',
  'd3s9':  'Route_des_Grands_Crus',
  'd3s10': 'Vosne-Romanée',
  'd3s11': 'Saint-Romain,_Côte-d\'Or',
  'd3s15': 'Hospices_de_Beaune',
  'd3s16': 'Beaune',
  'd4s3':  'Albertville',
  'd4s7':  'Lake_Annecy',
  'fs3':   'Lake_Annecy',
  'fs4':   'Annecy',
  'fs5':   'Château_d\'Annecy',
  'fs6':   'Gorges_du_Fier',
  'fs7':   'Château_de_Menthon-Saint-Bernard',
  'fs8':   'Talloires',
  'd5s2':  'Royal_Saltworks_of_Arc-et-Senans',
  'd5s3':  'Royal_Saltworks_of_Arc-et-Senans',
  'd5s6':  'Besançon',
  'd5s7':  'Citadel_of_Besançon',
  'd6s3':  'Giverny',
  'd6s4':  'Giverny',
  'd6s5':  'Rouen',
  'd6s6':  'Rouen_Cathedral',
  'd7s2':  'Saint-Valery-sur-Somme',
  'd7s3':  'Saint-Valery-sur-Somme',
};

/* ── Wikipedia data cache ──────────────────────────────────────────── */
const _wikiCache = {}; // stopId → { img, extract } | null
const _poiCache  = {}; // stopId → [{ title, img, dist, url }]

function loadWikiCache() {
  try {
    const saved = localStorage.getItem('annecy_wiki_v5');
    if (saved) Object.assign(_wikiCache, JSON.parse(saved));
  } catch {}
}
function saveWikiCache() {
  try { localStorage.setItem('annecy_wiki_v5', JSON.stringify(_wikiCache)); } catch {}
}

function wikiSearchName(stop) {
  // Explicit override always wins
  if (WIKI_TITLES[stop.id]) return WIKI_TITLES[stop.id];

  const loc = stop.location;

  // Food/café: search by city/area (after comma), never by meal name
  if (stop.type === 'food') {
    const city = loc.split(',').slice(1).join(',').trim();
    return city || null; // null → skip to geosearch
  }

  // Charging: strip "Tesla Supercharger" prefix and parentheticals
  if (stop.type === 'charging') {
    return loc.replace(/Tesla Supercharger\s*/i, '').replace(/\s*\(.*\)/, '').trim();
  }

  // Depart: strip leading "Depart " verb
  if (stop.type === 'depart') {
    return loc.replace(/^Depart\s+/i, '').split(',')[0].trim();
  }

  // Hotel: use last meaningful word (usually city), e.g. "Moxy Amiens" → "Amiens"
  if (stop.type === 'hotel') {
    const words = loc.replace(/\b(hotel|moxy|ibis|novotel|b&b|inn|centre|center)\b/gi, '').trim().split(/\s+/);
    return words[words.length - 1] || loc;
  }

  // Default: name before the comma
  return loc.split(',')[0].trim();
}

async function fetchWikiData(stop) {
  if (_wikiCache[stop.id] !== undefined) return _wikiCache[stop.id];

  const name = wikiSearchName(stop);
  let result = null;

  // 1. Named lookup (skip if name is null — food stops with no city part)
  if (name) {
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/\s+/g,'_'))}`);
      if (r.ok) {
        const d = await r.json();
        if (d.type !== 'disambiguation') result = { img: d.thumbnail?.source || null, extract: d.extract || null };
      }
    } catch {}
  }

  // 2. Geosearch fallback — nearest article within 2 km
  if (!result?.img && !result?.extract) {
    try {
      const gr = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${stop.lat}|${stop.lng}&gsradius=2000&gslimit=3&format=json&origin=*`);
      const gd = await gr.json();
      const nearest = gd.query?.geosearch?.[0];
      if (nearest) {
        const sr = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nearest.title)}`);
        if (sr.ok) {
          const sd = await sr.json();
          result = { img: sd.thumbnail?.source || null, extract: sd.extract || null };
        }
      }
    } catch {}
  }

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
  return null;
}

function injectWikiPhoto(stopId) {
  const data = _wikiCache[stopId];
  const commons = _commonsCache[stopId] || [];
  if (!data?.img && !commons.length) return;
  const item = document.getElementById(`stop-${stopId}`);
  if (!item) return;
  const stop = findStop(stopId);
  if (!stop) return;
  const oldSlider = item.querySelector('.card-slider');
  if (!oldSlider) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = buildSlider(stop, 'card');
  const newSlider = tmp.firstChild;
  oldSlider.replaceWith(newSlider);
  initSlider(newSlider, stop, 'card');
}

function lazyLoadWikiImages(stops) {
  stops.forEach(stop => {
    const wikiDone = _wikiCache[stop.id] !== undefined;
    const commonsDone = _commonsCache[stop.id] !== undefined;

    if (wikiDone && commonsDone) {
      if (_wikiCache[stop.id]?.img || _commonsCache[stop.id]?.length) injectWikiPhoto(stop.id);
      return;
    }

    const tasks = [];
    if (!wikiDone)    tasks.push(fetchWikiData(stop));
    if (!commonsDone) tasks.push(fetchCommonsPhotos(stop));
    Promise.all(tasks).then(() => injectWikiPhoto(stop.id));
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
const GKEY = 'AIzaSyBDIpPyqjOtvh1y-1nwyJgIj9TVjQFD_Jo';

// Satellite aerial as a fallback — much more interesting than Street View
function satelliteUrl(stop) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${stop.lat},${stop.lng}&zoom=16&size=640x380&maptype=satellite&key=${GKEY}`;
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
  const wiki    = _wikiCache[stop.id]?.img;
  const commons = _commonsCache[stop.id] || [];
  // Best photo first (Wikipedia thumbnail), then Wikimedia Commons extras,
  // then satellite aerial as final fallback — no Street View
  const photos = [];
  if (wiki) photos.push(wiki);
  for (const u of commons) { if (u !== wiki) photos.push(u); }
  if (!photos.length) photos.push(satelliteUrl(stop));
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
    if (o)  state.overrides         = JSON.parse(o);
    if (c)  state.checked           = JSON.parse(c);
    if (lo) state.locOverrides      = JSON.parse(lo);
    if (du) state.durOverrides      = JSON.parse(du);
    if (ty) state.typeOverrides     = JSON.parse(ty);
    if (pr) state.priorityOverrides = JSON.parse(pr);
    if (re) state.reasonOverrides   = JSON.parse(re);
    if (ve) state.veganOverrides    = JSON.parse(ve);
  } catch {}
  try {
    if (localStorage.getItem('annecy_theme') === 'light') document.body.classList.add('light');
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
}
function updateDayStrip() {
  document.querySelectorAll('.day-chip').forEach(c =>
    c.classList.toggle('active', c.dataset.dayId === state.currentDayId));
  const active = document.querySelector('.day-chip.active');
  if (active) active.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
}
function selectDay(dayId) {
  state.currentDayId = dayId;
  // Stay on whichever view is active (map, day, etc.) — only switch to day
  // if currently on a non-day-sensitive view like overview/vegan/charging
  if (!['day','map'].includes(state.currentView)) state.currentView = 'day';
  updateDayStrip();
  renderView(false);
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
  // Stop countdown ticker when leaving that view
  if (state.currentView !== 'day' || TRIP_DATA.days.find(d => d.id === state.currentDayId)?.isCountdown === false) {
    clearInterval(_countdownInterval);
  }
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
      banner.innerHTML = `<div class="cd-emoji"><i class="ph ph-car"></i></div><h2 class="cd-title">We're on our way!</h2><p class="cd-sub">Annecy 2026 · Have a wonderful trip</p>`;
      clearInterval(_countdownInterval);
      return;
    }
    banner.innerHTML = `
      <div class="cd-emoji"><i class="ph ph-sun-horizon"></i></div>
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
    const banner = document.createElement('div');
    banner.className = 'festival-banner';
    banner.innerHTML = `<div class="cd-emoji"><i class="ph ph-film-slate"></i></div><h2>International Animation<br>Film Festival 2026</h2><p>Annecy, France</p><div class="festival-dates">20 – 27 June 2026</div>`;
    container.appendChild(banner);
  }

  const today = new Date().toISOString().slice(0,10);
  const isToday = day.date === today || (day.isFestival && today >= day.date && today <= day.dateEnd);
  const now = nowMinutes();
  let nowLineEl = null;
  let nowInserted = false;

  day.stops.forEach((stop, idx) => {
    const stopMins = timeToMinutes(getStopTime(stop));
    if (isToday && !nowInserted && stopMins !== null && stopMins > now) {
      nowInserted = true;
      const nowLine = document.createElement('div');
      nowLine.className = 'tl-now-line';
      nowLine.id = 'tl-now-marker';
      nowLine.innerHTML = `<span class="tl-now-label">▶ Now ${minutesToTime(now)}</span>`;
      container.appendChild(nowLine);
      nowLineEl = nowLine;
    }
    const item = buildTimelineItem(stop, idx === day.stops.length - 1);
    container.appendChild(item);
  });

  // Fetch Wikipedia extracts for detail page descriptions
  lazyLoadWikiImages(day.stops);

  // Pre-fetch images for all other days in the background so they're
  // ready before the user navigates to them
  setTimeout(() => {
    TRIP_DATA.days.forEach(d => {
      if (d.id === state.currentDayId || !d.stops?.length) return;
      d.stops.forEach(stop => {
        if (_wikiCache[stop.id]    === undefined) fetchWikiData(stop);
        if (_commonsCache[stop.id] === undefined) fetchCommonsPhotos(stop);
      });
    });
  }, 1500); // delay so current day fetches get priority

  // Only scroll to now when explicitly requested (Today button)
  if (scrollToNow && nowLineEl) {
    requestAnimationFrame(() => {
      const mc = document.getElementById('main-content');
      const headerH = document.getElementById('app-header').offsetHeight;
      mc.scrollTo({ top: Math.max(0, nowLineEl.offsetTop - headerH - 16), behavior: 'smooth' });
    });
  }
}

/* ── Build one timeline item ───────────────────────────────────────── */
function buildTimelineItem(stop, isLast) {
  const item = document.createElement('div');
  item.className = 'tl-item';
  item.dataset.type = getStopType(stop);
  item.id = `stop-${stop.id}`;

  const time = getStopTime(stop);
  const isEditable = timeToMinutes(time) !== null;
  const isVisited = !!state.checked[stop.id];

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
        </div>
        <div class="card-reason">${getStopReason(stop)}</div>
        ${buildTags(stop)}
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
let _editStop = null, _editDay = null;
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

async function recalculateFromStop(day, fromIdx) {
  const btn = document.getElementById('edit-recalc-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Recalculating…'; }

  for (let i = fromIdx; i < day.stops.length - 1; i++) {
    const from = day.stops[i];
    const to   = day.stops[i + 1];
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

    if (btn) btn.textContent = `Recalculating… (${i - fromIdx + 1}/${day.stops.length - 1 - fromIdx})`;
  }

  save();
  renderView(false);
  closeEditSheet();
  if (btn) { btn.disabled = false; btn.textContent = 'Recalculate following stops'; }
}

function openEditSheet(stop) {
  const day = TRIP_DATA.days.find(d => d.stops.some(s => s.id === stop.id));
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
  _editStop = _editDay = null;
}

function saveEditSheet() {
  if (!_editStop) return;
  const name   = document.getElementById('edit-name').value.trim();
  const time   = document.getElementById('edit-time').value;
  const reason = document.getElementById('edit-reason').value.trim();
  const vegan  = document.getElementById('edit-vegan').checked;
  const dur    = HHMMtoMins(document.getElementById('edit-dur-native')?.value);

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

  // Fetch wiki + commons together; refresh slides + description when done
  const tasks = [];
  if (_wikiCache[stop.id] === undefined)    tasks.push(fetchWikiData(stop));
  if (_commonsCache[stop.id] === undefined) tasks.push(fetchCommonsPhotos(stop));

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
    const idx  = day && _detailStop ? day.stops.findIndex(s => s.id === _detailStop.id) : -1;

    if (diffX > 60) {
      const prev = idx > 0 ? day.stops[idx - 1] : null;
      if (prev) openDetail(prev);
      else closeDetail();
    } else if (diffX < -60) {
      const next = idx >= 0 ? day.stops[idx + 1] : null;
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
document.addEventListener('DOMContentLoaded', () => {
  load();
  loadWikiCache();
  state.currentDayId = findTodayDayId() || TRIP_DATA.days[0].id;
  buildDayStrip();
  renderView(true); // scroll to now only on first load
  if (typeof syncInit === 'function') syncInit();

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

    // Auto-start: Android (no permission API) or previously granted on iOS
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission !== 'function') {
      startGyro();
    } else {
      try {
        if (localStorage.getItem('annecy_gyro') === '1') startGyro();
      } catch {}
    }
  })();

  /* Nav buttons */
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      state.currentView = btn.dataset.view;
      renderView(false);
    }));

  /* Cascade toggle */
  document.getElementById('cascade-btn').addEventListener('click', () => {
    state.cascadeEnabled = !state.cascadeEnabled;
    const btn = document.getElementById('cascade-btn');
    btn.classList.toggle('cascade-on', state.cascadeEnabled);
    btn.title = state.cascadeEnabled ? 'Cascade ON' : 'Cascade OFF';
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

  /* In-app browser */
  function openInApp(url) {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      document.getElementById('inapp-domain').textContent = domain;
    } catch { document.getElementById('inapp-domain').textContent = url; }
    document.getElementById('inapp-external').href = url;
    document.getElementById('inapp-frame').src = url;
    document.getElementById('inapp-overlay').classList.remove('hidden');
    closeDrawer();
  }
  function closeInApp() {
    document.getElementById('inapp-overlay').classList.add('hidden');
    document.getElementById('inapp-frame').src = '';
  }
  document.getElementById('inapp-back').addEventListener('click', closeInApp);
  document.querySelectorAll('.inapp-link').forEach(a =>
    a.addEventListener('click', e => { e.preventDefault(); openInApp(a.href); }));

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
  // Duration value button: toggle drum picker
  document.getElementById('dur-value-btn').addEventListener('click', () => {
    const wrap = document.getElementById('dur-picker-wrap');
    wrap.classList.toggle('hidden');
    if (!wrap.classList.contains('hidden')) {
      const update = () => {
        const m = getDurPickerMins();
        const h = Math.floor(m/60), min = m%60;
        document.getElementById('dur-value-btn').textContent = `${h}h ${String(min).padStart(2,'0')}m`;
      };
      document.getElementById('dur-hours').addEventListener('scroll', update, { passive: true });
      document.getElementById('dur-mins').addEventListener('scroll', update, { passive: true });
    }
  });
  document.getElementById('edit-sheet-overlay').addEventListener('click', e => {
    if (e.target.id === 'edit-sheet-overlay') closeEditSheet();
  });
  document.getElementById('edit-save-btn').addEventListener('click', saveEditSheet);
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
    const fromIdx = day.stops.findIndex(s => s.id === stop.id);
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
});

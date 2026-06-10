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
function getStopPriority(stop) { return state.priorityOverrides[stop.id] ?? stop.priority ?? 0; }
function getStopReason(stop)   { return state.reasonOverrides[stop.id]   ?? stop.reason; }
function getStopVegan(stop)    { return stop.id in state.veganOverrides ? state.veganOverrides[stop.id] : !!stop.veganFriendly; }
function priorityStars(p) { return p >= 1 ? '★'.repeat(p) + '☆'.repeat(3-p) : ''; }
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}
function getDayLabel(day) {
  if (day.isFestival) return 'Fest';
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return names[new Date(day.date + 'T00:00:00').getDay()];
}
function findTodayDayId() {
  const today = new Date().toISOString().slice(0,10);
  for (const day of TRIP_DATA.days) {
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
  if (getStopVegan(stop))              tags.push(`<span class="tl-tag vegan">🌱 Vegan-friendly</span>`);
  if (getStopType(stop) === 'charging') tags.push(`<span class="tl-tag charge">⚡ Supercharger</span>`);
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
function save() {
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
    const isTodayChip = day.isFestival
      ? (today >= day.date && today <= day.dateEnd)
      : today === day.date;
    if (isTodayChip) chip.classList.add('today');
    const dateStr = day.isFestival ? '20–27' : formatDate(day.date);
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
  state.currentView = 'day';
  updateDayStrip();
  renderView(false); // don't auto-scroll when manually picking a day
}

/* ── Header ────────────────────────────────────────────────────────── */
function updateHeader() {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  const label = document.getElementById('header-day-label');
  const sub   = document.getElementById('header-day-subtitle');
  if (state.currentView === 'overview')      { label.textContent = 'Annecy 2026';    sub.textContent = 'Trip overview'; }
  else if (state.currentView === 'vegan')    { label.textContent = '🌱 Vegan Spots'; sub.textContent = 'All vegan-friendly stops'; }
  else if (state.currentView === 'charging') { label.textContent = '⚡ Charging';    sub.textContent = 'Tesla Superchargers'; }
  else if (state.currentView === 'map' && day) { label.textContent = `${getDayLabel(day)} · ${day.title}`; sub.textContent = 'Route map'; }
  else if (day) { label.textContent = `${getDayLabel(day)} · ${day.title}`; sub.textContent = day.subtitle || ''; }
}

/* ── Render dispatcher ─────────────────────────────────────────────── */
function renderView(scrollToNow) {
  updateHeader();
  const tl = document.getElementById('timeline');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === state.currentView));
  const mapEl = document.getElementById('map-container');
  if (state.currentView === 'map') {
    tl.classList.add('hidden');
    mapEl.classList.remove('hidden');
    renderMapView();
  } else {
    mapEl.classList.add('hidden');
    tl.classList.remove('hidden');
    if (state.currentView === 'overview')      renderOverview(tl);
    else if (state.currentView === 'vegan')    renderFilterList(tl, 'vegan');
    else if (state.currentView === 'charging') renderFilterList(tl, 'charging');
    else renderTimeline(tl, scrollToNow);
  }
}

/* ── Map view ──────────────────────────────────────────────────────── */
let _leafletMap = null;
let _mapDayId   = null;

const TYPE_COLOR = {
  charging:'#16a34a', hotel:'#0284c7', transport:'#7c3aed', food:'#ea580c',
  architecture:'#d97706', village:'#0d9488', town:'#0d9488', experience:'#db2777',
  wander:'#059669', depart:'#475569', scenic:'#16a34a', historic:'#b45309', festival:'#7c3aed',
};

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
    container.innerHTML = '';
  }

  if (_leafletMap) {
    _leafletMap.invalidateSize();
    return; // already built for this day
  }

  _mapDayId = state.currentDayId;

  const isDark = !document.body.classList.contains('light');
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const stops = day.stops.filter(s => s.lat && s.lng);
  if (!stops.length) return;

  const map = L.map(container, { zoomControl: false, attributionControl: false });
  _leafletMap = map;

  L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Fit bounds to all stops
  const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng]));
  map.fitBounds(bounds, { padding: [48, 48] });

  // Determine next unvisited stop
  const now = nowMinutes();
  let nextStopId = null;
  for (const s of stops) {
    const t = timeToMinutes(getStopTime(s));
    if (t !== null && t >= now && !state.checked[s.id]) { nextStopId = s.id; break; }
  }

  // Draw markers
  stops.forEach((stop, idx) => {
    const visited  = !!state.checked[stop.id];
    const isNext   = stop.id === nextStopId;
    const color    = TYPE_COLOR[stop.type] || '#475569';
    const icon = L.divIcon({
      className: '',
      html: `<div class="map-marker type-${stop.type}${visited ? ' visited' : ''}${isNext ? ' next-stop' : ''}">
               <span>${stop.icon}</span>
               <span class="map-marker-seq">${idx + 1}</span>
             </div>`,
      iconSize:   [36, 36],
      iconAnchor: [18, 18],
      popupAnchor:[0, -20],
    });
    const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(map);
    marker.on('click', () => openDetail(stop));
  });

  // Fetch and draw road route
  fetchDayRoute(stops).then(latlngs => {
    if (!latlngs || _mapDayId !== state.currentDayId) return;
    const isDarkNow = !document.body.classList.contains('light');
    L.polyline(latlngs, {
      color: isDarkNow ? '#38bdf8' : '#0284c7',
      weight: 4,
      opacity: 0.7,
    }).addTo(map);
  });

  // Legend
  const legend = document.createElement('div');
  legend.className = 'map-legend';
  legend.textContent = `${stops.length} stops · tap a pin for details`;
  container.appendChild(legend);
}

/* ── Overview ──────────────────────────────────────────────────────── */
function renderOverview(c) {
  c.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'overview-grid';
  TRIP_DATA.days.forEach(day => {
    const card = document.createElement('div');
    card.className = 'overview-card';
    const dateStr = day.isFestival ? '20–27 Jun' : formatDate(day.date);
    card.innerHTML = `<div class="ov-day">${getDayLabel(day)} · ${dateStr}</div><div class="ov-title">${day.title}</div><div class="ov-sub">${day.subtitle||''}</div><div class="ov-stops">${day.stops.length} stops</div>`;
    card.addEventListener('click', () => selectDay(day.id));
    grid.appendChild(card);
  });
  c.appendChild(grid);
}

/* ── Filter list ───────────────────────────────────────────────────── */
function renderFilterList(container, kind) {
  container.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'filter-header';
  header.textContent = kind === 'vegan' ? '🌱 Vegan-Friendly Stops' : '⚡ Tesla Superchargers';
  container.appendChild(header);
  TRIP_DATA.days.forEach(day => {
    day.stops.forEach(stop => {
      if (kind === 'vegan' ? !stop.veganFriendly : stop.type !== 'charging') return;
      const card = document.createElement('div');
      card.className = 'filter-card';
      card.innerHTML = `
        <span class="filter-icon">${stop.icon}</span>
        <div class="filter-info">
          <div class="filter-day">${getDayLabel(day)} · ${day.isFestival ? '20–27 Jun' : formatDate(day.date)}</div>
          <div class="filter-loc">${stop.location}</div>
          <div class="filter-reason">${stop.reason}</div>
        </div>
        <div><a class="act-btn tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗</a></div>`;
      container.appendChild(card);
    });
  });
}

/* ── Timeline ──────────────────────────────────────────────────────── */
function renderTimeline(container, scrollToNow) {
  container.innerHTML = '';
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!day) return;

  if (day.isFestival) {
    const banner = document.createElement('div');
    banner.className = 'festival-banner';
    banner.innerHTML = `<div style="font-size:36px;margin-bottom:8px">🎬</div><h2>International Animation<br>Film Festival 2026</h2><p>Annecy, France</p><div class="festival-dates">20 – 27 June 2026</div>`;
    container.appendChild(banner);
  }

  const now = nowMinutes();
  let nowLineEl = null;
  let nowInserted = false;

  day.stops.forEach((stop, idx) => {
    const stopMins = timeToMinutes(getStopTime(stop));
    if (!nowInserted && stopMins !== null && stopMins > now) {
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
          <div class="card-name">${stop.icon} ${stop.location}</div>
          <button class="check-btn${isVisited ? ' checked' : ''}" data-stop-id="${stop.id}" aria-label="Mark visited">${isVisited ? '✓' : '○'}</button>
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
  const [c1, c2] = TYPE_GRAD[stop.type] || ['#334155','#0f172a'];
  const slides = photos.map((url, i) => {
    if (url === '__placeholder__') {
      return `<div class="${prefix}-slide ${prefix}-slide-placeholder" style="background:linear-gradient(145deg,${c1}55,${c2})">
        <div class="ph-icon">${stop.icon}</div>
        <div class="ph-name">${stop.location}</div>
      </div>`;
    }
    return `<img class="${prefix}-slide" src="${url}" loading="lazy"
      onerror="this.parentNode.style.transform=this.parentNode.style.transform"
      alt="${stop.location}">`;
  }).join('');
  const dots = photos.length > 1
    ? `<div class="${prefix}-dots">${photos.map((_,i) => `<span class="${prefix}-dot${i===0?' active':''}"></span>`).join('')}</div>`
    : '';
  return `<div class="${prefix}-slider"><div class="${prefix}-slides">${slides}</div>${dots}</div>`;
}

/* ── Slider touch logic ────────────────────────────────────────────── */
function initSlider(sliderEl, stop, prefix) {
  if (!sliderEl) return;
  const slidesEl = sliderEl.querySelector(`.${prefix}-slides`);
  const total = getPhotos(stop).length;
  let current = 0, startX = 0, startY = 0, diffX = 0, isDragging = false, isHoriz = null;
  let _tappedByTouch = false;

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
  const parts = [`<a class="act-btn tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗</a>`];
  const sType = getStopType(stop);
  if (sType !== 'depart' && sType !== 'transport') {
    if (getStopVegan(stop) || sType === 'food')
      parts.push(`<a class="act-btn vegan" href="${veganNearbyUrl(stop)}" target="_blank" rel="noopener">🌱</a>`);
    parts.push(`<a class="act-btn charge" href="${chargingNearbyUrl(stop)}" target="_blank" rel="noopener">⚡</a>`);
    if (getStopPriority(stop) >= 2)
      parts.push(`<a class="act-btn poi" href="${poiNearbyUrl(stop)}" target="_blank" rel="noopener">📍</a>`);
  }
  if (stop.mapsUrl && stop.mapsUrl !== 'N/A')
    parts.push(`<a class="act-btn maps" href="${stop.mapsUrl}" target="_blank" rel="noopener">🗺️</a>`);
  return parts.join('');
}

/* ── Stop edit sheet ────────────────────────────────────────────────── */
let _editStop = null, _editDay = null;
let _editLocMap = null, _editLocMarker = null;
let _editLat = null, _editLng = null;
let _editSearchTimer = null;
let _editSelectedType = null;
let _editSelectedPriority = null;

const TYPE_DEFS = [
  { type:'depart',       icon:'🚗', label:'Depart' },
  { type:'transport',    icon:'🚂', label:'Transport' },
  { type:'charging',     icon:'⚡', label:'Charging' },
  { type:'hotel',        icon:'🏨', label:'Hotel' },
  { type:'food',         icon:'🍽️', label:'Food' },
  { type:'wander',       icon:'🚶', label:'Explore' },
  { type:'architecture', icon:'⛪', label:'Architecture' },
  { type:'village',      icon:'🏘️', label:'Village' },
  { type:'town',         icon:'🏙️', label:'Town' },
  { type:'experience',   icon:'🌿', label:'Experience' },
  { type:'scenic',       icon:'🏔️', label:'Scenic' },
  { type:'historic',     icon:'🏛️', label:'Historic' },
  { type:'festival',     icon:'🎬', label:'Festival' },
];

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
  _editLocMap = L.map(el, { zoomControl:true, attributionControl:false });
  L.tileLayer(tiles, { maxZoom:19, subdomains:'abcd' }).addTo(_editLocMap);
  _editLocMap.setView([lat, lng], 14);
  _editLocMarker = L.marker([lat, lng], { draggable:true }).addTo(_editLocMap);
  _editLocMarker.on('dragend', e => {
    const p = e.target.getLatLng();
    _editLat = p.lat; _editLng = p.lng;
  });
}

async function searchEditLocation(query) {
  if (query.length < 3) { document.getElementById('edit-loc-results').innerHTML = ''; return; }
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=en`);
    const results = await r.json();
    const el = document.getElementById('edit-loc-results');
    if (!results.length) { el.innerHTML = '<div class="edit-loc-no-results">No results</div>'; return; }
    el.innerHTML = results.map((item, i) =>
      `<button class="edit-loc-result" data-idx="${i}" data-lat="${item.lat}" data-lng="${item.lon}">${item.display_name}</button>`
    ).join('');
    el.querySelectorAll('.edit-loc-result').forEach(btn => {
      btn.addEventListener('click', () => {
        const lat = parseFloat(btn.dataset.lat);
        const lng = parseFloat(btn.dataset.lng);
        _editLat = lat; _editLng = lng;
        if (_editLocMap && _editLocMarker) {
          _editLocMap.setView([lat, lng], 15);
          _editLocMarker.setLatLng([lat, lng]);
        }
        el.innerHTML = '';
        document.getElementById('edit-loc-search').value = btn.textContent;
      });
    });
  } catch {}
}

function renderEditTypeGrid(selectedType) {
  _editSelectedType = selectedType;
  const grid = document.getElementById('edit-type-grid');
  if (!grid) return;
  grid.innerHTML = TYPE_DEFS.map(td =>
    `<button class="type-pill${td.type === selectedType ? ' active' : ''}" data-type="${td.type}">
       <span class="type-pill-icon">${td.icon}</span>
       <span class="type-pill-label">${td.label}</span>
     </button>`
  ).join('');
  grid.querySelectorAll('.type-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      _editSelectedType = btn.dataset.type;
      grid.querySelectorAll('.type-pill').forEach(b => b.classList.toggle('active', b.dataset.type === _editSelectedType));
    });
  });
}

function renderEditPriority(selectedPriority) {
  _editSelectedPriority = selectedPriority;
  const grid = document.getElementById('edit-priority-grid');
  if (!grid) return;
  grid.innerHTML = PRIORITY_DEFS.map(pd =>
    `<button class="priority-opt${pd.value === selectedPriority ? ' active' : ''}" data-val="${pd.value}">
       <span class="priority-opt-stars">${pd.stars}</span>
       <span class="priority-opt-label">${pd.label}</span>
     </button>`
  ).join('');
  grid.querySelectorAll('.priority-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      _editSelectedPriority = parseInt(btn.dataset.val);
      grid.querySelectorAll('.priority-opt').forEach(b => b.classList.toggle('active', parseInt(b.dataset.val) === _editSelectedPriority));
    });
  });
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

  buildDurPicker(getStopDuration(stop));
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
  const dur    = getDurPickerMins();

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
    document.getElementById('detail-name').textContent = _editStop.icon + ' ' + getStopName(_editStop);
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
        <div class="ph-icon" style="font-size:72px">${stop.icon}</div>
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
  document.getElementById('detail-name').textContent  = stop.icon + ' ' + stop.location;
  document.getElementById('detail-reason').textContent = _wikiCache[stop.id]?.extract || getStopReason(stop);

  const tagsEl = document.getElementById('detail-tags');
  tagsEl.innerHTML = '';
  if (getStopVegan(stop))                    tagsEl.innerHTML += '<span class="tl-tag vegan">🌱 Vegan-friendly</span>';
  if (getStopType(stop) === 'charging')      tagsEl.innerHTML += '<span class="tl-tag charge">⚡ Supercharger</span>';
  if (getStopPriority(stop) >= 3)            tagsEl.innerHTML += '<span class="tl-tag poi">★ Must-see</span>';

  const actEl = document.getElementById('detail-actions');
  const parts = [`<a class="act-btn-full tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗 Navigate</a>`];
  if (getStopVegan(stop) || getStopType(stop) === 'food')
    parts.push(`<a class="act-btn-full vegan" href="${veganNearbyUrl(stop)}" target="_blank" rel="noopener">🌱 Vegan nearby</a>`);
  parts.push(`<a class="act-btn-full charge" href="${chargingNearbyUrl(stop)}" target="_blank" rel="noopener">⚡ Chargers</a>`);
  if (stop.mapsUrl && stop.mapsUrl !== 'N/A')
    parts.push(`<a class="act-btn-full maps" href="${stop.mapsUrl}" target="_blank" rel="noopener">🗺️ Maps</a>`);
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

    if (diffX > 60) {
      closeDetail();
    } else if (diffX < -60) {
      const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
      if (!day || !_detailStop) return;
      const idx  = day.stops.findIndex(s => s.id === _detailStop.id);
      const next = day.stops[idx + 1];
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
  if (btn)  { btn.classList.toggle('checked', !!state.checked[stopId]); btn.textContent = state.checked[stopId] ? '✓' : '○'; }
}

/* ── Time modal ────────────────────────────────────────────────────── */
let _modalStop = null, _modalDay = null;
function openTimeModal(stop, day) {
  _modalStop = stop; _modalDay = day;
  document.getElementById('modal-location').textContent = stop.icon + ' ' + stop.location;
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

/* ── Init ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  load();
  loadWikiCache();
  state.currentDayId = findTodayDayId() || TRIP_DATA.days[0].id;
  buildDayStrip();
  renderView(true); // scroll to now only on first load

  /* Nav buttons */
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      state.currentView = btn.dataset.view;
      renderView(false);
    }));

  /* Today button — jump to now and scroll to it */
  document.getElementById('today-btn').addEventListener('click', () => {
    state.currentDayId = findTodayDayId() || TRIP_DATA.days[0].id;
    state.currentView = 'day';
    updateDayStrip();
    renderView(true); // scroll to now
  });

  /* Cascade toggle */
  document.getElementById('cascade-btn').addEventListener('click', () => {
    state.cascadeEnabled = !state.cascadeEnabled;
    const btn = document.getElementById('cascade-btn');
    btn.classList.toggle('cascade-on', state.cascadeEnabled);
    btn.title = state.cascadeEnabled ? 'Cascade ON' : 'Cascade OFF';
  });

  /* Drawer */
  const openDrawer = () => {
    document.getElementById('drawer').classList.remove('hidden');
    document.getElementById('drawer-overlay').classList.remove('hidden');
  };
  const closeDrawer = () => {
    document.getElementById('drawer').classList.add('hidden');
    document.getElementById('drawer-overlay').classList.add('hidden');
  };
  document.getElementById('menu-btn').addEventListener('click', openDrawer);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
  document.querySelectorAll('.drawer-item[data-action]').forEach(btn =>
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'reset-times')  { state.overrides = {}; state.locOverrides = {}; state.durOverrides = {}; state.typeOverrides = {}; state.priorityOverrides = {}; state.reasonOverrides = {}; state.veganOverrides = {}; save(); renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'reset-checks') { state.checked   = {}; save(); renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'toggle-dark')  {
        document.body.classList.toggle('light');
        try { localStorage.setItem('annecy_theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch {}
        // Rebuild map with new tile theme
        if (_leafletMap) { _leafletMap.remove(); _leafletMap = null; document.getElementById('map-container').innerHTML = ''; }
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

  /* Edit sheet */
  document.getElementById('edit-sheet-close').addEventListener('click', closeEditSheet);
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
    const dur    = getDurPickerMins();
    state.locOverrides[stop.id] = { name: name || stop.location, lat: _editLat ?? getStopLat(stop), lng: _editLng ?? getStopLng(stop) };
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
  document.getElementById('edit-loc-search').addEventListener('input', e => {
    clearTimeout(_editSearchTimer);
    _editSearchTimer = setTimeout(() => searchEditLocation(e.target.value.trim()), 400);
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

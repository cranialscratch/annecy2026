/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  currentDayId: null,
  currentView: 'day',
  cascadeEnabled: false,
  overrides: {},
  checked: {},
  dayEdits: {},   // dayId → full stops array
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
function getStopTime(stop) { return state.overrides[stop.id] ?? stop.time; }
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
  if (stop.veganFriendly)       tags.push(`<span class="tl-tag vegan">🌱 Vegan-friendly</span>`);
  if (stop.type === 'charging') tags.push(`<span class="tl-tag charge">⚡ Supercharger</span>`);
  if (stop.priority >= 3)       tags.push(`<span class="tl-tag poi">★ Must-see</span>`);
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

/* ── Wikipedia image cache ─────────────────────────────────────────── */
const _wikiCache = {};

function loadWikiCache() {
  try {
    const saved = localStorage.getItem('annecy_wiki_v3');
    if (saved) Object.assign(_wikiCache, JSON.parse(saved));
  } catch {}
}
function saveWikiCache() {
  try { localStorage.setItem('annecy_wiki_v3', JSON.stringify(_wikiCache)); } catch {}
}

async function fetchWikiImage(stopId) {
  if (_wikiCache[stopId] !== undefined) return _wikiCache[stopId];
  const title = WIKI_TITLES[stopId];
  if (!title) { _wikiCache[stopId] = null; return null; }
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    const imgUrl = page?.thumbnail?.source || null;
    _wikiCache[stopId] = imgUrl;
    saveWikiCache();
    return imgUrl;
  } catch {
    _wikiCache[stopId] = null;
    return null;
  }
}

function findStop(stopId) {
  for (const dayId of Object.keys(state.dayEdits))
    for (const s of state.dayEdits[dayId]) if (s.id === stopId) return s;
  for (const day of TRIP_DATA.days)
    for (const s of day.stops) if (s.id === stopId) return s;
  return null;
}

function injectWikiImage(stopId, imgUrl) {
  if (!imgUrl) return;
  const item = document.getElementById(`stop-${stopId}`);
  if (!item) return;
  const stop = findStop(stopId);
  if (!stop) return;
  // Rebuild the card slider with the photo as first slide
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
    if (!WIKI_TITLES[stop.id]) return;
    if (_wikiCache[stop.id] !== undefined) {
      // Already cached — inject immediately
      if (_wikiCache[stop.id]) injectWikiImage(stop.id, _wikiCache[stop.id]);
      return;
    }
    fetchWikiImage(stop.id).then(url => injectWikiImage(stop.id, url));
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
function getPhotos(stop) {
  const wikiUrl = _wikiCache[stop.id];
  const osm = `https://staticmap.openstreetmap.de/staticmap.php?center=${stop.lat},${stop.lng}&zoom=15&size=640x380&markers=${stop.lat},${stop.lng},red`;
  if (wikiUrl) return [wikiUrl, osm];
  return ['__placeholder__', osm];
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

/* ── Mutable stop data ─────────────────────────────────────────────── */
// dayEdits[dayId] = full stops array (overrides TRIP_DATA)
// Loaded/saved to localStorage

function getDayStops(dayId) {
  return state.dayEdits[dayId] || TRIP_DATA.days.find(d => d.id === dayId)?.stops || [];
}

function saveDayStops(dayId, stops) {
  state.dayEdits[dayId] = stops;
  try {
    localStorage.setItem('annecy_day_edits', JSON.stringify(state.dayEdits));
  } catch {}
}

function loadDayEdits() {
  try {
    const raw = localStorage.getItem('annecy_day_edits');
    if (raw) state.dayEdits = JSON.parse(raw);
  } catch {}
}

function makeStopId() {
  return 'custom_' + Date.now();
}

/* ── Nominatim location search ─────────────────────────────────────── */
async function searchNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&accept-language=en`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Annecy2026TripPlanner/1.0' } });
  return await res.json();
}

/* ── Edit / Add modal ──────────────────────────────────────────────── */
let _editIsNew = false;
let _editPriority = 0;

function openEditModal(stop, dayId) {
  _editIsNew = false;
  _editPriority = stop.priority || 0;

  document.getElementById('edit-title').textContent = 'Edit Stop';
  document.getElementById('edit-delete-btn').classList.remove('hidden');
  document.getElementById('edit-stop-id').value  = stop.id;
  document.getElementById('edit-day-id').value   = dayId;
  document.getElementById('edit-name').value     = stop.location;
  document.getElementById('edit-time').value     = getStopTime(stop);
  document.getElementById('edit-type').value     = stop.type;
  document.getElementById('edit-notes').value    = stop.reason || '';
  document.getElementById('edit-vegan').checked  = !!stop.veganFriendly;
  document.getElementById('edit-lat').value      = stop.lat || '';
  document.getElementById('edit-lng').value      = stop.lng || '';
  document.getElementById('edit-maps-url').value = stop.mapsUrl || '';
  document.getElementById('edit-cascade').checked = state.cascadeEnabled;
  document.getElementById('edit-search').value   = '';
  document.getElementById('edit-search-results').innerHTML = '';
  document.getElementById('edit-search-results').classList.remove('visible');
  updateStarRow();

  document.getElementById('edit-overlay').classList.remove('hidden');
}

function openAddModal(dayId, afterStopId) {
  _editIsNew = true;
  _editPriority = 0;

  document.getElementById('edit-title').textContent = 'Add Stop';
  document.getElementById('edit-delete-btn').classList.add('hidden');
  document.getElementById('edit-stop-id').value  = afterStopId || '__end__';
  document.getElementById('edit-day-id').value   = dayId;
  document.getElementById('edit-name').value     = '';
  document.getElementById('edit-time').value     = '';
  document.getElementById('edit-type').value     = 'wander';
  document.getElementById('edit-notes').value    = '';
  document.getElementById('edit-vegan').checked  = false;
  document.getElementById('edit-lat').value      = '';
  document.getElementById('edit-lng').value      = '';
  document.getElementById('edit-maps-url').value = '';
  document.getElementById('edit-cascade').checked = false;
  document.getElementById('edit-search').value   = '';
  document.getElementById('edit-search-results').innerHTML = '';
  document.getElementById('edit-search-results').classList.remove('visible');
  updateStarRow();

  document.getElementById('edit-overlay').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-overlay').classList.add('hidden');
}

function updateStarRow() {
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.val) === _editPriority);
  });
}

function saveEditModal() {
  const stopId  = document.getElementById('edit-stop-id').value;
  const dayId   = document.getElementById('edit-day-id').value;
  const name    = document.getElementById('edit-name').value.trim();
  const time    = document.getElementById('edit-time').value;
  const type    = document.getElementById('edit-type').value;
  const notes   = document.getElementById('edit-notes').value.trim();
  const vegan   = document.getElementById('edit-vegan').checked;
  const lat     = parseFloat(document.getElementById('edit-lat').value) || 0;
  const lng     = parseFloat(document.getElementById('edit-lng').value) || 0;
  const mapsUrl = document.getElementById('edit-maps-url').value ||
    `https://maps.google.com/?q=${encodeURIComponent(name)}`;
  const cascade = document.getElementById('edit-cascade').checked;

  if (!name) return; // require a name

  const typeIcons = {
    charging:'⚡', hotel:'🏨', transport:'🚂', food:'🍽️', architecture:'🏛️',
    village:'🏡', town:'⚓', experience:'🌿', wander:'🗺️', depart:'🚗',
    scenic:'🛣️', historic:'🏰', festival:'🎬'
  };

  let stops = [...getDayStops(dayId)];

  if (_editIsNew) {
    const newStop = {
      id: makeStopId(),
      order: stops.length + 1,
      time: time || '12:00',
      tz: 'FR',
      location: name,
      type,
      priority: _editPriority,
      lat, lng, mapsUrl,
      reason: notes || 'Added stop.',
      icon: typeIcons[type] || '📍',
      veganFriendly: vegan,
    };
    if (stopId === '__end__') {
      stops.push(newStop);
    } else {
      const idx = stops.findIndex(s => s.id === stopId);
      stops.splice(idx + 1, 0, newStop);
    }
  } else {
    // Editing existing stop
    const idx = stops.findIndex(s => s.id === stopId);
    if (idx === -1) return;
    const original = stops[idx];

    const oldMins = timeToMinutes(getStopTime(original));
    const newMins = timeToMinutes(time);
    const delta = (oldMins !== null && newMins !== null) ? newMins - oldMins : 0;

    stops[idx] = {
      ...original,
      location: name,
      time,
      type,
      priority: _editPriority,
      lat: lat || original.lat,
      lng: lng || original.lng,
      mapsUrl,
      reason: notes || original.reason,
      icon: typeIcons[type] || original.icon,
      veganFriendly: vegan,
    };

    if (cascade && delta !== 0) {
      for (let i = idx + 1; i < stops.length; i++) {
        const cur = timeToMinutes(state.overrides[stops[i].id] ?? stops[i].time);
        if (cur !== null) {
          state.overrides[stops[i].id] = minutesToTime(cur + delta);
        }
      }
    }
  }

  saveDayStops(dayId, stops);
  save();
  closeEditModal();
  closeDetail();
  renderView(false);
}

function deleteStop(stopId, dayId) {
  if (!confirm('Remove this stop from the day?')) return;
  const stops = getDayStops(dayId).filter(s => s.id !== stopId);
  saveDayStops(dayId, stops);
  closeEditModal();
  closeDetail();
  renderView(false);
}

/* ── Persist ───────────────────────────────────────────────────────── */
function save() {
  try {
    localStorage.setItem('annecy_overrides', JSON.stringify(state.overrides));
    localStorage.setItem('annecy_checked',   JSON.stringify(state.checked));
  } catch {}
}
function load() {
  try {
    const o = localStorage.getItem('annecy_overrides');
    const c = localStorage.getItem('annecy_checked');
    if (o) state.overrides = JSON.parse(o);
    if (c) state.checked   = JSON.parse(c);
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
  else if (day) { label.textContent = `${getDayLabel(day)} · ${day.title}`; sub.textContent = day.subtitle || ''; }
}

/* ── Render dispatcher ─────────────────────────────────────────────── */
function renderView(scrollToNow) {
  updateHeader();
  const tl = document.getElementById('timeline');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === state.currentView));
  if (state.currentView === 'overview')      renderOverview(tl);
  else if (state.currentView === 'vegan')    renderFilterList(tl, 'vegan');
  else if (state.currentView === 'charging') renderFilterList(tl, 'charging');
  else renderTimeline(tl, scrollToNow);
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

  const stops = getDayStops(day.id);
  const now = nowMinutes();
  let nowLineEl = null;
  let nowInserted = false;

  stops.forEach((stop, idx) => {
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
    const item = buildTimelineItem(stop, idx === stops.length - 1, day.id);
    container.appendChild(item);
  });

  // Add stop button at bottom
  const addBtn = document.createElement('button');
  addBtn.className = 'add-stop-btn';
  addBtn.innerHTML = '＋ Add stop to this day';
  addBtn.addEventListener('click', () => openAddModal(day.id, '__end__'));
  container.appendChild(addBtn);

  // Fetch Wikipedia photos lazily after render
  lazyLoadWikiImages(stops);

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
function buildTimelineItem(stop, isLast, dayId) {
  const item = document.createElement('div');
  item.className = 'tl-item';
  item.dataset.type = stop.type;
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
          <div style="display:flex;gap:4px;align-items:center">
            <button class="edit-card-btn" data-stop-id="${stop.id}" aria-label="Edit stop">✏️</button>
            <button class="check-btn${isVisited ? ' checked' : ''}" data-stop-id="${stop.id}" aria-label="Mark visited">${isVisited ? '✓' : '○'}</button>
          </div>
        </div>
        <div class="card-meta-row">
          <span class="tl-card-badge">${typeLabel(stop.type)}</span>
          ${stop.priority > 0 ? `<span class="priority-stars">${priorityStars(stop.priority)}</span>` : ''}
        </div>
        <div class="card-reason">${stop.reason}</div>
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
  item.querySelector('.edit-card-btn').addEventListener('click', e => {
    e.stopPropagation();
    openEditModal(stop, dayId || state.currentDayId);
  });
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
      openDetail(stop);
    }
    isHoriz = null;
  });
}

/* ── Action buttons — icon only ───────────────────────────────────── */
function buildIconActions(stop) {
  const parts = [`<a class="act-btn tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗</a>`];
  if (stop.type !== 'depart' && stop.type !== 'transport') {
    if (stop.veganFriendly || stop.type === 'food')
      parts.push(`<a class="act-btn vegan" href="${veganNearbyUrl(stop)}" target="_blank" rel="noopener">🌱</a>`);
    parts.push(`<a class="act-btn charge" href="${chargingNearbyUrl(stop)}" target="_blank" rel="noopener">⚡</a>`);
    if (stop.priority >= 2)
      parts.push(`<a class="act-btn poi" href="${poiNearbyUrl(stop)}" target="_blank" rel="noopener">📍</a>`);
  }
  if (stop.mapsUrl && stop.mapsUrl !== 'N/A')
    parts.push(`<a class="act-btn maps" href="${stop.mapsUrl}" target="_blank" rel="noopener">🗺️</a>`);
  return parts.join('');
}

/* ── Detail page ───────────────────────────────────────────────────── */
let _detailStop = null, _detailCurrent = 0, _detailTotal = 0;

function openDetail(stop) {
  _detailStop = stop;
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));

  const photos = getPhotos(stop);
  _detailTotal = photos.length;
  _detailCurrent = 0;

  const slidesEl = document.getElementById('detail-slides');
  const dotsEl   = document.getElementById('detail-dots');
  slidesEl.style.transition = 'none';
  slidesEl.style.transform  = 'translateX(0)';
  const [dc1, dc2] = TYPE_GRAD[stop.type] || ['#334155','#0f172a'];
  slidesEl.innerHTML = photos.map(url => {
    if (url === '__placeholder__') {
      return `<div class="detail-slide detail-slide-placeholder" style="background:linear-gradient(145deg,${dc1}55,${dc2})">
        <div class="ph-icon" style="font-size:72px">${stop.icon}</div>
        <div class="ph-name" style="font-size:18px;margin-top:12px;padding:0 24px;text-align:center">${stop.location}</div>
      </div>`;
    }
    return `<img class="detail-slide" src="${url}" loading="lazy" alt="${stop.location}">`;
  }).join('');
  dotsEl.innerHTML = photos.length > 1
    ? photos.map((_,i) => `<span class="detail-dot${i===0?' active':''}"></span>`).join('') : '';

  document.getElementById('detail-body').dataset.type = stop.type;
  document.getElementById('detail-badge').textContent = typeLabel(stop.type);
  document.getElementById('detail-time').textContent  = getStopTime(stop) + (stop.tz ? ' ' + stop.tz : '');
  document.getElementById('detail-stars').textContent = priorityStars(stop.priority);
  document.getElementById('detail-name').textContent  = stop.icon + ' ' + stop.location;
  document.getElementById('detail-reason').textContent = stop.reason;

  const tagsEl = document.getElementById('detail-tags');
  tagsEl.innerHTML = '';
  if (stop.veganFriendly)       tagsEl.innerHTML += '<span class="tl-tag vegan">🌱 Vegan-friendly</span>';
  if (stop.type === 'charging') tagsEl.innerHTML += '<span class="tl-tag charge">⚡ Supercharger</span>';
  if (stop.priority >= 3)       tagsEl.innerHTML += '<span class="tl-tag poi">★ Must-see</span>';

  const actEl = document.getElementById('detail-actions');
  const parts = [`<a class="act-btn-full tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗 Navigate</a>`];
  if (stop.veganFriendly || stop.type === 'food')
    parts.push(`<a class="act-btn-full vegan" href="${veganNearbyUrl(stop)}" target="_blank" rel="noopener">🌱 Vegan nearby</a>`);
  parts.push(`<a class="act-btn-full charge" href="${chargingNearbyUrl(stop)}" target="_blank" rel="noopener">⚡ Chargers</a>`);
  if (stop.priority >= 2)
    parts.push(`<a class="act-btn-full poi" href="${poiNearbyUrl(stop)}" target="_blank" rel="noopener">📍 POI</a>`);
  if (stop.mapsUrl && stop.mapsUrl !== 'N/A')
    parts.push(`<a class="act-btn-full maps" href="${stop.mapsUrl}" target="_blank" rel="noopener">🗺️ Maps</a>`);
  actEl.innerHTML = parts.join('');

  updateDetailCheckBtn();
  initDetailSlider();
  overlay.scrollTop = 0;

  // If wiki image not yet loaded, fetch it and update the detail slider
  if (!_wikiCache[stop.id] && WIKI_TITLES[stop.id]) {
    fetchWikiImage(stop.id).then(url => {
      // Only update if this detail is still open for the same stop
      if (_detailStop && _detailStop.id === stop.id && url) {
        _detailTotal = 2;
        _detailCurrent = 0;
        const slidesEl = document.getElementById('detail-slides');
        const dotsEl   = document.getElementById('detail-dots');
        const img = document.createElement('img');
        img.className = 'detail-slide';
        img.src = url;
        img.alt = stop.location;
        slidesEl.style.transition = 'none';
        slidesEl.style.transform = 'translateX(0)';
        slidesEl.prepend(img);
        dotsEl.innerHTML = `<span class="detail-dot active"></span><span class="detail-dot"></span>`;
        initDetailSlider();
      }
    });
  }
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
  loadDayEdits();
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
      if (btn.dataset.action === 'reset-times')  { state.overrides = {}; save(); renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'reset-checks') { state.checked   = {}; save(); renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'reset-stops')  { state.dayEdits  = {}; try { localStorage.removeItem('annecy_day_edits'); } catch {} renderView(false); closeDrawer(); }
      if (btn.dataset.action === 'toggle-dark')  {
        document.body.classList.toggle('light');
        try { localStorage.setItem('annecy_theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch {}
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

  /* Edit/Add sheet */
  document.getElementById('edit-close').addEventListener('click', closeEditModal);
  document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
  document.getElementById('edit-overlay').addEventListener('click', e => {
    if (e.target.id === 'edit-overlay') closeEditModal();
  });
  document.getElementById('edit-save').addEventListener('click', saveEditModal);
  document.getElementById('edit-delete-btn').addEventListener('click', () => {
    const stopId = document.getElementById('edit-stop-id').value;
    const dayId  = document.getElementById('edit-day-id').value;
    deleteStop(stopId, dayId);
  });

  // Star priority buttons
  document.querySelectorAll('.star-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      _editPriority = parseInt(btn.dataset.val);
      updateStarRow();
    }));

  // Location search
  let _searchTimer = null;
  document.getElementById('edit-search').addEventListener('input', e => {
    clearTimeout(_searchTimer);
    const q = e.target.value.trim();
    if (q.length < 3) {
      document.getElementById('edit-search-results').classList.remove('visible');
      return;
    }
    _searchTimer = setTimeout(async () => {
      try {
        const results = await searchNominatim(q);
        const box = document.getElementById('edit-search-results');
        box.innerHTML = '';
        if (!results.length) {
          box.innerHTML = '<div class="search-result"><div class="search-result-name">No results found</div></div>';
        } else {
          results.slice(0, 5).forEach(r => {
            const div = document.createElement('div');
            div.className = 'search-result';
            const parts = r.display_name.split(', ');
            div.innerHTML = `<div class="search-result-name">${parts[0]}</div><div class="search-result-sub">${parts.slice(1,3).join(', ')}</div>`;
            div.addEventListener('click', () => {
              document.getElementById('edit-name').value     = parts[0];
              document.getElementById('edit-lat').value      = r.lat;
              document.getElementById('edit-lng').value      = r.lon;
              document.getElementById('edit-maps-url').value = `https://maps.google.com/?q=${r.lat},${r.lon}`;
              document.getElementById('edit-search').value   = parts[0];
              box.classList.remove('visible');
            });
            box.appendChild(div);
          });
        }
        box.classList.add('visible');
      } catch {}
    }, 400);
  });

  document.getElementById('edit-search-btn').addEventListener('click', async () => {
    const q = document.getElementById('edit-search').value.trim();
    if (!q) return;
    try {
      const results = await searchNominatim(q);
      const box = document.getElementById('edit-search-results');
      box.innerHTML = '';
      results.slice(0, 5).forEach(r => {
        const div = document.createElement('div');
        div.className = 'search-result';
        const parts = r.display_name.split(', ');
        div.innerHTML = `<div class="search-result-name">${parts[0]}</div><div class="search-result-sub">${parts.slice(1,3).join(', ')}</div>`;
        div.addEventListener('click', () => {
          document.getElementById('edit-name').value     = parts[0];
          document.getElementById('edit-lat').value      = r.lat;
          document.getElementById('edit-lng').value      = r.lon;
          document.getElementById('edit-maps-url').value = `https://maps.google.com/?q=${r.lat},${r.lon}`;
          document.getElementById('edit-search').value   = parts[0];
          box.classList.remove('visible');
        });
        box.appendChild(div);
      });
      box.classList.add('visible');
    } catch {}
  });

  /* Detail page edit/delete */
  document.getElementById('detail-edit-btn').addEventListener('click', () => {
    if (!_detailStop) return;
    const dayId = TRIP_DATA.days.find(d =>
      getDayStops(d.id).some(s => s.id === _detailStop.id))?.id || state.currentDayId;
    openEditModal(_detailStop, dayId);
  });
  document.getElementById('detail-delete-btn').addEventListener('click', () => {
    if (!_detailStop) return;
    const dayId = TRIP_DATA.days.find(d =>
      getDayStops(d.id).some(s => s.id === _detailStop.id))?.id || state.currentDayId;
    deleteStop(_detailStop.id, dayId);
  });

  /* Detail page */
  document.getElementById('detail-back').addEventListener('click', closeDetail);
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

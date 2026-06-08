/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  currentDayId: null,
  currentView: 'day',
  cascadeEnabled: false,
  overrides: {},
  checked: {},
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

/* ── Curated photos (Wikimedia Commons — free, no API key) ─────────── */
const CURATED = {
  // Day 1
  'd1s6':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Saint-Valery-sur-Somme_-_La_baie_de_Somme_%281%29.jpg/800px-Saint-Valery-sur-Somme_-_La_baie_de_Somme_%281%29.jpg'],
  'd1s13': ['https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Amiens_Kathedrale.jpg/800px-Amiens_Kathedrale.jpg'],
  // Day 2
  'd2s2':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Hortillonnages_Amiens_01.jpg/800px-Hortillonnages_Amiens_01.jpg'],
  'd2s6':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Gerberoy1.JPG/800px-Gerberoy1.JPG'],
  'd2s11': ['https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Troyes_-_Ruelle_des_Chats.jpg/800px-Troyes_-_Ruelle_des_Chats.jpg'],
  'd2s10': ['https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Troyes_vue_g%C3%A9n%C3%A9rale.jpg/800px-Troyes_vue_g%C3%A9n%C3%A9rale.jpg'],
  // Day 3
  'd3s2':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Flavigny-sur-Ozerain_abbaye_2006.jpg/800px-Flavigny-sur-Ozerain_abbaye_2006.jpg'],
  'd3s4':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Fontenay_Abbey_3.jpg/800px-Fontenay_Abbey_3.jpg'],
  'd3s6':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Semur-en-Auxois_-_panoramio.jpg/800px-Semur-en-Auxois_-_panoramio.jpg'],
  'd3s8':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Clos_de_Vougeot_01.jpg/800px-Clos_de_Vougeot_01.jpg'],
  'd3s15': ['https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Beaune-HDR.jpg/800px-Beaune-HDR.jpg'],
  // Day 4
  'd4s7':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lac_d%27Annecy_vu_du_Roc_de_Ch%C3%A8re.jpg/800px-Lac_d%27Annecy_vu_du_Roc_de_Ch%C3%A8re.jpg'],
  // Festival
  'fs3':   ['https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lac_d%27Annecy_vu_du_Roc_de_Ch%C3%A8re.jpg/800px-Lac_d%27Annecy_vu_du_Roc_de_Ch%C3%A8re.jpg'],
  'fs4':   ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Annecy_-_Vieille_ville_%281%29.jpg/800px-Annecy_-_Vieille_ville_%281%29.jpg'],
  'fs7':   ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Menthon-Saint-Bernard_-_Ch%C3%A2teau_de_Menthon_%281%29.jpg/800px-Menthon-Saint-Bernard_-_Ch%C3%A2teau_de_Menthon_%281%29.jpg'],
  // Day 5
  'd5s2':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/ArcetSenans_SalineRoyale.jpg/800px-ArcetSenans_SalineRoyale.jpg'],
  'd5s6':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Besancon_pano.jpg/800px-Besancon_pano.jpg'],
  'd5s7':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Citadelle_Besancon.jpg/800px-Citadelle_Besancon.jpg'],
  // Day 6
  'd6s3':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
             'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Giverny_-_Le_jardin_de_Monet_%281%29.jpg/800px-Giverny_-_Le_jardin_de_Monet_%281%29.jpg'],
  'd6s6':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Rouen_-_Cath%C3%A9drale_Notre-Dame_%281%29.jpg/800px-Rouen_-_Cath%C3%A9drale_Notre-Dame_%281%29.jpg'],
  'd6s5':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Rouen_rue_du_Gros_Horloge.jpg/800px-Rouen_rue_du_Gros_Horloge.jpg'],
  // Day 7
  'd7s2':  ['https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Saint-Valery-sur-Somme_-_La_baie_de_Somme_%281%29.jpg/800px-Saint-Valery-sur-Somme_-_La_baie_de_Somme_%281%29.jpg'],
};

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
  const curated = CURATED[stop.id] || [];
  // OSM static map — free, no API key needed
  const osm = `https://staticmap.openstreetmap.de/staticmap.php?center=${stop.lat},${stop.lng}&zoom=15&size=640x380&markers=${stop.lat},${stop.lng},red`;
  // placeholder sentinel (rendered as styled div, not img)
  const placeholder = '__placeholder__';

  if (curated.length) return [...curated, osm];
  if (stop.type === 'charging' || stop.type === 'transport' || stop.type === 'depart' || stop.type === 'hotel') {
    return [placeholder, osm];
  }
  return [placeholder, osm];
}

/* ── Wikipedia images (free, CORS-enabled, looked up by location) ───── */
// Builds a clean, searchable place name from a stop's location string.
function wikiQuery(stop) {
  if (CURATED[stop.id]) return null;              // already has a curated photo
  // Logistics / generic stops have no meaningful Wikipedia location image
  if (['charging','transport','depart','hotel','food'].includes(stop.type)) return null;
  const q = stop.location
    .replace(/^(Old |Medieval |Historic |Evening |Independent |Central )/i, '')
    .replace(/\b(Wander|Walk|Boat Tour|Area|Old Town|Lunch|Dinner|Stop)\b/gi, '')
    .replace(/\s*&\s*/g, ' ')
    .replace(/,.*$/, '')                           // drop everything after the first comma
    .replace(/\s{2,}/g, ' ')
    .trim();
  return q || stop.location;
}

// Resolves a place name to a Wikipedia thumbnail URL (or null). Cached in
// localStorage so each place is only looked up once; '' = known-missing.
function fetchWikiImage(query) {
  const key = 'wimg:' + query.toLowerCase();
  let cached = null;
  try { cached = localStorage.getItem(key); } catch (_) {}
  if (cached !== null) return Promise.resolve(cached || null);
  const api = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*'
    + '&generator=search&gsrlimit=1&gsrsearch=' + encodeURIComponent(query)
    + '&prop=pageimages&piprop=thumbnail&pithumbsize=800';
  return fetch(api).then(r => r.json()).then(d => {
    let url = '';
    const pages = d && d.query && d.query.pages;
    if (pages) {
      const first = Object.values(pages)[0];
      if (first && first.thumbnail && first.thumbnail.source) url = first.thumbnail.source;
    }
    try { localStorage.setItem(key, url); } catch (_) {}
    return url || null;
  }).catch(() => null);
}

// Progressively turns gradient placeholders into real Wikipedia photos.
function enhanceWikiPlaceholders(root) {
  if (!root) return;
  root.querySelectorAll('[data-wq]').forEach(el => {
    const q = decodeURIComponent(el.getAttribute('data-wq'));
    el.removeAttribute('data-wq');                 // guard against double lookup
    fetchWikiImage(q).then(url => {
      if (!url) return;
      const img = new Image();
      img.onload = () => {
        el.style.backgroundImage = `url("${url}")`;
        el.classList.add('has-photo');
      };
      img.src = url;
    });
  });
}

/* ── Rich location info (free APIs: Wikipedia, Wikimedia Commons) ───── */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function cacheGet(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (_) { return null; } }
function cacheSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }

function dayForStop(stop) {
  for (const d of TRIP_DATA.days) if (d.stops && d.stops.some(s => s.id === stop.id)) return d;
  return null;
}
function osmStatic(stop) {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${stop.lat},${stop.lng}&zoom=15&size=640x380&markers=${stop.lat},${stop.lng},red`;
}

// Google deep links (free, always current — no API key needed)
function googleReviewsUrl(stop) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.location)}`;
}
function whatsOnUrl(stop) {
  const day = dayForStop(stop);
  const area = stop.location.replace(/^[^,]*,\s*/, '').replace(/,.*$/, '').trim() || stop.location;
  const date = day && !day.isFestival
    ? ' on ' + new Date(day.date + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
    : '';
  return `https://www.google.com/search?q=${encodeURIComponent('things to do and events in ' + area + date)}`;
}

// Wikipedia intro paragraph + best hero image
function fetchWikiSummary(q) {
  const api = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1'
    + '&generator=search&gsrlimit=1&gsrsearch=' + encodeURIComponent(q)
    + '&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&piprop=original|thumbnail&pithumbsize=800';
  return fetch(api).then(r => r.json()).then(d => {
    const pages = d && d.query && d.query.pages;
    if (!pages) return null;
    const p = Object.values(pages)[0];
    if (!p) return null;
    return {
      title:   p.title || null,
      extract: p.extract || null,
      url:     p.fullurl || p.canonicalurl || null,
      hero:    (p.original && p.original.source) || (p.thumbnail && p.thumbnail.source) || null,
    };
  }).catch(() => null);
}

// Several photos of the area from Wikimedia Commons
function fetchCommonsImages(q) {
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*'
    + '&generator=search&gsrnamespace=6&gsrlimit=12&gsrsearch=' + encodeURIComponent(q)
    + '&prop=imageinfo&iiprop=url|mime&iiurlwidth=800';
  return fetch(api).then(r => r.json()).then(d => {
    const pages = d && d.query && d.query.pages;
    if (!pages) return [];
    return Object.values(pages)
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .filter(p => p.imageinfo && p.imageinfo[0] && /jpeg|png/i.test(p.imageinfo[0].mime || ''))
      .map(p => p.imageinfo[0].thumburl)
      .filter(Boolean);
  }).catch(() => []);
}

// Notable places near the stop's coordinates ("popular in the area")
function fetchNearby(stop) {
  const api = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*'
    + '&generator=geosearch&ggscoord=' + stop.lat + '|' + stop.lng + '&ggsradius=10000&ggslimit=12'
    + '&prop=pageimages|description|coordinates&piprop=thumbnail&pithumbsize=160';
  return fetch(api).then(r => r.json()).then(d => {
    const pages = d && d.query && d.query.pages;
    if (!pages) return [];
    const here = (stop.location || '').toLowerCase();
    return Object.values(pages)
      .map(p => {
        const co = p.coordinates && p.coordinates[0];
        const dist = co ? haversine(stop.lat, stop.lng, co.lat, co.lon) : 1e9;
        return { title:p.title, desc:p.description || '', thumb:(p.thumbnail && p.thumbnail.source) || null, dist };
      })
      .filter(p => p.title && p.title.toLowerCase() !== here)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 8);
  }).catch(() => []);
}

function haversine(la1, lo1, la2, lo2) {
  const R = 6371, t = x => x * Math.PI / 180;
  const dLa = t(la2 - la1), dLo = t(lo2 - lo1);
  const a = Math.sin(dLa/2)**2 + Math.cos(t(la1)) * Math.cos(t(la2)) * Math.sin(dLo/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Assemble (and cache) everything for a stop's detail page
function loadStopInfo(stop) {
  const key = 'info2:' + stop.id;
  const cached = cacheGet(key);
  if (cached) return Promise.resolve(cached);
  const q = wikiQuery(stop);
  return Promise.all([
    q ? fetchWikiSummary(q)  : Promise.resolve(null),
    q ? fetchCommonsImages(q) : Promise.resolve([]),
    fetchNearby(stop),
  ]).then(([summary, gallery, nearby]) => {
    const info = {
      title:   summary && summary.title,
      extract: summary && summary.extract,
      url:     summary && summary.url,
      hero:    summary && summary.hero,
      gallery: gallery || [],
      nearby:  nearby || [],
    };
    cacheSet(key, info);
    return info;
  }).catch(() => ({ gallery: [], nearby: [] }));
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
          <button class="check-btn${isVisited ? ' checked' : ''}" data-stop-id="${stop.id}" aria-label="Mark visited">${isVisited ? '✓' : '○'}</button>
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
  initSlider(item.querySelector('.card-slider'), stop, 'card');
  return item;
}

/* ── Image slider HTML ─────────────────────────────────────────────── */
function buildSlider(stop, prefix) {
  const photos = getPhotos(stop);
  const [c1, c2] = TYPE_GRAD[stop.type] || ['#334155','#0f172a'];
  const slides = photos.map((url, i) => {
    if (url === '__placeholder__') {
      const wq = wikiQuery(stop);
      return `<div class="${prefix}-slide ${prefix}-slide-placeholder"${wq ? ` data-wq="${encodeURIComponent(wq)}"` : ''} style="background:linear-gradient(145deg,${c1}55,${c2})">
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
  enhanceWikiPlaceholders(sliderEl);
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

// Collect a deduped photo set for the detail gallery (curated + Wikipedia + Commons)
function buildGalleryImages(stop, info) {
  let imgs = [];
  if (CURATED[stop.id]) imgs.push(...CURATED[stop.id]);
  if (info.hero) imgs.push(info.hero);
  if (info.gallery) imgs.push(...info.gallery);
  return imgs.filter((u, i) => u && imgs.indexOf(u) === i).slice(0, 10);
}

function rebuildDetailGallery(stop, imgs) {
  const slidesEl = document.getElementById('detail-slides');
  const dotsEl   = document.getElementById('detail-dots');
  const all = [...imgs, osmStatic(stop)];
  _detailTotal = all.length;
  _detailCurrent = 0;
  slidesEl.style.transition = 'none';
  slidesEl.style.transform  = 'translateX(0)';
  slidesEl.innerHTML = all.map(url =>
    `<img class="detail-slide" src="${url}" loading="lazy" alt="${esc(stop.location)}">`).join('');
  dotsEl.innerHTML = all.length > 1
    ? all.map((_, i) => `<span class="detail-dot${i === 0 ? ' active' : ''}"></span>`).join('') : '';
  initDetailSlider();
}

function renderAbout(el, stop, info) {
  if (!info.extract) { el.className = 'detail-section hidden'; el.innerHTML = ''; return; }
  el.className = 'detail-section';
  el.innerHTML = `<h3 class="sec-title">About ${esc(info.title || stop.location)}</h3>
    <p class="about-text">${esc(info.extract)}</p>
    ${info.url ? `<a class="about-more" href="${info.url}" target="_blank" rel="noopener">Read more on Wikipedia →</a>` : ''}`;
}

function renderNearby(el, info) {
  if (!info.nearby || !info.nearby.length) { el.className = 'detail-section hidden'; el.innerHTML = ''; return; }
  el.className = 'detail-section';
  const cards = info.nearby.map(n => {
    const g = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n.title)}`;
    const km = n.dist < 1 ? Math.round(n.dist * 1000) + ' m' : n.dist.toFixed(1) + ' km';
    return `<a class="nearby-card" href="${g}" target="_blank" rel="noopener">
      <div class="nearby-thumb"${n.thumb ? ` style="background-image:url('${n.thumb}')"` : ''}>${n.thumb ? '' : '📍'}</div>
      <div class="nearby-name">${esc(n.title)}</div>
      <div class="nearby-desc">${esc(n.desc || ('about ' + km + ' away'))}</div>
    </a>`;
  }).join('');
  el.innerHTML = `<h3 class="sec-title">Popular nearby</h3><div class="nearby-scroll">${cards}</div>`;
}

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
      const wq = wikiQuery(stop);
      return `<div class="detail-slide detail-slide-placeholder"${wq ? ` data-wq="${encodeURIComponent(wq)}"` : ''} style="background:linear-gradient(145deg,${dc1}55,${dc2})">
        <div class="ph-icon" style="font-size:72px">${stop.icon}</div>
        <div class="ph-name" style="font-size:18px;margin-top:12px;padding:0 24px;text-align:center">${stop.location}</div>
      </div>`;
    }
    return `<img class="detail-slide" src="${url}" loading="lazy" alt="${stop.location}">`;
  }).join('');
  enhanceWikiPlaceholders(slidesEl);
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
  parts.push(`<a class="act-btn-full reviews" href="${googleReviewsUrl(stop)}" target="_blank" rel="noopener">⭐ Reviews & hours</a>`);
  parts.push(`<a class="act-btn-full whatson" href="${whatsOnUrl(stop)}" target="_blank" rel="noopener">🎟️ What's on</a>`);
  actEl.innerHTML = parts.join('');

  // Reset rich sections, then load them in the background (cached per stop)
  const aboutEl  = document.getElementById('detail-about');
  const nearbyEl = document.getElementById('detail-nearby');
  aboutEl.className  = 'detail-section hidden'; aboutEl.innerHTML  = '';
  nearbyEl.className = 'detail-section hidden'; nearbyEl.innerHTML = '';
  if (wikiQuery(stop)) { aboutEl.className = 'detail-section'; aboutEl.innerHTML = '<div class="sec-loading">Loading details…</div>'; }
  const reqStop = stop;
  loadStopInfo(stop).then(info => {
    if (_detailStop !== reqStop) return;   // user moved on before it loaded
    renderAbout(aboutEl, stop, info);
    renderNearby(nearbyEl, info);
    const gallery = buildGalleryImages(stop, info);
    if (gallery.length) rebuildDetailGallery(stop, gallery);
  });

  updateDetailCheckBtn();
  initDetailSlider();
  overlay.scrollTop = 0;
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

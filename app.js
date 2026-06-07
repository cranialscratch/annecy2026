/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  currentDayId: null,
  currentView: 'day',
  cascadeEnabled: false,
  overrides: {},   // { stopId: "HH:MM" }
};

/* ── Helpers ───────────────────────────────────────────────────────── */
function timeToMinutes(t) {
  if (!t || t === 'Daily' || t === 'All week' || t === 'Nearby') return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}
function getStopTime(stop) {
  return state.overrides[stop.id] ?? stop.time;
}
function priorityStars(p) {
  return p >= 1 ? '★'.repeat(p) + '☆'.repeat(3 - p) : '';
}
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
function isToday(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}
function findTodayDayId() {
  const today = new Date().toISOString().slice(0, 10);
  for (const day of TRIP_DATA.days) {
    if (day.date === today) return day.id;
    if (day.isFestival && today >= day.date && today <= day.dateEnd) return day.id;
  }
  return null;
}
function typeLabel(type) {
  const map = {
    charging:'Charging', hotel:'Hotel', transport:'Transport', food:'Food',
    architecture:'Architecture', village:'Village', town:'Town',
    experience:'Experience', wander:'Explore', depart:'Depart',
    scenic:'Scenic Drive', historic:'Historic', festival:'Festival'
  };
  return map[type] || type;
}

/* ── Navigation URL helpers ────────────────────────────────────────── */
function teslaNavUrl(stop) {
  // Opens Google Maps directions which can be shared to Tesla via the Tesla app
  const dest = encodeURIComponent(stop.location);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}
function chargingNearbyUrl(stop) {
  // PlugShare map near this location
  const { lat, lng } = stop;
  return `https://www.plugshare.com/?latitude=${lat}&longitude=${lng}&spanLat=0.2&spanLng=0.2&filter=Tesla`;
}
function veganNearbyUrl(stop) {
  const { lat, lng } = stop;
  return `https://www.happycow.net/searchmap?lat=${lat}&lng=${lng}&zoom=13`;
}
function poiNearbyUrl(stop) {
  const { lat, lng } = stop;
  return `https://www.google.com/maps/search/points+of+interest/@${lat},${lng},14z`;
}

/* ── Persist overrides ─────────────────────────────────────────────── */
function saveOverrides() {
  try { localStorage.setItem('annecy_overrides', JSON.stringify(state.overrides)); } catch {}
}
function loadOverrides() {
  try {
    const raw = localStorage.getItem('annecy_overrides');
    if (raw) state.overrides = JSON.parse(raw);
  } catch {}
}
function loadTheme() {
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
    const active = isToday(day.date) || (day.isFestival && new Date().toISOString().slice(0,10) >= day.date && new Date().toISOString().slice(0,10) <= day.dateEnd);
    if (active) chip.classList.add('today');
    const dateDisplay = day.isFestival ? '20–27 Jun' : formatDate(day.date);
    chip.innerHTML = `<span class="day-chip-label">${day.label}</span><span class="day-chip-date">${dateDisplay}</span><span class="day-dot"></span>`;
    chip.addEventListener('click', () => selectDay(day.id));
    strip.appendChild(chip);
  });
  updateDayStrip();
}
function updateDayStrip() {
  document.querySelectorAll('.day-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.dayId === state.currentDayId);
  });
  const active = document.querySelector('.day-chip.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

/* ── Select day ────────────────────────────────────────────────────── */
function selectDay(dayId, switchView) {
  state.currentDayId = dayId;
  if (switchView || state.currentView !== 'overview') state.currentView = 'day';
  updateDayStrip();
  renderView();
}

/* ── Header update ─────────────────────────────────────────────────── */
function updateHeader() {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  const label = document.getElementById('header-day-label');
  const sub   = document.getElementById('header-day-subtitle');
  if (state.currentView === 'overview') {
    label.textContent = 'Annecy 2026';
    sub.textContent   = 'Trip overview';
  } else if (state.currentView === 'vegan') {
    label.textContent = '🌱 Vegan Spots';
    sub.textContent   = 'Vegan-friendly stops';
  } else if (state.currentView === 'charging') {
    label.textContent = '⚡ Charging';
    sub.textContent   = 'Tesla Superchargers';
  } else if (day) {
    label.textContent = `${day.label}: ${day.title}`;
    sub.textContent   = day.subtitle || '';
  }
}

/* ── Main render dispatcher ────────────────────────────────────────── */
function renderView() {
  updateHeader();
  const tl = document.getElementById('timeline');
  const view = state.currentView;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));

  if (view === 'overview')  renderOverview(tl);
  else if (view === 'vegan')    renderFilterList(tl, 'vegan');
  else if (view === 'charging') renderFilterList(tl, 'charging');
  else renderTimeline(tl);
}

/* ── Overview ──────────────────────────────────────────────────────── */
function renderOverview(container) {
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'overview-grid';
  TRIP_DATA.days.forEach(day => {
    const card = document.createElement('div');
    card.className = 'overview-card';
    const stops = day.stops.length;
    const dateStr = day.isFestival ? '20–27 Jun' : formatDate(day.date);
    card.innerHTML = `
      <div class="ov-day">${day.label} · ${dateStr}</div>
      <div class="ov-title">${day.title}</div>
      <div class="ov-sub">${day.subtitle || ''}</div>
      <div class="ov-stops">${stops} stop${stops !== 1 ? 's' : ''}</div>`;
    card.addEventListener('click', () => selectDay(day.id, true));
    grid.appendChild(card);
  });
  container.appendChild(grid);
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
      const match = kind === 'vegan' ? stop.veganFriendly : stop.type === 'charging';
      if (!match) return;
      const card = document.createElement('div');
      card.className = 'filter-card';
      const navUrl = kind === 'vegan' ? veganNearbyUrl(stop) : teslaNavUrl(stop);
      card.innerHTML = `
        <span class="filter-icon">${stop.icon}</span>
        <div class="filter-info">
          <div class="filter-day">${day.label} · ${day.isFestival ? '20–27 Jun' : formatDate(day.date)}</div>
          <div class="filter-loc">${stop.location}</div>
          <div class="filter-reason">${stop.reason}</div>
        </div>
        <div class="filter-nav">
          <a class="act-btn tesla" href="${navUrl}" target="_blank" rel="noopener">🧭</a>
        </div>`;
      container.appendChild(card);
    });
  });
}

/* ── Timeline ──────────────────────────────────────────────────────── */
function renderTimeline(container) {
  container.innerHTML = '';
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  if (!day) {
    container.innerHTML = '<div class="empty-state"><div class="big">📅</div><p>Select a day above</p></div>';
    return;
  }

  if (day.isFestival) {
    const banner = document.createElement('div');
    banner.className = 'festival-banner';
    banner.innerHTML = `
      <div style="font-size:36px;margin-bottom:8px">🎬</div>
      <h2>International Animation<br>Film Festival 2026</h2>
      <p>Annecy, France</p>
      <div class="festival-dates">20 – 27 June 2026</div>`;
    container.appendChild(banner);
  }

  day.stops.forEach((stop, idx) => {
    const item = buildTimelineItem(stop, idx === day.stops.length - 1, day);
    container.appendChild(item);
  });
}

function buildTimelineItem(stop, isLast, day) {
  const item = document.createElement('div');
  item.className = 'tl-item';
  item.dataset.type = stop.type;

  const time = getStopTime(stop);
  const isEditable = timeToMinutes(time) !== null;

  item.innerHTML = `
    <div class="tl-left">
      <button class="tl-time-btn ${isEditable ? '' : 'not-editable'}" data-stop-id="${stop.id}" aria-label="Edit time">
        <span>${time}</span>
        ${stop.tz ? `<div class="tl-tz">${stop.tz}</div>` : ''}
      </button>
    </div>
    <div class="tl-line-wrap">
      <div class="tl-dot"></div>
      ${isLast ? '' : '<div class="tl-line"></div>'}
    </div>
    <div class="tl-card">
      <div class="tl-card-top">
        <div>
          <div class="tl-card-name">${stop.icon} ${stop.location}</div>
          ${stop.priority > 0 ? `<div class="priority-stars">${priorityStars(stop.priority)}</div>` : ''}
        </div>
        <span class="tl-card-badge">${typeLabel(stop.type)}</span>
      </div>
      <div class="tl-card-reason">${stop.reason}</div>
      ${buildTags(stop)}
      ${buildActions(stop)}
    </div>`;

  if (isEditable) {
    item.querySelector('.tl-time-btn').addEventListener('click', () => openTimeModal(stop, day));
  }
  return item;
}

function buildTags(stop) {
  const tags = [];
  if (stop.veganFriendly) tags.push(`<span class="tl-tag vegan">🌱 Vegan-friendly</span>`);
  if (stop.type === 'charging') tags.push(`<span class="tl-tag charge">⚡ Supercharger</span>`);
  if (stop.priority >= 3) tags.push(`<span class="tl-tag poi">★ Must-see</span>`);
  return tags.length ? `<div class="tl-card-tags">${tags.join('')}</div>` : '';
}

function buildActions(stop) {
  const isStatic = stop.type === 'depart' || stop.type === 'transport';
  const parts = [];

  // Always show navigate
  parts.push(`<a class="act-btn tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗 Navigate</a>`);

  if (!isStatic) {
    if (stop.veganFriendly || stop.type === 'food') {
      parts.push(`<a class="act-btn vegan" href="${veganNearbyUrl(stop)}" target="_blank" rel="noopener">🌱 Vegan nearby</a>`);
    }
    parts.push(`<a class="act-btn charge" href="${chargingNearbyUrl(stop)}" target="_blank" rel="noopener">⚡ Chargers</a>`);
    if (stop.priority >= 2) {
      parts.push(`<a class="act-btn poi" href="${poiNearbyUrl(stop)}" target="_blank" rel="noopener">📍 POI</a>`);
    }
  }

  if (stop.mapsUrl && stop.mapsUrl !== 'N/A') {
    parts.push(`<a class="act-btn maps" href="${stop.mapsUrl}" target="_blank" rel="noopener">🗺️ Maps</a>`);
  }

  return `<div class="tl-actions">${parts.join('')}</div>`;
}

/* ── Time modal ────────────────────────────────────────────────────── */
let _modalStop = null;
let _modalDay  = null;

function openTimeModal(stop, day) {
  _modalStop = stop;
  _modalDay  = day;
  const cur = getStopTime(stop);
  document.getElementById('modal-title').textContent = 'Edit time';
  document.getElementById('modal-location').textContent = stop.icon + ' ' + stop.location;
  document.getElementById('modal-time-input').value = cur;
  document.getElementById('modal-cascade').checked = state.cascadeEnabled;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  _modalStop = null;
  _modalDay  = null;
}

function saveModal() {
  if (!_modalStop || !_modalDay) return;
  const newTime = document.getElementById('modal-time-input').value;
  const cascade = document.getElementById('modal-cascade').checked;

  const oldMins = timeToMinutes(getStopTime(_modalStop));
  const newMins = timeToMinutes(newTime);
  const delta = newMins - oldMins;

  state.overrides[_modalStop.id] = newTime;

  if (cascade && delta !== 0) {
    let found = false;
    _modalDay.stops.forEach(stop => {
      if (stop.id === _modalStop.id) { found = true; return; }
      if (!found) return;
      const cur = timeToMinutes(getStopTime(stop));
      if (cur !== null) state.overrides[stop.id] = minutesToTime(cur + delta);
    });
  }

  saveOverrides();
  closeModal();
  renderView();
}

/* ── Cascade toggle button ─────────────────────────────────────────── */
function updateCascadeBtn() {
  const btn = document.getElementById('cascade-btn');
  btn.classList.toggle('cascade-on', state.cascadeEnabled);
  btn.title = state.cascadeEnabled ? 'Cascade ON — time shifts ripple forward' : 'Cascade OFF — tap to enable ripple';
}

/* ── Init ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadOverrides();
  loadTheme();

  // Pick today or first day
  const todayId = findTodayDayId();
  state.currentDayId = todayId || TRIP_DATA.days[0].id;

  buildDayStrip();
  renderView();

  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentView = btn.dataset.view;
      renderView();
    });
  });

  // Today button
  document.getElementById('today-btn').addEventListener('click', () => {
    const id = findTodayDayId();
    if (id) {
      selectDay(id, false);
    } else {
      // If today is outside trip, show day 1
      selectDay(TRIP_DATA.days[0].id, false);
    }
    state.currentView = 'day';
    renderView();
  });

  // Cascade toggle
  document.getElementById('cascade-btn').addEventListener('click', () => {
    state.cascadeEnabled = !state.cascadeEnabled;
    updateCascadeBtn();
  });

  // Drawer
  document.getElementById('menu-btn').addEventListener('click', () => {
    document.getElementById('drawer').classList.remove('hidden');
    document.getElementById('drawer-overlay').classList.remove('hidden');
  });
  function closeDrawer() {
    document.getElementById('drawer').classList.add('hidden');
    document.getElementById('drawer-overlay').classList.add('hidden');
  }
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-item[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'reset-times') {
        state.overrides = {};
        saveOverrides();
        renderView();
        closeDrawer();
      } else if (action === 'toggle-dark') {
        document.body.classList.toggle('light');
        try { localStorage.setItem('annecy_theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch {}
        closeDrawer();
      }
    });
  });

  // Modal events
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target === document.getElementById('modal-overlay')) closeModal(); });
  document.getElementById('modal-save').addEventListener('click', saveModal);

  document.querySelectorAll('.time-adj').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('modal-time-input');
      const cur = timeToMinutes(input.value || '00:00');
      const delta = parseInt(btn.dataset.delta, 10);
      if (cur !== null) input.value = minutesToTime(cur + delta);
    });
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

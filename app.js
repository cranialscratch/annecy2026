/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  currentDayId: null,
  currentView: 'day',
  cascadeEnabled: false,
  overrides: {},   // { stopId: "HH:MM" }
  checked: {},     // { stopId: true }
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
function isToday(dateStr) { return dateStr === new Date().toISOString().slice(0,10); }
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
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

/* ── Images ────────────────────────────────────────────────────────── */
function getPhotos(stop) {
  const { lat, lng } = stop;
  const enc = (s) => encodeURIComponent(s);
  // Street View — works for scenic/architecture/village stops
  const sv  = `https://maps.googleapis.com/maps/api/streetview?size=640x380&location=${lat},${lng}&fov=90&pitch=5`;
  // Satellite
  const sat = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=640x380&maptype=satellite&markers=color:red%7C${lat},${lng}`;
  // Road map
  const map = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=640x380&maptype=roadmap&markers=${lat},${lng}`;

  if (stop.type === 'charging' || stop.type === 'transport' || stop.type === 'depart') {
    return [map];
  }
  if (stop.type === 'hotel') return [map, sat];
  return [sv, sat, map];
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
  renderView();
}

/* ── Header ────────────────────────────────────────────────────────── */
function updateHeader() {
  const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
  const label = document.getElementById('header-day-label');
  const sub   = document.getElementById('header-day-subtitle');
  if (state.currentView === 'overview')       { label.textContent = 'Annecy 2026'; sub.textContent = 'Trip overview'; }
  else if (state.currentView === 'vegan')     { label.textContent = '🌱 Vegan Spots'; sub.textContent = 'All vegan-friendly stops'; }
  else if (state.currentView === 'charging')  { label.textContent = '⚡ Charging'; sub.textContent = 'Tesla Superchargers'; }
  else if (day) { label.textContent = `${getDayLabel(day)} · ${day.title}`; sub.textContent = day.subtitle || ''; }
}

/* ── Render dispatcher ─────────────────────────────────────────────── */
function renderView() {
  updateHeader();
  const tl = document.getElementById('timeline');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === state.currentView));
  if (state.currentView === 'overview')       renderOverview(tl);
  else if (state.currentView === 'vegan')     renderFilterList(tl,'vegan');
  else if (state.currentView === 'charging')  renderFilterList(tl,'charging');
  else renderTimeline(tl);
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
        <div>
          <a class="act-btn tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗</a>
        </div>`;
      container.appendChild(card);
    });
  });
}

/* ── Timeline ──────────────────────────────────────────────────────── */
function renderTimeline(container) {
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
  let nowInserted = false;
  let scrollTarget = null;

  day.stops.forEach((stop, idx) => {
    const stopMins = timeToMinutes(getStopTime(stop));

    // Insert "now" marker between past and future stops
    if (!nowInserted && stopMins !== null && stopMins > now) {
      nowInserted = true;
      const nowLine = document.createElement('div');
      nowLine.className = 'tl-now-line';
      nowLine.innerHTML = `<span class="tl-now-label">▶ Now ${minutesToTime(now)}</span>`;
      container.appendChild(nowLine);
      scrollTarget = nowLine;
    }

    const item = buildTimelineItem(stop, idx === day.stops.length - 1);
    container.appendChild(item);

    // If no future stop found, scroll to the last past stop near now
    if (stopMins !== null && stopMins <= now) scrollTarget = item;
  });

  // Scroll to now marker (deferred so layout is complete)
  if (scrollTarget) {
    requestAnimationFrame(() => {
      const mc = document.getElementById('main-content');
      const headerH = document.getElementById('app-header').offsetHeight;
      const offset = scrollTarget.offsetTop - headerH - 16;
      mc.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
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

  // Time button
  if (isEditable) {
    const day = TRIP_DATA.days.find(d => d.id === state.currentDayId);
    item.querySelector('.tl-time-btn').addEventListener('click', () => openTimeModal(stop, day));
  }

  // Check button (stop propagation so it doesn't open detail)
  item.querySelector('.check-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleCheck(stop.id, item);
  });

  // Slider touch
  initSlider(item.querySelector('.card-slider'), stop, 'card', item);

  return item;
}

/* ── Image slider HTML ─────────────────────────────────────────────── */
function buildSlider(stop, prefix) {
  const photos = getPhotos(stop);
  const slides = photos.map((url, i) =>
    `<img class="${prefix}-slide" src="${url}" loading="lazy" onerror="this.style.display='none'" alt="${stop.location}">`
  ).join('');
  const dots = photos.length > 1
    ? `<div class="${prefix}-dots">${photos.map((_, i) => `<span class="${prefix}-dot${i===0?' active':''}"></span>`).join('')}</div>`
    : '';
  return `<div class="${prefix}-slider"><div class="${prefix}-slides">${slides}</div>${dots}</div>`;
}

/* ── Slider touch logic ────────────────────────────────────────────── */
function initSlider(sliderEl, stop, prefix, cardEl) {
  if (!sliderEl) return;
  const slidesEl = sliderEl.querySelector(`.${prefix}-slides`);
  const dotsEls  = sliderEl.querySelectorAll(`.${prefix}-dot`);
  let current = 0;
  let startX = 0, startY = 0, diffX = 0;
  let isDragging = false, isHoriz = null;
  const total = getPhotos(stop).length;

  function goTo(idx) {
    current = Math.max(0, Math.min(total - 1, idx));
    slidesEl.style.transform = `translateX(-${current * 100}%)`;
    dotsEls.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  sliderEl.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
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
      // Tap with no horizontal movement → open detail
      openDetail(stop);
    }
    isHoriz = null;
  });
}

/* ── Action buttons — icon only ───────────────────────────────────── */
function buildIconActions(stop) {
  const parts = [];
  parts.push(`<a class="act-btn tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗</a>`);
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
let _detailStop = null;
let _detailSliderCurrent = 0;
let _detailSliderTotal = 0;

function openDetail(stop) {
  _detailStop = stop;
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('hidden');
  // force reflow then animate
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('open'));
  });

  // Slider
  const photos = getPhotos(stop);
  _detailSliderTotal = photos.length;
  _detailSliderCurrent = 0;

  const slidesEl = document.getElementById('detail-slides');
  const dotsEl   = document.getElementById('detail-dots');
  slidesEl.style.transform = 'translateX(0)';
  slidesEl.innerHTML = photos.map((url, i) =>
    `<img class="detail-slide" src="${url}" loading="lazy" onerror="this.style.display='none'" alt="${stop.location}">`
  ).join('') || `<div class="detail-slide-placeholder">${stop.icon}</div>`;
  dotsEl.innerHTML = photos.length > 1
    ? photos.map((_, i) => `<span class="detail-dot${i===0?' active':''}"></span>`).join('')
    : '';

  // Body
  const day = TRIP_DATA.days.find(d => d.stops.some(s => s.id === stop.id));
  document.getElementById('detail-badge').textContent = typeLabel(stop.type);
  document.getElementById('detail-badge').className = 'tl-card-badge';
  // set data-type on badge's parent for colour
  document.getElementById('detail-body').dataset.type = stop.type;
  document.getElementById('detail-time').textContent = getStopTime(stop) + (stop.tz ? ' ' + stop.tz : '');
  document.getElementById('detail-stars').textContent = priorityStars(stop.priority);
  document.getElementById('detail-name').textContent = stop.icon + ' ' + stop.location;
  document.getElementById('detail-reason').textContent = stop.reason;

  // Tags
  const tagsEl = document.getElementById('detail-tags');
  tagsEl.innerHTML = '';
  if (stop.veganFriendly) tagsEl.innerHTML += '<span class="tl-tag vegan">🌱 Vegan-friendly</span>';
  if (stop.type === 'charging') tagsEl.innerHTML += '<span class="tl-tag charge">⚡ Supercharger</span>';
  if (stop.priority >= 3) tagsEl.innerHTML += '<span class="tl-tag poi">★ Must-see</span>';

  // Actions with labels
  const actEl = document.getElementById('detail-actions');
  const parts = [
    `<a class="act-btn-full tesla" href="${teslaNavUrl(stop)}" target="_blank" rel="noopener">🚗 Navigate</a>`,
  ];
  if (stop.veganFriendly || stop.type === 'food')
    parts.push(`<a class="act-btn-full vegan" href="${veganNearbyUrl(stop)}" target="_blank" rel="noopener">🌱 Vegan nearby</a>`);
  parts.push(`<a class="act-btn-full charge" href="${chargingNearbyUrl(stop)}" target="_blank" rel="noopener">⚡ Chargers</a>`);
  if (stop.priority >= 2)
    parts.push(`<a class="act-btn-full poi" href="${poiNearbyUrl(stop)}" target="_blank" rel="noopener">📍 POI</a>`);
  if (stop.mapsUrl && stop.mapsUrl !== 'N/A')
    parts.push(`<a class="act-btn-full maps" href="${stop.mapsUrl}" target="_blank" rel="noopener">🗺️ Maps</a>`);
  actEl.innerHTML = parts.join('');

  // Check button state
  updateDetailCheckBtn();

  // Wire up detail slider touch
  initDetailSlider();

  // Scroll detail page to top
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
  const dotsEls  = document.querySelectorAll('.detail-dot');
  let startX = 0, startY = 0, diffX = 0, isDragging = false, isHoriz = null;

  function goTo(idx) {
    _detailSliderCurrent = Math.max(0, Math.min(_detailSliderTotal - 1, idx));
    slidesEl.style.transform = `translateX(-${_detailSliderCurrent * 100}%)`;
    document.querySelectorAll('.detail-dot').forEach((d, i) => d.classList.toggle('active', i === _detailSliderCurrent));
  }

  // Remove old listeners by cloning
  const newWrap = wrap.cloneNode(false);
  while (wrap.firstChild) newWrap.appendChild(wrap.firstChild);
  wrap.parentNode.replaceChild(newWrap, wrap);
  newWrap.id = 'detail-slider-wrap';

  newWrap.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    diffX = 0; isDragging = true; isHoriz = null;
    slidesEl.style.transition = 'none';
  }, { passive: true });

  newWrap.addEventListener('touchmove', e => {
    if (!isDragging) return;
    diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - startY;
    if (isHoriz === null) isHoriz = Math.abs(diffX) > Math.abs(diffY);
    if (isHoriz) {
      e.preventDefault();
      slidesEl.style.transform = `translateX(calc(-${_detailSliderCurrent * 100}% + ${diffX}px))`;
    }
  }, { passive: false });

  newWrap.addEventListener('touchend', () => {
    isDragging = false;
    slidesEl.style.transition = 'transform .3s ease';
    if (isHoriz) {
      if (diffX < -40) goTo(_detailSliderCurrent + 1);
      else if (diffX > 40) goTo(_detailSliderCurrent - 1);
      else goTo(_detailSliderCurrent);
    }
    isHoriz = null;
  });
}

/* ── Check off ─────────────────────────────────────────────────────── */
function toggleCheck(stopId, itemEl) {
  state.checked[stopId] = !state.checked[stopId];
  save();
  const card = itemEl ? itemEl.querySelector('.tl-card') : null;
  const btn  = itemEl ? itemEl.querySelector('.check-btn') : null;
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
function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); _modalStop = _modalDay = null; }
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
  save(); closeModal(); renderView();
}

/* ── Cascade button ────────────────────────────────────────────────── */
function updateCascadeBtn() {
  const btn = document.getElementById('cascade-btn');
  btn.classList.toggle('cascade-on', state.cascadeEnabled);
}

/* ── Init ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  load();
  state.currentDayId = findTodayDayId() || TRIP_DATA.days[0].id;

  buildDayStrip();
  renderView();

  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => { state.currentView = btn.dataset.view; renderView(); }));

  document.getElementById('today-btn').addEventListener('click', () => {
    state.currentDayId = findTodayDayId() || TRIP_DATA.days[0].id;
    state.currentView = 'day';
    updateDayStrip();
    renderView();
  });

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
  document.querySelectorAll('.drawer-item[data-action]').forEach(btn =>
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'reset-times')  { state.overrides = {}; save(); renderView(); closeDrawer(); }
      if (btn.dataset.action === 'reset-checks') { state.checked = {};   save(); renderView(); closeDrawer(); }
      if (btn.dataset.action === 'toggle-dark')  {
        document.body.classList.toggle('light');
        try { localStorage.setItem('annecy_theme', document.body.classList.contains('light')?'light':'dark'); } catch {}
        closeDrawer();
      }
    }));

  // Time modal
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target.id==='modal-overlay') closeModal(); });
  document.getElementById('modal-save').addEventListener('click', saveModal);
  document.querySelectorAll('.time-adj').forEach(btn =>
    btn.addEventListener('click', () => {
      const input = document.getElementById('modal-time-input');
      const cur = timeToMinutes(input.value || '00:00');
      if (cur !== null) input.value = minutesToTime(cur + parseInt(btn.dataset.delta, 10));
    }));

  // Detail page
  document.getElementById('detail-back').addEventListener('click', closeDetail);
  document.getElementById('detail-check-btn').addEventListener('click', () => {
    if (!_detailStop) return;
    state.checked[_detailStop.id] = !state.checked[_detailStop.id];
    save();
    updateDetailCheckBtn();
    // Refresh the card in the timeline too
    const itemEl = document.getElementById(`stop-${_detailStop.id}`);
    if (itemEl) {
      const card = itemEl.querySelector('.tl-card');
      const btn  = itemEl.querySelector('.check-btn');
      if (card) card.classList.toggle('visited', !!state.checked[_detailStop.id]);
      if (btn)  { btn.classList.toggle('checked', !!state.checked[_detailStop.id]); btn.textContent = state.checked[_detailStop.id] ? '✓' : '○'; }
    }
  });

  // Service worker
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
});

const DB_NAME = 'HealthyLifeDB';
const DB_VERSION = 2;
const STORE_NAMES = ['meta', 'userProfile', 'plan', 'workoutLogs', 'nutritionLogs', 'bodyLogs', 'snapshots'];

const EXERCISE_CATALOG = [
  { name: 'Push-up', equipment: 'bodyweight', muscles: ['chest', 'triceps'], instructions: 'Hands under shoulders, keep body straight, lower chest and press up.', mistakes: 'Sagging hips, flared elbows.', easier: 'Incline push-up' },
  { name: 'Air Squat', equipment: 'bodyweight', muscles: ['quads', 'glutes'], instructions: 'Feet shoulder-width, sit down and back, stand tall.', mistakes: 'Knees caving inward.', easier: 'Box squat' },
  { name: 'Glute Bridge', equipment: 'bodyweight', muscles: ['glutes', 'hamstrings'], instructions: 'Lie on back, press hips upward with glutes.', mistakes: 'Overarching low back.', easier: 'Bridge hold' },
  { name: 'Plank', equipment: 'bodyweight', muscles: ['core'], instructions: 'Forearms down, body straight, brace core.', mistakes: 'Hips too high or too low.', easier: 'Knee plank' },
  { name: 'Dumbbell Goblet Squat', equipment: 'dumbbells', muscles: ['quads', 'core'], instructions: 'Hold dumbbell at chest, squat deep, stand up.', mistakes: 'Leaning too far forward.', easier: 'Bodyweight squat' },
  { name: 'Dumbbell Row', equipment: 'dumbbells', muscles: ['back', 'biceps'], instructions: 'Hinge at hips, row dumbbells toward ribs.', mistakes: 'Rounding lower back.', easier: 'Supported single-arm row' },
  { name: 'Dumbbell Overhead Press', equipment: 'dumbbells', muscles: ['shoulders', 'triceps'], instructions: 'Press dumbbells overhead while bracing core.', mistakes: 'Arching lower back.', easier: 'Seated press' },
  { name: 'Dumbbell Romanian Deadlift', equipment: 'dumbbells', muscles: ['hamstrings', 'glutes'], instructions: 'Hinge at hips, lower dumbbells close to thighs, stand.', mistakes: 'Bending knees too much.', easier: 'Hip hinge drill' }
];

const appState = { db: null, dbFailed: false, cache: {}, selectedLogId: null };

const $ = (sel) => document.querySelector(sel);
const formatDate = (d = new Date()) => new Date(d).toISOString().slice(0, 10);
const humanDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString();

function showToast(message, isError = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.style.background = isError ? '#b83737' : 'var(--text)';
  setTimeout(() => toast.classList.add('hidden'), 2600);
}

function openDB(name, version, upgradeFn) {
  return new Promise((resolve, reject) => {
    let req;
    try {
      req = indexedDB.open(name, version);
    } catch (err) {
      reject(err);
      return;
    }
    req.onupgradeneeded = (event) => upgradeFn(req.result, event.oldVersion, event.newVersion || version, req.transaction);
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
    req.onsuccess = () => resolve(req.result);
    req.onblocked = () => reject(new Error('IndexedDB open blocked by another tab'));
  });
}

const idb = {
  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, this.migrate.bind(this));
    this.db.onversionchange = () => this.db.close();
  },
  migrate(db, oldVersion, newVersion, tx) {
    if (oldVersion < 1) {
      db.createObjectStore('meta', { keyPath: 'key' });
      db.createObjectStore('userProfile', { keyPath: 'id' });
      db.createObjectStore('plan', { keyPath: 'id' });
      const wl = db.createObjectStore('workoutLogs', { keyPath: 'id', autoIncrement: true });
      wl.createIndex('date', 'date');
      db.createObjectStore('nutritionLogs', { keyPath: 'date' });
      db.createObjectStore('bodyLogs', { keyPath: 'date' });
      const snaps = db.createObjectStore('snapshots', { keyPath: 'id', autoIncrement: true });
      snaps.createIndex('createdAt', 'createdAt');
    }
    if (oldVersion < 2) {
      if (tx && db.objectStoreNames.contains('meta')) {
        tx.objectStore('meta').put({ key: 'schemaVersion', value: newVersion });
      }
    }
  },
  tx(store, mode = 'readonly') {
    return this.db.transaction(store, mode).objectStore(store);
  },
  request(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async get(store, key) { return this.request(this.tx(store).get(key)); },
  async set(store, value) { return this.request(this.tx(store, 'readwrite').put(value)); },
  async put(store, value) { return this.set(store, value); },
  async delete(store, key) { return this.request(this.tx(store, 'readwrite').delete(key)); },
  async list(store) { return this.request(this.tx(store).getAll()); }
};

async function safeSave(store, value) {
  try {
    await idb.put(store, value);
    await touchLastSaved();
    setSaveStatus(true);
    return true;
  } catch (err) {
    handleSaveError(err);
    return false;
  }
}

function handleSaveError(err) {
  console.error(err);
  const msg = err?.name === 'QuotaExceededError'
    ? 'Storage full. Consider exporting backups and clearing old data.'
    : 'Save failed locally. Data may not be persisted.';
  setSaveStatus(false);
  showToast(msg, true);
}

function setSaveStatus(ok) {
  const pill = $('#saveStatus');
  pill.textContent = ok ? 'Saved locally' : 'Save issue';
  pill.style.background = ok ? 'rgba(47,114,255,0.13)' : 'rgba(213,63,63,0.17)';
  pill.style.color = ok ? 'var(--accent)' : 'var(--danger)';
}

async function touchLastSaved() {
  const ts = new Date().toISOString();
  await idb.set('meta', { key: 'lastSavedAt', value: ts });
  $('#lastSaved').textContent = `Last saved: ${new Date(ts).toLocaleString()}`;
}

async function bootstrapDefaults() {
  const createdAt = await idb.get('meta', 'createdAt');
  if (!createdAt) {
    const now = new Date().toISOString();
    await idb.set('meta', { key: 'createdAt', value: now });
    await idb.set('meta', { key: 'schemaVersion', value: DB_VERSION });
    await idb.set('userProfile', { id: 'profile', goal: 'tone', daysPerWeek: 3, equipment: 'bodyweight', sessionLength: 20 });
    await generatePlanFromProfile();
  }
  const ls = await idb.get('meta', 'lastSavedAt');
  if (ls?.value) $('#lastSaved').textContent = `Last saved: ${new Date(ls.value).toLocaleString()}`;
}

function attachTabs() {
  $('#tabNav').addEventListener('click', (e) => {
    if (!e.target.matches('.tab')) return;
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');
    const tab = e.target.dataset.tab;
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    $('#' + tab).classList.add('active');
  });
}

function pickExercises(equipment, count = 4) {
  return EXERCISE_CATALOG.filter((e) => e.equipment === equipment).slice(0, count).map((e) => ({ ...e, sets: 3, reps: 10 }));
}

async function generatePlanFromProfile() {
  const profile = await idb.get('userProfile', 'profile');
  const days = Number(profile.daysPerWeek);
  const weeklyTemplate = Array.from({ length: days }).map((_, i) => ({
    dayIndex: i,
    focus: i % 2 === 0 ? 'Full Body A' : 'Full Body B',
    exercises: pickExercises(profile.equipment, 4)
  }));

  const start = new Date();
  const generatedSchedule = weeklyTemplate.map((session, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i * Math.floor(7 / days || 1));
    return { ...session, date: formatDate(d), completed: false };
  });

  await safeSave('plan', { id: 'currentPlan', weeklyTemplate, generatedSchedule, updatedAt: new Date().toISOString() });
  await saveSnapshot('auto-plan');
}

async function loadToday() {
  const plan = await idb.get('plan', 'currentPlan');
  if (!plan) return;
  const today = formatDate();
  adaptSchedule(plan, today);
  await safeSave('plan', plan);
  const todaySession = plan.generatedSchedule.find((s) => s.date === today && !s.completed) || plan.generatedSchedule.find((s) => !s.completed);
  const container = $('#todayChecklist');
  const summary = $('#todaySummary');
  container.innerHTML = '';
  if (!todaySession) {
    summary.textContent = 'All workouts completed. Great consistency.';
    return;
  }
  summary.textContent = `${todaySession.focus} • ${humanDate(todaySession.date)}`;
  todaySession.exercises.forEach((ex, idx) => {
    const item = document.createElement('div');
    item.className = 'workout-item';
    item.innerHTML = `<div class="exercise-row"><label><input type="checkbox" data-idx="${idx}" /> ${ex.name} (${ex.sets}x${ex.reps})</label>
      <details><summary>How-to</summary><p>${ex.instructions}</p><p><strong>Mistakes:</strong> ${ex.mistakes}</p><p><strong>Easier:</strong> ${ex.easier}</p></details></div>`;
    container.appendChild(item);
  });
  $('#completeWorkoutBtn').onclick = async () => {
    const checks = [...container.querySelectorAll('input[type="checkbox"]')];
    if (checks.some((c) => !c.checked)) {
      showToast('Finish all checklist items before completing.', true);
      return;
    }
    todaySession.completed = true;
    await safeSave('plan', plan);
    await safeSave('workoutLogs', {
      date: today,
      focus: todaySession.focus,
      duration: (await idb.get('userProfile', 'profile')).sessionLength,
      notes: '',
      difficulty: '',
      soreness: false,
      exercises: todaySession.exercises
    });
    await saveSnapshot('auto-workout');
    showToast('Workout logged successfully.');
    await renderAll();
  };
}

function adaptSchedule(plan, today) {
  const incomplete = plan.generatedSchedule.filter((s) => !s.completed).sort((a, b) => a.date.localeCompare(b.date));
  incomplete.forEach((s, i) => {
    const d = new Date(today + 'T00:00:00');
    d.setDate(d.getDate() + i);
    s.date = formatDate(d);
  });
}

async function loadPlanUI() {
  const profile = await idb.get('userProfile', 'profile');
  const form = $('#onboardingForm');
  form.goal.value = profile.goal;
  form.daysPerWeek.value = profile.daysPerWeek;
  form.equipment.value = profile.equipment;
  form.sessionLength.value = profile.sessionLength;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const updated = {
      id: 'profile',
      goal: data.get('goal'),
      daysPerWeek: Number(data.get('daysPerWeek')),
      equipment: data.get('equipment'),
      sessionLength: Number(data.get('sessionLength'))
    };
    await safeSave('userProfile', updated);
    await generatePlanFromProfile();
    showToast('Plan regenerated.');
    await renderAll();
  };

  const plan = await idb.get('plan', 'currentPlan');
  const el = $('#planSchedule');
  el.innerHTML = '';
  plan.generatedSchedule.forEach((s) => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.textContent = `${humanDate(s.date)} — ${s.focus} ${s.completed ? '✅' : ''}`;
    el.appendChild(div);
  });
}

async function loadLogUI() {
  const list = (await idb.list('workoutLogs')).sort((a, b) => b.date.localeCompare(a.date));
  const wrap = $('#workoutLogList');
  wrap.innerHTML = '';
  list.forEach((entry) => {
    const btn = document.createElement('button');
    btn.className = 'list-item';
    btn.textContent = `${humanDate(entry.date)} • ${entry.focus} • ${entry.duration} min`;
    btn.onclick = () => fillLogDetail(entry);
    wrap.appendChild(btn);
  });
  $('#logDetailForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = Number(fd.get('id'));
    const current = await idb.get('workoutLogs', id);
    if (!current) return;
    current.notes = fd.get('notes');
    current.difficulty = fd.get('difficulty');
    current.soreness = fd.get('soreness') === 'on';
    await safeSave('workoutLogs', current);
    showToast('Log updated.');
    await renderAll();
  };
}

function fillLogDetail(entry) {
  const f = $('#logDetailForm');
  f.id.value = entry.id;
  f.date.value = entry.date;
  f.focus.value = entry.focus;
  f.duration.value = entry.duration;
  f.notes.value = entry.notes || '';
  f.difficulty.value = entry.difficulty || '';
  f.soreness.checked = Boolean(entry.soreness);
}

async function loadNutritionUI() {
  const form = $('#nutritionForm');
  form.date.value = formatDate();
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    await safeSave('nutritionLogs', { date: fd.get('date'), in: Number(fd.get('in')), out: Number(fd.get('out')) });
    await saveSnapshot('auto-nutrition');
    showToast('Nutrition saved.');
    await renderAll();
  };
  const entries = (await idb.list('nutritionLogs')).sort((a, b) => a.date.localeCompare(b.date));
  const recent = entries.slice(-14);
  const deficits = recent.map((e) => e.out - e.in);
  const avg = deficits.length ? (deficits.reduce((a, b) => a + b, 0) / deficits.length).toFixed(0) : 0;
  const today = entries.find((e) => e.date === formatDate());
  $('#nutritionSummary').textContent = `Today deficit: ${today ? (today.out - today.in) : 0} kcal. Weekly avg deficit: ${avg} kcal/day.`;
  drawLineChart($('#nutritionChart'), recent.map((e) => ({ x: e.date.slice(5), y: e.out - e.in })), 'Deficit');
}

async function loadProgressUI() {
  const form = $('#bodyForm');
  form.date.value = formatDate();
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    await safeSave('bodyLogs', {
      date: fd.get('date'),
      weight: Number(fd.get('weight')),
      waist: fd.get('waist') ? Number(fd.get('waist')) : null,
      chest: fd.get('chest') ? Number(fd.get('chest')) : null,
      bodyFat: fd.get('bodyFat') ? Number(fd.get('bodyFat')) : null
    });
    await saveSnapshot('auto-body');
    showToast('Body log saved.');
    await renderAll();
  };
  const entries = (await idb.list('bodyLogs')).sort((a, b) => a.date.localeCompare(b.date));
  drawLineChart($('#weightChart'), entries.map((e) => ({ x: e.date.slice(5), y: e.weight })), 'Weight');
  const nLogs = (await idb.list('nutritionLogs')).slice(-14);
  const avgDef = nLogs.length ? nLogs.reduce((sum, r) => sum + (r.out - r.in), 0) / nLogs.length : 0;
  const latestWeight = entries.length ? entries[entries.length - 1].weight : null;
  const monthlyKg = (avgDef * 30 / 7700).toFixed(2);
  $('#milestones').textContent = latestWeight
    ? `Projection (rough estimate): if consistency remains similar and deficit averages ${Math.round(avgDef)} kcal/day, expected weight change may be around ${monthlyKg} kg/month. Treat this as a planning estimate, not a guarantee.`
    : 'Add body logs to see rough milestone projections.';
}

function drawLineChart(canvas, points, label) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(120,140,180,0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (points.length < 1) return;
  const values = points.map((p) => p.y);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 25;
  ctx.strokeStyle = '#2f72ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = pad + (i / Math.max(points.length - 1, 1)) * (canvas.width - pad * 2);
    const y = canvas.height - pad - ((p.y - min) / (Math.max(max - min, 1))) * (canvas.height - pad * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.fillStyle = '#2f72ff';
  ctx.fillText(label, 8, 16);
}

async function exportDatabase() {
  const payload = {};
  for (const store of STORE_NAMES) payload[store] = await idb.list(store);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `healthylife-backup-${formatDate()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importDatabase(json, mode) {
  if (!json || typeof json !== 'object') throw new Error('Invalid JSON format');
  for (const s of STORE_NAMES) if (!Array.isArray(json[s])) json[s] = [];
  if (mode === 'replace') {
    await resetDatabase(false);
    await idb.init();
  }
  for (const store of STORE_NAMES) {
    for (const row of json[store]) {
      try { await idb.put(store, row); } catch (err) { console.warn('skip row', store, err); }
    }
  }
  await touchLastSaved();
}

async function saveSnapshot(reason = 'auto') {
  const snapshot = {};
  for (const s of STORE_NAMES) snapshot[s] = await idb.list(s);
  await idb.put('snapshots', { createdAt: new Date().toISOString(), reason, snapshot });
  const all = (await idb.list('snapshots')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (let i = 10; i < all.length; i++) await idb.delete('snapshots', all[i].id);
}

async function loadSnapshotsUI() {
  const list = (await idb.list('snapshots')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const wrap = $('#snapshotList');
  wrap.innerHTML = '';
  list.forEach((s) => {
    const row = document.createElement('div');
    row.className = 'snapshot-item';
    row.innerHTML = `<div>${new Date(s.createdAt).toLocaleString()} • ${s.reason}</div>`;
    const btn = document.createElement('button');
    btn.className = 'btn secondary';
    btn.textContent = 'Restore';
    btn.onclick = async () => {
      if (!confirm('Restore snapshot? Current data will be replaced.')) return;
      await resetDatabase(false);
      await idb.init();
      await importDatabase(s.snapshot, 'merge');
      showToast('Snapshot restored.');
      await renderAll();
    };
    row.appendChild(btn);
    wrap.appendChild(row);
  });
}

async function resetDatabase(fullReload = true) {
  if (idb.db) idb.db.close();
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = resolve;
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('Delete blocked'));
  });
  if (fullReload) location.reload();
}

function initBackupUI() {
  $('#exportBtn').onclick = async () => {
    try { await exportDatabase(); showToast('Export complete.'); }
    catch (err) { handleSaveError(err); }
  };
  $('#importBtn').onclick = async () => {
    const file = $('#importFile').files[0];
    if (!file) return showToast('Choose a JSON file first.', true);
    try {
      const parsed = JSON.parse(await file.text());
      const mode = document.querySelector('input[name="importMode"]:checked').value;
      await importDatabase(parsed, mode);
      await saveSnapshot('post-import');
      showToast('Import successful.');
      await renderAll();
    } catch (err) {
      showToast('Import failed. Check file format.', true);
    }
  };
}

function initTheme() {
  const stored = localStorage.getItem('hl-theme') || 'light';
  document.documentElement.classList.toggle('dark', stored === 'dark');
  $('#themeToggle').checked = stored === 'dark';
  $('#themeToggle').onchange = (e) => {
    const dark = e.target.checked;
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('hl-theme', dark ? 'dark' : 'light');
  };
}


async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./service-worker.js');
  } catch (err) {
    console.error('Service worker registration failed', err);
    showToast('Offline install features unavailable on this browser.', true);
  }
}

function showDbFailureBanner() {
  $('#dbErrorBanner').classList.remove('hidden');
  $('#exportAvailableBtn').onclick = () => {
    const blob = new Blob([JSON.stringify(appState.cache, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `healthylife-partial-${Date.now()}.json`;
    a.click();
  };
  $('#resetDbBtn').onclick = async () => {
    try { await resetDatabase(); } catch (_) { showToast('Reset failed.', true); }
  };
}

async function renderAll() {
  await loadToday();
  await loadPlanUI();
  await loadLogUI();
  await loadNutritionUI();
  await loadProgressUI();
  await loadSnapshotsUI();
}

async function init() {
  attachTabs();
  initTheme();
  initBackupUI();
  await registerServiceWorker();
  try {
    await idb.init();
    appState.db = idb.db;
    await bootstrapDefaults();
    await renderAll();
  } catch (err) {
    appState.dbFailed = true;
    console.error('DB init failed', err);
    showDbFailureBanner();
    setSaveStatus(false);
    showToast('IndexedDB unavailable. Some features disabled.', true);
  }
}

document.addEventListener('DOMContentLoaded', init);

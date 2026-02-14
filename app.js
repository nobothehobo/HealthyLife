const DB_NAME = 'HealthyLifeDB';
const DB_VERSION = 4;
const STORE_NAMES = ['meta', 'userProfile', 'plan', 'workoutLogs', 'nutritionLogs', 'bodyLogs', 'snapshots'];
const EQUIP_OPTIONS = ['bodyweight', 'dumbbells', 'gym'];

const TARGET_CONFIG = {
  'Full Body': { muscles: ['chest', 'back', 'legs', 'glutes', 'core'], category: ['strength'], finisher: true },
  Chest: { muscles: ['chest', 'triceps'], category: ['strength'] },
  Back: { muscles: ['back', 'biceps'], category: ['strength'] },
  Shoulders: { muscles: ['shoulders', 'triceps'], category: ['strength'] },
  Arms: { muscles: ['biceps', 'triceps'], category: ['strength'] },
  Abs: { muscles: ['core'], category: ['core'], finisher: true },
  Legs: { muscles: ['quads', 'hamstrings', 'glutes'], category: ['strength'] },
  Glutes: { muscles: ['glutes', 'hamstrings'], category: ['strength'] },
  'Cardio-lite': { muscles: ['full'], category: ['cardio', 'conditioning'], finisher: true }
};

const EXERCISE_CATALOG = [
  { id: 'warmup-march', name: 'March in Place', equipment: ['bodyweight'], category: 'warmup', difficulty: 'easy', muscles: ['full'], instructions: 'March with tall posture for 45–60 sec.', mistakes: 'Hunched shoulders.', easier: 'Slow march holding a wall.' },
  { id: 'warmup-arm', name: 'Arm Circles', equipment: ['bodyweight'], category: 'warmup', difficulty: 'easy', muscles: ['shoulders'], instructions: 'Small to large circles for 30 sec each way.', mistakes: 'Rushing through range.', easier: 'Half circles.' },
  { id: 'pushup', name: 'Push-up', equipment: ['bodyweight'], category: 'strength', difficulty: 'moderate', muscles: ['chest', 'triceps', 'core'], instructions: 'Hands under shoulders, lower chest, press up.', mistakes: 'Sagging hips.', easier: 'Incline push-up' },
  { id: 'db-floor-press', name: 'Dumbbell Floor Press', equipment: ['dumbbells'], category: 'strength', difficulty: 'moderate', muscles: ['chest', 'triceps'], instructions: 'Press dumbbells from floor with elbows 45°.', mistakes: 'Flaring elbows.', easier: 'One dumbbell press' },
  { id: 'db-row', name: 'Dumbbell Row', equipment: ['dumbbells'], category: 'strength', difficulty: 'moderate', muscles: ['back', 'biceps'], instructions: 'Hinge and row to hips.', mistakes: 'Rounding back.', easier: 'Supported single-arm row' },
  { id: 'superman', name: 'Superman Hold', equipment: ['bodyweight'], category: 'core', difficulty: 'easy', muscles: ['back', 'core'], instructions: 'Lift chest and legs gently for holds.', mistakes: 'Overarching neck.', easier: 'Lift only arms' },
  { id: 'db-ohp', name: 'Dumbbell Overhead Press', equipment: ['dumbbells'], category: 'strength', difficulty: 'moderate', muscles: ['shoulders', 'triceps'], instructions: 'Press overhead with braced core.', mistakes: 'Arching low back.', easier: 'Seated press' },
  { id: 'lateral-raise', name: 'Dumbbell Lateral Raise', equipment: ['dumbbells'], category: 'strength', difficulty: 'moderate', muscles: ['shoulders'], instructions: 'Raise to shoulder height softly.', mistakes: 'Swinging torso.', easier: 'Alternating raises' },
  { id: 'curl', name: 'Dumbbell Curl', equipment: ['dumbbells'], category: 'strength', difficulty: 'easy', muscles: ['biceps'], instructions: 'Curl with elbows close to body.', mistakes: 'Using momentum.', easier: 'Hammer curl' },
  { id: 'chair-dip', name: 'Chair Dip', equipment: ['bodyweight'], category: 'strength', difficulty: 'moderate', muscles: ['triceps'], instructions: 'Lower and press from sturdy chair.', mistakes: 'Shoulders shrugging.', easier: 'Bent-knee dip' },
  { id: 'air-squat', name: 'Air Squat', equipment: ['bodyweight'], category: 'strength', difficulty: 'easy', muscles: ['quads', 'glutes'], instructions: 'Sit down and back, then stand tall.', mistakes: 'Knees collapsing inward.', easier: 'Box squat' },
  { id: 'goblet-squat', name: 'Dumbbell Goblet Squat', equipment: ['dumbbells'], category: 'strength', difficulty: 'moderate', muscles: ['quads', 'glutes', 'core'], instructions: 'Hold at chest and squat with control.', mistakes: 'Heels lifting.', easier: 'Bodyweight squat' },
  { id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', equipment: ['dumbbells'], category: 'strength', difficulty: 'moderate', muscles: ['hamstrings', 'glutes'], instructions: 'Hinge hips and keep back neutral.', mistakes: 'Rounding low back.', easier: 'Hip hinge drill' },
  { id: 'glute-bridge', name: 'Glute Bridge', equipment: ['bodyweight'], category: 'strength', difficulty: 'easy', muscles: ['glutes', 'hamstrings'], instructions: 'Drive hips up through heels.', mistakes: 'Overextending back.', easier: 'Bridge hold' },
  { id: 'plank', name: 'Plank', equipment: ['bodyweight'], category: 'core', difficulty: 'easy', muscles: ['core'], instructions: 'Hold straight-line plank.', mistakes: 'Hips too low.', easier: 'Knee plank' },
  { id: 'dead-bug', name: 'Dead Bug', equipment: ['bodyweight'], category: 'core', difficulty: 'easy', muscles: ['core'], instructions: 'Opposite arm/leg extension slow and controlled.', mistakes: 'Lower back lifting.', easier: 'Arms only' },
  { id: 'mountain-climber', name: 'Mountain Climber', equipment: ['bodyweight'], category: 'conditioning', difficulty: 'moderate', muscles: ['core', 'full'], instructions: 'Drive knees alternately under torso.', mistakes: 'Bouncing hips.', easier: 'Slow climber' },
  { id: 'jumping-jack', name: 'Jumping Jack', equipment: ['bodyweight'], category: 'cardio', difficulty: 'easy', muscles: ['full'], instructions: 'Steady, rhythmic jacks.', mistakes: 'Landing heavily.', easier: 'Step jacks' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', equipment: ['gym'], category: 'strength', difficulty: 'moderate', muscles: ['back', 'biceps'], instructions: 'Pull bar to upper chest with control.', mistakes: 'Leaning too far back.', easier: 'Supported row' },
  { id: 'leg-press', name: 'Leg Press', equipment: ['gym'], category: 'strength', difficulty: 'moderate', muscles: ['quads', 'glutes'], instructions: 'Press smoothly without locking knees.', mistakes: 'Partial range only.', easier: 'Air squat' },
  { id: 'cable-pressdown', name: 'Cable Triceps Pressdown', equipment: ['gym'], category: 'strength', difficulty: 'easy', muscles: ['triceps'], instructions: 'Keep elbows tucked and extend.', mistakes: 'Leaning on stack.', easier: 'Chair dip' }
];

const appState = { db: null, dbFailed: false, cache: {}, generatedWorkout: null, activeWorkout: null, activeWorkoutSource: 'plan' };
const $ = (sel) => document.querySelector(sel);
const formatDate = (d = new Date()) => new Date(d).toISOString().slice(0, 10);
const humanDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString();

function showToast(message, isError = false) { const t = $('#toast'); t.textContent = message; t.classList.remove('hidden'); t.style.background = isError ? '#b83737' : 'var(--text)'; setTimeout(() => t.classList.add('hidden'), 2600); }
function openDB(name, version, upgradeFn) { return new Promise((resolve, reject) => { let req; try { req = indexedDB.open(name, version); } catch (e) { reject(e); return; } req.onupgradeneeded = (ev) => upgradeFn(req.result, ev.oldVersion, ev.newVersion || version, req.transaction); req.onerror = () => reject(req.error || new Error('IndexedDB open failed')); req.onsuccess = () => resolve(req.result); req.onblocked = () => reject(new Error('IndexedDB open blocked')); }); }

const idb = {
  async init() { this.db = await openDB(DB_NAME, DB_VERSION, this.migrate.bind(this)); this.db.onversionchange = () => this.db.close(); },
  migrate(db, oldVersion, newVersion, tx) {
    if (oldVersion < 1) {
      db.createObjectStore('meta', { keyPath: 'key' }); db.createObjectStore('userProfile', { keyPath: 'id' }); db.createObjectStore('plan', { keyPath: 'id' });
      const wl = db.createObjectStore('workoutLogs', { keyPath: 'id', autoIncrement: true }); wl.createIndex('date', 'date');
      db.createObjectStore('nutritionLogs', { keyPath: 'date' }); db.createObjectStore('bodyLogs', { keyPath: 'date' });
      const snaps = db.createObjectStore('snapshots', { keyPath: 'id', autoIncrement: true }); snaps.createIndex('createdAt', 'createdAt');
    }
    if (oldVersion < 4 && tx && db.objectStoreNames.contains('meta')) tx.objectStore('meta').put({ key: 'schemaVersion', value: newVersion });
  },
  tx(store, mode = 'readonly') { return this.db.transaction(store, mode).objectStore(store); },
  request(req) { return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); },
  async get(store, key) { return this.request(this.tx(store).get(key)); },
  async set(store, value) { return this.request(this.tx(store, 'readwrite').put(value)); },
  async put(store, value) { return this.set(store, value); },
  async delete(store, key) { return this.request(this.tx(store, 'readwrite').delete(key)); },
  async list(store) { return this.request(this.tx(store).getAll()); }
};

async function safeSave(store, value) { try { await idb.put(store, value); await touchLastSaved(); setSaveStatus(true); return true; } catch (e) { handleSaveError(e); return false; } }
function handleSaveError(err) { console.error(err); showToast(err?.name === 'QuotaExceededError' ? 'Storage full.' : 'Save failed locally.', true); setSaveStatus(false); }
function setSaveStatus(ok) { const p = $('#saveStatus'); p.textContent = ok ? 'Saved locally' : 'Save issue'; p.style.background = ok ? 'rgba(47,114,255,0.13)' : 'rgba(213,63,63,0.17)'; p.style.color = ok ? 'var(--accent)' : 'var(--danger)'; }
async function touchLastSaved() { const ts = new Date().toISOString(); await idb.set('meta', { key: 'lastSavedAt', value: ts }); $('#lastSaved').textContent = `Last saved: ${new Date(ts).toLocaleString()}`; }
async function getMeta(key, fallback = null) { return (await idb.get('meta', key))?.value ?? fallback; }
async function setMeta(key, value) { return safeSave('meta', { key, value }); }

function normalizeEquipmentSelection(value) {
  const available = Array.isArray(value?.available) ? value.available.filter((e) => EQUIP_OPTIONS.includes(e)) : [];
  return { available: available.length ? available : ['bodyweight', 'dumbbells'], preference: value?.preference || 'Mix' };
}
async function getEquipmentSelection() { return normalizeEquipmentSelection(await getMeta('equipmentSelection', null)); }
function equipmentSummaryText(selection) { const m = { bodyweight: 'Bodyweight', dumbbells: 'Dumbbells', gym: 'Gym' }; return (selection.available || []).map((x) => m[x]).join(' + ') || 'None'; }
function supportsEquipment(exercise, available) { return exercise.equipment.some((e) => available.includes(e)); }
function getCheckedEquipment(container, name) { return [...container.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value); }
function applyEquipmentToForm(form, checkboxName, prefName, selection) { form.querySelectorAll(`input[name="${checkboxName}"]`).forEach((el) => { el.checked = selection.available.includes(el.value); }); if (form[prefName]) form[prefName].value = selection.preference; }

async function bootstrapDefaults() {
  if (!(await idb.get('meta', 'createdAt'))) {
    const now = new Date().toISOString();
    await idb.set('meta', { key: 'createdAt', value: now }); await idb.set('meta', { key: 'schemaVersion', value: DB_VERSION });
    await idb.set('userProfile', { id: 'profile', goal: 'tone', daysPerWeek: 3, equipment: 'bodyweight', equipmentAvailable: ['bodyweight', 'dumbbells'], equipmentPreference: 'Mix', sessionLength: 20 });
    await generatePlanFromProfile();
  }
  if (!(await getMeta('exercisePrefs'))) await idb.set('meta', { key: 'exercisePrefs', value: Object.fromEntries(EXERCISE_CATALOG.map((e) => [e.id, { enabled: true, favorite: false }])) });
  if (!(await getMeta('equipmentSelection'))) {
    const profile = await idb.get('userProfile', 'profile');
    await idb.set('meta', { key: 'equipmentSelection', value: normalizeEquipmentSelection({ available: profile?.equipmentAvailable || [profile?.equipment || 'bodyweight'], preference: profile?.equipmentPreference || 'Mix' }) });
  }
  const ls = await idb.get('meta', 'lastSavedAt'); if (ls?.value) $('#lastSaved').textContent = `Last saved: ${new Date(ls.value).toLocaleString()}`;
}

function attachTabs() { $('#tabNav').addEventListener('click', (e) => { if (!e.target.matches('.tab')) return; document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active')); e.target.classList.add('active'); const tab = e.target.dataset.tab; document.querySelectorAll('.page').forEach((p) => p.classList.remove('active')); $('#' + tab).classList.add('active'); }); }
function pickExercisesForPlan(available = ['bodyweight', 'dumbbells'], count = 4) { return EXERCISE_CATALOG.filter((e) => e.category !== 'warmup' && supportsEquipment(e, available)).slice(0, count).map((e) => ({ ...e, sets: 3, reps: '10' })); }

async function generatePlanFromProfile() {
  const profile = await idb.get('userProfile', 'profile'); const days = Number(profile.daysPerWeek);
  const weeklyTemplate = Array.from({ length: days }).map((_, i) => ({ dayIndex: i, focus: i % 2 ? 'Full Body B' : 'Full Body A', exercises: pickExercisesForPlan(profile.equipmentAvailable || [profile.equipment || 'bodyweight'], 4) }));
  const start = new Date(); const generatedSchedule = weeklyTemplate.map((s, i) => { const d = new Date(start); d.setDate(d.getDate() + i * Math.max(Math.floor(7 / days), 1)); return { ...s, date: formatDate(d), completed: false }; });
  await safeSave('plan', { id: 'currentPlan', weeklyTemplate, generatedSchedule, updatedAt: new Date().toISOString() });
}

function adaptSchedule(plan, today) { const inc = plan.generatedSchedule.filter((s) => !s.completed).sort((a, b) => a.date.localeCompare(b.date)); inc.forEach((s, i) => { const d = new Date(today + 'T00:00:00'); d.setDate(d.getDate() + i); s.date = formatDate(d); }); }
function intensityConfig(i) { if (i === 'Light') return { sets: 2, reps: '8-10', rest: '60–75 sec' }; if (i === 'Hard') return { sets: 3, reps: '10-14', rest: '30–45 sec' }; return { sets: 3, reps: '8-12', rest: '45–60 sec' }; }
function mapPool(target, exercises) {
  const cfg = TARGET_CONFIG[target];
  return exercises.filter((e) => {
    if (target === 'Cardio-lite') return ['cardio', 'conditioning', 'core'].includes(e.category);
    if (target === 'Abs') return e.category === 'core' || e.muscles.includes('core');
    return cfg.muscles.some((m) => e.muscles.includes(m)) || cfg.category.includes(e.category);
  });
}
function chooseItems(pool, count, favorites = [], preference = 'Mix') {
  const favSet = new Set(favorites); const prefMap = { 'Prefer Gym': 'gym', 'Prefer Dumbbells': 'dumbbells', 'Prefer Bodyweight': 'bodyweight' }; const pref = prefMap[preference] || null;
  const sorted = [...pool].sort((a, b) => {
    const favCmp = Number(favSet.has(b.id)) - Number(favSet.has(a.id)); if (favCmp) return favCmp;
    if (pref) { const pCmp = Number(b.equipment.includes(pref)) - Number(a.equipment.includes(pref)); if (pCmp) return pCmp; }
    return a.name.localeCompare(b.name);
  });
  return sorted.slice(0, count);
}

async function generateDailyWorkout(opts) {
  if (!opts.equipmentAvailable?.length) return { warning: 'Choose at least one equipment option to generate a workout.' };
  const prefs = await getMeta('exercisePrefs', {});
  const enabled = EXERCISE_CATALOG.filter((e) => prefs[e.id]?.enabled !== false);
  const favorites = EXERCISE_CATALOG.filter((e) => prefs[e.id]?.favorite).map((e) => e.id);
  const compatible = enabled.filter((e) => supportsEquipment(e, opts.equipmentAvailable));
  const pool = mapPool(opts.target, compatible);
  if (pool.length < 4) return { warning: `Only ${pool.length} enabled exercises match ${opts.target}. Enable more or adjust equipment.` };

  const conf = intensityConfig(opts.intensity); const duration = Number(opts.duration); const mainCount = duration <= 15 ? 4 : duration <= 25 ? 5 : 6;
  const warmups = chooseItems(compatible.filter((e) => e.category === 'warmup'), duration >= 20 ? 2 : 1, favorites, opts.equipmentPreference).map((e) => ({ ...e, sets: 1, reps: '45 sec' }));
  const mains = chooseItems(pool.filter((e) => e.category !== 'warmup'), mainCount, favorites, opts.equipmentPreference).map((e) => ({ ...e, sets: conf.sets, reps: ['core', 'cardio'].includes(e.category) ? '30-40 sec' : conf.reps }));
  const finisherSource = pool.filter((e) => ['core', 'cardio', 'conditioning'].includes(e.category));
  const finisher = (opts.intensity === 'Hard' || ['Abs', 'Cardio-lite'].includes(opts.target)) && finisherSource.length ? [{ ...chooseItems(finisherSource, 1, favorites, opts.equipmentPreference)[0], sets: 1, reps: '60 sec push', finisher: true }] : [];
  return { date: formatDate(), focus: `${opts.target} • ${opts.intensity}`, target: opts.target, intensity: opts.intensity, duration, rest: conf.rest, equipmentAvailable: opts.equipmentAvailable, equipmentPreference: opts.equipmentPreference, exercises: [...warmups, ...mains, ...finisher], source: 'builder' };
}

function renderWorkoutChecklist(workout) {
  appState.activeWorkout = workout; const container = $('#todayChecklist'); container.innerHTML = ''; if (!workout) return;
  $('#todaySummary').textContent = `${workout.focus} • ${humanDate(workout.date)} • ${workout.duration || ''} min ${workout.rest ? `• Rest ${workout.rest}` : ''}`;
  $('#equipmentSummary').textContent = `Equipment: ${equipmentSummaryText({ available: workout.equipmentAvailable || [] })}`;
  workout.exercises.forEach((ex, idx) => {
    const item = document.createElement('div'); item.className = 'workout-item';
    item.innerHTML = `<div class="exercise-row"><label><input type="checkbox" data-idx="${idx}" /> ${ex.name} (${ex.sets} x ${ex.reps})</label><details><summary>Info</summary><p>${ex.instructions}</p><p><strong>Common mistakes:</strong> ${ex.mistakes}</p><p><strong>Easier alternative:</strong> ${ex.easier}</p></details></div>`;
    container.appendChild(item);
  });
}


async function updateTodayMetrics(defaultEquipment = []) {
  const today = formatDate();
  const nutrition = await idb.get('nutritionLogs', today);
  const calIn = nutrition?.in ?? 0;
  const calOut = nutrition?.out ?? 0;
  const deficit = calOut - calIn;
  $('#todayCalIn').textContent = String(calIn);
  $('#todayCalOut').textContent = String(calOut);
  $('#todayDeficit').textContent = String(deficit);

  const bodies = (await idb.list('bodyLogs')).sort((a, b) => a.date.localeCompare(b.date));
  $('#todayWeight').textContent = bodies.length ? `${bodies[bodies.length - 1].weight}` : '—';

  const logs = await idb.list('workoutLogs');
  const completed = logs.some((l) => l.date === today);
  $('#todayWorkoutStatus').textContent = `Workout status: ${completed ? 'completed' : 'pending'}`;
  if ($('#equipmentSummary').textContent.includes('—')) {
    $('#equipmentSummary').textContent = `Equipment: ${equipmentSummaryText({ available: defaultEquipment })}`;
  }
}

async function loadToday() {
  const form = $('#todayBuilderForm');
  const sel = await getEquipmentSelection();
  const saved = await getMeta('builderSelection', { target: 'Full Body', intensity: 'Moderate', duration: 20, equipmentAvailable: sel.available, equipmentPreference: sel.preference });
  form.target.value = saved.target; form.intensity.value = saved.intensity; form.duration.value = String(saved.duration);
  applyEquipmentToForm(form, 'equipmentAvailable', 'equipmentPreference', normalizeEquipmentSelection({ available: saved.equipmentAvailable || sel.available, preference: saved.equipmentPreference || sel.preference }));
  $('#equipmentSummary').textContent = `Equipment: ${equipmentSummaryText(sel)}`;

  const today = formatDate(); const custom = await getMeta('todayCustomWorkout', null);
  if (custom && custom.date === today) { appState.activeWorkoutSource = 'custom'; renderWorkoutChecklist(custom); $('#builderHint').textContent = 'Saved custom workout loaded for today.'; }
  else {
    const plan = await idb.get('plan', 'currentPlan');
    if (plan) {
      adaptSchedule(plan, today); await safeSave('plan', plan);
      const session = plan.generatedSchedule.find((s) => s.date === today && !s.completed) || plan.generatedSchedule.find((s) => !s.completed);
      if (session) { appState.activeWorkoutSource = 'plan'; renderWorkoutChecklist({ date: session.date, focus: session.focus, duration: (await idb.get('userProfile', 'profile')).sessionLength, exercises: session.exercises, source: 'plan', equipmentAvailable: sel.available }); }
    }
  }

  $('#startWorkoutBtn').onclick = () => { document.getElementById('todayChecklist')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  $('#generateWorkoutBtn').onclick = async () => {
    const opts = { target: form.target.value, intensity: form.intensity.value, duration: Number(form.duration.value), equipmentAvailable: getCheckedEquipment(form, 'equipmentAvailable'), equipmentPreference: form.equipmentPreference.value };
    await setMeta('builderSelection', opts);
    await setMeta('equipmentSelection', normalizeEquipmentSelection({ available: opts.equipmentAvailable, preference: opts.equipmentPreference }));
    const generated = await generateDailyWorkout(opts);
    if (generated.warning) { $('#builderHint').textContent = generated.warning; return showToast(generated.warning, true); }
    appState.generatedWorkout = generated; appState.activeWorkoutSource = 'builder-preview'; $('#builderHint').textContent = `Generated ${generated.exercises.length} exercises. Rest guidance: ${generated.rest}.`; renderWorkoutChecklist(generated);
  };
  $('#saveTodayWorkoutBtn').onclick = async () => { if (!appState.generatedWorkout) return showToast('Generate a workout first.', true); await setMeta('todayCustomWorkout', appState.generatedWorkout); appState.activeWorkoutSource = 'custom'; showToast('Saved as today’s workout.'); await renderAll(); };
  $('#completeWorkoutBtn').onclick = async () => {
    const workout = appState.activeWorkout; if (!workout) return showToast('No workout loaded for today.', true);
    const checks = [...$('#todayChecklist').querySelectorAll('input[type="checkbox"]')]; if (checks.some((c) => !c.checked)) return showToast('Finish all checklist items before completing.', true);
    if (appState.activeWorkoutSource === 'plan') { const plan = await idb.get('plan', 'currentPlan'); const item = plan?.generatedSchedule?.find((s) => s.date === workout.date && !s.completed); if (item) { item.completed = true; await safeSave('plan', plan); } }
    await safeSave('workoutLogs', { date: workout.date || formatDate(), focus: workout.focus, duration: Number(workout.duration) || 20, notes: '', difficulty: '', soreness: false, exercises: workout.exercises, source: appState.activeWorkoutSource, equipmentAvailable: workout.equipmentAvailable || [] });
    if (appState.activeWorkoutSource === 'custom') await setMeta('todayCustomWorkout', null);
    await saveSnapshot('auto-workout'); showToast('Workout logged successfully.'); await renderAll();
  };

  await updateTodayMetrics(sel.available);
}

async function loadPlanUI() {
  const profile = await idb.get('userProfile', 'profile'); const form = $('#onboardingForm'); const equip = await getEquipmentSelection();
  form.goal.value = profile.goal; form.daysPerWeek.value = profile.daysPerWeek; form.sessionLength.value = profile.sessionLength;
  applyEquipmentToForm(form, 'equipmentAvailablePlan', 'equipmentPreferencePlan', normalizeEquipmentSelection({ available: profile.equipmentAvailable || equip.available, preference: profile.equipmentPreference || equip.preference }));
  form.onsubmit = async (e) => {
    e.preventDefault(); const fd = new FormData(form); const available = getCheckedEquipment(form, 'equipmentAvailablePlan'); if (!available.length) return showToast('Pick at least one equipment option.', true); const preference = form.equipmentPreferencePlan.value;
    await setMeta('equipmentSelection', normalizeEquipmentSelection({ available, preference }));
    await safeSave('userProfile', { id: 'profile', goal: fd.get('goal'), daysPerWeek: Number(fd.get('daysPerWeek')), equipment: available[0], equipmentAvailable: available, equipmentPreference: preference, sessionLength: Number(fd.get('sessionLength')) });
    await generatePlanFromProfile(); showToast('Plan regenerated.'); await renderAll();
  };
  const plan = await idb.get('plan', 'currentPlan'); const el = $('#planSchedule'); el.innerHTML = ''; plan?.generatedSchedule?.forEach((s) => { const d = document.createElement('div'); d.className = 'list-item'; d.textContent = `${humanDate(s.date)} — ${s.focus} ${s.completed ? '✅' : ''}`; el.appendChild(d); });
}

async function loadLogUI() { const list = (await idb.list('workoutLogs')).sort((a, b) => b.date.localeCompare(a.date)); const wrap = $('#workoutLogList'); wrap.innerHTML = ''; list.forEach((entry) => { const btn = document.createElement('button'); btn.className = 'list-item'; btn.textContent = `${humanDate(entry.date)} • ${entry.focus} • ${entry.duration} min`; btn.onclick = () => fillLogDetail(entry); wrap.appendChild(btn); }); $('#logDetailForm').onsubmit = async (e) => { e.preventDefault(); const fd = new FormData(e.target); const id = Number(fd.get('id')); const current = await idb.get('workoutLogs', id); if (!current) return; current.notes = fd.get('notes'); current.difficulty = fd.get('difficulty'); current.soreness = fd.get('soreness') === 'on'; await safeSave('workoutLogs', current); showToast('Log updated.'); await renderAll(); }; }
function fillLogDetail(entry) { const f = $('#logDetailForm'); f.id.value = entry.id; f.date.value = entry.date; f.focus.value = entry.focus; f.duration.value = entry.duration; f.notes.value = entry.notes || ''; f.difficulty.value = entry.difficulty || ''; f.soreness.checked = Boolean(entry.soreness); }

async function loadNutritionUI() { const form = $('#nutritionForm'); form.date.value = formatDate(); form.onsubmit = async (e) => { e.preventDefault(); const fd = new FormData(form); await safeSave('nutritionLogs', { date: fd.get('date'), in: Number(fd.get('in')), out: Number(fd.get('out')) }); await saveSnapshot('auto-nutrition'); showToast('Nutrition saved.'); await renderAll(); }; const entries = (await idb.list('nutritionLogs')).sort((a, b) => a.date.localeCompare(b.date)); const recent = entries.slice(-14); const deficits = recent.map((e) => e.out - e.in); const avg = deficits.length ? Math.round(deficits.reduce((a, b) => a + b, 0) / deficits.length) : 0; const today = entries.find((e) => e.date === formatDate()); $('#nutritionSummary').textContent = `Today deficit: ${today ? (today.out - today.in) : 0} kcal. Weekly avg deficit: ${avg} kcal/day.`; drawLineChart($('#nutritionChart'), recent.map((e) => ({ x: e.date.slice(5), y: e.out - e.in })), 'Deficit'); }
async function loadProgressUI() { const form = $('#bodyForm'); form.date.value = formatDate(); form.onsubmit = async (e) => { e.preventDefault(); const fd = new FormData(form); await safeSave('bodyLogs', { date: fd.get('date'), weight: Number(fd.get('weight')), waist: fd.get('waist') ? Number(fd.get('waist')) : null, chest: fd.get('chest') ? Number(fd.get('chest')) : null, bodyFat: fd.get('bodyFat') ? Number(fd.get('bodyFat')) : null }); await saveSnapshot('auto-body'); showToast('Body log saved.'); await renderAll(); }; const entries = (await idb.list('bodyLogs')).sort((a, b) => a.date.localeCompare(b.date)); drawLineChart($('#weightChart'), entries.map((e) => ({ x: e.date.slice(5), y: e.weight })), 'Weight'); const n = (await idb.list('nutritionLogs')).slice(-14); const avgDef = n.length ? n.reduce((sum, r) => sum + (r.out - r.in), 0) / n.length : 0; $('#milestones').textContent = entries.length ? `Projection (rough estimate): around ${(avgDef * 30 / 7700).toFixed(2)} kg/month if consistency remains similar.` : 'Add body logs to see projections.'; }

async function loadEquipmentPrefsUI() {
  const form = $('#settingsEquipmentForm'); if (!form) return; const sel = await getEquipmentSelection(); applyEquipmentToForm(form, 'equipmentAvailableSettings', 'equipmentPreferenceSettings', sel);
  form.onsubmit = async (e) => { e.preventDefault(); const available = getCheckedEquipment(form, 'equipmentAvailableSettings'); if (!available.length) return showToast('Choose at least one equipment option.', true); const preference = form.equipmentPreferenceSettings.value; await setMeta('equipmentSelection', normalizeEquipmentSelection({ available, preference })); showToast('Equipment preferences saved.'); await renderAll(); };
}

async function loadExercisePrefsUI() {
  const prefs = await getMeta('exercisePrefs', {}); const wrap = $('#exercisePrefsList'); wrap.innerHTML = '';
  EXERCISE_CATALOG.filter((e) => e.category !== 'warmup').forEach((ex) => {
    if (!prefs[ex.id]) prefs[ex.id] = { enabled: true, favorite: false };
    const row = document.createElement('div'); row.className = 'list-item pref-item';
    row.innerHTML = `<div><strong>${ex.name}</strong><div class="muted">${ex.muscles.join(', ')} • ${ex.category} • ${ex.equipment.join('+')}</div></div><div class="pref-controls"><label class="inline"><input data-id="${ex.id}" data-type="enabled" type="checkbox" ${prefs[ex.id].enabled ? 'checked' : ''}/> Enabled</label><button class="btn secondary star-btn ${prefs[ex.id].favorite ? 'active' : ''}" data-id="${ex.id}" data-type="favorite" type="button">★</button></div>`;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll('input[data-type="enabled"]').forEach((el) => el.onchange = async (e) => { const id = e.target.dataset.id; prefs[id].enabled = e.target.checked; await setMeta('exercisePrefs', prefs); showToast('Exercise preference saved.'); });
  wrap.querySelectorAll('button[data-type="favorite"]').forEach((el) => el.onclick = async () => { const id = el.dataset.id; prefs[id].favorite = !prefs[id].favorite; await setMeta('exercisePrefs', prefs); await loadExercisePrefsUI(); });
}

function drawLineChart(canvas, points, label) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = 'rgba(120,140,180,0.25)'; ctx.fillRect(0, 0, canvas.width, canvas.height); if (!points.length) return; const values = points.map((p) => p.y); const min = Math.min(...values); const max = Math.max(...values); const pad = 25; ctx.strokeStyle = '#2f72ff'; ctx.lineWidth = 2; ctx.beginPath(); points.forEach((p, i) => { const x = pad + (i / Math.max(points.length - 1, 1)) * (canvas.width - pad * 2); const y = canvas.height - pad - ((p.y - min) / Math.max(max - min, 1)) * (canvas.height - pad * 2); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke(); ctx.fillStyle = '#2f72ff'; ctx.fillText(label, 8, 16); }

async function exportDatabase() { const payload = {}; for (const s of STORE_NAMES) payload[s] = await idb.list(s); const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `healthylife-backup-${formatDate()}.json`; a.click(); URL.revokeObjectURL(a.href); }
async function importDatabase(json, mode) { if (!json || typeof json !== 'object') throw new Error('Invalid JSON format'); for (const s of STORE_NAMES) if (!Array.isArray(json[s])) json[s] = []; if (mode === 'replace') { await resetDatabase(false); await idb.init(); } for (const s of STORE_NAMES) for (const row of json[s]) { try { await idb.put(s, row); } catch (_) {} } await touchLastSaved(); }
async function saveSnapshot(reason = 'auto') { const snapshot = {}; for (const s of STORE_NAMES) snapshot[s] = await idb.list(s); await idb.put('snapshots', { createdAt: new Date().toISOString(), reason, snapshot }); const all = (await idb.list('snapshots')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); for (let i = 10; i < all.length; i++) await idb.delete('snapshots', all[i].id); }
async function loadSnapshotsUI() { const list = (await idb.list('snapshots')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); const wrap = $('#snapshotList'); wrap.innerHTML = ''; list.forEach((s) => { const row = document.createElement('div'); row.className = 'snapshot-item'; row.innerHTML = `<div>${new Date(s.createdAt).toLocaleString()} • ${s.reason}</div>`; const btn = document.createElement('button'); btn.className = 'btn secondary'; btn.textContent = 'Restore'; btn.onclick = async () => { if (!confirm('Restore snapshot? Current data will be replaced.')) return; await resetDatabase(false); await idb.init(); await importDatabase(s.snapshot, 'merge'); showToast('Snapshot restored.'); await renderAll(); }; row.appendChild(btn); wrap.appendChild(row); }); }

async function resetDatabase(fullReload = true) { if (idb.db) idb.db.close(); await new Promise((resolve, reject) => { const req = indexedDB.deleteDatabase(DB_NAME); req.onsuccess = resolve; req.onerror = () => reject(req.error); req.onblocked = () => reject(new Error('Delete blocked')); }); if (fullReload) location.reload(); }
function initBackupUI() { $('#exportBtn').onclick = async () => { try { await exportDatabase(); showToast('Export complete.'); } catch (err) { handleSaveError(err); } }; $('#importBtn').onclick = async () => { const file = $('#importFile').files[0]; if (!file) return showToast('Choose a JSON file first.', true); try { const parsed = JSON.parse(await file.text()); const mode = document.querySelector('input[name="importMode"]:checked').value; await importDatabase(parsed, mode); await saveSnapshot('post-import'); showToast('Import successful.'); await renderAll(); } catch (_) { showToast('Import failed. Check file format.', true); } }; }
function initTheme() { const stored = localStorage.getItem('hl-theme') || 'light'; document.documentElement.classList.toggle('dark', stored === 'dark'); $('#themeToggle').checked = stored === 'dark'; $('#themeToggle').onchange = (e) => { const dark = e.target.checked; document.documentElement.classList.toggle('dark', dark); localStorage.setItem('hl-theme', dark ? 'dark' : 'light'); }; }
async function registerServiceWorker() { if (!('serviceWorker' in navigator)) return; try { await navigator.serviceWorker.register('./service-worker.js'); } catch (err) { console.error(err); showToast('Offline install features unavailable.', true); } }
function showDbFailureBanner() { $('#dbErrorBanner').classList.remove('hidden'); $('#exportAvailableBtn').onclick = () => { const blob = new Blob([JSON.stringify(appState.cache, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `healthylife-partial-${Date.now()}.json`; a.click(); }; $('#resetDbBtn').onclick = async () => { try { await resetDatabase(); } catch (_) { showToast('Reset failed.', true); } }; }

async function renderAll() { await loadToday(); await loadPlanUI(); await loadLogUI(); await loadNutritionUI(); await loadProgressUI(); await loadSnapshotsUI(); await loadEquipmentPrefsUI(); await loadExercisePrefsUI(); }
async function init() { attachTabs(); initTheme(); initBackupUI(); await registerServiceWorker(); try { await idb.init(); appState.db = idb.db; await bootstrapDefaults(); await renderAll(); } catch (err) { appState.dbFailed = true; console.error('DB init failed', err); showDbFailureBanner(); setSaveStatus(false); showToast('IndexedDB unavailable. Some features disabled.', true); } }

document.addEventListener('DOMContentLoaded', init);

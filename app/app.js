// Leonida Trophy Atlas: an offline checklist, roadmap and guide for the 55 GTA VI trophies.
// Data lives in data/trophies.json; progress lives in localStorage; nothing here talks to the network.
const STORAGE_KEY = 'leonida-trophy-atlas-v1';
const DATA_URL = 'data/trophies.json';

const state = {
  data: null,
  earned: new Set(),
  revealed: new Set(),
  kind: 'all',
  grade: 'all',
  search: '',
  spoiler: false,
  earnedOnly: false,
  view: 'checklist',
  openGuide: null,
};

const listEl = document.getElementById('trophy-list');
const missableEl = document.getElementById('missable-list');
const roadmapEl = document.getElementById('roadmap');

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (raw && Array.isArray(raw.earned)) state.earned = new Set(raw.earned);
    if (raw && Array.isArray(raw.revealed)) state.revealed = new Set(raw.revealed);
  } catch {
    state.earned = new Set();
    state.revealed = new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    earned: [...state.earned],
    revealed: [...state.revealed],
    savedAt: new Date().toISOString(),
  }));
}

async function loadTrophyData() {
  const response = await fetch(DATA_URL);
  state.data = await response.json();
}

function gradeLetter(grade) {
  return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] ?? '?';
}

function trophyHiddenBySpoiler(trophy) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.name) && !state.revealed.has(trophy.name);
}

function trophyMatchesFilters(trophy) {
  if (state.kind === 'online') return false;
  if (state.kind === 'missable' && !trophy.missable) return false;
  if (state.kind !== 'all' && state.kind !== 'missable' && trophy.kind !== state.kind) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.earnedOnly && !state.earned.has(trophy.name)) return false;
  if (state.search) {
    const hay = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!hay.includes(state.search.toLowerCase())) return false;
  }
  return true;
}

function renderHeader() {
  const total = state.data.trophies.length;
  const earned = state.data.trophies.filter((t) => state.earned.has(t.name));
  document.getElementById('earned-count').textContent = String(earned.length);
  document.getElementById('progress-fill').style.width = `${(earned.length / total) * 100}%`;
  document.getElementById('progress-pct').textContent = `${Math.round((earned.length / total) * 100)}% complete`;
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const n = state.data.trophies.filter((t) => t.grade === g).length;
    const e = earned.filter((t) => t.grade === g).length;
    return `${gradeLetter(g)} ${e}/${n}`;
  });
  document.getElementById('grade-counts').textContent = byGrade.join(' · ');
}

function buildGuideBox(trophy) {
  const box = document.createElement('div');
  box.className = 'guide-box';
  const title = document.createElement('h3');
  title.textContent = 'Guide';
  box.append(title);
  const text = document.createElement('p');
  text.textContent = trophy.guide;
  box.append(text);
  const when = document.createElement('p');
  when.className = 'guide-when';
  const whenLabel = document.createElement('strong');
  whenLabel.textContent = 'When: ';
  when.append(whenLabel, document.createTextNode(trophy.when));
  box.append(when);
  if (trophy.missable && trophy.pointOfNoReturn) {
    const warn = document.createElement('p');
    warn.className = 'point-of-no-return';
    warn.textContent = `Point of no return: ${trophy.pointOfNoReturn}`;
    box.append(warn);
  }
  const sources = document.createElement('ul');
  sources.className = 'guide-sources';
  for (const source of trophy.sources) {
    const item = document.createElement('li');
    item.textContent = source;
    sources.append(item);
  }
  box.append(sources);
  return box;
}

function buildTrophyRow(trophy) {
  const row = document.createElement('li');
  row.className = 'trophy-row';
  row.dataset.id = String(trophy.id);
  if (state.earned.has(trophy.name)) row.classList.add('earned');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.name);
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) state.earned.add(trophy.name);
    else state.earned.delete(trophy.name);
    saveProgress();
    row.classList.toggle('earned', box.checked);
    renderHeader();
    renderRoadmapCounts();
  });
  row.append(box);

  const medal = document.createElement('span');
  medal.className = `medal ${trophy.grade}`;
  medal.textContent = gradeLetter(trophy.grade);
  row.append(medal);

  const main = document.createElement('div');
  const hidden = trophyHiddenBySpoiler(trophy);
  const nameEl = document.createElement('div');
  nameEl.className = 'trophy-name';
  nameEl.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  main.append(nameEl);
  const descEl = document.createElement('div');
  descEl.className = 'trophy-desc';
  descEl.textContent = hidden
    ? 'Hidden until earned — tick it off or reveal it below.'
    : trophy.description;
  main.append(descEl);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const gradeChip = document.createElement('span');
  gradeChip.className = `chip grade-${trophy.grade}`;
  gradeChip.textContent = trophy.grade;
  meta.append(gradeChip);
  const kindChip = document.createElement('span');
  kindChip.className = 'chip';
  kindChip.textContent = trophy.kind;
  meta.append(kindChip);
  if (trophy.count != null) {
    const countChip = document.createElement('span');
    countChip.className = 'chip count';
    countChip.textContent = `PSN target: ${trophy.count}`;
    meta.append(countChip);
  }
  if (trophy.missable) {
    const missChip = document.createElement('span');
    missChip.className = 'chip missable';
    missChip.textContent = 'Possibly missable';
    meta.append(missChip);
  }
  main.append(meta);
  if (hidden) {
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'reveal-btn';
    reveal.textContent = 'Reveal this trophy';
    reveal.addEventListener('click', (event) => {
      event.stopPropagation();
      state.revealed.add(trophy.name);
      saveProgress();
      renderChecklist();
    });
    main.append(reveal);
  }
  row.append(main);

  const gradeWord = document.createElement('span');
  gradeWord.className = 'grade-word';
  gradeWord.textContent = trophy.grade;
  row.append(gradeWord);

  if (state.openGuide === trophy.id) row.append(buildGuideBox(trophy));
  row.addEventListener('click', () => {
    state.openGuide = state.openGuide === trophy.id ? null : trophy.id;
    if (state.view === 'missable') renderMissable();
    else renderChecklist();
  });
  return row;
}

function renderChecklist() {
  listEl.replaceChildren();
  const empty = document.getElementById('checklist-empty');
  if (state.kind === 'online') {
    empty.hidden = false;
    empty.textContent = state.data.onlineNote;
    return;
  }
  const shown = state.data.trophies.filter(trophyMatchesFilters);
  empty.hidden = shown.length > 0;
  for (const trophy of shown) listEl.append(buildTrophyRow(trophy));
}

function renderMissable() {
  missableEl.replaceChildren();
  const flagged = state.data.trophies.filter((t) => t.missable);
  for (const trophy of flagged) missableEl.append(buildTrophyRow(trophy));
}

function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const stage of state.data.stages) {
    const item = document.createElement('li');
    const heading = document.createElement('h2');
    heading.textContent = stage.title;
    item.append(heading);
    const blurb = document.createElement('p');
    blurb.className = 'stage-blurb';
    blurb.textContent = stage.blurb;
    item.append(blurb);
    const members = state.data.trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => state.earned.has(t.name)).length;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} of ${members.length} earned in this stage`;
    item.append(count);
    const names = document.createElement('ul');
    names.className = 'stage-trophies';
    for (const trophy of members) {
      const entry = document.createElement('li');
      if (state.earned.has(trophy.name)) entry.classList.add('done');
      entry.textContent = `${state.earned.has(trophy.name) ? '✓ ' : '○ '}${trophy.name} — ${trophy.grade}`;
      names.append(entry);
    }
    item.append(names);
    roadmapEl.append(item);
  }
}

function renderRoadmapCounts() {
  if (state.view !== 'roadmap') return;
  renderRoadmap();
}

function renderSources() {
  const list = document.getElementById('source-list');
  for (const source of state.data.sources) {
    const item = document.createElement('li');
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.label;
      link.rel = 'noopener';
      item.append(link);
    } else {
      item.textContent = source.label;
    }
    list.append(item);
  }
}

function setView(view) {
  state.view = view;
  for (const button of document.querySelectorAll('#views button')) {
    button.classList.toggle('active', button.dataset.view === view);
  }
  document.getElementById('view-checklist').hidden = view !== 'checklist';
  document.getElementById('view-roadmap').hidden = view !== 'roadmap';
  document.getElementById('view-missable').hidden = view !== 'missable';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missable') renderMissable();
}

function exportProgress() {
  const payload = {
    app: 'Leonida Trophy Atlas',
    exportedAt: new Date().toISOString(),
    earned: [...state.earned],
    revealed: [...state.revealed],
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-atlas-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const names = new Set(state.data.trophies.map((t) => t.name));
  const earned = (parsed.earned ?? []).filter((name) => names.has(name));
  const revealed = (parsed.revealed ?? []).filter((name) => names.has(name));
  state.earned = new Set(earned);
  state.revealed = new Set(revealed);
  saveProgress();
  renderHeader();
  renderChecklist();
  renderMissable();
}

function wireControls() {
  for (const button of document.querySelectorAll('#views button')) {
    button.addEventListener('click', () => setView(button.dataset.view));
  }
  for (const button of document.querySelectorAll('#kind-filters button')) {
    button.addEventListener('click', () => {
      state.kind = button.dataset.kind;
      for (const other of document.querySelectorAll('#kind-filters button')) {
        other.classList.toggle('active', other === button);
      }
      renderChecklist();
    });
  }
  document.getElementById('grade').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderChecklist();
  });
  document.getElementById('search').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderChecklist();
  });
  document.getElementById('spoiler').addEventListener('change', (event) => {
    state.spoiler = event.target.checked;
    renderChecklist();
  });
  document.getElementById('earned-only').addEventListener('change', (event) => {
    state.earnedOnly = event.target.checked;
    renderChecklist();
  });
  document.getElementById('export').addEventListener('click', exportProgress);
  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await importProgress(file);
    } catch {
      alert('That file could not be read as progress — it must be a JSON export from this guide.');
    }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies and revealed spoilers?')) return;
    state.earned = new Set();
    state.revealed = new Set();
    saveProgress();
    renderHeader();
    renderChecklist();
    renderMissable();
  });
}

async function boot() {
  loadProgress();
  await loadTrophyData();
  wireControls();
  renderHeader();
  renderChecklist();
  renderRoadmap();
  renderMissable();
  renderSources();
}

await boot();

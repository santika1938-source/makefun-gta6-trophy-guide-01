// Boot and wiring: loads the data, restores progress, connects the toolbar,
// tabs and hash routes, and re-renders on every change. Routes look like
// #/checklist, #/roadmap and #/missables, with &t=<id> selecting a trophy —
// handy for bookmarks and for checking the app in screenshots.

import { loadGuideData } from './data.js';
import { loadProgress, saveProgress, exportProgress, importProgress, toggleEarned, setCount } from './store.js';
import { renderProgressHeader, renderChecklist, renderDetail, renderRoadmap, renderMissables } from './views.js';

const data = await loadGuideData();
let progress = loadProgress();

const state = {
  data,
  progress,
  view: 'checklist',
  filters: { kind: 'all', grade: 'all', search: '' },
  selectedKey: null,
  onToggle(key) {
    toggleEarned(progress, key);
    render();
  },
  onSelect(key) {
    state.selectedKey = key;
    render();
  },
  onReveal(key) {
    progress.settings.revealed.add(key);
    saveProgress(progress);
    render();
  },
  onCount(key, value) {
    setCount(progress, key, value);
    render();
  },
};

function currentPanes() {
  return {
    checklist: document.getElementById('view-checklist'),
    roadmap: document.getElementById('view-roadmap'),
    missables: document.getElementById('view-missables'),
  };
}

function render() {
  state.progress = progress;
  renderProgressHeader(data, progress);
  const panes = currentPanes();
  for (const [name, pane] of Object.entries(panes)) pane.hidden = name !== state.view;
  for (const tab of document.querySelectorAll('#view-tabs .tab')) {
    tab.classList.toggle('active', tab.dataset.view === state.view);
  }
  if (state.view === 'checklist') {
    renderChecklist(state);
    renderDetail(document.getElementById('detail-pane'), state, data.byKey.get(state.selectedKey) ?? null);
  } else if (state.view === 'roadmap') {
    renderRoadmap(state, document.getElementById('roadmap-body'), document.getElementById('roadmap-detail'));
  } else {
    renderMissables(state, document.getElementById('missables-body'), document.getElementById('missables-detail'));
  }
  document.getElementById('spoiler-toggle').checked = progress.settings.hideSpoilers;
  document.getElementById('hide-earned-toggle').checked = progress.settings.hideEarned;
}

function applyHash() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [viewPart, queryPart] = hash.split('?');
  if (['checklist', 'roadmap', 'missables'].includes(viewPart)) state.view = viewPart;
  const params = new URLSearchParams(queryPart ?? '');
  const t = params.get('t');
  if (t && data.byKey.has(t)) state.selectedKey = t;
  const kind = params.get('kind');
  if (kind) {
    state.filters.kind = kind;
    for (const chip of document.querySelectorAll('#kind-filters .chip')) {
      chip.classList.toggle('active', chip.dataset.kind === kind);
    }
  }
}

for (const tab of document.querySelectorAll('#view-tabs .tab')) {
  tab.addEventListener('click', () => {
    state.view = tab.dataset.view;
    history.replaceState(null, '', `#/${state.view}`);
    render();
  });
}

for (const chip of document.querySelectorAll('#kind-filters .chip')) {
  chip.addEventListener('click', () => {
    state.filters.kind = chip.dataset.kind;
    for (const other of document.querySelectorAll('#kind-filters .chip')) {
      other.classList.toggle('active', other === chip);
    }
    render();
  });
}

document.getElementById('grade-filter').addEventListener('change', (event) => {
  state.filters.grade = event.target.value;
  render();
});

document.getElementById('search').addEventListener('input', (event) => {
  state.filters.search = event.target.value;
  renderChecklist(state);
});

document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
  progress.settings.hideSpoilers = event.target.checked;
  saveProgress(progress);
  render();
});

document.getElementById('hide-earned-toggle').addEventListener('change', (event) => {
  progress.settings.hideEarned = event.target.checked;
  saveProgress(progress);
  render();
});

document.getElementById('export-btn').addEventListener('click', () => exportProgress(progress));

document.getElementById('import-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    progress = await importProgress(file);
    saveProgress(progress);
    render();
  } catch {
    document.getElementById('list-summary').textContent = 'That file could not be read as saved progress.';
  }
  event.target.value = '';
});

const sourcesLine = document.getElementById('sources-line');
sourcesLine.textContent = `Trophy data sources: ${data.sources.join(' · ')}`;

window.addEventListener('hashchange', () => { applyHash(); render(); });
applyHash();
if (!state.selectedKey) state.selectedKey = data.trophies[16].key; // The Shootist, a silver with a counter
render();
window.__guideReady = true;

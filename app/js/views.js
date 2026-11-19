// Rendering: the header progress, the checklist rows, the guide pane, the
// roadmap and the missables page. Everything is built with DOM calls and
// textContent, so trophy names and guides are never parsed as HTML.

import { KIND_LABELS, GRADE_ORDER, isSpoilerHidden, stageOf, trophyMatchesKind, trophyMatchesSearch } from './data.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function medalDisc(grade) {
  const disc = el('span', `medal medal-${grade}`);
  disc.title = grade;
  disc.setAttribute('aria-label', `${grade} trophy`);
  return disc;
}

function gradeWord(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

export function renderProgressHeader(data, progress) {
  const total = data.trophies.length;
  const done = progress.earned.size;
  document.getElementById('progress-count').textContent =
    `${done} of ${total} earned · ${Math.round((done / total) * 100)}%`;
  document.getElementById('progress-fill').style.width = `${(done / total) * 100}%`;
  const grades = document.getElementById('progress-grades');
  grades.replaceChildren();
  for (const grade of GRADE_ORDER) {
    const all = data.trophies.filter((t) => t.grade === grade);
    const got = all.filter((t) => progress.earned.has(t.key)).length;
    const chip = el('span', 'grade-chip');
    chip.append(medalDisc(grade), el('span', null, `${got}/${all.length}`));
    grades.append(chip);
  }
}

function visibleTrophies(state) {
  const { data, progress, filters } = state;
  return data.trophies.filter((t) => {
    if (!trophyMatchesKind(t, filters.kind)) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (progress.settings.hideEarned && progress.earned.has(t.key)) return false;
    if (!trophyMatchesSearch(t, filters.search)) return false;
    return true;
  });
}

function trophyRow(state, trophy) {
  const { progress } = state;
  const hidden = isSpoilerHidden(trophy, progress.settings, progress.earned);
  const row = el('div', 'trophy-row');
  if (progress.earned.has(trophy.key)) row.classList.add('is-earned');
  if (state.selectedKey === trophy.key) row.classList.add('is-selected');
  row.dataset.key = trophy.key;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'earned-box';
  box.checked = progress.earned.has(trophy.key);
  box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
  box.addEventListener('change', () => state.onToggle(trophy.key));
  row.append(box);

  row.append(medalDisc(trophy.grade));

  const main = el('div', 'row-main');
  if (hidden) {
    main.append(
      el('div', 'row-name spoiler-name', 'Hidden story trophy'),
      el('div', 'row-desc', 'Name and description hidden by the spoiler setting until it is earned or revealed.'),
    );
  } else {
    main.append(
      el('div', 'row-name', trophy.name),
      el('div', 'row-desc', trophy.description),
    );
  }
  row.append(main);

  const tags = el('div', 'row-tags');
  tags.append(el('span', 'tag tag-grade', gradeWord(trophy.grade)));
  tags.append(el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.missable) tags.append(el('span', 'tag tag-missable', 'Missable'));
  if (trophy.target != null) {
    const count = progress.counts.get(trophy.key) ?? 0;
    tags.append(el('span', 'tag tag-count', `${count}/${trophy.target}`));
  }
  row.append(tags);

  row.addEventListener('click', (event) => {
    if (event.target === box) return;
    state.onSelect(trophy.key);
  });
  return row;
}

export function renderChecklist(state) {
  const list = document.getElementById('trophy-list');
  const summary = document.getElementById('list-summary');
  const visible = visibleTrophies(state);
  list.replaceChildren();
  if (state.filters.kind === 'online' && visible.length === 0) {
    list.append(el('p', 'empty-note',
      'The official PlayStation 5 list has no online trophies — every one of the 55 descriptions is single-player or partner co-op. This filter stays here so the check takes one glance.'));
  } else if (visible.length === 0) {
    list.append(el('p', 'empty-note', 'No trophies match the current filters.'));
  }
  for (const trophy of visible) list.append(trophyRow(state, trophy));
  summary.textContent = `Showing ${visible.length} of ${state.data.trophies.length} trophies`;
}

export function renderDetail(pane, state, trophy) {
  const { data, progress } = state;
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('p', 'detail-hint', 'Pick a trophy to read its guide, its sources and its progress counter.'));
    return;
  }
  const hidden = isSpoilerHidden(trophy, progress.settings, progress.earned);

  const head = el('div', 'detail-head');
  head.append(medalDisc(trophy.grade));
  const titles = el('div');
  titles.append(el('h2', null, hidden ? 'Hidden story trophy' : trophy.name));
  titles.append(el('p', 'detail-grade', `${gradeWord(trophy.grade)} · ${KIND_LABELS[trophy.kind] ?? trophy.kind} · Roadmap stage ${trophy.stage}`));
  head.append(titles);
  pane.append(head);

  if (hidden) {
    pane.append(el('p', 'detail-desc', 'This story trophy’s name and description are hidden by the spoiler setting until it is earned.'));
    const reveal = el('button', 'reveal-btn', 'Reveal this trophy');
    reveal.type = 'button';
    reveal.addEventListener('click', () => state.onReveal(trophy.key));
    pane.append(reveal);
    return;
  }

  pane.append(el('p', 'detail-desc', `“${trophy.description}” — official description`));
  pane.append(el('p', 'detail-when', `When: ${trophy.when}`));

  if (trophy.missable && trophy.missableNote) {
    const warn = el('div', 'missable-box');
    warn.append(el('strong', null, 'Missable — '), el('span', null, trophy.missableNote));
    pane.append(warn);
  }

  const stage = stageOf(data, trophy);
  if (stage) pane.append(el('p', 'detail-stage', `Roadmap: stage ${stage.stage} — ${stage.title}`));

  if (trophy.target != null) {
    const counter = el('div', 'counter-box');
    const current = progress.counts.get(trophy.key) ?? 0;
    counter.append(el('label', null, `Your progress — ${trophy.targetLabel ?? 'count'} (target ${trophy.target}): `));
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(trophy.target);
    input.value = String(current);
    input.addEventListener('change', () => state.onCount(trophy.key, input.value));
    counter.append(input);
    pane.append(counter);
  }

  pane.append(el('h3', null, 'Guide'));
  pane.append(el('p', 'detail-guide', trophy.guide));

  const done = el('label', 'detail-earned');
  const doneBox = document.createElement('input');
  doneBox.type = 'checkbox';
  doneBox.checked = progress.earned.has(trophy.key);
  doneBox.addEventListener('change', () => state.onToggle(trophy.key));
  done.append(doneBox, el('span', null, ' I have earned this trophy'));
  pane.append(done);

  pane.append(el('h3', null, 'Sources'));
  const sources = el('ul', 'sources');
  for (const source of trophy.sources) {
    const item = el('li');
    const urlAt = source.indexOf('https://');
    if (urlAt > 0) {
      item.append(el('span', null, source.slice(0, urlAt).trim()));
      const link = el('a', null, source.slice(urlAt).trim());
      link.href = source.slice(urlAt).trim();
      link.target = '_blank';
      link.rel = 'noreferrer';
      item.append(el('br'), link);
    } else {
      item.textContent = source;
    }
    sources.append(item);
  }
  pane.append(sources);
}

export function renderRoadmap(state, pane, detailPane) {
  const { data, progress } = state;
  pane.replaceChildren();
  pane.append(el('h2', null, 'Roadmap to the platinum'));
  pane.append(el('p', 'roadmap-intro',
    'The order this guide recommends, built from the official descriptions: story first with the missables watched, then the people of Leonida, the activity circuit, the collectible sweep, the money game, and 100% last. Tick trophies here or in the checklist — progress is shared.'));
  for (const stage of data.roadmap) {
    const trophies = stage.trophies.map((name) => data.byName.get(name)).filter(Boolean);
    const done = trophies.filter((t) => progress.earned.has(t.key)).length;
    const card = el('article', 'stage-card');
    const head = el('div', 'stage-head');
    head.append(el('h3', null, `Stage ${stage.stage} — ${stage.title}`));
    head.append(el('span', 'stage-progress', `${done}/${trophies.length}`));
    card.append(head);
    card.append(el('p', 'stage-text', stage.text));
    const chips = el('div', 'stage-chips');
    for (const trophy of trophies) {
      const chip = el('button', 'trophy-chip');
      chip.type = 'button';
      if (progress.earned.has(trophy.key)) chip.classList.add('is-earned');
      chip.append(medalDisc(trophy.grade), el('span', null, trophy.name));
      if (trophy.missable) chip.append(el('span', 'chip-flag', 'missable'));
      chip.addEventListener('click', () => state.onSelect(trophy.key));
      chips.append(chip);
    }
    card.append(chips);
    pane.append(card);
  }
  renderDetail(detailPane, state, data.byKey.get(state.selectedKey) ?? null);
}

export function renderMissables(state, pane, detailPane) {
  const { data, progress } = state;
  pane.replaceChildren();
  pane.append(el('h2', null, 'Missable trophies'));
  pane.append(el('p', 'roadmap-intro',
    'Six trophies are flagged from their official descriptions: each is tied to a story moment or a one-off setting rather than free roam, so each has a point of no return. The flags are this guide’s reading of the descriptions — the game launched on 2026-11-19 and mission replay is to be confirmed — but the safe play is to earn each one when its moment comes.'));
  for (const trophy of data.trophies.filter((t) => t.missable)) {
    const card = el('article', 'missable-card');
    const head = el('div', 'stage-head');
    const title = el('h3');
    title.append(medalDisc(trophy.grade), el('span', null, ` ${trophy.name}`));
    head.append(title);
    head.append(el('span', 'stage-progress', progress.earned.has(trophy.key) ? 'earned' : 'not earned'));
    card.append(head);
    card.append(el('p', 'detail-desc', `“${trophy.description}” — official description`));
    card.append(el('p', null, trophy.missableNote ?? ''));
    const open = el('button', 'reveal-btn', 'Open the full guide');
    open.type = 'button';
    open.addEventListener('click', () => state.onSelect(trophy.key));
    card.append(open);
    pane.append(card);
  }
  renderDetail(detailPane, state, data.byKey.get(state.selectedKey) ?? null);
}

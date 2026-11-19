// Progress persistence: earned trophies, per-trophy counters for the targets
// PlayStation tracks, and the reader's settings. Everything lives in
// localStorage under one key; export downloads it as JSON and import reads
// such a file back. Nothing leaves the browser otherwise.

const STORAGE_KEY = 'leonida-legend-progress-v1';

export function emptyProgress() {
  return {
    earned: new Set(),
    counts: new Map(),
    settings: { hideSpoilers: true, hideEarned: false, revealed: new Set() },
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    const progress = emptyProgress();
    for (const key of parsed.earned ?? []) progress.earned.add(String(key));
    for (const [key, value] of Object.entries(parsed.counts ?? {})) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) progress.counts.set(String(key), n);
    }
    if (parsed.settings) {
      progress.settings.hideSpoilers = parsed.settings.hideSpoilers !== false;
      progress.settings.hideEarned = parsed.settings.hideEarned === true;
      for (const key of parsed.settings.revealed ?? []) progress.settings.revealed.add(String(key));
    }
    return progress;
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  const serialised = {
    earned: [...progress.earned],
    counts: Object.fromEntries(progress.counts),
    settings: {
      hideSpoilers: progress.settings.hideSpoilers,
      hideEarned: progress.settings.hideEarned,
      revealed: [...progress.settings.revealed],
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialised));
}

export function exportProgress(progress) {
  const payload = {
    app: 'leonida-legend',
    version: 1,
    earned: [...progress.earned],
    counts: Object.fromEntries(progress.counts),
    settings: {
      hideSpoilers: progress.settings.hideSpoilers,
      hideEarned: progress.settings.hideEarned,
      revealed: [...progress.settings.revealed],
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-legend-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const progress = emptyProgress();
  for (const key of parsed.earned ?? []) progress.earned.add(String(key));
  for (const [key, value] of Object.entries(parsed.counts ?? {})) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) progress.counts.set(String(key), n);
  }
  if (parsed.settings) {
    progress.settings.hideSpoilers = parsed.settings.hideSpoilers !== false;
    progress.settings.hideEarned = parsed.settings.hideEarned === true;
    for (const key of parsed.settings.revealed ?? []) progress.settings.revealed.add(String(key));
  }
  return progress;
}

export function toggleEarned(progress, key) {
  if (progress.earned.has(key)) progress.earned.delete(key);
  else progress.earned.add(key);
  saveProgress(progress);
}

export function setCount(progress, key, value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  progress.counts.set(key, n);
  saveProgress(progress);
  return n;
}

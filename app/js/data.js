// Loads the trophy data file and answers questions about it: kinds, grades,
// roadmap stages and which trophies a filter shows. No network beyond the one
// same-origin fetch of data/trophies.json, which ships inside the app.

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  world: 'World & crime',
  platinum: 'Platinum',
  online: 'Online',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export async function loadGuideData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json: ${response.status}`);
  const doc = await response.json();
  const trophies = doc.trophies.map((t) => ({ ...t, key: String(t.id) }));
  return {
    game: doc.game,
    platform: doc.platform,
    listNote: doc.list,
    sources: doc.sources ?? [],
    roadmap: doc.roadmap ?? [],
    trophies,
    byKey: new Map(trophies.map((t) => [t.key, t])),
    byName: new Map(trophies.map((t) => [t.name, t])),
  };
}

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kind === kind;
}

export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const hay = `${trophy.name}\n${trophy.description}\n${trophy.guide}`.toLowerCase();
  return hay.includes(query.toLowerCase());
}

export function isSpoilerHidden(trophy, settings, earned) {
  return (
    settings.hideSpoilers &&
    trophy.kind === 'story' &&
    !earned.has(trophy.key) &&
    !settings.revealed.has(trophy.key)
  );
}

export function stageOf(data, trophy) {
  return data.roadmap.find((s) => s.stage === trophy.stage) ?? null;
}

export function missables(data) {
  return data.trophies.filter((t) => t.missable);
}

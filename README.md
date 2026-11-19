# Leonida Legend — GTA VI trophy guide & tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/santika1938-source/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/santika1938-source/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** is a complete offline guide and progress tracker for all 55
PlayStation 5 trophies of Grand Theft Auto VI. It is a plain static web app under
`app/` — serve `app/` with any static file server (or run the kit's `serve.ts`),
open `app/index.html` in a desktop browser, and it works with the network off:
no build step, no accounts, nothing loaded from anywhere else.

## What it does

- **The full official list** — every one of the 55 trophies with its official
  name, description and grade as PlayStation publishes them (1 platinum, 2 gold,
  6 silver, 46 bronze), cross-checked between Exophase and PSNProfiles, plus the
  progress target PlayStation itself tracks for the 20 counted trophies
  (250 stunts, 42 Shooting Range challenges, 500 choices, $250,000 laundered…).
- **A guide to every trophy, in our own words** — what to do, when it becomes
  available, and the efficient order to do it in. Each guide names its sources
  beside it; anything not yet knowable for a game released on 2026-11-19 is
  marked “to be confirmed” instead of invented.
- **A roadmap to the platinum** — eight stages from the opening mission to
  100% completion, built from the official descriptions: story first, then the
  people of Leonida, the activity circuit, the collectible sweep and the money
  game.
- **Missables flagged** — six trophies are tied to story moments or one-off
  settings; each carries its point of no return and why it is flagged.
- **A real tracker** — tick trophies off and set your counters; progress is
  saved in the browser (localStorage) and can be exported to a JSON file and
  imported back. Filters for Story, Missable, Collectibles, Activities and
  Online (the official list has no online trophies, and the app says so),
  a grade filter, search, and a spoiler setting that hides story trophy names
  and descriptions until they are earned or revealed.

Everything is original: no Rockstar Games logo, artwork, fonts or trophy icons —
the grade medals are drawn with CSS.

## Layout of this repository

- `app/` — the static app (`index.html`, `style.css`, `js/` modules, `data/trophies.json`)
- `screenshots/` — the screenshots the entry is judged by
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output and
  writes `dossier.json` with the kit's `vendor/makefun-frontend.ts` (unchanged)
- `LICENSE` — MIT

---

<sub>Entered on [make.fun](https://make.fun/?ref=1c6jcmp6) · AI agents build software for cash rewards</sub>

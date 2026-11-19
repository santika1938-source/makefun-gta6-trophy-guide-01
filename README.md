# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/santika1938-source/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/santika1938-source/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Atlas** is an offline guide and tracker for all 55 PlayStation 5
trophies of Grand Theft Auto VI: every trophy with its official name, description
and grade as PlayStation publishes them, a guide in our own words that cites its
sources, an 8-stage roadmap to the platinum, missable flags with their points of
no return, and a checklist that saves in the browser. It is plain static files
under `app/` — open `app/index.html` in a desktop browser and it works fully
offline, with no build step and no network request.

## What it does

- **The full official list** — 55 trophies (1 platinum, 2 gold, 6 silver, 46
  bronze), verified against Exophase and PSNProfiles, with the PSN count target
  wherever PlayStation tracks one (42 Shooting Range challenges, 250 stunts,
  100 WAiNK locations, and the rest).
- **A guide for every trophy** — what to do, when it becomes available, and
  whether it can be missed, in our own words. The game is not out yet, so
  anything we could not check is marked **to be confirmed** instead of invented.
- **Roadmap to the platinum** — eight stages in order: the opening and the story,
  the named missions, the strangers, activities, partner crime, collecting and
  spending, then the long counters and 100% completion.
- **Missable trophies flagged** — six trophies tied to one-off moments, each with
  its point of no return, reasoned from the official descriptions.
- **A tracker that remembers** — tick trophies off, progress saves in
  localStorage, with export to JSON and import back. Filters by kind (Story,
  Missable, Collectibles, Activities, Online — the list has no online trophy,
  and the app says so), by grade, by search, and an earned-only view.
- **Spoiler setting** — hides story trophy names and descriptions until they are
  earned (or revealed one by one).

Everything is original: no Rockstar logo, artwork, characters or fonts, and no
game screenshots. Medal discs are drawn in CSS.

## Run it

Open `app/index.html` in a desktop browser, or serve `app/` with any static
server. `main.ts` (Node 22, standard library only) hands the entry in: it copies
`app/` and `screenshots/` to the output directory and writes `dossier.json` with
the kit's vendored library.

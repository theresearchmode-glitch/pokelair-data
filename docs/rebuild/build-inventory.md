# Build page: inventory before rebuilding (Nov 12, ~3:15 PM; look-only groundwork, nothing built)

Approved mock-up: docs/rebuild/mocks/build.tpl.html (Preview: build.html). Rule: every feature of today's Build stays.

## What today's Build does (checked: app/test/behaviour/B-build.mjs, 91 tests in all)
- Build page itself: AUTO-01..16 (head + How It Works fold; Build from My Box / Whole roster; pool rules; Megas on team;
  Build around a Pokémon chip; "Build around it" from an info sheet; busy state; result card with Strength Score, band, rank,
  six with items, Matchups, checks, why, sets and roles; proven teams first, Fresh take as option 2; Use This Team with Undo;
  Save (10 max); Try another; Copy for Showdown; no-result notes; Start from a recent winner (3 cards, Load needs a second
  tap, Practice against, Compare); page order kept after a build).
- Winning Cores (today's alias cores -> Build): CORES-01..13 (head, Pairs/Trios/Full teams, sort, filter by a Pokémon,
  rows with Details, Show more 15, Add to my team with Undo, Load team, Teams with it, Practice against, Copy, empty state,
  menu link scrolls to cores).
- Shared checks X-01..12 (back/scroll, Undo toasts, double tap, sliders, name boxes, phone keyboard lift, Title Case,
  anonymous counts, tiles open Pokémon, daily data, saved settings).
- Already rebuilt elsewhere: COV / SUGG / BUILD-* (My Team, done); SETS-* and ARCH-* belong to Meta (today's VIEW_PARENT).

## Logic: what the new build already shares, and what must move first (checked: app/parts-v2.json)
- Shared already: 22-auto-build.js (the engine: runAutoBuild, abLock, pools), 29-fix-planner.js, 58-strength.js, 13-rating.js,
  36-sug-data.js, 05-data-clean.js, 49-event-data.js sheetSlots, 19-showdown-paste.js sheetPaste.
- Not shared yet (move the data parts into shared files, with a same-output proof for today's site, before building):
  48-cores.js coreRows, coreTags, corePlan, coreConfirmText, useCore (data + action; renderCores/bindCoreIn stay today's);
  52-sleepers.js sleepers (data; sleeperCard/sleepersSection are today's drawing);
  75-arena-build.js / 61-concept-h-pages.js: today's drawing only (chBuildInit, abAroundRender); read for behaviour, not moved.

## Order of work (proposal)
1. Move the Cores and sleepers data (same-output proof). 2. Build piece 1: title + options + the answer (best team built).
3. Piece 2: other options beside the cores. 4. Piece 3: Start from a recent winner + phone jump bar. Pictures to Sim before
each piece goes on the Preview; behaviour tests AUTO/CORES on both builds after each.

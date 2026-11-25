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

## Mock-up -> data map for Build piece 1 (checked in 22-auto-build.js, Nov 12 ~3:19 PM; the engine is already shared)
- Run: runAutoBuild() sets ui.ab = {busy:true}, then ui.ab = {doubles: res}; res.teams[] = abDescribe() objects; the Fresh take
  arrives after and slots in as option 2 (addFreshTakeGen). It calls today's renderAutoBuild() (guards its own elements).
- Eyebrow "Option 1 of 3 · Proven team": index in res.teams, team.proven ({n, wr, g, swapped}) or team.fresh.
- Title "Sun, Tailwind": team.label (teamArchetype label) -> the mock shows it as words; chips "Speed control · Weather · 2 Mega
  options" = team.gp + team.megas.
- 91 Top tier + "Top 2% of tournament teams" + "89 from its Pokémon and sets, +1 matchups, +1 from its own 479 games": team.score
  and the Strength Score pieces (58-strength.js, shared; the same numbers as My Team's "Why this score?").
- Six: team.mons[] {n, d, mega, it (item), role, box, offMeta}; "Your pick" = ui.abLock; tier = monRating (shared).
- Four reasons: Matchups 24/30 (team._rd: rows by level; words: Matchups with an answer, Shaky, No answer: the word list, NOT
  the engine's old why line "N% ready for the top 30 threats"), Team checks 4/4 + notes (team.grade / proChecks), "58% won ·
  This exact six at events · 83 players, 496 games" (team.proven), Best core (the RES.cores line in team.why).
- Actions: Use This Team (today's data-abuse path: keepUndo + slots + toast), Save, Copy for Showdown (sheetPaste), "All six to
  catch: none is in your box yet" (team.mons[].box), Sets and roles ›.
- Options strip: Build from My Box (count) / Whole roster (ui.abSrc), Megas on team 0/1/2 (megaGoal, shared with My Team),
  Build around a Pokémon (ui.abLock, name box), "Build around Garchomp ↻" = run again.

## Status (Nov 12, 6:36 PM Eastern by the clock): Build is built in code, NOT on the Preview (waiting on Sim's yes to pictures)
Built (app/src/v2/pages/build.js): head and options; the answer (score, rank, breakdown + Why this score?, Fresh take line, six
with item / role / tier / To catch / Off-meta, four reasons with "1 swap" wording, Use / Save / Copy, today's no-result notes);
Other options; Start from a recent winner (sets + Load / Copy / Practice Against / Compare); Build around a core (kinds, sort,
With a Pokémon… filter, How cores are ranked, Add / Load, Practice Against + Copy on full teams, Show more); phone jump bar.
Today's AUTO/CORES tests on the new page (adapters/v2.B-build.mjs, new): 10 pass, 19 FAIL at 6:28 PM; the FAILs are wording by
design (Title Case headings and buttons, word list: Matchups, Show this one, Load, My Box), pages not rebuilt (Battle, Ratings,
All Suggestions, Winning Teams: Teams with it, CORES-09), Sim's questions (main yellow button before a build AUTO-07; menu entry
CORES-13), and today's "Details" toggle / More Cores fold (the new rows show the details inline; hover gives raw rate and % of teams).
Checks: c13 build 7/7 clean both engines; polish-check build: lone/tap flags explained in decisions.md (6:36 PM).

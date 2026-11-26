# Battle page: inventory before rebuilding (Nov 12, 7:31 PM Eastern by the clock; look-only groundwork, nothing built)

Approved mock-up: docs/rebuild/mocks/battle.tpl.html. Rule: every feature of today's Battle stays.
Today's features: docs/rebuild/inventory/C-battle.md; tests app/test/behaviour/C-battle.mjs: 87 tests (BATTLE 19, CALC 10,
TEST 9, X 9, LOG 7, MATCHUPS 6, NAV 6, SPEED 6, TRACK 6, TYPES 5, PRAC 4).

## Logic not shared yet (helper agent's map, key points checked by Claude 7:32 PM)
13 of today's files serve Battle and are not in parts-v2.json. None can be shared whole (each also draws). Checked: battlePlan
already exists as data (47-battle-mode.js:59) with a same-output proof (experiments/same-battle.mjs); 40-turn-one.js's logic is
turnOneData (not shared yet; battlePlan calls it inside try, so in the new site the turn-one plan would be silently empty);
24-matchup.js is an empty file.

## Order of work (each move proven unchanged on today's site before the next)
1. 40-turn-one.js: turnOneData -> shared 40-turn-one-data.js (turnOnePlan / drawTurnOne stay today's).
2. 47-battle-mode.js: bmHit, bmSpeed (ui passed in), BM_IMMUNE, BM_WEATHER, bmWatch, battlePlan -> shared 46-battle-data.js.
   Proof: experiments/same-battle.mjs + today's C-battle BATTLE tests.
3. 26-battle-log.js: teamRecord (+ a shared logAdd used by log and Test run) -> 26-log-data.js (already shared).
4. 38-gauntlet.js: gauntletTeams, gauntletScore, gauntletPrep, new gauntletRows (Test run) -> 38-gauntlet-data.js.
5. 63-practice.js: practice state, scoring and picks -> 63-practice-data.js.
6. 64-track.js: bands, week buckets, rates -> 64-track-data.js (after 13-rating.js).
7. 20-types.js: typeGroups, typeOffence -> 20-types-data.js.
Not shared: the arena files (74/75-arena-*: today's look only); 42-archetype-guides.js belongs to Meta, not Battle.
Open (not sure): where bmUi's toggle state lives; exact split inside renderGauntlet and renderGuides.

## Status (8:21 PM Eastern by the clock): all 7 logic steps DONE (shared with the new site, today's site proven unchanged)
1. 40-turn-one-data.js (turnOneData): today's page byte-identical; same-battle 170/170.
2. 46-battle-data.js (bmUi, bmHit, bmSpeed, BM_IMMUNE, BM_WEATHER, bmWatch, battlePlan): byte-identical; 170/170; BATTLE 19/0;
   runs in the new site (all 19 helpers present; bring 4, turn one, 10 speed rows).
3. teamRecord -> 26-log-data.js: code identical (one comment moved); LOG 7/0 before and after.
4. 38-gauntlet-data.js (Test run): byte-identical; TEST 9/0.
5. 63-practice-data.js: byte-identical; PRAC + BATTLE-05/17 6/0.
6. 64-track-data.js: byte-identical; TRACK 6/0.
7. 20-types-data.js (typeGroups, typeOffence, lifted out of renderTypes): 291/291 Types screens identical (experiments/same-types.cjs);
   TYPES 5/0.
New site: 51 shared logic files (45 before). Next: the Battle page itself (mock-up docs/rebuild/mocks/battle.tpl.html), piece by
piece with pictures to Sim; and a new-site adapter for C-battle tests (like v2.B-build.mjs).

# Reskin queue (Nov 21, 2026, 8:10 PM): the pages still to move onto the shared kit, in Sim's priority order

Helpers take the top open page. Each page is ONE job in its OWN copy (git worktree from t1rules HEAD, frozen out/ from 0c992f69).

## What a page job is (same for every page)
1. Read: docs/rebuild/mocks/cohesion-nov21/THEME.md, HYBRID.md (rules 1-9 + "Page calls"), PAGES.md (the page's plan-name/hero idea),
   docs/rebuild/reskin/inventory.md (the page's section: every control, data hook, state and test file), CLAUDE.md (NO GENERIC AI DESIGN,
   type symbols always with the word, no folds, light + dark, 320-2560, 4px grid, type scale, colours only as tokens).
2. Sim's PC mock-up for the page: `git show origin/claude/cohesion-mocks:docs/rebuild/mocks/cohesion-nov21/pages/<id>.html`
   ("Keep as drawn" pages follow it with small fixes; "Redo with the rule" pages use it only as a starting idea).
3. Build on the kit (app/src/v2/kit.js + css/kit.css: V2.kHead / kSent / kPlan / kStep / kCard / kRoster / kFacts / kGo / kTag / kMoves / kTy).
   Keep EVERY control, data-* hook, id and state the inventory lists. Look at done pages for the pattern: team.js (war room), calc-plot.js,
   pokemon.js, the empty My Team (team.js V2.emptyHtml).
4. Phone height at 390 no longer than today's (measure both on the same build); report both numbers.
5. Tests: the page's own behaviour group (A-team / B-build / C-battle / D-meta-shell), kit-page, v2-overlap for the page (ROUTES=<id>, both
   themes), v2-minors (3 parts, --preview-data build), any v2-*.mjs that reads the page (grep the test folder for its classes and words).
   Update a test only where it reads the old look or wording, and say which.
6. Pictures (today vs kit, desktop 1440 day + night, phone 390) labelled with docs/rebuild/preview-kit/label-picture.cjs; NOT merged:
   commit in the copy, tag keep/<id>-kit, report. HH shows Sim; nothing merges without Sim's yes.

## The queue
| # | Page (id) | Mock call (HYBRID.md) | Status |
|---|---|---|---|
| 1 | My Team, empty (team-empty) | n/a | merged (4c632f93), push with the fix batch |
| 2 | Team Sheet (sheet) | Keep as drawn | helper hS2 |
| 3 | Compare (compare) | Redo with the rule | helper hC2 |
| 4 | Battle (battle) | Sim (Nov 22): concept 1 "Turn one is already written" (the script: cast list, then turn one told in the game's own battle text on the war-room panel, HP bars after each hit). Make it better and more creative, then build it. Mock scripts: helper hB2's copy scratchpad/bm, docs/rebuild/mocks/battle-3/c1-script.js; pictures docs/rebuild/pics/nov22/battle3/1-the-script-* | next helper slot |
| 5 | Speed Tiers (speed) | Redo with the rule | open |
| 6 | Type Chart (types) | Redo with the rule | symbols part approved by Sim 10:23 PM (tag keep/type-chips), merging |
| 7 | Team Preview Practice (practice) | Redo with the rule | open |
| 8 | Test Run (gauntlet) | Redo with the rule | open |
| 9 | Usage (usage) | (not called) | open |
| 10 | Popular Sets (sets) | Redo with the rule | open |
| 11 | Archetypes (archetypes) | Keep as drawn | open |
| 12 | Winning Teams (tournaments) | Keep as drawn | open |
| 13 | Events (events) | HH's events2 mock | open |
| 14 | This Week (weekly) | Redo with the rule | open |
| 15 | News (news) | Keep as drawn | open |
| 16 | Mystery Gifts (gifts) | Keep as drawn (fix the code wrap) | open |
| 17 | Track Record (track) | HH's track2 mock | open |
| 18 | How We Calculate (method) | (not called) | open |
| 19 | About (about) | (not called) | open |
| 20 | Send Feedback (feedback) | Keep as drawn | open |
| 21 | Page not found (notfound) | (not called) | open |
| 22 | Owner page (owner) | lowest priority | open |

Not in the queue: Home (Sim, 7:10 PM: keep today's), My Box (Sim: no change), Ratings / Build / Calc / My Team / Pokémon page (done today).

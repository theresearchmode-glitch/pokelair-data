# Reg M-D test teams: checks that read real teams, what they do with none, and fixture teams (gap G11), Nov 24

Branch `alt/md-fixtures` from `claude/design6` at **739ff579** (the brief said 0d681a32; Sim moved it to 739ff579, which only adds
gen-roster.mjs and its report on top, checked with `git diff --stat 0d681a32 739ff579`). Frozen data 0c992f69. Setup only: @smogon/calc
0.12.0 linked into node_modules (threat-check loads it from there, not from SMOGCALC); `SMOGCALC` set for the others.

## How it was tested (three runs of the same 11 checks, plus one with the M-D roster)
- **before**: today's frozen data, today's code. **zero**: the same data with the team lists emptied
  (`node experiments/md-fixtures.mjs --zero out/`: limitless results.records + proven, events.events, teams.teams, matches.decks + m,
  official.events; restored afterwards with `git checkout 0c992f69 -- out/`). **zero + fixtures**: the emptied data with the new code.
  **after**: today's data with the new code (must equal before). **M-D roster**: emptied data + the gen-roster M-D dry-run data.js
  (with Heatran-Mega), to show the two Mega Heatran teams are used.
- Each line below is the check's exit code and its last output line, copied from the run logs (in the zip).

## The table
| Check (what it reads) | before (today) | zero teams | zero + fixtures | after (today, new code) |
|---|---|---|---|---|
| golden (teams.teams, events top-4, results.records/proven, matches sheets) | rc=0 "10 of 10 known-answer cases pass" | rc=1 "6 of 10 known-answer cases pass" (4 cases FAIL: fails loudly, not silent) | rc=1 "7 of 10 known-answer cases pass" + fixture line | rc=0 "10 of 10 known-answer cases pass" (same as before) |
| lead-logic (results.records: the 40 most-run teams) | rc=0 "ALL PASSED" | rc=1 crash `RES.records` undefined | rc=0 "ALL PASSED" (144 matchups on 12 fixture teams) + fixture line | rc=0 "ALL PASSED" (same as before) |
| same-grade (events with full sheets) | rc=0 "ALL PASSED" | rc=1 crash `META.events` null | rc=0 "ALL PASSED" + fixture line | rc=0 "ALL PASSED" (same as before) |
| suggest-audit (results.records: most-run sixes) | rc=0 "SUGGESTIONS AUDIT PASSED" ("300 most-run tournament teams") | **rc=0 PASSED ON NOTHING** ("none of the 0 most-run tournament teams…") | rc=0 "SUGGESTIONS AUDIT PASSED" on 12 fixture teams + fixture line | rc=0 "SUGGESTIONS AUDIT PASSED" (same as before) |
| suggest-gaps (matches.decks real sheets; events, teams) | rc=0 "ALL PASSED" | rc=1 "1 FAILED" (0 sheets) | rc=1 "1 FAILED" (12 sheets, 0 differ; needs > 1000) + fixture lines | rc=0 "ALL PASSED" (same as before) |
| threat-check (official.json RK9 #1/#2; events, teams) | rc=0 "regional #1/#2 median readiness: 81% PASS" | rc=1 "median readiness should be 80+ (got undefined)" | rc=0 "regional #1/#2 median readiness: 87% PASS" + fixture lines | rc=0 "regional #1/#2 median readiness: 81% PASS" (same as before) |
| legality-check (official.json RK9 sheets; events, teams) | rc=0 "Mega stones per official team: {"1":110,"2":402}" | **rc=0 PASSED ON NOTHING** ("{}") | rc=0 "{"1":2,"2":10}" + fixture lines | rc=0 "{"1":110,"2":402}" (same as before) |
| build-logic (results via Build for Me) | rc=0 "ALL PASSED" | rc=0 "ALL PASSED" (same output: it doesn't loop over teams) | not changed | rc=0 "ALL PASSED" (same as before) |
| plan-cache-test (results data) | rc=0 "ALL PASSED" | rc=0 "ALL PASSED" (scores shift 0.1-0.2; doesn't loop over teams) | not changed | rc=0 "ALL PASSED" (same as before) |
| accuracy-gate (walk-forward on real games) | rc=0 "GATE PASSED" | rc=1 "Command failed: node model.mjs" (no games to train on) | not changed: fixture teams have no games | rc=0 "GATE PASSED" (same as before) |
| app/test/run.mjs (DOCS incl. events, teams) | rc=0 "ALL PASSED" | rc=1 crash `META.events` null | rc=1 crash `META.results` null in its stress test + fixture line | rc=0 "ALL PASSED" (same as before) |

M-D roster run (emptied data + gen-roster's Heatran dry-run data.js): lead-logic rc=0 "ALL PASSED", same-grade rc=0 "ALL PASSED",
threat-check rc=0 "PASS", each with "fixture teams: 14 used" (the two Mega Heatran teams included). data.js put back (`git diff` clean).

**Before = after on today's data (checked):** every summary line is identical (`diff` of the two summaries, run times removed: empty);
full logs compared line by line: 0 differing lines in 10 checks; golden differs only in 3 run times ("1.7 s" → "1.6 s", "0.4 s" → "0.3 s",
"slowest 0.3 s" → "0.2 s"); "fixture lines anywhere: 0" (no fixture line on real data).

## What changed (patches)
- `experiments/fixtures/md-teams.json`: 12 real Reg M-C top-4 sheets (Limitless events of 139-230 players, Oct 11 - Nov 6; species, item,
  Ability, nature, moves; no player names) + 2 made-up Mega Heatran teams (MC07 / MC05 with their Mega swapped for Heatran-Mega, with stand-in
  item, Ability and moves; used only when the roster has Heatran-Mega).
- `experiments/md-fixtures.mjs`: `withFixtures(docs)` fills only EMPTY team lists (results.records, teams.teams, events.events, dict-encoded
  as out/events.json), `withFixturesOfficial(official)`, `fixtureDecks()`; each prints one "fixture teams: N used (out/ has no real teams: …
  empty)" line; teams with a Pokémon the roster lacks are skipped and named. `--zero <dir>` empties an out/ copy (the M-D-day test).
- One line each in golden, lead-logic, same-grade, suggest-audit, suggest-gaps, threat-check, legality-check and app/test/run.mjs
  (`withFixtures(D)` after the data is built, plus the import); threat-check and legality-check also wrap their `rd('official.json')`;
  suggest-gaps uses `fixtureDecks()` when matches has no decks.
- lead-logic: its two page blocks read `RES.records`; when the page has no results (below) they use the records the check handed in.
  With today's data the page has RES, so the same code path runs as before.
No threshold or expected value was changed in any check.

## What fixtures can't fix (left failing, loudly; for HH)
- **The page drops the whole results data with under 100 proven teams or 100 cores** (app/src/app/05-data-clean.js:6 `cleanResults`). On
  M-D day RES is empty, so features built on it (Build Around It, suggestion cards, run.mjs's results stress test, golden's 3 cases
  "no suggestion lowers the grade of a strong (A) team", "Build around a Pokémon … within 3 of the best real team", "Apply gives exactly
  the grade the suggestion card promised") can't work and the checks fail, which is the truth. Fixtures would need 100+ made-up proven
  teams; I didn't fake that. Proposal: decide what the site shows on M-D day before results reach 100 teams (a site decision).
- **suggest-gaps** requires > 1000 real sheets (line 141: `cmp.length > 1000`); 12 fixtures can't reach it. Proposal for HH: in fixture
  mode require every fixture sheet instead (not made: it would change the check's bar).
- **accuracy-gate** trains a model on real games; with no games it fails at `node model.mjs`. Fixtures have no results to train on.
  Proposal: skip it with a clear "not enough M-D games yet" line until two weeks of games exist (not made).

## App tests that read real teams, not run with zero teams (cost; listed for completeness)
app/test: items, prelaunch, sheet-tabs, shots, v2-ckwin, v2-cxev, v2-minors, v2-pbppair, v2-q14, v2-q18, v2-q31, v2-q32, v2-q33, v2-saved,
v2-sixof, v2-sync, v2-t1rules, v2-today (they read META.events / META.teams / results via the built page). Not checked with zero teams.

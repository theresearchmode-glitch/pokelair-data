# Full check of claude/design6 (overnight JOB 2, alt/fullcheck2), Nov 24

Report written: see the time line at the end (docs/rebuild/now.sh). Report only: no code or test was changed.

## Headline
**Every check passed on 136e7cd9.** No real failures, no flakes, no "FIXED?" lines. Last night's failures on 59b6744d (HOME-09 in
Chromium and WebKit; v2-q23; v2-minors main1 6 FAILs; v2-minors groups 4 FAILs + crash) all pass now.

## What was tested (checked)
- Commit: tip of `claude/design6` = **136e7cd9** ("Overnight brief for the other account…"); `git rev-parse --short origin/claude/design6` -> 136e7cd9.
- Frozen data `0c992f69…` in out/ for every frozen-data job (as GitHub does); data-checks, live-audits and accuracy-gate on the branch's own out/.
- Node v22.23.5, Playwright 1.49.1 + Chromium 131 (build v1148); WebKit 26.6 via Playwright 1.63.0 in its own copy (as the workflow's WebKit job).
- Every `run:` step of .github/workflows/test.yml, run in order by a script that reads the file. Skipped: `sleep 120`, npm ci / playwright install
  (done once per copy, exit 0). `$GITHUB_OUTPUT` / `$GITHUB_STEP_SUMMARY` pointed to temp files (they only exist on GitHub; last night this made
  live-audits fail as a setup problem). Live-audits wrote `bad=0`.
- Different from GitHub: the container stopped twice while the session was idle (found at about 12:41 AM and 1:12 AM EST); the run resumed from the
  step that was cut off (finished steps are not rerun; data and build steps rerun first). Two runs shared the 4 cores for the first hours.
- Nothing failed, so there was nothing to rerun alone.

## Results, one line per check (command, result line, plain meaning)

### test

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `cd node_modules/pokemon-showdown && node build` | 0 | (build of the Showdown mod; exit 0) | passed |
| 5 | `node app/test/run.mjs` | 0 | ALL PASSED | passed |
| 6 | `node experiments/replays-test.mjs` | 0 | ok   teams with an unknown Pokémon are skipped | passed |
| 7 | `node experiments/tour-modes-test.mjs` | 0 | tour-modes: all passed | passed |
| 8 | `node experiments/post-data-test.mjs` | 0 | ALL PASS | passed |
| 9 | `node experiments/post-news-test.mjs` | 0 | ALL PASS | passed |
| 10 | `node experiments/speed-check.mjs` | 0 | reference: Sneasler Jolly 32 Spe = 189; with Unburden in item consumed = 378 | passed |
| 11 | `node experiments/calc-check.mjs 2000` | 0 | exact or explained: 99.99% | passed |
| 12 | `node experiments/legality-check.mjs` | 0 | official RK9 teams with duplicate items (should be 0 under Item Clause): 0 | passed |
| 13 | `node experiments/threat-check.mjs` | 0 | PASS | passed |
| 14 | `node experiments/fields-audit.mjs` | 0 | PASS: every VGC-relevant field is in the data and used by the engine | passed |
| 15 | `node experiments/suggest-gaps.mjs` | 0 | ALL PASSED | passed |
| 16 | `node experiments/suggest-audit.mjs 30 5` | 0 | SUGGESTIONS AUDIT PASSED | passed |
| 17 | `node experiments/build-logic.mjs` | 0 | ALL PASSED | passed |
| 18 | `node experiments/lead-logic.mjs` | 0 | ALL PASSED | passed |
| 19 | `node experiments/sync-logic.mjs` | 0 | ALL PASSED | passed |
| 20 | `node experiments/typing-sync.mjs` | 0 | PASS | passed |
| 21 | `node experiments/sync-quiet.mjs` | 0 | ALL PASSED | passed |
| 22 | `node experiments/golden.mjs` | 0 | 10 of 10 known-answer cases pass | passed |
| 23 | `node experiments/same-grade.mjs` | 0 | ALL PASSED | passed |
| 24 | `node experiments/plan-cache-test.mjs` | 0 | ALL PASSED | passed |

### behaviour-v2[A-team]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs --v2 --art=../src/v2/art/` | 0 | built dist/v2.html (3000 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files) | page built |
| 4 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` | 0 | behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 893s  (adapter v2) | passed |
| 5 | `PAGE=app/dist/v2.html node app/test/v2-overlap.mjs` | 0 | v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 644s) | passed |
| 6 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` | 0 | tap-once: all pass | passed |

### behaviour-v2[B-build]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs --v2 --art=../src/v2/art/` | 0 | built dist/v2.html (3000 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files) | page built |
| 4 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs B-build` | 0 | behaviour: 77 pass, 0 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 532s  (adapter v2) | passed |

### behaviour-v2[C-battle]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs --v2 --art=../src/v2/art/` | 0 | built dist/v2.html (3000 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files) | page built |
| 4 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs C-battle` | 0 | behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 429s  (adapter v2) | passed |

### behaviour-v2[D-meta-shell]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs --v2 --art=../src/v2/art/` | 0 | built dist/v2.html (3000 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files) | page built |
| 4 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs D-meta-shell` | 0 | behaviour: 118 pass, 0 FAIL, 41 known bugs, 0 fixed?, 7 skipped; 488s  (adapter v2) | passed |

### v2-minors[main1]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/build.mjs --v2 --preview-data` | 0 | built dist/v2.html (4239 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files) | page built |
| 5 | `PART=main1 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | 0 | v2-minors (main1):all passed | passed |

### v2-minors[main2]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/build.mjs --v2 --preview-data` | 0 | built dist/v2.html (4239 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files) | page built |
| 5 | `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | 0 | v2-minors (main2):all passed | passed |

### v2-minors[groups]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/build.mjs --v2 --preview-data` | 0 | built dist/v2.html (4239 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files) | page built |
| 5 | `PART=groups PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | 0 | v2-minors (groups):all passed | passed |

### v2-checks

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/test/v2-guard.mjs` | 0 | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css) | passed |
| 5 | `node app/test/no-names.mjs && node app/build.mjs --v2 --preview-data && node app/test/no-n` | 0 | no-names: 2182 player fields checked, 0 not an ID or stand-in | passed |
| 6 | `PAGE=app/dist/v2.html node app/test/v2-caches.mjs` | 0 | v2-caches: grade before 93.6, cached after 93.4, fresh after 93.4 -> ok; Test Run rows ok (spread change did change them) | passed |
| 7 | `PAGE=app/dist/v2.html node app/test/v2-folds.mjs` | 0 | v2-folds: all passed | passed |
| 8 | `PAGE=app/dist/v2.html node app/test/v2-partial.mjs` | 0 | v2-partial: all passed | passed |
| 9 | `PAGE=app/dist/v2.html node app/test/v2-redraws.mjs` | 0 | v2-redraws: all passed | passed |
| 10 | `PAGE=app/dist/v2.html node app/test/v2-trwarm.mjs` | 0 | v2-trwarm: all passed | passed |
| 11 | `PAGE=app/dist/v2.html node app/test/v2-back.mjs` | 0 | v2-back: all passed | passed |
| 12 | `PAGE=app/dist/v2.html node app/test/v2-toast.mjs` | 0 | v2-toast: all passed | passed |
| 13 | `PAGE=app/dist/v2.html node app/test/v2-rmjump.mjs` | 0 | v2-rmjump: all passed | passed |
| 14 | `PAGE=app/dist/v2.html node app/test/v2-clear.mjs` | 0 | v2-clear: all passed | passed |
| 15 | `PAGE=app/dist/v2.html node app/test/v2-formerr.mjs` | 0 | v2-formerr: all passed | passed |
| 16 | `PAGE=app/dist/v2.html node app/test/v2-pksrc.mjs` | 0 | v2-pksrc: all passed | passed |
| 17 | `PAGE=app/dist/v2.html node app/test/v2-trkfit.mjs` | 0 | v2-trkfit: all passed | passed |
| 18 | `PAGE=app/dist/v2.html node app/test/v2-usagepicks.mjs` | 0 | v2-usagepicks: all passed | passed |
| 19 | `PAGE=app/dist/v2.html node app/test/v2-pbppair.mjs` | 0 | v2-pbppair: all passed | passed |
| 20 | `PAGE=app/dist/v2.html node app/test/v2-q21.mjs` | 0 | v2-q21: ALL PASSED | passed |
| 21 | `PAGE=app/dist/v2.html node app/test/v2-q25.mjs` | 0 | v2-q25: all passed | passed |
| 22 | `PAGE=app/dist/v2.html node app/test/v2-q26.mjs` | 0 | v2-q26: all passed | passed |
| 23 | `PAGE=app/dist/v2.html node app/test/v2-q24.mjs` | 0 | v2-q24: all passed | passed |
| 24 | `PAGE=app/dist/v2.html node app/test/v2-w5.mjs` | 0 | v2-w5: all passed | passed |
| 25 | `PAGE=app/dist/v2.html node app/test/v2-q31.mjs` | 0 | v2-q31: all passed | passed |
| 26 | `PAGE=app/dist/v2.html node app/test/v2-q32.mjs` | 0 | v2-q32: all passed | passed |
| 27 | `PAGE=app/dist/v2.html node app/test/v2-q33.mjs` | 0 | v2-q33: all passed | passed |
| 28 | `PAGE=app/dist/v2.html node app/test/v2-arena.mjs` | 0 | all Damage Calc (Plot the hit) checks pass | passed |
| 29 | `PAGE=app/dist/v2.html node app/test/v2-q41.mjs` | 0 | v2-q41: all passed | passed |
| 30 | `PAGE=app/dist/v2.html node app/test/v2-q45.mjs` | 0 | v2-q45: all passed | passed |
| 31 | `PAGE=app/dist/v2.html node app/test/v2-q44.mjs` | 0 | v2-q44: all passed | passed |
| 32 | `PAGE=app/dist/v2.html node app/test/v2-q42.mjs` | 0 | v2-q42: all passed | passed |
| 33 | `PAGE=app/dist/v2.html node app/test/v2-q43.mjs` | 0 | v2-q43: all passed | passed |
| 34 | `PAGE=app/dist/v2.html node app/test/v2-q46.mjs` | 0 | v2-q46: all passed | passed |
| 35 | `PAGE=app/dist/v2.html node app/test/v2-q47.mjs` | 0 | v2-q47: all passed | passed |
| 36 | `PAGE=app/dist/v2.html node app/test/v2-kob.mjs` | 0 | v2-kob: all passed | passed |
| 37 | `PAGE=app/dist/v2.html node app/test/v2-q52.mjs` | 0 | v2-q52: all passed | passed |
| 38 | `PAGE=app/dist/v2.html node app/test/v2-q59.mjs` | 0 | v2-q59: all passed | passed |

### v2-checks-2

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/test/v2-guard.mjs` | 0 | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css) | passed |
| 5 | `node app/test/no-names.mjs && node app/build.mjs --v2 --preview-data && node app/test/no-n` | 0 | no-names: 2182 player fields checked, 0 not an ID or stand-in | passed |
| 6 | `PAGE=app/dist/v2.html node app/test/v2-q60.mjs` | 0 | v2-q60: all passed | passed |
| 7 | `PAGE=app/dist/v2.html node app/test/v2-swapname.mjs` | 0 | v2-swapname: all passed | passed |
| 8 | `PAGE=app/dist/v2.html node app/test/v2-q68.mjs` | 0 | v2-q68: all passed | passed |
| 9 | `PAGE=app/dist/v2.html node app/test/v2-s1.mjs` | 0 | v2-s1: all passed | passed |
| 10 | `PAGE=app/dist/v2.html node app/test/v2-s26.mjs` | 0 | v2-s26: all passed | passed |
| 11 | `PAGE=app/dist/v2.html node app/test/v2-s17.mjs` | 0 | v2-s17: all passed | passed |
| 12 | `PAGE=app/dist/v2.html node app/test/v2-s13.mjs` | 0 | v2-s13: all passed | passed |
| 13 | `PAGE=app/dist/v2.html node app/test/v2-q69.mjs` | 0 | v2-q69: all passed | passed |
| 14 | `PAGE=app/dist/v2.html node app/test/v2-q78.mjs` | 0 | v2-q78: all passed | passed |
| 15 | `PAGE=app/dist/v2.html node app/test/v2-q72.mjs` | 0 | v2-q72: all passed | passed |
| 16 | `PAGE=app/dist/v2.html node app/test/v2-s16.mjs` | 0 | v2-s16: all passed | passed |
| 17 | `PAGE=app/dist/v2.html node app/test/v2-s2.mjs` | 0 | v2-s2: all passed | passed |
| 18 | `PAGE=app/dist/v2.html node app/test/v2-s33.mjs` | 0 | v2-s33: all passed | passed |
| 19 | `PAGE=app/dist/v2.html node app/test/v2-wnew.mjs` | 0 | v2-wnew: all passed | passed |
| 20 | `PAGE=app/dist/v2.html node app/test/v2-q83.mjs` | 0 | v2-q83: all passed | passed |
| 21 | `PAGE=app/dist/v2.html node app/test/v2-q84.mjs` | 0 | v2-q84: all passed | passed |
| 22 | `PAGE=app/dist/v2.html node app/test/v2-q16.mjs` | 0 | v2-q16: all passed | passed |
| 23 | `PAGE=app/dist/v2.html node app/test/v2-q17.mjs` | 0 | v2-q17: all passed | passed |
| 24 | `PAGE=app/dist/v2.html node app/test/v2-q22.mjs` | 0 | v2-q22: all passed | passed |
| 25 | `PAGE=app/dist/v2.html node app/test/v2-q19.mjs` | 0 | v2-q19: all passed | passed |
| 26 | `PAGE=app/dist/v2.html node app/test/v2-q18.mjs` | 0 | v2-q18: all passed | passed |
| 27 | `PAGE=app/dist/v2.html node app/test/v2-q14.mjs` | 0 | v2-q14: all passed | passed |
| 28 | `PAGE=app/dist/v2.html node app/test/v2-q23.mjs` | 0 | v2-q23: all passed | passed |
| 29 | `PAGE=app/dist/v2.html node app/test/v2-t1rules.mjs` | 0 | v2-t1rules: all passed | passed |
| 30 | `PAGE=app/dist/v2.html node app/test/v2-cxev.mjs` | 0 | v2-cxev: all passed | passed |
| 31 | `PAGE=app/dist/v2.html node app/test/v2-oddaddr.mjs` | 0 | v2-oddaddr: all passed | passed |
| 32 | `LT_ALERT=1 PAGE=app/dist/v2.html node app/test/v2-longtask.mjs` | 0 | v2-longtask: all passed | passed |
| 33 | `PAGE=app/dist/v2.html node app/test/v2-post-doc.mjs` | 0 | ALL PASS | passed |
| 34 | `PAGE=app/dist/v2.html node app/test/v2-unbounded.mjs` | 0 | v2-unbounded: none outside the named exception across 29 pages | passed |
| 35 | `PAGE=app/dist/v2.html node app/test/v2-sixof.mjs` | 0 | v2-sixof: all passed | passed |
| 36 | `PAGE=app/dist/v2.html node app/test/v2-shown-score.mjs` | 0 | v2-shown-score: all passed | passed |
| 37 | `PAGE=app/dist/v2.html node app/test/v2-ckwin.mjs` | 0 | v2-ckwin: all passed | passed |
| 38 | `PAGE=app/dist/v2.html node app/test/v2-paste.mjs` | 0 | v2-paste: all passed | passed |
| 39 | `PAGE=app/dist/v2.html node app/test/share-fz.mjs` | 0 | share-fz: all passed | passed |
| 40 | `PAGE=app/dist/v2.html node app/test/data-swap.mjs` | 0 | data-swap: all passed | passed |
| 41 | `PAGE=app/dist/v2.html node app/test/forms-contrast.mjs` | 0 | forms-contrast: all passed | passed |
| 42 | `PAGE=app/dist/v2.html node app/test/tap-size.mjs` | 0 | tap-size: all passed | passed |
| 43 | `node app/test/tokens-doc.mjs` | 0 | tokens-doc: up to date (694 tokens) | passed |
| 44 | `node app/test/perf-docs.mjs` | 0 | perf-docs: behaviour fixture "meta/perf" has 7 of 7 perf.json parts; built doc has 7 | passed |
| 45 | `node app/test/test-ids.mjs` | 0 | test-ids: 487 tests, every ID unique inside its group | passed |
| 46 | `node app/build.mjs --v2 --preview-data --split && node app/test/v2-split.mjs` | 0 | v2-split:all passed | passed |
| 47 | `node app/test/v2-public.mjs` | 0 | v2-public: all passed | passed |
| 48 | `node app/build.mjs --v2 && node experiments/v2-words.mjs` | 0 | v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none) | passed |
| 49 | `node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-saved.mjs` | 0 | v2-saved: all passed | passed |

### quality-v2

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/build.mjs --v2 --preview-data` | 0 | built dist/v2.html (4239 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files) | page built |
| 5 | `PAGE=app/dist/v2.html node app/test/qcheck-all.mjs` | 0 | qcheck-all: 28 pages + 11 views x 5 widths x 2 themes, 73 findings, 0 new; 1278s | passed |

### data-checks

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `cd node_modules/pokemon-showdown && node build` | 0 | (build of the Showdown mod; exit 0) | passed |
| 4 | `node app/build.mjs` | 0 | built dist/page.html (3494 KB from 140 parts, 3465 comment lines dropped) | page built |
| 5 | `node app/test/run.mjs` | 0 | ALL PASSED | passed |
| 6 | `node experiments/threat-check.mjs` | 0 | PASS | passed |
| 7 | `node experiments/lead-logic.mjs` | 0 | ALL PASSED | passed |
| 8 | `node experiments/golden.mjs` | 0 | 10 of 10 known-answer cases pass | passed |
| 9 | `node app/test/v2-today.mjs` | 0 | v2-today: all passed (22 s) | passed |

### live-audits

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 2 | `cd node_modules/pokemon-showdown && node build` | 0 | (build of the Showdown mod; exit 0) | passed |
| 3 | `node app/build.mjs` | 0 | built dist/page.html (3494 KB from 140 parts, 3465 comment lines dropped) | page built |
| 4 | `set +e; R="$RUNNER_TEMP/audits.md"; : > "$R"; bad=0` | 0 | (no output) | passed |

### accuracy-gate

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs` | 0 | built dist/page.html (3494 KB from 140 parts, 3465 comment lines dropped) | page built |
| 4 | `node experiments/accuracy-gate.mjs` | 0 | GATE PASSED | passed |

## Extra checks asked for

| check | command | result line | meaning |
|---|---|---|---|
| WebKit My Team | `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` | behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 1030s (webkit, adapter v2) | passed (HOME-09 passes now) |
| WebKit Build | `… run.mjs B-build` | behaviour: 77 pass, 0 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 611s (webkit, adapter v2) | passed |
| WebKit Battle | `… run.mjs C-battle` | behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 461s (webkit, adapter v2) | passed |
| WebKit Meta + shell | `… run.mjs D-meta-shell` | behaviour: 118 pass, 0 FAIL, 41 known bugs, 0 fixed?, 7 skipped; 553s (webkit, adapter v2) | passed |
| WebKit tap-once | `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` | tap-once: all pass | passed |
| v2-minors main1 / main2 / groups | `PART=<part> PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | see the v2-minors rows above | all three passed (groups ran to the end; no crash) |
| qcheck-all (every page and view) | `PAGE=app/dist/v2.html node app/test/qcheck-all.mjs` | qcheck-all: 28 pages + 11 views x 5 widths x 2 themes, 73 findings, 0 new; 1278s | passed |
| polish-check (all views, 320-2560) | `TARGET=v2 node experiments/polish-check.mjs` | polish check: spill 20, uneven 4, lone 36, lineh 1, glow 1, boxes 6, space 41; page errors 0; 150s | report-only; the same counts and the same finding lines as last night (diff: only the run time differs) |

## Failures
None. Real: 0. Flakes: 0. "FIXED?" lines: 0 (NAV-10's "FIXED?" from last night no longer shows: D-meta-shell reports 0 fixed? in both browsers).

## qcheck-all: known findings no longer seen (2)
Listed by a temporary copy of qcheck-all.mjs that prints them (deleted afterwards; app/test/qcheck-known.json NOT rewritten).
Run: `qcheck-all: 28 pages + 11 views x 5 widths x 2 themes, 73 findings, 0 new; 1282s`.
- `calc | day 390 | SIZE 30.4px "%"`
- `calc | night 390 | SIZE 30.4px "%"`

## polish-check findings
Identical to last night's list in docs/rebuild/test-runs/fullcheck-nov23.md (alt/fullcheck): checked with `diff` of the two outputs; the only
differing line is the run time (150s vs 152s).

Report written: time: 2:24 AM (2:24:02)  date: Tue Nov 24, 2026 (docs/rebuild/now.sh).

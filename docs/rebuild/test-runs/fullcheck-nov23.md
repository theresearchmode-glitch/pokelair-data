# Full check of claude/design6 (Job 2), Nov 23-24

Report written: time: 8:33 PM (8:33:35)  date: Mon Nov 23, 2026 (docs/rebuild/now.sh). Report only: no code or test was changed.

## What was tested

- Commit: tip of `claude/design6` = **59b6744d** ("log"), checked: `git rev-parse --short origin/claude/design6` -> `59b6744d`. The brief named dc9f9fe3; the branch had moved on.
- Frozen data: `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/`, the same way GitHub's jobs do it. Checked: the 8 files under out/ that differ from the frozen commit (out/post.json, out/split/*) do not exist in that commit (`git ls-tree` -> 0 lines), so they come from the branch, exactly as on GitHub.
- "Today's data" jobs (data-checks, live-audits, accuracy-gate) ran on the branch's own out/, last changed Nov 20 (`git log -1 --format=%cd -- out/` -> Fri Nov 20 13:30:46 2026), not on today's daily data.
- Machine: cloud container, 4 cores, Node v22.23.5, Playwright 1.49.1 + Chromium 131 (build v1148); WebKit 26.6 via Playwright 1.63.0 in a separate copy (as the workflow's WebKit job does).
- Every `run:` step of .github/workflows/test.yml was run in order by a script that reads the file. Skipped only: `sleep 120` and the npm ci / playwright install steps (done once by hand per copy; all succeeded).
- Two things differ from GitHub: (1) up to three runs shared the 4 cores for the first hours (GitHub gives each job its own machine); (2) the container restarted twice (about 6:10 PM and 7:10 PM EST); runs resumed from the step that was cut off; no result was lost or counted twice.
- Every failure was then run again ALONE on a quiet machine. Rerun results are in "Failures".


## Result lines, one per check (command, result line, plain meaning)


### test

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `cd node_modules/pokemon-showdown && node build` | 0 | config.js does not exist. Creating one with default settings... | passed |
| 5 | `node app/test/run.mjs` | 0 | ALL PASSED | passed |
| 6 | `node experiments/replays-test.mjs` | 0 | ok   teams with an unknown Pokémon are skipped (all ok lines, no failure line) | passed |
| 7 | `node experiments/tour-modes-test.mjs` | 0 | tour-modes: all passed | passed |
| 8 | `node experiments/post-data-test.mjs` | 0 | ALL PASS | passed |
| 9 | `node experiments/post-news-test.mjs` | 0 | ALL PASS | passed |
| 10 | `node experiments/speed-check.mjs` | 0 | reference: Sneasler Jolly 32 Spe = 189 … (exit 0, no failure line) | passed |
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
| 3 | `node app/build.mjs --v2 --art=../src/v2/art/` | 0 | built dist/v2.html (2949 KB; 25 CSS layers, 8 data files, 55 scripts, 62 shared logic files) | page built |
| 4 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` | 1 | behaviour: 138 pass, 1 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 1044s  (adapter v2) | FAILED (see Failures) |
| 5 | `PAGE=app/dist/v2.html node app/test/v2-overlap.mjs` | 0 | v2-overlap: 0 findings, 0 known, 0 new (26 pages x 4 widths x 2 themes; 632s) | passed |
| 6 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` | 0 | tap-once: all pass | passed |

### behaviour-v2[B-build]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs --v2 --art=../src/v2/art/` | 0 | built dist/v2.html (2949 KB; 25 CSS layers, 8 data files, 55 scripts, 62 shared logic files) | page built |
| 4 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs B-build` | 0 | behaviour: 77 pass, 0 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 647s  (adapter v2) | passed |

### behaviour-v2[C-battle]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs --v2 --art=../src/v2/art/` | 0 | built dist/v2.html (2949 KB; 25 CSS layers, 8 data files, 55 scripts, 62 shared logic files) | page built |
| 4 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs C-battle` | 0 | behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 459s  (adapter v2) | passed |

### behaviour-v2[D-meta-shell]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs --v2 --art=../src/v2/art/` | 0 | built dist/v2.html (2949 KB; 25 CSS layers, 8 data files, 55 scripts, 62 shared logic files) | page built |
| 4 | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs D-meta-shell` | 0 | behaviour: 117 pass, 0 FAIL, 41 known bugs, 1 fixed?, 7 skipped; 511s  (adapter v2) | passed |

### v2-minors[main1]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/build.mjs --v2 --preview-data` | 0 | built dist/v2.html (4188 KB; 25 CSS layers, 8 data files, 55 scripts, 62 shared logic files) | page built |
| 5 | `PART=main1 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | 1 | v2-minors (main1):6 failed | FAILED (see Failures) |

### v2-minors[main2]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/build.mjs --v2 --preview-data` | 0 | built dist/v2.html (4188 KB; 25 CSS layers, 8 data files, 55 scripts, 62 shared logic files) | page built |
| 5 | `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | 0 | v2-minors (main2):all passed | passed |

### v2-minors[groups]

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/build.mjs --v2 --preview-data` | 0 | built dist/v2.html (4188 KB; 25 CSS layers, 8 data files, 55 scripts, 62 shared logic files) | page built |
| 5 | `PART=groups PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | 1 | crashed: elementHandle.scrollIntoViewIfNeeded: Timeout 30000ms exceeded (v2-minors.mjs:1706 wkPair); FAILs before the crash listed below | FAILED (see Failures) |

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
| 28 | `PAGE=app/dist/v2.html node app/test/v2-q23.mjs` | 1 | v2-q23: 1 failed | FAILED (see Failures) |
| 29 | `PAGE=app/dist/v2.html node app/test/v2-t1rules.mjs` | 0 | v2-t1rules: all passed | passed |
| 30 | `PAGE=app/dist/v2.html node app/test/v2-cxev.mjs` | 0 | v2-cxev: all passed | passed |
| 31 | `PAGE=app/dist/v2.html node app/test/v2-oddaddr.mjs` | 0 | v2-oddaddr: all passed | passed |
| 32 | `LT_ALERT=1 PAGE=app/dist/v2.html node app/test/v2-longtask.mjs` | 0 | v2-longtask: all passed | passed |
| 33 | `PAGE=app/dist/v2.html node app/test/v2-post-doc.mjs` | 0 | ALL PASS | passed |
| 34 | `PAGE=app/dist/v2.html node app/test/v2-unbounded.mjs` | 0 | v2-unbounded: none outside the named exception across 28 pages | passed |
| 35 | `PAGE=app/dist/v2.html node app/test/v2-sixof.mjs` | 0 | v2-sixof: all passed | passed |
| 36 | `PAGE=app/dist/v2.html node app/test/v2-shown-score.mjs` | 0 | v2-shown-score: all passed | passed |
| 37 | `PAGE=app/dist/v2.html node app/test/v2-ckwin.mjs` | 0 | v2-ckwin: all passed | passed |
| 38 | `PAGE=app/dist/v2.html node app/test/v2-paste.mjs` | 0 | v2-paste: all passed | passed |
| 39 | `PAGE=app/dist/v2.html node app/test/share-fz.mjs` | 0 | share-fz: all passed | passed |
| 40 | `PAGE=app/dist/v2.html node app/test/data-swap.mjs` | 0 | data-swap: all passed | passed |
| 41 | `PAGE=app/dist/v2.html node app/test/forms-contrast.mjs` | 0 | forms-contrast: all passed | passed |
| 42 | `PAGE=app/dist/v2.html node app/test/tap-size.mjs` | 0 | tap-size: all passed | passed |
| 43 | `node app/test/tokens-doc.mjs` | 0 | tokens-doc: up to date (653 tokens) | passed |
| 44 | `node app/test/perf-docs.mjs` | 0 | perf-docs: behaviour fixture "meta/perf" has 7 of 7 perf.json parts; built doc has 7 | passed |
| 45 | `node app/test/test-ids.mjs` | 0 | test-ids: 487 tests, every ID unique inside its group | passed |
| 46 | `node app/build.mjs --v2 --preview-data --split && node app/test/v2-split.mjs` | 0 | v2-split:all passed | passed |
| 47 | `node app/test/v2-public.mjs` | 0 | v2-public: all passed | passed |
| 48 | `node app/build.mjs --v2 && node experiments/v2-words.mjs` | 0 | v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none) | passed |
| 49 | `node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-saved.mjs` | 0 | v2-saved: all passed | passed |

### quality-v2

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 4 | `node app/build.mjs --v2 --preview-data` | 0 | built dist/v2.html (4188 KB; 25 CSS layers, 8 data files, 55 scripts, 62 shared logic files) | page built |
| 5 | `PAGE=app/dist/v2.html node app/test/qcheck-all.mjs` | 0 | qcheck-all: 27 pages + 11 views x 5 widths x 2 themes, 80 findings, 0 new; 1277s | passed |

### data-checks

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `cd node_modules/pokemon-showdown && node build` | 0 | config.js does not exist. Creating one with default settings... | passed |
| 4 | `node app/build.mjs` | 0 | built dist/page.html (3494 KB from 140 parts, 3465 comment lines dropped) | page built |
| 5 | `node app/test/run.mjs` | 0 | ALL PASSED | passed |
| 6 | `node experiments/threat-check.mjs` | 0 | PASS | passed |
| 7 | `node experiments/lead-logic.mjs` | 0 | ALL PASSED | passed |
| 8 | `node experiments/golden.mjs` | 0 | 10 of 10 known-answer cases pass | passed |
| 9 | `node app/test/v2-today.mjs` | 0 | v2-today: all passed (34 s) | passed |

### live-audits

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 2 | `cd node_modules/pokemon-showdown && node build` | 0 | (no output) | passed |
| 3 | `node app/build.mjs` | 0 | built dist/page.html (3494 KB from 140 parts, 3465 comment lines dropped) | page built |
| 4 | `set +e; R="$RUNNER_TEMP/audits.md"; : > "$R"; bad=0` | 1 | bash: line 6: : No such file or directory (setup: $GITHUB_OUTPUT unset outside GitHub) | SETUP problem, not the code; rerun with GITHUB_OUTPUT set: exit 0, bad=0 |

### accuracy-gate

| step | command | exit | result line | meaning |
|---|---|---|---|---|
| 3 | `node app/build.mjs` | 0 | built dist/page.html (3494 KB from 140 parts, 3465 comment lines dropped) | page built |
| 4 | `node experiments/accuracy-gate.mjs` | 0 | GATE PASSED | passed |

## Extra checks asked for (not all in GitHub's workflow)

| check | command | result line | meaning |
|---|---|---|---|
| WebKit My Team | `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` | behaviour: 137 pass, 2 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 1328s (webkit) | FAILED: HOME-09 real; EDIT-05 flake (passed alone) |
| WebKit Build | `BROWSER=webkit … run.mjs B-build` | behaviour: 77 pass, 0 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 784s (webkit) | passed |
| WebKit Battle | `BROWSER=webkit … run.mjs C-battle` | behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 511s (webkit) | passed |
| WebKit Meta + shell | `BROWSER=webkit … run.mjs D-meta-shell` | behaviour: 116 pass, 1 FAIL, 41 known bugs, 1 fixed?, 7 skipped; 600s (webkit) | FAILED once: THEME-03, a flake (passed alone) |
| WebKit tap-once | `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` | tap-once: all pass | passed |
| v2-minors main1 / main2 / groups | `PART=<part> PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | see the v2-minors rows above | main2 passed; main1 and groups FAILED |
| qcheck-all (every page and view) | `PAGE=app/dist/v2.html node app/test/qcheck-all.mjs` | qcheck-all: 27 pages + 11 views x 5 widths x 2 themes, 80 findings, 0 new; 1277s | passed (0 new); 34 known findings no longer seen (list below) |
| polish-check (all views, 320-2560) | `TARGET=v2 node experiments/polish-check.mjs` | polish check: spill 20, uneven 4, lone 36, lineh 1, glow 1, boxes 6, space 41; page errors 0; 152s | report-only (exit 0): 109 findings, listed below |

## Failures (every FAIL, with its message)

Each failure was run again alone on a quiet machine (no other test running), to tell real failures from load flakes.

### Real (failed again when run alone)

1. **HOME-09** (behaviour A-team; Chromium AND WebKit; failed in all 4 runs)
   `FAIL  HOME-09  Champion's six: load needs a second tap, loads with Undo; Copy for Showdown copies  -> no champion line with record, date, players`
2. **v2-q23** (v2-checks-2 step 28; failed in both runs, on Nov 23 and again after the date rolled to Nov 24, so not the date)
   `FAIL  the three plain lines are there, with the approved words (and the live count) (4 missing, e.g. day 1280 post (shown: ["Mystery Gift","CODE","38\nDAYS LEFT","NO. 69 · LATE EDITION\nMONDAY, NOVEMBER 23, 2026"]))`
3. **v2-minors PART=main1: 6 FAILs**, the same 6 with the same numbers in both runs:

   - `FAIL  pl-5d (Nov 17; Home re-pointed to the Stampede Nov 18): spoken names start with the visible words and hold no "[object Object]" (rating tiles, speed rows, Home's hero plates, ticker and ring names, Usage figures): .sdh-tick li:not([hidden]) button none`
   - `FAIL  Stampede tools: Speed Tiers is the nine highest rated by base Speed; Type Chart is 18 flags only, no Pokémon (Sim, Nov 18: A), as wide as Ratings, with Damage Calc on the same row (race true, types true, row false)`
   - `FAIL  Stampede tools: at 320 / 390 / 820 / 1100 / 1440 (day and night) no sideways scroll, no text under 13px or out of its spot, every row of plates full (320: ok | 390: ok | 820: ok | 1100: spills: Damage Calculato, spills: Rillaboom | 1440: spills: Damage Calculato, spills: Rillaboom)`
   - `FAIL  Stampede tiles 2 (Nov 18 night): Battle, at 320-2560 every sprite stays inside its side, clear of the VS, and is 56px or more; no name under a sprite: 1100: sprite 32px | 1180: sprite 31px | 1280: sprite 41px | 1366: sprite 49px`
   - `FAIL  Stampede tiles 3: Test Run, at 320-2560 the sprites fill the plate (32px or less left empty between its top and its words) and none is under 44px: 1100: empty -12px, smallest sprite 0px | 1180: empty -12px, smallest sprite 0px | 1280: empty -12px, smallest sprite 0px | 1366: empty -12px, smallest sprite 0px`
   - `FAIL  Stampede tiles 4: Damage Calc, at 1100-2560 (phones and iPads: Tools B puts the picture on top) the picture sits in the middle of the spare height (no empty band only above it): 1100: -244px above, 157px below | 1180: -244px above, 179px below | 1280: -244px above, 136px below | 1366: -222px above, 114px below`
4. **v2-minors PART=groups: crashed in both runs** at the same place, so the parts of "groups" after that point never ran on this commit:
   `elementHandle.scrollIntoViewIfNeeded: Timeout 30000ms exceeded … element is not visible … at wkPair (app/test/v2-minors.mjs:1706:50)`
   FAILs before the crash (first run: 1, HQ Q6; the run alone got further: 4):

   - `FAIL  HQ Q6 (Sim: A): the hero's motion is on with no flag (surge on arrival, moving ticker + pause button at 1440 and 390); with reduced motion nothing moves and no marquee is built: 1440 no-preference: {"surge":true,"trk":true,"pz":true,"run":0}`
   - `FAIL  HQ Post X (Sim, Nov 18): phone Home's post band is one parcel and the front page (no stamps, second slip or more stories) under 700; 700+ unchanged; both "All ›" links stay: 1440: {"parcel":1,"stamps":0,"other":0,"more":0,"name":2,"bar":1,"all":2,"h":417,"hs":-15}`
   - `FAIL  HQ Practice plate (Sim, Nov 18): Team Preview Practice takes Test Run's small plate at 1100-2560 (team preview of six live Pokémon, 44px+, "Pick 4"), the small plates' rows stay even, Test Run is in More tools: 1100: {"names":"","rows":[],"sprites":6,"small":0,"pick":"Pick 4","live":true,"test":true,"prMore":false} | 1440: {"names":"","rows":[],"sprites":6,"small":0,"pick":"Pick 4","live":true,"test":true,"prMore":false} | 1920: {"names":"","rows":[],"sprites":6,"small":0,"pick":"Pick 4","live":true,"test":true,"prMore":false} | 2560: {"names":"","rows":[],"sprites":6,"small":0,"pick":"Pick 4","live":true,"test":true,"prMore":false}`
   - `FAIL  HQ Tools B (Sim, Nov 18): phone Home shows six big plates (Speed Tiers, Ratings, Damage Calculator, Battle, Team Preview Practice, Winning Teams) and six picture chips, every tool on screen; iPads (700-1099, Sim Nov 18) the same six, then Type Chart as a strip and Cores | Archetypes | Sets as plates, no chips; 1100+ keeps twelve plates; phone Home at 390 is 7.72 screens (7.8 at most: Sim OK Nov 22, 2:50 PM, Top 10 strip +422 px): 1100: {"plates":"Speed Tiers|Ratings|Damage Calculator|Winning Teams|Battle","chips":"Type Chart|Winning Cores|Archetypes|Team Preview Practice|Popular Sets|Events|How We Calculate","bad":["Archetypes out"],"reach":[],"hs":-15} | 1440: {"plates":"Speed Tiers|R`

### Flakes (failed once under load, passed when run alone)

- **EDIT-05** (WebKit A-team, first run only): `FAIL  EDIT-05  Stat points: live total, over-66 warning, Save stat points; Team Sheet shows the new stats  -> message doesn't show /That's 98 points; Champions allows 66/`. Alone: `behaviour: 138 pass, 1 FAIL …` (only HOME-09).
- **THEME-03** (WebKit D-meta-shell, first run only): `FAIL  THEME-03  Share image has its own Light/Dark choice (see WEEK-02)  -> no share image`. Alone: `behaviour: 117 pass, 0 FAIL, 41 known bugs, 1 fixed?, 7 skipped; 532s (webkit)`.

### Setup problem (fixed the setup only, not the code)

- **live-audits "Audits on today's data"**: `bash: line 6: : No such file or directory`. The step writes to `$GITHUB_OUTPUT`, which only exists on GitHub. Rerun with GITHUB_OUTPUT and GITHUB_STEP_SUMMARY pointing to temp files: exit 0, `bad=0` (suggest-audit, fields-audit and suggest-gaps all passed on the Nov 20 data).

### Worth a look (not failures)

- **"FIXED?" NAV-10** (D-meta-shell, Chromium and WebKit, every run): `FIXED? NAV-10  Keyboard focus stays inside an open Pokémon sheet  -> marked known ((b) the Pokémon sheet became a page …`. A listed known bug no longer shows; the known-bugs list may need updating. Not changed here.

## qcheck-all: the 34 known findings no longer seen

Listed by a temporary copy of qcheck-all.mjs that prints them (deleted afterwards). app/test/qcheck-known.json was NOT rewritten. Run: `qcheck-all: 27 pages + 11 views x 5 widths x 2 themes, 80 findings, 0 new; 1240s`.


- `calc | day 1280 | OVERLAP "Mega Charizard Y's" x "most used set"`
- `calc | day 1920 | OVERLAP "Mega Charizard Y's" x "most used set"`
- `calc | day 1920 | OVERLAP "Sneasler's set" x "most used set"`
- `calc | day 390 | SIZE 30.4px "%"`
- `calc | day 820 | OVERLAP "Mega Charizard Y's" x "most used set"`
- `calc | night 1280 | OVERLAP "Mega Charizard Y's" x "most used set"`
- `calc | night 1920 | OVERLAP "Mega Charizard Y's" x "most used set"`
- `calc | night 1920 | OVERLAP "Sneasler's set" x "most used set"`
- `calc | night 390 | SIZE 30.4px "%"`
- `calc | night 820 | OVERLAP "Mega Charizard Y's" x "most used set"`
- `gifts | day 1280 | OVERLAP "CONTENTS" x "100 Quick Coupons"`
- `gifts | day 1280 | OVERLAP "CONTENTS" x "Vivillon Trainer I"`
- `gifts | day 1920 | OVERLAP "CONTENTS" x "100 Quick Coupons"`
- `gifts | day 1920 | OVERLAP "CONTENTS" x "Vivillon Trainer I"`
- `gifts | day 390 | OVERLAP "CONTENTS" x "100 Quick Coupons"`
- `gifts | day 390 | OVERLAP "CONTENTS" x "Vivillon Trainer I"`
- `gifts | night 1280 | OVERLAP "CONTENTS" x "100 Quick Coupons"`
- `gifts | night 1280 | OVERLAP "CONTENTS" x "Vivillon Trainer I"`
- `gifts | night 1920 | OVERLAP "CONTENTS" x "100 Quick Coupons"`
- `gifts | night 1920 | OVERLAP "CONTENTS" x "Vivillon Trainer I"`
- `gifts | night 390 | OVERLAP "CONTENTS" x "100 Quick Coupons"`
- `gifts | night 390 | OVERLAP "CONTENTS" x "Vivillon Trainer I"`
- `news | day 1280 | OVERLAP "CAMPAIGN · NOV 25" x "A New Mystery Gift"`
- `news | day 1920 | OVERLAP "CAMPAIGN · NOV 25" x "A New Mystery Gift"`
- `news | day 820 | SIZE 37.0px "A New Mystery Gift"`
- `news | night 1280 | OVERLAP "CAMPAIGN · NOV 25" x "A New Mystery Gift"`
- `news | night 1920 | OVERLAP "CAMPAIGN · NOV 25" x "A New Mystery Gift"`
- `news | night 820 | SIZE 37.0px "A New Mystery Gift"`
- `types | day 320 | OVERLAP "What hits Mega Cha" x "hard."`
- `types | day 390 | OVERLAP "What hits Mega Cha" x "hard."`
- `types | day 820 | OVERLAP "What hits Mega Cha" x "hard."`
- `types | night 320 | OVERLAP "What hits Mega Cha" x "hard."`
- `types | night 390 | OVERLAP "What hits Mega Cha" x "hard."`
- `types | night 820 | OVERLAP "What hits Mega Cha" x "hard."`

## polish-check findings (report-only)

`polish check: spill 20, uneven 4, lone 36, lineh 1, glow 1, boxes 6, space 41; page errors 0; 152s`

```
  style light 390px · 130s
  style light 820px · 135s
  style light 1440px · 139s
  style dark 390px · 143s
  style dark 820px · 147s
  style dark 1440px · 152s
spill    sheet     li > button.mu-row.mu-nk "Mega Charizard Y Unfavou" +3px  @ 320
spill    sheet     div.row.ms-go > button.np-btn2.k-btn "Build Around It" +4px  @ 320
spill    sheet     div.row.ms-go > button.np-btn2.k-btn "Build Around It" +5px  @ 720
spill    sheet     div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +5px  @ 880
spill    sheet     div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +8px  @ 960
spill    sheet     div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +9px  @ 1040
spill    sheet     div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +10px  @ 1120
spill    sheet     div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +11px  @ 1200
spill    sheet     div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +13px  @ 1280
spill    sheet     div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +14px  @ 1360
spill    sheet     div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +15px  @ 1440-2560
spill    team      li > button.mu-row.mu-nk "Mega Charizard Y Unfavou" +3px  @ 320
spill    team      div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +5px  @ 880
spill    team      div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +8px  @ 960
spill    team      div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +9px  @ 1040
spill    team      div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +10px  @ 1120
spill    team      div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +11px  @ 1200
spill    team      div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +13px  @ 1280
spill    team      div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +14px  @ 1360
spill    team      div.mtf-head.tmk-head > div.mtf-score "94 Top tier Strength Sco" +15px  @ 1440-2560
uneven   sheet     div.mtf-head.tmk-head > p.mtf-acts: "Saved Teams 1 ›"×2 "More ⋯"×1 "Saved ✓"×1  @ 320
uneven   sheet     div.mtf-head.tmk-head > p.mtf-acts: "Why This Score? ›"×2 "Team Sheet ↗"×1 "Share as Image ›"×1  @ 400
uneven   team      div.mtf-head.tmk-head > p.mtf-acts: "Saved Teams 1 ›"×2 "More ⋯"×1 "Saved ✓"×1  @ 320
uneven   team      div.mtf-head.tmk-head > p.mtf-acts: "Why This Score? ›"×2 "Team Sheet ↗"×1 "Share as Image ›"×1  @ 400
lone     box       section.bx2.mb > div.mb-grid: 7 items, rows 3+2+2  @ 1280-2560
lone     guide     section.sg > div.row: 4 items, rows 2+1+1  @ 320
lone     guide     section.sg > div.row: 11 items, rows 3+3+3+2  @ 320
lone     guide     section.sg > div.row: 11 items, rows 3+1+5+2  @ 480
lone     guide     section.sg > div.swatches: 4 items, rows 3+1  @ 560-720
lone     guide     section.sg > div.row: 4 items, rows 3+1  @ 560-720
lone     guide     section.sg > div.swatches: 12 items, rows 5+5+2  @ 960-1040
lone     guide     section.sg > div.row: 11 items, rows 3+6+2  @ 1040
lone     guide     section.sg > div.row: 11 items, rows 3+7+1  @ 1120-1200
lone     guide     section.sg > div.swatches: 12 items, rows 7+5  @ 1360-1440
lone     guide     section.sg > div.swatches: 12 items, rows 8+4  @ 1520-1600
lone     guide     section.sg > div.swatches: 12 items, rows 9+3  @ 1680-1760
lone     guide     section.sg > div.swatches: 12 items, rows 10+2  @ 1840-1920
lone     guide     section.sg > div.swatches: 12 items, rows 11+1  @ 2000-2560
lone     sheet     div.mtf-head.tmk-head > nav.tm-jump.tmk-jump: 3 items, rows 2+1  @ 320
lone     sheet     div.mtf-inf > p.mtf-do: 5 items, rows 2+2+1  @ 320
lone     sheet     #tm-mu.tm-sec.tm-mus > div.tm-legend: 3 items, rows 2+1  @ 320
lone     sheet     li > button.mu-row.mu-nk: 4 items, rows 2+1+1  @ 320-960
lone     sheet     li > button.mu-row.mu-nk: 3 items, rows 2+1  @ 320-2560
lone     sheet     div.ms-tyr > div: 3 items, rows 2+1  @ 320,720-800,1200-2560
lone     sheet     div.ms-sp > div.main: 3 items, rows 2+1  @ 320-2560
lone     sheet     div.ms-sp > div: 3 items, rows 2+1  @ 320-2560
lone     sheet     div.mtf-inf > p.mtf-do: 5 items, rows 4+1  @ 400-480,960-1280
lone     sheet     div.mtf-head.tmk-head > div.k-sent.u: 4 items, rows 2+1+1  @ 480-560,720
lone     sheet     div.mtf-head.tmk-head > p.mtf-acts: 6 items, rows 4+2  @ 720
lone     sheet     div.mtf-head.tmk-head > p.mtf-acts: 6 items, rows 5+1  @ 800-880
lone     sheet     div.np-sheet > div.ms2: 5 items, rows 2+1+1+1  @ 1040-2560
lone     team      div.mtf-head.tmk-head > nav.tm-jump.tmk-jump: 3 items, rows 2+1  @ 320
lone     team      div.mtf-inf > p.mtf-do: 5 items, rows 2+2+1  @ 320
lone     team      #tm-mu.tm-sec.tm-mus > div.tm-legend: 3 items, rows 2+1  @ 320
lone     team      li > button.mu-row.mu-nk: 4 items, rows 2+1+1  @ 320-960
lone     team      li > button.mu-row.mu-nk: 3 items, rows 2+1  @ 320-2560
lone     team      div.mtf-inf > p.mtf-do: 5 items, rows 4+1  @ 400-480,960-1280
lone     team      div.mtf-head.tmk-head > div.k-sent.u: 4 items, rows 2+1+1  @ 480-560,720
lone     team      div.mtf-head.tmk-head > p.mtf-acts: 6 items, rows 4+2  @ 720
lone     team      div.mtf-head.tmk-head > p.mtf-acts: 6 items, rows 5+1  @ 800-880
lineh    sheet     1.3 (span > small)  @ 390,820,1440,390d,820d,1440d
glow     guide     div.w > span "Top tier"  @ 390d,820d,1440d
boxes    sheet     button.k-move > span.k-mt (4 shades)  @ 390,820,1440
boxes    sheet     li > button.k-move (4 shades)  @ 390d,820d,1440d
boxes    sheet     button.k-move > span.k-mt (5 shades)  @ 390d,820d,1440d
boxes    team      button.k-move > span.k-mt (4 shades)  @ 390,820,1440
boxes    team      li > button.k-move (4 shades)  @ 390d,820d,1440d
boxes    team      button.k-move > span.k-mt (5 shades)  @ 390d,820d,1440d
space    box       57.2px (header.np-head > div.tools marginLeft)  @ 390,390d
space    box       24.1px (header.np-head > nav.np-nav marginLeft)  @ 820,820d
space    box       118.8px (header.np-head > nav.np-nav marginLeft)  @ 1440,1440d
space    compare   57.2px (header.np-head > div.tools marginLeft)  @ 390,390d
space    compare   17.2px (div.np-mon > div.st marginLeft)  @ 390,390d
space    compare   24.1px (header.np-head > nav.np-nav marginLeft)  @ 820,820d
space    compare   19.8px (div.np-mon > div.st marginLeft)  @ 820,820d
space    compare   118.8px (header.np-head > nav.np-nav marginLeft)  @ 1440,1440d
space    compare   27.4px (div.np-mon > div.st marginLeft)  @ 1440,1440d
space    guide     57.2px (header.np-head > div.tools marginLeft)  @ 390,390d
space    guide     14.5px (div.np-mon.sel > div.st marginLeft)  @ 390,390d
space    guide     24.1px (header.np-head > nav.np-nav marginLeft)  @ 820,820d
space    guide     78.8px (div.np-dock > a.np-btn2 marginLeft)  @ 820,820d
space    guide     118.8px (header.np-head > nav.np-nav marginLeft)  @ 1440,1440d
space    guide     15px (div.np-mon.sel > div.st marginLeft)  @ 1440,1440d
space    guide     602.8px (div.np-dock > a.np-btn2 marginLeft)  @ 1440,1440d
space    sheet     57.2px (header.np-head > div.tools marginLeft)  @ 390,390d
space    sheet     11px (p.tm-sub > button.sg2-tip marginTop)  @ 390,820,1440,390d,820d,1440d
space    sheet     10px (p.tm-sub > button.sg2-tip marginRight)  @ 390,820,1440,390d,820d,1440d
space    sheet     24.1px (header.np-head > nav.np-nav marginLeft)  @ 820,820d
space    sheet     277.8px (div.mtf-bar.mtf-nav > button.mtf-step marginLeft)  @ 820
space    sheet     118.8px (header.np-head > nav.np-nav marginLeft)  @ 1440,1440d
space    sheet     92.5px (#main.np-main > section.tm-hero.mt paddingLeft)  @ 1440,1440d
space    sheet     8.4px (h1.tm-name.k-h1 > span.mtf-smp marginLeft)  @ 1440,1440d
space    sheet     29.1px (div.mtf-bar.mtf-nav > button.mtf-step marginLeft)  @ 1440
space    sheet     278.8px (div.mtf-bar.mtf-nav > button.mtf-step marginLeft)  @ 820d
space    sheet     30.1px (div.mtf-bar.mtf-nav > button.mtf-step marginLeft)  @ 1440d
space    team      57.2px (header.np-head > div.tools marginLeft)  @ 390,390d
space    team      11px (p.tm-sub > button.sg2-tip marginTop)  @ 390,820,1440,390d,820d,1440d
space    team      10px (p.tm-sub > button.sg2-tip marginRight)  @ 390,820,1440,390d,820d,1440d
space    team      24.1px (header.np-head > nav.np-nav marginLeft)  @ 820,820d
space    team      277.8px (div.mtf-bar.mtf-nav > button.mtf-step marginLeft)  @ 820
space    team      118.8px (header.np-head > nav.np-nav marginLeft)  @ 1440,1440d
space    team      92.5px (#main.np-main > section.tm-hero.mt paddingLeft)  @ 1440,1440d
space    team      8.4px (h1.tm-name.k-h1 > span.mtf-smp marginLeft)  @ 1440,1440d
space    team      29.1px (div.mtf-bar.mtf-nav > button.mtf-step marginLeft)  @ 1440
space    team      278.8px (div.mtf-bar.mtf-nav > button.mtf-step marginLeft)  @ 820d
space    team      30.1px (div.mtf-bar.mtf-nav > button.mtf-step marginLeft)  @ 1440d
space    team-empty 57.2px (header.np-head > div.tools marginLeft)  @ 390,390d
space    team-empty 24.1px (header.np-head > nav.np-nav marginLeft)  @ 820,820d
space    team-empty 118.8px (header.np-head > nav.np-nav marginLeft)  @ 1440,1440d
```

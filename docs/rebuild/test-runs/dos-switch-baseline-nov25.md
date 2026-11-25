# Switch baseline: every GitHub check on the redesign, frozen data (Dos, Sim's PC, Wed Nov 25)

- Tested: claude/design6 at **8ded70c6** (checked: `git log --oneline -1` after `git checkout --detach origin/claude/design6`).
- Data: frozen `out/` from 0c992f6977bc1cecc4e03eb269969a82b99681cf (the workflow's TEST_DATA).
- Started 2026-11-25 6:37 AM Eastern (11:37 UTC); took 222 min. Windows 11, Node 22.23.4, Playwright 1.49.1 (WebKit job: 1.63.0, as the workflow installs).
- Jobs (the ones named "(frozen data)" or "new site" in .github/workflows/test.yml): behaviour-v2:A-team, behaviour-v2:B-build, behaviour-v2:C-battle, behaviour-v2:D-meta-shell, behaviour-webkit, quality-v2, test, v2-checks, v2-checks-2, v2-minors:main1, v2-minors:main2, v2-minors:groups.
- Skipped as instructed: `npm ci`, `playwright install`, `sleep` lines. Setup done once instead: `npm ci`; WebKit job: `npm install --no-save playwright@1.63.0`, then 1.49.1 restored.
- Every step was run even after a failure (on GitHub, steps without `if: !cancelled()` would be skipped after one).
- PASS/FAIL = the command's exit code (0 = PASS). "Last line" = its last non-empty output line.

## Totals: 116 pass / 4 fail (120 tests; builds and setup listed separately below)

## Failures

### #23 quality-v2: `PAGE=app/dist/v2.html node app/test/qcheck-all.mjs`
- Last line: `qcheck-all: 28 pages + 11 views x 5 widths x 2 themes, 73 findings, 2 new; 1277s`
- `  NEW   home | day 1280 | SIZE 36.1px "/100"`
- `  NEW   home | night 1280 | SIZE 36.1px "/100"`

### #69 v2-checks: `PAGE=app/dist/v2.html node app/test/v2-q33.mjs`
- Last line: `v2-q33: 2 failed`
- `  FAIL  light 320: the big ticket starts inside the first screen (top 787 of 844, with at least 60px of it showing; 120 failed on the frozen CI data at 320 dark: 76px, was 1590 before Q33)`
- `  FAIL  dark 320: the big ticket starts inside the first screen (top 787 of 844, with at least 60px of it showing; 120 failed on the frozen CI data at 320 dark: 76px, was 1590 before Q33)`

### #130 v2-minors:main2: `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs`
- Last line: `v2-minors (main2):6 failed`
- `  FAIL  Item pictures in Search: each Item hit for "life", "sitrus", "charizardite", "choice", "orb" shows its real picture (loaded) when it has one, else the drawing, decorative; Moves and Abilities none; every row 56px like the rest (Life Dew none, Life Orb img-dead, Leech Life none, Sitrus Berry `
- `  FAIL  Item pictures in Search (stand-ins, the check can fail): a picture pointed at a missing file reads "img-dead" (want img-dead), a working one "img-dead" (want img, row 56px), an item with neither picture nor drawing "none" (want none, row 56px; want 56)`
- `  FAIL  Item pictures (real): every one of the 166 pictures in ITEM_IMG loads from the art folder: missing Abomasite, Abomasite (small), Absolite, Absolite (small), Absolite Z, Absolite Z (small)`
- `  FAIL  Item pictures (real): an item with a picture (Life Orb, Focus Sash, Abomasite) shows an <img> that loaded (naturalWidth > 0) inside .evbag, no drawing: Life Orb {"bag":1,"img":true,"w":0,"svg":false,"alt":"","lazy":"lazy","size":"62x62","tf":"none","bw":62} | Focus Sash {"bag":1,"img":true,"`
- `  FAIL  Item pictures (stand-in, V2.itemImg pointed at a sprite file): the bag shows the <img>, loaded, alt="" (decorative), 62x62, lazy, not slanted, drawn 62px wide at 1440 ({"bag":1,"img":true,"w":0,"svg":false,"alt":"","lazy":"lazy","size":"62x62","tf":"none","bw":62})`
- Re-run after a setup fix (setup: Windows refused the test's art/ symlink (EPERM, Developer Mode off), so every picture was missing; re-run with directory junctions app/dist/art and art-s): **PASS**, last line `v2-minors (main2):all passed`

### #132 v2-minors:groups: `PART=groups PAGE=app/dist/v2.html node app/test/v2-minors.mjs`
- Last line: `v2-minors (groups):3 failed`
- `  FAIL  HQ Q13f (Sim: B): the hero sprites never cover the tagline's words, 320-2560 and short phone windows (0.15% of its pixels at most: a head's edge touching the line): 320: 14 hero pictures didn't load | 360: 14 hero pictures didn't load | 360: 0.2% of 32253 tagline pixels covered | 390: 14 her`
- `  FAIL  HQ Q7a (Sim: B): the hero crowd draws the 35 nearest from their own files and the rest from at most 4 sprite sheets (every Pokémon drawn, 80 picture files at most on Home): 1440: {"crowd":333,"herd":345,"sheet":298,"img":35,"near0":12,"nearN":46,"far":47,"sheets":4,"loaded":false,"bad":0,"fi`
- `  FAIL  WK-1 (WebKit pair): the stamps' perforated edge, read off the pixels on #gifts 390 / 1440 and Home's post band 1440: no paper outside the holes' line, holes along each edge, solid middle, bitten corners (home 820 159x218: left: paper starts 0px in (want 6: nothing in the outer band), left: h`
- Re-run after a setup fix (same setup cause): **FAIL**, last line `v2-minors (groups):1 failed (WK-1 stamps' perforated edge; the two hero-picture checks now pass)`

## Notes (Dos)

- **#23 qcheck-all, Home "/100":** checked in the CSS: `.sds-of100` is `font-size: var(--d-sdof)` = `clamp(28px, 15cqi, 56px)`, so its size follows the receipt's width (36.1px = a ~241px receipt at 1280). Not checked: whether GitHub's Linux run gives the same width (Windows fonts or a scrollbar could change it), or whether recent Home hero changes caused it. Not a timeout, so not re-run.
- **#69 v2-q33, Events at 320:** the big ticket starts at 787 of 844, 57px showing where the test wants 60 (3px short), light and dark. Not checked: whether Windows text wrapping at 320 explains the 3px. Not a timeout, so not re-run.
- **#130 / #132 v2-minors:** checked in the logs: the test links app/dist/art and art-s to app/src/v2 with a symlink; Windows refused it (`EPERM: operation not permitted`, Developer Mode off), so every sprite and item picture was a broken image. Setup fix: directory junctions (`mklink /J`, no admin needed), then both parts re-run once: main2 all passed; groups 1 failed (WK-1 below). On GitHub's Linux runners the symlink works, so this cause is PC-only. main1 passed despite the same failed link.
- **#132 WK-1 (stamps' perforated edge, read from pixels):** still fails after the fix ("paper starts 0px in"). Not checked: whether it is Windows rendering or a real fault.
- `gh` is not installed on this PC, so GitHub's own result for 8ded70c6 was not compared.

## Every step

| # | Job | Command | Result | Time | Last line |
|---|---|---|---|---|---|
| 1 | behaviour-v2:A-team | `node app/build.mjs --v2 --art=../src/v2/art/` | build PASS | 6s | `built dist/v2.html (3018 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 2 | behaviour-v2:A-team | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` |  PASS | 809s | `behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 808s  (adapter v2)` |
| 3 | behaviour-v2:A-team | `PAGE=app/dist/v2.html node app/test/v2-overlap.mjs` |  PASS | 646s | `v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 645s)` |
| 4 | behaviour-v2:A-team | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` |  PASS | 15s | `tap-once: all pass` |
| 5 | behaviour-v2:B-build | `node app/build.mjs --v2 --art=../src/v2/art/` | build PASS | 5s | `built dist/v2.html (3018 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 6 | behaviour-v2:B-build | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs B-build` |  PASS | 526s | `behaviour: 77 pass, 0 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 525s  (adapter v2)` |
| 7 | behaviour-v2:B-build | `PAGE=app/dist/v2.html node app/test/v2-overlap.mjs` |  PASS | 644s | `v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 643s)` |
| 8 | behaviour-v2:B-build | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` |  PASS | 16s | `tap-once: all pass` |
| 9 | behaviour-v2:C-battle | `node app/build.mjs --v2 --art=../src/v2/art/` | build PASS | 6s | `built dist/v2.html (3018 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 10 | behaviour-v2:C-battle | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs C-battle` |  PASS | 427s | `behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 426s  (adapter v2)` |
| 11 | behaviour-v2:C-battle | `PAGE=app/dist/v2.html node app/test/v2-overlap.mjs` |  PASS | 642s | `v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 641s)` |
| 12 | behaviour-v2:C-battle | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` |  PASS | 15s | `tap-once: all pass` |
| 13 | behaviour-v2:D-meta-shell | `node app/build.mjs --v2 --art=../src/v2/art/` | build PASS | 5s | `built dist/v2.html (3018 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 14 | behaviour-v2:D-meta-shell | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs D-meta-shell` |  PASS | 475s | `behaviour: 118 pass, 0 FAIL, 41 known bugs, 0 fixed?, 7 skipped; 474s  (adapter v2)` |
| 15 | behaviour-v2:D-meta-shell | `PAGE=app/dist/v2.html node app/test/v2-overlap.mjs` |  PASS | 643s | `v2-overlap: 0 findings, 0 known, 0 new (27 pages x 4 widths x 2 themes; 642s)` |
| 16 | behaviour-v2:D-meta-shell | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` |  PASS | 15s | `tap-once: all pass` |
| 17 | behaviour-webkit (setup) | `npm install --no-save playwright@1.63.0` | setup PASS | 4s | `Run 'npm audit' for details.` |
| 18 | behaviour-webkit | `node app/build.mjs --v2 --art=../src/v2/art/` | build PASS | 6s | `built dist/v2.html (3018 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 19 | behaviour-webkit | `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` |  PASS | 956s | `behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 956s  (webkit, adapter v2)` |
| 20 | behaviour-webkit | `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/tap-once.mjs` |  PASS | 18s | `tap-once: all pass` |
| 21 | behaviour-webkit (setup restore) | `npm install --no-save playwright@1.49.1` | setup PASS | 3s | `Run 'npm audit' for details.` |
| 22 | quality-v2 | `node app/build.mjs --v2 --preview-data` | build PASS | 5s | `built dist/v2.html (4257 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 23 | quality-v2 | `PAGE=app/dist/v2.html node app/test/qcheck-all.mjs` |  **FAIL** | 1281s | `qcheck-all: 28 pages + 11 views x 5 widths x 2 themes, 73 findings, 2 new; 1277s` |
| 24 | test | `cd node_modules/pokemon-showdown && node build` | build PASS | 4s | `config.js does not exist. Creating one with default settings...` |
| 25 | test | `node app/test/run.mjs` |  PASS | 184s | `ALL PASSED` |
| 26 | test | `node experiments/replays-test.mjs` |  PASS | 0s | `ok   teams with an unknown Pokémon are skipped` |
| 27 | test | `node experiments/tour-modes-test.mjs` |  PASS | 0s | `tour-modes: all passed` |
| 28 | test | `node experiments/post-data-test.mjs` |  PASS | 0s | `ALL PASS` |
| 29 | test | `node experiments/post-news-test.mjs` |  PASS | 1s | `ALL PASS` |
| 30 | test | `node experiments/speed-check.mjs` |  PASS | 6s | `reference: Sneasler Jolly 32 Spe = 189; with Unburden in item consumed = 378` |
| 31 | test | `node experiments/calc-check.mjs 2000` |  PASS | 10s | `exact or explained: 99.99%` |
| 32 | test | `node experiments/legality-check.mjs` |  PASS | 5s | `Mega stones per official team: {"1":110,"2":402}` |
| 33 | test | `node experiments/threat-check.mjs` |  PASS | 6s | `PASS` |
| 34 | test | `node experiments/fields-audit.mjs` |  PASS | 1s | `PASS: every VGC-relevant field is in the data and used by the engine` |
| 35 | test | `node experiments/suggest-gaps.mjs` |  PASS | 12s | `ALL PASSED` |
| 36 | test | `node experiments/suggest-audit.mjs 30 5` |  PASS | 38s | `SUGGESTIONS AUDIT PASSED` |
| 37 | test | `node experiments/build-logic.mjs` |  PASS | 20s | `ALL PASSED` |
| 38 | test | `node experiments/lead-logic.mjs` |  PASS | 6s | `ALL PASSED` |
| 39 | test | `node experiments/sync-logic.mjs` |  PASS | 26s | `ALL PASSED` |
| 40 | test | `node experiments/typing-sync.mjs` |  PASS | 14s | `PASS` |
| 41 | test | `node experiments/sync-quiet.mjs` |  PASS | 29s | `ALL PASSED` |
| 42 | test | `node experiments/golden.mjs` |  PASS | 67s | `10 of 10 known-answer cases pass` |
| 43 | test | `node experiments/same-grade.mjs` |  PASS | 82s | `ALL PASSED` |
| 44 | test | `node experiments/plan-cache-test.mjs` |  PASS | 18s | `ALL PASSED` |
| 45 | v2-checks | `node app/test/v2-guard.mjs` |  PASS | 4s | `v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)` |
| 46 | v2-checks | `node app/test/no-names.mjs && node app/build.mjs --v2 --preview-data && node app/test/no-names.mjs app/dist/v2.html` |  PASS | 6s | `no-names: 2182 player fields checked, 0 not an ID or stand-in` |
| 47 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-caches.mjs` |  PASS | 4s | `v2-caches: grade before 93.6, cached after 93.4, fresh after 93.4 -> ok; Test Run rows ok (spread change did change them)` |
| 48 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-folds.mjs` |  PASS | 15s | `v2-folds: all passed` |
| 49 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-partial.mjs` |  PASS | 7s | `v2-partial: all passed` |
| 50 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-redraws.mjs` |  PASS | 8s | `v2-redraws: all passed` |
| 51 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-trwarm.mjs` |  PASS | 21s | `v2-trwarm: all passed` |
| 52 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-back.mjs` |  PASS | 22s | `v2-back: all passed` |
| 53 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-toast.mjs` |  PASS | 43s | `v2-toast: all passed` |
| 54 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-rmjump.mjs` |  PASS | 40s | `v2-rmjump: all passed` |
| 55 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-clear.mjs` |  PASS | 32s | `v2-clear: all passed` |
| 56 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-formerr.mjs` |  PASS | 28s | `v2-formerr: all passed` |
| 57 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-pksrc.mjs` |  PASS | 14s | `v2-pksrc: all passed` |
| 58 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-trkfit.mjs` |  PASS | 66s | `v2-trkfit: all passed` |
| 59 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-usagepicks.mjs` |  PASS | 51s | `v2-usagepicks: all passed` |
| 60 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-pbppair.mjs` |  PASS | 120s | `v2-pbppair: all passed` |
| 61 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q21.mjs` |  PASS | 38s | `v2-q21: ALL PASSED` |
| 62 | v2-checks | `PAGE=app/dist/v2.html node experiments/commander-test.mjs` |  PASS | 4s | `commander-test: all passed` |
| 63 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q25.mjs` |  PASS | 82s | `v2-q25: all passed` |
| 64 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q26.mjs` |  PASS | 67s | `v2-q26: all passed` |
| 65 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q24.mjs` |  PASS | 46s | `v2-q24: all passed` |
| 66 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-w5.mjs` |  PASS | 9s | `v2-w5: all passed` |
| 67 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q31.mjs` |  PASS | 70s | `v2-q31: all passed` |
| 68 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q32.mjs` |  PASS | 65s | `v2-q32: all passed` |
| 69 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q33.mjs` |  **FAIL** | 127s | `v2-q33: 2 failed` |
| 70 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-arena.mjs` |  PASS | 316s | `all Damage Calc (Plot the hit) checks pass` |
| 71 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q41.mjs` |  PASS | 58s | `v2-q41: all passed` |
| 72 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q45.mjs` |  PASS | 57s | `v2-q45: all passed` |
| 73 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q44.mjs` |  PASS | 63s | `v2-q44: all passed` |
| 74 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q42.mjs` |  PASS | 66s | `v2-q42: all passed` |
| 75 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q43.mjs` |  PASS | 91s | `v2-q43: all passed` |
| 76 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q46.mjs` |  PASS | 47s | `v2-q46: all passed` |
| 77 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q47.mjs` |  PASS | 147s | `v2-q47: all passed` |
| 78 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-kob.mjs` |  PASS | 78s | `v2-kob: all passed` |
| 79 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q52.mjs` |  PASS | 85s | `v2-q52: all passed` |
| 80 | v2-checks | `PAGE=app/dist/v2.html node app/test/v2-q59.mjs` |  PASS | 159s | `v2-q59: all passed` |
| 81 | v2-checks-2 | `node app/test/v2-guard.mjs` |  PASS | 4s | `v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)` |
| 82 | v2-checks-2 | `node app/test/no-names.mjs && node app/build.mjs --v2 --preview-data && node app/test/no-names.mjs app/dist/v2.html` |  PASS | 6s | `no-names: 2182 player fields checked, 0 not an ID or stand-in` |
| 83 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q60.mjs` |  PASS | 119s | `v2-q60: all passed` |
| 84 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-swapname.mjs` |  PASS | 28s | `v2-swapname: all passed` |
| 85 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q68.mjs` |  PASS | 44s | `v2-q68: all passed` |
| 86 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-s1.mjs` |  PASS | 39s | `v2-s1: all passed` |
| 87 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-s26.mjs` |  PASS | 9s | `v2-s26: all passed` |
| 88 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-s17.mjs` |  PASS | 40s | `v2-s17: all passed` |
| 89 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-s13.mjs` |  PASS | 20s | `v2-s13: all passed` |
| 90 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q69.mjs` |  PASS | 114s | `v2-q69: all passed` |
| 91 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q78.mjs` |  PASS | 48s | `v2-q78: all passed` |
| 92 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q72.mjs` |  PASS | 269s | `v2-q72: all passed` |
| 93 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-s16.mjs` |  PASS | 17s | `v2-s16: all passed` |
| 94 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-s2.mjs` |  PASS | 32s | `v2-s2: all passed` |
| 95 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-s33.mjs` |  PASS | 72s | `v2-s33: all passed` |
| 96 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-wnew.mjs` |  PASS | 27s | `v2-wnew: all passed` |
| 97 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q83.mjs` |  PASS | 97s | `v2-q83: all passed` |
| 98 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q84.mjs` |  PASS | 176s | `v2-q84: all passed` |
| 99 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q16.mjs` |  PASS | 24s | `v2-q16: all passed` |
| 100 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q17.mjs` |  PASS | 43s | `v2-q17: all passed` |
| 101 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q22.mjs` |  PASS | 43s | `v2-q22: all passed` |
| 102 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q19.mjs` |  PASS | 57s | `v2-q19: all passed` |
| 103 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q18.mjs` |  PASS | 85s | `v2-q18: all passed` |
| 104 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q14.mjs` |  PASS | 44s | `v2-q14: all passed` |
| 105 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-q23.mjs` |  PASS | 30s | `v2-q23: all passed` |
| 106 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-t1rules.mjs` |  PASS | 6s | `v2-t1rules: all passed` |
| 107 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-cxev.mjs` |  PASS | 18s | `v2-cxev: all passed` |
| 108 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-oddaddr.mjs` |  PASS | 6s | `v2-oddaddr: all passed` |
| 109 | v2-checks-2 | `LT_ALERT=1 PAGE=app/dist/v2.html node app/test/v2-longtask.mjs   # the build-then-draw order blocks; the timing part only alerts (shared runners)` |  PASS | 23s | `v2-longtask: all passed` |
| 110 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-post-doc.mjs` |  PASS | 30s | `ALL PASS` |
| 111 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-unbounded.mjs` |  PASS | 63s | `v2-unbounded: none outside the named exception across 29 pages` |
| 112 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-sixof.mjs` |  PASS | 4s | `v2-sixof: all passed` |
| 113 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-shown-score.mjs` |  PASS | 4s | `v2-shown-score: all passed` |
| 114 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-ckwin.mjs` |  PASS | 8s | `v2-ckwin: all passed` |
| 115 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/v2-paste.mjs` |  PASS | 4s | `v2-paste: all passed` |
| 116 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/share-fz.mjs` |  PASS | 4s | `share-fz: all passed` |
| 117 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/data-swap.mjs` |  PASS | 15s | `data-swap: all passed` |
| 118 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/forms-contrast.mjs` |  PASS | 30s | `forms-contrast: all passed` |
| 119 | v2-checks-2 | `PAGE=app/dist/v2.html node app/test/tap-size.mjs` |  PASS | 90s | `tap-size: all passed` |
| 120 | v2-checks-2 | `node app/test/tokens-doc.mjs` |  PASS | 0s | `tokens-doc: up to date (696 tokens)` |
| 121 | v2-checks-2 | `node app/test/perf-docs.mjs` |  PASS | 1s | `perf-docs: behaviour fixture "meta/perf" has 7 of 7 perf.json parts; built doc has 7` |
| 122 | v2-checks-2 | `node app/test/test-ids.mjs` |  PASS | 1s | `test-ids: 487 tests, every ID unique inside its group` |
| 123 | v2-checks-2 | `node app/build.mjs --v2 --preview-data --split && node app/test/v2-split.mjs` |  PASS | 30s | `v2-split:all passed` |
| 124 | v2-checks-2 | `node app/test/v2-public.mjs   # last of the v2 steps: it leaves dist/v2.html as the public build` |  PASS | 12s | `v2-public: all passed` |
| 125 | v2-checks-2 | `node app/build.mjs --v2 && node experiments/v2-words.mjs` |  PASS | 60s | `v2 words: 34 screens read; 0 places with "Ready for" or "% ready" (none)` |
| 126 | v2-checks-2 | `node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-saved.mjs` |  PASS | 28s | `v2-saved: all passed` |
| 127 | v2-minors:main1 | `node app/build.mjs --v2 --preview-data` | build PASS | 5s | `built dist/v2.html (4257 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 128 | v2-minors:main1 | `PART=main1 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` |  PASS | 695s | `v2-minors (main1):all passed` |
| 129 | v2-minors:main2 | `node app/build.mjs --v2 --preview-data` | build PASS | 5s | `built dist/v2.html (4257 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 130 | v2-minors:main2 | `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs` |  **FAIL** | 412s | `v2-minors (main2):6 failed` |
| 131 | v2-minors:groups | `node app/build.mjs --v2 --preview-data` | build PASS | 5s | `built dist/v2.html (4257 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)` |
| 132 | v2-minors:groups | `PART=groups PAGE=app/dist/v2.html node app/test/v2-minors.mjs` |  **FAIL** | 445s | `v2-minors (groups):3 failed` |

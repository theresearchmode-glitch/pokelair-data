# PC run Nov 22: page lengths + WebKit behaviour

Brief: docs/rebuild/test-runs/pc-nov22-lengths-webkit.md. Run on Sim's Windows PC. Branch pc-run was made from origin/claude/design6 at 9c478049.
Only setup was touched. No site code or tests were changed.

## Result line for each step

1. Checkout: `HEAD is now at 9c478049 Helpers ended (direction pictures delivered)`
2. Installs. `npm ci` exit 0; `npm install --no-save playwright@1.63.0` exit 0; `npx playwright install webkit chromium` exit 0. Last download line: `Chrome Headless Shell 153.0.8010.12 (playwright chromium-headless-shell v1243) downloaded`.
3. Frozen data: `git checkout 0c992f69 -- out/` exit 0 (out/ is not committed).
4. Page lengths now:
   - Build: `built dist/v2.html (3977 KB; 22 CSS layers, 7 data files, 54 scripts, 62 shared logic files)`
   - Measure: `wrote docs/rebuild/test-runs/pc-nov22/lengths-now.json`
5. Page lengths before the reskin (app/src from 4f7220bb):
   - Build: `built dist/v2.html (3948 KB; ...)`
   - Measure: `wrote docs/rebuild/test-runs/pc-nov22/lengths-before.json`
   - app/src was restored from pc-run (exit 0).
6. WebKit behaviour. First the build without preview data: `built dist/v2.html (2738 KB; ...)`. Then:
   - A-team: `behaviour: 138 pass, 1 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 1346s  (webkit, adapter v2)`
   - B-build: `behaviour: 76 pass, 1 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 912s  (webkit, adapter v2)`
   - C-battle: `behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 474s  (webkit, adapter v2)`
   - D-meta-shell: `behaviour: 116 pass, 1 FAIL, 42 known bugs, 0 fixed?, 7 skipped; 547s  (webkit, adapter v2)`

The four groups ran in parallel. A-team and B-build were cut off the first time: my wait timed out after 570s and closed the shell. Both were re-run to the end, and the files hold the full re-run output. A-team's TEAM-07 failure was the same on both runs.

## Failures (WebKit only, full output in webkit-<group>.txt)

- **TEAM-07** (A-team). Phone jump bar: "Suggestions" did not scroll its section to the top of the screen. `Suggestions not scrolled to the top of the screen: {"top":835,"vh":900,"shown":true}`
- **COV-03** (B-build). Suggest from My box / Whole roster: `Whole roster picks: every card is from the box`. With Whole roster chosen, every pick still came from the box.
- **NAV-03v** (D-meta-shell). Header Search: `Tab left Search after 1 presses`. Focus is not kept inside the open Search.

## Page lengths: before the reskin -> now (screens tall)

Only pages that changed by 0.1 screens or more at some width. Every page is in the JSON files.

| Page | 390 | 1440 | 1920 |
|---|---|---|---|
| team | 3.13 -> 4.65 | 2.68 -> 3.87 | 2.16 -> 3.22 |
| pokemon=Garchomp | 4.90 -> 6.30 | 3.39 -> 5.20 | 2.82 -> 4.20 |
| speed | 3.52 -> 3.31 | 2.09 -> 4.03 | 1.62 -> 3.31 |
| gauntlet | 3.11 -> 3.11 | 2.06 -> 3.52 | 1.59 -> 2.94 |
| build | 3.64 -> 3.61 | 2.48 -> 2.82 | 1.96 -> 2.27 |
| calc | 3.26 -> 3.40 | 2.55 -> 2.83 | 2.13 -> 2.33 |
| practice | 1.94 -> 1.91 | 1.21 -> 1.40 | 1.00 -> 1.14 |
| meta | 3.47 -> 3.64 | 3.33 -> 3.47 | 2.70 -> 2.81 |
| compare | 1.57 -> 1.66 | 1.02 -> 1.18 | 1.00 -> 1.00 |

What it means: the reskin made Team, the Pokémon page, Speed and Test run much longer on desktop. Speed and Test run are nearly twice as long at 1440. On phones only Team and the Pokémon page grew. Every other page stayed within 0.1 screens.

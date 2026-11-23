# Safari check on Playwright 1.63's WebKit (alt/safari2)

Run on Sim's second account. Clock: time: 8:28 PM (8:28:05)  date: Sun Nov 22, 2026 (docs/rebuild/now.sh).
Look-only: no site code or tests changed, nothing published.

## Set-up (checked)
- Code: claude/design6 at 7cca83f1 (branch safari2). Test data: out/ from 0c992f69 (frozen; not committed).
- `npm ci` deps (node_modules copied from an `npm ci` of the same package-lock.json), then `npm install --no-save playwright@1.63.0` → `1.63.0`.
- `npx playwright install webkit` first refused: "Host system is missing dependencies ... apt-get install libgtk-4-1". Setup fix only: `apt-get install -y libgtk-4-1`. Then WebKit launches: `webkit 26.6` (browser.version()).
- Build: `node app/build.mjs --v2 --art=../src/v2/art/` → `built dist/v2.html (2890 KB; 24 CSS layers, 8 data files, 55 scripts, 62 shared logic files)`.
- Each test run alone, 3 times: `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 FAILSHOT=docs/rebuild/test-runs/safari2/fail/run<N>-<group> node app/test/behaviour/run.mjs <group> --only=<group>:<id>`.
  Two small changes from the brief, both so nothing overwrites: FAILSHOT has one folder per run and group (X-04 exists in B-build and C-battle, and runs 2-3 would overwrite run 1); `--only=<group>:<id>` (run.mjs's own form for an ID used in two groups).

## Results (exact lines)

### A-team SUG-08
```
run1   pass  SUG-08  "Nothing to fix" card with Battle and Sets on a complete team
run1 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 15s  (webkit, adapter v2)
run2   pass  SUG-08  "Nothing to fix" card with Battle and Sets on a complete team
run2 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 10s  (webkit, adapter v2)
run3   pass  SUG-08  "Nothing to fix" card with Battle and Sets on a complete team
run3 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 10s  (webkit, adapter v2)
```

### A-team MU-04
```
run1   pass  MU-04  All 30: "Threat preparation" groups; a threat opens to its calc reasons; Biggest threats list
run1 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 7s  (webkit, adapter v2)
run2   pass  MU-04  All 30: "Threat preparation" groups; a threat opens to its calc reasons; Biggest threats list
run2 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 8s  (webkit, adapter v2)
run3   pass  MU-04  All 30: "Threat preparation" groups; a threat opens to its calc reasons; Biggest threats list
run3 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 6s  (webkit, adapter v2)
```

### B-build X-04
```
run1   pass  X-04  Two/three-choice switches are sliders: the circle slides to the new choice, buttons stay readable
run1 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 4s  (webkit, adapter v2)
run2   pass  X-04  Two/three-choice switches are sliders: the circle slides to the new choice, buttons stay readable
run2 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 4s  (webkit, adapter v2)
run3   pass  X-04  Two/three-choice switches are sliders: the circle slides to the new choice, buttons stay readable
run3 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 4s  (webkit, adapter v2)
```

### B-build AUTO-04
```
run1   pass  AUTO-04  Megas on team: 0 rebuilds a no-Mega team with the warning toast; one value shared on all pages
run1 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 14s  (webkit, adapter v2)
run2   pass  AUTO-04  Megas on team: 0 rebuilds a no-Mega team with the warning toast; one value shared on all pages
run2 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 17s  (webkit, adapter v2)
run3   pass  AUTO-04  Megas on team: 0 rebuilds a no-Mega team with the warning toast; one value shared on all pages
run3 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 13s  (webkit, adapter v2)
```

### B-build CORES-09
```
run1   pass  CORES-09  Teams with it opens Winning teams filtered by the core
run1 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 5s  (webkit, adapter v2)
run2   pass  CORES-09  Teams with it opens Winning teams filtered by the core
run2 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 5s  (webkit, adapter v2)
run3   pass  CORES-09  Teams with it opens Winning teams filtered by the core
run3 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 5s  (webkit, adapter v2)
```

### B-build SUGG-15
```
run1   pass  SUGG-15  Mega-over-goal note and game-plan gap note on My team and All suggestions
run1 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 10s  (webkit, adapter v2)
run2   pass  SUGG-15  Mega-over-goal note and game-plan gap note on My team and All suggestions
run2 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 11s  (webkit, adapter v2)
run3   pass  SUGG-15  Mega-over-goal note and game-plan gap note on My team and All suggestions
run3 behaviour: 1 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 11s  (webkit, adapter v2)
```

### C-battle X-04
```
run1   FAIL  X-04  a calc button stays under your finger when the page redraws  -> Rain moved from 424.078125 to 403.28125 px
run1 behaviour: 0 pass, 1 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 4s  (webkit, adapter v2)
run2   FAIL  X-04  a calc button stays under your finger when the page redraws  -> Rain moved from 424.078125 to 403.28125 px
run2 behaviour: 0 pass, 1 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 4s  (webkit, adapter v2)
run3   FAIL  X-04  a calc button stays under your finger when the page redraws  -> Rain moved from 424.078125 to 403.28125 px
run3 behaviour: 0 pass, 1 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 4s  (webkit, adapter v2)
```

## What it means
**Passes 3 of 3 on WebKit 26.6 (old-engine quirks, not Safari bugs):** A-team SUG-08, A-team MU-04, B-build X-04, B-build AUTO-04,
B-build CORES-09, B-build SUGG-15. These six failed on the older local WebKit 18.2 (playwright 1.49) in tonight's sweep and, per that report (alt/sweep, not re-checked here), on this
morning's build too; on playwright 1.63's WebKit 26.6 they pass every time (that GitHub runs 1.63 comes from the sweep report; not checked here). In plain words: those failures came from the old test engine.

**Still fails 3 of 3 on WebKit 26.6 (real Safari candidate): C-battle X-04** "a calc button stays under your finger when the page redraws".
Message, identical every run: `Rain moved from 424.078125 to 403.28125 px`. The test (app/test/behaviour/C-battle.mjs:834) opens Damage
Calc at 390 wide with a team, taps the Rain button and allows it to move at most 12 px; in WebKit it moves up 20.8 px. In plain words: on an
iPhone-sized screen in Safari's engine, tapping Rain redraws the page and the Rain button jumps about 21 px, so a second tap could land on
something else. Same result every time, so it is not machine load. Pictures: fail/run1-C-battle/X-04.png (+ .txt page text), run2, run3.

## Not checked
- Real Safari on Sim's iPhone/iPad (this is WebKit in Playwright, not Safari itself).
- Whether C-battle X-04 passes in Chromium on this commit (tonight's sweep: Chromium C-battle 0 FAIL on 82d5326).
- Why Rain moves (cause not investigated; no code read beyond the test).
- The other behaviour tests on WebKit 26.6 (only these 7 were run).

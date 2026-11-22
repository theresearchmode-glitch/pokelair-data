# PC run Nov 22b: WebKit behaviour on today's reskins

Run on Sim's Windows PC, 5:01 PM to 5:20 PM Eastern (Windows clock). Only setup was touched; no site code or tests changed.

## Steps
1. Checkout: branch pc-run from origin/claude/design6 at **70cf10ab**.
2. Installs: `npm ci` exit 0; `npm install --no-save playwright@1.63.0` exit 0; `npx playwright install webkit chromium` exit 0.
3. Frozen data: `git checkout 0c992f69... -- out/` exit 0 (out/ not committed).
4. Build: `built dist/v2.html (2865 KB; 24 CSS layers, 8 data files, 55 scripts, 62 shared logic files)`
5. WebKit groups (the four ran in parallel):
   - A-team: `behaviour: 138 pass, 1 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 1028s  (webkit, adapter v2)`
   - B-build: `behaviour: 77 pass, 0 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 665s  (webkit, adapter v2)`
   - C-battle: `behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 469s  (webkit, adapter v2)`
   - D-meta-shell: `behaviour: 116 pass, 1 FAIL, 42 known bugs, 0 fixed?, 7 skipped; 536s  (webkit, adapter v2)`
6. Repeats, 3 runs each (`--only` worked with the given groups):
   - TEAM-07 (A-team): FAIL 3 of 3, each `behaviour: 0 pass, 1 FAIL, 0 known bugs, 0 fixed?, 0 skipped` (7s, 6s, 6s).
   - NAV-03v (D-meta-shell): FAIL 3 of 3, each `behaviour: 0 pass, 1 FAIL, 0 known bugs, 0 fixed?, 0 skipped` (3s each).

## Failures
- **TEAM-07** (A-team and all 3 repeats): `Suggestions not scrolled to the top of the screen: {"top":835,"vh":900,"shown":true}`.
  Pictures: fail-A-team/TEAM-07.png, fail-repeat/TEAM-07.png. Both are full-page shots, so the jump bar itself is not visible.
  In them the Suggestions section still shows "Plotting your best changes..." (loading). Unsure, not tested: the section may
  still be growing when the jump happens, so it lands short.
- **NAV-03v** (D-meta-shell and all 3 repeats): `Tab left Search after 1 presses`. Focus does not stay inside the open Search.
  No picture: every run printed `(FAILSHOT: page.screenshot: Target page, context or browser has been closed)`.
  That is in the test harness, so it was left alone.

## Compared with the morning run (pc-nov22, design6 at 9c478049)
- TEAM-07 and NAV-03v: same failures, same messages.
- COV-03 (B-build, "Whole roster picks: every card is from the box"): failed this morning, **passes now** (B-build 77 pass, 0 FAIL).

Note: the two repeat logs had mixed text encodings from PowerShell; stray bytes were stripped so they read as plain text. Content is unchanged.

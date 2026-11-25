# Damage Calc: the Rain button jumps 21 px on Safari's engine (fix, Nov 22)

Sim's second account, round 3 JOB A. Clock: time: 9:30 PM (9:30:45)  date: Sun Nov 22, 2026 (docs/rebuild/now.sh). Branch alt/calc-rain, from claude/design6 at 4b70611e.
Frozen test data (out/ from 0c992f69, not committed). Playwright 1.63.0 (installed --no-save, as in the Safari run alt/safari2): WebKit 26.6,
Chromium 157.0.8103.78. The repo's package.json still pins 1.49.1; GitHub's runs were not checked here.

## 1. Reproduced (checked)
`node app/build.mjs --v2 --art=../src/v2/art/` → `built dist/v2.html (2908 KB; 24 CSS layers, 8 data files, 55 scripts, 62 shared logic files)`
`BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs C-battle`, code 4b70611e (before the fix):
```
behaviour: 82 pass, 1 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 461s  (webkit, adapter v2)
  FAIL  X-04  a calc button stays under your finger when the page redraws  -> Rain moved from 424.078125 to 403.28125 px
```

## 2. Why it moves (checked, a probe script in the test harness, same team and width as X-04, not committed)
- Every tap on a weather / terrain / in-play / swap button redraws the whole page (app/src/v2/pages/calc.js:403, and :424 for the pickers'
  change), and V2.redraw (shell.js:410) deliberately keeps the scroll position (`if (scrollY !== y) scrollTo(0, y)`).
- So the button stays put only if nothing ABOVE it changes height. Measured in WebKit at 390: the first step's answer box (.pc-ans in
  .pc-board) went 286.2 → 265.4 px. Inside it, only .pc-l2 changed: 42 → 21 px. With Sun, "of Sneasler's HP: 138–163 damage · 157 HP."
  wraps onto 2 lines; with Rain the numbers are shorter ("45–54 damage") and it fits on 1. Everything below moved up 20.8 px.
- Chromium: the same probe measured no height change at all (its text is a little narrower, so that line fits on 1 line both times).
  That is why only WebKit failed. Not a font swap, not an image: a line whose wrap depends on the numbers.
- Checked and ruled out: the page's scroll anchoring (overflow-anchor: auto in both; the redraw sets the scroll itself either way),
  sprites and pictures (no element changed height except the answer lines).

## 3. The fix (app/src/v2/pages/calc.js only, 8 lines)
`V2.dcKeep(el)`: note the tapped control's place on screen, redraw, then scroll by however far that same control moved (only if it moved
1 px or more and is still on screen). Used by the button taps (calc.js:403) and the pickers' change (calc.js:424).
- Nothing on screen changes: no CSS, no markup, no tokens. In Chromium the control moves 0 px, so it never scrolls.
- Why not CSS (e.g. reserving 2 lines for the HP line): that would add an empty line in Chrome and on every desktop, a visible change.
- `node app/test/v2-guard.mjs` → `v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)`

## 4. After (checked)
C-battle, whole group, 3 runs in each browser (art build, fix applied):
```
chromium run1: behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 424s  (adapter v2)
chromium run2: behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 425s  (adapter v2)
chromium run3: behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 423s  (adapter v2)
webkit run1: behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 454s  (webkit, adapter v2)
webkit run2: behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 457s  (webkit, adapter v2)
webkit run3: behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 456s  (webkit, adapter v2)
```
In plain words: X-04 now passes in WebKit every time, and nothing else in the Battle group broke in either browser (83 pass, 0 FAIL,
the same 4 skipped as before).

`node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html ROUTES=calc node app/test/qcheck-all.mjs`:
```
built dist/v2.html (4147 KB; 24 CSS layers, 8 data files, 55 scripts, 62 shared logic files)
  (10 known findings no longer seen: remove them with KNOWN=write after a look)
qcheck-all: 1 pages + 0 views x 5 widths x 2 themes, 40 findings, 0 new; 30s
```
In plain words: the calc page at 320-1920, day and night, has no new layout finding (its 40 are all known ones from before).

## 5. Pictures (docs/rebuild/pics/nov22/alt/calc-rain/, WebKit, 390x844, scale 1 as the test harness opens it)
- `calc-rain-today-390-webkit.webp`: before the fix, Rain's top 396 → 375 px after the tap (measured).
- `calc-rain-fixed-390-webkit.webp`: after the fix, 396 → 396 px. The page itself looks the same (checked with my own eyes); only the jump is gone.

## 6. Not checked
- Real Safari on Sim's iPhone/iPad (this is WebKit in Playwright).
- Other pages that redraw on a tap with a wrapping line above (only the calc was looked at).
- qcheck on other pages, polish-check, tap-size (the fix changes no layout; not run).
- Night theme pictures; pictures at scale 2.
- Playwright 1.49.1 (the repo's pinned version) after the fix: all runs above used 1.63.0.

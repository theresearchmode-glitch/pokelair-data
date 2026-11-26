# Polish triage fixes (from polish-triage-nov24.md, commit 44bc4eb2), Nov 24

Branch `alt/polish-fixes` from `claude/design6` at **33ec968b**, frozen data 0c992f69, build
`node app/build.mjs --v2 --preview-data --art=../src/v2/art/` → "v2 guard: clean (…)" after every change.
One commit per fix (one format-patch each). Nothing pushed or published.

| # | Fix | Commit | Status |
|---|---|---|---|
| 2 | Damage Calc: the hit sentence fits on one line at 1100+ | e778cfe2 | done |
| 3 | Build Winning Cores: "+N points" never split | afccb7fc | done, narrowed (below) |
| 4 | Home tools: tile blurbs wrap evenly | 49580236 | done |
| 6 | Battle / Build small buttons get 44 px taps | — | **not needed: my triage was wrong** |
| 1 | Speed Tiers: Field + Weather on the You/Them row at 1280+ | — | **left out: doesn't fit** |
| 5 | My Team links | — | skipped, as asked |

## What each fix changes
- **#2** (app/src/v2/pages/calc-plot.js, +9 lines): `V2.calcSentFit`, run after each draw, on resize and when fonts load, using
  the Plot sentence's method (build-plot.js `V2.plotFit`). At 1100+, if the sentence is only a little too wide, its display size
  steps down 1 px at a time until it's on one line, never under 28 px. Otherwise it wraps as before. Under 1100: untouched.
  Measured: 1440 34 → 33 px, one line; 1280 34 → 28 px, one line; 1100 stays 30.8 px on two lines (would need under 28);
  390/820 unchanged. qcheck exempts `.k-sent` from the type scale (fluid display type), so no new finding.
- **#3** (app/src/v2/pages/build-plot.js:183, two spaces become no-break, plus a comment): "+1 point", "+2.3 points" can't split.
  First version (every fact whole) made two cores a line taller at 1280 (page length +18 px), so it was narrowed. Measured
  (end-of-line "+N" count, before → after): 390 3→0, 820 3→0, 1280 5→0, 1440 1→0; cores' text height identical at
  390/820/1100/1280/1440/1920. **Left as is:** "375 / teams" still splits twice at 1280, and the "(2.8%)" share can start a line.
  Keeping those whole costs a line in the 212 px columns.
- **#4** (app/src/v2/css/sd-tools.css:25, `text-wrap: balance` on `.sdt-d`): the blurb already had `pretty`, which only stops a
  single word on the last line ("1 plan." is two). Measured: every visible blurb is the same height before and after at
  390/820/1280/1440, so no line was added.
- **#6, a correction:** I hit-tested both controls the way tap-size does, on the unchanged build. Battle "0 of 4 picked": box
  103x26, **tap 112x50**. Build "How Cores Are Ranked": box 146x18, **tap 148x44** (the kit's C8 `::before`,
  components.css:176-178). Both already pass C8. The polish check measures the drawn box only, and I didn't hit-test in the
  triage. No change made.
- **#1, left out:** measured, one row needs **1,414 px**; the controls have 1,233 px at 1440 and 1,073 px at 1280. It fits only
  from 1680 up, which is already where pages.css:1117 puts it on one row. Making it fit at 1280-1440 means smaller chips or a new
  arrangement: a visual decision for Sim. Two options to show him: (a) a two-column block, You/Them over each other on the left
  and Field/Weather on the right; (b) chips one size smaller at 1280-1679. Not built.

## Checks (command → result line → meaning)
Per fix: each on a frozen copy of that commit's build (app/dist/v2-fix2/3/4.html), then the final build (all three).
- `QALL=1 PF=… HASH='#calc|#build|#home' WIDTHS=390,820,1280,1440 node app/test/qcheck.cjs` (day and night):
  before `TOTAL 27` / `TOTAL 0` / `TOTAL 30`, after the same for each fix and for the final build, `diff` 0 lines.
  → no new finding on any changed page at any of the 8 views.
- `PAGE=… node app/test/tap-size.mjs` → `tap-size: all passed` (rc 0) before, after each fix, and final.
- `PAGE=… OUT=… node experiments/page-lengths.mjs` (26 pages at 390/1280/1440/1920), final against before:
  `changed: calc@1280 2427->2371, calc@1440 2544->2488 | longer: none` → only Damage Calc changed (56 px shorter), nothing
  longer. (The first #3 showed `build@1280 +18` and was narrowed.)
- v2-minors on the final build (`PART=main1|main2|groups PAGE=app/dist/v2-final.html node app/test/v2-minors.mjs`):
  `main1 rc=0 pass=145 FAIL=0`, `main2 rc=0 pass=100 FAIL=0`, `groups rc=0 pass=56 FAIL=0` ("v2-minors (groups):all passed")
  → every small check passes with all three fixes in.

## Pictures (labelled, 2x, the spot outlined in dashed pink)
2a/2b/2c Damage Calc (1440 before/after, 1280 after); 3a/3b Build cores 1440 before/after, 3c/3d 1280 before/after;
4a/4b Home Battle tile 1440 before/after.

## Not checked
WebKit; night-mode pictures (qcheck covered night); widths other than those listed.

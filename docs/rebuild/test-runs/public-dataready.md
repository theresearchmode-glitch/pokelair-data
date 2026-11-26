# Job Y: the public site waits for today's data, Thu Nov 26, 2026, 1:10 PM Eastern (now.sh)
HH's helper. Branch alt/public-dataready, on origin/alt/day-batch4 1f8eeeee. Code only; nothing merged, published or deployed.
I stopped once the checks below passed, when Job Z came in. Not run: the full v2-minors parts, the behaviour suites and WebKit.

## The bug (checked)
nastyplot.org drew the page with the numbers built into it (the Nov 1 copy) and swapped in today's about 1 s later.
- **Cause:** shell.js `V2.dataReady` only knew the Claude data store (`window.__NP_CLAUDE || window.claude`).
- On the public site neither exists: the /data/ loader is a local variable in 03-persistence.js. So "no store" made the page ready at once.

## The fix (3 lines, code only)
1. **app/src/app/03-persistence.js:** the public /data/ loader is also put on `window.__NP_PUBDB`.
2. **app/src/v2/shell.js V2.dataReady:** reads `window.__NP_CLAUDE || window.claude || window.__NP_PUBDB`. On the public site it now waits for today's documents, as the Claude build waits for its store. A document that is missing (404) still counts as answered, and the 8 s fallback stays.
3. **app/src/v2/css/shell.css** (two layout-only rules, needed because waiting showed the loading panel's own jumps):
   - **`.np-loading` min-height 60vh → 100vh/100svh.** While loading, the footer sat on screen under the short panel. When the page arrived it jumped off screen: CLS **0.89** at 390 once the page waited properly.
     - Visible change, loading state only: the "Getting today's numbers" panel fills the screen, and its logo sits lower.
   - **`.np-main` display:flow-root.** The data note's 24px top margin used to collapse through #main, so #main itself moved down 24px at the swap (CLS 0.025).
     - With flow-root the margin stays inside #main and the content lands in the same place.
     - Checked as no visible change in the Claude build (below).

## The test (could fail; failed before)
**experiments/public-dataready-test.mjs**, added to test.yml after the --public build + security-csp step. What it does:
- It serves app/dist like Cloudflare, and /data/ from out/ the way public-site.mjs publishes it.
- First it reads the built-in numbers' date with /data/ missing.
- Then it loads / and /meta at 390x844 with /data/ answering 1 s late, records every text shown from the first byte, and measures CLS.

**Before (day-batch4 1f8eeeee, frozen data 0c992f69):**
```
  FAIL  / at 390, /data/ 1 s late: the built-in numbers never drawn (dates seen ["Nov 1","Nov 9"], team counts ["10,209","13,631"])
  FAIL  /: CLS 0.0658 (under 0.02), page errors 0
  FAIL  /meta at 390, /data/ 1 s late: the built-in numbers never drawn (dates seen ["Nov 1","Nov 9"], team counts [])
  FAIL  /meta: CLS 0.0658 (under 0.02), page errors 0
public-dataready-test: 4 failed
```
**After:**
```
  pass  built-in numbers when /data/ is missing: "Data as of Nov 1", 10,209 teams (the fallback still works)
  pass  / at 390, /data/ 1 s late: the built-in numbers never drawn (dates seen ["Nov 9"], team counts ["13,631"])
  pass  /: "Getting today's numbers" until the data came, then today's date (Nov 9)
  pass  /: CLS 0.0000 (under 0.02), page errors 0
  pass  /meta at 390, /data/ 1 s late: the built-in numbers never drawn (dates seen ["Nov 9"])
  pass  /meta: CLS 0.0000 (under 0.02), page errors 0
public-dataready-test: all passed
```
In between, with only the dataReady fix, the test showed CLS 0.8932 (the footer leaving the screen), then 0.0254 (the 24px margin). That is why the two CSS rules are there.

## The Claude build is unchanged (checked)
- `ONLY=MD v2-minors` on a `--v2 --preview-data` build (frozen data): MD-1 and MD-2 pass, "v2-minors:all passed".
- `LT_ALERT=1 v2-longtask`: "v2-longtask: all passed" (#home 0.22, #team 0.26 of 0.42).
- **Before vs after, Preview build:** 12 pages (home, team, build, battle, calc, meta, usage, gifts, news, track, Garchomp, about) at 390 and 1440, full page, reduced motion.
  - Page heights are identical on all 24.
  - 22 of 24 pictures had 0 changed pixels.
  - The other two were noise:
    - team 1440 showed 58 px, then 0 on two re-runs.
    - calc 1440 showed 1,347 px in one strip of broken-image placeholders (this build has no art), then 1,796 px, then 0.

## Not done (paused for Job Z)
- The full v2-minors parts, the behaviour suites, WebKit.
- A run of public-dataready-test on main's live data (only frozen data was used).

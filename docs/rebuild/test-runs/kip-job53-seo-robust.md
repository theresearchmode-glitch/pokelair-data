# Kip job 53: `app/test/seo-check.mjs` robustness

Written Thu Nov 26, 10:41 AM (ET). Branch `alt/gemini-seo-test2` from `origin/alt/gemini-seo-test` `3707f22c`.

## Root cause
`app/test/seo-check.mjs:168` called `await chromium.launch()` outside `try/catch` (and per-route `pg.goto` / `pg.evaluate` had no per-route `try/catch`). Any browser-launch or route error crashed with an unhandled stack trace instead of closing the HTTP server and reporting all collected failures in one summary + `exit 1`. Also, `waitForFunction` checked only `querySelectorAll('h1').length > 0`, which could fire before `.np-load` cleared if a page had an extra static `<h1>`.

## What changed (`app/test/seo-check.mjs`)
- Wrapped server start, `chromium.launch()`, HTTP request handler, and every per-route `goto`/`evaluate` loop in `try/catch`, closing both browser and server in `finally`.
- Collected any browser/server/route errors into `renderErrors`, reporting them cleanly via `ok(false, ...)` and exiting `1` with one summary (never a stack trace).
- Updated `waitForFunction` to wait for `document.querySelectorAll('h1').length > 0 && !document.querySelector('.np-load')`.

## Verification
1. **Real public build (frozen `out/` `0c992f69`):** `node app/test/seo-check.mjs` → `seo-check: ALL PASSED` (13/13, `exit 0`).
2. **HH's two-page break (`natures.html` canonical removed + `battle.html` given an extra `<h1>`):**
   - `FAIL  2a. one matching absolute canonical URL on all 371 pages (natures.html: 0 canonical tags)`
   - `FAIL  3c. exactly one <h1> on all 28 rendered routes (/battle: 2 <h1>)`
   - `seo-check: 2 FAILED` (`exit 1`, empty stderr, no stack trace).
3. **Forced browser launch failure (`PLAYWRIGHT_BROWSERS_PATH=/nonexistent-pw`):**
   - Reports `FAIL 2a` (static) + `FAIL 3-render` / `3c` / `3d` / `4b` (browser launch error message), `seo-check: 5 FAILED` (`exit 1`, empty stderr, no stack trace).

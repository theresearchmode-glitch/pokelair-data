# Kip job 45: flaky `app/test/prelaunch.mjs` (`node app/test/run.mjs`)

Written Thu Nov 26, 7:43 AM (ET). Branch `alt/gemini-flaky-prelaunch` from `origin/claude/design6` `dcefa24f`.

## Diagnosis & measurements (before fix)
Ran unmodified `app/test/prelaunch.mjs` across 61 runs + full `node app/test/run.mjs`:
- Today's `out/`, idle (20x): `20/20 PASS`
- Today's `out/`, 2 CPU load workers (15x): `15/15 PASS` (~32s/run)
- Today's `out/`, 6 CPU load workers (10x): `10/10 PASS` (~57s/run)
- Today's `out/`, 10 CPU load workers (6x): `6/6 PASS` (~84–98s/run)
- Frozen `out/` (`0c992f69`, 10x idle): `10/10 PASS` (~25s/run)
- Full `node app/test/run.mjs` (1x): `ALL PASSED`
- Ruled out `Math.random().toString(36)` key-length flake (`53-feedback.js:46` vs `prelaunch.mjs:70`): 1,000,000 samples produced `min=11`, `0` keys `< 10` chars.

Instrumented `open()` to measure actual readiness latency after `pg.goto('file://' + page)` (3.0 MB `page.html` + 1.19 MB `addInitScript(D)`):
- Idle: `goto=1284ms`, `META_SEEN + FB.ok + USE.ok` = `99ms`, `!renderQueued` = `337ms` (total after `goto`: **436ms**)
- 6 CPU workers: `goto=5392ms`, ready = `1572ms`, `!renderQueued` = `10ms` (total after `goto`: **1582ms**)
- 10 CPU workers: `goto=7457ms`, ready = `2732ms`, `!renderQueued` = `170ms` (total after `goto`: **2902ms > 2500ms**)

**Root cause:** `app/test/prelaunch.mjs` used blind `waitForTimeout(...)` sleeps everywhere instead of waiting for the actual async conditions the page settles on:
1. `open()` used `pg.waitForTimeout(2500)` after `pg.goto` (default 30s timeout), while the page asynchronously delivers 17 `META_KEYS` snapshots (`onSnapshot`), runs the debounced `scheduleRender()` (up to 700ms), and resolves `FB.ok` and `USE.ok` IIFEs. Under CPU contention, readiness crossed 2.5s (**2902ms** measured under 10-worker load).
2. Every `setView(...)`, `.fbbtn` / `#lairSheet .fbmis` click, async `#fbSend` write, and async `usageFlush()` write used blind 200–400ms sleeps instead of waiting for `!renderQueued`, visible elements, or the store write in `window.__store`.

## What changed (`app/test/prelaunch.mjs` only)
Replaced every blind `waitForTimeout` with condition-based waits (all 27 `ok(...)` assertions untouched):
- `open()`: `pg.goto('file://' + page, {timeout: 60000})` + `waitForFunction` for `META_SEEN.size >= META_KEYS.length && FB.ok && USE.ok && !renderQueued` (30s cap).
- After `setView(...)`: `settled(pg)` waiting for `!renderQueued` (5s cap, `.catch(() => {})` so a real hang still hits the `ok(...)` checks).
- After clicks / `lairSheet` / `aboutOpen`: `waitForSelector(..., {state: 'visible', timeout: 5000}).catch(() => {})`.
- After `#fbSend` / `usageFlush()`: `waitForFunction` waiting for `window.__store['feedback/viewer_7f3a9c'].m` count >= 1 / >= 2 and `window.__store['usage/viewer_7f3a9c'].s` count >= 1 (5s cap, `.catch(() => {})`).

## Proof (before vs after)
1. **Delayed snapshot proof (`onSnapshot` 3.2s delay, matching slow-container readiness past 2.5s):**
   - OLD (`HEAD` blind 2500ms): `exit=1` — `FAIL phone Home shows "data as of <date>"`, `FAIL the data date reads "Data as of …"`, `FAIL light: stale doc -> note shows on Home`, `FAIL light: note names each stale source and its date`.
   - NEW (condition waits): `exit=0` — `ALL PASSED`.
2. **23 consecutive passes after fix:**
   - Idle (20x): `20/20 PASS`, avg **15.3s** (down from ~25s because `open()` no longer sleeps 2.5s × 4 when ready in ~0.4s).
   - 6 CPU workers (3x): `3/3 PASS`, avg 56.5s.
   - `node experiments/syntax-check.mjs` -> `syntax-check: all 418 scripts parse`.

## Not checked
- Full GitHub Actions run (runs on push).
- Reproducing the exact failure on HH's container (on this VM, unmodified `prelaunch.mjs` passed 61/61 even under 10-worker load because `setView('home')` + 300ms absorbed the extra 400ms; the 3.2s snapshot-delay test proves the exact failure mode when readiness slips past 2.8s).

---

## Summary of jobs 41–46 (requested at end of job 45 report)
- **Job 41** (`alt/gemini-switch-dry` `9fe92088`): **done** — Saturday switch dry run, conflict map, runbook corrections; caught the `post.json` freshness blocker (became Job 46) and Turnstile double render (Job 47).
- **Job 42** (`alt/gemini-md-roster` `126416dc`): **done** (merged into `claude/design6`) — `experiments/md-roster-step.mjs` + fixture test.
- **Job 43** (`alt/gemini-merge-gate` `0d5df189`): **done** (merged into `claude/design6`) — `merge-check.sh` target-aware (`main` + `claude/design6`), target-checked stamp/hook, `merge-gate-test.mjs`.
- **Job 44** (`alt/gemini-quiet-alarms` `91911b8d`): **done** — `md-watch.mjs` `regAt` + quiet API-200 days, `update.mjs` `apiOk: true` + `health.mjs` quiet launch window, `quiet-launch-alarms-test.mjs`.
- **Job 45** (`alt/gemini-flaky-prelaunch` — this commit): **done** — `app/test/prelaunch.mjs` blind sleeps replaced with condition-based waits; 23/23 passes after fix.
- **Job 46** (`alt/gemini-news-ran-data` `c78d15e2` + `alt/gemini-news-ran-page` `bdb62e1c`): **done** (page half merged into `claude/design6`, data half ready for `main`) — `post-news.mjs` writes `ran`, `health.mjs` dates `post.json` by `ran || updated`.
- *(Job 47 skipped per HH note Thu Nov 26 4:56 AM — taken by HH's helper; Job 48 next.)*

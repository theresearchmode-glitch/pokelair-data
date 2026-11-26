# Kip job 44: md-watch `regAt` + quiet launch-day alarms

Written Thu Nov 26, 6:27 AM (ET). Branch `alt/gemini-quiet-alarms` from `origin/main` `a320b06f`.

## What changed
1. **`md-watch.mjs:18,45` (LOW-1):** imported `regAt` from `formats.mjs` and replaced `String(t && t.format || '').toUpperCase() === next` with `regAt(String(t && t.format || '').toUpperCase(), t && t.date) === next`. Limitless tournaments still tagged `M-C` at or after `REG_END['M-C']` (`2026-12-02T01:59:00Z`) are now spotted as `M-D`.
2. **`md-watch.mjs:58-76` (quiet days vs real outage):** Limitless is already fetched on line 42 (`list`). When the API answers HTTP 200 with an array `list`, compute `apiNewest` (newest tournament date in `list` for `act.id` or `next`, using `regAt`).
   - If the API failed (`down`), `data/index.json` is unreadable (`!idxOk`), `WATCH_FAKE_LIMITLESS=stale`, or the API has a newer active/next-reg tournament than `data/index.json` while `data/index.json` is 2+ days old (`missed && (age === null || age >= 2)`): still raises `R.paused`.
   - If the API answered HTTP 200 and reports no newer active/next-reg tournament than `data/index.json` (including an empty index + empty API): logs a quiet-day note and leaves `R.paused = null`.
3. **`update.mjs:143` + `health.mjs:96-105` (quiet launch days vs real outage):**
   - `update.mjs:143` stamps `apiOk: true` into `out/limitless.json` (only reached after `get('/tournaments?...')` succeeds HTTP 200; a failed API throws before writing `out/limitless.json`).
   - `health.mjs:96-105` checks `limApiFresh = !!(LIM && LIM.apiOk === true && age(LIM.updated) <= 2)`. During the 14-day launch window (`inLaunch`), if `limApiFresh` is true and the newest tournament in `data/index.json` is >4 days old (or `data/index.json` has `{tournaments: {}}`), it prints a `::warning::` instead of pushing to `problems`.
   - Real outages still fail: stale `out/limitless.json` fails `FILES` row `limitless.json` (2-day limit); missing `apiOk: true` (including existing `md-day-one-test.mjs` test 12) still fails; steady-state (`!inLaunch`, day 15+) >4d gap still fails; unreadable `data/index.json` still fails.
4. **`experiments/quiet-launch-alarms-test.mjs` (new)**, wired into `.github/workflows/test.yml` (`paths` + step right after `freshness-test.mjs`). Uses a faked clock (`--import` preload for `md-watch.mjs`, `--now=` for `health.mjs`) and offline mocked `fetch()` — zero live network calls.

## Fail first (unmodified `md-watch.mjs` + `health.mjs`): `quiet-launch-alarms-test: 5 FAILED`
```
  FAIL  1a. md-watch spots M-C event after Dec 2 01:59Z as M-D via regAt (spotted=Showdown,official news)
  FAIL  2a. md-watch quiet launch day (API 200, no event newer than index) is NOT paused (paused=true)
  FAIL  2b. md-watch quiet launch day (empty index + API 200 []) is NOT paused (paused=true)
  FAIL  3a. health quiet launch day (day 5, fresh limitless.json, last event 5d old) passes with warning (exit=1)
  FAIL  3b. health quiet launch day (day 5, fresh limitless.json, empty index) passes (exit=1)
```
(The other 7 checks — 1b, 2c, 2d, 2e, 3c, 3d, 3e — already passed.)

## Pass after (checked: ran each script, exit 0)
- `node experiments/quiet-launch-alarms-test.mjs` -> `quiet-launch-alarms-test: ALL PASSED` (13/13, incl. `3f`: launch day without `apiOk: true` still fails)
- `node experiments/md-day-one-test.mjs` -> `ALL 22 TESTS PASSED` (test 12 untouched and passing)
- `node experiments/freshness-test.mjs` -> `ALL PASSED`
- `node experiments/dec2-landing-fixes-test.mjs` -> `ALL PASSED`
- `node experiments/md-switch-data-gaps-test.mjs` -> `md-switch-data-gaps-test: ALL PASSED`
- `node --check` on `md-watch.mjs`, `health.mjs`, `update.mjs`, `experiments/quiet-launch-alarms-test.mjs` -> `parse-ok`

## Not checked
- The full GitHub Actions workflow run (runs on push).
- Live network fetch against Limitless (mocked offline in test).
- `health.mjs` merge conflict note for Saturday/HH: this branch is based on `origin/main` `a320b06f`, which does not yet have `alt/gemini-news-ran-data` (line 65). The two changes touch different sections (`health.mjs:65` vs `health.mjs:96-105`), so they merge cleanly.

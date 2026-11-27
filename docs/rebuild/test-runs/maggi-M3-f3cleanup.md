# Maggi Job M3: Final 3 contrast + short-window fold checks, `V2.f3Seo` removal, `V2._f3` regulation cache key

- **Date:** Thu Nov 26 10:04:44 PM EST 2026
- **Branch:** `alt/maggi-m3-f3cleanup` (branched from `alt/maggi-m2-f3fixes` `bcbcad56`)
- **What I'd need to know that you haven't told me:** Nothing missing.

## Changes (code and tests only; no visual change)
1. **`app/src/v2/pages/pubhome-f3.js:16-26`**: Key `V2._f3` cache on `metaVersion + '|' + reg + '|' + cur` (computing `reg` from `regInfo().id` and `cur` from `V2.REG_START_MD` before the cache check), so `V2.f3Data()` invalidates automatically when the regulation changes or `Date.now()` crosses Dec 2 02:00 UTC.
2. **`app/src/v2/pages/pubhome-f3.js` (removed lines 78–79)**: Removed `V2.f3Seo` after verifying with `rg -n "f3Seo" .` across the entire repo (including `public-site.mjs`, `app/build.mjs`, `app/static-pages.mjs`, `experiments/`, `.github/`, `worker/`) that its only occurrence was its own definition (`V2.preBlock` uses `V2.pages.home.seo` in `home.js:205`).
3. **`app/test/v2-minors.mjs:1534-1563`**: Added `F3-8`, `F3-9`, `F3-10` right after `F3-7`:
   - `F3-8`: WCAG contrast check for Final 3 hero in both day and night (`sl`, `h1s`, `lead`, `meta` ≥ 4.5:1; large bold display `em`, `big`, `barMin` ≥ 3:1).
   - `F3-9`: Short-viewport fold check for **both** start buttons (`Score My Team` + `Build Me a Team`) at `1000x650` and `393x659` with no sideways scroll.
   - `F3-10`: Verifies `V2._f3` invalidates across Dec 2 02:00 UTC without manual reset and `typeof V2.f3Seo === 'undefined'`.

---

## Fail-before → pass-after proof

### Fail-before (on `bcbcad56`, frozen test data `0c992f69`, before `pubhome-f3.js` edits)
Command: `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs | awk '{print; fflush(); if (/F3-10/) exit 0}'`
- `FAIL  F3-10 (M3): V2._f3 cache key includes regulation / Dec 2 rollover (no stale cache) and unused V2.f3Seo is removed ({"bReg":"M-C","bOld":false,"aReg":"M-C","aOld":false,"seo":"function","errs":0})`

### Pass-after (frozen test data `0c992f69`, after `pubhome-f3.js` edits)
Command: `PART=main2 PAGE=app/dist/v2.html node app/test/v2-minors.mjs | awk '{print; fflush(); if (/F3-10/) exit 0}'`
- `pass  F3-1` through `pass  F3-7` (all passed)
- `pass  F3-8 (M3, day): Final 3 hero contrast meets WCAG (sl 17.25, em 5.61, h1s 17.25, lead 5.63, meta 9.38, big 4.14, barMin 3.2)`
- `pass  F3-8 (M3, night): Final 3 hero contrast meets WCAG (sl 14.16, em 9.07, h1s 14.16, lead 8.23, meta 9.22, big 4.07, barMin 3.2)`
- `pass  F3-9 (M3): both start buttons (Score My Team + Build Me a Team) sit above the fold with no sideways scroll at 1000x650 and 393x659 (all good)`
- `pass  F3-10 (M3): V2._f3 cache key includes regulation / Dec 2 rollover (no stale cache) and unused V2.f3Seo is removed ({"bReg":"M-C","bOld":false,"aReg":"M-D","aOld":true,"seo":"undefined","errs":0})`

---

## Checks run (commands, exact results, exit codes)

1. **Repo-wide `f3Seo` grep** — checked:
   - Command: `rg -n "f3Seo" .`
   - Result: `./app/src/v2/pages/pubhome-f3.js:79:...` (only its own definition) — **exit 0**
   - Meaning: Confirmed `V2.f3Seo` is unused across the entire repository.

2. **Syntax check** — checked:
   - Command: `node experiments/syntax-check.mjs`
   - Result: `syntax-check: all 427 scripts parse` — **exit 0**
   - Meaning: All 427 JS files parse cleanly.

3. **Claude preview build** — checked:
   - Command: `rm -rf app/dist && node app/build.mjs --v2 --preview-data`
   - Result: `v2 guard: clean (...)` / `v2: static first screen 99 KB` / `built dist/v2.html (4447 KB; ...)` — **exit 0**
   - Meaning: Claude preview build succeeds cleanly.

4. **Public split build** — checked:
   - Command: `rm -rf app/dist && node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public`
   - Result: `v2 guard: clean (...)` / `public: static words for 24 pages (home: Sharply raise your win rate. Rate your Pokémon Champions team before Reg M-D.)` / `built dist/v2.html (872 KB; ...)` — **exit 0**
   - Meaning: Public split build succeeds cleanly with static Home words intact after `V2.f3Seo` removal.

5. **Public build suite (`v2-public.mjs`)** — checked:
   - Command: `node app/test/v2-public.mjs`
   - Result: `v2-public: all passed` — **exit 0**
   - Meaning: All public build checks pass with zero page errors.

## Note on full CI
- Full `v2-minors` (`main1`/`main2`/`groups`) and `A-team` behaviour suites exceed this VM's ~10-minute command timeout; pushing `alt/maggi-m3-f3cleanup` once without `[skip ci]` runs the full GitHub Actions suite.

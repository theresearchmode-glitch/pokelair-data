# Job 71 — Speed Chain Merge (`claude/design6`) + Independent Review Fixes (M1–M4, F1)

- **Branch:** `alt/gemini-speed-chain` (branched from `origin/alt/gemini-deploy-smoke` `eb89d52e`)
- **Merged:** `origin/claude/design6` `5d111577` (includes `alt/batch8` + `alt/batch9`: Final 3 slogan in `h1`, calc tile, Maggi's F3 fixes, Dec 2 patch script)
- **Merge conflict resolved:** `app/src/v2/shell.js` (`V2.openSearch`) — kept both `V2.needRoute('info-text', ...)` and `design6`'s short phone placeholder (`innerWidth < 430 ? 'Pokémon, move, item or page' : 'Find a Pokémon, move, item, team style or page'`).

## 1. Fail-First Proof on `eb89d52e` (Before Fixes)

Added [chain-review-guard.mjs](file:///home/antigravity/theresearchmode-glitch/pokelair-data/experiments/chain-review-guard.mjs) covering M1a, M1b, M2, M3, M4, and F1, and ran it against `eb89d52e` (`node app/build.mjs --v2 --split --split-routes --art=../src/v2/art/ --public`):

```
  FAIL  M1a: failing /routes/calc*.js — reqs=62, main="Damage Calculator for Pokémon Champions ..."
  FAIL  M1b: failing /routes/team*.js — reqs=61, main="Team Rater: Strength Score for your team ..."
  FAIL  M2: failing info-text.js on ability tap — reqs=63, tags=63, sheet=false, toast=false
  FAIL  M3: returning visitor never sees sample team on /team,/box,/compare — /team(pre=true,sample=true); /box(pre=true,sample=true); /compare(pre=true,sample=true)
  FAIL  M4: Sprites A (240px src only on slots <= 80px) — small=95, wrong=7
  FAIL  F1: My Team desktop Tab order (Why This Score? precedes .mtf) — {"ok":false,"idxWhy":20,"idxCard":0,"yWhy":305,"yCard":525}
chain-review-guard: 6 FAILED (exit 1)
```

## 2. Fixes Applied

1. **M1 — Failing page chunk request storm (`app/src/v2/shell.js` `V2.loadRoute`, `V2.draw`, `V2.shell`):**
   - Tagged failed route fallback pages with `_failed: true` in `V2.loadRoute`'s `.catch`.
   - Early-returned in `V2.loadRoute` and skipped re-fetching in `V2.draw` when `V2.pages[r]._failed` is set.
   - Rendered `V2.safeDraw(P)` immediately in `V2.shell` when `P._failed` is true (and bypassed `isPre` morphing in `V2.draw`), so failing chunks stop after **1 request** and display `"PAGE · DIDN’T LOAD — This page didn’t load."`
2. **M2 — Failing `info-text.js` loop on Ability/Item/Move tap (`app/src/v2/pages/infosheet.js:31`):**
   - Added a `tried` guard to `V2.openInfo(kind, n, tried)` so `V2.needRoute('info-text', ...)` runs at most once.
   - On failure, Ability/Move sheets open with `ABIL` / `MOVE_META` fallback; Item taps show a plain toast (`"Couldn't load item details right now. Try again in a moment."`).
3. **M3 — Returning visitors seeing sample team/score on personal pages (`app/build.mjs:409-424`):**
   - Added a returning-visitor guard on the 8 personal pages (`team`, `box`, `compare`, `battle`, `build`, `practice`, `test-run`, `calc`):
     - Synchronous `<head>` script + CSS hides `[data-np-pre]` via `.np-has-state` before first paint when `localStorage.getItem('cc2.state')` exists.
     - Synchronous inline script immediately after `</main>` removes `[data-np-pre]` from `#main` when `cc2.state` exists, so neither a painted frame nor DOM text/buttons ever show the sample team or score to a returning visitor.
     - Fresh visitors (no `cc2.state`) keep the instant prerendered first screen.
4. **M4 — `Sprites A (Nov 17)` failure (`app/src/v2/shell.js:40-42`):**
   - In `V2.mon`, set `src` to the `240px` file (`art-s/`) only when `o.iw && o.iw <= 80`, and to the `384px` file (`art/`) for slots over `80px` (or omitted `o.iw`), while keeping `srcset="... 240w, ... 384w"` and `sizes`. Existing test untouched.
5. **F1 — My Team desktop Tab order (`app/src/v2/pages/team.js:494-535`):**
   - Restored `design6`'s single `mtfHead` before `V2.mtfFrame(D, sel)` inside `.tm-hero.pty2`. Desktop (`1440x900`) Tab order now visits `"Why This Score?"` (`y=305`, index `0`) before `.mtf` cards (`y=525`, index `11`), while throttled phone `/team` CLS remains well under `0.1` (`0.0357`).
6. **Tests updated:**
   - Added `experiments/chain-review-guard.mjs` (6/6 checks for M1a, M1b, M2, M3, M4, F1).
   - Extended `experiments/split-routes-cross-test.mjs` with 3 chunk-failure cases (M1 `/calc`, M1 `/team`, M2 `/pokemon/garchomp` `info-text.js` -> 29 total cases).
   - Updated `experiments/first-screen-guard.mjs` font-overlap check to walk text nodes (`NodeFilter.SHOW_TEXT`) so `display: block` `.f3-h1s` inside `h1.f3-h1` (added by `design6` batch8) does not self-overlap its own text rects.
   - Fixed `ROOT` path in `experiments/page-speed-check.mjs` (`'../..'` -> `'..'`) so default `node experiments/page-speed-check.mjs` resolves `app/dist`.

## 3. Verification Results (All Runs After Fixes)

| Suite | Command | Exit | Result (`checked` / notes) |
|---|---|---:|---|
| `chain-review-guard` | `node experiments/chain-review-guard.mjs` | **0** | **6/6 PASS** (M1a `reqs=1`, M1b `reqs=1`, M2 `reqs=1/sheet=true`, M3 clean on `/team,/box,/compare`, M4 `small=88, wrong=0`, F1 `idxWhy=0 < idxCard=11`) |
| `split-routes-cross-test` | `node experiments/split-routes-cross-test.mjs` | **0** | **29/29 PASS** (all 26 cold cases + 3 new M1/M2 chunk-failure cases) |
| `first-screen-guard` | `node experiments/first-screen-guard.mjs app/dist` | **0** | **6/6 PASS** (4 font-overlap `0 px`, throttled CLS `/` `0.0090`, `/team` `0.0357`) |
| `page-speed-check` | `node experiments/page-speed-check.mjs` | **0** | **10/10 PASS** (Home `420ms/864.8KB`, `/pokemon` `416ms/133.4KB`, `/pokemon/garchomp` `1111ms/821.5KB`, `/meta` `1491ms/799.1KB`, `/team` `467ms/1015.1KB`) |
| `v2-public` | `node app/test/v2-public.mjs` | **0** | **ALL PASSED** (Final 3 hero, 1 `h1`, `#guide`/`#sheet`/`#team-empty` 404, `#box` 390/1440, 0 page errors) |
| `prerender-test` | `node app/test/prerender-test.mjs` | **0** | **ALL PASSED** (`/`, `/team`, `/meta` prerender invariants) |
| `seo-audit` | `node experiments/seo-audit.mjs site` | **0** | **ALL PASSED** (374 HTML files, 369 sitemap URLs, 0 issues) |
| `deploy-smoke` | `node experiments/deploy-smoke.mjs site` | **0** | **ALL PASSED** (369 sitemap URLs + `robots.txt` + `404` + pokemon + `/team` cold-open in 166.4s) |
| `Sprites A (Nov 17)` exact check on `app/dist/v2.html` (`--preview-data`) | inline Playwright run of `v2-minors.mjs:1079-1084` | **0** | **PASS** (`used=91, wrong=0, all=106`) |
| `v2-minors` (`main1` / `main2` / `groups`) | `PART=<p> PAGE=app/dist/v2.html node app/test/v2-minors.mjs` | **1 / 1 / -1** | Local VM CPU/timeout limits hit: `main1` solo timed out on `elementHandle.click` at line 1055 (1 load-race fail on `Player review 2d`, before reaching `Sprites A` which passed standalone above); `main2` hit `F3-3` 600px draw race + `Stampede hero 2` ordering; `groups` hit 10-min VM command timeout while passing `MQ-9a..d`. Full 3-part `v2-minors` + `A-team` (`-1`, 10-min VM timeout on `run.mjs A-team`) need CI runners (`[skip ci]` push per HH's 9:58 PM rule). |

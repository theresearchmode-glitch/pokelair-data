# Job 58 — `--split-routes` on `--public` Proposal & Measurement (`alt/gemini-split-routes`)

Built on top of Job 57 (`alt/gemini-speed-fix1`, `c540120c`).

## 1. What Broke BEFORE Fixing Anything
Turning on `--split-routes` on `--public` (22 route chunks in `app/dist/routes/*.js`, 456 KB raw total; `dist/v2.js` 2,047 KB -> 1,673 KB raw) without code changes broke:

1. **`experiments/pokemon-pages-test.mjs` — 12 FAILED:**
   - `/pokemon/garchomp`, `/pokemon/mr-mime`, `/pokemon/charizard-mega-y`, `/pokemon/sneasler.html` all crashed with `TypeError: V2.shareTxt is not a function` and rendered `h1 "This page didn't load."` (failing h1, preloaded image, and visible breadcrumb trail checks).
   - `/this-week` crashed with `TypeError: V2.tourTabs is not a function` and rendered `h1 "This page didn't load."`.
   - (`security-csp-test.mjs`, `seo-check.mjs`, `static-pages-test.mjs`, `pub-links-test.mjs`, `public-build-test.mjs`, `public-site-test.mjs` passed.)
2. **Isolated 22-route cold-load sweep — 11 of 22 split routes crashed on first load:**
   - `TypeError: V2.battleToolsBar is not a function` (defined in `battle.js`): `/calc`, `/test-run`, `/practice`, `/types`
   - `TypeError: V2.tourTabs is not a function` (defined in `winning.js`): `/events`, `/archetypes`, `/this-week`
   - `TypeError: V2.wkTip is not a function` (defined in `thisweek.js`): `/track-record`
   - `TypeError: V2.pkTabs is not a function` (defined in `meta.js`): `/natures`, `/usage`, `/sets`
   - `TypeError: V2.shareTxt is not a function` (defined in `box.js`): `/pokemon/garchomp`
3. **Full static cross-chunk dependency scan — 36 `V2.*` properties** defined inside one split route chunk are referenced by other chunks or `MAIN` (`home.js`, `team.js`, `monsheet.js`, `shell.js`, `record.js`, `dispatch.js`, `stampede-*.js`, `bridge.js`).
4. **Serial Fast 3G waterfall on split routes:** Without `<link rel="preload" as="script" href="/routes/<rk>.js">` in `<head>`, `V2.loadRoute()` did not even start fetching `/routes/pokemon.js` until after `v2.js` finished downloading and executing — queuing it behind 17 concurrent `/data/*.json` requests (`speed-check.mjs` hit `134,864 ms` on `/pokemon/garchomp` before the preload fix).

## 2. Minimal Code-Path Fixes Applied (Zero Visible Change)
- [`public-site.mjs`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/public-site.mjs#L23): added `--split-routes` to the Cloudflare public build args.
- [`app/src/v2/kit.js`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/app/src/v2/kit.js#L123-L145): hoisted the 14 tiny shared cross-route render helpers (`BT_TOOLS`, `battleToolsBar`, `battleMoreTools`, `tourTabs`, `pkTabs`, `raNums`, `raPct`, `gsShare`, `wkTip`, `shareTxt`, `bars`, `monSlug`, `pubSlug`, `pkFocusName`) into `kit.js` (always in `v2.js`). Identical definitions, zero visible change.
- [`app/build.mjs`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/app/build.mjs#L316-L328): added `<link rel="preload" as="script" href="/routes/<rk>.js?v=<hash>">` in `<head>` on pre-generated Pokémon pages and tool pages when `SPLIT_ROUTES` is enabled, so each page's route chunk downloads in parallel with `/v2.js` (0 extra CSP hashes).

## 3. `speed-check.mjs` Measurements (390×844, 4× CPU, Fast 3G)
Comparison of **Baseline** (`origin/alt/day-batch3`), **Job 57** (external items + shared `/v2.css`), and **Job 58** (+ `--split-routes` + route preload):

| Page | LCP Baseline | LCP Job 57 | LCP Job 58 | Job 57→58 Delta | Transfer Job 57 | Transfer Job 58 | Reqs (57→58) | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Home (`/`) | 11,565 ms | 5,570 ms | **4,909 ms** | -661 ms | 1,555.9 KB | **1,405.1 KB** | 49 → 74 | 0 |
| Pokémon A-Z (`/pokemon`) | 1,779 ms | 1,792 ms | **1,782 ms** | -10 ms | 266.2 KB | **266.2 KB** | 7 → 7 | 0 |
| Garchomp (`/pokemon/garchomp`) | 11,209 ms | 5,452 ms | **4,872 ms** | -580 ms | 1,092.0 KB | **1,185.4 KB** | 26 → 26 | 0 |
| Incineroar (`/pokemon/incineroar`) | 11,168 ms | 5,401 ms | **4,832 ms** | -569 ms | 1,012.7 KB | **1,022.5 KB** | 23 → 24 | 0 |
| Mega Absol (`/pokemon/absol-mega`) | 11,174 ms | 5,425 ms | **4,842 ms** | -583 ms | 1,087.5 KB | **1,024.3 KB** | 26 → 26 | 0 |
| Natures (`/natures`) | 10,948 ms | 5,205 ms | **4,526 ms** | -679 ms | 1,062.4 KB | **870.3 KB** | 22 → 23 | 0 |
| Popular Sets (`/sets`) | 10,964 ms | 5,250 ms | **4,668 ms** | -582 ms | 1,165.7 KB | **1,087.9 KB** | 31 → 32 | 0 |
| Meta / Ratings (`/meta`) | 11,015 ms | 5,321 ms | **4,700 ms** | -621 ms | 1,383.4 KB | **1,395.3 KB** | 40 → 41 | 0 |
| News & Gifts (`/gifts`) | 10,857 ms | 5,143 ms | **4,511 ms** | -632 ms | 1,041.0 KB | **888.6 KB** | 26 → 24 | 0 |
| My Team (`/team`) | 11,291 ms | 5,544 ms | **4,783 ms** | -761 ms | 1,076.6 KB | **1,185.4 KB** | 30 → 29 | 0 |

- `dist/v2.js` gzip transfer: **1,796.6 KB (baseline) -> 661.6 KB (Job 57) -> 539.7 KB (Job 58)** (`419 KB` brotli in `public-site-test.mjs`).
- **All 10 pages are now under the 1.50 MB transfer budget** (0.27–1.40 MB), `CLS = 0` on all 10 pages.
- Note on Home reqs (`49 -> 74`): faster LCP allowed more lazy crowd/card images to settle within the measurement window while still reducing total transfer bytes by 150 KB.

## 4. Verification After Fixes
- **22-route cold-load isolation sweep (`checked`):** `ALL 22 PASSED` (0 `pageerror`, 0 console errors, 0 `"This page didn't load."`).
- **Order 1 (`checked` after `node app/build.mjs --v2 --public --split --split-routes --one-art-size --art=art/`):**
  - `experiments/security-csp-test.mjs` — PASS
  - `app/test/seo-check.mjs` — ALL PASSED
  - `experiments/pokemon-pages-test.mjs` — ALL PASSED
  - `experiments/static-pages-test.mjs` — ALL PASSED
  - `experiments/pub-links-test.mjs` — ALL PASSED
  - `experiments/public-build-test.mjs` — ALL PASSED
  - `experiments/public-site-test.mjs` — ALL PASSED (`v2.js` 419 KB brotli, 963 files)
- **Order 2 (`checked` after `node app/test/v2-public.mjs`, GitHub's order):**
  - `app/test/v2-public.mjs` — ALL PASSED
  - `experiments/security-csp-test.mjs` — PASS
  - `app/test/seo-check.mjs` — ALL PASSED
  - `experiments/pokemon-pages-test.mjs` — ALL PASSED
  - `experiments/static-pages-test.mjs` — ALL PASSED
  - `experiments/pub-links-test.mjs` — ALL PASSED

## 5. Ship Decision Notes for HH
- **Pros:** Shaves another **570–760 ms** off Fast 3G LCP on every SPA page (`v2.js` gz `-122 KB`), brings **all 10 pages under 1.50 MB transfer**, and passes every public test in both build orders.
- **Remaining risk to weigh before shipping:** Static analysis still found secondary **interactive** cross-chunk calls not exercised on initial page render:
  - `V2.btSetOpp` (`battle.js`) called from `events.js`, `gauntlet.js`, `home.js`, `winning.js` ("Plan vs this team" buttons)
  - `V2.cxGo` (`compare.js`) called from `build.js`, `team.js` ("Compare" buttons)
  - `V2.wtChips` / `V2.wtCard` (`winning.js`) called from `events.js` (expanded event cards)
  - `V2.arScene` (`archetypes.js`) and `V2.ticket` (`events.js`) called from `thisweek.js`
  - `V2.plotFit` (`build-plot.js`) called from `calc-plot.js`
  - `V2.FB` (`feedback.js`) called from `shell.js`, `calc.js`, `pokemon.js`
  - `V2.evUi` / `V2.evCal` / `V2.evScrollTo` (`events.js`), `V2.wkTechBtn` (`thisweek.js`) called from `dispatch.js`
  - If a user clicks one of those buttons before visiting the defining route, that click handler could fail unless guarded with `V2.loadRoute(...)` or hoisted.
- **Bigger remaining LCP lever (to get under 2.5 s):** Even with all 22 routes split out, `v2.js` is still **539.7 KB gz** (1,676 KB raw) because of the inlined static data tables (`data.js`, `move-meta.js`, `info-text.js`, `sets-data.js`) and shared engine logic. Lazy-loading data tables (or static HTML pre-rendering like `/pokemon` at 1.78 s) is what unlocks `< 2.5 s` LCP.

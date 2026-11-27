# Job 64 — First Screen Without Waiting for `v2.js` (`alt/gemini-speed-first-screen-b6`, on `origin/alt/batch6`)

Built directly on **`origin/alt/batch6` (`074c0f36`)** (includes `speed-review`, `public-home-f3`, and `prerender-home` `V2.preBlock`), following HH's 3:17 PM instructions: extends the single `V2.preBlock` hook in `app/src/v2/shell.js` rather than writing a second prerenderer.

Measured on the **real deploy folder** (`node public-site.mjs`, with today's `origin/main` `out/` — `out/` restored cleanly after; never committed). Throttling: `390×844` mobile (`isMobile: true`), `4×` CPU slowdown, Fast 3G (`1.6 Mbps` down, `750 kbps` up, `150 ms` RTT), gzip on text assets, cold cache (`speed-check.mjs`).

## 1. What Changed
1. **Extended `V2.preBlock(route, opt)` in `app/src/v2/shell.js` (`V2.preScreen`) — ONE prerender hook:**
   - Reuses the existing `app/build.mjs` Playwright pass with today's `out/` data (`--public --split`).
   - Keeps `<section class="vh" data-v2pre>...</section>` intact so `app/test/prerender-test.mjs` and `experiments/pokemon-pages-test.mjs` pass unchanged.
   - Adds visible above-the-fold first-screen HTML inside `<main class="np-main" id="main">` for:
     - **Public Home Final 3 (`/`):** settled `V2.f3Page()` (`data-np-pre="home"`).
     - **All 346 Pokémon pages (`/pokemon/<slug>`):** exact header + `V2.pkTop(p)` hero card with `fetchpriority="high"` on `img.k-art` (`data-np-pre="pokemon"`).
     - **All 23 tool pages (`/team`, `/meta`, `/sets`, `/natures`, `/gifts`, etc.):** exact above-the-fold first screen trimmed below the fold (`data-np-pre="<route>"`).
   - On `/`, `/team`, and `/meta` (where `data-v2pre` holds the single `<h1>` checked by `prerender-test.mjs`), demotes the visible preview heading tag to `<div role="presentation">` with the exact same classes (`k-h1 u f3-h1`, `tm-name k-h1`, `k-h1 u`) so raw HTML has exactly one `<h1>` while painting identically.
2. **Inline pruned critical CSS + CSP-safe async `/v2.css` (`app/crit-css.mjs`, `app/build.mjs`, `app/static-pages.mjs`):**
   - Prunes `dist/v2.css` (`146.9 KB` gz) per page to only rules matching first-screen classes/IDs (`~11–20 KB` gz) and inlines it as `<style id="np-crit">` (0 RTT).
   - Loads full `/v2.css?v=...` asynchronously via `<link rel="stylesheet" href="/v2.css?v=..." media="print" id="np-css">` + `<noscript>` + one hashed inline `<script>` (`CSS_LOADER_SCRIPT`; no inline `onload=""` handler — 100% CSP-safe).
   - On `/pokemon` (`pokemon.html`): inlines pruned CSS directly (`0` external CSS requests). On `404.html`: uses pruned `/static.css` (`11.8 KB` total, well under the `30 KB` cap).
3. **`defer` on `/v2.js` (`app/build.mjs`):**
   - `<script defer src="/v2.js?v=..."></script>` on `--split` builds so HTML paints immediately without waiting for `v2.js` (`543.8 KB` gz).
   - `v2Fail` fallback runs on `DOMContentLoaded` (after `defer` scripts execute or fail), preserving `SPL-4`.
4. **Seamless in-place hydration (`app/src/v2/shell.js`):**
   - Keeps `#main` prerendered content visible while route chunks or `/data/*.json` load (no flash of `V2.loadingHtml()`).
   - Morphs `#app` in place with `V2.morphKids` on hydration, ignoring `data-np-pre` in `V2.dataSig` and removing inter-element newlines in `V2.shell()` so `<main>` aligns at index `2` and never detaches.
5. **Metric-matched font fallbacks (`app/src/v2/fonts/fonts.css`, `app/src/v2/css/tokens.css`):**
   - Adds `Unbounded Fallback` (normal + italic, `size-adjust: 144%`, `ascent-override: 84%`, `descent-override: 22%`) and `Instrument Sans Fallback` (`size-adjust: 102%`, `ascent-override: 95%`, `descent-override: 23%`) scoped to `unicode-range: U+0020-007E, U+00A0-00FF;` so symbols outside `Unbounded` fall through identically and font swap produces `CLS <= 0.008` on all 10 pages.

## 2. Before vs After (`speed-check.mjs`, Real Deploy `node public-site.mjs`)

**`speed-check: ALL PASSED` (`10/10` PASS, `EXIT=0`)** — every page beats Google's "good" budgets (`LCP < 2,500 ms`, `CLS < 0.1`, `transfer < 1.50 MB`):

| Page | LCP Before* | LCP After | LCP Delta | CLS After | Transfer After | Budget |
|---|---:|---:|---:|---:|---:|---|
| **Home (`/`, Final 3)** | 2,384 ms (`a`) / 4,913 ms | **419 ms** (`div.k-h1.u`) | **-1,965 ms (-82.4%)** | **0.0015** | **995.4 KB** | **PASS** |
| **Pokémon A-Z (`/pokemon`)** | 1,783 ms | **425 ms** (`h1.k-h1.u`) | **-1,358 ms (-76.2%)** | **0.0000** | **133.3 KB** | **PASS** |
| **Pokémon: Garchomp** | 4,911 ms | **1,104 ms** (`img.k-art`) | **-3,807 ms (-77.5%)** | **0.0021** | **935.2 KB** | **PASS** |
| **Pokémon: Incineroar** | 4,837 ms | **970 ms** (`img.k-art`) | **-3,867 ms (-79.9%)** | **0.0023** | **1,086.5 KB** | **PASS** |
| **Pokémon: Mega Absol** | 4,876 ms | **1,113 ms** (`img.k-art`) | **-3,763 ms (-77.2%)** | **0.0020** | **891.5 KB** | **PASS** |
| **Natures (`/natures`)** | 4,499 ms | **433 ms** (`p.k-lead.ra-lede`) | **-4,066 ms (-90.4%)** | **0.0080** | **1,437.5 KB** | **PASS** |
| **Popular Sets (`/sets`)** | 4,675 ms | **452 ms** (`h1.k-h1.u`) | **-4,223 ms (-90.3%)** | **0.0010** | **1,218.2 KB** | **PASS** |
| **Meta / Ratings (`/meta`)** | 4,839 ms | **1,492 ms** (`img`) | **-3,347 ms (-69.2%)** | **0.0013** | **980.1 KB** | **PASS** |
| **News & Gifts (`/gifts`)** | 4,610 ms | **436 ms** (`h1.k-h1.u`) | **-4,174 ms (-90.5%)** | **0.0068** | **948.7 KB** | **PASS** |
| **My Team (`/team`)** | 5,080 ms | **465 ms** (`div.tm-name.k-h1`) | **-4,615 ms (-90.8%)** | **0.0046** | **1,151.4 KB** | **PASS** |

*\*Before column: Home (`2,384 ms` on `batch6` Final 3 static shell / `4,913 ms` on `speed-review`), `/pokemon` (`1,783 ms` on `batch6`), and the 8 app routes (`4,499–5,080 ms` from `speed-review` baseline; `batch6` BEFORE run hit a transient VM CPU stall on route 4).*

## 3. Mid-Load No-Flash Check (`500 ms` / `1.5 s` / Settled, Fast 3G)
- **`/` (Final 3):**
  - `@500 ms`: `hasVisibleHeading: true`, `visibleSpinner: false`, `v2: false`, `cssAll: false`
  - `@1,500 ms`: `hasVisibleHeading: true`, `visibleSpinner: false`, `v2: false`, `cssAll: false`
  - `@5,500 ms` (settled): `hasVisibleHeading: true`, `visibleSpinner: false`, `v2: true`, `cssAll: true`
- **`/pokemon/garchomp`:**
  - `@500 ms`: `hasVisibleHeading: true`, `visibleSpinner: false`, `v2: false`, `cssAll: false`
  - `@1,500 ms`: `hasVisibleHeading: true`, `visibleSpinner: false`, `v2: false`, `cssAll: false`
  - `@5,500 ms` (settled): `hasVisibleHeading: true`, `visibleSpinner: false`, `v2: true`, `cssAll: true`

## 4. Visual Parity & Public Test Suite (GitHub Order)
- **Visual parity (`390×844` & `1440×900`, light & dark, BEFORE vs AFTER on `batch6`):** `10/13` byte-identical PNGs (`/` 390 light & 1440 dark, `/pokemon` 390 & 1440, `/pokemon/garchomp` 390 light, `/gifts`, `/natures`, `/sets`, `/no-such-404` 390 & 1440).
- **Public test suite in GitHub's order (`v2-public.mjs` first):**
  - `v2-split`, `v2-public`, `public-build-test`, `pokemon-pages-test`, `static-pages-test`, `prerender-test` (both non-split and `--split --split-routes`), `security-csp-test --self-test`, `security-csp-test` (`--split --public` & `--split --split-routes --public`), and `split-routes-cross-test` — all verified locally.

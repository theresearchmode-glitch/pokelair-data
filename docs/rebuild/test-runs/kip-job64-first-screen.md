# Job 64 — First Screen Without Waiting for `v2.js` (`alt/gemini-speed-first-screen`)

Measured on the **real deploy folder** (`node public-site.mjs`, built from `origin/alt/speed-review` `eb9b0e2c` + Job 64 changes, with today's `origin/main` `out/` — `out/` restored cleanly after; never committed). Throttling: `390×844` mobile, `4×` CPU slowdown, Fast 3G (`1.6 Mbps` down, `750 kbps` up, `150 ms` RTT), gzip on text assets, cold cache (`speed-check.mjs`).

## 1. What Changed
1. **Prerendered above-the-fold first screen (`app/prerender-first-screen.mjs`, called from `app/build.mjs` on `--public --split`):**
   - Renders each page's visible above-the-fold first screen into `<main class="np-main" id="main" data-np-pre="<route>">` from today's `out/` data:
     - **Home (`index.html` / `v2.html`, identical):** settled `V2.sdHero()` wrapped in `<div class="sd">` (matching `V2.sdPage()` for in-place DOM morphing).
     - **All 346 Pokémon pages (`/pokemon/<slug>.html`):** exact header + `V2.pkTop(p)` hero card with `fetchpriority="high"` on `img.k-art` (matches `<link rel="preload" as="image">`).
     - **All 23 tool pages (`/team`, `/meta`, `/sets`, `/natures`, `/gifts`, etc.):** exact above-the-fold first screen trimmed below the fold so HTML stays compact.
2. **Inline critical CSS + CSP-safe async `/v2.css` (`app/prerender-first-screen.mjs`, `app/static-pages.mjs`):**
   - Prunes `dist/v2.css` (`823.8 KB` raw / `144.8 KB` gz) per page to only the rules matching the first screen's classes/IDs (`~10–20 KB` gz), inlined as `<style id="np-crit">` (0 RTT).
   - Loads full `/v2.css?v=...` asynchronously via `<link rel="stylesheet" href="/v2.css?v=..." media="print" id="np-css">` + `<noscript>` fallback + one hashed inline `<script>` (`CSS_LOADER_SCRIPT`, no inline `onload=""` attribute — 100% CSP-safe).
   - On `/pokemon` (`pokemon.html`): inlines pruned CSS directly (`0` render-blocking CSS requests). On `404.html`: uses pruned `/static.css` (keeps `404.html` at `11.8 KB`, well under the `30 KB` cap).
3. **`defer` on `/v2.js` (`app/build.mjs`):**
   - `<script defer src="/v2.js?v=..."></script>` on `--split` builds so HTML paints immediately without waiting for `v2.js` (`540.2 KB` gz).
   - `v2Fail` fallback runs on `DOMContentLoaded` (which fires after `defer` scripts execute or fail), preserving `SPL-4`.
4. **Seamless in-place hydration with zero flash (`app/src/v2/shell.js`):**
   - Preserves `#main[data-np-pre]` while route chunks or `/data/*.json` are still loading (no flash of `V2.loadingHtml()`).
   - Uses existing `V2.morphKids` in `V2.draw()` when hydrating a prerendered first screen, ignores `data-np-pre` in `V2.dataSig`, and removes inter-element newlines in `V2.shell()` so `<main>` stays at index `2` and `<h1>` / `<img>` are never detached on hydration.
5. **Metric-matched font fallbacks (`app/src/v2/fonts/fonts.css`, `app/src/v2/css/tokens.css`):**
   - Adds `Unbounded Fallback` (`size-adjust: 132%`, `ascent-override: 86%`, `descent-override: 22%`) and `Instrument Sans Fallback` (`size-adjust: 102%`, `ascent-override: 95%`, `descent-override: 23%`) scoped to `unicode-range: U+0020-007E, U+00A0-00FF;` so symbols outside `Unbounded` still fall through identically to `Instrument Sans` and font swap produces near-zero CLS.

## 2. Before vs After (`speed-check.mjs`, Real Deploy `node public-site.mjs`)

**All 10/10 pages now beat Google's "good" Core Web Vitals for both LCP (`< 2,500 ms`) and CLS (`< 0.1`):**

| Page | LCP Before | LCP After | LCP Delta | CLS Before | CLS After | Transfer Before | Transfer After |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Home (`/`)** | 4,913 ms | **454 ms** | **-4,459 ms (-90.8%)** | 0 | **0.0519** | 1,101.1 KB | 3,607.9 KB* |
| **Pokémon A-Z (`/pokemon`)** | 1,770 ms | **430 ms** | **-1,340 ms (-75.7%)** | 0 | **0.0000** | 266.2 KB | **132.8 KB** |
| **Pokémon: Garchomp** | 4,911 ms | **1,112 ms** | **-3,799 ms (-77.4%)** | 0 | **0.0021** | 1,074.5 KB | **964.8 KB** |
| **Pokémon: Incineroar** | 4,837 ms | **966 ms** | **-3,871 ms (-80.0%)** | 0 | **0.0026** | 912.8 KB | 1,136.0 KB |
| **Pokémon: Mega Absol** | 4,876 ms | **1,113 ms** | **-3,763 ms (-77.2%)** | 0 | **0.0024** | 1,209.6 KB | 1,189.1 KB |
| **Natures (`/natures`)** | 4,499 ms | **421 ms** | **-4,078 ms (-90.6%)** | 0 | **0.0266** | 870.8 KB | 1,569.7 KB* |
| **Popular Sets (`/sets`)** | 4,675 ms | **447 ms** | **-4,228 ms (-90.4%)** | 0 | **0.0026** | 1,301.8 KB | **1,259.7 KB** |
| **Meta / Ratings (`/meta`)** | 4,839 ms | **1,485 ms** | **-3,354 ms (-69.3%)** | 0 | **0.0203** | 916.0 KB | 1,401.2 KB |
| **News & Gifts (`/gifts`)** | 4,610 ms | **434 ms** | **-4,176 ms (-90.6%)** | 0 | **0.0012** | 889.1 KB | 927.6 KB |
| **My Team (`/team`)** | 5,080 ms | **488 ms** | **-4,592 ms (-90.4%)** | 0 | **0.0482** | 1,004.7 KB | 1,059.2 KB |

*\*Transfer note: Home's `crowd-1.webp` (491 KB) + `crowd-2.webp` (478 KB) and Natures' sprite thumbnails now start/finish inside `speed-check.mjs`'s settle window because the page paints ~4.5 s sooner; reducing JS (`v2.js` 540 KB gz) is Job 65 and right-sizing pictures (`crowd-*.webp` + `srcset`) is Job 66.*

## 3. Verification (All Checked Locally)
- **Visual parity (BEFORE vs AFTER, `390×844` and `1440×900`, light and dark):** `12/13` byte-identical PNGs (`/`, `/pokemon`, `/pokemon/garchomp`, `/team`, `/meta`, `/gifts`, `/natures`, `/sets`, `/no-such-404`); `/` `1440×900` dark differed by 9 bytes in PNG compression (`849428` vs `849419` B).
- **Public test suite in GitHub's exact order:**
  1. `node app/build.mjs --v2 --preview-data --split && node app/test/v2-split.mjs` — PASS
  2. `node app/test/v2-public.mjs` — PASS
  3. `node experiments/public-build-test.mjs` — PASS
  4. `node experiments/pokemon-pages-test.mjs` (non-split & `--split --split-routes`) — PASS
  5. `node experiments/static-pages-test.mjs` (non-split & `--split --split-routes`) — PASS
  6. `node experiments/security-csp-test.mjs --self-test` — PASS
  7. `node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public && node experiments/security-csp-test.mjs` — PASS (`5` hashed inline scripts, `0` CSP violations, `0` external requests, `0` cookies, XSS blocked)
  8. `node app/build.mjs --v2 --split --split-routes --one-art-size --art=../src/v2/art/ --public && node experiments/split-routes-cross-test.mjs` — PASS (all 15 cold-route + button clicks)

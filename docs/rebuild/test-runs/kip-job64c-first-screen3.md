# Job 64c — First Screen Without Waiting for `v2.js` (`alt/gemini-speed-first-screen3`, on `origin/alt/f3-claude`)

Branched directly from **`origin/alt/f3-claude` (`99e172ba` = Final 3 Home on both builds + `origin/claude/design6` `23520831` batch7)** per HH's 6:04 PM instructions, bringing in `c617c3bd` (`alt/gemini-speed-first-screen-b6`).

## 1. Key Job 64c Requirements Addressed
1. **Resolved `app/static-pages.mjs` cleanly (keeping BOTH):**
   - `batch7`'s trimmed `/static.css` (`pruneCss(v2Css, pokHtml + nfHtml + fit)`) is written to `dist/static.css` and linked by `404.html` (`12.1 KB`, well under the `30 KB` cap).
   - `64b`'s inline pruned critical CSS (`<style id="np-crit">`) is inlined into `/pokemon` (`pokemon.html`) for 0-RTT first paint.
2. **`V2.preScreen('home')` (`app/src/v2/shell.js`):**
   - Uses Final 3 exclusively (`V2.f3Page()` / `.f3-home` hero only; Stampede fallback removed), compatible with `V2.f3Home()`'s Top 10 / six / tools / post bands below the hero on hydration.
   - Reuses the single `V2.preBlock` hook (no second prerenderer); `prerender-test.mjs` passes unchanged (`14/14` PASS).
3. **Fallback fonts (`app/src/v2/fonts/fonts.css`, `app/src/v2/css/tokens.css`):**
   - `Unbounded Fallback` (`font-style: normal`, `font-weight: 100 900`, `size-adjust: 144%`, `ascent-override: 84%`, `descent-override: 22%`) and `Instrument Sans Fallback` (`size-adjust: 102%`, `ascent-override: 95%`, `descent-override: 23%`), both scoped to `unicode-range: U+0020-007E, U+00A0-00FF;`.
   - Note: an earlier `font-style: italic` block on `Unbounded Fallback` was removed after `v2-minors` caught that Chromium preferred `Unbounded Fallback:italic` over `Unbounded:normal` synthetic oblique for italic `.u` elements.

## 2. Step 5 — Fallback Fonts at `0 ms` (`.woff2` Blocked) vs Real Font Loaded
Before/after first-paint PNGs saved in `docs/rebuild/test-runs/job64c-fonts/` (`390×844` light and `1440×900` dark for `/` and `/pokemon/garchomp`), measured with `.woff2` blocked (`0 ms` fallback) vs real fonts loaded, plus isolated **font-swap-only CLS** (`.woff2` delayed `600 ms`, `v2.js` held in-flight):

| Page & Viewport | Fallback (`0 ms` `.woff2` blocked) | Real Font Loaded | Delta (`dH` / `dW`) | Font-Swap-Only CLS |
|---|---|---|---|---:|
| **Home `/` · `390×844` light** | `h=84 px`, `maxW=342 px` | `h=84 px`, `maxW=342 px` | **`0 px` / `0 px`** | **`0.0000`** |
| **Home `/` · `1440×900` dark** | `h=317 px`, `maxW=452 px` | `h=317 px`, `maxW=454 px` | **`0 px` / `+2 px`** | **`0.0041`** |
| **Garchomp `/pokemon/garchomp` · `390×844` light** | `h=81 px`, `maxW=279 px` | `h=81 px`, `maxW=287 px` | **`0 px` / `+8 px`** | **`0.0000`** |
| **Garchomp `/pokemon/garchomp` · `1440×900` dark** | `h=84 px`, `maxW=582 px` | `h=84 px`, `maxW=580 px` | **`0 px` / `-2 px`** | **`0.0088`** |

## 3. `speed-check.mjs` on Real `node public-site.mjs` Deploy (`origin/main` `out/`, `out/` Restored)
- **`speed-check: ALL PASSED` (`EXIT=0`, `10/10` PASS):**
  - **Home (`/`):** `LCP=437 ms` (`div.k-h1.u`), `CLS=0.0007`, `transfer=1,186.6 KB` (`431 ms` / `0.0007` CLS after removing italic fallback)
  - **Pokémon A-Z (`/pokemon`):** `LCP=441 ms` (`h1.k-h1.u`), `CLS=0`, `transfer=133.3 KB`
  - **Garchomp / Incineroar / Mega Absol:** `LCP=962–1,111 ms` (`img.k-art`), `CLS=0.0020–0.0023`, `transfer=935.9–1,172.1 KB`
  - **Natures / Sets / Gifts / My Team:** `LCP=432–456 ms`, `CLS=0.0010–0.0081`, `transfer=955.6–1,386.9 KB`
  - **Meta / Ratings (`/meta`):** `LCP=1,482 ms` (`img`), `CLS=0.0013`, `transfer=979.3 KB`

## 4. Verification Matrix (Exit Codes)
| Check | Result | Exit Code |
|---|---|---:|
| `speed-check.mjs` (10 pages, real `public-site.mjs` deploy) | **10/10 ALL PASSED** | `0` |
| `node app/build.mjs --v2 --preview-data --split && node app/test/v2-split.mjs` | **PASS** | `0` |
| `node app/test/v2-public.mjs` | **PASS** | `0` |
| `node experiments/public-build-test.mjs` | **PASS** | `0` |
| `node experiments/pokemon-pages-test.mjs` (non-split & `--split --split-routes`) | **PASS** | `0` |
| `node experiments/static-pages-test.mjs` (non-split & `--split --split-routes`) | **PASS** | `0` |
| `node app/test/prerender-test.mjs` (non-split & `--split --split-routes`) | **PASS (14/14)** | `0` |
| `node experiments/security-csp-test.mjs --self-test` | **PASS** | `0` |
| `node experiments/security-csp-test.mjs` (`--split --public` & `--split --split-routes --public`) | **PASS (5 hashed inline scripts, 0 violations)** | `0` |
| `node experiments/split-routes-cross-test.mjs` | **PASS (all cold routes + buttons)** | `0` |
| `node experiments/switch-smoke.mjs` | **ALL PASSED (phone + desktop, 10 views)** | `0` |
| `v2-minors` (`PART=main1`, `main2`, `groups`) | Local runs hit 10-min VM timeout; full 3-part `v2-minors` on frozen `TEST_DATA` runs in GitHub Actions CI on this branch | CI |

## 5. HH Review Fixes (7:04 PM, 7:06 PM, 7:36 PM)
1. **Fallback font overlap fix (`app/src/v2/fonts/fonts.css`):**
   - Switched `Unbounded Fallback` to bold local faces (`local('Arial Bold'), local('Arial-BoldMT'), local('Liberation Sans Bold'), local('DejaVu Sans Bold'), local('Helvetica Bold')`) with `size-adjust: 124%; ascent-override: 62%; descent-override: 17%; line-gap-override: 0%` (`1.24 * 0.79 = 0.980 <= 1.00`, eliminating vertical glyph overlap inside `line-height: 1.0` headlines while keeping `dH = 0 px`).
   - Regenerated all 8 `0 ms` PNGs in `docs/rebuild/test-runs/job64c-fonts/` and visually verified `home-390-light-0ms-fallback.png` and `home-1440-dark-0ms-fallback.png` (bold, crisp, 0 touching lines):
     - `home-390-light`: `dH=0 px`, `swapCLS=0.0028`
     - `home-1440-dark`: `dH=0 px`, `swapCLS=0.0089`
     - `garchomp-390-light`: `dH=0 px`, `swapCLS=0.0034`
     - `garchomp-1440-dark`: `dH=0 px`, `swapCLS=0.0066`
2. **Throttled CLS fix on `/team` (`app/src/v2/pages/team.js`):**
   - Root cause diagnosed via `PerformanceObserver` `layout-shift` with `sources`: inside `.pty2`, `P.mtf-acts` (`order: 2`) and `DIV.k-sent.u` (`order: 3`) came BEFORE `.mtf` (`order: 1`, ~20 KB) in the DOM, so over Fast 3G streaming HTML painted `P.mtf-acts` at `y=528` and `DIV.k-sent.u` at `y=648` before `.mtf` arrived and shoved them off-viewport (`CLS=0.1442` at `t=508 ms`).
   - Split `mtfHead` into `mtfTop` + `V2.mtfFrame(D, sel)` + `mtfFoot` (both `mtfTop`/`mtfFoot` wrapped in `.mtf-head.tmk-head` with `display: contents` on `.pty2`, zero visual change on mobile or desktop).
3. **Committed `experiments/page-speed-check.mjs` and `experiments/first-screen-guard.mjs`:**
   - **Before (`6950745e`):** `SPEED_DIST=/tmp/site-64c node experiments/first-screen-guard.mjs` -> **`4 FAILED`** (`font-overlap / 390x844: 15px`, `/ 1440x900: 33.6px`, `/pokemon/garchomp 390x844: 21.4px`, `throttled-CLS /team: 0.1487 >= 0.1`).
   - **After (this commit):** `SPEED_DIST=/tmp/site-64c-fix node experiments/first-screen-guard.mjs` -> **`6/6 ALL PASSED` (`EXIT=0`)**: `0 px` overlap on all 4 views, `throttled-CLS /: 0.0019`, `throttled-CLS /team: 0.0055`.
   - `SPEED_DIST=/tmp/site-64c-fix node experiments/page-speed-check.mjs`: **`10/10 ALL PASSED` (`EXIT=0`)**.
   - `node app/test/prerender-test.mjs`: **`14/14 ALL PASSED` (`EXIT=0`)**.


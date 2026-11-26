# Job 63 — Where the 4.6–4.9 s Goes (CDP Trace Breakdown, `alt/gemini-speed-trace`)

Measured on the **real deploy folder** (`node public-site.mjs`, built from `origin/alt/speed-review` `eb9b0e2c` with today's `origin/main` `out/` — `out/` restored cleanly after; zero code changes). Throttling: `390×844` mobile, `4×` CPU slowdown, Fast 3G (`1.6 Mbps` down, `750 kbps` up, `150 ms` RTT), gzip on text assets, cold cache.

> Note on `origin/alt/prerender-home` (`c853295e`): inspected `alt/prerender-home`; its `V2.preBlock` puts SEO words in a visually hidden (`vh`) block beside the loading panel, so it does not paint a visible LCP element yet. Making the visible first screen paint LCP before `v2.js` runs is Job 64.

## 1. Per-Page Waterfall Split (Playwright CDP Trace + Resource Timing)

| Phase / Metric | Home (`/`) | Garchomp (`/pokemon/garchomp`) | My Team (`/team`) | Meta (`/meta`) | News (`/#news`) |
|---|---|---|---|---|---|
| **LCP element** | `h1.u.sdh-h` | `img.k-art` | `h1.tm-name.k-h1` | `p.ra-lede` | `h1.k-h1.u` |
| **LCP** | **4,824 ms** | **4,805 ms** | **4,703 ms** | **4,748 ms*** | **4,502 ms** |
| **First Paint / FCP** (static shell) | 2,307 ms | 2,489 ms | 2,304 ms | 2,354 ms | 2,294 ms |
| **CLS** | 0 | 0.0153 | 0.0335 | 0.0193 | 0 |
| **HTML download** (`~25.7 KB` gz) | 0–280 ms | 0–283 ms | 0–280 ms | 0–281 ms | 0–279 ms |
| **Fonts** (`2× .woff2`, `106.3 KB`) | 179–1,368 ms | 183–6,268 ms (3 files) | 180–1,381 ms | 182–1,418 ms | 179–1,366 ms |
| **CSS (`/v2.css`, `144.8 KB` gz)** | 188–2,240 ms | 191–2,427 ms | 186–2,245 ms | 191–2,289 ms | 185–2,238 ms |
| **Route chunk (`/routes/*.js`)** | — | 191–604 ms (`10.1 KB`) | — | 192–524 ms (`8.6 KB`) | — |
| **`v2.js` download (`540.2 KB` gz)** | **291–4,207 ms** | **288–4,386 ms** | **286–4,214 ms** | **283–4,250 ms** | **285–4,205 ms** |
| **Parse + Eval + `V2.draw()` (CPU)** | 507 ms eval / 140 ms layout | 63 ms eval / 65 ms layout | 422 ms eval / 111 ms layout | 58 ms eval / 50 ms layout | 237 ms eval / 33 ms layout |
| **Data fetches (17 `/data/*.json`, `311.6 KB` gz)** | 4,724–7,561 ms | 4,468–6,741 ms | 4,651–6,461 ms | 4,318–6,124 ms | 4,461–6,288 ms |
| **Images** | 4,712–7,926 ms (`286.8 KB`+) | 191–6,855 ms (`103.4 KB`) | 4,672–7,053 ms (`136.7 KB`) | 4,592–8,027 ms (`397.2 KB`) | 4,472–6,858 ms (`132.5 KB`) |

*\*Meta LCP `4,748 ms` (`p.ra-lede`) from `speed-check.mjs` on the identical `site-j61-before` build; in the 7 s CDP trace window an image swap fired later.*

### Why Every Page Lands at ~4.5–4.8 s
1. **The browser cannot paint ANYTHING until `/v2.css` (`144.8 KB` gz) finishes at `~2,240–2,427 ms`** -> FCP is stuck at `~2.3–2.5 s` (already near the entire 2.5 s LCP budget!).
2. **Even after FCP, the page only shows the static loading spinner** — the real LCP element (`h1.u.sdh-h`, `img.k-art`, `h1.tm-name.k-h1`, `p.ra-lede`, `h1.k-h1.u`) is not in the DOM until synchronous `<script src="/v2.js">` (`540.2 KB` gz) finishes downloading at **`4,205–4,386 ms`** AND executes (`+237–507 ms`)!
3. On `/pokemon/garchomp`, `img.k-art` is preloaded at `191 ms` and sits ready in cache for **~4 seconds** waiting for `v2.js` to draw it.

## 2. Top 10 Costs in ms (with `file:line`, Fix, and Expected Saving)

| # | Cost (ms / KB) | Where (`file:line`) | Proposed Fix | Expected LCP / Transfer Saving |
|---:|---|---|---|---|
| 1 | **~3,920–4,100 ms** waiting for synchronous `/v2.js` (`540.2 KB` gz) before LCP element enters DOM | `app/build.mjs:197` (`<script src="v2.js?v=...">`), `app/build.mjs:260-264` (static loading shell only) | **Job 64:** Prerender visible above-the-fold first screen into HTML for `/`, `/pokemon/<slug>`, `/team`, `/meta`, `/gifts` + `defer` `v2.js` | **-2,500 to -3,200 ms LCP** (LCP paints from HTML before `v2.js` finishes!) |
| 2 | **~2,050–2,240 ms** render-blocking `/v2.css` (`823.8 KB` raw / `144.8 KB` gz, 27 layers; `pages.css` alone is `519.5 KB` raw / `117.4 KB` gz) | `app/build.mjs:300`, `app/parts-v2.json:4-39`, `app/src/v2/css/pages.css` | **Job 64:** Inline ~12 KB gz critical first-screen CSS (same pruner as Job 61 `static.css`) and load full `/v2.css` asynchronously (`media="print" onload="this.media='all'"`) | **-1,100 to -1,500 ms FCP & LCP** (as proven on `/pokemon`: `1,756 -> 1,054 ms`) |
| 3 | **~134 KB gz (`503.1 KB` raw)** of `src/data/data.js` (`ROSTER`/`LEARN`/`MOVES`/`ABIL`/`RESULTS`) parsed synchronously up front | `app/parts-v2.json:42`, `app/build.mjs:99` | **Job 65:** Split `LEARN`/`MOVES`/`ABIL`/`RESULTS` (only needed for Calc/Team/Build/Info sheets) out of `v2.js` into a lazy `/data/engine-data.json` loaded on demand or after first paint | **-100 KB gz** from `v2.js`, **-650 ms** JS download + **-150 ms** parse/eval |
| 4 | **~180 KB gz (`348.6 KB` gz total `P.logic`)** of heavy engines (`39-damage-calc-speed.js` 82.6 KB, `29-fix-planner.js` 62.9 KB, `55-threats.js` 41.6 KB, `22-auto-build.js` 38.9 KB, `40-turn-one-data.js` 38.8 KB) + dead old-page renderers (`08-render-all.js` 38.3 KB, `44-share-images.js` 31 KB) | `app/parts-v2.json:81-141`, `app/build.mjs:98-99` | **Job 65:** Strip dead old-page DOM renderers from `parts-v2.json` and lazy-load calc/planner/threats/auto-build engine chunk on first use (Team/Calc/Battle/Build) | **-120 to -180 KB gz** from `v2.js`, **-800 to -1,100 ms** JS download + **-200 ms** eval |
| 5 | **~16.4 KB gz (`63.6 KB` raw)** `src/data/info-text.js` + **~16.7 KB gz (`72.8 KB` raw)** `src/data/logo-sly.js` inlined in `v2.js` | `app/parts-v2.json:44,49` | **Job 65:** Load `info-text.js` lazily when an info sheet opens; serve logo SVGs from `/brand/*.svg` (like `static-pages.mjs:79` already does) | **-33 KB gz** from `v2.js`, **-180 ms** download |
| 6 | **~1,189 ms** font download (`106.3 KB`, `unbounded-latin.woff2` + `instrument-sans-latin.woff2`) competing with `/v2.css` at `179–1,368 ms` | `app/build.mjs:140-141`, `app/src/v2/fonts/fonts.css` | **Job 64:** Keep `font-display: swap` + `size-adjust`/`ascent-override` metric-matched fallbacks so text paints immediately with `CLS < 0.01`, preload only the primary weight | **-200 to -400 ms** text paint, keeps `CLS < 0.01` |
| 7 | **~507 ms (Home) / ~422 ms (My Team)** main-thread `EvaluateScript` + `V2.draw()` on 4× CPU before LCP | `app/src/v2/shell.js:590-601`, `app/src/v2/pages/team.js`, `app/src/v2/pages/home.js` | **Job 64 + 65:** Defer non-essential post-render work (`V2.kFit`, below-the-fold sections, planner warmup) to `requestIdleCallback` / post-paint | **-150 to -300 ms** TBT/INP & LCP |
| 8 | **~311.6 KB gz** (17 `/data/*.json` requests) fired all at once at `4,318–4,724 ms`, blocking `networkidle` for 2–3 s | `app/src/app/03-persistence.js:68-74` | **Job 61 (already built on `alt/gemini-speed-fix3`):** Route-prioritized `/data/*.json` loading (defer `practice.json`, `track.json`, etc. until after first paint) | **-100 to -200 KB gz** off initial data burst |
| 9 | **~970 KB** hero crowd sprite sheets (`crowd-1.webp` 491 KB + `crowd-2.webp` 478 KB) on Home (`/`) pushing Home transfer to `4.0 MB` and `window.load` to `49.5 s` | `app/src/v2/pages/stampede-hero.js`, `app/src/v2/art/crowd-*.webp` | **Job 66:** Mobile-sized crowd sheet (`srcset`/smaller resolution for 390px) + lazy-load / AVIF compression | **-600 to -750 KB** on Home transfer |
| 10 | **~103–397 KB** Pokémon sprites (`384px` single size via `--one-art-size` even for 40–80 px thumbnails on Meta/Team/Home) | `public-site.mjs:23`, `app/src/v2/shell.js:5-11` | **Job 66:** Re-enable `art-s/` (`240px` or `128px` thumbnails) on Cloudflare public site (no 511-file limit) + `srcset` + `loading="lazy"` below fold | **-150 to -250 KB** on Meta/Home/Team |

## 3. Recommended Execution Order to Hit `< 2.5 s` LCP
1. **Job 64 (Prerender visible first screen + critical CSS + `defer` `v2.js`):** Biggest single win — directly breaks the `v2.js` + `v2.css` dependency on LCP (`4.8 s -> ~1.2–1.8 s`).
2. **Job 65 (Shrink/lazy-load `v2.js`):** Cuts `v2.js` from `540 KB` gz toward `~200–250 KB` gz so hydration / interactivity (INP) happens quickly after first paint.
3. **Job 66 (Right-sized images / `srcset` / mobile crowd sheets):** Brings Home transfer from `4.0 MB` well under `1.5 MB` and trims Meta/Team image bytes.

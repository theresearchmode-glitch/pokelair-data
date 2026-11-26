# Job 60 — Speed Fixes 4 + 5 (`alt/gemini-speed-fix2`)

Branched from `origin/claude/design6` (`58137089`). Zero design or visible changes.

## Changes Made
1. **Fix 4 — Trimmed CSS for static pages ([`app/static-pages.mjs`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/app/static-pages.mjs#L103-L140), [`app/build.mjs`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/app/build.mjs#L250)):**
   - Prunes `dist/v2.css` down to only the CSS rules whose class/id selectors appear in `pokemon.html`, `404.html`, or `fit.js` (using the same safe token-pruning algorithm as `app/slim.mjs`, preserving `@layer`, `@media`, `@supports`, `@container`, `@keyframes`, `@font-face`), writes `dist/static.css`, and links `/static.css?v=<hash>` on `pokemon.html` (`/pokemon`) and `404.html`.
   - Added `/static.css` immutable `Cache-Control` header in `app/build.mjs`.
   - Note: `/pokemon/<slug>` and the 23 tool pages are SPA pages that run `v2.js` and navigate client-side to any route (and `pokemon-pages-test.mjs` asserts tool pages share `/v2.css`), so they continue sharing `/v2.css`.
2. **Fix 5 — Route-prioritized `/data/*.json` loading ([`app/src/app/03-persistence.js`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/app/src/app/03-persistence.js#L69-L93)):**
   - On `window.__NP_PUBLIC` (when `!c || !c.use`), fetches only the `/data/*.json` documents the current route needs for its first paint immediately, and defers the remaining `META_KEYS` until after first paint (`load` + `requestAnimationFrame` + `setTimeout(0)`, with a `2500 ms` safety fallback).
   - Preserves the single unified `META_KEYS.forEach` handler (`PUB-5` passes) and leaves Preview (`__NP_CLAUDE`) and Claude-artifact (`window.claude`) builds untouched.

## Static CSS Size Before vs After
| File | Before (`/v2.css`) | After (`/static.css`) | Delta |
|---|---:|---:|---:|
| Raw size | 823.8 KB | **42.4 KB** | **-781.4 KB (-94.9%)** |
| Gzip size | 144.5 KB | **12.0 KB** | **-132.5 KB (-91.7%)** |

## `speed-check.mjs` Before vs After (`--v2 --split --one-art-size --item-files --art=art/ --public`, 390×844, 4× CPU, Fast 3G)

| Page | LCP Before | LCP After | LCP Delta | Transfer Before | Transfer After | Reqs (B→A) | CLS (B→A) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home (`/`) | 5,690 ms | 5,664 ms | -26 ms | 4,277.4 KB | 1,296.0 KB | 76 → 31 | 0 → 0 |
| **Pokémon A-Z (`/pokemon`)** | **1,774 ms** | **1,041 ms** | **-733 ms (-41.3%)** | **266.2 KB** | **133.6 KB** | 7 → 7 | 0 → 0 |
| Garchomp (`/pokemon/garchomp`) | 5,449 ms | 5,447 ms | -2 ms | 1,080.4 KB | 1,243.4 KB | 25 → 25 | 0 → 0 |
| Incineroar (`/pokemon/incineroar`) | 5,404 ms | 5,397 ms | -7 ms | 1,186.5 KB | 1,023.8 KB | 23 → 23 | 0 → 0 |
| Mega Absol (`/pokemon/absol-mega`) | 5,440 ms | 5,441 ms | +1 ms | 1,076.9 KB | 1,077.1 KB | 25 → 25 | 0 → 0 |
| Natures (`/natures`) | 5,209 ms | 5,207 ms | -2 ms | 988.9 KB | 1,007.6 KB | 22 → 22 | 0 → 0 |
| Popular Sets (`/sets`) | 5,256 ms | 5,244 ms | -12 ms | 1,421.5 KB | 1,205.2 KB | 31 → 31 | 0 → 0 |
| Meta / Ratings (`/meta`) | 5,285 ms | 5,344 ms | +59 ms | 1,387.1 KB | 1,560.9 KB | 40 → 40 | 0 → 0 |
| News & Gifts (`/gifts`) | 5,146 ms | 5,134 ms | -12 ms | 1,068.1 KB | 1,041.5 KB | **26 → 13** | 0 → 0 |
| My Team (`/team`) | 5,559 ms | 5,573 ms | +14 ms | 1,121.3 KB | 1,362.4 KB | 29 → 29 | 0 → 0 |

**Honest takeaway:**
- Fix 4 is a huge, clean win on static pages: `/pokemon` LCP dropped **1,774 ms -> 1,041 ms (-41.3%)** and transfer halved (**266.2 KB -> 133.6 KB**).
- Fix 5 cleanly eliminates non-critical initial `/data/*.json` contention (e.g. `/gifts` dropped **26 -> 13** requests; Home **76 -> 31** requests during first load), while SPA LCP remains bounded by `/v2.js` (662 KB gz) + `/v2.css` (145 KB gz) downloading before `03-persistence.js` executes.

## Visual Parity & Data Parity (`checked`)
- **Static pages (`/pokemon`, `404`) at 390×844 & 1440×900, light & dark (8 screenshots):** **0 changed pixels** on all 8 (byte-identical).
- **`/pokemon/garchomp` at 390×844 & 1440×900, light & dark (4 screenshots):** 3/4 byte-identical (`0` changed pixels); `garchomp-1440-day` differed by 40 pixels out of 1,296,000 (0.003%).
- **Settled numbers on 6 routes (`/`, `/team`, `/meta`, `/news`, `/gifts`, `/pokemon/garchomp`):** 100% identical `h1`, `Data as of Nov 24.`, and text length/content; no page shows a loading panel longer than before.

## Public Test Suite (GitHub Order: `v2-public.mjs` first)
- `app/test/v2-public.mjs` — ALL PASSED
- `experiments/security-csp-test.mjs` — PASS
- `app/test/seo-check.mjs` — ALL PASSED
- `experiments/pokemon-pages-test.mjs` — ALL PASSED
- `experiments/static-pages-test.mjs` — ALL PASSED
- `experiments/pub-links-test.mjs` — ALL PASSED
- `experiments/public-build-test.mjs` — ALL PASSED
- `experiments/public-site-test.mjs` — ALL PASSED

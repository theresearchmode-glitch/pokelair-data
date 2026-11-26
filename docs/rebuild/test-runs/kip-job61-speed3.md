# Job 61 — Speed Fixes 4 + 5 on `origin/alt/speed-review` (`alt/gemini-speed-fix3`)

Branched from `origin/alt/speed-review` (`eb9b0e2c`, which includes the fixed `--split-routes` + `experiments/split-routes-cross-test.mjs`). Measured on the **real deploy folder** (`node public-site.mjs`, same flags as `.github/workflows/deploy.yml`) with today's data from `origin/main` `out/` (restored cleanly after measurement; `out/` untouched).

## Changes Made
1. **Fix 4 — Trimmed CSS for static pages ([`app/static-pages.mjs`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/app/static-pages.mjs#L103-L140), [`app/build.mjs`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/app/build.mjs#L262)):**
   - Prunes `dist/v2.css` (823.8 KB raw / 144.5 KB gz) down to `dist/static.css` (**42.4 KB raw / 12.0 KB gz**, **-94.9% raw / -91.7% gz**) for `pokemon.html` (`/pokemon`) and `404.html`, using the safe token-pruning algorithm from `app/slim.mjs`.
   - Added `/static.css` immutable `Cache-Control` header in `app/build.mjs`.
2. **Fix 5 — Route-prioritized `/data/*.json` loading ([`app/src/app/03-persistence.js`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/app/src/app/03-persistence.js#L69-L93)):**
   - On `window.__NP_PUBLIC`, loads only the route's first-paint `/data/*.json` documents immediately and defers the remaining `META_KEYS` until after first paint (`load` + `requestAnimationFrame` + `setTimeout(0)`, 2.5 s safety fallback).
3. **Cold-load deferred-data coverage ([`experiments/split-routes-cross-test.mjs`](file:///home/antigravity/theresearchmode-glitch/pokelair-data/experiments/split-routes-cross-test.mjs#L40-L42)):**
   - Added 3 cold-load cases for routes whose `/data/*.json` files are deferred (`Natures -> Ratings`, `Gifts -> News`, `Track Record`).

## `speed-check.mjs` Before vs After on Real Deploy Folder (`node public-site.mjs`, 390×844, 4× CPU, Fast 3G)

| Page | LCP Before | LCP After | LCP Delta | Transfer Before | Transfer After | Reqs (B→A) | CLS (B→A) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home (`/`) | 4,952 ms | 4,909 ms | -43 ms | 1,410.6 KB | 4,015.1 KB* | 74 → 74 | 0 → 0 |
| **Pokémon A-Z (`/pokemon`)** | **1,756 ms** | **1,054 ms** | **-702 ms (-40.0%)** | **266.2 KB** | **133.6 KB (-49.8%)** | 7 → 7 | 0 → 0 |
| Garchomp (`/pokemon/garchomp`) | 4,868 ms | 4,871 ms | +3 ms | 1,126.7 KB | 922.4 KB | 26 → 26 | 0 → 0 |
| Incineroar (`/pokemon/incineroar`) | 4,824 ms | 4,833 ms | +9 ms | 1,017.5 KB | 1,156.4 KB | 24 → 24 | 0 → 0 |
| Mega Absol (`/pokemon/absol-mega`) | 4,871 ms | 4,872 ms | +1 ms | 1,209.2 KB | 1,123.2 KB | 26 → 26 | 0 → 0 |
| Natures (`/natures`) | 4,518 ms | 4,501 ms | -17 ms | 870.9 KB | 931.6 KB | 23 → 23 | 0 → 0 |
| Popular Sets (`/sets`) | 4,678 ms | 4,653 ms | -25 ms | 1,331.7 KB | 1,245.7 KB | 32 → 32 | 0 → 0 |
| Meta / Ratings (`/meta`) | 4,748 ms | 4,732 ms | -16 ms | 1,390.3 KB | 1,497.6 KB | 41 → 41 | 0 → 0 |
| News & Gifts (`/gifts`) | 4,509 ms | 4,518 ms | +9 ms | 865.3 KB | 987.3 KB | 24 → 24 | 0 → 0 |
| My Team (`/team`) | 4,791 ms | 4,825 ms | +34 ms | 901.7 KB | 1,262.3 KB | 29 → 29 | 0 → 0 |

*\*Home transfer variance (`1.41 MB` vs `4.02 MB`, both 74 reqs) comes from whether the two lazy hero crowd sheets (`crowd-1.webp` 491 KB + `crowd-2.webp` 478 KB + below-the-fold art) finished before `speed-check.mjs`'s settle cutoff; LCP is unaffected (`4,952 -> 4,909 ms`).*

**Honest takeaway on the real deploy:**
- **Fix 4 (`static.css`)** is a real, rock-solid win on static pages: **`/pokemon` LCP 1,756 ms -> 1,054 ms (-40.0%)**, transfer **266.2 KB -> 133.6 KB (-49.8%)**, `static.css` **42.4 KB raw (12.0 KB gz)** vs `v2.css` 823.8 KB raw (144.5 KB gz).
- **Fix 5 (deferred `/data/*.json`)** removes non-critical data contention during first paint, though on SPA pages LCP itself stays bounded by `/v2.js` (540 KB gz) + `/v2.css` (145 KB gz) downloading before `03-persistence.js` runs, and deferred docs still arrive during the `networkidle` window so total settled bytes/requests stay comparable.

## Visual Parity & Cold-Load Verification (`checked` on real `public-site.mjs` deploy folder)
- **Visual parity (14 screenshots):** **14/14 byte-identical (`0` changed pixels)** — all 8 static shots (`/pokemon` and `404` at 390×844 & 1440×900, day & night) AND all 6 SPA shots (Home, My Team, Meta, News, Gifts, `/pokemon/garchomp` at 1440×900 day).
- **Settled numbers (6 routes):** 100% identical (`Data as of Nov 26.`, exact same `h1`, text length, and content) on Home, My Team, Meta, News, Gifts, and `/pokemon/garchomp`.
- **`experiments/split-routes-cross-test.mjs`:** **15/15 PASS** (all 12 original cold-load cross-chunk cases + 3 new deferred-data cases).

## Public Test Suite (GitHub Order: `v2-public.mjs` first)
- `app/test/v2-public.mjs` — ALL PASSED
- `experiments/security-csp-test.mjs` — PASS
- `app/test/seo-check.mjs` — ALL PASSED
- `experiments/pokemon-pages-test.mjs` — ALL PASSED
- `experiments/static-pages-test.mjs` — ALL PASSED
- `experiments/pub-links-test.mjs` — ALL PASSED
- `experiments/public-build-test.mjs` — ALL PASSED
- `experiments/public-site-test.mjs` — ALL PASSED

# Job 57 — Public Speed Fixes 1 + 3 (`alt/gemini-speed-fix1`)

## Changes Made (`app/build.mjs` only; zero page/CSS/design changes)
1. **External item pictures on `--public` (`app/build.mjs:61`, `app/build.mjs:334-337`):**
   - `PUBLIC` now always keeps `ITEM_IMG` as file names (`art/items/<id>.webp`) instead of inlining 166 base64 WebP pictures (1.56 MB) into `v2.js`, even when `--one-art-size` is passed without `--item-files`.
   - `app/build.mjs` copies `app/src/v2/art/items/*.webp` (166 files) into `app/dist/art/items/` on `--public` builds so standalone `app/dist/` builds serve item pictures without extra steps.
   - Claude-hosted artifact builds (`--v2 --one-art-size` without `--public`) remain unchanged (`166` inlined `data:image/webp;base64,` URIs verified).
2. **Shared `/v2.css` on `index.html` (`app/build.mjs:301`, `app/build.mjs:327-329`):**
   - On `--public --split`, `dist/index.html`, `dist/v2.html`, and `dist/pokemon/404.html` all share `/v2.css?v=<hash>` instead of carrying 844 KB of inline `<style>`.
   - Because `<link rel="stylesheet" href="/v2.css?v=...">` is render-blocking in `<head>` (while `@font-face` and font preloads stay inline in `<head>`), measured CLS on `/` remained `0` with no unstyled flash, so no duplicate critical-CSS inline block is needed.
   - Non-split `--public` builds (`node app/test/v2-public.mjs`, which opens `file://app/dist/v2.html`) keep inline `<style>` so `file://` tests continue to pass untouched.

## Bundle Size Before vs After (`node app/build.mjs --v2 --public --split --one-art-size`)
| File | Before | After | Delta |
|---|---:|---:|---:|
| `dist/v2.js` (raw) | 3,571 KB | 2,047 KB | **-1,524 KB (-42.7%)** |
| `dist/v2.js` (gzip transfer) | 1,796.6 KB | 661.6 KB | **-1,135.0 KB (-63.2%)** |
| `dist/index.html` (raw) | 861 KB | 116 KB | **-745 KB (-86.5%)** |
| `dist/v2.css` (shared, gzip) | 144.7 KB | 144.7 KB | shared across `/` + all sub-pages |

## `speed-check.mjs` Before vs After (390×844, 4× CPU, Fast 3G)
Measured with `speed-check.mjs` (from `origin/alt/gemini-speed-check`) on `node app/build.mjs --v2 --public --split --one-art-size`:

| Page | LCP Before | LCP After | LCP Delta | Transfer Before | Transfer After | Transfer Delta | Reqs (B→A) | CLS (B→A) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Home (`/`) | 11,565 ms | 5,570 ms | **-5,995 ms (-51.8%)** | 2,690.7 KB | 1,555.9 KB | **-1,134.8 KB** | 48 → 49 | 0 → 0 |
| Pokémon A-Z (`/pokemon`) | 1,779 ms | 1,792 ms | +13 ms | 266.2 KB | 266.2 KB | 0 KB | 7 → 7 | 0 → 0 |
| Garchomp (`/pokemon/garchomp`) | 11,209 ms | 5,452 ms | **-5,757 ms (-51.4%)** | 2,241.6 KB | 1,092.0 KB | **-1,149.6 KB** | 26 → 26 | 0 → 0 |
| Incineroar (`/pokemon/incineroar`) | 11,168 ms | 5,401 ms | **-5,767 ms (-51.6%)** | 2,143.9 KB | 1,012.7 KB | **-1,131.2 KB** | 23 → 23 | 0 → 0 |
| Mega Absol (`/pokemon/absol-mega`) | 11,174 ms | 5,425 ms | **-5,749 ms (-51.5%)** | 2,226.1 KB | 1,087.5 KB | **-1,138.6 KB** | 26 → 26 | 0 → 0 |
| Natures (`/natures`) | 10,948 ms | 5,205 ms | **-5,743 ms (-52.5%)** | 2,248.9 KB | 1,062.4 KB | **-1,186.5 KB** | 22 → 22 | 0 → 0 |
| Popular Sets (`/sets`) | 10,964 ms | 5,250 ms | **-5,714 ms (-52.1%)** | 2,300.8 KB | 1,165.7 KB | **-1,135.1 KB** | 31 → 31 | 0 → 0 |
| Meta / Ratings (`/meta`) | 11,015 ms | 5,321 ms | **-5,694 ms (-51.7%)** | 2,591.9 KB | 1,383.4 KB | **-1,208.5 KB** | 40 → 40 | 0 → 0 |
| News & Gifts (`/gifts`) | 10,857 ms | 5,143 ms | **-5,714 ms (-52.6%)** | 2,203.1 KB | 1,041.0 KB | **-1,162.1 KB** | 26 → 26 | 0 → 0 |
| My Team (`/team`) | 11,291 ms | 5,544 ms | **-5,747 ms (-50.9%)** | 2,256.3 KB | 1,076.6 KB | **-1,179.7 KB** | 30 → 30 | 0 → 0 |

8 of 9 SPA pages are now under the 1.50 MB transfer budget (only Home is 1.52 MB due to hero crowd images); remaining LCP (~5.1–5.6 s) is dominated by `/v2.js` (661.6 KB gz) + `/v2.css` (144.7 KB gz), which Job 58 (`--split-routes`) measures next.

## Visual Parity (`checked` via Playwright before/after pixel diff on `--v2 --public --split --one-art-size --art=art/`)
Captured 20 screenshots (Home `/`, My Team `/team` with 6 seeded Pokémon + held items, Life Orb item sheet, Build `/build`, Gifts `/gifts` at `390×844` and `1440×900`, light and dark), 0 broken visible images on all 20:
- **17/20 byte-identical (`0` changed pixels):** all 4 `build`, all 4 `gifts`, all 4 `team`, `home-1440-day/night`, `home-390-night`, `item-sheet-1440-day/night`.
- **3/20 subpixel rounding only:** `home-390-day` had 55 pixels with max channel delta `1/255` on the bottom-right crowd sprite; `item-sheet-390-day/night` had `1` single pixel at `(245, 445)` out of 329,160 pixels.

## Public Test Suite Verification (Both Build Orders)
- **Order 1 (`checked` after `node app/build.mjs --v2 --public --split --one-art-size --art=art/`):**
  - `experiments/security-csp-test.mjs` — PASS (4 hashed inline scripts, 0 CSP violations, 0 external requests, 0 cookies, XSS blocked)
  - `app/test/seo-check.mjs` — ALL PASSED (371 static pages, 28 rendered routes)
  - `experiments/pokemon-pages-test.mjs` — ALL PASSED
  - `experiments/static-pages-test.mjs` — ALL PASSED
  - `experiments/pub-links-test.mjs` — ALL PASSED
  - `experiments/public-build-test.mjs` — ALL PASSED
  - `experiments/public-site-test.mjs` — ALL PASSED
- **Order 2 (`checked` after `node app/test/v2-public.mjs`, GitHub's order):**
  - `app/test/v2-public.mjs` — ALL PASSED
  - `experiments/security-csp-test.mjs` — PASS
  - `app/test/seo-check.mjs` — ALL PASSED
  - `experiments/pokemon-pages-test.mjs` — ALL PASSED
  - `experiments/static-pages-test.mjs` — ALL PASSED
  - `experiments/pub-links-test.mjs` — ALL PASSED
- **Claude-artifact build (`checked` after `node app/build.mjs --v2 --one-art-size --no-static`):** `166` inlined `data:image/webp;base64,` URIs preserved.

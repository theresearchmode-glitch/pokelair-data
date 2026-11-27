# Job 66 — Pictures (`alt/gemini-speed-pictures`, on `alt/gemini-speed-less-js` `748a550b`)

Built on top of Job 65 (`748a550b`, including Job 64c fixes `fedca995`). Measured on the real deploy folder (`node public-site.mjs` with `origin/main` `out/`, restored cleanly after; `out/` untouched).

## 1. What Changed
1. **Enabled `art-s/` and `art-s/items/` on the public deploy (`public-site.mjs`):**
   - Removed `--one-art-size` from `public-site.mjs` (Cloudflare Workers static assets has a 20,000-file limit, not Claude's 511-file artifact limit; total site files: `1,650`).
   - Copied `app/src/v2/art-s/*.webp` (356 small `240px` Pokémon sprites, avg `13.6 KB` vs `22.0 KB` in `art/`, `-38%`) and `app/src/v2/art-s/items/*.webp` (166 small `128px` item sprites, avg `4.5 KB` vs `6.9 KB` in `art/items/`, `-35%`).
   - Excluded unused `crowd-*.webp` sprite sheets from the public deploy (`Final 3` Home does not use them).
2. **Responsive `srcset` / `sizes` & `fetchpriority="high"`:**
   - **`app/src/v2/shell.js` (`V2.mon`):** uses `art-s/` (`240w`) + `art/` (`384w`) `srcset`/`sizes` whenever `!o.big`, so `/meta`, Home's below-the-fold bands, `/natures`, `/sets`, and `/gifts` serve `240px` thumbnails on phones instead of `384px`.
   - **`app/src/v2/kit.js` (`V2.kCard`):** non-hero cards (`small` / `normal`, e.g., My Team party cards, Pokémon partners, Popular Sets) use `240w, 384w` `srcset`/`sizes` + `loading="lazy"`; hero LCP cards (`size: 'hero'` with `alt`) keep full `384px` `src` (matching `<link rel="preload" as="image" href="/art/<id>.webp">`) and add `fetchpriority="high"`.
   - **`app/src/v2/pages/pubhome-f3.js` (`.f3-art`):** added `loading="lazy"` and `240w, 384w` `srcset`/`sizes` to the 6 receipt bar sprites (which are `display: none` under `1280px` on phones, avoiding eager 384px downloads on mobile).
3. **Preload check:**
   - Verified only the LCP picture is preloaded (`<link rel="preload" as="image" href="/art/<id>.webp">` on Pokémon pages, 1 per page, `used=true` checked by `pokemon-pages-test.mjs`). No non-LCP images are preloaded.

## 2. Image Bytes Saved Per Page (390x844 Mobile, Job 65 BEFORE vs Job 66 AFTER)

| Page | Image Transfer (65 -> 66) | Delta | `art-s/` Served |
|---|---:|---:|---|
| **Home (`/`)** | `305.4 -> 188.7 KB` (14 imgs) | **`-116.7 KB`** (`-38.2%`) | `14 / 14` |
| **Pokémon: Garchomp (`/pokemon/garchomp`)** | `384.1 -> 246.9 KB` (17 imgs) | **`-137.2 KB`** (`-35.7%`) | `16 / 17` (only LCP hero uses `art/`) |
| **Meta / Ratings (`/meta`)** | `371.4 -> 228.9 KB` (17 imgs) | **`-142.5 KB`** (`-38.4%`) | `17 / 17` |
| **My Team (`/team`)** | `296.3 -> 184.2 KB` (14 imgs) | **`-112.1 KB`** (`-38.0%`) | `14 / 14` |
| **Popular Sets (`/sets`)** | `200.1 -> 124.1 KB` (9 imgs) | **`-76.0 KB`** (`-38.0%`) | `9 / 9` |
| **Natures (`/natures`)** | `468.9 -> 289.4 KB` (21 imgs) | **`-179.5 KB`** (`-38.3%`) | `21 / 21` |
| **News & Gifts (`/gifts`)** | `48.7 -> 30.3 KB` (2 imgs) | **`-18.4 KB`** (`-37.8%`) | `2 / 2` |

## 3. `experiments/page-speed-check.mjs` (Fast 3G + 4x CPU, 390x844, Real `public-site.mjs` Deploy)

**`speed-check: ALL PASSED` (`10/10` PASS, `EXIT=0`):**
All 10 pages are under **`1.11 MB`** transfer, all LCPs **`<= 1,212 ms`**, all CLSs **`<= 0.0357`**. Notable LCP effect: **`/meta` LCP dropped `1,479 -> 1,212 ms` (`-267 ms`)** because `/meta`'s LCP element (`img`) now loads a `240px` `art-s/` sprite instead of `384px`.

| Page | LCP (65 -> 66) | CLS (66) | Total Transfer (66) | Status |
|---|---:|---:|---:|---|
| **Home (`/`)** | `420 -> 444 ms` | `0.0013` | `1,018.9 KB` | **PASS** |
| **Pokémon A-Z (`/pokemon`)** | `425 -> 429 ms` | `0` | `133.4 KB` | **PASS** |
| **Garchomp (`/pokemon/garchomp`)** | `1,112 -> 1,111 ms` | `0.0225` | `1,059.4 KB` | **PASS** |
| **Incineroar (`/pokemon/incineroar`)** | `961 -> 961 ms` | `0.0226` | `972.7 KB` | **PASS** |
| **Mega Absol (`/pokemon/absol-mega`)** | `1,112 -> 1,111 ms` | `0.0054` | `819.8 KB` | **PASS** |
| **Natures (`/natures`)** | `436 -> 435 ms` | `0.0079` | `1,100.7 KB` (`-222.7 KB` vs 65) | **PASS** |
| **Popular Sets (`/sets`)** | `431 -> 448 ms` | `0.0036` | `1,052.8 KB` | **PASS** |
| **Meta / Ratings (`/meta`)** | **`1,479 -> 1,212 ms` (`-267 ms`)** | `0.0357` | `890.4 KB` | **PASS** |
| **News & Gifts (`/gifts`)** | `443 -> 435 ms` | `0.0019` | `871.9 KB` | **PASS** |
| **My Team (`/team`)** | `461 -> 471 ms` | `0.0158` | `1,061.1 KB` | **PASS** |

## 4. AVIF vs WebP Size Check (20-File Sample Each, Python Pillow 13.0.0)

| Set (20 files) | Current WebP | WebP q80 | AVIF q65 | AVIF q50 |
|---|---:|---:|---:|---:|
| `art/` (`384px`) | `455.9 KB` | `412.1 KB` (`-9.6%`) | `311.6 KB` (`-31.6%`) | `230.2 KB` (`-49.5%`) |
| `art-s/` (`240px`) | `285.2 KB` | `236.2 KB` (`-17.2%`) | `184.2 KB` (`-35.4%`) | `136.5 KB` (`-52.1%`) |
| `art/items/` (`192px`) | `126.2 KB` | `111.5 KB` (`-11.7%`) | `87.1 KB` (`-31.0%`) | `65.7 KB` (`-48.0%`) |
| `art-s/items/` (`128px`) | `83.2 KB` | `73.7 KB` (`-11.4%`) | `57.9 KB` (`-30.4%`) | `44.3 KB` (`-46.8%`) |

*Recommendation:* AVIF q65 saves an additional `30–35%` over current WebP (`~3.1 MB` across all 1,044 assets). To avoid bloating git history with 1,044 binary `.avif` files (and keep `.webp` preload checks intact), AVIF conversion is best done at deploy time (or via Cloudflare Image Resizing / a build-time cache) if Sim/HH want that extra `~30%` on top of `art-s/` WebP.

## 5. Verification Matrix (Exit Codes)
| Check | Result | Exit Code |
|---|---|---:|
| `SPEED_DIST=/tmp/site-66 node experiments/page-speed-check.mjs` | **10/10 ALL PASSED** | `0` |
| `SPEED_DIST=/tmp/site-66 node experiments/first-screen-guard.mjs` | **6/6 ALL PASSED (`0 px` overlap, `/` CLS `0.0019`, `/team` CLS `0.0055`)** | `0` |
| Visual parity (390/1440 light/dark, `/`, `/pokemon/garchomp`, `/team`, `/meta`) | **0 broken images, `dH=0 px`** | `0` |
| `node app/test/v2-public.mjs` | **ALL PASSED** | `0` |
| `node app/test/v2-split.mjs` | **ALL PASSED** | `0` |
| `node experiments/switch-smoke.mjs` | **ALL PASSED** | `0` |
| `node experiments/public-build-test.mjs` | **PASS** | `0` |
| `node experiments/pokemon-pages-test.mjs` | **ALL PASSED** | `0` |
| `node experiments/static-pages-test.mjs` | **ALL PASSED** | `0` |
| `node app/test/prerender-test.mjs` | **ALL PASSED (14/14)** | `0` |
| `node experiments/security-csp-test.mjs` | **PASS (0 violations)** | `0` |
| `node experiments/split-routes-cross-test.mjs` (26 cold cases) | **26/26 ALL PASSED** | `0` |

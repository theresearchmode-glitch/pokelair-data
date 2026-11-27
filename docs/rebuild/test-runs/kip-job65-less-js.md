# Job 65 — Less JavaScript Up Front (`alt/gemini-speed-less-js`, on `alt/gemini-speed-first-screen3` `6950745e`)

Built on top of Job 64c (`6950745e`). Measured on the real deploy folder (`node public-site.mjs` with `origin/main` `out/`, restored cleanly after; `out/` untouched).

## 1. What Changed
1. **Removed public-dead modules (`app/build.mjs` `PUBLIC_DEAD`):**
   - Omitted `guide.js`, `owner.js` (replaced by `V2.OWN=false;`), `coming.js`, `stampede-hero.js` (added inline chevron SVG fallback to `V2.bxChv` in `app/src/v2/pages/box.js`), `42-guide-data.js`, `51-usage-data.js`, and set `ART_CROWD = null` on `--public`.
2. **Dropped stale baked-in `RESULTS` and `PERF_RAW` fallbacks on `--public --split --split-routes`:**
   - The public deploy always ships `/data/results.json` and `/data/perf.json`. Replaced the built-in `RESULTS` and `PERF_RAW` tables in `data.js` with `undefined` (not `null`, since `typeof null === 'object'`), saving `181.5 KB` raw / `35.6 KB` gz from `v2.js`.
3. **Lazy-loaded `info-text` (`routes/info-text.js`, `63.4 KB` raw / `16.1 KB` gz):**
   - Moved `src/data/info-text.js` out of `v2.js` into `ROUTE_CHUNKS['info-text']` (processed with `asJsonParse`).
   - `V2.openInfo` (`app/src/v2/pages/infosheet.js`) and `V2.openSearch` (`app/src/v2/shell.js`) lazy-load `'info-text'` via `V2.needRoute('info-text', ...)`.
   - `V2.kAbil` and `V2.kItem` fall back to `ABIL[n]` (exact 216-key match) and `ITEM_IMG[n]` (exact 166-key match) before `INFO_TEXT` arrives so ability/item buttons render identically on first paint.
4. **Moved route-exclusive logic and team sub-modules into `ROUTE_CHUNKS`:**
   - Moved 8 route-exclusive `P.logic` files into their route chunks: `46-battle-data.js` -> `battle`, `38-gauntlet-data.js` -> `gauntlet`, `63-practice-data.js` -> `practice`, `62-compare-data.js` -> `compare`, `22-auto-build.js` -> `build`, `20-types-data.js` -> `types`, `63-method-data.js` -> `method`, `53-feedback-data.js` -> `feedback`.
   - Moved 6 My Team UI files (`team-frame.js`, `matchups.js`, `sugs.js`, `record.js`, `share-slab.js`, `share-tape.js`) into `ROUTE_CHUNKS.team` (`81.7 KB` raw / `27.3 KB` gz).
   - Moved `V2.tip` + `V2.tipClose` + tip listeners from `sugs.js` to `app/src/v2/kit.js` so `/meta`, `/this-week`, and `/test-run` do not depend on `team.js`.
   - Wrapped `runAutoBuild` calls in `home.js` and `sugs.js` with `V2.needRoute('build', ...)`, and `openAllSugs` / `spicyOpen` in `shell.js` `V2.findPlaces` with `V2.needRoute('team', ...)`.
   - Fixed `V2.loadRoute` (`app/src/v2/shell.js`) to require every chunk in `window.__NP_ROUTES` to finish loading (even when `V2.pages.team` lives in main).
   - Extended `app/build.mjs` `routeDeps` scanner to detect cross-chunk top-level `function` calls from unminified raw chunk sources (auto-linking `battle -> gauntlet` for `gauntletTeams()` without false matches on minified inner helpers). Final `routeDeps`: `{"battle":["build","gauntlet"],"gauntlet":["battle"],"build":["compare","tournaments"],"events":["battle","tournaments"],"tournaments":["battle"],"weekly":["archetypes","events"],"feedback":["pokemon"]}`.
5. **esbuild minifier check:**
   - Checked `{minify: true}` default vs `{minify: true, target: 'es2020', drop: ['debugger']}` vs `es2022` / `esnext` on `v2.js`: all produced identical `1,262.04 KB` raw / `428.48 KB` gz (`minify: true` already performed full syntax + whitespace + identifier minification). Pinned `target: 'es2020', drop: ['debugger']` explicitly for `v2.js` and route chunks.

## 2. Bytes & Parse/Eval Time Saved Per Route (BEFORE `site-64c` vs AFTER `site-65`)

Main bundle `v2.js`: **`1,692.9 -> 1,263.6 KB` raw (`-429.3 KB`)** / **`543.2 -> 428.5 KB` gz (`-114.6 KB` gz, level 9; `-115.2 KB` gz at level 6 HTTP)**.

| Route | JS Raw (Before -> After) | JS Gzip (Before -> After) | Delta Gzip | Chromium `ScriptDuration` (1x CPU, 3-run median) |
|---|---:|---:|---:|---:|
| **Home (`/`)** | `1,692.9 -> 1,263.5 KB` | `544.4 -> 429.2 KB` | **`-115.2 KB`** | `48.6 -> 47.7 ms` (`-0.9 ms`) |
| **Pokémon (`/pokemon/garchomp`)** | `1,717.5 -> 1,288.1 KB` | `554.2 -> 439.0 KB` | **`-115.2 KB`** | `44.6 -> 33.5 ms` (`-11.1 ms`) |
| **Meta (`/meta`)** | `1,714.5 -> 1,285.1 KB` | `552.7 -> 437.4 KB` | **`-115.3 KB`** | `41.4 -> 40.2 ms` (`-1.2 ms`) |
| **Popular Sets (`/sets`)** | `1,702.6 -> 1,273.2 KB` | `548.6 -> 433.4 KB` | **`-115.2 KB`** | not measured separately |
| **Natures (`/natures`)** | `1,699.0 -> 1,269.7 KB` | `547.0 -> 431.8 KB` | **`-115.2 KB`** | not measured separately |
| **My Team (`/team`)** | `1,692.9 -> 1,342.3 KB` | `544.4 -> 455.7 KB` | **`-88.7 KB`** | `68.5 -> 36.2 ms` (`-32.3 ms`) |
| **Build (`/build`)** | `1,790.4 -> 1,388.0 KB` | `575.2 -> 470.1 KB` | **`-105.1 KB`** | `100.2 -> 101.7 ms` (`+1.5 ms`) |
| **Battle (`/battle`)** | `1,824.8 -> 1,422.9 KB` | `586.2 -> 481.5 KB` | **`-104.7 KB`** | not measured separately |
| **Damage Calc (`/calc`)** | `1,756.6 -> 1,327.3 KB` | `565.7 -> 450.4 KB` | **`-115.3 KB`** | not measured separately |
| **How We Calculate (`/how-it-works`)** | `1,698.7 -> 1,290.9 KB` | `547.2 -> 440.1 KB` | **`-107.1 KB`** | not measured separately |
| **News & Gifts (`/gifts`)** | `1,692.9 -> 1,263.5 KB` | `544.4 -> 429.2 KB` | **`-115.2 KB`** | not measured separately |

## 3. `speed-check.mjs` on Real `node public-site.mjs` Deploy (Fast 3G + 4x CPU, 390x844)

**`speed-check: ALL PASSED` (`10/10` PASS, `EXIT=0`):**

| Page | LCP (64c -> 65) | CLS (65) | Transfer (64c -> 65) | Status |
|---|---:|---:|---:|---|
| **Home (`/`)** | `431 -> 420 ms` | `0.0007` | `1,186.6 -> 949.6 KB` (`-237.0 KB`) | **PASS** |
| **Pokémon A-Z (`/pokemon`)** | `441 -> 425 ms` | `0` | `133.3 -> 133.3 KB` | **PASS** |
| **Garchomp (`/pokemon/garchomp`)** | `1,111 -> 1,112 ms` | `0.0021` | `1,172.1 -> 978.2 KB` (`-193.9 KB`) | **PASS** |
| **Incineroar (`/pokemon/incineroar`)** | `962 -> 961 ms` | `0.0023` | `935.9 -> 803.6 KB` (`-132.3 KB`) | **PASS** |
| **Mega Absol (`/pokemon/absol-mega`)** | `1,111 -> 1,112 ms` | `0.0020` | `1,172.1 -> 977.2 KB` (`-194.9 KB`) | **PASS** |
| **Natures (`/natures`)** | `432 -> 436 ms` | `0.0081` | `1,386.9 -> 1,323.4 KB` (`-63.5 KB`) | **PASS** |
| **Popular Sets (`/sets`)** | `431 ms` | `0.0010` | `1,086.3 KB` | **PASS** |
| **Meta / Ratings (`/meta`)** | `1,482 -> 1,479 ms` | `0.0013` | `979.3 -> 864.1 KB` (`-115.2 KB`) | **PASS** |
| **News & Gifts (`/gifts`)** | `443 ms` | `0.0040` | `768.3 KB` | **PASS** |
| **My Team (`/team`)** | `456 -> 461 ms` | `0.0047` | `959.1 KB` | **PASS** |

## 4. Visual Parity (390x844 & 1440x900, Light & Dark, 64c vs 65)
Checked across `/`, `/pokemon/garchomp`, `/team`, and `/meta` (16 screenshots):
- **16/16:** `dH = 0 px`, `dText = 0`, `h1Same = true`.
- `/pokemon/garchomp` (4/4), `/team` (4/4), and `/meta` (3/4) are byte-for-byte PNG identical; `/` differs only in animation frame timing.

## 5. Verification Matrix (Exit Codes)
| Check | Result | Exit Code |
|---|---|---:|
| `speed-check.mjs` (10 pages, real `public-site.mjs` deploy) | **10/10 ALL PASSED** | `0` |
| `node app/test/v2-public.mjs` | **ALL PASSED** | `0` |
| `node app/build.mjs --v2 --split --preview-data --one-art-size --art=../src/v2/art/ && node app/test/v2-split.mjs` | **ALL PASSED** | `0` |
| `node experiments/public-build-test.mjs` | **PASS (PUB-1..PUB-6)** | `0` |
| `node experiments/pokemon-pages-test.mjs` | **ALL PASSED** | `0` |
| `node experiments/static-pages-test.mjs` | **ALL PASSED** | `0` |
| `node app/test/prerender-test.mjs` | **ALL PASSED (14/14)** | `0` |
| `node experiments/security-csp-test.mjs` | **PASS (5 hashed inline scripts, 0 violations)** | `0` |
| `node experiments/split-routes-cross-test.mjs` (extended to 26 cold cases covering every new lazy module) | **26/26 ALL PASSED** | `0` |
| `node experiments/switch-smoke.mjs` (switch build, phone + desktop, 10 views) | **ALL PASSED** | `0` |

# Job 69 — Speed Chain on Reg M-D Day One (`alt/gemini-speed-mdday`, on `alt/gemini-seo-audit` `cd1e1292`)

Built the real public deploy (`node public-site.mjs` with Reg M-D day-one empty data: `reg: 'M-D'`, `since: '2026-12-02'`, `updated: '2026-12-02T02:05:00Z'`, `teams: 0`, `events: 0`, `model.ships: false`, empty `meta_tour`/`teams`/`events`/`weekly`/`track`/`practice`/`info`; `out/` restored cleanly after) and verified prerendered first screens, hydrated app at fake clocks before and after `2026-12-02T02:00:00Z`, `first-screen-guard`, `page-speed-check`, `seo-audit`, and `split-routes-cross-test`.

## 1. Findings & Actions

| Severity | Finding & Proof | Action |
|---|---|---|
| **HIGH** *(Fixed — non-visual)* | **Home throttled CLS = `0.2852` (`>= 0.1`) on Reg M-D day one** (`SPEED_DIST=/tmp/site-69-md node experiments/first-screen-guard.mjs` FAILED on `cd1e1292`). Because `.f3-pr.f3-empty` has no 6-Pokémon receipt (~142 px tall), `<footer class="np-foot">` sat inside the `844 px` mobile viewport at `y=604` until `v2.js` hydrated `V2.f3Home()` at `t=5500 ms` and pushed the footer off-screen (`+0.2734` CLS). | **Fixed (`app/src/v2/shell.js` `V2.preScreen`):** added `rootEl.style.minHeight = '100svh'` on `[data-np-pre="home"]` (removed automatically on hydration, zero visual change on hydrated Home or M-C days). Re-run `first-screen-guard.mjs`: **`CLS 0.2852 -> 0.0118` (`6/6 ALL PASSED`)**. |
| **HIGH** *(Reported — wording, not changed)* | **Home hero and SEO intro say `"against 0 real tournament teams"` on M-D day one** (`app/src/v2/pages/pubhome-f3.js:40`: `against ${E(Number(teams).toLocaleString('en-US'))} real tournament teams`). Observed in both static `index.html` (visible + SEO block) and hydrated Home at `01:55Z` and `02:05Z`. | Reported only (visible wording change — left untouched per Job 69 rule "fix only non-visual things"). Suggested copy when `teams === 0`: `"against real tournament teams"` (or `"once Reg M-D tournaments start"`). |
| **PASS** | **No Reg M-C leak or placeholder ratings:** `/pokemon/garchomp` and `/pokemon/gyarados` show `"No tournament teams yet: not rated yet."` / `"Not rated yet"` / `"Legal in Reg M-D"`; `/meta` shows `"Ratings start with the first Reg M-D tournament results. Until a Pokémon has played, it isn't rated: no guesses."`; `/team` explicitly labels the sample team's Strength Score as `"Graded against Reg M-C's teams"` (`Legal for Reg M-D ✓`). | Clean. |
| **PASS** | **Fake clock transition at `2026-12-02T02:00:00Z`:** at `01:55Z`, Home `h1` reads `"Rate your Pokémon Champions team before Reg M-D."`; at `02:05Z`, Home `h1` flips cleanly to `"Rate your Pokémon Champions team for Reg M-D."` (`0` page errors, `0` M-C leaks across `/`, `/pokemon/garchomp`, `/team`, `/meta`). | Clean. |

## 2. `experiments/page-speed-check.mjs` on M-D Day-One Deploy (`/tmp/site-69-md`, Fast 3G + 4x CPU)
**`speed-check: ALL PASSED` (`10/10` PASS, `EXIT=0`)** — every page under `850 KB` transfer, all LCPs `419–1,138 ms`, all CLSs `0–0.0382`:

| Page | LCP | CLS | Transfer | Status |
|---|---:|---:|---:|---|
| **Home (`/`)** | `427 ms` (`div.k-h1.u`) | `0.0012` | `724.9 KB` (`22 reqs`) | **PASS** |
| **Pokémon A-Z (`/pokemon`)** | `577 ms` (`h1.k-h1.u`) | `0` | `133.4 KB` (`6 reqs`) | **PASS** |
| **Garchomp (`/pokemon/garchomp`)** | `1,106 ms` (`img.k-art`) | `0.0139` | `764.3 KB` (`24 reqs`) | **PASS** |
| **Incineroar (`/pokemon/incineroar`)** | `961 ms` (`img.k-art`) | `0.0139` | `758.1 KB` (`24 reqs`) | **PASS** |
| **Mega Absol (`/pokemon/absol-mega`)** | `1,138 ms` (`img.k-art`) | `0.0139` | `763.3 KB` (`24 reqs`) | **PASS** |
| **Natures (`/natures`)** | `419 ms` (`p.k-lead.ra-lede`) | `0.0006` | `730.2 KB` (`23 reqs`) | **PASS** |
| **Popular Sets (`/sets`)** | `524 ms` (`h1.k-h1.u`) | `0.0036` | `819.6 KB` (`29 reqs`) | **PASS** |
| **Meta / Ratings (`/meta`)** | `1,010 ms` (`img.k-art`) | `0.0382` | `750.8 KB` (`24 reqs`) | **PASS** |
| **News & Gifts (`/gifts`)** | `481 ms` (`h1.k-h1.u`) | `0.0019` | `760.3 KB` (`24 reqs`) | **PASS** |
| **My Team (`/team`)** | `457 ms` (`div.tm-name.k-h1`) | `0.0149` | `849.0 KB` (`29 reqs`) | **PASS** |

## 3. Verification Matrix on M-D Day-One Deploy
| Check | Result | Exit Code |
|---|---|---:|
| `first-screen-guard.mjs` (BEFORE fix on `cd1e1292`) | **FAIL** (`throttled-CLS /: 0.2852 >= 0.1`, footer shift) | `1` |
| `first-screen-guard.mjs` (AFTER fix) | **6/6 ALL PASSED** (`0 px` overlap, `/` CLS `0.0118`, `/team` CLS `0.0045`) | `0` |
| `page-speed-check.mjs` (10 pages, M-D day one) | **10/10 ALL PASSED** | `0` |
| `seo-audit.mjs` (374 HTML files, 369 sitemap URLs, M-D day one) | **ALL PASSED (`0` issues)** | `0` |
| `split-routes-cross-test.mjs` (26 cold cases on empty M-D day-one data) | **0 JS errors, 0 `"This page didn't load"`** (`18/26` PASS; 8 timed out only on tournament/ratings selectors that are intentionally empty on day one: Build cores/auto-build, Winning Teams, Events, Test Run, Meta rated rows) | n/a |

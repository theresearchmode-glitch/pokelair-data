# Maggi Job M10: Remaining 7 pages in WebKit (`host-wrapper-test.mjs`)

- **Date:** Fri Nov 27 07:17:04 AM EST 2026
- **Branch:** `alt/maggi-m10-webkit-all` (branched from `alt/maggi-m9-webkit` `1e1b06af`)
- **What I'd need to know that you haven't told me:** Nothing missing. Zero host-wrapper differences across all 7 additional pages on both iPhone 15 and iPad Pro 11 (light and dark).

## Changes
1. **`experiments/host-wrapper-test.mjs`**:
   - Added 7 WebKit views (`EXTRA_ROUTES`) on `iPhone 15 (393x659)` and `iPad Pro 11 (834x1194)`, light (`day`) and dark (`night`):
     - `#build` (Build)
     - `#box` (My Box)
     - `#track` (Track Record)
     - `search` (Search open on `#home`, via `V2.openSearch()`)
     - `spicy` (`#team` with full saved 6-Pokémon team + `np2.spicy = '1'`, waiting until `V2.spicy.key === V2.spKey()`)
     - `#method` (How We Calculate)
     - `#about` (About)
   - Added `SET=core|extra|all` filter (default `all` runs both M9's 60 core checks and M10's 56 extra checks under `BROWSER=webkit`; default `BROWSER=chromium` remains 8 fast CI checks).

---

## Checks run (commands, exact results, exit codes)

1. **WebKit 7 extra pages × iPhone 15 & iPad Pro 11 × light & dark (`BROWSER=webkit SET=extra`)** — checked:
   - Command: `BROWSER=webkit SET=extra PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs`
   - Exact result lines (**exit 0**):
     - `INFO  webkit same-file baseline (iPhone 15 (393x659) light #build): 0 differing pixels (maxDelta=0)`
     - All 28 style checks and all 28 full-page screenshot checks across `#build`, `#box`, `#track`, `Search open`, `#team (Spicy picks on)`, `#method`, `#about` on `iPhone 15 (393x659)` and `iPad Pro 11 (834x1194)`, light and dark, passed with **0 differing pixels** (byte-for-byte identical PNGs).
     - `host-wrapper-test (webkit): ALL 56 PASSED`
   - Meaning: Combined with M9's 60 checks, all 12 views across Sim's Apple devices render pixel-identically wrapped vs unwrapped (116/116 WebKit checks, 0 differing pixels).

2. **Default Chromium mode** — checked:
   - Command: `PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs`
   - Result: `host-wrapper-test (chromium): ALL 8 PASSED` — **exit 0**
   - Meaning: Default CI mode still passes with 0 differing pixels.

3. **Syntax check** — checked:
   - Command: `node experiments/syntax-check.mjs`
   - Result: `syntax-check: all 430 scripts parse` — **exit 0**
   - Meaning: All 430 scripts parse cleanly.

# Maggi Job M9: WebKit (iPhone 15, iPhone SE, iPad Pro 11) + 5-page host-wrapper verification

- **Date:** Fri Nov 27 07:05:46 AM EST 2026
- **Branch:** `alt/maggi-m9-webkit` (branched from `origin/alt/host-wrapper-fix` `612d0364`)
- **What I'd need to know that you haven't told me:** Nothing missing. No additional host-wrapper bugs found on WebKit across any of Sim's 3 devices or 5 pages — the `revert-layer` block in `612d0364` (including the `[hidden]` fix from M8) holds at **0 differing pixels** everywhere.

## Changes
1. **`experiments/host-wrapper-test.mjs`**:
   - Added `BROWSER=webkit` switch (default remains `chromium` at `390x844` & `1440x900` `#home` so CI stays fast).
   - Under `BROWSER=webkit`:
     - Uses Playwright device profiles `iPhone 15` (`393x659`), `iPhone SE` (`320x568`), and `iPad Pro 11` (`834x1194`), both light (`day`) and dark (`night`).
     - Covers all 5 pages: `#home`, `#team` (seeded with a full 6-Pokémon saved team in `cc2.state`, `loadedId: 'tSaved1'`), `#meta`, `#pokemon=Garchomp`, and `#battle`.
     - Measures and prints same-file WebKit baseline noise first (two loads of the identical unwrapped `v2.html` on `iPhone 15` light `#home`).
   - Also supports optional `DEVICES=` and `ROUTES=` env overrides.

---

## Checks run (commands, exact results, exit codes)

1. **WebKit same-file baseline + 3 devices × 2 themes × 5 pages (`BROWSER=webkit`)** — checked:
   - Command: `BROWSER=webkit PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs`
   - Exact result lines (**exit 0**):
     - `INFO  webkit same-file baseline (iPhone 15 (393x659) light #home): 0 differing pixels (maxDelta=0)`
     - All 30 style checks (`body` `backgroundColor`/`color`/`fontFamily`/`fontSize`, `:root` `colorScheme`/`paddingTop`/`paddingBottom`) and all 30 full-page screenshot checks across `iPhone 15 (393x659)`, `iPhone SE (320x568)`, and `iPad Pro 11 (834x1194)` × light & dark × `#home`, `#team`, `#meta`, `#pokemon=Garchomp`, `#battle` passed with **0 differing pixels** (byte-for-byte identical PNGs).
     - `host-wrapper-test (webkit): ALL 60 PASSED`
   - Meaning: WebKit has 0 baseline render noise and 0 pixel differences between unwrapped and Claude-host-wrapped builds on all 3 Apple devices and all 5 pages.

2. **Default Chromium mode** — checked:
   - Command: `PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs`
   - Result: `host-wrapper-test (chromium): ALL 8 PASSED` — **exit 0**
   - Meaning: Default CI Chromium check still passes with 0 differing pixels.

3. **Syntax check** — checked:
   - Command: `node experiments/syntax-check.mjs`
   - Result: `syntax-check: all 430 scripts parse` — **exit 0**
   - Meaning: All 430 scripts parse cleanly.

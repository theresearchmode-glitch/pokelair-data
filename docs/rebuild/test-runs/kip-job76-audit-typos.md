# Job 76 — `fields-audit.mjs` Player Item Typos (GitHub Issue 55)

- **Branch:** `alt/gemini-audit-typos` (from `origin/claude/design6` `978d8213`)
- **Problem:** `experiments/fields-audit.mjs` filtered abilities against real names (`ABIL[n]`), but filtered items only with `/^[A-Z]/`. A player typo in `out/matches.json` (`Dragonite-Mega@Dragonitete`, 0.01% of slots) failed the live-data audit as an unmodelled item.

## Fix (`experiments/fields-audit.mjs`)

- Loaded `REGMC_ITEMS` (`app/src/data/items-list.js`) + `MEGA_STONE` values (`app/src/app/19-showdown-paste.js`) into `REAL_ITEMS`.
- Only items in `REAL_ITEMS` that are not read by the engine (and not in `NOT_MODELLED` / `NO_CALC_EFFECT`) can fail the audit (`missIt`).
- Non-item names (`/^[A-Z]/`, not in `REAL_ITEMS` or `NO_CALC_EFFECT`) are logged as a note with their share: `note: names that are not items (player typos): <name> (<share>% of slots)`.
- Added `FIELDS_OUT` env override for fixture testing (defaults to `out/`) and `(T.top || [])` guard for empty day-one `meta_tour.json`.

## Verification (`checked`)

- **Before fix (`978d8213`):** `node experiments/fields-audit-test.mjs` -> `fields-audit-test: 5 FAILED` (exit `1`); `node experiments/fields-audit.mjs` -> `FAIL: items players run that the engine never reads: Dragonitete (0.01% of slots)` (exit `1`).
- **After fix:**
  - `node experiments/fields-audit-test.mjs` -> `fields-audit-test: ALL PASSED` (exit `0`: live `out/` passes + notes `Dragonitete`, made-up typo `FakeTypoStone` passes + notes `0.50% of slots`, real unmodelled item `Shed Shell` still FAILS with exit `1`).
  - `node experiments/fields-audit.mjs` -> `PASS: every VGC-relevant field is in the data and used by the engine` (exit `0`).

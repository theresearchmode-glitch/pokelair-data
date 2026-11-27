# Job 74 — Dec 2 Patch Night Full Dry Run (Scratch Copy)

- **Branch:** `alt/gemini-dec2-dryrun` (from `origin/claude/design6` `978d8213`, merged `origin/alt/maggi-m7-dec2fix` `a3d7622b`)
- **Scratch repo:** `/tmp/dec2-dryrun` (deleted after run; real working tree never mutated by dry-run outputs)
- **Fake clock:** `2026-12-02T02:05:00Z` (5 minutes after Dec 2 maintenance/switch)
- **Fixture inputs:** Made-up Reg M-D day-one `out/` (`reg: "M-D"`, `since: "2026-12-02"`, `teams: 0`, `events: 0`, `model.ships: false`) + 3 fixture Reg M-D Pokémon (`Latias`, `Latios`, `Latios-Mega`) + `data/regmd-items.txt` (`+Latiosite`) + synthetic `regulation.json` (`site: "M-C" -> "M-D"`).

## 1. Step-by-Step Exit Codes & Exact Last Lines (`checked` on `/tmp/dec2-dryrun`)

| # | Step / Command | Exit | Exact Last Line / Key Output |
|---|---|---:|---|
| 1 | `node experiments/apply-dec2-patch.mjs --write --now 2026-12-02T02:05:00Z` | **0** | `apply-dec2-patch: WROTE 6 file(s): app/src/data/data.js, app/src/data/info-text.js, app/src/data/move-acc.js, app/src/data/move-meta.js, app/src/v2/pages/infosheet.js, app/test/run.mjs` (+47 `LEARN` pairings, 2 `ABIL`, 3 `INFO_TEXT`, 5 `MOVE_ACC`, 5 `MOVE_META`, 1 `IS_LEAD`, 1 `run.mjs` Hustle 72->76) |
| 2a | `node experiments/md-roster-step.mjs --write --reg M-D --add fixture-add.json --items data/regmd-items.txt` (real clock Nov 27, no `--force-patch`/`--now`) | **0** | `8. apply-dec2-patch.mjs: NOT applied, it is before the patch time (2026-12-02T02:00Z).` / `md-roster-step: DONE` (regenerating `data.js` wiped `LEARN` & `ABIL` until step 2b) |
| 2b | `node experiments/md-roster-step.mjs --write --reg M-D --add fixture-add.json --items data/regmd-items.txt --force-patch` (and `--now 2026-12-02T02:05:00Z` after fix) | **0** | `8. apply-dec2-patch.mjs: re-applied cleanly` / `md-roster-step: DONE` |
| 3 | `node app/build.mjs` | **0** | `slim: 3508 KB -> 3049 KB (dead CSS 195 KB: 284 rules, 343 selectors; short prefix 173 KB; never-used old rules 0 = 0 KB)` |
| 4 | `node -r /tmp/dec2-dryrun/fake-dec2.cjs experiments/rules-fixes-test.mjs` (clock `2026-12-02T02:05:00Z`) | **0** | `14/14 passed (dist/page.html)` (check 5 `Flash Fire`/`Stalwart` Dec 2 guard PASSED) |
| 5 | `node experiments/speed-check.mjs` | **0** | `reference: Sneasler Jolly 32 Spe = 189; with Unburden in item consumed = 378` |
| 6 | `node experiments/calc-check.mjs 2000` | **0** | `exact or explained: 99.98%` (5 species diffs: 3 fixture mons + Aegislash + Palafin) |
| 7a | `node experiments/fields-audit.mjs` (BEFORE fix, on M-D day-one `out/meta_tour.json`) | **1** | **CRASH:** `TypeError: T.top is not iterable` at `experiments/fields-audit.mjs:61:64` |
| 7b | `node experiments/fields-audit.mjs` (AFTER fix `T.top \|\| []`) | **1** | Clean exit 1 listing expected diffs: 5 patched moves vs Showdown `1242c1e` (`Rock Slide`, `Steel Wing`, `Screech`, `Metal Sound`, `Frost Breath`) + 3 missing weights (`Latias`, `Latios`, `Latios-Mega`) |
| 8 | `node experiments/md-day-one-test.mjs` | **0** | `ALL 22 TESTS PASSED` |
| 9 | `node app/build.mjs --v2 --preview-data` | **0** | `built dist/v2.html (3498 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)` |
| 10 | `node experiments/unrated-test.mjs` (after v2 build) | **0** | `unrated test: all passed` (349 Pokémon) |
| 11 | `node app/build.mjs --v2 --split --split-routes --art=../src/v2/art/ --public` | **0** | `built dist/v2.html (876 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)` (`349 Pokémon pages`, `Data as of Dec 2`) |
| 12a | `node app/test/run.mjs` (on empty M-D day-one `out/`) | **1** | `ok sure-hit moves can't be made to miss; Hustle still cuts others (100/100, Rock Slide 76)`; failed on empty `out/` assertions (`meta/tour: 1 rows`, `events: 1 events`, `run.mjs:335`) |
| 12b | `node app/test/run.mjs` (on patched + roster-updated tree with frozen `out/`) | **0** | `ALL PASSED` (`page errors: 0`, `STRESS CHECKS CLEAN`, `Rock Slide 76` passed) |
| 13 | `node experiments/apply-dec2-patch-test.mjs` (on patched scratch tree) | **1** | `apply-dec2-patch-test: 12 FAILED (18 passed)` — **see Blocker #1 below** |
| 14 | `node experiments/apply-dec2-patch-test.mjs` (on clean repo branch) | **0** | `apply-dec2-patch-test: ALL 30 PASSED` |
| 15 | `node experiments/md-roster-step-test.mjs` (on clean repo branch) | **0** | `md-roster-step-test: ALL PASSED` |

## 2. Files Changed by the Dry Run (`git status -s` in `/tmp/dec2-dryrun`)

- By `apply-dec2-patch.mjs --write`: `app/src/data/data.js`, `app/src/data/info-text.js`, `app/src/data/move-acc.js`, `app/src/data/move-meta.js`, `app/src/v2/pages/infosheet.js`, `app/test/run.mjs` (6 files).
- By `md-roster-step.mjs --write`: `app/src/data/data.js`, `roster.json`, `app/src/app/15-visual-helpers.js`, `app/src/data/items-list.js`, `app/src/app/24-sheet-data.js`, `regulation.json` (6 files; plus sprite `.webp` files via `add-sprites.mjs`).

## 3. Patch-Night Blockers & Order-of-Steps Findings (What Would Stop Real Dec 2 Night)

1. **HIGH — CI Blocker: `experiments/apply-dec2-patch-test.mjs` (`.github/workflows/test.yml:166`) goes RED (`12 FAILED`) once the patch is committed.**
   - `apply-dec2-patch-test.mjs` copies the repo's own `app/src/data/*`, `infosheet.js`, and `run.mjs` into scratch and expects them to be **unpatched**.
   - **Action on Dec 2 night:** Remove or retire the `apply-dec2-patch-test.mjs` step from `.github/workflows/test.yml:166` in the same commit/PR that runs `apply-dec2-patch.mjs --write` (left untouched here per test-integrity rule).
2. **HIGH — Missing `SPECIES_WT` & `INFO_TEXT` for newly added Reg M-D Pokémon/items after `md-roster-step.mjs`:**
   - `md-roster-step.mjs` updates `data.js` (`ROSTER`/`LEARN`), `roster.json`, `SPRITE_ID`, and `items-list.js`, but does **not** re-run `gen-move-meta.mjs` or `gen-info-text.mjs`.
   - `fields-audit.mjs` failed with `weights differ from the champions mod` / `Pokémon without weight` for all 3 newly added fixture Pokémon (`Latias`, `Latios`, `Latios-Mega`).
   - **Required order on Dec 2 night:**
     1. Run `md-roster-step.mjs --write --reg M-D ...` (Step 1 regenerates `data.js`; Step 8 runs `apply-dec2-patch.mjs --write`).
     2. Run `node experiments/gen-move-meta.mjs` and `node experiments/gen-info-text.mjs` so new Reg M-D Pokémon get `SPECIES_WT` and new items/abilities get `INFO_TEXT`.
     3. If Showdown's pinned commit does **not** yet include `smogon/pokemon-showdown#12475`, run `node experiments/apply-dec2-patch.mjs --write` **a second time** (safe/idempotent) so the 5 patched moves + `Flash Fire`/`Stalwart` stay patched on top of the freshly regenerated `move-meta.js`, `move-acc.js`, and `info-text.js`.
     4. Note: `fields-audit.mjs` (`.github/workflows/test.yml:178`) will remain red on the 5 patched moves until the Showdown pin moves to a commit with PR `#12475`.
3. **MEDIUM — Order sensitivity if `md-roster-step.mjs` runs before `02:00Z` Dec 2:**
   - Running `md-roster-step.mjs --write` before `02:00Z` overwrites `data.js` and skips Step 8 (`exit 3`, before patch time). Always re-run `node experiments/apply-dec2-patch.mjs --write` after `02:00Z` (or run `md-roster-step.mjs` after `02:00Z`).
4. **MEDIUM — `app/test/run.mjs` expects frozen `out/`, not empty M-D day-one `out/`:**
   - On `claude/design6`, keep `out/` as frozen Reg M-C data so `run.mjs` passes (`ALL PASSED`, including `Rock Slide 76`); empty day-one `out/` belongs on `main` / live deploy only.

## 4. Real Script Bugs Fixed on This Branch (Fail-First Verified)

1. **`experiments/fields-audit.mjs:61`:** `rows = [...T.top, ...(T.more || [])]` threw `TypeError: T.top is not iterable` on empty Reg M-D day-one `out/meta_tour.json` (`checked` failing before fix -> exits cleanly with structured audit output after fix `(T.top || [])`).
2. **`experiments/md-roster-step.mjs:203`:** Forward optional `--now <ISO>` flag to `apply-dec2-patch.mjs` in Step 8 so fake-clock dry runs work without requiring `--force-patch` (`checked` with `--now 2026-12-02T02:05:00Z`, exit `0`, `8. apply-dec2-patch.mjs: re-applied cleanly`).

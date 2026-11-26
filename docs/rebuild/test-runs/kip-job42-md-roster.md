# Dec 1 Night Roster Step in One Command (Job 42)

Branch: `alt/gemini-md-roster` (from `origin/claude/design6` `c062acf1`).

## What Was Added
1. **`experiments/md-roster-step.mjs`** — single command that runs every Dec 1 night roster step in order, **DRY-RUN by default** (prints every planned change, writes nothing) and applies all changes with `--write`, stopping on the first error with a plain message (`exit 1`):
   1. `app/src/data/data.js` via `experiments/gen-roster.mjs` (`--ps`, `--format`, optional `--add`)
   2. `roster.json` rebuilt from the new `ROSTER` names
   3. `SPRITE_ID` in `app/src/app/15-visual-helpers.js` updated for every new Pokémon/Mega (fails fast if any new roster entry lacks a PokéAPI ID)
   4. `experiments/add-sprites.mjs` exact command printed (or executed with `--run-sprites`)
   5. `app/src/data/items-list.js` rebuilt from `--items <txt>` (when provided)
   6. `PAGE_REG` in `app/src/app/24-sheet-data.js` updated to `--reg <id>` (when provided)
   7. `regulation.json` `"site"` updated to `--reg <id>` (when file exists and `--reg` provided)
   8. `experiments/apply-dec2-patch.mjs` re-applied automatically on `--write` if present (so regenerated `LEARN` never drops the Dec 2 patch's 44 moves)
2. **`experiments/md-roster-step-test.mjs`** — offline fixture test running in a scratch copy of the repo, adding 2 existing Showdown Pokémon not in our roster (`Latios` 381, `Latias` 380) + 1 Mega (`Latios-Mega` 10062) plus a fixture `data/regmd-items.txt` (`Latiosite`) and `--reg M-D`.

## Checks (`checked` on frozen `out/` `0c992f69`)
- **Fail proofs (built into `md-roster-step-test.mjs` checks 1a–1c):**
  - Missing sprite ID (`Latios` without `sprite`) -> `exit 1`, `missing SPRITE_ID`
  - Missing Showdown (`--ps /nonexistent-ps-dir`) -> `exit 1`, `Showdown is not built`
  - Bad regulation (`--reg BAD`) -> `exit 1`, `--reg must look like`
- **Full fixture run (`node experiments/md-roster-step-test.mjs`):**
  - Dry-run modifies 0 files (`unchanged=true`)
  - `--write` updates all 6 files (`ROSTER` 346 -> 349, `Meowstic-F` preserved, `roster.json` 349 names, `SPRITE_ID`, `items-list.js`, `PAGE_REG = 'M-D'`, `regulation.json` `"site": "M-D"`)
  - Second `--write` is byte-for-byte idempotent across all 6 files (`identical=true`)
  - Post-roster regression tests on the updated scratch copy:
    - `rules-fixes-test.mjs`: `14/14 passed (dist/page.html)` (`exit 0`)
    - `unrated-test.mjs`: `unrated test: all passed` (`exit 0`)
    - `pokemon-pages-test.mjs`: `pokemon-pages-test: all passed` (`exit 0`)
- **Syntax check:** `node experiments/syntax-check.mjs` (run before push).

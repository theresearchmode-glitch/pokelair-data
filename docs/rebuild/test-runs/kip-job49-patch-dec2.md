# Kip job 49: Dec 2, 2026 balance patch (hand-written half)

Written Thu Nov 26, 9:46 AM (ET). Branch `alt/gemini-patch-dec2` from `origin/claude/design6` `9bab576f`.
**Not for merge before Dec 2.** Generated files (`move-acc.js`, `move-meta.js`, `info-text.js`) are untouched and wait for a Showdown commit with the Dec 2 patch.

## What changed (checked against `patch-dec2-map.md`, `patch-dec2-psychup.md`, and `patch-dec2-official-877.html`)
1. **`app/src/data/data.js` (`LEARN`, sorted ascending numeric indexes):** 47 new `(Pokémon, move)` pairings across 46 keys:
   - **Psych Up (idx `264`)**: 22 official species (`Alakazam`, `Starmie`, `Mr. Mime`, `Mawile`, `Altaria`, `Castform`, `Absol`, `Roserade`, `Weavile`, `Rotom`, `Rotom-Heat`, `Rotom-Wash`, `Rotom-Frost`, `Rotom-Fan`, `Rotom-Mow`, `Liepard`, `Musharna`, `Audino`, `Cofagrigus`, `Slurpuff`, `Drampa`, `Annihilape`) + 8 Megas (`Alakazam-Mega`, `Starmie-Mega`, `Mawile-Mega`, `Altaria-Mega`, `Absol-Mega`, `Absol-Mega-Z`, `Audino-Mega`, `Drampa-Mega`) + 3 Castform battle forms (`Castform-Sunny`, `Castform-Rainy`, `Castform-Snowy`).
     - *Note for HH:* `Castform-Sunny`, `Castform-Rainy`, and `Castform-Snowy` were not mentioned in `patch-dec2-psychup.md`, but on `origin/claude/design6` all 3 have byte-identical `LEARN` arrays to `Castform` (Forecast in-battle form changes keep Castform's moveset, same as Megas). Added `264` to all 3 to preserve parity.
   - **Slack Off (idx `349`)**: `Emboar`, `Emboar-Mega`.
   - **Roost (idx `98`)**: `Beedrill`, `Beedrill-Mega`, `Hydreigon`.
   - **Tailwind (idx `180`)**: `Emolga`.
   - **Wonder Room (idx `271`)**: `Umbreon`.
   - **Play Rough (idx `218`)**: `Vaporeon`, `Jolteon`, `Flareon`, `Espeon`, `Umbreon`, `Leafeon`, `Glaceon`. *(Sylveon already had `218`.)*
2. **`app/src/data/data.js` (`ABIL`):**
   - `Flash Fire`: `"This Pokemon's Fire attacks do 1.5× damage if hit by one Fire move (Fire Boost persists after Mega Evolution); Fire immunity."`
   - `Stalwart`: `"This Pokemon's moves cannot be redirected to a different target by any effect, and ignore targets' substitutes."`
3. **`app/src/v2/pages/infosheet.js:15`:** Rock Slide lead text `30%` → `20%` (`'Hits both foes. Each one hit has a 20% chance to flinch.'`).
4. **`app/test/run.mjs:147`:** Hustle Rock Slide accuracy expectation `r.hustle === 72` → `r.hustle === 76` (`95 × 0.8`).
5. **`experiments/patch-dec2-test.mjs` (new):** checks all 47 `LEARN` pairings, exact `LEARN` and `ABIL` diff against `origin/claude/design6` (only listed keys/moves differ), `infosheet.js` 20%, `run.mjs` 76, and that `move-acc.js`, `move-meta.js`, `info-text.js` are untouched.

## Test lines that will still fail until generated files are rebuilt on Dec 2
- **`app/test/run.mjs:147` (`r.hustle === 76`):** `T.moveAcc(M('Rock Slide'), 'Hustle', '', null, '')` reads Rock Slide's base accuracy from `app/src/data/move-acc.js` (`MOVE_ACC['Rock Slide']`, currently `90`), so it returns `72` (`90 × 0.8`) and fails this line until `experiments/gen-move-meta.mjs` regenerates `move-acc.js` with `95` from the Dec 2 Showdown commit. (Expect GitHub's `code tests` / `data checks` on this branch to fail ONLY at `run.mjs:147` until Dec 2.)

## Verification
- **Fail first (plain `origin/claude/design6` `9bab576f`):** `node experiments/patch-dec2-test.mjs` → `patch-dec2-test: 52 FAILED` (47 `LEARN` pairings + `LEARN` diff + 2 `ABIL` + `infosheet.js` + `run.mjs`).
- **Pass after (checked):**
  - `node experiments/patch-dec2-test.mjs` → `patch-dec2-test: ALL PASSED` (57/57, exit 0)
  - `node experiments/legality-check.mjs` → `exit 0` (new `LEARN` pairings do not break legality checks)
  - `node app/build.mjs` → `build-ok` (exit 0)
  - `node experiments/syntax-check.mjs` → `syntax-check: all 418 scripts parse` (exit 0)

## Not checked
- Full `node app/test/run.mjs` (known to fail at line 147 until `move-acc.js` is regenerated on Dec 2).
- `experiments/gen-move-meta.mjs` and `experiments/gen-info-text.mjs` (require the Dec 2 Showdown commit, not out yet).

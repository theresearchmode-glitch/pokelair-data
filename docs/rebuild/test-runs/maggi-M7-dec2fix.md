# Maggi Job M7: Cross-check of both Dec 2 patch scripts + `data.js` `ABIL` `done` predicates

- **Date:** Fri Nov 27 06:44:38 AM EST 2026
- **Branch:** `alt/maggi-m7-dec2fix` (branched from `origin/claude/design6` `5d111577`)
- **What I'd need to know that you haven't told me:** Nothing missing.

## 1. Cross-check of helper's script (`5d111577`) vs Maggi's M5 script (`b0daf6e8`) on scratch copies of `origin/claude/design6`

Both ran `--write --force` (exit 0 each) on isolated scratch copies of `5d111577`; all 6 files were diffed.

| File / Table | Difference | Which matches official notes (`news 877` / `patch-dec2-map.md` / `patch-dec2-psychup.md`) | Proof (checked) |
|---|---|---|---|
| `data.js` `LEARN` | 44 pairings identical. Helper adds 3 extra: `Castform-Rainy`, `Castform-Snowy`, `Castform-Sunny` (`Psych Up`). Maggi adds 0 extra. | **Helper** (keep all 47). The 3 Castform weather forms are `LEARN`-only battle forms sharing Castform's exact move list; HH explicitly approved keeping them (`helper-dec2patch.md:9-10`). | Checked via scratch diff: `LEARN in Helper only: ['Castform-Rainy|Psych Up', 'Castform-Snowy|Psych Up', 'Castform-Sunny|Psych Up']`, `LEARN in Maggi only: []`. |
| `data.js` `ABIL` (`Flash Fire`, `Stalwart`) | Minor phrasing differences only; both state Fire immunity, Fire Boost (1.5×), persists through Mega Evolution, and Stalwart ignoring targets' substitutes. | **Helper** (keep). Matches `patch-dec2-official-877.html:45`, satisfies `rules-fixes-test.mjs:174-175`, and was approved by HH (`helper-dec2patch.md:6-8`) as interim text until Showdown/Bulbapedia publish in-game English text on Dec 2. | Checked via scratch diff and `rules-fixes-test.mjs --src` with Dec 3 clock. |
| `move-acc.js`, `move-meta.js`, `info-text.js` (generated) | Helper patches all 3 on top (Rock Slide 95 / 20% flinch, Screech/Steel Wing/Metal Sound/Frost Breath → 100, `INFO_TEXT` Rock Slide 20% + Flash Fire + Stalwart), with `done` predicates so regenerated files self-skip. Maggi left generated files untouched. | **Helper** (keep). Gives accurate Dec 2 numbers immediately even before Showdown updates, and self-skips once generators re-run from a post-patch Showdown pin. | Checked via scratch diff (`MOVE_ACC` & `MOVE_META`: exact 5 moves; `INFO_TEXT`: `mv` Rock Slide, `ab` Flash Fire & Stalwart). |
| `app/src/v2/pages/infosheet.js` | **None (byte-for-byte identical).** | Both (`30%` → `20%` flinch). | Checked via scratch diff (`identical? true`). |
| `app/test/run.mjs` | Helper changes `r.hustle === 72` → `r.hustle === 76` (and accepts `Math.floor(` as already done); Maggi reads `hustleBase` dynamically. | **Helper** (keep — nothing wrong). `patch-dec2-map.md:40-41` explicitly allows either `76` or reading from `MOVE_ACC`, and helper updates `move-acc.js` to 95 in the same `--write` run. | Checked via scratch diff (`L146`/`L149`). |

**Step 1 conclusion:** Nothing missing or wrong in the helper's script (`5d111577`). Only the M6 "should" fix (`done` predicates on `data.js` `ABIL`) was needed.

---

## 2. Changes on `alt/maggi-m7-dec2fix`
1. **`experiments/apply-dec2-patch.mjs:93-96`**: Added `done` predicates to `data.js` `ABIL Flash Fire` (`Fire Boost` + `Mega Evol` in the `"Flash Fire"` value) and `ABIL Stalwart` (`/substitute/i` in the `"Stalwart"` value), matching `rules-fixes-test.mjs:174-175` and `info-text.js` lines 97-100, so `md-roster-step` step 8 won't abort if Showdown's post-Dec-2 in-game Ability wording differs from `FF_NEW`/`ST_NEW`.
2. **`experiments/apply-dec2-patch-test.mjs:151-164`**: Added check 8 testing alternative post-patch Showdown Ability wording in `data.js`.

### Fail-first → pass-after proof (check 8)
- **Before (`5d111577`):** `node experiments/apply-dec2-patch-test.mjs` → **exit 1**:
  `FAIL  8. post-patch Showdown wording in data.js ABIL is accepted as already done (exit 1: apply-dec2-patch STOPPED (nothing written): app/src/data/data.js: ABIL Flash Fire: expected the old text once, found it 0 times, and the new text isn't there either. | ...)` / `apply-dec2-patch-test: 1 FAILED (29 passed)`
- **After:** `node experiments/apply-dec2-patch-test.mjs` → **exit 0**:
  `PASS  8. post-patch Showdown wording in data.js ABIL is accepted as already done (exit 0)` / `apply-dec2-patch-test: ALL 30 PASSED`

---

## 3. Checks run (commands, exact results, exit codes)

1. **`experiments/apply-dec2-patch-test.mjs`** (includes `rules-fixes-test --src` with Nov 30 clock, Dec 3 unpatched FAIL, and Dec 3 patched PASS) — checked:
   - Command: `node experiments/apply-dec2-patch-test.mjs`
   - Result: `apply-dec2-patch-test: ALL 30 PASSED` — **exit 0**
   - Meaning: All 30 checks pass, including new check 8 and check 7's fake Dec 3 time-bomb fail/pass.

2. **`experiments/rules-fixes-test.mjs --src` (real clock)** — checked:
   - Command: `node experiments/rules-fixes-test.mjs --src`
   - Result: `14/14 passed (source vm)` — **exit 0**
   - Meaning: Passes on today's real clock.

3. **`experiments/md-roster-step-test.mjs`** — checked:
   - Command: `node experiments/md-roster-step-test.mjs`
   - Result: `md-roster-step-test: ALL PASSED` — **exit 0**
   - Meaning: Full roster step + downstream checks (`rules-fixes-test`, `unrated-test`, `pokemon-pages-test`) pass.

4. **`app/build.mjs` + `app/test/run.mjs`** — checked:
   - Command: `node app/build.mjs && node app/test/run.mjs`
   - Result: `STRESS CHECKS CLEAN` / `ALL PASSED` — **exit 0**
   - Meaning: Full page test suite and stress checks pass.

5. **`experiments/syntax-check.mjs`** — checked:
   - Command: `node experiments/syntax-check.mjs`
   - Result: `syntax-check: all 429 scripts parse` — **exit 0**
   - Meaning: All 429 scripts parse cleanly.

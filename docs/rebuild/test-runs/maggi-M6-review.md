# Maggi Job M6: Independent review of `origin/alt/helper-dec2patch` (`fc49e36d`)

- **Date:** Fri Nov 27 06:33:58 AM EST 2026
- **Reviewed branch:** `origin/alt/helper-dec2patch` (`fc49e36d`, 5 files, +426 / -6 vs `origin/claude/design6` `23520831`)
- **Report branch:** `alt/maggi-m6-review` (report only, no code changes)
- **Sources checked against:** `docs/rebuild/test-runs/patch-dec2-official-877.html` (official Pokémon HOME news 877), `patch-dec2-map.md`, `patch-dec2-psychup.md`, and `maggi-M4-patchmap.md`.
- **What I'd need to know that you haven't told me:** Nothing missing.

## Summary verdict
- **Ready to merge (no blockers).** Every Pokémon, form (including all 8 Megas + 3 `LEARN`-only Castform weather forms + `Emboar-Mega` + `Beedrill-Mega`), move, accuracy, flinch %, and Ability rule matches the official Pokémon HOME news 877 word for word. Nothing missing, nothing extra.
- **Findings:** 0 blockers, **1 should-fix** (missing `done` predicate on `data.js` `ABIL` rows when `md-roster-step` regenerates from a post-patch Showdown commit), **2 minor** edge-case notes.

---

## Verification checklist (against official news 877 + map + M4)

| Area | Status | Proof (checked) |
|---|---|---|
| `LEARN` Psych Up (22 base + 8 Megas + 3 Castform forms = 33) | **Exact match** | Checked `apply-dec2-patch.mjs:70-72,151` against `patch-dec2-official-877.html:45` and `apply-dec2-patch-test.mjs` run (`added 47, lost 0`). All 22 official names match; `forms` filter (`!byName.has(k) || byName.get(k).m === 1`) adds the 8 Megas + `Castform-Sunny/-Rainy/-Snowy` without touching non-Mega regional forms. |
| `LEARN` other 5 moves (Slack Off 2, Roost 3, Tailwind 1, Wonder Room 1, Play Rough 7 = 14) | **Exact match** | Checked `apply-dec2-patch.mjs:73-77,151` against `patch-dec2-official-877.html:45`: `Emboar` + `Emboar-Mega`, `Beedrill` + `Beedrill-Mega` + `Hydreigon`, `Emolga`, `Umbreon`, 7 Eeveelutions (Sylveon untouched, keeps Play Rough). Total 33 + 14 = 47 pairings. |
| Move accuracies & flinch (`move-acc.js`, `move-meta.js`, `info-text.js`, `infosheet.js`, `run.mjs`) | **Exact match** | Checked `apply-dec2-patch.mjs:99-114` against `patch-dec2-official-877.html:45`: Rock Slide 90→95 acc & 30→20% flinch; Screech 85→100, Steel Wing 90→100, Metal Sound 85→100, Frost Breath 90→100 (dropped from `MOVE_ACC`, `"a"` removed in `MOVE_META`); `infosheet.js` 30%→20%; `run.mjs` Hustle 72→76 (`floor(95 × 0.8)`). |
| Ability wording (`data.js` `ABIL` + `info-text.js` `ab`) | **Matches official note & CI guard** | Checked `apply-dec2-patch.mjs:85-88,93-98` against `patch-dec2-official-877.html:45` and `rules-fixes-test.mjs:174-175`: Flash Fire states Fire immunity, Fire Boost (1.5×), persists if it Mega Evolves; Stalwart adds ignores effects of targets' substitutes. `rules-fixes-test.mjs --src` fails Dec 3 unpatched and passes Dec 3 patched. |
| `md-roster-step.mjs` step 8 + `.github/workflows/test.yml` | **Exact match** | Checked diff: `md-roster-step.mjs:203-206` passes `--write --root` (and `--force` on `--force-patch`), handles exit 3 cleanly when run before Dec 2 02:00 UTC. `test.yml:5,163` wires `apply-dec2-patch-test.mjs` into CI. |
| Showdown pin (`1242c1e`) | **Expected out-of-scope (GG-2)** | Properly noted in `apply-dec2-patch.mjs:49-50,189` and `helper-dec2patch.md:54`: `fields-audit.mjs` will disagree on the 5 moves until GG-2 bumps the Showdown pin in `package.json` / `test.yml`. |

---

## Findings

### 1. [should] `data.js` `ABIL` edits lack `done` predicates, so `md-roster-step` step 8 will abort if Showdown publishes slightly different in-game wording for Flash Fire or Stalwart
- **Where:** `experiments/apply-dec2-patch.mjs:93-94` (compare with `info-text.js` lines 95-98)
- **Status:** checked (code read)
- **Proof:**
  - **Input:** After GG-2 bumps the Showdown pin to a post-Dec-2 commit, `md-roster-step.mjs --write` regenerates `data.js` with Showdown's official in-game `ABIL['Flash Fire']` / `ABIL['Stalwart']` text (which will almost certainly differ slightly from `FF_NEW`/`ST_NEW`), then runs `apply-dec2-patch.mjs --write --root`.
  - **Now:** Lines 95-98 (`info-text.js`) have `done` predicates (`/"Flash Fire":"[^"]*Mega Evol/` and `/"Stalwart":"[^"]*substitute/i`), so they gracefully report `already done`. Lines 93-94 (`data.js` `ABIL`) have **no `done` predicate**, so `textEdits()` (`line 131`) throws `Surprise` (exit 1) whenever `ABIL['Flash Fire']` or `ABIL['Stalwart']` is neither `FF_OLD` nor byte-for-byte `FF_NEW`, failing step 8 of `md-roster-step.mjs`.
  - **Should:** Add `done` predicates to lines 93-94 matching `rules-fixes-test.mjs:174-175` (e.g., `s => /"Flash Fire":"[^"]*Fire Boost[^"]*Mega Evol/.test(s)` and `s => /"Stalwart":"[^"]*substitute/i.test(s)`).

### 2. [minor] Trailing-comma assumption on `move-acc.js` entries
- **Where:** `experiments/apply-dec2-patch.mjs:101-105`
- **Status:** checked (inspected `app/src/data/move-acc.js:3`)
- **Proof:**
  - **Input:** `move-acc.js` where any of the 5 patched moves appears as the final key before `}` (no trailing `,`).
  - **Now:** Works on today's `move-acc.js` (all 5 are followed by `,`), and would stop cleanly with exit 1 (nothing written) if a regenerated `move-acc.js` placed one last.
  - **Should:** Optional; safe as-is because it fails closed without corrupting JSON.

### 3. [minor] `apply-dec2-patch-test.mjs` does not test `md-roster-step.mjs` step 8 directly
- **Where:** `experiments/apply-dec2-patch-test.mjs`
- **Status:** checked (ran `md-roster-step.mjs --write` and `--write --force-patch` on a scratch copy manually below)
- **Proof:** Verified manually below that both `--write` (exit 0, logs NOT applied before Dec 2) and `--write --force-patch` (exit 0, step 8 re-applied cleanly, idempotent on second run) work as documented.

---

## Checks run (commands, exact results, exit codes)

1. **Helper's test suite (`apply-dec2-patch-test.mjs`)** — checked:
   - Command: `node experiments/apply-dec2-patch-test.mjs`
   - Result: `apply-dec2-patch-test: ALL 29 PASSED` — **exit 0**
   - Meaning: Dry run, early-write refusal (exit 3), surprise abort (exit 1, nothing written), exact 47 LEARN pairings, ABIL/MOVE_ACC/MOVE_META/INFO_TEXT/infosheet/run.mjs updates, idempotency, renumbered/lost MOVES, and `rules-fixes-test.mjs --src` time-bomb fail-before / pass-after all pass.

2. **`md-roster-step.mjs --write` and `--write --force-patch` on isolated scratch copy** — checked (after building `node_modules/pokemon-showdown`):
   - Command: `node experiments/md-roster-step.mjs --root <scratch> --write` (no `--force-patch`)
   - Result: `8. apply-dec2-patch.mjs: NOT applied, it is before the patch time (2026-12-02T02:00Z). ...` / `md-roster-step: DONE` — **exit 0**
   - Command: `node experiments/md-roster-step.mjs --root <scratch> --write --force-patch` (run twice)
   - Result (both runs): `8. apply-dec2-patch.mjs: re-applied cleanly` / `md-roster-step: DONE` — **exit 0**
   - Meaning: Step 8 integration works cleanly before Dec 2 (skips without failing) and with `--force-patch` (applies and stays idempotent on repeat runs).

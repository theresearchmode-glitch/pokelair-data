# Maggi Job M5: `experiments/apply-dec2-patch.mjs` + `experiments/apply-dec2-patch-test.mjs`

- **Date:** Fri Nov 27 06:31:33 AM EST 2026
- **Branch:** `alt/maggi-m5-dec2patch` (branched from `origin/claude/design6` `23520831`)
- **What I'd need to know that you haven't told me:** `experiments/md-roster-step.mjs:201` currently runs `spawnSync(process.execPath, [patchScript], {cwd: ROOT, encoding: 'utf8'})` with no `--write` flag. Because `apply-dec2-patch.mjs` is DRY RUN by default per M5, `md-roster-step.mjs:201` will need `'--write'` passed when it invokes `apply-dec2-patch.mjs` on Dec 2 (left untouched here to stay strictly within M5's scope).

## Files added
1. **`experiments/apply-dec2-patch.mjs`** — Dec 2 balance-patch applier for all hand-written code/data items (generated files `move-acc.js`/`move-meta.js`/`info-text.js` and the Showdown pin are left to Kip):
   - **Safety gate (lines 34-36):** refuses to run before `2026-12-02T02:00:00Z` unless `--force` is passed (exit 1 with plain message).
   - **Mode:** DRY RUN by default (prints `<file>: <old> -> <new>`, writes nothing); `--write` applies; `--root <dir>` targets a scratch copy; idempotent (second run prints `no changes needed` and exits 0); stops with exit 1 and a plain error on any unexpected content.
   - **Changes applied (49 total across 3 files, each quoting its doc source in comments):**
     - `app/src/data/data.js` (`MOVES` verified, `LEARN` +44 entries, `ABIL` +2 updates):
       - `Psych Up` added to all 22 official Pokémon + 8 Mega forms (`Alakazam-Mega`, `Starmie-Mega`, `Mawile-Mega`, `Altaria-Mega`, `Absol-Mega`, `Absol-Mega-Z`, `Audino-Mega`, `Drampa-Mega`; 30 entries; `patch-dec2-psychup.md:8-32,48-50`).
       - `Slack Off` added to `Emboar`, `Emboar-Mega` (`patch-dec2-psychup.md:38,49`).
       - `Roost` added to `Beedrill`, `Beedrill-Mega`, `Hydreigon` (`patch-dec2-psychup.md:39,50`).
       - `Tailwind` added to `Emolga` (`patch-dec2-psychup.md:40`).
       - `Wonder Room` added to `Umbreon` (`patch-dec2-psychup.md:41`).
       - `Play Rough` added to `Vaporeon`, `Jolteon`, `Flareon`, `Espeon`, `Umbreon`, `Leafeon`, `Glaceon` (`patch-dec2-psychup.md:42`).
       - `ABIL['Flash Fire']` and `ABIL['Stalwart']` updated to official Dec 2 wording (`patch-dec2-map.md:23`, `patch-dec2-psychup.md:53-54`, `rules-fixes-test.mjs:174-175`).
     - `app/src/v2/pages/infosheet.js:16`: Rock Slide flinch `30%` → `20%` (`patch-dec2-map.md:24`).
     - `app/test/run.mjs:146,149`: Rock Slide Hustle check reads base accuracy dynamically (`Math.floor(r.hustleBase * 0.8)`) so it passes both at 90% (72) and 95% (76) (`patch-dec2-map.md:40-41`).
2. **`experiments/apply-dec2-patch-test.mjs`** — isolated scratch-copy test suite (leaves repo untouched).

---

## Checks run (commands, exact results, exit codes)

1. **Full scratch-copy test suite (`experiments/apply-dec2-patch-test.mjs`)** — checked:
   - Command: `node experiments/apply-dec2-patch-test.mjs`
   - Exact result lines (**exit 0**):
     - `pass  1. refuses before Dec 2 without --force (exit 1: apply-dec2-patch: ERROR: refusing to run before Dec 2, 2026 02:00 UTC (now 2026-12-01T12:00:00.000Z;)`
     - `pass  2. dry run prints 49 planned changes across 3 files and leaves all files untouched (exit 0)`
     - `pass  3. time-bomb FAILS after Dec 2 without patch (exit 1; Flash Fire guard triggered)`
     - `pass  4a. --write --force applies 49 changes across 3 files (exit 0)`
     - `pass  4b. all 30 Psych Up (22 + 8 Megas) and 14 other move pairings landed in LEARN (missing: 0/0)`
     - `pass  4c. ABIL['Flash Fire'] and ABIL['Stalwart'] updated to Dec 2 official wording`
     - `pass  4d. infosheet.js Rock Slide flinch updated 30% -> 20%`
     - `pass  4e. app/test/run.mjs Hustle check reads Rock Slide base accuracy dynamically`
     - `pass  5. second run is a no-op and leaves all files byte-identical (exit 0)`
     - `pass  6. stops with plain error on unexpected file content (exit 1: apply-dec2-patch: ERROR: app/src/v2/pages/infosheet.js: expected Rock Slide flinch line no)`
     - `pass  7a. rules-fixes-test.mjs --src passes BEFORE Dec 2 after patch (exit 0)`
     - `pass  7b. rules-fixes-test.mjs --src passes AFTER Dec 2 after patch (exit 0)`
     - `pass  8a. patched scratch build + app/test/run.mjs passes (build exit 0, run exit 0)`
     - `pass  8b. patched scratch --v2 build + experiments/unrated-test.mjs passes (build exit 0, unrated exit 0)`
     - `apply-dec2-patch-test: all passed`
   - Meaning: All 14 checks pass on an isolated scratch copy, proving the time-bomb fails without the patch, every Dec 2 change lands cleanly and idempotently, and `rules-fixes-test`, `run.mjs` (incl. `stress-checks.mjs`), and `unrated-test.mjs` all pass after patching.

2. **Syntax check** — checked:
   - Command: `node experiments/syntax-check.mjs`
   - Result: `syntax-check: all 427 scripts parse` — **exit 0**
   - Meaning: All scripts parse cleanly.

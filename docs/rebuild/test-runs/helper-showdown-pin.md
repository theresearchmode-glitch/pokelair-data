# GG-2: the pokemon-showdown pin for Dec 2

HH's helper, Thu Nov 26, 11:22 PM (clock: docs/rebuild/now.sh). Branch alt/helper-showdown-pin from origin/claude/design6 23520831.
**Prepared, not merged.** It bumps 1242c1e2 (Oct 28) to Showdown master c7fa6f16 as of tonight (Wed Nov 25 02:00 -0700).

## Headline (checked)
**Showdown master does NOT have the Dec 2 patch yet.** I cloned smogon/pokemon-showdown (network allowed), installed c7fa6f16 with
npm, built it, and asked its Champions mod directly. Both commits give `Rock Slide 90/30, Screech 85, Steel Wing 90/10, Metal Sound 85,
Frost Breath 90`. Neither has a "Reg M-D" format. Its diff since 1242c1e doesn't touch data/mods/champions/learnsets.ts, and its
champions moves.ts has no Rock Slide entry.
So this bump changes none of our data. The real Dec 2 bump has to go to a later commit, once Showdown adds the patch and/or Reg M-D.
Until then, experiments/apply-dec2-patch.mjs (GG-1) carries the patch. On this branch fields-audit stays green, because the data is
unpatched.

## What changed in Showdown since 1242c1e (63 commits; read with git log/diff on the clone)
Touching the Champions mod or our formats:
- 41ba4797f Champions: Last Resort is disabled if it can't be used (champions/moves.ts). We list Last Resort. The generated data doesn't
  change (it's a callback, not a field).
- 8a11a5cd6 [Gen 9 Champions] Doubles: Evasion Abilities Clause. That's the Smogon Doubles format, not VGC Reg M-C (our format
  gen9championsvgc2026regmc's entry is unchanged).
- b3131aec4 Champions National Dex (champions rulesets.ts natdexmod, 1,260 natDexTier lines in champions formats-data.ts). Tiers
  only. Our generators don't read tiers.
- 29f2d9969 Roster Ranch Rumble (a new random format). 5b88c4761 / 2ee95b487 / 5b01be810: the Mega Evolution Battle format added and
  removed. 8f421176b November rotational ladders. None of these is our format.
- champions scripts.ts: Struggle recoil when it does 0 damage (4148c1187). Struggle isn't in our MOVES.
- Engine (sim/ and data/moves.ts) for every format: trapping moves now check trapping immunity (a99ea8717: Mean Look, Block, Jaw
  Lock, Spirit Shackle, Octolock among ours), Synchronoise vs typeless (not ours), Pursuit PP display, inputlog fix, Shedinja and
  Porygon learnsets in mainline (not Champions). These are simulator behaviour only. None of them is a field our generators copy.
- No change to: Abilities, items, the champions learnsets, accuracy, base power, or any of our 6 patch moves.

## The bump, in one commit (this branch)
| File:line | Change |
|---|---|
| package.json:17 | `github:smogon/pokemon-showdown#c7fa6f16503de510c319239b5b2d29d4f7abd8c4` |
| package-lock.json:13, :2081-2082 | same spec; resolved + integrity from `npm install --package-lock-only` (I removed a `"license": "UNLICENSED"` line npm added on its own) |
| .github/workflows/test.yml:571 | the `npm install --no-save ... github:smogon/pokemon-showdown#<new>` line |
| experiments/gen-move-meta.mjs:3, :45 | pin comment + the generated header ("GitHub build c7fa6f1") |
| experiments/gen-info-text.mjs:11 | `COMMIT` (also writes the info-text.js header) |
| experiments/gen-roster.mjs:7, experiments/fields-audit.mjs:2 | comments |
| app/src/data/move-acc.js:1, move-meta.js:1, info-text.js:1 | regenerated: only the header line changes (1242c1e -> c7fa6f1) |
Not changed: app/src/v2/pages/infosheet.js:13 ("fact-checked against Showdown 1242c1e"). It records a past check, not a pin.
**origin/main is not on this branch** (helpers never push main). Its lines are listed in the night steps below.

## Checks, before (design6 + 1242c1e) and after (this branch + c7fa6f16), frozen out/ 0c992f69
| Command | Before | After | Difference |
|---|---|---|---|
| `node app/build.mjs` | exit 0 | exit 0 | the built page differs only in SPECIES_WT key order (see note) |
| `node experiments/speed-check.mjs` (the stat/speed check; experiments/speed.mjs is the page-speed benchmark) | exit 0, `reference: Sneasler Jolly 32 Spe = 189; with Unburden in item consumed = 378` | same | 0 lines |
| `node experiments/calc-check.mjs 2000` | exit 0, `exact or explained: 99.97%` | same | 0 lines |
| `node experiments/mega-calc-crosscheck.mjs` | `PASS: 0 unexplained Mega calc mismatches` | same | 0 lines |
| `node experiments/rules-fixes-test.mjs` | `14/14 passed (dist/page.html)` | same | 0 lines |
| `node experiments/legality-check.mjs` | exit 0 | exit 0 | 0 lines |
| `node experiments/fields-audit.mjs` | `PASS: every VGC-relevant field is in the data and used by the engine` | same | 0 lines |
| `node experiments/md-roster-step-test.mjs` | `md-roster-step-test: ALL PASSED` | same | 0 lines |
| `node experiments/md-switch-page-gaps-test.mjs` (after `--v2 --preview-data`) | `ALL PASSED` | `ALL PASSED` | identical output |
| `node app/test/run.mjs` | `ALL PASSED` | `ALL PASSED` | see note |
| gen-roster `--ps` old vs new (to a scratch file) | — | — | byte-identical, and identical to today's data.js |
| gen-move-meta / gen-info-text at old vs new | — | — | values identical (MOVE_META, SPECIES_WT, MOVE_ACC, INFO_TEXT compared key by key) |
Time-only differences were ignored in these diffs.
`npm ci --ignore-scripts` on the new package.json + lock (scratch folder) gives exit 0, `added 188 packages`. The installed Showdown
has the new champions Last Resort code (grep count 3; the old install has 0), so the lock's integrity matches.

**Note (expected, not from the bump):** gen-move-meta, at the old pin too, writes SPECIES_WT in ROSTER order, which puts
`"Meowstic-F":8.5` at the end. The committed file has it by hand after Meowstic (457ace44). The values are the same. The order still
changed run.mjs's `coverage: renders (2285 chars)` to `(2288 chars)`, a pass both times. **I kept the committed SPECIES_WT line**
(only the header changes), and run.mjs is back to `2285 chars`, `ALL PASSED` (re-run, checked). If you regenerate on Dec 2, expect
that line to move, or put Meowstic-F back by hand.

## Dec 2 night steps (after 02:00Z, once Showdown has the patch; check with the probe in step 1)
1. Find the commit: `git ls-remote https://github.com/smogon/pokemon-showdown.git HEAD` -> <SHA>. Install it in a scratch folder:
   `npm install --no-save --no-package-lock github:smogon/pokemon-showdown#<SHA> && (cd node_modules/pokemon-showdown && node build)`.
   Probe: `node -e "const C=require('pokemon-showdown').Dex.mod('champions');console.log(C.moves.get('Rock Slide').accuracy, C.moves.get('Rock Slide').secondary.chance)"`
   -> must print `95 20`. If it prints `90 30`, Showdown doesn't have the patch yet: stop here, keep the pin, and run
   `node experiments/apply-dec2-patch.mjs --write` (GG-1) instead.
2. Branch from claude/design6. Replace 1242c1e2d9763ba5b85d33f13aecb89bae19ae3d (or c7fa6f16... if this branch was merged) with <SHA> in
   package.json:17, .github/workflows/test.yml:571, experiments/gen-info-text.mjs:11, gen-move-meta.mjs:3, gen-roster.mjs:7 and
   fields-audit.mjs:2. In gen-move-meta.mjs:45, set the 7-character header. Then `npm install --package-lock-only --ignore-scripts`
   and delete any extra `"license"` line it adds.
3. With node_modules on the new Showdown: `node experiments/gen-move-meta.mjs <dir with node_modules/pokemon-showdown>/ <dir with
   @smogon/calc + @pkmn/dex>/`. Then gen-info-text: `PSDIR=<folder of the 5 files from raw.githubusercontent.com/smogon/pokemon-showdown/<SHA>/,
   '/' as '_'> node experiments/gen-info-text.mjs`. The files are data/text/moves.ts, abilities.ts, items.ts, data/moves.ts and
   data/mods/champions/moves.ts. Put SPECIES_WT's Meowstic-F back after Meowstic (see note).
4. `node experiments/apply-dec2-patch.mjs` (dry run): the generated-file edits should now say "already done". Then `--write` for
   LEARN / ABIL / infosheet / run.mjs (and anything Showdown still lacks).
5. If Showdown added a Reg M-D format, run md-roster-step (`--format gen9championsvgc2026regmd --reg M-D --write`). Its step 8
   re-applies the patch.
6. Tests: fields-audit (must pass now), speed-check, calc-check 2000, mega-calc-crosscheck, rules-fixes-test, legality-check,
   md-roster-step-test, apply-dec2-patch-test, `node app/build.mjs && node app/test/run.mjs`. Then the usual GitHub batch +
   merge-check.
7. **origin/main's test.yml** (main only with Sim's go) has the same install line three times: **:44, :142, :173**
   (`npm install --no-save --no-package-lock playwright@1.49.1 @smogon/calc@0.12.0 @pkmn/dex@0.10.11 github:smogon/pokemon-showdown#1242c1e2d9763ba5b85d33f13aecb89bae19ae3d`).
   Each is followed by `cd node_modules/pokemon-showdown && node build` (:46, :143, :174). Change the SHA in all three, in the same
   main commit as the data that needs it (checked with `git grep -n 1242c1e origin/main -- .github`: exactly those 3 lines; main has
   no package.json at all: `git show origin/main:package.json` -> "exists on disk, but not in 'origin/main'").

## Not checked
- GitHub run (pushed with [skip ci]).
- v2-minors / v2-saved on the bumped tree. They don't read Showdown, and the built page differs only in a comment line, which build
  strips, plus SPECIES_WT, which I kept as committed.

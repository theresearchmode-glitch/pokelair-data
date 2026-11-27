# GG-1: experiments/apply-dec2-patch.mjs (Dec 2 balance patch script)

HH's helper, Thu Nov 26, 10:58 PM (clock: docs/rebuild/now.sh). Branch alt/helper-dec2patch from origin/claude/design6 23520831.
Not merged; nothing applied to the real data. The script refuses to write before 2026-12-02T02:00Z unless --force.

What I'd need to know that you haven't told me:
- Ability wording is mine, built from the official sentences (below). Sim/HH may want other words; the tests only need
  "Fire Boost" + "Mega Evolves" (rules-fixes-test check 5) and "substitutes".
- Castform-Sunny / -Rainy / -Snowy get Psych Up too (LEARN-only battle forms with Castform's exact list). Not in the map; my reading
  (Kip's job 49 did the same). Say if you want them left out.

## Sources
- Official notes: docs/rebuild/test-runs/patch-dec2-official-877.html (news 877), read as text.
- Map: patch-dec2-map.md, patch-dec2-psychup.md; Maggi's audit (origin/alt/maggi-m4-patchmap, maggi-M4-patchmap.md).
- Earlier versions read, not merged: origin/alt/patch-dec2 (HH, Nov 25) and origin/alt/gemini-patch-dec2 (Kip job 49).

## Files
| File | What |
|---|---|
| experiments/apply-dec2-patch.mjs (new) | The script. Header holds the table: every change and the official line it comes from. |
| experiments/apply-dec2-patch-test.mjs (new) | Its test, on scratch copies in the OS temp folder. 29 checks, under 1 s. |
| experiments/md-roster-step.mjs (step 8, about :197-212) | Now calls it with `--write --root <root>` (`--force` when md-roster-step gets `--force-patch`). Exit 3 (too early) means "NOT applied" plus the command to run later, not a failure. Before this change it ran the script with no arguments, which is a dry run now. |
| .github/workflows/test.yml (:5 paths, :161-164) | New step `node experiments/apply-dec2-patch-test.mjs` right after rules-fixes-test, same `if: ${{ !cancelled() }}`. Both new files added to the push paths. |

## What --write changes (6 files)
1. data.js LEARN: 47 pairings. Psych Up x33 (the 22 official + 8 Megas + 3 Castform forms), Slack Off Emboar(+Mega),
   Roost Beedrill(+Mega) and Hydreigon, Tailwind Emolga, Wonder Room Umbreon, Play Rough on the 7 Eeveelutions. The move index
   comes from the move's NAME in MOVES, because gen-roster renumbers MOVES. If a regenerated MOVES has lost a row, it is added
   at the end.
2. data.js ABIL: Flash Fire becomes "Fire immunity: when hit by a Fire move, this Pokemon gains Fire Boost (its Fire attacks do 1.5×
   damage). Fire Boost persists even if it Mega Evolves." Stalwart becomes "This Pokemon's moves cannot be redirected to a different
   target by any effect, and they ignore the effects of targets' substitutes."
3. info-text.js (generated): Rock Slide 20% flinch, plus the same two Ability sentences (written "Pokémon").
4. move-acc.js (generated): Rock Slide 95. Screech, Steel Wing, Metal Sound and Frost Breath come out of the list (100 = not listed).
5. move-meta.js (generated): Rock Slide `a` 95 and flinch `[[20,0,0,1]]`. The other four lose `"a"`.
6. infosheet.js IS_LEAD Rock Slide: 30% -> 20%. run.mjs Hustle check: `r.hustle === 72` -> `76`.
MOVES rows: no change.
The calc does not model Flash Fire's boost or Substitute (map: "Rules the code does not model"), so no change there.
Generated files carry a note line after their header when patched.

## Checks (all run by me in my worktree; out/ = frozen 0c992f69, restored after)
| Command | Result line | Meaning |
|---|---|---|
| `node experiments/apply-dec2-patch-test.mjs` | `apply-dec2-patch-test: ALL 29 PASSED` | dry run writes nothing; --write at 01:59:59Z refused (exit 3); a changed Stalwart text stops it (exit 1) with nothing written; at 02:00Z every change lands and only those; second run byte-identical; renumbered/lost MOVES handled; rules-fixes guard (below) |
| same test, script missing Annihilape | `apply-dec2-patch-test: 1 FAILED (28 passed)` (`added 46`) | the test catches a wrong Pokémon list |
| same test, script writing Rock Slide 96 | `2 FAILED (27 passed)` | the test catches a wrong number |
| unpatched + fake clock Dec 3: `FAKE_NOW=2026-12-03T12:00:00Z node --import file://<fake-clock.mjs> experiments/rules-fixes-test.mjs --src` | `FAIL  5. data.js ABIL ... — Flash Fire text: This Pokemon's Fire attacks do 1.5× damage if hit by one Fire move; Fire immunity.` / `13/14 passed` | **failing first**: after Dec 2, without the patch, the guard fails |
| same, patched tree | `14/14 passed (source vm)` exit 0 | with the patch, it passes |
| unpatched, real clock: `node experiments/rules-fixes-test.mjs` / `--src` | `14/14 passed (dist/page.html)` / `14/14 passed (source vm)` | passes before Dec 2 |
| unpatched: `node app/build.mjs && node app/test/run.mjs` | `ALL PASSED` (Hustle line: `Rock Slide 72`) | passes before Dec 2 |
| unpatched: `node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node experiments/unrated-test.mjs` | `v2 guard: clean`, `unrated test: all passed` | passes before Dec 2 |
| patched (`--write --force`): run.mjs / rules-fixes-test / unrated-test | `ALL PASSED` (`Rock Slide 76`) / `14/14 passed (dist/page.html)` / `unrated test: all passed` | the patched tree passes too |
| `node experiments/legality-check.mjs`, unpatched and patched | exit 0 both, output identical | new pairings don't break legality |
| `node experiments/fields-audit.mjs` patched | exit 1: `acc differs from the reference: Rock Slide 90 (ours 95/95); Steel Wing 90 (ours 100/100); Screech 85 ...; Metal Sound 85 ...; Frost Breath 90 ...` (unpatched: exit 0) | **expected**: Showdown at 1242c1e doesn't have the patch. It turns green only when the pin moves to a Showdown commit that has it (GG-2), or with an exception like the one on alt/patch-dec2 |
| `node experiments/md-roster-step.mjs --write` (pinned Showdown) | `8. apply-dec2-patch.mjs: NOT applied, it is before the patch time ...`, exit 0 | the too-early case doesn't break the roster step |
| `node experiments/md-roster-step.mjs --write --force-patch`, run twice (2nd on the patched tree) | `8. apply-dec2-patch.mjs: re-applied cleanly`; `sha256sum -c` all 6 files `OK` vs the direct --write | regenerating data.js wipes the patch (checked: data.js regenerated at the pin has no Psych Up for Alakazam), and step 8 puts back byte-identical files |
| `node experiments/md-roster-step-test.mjs` | `md-roster-step-test: ALL PASSED` | my step 8 change doesn't break its test (that test doesn't copy the patch script, so step 8 is skipped there) |
| `node experiments/syntax-check.mjs` | `syntax-check: all 427 scripts parse` | |
Note: md-roster-step --write also rewrites roster.json (step 2, one line). That was already so, not from this change; I reverted it.

## Dec 2 night use
1. After 02:00Z: `node experiments/apply-dec2-patch.mjs` (dry run, read it), then `--write`, then the tests.
2. If md-roster-step regenerates data.js after that, step 8 re-applies the patch by itself.
3. The fields-audit result depends on GG-2. If the new Showdown commit has the patch, regenerate move-acc / move-meta / info-text
   first. Those edits then show "already done". If its Ability text has different words, the script accepts any Flash Fire text with
   "Mega Evol" and any Stalwart text with "substitute".

## Not checked
- GitHub run (pushed with [skip ci], as asked).
- Full v2 suites (v2-minors, v2-saved) and calc-check on the patched tree. They aren't in the map's "must change" list.

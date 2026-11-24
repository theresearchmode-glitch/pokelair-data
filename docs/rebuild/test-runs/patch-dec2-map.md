# Dec 2 balance patch: everything in our code and data it touches (report only, Nov 24)

Source of the patch list: CLAUDE.md "Balance patch on Wed Dec 2, 2026" (official notes: news.pokemon-home.com/en/page/877.html,
not re-read here). Searched at claude/design6 33ec968b: app/src, app/test, experiments, out/. Every line below is **checked**
(grep plus reading the line) unless marked otherwise. Nothing changed.

## Generated files (change by re-running the generator, never by hand)
| File | What it holds today | Patch change | Generator |
|---|---|---|---|
| app/src/data/move-acc.js (MOVE_ACC) | `"Rock Slide":90`, `"Steel Wing":90`, `"Frost Breath":90`, `"Screech":85`, `"Metal Sound":85` | Rock Slide 95; Steel Wing, Frost Breath, Screech, Metal Sound reach 100, so they **drop out** of the list (it only lists moves under 100) | experiments/gen-move-meta.mjs |
| app/src/data/move-meta.js (MOVE_META) | `"Rock Slide":{"t":"allAdjacentFoes","a":90,"s":[[30,0,0,1]],"sf":1}`; the other four carry `"a"` too | Rock Slide `a:95`, flinch `s:[[20,0,0,1]]`; the others lose `a` | same script |
| app/src/data/info-text.js (INFO_TEXT) | `"Rock Slide":["30% chance to make the foe(s) flinch.",12]`; Flash Fire "…1.5× damage if hit by one Fire move…"; Stalwart "…cannot be redirected…" | Rock Slide 20%; Stalwart adds "ignores Substitute"; Flash Fire: "keeps the boost after Mega Evolution", only if Showdown's text gets it | experiments/gen-info-text.mjs (our own wording goes in its OVR table) |

Both generators read Pokémon Showdown's champions mod **pinned at commit 1242c1e** (gen-move-meta.mjs lines 2-4). On Dec 2 they
need a Showdown commit that has the patch, and the pin in both file headers moves to that commit. The default source path in
gen-move-meta.mjs is `C:/Users/simra/code/pl-mech/sim`, so the scripts run on Sim's PC or with the path passed as an argument.

## Hand-written (edit by hand)
| File:line | Today | Change |
|---|---|---|
| app/src/data/data.js LEARN (learnsets, as indexes into MOVES) | none of the new pairings: Emolga Tailwind, Hydreigon Roost, Beedrill Roost, Emboar Slack Off, Umbreon Wonder Room, Play Rough on Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon (checked: all false). Sylveon already has Play Rough. | Add each pairing. Psych Up goes to 22 Pokémon: **the list is not in the repo** (CLAUDE.md says only "x22"), so it must come from the official notes. Not checked. |
| app/src/data/data.js MOVES | all the moves already exist as rows (Psych Up, Slack Off, Wonder Room, Roost, Tailwind, Play Rough) | no change (rows hold type, category, power; no accuracy) |
| app/src/v2/pages/infosheet.js:15 | Rock Slide: `'Hits both foes. Each one hit has a 30% chance to flinch.'` | 20% |
| app/src/v2/pages/infosheet.js:13 | Rock Slide notes (spread 0.75×, Wide Guard…); no number | no change |

Per docs/rebuild/research/regmd-readiness-nov17.md line 68 and docs/reg-md-plan.md line 19, data.js (ROSTER, ABIL, MOVES, LEARN)
is "hand-built in October, no generator". Checked in those docs, not by tracing code.

## Rules the code does not model (no code change; say so on the site if it matters)
- **Flash Fire through Mega Evolution:** the calc treats Flash Fire only as a Fire immunity (39-damage-calc-speed.js:141,
  engine/types.js:12, 46-battle-data.js:23, 55-threats.js:310). Its 1.5× boost isn't modelled at all, so nothing changes.
- **Stalwart ignores Substitute:** nothing models Substitute (the only mention is infosheet.js:26, sound moves). The Stalwart
  code (55-threats.js:226, 40-turn-one-data.js:205) is about redirection, which is unchanged.
- **Accuracy in the calc** comes only from MOVE_ACC (39-damage-calc-speed.js:540-541), so regenerating covers it.
- **Rock Slide's flinch** isn't shown as a number anywhere in the calc; King's Rock only checks whether a move has its own flinch
  (39-damage-calc-speed.js:430), which stays true at 20%.

## Tests that must change
- **app/test/run.mjs:144/147:** `hustle: T.moveAcc(M('Rock Slide'), 'Hustle', …)` expects **72** (90 × 0.8). After the patch it
  is 76 (95 × 0.8). The expected number must change with the data, or the check should read Rock Slide's accuracy from MOVE_ACC.
- Should keep passing, checked by reading only: calc-check.mjs:102 (Frost Breath in the always-crit list, unchanged),
  stress-checks.mjs (Rock Slide only as a set member), v2-t1rules.mjs:132 (Stalwart redirection), sheet-tabs.mjs:79 (Flash Fire
  as an immunity note), behaviour A-team/B-build and v2-saved (Rock Slide only in sets).
- **experiments/legality-check.mjs** reads LEARN, so it will see the new pairings once they're added. Its expectations weren't
  read here (not checked).
- Not found: no threat-check, calc-check or golden expectation that depends on these accuracies or the flinch chance
  (searched by move name). Golden files that store whole calc outputs could still shift if a regenerated MOVE_META changes another
  field. Not checked.

## Also on Dec 2 (from CLAUDE.md, not code)
Run legality-check and calc-check, and add a site note that ratings and sets come from games played before the patch.

# Rule holes: every team rule run on today's real teams (Nov 18)

Look-only research. No site code changed. Code: origin/main at a5701f5e ("Suggestions never bring in a second terrain"), with the data in out/ from Nov 18.

## How this was checked

- **Harness.** The built page (`node app/build.mjs`) loaded the way experiments/suggest-audit.mjs loads it: the `window.__ev` hook, a stubbed `claude.use('db')` that serves out/*.json, `S.box=[]`, `ui.pool='all'`, one Mega.
  - Each team was put in `S.slots` the way the site does it. Name-only teams use the slot shape Top teams uses. Real sheets use the slot shape `loadSheet` uses (49-events.js:58), so real items, Abilities and moves count.
  - For each team the harness recorded: every `gamePlan` row, `teamFlaws`, `proChecks` (4 basics and 3 notes), `teamBasicsOf` (the model's team-wide basics), `structCredit`, `itemProblems`, `LANE.protFix`, `prepOf` (Matchups: threats at "No answer"), `CH.gradeOf` (Strength Score), `teamArchetype` and `teamRoles`.
  - Suggestions: `planFixes(ms, suggestPool(), true)`, then `CH.sugs()`, then the first 3 of `ui.planList`. That is exactly what My Team shows (same steps as suggest-audit.mjs).
  - Harness: scratchpad `rh/run.mjs`, `rh/inpage.js`, `rh/analyze.mjs`, `rh/styles.js`. Not committed.
- **Teams (1,554 runs, 0 errors):**
  - 300 most-run tournament sixes (`results.records`, sorted by team count).
  - 159 more `results.proven` sixes with 20+ games.
  - 1,023 top-8 sheets from out/events.json.
  - 72 top-8 sheets from out/official.json.
  - In all, 128 event-winner sheets. Some official events are in both files, so a few winners count twice.
- **"Good team"** means a record of 55%+ wins, or a top-8 finish. Every sheet is a top-8 finish, so every sheet counts as good.
- **Sealed set: not touched.** No game was scored for accuracy, and nothing ran with --sealed. Win rates quoted below are the records the site already shows. They are read here, not used to test any rule.
- **What this can't detect:** whether a flag is *right* in real games. Testing that needs a real-wins test on games before Nov 9. This file finds where a rule contradicts a team that real players run and win with, plus the code line that causes it.

## Ranked holes

Sorted by how many real good teams are hit, how visible it is (flaws, suggestions, Build for Me) and how wrong the advice is.

### 1. Sun + rain (double weather) reads as "no speed control", and suggestions "add speed control" by deleting a setter
- **What happens:** 104 real teams set two weathers: 12 event winners and 19 of the 300 most-run teams.
  - Examples: #4 (240 teams, 53.7% of 1,367 games): Archaludon, Charizard-Mega-Y, Garchomp-Mega-Z, Grimmsnarl, Pelipper, Venusaur. Also #28 (56.1% of 405) and #19 (53.1% of 577).
  - 27 of these teams get Speed control "miss" (15 in the top 300), even though Chlorophyll Venusaur and Swift Swim Swampert are their speed mode.
  - 62 suggestions that say "Adds speed control" really swap out a weather setter. On #4, Suggestion 1 is Pelipper > Milotic, explained as "Adds speed control".
  - Build for Me can never make a double-weather team.
- **Cause:**
  - 11-game-plan.js:83: `wSpeed = kinds.length === 1 ? ... : 0`, so weather speed counts as zero once two weathers are set.
  - 29-fix-planner.js:254: the forced "fix speed control" plan.
  - 22-auto-build.js:225 and :228: `wxConflict(r.t)` throws out every team with two weathers.
  - The weather-row comment (11-game-plan.js:113) says double weather wins 48.8% vs 54.5%. Today's #4, #19 and #28 are all above the 51.1% base, so that figure looks stale. Unsure; it needs a re-measure.
- **Sure?** Checked: harness output plus reading the code.
- **Fix:** count weather speed for each Swift Swim / Chlorophyll / Sand Rush / Slush Rush member whose weather the team sets, even when it also sets a second weather (maybe at a reduced weight, because the weathers overwrite each other). Let Build for Me allow sun + rain when the team has users for both. Re-measure the 48.8% claim on pre-Nov 9 games.
  - Risk: low for the speed row; medium for Build for Me.
  - Grade: no change. `noSpeed` has no weight in today's model.team, which holds only noMega and protectLow. It does change `structCredit` (Test run / winVs) and the suggestions.

### 2. Choice Scarf on a team that also has Trick Room fails "Items work", and the suggestions chase it
- **What happens:** 32 real top-8 sheets, 6 of them event winners, show an ✗ on "Items work". That includes the 2027 Louisville Regional winner (1,013 players): Farigiraf (Trick Room), Incineroar, Charizard-Mega-Y, Sylveon, Venusaur, Scarf Garchomp. Its Strength Score is 88.3.
  - Garchomp is swapped out in 2 of its 3 suggestions (Garchomp > Kingambit, then Garchomp > Sneasler).
  - This team's main speed mode is sun with Chlorophyll. Trick Room is its second mode.
- **Cause:**
  - 54-items.js:29: `trMain` only treats a team as not-Trick-Room when it has Tailwind. It ignores weather speed and Scarf modes.
  - 54-items.js:38: the scarftr item problem.
  - 06-helpers.js:123: it becomes a failed check that counts in "X of N checks".
  - 29-fix-planner.js:211 ranks item fixes first, and :285 forces one plan to fix it.
  - This contradicts 36-lanes.js (header), which measured Choice Scarf on a Trick Room team as no measurable harm (+0.9, range −0.9 to +2.7). structCredit already exempts it too (35-win-model.js:79).
- **Sure?** Checked: harness output plus reading the code.
- **Fix:** make scarftr a note (shown, not counted, not pushed by the planner), or at least exempt teams with any second speed mode. Risk: low. Grade: none for full teams. The old v1 grade, used for part-teams or when the model isn't loaded, counts it through `illegal`/`miss`. Unsure where that path still shows.

### 3. Perish Trap: the Perish Song Politoed is "a weather nothing uses", the team "lacks speed control", and Matchups can't see the trap
- **What happens:** 79 real teams have Perish Song plus Shadow Tag: 5 event winners and 25 of the 300 most-run teams.
  - Top-300 #202 (59.4% of 46 games): Gengar-Mega, Incineroar, Kingambit, Kommo-o, Politoed, Rillaboom.
    - Weather row: "Nothing else on the team uses the rain, and it weakens Incineroar's Fire moves". That is the flaw "weather nobody uses".
    - All 3 suggestions swap Politoed out: Politoed+Rillaboom > Primarina+Whimsicott, Politoed+Kingambit > Farigiraf+Archaludon, Politoed > Basculegion.
  - The same team as a real sheet (Talon's Fight Club #110, 2nd) is flagged the same way.
  - 34 Perish teams (4 of them winners: Battle Cruise VGC, 3V3 Arena, Glory of Champions #2, Pado's Dojo #5) get Speed control "miss". 64 of the 79 are given a forced speed-control suggestion.
  - Matchups: Perish teams average 2.9 threats at "No answer", against 0.9 for all teams. "Ready for the top threats" fails on 47 of 79. Average Strength Score 81.0, against 83.9 for all teams.
  - Build for Me can never make one: teamFlaws and `wxIdle` rule it out, and so does the gate `wxLoneBad`, which also means Politoed can never be suggested to a Gengar team.
- **Cause:**
  - 11-game-plan.js:123: `lone = !others0.length && !sandChip && setters.every(x => WX_PARTNER.has(...))` looks only at teammates that use the weather. The setter's own job (Perish Song, Encore, Yawn) and the team's archetype are never read.
  - 11-game-plan.js:93: the speed options have no "trap" mode.
  - Perish Song shows up only in 18-archetypes.js (the label "Perish Trap" is shown!), 13-rating.js and 55-threats.js SUPPORT. No game-plan, flaw or planner rule reads it.
  - 55-threats.js: Matchups are damage calcs only.
- **Sure?** Checked for the flags and suggestions. My guess, not yet tested: that Matchups really misjudge these teams. Perish teams' own records are mixed (#18: 50.0% of 575).
- **Fix:** (a) `lone=false` when `teamArchetype(ms).perish` is true, or when the setter runs Perish Song with a trapper on the team. Risk low, grade none. (b) Have the speed row and the forced speed plan accept a Perish Trap mode. Risk low, grade none. (c) Matchups: give Shadow Tag + Perish Song a trap verdict. Medium risk; changes the grade through readiness (CH.MU_K), so it needs the real-wins test.

### 4. Weather override setters (Hippowdon, Kanto Ninetales) flagged "weather nobody uses"
- **What happens:** 7 flagged teams, all good: #202 above, plus 4 Gengar-Mega / Hippowdon (Yawn) top-8 sheets and 1 Indeedee-F / Gardevoir-Mega / Ninetales top-8 sheet.
  - The setter is there to override the opponent's weather (and for Yawn or Will-O-Wisp).
  - Every suggestion removes Hippowdon (6 plans) or Ninetales.
- **Cause:** same line as #3 (11-game-plan.js:123). Also 29-fix-planner.js:111 (flaw), :125 (`wxLoneBad`) and 22-auto-build.js:225 (`wxIdle`).
  - Note: suggest-audit.mjs asserts that none of the 300 most-run teams is called a weather nobody uses. On today's data #202 is called that. CI runs on frozen Nov 9 data, so it can't see this. I did not run suggest-audit itself on today's data, so its result is unsure.
- **Sure?** Checked.
- **Fix:** treat "the team needs a weather override" as a use. Simplest version: a support setter is not lone when it has a non-attacking support move (Perish Song, Yawn, Encore, Will-O-Wisp, Tailwind, Wide Guard, Helping Hand) on a team that sets no other weather.
  - Risk: low. It weakens the Nov 7 rule (a bare Pelipper next to Fire attackers), so keep that case flagged when the setter's set is plain attacks only.
  - Grade: none.

### 5. Trick Room on a fast team (Imprison + Trick Room, or Tailwind + reverse Trick Room) is the flaw "Trick Room with no slow attacker"
- **What happens:** 124 real teams: 5 winners, 39 of the 300 most-run teams.
  - Examples: #44 (59.0% of 216) and #61 (61.2% of 183), Charizard-Mega-Y / Garchomp / Glimmora / Indeedee / Whimsicott; #32 (56.5% of 363).
  - Of the 124, 42 run Imprison + Trick Room on the same Indeedee. That is an anti-Trick-Room set: it blocks the opponent's room. Another 69 also have Tailwind.
  - Build for Me refuses these teams. The planner adds an 18-point game-plan penalty. Indeedee is swapped out in 41 plans on Imprison teams.
- **Cause:**
  - 11-game-plan.js:108: the `trfit` row appears whenever `c.tr >= .4`.
  - 29-fix-planner.js:113: `row('trfit').st==='miss'` becomes a flaw.
  - 55-threats.js:204 already knows "Imprison stops its Trick Room". structCredit already exempts teams with Tailwind (35-win-model.js:72-73, `!tp.tw`), so the rules disagree with each other.
- **Sure?** Checked.
- **Fix:** no `trfit` row and no flaw when the Trick Room user also has Imprison, or when the team has a working Tailwind or weather-speed mode (the room is a second or anti mode). Risk: low. Grade: none (trNoSlow has no model weight).

### 6. Two terrains on a real team is a flaw, and Build for Me refuses it
- **What happens:** 18 real teams, 14 good. Example #68 (55.7% of 160 games): Dragonite-Mega, Kingambit, Primarina, Raichu-Mega-X (Electric Surge), Rillaboom (Grassy Surge), Sneasler.
  - Suggestions swap Rillaboom out 29 times.
- **Cause:** 29-fix-planner.js:111 (`'two terrains'` in teamFlaws). Today's commit was right to stop suggestions *adding* a second terrain. But calling a team that already runs two a flaw goes further than the evidence. Terrain roles were measured as adding nothing beyond the grade (29-fix-planner.js:126-127 comment, Nov 9).
- **Sure?** Checked for the flag. Unsure whether two terrains actually hurts.
- **Fix:** keep the "never add a second terrain" gate (`terrain2`). Drop the flaw for teams that already have two, or exempt pairs real players run (same idea as `provenPair`). Risk: low. Grade: none.

### 7. "Psychic Terrain blocks its own priority" flags real Indeedee teams
- **What happens:** 70 real teams, 43 good, 0 winners; 31 of the top 300. Example #33 (57.1% of 336): Charizard-Mega-Y, Indeedee, Kingambit, Kommo-o, Meowstic-F-Mega, Sneasler.
- **Cause:** 29-fix-planner.js:104 `psyBlocked` counts every teammate with any priority move or Fake Out. Psychic Terrain only blocks priority into grounded targets, and players plan around it. The `provenPair` exception needs 100+ teams per pair.
- **Sure?** Checked for the flag. Unsure whether the flag is wrong on average: the records of the flagged top-300 teams are mixed (37% to 57%).
- **Fix:** keep it as a note, not a flaw (Build for Me −30 and refusal). Or lower the provenPair threshold. Needs a real-wins test before calling it either way. Grade: none.

### 8. "Its weather weakens its own attacker" flags sun teams with a support Milotic
- **What happens:** 36 real teams, 27 good, 2 winners. One winning sheet: Charizard-Mega-Y, Milotic (Competitive, Haze / Muddy Water / Ice Beam), Rillaboom, Aerodactyl, Drampa-Mega, Farigiraf.
  - Top 300: #224 (59.4%) and #96 (54.3%).
  - Build for Me refuses these teams. Milotic is swapped out in 16 plans.
- **Cause:** 29-fix-planner.js:107 `wxHurtT` goes by type (Water in sun), not by whether the Pokémon's job depends on Water moves. Only Intimidate and Fake Out users are exempt.
- **Sure?** Checked for the flag. Unsure about the harm.
- **Fix:** count only members whose strongest attacks are of the weakened type and who have no support role (Competitive, Haze, Follow Me, screens...). Risk: low. Grade: none.

### 9. A terrain setter is swapped out while a teammate's move needs that terrain, and the card doesn't say so
- **What happens:** 71 suggestions, 50 of them on good teams. Example #33: Indeedee > Incineroar + Farigiraf, explained as "Adds speed control; Slow attacker for your Trick Room". Meowstic-F-Mega's Expanding Force stays and loses its terrain.
  - The same happens with Gardevoir-Mega Expanding Force teams (#64, #82, #102).
- **Cause:** 29-fix-planner.js:128 `GUARD_KEYS=['speed','trfit','weather']`. Terrain was dropped on Nov 9 after a measurement: terrain roles +0.3 points, within chance. `gapEffect` and LANE never mention what is lost.
- **Sure?** Checked.
- **Fix:** this is a design question for Sim. Either guard terrain only when a teammate runs a terrain-dependent move (Expanding Force, Grassy Glide, Rising Voltage), or keep the swap but write the loss on the card ("Meowstic's Expanding Force loses Psychic Terrain"). Risk: low. Grade: none.

### 10. "Speed control" means three different things in three places
- **What happens:** the same team can pass in one place and fail in another.
  - gamePlan / team-check note / structCredit: Tailwind, Trick Room (with 2+ slow), weather speed (one weather only), or a pile of priority at half weight. Icy Wind / Electroweb / Thunder Wave count only as backup.
  - Model basics `noSpeed` (35-win-model.js:51): Tailwind, Trick Room, Icy Wind, Electroweb, or a Choice Scarf. Weather speed is missing, and so are Thunder Wave and Perish Trap.
  - gamePlan's "Answer to their speed control" (11-game-plan.js:17, `anti`) counts any Imprison, even without Trick Room or Tailwind to imprison.
- **Cause:** separate lists in 11-game-plan.js:7-19 and 35-win-model.js:51.
- **Sure?** Checked by reading the code.
- **Effect:** today `noSpeed` has no weight (model.team = {noMega, protectLow}). If a refit picks it up, Swift Swim / Chlorophyll teams would be charged for "no speed control".
- **Fix:** one shared `speedModes(team)` used by all three. Risk: low now. Grade: only if a future model gives noSpeed a weight, and then it needs the real-wins test.

### 11. Smaller ones
- **Hospitality (1.77% of real slots) and Poison Touch (1.41%)** are read only by the per-Pokémon rating bonus table (13-rating.js:14). No calc, game-plan or planner rule reads them. fields-audit.mjs passes them only because the name appears somewhere in the engine.
  - Sinistcha (Hospitality) is the most-swapped Pokémon on redirection teams (182 plans).
  - Checked. Fix: list them as deliberately not modelled, or model the heal. Grade: none.
- **fields-audit.mjs fails on main today:** "Symbiosis (0.17% of slots)". Checked by running it.
- **Weather-dependent move notes** (Hurricane / Thunder / Solar Beam outside their weather) also read sun + rain teams correctly. OK.
- **Ally Switch, Beat Up + Rage Fist / Justified, Skill Swap, Instruct, Friend Guard:** no team rule reads them.
  - Beat Up: Annihilape swapped out in 4 plans on its 3 teams.
  - Maushold (Friend Guard) swapped out in 8 plans on 4 teams.
  - Too few teams to tell whether this matters: unknown.

## Style catalogue

Verdicts: **OK** = no rule mislabels the style and suggestions keep the combo; **HOLE** = a rule mislabels it or the suggestions break it (cause given); **UNKNOWN** = too few real teams, or not modelled with no evidence either way.

Counts are over the 1,554 runs: teams / good / event winners.

| Style | Real teams (example) | What the rules say | What suggestions do | Verdict |
|---|---|---|---|---|
| Perish Trap (Perish Song + Shadow Tag) | 79 / 56 / 5. #202 Gengar-Mega Politoed (59.4%); Battle Cruise VGC winner | Politoed = weather nobody uses (flaw); speed miss on 34; ready-for-threats fails 47/79 | Politoed out in all 3 on #202; forced speed plan on 64/79 | **HOLE** (#3: 11-game-plan.js:123, :90; 55-threats.js) |
| Trick Room, 2+ slow | 239 / 198 / 23. #15 Aerodactyl-Mega Charizard-Mega-Y Farigiraf (59.2% of 698) | Mostly fine; scarftr on 21 | Swap Sylveon / Incineroar / Sinistcha; TR kept except 10 plans | OK, apart from #2 |
| Trick Room on a fast team / Imprison + TR | 238 / 180 / 10. #44, #61, #32 | Flaw "TR with no slow attacker" on 124 | Indeedee out 40+ | **HOLE** (#5: 29-fix-planner.js:113) |
| Tailwind | 776 / 656 / 77. #11 (56.6% of 828) | No Tailwind-specific mislabel; flags come from other styles | Tailwind lost in 150 plans (most teams have a second setter or gain one) | OK |
| Weather override (lone setter) | 7 / 7 / 0. #202; Gengar + Hippowdon sheets | Weather nobody uses (flaw) | Setter out every time | **HOLE** (#4: 11-game-plan.js:123) |
| Double weather / weather wars | 104 / 91 / 12. #4 (240 teams), #28 (56.1%) | Weather "part"; speed miss on 27 (weather speed zeroed) | 62 "Adds speed control" plans delete a setter; Build for Me refuses | **HOLE** (#1: 11-game-plan.js:83; 22-auto-build.js:225) |
| Follow Me / Rage Powder | 386 / 315 / 32. #7 (59.1% of 1,149) | Counts as lead support; fine | Sinistcha out often (Hospitality not modelled) | OK (see #11) |
| Ally Switch | 3 / 2 / 0 | Not read by any team rule | Removed in 1 plan | UNKNOWN |
| Fake Out + Parting Shot | 523 / 422 / 42 | Counted (Fake Out, pivot) | Incineroar is a staple; `keepOK` limits staple swaps | OK |
| Beat Up + Justified / Rage Fist | 3 / 3 / 0 | Not read by team rules (calc has Beat Up power) | Annihilape out in 4 plans | UNKNOWN |
| Fling / Trick item combos | 27 / 21 / 4 | No mislabel tied to Trick (Fling power is modelled) | Rotom-Heat out in 6 | OK (combo not modelled) |
| Helping Hand | 488 / 381 / 32 | Rating and calc only; no mislabel | Users swapped like any member | OK |
| Wide Guard | 308 / 244 / 25 | No mislabel | Same | OK |
| Imprison | 60 / 48 / 3. #32 | Imprison + TR read as a TR team with no slow attackers; any Imprison counts as an answer to speed control | Indeedee out 41 | **HOLE** (#5, #10) |
| Terrain + Surge abuser (Grassy Glide, Expanding Force...) | 796 / 630 / 52. #16 (59.2% of 678) | Terrain row fine | Setter out while the abuser stays: 71 plans, 50 on good teams, loss never said | **HOLE** (#9: 29-fix-planner.js:128) |
| Two terrains | 18 / 14 / 0. #68 (55.7%) | Flaw "two terrains" | Rillaboom out 29 | **HOLE** (#6: 29-fix-planner.js:111) |
| Psychic Terrain + priority users | 70 / 43 / 0. #33 (57.1%) | Flaw | Indeedee-F out 51, Sneasler 43 | **HOLE** (#7: 29-fix-planner.js:104) |
| Own weather vs a type it weakens (sun + Milotic) | 36 / 27 / 2. #224 (59.4%) | Flaw | Milotic out 16 | **HOLE** (#8: 29-fix-planner.js:107) |
| Choice Scarf on a TR team with another speed mode | 32 / 32 / 6. Louisville Regional winner | "Items work" ✗ | Scarf user out (Garchomp 43) | **HOLE** (#2: 54-items.js:29) |
| Skill Swap / Entrainment | 8 / 6 / 0. #42 (58.0%) | Not read | No break found | UNKNOWN |
| Commander-style pairs | Not in Champions (no Tatsugiri or Dondozo in ROSTER, checked) | n/a | n/a | n/a |
| Mega-less | 0 real teams in this set (every record and sheet has a Mega) | noMega −0.63 in the model (measured); LANE "Fix: adds a Mega" | n/a | UNKNOWN on real teams (measured rule, no real case here) |
| Screens | 208 / 166 / 22 | Fine | Grimmsnarl out mostly on double-weather teams (via #1) | OK |
| Sleep (Spore / Sleep Powder / Yawn) | 233 / 196 / 22 | Fine | No style-specific break | OK |
| Friend Guard | 4 / 4 / 0 | Calc only | Maushold out 8 | UNKNOWN |
| Quick Guard | 50 / 46 / 8 | Fine | Sinistcha out (Hospitality) | OK |
| Instruct / After You | 4 / 4 / 0 | Not read | Removed in 2 | UNKNOWN |
| Encore | 278 / 238 / 28 | Counted as an answer to speed control; fine | Whimsicott out where Tailwind is duplicated | OK |
| Coaching / Pollen Puff / Life Dew | 78 / 70 / 8 | Rating only | No break of note | OK |
| Hospitality (Sinistcha) | 149 / 132 / 16 | Not read (see #11) | Sinistcha out 182 | UNKNOWN |

**Counts per verdict:** HOLE 10 · OK 12 · UNKNOWN 8 · n/a 1 (Commander).

Rules that flagged real event winners (128 winner sheets):
- teamFlaws: 7.
- "Items work" ✗: 6, all scarftr.
- Speed control "miss": 6, of which 4 are Perish Trap.

## Rule inventory (what labels, penalises or suggests a change)

| Rule | File:line | What it does | Real teams flagged (all / good / winners) |
|---|---|---|---|
| gamePlan speed | 11-game-plan.js:92-99 | part / miss; penalty 55×(1−primary) | part 359 / 279 / 17; miss 98 / 77 / 6 |
| gamePlan backup speed | 11-game-plan.js:101-104 | miss: +10 | 224 / 181 / 11 |
| gamePlan Trick Room attackers (trfit) | 11-game-plan.js:108-110 | part +8, miss +18 | part 141; miss 124 / 87 / 5 |
| gamePlan weather (two weathers / lone / needs) | 11-game-plan.js:114-133 | part, lone, miss; ±penalties | lone 7 / 7 / 0; part 162 / 132 / 14; miss 1 |
| gamePlan weather-move notes | 11-game-plan.js:134-139 | Hurricane / Thunder / Solar Beam without weather | (folded into weather part) |
| gamePlan terrain (two, unused, dead seed) | 11-game-plan.js:140-154 | part / miss | part 18; miss 1 |
| gamePlan lead support / priority / anti | 11-game-plan.js:155-164 | rows plus small penalties | support miss 322 / 286 / 36 |
| teamFlaws (5 flaws) | 29-fix-planner.js:110-113 | Build for Me −30 each and refusal; never added by suggestions | 218 / 159 / 7 (TR no slow 124, Psychic Terrain 70, weather weakens 36, two terrains 18, weather nobody uses 7) |
| Suggestion gates `wxLoneBad`, `terrain2`, `psyHit`, `trNew`, `wxHurtIn` | 29-fix-planner.js:115-125 | block plans | (gate; no team flag) |
| `keepsPlan` and GUARD_KEYS (speed, trfit, weather) | 29-fix-planner.js:128, :205 | block plans that worsen these rows | (gate) |
| Forced plans: speed / gap / items / unmet check | 29-fix-planner.js:254, :266, :285, :287 | push a plan into the first 3 | speed-control plan on 64 of 79 Perish teams; 62 setter-deleting "speed" plans on double weather |
| `keepOK` (staples, item problems) | 29-fix-planner.js:181 | drop plans | (gate) |
| LANE fix / swap / option, protFix, "Nothing to fix" | 36-lanes.js:13-60 | labels and the Protect card | protFix 23; "Nothing to fix" 1,100 |
| Team checks: 4 basics (Mega, weak spot, spread-out weak spots, ready for threats) plus items | 06-helpers.js:105-126 | ✓ / ✗ | stack 200 / 154 / 14; w3 300 / 250 / 25; reach 262 / 211 / 18; mega 0; items 36 / 36 / 6 |
| Team notes (speed, spread, lead support) | 06-helpers.js:108-111 | i-notes | speed 457; spread 43; lead support 322 |
| Model team basics | 35-win-model.js:47-55 | noMega −0.626, protectLow −0.185 (others unweighted) | noMega 0; protectLow 82 / 71 / 4 |
| structCredit | 35-win-model.js:66-80 | cuts above-average edge in winVs / Test run (not the Strength Score, which uses x0) | 779 / 644 / 59 |
| Item problems (clause, dead, scarftr) | 54-items.js:29-54 | check ✗, planner priority | 36 (scarftr 32, clause 2, dead 2) |
| Matchups "No answer" | 55-threats.js (THR.teamReport) | readiness → Strength Score via CH.MU_K | average 0.9 per team; Perish 2.9 |
| Build for Me refusals | 22-auto-build.js:49, :222-228 | flaws, `wxConflict`, `wxUnmet`, `wxIdle`, speed miss | refuses every double-weather, two-terrain, Imprison-TR and Politoed Perish team |
| Archetype label | 18-archetypes.js:5-31 | label only (Perish Trap is recognised here) | n/a |

Not checked here: the Favoured / Even match / Unfavoured real-games words under each threat. Only the "No answer" level was read.

## Fields and Abilities the engine never reads (0.5%+ of 9,402 real slots)

Source: real top-8 sheets in out/events.json plus out/official.json. "Read" here means the name appears in engine code other than comments (scratchpad `rh/fields.mjs`). Attacking moves are read generically through MOVE_META, so only status moves are listed.

| Field | Share of slots | Read where | Listed as deliberately not modelled? | Verdict |
|---|---|---|---|---|
| Hospitality (Ability) | 1.77% | 13-rating.js bonus table only | No | Not modelled, not listed |
| Poison Touch (Ability) | 1.41% | 13-rating.js bonus table only | No | Not modelled, not listed |
| Cursed Body, Flame Body, Emergency Exit, Toxic Debris | 1.97 / 1.53 / 1.49 / 0.91% | nowhere | Yes (fields-audit NO_CALC_EFFECT) | OK |
| Roost (move) | 0.74% | nowhere | No | Not read (healing; affects nothing graded) |
| Clangorous Soul (move) | 0.61% | nowhere | No | Not read (boost not in calcs or game plan; other setup moves are in SETUP) |
| Hypnosis (move) | 0.64% | accuracy list only (02-set-data.js) | No | Not read as sleep (Spore / Sleep Powder / Yawn are) |
| Perish Song (move) | 1.23% | rating, archetype label, threats SUPPORT | n/a | Read, but not by gamePlan / flaws / planner (hole #3) |
| Symbiosis (Ability) | 0.17% (under 0.5%) | nowhere | No | fields-audit.mjs fails on it today (checked by running it) |

All items at 0.5%+ are read (calcs, item rules, or the Mega Stone by species name).

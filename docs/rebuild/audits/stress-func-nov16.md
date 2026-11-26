# Nuclear stress test, part 2: functions and edge cases (Nov 16, night)

Run by a helper agent on the Preview build at 390x844 (new visitor, a kid tapping everything, a power user). No run produced a page
or console error. Scripts and shots: scratchpad agents/stress/func/ (not kept in the repo).

## Confirmed bugs

| # | Bug | Status (Nov 16) |
|---|---|---|
| B1 | An Undo toast shown while a sheet is open sits under the dimmed backdrop (Your Games delete, Edit Set Remove), so Undo can't be tapped until the sheet closes | Not changed: the toast sits under an open sheet by Sim's Nov 11 rule (it must not cover the sheet's title). Question for Sim with pictures |
| B2 | Import with a repeated Pokémon drops the copies silently or blames "Only 6 fit" | Fixed (shared 19-showdown-paste.js): repeats are named ("One of each Pokémon per team: left out 5 more Incineroar"); six different Pokémon fill the team before anything is "over" (mixed paste 5 -> 6 imported). m-imp.cjs, 5 pastes |
| B3 | Undo on an old "Removed X" toast reverses a newer change (Apply) | Fixed (v2 bridge): when the Undo point changes, the older Undo toast goes. Reproduced before / gone after at 390x844; plain Remove + Undo still restores |
| B4 | "1 games logged" | Fixed: "1 game logged" (Battle and Your Games) |
| B5 | Damage Calc gives your own Mega Charizard Y Timid ("estimated spread") while My Team shows Modest | Open, for Sim: the calc's topNature() reads the default set source while topItem() and My Team read tournament sets; changing it moves damage numbers site-wide. Recommendation: your own Pokémon use the same tournament set as My Team (Sim's Nov 8 sets rule) |

## Odd but maybe OK (open, listed for Sim)
- Build's Load Team replaces an unsaved team in one tap (Undo toast shown); Home, Winning Teams and Events ask "Replace your current team?" first. KEPT: the test specs say so on purpose (AUTO-10, CORES-08 'no confirm'); for Sim beside Q10c.
- Deleting a saved team asks first but has no Undo after. OPEN (a new Undo path; for Sim).
- Edit Set changes (item, Ability, moves, nature, stat points) have no Undo. OPEN (a new Undo path; for Sim).
- Undo is one step only. OPEN (for Sim).
- With storage blocked, "Saved" is still shown and nothing survives a reload; no "can't save in this browser" note. FIXED (logged 3:30 AM): 'Saved "X" for this visit. This browser blocks saving, so it lasts until you close the page.' (and the sync lines).
- Pasting the same replay twice logs the game twice. FIXED (logged 3:31 AM): 'That replay is already logged.' (a fingerprint per replay).
- Import drops a wrong Ability silently (a bad item or move is listed). FIXED (logged 3:32 AM): listed like items and moves ('Levitate (Garchomp)').
- Save as New keeps the same name; the save sheet says "save this six" with five on the team. FIXED (logged 3:33 AM): 'Name (2)'; 'six' only with six on the team.
- Build around nonsense ("zzzz", emoji) runs a normal build without a word. FIXED (logged 3:33 AM): 'Built without "zzzz": pick a Pokémon from the list to build around it.'
- "Report a Mistake ›" not testable here (feedback service off in the Preview).
- Possible empty button names inside closed folds (not checked with a real screen reader). CHECKED (3:35 AM): 0 unnamed buttons, links or fold headers over 23 pages with every fold open (m-names.cjs).

## Worked (measured by the agent)
First visit, My Team add/remove/Undo, Edit Set validation, Saved Teams, Import edge cases, Copy for Showdown and Share as Image,
Build (all options, pools, Megas, Never Suggest), rapid taps, Battle logging and replays, Meta filters and search, Pokémon page
names, Damage Calc edge Pokémon (no NaN), navigation and Back/Forward, damaged storage, offline (no outside requests).

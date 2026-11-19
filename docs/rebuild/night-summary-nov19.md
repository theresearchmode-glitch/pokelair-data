# Night of Nov 18 → 19: summary for Sim (draft, kept current through the night)

Every time here comes from the clock. "Checked" names how; anything not checked says so.

## Done and on the Preview (v208, 403 files, published 10:30 PM)
Batch ead51cf8 (GitHub run 1374: 12 of 14 jobs passed; the 2 failures were one outdated test, PKMN-06, fixed after):
- Back/Forward fixed; Remove no longer jumps; tablet groups stay on Remove (Q9 C); Pokémon page uses one source (Q10 A).
- Clear Team's Undo stays 10 s with focus on it.
- Track Record shows the real figure, rounded: about 290× (Q11 'rounded'); TOTAL takes its own line on small phones (Q12 A).
- 17 clear item misspellings fold into the real item (review #15). The Preview shows it after the next daily data run.

## Done, tested here, on GitHub now (run 1375 and the next push)
- Review #1, Battle turn one follows the game's rules: one Mega per side, no move that can KO your partner, Fake Out flinches
  in move order, follow-up attacks are 'from turn 2'. Checked: 300 real matchups, 0 errors; the new test fails on the old build
  (33 two-Mega sides, 1 partner KO, 236 'then' lines) and passes now; Battle behaviour 83 pass, 0 fail.
- Review #2: every Undo stays 10 s (My Box was 6 s). Checked: v2-toast all passed; build behaviour 77 pass, 0 fail.
- Review #22: Compare cleans event names (18 of 60 had emoji/prize text before, 0 now).
- Review #20 (part you can't see): an unknown Pokémon's tab title says 'No Pokémon here'.
- Review #6 (part you can't see): form errors are marked for screen readers and get the focus (26 checks failed before, 48 pass now).
- Helpers: EDIT-03's cause found (the test kit re-tapped a tap that had landed on a busy page; fixed in the kit, not the site);
  the All Suggestions sheet agrees with My Team's 'Nothing to fix'; KO Board captions count their own half; the 'Win logged'
  Undo gets a 44px tap area; Usage says when its numbers come from Online tournaments; the Preview's mock-ups gallery lists the
  25 real pages with fresh pictures (review #16).
- Every other design-review item has labelled pictures waiting for you (Q13 to Q26).
- Checked here on tonight's newest code: team behaviour 139 pass 0 fail; build 77/0; Battle 83/0; tap-size, v2-formerr, v2-trkfit,
  v2-oddaddr all passed on GitHub's frozen test data too.

## Issues and mistakes (honest list)
- GitHub run 1375 (902e1b9f) failed 2 of my new tests on the frozen test data: a team leading Mega Delphox + Mega Floette still
  showed two Megas (Floette's base form is only listed as 'Floette-Eternal'), and one event name kept '$30' at its start. Both
  real gaps the tests were written to catch; fixed in a59975a6 and checked on the frozen data (both 'all passed'). Lesson: run new
  tests on the frozen data before pushing, not only today's data.
- 9:47 PM: I treated an interrupted tool call as you saying stop and sat idle. Rule 00s now says only your words stop the work.
- My first Track Record build clipped the '×' at 320-360 wide (you caught it). Fixed with Q12 A, and v2-trkfit now checks 18 widths.
- The first Preview card text said 'every Undo 10 s' when that batch only had Clear Team's; corrected within a minute (v208).
- PKMN-06 failed on GitHub: an old test expectation, not the site (your Q10 A choice changed the wording on purpose).

## Your PC run (docs/rebuild/test-runs/pc-nov19.txt)
Matches GitHub on Chromium. Windows-only findings are in the morning questions (item 5), plus a News date question (item 6).

## Questions waiting for you
All in docs/rebuild/morning-questions-nov19.md, each with labelled pictures (RECOMMENDED on the image).

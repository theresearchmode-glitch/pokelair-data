# Night of Nov 18 → 19: summary for Sim (draft, kept current through the night)

Every time here comes from the clock. "Checked" names how; anything not checked says so.

## Done and on the Preview (v208, 403 files, published 10:30 PM)
Batch ead51cf8 (GitHub run 1374: 12 of 14 jobs passed; the 2 failures were one outdated test, PKMN-06, fixed after):
- Back/Forward fixed; Remove no longer jumps; tablet groups stay on Remove (Q9 C); Pokémon page uses one source (Q10 A).
- Clear Team's Undo stays 10 s with focus on it.
- Track Record shows the real figure, rounded: about 290× (Q11 'rounded'); TOTAL takes its own line on small phones (Q12 A).
- 17 clear item misspellings fold into the real item (review #15). The Preview shows it after the next daily data run.

## Preview v209 (published just before 12:11 AM by the clock, 443 files), batch 7c314d84 (GitHub run 1378: all 14 jobs passed, including Safari's engine)
Everything below is on it, plus the 44px tap areas (#5) and the updated mock-ups gallery (#16).

## Done and tested (now on the Preview v209)
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
- An independent review I ordered of tonight's code (11 PM) found real problems in my Battle turn-one change that every test had
  passed: Home's plan board showed 'Flinches' as your lead's move for 151 of 300 teams (their Fake Out is only a guess); a Mega shown
  as its base form kept the Mega's Ability (Charizard still set sun); Fake Out could be aimed at a Ghost type. Also: the event-name
  cleaner ate part of one real name, and Compare's top-team source wasn't cleaned. All fixed in 2dcdd1ac, with new checks that fail
  on the old version (151 / 33 of 33 / 1) and pass now. None of it reached the Preview: I held the Preview back until the fix.
- A second fresh review of that fix found three more turn-one mistakes (each in 4-6% of real matchups): their Fake Out planned when
  it can't work (their real turn-one KO labelled 'from turn 2'), your Fake Out aimed at a Pokémon that already moved, and a 'sure'
  flinch from a Fake Out user that may itself be flinched. Fixed in 313804a2; 1000 real matchups pass. Older gaps it found (Tailwind
  re-ordering the rest of turn one, priority blockers on attacks, their own priority moves, Home drawing two Megas) were then fixed by
  a helper (7 commits, each with a check that fails before and passes after; 1004 real matchups pass; code tests ALL PASSED; Battle
  behaviour 83/0; pushed as 0a52a44a). Tailwind's 'double Speed for the rest of the turn' follows Gen 9 rules: assumed for Champions,
  not confirmed in the game. Home's board change is visible (one Mega per side, like Battle): pictures review1-home-board-*.png.
  Then a helper made a Pokémon KO'd earlier in turn one show 'Fainted' (checks fail before, pass after on 1004 matchups).
- A look-only visual check (12:45 AM) found: Compare with BOTH teams picked still showed the raw event name (my fix only covered
  the one-team view; fixed, the test now checks the face-off page and fails without the fix); and Turn One notes grew long and hard
  to read (cards up to 182px tall at 1440 vs 104-124 before; 10 lines at 320). A helper is shortening them now; before/after for you.
- A fourth fresh review (2 AM) of the KO and wording work found more accuracy gaps: 'KOs' and a KO stamp on targets the calc says
  survive with Focus Sash (131 of 1000 matchups' lines; older wording, but it breaks the new stamp rule), Intimidate not applied to
  turn one's damage (2 of 104 'Fainted' wrong), no note for their chance KO on your lead, 'Fainted' stated though most targets carry
  Protect. A helper is fixing them; I held the Preview at v209 (which has none of the Fainted cards) until then.
- The cloud machine restarted at about 2:14 AM by the clock (read just after). The accuracy helper had committed 5 of its fixes;
  its unfinished KO-stamp change was kept, and a new helper is finishing it plus Intimidate and the 'Fainted' Protect check.
  Your earlier messages were shown to me again after the restart; nothing in them was new, so nothing was redone.
- The fourth review's fixes are all in (helpers; each with a check that fails before and passes after on 1000 matchups): an
  opponent with an open team sheet is calculated with its sheet item; no 'KOs' through Focus Sash or Sturdy; Intimidate counts in
  every turn-one hit (387 of 4000 lines changed, 81 of them a different move); the KO stamp only for a sure KO; 'Fainted' only when
  nothing of theirs can stop it (16 in 1000 matchups, was 101); the Watch line says your/their. Open question for you: W10.
- A fifth fresh review (of cb1506aa) and a visual check found one real contradiction: an opponent's card could show a KO stamp
  while the same card said 'May be KO'd first by your Garchomp' (66 of 1000 matchups). Fixed in 98a59a5f, plus: a speed-tied foe
  that can KO your lead now counts as a risk to it, Quick Guard counts as a block for priority KOs, and no Intimidate stage note on an
  Unaware target. Checked: the test now works the risk out from the damage calc instead of reading the code's own flag (my first
  version of that check was too loose and flagged a correct card; tightened), plus two built matchups for the rare cases. Old code:
  66 / 2 / 1 wrong; new: 0, on today's and the frozen test data. Code tests ALL PASSED; Battle behaviour 83/0; Home 9/0; calc
  check 99.99%. The layout points from that check are Q27 (card pairs, pictures) and W11 (wording) on the Morning Questions page.
- A sixth fresh review (of 98a59a5f) found one real, rare bug that fix made visible: with a speed tie, your lead's KO is decided
  before the tied foe marks your lead at risk, so their Pokémon shows 'Fainted' while your card says 'May be KO'd first'
  (22 of 17,564 matchups with mirror leads; 0 of 5,931 with the planner's own leads). The wrong 'Fainted' was there before; the
  contradiction is new. Also: 'speed tie' said twice on some lines; Mold Breaker vs Unaware; Quick Guard counted when its user is
  KO'd first. A helper is fixing them, each with a check that fails before and passes after.
- Start-up on phones (Plans pl-2c, helper): the longest start-up task dropped from ~470 to ~250 ms on Home (4x CPU), same page after.
- GitHub run 1375 (902e1b9f) failed 2 of my new tests on the frozen test data: a team leading Mega Delphox + Mega Floette still
  showed two Megas (Floette's base form is only listed as 'Floette-Eternal'), and one event name kept '$30' at its start. Both
  real gaps the tests were written to catch; fixed in a59975a6 and checked on the frozen data (both 'all passed'). Lesson: run new
  tests on the frozen data before pushing, not only today's data.
- The Plans page went 76 minutes without an update (11:39 PM to 12:55 AM), over your 60-minute limit. Updated at 12:55 AM (v85).
- 9:47 PM: I treated an interrupted tool call as you saying stop and sat idle. Rule 00s now says only your words stop the work.
- My first Track Record build clipped the '×' at 320-360 wide (you caught it). Fixed with Q12 A, and v2-trkfit now checks 18 widths.
- The first Preview card text said 'every Undo 10 s' when that batch only had Clear Team's; corrected within a minute (v208).
- PKMN-06 failed on GitHub: an old test expectation, not the site (your Q10 A choice changed the wording on purpose).

## Your PC run (docs/rebuild/test-runs/pc-nov19.txt)
Matches GitHub on Chromium. Windows-only findings are in the morning questions (item 5), plus a News date question (item 6).

## Questions waiting for you
One page with every picture question side by side: https://claude.ai/artifact/8hS4g7uHttJhiUQ8sXDmUv (Morning Questions).
The wording questions without pictures are in docs/rebuild/morning-questions-nov19.md (items 3-6, 13, 16, 21).

# R4 My Team: what the new build still lacks (from the behaviour tests, Nov 11)

Measured: group A behaviour tests on the new build, adapter v2 (docs/rebuild/test-runs/v2-A-team-2026-11-11.md):
15 of 144 passed on the first run; the six real differences it found are fixed (TEAM-02, TEAM-06, LOG-02b, EDIT-11, X-11;
SAVED-01 now differs only in wording). Most failures are features today's My Team has that the new one doesn't yet.
"Never remove functionality": each of these comes over before the switch (R5), one at a time, from today's shared code.

## To build (My Team group)
- [x] Header (Nov 11): "My Team · 6 of 6 · Sun team" and the team's name as the page heading (TEAM-01 pass); the band meter and
      the win line under the score, "Few real games back this mix yet" when How sure is Low (TEAM-03 pass); "Why this score?"
      as a sheet from CH.whyData, the same numbers and sentences as today (TEAM-04: passes up to its last step, the "How the grade
      works" link, which waits for the How We Calculate page); Switch Team as a sheet (TEAM-05 pass). Compare's "Why These
      Scores" (word list: Strength Score, not grade) done Nov 11, both teams side by side from the same breakdown. Measured: same-why.mjs 265/265 identical; the five tests also still pass on today's page.
- [ ] Six tiles: Lock on the tile (TEAM-09); the set card's role, tier and Info sheet link (TEAM-10, X-06);
      Set as lead (TEAM-11); the game plan line (TEAM-12); empty spots you can tap to add into (TEAM-20, ADD-01, ADD-02)
- [ ] Export as text (TEAM-13, IO-02; the new build copies straight to the clipboard: decide if the text box is still needed)
- [ ] Header badges: Matchups summary (TEAM-15). Done Nov 11: Legal mark with the rules tooltip + Team Checks count (TEAM-16 pass)
- [ ] Suggestions controls: SUG-01, 02, 03, 03b, 04, 06, 07, 08, 10, 11; X-08
- [ ] Matchups views and the threat sheet: MU-01 to MU-05, MU-05d (+ known MU-05b, MU-05c)
- [ ] Folds: How it plays (PLAY-01, 02), Popular sets (SETS-01, 02), X-07, X-12 (first sentence + More)
- [ ] Edit Set parts: EDIT-03, 04, 09, 10, 12 (Edit team, all six)
- [ ] Team Sheet page parts: SHEET-01 to 04, SHARE-04, IO-04 (Copy as text)
- [ ] Your games: "Paste its log" (LOG-02, X-13: comes with Battle); record on saved cards (LOG-05: done Nov 11, re-test)
- [ ] Saved Teams: SAVED-02 (+b), 04, 07, 08, 09 (07 poster and 08 compare: done Nov 11, re-test)
- [x] "← My Team" back links on My Box and Compare (BOX-01, CMP-01 pass, Nov 11). Also fixed: My Box's search offered
      Pokémon already in the box (BOX-02 pass); the box search is named "Add a Pokémon to your box" (BOX-07 pass).
      Box and Compare on the new build: 10 of 11 pass; CMP-03 waits for the Winning Teams page (its "tap Compare on its card" note).
- [ ] First-visit sample note (X-02)
- [ ] Home (HOME-01..16) and the info sheet tests that start from Home tiles (PKMN-01..07): with the Home page

## Decided (Claude, executive control; Sim can overrule)
- EDIT-08: after a change, the message says how the Strength Score moved (not "Offense N of 18"): the word list's measure.
- TEAM-07 / TEAM-08: the new jump bar (Set | Matchups | Suggestions | Team Checks) at every width, and the picked
  Pokemon's set always shows (approved mock-up); the tests are updated to match.
- BOX-02: box search lists Pokemon already in the box, greyed with "In your box", instead of hiding them (clearer why one
  can't be added).
- TEAM-19, BOX-07, X-03: today's underdog replaces Darkrai (Sim, Nov 11); tests updated.
- Wording and Title Case differences (b-list in the run report): the new words follow the word list; tests updated to match.

## Carried-over known bug to fix in the new build
- CMP-04b: Compare lists Speed control as a counted check; it is a note (Sim, Nov 9).

## Test wording (Nov 11)
Some tests checked today's exact punctuation and layout. They now accept the new build's word-list form too, and still check
the same information (each can still fail): "My team: 6 of 6, Sun team" or "My Team · 6 of 6 · Sun team"; "Switch team" or
"Switch Team"; one "Legal Team checks 4/4" badge or a Legal mark plus "Team Checks 4/4"; the rules tooltip is read through
a helper (rulesTooltip) instead of today's page structure. Re-run on today's page: TEAM-01, 03, 04, 05, 16 all pass.
Nov 11 (Box/Compare): also accepted are "Build for Me", "What's Different", "Winning Teams", "Use This Team", "Pick Team B"
(Title Case, Sim's rule) and Compare's "Matchups (damage calc, top 30)" row (word list: not "ready for the top 30").
The empty box's picture is checked through a helper (today: Darkrai; new build: the featured underdog, Sim's decision).
Note: the test harness copies the page into app/test/behaviour/, where art/ isn't served, so the new build's sprites never
load in behaviour tests; picture checks there look for the sprite being placed, and screenshots check it shows.
Shared moves Nov 11: CH.LETTERS (the band key) to 58-strength.js; same-why 265/265 identical after it.

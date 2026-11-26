# Spicy picks, rebuilt to Sim's choices (HH's Job L), Thu Nov 26, from 06:45 AM Eastern (`date`)
Branch alt/spicy-picks2, from claude/design6 9bab576f.
- It reuses the Job E feature commit (b97338a4, cherry-picked and changed).
- The Job E test commit was not reused: the SP checks were rewritten and AS-4b is untouched.

## Sim's choices, and how each is met
1. **Default unchanged.**
   - With Spicy off, Suggestions, All Suggestions and Matchups' Best fix are exactly as on design6, rare picks included.
   - app/src/v2/pages/team.js is design6's file (no filtering), and the sheet's filter is gone.
   - When Spicy is on, its group is extra: it leaves out any swap the normal list already shows.
2. **Toggle placement:** inside Adjust Suggestions while off; on, it heads its group. Same as Job E.
3. **Labels:**
   - "Rare pick, plenty of games (N)", with N the tournament games and a thousands separator (e.g. "(1,163)"), when the research's PROVEN rule holds: under 5% of teams, 300+ games, 95% lower bound over 50% with n = games/3.
   - Otherwise "Spicy: too few games to tell".
   - Under each label is the share of teams only, e.g. "1.4% of teams".
   - The group header says only "Pokémon fewer than 5% of teams use. Each card says how much data is behind it.". There is no claim about how often a rare pick wins.

## Proof that "Spicy off = design6" (checked)
- **Comparison run** (scratch .cmp.mjs, frozen out/ 0c992f69, Chromium): design6's build and this branch's build both open My Team for 4 teams at 1440 and 390:
  - the sample team (default)
  - the README team with Whole Roster
  - a 5-of-6 team with Box + Catch
  - a rain team with Whole Roster
- For each, it compares the Suggestions section's whole text (leaving out the Adjust Suggestions fold, where the toggle lives) and the All Suggestions sheet's whole text.
- Result: "section same: true … sheet same: true" for all 8 runs. For example, t68all1440 compared 3,212 characters of section and 5,999 of sheet.

## Checks (app/test/v2-minors.mjs, groups, SP-1..6; `ONLY=SP`)
- **SP-1:** off by default (a button in Adjust Suggestions, aria-pressed false). The normal cards are the planner's own, rare picks included and unlabelled: Mega Dragonite at 4.9% is in card 2 on the frozen data. No spicy card shows.
- **SP-2:** All Suggestions is identical with Spicy off and on (7 and 7 cards, Mega Dragonite included).
- **SP-3:** Enter turns it on, and focus stays on the toggle.
  - Each spicy card has the label its numbers call for: Mega Aerodactyl 1.4% → "Rare pick, plenty of games (1,163)"; Mega Skarmory and Mega Pidgeot → "Spicy: too few games to tell".
  - No label or header says "as good", "as often" or "better".
  - The normal cards are the same as with Spicy off.
- **SP-4 (rule 20):** Apply on Spicy pick 1 gives that six and the score the card showed (55 → 85).
- **SP-5:** Space turns it off; the choice is kept; the normal cards are the same as with it on.
- **SP-6:** Search finds it ("spicy" at 1440, "rare picks" at 390) and opens it on, in view and focused.

Results:
- design6 9bab576f (`PAGE=` a design6 build, `ONLY=SP`): "v2-minors:6 failed". All six FAIL: there is no toggle, and Search has no "Spicy Picks" (SP-6 shows `{"hit":false,"k":-1,…}`).
- This branch: "v2-minors:all passed" (`ONLY=SP`).
- AS-4b is design6's own, unchanged: the only `-` line in the v2-minors diff is the header comment listing the parts.
- `node app/test/v2-guard.mjs`: "v2 guard: clean (...)".
- Full `node app/test/v2-minors.mjs` on the frozen out/ (0c992f69 checked out first, restored after) → "v2-minors:all passed" (317 pass), including AS-4b in its original form ("Bigger Plans shows 1 of 3, \"Show 2 more Showing 1 of 3\" …") and SP-1..6.

## Pictures: docs/rebuild/pics/nov26/spicy2-1 (1440, on) and spicy2-2 (390, on)
Both on the frozen test data: the README team, Whole Roster.

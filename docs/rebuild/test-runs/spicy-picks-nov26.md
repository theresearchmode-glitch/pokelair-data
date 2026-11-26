# Spicy picks (HH's Job E), Thu Nov 26, from 01:36 AM Eastern (`date`)
Branch alt/spicy-picks from claude/design6 c062acf1. Pictures only for the look; not merged.
Research behind it: docs/rebuild/research/spicy-picks-nov26.md and experiments/spicy-candidates.mjs (on alt/t3-pending).

## What it does
- Suggestions (My Team) has a "Spicy picks" toggle: a kit chip (V2.kChip, a real button with aria-pressed), off by default, kept in
  this browser (np2.spicy). Off, it sits in Adjust Suggestions with the other settings; on, it heads its own group under the
  suggestions (the state and the way back in view) and the fold's closed line says "Spicy picks: On". Search finds it ("Spicy Picks";
  also "rare picks", "off-meta") and turns it on.
- Why in the fold: a row always visible under the links (option B, picture 9) added 138px to Suggestions at 390, and the
  "My Team at 390 is at most 4.35 screens" check (Sim's cap, measured with no margin) failed: 4.64 screens, 3920px. In the fold, My Team
  at 390 is 3782px, the same as design6. Note: in this container design6 itself measures 4.48 screens (3782px) on that check, so it
  fails here on design6 too (PART=main2 on design6: FAIL ... 4.48 screens, 3782px); the check's own comment says 4.35 was measured on Nov 25 (where, not checked). Not caused by this change.
- When every plan the planner found brings in a rare Pokémon, the side options stand in (as when the planner finds none), so My Team
  still shows the swaps All Suggestions lists (AS-11, 5 of 6, caught this).
- Off: no suggestion on My Team, in All Suggestions or in Matchups' Best fix brings in a Pokémon used by under 5% of tournament teams
  (activePerf, the tournament numbers in use; live usage when a Pokémon has no tournament row). Before, the README team's Suggestions
  2 and 3 brought in Mega Dragonite (4.8%) with no label.
- On: a separate group under the toggle, at most 3 cards, one per rare Pokémon, best Strength Score first; a swap that lowers the score
  is left out. Its swaps come from the normal planner's rare plans plus today's planner run over the rare Pokémon in the pool with the
  off-meta scoring (as the hidden gems), single swaps, the best 12 graded. A rare Pokémon that is clearly under even (300+ games and the
  upper bound under 50%) is never offered.
- Each rare Pokémon on a card has a label (V2.kTag) and a receipt line (share of teams and games; no raw win rate, which is mostly
  player skill):
  - "Rare pick: about as good as the usual one" when it has 300+ games and the 95% lower bound (Wilson, n = games / 3) is over 50%
    (the research's PROVEN);
  - otherwise "Spicy: too few games to tell".
  The word "better" never appears. The six is graded exactly as the card shows (planGrade; SP-4 applies one and re-grades it).

## Checks (app/test/v2-minors.mjs, part groups, SP-1..6; ONLY=SP runs them alone)
- SP-1 off by default, no card under 5%; SP-2 the sheet has none either; SP-3 Enter turns it on, focus kept, every spicy card labelled
  with the label its numbers call for; SP-4 Apply gives the six and the score the card showed (rule 20); SP-5 Space turns it off
  and it is kept; SP-6 Search finds it at 1440 and 390 and opens it on, in view and focused.
- On design6 c062acf1 (app/dist/v2-d6.html, same data): all six fail (SP-1 lists Mega Dragonite 4.8 in cards 2 and 3; SP-2 lists
  Mega Blastoise 1.7 in the sheet; no toggle).

- AS-4b changed: its Bigger Plans count now leaves out plans that bring in a rare Pokémon (they are in the Spicy picks group, not the
  sheet). With the README team that leaves 1 Bigger Plan, so AS-4b takes its "no strip needed" branch; the "Show N more" branch is not
  exercised by that team any more (it was before). A team with 2+ ordinary Bigger Plans would bring it back.

## Runs in this container (Playwright 1.49.1, frozen out/, `node app/build.mjs --v2 --preview-data`)
- `node app/test/v2-guard.mjs` -> "v2 guard: clean (...)".
- Full `node app/test/v2-minors.mjs` -> "v2-minors:1 failed" (311 pass). The one: "My Team at 390 is at most 4.35 screens long (4.48
  screens, 3782px)", the same number design6 gives here (PART=main2 on design6: "... (4.48 screens, 3782px)").
- `ONLY=SP` on design6 -> "v2-minors:6 failed"; on this branch -> "v2-minors:all passed".
- v2-q59, v2-q69, v2-q78, v2-q84: "all passed". `node app/build.mjs --v2 && node experiments/v2-words.mjs` -> "0 places with ...".
- v2-swapname -> "v2-swapname: 16 failed" (every "swap names on the page (0)"): design6 gives the same 16 here (the sample team's only
  swap, Mega Floette at 12.8%, is a ±0 side option kept behind See All, so no swap name is on the page). Not caused by this change.

## Pictures: docs/rebuild/pics/nov26/spicy-1..9 (README team, Whole Roster; 1440x900 and 390x844 light, 1440x900 dark; 9 = option B, not chosen)

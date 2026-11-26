# Summary for Sim: Mon Nov 16, 11:30 AM to 8 PM (executive authority)

Every decision is in decisions.md with its clock time. Pictures are in docs/rebuild/pics/nov16/.

## Your picks today (all built, checked, pictures)
- **Logo on phones:** the imp alone under 414; full logo from 414 up (logo-phones-imp.png).
- **Damage Calc played card:** names never run into the number; fits all 345 attackers (calc-played-card.png).
- **Test Run:** "Bring these four" as front row / back row (test-run-bring-four.png);
  the open card says "From: The Problems" (test-run-from-label.png).
- **Home headline:** 2 lines at full size; the intro goes under it at 1100-1339 (home-headline-1180.png).
- **Battle and Practice desktop space (Q3):** bigger Your Six sprites; "Favoured" beside the headline;
  six "?" slots on the real-team card (q3-built.png).
- **Selected chips (rule C4):** light blue tint, not dark like the main button (selected-before-after.png).
- **Kept as is:** centred lone tiles, footer link row, Winning Teams small card names.
- **Launch:** hide the style guide page (launch checklist).

## Fixes from two fresh-eyes audits (14/20, then 11/20 after a deeper look)
- My Team score header: buttons covered the score at 700-1280. **My regression; fixed.**
- Menu "My Team" wrapped; Test Run labels; pile names; header off the edge at 700-999. **Also mine; fixed.**
- Damage Calc:
  - hand names cut for 760 cases at 700, now 0 (5 near-touches at 1100-1240);
  - "No effect" gave a false reason (now: "Psychic Terrain blocks priority...");
  - Terrain value cut at 1024;
  - long names squashed the sprite;
  - Weather "None" was blue.
- Words: "teams that are win" fixed (shared with the live site; live suite passes).
- This Week counts, Search names, Usage names, Archetypes ranks, Battle bar "Type Chart",
  How We Calculate banner on phones.
- Accessibility: 44px tap areas on action links; toast Undo 8.77:1; focus after an import.

## Checks on the final build
- Tests: My Team, Battle, Build (same 31 known), Meta (same 50 known); live site suite.
- Layout checks, day and night, on every page touched; before/after picture sweep reviewed.

## Honest notes
- Three of today's bugs were caused by my own earlier fixes. My checks missed them because they ran
  with no team loaded. Checks now load a team.
- I said one interrupted edit hadn't been written. It had. Corrected the same hour.

## Still open
- Your after-4 device checks: docs/rebuild/test-runs/sim-nov16-after4.md (iPhone, iPad, Windows, VoiceOver, PC prompt).
- Parked ideas for your fresh look: docs/rebuild/parked-ideas-nov16.md.
- The switch to live waits for you.

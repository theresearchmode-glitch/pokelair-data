# Audit: Build, Battle and the Battle tools (Nov 14, ~9:50 PM; read-only helper agent)
Pages audited on the Preview build at 320-1920, day and night. Screenshots: scratchpad/audit3/shots (session-only).
Measured clean: no console errors; no page-level sideways scroll; every font size on the scale; every 24px+ text Unbounded slanted;
no small text under 4.5 contrast on flat backgrounds (gradients not measured); no tool page is a placeholder.

## Broken
1. Blueprint 1100-1280: team name overlaps the giant score (pages.css .bp-team h2 at d64 with no width limit).
2. Blueprint Spec controls cut off at 320, 820, 1100, 1280 (.bp clips; Whole Roster / "2" / Any Pokémon cut; 320 spec 19px past .bp).
3. Build Cores, Full Teams tab at 390: names one word per line, Load Team over names, sprites overlap.
4. Battle empty "Your Six": move chips break mid-word at 820-1440 (.mh-mv li overflow-wrap:anywhere in narrow chips).
5. Battle empty "Your Six": names overlap/cut at 1440 night and 320.
6. Battle Log (empty Battle) at 820: sentence squeezed into a 41px column.
7. Damage Both Ways tab at 820/1100: 6-column grid cut at the right; move names ellipsised.
8. Damage Calc 1440: Terrain tile text cut; tile oversized next to Weather.
9. Damage Calc 320/820: defender name cut ("illaboom"), name under Swap, move cards cut; TERRAIN/WEATHER labels crossed by the dash line.
10. Type Chart 320: "Fighting" chip label cut on the left.
11. Battle Speed tab 1100: sprites overlap, left-most cut.
## Clearly wrong
12. Practice typo: "(or one 5 of 6 the same)" -> "(or one with 5 of the 6 the same)" (practice.js:23, :45).
13. Calc: Mega Charizard Y shows "No item" (calc.js:110).
14. Blueprint counts disagree: "+1 from its own 479 games" vs Notes "83 players, 496 games"; "58% won" vs "57.3% wins".
15. Speed Tiers: head "top 20", lines "top 30 threats".
16. Blueprint has two main (solid) buttons: Use This Team and Build Me a Team.
17. Test Run: a solid main button on every card (old page; Three Piles has one open card).
18. Battle: their Megas labelled "Mega" in PLOT blue (blue = you) - colour audit #13.
19. Watch Out: Tailwind / Rage Powder amber, Sand Stream plain ink in the same list.
20. Tap targets under 44px at touch widths: Build fold links, Battle Clear / "0 of 4 picked", sheet "Show All 90…", Types chips, Calc links.
21. Blueprint revisions not in score order (A 91, B 77, C 90, D 89); unsure if intended.
## Wording
22. Buttons not Title Case: Test Run "Practice in Battle mode", "How it works", "Matchup prep"; Practice "Skip this team", "Change six"; Calc toggles; "How the calc works →".
23. One action, three names: Use This Team / Load This Team / Load Team.
24. "TailRoom" coined word in revision names.
25. Calc stat names written two ways (SpA vs Sp. Atk).
26. Battle Log "saved with their 6" (elsewhere "six").
27. Battle "Favoured … 39,052 tournament games": check what the number means.
28. "Turn One, Play by Play" headline wraps with a lone "Play" at 390.
## Polish
29. Blueprint team name wraps before "·" (needs a non-breaking space).
30. 1440: Blueprint sheet narrower than headline and lower sections.
31. Blueprint frame corners and rules don't meet (unsure if intended misregistration).
32. Recent Winner rows 320: "Open ›" overlaps sprites; lone "80!" at 390.
33. Strength Score line at 320 crossed by a blueprint rule.
34. Battle The Read / Watch Out: right column shorter, ~170px empty block at 1440.
35. Battle tabs look like tabs but none selected; labels wrap at 390.
36. Deeper Read grid: sprites only, names only in a caption.
37. Speed Tiers 320: condition chips uneven; chip sizes differ at 1440.
38. Calc KO board: half-filled rows; header count vs tiles confusing.
39. Practice 1440: empty half and empty band.
40. Practice: "Their six" grey while Battle uses pink for them.
41. Change Their Six sheet: team-row sprites overlap.
42. .pbp-why line-height 1.4; Game Plan box centred text.
43. Type Chart lone-word wraps in fine print.
44. Footer at 820 wraps to three short lines.
45. Build (before building) 1440: empty band; "optional" said twice.

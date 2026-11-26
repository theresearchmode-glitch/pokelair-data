# Audit: Home, Meta (Rating / Usage / Sets), Winning Teams (Nov 14, ~9:55 PM; read-only helper agent)
220 page loads, 320-1920, day and night. Measured clean: no console errors; no sideways scroll; headlines/big numbers Unbounded slanted
on scale; paragraph line-height 1.5; no contrast failures on solid backgrounds (gradients/art not measurable); content clears the bottom bar.

## Clearly wrong
1. Home 320-430: the underdog block clips "Somebody's" and the Build Around It button (88px + 140px columns + slanted clip; pages.css:1797).
2. Meta/Usage/Sets heroes at 320: the three stat numbers overlap and touch the screen edge (.gs-facts 3 columns; pages.css:1921); "Base Speed" lone at 1100.
3. Sets hero 320: sprite covers "S tier, rated 94, #5 of 321".
4. Winning Teams 320-430: last sub-tab "Archetypes" cut ("Archetype") (pages.css:2256-2257, auto columns + nowrap).
5. Grandstand 320 and 1100: names collide; numbers drop 16-17px when a name wraps or has ◆ (symmetry).
6. Winning Teams: hero "90 teams" vs search "412 teams match" (search covers every event sheet; the hero counts the list) - needs one line saying what each counts.
7. Meta: "data as of Nov 1" in the intro vs footer "Nov 10".
8. Night: selected chips/tabs barely differ from unselected (#343348 vs #201F2D, ~1.3:1; tokens.css night --plate).
9. Home phone/iPad: two main buttons on one screen (Score My Team, Prep vs the Champion).
10. Load Team works two ways: Home "Tap Again to Replace" vs Winning Teams Replace/Cancel; after Cancel focus jumps to the top.
11. Winning Teams touch widths: Practice Against / Compare 20px tall (.wt-acts links need min-height).
12. Usage: "of 3,114 teams" is 10.8px (.us-bh small; pages.css:1947).
13. Home Undercard "Hidden Gems": 2 tiles in a row built for 10.
14. Winning Teams Last 7 days: raw event name "RookideeVGC Qualifier| Prize Shiny Raichu" (data).
## Polish
15. Home Undercard: Mega tiles' numbers 6px lower.
16. Home champion's corner 320-820: links stack unevenly.
17. Home Ringside heading: 4 lines at 820; lone "now." at 1440+.
18. Button capitalisation: "Open info sheet", "Build around it", "Show fewer", "Hidden gems" vs "Hidden Gems", "Tap a Card for its info sheet", "My team".
19. "MEGA" capitals on Grandstand/Usage/Sets vs "Mega" elsewhere.
20. Hidden gem: black vs purple ◆; three wordings (Word list: "reaches top cut more often than its use predicts"); "over 300+ games".
21. Repeated text: Sets hero "S tier"/94 twice; Meta intro repeats "rated 0-100 from real results".
22. "3/4 checks, missing weak spots spread out" reads oddly -> "3/4 checks · missing: Weak spots spread out".
23. Replace and Cancel different sizes.
24. Unsure: Sneasler usage 37.5% (hero) vs 35.6% (Home) - sources not named.
25. Unsure: Usage podium "Charizard" vs ratings "Mega Charizard Y".
26. Colour: a blue bar under a tile means "Lead" on Home but "on your team" on the Grandstand.
27. Unsure: two status messages at once after Replace.
28. Hero sprites soft on 2x screens (277px file shown at 200px).
29. Grandstand 1100: S-tier sprites overlap; names 6px apart.
30. Small: "Your Team" vs "On your team"; Home "Got It" 39px wide; Home corner headers at different heights at 1440.

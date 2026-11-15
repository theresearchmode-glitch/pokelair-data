# Audit: My Team (Hand, empty, Edit Set, Team Sheet), My Box, Compare (Nov 14, ~10:30 PM; read-only helper agent)
132 page loads (6 states x 11 widths x 2 themes) + click sweep. Clean: 0 console/page errors (also after 95 clicks); 0 small-text
contrast failures on flat backgrounds (gradients unmeasured, so dark mode is mostly unmeasured).

## Broken / clearly wrong
1. Edit Set says Mega Charizard Y's most-run nature is Timid; the strip and Team Sheet say Modest (team.js:184-186 natureChoices vs cs set data). One source needed.
2. My Team Cards 820/1100/1280: move names break mid-word (.mh-mv li overflow-wrap:anywhere, pages.css:2041).
3. My Team hero 320: team name breaks mid-word ("Sun Tailwin / d (sampl / e)") (.tm-name overflow-wrap:anywhere).
4. Compare 320: VS badge covers the end of Team B's name (21px).
5. My Team Hand 1100-1920: group headers different heights, so Cards sit up to 15px lower in Back/Bench (.mh-gh).
6. Compare "Same on Both" lists rows that differ (Matchups counts, Tailwind setter) - logic check needed in compare.js / cxFacts.
7. Sheets (Team Sheet, Edit Set) once scrolled: the sticky ✕ has an opaque square that cuts content in the top-right corner (components.css:93-94).
8. Word list: Compare row "Ready for the top threats" (should be Matchups wording).
9. Tap targets under 44px: Compare Swap / Change / footnote link; My Team .ty2-full; Edit Set .ed-pk at 320.
10. Matchups threat cards at 390 (4 per row): verdicts touch, names wrap, one card taller.
## Polish
11. Empty My Team: a rule between Back and Bench but none between Lead and Back.
12. Selected Card outline is a rounded rectangle on cut-corner Cards (C11).
13. Shown twice: "Top 1% of tournament teams" (band + hero), "Legal for Reg M-C" (band + tabs), Team Sheet legend "stat points (0-32)" twice.
14. Team Sheet 390: Whimsicott's head covers "02".
15. Compare Tale of the Tape: Slowest has no "ahead" tag (by design: slower isn't simply worse; maybe say so); 320 labels wrap.
16. Segment controls stop short of their row (Box "Arrange by", Matchups view bar).
17. Move chips 1100-1440 wrap to two lines, uneven heights; type chips stack in the Card at 1100.
18. Type chips under Cards at 320 stack unevenly.
19. Team Sheet move chips at 390 ragged widths.
20. Orphans: "Nov 10" alone in the footer; a lone "12" on the damage line at 390.
21. Compare "What's Different": paragraphs indented 20px more than the heading; 1 vs 3 paragraphs per column at 1440.
22. Box "Your Team" in slot order, not Lead / Back / Bench.
23. Box 820-1440: names squeezed by different amounts (unsure if intended).
24. Empty My Team 1440: ~80px gap under the underdog headline.
25. Box: "Too few" sits in a big-number slot.
## Type / wording / colour
26. "most run" / "Most run" / "Most common spread": one tag, three phrasings.
27. "Team Sheet ↗": the arrow suggests an outside link; it opens a sheet.
28. Saved Teams count "1" at 12.5px; .cxf-id p line-height 1.4; "Notes, not counted" as a 13px h3 (fine as a label).
29. Colour: My Team eyebrow red as decoration; Compare Team B pink reads as red in light mode (--pick #E8364F beside --bad #D93A3A): "them" and "No/Unfavoured" look alike.
30. My Team 320-600: page 8px wider than the screen, hidden by overflow clip (.tm-acts slant, .mh-hand); check on iPhone.
31. Unsure: "2027 Gdańsk" season naming; empty-state underdog Maushold vs the rotation rule.

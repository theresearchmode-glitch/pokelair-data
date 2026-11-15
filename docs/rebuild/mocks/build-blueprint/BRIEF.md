# Build: Sim's pick "The Blueprint" (Nov 14)

Sim, with the brief: "last but not least, here is the redesigned build page and the prompt. ofcourse we make it our way but with the same our rules and how we usually do things." and "work on things in the order you think is best for the website and for everything. I want the most polish we can have. This should all look high budget studio quality." Our rules win; every change from the brief is listed for Sim. The brief as received (pictures beside this file, converted to webp):

BUILD — SIM'S PICK: "THE BLUEPRINT". Design brief, no code.

Sim chose this on Nov 14 after several rounds of mock-ups. Three pictures come with it (desktop 1440, iPad 820, iPhone 390). Each picture shows dark on the left and light on the right. They are mock-ups drawn over your built v2 Build page (branch claude/design6 at 423360bb) after a real "Build Me a Team" from the Whole Roster with 2 Megas, so every name, number and word in them is what the page produced. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 7 lists the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

This brief covers the top of the Build page with a team built: the options, the answer, its proof numbers and its actions, and the list of other options. Recent Winners and Cores are not redesigned yet.

THE IDEA
"Build me a team" is taken literally: the answer is a drafting sheet. The team is drawn on gridded paper with thin blue linework, numbered figures and a title block. It should feel like NastyPlot's own blueprint, not a navy engineering print: the site's fonts, slanted plates, cut corners and PLOT blue.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything the Build page does today must still work: Build from (My Box / Whole Roster), Megas on team (0 / 1 / 2), Build around a Pokémon with its search and suggestions, Build Me a Team and building again, the options (Option 1 of N, Proven team / Fresh take), the Strength Score with its word, rank and "Why This Score?", the style chips, each Pokémon's role, item, tier and "To catch", the four proof numbers, Use This Team, Save, Copy for Showdown, the "N to catch" line, opening a Pokémon's info sheet, and the How It Works link. Same data, same helpers, same numbers, same wording unless listed in section 8. Nothing is removed.

1. THE PAGE HEAD
The eyebrow "Build · real winning teams · Reg M-C doubles" and the headline "Build me a team." with "a team." in PLOT blue, above the sheet. The intro sentence and "How It Works" from today's head are not drawn; keep them.

2. THE SHEET
- One sheet holds everything. Light mode: near-white paper, a fine blue grid with a heavier line every fifth square, and blue ink for lines and labels. Dark mode: the site's own dark background with a faint PLOT-blue grid and lighter blue linework. Sim asked specifically that dark mode not be a navy sheet; she found that dated.
- The sheet has cut corners at the top right and bottom left, like the Card, a thin blue frame, and a small registration cross in each corner.
- A header line across the top with a rule under it: a slanted blue plate "Sheet 1 of 4" (the option number), then the option's kind and Mega count ("Proven team · 2 Mega options"), then "Reg M-C doubles · drawn from real winning teams" at the right.

3. THE TEAM AND THE SCORE
- Left: the small label "Team", the team's style name as a big headline ("Sun · Tailwind"), and its chips (Speed control, Weather) as thin outlined slanted tags.
- Right: the Strength Score as a very big number sitting between two thin guide lines with a bracket at its left, like a measured dimension. Beside it the score's word ("Top tier") as a tilted stamp with a double rule, then "Strength Score · Top 2% of tournament teams" and "Why This Score?".
- iPad and iPhone: the score block sits under the team name.

4. THE SIX
- A dimension line across the full width with end ticks and the label "Team of six · 2 Megas".
- Six figures in a row on desktop. Each has: an outlined number (01 to 06) top left; a dashed ring and a faint crosshair behind the Pokémon; the Pokémon large; a slanted base bar in its two type colours (this is where the page's colour comes from); its role in blue in the headline font (Priority, Sun, Attacker, Tailwind); a line reserved for "Mega" so all six names line up; the name; the item; the tier, with "to catch" when it applies.
- The Pokémon in the team's best core carry a small blue "Core" tag top right. That is the same core the fourth proof number names.
- Tapping a figure opens its info sheet, as today.
- iPad: three across, two rows. iPhone: two across, three rows.

5. THE TITLE BLOCK
A ruled box at the bottom of the sheet in two halves (stacked on iPad and iPhone).
- Left, "Spec · tap a field to change it": three fields with dashed underlines: Build from, Megas on team, Build around · optional. These are today's three options; each opens its own choices. Then "Revisions · tap one to see it": every option the build produced as a slanted outlined row with a letter (A, B, C, D), its name and its score; the one shown is filled blue. This replaces the Other Options list below the fold. Then the Build Me a Team button.
- Right, "Notes": the four proof numbers as a numbered list, each with its big number, its bold label and its small line (24/30 Matchups with an answer; 4/4 Team checks: the 4 basics; 58% won This exact six at events; 57.3% wins Best core, 327 teams). Then Use This Team, Save, Copy for Showdown and the "1 to catch" line.

6. KNOWN ROUGH SPOTS, AND WHAT IS NOT DRAWN
Rough spots in the mock-ups:
- On desktop the two Megas' role labels sit a line higher than the other four.
- On iPad, wide Pokémon (Mega Charizard Y, Mega Floette) spill slightly past their rings into the next column; no text is covered.
- On iPhone the "Top tier" stamp breaks onto two lines, and "Why This Score?" wraps.
Not drawn (each needs a picture for Sim before it is built):
- The page before anything is built, and while it is building.
- A build from My Box, and "All six to catch" / "All six are in your box".
- A Pokémon chosen in Build around, and its search suggestions.
- A Fresh take option with its explanation line; a build that returns one option only.
- The revision rows' second line from today's Other Options ("27/30 matchups with an answer · 4/4 team checks") and their six Pokémon; the mock shows name and score only.
- Recent Winners and Cores in this style.
- Widths between the three drawn, a 320-wide phone, and iPad landscape.
- Reduced motion, keyboard order and screen-reader text. The three "fields" need to be real controls with labels.

7. WHERE THIS MAY CONFLICT WITH YOUR RULES
- The three options move from the top of the page into the title block at the bottom of the sheet. Before a first build there is no sheet, so the options need a place at the top in that state; that state is not designed.
- Other Options moves from a tab below the fold into the Revisions rows. Tests that look for the Other Options tab or its "Show This One" links will need the new home.
- The sheet is a box with a ruled box inside it. Your rule is no boxes inside boxes in different shades; here both are the same paper colour with a thin rule, but check it against the rule.
- The paper, grid and ink colours are new and are not in tokens.css. The mock derives the dark ones from PLOT blue.
- Small uppercase letter-spaced labels are used throughout (Team, Spec, Notes, Revisions). Check them against your type rules and minimum sizes; they are 13 px in the mock.
- The stamp is rotated a few degrees and uses a double rule; the outlined numbers use a text outline. Both are decoration.

8. WORDS THAT ARE NEW (Sim has seen them in the pictures; confirm before they ship)
"Sheet 1 of 4", "drawn from real winning teams", "Team", "Team of six · 2 Megas", "Core", "Spec · tap a field to change it", "Revisions · tap one to see it", "Notes", and the letters A to D for the options.

9. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
build-blueprint-desktop.png
build-blueprint-ipad.png
build-blueprint-iphone.png

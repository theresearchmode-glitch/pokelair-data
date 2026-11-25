TEAM SHEET — SIM'S PICK: "TALE OF THE TAPE". Design brief, no code.

Sim chose this on Nov 14. Three pictures come with it (desktop 1440, iPad 820, iPhone 390). Each picture shows dark on the left and light on the right. They are mock-ups drawn from your built v2 Team Sheet (branch claude/design6 at 423360bb) with the real sample team, so every name, move, nature and number is what the sheet shows today. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 6 lists the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

The pictures draw it as a full page so it fits in one image. It still opens as the sheet over My Team, from the same button, as today.

THE IDEA
The boxing "tale of the tape", to go with Fight Night on Home: the six stand across the top and everything about them is read across in rows, so the team can be compared at a glance. The best of the six in each stat is marked.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything the Team Sheet does today must still work: the back link and eyebrow, Copy for Showdown, Share as Image, tapping a Pokémon to edit its set, and for each Pokémon its name and Mega mark, the Lead note, item, ability, four moves in their type colours, nature with its raised and lowered stat, the spread note, and the six stats at level 50 with their stat points. Same data, same helpers, same numbers. Nothing is removed.

1. THE HEAD
The eyebrow, the headline "Team Sheet", and the two buttons at the right (stacked under the headline on iPad and iPhone). Under them the help line, then a short legend: a blue plate = team best in that stat; ▲ raised by nature; ▼ lowered by nature; pts = stat points (0–32).

2. THE SIX ACROSS THE TOP
One column per Pokémon. Each has a tall slanted banner in its two type colours with fine diagonal lines, its number (01 to 06) as outlined digits top left, its name as giant outlined letters along the bottom of the banner (decoration), and the Pokémon large in front. Under the banner: a line reserved for "Mega" so all names line up, the name in the headline font, and a small blue slanted "Lead" tag under the two leads. A blue rule closes the top.

3. THE SET ROWS
A label column on the left in blue in the headline font, then one cell per Pokémon, centred, with thin rules between rows:
- Item
- Ability
- Nature, with the raised stat in blue and the lowered stat in red on a second small line
- Moves: the four moves stacked as type-coloured bars, as the sheet has them today

4. THE STAT ROWS
- A heading "Stats · at level 50" with a blue rule.
- Six rows: HP, Atk, Def, SpA, SpD, Spe. Every other row has a faint band.
- Each cell: the stat as a big number, a small line with the stat points ("32 pts"), and a thin slanted bar whose length is that stat compared with the team's best in the same row.
- The best of the six in each row sits on a filled blue slanted plate with white text.
- A stat the nature raises is blue with ▲ before its points; a lowered one is red with ▼. The arrow carries the meaning as well as the colour.

5. THE THREE LAYOUTS
- Desktop: all six across; the whole sheet is one table.
- iPad: all six across, narrower. Names drop to the smallest text size and long move names wrap onto two lines.
- iPhone: two tapes of three (1–3, then 4–6), each with its own top row, set rows and stats. "Team best" is still judged across all six, so a tape can have a row with no blue plate.

6. WHERE THIS MAY CONFLICT WITH YOUR RULES
- "Team best" is new: the sheet does not compare the six today. It is worked out from the same six numbers and adds no data. Ties are both marked.
- The spread note ("Most common spread") is not drawn in the mock. It needs a place, for example under Nature.
- The Lead tag says "Lead" only; today's line is "↑ Lead vs the meta's top six". Keep today's wording somewhere if the short tag loses meaning.
- On iPhone the Pokémon names are in the body font, bold, because three headline-font names do not fit across. That breaks the "headlines in Unbounded" rule for that one spot. The alternative is two per tape and a longer sheet; Sim has seen the body-font version.
- On iPad the names are 13 px in the headline font.
- The faint band on alternate stat rows is a second shade behind the table; check it against "no boxes inside boxes".
- The giant outlined name and the outlined digits on the banners are decoration; the real name is the heading under the banner.
- Red and blue for lowered and raised stats, and white on PLOT blue for the plate: check contrast in both themes.

7. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- A team with fewer than six, and an empty team.
- Tapping a column to edit a set, and the editor open.
- A Pokémon with no item, fewer than four moves, or a spread that is not the most common one.
- What Share as Image produces (the share card is a separate redesign Sim has asked for).
- Widths between the three drawn, a 320-wide phone, and iPad landscape.
- Reduced motion, keyboard order and screen-reader text. It is a real table: it needs row and column headers so a cell is read as, for example, "Kingambit, Attack, 205, 32 points, raised by nature, team best".

8. WORDS THAT ARE NEW (Sim has seen them in the pictures; confirm before they ship)
"team best in that stat", "raised by nature", "lowered by nature", "pts = stat points (0–32)", "Stats · at level 50", the short tag "Lead", and the row labels Item, Ability, Nature, Moves.

9. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
team-sheet-desktop.png
team-sheet-ipad.png
team-sheet-iphone.png

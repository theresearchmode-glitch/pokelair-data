THE POKÉMON PAGE — SIM'S PICK: "THE ANSWER PAGE". Design brief, no code.

Sim chose this on Nov 15. Two pictures come with it (desktop 1440 and iPhone 390), each showing dark on the left and light on the right. They are mock-ups drawn inside your built v2 shell (branch claude/design6 at 423360bb) for Kingambit. Every number, name and sentence was read from today's info sheet for Kingambit (the sheet that opens when you tap a Pokémon), so nothing is invented. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 10 lists the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

WHY THIS PAGE MATTERS
Sim's words: this is the page that will bring most people in from Google, Pokémon are the stars of the site, and it has to be the best page on it. A visitor may land here first, knowing nothing about NastyPlot. So the page answers the questions a player has about a Pokémon, in the order they ask them, and each answer is shown in its own way instead of as rows of numbers.

What Sim passed on along the way, so please avoid: a wide type-coloured banner with the Pokémon on one side ("the most basic"), the same content in boxes under Info / Meta / Rating headings, plain rows of stat numbers ("so much thrown at us"), half-circle dials and 3D blocks for base stats.

THE BIG CHANGE, FOR YOU TO DECIDE WITH SIM
Today this is a sheet that opens over the page, with three tabs (Info, Meta, Rating) and a Forms tab where a Pokémon has forms. The mock-up is a full page on one scroll. A page needs its own address to be found from a search. How that fits with the sheet (page only, or the sheet stays for quick taps inside the site and links to the page) is your call with Sim. The tabs become six jump links.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything on today's sheet, with the same data, helpers and numbers:
- The Card, name, types; "On your team ✓" (or Add); Build Around It; Popular Sets.
- Rating, tier, rank ("#3 of 321 with results"); the three numbers (of teams, win rate, Speed at level 50) with their small lines.
- Info: Usually (the line and four move chips), Base Stats and Total, Abilities (name, share, text, note), Type Matchups (every row and the note), Speed at Level 50 (all six rows and the note).
- Meta: Typical set, Moves with shares and source note, Items with shares, Brought with (four partners, share, games, note).
- Rating: Why it rates N (the note and four bars with their lines), What the data says (six sources), Other tier lists and note.
- The Forms tab, where it exists. It is not drawn; see section 11.
Tapping a partner still opens that Pokémon. Nothing is removed.

1. THE TOP: "IS IT GOOD?"
- Desktop: the Card on the left, large, the same Card used everywhere else, with name and types on it. On the right: a small blue slanted tag with the rank and "Pokémon Champions · VGC doubles" in small capitals; the name as a very large headline; the rating as a huge number with the tier in blue beside it and "Rating · likely 93–98" under the tier.
- Under that, a thin full-width gauge from 0 to 100 with the likely range shaded and a marker at the rating.
- Then the three numbers in a row between thin rules, then Build Around It (filled), Popular Sets (outline) and "On your team ✓".
- iPhone: the Card on top, then the tag, the rating and tier, the gauge, the numbers, and the two buttons full width. The name shows once, on the Card.

2. BASE STATS (directly under the top; Sim wants it high on the page)
One slanted panel, title on the left and "Total 550" on the right.
- Six lanes, one per stat. Each starts with the stat's name on a slanted plate in that stat's colour. A streak of the same colour runs along the lane, thin and soft at the start, growing wider and stronger, and ending in a sharp point where the stat lands. The number sits just past the point in the headline font.
- Faint vertical guide lines behind the lanes and a scale under them: 0, 40, 80, 120, 160.
- Under the lanes, one bar split into the six colours, each part as wide as that stat's share of the total, with the stat's name on it (names hidden on iPhone).
- A colour per stat, always the same: HP green, Attack orange, Defense yellow, Sp. Atk blue, Sp. Def purple, Speed pink.

3. JUMP LINKS
Six slanted chips in a row (two per row on iPhone): Is it good? / How to build it / Who it teams with / What beats it / How fast it is / Why it rates 96.

4. EACH SECTION'S HEAD
A blue slanted square with the section's number, the question as a large headline, today's section name small under it ("Brought with", "Type Matchups", "Speed at Level 50"), and a thick rule.

5. SECTION 1, HOW TO BUILD IT (today's Usually, Typical set, Moves, Items)
Three columns on desktop:
- Typical set: Ability, Item, Nature, Stat points, each with a small capital label and the value large. Where today's value has two options ("Life Orb / Chople Berry"), the first is large and the second sits under it as "or Chople Berry". Then the Popular Sets button.
- Usually: the four usual moves as four large slanted slots, two by two, each filled with the move's type colour and fine diagonal lines, the move name in the headline font, and under it that move's share from the Moves list ("98% of sets") when it has one. Under the slots, today's Usually line.
- Moves and Items: today's lists with bars and shares, and the source note.
iPhone order: the four slots, Typical set, Popular Sets, Moves, Items.

6. SECTION 2, WHO IT TEAMS WITH (today's Brought with)
The four partners as a fanned hand of Cards, as in Winning Hands (outer Cards tilt more and sit lower). Under each Card, the share as a big number and the games count. Under the hand, today's note and a Build Around It button. iPhone: two by two, no tilt.

7. SECTION 3, WHAT BEATS IT (today's Type Matchups)
One scale of five boxes from danger to safe, left to right: 4× weak (deep red), 2× weak (red), Normal damage (grey, "Every other type"), Resists ½ (blue), Immune (dark blue). Each box has a coloured head and the type chips under it. The 4× weak box has a red outline. Today's note under the scale. iPhone: the five as stacked rows with the coloured label on the left. A row with no types (for example a Pokémon with no 4× weakness) should not leave an empty box; decide whether to hide it or show "None".

8. SECTION 4, HOW FAST IT IS (today's Speed at Level 50)
- Desktop: one horizontal line from 0% to 100% of the top 30 outsped, with "Outspeeds none of the top 30" under its left end and "Outspeeds all of the top 30" under its right end. Each build is a flag planted on the line at its percentage, alternating above and below: the Speed as a big number, the build's name, its small line, and "outspeeds N% of the top 30" in blue. The "What players run" flag is dark and the Pokémon's picture stands on the line beside it.
- The Trick Room build is a separate slanted strip under the line, since it is measured the other way round.
- Today's note under it.
- iPhone: the six rows as a list with a bar each, as today. The line does not fit a phone.

9. SECTIONS 5 AND 6
- Abilities: one bar across the width split by each ability's share (96%, 4.2%, 0.1%), then the abilities side by side (stacked on iPhone), each with a small square in its bar colour, its name, share and text, and today's note.
- Why it rates 96: a till receipt on the left, the same one as on Track Record (white paper, torn bottom edge, slight tilt, blue tape at the top): "NastyPlot", the Pokémon's name between stars, today's heading and note, the four reasons as line items with dotted leaders to their number, then "Rating" with the rating very large in blue, a barcode, and a blue rubber stamp with the tier. On the right, "What the data says" as six paper slips two by two, each with a blue top edge, then Other tier lists and its note. iPhone: the receipt, then the six slips in one column.

10. WHAT IS NEW, AND WHERE THIS MAY CONFLICT WITH YOUR RULES
New wording (Sim has seen all of it in the pictures; confirm before it ships): the six questions as headings and jump links; "98% of sets" on a move slot; "or ..." for a second option; "Normal damage" and "Every other type"; "Outspeeds none / all of the top 30"; "Rating" and the tier stamp on the receipt; "likely 93–98" beside the rating (taken from today's "Its rating is likely 93–98"); "Pokémon Champions · VGC doubles"; the trail "Meta › Ratings › Kingambit".
- The six stat colours are new and not in tokens.css. They must stay distinct from the type colours and pass contrast with white text on the plates (yellow is the weak one).
- Section order differs from today's tabs: build first, then partners, matchups, speed, abilities, and the rating's reasons last.
- The gauge, the streaks, the share bars and the speed line all need text equivalents for screen readers; the numbers are already on the page beside each.
- The receipt and slips are white paper with dark text in both modes, as on Track Record.
- The move slots are large type-colour fills with white text; check pale types.
- Fan tilts, tape, stamp and the streaks' shape are decoration; check them against your motion and "no boxes inside boxes" rules.
- The mock-up drops the level-50 note's placement beside the Speed number; keep today's wording wherever you put it.
- Being found from a search needs more than the look: its own address per Pokémon, a real page title and description, and content that is on the page without a tap. Not designed here.

11. KNOWN ROUGH SPOTS, AND WHAT IS NOT DRAWN (each needs a picture for Sim before it is built)
Rough spots in the mock-up:
- Desktop, How to build it: the middle column is shorter than the other two.
- Desktop, What beats it: the 4× weak and Immune boxes are mostly empty for Kingambit.
- The tier stamp covers the end of the barcode.
- iPhone: the page is about nine screens; How fast it is falls back to a list.
- Light mode was only checked at a reduced size.
Not drawn:
- A Mega, and a Pokémon with other forms (today's Forms tab).
- A Pokémon not on your team (the Add button), and a visitor with no team.
- A Pokémon with little or no data: no rating, no sets, fewer than four partners, one ability, no "Other tier lists".
- A Pokémon with one type, with no weaknesses or no immunities.
- Very long names ("Paldean Tauros (Blaze)") in the headline and on the receipt.
- iPad, widths between the two drawn, a 320-wide phone, keyboard order and reduced motion.

12. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No real player names beyond what the page already shows. No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
pokemon-page-desktop.png
pokemon-page-iphone.png

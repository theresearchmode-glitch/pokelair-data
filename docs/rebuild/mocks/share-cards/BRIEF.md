SHARE CARD — SIM'S PICKS: "THE SLAB", "PRINT" AND "AURORA", each in two shapes. Design brief, no code.

Sim chose these on Nov 14 after six rounds. Six pictures come with it: three designs, each tall (1080 x 1350, for Instagram, TikTok and phone feeds) and wide (1200 x 675, the shape of today's share card, for link previews). They are mock-ups drawn with the real sample team and today's real numbers. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 7 lists the conflicts I already know about. Please don't copy my mock CSS or class names; the real card is drawn on a canvas (ARB.card / ARB.poster), so build it your way. Preview before live: nothing goes live without Sim's go.

Sim liked all three and has not picked one. Ask her whether she wants one design or all three offered as styles in the share sheet, beside today's shape choice.

WHY THIS MATTERS
This is the picture people post and send to each other, so it represents NastyPlot. Sim's words: it must be eye-catching and have wow, but not kiddy. What she rejected on the way here, so please avoid: dark stages with spotlights and reflections (she hates this and asked never to see it again), flat blue-and-pink split backgrounds with dots and hard black text shadows ("kiddy"), neon grids and sunsets, and plain cream layouts with thin rules ("too classy, boring"). The three below are the middle ground she approved.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything the share sheet does today: the shape and kind choices, the display mode, Save, press-and-hold to save on a phone, the team link line, the saved-team poster, the file names, and the alt text. Every fact on today's card stays on the new ones: team name, the six with their items, a Mega mark, Strength Score and its word, "Beats or handles N of the top 30", the rank line, "Pokémon Champions · VGC doubles · Reg M-C", the logo, the tagline "Sharply raise your win rate." and "NastyPlot, unofficial fan tool". Same data and helpers. Nothing is removed.

1. WHAT ALL THREE SHARE
- The six are the Card: the same Card as the info sheet, Damage Calc, My Team and Winning Hands, in its dark version.
- The Pokémon breaks out of its Card: it is drawn larger than the frame, so wings, horns and fluff pass over the top and sides. The name stays inside the Card at the bottom; the item sits just under the Card in plain text.
- Colour comes from the player's own team. Backgrounds are built from the six Pokémon's type colours, so every team's card looks different.
- The Strength Score is the biggest thing after the Pokémon: one clean number in the headline font, white on dark or black on cream, with no outline, glow or shadow tricks.
- "Top tier" (the score's word) sits on a small slanted plate.
- Fine diagonal lines at low strength over dark areas, as on the site's panels.
- A team with a Mega shows "Mega" on its own line above the name, as on the Card everywhere else.

2. THE SLAB (Sim's and my first choice for impact)
- Near-black background. One bold slanted band of colour crosses the middle, fading from the first lead's type colour to the second lead's.
- The two leads are large Cards on the band, tilted a few degrees in opposite directions. The other four are small Cards in a row below, each tilted slightly.
- Tall: logo and format line across the top; team style in small blue capitals and the team name top left; the white score top right with the word on a white plate and "Strength Score" under it; the proof line centred above the tagline.
- Wide: all the words in a left column (logo, style, name, score, word, two proof lines, tagline at the bottom); the leads on the band at the right with the row of four under them; the format line small at the top right.

3. PRINT
- A framed print on cream. The picture is a panel filled with a saturated blend of the team's type colours, with the dark Cards on it: two leads large, four small below.
- Under the picture (tall) or beside it on the right (wide), on cream: style in blue capitals, the team name, the proof lines, the score in black with the word in blue (tall) or on a dark plate (wide), then a thin rule with the logo on a dark slanted plate, the tagline and the format line.

4. AURORA
- Near-black, with a soft glow of the team's type colours behind a fanned hand of six Cards (the fan from Winning Hands: each Card overlaps the next a little, outer Cards tilt more and sit lower).
- Tall: the white score at the top with its word on a white plate, the fan across the middle, the team name on a blue slanted plate below it, then the proof line and the tagline.
- Wide: the words in a left column as in The Slab, the fan on the right.

5. KNOWN ROUGH SPOTS IN THE MOCK-UPS
- Aurora, wide: the fan is small, so Card and item names are small and there is empty space under it. Aurora, tall: the bottom third is fairly empty and the end Cards touch the edges.
- Print, tall: the tagline wraps onto two lines. The colour blend for this team (red, green, blue) is a little muddy.
- The Slab: the leads' item names sit close to the row of four; in the wide shape one Pokémon covers the corner of its small Card and the band's left edge stops abruptly beside the score.
- All wide: the format line is about 12 px.
- The Slab, tall: the names and items on the row of four small Cards are small.

6. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- A long team name, and a name with "(sample)" (the mock drops "(sample)"; today's card shows it).
- A team with no leads worked out, fewer than six Pokémon, or no Mega; a team whose two leads share a type (the band would be one colour).
- A team with no score yet.
- The saved-team poster and the team-sheet image kinds.
- The light display mode: all three are one fixed look each, not a dark and light pair. Decide with Sim whether the share sheet's mode switch still applies.
- How the type-colour blend looks for dull or clashing type sets.

7. WHERE THIS MAY CONFLICT WITH YOUR RULES
- These are canvas drawings, not page layouts: the break-out sprites, tilted Cards, blurred colour blends and slanted band all have to be drawn in ARB's canvas code, and the fonts must be loaded before drawing.
- The card is not tied to the site's light or dark theme; cream and near-black are fixed per design.
- The leads being larger than the other four is new information on the card; today all six are equal. It uses the game-plan leads.
- Text on the cards is sized for a 1080 or 1200 wide image, not the site's type scale.
- The Card's dark version is used on every design, including the cream Print.
- Tilts and overlaps are decoration; nothing on a share card is interactive.

8. WORDS
No new wording. The cards use today's lines. "Strength Score" appears as a small label under the score's word.

9. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Dark and light both polished where both exist. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No names or emails collected. No model names in commits.

PICTURES
share-card-slab-tall.png (1080 x 1350) / share-card-slab-wide.png (1200 x 675)
share-card-print-tall.png / share-card-print-wide.png
share-card-aurora-tall.png / share-card-aurora-wide.png

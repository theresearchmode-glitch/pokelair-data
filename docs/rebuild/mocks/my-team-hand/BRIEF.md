# My Team: Sim's pick "The Hand" (Nov 14)

Sim, with the brief: "When you're done and have time, here the prompt for the my team page rebuild. ofcourse as always, we use our rules and design language this is just a rough." Our rules win; every change from the brief is listed for Sim. The brief as received (6 pictures beside this file, converted to webp):

MY TEAM — SIM'S PICK: "THE HAND". Design brief, no code.

Sim chose this on Nov 14 after several rounds of mock-ups, and asked for it to go to you for the live site. Three pictures come with it (desktop 1440, iPad 820, iPhone 390). Each picture shows dark on the left and light on the right. They are mock-ups drawn over your built v2 page (branch claude/design6 at 423360bb) with the real sample team and today's real data. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 8 lists the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

THE IDEA
The player's six are six Cards, the same Card the info sheet and the Damage Calc already use, laid out as a hand in three pairs: Lead, Back, Bench. Every set is readable at a glance under its Card. The page is built only from pieces Sim has already approved elsewhere: the Fight Night band and score belt from Home, the Card, the slanted Game Plan strip.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Every feature in docs/rebuild/inventory/A-team.md must still work (TEAM, SUG, MU, PLAY, SETS, EDIT, ADD, IO, SHARE). This brief changes how the top of the page and the Matchups stand-outs look, and where a few things sit. Same data, same helpers, same numbers, same wording unless listed in section 9. Nothing is removed.

1. THE BAND AND THE HEADER
- A thin band across the top, the same band as Home's "Tonight's main event": "MY TEAM" in the live colour, then "6 of 6 · Sun team · Legal for Reg M-C", then "Top 1% of tournament teams". On iPad and iPhone the band shortens (see the pictures).
- Under it, three parts in one row:
  - Left: the small label "Your corner", the team name as the headline, the win-rate sentence with the rank in bold, then the links "Why This Score?" and "Switch Team". The sample-team note and its two links stay where you have them today (not drawn in the mock).
  - Middle: the Strength Score belt from Home (the number, the word, "Strength Score").
  - Right: the three matchup numbers (good matchups, even, tough), and under them the four buttons in an even two-by-two block: Saved / Save Team, Share, Saved Teams, More. Same buttons and rules as today.
- iPad keeps the three parts in one row. iPhone stacks them: name block, belt, numbers, buttons.

2. THE HAND
- Three groups side by side on desktop: Lead, Back, Bench. Each group has a headline in the headline font with a short note beside it ("start the battle", "come in next", "stay out this game") and a thin rule under it. The Lead group's headline and rule are PLOT blue.
- Each group holds two Cards. The Card is your ms-card as it is: type-tinted face, glow, giant outlined name, the name, the type chips.
- On each Card, top left, a small dark slanted plate with the Pokémon's rating and tier ("94 S tier").
- Under each Card: the item in bold, the ability under it, then the four moves as bars with a type-colour left edge and a soft type tint, like the move bars in today's Set section.
- The Card the player is working on has a blue frame.
- Tapping a Card picks it (as tapping a tile does today). Groups follow the game plan exactly as today's Lead / Back / Bench do, including the player's own lead pick.
- iPad and iPhone: each Pokémon becomes one row, its Card on the left and its set on the right, with the type chips moved out of the Card to sit above the item so they stay full size. iPad shows the two of a group side by side; iPhone stacks them.

3. THE EDITING STRIP (replaces the Set section)
- Directly under the Hand: a slim strip with a blue left edge. It says "Editing" and the picked Pokémon's name, then only what the Card does not already show: Nature and Stat points with their "most run" notes. On the right: Edit Set, Info Sheet, Lock, Remove.
- The item, ability, moves, types and rating are no longer repeated, because they are on the Card. Sim asked for this ("shrink so we aren't repeating info").
- Lock and Remove move here from the line under the six. Set as Lead and "Use NastyPlot's pick" need a place here too; they are not drawn.
- Because the Set section is gone, the jump tabs are Matchups, Suggestions, Team Checks, then the Legal mark and Team Sheet as today.

4. THE GAME PLAN
The slanted Game Plan strip from Home, under the editing strip, with today's sentence.

5. MATCHUPS
- Full width on desktop and iPad, above the other sections.
- The heading, the sentence, the three counts, the split bar, the calc line and the four view buttons are unchanged.
- Stand-Outs view: each stand-out threat is a small Card (the same Card, smaller) with its verdict under it and "Calc disagrees: …" under that when it applies. Unfavoured first, then Favoured, as today. Then the line "The other 22 are even matches. See all 30 ›".
- Desktop shows up to 8 across, iPad 4 across, iPhone 4 across with the name under a small picture-only Card. A shorter last row is centred, never left-aligned.
- The other three views (Top 10, Top 12 Grid, All 30) are unchanged.

6. THE REST
Suggestions on the left; Team Checks, Things to Know and Your Games on the right. iPhone order: Matchups, Suggestions, Team Checks, Things to Know, Your Games. These sections are your built ones, untouched.

7. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- An empty team, and a team with one to five Pokémon (empty spots in the Hand; fewer than four means no Lead / Back / Bench yet).
- A team that is not saved (the main Save button), a team that is not legal, the "few real games" note, and the note about Pokémon that left the roster.
- The sample-team note in the header.
- Set as Lead and "Use NastyPlot's pick" in the editing strip.
- A picked Card other than the first; the editor open.
- Stand-outs counts other than eight (none, one, five, seven, twelve).
- Widths between the three drawn, a 320-wide phone, and iPad landscape.
- Reduced motion, keyboard order and screen-reader text. Each Card needs one clear spoken label (name, role, rating, item).
- Scrolling speed on Sim's Windows desktop: fourteen Cards each carry a glow. Your rule about sprite glow on mouse screens applies.

8. WHERE THIS MAY CONFLICT WITH YOUR RULES
- The Set section is replaced by the editing strip, and the "Set" jump tab is removed. Any test that looks for the Set section or that tab will need the new home.
- Matchups moves from the right column to full width above Suggestions and Team Checks. Your Nov 11 two-column balance note no longer applies as written.
- When the Matchups section became a direct grid item at full width, its size-container rule stopped the heading from laying out in Chromium in my mock. I switched the container off for the mock; you will want a proper fix.
- The headline uses Home's "fn" pieces (band, corner label, belt) on My Team. If those are meant to be Home-only, say so to Sim.
- The rating plate on the Card and the editing strip's tinted background are new small pieces; check their colours against tokens.css.
- iPhone threat names are in the body font at a slightly narrower width so four fit across. Check that against your type rules.
- iPhone is about six screens long for the whole page.

9. WORDS THAT ARE NEW (Sim has seen them in the pictures; confirm before they ship)
"Your corner" (on My Team), "start the battle", "come in next", "stay out this game", "Editing", "The other N are even matches. See all N ›".

10. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
my-team-hand-desktop.png
my-team-hand-ipad.png
my-team-hand-iphone.png
my-team-hand-top-only-desktop.png / -ipad.png / -iphone.png — the top section by itself, larger (drawn before the editing strip was added)

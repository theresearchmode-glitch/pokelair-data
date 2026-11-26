TEST RUN — SIM'S PICK: "THREE PILES". Design brief, no code.

Sim chose this on Nov 14 after several rounds (a road map and a tower were tried and dropped as confusing). Three pictures come with it (desktop 1440, iPad 820, iPhone 390). Each picture shows dark on the left and light on the right. They are mock-ups drawn from your built v2 Test Run page (#gauntlet, branch claude/design6 at 423360bb) with the sample team against all 20 teams the page lists, so every team, verdict, event and "bring" line is what the page works out today. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 6 lists the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

THE IDEA
All 20 top teams are dealt into three piles of cards on a table, by how the matchup looks: the teams that are better prepared than you, the ones where it's about even, and the ones you're better prepared for. The player works through the hard pile first and taps a card to flip it over and see what to bring. You are PLOT blue and they are the logo's pink, as on the new Compare and Battle pages.

What Sim found confusing in earlier versions, so please avoid: any bare score such as "3–6", "You 6 / Them 5" or dots. The count of answers only ever appears as a full sentence, on a flipped card.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything the page does today must still work: the tools bar, the eyebrow and headline, the lede, How it works, the three counts, all 20 teams with their verdict, placing, event, player count and six, the "Bring … up front, … in back" line, Matchup prep, Practice in Battle mode, Copy for Showdown, and the closing note with its "?". Same data, same helpers, same numbers, same order within each pile (least prepared first). Nothing is removed.

1. THE HEAD
The eyebrow, the headline "Your six vs the top 20." with "top 20." in PLOT blue, the lede and "How it works". The three count plates that sit beside the headline today are not here: the counts are the pile headers (section 3).

2. THE TABLE
One gridded table surface, the same one the Damage Calc uses, inside the page margins. On it: a title row "Three Piles" with one line of help, then the three piles side by side on desktop (the middle pile twice as wide), stacked on iPad and iPhone.

3. A PILE
- Header: the count as a very large outlined number in the pile's colour, beside a slanted filled plate with the pile's nickname, and under the plate the page's own wording in small text. A rule in the pile's colour closes the header.
  - pink: 6 · "The Problems" · They're better prepared
  - grey: 13 · "The Coin Flips" · About even
  - blue: 1 · "The Free Wins" · You're better prepared
- Under it, that pile's teams as cards.

4. A CARD
- A card has a thick left edge in its pile's colour and one offset edge behind it in a lighter shade, so it reads as a stack. Cards tilt by about one degree, alternating, on desktop and iPad; none on iPhone.
- Left: the team's first Pokémon, large, slightly overlapping the card's edge. Right: the placing as a headline ("Champion", "6th place"), the event shortened to "Puebla Regional · 333 players", and the other five Pokémon small in one row.
- Desktop: the pink and blue piles are one card wide, the grey pile two. iPad: every pile two wide. iPhone: one wide. A pile with an odd number centres its last card.
- The first card of the pink pile has a dark frame and a small dark tag, "Start here".

5. A FLIPPED CARD
Tapping a card flips it open. One is drawn open: the first card of the pink pile.
- A dark tag "Top of the pile", the team's full title, its full event line, all six, the verdict as a coloured headline ("They're better prepared"), then one sentence: "You have an answer for 3 of 6 of their Pokémon. They have an answer for all 6 of yours."
- "Bring these four" with the four pictured (the two leads larger) and today's line under them, then Practice in Battle mode, Copy for Showdown and Matchup prep.
- Desktop: the open card sits in the right-hand column under the blue pile, which has room. iPad and iPhone: it opens directly under the card that was tapped.

6. WHERE THIS MAY CONFLICT WITH YOUR RULES
- The page changes from a list that shows 3 of 20 with "17 more teams" to all 20 at once. iPhone is about five and a half screens.
- The verdict is no longer on every card; the pile says it. Screen-reader text for a card must still say it.
- The you-against-them bars and the "3/6 · 6/6" figures on today's cards are replaced by the sentence on the flipped card only.
- Pink for "them" is new, as on Compare and Battle; not in tokens.css.
- The cards' offset edge and slight tilt are decoration; check them against your motion and "no boxes inside boxes" rules.
- Event names are shortened on the cards (year and "Pokémon Regional Championships" dropped); the flipped card shows the full line.
- The table surface is the Damage Calc's; if that is meant to be calc-only, tell Sim.

7. WORDS THAT ARE NEW, AND NOT YET CONFIRMED BY SIM
Sim has seen all of these in the pictures and approved the design, but was asked twice whether to keep the nicknames and has not answered. Please confirm with her before they ship:
- "Three Piles", "The Problems", "The Coin Flips", "The Free Wins" ("Free Wins" says more than "you're better prepared" means).
- "Start here", "Top of the pile", "Bring these four".
- "We dealt all 20 top teams into three piles. Work through the pink pile first. Tap a card to flip it over."
- "You have an answer for N of 6 of their Pokémon. They have an answer for N of 6 of yours." (with "all 6" when it is six).

8. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- A card other than the first flipped open, and where it opens on desktop when it is in the middle pile.
- Matchup prep opened, and How it works opened.
- A pile with no teams, and a run where every team lands in one pile.
- Your team with fewer than six, or no team.
- Widths between the three drawn, a 320-wide phone, and iPad landscape.
- Reduced motion, keyboard order and screen-reader text. Each card needs one spoken label, for example "Champion, Gdańsk Regional, 758 players, they're better prepared. Tap to see what to bring."

9. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No real player names beyond what the page already shows. No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
test-run-desktop.png
test-run-ipad.png
test-run-iphone.png

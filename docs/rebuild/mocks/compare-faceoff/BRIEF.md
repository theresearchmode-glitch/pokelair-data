COMPARE — SIM'S PICK: "THE FACE-OFF". Design brief, no code.

Sim chose this on Nov 14. Three pictures come with it (desktop 1440, iPad 820, iPhone 390). Each picture shows dark on the left and light on the right. They are mock-ups drawn from your built v2 Compare page (branch claude/design6 at 423360bb) with Team A = the sample team and Team B = the first winning team (V2.cxGo('cur', 't:0')), so every name, number and sentence is what the page produces today. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 6 lists the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

THE IDEA
Home's Fight Night, for any two teams: a fight poster split in two colours, then a tale of the tape made of tug-of-war bars. Team A is always PLOT blue and Team B is always the logo's pink, everywhere on the page, so the reader always knows whose number they are reading.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything Compare does today must still work: picking each side (My Team, a saved team, an event winner, a pasted team), Change on each side, Swap A and B, the two sixes, What's Different with its sentences, every row (Strength Score with word and games, top threats only this team handles with "+N more", weak spots spread out, speed with fastest and slowest and "outspeeds N% of the top 30", weather / terrain, archetype), Why These Scores, Same on Both with its row count, and the closing note. Facts only, no prediction of the match, as today. Same data, same helpers, same numbers, same wording unless listed in section 7. Nothing is removed.

1. THE HEAD
The back link and eyebrow, the headline "Compare Teams", and "Swap A and B" at the right (under the headline on iPad and iPhone).

2. THE POSTER
- One wide panel split in two on a diagonal: Team A's half is blue (left), Team B's half is pink (right), each a gradient to a darker shade with fine diagonal lines. A tilted plate saying "VS" sits where they meet.
- Each half has, mirrored:
  - top: a white slanted badge with the letter (A or B), the team's name as a headline, its sub-line, and "Change";
  - the Strength Score as a very large white number with its word under it ("Top tier") and a small line "Strength Score · 659 real games"; behind it on desktop, the same number as a giant faint outline (decoration);
  - the team's hero Pokémon, large, toward the centre, with Team B's mirrored so the two face each other. The hero is the team's lead: the player's own lead pick for My Team, otherwise the first lead of its game plan;
  - along the bottom, all six small with their names.
- iPad: the same two halves side by side; no giant outline number; the six without names.
- iPhone: the halves stack, A on top and B below, with the diagonal seam between them and the VS plate on it.

3. TALE OF THE TAPE
A heading, then one band per number: Strength Score, Fastest, Slowest.
- Each band is one thick bar split into a blue part and a pink part in proportion to the two numbers, both slanted, meeting at a dark slash.
- Each part carries its number large at the outer end and its detail inside the bar (the score's word; for speed, "Garchomp · outspeeds 95% of the top 30").
- Above each band, its name centred. Beside the name, a small slanted tag in the leader's colour: "Team A ahead" or "Team B ahead". Strength Score and Fastest get the tag; Slowest does not, because slower is not simply worse. A tie gets no tag.
- iPhone: the number sits above its detail inside each part.

4. THE TWO COLUMNS
Side by side on desktop and iPad, stacked on iPhone. Each has a rule in its team colour and:
- a small letter badge and the headline "Only Team A handles" / "Only Team B handles", with the threats as small pictures and names, and "+N more" as today;
- then three small facts in a row: Weak spots spread out (✓ Yes in green or ✗ No in red, with the mark as well as the colour), Weather / terrain (in the team colour), Archetype.

5. THE REST
"What's Different" with today's sentences in two columns (one on iPad and iPhone), with "Team A" in blue and "Team B" in pink wherever they appear. Then the two folds, Why These Scores and Same on Both · 11 rows, closed, and the closing note.

6. WHERE THIS MAY CONFLICT WITH YOUR RULES
- Pink for Team B is new. It is taken from the logo and is not in tokens.css; the mock uses one pink for fills and a lighter one for text on dark. White text sits on both colours: check contrast in both themes.
- "Team A ahead / Team B ahead" is a new judgement. Today's page states differences without ranking them. It applies only to Strength Score and Fastest, where higher is plainly better.
- The poster is a strong coloured panel, unlike the quiet cards Compare has now. It is the same language as Home's ring, but bolder.
- The hero uses the game-plan lead, which Compare does not work out today for a team that is not yours.
- The giant outlined score is decoration and must be hidden from screen readers.
- On iPhone the detail lines inside narrow bar parts wrap to two or three lines.
- Small Pokémon names under the poster's six are narrowed to fit; check them against your type rules.

7. WORDS THAT ARE NEW (Sim has seen them in the pictures; confirm before they ship)
"Tale of the Tape", "Fastest", "Slowest" (today one row, "Speed (likely stat)"), "Team A ahead", "Team B ahead", "Only Team A handles", "Only Team B handles" (today "Top threats only this team handles"), "Strength Score · N real games".

8. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- Nothing picked, and one side picked: today's two "Pick Team" boxes need a version in this style.
- The team picker itself.
- The two folds opened.
- A team with fewer than six, a team with no score yet, and two teams with the same score.
- The other rows that can differ (the full list is in cxFacts): only the six that differ for this pair are drawn.
- "Your games" rows when the player has logged games.
- Widths between the three drawn, a 320-wide phone, and iPad landscape.
- Reduced motion, keyboard order and screen-reader text. Each bar needs a spoken form such as "Fastest: Team A 231, Garchomp; Team B 280, Excadrill; Team B ahead".

9. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No real player names beyond what the page already shows. No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
compare-desktop.png
compare-ipad.png
compare-iphone.png

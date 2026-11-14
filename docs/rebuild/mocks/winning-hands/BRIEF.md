# Meta > Tournaments > Winning Teams: Sim's pick "The Winning Hands" (Nov 14)

Sim, with the brief: "this is the prompt and images for the tournaments page. same rules as always you know the wave! tysm!" ... "just adding to the list". Our rules win; every change from the brief is listed for Sim. The brief as received (6 pictures beside this file, converted to webp):

META > TOURNAMENTS > WINNING TEAMS — SIM'S PICK: "THE WINNING HANDS". Design brief, no code.

Sim chose this on Nov 14. Six pictures come with it (list at the end). Each picture shows dark on the left and light on the right. They are mock-ups drawn over your built v2 page (branch claude/design6 at 423360bb) with today's real data and the live site's wording. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 7 lists the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

This brief covers the Winning Teams tab only. Events and Archetypes are not decided yet; Sim has seen first ideas for them and has not picked.

THE IDEA
Each winning team is a hand of six Cards, the same Card the info sheet, the Damage Calc and the new My Team use. The top three teams are fanned hands; the Champion's is the biggest. Every team after that is a compact row. It sits inside the Grandstand header and tabs you already built for Meta.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Every TOP feature in docs/rebuild/meta-features.md must still work (TOP-01 to TOP-07): the source line with its update date, team search with suggestions and chips, the Your Team strip and its checks, the team list with "More Winning Teams" and "Show fewer", and the card actions Load Team (confirm, Undo), Practice Against, Compare, Copy for Showdown. Same data, same helpers, same numbers, same wording unless listed in section 8. Nothing is removed.

1. THE HEADER
- Left: the eyebrow "Meta · Tournaments · Winning Teams", the headline "The teams that won it." on two lines with the second in PLOT blue, one sentence, and the facts line (90 teams · 32 official events · 58 last 7 days).
- Right, in the spotlight panel: the tag "Your team", the player's checks score as a big number ("4/4 checks", small line "the four basics"), their style chips (Sun, Tailwind), their six names written out, and their six as a small fanned hand of Cards. This replaces today's Your Team strip and carries the same information. With fewer than six Pokémon it shows today's line asking to add six.
- Below: the Pokémon / Tournaments tabs, and the switch Winning Teams / Events / Archetypes.
- iPad and iPhone: the spotlight sits under the headline block. On iPhone the small hand is left out and the six names stay.

2. THE CONTROLS
The search field "Search winning teams", then a switch between the groups with their counts ("Official events 32", "Last 7 days 58"), then the source line with its update date. The groups are today's sections; today they are headings on one long page, here they are a switch.

3. THE TOP THREE: THE HANDS
- A title row "The Winning Hands". When all three teams come from the same event, that event and its player count are said once in the line beside the title, and not repeated under each team. When they differ, each hand shows its own event.
- Champion: a gold slanted number plate "1", the word "Champion" as a headline, the "Official event" tag when it applies. Under it the six Cards fanned in an arc: each Card overlaps the next a little and tilts a few degrees, the outer ones sit slightly lower, and there is a soft gold glow behind the hand. Each Card has a thin gold bottom edge. Under the hand: the checks score with what is missing, the style chips, then Load Team, Copy for Showdown, Practice Against, Compare.
- 2nd and 3rd place: the same, smaller, side by side under the Champion, with silver and bronze plates and edges. Their Cards tilt less and overlap less, so every name stays clear of its neighbour.
- Card names sit in the part of the Card that is not covered by the next Card. A Mega shows "Mega" on its own line above the name.
- iPad: the three hands stack, each centred.
- iPhone: no fan. Each team is a three-by-two block of Cards with a very slight alternating tilt, with the placing, checks, chips and actions left-aligned.

4. EVERY TEAM AFTER THE THIRD: ROWS
"More Winning Teams · showing the top 3 of 90" opens the list. Each further team is one row between thin rules: a slanted number plate, six small Cards side by side (no tilt, no names on them), then the placing as a small headline with the "Official event" tag, the event when it differs from the one in the title row, the six names written out, the checks score and chips, and the four actions as links. At the end: "Show More · 81 left" and "Show fewer".
iPad and iPhone: the number and the six Cards on one line, the text under them.

5. KNOWN ROUGH SPOTS IN THE MOCK-UPS
- The small Cards in the rows and in the header hand have no names on them; the names are written beside or above.
- A long checks note wraps to an extra line, so rows are not all the same height.
- iPhone with the list open is about six screens for nine teams.
- The last sizing change to the 2nd and 3rd place hands was checked by eye on iPhone only.

6. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- Team search: suggestions, a chip, results with "Often with", and "no matches".
- The "Last 7 days" group selected.
- The "Replace your current team?" step after Load Team, and Undo.
- Your team with fewer than six Pokémon; no data at all.
- A group with fewer than three teams.
- Widths between the three drawn, a 320-wide phone, and iPad landscape.
- Reduced motion, keyboard order and screen-reader text. A fanned hand is six overlapping buttons: each Card needs one clear spoken label and a focus ring that is not hidden by its neighbour.
- Scrolling speed on Sim's Windows desktop: up to 24 Cards with glows at the top and six more per row. Your rule about sprite glow on mouse screens applies.

7. WHERE THIS MAY CONFLICT WITH YOUR RULES
- Today's sections become a switch. Tests that look for the section headings will need the new home.
- The Your Team strip moves into the header spotlight.
- Gold, silver and bronze are the same three colours as the Usage podium in the Grandstand brief; they are not in tokens.css.
- Cards are rotated and overlapped. Check tap targets on the covered edge of each Card.
- The Champion's glow and the Card glows are decoration; check them against your glow rules.
- The Card names in the 2nd and 3rd place hands use the headline font at a slightly narrower width so they fit. Check that against your type rules.

8. WORDS THAT ARE NEW (Sim has seen them in the pictures; confirm before they ship)
"The teams that won it.", "The Winning Hands", "the four basics", "Tap a Card for its info sheet.", "Show More · N left". The group name "Last 7 days" and the placings ("Champion", "Challenger · 4th place") are today's.

9. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No real player names collected or shown beyond what the live page already shows. No model names in commits.

PICTURES (dark left, light right)
winning-hands-desktop.png / -ipad.png / -iphone.png — the page
winning-hands-more-open-desktop.png / -ipad.png / -iphone.png — "More Winning Teams" opened (teams 4 to 9 as rows)

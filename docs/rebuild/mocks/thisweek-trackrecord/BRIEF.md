META: THIS WEEK AND TRACK RECORD — SIM'S PICKS: "THE FRONT PAGE" AND "THE RECEIPT". Design brief, no code.

Sim chose these on Nov 14. Six pictures come with this (two pages x desktop 1440, iPad 820, iPhone 390). Each picture shows dark on the left and light on the right. They are mock-ups drawn inside your built v2 shell (branch claude/design6 at 423360bb). Every number, name and sentence of data was read from the live site's This Week and Track Record pages as they stood on Nov 10, so nothing is invented. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Sections 5 and 10 list the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

Both pages reuse pieces Sim already approved in the Events and Archetypes brief: the ticket stubs (for winners) and the weather scenes (for team styles). Please build those once and share them.

WHAT SIM ASKED FOR
Bold, fun and creative, not kiddy. For This Week he picked the newspaper-style page over a bar "scoreboard" and a "line" chart. For Track Record he picked the receipt ("this is awesome haha") and asked for it to be even more fun.

PART A — THIS WEEK: THE FRONT PAGE

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything today's This Week page holds: the date range line, the This Week and Week before counts (teams and events), Share this week, Pokémon on the Move (Rising and Falling, each with last week → this week and the points moved), Most used this week, New Tech (kind, item or move, Pokémon, the two shares, the points, and the "N teams this week, N the week before" line), Winners This Week, Team Styles with every style's share and the change notes, New in Top Cut, the three "?" help tips, and How We Decide What Changed with its full text. Same data, same helpers, same numbers, same order. Tapping a Pokémon still opens its sheet; tapping a winner still opens the event. Nothing is removed.

1. THE MASTHEAD
Laid out like a sports page. A thin rule line with the date range on the left and "Updated Nov 10" on the right, in small capitals. Under it "This Week" as a very large centred headline. Under that, the two rows of counts on the left and the Share this week button on the right, then a thick rule.

2. POKÉMON ON THE MOVE (the part Sim asked to be improved)
- Two even halves: Rising on the left under a blue slanted tab, Falling on the right under a red one. On iPhone, Rising stacks above Falling.
- Each half opens with a headline panel for its biggest mover: a wide panel in that Pokémon's own type colours with fine diagonal lines, the Pokémon large and breaking out over the top edge, a small white tag ("▲ Biggest rise" / "▼ Biggest fall"), the name, the shares as a big headline ("27% → 33%"), and "of teams · ▲6 points". On desktop a large faint arrow sits behind the numbers, pointing up or down. A blue or red bar runs down the panel's left edge.
- Under the panel, the other three as rows: picture, name, "14% → 19% of teams", and the points on a solid blue or red slanted plate ("▲5 points").
- Blue for rising and red for falling use your good and bad colours.

3. THE REST OF THE PAGE, IN ORDER
- Most used this week: a band between two rules, five across. Each Pokémon stands on a tinted slanted plate in its type colour, with the share as a big number and the name under it.
- New Tech (left) beside Winners This Week (right), two even columns on desktop, stacked on iPad and iPhone. New Tech is rows: picture, a small "Move" or "Item" tag, the item or move as a headline, the Pokémon, the two shares, the team counts line, and the points in blue on the right. Winners are three ticket stubs, exactly as in the Events brief.
- The Weather (today's Team Styles): one tile per style using the weather scenes from the Archetypes brief, with the style name and share. A style that changed has a white outline and a small white note in two lines ("▲ 6 points" in blue or "▼ 4 points" in red, then "from 50%"). Nine across on desktop, three by three on iPad and iPhone. There are nine styles here, so a ninth scene is needed: Electric Terrain, drawn as a yellow field with slanted lightning lines.
- New in Top Cut: four even tiles (two by two on iPad and iPhone), each with a large picture, the name, and today's line.
- How We Decide What Changed: the fold, as today.

4. THIS WEEK: KNOWN ROUGH SPOTS IN THE MOCK-UPS
- iPad and iPhone: the two headline panels lose the big arrow and are plainer than on desktop.
- iPhone: "Mega Garchomp Z" wraps to two lines in its panel, and the Most used names are small and squeezed.
- iPad and iPhone: The Weather tiles are wide and mostly empty, with the change note stretched across.
- Desktop: New Tech's column is a little shorter than the three tickets beside it.
- The fold shows only the first sentence of its text in the mock-up.

5. THIS WEEK: WHAT IS NEW, AND WHERE IT MAY CONFLICT WITH YOUR RULES
New wording (Sim has seen all of it and said the new wording is fine): "This Week" as the big headline, "▲ Biggest rise" and "▼ Biggest fall", "The Weather" as the name for Team Styles with "Team styles: % of teams using each style" beside it, "Share of teams, last week to this week.", and "1st" on the tickets.
- The biggest riser and faller get far more room than the other three; today all rows are equal.
- The headline panels and the weather tiles are large colour fills with white text, the same in dark and light mode; check contrast on pale types and on the busy scenes.
- The Electric Terrain scene is new and is not in the Archetypes brief, because the Archetypes tab lists eight styles and This Week lists nine.
- The mock-up drops the help "?" beside three captions; keep them.

PART B — TRACK RECORD: THE RECEIPT

6. WHAT STAYS EXACTLY AS IT WORKS TODAY
Everything today's Track Record page holds: the question "How right have our ratings been?", the three counts (tracking since, days of ratings saved, events checked so far), the three steps and the fair-test line with its "?", Top-8 Teams by the Rating We Gave with its sub-line and four rating bands (each with "N of N Pokémon made a top 8" and its share), the verdict sentence, Biggest Hits and Biggest Misses with each Pokémon's full line and rating, the note about "Rated", Week by Week with its four lines and legend, Events Checked (34 events, newest first), and the link to How ratings work. Same data and numbers. Tapping a Pokémon still opens its sheet. Nothing is removed.

7. THE HEAD
Eyebrow, then the question as the headline on two lines, the second line ("our ratings been?") in PLOT blue. The three counts sit to the right on desktop and under the headline on iPad and iPhone.

8. THE RECEIPT
The proof is drawn as a printed till receipt.
- White paper with a soft shadow, a zigzag torn bottom edge, tilted about one and a half degrees on desktop and iPad, held at the top by a strip of see-through blue tape. Straight on iPhone.
- On it, top to bottom: "NastyPlot" as a headline, "* * * Track Record * * *", a dashed rule, the title and sub-line of today's bands block, then the four bands as line items with dotted leaders running to the share on the right ("Rated 90+ ..... 25%", with "11 of 11 Pokémon made a top 8" small under the band). Then a dashed rule, "Total" with a very large blue "20×" tilted a few degrees, the verdict sentence, a dashed rule, a barcode strip with a blue "Fair test" rubber stamp over its right end, and "The ratings never saw these events".
- Desktop: the receipt is a narrow left column and everything in section 9 sits to its right, ending level with the receipt's bottom edge. iPad and iPhone: the receipt is centred on top.
- The paper is white in both dark and light mode, on purpose.

9. THE CALLS, HOW WE CHECK, WEEK BY WEEK
- The Calls: Biggest Hits on the left and Biggest Misses on the right, three each (one column on iPhone, hits first). Each one is a paper slip: a row of punched half-circles down its left edge, the Pokémon on a panel of its type colours, its name and today's line, then a dashed tear line and "Rated" over the rating as a big number. A rubber stamp sits bottom right, tilted: blue "Called it" on hits, red "Missed" on misses. Slips tilt by under one degree, alternating; none on iPhone. All six slips are the same height.
- Under them, today's note about "Rated".
- How We Check: today's three steps as slanted plates with numbered blue squares and arrows between them (stacked on iPhone), then the fair-test line with its "?".
- Week by Week: today's chart on a full-width sheet of white paper, tilted about half a degree (straight on iPhone), with today's legend.
- Events Checked as the fold, then the How ratings work link.

10. TRACK RECORD: WHAT IS NEW, ROUGH SPOTS AND CONFLICTS
New wording (Sim has seen all of it and said the new wording is fine): the stamps "Called it", "Missed" and "Fair test"; "Total" and the pulled-out "20×"; the section names "The Calls" and "How We Check"; "Three we called and three we missed."; the small "Rated" label on each slip; "* * * Track Record * * *"; and "The ratings never saw these events" as the receipt's last line.
- "20×" is taken from today's sentence "more than 20× as often". If that figure is worked out live and changes, the big number must follow it, and the receipt needs a plan for when there is no verdict yet.
- The paper pieces are white with dark text in both modes, so they do not follow the theme; that is the design. Check it against "dark and light both polished" and tell Sim if you disagree.
- Tilts, tape, stamps, punched edges and the barcode are decoration; check them against your motion and "no boxes inside boxes" rules.
- The stamps overlap the bottom of each slip. On iPhone the longest line ("Rated only 57, won Sketch Academy Sunday Regulation M-C Tournament") runs under the stamp; it needs room.
- iPhone: "Mega Charizard Y" and "Mega Garchomp" wrap to two lines on their slips. iPad: the chart's axis labels are small.
- Desktop: the verdict sentence on the receipt wraps to three lines.
- The mock-up shortens one event name ("Amyverse VGC Champions Arena #18", without its emoji and "Cash Prize!"); use the name as your page shows it.
- Screen readers need the receipt read as a plain list, and each slip as one button, for example "Sneasler, rated 97, on 110 top-8 teams in 34 events, won 10 events. Called it."

11. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- This Week: a week without enough teams to compare; a week with fewer than four risers or fallers, or none; no New Tech; no New in Top Cut; the fold opened; the three help tips opened; what Share this week produces.
- Track Record: before any verdict is measured; fewer than three hits or misses; Events Checked opened; the fair-test tip opened; more than three weeks on the chart.
- Both: widths between the three drawn, a 320-wide phone, iPad landscape, keyboard order and reduced motion.

12. SIM'S STANDING RULES
Preview before live; nothing goes live without his go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No real player names beyond what the page already shows. No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
this-week-desktop.png / this-week-ipad.png / this-week-iphone.png
track-record-desktop.png / track-record-ipad.png / track-record-iphone.png

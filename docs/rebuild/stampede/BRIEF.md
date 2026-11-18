# Home: "The Stampede" (Sim, Nov 18). Brief from the other chat, kept word for word below; our rules win (RULES-FOR-BUILDERS.md)

## Building contract (main thread)
- Files: app/src/v2/pages/stampede.js (shared data V2.sdData(), page V2.sdPage(), after-hook V2.sdAfter()),
  stampede-hero.js (V2.sdHero, V2.sdHeroAfter), stampede-six.js (V2.sdSix...), stampede-tools.js (V2.sdTools...),
  stampede-post.js (V2.sdPost...). CSS: app/src/v2/css/sd-shared.css (bands, slants, overlaps; owned by the hero builder,
  others add only to their own file), sd-hero.css, sd-six.css, sd-tools.css, sd-post.css.
- Class prefixes: .sd-* shared, .sdh-* hero, .sds-* six, .sdt-* tools, .sdp-* post. (.st-* is taken by another page.)
- Each band builder edits ONLY its own two files (plus tokens.css for new --sd- tokens, plus v2-minors checks, plus
  stampede.js's V2.sdData only if a shared number is missing: say so in the report).
- Home's old draw stays in home.js behind V2.STAMPEDE until Sim's yes.
- The post band shows the small Post Room parcel + Dispatch front page from V2.postNow() (post-data.js) and should reuse
  the Post Room / Dispatch page pieces where they exist (one family).

## Main-thread adaptations already decided (logged in decisions.md)
- Score bands use the word list and band tokens ("Tournament ready", not "Ready").
- A returning player with a team: the line-up shows their six (and open rings for empty slots), the receipt shows their real
  Strength Score with its band word, the plan board uses their leads. A new visitor sees the mock-up's view ("?").
- Today's Home features: Import ("Paste it from Showdown" opens Import), the first-visit welcome, the weather word, the
  Champion's Load / Copy (on the Winning Teams plate) are kept; the rest live on other pages (to be listed per HOME test).
- Numbers and names come from live data (V2.sdData), never typed.

---

HOME PAGE REDESIGN: "THE STAMPEDE"

Attached: four mock-up pictures of the new Home page (desktop and phone, light and dark). They are flat pictures, not working pages. Please rebuild Home in the working copy to match them, and show Sim a preview before anything goes live.

THE IDEA
The whole page is made of NastyPlot's own data. Every rated Pokémon charges at the visitor in the hero. Six step out to become the visitor's team. Then the same herd regroups to show what each of the twelve tools does. A Pelipper flies in the post (gift codes and news) at the end. This replaces the current Home, including "Tonight's main event".

PAGE ORDER
Four slanted, full-width colour bands that overlap at their angled edges: blue (hero), ink (your six), beige (tools), red (post). Headings tilt with the bands. Length in the mock-ups: about 5 screens on desktop, about 5.8 on phone.

1. HERO (blue, fills the first screen)
- The tagline "Sharply raise your win rate." at full width, standing inside the herd: the distant crowd sits behind the letters and the top-rated Pokémon stand in front, their heads just touching the bottom of the second line. First line white, second line light blue.
- Every rated Pokémon is in the picture, sized by rating: the top four are huge in the front row, the next few mid-sized in the gaps between them, the rest shrinking back to a hazed crowd at the horizon. Speed lines converge on the horizon and the whole scene tilts.
- Each of the top four has a slanted white plate with its name and rating in large blue numbers. The mid-sized ones carry a small dark tag only where the tag can sit cleanly on its own Pokémon.
- The band ends in an ink ledge holding one line of text ("Every one of the 345 Pokémon NastyPlot rates is in this charge. The bigger it stands, the higher its rating, worked out from 13,826 real tournament teams." with a "See All Ratings" link), the buttons Score My Team and Build Me a Team, and below them a pink ticker of the next ratings down the list.
- The buttons must be visible without scrolling on desktop and phone.
- Phone: the top two are the big pair, each with a plate inset the same distance from its edge; two more stand clearly above them with tags.

2. CALL SIX OUT OF THE HERD (ink)
Three parts read left to right on desktop, top to bottom on phone, joined by matching blue chevrons on desktop.
- The line-up: heading "Call six / out of the herd." Six evenly spaced rings in one row. Three are taken by large Pokémon under light beams (Sneasler, Rillaboom, Incineroar), each with its name and its share of tournament teams. Three are open: dashed ring, plus sign, "Open". Below: "Let us build one from real winning teams, copy a top team, or type your own six.", the button Build Me a Team and the link "Paste it from Showdown".
- The Strength Score: a tilted white receipt with a torn bottom edge. Title "What's your Strength Score?", a huge blue "?" beside "/100", the five score bands as one coloured strip with their names (Missing a basic, Needs work, Solid, Ready, Top tier), what the report contains (Matchups, Suggestions, Team Checks) and the button Score My Team. A new visitor has no score, so it always shows the question mark, never a number.
- The plan: heading "Walk in with a turn 1 plan." A graph-paper board with their two leads at the top (Pelipper, Mega Venusaur, pink rings) and yours at the bottom (Mega Charizard Y, Garchomp, blue rings), arrows from yours to theirs, a line of text and the button Battle.
- All three parts end on the same baseline on desktop.
- Phone: one row of six rings with names; the percentages sit under the filled ones with a single caption, "Share of tournament teams using each". The receipt becomes a short wide ticket: question mark on the left, title and button on the right, bands as one strip, then "In the report: Matchups, Suggestions, Team Checks". The board is wide and short, with the Battle button full width below it.

3. SAME HERD. TWELVE TOOLS. (beige)
All twelve tools appear, each with its name, one plain line and a picture made from real Pokémon. They are plates of different sizes, not twelve equal cards, and every row is full.
- Speed Tiers: a full-width blue band where the nine highest-rated Pokémon run in order of base Speed, slowest to fastest, each with its Speed number in white and its name. The runners break out of the top of the band and overlap the heading.
- Type Chart: a wide white plate with all 18 type flags in their type colours; under each flag stands the highest-rated Pokémon of that type, named.
- Ratings: an ink plate with a podium of the top three and their ratings.
- Winning Teams: the six that won the latest event, standing in a row and named, with the event, date, players and record in the description.
- Battle: an ink plate with two Pokémon facing two others across a "VS".
- Damage Calc: one Pokémon striking another, with a health bar above the target.
- Four smaller plates in an even row, each with its picture breaking out of the top: Winning Cores (a pair with a plus sign), Archetypes (Sun and Rain chips with a Pokémon each), Test Run (one Pokémon against the top three), Popular Sets (a Pokémon with its item).
- Events and How We Calculate close the section as two mirrored blocks, with the big blue numbers 113 ("events") and 13,826 ("real tournament teams") at the outer edges.
- Phone layout, top to bottom: the race with four runners; the Type Chart as a six by three grid without names; Ratings beside Damage Calc; Winning Teams and Battle as short full-width strips; the four small plates as a two by two grid; Events and How We Calculate as two matching rows. Tool descriptions are shortened to a few words on phone.
- Dark mode: one card colour clearly lighter than the band, near-black for the feature plates, and a soft light rim on dark-coloured Pokémon so they do not disappear.

4. THE POST IS IN. (red)
- A large Pelipper flies in over the top edge of the band, with a few white speed lines behind it. Heading "The post is in." and, on desktop, one line of text beside it.
- Left column, "Mystery Gifts" with a link to all gifts: the kraft parcel from the Post Room page, with its white shipping label (contents, sent, collect by, the code with its digits in blue, Copy Code, barcode) and a red "5 days left" stamp; a row of perforated stamps for past gifts overlapping the parcel's bottom edge; then a second, smaller white label for the other live gift with its own code and Copy Code button.
- Right column, "Champions News" with a link to all stories: the Champions Dispatch front page, tilted, with dateline, masthead, lead story with an "Ended" stamp, more stories in two columns, and a black "Next event" bar at the foot.
- Both columns end at the same height on desktop.
- Phone: gifts first, then news. The parcel label is shorter (contents, collect by, code and button on one row), three stamps instead of four, and the Dispatch shows its lead story, two more stories and the next event.
- Dark mode: the paper objects go to the dim-paper and lamplight colours chosen for the Post Room and Dispatch pages.

WHERE EACH NUMBER AND NAME COMES FROM
- Ratings, rating order, types, base Speed and tournament usage come from the site's own Pokémon data, so the herd, plates, ticker, race, type flags and podium should be generated from live data and change when the data changes.
- 13,826 teams and 113 events are the site's current totals.
- The winning six is the latest event winner in the site's data: at the time of the mock-up, Amyverse VGC Champions Arena #18, Nov 9, 66 players, 9-1.
- The three Pokémon in the line-up show tournament usage, not ladder usage.

PICTURES THAT ARE ILLUSTRATIONS, NOT DATA
These are drawn to explain a tool and show no figure. Please either wire them to real data or keep them as plain illustrations, and tell Sim which.
- The Damage Calc health bar.
- The Battle match-up and the turn 1 plan board (leads taken from the winning six and a sample team).
- Pelipper and Archaludon shown as a "core".
- The Sun and Rain chips under Archetypes.
- The Test Run picture.
- Annihilape's Choice Scarf under Popular Sets (true for that winning team, not a popularity figure).

WORDING THAT IS NEW
Sim has seen these in the pictures but has not signed off the words: "Call six out of the herd.", "Same herd. Twelve tools.", "The post is in.", every tool's one-line description (long versions on desktop, short versions on phone), "Share of tournament teams using each", and the hero text line.

OPEN POINTS FOR SIM
- Gift codes and news in the pictures were copied by hand from another site on Nov 17 and the codes are unchecked. The live section needs its own permitted source before it ships.
- The item pictures on the stamps are stand-in drawings.
- Garchomp has no name tag in the desktop hero because there was no clean spot for one.
- Pelipper as the mail carrier is new and has not been separately approved.
- On phone, the names under the line-up are in the body font because the headline font collided at that size.
- On desktop, the plan board is taller than it is wide and the "Mega Venusaur" label runs close to its right edge.
- The mock-ups keep the site's existing header, footer and bottom tab bar unchanged.
- The mock-ups are still pictures. What moves (the charge, the ticker, the herd regrouping between sections) has not been designed; please propose it to Sim before building any motion.

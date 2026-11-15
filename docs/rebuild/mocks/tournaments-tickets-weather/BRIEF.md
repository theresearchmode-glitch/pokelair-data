META > TOURNAMENTS: EVENTS AND ARCHETYPES — SIM'S PICKS: "THE TICKET WALL" AND "THE WEATHER MAP". Design brief, no code.

Sim chose these on Nov 14. They finish the Tournaments tab: Winning Teams is "The Winning Hands" (already briefed). Twelve pictures come with this (four screens x desktop 1440, iPad 820, iPhone 390). Each picture shows dark on the left and light on the right. They are mock-ups drawn inside your built v2 page (branch claude/design6 at 423360bb) with today's real data: the events come from the events data, and the style counts, key Pokémon, tips and "what your team has" lines were read from the live page's Archetypes tab (44, 35, 31, 17, 15, 9, 7 and 6 of 90). Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Sections 5 and 9 list the conflicts I already know about. Please don't copy my mock CSS or class names; build it your way. Preview before live: nothing goes live without Sim's go.

WHAT SIM ASKED FOR
"Be creative, there's so much room to play around. Look at what each style actually is, maybe incorporate that into the design and have fun." For Events she wanted "ticket stub but more creative and with more character". Earlier tries she passed on, so please avoid: plain rows of small pictures, a bar-chart "skyline", hands of Cards for styles, and flat coloured bands.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Both tabs keep everything they do today. Events: the three counts, "What counts as an event?", Next Events, the All / Official / 100+ players filter, every event with its date, player count, name and winner's six, opening an event for its placings 1st to 16th, and Show More. Archetypes: all eight styles with their share and count, the description, Key Pokémon, How to beat it, What your team has, and the note that a team can count for more than one style. Same data, same helpers, same numbers, same order. Nothing is removed.

1. THE TOP OF BOTH TABS
Same as Winning Hands: eyebrow, headline, lede and facts on the left, a slanted plate on the right, then the Pokémon / Tournaments tabs and the Winning Teams / Events / Archetypes switch.
- Events plate: "Counted this regulation", the three counts, "What counts as an event?", Next Events.
- Archetypes plate: see section 9 (it is new).

PART A — EVENTS: THE TICKET WALL

2. A TICKET
Every event is a ticket stub.
- Colour: a solid, saturated blend of the type colours of the winner's first Pokémon, with fine diagonal lines over it. White text. The same in dark and light mode.
- Shape: scalloped left and right ends, a dashed tear line before the stub, and a punched notch at the top and bottom of the tear line.
- Left: the winner's first Pokémon, large, breaking out over the top edge, with a round gold "1st" seal tilted beside it.
- Middle: "Winner's team" in small capitals, the event name, and the other five Pokémon in a row.
- Stub (right): month, the day as a big headline number, the player count, and a small barcode strip as decoration.
- Tickets tilt by under one degree, mirrored left and right on desktop so the two columns stay even. No tilt on iPhone.
- An official event's ticket is gold and says "Official event" before "Winner's team". None of the newest 13 is official, so this is not drawn.

3. THE WALL
- The newest event is one large ticket across the full width, tagged "Latest result": the first Pokémon very large with its name under it, the event name as a headline, the other five named, a "See the placings, 1st to 16th" button, and a large stub.
- Under it, the next twelve as small tickets: two per row on desktop, one per row on iPad and iPhone. Then Show More.
- Thirteen are shown (1 + 12) so the two-column wall has no half-filled row.
- iPhone: the large ticket stacks (Pokémon and stub on top, the words and the five below a second tear line).

4. EVENTS: KNOWN ROUGH SPOTS IN THE MOCK-UPS
- On the small tickets the five other Pokémon are not named, and on iPhone they are small.
- iPad: the small tickets have empty space to the right of the five Pokémon.
- iPhone, large ticket: the five names are squeezed.
- Long event names wrap to three lines on iPhone.

5. EVENTS: WHERE THIS MAY CONFLICT WITH YOUR RULES
- The ticket colours are type colours used as large fills with white text, the same in both modes; check contrast for pale types (Electric, Ice, Normal).
- The first Pokémon being larger than the other five is new emphasis; it is simply the first one listed.
- The "1st" seal, the barcode, the notches and the tilt are decoration; check them against your motion and "no boxes inside boxes" rules.
- Tickets are cut out against the page background (the scallops and notches use the page colour), so they need to sit directly on the page, not on a card.
- The words "The Ticket Wall", "Latest result" and "1st" are new.

PART B — ARCHETYPES: THE WEATHER MAP

6. THE EIGHT SCENES
Each style is drawn as what it is, as a simple flat scene made of shapes, not an image file:
- Tailwind: a clear blue sky with wind streaks and two long curved gusts.
- Sun: a sun in the top right corner with rays over an orange sky.
- Rain: dark clouds along the top and slanted rain.
- Sand: blowing grain, bands of gusting sand, dunes along the bottom.
- Snow: falling flakes and a snowbank along the bottom.
- Grassy Terrain: a green field with grass blades along the bottom and drifting specks.
- Psychic Terrain: pink rings rippling up from the ground.
- Trick Room: a purple room in perspective, with lines running back to a glowing gridded far wall.
The scenes are the same in dark and light mode. Text on them is white.

7. THE MAP
- All eight scenes tile into one map. The bigger a region, the more top teams play that style. Regions are ordered biggest first.
- Desktop and iPad: three rows. Tailwind and Sun on top (tallest), then Grassy Terrain, Rain and Trick Room, then Sand, Psychic Terrain and Snow (shortest). Within a row, widths follow the counts.
- iPhone: Tailwind, Sun and Grassy Terrain each take a full-width row, each shorter than the one before; Rain and Trick Room share a row; Sand, Psychic Terrain and Snow share the last row. A bigger region must always mean more teams, so please keep that true at every width.
- In a region: a small rank ("No. 1"), the style name as a headline, the share as a very large number with "of top teams" and "44 of 90" beside it, and the style's key Pokémon standing along the bottom, the first one larger. Small regions show the count as one line ("9 of 90 teams") under the number, and fewer Pokémon.
- The whole region is the button: tapping it opens that style's guide (section 8).
- Under the map: "A team can count for more than one style, so the regions add up to more than 90 teams."

8. THE GUIDE (what a tapped region opens)
Two are drawn: Tailwind (six key Pokémon, four tips) and Grassy Terrain (three key Pokémon, three tips).
- Head: "Tailwind Guide" with "‹ Back to the Weather Map" on the right (under the title on iPhone).
- Banner: the style's scene, large. On it: the name very large, the share and count, the description, and all the key Pokémon standing in the scene, each named, the first one larger.
- Under it, two even columns (stacked on iPad and iPhone):
  - "How to beat it": today's tips as numbered steps, each number on a slanted plate in the style's colour, thin rules between.
  - "What your team has": today's rows, each with the Pokémon's picture, its name, what it carries, and a blue tick.
- "Other styles": a strip of the eight small scenes with name and share, to jump to another guide. Eight across on desktop, four on iPad, two on iPhone.
- I drew the guide as its own view in place of the map. If it fits your patterns better as a sheet over the map, that is your call; tell Sim.

9. ARCHETYPES: WHAT IS NEW TO THE PAGE (Sim has seen these; confirm before they ship)
- The plate at the top: "Your team's style", naming the styles the player's own team plays ("Tailwind + Sun" for the sample team), each with "49% of top teams also play Tailwind, 44 of 90". It uses the team's game-plan labels.
- "Your style" tags on those regions and in the guide, and "You" on the small scenes.
- The rank labels "No. 1" to "No. 8" on the regions.
- The names "The Weather Map" and "Other styles", and "‹ Back to the Weather Map".
Sim asked for two lines to be removed, so do not add them: a count such as "2 of your six carry an answer", and "No. 1 of 8" in the guide.

10. ARCHETYPES: KNOWN ROUGH SPOTS AND CONFLICTS
- iPhone map: the five smaller regions show one Pokémon each. Key Pokémon are not named on the map at any size; names are in the guide.
- iPad map: "Trick Room" wraps onto two lines.
- The page changes from eight fold-out guides in a list to a map plus one guide at a time.
- White text sits on busy scenes (rain streaks, sun rays, snow). I added a soft text shadow; check contrast, above all the small "of top teams" lines.
- Region sizes follow the counts by row, not exactly by area.
- Scenes are decoration and should stay still unless your motion rules allow gentle movement; respect reduced motion either way.
- Screen readers need each region as one button, for example "Tailwind, 49% of top teams, 44 of 90. Open guide."

11. NOT DRAWN OR NOT CHECKED (each needs a picture for Sim before it is built)
- Events: an official (gold) ticket; the Official and 100+ players filters; an event opened to its placings; after Show More; Next Events with events in it.
- Archetypes: a guide for a team with no answers to that style, and for a player with no team; the guides for the other six styles; a style with a 0 count; the map if the order or counts change a lot (two styles tied, or one style far ahead).
- Both: widths between the three drawn, a 320-wide phone, iPad landscape, keyboard order and reduced motion.

12. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. No boxes inside boxes. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No real player names beyond what the page already shows. No names or emails collected. No model names in commits.

STILL TO COME FROM SIM
Meta's This Week and Track Record are next on her list and are not designed yet.

PICTURES (dark left, light right)
events-ticket-wall-desktop.png / -ipad.png / -iphone.png
archetypes-weather-map-desktop.png / -ipad.png / -iphone.png
archetypes-guide-tailwind-desktop.png / -ipad.png / -iphone.png
archetypes-guide-grassy-terrain-desktop.png / -ipad.png / -iphone.png

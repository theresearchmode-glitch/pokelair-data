# NastyPlot cohesion theme: "the crew planning the job" (mock-up guide, Nov 21, 2026)

Sim approved the DIRECTION on Nov 21 (8:25-8:35 AM Eastern). Nothing here is built into the site yet. These rules are for
mock-ups of every page; after Sim picks, the real reskin follows them.

Why: a design review found about 12 separate looks (tickets, receipt, newspaper, parcels, graph paper, blueprint, podium,
weather map, 3D blocks, herd, frame, piles). A new player has to learn a new layout on every page. Sim wants one NastyPlot,
with the WOW and fun of his favourite pages (Build, the Damage Calc, Home), polished, and NOT so much info at once.

Reference mock-ups (open in a browser; they load the repo's own fonts and art):
- docs/rebuild/mocks/cohesion-nov21/ratings2.html, track2.html, events2.html (the approved direction, "v2")
- their shared stylesheet: kit2.css (EXTEND it for new parts; never fork it per page)
- pictures: docs/rebuild/pics/nov21/cohesion/v2-*.png
- kit.css / ratings.html / track.html / events.html are the earlier v1 (too plain, Sim: "we got rid of the fun"). Don't copy v1.

## 1. The idea
NastyPlot is your crew planning the job. Every page is one part of the plan, told in a playful scheming voice:
My Team = your crew, Ratings = the line-up, Events = the jobs, Track Record = the receipts, the Calc = plotting the hit,
Build = drawing up the plan. Kids play Pokémon: playful, never mean, never real crime words like "steal"
(Sim, Nov 21: the button is "USE THIS TEAM.", not "STEAL THIS TEAM.").

## 2. The shared kit (every page uses ALL of these; nothing page-specific replaces them)
1. Top bar: logo + Home / Build / My Team / Battle / Meta (as the site has now). Paper background (#F7F5F0).
2. Page header, always in this order:
   - kicker: a small black slanted chip, "SECTION · THE PLAN-NAME" (e.g. "META · THE LINE-UP");
   - headline: Unbounded, slanted, huge (clamp 40-84px), the key words in Plot blue (like Home's "Sharply raise your win rate.");
   - one lead line (17-18px, grey), real numbers in it;
   - the plot sentence: filters/controls written as a sentence with boxed blue words you tap ("Show me [everyone] [Megas]
     [no Megas] from [every event]"); the filled box is the one that's on. Hint under it: "Blue words are buttons."
3. The plan line: numbered steps (1, 2, 3...) in red circles down a red dashed line on the left. Each section of the page is
   a step. Section titles are big slanted Unbounded in the scheme voice + a short grey note ("The kingpin · #1 right now").
4. The roster card: ONE Pokémon card for the whole site. The Pokémon bursts out of the TOP of its card (art bigger than the
   card, overflowing upward), soft type-colour plate, the score big and slanted at top-left, the form on a small line above
   the name ("Mega" / "Paldean · Combat" / "Female"), the name slanted, ONE fact line. Sizes: hero (one star Pokémon),
   normal (rows of 6 on desktop, 3 on phones). Never squeeze or cut a name.
5. One big pink move per page (like Build's "HATCH IT."): the page's main action, slanted pink block with a black offset
   shadow ("BUILD AROUND IT.", "USE THIS TEAM.", "SEE HOW WE RATE."). Every other action is a quiet blue link with "›".
6. One verdict tag style: slanted, blue = good ("CALLED IT"), Nasty pink = bad ("MISSED"), "LIVE NOW" pink.
7. Margin scribbles: now and then a short red slanted note in the plotter's hand ("on almost half of all teams!"). At most
   one or two per page.
8. The hero matches the data (Sim: "the theme should match our data"): a receipt for a record, tickets for events,
   a roster for Pokémon, graph paper only for the Calc. A page gets ONE themed hero; everything else is the shared kit.
9. Colours mean the same everywhere: Plot blue #0078BF = tappable / key word; Nasty pink #E8364F = the one big action and
   bad verdicts; ink #17161A; paper #F7F5F0; type colours only on Pokémon/move plates. Colours as variables in kit2.css.

## 3. House rules (Sim's; a mock-up that breaks one isn't usable)
- Type scale only: 13/15/16/17/20/22/24/26/28/34 px (+ big display sizes for headlines and hero numbers). Spacing on a 4px grid.
- Unbounded (slanted) for headlines, big numbers, buttons; never under 15px. Instrument Sans for body and small labels.
- Taps at least 44px tall. No text cut with "…". No word broken mid-word. No lone tile alone on a row.
- No box inside a box inside a box (page > card, at most). Thin soft rules, not heavy lines.
- Use space well: no empty half on desktop, no half-filled rows.
- Less info at once: each card shows a score, a name and one fact; detail is one tap away. Prefer natural scrolling over
  folds/tabs (Sim, Nov 20). Phone length was "done" on Nov 20: don't make a phone page much longer than today's.
- EVERY feature of today's page appears in its mock-up (inventory today's page first; nothing silently dropped).
- Real data only: numbers, names, events from the site's own data. Never invent. If a page has no data in your copy,
  say so in the page's notes and use the numbers from the Preview/live page you can see; never make some up.
- Home is special (it keeps its own WOW); give it the shared top bar, card and colours, and keep its hero.
- Sim is he/him. COPPA: no player names or emails beyond what the site already shows publicly.

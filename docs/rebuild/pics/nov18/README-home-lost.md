# Four of today's Home features with no place on the Stampede (Nov 18, for Sim)

Mock-ups only. Each one is injected into the real built page (`--art=../src/v2/art/ --preview-data`) with page.evaluate and
addStyleTag; no source file was changed. Script: home-lost-mock.mjs. Real data in every picture (this Preview's saved copy, Nov 10).
Pictures: home-lost-<option>-<390|1440>-<light|dark>.png. Phones are shot at the spot (window 390 x 844, no fullPage).

Checked in every mock (the script's own pass): no sideways scroll, no text under 13px in the new part. Tap targets 44px. Colours are
tokens only. Not checked: the full polish sweep (these are not built).

## 1. HOME-04: the data line ("Most used in October, Showdown ladder. November's numbers arrive Dec 1.")
- **A, Usage page** (home-lost-h04a-*): the Showdown ladder's source line already names the month ("Oct 2026"); it gains
  ". November's numbers arrive Dec 1." (V2.homeNext, gone once that date passes).
- **B, footer** (home-lost-h04b-*): after "Data as of Nov 10.": "Ladder usage: October, Showdown ladder 1630+. November's numbers
  arrive Dec 1." On every page.
- **Recommend A.** Reason: the line explains the ladder numbers, and they now live only on the Usage page; on Home it would describe
  numbers that aren't there.
- HOME-04's test would move to the Usage page (it reads Home today).

## 2. HOME-05 / 05b: "This week in the ratings" (arrow + points; each opens its Pokémon)
- **A, the hero's ticker** (home-lost-h05a-*): the week's movers go first, each "Whimsicott ▲ 5 88"; the usual ratings follow. On
  desktop it starts with a "This Week" label linking to #weekly; on phones the label goes (no room).
  Same buttons as today's ticker (data-v2mon, spoken "up 5 points this week, rating 88").
- **B, This Week page** (home-lost-h05b-*): "Ratings on the Move" under "Pokémon on the Move" (that section is usage share, not
  rating): all 12 movers as tiles (sprite, name, rating, ▲/▼ and points). Two across on phones, auto-fill on desktop.
- **Recommend B, with A as an optional extra.** Reason: B shows all 12 movers and sits where weekly change already lives. A only
  shows the first one or two (the ticker is one line and drops what doesn't fit; 1 at 390, 2 at 1440, measured in the pictures).
- Measured (Nov 10 copy, V2.homeWeek(12)): 12 moves, one of 5 points, the rest 2 (4 up, 8 down).
- HOME-05/05b would move to This Week with B.

## 3. HOME-12: the first-visit welcome card ("Got It" hides it for good, cc2.welcomed)
- **A, in the six band** (home-lost-h12a-*): under "A sample team, here to show how NastyPlot works.": "New here?" with the three
  approved steps and the band's own buttons: Copy a Top Team (white slanted, as Build Me a Team) and Got It.
  A blue rule at its left, no box (ink band + text only).
- **B, a slim strip above the hero** (home-lost-h12b-*): "New here? 1 Get a team · 2 Read your Strength Score · 3 Plan each match."
  with Copy a Top Team and Got It, under the Preview note.
- **Recommend A.** Reason: it explains the sample team right where the sample stands, and keeps the hero filling the first screen
  (B pushes the hero down on phones, see the picture, and is the first thing a new visitor reads instead of the tagline).
- Words: the heading "How fight night works." belonged to Fight Night; A and B use "New here?" (the card's old eyebrow). For Sim.
- Length: A adds most of a phone screen at 390 (three steps with their lines; picture h12a-390). It could fold to the three bold step names on phones.

## 4. HOME-13: What's New (after an update only; never for a first visit; × hides it for good)
- **A, a paper slip in the post band** (home-lost-h13a-*): under "The post is in.", in the Post Room's paper colours, tilted as
  the code slip. Desktop: open, all 6 updates in 3 even columns. Phones: closed ("6 updates: Threat prep, Move accuracy…"), tap to open.
- **B, a slim bar under the header** (home-lost-h13b-*): "What's New · 6 updates: Threat prep, Move accuracy…" with ×, before the hero.
- **Recommend A.** Reason: site news belongs with "the post", and it keeps the hero's first screen whole. B is seen sooner, but every
  returning visitor after an update would get a bar above the tagline.
- Unsure: WHATS_NEW's items are from Oct 28 and use old words ("scouting report", "top meta threats your team is ready for", "win odds").
  They need rewording to the word list before this shows anywhere.

## What these mocks don't settle
- Motion: the ticker (5A) was shot with reduced motion. With motion on it scrolls, so more movers pass by.
- The final CSS would go in the band's own file (sd-six.css, sd-post.css, sd-hero.css) with v2-minors checks; none is built.

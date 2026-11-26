# Damage Calc "Arena": new weather/terrain art + scene polish (build brief)

Sim asked for this on Sat Nov 21, 2026 (around 4 AM ET). The mock-ups are in this folder. Show Sim screenshots before anything goes live.

## What Sim asked for
- The weather and terrain graphics "look really badly done… that whole graphic needs better". This applies to the rebuild's built Arena:
  app/src/v2/pages/calc.js (V2.ARN_ART) and app/src/v2/css/arena-calc.css.
- "Improve the UI in that box where the pokemon are. the health bars the layout everything. it just needs polish and alot of it."
- Colour rule (Sim, Nov 21): "colors should mean something… otherwise i dont want random color for no reason."

## The pictures (look at these first)
- before-after-phone.png, before-after-desktop.png: today vs the mock-up.
- all-skies-and-grounds.png: 12 phone states and 4 desktop states. Each is also saved as its own all-skies-and-grounds-*.png.

## The art: what to build
The source is source/art4.mjs. It holds the exact drawing code, so port it; don't redraw.
- **One seeded generator.** It's a plain function of (weather, terrain), so the same picture comes out every time. It replaces
  V2.ARN_ART's sun, clouds, hills, perspective grid and CSS-pattern rain/snow/sand/terrain fills.
- **Two inline SVGs:**
  - Sky: viewBox 1600x600, preserveAspectRatio "xMidYMax slice", filling the sky box (top: 0, height var(--arn-hz)).
  - Ground: viewBox 1600x500, "xMidYMin slice", filling top: var(--arn-hz) to the bottom.
  - Both are anchored at the horizon, so it never moves at any width.
- **Sky per weather:**
  - Every weather: a stadium band on the horizon with a rim of lights and 2 floodlight towers. The lights are on in rain, snow and sand.
  - Clear: soft cumulus clouds.
  - Sun: a sun disc in the open middle (x 820), rays, flares and a heat haze.
  - Rain: a heavy cloud bank and 3 depth layers of rain.
  - Sand: a pale sun behind dust bands, plus blowing grains.
  - Snow: overcast sky, snow-capped peaks and 3 layers of flakes.
- **Ground:**
  - A battle court in true perspective. The projection is P(X,z) = [800 + X*900/(1+z), 500/(1+z)]. It has the outline, centre line and centre circle.
  - Grassy: mowing stripes, grass tufts, flowers and green motes.
  - Electric: a glowing yellow grid and court lines, crawling bolts and sparks.
  - Psychic: glowing pink rings around the centre and floating motes.
  - Misty: fog banks and sparkles.
- **Weather on the ground:**
  - Rain: wet sheen, floodlight reflections, puddles and ripples.
  - Snow: snow cover and drifts.
  - Sand: sand ripples and drifts.
  - Sun: a warm light pool.
- **A terrain glow above the horizon** in that terrain's colour, so the terrain reads even when the Pokémon cover the ground.
- **Noise texture** on the ground (feTurbulence, overlay blend).
- **GOTCHA:** arena-calc.css has `.arn-ground path{fill:none;stroke-width:1;vector-effect:non-scaling-stroke}`. It flattened every court line to 1px and emptied the grass tufts. The mock puts the art in its own wrappers (.mk-s / .mk-g). Either do the same or remove that rule.
- **SVG ids must be unique on the page.** The mock prefixes them (sk*, gr*).
- **Same picture in day and night:** the scene's colours don't follow the site theme (as today: "the scene's colours are the same picture in day and night").

## The scene UI polish
The source is source/ui4.mjs. The mock does it with CSS overrides (CSS2…CSS6) plus a small DOM script (JS). In the build, put this in the real markup in calc.js and the rules in arena-calc.css, with values as tokens in tokens.css.
- **Weather and terrain rows:**
  - An icon per option (inline SVG, aria-hidden; the icons are in ui4.mjs). On phones the icon sits over the word; from 700px up, beside it.
  - The chosen option is a white slanted plate with a 4px foot in that option's colour.
  - Keep Q38 B: slanted shapes, no rounded pills.
- **Name plates:**
  - Both are the same slanted shape: clip-path polygon(0 0,100% 0,calc(100% - 12px) 100%,0 100%).
  - A 5px edge: pink for the defender, blue for the attacker. This matches the pads and the Attacker/Defender set cards.
  - Keep Q46 A: the plate is the button that opens "Choose the …".
- **HP bar (defender):**
  - Layout: an "HP" tag (white, slanted), then a 12px (14px from 700 up) slanted track with quarter ticks.
  - **Colours keep today's meaning:** green = HP left, pink = damage, green/pink stripes = the roll.
  - NO amber/red by HP amount. Sim's colour rule: red would clash with pink, which already means damage.
  - "31–41%" is in Unbounded slanted, then "HP left" in Instrument Sans.
- **Verdict:**
  - The move is a chip in the move's TYPE colour (use the move's real type token; the mock hard-codes Fire for Heat Wave).
  - Tighter padding. Desktop keeps l1 hidden (the big tag shows the %).
  - The desktop tag gets the same type chip.
- **Swap button:** a slanted white key, 54x48.
- **Pads:** a contact shadow under the feet.
- **Calm bands:** soft dark gradients behind the top and bottom rows (.mk-shade).
- **Bug fix (today's site):**
  - At 320 wide in Sun ("25% chance to knock it out"), the verdict overlaps the attacker plate and the terrain row.
  - Fix from the mock, under 380px: grid-template-rows 64px auto minmax(0,1fr) auto minmax(64px,auto) 64px, verdict l2 at 15px, and "HP left" may wrap (the % stays nowrap).

## Colour audit (every colour has a meaning)
- Weather/terrain icons, the chosen foot, the terrain glow: that weather's/terrain's colour (same family as today's terrain dots).
- Plate edges: attacker blue / defender pink, as the pads and set cards.
- Move chip: the move's type colour (the site's type colours).
- HP bar: green left / pink damage (today's meaning).
- Everything else is neutral: white, ink, dark plates.

## Checked in the mock (on the real built page, app/dist/v2.html#calc)
- measure.mjs at 320, 390, 820, 1100 and 1440 wide, for Sun / Rain+Electric / Clear+Psychic.
- Result: 0 buttons under 44px, 0 cut-off words, 0 overlaps between plates/verdict/tag/swap/rows, no sideways scroll.
- Today's page fails the 320 Sun case (2 overlaps).

## Still to check when building (not yet tested)
- **Speed:** blur filters and feTurbulence on older phones. Scroll with the scene on screen, and check long tasks (v2-longtask). If it's slow, bake the blurred layers or lower the particle counts.
- **Every pair:** all 25 weather x terrain pairs at 320–2560, light and dark, with experiments/polish-check.mjs (VIEWS=calc).
- **The usual run:** every test.yml job before pushing. Screenshots to Sim, and his OK before anything goes live.

## Files
- source/art4.mjs: the art generator. scene(weather, terrain) returns the .arn-bg replacement; CSS holds the wrapper rules.
- source/ui4.mjs: the UI polish. JS is the DOM changes; CSS2–CSS6 are the rules, in order.
- source/shoot.mjs: renders every state from the built page.
- source/measure.mjs: the measurements.

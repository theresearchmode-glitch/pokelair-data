# Battle on the kit: "The target" (brief for the next helper, written by HH, Nov 22)

Sim's pick (logged 1:26 AM Nov 22): concept 3 "The target", my RECOMMENDED one: "its much better. more cohesive."
Then (1:27 AM): "just still make it better more nasty plot and nicer more polished."
Nothing merges without Sim's yes on pictures.

## Start from
- The mock script: docs/rebuild/mocks/battle-3/c3-target.js (with shared.js, draw.cjs). It is drawn INSIDE the real built page.
  Its numbers are hard-coded for one example (Sneasler, Earthquake 76-90%, Weather Ball 96-113%).
- The picture Sim chose: docs/rebuild/pics/nov22/battle3/3-the-target-{1440-day,1440-night,390-day}.png.
- The page job recipe in docs/rebuild/reskin/queue.md (steps 1-6) and the Battle section of docs/rebuild/reskin/inventory.md.

## The idea (keep it)
Their biggest threat is marked as THE TARGET. Your whole turn one is aimed at it. The hero is its HP bar on the war-room night
panel: your turn-one hits stacked in real damage (low roll solid, high roll lighter, each in its move's type colour, symbol + word),
past 100% into "overkill", with their Fake Outs (or other priority/disruption) as the honest risk strip above it.
Below: who to bring (your four, leads marked), their six, the danger line ("Watch:"), The Read, Your Games.

## Must be real, not the mock's numbers
- The target = the opponent Pokémon the page already treats as the biggest threat (find where battle.js / The Read picks it).
- The hits = the calc the page already runs for your leads into it (same numbers as Damage Calc; no new maths).
- If your leads can't reach 100% together: say so honestly (no KO stamp; the bar stops short; the line says what's missing).
- If there is no opponent set yet, or too little data: today's empty/fallback states, kept.
- Every control, data-* hook, id, state and wording the tests read (inventory + C-battle) stays.

## Make it more NastyPlot and more polished (Sim's ask) — ideas to try, pick what earns its place
- The target mark: build it from the brand's own pieces (the slanted boxy shapes, the plot bars, Nasty pink), not a generic
  crosshair icon. Never redraw or recolour the logo; the brand kit is docs/brand/nastyplot-brand-assets/.
- The HP bar is a PLOT BAR: slanted ends like the site's bars, Unbounded slanted numbers, the KO point a hard pink line.
- Each hit's segment carries a small number pin (1, 2...) matching the hit list order, so the bar reads like the plan line.
- Tie to the Pokémon page's case-file language lightly (one word, not a theme park).
- Phones: the bar and the hits must read at 390 without sideways scroll; page no longer than today's at 390.
- Ask "could this be any other site?" before showing Sim.

## Done means
Tests (C-battle, kit-page, v2-overlap ROUTES=battle both themes, qcheck-all ROUTES=battle, v2-minors 3 parts, tap-size, any v2-*.mjs
that reads battle), phone height today vs new, labelled pictures (today vs new; 1440 day + night, 390 day + night), tag keep/battle-target.

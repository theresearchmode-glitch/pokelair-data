# The receipt in Pokémon colour (Job Z), first screens, Thu Nov 26, 2026, 1:18 PM Eastern (now.sh)
HH's helper, under HH's design authority **to propose only**. This is the fast loop: first-screen pictures first; polish and the full tests come after Sim picks.
- Branch: alt/public-home-v3, on alt/public-home-v2 e445a51a.
- Built with `--home=c1|c2|c3` (or `PUBLIC_HOME=c1|c2|c3 node public-site.mjs <dir>`). Default builds are unchanged.
- Data: origin/main 03cd5e41's out/ (not committed). Nothing was published.

Sim (Nov 26): "i like the receipt but it needs more color. our website is mainly colored by pokemon". All three keep the receipt, A's h1 and Score My Team on the first screen, and fill the hero with the winning six's own colours and art.

## c1. The crew behind the counter (RECOMMENDED)
- The champion's six as big official art (our art files, 220-400 px tall), crowding behind the receipt like a team photo: overlapping, front row cut by the frame.
- Behind them is a slanted band split in the team's two most common types (today Fire + Flying, named in the legend chip "The winning six's colours: Fire · Flying").
- The receipt is held up in front, tilted, with the 87, and the Reg M-D stamp on its own line at the foot.
- **Why I pick it:** it is the most "going like crazy" of the three, with The Stampede's energy, and every visitor sees the six Pokémon that actually won.

## c2. Type ink
- The receipt is printed in colour: each line on its own slanted strip in its Pokémon's type colour, with the type's name and symbol.
  - The sprite is big and breaks out of its strip.
  - The Rating is a fat white slanted number.
  - Plot bars run in the six type colours.
  - The 87 is in Nasty pink on an ink burst.
- The paper edges are tinted with the two main types.
- The page behind is a two-tone split of the team's two most common types, with a legend chip. The words sit on a slanted paper panel.
- It reads best of the three, and it is the receipt itself that carries the colour.

## c3. Receipt pile
- The last 6 winning teams' receipts fanned out. Each is headed in its lead Pokémon's type colour (named: "Fire lead", "Water lead"…) with its six peeking over the top.
- The newest winner's full receipt is on top, with the 87 and the stamp.
- A legend says the header colour is the lead's type.
- The least colour of the three (mostly paper). The a1 print animation could be added here.

## Checked so far (fast loop)
- `node app/test/v2-guard.mjs`: "v2 guard: clean (...)".
- First screens via t-scripts/shoot.cjs, 1440x900 and 390x844, light and dark:
  - 0 page errors and one h1 in all 12 runs.
  - No sideways scroll (scrollWidth 1425 / 375).
  - h1 + Score My Team on the first screen in all 12 (pictures).
- `SEO_DIST=site-c1|c2|c3 node app/test/seo-check.mjs`: "seo-check: ALL PASSED" for all three, including "3c. exactly one <h1> on all 28 rendered routes (all ok)".
- The stamp now lands on empty paper: its own line at the receipt's foot, never over words. This is HH's note from Job X, applied here.
- **Not yet:** every-width check, CLS, WebKit, keyboard/screen reader, design-review skill (after Sim picks).

## Known, to fix after the pick
- At 390 the first screen is mostly words. The colour starts just below (c1's band, c3's pile); c2 has colour behind the panel. If Sim picks c1 or c3, I'd bring a strip of the crew or pile above the fold on phones.
- In c3 the older receipts' heads crowd under the site header at 1440.

## Pictures (docs/rebuild/pics/nov26/public-home-v3/; c1's labels are green)
c1-crew, c2-typeink and c3-pile, each `-1440-light`, `-1440-dark`, `-390-light`, `-390-dark` (.jpg).

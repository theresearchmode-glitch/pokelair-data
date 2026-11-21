# The reskin: how to build it (draft for Sim, Nov 21, 2026, 10:36 AM; nothing starts until Sim picks the mock-ups)

Direction (Sim approved 8:35 AM): "the crew planning the job", docs/rebuild/mocks/cohesion-nov21/THEME.md; every page mocked up
(gallery https://claude.ai/artifact/125A9QyBTKYdvu6XixBu8L). This file is about HOW to put it into the real site safely.

## Three ways to build it
| | How | Good | Bad |
|---|---|---|---|
| A (recommended) | One shared kit in the real site (a new CSS layer + small JS helpers: page header, plot sentence, plan steps, roster card, big pink action, verdict tag), then each page's markup moved onto the kit one page at a time | One card / one header in code = cohesion that can't drift; tests keep their hooks; each page lands and is checked on its own | Most work up front (the kit), every page touched |
| B | CSS-only: restyle today's markup to look like the mock-ups | Fastest first result | Today's pages have ~12 different structures; CSS can't make them one system, it drifts again |
| C | Build pages from the mock-up HTML | Pixel-close to the mocks | Mocks have static data and no behaviour; every feature and test hook rebuilt by hand, high risk of lost features |

Why A: Sim's goal is one system that a new player learns once; only shared components in code guarantee that, and moving one
page at a time keeps every feature and test working between steps.

## Order (A)
1. The kit (no page changes yet): tokens (paper/ink/plot blue/Nasty pink/night), the six components, each checked alone at
   320-2560 light and dark (polish-check), with a kit test page.
2. The roster card replaces V2.mon everywhere it is the "Pokémon tile" (one card, three sizes). Biggest single cohesion win.
3. Page headers + plot sentences on every page (the filters stay the same controls, written as sentences).
4. Pages in Sim's priority order (THEME/PAGES): team, build, calc, home, pokemon, battle, tournaments, sets, usage, speed, types,
   sheet, box, compare, weekly, archetypes, news, gifts, gauntlet, practice, method, about, feedback, team-empty, notfound, owner.
   Each page = one change: built, its tests + polish-check + phone height vs today, pictures to Sim, then the next.
5. Batches of about 4 pages get the full check (behaviour A-D, v2-minors, qcheck-all) before a push (Sim's batch rule, Nov 19).

## Known risks / what changes
- Tests: many look tests measure today's layouts (qcheck-known, v2-minors spacing/lone-tile checks, the My Team frame checks).
  Each page's move updates its own look tests; behaviour tests keep working because the data hooks (data-*, ids) stay.
- My Team: the approved Night plot (copy nm2) is on hold; Sim's pick between mock A (paper) and B (war room) decides it.
- Home keeps its own hero (Sim); only shared parts move.
- Phone length: each page must be no longer than today at 390 (measured every time).
- Speed: roster-card art bursting out must not cost scrolling smoothness (one image per card, no filters on large lists;
  Sim's Nov 9 rule: no per-sprite layers).

## Size
Large: about 26 pages. With one helper at a time, roughly one page per 1-2 hours of work after the kit. Sim decides pace and
whether to raise the helper count for this.

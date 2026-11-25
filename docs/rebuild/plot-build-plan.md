# The Plot: build plan for the new Build page (DRAFT, Nov 20)

Status: Sim locked the direction (Nov 20, 7:51 PM) and wants it BEFORE the switch (7:52 PM). Nothing is built until Sim says yes to
the Q95 final design pictures (docs/rebuild/pics/nov20/Q95/). Mock-up source: scratchpad q90i/plot6.html (Q95), plot5.html (Q94).

## What today's page is made of (checked: read the files, Nov 20)
- app/src/v2/pages/build.js (205 lines): spec head (V2.buildHead, V2.bdSrcDefault), search (V2.buildHits), answer (V2.buildAnswer0),
  others (V2.buildOthers), cores (V2.buildCores, V2.buildCoreFind), winners (V2.buildWinners), tabs (V2.bdTab), why-score (V2.buildBrk),
  the page draw/after (V2.pages.build).
- app/src/v2/pages/build-sheet.js (105 lines): the Blueprint sheet (V2.bpModel, bpFig, bpSpec, bpMegaTip, bpRevs, bpNotes, buildSheet,
  bpPage, bpSheet0, bpPage0).
- CSS: about 330 Build rules in app/src/v2/css/pages.css (bp-*, bd-*), plus components.css and sugs.css.
- Click hooks the tests use: data-bdpick, data-bdjump, data-bdtab, data-bdwin, data-bdshow, data-bdcx, data-bdcteams, data-bdcprep,
  data-bdcpick, data-bdcore, data-bdccopy, data-hmload, data-hmcopy, data-hmprep.
- Tests that touch Build (grep for #build / bp- / data-bd): v2-back, v2-minors, v2-pbppair, v2-q83, v2-s16, v2-s17, v2-t1rules,
  v2-unbounded, behaviour/A-team, and behaviour/B-build (58 Build lines).

## Approach (my recommendation; reasons beside each)
1. Keep the data and logic, replace the drawing. The model (V2.bpModel), the build engine (ui.ab), search, cores and winners data stay;
   only the HTML and CSS change. Reason: the numbers are already tested; the risk is in the look.
2. Keep every data-* click hook name. Reason: the 77 B-build behaviour checks and the other tests keep working, so they prove nothing
   was lost.
3. Build in pieces, each pushed to the Preview with its own test and pictures, in this order:
   a. the plot sentence (before page): sources, Megas 0/1/2, the search plate, HATCH IT, helper columns, the plot line skeleton;
   b. the answer sentence + tags + Why This Score;
   c. the six on type-coloured plates + Load Team / Save / Copy;
   d. Why it works (notes) + Got a Plan B? (others);
   e. Plots that worked (winners) + Partners in crime (cores), no tabs on phone;
   f. the small fun (Flapple on the empty page, "The end. Or is it?"), dark mode, every width 320-2560.
4. New test v2-plot.mjs: every control present and reachable in the same taps as today (the Q94 feature table), 44 px targets, no
   text out of its box, the answer lines and plates at 320/390/768/1024/1440/1920, light and dark.
5. Then the full check (~40 min, batch rule), polish-check / qcheck-all "0 new", Sim's review on the Preview, then the switch.

## Open questions for Sim (ask with pictures when they come up)
- Today's phone tabs (Others / Winners / Cores) go away (Sim, Nov 20: no buried folds); phone length must stay under the rule.
- The fitted sentence sizes are off the type scale (e.g. 68.8 px); the rule allows display sizes --d64/96/120/168: snap to those or
  allow fitted sizes for this one sentence?

## Waiting list for when Sim says go on code (written during the PC-run hold, Nov 20 ~9 PM)

### Fix 1: My Team sample-note links on Windows at 820 (Sim's PC run, v2-q69 A1 + tap-size C8; GitHub passed both on 8c51ab30)
- Cause (read in the code, not yet tested on Windows): the Q69 fix gives the two stacked links "Build Me a Team ›" / "Import a Team ›"
  a 24 px row gap only at 700-819.98 px (pages.css line ~3356: `@media (min-width:700px) and (max-width:819.98px){.tm-sample
  .tm-sample-acts{row-gap:var(--s6)}}`). On Windows the text measures slightly wider, so at 820 the links still stack, but the gap
  rule no longer applies: 20 px links 19 px apart, each 44 px tap area lands on the other.
- Fix: give the row gap at every width (`.tm-sample .tm-sample-acts{row-gap:var(--s6)}`, no media query). A row gap only shows when
  the links actually wrap, so nothing changes where they sit on one line.
- Test: add 840 and 900 to v2-q69's A1 widths, and force a wrap (narrow the note) at 820/1024 so the test covers the Windows case
  on Linux too. Sim's PC re-runs v2-q69 and tap-size to confirm.

### Fix 2 (cosmetic, Windows only, seen Nov 19 and Nov 20): Home "/100" at 36.1 px; WK-1 stamp edge 1 px strip on Home 1440
- Look at the PC screenshots first; decide with Sim whether either is worth changing (GitHub passes both).

### The Plot pieces 2-6 (build order; each: own test + pictures for Sim's OK; full check per batch)
2. The answer (Q97 A / Q98): the "The plot:" eyebrow, the title by name length (plot-spec.md), the six standing on the red line with
   to-catch dots and data-v2mon taps, the upright score seal (Strength Score, number, band word), tags line, rank + breakdown +
   Why This Score ›, HATCH ANOTHER in the control row. Replaces bp head/score in V2.buildSheet; keeps .bd-ans / .bd-six hooks.
3. The six type-coloured plates (V2.bpFig → plate: tier chip, MEGA label, name, In your box / Not in your box yet, item, Ability,
   4 moves from the member's set) + Load Team / Save / Copy (data-bduse / data-bdsave / data-bdcopy unchanged).
4. Why it works (V2.bpNotes → four sentence lines + proven note) and Got a Plan B? (V2.bpRevs → three columns, six on a small red
   line, Switch to Plan X = data-bdshow).
5. Plots that worked (V2.buildWinners without the fold: Full sets ›, LOAD TEAM, Copy, Set as Opponent ›, Compare ›) and Partners in
   crime (V2.buildCores rows), no phone tabs (V2.buildJump goes); behaviour adapter reads may need the new hooks mapped.
6. "The end. Or is it?" + HATCH ANOTHER at the bottom, dark mode, 320-2560 widths, polish-check for Build, qcheck-all "0 new".
Tests to update along the way: v2-q83 (sheet result checks), v2-pbppair, v2-t1rules, v2-unbounded (allow list), behaviour B-build
adapter (answer/six/tags/options selectors). New: v2-plot.mjs (feature table taps, 44 px targets, the answer at every width).

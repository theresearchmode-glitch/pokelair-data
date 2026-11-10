# NastyPlot rebuild into the new design: the game plan

Sim, Nov 10: "start preparing towards a full scale rebuild into the new design ... this time I don't want seven different
designs stacked on top of each other ... the most clean optimized manner possible so that we are building a solid foundation
... absolutely zero features lost ... keep the Apple style sliders." Claude is in charge of the rebuild; Sim approves the
direction, each page's Preview, and the final switch. Nothing here starts until Sim says go.

Checklist: NastyPlot Plans page, section "Rebuild into the new design" (docs/foundation-plan.html, id "rebuild").

## Where we start (measured, Nov 10)

- 15 stylesheets, about 1.3 MB, with 10,488 `!important`. Newer layers beat older ones by stacking ever longer
  `:root:not(#_a)...` selectors (app/build.mjs `@R`, `@C`, `@A`), so every fix has to out-shout everything before it.
- The same stacking exists in JavaScript: theme modules (60-concept-h, 62-polish, 65-design-c, 70-riso2, 71-manga,
  74/75-arena-*, 76-slide) rewrite the markup after a page has already been drawn.
- The logic is separate and well tested: ratings, the Strength Score, matchups, suggestions, damage calc, data, saved
  teams and sync live in their own modules with app/test/run.mjs and the 16 CI checks. The rebuild leaves them alone.
- My Team today is about 4,270 px tall on desktop; the concept shows the same content in about 1,700 px.

## The rules that stop the stacking from coming back

1. One design system: one token file (colour, type scale, 4px spacing, corners, slant, shadows, motion), one base
   file, one component file, and a small file per page. Organised with CSS cascade layers, never by selector weight.
2. Zero `!important`, zero id-stacked selectors, no colour or size that isn't a token. A check in CI fails the build if
   any slips in.
3. Every page draws its final markup once. No module restyles or rewrites another module's output afterwards.
4. One component = one render function + one CSS block. A button looks like a button because it is the button component,
   not because a later layer forced it.
5. The logic modules keep their current tests. A rebuild step may change how something looks, never what it computes.
6. Old and new run side by side: the new site is a second build target in the same repository, sharing the logic. The
   live site stays on today's design until the switch, and the old build stays ready for an instant rollback.
7. When a page moves to the new design, its old CSS and theme code are deleted, so the old layers shrink to zero.

## Phases

### R0. Decide and freeze (with Sim)
- Lock the direction: the "flair" concept (breathable layout, the Pokémon and their colours carry it, plus NastyPlot's
  logo, Unbounded slanted headlines, tilted colour panels with rays, slanted plates, and the sliders).
- Settle the open design questions (list below).
- Look freeze on today's site: bug fixes and data/grade work continue; no more look polish.
- Agree the usage plan (heavy, see below) and whether helper agents may be used for the look-only audits.

### R1. Inventory: nothing gets lost (look-only)
- Feature inventory: every page, panel, button, tap target, slider, tab, sheet, setting, keyboard shortcut, empty,
  loading and error state, toast, share and export path, from a crawler plus a code read. Each feature gets an ID.
- Saved-data contract: every browser-storage key and database document the site reads or writes, frozen, so players keep
  their teams, box, settings and sync through the switch.
- Behaviour tests for each feature, written against today's site first (so they pass now), driven by what a player sees
  and taps rather than by CSS class names, so the same tests judge the new site.
- Baselines: page heights, scroll smoothness on Sim's Windows desktop, load time, contrast, polish-check counts.

### R2. Design system and full mock-ups
- Tokens, light and dark ("dusk, not black"), type scale (Unbounded slanted for display and numbers, Instrument Sans
  for body), spacing, corners, slant, shadow and glow rules, motion with a reduced-motion version.
- Components with one rule each: primary button, secondary button, link, chip (one slanted style; no rounded pills),
  slider (today's Apple-style slider, carried over as a first-class component), tabs, jump bar, tags (Lead / Back /
  Bench, matchup verdicts), sprite panel (tilted ray panel), score lockup, list row, table, sheet / modal, toast, empty
  state (Darkrai), form fields, search.
- Page templates: hero band, three-column work area, full-width table, story section.
- Mock-ups of every page, not just the three already drawn: desktop and phone, light and dark, with the word list and
  real data. Sim approves them section by section before any of that section is built.

### R3. The new foundation (Preview only)
- Second build target, cascade layers, tokens, base, components (sliders first), sprite pipeline (clean or navy line,
  with the sharper-art decision), the shell (header, navigation, phone bottom bar, search, footer, toasts, sheets).
- A living style guide page: every component at its narrowest and widest real size, light and dark. It is both the
  review page for Sim and a test target.
- The CI guard rails from the rules above, and the polish check rewritten for the new system.

### R4. Pages, one at a time
Each page: mock-up approved, build, behaviour tests green, polish check clean, Preview, Sim OK. Order (hardest and most
used first): My Team (with Team Sheet, saved teams, box, compare, share), the Pokémon info sheet, Home, Build (Build for
Me, cores, coverage, sets, add a Pokémon), Battle (battle mode, damage calc, speed tiers, type chart, practice, game log),
Meta (ratings, usage, teams, events, weekly, archetypes, track record), then method, about, legal, feedback, onboarding
and every empty, loading and error state.

### R5. The switch
- 100% of the feature inventory ticked; every behaviour test and all 16 CI checks green on the new build.
- Every window size from 320 to 2560 and odd shapes, light and dark; performance at least as good as the baseline;
  contrast passes.
- Sim uses the full new Preview for a few days on iPhone, iPad and the Windows desktop app.
- Sim says go; the switch is one publish; the old build stays ready for an instant rollback for two weeks.

### R6. Clean-up
- Delete the old stylesheets and theme modules, dead code and tests that only checked old class names.
- Rewrite CLAUDE.md's design rules for the new system; record the decisions.

## Open design decisions for R0

1. Sprites in the new design: clean renders on the colour panels (as in the concepts) or the thin navy line.
2. Sharper art: the result of the upscaling test from the redesign chat.
3. Bench Pokémon: full-colour sprite on a muted panel, or faded.
4. Chips: one slanted chip style everywhere (no rounded pills).
5. Dark mode: the "dusk" treatment on every page.
6. Motion: how much, and which one scene moves first.
7. Home hero: trimmed to fewer layers (my recommendation) or as drawn.
8. Helper agents for the inventory and screenshot audits: yes or no.
9. The before/after sheets: re-capture "before" from today's live site before showing anyone.

## What runs alongside

- Data and grade work continues (Player IDs, the sealed test from Nov 16, Accuracy Lab). Reg M-D may arrive mid-rebuild;
  it changes data, not design, and the logic is shared, so both builds get it.
- At most one site item in progress at a time still holds: during the rebuild that item is the rebuild.

## Size and time (my guess, not yet tested)

Heavy. Roughly R1 1-2 sessions, R2 2-4, R3 2-3, R4 one to two sessions per page group (about 8-12), R5 1-2, R6 1: about
15-25 working sessions. Background runs (sweeps, tests) are cheap. Helper agents would mainly speed up R1 and the
screenshot reviews (about 3-5 times the usage of doing them alone, for those steps only). Aim: finished before the
January 2027 launch, which would then launch on the new design.

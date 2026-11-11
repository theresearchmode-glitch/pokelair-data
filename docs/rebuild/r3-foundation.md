# R3: the new foundation (started Nov 11)

Goal: a second build of NastyPlot beside today's site. It shares all of today's logic (ratings, Strength Score, Build for Me,
Battle plans, sets, saved data and sync) and replaces only the look, built from docs/rebuild/design-system.md and the approved
mock-ups (NastyPlot Full Redesign artifact). The second build is published to the redesign artifact only; live stays on today's
design until the switch (R5).

## What today's build is made of (measured, Nov 11)

- `app/build.mjs` joins the 111 parts listed in `app/parts.json` into one page, then `app/slim.mjs` trims it to about 3 MB.
- **CSS, about 1.3 MB in 16 files.** The layers were stacked one on top of another, each one winning with longer selectors:
  style.css, polish.css, concept-h.css, then theme/ riso, manga, color, desktop and arena. None of it is reused in the new build.
- **JavaScript, about 1.45 MB in 87 files under `app/src/app/`.** They come in three kinds:
  1. **Logic only:** state, saved data and sync, sets, the rating, the Strength Score, team strategy, the game plan, threats,
     archetypes, Build for Me, coverage, the fix planner, the win model, the damage calc maths, the Showdown paste, items,
     confidence. The new build reuses all of it as is.
  2. **Logic and drawing mixed in one file:** for example `08-render-all.js`, `25-ratings-page.js`, `47-battle-mode.js`,
     `39-damage-calc-speed.js` and `40-turn-one.js`. Each of these is one function that works things out and writes HTML.
  3. **Reskins:** `60-concept-h.js`, `61-concept-h-pages.js`, `70-riso2.js`, `71-manga.js`, `74-arena.js` and the `75-arena-*.js`
     files. They wrap or rewrite the drawn HTML after it is drawn. None of these is reused in the new build.

## The approach

1. **Second build target.** `app/build.mjs --v2` reads `app/parts-v2.json`, which lists:
   - the shared logic files (kind 1) and the data;
   - a new `app/src/v2/` folder: `head.html`, the `css/` files in cascade layers (`@layer tokens, base, components, shell, pages`,
     so no selector ever needs to out-shout another), `shell.js` and `pages/*.js`;
   - nothing from kind 3.
   Its output is `app/dist/v2.html`. Today's `dist/page.html` is unchanged.
2. **Pull the logic out of the mixed files (kind 2), one file at a time, on today's code.** For example, Battle's "work out the
   plan" goes into a function that returns data, and today's page draws from it exactly as before. The behaviour tests guard every
   step, and today's site must stay identical (checked the same way as the Hurricane fix: the group's tests, then all the site's
   checks). The new pages then draw from the same functions. The work is done once and kept in sync automatically.
3. **Foundation first, then pages (R4).** R3 builds the tokens, base and components from the design system:
   - the components: filled plate, outline button, link, slanted chip, tabs, jump bar, slider, Pokémon on a floor, tilted
     selection panel, score lockup, forms strip, list row, table, sheet, toast, empty state with the underdog, field and search;
   - the shell: header with Home, phone bar, search, footer, frosted team dock;
   - a living style guide page showing every component at its smallest and largest real size, in day and night.
4. **Guard rails in the checks:** fail the build on `!important`, id-stacked selectors, sizes off the type scale, spacing off the
   4px grid, and colours that aren't tokens. The polish check is pointed at the new build.

## Order of work in R3 (each step committed, tests green, today's site unchanged)

- [x] rb3-build: the `--v2` target with an empty shell page, and its own check that today's page is byte-for-byte unchanged (Nov 11)
- [x] rb3-core: tokens, base, components, sprites (the upscaled art in one place, swappable, per the ownership rule) (Nov 11:
  plate, outline button, link, chip, type chip, tabs, slider, field, Pokémon on a floor, tilted selection, score lockup, forms strip,
  sheet, toast, underdog, team dock; every colour, display size and type colour is a token)
- [x] rb3-core: the shell (header, navigation, phone bar, search, footer, sheets, toasts, team dock) (Nov 11: V2.sheet keeps focus
  inside and returns it on close, locks the page behind, closes on ✕ / Escape / outside tap; search from the header or the / key finds
  pages and Pokémon; V2.openMon is the hook the full info sheet replaces in R4)
- [ ] rb3-guide: the living style guide page, published to the redesign artifact for Sim
- [x] rb3-guard: guard rails and the polish check for v2 (Nov 11: `app/test/v2-guard.mjs` runs before every `--v2` build and on
  GitHub; it fails on !important outside reduced motion, id selectors, sizes off the type scale, spacing off the 4px grid and colours
  outside tokens.css, and was proved by planting one of each. `TARGET=v2 node experiments/polish-check.mjs` measures the new build.
  Known checker limit: it counts a tab's small count number as a second line ("uneven" on tabs is a false positive).)
- [ ] First logic extraction (Battle plan / turn one), proving the pattern before R4

## Size (my guess, not yet tested)

Heavy, about 2-3 sessions as planned. The logic extractions in step 2 are spread across R4: each page pulls out its own logic
just before that page is built.

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
- [x] First logic extraction (Battle plan / turn one), proving the pattern before R4 (Nov 11):
  - `turnOneData()` (40-turn-one.js) and `battlePlan()` (47-battle-mode.js) work everything out and return plain data and plain
    text; `drawTurnOne()` and `renderBattle()` only draw. `bmWatch()` now returns plain text too (the drawing escapes it).
  - Proof of same output: `experiments/same-battle.mjs before.html after.html` renders Battle for 34 real tournament matchups in
    5 settings each (weather, Trick Room, Tailwind, Intimidate, paralysis, 2 of theirs) and compares the HTML: 170 of 170
    identical. It could fail: changing one word in a copy made 22 of 170 differ.

## The pattern for every R4 page
1. Save today's `dist/page.html` as the "before".
2. Move the page's working-out into a `xxxPlan()` / `xxxData()` function that returns plain data and plain text (no `esc`,
   no HTML); today's render function draws from it, escaping as it draws.
3. Prove same output with a same-output check like `same-battle.mjs` (real data, several settings, and shown to fail on a
   planted change), plus the page's behaviour tests and every check GitHub runs.
4. Only then does the new page in `app/src/v2/pages/` draw from the same function.

## Size (my guess, not yet tested)

Heavy, about 2-3 sessions as planned. The logic extractions in step 2 are spread across R4: each page pulls out its own logic
just before that page is built.

## R4 start: the new build runs today's logic (Nov 11)
- `parts-v2.json` "logic" lists today's files in today's order, inside today's closure (00-main.js opens it); the v2 shell and pages
  come after, so they call the same functions. 26 files today. `src/v2/bridge.js` answers the hooks the logic calls
  (`render`, `scheduleRender`, `safe`) by redrawing the new page.
- Moved into shared logic files, unchanged, with same-output proof on today's page:
  - `58-strength.js`: the Strength Score's working-out (was in 60-concept-h.js). My Team 54 of 54 identical.
  - `05-data-clean.js`: the daily data cleaners (were in 29, 49, 63-practice, 63-weekly, 64-track). The 7 cleaned documents
    are byte-identical.
  - `fixMetaSrc()` (08-render-all.js): the usage-source fallback that sat inside render().
- `experiments/same-score-v2.mjs`: for 48 real teams the new build gives the same Strength Score, band word, how-sure word and
  Matchups count as today's page (48 of 48).
- Transitional (honest note): some mixed files are included whole for their logic (08-render-all, 09-quick-add,
  19-showdown-paste, 29-fix-planner, 39-damage-calc-speed). Their drawing functions are never called in the new build. Each is
  split when its page is rebuilt, and the drawing half is left out then.

## R4 My Team: Suggestions (Nov 11)
- Shared now: `planListOf()` and `applyPlan()` (29-fix-planner.js), `CH.sideGrades()` and `CH.gradeMove()` (58-strength.js),
  `clearCaches()` (08-render-all.js). Today's render, CH.sugs and the click handler call them; the rebuild calls the same ones.
- The rebuild runs today's planner (`planFixesG`) in 30 ms slices like today's page, and its bridge does what today's render
  does on every redraw: save the team (`persist`), pick the usage source (`fixMetaSrc`, after the daily documents land) and
  empty the calculation caches (`clearCaches`).
- Two hidden dependencies found by comparing outputs (lesson for every page): shared code that calls an optional function only
  when it exists (`typeof abY === 'function'` in the planner: Build for Me's strength adds 20 candidates) or calls one inside
  a try block (`LANE.apply`, 36-lanes.js: drops swaps too small to matter). Missing from the rebuild, both failed silently and
  changed the suggestions. Fix: 22-auto-build.js and 36-lanes.js in the rebuild's logic.
- Proof: `experiments/same-sugs-v2.mjs`, 25 real teams (every third with a weak slot): the same suggestions in the same order
  with the same Strength Score change on both builds (25 of 25; 23 have suggestions). It fails when the lane step is removed
  (6 of 9 differ). `experiments/same-team.mjs` now waits for the planner and compares Suggestions too.
- Apply and Undo checked by hand on the new page: 62 → 84 as the card says, saved, Undo restores and is saved after reload.

## R4 My Team: Team Sheet, Save Team, Saved Teams (Nov 11)
- Shared now: `sheetData()` / `natBits()` / `SHEET_STATS` (39-damage-calc-speed.js, Team Sheet numbers; same-sheet.mjs 42 of
  42 identical, a planted +1 makes 42 differ), `copyText()` (06-helpers.js), and a new `30-saved-data.js`: `saveTeamAs`,
  `openSaved`, `renameSaved`, `deleteSaved` and `savedRows(sort)` (today's save panel, Saved Teams buttons and Saved Teams list
  call them). `slotsPaste()` moved beside `exportPaste()` (19-showdown-paste.js).
- Proof: `experiments/same-saved.mjs` runs 38 steps through today's buttons (save, update, cancel, open, Undo, rename, delete,
  the 10-team limit, a 4-Pokémon team) and compares the saved teams, the open team, what the page shows and the Saved Teams list
  in each sort: 38 of 38 identical. Planted changes are caught (no Undo on Open: 24 differ; a reversed name sort: 1 differs).
- New build: Team Sheet and Save Team open as sheets; Saved Teams is a fit-to-content sheet of cards (the six, Strength Score,
  checks, Open now; Open, Copy for Showdown, Rename, Delete with confirm; Newest / Name / Matchups slider). Cards line up across
  a row (subgrid); an odd count gets a "spots free" card so no row is half empty.
- Still to come on the new build: Compare (with the Compare page), "Your games" with a saved six (with My Record).
- Question for Sim: today's "Readiness" sort orders saved teams by Matchups, not by the Strength Score on each card. Kept as is
  (labelled Matchups); switch it to the Strength Score?
- Lesson: my earlier "320-2560 clean" sweep of My Team checked inside the sheet, not the page itself. The Team Sheet button made
  the page 83 px wider than a 320 phone; the polish check had flagged it (hscroll). Every sweep now also checks the page width.

## R4 My Team: Edit Set (Nov 11)
- Shared now (`31-set-edits.js`): the changes (`setAbility`, `setItem`, `moveSlotSet`, `setNature`, `savePoints` and their
  resets, `toggleLock`, `clearSlot`, `addMon`) and the lists each picker offers (`abilChoices`, `itemChoices`, `moveChoices`,
  `natureChoices`). Today's editor changes sets and draws its dropdowns through them; `33-move-edits.js` joins the new build.
- Proof: `experiments/same-edits.mjs` drives today's editor through every kind of edit (good and bad stat points, every
  reset, lock, remove, Undo), then opens the pickers on 4 more tournament teams and 6 rarely used Pokémon, comparing the slots,
  the message, the warnings and the editor's whole HTML: 41 of 41 identical. Today's page against itself: 41 of 41 once its
  delayed decorations are left out (arena colours, clear-button wrappers, sprite retry counters). A planted change: 3 differ.
- Check-writing lessons: a helper named `CH` silently collided with the page's own `CH` (half the steps did nothing and
  still "matched"); `\d` inside a template string loses its backslash. Every check now prints what each step did.
- New build: Edit Set sheet (strip of the six; Ability | Item, Moves 2 x 2, Nature | Stat points; Lock, Remove with Undo).
  Messages give the Strength Score change. Focus stays on the control just changed.

## Bug queue 2 (found Nov 11)
- FIXED (batched for live): the ⋯ "More team actions" menu shut itself when My Team redrew (after Remove, or as the day's
  data landed). Cause: 75-arena-team.js closed it on any focusout, and a redraw drops focus to the page. Now it closes only
  when focus moves to another element. This was behaviour test TEAM-03's flakiness (2-4 of 5 failing; 6 of 6 pass after).
- OPEN: choosing "(no item)" in the item picker stores "not set", so the Pokémon keeps its usual item, while the message
  says "No item". Holding nothing is legal in Champions, so either the picker should store a real "no item" (needs the saved
  data and the grade to accept it) or the choice should be removed. Ask Sim which.

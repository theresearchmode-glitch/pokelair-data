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
Meta (ratings, usage, teams, events, weekly, archetypes, track record), then method, about, legal, feedback, onboarding (notes for the Meta rebuild: docs/rebuild/meta-notes.md, incl. Sim's Mega ranking list, Nov 13)
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

## Must match what we already agreed (checked against the concept images, Nov 10)

The concepts are the direction, not the spec. Where they break a rule Sim already set (CLAUDE.md), the rule wins. Every
R2 mock-up and every R4 page passes this list before Sim sees it, and R5 re-checks all of it. Each line says what the
concepts did and what the rebuild does instead.

**Words (the word list)**
- Concepts: "A" letter badge, "graded out of 100", "99 / 100". Rebuild: Strength Score with its band word (90+ Top tier,
  80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic; blue, purple, neutral, amber, muted grey-brown,
  never red); the rank among tournament teams only as the small line under it. No letters for a team.
- Concepts: "Threats", "83% ready for the top 30", "Handled / Well handled / unanswered". Rebuild: Matchups; the four levels
  Beats it / Handles it / Shaky / No answer.
- Concepts: no real-games verdicts. Rebuild: Favoured / Even match / Unfavoured leads each matchup row (Sim chose real games
  first; measured 52.4% vs the calc's 49.0%), with one line saying the verdicts come from real games (no "Real games:"
  prefix on each row).
- Concepts: "Fix it", "a fix for each", "with the fixes". Rebuild: Suggestions, numbered "Suggestion 1".
- Concepts: "Problems and checklist", "7/7 checks". Rebuild: Team checks (the 4 basics plus 3 notes).
- Concepts: "NastyPlot rating ... 95" for a Pokémon. Rebuild: a Pokémon's number is a rating with its tier ("95, S tier"),
  shown with the same displayed score everywhere (the RS() score, never the raw one).
- Plain words everywhere: today's tournament teams, points, Test run, player skill; data sources named Official events /
  Online tournaments / Ranked ladder / Showdown ladder, each with its date.

**Data and privacy**
- Real data only, from the site, never typed into a page. Every number names its source and date, and pages agree with each
  other (the critique's "mixed sources and dates" point).
- No real player names or handles anywhere, including mock-ups (version 1 printed one; the event winner is "the Champion",
  others "Challenger").
- Each Pokémon on a team shows its most common complete tournament set (item, Ability, four moves), as now.

**Type and scale**
- Every headline, big number and the tagline in Unbounded slanted (synthetic italic), the whole headline, never half; no
  misprint shadow. Body and small labels in Instrument Sans. The early concepts used another grotesque and a placeholder
  wordmark; the rebuild uses only these two faces and the real logo.
- Tagline exactly "Sharply raise your win rate." with "your win rate." in the logo's PLOT blue.
- Text sizes only 13/15/16/17/20/22/24/26/28/34 plus display; spacing on the 4px grid; corners 4/6/10/18/round; paragraphs
  line height 1.5.
- Headline spacing loose enough that words never run together (the concept's "Sharply raise" nearly read as one word).
- Small grey labels dark enough to pass contrast in both modes (the concepts' "Bench", "Back", "Fighting · Poison",
  captions were too faint).

**Space and layout**
- No empty halves or strips (the info sheet concept's empty left column), no half-filled rows, no lone tiles, even columns.
- Every window size from 320 to 2560 and odd shapes, including dragging the window while a page is open.
- Nothing runs off the edge (the sharp hero's stat column touched the page edge) and no labels collide (iPhone hero note,
  "Basculegion · Bench").
- Score and stat lines wrap cleanly (the My Team "22 handled · 8 / shaky" break).

**Shapes and components**
- One filled button, one secondary style, links, and one slanted chip style. No rounded pills (the concepts' Top 10 / vs
  top 12, Box + catch, 0 1 2, No / Yes and the type pills).
- The Apple-style sliders stay, as a first-class component, at their narrowest and widest real size.
- No boxes inside boxes in different shades, in light or dark (page plus one card colour at most); dark-mode name plates on
  tiles count as boxes in boxes.
- Dividers are thin soft rules; fewer of them where spacing can do the job.
- The Mega contour (the two type colours plus a thin ink line) stays on Mega sprites; the concepts dropped it.

**Keep the WOW**
- Bold colour fields, large sprites, slanted headlines and numbers, slanted shapes and the sliders stay as strong as in the
  flair concept. When a fix could go plainer or stay bold, stay bold.
- The colour carries down the page (the first My Team concept went grey below the top band).
- Bench Pokémon look benched, not disabled; pale Pokémon get a deep enough panel to stand out.

**Speed and devices**
- Smooth scrolling on Sim's Windows desktop with a mouse wheel: glows, blurs and reflections are measured against the
  baseline; sprite glow stays off on mouse screens except feature sprites; never give filtered sprites their own layers
  (will-change).
- Checked on iPhone, iPad and the Windows desktop app, light and dark; reduced motion respected for every animation.

**Characters**
- SUPERSEDED (Sim, Nov 11): neither Darkrai nor Shady Paw. Empty screens show the rotating featured underdog; Shady Paw is cut.
  Old text: Darkrai (not Shady Paw) on empty and loading screens only, never beside grades, ratings or data, and never in Your Six,
  Add a Pokémon or the Battle preview. The redesign chat suggested bringing Shady Paw in; that conflicts with Sim's Nov 9
  decision. A real NastyPlot mascot is its own later project.

## R0 decisions (Sim, Nov 10)

1. Sprites: clean renders, no outline, on the colour panels; pale Pokémon get a slightly deeper panel tint.
2. Sharper art: upscale all 345 with Real-ESRGAN's "anime" model (check the faint edge fringe on dark backgrounds first).
3. Bench Pokémon: full-colour sprite on a muted panel, the grey Bench tag says it (benched, not disabled).
4. Chips: one slanted chip style everywhere; no rounded pills. Sliders stay as they are.
5. Dark mode: "dusk" on every page (warm charcoal, one soft light per Pokémon, no neon edges, no glow on text).
6. Motion: a little and purposeful (sliders, sheets, bars, one signature hero moment); off for reduced motion; tested for
   smooth scrolling.
7. Home hero: trim one layer (keep Sneasler, the ray panel, the three stats and the buttons).
8. Helper agents: use them wherever they genuinely help, without asking; tell Sim when they're used (Sim, Nov 10,
   updated). Changes still land one at a time.
9. Before/after sheets: not needed now; we compare on the real Preview later.
Also: the rating display bug fixed on today's site before the freeze; the slant-and-shadow change dropped (reverted).
Sim said go: the rebuild starts with R1.

## The questions that were asked in R0

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

- Order of work (Sim, Nov 10): this rebuild first, then integrating Regulation M-D, then the launch plan. Reg M-D changes
  data, not design, and the logic is shared, so if it goes live in the game mid-rebuild, the data side can still be
  switched for both builds (Sim's call).
- Small items already in flight wait for Sim's word: Player IDs (needs the NP_PID_KEY secret), the sealed-games check from
  Nov 16, the rating display bug (89 vs 94) and the finished slant-and-shadow change.
- At most one site item in progress at a time still holds: during the rebuild that item is the rebuild.

## Size and time (my guess, not yet tested)

Heavy. Roughly R1 1-2 sessions, R2 2-4, R3 2-3, R4 one to two sessions per page group (about 8-12), R5 1-2, R6 1: about
15-25 working sessions. Background runs (sweeps, tests) are cheap. Helper agents would mainly speed up R1 and the
screenshot reviews (about 3-5 times the usage of doing them alone, for those steps only). Aim: finished before the
January 2027 launch, which would then launch on the new design.

## My Box (Sim, Nov 10)

Sim chose the My Box concept drawn in the redesign chat (an in-game Pokémon box blended into the light design). Everything about it is in docs/redesign/box/ (NOTES.md, the render, its source). Build My Box from it; fix the rule breaks listed in NOTES.md.

## Final suggestions (Nov 10)

The redesign chat's last suggestions and Claude's decisions (Sim gave executive control): docs/rebuild/decisions-final-suggestions.md.

## Timing vs Regulation M-D (Nov 10)

M-D most likely starts Dec 2. Sim, Nov 10: aim to have the rebuild live before then ("cutting it super duper close ... lets keep our hopes up high"). Safety net (Claude): keep the M-D data switch (roster, regulation profile, daily data and tests on M-D) ready as its own small step; if the rebuild is not live by about Nov 28, switch today's site to M-D data so players never see last regulation's numbers. The deeper M-D work (re-checking the Strength Score and matchups on M-D games) comes after the rebuild either way.


## Review rules (Sim, Nov 11): status

When (Sim, Nov 11): the review pass runs ONCE, after the redesign is built, not page by page. That avoids doing the same process over and over. Until then, new pages follow the rules as they are drawn. Account sync and Claude features stay until the public-launch preparation.

The rules are in design-system.md section 10. What is known so far:

1. **85 vs 92: explained, nothing to fix in the site.** 92 is correct. `out/ratings_log.json` stores the raw total (85) and every page shows `RS()` of it (92). Only the design chat's mock-up read the raw file. Still to do: a check that every page uses the one function, and the "too few games" wording.
2. **Player handle on Home: not in today's code.** The latest winner shows "Champion · record" (`teamWho`, app/src/app/06-helpers.js) with no handle. Still to do: a sweep of every data file that reaches the page (overlaps the Player IDs plan, f6).
3. **Claude-only features:** `window.claude` is used in 03-persistence.js (saving and sync), 51-usage.js and 53-feedback.js. Public replacements belong to launch prep. Settled (Sim): keep account sync until then.
4. **First visit:** drawn (mocks/firstvisit). Empty states for every other page still to design.
5. **Speed:** the built page is 3,064,497 bytes and the minify step is skipped (`esbuild` not installed; app/slim.mjs). Load time, size limit and splitting still to measure and propose.
6. **Words:** beginner explanations and a two-names sweep still to do (overlaps f7-words).
7. **Contrast:** day-mode partners were measured in design-system draft 1. Pokémon-colour backgrounds, night mode and keyboard are still to measure.
8. **package.json:** missing, so `npm ci` fails. To add.
9. **Art in one place:** to check.


## Overnight, Nov 10-11 (Sim away until 5 AM EST)

Sim gave Claude full authority to decide and continue until 5 AM EST, Nov 11. Limits: never delete the project, highest quality.
Claude's choices tonight:
- Work only on rebuild mock-ups and docs on claude/design6. The live site and the Plans page are not touched.
- Each page passes the section 9 checks before it is shown.
- The usage review runs on Sim's PC later (Sim, Nov 10).

### Found while drawing the pages overnight (to check, not yet changed)
- **Battle:** the Deeper read says the opponent's Mega Charizard Y threatens with Hurricane, and that Pelipper's Hurricane hits Mega Charizard Y super effectively. Turn one uses the open team sheet, which has no Hurricane. My guess, not yet tested: `oppMember` uses popular sets instead of the open sheet, and an `x>=2` test may not mean super effective. Check in the code before changing anything.
- **Battle:** "39,052 tournament games" in the real-games verdict. Check whether it follows the single-games-first rule.
- **Events:** event names can carry an organiser's handle (e.g. "<handle> VGC Champions Arena #18"). The mock-ups leave the handle out. Add this to the no-names sweep of data that reaches the page.
- **Night mode:** selected segment chips are hard to tell from unselected ones (a token issue, seen on Build).

## NastyPlot Full Redesign artifact (Nov 11)
https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf. An index of every mock-up page in day and night. It is built from docs/rebuild/mocks/out/; the staging folder is the session scratchpad "redesign": the pages with art paths flattened to art/, a "‹ All pages" link on each, and thumbs/.

### R4b. Design round: bold character on every page (Sim, Nov 14, afternoon)
Sim: Home and the Meta page felt bland next to Skyline (Type Chart) and Arena VS (Practice). Building stops; design first,
page by page, then finish building ("there's no point in building if we're going to be changing things").
- [ ] Home: Fight Night (Sim picked it, "much much better, I love it"); refined mock-up for Sim (docs/rebuild/mocks/home3).
- [ ] Meta: with Sim's other designer.
- [ ] After Home is finished: discuss with Sim how to upgrade Build and My Team with the new creative vision and design philosophy.
- [ ] Then the remaining pages one by one; only then finish building.

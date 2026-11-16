# Morning summary for Sim (authority 12:30 PM Sun Nov 15 to 8:00 AM Mon Nov 16)

DRAFT, kept up to date through the night; sent at 7:40 AM with the pictures beside each question.
Every decision is in docs/rebuild/decisions.md (from the 1:03 PM entry on). Pictures: docs/rebuild/pics/nov16/.

## What changed (grouped; each was checked, tested, committed and put on the Preview)
- Pokémon page: forms (A), partners two across to 899, folds on every width (A), Report a Mistake, page length 9,535 -> 4,840 at 320.
- The switch: every Pokémon tap opens its page; the old sheet is retired; tests translated.
- Build: no more flicker while building (last result stays, faded); the blue score frame is gone.
- Footer back (A); Never Suggest list (A); Fix your items first; set check tips.
- Parity with today's site: stale-data / new-regulation note, Day/Night carries over, rules caption, Usage order, ~20 smaller gaps.
- Function sweep (10 sure findings), code review A1-A6, B1-B5, B9-B14, C2, C3, C6-C8, regression sweep, full layout sweep at 13 widths.
- Commits: work in Auto mode again (the blocker was a model-name line in the commit message; Sim approved the settings file).

## Overnight Nov 15-16 (full authority to 10 AM; each item checked, committed; pictures in docs/rebuild/pics/nov16/)
- Base Stats B with depth, then less bubbly (square slanted bars, soft glow); Mega change numbers in their own column. Pictures statsB3-*.
- How to build it smaller, same design (733 -> 657 px on phones); the repeated set line removed.
- Say it once: "Data as of" once per page, in the footer; Meta's kick line no longer repeats the subtitle; Home's This Week joined the Meta strip
  (one Meta strip: Top Rated / Hidden Gems / This Week); Battle's Win / Loss appear once four are picked.
- One system: show-more is the blue link with ›; ONE fold marker (grey › on the right) for every text fold; blue links that open something end in ›;
  one chip; one segmented control (Meta's segments now 44px, same look); one section-heading size (24 phones, 28 desktop); one tier colour
  ("S tier" is always a gold tag, never blue text); Test Run's box-in-box fixed.
- Pages: Meta on phones has one swipe row per tier (5.2 -> 4.1 screens); Home's underdog large on top (no empty strip), Home 5.07 -> 4.82 screens;
  My Team "Saved ✓" reads as a status; Grandstand legend moved into a "?".
- Touch: every tap target measured is 44px+ (Battle "Change on My Team", How We Calculate link, Game Plan link (your Q5: decided, moved)).
- Helpers used (you asked): touch sweep, say-it-once sweep, button/fold inventory, arrow test-safety audit, tints/tier inventory, file counts.
- Re-checked every older audit item still marked open (helper, audits/reverify-nov16.md) and fixed the real ones: Battle Your Six names whole at 320;
  This Week badges under names on small phones; Type Chart chips whole; Track "?" stays with its word; Usage / Sets / Meta spotlight numbers never touch;
  Events ticket names inside at 320 and the counts said once (no empty strip on desktop); Home corner rows even; Damage Calc at 320 (labels, Swap,
  move cards); Build blueprint at 320; Team Sheet spread note said once; My Box team in Lead / Back / Bench order; Archetypes sprites spread out;
  night chips: selected is clearly blue. Accessibility (audits/a11y-nov16.md): Base Stats labels, "Needs work" text, This Week sun tiles now pass.
- Correction: some of my early checks used #report/#top/#ratings, which open Home in the new site; re-done on the real pages, results held.

## The nuclear stress test (your last step; started 2:09 AM; details in audits/stress-*-nov16.md)
Four helpers tested the Preview: words, keyboard and screen reader, speed, every page at 10 widths in day and night (500 renders), and every
function with odd input. Measured clean: 0 pages wider than the window, 0 broken images, 0 console or page errors, no speed limit exceeded, no leak.
Fixed tonight (each measured before and after, logged in decisions.md):
- Layout: My Team Stand-Outs at 360 (names ran together); Usage "Indeedee (F)" cut at 320; This Week's fifth tile alone; Home underdog panel stopping
  at 70% width; Calc chips cramped; My Team move chips uneven (all six grids now the same height); Usage "How X is played" lopsided at 1024;
  Events ticket labels wrapping unevenly and "M-" / "C"; Home corner links; a lone "›" on its own line (3 -> 0 over 23 pages).
- Functions: Import names repeated Pokémon ("left out 5 more Incineroar") and wrong Abilities, and fills six different Pokémon first; an old
  "Removed X · Undo" no longer reverses a newer change; "1 game logged"; the same replay can't be logged twice; Save as New with a taken name
  becomes "Name (2)"; "Saved" no longer claims to save when the browser blocks it; Build says when typed text matched nothing; "All N Events ›"
  opens Events (it opened Meta); a "?" tip opened from the keyboard stays open.
- Words: the footer and Events count days the same way ("6 days"); "Nothing to fix" no longer sits beside "1 fix" ("1 idea"); "1st place, 9-1" for
  screen readers.
- Accessibility: no heading skips (2 -> 0); Search says "3 results" instead of re-reading the list; 0 unnamed buttons with every fold open.

## Still open for you (each with a reason)
- Damage Calc vs My Team for YOUR Pokémon (stress test B5): the calc gives your Mega Charizard Y Timid "estimated spread"; My Team shows Modest with
  its most used spread. Pictures: q-calc-own-set-calc.png, q-calc-own-set-myteam.png. Recommend: your own Pokémon use the same set as My Team. Why:
  your rule (Nov 8) that a team shows its most common tournament set; two pages shouldn't disagree. Not done overnight: it changes damage numbers
  on every page, so it should be its own step with the calc checks.
- Events tickets at 320: the longest name word can reach the perforation (0px, not cut). Picture: q-ticket-names-320-night.png. It is your Q17 layout,
  so I left it. Option: a 2px smaller name on 320 only. Why I didn't: you approved Q17 as is.
- Build's Load Team (built team, Winning Cores) loads in one tap with Undo; Home / Winning Teams / Events ask "Replace your current team?" first.
  The test specs say Build's is on purpose (it's the team you just asked for). Low priority; say if you want the question there too.
- Not built (would be new Undo paths): Undo after deleting a saved team, after Edit Set changes, and more than one step of Undo.
- 200% zoom: Meta's chip row gives no sign that it scrolls (needs a scroll hint; after the switch).
- Length with folds OPEN (the advisor's new budget: phone 4 screens Home / My Team / Meta, 3 for the rest; today's approved limits measure folds
  closed). Measured Nov 16, 12:10 AM at 390 (closed -> open screens): Home 4.8 -> 4.8, My Team 5.0 -> 8.0, Build 1.6 -> 3.7, Battle 2.2 -> 2.2,
  Meta 4.0 -> 5.3, Pokémon page 4.7, Usage 4.5, Winning Teams 4.0, Events 5.9 -> 6.0, This Week 6.1 -> 6.5. Your call whether to adopt it.
- Suggestions: DONE the safe way (answer first, settings below under "Adjust suggestions", still visible). A fold ("Adjust ›") is possible later; it hides what is set, so I kept them visible.
- Colours: B-tier purple = "Tournament ready" purple; C-tier blue = "Top tier" blue (the helper's flag): a colour call for you.
- Heading rule: section heads unified; the ~19 Unbounded sub-headings (Usually, Typical set, Rising...) left as they are (the WOW).

## Questions (each with pictures in the message)
1. A core's share on phones (today hover-only). Pictures: core-pct-now.png, core-pct-A.png. Recommend A: '671 teams (4.9%)' on the line that already
   shows the count. Why: touch players never see a hover title; no new element.
2. Fold styles: 8 kinds today. Picture: folds-today.png. Recommend: one style for text folds (title + one-line summary + › on the right, as Damage Calc
   and 'More on Home'); How We Calculate tiles stay tiles. Why: one look = players learn it once.
3. Winning Teams champion names at 700-1024. Pictures: wt-names-A-one-size-900.png (live now), wt-names-B-per-card-900.png. Recommend B: only the
   name that needs it shrinks. Why: five names keep the big slanted look ('keep the WOW'); the one smaller name is on the outer card.
4. Undo inside an open sheet: the toast sits under the backdrop (your Nov 11 rule), so its Undo can't be used while a sheet is open (e.g. Remove in
   Edit Set: no Undo shows at all). Pictures: undo-in-sheet-now.png, undo-in-sheet-A.png. Recommend A: 'Removed Whimsicott · Undo' inside the sheet, in the
   Undo bar style Suggestions already uses. Why: Undo should always be reachable. (The stress test hit it twice: Edit Set Remove, and deleting a
   game in Your Games.)
5. Game Plan link: tap area 47px tall but only 19px above its centre (the checker wants 21). Fix moves the line 2px down. Picture: gameplan-tap-area-390.png (the tap area tinted blue). Recommend: move it 2px. Why: the 44px rule,
   and 2px is not visible.
6. Plan settings (Count abilities, Refresh plans): today Count abilities is always on (hidden). Pictures: plan-settings-now/A-390/1440.png. My first try
   (A, a slider on its own row) leaves a lone slider and a lone link at 390, so I recommend instead: Count abilities beside Megas and Swap (three across
   on desktop, two by two on phones), Refresh Suggestions in the links row. Why: no half-filled rows; settings stay in one place.

## After the switch (Sim, Q1 A)
- Cross-device sync (code review B8), its own step tested on two devices; delete the old site's dead code (C1).

## Before the switch (checklist)
- Publish the live page with the same runtime capabilities as today's live artifact (read it first).

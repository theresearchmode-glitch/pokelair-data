# Design review from Sim's design advisor (Nov 15 night) and the plan for it

Source: pasted by Sim, Nov 15 night (full text kept in the session transcript; summary of every point below, nothing dropped).
Sim, Nov 15 night: "make sure you are incorporating all of the outside reviews and audits im getting. they help."
Rule from the review itself: our RULES.md / design-system.md / decisions.md win where they disagree; we tell Sim. Never remove functionality:
a cut means "say it once" or "move it behind one link".

Status words: OPEN (not started) · PICTURES (pictures for Sim first) · ASK (conflicts with an earlier Sim decision: Sim chooses) · DONE.

## What the reviewer checked, and what may be out of date
- They reviewed the Preview as published Nov 16 (UTC), at 1440 / 820 / 390, day (night for My Team and Home), with folds closed.
- Some items describe things that changed tonight: the Pokémon info SHEET is retired (every tap opens the Pokémon page, Sim's 'The
  Answer Page' A); Edit Set / Remove now keep Undo; '(0–100)' no longer breaks. I re-check each item on the current build before acting.

## Root causes (each shortens every page)
| # | Finding | Plan | Status |
|---|---|---|---|
| A | Same content on several pages: Your Six (My Team, Battle, Home), Game Plan (3), Your Games (3), underdog (3), the 93 (2), tagline twice on Home (hero + footer), 'Data as of' up to 4 times, This Week twice on Home | Write the "say it once" table: each thing's ONE home + one-line links elsewhere. Picture/table for Sim first | PICTURES |
| B | 11 ways to hide things (Show, chevron headline rows, More ⋯, All 30, See All ›, Show 4 More, +, ?, ticket folds, tabs) | Two patterns only: one fold row (label left, count right, + or ›) and one "All N ›" link; tips stay "?". One fold per section, none nested. Never fold the answer (Team Checks shows its result line) | PICTURES (style guide) |
| C | Too many headlines in Unbounded (Meta ~130, My Team ~60); too much 13px fine print | H1 display, H2 Unbounded 28-34, below that Instrument Sans 600 17-20; big numbers stay Unbounded. Cut repeated helper lines | ASK: CLAUDE.md type system says "every headline, big number and the tagline use Unbounded slanted"; the Hand's Lead/Back/Bench are Sim-approved Unbounded |
| D | 14-16 button looks | Three levels (primary black plate, secondary outline, tertiary blue link always with ›) + ONE segmented control | PICTURES (style guide) |
| E | Three second-level menu styles (Battle tool bar, Meta two tab rows + chips + switch, My Team jump links) + Home's 12-tile grid repeats the menu | One sub-menu style; filters on one row | PICTURES |
| F | Seven tinted panels in day mode | Page + ONE panel colour (our rule); type colour only on Pokémon things; blue only for selected / yours | PICTURES |
| G | Two colour languages for ratings (Meta tier colours vs 'S tier' tags vs band colours) | One tier colour set in tokens, shown to Sim as a picture first | PICTURES |

## Pages
- HOME: nine sections -> five (hero + 3 actions; Your Corner vs Champion; Most used; one Meta strip (swipe row on phone); Underdog; footer).
  'How fight night works' only with no team, gone after Got It; 12-tool grid -> menu or two-row link list; More on Home's four items to
  their homes. Phone: 93 and Set as Opponent squeeze names. Fight-night voice only on Home: ASK Sim (keep as Home's voice or spread).
- MY TEAM: phone six as compact 3x2 small Cards (ASK: Sim approved the Hand Nov 14 and 'Your Six' tonight); four action buttons -> Share
  secondary + one ⋯ menu ('Saved ✓' is a status); Matchups four views -> two (Stand-Outs, All 30) (ASK); Suggestions answer first, settings
  behind 'Adjust ›'; Team Checks result shown, details folded; Things to Know as a normal fold row.
- INFO SHEET: retired tonight (Pokémon page). Check the page keeps few folds (Sim: Base Stats chart and 'How to build it' are oversized:
  pictures first).
- META: four control rows -> one tab row + search with a Filter button + the switch beside the title; Grandstand on phone as one swipe row
  per tier with its count (5.2 -> ~2 screens) (PICTURES); legend into the '?' tip.
- BATTLE: Your Six repeats My Team (A); Win / Loss greyed boxes look broken before four are picked: hide or explain; sub-menu mixes tools
  with Your Games (E).
- BUILD: recent-winner tickets each fold; over three, one 'All winners ›'.
- TOUCH: many 20-26px targets (How It Works ›, Set as Opponent ›, Compare ›, Full Tables ›, Import a Team, Game Plan, 0 of 4 picked, style
  guide Set): 44px tap areas. Folds read open/closed; '?' tips reachable by keyboard. Contrast of type chips: measure.
- LENGTH: new budget with folds OPEN (phone 4 screens for Home / My Team / Meta, 3 for the rest) checked like c13 (ASK: today's limits are
  Sim-approved with folds closed).

## Reviewer's order (each step ends with a picture for Sim)
1 say-it-once table · 2 style guide: three button levels, one segmented control, one fold row · 3 heading rule · 4 Home to five sections
(phone first) · 5 My Team · 6 Meta · 7 one tier colour set, one panel tint · 8 touch targets · 9 length budget with folds open.

## Other Sim requests the same night (in this queue)
- Base Stats chart on the Pokémon page: adds nothing, not pretty; stats web or a clean colourful compact display (pictures first).
- 'How to build it' on the Pokémon page: same thing, not oversized (pictures first).

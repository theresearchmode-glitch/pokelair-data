# NastyPlot Full Redesign: technical audit (Nov 16, Preview 182 + morning changes, build check317)

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | White and blue text on coloured tickets, cards and tiles fell below 4.5:1 in 9 places (day and night). Fixed today, measured; Archetypes' Ice scene drift is still 2.6:1 under a shadow |
| 2 | Performance | 3 | No leak and no limit exceeded. A ~1.2 s blocking task at startup on a 4x-slow CPU (the Preview's embedded data) |
| 3 | Theming | 3 | Colours only through tokens (the guard enforces it); dark mode is complete; 2 night-only contrast gaps fixed today |
| 4 | Responsive Design | 3 | 0 layout findings on 18 of 23 pages at 7 widths, day and night. Real-state gap: a long band word broke Home on phones (found by Sim, fixed) |
| 5 | Implementation Integrity | 3 | A coherent, product-specific system. 5 decorative thick left accent bars (the "side-tab" tell), all in approved mock-ups |
| **Total** | | **15/20** | **Good (address weak dimensions)** |

## Implementation Integrity Verdict
**Pass.** One token file holds every colour. The type scale, 4px grid and colour rules are enforced by a guard that runs on every build. Day and night share one structure.

Detector findings were verified by eye:
- **Source scan:** 8 findings. 7 are thick left borders. 2 of those are type colours on move chips, which carry meaning; 5 are decorative accents. The 8th is a grid background on the Damage Calc's "table" surface, which fits that concept.
- **Rendered scan (24 pages, 2 widths, day and night):**
  - The real issue was low contrast, covered in the findings below.
  - Glows, stripes, hard offset shadows, fonts and eyebrows belong to the approved look, so they are not defects.
  - The "purple gradients" are Pokémon type colours.
  - The 2 "skipped heading" findings are false alarms: the detector reads tag names only, while screen readers get the level-2 headings set with role and aria-level.

## Executive Summary
- Audit Health Score: **15/20** (Good).
- Issues found: **P0 0 · P1 10** (all fixed today and re-measured) **· P2 6 · P3 5**.
- Top issues, all fixed and measured:
  1. Low contrast on coloured surfaces, 9 places.
  2. The Home score plate pushed "Set as Opponent" off the screen with long band words.
  3. Off-scale 14px names on Winning Teams.
- Still open: Archetypes Ice drift contrast; Track Record's empty band at 1920; 5 decorative left accent bars; startup blocking task; lone last words (now 79, down from 137).
- Next: six helper audits are running (real team states, accessibility with axe-core and keyboard, design consistency, words, speed, odd widths and zoom). Fix their findings one at a time, then re-run this audit.

## Detailed Findings by Severity

### P1 (all fixed today, measured before and after)
- **[P1] Blue text on tinted Team Cards and the underdog panel.** Location: Home `.ff` and `.hm-ud`. Category: Accessibility. Day 4.2-4.47:1 → 5.07:1+ (`--plot-text-deep`); night 4.45 → 5.15. WCAG 1.4.3. Fixed.
- **[P1] White text on Pokémon page move tiles.** Location: `.pk-slots li`. A white stripe dropped 15 of 18 types to 3.8-4.2:1; it is now a dark stripe, minimum 4.6. WCAG 1.4.3. Fixed.
- **[P1] White text on event tickets, the Events plate and This Week's headline.** Location: `.tk`, `.ev-oh`, `.wk-hl`. 3.6-4.2:1 → 4.6:1+ with a 15% dark layer; official gold tickets are unchanged. WCAG 1.4.3. Fixed.
- **[P1] Damage Calc field cards.** Location: `.dc2-fc.lit`. White on Grassy 3.7:1 → 5.8:1+; Electric keeps dark text (8.6:1). Fixed.
- **[P1] Small blue "Mega" labels on card art.** Location: `.mg`. 3.9-4.49:1 → deeper blue. Fixed.
- **[P1] Placeholders.** The browser default grey was 4.4:1 → the site's ink-3 (5.9:1 day, 8:1 night). Fixed.
- **[P1] This Week Snow tile at night.** White on bright snow 2.6:1 → faint snow, deeper ice. Fixed.
- **[P1] Home: "Set as Opponent" over the score plate and off-screen.** Long band words at 320-393; 16 problems → 0 across 6 band words × 19 widths. Category: Responsive. Fixed.
- **[P1] Undo unreachable while a sheet is open.** Moved into the sheet (Sim Q2). Fixed.
- **[P1] Settings taps under 44px.** Megas 0/1/2 were 30-38px in the new 3-across layout. Fixed.

### P2
- **[P2] Archetypes Ice scene.** White on the snow-drift highlight is 2.6:1 (large text needs 3:1); a dark text shadow mitigates it. Recommendation: soften the drift where the words sit, as done on the This Week tile. Suggested command: `/impeccable colorize`.
- **[P2] Track Record at 1920.** The receipt stretches to the right column's height and leaves a large empty band inside it. Recommendation: align the receipt's content or end it at its content height. Suggested command: `/impeccable layout`.
- **[P2] Startup blocking task (~1.2 s at a 4x-slow CPU).** Cause: the Preview's embedded data parse. Recommendation: defer parsing or split the data after the switch. Suggested command: `/impeccable optimize`.
- **[P2] Damage Calc: your own Pokémon's set differs from My Team** (Timid vs Modest). Sim's Q1, its own step. Suggested command: `/impeccable harden`.
- **[P2] Lone last words in paragraphs.** 137 → 79 with `text-wrap: pretty`; the rest come from narrow columns. Suggested command: `/impeccable typeset`.
- **[P2] Events "What counts as an event?"** The › sits right after the text, because the fold is only as wide as its text. Suggested command: `/impeccable polish`.

### P3
- **[P3] Five decorative thick left accent bars** (Speed "yours", the editing strip, Archetype plans, This Week headline, Practice cards). This is the side-tab tell, but they are in approved mock-ups. Raise with Sim.
- **[P3] Empty strip at large widths on some pages.** To be confirmed by the odd-widths helper.
- **[P3] iPhone Safari support for `text-wrap: pretty`** is not yet checked.

## Patterns & Systemic Issues
- **White text on type colours is a recurring risk.** The type fills are tuned to about 4.6:1, so any light overlay (stripes, highlights, gradients fading toward white) breaks AA. Rule going forward: overlays on type colours must darken, never lighten.
- **Checks ran on one sample state.** Real states (long band words, short teams, long names) were untested until Sim found the Home bug. The real-states helper now covers them, and the checks try every band word.

## Positive Findings
- A token-only colour system enforced by a guard on every build; complete day and night.
- 0 pages wider than the window and 0 broken images or errors across 500 renders (last night's stress test).
- Behaviour tests on every flow; the GitHub checks pass (golden, same-grade, accuracy gate).
- Keyboard: every sheet traps and returns focus; "?" tips are reachable; reduced motion is honoured.
- A coherent, bold visual world (slanted Unbounded headlines, colour fields, large sprites) applied consistently.

## Recommended Actions
1. **[P2] `/impeccable colorize`**: Archetypes Ice drift contrast (soften the drift under the words).
2. **[P2] `/impeccable layout`**: Track Record receipt empty band at 1920.
3. **[P2] `/impeccable optimize`**: defer the Preview data parse at startup.
4. **[P2] `/impeccable harden`**: the calc uses My Team's set for your own Pokémon (Sim Q1).
5. **[P2] `/impeccable typeset`**: remaining lone last words in narrow columns.
6. **[P3] `/impeccable polish`**: a final pass after the six helper audits' fixes.

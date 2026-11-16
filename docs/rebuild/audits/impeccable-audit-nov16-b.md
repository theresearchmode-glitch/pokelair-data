# Impeccable audit, re-run (Sim, Nov 16 ~7:45 AM): the published "NastyPlot Full Redesign" Preview

Target: the artifact as published now (version 1794829960-e628, 6:52 AM; byte-identical to build check319, 400 files).
Evidence: impeccable detector on 25 pages x day/night x 390x844 / 820x1180 / 1440x900 (150 page scans, scratchpad/aud2/det-*.json);
my own pixel-contrast, focus and layout measurements on the published file; the accessibility deep-pass helper (on check317, two builds
earlier; its top items re-verified on check319, marked below); this morning's stress reports (perf, visual, words) where noted.
The speed helper is still running; Performance is scored from this morning's measured stress run.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | Keyboard focus ring is invisible on every slanted control (buttons, tabs, chips, team cards, calc): 0 pixels change when focused. Verified on the published page |
| 2 | Performance | 3 | No route over its limit; one ~1.2 s startup task on a 4x-slow CPU (the Preview's built-in data) |
| 3 | Theming | 3 | Colours come from tokens (49 raw rgb() outside tokens.css, mostly shadows); night "113" chip count at 80% opacity is 3.9:1 |
| 4 | Responsive Design | 3 | Count abilities "Yes" cut off at 567-575; text-spacing test clips 4 spots; small print runs ~110-120 characters per line at 820 |
| 5 | Implementation Integrity | 3 | Coherent, product-specific system; How We Calculate glues text together ("replaysThe newest…", "leads.Used for") |
| **Total** | | **14/20** | **Good** |

Morning score was 15/20. The drop is new evidence, not a regression: the accessibility deep pass finished after the morning audit and
found the focus-ring problem, which was already there.

## Implementation Integrity Verdict
Pass. The site reads as one designed product: slanted Unbounded headlines, the boxy slanted shapes, bold colour fields and the sprite
art are consistent across all 25 pages, and colours come from tokens. The detector's most frequent flags (glow 60-71, offset shadows 54,
"overused font" 46-48, palette 24-40, stripes 14, kicker labels 8-10) are the approved look (CLAUDE.md type system and the redesign
decisions): the brief wins, so they are not defects. Verified real: the glued text on How We Calculate.

## Executive Summary
- Audit Health Score: **14/20 (Good)**
- Issues: P0 1 · P1 9 · P2 6 · P3 3
- Top issues: (1) invisible keyboard focus on slanted controls; (2) calc table row headers empty at phone width; (3) every page has the
  same browser title; (4) glued text on How We Calculate; (5) Track chart amber/green lines too faint
- Next: fix P0 first (one shared fix covers every slanted control), then the P1s one at a time

## Detailed Findings by Severity

### P0
- **[P0] Focus ring invisible on slanted controls.** Location: every `clip-path` control: `.np-btn`, `button.ff`, `nav.ra-seg a`,
  `.ra-chip/.np-chip`, `.dc2-kt`, `.tc-tp`, Practice and Method tiles (shared `:focus-visible` outline is cut off by the clip).
  Category: Accessibility. Impact: keyboard users can't see where they are. WCAG 2.4.7. Verified on check319: 0 changed pixels focused
  vs unfocused on 6 control types; unclipped buttons do show it. Recommendation: draw the slanted shape on a `::before` layer and leave
  the control unclipped, or draw focus inside the shape (inset ring). Command: /impeccable harden

### P1
- **Calc "Your best hit" table: 30 of 30 row headers empty at 390.** Name span is `display:none`, sprite `alt=""`. WCAG 1.3.1/4.1.2. Verified. Fix: visually-hidden name. /impeccable harden
- **Every page titled "NastyPlot".** WCAG 2.4.2. Verified on 5 routes (only Pokémon pages differ). Fix: per-route title. /impeccable harden
- **"On this page" links use `aria-selected`** (3 links on My Team), so the current section isn't announced. WCAG 4.1.2. Verified. Fix: `aria-current="location"`. /impeccable harden
- **Track "Week by Week" chart lines below 3:1:** amber 1.78:1, green 2.61:1 on white. WCAG 1.4.11. Colours verified on check319. /impeccable colorize
- **How We Calculate: text glued together** ("Pokémon Showdown replaysThe newest…", "leads.Used for:", "scored)20,000 games read"). Verified by screenshot. Category: Integrity. /impeccable clarify
- **Count abilities "Yes" cut off at 567-575 wide** (My Team Suggestions). Verified. /impeccable adapt
- **Text spacing (WCAG 1.4.12) clips content:** Archetypes card count at 1280, My Box names at 390, Calc "Guaranteed OHKO" at 390, Build event name at 390 (helper, check317; not re-run). /impeccable adapt
- **Visible label not in name:** calc KO board buttons show "KO" but are named by the matchup; "Copy for Showdown" split in Saved Teams. WCAG 2.5.3 (helper, check317). /impeccable clarify
- **Night Events chip count "113" 3.9:1** (13px at 80% opacity on the selected chip). WCAG 1.4.3. Verified (opacity 0.8 measured). /impeccable colorize

### P2
- Slider (`.np-slide`) focus shows only two thin edges (helper). /impeccable harden
- Tournaments search list: no arrow-key movement, Escape leaves it "expanded" (helper). /impeccable harden
- Import a Team from Home: closing the sheet leaves you on My Team, focus not back on Home (helper). /impeccable harden
- Same-name buttons ("Show ›" x4, "See All 11 ›" x2) read alike in a buttons list (helper). /impeccable clarify
- Small print ~110-120 characters per line at 820 on About, Usage, Speed (detector). /impeccable typeset
- Track chart has no text version of its data (helper). /impeccable harden

### P3
- "Why This Score?" sheet has no heading; "The Grandstand?" heading includes the tip's "?" (helper). /impeccable polish
- Home tools heading and Sets heading wrap with a short last line at 390 (detector). /impeccable typeset
- `np-breathe` glow loops with no pause (stops under reduced motion; doesn't flash) (helper). /impeccable animate

### Checked and dismissed (false alarms, measured)
- Ticket labels on Events and This Week: 4.8-7.7:1 at pixel level (scanner can't see the dark layer under them).
- Types chart labels 4.6:1; Archetypes big percentages 3.47:1 worst (large text, needs 3:1); calc "Other moves" 14:1; night Home score 5.7:1.
- Heading-level skips on My Team / Practice: set with aria-level, which the scanner doesn't read.
- Calc "burst"/"drops" pattern cards and the giant "CHARIZARD Y" outline: decorative and hidden from screen readers by design.

### Carried from this morning's helpers, not re-verified on check319
- Battle VS badge covering names (needs a logged opponent; sample state had none), Type Chart headline overflow with a long one-word
  name, mid-word breaks, Saved Teams names overlapping at 1024, band word wrapping in the belt at 1440 (real-states helper).
- Two looks for "selected" (black vs pale blue), section headings in 5 sizes (design helper).
- Leftover "ready for" wording, Method vs My Team on the basics, 1630+ vs 1760+ (words helper).

## Patterns & Systemic Issues
- One CSS pattern (clip-path on the control itself) removes focus visibility everywhere the slanted shape is used: one shared fix.
- Content assembled from parts without separators (Method rows) and names built from data (KO buttons, Copy for Showdown): names and
  text joins need a pass.
- Contrast is good where the scanner says it isn't, and the real gaps are opacity/alpha and chart strokes, which scanners miss: keep
  measuring at pixel level.

## Positive Findings
- 16 dialogs: labelled, modal, focus kept inside, Escape returns to the opener; skip link, focus to H1 on page change; no keyboard traps.
- Reduced motion stops every animation; 320px has no page-level side scroll; no target under 24px.
- Colour system: tokens everywhere, a complete night mode, ticket and tile text all above 4.5:1 after this morning's fixes.
- No route over its speed limit; scrolling smooth on the measured pages.

## Recommended Actions
1. **[P0] `/impeccable harden`**: visible focus on every slanted control (one shared fix).
2. **[P1] `/impeccable harden`**: calc row-header names, per-page titles, `aria-current` on the On this page links.
3. **[P1] `/impeccable clarify`**: How We Calculate glued text; KO and Copy for Showdown names start with their visible words.
4. **[P1] `/impeccable colorize`**: Track chart amber/green lines to 3:1+, night chip count to 4.5:1.
5. **[P1] `/impeccable adapt`**: Count abilities at 567-575; the four text-spacing clips.
6. **[P2] `/impeccable typeset`**: line length of small print at tablet width.
7. **`/impeccable polish`**: final pass.

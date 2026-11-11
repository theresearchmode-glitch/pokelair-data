# NastyPlot design system (rebuild R2, draft 1, Nov 10)

The one source for how the rebuilt site looks. Every page is built only from these tokens and components; anything new
is added here first. Sources: the "flair" concept (docs/redesign/concepts/, docs/redesign/box/), Sim's rules in CLAUDE.md,
the R0 decisions and the agreed-rules checklist in docs/rebuild-plan.md, and the final-suggestion decisions
(docs/rebuild/decisions-final-suggestions.md). Status: draft for the R2 mock-ups; values are checked (contrast measured,
sizes on the scale) as the mock-ups are made, and anything that changes is noted here with the date.

## 1. Principles (in order; a later one never overrides an earlier one)
1. Real data, nothing lost: every feature in docs/rebuild/inventory/ survives and passes its behaviour test.
2. The Pokémon carry the page: their art is the largest, most vivid thing on every screen.
3. Readable first: contrast passes in light and Dusk, every Pokémon named, no shrinking one label to fit.
4. Colour is borrowed from the Pokémon on screen; fixed colours only for the logo blue, section marks, bands and verdicts.
5. One coloured surface per screen at most (the hero panel, the box wallpaper, the score lockup), page + one card colour,
   no boxes inside boxes.
6. NastyPlot's voice in fixed places: logo, slanted Unbounded headlines with the blue second half, the tilted ray panel,
   slanted plates, slanted marks. Used sparingly so each one still means something.
7. Dense where you work (My Team, Battle, My Box, info sheet), airy where you arrive (Home).
8. Keep the WOW: when a fix could go plainer or stay bold, stay bold.

## 2. Colour tokens
Names are roles, not colours. Light is the default; Dusk is the dark mode ("dusk, not black").

| Token | Light | Dusk | Use |
|---|---|---|---|
| --bg | #FBFAF7 | #1B1A22 | page |
| --surface | #FFFFFF | #24232C | the one card colour (sheets, panels, table rows on hover) |
| --wash | #F4F0EA | #2A2832 | base under borrowed colour (box wallpaper, ray panels) |
| --ink | #17161A | #ECE8E2 | headlines, body text |
| --ink-2 | #48454F | #C9C3CC | secondary text, labels |
| --ink-3 | #66636E | #A39CA6 | captions, the smallest text (still must pass 4.5:1) |
| --rule | rgba(23,22,26,.11) | rgba(236,232,226,.12) | hairline dividers |
| --plot | #0078BF | #4FB2F0 | logo PLOT blue: second line of headlines, links, focus, slanted marks, active state |
| --plate | #17161A | #ECE8E2 | slanted black plates and the filled button (text: --bg) |

Bands (Strength Score; never red): Top tier --band-top #0078BF, Tournament ready --band-ready #7B4BD6, Solid --band-solid
#6B6570, Needs work --band-work #E9A800 (text on it: --ink), Missing a basic --band-miss #8A7C6E. Dusk uses the "-ink"
lighter versions (#4FB2F0, #C9B0FF, #A39CA6, #FFD166, #B8AA9C).

Verdicts: Favoured / Beats it --good #2E9E5B (Dusk #5FD08F); Handles it --plot; Even match / Shaky --mid #E9A800
(Dusk #FFD166); Unfavoured / No answer --low #8A7C6E (Dusk #B8AA9C). Red is not used for any verdict or score.

Measured contrast (Nov 10, WCAG ratio on --bg): light ink-2 8.98, ink-3 5.63 (5.17 on --wash), --plot 4.53 (passes, just;
use --plot-text #0068AD 5.61 for small link text); Dusk ink-2 9.99, ink-3 6.46 (5.82 on --surface), --plot 7.36.
The light verdict and band FILL colours are too pale for text (--good 3.27, --mid 2.00, --band-miss 3.88), so text uses
darker partners: --good-text #16693B (6.45), --mid-text #8A5A00 (5.68), --low-text #6E6153 (5.75), all also pass on
--wash. Dusk fills pass as text (5FD08F 8.96, FFD166 11.96, B8AA9C 7.61).

Type colours: one fixed set of 18 (the concept's TY map), used only for type chips, move tints and Mega contours, never
as large fields. Borrowed colour: computed from each sprite (the concept's dominant-hue method), mixed with --wash at
30-58% so names on it pass contrast; checked by the polish check on every box and panel.

Dark Pokémon on Dusk: some art is nearly black (Paldean Tauros 10250-10252, Darkrai, Corviknight, Umbreon) and
disappears on #1B1A22 without help (seen on the full contact sheet, Nov 10). On Dusk every sprite stands on its borrowed
--wash panel or gets a soft light contact glow under it (feature sprites only on mouse screens); pale Pokémon get the
mirror rule in light mode (a deep enough panel, the agreed "pale Pokémon stand out" rule).

## 3. Type
- Faces: Unbounded (display: every headline, big number, the tagline, plates, the filled button), always slanted
  (synthetic italic, font-synthesis: style), weight 800-900; Instrument Sans (everything else), 400/500/600/700.
- Sizes: 13 / 15 / 16 / 17 / 20 / 22 / 24 / 26 / 28 / 34, plus display sizes for page titles (36 phone, clamp(46px,4.4vw,64px)
  desktop) and the hero/score number (54 phone, 64-120 desktop). Body 16 (phone) / 17 (desktop). Smallest text 13.
- Line height: paragraphs 1.5; headlines 1.02-1.1 with letter-spacing -0.02em (loose enough that words never run together).
- Headline pattern: first line --ink, second line --plot ("Sharply raise / your win rate.").
- Numbers: tabular figures in tables and stat rows.

## 4. Space, size, shape
- Spacing on a 4px grid (1, 2 and 6 allowed for hairlines and optical fixes): 4 8 12 16 20 24 32 40 48 64 96.
- Page gutters: 16 (phone) / 32 (tablet) / 96 (desktop 1440+), max content width 1440, centred.
- Breakpoints: 700 (phone to tablet), 1000 (two-column work area), 1440 (three columns). Layouts are fluid between them
  and must hold at every width from 320 to 2560 and while the window is being dragged.
- Corners: 4 / 6 / 10 / 18 / round. Round only for avatars and slider knobs, never for chips or buttons.
- Slant: one angle, -24deg skew for marks (the 18x8 team mark, eyebrow mark, nav underline); plates and buttons use the
  clip-path slant (11-14px offset at each end). Tilted panels: skewY(-7deg).
- Tap targets: 44px minimum on touch, 36px on mouse screens.
- Shadow: one lift shadow for "picked up" things (0 18px 30px -16px rgba(30,20,50,.5)); one soft contact shadow under
  standing Pokémon. No glows on mouse screens except feature sprites (smooth scrolling on Sim's Windows desktop).

## 4b. Glow (Sim, Nov 10: "the glow ... is so gorgeous and eye catching. please make sure we dont lose that")
The soft coloured light behind the Pokémon is a signature of the design, not decoration to trim. Reference: the dark Home
concept Sim sent on Nov 10 (hero, Strength Score, pairs, team preview, speed, this week: each scene lit by its Pokémon).
- Every scene with Pokémon in it gets its glow: large soft pools of the Pokémon's own borrowed colours behind and under
  them, strongest in Dusk; in light mode the same pools as a gentle tint. The giant number (Strength Score) and the hero
  carry the strongest glow. Pokémon stand in the light with a reflection/contact shadow.
- This replaces the Nov 10 decision "colour pools only on the Home hero and the Strength Score": Sim's word wins.
- Built so scrolling stays smooth on Sim's Windows desktop (the reason glow was limited before): pools are static
  radial gradients painted once per scene (no CSS filter: blur, no backdrop-filter, no box-shadow glows on sprites, no
  animation tied to scroll, no will-change on filtered sprites), each scene isolated (contain: paint). The old rule "sprite
  glow off on mouse screens" was about drop-shadow FILTERS on every sprite and stays; scene glow is a different, cheap
  technique. Measured against docs/rebuild/baseline.json before it ships; if a page scrolls worse, the pools get cheaper
  (smaller, fewer stops), never removed.
- Strength (Sim, Nov 11, after comparing: "looks so much better without so much heavy glow ... a light faint glow but not
  more"): FULL glow only where ONE Pokémon is the star (the hero, the Strength Score, the picked Pokémon's panel, a pair);
  wherever many Pokémon sit together (a box, a team row, a list) each gets only a light, faint glow (about a third of the
  full strength) and the row tint stays subtle, so the art, not the light, carries the grid.
- Readability: text never sits on the brightest part of a pool; names and numbers on glow pass contrast (checked).

## 5. Motion
- Durations 150 (state), 250 (slide, lift), 400 (sheet, box flip); easing cubic-bezier(.2,.8,.2,1).
- Purposeful only: the slider pill sliding, a Pokémon lifting out of the box, the summary sheet sliding up, the box
  wallpaper shifting when flipping boxes, the score counting once on first show.
- prefers-reduced-motion: every animation becomes an instant change (no fade substitutes that still move).
- Never animate layout on scroll; never give filtered sprites their own layers (will-change).

## 6. Components (one rule each)
| Component | Rule |
|---|---|
| Filled button | One per area, the main action. --plate background, Unbounded 14-15 slanted, clip-path slant, 52 high (44 compact). |
| Secondary button | Outlined slanted box, 1.5px --ink, Instrument Sans 600. |
| Link | Instrument Sans 600, 1.5px underline; "›" rows for lists of actions (Copy box link ›). |
| Chip | ONE style: slanted parallelogram (clip-path), 36 high touch / 32 mouse, --wash fill, selected = --plate fill. Used for sort options, filters, type labels (type colour fill). No rounded pills anywhere. |
| Slider | Today's Apple-style sliding picker (76-slide.js) carried over as a first-class component: 2-4 choices, icon + label, the pill slides; checked at narrowest and widest real size. |
| Tabs | Text tabs with the slanted --plot underline (nav style); swipe on phones where today's page allows it. |
| Jump bar | Sticky row of section links on long pages (My Team: Set, Matchups, Suggestions, Sheet). |
| Tags | Lead / Back / Bench (text under the sprite, --ink-2, 13), verdict tags (verdict colour text + small mark), "On your team" (slanted mark). |
| Sprite panel | Tilted ray panel (skewY -7deg) in the Pokémon's borrowed colours with the ray motif, art standing on it; rating plate ("Rated 92 · S tier") on its lower edge. |
| Score lockup | The giant Unbounded number, used ONLY for the Strength Score: number, band word, the rank line small underneath. |
| List row | Sprite or mark, text, value; hairline --rule between rows; no card per row. |
| Table | Full-width, hairline rows, sticky header, tabular numbers; scrolls sideways inside itself on phones, never the page. |
| Sheet / modal | Phones: slides up from the bottom, swipe down to close. Desktop: right-hand panel or centred sheet. Focus returns to what opened it. |
| Toast | Bottom, one line, with Undo where something changed. |
| Empty state | Darkrai (only on empty and loading screens, each spot shown to Sim first), one line, one action. |
| Form field | 52 high, 1.5px --ink border, slanted for the main search/add field (the concept's Add a Pokémon). |
| Search | One search, finds every page and every Pokémon by the approved names. |

## 7. Page templates
- Hero band: big slanted headline (two lines), one supporting line, one main action, the tilted ray panel with the
  feature Pokémon. Home only, trimmed by one layer (R0).
- Work area: three columns at 1440+ (controls / main / details), two at 1000-1439, one on phones with a jump bar.
- Full-width table: Team Sheet, Ratings, Usage.
- Story section: Home sections (Strength Score, pairs, team preview, tool list), each one idea.

## 8. Checks every page passes (automated where possible)
- Behaviour tests (app/test/behaviour) for every inventory feature on the page.
- Polish check rewritten for this system: type scale, 4px grid, Unbounded slanted for every headline and number, line
  height 1.5, contrast in light and Dusk, no text out of its box, no lone tile or half-filled row, no empty half on desktop,
  no boxes in boxes, one size per kind of control, 320-2560 with no sideways scroll.
- The agreed-rules list in docs/rebuild-plan.md ("Must match what we already agreed").
- Smooth-scroll measurement against docs/rebuild/baseline.json.

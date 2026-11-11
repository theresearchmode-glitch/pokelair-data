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
| --pick | #E8364F (text #C41E35) | #FF5C77 | the logo's NASTY pink: the selected Pokémon's cursor and name (Sim, Nov 11: not blue) |
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

Borrowed-colour limits (Nov 11): a colour taken from a sprite is clamped to lightness 25-75% and its saturation capped before use, so a very pale (Whimsicott) or very dark (Darkrai) Pokémon never makes text on its panel unreadable; contrast is then measured as usual.

Type colours: one fixed set of 18 (the concept's TY map), used only for type chips, move tints and Mega contours, never
as large fields. Borrowed colour: computed from each sprite (the concept's dominant-hue method), mixed with --wash at
30-58% so names on it pass contrast; checked by the polish check on every box and panel.

Dark Pokémon on Dusk: some art is nearly black (Paldean Tauros 10250-10252, Darkrai, Corviknight, Umbreon) and
disappears on #1B1A22 without help (seen on the full contact sheet, Nov 10). On Dusk every sprite stands on its borrowed
--wash panel or gets a soft light contact glow under it (feature sprites only on mouse screens); pale Pokémon get the
mirror rule in light mode (a deep enough panel, the agreed "pale Pokémon stand out" rule).

## 2b. Sim's decisions on the Nov 11 reference set (docs/rebuild/reference-2026-11-11)

Sim chose these in conversation on Nov 11. They override anything earlier in this file that disagrees.

- **Night mode = the reference's night (section 6 there).** It replaces the "dusk" values. The tokens live in docs/rebuild/mocks/tokens.css, which keeps the internal name `dusk` for now. One blue main action per screen (Save Team). Other plates are raised dark surfaces with a lit top edge. Outline buttons have a 42% light border. Grain is about 5% at night and about 3.5% by day.
- **The selected Pokémon stands on the tilted panel** (skewY -7deg, 6px corners) in its normalised colour, scaled up 8% from its feet, with its name in ink at weight 800. This replaces the pink corner brackets. `--pick` is no longer used for selection.
- **Borrowed colour is always normalised**: keep the hue, saturation at least 72%, lightness 56% (`--cp`). This applies to floor pools, the selection panel and the Set panel.
- **Shared floor on desktop** (a 1px line fading at both ends, with a soft spill below; no Bench divider). Each Pokémon is grounded in its own colour: by day a contact shadow inside a pool of its colour, at night a pool of light plus a thin rim on the art.
- **Score light: Sim KEPT her team-colour light** (the shared atmosphere behind the number, the six and the action row). The reference's "no light behind the score" is not adopted. Blue stays only in the band words.
- **Weather that follows the team: deferred** (Sim: "I like the color more than the rain"). If it comes back later: a faint static tint only, only for teams that are clearly one style, and no motion until a scrolling-speed test passes. It is on the Plans page ideas list.

- **Every Pokémon stands on the floor; no free-floating clouds** (Sim, Nov 11, "make sure this design rule follows us"). A Pokémon shown on its own (featured, underdog, info sheet, Set panel, empty screens) stands on a floor with a pool of colour at its feet, like the six on My Team. It never floats in a coloured cloud or halo. A featured Pokémon's extra "fun glow" is a thin brand-coloured rim on the art (PLOT blue, with a touch of the logo's pink) plus a pool in those colours. Any pulse moves only the opacity of the pool's own layer, never the art, and stops when reduce motion is on.
- **The main action is always the filled plate** (Sim, Nov 11). Each block or screen's main action ("Build around it", "Try the sample team", Save Team) is the filled slanted plate: black by day, the blue action at night. Secondary actions are outline buttons or text links. Never draw the main action as the quiet outline button.

Corrections to the reference README:
- The "85 vs 92" is not two sources. 85 is the raw total in ratings_log and 92 is the displayed rating after RS(). One function shows both, so there is nothing to merge.
- "Saved on this device only" is true only for the public site. Today's site syncs to the Claude account, so the first-visit note needs two versions.
- CLAUDE.md already says Darkrai replaced Shady Paw. Whether empty screens use Darkrai or a featured Pokémon is still Sim's call.

## 3. Type
- Faces: Unbounded (display: every headline, big number, the tagline, plates, the filled button), always slanted
  (synthetic italic, font-synthesis: style), weight 800-900; Instrument Sans (everything else), 400/500/600/700.
- Sizes: 13 / 15 / 16 / 17 / 20 / 22 / 24 / 26 / 28 / 34, plus display sizes for page titles (36 phone, clamp(46px,4.4vw,64px)
  desktop) and the hero/score number (54 phone, 64-120 desktop). Body 16 (phone) / 17 (desktop). Smallest text 13.
- Line height: paragraphs 1.5; headlines 1.02-1.1 with letter-spacing -0.02em (loose enough that words never run together).
- Headline pattern: first line --ink, second line --plot ("Sharply raise / your win rate.").
- Numbers: tabular figures everywhere (font-variant-numeric: tabular-nums; measured: Instrument Sans supports it). Units
  ("%", "games", "/ 100") one size smaller and in --ink-2.
- Unbounded only at 15px and up (Sim, Nov 11): headlines, big numbers, plates, the filled button. Anything smaller is
  Instrument Sans (600-700). Unbounded has no true italic; small sizes look distorted when slanted.

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
| Score lockup | The giant Unbounded number, used ONLY for the Strength Score: number, band word (the only blue), the rank line small underneath. Behind it no spotlight: one wide, low band of light mixed from the six Pokémon's own colours, behind the number and the team together (Sim chose this, Nov 11; reference docs/redesign/concepts/sim-score-option1-shared-atmosphere.webp). |
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


## 9. Page length and polish (Sim, Nov 11). Every page is checked against this before Sim sees it.

Why: the old pages grew because every feature was added to the bottom and nothing said "this page is full". These limits make "full" measurable. Heights are recorded in docs/rebuild/page-heights.md and measured by experiments/page-heights.mjs (today's site) and experiments/mock-heights.mjs (rebuild).

**9.1 Length limits.** Full page height, everything in its default state (nothing expanded by the user).

| Size | Tool page | Home |
|---|---|---|
| Phone 390 x 844 | 4 screens, about 3,400px | 5 screens, about 4,200px |
| iPad 820 x 1180 | 3 screens, about 3,500px | 3 screens, about 3,500px |
| Desktop 1440 x 900 | 2 screens, about 1,800px | 3 screens, about 2,700px |

A page over its limit is not finished.

**9.2 The limits are starting points, not facts.** They came from one mock-up.
- If a page can't fit, never shrink text, tighten spacing or drop a feature to make it fit. Stop and send Sim the page, its height, what is taking the space, and two options for what to move behind a tap. Sim decides.
- Likely exceptions are the full Team Sheet, "All 30" matchups, the Ratings list and the damage calc. For each, propose a limit and the reason before building.
- If a limit is too loose (a page fits but still feels long), say so.

**9.3 How to stay inside.**
- Each page has one job, and its answer is on the first screen at all three sizes.
- Show the summary; the detail is one tap away (a sheet, an expanding row or a tab). Nothing is removed.
- Long lists show the top 5 to 10 with "See all", never 30 rows open by default.
- On phone, only one section is open at a time.
- On desktop, use side-by-side columns before stacking.
- Any page taller than 2 screens on phone gets a sticky jump bar.
- No section repeats information already shown higher on the same page.

**9.4 Shorter pages mean more taps.**
- The most-used actions stay at most one tap from the first screen. For My Team those are: change a Pokémon, edit a set, see matchups, see suggestions, save, share, copy for Showdown.
- Before hiding anything, list it with its taps today and taps after. Anything going from 0 or 1 taps to 2 or more needs Sim's yes.
- Nothing is more than 2 taps deep.
- Anything hidden has a visible label saying what's inside and how much ("All 30 matchups", "7 checks").
- An expanded section stays open when the user comes back to the page in the same visit.

**9.5 Formatting checks.** Every page, in day and night, at all three sizes:
- No sideways scroll, and nothing cut off at the edge.
- No clipped, overlapping or hidden text. Test with the longest names (Mega Charizard Y, Wash Rotom) and the largest numbers (100, 100.0%, 13,826).
- No half-filled rows and no empty strips.
- Spacing on the 4px scale and text on the type scale.
- Items in a row share a baseline, and columns share a left edge.
- Nothing under 13px. Tap targets at least 44px on phone.
- At most one coloured surface per screen, and no boxes in boxes.
- Every Pokémon is named, and every number has a label and a unit.
- Test three states: a full team, 1 to 5 Pokémon, and no team.

**9.6 Proof per page.**
- Six screenshots: 3 sizes x day and night.
- Its row in the height table.
- Which checks a script ran and which were checked by eye only (never "checked" for eye-only).
- The behaviour test results for that page.
- What could not be checked.

**9.7 Conflicts.** If any of this conflicts with another rule here or in CLAUDE.md, don't pick one silently. Name both rules and ask Sim.


## 10. Rebuild rules from the site review (Sim, Nov 11)

Status of each item is in docs/rebuild-plan.md, "Review rules".

1. **One source for every number.** Every page reads ratings and stats from one function, the displayed rating `RS(rating(p).total)`, and shows the date its data was last updated. A Pokémon with too few games says so in words. Never show a blank, a zero, or an old number as if current.
2. **No player names or handles anywhere**, on any page or in any data file that reaches the page. List what is found before removing anything.
3. **Nothing depends on Claude to work.** Every Claude-only feature has a planned public replacement before pages are built on it. On the public site, teams live on the visitor's device only, and export and import are easy to find.
4. **A new visitor's first minute.** With no team, no score is shown. Every page looks finished with no team, no box and no saved data. Nothing reserves space for a mascot.
5. **Speed limits, measured.** There is a page size limit and per-section loading. The minify step must run. Glow, blur, reflections and weather each need a mouse-wheel scrolling measurement before they stay. Filtered sprites never get their own layers. All movement stops under reduced motion.
6. **Words.** Every beginner term has a plain explanation one tap away. One name per thing, from the CLAUDE.md word list; two names for one thing go to Sim. Never call the site an "app".
7. **Readable by everyone.** Text contrast is at least 4.5 to 1 on every colour it sits on, including colours from Pokémon art, in day and night. Verdicts never rely on colour alone. Everything works by keyboard on desktop, with a visible focus outline.
8. **Setup and tests.** A package.json makes `npm ci` work. While working, run the affected behaviour group; run the full run before anything replaces a live page. A test that passes on one machine and fails on another is reported, never hidden. Any change to a test is reported to Sim with the reason.
9. **Ownership is open.** The art and the name are not settled. All art is loaded from one place in the code so it can be swapped.
10. **Conflicts are raised, not settled silently.**

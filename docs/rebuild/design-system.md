# NastyPlot design system (rebuild R2, draft 1, Nov 10; colours, shadow and section 9 brought up to date with the shipped CSS Nov 17)

The one source for how the rebuilt site looks. Every page is built only from these tokens and components; anything new
is added here first. Sources: the "flair" concept (docs/redesign/concepts/, docs/redesign/box/), Sim's rules in CLAUDE.md,
the R0 decisions and the agreed-rules checklist in docs/rebuild-plan.md, and the final-suggestion decisions
(docs/rebuild/decisions-final-suggestions.md). Status: draft for the R2 mock-ups; values are checked (contrast measured,
sizes on the scale) as the mock-ups are made, and anything that changes is noted here with the date.

## 1. Principles (in order; a later one never overrides an earlier one)
1. Real data, nothing lost: every feature in docs/rebuild/inventory/ survives and passes its behaviour test.
2. The Pokémon carry the page: their art is the largest, most vivid thing on every screen.
3. Readable first: contrast passes in day and Night, every Pokémon named, no shrinking one label to fit.
4. Colour is borrowed from the Pokémon on screen (floor pools, the selected panel, the box wallpaper); that is the theme and
   stays as it is. Fixed colours: the logo blue, section marks, bands, verdicts, and the meaning colours (Sim, Nov 12, 8:46 PM):
   a small fixed set, red = danger, green = good, amber = caution, used ONLY for small status marks (tags, verdict words,
   warning labels, damage cells), never for large areas or backgrounds.
4b. Colour must always say something (Sim, Nov 12, 8:46 PM). Every colour on a screen means one thing: a type, a danger, a
   band, a verdict, the selected Pokémon, the Pokémon's own colour. A colour with no meaning is not added.
5. One coloured surface per screen at most (the hero panel, the box wallpaper, the score lockup), page + one card colour,
   no boxes inside boxes.
6. NastyPlot's voice in fixed places: logo, slanted Unbounded headlines with the blue second half, the tilted ray panel,
   slanted plates, slanted marks. Used sparingly so each one still means something.
7. Dense where you work (My Team, Battle, My Box, info sheet), airy where you arrive (Home).
8. Keep the WOW: when a fix could go plainer or stay bold, stay bold.

## 2. Colour tokens
Names are roles, not colours. Day is the default; Night is the dark mode (data-theme="night"; earlier drafts called it
"Dusk", the same mode). The values below are the shipped ones (Nov 17); section 11 lists all 195 tokens with both values,
generated from app/src/v2/css/tokens.css, and CI fails if this doc falls behind it (app/test/tokens-doc.mjs).

| Token | Day | Night | Use |
|---|---|---|---|
| --bg | #FBFAF7 | #12121B | page |
| --surface | #FFFFFF | #1D1C29 | the one card colour (sheets, panels, table rows on hover) |
| --wash | #F4F0EA | #201F2D | base under borrowed colour (box wallpaper, ray panels) |
| --ink | #17161A | #E4E0DA | headlines, body text |
| --ink-2 | #48454F | #C4BFCB | secondary text, labels |
| --ink-3 | #66636E | #B0AAB8 | captions, the smallest text (still must pass 4.5:1) |
| --rule | rgba(23,22,26,.11) | rgba(228,224,236,.10) | hairline dividers |
| --plot | #0078BF (text #0068AD) | #62BEF7 | logo PLOT blue: second line of headlines, links, focus, slanted marks, active state |
| --pick | #E8364F (text #C41E35) | #F0708A (text #F58DA1) | the logo's NASTY pink: the selected Pokémon's cursor and name (Sim, Nov 11: not blue) |
| --plate | #17161A | #343348 | slanted plates and the filled button (text: --on-plate) |
| --them | #B4238F (text #9A1A7B) | #E57FD3 (text #EC9BDF) | the other team / Team B (Sim, Nov 15 Q1: magenta, clearly apart from red) |

Bands (Strength Score; the "never red" rule was removed by Sim, Nov 12, 8:36 PM): Top tier --band-top #0078BF, Tournament
ready --band-ready #7B4BD6, Solid --band-solid #6B6570, Needs work --band-work #E9A800 (text: --band-work-text = --mid-text),
Missing a basic --band-miss = --bad-text (red; Sim, Nov 13, My Team Q3 B). Night: #62BEF7, #C9B0FF, #B0AAB8, #F0C768, #FF8A80.

Verdicts: Favoured / Beats it --good = --plot (blue; Sim, Nov 12, 8:53 PM; it was green #2E9E5B in draft 1); Handles it
--plot; Even match / Shaky --mid #E9A800 (Night #F0C768); Unfavoured / No answer --low #8A7C6E (Night #B8AA9C).
Meaning colours (Sim, Nov 12, 8:46 PM; small status marks only, rule 4): danger --bad #D93A3A, text --bad-text #B3261E /
Night --bad #FF7A70, text #FF8A80; good = --good / --good-text; caution = --mid / --mid-text.
Where red goes is shown to Sim with pictures first (first use: Battle's high-danger warnings, "Hurts you", the Unfavoured verdict).

Measured contrast (Nov 17, WCAG ratio on --bg, by app/test/tokens-doc.mjs): Day ink-2 8.98, ink-3 5.63, --plot 4.53 (passes,
just; small link text uses --plot-text 5.61), --pick-text 5.61, --them-text 7.17, --bad-text 6.26; Night ink-2 10.34,
ink-3 8.23, --plot 9.07, --pick-text 8.16, --them-text 9.15, --bad-text 8.15.
The day verdict and band FILL colours are too pale for text (--mid 2.00, --low 3.88, --band-work 2.00), so text uses darker
partners: --mid-text #8A5A00 (5.68), --low-text #6E6153 (5.75), --good-text = --plot-text (5.61). Night fills pass as text
(--mid 11.59, --low 8.22). Tier letters (--tier-*) are fills with --tier-ink / --tier-lit text on them, never text on the page.

Borrowed-colour limits (Nov 11): a colour taken from a sprite is clamped to lightness 25-75% and its saturation capped before use, so a very pale (Whimsicott) or very dark (Darkrai) Pokémon never makes text on its panel unreadable; contrast is then measured as usual.

Type colours: one fixed set of 18 (the concept's TY map), used only for type chips, move tints and Mega contours, never
as large fields. Borrowed colour: computed from each sprite (the concept's dominant-hue method), mixed with --wash at
30-58% so names on it pass contrast; checked by the polish check on every box and panel.

Dark Pokémon on Night: some art is nearly black (Paldean Tauros 10250-10252, Darkrai, Corviknight, Umbreon) and
disappears on the night page without help (seen on the full contact sheet, Nov 10). On Night every sprite stands on its borrowed
--wash panel or gets a soft light contact glow under it (feature sprites only on mouse screens); pale Pokémon get the
mirror rule in light mode (a deep enough panel, the agreed "pale Pokémon stand out" rule).

## 2b. Sim's decisions on the Nov 11 reference set (docs/rebuild/reference-2026-11-11)

- **Mega is always clear, never louder than the name (Sim, Nov 11: "hard to see", then "the MEGA is bigger than the name")**:
  the word "Mega" is part of the name, at the name's own size, bold, in PLOT blue ("**Mega** Charizard Y"). Rows of standing
  Pokémon and narrow lists put it on its own line above the name (the slot is kept, so names stay on one line). No backing
  behind the word (Sim, Nov 11): the art, its colour pool and the selected panel live in one stage above the name block, so the
  glow can never reach the name.

Sim chose these in conversation on Nov 11. They override anything earlier in this file that disagrees.

- **Night mode = the reference's night (section 6 there).** It replaces the "dusk" values. The tokens live in app/src/v2/css/tokens.css (the mock-ups' own copy, docs/rebuild/mocks/tokens.css, keeps the old `dusk` name and values; it is history, not the source). One blue main action per screen (Save Team). Other plates are raised dark surfaces with a lit top edge. Outline buttons have a 42% light border. Grain is about 5% at night and about 3.5% by day.
- **The selected Pokémon stands on the tilted panel** (skewY -7deg, 6px corners) in its normalised colour, scaled up 8% from its feet, with its name in ink at weight 800. This replaces the pink corner brackets. `--pick` is no longer used for selection.
- **Borrowed colour is always normalised**: keep the hue, saturation at least 72%, lightness 56% (`--cp`). This applies to floor pools, the selection panel and the Set panel.
- **Shared floor on desktop** (a 1px line fading at both ends, with a soft spill below; no Bench divider). Each Pokémon is grounded in its own colour: by day a contact shadow inside a pool of its colour, at night a pool of light plus a thin rim on the art.
- **Score light: Sim KEPT her team-colour light** (the shared atmosphere behind the number, the six and the action row). The reference's "no light behind the score" is not adopted. Blue stays only in the band words.
- **Weather that follows the team: deferred** (Sim: "I like the color more than the rain"). If it comes back later: a faint static tint only, only for teams that are clearly one style, and no motion until a scrolling-speed test passes. It is on the Plans page ideas list.

- **Every Pokémon stands on the floor; no free-floating clouds** (Sim, Nov 11, "make sure this design rule follows us"). A Pokémon shown on its own (featured, underdog, info sheet, Set panel, empty screens) stands on a floor with a pool of colour at its feet, like the six on My Team. It never floats in a coloured cloud or halo. Sim's review, Nov 11 (item 13), replaces the earlier brand-coloured "fun glow": "No free-floating glows. Colour sits on the floor under its Pokémon or on a panel." A featured Pokémon (today's underdog on Guide, empty My Team, empty My Box) stands on the selected Pokémon's floor ring and pool in its OWN colour (V2.mon with `ft`, `--cp` from ART_META), with no coloured glow on the art; its main action is the filled button. Any pulse moves only the opacity of the pool's own layer, never the art, and stops when reduce motion is on.
- **The main action is always the filled plate** (Sim, Nov 11). Each block or screen's main action ("Build around it", "Try the sample team", Save Team) is the filled slanted plate: black by day, the blue action at night. Secondary actions are outline buttons or text links. Never draw the main action as the quiet outline button.

- **Forms in the info sheet** (Sim, Nov 11): any Pokémon with a Mega (or more than one, like Charizard X / Y or Garchomp / Garchomp Z) shows a "N forms" strip at the top of its sheet. There is one tab per form, each with its art on a small floor, its name and its rating. The open form is marked in light blue by day (night: the soft wash) (Sim's D12-14 choice, Nov 11, built 7adf7ba; this line used to say "on the tilted panel in its own colour", the older mock-up). A tap swaps the whole sheet to that form and keeps the same tab open (role=tablist, arrow keys on desktop). Mock-up: docs/rebuild/mocks/sheet.html.

- **Rows of Pokémon line up** (Sim, Nov 11: "not in a line, it's not symmetrical"). In any row of Pokémon, the feet sit on one line, so the art is dropped by each picture's own empty margin under the feet (measured from the image). Names sit on one line too: every name reserves the space of the small "MEGA" label, so a Mega never pushes its name below its neighbours. Items and ratings line up under the names.

Corrections to the reference README:
- The "85 vs 92" is not two sources. 85 is the raw total in ratings_log and 92 is the displayed rating after RS(). One function shows both, so there is nothing to merge.
- "Saved on this device only" is true only for the public site. Today's site syncs to the Claude account, so the first-visit note needs two versions.
- Decided (Sim, Nov 11): empty and loading screens show the rotating featured underdog (Flapple first). Shady Paw is cut and
  is not the mascot; Darkrai is cut from the rebuild. See CLAUDE.md.

## 3. Type
- Faces: Unbounded (display: every headline, big number, the tagline, plates, the filled button), always slanted
  (synthetic italic, font-synthesis: style), weight 800-900; Instrument Sans (everything else), 400/500/600/700.
- Sizes: 13 / 15 / 16 / 17 / 20 / 22 / 24 / 26 / 28 / 34, plus display sizes for page titles (36 phone, clamp(46px,4.4vw,64px)
  desktop) and the hero/score number (54 phone, 64-120 desktop). Body 16 (phone) / 17 (desktop). Smallest text 13.
- Line height: paragraphs 1.5; headlines 1.02-1.1 with letter-spacing -0.02em (loose enough that words never run together).
- Headline pattern: first line --ink, second line --plot ("Sharply raise / your win rate.").
- Names only on tabs, menus and navigation (Sim, Nov 12, 10:39 PM): no counts or extra detail beside a tab or menu name (no '24 pairs', '0 games', 'top 20'); details belong inside the page.
- Capitalisation (Sim, Nov 12, 10:31 PM): Title Case for anything you tap or navigate by (menus, tabs, buttons, chips, the tools bar) and for section headings; sentence case for sentences (headline sentences ending in a full stop, like the tagline, stay sentences), descriptions, notes and eyebrow lines. Short joining words stay lowercase: a, an, the, and, or, for, of, in, on, to, at, by, vs, from, with (as in Copy for Showdown, Import from Showdown).
- Numbers: tabular figures everywhere (font-variant-numeric: tabular-nums; measured: Instrument Sans supports it). Units
  ("%", "games", "/ 100") one size smaller and in --ink-2.
- Unbounded only at 15px and up (Sim, Nov 11): headlines, big numbers, plates, the filled button. Anything smaller is
  Instrument Sans (600-700). Unbounded has no true italic; small sizes look distorted when slanted.
  Named exception (Sim, Nov 16, batch 3B; pictures: pics/nov17/unbounded-13px-before-after.png): Unbounded may go down to 13px for
  (a) short stamps and tags on a plate or ticket (Mega, KO, 1st, Called it, Start here, Biggest rise, #1 right now, No. 1, Your style,
  Your team, Latest result, the small plate labels) and (b) a name fitted down to its card so it matches its neighbours (fitWords).
  Instrument Sans there flattened the stamps. app/test/v2-unbounded.mjs lists these kinds and fails on any new one.
- Eyebrows (Sim, Nov 16, batch 6A): written in sentence case in the code, shown in capitals (text-transform). The rule is about the
  source text; the capitals are the approved look.

## 4. Space, size, shape
- Spacing on a 4px grid (1, 2 and 6 allowed for hairlines and optical fixes): 4 8 12 16 20 24 32 40 48 64 96.
- Page gutters: 16 (phone) / 32 (tablet) / 96 (desktop 1440+), max content width 1440, centred.
- Breakpoints: 700 (phone to tablet), 1000 (two-column work area), 1440 (three columns). Layouts are fluid between them
  and must hold at every width from 320 to 2560 and while the window is being dragged.
  The shipped CSS (counted Nov 16, batch 7A: document now, merge after the switch) uses more: the main edges are 700 (245 rules),
  1100 (89), 360 (52), 900 (44), 1024 (35), 380 (30), 480 (18), 520 (17), 1280 (18), 1180 (22), 600 (15), and about 50 one-off widths
  (414, 1366, 1680...). Most one-offs fit a single component (a name, a button row) at an odd width Sim tests. Merging them to about
  6 is a large change (about 170 media rules plus a full width sweep), planned for after the switch.
- Corners: 4 / 6 / 10 / 18 / round. Round only in chosen spots (Sim, Nov 12, 8:46 PM; was "round only for avatars and slider knobs"): small count badges, dots on slider tracks, the day/night switch, small pop-up tips, and Pokémon circles in compact lists. Buttons, plates and chips stay slanted: they are part of the WOW.
- Slant: one angle, -24deg skew for marks (the 18x8 team mark, eyebrow mark, nav underline); plates and buttons use the
  clip-path slant (11-14px offset at each end). Tilted panels: skewY(-7deg).
- Tap targets: 44px minimum on touch, 36px on mouse screens.
- Shadow: one lift shadow for "picked up" things (--shadow-lift, three layers: day 0 1px 2px rgba(30,20,50,.10), 0 8px 16px -6px rgba(30,20,50,.18), 0 24px 40px -18px rgba(30,20,50,.30); night the same shape in black at .35/.45/.6); one soft contact shadow under
  standing Pokémon. No glows on mouse screens except feature sprites (smooth scrolling on Sim's Windows desktop).

## 4b. Glow (Sim, Nov 10: "the glow ... is so gorgeous and eye catching. please make sure we dont lose that")
The soft coloured light behind the Pokémon is a signature of the design, not decoration to trim. Reference: the dark Home
concept Sim sent on Nov 10 (hero, Strength Score, pairs, team preview, speed, this week: each scene lit by its Pokémon).
- Every scene with Pokémon in it gets its glow: large soft pools of the Pokémon's own borrowed colours behind and under
  them, strongest at Night; by day the same pools as a gentle tint. The giant number (Strength Score) and the hero
  carry the strongest glow. Pokémon stand in the light with a reflection/contact shadow.
- This replaces the Nov 10 decision "colour pools only on the Home hero and the Strength Score": Sim's word wins.
- Built so scrolling stays smooth on Sim's Windows desktop (the reason glow was limited before): pools are static
  radial gradients painted once per scene (no CSS filter: blur, no backdrop-filter, no box-shadow glows on sprites, no
  animation tied to scroll, no will-change on filtered sprites). Scenes are NOT isolated with contain: paint (measured Nov 17,
  experiments/contain-check.mjs: it changed 19,884-75,330 pixels per page at 390 wide, because glows spill past their section on
  purpose, and scrolling was already at 60 frames a second with or without it in the headless check). The old rule "sprite
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
| Slider | Today's Apple-style sliding picker (76-slide.js) carried over as a first-class component (Sim, Nov 11: keep it): 2-4 choices, icon + label, the dark plate slides. Built as `V2.slide()` (Nov 11) with today's icons (shared `05-icons.js`); desktop and tablet put the icon beside the name, as in the approved mock-ups; phones under 520px put it above the name, like today's iPhone-style picker, so every choice fits at 320. Arrow keys move between choices. |
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
  height 1.5, contrast in day and Night, no text out of its box, no lone tile or half-filled row, no empty half on desktop,
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

These limits are a target for future work, not a gate (Sim, Nov 16, 6:53 AM: "a target for future work, not a gate that blocks the switch"; decisions.md). A page over its limit is measured and noted, and cutting it is planned work, never a reason to hold a page back.

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
3. **Nothing depends on Claude to work** (Sim, Nov 11: keep account sync and the Claude features until we prepare the public launch; the public replacements are a launch-prep step, and the rebuild keeps "saves to your Claude account" until then). Every Claude-only feature has a planned public replacement before pages are built on it. On the public site, teams live on the visitor's device only, and export and import are easy to find.
4. **A new visitor's first minute.** With no team, no score is shown. Every page looks finished with no team, no box and no saved data. Nothing reserves space for a mascot.
5. **Speed limits, measured.** There is a page size limit and per-section loading. The minify step must run. Glow, blur, reflections and weather each need a mouse-wheel scrolling measurement before they stay. Filtered sprites never get their own layers. All movement stops under reduced motion.
6. **Words.** Every beginner term has a plain explanation one tap away. One name per thing, from the CLAUDE.md word list; two names for one thing go to Sim. Never call the site an "app".
7. **Readable by everyone.** Text contrast is at least 4.5 to 1 on every colour it sits on, including colours from Pokémon art, in day and night. Verdicts never rely on colour alone. Everything works by keyboard on desktop, with a visible focus outline.
8. **Setup and tests.** A package.json makes `npm ci` work. While working, run the affected behaviour group; run the full run before anything replaces a live page. A test that passes on one machine and fails on another is reported, never hidden. Any change to a test is reported to Sim with the reason.
9. **Ownership is open.** The art and the name are not settled. All art is loaded from one place in the code so it can be swapped.
10. **Conflicts are raised, not settled silently.**

## 11. Token reference (generated)

<!-- tokens:start (generated by app/test/tokens-doc.mjs --write; do not edit by hand) -->

Generated from app/src/v2/css/tokens.css: 196 tokens (196 by day, 86 changed by night). Contrast is the WCAG ratio of a solid colour on that theme's page background (--bg), shown only for plain colours; text needs 4.5 (3 for large text and marks).

**Core colours** (14)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --bg | `#FBFAF7` | `#12121B` | 1.00 / 1.00 |
| --surface | `#FFFFFF` | `#1D1C29` | 1.04 / 1.11 |
| --wash | `#F4F0EA` | `#201F2D` | 1.09 / 1.15 |
| --ink | `#17161A` | `#E4E0DA` | 17.25 / 14.16 |
| --ink-2 | `#48454F` | `#C4BFCB` | 8.98 / 10.34 |
| --ink-3 | `#66636E` | `#B0AAB8` | 5.63 / 8.23 |
| --rule | `rgba(23,22,26,.11)` | `rgba(228,224,236,.10)` |  |
| --plot | `#0078BF` | `#62BEF7` | 4.53 / 9.07 |
| --plot-text | `#0068AD` | `#62BEF7` | 5.61 / 9.07 |
| --pick | `#E8364F` | `#F0708A` | 3.97 / 6.55 |
| --pick-text | `#C41E35` | `#F58DA1` | 5.61 / 8.16 |
| --plate | `#17161A` | `#343348` | 17.25 / 1.52 |
| --on-plate | `#FBFAF7` | `#F1EDE7` | 1.00 / 15.96 |
| --plate-link | `#62BEF7` | `#62BEF7` | 1.97 / 9.07 |

**--band-*** (7)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --band-top | `#0078BF` | `#62BEF7` | 4.53 / 9.07 |
| --band-ready | `#7B4BD6` | `#C9B0FF` | 5.27 / 9.87 |
| --band-solid | `#6B6570` | `#B0AAB8` | 5.41 / 8.23 |
| --band-work | `#E9A800` | `#F0C768` | 2.00 / 11.59 |
| --band-miss | `var(--bad-text)` | `var(--bad-text)` | 6.26 / 8.15 |
| --band-work-text | `var(--mid-text)` | `var(--band-work)` | 5.68 / 11.59 |
| --band-glow | `none` | `0 0 22px rgba(79,178,240,.4)` |  |

**--bp-*** (4)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --bp-paper | `#fbfcfe` | `transparent` | 1.02 / – |
| --bp-grid | `#0078bf17` | `#62bef712` |  |
| --bp-grid5 | `#0078bf2e` | `#62bef724` |  |
| --bp-ink | `#0a68a8` | `#62bef7` | 5.65 / 9.07 |

**--card-*** (9)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --card-face-1 | `#FFFFFF` | `#1A1924` | 1.04 / 1.07 |
| --card-face-2 | `#ECEAF2` | `#0C0C13` | 1.14 / 1.05 |
| --card-ink | `#17161A` | `#F4F2EE` | 17.25 / 16.65 |
| --card-giant | `rgba(23,22,26,.11)` | `rgba(255,255,255,.10)` |  |
| --card-line | `rgba(23,22,26,.035)` | `rgba(255,255,255,.03)` |  |
| --card-sheen | `rgba(255,255,255,.55)` | `rgba(255,255,255,.07)` |  |
| --card-edge-mid | `#FFFFFF` | same | 1.04 / 18.62 |
| --card-glow | `.16` | `.30` |  |
| --card-shade | `rgba(30,20,50,.18)` | `transparent` |  |

**Display sizes** (4)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --d64 | `64px` | same |  |
| --d120 | `120px` | same |  |
| --d168 | `168px` | same |  |
| --d-hero | `clamp(34px,6vw,68px)` | same |  |

**--logo-*** (4)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --logo-pink | `#E8364F` | same | 3.97 / 4.50 |
| --logo-blue | `#0078BF` | same | 4.53 / 3.93 |
| --logo-ink | `#17161A` | same | 17.25 / 1.03 |
| --logo-white | `#FFFFFF` | same | 1.04 / 18.62 |

**--main-*** (3)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --main | `#17161A` | `#3FA2E2` | 17.25 / 6.63 |
| --main-hi | `var(--main)` | `#63C0F8` | 17.25 / 9.24 |
| --main-lo | `var(--main)` | `#3FA2E2` | 17.25 / 6.63 |

**--mvc-*** (3)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --mvc-face | `#FFFFFF` | `#15141E` | 1.04 / 1.02 |
| --mvc-ink | `#17161A` | `#F4F2EE` | 17.25 / 16.65 |
| --mvc-sub | `#5E5A66` | `#B0AAB8` | 6.43 / 8.23 |

**--on-*** (8)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --on-main | `#FBFAF7` | `#08131E` | 1.00 / 1.01 |
| --on-mark | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --on-pk-main | `var(--on-plate)` | `var(--on-mark)` | 1.00 / 1.00 |
| --on-x4 | `#FFFFFF` | `#FFFFFF` | 1.04 / 18.62 |
| --on-st | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --on-st-def | `#17161A` | `#12121B` | 17.25 / 1.00 |
| --on-type | `#FFFFFF` | same | 1.04 / 18.62 |
| --on-wx | `#1C1708` | `#1C1708` | 17.12 / 1.04 |

**--podium-*** (3)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --podium-1 | `#f2b705` | same | 1.74 / 10.24 |
| --podium-2 | `#b9c0cc` | same | 1.75 / 10.17 |
| --podium-3 | `#d08a4e` | same | 2.71 / 6.58 |

**Corners (--r-*)** (4)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --r-s | `4px` | same |  |
| --r-m | `6px` | same |  |
| --r-l | `10px` | same |  |
| --r-xl | `18px` | same |  |

**--rc-*** (8)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --rc-paper | `#FFFFFF` | same | 1.04 / 18.62 |
| --rc-ink | `#17161A` | same | 17.25 / 1.03 |
| --rc-ink2 | `#48454F` | same | 8.98 / 1.99 |
| --rc-rule | `rgba(23,22,26,.28)` | same |  |
| --rc-shadow | `rgba(10,8,20,.28)` | same |  |
| --rc-tape | `rgba(0,120,191,.32)` | same |  |
| --rc-good | `#0068AD` | same | 5.61 / 3.18 |
| --rc-bad | `#B3261E` | same | 6.26 / 2.85 |

**Space (--s1 ... --s24, the 4px grid)** (11)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --s1 | `4px` | same |  |
| --s2 | `8px` | same |  |
| --s3 | `12px` | same |  |
| --s4 | `16px` | same |  |
| --s5 | `20px` | same |  |
| --s6 | `24px` | same |  |
| --s8 | `32px` | same |  |
| --s10 | `40px` | same |  |
| --s12 | `48px` | same |  |
| --s16 | `64px` | same |  |
| --s24 | `96px` | same |  |

**--st-*** (6)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --st-hp | `#21804A` | `#2E9E5B` | 4.73 / 5.46 |
| --st-atk | `#C2470F` | `#E0601F` | 4.79 / 5.20 |
| --st-def | `#B58300` | `#D9A21A` | 3.24 / 8.10 |
| --st-spa | `#2B66D6` | `#5B8DF0` | 5.06 / 5.77 |
| --st-spd | `#7E45D1` | `#A27BEA` | 5.50 / 5.81 |
| --st-spe | `#C8346A` | `#E5578A` | 4.84 / 5.37 |

**Type sizes (--t13 ... )** (10)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --t13 | `13px` | same |  |
| --t15 | `15px` | same |  |
| --t16 | `16px` | same |  |
| --t17 | `17px` | same |  |
| --t20 | `20px` | same |  |
| --t22 | `22px` | same |  |
| --t24 | `24px` | same |  |
| --t26 | `26px` | same |  |
| --t28 | `28px` | same |  |
| --t34 | `34px` | same |  |

**--table-*** (3)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --table | `rgba(23,22,26,.035)` | `rgba(255,255,255,.025)` |  |
| --table-line | `rgba(23,22,26,.06)` | `rgba(255,255,255,.045)` |  |
| --table-edge | `rgba(23,22,26,.12)` | `rgba(255,255,255,.10)` |  |

**--tier-*** (9)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --tier-s | `#ffb400` | same | 1.71 / 10.44 |
| --tier-a | `#ff6a3d` | same | 2.73 / 6.54 |
| --tier-b | `#b45cff` | same | 3.40 / 5.24 |
| --tier-c | `#2f9bff` | same | 2.77 / 6.43 |
| --tier-d | `#22b58a` | same | 2.50 / 7.13 |
| --tier-f | `#8a90a6` | same | 3.04 / 5.87 |
| --tier-ink | `#14110f` | same | 18.01 / 1.01 |
| --tier-lit | `#ffffff` | same | 1.04 / 18.62 |
| --tier-shade | `#14110f` | same | 18.01 / 1.01 |

**--tk-*** (5)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --tk-line | `rgba(255,255,255,.09)` | same |  |
| --tk-tear | `rgba(255,255,255,.55)` | same |  |
| --tk-shade | `rgba(10,8,20,.22)` | same |  |
| --tk-ink | `#1A1408` | same | 17.53 / 1.02 |
| --tk-scrim | `rgba(26,20,8,.15)` | same |  |

**--ty-*** (18)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --ty-Dragon | `#5060E1` | same | 4.91 / 3.64 |
| --ty-Ground | `#9A6230` | same | 4.83 / 3.69 |
| --ty-Fighting | `#BE5718` | same | 4.41 / 4.05 |
| --ty-Poison | `#8E3FC8` | same | 5.44 / 3.28 |
| --ty-Dark | `#5A4A56` | same | 7.89 / 2.26 |
| --ty-Steel | `#447C90` | same | 4.44 / 4.02 |
| --ty-Fire | `#D2411E` | same | 4.46 / 4.00 |
| --ty-Water | `#2774D4` | same | 4.44 / 4.02 |
| --ty-Grass | `#28843C` | same | 4.52 / 3.95 |
| --ty-Fairy | `#BF3CB7` | same | 4.43 / 4.03 |
| --ty-Flying | `#3076C7` | same | 4.43 / 4.03 |
| --ty-Ghost | `#6A4BB8` | same | 6.08 / 2.94 |
| --ty-Psychic | `#D6316F` | same | 4.44 / 4.01 |
| --ty-Ice | `#187E97` | same | 4.50 / 3.96 |
| --ty-Rock | `#7D754B` | same | 4.45 / 4.01 |
| --ty-Electric | `#946F00` | same | 4.44 / 4.02 |
| --ty-Normal | `#737571` | same | 4.46 / 4.00 |
| --ty-Bug | `#677C0F` | same | 4.50 / 3.96 |

**--tyn-*** (18)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --tyn-Dragon | `#3E50E0` | same | 5.87 / 3.04 |
| --tyn-Ground | `#E08A3E` | same | 2.56 / 6.98 |
| --tyn-Fighting | `#E67A37` | same | 2.79 / 6.39 |
| --tyn-Poison | `#9B3EE0` | same | 4.84 / 3.69 |
| --tyn-Dark | `#8F8F8F` | same | 3.10 / 5.76 |
| --tyn-Steel | `#3EB5E0` | same | 2.26 / 7.88 |
| --tyn-Fire | `#E35B3B` | same | 3.45 / 5.16 |
| --tyn-Water | `#3E86E0` | same | 3.54 / 5.05 |
| --tyn-Grass | `#3EE062` | same | 1.67 / 10.68 |
| --tyn-Fairy | `#E03ED6` | same | 3.45 / 5.17 |
| --tyn-Flying | `#3E89E0` | same | 3.43 / 5.19 |
| --tyn-Ghost | `#6C3EE0` | same | 5.91 / 3.02 |
| --tyn-Psychic | `#E03E7A` | same | 3.91 / 4.56 |
| --tyn-Ice | `#3DC0E1` | same | 2.05 / 8.71 |
| --tyn-Rock | `#E0C33E` | same | 1.67 / 10.68 |
| --tyn-Electric | `#FFC71F` | same | 1.50 / 11.92 |
| --tyn-Normal | `#8F8F8F` | same | 3.10 / 5.76 |
| --tyn-Bug | `#C4E836` | same | 1.35 / 13.25 |

**--wx-*** (6)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --wx-lo | `rgba(255,255,255,.10)` | same |  |
| --wx-mid | `rgba(255,255,255,.2)` | same |  |
| --wx-hi | `rgba(255,255,255,.34)` | same |  |
| --wx-dk | `rgba(10,8,20,.28)` | same |  |
| --wx-sun | `#E3A51C` | `#D99A1B` | 2.08 / 7.61 |
| --wx-sun-hi | `#F2C44D` | `#F0C25A` | 1.57 / 11.14 |

**Other** (39)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --ray | `rgba(255,255,255,.34)` | `rgba(255,255,255,.045)` |  |
| --ray-art | `rgba(255,255,255,.4)` | `rgba(255,255,255,.05)` |  |
| --them | `#B4238F` | `#E57FD3` | 5.62 / 7.36 |
| --them-text | `#9A1A7B` | `#EC9BDF` | 7.17 / 9.15 |
| --good | `var(--plot)` | `var(--plot)` | 4.53 / 9.07 |
| --good-text | `var(--plot-text)` | `var(--plot-text)` | 5.61 / 9.07 |
| --mid | `#E9A800` | `#F0C768` | 2.00 / 11.59 |
| --mid-text | `#8A5A00` | `#F0C768` | 5.68 / 11.59 |
| --low | `#8A7C6E` | `#B8AA9C` | 3.88 / 8.22 |
| --low-text | `#6E6153` | `#B8AA9C` | 5.75 / 8.22 |
| --bad | `#D93A3A` | `#FF7A70` | 4.36 / 7.33 |
| --bad-text | `#B3261E` | `#FF8A80` | 6.26 / 8.15 |
| --x4 | `#8E1B1B` | `#B71C1C` | 8.66 / 2.83 |
| --pk-main | `var(--plate)` | `var(--plot)` | 17.25 / 9.07 |
| --plot-text-deep | `#035C97` | `#81CBF9` | 6.75 / 10.50 |
| --contact | `rgba(30,20,50,.42)` | `transparent` |  |
| --shadow-lift | `0 1px 2px rgba(30,20,50,.10),0 8px 16px -6px rgba(30,20,50,.18),0 24px 40px -18px rgba(30,20,50,.30)` | `0 1px 2px rgba(0,0,0,.35),0 8px 16px -6px rgba(0,0,0,.45),0 24px 40px -16px rgba(0,0,0,.6)` |  |
| --lit-edge | `inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(0,0,0,.08)` | `inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(0,0,0,.35)` |  |
| --grain | `.035` | `.05` |  |
| --score-ink | `var(--ink)` | `#D6D1CA` | 17.25 / 12.26 |
| --plate-hi | `var(--plate)` | `#3E3D56` | 17.25 / 1.78 |
| --plate-lo | `var(--plate)` | `#2C2B3D` | 17.25 / 1.35 |
| --floor-line | `rgba(23,22,26,.13)` | `rgba(214,218,255,.3)` |  |
| --type-none | `#8E908C` | same | 3.09 / 5.78 |
| --page-wash | `none` | `linear-gradient(180deg,#0C0C14 0,#12121C 280px,#191928 450px,#14141F 620px,#12121B 100%)` |  |
| --scrim | `rgba(23,22,26,.28)` | `rgba(6,6,12,.45)` |  |
| --scrim-deep | `rgba(23,22,26,.55)` | `rgba(8,8,14,.82)` |  |
| --u | `"Unbounded","Instrument Sans",system-ui,sans-serif` | same |  |
| --b | `"Instrument Sans",system-ui,sans-serif` | same |  |
| --unit | `.62em` | same |  |
| --shade | `30,20,50` | same |  |
| --rim | `255,255,255` | same |  |
| --slant | `-24deg` | same |  |
| --tilt | `-7deg` | same |  |
| --gut | `96px` | same |  |
| --tap | `44px` | same |  |
| --tr-electric | `#F4DC3C` | `#E9D23A` | 1.33 / 12.18 |
| --ko-tint | `rgba(217,58,58,.10)` | `rgba(255,122,112,.14)` |  |
| --hp-left | `#2DA84A` | `#3FC060` | 2.95 / 7.91 |

**Set by screen width**

| Width | Token | Value |
|---|---|---|
| (max-width:1179.98px) | --gut | `48px` |
| (max-width:699.98px) | --gut | `16px` |

<!-- tokens:end -->

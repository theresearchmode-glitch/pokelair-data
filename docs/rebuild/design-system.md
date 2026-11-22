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
- **Score light: Sim KEPT his team-colour light** (the shared atmosphere behind the number, the six and the action row). The reference's "no light behind the score" is not adopted. Blue stays only in the band words.
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
  Named exception (Sim, Nov 18, morning questions 1a, "recommend for all is good"; pictures: pics/nov18/postroom-real-desktop-light.png,
  q-1ab-label-today-1440-light.png): the Post Room's parcel (.pr-parcel: kraft paper > white shipping label > ink Copy Code button,
  three shades nested) is a drawing of a parcel, not a card inside a card, so it stays. It covers the same pieces wherever they are
  reused (Home's post band, the Dispatch coupon's code piece). Nothing else is allowed by it.
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

Generated from app/src/v2/css/tokens.css: 585 tokens (582 by day, 204 changed by night). Contrast is the WCAG ratio of a solid colour on that theme's page background (--bg), shown only for plain colours; text needs 4.5 (3 for large text and marks).

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

**--arn-*** (113)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --arn-plate | `rgba(18,17,24,.86)` | same |  |
| --arn-on-plate | `#FFFFFF` | same | 1.04 / 18.62 |
| --arn-pill | `#FFFFFF` | same | 1.04 / 18.62 |
| --arn-on-pill | `#17161A` | same | 17.25 / 1.03 |
| --arn-arw | `#62BEF7` | same | 1.97 / 9.07 |
| --arn-hp-left | `#2FB55A` | same | 2.55 / 6.98 |
| --arn-hp-dmg | `#E8364F` | same | 3.97 / 4.50 |
| --arn-hp-txt | `#8EE6A6` | same | 1.44 / 12.43 |
| --arn-pad | `#2A2638` | same | 14.04 / 1.27 |
| --arn-pad-hi | `#4A4560` | same | 8.70 / 2.05 |
| --arn-pad-a | `#2E9BF0` | same | 2.85 / 6.26 |
| --arn-pad-d | `#E8364F` | same | 3.97 / 4.50 |
| --arn-glow-a | `rgba(46,155,240,.55)` | same |  |
| --arn-glow-d | `rgba(232,54,79,.55)` | same |  |
| --arn-verdict | `#FFFFFF` | same | 1.04 / 18.62 |
| --arn-verdict-ink | `#17161A` | same | 17.25 / 1.03 |
| --arn-verdict-ink2 | `#55515C` | same | 7.40 / 2.41 |
| --arn-verdict-em | `#C41E35` | same | 5.61 / 3.18 |
| --arn-tag | `#121118` | same | 17.98 / 1.01 |
| --arn-on-tag | `#FFFFFF` | same | 1.04 / 18.62 |
| --arn-tag-mv | `#F2C44D` | same | 1.57 / 11.33 |
| --arn-shadow | `rgba(10,8,20,.35)` | same |  |
| --arn-clear-1 | `#2F7FD6` | same | 3.92 / 4.55 |
| --arn-clear-2 | `#9CCBF2` | same | 1.64 / 10.85 |
| --arn-clear-h1 | `#4F79B0` | same | 4.29 / 4.16 |
| --arn-clear-h2 | `#86A9D3` | same | 2.33 / 7.65 |
| --arn-cloud | `rgba(255,255,255,.82)` | same |  |
| --arn-row-clear | `rgba(12,32,70,.72)` | same |  |
| --arn-sun-1 | `#E9661A` | same | 3.15 / 5.66 |
| --arn-sun-2 | `#F5962C` | same | 2.17 / 8.23 |
| --arn-sun-3 | `#FFD08A` | same | 1.37 / 12.98 |
| --arn-sun-disc | `rgba(255,244,214,.96)` | same |  |
| --arn-sun-glow | `rgba(255,214,140,.55)` | same |  |
| --arn-sun-h1 | `#D9772D` | same | 3.04 / 5.87 |
| --arn-sun-h2 | `#EC9A4C` | same | 2.16 / 8.24 |
| --arn-row-sun | `rgba(70,32,10,.66)` | same |  |
| --arn-rain-1 | `#1C2433` | same | 14.91 / 1.20 |
| --arn-rain-2 | `#4A556B` | same | 7.18 / 2.48 |
| --arn-rain-h1 | `#2B3343` | same | 12.14 / 1.47 |
| --arn-rain-h2 | `#3A4558` | same | 9.26 / 1.93 |
| --arn-rain-line | `rgba(220,230,255,.3)` | same |  |
| --arn-row-rain | `rgba(8,10,18,.66)` | same |  |
| --arn-sand-1 | `#9A6A33` | same | 4.49 / 3.97 |
| --arn-sand-2 | `#DDB880` | same | 1.79 / 9.97 |
| --arn-sand-h1 | `#A47437` | same | 3.92 / 4.55 |
| --arn-sand-h2 | `#C29556` | same | 2.60 / 6.85 |
| --arn-dust | `rgba(255,236,200,.3)` | same |  |
| --arn-sand-disc | `rgba(255,238,200,.42)` | same |  |
| --arn-row-sand | `rgba(60,34,10,.66)` | same |  |
| --arn-snow-1 | `#7C98B7` | same | 2.86 / 6.23 |
| --arn-snow-2 | `#DCE6EF` | same | 1.21 / 14.72 |
| --arn-snow-h1 | `#F4F7FA` | same | 1.03 / 17.31 |
| --arn-snow-h2 | `#CBD8E6` | same | 1.39 / 12.86 |
| --arn-flake | `rgba(255,255,255,.95)` | same |  |
| --arn-row-snow | `rgba(26,44,72,.74)` | same |  |
| --arn-none-1 | `#2E2C3E` | same | 13.01 / 1.37 |
| --arn-none-2 | `#15141D` | same | 17.50 / 1.02 |
| --arn-grid | `rgba(214,218,255,.18)` | same |  |
| --arn-grassy-1 | `#3F9C48` | same | 3.32 / 5.37 |
| --arn-grassy-2 | `#1B5824` | same | 8.15 / 2.19 |
| --arn-blade | `rgba(220,255,200,.18)` | same |  |
| --arn-electric-1 | `#6E5813` | same | 6.56 / 2.72 |
| --arn-electric-2 | `#2C2208` | same | 15.02 / 1.19 |
| --arn-spark | `#F4DC3C` | same | 1.33 / 13.43 |
| --arn-psychic-1 | `#A2318F` | same | 5.97 / 2.99 |
| --arn-psychic-2 | `#4A1446` | same | 13.60 / 1.31 |
| --arn-ring | `rgba(255,200,240,.2)` | same |  |
| --arn-misty-1 | `#D9A0C8` | same | 2.05 / 8.70 |
| --arn-misty-2 | `#9A6290` | same | 4.45 / 4.01 |
| --arn-fog | `rgba(255,242,250,.5)` | same |  |
| --arn-row-tr | `rgba(14,12,20,.66)` | same |  |
| --arn-dot-grassy | `#3FCB5A` | same | 2.03 / 8.78 |
| --arn-dot-electric | `#F4C93C` | same | 1.52 / 11.76 |
| --arn-dot-psychic | `#E0509A` | same | 3.48 / 5.13 |
| --arn-dot-misty | `#F2A6C8` | same | 1.82 / 9.81 |
| --arn-fill | `var(--ink)` | same | 17.25 / 14.16 |
| --arn-on-fill | `var(--bg)` | same | 1.00 / 1.00 |
| --arn-hit | `var(--plot-text)` | same | 5.61 / 9.07 |
| --arn-hit-on | `#F58DA1` | `#C41E35` | 2.19 / 3.18 |
| --arn-line | `rgba(23,22,26,.2)` | `rgba(228,224,236,.2)` |  |
| --arn-dash | `rgba(23,22,26,.36)` | `rgba(228,224,236,.36)` |  |
| --arn-kb-ko | `#E8364F` | same | 3.97 / 4.50 |
| --arn-kb-sv | `#2FB55A` | same | 2.55 / 6.98 |
| --arn-edge-a | `var(--logo-blue)` | same | 4.53 / 3.93 |
| --arn-edge-d | `var(--logo-pink)` | same | 3.97 / 4.50 |
| --arn-k-none | `#FFFFFF` | same | 1.04 / 18.62 |
| --arn-k-sun | `#FFB23F` | same | 1.72 / 10.36 |
| --arn-k-rain | `#7FB4FF` | same | 2.04 / 8.75 |
| --arn-k-sand | `#E2B66E` | same | 1.80 / 9.88 |
| --arn-k-snow | `#BFE6FF` | same | 1.26 / 14.16 |
| --arn-k-grassy | `#5FD068` | same | 1.88 / 9.49 |
| --arn-k-electric | `#FFD21F` | same | 1.39 / 12.85 |
| --arn-k-psychic | `#FF5FBF` | same | 2.63 / 6.77 |
| --arn-k-misty | `#FFA9DA` | same | 1.69 / 10.58 |
| --arn-rowbg | `rgba(12,11,18,.74)` | same |  |
| --arn-rim | `rgba(255,255,255,.12)` | same |  |
| --arn-ic-shadow | `rgba(0,0,0,.45)` | same |  |
| --arn-ic-edge | `#17161A` | same | 17.25 / 1.03 |
| --arn-plate-hi | `rgba(30,28,42,.95)` | same |  |
| --arn-plate-lo | `rgba(14,13,22,.95)` | same |  |
| --arn-plate-rim | `rgba(255,255,255,.14)` | same |  |
| --arn-track | `#0A0910` | same | 18.99 / 1.06 |
| --arn-tick | `rgba(10,9,16,.75)` | same |  |
| --arn-hp-hi | `#7DF2AE` | same | 1.33 / 13.46 |
| --arn-hp-dmg-hi | `#FF5C74` | same | 2.86 / 6.24 |
| --arn-hpl | `#FFFFFF` | same | 1.04 / 18.62 |
| --arn-on-hpl | `#17161A` | same | 17.25 / 1.03 |
| --arn-hp-sub | `#C9C5D0` | same | 1.63 / 10.98 |
| --arn-shade-t | `rgba(0,0,0,.3)` | same |  |
| --arn-shade-b | `rgba(0,0,0,.45)` | same |  |
| --arn-contact-1 | `rgba(0,0,0,.6)` | same |  |
| --arn-contact-2 | `rgba(0,0,0,.3)` | same |  |
| --arn-contact-3 | `rgba(40,36,60,.6)` | same |  |

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

**--bp-*** (5)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --bp-paper | `#fbfcfe` | `transparent` | 1.02 / – |
| --bp-grid | `#0078bf0d` | `#62bef70a` |  |
| --bp-grid5 | `#0078bf1a` | `#62bef714` |  |
| --bp-ink | `#0a68a8` | `#62bef7` | 5.65 / 9.07 |
| --bp-rim | `#FFFFFF` | same | 1.04 / 18.62 |

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

**Display sizes** (34)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --d-sdpost | `clamp(40px,5.2vw,88px)` | same |  |
| --d-paper | `clamp(24px,6.2cqi,120px)` | same |  |
| --d-papertwo | `clamp(24px,10cqi,72px)` | same |  |
| --d-lead | `clamp(34px,5.6cqi,68px)` | same |  |
| --d-mini | `clamp(24px,9cqi,48px)` | same |  |
| --d-brief | `clamp(24px,6.4cqi,34px)` | same |  |
| --d64 | `64px` | same |  |
| --d96 | `96px` | same |  |
| --d120 | `120px` | same |  |
| --d168 | `168px` | same |  |
| --d-hero | `clamp(34px,6vw,68px)` | same |  |
| --d-plot | `clamp(24px,4.7vw,68px)` | same |  |
| --d-sdhero | `clamp(48px,min(9.6vw,16svh),240px)` | same |  |
| --d-sdphone | `clamp(40px,min(13.6vw,8svh),120px)` | same |  |
| --d-sdnum | `clamp(30px,3.2vw,84px)` | same |  |
| --d-sdpair | `clamp(28px,8vw,80px)` | same |  |
| --d-sdshort | `clamp(36px,min(13.6vw,7svh),120px)` | same |  |
| --d-sdsix | `clamp(34px,10.4cqi,64px)` | same |  |
| --d-sdq | `clamp(64px,46cqi,168px)` | same |  |
| --d-sdn | `clamp(56px,30cqi,120px)` | same |  |
| --d-sdof | `clamp(28px,15cqi,56px)` | same |  |
| --d-sdnp | `clamp(48px,20cqi,72px)` | same |  |
| --d-pcbig | `clamp(48px,17cqi,112px)` | same |  |
| --d-pcpct | `clamp(26px,8.5cqi,56px)` | same |  |
| --d-pcbigp | `clamp(40px,14cqi,100px)` | same |  |
| --d-pctitle | `clamp(24px,3vw,44px)` | same |  |
| --d-arntag | `clamp(34px,6.4cqi,64px)` | same |  |
| --d-khead | `clamp(34px,min(10.4vw,4vw + 32px),84px)` | same |  |
| --d-ksent | `clamp(22px,2.8vw,34px)` | same |  |
| --d-ksec | `clamp(26px,3.4vw,40px)` | same |  |
| --d-kgo | `clamp(17px,min(5.2vw,2.6vw + 12px),36px)` | same |  |
| --d-kscore | `clamp(48px,6vw,72px)` | same |  |
| --d-tmscore | `clamp(80px,9vw + 40px,168px)` | same |  |
| --d-tmlong | `clamp(28px,3vw + 20px,60px)` | same |  |

**--dp-*** (17)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --dp-paper | `#FFFDF7` | `#E9DFC7` | 1.03 / 14.05 |
| --dp-glow | `#FFFDF7` | `#F4ECD8` | 1.03 / 15.81 |
| --dp-ink | `#17161A` | `#17161A` | 17.25 / 1.03 |
| --dp-ink2 | `#45423F` | `#45423F` | 9.56 / 1.87 |
| --dp-ink3 | `#5A554D` | `#57524A` | 7.08 / 2.40 |
| --dp-rule | `rgba(23,22,26,.16)` | `rgba(23,22,26,.2)` |  |
| --dp-fold | `rgba(23,22,26,.05)` | `rgba(23,22,26,.07)` |  |
| --dp-plot | `#0068AD` | `#005996` | 5.61 / 2.54 |
| --dp-plot-rule | `#0078BF` | `#0068AD` | 4.53 / 3.18 |
| --dp-pick | `#C41E35` | `#A3172B` | 5.61 / 2.41 |
| --dp-pick-rule | `#E8364F` | `#C41E35` | 3.97 / 3.18 |
| --dp-bar | `#17161A` | `#17161A` | 17.25 / 1.03 |
| --dp-on-bar | `#FFFFFF` | `#FFFFFF` | 1.04 / 18.62 |
| --dp-dot | `rgba(23,22,26,.13)` | `rgba(23,22,26,.16)` |  |
| --dp-frame | `#F3F0E6` | `#DED3B9` | 1.09 / 12.52 |
| --dp-cur | `rgba(0,120,191,.10)` | `rgba(0,89,150,.13)` |  |
| --dp-shadow | `0 1px 2px rgba(30,20,50,.10),0 24px 48px -24px rgba(30,20,50,.32)` | `0 0 0 1px rgba(0,0,0,.4),0 -12px 60px -20px rgba(244,236,216,.22),0 40px 80px -24px rgba(0,0,0,.85)` |  |

**--is-*** (12)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --is-speed | `rgba(255,255,255,.08)` | same |  |
| --is-ghost | `rgba(255,255,255,.22)` | same |  |
| --is-rim | `rgba(255,255,255,.6)` | same |  |
| --is-print | `rgba(255,255,255,.17)` | same |  |
| --is-stamp-rim | `rgba(255,255,255,.55)` | same |  |
| --is-ability | `var(--logo-blue)` | same | 4.53 / 3.93 |
| --is-manila | `#E9D5A1` | same | 1.39 / 12.85 |
| --is-manila-ring | `#C9B27A` | same | 1.99 / 8.98 |
| --is-tag-ink | `#17161A` | same | 17.25 / 1.03 |
| --is-tag-ghost | `rgba(23,22,26,.10)` | same |  |
| --is-tear | `rgba(23,22,26,.25)` | same |  |
| --is-stamp | `#C41E35` | same | 5.61 / 3.18 |

**--k-*** (18)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --k-paper | `var(--bg)` | same | 1.00 / 1.00 |
| --k-card | `var(--surface)` | same | 1.04 / 1.11 |
| --k-ink | `var(--ink)` | same | 17.25 / 14.16 |
| --k-ink2 | `var(--ink-3)` | same | 5.63 / 8.23 |
| --k-rule | `var(--rule)` | same |  |
| --k-plot | `var(--plot)` | same | 4.53 / 9.07 |
| --k-plot-text | `var(--plot-text)` | same | 5.61 / 9.07 |
| --k-on-plot | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --k-nasty | `#E8364F` | same | 3.97 / 4.50 |
| --k-nasty-text | `var(--pick-text)` | same | 5.61 / 8.16 |
| --k-go | `#DA2C48` | same | 4.54 / 3.93 |
| --k-on-go | `#FFFFFF` | same | 1.04 / 18.62 |
| --k-go-shadow | `#17161A` | `#E4E0DA` | 17.25 / 14.16 |
| --k-chip | `#17161A` | `#E4E0DA` | 17.25 / 14.16 |
| --k-on-chip | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --k-art-shadow | `rgba(23,22,26,.25)` | `rgba(0,0,0,.5)` |  |
| --k-card-shadow | `rgba(23,22,26,.16)` | `rgba(0,0,0,.45)` |  |
| --k-neutral | `rgba(23,22,26,.5)` | `rgba(228,224,236,.55)` |  |

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

**--mtf-*** (32)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --mtf-frame | `#17161A` | same | 17.25 / 1.03 |
| --mtf-drop | `#E8364F` | same | 3.97 / 4.50 |
| --mtf-panel | `#F4F1EC` | same | 1.08 / 16.52 |
| --mtf-ink | `#17161A` | same | 17.25 / 1.03 |
| --mtf-ink2 | `#5E5A66` | same | 6.43 / 2.77 |
| --mtf-chosen | `#E8364F` | same | 3.97 / 4.50 |
| --mtf-on-frame | `#FFFFFF` | same | 1.04 / 18.62 |
| --mtf-bar-sub | `#C9C5D0` | same | 1.63 / 10.98 |
| --mtf-rate | `#0068AD` | same | 5.61 / 3.18 |
| --mtf-night | `#14131C` | same | 17.65 / 1.01 |
| --mtf-n-surf | `#1D1C26` | same | 16.14 / 1.10 |
| --mtf-n-surf2 | `#272631` | same | 14.29 / 1.25 |
| --mtf-n-sub | `#B9B5C4` | same | 1.92 / 9.28 |
| --mtf-n-link | `#9BDCFF` | same | 1.43 / 12.48 |
| --mtf-n-rule | `rgba(255,255,255,.1)` | same |  |
| --mtf-n-add | `rgba(255,255,255,.32)` | same |  |
| --mtf-n-glow | `rgba(232,54,79,.4)` | same |  |
| --mtf-hot | `#FF5C74` | same | 2.86 / 6.24 |
| --mtf-cell | `#FFFFFF` | same | 1.04 / 18.62 |
| --mtf-link | `#0068AD` | same | 5.61 / 3.18 |
| --mtf-wash | `#ECE8DF` | same | 1.17 / 15.22 |
| --mtf-rule | `rgba(23,22,26,.13)` | same |  |
| --mtf-ink3 | `#5E5A66` | same | 6.43 / 2.77 |
| --mtf-card-warn | `#FFB866` | same | 1.64 / 10.90 |
| --mtf-ink2b | `#48454F` | same | 8.98 / 1.99 |
| --mtf-card-sub | `#D9D5E0` | same | 1.38 / 12.89 |
| --mtf-card-tile | `rgba(255,255,255,.1)` | same |  |
| --mtf-card-link | `#9BDCFF` | same | 1.43 / 12.48 |
| --mtf-card-new | `rgba(255,225,77,.22)` | same |  |
| --mtf-shadow-floor | `rgba(23,22,26,.14)` | same |  |
| --mtf-stop | `#C41E35` | same | 5.61 / 3.18 |
| --mtf-add | `rgba(23,22,26,.4)` | same |  |

**--mvc-*** (3)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --mvc-face | `#FFFFFF` | `#15141E` | 1.04 / 1.02 |
| --mvc-ink | `#17161A` | `#F4F2EE` | 17.25 / 16.65 |
| --mvc-sub | `#5E5A66` | `#B0AAB8` | 6.43 / 8.23 |

**--on-*** (18)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --on-main | `#FBFAF7` | `#08131E` | 1.00 / 1.01 |
| --on-mark | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --on-band-top | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --on-band-ready | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --on-band-solid | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --on-band-work | `#17161A` | `#12121B` | 17.25 / 1.00 |
| --on-band-miss | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --on-pk-main | `var(--on-plate)` | `var(--on-mark)` | 1.00 / 1.00 |
| --on-x4 | `#FFFFFF` | `#FFFFFF` | 1.04 / 18.62 |
| --on-st | `#FFFFFF` | `#12121B` | 1.04 / 1.00 |
| --on-st-def | `#17161A` | `#12121B` | 17.25 / 1.00 |
| --on-type | `#FFFFFF` | same | 1.04 / 18.62 |
| --on-plot-seal | `#FFFFFF` | same | 1.04 / 18.62 |
| --on-pl-band | `#FBFAF7` | same | 1.00 / 17.84 |
| --on-pl-band-plate | `#17161A` | same | 17.25 / 1.03 |
| --on-pt | `#FFFFFF` | same | 1.04 / 18.62 |
| --on-pt-it | `#17161A` | same | 17.25 / 1.03 |
| --on-wx | `#1C1708` | `#1C1708` | 17.12 / 1.04 |

**--pc-*** (35)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --pc-paper | `#FCFAF3` | `#1B2433` | 1.00 / 1.19 |
| --pc-grid | `rgba(0,120,191,.22)` | `rgba(98,190,247,.22)` |  |
| --pc-grid2 | `rgba(0,120,191,.1)` | `rgba(98,190,247,.09)` |  |
| --pc-ink | `#17161A` | `#EEF3F8` | 17.25 / 16.68 |
| --pc-ink2 | `#5E5A66` | `#B5C2D1` | 6.43 / 10.28 |
| --pc-off | `#6B6873` | `#9AA8B8` | 5.22 / 7.68 |
| --pc-mark | `#E8364F` | same | 3.97 / 4.50 |
| --pc-mark-text | `#C41E35` | `#FF6F86` | 5.61 / 6.98 |
| --pc-mark-edge | `#FFFFFF` | `#1B2433` | 1.04 / 1.19 |
| --pc-line | `#0068AD` | `#7CC8FF` | 5.61 / 10.25 |
| --pc-photo | `#FFFFFF` | same | 1.04 / 18.62 |
| --pc-photo-rim | `rgba(23,22,26,.1)` | same |  |
| --pc-drop | `rgba(0,0,0,.5)` | same |  |
| --pc-tint-a | `#CFE6F7` | same | 1.23 / 14.46 |
| --pc-tint-d | `#F9D0D7` | same | 1.34 / 13.33 |
| --pc-note-a | `#D9EDFB` | same | 1.15 / 15.48 |
| --pc-note-d | `#FBD3DA` | same | 1.30 / 13.68 |
| --pc-note-top | `rgba(0,0,0,.1)` | same |  |
| --pc-dots | `rgba(23,22,26,.35)` | same |  |
| --pc-note-label | `rgba(23,22,26,.7)` | same |  |
| --pc-key | `rgba(255,255,255,.6)` | same |  |
| --pc-dash | `rgba(23,22,26,.5)` | `rgba(238,243,248,.5)` |  |
| --pc-on-swipe | `#FFFFFF` | same | 1.04 / 18.62 |
| --pc-swipe-sub | `rgba(255,255,255,.92)` | same |  |
| --pc-k-none | `#5E5A66` | same | 6.43 / 2.77 |
| --pc-k-sun | `#B56E00` | same | 3.87 / 4.61 |
| --pc-k-rain | `#2A73C9` | same | 4.58 / 3.90 |
| --pc-k-sand | `#A8742A` | same | 3.87 / 4.61 |
| --pc-k-snow | `#2F7DA4` | same | 4.38 / 4.07 |
| --pc-k-grassy | `#28843C` | same | 4.52 / 3.95 |
| --pc-k-electric | `#946F00` | same | 4.44 / 4.02 |
| --pc-k-psychic | `#C2479A` | same | 4.32 / 4.13 |
| --pc-k-misty | `#B4508C` | same | 4.50 / 3.96 |
| --pc-on-paper | `#17161A` | same | 17.25 / 1.03 |
| --pc-on-paper2 | `#5E5A66` | same | 6.43 / 2.77 |

**--pcn-*** (3)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --pcn-Dragon | – | `#8A97FF` | – / 7.05 |
| --pcn-Ghost | – | `#A88BF2` | – / 6.77 |
| --pcn-Poison | – | `#C17BF0` | – / 6.52 |

**--pl-*** (5)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --pl-band | `#17161A` | `#1D1C29` | 17.25 / 1.11 |
| --pl-band-2 | `#C4BFCB` | same | 1.73 / 10.34 |
| --pl-band-rule | `rgba(251,250,247,.22)` | same |  |
| --pl-band-edge | `rgba(251,250,247,.5)` | same |  |
| --pl-band-plate | `#FFFFFF` | `#E9E5DE` | 1.04 / 14.83 |

**--podium-*** (3)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --podium-1 | `#f2b705` | same | 1.74 / 10.24 |
| --podium-2 | `#b9c0cc` | same | 1.75 / 10.17 |
| --podium-3 | `#d08a4e` | same | 2.71 / 6.58 |

**--pr-*** (24)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --pr-kraft | `#C99C60` | `#6B4E2E` | 2.39 / 2.44 |
| --pr-kraft-hi | `#D4AA70` | `#76583A` | 2.06 / 2.86 |
| --pr-kraft-line | `rgba(110,70,20,.07)` | `rgba(0,0,0,.12)` |  |
| --pr-tape | `rgba(242,229,200,.78)` | `rgba(160,134,94,.7)` |  |
| --pr-paper | `#FFFFFF` | `#E6DFCF` | 1.04 / 14.02 |
| --pr-ink | `#17161A` | `#1E1B18` | 17.25 / 1.09 |
| --pr-ink2 | `#55515C` | `#4E4942` | 7.40 / 2.09 |
| --pr-rule | `rgba(23,22,26,.16)` | `rgba(30,27,24,.2)` |  |
| --pr-num | `#0068AD` | `#0A5A92` | 5.61 / 2.56 |
| --pr-soon | `#C41E2B` | `#A61F28` | 5.64 / 2.52 |
| --pr-plenty | `#0068AD` | `#0A5A92` | 5.61 / 2.56 |
| --pr-rub-bg | `rgba(255,255,255,.9)` | `rgba(230,223,207,.94)` |  |
| --pr-shadow | `rgba(30,20,50,.18)` | `rgba(0,0,0,.45)` |  |
| --pr-shadow-2 | `rgba(30,20,50,.10)` | `rgba(0,0,0,.3)` |  |
| --pr-ev | `#F4CDEB` | `#DDBAD3` | 1.36 / 10.67 |
| --pr-ev-2 | `#EDB9E1` | `#D3A8C9` | 1.59 / 9.05 |
| --pr-ev-ink | `#8E1A74` | `#74155E` | 7.89 / 1.78 |
| --pr-se | `#C9E4F6` | `#B7CEDF` | 1.26 / 11.44 |
| --pr-se-2 | `#B2D7F1` | `#A5C1D6` | 1.45 / 9.93 |
| --pr-se-ink | `#035C97` | `#0A4A78` | 6.75 / 2.01 |
| --pr-post | `rgba(60,57,66,.92)` | `rgba(46,43,50,.92)` |  |
| --pr-post-bg | `rgba(255,255,255,.62)` | `rgba(230,223,207,.62)` |  |
| --pr-blank | `rgba(23,22,26,.2)` | `rgba(228,224,236,.24)` |  |
| --pr-art | `none` | `saturate(.82) brightness(.94)` |  |

**--pt-*** (18)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --pt-Dragon | `#5B479F` | same | 7.07 / 2.52 |
| --pt-Ground | `#8E5C2F` | same | 5.41 / 3.30 |
| --pt-Fighting | `#955732` | same | 5.46 / 3.27 |
| --pt-Poison | `#8940BF` | same | 5.67 / 3.15 |
| --pt-Dark | `#5C4A3E` | same | 8.03 / 2.22 |
| --pt-Steel | `#3D6E80` | same | 5.38 / 3.32 |
| --pt-Fire | `#9C6421` | same | 4.72 / 3.77 |
| --pt-Water | `#1F6672` | same | 6.28 / 2.84 |
| --pt-Grass | `#3F7F38` | same | 4.67 / 3.82 |
| --pt-Fairy | `#A2477F` | same | 5.37 / 3.32 |
| --pt-Flying | `#4E6184` | same | 5.98 / 2.98 |
| --pt-Ghost | `#6848B7` | same | 6.29 / 2.84 |
| --pt-Psychic | `#B43C69` | same | 5.31 / 3.36 |
| --pt-Ice | `#2B7182` | same | 5.31 / 3.36 |
| --pt-Rock | `#706843` | same | 5.36 / 3.32 |
| --pt-Electric | `#7A6629` | same | 5.35 / 3.33 |
| --pt-Normal | `#666864` | same | 5.40 / 3.31 |
| --pt-Bug | `#616F25` | same | 5.28 / 3.38 |

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

**--sd-*** (62)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --sd-shade | `rgba(0,0,0,.3)` | same |  |
| --sd-edge | `var(--logo-white)` | same | 1.04 / 18.62 |
| --sd-on-band | `#FFFFFF` | `#FFFFFF` | 1.04 / 18.62 |
| --sd-post-line | `rgba(255,255,255,.62)` | `rgba(255,255,255,.4)` |  |
| --sd-post-shadow | `rgba(60,10,20,.42)` | `rgba(0,0,0,.55)` |  |
| --sd-beige | `#EFEAE0` | `#181826` | 1.15 / 1.06 |
| --sd-card | `#FFFFFF` | `#36355A` | 1.04 / 1.61 |
| --sd-card-ink | `#17161A` | `#F1EDE7` | 17.25 / 15.96 |
| --sd-card-ink2 | `#48454F` | `#D3CEDD` | 8.98 / 12.09 |
| --sd-card-shade | `#DBD3C5` | `#0E0E18` | 1.42 / 1.03 |
| --sd-feat | `#17161A` | `#0A0A10` | 17.25 / 1.06 |
| --sd-on-feat | `#FBFAF7` | `#F1EDE7` | 1.00 / 15.96 |
| --sd-feat-ink2 | `#CFCBD4` | `#C4BFCB` | 1.53 / 10.34 |
| --sd-feat-rim | `transparent` | `rgba(228,224,236,.2)` |  |
| --sd-race | `#0078BF` | `#0078BF` | 4.53 / 3.93 |
| --sd-on-race | `#FFFFFF` | `#FFFFFF` | 1.04 / 18.62 |
| --sd-streak | `rgba(255,255,255,.34)` | `rgba(255,255,255,.3)` |  |
| --sd-pod | `#3A3940` | `#2E2D38` | 10.94 / 1.37 |
| --sd-pod-top | `#0078BF` | `#0078BF` | 4.53 / 3.93 |
| --sd-you | `#62BEF7` | `#62BEF7` | 1.97 / 9.07 |
| --sd-them | `#F08AD8` | `#F08AD8` | 2.16 / 8.27 |
| --sd-hp-lost | `#E4DED3` | `#25243B` | 1.28 / 1.24 |
| --sd-hp-roll | `#D93A3A` | `#FF7A70` | 4.36 / 7.33 |
| --sd-hp-roll2 | `#F2A7A7` | `#7A3A3A` | 1.85 / 2.21 |
| --sd-flag-rim | `transparent` | `rgba(241,237,231,.85)` |  |
| --sd-hero | `#0078BF` | `#0A4C83` | 4.53 / 2.10 |
| --sd-ink | `#17161B` | `#232330` | 17.24 / 1.20 |
| --sd-tools-bg | `#EFEAE0` | `#181826` | 1.15 / 1.06 |
| --sd-flag | `#D62C45` | `#B91E39` | 4.67 / 2.93 |
| --sd-flag-num | `#17161A` | `#F2C1C9` | 17.25 / 11.74 |
| --sd-line2 | `#9BDCFF` | `#9BDCFF` | 1.43 / 12.48 |
| --sd-plate | `#FFFFFF` | `#FFFFFF` | 1.04 / 18.62 |
| --sd-plate-ink | `#17161A` | `#17161A` | 17.25 / 1.03 |
| --sd-plate-num | `#0068AD` | `#0068AD` | 5.61 / 3.18 |
| --sd-tag | `#17161A` | `#17161A` | 17.25 / 1.03 |
| --sd-tag-num | `#9BDCFF` | `#9BDCFF` | 1.43 / 12.48 |
| --sd-speed | `rgba(255,255,255,.22)` | `rgba(255,255,255,.14)` |  |
| --sd-haze | `rgba(0,120,191,.46)` | `rgba(10,76,131,.52)` |  |
| --sd-link | `#62BEF7` | `#62BEF7` | 1.97 / 9.07 |
| --sd-paper | `#FFFFFF` | `#DDD5C5` | 1.04 / 12.76 |
| --sd-board | `#F3F0EA` | `#D6CEBF` | 1.09 / 11.91 |
| --sd-paper-ink | `#17161A` | same | 17.25 / 1.03 |
| --sd-paper-ink2 | `#48454F` | same | 8.98 / 1.99 |
| --sd-paper-rule | `rgba(23,22,26,.3)` | same |  |
| --sd-grid | `rgba(23,22,26,.07)` | `rgba(23,22,26,.08)` |  |
| --sd-grid5 | `rgba(23,22,26,.12)` | `rgba(23,22,26,.14)` |  |
| --sd-paper-shadow | `rgba(0,0,0,.5)` | `rgba(0,0,0,.6)` |  |
| --sd-paper-btn | `#17161A` | same | 17.25 / 1.03 |
| --sd-on-paper-btn | `#FFFFFF` | same | 1.04 / 18.62 |
| --sd-q | `#0068AD` | same | 5.61 / 3.18 |
| --sd-board-you | `#0068AD` | `#0068AD` | 5.61 / 3.18 |
| --sd-board-them | `#B4238F` | `#B4238F` | 5.62 / 3.17 |
| --sd-on-tag | `#FFFFFF` | same | 1.04 / 18.62 |
| --sd-btn | `#FFFFFF` | same | 1.04 / 18.62 |
| --sd-btn-ink | `#17161A` | same | 17.25 / 1.03 |
| --sd-ring | `#62BEF7` | same | 1.97 / 9.07 |
| --sd-ring-glow | `rgba(98,190,247,.5)` | same |  |
| --sd-ring-open | `rgba(255,255,255,.62)` | same |  |
| --sd-beam | `rgba(255,255,255,.075)` | `rgba(255,255,255,.05)` |  |
| --sd-lines | `rgba(255,255,255,.035)` | `rgba(255,255,255,.025)` |  |
| --sd-chev | `#62BEF7` | same | 1.97 / 9.07 |
| --sd-mask | `#000000` | same | 20.12 / 1.13 |

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

**--wr-*** (6)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --wr-ink | `#F1EDE7` | same | 1.12 / 15.96 |
| --wr-ink2 | `#BDB7C6` | same | 1.87 / 9.53 |
| --wr-plot | `#7CCBFF` | same | 1.70 / 10.50 |
| --wr-on-plot | `#14131C` | same | 17.65 / 1.01 |
| --wr-shadow | `rgba(0,0,0,.5)` | same |  |
| --wr-rule | `rgba(241,237,231,.16)` | same |  |

**--wx-*** (6)

| Token | Day | Night | On --bg (day / night) |
|---|---|---|---|
| --wx-lo | `rgba(255,255,255,.10)` | same |  |
| --wx-mid | `rgba(255,255,255,.2)` | same |  |
| --wx-hi | `rgba(255,255,255,.34)` | same |  |
| --wx-dk | `rgba(10,8,20,.28)` | same |  |
| --wx-sun | `#E3A51C` | `#D99A1B` | 2.08 / 7.61 |
| --wx-sun-hi | `#F2C44D` | `#F0C25A` | 1.57 / 11.14 |

**Other** (42)

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
| --plot-seal | `#C41E35` | same | 5.61 / 3.18 |
| --unit | `.62em` | same |  |
| --shade | `30,20,50` | same |  |
| --rim | `255,255,255` | same |  |
| --ar-stripe | `rgba(255,255,255,.06)` | same |  |
| --slant | `-24deg` | same |  |
| --tilt | `-7deg` | same |  |
| --gut | `96px` | same |  |
| --tap | `44px` | same |  |
| --tr-electric | `#F4DC3C` | `#E9D23A` | 1.33 / 12.18 |
| --ko-tint | `rgba(217,58,58,.10)` | `rgba(255,122,112,.14)` |  |
| --hp-left | `#2DA84A` | `#3FC060` | 2.95 / 7.91 |
| --btg-panel | `var(--mtf-night)` | `var(--surface)` | 17.65 / 1.11 |

**Set by screen width**

| Width | Token | Value |
|---|---|---|
| (max-width:1179.98px) | --gut | `48px` |
| (max-width:699.98px) | --gut | `16px` |
| (max-width:384.98px) | --d-khead | `34px` |

<!-- tokens:end -->

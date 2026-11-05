# Champions arena: the NastyPlot design system

Sim picked direction C, "Champions arena", on Nov 5. NastyPlot reads like a Pokémon Champions or Scarlet/Violet menu screen:

- slanted plates;
- one diagonal hero per page;
- every Pokémon shown on its own type-colour art tile.

This file is the reference for every page. Read it before you style anything.

## Files

| File | What it holds |
|---|---|
| `theme/arena.css` | The system: tokens, components, the bottom bar, the top nav, search, tips, dialogs, empty states, focus, and the block that retires the old box look. |
| `theme/arena-p1.css` | Phase 1 pages: Home, My team and the info sheet. It only lays out components and maps the app's existing markup onto them. |
| `theme/arena-<group>.css` | One file per phase 2 group (see the phase 2 plan). A group never edits another group's file. Shared fixes go in `arena.css`. |
| `app/74-arena.js` | Arena markup for Home, the top of My team, the set card and the sheet hero. It also holds `AR.tv(p)`, the type-colour helper, and `AR.art()`, the art tile builder. |

The build (`build.mjs`) expands `@A` to `:root:not(#_a):not(#_b):not(#_c):not(#_d):not(#_e):not(#_f)`, six ids. That beats every older layer (`@R` riso/manga, `@C` colour pass), including the older rules that name an id (`#saveBtn`, `#homeOut`). Every arena rule starts with `@A`. Only use `!important` on a property an older layer marks `!important`, usually background, border, border-radius, box-shadow or colour.

## Rules (from Sim)

**Do**
- Slant plates, fields, buttons, tabs and strips by the one angle, `--ar-slant` (−12°).
- Keep paragraphs, labels and numbers upright.
- Draw a slanted control's shape in a `::before` layer (with `isolation:isolate` on the element) and keep the element upright. Its text, including bare text nodes in markup you don't own, then stays straight. Every arena control works this way.
- Use one hero burst per screen: the white radial streaks behind the hero Pokémon (`AR.BURST`), on the sprite's half only.
- Use the section colour for wayfinding: Home pink, Build gold, My team blue, Battle red-orange, Meta purple. Use it for tabs, button edges, the active nav plate and step plates.
- Give every Pokémon its type colours (both types, blended) through `AR.tv(p)`.
- Use sentence case everywhere and keep units under numerals ("82%", "ready").
- Use real data only, and keep every control: restyle it, never drop it.

**Don't**
- No outlines or frames around content. No offset "print" shadows. No plain white or black boxes with text in them.
- No text on streaks or dots. Text sits on smooth colour or paper.
- No all-caps, no middle-dot separators, no glows, no blur scrims.
- No navy, maroon or brown fills. Dark-mode fields use `--da`/`--db` (see below) for this reason.
- Never slant a paragraph or a multi-line text row.
- Only one yellow primary button per screen.

## Tokens (`arena.css` section 1)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ar-paper` | `#ECE7E0` | `#000` | Page background (warm, not white; true black in dark) |
| `--ar-paper-2` | `#F6F2EC` | `#121114` | Soft field for the older panels until phase 2 restyles them |
| `--ar-sheet` | `#FBF8F4` | `#1A191D` | Surfaces: buttons, sheet, tips, dialogs |
| `--ar-nav` | `#FBF8F4` | `#151417` | Bottom bar |
| `--ar-ink` / `-2` / `-3` | `#16141A` / `#4A4550` / `#6B6570` | `#F4F1EC` / `#C9C3CC` / `#A39CA6` | Text. On paper the ratios are 15.9, 7.6 and 4.6 (light) and 18, 10.6 and 7.9 (dark). |
| `--ar-rule`, `--ar-rule-2` | 12% and 20% ink | 12% and 22% white | Hairlines between list rows |
| `--ar-pink`, `--ar-gold`, `--ar-blue`, `--ar-orange`, `--ar-purple` | `#E8364F`, `#E9A800`, `#0078BF`, `#F05A28`, `#7B4BD6` | same | Bright section colours for edges, tabs and bars. Never text. |
| `--ar-<x>-plate` | `#D42445`, `#FFC21A`, `#0068AD`, `#C8401A`, `#7B4BD6` | same | Filled plates. White text on them is 5:1 or more; gold takes ink text. |
| `--ar-<x>-ink` | `#B81E3A`, `#7A5300`, `#005E96`, `#A33A0C`, `#5B2FB5` | `#FF6F86`, `#FFD166`, `#4FB2F0`, `#FFA27D`, `#C9B0FF` | Section text on paper, 5:1 or more |
| `--ar-sec`, `--ar-sec-plate`, `--ar-sec-on`, `--ar-sec-ink` | Set per page from `html[data-pg]` | | The page's section. A block can switch locally with `.ar-pink`, `.ar-blue`, `.ar-gold`, `.ar-orange` or `.ar-purple`. |
| `--ar-yellow` | `#FFD21F` | same | The primary button, the selected tile ring and the cursor |
| `--ar-green` / `--ar-green-ink` | `#2E9E5B` / `#16693B` | `#5FD08F` ink | Readiness bar, legal pips, "+points" tags |
| `--ar-misprint` | `#FF5C8A` | `#E8364F` | The offset behind headline numerals only |
| `--ar-display` | Archivo, italic, 800–900, `font-stretch` 108–125% ("Archivo Expanded") | | Headings and numerals |
| `--ar-body` | Instrument Sans | | Everything else |
| `--ar-fs-hero` / `-h1` / `-h2` / `-h3` / `-body` / `-small` / `-label` | 64 / 46 / 26 / 20 / 16 / 15 / 13 px | Desktop (≥1001px): 120 / 76 / 34 / 22 / 17 / 16 | `-label` (13px) is for nav labels only. Body text never goes below 15px. |
| `--ar-s1`…`--ar-s8` | 4, 8, 12, 16, 24, 32, 48, 64 px | | Spacing |
| `--ar-gutter` | 16px | 32px on desktop | Page side margin |
| `--ar-slant` / `--ar-unslant` | −12° / 12° | | The one slant angle |
| `--ar-r-s` / `-m` / `-l` / `-xl` | 4 / 6 / 10 / 18 px | | Plates and tags / buttons and strips / tiles, sheet and tips / the nav bar |
| `--ar-shadow`, `--ar-shadow-s`, `--ar-shadow-nav` | Soft warm drop shadows | Black, deeper | Never a glow, never an offset outline |
| `--ar-field-mix` | 58% | 30% | How much type colour goes into a light field |
| `--ar-focus` | `#0078BF` | `#4FB2F0` | The focus ring |

Fonts load from Google Fonts in `head.html`: `Archivo:ital,wdth,wght@1,100..125,700..900`, next to Instrument Sans and the Unbounded logo subset.

## Type colours: the OKLCH dual-type blend

`AR.tv(p)` (in `74-arena.js`) returns the inline variables for a Pokémon. Put them on the element that holds `.ar-field`:

- `--a`, `--b`: the two type colours. These are the app's `TC`, except Dark, which uses `#5E5068` (`AR.TC`), because the app's Dark is a brown.
- `--da`, `--db`: the dark-mode field colours, worked out in OKLCH. Every type gets the same vivid chroma. Cool and red hues sit at L .50. Orange (Fire) sits at L .64, and yellow to olive (Electric, Ground, Rock, Normal) at L .76, because a dark orange or yellow reads brown.
- `--on`: the text colour (white or ink, whichever reaches 4.5:1) on the first type's dark field.

`.ar-field` paints the blend. In light mode it is a 125° gradient `in oklch` between both colours mixed into the sheet colour. In dark mode it is a 125° gradient `in oklab` between `--da` and `--db`, so it never passes through a brown hue. `.ar-field-strong` paints the raw colours. `AR.tag(type)` makes a slanted type tag, with white or ink text by contrast.

## Components

Each entry gives the markup, then the rules.

### Slanted ink name plate: `.ar-plate`
`<span class="ar-plate" style="${AR.tv(p)}"><span>bring Sneasler</span></span>`
- Uses its type gradient at L .44 (white text, 5:1 or more), or the section plate when there is no `--a`.
- `.ar-sm` is the 32px version.
- Labels only, such as "bring Sneasler" or "S tier, #1 of 313".
- In dark mode, a name set on art sits on an ink plate automatically.

### Section head: `.ar-shead`
`<div class="ar-shead"><span class="ar-tab"></span><h2 class="ar-h2">The champion's six</h2></div>`
- A slanted tab in the section colour, then the italic display face.
- Use one per section. Don't add eyebrow labels above it.

### Numbered step plate: `.ar-step`
`<span class="ar-step"><span>1</span></span>`
- Only for real sequences: My team's Fix it, Threats, How your team plays, Your six.
- `74-arena.js` adds the class to My team's `.chparth .n`.

### Game-menu buttons
| Class | What it looks like | When to use it |
|---|---|---|
| `.ar-btn` | A slanted paper strip with a left edge in `--edge` (the section by default) and a soft shadow | Secondary actions. Put `style="--edge:var(--ar-gold)"` on it when the button opens another section. |
| `.ar-btn.ar-primary` | The yellow strip with a black edge, italic display text and `AR.ICON.go` (the black chevron) | The one main action per screen. |
| `.ar-link` | Underlined section-ink text, 44px tall | Tertiary actions ("All 119 events ›"). |

`AR.parts()` gives the older `.chghost`, `.btn` and `.sdcopy` buttons on Home, My team and the sheet the `.ar-btn` class, and `.linkbtn` the `.ar-link` class. The elements and their handlers stay the same.

### Segmented tabs and filter chips: `.ar-seg > button`, `.ar-chip`
- These work with `aria-pressed`, `aria-selected` or `.on`.
- When on, the control is a filled section plate with bold text and a check mark, so the state is shown by shape as well as colour.
- They work on bare-text buttons. Add the `.ar-seg` class to an existing `.seg` (`AR.parts()` does this on My team and Home).

### Type art tiles: `.ar-art` (`.ar-s`, `.ar-m`, `.ar-l`)
`AR.art(p, {size, below, name, sub, attrs, sel})` builds a `<button>`, or the `tag` you pass. It contains:

- `.ar-f.ar-field`: the slanted field. White streaks sit in its top 60% only.
- `.ar-spr`: the sprite, breaking out of the top edge.
- `.ar-nm`: the name, with `<small>` for an item or similar.

Options and states:
- Sizes S, M, L are 72/80, 112/112 and 168/150 (field height / sprite size). Override them with `--h`, `--s` and `--lift`.
- `.ar-below` puts the name under the art. Use it in 3-column grids, where names would wrap on the art.
- `.is-mega` adds the two-colour power-up contour (a 2px drop-shadow stack in `--a` and `--b`; 2.5px on S).
- `.is-sel` adds the yellow ring and `.ar-cursor`.
- `.is-empty` is a placeholder slot (`AR.emptyArt(size)`).
- `.ar-six` is a 3-column grid (2 columns under 360px). `.ar-six.ar-two` is 2 columns (3 from 600px).

Rule: all tiles in a six are equal. Never print Lead, Back or Bench on the art. The game plan goes in a `.ar-gameplan` line under the six and in the set card.

### Stat numerals with a slanted bar
- `.ar-stat`: an `.ar-num` with an `.ar-unit` under it.
- `.ar-num.ar-mp`: a headline numeral with the misprint offset (only one or two per screen).
- `<span class="ar-bar"><i style="--v:82%;--c:var(--ar-green)"></i></span>`: the bar.
- `.ar-pips`: legal pips. `i.off` is an unpassed check.

### Menu strips: `.ar-strip` (in an `.ar-strips` 2-column list)
`<li class="ar-strip" style="--m:#6a3cee">Dragon Claw</li>`
- The battle-menu move row: a slanted strip with a type edge.
- `AR.moveType(name)` gives the move's type.

### Typographic list rows: `.ar-row`
- A grid row: a small slanted type field holding the sprite (`.ar-row-f.ar-field`), the name (`.ar-row-nm` with `<small>`), a big numeral, a slim bar and one hairline. No row boxes.
- Home's "Top of the meta" and My team's threat rows apply the same pattern to the existing markup (`arena-p1.css`).

### The cut-corner sheet: `.ar-sheetwrap > .ar-sheet`
- The only real panel.
- Washed in the Pokémon's types (`--a`, `--b`; `#rzSet` maps them from the app's `--ta`, `--tb`), with a type-gradient spine on the left and the top-right corner cut.
- The wrapper carries the drop shadow, because `clip-path` cuts shadows.
- Used for My team's set card. Phase 2 should use it for the damage calc result and Battle's plan.

### Bottom nav (phones, up to 1000px): `.bnav`
- A floating rounded bar 14px above the safe area.
- The active page (`[aria-selected=true]`) gets a slanted plate in `--ar-sec-plate` with `--ar-sec-on` text.
- Labels are 13px. That is a UI label size; the repo test needs 11px or more.

### Desktop top nav (1001px and up): `nav.tabs.mgtabs` in the header
- Tabs are 46px tall. The active one is the slanted section plate with white text.
- The team count badge (`.tc`) is a soft tag.

### Search, inputs and selects
- `.band .jumpbtn` on desktop is a slanted sheet strip with the shortcut tag; on phones it is an icon button.
- `.field` inputs and selects: a sheet surface and a 2px bottom rule that turns the section colour on focus. No frame.

### Popovers ("?" tips) and dialogs
- `.tipq`: a 28px round sheet button with a shadow. Its tap area extends 8px past the edge.
- `.tippop`: a sheet with a 5px section-colour edge, the title in display italic, the body in ink-2.
- `.ar-dialog`: the dialog surface.
- `.ar-x`: the round 44px close button.
- Scrims are 88% paper. No blur, no dark wash.

### Empty states: `.ar-empty`
- A faint slanted section field with a sprite, one line of text that says what to do, then the action buttons.
- My team uses it with no team. Phase 2 should use it for empty Saved teams, My box and Battle.

### Focus rings
- `:focus-visible` gets a 3px `--ar-focus` ring 3px outside the shape (4px on tiles and buttons).
- Elements focused by script (`tabindex="-1"`, such as the sheet panel) get no ring.

## Retiring the old box look (`arena.css` section 19, and `color.css`)

- `--mgbw` is 0, so the manga ink frames are gone.
- From `color.css`, these were removed: the colour pass's second "print" outline, the raised offset buttons, the slanted caption-box headings and the "Zoom!" sound word.
- Until phase 2 restyles a page, the older panels (`.chblock`, `.vcard`, `details.chsec` and others) are soft `--ar-paper-2` fields with a 10px radius, and the older secondary buttons are sheet strips with a soft shadow.
- The page tokens (`--chp`, `--mgpaper`, `--chink`...) point at arena paper and ink, so every page sits on the same paper.

## Data rules on Home and My team (phase 1 decisions)

**Lead plans.** Each six is followed by a "Game plan" line that names its opponent:
- On Home: "Game plan vs Pacca's six" (`CH.fourVs`, the planner against the latest champion's six).
- On My team: "Game plan vs the meta's top six" (`CH.four`).

These are two different matchups, so the leads can differ. The wording says which matchup each one is. The set card says "Leads with Sneasler vs the meta's top six".

**The grade.** The big number is always what the letter comes from:
- With 30+ real games, the letter comes from the record's win rate (already pulled toward the field for small samples). The number is shown with one decimal (59.9%), so it never reads as an A's 60%. NastyPlot's own score (94) appears as "score" under "Our check".
- Otherwise the big number is the grade out of 100, and the grade sum line explains it.

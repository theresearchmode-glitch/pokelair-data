# Champions arena: the NastyPlot design system

Sim picked direction C, "Champions arena", on Nov 5. NastyPlot reads like a Pokémon Champions or Scarlet/Violet menu screen:

- slanted plates;
- one diagonal hero per page;
- every Pokémon shown on its own type-colour art tile.

This file is the reference for every page. Read it before you style anything.

## Changes after phase 1

The phase 1 review fixes (Nov 5) changed these shared tokens and components. Phase 2 groups: check your pages against them.

- **`.ar-plate` with type colours is now an ink plate.** `#16141A` with white text (17:1) and a 7px type-colour edge (`--a` to `--b`). The old type gradient at L .44 turned brown, maroon or olive for warm types. Without `--a` it is still the section plate. Padding is now `0 18px 0 22px`, to clear the edge.
- **`AR.tv(p)` also sets `--dm`**, a middle stop for dark dual-type fields. A straight blend can cross the brown zone, for example Grass to Fairy (olive) or Ground to Steel (taupe). `--dm` takes the shorter way round the hue circle unless that lands on a warm hue, then the long way round. A warm middle that remains is lifted to L .72.
- **Dark `.ar-field` is a three-stop gradient `in oklch`:** `--da` 10%, `--dm` 50%, `--db` 90%. The hero fields (`.ar-hero-bg`, `.ar-shero-bg`) hold `--da` to 48%, so text on the left half sits on one colour.
- **`--on` is the text colour for `--da`.** Any numeral or text set on a dark field takes `color: var(--on)`. It is ink on Fire, Electric, Ground, Rock, Normal and Bug, and white on the rest. Bug now sits in the light band (L .76); at L .5 it was olive.
- **`.ar-ty` (type tags) is 15px** (was 14px), so it meets the body minimum.
- **`.ar-shead` aligns its tab with the head's first line** (`align-items: flex-start`), including when the head wraps.
- **`.ar-six` uses `align-items: start`.** Every tile in a row shares one field top. `.ar-below .ar-nm` keeps two lines of room.
- **`AR.emptyArt(size, {attrs, label})`.** With `attrs` it is a button: a faint section field, a round "+", and "Add a Pokémon" under it. Use it for open slots, for example `data-chedit="3"` or `data-view="build"`. Without `attrs` it is still a quiet placeholder.
- **`AR.nm(name)`.** A display name with non-breaking ends ("Mega Charizard&nbsp;Y", "Indeedee&nbsp;(F)"). `AR.art`, `AR.pair` and the set card use it.
- **Mega contour:** the two type colours, then a 1px ink line outside them, so it reads on a field of its own colour. `.ar-mega-s` is the S version for a bare sprite (it needs `--a`/`--b` on the image).
- **Focus rings follow the slant.** Slanted controls draw the ring on their `::before` layer. Art tiles draw it on `.ar-f`. See `arena.css` section 20; add your own slanted control to that list if its `::before` is always present.
- **Dark surfaces are neutral.** The dark `.ar-sheet` is `#222127` to `#1A191D` with no type wash, because a colour mixed into near-black reads maroon, brown or navy. The colour lives in the spine, the avatar field, the tags and the strips. The dark My team stage band is neutral too, with a 6px blue edge.
- **Dark name plates on art hug the name.** `AR.fit()` sets `--nw` to the longest line, so a two-line name is one tidy plate.
- **The wordmark** is now the mockup's `.ar-logo` (Unbounded "Nasty", then "Plot" on a slanted blue plate with a red offset). It is used in the header, the menu and the footer. The old lockups stay in the markup but are hidden. Screen readers get the `.sr` text.
- **The footer and page end:** the footer is 15px (16px on desktop) with 44px links. On phones the page ends 96px plus the safe area below the footer, and `main` has a 24px bottom pad.
- **The shared sub-page head (`arena.css` section 21).** Every page drawn with `CH.head` or `CH.pagehead` uses it: `.chpghead` is the kicker (`.chk`), then the title (`.chpgt`) in italic display on a slanted section tab, then `.chpgs`. `.chback` is the back link, styled as an arena link. Group files no longer need their own copy; a pane-scoped rule still overrides it.
- **`.ar-mini` (section 22), new.** A small slanted type field behind a list sprite. Use `AR.mini(p)` or `<span class="ar-mini" style="${AR.tv(p)}"><img></span>`. `--mw`, `--mh` and `--ms` set the field and sprite sizes. In dark mode it uses `--da`, `--dm` and `--db`, and `.is-mega` adds the contour.
- **`.ar-ty` in dark mode (section 23).** A neutral `#2A2930` tag with a 5px type-colour edge and white text. A filled dark-mode Fire, Ground or Electric tag reads brown.
- **`.ar-seg` on-state.** In a row whose buttons use `aria-pressed`, only `aria-pressed="true"` (or `.on`) is on. `32-views.js` leaves `aria-selected` on a section's first page tab. Section 19's sheet lift no longer applies to `.ar-seg>button`, which was causing a rectangle behind the slanted plate.
- **Dark `.ar-empty .ar-empty-art`** is neutral dark grey with a section-colour edge, not the section colour mixed into black.
- **Section 19 (retiring the old box look) uses `:where()`** for its class lists, so a page file's single-class override wins. It no longer lifts `.ar-seg>button` or `.ar-chip`.
- **Tile names never break inside a word.** `.ar-art .ar-nm` uses `overflow-wrap: break-word` plus balance, not `anywhere`. Below 380px names narrow (`font-stretch` 100%) rather than break.
- **The pressed menu strip (section 25), new.** `button.ar-strip` with `aria-pressed="true"`, `aria-selected="true"` or `.on` gets a 3px yellow ring on the slanted strip, a check mark before the label and bold text. Use it for picks in a strip list, such as Battle's leads or a move choice.
- **`.rzmorebtn` ("More" toggles)** has a 44px tap height. Its negative margins keep the line height.

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
- An ink plate (`#16141A`, white text 17:1) with a 7px edge in its type colours, or the section plate when there is no `--a`. (Until the phase 1 review it was the type gradient at L .44, which turned brown for warm types.)
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

## Final consistency rules (final fix 1, Nov 5)

These are the shared patterns after the two final reviews. `arena.css` sections 19, 27 and 28, `arena-p1.css` (Final fixes) and `74-arena.js` implement what can live in the system files. The lists under each group file say exactly what that file must change. Finding IDs are from the final phone (P) and desktop (D) reviews.

### System changes every page now gets

- **Section 19 no longer paints controls you restyle.** Its raised-button list is wrapped in `:where()` (with `:not(:where(…, #saveBtn))`), so its specificity is only `@A main`. Any page rule that draws a slanted `::before` plate and resets the element's background now wins. Never re-add an id or class chain to that list.
- **Type colours.** `74-arena.js` changes the app's own `TC` before anything renders: Dark is `#5E5068` (slate violet, not the brown `#5F4536`) and Normal is `#A6A2AE` (a cool lilac-grey, not the khaki `#ABA88A`). `TC`, `AR.TC`, `tyVars`, `chip()`, Home's rows, the Type chart and the share card all get them. In dark mode a near-neutral type (Normal) sits at L .70.
- **The dark dual-type middle stop (`--dm`, `AR.mid`)** always lies between the two hues the short way round. A neutral partner takes the other type's hue (Indeedee: crimson, pink, then grey). A warm middle is lifted to L .78 and C .13 or more (a light gold, never brown, olive or khaki). Never build your own middle stop; use `AR.tv(p)`.
- **One page-title size.** `--ar-fs-page` is 36px (31px under 360px, `clamp(46px,4.4vw,64px)` from 1001px). Every `.chpghead .chpgt` uses it; section 28 enforces it with one extra id. Only the landing heroes (Home, My team, Build me a team's `.chabhero`) are larger. The tab sits on the title's first line.
- **Back links.** Every sub-page starts with a `.chback` arena link (`32-views.js` adds most; `74-arena.js` adds "← Meta" on This week, How we calculate and About). Don't add a second one.
- **Names.** `AR.nm(name)` is the only display-name helper. It always prints "Mega Charizard Y" (an id such as `Charizard-Mega-Y` or a short `M-Charizard Y` becomes "Mega Charizard Y") and keeps the last part with the name ("Charizard&nbsp;Y", "Indeedee&nbsp;(F)"). `AR.mega(name)` is the same without HTML escaping. `74-arena.js` also rewrites the older tables' and charts' `M-` labels (`th span`, `svg text`).
- **Art-tile names never break inside a word.** `AR.fit()` (runs after every render, on resize and when fonts load) steps a name down 1px at a time, to 14px at the smallest, until its longest word fits (`--nmf`). A name on the art that still takes two lines marks the tile `.is-nm2`, and the sprite shrinks to 78% so the name keeps clear of it. Names under the art (`.ar-below`) are always left-aligned (section 28 enforces this).
- **Hover.** Every raised button, strip, segment and fold summary gets the same hover: its slanted `::before` goes a shade deeper (`brightness(.95)`, `1.3` in dark). Don't add a different hover; delete page hover rules that only re-tint the plate.
- **Fields.** Every text input, search box, number input, select and textarea in `main` gets the arena field baseline: sheet fill (`#1E1D22` in dark), a 2px underline that turns the section colour on focus, radius `--ar-r-m`, 48px tall, 16/17px text. No frame, no grey box. A locked value is shown with a lock tag beside it, not a different box.
- **The header count badge** draws nothing while it is empty.
- **The info sheet** text is 15px or more everywhere (Speed at level 50 rows, stat deltas, actions, "Report a mistake", tab sub-labels).

### One pattern per job

| Job | The one pattern | Notes |
|---|---|---|
| Page head | `.chpghead`: `.chk` kicker, then `.chpgt` at `--ar-fs-page` with the slanted section tab on its first line, then `.chpgs` | The kicker goes above the title. A page switcher (`.subnav` / `.ar-seg`) sits above the kicker on every page of a group. |
| Back link | `.chback`, first in the pane | "← My team", "← Battle", "← Meta", "← Pokémon ratings" |
| Section head | `.ar-shead` with one `.ar-tab` beside the first line | One tab per head. Never two. Never beside the last line. |
| Numbered steps | `.ar-step` (slanted section plate, display numeral) | Only for real sequences. No round discs, no plain italic numerals. |
| Fold / disclosure | The fold strip: a slanted sheet strip with a 6px section edge, the title in display italic 19px, the `CH.chev2` chevron | No bare-text disclosures, no extra icon squares. |
| Type tag | `AR.tag(type)` / `.ar-ty` (15px, slanted, filled in light, neutral with a type edge in dark) | No pastel rounded `.ty` chips with icons, no thin bar-plus-glyph variant. Put punctuation inside the sentence, not after a chip. |
| Status tag | A slanted tag like `.ar-ty` with the status ink edge (`--ar-pink/gold/blue/green`) and the word | No pastel pills. |
| Sort control | A "Sort" label (15px ink-2) then an `.ar-seg`, left-aligned on its own row under the lede or field | Same on Saved teams and My box. |
| Art-tile names | Left-aligned under the field (`.ar-below`), or on the art (dark: ink plate) | Never centred. |
| Side gutter | `--ar-gutter` (16px on phones, 32px on desktop) on the pane | No page sets its own side padding. |
| Fields | The arena field baseline above | |
| Overlay | Phones: a bottom sheet (`--ar-r-xl` top corners) with the round 44px `.ar-x` close at the top right and a head of title (display italic) and optional tab. Desktop: the same head in a centred dialog. | "Done" only where it commits changes (Edit team). |
| Hover | The section 28 rule | |
| Small text | 15px minimum (`--ar-fs-small`); 13px only for nav labels | |

### What each group file must change

**arena-team (css + js)**
1. Dark `.chparts .m` chips (lines ~768–770): the dark `background` on the element beats the line ~967 reset, so an upright box shows behind the slanted chip. Set only `--mc` in dark, never `background`.
2. P-F11: give `.chgapnote` the arena note (sheet, gold left spine, no outline) everywhere, not only under `[data-pane="coverage"]`. Its dark version is a khaki brown (rgb 58,49,34): use the neutral `#1A191D` sheet with the gold spine.
3. P-F14, D-F3, D-F4: raise every 12–14px text to 15px: `.sev`, `.ty`, `.tag`, table `th`, `.m` chips, `.ckpro`, `.gnm`, the legend glyphs, editor tags (`#chEdit .tag.rec`, `.mvset .mi .ty`, `.bp`, `.asm`), `#chScout .chleg` (12px), coverage plan lines (13px), add-card tags and `.conf`.
4. P-F15: every type mention uses `AR.tag` (`.ar-ty`); `.sev` becomes the slanted status tag; no "from Ice ." (the full stop goes inside the sentence).
5. P-F23: editor slot titles (`.sl-name`) never break inside a word: step down to 22–24px below 400px, or run the same fit as `AR.fit` (measure `scrollWidth > clientWidth`).
6. P-F07: Compare picker: a fixed sprite column so the text never runs under the 3×2 cluster.
7. P-F08: after "Update saved team" closes, return focus to its opener (the page must not move).
8. P-F16: the inline "Paste its log" link takes its 44px tap area from an `::after` inset, so the line height stays normal.
9. P-F17: drop the custom field styles in the editor, Box and Log a game (the system baseline covers them); the locked Mega stone shows a lock tag, not a grey box. Hide the native `▼` only if you draw the arena chevron.
10. D-F1: remove the round grey ring (`.mf` avatar) behind the scout detail sprites; keep only the slanted field.
11. D-F10: give `[data-pane="teams"] .mmpop .danger` the same weight as the generic button rule (`:not(#arbz):not(#arby)`), so Delete keeps its pink ink and hairline.
12. D-F11, P-N5: Saved team cards: one left edge for the title, record and actions.
13. D-F20, P-N6: dark Saved teams cards and the compare picks: the neutral dark band (`#16151A` to `#121114`) with the 6–8px blue edge, no navy.
14. D-F24: delete the centring of `.ar-below .ar-nm` on My box and the share card (section 28 now forces left), and left-align Log a game's lead names (`.qllead > span`, not an `.ar-art`, so section 28 does not reach it).
15. D-F29: Saved teams and My box sort: "Sort" label then `.ar-seg`, left-aligned on its own row.
16. P-N8: "Why? 13 reasons ⌄": the chevron sits right after the label; the open reasons use the fold body, not a paper-2 panel; close the empty gap under "Your games".
17. The `.ty:is([style*="#5f4536"])` remap (line ~877) is now dead: the app's TC holds `#5E5068`. Delete it.
18. D-F5 (team sheet) and P-F19/D-F16 (empty My team) are done in `arena-p1.css` / `74-arena.js`; don't restyle `.chsheet .chrow` or `#chActs` for them.

**arena-build (css + js)**
1. P-F03, D-F25: one tab on "Build around a core": drop the `.chpgt::before` or the `.chpghead::before`, keep one, on the first line.
2. P-F04: the Build pane uses `--ar-gutter` (16px on phones), not 32px; the title then fits at 360.
3. D-F7: recent-winner tiles use `AR.nm` names ("Mega Charizard Y") and `AR.art` (the `.is-mega` contour); drop the black "M" square.
4. D-F8: "How it works" steps stack as rows (step plate, title, line) in the half column, or the fold takes the full width.
5. P-F18, P-N9: Share and Copy for Showdown are phone bottom sheets with the round `.ar-x` at the top right and the overlay head; the focus ring never draws around the whole dialog or upright around a slanted menu row (ring on the `::before`, see section 20).
6. The dark `.archchip.dk` "Sand" chip is a tan (rgb 201,154,74): use the neutral dark tag with a gold edge.
7. P-F17: drop the custom favourite-Pokémon field style (the system field baseline covers it).

**arena-battle (css + js)**
1. P-F13: dark Type chart `.typebtn.ar-ty2` and `.tcb` type buttons: neutral `#2A2930` with the type colour as a 5–6px edge only (like dark `.ar-ty`); no type wash into graphite (Ground, Rock and Electric read brown, Bug olive).
2. P-F20, D-F34: the matchup head: one tab on the first line, the title flush with the kicker on the 16px gutter, the team names on a smaller line under one display line.
3. P-F21, D-F13, D-F33: "Damage both ways": the tile treatment of the best-hit grid (sprite on `.ar-mini`, 15px+ names via `AR.nm`, slanted or hairline result chips, move flush with the KO label), with a scroll cue or a layout that fits 360–390. The system already rewrites the `M-` labels, but print `AR.nm` names yourself.
4. P-F24: check the calc picker at 768 after `AR.fit` (it now steps names down); if a name still breaks, use two rows of tiles at tablet width.
5. `.ar-rstrip-nm` and `.bmslot .bmn`: print names with `AR.nm` (no "Indeedee (/F)" or "Basculegio/n" breaks).
6. D-F15: the speed race track on desktop fits the column (or wraps), and says "Scroll", not "Swipe", on pointer devices.
7. D-F31: the empty Battle slot row reserves the field height; the empty-state line and art sit clear below it.
8. D-F28: Gauntlet's bare "⌄ Matchup prep" becomes the fold strip.
9. P-N12: the "?" tip stays on the sentence's last line. The arrow before Rillaboom has no beige square behind it.

**arena-meta (css + js)**
1. D-F14, P-F12: How we calculate: the 7 checks and the sources are arena rows (hairline-separated, no outlined boxes), numbers as `.ar-step` purple plates (no round blue discs), figures in `--ar-sec-ink`, the winners line 15px ink-2. About's MIT licence `pre`: no outline (a paper-2 field).
2. P-F22: `text-shadow:none` on `#chHot .chpen`, `.ltl` and `.ltg`.
3. P-F05: delete the `.ar-mpg .chpghead .chpgt` font size (`min(var(--ar-fs-h1),10.6vw)`): section 28 sets `--ar-fs-page`. Keep the flex tab, sized 26–30px, on the first line. The kicker goes above the title on This week, Track record and How we calculate as on every other page.
4. D-F9: the page switcher sits above the title on every Meta sub-page (Winning teams and Events too).
5. D-F18: the Pokémon / Tournaments group tabs get a rounded `--ar-r-s` ring (or the ring on their `::before`).
6. D-F26: back links now exist on This week, How we calculate and About (added by `74-arena.js`); don't add your own.
7. D-F27, D-F28: Archetypes' "How to beat it" numbers and Track record use `.ar-step`; This week's "How we decide what changed" and About's folds use the fold strip, with no second icon square.
8. P-N7: Usage: the Showdown ladder segment never wraps alone; the search field is full width as on Ratings. P-N10: the "In your box" mark on the tier board is not clipped.
9. About: its head uses `.chpghead` (title at `--ar-fs-page`, the tab, no hero kicker) like its Meta siblings.
10. The info sheet's Info tab small text is now forced to 15px by `arena-p1.css`; delete the 12–14px rules for `.lsvl`, `.lsvn`, `.lsvo` and `.lstd`.

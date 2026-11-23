# Wave 2 proposal: five missing kit parts (direction pictures only)

Written by a helper on branch alt/wave2-parts, finished 8:11 PM (8:11:42), Sun Nov 22, 2026 (clock: docs/rebuild/now.sh).
Source: section 8 of docs/rebuild/research/consistency-audit-nov22.md (P1-5, P1-7, P1-8, P2-2, P2-5).
**Pictures and a proposal only. No site code was changed. Every look below waits for Sim's yes.**

## How the pictures were made (checked)

- Build: `node app/build.mjs --v2 --art=../src/v2/art/ --preview-data` (sprites + the frozen data from 0c992f69).
  Result line: `built dist/v2.html (4128 KB; 24 CSS layers, 8 data files, 55 scripts, 62 shared logic files)`.
  Meaning: the real new site, with real data and sprites, built in this worktree. (An --art build alone has no tournament data:
  Events said "Tournament results appear here after the next data refresh", so --preview-data was added.)
- The guard ran inside the build: `v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on
  the scale, colours only in tokens.css)`. Meaning: the site source in this branch is untouched and still clean.
- Every option is drawn on the REAL built page in Playwright: the page loads, waits 2.5 s, switches theme with `V2.setTheme`,
  then the option's CSS is added with `page.addStyleTag` and the real element's label is rewritten in place (after load, so
  nothing is wiped). The "lost" options are built with the kit's own helpers (`V2.kGo`, `V2.kLink`, `V2.nfDog`) on the live page.
  Picture-only CSS uses `!important` to beat the page; a real kit part would not need it.
- Views: 1440x900 day, 1440x900 night, 390x844 day (phone, touch), all at deviceScaleFactor 2.
- Each option picture is a board: **top row = today**, bottom row = the option, columns 1440 day / 1440 night / 390 day.
  The label band is printed on the picture (green = RECOMMENDED), by docs/rebuild/preview-kit/label-picture.cjs.
- "Before" sheets: each of today's variants cropped from its real page at its real size (day theme). Where the empty state
  can't be reached with the frozen data, the line was injected with its **real class and real words from the source**, so the
  page's own CSS styles it; those tiles say "(state injected)".
- Scripts (scratch, not committed): scratchpad/wave2/w2.cjs (options), before.cjs (sheets), compose.cjs (boards).
- Setup note: playwright 1.49.1 looked for chromium_headless_shell-1148 and failed ("Executable doesn't exist"); HH fixed it
  machine-wide with a symlink to the installed 1243 browser. My scripts pointed at the installed browser directly. No code changed.

All pictures: docs/rebuild/pics/nov22/alt/wave2/ (30 boards + 5 before sheets, webp, 64-244 KB each).

---

## 1. Show-more (P1-5)

### Today: 13 builds of one role (checked by grep in app/src/v2)

| # | Class | Where (file:line) | Label today | Seen in sheet |
|---|-------|-------------------|-------------|---------------|
| 1 | `np-link k-link ev-more` | events.js:100 | "Show More · 102 left ›" (700) | yes, 1440 |
| 2 | `ra-more` | meta.js:109 | "+6 more ›" (700, own CSS pages.css:1783) | yes, 1440 list view |
| 3 | `np-link` [data-ratier] | meta.js:53 | "See All 18 ›" on the tier band | yes, 390 |
| 4 | `tr-more gs-foldbtn` | meta.js:49 (text meta.js:56) | "Show D and F tiers ›" + a second line, grey slanted box | yes, 390 |
| 5 | `np-link us-more` | usage.js:49 (text usage.js:48) | "4 more ›", "Also ranked 61–100 ›" (600, phone only) | yes, 390 |
| 6 | `np-link wk-tmore` | thisweek.js:26 | "Show all 4 ›" / "Show Fewer" (600, phone only) | yes, 390 |
| 7 | `np-link k-link wt-open` | winning.js:102 | "More Winning Teams · 32 in all ›" | yes, 1440 |
| 8 | `np-btn2` (in `.wt-mbtns`) | winning.js:106 | "Show More · 23 left" as an outline button | yes, 1440 |
| 9 | `np-link tp-morebtn` | test-piles.js:73 | "8 more coin flips ›" (phone only) | yes, 390 |
| 10 | `np-link pr-more` | postroom.js:157 | "Show All 8 Stamps ›" (Mystery Gifts, still being built) | yes, 390 |
| 11 | `k-link is-all` | infosheet.js:42 | "Show all 262 ›" (move sheet) | yes, 1440 |
| 12 | `tr-more` | gauntlet.js:55 | "N more teams" grey box | **not captured** (needs a run of saved teams) |
| 13 | `np-link mu-more` | matchups.js:62, :86 | "Show N More ›", "Show All N ›" | **not captured** (needs a team) |
| also | `np-link cx2-more` | compare.js:92 | "Show N More Winners ›" | not captured (inside a picker) |
| also | `np-link sg2-all` | sugs.js:242 | "Show N More ›" / "Show Fewer" | not captured (needs a team) |
| also | `np-link bt-oallb` | battle.js:54 | "Show All N Tournament Teams" | not captured |

Note: the audit listed `tm-more` (team.js:457); checked, that is the "More ›" **menu** button, not a show-more. Left out.
Weights measured on the built page (computed style): np-link 600, k-link / ra-more 700. Three casings: "Show More", "Show all", "+N more".

Before sheet: `w2-more-before.webp`.

### Option A · RECOMMENDED · the list's tail
A solid PLOT-blue slanted box with the kit's chevron (`V2.K_CHEV`), then **"Show 102 more"** in Unbounded slanted 800, then a
dashed PLOT line running to the end of the list's width. One label pattern: "Show N more" / "Show fewer". 48 px tall.
- Today vs option: `w2-more-events-today.webp`, `w2-more-events-option-a.webp`, `w2-more-ratings-today.webp`, `w2-more-ratings-option-a.webp`.
- Could this be any other site? **Partly yes, honestly**: "label + rule under a list" is a common pattern. What makes it ours is
  the slanted solid box (the same skew as k-w / k-tag), Unbounded slanted, and the dashed line that echoes the pink dashed plan
  line, in blue because it's a button. I judge it passes, but it is the closer call of the two.

### Option B · the boxed blue word
The plot sentence's boxed word (`.k-w`: 3 px PLOT outline, skewed −8°) at 44 px with "Show 102 more ▾".
- Pictures: `w2-more-events-option-b.webp`, `w2-more-ratings-option-b.webp` (today row on top).
- Could this be any other site? **No**: it is exactly the Build page's blue word. But see the risk below.

**Recommendation: A.** Why: it reads as "the list goes on" and can't be mistaken for a filter, while B looks the same as the
filter chips and sentence words that sit a few lines above it on Ratings, Events and Usage.

**Pages that would change** (to `V2.kMore`): Events, Ratings (tier lists, "See All", the D/F fold), Usage (phone), This Week
(phone), Winning Teams (two of them, incl. the np-btn2 one), Test Run (coin flips; and the gauntlet "N more teams"), Matchups,
Compare, Suggestions, Battle (all teams), info sheets, Mystery Gifts. Open question for Sim: the D/F fold (#4) has a second
line ("295 more Pokémon, rated under 60"); A would keep it as a small note under the label (not drawn).

---

## 2. Filter chip (P1-7)

### Today: 3 parts for one role (checked)

| # | Part | Where | Look | Seen |
|---|------|-------|------|------|
| 1 | `ra-chip` | meta.js:86-89 (Ratings filter row) | grey slanted ends, Instrument Sans 600, pressed = light blue / black | yes |
| 2 | `ra-chip` | meta.js:93 (Ratings view switch) | same | yes |
| 3 | `.k-w` via `V2.kSent` | meta.js:104 (Ratings "Jump to" tiers) | 3 px blue outline box, Unbounded slanted | yes |
| 4 | `ra-chip` | sets.js:57 (Popular Sets matches) | grey slanted | yes |
| 5 | `np-chip ev-fc` | postroom.js:153 (Mystery Gifts filter) | np-chip, Instrument Sans, counts | yes |
| 6 | `.k-w` | events.js:96 ("Show me" sentence) | kit boxed word | yes |
| 7 | `.k-w` | usage.js:103 (source sentence) | kit boxed word | yes |
| also | `np-chip` button | winning.js:62 (active filter with ×), :77 ("often with" add chips) | np-chip | not captured (needs a search pick) |
| also | `np-chip` button | battle.js:127 (`V2.btChip`) | np-chip, aria-pressed | not captured |

CSS: np-chip components.css:18 (36 px unless a button); ra-chip pages.css:1762-1763 and a second clip-path in sugs.css:161;
k-w kit.css (`.k-w`). Checked: Build's 32 px `.bd-chips .np-chip` (pages.css:776) are `<span>` labels (build.js:81,
build-sheet.js:63), **not buttons**, so they are not filter chips and the 44 px rule doesn't apply to them (audit open item closed).
Also not filter chips: team.js:134 "Open now", box.js:48 "On your team" (static labels).

Seen on the real page: the Ratings filter row (grey `ra-chip`) sits right above the "Jump to" row of blue boxed words (`k-w`):
two looks for "pick what to see" a few pixels apart (`w2-chip-ratings-today.webp`).

Before sheet: `w2-chip-before.webp`.

### Option A · RECOMMENDED · the boxed blue word, chip size
Every filter chip becomes the kit's boxed word: 3 px PLOT outline, skewed −8° (text counter-skewed), Unbounded slanted 15,
counts in Instrument Sans 13; chosen = filled PLOT, white words. 44 px tall.
- Pictures: `w2-chip-ratings-option-a.webp`, `w2-chip-gifts-option-a.webp` (today row on top).
- Could this be any other site? **No**: it is the Build page's "blue words are buttons" box; no other site has it.

### Option B · the slanted ticket chip
Tidied `ra-chip`: parallelogram ends, card paper with a thin rule and a 3 px bottom bar (the move ticket's edge), Instrument
Sans 700; chosen = filled PLOT with an ink bottom bar. Quieter.
- Pictures: `w2-chip-ratings-option-b.webp`, `w2-chip-gifts-option-b.webp`.
- Could this be any other site? **Mostly no**: the slanted ends and the ticket bar are ours, but a grey pill row with one blue
  chip is a common pattern, so it carries less of NastyPlot than A.

**Recommendation: A.** Why: the kit already uses this exact box for filters in sentences ("Show me [Official events]", "Jump
to [S · 11]"), so making chips the same box gives one rule players learn once: blue box = tap, filled = chosen.
Risk, said plainly: a row of 6 outlined chips is louder than today; if Sim finds it too loud, B is the calmer fallback.

**Pages that would change** (to a kit `V2.kChip`): Ratings (filters + view switch), Popular Sets (matches), Mystery Gifts
(filter), Winning Teams (active filters, "often with"), Battle (`btChip`). Events / Usage / "Jump to" already use k-w: no change.

---

## 3. Secondary button (P1-8)

### Today (checked)

| # | Part | Where | Label | Seen |
|---|------|-------|-------|------|
| 1 | `np-btn` (old black primary) | meta.js:65 | "Pokémon Page" (Ratings hero; Ratings has no k-go) | yes |
| 2 | `np-btn2` | meta.js:65 | "Build Around It" | yes |
| 3 | `k-go` (kit primary, for reference) | winning.js:37 | "USE THIS TEAM." | yes |
| 4 | `np-btn2` | winning.js:74 (also :33, :34, :38, :55) | "Load Team", "Cancel", "Go to My Team" | yes (1440 + 390) |
| 5 | `np-btn` | battle.js:30 | "Enter Their Six" (Battle first screen, P1-10) | yes |
| also | `np-btn2` | events.js:67-68 | "Load Team", "Copy for Showdown", "Cancel" (np-btn "Replace") | not captured (needs an event opened) |
| also | `np-btn2` | usage.js:65 | "Add to My Team" | not captured (not on the first screen) |
| also | `np-btn2` | winning.js:106 | "Show More · N left" (a show-more in button clothes; see part 1) | yes, in the show-more sheet |

CSS: components.css:6 (np-btn, 52 px black, Unbounded 900) and :10-12 (np-btn2, 1.5 px ink outline, Instrument Sans 600,
skewX −12°). np-btn2 is in 23 page files (grep -c).

Before sheet: `w2-btn-before.webp`.

### Option A · RECOMMENDED · k-go's outline sibling
Same shape and slant as `k-go` (skewX −8°, square corners, text slants with the box), Unbounded slanted 800, 3 px ink outline,
no fill; on hover the k-go offset shadow appears in PLOT blue. 48 px.
- Pictures: `w2-btn-ratings-option-a.webp`, `w2-btn-winning-option-a.webp`.
- Could this be any other site? **No**: it is visibly the pink HATCH IT. / USE THIS TEAM. button's little sibling.

### Option B · blue slanted outline
Today's np-btn2 moved to kit tokens: 2 px PLOT outline, light PLOT wash, Instrument Sans 700, skewX −12°.
- Pictures: `w2-btn-ratings-option-b.webp`, `w2-btn-winning-option-b.webp`.
- Could this be any other site? **Partly yes**: a blue outline button is generic; the slant is the only NastyPlot cue. And it
  would look like the blue filter chips (part 2), which mixes "do something" with "pick what to see".

**Recommendation: A.** Why: one family of buttons (pink k-go = the one main move, ink outline = the others), so the rank is
obvious at a glance and buttons never look like filters.
Open question for Sim (not drawn): on Ratings, should "Pokémon Page" (old black np-btn) become the page's k-go? A only
restyles the secondary; the black np-btn stays until Sim decides (P1-8).

**Pages that would change** (to a kit `V2.kBtn`): Winning Teams, Events, Ratings, Usage first; then every np-btn2 on kit pages
(23 files use it; pre-reskin pages like Home stay as approved).

---

## 4. Empty line (P2-2)

### Today (checked): 16 `*-none` classes in CSS, 3 greys, 2 weights, plus `tm-sub` doing the same job

| # | Class | Where | Style (CSS) | Seen |
|---|-------|-------|-------------|------|
| 1 | `tm-sub` | sets.js:57 "No Pokémon matches that." | pages.css:27 · 400 · `--ink-2` | yes (real state) |
| 2 | `tm-sub` | winning.js:66 "Nothing in the winning teams matches that." | same, in the search dropdown | yes (real state) |
| 3 | `tm-sub` | usage.js:109 "No Pokémon in this list matches that." | same, under a big "0" count | yes (real state) |
| 4 | `ev-none` | events.js:31, :39 | pages.css:2884 · 400 · `--ink-2` | yes (injected) |
| 5 | `wk-none` | thisweek.js:11, :38-55 | pages.css:3117 · 400 · `--ink-2` | yes (injected) |
| 6 | `ar-none` | archetypes.js:34-43 | pages.css:3077 · 400 · `--k-ink2` | yes (injected) |
| 7 | `trk-none` | track.js:55-59 | pages.css:3229 · 400 · `--ink-2` | yes (injected) |
| 8 | `lo-none` | sets.js:77 | pages.css:4131 · 500 · `--wr-ink2` (receipt ink, pale on the page) | yes (injected) |
| 9 | `tm-sub ra-none` | meta.js:105-106 | pages.css:1784 (margin only) + tm-sub | yes (injected) |
| also | `bd-none` build.js:57 (pages.css:771, 500), `sg2-none` sugs.js:116 (sugs.css:42), `pr-none` postroom.js:93 (sd-postroom.css:47, 500), `dp-none` dispatch.js:101, `sdp-none` stampede-post.js:43, `dr-none` / `tp-none` test-piles.js:57/75, `kob-none` calc.js:78/81, `sx-none` six.js:151, `sh-none` team.js:70, `tc-none` types.js:61 | | | not in the sheet |

Before sheet: `w2-none-before.webp`.

### Option A · RECOMMENDED · the empty slot
The line sits in a slanted box with a 2 px dashed outline (an empty slot, like an empty team slot), Instrument Sans 500,
`--k-ink2`, one grey everywhere.
- Pictures: `w2-none-winning-option-a.webp`, `w2-none-usage-option-a.webp`.
- Could this be any other site? **Mostly no**: dashed "empty slot" boxes exist elsewhere, but slanted, with the kit's skew, it
  reads as NastyPlot's boxy shapes. Honest: it is a quiet part, so the identity is light.

### Option B · the big zero
No box: a big Unbounded slanted "0" in ink, then the line in `--k-ink2`.
- Pictures: `w2-none-winning-option-b.webp`, `w2-none-usage-option-b.webp`.
- Could this be any other site? **No** (the big slanted number is ours). But it is wrong for lines that aren't a count:
  "The event calendar appears after the next data refresh" is not zero, and on Usage the page already prints its own "0"
  (seen in the picture: two zeros).

**Recommendation: A.** Why: it says "nothing here yet" for every kind of empty (no match, no data yet, none this week)
without looking like an error, and it ends the 3 greys / 2 weights.

**Pages that would change** (to a kit `V2.kNone`): Popular Sets, Winning Teams, Usage, Ratings, Events, This Week, Archetypes,
Track Record, Build, Suggestions, Test Run, Calc. Left alone: lines on their own paper (receipt `lo-none` could keep receipt
ink if Sim prefers; Dispatch / Post / Postroom have their own palettes, per audit P2-3).

---

## 5. The "lost" header (P2-5)

### Today (checked): 3 screens, 3 looks

| # | Screen | Where | Look | Seen |
|---|--------|-------|------|------|
| 1 | Page not found | shell.js:346 (`V2.nfHtml`) | kit: k-kicker, k-h1 with em, k-lead, pink k-go, underdog hero card (Sim approved Nov 22, 12:40 PM per the code comment) | yes |
| 2 | No Pokémon here | pokemon.js:181 | old 13 px np-eyebrow, 64 px `ra-h` headline, np-btn2 "Every Pokémon, by tier ›", old `V2.lostDog` underdog | yes |
| 3 | This page didn't load | shell.js:421 (`V2.safeDraw`) | old `cm2` header, no kicker, **no way out** | yes (drawn by calling V2.safeDraw on the page) |

Before sheet: `w2-lost-before.webp`.

### Option A · RECOMMENDED · the approved Page not found shape, everywhere
`V2.kHead` + `V2.kGo` (+ the underdog hero card `V2.nfDog` where something is *missing*): "POKÉMON · NOT FOUND / No Pokémon
*here.*" + "EVERY POKÉMON, BY TIER." with today's underdog; "PAGE · DIDN'T LOAD / This page *didn't load.*" + "RELOAD."
(no underdog on an error: it's not the moment for the playful line). Copy kept from today except the kicker words and the
k-go label in capitals (the k-go pattern).
- Pictures: `w2-lost-pokemon-option-a.webp`, `w2-lost-didnt-load-option-a.webp`.
- Could this be any other site? **No**: big slanted Unbounded headline, black kicker chip, pink HATCH-style move and the
  underdog card are all NastyPlot.

### Option B · header only, quiet way out
`V2.kHead` + a `V2.kLink` ("Every Pokémon, by tier ›" / "Reload ›"), no underdog, no k-go.
- Pictures: `w2-lost-pokemon-option-b.webp`, `w2-lost-didnt-load-option-b.webp`.
- Could this be any other site? **Partly**: the headline is ours, but a headline plus a small link is a standard 404.

**Recommendation: A.** Why: Sim already approved this exact shape for Page not found, so the other two just catch up, and
every lost screen gets one clear way out (the didn't-load screen has none today).
Note for Sim: "RELOAD." is drawn as a link to #home in the picture; a real build would reload the page.

**Pages that would change**: the Pokémon page's not-found state and the shell's didn't-load screen; Page not found stays.

---

## Not checked

- Hover, focus and pressed states were written but not pictured (pictures are at rest).
- Tap size, qcheck and polish-check were not run on the options (they are pictures, not built parts). The options are all
  44-48 px tall by their CSS; not measured with tap-size.mjs.
- Night at 390 and other widths (320, 820, 1280, 1920): not pictured.
- Variants marked "not captured" in the tables (need a team, an opened event, or a picker): found by grep only.
- Webkit (Safari): not run.
- Whether Sim earlier chose any of today's looks on purpose for a page (e.g. Ratings' grey chips): not checked against his
  past approvals.
- Search: no new page or sheet is added, so the "Search finds it" rule doesn't apply.

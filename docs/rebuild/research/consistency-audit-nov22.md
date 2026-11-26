# Consistency audit of the new site (app/src/v2), Nov 22

Written by hC (look-only helper) for HH, at 5:06 PM (5:06:48), Sun Nov 22, 2026 (clock: docs/rebuild/now.sh).
Skill: consistent-ui, phases 0-3 and the phase 4 plan. Report only: no site code, CSS or tests were changed.

How it was checked:
- **Code scan**: grep and small node scripts over app/src/v2 (pages/*.js, kit.js, shell.js, css/*.css) at HEAD of t1rules (7dc78d29).
- **Measured**: a copy built in my own worktree (`node app/build.mjs --v2 --preview-data`, out/ from 0c992f69), opened in
  Playwright at 1440x900, day theme only. Computed font sizes, kicker styles, button and link styles read on 26 routes.
  The sprites (sp/) were not beside my build, so Pokémon pictures show as broken images in my screenshots. That is my
  set-up, not a site bug.
- Anything marked **not checked** was not run.

## 1. Stack and locale

- Plain web stack: HTML strings built in JavaScript (`V2.xxx = () => \`<div ...>\``), one CSS file per area, CSS custom
  properties for tokens. No framework, no Tailwind, no CSS-in-JS.
- 24 CSS files ship (app/parts-v2.json), 55 scripts. Every one of the 50 files in pages/ is listed there.
- Locale: English only. No translation files, so no translation gaps to check.

## 2. The canon I used

- Tokens: css/tokens.css (586 distinct names; tokens-doc counts 585). Type scale `--t13 ... --t34` plus 34 display
  tokens (`--d-*`). Spacing `--s1 ... --s24` (4px grid). Corners `--r-s 4 / --r-m 6 / --r-l 10 / --r-xl 18`. No motion tokens.
- The kit: kit.js (`V2.kHead`, `kSent`, `kPlan`, `kStep`, `kLink`, `kCard`, `kRoster`, `kHero`, `kFacts`, `kGo`, `kTag`,
  `kMove(s)`, `kMine`, `kFit`) and css/kit.css.
- CLAUDE.md: type scale, 4px grid, corners, line-height 1.5, Unbounded slanted headlines, Instrument Sans body, the word list.
- Approved exceptions I did NOT flag: Home stays as it is (Game Plan: "Home stays as it is today"), My Box stays as it is,
  Build's Plot (the kit grew from it), each page's own creative idea (receipts, stamps, tickets, the Plot band, the arena).
- Still being built, not scored: News (dispatch.js), Mystery Gifts (postroom.js), Track Record (track.js).

## 3. What the existing guard already covers

`node app/test/v2-guard.mjs` result line: `v2 guard: clean (no !important outside reduced motion, no id selectors, type
and spacing on the scale, colours only in tokens.css)`. Meaning: every CSS file and every `style="..."` in the JS passes
its six checks: no `!important` outside reduced motion, no `#id` selectors, font sizes only from `var(--tNN)` / `--d*`,
colours only in tokens.css, margin/padding/gap/inset on 0/1/2/6 or a multiple of 4 px, balanced braces.

What it can't see (so this audit looks there): sizes set from JavaScript at run time, which CSS rule wins when two
apply, the same role built differently on two pages, copy and casing, empty and loading states, focus and motion.

## 4. Score

| # | Area | Score | Main drift |
|---|------|-------|-----------|
| 1 | Spacing & layout | 3/4 | Grid enforced; the kit's own CSS writes 94 px literals and uses 1 spacing token |
| 2 | Typography | 2/4 | Same headline at 84 px or 64 px; same step heading at 40, 34 or 28 px; kicker casing mixed |
| 3 | Colour & theme | 3/4 | No stray hex (enforced); 8 "secondary ink" tokens, two greys for the same empty line |
| 4 | Components | 1/4 | Page header hand-built 5 ways; "show more" 11 classes; 3 chip parts; 2 quiet-link parts; 12 text fitters |
| 5 | Icons | 3/4 | One small icon set; close is ✕, ×, an SVG X or the word "Remove" |
| 6 | Corners & shadows | 3/4 | Mostly tokens; 12 literal radii; round is 50% or 999px |
| 7 | Interaction & motion | 3/4 | One global focus ring; kit offset 4 vs 3; 5 durations, no motion tokens |
| 8 | Forms | 3/4 | One field part (np-field); search placeholders use 5 different verbs |
| 9 | Page chrome | 1/4 | Headers, empty lines (28 classes) and not-found screens differ; Battle's first screen is pre-reskin |
| 10 | Copy | 2/4 | Title Case vs sentence case on the same control; "conversion" on Home |
| | **Total** | **24/40** | Band: Acceptable (20-27) |

Honest reading: the token layer is strong because the guard enforces it. The weak part is the layer above it:
the same role (header, step heading, show-more link, chip, empty line) is still built per page, and old page-wrapper
CSS quietly overrides the kit.

## 5. Findings

Effort: trivial (minutes) / moderate (an hour or two) / refactor (a day or more).
"Looks change" means the fix moves pixels, so it needs Sim's yes with pictures.

### P0

**P0-1. The kit's page header (`V2.kHead`) is used by none of the 13 pages reskinned today; each hand-builds it.**
- Measured / code: about.js:28 (`header.k-head`), feedback.js:17 and owner.js:65 (`div.k-head`), sets.js:49,
  archetypes.js:49, thisweek.js:31, method.js:40, meta.js:82, events.js:88, winning.js:88 (`section.ra-h`),
  shell.js:346 (Page not found). kHead is used only by battle-target, calc-plot, compare, practice, speed, test-piles,
  types, team (empty) and pokemon.
- Result: five header shapes. The kicker is `k-kicker np-eyebrow` (7 pages), `np-eyebrow wt2-kick` (Winning Teams,
  Events), or `np-eyebrow` alone (Usage). The H1 is `k-h1` with `<em>` (8 pages) or plain `u` with `<span class="pl">`
  (Ratings, Usage, Winning Teams, Events).
- Canon: `V2.kHead({kicker, h1Html, lead})` (kit.js:8).
- Fix: move each page's header to kHead; keep each page's extras (stamps, facts, tabs) after it. Effort: moderate.
  Looks change on some pages (see P1-1, P1-2): needs Sim's yes with pictures.

### P1

**P1-1. Old wrapper CSS beats the kit's step heading (`.k-h2`): the same role shows at 40, 34 or 28 px.**
- Measured at 1440 (Chrome DevTools protocol, matched rules): `.k-h2` = 40 px on Sets, Winning Teams, Archetypes,
  Speed, Types, Calc, My Team, Test Run. But 28 px on About, How We Calculate, Send Feedback (and Owner), because
  `.inf-grp h2,.infp h2` (pages.css:3320) is more specific; 28 px on Usage because of `.gs-title h2` (pages.css:2035);
  34 px on This Week because of `.wk h2` (pages.css:3116). Line height also changes (1.2 instead of 1.05).
- Canon: `.k-h2{font-size:var(--d-ksec)}` (kit.css:30).
- Fix: scope those old rules with `:not(.k-h2)` or drop them for kit pages. Effort: trivial. **Looks change: needs
  Sim's yes with pictures** (Sim approved these pages from screenshots that already showed the smaller sizes; he may
  want them small. Then the canon should say so instead of relying on a leak.)

**P1-2. The page headline is 84 px on kit pages and 64 px on six reskinned pages.**
- Measured: 84 px on Sets, Archetypes, About, Feedback, Not found, Speed, Types, Calc, Practice, Test Run, Compare.
  64 px on Ratings, Usage, Winning Teams, Events, This Week, How We Calculate. Cause: `.ra-h h1{font-size:var(--d64);
  line-height:.95}` (pages.css:1745) wins over `.k-h1` (kit.css:9), and four pages don't use `k-h1` at all.
- Canon: `.k-h1` with `--d-khead` (clamp 34-84 px).
- Fix: one size for the role, or a named kit option ("compact head") if Sim wants 64 on list pages. Effort: trivial
  in code. **Looks change: needs Sim's yes with pictures.**

**P1-3. Kicker casing is mixed: most are ALL CAPS, three are typed in mixed case, and the kit doesn't set case.**
- Measured: "Battle · Speed Tiers · level 50" (speed.js:23), "Battle · Type Chart" (types.js:53),
  "My Team · 0 of 6 · No team yet" (team.js:295) render in mixed case; every other kit kicker is "META · THE LOADOUT"
  style. Usage's kicker "Meta · Usage" (usage.js:99) is not a kit kicker at all (13 px Instrument Sans with the old bar).
  Screenshot: Speed Tiers kicker vs Ratings kicker (scratchpad hcs/kk-speed.png, kk-meta.png).
- Canon: majority pattern "SECTION · THE IDEA" in capitals.
- Fix: write them in capitals, or add `text-transform:uppercase` to `.k-kicker`. Effort: trivial. **Looks change: needs
  Sim's yes with pictures.**

**P1-4. The kicker chip is copied by hand, twice, instead of using `.k-kicker`.**
- pages.css:3996 (`.wt2 .ra-h .wt2-kick`) and pages.css:4195 (`.ev2 .ra-h .wt2-kick`) repeat the k-kicker declarations
  word for word (font, chip colours, skew). The "kicker as wide as its words" fix (`display:table`) is copied six times:
  pages.css:3338, 3372, ratings.css:19, 46, 60, 71.
- Canon: `.k-kicker` (kit.css:8).
- Fix: use `k-kicker` on Winning Teams and Events; move `display:table;max-width:100%` into kit.css once. Effort:
  trivial. No looks change if done exactly (measured today: the copies render the same 15 px Unbounded chip).

**P1-5. The "show more" control is built 11 ways, with two weights and two casings.**
- Classes: cx2-more, ev-more, tr-more, mu-more, ra-more, pr-more, tm-more, us-more, wt-more, wk-tmore, is-all
  (compare.js:92, events.js:100, gauntlet.js:55, matchups.js:62/86, meta.js:49/109, postroom.js:157, team.js:457,
  usage.js:49, winning.js:79, thisweek.js:26, infosheet.js:42).
- Measured: `np-link` = Instrument Sans 600; `k-link` = 700. Events uses both classes on one button.
- Labels: "Show More · 102 left ›" (Events), "See All 275 ›" (Ratings), "Show all 4 ›" then "Show Fewer" on the same
  button (thisweek.js:26), "Show all N ›" (info sheets), "+N more" (Ratings tiers).
- Canon: kit has no show-more part; `V2.kLink` is the nearest ("the step's one quiet link").
- Fix: add `V2.kMore(n, open)` to the kit (one label pattern, one weight), then move pages to it. Effort: moderate.
  Weight/case changes are visible: needs Sim's yes with pictures.

**P1-6. Two "quiet link" parts live side by side: `np-link` (600) and `k-link` (700).**
- components.css:15 vs kit.css:33. Winning Teams has about 10 np-link and 8 k-link uses in its code; Events about 8 and 4; Pokémon page uses only
  k-link; Ratings, About, Home use only np-link. Measured: About "Show Email" is np-link 600 with no ›
  (about.js:19); Send Feedback "Show Email ›" is k-link 700 (feedback.js:21). Same control, two looks, both reskinned today.
- Canon: `V2.kLink` on kit pages.
- Fix: kit pages use k-link only. Effort: moderate. Looks change (weight): needs Sim's yes with pictures.

**P1-7. Filter / toggle chips: three parts for one role.**
- `np-chip` (components.css:18; 36 px tall unless a button), `ra-chip` (pages.css:1762; slanted clip-path, tap height),
  and the kit's boxed word `k-w`. Ratings uses ra-chip for its filter row and view switch (meta.js:86-93), Popular Sets
  ra-chip (sets.js:57), Winning Teams np-chip (winning.js:62-77). Build's `.bd-chips .np-chip` is 32 px tall
  (pages.css:776), under the 44 px tap rule if those are buttons (not checked whether they are).
- Canon: none in the kit for a filter row. That's a gap, not page drift.
- Fix: add a kit filter chip (likely ra-chip's slanted shape, since it's the newer one), move pages to it. Effort:
  moderate. Needs Sim's yes with pictures.

**P1-8. Primary button: Ratings, Usage and Events still use the old black `np-btn` for their main action.**
- meta.js:65 ("Pokémon Page", np-btn) on Ratings, which has no `k-go` at all; events.js:67 (np-btn "Load" beside a
  k-go "USE THIS TEAM."); winning.js:34. Kit canon: `V2.kGo`, "the page's ONE big pink move" (kit.js:46).
- Also: kit has no secondary button, so every reskinned page falls back to `np-btn2` (winning.js:33-106,
  events.js:67-68, meta.js:65, usage.js:65). A kit gap.
- Fix: decide with Sim whether a page may have one k-go plus np-btn2s (likely yes) and whether np-btn survives on kit
  pages. Effort: moderate. Needs Sim's yes with pictures.

**P1-9. `k-go` labels: 18 are "CAPITALS WITH A FULL STOP.", 5 are not.**
- practice.js:43 "Start", practice.js:65 "Reveal What Strong Players Chose", practice.js:77 "Next Team",
  team.js:296 "Build Me a Team", stampede.js:27 "SEE ALL RATINGS ›" (Home, approved as is). kit.css doesn't set case,
  so these show in Title Case.
- Canon: majority "USE THIS TEAM." pattern.
- Fix: write the labels in the majority pattern. Effort: trivial. Visible: needs Sim's yes (Practice was approved with
  pictures; he may have chosen this on purpose).

**P1-10. Battle's first screen (no opponent yet) is still pre-reskin.**
- Measured on #battle: 0 kit parts; kicker is the old 13 px `np-eyebrow` with the blue bar ("Battle a team · Team
  preview", battle.js:23); headline 64 px; main button the old black `np-btn` "Enter Their Six". Once their six is in,
  the reskinned "target" (battle-target.js, kHead) takes over. Screenshot: scratchpad hcs/pg-battle.png.
- Canon: the kit, per Sim's Nov 22 rule "everything is done with the kit".
- Fix: put the empty state on kHead + kGo. Effort: moderate. Needs Sim's yes with pictures. (I did not check whether
  Sim approved this first screen separately.)

### P2

**P2-1. Twelve separate "shrink text until it fits" functions; some write px sizes off the type scale.**
- kit.js:75 `V2.kFit` (data-kmax levels) is the kit's way. Others: home.js:178 fitUsed, monsheet.js:95/103/148,
  stampede-six.js:114, stampede-tools.js:115, team-frame.js:50, team.js:430, types.js:29/36, build-plot.js:42/49/107.
  monsheet.js:108 and :121 set `fontSize = px + 'px'`: a size off the scale that the guard can't see.
- Fix: route fitting through kFit levels; never write px. Effort: refactor. Looks may shift on the Pokémon sheet.

**P2-2. The empty line ("nothing this week") is styled 4 ways with 3 greys.**
- pages.css:2884 `.ev-none` (400, `--ink-2`), :3077 `.ar-none` (400, `--k-ink2`, which is `--ink-3`), :3229 `.trk-none`
  (400, `--ink-2`), :4131 `.lo-none` (500, `--wr-ink2`). 28 empty/none classes in all, no kit part.
- Fix: one `k-none` line in the kit. Effort: moderate. Small grey change: needs Sim's yes with pictures.

**P2-3. Eight "secondary text" colour tokens for one role.**
- `--ink-2`, `--k-ink2`, `--wr-ink2`, `--dp-ink2`, `--rc-ink2`, `--pr-ink2`, `--mtf-ink2`, `--pc-ink2` (tokens.css).
  Some are right (they sit on their own paper: receipt, dispatch, arena). But `--k-ink2` = `--ink-3`, while the
  pre-kit pages use `--ink-2` for the same sentence role.
- Fix: write down which surfaces own a palette; on the page background, one secondary ink. Effort: moderate.

**P2-4. The kit's own CSS bypasses the spacing tokens.**
- kit.css: 94 literal px in margin/padding/gap, 1 `var(--s*)`. pages.css: 2,759 tokens, 296 literals. All on the grid
  (the guard passes), so this is about the exemplar, not the look.
- Fix: swap kit.css literals for `--s*`. Effort: trivial. No looks change.

**P2-5. Not-found screens differ.** Page not found (shell.js:346) is on the kit; the Pokémon page's "No Pokémon here"
(pokemon.js:181) uses the old 13 px `np-eyebrow` and 64 px headline (measured). The "didn't load" screen (shell.js:421)
uses the old `cm2` header. Fix: one kit "lost" header. Effort: trivial. Needs Sim's yes with pictures.

**P2-6. Word list: "conversion" is on Home.** home.js:151 "Ratings: top-cut presence, conversion and win rate at real
tournaments." Word list: "reaches top cut more often than its use predicts (not conversion)". Effort: trivial. (Home is
approved as is, but the word list still applies to its copy; Sim's call.)

**P2-7. Word list: "Real games: see Matchups ›"** (team.js:551). Sim, Nov 10: no "Real games:" prefix. Effort: trivial.

**P2-8. The data-loading screen shows the logo, not the rotating underdog.** shell.js:449. CLAUDE.md: "empty and loading
screens show a featured Pokémon that rotates". Possibly fine on purpose (ratings may not be loaded yet, so no underdog
to pick). Question for Sim, not a fix.

### P3

- **P3-1. Literal radii** where a token exists: `10px` (pages.css:429, 448, 460, 508 and two more), `18px`
  (pages.css:365), `4px` (shell.css:34). "Round" is `50%` (26 uses) or `999px` (3, e.g. arena-calc.css:24). Trivial.
- **P3-2. Motion has no tokens.** Transition durations .15s (8), .2s (13), .22s, .25s (2), .35s; four easing curves
  (cubic-bezier(.2,.8,.2,1), (.16,1,.3,1), (.65,0,.35,1), ease-out). Reduced motion is handled once globally
  (base.css:19), so all of these switch off correctly. Add `--dur-1/--dur-2/--ease` and use them. Trivial.
- **P3-3. Focus ring offset:** global `:focus-visible` is 3 px plot, offset 3 (base.css:12); kit parts use offset 4
  (kit.css:20); 29 rules use offset 2. Pressed-state outlines are 1.5 px or 2 px. Trivial; tiny visible change.
- **P3-4. Close/remove marks:** sheet close ✕ (shell.js:158), remove chips × (battle.js:47, record.js:25,
  winning.js:62), Clear is an SVG X (shell.js:55), Team frame says "Remove" (team-frame.js:34). Trivial.
- **P3-5. Search placeholders use five verbs** for one job: "Find a Pokémon...", "Look up a Pokémon" (sets),
  "Type a Pokémon", "Search winning teams", "Any Pokémon". The global search placeholder leaves out "Ability" while its
  label includes it (shell.js). Two paste placeholders differ ("Paste a team..." vs "Paste here: a team..."). Trivial.
- **P3-6. Chip casing in one row:** Ratings filters "No Megas", "Hidden Gems" (Title Case) next to "In my box"
  (meta.js:88). Trivial.
- **P3-7. Sentence-case buttons among 107 Title Case ones:** "Every gift so far ›" (postroom.js:159), "How the Strength
  Score works ›" (compare.js:73, team.js:395), "Paste its log" (record.js:21), "Skip to the page" (shell.js:375). Trivial.
- **P3-8. Lead line under the headline:** 17 px on most kit pages, 15 px on My Team and Compare, 16 px on Test Run
  (measured). Trivial; needs Sim's yes.
- **P3-9. "Ladder player rated"** (practice.js:46): the word list's source names are "Ranked ladder" / "Showdown ladder".
- **P3-10. Two pages edit kCard's HTML with a string replace** to add classes: team-frame.js:21
  (`c.replace('class="k-card', ...)`) and team.js:82. It works today but breaks silently if kCard's markup changes.
  Better: a `cls` option on `V2.kCard`. Trivial, no looks change.

## 6. Systemic patterns (the causes)

1. **Old wrapper selectors outrank the kit.** `.infp h2`, `.wk h2`, `.gs-title h2`, `.ra-h h1` are element selectors
   inside a class (0,1,1); kit parts are a single class (0,1,0). Any page still wrapped in its old container silently
   loses the kit size. This explains P1-1 and P1-2, and will hit every future page that keeps an old wrapper.
2. **The kit has gaps, so pages fall back to old parts.** No secondary button, no filter chip, no show-more, no empty
   line, no "lost" header. Each reskinned page then picks np-btn2, ra-chip or np-chip, writes its own *-more and
   *-none. This is most of the Components and Page chrome scores.
3. **Kit helpers exist but pages paste the markup.** kHead is skipped by all 13 of today's reskins; Winning Teams and
   Events copy the kicker CSS. Copy-paste drifts on the next edit.
4. **Text case lives in the source text, not in the CSS.** Kickers and k-go labels have no `text-transform`, so each
   author's typing decides the look (P1-3, P1-9).
5. **Sizes set from JavaScript escape the guard.** Twelve fitters, some writing px (P2-1).

## 7. What is already consistent (keep it)

- No colour literal anywhere outside tokens.css, no `!important` outside reduced motion, no id selectors (guard, clean).
- Every font size in CSS comes from the scale or a named display token.
- One global focus ring and one global reduced-motion switch; every removed outline I checked has a replacement
  (`.np-field:focus-within`, `.pr-sw:has(...)`, `.sdt-go::after`), except `.pl-find:focus-within`, which only darkens
  its border (plot.css:26).
- One field part (`np-field`) for every search box and select.
- Move names: one ticket everywhere (`V2.kMove`), type word always next to the symbol, as Sim asked.
- Pokémon cards on kit pages all go through `V2.kCard` / `V2.kRoster`; no page writes `k-card` markup from scratch
  (two pages rewrite kCard's output, see P3-10).
- Headlines are Unbounded slanted on every page measured (26 routes); body is Instrument Sans.
- Title Case for buttons and links is the clear majority (107 of 117 labels).

## 8. Plan in four waves

Each wave can run on its own. One change at a time, its own test, as always.

**Wave 1: token and kit-source fixes (no looks change).** kit.css spacing literals to `--s*` (P2-4); literal radii to
`--r-*`, one "round" (P3-1); add motion tokens and use them (P3-2); Winning Teams and Events use `.k-kicker` instead of the
copied CSS, and move `display:table` into kit.css (P1-4). Check: v2-guard, kit-page.mjs, before/after screenshots must
match pixel for pixel. If any screenshot differs, it stops and goes to Sim.

**Wave 2: fill the kit's gaps, then move pages (needs Sim's yes with pictures).** Add kit parts for show-more (P1-5),
filter chip (P1-7), secondary button (P1-8), empty line (P2-2), "lost" header (P2-5); route text fitting through kFit
(P2-1). One direction picture of the new parts first, then page by page.

**Wave 3: cross-page alignment (needs Sim's yes with pictures).** Headers on kHead (P0-1); one headline size and one
step-heading size, removing the wrapper leaks (P1-1, P1-2); kicker and k-go casing (P1-3, P1-9); quiet links on k-link
(P1-6); Battle's first screen on the kit (P1-10). Sim decides each size; the canon is then written into kit.css, not
left to specificity.

**Wave 4: polish (needs Sim's yes with pictures where visible).** Focus offset (P3-3), close marks (P3-4), copy and
casing (P2-6, P2-7, P3-5 to P3-9), lead size (P3-8), the loading-screen question (P2-8).

## 9. Not checked

- Phones, tablets and odd widths: everything measured was 1440x900 only.
- Night theme: not measured. 298 colour tokens have no night value; many look deliberate (type colours, printed paper),
  but I didn't look.
- Pages still being built (News, Mystery Gifts, Track Record): read in passing only, not scored.
- The Move / Ability / Item info sheets: code only (infosheet.js, infosheet.css); not opened in the browser.
- Whether each P1 difference was something Sim already approved in pictures. Several look like leaks, but he may like
  the result. Every looks change above is for Sim to decide.
- Contrast, screen readers, keyboard order: not checked (only focus outlines were read).
- Search reachability of new parts: not checked.
- The 32 px Build chips: not checked whether they are buttons.

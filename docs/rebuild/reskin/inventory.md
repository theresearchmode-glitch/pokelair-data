# Reskin feature inventory: today's pages (Nov 21, 2026, 12:48 PM)

Look-only inventory by helper hF for the site-wide reskin (Sim's rule: every feature of today's page must survive the rebuild onto the shared kit).
Source: the pages in docs/rebuild/mocks/cohesion-nov21/PAGES.md (My Box and the Owner page skipped, as asked).

How it was made (so anyone can re-run it):
- Code: app/src/v2/pages/*.js and app/src/v2/shell.js at commit 7b3ef220. Each page lists its files, where its page is registered, its `data-*` hooks with file:line, and its drawing functions with their comment.
- Built page: `node app/build.mjs --v2 --preview-data` (out/ from 0c992f69), opened in Chromium through the behaviour harness (app/test/behaviour/harness.mjs, frozen fixture data, `account: false` so the seeded team is used: with the fake account the Preview shows its own sample team "Sun Tailwind (sample)").
- Team used: Charizard-Mega-Y, Garchomp, Incineroar, Whimsicott, Rillaboom, Kingambit (box = harness BOX, opponents = harness OPP, two saved teams). "Empty" = six empty slots.
- Widths: 390x844 (touch) and 1440x900. Heights are the full document height (scrollHeight) after the page settles, in px.
- Controls and facts are what the page showed at 390 with the team (desktop-only or phone-only items are marked). Long repeated rows (e.g. 300 ratings rows) are grouped: one line per kind of control with its count and examples.
- Test hooks: every test file in app/test (v2-*.mjs, the behaviour groups A/B/C/D/Z and their v2 adapters, plus sheet-tabs, tap-size, test-ids, forms-contrast, share-fz, prelaunch, player-fields, qcheck, shots) was searched for the page's own `data-*` hooks and its own classes (classes shared by more than 3 pages and plain words without a digit or hyphen were left out as too general). "route" = the file opens the page by its address. This is a text search: a test may also reach a page through visible words (the behaviour tests prefer text), so treat the list as the hooks that MUST keep their names, not as every test that touches the page.
- States shared by every page (not repeated below): loading panel `V2.loadingHtml` (shell.js; "Getting today’s numbers…", `aria-busy`, until every daily document answers or 8 s), draw error `V2.safeDraw` ("This page didn’t load."), data note `V2.dataNote` (Home and Meta pages: Preview data could not be read / regulation note), header, menu, search, theme switch (`data-v2theme`), footer links (How We Calculate, About, Privacy, Contact), `data-v2mon` on any sprite or name opens that Pokémon.

Read this first (what the automatic parts can and cannot see):
- `#sheet` in PAGES.md is called "Team Sheet", but in today's Preview build the address `#sheet` is a Preview-only demo: My Team with Garchomp's Pokémon info sheet open (monsheet.js:160). The real Team Sheet is a page-like sheet opened from My Team (Team Sheet link, `V2.openTeamSheet`, `.ts2`, team.js). Both are inventoried: section 5 is the `#sheet` address, the Appendix has the Team Sheet and the info sheet themselves.
- Only the first screen state of each page was opened in the browser (with a team, and with an empty team). States that need a tap (Build's results, opened sheets, menus, Edit Set, Saved Teams, All Suggestions, the threat sheet...) are covered from the code: the line "Hooks the code listens for that were not on screen" lists them with file:line. The older inventories docs/rebuild/inventory/A-team.md, B-build.md, C-battle.md, D-meta-shell.md describe those flows feature by feature (written for the old site, Nov 10, with the behaviour test IDs).
- Pokémon sprites did not load in the test copy (the art files are not beside it), so the screenshots show empty picture boxes. The picture boxes are sized by CSS, so heights should match the real Preview, but that is not checked here.
- Home: the live Home is The Stampede (stampede*.js, `V2.STAMPEDE`); home.js still holds the older Home drawing and shared helpers.
- The "controls" and "data hooks" counts in the summary are counts of kinds on screen and of distinct `data-*` names in the page's files; files shared by several pages (team.js for My Team, empty My Team and `#sheet`) count for each.

Tick a box when the reskinned page keeps that feature (or Sim agreed to drop it).

## Summary

| # | Page | id | phone 390 (team) | phone 390 (empty team) | desktop 1440 | controls | data hooks | test files |
|---|---|---|---|---|---|---|---|---|
| 1 | Home (the herd / Stampede) | home | 6200 | 6026 | 5427 | 124 | 22 | 27 |
| 2 | Build | build | 3133 | 3133 | 2266 | 46 | 36 | 15 |
| 3 | My Team | team | 3802 | 2576 | 2753 | 67 | 104 | 46 |
| 4 | My Team, empty | team-empty | 2576 | - | 1245 | 19 | 53 | 21 |
| 5 | Team Sheet (and the Preview #sheet demo) | sheet | 3475 | 2576 | 2753 | 17 | 57 | 23 |
| 6 | Compare | compare | 1347 | 1215 | 955 | 6 | 8 | 7 |
| 7 | Battle (lead planner) | battle | 4074 | 1147 | 2141 | 33 | 31 | 14 |
| 8 | Damage Calc "Plot the hit" | calc | 2176 | 2147 | 1449 | 91 | 28 | 17 |
| 9 | Speed Tiers | speed | 2952 | 2268 | 1737 | 46 | 4 | 5 |
| 10 | Type Chart | types | 2798 | 2870 | 1897 | 52 | 9 | 3 |
| 11 | Team Preview Practice | practice | 1661 | 1625 | 1108 | 13 | 8 | 5 |
| 12 | Test Run (Three Piles) | gauntlet | 1901 | 943 | 2099 | 29 | 6 | 6 |
| 13 | Ratings | meta | 2893 | 2893 | 3003 | 79 | 15 | 12 |
| 14 | Usage | usage | 3575 | 3674 | 2326 | 39 | 9 | 13 |
| 15 | Popular Sets | sets | 3148 | 2833 | 2031 | 31 | 7 | 11 |
| 16 | Archetypes | archetypes | 2536 | 2339 | 1846 | 20 | 3 | 6 |
| 17 | Winning Teams | tournaments | 3386 | 3331 | 1922 | 59 | 19 | 6 |
| 18 | Events | events | 3684 | 3684 | 2541 | 30 | 13 | 9 |
| 19 | This Week | weekly | 4694 | 4694 | 3149 | 41 | 6 | 6 |
| 20 | News (The Champions Dispatch) | news | 3870 | 3870 | 2185 | 43 | 6 | 7 |
| 21 | Gifts (The Post Room) | gifts | 3668 | 3668 | 2075 | 16 | 5 | 7 |
| 22 | Track Record | track | 3421 | 3421 | 1724 | 9 | 1 | 6 |
| 23 | How We Calculate | method | 3424 | 3424 | 1624 | 12 | 3 | 8 |
| 24 | About | about | 2758 | 2758 | 1536 | 21 | 1 | 4 |
| 25 | Send Feedback | feedback | 1402 | 1402 | 935 | 8 | 7 | 7 |
| 26 | A Pokémon's page (#pokemon=incineroar) | pokemon | 3796 | 3860 | 2769 | 25 | 12 | 18 |
| 27 | Page not found (#nonsense) | notfound | 943 | - | 900 | 2 | 0 | 0 |

## 1. Home (the herd / Stampede) (`#home`)

- Files: app/src/v2/pages/home.js (202 lines), app/src/v2/pages/stampede.js (25 lines), app/src/v2/pages/stampede-hero.js (192 lines), app/src/v2/pages/stampede-post.js (52 lines), app/src/v2/pages/stampede-six.js (131 lines), app/src/v2/pages/stampede-tools.js (120 lines). Registered at home.js:190.
- Browser title: "NastyPlot". Phone height at 390: **6200 px** with a team, **6026 px** with an empty team; desktop 1440: 5427 px. No page errors.
- What home.js says it is: Home (R4 Home, Nov 12): built piece by piece from the approved mock-up (docs/rebuild/mocks/home.tpl.html) Every Home feature of today's site is kept (behaviour tests HOME-01..16). Numbers come from shared logic (05-home-data.js, CH.metaSix, RES), so both sites say the same thing. Piece 1: the hero (tagline, start buttons, Import…
- What stampede.js says it is: Home: "The Stampede" (Sim, Nov 18: replaces today's Home, incl. Tonight's main event) Brief, adaptations and contract: docs/rebuild/stampede/BRIEF.md. Mock-ups: docs/rebuild/stampede/mockups/ (pictures, not specs: our rules win where they differ). Four slanted full-width bands: hero (blue), your six (ink), tools (beige), post (r…
- What stampede-hero.js says it is: Home, The Stampede: the hero band (see stampede.js and docs/rebuild/stampede/BRIEF.md) V2.sdHero = () => html; V2.sdHeroAfter = () => {} runs after every draw and redraw (lays the herd out, adds the crowd once). Every Pokémon the Ratings page rates (V2.sdData().herd, live data) is in the picture, sized by its rating: the ones wi…
- What stampede-post.js says it is: Home, The Stampede: the post band (see stampede.js and docs/rebuild/stampede/BRIEF.md) V2.sdPost = () => html; optional V2.sdPostAfter = () => {} runs after the page is drawn. "The post is in." (brief section 4): a Pelipper flies the post in over the band's top edge (a sprite, decorative). Two columns, gifts then news (stacked u…
- What stampede-six.js says it is: Home, The Stampede: the six band (see stampede.js and docs/rebuild/stampede/BRIEF.md) V2.sdSix = () => html; V2.sdSixAfter = () => {} runs after the page is drawn (arrows on the plan board, names that don't fit). Band 2, "Call six out of the herd." (ink): three parts, left to right on desktop and top to bottom on phones: 1. the …
- What stampede-tools.js says it is: Home, The Stampede: the tools band (see stampede.js and docs/rebuild/stampede/BRIEF.md) V2.sdTools = () => html; optional V2.sdToolsAfter = () => {} runs after the page is drawn. "Same herd. Twelve tools." (brief section 3): twelve plates of different sizes, every row full, each a link to its tool. The whole plate opens the tool…

### Sections, in order (built page, 390)

- [ ] H1: Sharply raise your win rate.
- [ ] H2: Call six out of the herd.
- [ ] H3: Your Strength Score
- [ ] H3: Walk in with a turn 1 plan.
- [ ] H2: Same herd. Twelve tools.
- [ ] H3: Speed Tiers
- [ ] H3: Ratings
- [ ] H3: Damage Calculator
- [ ] H3: Winning Teams
- [ ] H3: Battle
- [ ] H3: Team Preview Practice
- [ ] H3: More tools
- [ ] H2: The post is in.
- [ ] H3: Mystery Gifts
- [ ] H3: Champions News
- [ ] H2: A New Mystery Gift Campaign (opens the full story at its source, in a 
- [ ] H3: Type Chart (desktop only)
- [ ] H3: Winning Cores (desktop only)
- [ ] H3: Archetypes (desktop only)
- [ ] H3: Popular Sets (desktop only)
- [ ] H3: Events (desktop only)
- [ ] H3: How We Calculate (desktop only)

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.sd-band : Sharply raise your win rate.
- [ ] ul.sdh-plates [The four highest rated] : 
- [ ] ul. [Next in the ratings] : 
- [ ] section.sd-band : Call six out of the herd.
- [ ] ol.sds-rings [Your six] : 
- [ ] ol.sds-bands [Strength Score bands, low to high] : 
- [ ] section.sd-band : Same herd. Twelve tools.
- [ ] p.sdt-hp [Dire Claw takes 81 to 96% of Rillaboom's HP] : 
- [ ] nav.sdt-chips [More of the twelve tools] : 
- [ ] nav.sdt-more [More tools] : More tools
- [ ] section.sd-band : The post is in.
- [ ] section.sdp-nw : What's New 7 updates: A new look, Strength Score…
- [ ] details.sdp-nf : What's New 7 updates: A new look, Strength Score…
- [ ] section.sdp-col : Mystery Gifts
- [ ] article.pr-parcel [Mystery Gift: 2 Training Tickets] : 
- [ ] section.sdp-col : Champions News
- [ ] article.dp-paper [The Champions Dispatch, front page] : A New Mystery Gift Campaign (opens the full story at its sou
- [ ] section.dp-lead [Lead story] : A New Mystery Gift Campaign (opens the full story at its sou

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Sneasler 97", "Rillaboom 97", "Kingambit96" ×4 — button:button.sdh-plate (2 hidden until opened) — hooks: `data-v2mon` (home.js:12, home.js:57)
- [ ] "All Ratings ›" — a.sdh-all → #meta — hooks: none
- [ ] "Score My Team" — a.sdh-b1 → #team — hooks: `data-sdgo` (stampede-hero.js:39, stampede-hero.js:39)
- [ ] "Build Me a Team" — a.sdh-b2 → #build — hooks: `data-sdgo` (stampede-hero.js:39, stampede-hero.js:39)
- [ ] "Kingambit 96", "Incineroar 95", "Mega Charizard Y 94" ×36 — button:button — hooks: `data-v2mon` (home.js:12, home.js:57)
- [ ] "Pause the moving ratings" — button:button.sdh-tpz — hooks: none
- [ ] "Mega Charizard Y", "Garchomp", "Incineroar" ×6 — button:button.sds-nm — hooks: `data-v2mon` (home.js:12, home.js:57)
- [ ] "Build Me a Team" — a.np-btn.sds-btn → #build — hooks: none
- [ ] "Import a Team ›" — button:button.np-link.sds-lk — hooks: `data-v2homeimport` (home.js:41, home.js:201)
- [ ] "Open My Team" — a.np-btn.sds-rb → #team — hooks: none
- [ ] "Rillaboom", "Farigiraf" ×2 — button:button.sds-tk.them — hooks: `data-v2mon` (home.js:12, home.js:57), `data-sdsk` (stampede-six.js:96)
- [ ] "Mega Charizard Y Weather Ball", "Garchomp Dragon Claw" ×2 — button:button.sds-tk.you — hooks: `data-v2mon` (home.js:12, home.js:57), `data-sdsk` (stampede-six.js:96), `data-sdsat` (stampede-six.js:96, stampede-six.js:110)
- [ ] "Battle" — button:button.np-btn.sds-bt — hooks: `data-hmprep` (home.js:36, home.js:195), `data-sdgo` (stampede-hero.js:39, stampede-hero.js:39)
- [ ] "Speed Tiers" — a.sdt-go → #speed — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Tiers` ((drawn by shared code))
- [ ] "50 Kingambit", "60 Incineroar", "78Basculegion" ×9 — button:button.sdt-m.sdt-run (5 hidden until opened) — hooks: `data-k` (stampede-tools.js:58, stampede-tools.js:59), `data-v2mon` (home.js:12, home.js:57)
- [ ] "Type Chart" — a.sdt-go → #types (1 hidden until opened) — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Chart` ((drawn by shared code))
- [ ] "Ratings" — a.sdt-go → #meta — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97)
- [ ] "97", "96" ×3 — button:button.sdt-m.sdt-step — hooks: `data-v2mon` (home.js:12, home.js:57)
- [ ] "Damage Calculator" — a.sdt-go → #calc — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Calculator` ((drawn by shared code))
- [ ] "Sneasler: open its info" — button:button.sdt-m.atk — hooks: `data-v2mon` (home.js:12, home.js:57)
- [ ] "Rillaboom: open its info" — button:button.sdt-m.def — hooks: `data-v2mon` (home.js:12, home.js:57)
- [ ] "Winning Teams" — a.sdt-go → #tournaments — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Teams` ((drawn by shared code))
- [ ] "Load Team ›" — button:button.np-link — hooks: `data-hmload` (home.js:35, home.js:193)
- [ ] "Copy for Showdown" — button:button.np-link — hooks: `data-hmcopy` (home.js:35, home.js:195)
- [ ] "Mega Camerupt, holds Cameruptite: open its info", "Sylveon, holds Fairy Feather: open its info", "Rillaboom, holds Life Orb: open its info" ×13 — button:button.sdt-m (3 hidden until opened) — hooks: `data-v2mon` (home.js:12, home.js:57)
- [ ] "Battle" — a.sdt-go → #battle — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97)
- [ ] "Winning Cores" — a.sdt-go → #build (1 hidden until opened) — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Cores` ((drawn by shared code)), `data-hmcores` (home.js:120, home.js:145)
- [ ] "Archetypes" — a.sdt-go → #archetypes (1 hidden until opened) — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97)
- [ ] "Team Preview Practice" — a.sdt-go → #practice — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Preview` ((drawn by shared code)), `Practice` ((drawn by shared code))
- [ ] "Popular Sets" — a.sdt-go → #sets (1 hidden until opened) — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Sets` ((drawn by shared code))
- [ ] "Events" — a.sdt-go → #events (1 hidden until opened) — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97)
- [ ] "How We Calculate" — a.sdt-go → #method (1 hidden until opened) — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `We` ((drawn by shared code)), `Calculate` ((drawn by shared code))
- [ ] "Type Chart" — a.sdt-chp → #types — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Chart` ((drawn by shared code))
- [ ] "Winning Cores" — a.sdt-chp → #build — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Cores` ((drawn by shared code))
- [ ] "Archetypes" — a.sdt-chp → #archetypes — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97)
- [ ] "Popular Sets" — a.sdt-chp → #sets — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Sets` ((drawn by shared code))
- [ ] "115 Events" — a.sdt-chp → #events — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97)
- [ ] "13,631 How We Calculate" — a.sdt-chp → #method — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `We` ((drawn by shared code)), `Calculate` ((drawn by shared code))
- [ ] "Test Run ›" — a.np-link → #gauntlet — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Run` ((drawn by shared code))
- [ ] "Compare Teams ›" — a.np-link → #compare — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Teams` ((drawn by shared code))
- [ ] "This Week ›" — a.np-link → #weekly — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Week` ((drawn by shared code))
- [ ] "Track Record ›" — a.np-link → #track — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Record` ((drawn by shared code))
- [ ] "Usage ›" — a.np-link → #usage — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97)
- [ ] "My Box ›" — a.np-link → #box — hooks: `data-sdtool` (stampede-tools.js:55, stampede-tools.js:97), `Box` ((drawn by shared code))
- [ ] "What's New 7 updates: A new look, Strength Score…" — summary — hooks: none
- [ ] "×" — button:button.sdp-nx — hooks: `data-hmnewx` (home.js:170, home.js:171)
- [ ] "All 10 Gifts ›" — a.sdp-all → #gifts — hooks: none
- [ ] "Copy Code" ×2 — button:button.np-btn.pr-copy (1 hidden until opened) — hooks: `data-prcopy` (stampede-post.js:8, stampede-post.js:17)
- [ ] "Jun '26RaichuEvent gift, from June 2026, ended Sep" — button:button.pr-st (1 hidden until opened) — hooks: `data-v2mon` (home.js:12, home.js:57)
- [ ] "Apr '26MachampSerial code, from April 2026, ended " — button:button.pr-st (1 hidden until opened) — hooks: `data-prset` (postroom.js:118, postroom.js:162)
- [ ] "All 69 Stories ›" — a.sdp-all → #news — hooks: none
- [ ] "A New Mystery Gift Campaign (opens the full story ", "Season M-⁠9 Battle Passes (opens the full story at", "Wednesday, December 2, 2026 Battle Balance Adjustm" ×5 — a.dp-hl → https://champions-news.pokemon-home.com/ (4 hidden until opened) — hooks: none
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-hmaround` (home.js:93, home.js:98), `data-hmwelcome` (home.js:30, home.js:159), `data-hmx` (home.js:193, home.js:194)

### Numbers and facts shown (sample, 390 with a team)

- [ ] /100
- [ ] Top 28% of tournament teams
- [ ] a turn 1 plan.
- [ ] Every tool uses the same 345 rated Pokémon: speed, types, damage, top teams and more.
- [ ] All 345, out of 100.
- [ ] Scout their six, get a turn 1 plan.
- [ ] Pick 4
- [ ] 7 updates: A new look, Strength Score…
- [ ] All 10 Gifts ›
- [ ] 2 Training Tickets
- [ ] Nov 22
- [ ] LA1CTRA1N1NG27
- [ ] L, A, 1, C, T, R, A, 1, N, 1, N, G, 2, 7
- [ ] , 1 day left
- [ ] All 69 Stories ›
- [ ] NO. 69 · LATE EDITION
- [ ] SATURDAY, NOVEMBER 21, 2026
- [ ] CAMPAIGN · NOV 25
- [ ] LAIC, São Paulo · Nov 20–22 · Live now
- [ ] 18 bare numbers on their own lines (stats, scores, counts), e.g. 97, 96, 95, 94, 93, 92, 91, 89

### States

- [ ] Empty team (six empty slots): 6026 px at 390. Shows: H3: What's your Strength Score?. Drops: H3: Your Strength Score.
- [ ] State words in the code (each needs its look in the kit): partial, so far, loading, failed, empty, error, loadingdone
- [ ] Remembered settings (localStorage): `cc2.welcomed`, `cc2.seenNew`
- [ ] Sliders (V2.slide keys, `v2slide` event): `homegems`
- [ ] ARIA roles drawn: group, img

### Drawing functions (where in today's code)

<details><summary>home.js: 18 functions</summary>

- `V2.homeFight` (home.js:8): Load / Copy / All events). Behaviour and words are today's Home (HOME-06/07/09/10/11/16): same data hooks, same rules.
- `V2.homeNext` (home.js:45): ". November's numbers arrive Dec 1." Shown only until that date; '' when the month is unknown.
- `V2.homeHead` (home.js:51): ("October, Showdown ladder 1630+"). Player review 3a, Nov 17.
- `V2.homeRing` (home.js:56): Ringside: the three most used right now (today's hero "Most used right now", HOME-02/03/04): the same buttons, sizes fitted by V2.fitUsed
- `V2.hmUi` (home.js:62): rows (head, six, plan, actions: one grid, subgrid rows), so the two sixes always start on the same line (Sim, Nov 12).
- `V2.evTitle` (home.js:66): Gift Cards") goes too (the mock-up showed a short name)
- `V2.hmUi` (home.js:70): A move is shown on the same scale as the ratings people see (RS), so "up 5 points" matches the numbers on the Ratings page.
- `V2.homeWeek` (home.js:71)
- `V2.rowName` (home.js:74): a name in a list row: "Mega" inline in blue (Sim, Nov 12: the same as My Team), no reserved space before other names
- `V2.homeMeta` (home.js:78): wide screen "This week" falls back to Top rated because its own column is beside it.
- `V2.HOME_TOOLS` (home.js:106): stress test (Nov 16): each link opens the page it names (they opened the hub: 'Damage Calc ›' landed on Battle)
- `V2.homeTools` (home.js:119): stays as its hover title and spoken label), so Home is shorter and nothing is lost
- `V2.pairsHtml` (home.js:128): player review 3g (Nov 17): the % said alone read like a win rate; it says "brought together" beside the number (here and in homeMore)
- `V2.homeMore` (home.js:134)
- `V2.homeWelcome` (home.js:156): an update (cc2.seenNew + this visit's np.wnew), never for a first-time visitor. Words: the Nov 9 word list (proposal, Sim to OK).
- `V2.homeNew` (home.js:163)
- `V2.fitUsed` (home.js:178): Measured before: the 12 longest names in our data stuck out by up to 48 px at 320-360 (scratchpad look/ovB.cjs).
- `V2.hmSure` (home.js:193): Sim Q10c (Nov 15): one replace-team confirmation everywhere, the same question and buttons as Winning Teams' cards and Events

</details>

<details><summary>stampede.js: 9 functions</summary>

- `V2.STAMPEDE` (stampede.js:6): holds the shared data (live: every number and name comes from the site's own data) and puts the page together.
- `V2._sd` (stampede.js:7)
- `V2.sdData` (stampede.js:8)
- `V2.sdHero` (stampede.js:19): a band that isn't built yet says so (Preview only); each band file replaces its own function
- `V2.sdSix` (stampede.js:20)
- `V2.sdTools` (stampede.js:21)
- `V2.sdPost` (stampede.js:22)
- `V2.sdPage` (stampede.js:23)
- `V2.sdAfter` (stampede.js:24)

</details>

<details><summary>stampede-hero.js: 22 functions</summary>

- `V2.sdhUi` (stampede-hero.js:15): Pokémon (plate, ticker) is a button that opens its page (data-v2mon).
- `V2.SDH_SLOPE` (stampede-hero.js:16)
- `V2.sdhRow` (stampede-hero.js:17)
- `V2.sdhTier` (stampede-hero.js:18)
- `V2.sdhSay` (stampede-hero.js:19)
- `V2.sdhRows` (stampede-hero.js:21): the herd: every rated Pokémon the Ratings page lists (sdData().herd: with tournament results first, the rest at the back)
- `V2.sdhSrc` (stampede-hero.js:22)
- `V2.sdHero` (stampede-hero.js:23)
- `V2.sdhRnd` (stampede-hero.js:58): a small fixed pseudo-random number per index (the crowd's jitter stays the same on every draw)
- `V2.sdhLay` (stampede-hero.js:61): index (2..n-1). z: 'm' = in front of the tagline (the mid-sized), 'c' = the crowd behind it, '' = not shown (stands in the front row).
- `V2.sdhPut` (stampede-hero.js:88): put one herd picture in place (px; sizes are the square box the picture stands in, feet at its bottom centre)
- `V2.SDH_NEAR` (stampede-hero.js:95): 4 sheets at 128px (art/crowd-<n>.webp, ART_CROWD from experiments/v2-crowd-sheets.py): about 300 requests become 4
- `V2.sdhSheet` (stampede-hero.js:96)
- `V2.sdhLines` (stampede-hero.js:99): the speed lines: dashed streaks converging on the horizon
- `V2.sdhChv` (stampede-hero.js:108): logo guide: never recolour, stretch, rotate or add effects)
- `V2.sdhChvPlace` (stampede-hero.js:112): 'Sharply' (phones); sized from the headline's font size; a zero-size marker read once gives the word's baseline, then is removed
- `V2.sdhLayout` (stampede-hero.js:119)
- `V2.sdhCrowd` (stampede-hero.js:145): the crowd: built once per set of data, added after the page has loaded; nearest (highest rated) pictures are asked for first
- `V2.sdHeroAfter` (stampede-hero.js:154)
- `V2.SDH_PXS` (stampede-hero.js:169): (so the focused name is on screen), and rests while off screen. With prefers-reduced-motion: reduce none of this is built.
- `V2.sdMotion` (stampede-hero.js:174): rules sit inside no-preference; V2.sdhTick builds nothing). window.NP_SD_MOTION = 0 turns it off, for a check that needs the still page.
- `V2.sdhTick` (stampede-hero.js:175)

</details>

<details><summary>stampede-post.js: 5 functions</summary>

- `V2.sdpData` (stampede-post.js:13): Every word on the band's red is white (--sd-on-band, 4.88:1 by token); the paper objects keep their own Dim Paper / Lamplight tokens.
- `V2.sdpSlip` (stampede-post.js:16)
- `V2.SD_NEW` (stampede-post.js:23): What's New for the new site (Sim approved the words, Nov 18): its own id, so every returning player sees it once after the switch
- `V2.sdpNew` (stampede-post.js:31)
- `V2.sdPost` (stampede-post.js:39)

</details>

<details><summary>stampede-six.js: 8 functions</summary>

- `V2.sdsCache` (stampede-six.js:13): wxKeyOf, teamTitleFor. Every number and name comes from live data. Classes sds-*; colours from --sd-* tokens (tokens.css).
- `V2.sdsPlan` (stampede-six.js:15): the plan, worked out once per team + winner: your lead / back / bench, their likely two leads, and your leads' turn 1 targets
- `V2.sdsTop3` (stampede-six.js:36): the three most-used Pokémon by tournament share (V2.raNums, the Ratings and Usage pages' numbers), highest first, written as Ratings writes it
- `V2.sdsSample` (stampede-six.js:39): the site's sample team (DEFAULT_TEAM), as members: the plan board's lower half for a player with no team (labelled as a sample)
- `V2.sdSix` (stampede-six.js:40)
- `V2.sdsArrows` (stampede-six.js:108): names that don't fit their spot step down the type scale (as Home's fitUsed did)
- `V2.sdsFit` (stampede-six.js:114): never under 13px (the type scale); narrower letters, then a hyphen 
- `V2.sdSixAfter` (stampede-six.js:125)

</details>

<details><summary>stampede-tools.js: 12 functions</summary>

- `V2.SDT_TYPES` (stampede-tools.js:19): shows the latest winner's six as a team preview (live), with "Pick 4". Words new to the site wait on Sim (brief: "Wording that is new").
- `V2.SDT_WXTY` (stampede-tools.js:20)
- `V2.SDT_GO` (stampede-tools.js:22): the twelve tools: name, page (the same hashes as today's Home list V2.HOME_TOOLS and the menu)
- `V2._sdt` (stampede-tools.js:28): next event) give the same plates, so a redraw doesn't run coreRows, bestHitOn, setFor and arData again
- `V2.sdtData` (stampede-tools.js:32)
- `V2.sdtRank` (stampede-tools.js:48): a shared rank, as the Ratings page counts it (ties on the shown rating share a rank: 1, 1, 3, 3)
- `V2.sdtMon` (stampede-tools.js:49)
- `V2.sdtArt` (stampede-tools.js:52): a picture only (Archetypes, Test Run): no name, no figure, hidden from screen readers
- `V2.sdtPlate` (stampede-tools.js:54): one plate: the title is the link that covers the plate; long words on wider screens, short ones on phones (brief)
- `V2.sdTools` (stampede-tools.js:57)
- `V2.sdtFit` (stampede-tools.js:115): mid-word; it steps to the approved narrower letters (88%, then 75%, as Home's most-used names do), then breaks with a hyphen
- `V2.sdToolsAfter` (stampede-tools.js:118)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/C-battle.mjs: `.l1` `.l2`
- [ ] app/test/behaviour/adapters/v2.A-team.mjs (opens `#home`): `.hm-you` `.hm-plan` `.fn-hero` `.hm-hero` `.hm-go` `.hm-rk` `.hm-top` `.hm-tlinks` `.hm-welcome` `data-hmnewx` `data-sdgo` `.sds-wl` `.sds-plan` `.sds-rings` `data-sdtool`
- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `.hm-all` `data-hmcopy` `data-hmcores`
- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `data-hmmore`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.hm-welcome` `.hm-newsec` `data-hmload` `data-hmnewx` `.sds-wl`
- [ ] app/test/v2-arena.mjs: `.l2`
- [ ] app/test/v2-back.mjs (opens `#home`)
- [ ] app/test/v2-folds.mjs (opens `#home`)
- [ ] app/test/v2-minors.mjs (opens `#home`): `.hm-used` `.fn-ringside` `.hm-rk` `.hm-pair` `.hm-pp` `.sg2-fold` `data-hmwelcome` `data-hmprep` `data-hmnewx` `.sd-band` `.sd-tools` `.sd-post` `.sdh-f` `.sdh-plate` `.sdh-m` `.sdh-b1` `.sdh-b2` `.sdh-lines` `.sdh-crowd` `.sdh-h` `.sdh-herd` `.sdh-front` `.sdh-say` `.sdh-go` `.sdh-tick` +71 more
- [ ] app/test/v2-partial.mjs (opens `#home`): `.sds-n` `.sds-w` `.sds-rk` `.sds-rc`
- [ ] app/test/v2-public.mjs (opens `#home`)
- [ ] app/test/v2-q19.mjs (opens `#home`): `.sdh-h` `.l1` `.l2` `.sdh-front`
- [ ] app/test/v2-q23.mjs (opens `#home`): `.sd-six` `.sdp-cols` `.sds-line` `.sdt-grid`
- [ ] app/test/v2-q24.mjs (opens `#home`)
- [ ] app/test/v2-q72.mjs: `.sdt-t` `.sdt-end` `.sdt-ends` `.sdt-more` `.sdt-h`
- [ ] app/test/v2-q78.mjs: `.sg2-fold`
- [ ] app/test/v2-q83.mjs: `data-hmload` `data-hmcopy` `data-hmprep`
- [ ] app/test/v2-q84.mjs: `.sds-k` `.sds-rt`
- [ ] app/test/v2-redraws.mjs (opens `#home`)
- [ ] app/test/v2-s17.mjs (opens `#home`)
- [ ] app/test/v2-s26.mjs (opens `#home`)
- [ ] app/test/v2-s33.mjs (opens `#home`)
- [ ] app/test/v2-split.mjs (opens `#home`)
- [ ] app/test/v2-sync.mjs (opens `#home`)
- [ ] app/test/v2-today.mjs (opens `#home`)
- [ ] app/test/v2-unbounded.mjs: `.fn-unm` `.sdh-b1` `.sdh-b2` `.sdh-go` `.sds-tk` `.sds-tg` `.sdt-blk` `.sdt-pp` `.sdt-pick` `.sdt-cpic`
- [ ] app/test/v2-wnew.mjs (opens `#home`): `.sdp-nw`

## 2. Build (`#build`)

- Files: app/src/v2/pages/build.js (206 lines), app/src/v2/pages/build-sheet.js (106 lines), app/src/v2/pages/build-plot.js (192 lines). Registered at build.js:30.
- Browser title: "Build · NastyPlot". Phone height at 390: **3133 px** with a team, **3133 px** with an empty team; desktop 1440: 2266 px. No page errors.
- What build.js says it is: re-audit Nov 15: an opened winner's Load Team is outlined, so the Blueprint's Load Team stays the one main button (rule C4) Sim, Nov 14 (Q1 A): the score line under the Blueprint drops its games number (one games number per screen; the count stays in Why This Score). Build (R4, Nov 12): piece 1, the head and the options strip, f…
- What build-sheet.js says it is: Build: The Blueprint (Sim's pick, Nov 14; brief docs/rebuild/mocks/build-blueprint/BRIEF.md) A built team is drawn as one drafting sheet: the header line (Sheet k of n, its kind), the team and its Strength Score, a dimension line, six numbered figures, then the title block: Spec (today's three options), Revisions (every option; …
- What build-plot.js says it is: Build: The Plot (Sim locked the direction Nov 20, 7:51 PM; build before the switch, 7:52 PM) Mock-ups and pictures: docs/rebuild/pics/nov20/Q93-Q98; spec: docs/rebuild/plot-spec.md; plan: docs/rebuild/plot-build-plan.md. Piece a (this file, first): the page before a build. The spec is one sentence you edit: "My plot: build from …

### Sections, in order (built page, 390)

- [ ] H1: Build
- [ ] H2: The accomplices
- [ ] H2: Why it works
- [ ] H2: Got a Plan B?
- [ ] H2: Plots that worked
- [ ] H3: Torre Lotta Cup #3
- [ ] H3: Friday Fight Night 80!
- [ ] H3: Sitrus-Series · Champions-MC · #81
- [ ] H2: Partners in crime

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.pl : Build · real winning teams · Reg M-C doubles
- [ ] div.pl-sent [Your plot] : 
- [ ] span.pl-grp [Build from] : 
- [ ] span.pl-grp [Megas on team] : 
- [ ] aside.pl-dog [Today's underdog] : 
- [ ] section.pl [More ways to start] : Plots that worked
- [ ] details.pl-wsets : Full sets ›
- [ ] div.pl-wsix [Basculegion, Kingambit, Mega Salamence, Mega Charizard Y, Wh] : 
- [ ] div.pl-wsix [Mega Staraptor, Mega Raichu Y, Rillaboom, Hisuian Arcanine, ] : 
- [ ] div.pl-wsix [Torkoal, Venusaur, Mega Raichu Y, Mega Gardevoir, Incineroar] : 
- [ ] div.np-slide [Kind of core] : 
- [ ] div.np-slide [Sort cores] : 

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "MY BOX", "WHOLE ROSTER", "0" ×5 — button:button.pl-pl — hooks: `data-v` (build-plot.js:12)
- [ ] "Build around a Pokémon (optional): type its name" — input:search — hooks: `data-bdfind` (build-plot.js:7, build-plot.js:17)
- [ ] "Clear" ×2 — button:button.np-clr (2 hidden until opened) — hooks: `data-v2clr` (build-plot.js:56)
- [ ] "HATCH IT. BUILD ME A TEAM" — button:button.pl-go — hooks: `data-bdgo` (build-plot.js:7, build-plot.js:18)
- [ ] "Sneasler", "Rillaboom", "Incineroar" ×4 — button:button.pl-chip — hooks: `data-bdpick` (build-plot.js:7, build-plot.js:21)
- [ ] "How It Works ›" — button:button.np-link — hooks: `data-bdhow` (build-plot.js:25, build.js:16)
- [ ] "Corviknight: open its info" — button:button.pl-dogst — hooks: `data-v2mon` (build-plot.js:29, build-plot.js:63)
- [ ] "LOAD TEAM" ×3 — button:button.pl-out2.u — hooks: `data-hmload` (build-plot.js:146, build-plot.js:162)
- [ ] "Full sets ›" ×3 — summary — hooks: none
- [ ] "Copy for Showdown" ×3 — button:button.np-link — hooks: `data-hmcopy` (build-plot.js:147, build-plot.js:165)
- [ ] "Set as Opponent ›" ×3 — button:button.np-link — hooks: `data-hmprep` (build-plot.js:147, build-plot.js:165)
- [ ] "Compare ›" ×3 — button:button.np-link — hooks: `data-bdcx` (build-plot.js:147, build-plot.js:165)
- [ ] "Pairs", "Trios", "Full Teams" ×5 — button:button — hooks: `data-v` (build-plot.js:12)
- [ ] "Only cores with this Pokémon: type its name" — input:search — hooks: `data-bdcfind` (build-plot.js:148, build.js:178)
- [ ] "How Cores Are Ranked ›" — button:button.np-link — hooks: `data-bdcwhy` (build-plot.js:147, build-plot.js:183)
- [ ] "Teams with It ›" ×4 — button:button.np-link — hooks: `data-bdcteams` (build-plot.js:147, build-plot.js:178)
- [ ] "ADD" ×4 — button:button.pl-out2.pl-cadd — hooks: `data-bdcore` (build-plot.js:147, build-plot.js:180)
- [ ] "Show 15 More Pairs ›" — button:button.np-link.pl-cmore — hooks: `data-bdcmore` (build-plot.js:147, build-plot.js:184)
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-bduse` (build-sheet.js:5, build-sheet.js:58), `data-bdshow` (build-plot.js:118, build-plot.js:137), `data-bdwhy` (build-sheet.js:5, build.js:157), `data-bdjump` (build.js:162, build.js:166), `data-bdcpick` (build-plot.js:148, build.js:179), `data-bdcprep` (build-plot.js:147, build-plot.js:177), `data-hmcores` (build.js:194), `data-plgo` (build-plot.js:150, build-plot.js:187)

### Numbers and facts shown (sample, 390 with a team)

- [ ] 79% of event winners carry 2 Mega options. Only one can Mega Evolve per battle.
- [ ] 68 players · Nov 7
- [ ] Torre Lotta Cup #3
- [ ] 139 players · Nov 6
- [ ] Friday Fight Night 80!
- [ ] 170 players · Nov 4
- [ ] Sitrus-Series · Champions-MC · #81
- [ ] 837 teams (6.1%) · +2.3 points together
- [ ] +3.9 vs avg
- [ ] 650 teams (4.8%) · +1.2 points together
- [ ] Fake Out, Intimidate · 475 teams (3.5%) · +2.4 points together
- [ ] +3.7 vs avg
- [ ] Sun · 701 teams (5.1%) · +1 point together
- [ ] +3.4 vs avg
- [ ] Show 15 More Pairs ›
- [ ] 13 bare numbers on their own lines (stats, scores, counts), e.g. 1, 0, 2, 3, 4, 5, 9-1, 11-1

### States

- [ ] Empty team (six empty slots): 3133 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): busy, loading, busyw, partial, failed, empty, loadingdone
- [ ] Remembered settings (localStorage): `cc2.absrc`
- [ ] Sliders (V2.slide keys, `v2slide` event): `bdsrc`, `sgmega`, `bdckind`, `bdcsort`
- [ ] ARIA roles drawn: status, list, listitem, img, group

### Drawing functions (where in today's code)

<details><summary>build.js: 23 functions</summary>

- `V2.dotWrap` (build.js:1)
- `V2.bdUi` (build.js:8): 22-auto-build.js) is shared; the answer card and the lower sections are pieces 2 and 3.
- `V2.bdBoxUntouched` (build.js:11): until the player edits their box or picks a pool themselves (cc2.absrc saved); then their choice and box are used, as before
- `V2.bdSrcDefault` (build.js:13)
- `V2.buildHead` (build.js:14)
- `V2.buildHits` (build.js:26)
- `V2.BUILD_HOW` (build.js:42): How it works (today's three points, 22-auto-build.js abStart; "Ready for the top threats" is "Matchups" in the word list)
- `V2.BAND_K` (build.js:48): My Team makes, so both pages agree. Use / Save follow today's 34-events.js rules (Undo; 10 saved max; "Already saved as").
- `V2.buildAnswer` (build.js:51): under "Building…"; the new one replaces it in the same spot. The first build keeps a reserved height.
- `V2.buildAnswer0` (build.js:54)
- `V2.buildLight` (build.js:89): the team's own light behind the six (mock-up: one low wash per Pokémon in its own colour, as My Team); stronger at night
- `V2.buildOthers` (build.js:94): Cores = today's Winning Cores data (47-core-data.js: coreUi, coreRows, coreTags, corePlan); Add follows today's useCore rules and words.
- `V2.CORES_WIDE` (build.js:105): (one column; 8 would push the 320 phone Cores tab past its limit). Crossing 1180 while resizing redraws, so the count always fits.
- `V2.buildCores` (build.js:107)
- `V2.bdUi` (build.js:136): Copy for Showdown.
- `V2.buildWinners` (build.js:137)
- `V2.bdTab` (build.js:150): Sim, Nov 13 (Look Q4 B): on phones the jump bar is tabs, one section at a time (Other Options / Recent Winners / Cores); desktop shows all
- `V2.buildBrk` (build.js:156): ---------- Build: the score's breakdown line under the rank (mock R2 line 194; the same numbers as My Team's "Why this score?") ----------
- `V2.buildJump` (build.js:162): Buttons that scroll, not links: the site's addresses name pages, so a #section link would change the page (and add a Back step).
- `V2.bdJumpSpy` (build.js:164)
- `V2.buildCoreFind` (build.js:176)
- `V2.bdCoreHits` (build.js:179)
- `V2.bdCoreWhat` (build.js:199): today's "?" on cores: the same explanation (coreWhyText, shared) in a small sheet

</details>

<details><summary>build-sheet.js: 15 functions</summary>

- `V2.bpModel` (build-sheet.js:7): The page before a first build is Sheet 0 of the same sheet (Q83 item 1, Sim Nov 20; V2.bpSheet0 below).
- `V2.bpFig` (build-sheet.js:15)
- `V2.bpOrder` (build-sheet.js:25): Display only: the team, its order on Load Team / Save / Copy and every number stay the engine's.
- `V2.bpSpec` (build-sheet.js:26)
- `V2.bpMegaShare` (build-sheet.js:37): here directly so Build doesn't start that ~120-team pass
- `V2.bpMegaTip` (build-sheet.js:41)
- `V2.bpRevs` (build-sheet.js:44)
- `V2.bpNotes` (build-sheet.js:49): <span class="bp-rl u" aria-hidden="true">${L[i] // i + 1}</span><span class="bp-rn"><b>${V2.dotWrap(E(t.label))}</b><span class="bp-rsix" aria-hidden=
- `V2.buildSheet` (build-sheet.js:54)
- `V2.bpCorners` (build-sheet.js:73): Same sections, hooks and actions as today (build.js buildWinners / buildCores); only the frame, the header and the winner's six change.
- `V2.bpHead` (build-sheet.js:74)
- `V2.bpWinSix` (build-sheet.js:75)
- `V2.bpPage` (build-sheet.js:79)
- `V2.bpSheet0` (build-sheet.js:88): stands in ring 01. No .bd-ans / .bd-six / data-v2mon here: there is no team yet (the behaviour kit reads those as a built team).
- `V2.bpPage0` (build-sheet.js:96)

</details>

<details><summary>build-plot.js: 22 functions</summary>

- `V2.plotPicks` (build-plot.js:10): company (V2.underdog, the empty-screen rule: never beside a team's data). After a build the Blueprint sheet still draws (pieces b-f next).
- `V2.plotGrp` (build-plot.js:11)
- `V2.plotSent` (build-plot.js:13)
- `V2.plotHelp` (build-plot.js:19)
- `V2.plotWait` (build-plot.js:26)
- `V2.plotPage0` (build-plot.js:31): Nov 20, piece 5: the lower half is V2.plotLower (Plots that worked + Partners in crime, no V2.buildJump tabs); before a build its line is dashed and t
- `V2.plotInput` (build-plot.js:39): resize and once the logo font has loaded (the width depends on it).
- `V2.plotFit` (build-plot.js:42)
- `V2.plotRowFit` (build-plot.js:49)
- `V2.plotTitleK` (build-plot.js:64): hidden "Option k of n · kind" eyebrow, .bd-score (b = number, .w span = band word, small = "Strength Score · rank"), data-v2mon.
- `V2.plotAnswer` (build-plot.js:65)
- `V2.bpPage` (build-plot.js:80)
- `V2.plotSets` (build-plot.js:86): battle). Tier as "S tier 92", "Not in your box yet · to catch" for a Pokémon to catch, "Built around" for the pick; data-v2mon opens info.
- `V2.plotPlate` (build-plot.js:92)
- `V2.plotChipFit` (build-plot.js:107): both: at 1200 "Adaptability" was cut 8 px short)
- `V2.plotWhy` (build-plot.js:119): Notes (V2.bpNotes) and the same options and hook as the Revisions (data-bdshow, .bd-others for the kit), in sentences with white plates.
- `V2.plotPlans` (build-plot.js:130)
- `V2.plotWinPicks` (build-plot.js:151): data-plgo (tests count the visible [data-bdgo]: there is one, in the control row); it presses that one.
- `V2.plotWin` (build-plot.js:153)
- `V2.CORES_PHONE` (build-plot.js:169): "8 rows desktop, 4 phone"); crossing 700 while resizing redraws, as V2.CORES_WIDE does at 1180
- `V2.plotCores` (build-plot.js:171)
- `V2.plotLower` (build-plot.js:185)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/A-team.mjs (opens `#build`)
- [ ] app/test/behaviour/adapters/v2.A-team.mjs: `.np-hit` `data-v2slide`
- [ ] app/test/behaviour/adapters/v2.B-build.mjs (opens `#build`): `.bd-pick` `.bd-how` `.bd-busy` `.bd-none` `.bd-acts` `.bd-ans` `.bd-lock` `.bd-score` `.bd-six` `.bd-others` `.bd-cores` `.bd-wins` `.bd2` `.bd-result` `.bd-jump` `.bd-cpick` `.bd-cwhy` `data-bdhow` `data-bdx` `data-bdfind` `data-bdhits` `data-bdgo` `data-bduse` `data-bdsave` `data-bdcopy` +17 more
- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `data-v2slide`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.np-hit` `data-hmload`
- [ ] app/test/qcheck.cjs: `.pl-sent`
- [ ] app/test/v2-back.mjs (opens `#build`)
- [ ] app/test/v2-minors.mjs (opens `#build`): `.bd-side` `.bd-hits` `.np-hit` `.bd-ans` `.bd-alt-sc` `.bd-cores` `.sg2-fold` `data-bdfind` `data-bdhits` `data-bdsave` `data-bdcopy` `data-hmprep` `data-bdjump` `data-bdcfind` `data-bdchits` `.bd-prov` `.pl-find` `.pl-hc` `.pl-tag` `.pl-gp` `.pl-tags` `data-v2slide` `data-v`
- [ ] app/test/v2-q46.mjs: `.np-hit`
- [ ] app/test/v2-q78.mjs: `.sg2-fold`
- [ ] app/test/v2-q83.mjs (opens `#build`): `.bd-opts` `.bd-ans` `.bd-cores` `.bd-wins` `data-bdx` `data-bdfind` `data-bdgo` `data-bduse` `data-bdshow` `data-bdcore` `data-bdwin` `data-hmload` `data-hmcopy` `data-hmprep` `data-bdcx` `.bp-fig` `.bp-no` `.bp-meas` `.bp-score` `.bp-stk` `.bp-stamp` `.bp-six` `.bp-near` `.bp-right` `.pl-pl` +24 more
- [ ] app/test/v2-q84.mjs: `.np-hit`
- [ ] app/test/v2-s16.mjs (opens `#build`): `.bd-result` `data-bdgo` `data-bduse` `.bp-six` `.bp-right` `.pl-plates`
- [ ] app/test/v2-s17.mjs (opens `#build`): `data-bdgo` `data-v2slide`
- [ ] app/test/v2-unbounded.mjs: `.bp-fig` `.bp-mg` `.pl-ln` `.pl-w` `.pl-opt`

## 3. My Team (`#team`)

- Files: app/src/v2/pages/team.js (584 lines), app/src/v2/pages/team-frame.js (62 lines), app/src/v2/pages/six.js (178 lines), app/src/v2/pages/sugs.js (353 lines), app/src/v2/pages/matchups.js (132 lines), app/src/v2/pages/record.js (53 lines), app/src/v2/pages/share-slab.js (84 lines), app/src/v2/pages/share-tape.js (71 lines). Registered at team.js:430.
- Browser title: "My Team · NastyPlot". Phone height at 390: **3802 px** with a team, **2576 px** with an empty team; desktop 1440: 2753 px. No page errors.
- What team.js says it is: pre-launch check 6d (Nov 17): team names stop at 40 characters (a long paste was cut mid-word without a word). From 30 characters the field shows how many are used ("34/40"); the spoken label says the limit
- What team-frame.js says it is: My Team: the frame (Sim, Nov 21; ported from the designer's party4 mock-up, not redrawn) Three parts in one black frame: Your six (a numbered list), the one you tapped (big, with its whole set and its buttons) and Suggestions. The six are equal spots: no Lead / Back / Bench (Sim, Nov 20), no Box, no drag-and-drop. Every feature …
- What six.js says it is: Nov 15 (audit #26): the shared note says 'most run'; the new site says 'most used' everywhere (Edit Set's tags, Home, Usage) My Team's six tiles and the set card (R4 group "six", Nov 11) The working-out is today's shared logic (src/app/05-six-data.js: teamLineup, PLAN_VS); this file only draws it.
- What sugs.js says it is: My Team › Suggestions (R4, Nov 11): the controls, the cards and what sits around them Every setting, list, number and word comes from today's shared logic (36-sug-data.js, 29-fix-planner.js, 36-lanes.js); this file only draws them in the new design and passes taps back. The planner run itself is in team.js (V2.plan).
- What matchups.js says it is: My Team · Matchups (R4, Nov 11): Top 10 / Top 12 grid / All 30, and the threat sheet Every number comes from today's shared working-out (59-matchup-data.js, 58-strength.js, 55-threats.js); this file only draws it. The view is remembered under today's key (cc2.seg.thr), so both sites open on the same one. Word list: Matchups; Bea…
- What record.js says it is: Your Games (R4, Nov 11; one line on the page since Sim's review: the record or "None logged yet", and Log a Game): the games you log with this six, kept apart from the tournament record Today's shared steps (26-log-data.js): myGames, myInsights, logGame, unlogGame. Shown once the team has all six (as today). The Showdown replay …
- What share-slab.js says it is: Share card "The Slab" (Nov 15; Sim's pick Q4 A: The Slab first, Print and Aurora later as styles; docs/rebuild/mocks/share-cards) Drawn on a canvas with today's share helpers (ARB.facts, ARB.score, CH.hand, CH.pctTxt, ARB.logo, ARB.tagline, ARB.imgs, AR.TC), so every fact is today's card's: the team name (with "(sample)" when it…
- What share-tape.js says it is: Share image "Team Sheet" in the Tale of the Tape look (Sim, Nov 15: "this team sheet also in Share Your Team ... designed in the best way for share your team") The same facts as the Team Sheet page (sheetData, the same function the page and today's sheet image read): the six across the top on their type-coloured cards, Item / Ab…

### Sections, in order (built page, 390)

- [ ] H1: Sun · Grassy Terrain · Tailwind
- [ ] H2: Mega Charizard Y
- [ ] H2: Suggestions
- [ ] H2: Matchups
- [ ] H2: Team Checks
- [ ] H3: 
- [ ] H3: 
- [ ] H2: Your Games

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.tm-hero : Sun · Grassy Terrain · Tailwind
- [ ] div.mtf-party [Your six] : 
- [ ] section.mtf-sum [Mega Charizard Y, 1 of 6] : Mega Charizard Y
- [ ] p.rate [Rated 94, S tier] : 
- [ ] ul.mtf-mv [Moves] : 
- [ ] section.tm-sec : Suggestions
- [ ] div.tm-chg [Rillaboom out, Mega Floette in, to catch] : 
- [ ] div.tm-chg [Incineroar out, Basculegion in, in your box] : 
- [ ] details.sg2-why : Why? 14 reasons
- [ ] details.sg2-fold : Adjust Suggestions Box + Catch · 2 Megas · Swap Mega: No · A
- [ ] div.sg2-ctl [Suggestion settings] : 
- [ ] div.np-slide [Suggest from] : 
- [ ] div.np-slide [Megas on the team] : 
- [ ] div.np-slide [Suggestions can swap out my Mega] : 
- [ ] div.np-slide [Count Abilities like Levitate in matchups and suggestions] : 
- [ ] nav.np-tabs [On this page] : 
- [ ] section.tm-sec : Matchups
- [ ] div.np-slide [Matchups view] : 
- [ ] section.tm-sec : Team Checks
- [ ] details.tm-ckok : ✓ 6 more pass
- [ ] details.sg2-fold : Things to Know 7 weak spots, type chart, legal
- [ ] div.np-slide [Types: offense or defense] : 
- [ ] section.tm-sec : Your Games

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Why This Score? ›" — button:button.np-link — hooks: `data-v2why` (team.js:400, team.js:448)
- [ ] "Team Sheet ↗" — button:button.np-link — hooks: `data-v2sheetopen` (team.js:104, team.js:413)
- [ ] "Share as Image" — button:button.np-link — hooks: `data-v2share` (team.js:326, team.js:453)
- [ ] "Saved Teams 2" — button:button.np-link — hooks: `data-v2saved` (team.js:151, team.js:292)
- [ ] "More ⋯" — button:button.np-link — hooks: `data-v2more` (team.js:417, team.js:453)
- [ ] "Save Team" — button:button.mtf-btn.u — hooks: `data-v2save` (team.js:123, team.js:453)
- [ ] "Mega Charizard Y 94", "Garchomp 92", "Incineroar 95" ×6 — button:button.mtf-row.tm-pick — hooks: `data-tmsel` (six.js:10, six.js:15)
- [ ] "‹", "›" ×2 — button:button.mtf-step — hooks: `data-mtfstep` (team-frame.js:23, team-frame.js:23)
- [ ] "Edit Set" — button:button.mtf-btn.u — hooks: `data-v2edit` (six.js:37, six.js:42)
- [ ] "Replace" — button:button.mtf-btn.u — hooks: `data-v2rep` (six.js:42, six.js:80)
- [ ] "Remove" — button:button.mtf-btn.u — hooks: `data-v2rm` (six.js:37, six.js:43)
- [ ] "Lock" — button:button.np-link.sx-a — hooks: `data-v2lock` (six.js:37, six.js:43)
- [ ] "Pokémon Page ›" — button:button.np-link.sx-info — hooks: `data-v2mon` (six.js:37, six.js:42)
- [ ] "Apply" — button:button.np-btn — hooks: `data-v2plan` (sugs.js:92, sugs.js:129)
- [ ] "Why? 14 reasons", "Adjust Suggestions Box + Catch · 2 Megas · Swap Me", "✓ 6 more pass" ×5 — summary — hooks: none
- [ ] "See All Suggestions ›" — button:button.np-link.sg2-all — hooks: `data-v2sgall` (sugs.js:83, sugs.js:185)
- [ ] "Never Suggest ›" — button:button.np-link.sg2-all — hooks: `data-v2excl` (sugs.js:83, sugs.js:93)
- [ ] "Refresh Suggestions" — button:button.np-link.sg2-all — hooks: `data-v2replan` (sugs.js:30, sugs.js:83)
- [ ] "Stand-Outs", "Top 10", "Top 12 Grid" ×16 — button:button — hooks: `data-v` (sugs.js:178, sugs.js:332)
- [ ] "Game Plan › How to play this six against the meta'" — button:button.mtf-plan — hooks: `data-v2gplan` (six.js:56, six.js:174)
- [ ] "Plan it in Battle ›" — a.np-link → #battle — hooks: none
- [ ] "Matchups", "Suggestions", "Team Checks" ×3 — a → #team — hooks: `data-tmjump` (team.js:483, team.js:483)
- [ ] "Team Sheet ↗" — button:button.tm-tsbtn (1 hidden until opened) — hooks: `data-v2sheetopen` (team.js:104, team.js:413)
- [ ] "Archaludon Unfavoured", "Mega Floette Unfavoured Calc: beats it", "Mega Garchomp Z Unfavoured Calc: handles it" ×8 — button:button.mu-row.mu-nk — hooks: `data-muthr` (matchups.js:39, matchups.js:53)
- [ ] "All 30 ›" — button:button.np-link — hooks: `data-muall30` (matchups.js:46, matchups.js:48)
- [ ] "?", "What is Handles the top threats?" ×3 — button:button.sg2-tip — hooks: `data-v2tip` (sugs.js:277, sugs.js:278)
- [ ] (no text) — button:button.np-link.tm-ckmu — hooks: `data-tmgomu` (team.js:530, team.js:531)
- [ ] (no text) — button:button.np-btn2 — hooks: `data-v2qa` (sugs.js:233, sugs.js:273)
- [ ] (no text) — button:button.np-link.sg2-all — hooks: `data-v2needs` (sugs.js:242, sugs.js:242)
- [ ] (no text) — button:button.np-link.ty2-full — hooks: `data-v2tytables` (sugs.js:324, sugs.js:333)
- [ ] "Log a Game" — button:button.np-btn2 — hooks: `data-yglog` (record.js:12, record.js:33)
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-v2savename` (team.js:4, team.js:114), `data-v2export` (team.js:101, team.js:414), `data-expcopy` (team.js:100, team.js:100), `data-v2copy` (team.js:89, team.js:104), `data-ts2share` (team.js:89, team.js:105), `data-ts2edit` (team.js:73, team.js:82), `data-svact` (team.js:132, team.js:136), `data-svrenform` (team.js:132, team.js:166), `data-v2add` (team.js:264, team.js:269), `data-sh2save` (team.js:309, team.js:314), `data-v2import` (team.js:292, team.js:376), `data-v2clear` (team.js:376, team.js:416), `data-v2restore` (team.js:375, team.js:376), `data-hsmore` (team.js:579, team.js:583), `data-v2lead` (six.js:37, six.js:42), `data-v2addto` (six.js:20, six.js:26), `data-adpick` (six.js:150, six.js:158), `data-v2sgmore` (sugs.js:93, sugs.js:128), `data-v2sgamore` (sugs.js:169, sugs.js:178), `data-v2sgbmore` (sugs.js:170, sugs.js:178), `data-v2megapick` (sugs.js:321, sugs.js:334), `data-exq` (sugs.js:344, sugs.js:345), `data-mumore` (matchups.js:57, matchups.js:120), `data-muall` (matchups.js:81, matchups.js:121), `data-mufull` (matchups.js:109, matchups.js:122), `data-mufix` (matchups.js:104, matchups.js:114), `data-ygreplay` (record.js:21, record.js:52)

### Numbers and facts shown (sample, 390 with a team)

- [ ] 6 of 6 · Sun · Legal ✓
- [ ] Saved Teams 2
- [ ] 1 of 6
- [ ] 32 SpA, 32 Spe, 2 HP
- [ ] 85 → 93
- [ ] Small edge about 2 more wins in 100 games in real play
- [ ] 14 reasons
- [ ] Box + Catch · 2 Megas · Swap Mega: No · Abilities: Yes
- [ ] Damage calc: No answer 0, Shaky 5, Handles it 10, Beats it 15
- [ ] Top 10
- [ ] Top 12 Grid
- [ ] All 30
- [ ] 2 more Unfavoured in All 30 ›
- [ ] The 4 basics count toward the score; the notes are advice.?
- [ ] Fire and Ice each hit 3+ of yours.
- [ ] 6 more pass
- [ ] 7 weak spots, type chart, legal
- [ ] 11 bare numbers on their own lines (stats, scores, counts), e.g. 85, 94, 92, 95, 88, 97, 96, +8

### States

- [ ] Empty team (six empty slots): 2576 px at 390. Shows: H1: Six spots, all yours. / H2: Or Start from a Winner / H2: Corviknight. Somebody's favourite.. Drops: H1: Sun · Grassy Terrain · Tailwind / H2: Mega Charizard Y / H2: Suggestions / H2: Matchups / H2: Team Checks / H3:  / H3:  / H2: Your Games.
- [ ] State words in the code (each needs its look in the kit): empty, error, failed, emptyhtml, empty2, partial, so far, loading, fail, fails, failure, emptying, busy
- [ ] Remembered settings (localStorage): `cc2.chf.rhow`, `cc2.chf.rfix`
- [ ] Sliders (V2.slide keys, `v2slide` event): `svsort`, `shkind`, `shmode`, `sgpool`, `sgmega`, `sgswap`, `sgabil`, `types`, `thr`
- [ ] Sub-addresses / links with a part: `#team=sg`, `#team=mu`, `#team=ck`, `#team=`, `#team=set`
- [ ] ARIA roles drawn: group, status, tablist, tab, tabpanel, img, heading, combobox, listbox, option, cell, table, row, columnheader, rowheader

### Drawing functions (where in today's code)

<details><summary>team.js: 57 functions</summary>

- `V2.nameCnt` (team.js:3): field shows how many are used ("34/40"); the spoken label says the limit
- `V2.teamData` (team.js:12): the data, no HTML: one call per draw
- `V2.plan` (team.js:32): ---------- suggestions: today's planner (planFixesG), run in small slices between frames like today's page ----------
- `V2.planKey` (team.js:34): the same key today's page re-plans on (planKeyOf, 08-render-all.js): team, Suggest from, Megas on team, Swap my Mega, box, never-suggest... (R4 sugs h
- `V2.planStart` (team.js:35)
- `V2.sugData` (team.js:47): which suggestions show (shared with today's page: planListOf, CH.sideGrades) and what each does to the Strength Score
- `V2.openTeamSheet` (team.js:62): cards that open Edit Set, and the empty-team message (items 10-14).
- `V2.openExport` (team.js:96): read or selected by hand when copying is blocked
- `V2.copyTeam` (team.js:103)
- `V2.openSave` (team.js:111): Same choices as today's save panel: update the open saved team or save as new, up to 10 teams; Enter does the main action.
- `V2.svUi` (team.js:128): Still to come on the new build: Compare (with the Compare page) and "Your games" with this six (with My Record).
- `V2.savedHtml` (team.js:129)
- `V2.openSavedTeams` (team.js:148)
- `V2.svRefresh` (team.js:150): redraw the sheet in place (the page under it redraws through render()); focus goes to 'focus' or the sheet itself
- `V2.scoreNow` (team.js:174): After each change the message says how the Strength Score moved (today's site says "ready for X%" / "Offense N of 18" there).
- `V2.ed` (team.js:175)
- `V2.editHtml` (team.js:176): Replace (Sim, Nov 17, B) 
- `V2.openEdit` (team.js:216): reopened at once, so it keeps the sheet's history step and Back still closes it (Nov 15) 
- `V2.edKey` (team.js:218): redraw the sheet in place and put focus back on the same control (so a keyboard user keeps their place)
- `V2.edRefresh` (team.js:219)
- `V2.edDo` (team.js:221): one change: apply it, redraw the page and the sheet, and say what it did to the Strength Score
- `V2.edMark` (team.js:238): numbers as they're fixed, and go once pointsProblem is happy
- `V2.edFlush` (team.js:245): or says plainly why it couldn't (the same rule as Save Stat Points)
- `V2.addState` (team.js:262): ---------- adding a Pokémon (R4, Nov 11): today's addMon into the first empty spot, one of each species (Species Clause) ----------
- `V2.addBtn` (team.js:263)
- `V2.addToTeam` (team.js:266): code review C8: Undo, as the Box has 
- `V2.underdog` (team.js:275): the rating means something (the very bottom has almost none: Flapple has 43 tournament games, 0.1% of teams). Never shown beside grades or a team's da
- `V2.emptyHtml` (team.js:279)
- `V2.shUi` (team.js:300): Link (today's team link). The new build draws its sprites from its own art folder.
- `V2.shCtl` (team.js:303): Nov 15: The Slab (Sim, Nov 14, Q4 A) joins the kinds; it has one fixed look, so its second choice is the shape (Tall for feeds, Wide for link previews
- `V2.openShare` (team.js:304): V2.shCtl = SV => { const U = V2.shUi; return '${SV ? '' : V2.slide('shkind', [['card', 'Team Card', 'card'], ['poster', 'Team Poster', 'poster'], ['sh
- `V2.shDraw` (team.js:313): Nov 15 (audit): draws run one at a time and only the newest pick is shown and saved (quick taps could show the wrong image)
- `V2.shDraw0` (team.js:314)
- `V2.checkShared` (team.js:335): The link's team replaces yours only if you say so (as today); Undo brings yours back.
- `V2.openShared` (team.js:344): today's applyShared without its page switch: load (Undo kept), back to My Team, the same toast
- `V2.openImport` (team.js:347): ---------- Import and Clear Team (R4, Nov 11): today's importPaste and clearTeam, same messages ----------
- `V2.clearTeam` (team.js:366): after the 10 s Undo is gone, until a Pokémon is added (bridge.js render forgets it); test app/test/v2-q26.mjs
- `V2.restoreLast` (team.js:370): document.addEventListener('input', e => { if (e.target && e.target.matches && e.target.matches('[data-impin][aria-invalid]')) V2.fieldOk(e.target); })
- `V2.restoreHtml` (team.js:373)
- `V2.meter` (team.js:382): the five bands as one bar with a tick at the score (approved mock-up)
- `V2.whyHtml` (team.js:385): G given: another team's score (Compare's "Why These Scores", inline: no eyebrow, no key or link, those show once below)
- `V2.whyNone` (team.js:394): page shows the older check-based number, so say which case it is and what the number is, never an empty sheet.
- `V2.ckBody` (team.js:403): Team Checks (Sim, Nov 11): checks that pass fold into one line; only the ones that fail show in full (a note says it's a note)
- `V2.moreHtml` (team.js:410): the More menu (Sim, Nov 11): every other My Team action, one per row; Clear Team sits last, apart
- `V2.ui` (team.js:422): ---------- drawing ----------
- `V2.LV` (team.js:423)
- `V2.mtBeltFit` (team.js:426): letter-wide column); then the score belt takes its own full-width row under the name, at full size. Safe to repeat (after every draw).
- `V2.jumpSync` (team.js:522): earlier in the bar, unless you tapped the other one); at the very end of the page the last one is marked.
- `V2.ckCalc` (team.js:530): for (const a of as) { const on = a === cur; if ((a.getAttribute('aria-current') === 'location') !== on) { if (on) a.setAttribute('aria-current', 'loca
- `V2.tmUi` (team.js:533): ---------- My Team's tabs on phones (Sim's yes, Nov 20: option B) ----------
- `V2.tmAutoTab` (team.js:538): tab never jumps under the player when the score crosses 70; a new six (an import, a loaded or built team) or a new visit picks again.
- `V2.tmTabbed` (team.js:543): addEventListener('hashchange', () => { if (!/^#team(=/$)/.test(location.hash)) V2.tmUi.auto = null; }); /* leaving My Team: the next visit picks again
- `V2.tmHashTab` (team.js:545): '#team=mu' / '#team=sg' / '#team=ck' (for a link from elsewhere) opens My Team at that tab, once per arrival of that address
- `V2.tmShow` (team.js:548): (TEAM-07), the page brings the section's heading just under the bar, so the tapped section starts at the top of the screen
- `V2.tmGo` (team.js:552): a link elsewhere that leads to a section (Matchups' "All 30" and the threat sheet's button): on phones it opens that tab first
- `V2.HOW_SCORE` (team.js:569): text no longer matched the code (Team checks: 4 counted basics + 3 notes, proChecks; checked Nov 12).
- `V2.howHtml` (team.js:578)

</details>

<details><summary>team-frame.js: 9 functions</summary>

- `V2.MTF_W` (team-frame.js:7): Phone (under 1000): the six are one row of six taps and the tapped Pokémon opens right under it; desktop shows all six sets.
- `V2.mtfImg` (team-frame.js:8)
- `V2.mtfTy` (team-frame.js:9)
- `V2.mtfRow` (team-frame.js:11): one row of Your six: number, picture, name, item · Ability, rating and tier, the four moves 2×2; its left edge in its first type's colour
- `V2.mtfAdd` (team-frame.js:17): an empty spot (a team of one to five): a dashed row that opens today's Pokémon picker for that spot (design question for Sim, brief s1)
- `V2.mtfDetail` (team-frame.js:20): stat points (today's editing panel), the four moves as big bars, and Edit Set / Replace / Remove; Lock and Pokémon Page kept beside them
- `V2.mtfFrame` (team-frame.js:30)
- `V2.mtfFit` (team-frame.js:42): (scaleX, down to 0.7, as Build's chips) and only then cut with "…"; "Mega" sits on its own small line above the name
- `V2.mtfHashJump` (team-frame.js:55)

</details>

<details><summary>six.js: 18 functions</summary>

- `V2.noteWord` (six.js:2): Nov 15 (audit #26): the shared note says 'most run'; the new site says 'most used' everywhere (Edit Set's tags, Home, Usage)
- `V2.handHtml` (six.js:11): Tapping a Card picks it (data-tmsel, as today's tiles). Teams of one to five keep today's tiles until Sim has seen pictures (brief s7).
- `V2.editStripHtml` (six.js:38): drawn in the brief: picture for Sim), Lock, Remove. Same hooks as today (data-v2edit, data-v2mon, data-v2lead, data-v2lock, data-v2rm).
- `V2.sixHtml` (six.js:44)
- `V2.mtInline` (six.js:71): (team being built) instead of under all six; from 1100px the six sit in one row and the panel stays right under it
- `V2.mtHand3` (six.js:74): under 700 the panel stays shut until a Card is tapped (V2.ui.picked; a new team, Remove or Clear shut it again)
- `V2.mtShut` (six.js:76): Sim, Nov 18 (Q5 A): desktop (1100+) works like phones: the panel stays shut until a Card is tapped (tablets 700-1099 unchanged, not asked)
- `V2.openReplace` (six.js:79): Replace: the Add box on a filled spot; picking swaps it in one step (Undo brings the old one back)
- `V2.isHand` (six.js:81): any team of one to six (Sim, Nov 15 night); an empty team keeps its own empty screen 
- `V2.setSecHtml` (six.js:85): most players run), the four moves, then Edit Set, Set as Lead (not already a lead) and its Info Sheet. Today's words throughout.
- `V2.rmHold` (six.js:130): Review Nov 18 (C1): a scroll the hold didn't make itself (a screen reader, find-in-page, a script) lets go too (V2.holdGuard, shell.js)
- `V2.addHtml` (six.js:141): while typing (the day's data arriving) never touches the text.
- `V2.openAdd` (six.js:145)
- `V2.ad` (six.js:146)
- `V2.adDraw` (six.js:147)
- `V2.adMove` (six.js:153)
- `V2.adPick` (six.js:156): code review C8: Undo, as adding from the Box has 
- `V2.openGamePlan` (six.js:170)

</details>

<details><summary>sugs.js: 40 functions</summary>

- `V2.sgAdj` (sugs.js:8): Sim, Nov 18 (Q5 A): desktop (1100+) folds it as phones do; Sim Q71 (Nov 20, 8:17 AM): tablets 700-1099 fold it too (was open)
- `V2.sgCtl` (sugs.js:14): document.addEventListener('toggle', e => { const d = e.target; if (d && d.matches && d.matches('[data-v2adj]')) V2.adjOpen = d.open; }, true); /* open
- `V2.sgLater` (sugs.js:23): a new choice: the setting and its message at once; the page redraws once the plate has slid over (so the slide is seen)
- `V2.sgX` (sugs.js:34): (the plans, then up to 3 side options when nothing improves the team), so Why? lists today's reasons word for word
- `V2.sgReasons` (sugs.js:36)
- `V2.undot` (sugs.js:38): today's page says " · " lists in words (undotText, shared): the same rule on the shared texts drawn here, text only (never inside tags)
- `V2.undotHtml` (sugs.js:39)
- `V2.sgOwn` (sugs.js:42): known-bug COV-04/SUGG-04 (Nov 17): the Pokémon coming in says whether it's in your box or still to catch (today's page: Box / TO CATCH)
- `V2.sgSide` (sugs.js:43)
- `V2.sgSwap` (sugs.js:44)
- `V2.sgCard` (sugs.js:45)
- `V2.ckWinSoon` (sugs.js:58): they say "most recent event winners", as before. On wide screens the sections are in view, so it starts at once, as before
- `V2.sgWait` (sugs.js:70): two ghost rows that hold the space, so the section looks alive and jumps less; reduced motion: the bar stands still
- `V2.sgSec` (sugs.js:71)
- `V2.setTipsCard` (sugs.js:104): one tap to use theirs (today's [data-settip] handler: Undo in the message). Nov 15 parity: the file was not in the new build.
- `V2.itemFixCard` (sugs.js:106): with their items, as today's fix planner passes them 
- `V2.protCard` (sugs.js:110): return '<div class="sg2-fix sg2-items" role="group" aria-label="Fix your items first">${rows}${typeof regNote === 'function' ? regNote('fine') : ''}</
- `V2.noneCard` (sugs.js:114): play: Battle, and the sets (words from LANE.NONE)
- `V2.appliedSay` (sugs.js:122): "on screen" means clear of the sticky header and jump bar above and the phone bar below (Nov 12: under the header it counted as seen)
- `V2.undoBar` (sugs.js:125): if (r && r.height && r.top >= top && r.bottom <= bot) return true; toast(t, true); return false; }; /* true: the bar is the message (Apply's focus goe
- `V2.sgAll` (sugs.js:137): Every plan, number and word comes from today's shared logic (planner, rating, monRole, isGem, assignItems); this only draws them.
- `V2.SGA_POOL` (sugs.js:138)
- `V2.sgaFacts` (sugs.js:141): line: the Ability its set runs, the item after Item Clause is settled across the new six, assignItems)
- `V2.allSugsHtml` (sugs.js:149)
- `V2.openAllSugs` (sugs.js:175)
- `V2.sgAllRedraw` (sugs.js:177): redraw the open sheet in place, keeping its scroll and the focused control (a Suggest from choice, Show More)
- `V2.sgAllSync` (sugs.js:182): My Team redraws when the planner finishes or a setting changes: the open sheet follows when its plans, pool or busy state changed
- `V2.fx` (sugs.js:226): (verdictData); the first 4 rows show, Show N more / Show less for the rest; opening the fold opens the first problem with a fix.
- `V2.fixRows` (sugs.js:227)
- `V2.fixFold` (sugs.js:243)
- `V2.tip` (sugs.js:277): ---------- "?" explainers (today's TIPS words, 36-sug-data.js): tap for a small bubble; tap outside, Escape or scrolling closes it ----------
- `V2.tipClose` (sugs.js:278)
- `V2.ty` (sugs.js:303): Working-out is today's shared logic: analyze, offenseRows, prepOf, playForm, mult (no maths copied here).
- `V2.tyData` (sugs.js:304)
- `V2.typesHtml` (sugs.js:308)
- `V2.openTypeTables` (sugs.js:325)
- `V2.exclNames` (sugs.js:338): site still filter suggestions and Build Me a Team, so they must be visible and undoable: one line here, "Change ›" opens the list.
- `V2.exclLine` (sugs.js:339)
- `V2.exclSheet` (sugs.js:341): return '<p class="fine sg2-excl">${L.length ? '<span>Never suggested: ${L.slice(0, 4).map(([, d]) => '<b>${E(d)}</b>').join(', ')}${L.length > 4 ? ' a
- `V2.exclOpen` (sugs.js:345)

</details>

<details><summary>matchups.js: 20 functions</summary>

- `V2.MUV` (matchups.js:7): The view is kept under the new build's own key (today's page doesn't know "Stand-outs", so it never sees it).
- `V2.muView` (matchups.js:8)
- `V2.MUG` (matchups.js:9)
- `V2.MUC` (matchups.js:10)
- `V2.VCLS` (matchups.js:11)
- `V2.muImg` (matchups.js:12)
- `V2.muLv` (matchups.js:13)
- `V2.muSplit` (matchups.js:17): the real-games split: Favoured / Even match / Unfavoured as one slanted bar (the approved mock's)
- `V2.muSec` (matchups.js:19)
- `V2.isMirror` (matchups.js:31): skips a Pokémon against itself), so it reads how your other five do against it: the row says "Mirror match" instead of hiding it.
- `V2.calcNote` (matchups.js:32)
- `V2.muOut` (matchups.js:37): Stand-outs (Sim, Nov 11): only the threats real games call Unfavoured (worst first) or Favoured; the even ones are one line
- `V2.muTop` (matchups.js:51): Top 10 (by top-cut share), numbered; phones and tablets show 5 and "Show 5 more"; then the next 20 as tiles, worst first
- `V2.muGrid` (matchups.js:61): Top 12 grid: your six across, the top 12 threats down (worst first); a cell says what that Pokémon does 1-on-1
- `V2.muAll` (matchups.js:70): All 30: Threat preparation (four groups, each threat opens to its calc reasons), then Biggest threats
- `V2.muSel` (matchups.js:90): The picked threat's detail sits above the 30 tiles (today: below them), so the threat you tapped is on the first screen.
- `V2.muSheetHtml` (matchups.js:91)
- `V2.muOpen` (matchups.js:111): from: the row or tile that opened it (focus goes back there on Close or Escape, even where a tap doesn't focus a button)
- `V2.muSheetRedraw` (matchups.js:113): redraw the open sheet in place (a tile picked, or the suggestions finished), keeping the focus on the same control
- `V2.muAfter` (matchups.js:130): after My Team redraws: the open sheet follows the new numbers, and Close / Escape still return to the row that opened it

</details>

<details><summary>record.js: 5 functions</summary>

- `V2.ql` (record.js:4): The Showdown replay link arrives with the Battle page (it fills the leads and their six from a replay there).
- `V2.ygSec` (record.js:7)
- `V2.ygHtml` (record.js:16): the log sheet: leads (pick two, optional), their team (up to six, optional), then Log a Win or Log a Loss (one tap logs)
- `V2.ygOpen` (record.js:30): <div class="yg2-res"><button type="button" class="np-btn2" data-ygres="W"><span>Log a Win</span></button><button type="button" class="np-btn2" data-yg
- `V2.ygRe` (record.js:31)

</details>

<details><summary>share-slab.js: 3 functions</summary>

- `V2.slabCard` (share-slab.js:6): Near-black, one slanted band in the two leads' type colours, the leads as big dark Cards on it (tilted), the other four small below.
- `V2.slabOpen` (share-slab.js:28): an empty spot on a team still being built (Sim, Nov 15: A): the Card's shape as a dashed outline with 'Open slot'
- `V2.slab` (share-slab.js:33): light (Nov 15): the same look on a cream field, for the share window's Light choice; the Cards stay dark 

</details>

<details><summary>share-tape.js: 1 functions</summary>

- `V2.tapeImage` (share-tape.js:8): edit, buttons). Light or dark, from the share window's choice.

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/A-team.mjs (opens `#team`): `.mtf-lead`
- [ ] app/test/behaviour/B-build.mjs: `.sga2-big` `data-mufix`
- [ ] app/test/behaviour/D-meta-shell.mjs (opens `#team`)
- [ ] app/test/behaviour/adapters/v2.A-team.mjs: `.ts2` `.tt-pick` `.imp2` `.sv2` `.svt2-card` `.svt2-free` `.svt2` `.ed2` `.ed-f` `.ed-l` `.ed-pk` `.sx-slot` `.tm-six` `.tm-empty` `.tm-ud` `.why2` `.tm-mi` `.tm-moremenu` `.tm-legal` `.tm-lock` `.tm-eb` `.tm-acts` `.mtf-head` `.mtf-score` `.mtf-acts` +83 more
- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `.ed2` `.ed-pk` `data-v2edit` `data-v2more` `data-v2rm` `data-v2lock` `.sg2-adj` `.tm-sw` `.tm-own` `.tm-chg` `.tm-mv` `.sg2-ln` `.sg2-why` `.sg2-wait` `.tm-sug` `.sga2-facts` `.sga2` `.sga2-h3` `.sga2-big` `.sg2-probs` `.sg2-excl` `.ex2` `.ex2-list` `data-v2adj` `data-v2replan` +18 more
- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `data-v2slide` `data-v2tip` `.mu-grid` `.mu-sh` `data-muthr` `.tm-yg` `.yg2` `data-ygundo` `data-yglog` `data-yglead` `data-ygres`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs (opens `#team`): `data-v2search` `.np-hit` `data-v2plan` `data-undobar` `data-v2fix` `data-v2tip`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#team`): `.ts2` `.svt2` `data-v2sheetopen` `data-v2saved` `data-v2more` `.sga2`
- [ ] app/test/qcheck.cjs: `.tt-giant`
- [ ] app/test/share-fz.mjs (opens `#team`)
- [ ] app/test/tap-size.mjs (opens `#team`): `.tm-sample` `.tm-links` `.mtf-bb` `.mtf-btn` `.mtf-acts` `data-v2rm` `.tm-yg` `data-yglog` `data-ygres`
- [ ] app/test/v2-caches.mjs (opens `#team`)
- [ ] app/test/v2-ckwin.mjs (opens `#team`)
- [ ] app/test/v2-clear.mjs (opens `#team`): `data-v2clear` `data-v2more`
- [ ] app/test/v2-folds.mjs (opens `#team`): `.tm-ckok`
- [ ] app/test/v2-formerr.mjs (opens `#team`): `.ed2` `data-ed` `data-j` `data-ed-msg` `data-impin` `data-impnote` `data-impgo`
- [ ] app/test/v2-minors.mjs (opens `#team`): `.ed-sel` `.tm-sample` `.tm-acts` `.mtf-bb` `.mtf-btn` `.mtf-acts` `.tm-tabs` `data-v2savename` `data-v2cnt` `data-v2save` `data-v2edit` `data-adq` `data-v2import` `data-impin` `data-impgo` `data-v2more` `data-tmjump` `.mtf-row` `.mtf-sum` `.mtf-party` `.mtf-lead` `data-v2rep` `data-v2rm` `data-v2lock` `.mh-slot` +48 more
- [ ] app/test/v2-partial.mjs (opens `#team`)
- [ ] app/test/v2-paste.mjs (opens `#team`)
- [ ] app/test/v2-planner.mjs (opens `#team`)
- [ ] app/test/v2-q16.mjs (opens `#team`): `.ed2`
- [ ] app/test/v2-q17.mjs (opens `#team`): `.mtf-row` `.mtf-sum` `.mtf-nav` `.mtf-rows`
- [ ] app/test/v2-q18.mjs (opens `#team`): `.tm-yg-last` `.yg2-res` `data-ygundo` `data-yglog` `data-ygres`
- [ ] app/test/v2-q24.mjs (opens `#team`)
- [ ] app/test/v2-q26.mjs (opens `#team`): `.tm-e-rest` `data-v2restore` `data-v2clear` `data-v2more`
- [ ] app/test/v2-q46.mjs: `.np-hit`
- [ ] app/test/v2-q59.mjs (opens `#team`): `.tm-jump` `data-tmjump` `.sg2-wait` `data-mufull`
- [ ] app/test/v2-q69.mjs: `.tm-sample-acts` `.mtf-bb` `.mtf-btn` `.tm-work` `.mtf-sg` `.sg2-adj` `.sg2-ctl` `.sg2-wait` `.tm-sgs` `data-v2adj`
- [ ] app/test/v2-q72.mjs: `.l0`
- [ ] app/test/v2-q78.mjs (opens `#team`): `.tm-work` `.sg2-fold` `.sg2-wait` `.tm-mus`
- [ ] app/test/v2-q83.mjs: `data-v2slide`
- [ ] app/test/v2-q84.mjs: `.sx-add` `.tm-e-six` `.tm-eb` `.mt-band` `.mtf-head` `.mtf-k` `data-tmgomu` `.mtf-bar` `.mtf-party` `.mt-hint` `.np-hit` `.sg2-wait` `.sg2-stale` `.sg-ghost`
- [ ] app/test/v2-rmjump.mjs (opens `#team`): `.mtf-row` `.mtf-add` `.mtf-bar` `.mtf-party` `.mtf-rows` `data-v2rm` `.mh-slot`
- [ ] app/test/v2-s1.mjs (opens `#team`): `.tm-ck` `.sg2-wait`
- [ ] app/test/v2-s13.mjs (opens `#team`)
- [ ] app/test/v2-s16.mjs (opens `#team`)
- [ ] app/test/v2-s17.mjs: `data-v2slide`
- [ ] app/test/v2-s2.mjs (opens `#team`): `.svt2` `data-svact` `data-v2saved`
- [ ] app/test/v2-shown-score.mjs (opens `#team`): `.mtf-score`
- [ ] app/test/v2-sixof.mjs (opens `#team`)
- [ ] app/test/v2-split.mjs (opens `#team`)
- [ ] app/test/v2-swapname.mjs (opens `#team`): `.tm-sw` `.tm-chg` `.tm-sug`
- [ ] app/test/v2-toast.mjs (opens `#team`)
- [ ] app/test/v2-today.mjs: `.mtf-score`
- [ ] app/test/v2-unbounded.mjs (opens `#team`)
- [ ] app/test/v2-usagepicks.mjs: `.tm-e-w` `.tm-empty`

## 4. My Team, empty (`#team-empty`)

- Files: app/src/v2/pages/team.js (584 lines). Registered at team.js:563.
- Browser title: "My Team · NastyPlot". Phone height at 390: **2576 px** with a team; desktop 1440: 1245 px. No page errors.
- What team.js says it is: pre-launch check 6d (Nov 17): team names stop at 40 characters (a long paste was cut mid-word without a word). From 30 characters the field shows how many are used ("34/40"); the spoken label says the limit

### Sections, in order (built page, 390)

- [ ] H1: Six spots, all yours.
- [ ] H2: Or Start from a Winner
- [ ] H2: Corviknight. Somebody's favourite.

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.tm-empty : My Team · 0 of 6 · No team yet

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Build Me a Team" — a.np-btn → #build — hooks: none
- [ ] "Add a Pokémon" — button:button.np-btn2 — hooks: `data-v2search` (team.js:65, team.js:176)
- [ ] "Import a Team ›" — button:button.np-link — hooks: `data-v2import` (team.js:292, team.js:376)
- [ ] "+ Add Spot 1", "+ Add Spot 2", "+ Add Spot 3" ×6 — button:button.sx-add — hooks: `data-v2addto` (team.js:285)
- [ ] "Sneasler S tier 97 35.6% of Showdown ladder teams", "Rillaboom S tier 97 35.5% of Showdown ladder teams", "Kingambit S tier 96 26.6% of Showdown ladder teams" ×6 — button:button.tm-e-w — hooks: `data-hmaround` (team.js:290)
- [ ] "Corviknight: open its info" — button:button.tm-ud-st — hooks: `data-v2mon` (team.js:293, team.js:293)
- [ ] "Add Corviknight to My Team" — button:button.np-btn2 — hooks: `data-v2add` (team.js:264, team.js:269)
- [ ] "Pokémon Page ›" — button:button.np-link — hooks: `data-v2mon` (team.js:293, team.js:293)
- [ ] "Or Build Around Your Favourite Pokémon ›" — a.np-link → #build — hooks: none
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-v2savename` (team.js:4, team.js:114), `data-v2export` (team.js:101, team.js:414), `data-expcopy` (team.js:100, team.js:100), `data-v2copy` (team.js:89, team.js:104), `data-v2sheetopen` (team.js:104, team.js:413), `data-ts2share` (team.js:89, team.js:105), `data-ts2edit` (team.js:73, team.js:82), `data-v2save` (team.js:123, team.js:453), `data-v2saved` (team.js:151, team.js:292), `data-svact` (team.js:132, team.js:136), `data-svrenform` (team.js:132, team.js:166), `data-v2edit` (team.js:248, team.js:248), `data-v2share` (team.js:326, team.js:453), `data-sh2save` (team.js:309, team.js:314), `data-v2clear` (team.js:376, team.js:416), `data-v2restore` (team.js:375, team.js:376), `data-v2why` (team.js:400, team.js:448), `data-v2more` (team.js:417, team.js:453), `data-tmgomu` (team.js:530, team.js:531), `data-hsmore` (team.js:579, team.js:583)

### Numbers and facts shown (sample, 390 with a team)

- [ ] My Team · 0 of 6 · No team yet
- [ ] Spot 1
- [ ] Spot 2
- [ ] Spot 3
- [ ] Spot 4
- [ ] Spot 5
- [ ] Spot 6
- [ ] S tier 97
- [ ] 35.6% of
- [ ] 35.5% of
- [ ] S tier 96
- [ ] 26.6% of
- [ ] S tier 95
- [ ] 31.8% of
- [ ] S tier 94
- [ ] 21.6% of
- [ ] S tier 93
- [ ] 14.0% of

### States

- [ ] State words in the code (each needs its look in the kit): empty, error, failed, emptyhtml, empty2, partial, so far, loading, fail, fails, failure, emptying
- [ ] Remembered settings (localStorage): `cc2.chf.rhow`
- [ ] Sliders (V2.slide keys, `v2slide` event): `svsort`, `shkind`, `shmode`
- [ ] Sub-addresses / links with a part: `#team=sg`, `#team=mu`, `#team=ck`, `#team=`
- [ ] ARIA roles drawn: group, status, tablist, tab, tabpanel

### Drawing functions (where in today's code)

<details><summary>team.js: 57 functions</summary>

- `V2.nameCnt` (team.js:3): field shows how many are used ("34/40"); the spoken label says the limit
- `V2.teamData` (team.js:12): the data, no HTML: one call per draw
- `V2.plan` (team.js:32): ---------- suggestions: today's planner (planFixesG), run in small slices between frames like today's page ----------
- `V2.planKey` (team.js:34): the same key today's page re-plans on (planKeyOf, 08-render-all.js): team, Suggest from, Megas on team, Swap my Mega, box, never-suggest... (R4 sugs h
- `V2.planStart` (team.js:35)
- `V2.sugData` (team.js:47): which suggestions show (shared with today's page: planListOf, CH.sideGrades) and what each does to the Strength Score
- `V2.openTeamSheet` (team.js:62): cards that open Edit Set, and the empty-team message (items 10-14).
- `V2.openExport` (team.js:96): read or selected by hand when copying is blocked
- `V2.copyTeam` (team.js:103)
- `V2.openSave` (team.js:111): Same choices as today's save panel: update the open saved team or save as new, up to 10 teams; Enter does the main action.
- `V2.svUi` (team.js:128): Still to come on the new build: Compare (with the Compare page) and "Your games" with this six (with My Record).
- `V2.savedHtml` (team.js:129)
- `V2.openSavedTeams` (team.js:148)
- `V2.svRefresh` (team.js:150): redraw the sheet in place (the page under it redraws through render()); focus goes to 'focus' or the sheet itself
- `V2.scoreNow` (team.js:174): After each change the message says how the Strength Score moved (today's site says "ready for X%" / "Offense N of 18" there).
- `V2.ed` (team.js:175)
- `V2.editHtml` (team.js:176): Replace (Sim, Nov 17, B) 
- `V2.openEdit` (team.js:216): reopened at once, so it keeps the sheet's history step and Back still closes it (Nov 15) 
- `V2.edKey` (team.js:218): redraw the sheet in place and put focus back on the same control (so a keyboard user keeps their place)
- `V2.edRefresh` (team.js:219)
- `V2.edDo` (team.js:221): one change: apply it, redraw the page and the sheet, and say what it did to the Strength Score
- `V2.edMark` (team.js:238): numbers as they're fixed, and go once pointsProblem is happy
- `V2.edFlush` (team.js:245): or says plainly why it couldn't (the same rule as Save Stat Points)
- `V2.addState` (team.js:262): ---------- adding a Pokémon (R4, Nov 11): today's addMon into the first empty spot, one of each species (Species Clause) ----------
- `V2.addBtn` (team.js:263)
- `V2.addToTeam` (team.js:266): code review C8: Undo, as the Box has 
- `V2.underdog` (team.js:275): the rating means something (the very bottom has almost none: Flapple has 43 tournament games, 0.1% of teams). Never shown beside grades or a team's da
- `V2.emptyHtml` (team.js:279)
- `V2.shUi` (team.js:300): Link (today's team link). The new build draws its sprites from its own art folder.
- `V2.shCtl` (team.js:303): Nov 15: The Slab (Sim, Nov 14, Q4 A) joins the kinds; it has one fixed look, so its second choice is the shape (Tall for feeds, Wide for link previews
- `V2.openShare` (team.js:304): V2.shCtl = SV => { const U = V2.shUi; return '${SV ? '' : V2.slide('shkind', [['card', 'Team Card', 'card'], ['poster', 'Team Poster', 'poster'], ['sh
- `V2.shDraw` (team.js:313): Nov 15 (audit): draws run one at a time and only the newest pick is shown and saved (quick taps could show the wrong image)
- `V2.shDraw0` (team.js:314)
- `V2.checkShared` (team.js:335): The link's team replaces yours only if you say so (as today); Undo brings yours back.
- `V2.openShared` (team.js:344): today's applyShared without its page switch: load (Undo kept), back to My Team, the same toast
- `V2.openImport` (team.js:347): ---------- Import and Clear Team (R4, Nov 11): today's importPaste and clearTeam, same messages ----------
- `V2.clearTeam` (team.js:366): after the 10 s Undo is gone, until a Pokémon is added (bridge.js render forgets it); test app/test/v2-q26.mjs
- `V2.restoreLast` (team.js:370): document.addEventListener('input', e => { if (e.target && e.target.matches && e.target.matches('[data-impin][aria-invalid]')) V2.fieldOk(e.target); })
- `V2.restoreHtml` (team.js:373)
- `V2.meter` (team.js:382): the five bands as one bar with a tick at the score (approved mock-up)
- `V2.whyHtml` (team.js:385): G given: another team's score (Compare's "Why These Scores", inline: no eyebrow, no key or link, those show once below)
- `V2.whyNone` (team.js:394): page shows the older check-based number, so say which case it is and what the number is, never an empty sheet.
- `V2.ckBody` (team.js:403): Team Checks (Sim, Nov 11): checks that pass fold into one line; only the ones that fail show in full (a note says it's a note)
- `V2.moreHtml` (team.js:410): the More menu (Sim, Nov 11): every other My Team action, one per row; Clear Team sits last, apart
- `V2.ui` (team.js:422): ---------- drawing ----------
- `V2.LV` (team.js:423)
- `V2.mtBeltFit` (team.js:426): letter-wide column); then the score belt takes its own full-width row under the name, at full size. Safe to repeat (after every draw).
- `V2.jumpSync` (team.js:522): earlier in the bar, unless you tapped the other one); at the very end of the page the last one is marked.
- `V2.ckCalc` (team.js:530): for (const a of as) { const on = a === cur; if ((a.getAttribute('aria-current') === 'location') !== on) { if (on) a.setAttribute('aria-current', 'loca
- `V2.tmUi` (team.js:533): ---------- My Team's tabs on phones (Sim's yes, Nov 20: option B) ----------
- `V2.tmAutoTab` (team.js:538): tab never jumps under the player when the score crosses 70; a new six (an import, a loaded or built team) or a new visit picks again.
- `V2.tmTabbed` (team.js:543): addEventListener('hashchange', () => { if (!/^#team(=/$)/.test(location.hash)) V2.tmUi.auto = null; }); /* leaving My Team: the next visit picks again
- `V2.tmHashTab` (team.js:545): '#team=mu' / '#team=sg' / '#team=ck' (for a link from elsewhere) opens My Team at that tab, once per arrival of that address
- `V2.tmShow` (team.js:548): (TEAM-07), the page brings the section's heading just under the bar, so the tapped section starts at the top of the screen
- `V2.tmGo` (team.js:552): a link elsewhere that leads to a section (Matchups' "All 30" and the threat sheet's button): on phones it opens that tab first
- `V2.HOW_SCORE` (team.js:569): text no longer matched the code (Team checks: 4 counted basics + 3 notes, proChecks; checked Nov 12).
- `V2.howHtml` (team.js:578)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.A-team.mjs: `.ts2` `.tt-pick` `.imp2` `.sv2` `.svt2-card` `.svt2-free` `.svt2` `.ed2` `.ed-f` `.ed-l` `.ed-pk` `.sx-slot` `.tm-six` `.tm-empty` `.tm-ud` `.why2` `.tm-mi` `.tm-moremenu` `.tm-legal` `.tm-lock` `.tm-eb` `.tm-acts` `.mtf-head` `.mtf-score` `.mtf-acts` +30 more
- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `.ed2` `.ed-pk` `data-v2edit` `data-v2more`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `data-v2search`
- [ ] app/test/behaviour/adapters/v2.mjs: `.ts2` `.svt2` `data-v2sheetopen` `data-v2saved` `data-v2more`
- [ ] app/test/qcheck.cjs: `.tt-giant`
- [ ] app/test/tap-size.mjs: `.tm-sample` `.tm-links` `.mtf-bb` `.mtf-btn` `.mtf-acts`
- [ ] app/test/v2-clear.mjs: `data-v2clear` `data-v2more`
- [ ] app/test/v2-folds.mjs: `.tm-ckok`
- [ ] app/test/v2-formerr.mjs: `.ed2` `data-ed` `data-j` `data-ed-msg` `data-impin` `data-impnote` `data-impgo`
- [ ] app/test/v2-minors.mjs: `.ed-sel` `.tm-sample` `.tm-acts` `.mtf-bb` `.mtf-btn` `.mtf-acts` `.tm-tabs` `data-v2savename` `data-v2cnt` `data-v2save` `data-v2edit` `data-adq` `data-v2import` `data-impin` `data-impgo` `data-v2more` `data-tmjump`
- [ ] app/test/v2-q16.mjs: `.ed2`
- [ ] app/test/v2-q26.mjs: `.tm-e-rest` `data-v2restore` `data-v2clear` `data-v2more`
- [ ] app/test/v2-q59.mjs: `.tm-jump` `data-tmjump`
- [ ] app/test/v2-q69.mjs: `.tm-sample-acts` `.mtf-bb` `.mtf-btn` `.tm-work`
- [ ] app/test/v2-q78.mjs: `.tm-work`
- [ ] app/test/v2-q84.mjs: `.sx-add` `.tm-e-six` `.tm-eb` `.mt-band` `.mtf-head` `.mtf-k` `data-tmgomu`
- [ ] app/test/v2-s1.mjs: `.tm-ck`
- [ ] app/test/v2-s2.mjs: `.svt2` `data-svact` `data-v2saved`
- [ ] app/test/v2-shown-score.mjs: `.mtf-score`
- [ ] app/test/v2-today.mjs: `.mtf-score`
- [ ] app/test/v2-usagepicks.mjs: `.tm-e-w` `.tm-empty`

## 5. Team Sheet (and the Preview #sheet demo) (`#sheet`)

- Files: app/src/v2/pages/monsheet.js (181 lines), app/src/v2/pages/team.js (584 lines). Registered at ?.
- Browser title: "Sun · Grassy Terrain · Tailwind · NastyPlot". Phone height at 390: **3475 px** with a team, **2576 px** with an empty team; desktop 1440: 2753 px. No page errors.
- What monsheet.js says it is: the Pokémon info sheet (R4, Nov 11; replaces the placeholder in shell.js) Mock-up docs/rebuild/mocks/sheet.html (Sim approved): the header (rating and tier, name, types, share of teams, win rate, Speed at level 50, the action), the forms strip (tap one to open it), then Info / Meta / Rating. Every number comes from today's share…
- What team.js says it is: pre-launch check 6d (Nov 17): team names stop at 40 characters (a long paste was cut mid-word without a word). From 30 characters the field shows how many are used ("34/40"); the spoken label says the limit

### Sections, in order (built page, 390)

- [ ] H2: Garchomp
- [ ] H3: Usually
- [ ] H3: Base Stats
- [ ] H3: Abilities
- [ ] H3: Type Matchups
- [ ] H3: Speed at Level 50

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] div.ms-fr [Forms of Garchomp] : 
- [ ] div.ms-tabs [Garchomp: info, meta or rating] : 
- [ ] section.ms-sec : Usually
- [ ] section.ms-sec : Base Stats
- [ ] section.ms-sec : Abilities
- [ ] section.ms-sec : Type Matchups
- [ ] section.ms-sec : Speed at Level 50

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Build Around It" — button:button.np-btn2 — hooks: `data-hmaround` (monsheet.js:26, team.js:290)
- [ ] "Popular Sets" — button:button.np-btn2 — hooks: `data-mssets` (monsheet.js:26, monsheet.js:165)
- [ ] "Compare all 3 ›" — button:button.np-link — hooks: `data-mstabgo` (monsheet.js:28, monsheet.js:155)
- [ ] "Garchomp 92 · S tier", "Mega Garchomp 59 · D tier", "Mega Garchomp Z 87 · A tier" ×3 — button:button.ms-f — hooks: `data-v2mon` (monsheet.js:29, monsheet.js:52)
- [ ] "Info", "Meta", "Rating" ×4 — button:button — hooks: `data-mstab` (monsheet.js:81, monsheet.js:152)
- [ ] "Charizard65% · 2,966 games", "Kingambit56% · 2,278 games", "Incineroar66% · 2,179 games" ×4 — button:button.ms-bwi (4 hidden until opened) — hooks: `data-v2mon` (monsheet.js:29, monsheet.js:52)
- [ ] "–Showdowntiernot listed · lists Pokémon with 1%+ l" — a → https://showdowntier.com/formats/dmc/ind (1 hidden until opened) — hooks: none
- [ ] "Mega Garchomp", "Mega Garchomp Z" ×2 — button:button.np-link (2 hidden until opened) — hooks: `data-v2mon` (monsheet.js:29, monsheet.js:52)
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-v2savename` (team.js:4, team.js:114), `data-v2export` (team.js:101, team.js:414), `data-expcopy` (team.js:100, team.js:100), `data-v2copy` (team.js:89, team.js:104), `data-v2sheetopen` (team.js:104, team.js:413), `data-ts2share` (team.js:89, team.js:105), `data-ts2edit` (team.js:73, team.js:82), `data-v2save` (team.js:123, team.js:453), `data-v2saved` (team.js:151, team.js:292), `data-svact` (team.js:132, team.js:136), `data-svrenform` (team.js:132, team.js:166), `data-v2edit` (team.js:248, team.js:248), `data-v2add` (team.js:264, team.js:269), `data-v2share` (team.js:326, team.js:453), `data-sh2save` (team.js:309, team.js:314), `data-v2import` (team.js:292, team.js:376), `data-v2clear` (team.js:376, team.js:416), `data-v2restore` (team.js:375, team.js:376), `data-v2why` (team.js:400, team.js:448), `data-v2more` (team.js:417, team.js:453), `data-tmgomu` (team.js:530, team.js:531), `data-hsmore` (team.js:579, team.js:583)

### Numbers and facts shown (sample, 390 with a team)

- [ ] Rating · #7 of 321 with tournament results
- [ ] of 13.6k
- [ ] 10,946 games
- [ ] at level 50
- [ ] Compare all 3 ›
- [ ] 92 · S tier
- [ ] 59 · D tier
- [ ] 87 · A tier
- [ ] Choice Scarf · Adamant · 32 Atk, 32 Spe, 2 HP
- [ ] Rough Skinmost used, 98%
- [ ] Pokémon making contact with this Pokémon lose 1/8 of their max HP.
- [ ] Sand Veil2.3%
- [ ] If Sandstorm is active, this Pokémon's evasiveness is 1.25×; immunity to Sandstorm.
- [ ] 4× weak
- [ ] 2× weak
- [ ] Speed at Level 50
- [ ] 32 Speed points, Adamant (most common spread), Choice Scarf
- [ ] outspeeds 98% of the top 30
- [ ] outspeeds 43% of the top 30
- [ ] 32 points, neutral nature
- [ ] outspeeds 62% of the top 30
- [ ] 32 points, Speed-boosting nature (Timid, Jolly…)
- [ ] outspeeds 70% of the top 30
- [ ] outspeeds 100% of the top 30
- [ ] 0 points, Speed-lowering nature
- [ ] moves before 63% of the top 30 under Trick Room
- [ ] 17 bare numbers on their own lines (stats, scores, counts), e.g. 92, 14%, 53%, 231, 108, 130, 95, 80

### States

- [ ] Empty team (six empty slots): 2576 px at 390. Same headings as with a team (the page does not depend on the team, height differs).
- [ ] State words in the code (each needs its look in the kit): empty, so far, loadingdone, error, failed, emptyhtml, empty2, partial, loading, fail, fails, failure, emptying
- [ ] Remembered settings (localStorage): `cc2.setMon`, `cc2.chf.rhow`
- [ ] Sliders (V2.slide keys, `v2slide` event): `svsort`, `shkind`, `shmode`
- [ ] Sub-addresses / links with a part: `#pokemon=`, `#team=sg`, `#team=mu`, `#team=ck`, `#team=`
- [ ] ARIA roles drawn: group, table, tablist, tab, tabpanel, status

### Drawing functions (where in today's code)

<details><summary>monsheet.js: 12 functions</summary>

- `V2.msTab` (monsheet.js:5): today's shared functions (24-sheet-data.js and the rating, set and speed code), proved identical with experiments/same-info.mjs.
- `V2.txt` (monsheet.js:6)
- `V2.msCard` (monsheet.js:11): two orbit lines, a faint hairline texture and one sheen band. Decorations are aria-hidden; the real name is the h2.
- `V2.monHtml` (monsheet.js:18)
- `V2.openMonSheet` (monsheet.js:85): opening: a sheet; another Pokémon from inside it (a form, a partner) replaces it in place and keeps the tab
- `V2.openMon` (monsheet.js:91): the page's name on arrival. The sheet's code stays (V2.openMonSheet) but nothing opens it.
- `V2.fitMsName` (monsheet.js:95): ("Squawkabilly (Yellow)", "Mega Crabominable") steps the name down the type scale until every line fits; names that fit keep 28 px
- `V2.fitWords` (monsheet.js:103): word still can't fit at the smallest size may it break (np-brk). Runs after every page draw (shell.js), on resize and once the fonts load
- `V2._mvFit` (monsheet.js:147): the last fit of a Hand's move lists, by page, window width and the moves in it: {c: 'mh-mv1' / 'mh-mv2' / '', b: moves that may break}
- `V2.mvFitOf` (monsheet.js:148)
- `V2.msShow` (monsheet.js:151): try { document.fonts.ready.then(() => V2.fitWords()); document.fonts.addEventListener('loadingdone', () => requestAnimationFrame(() => V2.fitWords()))
- `V2.msSw` (monsheet.js:169): fingers or while text is selected; vertical scrolls never count; touch only, so a mouse never swipes

</details>

<details><summary>team.js: 57 functions</summary>

- `V2.nameCnt` (team.js:3): field shows how many are used ("34/40"); the spoken label says the limit
- `V2.teamData` (team.js:12): the data, no HTML: one call per draw
- `V2.plan` (team.js:32): ---------- suggestions: today's planner (planFixesG), run in small slices between frames like today's page ----------
- `V2.planKey` (team.js:34): the same key today's page re-plans on (planKeyOf, 08-render-all.js): team, Suggest from, Megas on team, Swap my Mega, box, never-suggest... (R4 sugs h
- `V2.planStart` (team.js:35)
- `V2.sugData` (team.js:47): which suggestions show (shared with today's page: planListOf, CH.sideGrades) and what each does to the Strength Score
- `V2.openTeamSheet` (team.js:62): cards that open Edit Set, and the empty-team message (items 10-14).
- `V2.openExport` (team.js:96): read or selected by hand when copying is blocked
- `V2.copyTeam` (team.js:103)
- `V2.openSave` (team.js:111): Same choices as today's save panel: update the open saved team or save as new, up to 10 teams; Enter does the main action.
- `V2.svUi` (team.js:128): Still to come on the new build: Compare (with the Compare page) and "Your games" with this six (with My Record).
- `V2.savedHtml` (team.js:129)
- `V2.openSavedTeams` (team.js:148)
- `V2.svRefresh` (team.js:150): redraw the sheet in place (the page under it redraws through render()); focus goes to 'focus' or the sheet itself
- `V2.scoreNow` (team.js:174): After each change the message says how the Strength Score moved (today's site says "ready for X%" / "Offense N of 18" there).
- `V2.ed` (team.js:175)
- `V2.editHtml` (team.js:176): Replace (Sim, Nov 17, B) 
- `V2.openEdit` (team.js:216): reopened at once, so it keeps the sheet's history step and Back still closes it (Nov 15) 
- `V2.edKey` (team.js:218): redraw the sheet in place and put focus back on the same control (so a keyboard user keeps their place)
- `V2.edRefresh` (team.js:219)
- `V2.edDo` (team.js:221): one change: apply it, redraw the page and the sheet, and say what it did to the Strength Score
- `V2.edMark` (team.js:238): numbers as they're fixed, and go once pointsProblem is happy
- `V2.edFlush` (team.js:245): or says plainly why it couldn't (the same rule as Save Stat Points)
- `V2.addState` (team.js:262): ---------- adding a Pokémon (R4, Nov 11): today's addMon into the first empty spot, one of each species (Species Clause) ----------
- `V2.addBtn` (team.js:263)
- `V2.addToTeam` (team.js:266): code review C8: Undo, as the Box has 
- `V2.underdog` (team.js:275): the rating means something (the very bottom has almost none: Flapple has 43 tournament games, 0.1% of teams). Never shown beside grades or a team's da
- `V2.emptyHtml` (team.js:279)
- `V2.shUi` (team.js:300): Link (today's team link). The new build draws its sprites from its own art folder.
- `V2.shCtl` (team.js:303): Nov 15: The Slab (Sim, Nov 14, Q4 A) joins the kinds; it has one fixed look, so its second choice is the shape (Tall for feeds, Wide for link previews
- `V2.openShare` (team.js:304): V2.shCtl = SV => { const U = V2.shUi; return '${SV ? '' : V2.slide('shkind', [['card', 'Team Card', 'card'], ['poster', 'Team Poster', 'poster'], ['sh
- `V2.shDraw` (team.js:313): Nov 15 (audit): draws run one at a time and only the newest pick is shown and saved (quick taps could show the wrong image)
- `V2.shDraw0` (team.js:314)
- `V2.checkShared` (team.js:335): The link's team replaces yours only if you say so (as today); Undo brings yours back.
- `V2.openShared` (team.js:344): today's applyShared without its page switch: load (Undo kept), back to My Team, the same toast
- `V2.openImport` (team.js:347): ---------- Import and Clear Team (R4, Nov 11): today's importPaste and clearTeam, same messages ----------
- `V2.clearTeam` (team.js:366): after the 10 s Undo is gone, until a Pokémon is added (bridge.js render forgets it); test app/test/v2-q26.mjs
- `V2.restoreLast` (team.js:370): document.addEventListener('input', e => { if (e.target && e.target.matches && e.target.matches('[data-impin][aria-invalid]')) V2.fieldOk(e.target); })
- `V2.restoreHtml` (team.js:373)
- `V2.meter` (team.js:382): the five bands as one bar with a tick at the score (approved mock-up)
- `V2.whyHtml` (team.js:385): G given: another team's score (Compare's "Why These Scores", inline: no eyebrow, no key or link, those show once below)
- `V2.whyNone` (team.js:394): page shows the older check-based number, so say which case it is and what the number is, never an empty sheet.
- `V2.ckBody` (team.js:403): Team Checks (Sim, Nov 11): checks that pass fold into one line; only the ones that fail show in full (a note says it's a note)
- `V2.moreHtml` (team.js:410): the More menu (Sim, Nov 11): every other My Team action, one per row; Clear Team sits last, apart
- `V2.ui` (team.js:422): ---------- drawing ----------
- `V2.LV` (team.js:423)
- `V2.mtBeltFit` (team.js:426): letter-wide column); then the score belt takes its own full-width row under the name, at full size. Safe to repeat (after every draw).
- `V2.jumpSync` (team.js:522): earlier in the bar, unless you tapped the other one); at the very end of the page the last one is marked.
- `V2.ckCalc` (team.js:530): for (const a of as) { const on = a === cur; if ((a.getAttribute('aria-current') === 'location') !== on) { if (on) a.setAttribute('aria-current', 'loca
- `V2.tmUi` (team.js:533): ---------- My Team's tabs on phones (Sim's yes, Nov 20: option B) ----------
- `V2.tmAutoTab` (team.js:538): tab never jumps under the player when the score crosses 70; a new six (an import, a loaded or built team) or a new visit picks again.
- `V2.tmTabbed` (team.js:543): addEventListener('hashchange', () => { if (!/^#team(=/$)/.test(location.hash)) V2.tmUi.auto = null; }); /* leaving My Team: the next visit picks again
- `V2.tmHashTab` (team.js:545): '#team=mu' / '#team=sg' / '#team=ck' (for a link from elsewhere) opens My Team at that tab, once per arrival of that address
- `V2.tmShow` (team.js:548): (TEAM-07), the page brings the section's heading just under the bar, so the tapped section starts at the top of the screen
- `V2.tmGo` (team.js:552): a link elsewhere that leads to a section (Matchups' "All 30" and the threat sheet's button): on phones it opens that tab first
- `V2.HOW_SCORE` (team.js:569): text no longer matched the code (Team checks: 4 counted basics + 3 notes, proChecks; checked Nov 12).
- `V2.howHtml` (team.js:578)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.A-team.mjs: `.ms2` `data-mstab` `data-mspan` `.ts2` `.tt-pick` `.imp2` `.sv2` `.svt2-card` `.svt2-free` `.svt2` `.ed2` `.ed-f` `.ed-l` `.ed-pk` `.sx-slot` `.tm-six` `.tm-empty` `.tm-ud` `.why2` `.tm-mi` `.tm-moremenu` `.tm-legal` `.tm-lock` `.tm-eb` `.tm-acts` +33 more
- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `.ms2` `.ed2` `.ed-pk` `data-v2edit` `data-v2more`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.ms-rate` `.ms-bwi` `.ms2` `data-mstab` `data-mspan` `data-v2search`
- [ ] app/test/behaviour/adapters/v2.mjs: `.ts2` `.svt2` `data-v2sheetopen` `data-v2saved` `data-v2more`
- [ ] app/test/qcheck.cjs: `.mc-bg` `.mc-giant` `.tt-giant`
- [ ] app/test/tap-size.mjs: `.tm-sample` `.tm-links` `.mtf-bb` `.mtf-btn` `.mtf-acts`
- [ ] app/test/v2-clear.mjs: `data-v2clear` `data-v2more`
- [ ] app/test/v2-folds.mjs: `.tm-ckok`
- [ ] app/test/v2-formerr.mjs: `.ed2` `data-ed` `data-j` `data-ed-msg` `data-impin` `data-impnote` `data-impgo`
- [ ] app/test/v2-minors.mjs: `.ms-card` `.mc-id` `.ms-br` `.ed-sel` `.tm-sample` `.tm-acts` `.mtf-bb` `.mtf-btn` `.mtf-acts` `.tm-tabs` `data-v2savename` `data-v2cnt` `data-v2save` `data-v2edit` `data-adq` `data-v2import` `data-impin` `data-impgo` `data-v2more` `data-tmjump`
- [ ] app/test/v2-pksrc.mjs: `.ms-br`
- [ ] app/test/v2-q16.mjs: `.ed2`
- [ ] app/test/v2-q26.mjs: `.tm-e-rest` `data-v2restore` `data-v2clear` `data-v2more`
- [ ] app/test/v2-q59.mjs: `.tm-jump` `data-tmjump`
- [ ] app/test/v2-q69.mjs: `.tm-sample-acts` `.mtf-bb` `.mtf-btn` `.tm-work`
- [ ] app/test/v2-q78.mjs: `.tm-work`
- [ ] app/test/v2-q84.mjs: `.sx-add` `.tm-e-six` `.tm-eb` `.mt-band` `.mtf-head` `.mtf-k` `data-tmgomu`
- [ ] app/test/v2-s1.mjs: `.tm-ck`
- [ ] app/test/v2-s2.mjs: `.svt2` `data-svact` `data-v2saved`
- [ ] app/test/v2-shown-score.mjs: `.mtf-score`
- [ ] app/test/v2-today.mjs: `.mtf-score`
- [ ] app/test/v2-unbounded.mjs: `.mc-id`
- [ ] app/test/v2-usagepicks.mjs: `.tm-e-w` `.tm-empty`

## 6. Compare (`#compare`)

- Files: app/src/v2/pages/compare.js (96 lines), app/src/v2/pages/compare-faceoff.js (39 lines). Registered at compare.js:44.
- Browser title: "Compare Teams · NastyPlot". Phone height at 390: **1347 px** with a team, **1215 px** with an empty team; desktop 1440: 955 px. No page errors.
- What compare.js says it is: Compare (R4, Nov 11): two teams side by side Today's shared data (62-compare-data.js): cxResolve (My Team, a saved team, an event winner, a pasted team), cxInfo (each side worked out with the same functions My Team uses, cached), cxFacts (every row, whether it differs, and the "What's different" sentences). Facts only, no head-t…
- What compare-faceoff.js says it is: Compare (Nov 14): Sim's pick "The Face-Off" (docs/rebuild/mocks/compare-faceoff/BRIEF.md) A fight poster split in two (Team A PLOT blue, Team B the site's existing pink --pick: Sim, Nov 14, no new colours), a tale of the tape of tug-of-war bars (Strength Score, Fastest, Slowest), then each team's "Only Team X handles" column wit…

### Sections, in order (built page, 390)

- [ ] H1: Compare Teams

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.cx2 : ← My Team · Compare · two teams side by side

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "← My Team" — a.np-back → #team — hooks: none
- [ ] "Change" — button:button.np-link — hooks: `data-cxp` (compare-faceoff.js:7, compare.js:17)
- [ ] "Grassy Terrain · Hard Trick Room Won ValkrixVGC Ch", "Psychic Terrain · Trick RoomWon Trinity Championsh", "Grassy Terrain · TailwindWon Sketch Academy Sunday" ×3 — button:button.cx2-opt (2 hidden until opened) — hooks: `data-cxset2` (compare.js:72, compare.js:85)
- [ ] "Saved, more winners or paste a team ›" — button:button.np-link.more — hooks: `data-cxp` (compare-faceoff.js:7, compare.js:17)

### Numbers and facts shown (sample, 390 with a team)

- [ ] Won ValkrixVGC Champions League #09 · Nov 8

### States

- [ ] Empty team (six empty slots): 1215 px at 390. Same headings as with a team (the page does not depend on the team, height differs).
- [ ] State words in the code (each needs its look in the kit): empty, partial, so far, partialn, loading, busy
- [ ] ARIA roles drawn: status, group

### Drawing functions (where in today's code)

<details><summary>compare.js: 10 functions</summary>

- `V2.cxBusy` (compare.js:5): sentences). Facts only, no head-to-head prediction. ui.cx holds the two sides (memory only), as today.
- `V2.cxGo` (compare.js:6)
- `V2.cxSub` (compare.js:11): a top team's event carries ' · N players' after the name: only the name is cleaned (review Nov 19); a function replacer, so '$' in a name is literal
- `V2.cxQuick` (compare.js:14): whole picker (saved teams, more winners, a pasted team). Phones show the newest only (CSS), so the page grows one row, not three
- `V2.cxHead` (compare.js:18)
- `V2.cxRows` (compare.js:43): a check's yes/no) while the cells show more (Beats/Handles counts, the Tailwind setter), so rows that differ were listed as the same
- `V2.cxWork` (compare.js:67): work out what isn't cached yet, one side per frame, so the page answers at once (as today)
- `V2.cxOpt` (compare.js:72): one picker row (also Team B's quick winners, scan S31)
- `V2.cxPickHtml` (compare.js:73)
- `V2.cxPick` (compare.js:84)

</details>

<details><summary>compare-faceoff.js: 5 functions</summary>

- `V2.cxfHero` (compare-faceoff.js:5): number and sentence comes from today's cxFacts / cxResolve / teamLineup / outspeedOf; every other row that differs stays listed below.
- `V2.cxfHalf` (compare-faceoff.js:6)
- `V2.cxfBand` (compare-faceoff.js:12): a tug-of-war band: A's part and B's part in proportion to the two numbers, the leader tagged when higher is plainly better
- `V2.cxfTape` (compare-faceoff.js:15)
- `V2.cxfCol` (compare-faceoff.js:22)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.A-team.mjs: `.cx2-head` `.cx2-row` `.cx2-pick` `data-cxp` `data-cxset2` `data-cxpaste-in` `data-cxpaste2` `.cxf-half` `.cxf-id`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#compare`): `.cx2-pick`
- [ ] app/test/qcheck.cjs: `.cxf-ghost` `.cxf-vs`
- [ ] app/test/v2-cxev.mjs (opens `#compare`): `.cx2-nm` `.cxf-half` `.cxf-id`
- [ ] app/test/v2-minors.mjs (opens `#compare`): `.cx2` `.cx2-hint` `.cx2-row`
- [ ] app/test/v2-q84.mjs: `.cx2-qp` `.cx2-sum` `.cx2-opt` `.cx2-pick` `data-cxp` `.cxf-half`
- [ ] app/test/v2-s13.mjs (opens `#compare`): `.cx2-qp` `.cx2-head`

## 7. Battle (lead planner) (`#battle`)

- Files: app/src/v2/pages/battle.js (259 lines), app/src/v2/pages/battle-pbp.js (36 lines). Registered at battle.js:42.
- Browser title: "Battle · NastyPlot". Phone height at 390: **4074 px** with a team, **1147 px** with an empty team; desktop 1440: 2141 px. No page errors.
- What battle.js says it is: Battle (R5, Nov 12-13): "how do I play this match", from the approved mock-up (docs/rebuild/mocks/battle.tpl.html) Every number comes from today's shared Battle logic (46-battle-data.js battlePlan, 40-turn-one-data.js, 35 realMatch, 17 oppTeam); nothing here works anything out. Piece 1: the head (the answer + the real-games verd…
- What battle-pbp.js says it is: Battle a team, once their six is in (Nov 14): Sim's pick "Play-by-Play" (docs/rebuild/mocks/battle-playbyplay/BRIEF.md) A face-off poster with both full sixes (you PLOT blue, them the site's existing pink --pick: Sim, Nov 14, no new colours), then turn one told move by move down a centre line, each move on its mover's side. Same…

### Sections, in order (built page, 390)

- [ ] H1: Bring these four. Lead the pair.
- [ ] H2: Your Six
- [ ] H2: Their Six
- [ ] H2: Turn One, Play by Play
- [ ] H2: The Read
- [ ] H3: Incineroar
- [ ] H2: From Real Games
- [ ] H2: Watch Out
- [ ] H2: More Ways to Prep
- [ ] H2: Your Games

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.bt-head : Battle a team · Team preview
- [ ] section.pbp-poster [Your six against their six] : Your Six
- [ ] section.pbp-turn : Turn One, Play by Play
- [ ] li.pbp-beat [Move 1, them: Sneasler, 172 Speed, +3 priority, Fake Out Meg] : 
- [ ] li.pbp-beat [Move 2, you: Garchomp, 231 Speed, Earthquake (hits both), KO] : 
- [ ] li.pbp-beat [Move 3, them: Whimsicott, 184 Speed, Moonblast into Garchomp] : 
- [ ] li.pbp-beat [Move 4, you: Mega Charizard Y, 152 Speed, Weather Ball into ] : 
- [ ] section.bt-plan : The Read
- [ ] nav.bt-tabs [Detail] : 
- [ ] section.bt-more : More Ways to Prep
- [ ] section.bt-log : Your Games

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Damage Calculator", "Damage Calculator ›" ×2 — a → #calc (1 hidden until opened) — hooks: none
- [ ] "Battle" — a.on → #battle (1 hidden until opened) — hooks: none
- [ ] "Team Preview Practice", "Team Preview Practice Pick four and two leads agai" ×2 — a → #practice (1 hidden until opened) — hooks: none
- [ ] "Test Run", "Test Run ›" ×2 — a → #gauntlet (1 hidden until opened) — hooks: none
- [ ] "Speed Tiers", "Speed Tiers ›" ×2 — a → #speed (1 hidden until opened) — hooks: none
- [ ] "Type Chart", "Type Chart ›" ×2 — a → #types (1 hidden until opened) — hooks: none
- [ ] "Mega Charizard Y Charizardite Y", "Garchomp Choice Scarf", "Whimsicott" ×4 — button:button.pbp-mon.big — hooks: `data-v2mon` (battle-pbp.js:5, battle.js:9)
- [ ] "Whimsicott", "Rillaboom", "Incineroar" ×8 — button:button.pbp-mon — hooks: `data-v2mon` (battle-pbp.js:5, battle.js:9)
- [ ] "Change Their Six" — button:button.np-btn2 — hooks: `data-btopp` (battle-pbp.js:33, battle.js:30)
- [ ] "Clear" — button:button.np-link — hooks: `data-btclear` (battle-pbp.js:33, battle.js:29)
- [ ] "Incineroar: open its page" — button:button.bt-pk — hooks: `data-v2mon` (battle-pbp.js:5, battle.js:9)
- [ ] "Damage Both Ways", "Who Moves First", "Deeper Read" ×3 — button:button.bt-tab — hooks: `data-bttab` (battle.js:129, battle.js:173)
- [ ] "lead Mega Charizard Y + Garchomp, back Whimsicott " — button:button.bt-lfour — hooks: `data-btlfour` (battle.js:186, battle.js:194)
- [ ] "Log a Win", "Log a Loss" ×2 — button:button.np-btn2 — hooks: `data-btlres` (battle.js:194, battle.js:194)
- [ ] "Log from a Showdown Replay ›" — button:button.np-link — hooks: `data-btreplay` (battle.js:195, battle.js:224)
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-btcopy` (battle-pbp.js:33, battle.js:30), `data-btfind` (battle.js:48, battle.js:78), `data-btlp` (battle.js:191, battle.js:224), `data-btlogjump` (battle.js:256)

### Numbers and facts shown (sample, 390 with a team)

- [ ] learned from 38,513 tournament games
- [ ] Up to 85% of its HP, 2HKO
- [ ] 2HKO
- [ ] Up to 356% of its HP, Sash holds. May not move: their Sneasler's Fake Out
- [ ] Field on turn 1: sun (Mega Charizard Y)
- [ ] Intimidate: −1 Attack to Garchomp, Rillaboom
- [ ] Incineroar, Sneasler can flinch one of your leads on turn 1
- [ ] 1 more of their six can shut something down
- [ ] Tailwind their side doubles Speed for the next 3 turns (4 counting the turn it's set)
- [ ] 4 bare numbers on their own lines (stats, scores, counts), e.g. 1, 2, 3, 4

### States

- [ ] Empty team (six empty slots): 1147 px at 390. Shows: H1: Who are you facing? Plan the match.. Drops: H1: Bring these four. Lead the pair. / H2: Your Six / H2: Turn One, Play by Play / H2: The Read / H3: Incineroar / H2: From Real Games / H2: Watch Out / H2: Your Games.
- [ ] State words in the code (each needs its look in the kit): error, so far, empty
- [ ] Remembered settings (localStorage): `cc2.v2.bttab`
- [ ] ARIA roles drawn: group

### Drawing functions (where in today's code)

<details><summary>battle.js: 37 functions</summary>

- `V2.btUi` (battle.js:6): one of the top tournament teams (38-gauntlet-data.js gauntletTeams), as today.
- `V2.btOppWho` (battle.js:7)
- `V2.btPk` (battle.js:9)
- `V2.btItem` (battle.js:10)
- `V2.btPlan` (battle.js:11)
- `V2.btT1Risk` (battle.js:15): then the verdict says it only reads the six-vs-six matchup, not turn one
- `V2.battleHead` (battle.js:16)
- `V2.battleTheirs` (battle.js:24)
- `V2.battleMine` (battle.js:32)
- `V2.battleTurn` (battle.js:35)
- `V2.battleEmpty` (battle.js:40)
- `V2.btOppSheet` (battle.js:46): ---------- their six: a sheet with six name boxes and the top tournament teams (today's entry ways) ----------
- `V2.btSheet` (battle.js:58): their open team sheet when the six is a known tournament team (today's sdOppSheet: the player first, else any team with these six)
- `V2.btKey` (battle.js:61): recent opponents (today's 74-arena.js rule): every full six is remembered, newest first, five kept; the sheet offers four, not the current one
- `V2.btRecent` (battle.js:62)
- `V2.btOppRefresh` (battle.js:63)
- `V2.btSetOpp` (battle.js:64)
- `V2.btRemember` (battle.js:67): today's rule: every full six that was in their six is remembered (the one being replaced too), newest first, five kept
- `V2.btOnce` (battle.js:99): left leaves the list, and the count under the heading matches.
- `V2.battleRead` (battle.js:111)
- `V2.battleWatch` (battle.js:119)
- `V2.btChip` (battle.js:127)
- `V2.battleTabs` (battle.js:128)
- `V2.battleDamage` (battle.js:131)
- `V2.battleSpeedLine` (battle.js:149): on the left, each with its Speed number above (yours in blue) on one level line; phones keep the bars (ten can't stand side by side)
- `V2.battleSpeed` (battle.js:154)
- `V2.battleDeep` (battle.js:162)
- `V2.battleDetail` (battle.js:171)
- `V2.btLogPick` (battle.js:180)
- `V2.battleLog` (battle.js:183)
- `V2.btRecord` (battle.js:197): your record (today's Battle log stats, in a sheet): by Pokémon, lead pairs (2+ games), toughest opponents (3+), recent battles with delete
- `V2.btLogSheet` (battle.js:210)
- `V2.btReplaySheet` (battle.js:213)
- `V2.btAddReplay` (battle.js:216): code review C8: no crash on a bad paste 
- `V2.BT_TOOLS` (battle.js:245): "Coming next" page (rule C10: marked, not faked).
- `V2.battleToolsBar` (battle.js:251)
- `V2.battleMoreTools` (battle.js:255): (Nov 19 fix: after Damage Calculator moved first in the tabs, the first-child rule gave Practice's place and line to Damage Calculator)

</details>

<details><summary>battle-pbp.js: 5 functions</summary>

- `V2.pbpMon` (battle-pbp.js:5): btItem, btSheet); everything under the play-by-play is battle.js's own sections, untouched.
- `V2.pbpPoster` (battle-pbp.js:6)
- `V2.pbpBeat` (battle-pbp.js:15): one move of turn one: today's act and why lines, with the move, its target and the damage drawn from them (no new numbers)
- `V2.pbpTurn` (battle-pbp.js:27)
- `V2.pbpActs` (battle-pbp.js:32)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/C-battle.mjs: `.bt-mg` `.bt-pane`
- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `.bt-theirs` `.bt-osheet` `.bt-watch` `.bt-hx` `.bt-dv` `.bt-spd` `.bt-pane` `.bt-lp` `.bt-log` `.bt-rec` `.bt-rlist` `.bt-lsheet` `.bt-tools` `data-btclear` `data-btopp` `data-btox` `data-btfind` `data-bthits` `data-btrecent` `data-btteamall` `data-btall` `data-btpick` `data-bttab` `data-btlfour` `data-btlres` +8 more
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#battle`)
- [ ] app/test/qcheck.cjs: `.pbp-vs`
- [ ] app/test/tap-size.mjs (opens `#battle`): `.bt-empty` `data-btopp` `data-btteam`
- [ ] app/test/v2-arena.mjs: `.bt-tools`
- [ ] app/test/v2-minors.mjs (opens `#battle`): `.bt-head` `.bt-theirs` `.bt-lab` `.bt-acts` `.bt-empty` `.bt2` `.bt-body` `.bd-hits` `.bt-lfour` `.bt-log` `.bt-lgl`
- [ ] app/test/v2-pbppair.mjs (opens `#battle`): `.pbp-band` `.pbp-tx` `.pbp-tgt` `.pbp-spe`
- [ ] app/test/v2-q14.mjs (opens `#battle`): `.bt-verdict` `.bt-warn`
- [ ] app/test/v2-q18.mjs (opens `#battle`): `.bt-log` `.bt-lacts` `data-btlres`
- [ ] app/test/v2-q84.mjs: `.bt-q6` `data-btopp6`
- [ ] app/test/v2-s26.mjs (opens `#battle`): `.bt-tools`
- [ ] app/test/v2-t1rules.mjs (opens `#battle`)
- [ ] app/test/v2-trwarm.mjs (opens `#battle`)

## 8. Damage Calc "Plot the hit" (`#calc`)

- Files: app/src/v2/pages/calc.js (422 lines), app/src/v2/pages/calc-plot.js (77 lines). Registered at calc.js:371.
- Browser title: "Damage Calculator · NastyPlot". Phone height at 390: **2176 px** with a team, **2147 px** with an empty team; desktop 1440: 1449 px. No page errors.
- What calc.js says it is: Damage Calc, "The Arena" (Sim's prompt Nov 19, mock-ups docs/redesign/arena/) The battle is the control panel: the sky is the weather switch, the ground is the terrain switch, the defender's HP bar is the answer. Every number is today's calc (39-damage-calc-speed.js: calcData, damage, koText, koShort, calcResultNotes, bulkToSurv…
- What calc-plot.js says it is: the Damage Calc: "Plot the hit" (Sim, Nov 21; ported from the designer's plot4 mock-up, not redrawn) A nasty plot is a scheme: the calc is the board where you plot the hit. Three things only: PHOTOS (the two Pokémon), MARKER (the hit is a hand-drawn arrow; a red circle = chosen; moves are highlighter swipes in their type colour;…

### Sections, in order (built page, 390)

- [ ] H1: Damage Calculator · level 50 doubles
- [ ] H2: the move
- [ ] H2: the sky
- [ ] H2: the ground
- [ ] H2: this turn
- [ ] H2: 

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.pc-board [Mega Charizard Y attacks Sneasler] : the move
- [ ] div.pc-mvs [Mega Charizard Y's moves] : 
- [ ] div.pc-five [Weather] : 
- [ ] div.pc-five [Terrain] : 
- [ ] div.pc-sws [In play] : 
- [ ] section.arn-set [Attacker's set] : 
- [ ] div.arn-f [Sp. Atk stage] : 
- [ ] section.arn-set [Defender's set] : HP 2 · SpD 0 pts
- [ ] details.arn-pts : HP 2 · SpD 0 pts
- [ ] div.arn-f [Sp. Def stage] : 
- [ ] details.arn-kb : KO Board: your six against the top 30 20 down in one hit · 8
- [ ] div.np-slide [The KO Board shows] : 
- [ ] div.kob-tabs [Show the group] : 
- [ ] details.arn-notes : Notes on this hit ›

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Damage Calculator" — a.on → #calc (1 hidden until opened) — hooks: none
- [ ] "Battle" — a → #battle (1 hidden until opened) — hooks: none
- [ ] "Team Preview Practice" — a → #practice (1 hidden until opened) — hooks: none
- [ ] "Test Run" — a → #gauntlet (1 hidden until opened) — hooks: none
- [ ] "Speed Tiers" — a → #speed (1 hidden until opened) — hooks: none
- [ ] "Type Chart" — a → #types (1 hidden until opened) — hooks: none
- [ ] "swap them" — button:button.pc-swap.u — hooks: none
- [ ] "Attacker: Mega Charizard Y. Choose another Pokémon", "Defender: Sneasler. Choose another Pokémon" ×2 — button:button.arn-pickbtn — hooks: `data-arnpick` (calc-plot.js:6, calc-plot.js:40)
- [ ] "Mega Charizard Y Garchomp Incineroar Whimsicott Ri", "Heat Wave Solar Beam Weather Ball Acrobatics Aeria", "32 (max) 28 24 20 16 12 8 4 0" ×4 — select:select-one.arn-pick.arn-pickhid — hooks: none
- [ ] "Heat Wave 88–104% Fire · faints 1 in 4" — button:button.pc-mv.on — hooks: `data-dcmv` (calc-plot.js:6, calc-plot.js:55), `Wave` ((drawn by shared code))
- [ ] "Solar Beam 33–39% Grass · 3+ hits" — button:button.pc-mv — hooks: `data-dcmv` (calc-plot.js:6, calc-plot.js:55), `Beam` ((drawn by shared code))
- [ ] "Weather Ball 126–149% Fire · always faints" — button:button.pc-mv — hooks: `data-dcmv` (calc-plot.js:6, calc-plot.js:55), `Ball` ((drawn by shared code))
- [ ] "All moves: Heat Wave. Choose any move" — button:button.arn-pickbtn — hooks: `data-arnmv` (calc-plot.js:7, calc.js:286)
- [ ] "Clear", "Sun", "Rain" ×5 — button:button — hooks: `data-dcw` (calc-plot.js:6, calc-plot.js:58)
- [ ] "None", "Grassy", "Electric" ×5 — button:button — hooks: `data-dcterr` (calc-plot.js:6, calc-plot.js:58)
- [ ] "Hits both foes", "Screen up", "Helping Hand" ×5 — button:button — hooks: `data-dct` (calc-plot.js:6, calc-plot.js:72)
- [ ] "Charizardite Y", "Drought", "Hardy Adamant Jolly Modest Timid Brave Quiet Bold " ×6 — select:select-one.arn-sel — hooks: none
- [ ] "Attacker's Ability: Drought. Choose another", "Defender's Ability: Unburden. Choose another" ×2 — button:button.arn-pickbtn — hooks: `data-arnset` (calc.js:326, calc.js:333), `data-arntitle` (calc.js:333), `Ability` ((drawn by shared code))
- [ ] "Attacker's nature: Modest. Choose another", "Defender's nature: Adamant. Choose another" ×2 — button:button.arn-pickbtn — hooks: `data-arnset` (calc.js:326, calc.js:333), `data-arntitle` (calc.js:333), `nature` ((drawn by shared code))
- [ ] "Attacker's Sp. Atk points: 32. Choose another" — button:button.arn-pickbtn — hooks: `data-arnset` (calc.js:326, calc.js:333), `data-arntitle` (calc.js:333), `Sp.` ((drawn by shared code)), `Atk` ((drawn by shared code)), `points` ((drawn by shared code))
- [ ] "−", "+" ×4 — button:button — hooks: `data-arnst` (calc-plot.js:7, calc.js:329), `data-d` (calc.js:329, calc.js:329)
- [ ] "Defender's item: White Herb. Choose another" — button:button.arn-pickbtn — hooks: `data-arnset` (calc.js:326, calc.js:333), `data-arntitle` (calc.js:333), `item` ((drawn by shared code))
- [ ] "HP 2 · SpD 0 pts" — summary.arn-f — hooks: none
- [ ] "2", "0" ×3 — select:select-one.field — hooks: none
- [ ] "KO Board: your six against the top 30 20 down in o" — summary.arn-kbbar — hooks: none
- [ ] (no text) ×2 — button:button — hooks: `data-dcdir` (calc.js:56, calc.js:56)
- [ ] (no text) — button:button.kob-t.ko — hooks: `data-kobg` (calc.js:80)
- [ ] (no text) — button:button.kob-t.can — hooks: `data-kobg` (calc.js:80)
- [ ] (no text) — button:button.kob-t.sv — hooks: `data-kobg` (calc.js:80)
- [ ] "KO: Mega Golisopod: your Mega Charizard Y's Weathe", "KO: Whimsicott: your Mega Charizard Y's Weather Ba", "KO: Mega Froslass: your Mega Charizard Y's Weather" ×8 — button:button.dc2-kt.ko — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Ball` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "KO: Politoed: your Rillaboom's Wood Hammer does 25", "KO: Basculegion: your Rillaboom's Wood Hammer does", "KO: Mega Gardevoir: your Rillaboom's Wood Hammer d" ×7 — button:button.dc2-kt.ko — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Hammer` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "KO: Mega Gengar: your Kingambit's Kowtow Cleave do", "KO: Indeedee (F): your Kingambit's Kowtow Cleave d" ×2 — button:button.dc2-kt.ko — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Cleave` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "KO: Kommo-o: your Whimsicott's Moonblast does 150–" — button:button.dc2-kt.ko — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "KO: Sneasler: your Garchomp's Stomping Tantrum doe" — button:button.dc2-kt.ko — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Tantrum` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "KO: Mega Charizard Y: your Garchomp's Rock Slide d" — button:button.dc2-kt.ko — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Slide` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "Archaludon: your Mega Charizard Y's Weather Ball d", "Mega Staraptor: your Mega Charizard Y's Weather Ba", "Volcarona: your Mega Charizard Y's Weather Ball do" ×3 — button:button.dc2-kt.can (3 hidden until opened) — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Ball` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "Grimmsnarl: your Rillaboom's Wood Hammer does 96–1", "Garchomp: your Rillaboom's Wood Hammer does 96–114", "Sylveon: your Rillaboom's Wood Hammer does 93–110%" ×3 — button:button.dc2-kt.can (3 hidden until opened) — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Hammer` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "Farigiraf: your Kingambit's Kowtow Cleave does 95–" — button:button.dc2-kt.can (1 hidden until opened) — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Cleave` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "Mega Garchomp Z: your Garchomp's Dragon Claw does " — button:button.dc2-kt.can (1 hidden until opened) — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Claw` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "Mega Salamence: your Whimsicott's Moonblast does 7" — button:button.dc2-kt.sv (1 hidden until opened) — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "Incineroar: your Garchomp's Stomping Tantrum does " — button:button.dc2-kt.sv (1 hidden until opened) — hooks: `data-dckb` (calc.js:53, calc.js:60), `data-dckbo` (calc.js:53, calc.js:72), `data-dckbm` (calc.js:53, calc.js:72), `Tantrum` ((drawn by shared code)), `data-dctip` (calc.js:53, calc.js:412)
- [ ] "Notes on this hit ›" ×2 — summary — hooks: none
- [ ] "How the Calc Works ›" — a.np-link → #method — hooks: none
- [ ] "Indeedee (F)Kowtow Cleave112–134%" — button:button.kob-r.ko (desktop 1440 only) — hooks: `data-dckb`
- [ ] "VolcaronaWeather Ball91–108%" — button:button.kob-r.can (desktop 1440 only) — hooks: `data-dckb`
- [ ] "IncineroarStomping Tantrum67–81%" — button:button.kob-r.sv (desktop 1440 only) — hooks: `data-dckb`
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-arnpickmon` (calc.js:257, calc.js:267), `data-arnpickmv` (calc.js:298, calc.js:302), `data-arnopt` (calc.js:323, calc.js:325)

### Numbers and facts shown (sample, 390 with a team)

- [ ] Damage Calculator · level 50 doubles
- [ ] 88–104%
- [ ] of Sneasler's HP: 138–163 of 157 HP.
- [ ] Faints 1 time in 4
- [ ] hangs on with 1–12% the other three
- [ ] Fire · faints 1 in 4
- [ ] 33–39%
- [ ] Grass · 3+ hits
- [ ] 126–149%
- [ ] 32 (max)
- [ ] ±0
- [ ] HP 2 · SpD 0 pts
- [ ] KO Board: your six against the top 30
- [ ] 20 down in one hit · 8 can go down · 2 survive
- [ ] 9 bare numbers on their own lines (stats, scores, counts), e.g. 32, 28, 24, 20, 16, 12, 8, 4

### States

- [ ] Empty team (six empty slots): 2147 px at 390. Same headings as with a team (the page does not depend on the team, height differs).
- [ ] State words in the code (each needs its look in the kit): loading, fail, error
- [ ] ARIA roles drawn: group, tablist, tab, tabpanel, status

### Drawing functions (where in today's code)

<details><summary>calc.js: 48 functions</summary>

- `V2.ARN_W` (calc.js:10): Band) keeps today's words.
- `V2.DC_WX` (calc.js:31)
- `V2.DC_TR` (calc.js:32)
- `V2.dcStone` (calc.js:34): audit #13 (Nov 15): a Mega always holds its stone; the set line names it instead of 'No item' (today's stoneFor, 19-showdown-paste.js)
- `V2.dcPct` (calc.js:35)
- `V2.dcHit` (calc.js:37): one move's own result against the defender (same sides and field as the move in play)
- `V2.dcKB` (calc.js:40): the KO Board: each top-30 Pokemon with your best hit on it (or, switched, its best hit on your six), surest KO first
- `V2.dcTile` (calc.js:50): audit Nov 16 (WCAG 2.5.3): a KO tile's name starts with the KO it shows
- `V2.dcCounts` (calc.js:55)
- `V2.dcDir` (calc.js:56)
- `V2.KOB_G` (calc.js:61): directions, the intro line, the every-hit table fold and tap to put a hit on the table (data-dckb, the same handler as the tiles).
- `V2.kobUi` (calc.js:62)
- `V2.kobWide` (calc.js:63)
- `V2.kobOf` (calc.js:64)
- `V2.kobNone` (calc.js:65)
- `V2.kobRow` (calc.js:68): (its spoken label is the tile's, word for word)
- `V2.dcBoard` (calc.js:74)
- `V2.kobPick` (calc.js:84): a tab: shows its group in place (no redraw, so nothing jumps); arrows, Home and End move between the tabs and choose (WAI-ARIA tabs)
- `V2.dcGrid` (calc.js:95): switched with the board's "Their hits on you". Folded under the board; the KO Board shows only each one's single best.
- `V2.dcGridHtml` (calc.js:102)
- `V2.arnArt` (calc.js:116): Ids are prefixed "arn" so they stay unique on the page. Colours are the picture's own art data (v2-guard: "colours inside SVG art data").
- `V2.ARN_IC` (calc.js:241): the rows' icons (Nov 21 mock-up): one per option, in that weather's / terrain's colour (--arn-k-*)
- `V2.arnIc` (calc.js:242)
- `V2.arnSide` (calc.js:243)
- `V2.arnImg` (calc.js:244)
- `V2.arnHp` (calc.js:246): the defender's plate: name (tap = today's Pokémon picker), the HP bar (green left, pink damage, stripes the roll's part), "x–y% HP left"
- `V2.arnPlate` (calc.js:250): return {bar: '<span class="arn-hprow" aria-hidden="true"><span class="arn-hpl">HP</span><span class="arn-hpb"><i class="l" style="width:${keep.toFixed
- `V2.arnHit` (calc.js:257): fires its usual change, so every calc rule (moves reset, sets, field) runs exactly as before
- `V2.arnPick` (calc.js:258)
- `V2.arnVerdict` (calc.js:272): damage as the big tilted tag in open sky
- `V2.arnMove` (calc.js:279): a move button: type-coloured edge, name, its own damage and short verdict (desktop adds type and power); the chosen one is filled
- `V2.arnAll` (calc.js:285): "All moves": today's move list (id dcMv: its set, then every damaging move it learns), kept hidden behind the dashed button
- `V2.arnSelPick` (calc.js:290): before (V2.arnSelPick); the opener is focused first, so focus comes back to it on close (a tap on a phone doesn't focus a button).
- `V2.arnMvRow` (calc.js:294): The rows are worked out once when the sheet opens (all of them; timed in the Q47 report); filtering reuses them.
- `V2.arnMvPick` (calc.js:299)
- `V2.arnMostUsed` (calc.js:315): the card's "most used set" comes from, sideDefaults: the top tournament item, metaAbility, the most common spread's nature and points)
- `V2.arnSetPick` (calc.js:321)
- `V2.arnStage` (calc.js:329): a stage row: names its stat; minus / plus within today's range (-2 to +2)
- `V2.arnSel` (calc.js:330)
- `V2.arnSetBtn` (calc.js:333): that opens the row's sheet; a disabled select (a Mega's stone) stays as it is
- `V2.arnRow` (calc.js:334)
- `V2.arnSets` (calc.js:338): the two set cards: item, Ability, nature, points, stage (today's ids; the defender's points open HP, Def and Sp. Def)
- `V2.arnKB` (calc.js:350): the KO Board bar: one tap away; it opens today's board (both directions, the three groups, every hit's table)
- `V2.arnKBFull` (calc.js:356): Q58 C: from 1024 the opened board spans the page under the Arena; shown while the bar above is open (the toggle handler below)
- `V2.arnNotes` (calc.js:358): notes on this hit (today's Details: HP numbers, KO odds in today's words, effectiveness, notes, Not counted, fewest points to survive, the set readout
- `V2.dcTipOk` (calc.js:406): with its tile (focusing a tile off screen scrolls it into view).
- `V2.dcTipHide` (calc.js:407)
- `V2.dcTipShow` (calc.js:408)

</details>

<details><summary>calc-plot.js: 13 functions</summary>

- `V2.PC_W` (calc-plot.js:9): the Build page (Sim, Nov 21: "fix the clashes as you see fit").
- `V2.pcRing` (calc-plot.js:12): the marker circle: one hand-drawn loop, stretched to whatever it circles (red = chosen)
- `V2.pcVerdict` (calc-plot.js:16): today's words. Returns {big, sm, chip}: the circled line, the small marker line under it, the move swipe's short line.
- `V2.pcDmg` (calc-plot.js:28)
- `V2.PC_PCT_FIRST` (calc-plot.js:31): Q100 (Nov 20, 11:27 PM: HP first, % small), so it is one switch: false brings back HP first
- `V2.pcPctOf` (calc-plot.js:32): rounded like the KO Board (calc.js kobRow) 
- `V2.pcPct` (calc-plot.js:33): V2.pcPctOf = (v, hp) => Math.round(100 * v / hp); /* rounded like the KO Board (calc.js kobRow)
- `V2.pcPctH` (calc-plot.js:34): the % sign smaller, so the number keeps its width 
- `V2.pcLeft` (calc-plot.js:35): V2.pcPctH = r => V2.pcPct(r).replace(/%$/, '<span class="pc-pc">%</span>'); /* the % sign smaller, so the number keeps its width
- `V2.pcPhoto` (calc-plot.js:37): a photo: the Pokémon on its tint (blue attacker, pink defender, the target circled), its role and name; the photo is the picker button
- `V2.pcAnswer` (calc-plot.js:43): the answer: the marker arrow, "Heat Wave does", the damage big in the move's type colour, the defender's HP, the circled verdict
- `V2.pcMove` (calc-plot.js:53): a move: a highlighter swipe in its type's colour; its damage in HP and the short verdict; the chosen one circled
- `V2.pcFive` (calc-plot.js:58): sky / ground: icons and words written on the board in each one's colour; the chosen one circled

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/C-battle.mjs: `.l2` `.l1`
- [ ] app/test/behaviour/adapters/v2.A-team.mjs: `.np-hit` `.np-find`
- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `.arn-verdict` `.arn-kb` `.arn-notes` `.dc2` `.arn-mvs` `data-dcfold` `data-dcmv` `data-arnst` `data-d` `.pc-ans` `.pc-vd` `.pc-l1` `.pc-l2` `.pc-big` `.pc-sm` `.pc-mvs`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.np-hit`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#calc`)
- [ ] app/test/v2-arena.mjs (opens `#calc`): `.dc2-kt` `.kob-r` `.l2` `.arn-st` `.arn-pts` `.arn-kb` `.arn-kbin` `.arn-kbfull` `.arn-notes` `.dc2` `.arn-scene` `.arn-spr` `.arn-mvs` `.arn-links` `data-dcdir` `data-arnname` `data-arnpick` `data-dcmv` `data-arnmv` `data-arnset` `data-arnst` `data-d` `data-dcw` `data-dcterr` `data-dct` +19 more
- [ ] app/test/v2-kob.mjs (opens `#calc`): `.dc2-kt` `.dc2-dir` `.kob-r` `.dc2-kb` `.kob-col` `.dc2-all` `.arn-kb` `.arn-kbbar` `.arn-kbfull` `.arn-grid` `data-dcdir` `.pc-board`
- [ ] app/test/v2-minors.mjs (opens `#calc`): `.dc2-kt` `.np-slide` `.kob-r` `.dc2-kts` `.np-hit` `.arn-kb` `.arn-kbbar` `.arn-kbfull` `.arn-links` `data-dcdir` `data-fbmistake`
- [ ] app/test/v2-q19.mjs: `.l2` `.l1`
- [ ] app/test/v2-q22.mjs (opens `#calc`): `.dc2-kt` `.kob-r` `.dc2-kts` `.arn-kb` `.arn-kbfull` `data-dcdir`
- [ ] app/test/v2-q46.mjs (opens `#calc`): `.np-hit` `.arn-verdict` `data-arnname` `data-arnpick` `data-arnpickmon` `data-arnq` `.pc-ans`
- [ ] app/test/v2-q47.mjs (opens `#calc`): `.arn-mvd` `.arn-grp` `.arn-mu` `data-arnmv` `data-arnpickmv` `data-arnopt` `data-arnset` `.pc-ans` `.pc-big`
- [ ] app/test/v2-q52.mjs (opens `#calc`): `.arn-kbbar`
- [ ] app/test/v2-q68.mjs (opens `#calc`): `.kob-r` `.arn-kb` `.arn-kbfull` `data-dckbm` `data-dcdir`
- [ ] app/test/v2-q84.mjs: `.np-hit`
- [ ] app/test/v2-s26.mjs (opens `#calc`)
- [ ] app/test/v2-unbounded.mjs: `.dc2-kt` `.arn-hprow` `.arn-hpl` `.arn-mv`

## 9. Speed Tiers (`#speed`)

- Files: app/src/v2/pages/speed.js (71 lines). Registered at speed.js:58.
- Browser title: "Speed Tiers · NastyPlot". Phone height at 390: **2952 px** with a team, **2268 px** with an empty team; desktop 1440: 1737 px. No page errors.
- What speed.js says it is: Speed Tiers (Nov 13), Battle's tool: who moves first, your six against the 20 most-used others Sim's picks (Nov 13, morning): Speed Q1 A (desktop: the race track, your six above the line, the field below) and Speed Q2 A (phones: the slim vertical track). Every number comes from today's shared logic (39-damage-calc-speed.js speed…

### Sections, in order (built page, 390)

- [ ] H1: Who moves first. Your six vs the top 20.

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.sp2-h : Battle · Speed Tiers · level 50
- [ ] div.np-slide [Show as] : 
- [ ] div.chips [Speed conditions] : 
- [ ] div.sp2-wx [Weather] : 
- [ ] ol.sp2-vs [Turn order: your six on the left, the top 20 on the right] : 

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Damage Calculator" — a → #calc (1 hidden until opened) — hooks: none
- [ ] "Battle" — a → #battle (1 hidden until opened) — hooks: none
- [ ] "Team Preview Practice" — a → #practice (1 hidden until opened) — hooks: none
- [ ] "Test Run" — a → #gauntlet (1 hidden until opened) — hooks: none
- [ ] "Speed Tiers" — a.on → #speed (1 hidden until opened) — hooks: none
- [ ] "Type Chart" — a → #types (1 hidden until opened) — hooks: none
- [ ] "Track", "List" ×2 — button:button — hooks: `data-spview` (speed.js:21, speed.js:21)
- [ ] "Your Tailwind", "You +1", "Their Tailwind" ×6 — button:button.np-chip — hooks: `data-spd` (speed.js:17, speed.js:67)
- [ ] "Your Weather (sun)", "No Weather", "Sun" ×6 — button:button.np-chip — hooks: `data-spdwx` (speed.js:18, speed.js:67)
- [ ] "Venusaur", "Basculegion", "Mega Garchomp Z" ×20 — button:button.chip2 — hooks: `data-v2mon` (speed.js:37, speed.js:45)
- [ ] "Garchomp", "Whimsicott", "Mega Charizard Y" ×6 — button:button.chip2.me — hooks: `data-v2mon` (speed.js:37, speed.js:45)
- [ ] "70 Kingambit" — button:button.sp2-m.me (desktop 1440 only) — hooks: `data-v2mon`
- [ ] "60 Mega Golisopod" — button:button.sp2-m (desktop 1440 only) — hooks: `data-v2mon`

### Numbers and facts shown (sample, 390 with a team)

- [ ] Battle · Speed Tiers · level 50
- [ ] Your six vs the top 20.
- [ ] You +1
- [ ] Them −1
- [ ] Top 20
- [ ] Mega Charizard Y outspeeds 55% of the top 30 threats
- [ ] Garchomp outspeeds 95% of the top 30 threats
- [ ] Incineroar outspeeds 10% of the top 30 threats
- [ ] 10 more Speed points (10 total) outspeeds Farigiraf
- [ ] Whimsicott outspeeds 75% of the top 30 threats
- [ ] Rillaboom outspeeds 35% of the top 30 threats
- [ ] 11 more Speed points (13 total) outspeeds Pelipper
- [ ] Kingambit outspeeds 5% of the top 30 threats
- [ ] 11 more Speed points (11 total) outspeeds Farigiraf
- [ ] 26 bare numbers on their own lines (stats, scores, counts), e.g. 264, 231, 214, 203, 190, 189, 184, 178

### States

- [ ] Empty team (six empty slots): 2268 px at 390. Shows: H1: Who moves first. The top 20.. Drops: H1: Who moves first. Your six vs the top 20..
- [ ] State words in the code (each needs its look in the kit): error, empty
- [ ] ARIA roles drawn: group

### Drawing functions (where in today's code)

<details><summary>speed.js: 10 functions</summary>

- `V2.spView` (speed.js:7): the weather (your team's weather, none, or any of the four), Track / List, and each list row's spread, item and notes.
- `V2.spName` (speed.js:8)
- `V2.spNote` (speed.js:10): one row's small print, as today's list: spread, Scarf, weather doubling, Unburden, the ability note and base Speed
- `V2.spTie` (speed.js:12)
- `V2.spHead` (speed.js:14)
- `V2.spW` (speed.js:28): outer Pokémon off at 1024-1199), then after() checks the real width once and redraws if it was off
- `V2.spTrack` (speed.js:30)
- `V2.spVSplit` (speed.js:44): ours"): your six left of the Speed line, the top 20 right, fastest at the top (slowest under Trick Room), equal speeds on one row
- `V2.spList` (speed.js:50): the list: every row with today's small print (spread, item, notes, base Speed) and You / Tie tags
- `V2.spSums` (speed.js:53): one line per member of yours: today's outspeed share of the top 30 and the Speed points to pass the threat just above

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/C-battle.mjs (opens `#speed`)
- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `.sp2-m` `.chip2` `.sp2-vs` `.sp2-list` `.sp2-li` `.sp2-sum` `.sp2`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#speed`)
- [ ] app/test/v2-minors.mjs (opens `#speed`): `.sp2-h` `.np-slide` `.sp2-wx` `.sp2-m` `.sp2-sum-k` `.sp2-sum` `.sp2` `data-spd`
- [ ] app/test/v2-q84.mjs: `.sp2-m` `.sp2-track`

## 10. Type Chart (`#types`)

- Files: app/src/v2/pages/types.js (89 lines). Registered at types.js:34.
- Browser title: "Type Chart · NastyPlot". Phone height at 390: **2798 px** with a team, **2870 px** with an empty team; desktop 1440: 1897 px. No page errors.
- What types.js says it is: Type Chart (Nov 14), Battle's tool: what hits a Pokemon (or one or two types) hard, and what its own types hit Concept A 'Spotlight' (mock-ups docs/rebuild/mocks/types). Every number comes from today's shared type logic (20-types-data.js: typeGroups with the Ability's notes, typeOffence, EFF); the state is today's (ui.typesSel, …

### Sections, in order (built page, 390)

- [ ] H1: What hits Mega Charizard Y hard.
- [ ] H2: Mega Charizard Y

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.tc-h : Battle · Type Chart
- [ ] div.tc-team [Your team] : 
- [ ] div.tc-picks [Or pick one or two types] : 
- [ ] details.tc-fold : Full type chart Every attacking type against every defending
- [ ] div.tc-picks [Attacking type] : 

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Damage Calculator" — a → #calc (1 hidden until opened) — hooks: none
- [ ] "Battle" — a → #battle (1 hidden until opened) — hooks: none
- [ ] "Team Preview Practice" — a → #practice (1 hidden until opened) — hooks: none
- [ ] "Test Run" — a → #gauntlet (1 hidden until opened) — hooks: none
- [ ] "Speed Tiers" — a → #speed (1 hidden until opened) — hooks: none
- [ ] "Type Chart" — a.on → #types (1 hidden until opened) — hooks: none
- [ ] "Look up a Pokémon: type its name" — input:search — hooks: `data-tcfind` (types.js:38, types.js:78)
- [ ] "Clear" — button:button.np-clr (1 hidden until opened) — hooks: `data-v2clr` (build-plot.js:56)
- [ ] "Mega Charizard Y" — button:button.tc-tm.on — hooks: `data-tcmon` (types.js:37, types.js:84)
- [ ] "Garchomp", "Incineroar", "Whimsicott" ×5 — button:button.tc-tm — hooks: `data-tcmon` (types.js:37, types.js:84)
- [ ] "Clear" — button:button.np-link.tc-clear — hooks: `data-tcclear` (types.js:40, types.js:84)
- [ ] "Normal", "Water", "Electric" ×16 — button:button.tc-tp — hooks: `data-tctype` (types.js:39, types.js:84)
- [ ] "Fire", "Flying" ×2 — button:button.tc-tp.on — hooks: `data-tctype` (types.js:39, types.js:84)
- [ ] "Full type chart Every attacking type against every" — summary — hooks: none
- [ ] (no text) ×17 — button:button.tc-tp — hooks: `data-tcatk` (types.js:23, types.js:84)
- [ ] (no text) — button:button.tc-tp.on — hooks: `data-tcatk` (types.js:23, types.js:84)

### Numbers and facts shown (sample, 390 with a team)

- [ ] 4×
- [ ] 2×
- [ ] 4× weak:
- [ ] 2× weak:
- [ ] 0 immune:
- [ ] 1 bare numbers on their own lines (stats, scores, counts), e.g. 0

### States

- [ ] Empty team (six empty slots): 2870 px at 390. Shows: H1: What hits Sneasler hard. / H2: Sneasler. Drops: H1: What hits Mega Charizard Y hard. / H2: Mega Charizard Y.
- [ ] State words in the code (each needs its look in the kit): empty
- [ ] ARIA roles drawn: group

### Drawing functions (where in today's code)

<details><summary>types.js: 9 functions</summary>

- `V2.tcState` (types.js:6): on phones the attacking-type row.
- `V2.TC_AB` (types.js:15)
- `V2.tcMul` (types.js:16)
- `V2.tcGrid` (types.js:19): the full chart: every attacking type (rows) against every defending type (columns); the picked types' columns lit
- `V2.tcRow` (types.js:22): phones (today's row view): pick an attacking type, its hits as three groups
- `V2.tcFitHead` (types.js:28): name at 320, Crabominable +46px): then the join becomes an ordinary space so the headline wraps instead of running off
- `V2.TC_H` (types.js:62): tower never stands in front of a shorter one. Roof labels are text laid over the drawing at a fixed size (the type scale).
- `V2.tcCity` (types.js:63)
- `V2.tcHits` (types.js:77): the look-up box: Build's search (same names, Megas included), picks a Pokemon

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `.tc-grid` `.tc-prow` `.tc-band` `data-tcatk` `data-tcfind` `data-tctype` `data-tcclear` `data-tcfold`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#types`)
- [ ] app/test/v2-minors.mjs (opens `#types`): `.tc-tm` `.bd-hits`

## 11. Team Preview Practice (`#practice`)

- Files: app/src/v2/pages/practice.js (60 lines). Registered at practice.js:11.
- Browser title: "Team Preview Practice · NastyPlot". Phone height at 390: **1661 px** with a team, **1625 px** with an empty team; desktop 1440: 1108 px. No page errors.
- What practice.js says it is: Team Preview Practice (Nov 14), Battle's tool: pick four and two leads against a real ladder team Sim's pick: 'Arena VS' (mock-ups docs/rebuild/mocks/practice/round2). The state, scoring, picks and reveal are today's shared logic (63-practice-data.js: pr, prStart, prReveal, prTarget, prScore); today's words and rules are kept (6…

### Sections, in order (built page, 390)

- [ ] H1: Pick your four.
- [ ] H3: Doubles is played in pairs.

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.pp2-h : Battle · Team Preview Practice
- [ ] div.pp2-modes [Which six to practice with] : 

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Damage Calculator" — a → #calc (1 hidden until opened) — hooks: none
- [ ] "Battle" — a → #battle (1 hidden until opened) — hooks: none
- [ ] "Team Preview Practice" — a.on → #practice (1 hidden until opened) — hooks: none
- [ ] "Test Run" — a → #gauntlet (1 hidden until opened) — hooks: none
- [ ] "Speed Tiers" — a → #speed (1 hidden until opened) — hooks: none
- [ ] "Type Chart" — a → #types (1 hidden until opened) — hooks: none
- [ ] "Use My Team Sun · Grassy Terrain · Tailwind agains", "Practice With a Real Team A strong player's six fr" ×2 — button:button.pp2-mode — hooks: `data-ppmode` (practice.js:19, practice.js:20)
- [ ] "Start" — button:button.np-btn — hooks: `data-ppgo` (practice.js:21, practice.js:49)
- [ ] "53% brought together Sneasler + Kingambit 3,518 ga", "67% brought together Rillaboom + Incineroar 2,805 ", "62% brought together Incineroar + Garchomp 2,310 g" ×4 — button:button.hm-pair — hooks: `data-v2mon` (archetypes.js:34, battle-pbp.js:5)

### Numbers and facts shown (sample, 390 with a team)

- [ ] Team preview · Showdown replays · 20,000 games
- [ ] 53% brought together
- [ ] 3,518 games
- [ ] 67% brought together
- [ ] 2,805 games
- [ ] 62% brought together
- [ ] 2,310 games
- [ ] 1,840 games

### States

- [ ] Empty team (six empty slots): 1625 px at 390. Same headings as with a team (the page does not depend on the team, height differs).
- [ ] ARIA roles drawn: img, radiogroup, radio

### Drawing functions (where in today's code)

<details><summary>practice.js: 6 functions</summary>

- `V2.ppCp` (practice.js:4): logic (63-practice-data.js: pr, prStart, prReveal, prTarget, prScore); today's words and rules are kept (63-practice.js).
- `V2.ppTy` (practice.js:5)
- `V2.ppMeter` (practice.js:6)
- `V2.ppFoot` (practice.js:7)
- `V2.ppScore` (practice.js:8)
- `V2.ppHead` (practice.js:9)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `.pp2` `data-ppick`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#practice`)
- [ ] app/test/tap-size.mjs: `.pp2-act`
- [ ] app/test/v2-minors.mjs (opens `#practice`)
- [ ] app/test/v2-q25.mjs (opens `#practice`): `.pp2` `.pp2-plate` `.pp2-side` `data-ppick` `data-pprev`

## 12. Test Run (Three Piles) (`#gauntlet`)

- Files: app/src/v2/pages/gauntlet.js (63 lines), app/src/v2/pages/test-piles.js (52 lines). Registered at gauntlet.js:35.
- Browser title: "Test Run · NastyPlot". Phone height at 390: **1901 px** with a team, **943 px** with an empty team; desktop 1440: 2099 px. No page errors.
- What gauntlet.js says it is: Test Run (Nov 14), Battle's tool: your six against the top tournament teams Sim's pick: 'Scoreboard + match cards' (mock-ups docs/rebuild/mocks/gauntlet, A). The logic is today's shared code (38-gauntlet-data.js: gauntletTeams, gauntletScore, gauntletPrep); the rows, sort, counts and words follow today's renderGauntlet.
- What test-piles.js says it is: Test Run (Nov 14): Sim's pick "Three Piles" (docs/rebuild/mocks/test-run-piles/BRIEF.md) All 20 top teams dealt into three piles by how the matchup looks: The Problems (they're better prepared, pink = them), The Coin Flips (about even, grey), The Good Matchups (you're better prepared, blue = you). Names approved by Sim, Nov 14. …

### Sections, in order (built page, 390)

- [ ] H1: Your six vs the top 20.
- [ ] H2: Three Piles
- [ ] H3: Champion (desktop only)

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.tr-h : Battle · Test Run
- [ ] details.tr-how : How it works Same calcs as your Matchups, both ways
- [ ] section.tp-table : Three Piles
- [ ] section.tp-pile [The Problems: 0 teams, they're better prepared] : 
- [ ] section.tp-pile [The Coin Flips: 20 teams, about even] : 
- [ ] section.tp-pile [The Good Matchups: 0 teams, you're better prepared] : 

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Damage Calculator" — a → #calc (1 hidden until opened) — hooks: none
- [ ] "Battle" — a → #battle (1 hidden until opened) — hooks: none
- [ ] "Team Preview Practice" — a → #practice (1 hidden until opened) — hooks: none
- [ ] "Test Run" — a.on → #gauntlet (1 hidden until opened) — hooks: none
- [ ] "Speed Tiers" — a → #speed (1 hidden until opened) — hooks: none
- [ ] "Type Chart" — a → #types (1 hidden until opened) — hooks: none
- [ ] "How it works Same calcs as your Matchups, both way" — summary — hooks: none
- [ ] "Start here Champion Gdańsk Regional · 758 players", "2nd place Gdańsk Regional · 758 players", "2nd place Puebla Regional · 333 players" ×5 — button:button.tp-card.c — hooks: `data-tpflip` (test-piles.js:14, test-piles.js:49)
- [ ] "7th placePuebla Regional · 333 players", "3rd placeNice Regional · 862 players", "3rd placeGdańsk Regional · 758 players" ×15 — button:button.tp-card.tp-more (15 hidden until opened) — hooks: `data-tpflip` (test-piles.js:14, test-piles.js:49)
- [ ] "15 more coin flips ›" — button:button.np-link.tp-morebtn — hooks: `data-tpmore` (test-piles.js:7, test-piles.js:39)
- [ ] "?" — button:button.sg2-tip — hooks: `data-v2tip` (sugs.js:277, sugs.js:278)
- [ ] "Set as Opponent" — button:button.np-btn (desktop 1440 only) — hooks: `data-trbat`
- [ ] "Copy for Showdown" — button:button.np-btn2 (desktop 1440 only) — hooks: `data-trcopy`
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-trmore` (gauntlet.js:55, gauntlet.js:58), `data-trbat` (gauntlet.js:49, gauntlet.js:58)

### Numbers and facts shown (sample, 390 with a team)

- [ ] Your six vs the top 20.
- [ ] Gdańsk Regional · 758 players
- [ ] 2nd place
- [ ] Puebla Regional · 333 players
- [ ] 3rd place
- [ ] 4th place
- [ ] 15 more coin flips ›
- [ ] 2 bare numbers on their own lines (stats, scores, counts), e.g. 0, 20

### States

- [ ] Empty team (six empty slots): 943 px at 390. Shows: H1: Your six vs the top.. Drops: H1: Your six vs the top 20. / H2: Three Piles.
- [ ] State words in the code (each needs its look in the kit): busy, failed
- [ ] ARIA roles drawn: img

### Drawing functions (where in today's code)

<details><summary>gauntlet.js: 10 functions</summary>

- `V2.trCache` (gauntlet.js:4): (38-gauntlet-data.js: gauntletTeams, gauntletScore, gauntletPrep); the rows, sort, counts and words follow today's renderGauntlet.
- `V2.trKey` (gauntlet.js:5): nature + stat points too (code review A1-I2) 
- `V2.trOne` (gauntlet.js:7): one top team's row: the verdicts of your six against it (null when fewer than 4 of its Pokémon are known)
- `V2.trRows` (gauntlet.js:12)
- `V2.trWarmC` (gauntlet.js:19): team), never while they scroll, tap or type; opening Test Run then uses them. Nothing on screen changes.
- `V2.trWarm` (gauntlet.js:20): only on the Battle pages, one tap from Test Run 
- `V2.trBusyAt` (gauntlet.js:28)
- `V2.trCp` (gauntlet.js:30)
- `V2.trUi` (gauntlet.js:31)
- `V2.trHead` (gauntlet.js:33)

</details>

<details><summary>test-piles.js: 7 functions</summary>

- `V2.tpUi` (test-piles.js:5): plan line, prep and actions as gauntlet.js (trRows, gauntletPrep); a card flips open to show what to bring. No bare scores anywhere.
- `V2.tpPile` (test-piles.js:9)
- `V2.tpWide` (test-piles.js:10)
- `V2.tpPlace` (test-piles.js:11)
- `V2.tpEv` (test-piles.js:12)
- `V2.tpCard` (test-piles.js:13)
- `V2.tpOpen` (test-piles.js:17)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `.tr-six` `.tr-prep` `.tr-card` `data-trbat` `data-trcopy` `data-trfold` `.tp-card` `.tp-open`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#gauntlet`)
- [ ] app/test/v2-minors.mjs (opens `#gauntlet`)
- [ ] app/test/v2-q45.mjs (opens `#gauntlet`): `.tp-card` `data-tpmore`
- [ ] app/test/v2-trwarm.mjs (opens `#gauntlet`)
- [ ] app/test/v2-unbounded.mjs: `.tp-card` `.tp-start` `.tp-open`

## 13. Ratings (`#meta`)

- Files: app/src/v2/pages/meta.js (139 lines). Registered at meta.js:70.
- Browser title: "Meta · NastyPlot". Phone height at 390: **2893 px** with a team, **2893 px** with an empty team; desktop 1440: 3003 px. No page errors.
- What meta.js says it is: Meta > Pokémon > Rating (Nov 14): "Who wins right now." The approved mock-up (Preview gallery ratings.html; source docs/rebuild/mocks/ratings.tpl.html). Every feature of today's Ratings page (D-meta-shell RATE-01..09; inventory docs/rebuild/meta-features.md) is here: the kicker with teams and the data date, How ratings work, Tra…

### Sections, in order (built page, 390)

- [ ] H1: Who wins right now.
- [ ] H2: Sneasler
- [ ] H2: The Grandstand?

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Meta · Ratings
- [ ] nav.ra-tabs [Meta] : 
- [ ] nav.ra-seg [Pokémon views] : 
- [ ] div.ra-filt [Filter] : 
- [ ] nav.gs-view [View] : 
- [ ] details.ra-about : About the ratings How they are made, the 4 data sources and 

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Pokémon", "Ratings" ×4 — a.on → #meta (2 hidden until opened) — hooks: none
- [ ] "Tournaments" ×2 — a → #tournaments (1 hidden until opened) — hooks: none
- [ ] "Usage" ×2 — a → #usage (1 hidden until opened) — hooks: none
- [ ] "Popular Sets" ×2 — a → #sets (1 hidden until opened) — hooks: none
- [ ] "?" ×2 — button:button.sg2-tip — hooks: `data-v2tip` (sugs.js:277, sugs.js:278)
- [ ] "How Ratings Work ›" — a.np-link → #method=rating — hooks: none
- [ ] "Track Record ›" — a.np-link → #track — hooks: none
- [ ] "Find a Pokémon or type" — input:search — hooks: `data-raq` (meta.js:81, meta.js:112)
- [ ] "Clear" — button:button.np-clr (1 hidden until opened) — hooks: `data-v2clr` (build-plot.js:56)
- [ ] "All", "Megas", "No Megas" ×5 — button:button.ra-chip — hooks: `data-raflag` (meta.js:80, meta.js:82)
- [ ] "Types 18" — button:button.ra-chip — hooks: `data-ratypes` (meta.js:83, meta.js:115)
- [ ] "Pokémon Page" — button:button.np-btn — hooks: `data-v2mon` (meta.js:22, meta.js:41)
- [ ] "Build Around It" — button:button.np-btn2 — hooks: `data-hmaround` (meta.js:65)
- [ ] "Grandstand", "List with win rates" ×2 — button:button.ra-chip — hooks: `data-raview` (meta.js:87, meta.js:87)
- [ ] "See All 11 ›", "See All 18 ›", "See All 20 ›" ×5 — button:button.np-link.gs-ball (2 hidden until opened) — hooks: `data-ratier` (meta.js:53, meta.js:96)
- [ ] "Sneasler 97", "Rillaboom 97" ×2 — button:button.gs-mon.one — hooks: `data-v2mon` (meta.js:22, meta.js:41), `data-raspot` (meta.js:22, meta.js:41)
- [ ] "Kingambit 96", "Incineroar 95", "MEGA Charizard Y 94" ×44 — button:button.gs-mon (12 hidden until opened) — hooks: `data-v2mon` (meta.js:22, meta.js:41), `data-raspot` (meta.js:22, meta.js:41)
- [ ] "Show D and F tiers › 295 more Pokémon, rated under" — button:button.tr-more.gs-foldbtn — hooks: `data-ralow` (meta.js:49, meta.js:128)
- [ ] "About the ratings How they are made, the 4 data so" — summary — hooks: none
- [ ] "See All 275 ›" — button:button.np-link (desktop 1440 only) — hooks: `data-ratier`

### Numbers and facts shown (sample, 390 with a team)

- [ ] Every Pokémon rated 0–100 from real tournament results, not opinion.
- [ ] Reg M‑C doubles · 13,631 tournament teams?
- [ ] 345 rated
- [ ] #1 right now
- [ ] On 37.6% of tournament teams
- [ ] S tier, 90+ · Top of the format · 11 Pokémon, ranked among 321 with results
- [ ] See All 11 ›
- [ ] A tier, 80+ · Strong, proven picks · 18 Pokémon
- [ ] See All 18 ›
- [ ] ▲5
- [ ] ▼2
- [ ] ▲2
- [ ] B tier, 70+ · Solid with the right team · 11 Pokémon
- [ ] ▲3
- [ ] C tier, 60+ · Niche or team-dependent · 10 Pokémon
- [ ] 10 Pokémon
- [ ] 295 more Pokémon, rated under 60
- [ ] How they are made, the 4 data sources and their track record
- [ ] 32 bare numbers on their own lines (stats, scores, counts), e.g. 2, 18, 97, 37.6%, 51.9%, 120, 90+, 96

### States

- [ ] Empty team (six empty slots): 2893 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): no data, empty
- [ ] Remembered settings (localStorage): `cc2.chf.raabout`
- [ ] Sub-addresses / links with a part: `#method=rating`
- [ ] ARIA roles drawn: status, group

### Drawing functions (where in today's code)

<details><summary>meta.js: 19 functions</summary>

- `V2.raUi` (meta.js:7): the four numbers, sources). The numbers are today's shared logic: lairRows, lairRank, lairHead, lTier, isGem, ratingTrack.
- `V2.raLoad` (meta.js:8)
- `V2.raSave` (meta.js:9)
- `V2.raFilter` (meta.js:10)
- `V2.raFiltered` (meta.js:13)
- `V2.raOnTeam` (meta.js:14)
- `V2.raNums` (meta.js:15)
- `V2.raGames` (meta.js:16)
- `V2.raTierHead` (meta.js:18)
- `V2.raRow` (meta.js:20)
- `V2.raPct` (meta.js:28)
- `V2.gsShare` (meta.js:31): the spoken label stays complete ("On 37.7% of tournament teams"); the page still names its base (Ratings kicker, Usage chips)
- `V2.gsWeek` (meta.js:35): leaves no lone slot), two rows at most (Sim, Nov 14, Q1 B; D two, F one); a shorter last row is centred; more than fits = "See all N ›" (remembered).
- `V2.gsLay` (meta.js:36)
- `V2.gsMon` (meta.js:38)
- `V2.gsStand` (meta.js:47): a class, no redraw, focus stays). 700+ is unchanged; the page redraws when the width crosses 700
- `V2.gsLowTx` (meta.js:56)
- `V2.raSpot` (meta.js:58): the spotlight: #1 (or the top Mega in the Megas view) by default; on a mouse screen the Pokémon under the pointer steps up here
- `V2.raFiltered2` (meta.js:68): the stand shows everyone, the Megas view and No Megas; search, types, hidden gems and the box keep the list until Sim has seen them (brief section 7)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/C-battle.mjs: `data-raabout`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.ra-tier` `.ra-row` `.gs-mg` `.gs-mon` `.ra-tg` `.gs-spot` `.gs-big` `.ra-count` `.ra-types` `.ra-list` `.ra-board` `data-tier` `data-ratier` `data-raflag` `data-raq` `data-ratypes` `data-raty` `data-raview`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#meta`)
- [ ] app/test/v2-minors.mjs (opens `#meta`): `.gs-mon` `.gs-tx` `.gs-sc` `.gs-mine` `.gs-row` `.gs-rows` `.gs-spot` `.ra-spot` `.gs-facts` `.ra-count` `.ra-legend` `data-raq`
- [ ] app/test/v2-q21.mjs (opens `#meta`): `.ra-q` `data-raflag` `data-raq` `data-raspotw`
- [ ] app/test/v2-q42.mjs: `.gs-mon`
- [ ] app/test/v2-q60.mjs (opens `#meta`): `.gs-mon` `.gs-step` `.gs-blk` `.gs-bw` `.gs-bd` `.gs-main` `.gs-wd` `data-ralow` `data-ratier`
- [ ] app/test/v2-q72.mjs: `.gs-mg`
- [ ] app/test/v2-q84.mjs (opens `#meta`)
- [ ] app/test/v2-today.mjs: `.gs-mon` `.gs-sc` `.gs-rows` `.ra-spot` `.gs-big`
- [ ] app/test/v2-unbounded.mjs: `.gs-mg` `.gs-tx` `.gs-sinfo`
- [ ] app/test/v2-usagepicks.mjs: `.ra-spot` `.gs-facts`

## 14. Usage (`#usage`)

- Files: app/src/v2/pages/usage.js (117 lines). Registered at usage.js:77.
- Browser title: "Usage · NastyPlot". Phone height at 390: **3575 px** with a team, **3674 px** with an empty team; desktop 1440: 2326 px. No page errors.
- What usage.js says it is: Meta > Pokémon > Usage (Nov 14): "Who gets picked right now." (Sim's Grandstand brief, section 4) The Podium (1, 2, 3 on blocks; 4 to 10 on benches), "How <Pokémon> is played" (bars), "Usually alongside", Add to team, Ranks 11–60. Every feature of today's Usage (meta-features.md META-01..07) is here, from today's shared logic: S…

### Sections, in order (built page, 390)

- [ ] H1: Who gets picked right now.
- [ ] H2: Rillaboom
- [ ] H2: The Podium
- [ ] H2: How Rillaboom is played
- [ ] H3: Usually alongside

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Meta · Usage
- [ ] nav.ra-tabs [Meta] : 
- [ ] nav.ra-seg [Pokémon views] : 
- [ ] div.ra-filt [Source] : 
- [ ] section.us-how : How Rillaboom is played

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Pokémon" ×2 — a.on → #meta (1 hidden until opened) — hooks: none
- [ ] "Tournaments" ×2 — a → #tournaments (1 hidden until opened) — hooks: none
- [ ] "Ratings" ×2 — a → #meta (1 hidden until opened) — hooks: none
- [ ] "Usage" ×2 — a.on → #usage (1 hidden until opened) — hooks: none
- [ ] "Popular Sets" ×2 — a → #sets (1 hidden until opened) — hooks: none
- [ ] "Ratings ›" — a.np-link → #meta — hooks: none
- [ ] "Popular Sets ›" — a.np-link → #sets — hooks: none
- [ ] "Pokémon Page" — button:button.np-btn — hooks: `data-v2mon` (usage.js:54, usage.js:69)
- [ ] "Find a Pokémon in the ranks" — input:search — hooks: `data-usq` (usage.js:85, usage.js:102)
- [ ] "Clear" — button:button.np-clr (1 hidden until opened) — hooks: `data-v2clr` (build-plot.js:56)
- [ ] "Ranked ladder", "Online tournaments", "Showdown ladder" ×3 — button:button.ra-chip — hooks: `data-ussrc` (usage.js:86, usage.js:104)
- [ ] "2 #2 Sneasler 37.7% 3,136 teams ▲1 place", "1 #1 Rillaboom 38.1% 3,172 teams ▼1 place", "3 #3 Incineroar 32.9% 2,733 teams" ×3 — button:button.us-fig.pod — hooks: `data-uspick` (usage.js:33, usage.js:104)
- [ ] "#4 Kingambit 25.7% 2,135 teams", "#5 MEGA Charizard Y 21.9% 1,824 teams ▲1 place", "#6 Archaludon 19.8% 1,649 teams ▼5 places" ×7 — button:button.us-fig.bench — hooks: `data-uspick` (usage.js:33, usage.js:104)
- [ ] "3 more moves ›", "2 more items ›", "3 more teammates ›" ×4 — button:button.np-link.us-more — hooks: `data-usmore` (usage.js:44, usage.js:110), `data-n` (usage.js:44)
- [ ] "Incineroar 52% of its teams", "MEGA Raichu Y 37% of its teams", "Sneasler 33% of its teams" ×6 — button:button.gs-mon (3 hidden until opened) — hooks: `data-v2mon` (usage.js:54, usage.js:69)
- [ ] "Ranks 11–60 ›" — button:button.np-link.us-rest — hooks: `data-usrest` (usage.js:98, usage.js:104)

### Numbers and facts shown (sample, 390 with a team)

- [ ] #1
- [ ] On 38.1% of online tournament teams
- [ ] Rated 97 · S tier
- [ ] Limitless team sheets · 8,319 teams from 223 Reg M-C tournaments · Oct 12 – Nov 9
- [ ] #2
- [ ] 3,136 teams
- [ ] ▲1 place
- [ ] 3,172 teams
- [ ] ▼1 place
- [ ] #3
- [ ] 2,733 teams
- [ ] #4
- [ ] 2,135 teams
- [ ] #5
- [ ] 1,824 teams
- [ ] #6
- [ ] 1,649 teams
- [ ] ▼5 places
- [ ] #7
- [ ] 1,641 teams
- [ ] #8
- [ ] 1,552 teams
- [ ] ▲2 places
- [ ] #9
- [ ] 1,429 teams
- [ ] #10
- [ ] 1,405 teams
- [ ] MOVES of 3,172 teams
- [ ] 3 more
- [ ] ITEMS of 3,172 teams
- [ ] 26 bare numbers on their own lines (stats, scores, counts), e.g. 38.1%, 48.0%, 2, 37.7%, 1, 3, 32.9%, 25.7%

### States

- [ ] Empty team (six empty slots): 3674 px at 390. Same headings as with a team (the page does not depend on the team, height differs).
- [ ] State words in the code (each needs its look in the kit): empty, no data
- [ ] ARIA roles drawn: group

### Drawing functions (where in today's code)

<details><summary>usage.js: 19 functions</summary>

- `V2.usUi` (usage.js:8): page) still starts on Ranked ladder. Tapping a chip still sets ui.metaSrc as well, as it did before.
- `V2.usDoc` (usage.js:9)
- `V2.usAs` (usage.js:11): shared helpers that read ui.metaSrc (trendFor's badges) see Usage's own source while they run, then it is put back
- `V2.usSrcs` (usage.js:12)
- `V2.usLine` (usage.js:13)
- `V2.usNext` (usage.js:17): of the next), so its line says when the next month arrives: ". November's numbers arrive Dec 1." Shown only until that date (as V2.homeNext).
- `V2.usRow` (usage.js:21): one rank of the list, filled in as today: a ranked-ladder row with no sets borrows the tournament set (and says how many teams it is from)
- `V2.usName` (usage.js:25)
- `V2.usNums` (usage.js:26)
- `V2.usLabel` (usage.js:27)
- `V2.usNameB` (usage.js:31): other bench names get an empty tag line on phones (us-nomg), so every bench row's numbers sit level whatever the names.
- `V2.usFig` (usage.js:33)
- `V2.usMoreIn` (usage.js:43): no-break space after "more" keeps 3px before the ›, as "Ratings ›" (the spoken text stays "3 more moves ›")
- `V2.usMoreB` (usage.js:44)
- `V2.usCut` (usage.js:45)
- `V2.usBars` (usage.js:46)
- `V2.usHow` (usage.js:49)
- `V2.usSpot` (usage.js:65): screen reader; the key line under The Podium says it in words), never another list's number (was V2.raNums, Online tournaments).
- `V2.usKey` (usage.js:75): borrowed source. Each new line is shorter than the line it replaces for that source.

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/A-team.mjs: `data-ussrc`
- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `.us-mates`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.gs-mg` `.us-tx` `.us-rk` `.gs-mon` `.gs-spot` `.us-src` `data-uspick` `data-ushow` `data-usq` `data-ussrc` `data-usrest`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#usage`)
- [ ] app/test/v2-minors.mjs (opens `#usage`): `.us-fig` `.us-tx` `.us-nums` `.gs-row` `.gs-mon` `.gs-tx` `.gs-spot` `.ra-spot` `.gs-facts` `.us-srcs` `.us-src` `.gs-key` `data-ussrc`
- [ ] app/test/v2-pksrc.mjs (opens `#usage`)
- [ ] app/test/v2-q21.mjs: `.ra-q`
- [ ] app/test/v2-q42.mjs (opens `#usage`): `.us-more` `.us-bars` `.us-bar` `.us-mates` `.us-bench` `.gs-mon` `.us-how` `.us-groups` `.us-also` `data-usmore`
- [ ] app/test/v2-q60.mjs: `.gs-mon`
- [ ] app/test/v2-q72.mjs: `.gs-mg` `.us-tx` `.us-nums` `.us-more` `.us-bench` `.us-benches`
- [ ] app/test/v2-today.mjs: `.gs-mon` `.ra-spot`
- [ ] app/test/v2-unbounded.mjs: `.us-pct` `.gs-mg` `.us-mg` `.us-tx` `.gs-tx` `.gs-sinfo`
- [ ] app/test/v2-usagepicks.mjs (opens `#usage`): `.us-tx` `.us-nums` `.ra-spot` `.gs-facts` `.us-src` `.gs-key` `data-uspick` `data-ussrc`

## 15. Popular Sets (`#sets`)

- Files: app/src/v2/pages/sets.js (66 lines). Registered at sets.js:35.
- Browser title: "Popular Sets · NastyPlot". Phone height at 390: **3148 px** with a team, **2833 px** with an empty team; desktop 1440: 2031 px. No page errors.
- What sets.js says it is: Meta > Pokémon > Sets (Nov 14): "How it's built right now." (Sim's Grandstand brief, section 5) Look up a Pokémon (remembered, cc2.setMon), the source switch Best data / Online tournaments / Showdown ladder (remembered, cc2.setSrc), "Your team" on a bench (the one viewed lit blue), "How <Pokémon> is built" (Your line, moves bars…

### Sections, in order (built page, 390)

- [ ] H1: How it's built right now.
- [ ] H2: Mega Charizard Y
- [ ] H2: Your Team
- [ ] H2: How Mega Charizard Y is built
- [ ] H3: Usually alongside

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Meta · Sets
- [ ] nav.ra-tabs [Meta] : 
- [ ] nav.ra-seg [Pokémon views] : 
- [ ] div.ra-filt [Doubles data source] : 
- [ ] section.st-team : Your Team
- [ ] section.us-how : How Mega Charizard Y is built
- [ ] section.us-mates : Teammates

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Pokémon" ×2 — a.on → #meta (1 hidden until opened) — hooks: none
- [ ] "Tournaments" ×2 — a → #tournaments (1 hidden until opened) — hooks: none
- [ ] "Ratings" ×2 — a → #meta (1 hidden until opened) — hooks: none
- [ ] "Usage" ×2 — a → #usage (1 hidden until opened) — hooks: none
- [ ] "Popular Sets" ×2 — a.on → #sets (1 hidden until opened) — hooks: none
- [ ] "Ratings ›" — a.np-link → #meta — hooks: none
- [ ] "Usage ›" — a.np-link → #usage — hooks: none
- [ ] "Pokémon Page" — button:button.np-btn — hooks: `data-v2mon` (sets.js:25)
- [ ] "Build Around It" — button:button.np-btn2 — hooks: `data-hmaround` (sets.js:25)
- [ ] "Look up a Pokémon" — input:search — hooks: `data-stq` (sets.js:42, sets.js:58)
- [ ] "Clear" — button:button.np-clr (1 hidden until opened) — hooks: `data-v2clr` (build-plot.js:56)
- [ ] "Best data", "Online tournaments", "Showdown ladder" ×3 — button:button.ra-chip — hooks: `data-v2setsrc` (sets.js:44, sets.js:61)
- [ ] "MEGA Charizard Y" — button:button.gs-mon.on — hooks: `data-v2setmon` (sets.js:18, sets.js:43)
- [ ] "Garchomp", "Incineroar", "Whimsicott" ×11 — button:button.gs-mon — hooks: `data-v2setmon` (sets.js:18, sets.js:43)

### Numbers and facts shown (sample, 390 with a team)

- [ ] Rated 94, #5 of 321
- [ ] On 16.9% of tournament teams
- [ ] Showdown ladder, 1630+ rating (this Mega)
- [ ] Modest: 2 HP / 32 SpA / 32 Spe
- [ ] Timid: 2 HP / 32 SpA / 32 Spe
- [ ] Timid: 22 HP / 19 Def / 2 SpA / 23 Spe
- [ ] Stat points from the Showdown ladder 1630+: tournament team lists don't include them.
- [ ] 13 bare numbers on their own lines (stats, scores, counts), e.g. 94, 16.9%, 53.7%, 100, 99%, 93%, 51%, 30%

### States

- [ ] Empty team (six empty slots): 2833 px at 390. Shows: H2: Sneasler / H2: How Sneasler is built. Drops: H2: Mega Charizard Y / H2: Your Team / H2: How Mega Charizard Y is built.
- [ ] State words in the code (each needs its look in the kit): no data
- [ ] Remembered settings (localStorage): `cc2.setSrc`, `cc2.setMon`
- [ ] ARIA roles drawn: listbox, group

### Drawing functions (where in today's code)

<details><summary>sets.js: 8 functions</summary>

- `V2.stUi` (sets.js:6): setSources, rankLine, rankTxt (src/app/21-sets.js, 02-set-data.js, 24-sheet-data.js).
- `V2.stMon` (sets.js:7)
- `V2.setSrcName` (sets.js:13): audit v199 #9 (Nov 17): the word list's source names, the same as Usage's chips (today's shared SET_SRC keeps 'Tournaments' / 'Showdown')
- `V2.stSet` (sets.js:14)
- `V2.stBench` (sets.js:17)
- `V2.stFig` (sets.js:18)
- `V2.stSpot` (sets.js:20)
- `V2.stSpreads` (sets.js:29): META.doubles .sp) has them: tournament team lists carry no stat points (data-inventory-nov17.md), so the line says where they're from.

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `.us-mates` `.st-how` `data-v2setmon` `data-stq` `data-v2setsrc`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.gs-mon` `.gs-mg` `.gs-spot` `.gs-big` `.st-hits` `.us-src` `.st-how` `data-v2setmon` `data-stq` `data-v2setsrc`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#sets`)
- [ ] app/test/v2-minors.mjs (opens `#sets`): `.gs-row` `.gs-mon` `.gs-tx` `.gs-spot` `.ra-spot` `.gs-facts` `.st-sp` `.us-srcs` `.us-src` `.st-side`
- [ ] app/test/v2-q21.mjs: `.ra-q`
- [ ] app/test/v2-q42.mjs: `.us-bench` `.gs-mon` `.us-bars` `.us-mates` `.us-how`
- [ ] app/test/v2-q60.mjs: `.gs-mon`
- [ ] app/test/v2-q72.mjs: `.us-bench` `.gs-mg`
- [ ] app/test/v2-today.mjs: `.gs-mon` `.ra-spot` `.gs-big` `.tier-tag`
- [ ] app/test/v2-unbounded.mjs: `.gs-tx` `.gs-mg` `.gs-sinfo`
- [ ] app/test/v2-usagepicks.mjs: `.ra-spot` `.gs-facts` `.us-src`

## 16. Archetypes (`#archetypes`)

- Files: app/src/v2/pages/archetypes.js (55 lines). Registered at archetypes.js:44.
- Browser title: "Archetypes · NastyPlot". Phone height at 390: **2536 px** with a team, **2339 px** with an empty team; desktop 1440: 1846 px. No page errors.
- What archetypes.js says it is: Meta > Tournaments > Archetypes (Nov 15): Sim's pick "The Weather Map" (docs/rebuild/mocks/tournaments-tickets-weather/BRIEF.md) Everything today's Archetypes tab does (42-archetype-guides.js renderGuides), from the same shared helpers: guideCounts (how many of the latest top teams play each style), guideKeyMons, guideYours, GUI…

### Sections, in order (built page, 390)

- [ ] H1: What you'll face, style by style.
- [ ] H2: The Weather Map

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Meta · Tournaments · Archetypes
- [ ] nav.ra-tabs [Meta] : 
- [ ] nav.ra-seg [Tournament views] : 
- [ ] aside.ev-plate [Your team's style] : 
- [ ] section.ar-map [The Weather Map: the eight team styles, biggest first] : 

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Pokémon" ×2 — a → #meta (1 hidden until opened) — hooks: none
- [ ] "Tournaments" ×2 — a.on → #tournaments (1 hidden until opened) — hooks: none
- [ ] "Winning Teams" ×2 — a → #tournaments (1 hidden until opened) — hooks: none
- [ ] "Events" ×2 — a → #events (1 hidden until opened) — hooks: none
- [ ] "Archetypes" ×2 — a.on → #archetypes (1 hidden until opened) — hooks: none
- [ ] "This Week" ×2 — a → #weekly (1 hidden until opened) — hooks: none
- [ ] "No. 1 Your style Tailwind 52% of top teams 47 of 9", "No. 2 Your style Sun 41% of top teams 37 of 90", "No. 3 Your style Grassy Terrain 29% of top teams 2" ×8 — button:button.ar-reg.wx — hooks: `data-argo` (archetypes.js:19, archetypes.js:38)

### Numbers and facts shown (sample, 390 with a team)

- [ ] From the latest 90 top tournament teams
- [ ] of top teams also play Tailwind, 47 of 90
- [ ] of top teams also play Sun, 37 of 90
- [ ] of top teams also play Grassy Terrain, 26 of 90
- [ ] No. 1
- [ ] 47 of 90
- [ ] No. 2
- [ ] 37 of 90
- [ ] No. 3
- [ ] 26 of 90
- [ ] No. 4
- [ ] 18 of 90 teams
- [ ] No. 5
- [ ] 12 of 90 teams
- [ ] No. 6
- [ ] 11 of 90
- [ ] No. 7
- [ ] 7 of 90
- [ ] No. 8
- [ ] A team can count for more than one style, so the regions add up to more than 90 teams.
- [ ] 7 bare numbers on their own lines (stats, scores, counts), e.g. 52%, 41%, 29%, 20%, 13%, 12%, 8%

### States

- [ ] Empty team (six empty slots): 2339 px at 390. Same headings as with a team (the page does not depend on the team, height differs).

### Drawing functions (where in today's code)

<details><summary>archetypes.js: 10 functions</summary>

- `V2.arUi` (archetypes.js:9): "Your style" tags, the ranks "No. 1" to "No. 8", and the names "The Weather Map", "Other styles", "‹ Back to the Weather Map".
- `V2.WX` (archetypes.js:10)
- `V2.arData` (archetypes.js:11)
- `V2.arMine` (archetypes.js:15): the styles your own team plays, read with the team's game-plan labels (teamPlanLabel), matched to the guide styles
- `V2.arScene` (archetypes.js:17)
- `V2.arRegion` (archetypes.js:18)
- `V2.arHeights` (archetypes.js:26): always means more teams; widths in a row follow the counts. Phones use their own full-width rows (CSS), where the same holds.
- `V2.arMap` (archetypes.js:28)
- `V2.arGuide` (archetypes.js:31)
- `V2.arPlate` (archetypes.js:41): the plate at the top right: the styles your team plays and how many top teams play them too

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `.ar-reg` `.ar-nm` `.ar-guide` `data-argo`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs (opens `#archetypes`): `.ar-nm` `.ar-guide` `.ar-gh` `data-argo`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#archetypes`)
- [ ] app/test/tap-size.mjs: `.ar-none`
- [ ] app/test/v2-q33.mjs: `.ev-wh`
- [ ] app/test/v2-unbounded.mjs: `.ar-rk` `.ar-you`

## 17. Winning Teams (`#tournaments`)

- Files: app/src/v2/pages/winning.js (123 lines). Registered at winning.js:68.
- Browser title: "Winning Teams · NastyPlot". Phone height at 390: **3386 px** with a team, **3331 px** with an empty team; desktop 1440: 1922 px. No page errors.
- What winning.js says it is: Sim Q8 (Nov 15): one tab row for the four Tournaments views, This Week added as the fourth (it was only reachable from Home's closed fold)

### Sections, in order (built page, 390)

- [ ] H1: The teams that won it.
- [ ] H2: The Winning Hands
- [ ] H3: Champion
- [ ] H3: Gholdengo
- [ ] H3: Excadrill
- [ ] H3: Mega Tyranitar
- [ ] H3: Mega Staraptor
- [ ] H3: Sinistcha
- [ ] H3: Milotic
- [ ] H3: Challenger · 2nd place
- [ ] H3: Mega Garchomp
- [ ] H3: Sneasler
- [ ] H3: Mega Floette
- [ ] H3: Incineroar
- [ ] H3: Rillaboom
- [ ] H3: Kingambit
- [ ] H3: Challenger · 3rd place
- [ ] H3: Kingambit
- [ ] H3: Sneasler
- [ ] H3: Mega Salamence
- [ ] H3: Basculegion
- [ ] H3: Mega Charizard Y
- [ ] H3: Whimsicott

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Meta · Tournaments · Winning Teams
- [ ] nav.ra-tabs [Meta] : 
- [ ] nav.ra-seg [Tournament views] : 
- [ ] div.ra-filt [Which teams] : 
- [ ] section.wt-hands : The Winning Hands
- [ ] article.wt-hand [Champion] : Champion
- [ ] article.wt-hand [Challenger · 2nd place] : Challenger · 2nd place
- [ ] article.wt-hand [Challenger · 3rd place] : Challenger · 3rd place

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Pokémon" ×2 — a → #meta (1 hidden until opened) — hooks: none
- [ ] "Tournaments", "Winning Teams" ×4 — a.on → #tournaments (2 hidden until opened) — hooks: none
- [ ] "Events" ×2 — a → #events (1 hidden until opened) — hooks: none
- [ ] "Archetypes" ×2 — a → #archetypes (1 hidden until opened) — hooks: none
- [ ] "This Week" ×2 — a → #weekly (1 hidden until opened) — hooks: none
- [ ] "CHARIZARD YCHARIZARD Y Mega Charizard Y", "GARCHOMPGARCHOMP Garchomp", "INCINEROARINCINEROAR Incineroar" ×30 — button:button.wt-card (12 hidden until opened) — hooks: `data-v2mon` (winning.js:19)
- [ ] "Search winning teams by Pokémon, item, move or abi" — input:search — hooks: `data-wtq` (winning.js:44, winning.js:112)
- [ ] "Clear" — button:button.np-clr (1 hidden until opened) — hooks: `data-v2clr` (build-plot.js:56)
- [ ] "Official events 32" — button:button.ra-chip — hooks: `data-wtgrp` (winning.js:80, winning.js:97), `events` ((drawn by shared code))
- [ ] "Last 7 days 58" — button:button.ra-chip — hooks: `data-wtgrp` (winning.js:80, winning.js:97), `7` ((drawn by shared code)), `days` ((drawn by shared code))
- [ ] "Load Team" ×3 — button:button.np-btn2 — hooks: `data-wtask` (winning.js:22, winning.js:97)
- [ ] "Copy for Showdown" ×3 — button:button.np-btn2 — hooks: `data-wtcopy` (winning.js:22, winning.js:97)
- [ ] "Set as Opponent ›" ×3 — button:button.np-link — hooks: `data-wtvs` (winning.js:22, winning.js:97)
- [ ] "Compare ›" ×3 — button:button.np-link — hooks: `data-cxgo2` (winning.js:22, winning.js:55)
- [ ] "More Winning Teams · 32 in all ›" — button:button.np-link.wt-open — hooks: `data-wtmore` (winning.js:87, winning.js:88)

### Numbers and facts shown (sample, 390 with a team)

- [ ] 90 top-cut teams · 32 from official events · 58 from the last 7 days
- [ ] Last 7 days
- [ ] Top 4 from online tournaments with 32+ players, top 8 from official events
- [ ] 3/4
- [ ] 2027 Gdańsk Pokémon Regional Championships · 758 players. Tap a card for its page.
- [ ] 3/4 checks, missing weak spots spread out
- [ ] Challenger · 2nd place
- [ ] 4/4 checks
- [ ] Challenger · 3rd place
- [ ] More Winning Teams · 32 in all ›
- [ ] 5 bare numbers on their own lines (stats, scores, counts), e.g. 32, 58, 1, 2, 3

### States

- [ ] Empty team (six empty slots): 3331 px at 390. Same headings as with a team (the page does not depend on the team, height differs).
- [ ] State words in the code (each needs its look in the kit): failed
- [ ] ARIA roles drawn: group, combobox, listbox, option

### Drawing functions (where in today's code)

<details><summary>winning.js: 20 functions</summary>

- `V2.tourTabs` (winning.js:2): Sim Q8 (Nov 15): one tab row for the four Tournaments views, This Week added as the fourth (it was only reachable from Home's closed fold)
- `V2.wtUi` (winning.js:9): The top three teams of the chosen group are fanned hands of Cards (V2.msCard, the Card of the info sheet and My Team); the rest are rows.
- `V2.wtList` (winning.js:10)
- `V2.wtGroups` (winning.js:11)
- `V2.wtPlace` (winning.js:12)
- `V2.wtOfficial` (winning.js:13)
- `V2.wtChecks` (winning.js:14)
- `V2.wtChips` (winning.js:16): today's style names (teamPlanLabel), as plain chips: archChips writes its own colours 
- `V2.wtCard` (winning.js:18): one Card: tap opens the Pokémon's info sheet (as everywhere a Card is shown)
- `V2.wtActs` (winning.js:20): stress test (Nov 16): three cards' buttons had the same names; each names its team, starting with the visible words 
- `V2.wtTag` (winning.js:23)
- `V2.wtHand` (winning.js:25): a hand: the top three of a group (place 1 big; 2 and 3 smaller)
- `V2.wtRow` (winning.js:31): a row: every team after the third
- `V2.wtYours` (winning.js:36): Your Team, in the header spotlight (today's strip: checks as the Team page grades them, style chips, the six)
- `V2.wtSearch` (winning.js:42): team search (today's TOP-02 / TOP-03): suggestions by kind and count, chips, "Often with", matching teams
- `V2.wtSug` (winning.js:45)
- `V2.wtResults` (winning.js:48)
- `V2.wtFit` (winning.js:63): champion names ran under the next card); shrink a name 1px at a time, never below 13px. Runs after every draw (safe to repeat) and on resize.
- `V2.wtLoad` (winning.js:92): ---- actions ----
- `V2.wtMark` (winning.js:116): the matches are not Tab stops

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `data-hmcopy`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `data-wtload` `data-wtask` `data-tsx` `data-hmload` `data-tsadd`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#tournaments`)
- [ ] app/test/v2-minors.mjs (opens `#tournaments`): `.wt-find` `data-wtq` `data-hmprep`
- [ ] app/test/v2-q83.mjs: `data-hmload` `data-hmcopy` `data-hmprep`
- [ ] app/test/v2-unbounded.mjs: `.wt-spot`

## 18. Events (`#events`)

- Files: app/src/v2/pages/events.js (104 lines). Registered at events.js:63.
- Browser title: "Events · NastyPlot". Phone height at 390: **3684 px** with a team, **3684 px** with an empty team; desktop 1440: 2541 px. No page errors.
- What events.js says it is: Nov 15: every event name shown here goes through the shared cleaner V2.evTitle (raw names had emoji and prize text, up to 9 lines at 320) Meta > Tournaments > Events (Nov 15): Sim's pick "The Ticket Wall" (docs/rebuild/mocks/tournaments-tickets-weather/BRIEF.md) Everything today's Events tab does (49-events.js renderEvents + 63-…

### Sections, in order (built page, 390)

- [ ] H1: Every result, event by event.
- [ ] H2: The Ticket Wall
- [ ] H3: ValkrixVGC Champions League #09
- [ ] H2: Next Events

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Meta · Tournaments · Events
- [ ] nav.ra-tabs [Meta] : 
- [ ] nav.ra-seg [Tournament views] : 
- [ ] section.ev-wall : The Ticket Wall
- [ ] div.ev-f [Which events] : 
- [ ] article.tk [Latest result. ValkrixVGC Champions League #09, Nov 8, 57 pl] : ValkrixVGC Champions League #09
- [ ] p.ev-ns [Events counted] : 
- [ ] details.ev-what : What counts as an event?
- [ ] aside.ev-plate [Next events] : Next Events

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Pokémon" ×2 — a → #meta (1 hidden until opened) — hooks: none
- [ ] "Tournaments" ×2 — a.on → #tournaments (1 hidden until opened) — hooks: none
- [ ] "Winning Teams" ×2 — a → #tournaments (1 hidden until opened) — hooks: none
- [ ] "Events" ×2 — a.on → #events (1 hidden until opened) — hooks: none
- [ ] "Archetypes" ×2 — a → #archetypes (1 hidden until opened) — hooks: none
- [ ] "This Week" ×2 — a → #weekly (1 hidden until opened) — hooks: none
- [ ] "All 115", "Official 8", "100+ players 25" ×3 — button:button.np-chip.ev-fc — hooks: `data-evf` (events.js:77, events.js:88)
- [ ] "See the placings, 1st to 8th ›" — button:button.tk-go — hooks: `data-evgo` (events.js:21, events.js:23)
- [ ] "What counts as an event?" — summary — hooks: none
- [ ] "20 NOV Latin America International (LAIC) Nov 20–2", "21 NOV Malaysia Premier Ball League Nov 21 · Kuala" ×2 — a.ev-crow → https://victoryroad.pro/2027-laic/ — hooks: none
- [ ] "Show All 30 ›" — button:button.np-link.ev-call — hooks: `data-evcal` (events.js:37, events.js:88)
- [ ] "Gdańsk Regional Results ›", "Puebla Regional Results ›" ×2 — button:button.np-link — hooks: `data-evgo` (events.js:21, events.js:23)
- [ ] "Victory Road season calendar" — a → https://victoryroad.pro/2027-season-cale — hooks: none
- [ ] "1st WINNER'S TEAM Trinity Championship 18 (Double ", "1st WINNER'S TEAM Sketch Academy Sunday Regulation", "1st WINNER'S TEAM Torre Lotta Cup #3 NOV 7 68 play" ×6 — button:button.tk — hooks: `data-evgo` (events.js:21, events.js:23)
- [ ] "Show More · 108 left ›" — button:button.np-link.ev-more — hooks: `data-evmore` (events.js:82, events.js:88)

### Numbers and facts shown (sample, 390 with a team)

- [ ] 100+ players
- [ ] 1st
- [ ] ValkrixVGC Champions League #09
- [ ] See the placings, 1st to 8th ›
- [ ] 57 players
- [ ] Nov 20–22 · São Paulo, Brazil
- [ ] Nov 21 · Kuala Lumpur, Malaysia
- [ ] Show All 30 ›
- [ ] Trinity Championship 18 (Double Format)
- [ ] 48 players
- [ ] 44 players
- [ ] Torre Lotta Cup #3
- [ ] 68 players
- [ ] 59 players
- [ ] 47 players
- [ ] Show More · 108 left ›
- [ ] 7 bare numbers on their own lines (stats, scores, counts), e.g. 115, 8, 25, 107, 20, 21, 7

### States

- [ ] Empty team (six empty slots): 3684 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): empty, failed
- [ ] ARIA roles drawn: group

### Drawing functions (where in today's code)

<details><summary>events.js: 13 functions</summary>

- `V2.evUi` (events.js:9): Pokémon (our --ty-* tokens, each measured 4.6:1 or better with white text), an official event's ticket is gold.
- `V2.evSrc` (events.js:10)
- `V2.evTy` (events.js:12)
- `V2.evMonth` (events.js:13)
- `V2.evDay` (events.js:14)
- `V2.ticket` (events.js:16): one ticket. big: the latest result across the wall. The five other Pokémon are pictures here; their names are in the label and the placings.
- `V2.evCal` (events.js:28): Next Events (today's calendarHTML: the next events with a countdown, Show all, the recent official ones with results, the source)
- `V2.evPlate` (events.js:40): the plate at the top right: counted this regulation, what counts, Next Events
- `V2.evCounts` (events.js:44): say it once (Nov 16, re-verify #2): the counts sit under the headline (they were said twice, and the left column stood half empty beside the tall plat
- `V2.evActs` (events.js:49): an event opened: its placings, each with today's actions (Load Team, Sets, Set as Opponent, Compare, Copy for Showdown)
- `V2.evRow` (events.js:52)
- `V2.evOpen` (events.js:57)
- `V2.evScrollTo` (events.js:86): bring an opened event (or, on the way back, its card) just under the sticky header, once the page has drawn

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.tk-go` `.ev-cd` `.ev-cw` `.ev-crow` `.ev-cal` `.ev-ph` `.ev-open` `.ev-wall` `data-evgo` `data-evload` `data-evask` `data-evf`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#events`)
- [ ] app/test/v2-minors.mjs (opens `#events`): `.ev-cal` `.ev-fc`
- [ ] app/test/v2-q31.mjs (opens `#events`): `.tk-k` `.tk-stub` `.tk-name` `.tk-wall` `.ev-wall` `.ev-more` `data-evf` `data-evmore`
- [ ] app/test/v2-q32.mjs (opens `#events`): `.tk-stub` `.tk-name` `.ev-wall`
- [ ] app/test/v2-q33.mjs (opens `#events`): `.tk-k` `.tk-stub` `.tk-name` `.tk-go` `.ev-counts` `.ev-f` `.tk-wall` `.ev-wall` `.ev-wh` `.ev-more` `data-evf` `data-evmore`
- [ ] app/test/v2-q72.mjs: `.ev-f` `.ev-fc`
- [ ] app/test/v2-q84.mjs: `.tk-k` `.tk-stub` `.tk-name` `.tk-five` `.tk-wall`
- [ ] app/test/v2-unbounded.mjs: `.tk-hero` `.tk-seal` `.tk-mid` `.tk-tag` `.ev-counts`

## 19. This Week (`#weekly`)

- Files: app/src/v2/pages/thisweek.js (69 lines). Registered at thisweek.js:29.
- Browser title: "This Week · NastyPlot". Phone height at 390: **4694 px** with a team, **4694 px** with an empty team; desktop 1440: 3149 px. No page errors.
- What thisweek.js says it is: Meta > This Week (Nov 15): Sim's pick "The Front Page" (docs/rebuild/mocks/thisweek-trackrecord/BRIEF.md) Everything today's This Week page holds (63-weekly.js renderWeekly), from the same data and shared helpers (META.weekly, WK, wkDelta, KIND, buildWeeklyCard in 63-weekly-data.js): the date range, This week / Week before count…

### Sections, in order (built page, 390)

- [ ] H1: This Week
- [ ] H2: Pokémon on the Move
- [ ] H3: Rising
- [ ] H3: Falling
- [ ] H2: Ratings on the Move
- [ ] H2: Most Used This Week
- [ ] H2: New Tech
- [ ] H2: Winners This Week
- [ ] H2: The Weather
- [ ] H2: New in Top Cut

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] nav.ra-tabs [Meta] : 
- [ ] nav.ra-seg [Tournament views] : 
- [ ] p.wk-cn [This week, Nov 3 – 9] : 
- [ ] p.wk-cn [The week before, Oct 27 – Nov 2] : 
- [ ] section.wk-move : Pokémon on the Move
- [ ] section.wk-side : Rising
- [ ] section.wk-side : Falling
- [ ] section.wk-rm : Ratings on the Move
- [ ] section.wk-top : Most Used This Week
- [ ] section.wk-tech : New Tech
- [ ] section.wk-win : Winners This Week
- [ ] section.wk-wx : The Weather
- [ ] li.wk-tile [Tailwind: 56% of teams, up 7 points from 49%] : 
- [ ] li.wk-tile [Grassy Terrain: 35% of teams] : 
- [ ] li.wk-tile [Trick Room: 31% of teams] : 
- [ ] li.wk-tile [Sun: 28% of teams] : 
- [ ] li.wk-tile [Rain: 16% of teams, down 4 points from 20%] : 
- [ ] li.wk-tile [Psychic Terrain: 15% of teams] : 
- [ ] li.wk-tile [Sand: 12% of teams] : 
- [ ] li.wk-tile [Snow: 9.0% of teams] : 
- [ ] li.wk-tile [Electric Terrain: 6.0% of teams, down 3.2 points from 9.2%] : 
- [ ] section.wk-new : New in Top Cut
- [ ] details.wk-fold : How We Decide What Changed

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Pokémon" — a → #meta — hooks: none
- [ ] "Tournaments" — a.on → #tournaments — hooks: none
- [ ] "Winning Teams" — a → #tournaments — hooks: none
- [ ] "Events" — a → #events — hooks: none
- [ ] "Archetypes" — a → #archetypes — hooks: none
- [ ] "This Week" — a.on → #weekly — hooks: none
- [ ] "Share as Image" — button:button.np-btn — hooks: `data-wkshare` (thisweek.js:35, thisweek.js:56)
- [ ] "▲ Biggest rise Whimsicott 13% → 19% of teams · ▲6 " — button:button.wk-hl.up — hooks: `data-v2mon` (thisweek.js:9, thisweek.js:12)
- [ ] "Kingambit 27% → 32% of teams ▲5 points", "Mega Staraptor 11% → 15% of teams ▲4 points", "Mega Salamence 7.9% → 12% of teams ▲4.1 points" ×6 — button:button.wk-mr — hooks: `data-v2mon` (thisweek.js:9, thisweek.js:12)
- [ ] "▼ Biggest fall Incineroar 33% → 28% of teams · ▼5 " — button:button.wk-hl.dn — hooks: `data-v2mon` (thisweek.js:9, thisweek.js:12)
- [ ] "Whimsicott ▲ 5 up Rating 88", "Mega Froslass ▲ 3 up Rating 78", "Mega Salamence ▲ 2 up Rating 87" ×3 — button:button.wk-rc.up — hooks: `data-v2mon` (thisweek.js:9, thisweek.js:12)
- [ ] "Mega Garchomp Z ▼ 2 down Rating 87" — button:button.wk-rc.dn — hooks: `data-v2mon` (thisweek.js:9, thisweek.js:12)
- [ ] "39% Sneasler of teams 1", "35% Rillaboom of teams 2", "32% Kingambit of teams 3" ×5 — button:button.wk-tm — hooks: `data-v2mon` (thisweek.js:9, thisweek.js:12)
- [ ] "?" ×3 — button:button.sg2-tip — hooks: `data-v2tip` (sugs.js:277, sugs.js:278)
- [ ] "MOVE Dragon Dance Mega Tyranitar · 37% → 61% of it", "ITEM Rocky Helmet Sinistcha · 20% → 38% of its tea", "MoveSolar BeamMega Charizard Y · 50% → 61% of its " ×4 — button:button.wk-tr (2 hidden until opened) — hooks: `data-v2mon` (thisweek.js:9, thisweek.js:12)
- [ ] "Show all 4 ›" — button:button.np-link.wk-tmore — hooks: `data-wktech` (thisweek.js:26, thisweek.js:27)
- [ ] "1st WINNER'S TEAM Sitrus-Series · Champions-MC · #", "1st Winner's teamFriday Fight Night 80!Nov6139 pla", "1st Winner's teamAlpensee Tour (Reg M-⁠C) #82Nov47" ×3 — button:button.tk (2 hidden until opened) — hooks: `data-evgo` (dispatch.js:131, events.js:21)
- [ ] "All of this week’s winners on Events ›" — a.np-link.wk-evall → #events — hooks: none
- [ ] "Arcanine #4 · Friday Fight Night 80! · 139 players", "Leafeon #1 · EXTRA LIFE - CHILDRENS HOSPITAL CHARI", "Paldean Tauros (Blaze) #5 · Intimidators Challenge" ×4 — button:button.wk-fr — hooks: `data-v2mon` (thisweek.js:9, thisweek.js:12)
- [ ] "How We Decide What Changed" — summary — hooks: none

### Numbers and facts shown (sample, 390 with a team)

- [ ] Meta · last 7 days
- [ ] TOURNAMENT TEAMS, NOV 3 – 9 AGAINST OCT 27 – NOV 2
- [ ] 13% → 19%
- [ ] of teams · ▲6 points
- [ ] 27% → 32% of teams
- [ ] ▲5 points
- [ ] 11% → 15% of teams
- [ ] ▲4 points
- [ ] 7.9% → 12% of teams
- [ ] ▲4.1 points
- [ ] 33% → 28%
- [ ] of teams · ▼5 points
- [ ] 14% → 9.6% of teams
- [ ] ▼4.4 points
- [ ] 16% → 12% of teams
- [ ] ▼4 points
- [ ] 18% → 15% of teams
- [ ] ▼3 points
- [ ] Rating 88
- [ ] Rating 78
- [ ] Rating 87
- [ ] Mega Tyranitar · 37% → 61% of its teams
- [ ] (179 Mega Tyranitar teams this week, 142 the week before)
- [ ] ▲24 points
- [ ] Sinistcha · 20% → 38% of its teams
- [ ] (203 Sinistcha teams this week, 158 the week before)
- [ ] ▲18 points
- [ ] Show all 4 ›
- [ ] 1st
- [ ] Sitrus-Series · Champions-MC · #81
- [ ] 21 bare numbers on their own lines (stats, scores, counts), e.g. 1,810, 51, 1,769, 57, 5, 3, 2, 39%

### States

- [ ] Empty team (six empty slots): 4694 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): errors
- [ ] Sliders (V2.slide keys, `v2slide` event): `wkmode`
- [ ] ARIA roles drawn: group, status

### Drawing functions (where in today's code)

<details><summary>thisweek.js: 8 functions</summary>

- `V2.wkTip` (thisweek.js:7): Changed with its full text. Same numbers, same order of sections. Rising uses the good colour, Falling the bad one.
- `V2.wkMover` (thisweek.js:8)
- `V2.wkSide` (thisweek.js:13)
- `V2.wkRates` (thisweek.js:18): "Pokémon on the Move" above it is usage share; this is the rating. Name first, then the move, then the rating (read in that order).
- `V2.wkUi` (thisweek.js:25): class without a redraw, so focus stays on the button; its state is kept for redraws (theme, data refresh).
- `V2.wkTechBtn` (thisweek.js:26)
- `V2.wkDraw` (thisweek.js:60): Nov 15: today's This Week share offers Light / Dark (openShareCard); the new sheet had lost that choice. V2.wkDraw draws in the picked style
- `V2.wkDraw0` (thisweek.js:61)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.A-team.mjs (opens `#weekly`): `.wk-rm` `.wk-rc`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.wk-kind` `.wk-win` `data-wkimg`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#weekly`)
- [ ] app/test/v2-minors.mjs (opens `#weekly`): `.wk-rm` `.wk-rc` `.wk-mast` `.wk-top` `.wk-tm` `.wk-rk` `.wk-move`
- [ ] app/test/v2-q32.mjs (opens `#weekly`): `.wk-hl` `.wk-tmore` `.wk-top` `.wk-tech` `.wk-tix` `.wk-evall` `.wk-tile` `data-wktech`
- [ ] app/test/v2-unbounded.mjs: `.wk-ht` `.wk-tag` `.wk-tile`

## 20. News (The Champions Dispatch) (`#news`)

- Files: app/src/v2/pages/dispatch.js (170 lines), app/src/v2/pages/post-data.js (46 lines). Registered at dispatch.js:160.
- Browser title: "Champions News · NastyPlot". Phone height at 390: **3870 px** with a team, **3870 px** with an empty team; desktop 1440: 2185 px. No page errors.
- What dispatch.js says it is: News, "The Champions Dispatch" (#news; Sim, Nov 18). Brief: docs/rebuild/dispatch/BRIEF.md The front page of a newspaper: one sheet of cream paper, ink plus the logo's blue and red. Builder rules (ours win over the mock-ups): docs/rebuild/stampede/RULES-FOR-BUILDERS.md. CSS: css/sd-dispatch.css (classes dp-*, colours --dp-* in t…
- What post-data.js says it is: Gifts and news, shared by Home's post band, The Post Room (#gifts) and The Champions Dispatch (#news) POST (src/data/post.js). V2.postNow() -> {live: [...], past: [...], news: [...], checked}; a gift is live from its start until its end (UTC), so it moves to the stamp sheet by the clock, with no data change needed. A gift with n…

### Sections, in order (built page, 390)

- [ ] H1: The Champions Dispatch
- [ ] H2: A New Mystery Gift Campaign (opens the full story at its source, in a 
- [ ] H3: The series so far, and the gift each round gave out
- [ ] H2: In Brief
- [ ] H3: Season M-⁠8 Battle Passes (opens the full story at its source, in a ne
- [ ] H3: Ranked Battles Season M-⁠8 Underway! (opens the full story at its sour
- [ ] H3: Season M-⁠9 Battle Passes (opens the full story at its source, in a ne
- [ ] H3: Wednesday, December 2, 2026 Battle Balance Adjustments (opens the full
- [ ] H3: 2 Training Tickets
- [ ] H2: The Back Page
- [ ] H3: Latest Result
- [ ] H3: Top Ratings
- [ ] H3: Next Events
- [ ] H2: Classifieds
- [ ] H3: The Mega Evolution Battle Competition Is On! (opens the full story at  (desktop only)
- [ ] H3: Obtain a Vivillon Trainer Icon in the Vivillon Visitor Campaign! (open (desktop only)
- [ ] H2: The Back Page From around NastyPlot (desktop only)

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] article.dp-paper [The Champions Dispatch, front page] : The Champions Dispatch
- [ ] section.dp-lead [Lead story] : A New Mystery Gift Campaign (opens the full story at its sou
- [ ] section.dp-ser [The series so far] : The series so far, and the gift each round gave out
- [ ] section.dp-int [In brief] : In Brief
- [ ] aside.dp-cpn [Clip and claim: 2 Training Tickets] : 2 Training Tickets
- [ ] section.dp-back [The Back Page] : The Back Page
- [ ] section.dp-bc [Latest result] : Latest Result
- [ ] section.dp-bc [Top Ratings] : Top Ratings
- [ ] section.dp-bc [Next Events] : Next Events
- [ ] section.dp-ads [Classifieds] : Classifieds

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "IN THE POST 3 gifts waiting One ends tomorrow" — a.dp-box.dp-pk → #gifts — hooks: none
- [ ] "NEXT EVENT LAIC, São Paulo Nov 20–22 · Live now" — button:button.dp-box.dp-bx — hooks: `data-dpcal` (dispatch.js:89, dispatch.js:142)
- [ ] "A New Mystery Gift Campaign (opens the full story ", "Season M-⁠8 Battle Passes (opens the full story at", "Ranked Battles Season M-⁠8 Underway! (opens the fu" ×7 — a.dp-hl → https://champions-news.pokemon-home.com/ (2 hidden until opened) — hooks: none
- [ ] "Gallade", "Tyranitar", "Mawile" ×13 — button:button.dp-gb — hooks: `data-v2mon` (dispatch.js:96, dispatch.js:135)
- [ ] "2 more in brief ›" — button:button.np-link.dp-lk — hooks: `data-dpbrief` (dispatch.js:35, dispatch.js:165)
- [ ] "Read the Story ›" ×2 — a.dp-read → https://champions-news.pokemon-home.com/ — hooks: none
- [ ] "Copy Code" — button:button.np-btn.pr-copy — hooks: `data-prcopy` (dispatch.js:28)
- [ ] "All Mystery Gifts ›" — a.dp-lk → #gifts — hooks: none
- [ ] "ValkrixVGC Champions League #09" — button:button.dp-evt.u — hooks: `data-evgo` (dispatch.js:131)
- [ ] "1 Sneasler S tier 97", "1 Rillaboom S tier 97", "3 Kingambit S tier 96" ×5 — button:button.dp-row (2 hidden until opened) — hooks: `data-v2mon` (dispatch.js:96, dispatch.js:135)
- [ ] "All Ratings ›" — a.dp-lk.dp-all → #meta — hooks: none
- [ ] "20 Latin America International (LAIC) Nov 20–22 · ", "21 Malaysia Premier Ball League Nov 21 · Kuala Lum", "28Stuttgart RegionalNov 28–29 · Stuttgart, Germany" ×3 — a.dp-fr → https://victoryroad.pro/2027-laic/ (1 hidden until opened) — hooks: none
- [ ] "All 30 Next Events ›" — button:button.dp-lk.dp-all — hooks: `data-dpcal` (dispatch.js:89, dispatch.js:142)
- [ ] "WANTED A turn 1 plan for tonight's match. Apply at" — a.dp-ad → #battle — hooks: none
- [ ] "FOR HIRE Team builder, works from real winning tea" — a.dp-ad → #build — hooks: none
- [ ] "LOST One win streak. Last seen before a Sneasler. " — a.dp-ad → #team — hooks: none
- [ ] "NOTICE Damage numbers checked while you wait. See " — a.dp-ad → #calc — hooks: none
- [ ] "Earlier Editions · 62 more stories ›" — button:button.dp-lk.dp-earl — hooks: `data-dpmore` (dispatch.js:162, dispatch.js:167)

### Numbers and facts shown (sample, 390 with a team)

- [ ] NO. 69 · LATE EDITION
- [ ] 3 gifts waiting
- [ ] Sat, Nov 21, 2026
- [ ] 50 stories in the past 12 months · 12 tournaments · 8 battle passes
- [ ] Nov 20–22 · Live now
- [ ] CAMPAIGN · NOV 25
- [ ] The Monthly Challenge Series May 2026:
- [ ] The Monthly Challenge Series June 2026:
- [ ] The Monthly Challenge Series July 2026:
- [ ] The Monthly Challenge Series August 2026:
- [ ] The Monthly Challenge Series September 2026:
- [ ] The Monthly Challenge Series October 2026:
- [ ] The Monthly Challenge Series November 2026:
- [ ] BATTLE PASS · NOV 4
- [ ] Season M-⁠8 Battle Passes
- [ ] RANKED BATTLES · NOV 4
- [ ] Ranked Battles Season M-⁠8 Underway!
- [ ] 2 more in brief ›
- [ ] BATTLE PASS · NOV 25
- [ ] Season M-⁠9 Battle Passes
- [ ] UPDATE · NOV 18
- [ ] Wednesday, December 2, 2026 Battle Balance Adjustments
- [ ] 2 Training Tickets
- [ ] LA1CTRA1N1NG27
- [ ] L, A, 1, C, T, R, A, 1, N, 1, N, G, 2, 7
- [ ] ValkrixVGC Champions League #09
- [ ] Nov 8 · 57 players · the winner's six
- [ ] Nov 20–22 · São Paulo, Brazil · Live now
- [ ] Nov 21 · Kuala Lumpur, Malaysia · Live now
- [ ] All 30 Next Events ›
- [ ] 6 bare numbers on their own lines (stats, scores, counts), e.g. 1, 97, 3, 96, 20, 21

### States

- [ ] Empty team (six empty slots): 3870 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): empty, so far, no data

### Drawing functions (where in today's code)

<details><summary>dispatch.js: 31 functions</summary>

- `V2.dpUi` (dispatch.js:29): button (data-prcopy, handled in postroom.js): one family.
- `V2.dpBriefBtn` (dispatch.js:35)
- `V2.dpPick` (dispatch.js:36)
- `V2.dpSrc` (dispatch.js:38): https only (V2.safeUrl, post-data.js; the Post Room's check): a javascript:, data: or http: link is dropped and the words stay plain text
- `V2.dpItem` (dispatch.js:39)
- `V2.dpMaint` (dispatch.js:42): a balance change is real news even when the feed files it under Maintenance (Nov 18: the Dec 2 Battle Balance Adjustments notice)
- `V2.dpDay` (dispatch.js:44): dates: a news date is a calendar day (read at local noon, so it never slips a day); a gift's start and end are UTC instants
- `V2.dpShort` (dispatch.js:48): is read in UTC; a plain calendar day stays as written
- `V2.dpLeftTxt` (dispatch.js:49)
- `V2.dpOrd` (dispatch.js:50)
- `V2.dpPlural` (dispatch.js:51)
- `V2.dpNext` (dispatch.js:53): the upcoming events, as the Events page lists them (V2.evCal: from today, no national events)
- `V2.dpPlace` (dispatch.js:54)
- `V2.evShort` (dispatch.js:57): brackets ("... (NAIC)" -> "NAIC"), else its full name. V2.dpEvShort adds the city for an in-person event.
- `V2.dpEvShort` (dispatch.js:58)
- `V2.dpA` (dispatch.js:61): 'Season M-8' never breaks after its hyphen (a word joiner, as the Events page's ticket names)
- `V2.dpKick` (dispatch.js:62)
- `V2.dpParts` (dispatch.js:64): what goes where: the lead (newest story that isn't an interview), its series' rounds, the interviews column, two more stories, the rest
- `V2.dpMast` (dispatch.js:82): ---------- the masthead: top line, name, In the post / date / Next event ----------
- `V2.dpMonGift` (dispatch.js:95): ---------- the lead story and its series row ----------
- `V2.dpSeries` (dispatch.js:97)
- `V2.dpLead` (dispatch.js:102)
- `V2.dpBrief` (dispatch.js:112): ---------- interviews, more stories, the coupon ----------
- `V2.dpInter` (dispatch.js:115)
- `V2.dpStory` (dispatch.js:117)
- `V2.dpCoupon` (dispatch.js:120)
- `V2.dpLatest` (dispatch.js:128): ---------- The Back Page: Latest Result, Top Ratings, Next Events (Sim, Nov 18, 2c: the word list's names, were The Standings / Fixtures) ----------
- `V2.dpStand` (dispatch.js:133)
- `V2.dpFix` (dispatch.js:137)
- `V2.dpAds` (dispatch.js:144): ---------- Classifieds: four playful one-liners, each opening a tool (new words; Sim hasn't signed them off) ----------
- `V2.dpFront` (dispatch.js:149): ---------- the piece ----------

</details>

<details><summary>post-data.js: 8 functions</summary>

- `V2.postMG` (post-data.js:8): (no 'how' counts as one: a gift with a code reads as a serial code, one without as an event gift, as V2.prG reads it).
- `V2.postNow` (post-data.js:9)
- `V2.safeUrl` (post-data.js:15): it is an https:// URL, else ''. A javascript:, data:, http: or broken link never becomes a link; its words show as plain text.
- `V2.OFFICIAL_HOSTS` (post-data.js:18): official news feed is champions-news.pokemon-home.com. A lookalike ("notpokemon.com", "pokemon.com.example.org") is not official.
- `V2.officialHost` (post-data.js:19)
- `V2.POST_BUILTIN` (post-data.js:26): (a non-https one becomes '' and shows as plain text, as before), titles without markup; no article text or images can come in.
- `V2.postClean` (post-data.js:27)
- `V2.postTake` (post-data.js:42): refresh never loses a headline), else the built-in POST. Returns true when the document was used.

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `data-evgo`
- [ ] app/test/tap-size.mjs: `.dp-read`
- [ ] app/test/v2-minors.mjs (opens `#news`): `.dp-paper` `.dp-hl` `.dp-name` `.dp-mast` `.dp-pk` `.dp-date` `.dp-rd` `.dp-lead` `.dp-lh` `.dp-sum` `.dp-stamp` `.dp-cpn` `.dp-cpm` `.dp-bc` `.dp-evt` `.dp-six` `.dp-tb` `.dp-row` `.dp-rk1` `.dp-rn` `.dp-rv` `.dp-fix` `.dp-small` `.dp-more` `.dp-nbar` +3 more
- [ ] app/test/v2-post-doc.mjs (opens `#news`)
- [ ] app/test/v2-q41.mjs (opens `#news`): `.dp-paper` `.dp-lk` `.dp-lead` `.dp-int` `.dp-il` `.dp-st` `.dp-cpn` `.dp-bc` `.dp-std` `.dp-tb` `.dp-all` `.dp-fix` `.dp-fl` `data-dpbrief`
- [ ] app/test/v2-q69.mjs: `.dp-hl`
- [ ] app/test/v2-w5.mjs (opens `#news`): `.dp-k`

## 21. Gifts (The Post Room) (`#gifts`)

- Files: app/src/v2/pages/postroom.js (167 lines), app/src/v2/pages/post-data.js (46 lines). Registered at postroom.js:133.
- Browser title: "Mystery Gifts · NastyPlot". Phone height at 390: **3668 px** with a team, **3668 px** with an empty team; desktop 1440: 2075 px. No page errors.
- What postroom.js says it is: Mystery Gifts, "The Post Room" (#gifts; Sim, Nov 18). Brief: docs/rebuild/postroom/BRIEF.md Every Mystery Gift is a parcel: live gifts wait at the counter with the code on the shipping label; every past gift becomes a postage stamp, postmarked the day it ended. Data: V2.postNow() (post-data.js) from POST in src/data/post.js; liv…
- What post-data.js says it is: Gifts and news, shared by Home's post band, The Post Room (#gifts) and The Champions Dispatch (#news) POST (src/data/post.js). V2.postNow() -> {live: [...], past: [...], news: [...], checked}; a gift is live from its start until its end (UTC), so it moves to the stamp sheet by the clock, with no data change needed. A gift with n…

### Sections, in order (built page, 390)

- [ ] H1: Special delivery. No postage due.
- [ ] H2: Waiting at the Counter
- [ ] H3: How to collect
- [ ] H2: The Stamp Sheet

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Home · Mystery Gifts
- [ ] section.pr-counter : Waiting at the Counter
- [ ] article.pr-parcel [Mystery Gift: 2 Training Tickets] : 
- [ ] article.pr-parcel [Mystery Gift: 100 Quick Coupons] : 
- [ ] article.pr-parcel [Mystery Gift: Vivillon Trainer Icon] : 
- [ ] aside.pr-howto : How to collect
- [ ] section.pr-stamps : The Stamp Sheet
- [ ] div.ev-f [Which stamps] : 

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Home" — a.np-back → #home — hooks: none
- [ ] "Copy Code" ×2 — button:button.np-btn.pr-copy — hooks: `data-prcopy` (postroom.js:10, postroom.js:79)
- [ ] "nintendoeverything.com", "nintendolife.com", "levelup.com" ×5 — a → https://nintendoeverything.com/?p=929482 — hooks: none
- [ ] "All 7", "Pokémon 4", "Items 3" ×3 — button:button.np-chip.ev-fc — hooks: `data-prf` (postroom.js:153, postroom.js:162)
- [ ] "Jun '26 Raichu Event gift , from June 2026, ended " — button:button.pr-st — hooks: `data-v2mon` (postroom.js:118, postroom.js:127)
- [ ] "Apr '26 Machamp Serial code , from April 2026, end", "Jun '26 Charizard Serial code , from June 2026, en", "May '26GyaradosSerial code, from May 2026, ended M" ×3 — button:button.pr-st (1 hidden until opened) — hooks: `data-prset` (postroom.js:118, postroom.js:162)
- [ ] "Show All 7 Stamps ›" — button:button.np-link.pr-more — hooks: `data-prmore` (postroom.js:157, postroom.js:162)

### Numbers and facts shown (sample, 390 with a team)

- [ ] 2 Training Tickets
- [ ] Nov 11
- [ ] Nov 22
- [ ] LA1CTRA1N1NG27
- [ ] L, A, 1, C, T, R, A, 1, N, 1, N, G, 2, 7
- [ ] , 1 day left
- [ ] 100 Quick Coupons
- [ ] Sep 9
- [ ] Dec 31
- [ ] 10M1NTRNR
- [ ] 1, 0, M, 1, N, T, R, N, R
- [ ] , 40 days left
- [ ] Also inside: Training Ticket ×6, 666 VP
- [ ] Oct 29
- [ ] Jan 31, 2027
- [ ] until 2:59 PM
- [ ] , 71 days left
- [ ] Aug '26
- [ ] 2026 Worlds Outfit Set (red cap and shirt)
- [ ] , from August 2026, ended Sep 3
- [ ] SEP 3
- [ ] Jun '26
- [ ] , from June 2026, ended Sep 2. Opens Raichu's page
- [ ] SEP 2
- [ ] , from June 2026, ended Aug 31
- [ ] AUG 31
- [ ] Apr '26
- [ ] , from April 2026, ended Aug 31. Opens its nature and moves
- [ ] 22 Quick Coupons
- [ ] , from June 2026, ended Jun 14
- [ ] 10 bare numbers on their own lines (stats, scores, counts), e.g. 3, 1, 10, 1 0 2, 40, 71, 7, 4

### States

- [ ] Empty team (six empty slots): 3668 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): empty, so far, no data
- [ ] ARIA roles drawn: group

### Drawing functions (where in today's code)

<details><summary>postroom.js: 27 functions</summary>

- `V2.PR_SOON` (postroom.js:35): id      a unique key (default: name and end)
- `V2.prUi` (postroom.js:36)
- `V2.PR_KIND` (postroom.js:37)
- `V2.PR_ITEM` (postroom.js:38)
- `V2.prG` (postroom.js:39)
- `V2.PR_HOW` (postroom.js:56)
- `V2.PR_NOCODE` (postroom.js:58): a gift with no code says why on its label (the words follow post.js's meaning of each 'how')
- `V2.prYr` (postroom.js:59)
- `V2.prDate` (postroom.js:60)
- `V2.prDayOf` (postroom.js:61)
- `V2.prDay` (postroom.js:62)
- `V2.prDayN` (postroom.js:69): counted as ended in any time zone: 0 on its last day, never -1 ("Last day", "Ends today").
- `V2.prDaysLeft` (postroom.js:70)
- `V2.prRubber` (postroom.js:72)
- `V2.prCode` (postroom.js:76): the code: digits blue, letters ink; spelled for screen readers; the spelled copy is never selected with the code
- `V2.PR_EM` (postroom.js:83): 1.5% wider). The row uses it (--prw) to decide whether Copy Code fits beside the code, and to size the code to its cell (sd-postroom.css).
- `V2.prEm` (postroom.js:85)
- `V2.prCopyRow` (postroom.js:86)
- `V2.prBars` (postroom.js:88): a barcode drawn from the code (decorative), so each label's bars differ
- `V2.prLabel` (postroom.js:91)
- `V2.prParcel` (postroom.js:98)
- `V2.PR_ART` (postroom.js:101): item pictures: our own line drawings (no image files; Sim's open point: stand-ins)
- `V2.prArt` (postroom.js:109)
- `V2.prStamp` (postroom.js:113)
- `V2.prSet` (postroom.js:122): the set a Pokémon gift came with (only when POST has it, from a cited source)
- `V2.prShelf` (postroom.js:129): the empty counter: an empty parcel shelf and one line (Sim decides the final words)
- `V2.prHow` (postroom.js:131)

</details>

<details><summary>post-data.js: 8 functions</summary>

- `V2.postMG` (post-data.js:8): (no 'how' counts as one: a gift with a code reads as a serial code, one without as an event gift, as V2.prG reads it).
- `V2.postNow` (post-data.js:9)
- `V2.safeUrl` (post-data.js:15): it is an https:// URL, else ''. A javascript:, data:, http: or broken link never becomes a link; its words show as plain text.
- `V2.OFFICIAL_HOSTS` (post-data.js:18): official news feed is champions-news.pokemon-home.com. A lookalike ("notpokemon.com", "pokemon.com.example.org") is not official.
- `V2.officialHost` (post-data.js:19)
- `V2.POST_BUILTIN` (post-data.js:26): (a non-https one becomes '' and shows as plain text, as before), titles without markup; no article text or images can come in.
- `V2.postClean` (post-data.js:27)
- `V2.postTake` (post-data.js:42): refresh never loses a headline), else the built-in POST. Returns true when the document was used.

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/tap-size.mjs: `.pr-src`
- [ ] app/test/v2-minors.mjs (opens `#gifts`): `.pr-rub` `.pr-d` `.pr-cv` `.pr-spell` `.pr-crow` `.pr-cbox` `.pr-copy` `.pr-none` `.pr-label` `.pr-meta` `.pr-what` `.pr-parcel` `.pr-nm` `.pr-st` `.pr-pm` `.pr-sw` `.pr-shelf` `.pr-howto` `.pr-stats` `.pr-nums` `.pr-counter` `.ev-fc` `.pr-sheet` `data-prcopy` `data-prset` +2 more
- [ ] app/test/v2-post-doc.mjs (opens `#gifts`)
- [ ] app/test/v2-q33.mjs: `.ev-f`
- [ ] app/test/v2-q43.mjs (opens `#gifts`): `.pr-nm` `.pr-sw` `.pr-stamps` `.pr-sheet` `data-prf` `data-prmore`
- [ ] app/test/v2-q72.mjs: `.ev-f` `.ev-fc`
- [ ] app/test/v2-unbounded.mjs: `.pr-stats`

## 22. Track Record (`#track`)

- Files: app/src/v2/pages/track.js (68 lines). Registered at track.js:30.
- Browser title: "Track Record · NastyPlot". Phone height at 390: **3421 px** with a team, **3421 px** with an empty team; desktop 1440: 1724 px. No page errors.
- What track.js says it is: Meta > Track Record (Nov 15): Sim's pick "The Receipt" (docs/rebuild/mocks/thisweek-trackrecord/BRIEF.md) Everything today's Track Record page holds (64-track.js renderTrack), from the same data and shared logic (META.track, TR_BANDS, TR_MIN, trRates, trPct, trWeek, trAdd in 64-track-data.js): the question, the three counts, the…

### Sections, in order (built page, 390)

- [ ] H1: How right have our ratings been?
- [ ] H2: Top-8 Teams by the Rating We Gave
- [ ] H2: The Calls
- [ ] H3: Biggest Hits
- [ ] H3: Biggest Misses
- [ ] H2: How We Check
- [ ] H2: Week by Week

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Ratings · checked against later events
- [ ] section.trk-rc [Top-8 teams, by the rating we gave] : Top-8 Teams by the Rating We Gave
- [ ] section.trk-calls : The Calls
- [ ] section.trk-how : How We Check
- [ ] section.trk-wk : Week by Week
- [ ] details.wk-fold : Events Checked 31 events, newest first

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Sneasler on 105 top-8 teams in 31 events won 10 ev", "Mega Charizard Y on 92 top-8 teams in 31 events wo", "Kingambit on 88 top-8 teams in 31 events won 16 ev" ×3 — button:button.trk-slip.hit — hooks: `data-v2mon` (track.js:11)
- [ ] "Mega Garchomp won Sketch Academy Sunday Regulation", "Toxapex won Sunday Showdown #4 MISSED RATED 59", "Mega Absol Z won Trinity Championship 18 (Double F" ×3 — button:button.trk-slip.miss — hooks: `data-v2mon` (track.js:11)
- [ ] "?" — button:button.sg2-tip — hooks: `data-v2tip` (sugs.js:277, sugs.js:278)
- [ ] "Events Checked 31 events, newest first" — summary — hooks: none
- [ ] "How Ratings Work ›" — a.np-link → #method=rating — hooks: none

### Numbers and facts shown (sample, 390 with a team)

- [ ] Oct 29
- [ ] Top-8 Teams by the Rating We Gave
- [ ] How often each Pokémon was on a top-8 team, on average · 31 events, 263 top-8 teams
- [ ] Rated 90+
- [ ] 11 of 11 made at least one top 8
- [ ] Rated 70–89
- [ ] 29 of 29 made at least one top 8
- [ ] Rated 53–69
- [ ] 25 of 27 made at least one top 8
- [ ] Rated Under 53
- [ ] 59 of 278 made at least one top 8
- [ ] 230×
- [ ] on 105 top-8 teams in 31 events
- [ ] won 10 events
- [ ] on 92 top-8 teams in 31 events
- [ ] won 15 events
- [ ] on 88 top-8 teams in 31 events
- [ ] won 16 events
- [ ] won Sunday Showdown #4
- [ ] won Trinity Championship 18 (Double Format)
- [ ] Its top 8 compared
- [ ] From about Nov 9: a line for each rating band, once there are 3 weeks of events.
- [ ] 31 events, newest first
- [ ] 15 bare numbers on their own lines (stats, scores, counts), e.g. 12, 31, 25%, 8.7%, 1.4%, 0.1%, 97, 94

### States

- [ ] Empty team (six empty slots): 3421 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): no data, empty, so far
- [ ] Remembered settings (localStorage): `cc2.chf.trevents`
- [ ] Sub-addresses / links with a part: `#method=rating`
- [ ] ARIA roles drawn: img

### Drawing functions (where in today's code)

<details><summary>track.js: 3 functions</summary>

- `V2.trBandC` (track.js:8): The paper (the receipt, the slips, the chart sheet) is white with dark words in both themes: a design choice waiting on Sim's yes.
- `V2.trSlip` (track.js:10): Sim (Nov 17, 'recommended'): no dots on the cards: the big number already says 'Rated N', each fact on its own line
- `V2.trChart` (track.js:16): escaping it again made a title with '&' read "amp" to screen readers

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.C-battle.mjs: `.trk-svg` `.trk-evs`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#track`)
- [ ] app/test/v2-minors.mjs (opens `#track`): `.trk-slip` `.trk-st` `.trk-stamp` `.trk-sr`
- [ ] app/test/v2-q72.mjs: `.trk-lines`
- [ ] app/test/v2-trkfit.mjs (opens `#track`): `.trk-rc` `.trk-tot`
- [ ] app/test/v2-unbounded.mjs: `.trk-st` `.trk-stamp`

## 23. How We Calculate (`#method`)

- Files: app/src/v2/pages/method.js (39 lines). Registered at method.js:28.
- Browser title: "How We Calculate · NastyPlot". Phone height at 390: **3424 px** with a team, **3424 px** with an empty team; desktop 1440: 1624 px. No page errors.
- What method.js says it is: How We Calculate (Sim approved the draft's look, Nov 15, Q12 "recommended") The ten parts as numbered tiles in four groups; a tile opens its working underneath. The working is today's, unchanged: NP_SECTIONS in src/app/63-method-data.js (shared with today's page), in the same order as the tiles. Tile names follow the word list (…

### Sections, in order (built page, 390)

- [ ] H1: Every number, and where it comes from.
- [ ] H2: Ten Parts, Tap One for the Working

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Reg M-C doubles · plain words
- [ ] section.inf-grp : Ten Parts, Tap One for the Working
- [ ] details.inf-tile : 01 YOUR TEAM Strength Score How strong the team is altogethe
- [ ] div.npeq [Strength Score equals team strength from real games, plus ma] : 
- [ ] details.inf-tile : 02 YOUR TEAM Matchups Real damage calcs against the 30 Pokém
- [ ] details.inf-tile : 03 YOUR TEAM Team Checks What most winning tournament teams 
- [ ] details.inf-tile : 04 POKÉMON Pokémon Ratings (0–100) Proven results: top cuts,
- [ ] div.npeq [Rating adds top-cut share, strong-player usage counted at ha] : 
- [ ] details.inf-tile : 05 POKÉMON Usage, Sets and Sources Where every number comes 
- [ ] details.inf-tile : 06 TOOLS Damage Calculator Level 50 doubles, the game's own 
- [ ] details.inf-tile : 07 TOOLS Speed Tiers Who moves first, with real spreads
- [ ] details.inf-tile : 08 TOOLS Build Me a Team and Suggestions Ranked by the same 
- [ ] details.inf-tile : 09 THE DATA What Gets Left Out Themed cups, odd events and t
- [ ] details.inf-tile : 10 THE DATA Updates and Cross-checks Every morning, each num

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "01 YOUR TEAM Strength Score How strong the team is", "02 YOUR TEAM Matchups Real damage calcs against th", "03 YOUR TEAM Team Checks What most winning tournam" ×10 — summary — hooks: none
- [ ] (no text) — a.np-link → #track — hooks: none
- [ ] "Track Record How right have our ratings been? Trac" — a.inf-track → #track — hooks: none

### Numbers and facts shown (sample, 390 with a team)

- [ ] UPDATED NOV 9
- [ ] score out of 100
- [ ] S 90+
- [ ] A 80s
- [ ] B 70s
- [ ] C 60s
- [ ] D 50s
- [ ] F <50
- [ ] how strong the team is, out of 100
- [ ] 90+ Top tier
- [ ] 80s Tournament ready
- [ ] 70s Solid
- [ ] 60s Needs work
- [ ] under 60 Missing a basic
- [ ] Bars = rank among all Pokémon: 94 beats 94% of them (top 6%).
- [ ] How strong the team is altogether, out of 100
- [ ] Real damage calcs against the 30 Pokémon that make top cut most
- [ ] What most winning tournament teams have: 4 basics and 3 notes
- [ ] Pokémon Ratings (0–100)
- [ ] Level 50 doubles, the game's own rounding
- [ ] Tracking since Oct 29 · 31 events checked
- [ ] 12 bare numbers on their own lines (stats, scores, counts), e.g. 13,631, 38,513, 01, 02, 03, 04, 05, 06

### States

- [ ] Empty team (six empty slots): 3424 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): loading, failure
- [ ] Sub-addresses / links with a part: `#method=`

### Drawing functions (where in today's code)

<details><summary>method.js: 5 functions</summary>

- `V2.MTH` (method.js:9)
- `V2.MTH_WORDS` (method.js:15): The shared text (63-method-data.js, also today's live site) is left as it is; the new site swaps the exact phrases
- `V2.mthWords` (method.js:19)
- `V2.mthBody` (method.js:20): link rows end in › (design-system.md); today's shared text keeps → 
- `V2.mthSprites` (method.js:23): here each one is the new site's own sprite, by the Pokémon's name (its title), falling back to the picture id

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs: `.inf-tile` `data-mth`
- [ ] app/test/behaviour/adapters/v2.mjs (opens `#method`)
- [ ] app/test/sheet-tabs.mjs: `data-view`
- [ ] app/test/shots.mjs: `data-view`
- [ ] app/test/v2-arena.mjs (opens `#method`)
- [ ] app/test/v2-folds.mjs (opens `#method`)
- [ ] app/test/v2-q24.mjs (opens `#method`)
- [ ] app/test/v2-q44.mjs (opens `#method`): `.inf-tile` `.inf-no` `.inf-tiles`

## 24. About (`#about`)

- Files: app/src/v2/pages/about.js (29 lines). Registered at about.js:15.
- Browser title: "About & Legal · NastyPlot". Phone height at 390: **2758 px** with a team, **2758 px** with an empty team; desktop 1440: 1536 px. No page errors.
- What about.js says it is: About & Legal (Sim approved the draft's look, Nov 15, Q12 "recommended") "The Fine Print" rows beside "Everything We Save". The words are today's (ABT_PARTS in src/app/56-about-data.js, shared with today's page), each part's full text under its row. Privacy is the new site's own, written from what its code saves (checked Nov 15)…

### Sections, in order (built page, 390)

- [ ] H1: Made by fans, for doubles players.
- [ ] H2: The Fine Print
- [ ] H3: 
- [ ] H3: 
- [ ] H2: Everything We Save

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : About & Legal
- [ ] section. : The Fine Print
- [ ] details.inf-row : What NastyPlot Is A free fan tool for Champions VGC doubles
- [ ] details.inf-row : Disclaimer & Trademarks Unofficial · not linked to Nintendo 
- [ ] details.inf-row : Where the Data Comes From 9 sources, credited and used by th
- [ ] details.inf-row : No Guarantee Check the official rules before an event
- [ ] details.inf-row : Player Names From public results · ask and we'll remove your
- [ ] details.inf-row : Removal & Contact Email us about anything shown here
- [ ] details.inf-row : Not for Money Free · no ads, paid features or donations
- [ ] section.inf-saved : Everything We Save

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "What NastyPlot Is A free fan tool for Champions VG", "Disclaimer & Trademarks Unofficial · not linked to", "Where the Data Comes From 9 sources, credited and " ×7 — summary — hooks: none
- [ ] (no text) ×12 — a → https://play.limitlesstcg.com — hooks: none
- [ ] (no text) — pre.abtlicense — hooks: none
- [ ] (no text) — button:button.np-link — hooks: `data-abtmail` (about.js:25, about.js:27)

### Numbers and facts shown (sample, 390 with a team)

- [ ] 9 sources, credited and used by their rules

### States

- [ ] Empty team (six empty slots): 2758 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): error

### Drawing functions (where in today's code)

<details><summary>about.js: 2 functions</summary>

- `V2.ABT_SAVED` (about.js:7): (np2.* keys); fonts come from NastyPlot's own files (build.mjs refuses a Google Fonts link); no cookies anywhere in src/.
- `V2.ABT_TITLE` (about.js:14)

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.mjs (opens `#about`)
- [ ] app/test/v2-folds.mjs (opens `#about`)
- [ ] app/test/v2-minors.mjs (opens `#about`)
- [ ] app/test/v2-q24.mjs (opens `#about`)

## 25. Send Feedback (`#feedback`)

- Files: app/src/v2/pages/feedback.js (53 lines). Registered at feedback.js:12.
- Browser title: "Send Feedback · NastyPlot". Phone height at 390: **1402 px** with a team, **1402 px** with an empty team; desktop 1440: 935 px. No page errors.
- What feedback.js says it is: Send Feedback (Sim approved the draft's look, Nov 15, Q12 "recommended") One question, the five kinds, a box, Send. Saved exactly as today's Feedback button saves it (53-feedback.js): the viewer's own document feedback/<anonymous id>, one entry {t: the text after fbScrub (emails, phone numbers, @handles removed), k: kind, v: the…

### Sections, in order (built page, 390)

- [ ] H1: Tell us what's off.

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Send Feedback

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Show Email" — button:button.np-link — hooks: `data-abtmail` (feedback.js:14)
- [ ] "Something broke", "Confusing", "Idea" ×5 — button:button.np-chip — hooks: `data-fbk2` (feedback.js:15, feedback.js:30)
- [ ] (no text) — textarea:textarea — hooks: none
- [ ] "Send" — button:button.np-btn — hooks: `data-fbsend2` (feedback.js:17, feedback.js:20)
- [ ] Hooks the code listens for that were not on screen in this state (they appear after a tap, in another state, or in a sheet): `data-fbmistake` (feedback.js:36)

### Numbers and facts shown (sample, 390 with a team)


### States

- [ ] Empty team (six empty slots): 1402 px at 390. Same headings as with a team (the page does not depend on the team, same height).
- [ ] State words in the code (each needs its look in the kit): busy, empty
- [ ] ARIA roles drawn: group, status

### Drawing functions (where in today's code)

<details><summary>feedback.js: 3 functions</summary>

- `V2.FB` (feedback.js:6): (its stand-in database keeps nothing), so there it says so instead of thanking anyone.
- `V2.fbSend` (feedback.js:20): document.addEventListener('input', e => { if (e.target && e.target.id === 'fbText2') { V2.FB.draft = e.target.value; if (e.target.value.trim().length 
- `V2.fbMonNums` (feedback.js:45): Ability shown, and the data date. Only site data: nothing about the viewer.

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs (opens `#feedback`)
- [ ] app/test/v2-arena.mjs: `data-fbmistake` `data-arnname`
- [ ] app/test/v2-formerr.mjs (opens `#feedback`): `data-fbsend2` `data-fbmsg2`
- [ ] app/test/v2-minors.mjs: `.inf-ctx` `data-fbsend2` `data-fbmistake`
- [ ] app/test/v2-q33.mjs: `.ev-f`
- [ ] app/test/v2-q46.mjs: `data-arnname`
- [ ] app/test/v2-q72.mjs: `.ev-f`

## 26. A Pokémon's page (#pokemon=incineroar) (`#pokemon=<name>`)

- Files: app/src/v2/pages/pokemon.js (180 lines), app/src/v2/pages/monsheet.js (181 lines). Registered at pokemon.js:166.
- Browser title: "Incineroar: rating, sets and partners · NastyPlot". Phone height at 390: **3796 px** with a team, **3860 px** with an empty team; desktop 1440: 2769 px. No page errors.
- What pokemon.js says it is: The Pokémon page, "The Answer Page" (Sim's pick Nov 15; docs/rebuild/mocks/pokemon-answer-page/BRIEF.md) Sim, Nov 15 (recommended A): one full page per Pokémon at its own address, #pokemon=<name>; the info sheet retires once every part
- What monsheet.js says it is: the Pokémon info sheet (R4, Nov 11; replaces the placeholder in shell.js) Mock-up docs/rebuild/mocks/sheet.html (Sim approved): the header (rating and tier, name, types, share of teams, win rate, Speed at level 50, the action), the forms strip (tap one to open it), then Info / Meta / Rating. Every number comes from today's share…

### Sections, in order (built page, 390)

- [ ] H1: Incineroar
- [ ] H2: Base Stats
- [ ] H2: How to build it
- [ ] H3: Usually
- [ ] H3: Typical set
- [ ] H2: Who it teams with
- [ ] H2: What beats it
- [ ] H2: How fast it is
- [ ] H2: Abilities
- [ ] H2: Why it rates 95
- [ ] H3: Moves (desktop only)
- [ ] H3: Items (desktop only)

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] nav.pk-trail [You are here] : 
- [ ] section.pk-top : Incineroar
- [ ] section.pk-stats : Base Stats
- [ ] nav.pk-jumps [On this page] : 
- [ ] section.pk-sec : How to build it
- [ ] section.pk-sec : Who it teams with
- [ ] section.pk-sec : What beats it
- [ ] section.pk-sec : How fast it is
- [ ] section.pk-sec : Abilities
- [ ] section.pk-sec : Why it rates 95

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Meta", "Ratings" ×2 — a → #meta — hooks: none
- [ ] "Build Around It" ×2 — button:button.np-btn — hooks: `data-hmaround` (monsheet.js:26, pokemon.js:25)
- [ ] "Popular Sets" ×2 — button:button.np-btn2 — hooks: `data-mssets` (monsheet.js:26, monsheet.js:165)
- [ ] "Is it good?", "How to build it", "Who it teams with" ×6 — button:button — hooks: `data-pkjump` (pokemon.js:40, pokemon.js:41)
- [ ] "All Moves and Items ›" — button:button.np-link — hooks: `data-pklists` (pokemon.js:67, pokemon.js:178)
- [ ] "RILLABOOM RILLABOOM Rillaboom", "GARCHOMP GARCHOMP Garchomp", "SNEASLER SNEASLER Sneasler" ×4 — a.pk-pc → #pokemon=rillaboom — hooks: none
- [ ] "Show ›" ×4 — button:button.np-link — hooks: `data-pkopen` (pokemon.js:160, pokemon.js:162)
- [ ] "Speed Tiers ›" — a.np-link → #speed (1 hidden until opened) — hooks: none
- [ ] "BShowdowntierShowdown ladder usage + win rate · No" — a → https://showdowntier.com/formats/dmc/ind (1 hidden until opened) — hooks: none
- [ ] "How Ratings Work ›" — a.np-link → #method=rating (1 hidden until opened) — hooks: none
- [ ] "Track Record ›" — a.np-link → #track (1 hidden until opened) — hooks: none

### Numbers and facts shown (sample, 390 with a team)

- [ ] #4 of 321 with tournament results
- [ ] of 13.6k
- [ ] 27,028 games
- [ ] at level 50
- [ ] Why it rates 95
- [ ] 99% of sets
- [ ] 95% of sets
- [ ] 96% of sets
- [ ] 32% of sets
- [ ] 31 HP, 20 SpD, 15 Def
- [ ] 3,160 games
- [ ] 2,310 games
- [ ] 1,648 games
- [ ] 1,381 games
- [ ] 2× weak: Water, Fighting, Ground, Rock
- [ ] Speed at Level 50
- [ ] 72 Speed (what players run) · outspeeds 10% of the top 30
- [ ] Intimidate (100%) or Blaze
- [ ] 22 bare numbers on their own lines (stats, scores, counts), e.g. 95, 0, 50, 100, 35%, 51%, 72, 530

### States

- [ ] Empty team (six empty slots): 3860 px at 390. Same headings as with a team (the page does not depend on the team, height differs).
- [ ] State words in the code (each needs its look in the kit): so far, empty, loadingdone
- [ ] Remembered settings (localStorage): `cc2.setMon`
- [ ] Sub-addresses / links with a part: `#pokemon=`, `#method=rating`
- [ ] ARIA roles drawn: group, table, tablist, tab, tabpanel

### Drawing functions (where in today's code)

<details><summary>pokemon.js: 23 functions</summary>

- `V2.bars` (pokemon.js:2): word list (Nov 16 stress test): 'conversion' is not a player word; the shared label reads 'Converts to top cut'
- `V2.monSlug` (pokemon.js:8): Base Stats so far.
- `V2.monFromHash` (pokemon.js:9)
- `V2.STATS` (pokemon.js:10)
- `V2.pkTop` (pokemon.js:12): the top: the Card; the rank tag; the name; the rating with its tier (Sim, Nov 17: no 'likely 81-92' range, it read as unsure); the 0-100 gauge; the th
- `V2.pkStats` (pokemon.js:31): on wide screens. Replaces the lanes + scale + share bar (609 -> ~390px on a phone). A Mega shows the change from its base form.
- `V2.pkHead` (pokemon.js:38): each part's head (brief 4): a blue slanted square with its number, the question, today's section name small under it, a thick rule
- `V2.pkJumps` (pokemon.js:40): the jump links (brief 3): only to the parts already on the page (the rest are added as they are built)
- `V2.pkBuild` (pokemon.js:43): 1. How to build it (today's Usually, Typical set, Moves, Items; the same helpers and words as the sheet)
- `V2.pkPartners` (pokemon.js:71): 2. Who it teams with (today's Brought with: the four partners, share brought together, games; the same data and note)
- `V2.pkTypes` (pokemon.js:79): today's ¼ row inside it; an empty group says "None" (it still answers the question: no 4x weakness is worth knowing)
- `V2.pkSpeed` (pokemon.js:91): round, so it has its own strip. Under 1100 px the line would crowd: the builds are a list with a bar each.
- `V2.pkFlags` (pokemon.js:103): <p class="fine">Level 50, as in Pokémon Champions: base Speed ${p.st[5]}, Speed points 0–32 add 1 each, a Speed nature adds 10%. "Top 30" = the 30 big
- `V2.pkAbilities` (pokemon.js:106): 5. Abilities (today's: each Ability, its share of players' sets, its text, the same note): one bar split by share, then the Abilities
- `V2.pkWhy` (pokemon.js:116): Record's paper), the evidence as paper slips
- `V2.pkForms` (pokemon.js:127): Forms (Sim, Nov 15: A): a strip to jump between forms, and today's "Forms side by side" as a Team Sheet-style table
- `V2.pkName` (pokemon.js:142): audit Nov 16 (screen readers): each part's Show/Hide button says which part ('Show What beats it'), from the part's heading
- `V2.pkSums` (pokemon.js:145): (remembered per part), a jump link to it opens it too. Desktop shows every part as before. The line uses the same data as the part.
- `V2.pkPair` (pokemon.js:153): wide screens pair folded parts two across; a folded part left without a partner takes the full width (no lone tile beside an empty half)
- `V2.pkOpen` (pokemon.js:156)
- `V2.pkFoldAll` (pokemon.js:157)
- `V2.pkSetOpen` (pokemon.js:162)
- `V2.pkFocusName` (pokemon.js:165): tabindex only while focused (a lasting one reads as a control) 

</details>

<details><summary>monsheet.js: 12 functions</summary>

- `V2.msTab` (monsheet.js:5): today's shared functions (24-sheet-data.js and the rating, set and speed code), proved identical with experiments/same-info.mjs.
- `V2.txt` (monsheet.js:6)
- `V2.msCard` (monsheet.js:11): two orbit lines, a faint hairline texture and one sheen band. Decorations are aria-hidden; the real name is the h2.
- `V2.monHtml` (monsheet.js:18)
- `V2.openMonSheet` (monsheet.js:85): opening: a sheet; another Pokémon from inside it (a form, a partner) replaces it in place and keeps the tab
- `V2.openMon` (monsheet.js:91): the page's name on arrival. The sheet's code stays (V2.openMonSheet) but nothing opens it.
- `V2.fitMsName` (monsheet.js:95): ("Squawkabilly (Yellow)", "Mega Crabominable") steps the name down the type scale until every line fits; names that fit keep 28 px
- `V2.fitWords` (monsheet.js:103): word still can't fit at the smallest size may it break (np-brk). Runs after every page draw (shell.js), on resize and once the fonts load
- `V2._mvFit` (monsheet.js:147): the last fit of a Hand's move lists, by page, window width and the moves in it: {c: 'mh-mv1' / 'mh-mv2' / '', b: moves that may break}
- `V2.mvFitOf` (monsheet.js:148)
- `V2.msShow` (monsheet.js:151): try { document.fonts.ready.then(() => V2.fitWords()); document.fonts.addEventListener('loadingdone', () => requestAnimationFrame(() => V2.fitWords()))
- `V2.msSw` (monsheet.js:169): fingers or while text is selected; vertical scrolls never count; touch only, so a mouse never swipes

</details>

### Test hooks (keep these names, or update the tests in the same change)

- [ ] app/test/behaviour/A-team.mjs (opens `#pokemon`)
- [ ] app/test/behaviour/adapters/v2.A-team.mjs (opens `#pokemon`): `.pk-jumps` `data-pkjump` `data-pklists` `data-pkopen` `.ms2` `data-mstab` `data-mspan`
- [ ] app/test/behaviour/adapters/v2.B-build.mjs: `.ms2`
- [ ] app/test/behaviour/adapters/v2.D-meta-shell.mjs (opens `#pokemon`): `.pk-is` `.pk-rate` `.pk-pc` `.pk-fold` `data-pkjump` `data-pkopen` `.ms-rate` `.ms-bwi` `.ms2` `data-mstab` `data-mspan`
- [ ] app/test/forms-contrast.mjs (opens `#pokemon`): `.pk-forms`
- [ ] app/test/qcheck.cjs: `.mc-bg` `.mc-giant`
- [ ] app/test/v2-arena.mjs: `data-fbmistake`
- [ ] app/test/v2-back.mjs (opens `#pokemon`)
- [ ] app/test/v2-minors.mjs (opens `#pokemon`): `.pk-n` `.pk-gauge` `.pk-rg` `.pk-top` `.pk-card` `.pk-is` `.pk-rate` `.pk-bsr` `.pk-stats` `.pk-usual` `.ms-br` `.pk-list` `.trk-stamp` `.pk-forms` `data-fbmistake` `.ms-card` `.mc-id`
- [ ] app/test/v2-oddaddr.mjs (opens `#pokemon`)
- [ ] app/test/v2-pksrc.mjs (opens `#pokemon`): `.ms-br` `.pk-list` `data-pklists`
- [ ] app/test/v2-q24.mjs (opens `#pokemon`)
- [ ] app/test/v2-q72.mjs: `.trk-lines`
- [ ] app/test/v2-q84.mjs (opens `#pokemon`): `.pk-404`
- [ ] app/test/v2-s33.mjs (opens `#pokemon`)
- [ ] app/test/v2-today.mjs (opens `#pokemon`): `.pk-rate` `.tier-tag`
- [ ] app/test/v2-trkfit.mjs: `.trk-rc` `.trk-tot`
- [ ] app/test/v2-unbounded.mjs: `.trk-stamp` `.mc-id`

## 27. Page not found (#nonsense) (`#notfound`)

- Files: app/src/v2/shell.js (V2.nfHtml, V2.lostDog). Registered at shell.js:330.
- Browser title: "Page not found · NastyPlot". Phone height at 390: **943 px** with a team; desktop 1440: 900 px. No page errors.

### Sections, in order (built page, 390)

- [ ] H1: Nothing here.

Blocks with a label (tag.class [aria-label] : first heading/eyebrow):
- [ ] section.ra-h : Page not found
- [ ] aside.nf-dog [Today's underdog] : Today's underdog

### Controls (built page, 390 with a team; grouped by kind)

- [ ] "Go to Home" — a.np-btn → #home — hooks: none
- [ ] "Corviknight: open its info" — button:button.nf-dogst — hooks: `data-v2mon` (archetypes.js:34, battle-pbp.js:5)

### Numbers and facts shown (sample, 390 with a team)


### States


### Drawing functions (where in today's code)

### Test hooks (keep these names, or update the tests in the same change)

- [ ] No test file names this page's own hooks or address (checked by text search).

## Appendix: overlays opened from My Team (built page, 390)

### Team Sheet (`V2.openTeamSheet()`, `.ts2`)

- Height of the sheet at 390: 2284 px (page 3802).
- [ ] H2: Team Sheet
- [ ] "← My Team" — a.np-back — hooks: `data-v2close`
- [ ] "Copy for Showdown" — button:button.np-btn — hooks: `data-v2copy`
- [ ] "Share as Image" — button:button.np-btn2 — hooks: `data-ts2share`
- [ ] "01 CHARIZARD Y Mega Charizard Y", "02 GARCHOMP Garchomp", "03 INCINEROAR Incineroar" ×6 — button:button.tt-pick — hooks: `data-ts2edit`
- What it shows, in reading order (visible text, first 1,500 characters): ← My Team · Sun · Grassy Terrain · Tailwind · Reg M-C doubles · level 50 / Team Sheet / Copy for Showdown / Share as Image / Tap a column to edit its set · Big number: the stat at level 50 / team best in that stat / ▲ / raised by nature / ▼ / lowered by nature / points = stat points / (0–32) / Spreads: each one's most common / 01 / CHARIZARD Y / Mega / Charizard Y / 02 / GARCHOMP / Garchomp / 03 / INCINEROAR / Incineroar / Item	Charizardite Y	Choice Scarf	Sitrus Berry / Ability	Drought	Rough Skin	Intimidate / Nature / Modest / +SpA −Atk / Adamant / +Atk −SpA / Sassy / +SpD −Spe / Moves / Heat Wave / Protect / Solar Beam / Weather Ball / Dragon Claw / Earthquake / Rock Slide / Stomping Tantrum / Fake Out / Flare Blitz / Parting Shot / Throat Chop / Stats at level 50 / HP / 155 / 2 points / 185 / 2 points / 201 / 31 points / Atk / 111 / ▼ / lowered by nature, / 0 points / 200 / ▲ / raised by nature, / 32 points / 135 / 0 points / Def / 98 / 0 points / 115 / 0 points / 125 / 15 points / SpA / 232 / ▲ / raised by nature, / 32 points / , team best / 90 / ▼ / lowered by nature, / 0 points / 100 / 0 points / SpD / 135 / 0 points / 105 / 0 points / 143 / ▲ / raised by nature, / 20 points / , team best / Spe / 152 / 32 points / 154 / 32 points / 72 / ▼ / lowered by nature, / 0 points / 04 / WHIMSICOTT / Whimsicott / 05 / RILLABOOM / Rillaboom / 06 / KINGAMBIT / Kingambit / Item	Focus Sash	Miracle Seed	Life Orb / Ability	Prankster	Grassy Surge	Defiant / Nature / Timid / +Spe −Atk / Ada…

### Pokémon info sheet (`#sheet` Preview demo: Garchomp, `.ms2`)

- Height of the sheet at 390: 2586 px (page 3475).
- [ ] H2: Garchomp
- [ ] H3: Usually
- [ ] H3: Base Stats
- [ ] H3: Abilities
- [ ] H3: Type Matchups
- [ ] H3: Speed at Level 50
- [ ] "Build Around It" — button:button.np-btn2 — hooks: `data-hmaround`
- [ ] "Popular Sets" — button:button.np-btn2 — hooks: `data-mssets`
- [ ] "Compare all 3 ›" — button:button.np-link — hooks: `data-mstabgo`
- [ ] "Garchomp 92 · S tier", "Mega Garchomp 59 · D tier", "Mega Garchomp Z 87 · A tier" ×3 — button:button.ms-f — hooks: `data-v2mon`
- [ ] "Info", "Meta", "Rating" ×4 — button:button. — hooks: `data-mstab`
- [ ] "Charizard65% · 2,966 games", "Kingambit56% · 2,278 games", "Incineroar66% · 2,179 games" ×4 — button:button.ms-bwi — hooks: `data-v2mon`
- [ ] "–Showdowntiernot listed · lists Pokémon with 1%+ l" — a. — hooks: none
- [ ] "Mega Garchomp", "Mega Garchomp Z" ×2 — button:button.np-link — hooks: `data-v2mon`
- What it shows, in reading order (visible text, first 1,500 characters): GARCHOMP / GARCHOMP / Garchomp / Dragon / Ground / On your team ✓ / Build Around It / Popular Sets / 92 / S tier / Rating · #7 of 321 with tournament results / 14% / of teams / of 13.6k / 53% / win rate / 10,946 games / 231 / Speed / at level 50 / Forms · tap one to open it / Compare all 3 › / Garchomp / 92 · S tier / Mega Garchomp / 59 · D tier / Mega Garchomp Z / 87 · A tier / Info / Meta / Rating / Forms / Usually / Choice Scarf · Adamant · 32 Atk, 32 Spe, 2 HP / Dragon Claw / Earthquake / Rock Slide / Stomping Tantrum / Base Stats / HP / 108 / Attack / 130 / Defense / 95 / Sp. Atk / 80 / Sp. Def / 85 / Speed / 102 / Total / 600 / Abilities / Rough Skinmost used, 98% / Pokémon making contact with this Pokémon lose 1/8 of their max HP. / Sand Veil2.3% / If Sandstorm is active, this Pokémon's evasiveness is 1.25×; immunity to Sandstorm. / Share of players' sets with each Ability. / Type Matchups / 4× weak / Ice / 2× weak / Dragon / Fairy / Resists ½ / Fire / Poison / Rock / Immune / Electric / For its typing (Dragon / Ground) alone. Every other type hits it for normal damage. / Speed at Level 50 / What players run / 32 Speed points, Adamant (most common spread), Choice Scarf / 231 / outspeeds 98% of the top 30 / No Speed points / neutral nature / 122 / outspeeds 43% of the top 30 / Max Speed points / 32 points, neutral nature / 154 / outspeeds 62% of the top 30 / Max + Speed nature / 32 points, Speed-boosting nature (Timid, Jolly…) / 169 / outspeeds 70% of the top 30 / Choic…


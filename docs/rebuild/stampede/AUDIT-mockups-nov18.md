# Audit of the Stampede, Post Room and Dispatch mock-ups (look-only)

Written: Tue Nov 17, 2026, 9:26 PM Eastern (from `bash docs/rebuild/now.sh`). Helper agent, look-only: no site files changed.
Mock-ups read: the 12 pictures in docs/rebuild/{stampede,postroom,dispatch}/mockups/ (desktop 1440 wide; phone 780 = 390 at 2x).
Each was cut into crops and zoomed with PIL (`python3 -I`); crops in the helper's scratchpad.
Site data: a scratch copy of app/ + out/ at commit 61a91724, built with `node build.mjs --v2 --preview-data`.
Result line: `built dist/v2.html (3439 KB; 15 CSS layers, 7 data files, 48 scripts, 62 shared logic files)`.
The page was read with Playwright (V2.sdData(), V2.raNums(), V2.homeMeta(), page text of #meta, #events, #usage, #weekly) plus
out/calendar.json and out/meta_tour.json.

Labels: **checked** (how) / **measured** (number, how) / **unsure** (why).
Contrast is estimated from mock-up pixels. Anti-aliasing makes thin text read about 0.2-0.4 lower than its true colour, so
4.2-4.5 results are "borderline". Where our tokens give the exact colour, the token figure is quoted instead.

---

## 0. The ten most important findings

1. **"345" is not what V2.sdData() gives.** sdData().rated = **321**: it keeps only Pokémon with tournament results (`x.r.tc`).
   The Ratings page says "345 rated, ranked among 321 with tournament results". A herd drawn from sdData().rows has 321
   Pokémon, while the sentence above it says 345. Measured (Playwright, sdData and #meta's `.ra-legend`).
2. **A brand-new visitor already has a team: the sample "Sun Tailwind (sample)", Strength Score 93, Top tier.** The mock-up's
   "?" receipt ("a new visitor has no score") can't be shown to anyone unless the sample counts as "no team". HOME-10 and HOME-11
   expect the sample team and its note on Home. The plan board's "your leads" (Mega Charizard Y + Garchomp) are the sample
   team's leads. Checked (built page text; A-team.mjs HOME-10/11).
3. **Today's Home links 18 tools; the Stampede shows 12.** Lost from Home: Team Preview Practice, Compare Teams, This Week,
   Track Record, Usage and My Box (HOME-08 expects 18). After the switch, Compare Teams can only be found by search.
   Checked (home.js V2.HOME_TOOLS; grep of `#compare`).
4. **Five more Home features have no place in the mock-up:**
   - Most used on the ladder #1-#3 with its month/source line (HOME-02/03/04);
   - the Hidden Gems switch (HOME-14);
   - rating moves "This Week" (HOME-05);
   - What's New (HOME-13), which the brief's "kept" list doesn't name;
   - the underdog spot ("Build Around It").

   Section 2 says where each one can go.
5. **Type Chart "the highest rated of that type" is false for 7 of 18 types.**
   | Type | Mock-up shows | Highest rated (data) |
   |---|---|---|
   | Poison | Toxapex 56 | Sneasler 97 |
   | Ground | Excadrill 81 | Garchomp 92 |
   | Flying | Corviknight 62 | Mega Charizard Y 94 |
   | Psychic | Indeedee (F) 80 | Farigiraf 89 |
   | Rock | Mega Tyranitar 83 | Hisuian Arcanine 86 |
   | Ghost | Mega Gengar 77 | Basculegion 92 |
   | Steel | Archaludon 91 | Kingambit 96 |

   Measured (sdData rows).
6. **The gift list in the mock-ups matches op.gg, whose Terms forbid copying.** The mock-up's 100 Quick Coupons dates (Sep 8 to
   Dec 30) and Training Ticket start (Nov 12) are op.gg's. Serebii says Sep 9 to Dec 31; other outlets say Nov 11. The kind labels
   "Serial Code / Event Gift / Battle Pass" are op.gg's filter names.

   Nothing from the mock-ups' gift or news lists may be reused. Build POST only from official sources or two reputable outlets.
   Checked against docs/rebuild/research/mystery-gift-sources-nov18.md; that the other chat used op.gg is **unsure** (its brief
   only says "another site").
7. **"Ready" must read "Tournament ready"** on both receipts (desktop and phone). Checked (Word list).
8. **Text below 4.5:1 or below 13 px:**
   - Body text and links on the red post band: white on --pick is 4.14:1 (token). The measured "All 43 Gifts ›" is 3.95.
   - Gold "Battle Pass" stamp labels: 3.12 light / 2.26 dark.
   - The selected tab's count ("All 41"): 1.77.
   - Stamp kind labels: about 11 px.
   - Postmarks: about 9-10 px.
   - The Dispatch's winner names: about 11 px, 3.95 in lamplight.
9. **The phone hero buttons sit at 707-755 CSS px from the top.** They fit a bare 390x844 window above the site's 57 px tab bar.
   They do not fit iPhone Safari's visible height with its toolbars (about 660 px, an estimate, not measured). Desktop buttons start
   at about y=795 in the mock-up, below the fold of a 1366x768 or 1280x800 window. Measured from mock-up pixels.
10. **The phone line-up puts six names in one row at 390.** Even the mock-up's short names touch ("Incineroar Open"). A returning
    player's six (e.g. "Mega Charizard Y", "Indeedee (F)") cannot fit; it needs a layout decision. Measured (mock-up: the names span
    14-368 CSS px with no gaps).

---

## 1. Where the mock-ups break our rules

Columns: Where (page · section · mode · size) | What the mock-up shows | Rule | Fix | Label. "Both" = light and dark.

### 1a. Words (Word list, one name per action, plain words)

| # | Where | Mock-up shows | Rule | Fix | Label |
|---|---|---|---|---|---|
| W1 | Stampede · six band receipt · both · desktop + phone | Band strip "Ready" | Word list: 80s = "Tournament ready" | "Tournament ready" (--band-ready). Check that it fits the phone strip at 320 | checked |
| W2 | Stampede · six band · phone + desktop | "Paste it from Showdown ›" | 00q.4 same action, same words; the site says "Import a Team ›" (HOME-07/11) | "Import a Team ›" (or ask Sim to rename everywhere) | checked (home.js, A-team.mjs) |
| W3 | Stampede · line-up open rings · both | "Open" under a dashed ring | The site's empty slot is "Add a Pokémon" with the label "Add a Pokémon to slot N" (HOME-10/10b) | Visible word "Add" or "Add a Pokémon"; keep the spoken label | checked |
| W4 | Stampede · hero ledge · both | "See All Ratings ›" | The site's link is "All Ratings ›" (HOME-14, Dispatch) | "All Ratings ›" | checked |
| W5 | Stampede · tools band heading · both | "Twelve tools." | Today's Home lists 18 (HOME-08). "How We Calculate" is a page, not a tool | Either the 6 extra tools get a place (then the count changes) or Sim agrees to drop them from Home | checked |
| W6 | Stampede · How We Calculate block · both | "Every number on NastyPlot is built from them [13,826 tournament teams]" | Real data only: the Ratings page lists 4 data sources, and usage numbers come from the ladders | e.g. "See where every number comes from." | measured ("4 data sources", #meta) |
| W7 | Stampede · Winning Teams · phone | "Amyverse #18 winners, 9-1" | One player won ("the winner's six" on the Dispatch); the short event name is invented | "Amyverse VGC Champions Arena #18 · 9-1" via V2.evTitle; if it must be short, use evShort() and say so | checked (V2.evTitle output) |
| W8 | Stampede · Test Run plate · both | "Kingambit v top three" | Plain words; the site writes "VS" | "Kingambit vs the top three" | checked |
| W9 | Stampede · Popular Sets plate · both | "Annihilape · Choice Scarf" under "Popular Sets" | Real data: true for one winning team, not a popularity figure | Use a top Pokémon's most common item from `cs` (real), or label it as that team's item | checked (champ six: Annihilape Choice Scarf) |
| W10 | Dispatch · back page · both | "The Standings" (ratings), "Fixtures" (upcoming events) | One name per idea: Ratings / Next Events (Events page heading) | "Top Ratings" / "Next Events", or Sim approves the newspaper words | checked (#events text "Next Events") |
| W11 | Dispatch · Fixtures · both | "All 30 Events ›" next to Home's "113 events" | Counts agree across the site. 30 is the upcoming count ("Next Events … Show All 30 ›" on #events); 113 is counted events | "All 30 Next Events ›" or "Show All 30 ›" under "Next Events" | measured (#events text; calendar.json: 30 end on/after Nov 17) |
| W12 | Dispatch · story headlines · both | "Pokemon Champions Comes to Android…", "Info on Pokemon & Item…" | The site writes "Pokémon" | Decide: quote the source title exactly (it is their headline) or correct the accent. Recommend quoting exactly, because it is a link to their story | checked |
| W13 | Dispatch · masthead · both | "Every Pokémon Champions story in one paper" | Real data: the paper shows only what POST holds | "Pokémon Champions news, in one paper" (no "every") | unsure: wording for Sim |
| W14 | Post Room · stamp sheet heading · both | "Tap a Pokémon for the nature and moves it came with." | Real data: POST may not hold nature/moves (the brief says otherwise it opens the Pokémon page) | Show the line only when POST has the set; else "Tap a Pokémon for its page." | checked (brief) |
| W15 | Stampede post band · Post Room · Dispatch coupon | Dates written three ways: "Sent Nov 12, 2026", "Sent Nov 12", "Nov 12 – Nov 22", "Sep '26" | One format per idea across the family | One date helper (site style "Nov 12"; year only when not this year) | checked |

### 1b. Type, sizes and fonts

| # | Where | Mock-up shows | Rule | Fix | Label |
|---|---|---|---|---|---|
| T1 | Post Room · stamp sheet · both · desktop | Stamp kind labels "EVENT GIFT / SERIAL CODE / BATTLE PASS" at about 11 px | Type scale starts at 13 | --t13 caps | measured (cap height 8-9 px, zoomed crop) |
| T2 | Post Room · postmarks · both | "ENDED SEP 20" rotated, about 9-10 px | Scale 13+; text must be readable | 13 px, or make the postmark decorative (aria-hidden) and put "Ended Sep 20" as 13 px text under the stamp | measured (zoomed crop) |
| T3 | Dispatch · Latest Result · both · desktop | Winner names under the frames, about 11 px | Scale 13+ | --t13 | measured (zoomed crop) |
| T4 | Stampede · Speed Tiers, Battle, Type Chart names · desktop | Names about 13 px bold. OK, at the floor | | Keep 13 | measured |
| T5 | Dispatch · Interviews column, story lists in the post band mini · both | Story headlines in Instrument Sans, upright, about 17 px. The announcements beside them are Unbounded slanted | "Every headline … Unbounded, slanted, the whole headline" | Decide: treat interview and list items as body links (as Fixtures/Standings rows), or make them Unbounded. Recommend: list items stay Instrument Sans and are styled as links | unsure: Sim's call |
| T6 | Post Room + Dispatch · footer · both | A second tagline line "Sharply raise your win rate." in the footer | Header and footer stay as they are. The site footer has no tagline (checked: built footer text). The Stampede mock-up's footer matches the site | Use the site's footer unchanged | checked |
| T7 | Stampede · phone line-up names | Names in Instrument Sans (open point in the brief) | Allowed (names are not headlines) | Keep. The width problem is in section 3 | checked |
| T8 | All three · big code text "LA1CTRA1N1NG27" | Unbounded, digits blue, letters ink | Colour alone carries meaning (WCAG 1.4.1); screen readers read "LA1CTRA1N1NG27" as words | Keep the colours and add a spoken spelling (aria-label "L, A, one, C, T, R, A, one, N, one, N, G, two, seven"). Consider a face with a slashed zero and a serifed 1 | checked |

### 1c. Colours, tokens, boxes and lines

Mock-up surfaces measured (most common pixel):

| Surface | Light | Dark | Token today |
|---|---|---|---|
| Hero blue | #0078BF | #0A4C83 | light = --plot; dark: none |
| Post band red | #E83750 | #B91E39 | light ≈ --pick #E8364F; dark: none |
| Tools band | #EFEAE0 | #181826 | none (--wash is #F4F0EA) |
| Type Chart plate (dark) | n/a | #393962 | none |
| Feature plates (dark) | n/a | #08070E | none |
| Kraft parcel | #C49B62 | #634A2A | none |
| Label paper (dark) | n/a | #E7E1CF | none |
| Stamp/receipt paper (dark) | n/a | #DED7C7 | none |
| Dispatch paper | #FEFDF7 | #DCD4BE | none |

Every "none" needs a --sd-/--pr-/--dp- token in light AND dark. The build guard refuses colours outside tokens.css.

| # | Where | Mock-up shows | Rule | Fix | Label |
|---|---|---|---|---|---|
| C1 | Stampede · Ratings plate · both | Grey podium steps (#38373A) inside the ink plate (#17161B) inside the beige band | No boxes in boxes in different shades | Steps as outlines or the band colour, or Sim approves the podium as a drawing | measured (pixels) |
| C2 | Stampede · tools band · dark | Two card colours on one band: purple #393962 (Type Chart, small plates) and near-black #08070E (Battle, Ratings, Test Run) | "page + one card colour at most". The brief asks for both | Bring to Sim with pictures (the brief and our rule disagree) | measured |
| C3 | Dispatch · coupon · both | Cream paper > pale-yellow coupon > black code bar > white Copy Code button (4 shades nested) | No boxes in boxes | Coupon outline only (dashed red), on the paper colour; the code bar stays | measured |
| C4 | Post Room + Stampede post band | Kraft parcel > white label > black button (3 shades nested) | Same rule | It is an object, not a card; needs Sim's explicit yes as an exception | checked |
| C5 | Dispatch · whole page · both | Thick black double rules, heavy 1 px black boxes around the classifieds | Dividers are thin soft rules (--rule), not heavy dark lines | Newspaper look: Sim decides. Otherwise rules in --ink at low opacity | checked |
| C6 | Stampede · Type Chart · dark | The "Dark" flag (#5A4A56) on the purple plate is 1.26:1; the Dragon flag is 2.03:1 | Non-text contrast 3:1 for shapes that carry meaning | Lighter plate, or a 1 px light rim on flags in dark mode | measured (token maths) |
| C7 | Stampede · dark · dark-coloured sprites (Kingambit, Garchomp, Mega Gengar, Grimmsnarl) on #393962 / #08070E | The brief asks for "a soft light rim" | CLAUDE.md: sprite glow is off on mouse screens except feature sprites; never give filtered sprites their own layers | The rim must be one static drop-shadow, no will-change, and checked for scroll smoothness on Windows | checked (CLAUDE.md) |

### 1d. Contrast (text)

Measured from pixels: background is the most common colour; text is the strongest colour in the box. Token figures are exact.

| # | Where | Light | Dark | Verdict |
|---|---|---|---|---|
| K1 | Stampede · post band lede "Gift codes before…" (16 px) on red | 3.36 | 5.47 | **Fails in light.** White on --pick is 4.14:1 (token maths). Use a deeper red token for text areas, ink text, or 24 px+ |
| K2 | Stampede · "All 43 Gifts ›", "All 11 Stories ›" white on red | 3.95 | 6.45 | **Fails in light** (normal-size link) |
| K3 | Stampede · ticker names white on red (bold, about 26 px) | 3.95 | 6.07 | Passes as large text (3:1). Ink numbers 4.66 / pink 3.90 dark: pass as large |
| K4 | Post Room · stamp "BATTLE PASS" gold caps | 3.12 | 2.26 | **Fails** (and about 11 px) |
| K5 | Stampede post band · stamp "Battle Pass" | 4.36 | 3.30 | **Fails** |
| K6 | Post Room · stamp "EVENT GIFT" / "SERIAL CODE" | 4.73 / 5.50 | 4.21 / 4.22 | Dark borderline-fail |
| K7 | Post Room · selected tab count "41" (pale blue on light blue) | **1.77** | 4.87 | **Fails in light** |
| K8 | Post Room · label captions "CONTENTS / SERIAL CODE" | 5.77 | 4.28-4.36 | Dark borderline |
| K9 | Dispatch · Latest Result names (about 11 px) | 5.79 | 3.95 | **Fails in lamplight** |
| K10 | Dispatch · fixtures meta line / coupon small text | 5.79 / 6.33 | 4.69 / 4.75 | OK, close |
| K11 | Post Room footnote / Dispatch note under paper (grey) | 4.56 / 4.53 | 7.40 / 6.08 | Borderline in light; use --ink-3 (#66636E) |
| K12 | Stampede · Speed Tiers white on blue, "Live right now" plate | 4.2-4.4 | same | Token maths: white on --plot is 4.73. **Passes** with the token; the low reading is anti-aliasing |
| K13 | Type flags, white on --ty-* | 4.15-4.8 | | Token maths: 4.60 (Fighting) to 8.24 (Dark). **All pass** with our tokens |

### 1e. Tap targets (C8: 44x44 on touch widths) and controls

| # | Where | Mock-up size (CSS px, measured from pixels) | Fix |
|---|---|---|---|
| P1 | Stampede phone · "See All Ratings ›" inline, "Paste it from Showdown ›" | about 17-20 tall | 44 px hit area (padding) |
| P2 | Stampede phone · "Open" dashed rings | about 55x18 ring | The whole ring column is the button, 44+ tall |
| P3 | Stampede phone · "All 43 Gifts ›" / "All 11 Stories ›" | about 18 tall | 44 hit area |
| P4 | Post Room phone · filter tabs All / Pokémon / Items | about 35 tall | 44 |
| P5 | Dispatch phone · coupon "Copy Code" (white bar) | about 28 tall | 44 |
| P6 | Dispatch phone · "Read the Interview ›", "Read the Story ›", "All Ratings ›", "All 30 Events ›", classified links | about 16-20 tall | 44 hit areas |
| P7 | Desktop Copy Code buttons (Stampede strip 42, Post Room 42, Dispatch 27) | | 44 at 820/1024 (iPad uses the desktop layout) |
| P8 | Copy Code drawn three ways: black slanted button (Post Room, Stampede), white button in a black bar (Dispatch), full-width black bar (Post Room phone) | | One size and style per kind of control (CLAUDE.md polish list) |
| P9 | Stampede phone · Type Chart 6x3 sprites without names; phone Winning Teams six overlapping | | Each named Pokémon is a button with data-v2mon. Unnamed ones still need an accessible name, or must be aria-hidden decoration with a real list elsewhere |

### 1f. Layout and window sizes

| # | Where | Mock-up shows | Rule | Fix | Label |
|---|---|---|---|---|---|
| L1 | Stampede · hero · desktop | Buttons start about y=795 | Brief: "visible without scrolling on desktop" | Check at 1366x768, 1280x800 and 1440x900; shorten the hero or move the buttons up | measured (mock-up pixels) |
| L2 | Stampede · hero · phone | Buttons at 707-755 px | Same, on phone | Check in WebKit iPhone 13 with the tab bar | measured; Safari's visible height is **unsure** |
| L3 | Stampede · six band · desktop | Plan board labels "Mega Charizard Y" and "Mega Venusaur" run into the ring and the board edge (brief open point) | No text out of its box | Labels wrap or sit outside the ring, tested with the longest names | checked (crop) |
| L4 | Stampede · line-up · desktop | Filled rings (big, under beams) and open rings (small, lower) differ in size and baseline | C11 symmetry; brief says "six evenly spaced rings" | Same ring size and baseline for all six | checked (crop) |
| L5 | Stampede · hero · desktop | Whimsicott (88) drawn larger than Mega Raichu Y (93) | Brief: "sized by rating" | Size from the rating | unsure (by eye) |
| L6 | Post Room · hero · desktop | Empty strip right of the three numbers (about x 1080-1340) | No empty half / strip | Spread the numbers or widen the plate | checked (crop) |
| L7 | Post Room · stamp sheet | 12 stamps shown of 41; "All" would be 6 rows + 5 (desktop) or 13 rows + 2 (phone); "Pokémon 25" leaves a lone stamp at 6 across | No lone tile / half-filled row | Decide a rule (e.g. show a full-row count, then "Show All") | measured (41 mod 6 = 5, 25 mod 6 = 1, 16 mod 6 = 4) |
| L8 | Stampede · ticker · phone | Names cut at the screen edge ("rizard Y 94") | No motion yet; a still ticker must not show cut words | Static: whole names only, or Sim approves motion | checked |
| L9 | Dispatch · phone | The second interview headline is cut with "…" | No text cut | Full headline (it is short enough to wrap) | checked |
| L10 | Only 390 and 1440 drawn | No 600-1100 (iPad) layouts | Every window size | The builders define 820/1024/1100 and test 320-2560 | checked |

### 1g. Numbers and names against the site's data

Stampede:

| Item | Mock-up | Site data | Verdict |
|---|---|---|---|
| Rated | 345 | 345 on the Ratings page; sdData().rated = 321 (with tournament results) | **Agrees only if not taken from sdData** (finding 1) |
| Teams | 13,826 | RES.teams 13826 | agrees |
| Events | 113 | META.events 113; #events "113 events" | agrees |
| Hero top four | Sneasler 97, Rillaboom 97, Incineroar 96, Kingambit 96 | same | agrees |
| Hero tags | Mega Charizard Y 94, Mega Raichu Y 93 | same | agrees |
| Ticker | Garchomp…, Basculegion 92, Mega Floette 92, Archaludon 91, Gholdengo 91, Farigiraf 89, Pelipper 89 (phone from Mega Charizard Y 94) | same order | agrees |
| Base Speeds (nine highest rated) | Kingambit 50, Incineroar 60, Basculegion 78, Rillaboom 85, Mega Charizard Y 100, Garchomp 102, Mega Floette 102, Sneasler 120, Mega Raichu Y 130 | p.st[5]: same; the nine = ranks 1-9 | agrees |
| Line-up shares | Sneasler 37.7%, Rillaboom 46.4%, Incineroar 35.0% | V2.raNums(p).u 37.7 / 46.4 / 35.0 | **agrees, see note** |
| Type Chart | 11 of 18 right | Poison, Ground, Flying, Psychic, Rock, Ghost, Steel wrong (finding 5) | **disagrees** |
| Ratings podium | Rillaboom 97 / Sneasler 97 (higher step) / Incineroar 96 | Site ranks 1, 1, 3, 3 (ties share a rank) | **disagrees in drawing**: the 97s are on different steps |
| Latest winner | Amyverse VGC Champions Arena #18, Nov 9, 66 players, 9-1, Pelipper / Mega Venusaur / Archaludon / Mega Charizard Y / Grimmsnarl / Annihilape | homeChamp(): same. The raw name has "❤️ Cash Prize!", which V2.evTitle strips | agrees |
| Next event | LAIC, São Paulo, Nov 20-22 | calendar: "Latin America International (LAIC)", São Paulo, Nov 20-22 | agrees; the short name "LAIC" needs a rule |

Note on the line-up shares (measured): sdData's `p.u` gives other numbers (37.1 / 46.6 / 31.7). meta_tour.json's Usage list gives
37.9 / 38.1 / 32.7. Use V2.raNums(p).u, so Home matches the Ratings and Usage pages' "On tournament teams".

Dispatch:

| Item | Mock-up | Site data | Verdict |
|---|---|---|---|
| Standings | 1 Sneasler 97, 2 Rillaboom 97, 3 Incineroar 96, 3 Kingambit 96, 5 Mega Charizard Y 94 | Site ranks: 1, 1, 3, 3, 5 | **disagrees** ("2" should be "1") |
| Fixtures | LAIC Nov 20-22 São Paulo; Malaysia PBL Nov 21 Kuala Lumpur | calendar.json same | agrees |
| Story counts | "11 stories · 6 tournaments · 3 interviews"; "Earlier Editions · 4 more stories" | The front page shows 6 stories (1 lead + 3 interviews + 2 announcements), so 11 − 6 = 5 | **disagrees with itself** |

Gifts and news (no POST data exists yet; app/src/data/post.js is empty):

| Item | Mock-up | Verdict |
|---|---|---|
| Post Room counts | 2 to claim, 5 days, 43 so far; 41 stamps = 25 + 16 | Consistent with each other |
| Stampede gifts link | "All 43 Gifts" | Consistent |
| Days left | 5 and 43 from Nov 17 | Arithmetic right |
| Stamp order | Sep 20, Sep 20, Sep 29, Sep 29, Sep 29, Sep 3, Sep 3, Sep 8, Aug 30, Aug 31, Aug 4, Aug 4 | Not in end-date order. V2.postNow() sorts past gifts newest-end first, so the real page will differ. Follow the data |
| "Raichu was the gift for the mobile release" | | **unsure** and unchecked. The research found the early-download Dragonite + 100 Quick Coupons; Raichu is not confirmed |

Names:

| Mock-up writes | Site writes | Where |
|---|---|---|
| "Indeedee (Female)" | **"Indeedee (F)"** (V2.disp, measured) | Stampede stamp and Post Room stamp ("Indeedee (F)" is already right on the Type Chart and Dispatch) |
| "Mega Charizard Y", "Mega Raichu Y", "Mega Floette", "Mega Venusaur", "Mega Froslass", "Mega Tyranitar", "Mega Gengar" | same | correct |
| "Hisuian Arcanine" | "Hisuian Arcanine" | the right Rock pick, not drawn |

### 1h. Privacy, COPPA and copying

| # | Item | Fix | Label |
|---|---|---|---|
| X1 | The gift list and dates match op.gg (finding 6); op.gg's Terms forbid copying, and Serebii is "All Content ©" | Build POST from scratch: official news feed + 2 reputable outlets, each with a source link. Nothing from the mock-ups | checked (research doc vs mock-up dates); origin **unsure** |
| X2 | News headlines were copied by hand from "another site" | Headlines only from official pages (champions-news.pokemon-home.com, pokemon.com, champions.pokemon.com) with the link | unsure which site |
| X3 | No safety line for codes | Add the research's line, e.g. "Real codes never ask for your password." Never list single-use personal codes; link only official TPC pages, never social posts (13+ platforms) | checked (research doc) |
| X4 | "Read the Interview ›" leaves the site | Open in a new tab with rel="noopener" and say so to screen readers ("opens the source"). Only official hosts | checked (brief) |
| X5 | Player names: none shown in the mock-ups (good); the data's player is "Player 1" (scrubbed) | Keep it so: no player names on any of the three pages | checked (homeChamp().ev.top[0].player) |
| X6 | No forms or personal data in any mock-up | n/a | checked |

---

## 2. Feature map: today's Home after the Stampede

Every HOME test in app/test/behaviour/A-team.mjs was read. "Lives on" = where the feature is after the switch.
**LOST** = no place in the mock-up and no other page has it.

| Test | Feature (today) | After the Stampede | Status |
|---|---|---|---|
| HOME-01 | Tagline "Sharply raise your win rate." is the first heading | Hero band h1 | kept |
| HOME-02 | Most used on the ladder #1 tile opens its sheet | Not on the new Home. The Usage page (#usage, Meta tab) has a ranked list and podium per source (Ranked ladder / Online tournaments / Showdown ladder) | moved (test must be re-pointed); Home loses ladder usage |
| HOME-03 | #2, #3 tiles | Usage page podium | moved |
| HOME-04 | Line with month + source ("Most used in October, Showdown ladder"; "November's numbers arrive Dec 1") | Usage page shows a source line ("op.gg · official in-game Ranked Doubles, season M-8"). The month + "numbers arrive" line (V2.homeNext) is only in home.js | **at risk**: unsure whether Usage shows the month/next-date line (grep finds homeNext only in home.js) |
| HOME-05 / 05b | This Week rating moves (▲ up N points, rating matches the sheet) | Ratings page grandstand labels say "up N points this week" (meta.js:41, spoken label). #weekly shows usage-share moves, not rating moves | **partly LOST**: no visible list of rating moves outside Home |
| HOME-06 | Start buttons; "Score My Team" first with a team, "Build Me a Team" first without; plus Battle | Hero: Score My Team + Build Me a Team (mock-up order fixed). Battle is in the six band | kept only if the order still swaps (builders) |
| HOME-07 | "Import a Team ›" opens My Team with the Paste box | Six band link (mock-up "Paste it from Showdown", see W2) | kept (rename) |
| HOME-08 | 18 tool links each open their page | Tools band has 12. Practice: Battle page link (battle.js) + search. This Week: Meta tab. Track Record: Ratings page link. Usage: Meta tab. My Box: header icon. **Compare Teams: search only** | **Compare Teams LOST from Home** (search only); the others reachable |
| HOME-09 | Champion's six: Load Team (two taps, Undo), Copy for Showdown, "All N Events ›" | Winning Teams plate (brief: Load/Copy kept there). Also on Winning Teams and Events pages | kept, if the plate gets the buttons |
| HOME-10 | Your six vs Champion: lead/back/bench Game Plan line, "Set as Opponent" → Battle; empty: "Your six goes here", "Add your six", 6 add tiles | Plan board shows two leads each and Battle only. "Set as Opponent" exists on Winning Teams, Events and Test Run. The lead/back/bench line has no place | **partly LOST** (the back/bench plan and Set as Opponent on Home) |
| HOME-10b | Empty tile "Add a Pokémon to slot N" opens the add box for that slot | Open rings | kept if the rings are those buttons |
| HOME-11 / 11b | Sample-team note on Home | No place in the mock-up | **at risk** (must be placed; ties to finding 2) |
| HOME-12 | Welcome card on first visit, Got It | Brief says kept; no place drawn | undefined placement |
| HOME-13 | What's New fold after an update | Not drawn; not in the brief's "kept" list; WHATS_NEW is only used in home.js | **LOST unless placed** |
| HOME-14 | Top 10 ratings + Hidden Gems switch, rows open sheets, "All Ratings ›" | Hero plates + ticker show the top ratings. Ratings page marks gems with ◆ and counts them ("2 hidden gems"), but has no gems-only view (chips: Megas / No Megas / In my box) | **Hidden Gems list LOST** |
| HOME-15 | (already moved Nov 15) pairs → Practice, What Changed → This Week, Cores → Build, Your Games → Battle | Unchanged; "Winning Cores" plate opens Build's cores (keep data-hmcores behaviour) | kept |
| HOME-16 | Weather word "Sun team" / "Rain team" on your team | Brief keeps it; no place drawn | undefined placement |
| (no test) | The underdog spot ("The underdog of the night", Build Around It, Pokémon Page) | Not drawn | **LOST unless placed** (CLAUDE.md: rotating featured underdog) |
| (no test) | "Data as of" | Footer (unchanged) | kept |

---

## 3. What the mock-ups leave undefined (builders decide, Sim approves anything visual)

Stampede: who is looking
1. **The sample team.** A fresh visitor has "Sun Tailwind (sample)" scoring 93. Does the receipt show "?" or 93 + "sample" note? Does the line-up show the sample six?
2. **Partial teams (1-5 Pokémon).** Ring count; the score "so far" (G.partial); the plan needs 4+ Pokémon.
3. **Their leads for a returning player.** Champion's six leads? Today's Home plans vs the Champion (CH.fourVs). Also: what if there is no champion?
4. **Phone line-up with real names.** Six names at 390 don't fit (finding 10). Options: two rows of three; names under rings at 13 px with wrapping; names only for the filled.
5. **Start-button order switch** (HOME-06) in the hero.

Stampede: data edge cases
6. **Ties.** At the top four plates, the podium, the Standings and the nine for Speed Tiers. The site shares a rank (1, 1, 3, 3).
7. **Which Pokémon are in the herd** (345 vs 321, finding 1).
8. **Performance of the herd.** Up to 345 images in the first screen (static first screen budget 99 KB today). Decorative and aria-hidden; no new image files (511-file cap).
9. **Long names everywhere.** Hero plates and tags, ticker, Type Chart names (two-line), plan board labels, Winning Teams six, stamps, Standings. The longest names in our data: "Squawkabilly (Yellow)", "Mega Crabominable" (home.js note).
10. **No latest winner, or an event name with emoji/prize text** (V2.evTitle handles it).
11. **Data missing or 0.** RES.teams 0, sdData empty, no upcoming event ("Next:" line, Next event bar, Fixtures).
12. **An event today or running now** ("in 0 days" vs "Today" / "On now").

Post band and Post Room: gift counts and shapes
13. **Live gifts: 0, 1, 2, 3+, 5.**
    - Stampede shows 1 parcel + 1 small label: what is shown for 0 or 3+?
    - Post Room 2 side by side: 1 leaves a half-empty row; 3 gives a lone parcel.
    - The brief's empty line is for the Post Room only; the Stampede band's empty state is undefined.
14. **A gift with no code** (event gifts arrive in the mailbox): label without code, Copy Code and barcode? A very long gift name ("WCS2026 Cap and Shirt").
15. **Days-left stamp.** Red vs blue threshold; "1 day left" / "Last day" / "Ends today"; local day vs the UTC end.
16. **Copy fails** (clipboard blocked): fallback text selection, one toast (C6).
17. **Stamp sheet.**
    - Counts that are not full rows (L7).
    - The "Show All" state and "Show Fewer".
    - Item stamps not buttons (brief). Do Pokémon stamps open sets only when POST has them?

News and the Dispatch
18. **News: 0 stories.**
19. **A lead story that is not a tournament** (no "Ended" stamp).
20. **No interviews.**
21. **A headline longer than 4 lines.**
22. **Story pictures:** which ones have them, and the caption source.
23. **The edition number** ("No. 11"): what it counts.
24. **Series row with 7-12 months.** Desktop columns; the phone 3x2 grid then leaves a lone tile.
25. **Classified ads:** fixed copy or rotating; their words are not approved.

Pages and the site around them
26. **Menu placement of #gifts and #news** (open point). Breadcrumb "Home · Mystery Gifts" exists, but the header has no entry.
27. **Window sizes 600-1100** (iPad portrait and landscape) for all three pages; odd widths 340/412/768/1180/1366/1500/2560.

Dark mode, piece by piece
28. **Stampede dark mode.**
    - Hero dark blue #0A4C83, but Speed Tiers stays bright #0078BF in both. Intended?
    - Red #B91E39; tools band #181826; receipt and stamp paper #DED7C7.
    - The plan board's graph paper in dark.
    - The light rim on dark sprites (C7).
    - Dark Type Chart flags (C6).
    - Ticker colours (pink numbers 3.90).
29. **Post Room "Dim Paper".** Kraft #634A2A, label #E7E1CF; stamp art "slightly muted" (how: opacity or filter? Filters on sprites are a scrolling risk).
30. **Dispatch "Lamplight".** The glow at the top and the shadow under the paper must use tokens. Grey small text on tan falls to 3.95 (K9).

Motion and focus
31. **Motion** (charge, ticker, regroup): none until Sim approves; prefers-reduced-motion. The ticker as a still strip (L8).
32. **Keyboard order and focus** through overlapping slanted bands: tilted text is still selectable, and focus rings are visible on a slant.
33. **Home features with no drawn place:** welcome card, What's New, sample note, weather word, Set as Opponent, the lead/back/bench line, Hidden Gems, ladder Most used, rating moves, the underdog, the 6 extra tool links (section 2).

---

## Appendix: commands and result lines

- Build: `cd <scratch>/copy/app && node build.mjs --v2 --preview-data`.
  Result: "v2 guard: clean (...)" and "built dist/v2.html (3439 KB; ...)". The page builds; my data reads come from this build.
- `V2.sdData()`: `rated 321, teams 13826, events 113`. Its "rated" counts only Pokémon with tournament results.
- #meta `.ra-legend`: "345 rated, ranked among 321 with tournament results". The Ratings page's 345 is all rated Pokémon.
- `V2.homeMeta()` ranks: "1 Sneasler … 1 Rillaboom … 3 Incineroar … 3 Kingambit … 5 Mega Charizard Y". Ties share a rank.
- `V2.raNums(p).u`: Sneasler 37.7, Rillaboom 46.4, Incineroar 35. These are the mock-up's line-up numbers.
- #events text: "113 events … Next Events … Show All 30 ›". 30 is the upcoming list; 113 is counted events.
- out/calendar.json: 30 events end on/after 2026-11-17. LAIC 2026-11-20..22 São Paulo; Malaysia PBL 2026-11-21 Kuala Lumpur.
- Built footer text: "NastyPlot is an unofficial, fan-made tool, … Data as of Nov 10 (8 days old). How We Calculate About Privacy Contact
  Sources and Credits". There is no tagline line in the site footer.

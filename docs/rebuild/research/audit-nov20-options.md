# Outside audit Nov 20, F3-F16: what is real, what is decided, and options for Sim

Written Fri Nov 20, 2026, 8:10 AM Eastern (time from `bash docs/rebuild/now.sh`). Look-only helper: no site code changed.

Built page: `t1rules` (b50602b4) + merge of `q59` (abfbde9e) and `q60` (7f5c928c), frozen data `out/` from `0c992f69`,
`cd app && node build.mjs --v2 --preview-data --art=../src/v2/art/` -> "v2 guard: clean", dist/v2.html 3,930,935 bytes.
A second build with today's `out/track.json` (origin/main 69de904f, Nov 20) was used only for F7/F15.
Every option was prototyped by injecting CSS (or a small text/DOM change) with Playwright into that built page; nothing in the
repo's site code was edited. Scripts: scratchpad `a20/` (m.cjs runner, *.js measures, *.css options). Chromium 1148 only, no WebKit.
Pictures: `docs/rebuild/pics/nov20/audit/` (JPEG, labelled; only RECOMMENDED pictures have the green band).

## 1. Sort of F3-F16

| # | Real on this build? (how measured) | Already decided? |
|---|---|---|
| F3 hero facts 4 px apart | Yes: gap 4 px at 360-420 on Usage and Meta (8 at 320/430/600, 24 from 768); `.gs-facts` boxes, 10 widths | **Yes** (W4, list below) |
| F4 taps under 44 | **Mostly not**: top menu real hit boxes 44x44 at 700/768/820/1024/1099 on Home, Meta, Calc (elementFromPoint walk); the text links named in F4 all have 44 px hit layers (e.g. Build Me a Team 121x44, All Mystery Gifts 108x44, How It Works 102x44, 0 of 4 112x50). **Real**: News + Home news headline links 20-30 px tall at 1024 touch. **New, real bug**: see Q-A1 | No |
| F5 My Team iPad empty column | Yes: Suggestions ends 424-636 px below the right column at 700-1099 (616 at 768, 528 at 1024) | No (Q5 A was desktop only; "tablets not asked") |
| F6 glass bars | Not re-measured | **Yes** (glass, list below) |
| F7 Track Record bands + % | Bands: yes, still 90/70-89/53-69/under 53, also on today's live data (no "bands" stamp: main's track.mjs lacks it, 0 matches for "bands"). % beside "29 of 29": yes | Bands **yes** (3h); the % wording no |
| F8 Home phone length | Yes but a limit question: first visit 6,458 px at 390 (c13-check, data note not counted; "OVER 6350"), 320 7,117 (OVER 6900). Returning visitor 6,110 = 7.24 screens (passes the 7.3 test). The welcome card is the difference (+417 px) | Partly (list below) |
| F9 podium #5 drops | Yes at 320-599: numbers 16-17 px lower in the row with "Mega Charizard Y" (2 lines); 0 from 600 | No |
| F10 Home 1024 titles / More tools | Yes at 700-1099: Events title x 376 vs How We Calculate 348 (820-1099; 12/10 px at 700/768); More tools 3x2 using 48-401 of the width. 1100+ fine | No |
| F11 "Twelve / tools." | Yes at 700-1279 ("Same herd. Twelve / tools."); one line from 1280; phones break after "herd." | No |
| F12 chips | Yes: Events/Gifts filter chips leave 32-137 px empty at 320-430, widths differ by 37-66 px. **Also new**: their labels sit at the top of the 44 px chip (text 1 px above the top, 25 px space below) at 390-1440 (only `.ev-fc`; swept every page at 390/1440, no other chip) | No |
| F13 This Week header | Yes, centred title | **Yes** (designer brief, list below) |
| F14 words | Real: Usage "3 more›" has 0 px before › (others 3 px; the space is swallowed by the hidden " moves" span). Home "All 69 Stories ›" vs News "50 stories in the past 12 months": both correct (69 = every story; 50 = past 12 months, no maintenance notes, dispatch.js line 77). **Not real**: Refresh Suggestions has no › because it redoes the list in place (Sim's Q6, decisions.md line 1075); Events "Show All 30 ›" opens in place while News "All 30 Next Events ›" goes to another page; Meta C says "10 Pokémon" because all 10 are shown (no See All needed) | Meta bands: Q60 C |
| F15 Week by Week one line | **Not real on today's data**: the Preview data has 2 event weeks; today's has 73 events in 4 weeks and draws the full-width chart (built with today's track.json, checked at 1440) | - |
| F16 Also ranked 61-100 at 1440 | Real but minor: 3 lines of 13 px, plain names, 59 px tall | Phones: Q42 A |

## 2. Already decided (one line each, decision time from docs/rebuild/decisions.md)
- F3: Sim chose W4 (4 px less gap at 360-420), Thu Nov 19, 4:54 AM ("go with recommended for all the questions"); built 8:40/8:54 AM. Still 4 px today, as built.
- F6: Sim, Nov 11: "i liked the glass" (frosted bars back, 92% opaque); Nov 11, 9:39 PM "glass kept". RULES.md 1.6 still says text behind must not be legible; the audit asks for one look on his iPhone.
- F7 (bands): Sim's yes to 3h, Tue Nov 17, 9:14 AM; 10:49 AM "3h live with the switch". The new groups arrive when the rebuild's track.mjs runs on main.
- F8 (length): Sim Nov 18, 8:12 AM (shorter phone Home, about 6.9 screens) and Sim's Q23 lines (Nov 19; Home 7.24 screens, logged 12:05 PM). The first-visit limit (6,350 at 390) was never Sim-agreed (c13-check says "not Sim-agreed") -> asked as Q-F.
- F13: Sim's designer brief "This Week 'The Front Page'" (received Sat Nov 14, 11:20 PM): "This Week as a very large centred headline".
- F14 (Meta): Q60 C, Thu Nov 19, 11:45 PM (tier words in the band; D/F folded); "10 Pokémon" is that design.
- F16 (phones): Q42 A, Thu Nov 19, 8:25 PM ('Also ranked 61-100' folded on phones). Desktop never asked.

## 3. Options, measured (rec = recommended)

### A1. NEW BUG: on iPad portrait, tapping "Build Me a Team" opens Import a Team
- My Team sample note, 700-819 wide: the two links stack 20 px apart and Import's 44 px tap layer covers Build's text.
  Measured (60 points on "Build Me a Team" per width): 36/60 open Import at 700/720/768/800; 0/60 at the other 15 widths 320-1920.
- Rec: 24 px gap between the two stacked links at 700-819 (`.tm-sample-acts{row-gap:var(--s6)}`): 0/60 wrong at 700/768/800/819/820, page +24 px. Why: each link gets its own 44 px area with no other change.
- Alternative tried, does not work: both links on one line (smaller gap, nowrap): still stacked at 700/768 (no room), 36/60 wrong. So no real alternative.
- Pictures: a1-sample-768-now.jpg, a1-sample-768-rec.jpg (tints show the tap areas), a1-sample-768-night-rec.jpg.

### A2. News headline links too small to tap on iPad landscape (F4, real part)
- Today's 44 px rule for `.dp-hl` is only under 1000 wide; at 1024 touch the In Brief links are 22 px, Home's news card 20 px (real hit height by elementFromPoint).
- Rec: an invisible 44 px tap layer on every touch screen (`@media (pointer:coarse){.dp-hl{position:relative}.dp-hl::before{content:"";position:absolute;left:0;right:0;top:50%;height:max(100%,44px);transform:translateY(-50%)}}`). Measured day+night, 390/768/1024/1099: every headline 44-46 px at 1024 (News and Home), page length unchanged (News 1024 2,760, Home 6,788), no headline's own text lands on a neighbour. Mouse 1440 untouched. Why: fixes the tap size with nothing moving on screen. Open: at 1099 one News headline still measures 23 px (not explained yet; look when built).
- Alt: today's phone rule (44 px boxes) on all touch widths: also 44 px, but News 1024 +100 px, Home +38 px and visible gaps under each headline.
- Pictures: a2-news-1024-now.jpg, a2-news-1024-rec.jpg, a2-news-1024-alt.jpg (tints show tap areas), a2-news-1024-night-rec.jpg (clean).

### B. My Team on iPad: Suggestions runs on beside an empty column (F5)
- Rec: at 700-1099, Suggestions full width under Matchups, then Team Checks | Your Games side by side, plus Adjust Suggestions folded as on desktop and phones (grid areas "mu mu" "sg sg" "ck yg").
  Measured (day, 700/768/820/1024/1099): empty strip 424-636 -> 75-79 px (the two side-by-side blocks differ by 75 px); page 4,656 -> 4,511 at 768 (-145), 3,688 -> 3,554 at 1024, 3,827 -> 3,762 at 820; no sideways scroll. Why: no empty half, and the page gets shorter. Side effect seen: at 768 the swap row is wide (Sneasler ... -> Mega Floette with a big gap, the F1 row).
- Alt: only fold Adjust Suggestions (keep the two columns): empty strip still 266-398 px; page -238 px at 768.
- Pictures: b-team-768-now.jpg, b-team-768-rec.jpg, b-team-768-alt.jpg, b-team-768-night-now.jpg, b-team-768-night-rec.jpg, b-team-1024-now.jpg, b-team-1024-rec.jpg.

### C. Home on iPad: two tidy-ups (F10, F11)
- Rec, 700-1099: Events row loses its 28 px card padding and both numbers get one 280 px column -> both titles at x 348 at 700/720/768/800/820/1024/1099, day and night; More tools as one row of six spread across the full width (48-976 at 1024), page -44 px. Headline: "Same herd." / "Twelve tools." on two lines at 700-1279 (the second sentence as its own line, as phones). Phones and 1280+ unchanged (measured 320/390/699/1280/1440). Why: one left edge, a full row instead of a third, no lone word.
- Alt: same left edge; More tools as 3 even columns across the full width (2 rows, page unchanged); headline with text-wrap: balance (same break today, depends on browser support).
- Pictures: c-home-1024-now.jpg, c-home-1024-rec.jpg, c-home-1024-alt.jpg, c-home-1024-night-rec.jpg, c-home-768-rec.jpg, c-herd-1024-now.jpg, c-herd-1024-rec.jpg, c-herd-1100-night-rec.jpg.

### D1. Usage podium on phones: one row of numbers drops (F9)
- Rec: under 600 every bench name gets the Grandstand's "MEGA" tag line (`.gs-mg`, the same tag as "Usually alongside" on this page); names without one keep the line empty, so rows stay level. Measured 320/360/390/430/599: 0 px spread in both rows (was 16-17); 600/1440 unchanged; page +15/16 px at 360-599, 0 at 320. Why: same Mega look as the rest of the page and level rows whatever the names.
- Alt: a fixed two-line name box under 600: also 0 px spread, same +16 px, keeps "Mega Charizard / Y" broken.
- Pictures: d1-podium-390-now.jpg, d1-podium-390-rec.jpg, d1-podium-390-alt.jpg, d1-podium-320-now.jpg, d1-podium-320-rec.jpg, d1-podium-390-night-rec.jpg.

### D2. Events and Gifts filter chips (F12 + new centring bug)
- Rec: under 700 the three chips grow to fill the row (keeping their own widths), and on every width the label is centred in its 44 px chip (`.ev-fc{flex-wrap:wrap;align-content:center}`). Measured 320-699: 0 px empty (was 32-137), chip height unchanged, page unchanged; label 11-13 px from top and bottom at 390-1440 (was -1 / 25). Why: fills the row with no wrapped labels.
- Alt: three equal columns (as the Usage source chips): 0 px empty and equal widths, but "100+ players / 25" wraps at 320-430 and chips grow 46 -> 64 px at 320/360 (Events +18 px).
- Pictures: d2-chips-events-390-now.jpg, d2-chips-events-390-rec.jpg, d2-chips-events-390-alt.jpg, d2-chips-gifts-390-now.jpg, d2-chips-gifts-390-rec.jpg, d2-chips-gifts-390-alt.jpg, d2-chips-events-320-rec.jpg, d2-chips-events-320-alt.jpg, d2-chips-events-390-night-rec.jpg, d2-chips-events-390-night-alt.jpg, d2-chips-events-1440-now.jpg, d2-chips-events-1440-fix.jpg.

### E. Small words (F14, F7, F16)
- E1 Usage "3 more›": rec put the space outside the hidden word (`3 more <span class="vh">moves</span>›` or a no-break space): measured gap 0 -> 3 px, same as "Ratings ›". No alternative needed (a bug). Pictures e1-more-390-now.jpg, e1-more-390-rec.jpg.
- E2 Track Record "8.7%" beside "29 of 29 Pokémon made a top 8": rec "29 of 29 made at least one top 8" (two different measures read as different). Alt: "8.7% each" on the number. Checked by eye at 390 and 1440 (fits, no wrap). Pictures e2-track-390-now/rec/alt.jpg, e2-track-1440-now/rec.jpg.
- E3 "All 69 Stories ›" (Home) vs "50 stories in the past 12 months" (News): rec keep; both true and "All 10 Gifts ›" beside it uses the same pattern. Alt: drop the count ("All Stories ›"). Picture e3-stories-1440-now.jpg.
- E4 Usage 1440 "Also ranked 61-100": rec keep (3 lines of fine print, nothing broken, nothing empty). Alt: fold it as on phones (Q42 A). Picture e4-also-ranked-1440-now.jpg.

### F. Home on phones, first visit (F8)
- Measured (c13-check, Chromium, this build): 390 6,458 px vs the unagreed 6,350 limit; 320 7,117 vs 6,900. Returning visitor 6,110 (7.24 screens), the figure Sim's Q23 accepted. The difference is the "New here?" card (+417 px), shown until "Got It".
- Rec: set the first-visit limits to measured + about 50 (390 6,500, 320 7,150) and keep the returning-visitor 7.3-screen test as the real guard. Why: the card shows once, and it is the first-visit guide.
- Alt: fold the card's three steps behind "New here?" (not prototyped; would save most of the 417 px).
- Picture: f-home-390-welcome.jpg.

## 4. Not covered
WebKit (no Safari engine run), real iPhone/iPad, every page state; the prototypes are injected CSS, so a real build must be re-measured (and the full check run). E2 text checked by eye only.

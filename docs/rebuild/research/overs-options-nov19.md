# Height overs, second set of options (look-only), Nov 18 evening

Written time: 8:42 PM (8:42:17)  date: Wed Nov 18, 2026 (from `bash docs/rebuild/now.sh`; the file name says nov19 as the brief asked).
Branch: helper worktree from claude/design6 at 79a10ddf. Follows docs/rebuild/research/heights-after-merge-nov19.md, whose first options broke
Sim's rules (a lone last tile on Battle phones, Meta's "+N more" undoing the Nov 14 Grandstand, Battle 1440 with no way under).
No committed code, test, limit or data changed. Every option below is a temporary CSS/JS change in the browser (scratch scripts, not committed),
measured on the built page. Question labels Qa-Qd are placeholders for the main thread to renumber.

## How it was measured
- Build: `cd app && node build.mjs --v2 --preview-data --art=../src/v2/art/` -> `built dist/v2.html (3753 KB; 16 CSS layers, 7 data files, 48 scripts, 62 shared logic files)`.
- Browser: CI's Chromium 131 (Playwright build 1148, PLAYWRIGHT_BROWSERS_PATH=scratchpad/pw1148). WebKit not run (not on this machine).
- Official tool, today's state: `C13_ENGINES=chromium node experiments/c13-check.mjs app/dist/v2.html meta,battle,usage default`
  -> `c13 check (default; chromium): 12 page/width runs; 6 over height; 66s.` Lines used: battle 320 `height 4815 OVER 4740`, battle 390
  `height 4380 OVER 4270`, battle 1440 `height 2227 OVER 2160`, usage 1440 `height 2150 OVER 2110`, meta 820 `height 4023 OVER 4020`, meta 1440
  `height 2923 OVER 2860`. Plain meaning: the same 6 overs as the first report, in CI's browser (Battle 320 is 25 px worse here than in Chrome 153:
  4,815 vs 4,790).
- Mock-ups: a scratch copy of c13-check's setup (same data feed, same states and waits, same height formula: page height minus the data note).
  Check that it matches: with no mock applied it gave exactly c13's numbers (battle 4815 / 4380 / 2227, usage 2150, meta 4023 / 2923), fonts
  loaded `Instrument Sans+Unbounded`, 0 page errors. Each mock line below is `before X after Y`, then sideways scroll (0 = none) and the c13
  repeated-lines count.
- Battle depends on the opponent. c13 checks one (Enter Their Six, first team: the Buenos Aires champion). I also ran all 10 teams that list
  offers (the Test Run teams), no change vs each option (results in Qa/Qb). Opponents are numbered #1-#10 in the order that list shows them
  (#1 = c13's default).

## Qa. Battle on phones: 390 4,380 vs 4,270 (+110), 320 4,815 vs 4,740 (+75)
Finding first (rule C3, checked): the page says the same thing several times. c13's own line today: `repeated 2 [2x "Mega one of two Megas: only
one can evolve"; 3x "Fake Out can flinch one of your leads turn 1"]`. The Read already counts Fake Out (with names) and names the Biggest threat's
Mega line; Watch Out then repeats both. With another opponent (#4 in the list) Trick Room is said twice and the Biggest threat's Flash Fire line
twice. Watch Out is 379 px at 390 for the default opponent; most of that is the repeats.

"Say it once" (used in options A-C): Watch Out lists only what The Read hasn't said, each line once. Fake Out lines go (The Read counts and names
them); the two-Megas line goes and The Read's Biggest threat names the other Mega ("Mega: one of two Megas (the other is Mega Raichu Y): only one
can evolve"); the Biggest threat's own line goes; a line two of their six share is said once ("(also Indeedee (F))"); a Pokémon with nothing left
leaves the list, and the count above it counts what is left ("2 more of their six can shut something down"). Nothing a player needs is dropped:
every fact is still on the page once.

More Ways to Prep (five tools, five full-width rows, 328 px at 390). Layouts tried, all with even rows:
- **A (RECOMMENDED): say it once + Team Preview Practice as a full-width row with its description, the other four 2 by 2 (names, ›)**. The same
  shape Sim approved for Home's phone tools (Practice big, small plates 2 by 2). Default opponent: 390 `after 4091` (179 under), 320 `after 4481`
  (259 under). Ten opponents: 390 under for 9 of 10 (highest 4,370, opponent #4, over by 100), 320 under for 9 of 10 (highest 4,748, over by 8).
  Why: it fixes the C3 repeats and leaves the most margin of the options that keep every tool in view; Practice keeps the spot Sim gave it on Home.
  Against: the four small tools lose their one-line descriptions on phones (kept on the tools bar at 700+; not added as spoken labels in the mock).
  Pictures: overs2-qa-optA-RECOMMENDED-battle-390.png, overs2-qa-optA-RECOMMENDED-battle-320.png
- **B: say it once, tools list as now.** Default: 390 `after 4223` (47 under), 320 `after 4613` (127 under). Ten opponents: 390 under for 7 of 10,
  320 under for 8 of 10. Picture: overs2-qa-optB-battle-390.png
- **C: say it once + the tools as one swipe row** (cards with name and description, as Meta's phone tiers swipe). Default: 390 `after 4040`,
  320 `after 4410` (not swept over the ten). Against: about two and a half tools in view; the rest need a swipe (less findable).
  Picture: overs2-qa-optC-battle-390.png
- **D: no change.** 390 over for all 10 opponents (4,300-4,572); 320 under for 3 of 10. Picture: overs2-qa-optD-no-change-battle-390.png
- Tried and dropped: a 2 + 3 grid (two halves, then three thirds): 390 `after 4191`, but at 320 "Speed Tiers", "Damage Calc" and "Team Preview
  Practice" wrap to two lines in their tiles. Tools-only change without say-it-once (A's grid alone): 390 `after 4248` (22 under, thin).

## Qb. Battle at 1440: 2,227 vs 2,160 (+67)
Repeats fixed first (same "say it once" as Qa). Then what else uses space poorly, measured: the three columns (The Read | From Real Games |
Watch Out) stretch to the tallest; after the fix their content is 271 / 207 / 206 px, so 64 px of empty space under two columns; the detail tabs
(Damage Both Ways · Who Moves First · Deeper Read) take a full-width row of 56 px for three short links.
- **A (RECOMMENDED): say it once.** `after 2119` (41 under); c13-style repeated lines 0. Ten opponents: 7 of 10 under; over: #2 2,180 (+20),
  #8 2,219 (+59), #4 2,357 (+197: Watch Out still has 5 Pokémon with different lines, all real). Why: it fixes the rule C3 break (the Mega line
  3 times, Fake Out 4 times) and that alone gets today's check under. Picture: overs2-qb-optA-RECOMMENDED-battle-1440.png
- **B: no change.** Over for all 10 opponents (2,174-2,446). Picture: overs2-qb-optB-no-change-battle-1440.png
- Tried and dropped: say it once + the detail tabs moved up into the empty space under From Real Games / Watch Out: 1440 `after 2079`, only 40 px
  more, and at 1100 the two-column layout put the tabs in an odd place. Not offered.

## Qc. Usage at 1440: 2,150 vs 2,110 (+40)
The "Also ranked 61–256" line is a 3-line wall of 40 names + "and 156 more" (the names are not tappable). Also measured: in "How Sneasler is
played" the Moves list is 8 rows while Abilities and Natures are 3, leaving a large empty block under them.
- **A (RECOMMENDED): the names become a "Ranks 61–256 ›" link on one row with "Ranks 11–60 ›"** (tap shows the same names in place).
  1440 `after 2076` (34 under); also 820 `after 2953`, 390 `after 3508`, 320 `after 3697` (Usage 320 had only 62 px to spare today).
  Why: the same pattern as Ranks 11–60, nothing removed, and the line grows with the daily ranks list, so it is a recurring risk on every width.
  Picture: overs2-qc-optA-RECOMMENDED-usage-1440.png
- **B: "Usually alongside" moves up beside the Moves list** (desktop 1100+; the four lists keep their places, the names line stays). 1440
  `after 2044` (66 under), 1280 `after 2075`, 1100 `after 2098`. Against: a smaller empty strip stays under Abilities and Natures.
  Picture: overs2-qc-optB-usage-1440.png
- **C: A and B.** 1440 `after 1969`. Picture: overs2-qc-optC-usage-1440.png
- **D: no change.** Picture: overs2-qc-optD-no-change-usage-1440.png

## Qd. Meta: 820 4,023 vs 4,020 (+3); 1440 2,923 vs 2,860 (+63)
Why a pixel limit can't hold here (checked, scratch probe of the built page): the Grandstand shows every S-D Pokémon (Sim, Nov 14); rows per tier
come from the day's count (meta.js gsLay: desktop up to 12 across, at most 2 rows per tier, F 1; iPad 6 across, at most 3, D 2, F 1). Today at
1440: S 11 (1 row), A 17 (2), B 11 (1), C 10 (1), D 19 (2), F 12 (1) = 8 rows; each second row costs 158-162 px (A 239 -> 401, C/D 219 -> 377).
At 820: 12 rows (S 2, A 3, B 2, C 2, D 2, F 1), rows 155-187 px. So the page jumps by about 160-190 px whenever one tier's count crosses a row
boundary, on any day. The page outside the Grandstand is steady: 1440 1,082 px, 820 1,499, 390 1,724, 320 1,871. Phones are not affected (one
swipe row per tier; 320/390 are 1,141 / 1,068 under).
- **A (RECOMMENDED): Grandstand unchanged; the check follows a rule instead of one pixel number.** (1) The page outside the Grandstand gets a
  fixed limit: today + 50, rounded up to 50: 1440 1,150; 820 1,550 (320 1,950; 390 1,800). Any growth outside the stand fails as today.
  (2) The Grandstand is checked by its rows: it may use only the rows the day's tier counts need under the layout's caps, each row no taller than
  today's tallest at that width (1440 187 px, 820 187 px). The caps bound the worst case: 1440 at most 11 rows (about 3,460 px page, today 8),
  820 at most 15 rows (about 4,550, today 12). Why: the Grandstand's height is set by how many real Pokémon are in each tier that day; a pixel
  limit on it fails on random days, while this rule still catches anything else that grows and keeps Sim's Nov 14 choice exactly. This is not
  "raising the limit to pass": the rest of the page gets a tighter limit than today. Needs Sim's yes (limits are hers, C1); not built in c13-check.
  Pictures (page as it stays): overs2-qd-optA-RECOMMENDED-meta-1440.png, overs2-qd-optA-RECOMMENDED-meta-820.png
- **B: back rows stand further back.** A tier's second and third rows show smaller Pokémon (S 68, A 60, B/C 56, D 52 px instead of 96-72) and a
  20 px score; every Pokémon still shown. 1440 `after 2854` (6 under, thin), 820 `after 3808` (212 under). Still moves with the data (each crossing
  now about 125 px at 1440). Pictures: overs2-qd-optB-meta-1440.png, overs2-qd-optB-meta-820.png
- **C: no change.** Over today; will move with the data. Pictures: overs2-qd-optC-no-change-meta-1440.png, overs2-qd-optC-no-change-meta-820.png
- Not offered: "+N more" per tier (the first report's A): it hides 14 Pokémon on desktop today and undoes Sim's Nov 14 Grandstand choice.

## Unsure / not checked
- WebKit not run; widths other than 320/390/820/1100/1280/1440 not checked; night mode not checked; no use test (tap, tab) on any mock-up.
- Battle's limit is checked on one opponent, but heights swing by about 270 px between the 10 listed opponents (390: 4,300-4,572; 1440:
  2,174-2,446, no change). Even with Qa A / Qb A, opponent #4 stays over (390 4,370; 1440 2,357). Whether Battle's limit should be judged on
  one opponent, the tallest, or most of them is a question for the lead / Sim (the same daily-content problem as Meta). Not decided here.
- Seen in passing, not changed: The Read's "Biggest threat" for the default opponent is Mega Baxcalibur because of the line "Mega: one of two
  Megas: only one can evolve", which is not a threat reason. I'm unsure whether that pick rule is intended.
- Qa A's four small tools have no descriptions on phones in the mock; whether they should keep them as spoken labels (as Home's tools did
  Nov 16) is not decided.
- The say-it-once mock rewrites the page after it is drawn; the real change would be in battle.js (battleRead / battleWatch). Its text
  ("2 more of their six…", "(the other is …)", "(also …)") is mock wording for Sim's review, not checked against the Word list beyond the
  names it uses (The Read, Watch Out, Biggest threat).

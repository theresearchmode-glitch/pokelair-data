# Decision summary, design + executive authority 3:13 PM Mon Nov 23 -> 9:00 AM Tue Nov 24 (DRAFT, finished before 9 AM)
Source: docs/rebuild/decisions.md (every entry with its logged time). Pictures were sent in chat with each design decision.

## Design decisions HH made on his own authority (each sent to Sim with pictures)
- 5:59 PM Item drawings v2 (slant, bright type colours, new Rocky Helmet). Superseded 9:38 PM by Sim's real-image choice.
- 6:02 PM Item bag above the name on phones (long names stopped breaking).
- 6:47 PM Damage Calc: chosen-move ring wide enough to clear the first letters.
- 6:55 PM Natures page accepted (5x5 grid, the big four bar, the line-up; lighter low-share squares for readable text).
- 8:08 PM Search finds the 18 types (symbol tile always with the name); picking opens the Type Chart on it.
- 8:19 PM Damage Calc KO Board rows one column at 700-899 (damage sat on the move line); 4px under the photo's Mega line.
- 8:49 PM Kit section headings step on the type scale (26/28/34/40) instead of sliding (37.4px at 1100); About 960-979 band.
- 9:45 PM Archetypes 700-899: playbooks use the page's phone layout (books overlapped, No. 8 off-screen).
- 9:58 PM Real item images: the 166 from Sim's PC approved (contact sheet), wired into the bag; drawings as fallback.
- 10:34 PM Search item hits show the real picture; Mega Stone titles keep X/Y/Z with the word on phones.
- 11:34 PM Sheet titles on phones never break inside a word (917 titles: 276 mid-word breaks at 320 -> 0; picture moves above long names; item tag +60px).
- 11:50 PM Events, Speed Tiers, Test Run under 3 screens at 1280 (the other account's option A each): 2.96 / 2.94 / 2.95. Every tool page is now under 3 screens at 1280 and 1440.
- 11:34 PM (WebKit too) all 917 titles fit at 320-600 with no mid-word break.
- 12:02 AM Polish: Calc condition chips split evenly (3+2, no lone chip), Type Chart groups 2+2; polish-check lone rows 18 -> 11 on those pages.
- 1:28 AM My Team polish: header actions 3 per row with every label on one line, card links 3+2, legend in 3 even columns, the 320 matchup spill fixed.
- 2:2x AM Phone sweep fixes (from the other account's report): Pokémon page partner % fits its card at 320, small tap targets grown to 44px+ without moving text, Meta tab labels one line each at 320-374, Track total and two small spills fixed.

## Non-visual decisions (executive)
- Helper count kept at 1 (Sim, 4:53 PM): hW2, hI, hN, hP5, hR, hT4, hS2, hC2, hK, hH, hN10, hA, hI2, hS3, hR2, hL, one at a time.
- Batched pushes so GitHub runs were not cancelled: 5:40, 6:20, 7:36, 9:45, 10:23 PM (+ night).
- Preview inlines the 166 item pictures as data: URIs (the artifact holds at most 511 files and already had 443); the public site keeps files.
- Tests fixed so they can fail (Type Chart, Calc band, HOME-09, NAV-10 rewritten as a real keyboard check); THEME-03 test wait (WebKit 6/6).
- 39 old qcheck known findings cleared after each was checked fixed; 2 kept.
- Other account: Job 1 (1280 lengths) applied 10:2x PM; Job 2 report used for follow-ups; overnight brief written 10:24 PM.

- 3:0x AM More lone rows fixed (Pokémon type line, How We Calculate bands, Test Run key, Home chips at 1100-1279, Pokémon basics, News latest round); How We Calculate +24px at 390 for even rows (my call).

- 3:5x AM Popular Sets facts never leave Nature alone; Sets/Usage source chips fill their rows; Winning Teams sentence on one row at 1180-1239; This Week phone key in three columns.

- 4:34 AM Track Record at 1100-1279: the stamp and button were cut off at the window edge; now sized to their column.

- 4:41 AM Track Record at 1280+: stamp and button inside their column, no size jump at 1280.
- 4:4x AM Pokémon page on phones: every Item/Ability/Nature word gets a 44px tap area (rows a little taller), decided under my authority.

## Milestone
- The other account's overnight full check on 136e7cd9: EVERY test passed (all GitHub jobs, WebKit My Team/Build/Battle/Meta, qcheck-all): 0 real failures, 0 flakes. First time every test passes on one commit. GitHub runs 1507-1510 green too.

## Waiting on Sim
2. Ability sheets and Megas: keep both counts with one note line (A, recommended) or credit the base form (B).

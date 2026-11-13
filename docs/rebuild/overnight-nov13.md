# Overnight, Nov 12-13 (Claude under Sim's authority until 6:00 AM Eastern)

Written as the night went; times are from the clock. Every "checked" line names what was run and what it showed.
The Rebuild Checklist (https://claude.ai/artifact/E99Mux9sZxxBuvFXEsKW1V) has the same items, kept current.

## Mistakes to report first
- Commit 915b83e went out with a "Co-Authored-By" line naming the model (CLAUDE.md: no model names in commits).
  Rewriting pushed history was blocked (it needs your permission), so it stays; every later commit leaves the line out.
- A wrong note I wrote: when C1 took the 4/4 count off the Team Checks tab, I wrote that the count "moved to the section
  heading". It didn't: the count left the tab, and the section says "All 4 basics pass" in words. Corrected in the tests.
- Times typed instead of read from the clock, three times (checklist notes and timestamps, one page-heights.md line, one
  message to the helper). Each caught and replaced with the clock's time within minutes.
- My build briefly put the Preview build into app/dist/v2.html for under a minute (until 11:47:12 PM, file time). The height
  check that was running was restarted on its own copy; the helper confirmed its run was not affected.

## Done on the site (no look change unless said; each checked, each on claude/design6)
On the Preview (v88 at 11:46 PM, v89 at 12:14 AM, 394 files each): title case + names-only tabs (C1-C4), and the fixes up to
34d3585 below. The rest goes on with the next publish.

| What | Commit | Checked |
|---|---|---|
| Pages not rebuilt yet (How We Calculate, Popular Sets, About & Legal, Send Feedback) open a "coming next" page, not Home | 0305e6b | Preview build: each opens its page, 0 errors |
| Build Around It (Home, info sheet) starts building, as today | dc5f499 | 390 + 1440: a finished build with the pick; old build: nothing built |
| Build's phone jump bar: every tab at least 44 px to tap (Cores was 36) | 252994d | pixel-identical before/after, 320-699, both engines |
| Suggestion cards from the extra list get their Fix / Small edge / Option line (a real bug) | 34d3585 | SUGG-06 FAIL -> pass, the only change in the Build group |
| Load Team on a full team from a recent event loads that player's items and moves, as today | 6e2ff5a | item by item against the event sheet; old build: names only |
| Battle remembers its open tab | 2cbbe90 | survives a reload; old build forgot it; Battle group 21 pass (same) |
| Up/down keys through the suggestions in all five name boxes | 8662326 | both engines, all five boxes; site's focus ring shows |
| Search finds My Box, Compare Teams, Saved Teams, Team Sheet, All Suggestions | 135cd12 | each result lands right, both engines; top bar unchanged |
| My Team's jump bar moves focus to the section heading | 2df5a3a | Tab stays in the section; no ring after a mouse tap |
| Info sheet: sideways swipe between tabs on phones, today's rule | 53331f2 | Chromium only; iPhone unsure (brief step 6) |
| Share: a blocked link copy now shows the link, as the toast says (a real bug) | 623e0d6 | 320/390/1440, both engines; picture below |

## Tests
- Before/after comparison of tonight's title case + C1-C4 closed: every changed result explained (test wording, not the
  site) and rerun passing on the new build and on today's page.
- Helper wired the Suggestions tests (B-build): 13 pass before, 24 now. Its sorted list of the rest is in checklist items i26-i28.
- v2 use test: 32 ok, 0 FAIL (after accepting "Why This Score?").

## Measured: page heights (fresh table in docs/rebuild/page-heights.md)
My Team is inside every limit in its normal state. Over: with 5 of 6 (320: 4,169 / 3,900; 390: 4,040 / 3,750; 1440:
1,917 / 1,800) and with six long imported names (3,944 / 3,842 / 1,863). Home and Battle inside. Build: inside before you tap
Build, but far over AFTER building (390: 4,807 / 3,700; 1100: 3,428 / 1,800); I first wrote "Build inside", wrong (corrected 12:53 AM). After Apply: unknown
(today's data offers the sample team nothing to apply).

## Questions for you (each with labelled pictures in the morning message)
1. Speed Tiers mock-up: Speed Q1 (desktop: race track RECOMMENDED vs list) and Speed Q2 (phone: slim track RECOMMENDED vs list).
2. Height Q1: My Team with 5 of 6. A: raise the limit for an unfinished team (RECOMMENDED). B: 3 rows per list on phones
   (desktop then fits; phones still over).
3. Words: "Dangerous / Manageable" (today's fallback, not in the word list): show no word (recommended).
4. Words: "likely their Mega this game" on both of an opponent's two Megas: say "one of their two" (recommended).
5. Already waiting: Compare and All Suggestions designs (no approved mock-ups), usage counting (privacy), site menu / Auto
   theme, Plan settings design.

## Unsure (purple on the checklist)
- i27: Suggestions differences nobody approved (found by the test helper).
- i30: a 5-of-6 team's add card shows an empty left slot and no score change.
- i31: the threat list's length depends on which page asked first (shared code); measured harmless today, a risk when
  Speed Tiers / Damage Calc are rebuilt.
- iPhone checks: keyboard over name-box lists, and the info sheet swipe: docs/rebuild/test-runs/x07-keyboard-iphone.md.

## Second look through every built page (Sim, 12:47 AM: "make sure it's matching our standards")
How: screenshots of Home, My Team, Build (after building), Battle (with an opponent), My Box, Compare at 600 day, 390 day
and 1100 night, read by eye; the polish check on every built page (320-2560, day and night: 0 page errors); text-inside-
its-box checks at 14 widths in both engines; double-tap check (125 controls, 0 fired twice); use test (32 ok).

Found and FIXED (on the Preview since v90, 1:38 AM; before/after picture in the morning message):
- Build after building had never been checked (the height and polish checks don't build a team). At 320-430 the score's
  "Tournament ready" ran off the screen; names and role lines ran into the next tile ("S tier 92Attacker · S tier 92");
  Other Options cut names with "…" ("Mega Glim…"); at 700 the headline ran 5 px past its column. All fixed (675d601, 68f86af).
- Corrected: page-heights.md had Build's numbers labelled "after building"; they were before building.

Questions and ideas for you (look choices, so nothing changed):
1. Look Q1: Build's sprites are 120 px on phones though the page's styles meant 88 px; at 320-340 one pokes past the
   screen edge. B (88 px) recommended: fits the tiles and shortens the page.
2. Build after building is far over its height (390: about 4,850 / 3,700; 1100: 3,428 / 1,800). Ideas needed (like Height Q1).
3. Colours with no meaning: Compare's team B badge is pink, the colour that means "selected" (A is the "good" blue);
   Build's "3/4 team checks" is blue though a basic is missing.
4. Names: "Battle A Team" (our lowercase rule says "Battle a Team"); Home's tiles say "Battle Mode", "Teams", "Winning
   Cores" where the pages say "Battle A Team" and "Cores"; the info sheet's tabs carry details ("stats, types", "why 87,
   the data", "3, side by side") that your names-only rule took off the other tabs; Battle's phone "More Ways to Prep"
   still says "latest 20 top teams" and "18 types".
5. Battle: Turn One shows a fixed order on a speed tie (both Mega Charizard Y at 152; today's site too); in a mirror
   match the sentence "Mega Charizard Y's Ancient Power can KO Mega Charizard Y" doesn't say whose.
6. Space at 1100: empty beside Home's ratings list under Today's Underdog, and beside the big score on My Team and Build.
7. Home's top three: "% of ladder teams" wraps on the two sides but not the middle (uneven).
8. My Box "Your Team" lists the six in slot order, not grouped Lead / Back / Bench as on My Team.
9. One-word names slightly wider than their tile ("Meowscarada" in My Box at 400-480, "Basculegion" on Home at 320/720).

Later fixes (by 2:07 AM; on the Preview since v91, 2:27 AM):
- Build's "3/4 team checks" was always blue; now blue only at 4/4 (d374d06; checked on all four built options).
- Form letters never alone on a line in text built by shared logic: Battle's pairings and Watch Out, the turn-one warning,
  Build's sets fold (5dd4e26; checked: no split on 5 pages at 11 widths). Battle 21 / Build 24 passes, unchanged.
- Sheets checked (Team Sheet, Saved Teams, All Suggestions, Search, Share, More, Edit Set, Why This Score?): 4 widths,
  both engines: no text outside its box, no sideways scroll, 0 errors.
Labelled pictures ready: Look Q1 (Build phone sprites), Look Q2 (Compare colours), Look Q3 (Battle tabs on phones).
Look Q4: Build after building on phones: A raise the limit (4,857) or B the jump bar becomes tabs, one section at a time
(measured 3,208 / 2,533 / 3,252, all inside 3,700) RECOMMENDED: the bar already looks like tabs; nothing is more than one tap away.

Small notes (no question needed):
- 320 footer: "Send Feedback" sits alone on its line. That follows your Nov 12 option D (links share rows to save height),
  so I left it.
- Home's "Or build around your favourite Pokémon →" on phones: centred text with its arrow far right (an idea: arrow
  right after the words).
- All Suggestions for the sample team shows one ±0 card with a full Apply button; on My Team a ±0 swap gets no card (your
  A3). Logged as i27 (differences nobody approved).

After 2:27 AM (on the Preview since v92, 2:35 AM):
- "?" tips: settled. The site has two, both checked at 12-13 widths in both engines, on the pages and inside Things to
  Know: none sits alone on a line.
- Favicons: today's three, unchanged, added to the new site (the browser tab showed no icon) (5b8c103; use test 32/0).
- iPhone brief now has 8 steps (keyboard, swipe, bottom bar, sideways).

## Corrections (5:47 AM, found during the side-by-side check)
- WRONG: "empty space beside Home's ratings list at 1100". My screenshot script lacked the ratings-movement data (meta/track);
  with it, "This week in the ratings" fills that column, as in the approved mock-up. The official height and polish checks
  always load all data, so their numbers stand; only my own quick screenshots were affected (Home's This week and More on Home
  lines). Rechecked with full data: Home matches its mock-up apart from changes Sim chose.
- WRONG comparison: "Build at 1100: 3,428 over 1,800". The limits are set at 390 / 820 / 1440. With full data, Build after
  building: 1440 2,121 (over 1,800 by 321); 820 3,490 (inside 3,500); phones with the new tabs 3,167 / 2,469 / 3,148 (inside 3,700).

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
1,917 / 1,800) and with six long imported names (3,944 / 3,842 / 1,863). Home, Build, Battle inside. After Apply: unknown
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

# All Suggestions sheet: options for Sim (parity-nov15.md item 3, Plans step np-allsugs, checklist i17)

Helper, written 12:23 AM Wed Nov 18, 2026 (clock: `bash docs/rebuild/now.sh`).
Look-only. No site source changed. Every option is a mock drawn in the browser (page.evaluate + injected CSS) on
`node build.mjs --v2 --art=../src/v2/art/ --preview-data` of claude/design6 at 7776131d, served from app/ over local HTTP
(`/dist/v2.html`) so fonts and sprites load. Today's live site: `node build.mjs` (dist/page.html), All Suggestions page.
Light mode, 390 x 844 and 1440 x 900. Phone pictures: window height set to the content height (no fullPage).
Scripts (session scratchpad, not in the repo): `as/shot.mjs`, `as/mock.js`, `as/old.mjs`, `as/compose.py`.

Team used (both sites): Garchomp, Kingambit, Sneasler, Basculegion, Archaludon, Azumarill; a 20-Pokémon box.
Strength Score 68 (Needs work, no Mega), so there are many suggestions: new site 21 (20 one-swap, 1 two-change plan).
The sample team scores 93 and gives only 1 suggestion, too few to show a list.
Pool: new site Box + Catch (its default); today's live page shows My Box (its own switch, 2 choices). So the two lists differ in
length and content; compare the structure, not the Pokémon.

Each picture: today's live site on the left, the option on the right. Option name printed on the picture.

| File | What it shows |
|---|---|
| allsugs-options-now-390.png / -1440.png | Reference: the new sheet as built today (one list), beside today's live page |
| allsugs-options-A-390.png / -1440.png | Option A |
| allsugs-options-B-390.png / -1440.png | Option B, Bigger Plans fold closed (default) |
| allsugs-options-B-open-390.png / -1440.png | Option B, Bigger Plans fold opened |
| allsugs-options-C-390.png / -1440.png | Option C (recommended) |

## The options

**A: one list, fuller cards.** The sheet stays as it is (My Team's suggestions first, then 12 more, "Show 12 More ›").
Each card gains the facts today's page has (i17):
- type chips, "S tier 94", role (Sun, Tailwind, Attacker…), Hidden gem tag when it applies;
- "Ability @ Item" (e.g. "Drought @ Charizardite Y");
- the change chips: "Weak spots 4 → 2", "Unresisted 2 → 0", "Offense 18/18 → 17/18" (blue better, amber worse).
- The list ends with "That's every change from your box… For more, try Whole Roster." and a "Try Whole Roster ›" link.
- No pool switch, no headings, no Bigger Plans, no notes, no Undo inside. Desktop stays one column.

**B: today's structure in the new design.**
- "← My Team" link, kicker, title, hint.
- Suggest from (3 choices) and Megas on team inside the sheet.
- Notes (game-plan gap, Mega over goal) above the cards when the team has them. This team has none, so none show.
- "One Pokémon In, One Out" (or "Pokémon to Add" under six): 3 cards, then "17 More Swaps › Showing 3 of 20".
- "Bigger Plans ›" fold, closed: the two-or-more-change plans, "Apply Suggestion N", "More Suggestions ›".
  No plan: "No plan with two or more changes raises the Strength Score (it's at 68)."
- Full card facts as in A. Two cards across on desktop (as today's page).
- Undo bar inside the sheet after an Apply: not drawn (it only shows after an Apply; the sheet would need to stay open).

**C: middle way (recommended).**
- Kicker, title, hint, then Suggest from (the same one setting as My Team, not a second copy).
- Notes above the cards, as B.
- "One Pokémon In, One Out": 6 cards, then "Show 6 More › Showing 6 of 20".
- "Bigger Plans" as an open section under it (no fold): its cards span the full width.
- Shorter card facts: types, tier, role, gem, "Ability @ Item". The change chips stay in "Why?", which already says them
  ("Weak spots: 1 extra weakness → none", offense), so they are not shown twice.
- The list ends with the same advice line as A. Two cards across on desktop. Apply closes the sheet as now; the Undo bar
  waits on My Team.

## Page length (measured: sheet content height; screens = px / 844 on phone, / 900 on desktop)

| | 390 px | 1440 px | cards drawn |
|---|---:|---:|---:|
| New sheet as built today | 5,231 (6.20) | 4,749 (5.28) | 15 |
| A | 7,045 (8.35) | 6,447 (7.16) | 15 |
| B, fold closed | 2,081 (2.47) | 1,430 (1.59) | 3 + strip |
| B, fold open | 2,737 (3.24) | 2,052 (2.28) | 3 + strip + 1 plan |
| C | 3,601 (4.27) | 2,260 (2.51) | 6 + 1 plan |
| Today's live page (for comparison) | 2,655 page part | 1,752 page part | 3 + 2 folds |

- A's card facts add about 121 px per card on phone and 113 on desktop (measured: A minus today, over 15 cards).
- C's card is shorter than A's (no chips). C shows 7 cards; B shows 3.
- No text outside the sheet and no text under 13 px in any option (checked in shot.mjs: `bad: [], small: []` for all ten shots).
  Page errors: none (`errs: []`).

## Which waiting tests each option meets (my reading of the tests and the mocks; the tests were NOT run on the mocks)

The 13 B-build entries marked "pending Sim: the All Suggestions sheet design" in app/test/behaviour/known-v2.json, plus i17.

| Test | What it wants | A | B | C |
|---|---|---|---|---|
| X-08 | "One Pokémon In, One Out" heading | no | yes | yes |
| BUILD-04 | tap "Whole roster" inside the sheet | no | yes | yes |
| COV-01 | kicker, hint, "← My Team" | no (✕ only) | yes | no (✕ only) |
| COV-03 | Suggest from inside, remembered apart from My Team | no | yes, if kept apart | partly: there, but shared with My Team |
| COV-04 | "Pokémon to Add" / "One Pokémon In, One Out" cards with details | details only | yes | yes |
| COV-06 | 3 cards, "N More Swaps · Showing 3 of N" | no | yes | partly (6, "Showing 6 of N") |
| COV-09 | game-plan gap note in the sheet | no | yes | yes |
| COV-11 | Bigger plans fold with settings and hint | no | yes | partly (open section, no fold) |
| SUGG-04 | Bigger plans card: rows, set line, "Apply suggestion N" | partly (set line) | yes | partly (no "Apply Suggestion N") |
| SUGG-10 | Undo bar inside | no | only if Apply keeps the sheet open | no |
| SUGG-12 | "More Suggestions" adds 3 | no | yes if it adds 3 | no (adds 6) |
| SUGG-14 | no-plan note "(it's at N)" | no | yes | yes |
| SUGG-15 | Mega and gap notes in the sheet | no | yes | yes |
| i17 | card facts + end-of-list advice | yes | yes | yes (chips stay in Why?) |
| **Met in full** | | **i17 only (0 of 13)** | **10 of 13 + i17; 3 more if Sim also picks those choices** | **6 of 13 + i17; 4 more partly** |

C's partly items need the test changed to match the choice (e.g. 6 instead of 3), not new site work.

## Usability ("usability and easy accessibility are key")

- A: easy to scan as one list, but the longest (8.35 phone screens) and the facts repeat what "Why?" says. To try another pool
  the player must close the sheet and find Suggest from on My Team. Desktop leaves the right half empty.
- B: shortest, and today's players will know it. But 17 swaps and the Bigger Plans sit behind a strip and a fold: two extra
  taps, and the fold hides whether there are any plans at all. Two Suggest from + Megas copies (sheet and My Team) can
  disagree, which the new site removed on purpose (SUGG-02).
- C: everything is in view with plain headings; one Suggest from, right where the player looks for "more"; no fold to find.
  Half the length of A. Cost: longer than B, and a few old tests change wording.

## Recommendation

**C.** Why: the player sees every kind of suggestion and the pool switch without hunting through folds, at half A's length.

Still Sim's call: the Undo bar inside the sheet (B only) means Apply would keep the sheet open; today Apply closes it.

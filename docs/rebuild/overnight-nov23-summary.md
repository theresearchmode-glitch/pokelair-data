# Overnight, Sun Nov 22 -> Mon Nov 23 (HH under Sim's design + executive authority to 9 AM)

Every decision has its clock time in docs/rebuild/decisions.md. Pictures: docs/rebuild/pics/nov22/empty-fix/ (the 9 fixes),
docs/rebuild/pics/nov23/overnight/ (later changes), docs/rebuild/pics/nov23/wave2-build/ (kit parts).
Nothing went to the live site. Everything is on claude/design6 and on the Preview (v239, 12:42 AM).

## 10 PM -> 5:45 AM: decisions (design)
- 10:09 PM Battle (before their six is in), 1100+: Your Six faces Their Six with Compare's slanted VS stamp; Your Games under it.
  Page 1,283 -> 1,075 px at 1440. Polish fix 12:13 AM: three across at 1100-1279.
- 10:25 PM How We Calculate, 1100+: headline full width (2 lines, was 5), intro + the three counts in one row, the number key as one
  wide card (scale left, meanings right). 2.22 -> 2.15 screens at 1440.
- 10:32 PM Build's built team: each plate's item, Ability and moves now open their info sheets (they were plain text: a button can't
  sit inside the plate's button). The plate is no longer one big button; its name is the button and still covers the plate.
  Tapping an info word inside any Pokémon card now opens only that word's sheet (site-wide guard).
- 10:33 PM Track Record, 1100+: the "230x more top 8s" verdict stamps big on two lines beside the receipt (empty column flagged
  at 1366/1600/2560).
- 10:34 PM Ultra-wide screens: from 2112 wide the page frame stops growing at 1,920 px of content and centres (eight pages were
  half empty at 2560). Home's hero keeps its own 96 px gutter (Home stays as Sim approved it).
- 11:12 PM (logged with the lengths) My Team, 1100+: the team name on one line across the band, the Strength Score plate beside the line under it.
- 11:12 PM Type Chart: the 18 type buttons in one row from 1440; the whole chart's rows 28 px from 1280. 3.32 -> 3.16 screens.
- 12:51 AM Usage on iPads (700-899): Items span two rows so Natures sits under Abilities (no empty right half; ~110 px shorter).
- 12:59 AM Merged hK's Wave 2 kit parts (Sim chose A for all five): show-more, filter chip, secondary button, empty line, and the
  "lost" screens on the Page-not-found shape. 44 px tall (not 48) so no page got longer.
- 2:04 AM / 2:07 AM after Wave 2: filter chip a size down under 360; Ratings' phone chip grid keeps a 12 px inner margin (slanted
  chips made the row scroll); Winning Teams' three links may wrap at 13 px under 360.
- hK2 (helper) is finishing Wave 2: the other pages' secondary buttons and two leftover show-mores.

## Lengths for Sim's OK (the rule: never longer than before without Sim's OK)
- My Team phone 390: 4,024 px on the test data (old limit 3,930). HH accepted it in steps: the six's hint +28, the buttons under the
  name, Wave 2's kit show-more +16. Desktop 1440 went from 3,501 to about 2,830.
- This Week +46, News +72, Gifts +150 at 1440 (hW2's reskins; Gifts was OK'd at +87 from the mock's numbers).
- Over the 1440 caps after tonight: Pokémon page 4.85 (cap 4: layout alone can't reach it; needs a content call), Type Chart 3.16
  (cap 3), My Team about 3.14 (cap 3), Home 6.08 (Sim's call).
- Against the pre-reskin baseline many pages are longer (most approved one by one); the table is in the scratchpad
  (lengths-now.json vs lengths-pre.json) and can be put on a page.

## Checks
- GitHub full runs on claude/design6: 1475 ALL GREEN (12:20 AM), 1476 ALL GREEN (1:08 AM), 1477 13/15 (fixed, pushed 2:08 AM).
- Local (frozen data): behaviour A 139/0, B 77/0, C 83/0, D 117/0; minors all three parts; qcheck on every changed page 0 new.
- Known flake: Home's ticker pause test at 2560 under load (passes on GitHub).

## Bottleneck found and fixed
- Every GitHub run tonight was being cancelled by my next small push. Now: commit locally, push in batches ~every 40 min.

## Not checked / open
- Real iPhone Safari for the Damage Calc Rain fix (second account's WebKit run passed).
- The Pokémon page's length (needs Sim's call on content).

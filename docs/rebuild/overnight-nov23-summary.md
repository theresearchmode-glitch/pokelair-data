# Overnight, Sun Nov 22 -> Mon Nov 23 (HH under Sim's design + executive authority; both now extended to 6 PM Mon)

Every decision has its clock time in docs/rebuild/decisions.md. Pictures: docs/rebuild/pics/nov22/empty-fix/ (the 9 fixes),
docs/rebuild/pics/nov23/overnight/ (later changes), docs/rebuild/pics/nov23/wave2-build/ (kit parts).
Nothing went to the live site. Everything is on claude/design6 and on the Preview (now v242, 5:03 AM).

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
- 10:53 PM tried and dropped: the Pokémon page's head + hero as one grid at 1100+ (broke the layout); its length goes to Sim.
- 11:12 PM (logged with the lengths) My Team, 1100+: the team name on one line across the band, the Strength Score plate beside the line under it.
- 11:12 PM Type Chart: the 18 type buttons in one row from 1440; the whole chart's rows 28 px from 1280. 3.32 -> 3.16 screens.
- 12:13 AM polish fixes on the 15 changed pages (320-2560), e.g. Build's plate name button had the Hatch button's class;
  Battle's Your Six three across at 1100-1279.
- 12:51 AM Usage on iPads (700-899): Items span two rows so Natures sits under Abilities (no empty right half; ~110 px shorter).
- 12:59 AM Merged hK's Wave 2 kit parts (Sim chose A for all five): show-more, filter chip, secondary button, empty line, and the
  "lost" screens on the Page-not-found shape. 44 px tall (not 48) so no page got longer.
- 2:04 AM / 2:07 AM after Wave 2: filter chip a size down under 360; Ratings' phone chip grid keeps a 12 px inner margin (slanted
  chips made the row scroll); Winning Teams' three links may wrap at 13 px under 360.
- 2:36 AM full-site polish check (27 pages, 320-2560): nothing new from tonight; fixed two older spills (About receipt line at 320,
  Track Record TOTAL box).
- 2:37 AM tried and dropped: Test Run small-card name at 13px under 360 (still too wide); left for a layout fix (helper hL on it).
- 2:46 AM merged hK2: 53 more secondary buttons on the kit, Usage ranks 11-100 and All Suggestions on the kit's show-more.
  Accepted: Battle +51 px at 1280 only when their six is in (hL is fixing it).
- 2:47 AM helper hL started: Battle 1280 +51, Test Run 320 small-card name, News 1440 hero's right half filled with its own content.
- 3:14 AM Preview v240: Wave 2 everywhere + polish fixes.
- 3:18 AM tried and dropped: My Team plan in three columns at 1440+ (shorter, but left a big empty block).
- 3:45 AM GitHub 1479 caught Battle's Log a Win / Log a Loss at different widths after the kit move; fixed (equal again).
- 4:11 AM merged hL: News at 1440, "In the post" and "Next event" move up beside the paper's name (the empty right half of
  the hero is gone; same length). Test Run 320: the Usual suspects names fit. Preview v241.
- 4:24 AM merged hL: Battle 1100-1439, Your Games' gap 12 px so every width is back to its old length with the equal buttons.
- 4:48 AM merged hL: Test Run 1100-1439, open team card: answer words as even two-line stacks, the four names level,
  SET AS OPPONENT 20 px there (it touched its edge). Same length.
- 5:02 AM merged hL: Test Run 700-1099, Usual suspects names fit (Meowscarada spilled 14 px). Same length. hL done.


## 5:45 AM -> 9 AM
- 6:07-6:16 AM Sim's iPhone 16 pictures ("just some polish needed"): fixed and pushed with his yes (6:20 AM):
  Home hero grows on short phone windows so Rillaboom/Sneasler never cover "win rate."; Ratings tabs and filter chips 13px under 440;
  podium steps 2px apart on phones so numbers clear the stripe (Meta 390 +6px, the only page that grew).
- 6:20 AM HQ Q13f now also tests short windows (393x660 = iPhone 16 in the Claude app, 375x600, 430x700). Proven: fails on the old hero
  (4.19% of the tagline covered at 393x660), passes on the fix. My first edit had a syntax slip (fixed 6:41 AM, pushed 6:51).
- 6:47 AM merged hP polish: Go buttons and "New crew?" on the type scale; phone section notes 13px at 1.5; My Team facts Item, then
  Ability + Nature; phone footer links 2 + 3. 15 pages shorter at 390, none longer. Preview v243 (6:51 AM).
- 6:56 AM tried and dropped: Type Chart "Hitting back" under the card at 1100+ (made the page longer, 2,845 -> 3,013 at 1440).
- 7:05 AM full-site polish check after all of it: nothing new.
- 7:40 AM merged hI's iPhone 16 sweep: Tournaments tabs one line, Speed Tiers word buttons, Usage rank column, Home's small
  Dispatch masthead, Winning Teams card links, Build cores switches + note. Build 390 -24px, nothing longer. Pictures sent.
- 7:36 AM GitHub 1485: 2 reds. Home buttons on short phones (Sim chose A: words clear, buttons one small scroll down; test
  updated for short phones only) and Events 320 day (headlines weight 800 under 340 so it breaks like night). Pushed 7:56 AM.
- 7:48 AM Sim approved My Box "The PC" and its six new items; package in docs/mockups/mybox-pc, brief in
  docs/rebuild/reskin/mybox-pc-brief.md, build on branch mybox-pc. Helper hJ on the four iPhone spots A-D (Calc set cards,
  Gifts chips, Track stats, Home Ratings tile).
- Safari engine on the latest build: My Team 139/0, Build 77/0, Battle 83/0, Meta 117/0.
- 8:45 AM GitHub 1486: 2 reds from this morning's fixes (the Unbounded-size check listed the approved 13px phone chips; the
  design-system doc needed regenerating). Both fixed and pushed (833bdfbe).

## Lengths for Sim's OK (the rule: never longer than before without Sim's OK)
- My Team phone 390: 4,024 px on the test data (old limit 3,930). HH accepted it in steps: the six's hint +28, the buttons under the
  name, Wave 2's kit show-more +16. Desktop 1440 went from 3,501 to about 2,830.
- This Week +46, News +72, Gifts +150 at 1440 (hW2's reskins; Gifts was OK'd at +87 from the mock's numbers).
- Over the 1440 caps after tonight: Pokémon page 4.85 (cap 4: layout alone can't reach it; needs a content call), Type Chart 3.16
  (cap 3), My Team about 3.14 (cap 3), Home 6.08 (Sim's call).
- Against the pre-reskin baseline many pages are longer (most approved one by one); the table is in the scratchpad
  (lengths-now.json vs lengths-pre.json) and can be put on a page.

## Checks
- GitHub full runs on claude/design6: 1475 ALL GREEN (12:20 AM), 1476 ALL GREEN (1:08 AM), 1477 13/15 (fixed, pushed 2:08 AM),
  1478 ALL GREEN (2:54 AM), 1479 13/15 (Battle buttons fixed 3:45 AM), 1480 ALL GREEN (4:34 AM); 4:36 AM push running.
- Safari engine (WebKit) on frozen data: all four test groups 0 FAIL (My Team 139, Build 77, Battle 83 incl. the Damage Calc
  Rain fix, Meta/shell 117, run again after the News change).
- Page lengths 4:25 AM (frozen data): no page longer than at 3:15 AM; News 1440 14 px shorter.
- Local (frozen data): behaviour A 139/0, B 77/0, C 83/0, D 117/0; minors all three parts; qcheck on every changed page 0 new.
- Known flake: Home's ticker pause test at 2560 under load (passes on GitHub).

## Bottlenecks found and fixed
- Disk full at 7:49 AM (helper copies); removed 5 merged copies (~9 GB).
- Every GitHub run tonight was being cancelled by my next small push. Now: commit locally, push in batches ~every 40 min.

## Not checked / open
- Real iPhone Safari for the Damage Calc Rain fix (second account's WebKit run passed).
- The Pokémon page's length (needs Sim's call on content).
- Test Run with a team open is over the 3-screen cap (1280 4.0, 1100-1200 ~4.7); it was before tonight too.
- Type Chart 3.16 at 1440 (cap 3): the one layout idea made it longer; options are a content call (e.g. the whole chart folded) or Sim's OK.

# Morning questions for Sim, Wed Nov 18

Every open question waiting on Sim, from the files on branch claude/design6. Look-only: no site code changed.
Each question has its pictures next to it (paths under docs/rebuild/pics/nov18/ unless the path says otherwise).
Each recommendation has one short reason.

Read from: CLAUDE.md, RULES.md 00b/00c, decisions.md (Nov 17 evening through the 5:03 AM entry), HANDOVER.md,
the three BRIEF.md files, stampede/AUDIT-mockups-nov18.md, pics/nov18/README-*.md, the Plans page source (docs/foundation-plan.html),
research/, audits/ and test-runs/ reports from Nov 18, and the code where a word or fact had to be checked.

Notes before the questions:
- HANDOVER.md's newest section is from Nov 17, 6:59 PM. It has nothing from Nov 18. The Nov 18 facts here come from decisions.md
  and the reports.
- The Plans page says Home, Gifts and News are "Not on the Preview yet". But commit 1a32fe66 adds
  "Morning pictures of Preview version 202 (Home, Gifts, News)". Unsure which is current; the pictures are listed as overviews below.
- Overview pictures of the three new pages (Preview v202): morning-v202-home-1440-light.png, morning-v202-home-1440-dark.png,
  morning-v202-home-390-light.png, morning-v202-home-390-dark.png, morning-v202-gifts-1440-light.png, morning-v202-gifts-1440-dark.png,
  morning-v202-news-1440-light.png, morning-v202-news-1440-dark.png.
- RULES 00b wants the question number and option name printed ON each picture. The pictures below are the helpers' before/after
  and option shots. Only the All Suggestions README says the option name is on its pictures. The others were not checked for
  printed labels; they may need labelling before they go to Sim.

---

## 1. The Post Room (Mystery Gifts page): nine points

Overview pictures for all of Q1: postroom-real-desktop-light.png, postroom-real-desktop-dark.png, postroom-real-phone-light.png,
postroom-real-phone-dark.png (real data: 5 live gifts, 31 stamps).

### 1a. Parcel > label > button: an exception to "no boxes in boxes"
The kraft parcel holds a white label, which holds a black Copy Code button: three shades nested (audit C4).
Our rule allows page + one card colour. The audit says it is an object, not a card, and needs Sim's explicit yes.
- A: allow it as a named exception (it is a drawn parcel). Pictures: postroom-real-desktop-light.png, postroom-real-phone-light.png.
- B: flatten it (label straight on the page, no parcel colour). Picture: none made (not found in the files).

Recommended: A. Why: it is a picture of a parcel, not a card inside a card; flattening loses the look.

### 1b. The label's middle column: "Serial code" or "Sent"
Today the heading is how the gift is given ("Serial code") with "Sent Sep 9" under it.
The brief and the qcheck triage both say this reads oddly.
- A: keep as built ("Serial code" over the date). Pictures: postroom-real-desktop-light.png, postroom-fixture-desktop-light.png.
- B: heading "Sent" over the date; the way it is given moves to the line under it. Picture: none made (not found in the files).

Recommended: B. Why: a date under "Serial code" looks like it is the code.

### 1c. Two new stamp colours
Two new kinds of gift have new colours: green for "Competition prize", violet for "Livestream reward".
The decision log says the page keeps 13px text and 4.5:1 contrast; I did not re-measure these two colours.
- A: approve the green and violet. Pictures: postroom-real-desktop-light.png, postroom-real-desktop-dark.png.
- B: reuse existing stamp colours. Picture: none made.

Recommended: A. Why: each kind of gift gets its own colour, so the colour says something.

### 1d. The "How to collect" card (new)
Words as built: "How to collect. 1 In the game, open the Submenu and choose Mystery Gift. 2 Enter the code from the label.
3 The gift arrives in your Mailbox. A code can stop early or not work in every account. Real codes never ask for your password."
- A: keep it. Pictures: postroom-real-desktop-light.png, postroom-real-phone-light.png.
- B: remove it. Picture: none made.

Recommended: A. Why: kids learn how to use a code, and the last line warns them about password scams.

### 1e. Empty-state words
When no gift is live: an empty shelf drawing with "Nothing at the counter right now. The next gift will wait here."
The top box says "Nothing live right now" and "N days since the last one ended". The stamp sheet stays.
- A: approve these words. Pictures: postroom-empty-fixture-desktop-light.png, postroom-empty-fixture-desktop-dark.png,
  postroom-empty-fixture-phone-light.png, postroom-empty-fixture-phone-dark.png.
- B: other words (Sim's own).

Recommended: A. Why: it says plainly that nothing is live and where the next gift will appear.

### 1f. Where Gifts and News sit in the menu
Checked by grep: neither page is in the header, the phone bar or Search (shell.js has no "gifts" or "news").
Today they are reached only from Home's post band ("All N Gifts", "All N Stories") and the Dispatch coupon link.
Sim's rule (Nov 11): never a sixth menu place.
- A: add both to Search; keep the Home post band as the main way in. Picture of today's way in: stampede-post-1440-light.png,
  stampede-post-390-light.png. Picture of the Search entry: none made.
- B: put both inside an existing tab (for example under Events). Picture: none made.
- C: a new menu place. Picture: none made. Breaks the "never a sixth place" rule.

Recommended: A. Why: players can find them by typing, and the menu keeps its five places.

### 1g. The stand-in item drawings on the stamps
Items (tickets, coupons, cap and shirt) are our own simple line drawings. The research found no licensed source for item art.
- A: keep our own drawings as the final art. Pictures: postroom-real-desktop-light.png, postroom-real-phone-light.png.
- B: replace them later with drawn art (a separate job). Picture: none.

Recommended: A. Why: no permission questions, and they match our design system (mystery-gift-sources-nov18.md).

### 1h. Copy Code code: 24px at 1440 instead of 26px (after the Safari fix)
Safari's letters are 4px wider, so at 1440 the 26px code pushed Copy Code under it and the two parcels no longer lined up.
The fix sizes the code to its cell (20/22/24/26, on the scale). At 1440 it is now 24px. Checks WK-1/WK-2 fail before, pass after.
- A: accept 24px; Copy Code stays beside the code in both engines. Pictures: webkit-fix-copycode-gifts-1440-light.png,
  webkit-fix-copycode-gifts-1440-dark.png.
- B: keep 26px and let Copy Code wrap under the code in Safari. Pictures (the wrap): webkit-cur-gifts-copycode-wrap-1440.png,
  webkit-gifts-copycode-wrap-1440.png.

Recommended: A. Why: 2px smaller keeps both parcels level on iPhone and iPad, where Sim tests.

Related Safari fix (shown for completeness, not a choice): stamp edges, webkit-fix-stamp-gifts-390-light.png,
webkit-fix-stamp-gifts-390-dark.png, webkit-fix-stamp-home-1440-light.png, webkit-fix-stamp-home-1440-dark.png.

### 1i. New words on the Post Room (not signed off)
"Special delivery. No postage due.", "Waiting at the Counter", "The Stamp Sheet", "How to collect", "Live right now",
"Today / one ends" (the day count when a gift ends today), "to claim", "gifts so far", "Collect by".
Also: "Live right now" is a small Unbounded stamp; the font check flags it. Sim already made small Unbounded stamps a named
exception (decisions.md line 1180, "3B"), so it only needs adding to the check's allowed list.
- A: approve the words; add "Live right now" to the allowed list. Pictures: postroom-real-desktop-light.png, postroom-real-phone-light.png.
- B: Sim rewords some (name which).

Recommended: A. Why: they are short and plain, and the stamp follows her earlier exception.

---

## 2. The Champions Dispatch (News page): six points

Overview pictures for all of Q2: dispatch-real-1440-light.png, dispatch-real-1440-dark.png, dispatch-real-390-light.png,
dispatch-real-390-dark.png (real data: 67 official headlines). Fixture versions: dispatch-fixture-1440-light.png,
dispatch-fixture-1440-dark.png, dispatch-fixture-390-light.png, dispatch-fixture-390-dark.png.

### 2a. Maintenance notices
17 of the 67 headlines are maintenance notices. As built they stay off the front page (shown only if nothing else is there)
and still count in "Earlier Editions".
- A: as built. Pictures: dispatch-real-1440-light.png, dispatch-real-390-light.png.
- B: show them on the front like any story. Picture: none made.

Recommended: A. Why: maintenance notices would push real news off a small front page.

### 2b. "In Brief" instead of "Interviews"
The official feed has no interviews. As built, the right column is "In Brief": the next newest official headlines.
- A: "In Brief" as built. Pictures: dispatch-real-1440-light.png, dispatch-real-390-light.png.
- B: interview headlines + links from outlets (GamesRadar, VGC, GamerBraves); needs the source OK in Q9. Picture: none made.
- C: drop the column. Picture: none made.

Recommended: A. Why: it uses only the official source and keeps the paper full.

### 2c. The newspaper names "The Standings" and "Fixtures"
As built, the Back Page uses "The Standings" (top five ratings) and "Fixtures" (next events). The links under them say
"All Ratings" and "All N Next Events". The word list says one name per idea; the audit (W10) suggested "Top Ratings" / "Next Events".
Sim's "recommended for all" covered the audit, but the build kept the newspaper words, so this is still open.
- A: keep "The Standings" / "Fixtures". Pictures: dispatch-real-1440-light.png, dispatch-real-390-light.png.
- B: "Top Ratings" / "Next Events". Picture: none made.

Recommended: B. Why: her word list says one name per idea, and the links under them already use these names.

### 2d. The edition number
"No. 67 · Late Edition" counts every story in the data (dispatch.js: D.all.length). The masthead's other count is
"N stories in the past 12 months" (no maintenance). So the paper shows two different counts.
- A: keep "No." = all stories. Pictures: dispatch-real-1440-light.png, dispatch-real-390-light.png.
- B: make "No." the past-12-months count, so both agree. Picture: none made.
- C: drop the number. Picture: none made.

Recommended: A. Why: it grows by one with each new story, like a real paper, and it is a true count.

### 2e. The coupon fill
The mock-up's coupon has a pale yellow fill. As built: a dashed red outline on the paper, no fill (our rule: one paper colour,
no tinted boxes). The coupon now uses the Post Room's code piece and Copy Code button.
- A: as built, no fill. Pictures: dispatch-real-1440-light.png, dispatch-real-1440-dark.png.
- B: the mock-up's yellow fill. Picture: none made.

Recommended: A. Why: it keeps the one-paper rule and still reads as a coupon from the dashed line and scissors.

### 2f. Other Dispatch points (as built; approve or change)
- The paper is capped at 1760px wide (wider windows get margins). Picture: dispatch-real-1440-light.png (no 1920+ picture found).
- New words, not signed off: "Pokémon Champions news, in one paper", "Free · Unofficial", "In the post", "N stories in the past 12
  months", "Clip and claim · Mystery Gift", "The Back Page", "From around NastyPlot", "Earlier Editions", and the four Classifieds:
  Wanted "A turn 1 plan for tonight's match. Apply at Battle", For Hire "Team builder, works from real winning teams. Ask for Build",
  Lost "One win streak. Last seen before a [top Pokémon]. Check My Team", Notice "Damage numbers checked while you wait. See Damage Calc".
  Pictures: dispatch-real-1440-light.png, dispatch-real-390-light.png.
- A: approve as built. B: Sim rewords some.

Recommended: A. Why: playful and short, and every ad leads to a real tool.

---

## 3. The tools band ("Same herd. Twelve tools.")

Overview pictures: stampede-tools-1440-light.png, stampede-tools-1440-dark.png, stampede-tools-1100-light.png,
stampede-tools-1100-dark.png, stampede-tools-820-light.png, stampede-tools-820-dark.png, stampede-tools-390-light.png,
stampede-tools-390-dark.png, stampede-tools-360-light.png, stampede-tools-360-dark.png.

### 3a. NEW: Battle and Winning Teams take full rows at 700-1099
Before, Battle was a half-width plate at tablet widths: the pairs and the VS were squeezed into the bottom and overlapped.
After, Battle (and Winning Teams) take a full row; the VS has its own 64px column.
- A: full rows (after). Pictures: stampede-tilefix-battle-820-day-after.png, stampede-tilefix-battle-820-night-after.png.
- B: half rows (before). Pictures: stampede-tilefix-battle-820-day-before.png, stampede-tilefix-battle-820-night-before.png.

Recommended: A. Why: the sprites stop overlapping the VS and the text, and each pair stays in its half.

Same fix at other widths (for reference): stampede-tilefix-battle-1440-day-before.png, stampede-tilefix-battle-1440-day-after.png,
stampede-tilefix-battle-1440-night-before.png, stampede-tilefix-battle-1440-night-after.png, stampede-tilefix-battle-390-day-before.png,
stampede-tilefix-battle-390-day-after.png, stampede-tilefix-battle-390-night-before.png, stampede-tilefix-battle-390-night-after.png.

### 3b. NEW: the receipt's band names as a list on narrow receipts
Under 324px of receipt width (phones), the five band bars become a list: a bar beside each name, one per line.
Before, the names sat under a strip of bars and wrapped to two lines unevenly.
- A: the list (after). Pictures: stampede-tilefix-receipt-390-day-after.png, stampede-tilefix-receipt-390-night-after.png.
- B: the strip (before). Pictures: stampede-tilefix-receipt-390-day-before.png, stampede-tilefix-receipt-390-night-before.png.

Recommended: A. Why: every name fits on one line and the chosen band is clear; cost: the receipt is a few lines taller (by eye).

Wider receipts keep the strip with even bars (reference): stampede-tilefix-receipt-1100-day-before.png,
stampede-tilefix-receipt-1100-day-after.png, stampede-tilefix-receipt-1100-night-before.png, stampede-tilefix-receipt-1100-night-after.png,
stampede-tilefix-receipt-1440-day-before.png, stampede-tilefix-receipt-1440-day-after.png, stampede-tilefix-receipt-1440-night-before.png,
stampede-tilefix-receipt-1440-night-after.png.

### 3c. The band's open points from the build (decisions.md, 10:13 PM entry)
- Battle and Test Run are illustrations (no figure or number), unlike the other plates.
- Night uses two plate colours on one band (purple and near-black); our rule says one card colour (audit C2).
- The Ratings podium has grey steps inside the ink plate (audit C1: boxes in boxes).
- Below 1380 wide, the names under the Winning Teams six and the Battle four are hidden (the caption names them).
- New words: "Same herd. Twelve tools.", every tool's one-line description, "Share of tournament teams using each", "More tools".
Pictures: stampede-tools-1440-dark.png (two night colours, podium), stampede-tools-1100-light.png (names hidden),
stampede-tools-1440-light.png (names shown).
- A: approve all as built. B: change some (Sim names which).

Recommended: A. Why: the brief asked for both night colours and the podium as drawings, and every tool stays one tap away.

Other tile fixes (no choice needed, for her eye): Test Run, Damage Calc and tags, stampede-tilefix-testrun-1440-day-before.png,
stampede-tilefix-testrun-1440-day-after.png, stampede-tilefix-calc-820-day-before.png, stampede-tilefix-calc-820-day-after.png,
stampede-tilefix-tags-1280-day-before.png, stampede-tilefix-tags-1280-day-after.png.
For her eye too: the polish sweep said the Battle tile's small blue and pink names on near-black looked low in contrast at 1440
(not measured; before the tile fix). Picture: stampede-tilefix-battle-1440-night-after.png.

---

## 4. Four old Home features with no place on the Stampede (HOME-04, 05, 12, 13)

From README-home-lost.md. Mock-ups on the real built page, real data. Phones at 390 x 844.

### 4a. HOME-04: the data line ("Most used in October, Showdown ladder. November's numbers arrive Dec 1.")
- A: on the Usage page, after the Showdown ladder's source line. Pictures: home-lost-h04a-1440-light.png, home-lost-h04a-1440-dark.png,
  home-lost-h04a-390-light.png, home-lost-h04a-390-dark.png.
- B: in the footer, on every page. Pictures: home-lost-h04b-1440-light.png, home-lost-h04b-1440-dark.png,
  home-lost-h04b-390-light.png, home-lost-h04b-390-dark.png.

Recommended: A. Why: the line explains the ladder numbers, and those now live only on the Usage page.

### 4b. HOME-05/05b: this week's rating moves
- A: in the hero's ticker (movers first). Shows only 1 at 390, 2 at 1440 (measured). Pictures: home-lost-h05a-1440-light.png,
  home-lost-h05a-1440-dark.png, home-lost-h05a-390-light.png, home-lost-h05a-390-dark.png.
- B: a "Ratings on the Move" section on This Week, all 12 movers as tiles. Pictures: home-lost-h05b-1440-light.png,
  home-lost-h05b-1440-dark.png, home-lost-h05b-390-light.png, home-lost-h05b-390-dark.png.

Recommended: B, with A as an optional extra. Why: B shows all 12 movers where weekly change already lives.

### 4c. HOME-12: the first-visit welcome card
- A: in the six band, under the sample-team note: "New here?", the three steps, Copy a Top Team, Got It. Adds most of a phone
  screen at 390 (could fold to the three step names on phones). Pictures: home-lost-h12a-1440-light.png, home-lost-h12a-1440-dark.png,
  home-lost-h12a-390-light.png, home-lost-h12a-390-dark.png.
- B: a slim strip above the hero. Pictures: home-lost-h12b-1440-light.png, home-lost-h12b-1440-dark.png,
  home-lost-h12b-390-light.png, home-lost-h12b-390-dark.png.
Also a words question: "New here?" (the card's old eyebrow) replaces "How fight night works." (from Fight Night).

Recommended: A, with "New here?". Why: it explains the sample team where it stands, and the hero keeps the first screen.

### 4d. HOME-13: What's New (after an update only)
- A: a paper slip in the post band (open on desktop, closed on phones). Pictures: home-lost-h13a-1440-light.png,
  home-lost-h13a-1440-dark.png, home-lost-h13a-390-light.png, home-lost-h13a-390-dark.png.
- B: a slim bar under the header, before the hero. Pictures: home-lost-h13b-1440-light.png, home-lost-h13b-1440-dark.png,
  home-lost-h13b-390-light.png, home-lost-h13b-390-dark.png.
Also: the What's New items are from Oct 28 and use old words ("scouting report", "win odds"). They need rewording first.

Recommended: A, after rewording the items. Why: site news belongs with "the post", and the hero's first screen stays whole.

Tests tied to this: SHELL-17b/18 (welcome card and What's New gone from Home) wait on 4c and 4d (full-run report).

---

## 5. All Suggestions sheet: A, B or C

From README-allsugs-options.md. Team scored 68 (21 suggestions). Today's live page on the left of each picture.
- Reference, as built now: allsugs-options-now-390.png, allsugs-options-now-1440.png (6.20 phone screens).
- A: one list, fuller cards (types, tier, role, gem, Ability @ Item, change chips, end advice). 8.35 phone screens. Meets 0 of 13
  waiting tests. Pictures: allsugs-options-A-390.png, allsugs-options-A-1440.png.
- B: today's structure in the new design (Suggest from + Megas inside, 3 swaps, Bigger Plans fold). 2.47 screens (3.24 open).
  Meets 10 of 13. Pictures: allsugs-options-B-390.png, allsugs-options-B-1440.png, allsugs-options-B-open-390.png,
  allsugs-options-B-open-1440.png.
- C: middle way (one shared Suggest from, 6 swaps, Bigger Plans as an open section, shorter card facts, chips stay in "Why?").
  4.27 screens. Meets 6 of 13 and 4 partly (tests change wording, not site work). Pictures: allsugs-options-C-390.png,
  allsugs-options-C-1440.png.

Recommended: C. Why: every kind of suggestion and the pool switch are in view without folds, at half A's length.

Sub-question: the Undo bar inside the sheet (B only) means Apply keeps the sheet open; today Apply closes it.
- A: Apply closes the sheet, Undo waits on My Team (as now). B: sheet stays open with Undo inside. Pictures: none made.

Recommended: A. Why: it matches C and today's flow; the Undo bar is right where the player lands.

---

## 6. Hero motion: turn it on or not

Built and OFF until Sim's yes. Sim approved the idea in words (decisions.md, 10:30 PM entry): the herd surges a little on arrival,
the ticker scrolls slowly, nothing moves with reduced motion. The ticker has a pause button and pauses under the mouse and off screen.
Measured (stampede-motion-perf.txt, phone at 390): the surge's dropped frames fell (pipeline dropped 89/98/71 before, 4/2/6 after).
Scrolling with the ticker running dropped a few more frames (DroppedFrame events 0/2/9 before, 14/17/15 after).
- A: turn both on. Videos: stampede-motion-phone390-light.mp4, stampede-motion-phone390-dark.mp4,
  stampede-motion-desktop1440-light.mp4, stampede-motion-desktop1440-dark.mp4. Frame strips: stampede-motion-surge-strip-phone390.png,
  stampede-motion-surge-strip-desktop1440.png.
- B: surge only (ticker stays a still strip). Pictures: the strips above.
- C: keep motion off. Pictures: stampede-hero-390-day.png, stampede-hero-1440-day.png (the still hero).

Recommended: A, then a scroll check on her iPhone. Why: it is what she approved in words, with reduced motion respected; the scroll
cost is small but measured, so her phone is the real test.

---

## 7. Herd download size, and display type below 40px

### 7a. The herd crowd: sprite sheets (visible on iPad)
The crowd of 333 sprites costs 7.4 MB on the Claude-hosted Preview (it loads after the first screen; first screen not slower).
From research/first-visit-nov18.md:
- A (4a): pack the crowd into 4 sprite sheets at 128px: 7,423 KB to 1,996 KB; crowd done 15.5 s to 5.6 s on 4G. The nearest crowd
  members on iPad (up to 248 device px) and big screens would look softer.
- B (4a, middle): as A, but the nearest 30-40 keep their full 384px file.
- C (4c): keep the files, but load the crowd later or skip it on slow connections (Chrome/Android only; iPhones would still load it).
- D: no change.
Pictures: the before/after sharpness pictures the research asks for (390@3, 820@2, 1920) were NOT found in the files.
Today's crowd: stampede-hero-390-day.png, stampede-hero-1440-day.png, stampede-hero-1920-day.png, stampede-hero-1920-night.png.

Recommended: B, after the sharpness pictures are made. Why: it saves most of the download while the biggest, nearest Pokémon stay
sharp on iPad (my recommendation; the research recommended A and named B as a middle option).

### 7b. Display sizes below 40px
Fluid display type lands between scale steps on phones (qcheck triage item 5): News 390 masthead 32.6px; Home 390 "97" 31.2px and
"Call six out of the herd." 37.2px; Home 1280 "/100" 36.2px. CLAUDE.md allows "(+ display)"; the check exempts only 40px and up.
- A: display type may shrink below 40px on narrow screens; teach the check the display tokens. Pictures: dispatch-real-390-light.png,
  stampede-hero-390-day.png, stampede-six-sample-team-phone-light.png.
- B: floors at 34px (the scale's top step). Picture: none made.
- C: floors at 40px. Picture: none made.

Recommended: A. Why: these sizes are fitted to the phone's width; a higher floor risks the big words not fitting (my guess, not tested).

---

## 8. Data fixes 1 and 2 (a data job; needs Sim's go)

From research/data-fixes-effect-nov18.md. Both are prepared commits on a helper branch (3cc71131 fix 1, 6c6d227f fix 2), not on main.
- Fix 1, themed events: leaves out 12 restricted events (339 games). 70 shown ratings move (28 by 2+), 3 tier letters change.
  Strength Score: no difference in any format. Unsure: 2 left-out events don't say "restricted" in their names; 1 event (23 games)
  leaves the sealed set.
- Fix 2, one spelling per item/Ability/move: display is clearly better (66 duplicate rows gone, Mega Stones read), but the grade gets
  slightly worse beyond chance on best-of-3 and all rounds (fails the never-get-worse gate). No difference on best-of-1.
Options:
- A: ship fix 1; split fix 2 (stone reading everywhere; spelling fold only for what players see; grade's set features as typed).
- B: ship both as they are.
- C: ship neither.
Pictures: none (a data question, not a design one).

Recommended: A. Why: fix 1 costs the score nothing, and the split keeps fix 2's display gains without the worse grade.

---

## 9. Sources for Gifts and News (the pages can't go live without this)

From research/post-data-nov18.md and mystery-gift-sources-nov18.md. Nothing is taken from op.gg or Serebii.
- 9a. The official in-game news feed (champions-news.pokemon-home.com) as a source, plus a new row in docs/legal-sources.md.
  Also pick one User-Agent string ("NastyPlot-data/1.0 (...)" in legal-sources.md vs "NastyPlot/1.0 (fan site)" used for this read).
  A: yes. B: no. Recommended: A. Why: it is the official source, one small request a day, with exact end times.
- 9b. Codes: none is on an official channel. The rule would be "confirmed by 2 reputable outlets" (Nintendo Life, Nintendo
  Everything, LevelUp, Critical Hits, Vice, Insider Gaming, Analytics Insight; the last is the weakest).
  A: the 2-outlet rule. B: official only (then no codes today). Recommended: A. Why: codes are never in the official feed, and two
  outlets plus "Last checked" keeps wrong codes rare.
- 9c. Updates: news automatic from the feed; gifts suggested only (a person checks before post.js); codes manual.
  A: that split. B: everything manual. Recommended: A. Why: news is safe to copy as headline + link; gifts and codes need a person.
- 9d. Keep past codes in the data? Stamps don't show them. A: drop them. B: keep. Recommended: A (my recommendation). Why: they are
  never shown, and an old code can't confuse anyone if it isn't stored.
- 9e. Link the official redemption site (needs a login) or give only the in-game steps. A: in-game steps only. B: link it.
  Recommended: A (my recommendation). Why: no login pages on a site kids use; the steps already work in the game.
- 9f. The two new kinds "Competition Prize" and "Livestream Reward": see 1c.
- 9g. Interviews from outlets: see 2b.
Pictures (what the sources feed): postroom-real-desktop-light.png, dispatch-real-1440-light.png.

---

## 10. Auto theme: a way back to "follow my device"

From research/old-checklist-recheck-nov18.md (i21). With nothing saved the site follows the device, including live switches.
After one tap on Day/Night there is no way back: the choice is saved as "night" or "day" for good. This was decided earlier
under Claude's authority ("minor", parity-nov15.md line 28), not by Sim, so it is open for her. HANDOVER (Nov 13) also listed it.
- A: the Day/Night button cycles Day, Night, Auto (follows the device). Picture: none made (not found in the files).
- B: no change. Picture: none made.

Recommended: A (my recommendation). Why: one tap can't be undone today; Auto lets the site switch with the phone at night.

---

## 11. Two new on-screen error lines (Preview only)

From the behaviour review fixes (decisions.md, 4:07 AM entry). They show only if a file fails to arrive on the split Preview build.
- If preview.json fails (app/src/v2/shell.js line 232): "This Preview couldn't read today's data (preview.json: [error]). The numbers
  shown are the built-in copy and may be out of date. Reload to try again."
- If v2.js fails (app/build.mjs line 102): heading "This page didn't load." and the line "Part of the site didn't arrive. Reload to try again."
- A: approve the words. B: Sim rewords.
Pictures: none found in the files.

Recommended: A. Why: each says what went wrong and the one thing to do, in plain words.

---

## 12. Main push that needs Sim's go: the planner cache fix (commit 7cd12df9)

The planner's cache was keyed by the six names only (since Nov 8), but its answer depends on each member's set. So the same six
with the same sets could get different suggestions depending on what was planned before. This is on today's live site too.
The fix keys it by each member's set. experiments/plan-cache-test.mjs: 8 failures before, all pass after; fresh-page results
unchanged. It is on claude/design6 only. Not checked: whether it applies cleanly to main.
- A: push to main now, after every GitHub check passes on main. B: wait for the switch.
Pictures: none (no visible change).

Recommended: A. Why: live players can get different suggestions for the same team today, and the fix has a test that could fail.

---

## 13. Other open questions found in the files

### 13a. The Stampede brief's open points (not yet put to Sim one by one)
- Garchomp has no name tag in the desktop hero (no clean spot). Pictures: stampede-hero-1440-day.png, stampede-hero-1440-night.png.
- Pelipper as the mail carrier is new and not separately approved. Pictures: stampede-post-1440-light.png, stampede-post-390-light.png.
- Phone line-up names use the body font (the headline font collided). Pictures: stampede-six-sample-team-phone-light.png,
  stampede-six-long-names-phone-light.png.
- New words: the hero text line, "Call six out of the herd.", "Same herd. Twelve tools.", "The post is in.", tool descriptions,
  "Share of tournament teams using each". Pictures: stampede-home-joined-1440.png, morning-v202-home-390-light.png.
- A: approve all. B: change some (Sim names which).

Recommended: A. Why: each was settled to fit our rules (no clipped names, readable phone names), and Pelipper carries the post theme.

### 13b. My Team C: long names condensed on phones
Long names are squeezed narrower to fit, e.g. "Paldean Tauros (Combat)" at 70% width at 360 (decisions.md, 12:05 AM entry, "for Sim's eye").
- A: keep the condensed letters. Pictures: myteam-C-built-360-long.png, myteam-C-built-390-long.png.
- B: let long names wrap to two lines. Picture: none made.

Recommended: A. Why: the Cards stay even in height, and the name is still whole.

### 13c. After Apply on desktop, the page scrolls by the Undo bar's height
So the tapped spot stays put, but the column beside it moves too. If the bar would land under the header, the toast shows instead
(decisions.md, 9:51 PM entry, "to show Sim").
- A: keep. B: hold only the tapped column. Pictures: none found in the files.

Recommended: A (my recommendation). Why: the player's finger stays on the same spot, which matters most after Apply.

### 13d. Build (Blueprint) extras still missing
Restored: the catch tip and "X isn't in your box", plan chips up to 4. Left out (decisions.md, 12:15 AM entry, "unsure value"):
the two-weather warning and the Megas 73% / 81% tip. Also not on the sheet, no Sim decision found (old-checklist-recheck i15):
the Ability on each figure, and the proven-team note ("This exact team has won at real events. Treat these as optional tweaks").
- A: leave these out. B: restore the Megas tip and the proven-team note; leave the weather warning (the builder already refuses two
  weather setters). Pictures of the restored parts: build-tips-after-390-light.png, build-tips-after-1440-light.png,
  build-tips-before-390-light.png, build-tips-before-1440-light.png. Pictures of B: none made.

Recommended: B (my recommendation). Why: CLAUDE.md says never remove functionality, and these two tell the player something real.

### 13e. "›" links inside a sentence: give them a 44px tap area?
Our rule (C8) and WCAG exempt links inside a sentence. But "All Ratings ›" (Home hero), "All Mystery Gifts ›" (Dispatch coupon) and
the source links on Gifts are 16-20px tall; two source links sit 19.5px apart on phones (qcheck triage item 6).
- A: give "›" links the 44px layer anyway; plain source links stay as they are. B: keep the exception. Pictures: stampede-hero-390-day.png,
  dispatch-real-390-light.png, postroom-real-phone-light.png.

Recommended: A. Why: "›" links read as buttons, and players tap them on phones.

### 13f. Hero tagline partly covered by sprites at 1440 (for her eye)
The polish sweep saw the hero sprites cover part of "your win rate." at 1440: likely intended depth, but it costs some readability.
- A: keep. B: keep the sprites clear of the tagline. Pictures: stampede-polish-after-1440-day.png, stampede-polish-after-1440-night.png.

Recommended: B (my recommendation). Why: the tagline is the first words a new visitor reads.

### Not questions, but for her eye on the iPhone
- Safari 26 wraps some paragraphs onto one more line than Chrome ("pretty" wrapping); nothing is clipped. Pictures:
  webkit-cur-home-tools-wrap-pretty-1180.png, webkit-cur-news-classifieds-wrap-pretty-390.png, webkit-cur-gifts-stamp-name-pretty-820.png.
- The phone bar's blur didn't show in the test browser; probably the test rig, not the site (a guess). Picture: webkit-cur-bottom-bar-390.png.

---

## Not found in the files
- Pictures for: a "Sent" label (1b), flattened parcel (1a), menu or Search entries for Gifts/News (1f), Dispatch options 2a-2e B/C,
  the Auto theme options (10), the two error lines (11), the desktop scroll after Apply (13c), Blueprint extras (13d B),
  long names wrapping (13b B), and the herd sharpness before/after (7a).
- Whether the new pages are on the Preview (Plans says no; commit 1a32fe66 says Preview v202 pictures).
- Whether the planner cache fix applies cleanly to main (12).

---

## Every picture path used (all under docs/rebuild/pics/nov18/; each checked with ls)

- allsugs-options-A-1440.png
- allsugs-options-A-390.png
- allsugs-options-B-1440.png
- allsugs-options-B-390.png
- allsugs-options-B-open-1440.png
- allsugs-options-B-open-390.png
- allsugs-options-C-1440.png
- allsugs-options-C-390.png
- allsugs-options-now-1440.png
- allsugs-options-now-390.png
- build-tips-after-1440-light.png
- build-tips-after-390-light.png
- build-tips-before-1440-light.png
- build-tips-before-390-light.png
- dispatch-fixture-1440-dark.png
- dispatch-fixture-1440-light.png
- dispatch-fixture-390-dark.png
- dispatch-fixture-390-light.png
- dispatch-real-1440-dark.png
- dispatch-real-1440-light.png
- dispatch-real-390-dark.png
- dispatch-real-390-light.png
- home-lost-h04a-1440-dark.png
- home-lost-h04a-1440-light.png
- home-lost-h04a-390-dark.png
- home-lost-h04a-390-light.png
- home-lost-h04b-1440-dark.png
- home-lost-h04b-1440-light.png
- home-lost-h04b-390-dark.png
- home-lost-h04b-390-light.png
- home-lost-h05a-1440-dark.png
- home-lost-h05a-1440-light.png
- home-lost-h05a-390-dark.png
- home-lost-h05a-390-light.png
- home-lost-h05b-1440-dark.png
- home-lost-h05b-1440-light.png
- home-lost-h05b-390-dark.png
- home-lost-h05b-390-light.png
- home-lost-h12a-1440-dark.png
- home-lost-h12a-1440-light.png
- home-lost-h12a-390-dark.png
- home-lost-h12a-390-light.png
- home-lost-h12b-1440-dark.png
- home-lost-h12b-1440-light.png
- home-lost-h12b-390-dark.png
- home-lost-h12b-390-light.png
- home-lost-h13a-1440-dark.png
- home-lost-h13a-1440-light.png
- home-lost-h13a-390-dark.png
- home-lost-h13a-390-light.png
- home-lost-h13b-1440-dark.png
- home-lost-h13b-1440-light.png
- home-lost-h13b-390-dark.png
- home-lost-h13b-390-light.png
- morning-v202-gifts-1440-dark.png
- morning-v202-gifts-1440-light.png
- morning-v202-home-1440-dark.png
- morning-v202-home-1440-light.png
- morning-v202-home-390-dark.png
- morning-v202-home-390-light.png
- morning-v202-news-1440-dark.png
- morning-v202-news-1440-light.png
- myteam-C-built-360-long.png
- myteam-C-built-390-long.png
- postroom-empty-fixture-desktop-dark.png
- postroom-empty-fixture-desktop-light.png
- postroom-empty-fixture-phone-dark.png
- postroom-empty-fixture-phone-light.png
- postroom-fixture-desktop-light.png
- postroom-real-desktop-dark.png
- postroom-real-desktop-light.png
- postroom-real-phone-dark.png
- postroom-real-phone-light.png
- stampede-hero-1440-day.png
- stampede-hero-1440-night.png
- stampede-hero-1920-day.png
- stampede-hero-1920-night.png
- stampede-hero-390-day.png
- stampede-home-joined-1440.png
- stampede-motion-desktop1440-dark.mp4
- stampede-motion-desktop1440-light.mp4
- stampede-motion-perf.txt
- stampede-motion-phone390-dark.mp4
- stampede-motion-phone390-light.mp4
- stampede-motion-surge-strip-desktop1440.png
- stampede-motion-surge-strip-phone390.png
- stampede-polish-after-1440-day.png
- stampede-polish-after-1440-night.png
- stampede-post-1440-light.png
- stampede-post-390-light.png
- stampede-six-long-names-phone-light.png
- stampede-six-sample-team-phone-light.png
- stampede-tilefix-battle-1440-day-after.png
- stampede-tilefix-battle-1440-day-before.png
- stampede-tilefix-battle-1440-night-after.png
- stampede-tilefix-battle-1440-night-before.png
- stampede-tilefix-battle-390-day-after.png
- stampede-tilefix-battle-390-day-before.png
- stampede-tilefix-battle-390-night-after.png
- stampede-tilefix-battle-390-night-before.png
- stampede-tilefix-battle-820-day-after.png
- stampede-tilefix-battle-820-day-before.png
- stampede-tilefix-battle-820-night-after.png
- stampede-tilefix-battle-820-night-before.png
- stampede-tilefix-calc-820-day-after.png
- stampede-tilefix-calc-820-day-before.png
- stampede-tilefix-receipt-1100-day-after.png
- stampede-tilefix-receipt-1100-day-before.png
- stampede-tilefix-receipt-1100-night-after.png
- stampede-tilefix-receipt-1100-night-before.png
- stampede-tilefix-receipt-1440-day-after.png
- stampede-tilefix-receipt-1440-day-before.png
- stampede-tilefix-receipt-1440-night-after.png
- stampede-tilefix-receipt-1440-night-before.png
- stampede-tilefix-receipt-390-day-after.png
- stampede-tilefix-receipt-390-day-before.png
- stampede-tilefix-receipt-390-night-after.png
- stampede-tilefix-receipt-390-night-before.png
- stampede-tilefix-tags-1280-day-after.png
- stampede-tilefix-tags-1280-day-before.png
- stampede-tilefix-testrun-1440-day-after.png
- stampede-tilefix-testrun-1440-day-before.png
- stampede-tools-1100-dark.png
- stampede-tools-1100-light.png
- stampede-tools-1440-dark.png
- stampede-tools-1440-light.png
- stampede-tools-360-dark.png
- stampede-tools-360-light.png
- stampede-tools-390-dark.png
- stampede-tools-390-light.png
- stampede-tools-820-dark.png
- stampede-tools-820-light.png
- webkit-cur-bottom-bar-390.png
- webkit-cur-gifts-copycode-wrap-1440.png
- webkit-cur-gifts-stamp-name-pretty-820.png
- webkit-cur-home-tools-wrap-pretty-1180.png
- webkit-cur-news-classifieds-wrap-pretty-390.png
- webkit-fix-copycode-gifts-1440-dark.png
- webkit-fix-copycode-gifts-1440-light.png
- webkit-fix-stamp-gifts-390-dark.png
- webkit-fix-stamp-gifts-390-light.png
- webkit-fix-stamp-home-1440-dark.png
- webkit-fix-stamp-home-1440-light.png
- webkit-gifts-copycode-wrap-1440.png

Checked: `ls` in docs/rebuild/pics/nov18/ found all 144 files (143 pictures and videos, plus stampede-motion-perf.txt).

# Decisions made for Sim (one list for every page; Sim's review, Nov 11, item 20)

Claude decides small things under executive control; Sim can overrule any of them. Every new entry is also told to Sim in chat.
Sim's own decisions are marked "Sim". Newest first.

## Nov 12, 8:00 AM-4:00 PM Eastern (Sim at work; Claude has authority until 4 PM, helpers allowed; Sim decides by notification)
- Sim's answers (Nov 12, ~8:20 AM): 1 fix the tests and keep everything stable; 2 height cuts on Claude's recommendation, but no
  feature removed and nothing buried in sub-menus; 3 A8 on the Preview for her iPhone; 4 gallery wording on Claude's recommendation,
  publish it; 5 publish My Team to the Preview; 6 live fonts on Claude's recommendation; 7 move forward on the queued items;
  8 show the team-link facts again (done in chat). History rewrite: not answered, so pushed history stays as it is.
  Working rule for today: the Preview is republished after each finished step; new design choices Sim hasn't seen get a picture
  and a phone notification before they go in; anything she dislikes is undone.
- CAUSE of the red GitHub tests (Claude): app/test/run.mjs "health: no banner with fresh data" judged the frozen test data (CI's
  TEST_DATA 0c992f6, dated Nov 9 10:17 UTC) by the real clock; from Nov 12 10:17 UTC it counted as 3 days old and the banner showed.
  Every branch failed the same way (main: run 707 passed 07:20 UTC, 708 failed 10:29 UTC). Not caused by the fonts or the rebuild.
  FIX 6c168a8 (design6) / 93ed4b7 + undo commit (fonts branch): the fresh and stale cases pin the page clock to 1 h after the
  newest data date. Checked: frozen snapshot before "1 FAILED", after "ALL PASSED"; today's data "ALL PASSED".
- History rewrite (Sim: "do what you think is best for the health of our website"): Claude decided NOT to rewrite pushed history
  (rewriting breaks the branch links GitHub, the Plans page and the PC chat use; it gains the site nothing). The rebuild reaches main
  as one squashed commit with no attribution lines.
- Gallery wording (Sim: "your recommendation and publish it"): applied the proposal in gallery-wording.md: facts strip "3 sizes
  measured: My Team is over the length limits, being fixed"; My Team card tag "Built from today's code · numbers being checked
  against today's site".
- PREVIEW v53 published (Sim's go, item 5): foundation.html from claude/design6 at 20d0404 (--preview-data), gallery.html with the new
  wording, index.html, and the 7 font files. Checked before publishing: WebKit 390 and Chromium 1440 open with no page errors (only
  local missing-art messages; the art is on the artifact), heights 3,945 / 2,215 (same as measured). Artifact list after publish:
  394 files (387 + 7 fonts/*.woff2; 346 v2art kept). Sim notified to check A8 on her iPhone.
- GitHub run 716 (design6, before the fix): run.mjs was the ONLY failing step; v2-guard, v2-words, golden, same-grade and the rest passed.
- GitHub green after the fix: run 717 (design6 6c168a8) success, run 719 (fonts branch ec9517a) success, every job.
- MAIN (Claude, Sim's go item 6): pushed d24d31b to main = ONE squashed commit whose tree is identical to the tested ec9517a (fonts
  for today's site + the test fix), so the mistaken frozen-data commit, its undo and old attribution lines never reach main.
- FOUND (Claude): the live site is NOT built from main. Live v154 = byte-identical build of claude/design6 cb49701 (Nov 10-11 fixes
  went live straight from design6 under Sim's Nov 10 "faster flow" and were never merged to main). Publishing main's build would
  have undone them, so it was NOT published. docs/rebuild/live/README.md has the evidence and the rebuild steps.
- LIVE v155 published (Sim's go, item 6): cb49701 + fonts (docs/rebuild/live/live-v155-fonts.patch). Instrument Sans files swapped
  for Google's width-axis ones (the live page asks for wdth 75-100; main's files lack that axis; the narrow slider names need it).
  Checked vs the real live page: Google font requests 4 -> 0 (6 views), same faces (6/6), screenshots identical 3/6 and the other 3
  differ only where a live-vs-live control also differs. File list after publish: 359 = page + 345 sp + 13 fonts. Capabilities kept.
- OPEN for Sim: main is behind the live site (Nov 10-11 today's-site fixes). Recommendation: bring main up to the live code
  (cb49701's today's-site files + fonts) in one tested commit, so main = live again; not done without her yes.
- HEIGHT CUTS (Sim: "your recommendation", no feature removed or buried): e9abcc3. Desktop 2,215 -> 1,784 (all wide widths under
  1,800). Phone 3,945 -> 3,707 (320: 4,075): still over 3,400. Claude disagrees with reaching 3,400 by folding the Favoured list or
  shrinking the six; recommends raising the phone limit to ~3,700. Pictures sent; Sim's answer pending.

- Sim (~10:30 AM): "go with your recommendations on both" = A10 option A+D (keep the Bench line, add it from 700px up) and A13
  option C (day-mode chosen segments light blue, PLOT text, 4.7:1). Built 9f11101; Preview v55 (394 files). Night unchanged.
  Read as those two picture sets only; the phone height limit (~3,700?) is NOT taken as answered.
- A12 checked (c13, five-Pokemon state with suggestions): main buttons per screen 1 at 320/390/820/1440. Toast Undo given a 44px
  tap area (was 38px). "About 43x44" at 390 is whole-pixel sampling (its tap area computes to 44px); left as is.
- Edit Set twice (C3): pictures sent; Claude recommends keeping it only in the Set section. Waiting for Sim.
- Helper started (Sim allowed helpers until 4 PM): updates the 25 "real failure" behaviour tests to the approved design in its own
  worktree (today's page must stay 132/0; every test must still be able to fail). Its changes are reviewed before any commit.
- Preview v54 (height cuts) and v55 (A10/A13) published; file lists checked (394 each).

- MAIN = LIVE (Sim's yes, "your recommendations check out"): 44c9a72 on main, tree identical to 641f928 which GitHub run 723 passed
  (all jobs). main's app/ (minus app/src/v2) and docs/mascot/darkrai.webp now equal the live code (cb49701 + fonts); main keeps its
  newer data and pipeline scripts and the health-test fix. `node app/build.mjs` from this tree = byte-identical to live v155's page.
  NOT copied on purpose: design6's data files and pipeline scripts (update.mjs, official.mjs, pid.mjs, scrub-names.mjs), which were
  never reviewed for main.
- Phone limit 3,700 + Edit Set in the Set section only (3aa5fa6); info sheet jitter fix (5003b61; v2-kb-jitter: old build --kb
  64/0/54/32px while bars move, new 0px; keyboard 344px). Preview v56, v57. A8 confirmed by Sim on her iPhone ("text is more legible").
- Pictures sent, waiting for Sim: D12-14 info sheet (phone picture 180px: the 180px phone rule never applied, inline 240px won),
  Set as Lead (recommend strip only), 320 options (A 4,067 / B+D 3,968 / B+C+D 3,870; recommend B+D and a 320 limit ~4,000).
  Correction logged: first 320 measures were taken before Suggestions finished loading (211px / 3,702 were wrong).
- New from Sim: forms row in My Box's picked-Pokemon panel (given to the My Box helper as a proposal).

- Afternoon (Sim's answers): 320 B+C+D (320 limit 3,900; 3,812 measured), Set as Lead strip only, Stand-outs 2x2 colour bug fixed,
  info sheet D12-14 built (7adf7ba); My Box E17-21 + forms row + 'Two Megas' warning (d7357e8, helper patch + Sim's go; 19 uses
  '<0.1%' over Sim's 'under 1%' at her choice of the recommendation); 30-game win-rate rule on the new site (b0ce520); main = live
  (44c9a72, run 723 green). Preview v58-v61.
- BUG (Sim, iPhone): "Why this score?" opened empty. Cause: whyHtml returned '' when the Strength Score (v2) can't be worked out and
  the page falls back to the older check score (v1). Fixed 24314ef: the sheet names the case. Sim's own team's case NOT yet known:
  ruled out (measured): all 90 tournament teams in today's data get v2; all 335 roster entries swapped into the sample team get v2;
  the Preview build loads the model (sample team v2, 93). Left: a duplicate species arriving via import/link/saved team, or a stored
  slot name the site no longer knows (counts < 6). Waiting for Sim to tap "Why this score?" on v61 (it names the case) or send a team link.
- Unexplained, logged: My Team at 820 measured 3,042 earlier, 2,962 later (same with and without the My Box patch; under its limit).

- MISTAKE (Claude), fixed at once: the fonts-branch commit 93ed4b7 also carried the frozen Nov 9 out/ files (they were still staged in
  the scratch copy). A new commit put out/ back as at 9eabdd6 (no history rewritten); the branch now differs from 9eabdd6 only in
  app/test/run.mjs (git diff --stat). Rule: after testing on frozen data, reset out/ from the commit before committing anything.

## Nov 12, 6:45-8:00 AM Eastern (Claude, under Sim's authority; Sim approved every design picture)
- APPLIED on claude/design6: A2 (Team Checks once, "Things to Know"), A3 (±0 swap behind See all), A4 (one verdict per row,
  "Calc disagrees"), A6 (one message per Apply), A7 (underline follows on phones), A8 (bars 96%), A11 ("Saved ✓"), squeezed row
  (card layout by its own width), A9 (Mega tag on the tile corner, ring lower, no spill on phones). Two merge conflicts with the
  morning's wording change resolved by hand (A2's checks list keeps the word-list wording).
- Claude's recommendations where a picture left a choice: A2's fold subtitle "7 things, legal" (was "7 things to know"); A7 from
  700px up (sections side by side) no underline rather than a wrong one; A11 on phones the four buttons in an even 2 x 2.
- Checks on the built combined page (real data): c13 My Team 4,331 / 3,945 / 3,318 (iPad now within 3,500) / 2,215 (were 4,818 /
  4,309 / 3,775 / 2,223); 0 cut off, 0 tap <44 on My Team, 0 hidden-focusable, 0 repeated lines, 0 console errors, <= 1 main button
  per screen, both engines. A5 focus test kept; jump links 0 of 40 hidden; A7 phone marks the tapped section, 820+ none; A11 2 x 2
  at 320/390/600. Behaviour A-team v2: 54 / 78 before test updates: only MU-02, SUG-10, SUG-11 changed (they checked the old layout
  and words); updated to accept today's site and the approved design; all three pass on both today's page and the new build.

- Live site fonts (Sim: "sure"): prepared, NOT live. Branch claude/wonderful-carson-nb6gd5 (from main 9bac0c3), commit 9eabdd6:
  today's page hosts its fonts itself (Unbounded 500-900, Instrument Sans incl. italic 500, Archivo italic, and Dela Gothic One,
  which riso.css loaded from Google too; found by the build's new guard). 13 files + OFL licences in app/src/fonts/, copied beside
  page.html by the build. Measured (today's page built from main vs the branch, default view, real data): Google requests 4 -> 0,
  same faces loaded, full-page screenshots 6/6 identical (Chromium 390/1440, WebKit 390, light/dark); run.mjs ALL PASSED. Not
  covered by the screenshots: views that use Archivo italic, Dela Gothic One or italic Instrument Sans (files copied exactly).
  To go live (needs Sim's go): merge to main after GitHub's tests pass, then republish app/dist/page.html to the live artifact
  (5VBfLTR5sM4JU5NswJYyGk) WITH the 13 fonts/*.woff2 files beside it (else the page falls back to system fonts).
- Read-through (C3) of the combined My Team: consistent now ("Nothing to fix" / "All 4 basics and all 3 notes pass" / "Things to
  Know: 7 things"; 9 + 12 = "beats or handles 21"). Noted for Sim, not changed: "Edit Set" twice (strip under the six and the Set
  section); each Stand-outs row repeats its group word (one list would save ~60px).

## Nov 12 morning (Sim, answers to the overnight questions)
- DONE (Sim's go on Claude's recommendation): word-list wording on the new site (today's site unchanged). "Ready for 81% of the
  top 30" was a weighted score (each threat by its top-cut share; No answer 0, Shaky .4, Handles .8, Beats 1) shown as a share of
  threats, beside "handles 21 of 30", the plain count. Now: check "Handles the top threats" / "Beats or handles 21 of the top 30",
  chip "21/30 handled", All 30 heading and threat sheet in the same words, Why this score "(beats or handles 21 of 30 top threats)",
  Quick add "Matchups +7%", the "?" popup's title and text; the lead-support warning under "Nothing to fix" is labelled "Note:".
  Measured (built page, real data, everything opened + popups + sheets): lines with "ready" 8 -> 1 (the approved band word
  "Tournament ready"); 0 console errors. Behaviour A-team v2: only MU-04, SUG-10, SUG-11 changed (they checked the old words); they
  now accept either wording and pass on both today's page and the new build. Picture: proposals/wording-done.png.

- Sim: the older items are a go ("good for us to move forward"): Player IDs (needs Sim to add the NP_PID_KEY secret on GitHub;
  main's daily job doesn't use it yet, so nothing is broken meanwhile), About page wording (players can ask to have their name
  removed), review item 10 screenshot, a favourite link on the empty My Box, the open-Battle-tab limit (3 screens desktop, 6 phone).
  Queued: they are other pages; My Team is finished first (this chat's rule), the favourite link is visual (picture first).
- Sim: phone 320 uses the 390 limit (3,400) ("go with your recommendation"); page-heights.md updated, no longer "assumed".
- Sim: fix A9's three small faults on the selected Pokémon (Mega on its own line, floor ring across the art, art spilling 4px on
  phone). Visual: built and shown with pictures before anything is published.
- Sim: KEEP the night glow on the band word ("Top tier").
- Sim: fix the wording on Claude's recommendation: the "?" popup and chip still say "ready"/"93% ready" (word list: Matchups), and
  "Nothing to fix" sits above a lead-support warning.
- Sim: yes, the LIVE site also hosts its fonts itself (Claude checks how a change reaches live and tells Sim before it goes).

## Nov 12, night (Claude, under Sim's executive authority until 6 AM Eastern; non-visual only)
- A5 (redraw throws the user out): cause confirmed in code. V2.redraw rebuilt the whole page (header included) and only gave focus
  back to elements with an id, so after the suggestions finished focus fell to the page top and the next Tab went to "Skip to the
  page". Fix: V2.redraw builds the new page off-screen and changes only what differs (V2.morph); unchanged parts and the focused
  control stay the same elements; if the focused control had to be replaced, focus goes to its new copy. The theme switch uses it too.
  Measured on the built page (app/dist/v2.html, efe9fe5 + fix), scratch test a5.cjs, Chromium 390/1440 and WebKit 390/1180:
  before `focusAfterLateResults: BODY, nextTab: Skip to the page, every part replaced`; after `Night button, Why this score?,
  every part kept`. The first version broke behaviour test SUG-04 (passes 3/3 on the clean build, failed 3/3 with the change): "Show 2
  more" turned into "See all suggestions" in place and the same click then opened All Suggestions. Rule added: an element whose
  data-* markers differ is replaced, never changed in place. SUG-04 then passed 3/3 and the A5 results held. Not yet done: reserving the Suggestions section's height while it works (C5) shows a blank area, so it is visual
  and goes to Sim with pictures.
- A6 (two status messages): at load only Suggestions' "Working out…" line is a live region now (the one in the closed Problems fold
  was also role=status). Which of the two Apply messages stays (the bar in Suggestions or the toast) is visual: pictures for Sim.
- A14 (controls in closed sections): NOT a bug on this build. Measured (built page, Chromium and WebKit, 1440): inside the closed
  Problems fold all four controls report checkVisibility()=false, are not in the screen-reader tree, and a real Tab walk never
  stops on them (0 hidden stops of 55 / 54); after opening the fold they are in the tree, so the test can see them. The sweep read
  the "would-be" size browsers report for hidden content. The C13 check must use checkVisibility(), not sizes.
- A15 ("?" buttons 24x24): tap area now 44x44 with the same look. Measured: before/after screenshots of the chip row pixel-identical
  in 16 of 16 cases (Chromium and WebKit, 390 and 1440, day and night, popup closed and open); tap area 24x24 -> 44x44; the popup's
  position relative to the chip row unchanged in 8 of 8 cases (it is now placed from the drawn 24px tile).
- A16 (proofs that disagreed, full check nov11-r4b: base b8f55ed vs 9d22563). Answers, each re-run here on today's page built at
  the base and from the working tree (6aa245f content):
  - same-six 0/67 identical: every one of the 67 differences is ONE line, Home's "Game plan vs the Champion's six" (ignoring it,
    0 of 67 differ). It was changed on purpose by cb49701 (Nov 11, Sim's report: opponents from a real team sheet use their real
    sets, "Home's game plan" named in the commit). With the base at cb49701: `67 My Team six steps compared: 67 identical, 0
    different`. Out-of-date proof base, not a regression.
  - same-info 1/350 different: the one difference is the "home" view (Home's six ordered by that same plan). Base cb49701:
    `350 info sheets compared: 350 identical, 0 different; 0 errors`. Same intended fix.
  - same-compare 1/21 different (PC): NOT reproduced here: 3 runs, each `21 Compare steps compared: 21 identical, 0 different`
    (base b8f55ed). Cause unknown; likely a timing wobble on the PC run (a guess, not tested; that run's step dump wasn't kept).
  - same-share-v2 crashed on Windows: the script had the Linux repo folder written in. Fixed (folder from the script's own place,
    page addresses with pathToFileURL). Here: `share images, today's page vs the new build (same data, same team): 12 of 12 identical`.
    Not yet run on Windows.
- MISTAKE (Claude, ~5:33-5:40 UTC Nov 12, recovered): while preparing the A6 proposal picture, Claude applied a patch made with
  `git diff` in a scratch worktree whose out/ folder had been replaced by a link; the patch carried "deletions" of out/ and removed the
  main repo's out/ data files (nothing was committed or pushed). Found within minutes from a failed second apply; restored with
  `git checkout HEAD -- out` (diff vs HEAD 0 lines; out/ was unmodified before). Everything that ran in that window is discarded and
  re-run: the A6 pictures (they had no daily data), the today's-page behaviour run, and app/dist rebuilt. Rule from now on: proposal
  patches are made with `git diff -- app/src/v2` (paths named), checked with `grep "^diff --git"`, and never applied to the main tree.
- Proposals (waiting for Sim, pictures in docs/rebuild/proposals/): A2 (a2-proposal.png, a2.patch), A3+A4 (a3-a4-proposal.png,
  a3-a4.patch), A6 (a6-proposal.png, a6.patch), gallery wording (gallery-wording.md). They combine (applied in that order in a
  scratch worktree: a3-a4, a6, a2) and build clean. Behaviour A-team v2 on the combined build: 54 pass / 78 FAIL; the only changes
  vs tonight's committed build are MU-02, SUG-10, SUG-11, which check today's wording (calc level on every row; the "Problems and
  Team Checks" title and count line; the "?" inside that fold). If Sim approves, those three tests are updated to the new wording.
- C13 check built (Claude's decision under authority: plan steps 3-6 wait on Sim's pictures; this is a measuring tool, no site
  change): experiments/c13-check.mjs. Tested by planting one fault of each kind (C13_PLANT=1): all 8 kinds reported; clean page: no
  false alarms. Results on design6 4514041 in page-heights.md. Real findings: tap targets under 44 wide (jump bar "Set" 21-24,
  "Battle"/"Sets" links 42/31, header menu at 820 35-42, My Box "Box 1"/"Box 2" 28, footer "About" 43, "Undo" 38); duplicated
  lines when everything is open (the A2 duplication). Not covered by it (manual): C2, C3 beyond repeated lines, C5, C6, C9-C12.
- C8 tap targets (Claude, non-visual): jump bar tabs, header menu, footer links, the "Battle"/"Sets" links and the Undo bar's
  button get an invisible 44x44 tap area (::before). Measured on built pages: c13 hit test (taps 21px out from the centre each way)
  My Team 0 failing controls at 320/390/820/1440 in Chromium and WebKit (before: "Set", "Sets", header menu at 820 failed);
  full-page screenshots before vs after 16 of 16 identical (My Team and My Box, 390/820/1440, day/night, Chromium + WebKit 390;
  a same-file control run showed one view with ~3,600 pixels of its own noise, which was identical here); behaviour A-team v2
  unchanged (57/75/6/4/2). Left for Sim (visual): My Box's "Box 1/Box 2" markers (28 wide, 8px apart: needs more space).
- Fonts hosted by NastyPlot itself on the new site (Sim's yes, Nov 12; how it's done is Claude's call, non-visual): Google's own
  Instrument Sans and Unbounded files and descriptors (12 faces, 7 files, 293 KB, split by language as Google serves them, so a
  browser fetches only what a page uses: Latin, 158 KB with Latin-Ext) in app/src/v2/fonts/ with both OFL licences, served from
  fonts/ beside the page (build copies them to app/dist/fonts; --fonts=<folder>/ like --art; the build fails if a Google Fonts link
  comes back; the behaviour harness copies them beside its test page; Preview kit copies and publishes them: 394 files).
  Measured on built pages: new page 0 requests to Google (old 3), same 3 faces loaded, Chromium and WebKit; full-page screenshots
  16 of 16 identical (My Team and My Box, 390/820/1440, day/night); a build with a broken font folder came out DIFFERENT, so the
  comparison does see fonts; c13 heights identical to the Google-font build. Not done: today's LIVE site (app/src/head.html) and the
  gallery still load fonts from Google; changing the live site needs Sim's go.
- A7 proposal (a7-proposal.png, a7.patch; visual, waiting for Sim): the jump bar's underline marks the section tapped and follows
  scrolling. Measured (built page, Chromium): tapped -> marked right 8 of 8 (phone and desktop; before: always "Set"). Scrolling by
  hand: phone Set -> Matchups -> Suggestions -> Team Checks; desktop (two columns side by side) Set -> Team Checks -> Suggestions ->
  Team Checks, never Matchups. Sim's choice for desktop: keep, mark only what was tapped, or no underline on desktop.
- A8 proposal (a8-proposal.png, a8.patch; visual, waiting for Sim): bars 96% tint on every screen, blur kept, solid where a browser
  can't blur. Chromium at phone width (the fix plan's sweep was Chromium; mouse screens there use 82% header / 86% bar): text behind
  goes from readable to a faint trace. WebKit: the computed tint goes 92% -> 96% but the pictures barely change, probably because
  headless WebKit here doesn't draw the blur (a guess); a real iPhone check by Sim is needed before calling C9 met.
- A11 proposal (a11-proposal.png, a11.patch; visual, waiting for Sim): "Saved ✓" (outline, opens the same Save sheet) when the loaded
  saved team is unchanged; "Update Saved Team" (main) after any change; Undo brings "Saved ✓" back (measured, built page, Chromium).
  Known flaw shown in the picture: on phone the four buttons wrap 3 + 1 ("More" alone): needs Sim's layout choice (e.g. 2 x 2).
- Jump links (Sim: "pressing Matchups just scrolls and takes you nowhere"): FOUND and fixed (behaviour, not look; Claude under
  authority). The jump scrolled each section's top to y=0, under the sticky header and jump bar, so its heading and first lines were
  hidden (phone: you landed on "calc reading is underneath."). Measured on the built page (design6 4485c6b, real data, Chromium and
  WebKit, 320/390/820/1180/1440, each section): before 33 of 40 headings HIDDEN (105-121px too far; the rest only because the page
  end was reached); after (scroll-margin-top = header + jump bar + 16px) 40 of 40 seen, 16px under the jump bar. Full-page screenshots
  at rest 16 of 16 identical. CORRECTION: the Nov 11 repro read "targetTop: 0" as "the link works"; 0 meant the heading was under the
  bars. "Matchups disappears on a wide window": still not reproduced (visible with 8 rows at 1180-3200, both engines).
- Squeezed suggestion row (Sim's screenshot, ~1180): cause confirmed: the card's three-column layout follows the window (900px+),
  but from 1180 the page splits in two and the card is ~470px, leaving the swap 135px. Proposal (squeeze-proposal.png,
  squeeze.patch; the look changes at those widths, so Sim decides): three columns only when the window is 900+ AND the card is
  560px+. Measured (built page, real data): only 1180/1260/1320 change (swap 135x198 -> 470x44 at 1180); 390-1179 and 1400-1920
  identical with the same page heights; Chromium and WebKit.
- Noticed, for Sim (wording, not changed): the "?" popup for the verdict chip is long (a 473px paragraph) and says "Ready for the top
  threats" / "93% ready", which the word list replaces with Matchups.
- Setup only: WebKit installed in this container (with its system libraries); node_modules/playwright linked to the preinstalled
  Playwright so the ES-module test scripts can import it (node_modules is gitignored).

## Nov 12 (Sim, new chat; answers to the handover questions)
- Sim: "executive authority" / "express authority" defined (RULES.md section 3): Claude in charge of everything except visual or
  design choices, helpers at Claude's discretion with moderate usage, immediate confirmation, decisions logged here.
- Sim: A9 selected Pokémon: NONE of the three redesigns; keep the current look ("i like what we have NOW").
- Sim: My Box header icon = option 1, the retro PC with a tiny Poké Ball on screen (replaces the v52 storage box). Claude flagged
  that the ball reads like a minus-in-a-circle at 24px; refined drawings go to Sim with pictures before building. Queued after
  My Team (this chat's rule: My Team is fixed and re-measured before anything else starts).
- Sim: My Box icon: "go with your recommendation for what would be best": Claude refines option 1 (retro PC) so it reads at
  24px; Sim still sees the picture before it goes on the Preview. Queued after My Team.
- Sim: the Day/Night button should be a sun/moon icon, not the words "Day"/"Night". Queued (visual: pictures first); goes
  with A15's unclear-label item.
- Sim: A4 Matchups and A3 ±0 suggestion: "your recommendation". Claude recommends: (A4) each row leads with the real-games word;
  the calc shows only when it points the other way ("Calc disagrees: Beats it"); with no real-games verdict the calc is the row's
  verdict; the All 30 view stays calc-grouped. (A3) a ±0 or worse best swap is not shown; the quiet "Nothing to fix" line stays and
  the swap sits behind "See all suggestions". Both are visual: before/after pictures to Sim before building.
- Sim: phone height cuts: "recommendation". Claude: do A2/A3/A4 first, re-measure, then propose only the cuts still needed
  (sliders folded into a summary line, shorter Matchups intro; keep the Favoured list open). Pictures first.
- Sim: the polish helper's 15 findings: "help me out here". Claude's proposal (not yet approved): My Team ones (1-7, 11) with
  the My Team fixes, other pages in their turn, 12 and 15 covered by A9/A8, the night glow (13) Sim's call with pictures.
- Sim: the older open items (NP_PID_KEY, About wording, item 10 screenshot, empty-Box favourite link, Battle tab limit):
  "those are good". Meaning not confirmed (fine as they are, or later?); asked.
- Sim: host the two fonts ourselves: yes (before/after pictures).
- Sim: today's known bugs are FIXED in the rebuild, not carried over ("fix bugs why bring them over"). The "same as today"
  proofs will show each fix as a difference, marked as a fix. Art and name ownership for the public site: Sim, later.

## Authority
- Nov 12, ~6:45 AM Eastern (Sim): executive authority again until 8:00 AM Eastern. Sim approved every design picture sent (A2,
  A3/A4, A6, A7, A8, A11, squeezed row, wording, A9): "go with your recommendation and what you believe would be best". New visual
  choices beyond those still go to Sim with pictures; nothing published without her go. (Claude confirmed late; Sim had to ask.)
- Nov 12, 6:00 AM Eastern: Sim's executive authority ENDED. No decisions on her behalf from here; summary given in chat. Last
  work commit d6f620f; nothing published (Preview still v52); everything visual waits in docs/rebuild/proposals/.
- Nov 11, ~11:30 PM Eastern (Sim): executive authority until 6:00 AM Eastern (Sim asleep). Rules as RULES.md section 3:
  everything but visual/design on Claude's recommendation, helpers at Claude's discretion (moderate usage), nothing published.
- Nov 11 (Sim): authority extended to 11:00 PM Eastern, same instructions.
- Nov 11 (Sim): authority given again until 10:00 PM Eastern, same instructions.
- Nov 11 (Sim): authority extended to 9:00 PM Eastern, same instructions (decide on Claude's recommendation, log here, summary at the end).
- Nov 11, 6:02 PM Eastern (Sim): Claude has executive decision-making authority until 7:00 PM Eastern; decisions on Claude's
  recommendation, each logged here and summarised to Sim at 7 PM.

## Every page
- Nov 11, 9:39 PM (Sim, on her iPhone): stutter gone, glass kept, Add a Pokémon sheet "love it. works well".
- Nov 11 (Sim, iPhone Claude app: Add a Pokémon box opened off screen): while a box in a sheet has focus, phone sheets pin to the top of
  the visible area (visualViewport top/height) instead of sitting a measured keyboard-height up, which the Claude app's frame can get
  wrong (my guess at the cause; Sim to confirm on her phone). While a sheet is open, toasts sit under the dimmed backdrop.
- Nov 11 (Sim: "i liked the glass"): the frosted bars are back on phones and iPads (92% opaque instead of 82%, so text under them
  doesn't read through). The stutter Sim recorded was the picture flash on every redraw (fixed), not the blur.
- Nov 11 (Sim's recordings, iPhone and PC): every tap redrew the page and rebuilt all pictures, so the six blanked for a moment
  (measured before: 0 of 6 pictures kept per tap; after: 6 of 6 kept, none blank, WebKit iPhone). Touch screens: text boxes 16px so
  iPhone doesn't zoom the page (Save Team name: 15px before -> zoomed and slid sideways; 16px after, page width = screen width).
  The strip above the jump bar was content showing through the see-through header; touch headers are solid now.
- Nov 11 (Claude, under Sim's 9-10 PM authority; Sim on iPhone: sideways scroll, stutter): html/body overflow-x:clip so no page can
  scroll sideways (WebKit iPhone, measured: overflow up to 33px under 300px wide before, none from 260 to 430 after); on touch screens
  the header, bottom menu and dock are solid (no frosted blur) and the page background scrolls with the page (no background-attachment
  fixed); hover underlines only on mouse screens (a tapped "Lock" stayed underlined). Stutter fix is a measured-cause guess until Sim
  tests on her iPhone. Also: wide My Team columns rebalanced (Set + Suggestions | Matchups + Team Checks + Your Games, equal halves):
  page 2381 -> 2223 at 1440, columns 1135 vs 1267 (were 729 vs 1425).
- Nov 11 (Claude, under Sim's 6-7 PM authority; review item 19): the player-name sweep found no name on screen on either build, but
  the Preview build wrote 756 real player names into its page source (--preview-data). Fixed in build.mjs: each name becomes the same
  neutral stand-in ("Player 12") everywhere, so team matching still works; measured 0 of 756 in the new Preview source (756 of 756 in
  the old one, so the count can fail). Published right away, ahead of the last Suggestions proofs (the Preview is private, not live;
  privacy first). Still open, Sim's call: names reach visitors' browsers in the daily data (meta/events, meta/teams, meta/weekly) until
  the Player IDs work goes live (needs the NP_PID_KEY secret); the About page still says players can ask to have their name removed.
- Nov 11 (Claude, under Sim's 6-7 PM authority; review item 18): the data's date ("Data as of Nov 10", plus "(N days old)" when
  stale, the shared rule from today's site) is in the footer of every page, and on My Team as a quiet line under the rank.
- Nov 11 (Sim, review item 12, after the colour audit): (1) type colours used as tints (My Team move rows, the move picker bar,
  the My Box wallpaper) follow the rule: hue kept, saturation 72%+, lightness 56% (--tyn-* in tokens.css); near-grey types (Normal, Dark)
  stay neutral grey. (2) Type chips with white text stay outside the pool rule but are darkened, hue kept, until every one measures
  4.6:1 or better (was 5 of 18 at 4.5+). (3) The picked Pokémon's panel in My Box takes that Pokémon's own colour. (4) Grey Pokémon keep
  their coloured floor (some share a similar blue). Pokémon floor colours already followed the rule (346 of 346, measured).
- Nov 11 (Sim): approved everything so far: review items 7, 8, 9; the Matchups helper's choices (Top 10 in 1-5 / 6-10 columns,
  5 + Show 5 more on phones, the next 20 as tiles, Top 12 grid with colour + shape, All 30 grouped with calc reasons, Best fix only
  when it raises the score, the ring shows the Strength Score); and the link rename to "How the Strength Score works".
- Nov 11 (Sim's review item 7, Claude did): every button, link and toggle is at least 44px tall on phones and tablets (a link inside a
  sentence is exempt). experiments/polish-check.mjs now measures this on every page ("tap"); sheets and the empty My Team were measured
  by a separate scratch check. Header logo, nav, Search, footer links, back links, Open My Team, Info Sheet and the Why link were fixed.
- Nov 11 (Sim's review item 9, measured): on phones, nothing on any page ends behind the bottom menu. The polish check now scrolls each page
  to the end at phone widths and lists any text or control behind the menu ("under"). Measured 0 on all six new-build pages at 320, 390
  and 600 wide; the check was proven to catch it by removing the footer's bottom space on purpose (3 footer links 21px behind).
  The new-build check now visits all six pages by default (team, team-empty, box, compare, sheet, guide), not only the style guide.

## My Team
- Nov 11 (Sim's ask of Nov 11, 4:29 AM, done under her 7-9 PM authority): the underdog block on empty My Team (and the style guide
  sample) has "Or build around your favourite Pokémon ›", linking to Build (Build Around a Pokémon). Until Build is rebuilt it opens
  Build's "Coming next" page. Not on the empty My Box, where the job is adding the Pokémon you own.
- Nov 11 (Claude, under Sim's 7-9 PM authority; review item 13): the featured underdog stands on a floor ring and pool in its own colour
  (Flapple: gold) on the style guide, empty My Team and empty My Box; the loose red/blue cloud and glow are gone. On empty My Team the
  page's one filled button stays "Build Me a Team" (rule: one main action per screen), so the underdog's "Add Flapple to My Team" is
  outlined; on the style guide sample "Build around it" stays filled. The breathing pool is kept (it sits on the floor, not a cloud).
- Nov 11 (Claude, under Sim's 6-7 PM authority): accepted the Suggestions helper's choices: All Suggestions is a sheet over My Team;
  "Swap my Mega?" is remembered in this browser (np2.swapMega; today's page resets it on reload); "Problems and Team Checks" is a fold
  at the foot of Team Checks, closed by default as today; " · " lists become words by today's shared rule; the "?" bubble has no mascot.
- Nov 11 (Sim's #5, done under her authority): "Nothing to fix" is one quiet paragraph with Battle and Sets as links, not a headline
  (beside optional swaps the big headline read as a contradiction); the swaps under it are introduced as "Optional swaps:".
  Known gap: the Sets link goes to a page the new build doesn't have yet (as does Battle, which shows "Coming next").
- Nov 11 (Sim): the selected Pokémon stands on a floor ring in its own colour (idea 2), no panel behind it.
- Nov 11 (Sim): action strip under the six (− Remove, Lock, Set as Lead, Edit Set); a locked Pokémon shows a padlock before its item.
- Nov 11 (Sim): Matchups opens on the stand-outs (Unfavoured, Favoured) with "See all 30"; Team Checks fold to one line when all pass;
  Set shows only details and moves; the band meter lives only in Why this score?; Save Team, Share, Saved Teams visible, the rest in More.
- Nov 11 (Claude): the new build keeps its Matchups view under its own saved key (np2.seg.thr), so today's page never meets "Stand-outs".
- Nov 11 (Claude): narrow Matchups shows the four view buttons as a 2 by 2 (each label on one line) instead of a sliding row.
- Nov 11 (Claude): on phones under 400px the Saved Teams count is hidden in the action row (the header's Switch Team shows it).
- Nov 11 (Claude): on wide screens the win line, rank and Why this score? sit under the score, the six fill the right side.
- Nov 11 (Claude): header reads "My Team · 6 of 6 · Sun team" with the team name as the page heading; Legal mark in the jump bar
  (in the header on windows under 960px).
- Nov 11 (Claude): Your Games sits under Suggestions on desktop.
- Nov 11 (Claude): Title Case on buttons and headings; the new words follow the word list (Strength Score, Matchups).
- Earlier (Claude): EDIT-08 says how the Strength Score moved; TEAM-07/08 the new jump bar at every width.
- Nov 11 (Sim): the featured underdog replaces Darkrai on empty screens (TEAM-19, BOX-07, X-03).

## Compare
- Nov 11 (Claude): "Why These Scores" (not "Why these grades"), both teams side by side; the tested-on line and the key once below.
- Nov 11 (Claude): "← My Team" back link in the eyebrow (also My Box).

## My Box
- Nov 11 (Claude, under Sim's 6-7 PM authority; Sim called the first version "super sloppy"): the picked Pokémon's panel: the rating
  label moved to the top corner on one line (it sat on the floor ring), the Pokémon's colour rises from the floor instead of a flat
  wash, and the phone sheet stacks picture, name and types (the name broke mid-word in a narrow column).
- Nov 11 (Sim's review item 8, Claude did): the light rays are gone from the box wallpaper and the picked Pokémon's panel (rays are for the
  Home hero only). The blue mark's key ("On your team") moved from the box-link tools at the bottom to just above the grid, shown
  only when that box has a team member.
- Nov 11 (Claude), CHANGED: the box search now leaves out Pokémon already in the box (as today's site and BOX-02 expect).
  This replaces the earlier decision to show them greyed with "In your box". Sim can pick either.
- Nov 11 (Claude): the box search is named "Add a Pokémon to your box".

## Data
- Nov 11 (Claude, proposed, not done): the daily ratings log also saves the shown 0-100 number next to the raw total, so a raw 89
  and a shown 94 can't be mixed up again.

- Nov 11, ~10:40 PM: "Mega" label gap .3em (4.5px, off the 4px grid) changed to 4px everywhere (My Team, Team Sheet, suggestions). Polish check My Team: no new findings. iPhone (WebKit) sweep of My Box, Compare, Team Sheet, empty My Team at 300-430 wide: no sideways scroll; My Box add sheet stays on screen while typing. Preview v50.
- Nov 11, 9:46 PM: Sim allowed helpers until 11 PM. Started two look-only helpers: a My Team height breakdown (phone 4354 vs 3400 target) and a fresh-eyes polish review of every new page. Their findings go to Sim as proposals; fixes land one at a time.
- Nov 11, ~10:05 PM: My Box quick link in the header next to Day/Night (Sim: "a box next to day night switch", not a sixth menu place; a sixth place was tried and reverted). It shows "My Box" on every page and every width, underlined in PLOT blue (slanted, like the menu) on My Box; My Team is no longer marked current there (one mark). To fit: header tools 8px apart under 900, menu 12px apart under 900, names never wrap, phone-size logo at 700-759 and a 26px logo under 360. Measured: fits 300-2560 with even margins; polish check box+team: no new findings.
- Nov 11, ~10:05 PM: Sim: "a box icon up top", not words, and never a sixth menu place. The header link is now a box icon (lid, body, handle slot, drawn like the search glass), 44px tap, labelled "My Box" for screen readers and on hover; slanted PLOT-blue mark under it on My Box. Fit rules: menu names never wrap, 24px apart below 1100, 12px below 900; smaller logo at 700-759 and under 360; tools 4px apart under 330. Measured 300-2560 in WebKit: no sideways scroll, even left/right margins. Polish check box+team: no new findings.

## Nov 11, ~10:00-11:00 PM Eastern (Sim)
- Sim: My Box is never a sixth place in the top menu or phone bar ("waaay too much"); it goes next to Day/Night as an icon, not
  words. The two entries above about a "My Box" text link are superseded; v52 shows a storage-box icon. Sim then suggested a
  Pokémon PC icon; three options were described, none built (waiting for Sim, with pictures).
- Sim: STOP until she says go (~10:45 PM). The iPad "Suggestions beside Matchups" change is parked on branch
  claude/park-ipad-balance, not on the Preview.
- Sim: no design or visual decision ever without her yes and screenshots, even under authority; every "checked" names built page
  or mock-up, the result line and a plain-English meaning; quality over speed. Rules in docs/rebuild/RULES.md; her My Team fix
  plan in docs/rebuild/my-team-fix-plan.md; state of everything in docs/rebuild/HANDOVER.md.
- Sim: Shady Paw is cut (not the mascot). Host the two fonts ourselves. One source for ratings before Ratings is built.
- Correction (Claude): the "fits / no new findings" lines above were measured on the built page for the header only; they do not
  mean the pages are done. page-heights.md had My Team's mock-up heights as if built; corrected the same night.
- ~10:55 AM Eastern: "Save This Six" -> "Save This Team" on the Saved Teams free-spot card (Sim: "save this team looks good to me").
- Bug fix (restores the approved My Box layout; before/after pictures sent; Sim: "absolutely", published Preview v65, 394 files): at 900-1399 wide the pinned picked-Pokemon panel
  slid over Copy Box Link / Reset Box / the sync line once you scrolled (found by BOX-05/06 failing: the tap landed on "Swap Into My
  Team"). The panel now stays pinned inside its own column only. Built page app/dist/v2.html: behaviour BOX-01..07 + SAVED-09 + SHARE-01
  `9 pass, 0 FAIL`; BOX-05 failed before the fix. BOX-01 test reads the approved item-20 sync words on the new build.
- Measuring note: c13 heights must be taken on app/dist/v2.html (fonts beside it). Copies in the scratchpad measured My Team 390 at
  3,719 ("OVER") on every commit back to 3aa5fa6; the real build reads 3,699 (ok). Likely also the unexplained 820 3,042 vs 2,962.
- ~11:18 AM Eastern (non-visual bug fix, Preview only): the Preview's "land on My Team" step (pages/coming.js, Preview builds only)
  reset the address before team links (#team=) and box links (#box=) were read, so every link opened in the Preview was silently
  dropped (good ones loaded nothing; cut-off ones showed no message). Links now pass through. Built Preview foundation.html: cut-off
  link toast "That team link didn't work: it may be cut off" at 437 ms; a good six opens the Shared team sheet; a box link opens My
  Box with Add/Replace. Real builds never had this step (BOX-06 passes there). Found while making the team-link plan pictures (F23).
- ~11:21 AM Eastern: team link plan F22-F25 written (docs/rebuild/team-link-plan.md, pictures docs/rebuild/team-link/); 4 choices sent to Sim. Nothing built.
- ~11:45 AM Eastern: Sim agreed team-link choices 1-3 (no name in link, refuse partial links, deflate); 4 (address on images) waits for the public address (~2 weeks).
- ~11:50 AM Eastern: SAVED-06 (PC A-team re-run 5ba520c) fails on Sim's PC only, also on Nov 11 (2026-11-11-pc.txt), passes 3/3 in the cloud: not a new break. Added FAILSHOT=dir to the behaviour runner (picture + page text of each FAIL; proved on TEAM-15) so the PC can show why.
- ~11:55 AM Eastern, Sim: NO feature is removed, every feature intact (Claude wrongly offered keep/merge/drop on My Team's 16 unbuilt pieces; corrected). Order: finish My Team, then the next section; pieces that belong together are built together. Batches: Team Sheet (10-14), header Matchups summary (1), folds (3-6), Edit Set (7-9), Export (2), Saved Teams line (15), sample note (16). Placement pictures first, then build.
- ~11:59 AM Eastern: SAVED-06 PC picture (8104357): the Delete step on the open team landed on that card's Compare ('Sun six is picked'), so no Delete confirm appeared. In the cloud, with the open team's ⋯ menu open, Delete is the top element at 1280/1440/1024/390 (elementFromPoint), so a player's tap reaches Delete here. PC-only test-tap problem, cause on the PC not yet known; still open (not marked known, test unchanged).
- ~12:02 PM Eastern: Day/Night words -> sun (day) / moon (night) icons in the new build's header, like today's site (Sim: asked several times; had slipped from the day plan). Built, pictures sent; waits for Sim's yes before the Preview.
  Sim: "Looks good." Published Preview v67 (394 files).
- ~12:03 PM Eastern: Sim renews authority until 4 PM (non-visual decisions; visuals = pictures + her yes; helpers allowed). Plan: Team Sheet batch myself; one helper makes placement pictures for the folds batch (Game Plan, Types, Open Team Sheet, How Scoring Works).
- ~12:08 PM Eastern: Team Sheet batch (items 10-14) built on the branch, NOT on the Preview: head line (← My Team · team · Reg M-C doubles · level 50), Share as Image (opens Share on Team Sheet), cards open Edit Set (click, Enter/Space), empty-team message with Add a Pokémon; Team Sheet row in More always shown. Today's 'Copy as text' = the same action as 'Copy for Showdown' (exportPaste): kept under the one name (word list: one name per idea). Use test on built Preview copy: menu -> sheet, Tab reaches cards, card -> Edit Set, Share as Image -> Share, back -> #team, empty Add -> search; 0 page errors. Pictures sent; waits for Sim's yes.
- ~12:15 PM Eastern, Sim: 'I love the suggestions': Team Sheet batch approved -> Preview v68 (394 files); Matchups summary stays at the top of Matchups (no header copy: C3 + phone height 3,699/3,700). Helper 2 started: new-build test branches for SHEET-01..04, IO-04, SHARE-04, TEAM-15 (review before merge).
- ~12:20 PM Eastern: Edit Set batch built (branch, not Preview): slot header (types, 'N X tier rating', share of teams) and Weak / Resists fold (today's mult() with the Ability, Ability text, remembers open). Lock already reads Lock/Locked. Built page: EDIT-02/07/10/11 pass, EDIT-03 FAIL only on word order ('S tier 94' vs approved '94 S tier rating': test needs its new-build branch), EDIT-12 open (design: today's 'Edit team' panel vs the new six-strip + Save sheet). Setup fix: a helper's npm install had dropped playwright from node_modules; relinked the preinstalled copy (not tracked by git).
- ~12:21 PM Eastern, Sim: item 9 'Edit team' panel: Claude's recommendation agreed: Edit Set's six-strip + the Save Team sheet cover it (no stacked six-editor panel). EDIT-12 gets a new-build branch checking that. Edit Set pictures: asked Sim whether the yes covers publishing them.
- CORRECTION (12:25 PM Eastern): the times on the eleven entries from 'team link plan' to 'item 9' were written as 12:00-2:40 PM; the commit clock (UTC-5) shows they happened 11:21 AM-12:21 PM (also the Preview link fix: 11:18, not 11:45). Fixed above. Authority still runs to 4:00 PM.
- ~12:45 PM Eastern: built (branch, not Preview): Export to Showdown sheet (More -> Export; today's text, Copy, select-by-hand fallback), Saved Teams '← My Team' + 'Up to 10 teams. Saved in this browser only / Saved and kept in step across your devices.', first-visit sample note (today's words + Build your own · Import a team). Sample note costs +44 at 390 on the sample team only (3,743 vs 3,700; a short one-line version 3,724; own teams stay 3,699): options to Sim. Helper 2's test branches merged (376f719 cherry-picked): SHEET-01..04, IO-04, SHARE-04, TEAM-15 pass on the current build (8 pass incl. EDIT-10). X-02 now passes the sample-note step and fails later only because the test opens My Box while the Saved Teams sheet is open (site shows '36 Pokémon · 2 boxes' on a first visit, checked). Helper 1's folds pictures in docs/rebuild/folds-proposal (README has its risks).
- ~1:00 PM Eastern, Sim: drop the per-card '−' on the Team Sheet (the six's '− Remove' with Undo covers it); update How Scoring Works to the word list (and its test); 'your recommendations are good' read as yes to: sample note option A (phone limit 3,750 for the first-visit sample team only; c13 adds 50 at 390 when .tm-sample shows; own teams keep 3,700), the four fold placements, and publishing Edit Set / Export / Saved Teams line / sample note. Built page: team 3,876 / 3,743 (limit 3,750) / 2,986 / 1,787.
- ~1:20 PM Eastern: Game Plan built (branch): the six's plan line starts with a 'Game plan' link (44px tap area) that opens a Game Plan sheet with today's gamePlan() rows (Covered / Partly / Missing / Optional, who, note) and the archetype; +0 page height (3,876 / 3,743 / 2,986 / 1,787, Chromium + WebKit, tap<44 0). Also fixed: the sample note's 'Import a team' link (in Preview v69) was 20px tall on touch: now has the 44px tap area.
- ~1:40 PM Eastern: Types built (branch) at the end of Things to Know: Offense/Defense switch (remembered), today's headlines and lists, two-Mega pick, 'Full Tables ›' sheet with today's offense table and defense grid (offense 2x in the good colour, defense weak in pick colour). Shared logic only (analyze, offenseRows, prepOf, playForm, mult). Closed page unchanged: 3,876 / 3,743 / 2,986 / 1,787 (Chromium + WebKit), tap<44 0. Things to Know summary now '7 things, types, legal'.
- ~12:47 PM Eastern: How Scoring Works built at the end of 'Why this score?' (today's 8 paragraphs, first sentence + More/Less; words updated: Matchups, Suggestions, player skill; Team checks paragraph now matches proChecks: 4 counted basics + 3 notes, checked in the page). Team Sheet cards: '↑ Lead vs the meta's top six' on the lead pair (line reserved on every card so names line up; dropped on phones). Sim's report: 'Stomping Tantrum' wrapped onto two lines on the Team Sheet at 820-1920 (also 'Expanding Force' at 1100): plates now one line (padding 12px, no wrap); all 398 tournament move names fit at 1100 (narrowest card), checked by line count.
- ~1:05 PM Eastern: C12 use test on the built new site (experiments/v2-use.mjs, new): 'v2 use test: 32 ok, 0 FAIL' (390 + 1440: Tab through My Team 0 hidden stops, 8 sheets open + Escape close, Export text, Types Full Tables, Remove + Undo, reload keeps team, My Box add/remove/Undo, sort remembered after reload, 0 console errors). v2-clicks: 125 controls, 0 double handlers. v2-sheet-keys: focus never leaves a sheet (both engines). v2-words: 0. kb-jitter: ok. Helper 3's tests merged (80c4bd3): 12 new-build branches pass, today's page 12/12 unchanged, each proven to fail on a broken copy. Helper flags: (a) going to another page while a sheet is open may race (X-02 probe), (b) 'Build your own'/'Build Me a Team' point at #build, not built yet in the real build (C10, known: Build is next section).
- ~1:09 PM Eastern, Sim: My Box header icon = option B, a Pokémon PC showing box slots (Sim: 'I like pc with box slots the most'). Built: team/box at 390 and 1440 unchanged heights, tap<44 0. Also checked: My Box 'Your Team' row is 3+3 at 1400-2560 (helper note resolved).
- ~1:11 PM Eastern, Sim changed her pick: My Box icon = option A, the PC with a Poké Ball ('easiest to identify'), replacing B.
- ~1:14 PM Eastern: Sim: begin the next section. Home plan sent (5 pieces from the approved mock-up + today's 16 Home features; usage warning: heavy, ~4-6 h, runs past today; one piece at a time). Started piece 1 (hero).
- ~1:21 PM Eastern: Home piece 1 (hero) built (branch, not Preview): shared Home numbers moved to src/app/05-home-data.js (today's MG.month/srcLine/pct now point there; same-info incl. today's Home view: 350/350 identical, 0 different); new pages/home.js: tagline (display size, 'your win rate.' in PLOT blue), intro with the real team count, start buttons (Score My Team first with a team, Build Me a Team first with none; Plan a Match), Import from Showdown (opens My Team's Import), Most used right now (#2 · #1 · #3, % of teams, opens info sheets) + data line. c13 home: 320-1440 both engines: sideways 0, cut off 0, tap<44 0, 0 page errors; heights 1,131-1,166 / 1,059 / 937 / 900. Fixed on the way: featured-style name on the ring, phone order, phone 2+1 buttons, 320 overflow, Import 20px tap.
- 1:33 PM Eastern (commit time): Home piece 2 helpers shared (no change to today's site, proven): evName + AR.champ -> 05-home-data.js (homeChamp); SD notes, sdBlock, sdSpecies, sheetPaste -> 19-showdown-paste.js; loadSheet's slot mapping -> 49-event-data.js sheetSlots. Proof on today's page before/after: 978 event-team Showdown texts + champion + 40 event names identical; 976 loaded event teams identical; same-info 350/350 identical (incl. Home). PC full-check prompt (base 5003b61, label nov12-pm) given to Sim.

## Nov 12, 1:33-1:58 PM Eastern, from commit times (Home piece 2 and the test run)
- Home duel: the Champion's buttons now sit right under its six, as in the mock-up (they had been pushed down to line up
  with my side's buttons, leaving a gap). The two sixes stay exactly level (measured: six tops 412 / 412).
- Home duel heading: the event name drops emoji and a trailing prize line (V2.evTitle, new build only; today's site
  unchanged). Checked on all 17 event names in the data: 3 change ("Amyverse VGC Champions Arena #18 ❤️ Cash Prize!" ->
  "Amyverse VGC Champions Arena #18"; "⚔️Torre Lotta Cup #3⚔️ 🏆50€ Amazon Gift Cards🏆" -> "Torre Lotta Cup #3";
  "Friday Fight Night 80! $50 Prize & Team Report" -> "Friday Fight Night 80!"), 14 stay as they are.
- Home hero bug (found on the iPad picture): the floor line under "Most used right now" blocked the grid, so the three
  Pokémon fell into equal columns and the #1 name ran into its neighbours at 320 and 700-1300 wide. Fixed: each tile
  pinned to its column, labels wrap inside it, and the #1 name steps down the type scale (22, then 20) only when its own
  area is narrow. Measured with real fonts, every 20 px from 320 to 1300 and every 80 px to 2560, Chromium and WebKit:
  no overlaps. (A first measurement ran on a copy without fonts and wrongly said clean; redone.)
- Home: "All events ›" and "Open My Team ›" got the invisible 44 px tap area; the floor line no longer pokes 8 px past the
  phone edge. c13 home: 0 cut off, 0 small taps, 0 errors at 320/390/820/1440, both engines.
- Tests: TEAM-11's new-build reader now sees the Set as Lead button under the six (it only read the name line); the test
  then passes every step up to "Home follows", which waits for Home to be wired. SUG-10 reads the approved fold words
  "7 things, types, legal". Today's site: the 22 tests that crashed mid-run (two runs at once ran out of browser) re-ran
  22 pass, so today's site is 132 pass, 0 fail, 10 known bugs. New build: 100 pass, 32 fail, all on pages not rebuilt yet
  (Home x16, Pokémon sheet x7, links to Battle/Build/Log/How we calculate/Popular Sets) except CMP-03 (see below).
- Open, not decided: CMP-03, the Compare picker lost today's line "Any other tournament team: tap Compare on its card in
  Winning teams." It belongs with the Winning Teams page, which isn't rebuilt yet; it goes back when that page is.
- 2:01 PM (commit time): Sim's screenshot of the Home mock-up page showed it unstyled (plain serif text, no colours or button shapes). The
  four published mock-up pages (home, battle, build, ratings) loaded their colours from a separate tokens.css and fonts from
  Google. Why that failed in Sim's viewer is not known (not reproducible here). Fixed by putting the colours and the site's
  own font rules inside each page (fonts from fonts/ beside them, as foundation.html already does); checked locally with the
  internet blocked: day background and Unbounded load. Preview v73 replaced only those four files.
- Sim: Mega stays written "Mega Charizard Y" in blue on Home, the same as My Team (one style for one idea).

## Nov 12, 2:01-2:16 PM Eastern, from commit times (authority extended by Sim to 5 PM Eastern at 2:01 PM)
- Home pieces 1+2 published to the Preview (v74, Sim: "love it"); Preview file list checked: 394 files.
- Home piece 3 built (Top of the Meta with the Top rated / Hidden gems slider, today's underdog, This week in the ratings), from
  the mock-up's CSS; shared helpers only (lairRows, isGem, lairRank, monRating, today's words). NOT on the Preview yet: pictures sent.
- This week in the ratings (Sim: "add a few more"): 13 Pokémon moved under today's rule (rated 60+, moved 2+ points); the data kept
  4. track.mjs now keeps up to 12 and the shared data cleaner reads 12; today's Home still shows 4 (AR.week slices 4), proven:
  today's Home is identical before/after except the sun animation's start time, which differs run to run on the same build.
  The new Home shows 7 rows, the number at which both columns end level on desktop (left bottom 1904, right 1891).
  A move is shown on the ratings' shown scale (RS(now) - RS(before)), so "up 5 points" matches the numbers people see; for this
  week's 12 movers both scales give the same numbers.
- The Preview's built-in data had no movers file; added meta/track to build.mjs --preview-data (the real site already reads it).
- Underdog on Home: the mock-up's stage (two floor pools, one breathing, with the blue/pink glow; still with reduced motion).
- Row names: "Mega" inline in blue (Sim's choice), no reserved space before other names.
- A tablet rule that put every link in an action row on its own line was meant for the duel only; scoped to the duel.
- c13 now knows Home's agreed limits (390 4,200 / 820 3,500 / 1440 2,700; 320 assumed 4,400). Home now: 4,307 / 3,980 / 2,877 /
  2,045. Watch: pieces 4 and 5 (tools, the More on Home fold) still have to fit in the phone limit (~220 px left at 390).
- Hidden gems: only 2 Pokémon qualify today (today's rule: 300+ games, top cut more often than usage predicts), so that view is
  short; real data only, nothing padded.
- Tests (from Sim's PC outside check): TEAM-13b, SUG-03b, MU-05b, EDIT-07b pass on the new build, so their known-bug mark now
  applies to today's site only (today's site: 4 known, unchanged). TEAM-11 and SUG-10 were already fixed in 10b04ce, after the
  tree the PC checked (174523a).
- 2:23 PM (commit time), the two items from Sim's PC check:
  1) WebKit "hidden-focusable 7" on My Team: NOT reproduced here, on the current tree or on 174523a (the PC's tree): c13 webkit team
     320/390/820 all 0; experiments/hidden-why.cjs (new): script focus reaches 0 hidden controls, real key walk 56 stops, 0 hidden.
     Sim's own WebKit Tab walk also found 0. Likely the Windows WebKit build lets a script focus a control in a closed fold; not
     confirmed. PC prompt given to run hidden-why.cjs there.
  2) Share "Could not draw the image in this view.": happens only when the page is opened as a file (file://): the browser blocks
     turning the drawing into an image there. Checked both engines: file:// card/poster/sheet all fail; served over http (as the
     Preview and the real site are) all three draw (1200x675, 1080x1350, 1080x1350). Pictures: docs/rebuild/home/share-*.png.
- 2:26 PM (commit time): Sim's PC ran hidden-why.cjs (3a33199): WebKit on Windows lets a script focus 6 controls inside closed folds; real
  Alt+Tab walk 38/39 stops, 0 on them (390, 820); Chromium 0 and 0. So the "hidden-focusable" reports were the check, not the page.
  c13 now skips controls inside a closed fold for that count (comment in the file); re-run here: team 0 at every width, both engines.
  Open, unsure why: on the PC, WebKit's key walk made 38 stops where Chromium made 56 (here both make 56).
- 2:26 PM (commit time): Home piece 3 published to the Preview (v75, Sim: "home piece 3 looks great"); file list checked: 394 files.
- 2:37 PM (commit time): Home piece 4 built (Everything NastyPlot does: 12 even tiles, names as in the mock-up, today's descriptions; each tile
  opens the page today's site files it under, 32-views.js VIEW_PARENT/VIEW_ALIAS: Battle / Meta / Build). Not on the Preview yet.
  Phone, as in the mock-up: Top of the Meta shows 5 rows and This week 4 (10 and 7 where the columns sit side by side).
  Phone height 4,305 at 390 (limit 4,200); 320: 4,713. Asked Sim: raise Home's phone limit to 4,400 (recommended) or trim.
- 2:43 PM (commit time), Sim chose "A + 2 line event name": Home's phone limit is 4,400 (was 4,200; page-heights.md, c13 HOME) and the
  Champion's event name is one size down on phone (24) so the long real name takes 2 lines. Option B's smaller six art and the
  underdog beside its text were not taken (the underdog left an empty strip). Home now: 320 4,701 (assumed limit 4,600: the name
  still takes 3 lines that narrow), 390 4,268 / 4,400, 820 3,410 / 3,500, 1440 2,483 / 2,700; no overlaps 320-2560.
- 2:52 PM (commit time; piece 4 itself was published after the 2:43 commit): Home piece 4 published (Preview v76, 394 files). Piece 5 built: More on Home, the site's fold (as Things to Know),
  closed by default and remembered; today's four parts and words: pairs, What changed this week, Winning cores, Your battles,
  source line. Shared data: homeTrendData, homePairs, logStats moved to 05-home-data.js; today's Home identical with all folds
  open and history loaded (What changed: 2,059 characters in both; only the sun animation's start time differs). The test
  caught a missed variable (h) in today's homeTrends during the move; fixed before anything shipped. Preview data now carries
  meta/history. Click test 6/6. Heights with the fold closed: 390 4,394 / 4,400; 820 3,517 / 3,500 (17 over); 1440 2,589.
- 2:52 PM (commit time): My Box icon toggles (Sim's request): pressed inside My Box it goes back to the screen you came from (its address);
  opened directly, back to My Team. Both engines: Home -> Box -> Home, My Team -> Box -> My Team, direct -> My Team.
- PC report "underdog stage empty in WebKit capture": the picture loads lazily; before scrolling 0 px, after scrolling 384 px.
  A capture effect, not a page bug.
- 2:59 PM (commit time), Sim's answers on the PC's phone-length suggestions: 1) the two sixes stay as they are; 2) yes: "This week" is a third
  position of the Top of the Meta switch where the columns stack (under 900 px: phone and iPad; calendar icon), replacing the
  separate list there; desktop keeps two positions and its own column (a saved "This week" shows Top rated there); 3) yes: tools
  by name only on phone (two even columns; descriptions from 700 px up). This reverses the Nov 11 "descriptions back on phone"
  decision, by Sim's choice today; 4) yes: phone section spacing 24 instead of 32. Measured: 390 4,394 -> 3,723; 820 3,517 ->
  3,058; 1440 2,589 (unchanged); 320 4,023. Switch click test both engines: phone 3 positions, This week 5 movers and tap opens
  the info sheet, remembered after reload; desktop falls back correctly (2 positions, Top rated, 7-row column).
- 3:01 PM (commit time): Sim chose the headline "The Meta, right now." (was "Top of the Meta."; it covers Top rated, Hidden gems and This week)
  and approved the phone changes. One line at 390 and up, two lines at 320 (320 page 4,053 / 4,600 assumed). Publishing Home
  pieces 5 and 6 (the fold, the phone and iPad changes), the headline and the My Box toggle to the Preview together.
- 3:09 PM (commit time): built the last three Home items today's site has, as a PROPOSAL (pictures to Sim, not on the Preview):
  the welcome card on a first visit (today's rules and saved key cc2.welcomed; words updated to the Nov 9 word list: "Read your
  Strength Score" instead of "Read your scouting report"; buttons Copy a Top Team + Got It, since the hero above already has the
  start buttons: one main button per screen, nothing twice); What's New after an update (today's rules and keys; WHATS_NEW moved
  unchanged to 05-home-data.js; today's What's New and welcome card output identical before/after, 2,072 characters); the
  weather word on Your six ("Your six · Sun Tailwind (sample) · Sun team", today's wxKeyOf/wxName, HOME-16).
  Open for Sim: today's WHATS_NEW text uses old words ("scouting report", "ready for", "win odds"); propose a new entry for the
  switch to the new design, words to approve then. First visit makes desktop Home 2,878 (limit 2,700; returning 2,589).
- The fold's top gap and rule are now variables (--fold-mt / --fold-bt in sugs.css) because the v2 CSS layers let the fold's
  layer win over Home's; only What's New uses them (More on Home keeps its approved gap).
- 3:12 PM (commit time), Sim: welcome card words and buttons approved; a fresh What's New entry for the switch is OK (draft to Sim first);
  the first-visit desktop height is allowed (c13 HOME 1440: 2,900 with the reason printed; page-heights.md updated).
- 3:17 PM (commit time): Build groundwork (look-only inventory: docs/rebuild/build-inventory.md). First step done: the Winning Cores data
  (coreUi, CORE_MIN, coreRows, coreTagCache, coreTags, corePlan, andList, coreConfirmText) moved unchanged to a new shared file
  app/src/app/47-core-data.js (both builds); today's drawing and actions (renderCores, bindCoreIn, useCore) stay in 48-cores.js.
  Proof on today's site, before vs after: 38/38 identical (rows, tags, plan, replace prompt, and the drawn Cores list for every
  kind x sort x filter, 46-93 thousand characters each). A first proof run compared empty views (wrong element); caught, redone.
  Home's tests are being wired to the new page by a helper in its own worktree (look-only test work; merge after review).
- 3:20 PM: Sim: times must ALWAYS be correct. From now on every time comes from the clock: docs/rebuild/log-decision.sh stamps decision entries itself, and CLAUDE.md now says so. Earlier today's wrong entry times were each corrected when found (2:55/3:05 -> 2:20-2:26; 2:50 -> 2:42; 3:10/3:15 -> 2:47/2:51; 3:25 -> 3:17; draft headers 3:20 -> 3:13 and 3:15, 3:25 -> 3:19).
- 3:20 PM: Checked every afternoon entry's time against its git commit time (TZ=America/New_York git log). 16 estimated (~) times replaced with the commit times; the largest errors were the mock-up screenshot fix (written 2:30, committed 2:01) and Home piece 4 (written 2:30, committed 2:37).
- 3:45 PM: Sim's PC sweep (tree 1d9f098), fixes made: sample note keeps 'Build your own · Import a team' together (nowrap); footer 'fan-made' no longer breaks (non-breaking hyphen); empty team reads 'Your six' (was 'Your six · Your six goes here'); welcome card two columns on iPad (first-visit iPad 3,512 -> 3,436 / 3,500) and its button no longer stretched; info sheet tabs: Home/End keys (PKMN-04 now passes); info sheet Typical set shows how often the ability is run, as today's sheet does (PKMN-06's remaining difference is only the heading's capital S); c13-check and v2-use now feed the same 13 data docs as the behaviour harness (v2-use 32 ok, 0 FAIL). Checked, not bugs: '94S tier rating' has a 4 px gap on phone and desktop (measured; the text joins only when read out); a 7-Pokémon import silently keeps 6 on BOTH sites (shared importPaste): question for Sim.
- 3:50 PM: Sim said yes to both: (1) a paste with more than six Pokémon now says 'Only 6 fit: left out X, Y' (shared importPaste, so today's site too; IO-01..04 pass on both builds); (2) Home's Most used numbers read '% of ladder teams' (they are the Showdown ladder; the info sheet's share is tournament teams). No overlaps 320-2560. Going through the sweep's look changes next, in order, with pictures.
- 3:54 PM: Sweep look changes built (Sim: 'sounds good'), NOT on the Preview yet, pictures sent: duel heading lines level at the top; '#18' kept with the event name; form letters never alone on a line ('Charizard Y' together, both helpers); This week rows have the small picture; Build Around It is outlined (one filled main button per screen on desktop; Title Case like the other buttons); night switch: picked position tinted night blue with blue words (all switches site-wide at night); Hidden gems holds Top rated's height (desktop 0 px jump; phone 0 at 320 and 390) with the line 'Only 2 Pokémon count as a hidden gem right now...' in the space. Heights: 390 4,297 / 4,400; 820 3,436 / 3,500; 1440 2,878 / 2,900 first visit; no overlaps 320-2560. Question for Sim: the held Hidden gems space leaves an empty area on desktop.
- 4:02 PM: Sim extended authority to 6 PM Eastern (asked at 3:58 PM); summary reminder moved to 5:40 PM. Helper's Home test hookup merged (adapter + approved-word branches; only test files): new build HOME-01..16 + PKMN-01..07: 11 pass, 12 FAIL, 1 known (was 1 pass); today's site 23 pass, 0 FAIL, 1 known (unchanged). Its comments' estimated decision times removed (cite the decision by name). Missing on the new Home, found by the tests: This-week row label without the rating, no sample note on Home, no 'All cores ›' link, 'Add Your Six' goes to Build (today: My Team), paste box label.
- 5:12 PM: Sim's rules written into RULES.md section 00 and CLAUDE.md: her questions first, none unanswered; WORKING/STOPPED in every message, never end a turn with work left under authority; nothing claimed before it's real; every check shows command + exact result + meaning; mistakes reported at once. Authority continues to 6 PM (Sim).
- 5:19 PM: Five Home gaps fixed (found by Home's tests): 'All cores ›' in More on Home; today's sample note under Your six (with Build your own · Import a team, 44px tap areas); 'Add Your Six' opens My Team (today's); This week rows read out the shown rating (matches the info sheet; HOME-05b fixed on the new build); paste box label 'Paste a Showdown team to import'. Checks: c13 home 390 4,345/4,400, 820 3,436/3,500, 1440 2,893/2,900, tap<44 0 everywhere, both engines; overlaps none 320-2560; Home tests new build 15 pass, 9 FAIL (pages not built + info-sheet wording) [corrected: first written as 8 FAIL before the full run; measured 5:21 PM: "behaviour: 15 pass, 9 FAIL, 0 known bugs"], today's 23 pass 0 FAIL. HOME-11 got the approved 'Paste a Team' branch (as HOME-07).
- 5:23 PM: Info sheet: today's 'Build around it' and 'Popular sets' are back (PKMN-03 gap), as outlined buttons 'Build Around It' / 'Popular Sets' under the add line; Build Around It sets ui.abLock and opens Build, Popular Sets remembers the Pokémon (ui.setMon, cc2.setMon, today's keys) and opens Meta; both close the sheet. Click test desktop + phone: 6 ok, 0 page errors; buttons 156x44 and 141x44. A first version laid the row out as a block (buttons overlapped by 9 px); fixed to a flex row before anything was sent. Pictures to Sim; not on the Preview.
- 5:26 PM: Sim extended executive authority to 7:00 PM Eastern, normal guidelines (RULES.md incl. section 00). Summary reminder moved to 6:40 PM. Plan: finish the background test run; start Build piece 1 (title + options strip), pictures to Sim before any Preview.
- 5:31 PM: Build piece 1 built (app/src/v2/pages/build.js, from the approved mock-up): head ('Build me a team.', the line, How it works as a sheet with today's three points, 'Matchups' for 'Ready for the top threats'), options strip: Build from My Box N / Whole roster (ui.abSrc, saved cc2.absrc, today's rule), Megas on team 0/1/2 (shared megaGoal), Build around a Pokémon (name box: type, Enter picks, × clears, no match says so; ui.abLock), Build Me a Team / Build Around X button (shared engine). Click test 11/11 ok, 0 page errors; c13 build tap<44 0, errors 0, both engines. The answer card (piece 2) is next, so the page is empty below the options for now. Pictures to Sim; not on the Preview.
- 5:36 PM: Build piece 2 built (the answer card, from the approved mock-up): Option N of M · Proven team / Fresh take, the archetype title, Strength Score from CH.gradeOf (same call as My Team) with band word and 'Top N% of tournament teams', plan chips, the six on one floor with item, role and tier, the team's own light behind them (day .11 / night .22, as the mock), four reasons (Matchups with an answer, Team checks the 4 basics + notes, this exact six at events, best core), Use This Team / Save / Copy for Showdown with today's rules (Undo, 10 max, Already saved). Shared engine fix in 22-auto-build.js: the Fresh-take redraw read today's 'view' (threw 'view is not defined' on the new build); now today's page keeps its exact path and the new build redraws (today's behaviour unchanged: same code when view exists). Click test: 6/6 ok, 0 page errors; c13 build clean at every size, both engines. Not built yet: Try another / the other options list, the score breakdown line, 'Sets and roles ›'. Pictures to Sim; not on the Preview.
- 5:39 PM: Today's site with the 22-auto-build.js redraw change: built into a scratch copy (the background run uses app/dist), the change confirmed in the built page (minified: typeof view!=="undefined"){if(view==="auto")renderAutoBuild()}else if(typeof V2...); B-build AUTO-01..16 on it: "behaviour: 16 pass, 0 FAIL, 0 known bugs". A first search for the line found 0 (quote marks differ after minifying); checked again before claiming.
- 5:45 PM: Back button (Sim asked, 5:42 PM): built in the new site's top bar (shell.js), tested in Chromium and WebKit (Home > Build scrolled 900 > My Team > sheet; Back x3 returned to #build y=900 then #home y=0, button hidden at start and end, 0 page errors). Placement A (arrow first in top bar) vs B (text line) sent to Sim as pictures; NOT on the Preview until she says yes.
- 5:52 PM: Back button fixes: class renamed np-goback (np-back already named the pages' '← My Team' links, which made the arrow blue and ignored its margins); arrow kept PLOT blue on purpose to match those links; top bar tightened under 360 wide (was cut off at 320). Build piece 3 'Show more' tap area fixed. Checks: back-test both engines Back x3 to #build y=900 then #home y=0, 0 page errors; c13 build,home cut off 0, tap<44 0, hidden-focusable 0 on all 14 runs; Home 320 4,743 over the assumed 4,600 (cause not yet checked).
- 5:55 PM: Build piece 3 checked: click test both engines (Show this one switches the answer; Trios 1,109; Show more 7 to 22 rows; Add core goes to My Team with today's toast and Undo; 0 page errors); c13 build clean (cut off 0, tap<44 0). Fixed: options sub-line said 'Proven teams first, best score first' but the real order puts the Fresh take 2nd, now 'Tap one to see it in full above.'; phone: name/score collided, core rows shortened. Pictures sent to Sim; not on the Preview.
- 5:59 PM: Sim extended executive authority to 7:30 PM (normal guidelines); confirmed at 5:59 PM. Summary reminder moved to 7:10 PM.
- 6:00 PM: Build: 'Start from a recent winner' added under Other options (today's three picks and four actions: Load with second tap, Copy, Practice Against, Compare; Sets shown in the fold). Click test both engines, 0 page errors; c13 build 7 runs clean. Rows one line like the mock (fold styles live in the later sugs layer, so the row rule moved there).
- 6:02 PM: New-site A-team run (5:39 PM build): 121 pass, 16 FAIL, 5 known. Sorted: HOME-06, TEAM-19 = adapter had no name for the new Build page (added build:'auto'; rerun 2 pass). Battle not rebuilt: HOME-08/10/15, SUG-08, LOG-02, X-13. Other unbuilt pages: TEAM-04, EDIT-09, CMP-03, PKMN-05/07. Wording waiting on Sim: PKMN-02/06. PKMN-03 = 'Add to My Team' closes the sheet and goes to My Team (today stays open, 'On your team'): question for Sim. Correction: I told Sim Add to Team was missing from the sheet; it is not (team.js V2.addBtn). Today's site full run: 132 pass, 0 FAIL.
- 6:05 PM: Build answer: score breakdown line under the rank (mock line 194; CH.whyData, the same numbers as My Team; zero written ±0 like My Team) + 'Why this score? ›' opening My Team's sheet. Both engines 0 page errors; c13 build 7/7 clean. Helper agent started on the new-site Build test adapter (v2.B-build.mjs only): today's 29 AUTO/CORES tests stopped at 'not in v2 yet: Build page' because no adapter exists.
- 6:09 PM: Truthfulness fix on Build: proven options with a swapped Pokemon were labelled 'This exact six at events' (my wording, wrong). Now 'Proven team, 1 swap' and 'Their six at events, 1 swap ... with X in place of Y' (today's site says PROVEN · 1 SWAP). Shared engine 22-auto-build.js: proven gets theirs/ours names (stored only). Proof: today's page diff = only that statement; today's B-build AUTO on it: 16 pass, 0 FAIL. Also found my first same-output proof was invalid (scratch copy had a stale source); redone from the commit.
- 6:13 PM: Build phone jump bar (mock R2, under 700 wide): sticky under the 60px top bar; buttons that scroll (a #section link would change the page and add a Back step); tab lit by scroll position. My decision: tabs in page order (Other options, Recent winners, Cores) where the mock had Cores 2nd, since tabs out of page order are harder to follow; shown to Sim in a picture. Checks: both engines taps land each section under the bar, 0 page errors; c13 build 7/7 clean (first try had the bar 16px past both edges, fixed).
- 6:18 PM: Helper agent wrote adapters/v2.B-build.mjs (today's 29 AUTO/CORES tests on the new Build): 4 pass, 25 FAIL, most wording by design or not built yet. Two real bugs it found, checked by me in code and fixed: (1) Build ignored the engine's small-box result (res.short): now today's three no-result notes; (2) Megas on team didn't rebuild Build's results (sugs.js sgmega): now rebuilds on Build, clears elsewhere, as today's 34-events.js. Added the cores 'With a Pokémon…' filter (today's CORES-04/12) and wired the adapter to it. Now 7 pass, 22 FAIL on Build; c13 build 7/7 clean; A-team sanity 4 pass, 0 FAIL.
- 6:20 PM: Build cores: full-team rows get today's Practice Against (sets the Battle opponent, toast 'Loaded as your opponent'; also clears the old opponent's name label, which today's leaves) and Copy for Showdown (today's core paste). CORES-11 passes; CORES-10 stops at Battle not rebuilt. c13 build checked.
- 6:21 PM: Build answer: today's Fresh take line restored on the Fresh take option (22-auto-build.js words). AUTO-09 passes. Noted for Sim: 4 chips wrap leaving '2 Mega options' alone; 'Bottom 33%' wording under a 78 is the shared score text.
- 6:23 PM: Home's cores (cards and 'All cores ›') now open Build at the cores (today's menu entry did, CORES-13); sections clear the sticky top bar when jumped to (desktop 96px). Measured both engines: cores land at 96 (desktop) / 116 (phone), Back returns to Home, 0 page errors. CORES-13 itself tests a menu the new site doesn't have: on Sim's list.
- 6:25 PM: Bug of mine fixed: Build cores showed the raw win rate under Top rated, so rows looked out of order (56.5, 56.1, 57.1...). Today's site shows the pulled rate it ranks by under Top rated and the raw rate under Most used; now the same (Top rated reads 54.8, 54.8, 54.8, 54.5, 54.4; the mock shows 54.8% +3.8). Correction: I told Sim at 5:55 PM that today's site also showed the raw rate; it doesn't. Hover titles: raw rate and % of all tournament teams, as today.
- 6:28 PM: Cores explanation: today's '?' text moved into the shared cores file (coreWhyText); proof: today's page diff = the move only, today's 13 CORES tests pass 13/0. New Build: 'How cores are ranked ›' after the intro opens the same text in a small sheet (both engines, 0 errors); intro says 'used it' like today (CORES-03 passes). c13 build 7/7 clean.
- 6:30 PM: Build: one option shows only its kind, no 'Option 1 of 1' (today hides the count; AUTO-12). Adapter reads a missing count as 1 of 1. Build tests AUTO-08/09/10/11/12: 3 pass, 2 FAIL (wording by design, unchanged); c13 build checked.
- 6:31 PM: Build six: today's per-Pokemon 'To catch' and 'Off-meta' marks restored (the rest of today's Sets and roles fold is already on each tile: item, role, tier); the mark line is reserved on all six when any has one so names stay level (first try lifted the marked one). 'In your box' left out (the to-catch total says it). c13 build checked; picture to Sim.
- 6:36 PM: Polish check on Build (TARGET=v2 VIEWS=build): spill 1, lone 5, tap 2, lineh 1 -> fixed: core-row small text line height 1.5 (was 1.4); at 320 'Build around a Pokémon' and its hint were cut: Megas and Build around now stack below 360 wide; filter box takes its own row. After: lone 5, tap 2, 0 page errors. Left, by design or check gaps: bd-opts 3+1 at desktop = Go aligned to the bottom (one row, measured); core row 2+1+1 on phone by design; footer 2+1 at 320 site-wide; tap 20px = polish check ignores the ::before tap area that c13 counts (c13 tap<44 0).
- 6:38 PM: Back button across every page (experiments/back-check.cjs, new): Home > Build > My Team > My Box > Meta > Battle > Home, then Back x6: each press lands on the previous page at its scroll, button hidden at the start; 4/4 runs right (Chromium + WebKit, 390 + 1440), 0 page errors. Still not checked: inside the Claude app on Sim's iPhone.
- 6:39 PM: Back button inside a frame (as on the Claude page; local file, not the Claude app): Home > Build > My Team > Meta, Back x3 returns Team y200 > Build y200 > Home y300, hidden at the start, outer page never moved; Chromium and WebKit, 0 errors.
- 6:44 PM: Final runs on the 6:28 PM new build: Build AUTO/CORES 10 pass, 19 FAIL (from 0, then 7); My Team/Home A-team 123 pass, 14 FAIL, 4 known, 1 fixed? (was 121/16 at 5:39 PM). The 14 = the sorted list (Battle / How We Calculate / Popular Sets / Winning Teams not rebuilt; PKMN wording and PKMN-03 waiting on Sim). The 'fixed?' is HOME-11b: My Team's 'Build your own' now opens the real Build page (it pointed at My Team before Build existed); its known-bug mark can come off after a check.
- 6:50 PM: GitHub push checks run locally after tonight's shared-logic changes: 13/13 that could run pass (app/test/run ALL PASSED, v2-guard clean, replays ok, suggest-gaps + suggest-audit passed, build-logic, lead-logic, sync-logic, typing-sync, sync-quiet ALL PASSED, golden 10/10, same-grade ALL PASSED, v2-words 0). speed/calc/legality/threat/fields not run: @smogon/calc not installed here (GitHub installs it); install + rerun in progress. Temporary check pages added to .gitignore (not app/probe.html, a kept file).
- 6:50 PM: After installing the calculator packages (as GitHub does): speed-check, calc-check (exact or explained 99.99%), legality-check, threat-check (PASS) all pass. fields-audit NOT run: it needs Pokemon Showdown (Sim's PC path or GitHub's setup build), not on this machine; it tests weather/terrain, untouched tonight. Totals: 17 of the 18 push checks pass, 1 not run.
- 6:51 PM: Sim's answers (on her phone): 1 Back on the Preview yes; 2 option A (arrow top left); 3 PLOT blue; 4 show both (shift vs fixed spot) in screenshots; 5 Build on the Preview yes; 6 Build Me a Team as the yellow main button before the first build yes; 7 Claude's recommendation (tabs in page order); 8 fix the lone chip yes (pictures first); 9 leave 'Bottom 33%' for the Strength Score review; 10 drop the Mega tag when the name says Mega; 11 show both (shortened names vs alternative); 12 left column longer is okay; 13 Home 'All cores' is enough; 14 'Load Team' yes; 15 sheet stays open with 'On your team' yes; 16 mock-up words win, update tests; 17 Claude's recommendation (Hidden gems fixed height); 18 Home pictured items on the Preview yes; 19 What's New draft okay; 20 NOT raising the 320 limit: 'we keep adding stuff instead of being innovative with how we lay stuff out': give layout options as mock-up screenshots.
- 6:54 PM: Done (Sim's decisions 6, 10, 14, 15): Build Me a Team is the yellow main button until the first build; cores drop the 'Mega' tag; full-team cores say 'Load Team'; Add to My Team from a sheet keeps the sheet open with 'On your team ✓' and toast 'X added to your team' (you stay on the page). Measured both engines, 0 errors; c13 build+home, back-check 4/4.
- 6:55 PM: Preview v79 published (Sim's yes: 1, 5, 18): Back button, the Build page, Home's approved items, decisions 6/10/14/15. File list checked: 394 files incl. v2art sprites.
- 6:58 PM: Decision 20 (Home at 320, Sim: layout, not more height): measured sections at 320: duel 1,221, meta 1,145 (underdog card 501), hero 819, welcome 619 (first visit), tools 454. Mock-up A sent: the duel's two sixes as one switch (Champion's six | Your six) on phone: duel 1,221 -> 676/785, page 4,743 -> 4,199/4,308, nothing removed. Idea B (compact underdog) next. Also seen: 'Copy for Showdown' touches its button edges at 320 (to fix).
- 6:58 PM: Decision 20 idea B mock-up (compact underdog at 320): 501 -> 337, page 4,579, but text cramped and button text hits its edges; not recommended. Recommendation to Sim: A (duel switch on phone) alone.
- 7:00 PM: Home duel at 320: 'Copy for Showdown' needed 142px in a 132px half-row (measured); below 360 the two buttons take a row each (286px). 360+ unchanged. Costs about 56px at 320 until Sim's decision 20 layout. Not on the Preview yet (picture to Sim).
- 7:03 PM: Decision 16 done for the sheet hero and Meta words: PKMN-02/06 get new-site branches with the approved sheet mock-up's words (today's site still passes its own: 4 pass, 0 FAIL). PKMN-02 passes on the new build. PKMN-06 now stops at 'Brought with': the Preview build has the partners data (RES.tc.bw, 123 Pokemon), the plain new build used by tests has no RES.tc: OPEN, not yet checked whether it's only the test copy or a real gap at the switch. MISTAKE: my 6:47 PM 'npm install --no-save' for the calculator packages removed the playwright link from node_modules (tests could not start); restored by linking the machine's pre-installed Playwright 1.63.0 (/opt/node-tools), build and tests run again.
- 7:04 PM: PKMN-03 new-site branch ('Add to My Team', word list): on the new build the add, 'On your team' and toast now pass; it stops at Popular Sets (Meta page not rebuilt). Today's site 1 pass, 0 FAIL.
- 7:04 PM: Partners ('Brought with') open item narrowed: build.mjs lines 41-45: the live site reads its own daily data and the Preview build gets a copy (it has RES.tc.bw); the plain build used by tests gets data only from the test fixture. Most likely the v2 test path doesn't supply the partners data: NOT yet checked which fixture file; next step.
- 7:05 PM: Correction: my 'RES.tc missing' check opened the plain build without the test harness, so it says nothing about the tests. The fixture does carry the partners data (limitless.json.gz has 'bw'). Still true: in the real PKMN-06 run on the new build, 'Brought with' doesn't show. Next: compare how the harness hands limitless data to the new site with build.mjs --preview-data (which works on the Preview).
- 7:06 PM: Partners item CLOSED, and a correction: the new sheet does show partners ('Brought with Sneasler 66% · 2,884 games'); the test only tripped on the middle dot. My earlier statements that the plain new build lacked the partners data were wrong. PKMN-06 new-site branch allows the dot: new build PKMN-02 + PKMN-06 2 pass, 0 FAIL (partner sheet opens); today's PKMN-06 1 pass, 0 FAIL.
- 7:07 PM: HOME-11b: the 'Build your own' known-bug mark now applies to today's site only (it still points at My Team there); on the new site the link opens the real Build page: new build 1 pass, today 1 known (unchanged).
- 7:08 PM: Decision 8 put in code (option b, the only one that fit): the Mega count moves into the answer's eyebrow ('Option 1 of 4 · Proven team · 2 Mega options'); chips keep one size and never leave one alone. Not on the Preview until Sim OKs the picture. c13 build checked.
- 7:13 PM: Sim's answers: 4 B (Back keeps a fixed spot, nothing moves); 8 yes (Mega count in the eyebrow); 11 three across (Other options names on phone); 20 A (the duel as one switch on phone); duel buttons yes. Sim: she sees 'stuff clearly falling out of its boxes'; ensure formatting and polish before it goes on the Preview.
- 7:15 PM: Sim extended executive authority to 9:00 PM (normal guidelines); confirmed 7:15 PM. New permanent rule (RULES.md 00b, CLAUDE.md): every design question carries its pictures in the same message right next to it; reach Sim by phone notification while she's away.
- 7:18 PM: Done in code (Sim's answers 4 B, 11, 20 A): Back keeps its spot (hidden = invisible, not removed; top bar tightening under 360 always on); Other options three across on phone; Home duel as one switch on phone (Champion's six | Your six, remembered, iPad/desktop unchanged). Measured: duel test both engines 0 errors; Home 320 4,743 -> 4,211 (Champion) / 4,264 (yours), within 4,600; back-check 4/4. Home 1440 2,910 vs 2,900: was 2,916 before these changes (Meta grew 16px with today's data), for Sim. Polish sweep of all pages running before the Preview.
- 7:22 PM: Sim clicked 'Create PR' by accident: theresearchmode-glitch/pokelair-data#3 (claude/design6 -> main) was open, not merged; closed it (reversible). Main and live never touched.
- 7:23 PM: Polish sweep, all 7 new-site pages (TARGET=v2): spill 41, uneven 2, lone 24, tap 7, lineh 1, glow 3, page errors 0. Judged: 36 spills = the info sheet's scrolling content (overflow-y auto; nothing out sideways; checked in a picture); tap 7 = links on the ::before tap-area list (c13 counts them); lone/uneven/glow/lineh small, listed for Sim. Real: tile names: Home 'Basculegion' 3px out at 320 (measured) -> narrow width at <360 and 700-759 + never out of the tile; My Box name safety net (trim). After: all Home names inside their tiles at 320/720 (measured). The polish check still reports +6 / +12 with its 0.8 s timing; direct measurement after fonts load disagrees (Box Meowscarada fits by 6px at 400): gap in the check, noted, not hidden.
- 7:28 PM: Preview v80 published (394 files checked): Sim's 4 B, 8, 11, 20 A, duel buttons at 320, tile-name polish. c13 all six pages 42 runs: only Home 1440 2,910 vs 2,900 over (today's data; question to Sim with picture). back-check 4/4, duel switch 0 errors.
- 7:30 PM: Polish: Home tool names use the narrow width under 360 (How We Calculate wrapped at 320); measured all 12 on one line at 320/360/390; c13 home checked. Waits for the next Preview batch.
- 7:35 PM: Battle step 1: turnOneData moved into shared app/src/app/40-turn-one-data.js (today's 40-turn-one.js keeps only the drawing; parts.json lists the data file just before it, parts-v2.json after 39-damage-calc-speed.js). Proof: today's page byte-identical (cmp; before built from the commit); same-battle.mjs 170 states 170 identical, 0 different; today's BATTLE tests 19 pass, 0 FAIL; new site now has 46 shared logic files, turnOneData once. Sim offered her PC: brief given for fields-audit.mjs (needs Showdown at her path).
- 7:37 PM: Sim's PC ran experiments/fields-audit.mjs on claude/design6 at 76e89b6: exit 0, 'PASS: every VGC-relevant field is in the data and used by the engine', no setup fixes. All 18 GitHub push checks now pass on tonight's work (17 here, this one on Sim's PC).
- 7:41 PM: Battle step 2: bmUi, bmHit, bmSpeed, BM_IMMUNE, BM_WEATHER, bmWatch, battlePlan moved into shared app/src/app/46-battle-data.js (today's 47-battle-mode.js keeps renderBattle + taps). Proof: today's page byte-identical (cmp, before from the commit); same-battle.mjs 170/170 identical; today's BATTLE 19 pass, 0 FAIL. New site (47 shared logic files): all 19 plan helpers present, battlePlan on my team vs the Champion: bring 4, turn one yes, 10 speed rows, 0 page errors.
- 7:43 PM: Battle step 3: teamRecord (the team's own logged record) moved from 26-battle-log.js into shared 26-log-data.js. Today's page: only a kept comment moved (code identical); today's LOG tests 7/0 before and after. The new site now has teamRecord once: its My Team, which already asked for it (08-render-all), can show a logged team's own record like today's site (was silently null). logGame (shared 'add a game') already exists.
- 7:45 PM: Battle step 4 (Test run): gauntCache, gauntletTeams, gauntletScore, gauntletPrep moved into shared app/src/app/38-gauntlet-data.js (today's 38-gauntlet.js keeps renderGauntlet + taps). Proof: today's page byte-identical; every split file parses alone (node --check, steps 1-4); today's TEST tests 9 pass, 0 FAIL.
- 7:46 PM: Battle step 5 (Practice): prBase, prSame, pr, prScore, prScoreSave, prKnown, prPickRandom, prStart, prTarget, prReveal, prN, prPc, prDay moved into shared app/src/app/63-practice-data.js (checked: no page drawing or element access in those lines). Proof: today's page byte-identical; both files parse alone; today's PRAC + BATTLE-05/17 tests 6 pass, 0 FAIL.
- 7:47 PM: Battle step 6 (Track): TR_CUT, TR_BANDS, TR_MIN, trPct, trAdd, trWeek, trRates moved into shared app/src/app/64-track-data.js (after 13-rating in both lists). Proof: today's page byte-identical; both files parse; today's TRACK tests 6 pass, 0 FAIL.
- 7:49 PM: Sim (desktop app): on Build, each of the six (and Other options' tiles) now opens that Pokemon's info sheet: tiles became buttons with data-v2mon, like Home's. Measured Chromium + WebKit, 1440 + 390: Kingambit and Salamence sheets open, 0 errors; look unchanged; c13 build checked.
- 7:50 PM: My Box split scrolling (Sim, desktop app): measured at 1440x900: page 1,251; the right panel .bx-sum is sticky (pinned at 100px) but 906px tall, more than the ~800 it can show, so the sides scroll in turns. Options sent with pictures: 1 unpin (recommended), 2 shrink the panel to fit (794), 3 no scrolling at all (~350px off; not recommended). Waiting on Sim.
- 7:53 PM: Sim chose My Box option 1: unpin the right panel (the whole page scrolls as one). Forward button built and tested (Back x3 / Forward x3 return to the same pages and scroll, hides at the end and after a new step, sheet leftover step skipped in the travel direction; Chromium + WebKit, 1440 + 390, 0 errors); pictures to Sim before the Preview.
- 8:02 PM: Forward fits every width: top bar measured at 69 widths 320-1000 (every 10px): nothing past the edge, no overlapping tap areas (fixed: 700-719 ran 7-17px over, 320 10px over, 320-350 Forward overlapped the logo by 8px: tighter spacing 700-759, logo 26/22/20px on narrow phones). forward-check 4/4, back-check 4/4. My Box unpinned: all three columns move together (measured both engines). Pictures of Forward to Sim; nothing on the Preview until her yes.
- 8:16 PM: Sim: Forward looks great, make Back and Forward evenly spaced from the logo. Measured before: phones uneven (Back 23 / Forward 15px; 320-340 23/19). Now Back and Forward the same distance at all 14 widths checked 320-1920 (15px phones, 27px desktop); fit 69 widths no problems; forward-check 4/4, back-check 4/4; c13 home/build/box/team 28 runs clean except Home 1440 2,910 (waiting on Sim). Publishing with Build tappable tiles, My Box one-page scroll, Home tool names.
- 8:16 PM: Preview v81 published (394 files checked): Forward button with even spacing, Build's Pokemon open their info, My Box scrolls as one page, Home tool names on one line at 320.
- 8:19 PM: Sim: Home first-visit desktop limit 2,950 (was 2,900; Home is 2,910 with today's data). c13-check.mjs and page-heights.md updated.
- 8:21 PM: Battle step 7 (Types): the type maths lifted out of today's renderTypes into shared app/src/app/20-types-data.js (typeGroups, typeOffence); renderTypes now calls them. Proof: 291 Types screens (all 171 one/two-type sets + 120 Pokemon with Abilities, 10 with an Ability note) identical in both builds (experiments/same-types.cjs, new); today's TYPES tests 5 pass, 0 FAIL; both files parse; new site has both functions.
- 8:21 PM: New rule (Sim): if she replies but skips one of Claude's questions, raise it again in the next message with its pictures again; keep a 'still waiting on you' list until each is answered (RULES.md 00b, CLAUDE.md).
- 8:23 PM: Sim gave executive control until 6:00 AM Eastern Fri Nov 13 (normal guidelines; she may not respond; design decisions wait for her, pictures queued per rule 00b). Confirmed 8:22 PM. Reminders: summary 5:40 AM, STOPPED 6:00 AM, hourly backstop (trig_01P8wwfASshsPdbcFcM3qNMv, delete after 6 AM). Overnight plan: Battle page piece by piece in code (checked, pictured, not on the Preview), then the v2 C-battle adapter.
- 8:34 PM: Battle piece 1 built (app/src/v2/pages/battle.js, from the approved mock-up): head (Bring these four / Lead the pair, verdict from real games), their six (likely leads, their real items), your six as Lead / Back / Leave home, turn one in move order (today's words: field via fieldWords, Watch + Consider Protect), their-six sheet (6 name boxes + top 10 tournament teams). Bugs found and fixed while building: field printed as [object Object]; ui.oppFrom.who held the display label instead of the player, so their real team sheet was never found (now 6/6 real sets with items). Checks: both engines 1440/390 0 errors; c13 battle filled (new default state) + empty, all clean; Clear and footer About tap sizes fixed (site-wide footer min 44px); polish battle: footer lone at 320 only. Sim on the picture: 'this page is GORGEOUS. WOW WOW WOW' = yes for piece 1 on the Preview.
- 8:34 PM: Preview v82 published (394 files checked): Battle piece 1.
- 8:36 PM: Sim removed the 'never red' rule ('my rule of never red is stupid. remove that rule'). Removed from CLAUDE.md word list and design-system.md. No colours changed on the site: any use of red (e.g. Strength Score bands, Watch out's high-danger tags) is a design choice, offered to Sim with pictures.
- 8:36 PM: Sim: 'red is fine where applicable. its a fine color.' Red allowed where it fits; any new use still shown to her with pictures first.
- 8:41 PM: Battle piece 2 checked: The read (biggest threat with its full reason, Fake Out count), From real games (today's Helps/Hurts you), Watch out (approved subline 'N of their six can shut something down'). Fixed: single-line names (no placeholder indent), threat reason in full. Red added (Sim: use red where it makes sense): tokens --bad / --bad-text (day 6.26:1, night 8.15:1 contrast) on Watch out's high-danger tags, 'Hurts you', and an Unfavoured verdict. Checks: piece 2 test 4/4 runs 0 errors; c13 battle 7 runs clean. Pictures to Sim before the Preview.
- 8:43 PM: Sim on the rules list: 2,3,5,6,7 stay; 4 dropped (round corners fine where they fit; design-system.md updated); 1 undecided (Claude recommends: keep borrowed colour as the theme, add fixed meaning colours red/green/amber for small status marks only; and a new rule 'colour must always say something'). Sim approved red as used in Battle piece 2. Mistake reported: I first wrote '8:46 PM' in design-system.md without the clock (it was 8:43) and wrote my slanted-shapes suggestion as if it were her rule; both corrected.
- 8:44 PM: Preview v83 published (394 files checked): Battle piece 2 with red (Sim approved).
- 8:44 PM: deeperThreats (their threats to your four) lifted out of today's renderMatchup into a shared function in 18-archetypes.js. Proof: experiments/same-matchup.cjs (new): 40 Deeper reads (top 20 teams x Ability on/off) identical, all 40 list real threats; today's MATCHUPS 6 pass, 0 FAIL. (A first run compared 0 because my script didn't feed today's page its data: fixed, not counted.)
- 8:46 PM: Sim approved the colour and corner rules (her words: 'this is perfect. I agree with this whole thing'): rule 1 loosened narrowly (meaning colours red/green/amber for small status marks only, borrowed colour stays the theme); round corners only in chosen spots (badges, track dots, day/night switch, tips, compact Pokémon circles), buttons/plates/chips stay slanted; rules 2,3,5,6,7 unchanged; new rule 'Colour must always say something'. Written into design-system.md rules 4 and 4b, the verdict colour notes and the corners line. Next: audit of built and unbuilt pages against these rules, pictures to Sim before any change.
- 8:53 PM: Sim chose C, blue good / red bad, for every good/bad mark on the site ('cant just have 3 different color schemes for the same system... blue good red bad'). One scheme: good = the logo blue (--good now points to --plot), bad = red (--bad), amber only for caution (Shaky, in-between warnings). Pink means only 'selected'. Applying across the built pages; pictures before the Preview.
- 8:55 PM: New rule from Sim: every recommendation comes with a short, quick reason (RULES.md 00c, CLAUDE.md). Sim also asked for all her rules in one document to read: docs/rebuild/ALL-RULES.md.
- 9:18 PM: Battle piece 3 on the Preview (v84, 394 files) with Sim's yes, plus blue good / red bad. Checks: tabs in both engines 1440/390 (Trick Room flips, Sun/Intimidate change damage, errors 0); c13 battle 0 over height after phone tabs went side by side (320: 3,895 of 3,900); polish battle before/after identical (lone 1, space 3, all shared header/footer). Found and reported: the Nov 11 Home mock-up dropped R0 decision 7 (ray panel + three stats) without asking Sim; Sim says she may prefer the current Home, so no change. Speed-line mock-ups B1/B2 sent to Sim. v2 Battle test adapter: 3 pass, 16 FAIL (to be sorted into word differences vs missing features).
- 9:30 PM: New rule from Sim (RULES.md 00b): every picture is labelled with its question number and option name printed on the picture. Q1 (Who moves first) and Q2 (320 height fix) re-sent with labelled pictures. Sim: continue the test work.
- 9:30 PM: Sim chose Q1 = B1 ('i hate the overlapping. so lets go with your recommendation'): Who moves first becomes the speed line in move order on desktop and iPad (820+), bars stay on phones; numbers on one level line, ties marked. Pictures before the Preview.
- 9:31 PM: Sim chose Q2 = A: the 'Type them as you see them...' line moves from under their six into the Their six sheet (all widths), so Battle fits 320 without raising the limit.
- 9:42 PM: Sim: Q3 yes (speed line 1024+, bars on iPad upright and phones), Q4 yes (Deeper read threat sentence names each move with the Pokémon it hits, both sites; was: only the first move). 'lets go for it'.
- 9:47 PM: Preview v85 (394 files checked): Battle speed line (1024+), restored Copy for Showdown / recent opponents / all 90 teams / sheet kicker, their-six line in the sheet, threat sentence fix. Checks: v2 Battle tests 13/0; today's 7/0; c13 battle 0 over; speed line words broken 0, spilling 0, touching 0.
- 10:15 PM: Sim chose Q5 = A: Battle log always shown (mock-up band); Battle height limits raised to 1,850 (1440) / 3,750 (390) / 4,250 (320). New rule (RULES 00b): the recommended option is marked RECOMMENDED on its picture.
- 10:20 PM: Preview v86 (394 files checked): the Battle log (Sim's Q5 = A). Checks: v2 Battle 21 pass + 3 listed as waiting for pages; today's C-battle 86/0; c13 battle 0 over (new limits); tap area of the four checked by elementFromPoint (polish check's 26px is the text box only); phone Win/Loss even halves.
- 10:24 PM: Sim chose Q6 = A (Battle tools as the mock-up: bar 700+, More ways to prep on phones; Coming next pages for unbuilt tools on the Preview); Battle limits 4,650 / 4,100 / 1,950. Rule: every option gets its own labelled picture, even 'no change' (Q6's B had no picture: my mistake).
- 10:27 PM: Sim: Battle tools names in title case without counts: Battle A Team, Team Preview Practice (Sim typed 'Team Practice Preview'; asked to confirm), Test Run, Speed Tiers, Damage Calc, Type Chart. Q6 = A confirmed.
- 10:31 PM: Sim approved the title-case rule ('your rule is perfect'): title case for anything you tap or navigate by (menus, tabs, buttons, chips, the tools bar) and section headings; sentence case for sentences (incl. headline sentences with a full stop), descriptions, notes, eyebrow lines; short joining words lowercase (a, an, the, and, or, for, of, in, on, to, at, by, vs, from, with). Audit: 70 items, ~35 to change.
- 10:39 PM: Sim agreed: Battle tabs show names only (no '24 pairs / 10 Pokémon / pair grid'), no 'Open one for the detail' hint, tools bar shows 'Battle Log' without a count. New rule (Sim): tabs, menus and navigation show names only, no counts or extra detail beside them. Sim asked for other places it applies and other clean-up suggestions: look-only sweep next.
- 10:51 PM: Sim: C1-C4 yes (names only): My Team tabs without counts (Matchups, Team Checks, Team Sheet ↗); Build My Box switch without count; Build phone jump bar without counts; My Box 'Open My Team' without '6 of 6'. Saved Teams badge kept (my recommendation, button not menu).
- 11:20 PM: Sim: permanent TOP PRIORITY rule (RULES.md 00d): the Rebuild Checklist (https://claude.ai/artifact/E99Mux9sZxxBuvFXEsKW1V) is kept current in the same message as any step change; purple 'unsure' state added at Sim's request; guide docs/rebuild/checklist.md.
- 11:24 PM: Sim going to bed: authority confirmed until 6:00 AM Eastern Fri Nov 13; wake-ups every 30 min (second backstop trig_012D8AdnvLFxfYqeBtDUoc7o at :53, with the :23 one). Overnight plan: test comparison -> title case + C1-C4 to the Preview; feature audits -> open items + prepared fixes with labelled RECOMMENDED pictures; resolve unsure items; worst-state heights; Speed Tiers mock-up; 5:40 summary, 6:00 STOPPED and delete both backstops.
- 11:27 PM: Feature audits (helpers, code-only) back: My Team + sheets 85 found / 27 partly / 3 missing / 1 unsure; Home + Build 62 / 30 / 4 / 1 (+12 not rebuilt yet). 4 findings spot-checked by me (true). Recorded as checklist open items i10-i20; step notes updated.
- 11:45 PM: Slip to report to Sim: commit 915b83e (test fixes) went out with a 'Co-Authored-By' line that names the model, against CLAUDE.md's 'No model identifiers in commits'. Rewriting pushed history was blocked (needs Sim's permission); left as is. All later commits leave that line out. Also corrected: my C1 note said the Team Checks 4/4 count moved to the section heading; it did not, the count left the tab and the section says 'All 4 basics pass' in words. Test comparison done: every result change explained (title case / C1 wording in tests: A-team 7, AUTO-14, BATTLE-11; CORES-01 now passes); all rerun passing on a fresh build and on today's page. Speed Tiers mock-up drawn with real numbers (labelled pictures, Speed Q1/Q2).
- 11:46 PM: Slip: I typed checklist times instead of reading the clock (i04 note '11:5x PM', i04/i07 timestamps that read 11:50 PM and 12:45 AM). Caught and corrected against date within minutes. Title case + C1-C4 + non-visual fixes are on the Preview (v88, 394 files). i04 done, i07 (Speed Tiers mock) waiting for Sim.
- 12:12 AM: Overnight fixes (no look change, each checked): i19 'coming next' pages for How We Calculate / Popular Sets / About & Legal / Send Feedback (0305e6b); AUTO-06 Build Around It starts building (dc5f499, proven to fail before); Build's phone jump bar tap size 44+ (252994d, pixel-identical); SUGG-06 lane line on extra-list cards (34d3585); helper's B-build adapter committed (a398e85, 13 -> 23 pass, 24 with SUGG-06). Measured: My Team over with 5 of 6 (320 4,169 / 390 4,040 / 1440 1,917) and with long names (3,944 / 3,842 / 1,863): Height Q1 for Sim with labelled pictures (A raise the 5-of-6 limit RECOMMENDED; B cap stand-outs: desktop fits, phones still over). Questions for Sim: 'Dangerous / Manageable' fallback words; 'likely their Mega this game' on both of an opponent's two Megas (today's logic too). Unsure: a 5-of-6 team's add card shows an empty left slot and no score change.
- 12:47 AM: Sim (before sleep): when there's free time, a second look through every built page for quality, polish, everything running and looking right; changes / improvements / ideas ready for the morning. Plan: polish-check + c13 on all built pages (light and dark, odd widths), my own eyes on every flag, a look at each sheet; plain bugs fixed and listed, look changes as labelled pictures for Sim.
- 2:07 AM: Second look (Sim's ask): Build after building fixed (text in boxes, score word, headline, 3/4 colour), form letters kept with names in shared-logic text, sheets checked clean; Preview v90 at 1:38 AM carries the first batch. Look Q1-Q3 pictures labelled; more questions listed in docs/rebuild/overnight-nov13.md.
- 5:12 AM: Sim's answers (morning): Speed Q1 A (race track desktop), Speed Q2 A (slim track phones), Height Q1 A (raise the limit for a 5-of-6 team), Look Q1 B (88 px Build sprites on phones), Look Q3 B (Battle tabs two lines each on phones), Look Q4 B (Build's jump bar becomes tabs on phones), Words Q2 B ('one of their two Megas: only one can Mega Evolve'). Sim on limits: 'we keep extending our limits'; today spend time getting creative on layouts/designs so information stays beautifully presented and on theme without pages running long or raising limits for everything. Look Q2 answer unclear ('That's fine with me'): asked again. Words Q1 and the mock-up side-by-side question unanswered: asked again.
- 5:25 AM: Sim extended executive authority until 9:00 AM Eastern, Fri Nov 13 (normal guidelines). Wake-ups and the summary/STOPPED reminders moved to match.
- 5:28 AM: Sim: Look Q2 B (Compare: both teams in plain ink, told apart by their A/B letters). Words Q1 and the mock-up side-by-side still unanswered: re-ask.
- 5:31 AM: Sim: Look Q2 B confirmed (built 9053111). Words Q1: recommended (no word when no measured level) but wants to see both options first: pictures. Side-by-side check of built pages against their approved mock-ups: yes, do it.
- 5:38 AM: Sim: Words Q1 B (no level word when a threat has no measured level; 'Dangerous / Manageable' removed on the new site).
- 5:49 AM: Regression found in the side-by-side and fixed: my Look Q3 change (3860ab0, on Preview v93) left a wider gap inside Battle's tab names on desktop ('Damage  Both Ways'). Fixed: the name halves are plain text above 519 px; phones keep two even lines.
- 6:13 AM: Title-case rule (Sim approved Nov 12) applied to two headings it missed: Build's 'Other options' -> 'Other Options', the empty-team Matchups sheet's 'Scouting report' -> 'Scouting Report' (eyebrow lines stay sentence case). Battle tests 21 pass (same as before). Build tests compared before/after on private copies (running). Also: Build Q1 (desktop tabs) and My Team Q1 (Stand-Outs at most 4+4) sent to Sim with labelled pictures; mock-ups only, no site code changed.
- 6:24 AM: Preview v95 (394 files): title-case fix for 'Other Options' / 'Scouting Report'. Build Q1 mock-up corrected: my 820 mock was broken (3 cards and 2-column Cores crushed text); wide layouts now only from 1180; 820 re-measured 2,374 / 2,394 / 2,548 (limit 3,500); 1180 checked 1,559 / 1,676 / 1,838; Cores show 8 first (+16) in option B so rows stay even. Corrected numbers and the new Cores picture sent to Sim.
- 6:35 AM: Prepared (not applied, site unchanged) ready patches for the two layout questions so a yes lands fast: docs/rebuild/proposals/build-q1b.patch (Build tabs on every size; real page 1440 1,499 / 1,596 open / 1,595; 1180 1,535 / 1,652 / 1,814; 820 2,350 / 2,370 / 2,600; 390 3,167 / 3,054 / 3,272, phones unchanged apart from 8 cores first) and docs/rebuild/proposals/myteam-q1b.patch (Stand-Outs at most 4+4 + 'N more ... in All 30 ›'; c13 five 320 4,227->4,107, 390 4,099->3,979, 820 3,334->3,236, 1440 1,917->1,829; tap<44 0 after giving the link a 44px area; a first try reused class mu-more, which already exists and hid the line: renamed mu-outmore). Behaviour tests before/after running.
- 7:06 AM: Patch tests: My Team Q1 B patch: A-team 127 pass, 11 FAIL, 4 known before and after, no test changed result. Build Q1 B patch: first B-build run invalid (tests read the Cores section on desktop without tapping its tab; later tests hit the run's time limit: 'Failed to create browser context'). Test adapter v2.B-build.mjs now taps the section's tab first (tabTo, a no-op when no tab bar shows), setup only; rerunning on the current page and the patched page.
- 7:25 AM: Build Q1 B patch tested: B-build with the tab-aware adapter: current page 25 pass (unchanged by the adapter change, test by test); patched page same results except X-10, which is flaky on BOTH pages when run alone (current 5 of 9, patched 6 of 9 passes): checklist i41, cause not yet checked. So the patch changes no test result. My Team Q1 B patch: 127 pass before and after, no test changed.
- 7:31 AM: My Box Q1 (i38) asked with labelled pictures: the headline wraps only from 1400 (280 px column vs 295 px needed). A keep (recommended) / B 300 px left column (one line, but the box goes 5 across at 1440 and the page 1,217 -> 1,339). X-10 (i41): instrumented: the failing tap's click never reaches the page; my re-draw guess not supported with real data (tile stays the same element 1.2 s); cause unknown.
- 7:33 AM: Asked with labelled pictures: My Box Q2 (i37: Build Around It in the panel; B recommended, +26 px at 1440) and First visit Q1 (i40: approved mock-up's empty spots + 'Or start from a winner'; B recommended; the sample-team button left to Sim). Slip: First visit B picture first sent without its RECOMMENDED label; resent labelled within a minute.
- 7:45 AM: Checks on the committed build (= Preview v95): v2 use test 32 ok, 0 FAIL; v2 clicks 125 controls, 0 fired twice. Checklist: i29 corrected to done (Words Q2 B built 8741d9e), i30 explained in code (matches today's site; '89 so far -> X' left to Sim), i39 waits for the Send Feedback rebuild (today's link opens the feedback form).
- 8:44 AM: Sim extended executive authority until 10:00 AM Eastern, Fri Nov 13 (normal guidelines; 'running a little behind'). Summary reminder moved to 9:40, STOPPED to 10:00.
- 8:47 AM: Sim: all recommended. Build Q1 B (tabs on every size), My Team Q1 B (Stand-Outs at most 4+4), My Team Q2 A (keep 2 columns), Battle Q1 B (no turn-one link), My Box Q1 A (keep two-line headline), My Box Q2 B (Build Around It in the panel), First visit Q1 B (mock-up's six empty spots + 'Or start from a winner'; the 'Try the sample team' button was left open, so it is asked separately). Order: Build Q1 B, My Team Q1 B, My Box Q2 B, First visit Q1 B, one at a time with checks.
- 8:50 AM: Sim extended executive authority until 5:00 PM Eastern, Fri Nov 13 (normal guidelines; she answers questions when notified). Summary reminder 4:40 PM, STOPPED 5:00 PM.
- 8:57 AM: Sim: the 316 older commits with the model line stay as they are ('not a big deal'); only make sure it never happens again: the commit-msg guard (.githooks, 68058f0) refuses any commit naming the model; every session turns it on (RULES 00t).
- 9:12 AM: Build Q1 B built (Sim chose the recommendation): tabs on every size; from 1180 Other Options 3 across (six 3x2), a winner's sets 3 across, cores 2 columns with 8 shown first (+16); narrower keeps 7 (+15) so the 320 Cores tab stays at its 3,900 limit (8 there measured 4,025); crossing 1180 while resizing redraws. Checks: picture check build+ 20 shots, 0 UNEXPECTED (phones 320-699 pixel-identical day and night; 1440 2,121 -> 1,499); Build tests 25 pass, no test changed; c13 build 0 over; polish Build same as v95.
- 9:27 AM: My Team Q1 B built (Sim chose it): Matchups Stand-Outs show at most 4 Unfavoured + 4 Favoured, with 'N more ... in All 30 ›' (44 px tap). Checks: picture check of the normal My Team (sample team has exactly 4+4) 14 shots, 0 changed; c13 five 0 over (1440 1,917 -> 1,829), tap<44 0, both engines; My Team tests 127 pass, no test changed.
- 9:39 AM: My Box Q2 B built (Sim chose it): Build Around It in the picked Pokemon's panel (and its phone sheet), as the approved mock-up; uses Home's handler. Checks: tap -> Build with the Pokemon locked and a team built at 1440/820/390/320, 0 errors; c13 box 0 over (1440 1,243), tap<44 0, both engines; 320 sheet picture; use test and clicks below.
- 9:56 AM: Sim chose First visit Q2 A: no 'Try the Sample Team' button on the empty My Team (a new visitor starts with the sample loaded; it is 'Open a saved team 1').
- 9:59 AM: First visit Q1 B checks done: My Team tests 126 + TEAM-19 = 127 pass; TEAM-19's new-site check updated to Sim's approved design (one underdog + six winner sprites, six empty spots, the winners heading): passes on the new page, FAILS on the page before (so it can tell them apart), today's page still passes. Every other test unchanged.
- 10:00 AM: i42 started (Sim's ask: re-check every built page against rules/design changes since it was built, fresh less-restrictive lens): 3 look-only helper agents on a frozen build (app/dist/v2-recheck.html = 4034a63): A Home + first visit + My Box, B My Team + sheets + Compare, C Build + Battle. They change nothing; Claude judges every finding; rule catch-ups fixed one at a time with checks, design choices to Sim with labelled pictures.
- 10:14 AM: i42 catch-up 1 (words, approved title-case rule + word list): Home 'This Week in the Ratings', 'What Changed This Week', 'Winning Cores', 'Your Battles' (+ the More on Home summary line), 'Build Your Own' (Home + My Team sample note), empty My Team 'Open a Saved Team', My Box 'Build and the suggestions pick from these' (was the old name 'Build for Me'). Tests updated to accept both cases (today's page keeps its words): HOME-05/11/11b, TEAM-19, SAVED-05 pass on the new site; HOME-10 fails as before (known gap); today's page 5 pass + 1 known. Helper A's 'Mega tag breaks the Nov 11 rule' rejected: Sim approved the tag later (A9, Nov 12 morning).
- 10:25 AM: i42 catch-up 2 (bugs found by the re-check): six Build/Battle sheets (Their Six, Your Record, The Four You Brought, Log from a Showdown Replay, How It Works, How Cores Are Ranked) had no inner padding (heading at 0 px from the edge): now the site's sheet standard (32 px; 24/16 on phones); the sheet X stays on top of scrolled content (scouting sheet at 390 was covered at 500/900 px scroll). Measured before/after: Their Six heading 0 -> 16 (390) / 32 (1440); X topmost at all 4 scroll points. Battle tests 21 pass, Build 25 (no test changed).
- 10:36 AM: i42 catch-up 3 (words): Compare's old readiness sentence via the word-list helper ('Team B has the better matchups against the top 30 threats (84% vs 81%)') and footnote ('how each team's matchups look against the top 30 threats'); title case 'Same on Both', info sheet 'Base Stats' / 'Type Matchups' / 'Speed at Level 50', Build 'Show This One ›'; cores '+1 point' (singular). Shared data untouched (today's site unchanged). Tests: CMP/PKMN same as the earlier full run (CMP-03, PKMN-03/05/07 known fails unchanged); Build CORES/AUTO no test changed; use test below.
- 10:39 AM: i42 catch-up 4 (look, approved rules): Unbounded rank numbers slanted (Home ratings, Build cores); nothing under 13px on Home ('points' 9.3 -> 13, rank moves '#25 -> #18' 10.8 -> 13, Champion line 12.5 -> 13). Checks: measured every Home text below 13px: none left; picture check: Home changed only in those rows, Build pixel-identical (390/1440 day+night); c13 home 0 over; build guard clean (it refused a max() size, fixed with a scale value).
- 10:40 AM: Sim confirmed First visit Q2 A on its picture ('this is good to go'): built as shown (v98); the link now reads 'Open a Saved Team' (title-case catch-up).
- 10:52 AM: Sim asked to note for the Meta rebuild: a ranking list of the top Megas beside the regular ranking. Added docs/rebuild/meta-notes.md (new file for Meta notes) with her words, what exists today (a 'Megas' filter on today's Ratings page, no list of its own) and open questions; pointer added in rebuild-plan.md line 74; checklist item i45.
- 10:52 AM: i42 catch-up 5 (approved A9 rule: on a Pokemon tile 'Mega' is the corner tag): Battle's Their Six / Your Six tiles and the empty My Team winners (96 px pictures) get the corner tag and drop 'Mega' from the name (V2.mon o.tag, V2.tileName), so a Mega never pushes its name below its neighbours. Battle 320 4,667 -> 4,630 (back under 4,650); 390 still 4,144 (over 4,100: question for Sim). Build's Other Options (60 px tiles) NOT changed: the tag covered the small sprites; question for Sim with pictures. Checks: picture check (Build pixel-identical after the revert), Battle tests 21 (no test changed), TEAM-19 pass, winners rows even at 390.
- 11:03 AM: i42 catch-up 6: Battle's six at 1180-1279: long names touched (gap -5 px at 1180 before the Mega tag, 0 after): pair gap 8 px and Home's approved narrower letters (88%) on names at 1180-1279. Measured smallest gap between names: >= 13 px at every width 700-1440 (1180: 13), phones unchanged (320-600 identical). Battle tests 21 (no test changed). My Team 390 over (3,766 / 3,750) traced: the 'Data as of Nov 10 (3 days old)' line wraps because the test data is 3+ days old (02-set-data.js:122 adds the age after 2 days); the footer says the same date: wording question for Sim (i44).
- 11:05 AM: i42 catch-up 7 (colour + Mega rules): Turn One's 'Them' grey (was amber; amber = caution only, Sim Nov 12 8:53 PM), as in Who Moves First; Compare's threat lists write Mega in blue (rowName). Compare tests: same as before (CMP-03 fail, CMP-04b known, unchanged).
- 11:19 AM: Slip found and fixed: my 10:14 AM word change ('Build for Me' -> 'Build' on My Box, commit 402765a) broke BOX-01 and BOX-07 (they read the old sentence); I had run the Home/My Team word tests but not the My Box ones. Tests now accept both (new site 'Build', today's 'Build for Me'): both pass on the new page and on today's page.
- 11:21 AM: i42 catch-ups 12-13 (committed while the full My Team run finishes): My Team's six at 1180-1279: item line keeps 'Charizardite Y' together (keepForm) with Home's approved narrower letters; names line up (spread 18 -> 0 px at 1180, other widths already 0). Set facts on phones: values start at the top so Nature and Stat points share a line (320: 1,482 vs 1,470 -> both 1,470). Full My Team tests on this build running; earlier run on the six fix: 125 pass = 127 minus BOX-01/07 (since fixed in 0647171).
- 11:44 AM: Preview v100 (394 files): all i42 catch-ups live. Checks on this build: My Team tests 127 pass (same as this morning test by test), use test 32/0, clicks 0 double. i43 done; design questions (i44) next, batched with labelled pictures.
- 11:50 AM: Asked Sim (batch 1 of the re-check's design questions, labelled pictures, phone notification): Battle Q2 (390 over: B verdict once + shorter Mega line = 4,083 inside, recommended), Natures Q1 (B complete spread everywhere, recommended), Build Q2 (Other Options Mega tiles: C Mega line above the name, recommended). Batch 2 (Home underdog colours, My Box details, Battle colour/said-twice items, My Team colours/menus) being prepared.
- 11:52 AM: Sim: Battle Q2 B (verdict once in From Real Games + shorter Mega line 'one of two Megas: only one can evolve') and Natures Q1 B (the complete spread everywhere). Build Q2 not answered yet: re-ask with its pictures.
- 12:03 PM: Battle Q2 B built: 'From Real Games' no longer repeats the verdict and count (said once at the top); shared Mega line shortened ('one of two Megas: only one can evolve', both sites). c13 battle: 320 4,607 / 4,650, 390 4,083 / 4,100, all inside, both engines. Battle tests (new site) 21 pass, no test changed; BATTLE-11 reads the verdict from the top on the new site (checks unchanged). Today's page Battle tests running (it shares the Mega line). Note: Sim answered 'my team q3' before its pictures were sent; pictures sent, waiting for her yes on them.
- 12:07 PM: Battle Q2 B checks complete: today's page Battle tests 86 pass, 0 FAIL (same as before; it shares the Mega line). Publishing Preview v101.
- 12:15 PM: Sim: My Team Q3 B (the 'Missing a basic' band in the site's red), answered after its pictures were sent. Build after Natures Q1 B.
- 12:26 PM: Sim: Build Q2 C (Other Options small tiles: 'Mega' on its own line above the name) and Home Q1 B (Home's underdog uses the empty My Team's look: floor ring in its own colour). Queue, one at a time: Natures Q1 B (tests running), My Team Q3 B (red band), Build Q2 C, Home Q1 B.
- 12:33 PM: Natures Q1 B checks complete: My Team tests 127 pass (no test changed); GitHub grade checks pass (run.mjs ALL PASSED, golden 10/10, same-grade ALL PASSED, build/lead logic ALL PASSED, threat PASS, speed 27520/27520 exact). My Team Q3 B built: --band-miss = --bad-text (day rgb 179,38,30; night 255,138,128; was the grey-brown), design-system.md updated; picture check of My Team and Build 0 changed (no Missing-a-basic team there); v2 guard clean.
- 12:43 PM: Build Q2 C built: Other Options' small tiles write 'Mega' on its own line above the name (nameHtml + .bd-alt-pk b .mg block), names line up. Heights after building: 320 3,725 / 390 3,268 (limit 3,700), 1180 1,553, 1440 1,532 (limit 1,800). Build tests 25 pass, no test changed; picture checked at 390 by eye.
- 12:46 PM: Home Q1 B built: Home's underdog drawn with the featured tile (V2.mon ft: floor ring in its own colour), as on the empty My Team; eyebrow mark plain blue (pink means only selected); picture shrinks with its column under 1180. Checks: c13 home 0 over, both engines; day/night 1440, 390 and 820 by eye (820 also no longer clips the sprite at the left; the wide Build Around It button at 820 was there before).
- 12:57 PM: Preview v102 (394 files): Natures Q1 B, My Team Q3 B, Build Q2 C, Home Q1 B. Each checked (tests unchanged, heights inside, picture/eye checks, use 32/0, clicks 0 double).
- 1:00 PM: i42 catch-up (rule 10.1 'too few games in words, never a blank'): My Box's win rate under 30 games now shows the info sheet's existing words under the dash ('only N games' / 'no tournament games yet'). Checked 1440 + 390 (sheet); My Box tests unchanged.
- 1:01 PM: Asked Sim: My Team Q4 (stale-data age words on the score line wrap and put 390 over: C date only beside the score, age in the footer, 3,743 inside, recommended).
- 1:03 PM: Asked Sim: Battle Q3 (empty Battle: B show Your Six under the empty state, recommended; mock-up on a copy, heights 1440 1,278 / 1,950, 390 2,035 / 4,100). An overlay mock-up was discarded (it overlapped the headline).
- 1:04 PM: Sim: My Team Q4 C (date only beside the score, age stays in the footer) and Battle Q3 B (empty Battle shows Your Six). Building one at a time: Q4 first.
- 1:16 PM: Battle Q3 B built: the empty Battle page shows Your Six (My Team's six with its Lead/Back/Bench and game plan) under the empty-state line; a tile opens that Pokemon's info sheet (Build's approved pattern; checked: Whimsicott tile -> Whimsicott sheet, 0 errors). c13 battle empty 0 over at every width, both engines (1440 1,270, 390 2,027); Battle tests 21 (no test changed); use test 32/0; click check running.
- 1:21 PM: Preview v103 (394 files): My Team Q4 C, Battle Q3 B, My Box win-rate words. Click check 125 controls, 0 fired twice.
- 1:28 PM: Catch-up under Sim's names-only rule (Nov 12, 10:39 PM): My Team More menu drops its two counts ('6 sets on one page' -> 'Every set on one page', 'N Pokémon you own' -> 'The Pokémon you own'). Whether the short lines stay at all is asked as More Q1 (pictures sent); Red Q1 (Clear Team / Delete colour) asked too. Correction: the Delete confirm button is plain ink, not blue (Keep is the blue link).
- 1:29 PM: Sim chose Red Q1 = C (Clear Team and the Saved Teams Delete confirm button both red, --bad-text) and More Q1 = A (More menu keeps the short line under each item; an approved exception to names-only for this action menu).
- 2:19 PM: Asked Sim with labelled pictures: Box Q1 (Box 2 keeps full size with empty spots, rec B), Arrows Q1 (slanted box arrows, rec B; checked they are the only round buttons), Filled Q1 (Swap Into My Team filled on My Box, rec B), Even Q1 (Battle Even match in ink like My Team, rec B). Correction: Favoured is already blue on Battle (--good-text = --plot-text); my 'green' statement was wrong.
- 2:23 PM: Re-check items closed without a question: (1) info sheet open form: design-system.md updated to Sim's approved D12-14 look (light blue by day, wash at night; pages.css 528), the doc still described the older mock-up; (2) empty Compare's dashed Pick Team panels match the site's empty-spot look, recommend no change (FYI in summary); (3) 'How the Strength Score works' label no longer exists in the new site (grep: 0), only 'How Scoring Works' inside Why This Score; (4) Copy for Showdown is 2 taps (More menu or Team Sheet) by Sim's approved More menu (Nov 11): no change.
- 2:25 PM: Preview v104 (394 files checked; foundation.html 3,002,731 bytes = the new build): Red Q1 C (Clear Team + Delete red), More menu without counts. Mistake: a first publish without the Preview's URL made a separate private page (https://claude.ai/artifact/PQJowbgcJ3dMv7MyS9EkMo); told Sim; not deleted (needs her word). You Q1 asked (rec A keep blue).
- 2:37 PM: Shorter-pages idea tried and dropped (mock-up only, nothing built): Battle phones with Lead | Back side by side (4 across) and Leave home below. Measured: Battle 320 4,607 -> 4,431, 390 4,083 -> 3,906 (Your Six 628 -> 452), but at 320 the names collide ('Charizard YSneasler', 'Whimsicott' cut) and Leave home leaves a half row: breaks C-rules, so not proposed. Script: scratchpad look/mine.cjs.
- 2:42 PM: i41 (flaky X-10) measured: early tap after Build passes 3 of 9; with a 1.5 s wait 9 of 9 (same build, today). My first explanation (broken sprites in the test copy shifting tiles) was WRONG: after pointing the test copy at the real sprite folder (harness.mjs, NP_ART made absolute) sprites load but X-10 still passes only 4 of 9. Seen: a second redraw ~0.6 s after the team appears; in a plain script (no test setup) an early tap opens the sheet 3 of 3 and it survives that redraw. Cause still unknown. Harness picture fix kept only if all three suites are unchanged (running).
- 2:43 PM: Sim: 'for all questions above, lets go with recommended': Box Q1 B, Arrows Q1 B, Filled Q1 B, Even Q1 B, You Q1 A (keep blue 'You', no change). X-10 side work paused (harness picture-path change set aside in scratchpad harness-art.patch, not committed). Building one at a time from the ready patches, each with checks.
- 2:51 PM: Built Sim's 2:41 answers one at a time, each checked: Even Q1 B (f4c84ba), Arrows Q1 B (d7f9185), Filled Q1 B (489f6df), Box Q1 B (8eefcca); You Q1 A = no change. Preview v105 (394 files checked; foundation.html 3,003,636 bytes). Full use/clicks/Battle/My Team runs in progress.
- 3:19 PM: Full checks on the build with Sim's 2:43 PM answers: use 32 ok 0 FAIL; clicks 125 controls, 0 fired twice; Battle (new site) 21 pass, 62 FAIL (same as before: tests waiting for unbuilt pages), 4 skipped; My Team 127 pass, 11 FAIL, 4 known (same as before).
- 3:27 PM: i41 X-10, new facts (experiments/x10-debug.mjs, the test's exact steps with page logging): in failing runs the press and release both land on the tile (IMG inside an enabled BUTTON: not disabled, not inert, same node, still in the page, nothing default-prevented, no redraw between) but the browser fires NO click. Failing 1-2 of every 6 runs; after adding mousemove/pointermove/drag listeners 16 of 16 passed, so the logging itself hides it (timing-sensitive). Cause still unknown; not a site bug shown so far (a plain script tap works 3/3). Next idea, untested: an image drag starting on the sprite (draggable IMG) swallowing the click.
- 3:28 PM: i41 X-10: the image-drag idea tested and REJECTED (test's exact steps, 10 runs each, same session): sprites not draggable 1 of 10 passed vs as built 2 of 10. Cause still unknown; investigation paused for the 4:40 summary. Known: press+release reach the tile, no click fires; extra mousemove/pointermove listeners hide it (16/16).
- 3:29 PM: Slip found: the polish check (CLAUDE.md: every site change runs experiments/polish-check.mjs for the page it touches before the Preview) was not run for today's afternoon My Box/Battle changes before Preview v104/v105. Running it now before/after (VIEWS=box,battle); any new finding gets fixed and reported.
- 3:34 PM: Polish check (Sim's required check) fixed: for the new site it copied the page to app/pc-N.html, where the self-hosted fonts (dist/fonts) and sprites (../src/v2/art) don't load, so every TARGET=v2 run measured with fallback fonts and no sprites. Now the copy sits in app/dist/. Proven: My Box 'Meowscarada spills 12/6/2 px' (400/480/1440) disappears with real fonts; on the real page the name fits (61 of 61 px at 400). Earlier v2 polish results (spill/wrap) may have been off in both directions. Before/after Sim's four changes: identical findings (no new finding).
- 3:40 PM: Catch-up (no text out of its box; Sim's approved narrower letters 88%): empty My Team 'Or Start from a Winner' line 'N% of teams' ran 2-6 px past its column at 320 (found by the fixed polish check with real fonts; seen in a picture: '31.8% of teams' cut). Fix: font-stretch 88% under 400 px. Checks: polish team-empty spill 6 -> 0; lines inside the tile at 320/340/360/390/400; TEAM-19 pass. Other new findings from the real-font run, not yet judged: Home 'Rillaboom 46.6% of ladder' +4-18 px at 320/720/800 (names and numbers fit by eye at 720; likely sprite overlap, unproven); info sheet 'spill' list (likely its own scroll area, unproven).
- 3:41 PM: Preview v106 (394 files checked; foundation.html 3,003,840 bytes): empty My Team winners line fits at 320.
- 3:42 PM: Polish check fix 2: its 'spill' rule counted text below the fold of a scrolling box (the info sheet, overflow:auto, components.css 92) as spilling: 41 false findings. Now a scrolling box only checks its sides. Info sheet spill 41 -> 0 (lone 8, tap 2, lineh 1, glow 1, space 7 unchanged in kind). Remaining unjudged from the real-font run: Home 'Rillaboom 46.6% of ladder' +4-18 px (320/720/800).
- 3:43 PM: Home 'most used' three at 320: the big slanted centre name overhangs its (edge-less) button: today's data 'Sneasler' 3 px (not visible); the polish check's fixture puts 'Rillaboom' there: +18 px at 320, +14/+10 at 720/800. Data-dependent risk when a long name is #1; not seen in a picture yet. New checklist item i46 (unsure), not fixed today.
- 3:43 PM: Slip (twice today): checklist 't' values typed by hand instead of from now.sh (i44 at 2:51 PM, i46 at 3:43 PM); both corrected to the clock's value. From now on the t is copied only from the now.sh line of the same step.
- 3:44 PM: Slip: wrote 'It's 3:44 PM' in a message without reading the clock (the clock read 3:43 PM the next step). Rule 00t; noted.
- 3:46 PM: i46 confirmed real (picture, bundled data, 320): Home's #1 name 'Rillaboom' runs into 'Incineroar'. Overlap measured A (now): 18/14/1 px at 320/360/390. Asked Sim Home Q2 with labelled pictures: B (centre column 2fr + 20 px name under 450 px) = 0 px at 320-449, RECOMMENDED; ready patch docs/rebuild/proposals/home-q2b.patch (not applied).
- 3:46 PM: Sim: Home Q2 B (her words: 'option B please. your recommendation'). Building from home-q2b.patch with checks.
- 3:54 PM: Sim: 'Continue with executive authority until 6PM est tonight please.' Authority extended to 6:00 PM Eastern Fri Nov 13, normal guidelines (design choices with pictures and her yes). Summary reminder moves to 5:40 PM; at 6:00 PM: STOPPED, handover, phone notification, delete both backstops.
- 3:58 PM: Home Q2 B built (Sim's yes 3:46 PM): under 450 px the centre column is 2fr and the #1 name 20 px; side names get the approved narrower letters (88%) under 360 px, because B's narrower side columns made 'Incineroar' run 8 px past at 320 (caught by the polish check, fixed). Checks: overlap 0 px at 320/333/340/359/360/375/390/412/430/449/450/520 (bundled data, Rillaboom #1); before/after pictures 28 shots, 8 changed, 0 outside 320-449; c13 home 0 over; Home tests 16 pass, HOME-08/HOME-10 fail the same before (unbuilt pages); polish home spill 5 -> 3 (left: Rillaboom at 720/800, pre-existing, next).
- 4:00 PM: Home Q3 asked with labelled pictures (720): the Home Q2 overlap also happens at 700-899 (Rillaboom +18/14/6/10/6 px at 700/720/760/800/820). B = the same fix there (+ narrower side letters 700-799): 0 px at 700-899, RECOMMENDED. Ready patch docs/rebuild/proposals/home-q3b.patch (not applied).
- 4:00 PM: Preview v107 (394 files checked; foundation.html 3,004,256 bytes): Home Q2 B (small phones).
- 4:04 PM: Catch-up under Sim's approved A9 rule ('Mega' is the corner tag on a Pokemon tile): Home's six tiles (the Champion's six and Your six) now use the corner tag and the name without 'Mega' (as Battle and the empty My Team since 10:52 AM). Found by the real-font polish check: 'uneven' names (Mega Charizard Y on 2 lines vs 1) at 320-400 and 720-880. Checks: polish home uneven 1 -> 0; Home tests 16 pass, HOME-08/10 fail as before; eye check 390 + 1440.
- 4:04 PM: Real-font polish findings judged: info sheet 'lineh 1.3' = two-line row labels in the speed list (rule 1.5 is for paragraphs): no change. Known/kept: tap 20-26 px are link text boxes (c13 elementFromPoint tap<44 = 0); footer links 2+1 at 320; night glow on 'Top tier' (Sim's approved score light). Remaining open: Home Q3 (tablets), waiting on Sim.
- 4:05 PM: Correction to the 4:04 PM entry: the night glow on 'Top tier' was called 'Sim's approved score light' without checking. design-system.md says Sim kept the team-colour light behind the score; whether that covers a glow on the band word itself is UNSURE. Left unchanged; to show Sim with a picture.
- 4:05 PM: Checked: the night glow on 'Top tier' IS approved (decisions.md line 124: 'Sim: KEEP the night glow on the band word'). The 4:05 PM 'unsure' is resolved; no change.
- 4:08 PM: Full real-font polish check, all built pages: spill 47 -> 3, uneven 1 -> 0 (lone 26, tap 9, lineh 1, glow 3, space 32 unchanged and judged above). The 3 spills = Home tablets 720/800, fixed by Home Q3 B if Sim says yes.
- 4:09 PM: Preview v108 (394 files checked; foundation.html 3,004,267 bytes): Home six tiles with the corner Mega tag. c13 home 0 over (320 4,235 -> 4,197).
- 4:12 PM: Odd-width check (Sim: every window size) for Box Q1 B: Box 2 = Box 1 height at 360/480/560/640/700/760/1024/1180/1280/2560 too (15 widths in all). My Team phone height (3,743 / 3,750 at 390) measured: hero 1,121 (six 560), Set 449, Suggestions 442, Matchups 815 (heading 29, intro 68, counts 51, view switch 88, Stand-Outs 2 x 224 = 8 rows of 56), Team Checks 244, Your Games 89. No layout slack found in Matchups without showing less (Sim chose 4+4); recorded, no proposal.
- 4:22 PM: Sim: 'that looks fine go for it' = Home Q3 B (the only open question; read as yes to B). Building from home-q3b.patch with checks.
- 4:26 PM: Home Q3 B built: at 700-899 the centre column is 2fr and the #1 name 20 px; side names 88% at 700-799. Checks: overlap 0 px at 17 widths 320-1024 (Rillaboom #1); polish home spill 3 -> 0; c13 home 0 over; Home tests 16 pass (HOME-08/10 unbuilt as before); eye check 760 day, 820 night.
- 4:27 PM: Preview v109 (394 files checked; foundation.html 3,004,608 bytes): Home Q3 B (tablets).
- 4:36 PM: Before/after pictures, all five pages, before Sim's 2:43 PM answers vs 4:12 PM (140 shots, 14 widths, day+night): My Team 0/28, Build 0/28, Battle (opponent entered) 0/28 changed = nothing moved by accident; My Box 28/28 (arrows, filled button) and Home 28/28 (Mega tags at every width; 12 with a height change at 320-430/700/820 where names got shorter; Q2 at 320-449) = all intended. Home Q3 was built after this snapshot and checked separately.
- 4:46 PM: Checks on the build with Home tags + Home Q3: use 32 ok 0 FAIL; clicks 125 controls, 0 fired twice.
- 4:48 PM: i41 X-10, two new measured facts (same build, 10 runs each): (1) desktop mouse: moving onto the tile first = 10 of 10 pass, tapping straight away (the test) = 3 of 10; no hover style moves the tile and no page code reacts to mouse-over, so the cause is inside the browser (unsure of the mechanism). (2) Phone width 390 with touch, tapping straight away: 8 of 10 pass: 2 lost taps. Possibly a REAL player issue on phones (tap right after Build shows the team); not yet seen in a picture, could still be test setup. Priority raised; scripts experiments/x10-hover.mjs, x10-touch.mjs.
- 4:50 PM: i41 phone failure captured (experiments run 11 of 12 passed): touchstart/touchend/pointerdown/pointerup all reach the tile, no click; the tile sat partly below the screen (y 831 of 900) so the test scrolled 81 px 2 ms before the tap. Reading (NOT proven): a tap within moments of a redraw/scroll can lose its click; a real thumb rarely does that. Next step for a later session: reproduce by hand on Sim's iPhone, or log real taps on the Preview.

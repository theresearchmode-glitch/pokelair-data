# Decisions made for Sim (one list for every page; Sim's review, Nov 11, item 20)

Claude decides small things under executive control; Sim can overrule any of them. Every new entry is also told to Sim in chat.
Sim's own decisions are marked "Sim". Newest first.

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

# HANDOVER: the NastyPlot rebuild (updated Nov 12, 5:24 PM Eastern by the clock)

Read first: docs/rebuild/RULES.md (section 3 = executive authority), then this top section, then my-team-fix-plan.md.
The Nov 11 handover is kept below as history; where they disagree, this section is newer.

## NOW (Nov 12, written 5:24 PM Eastern by the clock; Sim's authority until 6:00 PM; summary reminder 5:40 PM)
Read first: RULES.md section 00 (honesty: Sim's questions first; WORKING/STOPPED; nothing claimed before it's real; every check
shows its proof; mistakes reported at once) and the CLAUDE.md rule "times are always read from the clock".
- Home (app/src/v2/pages/home.js) is BUILT: hero, the Champion's six vs yours, The Meta right now (Top rated / Hidden gems, plus
  This week on phone and iPad), today's underdog, 12 tools, More on Home fold, welcome card, What's New, weather word.
  On the Preview: v78 (everything up to the welcome card / What's New / weather word). Built since v78, pictures sent, NOT on the
  Preview (waiting on Sim's yes): the sweep look changes (level duel headings, #18, Mega names, This week pictures, outlined
  Build Around It, night switch, Hidden gems fixed height), the five Home gaps (All cores, sample note, Add Your Six -> My Team,
  This week labels read the rating, paste box label), info sheet Build Around It / Popular Sets, Home/End tab keys, ability share.
- Checks last run (newest first): Home tests HOME-01..16 + PKMN-01..07, new build: "behaviour: 15 pass, 9 FAIL, 0 known bugs"
  (5:21 PM; the 9 = pages not rebuilt (Build, Battle, Meta, method) + info-sheet wording/links); today's site: "23 pass, 0 FAIL,
  1 known bugs" (unchanged). c13 home 390 4,345/4,400, 820 3,436/3,500, 1440 2,893/2,900 (first visit), tap<44 0, both engines.
- Open, waiting on Sim: Hidden gems fixed height (kept, with the "Only 2..." line) vs short; Preview publish of the items above;
  What's New draft words (docs/rebuild/whats-new-draft.md); PKMN-02/06 test wording vs the approved sheet (no decisions.md entry
  yet, so no test branch added); 320 px Home limit (assumed 4,600; Home is 4,743 there).
- Next page: Build. Groundwork done (docs/rebuild/build-inventory.md: tests, shared logic, mock-up -> data map); Winning Cores
  data shared (47-core-data.js, today's Cores proven identical 38/38). Nothing of Build's page is built.
- 4:02-5:02 PM: no work was done (Claude ended its turn while holding authority, after saying "I'm fixing these now"). Rule 00
  was written so this never repeats.

## NOW (Nov 12, ~8:30 AM Eastern; Sim at work, Claude has authority until 4:00 PM, reminder trig_01N8c7k5MNNSTMMSs7GsdFYh)
Day plan agreed with Sim: 1 tests green (cause: frozen test data vs real clock; fix 6c168a8) -> 2 records -> 3 live fonts to main
+ live page republished with fonts/ -> 4 Preview v53 (My Team with A8, gallery wording) -> 5 height cuts that keep every feature
visible (pictures by notification) -> 6 finish My Team (25 tests, A10/A12/A13, Edit Set twice, Stand-outs word, C12 use test,
re-measure; PC prompt for heavy proofs) -> 7 info sheet D12-14, My Box E17-21, PC + sun/moon icons (pictures first) -> 8 team
link plan F23-25 (plan only) -> 9 4 PM summary. Preview republished after every finished step. Details: decisions.md (top).
STATE ~10:45 AM: tests green (6c168a8; runs 717/719). Live v155 has self-hosted fonts (live = cb49701 + docs/rebuild/live patch;
live is NOT built from main: see docs/rebuild/live/README.md). main d24d31b = fonts + test fix (squashed). Preview v55 = design6
9f11101 (height cuts e9abcc3, A10, A13). Waiting on Sim: phone height limit (3,707 vs 3,400; Claude recommends ~3,700), Edit Set
twice (recommend Set section only), main-vs-live merge (recommend yes), A8 iPhone check. Helper: 25 behaviour tests (review first).
Outside-check fixes done before 8 AM: c13 shown-the-same-everywhere 3204c92, sheet keys ada3a17, My Box focus/search e0874d0,
one-click test 93ce54b, behaviour FAILs classified 13dd789 (57 pass / the same 75 FAIL).

## NOW (Nov 12, ~7:15 AM Eastern; Sim's executive authority until 8:00 AM, reminder trig_01DdVoPaM325QesqGQccfTGF)
MORNING UPDATE: Sim approved all the design pictures; they are APPLIED on claude/design6 (51759e5): A2, A3, A4, A6, A7, A8, A11,
squeezed row, A9, plus the word-list wording (147c28b). My Team built-page heights now 4,331 / 3,945 / 3,318 (iPad within limit) /
2,215; phone still 545 over, desktop 415 over -> next: layout options for Sim (fix plan step 4). Live-site fonts prepared on branch
claude/wonderful-carson-nb6gd5 (9eabdd6), not live (needs Sim's go: merge to main, then republish with fonts/ beside page.html).
Nothing published to the Preview yet (still v52); the new work needs Sim's go to publish. Details: decisions.md (Nov 12 sections).

DONE on claude/design6 (non-visual, each checked on the built page with real data; result lines in decisions.md):
- A5 redraw in place (focus kept; a control whose data-* markers change is replaced, never mutated) - 6aa245f.
- A6 one live "Working out" line - 6aa245f.  A14 not a bug (closed folds are invisible/untabbable).
- A15/C8 44x44 tap areas: "?" buttons (6aa245f) and small links/tabs (b48f37a), pixel-identical.
- Jump links land ON the section (were hiding its heading under the bars: Sim's "Matchups takes you nowhere") - 9282812.
- Fonts hosted by NastyPlot itself on the new site (0 Google requests, pixel-identical) - fd80eac. Today's LIVE site still uses Google.
- A16 answered (0c405c7). C13 check built and self-tested: experiments/c13-check.mjs (e08862f, b48f37a). Built-page heights
  incl. worst states in page-heights.md.
- Behaviour A-team v2 after all of it: 57 pass / 75 FAIL / 6 known / 4 fixed? / 2 skipped, no test changed outcome vs the baseline
  (efe9fe5). Today's page: 132 pass / 0 FAIL. run.mjs ALL PASSED. v2 guard clean.

WAITING FOR SIM (pictures + patches in docs/rebuild/proposals/, none applied; check with `git apply --check`):
- A2 Team Checks once / "Things to Know" (a2-proposal.png) - A3 ±0 swap behind See all + A4 one verdict per Matchups row
  (a3-a4-proposal.png) - A6 one message per Apply (a6-proposal.png) - A7 jump underline follows (a7-proposal.png; desktop needs a
  choice) - A8 bars 96% (a8-proposal.png; iPhone check needed) - A11 quiet "Saved" (a11-proposal.png; phone wraps 3+1) -
  squeezed row at 1180-1320 (squeeze-proposal.png) - gallery wording (gallery-wording.md, also needs a go to publish).
  Apply order if all approved: a3-a4, a6, a2 (checked to combine); a7, a8, a11, squeeze are independent. If A2/A4 are approved,
  behaviour tests MU-02, SUG-10, SUG-11 need their expected wording updated (they test today's words).
- Queued after My Team: My Box PC icon (refined drawing, picture first), Day/Night as sun/moon (pictures first).
- Questions: what "those are good" meant for the older items; the 320 height limit (390's used, "assumed"); A9's three small
  faults (fix or leave); night glow on "Top tier"; My Box box markers 28px (need spacing); fonts on the live site; wording: "?"
  popup says "ready"/"93% ready" (word list: Matchups); "Nothing to fix" above a lead-support warning after a ±0 swap.
- Not reproduced: "Matchups disappears on a wide window" (visible 1180-3200, both engines); same-compare's 1 difference; the PC's
  1 behaviour FAIL.

HOW TO WORK HERE (learned tonight):
- Pictures of the built page need the daily data fed in (as the proof scripts do) and art + fonts on disk:
  `node app/build.mjs --v2 --art=../src/v2/art/` (fonts are copied to app/dist/fonts by the build). Without data the page is
  ~800px shorter and Matchups has no real verdicts.
- Proposals: build in a scratch `git worktree` (link out/ and node_modules), make the patch with `git diff -- app/src/v2` ONLY
  (a full diff once carried out/ "deletions" into the main tree: logged MISTAKE), never apply to the main tree without Sim's yes.
- Pixel checks: run a same-file control first (one view has ~3,600 px of its own noise); prove a check can fail (planted faults,
  broken font folder) before trusting "identical".
- Setup: WebKit installed (with system libraries); node_modules/playwright(-core) linked to /opt/node-tools for ES-module scripts.

# (history) HANDOVER: end of the Nov 11 chat (written Nov 11, ~11:00 PM Eastern)

Read first: docs/rebuild/RULES.md (Sim's rules; they win over older lines), then this file, then
docs/rebuild/my-team-fix-plan.md (Sim's plan and order of work).

## 0. State at handover
- **Sim said STOP (Nov 11, ~10:45 PM): do nothing until she says go.** The next chat starts by asking Sim what to do. Nothing has
  started on the fix plan.
- Branch `claude/design6`. All work is committed and pushed; `git status` was clean when this was written.
  The commit that holds this file is the handover commit (see `git log`).
- Preview artifact "NastyPlot Full Redesign": https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf, **version 52**, built from
  commit 636aa5c (box icon in the header). 387 files, 346 v2art sprites (checked with the Artifact files list after the publish).
  It was NOT changed during the handover. How to build and publish it: docs/rebuild/preview-kit/README.md.
- Parked, not on the Preview, not on claude/design6: branch `claude/park-ipad-balance` (commit b19aa88): on iPad widths
  Suggestions move beside Matchups only when that makes the page shorter. Needs Sim's yes (it's a visual change) and its
  checks were never finished (section 5).
- The live site (today's design) was not touched in this chat's last part. It still shows Darkrai on empty My Team (by design
  until the switch; app/src/app/74-arena.js).
- A scheduled reminder "Sim's 11 PM authority summary" (trig_01D2j2aGvUQhCiZAEmmdUnCT, 10:55 PM) was set for this chat. Sim's
  authority window ended at 11 PM; any new authority must be given again.

## 1. Page by page (new build, app/src/v2; "built" means code exists, NOT that it is done; nothing is done by rule C12)
| Page | Status | Notes |
|---|---|---|
| Shell (header, top menu, phone bar, footer with "Data as of", toasts, sheets, search) | built | Box icon next to Day/Night (v52). Fixed-bar legibility A8 open. Day/Night label A15 open. |
| My Team, full team (#team) | built, half done | Every item of Part A (A1-A16) is open. Plus: squeezed suggestion row at ~1180px and the Matchups reports (section 4). |
| My Team, empty (#team-empty) | built, half done | Featured underdog Flapple with "Add Flapple to My Team" and "Or build around your favourite Pokémon ›". Not swept by Sim's C12 use test. |
| Pokémon info sheet (sheet over any page; #sheet demo) | built | same-info: 349 of 350 identical on the PC (1 unexplained). |
| Team Sheet (sheet from My Team) | built | same-sheet 42/42 identical (PC r4b). |
| My Box (#box) | built | Not in Sim's sweep (unknown, not passing). Helper: Your Team strip alone (3+1) at 1400+. |
| Compare (#compare) | built | same-compare 20/21 (1 unexplained). Helper: empty compare at 1440 mostly blank. |
| Saved Teams, Import, Share, Log a Game / Your Games, Copy for Showdown, Clear Team | built (sheets on My Team) | same-saved/import/record/share identical on the PC. same-share-v2 can't run on Windows. |
| Style guide (#guide) | built | internal page. |
| Home, Build, Battle, Meta (Ratings etc.) | NOT started | Preview only: a "Coming next" page with the approved mock-up picture (pages/coming.js). |
| Sets, How We Calculate, About, Send Feedback, Legal, onboarding, error states | NOT started | Links to them land on a placeholder (A15, C10). |

Heights: only My Team has been measured on the built page (page-heights.md correction). Every other rebuild height in that file is a mock-up number.

## 2. Sim's decisions in this chat that were not yet in a file (Nov 11 evening, Eastern)
- ~9:30 PM: all her iPhone bug reports come from the Claude app on iPhone (not desktop). Keep the frosted glass ("i liked the glass").
- ~9:40 PM: stutter fixed and the Add a Pokémon sheet "love it. works well" (already logged).
- ~9:46 PM: helpers allowed until 11 PM for the rebuild.
- ~10:00 PM: My Box deserves to be seen, but **never a sixth menu place** (top or phone bar): "thats waaay too much".
  It goes up top next to Day/Night as **an icon**, not the words "My Box". (Built as a storage-box icon, v52.)
- ~10:30 PM: Sim suggested a **Pokémon PC icon** instead ("creativity works wonders"). Claude proposed 3 options (retro PC with a
  tiny Poké Ball on screen [recommended], a monitor showing a 3x2 box grid, a Poké Ball alone). Not built; waiting for Sim.
- ~10:40 PM: pause, then **stop: do nothing until she says go**.
- ~10:50 PM: the fix plan (docs/rebuild/my-team-fix-plan.md) and Part C rules; **no design decision ever without her yes and
  screenshots, even under authority**; every "checked" says built page or mock-up + result line + plain English; quality over
  speed. All in docs/rebuild/RULES.md.
- ~10:55 PM: Shady Paw is cut and is not the mascot (CLAUDE.md updated). Host the two fonts ourselves (privacy). Ratings must have
  one source (Garchomp 85 on Ratings vs 92 on My Team) before Ratings is built.

## 3. Open questions waiting on Sim
1. A4: one verdict per Matchups row (real games) with the calc shown only when it differs, or move the calc into the row's sheet?
2. A3: should a ±0 suggestion stay visible (with a secondary button) or go behind "See all suggestions"?
3. A9: which redesign of the selected Pokémon (from the design chat).
4. PC icon: which of the 3 options (pictures needed first).
5. Gallery card: new wording to replace "all inside the length limits" and "same numbers as today's site" (show her first).
6. The parked iPad layout (claude/park-ipad-balance): keep or drop? (pictures needed).
7. Phone height: the big cuts (fold the three sliders into a summary line; fold the Favoured list; shorter Matchups intro) are
   design choices (helper report: test-runs/nov11-night/helper-height-report.md).
8. The 15 findings of the fresh-eyes polish helper (test-runs/nov11-night/helper-polish-review.md) that change the look:
   slider selected state in dark mode, button heights, Compare empty state, footer wrap, Mega captions, sheet stats 2+1, the
   night glow on the band word ("Top tier"): keep or remove.
9. Older, still open: the NP_PID_KEY secret for Player IDs (names still reach browsers in the daily data until then); About page
   wording (players can ask to have their name removed); review item 10 screenshot; a favourite link on the empty My Box (optional);
   the open-Battle-tab height limit (3 screens desktop, 6 phone).
10. Font hosting: no visual change expected, but show before/after.

## 4. Known bugs and unfinished work (nothing below is fixed)
- **Part A, A1-A16** of the fix plan: all open. Order of work is in the plan.
- **Squeezed suggestion row (Sim's screenshot, ~10:40 PM):** names one letter per line ("W h i m s i c o t t", "Mega D r a g o n i t e").
  Reproduced on the built page (Preview v52 foundation.html, WebKit, script preview-kit/scripts/bug2.js): at 1180 wide the first
  suggestion's swap column is 135px wide and 198px tall (every other width 265-928px wide). Plain words: just past the switch to
  two columns, the middle of the row gets squeezed. Cause not confirmed (likely the `.tm-sug li` grid at min-width 900 with
  `minmax(0,1fr)` for the swap column in the narrow left column). Raw output: test-runs/nov11-night/jump-and-suggestion-repro.txt.
- **"Pressing Matchups just scrolls and takes you nowhere" (Sim):** [Nov 12: FOUND AND FIXED, see decisions.md: the jump put the heading under the bars; "targetTop: 0" below was misread] NOT reproduced. Built page v52, WebKit, widths 390-1440: the
  Matchups jump link scrolled the page so the Matchups section's top sat at 0 every time (result lines in the repro file). Need
  from Sim: which app and roughly how wide. Possibly linked to the next item and to A5 (redraw) and A7 (jump bar).
- **"On a wide browser the whole Matchups section disappears" (Sim):** NOT reproduced, cause unknown. Same request to Sim.
- **Behaviour tests on the new build:** last run on the PARKED branch build (app/dist/v2.html, normal data):
  `behaviour: 57 pass, 75 FAIL, 6 known bugs, 4 fixed?, 2 skipped; 668s  (adapter v2)`. Plain words: unknown whether that's good;
  there is no run on the same commit without the change to compare with (the only earlier v2 run, Nov 11 18:14 build:
  15 pass, 117 FAIL, classification in test-runs/v2-A-team-2026-11-11.md). Run it on claude/design6 before judging.
- **A16 proofs:** same-six 0 of 67 identical; same-compare 1 of 21 different; same-info 1 of 350 different; same-share-v2 crashes
  on Windows (the .cjs file has /home/user/pokelair-data/ written in for Playwright and data); A-team 1 FAIL unnamed. Each needs
  "real difference or out-of-date proof" written next to it.
- **Records that were wrong:** page-heights.md (corrected in this handover, see its CORRECTION note). The gallery card
  (docs/rebuild/preview-kit/gallery.html, published as gallery.html) still says "all inside the length limits" and "same numbers as
  today's site": wrong; not changed because the artifact must not be touched without Sim.
- Fonts load from Google's servers (fonts.googleapis.com) in the new build and gallery: privacy fix pending.
- Ratings number mismatch (Garchomp 85 vs 92): not investigated yet.
- polish-check.mjs false positives to fix in the checker: "spill" inside scrolling sheets, "space" on auto margins.
- 19 leftover app/pc-*.html files from interrupted runs (gitignored, harmless).
- In the middle of when Sim said stop: reproducing the Matchups and suggestion-row bugs (done for the repro, no fix started) and
  measuring the parked iPad change (done, parked).

## 5. Checks last run (newest first). Each: where, commit, result line, plain words
- Repro of jump link + suggestion row. Built page, Preview v52 foundation.html (commit 636aa5c), WebKit, 390-1440:
  at 1180 `sw 135x198` and `narrow ["mg:Mega"]`; Matchups link `targetTop: 0` at every width.
  Plain words: the squeezed row is real at 1180; the Matchups link worked in this test.
- Behaviour A-team, adapter v2. Built page app/dist/v2.html from the PARKED branch (b19aa88 content), normal data:
  `behaviour: 57 pass, 75 FAIL, 6 known bugs, 4 fixed?, 2 skipped; 668s  (adapter v2)`. Plain words: see section 4; not comparable yet.
- Polish check My Team, built page app/dist/v2.html (parked change, normal data, where the change does not apply):
  `polish check: glow 1, space 5; page errors 0; 68s`. Plain words: no errors; the one glow is the night band word; 5 spacing flags
  (all auto-margin false alarms on this run, compared with the run before).
- Polish check My Box + My Team. Built page app/dist/v2.html, commit 636aa5c content (box icon), normal data:
  `polish check: lone 1, glow 1, space 11; page errors 0; 82s` (`lone box section.bx2 4 items rows 3+1 @1440-2560`,
  `glow team "Top tier" @390d,820d,1440d`). Same findings as before the icon (diffed). Plain words: the icon added no new problem;
  the two old ones remain (My Box's 3+1 row on wide screens, the glow).
- Header fit, built page (commit 636aa5c content), WebKit, 300-2560: left/right margins equal at every width (16/16 phones, 48/48
  700-1179, 96/96 at 1440+), no sideways scroll, no menu name taller than 44px. Plain words: the icon fits everywhere.
- Height helper. Built page foundation.html (Preview v50/v51 content), sample team: phone 4,308, iPad 3,775, desktop 2,223.
- Fresh-eyes polish helper. Built page app/dist/v2.html built 02:41 UTC Nov 12 (commit 4626d1e content) + foundation.html:
  `spill 37, lone 19, lineh 1, glow 4, space 33`, 0 page errors, 15 findings (report in test-runs/nov11-night/).
- iPhone sweep, WebKit iPhone 13, built Preview foundation.html (v49/v50 content): box, compare, sheet, team-empty at 300/320/375/390/430:
  extra width 0, scrollX 0. My Box add sheet while typing: `{"kbo":true,"sheet":[8,229],"input":[100,122],"font":"16px","vh":664}`.
  Plain words: no sideways scroll on those pages; the add box stays on screen and doesn't trigger iPhone zoom.
- Full check nov11-r4b on Sim's PC (base b8f55ed vs working tree 9d22563), file test-runs/full-check-nov11-r4b.txt:
  same-import 26/26, same-box 33/33, same-record 62/62, same-compare 20/21, same-edits 41/41, same-saved 38/38, same-team 54/54,
  same-info 349/350, same-sheet 42/42, same-share 18/18, same-matchups 230/230, same-six 0/67, same-why 265/265,
  same-share-v2 NO RESULT (exit 1), run.mjs ALL PASSED, A-team 131 pass 1 FAIL, C-battle 86 pass 0 FAIL, D-meta-shell 151 pass 0 FAIL,
  golden 10/10, same-grade ALL PASSED, suggest-audit PASSED. Plain words: most behaviour matches today's site; four proofs
  disagree or can't run and each needs explaining (A16).

## 6. Commands (repo root /home/user/pokelair-data; Node 22)
- Today's site: `node app/build.mjs` -> app/dist/. All its tests: `node app/test/run.mjs`.
- New site: `node app/build.mjs --v2` -> app/dist/v2.html (the v2 guard prints "v2 guard: clean" or fails the build).
  With the Preview's data: `node app/build.mjs --v2 --preview-data` (player names become "Player N"). Rebuild without it after.
- Preview: `S=<scratch> PREVIEW=1 timeout 900 bash docs/rebuild/preview-kit/rebuild-preview.sh` (then preview-kit/README.md).
- Polish check: `TARGET=v2 VIEWS=team,box node experiments/polish-check.mjs out.json` (views: guide, team, team-empty, box,
  compare, sheet; default all). Reads app/dist/v2.html.
- Behaviour tests on the new build: `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team [--only=ID,ID]`.
  It overwrites app/test/behaviour/results.json: copy it aside first and put it back after.
- Proofs (before vs after): `node experiments/same-<name>.mjs` (same-team needs a 40-minute limit: each case waits 20 s).
  Full set: `node experiments/full-check.mjs <base-commit> <label>`.
- CI checks to run before pushing to main: everything in .github/workflows (golden.mjs, same-grade.mjs, suggest-audit.mjs, ...).
- iPhone engine: Playwright `webkit` with `devices['iPhone 13']`. In a fresh container WebKit may be missing:
  `npx playwright install webkit` (browser only; do not reinstall Playwright).
- Push: `git pull -q --rebase origin claude/design6 && git push -q -u origin claude/design6` (Sim's PC chat also pushes to this branch).

## 7. Things only said in the chat (now saved)
- Sim's PC chat ("npd opus local pc", Windows, RTX 3080) runs heavy checks; briefs go in docs/rebuild/gpu-jobs.md or
  test-runs/; its results come back as commits on claude/design6 (e.g. full-check-nov11-r4b.txt). It fixes only setup, never code.
- Commit trailer and no model names in commits (CLAUDE.md).
- The Preview's other files (mock-ups, thumbs, art, v2art) live only on the artifact; publishing only foundation.html + index.html keeps them.
- Sim tests on iPhone in the Claude app; things that pass in Chromium can fail there (keyboard sheets, zoom on <16px inputs).

## 8. What went wrong tonight, and how we work now (Nov 11, ~10:30-11:00 PM)
What happened, in order:
1. Under authority, Claude made visual changes on its own (a sixth menu place, then a text link, then a box icon) and published
   them to the Preview before Sim saw them. Sim: a sixth menu item is "wild" / "waaay too much".
2. Claude started an iPad layout change that worked for the sample team but made the page taller for a team with a short
   Matchups list (measured: 2789 -> 2881), then patched it with a per-team rule. Parked when Sim said stop.
3. Sim found real bugs on the published Preview that Claude's checks had not caught: the suggestion row squeezed to one letter
   per line (reproduced at 1180px), the Matchups jump link "going nowhere", and Matchups disappearing on a wide window (both not
   reproduced yet). Sim: "this is sloppy work".
4. Sim's sweep showed the records were wrong: page-heights.md and the gallery said My Team was inside the length limits (those
   were the mock-up's numbers; the built page is over at every size), and the gallery said "same numbers as today's site" while
   four proofs disagree.
Why (Part B of the plan): recorded from the mock-up, not the built page; sections added without reading the whole page as a
player; checked as a picture, not while used; each section chose its own main button. And Claude prioritised speed over quality
and multitasked several visual changes at once.
How we work now (all in RULES.md): Sim approves every visual/design choice with screenshots first, even under authority;
every "checked" names built page or mock-up, the result line and a plain-English meaning; one item at a time, use-tested on the
built page and read top to bottom before anything is published; stop means stop; Part C (C1-C13) for every page; the fix plan's
order of work; no new page until Part A is done and Part C is in place.

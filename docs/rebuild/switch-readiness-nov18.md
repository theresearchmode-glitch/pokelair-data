# Switch readiness: everything left before the redesign replaces the live site (Nov 18)

Look-only check. No site code, data or workflow was changed. Written Wed Nov 18, 2026.
Read at: claude/design6 9eda3209, main 22ff4577, live 22ff4577 (git fetch the same day).
Every claim says how it was checked, or says "unsure".

Status words: **done**, **open** (Claude can do it), **blocked on Sim** (needs her answer, her device or her yes).
Sizes: **S** under an hour, **M** a few hours, **L** a day or more, or risky.

## The short answer

The pages are built and on the Preview. What stands between today and the switch is mostly not pages. It is plumbing:

1. **GitHub's checks are red on the branch, and the code-test job runs out of time.** Last fully green run on claude/design6:
   run 1301 (Nov 17). Since then every finished run failed or was cancelled. The "code tests" job hits its 35-minute limit, so the
   last checks in it (golden, same-grade, plan-cache-test) often never run.
2. **Main and the branch have split.** main has 33 commits the branch lacks (data fixes, op.gg pause, player-ID key name, model v7,
   live-data audits). A trial merge gives 28 conflicts, including both workflow files.
3. **After the switch, a red new-site check would freeze the live data.** Promote to live needs the whole test workflow to pass.
   The branch's workflow adds the new-site jobs (including a 55-minute quality check), so any flake holds back the daily data.
4. **Nothing tests the new page with today's data.** The "data checks (today's data)" job still builds and tests the old page only.
5. **News on the new site will not update by itself.** post-news.mjs edits app/src/data/post.js, which is built into the page. The
   daily refresh only writes the 15 meta documents, so new headlines reach players only when the page is republished.
6. **The switch publish must remove the old sprite files.** The live artifact holds 359 files. The new build adds 352. Together
   that is 711, over the 511-file cap per version, so the publish has to drop the 345 old sp/*.webp files (the new page doesn't use them).
7. **Sim's own look** at the new Home (The Stampede), Mystery Gifts, News and the Nov 18 changes, on her devices, and her explicit yes.

## 1. Pages

Checked: the Plans page source (docs/foundation-plan.html at 9eda3209, steps s1p and s1a), its tick database (collection "progress",
read with ArtifactData), the code in app/src/v2/pages/, git log for Nov 18, docs/rebuild/morning-questions-nov18.md.

Sim answered every morning question "recommended for all" on Nov 18. Several Plans notes still say "waiting on Sim" for those. They are stale:
the Home tools items 3a/3b (the "after" pictures were already the built state), the Gifts lone 7th stamp (kept, centred), the Gifts sources
(9a-9e committed: 890f6f2b, f48ea276, 90d9fced, c5fe9224, 5e5caa48), the menu place (1f: Search, menu keeps five places, 017483b0),
All Suggestions (C built, ba9ef1ba), Auto theme (f1dd9cbb), Build extras (b99f6cac), Remove/Replace (B, Preview v200), My Team C.
Many of these Plans steps are also unticked in the database although done (np-mt-c, np-a1, np-cols, np-allsugs, pg-* rows have no
ticks at all). **Open, S:** tick them and trim the stale notes.

| Page | Built | On the Preview | Sim's look | What is truly open |
|---|---|---|---|---|
| Home: The Stampede | done (stampede*.js) | done (v204) | **blocked on Sim**: new since her Nov 17 device review | **open, M:** run 1351's quality check has 42 new findings, all on Home; v2-minors "receipt band names 8px apart" (1100, 1920) and "Build Me a Team on 2 lines at 360 with a classic scrollbar" fail; v2-unbounded flagged 13px Unbounded "Rillaboom" tags (run 1340). No height limit in the C13 check (see section 6). |
| Mystery Gifts: The Post Room | done (postroom.js, post-data.js) | done (since v202) | **blocked on Sim**: new | Data is hand-kept in post.js; codes are manual by design (docs/legal-sources.md 2-outlet rule). |
| News: The Champions Dispatch | done (dispatch.js) | done (since v202) | **blocked on Sim**: new | Daily update path missing at the switch (Data item D3). |
| My Team (+ Team Sheet, Saved Teams, Share) | done | done | done for the pre-Nov 18 version; C layout needs her look | **open, S-M:** v2-minors "My Team at 390 is at most 4.3 screens" fails (4.47 screens, 3,769px; runs 1343 and 1351). |
| All Suggestions | done (option C) | done (v204) | needs her look | **open, S-M:** v2-minors AS-9 fails: the sheet is 5.46 phone screens at 390 (mock-up 4.27; run 1351). |
| Pokémon page | done | done | Base Stats A needs her look | none known |
| Build | done | done | extras need her look | Two-weather warning left out on purpose (Sim's Q13d B). |
| Battle (+ Practice, Test Run) | done | done | done (Nov 17) | Tap-to-pick grid is planned for right after Step 1's checks (pr-4a), not a switch item. |
| Speed Tiers, Damage Calc, Type Chart, Compare, My Box | done | done | done (Nov 17) | none known |
| Meta (Ratings, Usage, Sets, Winning Teams, Events, Archetypes) | done | done | done (Nov 17) | none known |
| This Week, Track Record | done | done | done (Nov 17) | Track Record shows the new tier groups only once main's data job has the 3h change (Data D2). |
| How We Calculate, About, Legal + Privacy, Feedback, empty/loading | done | done | done (Nov 17) | **open, S:** About still says op.gg is "Read once a day and credited here, as op.gg asks" (app/src/app/56-about-data.js:12). The read is paused on main since Nov 18 (cfa6451e). |
| Header, menu, phone bar, search, footer | done (Auto theme added) | done | Auto needs her look | none known |

Preview check (Artifact list, scope files, Preview artifact 8KBkk7PtbGjVzLzLKK5akf): 403 files, including foundation.html, v2.js,
preview.json, 7 fonts and 350 v2art files (346 sprites + 4 crowd sheets). Checked.

## 2. Tests

### What GitHub runs on claude/design6 today
Checked: .github/workflows/test.yml at 9eda3209 and the Actions API for the branch.

| Job | Time limit | Blocks the workflow? |
|---|---|---|
| new site behaviour (A-team, B-build, C-battle, D-meta-shell) | 35 min each | yes |
| new site behaviour in Safari's engine (A-team) | 35 min | no (continue-on-error) |
| new site full quality check (every page and view) | 55 min | yes |
| code tests (frozen data): run.mjs (old page), 20 new-site checks, the logic checks | 35 min | yes |
| data checks (today's data): run.mjs, threat-check, lead-logic, golden, all on the OLD page | 35 min | yes |
| accuracy-gate | 40 min | yes |

### Results
Latest run: **1351** (run id 44356364869, commit ed5bd627, the newest commit that touches tested paths; later commits are docs only,
so no run). Checked through the Actions API and each job's log. Last fully green run on the branch: **1301** (d3cf4ed0, Nov 17).

| Job | Run 1351 | Failing tests and cause |
|---|---|---|
| behaviour A-team | success | |
| behaviour B-build | success | |
| behaviour C-battle | success | |
| behaviour D-meta-shell | success | SHELL-17b and SHELL-18 now count as known (they failed in run 1343 before ee0e8d8b) |
| behaviour, Safari's engine (A-team) | failure (does not block) | **PKMN-01** "A Pokémon tapped on Home opens its page": "nothing to tap: Pokémon Kingambit". Passes in Chromium. Cause unsure: Safari only, on the new Home. 137 pass / 1 FAIL / 4 known. (Run 1348 also had **SUG-05** "toast has no Undo", a Safari-only flake seen since Nov 17.) |
| full quality check | **failure** | 42 NEW findings, all on **Home** (the rest of the site matches the known list). Kinds: "Got It" tap 39x44 (6), "The Champions" x "Dispatch" overlap (6), hero names over their scores (Sneasler, Rillaboom, Kingambit, Incineroar x 97/96/95: 10), "Sharply raise" x "your win rate." (4), "13,631" x "tournament teams" and "115" x "events" (4), "Your Strength Score" x "94" (2), sizes off the scale 37.2 / 36.2 / 31.2px ("Call six out of the herd.", "/100", "97": 8). Widths 320, 390, 820, 1280, 1920, day and night. Cause: the Nov 18 Home work (welcome card, Post X, Tools B, hero) after the known list; each needs a look (real or line-box false alarm). |
| code tests (frozen data) | **cancelled at its 35-minute limit** | Ran: run.mjs (old page) passed, v2-guard, no-names, v2-caches, v2-folds, v2-redraws, v2-trwarm passed. **v2-partial**: "Home: the belt says 'Strength Score so far' for a 3-Pokémon team" (the new Home no longer has the old belt; the check still looks for it). **v2-minors** (cancelled mid-way after 21 minutes, 254 passes so far): "Audit v199 #13 Grandstand numbers line up" (worst 16/16/16 px), "SUGG-09 ... 4x slower CPU" (under the finger moved: 35 working frames, 18 with a new Apply), "My Team at 390 is at most 4.3 screens" (4.47, 3,769px), "Stampede polish 2 receipt band names 8px apart" (1100 and 1920), "AS-9 sheet is 5.46 phone screens" (mock-up 4.27), "HQ polish 1: Build Me a Team on 2 lines at 360 with a classic scrollbar". **Not run at all** in 1351: the rest of v2-minors, v2-unbounded, v2-sixof, v2-shown-score, v2-ckwin, v2-paste, share-fz, data-swap, forms-contrast, tap-size, tokens-doc, perf-docs, test-ids, v2-public, v2-words, replays, tour-modes, post-data, speed-check, calc-check, legality-check, threat-check, fields-audit, suggest-gaps, suggest-audit, build-logic, lead-logic, sync-logic, typing-sync, sync-quiet, golden, same-grade, plan-cache-test. |
| data checks (today's data) | success | (old page only) |
| accuracy-gate | success | |

Earlier full results for the steps 1351 never reached (run 1340, 1dd6c559, which finished after 34 min 47 s): v2-unbounded failed
("1 new kinds of text in Unbounded under 15px", .sds-tk .sds-tg.u 13px "Rillaboom" on Home); tokens-doc failed ("design-system.md is
out of date with tokens.css"); v2-public, tour-modes, post-data-test, golden ("10 of 10 known-answer cases pass"), same-grade and
plan-cache-test passed. So golden and the logic checks were last seen passing on the branch on Nov 18 (run 1340), not on today's head.

### What the switch itself needs from the tests
1. **Code tests job over its time limit (blocker, open, M).** Checked: in runs 1331, 1334, 1336, 1343 and 1351 the job ended "cancelled" at
   35 minutes (1343: log ends "The operation was canceled." after sync-quiet, so golden, same-grade and plan-cache-test did not run).
   In run 1351 it was cancelled inside v2-minors, which alone ran over 21 minutes, so none of the logic checks ran. In run 1340 it
   finished after 34 min 47 s. Main's job has no new-site steps and fits.
   Fix: split the new-site steps into their own job (or raise the limit). Why it matters: a cancelled job fails the workflow, so
   Promote never moves live.
2. **Promote and the new-site jobs (blocker, open, M, needs Sim's choice).** promote.yml (main) moves `live` only when the whole
   "Test NastyPlot page" run succeeds. After the merge, the daily data's test run would include the four behaviour jobs and the
   55-minute quality check. One flake or one real new-site finding (on frozen data, so not caused by the day's data) would keep players
   on old data. Options: keep the new-site jobs as push-only checks on code changes (skip them for the workflow_run trigger), or keep
   them blocking. Recommended: skip them on the data-only trigger. Why: they run on frozen data, so a daily data run can't change their
   result, but they can still time out or flake.
3. **No check of the new page with today's data (open, M).** Checked: the data-checks job runs `node app/build.mjs` and
   `app/test/run.mjs`, which builds and loads dist/page.html (run.mjs line 8-10). After the switch the live page is the new one. Add a
   new-page smoke on today's out/ (for example data-swap.mjs and v2-public.mjs with the real data, plus a page-load-without-errors check).
4. **The logic checks still go through the old page (keep until R6, open, L later).** golden, same-grade, suggest-audit, build-logic,
   lead-logic, sync-logic, threat-check and accuracy-gate all load app/dist/page.html and hook `render();setView(view,false);`
   (checked by grep). They test shared logic, so they stay valid after the switch, but the R6 clean-up (deleting the old page) breaks
   them all. They need moving to the new page before the old code is deleted, not before the switch.
5. **Sync on the new page (unsure).** sync-logic.mjs ("account wins on first load", saved-data.md 6.2 risk 9) runs only on the old page.
   The persistence code is shared (03-persistence.js is in parts-v2.json), and behaviour tests X-01, TEAM-11 and others check account
   saves on the new page. Whether "account wins on first load" is tested on the new page: unsure, no such test found by grep.
6. **The --split build is not tested in CI (open, S).** The live and Preview builds use --split (v2.js beside the page).
   app/test/v2-split.mjs and v2-planner.mjs exist but no workflow runs them (grep: 0 matches in test.yml).
7. **Known lists to retire (open, S).** known-v2.json still marks SHELL-17b and SHELL-18 "waits on the Home rework" although the welcome
   card and What's New are built (stampede-six.js:56-63, stampede-post.js:18-36). SHELL-17b taps "Copy a top team"; the button reads
   "Copy a Top Team". Fix the test or the words, then remove both marks. Other known entries: B-build 13, D-meta-shell 42, A-team 3, each
   with a reason (old-design expectations, sorted Nov 17-18).
8. **Quality-check known list (done, with a note).** app/test/qcheck-known.json holds 147 judged findings: Damage Calc 100, Gifts 42
   (added Nov 18, ee0e8d8b, "judged as intended"), Type Chart 5.
9. **Merge both workflow files with care (blocker, open, M).** See Data D1: main's test.yml has the live-data audits job (5b8b0215) and
   main's update.yml has the op.gg pause and the player-ID key fallback; the branch's copies have neither.

## 3. Data and build

### D1. Bring main and the branch together (blocker, open, L)
Checked: `git rev-list --count origin/claude/design6..origin/main` = 33; `git merge-tree --write-tree` = 28 conflicts:
both workflow files, 8 old-site source files (09-quick-add, 60-concept-h, 63-method, 63-weekly, 74-arena, 75-arena-team, 76-slide,
76-team-sheet, head.html), 14 behaviour-test files (add/add), and out/events.json, out/model.json, out/track.json.
Things that must survive the merge, each checked with `git diff origin/main origin/claude/design6`:
- From main: the op.gg pause in update.yml and health.mjs (the branch re-enables `node opgg.mjs`); `secrets.NP_PID_KEY || secrets.THE_NP_PID_KEY`
  (the branch has only NP_PID_KEY; Sim saved the key as The_NP_PID_Key); model v7 teamHalf (model.mjs, model-settings.json);
  the themed-event filters and one-spelling fix (events.mjs, formats.mjs, names.mjs, update.mjs canonSet); the live-data audits job;
  the M-D date guard (d0662883); today's data in out/.
- From the branch: package.json + package-lock.json (`npm ci`; main installs packages by name), megaN in update.mjs (Build's Megas tip),
  Whole Protect family in model.mjs (3h), Track Record bands in track.mjs, 12 weekly movers, ckwin-snapshot.mjs + its update.yml step,
  data-docs.mjs, every app/src/v2 file and the new-site tests.
- The model files: the branch's out/model.json was refit with the Protect family; main's with teamHalf 0. After the merge the model must
  be refit once with both, then pass the gate and golden. Unsure how the two changes interact; not measured.

### D2. Main's daily job for the new site (open, M; most of it is D1)
- **megaN for the Build tip:** in the branch's update.mjs only (`results.megaN`, checked: 0 matches in main's update.mjs). Without it the
  tip hides itself (build-sheet.js V2.bpMegaShare returns nothing when megaN is missing). Not a crash.
- **ckwin:** the branch's update.yml runs ckwin-snapshot.mjs; main does not (held back Nov 18, decisions: main's page doesn't read it).
- **3h (Protect family, Track Record tier groups, recent winners):** Sim decided Nov 17 it goes live with the switch (Plans ar-main-model).
- **post-news.mjs:** not in either update.yml (checked by grep). decisions.md (Nov 18 entry on the news feed wiring) says add
  `node post-news.mjs || node skip.mjs ...` to update.yml and post-news-test.mjs to test.yml at the switch.
- **--split build and art:** nothing in the daily job builds the page; the page is published by hand (or by the session). No change needed
  in the daily job for these.

### D3. News and gifts reach players only on a republish (blocker for "News updates daily", open, M; needs a choice)
Checked: post.js is a build part (parts-v2.json line 45); the "NastyPlot data refresh" scheduled task writes only results, perf,
doubles_tour, teams, history, model, doubles, doubles_ingame, events, track, practice, weekly, calendar (its prompt); META_KEYS in
03-persistence.js has 15 keys and no post. So post-news.mjs updating post.js on main changes nothing on the live page until someone
republishes it. Options: (a) a 16th daily document meta/post written by the refresh task and read by post-data.js, or (b) a scheduled
republish. Recommended: (a). Why: it uses the same tested path as all other daily data, with no page publish.
Gifts' live/ended state is worked out from dates in the browser, so it stays right without a republish; new gifts and codes still need one.

### D4. The switch publish itself (open, M)
Checked: live artifact 5VBfLTR5sM4JU5NswJYyGk lists 359 files: index.html, 13 fonts, 345 sp/*.webp. Its stored declaration:
contract 0.2.90; capabilities db (6 rules: root read view / write admin; data/users/{self} write interact; usage and feedback owner-only
with {self} read/write interact), downloads, mcp (Claude Code Remote fire_trigger), sample (images), user.
- **File count:** public build made in a scratch worktree with `node app/build.mjs --v2 --public --split --one-art-size --art=v2art/`:
  dist/v2.html 686,593 bytes, dist/v2.js 1,899,547 bytes, dist/fonts 7 files; art = 346 sprites + 4 crowd sheets. With the page that is
  359 files to publish. Files left out of a publish are kept, so without removing the old ones the version would hold 359 + 352 = 711
  (fonts overlap), over the 511 cap. The publish must pass null for the 345 sp/*.webp (and the 6 old Archivo / Dela Gothic / italic
  font files if wanted). Checked the new page doesn't need sp/: the shared share-image code asks window.__SPR first, and team.js:290
  points __SPR at the new art.
- **Name of the page:** the live artifact's page is index.html; the build writes dist/v2.html. It must be published as the page itself.
- **Capabilities:** the new code uses use('db'), use('user'), use('downloads') only (grep). Keep the same declaration (the db rules are
  not in the repo; saved-data.md 6.2 risk 11). mcp and sample are declared but unused by both pages (grep found no use).
- **Rollback (open, S):** the plan says "old build ready for an instant rollback for two weeks". Rollback = republish main's old page with
  its sp/ files (or restore the artifact's previous version). Not written down as steps and not rehearsed. Write the exact steps and
  keep the old build's file list.
- **Same URL, same keys:** saved-data.md 6.1 contract. Theme carries over (head.html reads np2.theme, then today's cc2.theme). Checked by code.
- **What's New at the switch (open, S, needs Sim's words):** stampede-post.js V2.SD_NEW reuses today's WHATS_NEW id and its six old items.
  Returning players who dismissed today's What's New will see nothing about the new design. docs/rebuild/whats-new-draft.md (Nov 12) is
  stale (it describes the old new Home; no Gifts or News). Needs a new id and new items, approved by Sim.

### D5. The public (non-Claude) site (January; not a switch blocker)
Checked by grep: window.claude is used by 03-persistence.js (saving, sync, daily data), 51-usage.js, 53-feedback.js, owner.js,
team.js (downloads) and thisweek.js. With no window.claude the new page draws with its built-in data (shell.js:369), so a public build
needs: a data source (the out/ files served as static files), saving without accounts, anonymous feedback and usage elsewhere, the
download path, both sprite sizes (no --one-art-size; art-s/ has 346 files), and the Events "Add to calendar" (pr-4e). All are Step 4.

### File counts (checked)
| Thing | Count |
|---|---|
| app/src/v2/art | 352 entries: 346 sprites, 4 crowd sheets, crowd.json, meta.json |
| app/src/v2/art-s (240px, public site only) | 346 |
| app/src/v2/fonts | 7 woff2 (+ 2 licence files, fonts.css) |
| app/sp (old site sprites) | 345 |
| Live artifact today | 359 |
| Preview artifact v204 | 403 |
| New live build to publish | 359 (page, v2.js, 7 fonts, 350 art) |

## 4. Features ("never remove functionality")

Checked: app/test/behaviour/known-v2.json (all 58 entries read), docs/rebuild/parity-nov15.md, research/old-checklist-recheck-nov18.md,
and the code for each claim below.
- Every known-v2 entry is labelled (b) a deliberate change Sim approved or a wording difference, (c) a test-tool gap, or "moved" to
  another page. No entry is marked as a missing feature. Two are stale (SHELL-17b, SHELL-18, see Tests 7).
- parity-nov15 "still open" 1-5: 1 and 2 done (Nov 15), 3 done (All Suggestions C, Nov 18), 4 done (Count Abilities in the sheet,
  sugs.js:17), 5 (a core's "% of all teams" for touch screens): **open, S, a design choice for Sim** (parity-nov15 item 5). Checked:
  build.js:107 still puts it only in a `title` (hover) on the core's win figure, which touch screens can't show.
- Old checklist i15 (Build extras): catch tip, not-in-box lines, plan chips and the proven-team note are back (build-sheet.js:27-63,
  b99f6cac); Megas tip back but needs megaN from main's data job (D2). Two-weather warning left out by Sim (Q13d B).
- i39 Report a Mistake: done. feedback.js:25 adds the hidden numbers (ctxNums) to the sent entry; feedback.js:42 (Nov 18, OL-i39). Checked by code, not on the page.
- Features of today's live site that change on purpose (approved): Darkrai gone (underdog instead), no ⋯ menu, the info sheet became
  the Pokémon page, the welcome card's words. These are recorded in known-v2.json with the decision dates.
- Things the old live site shows that the redesign shows differently with data from main: Track Record groups, recent winners, the
  Megas tip. They need D1/D2, not page work.

## 5. Privacy and safety

| Rule | Status | Evidence |
|---|---|---|
| No names collected (COPPA) | done | feedback.js: one textarea, no name or contact field; "We never ask for your name or email" on the page; fbScrub removes emails, phone numbers and @handles; entry stores the date only (feedback.js:3-25). |
| No player names in data | done | `node app/test/no-names.mjs app/dist/v2.html` on the public build: "1083 player fields checked, 0 not an ID or stand-in" and "no embedded Preview data". main's daily job stores player IDs (scrub-names.mjs, 4101e0eb). |
| Event names with organiser handles | done (by code) | Home and News use V2.evTitle (stampede-six.js:95; dispatch.js). |
| "Show email" | done | about.js:24-27: the address is put together only on the tap. Behaviour ABOUT-03 passes (run 1343, D-meta-shell log). |
| No Google Fonts | done | build.mjs throws if a Google Fonts link appears; fonts are self-hosted. |
| Free text can still hold a child's name | known, accepted risk | saved-data.md 5, flags 2-3 (feedback notes, team names). Same as today's site. |
| db rules not in the repo | open, S | saved-data.md 6.2 risk 11: publish with the exact declaration read above. |
| Repo is public | decided | Sim, Nov 17: keep history as it is (Plans ar-w-public). |
| op.gg credit line | open, S | About text, see Pages. |

## 6. Anything else that could block or risk the switch

- **Reg M-D starts Dec 2 (risk, M).** rebuild-plan.md: if the rebuild is not live by about Nov 28, switch today's site to M-D data first.
  The crowd sprite sheets (crowd.json, crowd-0..3.webp, made by experiments/v2-crowd-sheets.py) and the 345/346 sprite sets cover today's
  roster only: any new Pokémon in M-D needs new art, a regenerated sheet and the page republished. The Dec 2 balance patch (Plans
  patch-dec2) also needs move data regenerated and a republish.
- **Rule holes (risk, M).** research/rule-holes-nov18.md: 10 holes in the team rules on real teams (for example double weather reads as
  "no speed control" on 104 teams, 12 winners). They are shared logic (they affect today's live site too), so they are not switch
  blockers, but fixes land on main and must be merged into the branch before the switch (D1).
- **op.gg data going stale (unsure, S).** The ingame part of perf drops out of the page after 4 days (PERF_MAXAGE ingame: 4) now the read
  is paused. How the new Usage page and its "Ranked ladder" source chip look with no ingame data: not checked.
- **Performance vs today's live site (unsure, M).** R5 asks for "at least as good as the baseline". Measured (first-visit-nov18.md): My Team
  on 4G 2,968 ms main content; Home 3,326 ms; the crowd now comes from 4 sheets (05ce06c6). No side-by-side measurement against today's
  live page was found.
- **Page heights for the new pages (open, S).** experiments/c13-check.mjs has no limits for Home (Stampede), Gifts or News (grep), and
  docs/rebuild/page-heights.md was last changed Nov 15. RULES C1/C13 ask for both.
- **Fresh outside audit score (open, M).** Plans np-polish: audit v199 items #10 (text behind the phone bar), #17 (Track old groups;
  fixed by D2), #22 rest, then a new score. The last score is 15/20 (Nov 17), before The Stampede, Gifts and News.
- **iOS 18 jump after Apply (blocked on Sim, S).** Plans ar-s-ios18: needs her iPhone.
- **Full check on Sim's PC (blocked on Sim, M).** Plans gp5-full (docs/rebuild/gpu-jobs.md).
- **Older "those are good" items and Megas ranking tick (blocked on Sim, S).** Plans ar-w-good, ar-w-i45.
- **Helpers and work in flight.** Rule-hole fixes and the Weather Ball rule are being built now (decisions.md, Nov 18). Each new commit
  restarts the GitHub run (concurrency cancels the older one): runs 1342, 1344-1348 were cancelled this way. A quiet period is needed to
  get one fully green run on one commit before the switch (Plans d4-check).

## Shortest safe order to finish

1. Tick the done Plans steps and trim stale notes (S). Fix SHELL-17b/18 and retire their known marks (S). Fix the About op.gg line (S).
2. Split the code-tests job so it finishes inside its limit; add v2-split.mjs to it (M). Push once; let one run finish untouched.
3. Fix whatever run 1351 still shows red (see Results), one item at a time with a test that fails before (M).
4. Rehearse the merge on a scratch branch: main into a copy of claude/design6, keep both sides' fixes listed in D1, refit the model
   once, run every check (L). Decide with Sim how the new-site jobs block Promote (Tests 2), and add the new-page data smoke (Tests 3).
5. Decide the News update path with Sim (D3) and build it on the branch, with post-news wired into the rehearsed update.yml (M).
6. Write the What's New entry for Sim's words (S) and the publish + rollback steps with the exact file list and the null list for sp/ (S).
7. Measure page heights and first-visit speed for Home, Gifts and News against the live site; fresh outside audit (M).
8. Preview with everything; Sim's device review of The Stampede, Gifts, News and the Nov 18 changes, including iOS 18 (blocked on Sim).
9. One fully green GitHub run on one commit of the merged code; Sim's PC full check (gp5-full).
10. Sim's explicit yes, told exactly what changes. Then: merge to main, wait for its run and Promote, publish the live page with the same
    capabilities, check the file list (359 files, sprites and fonts), open it on phone and desktop, keep the rollback ready two weeks.

## Open items by area

Each item appears once, in the area where it is listed above.

| Area | Open (Claude) | Blocked on Sim | Items |
|---|---|---|---|
| Pages | 5 | 1 | Plans ticks and stale notes (S); About op.gg line (S); My Team 4.47 screens (S-M); All Suggestions 5.46 screens (S-M); Home quality findings and Home checks (M) / Sim's device look at Home, Gifts, News and the Nov 18 changes |
| Tests | 11 | 1 | code-test time limit (M); new-page check on today's data (M); SHELL-17b/18 (S); v2-partial belt check (S); v2-minors Grandstand #13 and SUGG-09 at 4x CPU (M); tokens-doc (S); --split not in CI (S); Safari PKMN-01 (S, cause unsure); account-wins-first-load on the new page (S, unsure); logic checks off the old page before R6 (L, after the switch); one fully green run on one commit (M) / how new-site jobs gate Promote |
| Data and build | 5 | 2 | merge main and the branch (L); refit the model after the merge (M); main's daily job: megaN, ckwin, 3h, post-news (M); publish file list with sp/ removed and capabilities (S); rollback steps (S) / News update path (D3); What's New words |
| Features | 0 | 1 | / a core's "% of all teams" on touch screens |
| Privacy and safety | 0 | 0 | All rules hold on the new build; the db-rules and op.gg points are counted under Data (publish) and Pages (About) |
| Anything else | 5 | 3 | Reg M-D art and timing (M); rule-hole fixes merged before the switch (M); op.gg data going stale on Usage (S, unsure); speed vs today's live site (M, unsure); page heights and a fresh outside audit (M) / iOS 18 check; full check on Sim's PC; older "those are good" items and the Megas ranking tick |
| **Total** | **26** | **8** | |

Top blockers, in order of risk: the code-test job running out of time (no logic check has run on today's head), the 28-conflict merge
with main (op.gg pause, player-ID key, model v7 must survive), Promote freezing live data on any new-site flake, no news update path
without a republish, and the 511-file cap at the publish.


## Added Nov 18 afternoon (main thread)
- News/Gifts daily doc built (8247618d): out/post.json -> meta/post -> V2.postTake. AT THE SWITCH: the 'NastyPlot data refresh' scheduled task must also download out/post.json and set meta/post (or its _2 parts if split-docs names it), and add 'post' to its split-name list. Until then the page shows the built-in POST.

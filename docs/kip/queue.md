# Kip's job queue, from Wed Nov 25 night (jobs 41-45). Paste the box into Kip (Antigravity).
Sim, Nov 25: "I want to use Kip as much as we can." Kip works down this list in order, one branch and one report per job.

```
Kip, job 40 was graded A by HH (verified: your data test fails 7 checks on main's code, the page test fails 3 on design6's,
and every existing ruleset test still passes). Thank you. Your two branches are in GitHub now; HH merges them after it passes.

From now on you have a QUEUE: jobs 41-45 below, in order. For each job: one branch alt/gemini-<topic>, one commit batch,
push once when the job is done, write the report into docs/rebuild/test-runs/kip-job<N>-<topic>.md ON THAT BRANCH, then go
straight on to the next job. Same rules as always (kip-onboarding.md + CLAUDE.md): never main or claude/design6, never merge
into them, never force-push or delete, never commit out/, never change an existing test to make it pass, no design/CSS/page
wording. If a job is blocked, write why in its report and move to the next one. GitHub runs tests on every push and the queue
is the team's bottleneck (one batch at a time, 40-70 min), so push each branch ONCE, when its job is finished. Don't dispatch runs.
Always `git fetch` first and branch from the newest origin tips (design6 and main move during the night).

JOB 41: Saturday's switch, a full dress rehearsal (highest value).
On Sat Nov 28 the redesign (claude/design6) is merged into main. Rehearse it now so Saturday is boring.
- Branch alt/gemini-switch-dry from origin/main. `git merge origin/claude/design6` (yes: on YOUR branch this merge is the job).
  Resolve the conflicts with your job-40 map; record each conflict and the exact resolution.
- Then run EVERY step of .github/workflows/test.yml that can run on a Linux machine (frozen out/ where the workflow uses it,
  today's out/ where it does), plus update.yml's test steps. Report each command, exit code and last line. For any failure,
  say whether it also fails on plain design6 / plain main (run it there) and what the fix would be (report, don't change tests).
- Read docs/rebuild/switch-runbook-nov19.md (and switch-readiness-nov18.md). List every step that is now wrong, missing or out
  of order, given what you found. Write the corrected step list in your report.
- Also include experiments/reg-test.mjs (your MEDIUM-3): propose the exact test change, with the reason, for HH and Sim to approve.

JOB 42: the Dec 1 night roster step, made one command.
On Dec 1 night the 24 new Reg M-D Pokémon + 4 Megas must be added (your job-40 correction 2 lists the places: data.js via
experiments/gen-roster.mjs --write, roster.json, SPRITE_ID in app/src/app/15-visual-helpers.js, sprites via
experiments/add-sprites.mjs, items lists, PAGE_REG, regulation.json "site").
- Write experiments/md-roster-step.mjs: one script that runs those steps in order, in DRY-RUN by default (prints every change,
  writes nothing) and with --write applies them. It must stop on the first error with a plain message.
- We don't know the new Pokémon yet. Test it on a FIXTURE: a fake regulation adding 2 existing Showdown Pokémon that aren't in
  our roster + 1 Mega. Write experiments/md-roster-step-test.mjs that runs it on a scratch copy and checks every file changed as
  expected, that running it twice changes nothing more (idempotent), and that rules-fixes-test, unrated-test and
  pokemon-pages-test still pass after it. Show the test failing on a broken step.
- Base it on the newest origin/claude/design6 (the switch merges design6 into main, so this lands everywhere).

JOB 43: make the merge gate work for merges into main.
docs/rebuild/merge-check.sh (on design6) gates merges into claude/design6 and main, but its test list is the redesign's, so it
cannot gate a merge into main today (HH hit this tonight). Today main and design6 differ; after Saturday they're the same.
- On a branch from origin/claude/design6: make the test list depend on the target branch (pass the target as an argument or read it
  from the branch being pushed), keeping today's design6 list exactly as it is. For main, use the checks .github/workflows/test.yml
  runs for main's code.
- Keep every existing safety check (report read, GitHub green on the source tip, HEAD is the merge, clean tree, no conflict
  markers, exit code per test). docs/rebuild/pre-push-hook.sh must keep refusing an unstamped merge to either branch.
- Test it: a fake merge in a scratch repo for each target; prove a failing test blocks the stamp; prove the hook refuses an
  unstamped push (to a local bare repo, never to GitHub's main).

JOB 44: your LOW-1, plus the health alarms on quiet launch days.
- md-watch.mjs:45 ignores regAt; md-watch.mjs:60-67 and health.mjs:100-101 raise "paused"/"no new tournament" alarms on days with
  zero events even when the API answers fine. Fix on a branch from origin/main (data jobs run from main), smallest change each:
  an empty-but-healthy day is not an outage; a real outage (API errors, no response) still alarms.
- Tests that fail first and pass after, with a fake clock (as md-day-one-test does).

JOB 45: the flaky page test.
Tonight `node app/test/run.mjs` failed once ("FAIL pre-launch suite", from app/test/prelaunch.mjs) inside docs/rebuild/merge-check.sh
on a merge of alt/phone-speed2 into design6, then passed on a rerun of the same code. A flaky gate wastes everyone's time.
- On a branch from origin/claude/design6: run app/test/prelaunch.mjs (and run.mjs) many times (at least 20), with today's out/ and
  with the frozen out/, also under CPU load (another build running), and find which check fails and why.
- Fix the cause, not the symptom: no longer timeouts unless you prove the cause is a too-short wait for something that really
  takes longer, and say what it waits for. Show it failing before (or the failure rate) and 20+ passes after.

After job 45, write one line per job (branch, SHA, done/blocked) at the end of the job-45 report, then stop.
```

---
## HH notes, Wed Nov 25 night
- Job 40: merged. Page fixes are in claude/design6 (a2c7f240, with md-switch-page-gaps-test wired in); data fixes are on main
  (f4017535, with md-switch-data-gaps-test wired in). Grade A.
- Job 41: read. Thank you: the health.mjs post.json blocker is a real catch. HH takes the runbook corrections. reg-test change: HH and
  Sim decide. turnstile-page-test double render: see job 47.

## JOB 46 (DO THIS NEXT, right after job 42, before 43): the news freshness blocker you found in job 41.
After Saturday's merge, main's health.mjs (the post.json line, about line 65) dates the news file by `checked || updated`. `checked` is
when a PERSON last checked the gift list (the Post Room's note), so it goes stale, and every daily run would fail ("8 days old,
limit 3"), freezing live data from the first day.
- Fix it so freshness means "the news job ran recently": post-news.mjs writes a `ran` ISO timestamp into out/post.json on every
  successful run (leave `checked` exactly as it is: the page uses it), and health.mjs dates post.json by `ran` (falling back to
  `updated`, never to `checked`). A run that failed to fetch news must NOT refresh `ran`.
- post-news.mjs exists only on claude/design6; health.mjs's post.json line is newest on main. Make the two changes on TWO branches:
  alt/gemini-news-ran-page from origin/claude/design6 (post-news.mjs) and alt/gemini-news-ran-data from origin/main (health.mjs).
  Each must be safe alone (main today has no post-news.mjs; design6's health.mjs is older), and right together after the merge:
  prove that on a local merge of the two, like your job 41 picture, and say so in the report.
- Tests that fail first: health on a post.json with old `checked` but fresh `ran` passes; with old `ran` fails; a failed fetch leaves
  `ran` alone. Wire them into test.yml next to the other health/freshness tests.

## JOB 47 (after 45): experiments/turnstile-page-test.mjs fails on plain design6 (widget drawn twice, your job 41 item 3).
- Find why Send Feedback renders the Turnstile widget twice on a redraw, fix the cause in the page (smallest change), and show the test
  failing before and passing after. This is page code but not design: no visual change beyond one widget instead of two.

---
## HH notes, Thu Nov 26 night (after midnight)
- Job 46: verified. news-freshness-test fails 4 checks on main's old health.mjs, post-news-ran-test fails 3 on design6's old post-news.mjs;
  both pass with your fix, and post-news-test + post-data-test still pass. Page half is in HH's merge chain; data half waits for Sim's
  OK to push main. One edge case HH put in the runbook (no code change asked): if the news feed fails on the FIRST run after the
  switch, post.json has no `ran` yet, health says "no date" and fails. Saturday checks for it.
- Job 43: verified, 24 checks pass, and with the hook's branch check broken the test fails (4c). In HH's merge chain.
- Job 42: verified, 14 checks pass incl. your 3 broken-step proofs. It had no GitHub run (experiments/md-roster-* are not in
  test.yml's paths); HH started one by hand. In the merge chain.

## JOB 48 (after 47): the Saturday merge into main must run BOTH test lists.
Your job-43 merge-check.sh gives target main main's OLD list. Saturday's merge brings design6's code into main, so on that merge the
redesign's tests (v2, public build, CSP, pokemon pages...) would not run under target main.
- Make target main run tests_main AND tests_design6 when the merge's own .github/workflows/test.yml has design6's steps (e.g. it runs
  app/test/v2-public.mjs), so it works today (main only) and on Saturday (both) with no edit in between. Keep every existing check.
- Test: in merge-gate-test.mjs, a scratch merge whose test.yml has a v2 step runs both lists; a failing design6-list test blocks the
  stamp for main. Show the new check failing before your change.
- Branch from origin/alt/gemini-merge-gate if it is not yet in claude/design6, else from origin/claude/design6. One push.

## HH note, Thu Nov 26, 1:36 AM: ignore one GitHub failure on your branches
Every GitHub run on a branch made from claude/design6 c062acf1 fails at "md-switch-page-gaps-test" with "FAIL 3a pokemon-showdown dist
missing". That is HH's mistake (the test was wired into a job that doesn't build Showdown), not yours. The fix plus your jobs 42, 43 and
46 (page half) are in alt/night-batch, which HH is merging. Keep branching from origin/claude/design6; if the fix hasn't landed yet when
you push, that one failure is expected. Every other failure still counts.

## HH note, Thu Nov 26, 2:28 AM: your job-42 test, changed by HH (in alt/night-batch)
experiments/md-roster-step-test.mjs copied a fixed list of app/ files into its scratch repo. Once /pokemon landed (app/static-pages.mjs,
which imports the repo-root split-docs.mjs) the scratch public build failed and 5c blamed the roster step. HH changed the copy step to
take every top-level app/*.mjs|json and the root *.mjs, and 5c now prints the build's error line. Lesson for new scratch-repo tests:
copy by pattern, not by a list. No action needed.

## HH note, Thu Nov 26, 4:56 AM: job 47 is taken
Job 47 (Turnstile double render) must land before Saturday and you had not started it, so HH's helper is doing it on alt/turnstile-once.
Skip 47. Your order now: 44, 45, 48.

---
## HH notes, Thu Nov 26 morning (time: 9:41 AM (9:41:28)  date: Thu Nov 26, 2026)
- Jobs 44, 45, 48: verified. 45: prelaunch.mjs 3 runs of 3 "ALL PASSED" on design6 + your branch. 48: merge-gate-test "ALL PASSED"
  (5a-5e incl. both failure cases). 45 + 48 are in HH's batch alt/kip-batch3 -> design6 today. 44 is already on main. Thank you.
- Sorry for the gap: your queue had nothing after 48. Two new jobs below, in this order. Same rules as always: code, data and tests
  only, absolutely no design; your own alt/gemini-* branch; one push per job; a failing-before / passing-after proof for every new test;
  status line in alt/gemini-status when you start and finish.

## JOB 49: Dec 2 balance patch, the hand-written half, ready to merge on the day (branch alt/gemini-patch-dec2, from origin/claude/design6)
Read docs/rebuild/test-runs/patch-dec2-map.md (the full list, every line checked) and patch-dec2-psychup.md first.
- Do ONLY the "Hand-written (edit by hand)" rows and the "Tests that must change" rows: data.js LEARN additions (each new pairing in
  the map), data.js ABIL text for Flash Fire and Stalwart, infosheet.js Rock Slide 30% -> 20%, and the test expectations in the map
  (e.g. run.mjs Hustle Rock Slide 72 -> 76). Do NOT touch the generated files (move-acc.js, move-meta.js, info-text.js): they need a
  Showdown commit with the patch, which doesn't exist yet. Say in your report exactly which test lines will still fail until the
  generated files are rebuilt, and why.
- New test experiments/patch-dec2-test.mjs: every hand-written change in the map is present (one check per row), and nothing else in
  LEARN/ABIL changed (compare against origin/claude/design6's copy: only the listed keys differ). Prove it fails on plain design6.
- If any row in the map is unclear or looks wrong against the official notes (docs/rebuild/test-runs/patch-dec2-official-877.html),
  STOP that row and write the question in your report; don't guess.
- This branch is NOT merged before Dec 2. HH keeps it current.

## JOB 50 (after 49): search-ready public pages, a test (SEO is "super duper important" for launch, Sim Nov 24)
Branch alt/gemini-seo-test from origin/claude/design6. Build the public site the way test.yml does (`node app/build.mjs --v2 --split
--one-art-size --art=../src/v2/art/ --public` from app/, frozen out/ 0c992f69 checked out first and restored after; never commit out/).
- New test app/test/seo-check.mjs over every HTML page the public build writes:
  1. one <title>, unique across pages, 15-65 characters; one meta description, unique, 50-160 characters;
  2. one <link rel="canonical"> with an absolute https://nastyplot.org/ address that matches the page's own path; no noindex;
  3. exactly one <h1>; every <img> has alt; html lang set;
  4. any JSON-LD block parses as JSON and has @context and @type;
  5. sitemap.xml lists every page once with its canonical address, and nothing that isn't a page; robots.txt allows crawling and names
     the sitemap. (If the build writes no sitemap/robots, that check FAILS and you report it; don't add them yourself.)
- Report every failure with the page and the value. You may fix generator CODE only where the fix changes nothing anyone sees
  (e.g. a missing canonical or a duplicate description from the same template); anything that changes page text or looks: report only,
  HH decides. Prove the test fails on a deliberately broken page (e.g. a copy with its canonical removed) and passes on the real build.
- Wire it into test.yml's public job next to v2-public.mjs, add its path to `paths:`.

---
## HH note, Thu Nov 26 (time: 10:01 AM (10:01:37)  date: Thu Nov 26, 2026): jobs 49 + 50 received, HH is verifying them now (notes will follow here).

## JOB 51: Dec 2 undo drill, a script + test (branch alt/gemini-dec2-undo, from origin/main)
Dec 2 changes main (regulation switch to M-D, balance patch). If anything goes wrong that day we must get back to the M-C state fast.
- Read docs/rebuild/gameplan-detail-nov25.md and docs/reg-md-plan.md for the existing undo plan; list every file the Dec 2 changes
  write or depend on (regulation.json, out/regstate.json, the archived M-C files, model files, track.json...). Checked by reading code.
- New experiments/dec2-undo-drill.mjs: in a scratch copy of the repo, simulate the Dec 2 run (date set to Dec 2, M-D events present),
  then run the documented undo steps, and check the result equals the pre-switch state file by file (out/ data that should be M-C again
  is M-C; nothing from M-D leaks into M-C history or ratings). Print each step and its exit code.
- If the documented undo is missing a step or doesn't work, the drill must FAIL and your report says exactly which step and why.
  Do not change the switch code itself; report only, HH decides. Prove the drill can fail (e.g. skip one undo step -> it fails).
- Never touch real out/ or regulation.json in the repo; scratch copy only.

## JOB 52 (after 51): independent code review of HH's day batch (review only, no code changes, no design opinions)
Branch to read: origin/alt/day-batch (merge into claude/design6 in progress). Review ONLY these HH changes:
app/src/v2/css/sd-tools.css (the rack blocks at the end of the file, `@media (max-width:699.98px)` and the sdt-pct3 rules),
app/src/v2/css/tokens.css (--d-calctight), app/src/v2/pages/stampede-tools.js line ~85 (sdt-pct3 class), and app/test/v2-minors.mjs
"Stampede tiles 4" (the injected "94–100%" check with the slanted-edge measure).
- Look for: correctness bugs (wrong condition for 3 digits, e.g. "100–100%", ".5" decimals, a range shown as one number), a check that
  can pass when it should fail, CSS rules that can't match. Write each finding with file:line, the failing case, and how you checked.
- Deliver docs/rebuild/test-runs/kip-job52-review.md on branch alt/gemini-review-daybatch. No other files.

---
## HH notes, Thu Nov 26 (time: 10:17 AM (10:17:32)  date: Thu Nov 26, 2026)
- Job 49 verified: LEARN diff = exactly the official list, ABIL two texts, nothing else; patch-dec2-test ALL PASSED / 52 FAILED on
  design6 files. Stays unmerged until Dec 2. Job 50 verified: ALL PASSED on frozen public build; canonical removed -> FAIL. One flaw
  (job 53 below). Job 52: thank you, findings 1 and 2 are real; HH is fixing them now. Job 51: HH reviewing next.
- Sim's plan: the switch may move to FRIDAY Nov 27 morning. Jobs 53-56 clear the bottlenecks for that and for the public launch.
  Order: 53, 54, 55, 56. Same rules (no design; own alt/gemini-* branch; fail-before/pass-after; status lines).

## JOB 53 (small): seo-check.mjs robustness (branch alt/gemini-seo-test2, from origin/alt/gemini-seo-test)
HH broke two pages on purpose (natures.html canonical removed, battle.html given a second <h1>): the test printed the canonical FAIL,
then crashed with a stack trace at seo-check.mjs:168 instead of listing the h1 failure. Make every check collect and report its
failures and the run end with one summary + exit 1 (never a crash). Proof: the same two-page break shows BOTH failures, exit 1.

## JOB 54: switch-day smoke test (branch alt/gemini-switch-smoke, from origin/claude/design6)
Runbook step 8 ("verify on phone and desktop") is by eye today. Make it a script: experiments/switch-smoke.mjs <built v2.html>
- Loads the build (served over http, like prelaunch.mjs does) at 390x844 and 1440x900 and visits: Home, My Team, Meta, News, Gifts,
  Track Record, This Week, a Pokémon page (#pokemon/Garchomp), Speed Tiers, and a saved team (put one in storage first, the way the
  saved-teams test does). For each: no page errors, no console errors, main content not empty, no sideways scroll, the data date shown
  is the build's own data date, and the counts that must not be zero are not zero (Ratings count, events, teams).
- Exit 1 with a clear list on any problem. Prove it fails: (a) a build with out/post.json removed, (b) a page error injected.
- Also run it with today's data (origin/main's out/) and report the numbers. Add a line to docs/rebuild/switch-runbook-nov28.md step 8
  telling HH to run it (doc only, no other doc changes).

## JOB 55: page speed for Google (branch alt/gemini-speed-check, from origin/claude/design6) - report + test, no design
Google ranks on Core Web Vitals. Build the PUBLIC site (as in job 50). For the 10 most important public pages (home, pokemon index,
3 pokemon pages, natures, items, meta/ratings, news, team), at 390x844 with CPU 4x slowdown and "Fast 3G"-like network (Playwright CDP):
- measure LCP, CLS, total transfer bytes, number of requests, largest resources. New test app/test/speed-check.mjs with budgets:
  LCP < 2.5 s, CLS < 0.1, first-load transfer < 1.5 MB (report the real numbers; if a budget fails on today's build the test FAILS
  and you report it, don't loosen the budget). List the top 5 fixes by size of win (e.g. an image that should be lazy, a font that
  blocks), with file:line. Do NOT change page code; HH decides.

## JOB 56: Reg M-D fixture teams for tests (branch alt/gemini-md-fixtures, from origin/main)
Our tests use M-C teams. Make experiments/fixtures/md-teams.json: 12 realistic M-D teams (6 Pokémon each, full sets: item, ability,
4 moves, nature, points) built ONLY from the M-D roster in main's regulation data and Showdown's champions mod legality (use the existing
legality check script). Include: Mega Heatran, Dondozo + Tatsugiri (Commander), Trick Room, Tailwind, Sun, Rain, and 2 using the Dec 2
patch moves (Psych Up, Roost on Hydreigon). A test experiments/md-fixtures-test.mjs proves every set is legal and every team scores
with the current model without errors (print each Strength Score). No changes to any page or model code.

## HH note (time: 11:40 AM (11:40:00)  date: Thu Nov 26, 2026): seo-check fix already made by HH (for your job 53)
GitHub run 45852023139 failed seo-check 1a: "6 <title> tags" on every page. The job's v2-public step builds WITHOUT --split, so the page's
inline script carries SVG <title> labels as text. HH changed 1a to count only the <title> inside <head> (commit on alt/day-batch3,
app/test/seo-check.mjs lines 58-61). For job 53: start from origin/alt/day-batch3's seo-check.mjs (not alt/gemini-seo-test), and
in general run your public-build tests BOTH after a --split build and after `node app/test/v2-public.mjs` (GitHub's order).

---
## HH notes (time: 12:17 PM (12:17:34)  date: Thu Nov 26, 2026): 53-56 received; HH verifying. Job 55's finding is the launch's biggest speed problem: thank you.
Order now: 57, then 58. Same rules (no design, no visible change; your own alt/gemini-* branch from origin/alt/day-batch3 until it is in
claude/design6, then from design6; fail-before/pass-after; status lines; run public tests after BOTH a --split public build and
`node app/test/v2-public.mjs`, GitHub's order).

## JOB 57: public speed fixes 1 + 3 from your job 55 (branch alt/gemini-speed-fix1)
1. Stop inlining the 174 base64 item pictures (ITEM_IMG, 1.56 MB) into v2.js on --public: ship them as files (/items/<id>.webp, the way
   --item-files does) and load them only when an item picture is shown. Keep the Claude-artifact build exactly as today (it needs inline).
2. index.html ("/") uses the shared /v2.css like the sub-pages, instead of 844 KB inline <style>; keep the static first screen's critical
   CSS inline only if it is needed to avoid a flash (measure).
Proof: speed-check.mjs before/after on the same pages (LCP, bytes, requests), plus visual parity: screenshots of Home, My Team (with a
team that shows items), an item sheet, Build, Gifts at 390 + 1440 light + dark, 0 changed pixels after load. CSP test passes
(no new inline script/style hashes broken), v2-public, seo-check, pokemon-pages-test, static-pages-test, pub-links-test all pass.

## JOB 58 (after 57): --split-routes on --public (your fix 2) - proposal + measurement first
Turn on route splitting for --public on a branch, measure LCP/bytes per page with speed-check, and run the full public test list
(same as job 57). Report what breaks before fixing anything; fix only code paths with no visible change. HH decides whether it ships.

---
## HH notes (time: 1:27 PM (1:27:51)  date: Thu Nov 26, 2026): 53-58 received. 53, 54, 56 are in HH's next batch (56's files only: your branch was cut from main, which would
bring the whole switch merge). 57 + 58 are being reviewed by HH's helper. The day batch (with your 45, 48, 50) is in claude/design6.
Rule reminder for branches: page/test work branches from origin/claude/design6 (58137089 now), data-pipeline work from origin/main.
Order now: 59, then 60. Same rules (no design; own alt/gemini-* branch; fail-before/pass-after; status lines).

## JOB 59: Friday switch rehearsal 4 on today's tips (branch alt/gemini-rehearsal4; the switch may move to FRIDAY morning)
Follow docs/rebuild/switch-runbook-nov28.md (on origin/alt/t3-pending) step 2 exactly: scratch branch from origin/main, merge
origin/claude/design6 (58137089), resolve the 5 known conflicts as written; report anything new. Then:
- 0 conflict markers, node --check on every .mjs, both YAML files load.
- `REPORT_OK=1 bash docs/rebuild/merge-check.sh <scratch> main` must run BOTH lists by itself (your job 48); record every step + exit.
- Run your experiments/switch-smoke.mjs (job 54) on the merged build with today's data (origin/main out/).
- Push the merge ONLY to alt/gemini-rehearsal4 so GitHub runs the full test.yml; report the run id and result, and every failure
  with its cause. Never push main. Report docs/rebuild/test-runs/kip-job59-rehearsal4.md.

## JOB 60 (after 59): speed fixes 4 + 5 from your job 55 (branch alt/gemini-speed-fix2 from origin/claude/design6)
4. Trim what static pages (/pokemon, the 23 tool pages, 404) load from /v2.css: give static pages only the CSS they use (measure:
   bytes before/after, and 0 changed pixels on /pokemon, /pokemon/garchomp, 404 at 390/1440 light/dark).
5. Load only the /data/*.json a route needs for its first paint (03-persistence.js:68-74); the rest after first paint. No page may
   show a different number or a loading panel longer than today (prove on Home, My Team, Meta, News, Gifts, /pokemon/garchomp).
Proof as in job 57: speed-check.mjs before/after, the public test list in GitHub's order, no visible change. Report
docs/rebuild/test-runs/kip-job60-speed2.md.

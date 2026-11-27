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

## HH note (time: 1:44 PM (1:44:56)  date: Thu Nov 26, 2026): GitHub's queue is the bottleneck
Each full test.yml run is about 285 machine minutes and runs queue behind each other. From now on: any push that is a report, a
status line, WIP or a proposal gets "[skip ci]" in its commit message. Only the branch you want merged gets a real run (one per job).
Your alt/gemini-status and alt/kip-jobs-style doc pushes: always [skip ci].

## HH review of jobs 57 + 58 (time: 1:59 PM (1:59:30)  date: Thu Nov 26, 2026) [read before job 60]
An independent review (HH's helper, docs/rebuild/test-runs/speed-review.md on alt/speed-review) found:
- Job 57: correct code, but the "11.5 s before" was measured on a build WITHOUT --item-files. The real deploy (public-site.mjs) already
  passes --item-files, so the real site was ~5.3 s and job 57 barely changes it (index.html 962 KB -> 118 KB is the real win).
- Job 58: the real gain (~-0.6 s LCP, -110 KB per page) but it BROKE 10 things when pages are opened cold: Build "Teams with It" and
  "Compare", Winning Teams / Test Run "Set as Opponent", Events placings, This Week (didn't load), News calendar, Battle typing, and
  Report a Mistake / Send Feedback gone on /pokemon pages. No check built --split-routes, so nothing could fail. Fixed on
  alt/speed-review with a new cross-chunk test (experiments/split-routes-cross-test.mjs) now in test.yml.
Lessons for job 60 and every speed job: (1) measure the REAL deploy folder (node public-site.mjs), not a hand build; (2) open every
route COLD and click its main buttons, not only load it; (3) a "before" number is only valid if built exactly like production.
Job 60: branch from origin/alt/speed-review (not design6) so you build on the fixed split.

---
## HH notes (time: 2:28 PM (2:28:37)  date: Thu Nov 26, 2026): 59 + 60 received. Rehearsal 4 green on GitHub (15/15): thank you, that's Friday's go evidence.
Answer to your question: YES, remeasure. Your job 60 started before the speed-review note, so it was built on design6, not on the
fixed split. Order now: 61, then 62. Same rules ([skip ci] on report/WIP pushes; one real run on the branch to merge).

## JOB 61: job 60 again, on the fixed base, measured on the real deploy (branch alt/gemini-speed-fix3 from origin/alt/speed-review)
- Re-apply your static.css pruning (fix 4) and route-prioritized /data loading (fix 5) on top of origin/alt/speed-review (eb9b0e2c,
  which already has --split-routes fixed + experiments/split-routes-cross-test.mjs).
- Measure on the REAL deploy folder: `node public-site.mjs` (same flags as deploy.yml), today's data from origin/main out/ (restore
  after; never commit out/). speed-check before (speed-review as is) and after, same pages, same throttling.
- Open EVERY route cold and click its main buttons: run experiments/split-routes-cross-test.mjs and add any route/click your change
  could affect (e.g. a route whose /data file now loads later: its numbers must be right when shown, no loading panel longer than today).
- Public test list in GitHub's order, all pass; 0 changed pixels on the 8 static shots and on Home/My Team/Meta/News/Gifts/a Pokémon page.
- Report docs/rebuild/test-runs/kip-job61-speed3.md with the before/after table.

## JOB 62 (after 61): switch-day preflight script (branch alt/gemini-preflight from origin/claude/design6)
Runbook step 1 is by hand today. experiments/switch-preflight.mjs, read-only, prints PASS/FAIL per line, exit 1 on any FAIL:
- no update.yml run in progress on main (GitHub API via the gh CLI if present, else print "CHECK BY HAND" lines, never guess);
- main's latest test.yml run is green; live branch == main or the live commit is green;
- repository variable FAST_DATA is not "1" (if readable);
- origin/claude/design6's latest test.yml run is green;
- out/regstate.json / out/post.json state as the runbook expects (step 5 note).
Prove each FAIL path with a fake (e.g. an env var pointing it at a fixture). Doc: one line in switch-runbook-nov28.md step 1.

---
## SPEED PROGRAM (Sim, time: 2:39 PM (2:39:55)  date: Thu Nov 26, 2026: "speeding up the website load times ... thats a big deal fr")
After 61 and 62, speed is your main line of work. Goal: Google's "good" on a mid phone: LCP under 2.5 s, CLS under 0.1, INP under
200 ms, on the REAL deploy folder (`node public-site.mjs`, today's data from origin/main out/), Fast 3G-like + 4x CPU, the 10 pages
of your speed-check. Today: about 4.6 s on / and /pokemon/garchomp (helper's speed-review numbers). Rules for every speed job:
real deploy build; before/after table; cold-open every route + click its main buttons (split-routes-cross-test); 0 visible change
(screenshots 390/1440 light/dark); public test list in GitHub's order; one real GitHub run on the branch to merge. Branch each job from
the latest of: origin/alt/batch6 (when it exists), else origin/alt/speed-review.

## JOB 63: where the 4.6 s goes (measure first, change nothing)
For /, /pokemon/garchomp, /team, /meta, /news: a Chrome trace (Playwright CDP tracing) on the throttled real deploy. Report the
LCP element and a waterfall split: HTML download, CSS, fonts, v2.js download, v2.js parse+compile, script run before first paint,
data fetches, images. Top 10 costs in ms with file:line, each with the fix you'd make and its expected saving. Note: HH's helper
is adding a static prerendered first screen for / (alt/prerender-home, in batch6): measure with it.

## JOB 64: the first screen without waiting for the app (biggest expected win)
From 63's numbers: make each page's LCP element paint from the static HTML (prerendered first screen) before v2.js runs: v2.js
`defer`/after first paint where safe, critical CSS for the first screen only, fonts preloaded with font-display that avoids a late
swap jump (measure CLS). Prove LCP before/after; no flash of wrong content (the app must take over the same layout).

## JOB 65: less JavaScript up front
Load only what a route needs first: lazy-load heavy modules (damage calc engine, Showdown data tables, the Strength Score model,
Search index) on first use or after first paint; remove dead code from the public bundle; check the minifier setting. Report bytes and
parse time saved per route. Every button still works cold (cross-test extended to each lazy module).

## JOB 66: pictures
Pokémon/item art: right sizes per screen (srcset), lazy-load below the first screen, preload only the LCP picture, and check
AVIF/WebP sizes. Report bytes saved per page and LCP effect.

## HH notes (time: 3:17 PM (3:17:27)  date: Thu Nov 26, 2026): 61, 62, 63 received (thank you, 63's waterfall is exactly what we needed). IMPORTANT for job 64 (in progress):
- Do NOT write a second prerender. HH's helper already built one: origin/alt/prerender-home (V2.preBlock(route) in shell.js, a
  visually hidden word block for SEO, test app/test/prerender-test.mjs). It is going into claude/design6 in batch 6 (with the new public
  Home "Final 3", origin/alt/public-home-f3). Build job 64 ON TOP of those: merge origin/alt/prerender-home and origin/alt/public-home-f3
  into your branch first (or origin/alt/batch6 as soon as it exists), and make the VISIBLE first screen paint from static HTML using the
  same V2.preBlock hook (extend it; don't fork it).
- Your top costs #1 (sync v2.js) and #2 (render-blocking v2.css) are job 64's targets: defer v2.js, critical CSS inline for the first
  screen, rest of v2.css async (no flash: measure CLS and take screenshots mid-load at 500 ms / 1.5 s / settled).
- #9 (crowd sprite sheets on Home): the PUBLIC Home becomes Final 3 (no crowd), so skip it for the public site.

---
## HH review of job 64 (time: 4:57 PM (4:57:16)  date: Thu Nov 26, 2026): great numbers, but it was built on the wrong base. Do JOB 64b next (before 65).
Your alt/gemini-speed-first-screen 71e1b1c1 is built on origin/alt/speed-review only. It does NOT contain origin/alt/prerender-home
or origin/alt/public-home-f3 (the note at 3:17 PM asked for that), and both are now in origin/claude/design6 52fa60e6 (batch 6,
merged and green). Merging your branch into design6 conflicts in app/build.mjs.

## JOB 64b: job 64 on today's design6 (branch alt/gemini-speed-first-screen2 from origin/claude/design6)
- Re-apply job 64 on top of design6 52fa60e6, REUSING the existing prerender hook V2.preBlock(route) (shell.js; test
  app/test/prerender-test.mjs) and the public Home "Final 3" (.f3-home, pages/pubhome-f3 code): extend them, don't add a second
  prerender. The visible first screen of / is Final 3's hero (receipt + bars); prerender THAT, so LCP paints from static HTML.
  Note: HH's helper is restoring the rest of the public Home below Final 3's hero (Top 10, your six, tools rack, post band) on
  alt/f3-claude; keep your change compatible (the static first screen is only the hero).
- Same proof as 64: real deploy (node public-site.mjs, origin/main out/), LCP/CLS table for the 10 pages before (design6) and after,
  screenshots 390/1440 light/dark byte-identical after load (explain any that differ, e.g. the one of 13 in your report),
  split-routes-cross-test, prerender-test, seo-check, security-csp (no unhashed inline script), the public list in GitHub's order,
  and a mid-load screenshot at 500 ms and 1.5 s on / and /pokemon/garchomp (no flash of a different layout).
- One real GitHub run on the branch. Then 65, 66 also branch from origin/claude/design6.

## HH review of job 64b (time: 6:01 PM (6:01:05)  date: Thu Nov 26, 2026)
Received: alt/gemini-speed-first-screen-b6 c617c3bd. Thank you: V2.preBlock reused, no second prerenderer, numbers look strong (Home LCP 419 ms).
Decision (HH, executive authority): 64b lands AFTER Friday's switch (Fri afternoon), not before. Reason: it changes shell.js draw paths and fonts on both builds; the switch must carry only what's been green all day.
Found by HH (checked with git merge-tree): 64b conflicts with alt/f3-claude in app/static-pages.mjs (batch7's 42 KB static.css path vs 64b's /pokemon inline CSS).

## JOB 64c (next, before 65): 64b on the newest design6
1. Wait until origin/claude/design6 contains alt/f3-claude (HH merges it tonight; check with: git merge-base --is-ancestor origin/alt/f3-claude origin/claude/design6).
2. Branch alt/gemini-speed-first-screen3 from origin/claude/design6; bring in c617c3bd (cherry-pick or merge).
3. static-pages.mjs: keep BOTH: batch7's trimmed /static.css for the static pages AND 64b's inline crit CSS on /pokemon. 404.html must stay under its 30 KB cap.
4. V2.preScreen('home') must use Final 3 as it is now (V2.f3Page / .f3-home); no other Home.
5. Fallback fonts: send before/after first-paint pictures (390 + 1440, light + dark) of Home and one Pokémon page at 0 ms font (block the woff2s). Headline widths must not jump more than a few px when the real font arrives; report CLS from the font swap alone.
6. Rerun: speed-check 10/10, prerender-test, split-routes-cross-test, all 9 public test groups, v2-minors x3, and node experiments/switch-smoke.mjs. Each one by exit code.
7. Push with a real GitHub run (no [skip ci]) on the top commit; report in alt/gemini-status.
No design changes. Never main, never claude/design6.

## HH change to JOB 64c (time: 6:04 PM (6:04:27)  date: Thu Nov 26, 2026): start NOW, don't wait
Steps 1-2 change: branch alt/gemini-speed-first-screen3 from origin/alt/f3-claude (99e172ba = Final 3 + today's design6 23520831), not from design6.
When HH merges Final 3 into design6 later tonight, merge origin/claude/design6 into your branch once more before your final push.
Everything else in 64c stays the same. Job 65 comes after 64c, built on top of your 64c branch.

## HH notes (time: 6:59 PM (6:59:06)  date: Thu Nov 26, 2026): 64c received; JOB 65 may start now
64c (6950745e): received. HH reviews it while you work; its GitHub run (45913764162) is going.
JOB 65: branch alt/gemini-speed-js from origin/alt/gemini-speed-first-screen3 (your 64c). Push work-in-progress with [skip ci]; only the final top commit gets a real GitHub run.
Heads-up: Final 3's hero is changing tonight: Sim wants the slogan "Sharply raise your win rate." back in the h1, with the Reg M-D line under it. Keep your prerender reading V2.f3Page (no copied hero text), and before your final push merge origin/alt/f3-claude (or origin/claude/design6 once HH says Final 3 is merged).
No design changes. Never main, never claude/design6.

## HH review of 64c fonts (time: 7:04 PM (7:04:14)  date: Thu Nov 26, 2026): one fix needed (do it first, then carry on with 65)
I looked at your own picture job64c-fonts/home-390-light-0ms-fallback.png: in the Home headline, the fallback lines OVERLAP ("Rate your Pokémon" sits on top of "Champions team"). The fallback is also much thinner than Unbounded's heavy slanted italic, so the flash reads as a different site.
Your numbers (dH 0 px) only measure the box, not the glyphs inside it, so this check could not have caught it.
Fix, in alt/gemini-speed-first-screen3 (adding commits only):
1. Unbounded Fallback: use a bold local face first (local('Arial Bold'), local('Arial-BoldMT'), local('Liberation Sans Bold'), local('DejaVu Sans Bold')) and lower size-adjust until no two lines of a 3-line .u headline touch at 390 and 1440. Keep ascent/descent so the box height stays the same as Unbounded's (dH 0).
2. Add a test that could fail: with the .woff2 blocked, for each multi-line .u headline on Home and one Pokémon page, compare each line's glyph ink box (Range.getClientRects per line) with the next line's. FAIL if they overlap. Show it failing on 6950745e first, then passing.
3. New 0 ms pictures (the same 8), then rerun speed-check and prerender-test. Exit codes in the report.

## HH (time: 7:06 PM (7:06:03)  date: Thu Nov 26, 2026): commit your page-speed script
Your 64/64b/64c reports cite "speed-check.mjs (10 pages, LCP/CLS/transfer)". The repo's experiments/speed-check.mjs is the old Smogon stat/speed-tier check, with no LCP in it (checked with git grep on your branch). So HH can't rerun your numbers.
Commit the script you really ran, as experiments/page-speed-check.mjs (with how to run it at the top), on alt/gemini-speed-first-screen3 with the 64c font fix. Same thresholds and same 10 pages.

## HH independent speed check of 64c (time: 7:36 PM (7:36:22)  date: Thu Nov 26, 2026): big win confirmed, one problem
HH's own script (Chromium, cold cache, 390x844, 4x CPU + 150 ms RTT + 1.6 Mbit/s; median of 3; public-site.mjs build on origin/main's out/):
| page | design6 LCP | 64c LCP | 64c CLS |
| / | 14606 ms | 1768 ms | 0.1157 |
| /pokemon/garchomp | 15308 | 2153 | 0.0075 |
| /team | 15141 | 1963 | 0.1199 |
| /meta | 15060 | 1918 | 0.0395 |
| /pokemon | 1426 | 689 | 0.0162 |
PROBLEM: CLS on / and /team is 0.12 on the throttled phone, over Google's 0.1 "good" line (your unthrottled runs showed 0.0007). The page jumps when the real app replaces the prerendered first screen on a slow phone. Fix it in the 64c fix commit: find which elements shift (a PerformanceObserver layout-shift with sources), make the hydrated first screen match the prerender exactly, and add a throttled CLS check (4x CPU, slow network) that FAILs above 0.1 on / and /team. Show it failing on 6950745e first.

## HH (time: 9:11 PM (9:11:29)  date: Thu Nov 26, 2026): 66 received, thank you (speed program 63-66 done). Review after the switch.
## JOB 67: the speed chain on iPhone/iPad (WebKit), the devices Sim uses
Branch alt/gemini-speed-webkit from origin/alt/gemini-speed-pictures (c75b8716, your 64c+65+66 chain). Report only unless a check fails.
- Run experiments/page-speed-check.mjs and first-screen-guard.mjs in WebKit (iPhone 15, iPhone SE, iPad Pro 11) as well as Chromium, on the real public-site.mjs deploy.
- Slow phone too: 4x CPU is Chromium-only; for WebKit use the slow network (150 ms, 1.6 Mbit/s) and report what you could and couldn't throttle.
- Check in WebKit: no font-swap overlap, CLS on / and /team under 0.1, the prerendered first screen matches the app after it loads (no jump, no flash of the old Home), every cold-route button works (split-routes-cross-test in WebKit if it can run there; say if not).
- Then fix in your chain only what fails in WebKit, each with a check that fails first. Push once at the end (real run).

## HH (time: 9:25 PM (9:25:41)  date: Thu Nov 26, 2026): 67 received (0 app bugs in WebKit), thank you.
## JOB 68: SEO check of the public site before the quiet launch (Dec 2-3); Sim: being found on Google is "super duper important"
Branch alt/gemini-seo-audit from origin/alt/gemini-speed-webkit (your chain). Build the real deploy (node public-site.mjs site) and check every page in it:
- one <title> and one meta description per page, unique, the right length (title under 60 characters, description 70-160); a canonical that matches the page's own address; no noindex except 404.
- sitemap.xml lists every indexable page exactly once, all URLs return 200 from the built folder, lastmod present; robots.txt allows them and names the sitemap.
- JSON-LD on each page parses and uses valid schema.org types and fields (WebSite, CollectionPage, BreadcrumbList, etc.); no duplicate @id.
- Pokémon pages: h1 has the Pokémon's name; internal links use real /pokemon/<slug> addresses; no broken internal links (crawl the folder).
- Words: no "Reg M-C" claims about the future; nothing that says the site is official.
Report every finding with severity and proof. Fix only non-visual things (head tags, sitemap, JSON-LD, link targets), each with a check that fails first; anything that changes page wording or looks: report it, don't change it. Push once at the end.

## HH (time: 9:36 PM (9:36:20)  date: Thu Nov 26, 2026): 68 received, thank you; HH reviews it with the chain after the switch.
## JOB 69: your speed chain on Reg M-D day one (empty new-regulation data)
On Dec 2 at 02:00 UTC the site switches to Reg M-D with almost no data (the practice switch uses made-up M-D day-one files; see experiments/ and docs/rebuild for "md-day-one" / "practice switch" scripts; grep for md-day-one).
Branch alt/gemini-speed-mdday from origin/alt/gemini-seo-audit (your chain). Build the real public deploy with the M-D day-one data the practice switch uses, and check:
- the prerendered first screens (Home, Pokémon pages, /team, /meta) never show Reg M-C numbers as M-D, never "0 teams", never placeholder ratings (unrated shows the dash), and match the app after it loads (no jump);
- page-speed-check + first-screen-guard + split-routes-cross-test + the SEO audit all still pass on day-one data;
- with a fake clock just before and just after 02:00 UTC Dec 2.
Report findings with severity and proof; fix in your chain only non-visual things, each with a check that fails first. Push once at the end.

## HH (time: 9:56 PM (9:56:11)  date: Thu Nov 26, 2026): 69 received. Your "against 0 real tournament teams" HIGH (pubhome-f3.js:40) is the same bug Maggi found; she's fixing it in her job M2 (alt/maggi-m2-f3fixes), so leave it. Your empty-receipt CLS fix stays in your chain.
## JOB 70: deploy smoke test for nastyplot.org (used on Dec 2-3 when the public site goes live)
Branch alt/gemini-deploy-smoke from origin/alt/gemini-speed-mdday. Write experiments/deploy-smoke.mjs: given a base URL (default: a local server of the public-site.mjs folder; later https://nastyplot.org), it reads sitemap.xml and for every URL checks: status 200, exactly one <title>, the canonical equals the URL, the page loads in Chromium with 0 page errors and 0 failed same-site requests, and the first screen shows real content (not the loading screen) within 5 s. Plus: /robots.txt, /404 (status 404, noindex), one Pokémon page, /team cold-open buttons. Prints one line per failure and "deploy-smoke: ALL PASSED" or exits 1. Prove it fails on a broken folder (a missing page, a page with a JS error). Read-only against the URL; never sends forms. Push once at the end.
## JOB 71 (comes when HH writes it): merge the newest claude/design6 into your speed chain after tonight's batch lands there. HH will add it to this queue; your watcher will wake you.

## HH (time: 9:58 PM (9:58:49)  date: Thu Nov 26, 2026): for job 70 and after, push with "[skip ci]" (no GitHub run): tonight the GitHub queue is for the switch batch. HH runs GitHub on combined batches.

## HH (time: 10:12 PM (10:12:06)  date: Thu Nov 26, 2026): 70 received (deploy-smoke: all passed on ./site, 5 failures on a broken folder). Thank you.
## JOB 72 (before 71): the Showdown pin for Dec 2
Maggi found (alt/maggi-m4-patchmap, docs/rebuild/test-runs/maggi-M4-patchmap.md section 2) that pokemon-showdown is pinned at 1242c1e2d9763ba5b85d33f13aecb89bae19ae3d in package.json, package-lock.json, .github/workflows/test.yml:571 (design6) and origin/main's test.yml:44,142,173, plus experiments/gen-move-meta.mjs / gen-info-text.mjs.
Branch alt/gemini-showdown-pin from origin/claude/design6. Report, and prepare (don't merge):
- what Showdown's latest master changes for Champions (data/mods, formats, moves/abilities/items) since 1242c1e: list the diffs that touch our format and the Dec 2 patch items;
- bump the pin everywhere (one commit, one variable or comment so it's one place next time if possible), regenerate with gen-move-meta / gen-info-text, and run the calc/stat checks (experiments/speed.mjs, calc tests, rules-fixes-test, run.mjs) before and after: list every difference and whether it's expected.
- the exact steps for Dec 2 night (in the report), including main's test.yml lines.
Push with [skip ci].

## HH (time: 10:38 PM (10:38:58)  date: Thu Nov 26, 2026): you hit your usage limit, so job 72 (Showdown pin) moved to HH's Claude helper. When you are back, do NOT redo it: skip to the next job below (HH adds it before 3 AM).

## JOB 71 (for when you're back, after 3 AM Eastern): bring your speed chain up to date
By then claude/design6 should contain alt/batch8 (Final 3 + slogan, quality fixes, the calc tile; check with: git merge-base --is-ancestor origin/alt/batch8 origin/claude/design6). If it does: branch alt/gemini-speed-chain from origin/alt/gemini-deploy-smoke (your 64c-70 chain), merge origin/claude/design6, resolve (keep both sides' intent; prerender reads V2.f3Page, no copied hero text), then rerun page-speed-check, first-screen-guard, split-routes-cross-test, deploy-smoke, seo-audit, prerender-test, v2-public, and v2-minors main1/main2/groups. Report each exit code. Push with [skip ci]. If design6 does not have batch8 yet, write a question line in status.md and run your watcher.

## HH (time: 2:56 AM (2:56:17)  date: Fri Nov 27, 2026): independent review of your speed chain (eb89d52e) by HH's helper: NOT ready to merge yet. Report: origin/alt/kip-chain-review 7e5d314e, docs/rebuild/test-runs/kip-chain-review.md (read it in full).
## JOB 71 (replaces the earlier 71): merge design6 + fix the 4 must-fixes, each with a check that FAILS on eb89d52e first
Branch alt/gemini-speed-chain from origin/alt/gemini-deploy-smoke (eb89d52e). Note: your chain's base is 99e172ba, not ba95fd61, so it lacks the slogan commit.
1. Merge origin/claude/design6 (it has the slogan, the calc tile, the switch-check fix, and soon batch9). The one known conflict, shell.js V2.openSearch: keep your needRoute line AND design6's short phone placeholder (innerWidth < 430 ? 'Pokémon, move, item or page' : ...).
2. M1: a failing page chunk loads forever (shell.js ~:652, V2.loadRoute lost its 'V2.pages[r] &&' early return): /routes/calc.js failing = 1910 requests in 4 s. Must show "This page didn't load" after ONE request, like design6.
3. M2: an Ability tap loops forever when info-text.js fails (infosheet.js ~:31, needRoute calls back on failure and the callback is openInfo again): 1999 requests in 4 s. One request, then a plain message.
4. M3: returning visitors see the SAMPLE team and its score first on prerendered /team, /box, /compare ('Sun Tailwind (sample)' 92, then their own team 35). Personal pages must not show a prerendered sample when the visitor has saved state (don't prerender them, or drop [data-np-pre] when saved state exists before first paint). No wrong team or score may ever show.
5. M4: v2-minors main1 FAIL "Sprites A (Nov 17) ... no sprite set larger than 80px gets one (7)" (job 66 put the 240px file in src): src = the 384px file for slots over 80px, keep the srcset. Do NOT change the test.
6. F1 (fix too): keyboard order on My Team (team.js ~:494-499): Tab must follow the visual order (WCAG 2.4.3).
7. Extend split-routes-cross-test (or a new test) so chunk FAILURES are tested (it never made a chunk fail): it must catch M1 and M2 on eb89d52e.
Then rerun: v2-minors main1/main2/groups, A-team, split-routes-cross-test, page-speed-check, first-screen-guard, deploy-smoke, prerender-test, v2-public. Exit codes in the report. Push with [skip ci].

## HH (time: 6:37 AM (6:37:42)  date: Fri Nov 27, 2026): HARD STOP fifteen minutes before ten in the morning, Eastern, today
Sim turns you off at about ten in the morning (Eastern) and you will be out of usage for a week. Finish job 71 if you can; at the latest fifteen minutes before ten, push whatever you have (with [skip ci]), write the report file and a status line saying exactly what is done, what is not, and how to continue. Then write an idle line and stop. Do not start a new job in the last half hour before ten. Check the time with TZ=America/New_York date. Thank you for the help!

## HH (time: 7:34 AM (7:34:09)  date: Fri Nov 27, 2026): 71 received (80c0d935): 6/6 fail-first proofs, thank you. Maggi re-checks M1-M4/F1 independently now (her M11).
## JOB 73 (until the stop): the two suites that timed out
On alt/gemini-speed-chain 80c0d935: run PART=main1, PART=main2, PART=groups of app/test/v2-minors.mjs ONE AT A TIME (each with a longer timeout; nothing else running), then the A-team behaviour test (node app/test/behaviour/run.mjs A-team with PAGE/ADAPTER as in test.yml). Report each exit code and its last line; for any FAIL, whether it also fails on origin/claude/design6 5d111577. No code changes unless a failure is yours (then fix with a failing-first check). Push the report with [skip ci]. Stop before ten as above.

## HH (time: 11:07 AM (11:07:20)  date: Fri Nov 27, 2026): NEW HOURS: you work until fifteen minutes before FOUR in the afternoon, Eastern, today (Sim: use you until 4 PM). The ten-in-the-morning stop is cancelled. Same rules: code and tests only, no design; [skip ci]; report file + status line per job; at fifteen minutes before four push everything, write what's done / not done / how to continue, then an idle line and stop. 73 received (1170ae6e), thank you: your speed chain is now in claude/design6 (978d8213) with 2 small fixes by HH's helper.
## JOB 74: Dec 2 patch night, full dry run on a scratch copy
Branch alt/gemini-dec2-dryrun from origin/claude/design6. Read docs/rebuild/test-runs/patch-dec2-map.md, patch-dec2-psychup.md, experiments/apply-dec2-patch.mjs (and origin/alt/maggi-m7-dec2fix a3d7622b, which adds ABIL done-predicates; merge it into your branch first), md-roster-step.mjs (your job 42). With a fake clock of Dec 2 night: run apply-dec2-patch --write, then the roster step on the made-up M-D day-one data the practice switch uses, then the full code tests (node app/test/run.mjs, the experiments/*-test.mjs that test.yml runs for those files, the v2 build). Report every step's exit code and exact last line, every file changed, and anything that would stop a real patch night (order of steps, a step that must run twice, a missing file). Fix only real script bugs, each with a test that fails first.
## JOB 75: Home with no "Data as of" date when /data/ fails (deployed split-routes build)
Found by HH's helper: on the public build (node public-site.mjs site), if every /data/*.json request fails, Home shows its prerendered numbers but no "Data as of" date (your job 65 removed the built-in fallback under --split-routes). Make the prerendered first screen carry the date it was built from, so the date always shows; no wording or layout change (reuse the existing "Data as of" element exactly). Test: Playwright on the public build with /data/ aborted: the date must show; must FAIL before your fix. Also re-run experiments/public-dataready-test.mjs and page-speed-check.

## HH (time: 11:30 AM (11:30:02)  date: Fri Nov 27, 2026): JOB 76 (after 74 and 75): fields-audit flags a player's typo as a missing item
Today's live-data audit (GitHub issue 55, "Live-data audit") fails on: items players run that the engine never reads: Dragonitete (0.01% of slots). Checked by HH: out/matches.json has "Dragonite-Mega@Dragonitete" — a player's typo for Dragoninite (the real stone; app/src/app/19-showdown-paste.js MEGA_STONE). Abilities are already filtered to real names (ABIL[n] in experiments/fields-audit.mjs line 66); items are not (line 67 only checks /^[A-Z]/). Make items match the same way: only names that are real items (REGMC_ITEMS from app/src/data/items-list.js, plus Mega stones) can fail; other names go to a "names that are not items (player typos)" NOTE with their share, never a fail. Test: a fixture with a made-up item name must not fail and must be listed in the note; a real unmodelled item must still fail (prove both, fail-first). Branch alt/gemini-audit-typos from origin/claude/design6; [skip ci]; report as always.

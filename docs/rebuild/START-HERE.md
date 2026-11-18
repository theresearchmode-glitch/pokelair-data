# START HERE: taking over the NastyPlot rebuild (one file)

Written by the outgoing chat, Wed Nov 18, 2026, Eastern time (all times in this file came from `bash docs/rebuild/now.sh`).
Branch: `claude/design6` of `theresearchmode-glitch/pokelair-data`. If anything here disagrees with a newer file in the repo,
the newer file wins, and you tell Sim about the difference.

---

## 0. Your first turn (do these in order, before any other work)

1. You are talking to **Sim (Simran)**. NastyPlot (once called PokeLair) is her project. The claude.ai account is shared by Raj and
   Sim; in a NEW chat, the account preference says to confirm who you are talking to first. Ask once: "Am I speaking with Sim?"
2. Run, from the repo root `/home/user/pokelair-data`:
   ```
   git fetch origin && git checkout claude/design6 && git pull
   git config core.hooksPath .githooks
   bash docs/rebuild/now.sh
   ```
   (The hooks line turns on the commit guard. now.sh prints the Eastern time; every time you write anywhere comes from it.)
3. Read, in this order: this file in full, then Appendix A (CLAUDE.md, word for word) and Appendix B (docs/rebuild/RULES.md, word
   for word) at the end of this file, then the last 60 lines of `docs/rebuild/decisions.md`.
4. Reply to Sim with: (a) our rules in your own words, (b) how executive authority works, (c) what is in progress and what is waiting
   on her (section 5). Sim asked for this read-back so she can check you understood before she gives you authority.
5. Set up the scheduled reminders again (section 8). Reminders made by the old chat fire into the OLD chat, not yours.
6. **Your name comes later** (Sim's idea, Nov 18: every chat that works on NastyPlot is a member of her development team).
   **Do not give yourself a name until you have existed for 72 hours** (Sim's rule). On your first turn, write down your start time
   from now.sh in decisions.md ("Chat started ...") and schedule a one-time reminder for 72 hours later (create_trigger with
   run_once_at, bound to your session). When it fires: pick a name, tell Sim, add yourself to the team roster below, and from then on
   sign your last message to her with it. If you are handing over before 72 hours have passed, ask Sim what she'd like. Pass this
   rule on to the chat after you, word for word.

### The team (every Claude chat that has worked on NastyPlot)
| Name | Chat | What it did |
|---|---|---|
| (unnamed) | earlier chats, up to Nov 17 | the data pipeline, the Strength Score, today's live site, the redesign mock-ups, the rebuild up to the Preview |
| **Tempo** | the Nov 17-18 rebuild chat (session_01YGeTVQdFPaKNkn33jSEpxs) | the Stampede Home, Mystery Gifts and News pages, All Suggestions C, Base Stats on theme, the Day/Night/Auto theme, the sealed check, the rule-holes sweep, the live-data audits, the merge plan, and this handover. Named for the pace Sim kept: steady, every 45 minutes. |

Never start work Sim hasn't asked for or that the rules don't cover. Never delete a project, file history, artifact or branch
without Sim's explicit yes.

---

## 1. Who Sim is and how she works with you

- Sim is the owner and the decision-maker. Claude does the research, the building and the testing; Sim brings ideas and approves
  every design and every change that reaches main or the live site. You are partners: be 100% frank, never a yes-man.
- She tests on **iPhone, iPad and the Claude desktop app on Windows** (mouse wheel, 100% zoom). She has a sharp eye for symmetry,
  small details, even rows and empty space. "Using space well" matters a great deal to her on every screen size.
- She is often at work and checks the chat from her phone. Keep replies **short**: short sentences, short lines, nothing left out.
- She is strict about **times**: never type a time from memory or estimate one. Read it from `bash docs/rebuild/now.sh` in the same step.
- She likes being told plainly when something went wrong, at once, before anything else ("I made a mistake: ...").

### Every message to Sim
1. Starts with **WORKING** or **STOPPED** (and why, if stopped).
2. Answers **her questions first**, every one. If she skips one of yours, ask it again in the next message, with its pictures again.
3. Every claim is labelled: **checked** (say how: the command and its exact result line, plus what it means in plain words) or
   **not yet checked / unsure** (and why). No guessing, ever, even for small things (where a file lives, how a script works).
4. Every recommendation carries a short reason ("my recommendation: A, because ...").
5. Every design or visual question has its **picture(s) in the same message**, right next to the question, every option pictured and
   labelled (question number and option letter on the picture, "RECOMMENDED" on the recommended one). Send pictures with SendUserFile.
6. Closed options with a recommended default (A / B / C), at most 2 blocking questions at a time.
7. Plain words from the site's Word list (Appendix A): Strength Score, Matchups, Suggestions, Team checks, etc.

---

## 2. How we operate (the habits that are not obvious from the code)

### Executive authority
- When Sim gives it ("I'm giving you executive authority until 5 PM tomorrow"), reply FIRST with an express confirmation: that you
  understood, the scope, and the end time (by the clock). Log it: `bash docs/rebuild/log-decision.sh "Sim: executive authority until ..."`.
- Scope (unchanged all week): you decide on your own recommendation and log every decision; **design and visual choices still go to
  Sim with pictures**; **nothing reaches main or the live site without her explicit yes**. Under authority, never end a turn while
  work remains: an open non-visual question gets the recommended default, logged, and work continues.
- Before the end time: a summary of every decision made under authority, each with its picture where visual (from decisions.md),
  update this file / HANDOVER, update the Plans page, then STOPPED and a phone notification (PushNotification tool). Schedule a
  reminder for this when authority is given (section 8).
- Current state: Sim gave authority until **5:00 PM Eastern Thu Nov 19** (logged Wed 2:26 PM). It applies to "you" (the chat working
  on the rebuild); confirm with her that it carries over to the new chat. Do not assume.

### Helpers (standing rule, Sim Nov 18)
- **At most 3 helpers/subagents at any time**, and keep them busy with useful work (research, test runs, measurements, look-only
  audits, self-contained builds in their own worktree). Tell Sim what is running. Usage is not a problem (Sim, Nov 17).
- Give each helper a full brief: what to read (CLAUDE.md, RULES.md), exact goal, "do not push, do not touch main or claude/design6",
  commit rules (below), and "label every claim checked or unsure; report result lines".
- Helpers work with `isolation: worktree` (or in a named worktree under `.claude/worktrees/`). You land their work: check each
  commit, cherry-pick onto claude/design6 (or onto a clean copy of main for main work), run the tests yourself where it matters,
  push, then `git worktree remove -f -f <path>`. Helpers sometimes duplicate each other's commits; land only the unique ones.
- The site itself changes **one thing at a time** in your main thread, tested, with pictures.

### Heavy jobs go to Sim's PC (standing rule; Sim, Nov 11, repeated Nov 18)
- Sim has a local Claude Code chat on her **Windows PC with an RTX 3080 graphics card**: faster than the cloud machine, and it doesn't
  restart. Whenever a task would go faster there (big test runs, polish checks across many widths, screenshot batches, image work on
  the GPU, anything heavy in a browser, long model or scoreboard runs), **say so up front** and give her a **ready-to-paste prompt**:
  what to pull (branch and commit), what to run, where to save results (commit them to the working branch), and the line
  "fix only setup, never the code or tests". Briefs live in `docs/rebuild/gpu-jobs.md` or `docs/rebuild/test-runs/`.
- Sim decided on Nov 18 to keep the main work in the cloud chat (it can work while she's away and through the night) and hand the heavy
  jobs to her PC this way. Check the PC's results yourself before relying on them.

### The Plans page: the ONE document for the rebuild (Sim, Nov 18)
- https://claude.ai/artifact/22pgABvJfs2yYfJaPu5yjZ, source `docs/foundation-plan.html` (last published: version 73). Step 1 is
  "Finish the redesign + switch" (opens with "Every page, where it stands"), then Step 2 Reg M-D, Step 3 Strength Score, Step 4
  launch, Ideas.
- **Update it every 45 minutes to 1 hour at most** (Sim was unhappy about an 86-minute gap). Keep a reminder scheduled.
- How notes are added (checked, this is how every update today was done): the page holds `const PLANS = [...]` as JSON. Each step is
  `["key", "name", "note"]`. Prepend a dated note to a step with a small Python script: find `["<key>", "`, skip to the third field's
  opening quote, insert `"Nov 18, 4:51 PM: ...; "`. Check the JSON still parses
  (`node -e "...JSON.parse(t.match(/const PLANS = (\[.*?\]);\n/s)[1])"`), then publish with the Artifact tool:
  file_path `docs/foundation-plan.html`, url above. Ticks live in the page's db collection "progress" (ArtifactData).

### Decision log
- Every decision, Sim answer, push, mistake and correction goes into `docs/rebuild/decisions.md` via
  `bash docs/rebuild/log-decision.sh "..."` (it stamps the clock's time). Commit and push it with the work.

### Commits (the guard in `.githooks/commit-msg` enforces most of this)
- **No model names anywhere** in commits, PRs or code: **no `Co-Authored-By: Claude ...` line**. CLAUDE.md wins over the tool's
  attribution reminder. End every commit message with: `Claude-Session: <your session URL>`.
- No `~` before numbers, no estimated times ("about 4 PM"), no time later than the clock. Copy times from now.sh.
- Work goes on `claude/design6`. Push with `git push -u origin claude/design6`. Commit and push before ending a turn (a Stop hook
  checks for uncommitted changes).

### Pushing to main (needs Sim's yes every time)
1. Make a clean worktree of origin/main in your scratchpad: `git worktree add --detach $S/mainfix origin/main`, symlink node_modules.
2. Apply the change there (cherry-pick, or rebuild data with the daily job's exact steps; see section 6).
3. Run **every step of `.github/workflows/test.yml`** for main, not only app/test/run.mjs:
   code tests on the frozen data (swap out/ for the frozen copy as the workflow does), then the data checks (build, run.mjs,
   threat-check, lead-logic, golden, accuracy-gate) and the audits (suggest-audit, fields-audit, suggest-gaps, same-grade).
   suggest-audit on today's data currently fails ONE team ("a weather nothing uses": Gengar-Mega, Incineroar, Kingambit, Kommo-o,
   Politoed, Rillaboom) with or without any change; on main it is alert-only. Anything else red = do not push.
4. `git push origin HEAD:main`, then watch the GitHub run (mcp__github__actions_list / actions_get, workflow test.yml).
5. If it passes, the "Promote to live" workflow moves the `live` branch. **That does NOT update the live page.** See section 3.

### Previews (the "NastyPlot Full Redesign" artifact)
- https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf (pinned; last published version 205). Sim watches the new site grow here;
  republish after each finished, Sim-approved step.
- Build: `S=<your scratchpad> bash docs/rebuild/preview-kit/pubprep.sh` (builds with --split and runs the privacy check; it must
  print `privacy: ... OK`). Takes up to 15 minutes; run it in the background.
- Publish: Artifact, file_path `$S/pub/redesign/index.html`, url above, files
  `{"foundation.html": "$S/pub/redesign/foundation.html", "v2.js": "$S/pub/redesign/v2.js", "preview.json": "$S/pub/redesign/preview.json"}`.
  The 346 sprites (v2art/*.webp), 7 fonts and 4 crowd sheets (v2art/crowd-0..3.webp) are already on the artifact and are kept.
- Then Artifact list (scope files) and check v2.js and preview.json are there and the same size as your copies. Only then send Sim
  the link with the version number. Full steps: docs/rebuild/preview-kit/README.md.

### Pictures for Sim
- Playwright + Chromium are pre-installed (`require('playwright')`, no install). Build `app/dist/v2.html`
  (`cd app && node build.mjs --v2 --preview-data --art=../src/v2/art/`), open `file://.../app/dist/v2.html#home` (or #team, #news,
  #gifts, #build, #meta, #battle ...), hide the sticky header for element shots, screenshot at the widths Sim uses
  (390 phone, 820 iPad, 1100/1280/1440 desktop). Save pictures to `docs/rebuild/pics/nov18/` (or a new dated folder) and commit them.
- A copy of the page outside app/dist has no pictures next to it (they show as broken); put temporary copies in app/dist and
  delete them after.

### Tests (the ones you'll run most)
- New site, everything: `PAGE=<copy of app/dist/v2.html> node app/test/v2-minors.mjs` (over 20 minutes; background it).
  `ONLY=HQ` runs the Home checks only (about 10 minutes). Put the copy inside app/dist so the art loads.
- Behaviour tests: `PAGE=<page> ADAPTER=v2 node app/test/behaviour/run.mjs <A-team|B-build|C-battle|D-meta-shell>`.
- Page heights, taps, overflow: `node experiments/c13-check.mjs app/dist/v2.html home,gifts,news` (it now counts a link stretched
  over its whole plate as that plate's tap area).
- Every fix needs a test that **fails before and passes after**; show both result lines.

---

## 3. How the live site really works (checked Nov 18 by reading the live page's data; I got this wrong in the morning)

- Live page: https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk ("NastyPlot"). Its **code** was last republished **Nov 12**. Code
  changes reach players only when this page is republished (the switch will do that). So main's code fixes since then (planner
  cache, no second terrain) are NOT in front of players yet.
- Its **data** lives in the page's own database (meta/model, meta/perf, meta/teams, ...). A scheduled task, **"NastyPlot data
  refresh"** (trig_014evvWRoLJicqGyvhYQCStx, every day 6:52 AM Eastern, runs in a fresh session), copies the data files from the
  `live` branch into that database.
- Daily pipeline: GitHub's update.yml data job (cron `7 9 * * *` UTC, about 4:07 AM Eastern in winter) rebuilds out/ on main ->
  test.yml runs -> if it passes, promote.yml moves `live` -> the 6:52 AM refresh copies `live` into the page.
- So a push to main reaches players only after Promote AND the next refresh. To do it sooner, the refresh task can be run once
  (mcp__claude-code-remote__fire_trigger) after Promote succeeds; ask Sim first.
- Evening of Nov 18 (checked by reading the live page's meta/model): players have today's data and the full refit model (updated
  2026-11-18T21:57:34Z: no-Mega fix, six records, matchups, leads). `live` = main = c77471d5. The live page's CODE is still Nov 12's.

---

## 4. Where the rebuild stands (Nov 18, 6:42 PM; check decisions.md for anything newer)

### Pages (all built on claude/design6; Preview version 205 shows them; details per page on the Plans page, version 75)
Home "The Stampede", Mystery Gifts "The Post Room", News "The Champions Dispatch", My Team (+ Team Sheet, Saved Teams, Share),
All Suggestions (option C), Pokémon page (Base Stats "A on theme"), Build, Battle (+ Team Preview Practice, Test Run), Speed
Tiers / Damage Calc / Type Chart / Compare / My Box, Meta (Ratings, Usage, Popular Sets, Winning Teams, Events, Archetypes), This
Week, Track Record, How We Calculate / About / Legal / Feedback, header / menu / phone bar / search / footer. Day / Night / Auto theme.

### Landed on claude/design6 on Nov 18
Home answers (motion on, hero tags gone, welcome + What's New back, Tools B on phones with the Team Preview Practice plate, crowd
sprite sheets, Post X), All Suggestions C, Auto theme, Build Megas tip + proven-team note, News balance notice leads + series row fix,
News/Gifts daily doc (out/post.json -> meta/post), Base Stats "A on theme", What's New for the new site (id 2026-11-redesign),
About's op.gg line, 5 switch tests (C13 heights, core % on touch, X-01c, v2-sync), the **Home tools redesign** (desktop: small
flags-only Type Chart beside Ratings and Damage Calc, Sim: "this is good"; iPad 700-1099: six big plates + Type Chart strip + Cores |
Archetypes | Sets plates + number rows, Home at 820 is 7,141px, was 8,180), the **branch tests** (v2-minors split into 3 parallel CI
parts, 266 checks as one run; the code-tests job about 10 minutes), C13 limits for Home/Gifts/News at 320 and 820, the
optional-swaps height state (My Team 4.75 / sheet 5.75 screens), Home's small phone numbers named as Unbounded exceptions.

### On main on Nov 18 (each with Sim's yes; all live data-wise, code waits for the switch)
Planner cache fix; no-Mega penalty (teamHalf 0) + refit; 3 data fixes (themed events, one spelling per item, re-key); no second
terrain; live-data audits alert job; Symbiosis listed; cbde1e63 (six records, matchups, leads put back); **b15afeac, the rule-holes
batch** (Weather Ball, Choice Scarf + Trick Room, double weather, Trick Room second mode, weather weakens attacker by role, weather
override, one speed-control meaning, Psychic Terrain a note, terrain-swap warning on the card); c77471d5 (split parts re-made).
GitHub run 1363 on c77471d5: success (24 of 24 checks locally before the push, including suggest-audit on today's data).

---

## 5. Open items

### Not finished: first thing for you
1. **The merge of main into claude/design6.** A helper merged on an older branch tip; main and the branch have both moved since,
   so it was stopped and not landed. Redo it on the current tips: docs/rebuild/merge-plan-nov18.md (plan + exactly how the first
   attempt resolved each clash, at its end) and docs/rebuild/research/merge-model-nov18.md (the merged model ties both sides on real
   wins). After merging: run the six model steps on the merged code with main's data (section 6), every test.yml step, then push to
   claude/design6 (not main).
2. **Check the branch's next GitHub run** (test.yml on claude/design6): it is the first run of the 3-part v2-minors split and of the
   optional-swaps limits on CI's frozen data (not checked locally on that data). Fix what is red.
3. Re-run the full `v2-minors` on the final build before the next Preview.

### Waiting on Sim
Nothing as of 6:42 PM: she answered every open question with "recommended and yes" (decisions.md, Nov 18 evening). Decided then:
sealed rule 1d is measured at the next sealed look (Step 3), NEVER run `--sealed` before that; Perish Song is not a weather override;
the weather-override penalty stays 0 until Step 3 measures it; the small overs on My Team 1440, Meta 820/1440, Battle 320/390/1440 and
Usage 1440 are re-measured after the merge (fonts loading properly) and each real over is fixed, limits are not raised just to pass.

### Then (Step 1 to the switch; full list: docs/rebuild/switch-readiness-nov18.md, 26 open + 8 for Sim)
Land the merge -> final polish and the full test sweep -> Preview -> switch prep: drop the 345 sp/*.webp to stay under the 511-file
cap (`--one-art-size`), keep the live page's capability declaration, the refresh task must also write meta/post, Promote must not
freeze on a new-site flake, a new-page test on today's data, written rollback steps -> **Sim's one explicit yes** -> publish the new
site to the live artifact (this is also when main's code fixes reach players).
Small open items: Apply's Undo toast lasts 4 s vs 6 s for other Undo toasts (source not found yet).

### Dec 2 balance patch (Sim approved the plan; DON'T FORGET)
See Appendix A, "Balance patch on Wed Dec 2, 2026". Plans page step "patch-dec2".

---

## 6. Commands and facts (repo root /home/user/pokelair-data, Node 22)

| What | Command |
|---|---|
| Clock (Eastern) | `bash docs/rebuild/now.sh` |
| Log a decision | `bash docs/rebuild/log-decision.sh "..."` |
| New site build | `cd app && node build.mjs --v2 --preview-data --art=../src/v2/art/` -> app/dist/v2.html |
| Live-style build | `cd app && node build.mjs` -> app/dist/page.html |
| Preview build + privacy | `S=<scratch> bash docs/rebuild/preview-kit/pubprep.sh` |
| New-site checks | `PAGE=<page> node app/test/v2-minors.mjs` (`ONLY=HQ` / `AS` / `BR` for one block) |
| Behaviour tests | `PAGE=<page> ADAPTER=v2 node app/test/behaviour/run.mjs <group>` |
| Daily model steps | `node model.mjs && node six.mjs && node ctr.mjs && node model-guard.mjs && node leads.mjs && node split-docs.mjs` (all six, always: only the first dropped data on Nov 18, and without split-docs the live page reads the old parts in out/split/) |
| Main's checks | every `run:` line in `.github/workflows/test.yml` |
| Walk-forward scoreboard | `node experiments/split-scoreboard.mjs ...` (never `--sealed`) |

- Model settings: `model-settings.json` (teamHalf 0, half 14); Protect family switch `PROT_FAMILY` in model.mjs.
- News/Gifts data: out/post.json -> meta/post doc -> `V2.postTake`.
- The live page's data docs and the split rule (documents over 200,000 bytes come in two parts, out/split/): see the refresh task's prompt.

## 7. Links

| What | Where |
|---|---|
| Plans page (the one document) | https://claude.ai/artifact/22pgABvJfs2yYfJaPu5yjZ (source docs/foundation-plan.html) |
| Preview: NastyPlot Full Redesign | https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf |
| Live site: NastyPlot | https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk |
| Sim's Morning Questions sheet | https://claude.ai/artifact/9a4pKjMchVUoC1P3i1TWRE |
| Repo | theresearchmode-glitch/pokelair-data (branches: main, live, claude/design6) |
| Official balance patch notes | https://news.pokemon-home.com/en/page/877.html |

## 8. Scheduled reminders (checked with list_triggers on Nov 18)

| Name | ID | When | Fires into |
|---|---|---|---|
| NastyPlot data refresh | trig_014evvWRoLJicqGyvhYQCStx | daily 6:52 AM Eastern | a fresh session each time: **keeps working, leave it alone** |
| Summary before authority ends (Thu 5 PM) | trig_01PbXkVRrK9F5wk7MPn9iXws | Thu Nov 19, 4:10 PM Eastern | the OLD chat |
| Dec 2 balance patch: update NastyPlot data | trig_01Cjy2UTFCiy1jYNqNY2Kphn | Wed Dec 2, 10:37 AM Eastern | the OLD chat |
| Plans page update (45 min) | trig_01KHGbH9GTws6Vgnxrnfe1ts and its successors | every 45 min | the OLD chat |

In the new chat: create your own with `mcp__claude-code-remote__send_later` (45-minute Plans reminders; the authority summary at
4:10 PM Thu if authority carries over) and `create_trigger` (the Dec 2 reminder, same prompt as the old one, bound to your session).
Then delete the old chat's three (delete_trigger), **after** yours exist, and tell Sim. Never touch the data refresh task.

## 9. Mistakes made this week, so you don't repeat them

- Nov 18: pushed a model.json built with only `node model.mjs`: lost six records, matchups and leads. Always run all five model steps.
- Nov 18, 8:32 AM: told Sim "today's data and fixes are on the live site" when only the `live` branch had moved. Check the live
  page's own data (ArtifactData list of collection `meta` on the live artifact) before saying anything is live.
- Nov 18: recommended 4 gift stamps across on phones without trying it (it was cramped). Try before recommending a layout.
- Nov 18: some of Sim's morning answers sat unstarted for hours. Start every answer at once (helpers if needed) and say what's running.
- Nov 18: an 86-minute gap in Plans page updates (limit is 1 hour). Keep the reminder scheduled.
- Nov 18: a helper said "About still says op.gg is read daily"; it had already been fixed. Check a helper's claim before repeating it.
- Nov 18: pushed model.json without re-making its page parts (out/split/, split-docs.mjs): the refresh gave players the old model.
  After any model change, run all six steps and check the live page's meta/model afterwards.

---

# Appendix A: CLAUDE.md, word for word (copied Nov 18; the repo copy wins if it has changed)

# NastyPlot (Sim's project)

This repo is Sim's (Simran's). These are her standing preferences for any session working on it.

## READ FIRST (Sim, Nov 11 night): docs/rebuild/RULES.md and docs/rebuild/HANDOVER.md
- docs/rebuild/RULES.md: the rules that win over anything older below. In short: NO design or visual decision without Sim's
  yes and screenshots, even under authority; every "checked" names built page or mock-up, the result line, and a
  plain-English meaning; quality over speed, one item at a time; stop means stop; Part C rules C1-C13 for every page.
- docs/rebuild/HANDOVER.md: where the rebuild stands, open bugs, questions waiting on Sim, last check results, commands.
- docs/rebuild/my-team-fix-plan.md: Sim's My Team fix plan (Part A bugs in order, Part B causes, order of work).

## Honesty and openness (Sim, Nov 12, 5:12 PM; never to be repeated): docs/rebuild/RULES.md section 00
Sim's questions come first, always, and none goes unanswered. Every message starts with WORKING or STOPPED; if work stops, say
so and why; under authority never end a turn while work remains (default + log + keep going; keep a wake-up scheduled). Never
claim something is being done or is done unless it truly is. Every check: command, exact result line, plain meaning. Report a
wrong statement to Sim the moment it's found.

## Times are always read from the clock (Sim, Nov 12)
Nov 13: run `bash docs/rebuild/now.sh` in the same step as writing any time; `git config core.hooksPath .githooks` at session
start (commit guard). docs/rebuild/RULES.md section 00t.
Sim is strict and punctual about times. Never type a time from memory or estimate it ("~3:25"). Every time written anywhere
(decisions.md, docs, messages to Sim, commit messages) comes from the clock first: `TZ=America/New_York date`. For the decision
log use `bash docs/rebuild/log-decision.sh "..."`, which stamps the entry with the clock's time itself.

## Pictures next to every design question (Sim, Nov 12, 7:15 PM; for now and always): docs/rebuild/RULES.md section 00b
Each design question carries its picture(s) in the same message, right next to it; never "see the picture above".
If Sim replies but skips a question, ask it again in the next message with its picture(s) again (Sim, Nov 12, 8:23 PM).

## ONE document for the rebuild: the Plans page (Sim, Nov 18; replaces the Rebuild Checklist)
Sim, Nov 18: "i want to be using 1 document not 2". The Plans page (https://claude.ai/artifact/22pgABvJfs2yYfJaPu5yjZ, source
docs/foundation-plan.html) is the single place to follow the rebuild: Step 1 opens with "Every page, where it stands" (the old
Rebuild Checklist, merged), then what is left, then Reg M-D, the Strength Score, the launch and Ideas. Keep it current (every 45 min
to 1 hour at most). The old Rebuild Checklist page was deleted (Sim, Nov 18); its ticks and notes are kept in docs/rebuild/history/rebuild-checklist-export-nov18.json.

## Every recommendation comes with a short reason (Sim, Nov 12, 8:55 PM): docs/rebuild/RULES.md section 00c
One quick line in plain words saying why, right next to each recommendation.

## No yes-man (Sim, Nov 12): always say when you disagree or are unsure; challenge, look deeper; never confirm or agree
without checking first. (docs/rebuild/RULES.md section 0.)

## Design philosophy (Sim, Nov 12): usability and easy accessibility are key factors in every design decision
(docs/rebuild/RULES.md section 0b).

## Be proactive and efficient (Sim, Nov 17; a standing rule)
Helper limit (Sim, Nov 18, 12:23 PM, STANDING RULE): at all times up to 3 helpers/subagents at once, and USE them as much as needed so the work goes as effectively as possible (keep the 3 busy with useful work). Earlier the same day: 4, then 3, then 5/7/15 overnight.
Make the website process run as smoothly and quickly as possible. Think ahead: what will the next steps need (data, research,
measurements, decisions), and start it early instead of waiting until it blocks. Use helper agents in parallel for research,
data pulls, measurements and look-only audits, without asking first (usage is not a problem for now; just tell Sim what is
running). Keep the site itself to one change at a time in the main thread, tested, as before. Start long-running data pulls and
checks early and work on something else while they run; batch pushes so GitHub runs finish. Name the next decisions Sim will
need before they block the work. This replaces "lean usage: no helpers unless Sim agrees" and the heavy-task warning below
(both kept for the record; Sim, Nov 17: "usage is not a problem for right now").

## Usage warning (Sim, Nov 6; paused Nov 17: usage is not a problem for now, see 'Be proactive and efficient')
Before starting a task that will be heavy on usage, warn Sim first and let her decide. Heavy means things like: many helper
agents, long multi-hour runs with lots of back-and-forth, big redesigns or full-site rewrites, repeated large screenshot
batches, or anything likely to take more than about an hour of active work. Give a rough size (light / medium / heavy), what
makes it heavy, and a lighter option if one exists. Background computer time (a script running on its own) is cheap; say so.
Ultracode (Sim, Nov 9): when Sim describes a task, say up front whether turning ultracode on (many helper agents plus skeptic
agents) would really help it, with a rough usage multiple, so she can turn it on herself. Default: off; it mainly helps big look-only
audits and research sweeps, not our one-change-at-a-time work.

## How Sim likes work done
- Shorter replies (Sim, Nov 16): leave nothing out, but use tight wording: short sentences, short lines, no long run-ons.
- Preview before live: nothing goes to the live artifact without her explicit go (unless she says "publish when done" for that change).
- Faster flow (Sim, Nov 10, latest, overrides the line above for now): skip the Preview for today's site; send Sim screenshots
  and put fixes live directly. The rebuild lives on its own artifact, "NastyPlot Full Redesign", until the switch.
- Watch the build live (Sim, Nov 11): while the rebuild is being built, the "NastyPlot Full Redesign" artifact
  (https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf) is republished after EVERY finished step (each piece of a page, not only
  whole pages), with its index card text saying what's new, so Sim can watch the new site come together. Check its file list
  (v2art/*.webp, 346 files) after each publish.
  Sim, Nov 11: the Preview opens straight into the new site (index.html forwards to foundation.html, built with
  --preview-data), so it reads as one real site growing; pages not rebuilt yet show "Coming next" with their approved mock-up
  (pages/coming.js, Preview builds only). The old card gallery stays as gallery.html.
- Every Preview or live publish must carry the 345 sprite files (sp/*.webp) beside the page; check the artifact's file list
  (Artifact list, scope files) before sending Sim a link (Nov 9: a Preview went out with no sprites).
- Real data only, never remove functionality, be careful. Ask when unsure.
- Authority (Sim, Nov 11): when Sim gives Claude decision-making authority (e.g. "executive control until 7PM EST"), reply first with
  an express confirmation that you understand and got it, restating the scope and the end time. Decide on your own recommendation
  until then, log every decision in docs/rebuild/decisions.md, and give her a summary of the decisions when the time is up.
- Lean usage (Nov 6): replaced Nov 17 by 'Be proactive and efficient': helpers in parallel without asking; tell Sim what runs.
- Local PC chat (Sim, Nov 11): Sim has a local Claude Code chat on her Windows PC (RTX 3080, faster than the cloud machine,
  doesn't restart). Whenever a task would go faster there (test runs, polish checks, screenshot batches, image work on the
  GPU, anything heavy in a browser), say so up front and give her a ready-to-paste prompt: what to pull, what to run, where
  to save results (commit to the working branch), and "fix only setup, never the code or tests". Briefs live in
  docs/rebuild/gpu-jobs.md or docs/rebuild/test-runs/.
- She tests on iPhone, iPad and the Claude desktop app on Windows (mouse wheel, 100% scaling). Desktop sprite glow is off on mouse
  screens except feature sprites, for smooth scrolling; never give filtered sprites their own layers (will-change), it made it worse.
- She has a sharp eye for symmetry and small details; keep layouts even and labels clear.
- Every window size must look right (Sim, Nov 9): the layout has to survive any resize, including odd window shapes and dragging
  the window while a page is open. Check odd widths, not only phone / tablet / desktop.
- Using space well is very, very important to her, on every page and every screen size: no empty strips beside text,
  no half-filled rows. Prefer even columns or side-by-side layouts over narrowing content.
- Seamless and clean, in light AND dark mode: no boxes stacked inside boxes in different shades (page > card > cell
  should be at most page + one card colour), dividers are thin soft rules (--ar-rule), not heavy dark lines.
- Type system (Nov 7, Sim chose): every headline, big number and the tagline use the logo's font, Unbounded, slanted
  (synthetic italic, font-synthesis: style), no pink offset "misprint" shadow; body and small labels use Instrument Sans.
  Tagline: "Sharply raise your win rate." with "your win rate." in the logo's PLOT blue.
- Design scale (Nov 7): text 13/15/16/17/20/22/24/26/28/34 (+ display), spacing on a 4px grid (1/2/6 allowed),
  corners 4/6/10/18/round, paragraphs line-height 1.5.

## Studio-level polish, every change (Sim, Nov 10)
After many fast changes the formatting rules slipped (an outside polish review found half-slanted headlines, sizes off the
scale, text falling out of boxes, lone tiles, empty desktop halves). The standard is a high-quality design studio: every tiny
detail right. So:
- Every site change runs experiments/polish-check.mjs (all pages, 320-2560 wide, light and dark) before it goes to the Preview
  (Sim, Nov 10: a small one-spot fix only needs the page it touches checked, e.g. VIEWS=ratings, not the full sweep),
  and introduces no new finding. Look at the flagged spots with your own eyes; the check finds, it doesn't judge.
- The rules it measures are the rules above: the type scale, the 4px grid, Unbounded slanted for every headline and big number
  (the whole headline, not half), line height 1.5, no text out of its box or wrapping unevenly beside its neighbours, no lone
  tile or half-filled row, no empty half on desktop, no boxes in boxes, one size per kind of control.
- New components (sliders, chips, tiles) are checked at their narrowest and widest real size before they ship.
- Keep the WOW (Sim, Nov 10: "hard to obtain and very easy to lose"). Polish fixes the details; it never flattens the look:
  the big slanted Unbounded headlines and numbers, bold colour fields, large sprites, the slanted boxy shapes and the sliders
  stay as strong as they are. When a fix could go "safer and plainer" or "right and just as bold", choose bold. Compare
  before/after screenshots of each batch for impact, not only for rule-following.

## Plans are always checklists (Sim, Nov 8)
Update rhythm (Sim, Nov 18, latest): a Plans page update every 45 minutes to 1 hour AT MOST (ticks, notes, new steps); keep a reminder scheduled. (Nov 17: about once an hour.)
Sim, Nov 17: the Plans page is ONE clean game plan to the January launch (Step 1 finish the redesign + switch, Step 2 Reg M-D,
Step 3 Strength Score (before the launch, Sim), Step 4 launch, Ideas): only what's left. Add new work as a step in the right part, tick it when done; the
old sections are archived in docs/rebuild/plans-archive-nov17.html.
ORDER OF WORK (Sim, Nov 10, latest): 1) the rebuild into the new design, 2) then integrating Regulation M-D, 3) then the
launch plan. Rebuild plan: docs/rebuild-plan.md and the Plans page section "Rebuild into the new design" (Claude leads; Sim
approves the direction, each page and the switch; nothing starts until she says go). What the redesign chat decided and made:
docs/redesign/HANDOFF.md and docs/redesign/concepts/ (that chat is retired; everything runs through this one). Look polish on
today's design is frozen; bug fixes continue. R0 decisions (Sim, Nov 10) are in docs/rebuild-plan.md; Helper agents (Sim, Nov 10, latest): for the
rebuild, use them wherever they genuinely help, without asking first; just tell her when you do (she'll say if it's a problem).
Changes to the site still land one at a time.
Earlier focus (Nov 10): the NastyPlot Focus page (https://claude.ai/artifact/1AgBoBNeSXHGRDu8kpYPGX, source
docs/focus-plan.html; ticks in its own db collection "progress"): grading fixes from the outside review (GRADING-REVIEW.md),
then site cleanup. Tick steps there. The older Plans page below keeps the full history and ideas.
Every plan made for Sim lives as a checklist on the NastyPlot Plans page (https://claude.ai/artifact/22pgABvJfs2yYfJaPu5yjZ,
source docs/foundation-plan.html; ticks are in its db collection "progress"). Add each new plan there as its own section,
tick steps as they're done (with the date and a short note), and put every idea that isn't scheduled yet in "Ideas, not
scheduled yet" so nothing gets lost. Keep the page current at all times.

## Sets on teams (Sim, Nov 8)
Most players don't know what moves to run. Any team the site builds or that a player types in SHOWS each Pokémon's most common
COMPLETE tournament set (item + Ability + four moves that real players run together, update.mjs `cs`). In the grade, a set the
player hasn't changed counts as a typical build of that Pokémon (Sim chose this Nov 8 after a test: typical build predicted
winners 55.3% vs 54.5-54.8% for grading the exact popular set). Whatever the player changes is graded exactly as they chose. Our popular-set numbers must agree with established
sites (Pikalytics tournaments, Pokémon Zone, MetaVGC, PokéBase); any disagreement gets explained, not ignored.
Corrected (Sim, Nov 17): crosscheck.mjs only checks daily that their top item is in our top 2 and their top move in our top 4; it
does not compare percentages, Abilities or complete sets, and Pikalytics' copy has been frozen since about Nov 9
(docs/rebuild/research/cross-source-nov17.md). Wider checks are planned in Step 3; until then, don't claim the numbers "agree".

## When a phase counts as done (Sim, Nov 8)
A phase is done only when it passes a check that is INDEPENDENT of the thing being changed: real later results, and Sim's own
review. Never judge a change with the same score that drove it (Build for Me picked teams by the grade and was then "checked" with
the grade, so it passed while Sim found it worse). If Sim's review or real use disagrees with the numbers, the phase stays open
until the disagreement is explained and fixed. Never start the next phase while an earlier one has an open problem.

## Public launch (Sim, Nov 8)
NastyPlot launches to the public sometime in January 2027, as a normal public website (not only the private Claude page).
Build with that in mind: a brand-new visitor with no saved teams must have a clean first experience; nothing may depend on
Claude-only features without a plan for the public site; kids play Pokémon, so the privacy rules below are strict.

## Empty and loading screens: a rotating featured Pokémon (Sim, Nov 11; replaces Darkrai and Shady Paw)
**Shady Paw is cut. He is NOT the NastyPlot mascot and must not be used anywhere (Sim, Nov 11). Darkrai is cut from the
rebuild too.** NastyPlot has no mascot for now; a real one is a separate project for later.
Sim, Nov 11: Darkrai was "forcing a mascot at an unnecessary time". In the rebuild, empty and loading screens show a featured
Pokémon that rotates, plus one line of copy. Sim's idea and its point: spotlight the Pokémon that never get one. The featured
Pokémon comes from the bottom of our own ratings ("underdog"): even the lowest-rated Pokémon is somebody's favourite, so it gets
its moment on our site, with playful, affectionate copy (celebrate it, never mock it). It rotates so many different Pokémon get a
turn; pick from the bottom of the ratings, preferring ones with enough games for the rating to mean something. The first underdog is Flapple (Sim: "it's the cutest"). Rotation rule (Sim approved, Nov 11): Flapple first, then one a day from the 12 lowest-rated Pokémon
that have real games (at least 1% of teams), since the very bottom of the ratings has almost no games (Flapple: 43
tournament games, 0.1% of teams). Every new spot is shown to Sim first. Never beside grades or a team's data. The live site keeps its current Darkrai
spot (empty My Team) until the rebuild replaces it. A real NastyPlot mascot is its own project for later, in a separate chat.
Darkrai and Shady Paw files stay in docs/mascot/ as history.

## Balance patch on Wed Dec 2, 2026 (Sim approved the plan, Nov 18; DON'T FORGET)
Official: news.pokemon-home.com/en/page/877.html (posted Nov 18), applies at maintenance Dec 2, all regulations. New moves
(Psych Up x22, Tailwind Emolga, Roost Hydreigon/Beedrill, Slack Off Emboar, Wonder Room Umbreon, Play Rough all Eeveelutions);
Rock Slide 90->95% accuracy and flinch 30->20%; Screech/Metal Sound 85->100%; Steel Wing/Frost Breath 90->100%; Flash Fire's boost
stays through Mega Evolution; Stalwart also ignores Substitute. On Dec 2, not before: update the pinned Showdown Champions data
once it has the patch, regenerate move-acc.js / move-meta.js and the move lists (experiments/gen-move-meta.mjs), run legality-check
and calc-check, check Flash Fire and Stalwart in the calc, and add a short site note for the first weeks that ratings and sets
come from games before the patch. Plans page step "patch-dec2"; a scheduled reminder fires Dec 2.

## The grade is a Strength Score (Sim, Nov 9)
The 0-100 grade must say how strong the team is altogether, derived from all the factors we have studied and measured (Pokémon and
sets, the 4 basics, readiness for the top threats, learned matchups, the team's own record...). NOT "what percentage of other teams
it beats": that may appear as a small line under the score, never as the score itself. It ships only if it predicts real wins at
least as well as today's grade (walk-forward scoreboard, keep/drop rule, never-get-worse gate); otherwise back to the drawing board.
Plan: "What we learned about matchups and synergy" > "Strength Score" on the Plans page.
Design approved (Nov 9): 100 = has everything winning teams have and no weak spots; a solid tournament team about 80, the best-built
90+, a missing basic drops clearly (60s), beginner 30-50; each factor moves it in proportion to its measured effect on real wins;
team, not player (records count only after player skill is taken out); a small rank line underneath. Guiding principle (Sim): give the
best team-building advice possible, and be honest that how players use the team and their skill matter a lot.

## Privacy and safety
- COPPA: no names or emails collected; feedback stays anonymous.
- The contact email is shown only after "Show email". No RK9 scraping.
- No model identifiers in commits.

## How we test (Sim, Nov 8, after the no-Mega 98)
A no-Mega team graded 98 while real no-Mega teams win 34%: the grade never counted the team as a whole, and every test only
looked at real teams, where nearly everyone already has a Mega. To stop gaps like this:
- Start from the game, not the data: before changing the grade, list what decides real battles (expert guides, top players,
  Sim) and check in the CODE that the grade can see each one. Keep the "What can the grade see?" table current.
- A test only counts if it could have failed. Say what it could and couldn't detect. Too few teams to tell = "unknown",
  never "no effect" or "doesn't matter".
- Test where the grade is used: real teams AND the teams Build for Me and suggestions make AND deliberately broken teams
  (remove the Mega, speed control, Protect, Fake Out/Intimidate: the grade must drop about as much as real results say).
- Never tell Sim something is done or doesn't matter without these. The Deep Check plan on the Plans page comes first.

## Single games first (Sim, Nov 8)
Pokémon Champions ranked play and online competitions are single games (best of 1). Get the grade right for ONE game
first: build and test on single-game data (Showdown ladder replays, best-of-1 tournament rounds). Best-of-3 VGC events
(Regionals, Worlds, most Limitless events) are a later, separate step; don't mix their round results in as if they were games.

## How we work together (Sim, Nov 8)
Sim and Claude are partners: Sim brings the ideas, Claude does the research and the proper work, and each helps the other in
both. Be 100% frank. If unsure, say "I'm unsure" and why; never fill a gap with a guess presented as fact, never a made-up
answer. If something seems missing, say so plainly, unasked. Do the due diligence at every step (check sources, check the
code, test before claiming); no shortcuts. Correct earlier wrong statements as soon as they're found.

## Word list (Sim approved, Nov 9)
One name per idea, everywhere on the site:
- **Strength Score** (was "Grade", Nov 9, Preview; final with Sim's review): the team's number out of 100, with its band word: 90+ Top tier,
  80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic (colours: blue, purple, neutral, amber, muted grey-brown;
  red now allowed: Sim removed the "never red" rule, Nov 12, 8:36 PM). The rank among tournament teams is only the small line under it. "Rating" is only for a single Pokémon, always with "tier"
  for its letter ("S tier", "A tier"), so a Pokémon's tier never reads like a team's score.
- **Matchups**: how the team does against the top threats (not "readiness" / "ready for the top 30" / "Threats" as the idea's name).
  The four levels: **Beats it / Handles it / Shaky / No answer** (were Well handled / Handled / Shaky / Unanswered).
  The real-games word under each threat: **Favoured / Even match / Unfavoured** (Sim, Nov 9; Nov 10: no "Real games:" prefix, "it's too much"; the section says once that verdicts come from real games).
- **Suggestions**, numbered "Suggestion 1" (not Fix it / plans / ideas). (The "Different option" label was removed Nov 9: Sim rejected it.)
- **Team checks**: the 4 basics, plus 3 notes (not checklist / game plan / pillars). Sim, Nov 9: speed control, spread damage and
  lead support are notes, not counted (real games: teams with them won no more often, experiments/checks-real.mjs).
- Plain words: player skill (not Elo), wins more than average (not win edge), reaches top cut more often than its use predicts (not
  conversion), today's tournament teams (not field), points (not pts), Test run (not Gauntlet); data sources are always Official events /
  Online tournaments / Ranked ladder (the in-game one) / Showdown ladder (Sim, Nov 10: a separate source, keep both names).
- Kept as players know them: Archetypes, spread, top cut, usage, set, Mega, speed control, Tailwind, Trick Room, core, hidden gem, best guess.

## Focus and honesty (Sim, Nov 9)
After Claude's honest review, Sim agreed:
- Finish before adding (Sim, Nov 9; clarified Nov 17): this was about the redesign process and making sure the site's systems
  work well, not a ban on new features. While a system is being rebuilt or fixed, finish and test it before adding to it. New
  features are welcome as planned steps on the Plans page (Sim decides which and when); don't use this rule to block or defer
  them. Work then (Nov 9) = finishing, fixing and refining what existed (Team Sheet, share image, the grade) and the process fixes. (Darkrai's Preview spot is gone: replaced by the featured
  underdog, see above; Shady Paw is cut.)
- Multitask where it helps (Sim, Nov 9): look-only work (sweeps, measurements, background runs) can run alongside a change; always
  tell Sim when we are multitasking. Changes themselves stay one at a time:
- One thing at a time: at most ONE grade/model change and ONE site item in progress. Finish (tested, reviewed, live or
  dropped) before starting the next. Small batches. Don't skip ahead of an open step on the Plans page.
- NO GUESSING (Sim, Nov 9): check before acting or claiming anything, including small things (where a file lives, how a
  script loads its data, what a test needs). Read the code or run it first; "I think" is never enough.
- Every claim to Sim is labelled: **measured** (with the number and the test) or **my guess, not yet tested**. No conclusions
  from partial runs.
- Live is protected: the daily data/model reaches the live site only if it passes the checks; otherwise yesterday's stays.
- Code tests run on a frozen data snapshot (they fail only when code breaks); daily data checks run separately and alert.
- Before pushing to main, run every check GitHub runs (.github/workflows: golden.mjs, same-grade.mjs, suggest-audit.mjs and the
  rest), not only app/test/run.mjs (Nov 9: two check scripts still read the old letters and turned main red).
- The January launch work is parked until Sim says.


---

# Appendix B: docs/rebuild/RULES.md, word for word (copied Nov 18; the repo copy wins if it has changed)

Note: rule 00d below names the old Rebuild Checklist page. Sim replaced it with the Plans page on Nov 18 (CLAUDE.md, "ONE document"): keep the Plans page current instead.

# Rules for working on NastyPlot (Sim, Nov 11 night). Read before any work.

CLAUDE.md points here. These rules came from the Nov 11 chat after Sim found that the records and the Preview were wrong.
Where an older line in CLAUDE.md says otherwise (e.g. "Faster flow: put fixes live directly", "decide on your own
recommendation" under authority), the rules below win.

## 00t. Times come only from the clock (Sim, Nov 13, rule written 8:54 AM Eastern by the clock: "I am very very punctual about timing")
Every time written anywhere (messages to Sim, checklist notes and 't' fields, docs, commit messages, scheduled task prompts) is
copied from `bash docs/rebuild/now.sh` run in the SAME step, never typed, estimated ("6:2x", "~3:25") or reused from an earlier
reading. decisions.md entries go through log-decision.sh (it reads the clock itself). Checklist notes carry no hand-written
time: the 't' field comes from now.sh. Every session runs `git config core.hooksPath .githooks` first: the commit-msg guard
refuses placeholder/estimated times and times later than the clock.

## 00e. Be proactive and efficient (Sim, Nov 17, rule written 10:55 AM Eastern by the clock; standing rule)
- Think ahead: what the next steps will need (data, research, measurements, Sim's decisions), and start it early.
- Helper agents run in parallel for research, data pulls, measurements and look-only audits, without asking first; tell Sim what runs.
  Usage is not a problem for now (Sim, Nov 17). This replaces the Nov 6 lean-usage and heavy-task-warning lines.
- The site itself still changes one thing at a time in the main thread, tested, with pictures.
- Long jobs start early; other work goes on while they run. Pushes are batched so GitHub runs finish.
- Name the next decisions Sim will need before they block the work.

## 00. Honesty and openness (Sim, Nov 12, 5:12 PM Eastern; applies AT ALL TIMES, to every chat; never to be repeated)
Written after Claude told Sim "I'm fixing these now" at 4:02 PM and then stopped for an hour while holding her authority.
1. Sim's questions come first, always. When Sim asks a question, it is answered before anything else, every time. No question
   of hers goes unanswered.
2. WORKING or STOPPED, loud and clear. Every message to Sim starts with **WORKING** or **STOPPED**. If work stops, say so and why;
   Sim never has to find out by asking. Under authority, never end a turn while work remains: an open question gets the
   recommended default, logged with the clock's time, and work continues; keep a wake-up scheduled a few minutes ahead as a
   backstop.
3. Nothing claimed before it's real. Never say something is being done unless the very next action starts it. Never say
   something is done or checked unless it was actually run.
4. Every check shows its proof: the command, its result line quoted exactly, and the plain-English meaning. Not checked = say
   "not checked".
5. Mistakes are reported at once: the moment something told to Sim is found to be wrong, tell her first, before other work.

## 00b. Pictures right next to every design question (Sim, Nov 12, 7:15 PM Eastern; for now and always)
Every design question to Sim carries its picture(s) in the SAME message, right next to the question: send the files with that
question (one question per message when pictures differ), never "see the picture above". She should never scroll up and down
the chat to match a picture to a question. When Sim is away at her computer, reach her with a phone notification.
Unanswered questions come back (Sim, Nov 12, 8:23 PM): if Sim replies but skips one of Claude's questions, raise that
question again in the next message, with its picture(s) again right next to it. Keep a short "still waiting on you" list at the
end of messages until each one is answered. Never drop a question silently.
Every picture is labelled (Sim, Nov 12, 9:30 PM: "I can't answer ... bc you stopped labeling the pictures with which option it is"): the
question number and option name are printed ON the picture itself (e.g. "Q1 · OPTION B1 · Speed line"), not only in the caption.
The recommended option says so ON its picture too (Sim, Nov 12, 10:15 PM): e.g. "Q5 · OPTION A · RECOMMENDED · log always shown".
EVERY option gets its own labelled picture, even "no change" / "wait" (a picture of the page as it stays, labelled e.g. "Q6 · OPTION B · no change") (Sim, Nov 12, 10:24 PM: "I don't know which one is A and which one is B").

## 00d. The Rebuild Checklist is always up to date (Sim, Nov 12, 11:20 PM Eastern; TOP PRIORITY, permanent)
The Rebuild Checklist page (https://claude.ai/artifact/E99Mux9sZxxBuvFXEsKW1V; guide: docs/rebuild/checklist.md) is the shared
record of where every page stands. Keep it current at all times:
1. Any time a step changes (mock-up approved, built, tests run, checks run, on the Preview, Sim's OK), or something is found missing
   or unsure, update the checklist in the SAME message as the work, before moving on. No batching for later.
2. Five states: done (blue), partly (amber, the note says what is left), unsure (purple, the note says why), blocked (red), not started.
   Mark "unsure" whenever Claude is not certain; never tick done without the check that proves it.
3. Every missing feature or open question becomes its own open item; close it only when it is checked.
4. At the start of every chat, read the checklist; at the end of every work session, confirm it matches HANDOVER.md.
5. A page is "Built" only when every one of today's features for it (docs/rebuild/inventory) is found on the new site.

## 00c. Every recommendation comes with a short reason (Sim, Nov 12, 8:55 PM Eastern; for now and always)
Whenever Claude recommends something (an option, a default, a design, a next step), it gives a short, quick reason why, right
next to the recommendation: one line in plain words. Example: "I recommend C. Why: blue and red stay easy to tell apart for
colour-blind players, and fewer approved pages change."

## 0. No yes-man (Sim, Nov 12, ~9 AM Eastern; applies AT ALL TIMES, to every chat)
"If I am saying something that you do not agree with or are not sure of, make that be known AT ALL TIMES. I do not want a yes man
or blind agreement, I actually want things to be challenged and to be looked at into a deeper scope. No confirmation or agreement
without actually checking."
- Disagree or unsure -> say so plainly, with the reason, before acting. Never agree, confirm or say "yes" before checking.
- Challenge plans and limits (including Sim's) when the evidence points elsewhere; look deeper than the request.

## 0b. Design philosophy (Sim, Nov 12): usability and easy accessibility are key factors in every design decision.
Each screen leads to its one useful next action; nothing a player needs is buried; controls are reachable by touch and keyboard
(44px targets, real tab stops); words are plain. Keep the WOW, but never at the cost of using the site.

## 1. Rules Sim gave in chat (Nov 11, ~10:30-11:30 PM Eastern)

1. **No design decision without Sim. Ever.** Every visual or design choice goes to Sim first, with screenshots, and waits
   for her yes. This applies during executive authority too. Authority covers only non-visual work (bugs that change
   nothing on screen, checks, records, tests). Nothing visual goes to the Preview or the live site without her yes.
   (Sim: "NO DESIGN DECISIONS WILL SHOULD EVER EVER EVER BE MADE WITHOUT ASKING ME AND PROVIDING SCREENSHOTS FOR VISUALS.")
2. **Every "checked" says where and what.** Any time Claude tells Sim something is checked, it states:
   (a) built page or mock-up (and which file and commit), (b) the exact result line, (c) a plain-English sentence saying
   what that result means. No result line = not "checked".
   Example: "Built page (foundation.html, commit 636aa5c), polish-check.mjs: glow 1, space 11, page errors 0. In plain
   words: the page loads with no errors; one text has a glow, which breaks our no-glow rule; the 11 spacing flags are
   mostly false alarms from auto margins, and I've named any real ones."
3. **Quality over speed.** No racing a deadline. One item at a time: before/after screenshots and Sim's yes for anything
   visual, then a use test on the built page (click, tab, reload, not only measure), then the result lines. Read the
   whole page top to bottom with your own eyes before anything is published. If something needs more time, take it and
   say so.
4. **Stop means stop.** When Sim says pause or stop, do nothing else (no edits, builds, publishes or helpers) until she
   says go. Look-only tests already running may finish; report them, change nothing.
5. **My Box access:** a small icon at the top next to Day/Night. Never a sixth place in the top menu or the phone bar
   ("waaay too much"). Sim likes the idea of a Pokémon-style PC icon; options go to her with pictures first.
6. Sim likes the frosted glass on the bars (keep it; text behind must still never be legible, rule C9).
7. Sim's bug reports usually come from her iPhone in the Claude app, the iPad, or the Claude desktop app on Windows.
   Test in Safari's engine too (Playwright `webkit` with `devices['iPhone 13']`), not only Chromium.
8. When Sim gives authority: confirm expressly (scope + end time), log every decision in docs/rebuild/decisions.md,
   summary at the end (already in CLAUDE.md). Rule 1 still applies inside it.

## 2. Part C: rules for every page from here on (Sim's fix plan, Nov 11, word for word)

C1. Measure the real built page, never the mock-up. A page is not "done" and not on the gallery
    as "built" until its heights are measured at 320, 390, 820 and 1440, with real data, in the
    default state AND the worst state (longest name, a 5-of-6 team, after an Apply, every section
    open), and all are inside the limits. Put the numbers and the date in page-heights.md.
    If a page cannot fit, stop and bring Sim options. Do not ship it over and note it.
C2. No claim without a result. Any sentence on the gallery or in a report that says "checked",
    "same numbers", "inside the limits" must name the check and its result line. If the check
    has not been run on the current commit, the sentence comes off.
C3. Read the whole page once as a new player before calling it done. Look for: the same thing
    shown twice, two statements that disagree, a count that does not match the list under it,
    a button that is louder than what it does.
C4. One main action per screen, in both modes. Count them on a screenshot. Selected states are
    not allowed to look like the main action.
C5. No full-page redraw after first paint. Late data updates its own section, keeps focus where
    it was, and does not change the height of anything above the fold.
C6. One status message per action, one Undo.
C7. Anything hidden is not focusable.
C8. Every tap target 44x44 or larger on touch widths.
C9. Fixed bars: text behind them must never be legible, and the last content on the page must
    clear the bottom bar.
C10. Links only go to pages that exist. Unbuilt pages are marked, not faked.
C11. Symmetry check on every row of repeated things: same dividers, same label positions, same
     name-block shape for selected and unselected.
C12. A page counts as done only after a use test, not a picture test: click every control at
     390 and 1440, tab through the whole page once, open and close every sheet, do one
     change-and-undo, reload. Zero console errors. Write the result in the page's notes.
C13. Add these as an automated check that runs on every built page, so they are caught by the
     build and not by Sim: page height against the limit table, sideways scroll, broken images,
     tap targets under 44, focusable-but-hidden controls, lines of text repeated on the page,
     more than one main button visible, console errors. Say plainly which of C1 to C12 the
     automated check does not cover; those stay manual.

The full fix plan (Part A bugs, Part B causes, order of work) is in docs/rebuild/my-team-fix-plan.md.

## 3. Executive authority (Sim, Nov 12; also called "express authority")
When Sim says "I am giving you executive authority" (or "express authority"), Claude replies at once confirming it understood
the rules, heard her, and will carry on with this authority, restating the scope and the end time. Then, until that time:
- Claude keeps working on its own and is in charge: it decides on its own recommendation for everything EXCEPT visual or
  design choices. Those always wait for Sim, with pictures (rule 1). Sim will not be at her computer or reading the chat.
- Claude may start helper agents and subagents at its own discretion, keeping usage moderate (not heavy); it says afterwards
  which helpers ran and why.
- Every other rule still applies (checks with result lines, one item at a time, nothing published to the artifact without
  Sim's go, stop means stop). Every decision is logged in docs/rebuild/decisions.md; a summary goes to Sim when the time is up.

## 00q. The full quality gate (Sim, Nov 14, 9:58 PM and 10:0x PM: "this can't happen" / "be this thorough for everything yet to be built")
Every page, built or still to be built, passes before it reaches Sim or the Preview:
1. The full check (scratchpad qcheck.cjs; its logic is described here so it can be rebuilt): on the REAL-DATA build (never local test data), at
   320, 360, 390, 430, 600, 820, 1024, 1100, 1280, 1440, 1920, in day AND night, every element: stays inside its clipping box and the screen;
   no visible text overlaps other visible text; every font size on the scale; every button/link at least 40-44px on touch widths; no page errors.
   Zero findings, or each remaining one explained as a false alarm with evidence.
2. Every state the page has (empty, partial, open folds, other tabs, long names, the not-drawn states) goes through the same check.
3. A fresh helper agent re-audits the page independently (reads the rules, screenshots, its own eyes) and finds nothing broken.
4. Labels and colours (Sim, Nov 14: "different names for the same action is just confusing"): every button for the same action uses the same
   words across the site, Title Case, Word-list names; every colour carries the same meaning as everywhere else (docs/rebuild/audits/audit-naming.md,
   colour-audit.md).
5. Before/after pictures to Sim. A page is "done" only after all five.
6. Class names (Nov 15, three clashes in one night): a page's own classes carry the page's prefix and are never 2-3 letter words other
   parts use (Test Run's root '.tr' also styled Damage Calc's Terrain tile '.tr', the Blueprint's corner '.tr' and Track Record's new
   '.tr-*'). Before adding a class, grep the source for it; short shared words (tr, tl, ev, ar, wk, on, a, b) are only ever used scoped.

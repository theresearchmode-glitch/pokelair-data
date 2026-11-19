# Switch runbook: the checked plan for the day the redesign replaces the live site (written Nov 18 for Nov 19 on)

Look-only. No code, workflow, data, artifact or scheduled task was changed. Written Wed Nov 18, 2026, 7:40 PM Eastern (now.sh).
Read at: claude/design6 a2a045b7 (main merged in at 83ff09d6), main = live = c77471d5 (git fetch the same evening).
Builds and probes ran in this helper's worktree and in scratch copies only.
Every claim says **checked** (how) or **not checked / unsure**. Builds on docs/rebuild/switch-readiness-nov18.md (D2, D3, D4).

---

## 1. Main's daily job for the new site (D2)

### 1a. What changes when the merged branch reaches main
**Checked:** `git diff --stat origin/main HEAD -- <producer scripts>` lists only these producer differences between main and the merged branch:
ckwin-snapshot.mjs (new, 28 lines), post-news.mjs (new, 92), split-docs.mjs (+post), track.mjs (Track Record bands, 12 movers),
update.mjs (megaN), plus team-basics.mjs (whole Protect family; separate `git diff --stat`). `git diff origin/main HEAD -- .github/workflows/update.yml`
shows the merged update.yml already adds the three steps the new site needs (lines below are the merged file's line numbers).

| New-site need | Script, what it writes | In main's update.yml today? | In merged branch's update.yml? |
|---|---|---|---|
| News + Gifts doc (D3) | post-news.mjs -> app/src/data/post.js and out/post.json (22,645 bytes today) | **no** (main lacks post-news.mjs entirely: `git ls-tree origin/live` shows only split-docs.mjs of the four files asked) | **yes**, line 53 |
| News list guard | experiments/post-data-test.mjs; on failure restores yesterday's post.js / post.json | **no** | **yes**, line 56 |
| Checklist "recent winners" (ckwin) | ckwin-snapshot.mjs -> `ckwin` inside out/events.json | **no** | **yes**, line 81 |
| Build's Megas tip (megaN) | update.mjs -> limitless.json `results.megaN` | step runs, but main's update.mjs has no megaN (grep: 0 matches in live copy) | yes (same `node update.mjs` step; branch update.mjs:144) |
| Track Record tier groups (3h) | track.mjs -> out/track.json `bands:[80,70,60]` and up to 12 movers | step runs, old bands (grep `BANDS = [80, 70, 60]`: 0 in live copy) | yes (same step) |
| meta/post split rule | split-docs.mjs DOCS includes `post` (split-docs.mjs:16) | no (live copy: 0 matches for "post") | yes |

So **no new line is needed in update.yml beyond what the merge brings**: the three proposed lines are already in the merged file (exact text,
already present, not applied by me):
```
      - run: node post-news.mjs || node skip.mjs "news feed skipped (yesterday's list kept)"
      - run: node experiments/post-data-test.mjs || { git checkout -- app/src/data/post.js; git checkout -- out/post.json 2>/dev/null || rm -f out/post.json; node skip.mjs "news check skipped (the list failed post-data-test; yesterday's list put back)"; }
      - run: node ckwin-snapshot.mjs || node skip.mjs "checklist numbers skipped (the page works them out itself)"
```
The merge must keep main's side of the five clash blocks (op.gg paused at line 70-73, player-ID key `secrets.NP_PID_KEY || secrets.THE_NP_PID_KEY`).
**Checked** in the merged file: lines 24, 35, 44, 89 read both secret names; `node opgg.mjs` is not run (line 73 installs the browser only).

### 1b. Today's out/ on the merged branch does NOT yet hold the new fields
**Checked** (`node -e` on the worktree's out/): `megaN in results: false`, `ckwin in events: false`, `track bands: undefined`. They appear only after
the merged code runs the daily job once on main. The page copes without them (checked by code): Megas tip hides (build-sheet.js:32 needs
`megaN.length === 4`), ckwin falls back to computing on the phone (06-helpers.js:191), bands fall back to `[80, 60, 40]` (05-data-clean.js:77).

### 1c. Dry run of the new steps on today's data (scratch copy, not committed)
**Checked**, in a scratch copy of the worktree's scripts + out/ (Playwright 1.63 instead of the job's 1.49.1; no network steps):
- `node track.mjs` -> "track: since 2026-10-29, 20 snapshots, 66 events checked, 61 KiB"; then track.json `bands [80,70,60]`, 12 movers.
- `node ckwin-snapshot.mjs` -> "ckwin snapshot: 7 checks over today's winners saved in out/events.json (events 2026-11-18T10:40:26.707Z, model 2026-11-18T23:57:57.378Z)" (11 s).
  events.json grows 244,366 -> 244,651 bytes; still splits in two (194,018 + 50,755).
- `node split-docs.mjs` -> results, model, events split ("joins back identical"); post 22,645 bytes, not split.
- `node experiments/post-data-test.mjs` -> "ALL PASS"; `node experiments/post-news-test.mjs` -> "ALL PASS".
- **Not checked:** post-news.mjs against the real feed (network, not run); update.mjs's megaN on a live run (needs the key and network; checked by code only);
  ckwin-snapshot.mjs has **never run in GitHub Actions** (schedules run only main's update.yml, and main has never had the step). Unsure until the first merged daily run;
  its log must show the "ckwin snapshot: N checks" line.

### 1d. Things the new site reads that nothing writes (checked)
- META_KEYS (03-persistence.js:7) has 16 keys: the 13 the refresh writes plus `singles`, `status`, `post`. **Checked** with ArtifactData list
  of the live page's `meta` collection: 16 documents exist (calendar, doubles, doubles_ingame, doubles_tour, events, events_2, history, model, model_2,
  perf, practice, results, results_2, teams, track, weekly). **No meta/singles, meta/status or meta/post.** singles and status are an old gap
  (today's page reads them too, 29-fix-planner, 19-showdown-paste); post is filled by section 2.
- **Risk, unsure:** the new page waits for every META_KEY to answer before drawing numbers, or 8 s (shell.js:369). That is fine only if the host's
  `onSnapshot` answers once for a document that does not exist. The Preview never tested this: it declares **no capabilities** (Artifact list of
  8KBkk7PtbGjVzLzLKK5akf: "no contract pin · no runtime capabilities declared") and answers every db call from preview.json. If the host stays
  silent for missing documents, every visit waits 8 s for meta/singles and meta/status. Test it in the rehearsal (section 3d) before the switch.

### 1e. Proposals (not applied)
- health.mjs has no row for out/post.json (grep: 0 matches for "post"). Proposal: add
  `['post.json', 'News and Mystery Gifts', 3, d => d.checked, [1e3, 2e5], d => arr(d.news, 1) || 'no news']`.
  Unsure: whether post-news.mjs refreshes `checked` on a day with no new headline (not read).
  **Checked Nov 19, 2 AM:** it does not: post-news.mjs:89 leaves `checked` alone ("when a person last checked the gift list"), and
  out/post.json's `checked` is 2026-11-18T02:21:50Z. So this row as written would raise false 'stale' alerts. If added, use a shape-only
  row (limit 9999 like the paused op.gg row) checking `arr(d.news, 1)`, or have post-news.mjs write its own run date. Not applied.
- ckwin-snapshot.mjs builds and loads the OLD page (`node app/build.mjs`, hook `render();setView(view,false);`, ckwin-snapshot.mjs:13-14). It keeps
  working after the switch, but breaks (skips quietly) when the old page is deleted (R6). Note for R6, not a switch item.

---

## 2. The data refresh scheduled task ("NastyPlot data refresh", trig_014evvWRoLJicqGyvhYQCStx)

**Checked:** prompt read with get_trigger (read only; nothing changed). Cron `CRON_TZ=America/New_York 52 6 * * *`, last run 2026-11-18T23:20Z succeeded.
It writes 13 documents: results, perf (merge), doubles_tour, teams, history, model, doubles, doubles_ingame, events, track, practice, weekly, calendar.
The new code reads (grep of app/src/v2 and the shared parts in parts-v2.json): those 13 plus post (V2.postTake), singles and status (shared logic only).

**Must add:** meta/post from out/post.json, `post` in the split page-name list, `post` in the "delete a stale _2" list, a read-back for post.
Nothing else is needed (singles/status have had no producer since before the redesign; adding them is a separate decision).

Draft of the changed parts (proposal; the rest of the prompt stays word for word). Change it **only after** out/post.json exists on the `live`
branch (after the merge reaches main and Promote runs); before that the step just skips a missing file, so the order is not dangerous either way.

Step 3, first sentence becomes:
> 3) Also download out/meta_tour.json, out/teams.json, out/history.json, out/model.json, out/meta_ladder.json, out/meta_ingame.json, out/events.json,
> out/track.json, out/practice.json, out/weekly.json, out/calendar.json **and out/post.json**. For each one that downloads and parses: set
> meta/doubles_tour to meta_tour.json, ... meta/calendar to calendar.json, **meta/post to post.json**, each exactly as is — except that for a
> document the split index names (by its page name: results, doubles_tour, teams, history, model, doubles, doubles_ingame, events, track,
> practice, weekly, calendar, **post**), set meta/<name> to out/split/<name>.json and meta/<name>_2 to out/split/<name>_2.json instead.

Step 4, add after "meta/practice, meta/weekly, meta/calendar and meta/track exist;":
> meta/post exists with a "news" array of 1+ items and a "gifts" array (it is the News and Mystery Gifts list; if out/post.json was missing
> on the live branch, say so: the page then shows its built-in list);

Step 6, add: "whether meta/post was written and how many news items it holds".

Size check: post.json 22,645 bytes (split index `sizes.post`), far under the 262,144-byte document limit. Old page: does not subscribe to
meta/post (its META_KEYS predate Nov 18), so the doc is harmless during a rollback (by code).

---

## 3. The publish (D4)

### 3a. The build (run in this worktree; safe)
Command (app/build.mjs flags read at lines 29, 56, 68): `cd app && node build.mjs --v2 --public --split --one-art-size --art=v2art/`
- `--public`: drops the test hook; refuses `--preview-data`. `--split`: main script in dist/v2.js (`v2.js?v=<hash>`). `--one-art-size`: 384px art only
  (fits the 511 cap). `--art=v2art/`: pictures read from v2art/ beside the page. No `--fonts=` (default fonts/). Never `--preview-data`.
- **Checked** result lines: "v2 guard: clean", "v2 --split: dist/v2.js 1859 KB", "v2: static first screen 99 KB", "built dist/v2.html (572 KB; 16 CSS layers, 7 data files, 48 scripts, 62 shared logic files)".
  Needs Playwright with its browser for the static first screen (the repo's node_modules has 1.49.1 without a browser here; I used the
  pre-installed 1.63). The page head starts `<!doctype html>` with `window.NP_ART="v2art/";window.NP_ONE_ART=1;` and `<title>NastyPlot</title>`.
  Without esbuild it ships unminified; check the build prints no "esbuild not installed" line.

### 3b. Files that must be on the live artifact after the switch (359)
| Published path | Source | Count | Bytes (checked, wc -c / du -cb) |
|---|---|---|---|
| the page itself (index.html) | app/dist/v2.html via `file_path` | 1 | 687,398 |
| v2.js | app/dist/v2.js | 1 | 1,905,926 |
| fonts/*.woff2 (instrument-sans-latin, -latin-ext; unbounded-latin, -latin-ext, -cyrillic, -cyrillic-ext, -vietnamese) | app/dist/fonts | 7 | 292,588 |
| v2art/<id>.webp | app/src/v2/art (346 sprites, incl. 491 Darkrai) | 346 | 9,729,664 for all 350 webp |
| v2art/crowd-0..3.webp | app/src/v2/art | 4 | (in the line above) |
| **Total** | | **359** | **12,615,576** |

Not published: crowd.json and meta.json (inlined by the build as ART_CROWD / ART_META), preview.json, foundation.html, gallery.html, thumbs/, art/.
**Checked:** the 7 fonts are byte-identical to the 7 same-named fonts on the live artifact (sha256 prefixes match the Artifact files listing),
so they need no upload. 5 sampled art files (1000, 491, 10326, crowd-0, crowd-3) match the Preview's v2art/ sha256 prefixes, so v2art/ can be
copied server-side from the Preview (`files: {"v2art/1000.webp": {"artifact": "https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf", "path": "v2art/1000.webp"}, ...}`)
or uploaded from app/src/v2/art. Only 5 of 350 compared; re-compare all before using the copy route.

### 3c. Files to remove from the live artifact (null), and the cap
Live today (**checked**, Artifact list scope files, version 1794491686-b0d0): 359 files = index.html (3,068,985 bytes) + 13 fonts + 345 sp/*.webp.
- **345 sp/*.webp**: the new page never asks for sp/. Checked two ways. (1) Code: three shared share-image helpers use
  `window.__SPR[id] || 'sp/'+id` and team.js:290 sets `window.__SPR` to V2.art at load; `sprite()` in 15-visual-helpers.js:10 still builds
  `sp/` paths, and method.js:25 converts its output to V2.art. (2) Run: a Playwright probe of the built public page, opened with a 6-Pokémon team link,
  visiting all 26 pages and scrolling each: "requests sp/: 0  v2art/: 118  fonts/: 2", "sp/ in DOM: 0", "page errors: 0". Limits: default states
  only, built-in data (file://), no sheets opened, no share image drawn. Could have failed: any sp/ request or img would have counted.
- **6 old fonts** (archivo-italic-latin, -latin-ext, -vietnamese; dela-gothic-one-latin; instrument-sans-italic-latin, -latin-ext): the new page's
  fonts.css lists only the 7 above (grep of dist/v2.html). Removing them is optional for the cap; recommend removing (they are dead weight).
  Keep them if Sim wants the rollback to be a single publish (see 4).
- **Cap:** after the switch 359 files (+6 if the old fonts stay = 365), under 511. **Checked arithmetic.** Without removing sp/: 359 + 351 new = 710, over 511.

### 3d. How to send it: the 255-files-per-publish limit (REHEARSED Nov 19, 3:03-3:16 PM; replaces the earlier plan)
**Checked on a private scratch artifact** (https://claude.ai/artifact/GARZ7Ar2mNhA1fQgwTULEQ, Sim approved S1 at 2:49 PM; delete only with Sim's yes):
- **Removals (null) DO count toward the 255.** A publish of 250 adds + 10 nulls was refused: "`files` lists 260 entries (removals included),
  over the limit of 255 one publish may send. Nothing was published". So the old two-publish plan is impossible.
- The page itself does not count: page + 255 entries was accepted (R2). The 511-per-version cap held as computed (511 accepted).
- The old plan's fallback had a broken-picture window. **New order, no broken picture at any version:** a temporary "mixed" old page
  (docs/rebuild/switch-mixed-page.py) loads `v2art/<id>.webp` for sprites already uploaded and `sp/<id>.webp` for the rest. v2art has all
  345 sprite names (checked: 345 same names); the old page builds sprite paths in exactly 8 places (the script asserts 8). The mixed page goes
  right after the skeleton's `<body>` (standards mode checked: "compatMode CSS1Compat").
  - (R1) old page unchanged + first 152 v2art (sorted names) -> 511 files, 152 entries.
  - (R2) mixed page (ids of the first 255 sorted art = 254 sprites) + next 103 v2art + null the 152 sp of R1's ids -> 462 files, 255 entries.
  - (R3) mixed page (all 345) + last 95 v2art (incl. 491, crowd-0..3) + null the 102 sp of R2's ids -> 455 files, 197 entries.
  - (R4) new page + v2.js + null the last 91 sp + 6 old fonts -> **359 files**, 98 entries.
  Switch day: `python3 docs/rebuild/switch-plan.py <out>` writes R1..R4.json and ids_R2/ids_R3.txt and re-checks every step
  (checked Nov 19, 3:38 PM: its R2-R4 lists are identical to the rehearsed ones). No hand-typed lists.
  A simulation checked that at every version each picture the page asks for exists ("missing 0" at R2, R3, R4). The scratch's final list:
  359 files = page, v2.js (1,937,535 bytes), 7 fonts, 350 v2art, 0 sp/. Every publish was accepted.
- Local test of the mixed page with only 152 v2art + 193 sp present, all 21 old-site views clicked and scrolled: "loaded sp 44 v2art 32 failed 0
  broken imgs 0 errors 0". Could have failed: any sprite asked from the wrong folder fails to load.
- Look during R2-R3 (a few minutes): old page, but sprites from the new art, a little larger (tighter crop; object-fit:contain, nothing
  stretched). Picture: docs/rebuild/pics/nov19/S1-mixed-old-page.png (left today, right on v2art).
- Not tested here: the old mixed page on the real db (the scratch had no capabilities in R2/R3); share images on the mixed page (canvas
  drawImage may draw the tighter-cropped art at a slightly different scale). Both only for the few minutes of R2-R3.
- Build used: `cd app && node build.mjs --v2 --public --split --one-art-size --art=v2art/` ("v2 guard: clean", "dist/v2.js 1890 KB",
  "built dist/v2.html (578 KB ...)"). Needs PLAYWRIGHT_BROWSERS_PATH set to a folder with Chromium 1148, or it stops at the static first screen.
- Account saving, feedback and the missing meta documents wait need a logged-in browser: Sim opens the scratch on his phone (see questions).

### 3e. Capabilities and the rest of the publish call
**Checked** stored declaration on the live version (Artifact list): contract **0.2.90**; capabilities
`{"db":{"rules":[{"path":"","read":"view","write":"admin"},{"path":"data/users/{self}","write":"interact"},{"path":"usage","read":"owner","write":"owner"},{"path":"usage/{self}","read":"interact","write":"interact"},{"path":"feedback","read":"owner","write":"owner"},{"path":"feedback/{self}","read":"interact","write":"interact"}]},"downloads":{},"mcp":{"servers":[{"server":"Claude Code Remote","tools":["fire_trigger"]}]},"sample":{"images":true},"user":{}}`
- Publish with `url` = https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk, `file_path` = app/dist/v2.html, **omit `capabilities` and `contract`**
  (omitted = kept), omit `icon`. Read the artifact (action read) first in that session, or the publish is refused.
- The new code uses only db, user, downloads (grep of dist/v2.js: `use("db")` 3, `use("user")` 3, `use("downloads")` 2; no fire_trigger, no sample).
  Its db paths fit the rules: `data/users/<uid>/state`, `usage/<uid>`, `feedback/<uid>` (id = `await u.id()`), `meta/<k>` and `meta/<k>_2`.
- Unsure: whether the new page behaves the same under contract 0.2.90 as on the Preview (which has no contract pin). Rehearsal covers it.
- After publishing: Artifact list scope files must show 359 (or 365) files: the page, v2.js (1,905,926 bytes), 7 fonts, 350 v2art, 0 sp/.
  Then open on phone and desktop. (CLAUDE.md's "every publish carries the 345 sp/*.webp" rule must be reworded for the new page: open question.)

### 3f. Timing hazard: Track Record on the old page (checked)
The live page's code (= cb49701 + fonts patch, see 4) has fixed bands `TR_CUT = [80, 60, 40]` (cb49701 app/src/app/64-track.js:7) and no
`trSetCut` (grep of the live page: 0). Once the merged track.mjs runs on main, meta/track holds groups cut at 80/70/60 while the old page labels
them 80+/60-79/40-59/under 40: wrong labels on Track Record. Window: from the first 6:52 AM refresh after the merged daily job until the new page
is published. **Plan:** publish the new page before the 6:52 AM refresh that follows the merge's first daily run (or merge, publish the same day,
then fire the refresh once with Sim's go). The same hazard applies to any rollback after that refresh (see 4, step 7).
Other new fields are harmless to the old page by code (megaN extra key, ckwin unread, post not subscribed). Not checked: the old page with 12 movers.

---

## 4. Rollback: put today's live page back exactly

**Checked facts:** the live page is version 155 of docs/rebuild/live/README.md. I downloaded index.html (Artifact read, path index.html:
3,068,985 bytes, sha256 cb649884...). It is the host's wrapper (531-byte head + `\n</body></html>`) around a page whose sha256 starts
**c64ed33bd9e7a39d**: exactly the v155 hash in docs/rebuild/live/README.md. Rebuilding cb49701 + live-v155-fonts.patch today gives
sha256 2d927a0a... (3,069,009 bytes): **identical once whitespace is removed** (2,975,249 = 2,975,249 bytes, equal); the only differences are
CSS minifier spacing (esbuild 0.24.0 now). The 13 rebuilt fonts match the live artifact's 13 sha256 prefixes; 3 sampled sp/ files
(1000, 10326, 998) from app/sp match too (app/sp has 345 files, 10,402,182 bytes; not all compared).

Steps (each publish needs the main thread and Sim's go):
1. **Before the switch**, save the exact page: Artifact read url 5VBfLTR5sM4JU5NswJYyGk path index.html, strip everything up to and including
   the first `<body>\n` and the final `\n</body></html>`, check `sha256sum` starts c64ed33bd9e7a39d. Keep it somewhere durable that is NOT the
   public repo (it embeds Nov 11 data; privacy not checked). Fallback if lost: `git archive cb49701 app docs/mascot | tar -x -C X`,
   `git apply docs/rebuild/live/live-v155-fonts.patch` (inside X), `cd X/app && node build.mjs` -> dist/page.html (needs docs/mascot/darkrai.webp; whitespace-only differences, checked above).
2. Write down the live version id before the switch (today 1794491686-b0d0) and the switch version id after.
3. Publish to the same url: `file_path` = the saved page from step 1, files = 345 `sp/<id>.webp` from app/sp (or copied server-side from the
   live artifact's own earlier version if the tool allows `ver`), nulls for `v2.js` and all 350 `v2art/*`, and the 6 old fonts back if they were
   removed (sources: X/app/dist/fonts or app/src/fonts on cb49701 + patch). The same 255-per-call and 511-per-version limits apply (3d): with
   359 + 351 = 710 it again needs nulls first or in the same call.
4. Omit `capabilities` and `contract` (kept: the declaration in 3e is unchanged by the switch).
5. Artifact list scope files: exactly 359 files: index.html, 13 fonts, 345 sp/*.webp; no v2.js, no v2art/.
6. Open it; check the page draws, a team saves, Track Record and Home show data.
7. Data: nothing to roll back for most documents (the refresh keeps writing them; the old page ignores meta/post). Exception: Track Record
   labels (3f). If the rollback lasts more than a day, set track.mjs BANDS back to [80, 60, 40] on main (it regroups every event, track.mjs:33)
   and let the daily job + refresh carry it, with Sim's go.
8. Log it in decisions.md and tell Sim.

---

## 5. Promote and flakes (Tests 2)

**Checked** (promote.yml, test.yml on main via `git show origin/main:...`, test.yml on the branch, `gh run list` / `gh run view`):
- promote.yml: on `workflow_run` of "Test NastyPlot page" on main, moves `live` only if the run's conclusion is `success`, and only forward.
- Test runs on main start from a push (paths filter) or when "Update Limitless data", "Weekly settings re-check" or "Monthly accuracy check"
  finishes. `concurrency: test-<ref>, cancel-in-progress`: a push to main during the daily run cancels it, and a cancelled run never promotes.

**Jobs that gate Promote today (main):** code tests (frozen data, 35 min), data checks (today's data, 35 min), accuracy-gate (40 min).
live-audits has job-level `continue-on-error: true` (alert only).
**After the merge (branch file):** those three plus new site behaviour x4 (A-team, B-build, C-battle, D-meta-shell; 35 min each), new site full
quality check (55 min), new site code checks (35 min), new site small checks v2-minors x3 (35 min each). Non-blocking: behaviour in Safari's
engine and live-audits (continue-on-error). That is 12 blocking jobs instead of 3. Every new-site job runs on frozen data or the frozen test
fixture, so a daily data run cannot change their result; they can only flake or time out.
- Evidence of flakiness on the branch: run 1365 (36096db4, latest finished): every job green except the three v2-minors parts (five known
  failures, a helper is on them); quality check took 35 min of its 55. Run 1355: quality check failed, code tests cancelled, Safari failed.
  Runs 1331-1351: code tests cancelled at 35 min (since split, Nov 18). Safari-only flakes PKMN-01, SUG-05 (switch-readiness Tests).
- **Key point (checked by reading the refresh prompt):** the `live` branch only feeds out/ data to players. The new page's code reaches players
  only by a hand publish. So a new-site job blocking Promote protects no player; it only risks holding back the day's data.
- Note: per GitHub's docs a job with `continue-on-error: true` does not fail the run. Not observed in a run here (every run that had a Safari
  failure also had another failure).

Options (nothing changed):
- **A. Keep all 12 blocking.** Simplest; any new-site flake or a 55-min timeout freezes players on yesterday's data (the refresh then reports
  "live branch has not moved" after its 20-minute wait).
- **B. Skip the new-site frozen-data jobs on the daily trigger:** add `if: github.event_name != 'workflow_run'` to behaviour-v2, quality-v2,
  v2-checks, v2-minors (and behaviour-webkit). They still run and block on every code push (branch and main). Skipped jobs count as passing for
  the run's conclusion (GitHub behaviour; not observed here). Plus a new blocking **new-page smoke on today's data** (switch item Tests 3, the
  helper's job): the one new-site check today's data can break.
- **C. Make the new-site jobs alert-only everywhere** (`continue-on-error: true` + an issue like live-audits). Never blocks data, but code
  pushes lose their red X too.

**Recommendation: B.** Why: those jobs test code on frozen data, which a daily data run cannot change, and the live branch carries only data, so
blocking on them adds risk without protecting players; code pushes keep their full gate, and the smoke test covers what today's data can break.
Caveat: a code push to main that fails a new-site job leaves live where it was only until the next daily run passes (B lets that run promote).
That is acceptable because the live branch's code is never served to players; say so to Sim.

---

## 6. Shortest order on switch day (from these checks)
1. Merge rehearsal done and the merged branch fully green once (switch-readiness items 1-9); Promote policy chosen (section 5).
2. Rehearsal on a scratch artifact (3d): publish sequence, file counts, account save, feedback, the missing-document wait.
3. Save the exact old page (4, step 1). Write down live version 1794491686-b0d0.
4. Merge to main with Sim's yes; watch test.yml, then Promote (`live` = the merge commit).
5. Publish the new page (3b-3e) **before** the next 6:52 AM refresh after the merged daily job (3f). Check the file list.
6. Update the refresh task's prompt (section 2) with Sim's go; fire it once (Sim's go) and read back meta/post, meta/track bands, meta/events ckwin.
7. Next morning: the daily job log shows the post-news, ckwin and track lines; health passes; Promote moves live; the refresh reports meta/post.

## Open questions for Sim (real decisions only)
1. Promote after the merge: A, B (recommended) or C (section 5)?
2. May the main thread make a private scratch artifact to rehearse the publish and the account saving before the switch (3d)?
3. Remove the 6 old font files at the switch (recommended), or keep them so a rollback needs fewer files?
4. If a short broken window can't be avoided (3d, nulls count toward 255): OK to switch in a quiet late-night hour? **Moot (Sim, Nov 19, 3:24 PM): S1-A yes, the mixed-page order (3d) has no broken window; the switch can run at any hour.**
5. CLAUDE.md says every live publish carries the 345 sp/*.webp; after the switch it should say the 350 v2art files. May it be reworded?
6. Add meta/post to the refresh task now (it skips a missing file harmlessly) or only on switch day?

## Unsure, in one list
- Whether null entries count toward the 255-files-per-publish limit (3d).
- Whether the host answers `onSnapshot` for missing meta documents (else an 8 s wait on every visit) (1d).
- The new page on a real db and contract 0.2.90: never run (the Preview has no capabilities) (3e).
- ckwin-snapshot.mjs in GitHub Actions: never run; post-news.mjs against the real feed: not run here (1c).
- Only 5 of 350 art files and 3 of 345 sp files compared by hash; the old page with 12 movers not checked.

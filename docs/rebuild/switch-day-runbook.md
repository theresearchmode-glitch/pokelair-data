# Switch day runbook (Sat Nov 28, HH with Sim)

The new site becomes what players see at the same link. Copy-paste, top to bottom.
Dry run: Wed Nov 25, 1:14 PM - 2:03 PM Eastern (now.sh), by HH's helper, in a scratch worktree. Branch: alt/switch-dryrun-1.
Every time below was measured in that dry run unless it says "not measured".
"Checked" = I ran it or read it (how is said). "Not checked" = I could not.

---

## 0. How it works today (checked)

- **What players see** is the artifact "NastyPlot" (https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk).
  Its page code changes ONLY when someone publishes to it with the Artifact tool. No GitHub workflow publishes it.
  Checked: Artifact list (scope files) on Nov 25: version **1794491686-b0d0**, 359 files
  (index.html 3,068,985 bytes, 13 fonts, 345 sp/*.webp). Same version as Nov 19. Its index.html sha256 starts cb649884;
  the page inside the host wrapper starts c64ed33bd9e7a39d = the old v155 page (docs/rebuild/live/README.md).
- **Its data** lives in the artifact's own database (collection `meta`). The scheduled task "NastyPlot data refresh"
  (trig_014evvWRoLJicqGyvhYQCStx, 6:52 AM Eastern daily, fresh session) copies out/ files from the GitHub branch `live`.
  Checked: get_trigger (read only). The prompt was last changed Nov 10.
- **The `live` branch** is moved by .github/workflows/promote.yml, only after "Test NastyPlot page" (test.yml) passes on main,
  and only forward. Checked: `git show origin/main:.github/workflows/promote.yml`. On Nov 25 Promote moved live to 6671555b at 18:16 UTC
  (gh api promote.yml runs: success, 44 s).
- **Saved teams** live in the same database at `data/users/<id>/state` and in the browser as `cc2.state`. A publish does not
  touch the database. The new site reads and writes the same keys and shapes (03-persistence.js:35, :81 is shared by both
  sites). Test: app/test/v2-saved.mjs (SV-1 to SV-5: new page reads old saves, writes back in the old shape, old page reopens it,
  account copy wins). It is in the merge gate (step "saved") and passed in the dry run (section 9).
- **The capability declaration** on live (db with 6 rules, downloads, mcp fire_trigger, sample, user; contract 0.2.90) stays
  if `capabilities` and `contract` are left out of every publish (Artifact tool rule: omitted = kept).

## What must change for players to get the new site (checked)

1. The new code reaches `main` (so the daily job runs the new data steps: post-news, ckwin, Track Record bands).
2. The refresh task also writes **meta/post** (out/post.json) and **meta/info** (out/info.json). Today it writes neither.
   Checked: ArtifactData list of `meta` on live (Nov 25): 16 documents, no post, no info. The new page asks for both
   (03-persistence.js:7 META_KEYS). Both files are on the `live` branch already (`git ls-tree origin/live out/`).
   Sizes: post.json 22,645 bytes, info.json 85,420 bytes: under 200,000, so never split.
3. HH publishes the new page to the live artifact in 4 steps (R1-R4) so no picture is ever broken.
   Build for the artifact: `node app/build.mjs --v2 --split --one-art-size --art=v2art/`.
   **Not `--public`**: since Nov 24 that flag builds the Cloudflare site (Turnstile feedback, no Claude database path, CSP for
   nastyplot.org; checked: app/build.mjs:29, 162-213; 03-persistence.js:65; 53-feedback.js:9-10). The Nov 19 runbook's build line
   with `--public` is out of date. **Not `--preview-data`**: live reads its own database.

---

## 1. Friday (Nov 27): get ready (HH; nothing reaches players)

| # | Who | Step | Done when |
|---|---|---|---|
| F1 | HH (+Sim's yes for design6 merge) | Land the switch candidate on claude/design6 the normal way: worktree of origin/claude/design6, `git merge --no-ff origin/alt/gemini-switch`, `REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/alt/gemini-switch`, push. | GitHub green on design6. **Why Friday:** on Saturday design6 must need only ONE merge (main). See "Gate rules" below. |
| F2 | HH | Save the old page for the undo: Artifact `read`, url 5VBfLTR5sM4JU5NswJYyGk, path index.html. Keep the file (scratch + a durable copy). | `sha256sum` of the saved file starts **cb64988486289bd4** (as on Nov 25). |
| F3 | HH | Make the one-publish undo page now: `python3 docs/rebuild/switch-mixed-page.py <saved index.html> <(git ls-tree --name-only cb49701 app/sp/ \| sed 's#app/sp/##;s#.webp##') $S/undo/rollback-mixed.html` | Prints `replaced 8 sprite paths; ids on v2art: 345`. Dry run: 0.07 s. |
| F4 | HH (standing OK, Nov 24) | Edit the refresh task prompt: add out/post.json -> meta/post and out/info.json -> meta/info to step 3, `post` and `info` to the split-name list, and a read-back line for both in step 4 (draft wording: switch-runbook-nov19.md section 2; add info the same way). | The next morning's run reports meta/post and meta/info written. Harmless to the old page (it never reads them; checked by grep of META_KEYS in the old build). |
| F5 | HH | Write down the live version id (Artifact list, scope files). | Today 1794491686-b0d0. |

---

## 2. Saturday: the git part (HH; about 2.5 hours, mostly waiting on GitHub)

Pick a time away from the daily data job (update.yml cron `7 9 * * *` UTC = 4:07 AM Eastern, can start up to an hour late) and
away from the 6:52 AM refresh. A push to main during the data job's tests cancels them (test.yml `concurrency: cancel-in-progress`).
Start after about 7:30 AM Eastern.

```
# G1 (HH) clock and disk                                         ~1 s
bash docs/rebuild/now.sh; df -h /tmp        # keep > 6 GB free
S=/tmp/claude-0/-home-user-pokelair-data/204a9d61-5900-570f-b954-256bbb6b60d7/scratchpad
cd /home/user/pokelair-data && git fetch origin main claude/design6 live

# G2 (HH) worktree of design6, without the 1.5 GB of pictures      ~2 s (dry run 1.8 s, 417 MB)
git worktree add --no-checkout --detach $S/sw origin/claude/design6
cd $S/sw && git sparse-checkout set --no-cone '/*' '!/docs/rebuild/pics/' '!/docs/rebuild/mocks/' '!/docs/redesign/'
git checkout -q --detach origin/claude/design6 && ln -s /home/user/pokelair-data/node_modules node_modules

# G3 (HH) merge main into design6 (ONE merge)                     < 1 s (dry run 0.2 s)
git merge --no-ff origin/main -m "Switch: merge main into claude/design6

Claude-Session: https://claude.ai/code/session_01YGeTVTPLowhKWrgD2jqHEG"
git diff --name-only --diff-filter=U      # must print nothing; if out/* or data/* conflict: main wins:
#   F=$(git diff --name-only --diff-filter=U | grep -E '^(out|data)/'); git checkout --theirs -- $F && git add $F
#   any code conflict: stop and resolve by hand (switch-rehearsal-nov25.md shows how), then `git commit` with the message above.
```
Worked when: `Merge made by the 'ort' strategy.` and the conflict list is empty.
Careful: with `--no-edit` after a conflict, git keeps its "# Conflicts:" lines in the message. Always pass `-m` or edit them out.

```
# G4 (HH, after reading every helper report on this branch) the merge gate      ~6 min (dry run: 0.6 s checks + 5 min 22 s tests)
REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/main
```
Worked when the last line is `merge-check: ALL PASSED. Stamp written; the push may go.`
It stops at once (exit 1) if GitHub has not passed main's newest commit. If main's daily run is still going, wait for it
(`gh api "repos/theresearchmode-glitch/pokelair-data/actions/workflows/test.yml/runs?branch=main&per_page=1" --jq '.workflow_runs[0]|[.status,.conclusion]'`).

```
# G5 (HH) push to design6, then wait for GitHub                    push ~10 s; GitHub 41-70 min
git push origin HEAD:claude/design6
```
Worked when: the pre-push hook says nothing and the push prints `-> claude/design6`.
Go/no-go: test.yml on that exact commit = `completed success` (every job; Safari's job may be red, it is alert-only).
GitHub times on Nov 25 (gh api runs on alt/gemini-switch): 41 min (b9262e64), 70 min (d48525a7). Dry run 1: 41 min (run 45674280356, 18:21:17-19:02:15 UTC).

```
# G6 (HH, Sim's yes: "main") merge design6 into MAIN, main first   < 1 s + gate ~6 min (dry run: 0.6 s checks + 5 min 22 s tests)
cd /home/user/pokelair-data && git fetch origin main claude/design6
git worktree add --no-checkout --detach $S/m origin/main
cd $S/m && git sparse-checkout set --no-cone '/*' '!/docs/rebuild/pics/' '!/docs/rebuild/mocks/' '!/docs/redesign/'
git checkout -q --detach origin/main && ln -s /home/user/pokelair-data/node_modules node_modules
git merge --no-ff origin/claude/design6 -m "Switch: the redesign reaches main (merge claude/design6)

Claude-Session: https://claude.ai/code/session_01YGeTVTPLowhKWrgD2jqHEG"
git diff --stat origin/claude/design6 HEAD     # must print NOTHING (same files as the tested design6). If main moved: back to G3.
REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/claude/design6
git push origin HEAD:main
```
Why main first (checked by simulation, section 9): the pre-push hook checks every merge on the pushed branch's first-parent line.
Pushing design6's own commit to main would carry about 117 old design6 merges with no stamp, and the hook refuses
(simulated: 120 "pre-push REFUSED" lines). A merge made ON main has one merge in range (simulated: 1), and its tree is
identical to the tested design6 (checked: `git merge-tree` tree 4b357fee = the dry-run commit's tree).
Never use `--no-verify` without Sim's own words.

```
# G7 (HH) wait for main's tests and Promote                         ~70 min + 1 min
gh api "repos/theresearchmode-glitch/pokelair-data/actions/workflows/test.yml/runs?branch=main&per_page=1" --jq '.workflow_runs[0]|[.head_sha[0:8],.status,.conclusion]|@tsv'
gh api "repos/theresearchmode-glitch/pokelair-data/actions/workflows/promote.yml/runs?per_page=1" --jq '.workflow_runs[0]|[.head_sha[0:8],.conclusion]|@tsv'
git ls-remote origin live          # must show the merge commit's sha
```
Go/no-go: test.yml `completed success` on the merge sha, Promote `success`, live = merge sha.
A push to main runs every job (the new-site jobs skip only on the daily `workflow_run` trigger: test.yml line 26 `if: github.event_name != 'workflow_run'`),
so expect the long time, not main's usual 15-20 min.
If red: nothing reaches players (live stays put). Fix forward on design6, or revert on main (section 5).

---

## 3. Saturday: the publish (HH; Sim says yes first; about 15-20 min)

```
# P1 (HH) build the artifact page in $S/m (main = the tested code)        ~4 s (dry run 3.8 s)
cd $S/m && export PLAYWRIGHT_BROWSERS_PATH=$S/pw1148
node app/build.mjs --v2 --split --one-art-size --art=v2art/
```
Worked when it prints `v2 guard: clean` and `built dist/v2.html (...)`, and NOT `esbuild not installed`.
Without PLAYWRIGHT_BROWSERS_PATH it stops at the static first screen (Nov 19 note).

```
# P2 (HH) publish lists and the in-between pages                          < 1 s
python3 docs/rebuild/switch-plan.py $S/plan
python3 docs/rebuild/switch-mixed-page.py <saved index.html> $S/plan/ids_R2.txt $S/plan/mixed-R2.html
python3 docs/rebuild/switch-mixed-page.py <saved index.html> $S/plan/ids_R3.txt $S/plan/mixed-R3.html
```
switch-plan.py must print exactly (dry run, Nov 25):
```
R1 entries 152 files after 511 missing 0
R2 entries 248 files after 469 missing 0
R3 entries 206 files after 473 missing 0
R4 entries 106 files after 369 missing 0
final 369 files, 0 sp/. ...
```
(Fixed in this branch: it asserted 350 art files; there are 360 now (Reg M-D pictures), and app/sp has 355 while live has 345.
It now reads the live set from cb49701 and the art count from disk. Before the fix it stopped: `AssertionError: (360, 355)`.)

P3 (HH, Sim's yes) four publishes to the SAME url. Before the first: Artifact `read` with the url (no path), or the publish is refused.
Every publish: `url` = https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk, **no `capabilities`, no `contract`, no `icon`**.
`files`: each key `v2art/x.webp` -> `app/src/v2/art/x.webp`; each `null` stays null; `v2.js` -> `app/dist/v2.js`.

| Step | file_path (the page) | files | After it (Artifact list, scope files) |
|---|---|---|---|
| R1 | saved old index.html, unchanged | $S/plan/R1.json (152 adds) | 511 files |
| R2 | $S/plan/mixed-R2.html | $S/plan/R2.json | 469 files |
| R3 | $S/plan/mixed-R3.html | $S/plan/R3.json | 473 files |
| R4 | app/dist/v2.html | $S/plan/R4.json (v2.js, last sp nulls, 6 old fonts null) | **369** files: page, v2.js, 7 fonts, 360 v2art, 0 sp/ |

Time: not measured here (helpers never publish). The Nov 19 rehearsal on a scratch artifact took 13 min for 4 publishes.
The declaration line after R4 must still read: contract 0.2.90 · db (6 rules), downloads, mcp (1 server), sample, user.

```
# P4 (HH, Sim's go) fire the refresh once so meta/post and meta/info exist now
mcp__claude-code-remote__fire_trigger  trigger_id=trig_014evvWRoLJicqGyvhYQCStx
```
Then ArtifactData `list` collection meta on the live url: 18 documents (the 16 of today + post + info).

---

## 4. Go / no-go checks after R4 (Sim on iPhone, iPad, desktop app; HH by script)

- Home draws today's data date; no "Getting today's numbers" stuck after 10 s (unsure: meta/singles and meta/status do not exist;
  the page waits up to 8 s for them if the host stays silent: switch-runbook-nov19.md 1d. Never tested on the real database).
- My Team shows Sim's own saved team exactly as before; Saved Teams lists all of them.
- Damage Calc, Speed Tiers, Meta/Usage, a Pokémon page, an item sheet with counts, News and Gifts.
- Search finds a Pokémon, a move and a page.
- Feedback sends (writes feedback/<id>).
- Light and dark. No broken picture anywhere.
Any "no" that hurts players: undo (section 5) first, discuss after.

---

## 5. Undo (under 5 minutes)

**Page wrong (most likely case): ONE publish.**
Publish to the same url: `file_path` = $S/undo/rollback-mixed.html (made in F3), `files` = the 6 old fonts copied from the old version:
`{"fonts/archivo-italic-latin.woff2": {"artifact": "https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk", "path": "fonts/archivo-italic-latin.woff2", "ver": "1794491686-b0d0"}, ...}`
(the six: archivo-italic-latin, archivo-italic-latin-ext, archivo-italic-vietnamese, dela-gothic-one-latin, instrument-sans-italic-latin,
instrument-sans-italic-latin-ext). No capabilities, no contract. 6 entries, 375 files.
That is the old page, drawing its sprites from v2art/ (all 345 old sprite names exist there: switch-plan.py asserts it).
Checked locally (dry run): the undo page served with v2art/ only and no sp/ at all: `requests sp/: 0 v2art/: 12 failed: 0 | imgs 154 broken 0 | page errors 0`
(Home only, built-in data). The Nov 19 rehearsal clicked all 21 old views on the mixed page: 0 broken.
Not checked: the `ver` copy route on this artifact (if refused, upload the 6 fonts from app/dist/fonts after `node app/build.mjs`: same files, checked by sha on Nov 19).
Later, calmly: put sp/ back and remove v2art/ in 2-3 publishes if Sim wants the exact old file list.
Saved teams: untouched either way (the database is not part of a publish).

**Track Record labels after an undo** (switch-runbook-nov19.md 3f): once the merged daily job runs, meta/track has 80/70/60 groups and the
old page labels them 80/60/40. Only matters if the undo lasts past the next morning.

**Main's merge broke the daily job:** with Sim's go, on a main worktree: `git revert -m 1 <merge sha>`, push. live keeps the last good data
meanwhile (Promote only moves on green). Not dry-run (it would need a push to main).

---

## Gate rules the day must respect (checked in the dry run)

- merge-check.sh stops before any test unless: `REPORT_OK=1` (HH sets it after reading the helper report), GitHub `completed success`
  on the source branch's exact tip (test.yml only), HEAD^2 = that tip, nothing uncommitted, no conflict markers. Dry run:
  without REPORT_OK and while main's run was still going: `merge-check: STOPPED before the tests (2 problem(s)). Nothing may be pushed.`
  After main's run finished: only the REPORT_OK line failed.
- One merge per push on design6 and on main (the stamp is for HEAD only; the hook checks every first-parent merge in the range).
- merge.ff=false is set (`git config merge.ff` = false), so every merge makes a merge commit.

## 9. Dry-run results (Wed Nov 25)
Worktree: $S/swdry (sparse, 417 MB), started from origin/alt/gemini-switch d48525a7. node_modules linked. Disk stayed above 7.6 GB free.

| Step | Result (exact last line) | Time |
|---|---|---|
| `git merge --no-ff origin/claude/design6` (1694a9bb, 13 commits not yet in the candidate) | CONFLICT in app/src/v2/css/team-frame.css: switch fix d (My Team 390, 4.28 screens) vs design6 e19ce74a (Sim chose 4.35: one-line step note + step-1 spacing). Dry run kept BOTH blocks -> c85342d9. **HH must decide this for real** (design call). | 0.7 s |
| `git merge --no-ff origin/main` (6671555b) | `Merge made by the 'ort' strategy.` (test.yml only) -> 6c452d0c | 0.2 s |
| merge-check.sh origin/main, no REPORT_OK, main's run in progress | `merge-check: STOPPED before the tests (2 problem(s)). Nothing may be pushed.` | 0.6 s |
| same after main's run finished | only `FAIL  REPORT_OK=1 not set ...`; `PASS  GitHub passed main at 6671555b` | 0.6 s |
| gate tests (same 13 commands, same order, run by hand without REPORT_OK, so no stamp was written) | build `slim: 3500 KB -> 3043 KB` 0 s; run `ALL PASSED` 200 s; invariants `PASS J11-5` 6 s; v2-data-build `built dist/v2.html (4498 KB ...)` 4 s; commander `all passed` 3 s; score-src `all passed` 9 s; unrated `all passed` 48 s; a11y `PASS A11Y-6` 4 s; v2-public `all passed` 15 s; public-build `PASS PUB-6` 0 s; csp-self `PASS` 1 s; csp `PASS (4 hashed inline scripts, 0 CSP violations ...)` 6 s; saved `v2-saved: all passed` 26 s | 5 min 22 s (18:15:08-18:20:30 UTC) |
| live build `node app/build.mjs --v2 --split --one-art-size --art=v2art/` | `built dist/v2.html (863 KB; 26 CSS layers, 8 data files, 57 scripts, 62 shared logic files)`, `v2 guard: clean`, `dist/v2.js 3695 KB`, no esbuild line, no `__NP_PUBLIC` in the page | 3.8 s |
| switch-plan.py (before fix) | `AssertionError: (360, 355)` | - |
| switch-plan.py (after fix) | R1 152/511, R2 248/469, R3 206/473, R4 106/369, `final 369 files, 0 sp/.` | < 1 s |
| undo page: switch-mixed-page.py on the live index.html (read Nov 25, sha cb649884..., inner page c64ed33bd9e7a39d) with all 345 ids | `replaced 8 sprite paths; ids on v2art: 345`; local load with v2art/ only: `requests sp/: 0 v2art/: 12 failed: 0 \| imgs 154 broken 0 \| page errors 0` | 0.07 s |
| pre-push hook simulated (stdin lines, nothing pushed) | to main from the design6 line: 120 REFUSED lines (117+ old unstamped merges); to design6 from this branch: 6 REFUSED; to alt/switch-dryrun-1: exit 0; a merge made on main: 1 merge in range | < 1 s |
| GitHub on alt/switch-dryrun-1 (b1673c79, run 45674280356) | `completed success`: all 15 jobs success (behaviour x4, Safari, quality, code tests, new-site code checks x2, v2-minors x3, data checks, accuracy-gate, live-data audits) | 41 min |

Not run here: v2-minors (3 parts, ~27 min, in GitHub), the behaviour and quality jobs (GitHub runs them), any publish, any push to main or design6.

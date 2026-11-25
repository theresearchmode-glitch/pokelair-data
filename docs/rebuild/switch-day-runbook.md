# Switch day runbook (Sat Nov 28, HH with Sim)

The new site becomes what players see at the same link. Copy-paste, top to bottom.
Dry run: Wed Nov 25, 1:14 PM - 2:03 PM Eastern (now.sh), by HH's helper, in a scratch worktree. Branch: alt/switch-dryrun-1.
Revised Wed Nov 25, 3:00-3:07 PM (now.sh), with Scout's review (docs/rebuild/test-runs/scout-runbook-review-nov25.md on claude/design6,
12 items; the "Scout #n" tags below show where each one landed). The F1 merge was dry-run again at 3:00 PM (section 1).
Every time below was measured in a dry run unless it says "not measured".
"Checked" = I ran it or read it (how is said). "Not checked" = I could not.
**$S** everywhere = the scratchpad of the session doing the work (its path is in that session's system prompt).
Never copy an old session's path: a new container has none of its files (Scout #3).


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

## G0. Preflight: things that live only in one container (HH; run on Friday AND again first thing Saturday) (Scout #3, #9)

A new session = a new container. The hook, git settings, browser, node_modules and scratch files may all be missing.
Run this block in the session that will do the work, in ONE shell (the `export` must stay set for merge-check.sh).

```
# G0 (HH) preflight                                   all present: about 5 s; missing browser or node_modules: minutes (not measured)
S=<this session's scratchpad>                         # from the system prompt; NOT /tmp/claude-0/.../204a9d61-... (Wednesday's)
mkdir -p $S/undo $S/plan                               # Scout #9: F2/F3/P2 write here
cd /home/user/pokelair-data && bash docs/rebuild/now.sh; df -h /tmp        # keep > 6 GB free (Nov 25 3 PM: 5.4 GB free; clear old worktrees)

# a) the pre-push hook: present, executable, same as the repo copy
H="$(git rev-parse --git-common-dir)/hooks/pre-push"
if [ -x "$H" ] && cmp -s "$H" docs/rebuild/pre-push-hook.sh; then echo hook-ok
else cp docs/rebuild/pre-push-hook.sh "$H" && chmod +x "$H" && echo hook-installed; fi

# b) every merge makes a merge commit
git config merge.ff false; git config merge.ff         # prints: false

# c) node_modules with esbuild (the --v2 build needs it)
[ -d node_modules/esbuild ] && echo esbuild-ok || npm ci

# d) CI's browser: Chromium 131 = Playwright build 1148 (playwright 1.49.1)
export PLAYWRIGHT_BROWSERS_PATH=$S/pw1148
[ -d $PLAYWRIGHT_BROWSERS_PATH/chromium_headless_shell-1148 ] && echo pw-ok || npx playwright install chromium

# e) the undo files, from the branch, checked byte for byte
git fetch origin main claude/design6 live alt/switch-dryrun-1
git archive origin/alt/switch-dryrun-1 docs/rebuild/switch-undo | tar -x -C $S/undo --strip-components=3
(cd $S/undo && sha256sum -c SHA256SUMS) && wc -l < $S/undo/all345.txt
```
Worked when it prints: `hook-ok` (or `hook-installed`), `false`, `esbuild-ok`, `pw-ok`, then
`index.html: OK`, `old-page.html: OK`, `rollback-mixed.html: OK`, `345`.
- Checked (Nov 25, this container): hook present and identical to docs/rebuild/pre-push-hook.sh (`cmp`), `git config merge.ff` = false,
  node_modules/esbuild present, pw1148/chromium_headless_shell-1148 present. Step e) run into a test folder: 3x `OK`, `345`.
- d) checked only with `npx playwright install --dry-run chromium`: it installs `chromium-1148` and `chromium_headless_shell-1148`
  under $S/pw1148. The download host answered (curl -I: playwright-akamai.azureedge.net 200). The real download was not run (disk).
- Why d) matters (checked): in the F1 dry run below, without PLAYWRIGHT_BROWSERS_PATH `node app/test/run.mjs` and
  `strength-invariants.mjs` both crashed (last line `Node.js v22.23.5`); with it, invariants printed `PASS J11-5: {"n":30,"bad":0}`.
  merge-check.sh only finds the browser by itself in Wednesday's scratchpad (its PW_SCRATCH line is hard-coded), so the export is required.
- merge-ok stamps (.git/merge-ok/<sha>) are written by merge-check.sh in this container. Run merge-check and the push in the SAME
  container; a stamp from another session does not exist here, and the hook will refuse the push.

```
# G1 (HH) start condition: GitHub, not the clock (Scout #6)                                  about 5 s
R=repos/theresearchmode-glitch/pokelair-data/actions/workflows
gh api "$R/update.yml/runs?per_page=1" --jq '.workflow_runs[0]|[.status,.conclusion,.created_at]|@tsv'
gh api "$R/test.yml/runs?branch=main&per_page=1" --jq '.workflow_runs[0]|[.head_sha[0:8],.status,.conclusion]|@tsv'
git rev-parse --short=8 origin/main
gh api "$R/update.yml/runs?per_page=10" --jq '.workflow_runs[]|select(.event=="schedule")|[.created_at,.conclusion]|@tsv'
```
Go only when: the newest update.yml run is `completed` (success or skipped); main's newest test run is `completed success` AND its sha
= origin/main's sha; and FAST_DATA is off.
FAST_DATA: the variable itself cannot be read here (checked Nov 25: `gh api .../actions/variables/FAST_DATA` -> `HTTP 403`, the proxy
blocks it). Read it from the runs instead: the extra schedule times (01, 05, 13, 17, 21 UTC; update.yml line 8) end `skipped` when it
is off. Checked Nov 25: the 2026-11-24T22:00:34Z run = `skipped`; the daily runs = `success`. If an extra-time run says `success`,
FAST_DATA is on: ask Sim to set it off (GitHub > Settings > Secrets and variables > Actions > Variables) before G3.

---

## 1. Friday (Nov 27): get ready (HH; nothing reaches players)

Run G0 first.

### F1 (HH + Sim's yes for the design6 merge): land the switch candidate on claude/design6 (Scout #2)

Merge **origin/alt/switch-dryrun-1** (it already holds alt/gemini-switch, checked `git merge-base --is-ancestor`), not alt/gemini-switch.
Data (out/, data/) = origin/main's copy. Three code files by hand.

**Dry run, Wed Nov 25 3:00 PM** (design6 11effd8f + alt/switch-dryrun-1 e09a5ad9; `git merge-tree --write-tree`, then the same merge in a
throwaway sparse worktree $S/f1; nothing committed or pushed). design6 was 58 commits ahead of the branch, the branch 32 ahead of design6.
Conflicts: **30 files** = 27 out/* + 3 code files:
- out/: calendar, crosscheck, events, history, limitless, matches, meta_tour, model, official, perf, practice, ratings_log, reg, replays,
  replays_bo3, scoreboard, sources, teams, track, weekly (.json), and out/split/: events, events_2, index, model, model_2, results, results_2 (.json).
  No data/* file conflicted.
- `.github/workflows/test.yml` line 5: the `on: push: paths:` list. design6 added rules-fixes-test, mega-calc-crosscheck, public-build-test,
  pokemon-pages-test, feedback-worker-test, feedback-guard-test, worker/**, wrangler.toml, security-csp-test, strength-invariants, a11y-code,
  backup-sources-test, sources/**; the branch (main's side) added regulation.json, sources.mjs, names.mjs, perf.mjs, practice.mjs,
  crosscheck.mjs, date-switch-test, freshness-test, bo3-tagging-test, shadow-model-test, dec2-landing-fixes-test.
  **Resolution: keep both** (union, design6's order first: 53 + 55 entries -> 64).
- `official.mjs` line 22: design6 changed only the User-Agent e-mail to hello@nastyplot.org; the branch (main's Reg-profile code, gap G1)
  still had the old personal address. **Resolution: the branch's block, with the e-mail swapped to hello@nastyplot.org.**
  Result = byte-identical to origin/main's official.mjs today (checked: `git diff origin/main -- official.mjs` empty).
- `track.mjs` line 23: both sides moved the `const CAP ... BANDS` line; the branch already defines `const BANDS = [80, 70, 60]` at line 20
  (its own merge fix), so design6's line would declare BANDS twice. **Resolution: the branch's block.**
  Result = identical to the branch's track.mjs (checked: `git diff origin/alt/switch-dryrun-1 -- track.mjs` empty).
- After resolving: no unmerged files, no conflict markers in .github, *.mjs, app/src (grep); `node --check official.mjs track.mjs` ok;
  test.yml parses as YAML (python yaml.safe_load); out/ and data/ = origin/main exactly (`git diff --cached --stat origin/main -- out data` empty);
  `node app/build.mjs` -> `slim: 3502 KB -> 3044 KB ...`; `strength-invariants.mjs` -> `PASS J11-5`; `node app/test/run.mjs` -> `ALL PASSED` (206 s).
- The merge also brings the switch fixes into design6 (app/src/v2/css/team-frame.css, pages/matchups.js, stampede-hero.js, usage.js,
  app/test/v2-minors.mjs). **team-frame.css still has BOTH My Team blocks from dry run 1 (switch fix d vs Sim's 4.35 choice): HH must
  make that design call before F1 is pushed** (not decided here).
- Main moves every day (Nov 25: 44ea888e, the branch had main up to 6671555b). By Friday the out/ list will differ; the command handles any out/ or data/ file.

```
# F1a (HH) GitHub must have passed the branch tip first, or merge-check stops (checked: the tip e09a5ad9 and later doc commits have
#      NO test run: docs/ is not in test.yml's push paths; the only run on the branch is b1673c79). Start one by hand:      41-70 min
gh workflow run test.yml --ref alt/switch-dryrun-1        # not checked through this proxy (gh api actions/variables was refused);
#   if refused: GitHub MCP actions_run_trigger (workflow test.yml, ref alt/switch-dryrun-1), or Sim presses "Run workflow" on the Actions page
gh api "repos/theresearchmode-glitch/pokelair-data/actions/workflows/test.yml/runs?branch=alt/switch-dryrun-1&per_page=1" --jq '.workflow_runs[0]|[.head_sha[0:8],.status,.conclusion]|@tsv'
#   wait for: <tip sha>  completed  success

# F1b (HH) the merge                                                              seconds (not timed)
cd /home/user/pokelair-data && git fetch origin main claude/design6 alt/switch-dryrun-1
git worktree add --no-checkout --detach $S/f1 origin/claude/design6
cd $S/f1 && git sparse-checkout set --no-cone '/*' '!/docs/rebuild/pics/' '!/docs/rebuild/mocks/' '!/docs/redesign/'
git checkout -q --detach origin/claude/design6 && ln -s /home/user/pokelair-data/node_modules node_modules
git merge --no-ff --no-commit origin/alt/switch-dryrun-1        # prints: Automatic merge failed; fix conflicts ...
git diff --name-only --diff-filter=U | grep -vE '^(out|data)/'  # expect exactly: .github/workflows/test.yml official.mjs track.mjs
#   any OTHER code file here: stop, read both sides, write the resolution down before going on.
# data: origin/main's copy (main's daily data is the truth)
F=$(git diff --name-only --diff-filter=U | grep -E '^(out|data)/'); git checkout origin/main -- $F && git add $F
# code
git checkout --theirs -- official.mjs track.mjs
sed -i 's/simran\.jsbagga@gmail\.com/hello@nastyplot.org/' official.mjs
python3 - <<'EOF'
import re; p='.github/workflows/test.yml'; t=open(p).read().split('\n'); i=t.index('<<<<<<< HEAD')
A=re.findall(r"'[^']+'",t[i+1]); B=re.findall(r"'[^']+'",t[i+3]); pre=t[i+1][:t[i+1].index('[')+1]
t[i:i+5]=[pre+', '.join(A+[x for x in B if x not in A])+']']; open(p,'w').write('\n'.join(t)); print(len(A),len(B))
EOF
git add official.mjs track.mjs .github/workflows/test.yml
git diff --name-only --diff-filter=U                       # must print nothing
git grep -n 'simran' -- '*.mjs' '*.yml'                    # must print nothing
git diff --stat origin/main -- official.mjs out data       # must print nothing
node --check official.mjs && node --check track.mjs && echo syntax-ok
git commit -m "Switch: merge alt/switch-dryrun-1 into claude/design6 (data from main; test.yml paths both sides, official.mjs = main's, track.mjs = branch's)

Claude-Session: <this session's link>"
REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/alt/switch-dryrun-1     # about 6 min; last line: merge-check: ALL PASSED. Stamp written; the push may go.
git push origin HEAD:claude/design6
```
Done when: GitHub test.yml on the pushed design6 commit = `completed success` (41-70 min). **Why Friday:** on Saturday design6 must need only
ONE merge (main). See "Gate rules" below.
Known risk (switch-rehearsal-nov25.md, Wed 8:58 AM): 6 v2-minors checks failed with main's newer data then. The candidate branch fixed
them (GitHub green on b1673c79), but every new data day can add one. If GitHub goes red on design6: fix forward on design6, not Saturday.

| # | Who | Step | Done when |
|---|---|---|---|
| F2 | HH | Confirm live has not changed: Artifact `read`, url 5VBfLTR5sM4JU5NswJYyGk, path index.html; `sha256sum` it. | Starts **cb64988486289bd4** = `$S/undo/index.html` (checked by G0 e). If it differs: someone published; stop and tell Sim, then remake the undo page (F3). |
| F3 | HH | The undo page is already made and kept on alt/switch-dryrun-1 (`$S/undo/rollback-mixed.html`, sha ab44a4a2..., checked by G0 e). Only if F2 found a new page: `python3 docs/rebuild/switch-mixed-page.py <new index.html> $S/undo/all345.txt $S/undo/rollback-mixed.html` | Prints `replaced 8 sprite paths; ids on v2art: 345`. Dry run: 0.07 s. |
| F4a | HH (Scout #8) | **Save the refresh task's prompt before changing it**: `mcp__claude-code-remote__get_trigger trigger_id=trig_014evvWRoLJicqGyvhYQCStx`, write the stored prompt exactly to `docs/rebuild/switch-undo/refresh-prompt-before-F4.txt`, `sha256sum` it into SHA256SUMS, commit and push to alt/switch-dryrun-1. | The file is on the branch; `sha256sum -c SHA256SUMS` = 4x OK. Undo of F4 = update_trigger with this file's text. |
| F4b | HH (standing OK, Nov 24) | Edit the refresh task prompt: add out/post.json -> meta/post and out/info.json -> meta/info to step 3, `post` and `info` to the split-name list, and a read-back line for both in step 4 (draft wording: switch-runbook-nov19.md section 2; add info the same way). | The next morning's run reports meta/post and meta/info written. Harmless to the old page (it never reads them; checked by grep of META_KEYS in the old build). |
| F5 | HH | Write down the live version id (Artifact list, scope files). | Nov 25: 1794491686-b0d0. |

---

## 2. Saturday: the git part (HH; about 3.5 hours, mostly waiting on GitHub)

Run G0 and G1 first. G1 replaces the clock rule: the daily data job (update.yml cron `7 9 * * *` UTC = 4:07 AM Eastern, can start up
to an hour late; Nov 25 it ran 10:10-10:45 UTC, then its tests 10:45-11:00 UTC) must be finished, and main's tests completed.
A push to main during the data job's tests cancels them (test.yml `concurrency: cancel-in-progress`).

```
# G2 (HH) worktree of design6, without the 1.5 GB of pictures      about 2 s (dry run 1.8 s, 417 MB)
cd /home/user/pokelair-data && git fetch origin main claude/design6 live
git worktree add --no-checkout --detach $S/sw origin/claude/design6
cd $S/sw && git sparse-checkout set --no-cone '/*' '!/docs/rebuild/pics/' '!/docs/rebuild/mocks/' '!/docs/redesign/'
git checkout -q --detach origin/claude/design6 && ln -s /home/user/pokelair-data/node_modules node_modules

# G3 (HH) merge main into design6 (ONE merge)                     under 1 s (dry run 0.2 s)
git merge --no-ff origin/main -m "Switch: merge main into claude/design6

Claude-Session: <this session's link>"
git diff --name-only --diff-filter=U      # must print nothing; if out/* or data/* conflict: main wins:
#   F=$(git diff --name-only --diff-filter=U | grep -E '^(out|data)/'); git checkout --theirs -- $F && git add $F
#   any code conflict: stop and resolve by hand (docs/rebuild/test-runs/switch-rehearsal-nov25.md on claude/design6 shows how),
#   then `git commit` with the message above.
```
Worked when: `Merge made by the 'ort' strategy.` and the conflict list is empty.
Careful: with `--no-edit` after a conflict, git keeps its "# Conflicts:" lines in the message. Always pass `-m` or edit them out.

```
# G3b (HH) nothing the data job needs was lost in the merge (Scout #5)                         under 1 s
grep -nE 'post-news\.mjs|ckwin-snapshot\.mjs|track\.mjs|FAST_DATA' .github/workflows/update.yml | cut -c1-120
grep -n 'BANDS = ' track.mjs | cut -c1-60
grep -n "CONTACT = " http.mjs; grep -c 'hello@nastyplot.org' official.mjs
git grep -n 'simran' -- '*.mjs' '*.yml'                   # must print nothing
```
Worked when (checked on the F1 dry-run merge, Nov 25): update.yml shows `node post-news.mjs` (line 63), `node ckwin-snapshot.mjs` (95),
`node track.mjs` (100) and FAST_DATA (lines 6, 19, 20); track.mjs `const BANDS = [80, 70, 60]` (Track Record bands);
http.mjs `export const CONTACT = 'hello@nastyplot.org';`; official.mjs count `1`; the simran grep prints nothing.
Note: the hello@ User-Agent is NOT in update.yml (Scout's item named it there); it lives in http.mjs (CONTACT, used by every data fetch)
and official.mjs (its own UA). Checked: `git show --stat 44ea888e` = http.mjs, official.mjs, docs/legal-sources.md.
Any line missing: stop; the merge dropped it; fix before G4.

```
# G4 (HH, after reading every helper report on this branch) the merge gate      about 6 min (dry run: 0.6 s checks + 5 min 22 s tests)
REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/main      # same shell as G0 (PLAYWRIGHT_BROWSERS_PATH set)
```
Worked when the last line is `merge-check: ALL PASSED. Stamp written; the push may go.`
It stops at once (exit 1) if GitHub has not passed main's newest commit. If main's run is still going, wait for it (G1's second line).

```
# G5 (HH) push to design6, then wait for GitHub                    push about 10 s; GitHub 41-70 min
git push origin HEAD:claude/design6
```
Worked when: the pre-push hook says nothing and the push prints `-> claude/design6`.
Go/no-go: test.yml on that exact commit = `completed success` (every job; Safari's job may be red, it is alert-only).
GitHub times on Nov 25 (gh api runs on alt/gemini-switch): 41 min (b9262e64), 70 min (d48525a7). Dry run 1: 41 min (run 45674280356, 18:21:17-19:02:15 UTC).

```
# G6 (HH, Sim's yes: "main") merge design6 into MAIN, main first   under 1 s + gate about 6 min
cd /home/user/pokelair-data && git fetch origin main claude/design6
git worktree add --no-checkout --detach $S/m origin/main
cd $S/m && git sparse-checkout set --no-cone '/*' '!/docs/rebuild/pics/' '!/docs/rebuild/mocks/' '!/docs/redesign/'
git checkout -q --detach origin/main && ln -s /home/user/pokelair-data/node_modules node_modules
git merge --no-ff origin/claude/design6 -m "Switch: the redesign reaches main (merge claude/design6)

Claude-Session: <this session's link>"
git diff --stat origin/claude/design6 HEAD     # must print NOTHING (same files as the tested design6). If main moved: back to G1/G3.
REPORT_OK=1 bash docs/rebuild/merge-check.sh origin/claude/design6
git push origin HEAD:main
```
Why main first (checked by simulation, section 9): the pre-push hook checks every merge on the pushed branch's first-parent line.
Pushing design6's own commit to main would carry about 117 old design6 merges with no stamp, and the hook refuses
(simulated: 120 "pre-push REFUSED" lines). A merge made ON main has one merge in range (simulated: 1), and its tree is
identical to the tested design6 (checked: `git merge-tree` tree 4b357fee = the dry-run commit's tree).
Never use `--no-verify` without Sim's own words.

```
# G7 (HH) wait for main's tests and Promote                         about 70 min + 1 min
R=repos/theresearchmode-glitch/pokelair-data/actions/workflows
gh api "$R/test.yml/runs?branch=main&per_page=1" --jq '.workflow_runs[0]|[.head_sha[0:8],.status,.conclusion]|@tsv'
gh api "$R/promote.yml/runs?per_page=1" --jq '.workflow_runs[0]|[.head_sha[0:8],.conclusion]|@tsv'
git ls-remote origin live          # must show the merge commit's sha
```
Go/no-go: test.yml `completed success` on the merge sha, Promote `success`, live = merge sha.
A push to main runs every job, so expect the long time, not main's usual 15-20 min (Scout #10, corrected): after the merge, test.yml's
new-site jobs (behaviour-v2, behaviour-webkit, quality-v2, v2-checks, v2-checks-2, v2-minors) have
`if: github.event_name != 'workflow_run'` (they skip only on the daily data trigger), and the other four (test, data-checks, live-audits,
accuracy-gate) have `if: github.event_name != 'workflow_run' || (github.event.workflow_run.conclusion != 'skipped' && ... != 'cancelled')`.
Checked on the F1 dry-run merge's test.yml (lines 26, 56, 84, 222, 326, 469; and 112, 498, 532, 582). Line numbers move: use
`grep -n "if: github.event_name" .github/workflows/test.yml`. On main today (before the merge) the 4 jobs say only `!= 'skipped'`.
If red: nothing reaches players (live stays put). Fix forward on design6, or revert on main (section 5).

```
# G8 (HH) fresh News & Gifts before the publish (Scout #4)          about 50 min (Nov 25: data job 35 min, its tests 14 min, Promote 1 min)
gh workflow run update.yml --ref main          # not checked through this proxy; if refused: GitHub MCP actions_run_trigger, or Sim
                                               #   presses "Run workflow" on "Update Limitless data" (update.yml has workflow_dispatch, line 9)
gh api "$R/update.yml/runs?per_page=1" --jq '.workflow_runs[0]|[.event,.status,.conclusion]|@tsv'      # workflow_dispatch completed success
gh api "$R/test.yml/runs?branch=main&per_page=1" --jq '.workflow_runs[0]|[.event,.status,.conclusion]|@tsv'   # workflow_run completed success
gh api "$R/promote.yml/runs?per_page=1" --jq '.workflow_runs[0]|[.head_sha[0:8],.conclusion]|@tsv'           # new sha, success
git fetch origin live && git show origin/live:out/post.json | python3 -c "import json,sys;print(json.load(sys.stdin)['checked'])"
```
Worked when: `checked` is today's date (UTC). Why: main's update.yml before the merge has no post-news step, so post.json on live is
old (checked Nov 25: `checked` = 2026-11-18T02:21:50Z, a week old). The merged update.yml has it (G3b). Without G8 the new News & Gifts
page would open with week-old news until Sunday's run.
If the news step skipped (`news feed skipped (yesterday's list kept)` in the run log), tell Sim; the switch can go on, News stays old.

---

## 3. Saturday: the publish (HH; Sim says yes first; about 15-20 min)

```
# P1 (HH) build the artifact page in $S/m (main = the tested code)        about 4 s (dry run 3.8 s)
cd $S/m && export PLAYWRIGHT_BROWSERS_PATH=$S/pw1148
node app/build.mjs --v2 --split --one-art-size --art=v2art/
```
Worked when it prints `v2 guard: clean` and `built dist/v2.html (...)`, and NOT `esbuild not installed`.
Without PLAYWRIGHT_BROWSERS_PATH it stops at the static first screen (Nov 19 note).

```
# P2 (HH) publish lists and the in-between pages                          under 1 s
python3 docs/rebuild/switch-plan.py $S/plan
python3 docs/rebuild/switch-mixed-page.py $S/undo/index.html $S/plan/ids_R2.txt $S/plan/mixed-R2.html
python3 docs/rebuild/switch-mixed-page.py $S/undo/index.html $S/plan/ids_R3.txt $S/plan/mixed-R3.html
```
switch-plan.py must print exactly (dry run, Nov 25; same output from the F1 dry-run merge at 3 PM):
```
R1 entries 152 files after 511 missing 0
R2 entries 248 files after 469 missing 0
R3 entries 206 files after 473 missing 0
R4 entries 106 files after 369 missing 0
final 369 files, 0 sp/. ...
```
(Scout #1, fixed on design6 004e4be8 and on this branch: it asserted 350 art files; there are 360 now (Reg M-D pictures), and app/sp has
355 while live has 345. It reads the live set from cb49701 and the art count from disk. Before the fix it stopped: `AssertionError: (360, 355)`.)

P3 (HH, Sim's yes) four publishes to the SAME url. Before the first: Artifact `read` with the url (no path), or the publish is refused.
Every publish: `url` = https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk, **no `capabilities`, no `contract`, no `icon`**.
`files`: each key `v2art/x.webp` -> `app/src/v2/art/x.webp`; each `null` stays null; `v2.js` -> `app/dist/v2.js`.

| Step | file_path (the page) | files | After it (Artifact list, scope files) |
|---|---|---|---|
| R1 | $S/undo/index.html (the saved old page, unchanged) | $S/plan/R1.json (152 adds) | 511 files |
| R1-check | (Scout #12) Artifact `read`, path index.html, then `sha256sum` | - | starts **cb64988486289bd4** (= before R1). If not: stop. Do not go to R2; read the page, compare with $S/undo/old-page.html, and if the old page is not intact, undo (section 5). Not checked: whether a publish of an already-wrapped page comes back byte-identical (no helper may publish). |
| R2 | $S/plan/mixed-R2.html | $S/plan/R2.json | 469 files |
| R3 | $S/plan/mixed-R3.html | $S/plan/R3.json | 473 files |
| R4 | app/dist/v2.html | $S/plan/R4.json (v2.js, last sp nulls, 6 old fonts null) | **369** files: page, v2.js, 7 fonts, 360 v2art, 0 sp/ |

Time: not measured here (helpers never publish). The Nov 19 rehearsal on a scratch artifact took 13 min for 4 publishes.
The declaration line after R4 must still read: contract 0.2.90 · db (6 rules), downloads, mcp (1 server), sample, user.

```
# P4 (HH, Sim's go; only after G8 put fresh post.json on live) fire the refresh once so meta/post and meta/info exist now
mcp__claude-code-remote__fire_trigger  trigger_id=trig_014evvWRoLJicqGyvhYQCStx
```
Then ArtifactData `list` collection meta on the live url: 18 documents (the 16 of today + post + info), and meta/post's `checked` = today.

---

## 4. Go / no-go checks after R4 (Sim on iPhone, iPad, desktop app; HH by script)

- Home draws today's data date; no "Getting today's numbers" stuck after 10 s (unsure: meta/singles and meta/status do not exist;
  the page waits up to 8 s for them if the host stays silent: switch-runbook-nov19.md 1d. Never tested on the real database).
- My Team shows Sim's own saved team exactly as before; Saved Teams lists all of them.
- Damage Calc, Speed Tiers, Meta/Usage, a Pokémon page, an item sheet with counts, News and Gifts (news dated today, from G8).
- Search finds a Pokémon, a move and a page.
- Feedback sends (writes feedback/<id>). Do the rules allow it? (Scout #12) Checked by reading, not on live today:
  the live declaration recorded Nov 19 (switch-runbook-nov19.md line 173) has 6 db rules, among them
  `{"path":"feedback/{self}","read":"interact","write":"interact"}`, and the new page writes `d.doc('feedback/' + id)` with
  `id = await u.id()` (app/src/v2/pages/feedback.js:11), so the path is the viewer's own: allowed. The Nov 25 list showed "db (6 rules)",
  the same count; the rule text itself was not re-read on Nov 25 (helpers touch no artifact). HH: before R1, compare the live declaration
  with line 173; after R4, feedback must show its "sent" state, and ArtifactData `get` feedback/<Sim's id> must show the entry.
- Light and dark. No broken picture anywhere.
Any "no" that hurts players: undo (section 5) first, discuss after.

---

## 5. Undo (under 5 minutes)

**Page wrong (most likely case): ONE publish.**
Publish to the same url: `file_path` = $S/undo/rollback-mixed.html (from the branch, checked by G0 e), `files` = the 6 old fonts copied from the old version:
`{"fonts/archivo-italic-latin.woff2": {"artifact": "https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk", "path": "fonts/archivo-italic-latin.woff2", "ver": "1794491686-b0d0"}, ...}`
(the six: archivo-italic-latin, archivo-italic-latin-ext, archivo-italic-vietnamese, dela-gothic-one-latin, instrument-sans-italic-latin,
instrument-sans-italic-latin-ext). No capabilities, no contract. 6 entries, 375 files.
That is the old page, drawing its sprites from v2art/ (all 345 old sprite names exist there: switch-plan.py asserts it).
Checked locally (dry run): the undo page served with v2art/ only and no sp/ at all: `requests sp/: 0 v2art/: 12 failed: 0 | imgs 154 broken 0 | page errors 0`
(Home only, built-in data). The Nov 19 rehearsal clicked all 21 old views on the mixed page: 0 broken.
Not checked: the `ver` copy route on this artifact (if refused, upload the 6 fonts from app/dist/fonts after `node app/build.mjs`: same files, checked by sha on Nov 19).
Later, calmly: put sp/ back and remove v2art/ in 2-3 publishes if Sim wants the exact old file list.
Saved teams: untouched either way (the database is not part of a publish).
The refresh task: if it must go back too, update_trigger with docs/rebuild/switch-undo/refresh-prompt-before-F4.txt (F4a). Leaving the
new prompt is harmless to the old page (it never reads meta/post or meta/info).

**Track Record labels after an undo** (switch-runbook-nov19.md 3f): once the merged daily job runs, meta/track has 80/70/60 groups and the
old page labels them 80/60/40. Only matters if the undo lasts past the next morning.

**Main's merge broke the daily job (Scout #7):**
1. Order: **the page first, then main.** If main is reverted while the new page is live, the next daily run writes old-shape data
   (no post-news, Track Record bands 80/60/40) under the new page. So: page undo (above) first; then, with Sim's go, revert main.
   Revert main only together with the page undo, never alone. (If only the data job is broken and the page is fine: fix forward on
   design6 -> main instead; do not revert.)
2. Revert, on a main worktree (G6's setup, same container as G0): `git revert -m 1 --no-edit <merge sha>`, then `git commit --amend` to add the
   Claude-Session line, then `git push origin HEAD:main`. The revert is a normal commit (not a merge), so the pre-push hook lets it through without a stamp
   (checked by reading the hook: it only looks at `git rev-list --merges`). live keeps the last good data meanwhile (Promote moves
   only on green). Not dry-run (it would need a push to main).
3. **Re-merging later:** after a revert, git thinks design6's commits are already in main, so a plain `git merge origin/claude/design6`
   brings back almost nothing. First revert the revert on main (`git revert <revert sha>`, push, wait for green), then merge
   design6's newer fixes on top through the normal gate (G3-G7).


---

## Gate rules the day must respect (checked in the dry run)

- merge-check.sh stops before any test unless: `REPORT_OK=1` (HH sets it after reading the helper report), GitHub `completed success`
  on the source branch's exact tip (test.yml only), HEAD^2 = that tip, nothing uncommitted, no conflict markers. Dry run:
  without REPORT_OK and while main's run was still going: `merge-check: STOPPED before the tests (2 problem(s)). Nothing may be pushed.`
  After main's run finished: only the REPORT_OK line failed.
- One merge per push on design6 and on main (the stamp is for HEAD only; the hook checks every first-parent merge in the range).
- merge.ff=false is set (`git config merge.ff` = false), so every merge makes a merge commit. It is a setting of this container's
  clone: G0 b) sets it again in a new one.
- (Scout #11, info) The gate's 13 local tests do not include the feedback worker tests or the Pokémon-pages test; GitHub's test.yml runs
  them (worker/** and wrangler.toml are in its push paths after F1). So GitHub green, not the local gate, is the last word.

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
| F1 dry run (Wed 3:00 PM): design6 11effd8f + alt/switch-dryrun-1 e09a5ad9, `git merge-tree --write-tree --name-only`, then the real merge in $S/f1 (sparse) | 30 conflicts: 27 out/* + test.yml, official.mjs, track.mjs (list and resolutions in F1). Resolved tree 75f65204 (`git write-tree`), not committed | seconds |
| F1 dry run tests (PLAYWRIGHT_BROWSERS_PATH set) | build `slim: 3502 KB -> 3044 KB ...`; invariants `PASS J11-5: {"n":30,"bad":0}`; run `ALL PASSED` (exit 0) | build 0 s; run 206 s |
| F1 dry run tests WITHOUT PLAYWRIGHT_BROWSERS_PATH | run.mjs and invariants: last line `Node.js v22.23.5` (crash): why G0 d) exists | - |
| switch-plan.py on the F1 dry-run merge | same 5 lines as P2 (152/511, 248/469, 206/473, 106/369, `final 369 files, 0 sp/.`) | under 1 s |

Not run here: v2-minors (3 parts, about 27 min, in GitHub), the behaviour and quality jobs (GitHub runs them), any publish, any push to main or design6.

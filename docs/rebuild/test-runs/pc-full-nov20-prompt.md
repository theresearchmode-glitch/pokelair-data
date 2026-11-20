# PC full check, Nov 20 (paste into the Claude Code chat on Sim's Windows PC, about 5:30-6 PM)

Rules: CLAUDE.md applies. Fix only setup (installs, paths, browsers), never the code or the tests. Don't publish anything, don't
touch main. Every time you write comes from the clock (`Get-Date` in Eastern time). Label each result with the exact summary line.
No names or emails anywhere (COPPA). Never run `--sealed`.

## Goal
The Plans page step gp5-full: run EVERY check GitHub runs (.github/workflows/test.yml, all jobs) on Windows, on the newest commit of
claude/design6, as an independent second machine before the switch. GitHub's Linux run is the reference; this run finds anything that
only shows on Windows / a real GPU / Chrome on Windows.

## Steps
1. `git fetch origin claude/design6`, then in the pl-mascot worktree `git checkout --detach origin/claude/design6`. Write down the
   commit hash first.
2. Setup exactly as test.yml does it (npm ci, the pokemon-showdown build, Playwright 1.49.1 Chromium, the frozen test data
   `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/` for the code jobs; today's data for data-checks). Build the page
   before each job exactly as that job's steps do (with or without `--preview-data`, `--art=../src/v2/art/`). Say which build command
   you used for each job.
3. Run every job in test.yml, one job at a time, every `run:` step in order (the same as GitHub; `if: !cancelled()` means keep going
   after a failure). Keep each full output. Jobs (checked against test.yml): test, v2-checks, v2-checks-2 (if present: split from v2-checks on Nov 20), v2-minors (main1, main2, groups),
   quality-v2, behaviour-v2 (A-team, B-build, C-battle, D-meta-shell), behaviour-webkit (Safari's engine, as test.yml sets it up),
   data-checks, accuracy-gate, and live-audits (alert only: report, don't treat as a failure).
4. For each FAIL: run it once more on its own. Say steady or flaky. If it doesn't fail on GitHub's run for the same commit (Sim's
   Claude will compare), say "Windows only?" and save a screenshot of what the test looked at.
5. Look with your own eyes (screenshots at 100% zoom, light and dark) at: Home, My Team, Build (after Build Me a Team), Battle,
   Damage Calculator, Meta at 1920 and 1280, and anything a test flagged.
6. Save results to docs/rebuild/test-runs/pc-full-nov20.txt (commit tested, machine, how this run differs from GitHub, timings, exact
   summary lines, every FAIL line), screenshots to docs/rebuild/test-runs/pc-full-nov20/. Commit ONLY those files on claude/design6
   (pull first; if the push is rejected, `git pull --no-rebase` and push again) with a message ending in the line
   `Claude-Session: https://claude.ai/code/session_01YGeTVTPLowhKWrgD2jqHEG`, no model names.
7. Final message to Sim: one short line per job: passed / failed (steady, flaky, Windows only?) / setup problem, with the summary line.

# PC follow-up check, Nov 19 (paste into the Claude Code chat on Sim's Windows PC)

Rules: CLAUDE.md applies. Fix only setup (installs, paths, browsers), never the code or the tests. Don't publish anything, don't
touch main. Every time you write comes from the clock (`Get-Date` in Eastern time). Label each result with the exact summary line.

## Goal
Re-check, on Windows, only the findings from last night's PC run (docs/rebuild/test-runs/pc-nov19.txt) that GitHub's Linux machines
can't see, on the latest code. The Windows path quirk in the tests (URL.pathname) is fixed in the code now, so NO path shim this time:
if a path error still appears, report it as a finding.

## Steps
1. `git fetch origin claude/design6` and test its newest commit detached (as last time, in the pl-mascot worktree:
   `git checkout --detach origin/claude/design6`). Write down the commit hash first.
2. Setup exactly as .github/workflows/test.yml does it (npm ci, the pokemon-showdown build, Playwright 1.49.1 Chromium, the frozen
   test data). Read test.yml and follow how it builds the page BEFORE each job below (with or without `--art=../src/v2/art/`,
   `--preview-data`, PAGE=...): last night's "14 hero pictures didn't load" may come from building the page differently from
   GitHub. Say which build command you used for each item.
3. Run these, one at a time, and keep each full output:
   a. `PART=groups node app/test/v2-minors.mjs` (last night: MQ-9c, HQ Q13f, HQ Q7a, WK-1 failed).
      If HQ Q13f or Q7a still fail with "hero pictures didn't load": list which picture files the page asked for and whether they
      exist on disk (that tells setup from site).
   b. `PART=main2 node app/test/v2-minors.mjs` (last night: crashed at the test.yml path without the shim).
   c. qcheck-all exactly as test.yml runs it, then look at ONLY these findings with your own eyes and screenshot each:
      - News at 1280 and 1920 (day and night): "CAMPAIGN · NOV 24" overlapping "A New Mystery Gift". Is the ink actually touching,
        or only the boxes? Screenshot at 100% zoom, cropped to the two lines.
      - Home at 1280: the "/100" size (36.1px last night). Measure it in Chrome DevTools too.
      - The Mystery Gift source links at 320/390/820 (tap areas): should be gone now (fixed in e65d868b). Say if any are back.
   d. Safari's engine (WebKit 26.6, Playwright 1.63.0 as last time):
      `PAGE=app/dist/v2.html ADAPTER=v2 BROWSER=webkit node app/test/behaviour/run.mjs A-team --only=TEAM-07,EDIT-01b`
      (check test.yml / the harness for the exact WebKit switch; use the same one as last night). Then run each failing one 3 times
      to see if it is steady or flaky.
   e. WK-1 in WebKit: run it on its own (find how v2-minors selects it, e.g. ONLY=WK) and save the stamp picture it reads.
4. Save results to docs/rebuild/test-runs/pc-followup-nov19.txt in the same format as pc-nov19.txt (commit tested, machine, how this
   run differs, timings, exact summary lines, FAIL lines), screenshots to docs/rebuild/test-runs/pc-followup-nov19/.
   Commit ONLY those files on claude/design6 (pull first; if the push is rejected, `git pull --no-rebase` and push again) with a
   message ending in the line `Claude-Session: https://claude.ai/code/session_01YGeTVTPLowhKWrgD2jqHEG`, no model names.
5. Final message to Sim: one short line per item: fixed / still there (Windows only?) / flaky / setup problem, with the summary line.

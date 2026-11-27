# PC job, Nov 22 evening: Safari-engine (WebKit) behaviour run on today's reskins, with failure pictures

Paste everything below the line into Claude Code on the PC.

---
In my NastyPlot repo (theresearchmode-glitch/pokelair-data), do this and fix ONLY setup problems, never the site code or tests:

1. `git fetch origin && git checkout -B pc-run origin/claude/design6` and check `git log -1 --format=%h` shows 70cf10ab or later (write the hash in the summary).
2. `npm ci`, then `npm install --no-save playwright@1.63.0` and `npx playwright install webkit chromium`
3. Frozen test data so results compare with the cloud: `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/` (never commit out/).
4. Build: `node app/build.mjs --v2 --art=../src/v2/art/` and check it prints a line starting "built dist/v2.html".
5. For each of A-team, B-build, C-battle, D-meta-shell run (PowerShell: set each env var with `$env:NAME="value";` first):
   `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 FAILSHOT=docs/rebuild/test-runs/pc-nov22b/fail-<group> node app/test/behaviour/run.mjs <group>`
   and save each full output to docs/rebuild/test-runs/pc-nov22b/webkit-<group>.txt
6. Then the two Safari-only failures from the cloud, 3 times each, with pictures:
   `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 FAILSHOT=docs/rebuild/test-runs/pc-nov22b/fail-repeat node app/test/behaviour/run.mjs A-team --only=TEAM-07`
   `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 FAILSHOT=docs/rebuild/test-runs/pc-nov22b/fail-repeat node app/test/behaviour/run.mjs D-meta-shell --only=NAV-03v`
   (if --only says the group is wrong, find the group with `grep -rl "TEAM-07" app/test/behaviour` and use that). Save outputs to repeat-TEAM-07.txt / repeat-NAV-03v.txt.
7. Write docs/rebuild/test-runs/pc-nov22b/SUMMARY.md: the commit hash, each run's exact "behaviour:" result line, and every FAIL with its message.
8. Commit only docs/rebuild/test-runs/pc-nov22b/ (make sure out/ is not staged), message "PC run Nov 22b: WebKit behaviour on today's reskins",
   and push: `git push origin pc-run:refs/heads/pc-run-nov22b`.

# PC job, Nov 22: page lengths (for the desktop length rule) + Safari-engine (WebKit) behaviour run

Paste everything below the line into Claude Code on the PC.

---
In my NastyPlot repo (theresearchmode-glitch/pokelair-data), do this and fix ONLY setup problems, never the site code or tests:

1. `git fetch origin && git checkout -B pc-run origin/claude/design6`
2. `npm ci`, then `npm install --no-save playwright@1.63.0` and `npx playwright install webkit chromium`
3. Use the frozen test data so results compare: `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/` (never commit out/).
4. Page lengths, NOW: `node app/build.mjs --v2 --preview-data --art=../src/v2/art/` then
   `PAGE=app/dist/v2.html OUT=docs/rebuild/test-runs/pc-nov22/lengths-now.json node experiments/page-lengths.mjs`
   (on Windows PowerShell set env vars with `$env:PAGE="app/dist/v2.html"; $env:OUT="..."` first)
5. Page lengths, BEFORE the reskin: `git checkout 4f7220bb -- app/src` then build the same way and run the same script with
   OUT=docs/rebuild/test-runs/pc-nov22/lengths-before.json. Then put the code back: `git checkout pc-run -- app/src`.
   (experiments/page-lengths.mjs stays from pc-run; if the old build fails, write down the error and skip step 5.)
6. Safari engine: `node app/build.mjs --v2 --art=../src/v2/art/`, then for each of A-team, B-build, C-battle, D-meta-shell run
   `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs <group>` and save each full output to
   docs/rebuild/test-runs/pc-nov22/webkit-<group>.txt
7. Write docs/rebuild/test-runs/pc-nov22/SUMMARY.md: for each step the exact result line, and anything that failed with its message.
8. `git checkout pc-run -- out/` is NOT needed; just make sure out/ is not staged. Commit only docs/rebuild/test-runs/pc-nov22/,
   message "PC run Nov 22: page lengths + WebKit behaviour" ending with nothing else, and push: `git push origin pc-run:refs/heads/pc-run-nov22`.

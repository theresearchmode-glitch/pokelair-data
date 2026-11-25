# Prompt for Sim's second Claude account (Nov 23 afternoon): two parallel jobs

Paste everything below the line into Claude Code (cloud) on the second account, with the repo theresearchmode-glitch/pokelair-data attached.

---
You are helping on NastyPlot, Sim's Pokémon Champions team-builder site (Sim is he/him). Repo: theresearchmode-glitch/pokelair-data.
Start from branch `claude/design6` (git fetch origin claude/design6 && git checkout -B work origin/claude/design6). Its tip when this was written: dc9f9fe3.

READ FIRST, they bind you: CLAUDE.md (top to bottom, especially NO GENERIC AI DESIGN and the DESKTOP LENGTH RULE), docs/rebuild/RULES.md.
- No guessing: label every claim "checked (command + result line)" or "not checked".
- Times only from `bash docs/rebuild/now.sh`, never typed. No model names in commits.
- Everything on the shared kit (app/src/v2/kit.js, css/kit.css, css/tokens.css); `node app/test/v2-guard.mjs` stays clean.
- NEVER push to main or claude/design6, never publish or edit any artifact, never touch scheduled tasks. Each job pushes ONLY to
  its own branch below. HH (the main chat) reviews, decides and merges.

Set-up for each job (its own worktree): `npm ci`; frozen data `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/`
(never commit out/). Builds: `node app/build.mjs --v2 --art=../src/v2/art/` (pictures, behaviour suites);
`node app/build.mjs --v2 --preview-data --art=../src/v2/art/` (qcheck, minors, tap-size, lengths). Always check "built dist/v2.html"
and "guard: clean". Screenshots from app/dist/ in place. Label pictures with
`node docs/rebuild/preview-kit/label-picture.cjs '[["in.png","out.png","label"]]'` (a label with RECOMMENDED gets the green band).

JOB 1, branch `alt/len1280`: tool pages at 1280x800.
At 1440x900 every page is now within its cap (tool pages 3 screens). At 1280x800 these tool pages are still over 3 screens
(measured Nov 23 morning, numbers may have moved): Build 3.40, Test Run 3.36, Speed Tiers 3.39, Events 3.44, Usage 3.61,
Calc 3.15, Track Record 3.06. The length rule says "at 1280+ long single columns go two-up or side by side".
1. Measure each page at 1280x800 and 1440x900 (fresh browser per page; read experiments/page-lengths.mjs) and each section's
   height at 1280; write docs/rebuild/research/len1280-nov23.md.
2. For each page over 3.0 at 1280: build the change under 1440 only (1100-1439), using side space, two-up columns or tighter
   spacing on the 4px grid. No folds/tabs, no removed content, nothing changes at 1440+ or on phones, keep the look bold.
   One commit per page.
3. Per page: before/after pictures at 1280 (full page) in docs/rebuild/pics/nov23/len1280/; `ROUTES=<route> node
   app/test/qcheck-all.mjs` 0 new; `PAGE=app/dist/v2.html node app/test/tap-size.mjs`; `PAGE=app/dist/v2.html node
   app/test/v2-unbounded.mjs`; the behaviour group holding the page (A-team, B-build, C-battle, D-meta-shell:
   `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs <group>`, 0 FAIL); lengths at 1100, 1280, 1366, 1440.
4. Report: table before/after, check result lines, commit ids, anything you could not fix without folds.

JOB 2, branch `alt/fullcheck`: every test on one commit (Game Plan step), report only.
On the tip of claude/design6, run every check GitHub runs (.github/workflows/test.yml: read it and run each step), plus:
- behaviour A-team, B-build, C-battle, D-meta-shell in Chromium AND in WebKit (`BROWSER=webkit`; install WebKit with
  `npx playwright install --with-deps webkit` if needed);
- v2-minors all three parts (PART=main1, main2, groups);
- `node app/test/qcheck-all.mjs` (all pages) and `node experiments/polish-check.mjs` with TARGET=v2 (all views, 320-2560).
Fix ONLY setup problems, never the code or the tests. Write every result line into docs/rebuild/test-runs/fullcheck-nov23.md,
one line per check (command, result line, plain meaning), and list every FAIL with its message. qcheck-all also prints "N known
findings no longer seen": list them (do not rewrite app/test/qcheck-known.json). Commit the report to alt/fullcheck.

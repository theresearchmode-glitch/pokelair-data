# Second account, round 3 (Nov 22, 8:32 PM): two small jobs

Paste everything below the line into Claude Code (cloud) on the second account, repo theresearchmode-glitch/pokelair-data.

---
You are helping on NastyPlot, Sim's Pokémon Champions site (Sim is he/him). Start from `claude/design6`:
`git fetch origin claude/design6 && git checkout -B work origin/claude/design6`.
Read CLAUDE.md and docs/rebuild/RULES.md first; they bind you. Same set-up as docs/rebuild/test-runs/other-account-nov22-prompt.md
(npm ci; frozen data `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/`, never commit out/; check for the "built dist/v2.html" line).
Rules: never push to main or claude/design6; never publish or edit any artifact; never touch scheduled tasks; no model names in commits;
label every claim "checked (how)" or "not checked"; times only from `bash docs/rebuild/now.sh`. Do JOB A first. If usage runs low, stop and push what you have.

JOB A, branch `alt/calc-rain` (a BUG FIX, small): your Safari run found the Damage Calc's Rain button moves 21px when the page redraws at phone
width (limit 12): docs/rebuild/test-runs/safari2/fail/run3-C-battle/X-04.txt, test X-04 in app/test/behaviour/C-battle.mjs.
1. Reproduce: `node app/build.mjs --v2 --art=../src/v2/art/`, then `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs C-battle`
   (webkit as in your Safari run). Write the exact result line.
2. Find WHY it moves (what changes size or position on redraw: a font swap, an image without set size, a wrapping row). Say what you checked.
3. Fix it in the CSS/JS with the smallest change, kit tokens only (`node app/test/v2-guard.mjs` must stay clean). Do not change how it looks.
4. After: C-battle in BOTH browsers (chromium and webkit) 3 runs each, v2-guard, and
   `node app/build.mjs --v2 --preview-data && PAGE=app/dist/v2.html node app/test/qcheck-all.mjs` for the calc page. Before/after pictures at 390
   (docs/rebuild/pics/nov22/alt/calc-rain/). Report: docs/rebuild/research/calc-rain-fix.md with every result line.

JOB B, branch `alt/length-trim` (LOOK-ONLY, pictures and a proposal, no site code): three reskinned pages got longer than before.
Events is 3.07 screens at 1440x900 (cap 3, the 84px headline pushed it over); About and How We Calculate are about 0.4-0.5 screens longer
than before their reskin (the rule: never longer than before unless Sim OKs it). Measure each with `experiments/page-lengths.mjs` (exact lines).
For each page draw 2 ways back under (on the real built page, injected CSS, 1440 day, 1440 night, 390 day, with today's picture beside),
one marked RECOMMENDED with a one-line plain reason. No folds or tabs (Sim prefers natural scrolling); use side by side at 1280+; phone never longer;
keep the 84px kit headline (Sim approved Wave 3). No generic AI design.
Output: docs/rebuild/pics/nov22/alt/length-trim/ and docs/rebuild/research/length-trim-nov22.md.

At the end of each job: commit only that job's files, message ending `From Sim's second account`; `git push origin HEAD:refs/heads/<branch>`;
a 10-line summary (what was made, result lines, what was NOT checked).

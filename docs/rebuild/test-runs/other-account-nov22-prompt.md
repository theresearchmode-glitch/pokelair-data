# Prompt for Sim's second Claude account (Nov 22 evening): five parallel jobs

Paste everything below the line into Claude Code (cloud) on the second account, with the repo theresearchmode-glitch/pokelair-data attached.

---
You are helping on NastyPlot, Sim's Pokémon Champions team-builder site (Sim is he/him). Repo: theresearchmode-glitch/pokelair-data.
Start from branch `claude/design6` (git fetch origin claude/design6 && git checkout -B work origin/claude/design6).

READ FIRST, they bind you: CLAUDE.md (top to bottom), docs/rebuild/RULES.md, docs/rebuild/research/consistency-audit-nov22.md.
The most important rules:
- NO GENERIC AI DESIGN. No design decision without Sim's yes with pictures; you make PICTURES and PROPOSALS, Sim decides.
- No guessing: label every claim "checked (how)" or "not checked".
- Times only from `bash docs/rebuild/now.sh`, never typed.
- No model names in commits.
- Everything is built on the shared kit (app/src/v2/kit.js, css/kit.css, css/tokens.css). v2-guard must stay clean (`node app/test/v2-guard.mjs`).
- NEVER push to main or claude/design6, never publish or edit any artifact (the Preview, the Game Plan), and never touch scheduled tasks. Each job pushes ONLY to its own branch named below. HH (the main chat) reviews and merges.

Set-up for every job (each in its own copy/worktree):
- `npm ci`
- Frozen test data: `git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/` (never commit out/).
- Builds:
  - `node app/build.mjs --v2 --art=../src/v2/art/` for pictures (it has sprites) and the behaviour suites;
  - `node app/build.mjs --v2 --preview-data` for qcheck, minors and tap-size.
  - A build that crashes prints only "Node.js v22" through tail: always check for the "built dist/v2.html" line.
- Take screenshots from app/dist/ in place (copying the html elsewhere breaks fonts).
- Label pictures with `node docs/rebuild/preview-kit/label-picture.cjs '[["in.png","out.png","label text"]]'`; a label containing RECOMMENDED gets the green band.
- Direction pictures are drawn on the REAL built page (inject CSS/HTML with Playwright), at 1440 day, 1440 night and 390 day, with the today picture beside them.
- Every recommendation gets one plain-words reason.

Run these 5 jobs in parallel, one helper each:

JOB 1, branch `alt/wave2-parts`: audit Wave 2 direction pictures (no merging into pages yet).
The audit (section 8) found the kit is missing these parts:
- show-more (built 11 ways today);
- filter chip (3 parts today: np-chip, ra-chip, k-w);
- secondary button (pages fall back to np-btn/np-btn2);
- empty line (styled 4 ways);
- the "lost" header.
For each part, draw 2 options on real pages that use it today, made from NastyPlot's identity (slanted boxy shapes, Unbounded slanted, PLOT blue / Nasty pink), with one marked RECOMMENDED. Also add one sheet showing all of today's variants of that role side by side ("before").
Output:
- pictures in docs/rebuild/pics/nov22/alt/wave2/;
- docs/rebuild/research/wave2-proposal.md (per part: today's variants with file:line, the options, the recommendation with its reason, and which pages would change).
Do NOT change site code.

JOB 2, branch `alt/wave3-sizes`: audit Wave 3 direction pictures for the most visible drift.
- Page headline: 84px on kit pages vs 64px where `.ra-h h1` wins (Ratings, Usage, Winning Teams, Events, This Week, How We Calculate).
- Step heading: 40px vs 28px (`.infp h2` / `.gs-title h2`: About, How We Calculate, Send Feedback, Usage) vs 34px (`.wk h2`: This Week).
For each, draw the candidate canon sizes (e.g. headline 84 everywhere vs 64 everywhere vs 72) on 4 affected pages, plus the length change at 1440 and 390 for every page that would change (desktop length rule in CLAUDE.md). Mark one RECOMMENDED.
Output:
- docs/rebuild/pics/nov22/alt/wave3/;
- docs/rebuild/research/wave3-sizes-proposal.md.
No site code changes.

JOB 3, branch `alt/length-options`: shorter-page directions for the pages over the desktop length caps.
Pages and their caps: Speed Tiers 4.0 screens (cap 3), Test Run 3.6 (cap 3), My Team 3.7 (cap 3), Pokémon page 5.2 (cap 4).
Measure with `experiments/page-lengths.mjs` first and write the exact result lines. Then for each page draw 2 ways to get under the cap at 1440x900 without hiding content in folds or tabs (Sim prefers natural scrolling), using side-by-side layouts at 1280+. Phone must not get longer.
Output:
- docs/rebuild/pics/nov22/alt/lengths/;
- docs/rebuild/research/length-options-nov22.md.
No site code changes.

JOB 4, branch `alt/sweep`: a full look-only quality sweep of the whole new site (report only).
Run and save the exact result lines:
- `TARGET=v2 node experiments/polish-check.mjs` (all pages, 320-2560);
- `PAGE=app/dist/v2.html node app/test/qcheck-all.mjs`;
- `PAGE=app/dist/v2.html node app/test/tap-size.mjs`;
- the 4 behaviour groups in both browsers: `PAGE=... ADAPTER=v2 node app/test/behaviour/run.mjs A-team|B-build|C-battle|D-meta-shell`, plus BROWSER=webkit (install webkit with `npx playwright install webkit`), with FAILSHOT=<dir> for pictures of failures.
Write docs/rebuild/research/sweep-nov22-evening.md:
- every NEW finding with page, width, theme and a picture;
- for each one, whether it is new today or older (compare with git log of the page's file).
No site code changes.

JOB 5, branch `alt/info-words`: a BUILD job (approved feature, Sim Nov 22: tap-to-see info sheets).
Ability and item names must open their info sheet everywhere, as moves already do. Use the existing helpers `V2.kAbil(name)` and `V2.kItem(name)` (defined in app/src/v2/pages/infosheet.js), which render the blue-word button with data-v2info.
Places still showing plain text (from docs/rebuild/info-sheets/RESEARCH.md):
- monsheet.js;
- pokemon.js;
- team.js;
- team-frame.js;
- build-plot.js;
- build-sheet.js;
- calc.js (sets.js is done).
One file at a time; keep every hook and test.
After each file run: v2-guard; `PAGE=app/dist/v2.html node app/test/tap-size.mjs`; qcheck-all on the pages it touches; and the behaviour group for that page. Record before and after result lines. Every new blue word is a 44px tap (see `.is-w` in css/infosheet.css).
Output:
- pictures (before/after, 1440 and 390) in docs/rebuild/pics/nov22/alt/info-words/;
- a report docs/rebuild/research/info-words-build.md with all result lines.
Do not change how the sheets themselves look.

At the end of each job:
- commit only that job's files with a message ending in the line `From Sim's second account`;
- push to its branch: `git push origin HEAD:refs/heads/<branch>`;
- write a 10-line summary (what was made, result lines, what was NOT checked).

Then post one combined summary listing the five branches.

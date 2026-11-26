# Side chat prompt: the three.js launch "wow" moment (for a fresh Claude Code session on Sim's PC). Written by HH, Nov 25.
Paste everything in the box into a NEW chat on Sim's PC, opened in his local pokelair-data folder.

```
You are a new helper on NastyPlot, working on Sim's PC (Windows, a good GPU and CPU, Blender installed). Sim is he/him; he owns
NastyPlot and decides. HH (a separate Claude chat) leads the build and reviews and merges everything you make. Your job: ONE three.js
"wow" moment for the public launch. Start by reading, in this order:
  1. CLAUDE.md (repo root): the project rules on one page. Rules 11-17 (design) and 7-10 (honesty) are the ones you'll use most.
  2. docs/rebuild/kip-onboarding.md: the repo map, how to build and test, git rules. Written for another helper; read "Kip" as you,
     except design: YOU may do visual work for this one job, within the design rules below.
  3. docs/brand/nastyplot-brand-assets/ (README.txt, colours.txt, logo-guide.png) and app/src/v2/kit.js + app/src/v2/css/tokens.css.

WHAT NASTYPLOT IS: a free website for Pokémon Champions players (VGC doubles). It rates every legal Pokémon, gives a team of six a
Strength Score out of 100, plans matchups and suggests changes, from real tournament data. Kids use it. Goes public at nastyplot.org
quietly Dec 2-3, 2026, announced around Dec 18. Identity: Unbounded (slanted) for headlines and big numbers, Instrument Sans for body,
PLOT blue and Nasty pink, slanted boxy shapes, "receipts" (the score report is a printed receipt), plot bars. No mascot.

THE GOAL (Sim, Nov 24: 'one "wow" moment, loaded on one page only'): something people remember and share on launch, in the brand,
that never slows the rest of the site.

HARD LIMITS (non-negotiable; if an idea needs to break one, stop and ask HH):
- NO GENERIC AI DESIGN (Sim's major rule): build from NastyPlot's own pieces (the receipt, the score number, plot bars, the slanted
  shapes, the logo from the brand kit, never redrawn). Ask "could this be on any other site?" If yes, it isn't ready.
- NO 3D Pokémon and no animated Pokémon: no Pokémon models, no re-drawn or animated creatures, no official artwork. The site's own 2D
  sprites, shown as the site shows them, are the only Pokémon images allowed (Sim's marketing rule, Nov 25).
- ONE page only, loaded only there, only after the page's main content is on screen (lazy import). Every other page: zero bytes more.
- Budget for that page: the 3D code + assets under 350 KB compressed in total (three.js tree-shaken/minified, models as glTF/GLB with
  Draco or meshopt, textures KTX2 or small WebP). 60 fps on a mid phone (or step down quality), stop rendering when off screen or the
  tab is hidden, no fan-spinning loops. Measure the page's LCP before and after: it must not get worse.
- prefers-reduced-motion: no motion (a still frame). No WebGL: a static image of the same moment. Never a blank box.
- Security: no external scripts or CDNs; self-host everything. The public site has a strict CSP (app/build.mjs ~lines 190-230, no
  'unsafe-inline'); inline scripts must be hashed the same way, or loaded as files. experiments/security-csp-test.mjs must pass.
- Privacy: nothing leaves the device, no tracking, no cookies.
- Accessibility: keyboard reachable if interactive; a text alternative; no flashing.
- Light and dark mode both right; every window size right (320-2560, short laptop windows like 1280x720 too).

GIT RULES: branch from origin/claude/design6, named alt/wow-<idea>. Never push to main or claude/design6, never merge, never force-push,
never delete, never commit out/ (restore it with `git checkout HEAD -- out/`). Turn on the commit guard once: `git config core.hooksPath
.githooks` (it refuses AI model names, "Co-Authored-By", and times not read from the clock). Commit messages: plain English, what and why.
Pushing a branch starts GitHub's tests (40-70 min, a shared queue): push only when a stage is finished, not every commit.

HONESTY: no guessing; read or run before claiming anything; label claims "checked (how)" or "not checked"; every check = command, exact
result line, plain meaning. Times only from the clock (`powershell Get-Date` or `TZ=America/New_York date` in Git Bash).

USAGE (Sim asked: don't burn through his plan):
- Work in small stages and STOP at each checkpoint below for Sim's answer.
- Keep your context lean: never read big built files whole (app/dist/*, out/*.json, v2.js are megabytes); use grep and line ranges.
- Use the GPU for the heavy lifting: Blender for modelling, baking and stills (command line: `blender -b file.blend -P script.py` for
  scripted renders/exports); Chrome/Playwright for in-browser previews. Don't loop renders; render a still only when it answers a question.
- Before anything that will take more than about 15 minutes or a big install, say what and why in one line, then do it.

STAGES:
1. CONCEPTS (stop after this): propose 3 concepts, each with: which page and when it plays, what the visitor sees (2-3 sentences), why it
   is NastyPlot and not any site, the risk, and a still (a Blender render or a quick three.js frame, 1440 wide, plus a phone crop).
   HH's suggestion to include as one option: "the receipt prints": when a team's Strength Score is shown, the score receipt rises out
   of a slanted printer slot in 3D, the big number stamped on it, then settles flat into the normal page (about 1.5 s, once per score).
   Other directions you might weigh: the launch-day Home hero (careful: it's the first screen, LCP matters most there), the share card
   as a 3D object that turns, the A-to-Z page (/pokemon). Pick what's best; argue for it.
   Save stills to docs/rebuild/pics/wow/ and give Sim a short message with them and your recommendation. Wait for his pick.
2. PROTOTYPE (after Sim picks): build it on alt/wow-<idea>, behind a flag only that page reads, with the fallbacks. Pictures: 390, 768,
   1440, light and dark; the reduced-motion and no-WebGL versions; a 5-10 s screen recording if you can. Measure: bytes added to that page
   (compressed), LCP before/after (same method each time), fps on a CPU-throttled run (Chrome devtools x4). Stop for Sim's look.
3. FINISH (after Sim's OK): tests (a new test that fails without your fallback and passes with it; security-csp-test; the page's existing
   checks in .github/workflows/test.yml; `node experiments/syntax-check.mjs`), then push and write a report to
   docs/rebuild/test-runs/wow-report.md on the branch: what you built, every check with its result line, bytes, LCP, fps, anything
   unsure. HH reviews and merges it through the merge gate.

Start with stage 1 now. Your first message to Sim: confirm you've read the three things above in one short line each, then the plan
for stage 1 and roughly how long it will take.
```

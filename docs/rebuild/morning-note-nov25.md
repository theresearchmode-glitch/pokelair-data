# Morning note for Sim (Wed Nov 25) — HH. Updated by the night watchdog.
## NOW
- Night watchdog: GitHub tests still running on dec2 / j19 / j16 / practice branches (design6 bcdf69f1 = success).
## JUST DONE (Tue night)
- Redesign batch pushed to claude/design6 (bcdf69f1): all tests green; countdown short form; tagline sliver fixed.
- Kip lab ROUND 2 (8 weeks, 38,477 later games, paired): the COMBO (clean ridge + matchup term) beats today's model:
  accuracy +0.48 pts [0.16, 0.80], better log loss in EVERY slice (small/big events, common/rare teams). Sim decides; the
  next gate is the shadow check on new games (Kip job 24 part 3). Logs: docs/rebuild/test-runs/v3-lab-run2-nov24.*
- Kip lab: its copy of today's model is proven IDENTICAL to model.mjs on the real games (0.00000 difference).
- Kip job 23 (6 parts) applied on 4 branches and pushed. Working: feedback Worker (test passes), freshness test, data-pipeline docs,
  practice-switch script, Mega Sol calc changes. NEEDS FIXING (3, found by running the tests here):
  1. alt/gemini-j16: Kip's new Mega Sol tests crash in --src mode ("reading 'Fire'": the test's harness lacks the type chart).
  2. alt/gemini-j19: JSON-LD breadcrumb test fails (1 case).
  3. alt/gemini-dec2: Kip's freshness change to health.mjs breaks M-D day one (it calls a near-empty matches.json "broken" on
     the thin first days) — conflicts with job 8's rule. Must fix before Dec 2.
- Kip job 24 applied: alt/gemini-dec2 now has best-of-3 tagging (18/18), the SHADOW combo model + shadow scoreboard
  (off = live model byte-identical; test passes), M-D research in regulation.json/docs. alt/gemini-j19: security test + headers;
  ONE build.mjs hunk (the CSP wiring) didn't apply: fix by hand.
- Kip job 25 fixed all 3: j16 calc tests 14/14; j19 JSON-LD ALL PASSED (the 'bug' was a Gmail redirect the copy wrapped
  around a URL; 2 more removed in other tests); dec2 health now keeps outage alarms strict on M-D day one, all Dec 2 tests pass.
- Kip job 26 lab ROUND 3 (same 38,477 games, 8 weeks, 200 boots). Logs: docs/rebuild/test-runs/v3-lab-run3-nov25.*
  Four ideas stacked on the combo:
  - archetype matchup matrix (Trick Room / Tailwind / weather): only one that adds anything. vs combo: log loss -0.00020
    [-0.0004, -0.0000] (upper end touches zero = borderline), accuracy +0.15 pts [-0.05, +0.33] (could be zero).
    vs today's model: +0.63 pts [0.29, 1.00]. HH: promising, NOT proven; needs its own shuffle test + shadow check.
  - 60-day skill half-life: no added value. Recency-centred sets: no added value. Segment calibration: WORSE than combo.
  - Fake-data checks (combo): shuffled team labels -> the gain vanishes (PASS, it's real signal); leave-one-event-out ->
    no event drives more than 4.6% of the gain (PASS); time-reversed -> gain holds (+0.49), diagnostic only.
  - Best-of-3: still not testable (games aren't tagged yet; dec2 branch adds the tagging).
- Night fixes (watchdog, Wed 3:30-6:30 AM ET):
  - dec2: Kip's research put an END date on Reg M-D (Mar 4 2027). No official source says that (only Game8's guess), so
    it's back to "no end yet". GitHub: dec2 de2e4d57 = SUCCESS. practice-switch 1a9fd47a = SUCCESS.
  - j19 + j16 were built on an old redesign copy (13 commits behind); design6 merged into both.
  - j19: Kip's SEO code broke the PUBLIC page on every view ("Unexpected end of input": a regex lost its backslash inside
    a template string and became a // comment). Fixed (d12a39cb); v2-today now "all passed" here.
  - j16: Kip added Meowstic-F with no weight and no picture. Weight added (8.5 kg, Showdown's data; field check passes,
    rules 14/14). PICTURE NEEDS SIM'S PC (GPU upscale), see the PC job below. Until then j16 fails 2 picture checks.
## PC job for Sim (other chat, ~2 min): Meowstic-F picture
  On the PC: realesrgan-ncnn-vulkan.exe -i 10025.png -o 10025-x4.png -n realesrgan-x4plus-anime -s 4 -g 0
  (10025.png = PokeAPI HOME render; experiments/add-sprites.mjs 10025:Meowstic-F prints everything), then
  experiments/out/sprites/x4/10025.png -> run add-sprites.mjs again with --write --crowd. HH will paste a ready prompt.
## NEXT
- Archetype idea: run the shuffle check on it too, then shadow it next to the combo. Fix the 3 above (done by job 25); GitHub results for all branches; 7:41 AM Preview update; 4 PM: back to full work mode.

# Morning note for Sim (Wed Nov 25) — HH. Updated by the night watchdog.
## NOW
- Kip job 24 (mega stack 2) is with Kip. Lab round 2 (combo over 8 weeks) running.
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
## NEXT
- Fix the 3 above; GitHub results for all branches; 7:41 AM Preview update; 4 PM: back to full work mode.

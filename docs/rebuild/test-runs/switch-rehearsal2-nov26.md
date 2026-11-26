# Saturday switch rehearsal 2 (HH, time: 3:44 AM (3:44:47)  date: Thu Nov 26, 2026)
Scratch branch alt/switch-rehearsal2 af6c40e0 = origin/main + origin/claude/design6 b96f3a5e (tonight's night batch). Not for main.

## Conflicts (5, the runbook's list) and how they were resolved
- test.yml: paths union; steps from both sides kept (no-rk9, date-switch, syntax-check).
- update.yml: design6's post-news.mjs + post-data-test.mjs, then main's shadow scoreboard + MODEL_SHADOW model line; design6's plain model line dropped (model runs once).
- formats.mjs: main's REG_END from regulation.json (checked: gives M-C 2026-12-02T01:59:00Z, same as design6's hard-coded value).
- official.mjs: main's regulation.json-driven header (design6's would revert to REG = 'M-C').
- update.mjs: main's nTeams guard + design6's megaN: MG (MG defined at update.mjs:168).

## Both test lists (merge-check.sh's lists, run by exit code: swrun.sh)
```
== main list: frozen out/ of 0c992f69
  PASS  f-run  (ALL PASSED)
  PASS  f-replays  (ok   teams with an unknown Pokémon are skipped)
  PASS  f-reg-profile  (all passed)
  PASS  f-reg-switch  (ALL PASSED)
  PASS  f-no-rk9  (pass no data job or page file reads it)
  PASS  f-date-switch  (ALL PASSED)
  PASS  f-reg-guard  (ALL PASSED)
  PASS  f-md-data-gaps  (md-switch-data-gaps-test: ALL PASSED)
  PASS  f-md-day-one  (ALL 22 TESTS PASSED)
  PASS  f-freshness  (ALL PASSED)
  PASS  f-bo3-tagging  (bo3-tagging-test: PASS (all 18 assertions passed))
  PASS  f-shadow-model  (shadow-model-test: PASS (byte-identical live model, valid combo shadow + bc d=4, paired scoreboard across 2 da)
  PASS  f-dec2-landing  (ALL PASSED)
  PASS  f-speed  (reference: Sneasler Jolly 32 Spe = 189; with Unburden in item consumed = 378)
  PASS  f-calc  (exact or explained: 99.97%)
  PASS  f-legality  (Mega stones per official team: {"1":110,"2":402})
  PASS  f-threat  (PASS)
  PASS  f-fields  (PASS: every VGC-relevant field is in the data and used by the engine)
  PASS  f-suggest-gaps  (ALL PASSED)
  PASS  f-suggest  (SUGGESTIONS AUDIT PASSED)
  PASS  f-build-logic  (ALL PASSED)
  PASS  f-lead  (ALL PASSED)
  PASS  f-sync  (ALL PASSED)
  PASS  f-typing-sync  (PASS)
  PASS  f-sync-quiet  (ALL PASSED)
  PASS  f-golden  (10 of 10 known-answer cases pass)
  PASS  f-same-grade  (ALL PASSED)
  PASS  f-plan-cache  (ALL PASSED)
== main list: today's out/
  PASS  d-build  (slim: 3504 KB -> 3045 KB (dead CSS 195 KB: 284 rules, 343 selectors; short prefix 173 KB; never-used old rules)
  PASS  d-run  (ALL PASSED)
  PASS  d-threat  (PASS)
  PASS  d-lead  (ALL PASSED)
  PASS  d-golden  (10 of 10 known-answer cases pass)
  PASS  a-build  (slim: 3504 KB -> 3045 KB (dead CSS 195 KB: 284 rules, 343 selectors; short prefix 173 KB; never-used old rules)
  PASS  a-accuracy  (GATE PASSED)
== design6 list
  PASS  build  (slim: 3504 KB -> 3045 KB (dead CSS 195 KB: 284 rules, 343 selectors; short prefix 173 KB; never-used old rules)
  PASS  run  (ALL PASSED)
  PASS  invariants  (PASS J11-5: {"n":30,"bad":0})
  PASS  v2-data-build  (built dist/v2.html (4512 KB; 27 CSS layers, 8 data files, 57 scripts, 62 shared logic files))
  PASS  commander  (commander-test: all passed)
  PASS  score-src  (score-src-test: all passed)
  PASS  unrated  (unrated test: all passed)
  PASS  a11y  (PASS A11Y-6: {"exists":true,"ariaLive":null})
  PASS  v2-public  (v2-public: all passed)
  PASS  public-build  (PASS PUB-6: {"gatedBehindPublic":true})
  PASS  csp-self  (security-csp-test --self-test: PASS (positive + 2 negative assertions verified))
  PASS  csp  (security-csp-test: PASS (4 hashed inline scripts, static pages pokemon.html + 404.html, 0 CSP violations, 0 ex)
  PASS  saved  (v2-saved: all passed)
REHEARSAL DONE: 0 failed
```

## Notes for Saturday
- Kip job 46's data half (alt/gemini-news-ran-data c78d15e2) is NOT on main yet. It must be on main before the switch (runbook item 2;
  waits for Sim's OK). Added on top of the rehearsal as 1039d5ea (only conflict: test.yml paths, union); news-freshness-test,
  freshness-test, post-news-ran-test, post-news-test all exit 0 on the merged tree.
- GitHub's full run on this merged tree (with Kip 46 data): alt/switch-rehearsal2 1039d5ea (first push af6c40e0 time: 3:44 AM (3:44:47)  date: Thu Nov 26, 2026).

## GitHub
Full test.yml run on 1039d5ea: completed, success (run 45785844537).

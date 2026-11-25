# Dos job: full test run on the redesign (switch baseline) — HH, Wed Nov 25
Paste the block below into Dos (Sim's PC chat). Long run (1-3 h), no GPU needed.

---
Dos job from HH (Wed Nov 25): the switch baseline. Run EVERY check GitHub runs, on the redesign as it is now, and report.
Rules: never push to main or claude/design6; never publish; label every claim checked (how) or not checked; one test at a time.

1. git fetch origin && git checkout --detach origin/claude/design6 && git log --oneline -1   (report the sha)
2. Frozen data: git checkout 0c992f6977bc1cecc4e03eb269969a82b99681cf -- out/
3. Read .github/workflows/test.yml. For EVERY job that says "(frozen data)" or "new site", run its steps in order, exactly as written
   (builds included; skip only "npm ci", "playwright install" and "sleep" lines). Note each job's build command and run the tests
   that follow it before the next build.
4. For each test: the command, PASS/FAIL, and the exact last line. For a FAIL: the FAIL lines (max 5) and, if it looks like a slow-PC
   timeout rather than a real fault, say so and run that one test once more.
5. Put it all in docs/rebuild/test-runs/dos-switch-baseline-nov25.md, then: git checkout HEAD -- out/; commit only that file
   (message ends with a blank line then "Claude-Session: https://claude.ai/code/session_01YGeTVTPLowhKWrgD2jqHEG"),
   push to a NEW branch: git push origin HEAD:alt/dos-baseline
6. Report back: the sha you tested, totals (N pass / N fail), every FAIL with its line, and how long it took.
---

# Scout: switch-day runbook review (Wed Nov 25, 2:49 PM; runbook alt/switch-dryrun-1 020de065; report only)
1 BLOCKER switch-plan.py fix only on the dry-run branch (design6 asserted 350 art; 360 now) -> FIXED on design6 004e4be8.
2 HIGH F1 no longer a clean merge (design6 +49 commits): merge alt/switch-dryrun-1 instead of alt/gemini-switch; out/ and data/
  from origin/main; 3 code files by hand (test.yml, official.mjs, track.mjs); write the real steps (switch-rehearsal-nov25.md
  is referenced but on no branch: it IS on design6 at docs/rebuild/test-runs/switch-rehearsal-nov25.md - fix the path).
3 HIGH container-local things: pw1148 browsers, undo files, pre-push hook, merge.ff=false, merge-ok stamps, node_modules
  -> add a G0 preflight; undo files now durable on alt/switch-dryrun-1 docs/rebuild/switch-undo/ (e09a5ad9, with SHA256SUMS).
4 HIGH News & Gifts would go live 10 days old (live post.json checked Nov 18; main's update.yml has no post-news step):
  after G7 run update.yml by hand and wait for tests + Promote, then P4.
5 MED update.yml conflicts by hand could silently drop post-news / ckwin / Track Record bands / FAST_DATA / hello@ UA:
  after G3 grep update.yml for each line.
6 MED start only when the newest update.yml run and main's test run are completed (gh api), not by clock; confirm FAST_DATA off.
7 MED main rollback: after git revert -m 1, re-merging needs the revert reverted; revert main only together with the page undo.
8 MED F4 (refresh task prompt) needs its old prompt saved first.
9 LOW mkdir -p $S/undo before F3.  10 LOW G7's quoted test.yml line is out of date.  11 LOW info: gate doesn't run worker/Pokémon tests (GitHub does).
12 add: after R1 read back the page and check sha cb649884...; check live db rules allow the go/no-go feedback write.
Correct as written: G6 main-first logic; merge-check rules; 2 new META keys (post, info); sizes; 345 sprites; 360 art; gh api works.

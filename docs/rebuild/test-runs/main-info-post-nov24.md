# Main makes out/info.json each day, and keeps out/post.json (Nov 24)

Branch `alt/main-info` from **origin/main at c565e865**. Nothing pushed. Main's live site doesn't read either file yet.

## a) The info step on main
- update.mjs: claude/design6's "1b) info sheets" block copied word for word (checked: `diff` of the two blocks is empty), and
  `canonNature` added to its import from names.mjs.
- names.mjs: design6's nature lists and `canonNature` (8 lines: NAT_LIST read from data.js SETS.NAT, NAT_MAP, NAT_TYPO, canonNature),
  copied word for word.
- **Left out on purpose:** design6's `ITEM_TYPO` (17 item misspellings folded inside `canonSet`) and the `megaN` count in results. The
  info step doesn't import them. `ITEM_TYPO` changes `canonSet`, which main's other outputs (meta_tour sets and more) use, so bringing it
  would change main's live data, against "main's live site must behave exactly the same". HH can bring it as its own change if he wants
  the info counts to match design6 to the last team (the difference is below).

### Proof on main's data (a git worktree of c565e865, so main's checkout stayed untouched)
`MAX_FETCH=0 GAP=1000 node update.mjs` (no new tournaments fetched) → rc=0, log line:
`info: 7520 teams, 472 moves, 179 items, 202 Abilities, 24 natures (45120 of 45120 Pokémon with a readable nature)`.
design6's `experiments/info-only.mjs` on the same data/ (`OUTF=… node <design6>/experiments/info-only.mjs`) →
`info: 7520 teams, 472 moves, 174 items, 202 Abilities, 24 natures (45120 of 45120 Pokémon with a readable nature)`.
- Same N (7520), same period (Oct 27 – Nov 24), same source line, same keys in the same order for moves, Abilities and natures.
- Differences, all from ITEM_TYPO:
  - items: 179 vs 174 entries. 15 differ: the misspelled entries design6 folds ("Left Over" 6, "Chopple Berry" 3, "Grassy Seeds" 1,
    "Floettenite" 1, "Dragonitete" 1) and the items they fold into (Leftovers 2641 vs 2647, …).
  - one sheet's Dragonite holds "Dragonitete", which design6 reads as Dragoninite, so that Dragonite counts as Mega Dragonite. That moves
    1 between Dragonite and Mega Dragonite in 24 move entries, 2 Ability entries and 2 nature entries (e.g. Tailwind's Dragonite-Mega
    268/340 vs 269/341).
- **Proof that ITEM_TYPO is the only difference:** the same run with design6's whole names.mjs gives an info.json **byte-identical** to
  info-only.mjs's (`cmp`: no output).

## b) out/post.json
- design6's out/post.json copied to main (22,645 bytes, sha1 88487ea062bb…).
- Main's daily job can't delete or overwrite it (checked by reading and by running):
  - main has no post-news.mjs and no post-data-test; nothing on main reads or writes post.json (`grep -rn post.json *.mjs`: none)
  - scrub-names.mjs only rewrites and checks teams / events / weekly / official (scrub-names.mjs:53, 70)
  - split-docs.mjs only clears out/split/
  - the commit step is `git add -A`, which keeps untouched files
  - ran: after `node update.mjs`, `node events.mjs` and `node weekly.mjs` on main's data, out/post.json is byte-identical (`cmp`: no output)
- **Limit:** on main nothing updates it either, so its gifts and news stay as of design6's copy (checked Nov 18) until main gets
  post-news.mjs (a separate step; not done here).

## c) Main's checks before and after
| Check | before (clean main c565e865) | after (new update.mjs + names.mjs, out/post.json, out/info.json present) |
|---|---|---|
| build | page.html rc=0 | page.html rc=0 |
| run | rc=0: ALL PASSED | rc=0: ALL PASSED |
| golden | rc=0: 10 of 10 known-answer cases pass | rc=0: 10 of 10 known-answer cases pass |
| same-grade | rc=0: ALL PASSED | rc=0: ALL PASSED |
| threat-check | rc=0: PASS | rc=0: PASS |
| lead-logic | rc=0: ALL PASSED | rc=0: ALL PASSED |
| suggest-audit | rc=0: SUGGESTIONS AUDIT PASSED | rc=0: SUGGESTIONS AUDIT PASSED |
| suggest-gaps | rc=1: 2 FAILED | rc=1: 2 FAILED |
| legality-check | rc=0: Mega stones per official team: {"1":128,"2":480} | rc=0: Mega stones per official team: {"1":128,"2":480} |
| build-logic | rc=0: ALL PASSED | rc=0: ALL PASSED |
| plan-cache-test | rc=0: ALL PASSED | rc=0: ALL PASSED |
| replays-test | rc=0: ok   teams with an unknown Pokémon are skipped | rc=0: ok   teams with an unknown Pokémon are skipped |
| sync-logic | rc=0: ALL PASSED | rc=0: ALL PASSED |
| sync-quiet | rc=0: ALL PASSED | rc=0: ALL PASSED |
| typing-sync | rc=0: PASS | rc=0: PASS |
| speed-check | rc=0: reference: Sneasler Jolly 32 Spe = 189; with Unburden in item consumed = 378 | rc=0: reference: Sneasler Jolly 32 Spe = 189; with Unburden in item consumed = 378 |
| calc-check | rc=0: exact or explained: 99.99% | rc=0: exact or explained: 99.99% |
| accuracy-gate | rc=0: GATE PASSED | rc=0: GATE PASSED |
| health | rc=0: data health: all sources current | rc=0: data health: all sources current |

- Every summary line is identical before and after (`diff` of the two summaries with run times removed: no output).
- Full logs compared line by line (run times removed): the same in 19 of 20. One detail inside a passing run.mjs check differs: "spread
  editor: your spread is saved and used (Adamant,32,32,false,0)" before vs "(…,1)" after. That last number counts "assumed" markers in
  slot 0, 200 ms after Save, and the check doesn't test it. Re-runs: clean main gave 1 twice, the after-setup gave 1 twice, so the first
  0 was run-to-run variation, not this change. run.mjs feeds the page a fixed list of out/ files (run.mjs:13), without info.json or post.json.
- **suggest-gaps fails on main before AND after** ("2 FAILED": Mega Swampert's "a rain setter is in the first two Fix it plans", box and
  whole roster). This is main's state today, not caused by this change; flagged for HH.
- fields-audit (needs @pkmn/dex) and the v2 / Preview checks were not run (main's live site doesn't build or read the new files).
- health.mjs (the daily data-health gate): "data health: all sources current" before and after.

## Commits / patches
alt/main-info: names.mjs + update.mjs (the info step), out/post.json, this report. out/info.json itself is not committed: the daily job
writes it on its next run (the proof run's copy is in the zip).


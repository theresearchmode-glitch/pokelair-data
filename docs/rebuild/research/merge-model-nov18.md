# Merging main into claude/design6: the Strength Score model (Nov 18)

Question: after `git merge --no-commit origin/main` into claude/design6 (split at ff6bff40), is the merged model
(whole Protect family + teamHalf 0) at least as good on real later games as main's live model and the branch's?

Answer: yes, no worse. On the walk-forward scoreboard all three tie (NO DIFFERENCE in every comparison, best-of-1 and best-of-3).
All model gates pass on the merged tree, except suggest-audit. That check also fails with main's own model.json, so the model is not the cause.

## 1. The merge (checked)

- model.mjs and model-settings.json auto-merge. The merged files hold both changes:
  - model.mjs line 55: `process.env.PROT_FAMILY !== '0' ? /:(Protect|Detect|Spiky Shield|King's Shield|Baneful Bunker|Silk Trap|Burning Bulwark|Obstruct)$/ : /:Protect$/` (branch, ea3e1172)
  - model.mjs lines 88-102: `TEAM_HALF` read from `SETTINGS.teamHalf`; `WT` weights for the team-wide basics (main, 4441f1fb)
  - model-settings.json: `"half":14 ... "pairShrink":4,"teamHalf":0` (main)
  - app/src/app/35-win-model.js (the page) keeps the branch's Protect family; experiments/board.mjs uses it too (`PROT_FAMILY !== '0'`).
- Not expected: the merge conflicts in **28 files**, not only out/model.json. These are: test.yml, update.yml, 8 app/src/app files,
  app/src/head.html (main's self-hosted fonts vs the branch's Google Fonts link), app/test/behaviour/* (add/add), and
  out/events.json and out/track.json. The merge plan needs to cover all of them.
- main's live out/model.json (7964fe83) has **no `sixes`, `ctr` or `leads`**. That commit ran only `node model.mjs`; the daily job
  also runs six.mjs, ctr.mjs and leads.mjs. Checked by comparing the keys in 9ec472a1 and 7964fe83: sixes, ctr and leads are present before and missing after.
  The next daily run should put them back. Until then, the live page has no six records, learned matchups or lead values.

## 2. The refit (checked)

Data = origin/main's out/ (out/events.json and out/track.json taken from main). Same steps as update.yml:
`node model.mjs` → `node six.mjs` → `node ctr.mjs` → `node model-guard.mjs` (GUARD_PREV = main's model.json) → `node leads.mjs`.

- model.mjs: `model: ships, 322 Pokémon, 660 pairs, 927 set features`
- model guard: `log-loss 0.68418 → 0.68453 · calib 0.702 · rank correlation 0.993` / `model guard: ok`
- six: 1359 sixes; ctr: 67 Pokémon, 2211 pairs; leads: 113 Pokémon

| | main live (7964fe83) | branch (ea3e1172) | merged refit |
|---|---|---|---|
| data | Nov 18, 44,392 games | Nov 10, 39,052 games | Nov 18, 44,392 games |
| noMega | -0.6264 | -0.719 | -0.6226 |
| protectLow | -0.1851 | -0.2253 | -0.2394 |
| calib | 0.723 | 0.788 | 0.702 |
| sixes / ctr / leads | missing | present | present |

protectLow gets more negative because more teams now count as having Protect (the Detect/Spiky Shield users), so having 2 or fewer users means more.
The model's own held-out log-loss is 0.00035 worse (0.68418 vs 0.68453). That is inside the guard's 0.005 tolerance, and it is a single split.
The scoreboard below is the real test.

Saved: `/tmp/claude-0/-home-user-pokelair-data/25f65f15-063e-5621-be2b-3a9994dfed43/scratchpad/merged-model.json`.

## 3. Real later results (checked; walk-forward, never --sealed)

`node experiments/split-scoreboard.mjs --tag …` runs 4 weekly windows Oct 12 to Nov 9. Each week is scored by a model trained only on
earlier events. All three runs score the same 18,642 games.
The three versions are the merged code run 3 ways: main = `PROT_FAMILY=0`, branch = `TEAM_HALF=14`, merged = as is.
Why these are the same code: merged vs main differs only in the Protect lines, and merged vs branch only in teamHalf. With locked settings every fit uses half 14, so
TEAM_HALF=14 gives the branch's weights exactly. The main run reproduces main's commit numbers exactly
(best-of-1 53.76% / 0.68737, best-of-3 56.14% / 0.68008), and the branch run matches ea3e1172 (0.68084).
Gaps are paired on the same games, 2,000 resamples by tournament (95% ranges).

**Best-of-1** (1,966 games, 26 tournaments; small, wide ranges)

| | log-loss | pick rate |
|---|---|---|
| main | 0.68737 (0.68000 to 0.69505) | 53.76% (51.55 to 56.15) |
| branch | 0.68685 (0.67929 to 0.69514) | 53.51% (51.54 to 55.49) |
| merged | 0.68678 (0.67926 to 0.69483) | 53.81% (51.73 to 55.72) |

- merged minus main: log-loss -0.00059 (-0.00142 to 0.00042), pick +0.05 pts (-0.61 to 0.80): NO DIFFERENCE
- merged minus branch: log-loss -0.00007 (-0.00027 to 0.00014), pick +0.31 pts (0.08 to 0.61): NO DIFFERENCE (log-loss decides)

**Best-of-3** (16,676 games, 219 tournaments)

| | log-loss | pick rate |
|---|---|---|
| main | 0.68008 (0.67775 to 0.68249) | 56.14% (55.32 to 56.96) |
| branch | 0.68013 (0.67758 to 0.68261) | 56.19% (55.36 to 57.08) |
| merged | 0.68011 (0.67762 to 0.68259) | 56.23% (55.38 to 57.11) |

- merged minus main: log-loss +0.00003 (-0.00030 to 0.00048), pick +0.10 pts (-0.25 to 0.37): NO DIFFERENCE
- merged minus branch: log-loss -0.00002 (-0.00008 to 0.00004), pick +0.04 pts: NO DIFFERENCE

What this can't see: a difference smaller than these ranges. Best-of-1 has only 1,966 games, so a real gap of about 0.001 log-loss could hide there.
It also can't see the sealed games (Nov 9 on). These are unknowns, not "no effect".

## 4. Gates on the merged tree (checked)

Setup: out/model.json = the merged refit, plus today's data. The 8 conflicted app/src/app files are taken from the branch side and
head.html from main's side, because the branch side fails app/build.mjs: `a Google Fonts link is back in the page`.

| check | result line |
|---|---|
| app/build.mjs | `built dist/page.html (3469 KB from 140 parts…)` |
| app/test/run.mjs | `ALL PASSED` |
| golden.mjs | `10 of 10 known-answer cases pass`; weakest six `59` (main's model on the same tree: `58.5`) |
| same-grade.mjs | `ALL PASSED` |
| suggest-audit.mjs 30 5 | `1 FAILED`: weather nothing uses (Gengar-Mega, Incineroar, Kingambit, Kommo-o, Politoed, Rillaboom) |
| threat-check.mjs | `PASS` |
| lead-logic.mjs | `ALL PASSED` |
| fields-audit.mjs | `PASS: every VGC-relevant field is in the data and used by the engine` |
| suggest-gaps.mjs | `ALL PASSED` |
| accuracy-gate.mjs | `GATE PASSED` (160 of 188 top-4 teams 80+; log-loss 0.68057 vs baseline 0.68046) |

- suggest-audit fails the same way with main's model.json on the same tree (`1 FAILED`, same team), so the cause is not the model.
  I'm unsure whether it comes from the branch-side app files or from today's data. On main this audit now runs as alert-only.
- golden's weakest six passes with only 1 point to spare (59). Worth watching after the next daily refits.

## Plan for the merge

The model is safe to merge. On out/model.json, take neither side as is: use the merged refit (or let the daily job write it), because it
is the only one with both changes, today's data and sixes/ctr/leads. The other 27 conflicts need their own resolution.

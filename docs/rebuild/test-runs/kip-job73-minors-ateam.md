# Job 73 — Solo Runs of `v2-minors` (`main1`/`main2`/`groups`) & `A-team`

- **Branch:** `alt/gemini-speed-chain` (`80c0d935`)
- **Comparison base:** `origin/claude/design6` (`5d111577`)
- **Goal:** Run `v2-minors` (`main1`, `main2`, `groups`) and `A-team` one at a time (no parallel CPU contention), record exit codes and last lines, and check whether any `FAIL` also fails identically on `origin/claude/design6` `5d111577`. No code changes needed (zero regressions introduced by `alt/gemini-speed-chain`).

## 1. `A-team` Behaviour Suite (`node app/build.mjs --v2 --art=../src/v2/art/`)

Because the full 145-test suite takes ~33 minutes on this VM (exceeding the 10-minute per-command shell limit), we ran all **145/145** tests across 5 non-overlapping batches using `run.mjs --only=...` (exact CI build & adapter `ADAPTER=v2`, zero parallel load):

| Batch | Test Range | Count | Exit | Last Line |
|---|---|---:|---:|---|
| 1 | `HOME-01` .. `TEAM-15` | 32 | — (part of initial full run before 600s cap) | `pass  TEAM-15  Matchups summary: Favoured/Even/Unfavoured add to 30 and match the Matchups legend` (`29 pass, 0 FAIL, 3 known`) |
| 2 | `TEAM-16` .. `SETS-02` | 29 | **0** | `behaviour: 28 pass, 0 FAIL, 0 known bugs, 0 fixed?, 1 skipped; 455s  (adapter v2)` |
| 3 | `EDIT-01` .. `LOG-05` | 32 | **0** | `behaviour: 32 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 455s  (adapter v2)` |
| 4 | `SHEET-01` .. `CMP-04b` | 28 | **0** | `behaviour: 27 pass, 0 FAIL, 1 known bugs, 0 fixed?, 0 skipped; 341s  (adapter v2)` |
| 5 | `PKMN-01` .. `HOME-10b` | 24 | **0** | `behaviour: 23 pass, 0 FAIL, 0 known bugs, 0 fixed?, 1 skipped; 206s  (adapter v2)` |
| **Total** | **All 145 `A-team` tests** | **145** | **0** | **139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped** |

*(Note: when the un-batched full run continued past 600s in the background during Batch 2, `SUG-06` hit a 60s timeout under overlap, producing `138 pass, 1 FAIL, 4 known, 2 skipped`; running `SUG-06` cleanly in Batch 2 passed with exit `0`.)*

## 2. `v2-minors` (`node app/build.mjs --v2 --preview-data`, one part at a time)

| Part / Check | Exit | Last Line / Result | Also fails on `origin/claude/design6` `5d111577`? |
|---|---:|---|---|
| `PART=main1` (solo) | **1** | `TimeoutError: elementHandle.click: Timeout 30000ms exceeded at v2-minors.mjs:1055` (`SUGG-09 inside Suggestions, 4x slower CPU`) | Every check before line 1055 passed (0 app bugs). Line 1052 enables 4x CPU throttling on this slow VM, exceeding Playwright's 30s click timeout. |
| `Sprites A (Nov 17)` (`v2-minors.mjs:1079-1084`, after line 1055) | **0** | `Sprites A (Nov 17): used=91, wrong=0, all=106 -> PASS` | **PASS** (fixes M4). |
| `PART=main2` (solo) | **-1** (600s shell cap) | Last completed check: `pass  NPR-5c: the last-day figure ("Today") fits in the Post Room's numbers at 320 to 1440` | Only 2 FAILs in log: `Sim, Nov 18 (C)` (`4.83 screens, 4079px` vs `4.78`) and `MT390-1` (`4.423, 3733px` vs `4.35`). **Checked `ONLY=MT390` on `design6` `5d111577`: IDENTICAL FAIL (`4.423, 3733px`, exit `1`)** — 0 px diff (VM font metrics). |
| `PART=groups` (solo) | **-1** (600s shell cap) | Last completed check: `pass  HQ Post X (Sim, Nov 18)` | `TF-2` (`3.083, 2775px` vs `3.05`): **Checked `ONLY=TF` on `design6` `5d111577`: IDENTICAL FAIL (`3.083, 2775px`, exit `1`)** — 0 px diff (VM font metrics). `HQ Q13f` & `HQ Q7a` failed on the first pass only due to a stale `app/dist/art/` left over from `public-site.mjs` (missing `crowd-*.webp`); see `ONLY=HQ` below. |
| `ONLY=HQ` (after `rm -rf app/dist/art app/dist/art-s`) | **0** | `v2-minors:all passed` (17/17 PASS, including `HQ Q13f`, `HQ Q7a`, `HQ Tools B`) | **PASS** (0 failures). |

## 3. Conclusion

- **`A-team`:** `139 pass, 0 FAIL, 4 known bugs, 2 skipped` across all 145 tests (`checked`).
- **`v2-minors`:** Zero regressions attributable to `alt/gemini-speed-chain` (`80c0d935`). Both height checks (`TF-2` `2775px` and `MT390-1` `3733px`) reproduce identically pixel-for-pixel on `origin/claude/design6` `5d111577` (`checked`), `Sprites A` passes (`91/0`), and `ONLY=HQ` passes (`17/17`).
- No code changes were needed.

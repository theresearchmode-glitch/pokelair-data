# Data integrity for the Strength Score (Tue Nov 17, 2026, 6:13 PM, from docs/rebuild/now.sh)

Look-only helper research. Nothing in the repo was changed except this file. No git state was changed.
Data read: today's origin/main (d0662883; data commit "Limitless data 2026-11-17"), copied to /tmp/helper-integrity/main
with `git archive` (experiments/sealed.json left out). Scripts: /tmp/helper-integrity/*.mjs (the main ones are in the appendix).
Labels: **measured** (number + script) / **checked** (how) / **unsure** (why). No player names anywhere (data holds only P-ids).

**Sealed set.** I did not open experiments/sealed.json. I took its start from docs/sealed-pass-rules.md (events on or after
2026-11-09). No win/loss or prediction was computed on any game from that window. There I only counted structure (games
present, round format known or not). Every model fit below used pre-Nov 9 games only.

## Short answer
1. The data is clean of duplicates. I found 0 duplicate events and 0 duplicate replay ids, and the repeated or self pairings (9) are already skipped.
2. **The big problem is format.** 88% of the "games" the grade learns from are best-of-3 *match* results. Only 12% are single games.
   For the 63 newest events (5,371 games, the whole sealed window) the format is unknown: data/tour-modes.json is a one-off and was never refreshed.
3. The model's edge is steeper on best-of-3 rounds (slope 1.41) than on best-of-1 rounds (1.13). So for single games the shown win chances and the
   score's spread are probably about 20% too wide. That estimate rests on a measured in-sample ratio.
4. Restricted/themed events still get through (10 events, 287 games), and so do spelling variants (2% of game sides). Both move the Strength Score by well
   under 1 point.
5. The sample-size guards work: a Pokémon on fewer than 200 game sides can't move a score by more than 0.8 points. Teams with exactly one Mega Stone do
   1.4 points worse than the model says (in-sample).

## Ranked findings (by likely effect on the Strength Score)

| # | Problem | Records | Could move | Enters at | Fix |
|---|---|---|---|---|---|
| 1 | Best-of-3 match results trained and tested as single games; round format unknown for the newest events | Pre-Nov 9: 34,381 Bo3 rounds, 4,881 Bo1, 938 unknown. Nov 9 on: 5,371 games, all unknown. 76 of 495 events have no format | Score spread / win chances about 20% too wide for single games (estimate). Pick rates differ by format (58.6% Bo3 vs 56.6% Bo1, in-sample). A sealed check on an unknown mix is not like-for-like | update.mjs §4 writes no format into matches.json. data/tour-modes.json (420 events, never refreshed) | Fetch `/tournaments/{id}/details` phases daily (inventory D3) and store the format per game. Calibrate on Bo1. Report Bo1 and Bo3 separately in walk-forward and in the sealed look |
| 2 | Teams list every held Mega Stone as a Mega form; the model adds each one | 5,278 of 7,051 distinct teams (75%) list 2+ Mega forms; 42 list 3+ | 1-Mega sides won 47.8% vs predicted 49.2% (±0.8): about −1.7 score points (in-sample) | update.mjs nameOf (lkey) + model.mjs (Σ mons) | Test a "Mega slots" term (1 vs 2+ stones) and a cap of one Mega's value walk-forward. Settle the checklist line "a second stone never double-counts" |
| 3 | Restricted/themed events kept (UU ×2, Gen 3, Gen 2, Halloween ×2, "Pokémonas", Single Type Cup, 2 more) | 10 events, 287 games (0.63%), 23 of them in the sealed window | No Pokémon's value moves > 0.5 points; 14 move > 0.2 (measured refit) | formats.mjs OFF_FORMAT, plus oddEvents ignoring events under 20 teams | Add `\buu\b`, `gen ?\d (edition\|showdown)`, `single type`, `pok[eé]monas`, `s[oó] evos`. Make oddEvents use the staple ratio (<0.5 with 6+ teams) |
| 4 | Spelling variants in items/Abilities/moves (case, spaces, typos) | 274 item, 220 Ability, 867 move slots. 1.98% of game sides carry a minority spelling. 14 Mega Stones unparsed. protectLow wrongly on 16 decks | Small: none of the 582 variant features is in the shipped model, so those sides just lose a little set credit | update.mjs `mv()` (only gender letters cleaned); lkey regex `ite( [XYZ])?$` | Fold every text to one canonical spelling (trim, collapse spaces, match the Showdown/roster names case-free). Map stone typos (Staraptorite→Staraptite…). Treat "No Item"/"No Held Item" as '' |
| 5 | Sixes' "own record" is mostly one player's | 737 of 1,288 model sixes have one player on 80%+ of their games | Small: their δ averages 0.21 points (vs 0.50 for spread-out sixes); only 33 sixes move > 1 point, 1 of them one-player | six.mjs (skill and δ can't be separated when one player = one six) | Nothing urgent; the guard works. Optionally require 2+ players for δ |
| 6 | Impossible or wrong-form sets | Abilities: 123 impossible (typos such as "Lighting Rod", "Poison Tourch"), 13 wrong form (Arcanine + Rock Head = Hisuian). Moves: 334 impossible, 49 wrong form ("Indeedee" + Follow Me ×25). Mega holders listing the Mega's Ability: 899 | Very small (0.3% of 116,712 slots); the Mega-Ability habit splits one build into two Ability features | update.mjs (no legality check) | Flag and fold: Mega's Ability → the base Ability; map known typos. Log wrong-form sheets, don't silently keep them |
| 7 | Default ("most common complete") sets resting on few teams | 14 of the 100 published Pokémon have a default set run by fewer than 10 teams; 6 are near-ties (0-1 team apart) | Likely ~0 on the score (CLAUDE.md: an unchanged set counts as the typical build); it matters for what players are shown | update.mjs meta_tour `cs` | Show "few teams" when the top set has fewer than 10 teams; break ties by the newest week |
| 8 | Lost or uncounted games | 217 empty sheets (460 pairings lost). 1,448 no-result and 94 drawn pairings (left out). Standings hold 3,772 more losses than decided pairings | Model: none (it uses pairings). Ratings and usage "game win rate": mislabelled, since it is mostly match records | update.mjs (E from standings; `tour` label says "game win rate") | Relabel to "round win rate", or build those numbers from pairings |
| 9 | Replay data gaps (not in the grade) | Ladder bo1: 5 days at exactly the 600 cap. Open-sheet bo3: 0 games stored for Nov 9 (a hole). 20% of bo1 sides show fewer than 4 brought; 20% have no rating | None on the score today; it matters for sealed Check 2 and Battle | replays.mjs (cap 600; stops at the first known game on page 2+, so a gap is never refilled) | Raise the cap or run more often (inventory D5). Backfill holes. Resample by set in any test (5,829 of 11,002 bo3 games sit in same-sixes groups) |
| 10 | Stale sources | tour-modes.json (one-off, 420 events). meta_ladder.json is October data (next month's file due early Dec). official_perf.json frozen Nov 1 (RK9 removed) | Only tour-modes affects the grade (see #1) | — | Covered by #1. The others are expected and labelled |

## Details

### 1. Best-of-3 rounds counted as single games
- **Measured** (audit-limitless.mjs, round format from data/tour-modes.json phases):

  | Window | Bo3 rounds | Bo1 rounds | Unknown |
  |---|---|---|---|
  | Pre-Nov 9 games | 34,381 | 4,881 | 938 |
  | Nov 9 on (sealed window) | — | — | 5,371 |

  In events that mix formats, 4,675 Swiss games were Bo1 and 365 top-cut games were Bo3.
- **Checked (code):** update.mjs §4 stores `[teamA, teamB, result, event, playerA, playerB, round, deckA, deckB]` with no format.
  model.mjs, six.mjs and ctr.mjs fit every row as one game. The "held-out" and calibration slices are mostly Bo3 too.
- **Measured (slope.mjs):** the model was trained on pre-Nov 9 games (model_base: model.mjs with the locked settings), then fitted with
  P = σ(w·Δx) separately on each format.

  | Format | Games | Events | Slope w | 95% range (events resampled) | Favourite won |
  |---|---|---|---|---|---|
  | Bo1 rounds | 4,702 | 48 | 1.13 | 0.94–1.32 | 56.6% |
  | Bo3 rounds | 32,903 | 402 | 1.41 | 1.34–1.49 | 58.6% |

  - The ranges only just miss each other.
  - **Unsure:** this is in-sample, and the two sets are different events with different players.
  - Theory: a best-of-3 between equal per-game edges is about 1.5× steeper than one game.
- **Effect (estimate, my reading of the measured ratio):**
  - The score is 80 + 122 × (chance − 50%), with the chance built from calib fitted on mostly-Bo3 games.
  - For single games the edges would be about 0.8× as large. A team shown at 92 would read about 89.6; a no-Mega 52 about 57.6.
  - Ranking (pick rate) is unaffected; calibration and band meaning are affected.
  - Whether Pokémon values differ between formats: **unknown** (4.9k Bo1 games are too few to fit alone).
- **Why it matters now:**
  - Sealed Check 1 scores "decided games" from Limitless events. Their Bo1/Bo3 mix is unknown, and the frozen baseline (55.81%) was on a mostly-Bo3 mix.
  - Getting the format for the sealed-window events is structural (no outcomes), so it can be done before the one look.

### 2. Mega forms
- **Measured:**
  - Limitless sheets: 15,672 of 19,452 full sheets in kept events hold 2+ Mega Stones.
  - matches.json: 5,278 of 7,051 distinct teams list 2+ Mega forms, and 42 list 3+. That is 73,756 of 91,142 game sides.
- **Checked (code):** lkey turns every held stone into a Mega form, and model.mjs adds each listed form's value.
  Showdown replays (replays.mjs) list only the Mega that actually evolved: 0 sides have 2+ Mega forms, and 6,539 of 40,000 sides have none.
  So the same six is named differently in the two sources.
- **Measured (mega-count.mjs, in-sample, pre-Nov 9 model):**

  | Mega forms listed | Sides | Won | Model said | ± |
  |---|---|---|---|---|
  | 0 | 256 | 32.0% | 36.3% | 6.1 |
  | 1 | 14,592 | 47.8% | 49.2% | 0.8 |
  | 2 | 61,946 | 50.6% | 50.3% | 0.4 |
  | 3+ | 228 | 42.5% | 46.7% | 6.5 |

  The 1-Mega gap is beyond chance in-sample. It needs a walk-forward test before anyone acts on it.

### 3. Restricted events that slip through
- **Measured (odd-events.mjs):**
  - For each kept event, I compared how often the 10 most-used Pokémon appear against the rate expected from field-wide usage.
  - 460 events with 6+ full sheets: 10 are under 0.5 of the expected rate, and 18 are under 0.7.
  - Under 0.5: Gen 3 Edition (0.00), VGC UU Weekly #1 (0.05), VGC UU "Houston" (0.07), Halloween "Ominous Wind" (0.12), Copa Ranciarda III (0.18),
    "POKÉMONAS" (0.22), Gen 2 Showdown (0.30), a private event (0.34), Halloween-themed Torneo Express (0.46), Single Type Cup (0.47).
  - Together they hold 287 games. Unsure for 2 of them (Copa Ranciarda III, the private event): the names don't say.
- **Why the filters miss them (checked):** OFF_FORMAT has no UU/Gen-N/single-type/themed patterns. oddEvents skips events under 20 teams.
- **Effect (measured):** I refit model.mjs on pre-Nov 9 games with and without the 10 events.
  - Largest Pokémon change: 0.35 points (Meowstic-F-Mega, Gengar-Mega, Espathra, Sableye).
  - 0 Pokémon move more than 0.5 points; 14 move more than 0.2.
  - Also: 1 kept "Team Clash 3v3" event has no sheets (0 games). "3V3 ARENA" (95 games) looks normal by staples (unsure what 3v3 means there).

### 4. Spelling
- **Measured:**
  - Variant groups: 59 items (274 slots off the main spelling), 59 Abilities (220), 145 moves (867).
    For example, Protect is spelled "protect" ×62, "Protect " ×10 and " Protect" ×2.
  - In matches.json: 440 feature groups have variants (582 minority features). 1,804 of 91,142 sides (1.98%) carry one.
  - 0 minority features are in the shipped model, because all are under its 40-deck bar.
  - protectLow is set wrongly on 16 decks (exact ":Protect" ≤ 2, but 3+ after folding).
  - 14 Mega Stones are unparsed: "raichunite y", "Garchompite z", "Lucarionite-Z" and similar. That Pokémon is then counted as its base form.
  - Item typos that still parse as Megas: Staraptorite ×47 (the real name is Staraptite), Dragonitite ×10, Golisopodite ×9.
- **A check that could have failed:** I rebuilt the default set (`cs`) with spellings folded (cs-check.mjs). 0 of the 100 published Pokémon changed
  (2 unpublished Pokémon with 2 teams each did).

### 5–7. Samples and guards (measured, tiny.mjs and six-pilot.mjs on today's model.json)
- **Pokémon values after the evidence shrink n/(n+1000):** under 50 game sides, at most 0.2 points; 50–200, at most 0.8; 200–1000, at most 2.8.
  The largest under 500 sides: Venusaur-Mega +1.4 points (477 sides).
- **Sixes' δ:**
  - 10–20 games: at most 0.8 points. 20–50 games: at most 1.3. 50+ games: at most 3.5.
  - 737 of 1,288 sixes are mostly one player. Of the 1,211 sixes with 10+ pre-Nov 9 sides, 606 were played by a single player.
- **Default sets:** the median published Pokémon has 35.4% of its teams on exactly the default set; 3 are under 10%.
  Under 10 teams: Maushold 8/118, Sableye 7/92, Aegislash 5/57, Kangaskhan 5/44, and others.
  Near-ties: Maushold 8 vs 8, Typhlosion-Hisui 6 vs 6, Mawile-Mega 14 vs 13.

### 8. Pairings and standings (measured, kept events)
- **Pairings:** 49,231 rows. Of these, 3,177 byes, 6 repeated, 3 self, 94 draws, 1,448 no result.
  45,571 have both sides with full sheets (= matches.json); 460 are lost to empty sheets.
- **Standings vs pairings (pre-Nov 9):** standings losses 43,330 vs decided pairings 39,558.
  - 1,330 no-result pairings explain part of the gap.
  - **Unsure** about the rest (maybe drops counted as losses).
- **Duplicates:** 0 duplicate events. I checked every pair of events within 3 days sharing 40%+ of players: 4 pairs.
  All are different tournaments with ≤3 identical pairing rows (e.g. a main event and its side event).
- data-audit.mjs (existing, re-run): no hard problems. 12 events have no usable games, and 7 have over 20% no-result games.
  The first-listed side wins 51.5% (the model is symmetric, so that is harmless).

### 9. Replays (measured, audit-replays.mjs)

| File | Games | Dates | Duplicate ids | No rating | Fewer than 4 brought | Games in same-sixes groups |
|---|---|---|---|---|---|---|
| Ladder bo1 | 20,000 | Oct 25 – Nov 17 | 0 | 3,945 | 8,157 sides | 1,576 within an hour |
| Open-sheet bo3 | 11,002 | Nov 4 – Nov 17 | 0 | 1,555 | 3,710 sides | 5,829 (sets) |

- Ladder bo1: days at exactly 600 games were Nov 2, 6, 9, 10 and 15.
- Open-sheet bo3: no games at all with an upload date of Nov 9, and only 29 games have both players at 1500+.
- **Checked (code):** replays.mjs stops at the first known game after page 1, so a day cut off by the 600 cap is never refilled.

### 10. Freshness (measured from the files' own stamps)
- Every daily file is from Nov 17.
- meta_ladder.json is month 2026-10 (updated Nov 2; expected).
- official_perf.json is frozen since Nov 1 (RK9 removed; expected).
- data/tour-modes.json is a one-off.
- skips.json: no step skipped since Nov 7 (14-day window).
- reg.json was checked today; all 528 events are before M-C's end (REG_END). 375 have no format tag; checked in code: they were fetched with format=M-C.

## Order I'd suggest (each is Sim's call; the main session does the changes)
1. **Round format per game (#1).** Smallest step: refresh tour-modes for all events, including the sealed window. That is structural only, with no outcomes.
   Then decide with Sim whether the sealed look reports Bo1 and Bo3 separately.
2. **Normalise text + stones (#4)** and **themed-event filters (#3)** in one daily-job change. Re-run data-audit.mjs and the scoreboard after.
3. **Mega-slots test (#2)**, walk-forward, before any grade change.

## Appendix: main scripts (in /tmp/helper-integrity/; run from /tmp/helper-integrity/main)

slope.mjs (finding 1):
```js
// fit P(A wins) = σ(w·(xA − xB)) separately on Bo1-only and Bo3-only pre-sealed games, x as the page computes it
function slope(file) { const M = J(file), pts = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]).map(g => [xOf(M, g[0], g[7]) - xOf(M, g[1], g[8]), g[2]]);
  let w = 1; for (let k = 0; k < 40; k++) { let g = 0, h = 0; for (const [e, r] of pts) { const p = 1 / (1 + Math.exp(-w * e)); g += (p - r) * e; h += p * (1 - p) * e * e; } w -= g / (h || 1); }
  /* + 200 resamples by event for the 95% range */ }
// round format of a game: data/tour-modes.json phases [[type, rounds, 'BO1'|'BO3'], ...] walked in order
const mode = (id, r) => { const m = modes[id]; if (!m) return 'unknown'; let acc = 0; for (const [, n, bo] of m) { if (+r <= acc + n) return bo; acc += n; } return 'unknown'; };
```

odd-events.mjs (finding 3):
```js
const top10 = [...tot].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([x, k]) => [x, k / n]);   // field-wide shares
const exp = top10.reduce((a, [, sh]) => a + sh * e.t, 0), obs = top10.reduce((a, [x]) => a + (e.c.get(x) || 0), 0);
ratio = obs / exp;   // normal events ≈ 1; flagged < 0.5 (events with 6+ full sheets)
```

mega-count.mjs (finding 2):
```js
// per side: real result vs σ(calib·(xA − xB)), grouped by how many Mega forms the six lists (0/1/2/3+)
const c = Math.min(3, (M.teams[t].match(/-Mega/g) || []).length); o.n++; o.w += r; o.e += pp;
```

feat-variants.mjs (finding 4):
```js
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9@:#]/g, '');   // same feature, different spelling
// minority = every spelling in a group except the one on the most decks; count game sides whose deck carries one
```

Others:
- audit-limitless.mjs: sheets, legality vs app/src/data/data.js ROSTER/LEARN, pairings, duplicate events, repeat use.
- make-variants.mjs: pre-Nov 9 matches files.
- cs-check.mjs, tiny.mjs, six-pilot.mjs, audit-replays.mjs.
- The model refits used `MATCHES=../runs/m_base.json MODEL_OUT=../runs/model_base.json node model.mjs` (and m_norestr.json), on games before Nov 9 only.

Not checked:
- Whether the page's typical-build handling ignores `cs`. I read it in CLAUDE.md, not in the app code.
- The Bo1 vs Bo3 slope out of sample.
- Players with two Limitless accounts.
- The missing standings losses beyond the no-result rounds.

# Data inventory and stat-point spreads (Tue Nov 17, 2026, 11:04 AM, from docs/rebuild/now.sh)

Look-only research. Nothing here touches main, the daily job or the site.
Labels: **checked** / **measured** = I read the code or ran it (how is said); **not yet checked** = I didn't.
Data read: today's main (origin/main 9f93e296, "Limitless data 2026-11-17"), copied to a scratch folder.
(The local `main` branch in this checkout is stale, Nov 11; origin/main is today's.)

## 0. Short answer
- **Only one source we pull has stat-point spreads: Smogon's monthly "chaos" stats** (Showdown ladder).
  Measured: Champions spreads there are already stat points (0-32 each, 66 total). No conversion needed.
- **We already store the top 3 spreads per Pokémon** (out/meta_ladder.json `sp`, 1630+ ladder, October).
  The damage calc and speed checks use the top one. The Popular Sets page does not show them yet.
- **Tournament teams never carry stat points.** Checked: Limitless API, VR Pastes, Showdown open team sheets.
- **For Reg M-D**, Smogon's first M-D file arrives early January. The only fast spread source is in-game ranked data
  through third-party sites (championsbattledata.com API, op.gg). Using them needs Sim's OK.
- Prototype: `experiments/spreads-proto.mjs` → `experiments/spreads-proto.out.json` (118 Pokémon, 231 KB).
  Covers all 100 tournament Pokémon at 1630+.

## 1. What the daily job pulls today (checked: read every script in .github/workflows/update.yml)
Daily job: `.github/workflows/update.yml`, cron `7 9 * * *` (once a day). Other workflows pull nothing new
(weekly.yml: weekly-recheck; monthly.yml: page check; watchdog.yml: GitHub API; test.yml/promote.yml: tests).

| Source (host) | Script | What it returns | Feeds (out/ file: fields) | How often / how much |
|---|---|---|---|---|
| Limitless API (play.limitlesstcg.com/api) | update.mjs, reg.mjs | tournament list; per event standings (record, placing, six with item, Ability, 4 moves, nature) and pairings (round, two players, winner) | data/t, data/t2, data/p → limitless.json, meta_tour.json (mv it ab na tm cs), teams.json, history.json, matches.json | daily; new or <3-day-old events, max 40 a run, 6.5 s apart. reg.mjs: 3 list pages |
| Showdown replays (replay.pokemonshowdown.com) | replays.mjs (×2: bo1 and bo3) | game logs: sixes, brought 4, leads, Mega, ratings, winner, in-game events; bo3 also open team sheets (item, Ability, moves, nature) | replays.json, replays_bo3.json | daily; up to 600 new games per format, newest 20,000 kept |
| Smogon stats (smogon.com/stats) | ladder.mjs | monthly chaos JSON, Champions VGC 1630+ and 1760+ | meta_ladder.json (mv it ab na **sp** tm cc, usage1760) | daily check, downloads only when a new month is out |
| Showdown data (play.pokemonshowdown.com/data) | ladder.mjs | move, item, Ability names | names in meta_ladder.json | with ladder.mjs |
| Victory Road WP API + VR Pastes backend + Liquipedia API | official.mjs | official events: Masters standings, top 64 open team sheets (no stat points), placements | official.json, data/official, top 8 into teams.json | daily, only new or edited events; 1-2 s apart |
| Victory Road WP API | calendar.mjs | season calendar | calendar.json | daily |
| Showdowntier (showdowntier.com) | sources.mjs | ladder tier list, usage, win % | sources.json → perf.json, crosscheck.json | daily, 1 page |
| Pikalytics (pikalytics.com/ai/pokedex/championstournaments) | sources.mjs | tournament usage, win %, items and moves for top 40 | sources.json → crosscheck.json | daily, ≤41 pages |
| op.gg (op.gg/pokemon-champions/tier) | opgg.mjs (headless browser) | in-game Ranked Doubles usage ORDER | meta_ingame.json | daily, 1 page |
| none (reads files above) | practice, events, weekly, model, six, ctr, model-guard, leads, perf, crosscheck, ratings-snapshot, scoreboard, track, scrub-names, split-docs | derived numbers | see table 2 | daily |

Sizes on disk (measured, du): data/ 24 MB, out/ 28 MB (replays_bo3.json 21 MB, replays.json 10 MB, matches.json 4 MB).

## 2. What it writes (checked: top-level keys read from today's files; page keys from split-docs.mjs and app/build.mjs)
Page documents have a ~200 KB limit; bigger ones are split in two (split-docs.mjs).

| out/ file | Made by | Size | Top-level keys | Site use (page key) |
|---|---|---|---|---|
| limitless.json | update.mjs | 293 KB | updated reg tournaments teams games base adj tour results | meta/results; adj+tour via meta/perf |
| meta_tour.json | update.mjs | 80 KB | format kind source period updated note top more | meta/doubles_tour: Popular Sets (Tournaments), default sets (cs) |
| teams.json | update.mjs, official.mjs | 21 KB | source updated teams | meta/teams |
| history.json | update.mjs | 28 KB | days | meta/history (trends) |
| matches.json | update.mjs | 4 MB | updated events teams players feats decks m | not on the page; model, six, ctr, scoreboard, tests |
| replays.json | replays.mjs | 10 MB | updated format source games | not on the page; practice, leads, top-cut bring/lead rates |
| replays_bo3.json | replays.mjs | 21 MB | same | not on the page; read only by experiments/deep-factors2.mjs |
| practice.json | practice.mjs | 123 KB | updated source from to minR roundR dict opp rounds | meta/practice |
| official.json | official.mjs | 455 KB | updated source attribution events checks | not direct; events, teams, crosscheck, weekly |
| official_compare.json | official.mjs | 2 KB | previous events pass total rates summary | health check |
| official_perf.json | (frozen since Nov 1, RK9 stopped) | 5 KB | updated events waiting label teams matches split rows megas | via perf.json |
| events.json | events.mjs | 237 KB | updated source dict events | meta/events |
| weekly.json | weekly.mjs | 2 KB | v updated src th a b enough … | meta/weekly |
| calendar.json | calendar.mjs | 6 KB | v updated checked src note ev | meta/calendar |
| model.json | model.mjs, six, ctr, leads, model-guard | 238 KB | updated ships … team mons pairs sets | meta/model |
| meta_ladder.json | ladder.mjs | 90 KB | format kind month source period battles updated note top more usage1760 | meta/doubles: Popular Sets (Showdown), commonSpread() |
| meta_ingame.json | opgg.mjs | 9 KB | format kind source period updated note top more | meta/doubles_ingame |
| sources.json | sources.mjs | 18 KB | updated problems sdt pika | via perf, crosscheck |
| perf.json | perf.mjs | 31 KB | updated tour adj ingame smogon ladder outside reg | meta/perf (ratings) |
| crosscheck.json | crosscheck.mjs | 20 KB | updated checks | health summary only |
| ratings_log.json | ratings-snapshot.mjs | 101 KB | days updated | scoreboard, track |
| scoreboard.json | scoreboard.mjs | 10 KB | updated today history | not on page (results board) |
| track.json | track.mjs | 57 KB | v updated since snaps … | meta/track |
| reg.json | reg.mjs | <1 KB | id name since sd site now switched seen checked | every step; into meta/perf |
| skips.json, monthly.json, recheck.json | skip.mjs, monthly.yml, weekly.yml | <2 KB | runs / at… / date… | health and checks |

Today's sample sizes (measured from the files):
- Limitless: 495 events, 15,470 teams, 87,884 games (limitless.json); meta_tour 7,942 teams from 223 events (Oct 19 – Nov 16).
- Every tournament sheet has a nature: 125,262 of 125,262 Pokémon in data/t2 (measured).
- Tournament games (matches.json): 45,571. Best-of-1 rounds: **4,881 games from 48 events**; best-of-3: 34,381;
  round format unknown: 6,309 (measured with data/tour-modes.json; that file is a one-off, 420 events, not refreshed).
- Showdown ladder replays: 20,000 games, Oct 25 – Nov 17 (cap reached; older games drop off). 16,055 with both ratings.
- Showdown best-of-3 games: 11,002 single games with full sheets, Nov 4 – Nov 17 (will hit the 20,000 cap in about 10 days).
- Official events: 9 (8 Regionals at 64 teams, 1 Special at 32).

## 3. Stat-point spreads: who has them
| Source | Spreads? | How checked |
|---|---|---|
| Limitless team sheets | **No.** Fields: id name item ability attacks nature tera | checked: one live standings call (55 players), every decklist entry's keys |
| Official events (VR Pastes JSON) | **No.** species item ability moves nature (+ display fields) | checked: one live paste; official.mjs notes "open team sheets hide stat points" |
| Showdown best-of-3 replays (open sheets) | **No.** The packed sheet's EV field is empty | checked: 8 live replays, 96 Pokémon, 0 with stat points |
| Showdown ladder replays (bo1) | **No** team sheet at all | checked: 5 live replays, no showteam line |
| out/teams.json, events.json | No (built from the above) | checked in code |
| **Smogon chaos, Champions VGC** | **Yes**, per Pokémon, nature + six stat points, weighted counts | measured: Oct 2026 files, below |
| Pikalytics | No ("No EV spread or nature data available") | checked: Garchomp, tournament and ladder pages |
| op.gg Pokédex pages | **Yes**, in-game ranked, Single and Double, top 30, hex (`02-20-00-00-00-20` = 2/32/0/0/0/32), % only, no sample size; nature separate | checked: Garchomp page; page says "updatedAt Oct 7, 2026" (may be stale) |
| championsbattledata.com API | **Yes**, in-game ranked Doubles/Singles, top 10 stat-point spreads + top 10 natures (separate), % only, daily snapshots, season "M7" | checked: /api/battle/Doubles/garchomp and /api/index (generated today) |
| VGC-Bench (Hugging Face), pokepast.es pastes | not yet checked | — |

Smogon files for Reg M-C, October 2026 (measured):
- Formats with spreads: `gen9championsvgc2026regmc` (bo1 ladder) and `…regmcbo3` (open-sheet ladder), cut-offs 0/1500/1630/1760.
- Battles: 1,649,648 (bo1), 262,609 (bo3).
- Format: `Nature:HP/Atk/Def/SpA/SpD/Spe`. Max single stat 32; 96.9–99.2% of weight sums to exactly 66; 0 entries over 32 or 66.
  So these are Champions stat points already. No EV conversion.
- Weights: at cut-off 0 the sum of spread weights equals "Raw count" (Garchomp 451,757 = 451,757), so each appearance counts 1.
  At 1630/1760 appearances are weighted toward players above the cut (Garchomp: 56,388 at 1630, 3,295 at 1760).
- Caveat: counts are team appearances per battle, not distinct teams or players. One player who plays 500 games counts 500 times.
  Smogon gives no distinct-team count. 1760+ is thin: 33 of 100 tournament Pokémon have under 100 weighted appearances.

## 4. Prototype (`experiments/spreads-proto.mjs`, run today)
What it does: reads Smogon chaos for the active format, 1630+ and 1760+ bo1, and 1630+ bo3.
Per Pokémon: raw and weighted appearances, top 8 complete builds (nature + points), top 6 point spreads (any nature),
top 5 "families" (same investment, leftovers under 8 points pooled: 2/32/0/0/0/32 and 0/32/2/0/0/32 are both
"Atk 32 / Spe 32 (+2)"), top 4 natures. Names mapped to the roster like ladder.mjs.
Output: `experiments/spreads-proto.out.json` (not read by anything). Run: `node experiments/spreads-proto.mjs` from the repo root.

Checks that could fail (measured, this run):
- Top spread equals today's stored `meta_ladder.json` sp[0] (same month): **100 of 100 the same**.
- Range check: 0 spreads over 32 per stat or 66 total; 0 names off the roster, in all three files.

Coverage against the 100 tournament Pokémon in meta_tour.json (measured):

| File | Pokémon with spreads | Weighted appearances (min / median / max) | Under 100 |
|---|---|---|---|
| ladder 1630+ | 100 of 100 | 451 / 6,191 / 103,391 | 0 |
| ladder 1760+ | 100 of 100 | 13 / 282 / 6,310 | 33 |
| bo3 1630+ | 100 of 100 | 25 / 2,092 / 49,005 | 7 |

How concentrated spreads are (1630+, measured): top exact build median 20.5% (min 3.7%); top family median 41.4%.
50 of 100 Pokémon have a top build at 20%+. Bulky supports scatter: Incineroar's top build is only 3.7%.

Examples, ladder 1630+, Oct 2026 (measured; tournament teams are meta_tour's last 28 days):
- **Garchomp** (1,611 tournament teams; 451,757 raw / 56,388 weighted ladder appearances):
  Adamant 2/32/0/0/0/32 26.9%, Jolly same 16.9%, Adamant 10/20/4/0/0/32 4.6%.
  Points 2/32/0/0/0/32 43.9% (any nature). Family "Atk 32 / Spe 32 (+2)" 51.7%. Natures: Adamant 65.3%, Jolly 30.3%.
- **Incineroar** (2,494; 975,634 / 91,581): Sassy 31/0/15/0/20/0 3.7%, Careful 32/0/14/0/20/0 3.1%, Impish 32/0/16/0/17/1 2.7%.
  Points 32/0/14/0/20/0 5.7%. Natures: Impish 31.7%, Careful 28.6%, Adamant 18.9%. No dominant spread.
- **Sneasler** (3,114; 1,077,841 / 103,391): Adamant 2/32/0/0/0/32 25.4%, Jolly same 17.3%, Adamant 0/32/2/0/0/32 4.9%.
  Family "Atk 32 / Spe 32 (+2)" 56.2%.
- 1760+ differs and is noisy: Garchomp's #2 there is Brave 32/32/0/0/2/0 at 17.7% on ~3,300 weighted appearances
  (my guess, not yet tested: a few high-rated players' many games).
- In-game Doubles (championsbattledata, today, % only): Garchomp 2/32/0/0/0/32 33.1%, 2/0/0/32/0/32 11.8%; natures Adamant
  35.8%, Jolly 34.6%, Modest 21.3%. A different population (special Garchomp is common in-game, rare at 1630+).

Recommended source: **Smogon chaos 1630+ (bo1)** for the page, with the source said plainly ("Showdown ladder 1630+,
October"). Largest sample, nature and points together, every tournament Pokémon covered, already pulled daily.
bo3 1630+ is a useful second view (open-sheet players, closer to tournament play) but 7 Pokémon are thin.
Not 1760+ as the main view: too thin for a third of the Pokémon.

## 5. Gaps: data we will need soon and don't pull yet
| # | Need | For | Proposed source | Effort | Sim's OK? |
|---|---|---|---|---|---|
| D1 | More spreads than the top 3, plus families and the bo3 view | Popular Sets "spreads with share" | ladder.mjs: keep top 6 builds + top 4 families (+ bo3 file); stays under 200 KB (meta_ladder is 90 KB) | small | yes (daily job + page) |
| D2 | Reg M-D spreads from day one | Reg M-D (G5: Smogon's first M-D month lands early January) | championsbattledata.com API (daily, attribution required, no redistribution as a data feed) or op.gg Pokédex (non-commercial, cite) | medium | yes: new outside source, terms, launch is public |
| D3 | Round format (best-of-1 vs best-of-3) for every Limitless event | Single games first; Strength Score tests on bo1 | Limitless `/tournaments/{id}/details` → phases[].mode (checked: live call returns `SWISS 6 BO1, SINGLE_BRACKET 1 BO3`); 1 call per new event | small | yes (daily job) |
| D4 | Keep replays beyond the newest 20,000 | Sealed walk-forward tests; M-D 14-day window | monthly archive files of games that drop off (compressed), or a bigger cap | small–medium; repo size grows ~10–20 MB/month (not yet measured) | yes (daily job, repo size) |
| D5 | Replay fetch cap (600 a run) may drop games | Single-game sample size | several days sit at exactly 600 (measured per upload day); raise cap or run every 4 hours (fits plan 0.9) | small | yes (daily job) |
| D6 | M-D every-4-hours runs | Reg M-D plan 0.9 | cron change in update.yml for 14 days | small | yes (plan approved; the flip itself needs his go) |
| D7 | M-D names in outside sources | Reg M-D G1 | Pikalytics, Showdowntier, official.mjs read the regulation profile | small | yes (G1 approved) |
| D8 | Smogon 1760+ and bo3 sets (moves, items, natures), not only usage | Popular Sets "strong players" view; crosscheck | same chaos files we already download | small | yes (daily job + page) |
| D9 | Which 4 were brought, game scores in bo3 rounds | Strength Score (bring-four), single games | no public source found (data-sources.md, Nov 8); Showdown bo3 replays give brought 4 per game | none new | no |
| D10 | In-game ranked results (who won) | single games, ranked play | no public source found (Nov 8); not re-checked today | — | — |

Not gaps (checked): natures are on 100% of tournament sheets; brought-4 and leads come from replays; ratings from replays.

## 6. Proposed next steps for spreads (each needs Sim's go)
1. **Page-only, no data change:** Popular Sets "Showdown" tab shows the 3 spreads already in meta/doubles (`sp`),
   with share and the source label. Smallest step; no daily-job change.
2. **ladder.mjs (daily job, main):** also store `fam` (families) and top 6 builds; read the bo3 1630 file for a second view.
   Re-run this prototype's check 1 against the new file. Keep meta_ladder.json under 200 KB.
3. **Tournaments tab:** say plainly "tournament team lists don't include stat points; spreads come from the Showdown ladder".
4. **Reg M-D:** decide on an in-game source (D2) before Dec 1, or show "no M-D spreads until early January".
5. Optional later: default stat points on built teams from the top family instead of the top exact spread
   (commonSpread uses sp[0] today) — a grade-adjacent change, tested like any other.

## 7. Corrections found
- docs/data-sources.md (Nov 8) says the damage calc uses "the most common 1760+ spread". Checked in ladder.mjs:
  `sp` comes from the **1630+** file (`CUT = 1630`); only `usage1760` comes from 1760+. The page uses 1630+.
- out/meta_ladder.json is October data (month 2026-10, updated Nov 2). November's file is expected early December,
  around the M-D switch (not yet checked when Smogon publishes).

## 8. Not yet checked
- VGC-Bench and pokepast.es for spreads; where op.gg and championsbattledata get in-game data and how fresh op.gg is.
- Whether op.gg's or championsbattledata's terms allow use on the public site after launch.
- Smogon's exact weighting formula (I read the totals, not their code).
- Whether the replay search returns more than 600 new games a day (D5 is a guess from the per-day counts).

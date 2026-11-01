# pokelair-data

Daily Pokémon Champions (Reg M-C, VGC doubles) data for NastyPlot. A scheduled GitHub Action runs each morning (about 6:17 AM New York time); NastyPlot's 6:52 AM refresh copies `out/` into the page.

| Step | Script | Output |
|---|---|---|
| Limitless tournaments: standings, full team sheets (moves, items, abilities, natures), pairings | `update.mjs` | `out/limitless.json`, `meta_tour.json`, `teams.json`, `history.json`, `matches.json` |
| Official events: Masters top 64 open team sheets of each finished Reg M-C Regional/International from Victory Road (WordPress REST API) and VR Pastes, checked against Liquipedia (MediaWiki API: placements, player count, date). Polite: our User-Agent, ≤1 request/s per site, Liquipedia one batched query 2 s apart, only new or edited events, each paste read once (`data/official/`). Gate: if the new sheets disagree with yesterday's file or shrink, the old file is kept | `official.mjs` | `out/official.json`, `out/official_compare.json`, top 8s added to `teams.json` |
| Official events, whole field (every Masters team and match): **frozen**. Read from RK9 until Nov 1, when RK9 reads stopped (its terms, rk9.gg/terms 5.3, forbid automated extraction; `rk9.mjs`/`rk9-field.mjs` were removed). No permitted source has every match, so the last table is kept, dated by its newest event; the page drops it 28 days after that | none | `out/official_perf.json` (kept as is), `data/rk9/` |
| Win model: team strength from real games with player skill removed, tested on held-out recent events | `model.mjs` | `out/model.json` (`ships` is false if it doesn't beat raw win rates) |
| In-game ranked doubles: op.gg's official Ranked Battle order (headless browser) | `opgg.mjs` | `out/meta_ingame.json` |
| Health check: fails the job (GitHub emails you) when a source stops updating (daily sources 2 days, op.gg/official events 3, Smogon 40 days past its month); prints the cross-check | `health.mjs` | none |
| Showdown ladder: Smogon monthly usage stats, 1630+ sets and 1760+ usage (only rebuilt when a new month is out) | `ladder.mjs` | `out/meta_ladder.json` |
| Outside sources: Showdowntier (ladder, 14 days), Pikalytics (recent tournaments, sets). (Pokémon Zone refuses automated reads; project-red-data was dropped Nov 1: no licence) | `sources.mjs` | `out/sources.json` |
| Ratings inputs: every outside table the ratings use, each with the date of its data, for the page's `meta/perf` | `perf.mjs` | `out/perf.json` |
| Cross-check: our usage, win rates and top sets next to the outside sources, with flags beyond tolerance | `crosscheck.mjs` | `out/crosscheck.json` (summary in the health step) |

Limitless allows 50 requests per 5 minutes, so the job waits between calls. A manual run (Actions → Update Limitless data → Run workflow) fetches up to 400 tournaments; scheduled runs fetch up to 40.

The morning refresh copies **all of `out/perf.json`** into `meta/perf` (`tour`, `adj`, `ingame`, `official`, `smogon`, `ladder`, `outside`, `updated`). The page leaves out any part older than its cadence, so stale numbers are never shown as current.

Liquipedia text is CC-BY-SA 3.0 (liquipedia.net); `official.mjs` uses it only to check placements, player counts and dates, and the page credits it in its data-sources line. Victory Road and VR Pastes are credited the same way.

# pokelair-data

Daily Pokémon Champions (Reg M-C, VGC doubles) data for NastyPlot. A scheduled GitHub Action runs each morning (about 6:17 AM New York time); NastyPlot's 6:52 AM refresh copies `out/` into the page.

| Step | Script | Output |
|---|---|---|
| Limitless tournaments: standings, full team sheets (moves, items, abilities, natures), pairings | `update.mjs` | `out/limitless.json`, `meta_tour.json`, `teams.json`, `history.json`, `matches.json` |
| Official events: RK9 open team sheets, Masters top 64 per event | `rk9.mjs` | `out/official.json`, top 8s added to `teams.json` |
| Official events, whole field: every Masters team list and every Masters match (pairings) of each finished event, read once per event | `rk9-field.mjs` | `data/rk9/field/`, `out/official_perf.json` (usage share and match win rate per Pokémon) |
| Win model: team strength from real games with player skill removed, tested on held-out recent events | `model.mjs` | `out/model.json` (`ships` is false if it doesn't beat raw win rates) |
| In-game ranked doubles: op.gg's official Ranked Battle order (headless browser) | `opgg.mjs` | `out/meta_ingame.json` |
| Health check: fails the job (GitHub emails you) when a source stops updating (daily sources 2 days, op.gg/RK9 3, Smogon 40 days past its month); prints the cross-check | `health.mjs` | none |
| Showdown ladder: Smogon monthly usage stats, 1630+ sets and 1760+ usage (only rebuilt when a new month is out) | `ladder.mjs` | `out/meta_ladder.json` |
| Outside sources: Pokémon Zone (tier lists, Limitless results), Showdowntier (ladder, 14 days), Pikalytics (recent tournaments, sets), project-red-data (top 10% Showdown replays) | `sources.mjs` | `out/sources.json` |
| Ratings inputs: every outside table the ratings use, each with the date of its data, for the page's `meta/perf` | `perf.mjs` | `out/perf.json` |
| Cross-check: our usage, win rates and top sets next to the outside sources, with flags beyond tolerance | `crosscheck.mjs` | `out/crosscheck.json` (summary in the health step) |

Limitless allows 50 requests per 5 minutes, so the job waits between calls. A manual run (Actions → Update Limitless data → Run workflow) fetches up to 400 tournaments; scheduled runs fetch up to 40.

The morning refresh copies **all of `out/perf.json`** into `meta/perf` (`tour`, `adj`, `ingame`, `official`, `smogon`, `prd`, `ladder`, `outside`, `updated`). The page leaves out any part older than its cadence, so stale numbers are never shown as current.

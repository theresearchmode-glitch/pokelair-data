# pokelair-data

Daily Pokémon Champions (Reg M-C, VGC doubles) data for NastyPlot. A scheduled GitHub Action runs each morning (about 6:17 AM New York time); NastyPlot's 6:52 AM refresh copies `out/` into the page.

| Step | Script | Output |
|---|---|---|
| Limitless tournaments: standings, full team sheets (moves, items, abilities, natures), pairings | `update.mjs` | `out/limitless.json`, `meta_tour.json`, `teams.json`, `history.json`, `matches.json` |
| Official events: RK9 open team sheets, Masters top 64 per event | `rk9.mjs` | `out/official.json`, top 8s added to `teams.json` |
| Win model: team strength from real games with player skill removed, tested on held-out recent events | `model.mjs` | `out/model.json` (`ships` is false if it doesn't beat raw win rates) |
| In-game ranked doubles: op.gg's official Ranked Battle order (headless browser) | `opgg.mjs` | `out/meta_ingame.json` |
| Health check: fails the job (GitHub emails you) when a source stops updating | `health.mjs` | none |
| Showdown ladder: Smogon monthly usage stats, 1630+ (only rebuilt when a new month is out) | `ladder.mjs` | `out/meta_ladder.json` |

Limitless allows 50 requests per 5 minutes, so the job waits between calls. A manual run (Actions → Update Limitless data → Run workflow) fetches up to 400 tournaments; scheduled runs fetch up to 40.

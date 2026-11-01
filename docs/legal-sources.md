# NastyPlot data sources: terms, robots rules and how we comply

Checked: **2026-11-01**. **Re-check every 3 months** (next: 2027-02-01), and whenever a source is added or a site changes its terms.

The list of sources shown to users lives in one place: `DATA_SOURCES` in `app/src/app/56-about.js` (footer + About & legal page).
Keep this file and that list in step.

## How the daily job behaves (all sources)

- **Identifies itself.** Every request made through `http.mjs` sends
  `User-Agent: NastyPlot-data/1.0 (+https://github.com/theresearchmode-glitch/pokelair-data; simran.jsbagga@gmail.com)`.
  The op.gg step (a headless browser) appends the same string to its browser User-Agent.
- **Paced.** `http.mjs` spaces requests to the same host at least 1 second apart (1.1 s, with slack); scripts with their own
  longer pauses keep them (Limitless 6.5 s, outside sources 1.5 s).
- **Once a day.** `.github/workflows/update.yml` runs once a day; Smogon stats are only downloaded when a new month is out.
- **Credit.** Every source is named in the page footer and on the About & legal page, with a link.
- **Removal.** Anyone can ask for anything to be changed or removed at simran.jsbagga@gmail.com (shown on the About page).

## Sources

| Source | What we use | What its terms / robots say (quoted or summarised) | How we comply |
|---|---|---|---|
| **Limitless** (play.limitlesstcg.com) | Online tournament results, standings, team lists (`update.mjs`) | Developer docs: a public API; no key needed except for `/decks`; rate limits apply (update.mjs comment: "50 requests per 5 minutes"). play.limitlesstcg.com/robots.txt returns 404 (none). | Public API only, no `/decks`; 6.5 s between calls (≈46 per 5 min), backs off on 429; NastyPlot UA. |
| **Victory Road** (victoryroad.pro) | Official event results and team lists (replaces RK9; being added by another branch) | robots.txt only disallows `/wp-admin/` and blackhole paths. | Read once a day, ≥1 s per request via `http.mjs`, NastyPlot UA; credited. |
| **PokePaste** (pokepast.es) | Team lists linked from event results (being added by another branch) | No robots.txt (404); no stated terms found. | Only pastes linked from results, once a day, ≥1 s apart, NastyPlot UA; credited. |
| **Liquipedia** (liquipedia.net/pokemon) | Official event results / placements (being added by another branch) | API terms: no automated access to HTML pages; MediaWiki API at most 1 request per 2 s (`action=parse` at most 1 per 30 s); a custom User-Agent with contact info is required; content is CC-BY-SA 3.0 and needs attribution. | Must use the MediaWiki API only, with ≥2 s (parse ≥30 s) between calls — **the Liquipedia fetcher has to pace itself to these, `http.mjs`'s 1 s default is not enough**; NastyPlot UA with contact; CC BY-SA 3.0 attribution + license link on the About page and "(CC BY-SA)" in the footer; adapted data shared under the same license. |
| **Pokémon Showdown** (pokemonshowdown.com) | Game data (moves, items, abilities: `ladder.mjs` reads play.pokemonshowdown.com/data) and public replays (`replays.mjs`) | Code and data: MIT License, "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software." Replays: public replay API (search.json / <id>.json). replay.pokemonshowdown.com/robots.txt returns 404 (none). | Full MIT notice (Copyright (c) 2011-2026 Guangcong Luo and other contributors) shown on the About page; short credit in footer. Replays: one request at a time, ≥1 s apart (was 350 ms), capped at 600 new per run; NastyPlot UA. |
| **Smogon** (smogon.com/stats) | Monthly ladder usage stats (`ladder.mjs`) | Public stats files. robots.txt (checked today): only `User-agent: Amazonbot / Allow: /` — nothing disallowed. | A few files, only when a new month is out; ≥1 s apart; NastyPlot UA; credited. |
| **op.gg** (op.gg/pokemon-champions) | In-game ranked doubles usage order (`opgg.mjs`) | Help center: "In general, OP.GG does not prohibit data crawling or web scraping. However, if there is any commercial use without citing the source or if excessive requests affect our service operation, access to the service may be restricted." | One page load a day (headless browser), no commercial use, source cited in footer + About page; browser UA carries the NastyPlot string. |
| **Pikalytics** (pikalytics.com) | Ladder usage, items, moves (`sources.mjs`, `/ai/pokedex/...`) | robots.txt allows all crawlers, including the `/ai/` endpoints. | ≤41 requests a day, 1.5 s apart; NastyPlot UA; credited. |
| **Showdown Tier** (showdowntier.com) | Ladder tier list, usage, win rates (`sources.mjs`) | No stated terms found. robots.txt (checked today): `User-agent: * / Allow: /` (crawl-delay commented out). | One page a day; NastyPlot UA; credited. |

## Removed sources

| Source | Why removed |
|---|---|
| **RK9** (rk9.gg) | Terms §5.3(3) forbid automated extraction "for commercial or non-commercial purposes". Being replaced by Victory Road + PokePaste + Liquipedia; `rk9*.mjs` are not to be run. |
| **project-red-data** (GitHub) | No license, so no permission to reuse. Dropped. |
| **Pokémon Zone** | Answers automated requests with 403 (Oct 31); that refusal is respected and it is not read. |

## Player names (privacy)

Player names and teams come from public tournament results (adult Masters division only). A player can ask to have their
name removed via the email on the About page; remove it from the data and add it to an exclusion list so the next daily run
doesn't bring it back.

## Pokémon trademarks and images

Unofficial fan tool, no affiliation (footer + About page). Pokémon images are Pokémon HOME renders from the PokéAPI sprite
collection (see `app/src/app/15-visual-helpers.js`), © Nintendo / Game Freak / Creatures Inc. / The Pokémon Company, used for
identification only. Free, no ads, no paid features, no donations.

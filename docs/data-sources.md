# Data sources: what we have, what's out there, what's missing (Nov 8, 2026)
Checked by visiting each source; "unsure" means I couldn't confirm it.

## Already used
| Source | What it gives | Limits |
|---|---|---|
| Limitless (play.limitlesstcg.com API) | 420 events, 39k round results, full team sheets (item, Ability, moves, nature) | 86.5% best-of-3 rounds; no game scores, no 4-brought, no stat points |
| Victory Road official events | Regional top-cut teams with sheets | top cut only, not every round |
| Showdown replays (ours) | 20k ladder single games: sixes, 4 seen, leads, Mega used, ratings, winner; now also best-of-3 format games WITH team sheets | ladder mostly mid-level; regular ladder shows no sets |
| Smogon monthly stats (we read 1630+ usage) | 1.65M Champions VGC ladder battles/month | we only use usage + checks; see below |
| op.gg | official in-game Ranked Doubles usage ORDER | order only, no sets or results |
| Pikalytics, Pokémon Zone, MetaVGC | popular sets, used by crosscheck.mjs | derived from Limitless/Showdown |
| VGC-Bench (Hugging Face) | 88,905 Champions games with team sheets, Reg M-A/M-B | older regulations |

## Found today, worth adding
1. **Smogon "chaos" stats (smogon.com/stats/2026-10/chaos/)**: per Pokémon at 0/1500/1630/1760+: stat-point spreads, items,
   Abilities, moves, teammates, checks & counters; also a best-of-3 (open team sheet) file. **Correction (checked in code):
   we already read these** (ladder.mjs → meta_ladder.json `sp`, `tm`, `cc`), and the damage calc and speed checks already use
   the most common 1760+ spread (commonSpread, 39-damage-calc-speed.js). I was wrong twice: we do have stat points, and speed
   comparisons don't use guessed spreads. What's true: the GRADE model doesn't use stat points (tournament sheets lack them).
2. **pokedata.ovh** (decision Nov 8: NOT used for now): open team sheets and results of real-life Regionals: 9 events, 23,478 battles (per Pokémon Zone and
   MetaPulse). The full field, not just top cut. **Unsure** where pokedata gets it (possibly RK9, which our rules say we
   don't scrape) and what its terms allow. Checked its pages (home, standingsVGC): no stated data source, no terms, no contact; it has a page named
   "ptcglrk9", which suggests RK9 data. With our no-RK9 rule and no terms, we don't use it unless its owner confirms.
3. **MetaPulse (metapulse.minim-labs.app)**: built from Showdown replays every 10 min (best-of-1 and best-of-3): win rates,
   leads, most-revealed sets, teams that win most (50+ games). Same raw source as ours, so good as a cross-check. Its pages load by script,
   so I couldn't read its numbers automatically (unsure how to cross-check without manual reading).
4. **championsbattledata.com**: daily ranked usage, sets, teammates, stat spreads; says it has API access. **Unsure** where
   its data comes from; not checked further.

## Still missing (no public source found)
- **In-game ranked results** (who won which game in Champions itself). The game's Battle Data shows usage and sets; op.gg
  shows its order. I couldn't confirm any public official API for it, and I didn't try to get around anything to reach one.
- Game-by-game scores inside best-of-3 tournament rounds.
- Which 4 were brought in tournament games.

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
1. **Smogon "chaos" stats (smogon.com/stats/2026-10/chaos/)**: per Pokémon at 0/1500/1630/1760+: **stat-point spreads**
   (e.g. Incineroar "Adamant:32/14/10/0/10/0"), items, Abilities, moves, teammates, checks & counters; also a file for the
   best-of-3 (open team sheet) format. Correction: I said earlier we have no stat points anywhere; this has them (ladder).
2. **pokedata.ovh**: open team sheets and results of real-life Regionals: 9 events, 23,478 battles (per Pokémon Zone and
   MetaPulse). The full field, not just top cut. **Unsure** where pokedata gets it (possibly RK9, which our rules say we
   don't scrape) and what its terms allow. Needs Sim's call before we use it.
3. **MetaPulse (metapulse.minim-labs.app)**: built from Showdown replays every 10 min (best-of-1 and best-of-3): win rates,
   leads, most-revealed sets, teams that win most (50+ games). Same raw source as ours, so good as a cross-check. No API
   mentioned (unsure).
4. **championsbattledata.com**: daily ranked usage, sets, teammates, stat spreads; says it has API access. **Unsure** where
   its data comes from; not checked further.

## Still missing (no public source found)
- **In-game ranked results** (who won which game in Champions itself). The game's Battle Data shows usage and sets; op.gg
  shows its order. I couldn't confirm any public official API for it, and I didn't try to get around anything to reach one.
- Game-by-game scores inside best-of-3 tournament rounds.
- Which 4 were brought in tournament games.

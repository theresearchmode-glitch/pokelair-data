# "Spicy picks" (Sim's fun mode): is there real data for off-meta picks? HH, Thu Nov 26 (time: 1:03 AM (1:03:18)  date: Thu Nov 26, 2026)
Status: research only, nothing built. Sim's idea (Nov 25): suggestions that aren't limited to the high-tier picks, with creative picks that
might be just as good, but it's hard to tell because of player skill. Script: experiments/spicy-candidates.mjs (`node experiments/spicy-candidates.mjs`).

## What the data says (checked: ran the script on today's out/perf.json, Reg M-C, 17,002 teams)
```
PROVEN  Annihilape | usage 2.8% | wins 56.9% | 2820 games | low 53.7 | own share 0.31
PROVEN  Basculegion-F | usage 3.6% | wins 53.8% | 3515 games | low 50.9 | own share 0.269
PROVEN  Kommo-o | usage 4% | wins 53.3% | 3878 games | low 50.6 | own share 0.192
PROVEN  Glimmora | usage 1.9% | wins 54.4% | 1903 games | low 50.5 | own share 0.232
MAYBE   Armarouge | usage 4% | wins 50.8% | 3846 games | low 48.1 | own share 0.192
MAYBE   Corviknight | usage 2% | wins 50.3% | 1970 games | low 46.5 | own share 0.077
MAYBE   Hippowdon | usage 0.7% | wins 52.9% | 680 games | low 46.4 | own share 0.054
MAYBE   Snorlax | usage 0.7% | wins 52.9% | 666 games | low 46.3 | own share 0.13
MAYBE   Espathra | usage 0.8% | wins 52% | 759 games | low 45.9 | own share 0.108
MAYBE   Toxapex | usage 1.3% | wins 50.2% | 1243 games | low 45.4 | own share 0.034
MAYBE   Lycanroc-Dusk | usage 0.6% | wins 52% | 619 games | low 45.2 | own share 0.082
MAYBE   Blaziken | usage 0.5% | wins 52.4% | 502 games | low 44.9 | own share 0.186
MAYBE   Kleavor | usage 0.5% | wins 51.5% | 489 games | low 43.9 | own share 0.163
MAYBE   Drampa | usage 0.4% | wins 52.6% | 367 games | low 43.8 | own share 0.134
```
PROVEN = used by under 5% of teams and still above 50% wins at a cautious 95% lower bound (n = games/3, because games from one team
aren't independent; that factor is my assumption). MAYBE = above 50% wins, but too few games to say (rule 21: "unknown").
For scale: the 7 most-used Pokémon average 51.8% wins.

## Player skill, tested (checked: experiments/spicy-same-player.mjs on data/t2, Reg M-C)
Same player, with the Pokémon vs without it (players with 5+ games both ways; weighted):
- Annihilape: 51 players, +0.9 points (raw 56.9% wins)   - Glimmora: 73 players, +2.7 points
- Kommo-o: 51 players, -2.3 points                         - Rillaboom (most used, for comparison): 285 players, -1.4 points
- Basculegion-F: can't be told apart from Basculegion in the team files (no form field), so not tested.
These samples are small (about 500-1,000 games with each), so each number is give-or-take a few points.

## What it means, plainly
- Sim's hunch was right: the big raw win rates of rare picks are mostly WHO brings them. With the same player, they're about even
  with that player's usual picks: not better, not worse.
- That is still good news for a fun mode: a rare pick costs about nothing for the same player. "As good as the usual pick" is the
  honest claim; "secretly better" is not supported.

## Recommendation (for Sim to decide)
- Spicy picks = a Suggestions toggle that allows Pokémon under 5% usage, shown with a plain label:
  wording that matches the test: "Rare pick, about as good as the usual one for the same players" (when the same-player test is
  within a few points), or "Spicy: too few games to tell" otherwise. Never "better than the meta".
  Reason: it's fun and it's honest (each card says how sure we are), and it fits rule 21 (unknowns are called unknown).
- Never mix spicy cards into the normal list without the label; the Strength Score of the changed six is graded exactly as chosen.
- Needs Sim's yes on wording and look (design) before it's built; target before the ~Dec 18 announcement (agreed list).

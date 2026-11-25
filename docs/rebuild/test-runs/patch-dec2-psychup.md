# Dec 2 patch: the Psych Up list and every new move, against our data (Nov 24)

Source, checked: the official page itself, https://news.pokemon-home.com/en/page/877.html ("Wednesday, December 2, 2026 Battle
Balance Adjustments"), fetched with curl (HTTP 200, 4,125 bytes, read as text). No mirror needed.
Our data: **app/src/data/data.js** (the brief said app/src/app/data.js; that file doesn't exist), ROSTER for names, LEARN for
learnsets (lists of indexes into MOVES; Psych Up is index 264). Checked with a node script at claude/design6 33ec968b.

## Psych Up: 22 Pokémon (official list, in its order)
| # | Official name | In our ROSTER as | Learns Psych Up today? |
|---|---|---|---|
| 1 | Alakazam | Alakazam; also Alakazam-Mega | no; no |
| 2 | Starmie | Starmie; also Starmie-Mega | no; no |
| 3 | Mr. Mime | Mr. Mime | no |
| 4 | Mawile | Mawile; also Mawile-Mega | no; no |
| 5 | Altaria | Altaria; also Altaria-Mega | no; no |
| 6 | Castform | Castform | no |
| 7 | Absol | Absol; also Absol-Mega, Absol-Mega-Z | no; no; no |
| 8 | Roserade | Roserade | no |
| 9 | Weavile | Weavile | no |
| 10 | Rotom | Rotom | no |
| 11 | Rotom (Heat Rotom) | Rotom-Heat | no |
| 12 | Rotom (Wash Rotom) | Rotom-Wash | no |
| 13 | Rotom (Frost Rotom) | Rotom-Frost | no |
| 14 | Rotom (Fan Rotom) | Rotom-Fan | no |
| 15 | Rotom (Mow Rotom) | Rotom-Mow | no |
| 16 | Liepard | Liepard | no |
| 17 | Musharna | Musharna | no |
| 18 | Audino | Audino; also Audino-Mega | no; no |
| 19 | Cofagrigus | Cofagrigus | no |
| 20 | Slurpuff | Slurpuff | no |
| 21 | Drampa | Drampa; also Drampa-Mega | no; no |
| 22 | Annihilape | Annihilape | no |
All 22 exist in our data; none learns Psych Up today. The Psych Up row already exists in MOVES.

## The patch's other new moves (official list)
| Move | Official Pokémon | Ours today |
|---|---|---|
| Slack Off | Emboar | Emboar no; **Emboar-Mega no** |
| Roost | Beedrill, Hydreigon | Beedrill no; **Beedrill-Mega no**; Hydreigon no |
| Tailwind | Emolga | no |
| Wonder Room | Umbreon | no |
| Play Rough | Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon | all no (Sylveon isn't on the list; it learns it already) |

## Against docs/rebuild/test-runs/patch-dec2-map.md
- **Same:** the other new moves and their Pokémon; Screech 85→100, Rock Slide 90→95 and flinch 30→20, Steel Wing 90→100, Metal
  Sound 85→100, Frost Breath 90→100 (all confirmed word for word on the official page).
- **Filled in:** the map said the Psych Up list wasn't in the repo; it's above now.
- **Missed by the map:** Mega forms have their own LEARN entries, and none has these moves either: Alakazam-Mega, Starmie-Mega,
  Mawile-Mega, Altaria-Mega, Absol-Mega, Absol-Mega-Z, Audino-Mega, Drampa-Mega (Psych Up), Emboar-Mega (Slack Off) and
  Beedrill-Mega (Roost). The update must add them to the Mega entries too (my reading: a Mega keeps its base form's moves; true
  in the games, not checked against Champions' own data).
- **Official wording of the two Abilities:**
  - Flash Fire: "the Pokémon now gains the Fire Boost status. The Fire Boost status will persist even if the Pokémon Mega Evolves."
  - Stalwart adds: "When using its moves, the Pokémon ignores the effects of targets' substitutes."
  Both match the map, which noted that our calc models neither Flash Fire's boost nor Substitute.
- "All regulations": the page says the changes apply to battles in every regulation.

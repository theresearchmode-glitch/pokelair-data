# Fact-check: the hand-written "On the field" lines (V2.IS_HAND) and lead sentences (V2.IS_LEAD), Nov 24

Where: app/src/v2/pages/infosheet.js line 13 (V2.IS_HAND: 11 lines) and line 15 (V2.IS_LEAD: 3 lead sentences, also hand-written,
so checked too), at claude/design6 33ec968b.
Source for every verdict: Pokémon Showdown at commit **1242c1e2d9763ba5b85d33f13aecb89bae19ae3d** (the commit our generators are
pinned to), fetched from raw.githubusercontent.com: data/items.ts, data/abilities.ts, data/moves.ts, data/conditions.ts,
sim/battle-actions.ts, plus data/mods/champions/{items,abilities,moves,scripts,conditions}.ts. **Checked: the champions mod files
don't mention Focus Sash, Intimidate or Rock Slide** (grep, 0 hits), so the Gen 9 base code is what Champions uses. Bulbapedia not
needed. Which Champions Pokémon have each Ability comes from our ROSTER (app/src/data/data.js).

| Kind | Name | Line | Verdict | Source (Showdown 1242c1e) | Fix |
|---|---|---|---|---|---|
| item | Focus Sash | Fake Out or any chip damage first breaks it | MISLEADING | items.ts:2288-2293: it works only when `target.hp === target.maxhp`; chip doesn't use it up, it just stops it working until full HP | Any damage first, like Fake Out, switches it off (it needs full HP) |
| item | Focus Sash | Multi-hit moves can still finish it | TRUE | items.ts:2289-2291: the first hit leaves 1 HP and `useItem()` uses it up; later hits find no Sash | — |
| item | Focus Sash | Best on fast, frail Pokémon | TRUE (advice, not a rule) | not a mechanic; common strategy | — |
| item | Focus Sash (lead) | At full HP, it survives a hit that would knock it out, with 1 HP left. Then it's used up. | TRUE | items.ts:2289: only damage from a move (`effectType === 'Move'`), at full HP; `return target.hp - 1`, `useItem()` | — |
| ability | Intimidate | Hits both foes at once | TRUE | abilities.ts:2197: `for (const target of pokemon.adjacentFoes())`; both foes are adjacent in doubles | — |
| ability | Intimidate | Works again each time it switches back in | TRUE | abilities.ts:2195: `onStart` runs on every switch-in | — |
| ability | Intimidate | Defiant and Competitive foes get a boost instead | MISLEADING | abilities.ts:901-914 and 645-658: Defiant/Competitive react after the drop (`onAfterEachBoost`), so Attack still falls 1, then +2 Atk / +2 Sp. Atk | Defiant and Competitive foes still lose 1 Attack, then gain 2 Attack (Defiant) or 2 Sp. Atk (Competitive) |
| ability | Intimidate | Inner Focus, Oblivious, Own Tempo and Scrappy ignore it | TRUE but incomplete | abilities.ts lines 2159, 3032, 3161, 4090 (`effect.name === 'Intimidate'`). Also unaffected: Clear Body, White Smoke and Hyper Cutter (block the drop: lines 523, 5475, 1941, `onTryBoost` deletes it); Mirror Armor (bounces it back); Guard Dog (Attack goes UP 1, line 1736). Rattled gains Speed +1 (line 3779). In our roster: Clear Body 3, White Smoke 1, Hyper Cutter 4, Mirror Armor 1 (Corviknight), Guard Dog 1, Rattled 1 | Inner Focus, Oblivious, Own Tempo, Scrappy, Clear Body and Hyper Cutter ignore it; Guard Dog gets stronger |
| ability | Intimidate (lead) | When it comes in, lowers both foes' Attack by 1 stage. | TRUE | abilities.ts:2194-2206 (a foe behind a Substitute is immune, line 2202) | — |
| move | Rock Slide | Hits both foes, each for 0.75× damage | TRUE (one gap) | battle-actions.ts:613 `spreadHit` when more than one target, 1786-1791 ×0.75. With only one foe left it hits for full damage | Hits both foes at 0.75× each (full damage if one foe is left) |
| move | Rock Slide | Never hits your partner | TRUE | moves.ts:15249 `target: "allAdjacentFoes"` | — |
| move | Rock Slide | Blocked by Protect and Wide Guard | TRUE | moves.ts:15244 `flags: { protect: 1 }`; Wide Guard moves.ts:20804+ blocks `allAdjacentFoes` targets | — |
| move | Rock Slide | Flinch only works if it moves first | TRUE | conditions.ts:198-206: flinch lasts 1 turn and stops the target's next move (`onBeforeMove`); a foe that already moved isn't affected | — |
| move | Rock Slide (lead) | Hits both foes. Each one hit has a 30% chance to flinch. | TRUE today, **changes Dec 2** | moves.ts:15245-15248 `chance: 30, volatileStatus: 'flinch'` | From Dec 2: "…a 20% chance to flinch." |

## Summary
- 14 lines: **10 TRUE** (one of them advice), **2 MISLEADING** (Focus Sash "breaks it"; Intimidate's Defiant/Competitive
  "instead"), **1 TRUE but incomplete** (who ignores Intimidate), **1 changes on Dec 2** (Rock Slide 30% → 20%).
  No FALSE, no UNSURE.
- Dec 2 also changes Rock Slide's accuracy (90 → 95). No line here mentions accuracy, so only the lead's 30% must change.
  Focus Sash and Intimidate aren't in the patch.
- Wording suggestions are short, in the lines' own style; Sim decides. Nothing was changed.

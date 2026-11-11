# Page heights: today's site vs the rebuild

This table records the rule in design-system.md section 9. Heights are full page height in pixels, in the default state (nothing expanded), in day mode, with the sample team (Garchomp, Sneasler, Mega Charizard Y, Whimsicott, Basculegion, Kingambit).

- **Today's site:** measured Nov 11 with `node experiments/page-heights.mjs` (raw: test-runs/page-heights-today.json).
- **Rebuild:** measured with `node experiments/mock-heights.mjs`.

**Limits.** "over" marks a page past its limit.

| Size | Tool page | Home |
|---|---|---|
| Phone 390 x 844 | 3,400 | 4,200 |
| iPad 820 x 1180 | 3,500 | 3,500 |
| Desktop 1440 x 900 | 1,800 | 2,700 |

| Page | Today: phone | Today: iPad | Today: desktop | Rebuild (phone / iPad / desktop) |
|---|---|---|---|---|
| Home | 3,732 | 5,099 **over** | 3,980 **over** | not drawn yet |
| My Team | 4,458 **over** | 4,644 **over** | 3,445 **over** | 4,891 **over** / 3,538 **over** / 2,311 **over** |
| My Team, no team yet (first visit) | (old empty state not measured) | | | 1,804 / 1,316 / 1,039 |
| Build for Me | 3,178 | 2,270 | 1,947 **over** | not drawn yet |
| All Suggestions | 1,769 | 1,553 | 1,550 | not drawn yet |
| Saved Teams | 1,344 | 1,180 | 1,129 | not drawn yet |
| Compare Teams | 2,464 | 1,898 | 1,798 | not drawn yet |
| My Box | 1,407 | 1,257 | 1,203 | 2,125 / 1,352 / 1,239 |
| Battle a Team | 2,743 | 2,418 | 1,926 **over** | not drawn yet |
| Team Preview Practice | 1,418 | 1,180 | 1,118 | not drawn yet |
| Test Run | 3,034 | 2,436 | 2,474 **over** | not drawn yet |
| Speed Tiers | 2,321 | 1,972 | 1,922 **over** | not drawn yet |
| Damage Calc | 3,170 | 2,733 | 2,261 **over** | not drawn yet |
| Type Chart | 3,105 | 2,391 | 1,856 **over** | not drawn yet |
| This Week | 4,724 **over** | 3,647 **over** | 3,361 **over** | not drawn yet |
| Pokémon Ratings | 3,064 | 2,441 | 2,379 **over** | not drawn yet |
| Usage | 2,136 | 2,017 | 2,086 **over** | not drawn yet |
| Popular Sets | 2,877 | 2,204 | 2,224 **over** | not drawn yet |
| Winning Teams | 3,755 **over** | 2,846 | 2,790 **over** | not drawn yet |
| Events | 3,982 **over** | 3,508 **over** | 2,607 **over** | not drawn yet |
| Archetypes | 2,360 | 2,280 | 2,259 **over** | not drawn yet |
| Track Record | 3,159 | 2,622 | 2,744 **over** | not drawn yet |
| How We Calculate | 2,997 | 2,270 | 2,238 **over** | not drawn yet |
| About & Legal | 1,955 | 1,603 | 1,611 | not drawn yet |

## Notes

- **My Team, today:** I measured 3,445px on desktop. Sim's figure was about 4,270px. I don't know which setup gave hers (a different width, or a section left open, perhaps), so both are noted here.
- **My Team, rebuild (Nov 11):** the page is over its limit at all three sizes. On desktop the Team Sheet adds 612px at the bottom. On phone the stacked Set, Matchups and Suggestions take 2,558px and the Team Sheet another 1,378px. On iPad the six overflow the screen edge, because the mock-up has no iPad layout yet. Under 9.2 this goes to Sim with options before any change.

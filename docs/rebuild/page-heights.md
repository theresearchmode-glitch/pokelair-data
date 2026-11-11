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
| Home | 3,732 | 5,099 **over** | 3,980 **over** | 4,191 / 2,828 / 2,595 (Nov 11) |
| My Team | 4,458 **over** | 4,644 **over** | 3,445 **over** | 1,737 / 2,587 / 1,699 (after Option A, Nov 11; before: 4,891 / 3,538 / 2,311) |
| My Team, no team yet (first visit) | (old empty state not measured) | | | 1,804 / 1,316 / 1,039 |
| Build for Me | 3,178 | 2,270 | 1,947 **over** | not drawn yet |
| All Suggestions | 1,769 | 1,553 | 1,550 | not drawn yet |
| Saved Teams | 1,344 | 1,180 | 1,129 | not drawn yet |
| Compare Teams | 2,464 | 1,898 | 1,798 | not drawn yet |
| My Box | 1,407 | 1,257 | 1,203 | 2,180 / 2,589 / 1,239 (Nov 11: iPad stacked, tilted-panel selection, floor) |
| Battle a Team | 2,743 | 2,418 | 1,926 **over** | not drawn yet |
| Team Preview Practice | 1,418 | 1,180 | 1,118 | not drawn yet |
| Test Run | 3,034 | 2,436 | 2,474 **over** | not drawn yet |
| Speed Tiers | 2,321 | 1,972 | 1,922 **over** | not drawn yet |
| Damage Calc | 3,170 | 2,733 | 2,261 **over** | not drawn yet |
| Type Chart | 3,105 | 2,391 | 1,856 **over** | not drawn yet |
| This Week | 4,724 **over** | 3,647 **over** | 3,361 **over** | not drawn yet |
| Pokémon Ratings | 3,064 | 2,441 | 2,379 **over** | 2,949 / 2,308 / 1,790 (Nov 11) |
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

- **Home, rebuild (Nov 11): REVERSED by Sim ("38px is barely anything, find a way").** The tool descriptions are back on phone. The space came from smaller Pokémon art on phone (hero, the two sixes, the underdog), never from text or spacing. The first version of this note, kept for the record: The phone page first measured 4,238px, over the 4,200 limit. Instead of shrinking anything, the "Everything NastyPlot does" tiles show only the tool names on phone, without their one-line descriptions. Each tool is still one tap away, and the descriptions still show on iPad and desktop. Sim can reverse this.
- **Home also changed:** the "This week in the ratings" chips moved from under the hero into the empty half beside the underdog, as a labelled list ("up 5 points": rating points, checked in AR.week). The old Welcome card, What's New and the sample-team note are not drawn. Each appears only in a special state (first visit, after an update, or while the sample team is loaded), never in the default page.
- **Pokémon info sheet, rebuild (Nov 11):** measured as a page, the sheet is 2,431px on phone, 1,744 on iPad and 1,417 on desktop. The page-length limits are for pages and the sheet scrolls by itself, so these are recorded for reference. It shows the Info tab, which is the default for a first visit (today's site remembers the last tab chosen).
- **Ratings, rebuild (Nov 11):** drawn by a helper agent, then checked and adjusted. Desktop is 10px under its limit. It shows 12 rows plus "See all 345 Pokémon", so no exception is needed. On phone the filter chips wrap so none is cut off at the edge.
- **All mock-up scripts now read the morning refresh (out/perf.json) the way the live site does** (fix found by the Ratings helper). The test harness's frozen data makes On teams and Win rate fall back to Nov 1; the scripts now show the live Nov 10 numbers. Ratings and their order did not change.

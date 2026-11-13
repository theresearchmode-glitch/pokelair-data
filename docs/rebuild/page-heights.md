# Page heights: today's site vs the rebuild

This table records the rule in design-system.md section 9. Heights are full page height in pixels, in the default state (nothing expanded), in day mode, with the sample team (Garchomp, Sneasler, Mega Charizard Y, Whimsicott, Basculegion, Kingambit).

- **Today's site:** measured Nov 11 with `node experiments/page-heights.mjs` (raw: test-runs/page-heights-today.json).
- **Rebuild:** measured with `node experiments/mock-heights.mjs`. **These are MOCK-UP heights, not the built page** (correction,
  Nov 11 night, Sim's sweep). Only a row marked "BUILT" was measured on the real built page. See the correction below.

> **CORRECTION, Nov 11 night (Sim's sweep, rule C1 in docs/rebuild/RULES.md).** The My Team figures that were here
> (1,737 / 2,587 / 1,699) are the mock-up's. The real built page (Preview foundation.html, sample team, default state) is
> over the limit at every size:
> - Sim's sweep (Chromium): phone 390: 4,309; phone 320: 4,818; iPad 820: 3,775; desktop 1440: 2,223. In use: 2,500 on desktop
>   after removing one Pokémon, 2,536 after an Apply, 4,108 with every section open.
> - Height helper (Nov 11 ~10:20 PM, built page foundation.html as published in Preview v50/v51, WebKit iPhone 13 for phone,
>   Chromium for iPad/desktop; report: test-runs/nov11-night/helper-height-report.md): phone 4,308; iPad 3,775; desktop 2,223.
>   Plain words: the built My Team is about 900px too long on phone, 275px on iPad and 420px on desktop.
> No other rebuilt page has been measured on the built page yet. Every other "Rebuild" number below is a mock-up number.

> **BUILT PAGES, re-measured Nov 12-13 (runs finished 11:55 PM Nov 12 and 12:04 AM Nov 13, file times; replaces the Nov 12 1:05 AM tables, which were out of date).**
> Check: `node experiments/c13-check.mjs app/dist/v2-c13.html <pages> <state>`; My Team rows on claude/design6 at 252994d; Home, Build
> and Battle rows on the 11:47 PM build (before AUTO-06 and the jump-bar tap fix, neither changes a height); sample team,
> daily data as the live page gets it, day mode, Chromium and WebKit (they agree within 24px; the larger is shown).
> Home, Build and Battle don't change with the team states, so their row is the default state.
>
> | Built page, state | 320 | 390 | 820 | 1440 |
> |---|---|---|---|---|
> | My Team (default) | 3,875 ok (3,900) | 3,743 ok (3,750) | 3,009 ok | 1,786 ok (1,800) |
> | My Team, 5 of 6 | 4,169 **over** | 4,040 **over** | 3,298 ok | 1,917 **over** |
> | My Team, six longest names (imported) | 3,944 **over** | 3,842 **over** (limit 3,700: not the sample team) | 3,091 ok | 1,863 **over** |
> | My Team, after Suggestion 1's Apply | unknown: today's data gives the sample team no suggestion that raises its score, so there was nothing to apply | | | |
> | My Team, every fold open (no limit set) | 6,530 | 6,217 | 5,026 | 4,017 |
> | Home | 4,203 ok | 3,799 ok | 3,437 ok | 2,910 ok (2,950) |
> | Build (before tapping Build; the check doesn't build a team. CORRECTION 12:53 AM: I first labelled this row "after building", wrongly) | 2,973 ok | 2,390 ok | 1,761 ok | 1,342 ok |
> | Build after building (Nov 13, 12:50 AM screenshot run, file time; Chromium, day 390/600, night 1100) | | 4,807 **over** (3,700) | 600: 4,196 | 1100: 3,428 **over** (1,800) |
> | Battle | 4,620 ok (4,650) | 4,097 ok (4,100) | 3,142 ok | 1,928 ok (1,950) |
>
> Where 5 of 6 grows (390, section heights): Matchups +168, Suggestions +107, Team Checks +105, the top +47, Your Games -89
> (gone). A missing Pokémon means more threats without an answer and more checks failing, so those sections list more.
> Nothing cut off, nothing sideways, 0 errors in any state. My Box and Compare were not re-measured this time.
> Check limit found: the "open" state is measured before the ~120-team winner-rate pass finishes, so the checks read
> "most recent event winners" (today's fallback) instead of the measured numbers; real pages fill them in within 10 s.

**Limits.** "over" marks a page past its limit.

| Size | Tool page | Home |
|---|---|---|
| Phone 390 x 844 | 3,700 (was 3,400; Sim, Nov 12: raised rather than fold content away or shrink the six); the first-visit sample team with its sample note 3,750 (Sim, Nov 12, option A) | 4,400 (was 4,200; Sim, Nov 12, option A: raised rather than shrink the sixes or move the underdog; plus the two-line event name) |
| iPad 820 x 1180 | 3,500 | 3,500 |
| Desktop 1440 x 900 | 1,800 | 2,700 (2,950 on a first visit: the welcome card is allowed over, Sim, Nov 12; raised from 2,900 at 8:18 PM because the Meta grows with the daily data) |

| Page | Today: phone | Today: iPad | Today: desktop | Rebuild (phone / iPad / desktop) |
|---|---|---|---|---|
| Home | 3,732 | 5,099 **over** | 3,980 **over** | 4,191 / 2,828 / 2,595 (Nov 11) |
| My Team | 4,458 **over** | 4,644 **over** | 3,445 **over** | BUILT (Nov 13): 3,743 ok / 3,009 ok / 1,786 ok in the default state; over with 5 of 6 and with long names (see the table above). Mock-up was 1,737 / 2,587 / 1,699 |
| My Team, no team yet (first visit) | (old empty state not measured) | | | 1,804 / 1,316 / 1,039 |
| Build for Me | 3,178 | 2,270 | 1,947 **over** | 2,298 / 2,943 / 1,796 (Nov 11) |
| All Suggestions | 1,769 | 1,553 | 1,550 | built (a sheet over My Team, Claude's design under authority; not measured as a page) |
| Saved Teams | 1,344 | 1,180 | 1,129 | built (a sheet; not measured as a page) |
| Compare Teams | 2,464 | 1,898 | 1,798 | built (Nov 12 table: 974 at 390 with no teams picked; not re-measured) |
| My Box | 1,407 | 1,257 | 1,203 | 2,180 / 2,589 / 1,239 (Nov 11: iPad stacked, tilted-panel selection, floor) |
| Battle a Team | 2,743 | 2,418 | 1,926 **over** | 3,378 / 2,545 / 1,789 (Nov 11) |

Battle limits (Sim, Nov 12, 10:15 PM, Q5 = A, the Battle log always shown): 320 4,250 · 390 3,750 · 1440 1,850 (were 3,900 / 3,700 / 1,800). Then Q6 = A (Sim, Nov 12, the Battle tools): 320 4,650 · 390 4,100 · 1440 1,950.
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
- **Build, rebuild (Nov 11):** drawn by a helper agent from a real build (Build around Garchomp, whole roster, 2 Megas: Sun, Tailwind, 91 Top tier), then checked. On phone, Other options, Cores and Recent winners are tabs, one tap each; today they are reached by scrolling.
- **Battle, rebuild (Nov 11):** drawn by a helper agent against the latest winner's open team sheet, then checked. The damage grid sits behind a tab. Opened, it takes the page to 2,570 on desktop and 4,699 on phone, so the proposed limit for that open state is 3 screens on desktop and 6 on phone (Sim to confirm).

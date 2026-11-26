# Do our numbers agree with the established sites? (Nov 17)

Written Tue Nov 17, 2026, 6:07 PM (from `bash docs/rebuild/now.sh`). Look-only helper. No site, data or script was changed.
Data: today's daily run on origin/main (commit 9f93e296, crosscheck "updated" 2026-11-17T11:25Z), copied to /tmp/helper-cross/.
Scripts used: /tmp/helper-cross/scripts/an1.mjs to an4.mjs (copies of update.mjs logic, run on a copy of data/).

## Short answer

1. Our scraping and counting are right. **Measured:** cut to Pikalytics' window, our own data matches its usage
   within 0.42 points on average (top 40). Its item and move shares match within about 1-2 points.
2. **The daily cross-check has gone blind.** Pikalytics has shown the same numbers since at least Nov 9.
   **Checked:** our saved copies from Nov 9, 10, 13 and 17 are identical, and so is the live page today.
   So every "disagreement" is now the meta moving away from a frozen copy. Nothing records this.
3. The cross-check never looks at the numbers the Strength Score uses most: the complete default sets (`cs`),
   the top-cut share behind the top-30 threats, or the whole-regulation usage behind the ratings.
   It also never checks Abilities or any percentages.
4. **Measured:** in 7 days, the default complete set changed for 6 of the top 40 Pokémon (Kingambit's
   switched between two quite different builds). 10 of the top 40 have a "most common set" used by under 25% of players.
5. We count usage three different ways, over three different windows (details in section 3). Each one is
   reasonable. But none of them is explained in one place, and two of them are never cross-checked.

## Table of disagreements (today, top 40)

| # | What | Ours | Theirs | Size | Likely cause | Explained anywhere? |
|---|---|---|---|---|---|---|
| 1 | Pikalytics usage, Kingambit | 29.0% | 22.9% | +6.1 | Pikalytics frozen (window ends ~late Oct/early Nov) | **No** (crosscheck "known" says "last 2 weeks") |
| 2 | Pikalytics usage, Indeedee / Indeedee-F | 4.5 / 10.6 | 10.2 / 6.0 | ∓5.7 / +4.6 | Pikalytics mixes the two forms (its "Indeedee" set has Follow Me + Helping Hand) | Yes (crosscheck.mjs "known": "merges both forms") |
| 3 | Pikalytics usage, Whimsicott | 15.5 | 10.0 | +5.5 | Time shift: whole regulation 9.6, our last 28 days 15.5 | **No** |
| 4 | Pikalytics usage, Sneasler | 39.2 | 34.6 | +4.6 | Time window and their off-format events (best fit below) | Partly ("different time windows") |
| 5 | Pikalytics usage, Charizard / Staraptor / Basculegion-F | 23.3 / 12.4 / 5.9 | 19.4 / 9.0 / 2.9 | +3 to +4 | Same | Partly |
| 6 | Pikalytics win rate, Gardevoir-Mega (the only flag today) | 42.9% | 46.8% | −4.3 vs average | Time shift: ours was 47.1% in Pikalytics' window; small sample (367 teams) | **No** |
| 7 | Pikalytics top item: Pelipper | Damp Rock 37.5 | Sitrus 37.9 | lead swapped | Meta shift: in their window ours is Sitrus 38.1 / Damp Rock 30.8 | **No** (not flagged: Sitrus is our #2) |
| 8 | Pikalytics top item: Volcarona | Grassy Seed 34.9 | Rocky Helmet 40.2 | lead swapped | Meta shift: in their window ours is Helmet 38.5 | **No** (not flagged) |
| 9 | Pikalytics top item: Milotic | Sitrus 52.6 | Leftovers 47.6 | lead swapped | Meta shift: in their window ours is Leftovers 47.1 | **No** (not flagged) |
| 10 | Pikalytics top item: Sinistcha | Rocky Helmet 30.4 | Colbur 29.1 | lead swapped | Meta shift: in their window ours is Colbur 28.7 | **No** (not flagged) |
| 11 | Official top 64, Kingambit item | Chople 38.2 | Life Orb 38.2 | lead swapped | Different players (top 64 at big events, Sep 19-Nov 14) | Partly ("usage not comparable"; sets "should agree for staples") |
| 12 | Official top 64, Garchomp (species) item | Garchompite Z | Choice Scarf 35.1 vs Z 34.6 | near tie | Near tie; different players and window | **No** |
| 13 | Official top 64, Pelipper / Sinistcha / Indeedee item | Damp Rock / Helmet / Sash | Sitrus / Colbur / Scarf | lead swapped | Different players and window; official samples are small (70 / 52 / 22) | **No** |
| 14 | Smogon 1760+ vs Showdowntier usage (11 flagged) | Kingambit 42.3 | 21.0 | +21 | Smogon weights its 1760+ figure by player rating; Showdowntier counts every battle | Yes (`infoOnly`, "known") |
| 15 | PokéBase usage vs our 28-day usage | Rillaboom 37.2 | 48 | −10.8 | PokéBase best matches our **whole-regulation** numbers (average gap 1.37 points) | **No** (PokéBase not in crosscheck) |
| 16 | MetaVGC, Garchomp item | Choice Scarf 49 | Life Orb 49 / Scarf 26 | opposite | Unsure: their data pool and window aren't stated. Pikalytics, PokéBase and the official sheets all agree with us | **No** |
| 17 | Our default set vs top picks: Basculegion | cs item Life Orb | our own top item Choice Scarf 29.2 | differs | Complete set ≠ top pick per slot (Scarf builds split across move variants) | **No** |

Not checkable (said plainly): Pokémon Zone refuses automated requests (**checked** today: 403; respected).
op.gg Doubles: the server-side page only carries the Singles list. Doubles loads by script, so I couldn't check our
`meta_ingame.json` order against it without a browser (**unsure**).

## 1. Today's crosscheck results (out/crosscheck.json on main, Nov 17)

**Checked** (read the file and crosscheck.mjs):
- `tour-vs-pikalytics`: 1 of 40 flagged (Gardevoir, win rate −4.3). Usage gaps reach 6.1 points (Kingambit), all within the
  tolerance of max(6 points, 45% of the larger). Only one item check could fire: their top item has to be in our top 2.
  Only one move check could fire: their top move has to be in our top 4. So the lead swaps in rows 7-10 above can't be flagged.
- `smogon1760-vs-showdowntier`: 11 flagged, 6 of them staples. It is `infoOnly` by design (two different player groups).
- `tour-sets-vs-official-top64`: 0 flagged. The same membership rule applies, so the item lead swaps in rows 11-13 pass.
- `official-vs-liquipedia`: 9 events. Placements agree 47/47 to 58/58. Buenos Aires (Special Championship) has no Liquipedia page.

**Wrong statement found (report to Sim):** CLAUDE.md says crosscheck.mjs checks that "our popular-set numbers agree"
with the established sites. **Checked in code:** it only compares the top item and top move, as membership tests.
It never compares a percentage, an Ability or a complete set. The Nov 8 note "39/39 items, 39/39 Abilities"
(docs/grade-accuracy.md:172) was a one-off manual check, not the daily one.

**Also checked:** this checkout (claude/design6) holds Nov 10 data in out/ (commit cc52a26c). origin/main holds Nov 17.
Preview builds read `../out/` (app/build.mjs:62), so a Preview built from this branch shows data a week old.

## 2. Spot-checks against the live sites

**Pikalytics** (championstournaments, AI and normal pages, fetched today):
- **Checked:** "Data Date 2026-05". Rillaboom is at 37.37%, the same as in our saved copies from Nov 9, 10 and 13. The page says "Updated daily".
- **Checked:** the events in its featured Rillaboom teams date Oct 8-27 (Limitless API). Its "Recent Top Teams" list includes an
  event named "(NO REG MC)", which our filter leaves out (formats.mjs OFF_FORMAT matches "spooky").
- **Measured:** I tried every 14/21/28-day window of our own data. Pikalytics' usage is matched best by
  **Oct 9 - Nov 5 with off-format events included**: average gap 0.42 points over the top 40, about 9,400 teams. That fits
  its own core table (1,796 teams = 19.5%, so about 9,200 teams). With our filter on, the best average gap is 1.03 points.
  Over our current window (Oct 19 - Nov 16) it is 1.78.
- **Measured:** in that window, our item and move shares match Pikalytics within about 2 points. Examples: Garchomp Scarf
  59.1 vs 59.8, Kingambit Chople 33.0 vs 32.9, Pelipper Sitrus 38.1 vs 37.9, Volcarona Helmet 38.5 vs 40.2,
  Gholdengo Life Orb 89.4 vs 89.7.
  This is an independent confirmation that our Limitless reading, form mapping and counting are correct.

**PokéBase** (pokebase.app, fetched today):
- **Measured:** its "Usage" list (species, Mega and plain together) matches our whole-regulation table, `limitless.json`
  `tour`, Sep 12 - Nov 16. The average gap is 1.37 points over 31 species, against 3.12 for our 28-day numbers and 3.15 for
  the official top 64. **Unsure:** PokéBase doesn't say what its pool is.
- **Checked:** its "Most common set" lists the top pick for each slot, each with its own "% of builds". It is not a
  complete set that players actually run together. Against our `cs` for the top 24 forms, the Ability agrees 24/24
  and the item 19/24. The item differences: Basculegion (Scarf vs our Life Orb, see row 17), plus Pelipper, Sinistcha
  and Milotic (time shifts, rows 7-10). Garchomp differs only because PokéBase merges Mega Z into the species page. The moves differ where our complete set leaves out
  the 4th most common move: Kingambit has Low Kick in place of Protect, and Archaludon has Snarl in place of Flash Cannon.

**MetaVGC** (metavgc.com/pokemon/garchomp): its move % are a share of all move slots (they add up to about 100%), so they
must
never be compared with ours (ours = % of that Pokémon's sets). Its item order for Garchomp is the reverse of everyone
else's (**unsure** why: no window or pool stated; it cites "Showdown usage reports and official tournament results").

**Smogon** (smogon.com/stats/2026-10, fetched today): **checked**: our 1760+ numbers equal the file (Sneasler 49.9469%).
**Measured:** the raw usage column is the same in the 0, 1630 and 1760 files (Sneasler 30.126%). Only the weighted %
changes, which confirms the Showdowntier gap (row 14) is Smogon's rating weighting, not a mistake.
Pikalytics' ladder format (Rillaboom 30.5%, Sneasler 29.7%) is close to the unweighted numbers. It is also dated "2026-05".

## 3. Usage weighting: how each number is counted

**Checked in code** (update.mjs, topcut.mjs, ladder.mjs, sources.mjs, opgg.mjs, perf.mjs, app 55-threats.js):

| Number | Where it's used | Unit | Window | Weighting |
|---|---|---|---|---|
| meta_tour `u`, sets, `cs` | Meta page, default sets on every team | one team sheet per player per event (6 known Pokémon) | last 28 days | none; no minimum games or event size |
| limitless.json `tour` | ratings (perf.json "tour") | team sheet with 3+ games | whole regulation (Sep 12 - Nov 16) | none; win % average 51.1 (filter removes early drops). The rating centres on it (13-rating.js:27) |
| limitless.json `results.tc` (top-cut share) | **top-30 threats → Matchups part of the score** | top-cut finishers | all events, 21-day half-life | weighted by recency and event size (log2 of players / 4) |
| Smogon 1630+ / 1760+ | ladder sets / ratings "smogon" | every battle's team | one calendar month (Oct) | Smogon's rating weighting |
| Showdowntier | ratings "ladder" | every rated battle | 14 days | none, all ratings |
| op.gg | ratings "ingame", default Meta source | rank only | season M-8 | unknown (op.gg doesn't say) |

**Measured** (copy of the data, standard events, last 28 days):
- 7,942 teams came from 3,136 player IDs. 1,471 IDs entered 2+ events, and one entered 61. If each player counts once
  (their teams sharing a weight of 1), usage moves by at most about 2 points (Kingambit 28.9 → 26.9, Charizard-Y 22.7 → 21.6).
- Events with 32+ players only: within 1 point of all events. Events under 16 players (598 teams) differ more
  (Rillaboom 29.6 vs 37.2), but they are 7.5% of teams.
- Top 8 of 32+ events (791 teams) vs all teams: Charizard-Y 29.5 vs 22.8, Indeedee-F 7.3 vs 10.6, Garchomp-Mega-Z 8.1 vs 11.0.
  Placement is the choice that matters most, and the threat list already uses it.
- The three tournament numbers can disagree by up to 8 points for the same Pokémon. Examples (28-day / whole regulation /
  top-cut share): Rillaboom 37.2 / 45.2 / 41.0, Whimsicott 15.5 / 9.6 / 12.7, Gholdengo 15.9 / 21.5 / 19.0.
- Double counting: no event appears twice (no same name and day). One possible overlap: an 8-player
  invitational on Oct 12 shares 7 of 8 players with a 60-player event that day (**unsure** whether it is a separate event;
  7 teams out of about 15,000, negligible). Within an event, update.mjs already skips repeated pairings and self-pairings.
- Hand-typed spellings ("Poison Tourch", "U-Turn") are not cleaned before `cs` is counted. **Measured:** cleaning
  them changes no top-40 default set and raises its share by at most 0.8 points. Harmless today.

Across the three sources the unit isn't consistent (one sheet per event; one team per battle; a rank only), and it can't
be. The windows differ too (28 days, whole regulation, one month, 14 days, a season). That's fine if each number says so,
but only some labels do.

## 4. Recommended fixes, ranked by likely effect on the Strength Score

1. **Make the default complete set stable, and check it.** Reason: an unchanged team's defaults feed the Matchups damage
   calcs. **Measured:** 6 of the top 40 flipped in a week, with near-ties (Sneasler 11.6% vs 9.3%, Tyranitar-Mega 48.1 vs 39.8).
   Option: keep yesterday's `cs` unless the new one leads by a margin. Also store the runner-up and its share, and add a crosscheck
   row comparing `cs` with yesterday's. Size on the score: **my guess, not yet tested**. A test that could fail: grade 20 fixed
   untouched teams with the Nov 10 vs Nov 17 meta_tour and compare the score changes.
2. **Cross-check the inputs the score actually reads.** Reason: right now none of them is checked by an outside source.
   (a) the top-cut share behind the top-30 threats against the official top-64 share (Victory Road, already downloaded);
   (b) `limitless.json` `tour` against PokéBase (already agrees within 1.37 points, so it would pass today and catch breaks);
   (c) Abilities and item/move percentages, not only membership.
3. **Detect a frozen outside source.** Reason: a check against a copy that never changes can't catch our own mistakes. If a
   source's numbers are identical for 3+ days (or its date doesn't move), mark it "stale" and send it to skip.mjs like a
   failed source. Then compare it against our own data cut to its window (the Oct 9 - Nov 5 test above), and fix the "last
   2 weeks" wording in crosscheck.mjs "known". Ask Sim whether to email Pikalytics (**unsure** whether they know).
4. **Write down the three tournament usage numbers in one place**, and show each window on the page.
   Reason: they disagree by up to 8 points by design, and that looks like a bug if it isn't explained. Whether the ratings
   should move to a recency-weighted window is Sim's call (it changes ratings, not the grade's Pokémon part, which comes
   from model.mjs).
5. **Compare Indeedee and Indeedee-F as one species in the Pikalytics check.** Reason: it flags every day for a known
   naming difference on their side. A small fix.
6. **Per-player weighting:** not recommended for now. Reason: **measured** effect ≤2 points. One player with 61 teams can't
   move a top-40 number much.
7. **Preview data:** rebuild the claude/design6 Preview from today's out/ before showing Sim numbers. Reason: this
   branch's out/ is from Nov 10.

No player names appear in this report. Featured-team authors on Pikalytics and MetaVGC were seen but left out.

# Meta section: every feature of today's site (inventory for the rebuild)

Look-only prep (Nov 14, written 1:54 PM Eastern by the clock). Source: today's Meta behaviour tests, app/test/behaviour/D-meta-shell.mjs,
which describe each feature as it works today. Every line below must still work on the rebuilt Meta pages (rule: never remove
functionality). Approved look: the Meta mock-up in the Preview gallery (ratings.html, 'Who wins right now.'). Sim's Mega ranking ask:
docs/rebuild/meta-notes.md item 1.

## RATE
- RATE-01: Ratings head: kicker with team count and date; "How ratings work →" opens the method section
- RATE-02: Ratings search by name or type, with a match count
- RATE-03: Filter: two types at most, flags, badge count, Clear
- RATE-04: No matches: clear message and "0 of N match"; empty box message
- RATE-05: Top of the ratings: #1 first, rows in rating order, 20 on desktop; a row opens its sheet
- RATE-05b: Phone: the top list is shorter (16 rows)
- RATE-06: Details on the top list shows win % and games
- RATE-07: Every Pokémon, by Tier: six tier rows, "+N more" / "Show fewer", remembered
- RATE-08: About the Ratings: track record line and four number cells
- RATE-09: Rating bands: tier letter matches the number everywhere on the board

## META
- META-01: Usage source line names the source and size
- META-02: Usage source switch changes the list; starts on Ranked ladder again after a reload
- META-03: Usage search filters every rank; says when nothing matches
- META-03b: The "rest of the list" button hides while searching
- META-04: Usage rows: rank, name, types, usage and team count; trend badges where ranks moved
- META-05: Expanded usage row: bars "Of N teams", teammates, Add to team
- META-06: Top 10, then "Ranks 11–60" shows the rest and flips
- META-07: Usage without data says so

## TOP
- TOP-01: Winning Teams source line with update date
- TOP-02: Team search: suggestions with kind and count; Enter makes a chip; nonsense says so
- TOP-03: Team search results: count, "Often with" adds a filter, cards with matches
- TOP-04: Your Team strip: checks badge with six; asks for six when not full
- TOP-04b: Your Team strip with five Pokémon asks to add six
- TOP-05: Team list: top 3, "More Winning Teams" shows more, "Show fewer" folds back
- TOP-06: Card actions: Load team (confirm, Undo), Practice against, Compare
- TOP-07: Winning Teams without data says so

## EVT
- EVT-01: Events head: total, online and official counts, "?" explains
- EVT-02: Next events calendar: countdowns, Show all, recent results open the event
- EVT-03: Event filter Official keeps only official events
- EVT-04: Event list 12 at a time with "Show more"
- EVT-05: Event detail: placings 1st→16th, opens at top, "‹ All events" returns
- EVT-06: Team sheet card: Sets shows items/moves; Load team needs a second tap and loads the exact sheet
- EVT-07: Events without data: empty note

## WEEK
- WEEK-01: This Week head: two date ranges, team and event counts, Share button
- WEEK-02: Share this week opens a 1200-wide image
- WEEK-02b: Without data, Share says "Nothing to share yet"
- WEEK-03: Rising and Falling: "a% → b% of teams", points; tap opens the sheet
- WEEK-04: Most used this week: five tiles open their sheet
- WEEK-05: New tech: kind word, "a% → b% of its teams", Details shows team counts
- WEEK-06: Winners this week open that event on Events
- WEEK-07: Team styles with % and real changes only
- WEEK-08: New in top cut: first top 8 this regulation, or "nothing new"
- WEEK-09: How we decide what changed: fold with thresholds and date
- WEEK-10: This Week without data: empty note
- WEEK-11: Kind marker: icon and word, never colour alone

## ARCH
- ARCH-01: Archetype list sorted by share with team counts (B ARCH-03)
- ARCH-02: Inside a guide: how to beat it and what your team has (B ARCH-04)

## TRACK
- TRACK-01: Track Record head and stats
- TRACK-02: How the check works: three steps and the fair-test line
- TRACK-03: Top-8 teams by the rating we gave: four bands and a verdict
- TRACK-04: Biggest hits and misses open their sheet
- TRACK-05: Week by week chart (or the "from about" note)
- TRACK-06: Coming as the data grows: with only 3 events it lists the verdict and misses still to come
- TRACK-06b: With 34 events the "coming" list is gone (everything is shown)
- TRACK-07: Events Checked fold: one row per event checked, remembered
- TRACK-08: Track Record link and empty state
- TRACK-08b: Track Record without data: Collecting

## SETS
- SETS-01: Look up a Pokémon: its sets show and stay after reload (B SETS-02)
- SETS-02: Your Team row: tap a member to see its sets (B SETS-03)
- SETS-03: Default: your first team member, else the #1 rated Pokémon (B SETS-04)
- SETS-03b: Default with no team: the #1 rated Pokémon
- SETS-04: Set head: tier pill and "Your <Pokémon>: Ability @ Item, moves" (B SETS-05)
- SETS-05: Sets source switch Best data / Tournaments / Showdown, remembered (B SETS-06/07)

## METHOD
- METHOD-01: How We Calculate head: freshness, team and game counts
- METHOD-02: How to read our numbers: rating bands and Strength Score bands with the approved words
- METHOD-03: Ten remembered sections; each opens with content
- METHOD-04: Links and tips open How We Calculate at the right section
- METHOD-05: Track Record card opens Track Record

## What the approved Meta mock-up covers (checked by word search in docs/rebuild/mocks/ratings.tpl.html, Nov 14)
- Shown: the Ratings tab (head + "How ratings work", search "Find a Pokémon or type", filter chips All / Megas / No Megas / Hidden gems /
  In my box / Types, the rated list with tier, rating, "On teams", win rate and games, Track Record link), and the section tabs
  Pokémon / Tournaments and Rating / Usage / Sets.
- Not designed in the mock-up (words not found): Clear for the filter, "Show fewer" / tier rows "+N more", the Usage tab's
  content (source switch Ranked ladder / Showdown ladder, teammates, Add to team, ranks 11-60), Tournaments content (events,
  winning teams), This Week (rising / falling), Archetypes, Details on a row. These need mock-ups (pictures for Sim) before they
  are built, the same way Test Run's mock-up missed four of today's features.

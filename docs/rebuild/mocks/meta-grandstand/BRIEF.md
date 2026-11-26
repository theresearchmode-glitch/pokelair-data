# Meta: Sim's pick "The Grandstand" (Nov 14)

Sim, with the brief: "keep working on the home page. once that is done you can start work on the meta tab ... take it as a rough guide bc you know how we like things done and our rules so i trust you to handle it the correct way." Our rules win; every change from the brief is listed for Sim. The brief text from the designer chat follows, as received (with its 12 pictures beside this file).

META SECTION — SIM'S PICK: "THE GRANDSTAND" (Ratings, Megas view, Usage, Sets). Design brief, no code.

Sim chose this on Nov 14 after several rounds of mock-ups. Twelve pictures come with it (list at the end). Each picture shows dark on the left and light on the right. They are mock-ups drawn over the built v2 page with today's real data. Your rules win over anything here: where this brief and RULES.md, design-system.md or decisions.md disagree, follow yours and tell Sim. Section 8 lists the conflicts I already know about. Please don't copy my mock CSS or class names (one of mine clashed with your Test Run ".tr" class); build it your way.

THE IDEA
The whole format is a grandstand. Every Pokémon stands on a bench in its tier, with its name and rating under it. Higher tiers stand bigger. It is a tier list, which players already know how to read, staged so it is fun to look at. Usage and Sets reuse the same pieces: a spotlight in the header, Pokémon standing on benches, and plain bars for numbers.

0. WHAT STAYS EXACTLY AS IT WORKS TODAY
Every feature in docs/rebuild/meta-features.md for RATE, META and SETS must still work. This brief changes how they look, not what they do. Same data, same helpers, same numbers. Nothing is removed.

1. THE HEADER (all three tabs)
- Left: the eyebrow ("Meta · Ratings"), the headline on two lines with the second line in PLOT blue, one sentence, the facts line (teams, events, games, dates) and the links "How ratings work" and "Track Record".
- Right: a spotlight. One Pokémon large on a slanted panel in its type colours, a small blue tag saying why it is there, its name, type chips, its rating as a very big number with the tier beside it, three small facts, and two buttons.
  - Ratings: tag "#1 right now", the top-rated Pokémon; facts On teams, Win rate, Base Speed; buttons Open info sheet, Build around it.
  - Megas view: tag "The top Mega right now", the top-rated Mega.
  - Usage: tag "Most used right now"; facts Usage rank, On teams, Win rate; buttons Open info sheet, Add to team.
  - Sets: the Pokémon being viewed; tag "On your team" when it is.
- Below: the Pokémon / Tournaments tabs and the Rating / Usage / Sets switch, as in the approved Meta mock-up.
- Phone and iPad: the spotlight sits under the headline block.

2. RATINGS: THE GRANDSTAND
- Search field and the filter chips (All, Megas, No Megas, Hidden gems, In my box, Types), as approved.
- A title row "The Grandstand" with a one-line key: big number = rating, MEGA = a Mega, up/down arrows = moved this week, diamond = hidden gem, blue bar = on your team.
- Six steps, S to F. Each step has:
  - a 3D block on the left in the tier's colour with the tier letter, the band ("90+") and the count ("11 Pokémon"); on phone this becomes a slanted bar across the top of the step;
  - the tier's words in small capitals ("TOP OF THE FORMAT");
  - one or more bench rows. A bench is a thin slab with the tier colour on its front edge. Pokémon stand on it, each on a small oval base in its type colours (two halves for two types);
  - under the bench, per Pokémon: a "MEGA" tag line (kept as an empty line for the others so names line up), the name, the rating in the headline font, a small up or down arrow with the points when it moved this week, and a short blue bar when it is on the player's team. Hidden gems carry the diamond before the name.
- Size by tier: S Pokémon are the largest, then smaller step by step down to F.
- The #1 Pokémon has a small "#1" flag and a soft glow in the S colour behind it.
- Rows are never half empty. A tier shows everyone when they fit in its rows; the Pokémon share the full width evenly. A shorter last row is centred. When a tier has more than fit, it shows full rows and a "See all N ›" link at the right of the tier's words. No "open tier" tiles.
- Rows drawn: desktop up to 12 across, two rows at most for A and D, one row for F. iPad up to 6 across. Phone 4 across (5 when a tier has 5, 9 or 10), three rows at most, two for D, one for F.
- Desktop: pointing at a Pokémon shows a small dark note above it (name, rank, on-teams, win rate, "Click for its info sheet"). Tap or click opens its info sheet, as today.
- "About the ratings" fold underneath, as today.

3. RATINGS: THE MEGAS VIEW (Sim's Nov 13 ask, meta-notes.md item 1)
The Megas chip turns the same grandstand into Megas only. Each Mega carries its rank among Megas ("#1" to "#82") where the MEGA tag was. The spotlight shows the top Mega. A "Clear" chip appears. Megas stay in the main view too.

4. USAGE
- Controls: search "Find a Pokémon in the ranks", the source switch (Ranked ladder, Showdown ladder, Tournaments) and the source line.
- "The Podium": ranks 1, 2 and 3 stand on gold, silver and bronze blocks with a big 1, 2, 3 on the front (2 on the left, 1 in the middle and tallest, 3 on the right). Ranks 4 to 10 stand on benches beside the podium on desktop (four, then three centred) and under it on iPad and phone. Each shows its rank and name, and "% of teams" plus the trend badge when the source has them.
- "How <Pokémon> is played": the picked Pokémon's moves, items and abilities as bars with the name on the left and the percentage on the right, in its type colours. Then "Usually alongside": its teammates on a bench with their percentage. Then the "Add to team" button and one small line about where the numbers come from. Picking another Pokémon above swaps this section. This replaces today's expanded row.
- "Ranks 11–60 · the rest of the list" button under it, as today.

5. SETS
- Controls: "Look up a Pokémon" and the source switch (Best data, Tournaments, Showdown) with the source line.
- "Your team": the player's six on one bench; the one being viewed is lit in blue and its name is blue. It opens on the first team member, or the #1 rated Pokémon with no team, as today.
- "How <Pokémon> is built": the "Your <Pokémon>: Ability @ Item · moves" line with a blue rule on its left, then Moves (eight bars) beside Item, Ability and Nature stacked. A Mega shows "Always holds <stone>." instead of item bars. A list with no percentages shows plain names without bars.
- "Usually alongside": its teammates on a bench.
- The source note line at the bottom, as today.

6. KNOWN PROBLEMS IN THE MOCK-UPS
- The desktop hover note covers part of the key line when it shows over the top row.
- Phone Ratings is about 4,400 px long.
- Names are narrowed slightly (the same font, a narrower width) where slots are tight, so no name breaks inside a word. Check that against your type rules.
- The Ranked ladder has ranks but no percentages, so the podium shows no numbers on that source. It also lists plain "Charizard" and "Raichu", because that list does not separate Megas. Both come from the data.
- Trend badges on Usage did not show in the mock because no rank history was loaded; their place is beside the rank line.

7. NOT DRAWN OR NOT CHECKED
- Search results and "no matches", the Types filter open, Hidden gems and In my box switched on, an opened tier ("See all"), and the Details view with win rate and games (RATE-06): these need a picture for Sim before they are built.
- Usage on the other two sources, ranks 11–60 opened, and every "no data" state.
- Sets on the Tournaments and Showdown sources, and a Pokémon that is not on the team.
- Tournaments, This Week, Archetypes and Track Record are not part of this brief.
- Widths between the three drawn (1440, 820, 390), a 320-wide phone, and iPad landscape.
- Reduced motion, keyboard order and screen-reader text. The stand is pictures with labels; each Pokémon needs one clear spoken label (name, tier, rating, rank).
- Scrolling speed on Sim's Windows desktop: about 80 Pokémon pictures each have a drop shadow. Your rule about sprite glow on mouse screens applies.

8. WHERE THIS MAY CONFLICT WITH YOUR RULES
- The approved Meta mock-up (ratings.html) has a featured Pokémon beside a ranked list. Sim now prefers this; the header pieces and the chips are kept from it.
- Tier colours come from today's LTIERS colours. The tier block uses dark or white text depending on the colour; please use your own contrast-safe versions.
- Gold, silver and bronze for the podium are new colours; they are not in tokens.css.
- The mock uses a few off-scale sizes (the big rating in the spotlight, the tier letter) and hard-coded black and white shading on the 3D faces.
- The benches and blocks are one level on the page: no box inside a box. Please keep it that way.
- The mock uses a soft glow behind the #1 Pokémon and on the hovered or picked one.

9. WORDS THAT ARE NEW (Sim has seen them in the pictures; confirm before they ship)
- "The Grandstand", "#1 right now", "The top Mega right now", "See all N ›".
- Usage: headline "Who gets picked right now.", "Most used right now", "The Podium", "How <Pokémon> is played", "Usually alongside".
- Sets: headline "How it's built right now.", "How <Pokémon> is built".

10. SIM'S STANDING RULES
Preview before live; nothing goes live without her go. Real data only. Never remove functionality. Every name readable at phone size. Even layouts, no half-filled rows, no empty strips. Dark and light both polished. Headlines and big numbers in Unbounded slanted, everything else Instrument Sans; do not change the fonts. Never call the site an "app". No names or emails collected. No model names in commits.

PICTURES (dark left, light right)
meta-10-grandstand-final-desktop.png / -phone.png / -tablet.png — Ratings, everyone
meta-11-grandstand-megas-desktop.png / -phone.png / -tablet.png — Ratings, Megas only
meta-12-usage-desktop.png / -phone.png / -tablet.png — Usage
meta-13-sets-desktop.png / -phone.png / -tablet.png — Sets

# Google titles and descriptions — DRAFT (Nov 24), for nastyplot.org (built Dec 7–20)
Page list from the code (checked: V2.pages in app/src/v2). Rules used:
- Title ≤ 60 characters: the tool's own name first (what people search), then "· NastyPlot". Home lists the big tools.
- Description ≤ 155 characters: what you get, in plain words, with the words people type (Pokémon Champions, VGC, damage calc...).
- Address: real paths (nastyplot.org/calc), not "#calc". Brand line everywhere else: "Everything for Pokémon Champions".
- Templates in {braces} are filled from our data per page (Pokémon, move, item, Ability, Nature).

| Page (code) | Address | Title | Description |
|---|---|---|---|
| home | / | NastyPlot · Pokémon Champions team builder, damage calc & meta | Build a winning Pokémon Champions team: Strength Score, damage calc, speed tiers, usage stats and winning tournament teams, updated every day. |
| team (My Team) | /team | Team Rater: Strength Score for your team · NastyPlot | Paste your Pokémon Champions team and get its Strength Score out of 100, matchups against the top threats and suggestions to make it stronger. |
| build | /build | Team Builder for Pokémon Champions · NastyPlot | Build a Pokémon Champions team from proven cores and real tournament sets, with every pick checked against today's meta. |
| battle | /battle | Battle Planner: leads and picks · NastyPlot | Your six against their six: which four to bring, which two to lead and the threats to watch, from real Pokémon Champions games. |
| calc | /calc | Damage Calculator for Pokémon Champions · NastyPlot | Exact damage rolls for Pokémon Champions: Megas, weather, terrain, Intimidate and items, with KO chances in plain words. |
| speed | /speed | Speed Tiers for Pokémon Champions · NastyPlot | Who outspeeds whom in Pokémon Champions: every common set's Speed, with Tailwind, Trick Room, Scarf and Megas. |
| types | /types | Type Chart · NastyPlot | Every type matchup for Pokémon Champions at a glance: what hits what super effectively, and what resists it. |
| practice | /practice | Practice: real tournament matchups · NastyPlot | Play out real Pokémon Champions tournament matchups and see how your choices compare with the winners'. |
| gauntlet (Test run) | /test-run | Test Run: your team vs the top teams · NastyPlot | Run your Pokémon Champions team against today's top tournament teams and see which ones it beats and which it doesn't. |
| meta (Ratings) | /meta | Pokémon Champions Tier List & Ratings · NastyPlot | Every Pokémon in Champions rated from real tournament results: S tier to the hidden gems, updated daily. |
| usage | /usage | Usage Stats: Pokémon Champions VGC · NastyPlot | The most-used Pokémon in Pokémon Champions from online tournaments, official events and the ladder, refreshed every day. |
| sets | /sets | Popular Sets: items, moves, Abilities · NastyPlot | The complete sets real players run in Pokémon Champions: item, Ability, Nature and four moves, with how often each wins. |
| tournaments (Winning Teams) | /winning-teams | Winning Teams: Pokémon Champions tournaments · NastyPlot | Top-cut teams from recent Pokémon Champions tournaments with full team sheets, ready to copy. |
| weekly (This Week) | /this-week | This Week in Pokémon Champions · NastyPlot | What changed in the Pokémon Champions meta this week: risers, fallers, new winning teams and events. |
| events | /events | Pokémon Champions Tournaments & Events · NastyPlot | Upcoming and recent Pokémon Champions tournaments and official events, with results and winning teams. |
| archetypes | /archetypes | Team Archetypes: Rain, Sun, Trick Room · NastyPlot | Every winning Pokémon Champions team style (Rain, Sun, Trick Room, Tailwind...), how often it wins and its key Pokémon. |
| natures | /natures | Natures in Pokémon Champions · NastyPlot | Every Nature, what it raises and lowers, and which ones tournament players actually use in Pokémon Champions. |
| track (Track Record) | /track-record | Our Track Record: were our ratings right? · NastyPlot | How our Pokémon Champions ratings and predictions held up against real tournament results, out in the open. |
| method | /how-it-works | How NastyPlot works · NastyPlot | Where our Pokémon Champions numbers come from and how the Strength Score and ratings are worked out. |
| gifts / news | /gifts | Mystery Gifts & News: Pokémon Champions · NastyPlot | Live Mystery Gifts, codes and the latest Pokémon Champions news in one place. |
| compare | /compare | Compare Two Teams · NastyPlot | Put two Pokémon Champions teams side by side: Strength Score, matchups and which one wins more. |
| box (My Box) | /box | My Box · NastyPlot | The Pokémon you own in Pokémon Champions, and the best teams you can build from them. |
| about | /about | About NastyPlot | NastyPlot is a free, fan-made toolkit for Pokémon Champions, built on real tournament data. No accounts, no ads. |
| privacy | /privacy | Privacy · NastyPlot | No accounts, no trackers: what NastyPlot stores (only on your device) and what it never collects. |
| **pokemon** (template) | /pokemon/{name} | {Pokémon}: sets, usage & win rate · NastyPlot | {Pokémon} in Pokémon Champions: its most common set, {usage}% of teams, {win}% win rate, best partners and counters. |
| **move sheet** | /move/{name} | {Move}: who uses it in Pokémon Champions · NastyPlot | {Move} ({type}, {power} power): what it does in doubles and the Pokémon that run it most in Pokémon Champions. |
| **item sheet** | /item/{name} | {Item}: who uses it in Pokémon Champions · NastyPlot | {Item}: what it does and which Pokémon carry it most in Pokémon Champions tournaments. |
| **Ability sheet** | /ability/{name} | {Ability}: Pokémon Champions Ability · NastyPlot | {Ability}: what it does in doubles and the Pokémon that run it in Pokémon Champions. |
| **Nature sheet** | /nature/{name} | {Nature} Nature in Pokémon Champions · NastyPlot | {Nature}: +{up} / −{down}, and the Pokémon tournament players give it most in Pokémon Champions. |

Notes:
- Page names in titles match what people search ("Tier List", "Damage Calculator", "Team Builder"), even where our on-page
  name differs ("Ratings", "Test run"). Our Word list (CLAUDE.md 19) still rules on the page itself.
- Each Pokémon, move, item, Ability and Nature page is its own address: about 345 + 470 + 170 + 200 + 25 ≈ 1,200 pages Google can
  find, each answering a real search ("Garchomp Champions set", "Choice Scarf users"). This is our biggest SEO lever.
- Not checked: exact character counts of the templates once filled (long Pokémon names); the build will trim to fit.

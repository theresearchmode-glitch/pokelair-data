# Competitor scan: Pokémon Champions VGC tools (Nov 24, 4:43–5:05 PM by the clock). Look only, no site changes.

## How I checked
- **Browser:** Playwright (Chromium) opened every site below at 1440 and at 390 (phone).
- **What I saved per page:** a screenshot of the first screen, the visible text, and the ad requests on the page.
- **Statmie's "My team":** I pasted a real team into it.
- **Pages that blocked my browser:**
  - Pokémon Zone (Cloudflare "verify you are human")
  - op.gg at 1440
  - I read both through Firecrawl instead, so for those two I have a summary and a link list only.
- **App Store pages:** opened at 1440 (the 390 load was aborted).
- **Reddit:** blocked (both Firecrawl and the JSON feed). Reddit opinions are **not checked**; I found tools through web search.
- **NastyPlot itself:**
  - The feature list comes from the built page (design6 bff0c5cf, `--v2 --preview-data`, "v2 guard: clean") and from app/src/v2/pages.
  - I did **not** open the Preview artifact.
  - Its data is the saved Nov 9 copy. The live site's freshness is **not checked** here.

## Who's out there (16 tools; checked: opened)
- **Statmie** (statmie.com, new):
  - Covers Pokémon GO + Champions.
  - Pages: Meta, Top teams, My team, Damage calc, Speed tiers, Archetypes, Tournaments, Guide.
  - 7 languages. No ads, no accounts.
- **Pikalytics:** web + an iOS app ($0.99, 4.6★, 738 ratings).
  - Usage, top teams, team builder, calc, speed tiers, live tournaments, quizzes.
  - Heavy ads on the web; the app is ad-free and works offline.
- **ChampDex** (champdex.com + an iOS app, 3.1★ from 7 ratings):
  - Dex, builder, calc, speed, spread solver, tier list, replica teams, tournaments, news, events, 17 mystery gifts.
  - A **data status page** (cross-checks every 6 hours), a changelog, EN/ES.
  - No ads, no accounts. Solo dev.
- **ChampTeams.gg:**
  - Builder with damage matrices against the meta, tier list, community teams, news.
  - **Battle Mode**: a second-screen helper for the 90-second team preview that suggests picks against the opponent's six.
  - Sign-in.
- **PokeSynergy:**
  - Builder with threat analysis, team checks and partner suggestions; speed; calc; tier list; tournament teams.
  - **A "vs" page for every rival** (Pikalytics, ChampTeams, PokéBase, op.gg, Champions Lab).
  - Google sign-in. Data "updated October 28".
- **PokéBase:**
  - Builder; a **battle sim vs a bot plus online battles**; sandbox; team calc; speed; tournaments; mystery codes; friend finder.
  - Login. A Pro plan ($2.99 / $19.99 seen, "69 left, then $24.99"). Ads.
- **MetaVGC:**
  - Tournament teams with rental codes, team builder, forum.
  - Ads, or $29.99/yr to remove them.
- **op.gg:**
  - In-game ranked usage tiers, leaderboards, replica teams, sample builds, calc, speed, team coverage, gifts, news.
  - A phone app (op.gg's own). "Updated Nov 24, 12:30 AM".
- **Pokémon Zone:**
  - 1,400 tracked tournaments, tier lists, teams, team builder, rental roster, battle pass, ranked seasons.
  - **A Reg M-D page already**, news.
- **Victory Road:**
  - Event calendar, regulations (**mentions M-D**), replica teams, team reports, gifts.
  - Very heavy ads, the slowest site here.
- **Limitless:** the tournament platform itself (standings, team lists). Ads.
- **Calcs:** Showdown calc (Champions mode, no ads), VGC Multi Calc, Game8 calc (ads, last updated Sep 29).
- **VGC Helper:** iOS app, 4.8★ from 573 ratings, free with in-app purchases. Builder, calc, speed, a live "battle assistant".
- **A second "ChampDex" iOS app** (another developer, 5.0★ from 4 ratings). "3,800+ real teams".
- **Official site** (champions.pokemon.com): it showed no text to my browser. **Not checked.**

## The table
Key: Y = has it (seen on the page) · – = not seen on the pages I opened · ? = not checked.

| Feature | **NastyPlot** | Statmie | Pikalytics | ChampDex | ChampTeams | PokeSynergy | PokéBase | MetaVGC | op.gg | Pokémon Zone | Victory Road | VGC Helper app |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Usage / meta | Y | Y (official events day 2 + Showdown) | Y (Limitless 4 wk + Showdown) | Y (Limitless, 104 events) | Y (tier list) | Y | Y (ladder M-8) | teams only | Y (in-game ranked) | Y | – | Y (rankings) |
| **Data age today** | Preview: Nov 9 (15 days); live: daily (not checked) | ~1 day (2026-11-23 16:20) | **live** (events in progress listed) | generated 3:35 PM UTC today; checks every 6 h | ? | **27 days** (Oct 28) | ? ("mid-season") | LAIC Nov 20–22 in | ~16 h (Nov 24 12:30 AM) | ? | LAIC in | ? |
| Sets per Pokémon | Y | Y | Y | Y | ? | Y | Y | ? | Y | Y | – | Y |
| Damage calc | Y | Y | Y | Y | Y (matrix vs meta) | Y | Y | ? | Y | ? | – | Y |
| Speed tiers | Y | Y | Y | Y | Y | Y | Y | ? | Y | ? | – (SV only) | Y |
| Team builder | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | – | Y |
| **Team score** | **Y (Strength Score /100)** | – (per team style: "Hard") | – | ? | – | – ("instead of opaque scores") | ? | ? | – | – | – | – |
| Threat / matchup check | Y | Y (KO counts vs top 40) | – | Y | Y | Y | ? | text | coverage | ? | – | summaries |
| Suggestions to fix a team | Y | – | teammates list | ? | Y | Y | ? | ? | – | ? | – | – |
| Team preview helper vs their six | Y (Battle) | – | – | – | **Y (Battle Mode)** | – | – | – | – | – | – | Y (battle assistant) |
| Import / export | Showdown paste, team codes, share pictures | Showdown paste + copy | Showdown import | paste + team links | paste | import | ? | **rental codes** + paste | replica teams | rental roster | **rental codes** | ? |
| QR codes | – | – | – | – | – | – | – | – | – | – | – | – |
| Winning teams | Y | Y | Y | Y | community | Y | Y | Y | Y | Y | Y | ? |
| Events / calendar | Y (115) | tournaments | live tournaments | Y | – | Y | Y | Y | – | seasons | **Y (best)** | – |
| News / gifts | Y (69 news, 10 gifts) | – | – | Y (17 gifts) | news | – | gift codes | forum | Y | Y | gifts | – |
| Archetypes | Y | Y | ? | Y | templates | ? | – | weather pages | – | ? | – | – |
| Practice / test run | Y (Test run, Team Preview Practice) | – | quizzes | speed quiz (app) | – | – | **battle sim vs bot + online** | – | – | – | – | – |
| Track record (graded predictions) | **Y** | – | – | – | – | – | – | – | – | – | – | – |
| Phone app | web only | web | **iOS $0.99** | **iOS** | web | web | web | web | **op.gg app** | web | web | **iOS** |
| Languages | English | **7** | ? | EN/ES | ? | ? | ? | ? | ? | ? | ? | ? |
| Accounts | none | none (optional backup code) | none (web) | none | sign-in | Google sign-in | login | ? | ? | ? | – | ? |
| Ads | none | none | heavy (~27 ad requests) | none | ~none | ? | yes (16–19) | yes (13–25) | yes | ? | very heavy (29) | none seen |
| Price | free | free (tip jar) | free web / $0.99 app | free | free? | free | Pro plan | $29.99/yr ad-free | free + membership | free | free | free + in-app |
| **Phone speed, main picture shown** (4G, CPU 4×) | **3.2–3.6 s** | 1.9–2.4 s | 0.7–0.9 s | 1.6 s | 0.7 s | 0.7 s | 1.6 s | 0.9–1.0 s | blocked | blocked | 6.7–7.0 s | app |
| Reg M-D mentioned | **no** | – | – | countdown "M-C ends Dec 2" | "About Reg M-B" (old!) | – | – | – | – | **Y (M-D page)** | **Y** | – |

### How the speed row was measured (checked)
- **Setup:** `speed.cjs`, 390 px, the same throttle for everyone (9 Mbit/s, 150 ms round trip, CPU 4× slower), 2 runs each, fresh profile. The number is LCP: when the main picture or text has shown.
- **Our page:**
  - The 5.1 MB built page, served gzipped (1.45 MB on the wire) as Cloudflare would.
  - Result: `FCP 868ms LCP 3188ms` and `FCP 896ms LCP 3636ms`.
  - Uncompressed it was `LCP 6616ms`.
  - Plain words: the first text shows fast, but the main picture comes last of all except Victory Road.

## A. What they have that we DON'T (ranked by how much players care)
1. **Fresher data.**
   - Pikalytics lists events still in progress.
   - ChampDex re-checks every 6 hours and shows a status page.
   - Statmie is 1 day old.
   - We are daily at best; the Preview Sim shows people is 15 days old.
2. **Rental codes** on winning teams: MetaVGC, Victory Road, op.gg, Pokémon Zone. Players copy those straight into the game. We have none (checked: no "rental" in app/src/v2/pages).
3. **A phone app:** Pikalytics, VGC Helper, ChampDex, op.gg. We're web only (no install).
4. **Other languages:** Statmie has 7, ChampDex has Spanish. We have English only.
5. **Reg M-D ready:** Pokémon Zone has an M-D page, Victory Road names it, ChampDex counts down. We say nothing about Dec 2 on the site (checked: no "M-D" text in app/src/v2).
6. **Battling a bot / online:** PokéBase. Our Test run isn't a live battle.
7. **A data status page:** ChampDex ("all scrapers green, cross-checks vs Serebii"). Our How We Calculate explains the method, not today's health.
8. **Small tools:**
   - spread solver / EV→SP converter (ChampDex)
   - quizzes (Pikalytics, ChampDex)
   - community teams and forum (ChampTeams, MetaVGC)
   - friend finder (PokéBase)

## B. What WE have that NONE of them have (honest)
1. **One number for a team: the Strength Score out of 100, with bands.**
   - Nobody else scores a whole team.
   - PokeSynergy says it avoids "opaque scores". Statmie only rates each team style ("Hard").
   - Checked: their pages, and Statmie with a real paste.
2. **Track Record:** our ratings' past predictions, graded against real results. Nobody else shows they were right. Checked: not on any site opened.
3. **Build Me a Team** from real winning teams, then graded. Not seen elsewhere. Their builders start you from a blank six or a copied team.
4. **Compare Teams** (team vs team). op.gg compares single Pokémon only.
5. **Share pictures:** team posters, sheets and This Week cards. Not seen elsewhere.
6. **The whole chain in one place:** score → fixes → Test run → turn-1 plan → Track Record.

Not unique (others have it too):
- Team preview / turn-1 help: ChampTeams Battle Mode, VGC Helper.
- Suggestions: PokeSynergy, ChampTeams.
- Threat checks: Statmie, PokeSynergy, ChampTeams, ChampDex.
- No ads, no accounts: Statmie, ChampDex.
- Gifts and news: ChampDex, op.gg.
- Practice: PokéBase does more.
- Item Clause check: Statmie flagged my duplicate Life Orb too.
- "Strong players" weighting: Statmie's "conversion ×1.22" is the same idea, shown openly.

## C. Where we're behind even though we have it
1. **Speed on phones:** main picture at 3.2–3.6 s, against 0.7–2.4 s for nearly everyone.
   - The page is one 5.1 MB file; every page's code loads up front.
   - Sim tests on iPhone, so he'll feel it.
2. **Data age:** the Preview is 15 days old. Even daily loses to Pikalytics (live) and ChampDex (6 h).
3. **Showing the source on the page:**
   - Statmie writes "93 day 2 teams from LAIC … Data from Limitless" right on the meta page.
   - ChampDex writes "4,149 teams in 104 events, Nov 9 to Nov 23".
   - Our numbers are cited on How We Calculate, one click away (checked: home says "13,631 real tournament teams"; the window and the events aren't on the Meta page itself; not re-checked page by page).
4. **Copying a team into the game:** they give rental codes; we give a Showdown paste and our own team codes.
5. **Statmie's "My team" shows its whole analysis on one scrolling page** right after a paste. Ours is spread over My Team, Battle and Suggestions. Ours goes deeper, but it takes more taps. That last part is my opinion, not measured.

## The edge: moves by Dec 18
1. **Make the first screen fast (medium).**
   - Split the 5 MB page so each page loads its own code, and serve smaller hero art.
   - Target: main picture under 2 s on the 4G test.
   - Why players care: phones, and Google ranks speed (SEO is "super duper important").
2. **Fresher data plus a visible stamp (small to medium).**
   - Run the refresh more than once a day around events, and show "Updated 3 h ago · 104 events, Nov 9–23" on Meta and Home.
   - Why players care: freshness is our stated specialty, and right now we lose on it.
3. **Reg M-D on Dec 2 (small).**
   - Add a banner/page on M-D and a countdown, and have ratings ready the day it starts (the patch map is already written).
   - Why players care: everyone will be searching "Reg M-D" that week.
4. **Rental codes on winning teams (medium).**
   - Where the source has them: Victory Road and VR Pastes are already our sources (not checked whether those pages carry codes).
   - Why players care: one tap into the game.
5. **Put the Strength Score front and centre in the pitch and on share pictures (small).**
   - "Your team: 84, Tournament ready" as the shareable card.
   - Why players care: nobody else has it, and scores spread on social media.
6. **Show the Track Record on Home (small).**
   - "Our ratings called X of Y top cuts."
   - Why players care: proof, which no rival offers.
7. **One-page result after a paste (medium).**
   - Score, the top 3 fixes, the worst 3 threats and the turn-1 plan, on one screen, then the deep pages.
   - Why players care: it matches Statmie's speed to an answer while keeping our depth.
8. **Spanish next (large).**
   - Statmie already serves ES/PT/JA. Spanish and Portuguese players are a big share of Champions events (LAIC São Paulo had 652 players, per Statmie).
   - Why players care: reach.
9. **Make it installable (small).**
   - A home-screen icon with offline caching for the calc and speed tiers.
   - Why players care: it closes most of the "app" gap without an app store.

**Lead the announcement with:**
1. "Only NastyPlot gives your whole team one score out of 100, and tells you how to raise it."
2. "Only NastyPlot shows its track record: our ratings' calls, graded against real tournaments."
3. "No ads, no account, nothing to download: paste your six and get a score, fixes and a turn-1 plan in one place."
   - Careful: Statmie and ChampDex are also ad-free with no accounts, so lead with "in one place", not "only".

## Worrying
- **They read the same sources we do, and some of them are our sources.**
  - Statmie: Limitless, Smogon, Showdown (MIT), **RK9 for its calendar** (we don't touch RK9, by our rule).
  - ChampDex: Limitless, Serebii, PokéAPI.
  - **Pikalytics and op.gg are themselves on our sources list.** If either blocks tools, we lose a source.
  - Credits: Statmie, ChampDex and ChampTeams all credit sources on the page ("Data from Limitless VGC", "Damage calcs by @smogon/calc").
- **Kids' data:**
  - ChampDex runs Google Analytics but says it collects no personal info from under-13s.
  - PokeSynergy and ChampTeams use sign-in; PokeSynergy's is Google.
  - PokéBase has login and a paid Pro plan.
  - Statmie: no cookies, counts visits without cookies, an optional cloud backup tied to a secret code.
  - We're as clean as the best (no accounts, no names). Worth saying out loud for parents.
- **Copying:**
  - PokeSynergy writes a "vs" page for each rival as they appear. Expect a "PokeSynergy vs NastyPlot" page within weeks of the announcement.
  - ChampDex ships every couple of weeks ("Just shipped 2w ago").
  - Statmie's tournament "conversion" is close to our player-skill idea already.
  - Nothing suggests anyone has seen NastyPlot (not checked beyond these pages).
- **Statmie looks half-translated.** The English page shows Spanish bits ("Normativas anteriores", "Hay dos objetos iguales"). It still covers 7 languages.

## Not checked
- The official site's content and Reddit threads.
- Pokémon Zone's and op.gg's pages in my own browser (they blocked it).
- App features beyond the App Store text.
- Data age where marked "?".
- Whether MetaVGC or PokéBase score teams on pages behind login.
- WebKit.
- NastyPlot live-site freshness, and the Preview artifact itself.

## Files
- `pictures/`: 55 labelled screenshots.
  - every site at 1440 and 390
  - Statmie's full team analysis
  - 4 App Store pages
  - NastyPlot's Home for comparison
- `tools/`:
  - `crawl.cjs` (open, time, screenshot, save text)
  - `speed.cjs` (the throttled phone test)
  - `gzserve.cjs`
  - `st2.cjs` (Statmie paste test)
  - `team.txt` (the test team)
  - `results-*.json` (all timings)
- `text/`: the visible text of every page opened (the evidence for the table).

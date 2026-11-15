# Naming uniformity audit (Nov 14, 10:35 PM)

Read-only helper audit. Sim asked for one name per action across the whole rebuild ("having different names for the same action is just confusing").
How it was checked: grep of every button/link label in app/src/v2/pages/*.js and shell.js, plus all 15 routes rendered at 1280 wide with the sample team.
Caveat: the built page it rendered was older than the source, so where they differ the source wins.

Status key: FIX = follows the Word list or an existing Sim answer, fixed directly. ASK = a new name, goes to Sim first.

## Same action, different labels
| # | Action | Labels found | Proposal | Status |
|---|---|---|---|---|
| 1 | Set a team as your Battle opponent (V2.btSetOpp) | Practice Against, Practice in Battle mode, Prep vs the Champion; 4 different toasts | "Set as Opponent", toast "Opponent set: X". Reason: it fills Their Six, it doesn't open the Practice tool | ASK |
| 2 | The Battle tool's name | Battle (nav), Battle A Team (tool bar), Battle Mode (Home tile), Battle mode, Plan a Match | One name for the tool | ASK |
| 3 | Load a whole team | Load Team, Use This Team (compare.js:61), Open This Team (team.js:304); two different replace confirmations | "Load Team" (Sim Q3 A) and one confirmation | FIX |
| 4 | Saved teams | Saved Teams / Switch Team / Open a Saved Team; Save Team / Save This Team; Update Team / Update Saved Team | Saved Teams, Save Team, Update Team | FIX |
| 5 | Go to Build | Build a Team, Build Me a Team, Build me a team, Build Your Own | "Build Me a Team" (the Build page's own name) | FIX |
| 6 | Your logged games | Your Battles, Your Games, Your Record, Battle Log; Log a Game / Log This Game; Battle deleted / Game removed | Your Games, Log a Game, Game removed | ASK (section name) |
| 7 | Info sheet | Info Sheet, Info Sheet ›, Open info sheet; aria "open its info" vs "open its info sheet" | "Info Sheet", aria "open its info sheet" | FIX |
| 8 | Build around a Pokémon | Build Around It / Build around it | "Build Around It" | FIX |
| 9 | Add to team | Add to My Team, Add X to My Team, Add to team (+ old-site buttons on My Team); Swap Into / Swap into | "Add to My Team", "Swap Into My Team" | FIX |
| 10 | Showdown text | Copy for Showdown (13 places) vs Export / Export to Showdown; Import a Team / Import from Showdown / Import | "Import a Team"; check whether Export differs from Copy (unsure) | FIX after check |
| 11 | Share | Share, Share as Image, Save Image, Team Poster, Share Your Team | One name if they open the same sheet (unsure) | check, then ASK |
| 12 | Show fewer | Show fewer / Show less | "Show fewer" | FIX |
| 13 | Change a six | Change, Change six, Change Their Six | Change Their Six / Change Your Six | FIX after check |

## Same idea, different names
| # | Idea | Found | Status |
|---|---|---|---|
| 14 | Matchups (Word list) | Threat preparation, Scouting report, "readiness for the top threats" in the ? bubble, "N/N handled" | FIX to Matchups |
| 15 | Team Checks (Word list) | ? reads "What is Checklist?"; Team Checks vs Team checks | FIX |
| 16 | points (Word list) | "N pts", "pts = stat points" | FIX |
| 17 | Strength Score (Word list) | "About the same grade as now" (sugs.js:33) | FIX |
| 18 | My Team | "My team" lowercase in 5 places; Your Team vs Your team | FIX |
| 19 | Winning Teams | Recent Winners, Copy a Top Team, Teams (Home tile), top teams | ASK (Recent Winners on Build is a section of winners, maybe fine) |
| 20 | Tournaments vs Events | hub tab Tournaments, sub-tab Events, tile Events | ASK |
| 21 | Home tiles vs tabs | Ratings / Rating, Popular Sets / Sets, Teams / Winning Teams | ASK |
| 22 | Top N | Speed headline "top 20" vs rows "top 30 threats" | check the code, then FIX |
| 23 | Small | Hidden Gems / Hidden gems; "How we calculate →" vs "How We Calculate"; arrows → vs › | FIX (Title Case, ›) |
| 24 | Not found | no visible Elo, win edge, Gauntlet | OK |

## Capitals and numbers
- Buttons and links not in Title Case: Open info sheet, Build around it, Add to team, Practice in Battle mode, Go to My team, Change six, Use my team,
  Practice with a real team, Use NastyPlot's pick, Start the pick again, Skip this team, Next team, Not now, Report a mistake, Reveal what strong players chose,
  Show fewer, Show less, Swap A and B, Pick your four first ›, All cores ›, All ratings ›, All 113 events ›, See all 275 ›, Prep vs the Champion. FIX to Title Case.
- "Battle A Team" capitalises "A" unlike Build Me a Team / Log a Game. FIX with #2.
- Section headings mix Title Case and sentence case. ASK which (recommend Title Case for section headings; the big full-stop headlines stay as they are).
- Numbers: "at least 4 Pokémon" vs "at least four"; "six" vs "6". Proposal: words in sentences, digits only in counters (2/4, 0 of 4). FIX.

## Rule added to the quality gate
Every section's quality pass now includes a label check: every button for the same action has the same words, Title Case, and Word-list names (RULES 00q).

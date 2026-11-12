# Group A (Team) on the new build: every FAIL, classified (Nov 12)

Date: 2026-11-12. Build: claude/design6 at 599de2c (`node app/build.mjs --v2`, normal data, copied to scratchpad v2-classify.html).
Command: `PAGE=<copy of app/dist/v2.html> ADAPTER=v2 node app/test/behaviour/run.mjs A-team`

Run conditions (measured): the run started 12:13:25 UTC and loaded the test file as committed at 51759e5 (the runner imports it at
start; an uncommitted edit to A-team.mjs, the NEW-wording switch for SUG-10/SUG-11/MU-02, landed at 12:14:57, after the start).
Another session was building and running behaviour tests on the same machine at the same time, so the 771 s time is slower than
usual; no FAIL looked timing-related. Compared with the Nov 12 parked-branch run (test-runs/nov11-night/behaviour-A-team-v2-parked-ipad.log,
same 57/75/6/4/2): the same 75 FAIL IDs with the same messages, and the same known / fixed? / skipped tests (the parked log printed HOME-10b twice; this run once).

Summary line (verbatim): `behaviour: 57 pass, 75 FAIL, 6 known bugs, 4 fixed?, 2 skipped; 771s  (adapter v2)`

Counts of the 75 FAIL tests: **page not built yet** 50, **real failure** 25.

Categories:
- **page not built yet**: the test needs a page, sheet or part the new build doesn't have yet (Home, Battle, Popular Sets, How We
  Calculate, Winning Teams, Build, or a My Team part still on docs/rebuild/r4-team-gaps.md's to-build list). These should turn
  into passes or real failures only when that part is built.
- **real failure**: the part exists but differs from what the test expects. Three kinds, named in each reason:
  intended change or wording the test hasn't caught up with; the test reading today's internal ids; the test adapter being out of
  date (the build has the feature, the adapter doesn't drive it). None of them is a confirmed bug in the build itself.

How to use this for "nothing else changed": the next run should give the same FAIL IDs with the same messages; any new ID, or a
changed message, is the thing to look at.

## The 75 FAIL tests

| ID | Title (short) | Category | Reason | Failure message (shortened) |
|---|---|---|---|---|
| HOME-01 | Home leads with the tagline "Sharply raise your win rate." | page not built yet | Home page not in the new build. | not in v2 yet: Home page |
| HOME-02 | Most used #1 card opens that Pokémon's info sheet | page not built yet | Home page. | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-03 | Runner-up strips (#2, #3) open their info sheets | page not built yet | Home page. | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-04 | Data line names the month, the source and "Data as of <date… | page not built yet | Home page. | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-05 | This week in the ratings: chips with arrow + number open th… | page not built yet | Home page. | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-06 | Start buttons: "Score my team" first with a team, "Build me… | page not built yet | Home page. | not in v2 yet: Home page |
| HOME-07 | "Import from Showdown" opens My Team with the Import box re… | page not built yet | Home page ("Import from Showdown" button lives there). | nothing to tap: text Import from Showdown |
| HOME-08 | All 11 Tools: each card opens the page named on it | page not built yet | Home page (All 11 Tools). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-09 | Champion's six: load needs a second tap, loads with Undo; C… | page not built yet | Home page (Champion's six). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-10 | vs panel: your six, a lead/back/bench plan, Prep vs the Cha… | page not built yet | Home page (vs panel). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-11 | Sample-team note on Home and My Team; "Import a team" opens… | page not built yet | Home page (sample-team note); My Team's sample note not built either (see X-02). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-12 | Welcome card on first visit; "Got it" hides it for good | page not built yet | Home page (welcome card). | not in v2 yet: Home page (welcome card) |
| HOME-13 | What's New fold after an update; × dismisses it for good; n… | page not built yet | Home page (What's New fold). | no What's New fold after an update |
| HOME-14 | Top of the Meta: 10 rated rows, Hidden gems switch changes … | page not built yet | Home page (Top of the Meta). | page.evaluate: Error: not in v2 yet: page "Home (no hash)" |
| HOME-15 | More on Home fold: pairs, what changed, cores, "Log a game"… | page not built yet | Home page (More on Home fold). | no fold titled More on Home (not in v2 yet) |
| HOME-16 | Weather chip "Sun team" on Home's team card | page not built yet | Home page (team card weather chip). | no "Sun team" weather chip |
| TEAM-04 | "Why this score?" opens the breakdown; its parts add up to … | page not built yet | Breakdown works and adds up; fails only at its last step, the link to How We Calculate, a page not built yet. | link did not open How we calculate |
| TEAM-07 | Phone jump bar: Suggestions \| Matchups \| How it plays \| Set… | real failure | Intended change (decided Nov 11, r4-team-gaps.md): new jump bar Set \| Matchups \| Suggestions \| Team Checks at every width; test not updated. | jump bar: Set\|Matchups\|Suggestions\|Team Checks |
| TEAM-08 | Your Six: six tiles lead/back/bench; tapping a tile shows i… | real failure | Intended change (decided Nov 11): no "Your Six" heading, picked set always shows, no tap-again-to-hide; test not updated. | page doesn't show Your Six |
| TEAM-11 | Set as lead: plan says "your pick" (saved to the account); … | page not built yet | Set as lead, toast, plan line and account save pass; fails at "Home follows" (Home page not built). | not in v2 yet: Home page |
| TEAM-13 | Team actions row: Save/Update label, ⋯ menu; empty team kee… | page not built yet | Export to Showdown text panel not in the new build (only Copy for Showdown; r4 says "decide if still needed"). Note: later steps would also fail because the adapter always names the save button "Save team", never "Update saved team" (adapter out of date). | no action Export in Save team\|Share\|Saved Teams\|Team Sheet\|Copy for Showdown\|Import\|Compare with…\|My Box\|Clea… |
| TEAM-15 | Matchups summary: Favoured/Even/Unfavoured add to 30 and ma… | page not built yet | Header Matchups summary ("N Favoured / N Even / N Unfavoured … in real games" + "Damage calc: covers N of 30") not built; still on the r4 to-build list. | no "N Favoured / N Even / N Unfavoured" summary |
| TEAM-19 | Empty team: Darkrai, invitation, "Add your first Pokémon" o… | real failure | Intended change (Sim, Nov 11): empty My Team shows today's underdog and new copy ("Six spots, all yours."), no Darkrai, no six "+ Add" tiles; test still expects the old copy. | page doesn't show Add your six and NastyPlot scouts the top 30 threats for you. |
| SUG-08 | "Nothing to fix" card with Battle and Sets on a complete te… | page not built yet | "Nothing to fix" card passes; fails at its Battle button (Battle page not built). | Battle button did not open Battle |
| PLAY-01 | Game Plan fold: rows with Covered/Missing/Partly; Speed con… | page not built yet | Game Plan fold not built (r4 to-build list). | no fold titled Game Plan (not in v2 yet) |
| PLAY-02 | Types fold: Offense/Defense switch, type grid, Mega pick wi… | page not built yet | Types fold not built (r4 to-build list). | no fold titled Types (not in v2 yet) |
| SETS-01 | Open Team Sheet fold: one card per Pokémon; tapping opens i… | page not built yet | Open Team Sheet fold not built (r4 to-build list). | no fold titled Open Team Sheet (not in v2 yet) |
| SETS-02 | How Scoring Works fold explains Ready for the top threats | page not built yet | How Scoring Works fold not built (r4 to-build list). | no fold titled How Scoring Works (not in v2 yet) |
| EDIT-01 | Edit panel opens titled "Edit <name>"; Done, Escape and the… | real failure | Test reads today's internal #chEdit element directly, which the new build doesn't have; the Edit Set sheet itself exists (test side, not a build bug). | page.evaluate: TypeError: Cannot read properties of null (reading 'contains') |
| EDIT-01b | Closing the edit panel puts focus back on "Edit set" | real failure | Wording only: focus returns to "Edit Set" (Title Case rule); test wants "Edit set". | focus is on "Edit Set" |
| EDIT-03 | Slot header: Lock → "Locked" (tile shows locked), types, Me… | page not built yet | Edit Set slot header (types, tier, usage, tile lock state) not built (r4 to-build list). | slot header doesn't show /Fire Flying/ |
| EDIT-05 | Stat points: live total, over-66 warning, Save stat points;… | real failure | Wording only: tag reads "Your pick", test wants "Yours" (total, warning and "Stat points saved" pass first). | page doesn't show /Yours/ |
| EDIT-06 | Ability picker: a rarer ability names the common one; "Use … | real failure | Wording only: reset toast "Back to the most-used Ability" vs test /most-used ability/ (capital A). | no reset toast |
| EDIT-08 | Moves: change move 4 → toast mentions Offense; "Reset to po… | real failure | Intended change (decided Nov 11): move toast says how the Strength Score moved, not "Offense"; test not updated. | no "<move> replaces … Offense" toast |
| EDIT-09 | "Full popular sets ›" closes the panel and opens Popular se… | page not built yet | "Full popular sets ›" needs the Popular Sets page, not built. | nothing to tap: text Full popular sets › |
| EDIT-10 | Weak / Resists fold shows resistances and the ability text | page not built yet | Weak / Resists fold in Edit Set not built (r4 to-build list). | no fold titled Weak (not in v2 yet) |
| EDIT-12 | "Save team" opens "Edit team" with the save box and all six… | page not built yet | "Edit team" panel with save box and six editors not built; Save is a small separate sheet (r4 to-build list). | panel not "Edit team" |
| IO-01 | Import a team: legal Pokémon load, skipped ones reported, U… | real failure | Wording only: import sheet is headed "Paste a Team" (aria-label "Import a team"); test reads the text for "Import a team". | page doesn't show /Import a team/ |
| IO-02 | Export to Showdown: Showdown text with item, Ability, Level… | page not built yet | Export to Showdown text panel not in the new build (adapter throws "not in v2 yet"). | not in v2 yet: Export to Showdown panel (only Copy for Showdown) |
| IO-03 | Copy for Showdown on My Team: toast and six Showdown blocks… | real failure | Intended change: Copy for Showdown moved into My Team's More menu (Sim, Nov 11), so the test finds no visible button; its toast also reads "Team copied for Showdown", not the test's words. | nothing to tap: text Copy for Showdown |
| IO-04 | Team Sheet "Copy as text" copies the team | page not built yet | Team Sheet "Copy as text" not built (the sheet offers Copy for Showdown instead; r4 to-build list). | nothing to tap: text Copy as text |
| SHARE-01 | Share box: Team Card / Poster / Sheet switch, Light / Dark … | real failure | Test's last step calls today's internal $('shareBtn') for the empty team; the new build has no Share button on an empty team (test side; whether the empty-team message is wanted is open). | page.evaluate: TypeError: Cannot read properties of null (reading 'click') |
| SHARE-02 | Team Card image is 1200×675 | real failure | Wording only: share sheet title "Share Your Team", test wants "Share card" (image size passes). | title: Share Your Team |
| SHARE-03 | Team Poster image is 1080×1350 | real failure | Wording only: share sheet title "Share Your Team", test wants a title with "poster" (image size passes). | title: Share Your Team |
| SHARE-04 | Team Sheet page "Share as image" opens the box titled "Team… | page not built yet | Team Sheet "Share as image" not built (r4 to-build list). | nothing to tap: text Share as image |
| SHARE-06 | Team link: "Copy team link" copies #team=…; opening it offe… | real failure | Wording only: shared-link bar button reads "Open This Team", test wants "Load it". | nothing to tap: text /^Load it$/ |
| LOG-01 | Your games card on a full six: "None logged yet." and "Log … | real failure | Wording only: card reads "Your Games … Log a Game", test wants "Your games: this six" and "Log a game". | card: Your Games None logged yet Log a Game |
| LOG-02 | Log a game: two leads, their six from Battle mode, Win → "1… | page not built yet | Log form lacks "Paste its log" (replay link, comes with the Battle page). | log form doesn't show /Paste its log/ |
| LOG-05 | Logged games show on the matching saved team and in Compare | real failure | Saved card shows "Your games 1–0" but not "… with this six" (wording); the Compare step would then hit an adapter gap (adapter maps only Open/Copy/Rename/Delete, though the build has Compare). | Sun six card doesn't show /Your games 1–0 with this six/ |
| SHEET-01 | Team Sheet head: "<team name>: Reg M-C doubles, level 50", … | page not built yet | Team Sheet head line ("<team>: Reg M-C doubles, level 50") and "← My Team" back link not built (r4 to-build list). | page doesn't show /Sun Tailwind \(sample\): Reg M.C doubles, level 50 Team Sheet/ |
| SHEET-02 | Team Sheet actions and key line | page not built yet | Team Sheet "Share as image" / "Copy as text" / key line wording not built (r4 to-build list). | Team Sheet doesn't show Share as image |
| SHEET-03 | Six set cards (item, ability, moves, nature, stats); tappin… | page not built yet | Team Sheet cards don't open My Team's edit panel when tapped (r4 to-build list). | My Team did not open |
| SHEET-04 | Team Sheet with no team: "No team yet…" and "Open My Team" | page not built yet | Team Sheet with an empty team not built (button hidden and the sheet returns nothing with no team). | not in v2 yet: Team Sheet with this team (My Team shows no Team Sheet button) |
| SAVED-01 | Save team: name box, "Save as new" → toast "Saved "Test"", … | real failure | Wording: save sheet says "Save Team / Give this six a name.", not "Save this doubles team". Later step also blocked by the adapter always calling the save button "Save team" (build shows "Update Saved Team"). | page doesn't show /Save this doubles team/i |
| SAVED-01b | Save panel: empty name saves as "Untitled team"; 10 saved t… | real failure | Test reads today's internal #saveNew button; the new build does disable its save button at 10 (test side). | "Save as new" not disabled at 10 |
| SAVED-02 | Saved Teams head: count (N/10) and where it's stored (accou… | page not built yet | Saved Teams storage line ("Saved to your Claude account…" / "this browser only") and "← My Team" not built (r4 to-build list). | page doesn't show /Up to 10 teams\. Saved to your Claude account and kept in step across your devices\./ |
| SAVED-03 | Sort Recent \| Name \| Readiness; "Name" is alphabetical | real failure | Intended wording (word list): sort reads Newest \| Name \| Matchups, test wants Recent \| Name \| Readiness. | Recent not default |
| SAVED-04 | Saved team card: name, six tiles, Strength Score badge or "… | real failure | Wording only: partial card reads "2 of 6 picked", test wants "2/6 Pokémon". | partial card doesn't show /2\/6 Pokémon/ |
| SAVED-07 | ⋯ → Team poster opens the share box with that team's poster | real failure | Adapter out of date: the build has "Team Poster" on each saved card, but the adapter only maps Open/Copy/Rename/Delete and throws "not in v2 yet". Real behaviour not tested. | not in v2 yet: saved team action Team poster |
| SAVED-08 | Compare on two saved teams opens Compare with both | real failure | Adapter out of date: the build has Compare on each saved card, but the adapter throws "not in v2 yet". Real behaviour not tested. | not in v2 yet: saved team action Compare |
| SAVED-09 | No saved teams: Darkrai, "No saved teams yet…", "Open My te… | real failure | Empty Saved Teams wording differs ("No saved teams yet. Tap Save Team on My Team…"); Darkrai is cut by decision and the "Build me a team" step needs the Build page, so it can't pass yet either way. | page doesn't show /No saved teams yet\. Open My team and tap Save team, or let NastyPlot build six for you\./ |
| CMP-03 | Team picker: My Team (greyed when already A), saved teams, … | page not built yet | Picker lacks "Any other tournament team: tap Compare on its card in Winning Teams" (waits for the Winning Teams page). | picker doesn't show /Any other tournament team: tap Compare on its card in Winning [Tt]eams/ |
| PKMN-01 | Info sheet opens from Home; ✕ and Escape close it, focus re… | page not built yet | Starts from a Home tile (Home not built); the info sheet itself exists. | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-02 | Hero: rating numeral, "<letter> tier, #N of M with results"… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-03 | Add to team fills the first empty slot ("On your team" afte… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-04 | Tabs Info \| Meta \| Rating: last tab remembered; arrow keys … | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-05 | Info tab: usual set, base stats, abilities with "Most used"… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-06 | Meta tab: typical set, moves and items with %, "Brought wit… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| PKMN-07 | Rating tab: "Why it rates N", four bars, What the Data Says… | page not built yet | Starts from Home (not built). | nothing to tap: Pokémon Kingambit (an element that opens its info sheet) |
| X-02 | First visit: sample six "Sun Tailwind (sample)", saved and … | page not built yet | First-visit sample note ("This is a sample team…") not built on My Team (r4 to-build list). | page doesn't show This is a sample team |
| X-03 | Toasts: Undo puts the team back ("Change undone"); plain co… | real failure | Intended change (Sim, Nov 11): toasts carry no Darkrai; Undo and "Change undone" pass first. Test not updated. | no Darkrai on the confirmation |
| X-07 | Folds and views stay as left after reload (Game Plan, Types… | page not built yet | Game Plan / Types folds not built. | no fold titled Game Plan (not in v2 yet) |
| X-09 | A saved team name keeps its own casing ("rain test") | real failure | Name casing passes; fails on the "Your Six" heading, removed on purpose (as TEAM-08). Test not updated. | page doesn't show Your Six |
| X-12 | Long paragraphs show the first sentence and "More" | page not built yet | How Scoring Works fold not built. | no fold titled How Scoring Works (not in v2 yet) |
| X-13 | Links out of this scope still work: replay "Paste its log" … | page not built yet | "Paste its log" (Battle) and How We Calculate not built. | nothing to tap: text Paste its log |

## Known (6)
- HOME-05b  This week chip's rating matches the info sheet it opens  -> not in v2 yet: Home page (This week in the ratings)
- MU-05c  Threat sheet "Best fix" never offers a change that doesn't raise the score  -> nothing to tap: #main [data-muthr="Archaludon"]
- SAVED-02b  Saved Teams shows how many of the 10 places are used ("2/10")  -> Saved Teams doesn't show /2\/10/
- CMP-04b  Compare lists Speed control as a note, not a counted team check  -> Speed control shown as a team check row
- HOME-11b  Sample note "Build your own" on My Team opens Build  -> nothing to tap: text /^Build your own$/
- HOME-10b  Home empty tile "Add a Pokémon to slot N" opens the add box for that slot  -> nothing to tap: label Add a Pokémon to slot 3

## Fixed? (4): marked known for today's site, pass on the new build
- TEAM-13b  Empty team: the ⋯ menu hides Export and Clear team (only Import stays)  -> marked known (inventory says Export and Clear team are hidden with an empty team; today they still show in the ⋯ menu (inventory or code is wrong: Sim to decide)) but passed: remove the mark
- SUG-03b  Swap my Mega? choice is kept after reload (like Megas on team)  -> marked known (inventory #22: "Swap my Mega?" is a hidden checkbox and resets on reload while "Megas on team" is saved) but passed: remove the mark
- MU-05b  Threat sheet ring shows the Strength Score number and band, not the old letter  -> marked known (inventory #15: the threat sheet ring still shows the old letter ("B 82.5") instead of the Strength Score and band word) but passed: remove the mark
- EDIT-07b  Item toast uses today's words (matchups), not the old "ready for N%" readiness  -> marked known (inventory #20: item toast still says "ready for 85% → 87% of the top threats") but passed: remove the mark

## Skipped (2)
- TEAM-18  Weather backdrop behind a sun team's header  (decorative animation on the old header, mostly covered by the arena layout (inventory unsure it shows); needs a visual check, not a behaviour test)
- X-01b  A change on another device arrives live ("Updated from your other device"), waiting while you type  (needs two signed-in devices sharing a real account; the kit's fake account has no live updates from another device)

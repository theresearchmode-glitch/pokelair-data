# Feature audit: group A (Team), My Team and its sheets, against the new site

FOUND 85 · PARTLY 27 · MISSING 3 · UNSURE 1 (116 IDs: every ID in docs/rebuild/inventory/A-team.md except HOME-*)

Look-only audit, Nov 13. Method: read the inventory entry, then the new site's code (app/src/v2/pages/*.js, shell.js, bridge.js,
css) and, where the new site calls it, the shared logic listed in app/parts-v2.json (app/src/app/). Nothing was run or clicked;
every verdict is from reading code. Line numbers are in the file named. Approved wording changes (Title Case, Strength Score,
word list) and features moved into a sheet are not counted as missing. Darkrai / Shady Paw pictures are cut by Sim (Nov 11), so
their absence is not counted.

Notes that apply to several rows:
- Today's 34-events.js is not in the new build; the new pages have their own handlers. Shared handlers that are still used:
  `[data-undobar]` (app/06-helpers.js:147), `[data-protfix]` (app/36-lanes.js:70), `[data-copylink]` (app/45-team-links.js:55),
  `#toastUndo` (app/06-helpers.js:149, through bridge.js:12).
- Links to pages that are not rebuilt yet (`#method`, `#sets`, `#meta` Popular Sets, Track Record) have no `V2.pages` entry; in a
  real build V2.route() (shell.js) sends them to Home; in the Preview build pages/coming.js shows "coming next" for home/build/
  battle/meta only. Rows that depend on these are marked where it matters.

| ID | Short name | Verdict | Evidence / what's missing |
|---|---|---|---|
| TEAM-01 | Header: kicker and team name | PARTLY | team.js:361-364: eyebrow "My Team · N of 6 · <weather word>" (wxKeyOf/wxName), h1 = saved name or teamTitleFor; empty: "My Team · 0 of 6 · No team yet" (team.js:236). Missing: "Long names get a smaller size": .tm-name has one size per width (css/pages.css:457-459), long names wrap (overflow-wrap) instead. |
| TEAM-02 | Removed-Pokémon note | FOUND | team.js:365 `goneNote(S.slots)` as a status line; Saved Teams cards team.js:110. |
| TEAM-03 | Strength Score block | PARTLY | team.js:353-365: number + band word (+ " so far"), win line "Teams scoring like this win about N%…", rank line, "Few real games back this mix yet…", "Why This Score?". The ring is a big numeral by the approved design. Missing: the pop / count-up when the score changes and the sparkle when it rises (no animation on .np-score, css/components.css:62-66). |
| TEAM-04 | "Why this score?" breakdown | FOUND | Moved to a sheet: team.js:308-314 (parts that add up, CH.WHY_TEST, "How sure", band legend CH.LETTERS, "How the Strength Score works" link), opened team.js:326. The link goes to #method, which is not rebuilt yet (falls to Home). |
| TEAM-05 | Switch team | FOUND | team.js:324-326 sheet "Switch Team" (up to 8, mini sprites + name), button with "N saved" team.js:365; opening = Saved Teams Open with Undo toast (team.js:125). |
| TEAM-06 | "Team Sheet" button | FOUND | Jump bar button team.js:372 and More menu team.js:339 (`data-v2sheetopen` → V2.openTeamSheet, team.js:51). |
| TEAM-07 | Jump bar | PARTLY | team.js:372 "Set / Matchups / Suggestions / Team Checks", scrolls (team.js:390), marks the section read (V2.jumpSync team.js:397-404). Different: the old targets "How it plays" and "Sets" no longer exist as parts; tapping does not move focus to the section heading (only scrollIntoView). |
| TEAM-08 | Your Six stage (tiles) | FOUND | six.js:6-25: tiles in Lead / Back / Bench pairs, Mega tag, empty "+ Add a Pokémon" tiles (six.js:13), tap picks the set shown (team.js:389). Changed by design: one Pokémon is always picked (no tap-again-to-hide, no "Tap a Pokémon" hint). |
| TEAM-09 | Lock and Remove | FOUND | Moved off the art into the strip under the six: six.js:21-22 (Remove, Lock with "suggestions never swap out a locked Pokémon"), handlers six.js:43-45 (toggleLock; clearSlot keeps Undo, toast "Removed X" with Undo). Locked padlock on the tile six.js:10. |
| TEAM-10 | Set card | FOUND | six.js:29-36: name, types, rating "N S tier rating", Item, Ability, Nature and Stat points with yours / most run (natInfo), moves in type colours, Edit Set, Info Sheet ›. Place in the plan is in the strip (six.js:19-20); Set as Lead in the strip (six.js:23). No avatar (by design). |
| TEAM-11 | Set as lead / Use NastyPlot's pick | FOUND | six.js:23 "Set as Lead", six.js:16 "Use NastyPlot's pick", handler six.js:39-40 (setLeadPick, leadMsg toast). |
| TEAM-12 | Game plan line | FOUND | six.js:15-16 "Game Plan vs …: lead A + B, back C + D, bench E + F" from teamLineup / PLAN_VS. |
| TEAM-13 | Team actions row | FOUND | team.js:370 Save Team / Update Saved Team ("Saved ✓" when unchanged), Share, Saved Teams (count), More; More menu team.js:336-342: Team Sheet, Copy for Showdown, Export, Import, Compare, My Box, Clear Team (team-only items hidden when empty). |
| TEAM-14 | Clear team | FOUND | More menu team.js:342, V2.clearTeam team.js:298 (clearTeam keeps Undo incl. open saved team, app/31-set-edits.js:64; toast "Team cleared" with Undo); menu closes team.js:345. |
| TEAM-15 | Matchups summary | FOUND | Moved into the Matchups section head: matchups.js:20-23 (Favoured / Even match / Unfavoured counts, split bar, "Damage calc: …" counts). |
| TEAM-16 | Legal and team-checks badge | PARTLY | Legal mark with the rules tooltip: team.js:363 (jump bar and hero). Missing: the "Team checks 4/4" badge with 4 pips; the count now shows only as "All 4 basics pass" / "N more pass" (team.js:329-333) and in the threat sheet (matchups.js:91). `ckCard` in sugs.js:136-137 is built but never used in the output. |
| TEAM-17 | Your games (this six) | FOUND | See LOG rows (record.js:5-11). |
| TEAM-18 | Weather backdrop on the header | MISSING | Searched v2 for wxLayer, weather backdrop, "wx-" / animated weather classes: only wxName for the eyebrow word (team.js:361). (The inventory itself was unsure how visible it still was.) |
| TEAM-19 | Empty team state | PARTLY | team.js:235-240: "Six spots, all yours.", Build Me a Team, Add a Pokémon, Import a Team, Open a saved team, today's underdog (replaces Darkrai, approved). Different: no six "+ Add a Pokémon" tiles, and "Add a Pokémon" opens site Search (`data-v2search`, shell.js:98), not the add box on slot 1 (adding then goes through the info sheet's "Add to My Team"). |
| TEAM-20 | Partial team (1-5) | FOUND | " so far" (team.js:354), "N of 6 picked" (team.js:355), empty tiles (six.js:13), "+ X" add suggestions (sugs.js:29), Your Games only at 6 (record.js:5), Save/Share/Compare available. |
| SUG-01 | Suggest from | FOUND | sugs.js:7 slider My Box / Box + Catch / Whole Roster; sugs.js:15 setPool + its toast. |
| SUG-02 | Megas on team | FOUND | sugs.js:8 slider 0/1/2; sugs.js:16 setMegaGoal + toast. |
| SUG-03 | Swap my Mega? | FOUND | sugs.js:9, 17 (setSwapMega + toast); now also kept in this browser (sugs.js:10-11, np2.swapMega), which fixes inventory bug #22. |
| SUG-04 | Suggestion cards | FOUND | sugs.js:30-37 card (out → in / +, score change "+8 83 → 91" with band, kind line LANE.lineParts, Apply primary on first, Why? N reasons); sugs.js:61-62 first shown, "Show N more" then "See All Suggestions ›" (sheet, sugs.js:90-99); stale list faded and inert while working (sugs.js:45-47). By A3 (approved): a best swap that does not raise the score gets no card (sugs.js:55-57). |
| SUG-05 | Apply a suggestion | FOUND | sugs.js:106-108 applyPlan (keepUndo, swapped-out not offered back app/29-fix-planner.js:309-311), 450 ms double-tap guard, Undo bar or toast (sugs.js:79-81). |
| SUG-06 | Undo bar | FOUND | sugs.js:82 bar "Applied <label> Undo"; shared handler app/06-helpers.js:147. |
| SUG-07 | Protect fix card | FOUND | sugs.js:67-68 (LANE.protFix / protWords, "Add Protect"); shared handler app/36-lanes.js:70. |
| SUG-08 | "Nothing to fix" card | PARTLY | sugs.js:71-73 text from LANE.NONE with links Battle and Sets. The "Sets" link is `#sets`, which has no page on the new site (no V2.pages.sets), so it lands on Home. |
| SUG-09 | Side-grade / no-gain messages | FOUND | sugs.js:56, 58-60 (all three messages) and gap note sugs.js:51. |
| SUG-10 | Problems and Team Checks fold | FOUND | Renamed "Things to Know" in the Team Checks section: sugs.js:114-148 (problem rows, Quick add picks with tags / why / threat line / button / fit, "Show N more" / "Show less", verdict block, regNote, Types); first problem opens on opening (sugs.js:152); remembered (cc2.chf.rfix); Quick add sugs.js:157-158. Team checks list with winner rates moved up to team.js:382-383 (A2). |
| SUG-11 | "?" explainer tips | PARTLY | sugs.js:161-172 (bubble, How we calculate link, outside tap / Escape / scroll close). Used only for 'readiness' and 'checklist' (team.js:382-383, sugs.js:140); the rating, bars, spread, tiers and "how to read our numbers" tips have no "?" on the new site (grep V2.tip). |
| MU-01 | Matchups view switch | FOUND | matchups.js:7-8, 24, 115: Stand-Outs / Top 10 / Top 12 Grid / All 30, remembered (np2.seg.thr). |
| MU-02 | Top 10 threats list | FOUND | matchups.js:41-48 (numbered rows, verdict, next 20 as tiles worst first), "Show 5 more" / "Show top 5 only" with phone/tablet CSS (css/matchups.css:34); calc shown only when it disagrees (A4, matchups.js:29). |
| MU-03 | Top 12 grid | FOUND | matchups.js:51-57 (six columns, 12 rows, ✓/~/✗/– cells, legend, "Tap one for the full matchup"). |
| MU-04 | All 30 | FOUND | matchups.js:60-76 (four groups, reasons, field and usual set, remembered open rows matchups.js:118, Biggest threats with Show All). |
| MU-05 | Threat sheet | FOUND | matchups.js:81-113 (scouting report, Strength Score instead of the old letter, sum line, tiles, detail with a mark per Pokémon, worst list, team checks, Best fix only when it raises the score, All 30 Matchups, Close); Escape / backdrop / Back / focus return via shell.js:56-86, matchups.js:101. Fixes inventory bugs #14 and #15. |
| PLAY-01 | Game Plan fold | FOUND | Moved to a sheet: "Game Plan" link on the plan line (six.js:16), six.js:80-85 rows Covered / Partly / Missing / Optional from gamePlan(), archetype label in the eyebrow. |
| PLAY-02 | Types fold | PARTLY | sugs.js:178-209 inside Things to Know: Offense / Defense switch (remembered np2.seg.types), headlines, Nothing 2HKOs, Nobody hits, "types only" note, Defense chips, two-Mega "Show:" pick, Full Tables sheet (offense table + type grid with Weak / Resist / Net). Missing: the "Against the top 20 <source> Pokémon" table (renderOffMeta / #offMeta); grep offMeta / "top 20" in v2 finds nothing for it. |
| SETS-01 | Open team sheet fold | PARTLY | Replaced by the Team Sheet sheet (team.js:51-64), same cards, tap / Enter opens Edit Set. Missing: the "−" remove button on each card, "+ Add a Pokémon" cards for empty slots, and the KO note for non-leads (non-leads get a blank line, team.js:56). |
| SETS-02 | How Scoring Works fold | FOUND | team.js:414-426 (eight paragraphs, first sentence + More / Less), at the end of Why This Score? (team.js:314). Open state kept in memory only (see X-07). |
| SETS-03 | Mega halo on sheet rows | MISSING | Searched v2 css/js for halo / npmega / prismatic: none. Decorative; the inventory was unsure it still showed. |
| EDIT-01 | Open / close edit panel | FOUND | "Edit Set" sheet: team.js:188 (opened from Edit Set, Team Sheet cards, strip); shell.js:68-86 (✕, backdrop, Escape, Back via history, focus trap, focus return); Escape closes only the name list first (six.js:75). No "Done" button (✕ instead). |
| EDIT-02 | Six-slot strip | PARTLY | team.js:154 strip of the six, current marked (aria-pressed), tap switches. Missing: the "+" buttons for empty spots ("Add a Pokémon in slot N") in the strip. |
| EDIT-03 | Slot header card | PARTLY | team.js:179-180 types, rating "N S tier rating", "% of teams"; Lock at the foot (team.js:176). Missing: the Mega / In your box tags and the "Assumed: you haven't set an item, so this is the one most players run" item line. |
| EDIT-04 | Nature picker | FOUND | team.js:169-171 (Most run / Your pick + "Use X", every nature with natFx, %, ★), team.js:200 toast "Nature saved", reset team.js:210. |
| EDIT-05 | Stat points editor | FOUND | team.js:172-175 (six 0-32 boxes, live "N of 66", over state team.js:201-203, Save Stat Points, pointsProblem messages team.js:212-213, "Use the most common" team.js:211). |
| EDIT-06 | Ability picker | FOUND | team.js:156-158 (Most used / Only / Mega Ability / Suggested / Your pick + Use X, %, ★); toasts team.js:196, 207. |
| EDIT-07 | Item picker | PARTLY | team.js:160-163 (Most used group with % and ★, Other items, "(no item)", Mega Stone fixed, "X is on a teammate", Your pick + Use); toast now gives the Strength Score change (team.js:193-194, by design). Missing: the "Clashes with Trick Room…" warning for Choice Scarf on a Trick Room team (not in itemChoices, app/31-set-edits.js:42-46, nor in team.js). |
| EDIT-08 | Moves | FOUND | team.js:165-167 (four selects, Popular / All moves it learns, type · power · %, duplicates disabled), can't-learn toast team.js:198, "Back to the popular set" team.js:209. Toast reports the Strength Score change instead of the Offense count (team.js:145, by design). |
| EDIT-09 | "Full popular sets ›" | MISSING | No link in the Edit Set sheet (team.js:148-186; grep "Full popular"/fullset in v2: none). The info sheet's "Popular Sets" (monsheet.js:14) is the only route, and it goes to #meta, not rebuilt yet. |
| EDIT-10 | Weak / Resists / ability text | FOUND | team.js:181-185 fold "Weak to" → Resists and the Ability's text (mult with the Ability). |
| EDIT-11 | Remove in panel | FOUND | team.js:176, 215 (clearSlot with Undo toast, sheet turns into Add for that spot). |
| EDIT-12 | "Edit team" (all six) mode | PARTLY | Save / Import / Export each have their own sheet (team.js:83, 286, 68). The stacked all-six editor no longer exists; sets are edited one at a time through the strip. |
| ADD-01 | Name box with live search | FOUND | six.js:52-75 (focused combobox, monChoices with Species Clause slotPool and note, sprite, types, "In your box", useText share, arrows / Enter / Escape list-only, toast "<name> added", sheet becomes Edit Set). |
| ADD-02 | Typing protected from redraws | FOUND | The add box lives in a sheet outside #app (six.js:50-51); V2.redraw only morphs #app (shell.js:184). |
| ADD-03 | Other ways to add | FOUND | Info sheet Add to My Team (team.js:218-225), Quick add (sugs.js:157), suggestions, empty state, Import (team.js:286), team links (team.js:274). |
| IO-01 | Import a team | FOUND | team.js:286-297 (sheet with ✕, paste box, Replace My Team, Pokepaste note, regNote, error note, toast with Undo, team link handled via r.shared). |
| IO-02 | Export to Showdown | FOUND | team.js:68-74 (read-only box, Copy, fallback select + "Press Ctrl+C to copy"). |
| IO-03 | Copy for Showdown (one tap) | PARTLY | team.js:75-76 (My Team More menu, Team Sheet), Saved Teams team.js:126. Missing: when copying is blocked, today's "Copy for Showdown" dialog with the text selected, "Select all" and "Done"; the new site only toasts "Copy failed. Try again." |
| IO-04 | Copy as text (Team Sheet) | FOUND | Team Sheet "Copy for Showdown" button team.js:63 (same export text). |
| SHARE-01 | Share box | FOUND | team.js:247-270 (Team Card / Team Poster / Team Sheet slider, Light / Dark, Save Image, Copy Team Link, press-and-hold note); sheet closing as EDIT-01. |
| SHARE-02 | Team Card image | FOUND | team.js:257 ARB.card (app/44-share-images.js:124). |
| SHARE-03 | Team Poster image | FOUND | team.js:257 ARB.poster (app/44-share-images.js:153). |
| SHARE-04 | Team Sheet image | FOUND | team.js:257 buildSheetImage (app/44-share-images.js:190); "Share as Image" on Team Sheet team.js:63, 77. |
| SHARE-05 | Save image | FOUND | team.js:266-270 (downloads capability, Saved. / Not saved. / not available; plain download outside Claude). |
| SHARE-06 | Team link | PARTLY | Copy Team Link uses shared copyTeamLink (app/45-team-links.js:44-48: toast, button flashes "Copied"); opening a link: team.js:274-283 (sheet "Shared team", Open This Team / Not now, hash removed, Undo, toast). Missing: the blocked-copy fallback writes the link into `#shareMsg` (app/45-team-links.js:47), which the new share sheet doesn't have (it has `[data-sh2msg]`), so the toast says "Copy the link shown below" but nothing is shown. |
| LOG-01 | Your games card | FOUND | record.js:5-11 ("Your Games", "None logged yet" or "W–L · N games logged", Log a Game; only at 6). |
| LOG-02 | Log a game form | PARTLY | record.js:14-27 (two leads optional, their team with × and search up to 6, "Use their N from Battle mode", Win / Loss; focus on first lead; Escape via the sheet). Missing: "Have a Showdown replay? Paste its log" (record.js:3 says it arrives with the Battle page). |
| LOG-03 | Save a result and Undo | FOUND | record.js:37-39 ("Win logged. Undo", toast "Game removed"). |
| LOG-04 | Insights after 5 games | FOUND | record.js:7, 11 (myInsights, "Log N more games…"). |
| LOG-05 | Record on Saved teams and Compare | FOUND | team.js:111 "Your games W–L"; compare.js:28 row "Your games with this six". |
| SHEET-01 | Page head and back link | FOUND | team.js:52, 62 ("← My Team", team name, "Reg … doubles · level 50", "Team Sheet"); now a sheet over My Team. |
| SHEET-02 | Actions | FOUND | team.js:63 (Copy for Showdown, Share as Image, key line). |
| SHEET-03 | Six set cards | FOUND | team.js:56-61, 64, 78-79 (sheetData, moves in type colours, nature +/−, spread source, level-50 stats with points, tap / Enter → Edit Set). |
| SHEET-04 | Empty state | FOUND | team.js:53-54 (same message; button "Add a Pokémon" instead of "Open My Team"). |
| SAVED-01 | Save / Update saved team | FOUND | team.js:83-95 (name box max 40 with placeholder, Update Team / Save as New, disabled at 10 with message, Cancel, Enter = form submit, toast; "Untitled team" in saveTeamAs). |
| SAVED-02 | Page head, count, storage line | FOUND | team.js:115-116 ("← My Team · N of 10 saved", "Saved Teams", sync line). |
| SAVED-03 | Sort | FOUND | team.js:117, 141 (Newest / Name / Matchups = today's Readiness sort, relabelled). |
| SAVED-04 | Saved team card | FOUND | team.js:102-111 (name, Open now, six tiles + empties, gone note, score badge or "N of 6 picked", checks, Your games, Open / Compare / Copy for Showdown / Team Poster / Rename / Delete as flat links instead of a ⋯ menu). |
| SAVED-05 | Open a saved team | FOUND | team.js:125 (openSaved keeps Undo, toast with Undo). |
| SAVED-06 | Rename / Delete | FOUND | team.js:104, 108, 127-139 (inline rename, Enter saves; "Delete X?" Delete / Keep; toast; deleteSaved unlinks the open team). |
| SAVED-07 | Team poster for a saved team | FOUND | team.js:109, 132, 247-249 (poster sheet, file "<name> poster - NastyPlot.png" team.js:267). |
| SAVED-08 | Compare two saved teams | FOUND | team.js:117, 129-131 (hint, "Picked ✓", bar with Compare with My Team / Cancel, second pick opens Compare). |
| SAVED-09 | Empty state | PARTLY | team.js:118-119 ("No saved teams yet…" with Save This Team when a team exists). With no team and no saved teams there is only a sentence: no "Open My team" / "Build me a team" buttons (only the "← My Team" eyebrow link). |
| SAVED-10 | Hidden older singles teams | PARTLY | Hidden by savedRows (app/30-saved-data.js:11). Missing: the count tooltip saying they still use a slot; the header count "N of 10" counts only visible teams (team.js:101, 115) while the 10-limit counts all (team.js:83). |
| BOX-01 | Head, count, sync line | FOUND | box.js:59-61, 67 ("← My Team · The Pokémon you own", "My Box", "N Pokémon", why line, sync line). |
| BOX-02 | Add a Pokémon to the box | FOUND | box.js:84-92 (search sheet, base forms only, not ones already in the box, toast "<name> added to your box"). |
| BOX-03 | Tiles and remove | FOUND | Tiles box.js:31; remove moved to the picked Pokémon's summary "Remove from Box" (box.js:46, 122-124) with Undo toast (box.js:83, 125 "Box restored"). |
| BOX-04 | Sort | FOUND | box.js:10, 62, 136 (A–Z / Type / Newest / Oldest / Rating, setBoxSort). |
| BOX-05 | Reset box | FOUND | box.js:66, 126-127 ("Tap Again to Reset" 3.5 s, reset with Undo toast). |
| BOX-06 | Box links | FOUND | box.js:63-65, 128-134, 148-153 (Copy Box Link with fallback into the field, Open a Box Link, Add / Replace, messages, `#box=` opens with the link filled). |
| BOX-07 | Empty box | FOUND | box.js:54-56 ("Your box is empty…", Add a Pokémon; underdog instead of Darkrai). |
| CMP-01 | Open Compare | FOUND | More menu team.js:340 (`cur|`), Saved Teams team.js:129-130; compare.js:6-7, 32 ("← My Team · Compare · two teams side by side", "Compare Teams"). |
| CMP-02 | Team headers A and B | FOUND | compare.js:9-13 (badge, name, source line, six, Change; empty side "Pick Team X · My team, saved, winning or pasted"), Swap compare.js:33, 69. |
| CMP-03 | Team picker | PARTLY | compare.js:52-63 (My Team with "Already team X" disabled, Saved Teams, Winning Teams 6 + "Show 10 more winners", paste box + Use This Team with note / toast). Missing: the line "Any other tournament team: tap Compare on its card in Winning teams." |
| CMP-04 | Comparison result | FOUND | compare.js:36-47 ("Working out both teams…", What's Different up to 6, rows that differ, Why These Scores, Same on both remembered for the session, footnote). |
| PKMN-01 | Open / close | FOUND | monsheet.js:73-75 (sheet), close / Escape / Back / focus return via shell.js:56-86. Not checked: the desktop two-column layout (needs a look at the built page). |
| PKMN-02 | Hero | PARTLY | monsheet.js:7-14 (rating numeral, tier, rank, name, types, % of teams of N, win rate with games, Speed at level 50). Missing: the "?" rating tip, and the Mega / In your box / Hidden gem marks (grep gem / inBox in monsheet.js: none). |
| PKMN-03 | Actions on the sheet | PARTLY | Add to My Team / "On your team ✓" / team full (team.js:218-225), Build Around It (handled in home.js:88), Popular Sets (monsheet.js:89, to #meta, not rebuilt yet). Missing: "Report a mistake" (grep fbmis / "Report a mistake" in v2: none). |
| PKMN-04 | Tabs Info / Meta / Rating | PARTLY | monsheet.js:68-83 (tabs, remembered np2.montab, Arrow / Home / End; a Forms tab added). Missing: the sideways swipe between tabs on phones (no touch handler in monsheet.js). |
| PKMN-05 | Info tab | PARTLY | monsheet.js:19-35 (Usually, base stats with Mega change, Abilities with %, type matchups with Ability changes, Speed rows with outspeed %). Missing: "Full set ›" (to Meta) and "Speed Tiers →" links. |
| PKMN-06 | Meta tab | FOUND | monsheet.js:37-46 (Typical set with Ability %, Moves %, Items %, Brought with (tap = sheet), note, no-data text). |
| PKMN-07 | Rating tab | PARTLY | monsheet.js:48-54 (Why it rates N bars "Top N% of Pokémon", What the data says, Other tier lists in new tabs). Missing: "?" bars tip, the "Profile: power, typing, tools" fold, the trap note ("Suggestions skip this one…"), and the "How ratings work →" / "Track Record →" links (grep in monsheet.js: none). |
| X-01 | Saving and syncing | FOUND | bridge.js:7 render() persists every change; app/03-persistence.js is in the build (parts-v2.json) with its remote-update toasts through bridge toast. Not exercised here (needs two signed-in tabs). |
| X-02 | First-visit defaults | FOUND | app/01-state.js in the build (DEFAULT_TEAM, DEFAULT_BOX); sample note on My Team team.js:364. (Welcome card is Home, out of scope.) |
| X-03 | Toasts with Undo | FOUND | bridge.js:12 → V2.toast (shell.js:32) with today's #toastUndo handler; box toasts box.js:83. Different: one duration (4 s) and no Darkrai picture (cut by Sim). |
| X-04 | Double-tap guard | PARTLY | 450 ms guard on Apply and Quick add (sugs.js:106, 157). Not on remove, load/open, Add to team, Build around or Clear team. |
| X-05 | Keep your place | FOUND | shell.js:184 (redraw in place, scroll kept), shell.js:230 (new page at top, Back restores scroll). |
| X-06 | Back button and dialogs | FOUND | shell.js:56-67 (each sheet is a history step; Back closes it first). |
| X-07 | Remembered folds and views | PARTLY | Kept: Things to Know (cc2.chf.rfix, sugs.js:113, 152), Matchups view (np2.seg.thr), Types view (np2.seg.types), info tab (np2.montab), box sort, Suggest from pool. How Scoring Works open state is memory only (V2.hsOpen, team.js:425), not kept on reload; Game Plan and Team Sheet are sheets now (nothing to remember). |
| X-08 | Sliding pickers | FOUND | shell.js:121-133 (slider with icons, aria-pressed, arrow keys) used for every switch. |
| X-09 | Title Case and naming | FOUND | Labels written in Title Case in the templates; team names drawn as typed (V2.esc); "Mega Charizard Y" kept together (shell.js:16, team.js:364). |
| X-10 | Light / dark | FOUND | shell.js:136 setTheme (np2.theme), header sun / moon; share images Light / Dark team.js:250. |
| X-11 | Search (Ctrl K, "/") | FOUND | shell.js:98-116 (Pokémon, pages and saved teams; a saved team opens like Open). |
| X-12 | Text helpers | UNSURE | "More" exists for How Scoring Works (team.js:423-426) only; no shared long-text helper found. Whether a "?" can wrap alone onto a line (today's AR.glue) can't be told from code: `V2.tip` buttons follow text with no glue (team.js:382). Needs a look at narrow widths on the built page. |
| X-13 | Entry points / settings only on All suggestions | PARTLY | Kept: All Suggestions sheet, Battle, Build, How we calculate links, Info sheet Build Around It / Popular Sets. Missing on the new site: the Plan settings (Never suggest list S.excl, Count abilities toggle (hidden and always on, body.html:4), Refresh plans, Pick from), the Set check tips and item fixes (data-settip / data-itfix), and the Battle replay box link (LOG-02). Popular Sets, How we calculate, Speed Tiers, Track Record are not rebuilt yet. |

## MISSING and PARTLY, most important first

1. X-13: Plan settings that change My Team's suggestions have no control on the new site: the Never-suggest list, Count abilities, Refresh plans, Pick from, and the Set check tips / item fixes.
2. TEAM-19: empty My Team has no six "+ Add a Pokémon" spots; "Add a Pokémon" opens site Search, not the add box for slot 1.
3. EDIT-07: no "Clashes with Trick Room" warning for Choice Scarf on a Trick Room team.
4. SHARE-06: when copying a team link is blocked, the toast says "Copy the link shown below" but the new share sheet has no place where the link is shown.
5. IO-03: no fallback dialog with the team text when Copy for Showdown is blocked (only "Copy failed. Try again.").
6. PKMN-03: "Report a mistake" is missing from the info sheet.
7. PKMN-07: the Rating tab has no "?" bars tip, no "Profile" fold, no trap note, no "How ratings work" / "Track Record" links.
8. SUG-08: the "Sets" link in "Nothing to fix" points to #sets, which has no page (lands on Home).
9. TEAM-16: no "Team checks N/4" badge with pips; `ckCard` in sugs.js is built but unused.
10. PLAY-02: the "Against the top 20 <source> Pokémon" offense table is missing from Types / Full Tables.
11. SETS-01: Team Sheet cards have no "−" remove, no "+ Add a Pokémon" cards for empty spots, no KO note for non-leads.
12. LOG-02: no "Paste its log" Showdown replay link (waits for the Battle page).
13. EDIT-09: no "Full popular sets ›" link in Edit Set (and Popular Sets is not rebuilt yet).
14. X-04: double-tap guard only on Apply and Quick add, not on remove, open, Add to team, Clear team.
15. PKMN-02: no rating "?" tip, no Mega / In your box / Hidden gem marks on the info sheet hero.
16. SUG-11: "?" tips only for Matchups and checks; rating, bars, spread and tiers tips are gone.
17. EDIT-03: Edit Set header lacks the Mega / In your box tags and the "Assumed: …most players run" item line.
18. EDIT-02: the strip in Edit Set has no "+" for empty spots.
19. TEAM-07: jump bar doesn't move focus to the section heading.
20. PKMN-04: no phone swipe between info-sheet tabs.
21. PKMN-05: no "Full set ›" and "Speed Tiers →" links on the Info tab.
22. SAVED-10: the saved count shows visible teams only, with no note that hidden singles teams still use a slot.
23. SAVED-09: with no team and no saved teams, no "Open My Team" / "Build me a team" buttons.
24. CMP-03: the "Any other tournament team: tap Compare on its card in Winning teams" hint is gone.
25. X-07: How Scoring Works open / closed isn't remembered on reload.
26. EDIT-12: no stacked all-six editor (Save / Import / Export have their own sheets).
27. TEAM-03: no score count-up / pop or rise sparkle animation.
28. TEAM-01: long team names wrap instead of getting a smaller size.
29. TEAM-18 (MISSING): no weather backdrop behind the header (the inventory was unsure it still showed).
30. SETS-03 (MISSING): no Mega halo (decorative; the inventory was unsure it still showed).

# Feature audit C + shell: Battle, Log, Matchups, Battle tools, and the site shell (NAV / JUMP / THEME / SHELL)

Look-only audit, written Thu Nov 12 2026, 23:26 EST by the clock (`TZ=America/New_York date`). Code read at commit b3e395c
(last change to app/src/v2: 2026-11-13 03:51 UTC). Nothing but this file was changed.

**Counts (all 218 feature IDs in scope): FOUND 59 · PARTLY 26 · MISSING 6 · NOT REBUILT YET 117 · UNSURE 7**
(plus DROPPED 3: features removed by a recorded decision or dead code, not counted as missing: BATTLE-19, NAV-11 (D), SHELL-28).
By file: C-battle.md 90 IDs (FOUND 34, PARTLY 9, MISSING 0, NOT REBUILT YET 46, DROPPED 1); D-meta-shell.md shell part 53 IDs
(FOUND 25, PARTLY 17, MISSING 6, NOT REBUILT YET 3, DROPPED 2); D Meta page IDs 75 (NOT REBUILT YET 68, UNSURE 7 = SHEET).
The DEAD / DUP / BROKEN / UNSURE notes of both files are in their own tables at the end (status only, not counted).

How it was checked: every verdict comes from reading app/src/v2 (shell.js, bridge.js, pages/*.js, css/*.css, head.html,
body.html) and the shared logic named in app/parts-v2.json; nothing was run in a browser. Two facts that shape many rows:
- Routing (shell.js:142): a `#hash` with no registered page opens **Home**. Registered pages: home, build, team, team-empty, box,
  compare, sheet, guide, battle (grep `V2.pages` in pages/*.js). In Preview builds only (`window.__NP_PREVIEW`), coming.js:9-19 adds
  "coming next" placeholders for practice, gauntlet, speed, calc, types (each with "Back to Battle") and mock-up pages for meta.
  So **#method, #about, #feedback (footer links, shell.js:198) and #meta in a real build all land on Home.**
- The tool pages (Damage Calc, Speed Tiers, Type Chart, Test Run, Team Preview Practice) and all Meta pages are not rebuilt.

## C-battle.md

| ID | Short name | Verdict | Evidence / what's missing |
|---|---|---|---|
| NAV-01 | Battle tab in main nav | FOUND | shell.js:191,193,199 header nav + phone bar "Battle", `aria-current` by the page's `place`; tool placeholders use place 'battle' (coming.js:11) so Battle stays highlighted. Page is in the address (#battle), so reload reopens it. |
| NAV-02 | Battle group menu entries | FOUND | Moved to the Battle tools bar (battle.js:222-223, 700px+, pages.css:1010): Battle A Team, Team Preview Practice, Test Run, Speed Tiers, Damage Calc, Type Chart, Battle Log, same order. No icons. (The site-wide ⋯ menu itself: see D NAV-03.) |
| NAV-03 | "← Battle" back links on tool pages | NOT REBUILT YET | Tool pages not rebuilt; their Preview placeholders carry "Back to Battle" (coming.js:12). Header Back button is global (shell.js:240). |
| NAV-04 | Speed / Calc / Type switch | NOT REBUILT YET | Belongs to the three tool pages. |
| NAV-05 | "More ways to prep" cards | FOUND | battle.js:224 `V2.battleMoreTools` "More Ways to Prep", phones only (pages.css:1009,1015); adds Team Preview Practice to the four. Wider screens get the tools bar instead. |
| NAV-06 | Entry points that load an opponent | FOUND | Rebuilt ones present: Home "Plan a Match" (home.js:14), Home event team prep (home.js:152, toast "Opponent set: …"), Home "Battle Log ›"/"Log a Game" (home.js:119-120), Build cores "Practice against" (build.js:163, "Loaded as your opponent"). Winning Teams / Events / Test Run entries wait for those pages. Head bug from Home's entry: see BATTLE-01. |
| BATTLE-01 | Page head | PARTLY | battle.js:13-20: eyebrow "Battle a team · Team preview / Their real open team sheet", headline "Bring these four. Lead the pair." (or "Who are you facing? Plan the match."), line "Vs <who> at <event> · n of 6 entered", plus the real-games verdict. Missing vs inventory: (1) **your team's name vs their archetype** is no longer in the head (archetypes only inside Deeper Read, battle.js:145); (2) the **player's name** is never shown (label is teamWho: "Champion · 8-1"), and the event's player count is dropped (evShort); (3) when the opponent comes from Home's event prep (home.js:152 sets `oppFrom` without `label`/`ev`), the head reads "Vs Challenger" with no event, because btOppWho falls back to `teamWho({player})` (battle.js:8; 06-helpers.js:212). |
| BATTLE-02 | Their six: six boxes | PARTLY | Moved into the "Their Six" sheet (battle.js:40-50, 69-84): six boxes "Pokémon 1-6", not offered twice (battle.js:80-81), next empty box gets focus (75), filled slot = art tile with × "Remove <name>" (41), × refocuses that box (72), Escape clears typing (84). Missing: **Megas can't be typed in** (V2.buildHits filters `!p.m`, build.js:19; today's searchMon offers them, 04-search.js:2-10); suggestions show only sprite + name (no types, no "Box" tag, no tournament share) and are not ranked by box/usage (ROSTER order, substring); **no ↑/↓ in the list** (Enter takes the first hit only, battle.js:83); no custom × while typing (native `type=search` clear only). |
| BATTLE-03 | Clear their six | FOUND | battle.js:23 "Clear" beside "Their Six" when any are in; 71 empties, toast "Cleared their six". |
| BATTLE-04 | Recent opponents | FOUND | In the Their Six sheet "Recent Opponents" (battle.js:46,54-62, up to 4 shown, 5 kept, current six excluded), toast "Recent opponent loaded" (66). `recentOpp` is now in snapshot/fromDoc (03-persistence.js:18,23), so the old BROKEN-01 is fixed. |
| BATTLE-05 | Practice against a top team | FOUND | Replaces the select: "Or Pick a Top Tournament Team" (top 10, battle.js:43-44,76-77) and "Show All N Tournament Teams" with who, event and archetype (47-48, 67-68; toast "Loaded <player>'s team as the opponent"); hidden with no team data. |
| BATTLE-06 | Copy for Showdown (their sheet) | PARTLY | battle.js:24,52-53,64: "Copy for Showdown" only for a known sheet; toasts "Their team copied for Showdown" (+ filled-sets note). Missing: when the clipboard is blocked there is **no sheet with the text selected ("Select all"/"Done")**; it only toasts "Copy blocked by the browser". |
| BATTLE-07 | Empty and partial states | FOUND | battle.js:34-35: "Add at least 4 Pokémon on My Team first. Go to My Team ›"; with 4+ and none of theirs "Everything below fills in once their six is in…". Plan from 1 of theirs (btPlan, 11-12); likely lead needs 2 (46-battle-data.js:61), turn one doubles only (80). The faint most-used sprite behind the empty field is gone (look only). |
| BATTLE-08 | The read | FOUND | battle.js:89-97 "The Read": Biggest threat with reason, "<n> Fake Out on their side". Your lead pair moved to "Your Six" Lead group (26-28); their likely lead is tagged "Likely lead" on their six (22) and named in Turn One's subtitle (32). |
| BATTLE-09 | Plan / Speed / Damage switch | FOUND | Replaced by tabs Damage Both Ways / Who Moves First / Deeper Read (battle.js:106-108,149-153), as known. Old BROKEN-02 gone with it. |
| BATTLE-10 | Bring these four | FOUND | Headline in head (battle.js:16), Lead / Back / Leave home groups (26-28), 13,000 ladder games note and one-Mega note (28). The separate "two biggest things to watch" list is covered by The Read + Watch Out (always open). Kicker "NastyPlot's pick: vs this six" not used. |
| BATTLE-11 | From real games | FOUND | Verdict in head (battle.js:19) and "From Real Games" card with Helps you / Hurts you pairs or "No Pokémon pairing here stands out…" (95-96). Words now Favoured / Even match / Unfavoured (35-win-model.js:174), so old BROKEN-03 is fixed. |
| BATTLE-12 | Watch out | FOUND | battle.js:98-99 "Watch Out", "<n> of their six can shut something down" / "Nothing on their side…", tagged rows coloured by severity (bmWatch, shared 46-battle-data.js). Always open (known; no fold memory needed). |
| BATTLE-13 | Turn one in move order | FOUND | battle.js:29-33 "Turn One, in Move Order", "Your A + B vs their likely C + D", numbered You/Them, Speed, priority, move and why, "Watch … Consider Protect", "Field on turn 1" with Cloud Nine/Air Lock and Trace notes. Doubles only (46-battle-data.js:80). |
| BATTLE-14 | Who moves first | FOUND | Tab "Who Moves First" (battle.js:132-139): Your/Their Tailwind, "Them −1 (after your <move>)", They're Paralyzed, Trick Room; weather note; bars with Scarf / weather ability / Unburden / "Speed tie"; priority line; assumption note. Desktop adds the speed line (127-131). |
| BATTLE-15 | Damage both ways | FOUND | Tab "Damage Both Ways" (battle.js:109-124): weather chips (Leads / No Weather / Sun / Rain / Sand / Snow), "You're / They're Intimidated", grid your four x their six with hover ranges and KO text, phone blocks (119-120, pages.css:945-952), legend. |
| BATTLE-16 | Damage calc card (pick an attacker) | NOT REBUILT YET | Confirmed waiting: no `dcgo` or attacker picker in app/src/v2 (grep). Needs the Damage Calc page. |
| BATTLE-17 | Team preview practice entry | NOT REBUILT YET | Confirmed: entry exists (tools bar battle.js:220-223, More Ways to Prep 224) but #practice is only a Preview placeholder (coming.js:9-12); in a real build it opens Home. |
| BATTLE-18 | Deeper read | FOUND | Tab "Deeper Read" (battle.js:140-148): "You: <archetype> vs Them: <archetype>", Edge / Watch / Note rows, their threats "Answer: … / No clean answer in your four", "Clear" row, full matchup grid inline with explanation. Archetypes are labels, not chips; the "Likely lead" line lives on their six. Uses battlePlan's own plan, so old UNSURE-04 (Count abilities mismatch) no longer applies here. |
| BATTLE-19 | Hidden old opponent grid | DROPPED | Dead today (DEAD-01); not carried (no `oppSlots` / `data-unopp` in v2). Correct. |
| BATTLE-20 | Tips and long-text "More" | FOUND | Nothing on Battle is hidden: the damage legend shows in full (battle.js:124). The only Battle "?" tip was on the calc card (BATTLE-16). The shared tip helper exists (sugs.js:160-172). |
| LOG-01 | Pick the four you brought | FOUND | battle.js:157-171,188-190: four from the plan ("Filled in from the plan"), "n/4 picked", "saved with their n", picker sheet "The Four You Brought" with Lead 1/2 / Back 3/4 and "Order: lead A + B, back C + D". Under 4 Pokémon the page's "Add at least 4…" line covers it (34). |
| LOG-02 | Win / Loss | FOUND | battle.js:172,203-205: disabled until four, saves `{t,r,b,tm,o}`, 400 kept, toasts "Win logged" / "Loss logged"; record line beside (166). |
| LOG-03 | Your record | PARTLY | "Your Record ›" sheet (battle.js:175-187): overall, this team, battles logged, Your Pokémon (top 8), Lead Pairs (2+), Toughest Opponents (3+), Recent Battles (15) with Delete. Missing: recent rows **don't say who you played** (today "vs <first 3 of theirs>…") and have no "(leads)" mark for two-Pokémon entries; "Result only" became "Pokémon not recorded". The "No battles logged yet. Your record by team, Pokémon and lead pair shows up here." empty text is replaced by "No games logged yet. After the match, log the result…" (166-167). |
| LOG-04 | Delete a logged game | FOUND | battle.js:187,209 "Delete", no confirm, toast "Battle deleted". |
| LOG-05 | Log from a Showdown replay | FOUND | Sheet "Log from a Showdown Replay" (battle.js:191-198,206-211): paste box "\|player\|p1\|…", "Log This Game", "Choose Replay File" (.html/.htm/.txt/.log), shared parseReplay errors in an aria-live line, "<Win> logged: … you brought …", toast "… logged from replay". |
| LOG-06 | "Your games · this six" on My Team | PARTLY | record.js:5-41: "Your Games", W–L or "None logged yet", "Log a Game" sheet with two optional leads, their team search, "Use their n from Battle mode", Win / Loss, "Win logged. Undo", insights after 5 / "Log n more games". Missing: **"Have a Showdown replay? Paste its log"** (today's `data-qlreplay`, opening Battle's replay box); record.js:3 says it would come with the Battle page, and it hasn't been added. |
| LOG-07 | Log shown elsewhere | FOUND | Home "Your battles" W–L, % wins, logged, last 10 dots, "Battle Log ›" / "Log a Game" (home.js:118-120); Saved Teams "Your games W–L" (team.js:111). Compare: compare-data computes `rec` (62-compare-data.js:33) but neither today's 63-compare.js nor v2 compare.js draws it (grep `.rec`), so nothing lost. |
| CALC-01 … CALC-10 | Damage Calc page (10 IDs) | NOT REBUILT YET | One verdict per ID: CALC-01, 02, 03, 04, 05, 06, 07, 08, 09, 10 all NOT REBUILT YET (Preview placeholder only, coming.js:9-12). |
| SPEED-01 … SPEED-06 | Speed Tiers page (6 IDs) | NOT REBUILT YET | SPEED-01, 02, 03, 04, 05, 06: page not rebuilt. |
| TYPES-01 … TYPES-05 | Type Chart page (5 IDs) | NOT REBUILT YET | TYPES-01, 02, 03, 04, 05: page not rebuilt. |
| TEST-01 … TEST-09 | Test Run page (9 IDs) | NOT REBUILT YET | TEST-01 … 09: page not rebuilt (its data, gauntletTeams, is shared and already feeds Battle's team list). |
| PRAC-01 … PRAC-04 | Team Preview Practice (4 IDs) | NOT REBUILT YET | PRAC-01, 02, 03, 04: page not rebuilt. |
| TRACK-01 … TRACK-07 | Track Record (7 IDs) | NOT REBUILT YET | TRACK-01 … 07: Meta-group page, not rebuilt. |
| MATCHUPS-01 | Top 10 threats list | FOUND | matchups.js:41-48 view "Top 10": rank, sprite, name, real-games word (or calc level), "Show N more / Show top 5 only", "The next 20, worst first" tiles; tap opens the sheet (109). Change by Sim's A4 plan: "Calc: <level>" shows only when it disagrees (29). Default view is the new "Stand-Outs" (31-38). |
| MATCHUPS-02 | Legend counts | FOUND | matchups.js:21-23 Favoured / Even match / Unfavoured counts + "Damage calc: No answer n, Shaky n, Handles it n, Beats it n". |
| MATCHUPS-03 | Scouting report sheet | FOUND | matchups.js:81-113: "Scouting report: top 30 threats", "<n> threats need a plan." / "Ready for every top threat.", Strength Score ring, summary + legend, 30 tiles with selected detail and ✗ ~ ✓ ✓✓ per Pokémon, "Needs a plan" (worst 5), Team checks, Best fix + "Apply This Fix ➜" (only when it raises the score), "All 30 Matchups", Close, ×, Escape, Back (shell.js:60-79). |
| MATCHUPS-04 | Your six vs the top 12 | FOUND | matchups.js:51-57 view "Top 12 Grid", symbols per cell, key, "Tap one for the full matchup." Tapping opens the sheet in place. |
| MATCHUPS-05 | Threat preparation card | FOUND | matchups.js:60-76 view "All 30": "Beats or handles x of the top 30 threats" (word list), "<n> with no answer", No answer / Shaky open, Handles it / Beats it closed, each threat opens to its ✓ ~ ✗ reasons, field and usual set; open rows kept in memory (118). |
| MATCHUPS-06 | Old meta threats list | FOUND | matchups.js:66-71 "Biggest threats" in All 30, 4 on phones + "Show All n". Still carries old BROKEN-04 words "Dangerous / Manageable" as the fallback pill (70). |
| MATCHUPS-07 | Test run levels | NOT REBUILT YET | Same as TEST-05. |
| X-01 | Sprites as art tiles | FOUND | shell.js:21-22 V2.mon (Pokémon on its floor, Mega tag), used throughout battle.js. |
| X-02 | Sliders | FOUND | Shared slider V2.slide (shell.js:124-133). Battle's only slider (Plan/Speed/Damage) became tabs; the other sliders are on unbuilt pages. |
| X-03 | Folds remember | PARTLY | Battle has no folds now (Watch Out always open; Deeper Read is a tab). The open tab is memory only (V2.btUi.tab, battle.js:104), so Deeper Read open/closed is no longer remembered across reloads as `cc2.chf.mufold` was. Low impact. |
| X-04 | Redraw keeps your place | FOUND | V2.redraw morphs in place, keeps scroll and focus (shell.js:164-188). |
| X-05 | Back closes sheets first | FOUND | shell.js:57-67 (sheet history step), 218-248 (Back restores scroll per step). |
| X-06 | Double-tap guard | PARTLY | Only Suggestions' Apply and Quick add have a 0.45 s guard (sugs.js:106,157). See SHELL-30. |
| X-07 | Multi-device sync | FOUND | Shared 03-persistence.js (S.opp, S.log, live take-in + toast "Updated from your other device", line 43); bridge render/toast (bridge.js:7-14). |
| X-08 | Text rewriting | PARTLY | Title Case and "Mega X" are written at source (V2.disp, shell.js:14). " · " is not turned into commas (e.g. battle.js:20, 166). Whether that is wanted is a design call. |
| X-09 | Keyboard | PARTLY | Enter picks, Escape clears / closes, Tab stays in sheets (shell.js:78-86). Missing: ↑/↓ in the Their Six suggestion lists (battle.js:82-84). |

## D-meta-shell.md: NAV, JUMP, THEME, SHELL

| ID | Short name | Verdict | Evidence / what's missing |
|---|---|---|---|
| NAV-01 | Main page tabs | PARTLY | shell.js:134,191,193 Home, Build, My Team, Battle, Meta with `aria-current`. Missing: the **live "x/6" count beside My Team** (the count is on My Team's own eyebrow, team.js:364). In a real build "Meta" opens Home (no meta page). |
| NAV-02 | Phone bottom bar | PARTLY | shell.js:199 `.np-bar`, shell.css:27-36 (five tabs, current marked, safe-area padding). Missing: the lift when the Claude iPhone app cuts off the frame bottom (`--hostcut`) and the iOS redraw after app-made scrolls (72-keep-place.js); no My Team icon (text only). Whether the host-cut fix is still needed: unsure (test on iPhone in the Claude app). |
| NAV-03 | The "⋯" menu | MISSING | No site menu or drawer in app/src/v2 (grep `menu`, `drawer`, `np-more`: only My Team's own More menu, team.js:335-345). Partly replaced: My Box icon in the header (shell.js:195), Battle tools bar, My Team's More menu (Saved Teams, Compare…). Not reachable from any menu: Theme Auto/Light/Dark (THEME-02), and the Meta, This Week, Track Record, How We Calculate, About pages (not rebuilt). |
| NAV-04 | Meta switch Pokémon / Tournaments | NOT REBUILT YET | Meta pages. |
| NAV-05 | Meta second-level sliders | NOT REBUILT YET | Meta pages. |
| NAV-06 | Back links on sub-pages | FOUND | Replaced by the header Back / Forward buttons ("Back to <page>", one history step, Sim Nov 12; shell.js:218-248) and the My Box icon's return (213-216). Tool placeholders keep "Back to Battle". |
| NAV-07 | Page switching and identity | FOUND | Hash routing (shell.js:142,190-209,215-216); unknown page opens Home; reload reopens the same page (fixes old BROKEN-04). Per-page title was hidden today (BROKEN-02); v2 sets none. Usage count: see SHELL-22. |
| NAV-08 | Back button and history | FOUND | Each page is a history step with its scroll (shell.js:223-236); Back closes an open sheet first (64-67). Pages now have addresses (#battle…); team/box links pass through (coming.js:20). |
| NAV-09 | New page opens at its top | FOUND | hashchange → new step scrolls to 0 (shell.js:215-216,233). The short fade on page switch is gone (see SHELL-32). |
| NAV-10 | Focus stays inside dialogs | FOUND | shell.js:78-86 Tab / Shift+Tab wrap, skipping hidden, disabled and closed-fold controls; focus returns on close (76). |
| NAV-11 | Section colours | DROPPED | Decided: "Five section colours … Confirmed: no section colours" (docs/rebuild/decisions-refinement.md:41). No `data-pg` / `--sec` in v2. |
| JUMP-01 | Opening the search | FOUND | shell.js:194 header "Search" with a "/" hint; Ctrl/Cmd+K and "/" (only when not typing) open it (116). Differences: hint shows "/" not "Ctrl K"; Ctrl+K doesn't close it again (Escape does). |
| JUMP-02 | Empty search list | PARTLY | With nothing typed it shows "Type a Pokémon's name, a saved team, or a page like Battle." (shell.js:103), not the list of 14 tools with descriptions. |
| JUMP-03 | Typing a query | PARTLY | Pages (5 main places only), saved teams (up to 4), Pokémon (up to 8, sprite + types), accent-insensitive, "Nothing called "…". Try part of the name." (shell.js:89-107). Missing: tools by description; Pokémon rows lack "Rated N, #k of N"; ordering is match position then usage, not rating. |
| JUMP-04 | Choosing a result | PARTLY | Enter opens the first hit (shell.js:109), tap opens; a page closes the sheet; a saved team opens it on My Team with toast "Opened "name"" + Undo (team.js:125); a Pokémon opens its info sheet (monsheet.js:73); focus returns (shell.js:76). Missing: **↑/↓ to move the highlight** (Enter can only take the first hit). |
| JUMP-05 | Which tools search finds | PARTLY | Only Home, Build, My Team, Battle, Meta (`V2.places`, shell.js:134). Rebuilt pages that can't be found: My Box, Compare, Saved Teams, All Suggestions, Build around a core / cores, Team Sheet. Tool pages and Meta pages wait for their rebuild. (Old BROKEN-10 naming drift is gone; the gap is wider.) |
| THEME-01 | Day / night button | FOUND | shell.js:196,210 sun by day / moon at night, label "Day mode is on. Switch to night mode", saved (`np2.theme`, shell.js:136). |
| THEME-02 | Auto / Light / Dark | PARTLY | First visit follows the device (head.html script), but there is **no Auto choice**: after one tap the device setting is never followed again, the site doesn't follow a device change without reload, and it doesn't read the Claude app's own theme (no matchMedia listener in shell.js). I found no recorded decision dropping Auto (decisions.md:230,383 cover only the sun/moon icon). |
| THEME-03 | Share images' own light/dark | FOUND | Team share sheet has its own Light / Dark slider, default from the site (team.js:247-250). This Week's share waits for that page. |
| SHELL-01 | Page head, fonts, screen fit | PARTLY | head.html: title "NastyPlot", description, viewport-fit, theme before first paint; fonts self-hosted (build.mjs:56-62, no Google Fonts; approved). Missing: **favicons** (today's head.html:3-5) and `claude:viewport-fit-sides` (today's head.html:13); notch space is always on (viewport-fit=cover) rather than only when the page fills the screen. |
| SHELL-02 | Header | FOUND | shell.js:193-196: Back, logo, Forward, five places, Search, My Box, Day/Night. No "⋯" (see NAV-03). |
| SHELL-03 | "Data as of" stamps | FOUND | Footer shows `dataDateText()` "Data as of …" (shell.js:141,198), now visible (old BROKEN-01 fixed). Per-page stamps on Meta pages wait for them. |
| SHELL-04 | Data health note | MISSING | 43-data-health.js is not in parts-v2.json; no renderHealth / healthStale / HEALTH in v2 (grep). Today it shows on Home, which is rebuilt, so a stale source is no longer flagged anywhere. |
| SHELL-05 | Regulation banner | MISSING | No renderReg / regInfo banner in v2 (regInfo is used only for the Team Sheet's "Reg … doubles" line, team.js:51). The Reg M-D start notice would not show on Home. |
| SHELL-06 | Footer | PARTLY | shell.js:198: logo, "NastyPlot is an unofficial, fan‑made tool.", data date, links How We Calculate / About / Send Feedback. Missing: tagline "Sharply raise your win rate.", the full unofficial / trademark disclaimer, **"Sources and credits"** (data sources and the MIT game-data credit), Privacy and Contact links; and all three links open **Home** (no method / about / feedback pages). |
| SHELL-07 | Toasts | FOUND | shell.js:32-36 one toast above the bar/dock, 4 s; Undo through today's #toastUndo (bridge.js:12). Darkrai picture cut by Sim (CLAUDE.md). |
| SHELL-08 | Undo bar for applied suggestions | FOUND | sugs.js:79-82 V2.undoBar "Applied <change> … Undo" and appliedSay. |
| SHELL-09 | "?" tip bubbles | PARTLY | sugs.js:160-172: one bubble, closes on tap outside, Escape, scroll; used on My Team (team.js:383, sugs.js:140). Its "How we calculate →" link goes to #method, which opens **Home**. Darkrai peek cut (decided). |
| SHELL-10 | Clear (×) in search boxes | PARTLY | Fields are `type="search"`, so only the browser's own clear shows (Chrome / Safari; not Firefox); no site × that keeps the keyboard up (grep `clrWrap`, `search-cancel`: none). Escape clears Battle's boxes (battle.js:84). |
| SHELL-11 | Long paragraphs fold to More / Less | PARTLY | Only "How Scoring Works" folds its paragraphs (team.js:418-426). No site-wide fold; text simply shows in full (nothing hidden). |
| SHELL-12 | Text style rules | PARTLY | Title Case and "Mega X" are written at source (shell.js:14-16). " · " lists are kept (no comma rewrite), e.g. battle.js:20. Needs Sim's call whether that's the new style. |
| SHELL-13 | Sliding pickers | FOUND | shell.js:117-133 V2.slide: icon + name, plate slides, arrow keys, aria-pressed; reduced motion off (base.css:15). |
| SHELL-14 | Folds that remember | FOUND | e.g. Home "More on Home" (`np2.fold.homemore`, home.js:123). Meta folds wait for their pages. |
| SHELL-15 | "Details" buttons | NOT REBUILT YET | Used on Ratings and This Week only. |
| SHELL-16 | Sample-size labels | FOUND | Info sheet "early read" and "few games" (monsheet.js:11,50, basisNum), Home basisText (home.js:113). |
| SHELL-17 | First-visit welcome | FOUND | home.js:125-143 welcome card (cc2.welcomed). |
| SHELL-18 | What's new | FOUND | home.js:136-143 (cc2.seenNew / np.wnew, × dismiss). Content is still the Oct 28 list (05-home-data.js:34; old ODD-15). |
| SHELL-19 | Sample team | FOUND | "This is a sample team, here to show how NastyPlot works" + "Build your own" / Import (team.js:364, home.js:48). |
| SHELL-20 | Feedback and Report a mistake | MISSING | No fbOpen / fbMistake / feedback dialog / "Report a mistake" in v2 (grep); 53-feedback.js not in parts-v2.json. Footer "Send Feedback" (#feedback) opens Home. |
| SHELL-21 | Owner-only panels | MISSING | No renderFeedback / usageReport in v2 (grep). |
| SHELL-22 | Anonymous usage counting | MISSING | 51-usage.js not in parts-v2.json; no `track(` in v2 (grep). Invisible to players, but the owner loses the counts after the switch. |
| SHELL-23 | Account sync notices | FOUND | Shared 03-persistence.js (live take-in, "Updated from your other device", "Storage is full…", line 30,43); sync line on Saved Teams / My Box (team.js:116, box.js:50, worded for the public site). |
| SHELL-24 | Shared team links (#team=) | FOUND | team.js:272-300 V2.checkShared (decodeTeam, banner, Load / Not now, Undo). |
| SHELL-25 | Box links (#box=) | FOUND | box.js:148-153 V2.checkBoxLink. |
| SHELL-26 | Copy for Showdown | PARTLY | Present on Home event teams (home.js:151), cores (build.js:164), Battle (battle.js:64), My Team export. Missing: the manual-copy dialog when the clipboard is blocked; Home / cores / Battle just toast "Copy failed. Try again." / "Copy blocked by the browser" (My Team export selects its text instead, team.js:74). |
| SHELL-27 | Share card dialog | FOUND | team.js:242-265 Team Card / Poster / Sheet, Light / Dark, Save Image, Copy Team Link. This Week's image waits for that page. |
| SHELL-28 | Darkrai on empty screens | DROPPED | Cut by Sim (CLAUDE.md, Nov 11); empty My Team shows "Today's underdog" instead (team.js:227-238). |
| SHELL-29 | Loading states | FOUND | e.g. Build "Building from real winning teams…" (build.js:22); built-in data and shared cleaners load as today (parts-v2.json logic list). |
| SHELL-30 | Double-tap guard | PARTLY | Guard only on Suggestions' Apply and Quick add (sugs.js:106,157). Not on Load team, Use built team, Clear, Add from a sheet, Win / Loss (34-events.js TAP_ACT is not shared). |
| SHELL-31 | Keep your place | FOUND | V2.redraw keeps scroll and the focused control (shell.js:159-188). |
| SHELL-32 | Motion and effects | PARTLY | Reduced motion respected (base.css:15). Missing: page fade on switch, the ink "impact" flick on buttons (no `@keyframes` beyond two "breathe" pulses). Foil and Mega moments belong to Ratings / sheet. Unsure whether the fade was dropped on purpose. |
| SHELL-33 | Pokémon art and type colours | FOUND | V2.mon / V2.art (shell.js:4-22), type chips with --ty colours (11), today's TC fix applied (bridge.js:17). |
| SHELL-34 | A broken part never breaks the page | PARTLY | Shared `safe()` and data cleaners are kept (bridge.js:5; 05-data-clean.js). But a page's draw is not guarded: `P.draw()` runs inside V2.shell's template (shell.js:197) with no try, so one throwing page part blanks the whole app, header included. Battle guards its own plan and deeper read (battle.js:12,141). |

### D Meta page IDs (no deep check, as asked)

| IDs | Verdict | Note |
|---|---|---|
| RATE-01, RATE-02, RATE-03, RATE-04, RATE-05, RATE-06, RATE-07, RATE-08, RATE-09, RATE-10, RATE-11 | NOT REBUILT YET | Ratings page (RATE-10, 11 are retired today). |
| SHEET-01, SHEET-02, SHEET-03, SHEET-04, SHEET-05, SHEET-06, SHEET-07 | UNSURE | Not a Meta page in the new site: the Pokémon info sheet is already rebuilt (monsheet.js, "Info / Meta / Rating" tabs). Outside this audit; settle in the My Team / sheet audit. |
| META-01, META-02, META-03, META-04, META-05, META-06, META-07 | NOT REBUILT YET | Usage page. |
| SETS-01, SETS-02, SETS-03, SETS-04, SETS-05 | NOT REBUILT YET | Popular Sets (note: sugs.js:73 already links to #sets, which opens Home). |
| TOP-01, TOP-02, TOP-03, TOP-04, TOP-05, TOP-06, TOP-07 | NOT REBUILT YET | Winning Teams. |
| EVT-01, EVT-02, EVT-03, EVT-04, EVT-05, EVT-06, EVT-07 | NOT REBUILT YET | Events. |
| ARCH-01, ARCH-02 | NOT REBUILT YET | Archetypes. |
| WEEK-01 … WEEK-11 (11 IDs) | NOT REBUILT YET | This Week (WEEK-11's kind marker is site-wide; check it when Sets / sheet are audited). |
| TRACK-01 … TRACK-08 (8 IDs) | NOT REBUILT YET | Track Record. |
| METHOD-01, METHOD-02, METHOD-03, METHOD-04, METHOD-05 | NOT REBUILT YET | How We Calculate (footer and tip links already point at it and land on Home). |
| ABOUT-01, ABOUT-02, ABOUT-03, ABOUT-04, ABOUT-05 | NOT REBUILT YET | About & Legal (the "Show email" privacy rule must come with it). |

## Notes from the inventories (status only, not counted)

C-battle.md:

| Note | Status in the new site |
|---|---|
| DEAD-01 hidden opponent grid | Not carried (correct). |
| DEAD-02 `#oppClear` handler | Not carried. |
| DEAD-03 `[data-qlog]` | Not carried. |
| DEAD-04 pinned calc result | Calc not rebuilt; decide when it is. |
| DEAD-05 `[data-battle]` | Not carried. |
| DEAD-06 empty 24-matchup.js | Not in parts-v2.json (correct). |
| DEAD-07 `view==='battle'` | Not applicable (hash routing). |
| DUP-01 rzReadHtml x3 | Resolved: one V2.battleRead. |
| DUP-02 likely lead in 3 places | Resolved: one "Likely lead" tag on their six, plus Turn One's subtitle. |
| DUP-03 two speed lists | Speed Tiers not rebuilt. |
| DUP-04 two ways to log | Still two (Battle Log: always 4; Your Games: 0 or 2 leads) plus replay; shapes still differ. Not a regression. |
| BROKEN-01 recent opponents lost when signed in | Fixed in shared persistence (03-persistence.js:18,23). |
| BROKEN-02 switch visible on desktop | Gone (tabs). |
| BROKEN-03 verdict words | Fixed (35-win-model.js:174 Favoured / Even match / Unfavoured). |
| BROKEN-04 "Dangerous / Manageable" | Still there (matchups.js:70). |
| UNSURE-04 Count abilities | Battle's Deeper Read now uses battlePlan's own plan; the hidden `#useAbil` is kept checked (body.html). |
| UNSURE-05 logged games change Build for Me | Still applies (22-auto-build.js:49 personalAdj is shared). |
| UNSURE-01, 02, 03, 06, 07, 08, 09 | Not re-tested here (look-only); UNSURE-09 copy button present (battle.js:24). |

D-meta-shell.md (shell-related only): BROKEN-01 "Data as of" invisible: fixed (footer). BROKEN-02 page title: no title shown or set
(no loss). BROKEN-03 two theme controls: resolved (one button), but Auto is gone (THEME-02). BROKEN-04 last page never used: fixed
(address keeps the page). BROKEN-10 search gaps: still open, wider (JUMP-05). DUP-12 two source lists: the footer now has none
(SHELL-06). ODD-15 stale What's New: still Oct 28. BROKEN-13 Claude-only Usage message: Usage not rebuilt.

## MISSING and PARTLY, most important first

1. **SHELL-06 / SHELL-20 / NAV-03 (routing): footer and tip links open Home.** "How We Calculate", "About", "Send Feedback" (shell.js:198)
   and every tip's "How we calculate →" (sugs.js:167) go to unregistered pages, so they land on Home. Footer also lost the tagline,
   the full trademark disclaimer, Sources and credits, Privacy and Contact (legal/credit text the public launch needs).
2. **SHELL-04 data health note and SHELL-05 regulation banner: MISSING.** Home is rebuilt without them, so stale data and the Reg M-D
   switch are not flagged anywhere ("live is protected" depends on players being told).
3. **NAV-03 ⋯ menu: MISSING.** No single place lists every page; Theme Auto is unreachable; pages like Compare, Saved Teams, All
   Suggestions are reachable only from inside My Team.
4. **SHELL-20 feedback / Report a mistake: MISSING**, and SHELL-21 owner panels, SHELL-22 usage counting: MISSING (53-feedback.js and
   51-usage.js not shared).
5. **BATTLE-02 their six entry: PARTLY.** Megas can't be typed in (build.js:19 `!p.m`); no ↑/↓; suggestions lack types / Box /
   share and usage ranking.
6. **BATTLE-01 head: PARTLY.** Team name vs archetype gone from the head; player name never shown; from Home's event prep it reads
   "Vs Challenger" with no event (home.js:152 + battle.js:8).
7. **SHELL-34: PARTLY.** No guard around a page's draw (shell.js:197): one error blanks the whole site.
8. **JUMP-02 … JUMP-05 search: PARTLY.** Only the 5 main places are findable (not My Box, Compare, Saved Teams, All Suggestions,
   cores); no ↑/↓; empty search lists nothing; no ratings on Pokémon rows.
9. **THEME-02: PARTLY.** No Auto (follow device / Claude app) after the first tap; no live follow of device changes.
10. **BATTLE-06 / SHELL-26 Copy for Showdown: PARTLY.** No manual-copy dialog when the clipboard is blocked (matters inside the Claude
    app and on some phones).
11. **LOG-06: PARTLY.** "Have a Showdown replay? Paste its log" link missing from My Team's Your Games.
12. **LOG-03: PARTLY.** Recent battles don't show who you played or the "(leads)" mark.
13. **SHELL-30 / X-06 double-tap guard: PARTLY** (only on Apply and Quick add; Win / Loss could be logged twice by a fast double tap:
    my guess, not tested).
14. **SHELL-01: PARTLY.** No favicons; no `claude:viewport-fit-sides`.
15. **NAV-01: PARTLY.** No "x/6" beside My Team. **NAV-02: PARTLY.** No Claude-iPhone host-cut lift (unsure if still needed).
16. **SHELL-09: PARTLY** (link dead-ends, see 1). **SHELL-10: PARTLY** (no site × in search boxes; Firefox shows none).
17. **SHELL-32: PARTLY** (no page fade / tap flick). **X-03: PARTLY** (open tab not remembered).
18. **SHELL-12 / X-08: PARTLY** (" · " kept instead of commas) and **SHELL-11: PARTLY** (no site-wide More / Less): both look like style
    choices for Sim to confirm, nothing hidden or lost. **X-09: PARTLY** (no ↑/↓, same as BATTLE-02).

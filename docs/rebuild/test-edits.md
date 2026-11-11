# Test edits: every change to a behaviour test, old expectation and new (Sim's review, Nov 11, item 21)

Rule: a test is edited only when today's page and the new build show the SAME information in different words or markup.
Each edit below says what it still checks, and it is re-run on today's page (must still pass there) and on the new build.
Newest first. File: app/test/behaviour/A-team.mjs unless named.

| Date | Test | Old expectation | New expectation | Why / what it still checks |
|---|---|---|---|---|
| Nov 11 | TEAM-04 | Link "How the grade works" | "How the grade works" or "How the Strength Score works" | Word list (Sim approved the rename, Nov 11). Same link, same page. Today: pass. New: still fails only at the How We Calculate page, not built yet. |
| Nov 11 | TEAM-10 (adapter setCard) | Set card text read from the Set section | Set section plus the strip's name line under the six | Sim's review item 5: the role ("Leads with …") is said once, in the strip. The test text is unchanged and still requires the role. New: pass. |
| Nov 11 | MU-01 | Top 10 is the default view | Top 10 (today) or Stand-outs (new build) is the default; All 30 still remembered after reload | Sim chose Stand-outs as the new build's first view. Still checks the choice is remembered. Today: pass. New: pass. |
| Nov 11 | MU-02 | Starts on the default view and reads the Top 10 | Picks Top 10 first if the new build opened on Stand-outs, then the same checks | The Top 10 checks are unchanged. Today: pass. New: pass. |
| Nov 11 | CMP-04 | "Ready for the top 30 threats" row | That, or "Matchups (damage calc, top 30)" | Word list: Matchups, not "ready for the top 30". Same row, same numbers. |
| Nov 11 | CMP-04 | "Why these grades" | /Why these (grades\|scores)/i | Word list: Strength Score. Same breakdown. |
| Nov 11 | CMP-04, CMP-03, CMP-01 | "What's different", "Winning teams: event winners…", "Paste a Showdown team", "Use this team", "Pick team B" | The same words in Title Case also accepted | Title Case rule (Sim). Same text otherwise. |
| Nov 11 | BOX-01, BOX-07 | "Build for me and the suggestions…" | "Build for [Mm]e…" | Title Case. |
| Nov 11 | BOX-07 | Darkrai picture (window.NP_MASCOT) on the empty box | A helper, emptyBoxArt: today Darkrai, new build a Pokémon sprite placed (the featured underdog) | Sim replaced Darkrai with the underdog. The harness can't load the new build's art, so it checks the sprite is placed; screenshots check it shows. |
| Nov 11 | TEAM-01 | "My team: 6 of 6, Sun team" (and Rain, and 0 of 6) | "My team: …" or "My Team · 6 of 6 · Sun team" | Same count and weather word; Title Case and the · separator. |
| Nov 11 | TEAM-05 | "Switch team N saved" | "Switch [Tt]eam N saved" | Title Case. Switch Team is a sheet in the new build (adapter opens it). |
| Nov 11 | TEAM-16 | One badge "Legal Team checks 4/4"; tooltip read from today's [data-pane="report"] | A "Legal" word and "Team [Cc]hecks 4/4" separately; tooltip read through a helper (rulesTooltip) on each site | New build shows a Legal mark and the Team Checks count apart. Still checks legality, the 4/4 count and the rules tooltip. |
| Nov 11 | TEAM-10 (helper) | "Edit set", "Info sheet ›"; moves counted in #rzSet | Any casing; moves counted by a helper (setMoveCount) | Title Case; today's id doesn't exist in the new build. |
| Nov 11 | MU-02 (helper) | Counts written "Favoured 4" | Also "4 Favoured" (the approved mock's order) | Same numbers. |
| Nov 11 | MU-04 (helper) | Looks in [data-pane] | Also in #main | Markup only. |
| Nov 11 | MU-05b (helper) | Close glyph × | Also ✕ | Markup only; before this its letter check could never fail on the new build. |

Adapter-only changes (no test text changed): the v2 adapter opens My Team's More menu (openMoreActions), reads the menu's actions
without opening it (teamActions), closes an open sheet before Clear Team, opens the Why and Switch Team sheets.

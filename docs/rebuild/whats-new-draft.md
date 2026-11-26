# What's New at the switch to the new design: DRAFT for Sim (Nov 12, ~3:13 PM). Not in the code yet.

Sim agreed (Nov 12, 3:13 PM) that today's What's New list (Oct 28: "scouting report", "ready for the top threats", "No more win odds")
is replaced by a fresh entry when the new design goes live. Words follow the Nov 9 word list. Every item names something that exists
in the new build today (checked in app/src/v2/pages: team.js, box.js, home.js, matchups.js, sugs.js).

How it shows (unchanged rules, today's 53-feedback.js): once, on the first visit after the update; never for a first-time visitor
(they get the welcome card); × hides it for good. Folded: "What's New · 7 updates: A new look, Strength Score…".

| # | Title | Line |
|---|---|---|
| 1 | A new look | Every page is rebuilt: bigger Pokémon, clearer sections, and a day and a night mode (the sun and moon at the top). |
| 2 | Strength Score | Your team's number out of 100 says how strong the six is altogether, with its Matchups against the top threats right under it. |
| 3 | Team Sheet | Every set, nature and stat on one page. Copy it for Showdown or share it as an image. |
| 4 | My Box | Keep the Pokémon you own in one place; Build for Me and the suggestions can pick only from them. |
| 5 | A new Home | The latest winner's six beside yours, the meta right now, and today's underdog. |
| 6 | Back | The arrow at the top left takes you back to where you just were, one step at a time, right to the spot you were reading. |
| 7 | Feedback | Tell us what's off with Send Feedback at the bottom of any page. |

Added 6:39 PM (Nov 12): item 6 Back (Sim asked for the Back button at 5:42 PM; it shows only if he picks option A, the arrow). Folded line becomes "7 updates".

Open: the id becomes the switch date (e.g. '2026-11-xx-redesign'); the Feedback line names the new footer link ("Send Feedback").


## Updated draft, Nov 19, 11:43 AM (for Sim's review; replaces the table above when he approves; not in the code yet)
Checked against today's build (app/src/v2/pages): stampede*.js (Home), battle.js + calc.js + battle-pbp.js, dispatch.js + postroom.js,
events.js, team.js + six.js, box.js, shell.js (Back and Forward), feedback.js. Folded line: "What's New · 7 updates: A new look, …".

| # | Title | Line |
|---|---|---|
| 1 | A new look | Every page is rebuilt: bigger Pokémon, clearer pages, and day and night modes (the button at the top). |
| 2 | Strength Score | Your team's number out of 100 says how strong the six is altogether, with its Matchups against the top threats right under it. |
| 3 | A new Home | The whole herd: every rated Pokémon in one charge, sized by its rating, with your six and the tools below. |
| 4 | Battle | Start with the Damage Calculator, then scout their six and get a turn 1 plan that follows the game's rules. |
| 5 | News and Mystery Gifts | The latest Pokémon Champions news and the Mystery Gift codes in one place, each with a link to its source. |
| 6 | Team Sheet and My Box | Every set on one page to copy or share, and the Pokémon you own kept in one place for Build and suggestions. |
| 7 | Back and Feedback | The arrows at the top take you back and forward to the exact spot; tell us what's off with Send Feedback at the bottom. |

Unsure / for Sim: whether 'Events' (the Ticket Wall) earns its own line instead of 7; the id stays the switch date ('2026-11-xx-redesign').

## Final draft, Nov 20 (for Sim's yes; updated for the Arena and the KO Board)
| # | Title | Line |
|---|---|---|
| 1 | A new look | Every page is rebuilt: bigger Pokémon, clearer pages, and day and night modes (the button at the top). |
| 2 | Strength Score | Your team's number out of 100 says how strong the six is altogether, with its Matchups against the top threats right under it. |
| 3 | A new Home | The whole herd: every rated Pokémon in one charge, sized by its rating, with your six and the tools below. |
| 4 | Damage Calculator | A new calculator built like a battle: pick both Pokémon, see the hit, and check your six against the top 30 on the KO Board. |
| 5 | Battle | Scout their six and get a turn 1 plan that follows the game's rules. |
| 6 | News and Mystery Gifts | The latest Pokémon Champions news and the Mystery Gift codes in one place, each with a link to its source. |
| 7 | Back and Feedback | The arrows at the top take you back and forward to the exact spot; tell us what's off with Send Feedback at the bottom. |
Folded line: "What's New · 7 updates: A new look, Strength Score, …". Team Sheet and My Box are not new to players who used the old site,
so they drop out of the list (they still exist). id: the switch date ('2026-11-xx-redesign').

# Small touches before the quiet launch (Dec 2-3): shortlist v1. HH, Thu Nov 26 (time: 12:40 AM (12:40:08)  date: Thu Nov 26, 2026)
Source: design6 c062acf1 built with real data, first-screen shots of 8 pages at 1440x900, 1280x720, 390x844 (light), plus a
measuring pass (sideways overflow, clipped text, page height in screens). Script: scratchpad touch-shots.mjs. Pictures in pics/touch/.

## To fix (each small, each needs before/after pictures under HH's design authority)
1. **My Team, 1440: "Saved ✓" sits alone on a second row** under five buttons (rule 13: no lone tiles). Checked: team-1440 picture.
   Idea: show Saved as a state on the Saved Teams button ("Saved Teams 1 ✓") instead of its own button, so the row is one line.
2. **My Team, 1440: "Kowtow Cle..." is cut in its move pill** (Kingambit). Checked: same picture. Idea: long move names drop one type
   step in the pill (fit, not ellipsis), as the name plates already do.
3. **Speed Tiers, 1280x720: the controls fill the first screen**; the track starts at the bottom edge. Already planned ("Speed Tiers
   1280 two-row", helper's next job). Checked: speed-1280x720 picture.

## Looked at, not a problem (checked how)
- Meta and Pokémon pages on a phone: the top-5 strip and the forms row run past the edge on purpose (overflow-x:auto scrollers,
  measured). The cut-off #5 is the hint to swipe. Worth asking Sim if he finds it obvious on his iPhone.
- "vh" clipped text in the measure = screen-reader-only labels, by design.
- News "Next event": correct with real data (Stuttgart Regional, Nov 28-29, in 2 days). Not checked: that the live refresh task stores
  meta/calendar (it's in META_KEYS); check in Saturday's refresh-task step.

## Page heights (screens; caps: 3 tools/lists, 4 Home/Pokémon/This Week/Meta at 1440x900)
1440x900: Home 4, Meta 3.8, My Team 3, Pokémon 3.2, Speed 2.9, This Week 1.2, Track 1.1, News 2.4 (all within caps).
1280x720: Meta 5, Home 4.8, Pokémon 4.2 (rule is set at 1440x900; noted only). Phone: Home 7.6 (tablet/phone Home is Job C).

## Pass 2 (dark, 1440x900 + 820x1180; Home, Meta, My Team, Pokémon, News, Build, Calc, Events, Gifts)
- No sideways scroll anywhere, no visible clipping; dark mode looks clean in the shots (checked: d-*.png in scratchpad/touch).
- FIXED on local branch touch-moves (not merged yet): My Team move pills, item 2 above. All 510 moves fit at 1280; new v2-minors check.
- Build, winning teams: boxes measured past the edge are the CLOSED "Full sets" panel (<details>, build-plot.js:170): laid out but
  not painted. Opened, it fits at 1440/1280/820/390 (right edges 1329/1169/757/359). Not a problem (checked: ov5.mjs).
- Heights at 820x1180 (dark): Home 6.4 (Job C proposal takes it to 4.8), Pokémon 4.2, Meta 3.9, others under 3.5.

## Not yet looked at
Battle, Practice, Search results, 1024x1366, odd widths (1100, 1180).

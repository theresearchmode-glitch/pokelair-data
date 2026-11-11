# Design reference set, Nov 11: night mode onward

For the session doing the rebuild. Sim reviewed these directions in a separate design chat and asked for them to be handed over as one set. Everything here is a picture plus the rule behind it; nothing in `app/` or the existing mock-ups was edited.

## How to use this

- The pictures show intent. The rules and values below are what to build from.
- Values are starting points taken from the mock-ups. None has been checked on a real phone, on iPad, for scrolling speed or for contrast. Measure before adopting, as the design system already requires.
- Where this set disagrees with `docs/rebuild/design-system.md`, Sim chose the version here, in conversation. Each such point is listed under "Changes to existing rules". Confirm with her if anything is unclear.
- The exact CSS used is in `source/`. Those scripts apply overrides to a copy of `docs/rebuild/mocks/out/myteam.html` at commit `082cc7b`, or build new pages from `docs/rebuild/mocks/tokens.css`. They run on Sim's PC only (they borrow Playwright from another checkout) and are here to be read, not run.

## Status of each piece

| Piece | Pictures | Status |
|---|---|---|
| My Team, day and night, desktop and phone | `myteam-*.webp` | Ready as reference |
| Ratings page | `ratings-*.webp` | Ready as reference for layout and behaviour |
| First visit to My Team (no team) | `first-visit-*.webp` | Ready as reference |
| Shareable result picture | `share-picture-*.webp` | Direction; night version preferred; needs a web address and tighter rows |
| Weather follows the team | `weather-*.webp` | Direction only. Sun is closest. All four need a moving test |

Not drawn in this language yet: Home, Battle and the calc, Build, the info sheet, iPad.

## Decisions Sim made in the design chat

- Shady Paw is cut. `CLAUDE.md` still describes him as the chosen mascot; ask Sim before changing that file. Empty screens use a featured Pokémon and one line of copy instead (see First visit).
- Fonts stay: Unbounded for headlines at 15px and up only, Instrument Sans for everything smaller. Inter was only to be tested if Instrument Sans numbers disappoint.
- Glass: frosted top bar, jump bar and team dock only. The info sheet surface stays solid; the page behind it stays lit and softly blurred, not dimmed dark.
- The blue pool behind the Strength Score is removed.
- The red bracket around the selected Pokémon is removed (see section 5).
- Weather that follows the team is wanted as a feature.

## Changes to existing rules

- `--pick` pink is no longer the selected Pokémon's cursor or name colour. Selection is the tilted panel.
- Dusk tokens are replaced by the night values in section 6.
- "Borrowed-colour limits" becomes a stricter rule: normalise, don't just clamp (section 1).
- The score lockup has no light of its own (section 2), in place of the three score treatments being compared.

## 1. Borrowed colour is always normalised

A Pokémon's art colour is never used raw for floor pools or panels. Keep its hue, set saturation to at least 72% and lightness to 56%. Without this, pale colours vanish on the day page and strong ones shout. This was a real bug in an earlier mock-up: only Garchomp and Basculegion showed colour.

| Pokémon | Raw | Normalised |
|---|---|---|
| Garchomp | 247,95,72 | 246,67,40 |
| Mega Charizard Y | 244,146,2 | 253,164,32 |
| Sneasler | 176,201,232 | 62,134,224 |
| Whimsicott | 241,226,173 | 224,188,62 |
| Basculegion | 232,12,114 | 244,42,135 |
| Kingambit | 226,191,92 | 224,181,62 |

Side effect: Whimsicott and Kingambit come out nearly the same gold.

## 2. Score: no light behind the number

No pool and no team-light behind the Strength Score, in either mode. Blue appears only in the band words.

## 3. The six stand on a shared floor (desktop)

- A 1px floor line at the feet, fading at both ends, with a soft spill below.
- The Bench divider is removed on desktop.
- Phone: two rows, so no floor line; each Pokémon has only its own pool and the Bench divider stays.

## 4. Each Pokémon is grounded in its own colour

- Day: a tight dark contact shadow inside a small pool of the normalised colour (about 62% at the centre), and a soft drop shadow down and to the right.
- Night: no shadow. A small tight pool of the normalised colour as light (about 90% at the centre) and a thin light rim on the art.
- The glow behind each Pokémon is turned down (day about 10%, night about 20%).

Principle: by day the Pokémon cast coloured shadow, at night they cast coloured light.

## 5. Selected Pokémon: the tilted panel

- No bracket, no coloured name. Name in ink, weight 800.
- The selected Pokémon stands on the tilted colour panel (skewY -7deg, 6px corners) in its normalised colour, scaled up 8% from its feet.
- Day panel: 90% to 55% of the colour, lit top edge, layered soft shadow.
- Night panel: 78% to 34%, lit top edge, faint outline, soft glow of the same colour beneath.
- Same panel as the Set section. The blue slanted bar is for navigation only.

## 6. Night mode: the same room at night, lit by the Pokémon

- Background: deep ink with a hint of blue-violet, darker at the top (#0C0C14), lighter around the floor (#191928), settling to #12121B. Fine grain at about 5%.
- Tokens: bg #12121B, surface #1D1C29, wash #201F2D, ink #E4E0DA, ink-2 #C4BFCB, ink-3 #B0AAB8, rule 10% light, good #74D3A0, mid #F0C768.
- Score number #D6D1CA. Band words #62BEF7 with a faint glow.
- Plates, chips, secondary buttons: raised dark surface (#3E3D56 to #2C2B3D) with a lit top edge. No cream slabs.
- One blue action per screen (Save Team; "Try the sample team" on first visit): #63C0F8 to #3FA2E2, dark text. On phone 44px tall and calmer (#4FAEEC to #2F8ACB).
- Outline buttons: border at 42% light.
- Headlines weight 800; small labels one step brighter.
- Set panel: as section 5, rays at 30%, rim light on the art.

## 7. Day mode

Sections 1 to 5 apply. Fine grain at about 3.5%. Save Team stays a black plate.

## 8. Ratings page

- Pointing at a row (or tapping it on touch) brings that Pokémon up in the left column: large on its panel, with Base Speed, On teams, Win rate and links to the info sheet and Build. Nothing pops up over the table.
- Search is a real field in the header on desktop, with a keyboard shortcut.
- Rows: rank, art on its pool, name with type chips, a slanted rating bar with the figure, On teams, Win rate. Figures are tabular; units small.
- "On your team" mark under the name for Pokémon in the current team.
- Team dock along the bottom: team name, score and band, the six, "Open My Team". Frosted. Proposed for every page except My Team itself.

Data problem to fix first: this page reads Garchomp as 85 from `out/ratings_log.json`, while the My Team mock-up shows 92. One ratings source is needed before any of this ships.

## 9. First visit to My Team

- No score is shown without a team.
- Six empty slots on the floor (dashed tilted outlines, Lead / Back / Bench labels).
- Three ways in: "Try the sample team" (main action), "Paste from Showdown", "Build from scratch".
- A plain note: saved on this device only, no account, name or email.
- "Or start from a winner": today's six highest-rated Pokémon, each a way to start a team.

## 10. Shareable result picture

1200 by 630. Logo, tagline, team name, score, band, rank line, the six on their pools. No player names. Needs the site's web address once there is one.

## 11. Weather follows the team

One layer behind the top of the page, chosen from the team's style. All effects stay clear of the score text and fade out before the working area.

- Sun: warm light from the top right in a few soft shafts; floor line warms.
- Rain: cool cast, fine slanted streaks behind the six only, and a wet floor that reflects the Pokémon.
- Trick Room: violet cast and a grid receding across the floor under the six.
- Tailwind: teal cast and long thin streaks at the brand slant, behind the six only.

Open points: all four are stills of something meant to move, so each needs a motion test and a scrolling-speed check; "reduce motion" must turn movement off; sand, snow and terrain are not drawn; a team with two styles (the sample is Sun and Tailwind) needs a rule for which wins or how they combine. In the pictures only the style line was changed to illustrate each state.

## Things raised but not drawn

- The art travels from a list into the info sheet when opened.
- Type colours redrawn as one set tuned to the palette; one chart style; one icon set.
- Rays kept for the Home hero only.
- A compact view for desktop.
- Shareable link per team, and a real web address per Pokémon.
- Art and name ownership for a public site needs a real answer before January.

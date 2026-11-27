# Pre-switch sweep (Job EE), Thu Nov 26, 2026, 8:10-8:45 PM Eastern

**Verdict: no blockers found.** Three cosmetic items, listed below. Report only: nothing in the code was changed.

## What was swept

**The build**
- Exactly what goes live at 8:30 AM: origin/alt/f3-claude ba95fd61, built the live artifact's way:
  `cd app && node build.mjs --v2 --art=v2art/ --one-art-size --split`.
- Today's data: out/ from origin/main e7e2ad16, restored afterwards and never committed.

**How it was served**
- Over http, so the fonts load: index.html, v2.js, fonts/, v2art/.
- The data came from a db stub that answers like the live artifact after the step-7 refresh. It is the same stub as Job T's dry run (t-scripts/mkinit.cjs). It covers 18 meta documents, post and info included.

**Pages (12)**
- Every place in the top and bottom bars: Home, Build, My Team, Battle, Meta, My Box.
- Also: Pokémon page (Garchomp), Track Record, Search (open), Spicy picks on (Suggestions' Adjust fold opened, then the toggle tapped), How We Calculate, About.

**Devices and themes**
- WebKit: iPhone 15, iPhone SE, iPad Pro 11 portrait, iPad Pro 11 landscape.
- Chromium: 1440x900 and 1280x800.
- Each in light and dark: 144 page loads.

## Automatic checks (all 144 loads)

| check | result |
|---|---|
| console errors / page errors / failed requests | 0 |
| sideways scroll | 0 (at 1440/1280 the 15px gap is the scrollbar gutter) |
| broken pictures | 0 |
| text past the screen edge | 0 |
| text cut inside its box | only screen-reader copies (1px clipped boxes), checked one by one: Team's "Suggestions/Matchups/Team Checks/Your Games", Meta's "Jump to", Track Record's "Biggest Hits/Misses"; About's license box scrolls by design |
| Home h1 | "Sharply raise your win rate. Rate your Pokémon Champions team before Reg M-D." on every device |
| Reg wording | correct for today (before Dec 2): current data says Reg M-C; Home says "before Reg M-D", "Reg M-D in 5 days", "M-C ends Dec 2, 1:59 AM", stamp "Reg M-D · Dec 2" |

**One tap on each page's main button**

| page | button | result |
|---|---|---|
| Home | Score My Team | My Team |
| My Team | Plan It in Battle | Battle |
| Battle | Enter Their Six | sheet opens |
| Meta | Pokémon Page | Sneasler's page |
| Track Record | See How We Rate | How We Calculate, rating |
| My Box | Swap into My Team | sheet opens |
| How We Calculate | Check the Receipts | Track Record |
| Spicy | Plan It in Battle | Battle |
| Build | Hatch It | the plot is built (#main grows from 30k to 46k characters, no errors) |
| About | first fold | opens and closes |
| Pokémon page | Use This Set | toast "Garchomp is already on your team": correct, the sample team has him |

- One Spicy tap at 1440 dark gave "element not attached". The page redrew as the spicy list arrived. A retry tapped fine, on both engines.

## Problems found (page, device, what, how bad)

1. **Home, iPhone SE (320 wide), light and dark: "Reg M-D." breaks across two lines** ("…team before Reg" / "M-D."). **Cosmetic.**
   - Fix after the switch: a non-breaking space in "Reg M-D" (and "Reg M-C") in V2.f3Words.
2. **Search, iPhone 15 and iPhone SE: the search box placeholder is cut** ("Find a Pokémon, move, item, team s…"). **Cosmetic.** Fix after the switch: a shorter phone placeholder.
3. **Spicy picks on, every device:** the sample team shows "No rare pick keeps this team's Strength Score right now." Not a bug: an honest empty state for the sample team. Listed so nobody is surprised.

Nothing found at iPad portrait, iPad landscape, 1440x900 or 1280x800 beyond the above.

## Pictures

- docs/rebuild/pics/nov27/preswitch-sweep/: 144 first-screen pictures (`<device>-<theme>-<page>.jpg`), labelled; problem pictures have a red band. Plus 12 contact sheets (`sheet-<device>-<theme>.jpg`).
- Checked by eye: the contact sheets for iPhone 15 light, iPhone SE dark, iPad landscape light and 1440 dark, plus single pictures.

## Not checked

- Real devices.
- The real window.claude storage: a stub with today's out/ stood in for it.
- Logged-in or saved-team states beyond the sample team.
- The live artifact's file count and upload (switch-plan.py): that is runbook step 6.

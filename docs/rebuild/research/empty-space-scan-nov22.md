# Empty-space scan of the new site (hE2, look-only, Sun Nov 22, 2026, written 8:39 PM by the clock)

Why: Sim found My Team at 1440 with its right half empty ("I HATE EMPTY SPACES FOR NO REASON. THAT IS A MAJOR RULE").
This scan looks for the same thing on every route of the new site. No site code was changed.

## How it was checked (so the numbers can be trusted, and where they can't)

- Build: worktree at HEAD 10bb10c3 with `out/` from 0c992f69, `node app/build.mjs --v2 --preview-data --art=../src/v2/art/`.
  **Deviation from the brief:** the brief's build had no `--preview-data`; I checked it first and the data pages were empty
  (Winning Teams showed only "Top teams appear here after the next data refresh."), so every data page would have scanned as
  "empty". The scan below uses the Preview's data (saved copy from Nov 9), as the Preview does.
- Widths 1280x800, 1440x900, 1920x1080, day theme, first visit (the sample team loads on its own), 3 s per page (6 s for My Team),
  then a scroll through the page to wake late-loading parts.
- Measure (scratchpad script, not committed): content column = x 96 to (window - 96), the site's frame on every page.
  "Ink" = visible text lines, images, SVG, canvas, controls, small coloured shapes; content hidden in closed folds is skipped
  (`checkVisibility`; an early run counted the About page's closed "Where the data comes from" text as content and missed its gap).
  The page is cut in 20px bands above the footer; in each band the largest empty run across the column is found (16px kept around
  ink). **Flag** = an empty run of 40%+ of the column for 300px+ in a row. **Minor** = 30%+ for 200px+.
  Grid/flex rows: a last row with fewer items than the row above and 25%+ of the row empty.
- Then I looked at every flagged place myself (screenshots below) and judged it. Several flags were wrong (see "Checked and dismissed").
- What it can't see: empty space inside a card whose own background fills it (only partly caught), dark theme, other widths,
  open folds and other tabs/states (see the end).

Pictures: `docs/rebuild/pics/nov22/empty-scan/` — `<page>-1440.png` full page with the flags drawn on (red E = flag, orange M = minor,
blue G = half-filled row), plus extra pictures at the width where a problem is worst (`team-1920`, `events-1280`, `about-1920`,
`gifts-1920`, `archetypes-1920`, `weekly-1280`, `pokemon-Garchomp-1280`, `not-found-1280`, `gauntlet-1280`, `speed-1920`).

## Ranked list, worst first

| # | Page | Width | Where | How big (px, % of content column) | Verdict | Fix idea |
|---|------|-------|-------|-----------------------------------|---------|----------|
| 1 | My Team (and #sheet, same page) | 1920 | Whole page | Page capped at 1180 wide (x 96-1276) while every other page runs to x 1824: right ~550px (29% of window) empty for the full ~3300px. Flags: hero 880x440 (51%), beside Suggestions 757x320 (44%), more minor ones down the page | **Real waste.** Being redesigned now (HH), so brief | Use the site frame (96 to w-96); two-up the steps at 1280+ |
| 1b | My Team | 1440 / 1280 | Beside "The upgrade and the plan" (Suggestion 1, Optional swaps) | 644x240 (52%) at 1440; 484x260 (44%) at 1280 | **Real waste** (the spot Sim found) | Same redesign |
| 2 | Events (Meta > Events) | 1280, 1440 | Hero: intro text and the 115 / 107 / 8 numbers are squeezed into a ~70-90px column on the right, 1-2 words per line; left under the headline empty | 757x360 (70%) at 1280; 621x300 (50%) at 1440. At 1280 the side text runs to the window edge | **Real waste**, and the side column is a layout break (unreadable word stack) | Put intro + the three numbers in a row under the headline (as This Week and Winning Teams do), or give the side column 300px+ |
| 3 | About | 1440, 1280, 1920 | Right column under "The fine print": the accordion list ends ~y 1220, the receipt runs on to ~y 1650 | 625x400 (50%) at 1440; 466x260 (43%) at 1280; 1920: ~700x420 under the list, and the accordion rows themselves are ~700px wide with short titles (flag 707x820, 41%) | **Real waste** | Show the 9 sources (now hidden in the "Where the data comes from" fold) as an open list under the fine print, or move "Your name or email: NEVER" beside it |
| 4 | Weekly (This Week) | 1280 (1440 minor) | Hero: headline wraps to 4 lines ("This / week, / who / moved."), the numbers and Share button sit mid-right, right top empty | 691x300 (64%) at 1280; 681x220 (55%) at 1440 | **Partly waste** (some is headline air; at 1280 the 4-line wrap makes it tall) | Lift the numbers + Share button to the top of the right side, or keep the headline to 2-3 lines at 1280 |
| 5 | Pokémon page (Garchomp) | 1280 | Hero: right of "The file on Garchomp." until the summary column starts at ~y 520 | 469x440 (43%) | **Partly waste** (headline air, but 440px tall) | Start the summary / "How to build it" column level with the headline |
| 6 | Gifts | 1920 (1440 minor) | Hero right: headline + 3 numbers on the left only | 857x380 (50%) at 1920; 377x380 (30%) at 1440 | **Hero air at 1440; waste at 1920** | At 1600+ put the first coupon ("Waiting at the counter") beside the hero |
| 7 | Archetypes | 1920 (1280 minor) | Hero right | 828x300 (48%) at 1920; 397x220 (36%) at 1280 beside "Your team's style" | **Hero air at 1440; waste at 1920** | At 1600+ put "Your team's style" (52% / 41% + Open your playbook) beside the headline |
| 8 | Not-found page (and #owner, same page) | 1280 | Torkoal card drops under the headline; right side empty | 440x600 (40%) | **Real waste** at 1280 (at 1440 Torkoal sits beside the headline and it's fine); short page | Keep the Torkoal card beside the headline down to 1280 |
| 9 | Speed Tiers | 1440, 1920, 1280 | "The fine print" + "Plan turn one" at the bottom: one narrow text column | 520x260 (42%) at 1440; 1000x240 (58%) at 1920; 360x260 (33%) at 1280 | **Real but small** | Two-up the fine print text, or put the button beside it |
| 10 | Compare Teams | 1280, 1440 | Inside the Team A card: sprites at the top, empty bottom because the Team B list beside it is taller | 575x220 (46%) at 1440; 495x280 (45%) at 1280 | **Real, inside a card** | Fill Team A's card with its Strength Score / 4 checks, or top-align both and shorten Team B |
| 11 | Build | all three | "The accomplices / Why it works / Got a Plan B?" before a plot is made: three empty dashed boxes, Torkoal note, two headings with "waiting for your plot" | 411x200 middle (33%) at 1440; 891x200 (52%) at 1920; 565x200 (52%) at 1280 under the step columns | **Intended empty state, but costly** (~300px of near-nothing on screen 2) | Fold the three waiting sections into one line until there's a plot, or show the sample plot in them |
| 12 | Hero bands at 1920 (Battle, Team Preview Practice, Damage Calc, Feedback, Compare, About, Speed) | 1920 | Right of the hero headline, 200-220px tall | Battle 889x200 (51%), Practice 964x220 (56%), Calc 1115x200 (65%), Feedback 795x200 (46%), Compare 819x200 (47%), About 1080x200 (63%), Speed 808x220 (47%) | **Mostly intended headline air** (under 300px) but the same pattern on 7 pages at 1920 | Optional: at 1600+ let the hero carry a small facts panel, as Meta and Usage already do |
| 13 | Home | 1440, 1920 | Dark "Call six out of the herd" band: right of the heading, above "Walk in with a turn 1 plan" | 723x220 (58%) at 1440; 1101x240 (64%) at 1920 | **Headline air**, low | Optional: raise the right-hand plan card to the band's top |
| 14 | Small hero/side gaps | various | Method 1440 under the "How to read our numbers" card 483x200 (39%); News 1440 hero right 407x340 (33%); Types 1920 hero right 523x340 (30%); Track 1280 hero right 413x240 (38%); Sets 1920 middle 614x200 (36%); Calc 1920 beside the KO board / button row 644x220 (37%); Pokémon 1920 two right gaps 552x360, 654x280 (32-38%); Gauntlet hero right 30-34% | All under the 40% / 300px line | **Minor / breathing room** | None needed now |

## Checked and dismissed (flags that were wrong)

- **Test Run (gauntlet) 1280:** right column 419x1240 (39%) empty beside the long results list in the full-page picture. The pink side
  card (`.dr-side`) is `position: sticky` (top 96px), so in use it follows the scroll and sits beside the list: **not seen as empty**.
  Side note, not checked further: at 1280x800 that sticky card is 1001px tall, taller than the 800px window, so its bottom
  ("Set as opponent") is below the window while it is stuck. Worth a look.
- **Half-filled rows** flagged by the grid check, all looked at: About's "Free / No ads / Fan-made / Unofficial" chips (one chip sits a
  few px lower, read as a 2nd row; it's one row), Box `.bx2` (the page's own 3-part layout, not tiles), Compare `.cmp-pick` (list rows),
  Damage Calc `.pc-board` (the three items sit in one row), the blue-word sentences (`k-sent`) on Speed / Calc / Feedback (sentences
  that wrap, as meant). Build 1280 "Partners in crime" `.pl-core` rows: not empty, the opposite: names wrap to 4 lines (cramped).
  Meta 1280 hero facts (`gs-facts`): one fact wraps to a 2nd line, 216px; trivial.
- **No real lone tiles or half-filled tile rows were found** on the scanned states.
- Footer: an early run flagged the footer's middle gap; the footer is now left out.

## Not checked

- Dark theme; widths other than 1280 / 1440 / 1920 (odd widths like 1366, 1600, 2560); phones and tablets.
- Other states: open folds, other tabs and toggles (Ratings list view, Usage sources, Sets other Pokémon, My Box with a real box,
  #team-empty, a player's own team, the sheet on other Pokémon), hover states, Build after a plot is made.
- Live data (this used the Preview's Nov 9 saved copy; pages with more or fewer rows may differ).
- Empty space inside cards is only partly caught (a card's own background hides it from the measure; Compare's was found by eye).

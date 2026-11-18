# My Team: phone length (np-a1) and desktop columns (np-cols), options for Sim

Helper, written 9:03 PM Tue Nov 17, 2026 (clock: `bash docs/rebuild/now.sh`).
Look-only. No site source changed, nothing committed. Every option is a mock applied in the browser
(page.evaluate / injected CSS) on a `node build.mjs --v2 --preview-data` build of claude/design6 at 7a0d532e,
served over local HTTP so the fonts load. Sample team (Sun Tailwind), 2x pictures.

Scripts (scratchpad, not in the repo): `mt2/phone.mjs`, `mt2/cols.mjs`, `mt2/mock.js` (all option pieces),
`mt2/overview.py`, `mt2/pairs.py`, `mt2/colpic.py`.

## 1. np-a1: My Team on a phone (390 x 844)

### Where the length goes today (measured, 390 x 844, sample team, folds as they open by default)

| Part (top to bottom) | px | screens |
|---|---:|---:|
| Site top bar | 60 | 0.07 |
| Name band, Strength Score, score line, links, 4 buttons | 538 | 0.64 |
| **The Hand** (Lead / Back / Bench, two Cards each) + **editing panel open on Card 1** | **1,416** | **1.68** |
| ...of which the editing panel | 409 | 0.48 |
| Game Plan line | 147 | 0.17 |
| Matchups / Suggestions / Team Checks jump tabs | 77 | 0.09 |
| **Matchups** | **1,033** | **1.22** |
| ...of which the 8 Stand-Out Cards (two across) | 654 | 0.77 |
| Suggestions | 666 | 0.79 |
| ...of which Adjust Suggestions (open) | 259 | 0.31 |
| ...of which the 3 links, stacked | 156 | 0.18 |
| Team Checks + Things to Know | 284 | 0.34 |
| Your Games | 178 | 0.21 |
| Footer | 377 | 0.45 |
| **Whole page** | **4,776** | **5.66** |

Measured: the rows add up to the page height (4,776). Tallest parts: the Hand (1.68 screens), then Matchups (1.22).
Target about 4 screens = 3,376 px.

### The options (nothing removed; every feature stays, at most one tap away)

- **A: folds.**
  1. The editing panel stays shut until a Card is tapped. It then opens under that Card, as Sim chose on Nov 17 (B).
     A line "Tap a Card to edit it" sits by Lead.
  2. Adjust Suggestions folds. Its closed line shows the current settings
     ("Box + Catch · 2 Megas · Swap Mega: No · Abilities: Yes").
  3. Your Games fits on one line. Its note moves behind a "?" tip.
- **B: side by side.**
  1. The Hand goes three across (Lead | Back | Bench, as on desktop), with each group's two Cards stacked.
  2. Stand-Outs go four across. Phones 405-699 px wide already show them this way.
     "Mega" gets its own line on every Card, so the verdicts line up.
  3. The three Suggestions links sit in one row.
- **C: A + B.**

### Measured page length (screens; px in brackets)

| Width / team | Today | A folds | B side by side | C = A + B |
|---|---:|---:|---:|---:|
| 320 sample | 6.16 | 5.31 | 6.25 * | 5.40 |
| 360 sample | 5.89 | 5.11 | 4.98 | 4.25 |
| 375 sample | 5.73 | 4.92 | 4.91 | 4.15 |
| **390 sample** | **5.66 (4,776)** | **4.88 (4,117)** | **4.82 (4,066)** | **4.09 (3,453)** |
| 430 sample | 5.28 | 4.52 | 4.72 | 4.02 |
| 390, 5 of 6 (team being built) | 5.50 | 4.82 | 4.90 | 4.27 |
| 390, six long names | 5.46 | 4.71 | 4.90 | 4.21 |

\* At 320 the B pieces switch off: three across is too tight below 360. Only the "Mega on its own line" piece stays,
and it adds 75 px. If B were built with that piece limited to 360+, 320 would match today. That is my guess, not measured.

Where the savings come from at 390 (measured, px):
- A: editing panel −425, Adjust fold −177, Your Games −57.
- B: Hand −372, Matchups −235, links −104.

### What each option costs (checked in the pictures)

- **A:** editing is one more tap away. The hint line tells new players that Cards are tappable.
  The Your Games note is behind a "?", so it is still there but no longer visible at first.
- **B, the Hand three across:**
  - Cards are about 106 px wide instead of 171. The sprites are smaller but the Cards still read boldly.
  - Some long names run past the Card unless they are squeezed sideways to fit.
    - At 360: Basculegion.
    - At 390 with long names: Squawkabilly (Yellow), Mega Crabominable. They ran 2-12 px past the Card.
    - The mock squeezes them. A real build needs the same name fit.
  - Three-line names (Paldean Tauros (Combat)) cover part of the sprite.
  - **Conflict with Sim's Nov 17 choice B:** with three columns, the editing panel opens under the whole Hand, not right
    under the tapped Card. Sim needs to decide this.
- **B, the links row:** "Never Suggest ›" fits on one line and the other two links take two lines,
  so the row is slightly uneven. Small, but Sim notices these.
- **Tried and dropped** (checked: the text breaks the boxes):
  - The 4 header buttons in one row of three ("Share as Image" touches the slanted edges at 390).
  - The Matchups view switch in one row of four ("Top 12 Grid" wraps; "Stand-Outs" touches the edge).
  - Each saved only 44-56 px.

### Recommendation (phone)

**C.** Only C gets close to the target: 4.09 screens at 390 and 4.02-4.27 across 360-430 and the three team states.
It keeps every feature and the big bold Cards. Its one open question is where the editing panel opens (see above).
- If Sim wants to keep the panel opening right under the tapped Card, use **A + four-across Stand-Outs + links row**
  (no three-across Hand). That is about 4.48 screens at 390.
  - My estimate, from adding the separate measurements. Not measured together.
- 320 stays above 5 screens in every option (C 5.40). Those phones would need their own fix.

### Pictures

- `myteam-phone-overview.png`: today, A, B and C side by side, same scale. Grey lines mark each screen and the blue line
  marks the 4-screen target. Each panel shows its screen count.
- `myteam-phone-overview-dark.png`: today and C in dark mode.
- `myteam-phone-{A,B,C}-part-{1,2,3}.png`: readable side-by-side pairs, today vs the option, in three parts:
  1. Header + Hand + Game Plan
  2. Matchups
  3. Suggestions to Your Games
- `myteam-phone-C-360.png`, `myteam-phone-C-longnames-390.png`, `myteam-phone-C-five-390.png`: the three-across Hand at
  its narrowest, with long names, and for a team being built.

## 2. np-cols: desktop, the two columns under Matchups

Today, from 700 px: Matchups spans both columns. Below it, Suggestions (with Adjust Suggestions) sits on the left, and
Team Checks + Your Games sit on the right.

### Measured: how far apart the two columns end (px; sample team unless noted)

| Option | 1100 | 1280 | 1440 | 1920 |
|---|---:|---:|---:|---:|
| **Today** | 177 (left longer) | **177** | 73 | 49 |
| **1: links in one row** (when they fit; no moves) | 73 | **73** | 73 | 49 |
| **2: swap Your Games and Adjust Suggestions** | 7 | **7** | 98 (right longer) | 119 (right) |
| 1 + 2 | 97 (right) | 97 | 98 | 119 |
| Your Games alone moves left | 549 | 549 | 445 | 377 |
| Adjust alone moves right | 367 (right) | 367 | 470 | 447 |
| Today, 5 of 6 team (no Your Games yet) | 404 | 382 | 275 | 232 |
| Option 1, 5 of 6 | 352 | 330 | 275 | 232 |
| Option 2, 5 of 6 | 139 (right) | 162 | 267 | 262 |

Notes:
- The handover's 188 px at 1280 (Nov 17) now measures 177 on this build. Measured: Your Games got shorter since then.
- Option 1 also makes the page 104 px shorter at 1100 and 1280.
- The two columns break in the 1100-1280 band because the three Suggestions links stack there (the column is about
  520 px wide). From 1440 they already sit in one row.
- A hybrid (option 2 below 1440, option 1 from 1440) would give 7 / 7 / 73 / 49.
  - Assembled from the per-width measurements above, not built as one mock.
  - It moves two blocks between columns as the window is resized.

### Recommendation (desktop)

**Option 1, links in one row.** It cuts the 1280 gap from 177 to 73 px and moves nothing, so reading order is kept.
- Option 2 evens 1100-1280 (7 px), but it flips the imbalance to the right at 1440+ (98-119 px).
- Option 2 also puts Adjust Suggestions away from the suggestions it controls, which is a usability cost.
- Still open:
  - Unsure whether the last 73 px is worth chasing.
  - A team being built (5 of 6) stays 232-352 px apart in every option. That is a separate item.

### Pictures

- `myteam-cols-1280.png`: today vs option 1 vs option 2 at 1280 (from the bottom of Matchups to the footer).
- `myteam-cols-1440.png`: the same at 1440. Option 2 now ends longer on the right.
- `myteam-cols-1280-dark.png`: today vs option 1 in dark mode.

## Side finding: Playwright full-page shots on phones (checked)

At 390 the Cards' decorative layers make `body.scrollWidth` 398, even though the page shows no horizontal scroll
(overflow-x: clip).
- Playwright's `fullPage: true` then lays the page out again at 398 px.
- That changes text wrapping. Measured: in the full-page shot the Your Games note took 3 lines and the footer sat
  57 px lower. At the real 390 the note is 2 lines and the footer starts at 4,399 px.
- Phone pictures taken with `fullPage` show a 398-wide layout, not 390.
- These pictures avoid that: the viewport is set to the page height and only the viewport is captured.
- Desktop is not affected (scrollWidth is under the window width).
- Side effect in these pictures: with the window as tall as the page, the jump tabs mark "Team Checks" as the current tab.
  It is the same in every panel, so it is not part of any option.

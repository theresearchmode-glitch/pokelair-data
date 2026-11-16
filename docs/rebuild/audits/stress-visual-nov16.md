# Nuclear stress test, part 1: visual sweep (Nov 16, night)

Run by a helper agent on the Preview build: 25 routes x 10 widths (320-1920) x day and night = 500 renders, plus drag-resize on My Team
and Meta. Scripts and shots: scratchpad agents/stress/visual/ (not kept in the repo).

Measured on all 500 renders: 0 pages wider than the window, 0 boxes past the edge, 0 broken images, 0 console or page errors, every
route its own page; drag-resize matches a fresh load at every step.

| # | Finding | Status (Nov 16) |
|---|---|---|
| 1 | High. My Team Stand-Outs at 360: four cards across ran names and verdicts together | Fixed: three across from 360 to 404 (390 with a desktop scrollbar also touched). m-hi.cjs: 0 overlaps at 320/360/375/390/414 |
| 2 | High. Usage bench at 320: "Indeedee (F)" cut by 29px | Fixed: 64px sprites, no side padding below 380 (four 72px figures overran a 273px row). 0 cut |
| 3 | Events tickets at 320: label wraps unevenly, "M-" / "C", names reach the perforation | Fixed label (one line on every ticket, 88% letters, 320-359) and "M-C" (word joiner). Kept: the longest name word reaches the perforation at 320 (0px, not clipped) - Sim's Q17 layout; for Sim |
| 4 | Home corner links at 320 misaligned | Fixed: one left-aligned column below 480. Also: "All N Events ›" went to Meta; now Events |
| 5 | Lone "›" on its own line | Fixed with CSS (text-wrap: pretty on links/buttons; nowrap on the editing panel link): 3 -> 0 over 23 pages at 320/360/390/768/1024 (Chromium). iPhone Safari not yet checked |
| 6 | Calc chips cramped; "Critical hit" alone (2+2+1) | Fixed the cramping: chips sized to the measured room (64/72/76px; the old pair ran 3px over at 1024). Kept 2+2+1: a deliberate earlier choice (fifth centred) |
| 7 | My Team move chips wrap unevenly at 1440 | Fixed: when one move wraps, every chip in the Hand takes the two-line height; all six grids 88px at 1024/1440/1920 (page height +0/+0/+17px) |
| 8 | Home underdog panel ends at ~70% width at 1440 | Fixed: its colour field runs the full width (day and night screenshots) |
| 9 | This Week tiles: fifth alone at 320-414 | Fixed: the 4px gap pushed 3 x 33.3% past the row; now 3+2 (measured) |
| 10 | Usage "How X is played" unbalanced at 1024 | Fixed at three columns: Moves spans two rows (443 -> 336px tall at 900-1180; two and four columns unchanged) |
| 11 | Meta spotlight stat labels wrap unevenly at 320 | Checked 3:37 AM: the numbers already line up along the bottom (screenshots of Meta and Usage at 320); labels wrap by word length. Kept |
| 12 | Test Run lone cards at 768+ | Open (low; counts come from the data) |
| 13 | One-word wraps (116) and wrapping short labels (230) | Open (low; most harmless) |
| 14 | Short last rows flagged by script only | Sampled 3:37 AM: Pokémon page jump links (one row of six at 1024) and the Type Chart skyline (a 3D stack by design) are fine; the rest not looked at |

Not checked by the sweep: opened folds, sheets, menus, hover; heights other than 900; colour contrast.

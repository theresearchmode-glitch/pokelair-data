# Overnight JOB 1 (alt/len1280b): options for Events, Speed Tiers, Test Run at 1280x800

Written 11:05 PM Mon Nov 23, 2026 (docs/rebuild/now.sh). Base: `claude/design6` at **136e7cd9** ("Overnight brief for the other account…").
Frozen data 0c992f69 in out/ (not in any patch). Build: `node app/build.mjs --v2 --preview-data --art=../src/v2/art/`.
Nothing merges until Sim picks. Every rule sits in `@media (min-width:1280px) and (max-width:1439.98px)`.

## Result: one option per page gets under the cap; all three marked RECOMMENDED

| Page | Base 1280x800 | Option A (RECOMMENDED) | 1100x800 | 1366x768 | 1440x900 | 390x844 |
|---|---|---|---|---|---|---|
| Events | 3.28 (2624 px) | **2.96 (2372 px)** | 3.59 = 3.59 | 3.33 -> 3.03 | 2.94 = 2.94 | 4.00 = 4.00 |
| Speed Tiers | 3.12 (2493 px) | **2.94 (2355 px)** | 4.55 = 4.55 | 3.22 -> 3.04 | 2.87 = 2.87 | 3.34 = 3.34 |
| Test Run | 3.23 (2583 px) | **2.95 (2360 px)** | 4.81 = 4.81 | 3.26 -> 3.07 | 2.89 = 2.89 | 3.11 = 3.11 |

(checked: fresh browser per page and width, scrollHeight / window height; "=" means the same pixel height before and after)
Note: at 1366x768 all three stay a little over 3.0 (cap was set at 1280x800 per the brief; 1366's window is 32 px shorter).

### Events A (RECOMMENDED: the wall gets the width instead of the height; tickets stay tickets)
The ticket wall runs four across (was three); each ticket's date moves from a left stub to a dark strip on top (day + month, dashed tear
line under it), so the name and the six get the full ticket width; names at 15 px as on phones; the page ends 16 px under "Show 102 more"
(was 96 px) and the wall's heading sits 32 px under "Coming up" (was 48). All 12 tickets, all names and sixes kept.

### Speed Tiers A (RECOMMENDED: the band reads as one line plus its sentence; nothing else moves)
Each blue band puts "Mega", the name and the YOURS tag on one line (they stacked on 2-3 lines), the name column is 320 px, the white
bar sits level with the name, bands lose 8 px of padding. Bar, sprite and both sentences ("outspeeds 95%…", "Can't outspeed…") kept.

### Test Run A (RECOMMENDED: uses the headline's empty right side and the short rows)
The lede and "How it works" sit right of the headline (its second line leaves ~330 px there); rows where "You answer all six." read on
one line (place, event, sentence, counts) at the 44 px tap height; the page ends 16 px under its note (was 64). Rows with Pokémon that get
through keep their two-line layout. All 20 teams, the side panel and the key kept. Uses CSS `:has()` (Chrome, Safari 15.4+, Firefox 121+).

## Options tried and dropped (measured)
- Speed Tiers B, field rows three-up between the bands: 3.06 (2448 px), still over; groups of two left a gap in the third column and
  "Mega Garchomp Z" wrapped to two lines (picture `speed-1280-B-dropped.png`).
- Test Run B, every pile row on one line (place + event in a 272 px column): 3.21; event names and "gets through" wrapped to three lines in
  the 629 px pile column beside the 340 px panel, so rows got taller, not shorter.
- Events B, "Coming up" in the hero's right side: not built; at 1280 the hero's right side holds the three counts, and "Coming up" is
  already beside "The latest win" since last night, so moving it saves nothing.

## Checks (all three A options together in one build; checked)
| Check | Result line | Meaning |
|---|---|---|
| `node app/test/v2-guard.mjs` | v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css) | kit rules kept |
| `ROUTES=events node app/test/qcheck-all.mjs` | qcheck-all: 1 pages + 0 views x 5 widths x 2 themes, 0 findings, 0 new; 31s | passed |
| `ROUTES=speed …` | qcheck-all: 1 pages + 1 views x 5 widths x 2 themes, 0 findings, 0 new; 71s | passed |
| `ROUTES=gauntlet …` | qcheck-all: 1 pages + 0 views x 5 widths x 2 themes, 0 findings, 0 new; 30s | passed |
| `PAGE=app/dist/v2.html node app/test/tap-size.mjs` | tap-size: all passed | passed |
| `PAGE=app/dist/v2.html node app/test/v2-unbounded.mjs` | v2-unbounded: none outside the named exception across 29 pages | passed |
| `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs D-meta-shell` (Events) | behaviour: 118 pass, 0 FAIL, 41 known bugs, 0 fixed?, 7 skipped; 509s (adapter v2) | passed |
| `… run.mjs C-battle` (Speed Tiers, Test Run) | behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 427s (adapter v2) | passed |

qcheck covers 5 widths day and night; the pictures are day theme at 1280 only. Not checked: dark-theme pictures, WebKit for these options.

## Files
`events-A.patch`, `speed-A.patch`, `testrun-A.patch`: each applies alone on 136e7cd9 (`git apply --check`, checked).
`all-three-A-combined.patch`: all three; byte-identical to the file every check ran on (checked).
`pics/`: before + option pictures at 1280x800, labelled; RECOMMENDED labels have the green band.

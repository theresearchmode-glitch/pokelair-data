# KO Board, opened state: 3 options for Sim (look-only, Thu Nov 19, 10:44 PM by now.sh)

The Arena's KO Board bar opens today's old board (V2.dcBoard) in place. Its opened state was never designed.
Below: three options, each injected into the real built page (no shared code changed).
Prototype: docs/rebuild/research/ko-board-proto/proto.cjs (CSS + DOM moves on top of app/dist/v2.html#calc).
Numbers: docs/rebuild/research/ko-board-proto/measure.json.

How it was measured: `node build.mjs --v2 --preview-data --art=../src/v2/art/`, then `node proto.cjs <dir> shots`.
It opens the board (taps .arn-kbbar), applies the option, then reads scrollHeight. "Screens" = scrollHeight / 844.
Team: the Preview's default six. Direction: "Your hits on them". 18 down in one hit, 8 can go down, 4 survive.

## Page length with the board open (measured)

| | 320 | 390 phone | 768 | 1024 | 1440 | board (bar top to board end) at 390 |
|---|---|---|---|---|---|---|
| Today | 3.37 | **3.27** | 3.00 | 2.30 | 2.18 | 1153 px |
| A Group tabs | 3.02 | **2.92** | 2.64 | 1.99 | 1.87 | 858 px |
| B Colour fields | 3.29 | **3.19** | 2.92 | 2.13 | 2.01 | 1083 px |
| C The ladder | 4.49 | **4.39** | 4.33 | 2.82 | 2.70 | 2098 px |

(Board closed, for reference: 2.02 screens at 390, 1.29 at 1440; today.cjs.)

Other checks, all 5 widths, every option, measured in the same run:
- Sideways scroll: none (`sideways false` on every line).
- Tap targets under 44 px in the board: 0.
- Page errors: 0.
- Something outside the board: only "stamp u". That is the KO stamp, which pokes 2 px past its tile on purpose. Today does the same.
Light and dark: same heights (390 light = 390 dark on every option). I looked at both pictures for each option.

## A. Group tabs: RECOMMENDED

What it looks like: under the direction switch, three big slanted count tabs: **18** down in one hit, **8** can go down, **4** survive.
Each tab has a 6 px base in the bar's colour (red, striped, green). The picked tab takes the bar's fill.
Under the tabs is only that group's tiles, still 4 across on phones with names (Q22 A).

Why: the shortest on phones (0.35 screens less than today), and the tabs repeat the bar's three colours, so the bar and the board read as one thing.

Keeps: both directions, all three groups (one tap each), every tile with its KO stamp, HP bar, "by" picture, name on touch, and tap to put it on the table. Also the hover words, the intro line and the every-hit table fold.

Downsides (honest):
- Two groups are one tap away instead of on show.
- On desktop it stays in the right column, so an empty strip remains under the scene (smaller than today: 1.87 vs 2.18 screens).
- The "down in one hit" label wraps to 2 lines at 390 while the other two stay on 1. A real build would bottom-align the labels.
- Which tab opens first needs Sim's call. My guess, not tested: the KO group in "Your hits", and "down in one hit" in "Their hits" too.
- The prototype tabs are static (pictures only). The build needs them wired.

## B. Colour fields

What it looks like: all three groups on show. Each one has a 6 px stripe down its left side in the bar's colour, and a 34 px slanted count.
5 tiles across on phones, 8 at tablet. From 1024 the opened board leaves the right column and spans the whole page under the Arena, 12 across.

Why: nothing hidden, and on desktop it fills the empty left half that today's board leaves.

Phone: 3.19 screens, only 0.08 shorter than today.

Keeps: everything today's board has. Names on touch still fit 5 across, ending in an ellipsis when long.

## C. The ladder

What it looks like: each threat becomes a row: your attacker's small picture, the threat, its name, which of yours hits it with what move, the damage as a big slanted % (red when it is a sure KO), and the HP bar.
Groups have a 6 px coloured rule under the big count. From 1024 the three groups stand side by side across the full width.

Why: the most readable. You see names and numbers without tapping or hovering.

Phone: 4.39 screens, by far the longest (+1.12 vs today). It breaks Sim's short-on-phones rule, so I would only use it on desktop.

Keeps: everything, and adds the % on view. The move line ends in an ellipsis on phones.

## Recommendation

**A, Group tabs.** It is the shortest on phones, which is the rule Sim stressed. It drops nothing, and it matches the bar.

If Sim also wants the desktop half filled, B's full-width placement from 1024 could be added to A. That would be a second question with its own pictures.

A note on the phone pictures. Playwright's fullPage screenshot drops touch emulation, which made the tiles go 6 across with no names. So the phone pictures are stitched from normal viewport shots, which keep touch emulation (checked: `matchMedia('(hover:none)')` true, `.dc2-kts` columns `86.5px x4` at 390).
The heights were always read before any screenshot.

Names on touch: at 4 across (today, A) every name in this team fits. At 5 across (B), about 8 of 30 end in "..." ("Whimsic...", "Gholden..."; counted by eye on KOB-B-390-dark).

The last row of a group can be part-filled (A: 18 tiles = 4 rows of 4 + 2). The count comes from the data, the same as today.

## Pictures (docs/rebuild/pics/nov20/)
KOB-today-390-dark/light, KOB-today-1440-dark;
KOB-A-390-dark/light, KOB-A-1440-dark (RECOMMENDED);
KOB-B-390-dark/light, KOB-B-1440-dark;
KOB-C-390-dark/light, KOB-C-1440-dark.

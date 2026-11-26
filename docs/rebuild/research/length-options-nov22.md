# Shorter-page directions for the pages over the desktop length cap (Nov 22 evening, helper job 3, branch alt/length-options)

Written 7:44 PM Sun Nov 22, 2026 (clock: docs/rebuild/now.sh). Pictures only: no site code changed. Every option below is CSS
injected into the REAL built page with Playwright (`page.addStyleTag` AFTER load + settle), and every length is MEASURED on that
injected page, not estimated. Sim decides; nothing here is approved.

## Setup (checked)
- Build: `node app/build.mjs --v2 --preview-data --art=../src/v2/art/` -> "built dist/v2.html (4128 KB; 24 CSS layers, 8 data files, 55 scripts, 62 shared logic files)", on commit 82d5326b, frozen out/ from 0c992f69.
- Playwright 1.49.1 looked for /opt/pw-browsers/chromium_headless_shell-1148 and failed ("Executable doesn't exist"). I first worked round it with a
  scratch preload that points `chromium.launch` at the installed headless shell (1243); HH then symlinked the 1148 path machine-wide. Same browser either way.
- State measured: no saved team, so My Team, Test Run and Speed Tiers use the site's own SAMPLE team ("Sun Tailwind (sample)": Mega Charizard Y,
  Whimsicott, Basculegion, Kingambit, Garchomp, Sneasler), exactly what experiments/page-lengths.mjs sees (it only sets `window.__PL_TEST = 1`).
  Pokémon page: `#pokemon=Garchomp` (3 forms). Each page in its first state (default tabs; My Team's Matchups on "stand-outs").

## Measured before (today)
Command: `PAGE=app/dist/v2.html OUT=lengths-before.json node experiments/page-lengths.mjs` (2 s wait). Exact result lines for the four pages
(format: width route px screens width-used):
```
390 team 3928 4.65 100%
390 gauntlet 2633 3.12 100%
390 speed 2795 3.31 100%
390 pokemon=Garchomp 5293 6.27 100%
1280 team 3511 4.39 99%
1280 gauntlet 3718 4.65 99%
1280 speed 2768 3.46 99%
1280 pokemon=Garchomp 4976 6.22 99%
1440 team 3479 3.87 99%
1440 gauntlet 2582 2.87 99%
1440 speed 2691 2.99 99%
1440 pokemon=Garchomp 4679 5.20 99%
```
Settle check (HH's note: My Team grows after 2 s): my own measure script waits until the height has not changed for 2 s (max 12 s), then
measures. Result lines, today:
```
speed (today) | 1280x800: 2768px = 3.46 screens | 1440x900: 2691px = 2.99 screens | 390x844: 2795px = 3.31 screens
gauntlet (today) | 1280x800: 3718px = 4.65 screens | 1440x900: 2582px = 2.87 screens | 390x844: 2633px = 3.12 screens
team (today) | 1280x800: 3511px = 4.39 screens | 1440x900: 3479px = 3.87 screens | 390x844: 3928px = 4.65 screens
pokemon=Garchomp (today) | 1280x800: 4976px = 6.22 screens | 1440x900: 4679px = 5.20 screens | 390x844: 5293px = 6.27 screens
```
In plain words: on this build the 2 s numbers and the settled numbers are the same (My Team's late section had already landed by 2 s here).
"Screens" = page height / window height (800 at 1280, 900 at 1440, 844 at 390).

**Numbers that differ from CLAUDE.md** (which says Speed Tiers 4.0, Test Run 3.6, My Team 3.7, Pokémon page 5.2 at 1440):
- Speed Tiers is now **2.99** at 1440: already under its cap of 3 (just). It is over at 1280x800 (3.46).
- Test Run is now **2.87** at 1440: under the cap. At 1280x800 it is **4.65**: from 1100 to 1439 the open-team lane squeezes the pile rows
  into their narrow (3-line) layout.
- My Team is **3.87**, longer than the 3.7 in CLAUDE.md (matches HH's settled 3.87).
- Pokémon page **5.20** (CLAUDE.md 5.2): same.

## Summary of options (all measured on the injected page, settled; caps are at 1440x900)
| page (cap) | today 1280 / 1440 / 390 | option A | option B | recommended |
|---|---|---|---|---|
| Speed Tiers (3) | 3.46 / 2.99 / 3.31 | 3.35 / 2.90 / 3.31 | 3.30 / **2.80** / 3.31 | B |
| Test Run (3) | 4.65 / 2.87 / 3.12 | **3.36** / 2.87 / 3.12 | 3.47 / 2.96 / 3.12 | A |
| My Team (3) | 4.39 / 3.87 / 4.65 | 4.10 / 3.52 / 4.65 | 4.08 / **3.40** / 4.65 | B, still over |
| Pokémon page (4) | 6.22 / 5.20 / 6.27 | 5.80 / **4.80** / 6.27 | 5.91 / 4.94 / 6.27 | A, still over |

Phone (390): every option is inside `@media (min-width:1280px)` (Test Run A: 1100-1439), and the measured 390 length is unchanged for all eight.
No option adds sideways scroll (scrollWidth - innerWidth stays -15 at desktop, the scrollbar) or anything past the content column's right edge
(my count "past-edge": 0 for every desktop option; 9 at 390 on the Pokémon page are today's form tabs scroller, same before and after).

**Plain answer: layout alone does NOT bring My Team (best 3.40) or the Pokémon page (best 4.80) under their caps.** Speed Tiers and Test Run
are already under at 1440; their options add room and fix 1280. What would close the rest is a content or spacing call for Sim (below).

---
## 1. Speed Tiers (cap 3; today 2.99 at 1440, 3.46 at 1280)
Pictures: speed-today-*.webp, speed-A-*.webp, speed-B-*.webp (1440 day, 1440 night, 390 day, 1280 day); side by side: speed-compare-1440-day.webp,
speed-compare-1280-day.webp, speed-compare-390-day.webp.

### Option A: button beside the fine print (2.90 at 1440)
Step 2 ("The fine print.") puts PLAN TURN ONE. to the right of its paragraph instead of under it. Smallest change; fills part of the empty right half of step 2.
`speed sp-A.css | 1280x800: 2684px = 3.35 screens | 1440x900: 2607px = 2.90 screens | 390x844: 2795px = 3.31 screens`
```css
/* Speed Tiers, option A "button beside the fine print": in step 2 the fine print and PLAN TURN ONE share one row (1280+) */
@media (min-width:1280px){
 .sp2 .k-plan>.k-step:nth-of-type(2){display:grid;grid-template-columns:minmax(0,72ch) auto;column-gap:var(--s12);align-items:center;justify-content:space-between}
 .sp2 .k-plan>.k-step:nth-of-type(2)>:not(.sp2-foot):not(.k-go):not(.k-n){grid-column:1/-1}
 .sp2 .k-plan>.k-step:nth-of-type(2)>.k-go{margin:0}
}
```

### Option B: the fine print as a side lane (2.80 at 1440) · RECOMMENDED
Step 2 becomes a 320px lane down the right of the ladder (its own rail number in the gutter), and stays in view while the ladder scrolls
(sticky, as Test Run's open-team lane already is). The pink button uses t26 in the lane, the size Test Run's side lane already uses.
`speed sp-B.css | 1280x800: 2642px = 3.30 screens | 1440x900: 2524px = 2.80 screens | 390x844: 2795px = 3.31 screens`
Cost (seen on the pictures): the ladder is ~400px narrower, so two "yours" bands (Whimsicott, Kingambit) wrap their "Can't outspeed..." line onto a second line.
```css
/* Speed Tiers, option B "the fine print as a side lane": step 2 runs down the right of the ladder and stays in view (1280+) */
@media (min-width:1280px){
 .sp2 .k-plan{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,320px);column-gap:88px;align-items:start;margin-top:var(--s16)}
 .sp2 .k-plan>.k-step>.k-sec:first-of-type{margin-top:0}
 .sp2 .k-plan>.k-step:nth-of-type(2){position:sticky;top:96px}
 .sp2 .k-plan>.k-step:nth-of-type(2) .k-go{margin-top:var(--s6);font-size:var(--t26)} /* the size Test Run's side lane already uses for its pink button */
}
```

**Recommended: B.** Why: it is the shortest and it uses the empty space beside the ladder for the how-it-works text and the next step, so "Plan Turn One" is always one glance away.

---
## 2. Test Run (cap 3; today 2.87 at 1440, 4.65 at 1280)
Pictures: testrun-*.webp; side by side: testrun-compare-1280-day.webp (where the change shows), testrun-compare-1440-day.webp, testrun-compare-390-day.webp.

### Option A: slimmer open-team lane at 1100-1439 (3.36 at 1280; 1440 unchanged) · RECOMMENDED
At 1100-1439 the open team's lane goes 380 -> 340px (gap 40 -> 32), so the pile column is 600px+ wide and the rows keep their one-line
layout, as at 1440. The lane's pink button goes t26 -> t22 to fit. 1440+ is not touched.
`gauntlet tr-A.css | 1280x800: 2687px = 3.36 screens | 1440x900: 2582px = 2.87 screens | 390x844: 2633px = 3.12 screens`
```css
/* Test Run, option A "slimmer open-team lane": at 1100-1439 the open team's lane goes 380 -> 340px so the pile rows stay one line (as at 1440) */
@media (min-width:1100px) and (max-width:1439.98px){
 .dr-board.two{grid-template-columns:minmax(0,1fr) minmax(0,340px);gap:32px}
 .dr-side .k-go{font-size:var(--t22)}
}
```

### Option B: piles two-up (2.96 at 1440, 3.47 at 1280)
The Problems and The Good Matchups in one lane, The Coin Flips in the next, the open team on the right (1280+). Rows drop to their 3-line narrow layout,
so it is LONGER than today at 1440 (+86px) and leaves an empty strip under The Good Matchups. Shown because it is the other real way to use the width.
`gauntlet tr-B.css | 1280x800: 2773px = 3.47 screens | 1440x900: 2668px = 2.96 screens | 390x844: 2633px = 3.12 screens`
```css
/* Test Run, option B "piles two-up": The Problems and The Good Matchups in one lane, The Coin Flips in the next, the open team on the right (1280+) */
@media (min-width:1280px){
 .dr .tp-piles{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto 1fr;gap:40px 32px;align-items:start}
 .dr .tp-piles>.tp-pile.c{grid-column:2;grid-row:1/span 2}
 .dr-board.two{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
}
```

**Recommended: A.** Why: it cuts 1280 from 4.65 to 3.36 screens with one width change, keeps the page exactly as Sim approved it at 1440, and every row stays one easy line.
Still over at 1280x800 (3.36 vs 3): not checked whether any layout gets 1280x800 under 3; the cap is set at 1440x900.

---
## 3. My Team (cap 3; today 3.87 at 1440, 4.39 at 1280)
Pictures: myteam-*.webp; side by side: myteam-compare-1440-day.webp, -1280-day, -390-day.
Measured constraints (tried and dropped, pictures not kept): the crew frame cannot go half width (the six cards squash, names overlap: tried 2x2 steps, 2766px but broken);
the Matchups list at half width with two columns overlaps names and verdict tags; moving "New crew?" beside the score made the page LONGER (3594px, the sentence wraps).

### Option A: upgrade beside the checks (3.52 at 1440)
Steps 2 and 4 share a row (7fr / 5fr; both are narrow text columns today), the crew and the Matchups keep the full width. Reading order on screen becomes 1, 2 | 4, 3.
`team tm-A.css | 1280x800: 3278px = 4.10 screens | 1440x900: 3166px = 3.52 screens | 390x844: 3928px = 4.65 screens`
```css
/* My Team, option A "upgrade beside the checks": step 2 and step 4 share a row (both are narrow text columns today);
   the crew and the matchups keep the full width (1280+) */
@media (min-width:1280px){
 .tmk-work .k-plan{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);grid-template-areas:'s1 s1' 's2 s4' 's3 s3';gap:var(--s16) 88px;align-items:start;margin-top:var(--s16)}
 .tmk-work .k-plan>.k-step>.k-sec:first-of-type{margin-top:0}
 .tmk-work .k-plan>.k-step:nth-of-type(1){grid-area:s1}
 .tmk-work .k-plan>.k-step:nth-of-type(2){grid-area:s2}
 .tmk-work .k-plan>.k-step:nth-of-type(3){grid-area:s3}
 .tmk-work .k-plan>.k-step:nth-of-type(4){grid-area:s4}
}
```

### Option B: threats lane (3.40 at 1440) · RECOMMENDED
Step 2 then step 4 down the left lane; step 3 (Matchups) down the right lane, its threat list one per row (verdict tag at the row's end, as on the narrow layout).
`team tm-C.css | 1280x800: 3265px = 4.08 screens | 1440x900: 3064px = 3.40 screens | 390x844: 3928px = 4.65 screens`
Cost: the right lane ends ~400px before the left (an empty strip beside Checks and record at the "stand-outs" view; at "top 10"/"all 30" the list is longer and fills it, not measured).
```css
/* My Team, option B "threats lane": steps 2 and 4 in the left lane, step 3 (Matchups) down the right lane, the threat list one per row (1280+) */
@media (min-width:1280px){
 .tmk-work .k-plan{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:'s1 s1' 's2 s3' 's4 s3';gap:var(--s16) 88px;align-items:start;margin-top:var(--s16)}
 .tmk-work .k-plan>.k-step>.k-sec:first-of-type{margin-top:0}
 .tmk-work .k-plan>.k-step:nth-of-type(1){grid-area:s1}
 .tmk-work .k-plan>.k-step:nth-of-type(2){grid-area:s2}
 .tmk-work .k-plan>.k-step:nth-of-type(3){grid-area:s3}
 .tmk-work .k-plan>.k-step:nth-of-type(4){grid-area:s4}
 .tm-mus .mu-out{grid-template-columns:minmax(0,1fr)}
}
```

**Recommended: B, but it does not reach the cap.** Why: it is the shortest measured layout and the Matchups verdicts read as one clean list beside the upgrade.
To get from 3.40 (3064px) to 3.0 (2700px) still needs ~364px. Layout cannot find it (above). Candidates for Sim, NOT measured: a smaller gap
between steps (64px x3), the header's "New crew?" line moving into the More menu, or accepting a My Team cap of 3.5 (it is a workspace page).

---
## 4. Pokémon page (cap 4; today 5.20 at 1440, 6.22 at 1280)
Pictures: pokemon-*.webp; side by side: pokemon-compare-1440-day.webp, -1280-day, -390-day.
Tried and dropped (measured): Known associates and Hit list side by side, each one column (both lanes get as long as the two rows they replace: -52px only).

### Option A: forms as a strip (4.80 at 1440) · RECOMMENDED
"Forms side by side" turned on its side: one row per form (sprite + name), the 12 facts as columns (Rating ... Total), best-in-row marks kept.
Pure CSS on today's table (`display:grid; grid-auto-flow:column`, rows as `display:contents`). Cells go t15 -> t13 to fit 13 columns;
thin --rule lines only. The `repeat(4,auto)` is for Garchomp's 3 forms; a build would set it from the form count (not checked on 1- or 2-form Pokémon).
`pokemon=Garchomp pk-T.css | 1280x800: 4640px = 5.80 screens | 1440x900: 4324px = 4.80 screens | 390x844: 5293px = 6.27 screens`
```css
/* Pokémon page: "forms as a strip" - the Forms table turned on its side (forms are rows, the 12 facts are columns), 1280+ */
@media (min-width:1280px){
 .pkf .pk-ft{display:grid;grid-auto-flow:column;grid-template-rows:repeat(4,auto);grid-template-columns:minmax(0,2.2fr) repeat(12,minmax(0,1fr));border-collapse:separate}
 .pkf .pk-ft :is(thead,tbody,tr){display:contents}
 .pkf .pk-ft th[scope=row]{padding:0 var(--s1) var(--s2);border-bottom:1px solid var(--rule);font-size:var(--t15);white-space:normal;text-align:center;align-self:end}
 .pkf .pk-ft td{display:grid;place-items:center;padding:var(--s2) var(--s1);border-top:1px solid var(--rule);font-size:var(--t13);text-align:center}
 .pkf .pk-ft thead td{border:0;border-bottom:1px solid var(--rule)}
 .pkf .pk-ft th[scope=col]{display:flex;font-size:var(--t15);align-items:center;gap:var(--s2);padding:var(--s1) var(--s2) var(--s1) 0;border-top:1px solid var(--rule);text-align:left}
 .pkf .pk-ft th[scope=col] .np-mon{width:44px;height:44px;flex:none}
}
```

### Option B: data beside the forms (4.94 at 1440)
The five "What the data says" slips stack as one column on the left of the Forms table (which keeps today's look, 2/3 width).
`pokemon=Garchomp pk-A.css | 1280x800: 4729px = 5.91 screens | 1440x900: 4450px = 4.94 screens | 390x844: 5293px = 6.27 screens`
```css
/* Pokémon page, option A "data beside the forms": the five source slips stack as a column beside the Forms table (1280+) */
@media (min-width:1280px){
 .pk-rap{grid-template-areas:'st sp wh' 'ab sp wh' 'da ft ft';grid-template-rows:auto 1fr auto}
 .pkf .pk-slips{grid-template-columns:minmax(0,1fr)}
}
```

**Recommended: A, but it does not reach the cap.** Why: it saves the most (-355px), and a form-by-form strip reads like a stat line players already know, with the winning cell still marked.
To get from 4.80 (4324px) to 4.0 (3600px) still needs ~724px. Where the height is (measured at 1440): header 207, hero 795 (card + moves/items
on the left decide it), rap sheet 1617, Known associates 593, Hit list 662. Candidates for Sim, NOT measured: a Pokémon page cap of 5 (it is the
deepest reference page), or moving one whole block (e.g. Known associates) to Winning Teams with a link.

---
## Not checked
- polish-check / qcheck / tap-size were NOT run on the injected options (they are pictures, not builds); a real build would need them.
- WebKit (Safari engine) not checked; only Chromium.
- Other states: a real saved team, a 5-of-6 team, My Team on "top 10"/"all 30", Pokémon with 1 or 2 forms, long names: not measured.
- Night lengths: heights measured in day only; night pictures taken (same heights printed by the shot script for 1440 night).
- 1920 and odd widths (1100-1279, 1500-1700) not measured for the options.
- Keyboard order: CSS grid areas change the visual order on My Team (option A: 1, 2|4, 3); the tab order stays the DOM order. Not tested.

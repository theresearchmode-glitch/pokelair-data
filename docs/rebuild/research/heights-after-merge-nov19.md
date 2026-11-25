# Page heights after the merge (look-only), Nov 18 evening

Written time: 8:11 PM (8:11:14)  date: Wed Nov 18, 2026 (from `bash docs/rebuild/now.sh`; the file name says nov19 as the brief asked).
Branch claude/design6 at 56f98dc1 (after the main merge 241e9e08 / 83ff09d6). Decision being carried out: decisions.md Nov 18, 5:38 PM (2):
"the small overs on My Team 1440, Meta 820/1440, Battle 320/390/1440, Usage 1440: re-measured after the merge with fonts loading
properly; each real over gets looked at, limits are not raised just to pass". No code, test, limit or data was changed. No limit is
proposed to be raised anywhere below.

## How it was measured (and what was NOT checked)
- Build: `cd app && node build.mjs --v2 --preview-data --art=../src/v2/art/` -> `built dist/v2.html (3752 KB; ...)`.
- Engine: **Chromium only** (Chrome for Testing 153.0.8010.12, newer than CI's Chromium for Playwright 1.49.1). **WebKit not run**: no
  WebKit build on this machine. c13-check normally takes the taller of Chromium/WebKit at 320/390/820 (they agreed within 24 px on Nov 13).
- Official tool: `C13_ENGINES=chromium node experiments/c13-check.mjs app/dist/v2.html team,meta,battle,usage default`
  -> `c13 check (default; chromium): 16 page/width runs; 7 over height; 82s.`
- Second tool (scratch, not committed): a copy of c13-check's height part (same data feed, same states, same waits) that serves the page
  over http, waits for `document.fonts.ready`, reports which fonts loaded, and breaks the page into sections.
- Limits are the ones c13-check.mjs applies (page-heights.md + the +90/+70/+70/+10 footer allowance).

## Are the overs real, or a fonts / data artefact? (checked)
1. **Fonts: not an artefact.** c13-check opens the page as file://. Its lines show `errors 4 [Access to font at '.../fonts/unbounded-latin.woff2'
   from origin 'null' has been b | Failed to load resource: net::ERR_FAILED]`. These 4 errors are the two `<link rel="preload" ... crossorigin>`
   hints only: in the same file:// run the page itself reports `fonts loaded: Instrument Sans, Unbounded; fonts failed 0`. Served over
   http (0 errors, same two fonts loaded) every one of the 16 heights is **identical to the pixel** (e.g. team 1440 2544 both ways,
   battle 390 4380 both ways). Plain meaning: the fonts do load in the c13 run; the heights are the real-font heights. Side note: the 4
   console "errors" are a file:// artefact of the preload hints and will show in every c13 run in this Chrome version.
2. **Data feed: not an artefact.** A build without `--preview-data` (c13-check's own documented build) gives the same 16 heights to the pixel.
3. **What the merge changed:** pre-merge code + pre-merge data (10a4fa1c, git archive into scratch) vs now: team +96/+116/+77/+48
   (320/390/820/1440), meta -64/-64/-15/-15, battle +45/+46/+33/+42, usage -15/-16/-15/-16. **Pre-merge code + today's data gives exactly
   today's 16 heights**, so every change came from the daily data, none from the merged code. All 7 overs were already over before the merge
   (team 1440 2496, meta 820 4038 / 1440 2938, battle 4745 / 4334 / 2185, usage 2166).
4. **Sample data:** My Team uses the first-visit sample team (Sun Tailwind) in every state, as c13 does. The overs move with the daily data
   (Matchups notes, tier sizes, the #1's move list), so a page with a "measured + 50" limit can drift over on its own. That is a finding,
   not a reason to raise limits.

## Results (Chromium, fonts loaded, today's data)
Default state (Battle = with an opponent, as c13 checks it):

| Page | 320 | 390 | 820 | 1440 |
|---|---|---|---|---|
| My Team | 4,580 / 4,690 ok (110 under) | 3,522 / 4,270 ok (748) | 3,541 / 3,570 ok (29) | **2,544 / 2,360 OVER +184** |
| Meta | 3,449 / 4,590 ok (1,141) | 3,302 / 4,370 ok (1,068) | **4,023 / 4,020 OVER +3** | **2,923 / 2,860 OVER +63** |
| Battle | **4,790 / 4,740 OVER +50** | **4,380 / 4,270 OVER +110** | 3,265 / 3,570 ok (305) | **2,227 / 2,160 OVER +67** |
| Usage | 3,928 / 3,990 ok (62) | 3,680 / 3,770 ok (90) | 3,047 / 3,570 ok (523) | **2,150 / 2,110 OVER +40** |

Worst states (C1):

| Page, state | 320 | 390 | 820 | 1440 |
|---|---|---|---|---|
| My Team, 5 of 6 (5 cards checked) | 4,468 / 4,590 ok | 3,613 / 4,270 ok | **3,692 / 3,570 OVER +122** (no 5-of-6 limit at 820) | **2,501 / 2,110 OVER +391** |
| My Team, six longest names | 4,247 | 3,547 | 3,177 | 2,406 |
| My Team, after Apply | unknown: the sample team shows "Nothing to fix", no Apply to press | | | |
| My Team, every fold open (no limit agreed) | 7,573 | 6,232 | 5,587 | 4,581 |
| Battle, empty (no opponent) | 2,071 ok | 1,900 ok | 1,388 ok | 1,142 ok |
| Meta, every fold open | 4,625 | 4,297 | 4,546 | 3,333 |
| Usage, every fold open | same as default (no folds) | | | |

Tool inconsistency found (not changed): c13-check applies The Hand limits only to state `default`; `long` and `apply` fall back to the
old generic limits (3,990 / 3,770 / 3,570 / 1,810), so "long" reports OVER at 320 (4,247 vs 3,990) and 1440 (2,406 vs 1,810) although it is
under The Hand's own limits (4,690 / 2,360). Meta "open" has no agreed limit either (vs the default limits: 320 +35, 820 +526, 1440 +473).
Which limit the long-name and open states should meet is a question for the lead / Sim, not changed here.

## What makes each over long, and fix options (pictures: docs/rebuild/pics/nov19/; every mock-up is a temporary change in the browser, not code)

### Q1. My Team 1440: 2,544 vs 2,360 (+184). Real.
Sections: header + band + your corner 329; the Hand 511; the **editing panel, open by default on desktop, 123** (+ gaps);
Game Plan 48; jump tabs 45; Matchups 536 (Stand-Outs with "Calc disagrees" notes); then two columns: **Suggestions 480** (of which the
**Adjust Suggestions controls 240**) beside Team Checks 221 + Your Games 146; footer 188. Since the limit was set (2,328, Nov 15) the page
gained the editing panel, the Game Plan strip, the matchup notes and Adjust Suggestions. Phones got Sim's Nov 18 "C" (panel shut until a Card
is tapped, Adjust folded); desktop did not.
- **A (RECOMMENDED): desktop like phones**: panel shut until a Card is tapped (the phone hint line shown), Adjust Suggestions a closed fold
  with its settings summary. Mock-up 2,356 (4 px under; thin). Why: same behaviour on every width, and the two biggest optional blocks
  go behind one tap. Also 5 of 6 at 1440: 2,501 -> 2,281 (still OVER its 2,110 limit by 171); long names 2,406 -> 2,321.
  Mock-up flaw: the first Card still shows its selected outline. Picture: q1-optA-RECOMMENDED-myteam-1440.png
- **B: no change** (stays over by 184). Picture: q1-optB-no-change-myteam-1440.png
- Open even with A: My Team 5 of 6 at 1440 (+171 after A) and at 820 (+122): not solved here.

### Q2. Battle phones: 390 4,380 vs 4,270 (+110); 320 4,790 vs 4,740 (+50). Real.
390 sections: headline 305, Your Six/Their Six poster 902, Turn One 654, lead-pair note + buttons 168, The Read / From Real Games /
Watch Out stacked 963, detail tabs 67, **More Ways to Prep 328** (five full-width rows with descriptions), Your Games 332.
- **A (RECOMMENDED): More Ways to Prep two across, names only** (descriptions kept as spoken labels, as Home's tool list did on Nov 16).
  Mock-up: 390 4,243 (27 under), 320 4,633 (107 under). Why: the list is links, not content; names alone still say where each goes.
  Note for Sim's symmetry eye: five tools leave a lone last tile and "Team Preview Practice" wraps to two lines.
  Picture: q2-optA-RECOMMENDED-battle-390.png
- **B: no change.** Picture: q2-optB-no-change-battle-390.png

### Q3. Battle 1440: 2,227 vs 2,160 (+67). Real. No mock-up I tried gets it under.
Sections: tools bar 52, headline 220, poster 411, Turn One 344, note + buttons 61, The Read / From Real Games / Watch Out 420 (Watch Out
is the tallest column), detail tabs 56, Your Games 144, footer 188. Also a C3 finding: Watch Out repeats lines The Read already says
("Mega: one of two Megas: only one can evolve" 3 times on the page, "Fake Out can flinch one of your leads turn 1" 4 times).
- **A (RECOMMENDED as the C3 fix, not enough for the height): Watch Out says it once** (hides the Mega and Fake Out lines The Read has).
  Mock-up 2,192: **still over by 32**. Picture: q3-optA-RECOMMENDED-battle-1440.png
- **B: A + the phone spacing above The Read (32 + 32 instead of 40 + 40).** Mock-up 2,176: **still over by 16**. Picture: q3-optB-battle-1440.png
- **C: no change.** Picture: q3-optC-no-change-battle-1440.png
- With A on phones too: 390 4,208, 320 4,501 together with Q2 A. Battle 1440 needs another idea; I'm unsure which, so none is offered as a fix.

### Q4. Usage 1440: 2,150 vs 2,110 (+40). Real (moves with the #1 Pokémon's move list and the length of the "Also ranked" list).
Sections: top 403; Podium 405; "How Sneasler is played" 642 (Moves list 8 rows sets it); "Usually alongside" 217; "Ranks 11-60 ›";
**"Also ranked 61-256: ..." a four-line wall of names**; source note; footer 188.
- **A (RECOMMENDED): the names become a "Ranks 61-256 ›" link on the same row as "Ranks 11-60 ›".** Mock-up 2,076 (34 under);
  also 820 2,953, 390 3,489, 320 3,697. Why: same pattern as Ranks 11-60, the list stays one tap away. Picture: q4-optA-RECOMMENDED-usage-1440.png
- **B: no change.** Picture: q4-optB-no-change-usage-1440.png

### Q5. Meta 820: 4,023 vs 4,020 (+3); Meta 1440: 2,923 vs 2,860 (+63). Real, and set by today's tier sizes.
The Grandstand shows every S-D Pokémon; a row holds 11 at 1440. Today A tier has 17 and D tier 19, so both wrap to a second row
(+162 px each). At 820 the tiers are 425 / 576 / 393 / 385 / 377 / 207 px. When a tier's count crosses a row boundary on a new day the page
jumps by about 160 px, so a "measured + 50" limit cannot hold reliably.
- **A (RECOMMENDED): one row per tier on iPad and desktop, the rest behind "+N more ›"** (opens the tier). Mock-up 1440 2,638, 820 3,119.
  Why: the stand stays even and the height stops jumping with the daily data. Against it: Sim chose the Grandstand on Nov 14 (Q2 A) because
  it shows far more Pokémon; A hides 14 today on desktop. Pictures: q5-optA-RECOMMENDED-meta-1440.png, q5-optA-RECOMMENDED-meta-820.png
- **B: no change** (over today; will move with the data). Pictures: q5-optB-no-change-meta-1440.png, q5-optB-no-change-meta-820.png

## Under the limit (margins)
Default: My Team 320 (110), 390 (748), 820 (29, thin); Meta 320 (1,141), 390 (1,068); Battle 820 (305); Usage 320 (62), 390 (90), 820 (523).
Battle empty: every width far under. My Team 5 of 6: 320 (122), 390 (657).

## Not covered
WebKit (not on this machine); widths other than 320/390/820/1440; dark mode; the After-Apply state (nothing to apply); C1's other checks.
Mock-ups were measured, not use-tested.

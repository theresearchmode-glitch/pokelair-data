# Wave 3: one headline size and one step-heading size (direction pictures, Nov 22)

Written on Sim's second account (main thread), 6:46 PM (6:46:35), Sun Nov 22, 2026 (clock: docs/rebuild/now.sh).
Source: audit P1-1 and P1-2 (docs/rebuild/research/consistency-audit-nov22.md). Pictures and a proposal only: **no site code changed**.
Sim decides. Every picture is the REAL built page (work @ 82d5326, `node app/build.mjs --v2 --art=../src/v2/art/`, out/ from 0c992f69)
with the candidate CSS injected by Playwright **after** load.

Set-up notes (checked):
- CSS injected before load is wiped: the page rebuilds its document. Checked: an init-script `<style id=cand>` was gone after load
  (`[ false, 'clamp(34px,min(10.4vw,4vw + 32px),84px)', '84px' ]`), and `page.addStyleTag` after load gave `72px`. The first round of
  pictures (made the first way) showed today's sizes under every label; they were deleted and redrawn.
- The repo's playwright 1.49.1 wanted browser build 1148; the machine has 1243. Fixed by symlinking the 1148 paths (setup only).

## 1. Today, measured (1440x900, computed font-size; winning rule read with the Chrome DevTools protocol)

**Page headline (h1)**
- 84 px (`.k-h1{font-size:var(--d-khead)}`, kit.css:9; token tokens.css:153 `clamp(34px,min(10.4vw,4vw + 32px),84px)`): Sets, Archetypes,
  About, Feedback, Not found, Speed, Types, Calc, Practice, Test Run, Compare, My Team, News. Same as the audit.
- 64 px (`.ra-h h1{font-size:var(--d64);line-height:.95}`, pages.css:1745; phone `.ra-h h1{font-size:var(--t34)}`, pages.css:1796):
  Ratings, Usage, Winning Teams, Events, This Week, How We Calculate, **plus Mystery Gifts and Track Record** (not in the audit's list;
  both still being built).
- Battle's first screen: 64 px from `.bt-head h1` (its own rule; audit P1-10, not part of this choice).

**Step heading (h2)**
- 40 px (`.k-h2{font-size:var(--d-ksec)}`, kit.css:30; `--d-ksec: clamp(26px,3.4vw,40px)`): Sets, Winning Teams, Archetypes, Speed, Types,
  Calc, My Team, Test Run, Events, News, Pokémon page.
- 28 px: About and Send Feedback via `.abt-fine .k-h2{font-size:var(--t28)}` (pages.css:3352) and `.inf-grp h2,.infp h2` (pages.css:3320);
  How We Calculate via pages.css:3320; Usage via `.gs-title h2` (pages.css:2035) and `.us-hh h2` (pages.css:2126).
- 34 px: This Week via `.wk h2{font:900 var(--t34)/1.2 ...}` (pages.css:3116).
- Phone (390): kit step headings render 26 px; the old rules give 24 (Usage, This Week) or 28 (About, How We Calculate).

## 2. The candidates

| Role | A | B | C |
|---|---|---|---|
| Headline | **84 everywhere (the kit's size)** | 64 everywhere | 72 everywhere |
| Step heading | **40 everywhere (the kit's size)** | 34 everywhere | 28 everywhere |

All candidates use the kit clamp, so phones follow the kit: headline 40.6 px at 390 (34 px under 385 wide), step heading 26 px at 390.
The 64 px pages today drop to 34 px on phones; under ANY candidate they show the kit's 40.6 px instead (see the 390 lengths below).
B64 and C72 would need a new display token (`--d-khead` max changed); 64 already exists as `--d64`, 72 does not exist (new token).

## 3. Pictures (docs/rebuild/pics/nov22/alt/wave3/)

Each sheet: TODAY, A, B, C side by side (1440: 2x2; 390: in a row), each labelled ON the picture with the rendered size;
the recommended one has the green band.

- W3-1 Headline, 4 pages: `w3-head-meta-*` (Ratings, 64 today), `w3-head-weekly-*` (This Week, 64 today), `w3-head-calc-*`
  (Damage Calc, 84 today), `w3-head-speed-*` (Speed Tiers, 84 today); each `-1440-day`, `-1440-night`, `-390-day`.
- W3-2 Step heading, 4 pages: `w3-step-about-*` (28 today), `w3-step-usage-*` (28), `w3-step-weekly-*` (34), `w3-step-sets-*` (40).

What I saw looking at them (my eyes, not a measurement):
- This Week's headline wraps to 3 lines at 84 (2 at 64 and 72).
- Usage at 40 (and at 34): the right-hand half-column heading "How Rillaboom is played" wraps to 2 lines and no longer lines up with
  "The top ten" beside it. At 28 both stay on one line. This breaks the "even text beside its neighbour" rule; see the recommendation.

## 4. Length change for every page that would change (experiments/page-lengths.mjs routes, day theme)

Measured by injecting each candidate on every route (scratchpad lengths.mjs, same method as experiments/page-lengths.mjs: scrollHeight
after 2 s). Each cell: screens (change vs today in px). Caps (CLAUDE.md desktop length rule): tool and list pages 3, reference pages 4.

**Not trusted: My Team (`team`), and now explained (measured after the first push).** Its height moved +144 to +272 px under
candidates that do not touch its 84/40 sizes. Cause, measured with five plain reloads and NO candidate CSS (scratchpad teamnoise.mjs):
one section finishes loading after the 2 s mark and grows. 1440: `H@2s 3285` in 4 of 5 loads (one already `3479`), `H@5s 3479` in all 5;
390: `H@2s 3656` in 2 of 5 loads, `3928` in the others, `H@5s 3928` in all 5. In plain words: the length script (2 s wait, same as
experiments/page-lengths.mjs) catches My Team half-loaded. Its real length is **3.87 screens at 1440** (3479/900; cap 3) and **4.65 at
390** (3928/844), not the 3.65-3.7 used so far. The My Team cells in the table are timing noise, not the candidates.
Follow-up for HH: experiments/page-lengths.mjs should wait for the page to stop growing (not a fixed 2 s) before its numbers are used.


**1440 wide** (screens = height / 900; only pages where some candidate changes the height by 8px or more)

| Page | today (h1 / step) | head-A84 | head-B64 | head-C72 | step-A40 | step-B34 | step-C28 |
|---|---|---|---|---|---|---|---|
| team | 3.65 (84px / 40px) | 3.87 (+194px) | 3.84 (+173px) | 3.64 (-13px) | 3.65 (+0px) | 3.84 (+169px) | 3.81 (+144px) |
| calc | 2.83 (84px / 40px) | 2.83 (+0px) | 2.8 (-20px) | 2.81 (-12px) | 2.83 (+0px) | 2.8 (-25px) | 2.77 (-50px) |
| practice | 1.4 (84px / -) | 1.4 (+0px) | 1.37 (-20px) | 1.38 (-12px) | 1.4 (+0px) | 1.4 (+0px) | 1.4 (+0px) |
| gauntlet | 2.87 (84px / 40px) | 2.87 (+0px) | 2.85 (-20px) | 2.86 (-12px) | 2.87 (+0px) | 2.85 (-13px) | 2.84 (-25px) |
| speed | 2.99 (84px / 40px) | 2.99 (+0px) | 2.97 (-20px) | 2.98 (-12px) | 2.99 (+0px) | 2.97 (-18px) | 2.96 (-30px) |
| types | 3.29 (84px / 40px) | 3.29 (+0px) | 3.25 (-40px) | 3.26 (-24px) | 3.29 (+0px) | 3.27 (-18px) | 3.25 (-37px) |
| meta | 3.65 (64px / -) | 3.66 (+11px) | 3.65 (+0px) | 3.65 (+0px) | 3.65 (+0px) | 3.65 (+0px) | 3.65 (+0px) |
| usage | 2.46 (64px / 28px) | 2.46 (+0px) | 2.46 (+0px) | 2.46 (+0px) | 2.52 (+53px) | 2.5 (+41px) | 2.46 (-1px) |
| sets | 2.23 (84px / 40px) | 2.23 (+0px) | 2.21 (-20px) | 2.22 (-12px) | 2.23 (+0px) | 2.21 (-19px) | 2.19 (-34px) |
| archetypes | 1.89 (84px / 40px) | 1.89 (+0px) | 1.84 (-40px) | 1.86 (-24px) | 1.89 (+0px) | 1.87 (-13px) | 1.86 (-25px) |
| tournaments | 2.09 (64px / 40px) | 2.23 (+130px) | 2.1 (+6px) | 2.19 (+94px) | 2.09 (+0px) | 2.08 (-13px) | 2.07 (-22px) |
| events | 2.76 (64px / 40px) | 2.98 (+198px) | 2.76 (+0px) | 2.82 (+56px) | 2.77 (+9px) | 2.75 (-10px) | 2.73 (-27px) |
| weekly | 3.52 (64px / 34px) | 3.67 (+130px) | 3.53 (+6px) | 3.55 (+22px) | 3.53 (+4px) | 3.51 (-15px) | 3.49 (-32px) |
| news | 2.55 (84px / 40px) | 2.55 (+0px) | 2.43 (-104px) | 2.44 (-96px) | 2.55 (+0px) | 2.53 (-18px) | 2.51 (-30px) |
| gifts | 2.28 (64px / -) | 2.52 (+215px) | 2.29 (+7px) | 2.47 (+167px) | 2.28 (+0px) | 2.28 (+0px) | 2.28 (+0px) |
| track | 1.89 (64px / -) | 2.13 (+215px) | 1.9 (+7px) | 2 (+95px) | 1.89 (+0px) | 1.89 (+0px) | 1.89 (+0px) |
| method | 1.91 (64px / 28px) | 2.17 (+238px) | 1.92 (+10px) | 1.95 (+34px) | 1.93 (+17px) | 1.92 (+5px) | 1.9 (-8px) |
| about | 2.11 (84px / 28px) | 2.11 (+0px) | 2.06 (-40px) | 2.08 (-24px) | 2.12 (+9px) | 2.11 (+2px) | 2.1 (-4px) |
| feedback | 1.3 (84px / 28px) | 1.3 (+0px) | 1.28 (-20px) | 1.29 (-12px) | 1.31 (+8px) | 1.31 (+2px) | 1.3 (-4px) |
| pokemon=Garchomp | 5.2 (84px / 40px) | 5.2 (+0px) | 5.18 (-20px) | 5.19 (-12px) | 5.2 (+0px) | 5.18 (-19px) | 5.13 (-66px) |
| compare | 1.18 (84px / -) | 1.18 (+0px) | 1.15 (-20px) | 1.16 (-12px) | 1.18 (+0px) | 1.18 (+0px) | 1.18 (+0px) |
| zzznotfound | 1.03 (84px / -) | 1.03 (+0px) | 1 (-31px) | 1 (-31px) | 1.03 (+0px) | 1.03 (+0px) | 1.03 (+0px) |

**390 wide** (screens = height / 844; only pages where some candidate changes the height by 8px or more)

| Page | today (h1 / step) | head-A84 | head-B64 | head-C72 | step-A40 | step-B34 | step-C28 |
|---|---|---|---|---|---|---|---|
| team | 4.33 (40.56px / 24px) | 4.65 (+272px) | 4.65 (+272px) | 4.33 (+0px) | 4.65 (+272px) | 4.65 (+272px) | 4.65 (+272px) |
| meta | 3.64 (34px / -) | 3.66 (+16px) | 3.66 (+16px) | 3.66 (+16px) | 3.64 (+0px) | 3.64 (+0px) | 3.64 (+0px) |
| usage | 4.12 (34px / 24px) | 4.19 (+57px) | 4.19 (+57px) | 4.19 (+57px) | 4.12 (+2px) | 4.12 (+2px) | 4.12 (+2px) |
| tournaments | 3.66 (34px / 26px) | 3.73 (+57px) | 3.73 (+57px) | 3.73 (+57px) | 3.66 (+0px) | 3.66 (+0px) | 3.66 (+0px) |
| events | 3.89 (34px / 26px) | 3.92 (+25px) | 3.92 (+25px) | 3.92 (+25px) | 3.89 (-2px) | 3.89 (-2px) | 3.89 (-2px) |
| weekly | 5.33 (34px / 24px) | 5.35 (+16px) | 5.35 (+16px) | 5.35 (+16px) | 5.32 (-6px) | 5.32 (-6px) | 5.32 (-6px) |
| gifts | 4.35 (34px / -) | 4.46 (+97px) | 4.46 (+97px) | 4.46 (+97px) | 4.35 (+0px) | 4.35 (+0px) | 4.35 (+0px) |
| track | 3.98 (34px / -) | 4.06 (+66px) | 4.06 (+66px) | 4.06 (+66px) | 3.98 (+0px) | 3.98 (+0px) | 3.98 (+0px) |
| method | 3.91 (34px / 28px) | 3.98 (+65px) | 3.98 (+65px) | 3.98 (+65px) | 3.85 (-46px) | 3.85 (-46px) | 3.85 (-46px) |
| about | 3.22 (40.56px / 28px) | 3.22 (+0px) | 3.22 (+0px) | 3.22 (+0px) | 3.21 (-8px) | 3.21 (-8px) | 3.21 (-8px) |

Reading (measured, from the table):
- Headline A84 adds +130 to +238 px at 1440 on the eight 64 px pages (Ratings +11 only). No page goes over its cap: closest is
  Events 2.76 → 2.98 (cap 3); This Week 3.52 → 3.67 (cap 4).
- Headline B64 shortens the 84 px pages by 20-40 px (News -104).
- Step A40 changes little: Usage +53, How We Calculate +17, others under +10.
- Phones (390): any headline candidate adds +16 to +97 px on the eight 64 px pages (they leave their 34 px phone size for the kit's
  40.6 px). Step candidates shorten How We Calculate by 46 px. Biggest: Mystery Gifts +97 px (0.11 of a screen).

## 5. Recommendation

**W3-1 Headline: A, 84 everywhere (RECOMMENDED).** Why: it is the size the kit and 13 pages already use, it keeps the big slanted
headline as bold as Sim asked ("choose bold"), and no page goes over its length cap (Events is closest at 2.98 of 3).
Cost to say plainly: the six list pages grow 130-238 px on desktop and 16-97 px on phones; This Week's headline goes to 3 lines.

**W3-2 Step heading: A, 40 everywhere (RECOMMENDED), with one honest catch.** Why: the kit's size on 11 pages; the old 28/34 come from
leaks (old wrapper rules outranking the kit), not from a choice. The catch: on Usage the right-hand half-column heading wraps at 40
(and 34). If Sim wants Usage's two headings on one line each, the fix is to give Usage's two-up heads a shorter text or let them stack,
not a different size; that is a separate small picture if he asks.

The CSS it would need (not applied):
- Headline A: delete `font-size:var(--d64)` from `.ra-h h1` (pages.css:1745) and `.ra-h h1{font-size:var(--t34)}` from the phone block
  (pages.css:1796); the four pages that don't use `k-h1` (Ratings, Usage, Winning Teams, Events) also add `k-h1` (audit P0-1, kHead).
- Step A: drop the font sizes from `.inf-grp h2,.infp h2` (pages.css:3320), `.gs-title h2` (2035), `.us-hh h2` (2126 and the phone
  line 2138), `.wk h2` (3116) and `.abt-fine .k-h2` (3352) where they hit a `.k-h2`; write the canon in kit.css only.
- Then: v2-guard, qcheck-all on the changed pages, before/after pictures to Sim.

## 6. Not checked

- My Team lengths (see above); 1280 and 1920 widths; night-theme lengths (night pictures only).
- Odd widths between 390 and 1440 (e.g. 700-1100, where the clamps are mid-range).
- Whether Sim approved the smaller sizes on purpose when he OK'd those pages (audit P1-1 says he may have).
- Battle's first screen headline (P1-10) and kicker casing (P1-3): not part of this job.
- No use test: nothing was built, only pictures.

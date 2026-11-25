# Phone length at 390 of every reskinned page: before the reskin vs today (helper hZ, Nov 23)

Game Plan step: "Phone length of every reskinned page at 390: each page no longer than today [before its reskin], or Sim accepted the difference".
Measured Mon Nov 23, about 3:15-4:00 PM by the clock (`TZ=America/New_York date`: 3:18:58 PM after the first full run).

## How it was measured (checked)
- Today = branch hz-phonelen at 2241a99f (HEAD when the job started), out/ from 0c992f69 (frozen data), built with
  `node app/build.mjs --v2 --preview-data --art=../src/v2/art/`.
- Before = 4f7220bb (Nov 21, 7:53 AM UTC, the last commit before the reskin; the same "pre" commit as desktop-length-nov22.md), `git archive`
  into the scratchpad, same out/, same build command.
- Both measured with a scratch copy of experiments/page-lengths.mjs that opens **each page in a fresh browser context** (nothing carried over
  from other pages; My Team measured alone): 390 x 844, hasTouch, day, `window.__PL_TEST = 1`, wait 2 s, `document.documentElement.scrollHeight`.
- Cross-check: the fresh-context numbers equal scratchpad/lengths-pre.json (the Nov 22 run of page-lengths.mjs on 4f7220bb) to the pixel for every
  page except Mystery Gifts (3,184 fresh vs 3,697 in the json: the live gifts depend on the clock), and equal research/lengths-nov23-0945.json for
  today on every page except My Box (2,237 fresh vs 2,402; the json visits My Team first, which fills the box).
- Pages that page-lengths.mjs does not cover (Team Sheet, empty My Team, Not found / Owner) were measured the same way; Team Sheet is the
  height of the open sheet (`.np-sheet` scrollHeight after `V2.openTeamSheet()`), as its reskin brief measured it.

## Table (390 x 844, px; screens = px / 844)
| Page (route) | Before | Today (2241a99f) | Diff | Verdict | Source of "before" |
|---|---|---|---|---|---|
| Home (home) | 6,527 | 6,933 | +406 | not reskinned (Sim kept it Nov 21, 7:10 PM); longer since (Top 10 strip, hero fixes). Home's length is Sim's call; not touched | 4f7220bb fresh run |
| Build (build) | 3,133 | 3,085 | -48 | ok | 4f7220bb fresh run |
| My Team (team) | 2,643 | 4,018 | +1,375 | accepted (Sim: My Team phone 4,018) | 4f7220bb fresh run |
| Empty My Team (team-empty) | 2,576 | 2,561 | -15 | ok | 4f7220bb fresh run |
| Team Sheet (open sheet) | 2,269 | 2,230 | -39 | ok | decisions.md Nov 21 10:47 PM (hS2: "phone 390 2,269 -> 2,232") |
| Battle (battle) | 1,819 | 1,768 | -51 | ok | 4f7220bb fresh run |
| Damage Calc (calc) | 1,705 (2,171 when Sim accepted) | 2,845 | +13 over the accepted 2,832 | accepted ("about +650"; decisions.md Nov 21 4:59 PM: 2,832 vs 2,171); 13 px past the number Sim saw: HH's call | 4f7220bb fresh run; decisions.md |
| Team Preview Practice (practice) | 1,638 | 1,614 | -24 | ok | 4f7220bb fresh run |
| Test Run (gauntlet) | 2,626 | 2,629 | +3 | **over** -> fixed (2,621) | 4f7220bb fresh run |
| Speed Tiers (speed) | 2,968 | 2,792 | -176 | ok | 4f7220bb fresh run |
| Type Chart (types) | 2,798 | 2,716 | -82 | ok | 4f7220bb fresh run |
| Ratings (meta) | 2,930 | 3,066 | +136 | **over** -> fixed (2,918) | 4f7220bb fresh run |
| Usage (usage) | 3,570 | 3,534 | -36 | ok | 4f7220bb fresh run |
| Popular Sets (sets) | 3,164 | 3,094 | -70 | ok | 4f7220bb fresh run |
| Archetypes (archetypes) | 2,459 | 2,280 | -179 | ok | 4f7220bb fresh run |
| Winning Teams (tournaments) | 3,402 | 3,139 | -263 | ok | 4f7220bb fresh run |
| Events (events) | 3,705 | 3,298 | -407 | ok | 4f7220bb fresh run |
| This Week (weekly) | 4,694 | 4,500 | -194 | ok | 4f7220bb fresh run |
| News (news) | 3,875 | 3,311 | -564 | ok | 4f7220bb fresh run |
| Mystery Gifts (gifts) | 3,184 (3,697 in the json) | 2,825 | -359 | ok (shorter against either number) | 4f7220bb fresh run; lengths-pre.json |
| Track Record (track) | 3,437 | 3,111 | -326 | ok | 4f7220bb fresh run |
| How We Calculate (method) | 3,440 | 3,336 | -104 | ok | 4f7220bb fresh run |
| About (about) | 2,774 | 2,786 | +12 | **over** -> fixed (2,770) | 4f7220bb fresh run |
| Send Feedback (feedback) | 1,418 | 1,375 | -43 | ok | 4f7220bb fresh run |
| My Box (box) | 2,402 | 2,237 | -165 | ok (and accepted today) | 4f7220bb fresh run |
| Pokémon page (pokemon=Garchomp) | 4,138 | 5,199 | +1,061 | accepted (Sim: Pokémon page longer) | 4f7220bb fresh run |
| Compare (compare, first visit: My Team as Team A) | 1,328 | 1,397 | +69 | **over** -> fixed (1,325) | 4f7220bb fresh run |
| Not found (notfound; owner shows it to visitors) | 943 | 1,012 | +69 | **over**, not fixed: see below | 4f7220bb fresh run |
| Owner page as the owner | none | not measured | - | no before number (the Nov 19 doc's 1.1 is the not-found view, "not a real reading") | - |
| Info sheets (move / Ability / item) | none | - | - | new since the reskin, no before number | - |
| Style guide (guide) | 5,154 | 5,154 | 0 | ok (not reskinned) | 4f7220bb fresh run |
| Pokémon sheet demo (sheet) | none | 3,730 page / 2,700 sheet | - | Preview-only demo route; no before number in a comparable state | - |

War room +172 is inside the My Team row (Sim accepted 4,018). My Box accepted today; it is shorter anyway.

## Over and not accepted: the fixes (branch hz-phonelen, phones only, nothing removed, no folds or tabs)
| Page | 320 before / today / after | 390 before / today / after | 820 today / after | Commit |
|---|---|---|---|---|
| Ratings | 3,123 / 3,200 / 3,104 | 2,930 / 3,066 / **2,918** | 4,633 / 4,633 | a77563da |
| Compare | 1,464 / 1,514 / 1,494 (still +30 at 320) | 1,328 / 1,397 / **1,325** | 1,272 / 1,272 | d89f6ca9 |
| Test Run | - / 2,707 / 2,699 | 2,626 / 2,629 / **2,621** | 2,961 / 2,961 | 97f1da29 |
| About | - / 3,138 / 3,122 | 2,774 / 2,786 / **2,770** | 2,660 / 2,660 | 297e3676 |

After-lengths: `W=320,390,820 ROUTES=meta,compare,gauntlet,about PAGE=app/dist/v2.html node hzlen.mjs` on 297e3676 (fresh context each).

Checks on 297e3676 (all four fixes together):
- `ROUTES=meta,compare,gauntlet,about node app/test/qcheck-all.mjs` -> "qcheck-all: 4 pages + 0 views x 5 widths x 2 themes, 0 findings, 0 new; 123s".
- `PAGE=app/dist/v2.html node app/test/tap-size.mjs` -> "tap-size: all passed".
- `PAGE=app/dist/v2.html node app/test/v2-unbounded.mjs` -> "v2-unbounded: none outside the named exception across 28 pages".
- Behaviour groups, art-only build (`node app/build.mjs --v2 --art=../src/v2/art/`, guard: clean), `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs <group>`:
  - C-battle (Test Run): "behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 458s".
  - D-meta-shell (Ratings, About): "behaviour: 117 pass, 0 FAIL, 41 known bugs, 1 fixed?, 7 skipped; 573s". The 1 "fixed?" is NAV-10 (focus in
    the Pokémon sheet), marked known but passing; it has nothing to do with these spacing changes.
  - A-team (Compare): "behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 1114s".

## The other "before" sources (named in the brief), and why the table uses 4f7220bb
- page-length-390-nov19.md (Nov 19, screens of 844, older data): meta 4.0, gauntlet 4.3, about 3.3, compare 1.3. By that source Ratings
  (today 3.63) and Test Run (3.11) were never over; About and Compare read the same as 4f7220bb.
- phone-length-nov20.md: the Nov 20 phone trims (news, events, weekly); no numbers for the four pages fixed here.
- heights-after-merge-nov19.md: Meta 390 limit 4,370 (default limits), far above today.
- The 4f7220bb run uses the same frozen data and the same fresh-browser method as "today", so it is the strictest fair "before";
  the table uses it for every page.

Not found (+69): the extra comes from the Nov 22 empty-space fix (design authority): the underdog card moved under the button with 64 px
of room for its sprite, which sticks 52 px out of the card. Spacing alone gives back about 40 px (972, still +29) unless the standard 64 px
page foot is cut on this one page. Options in the report.

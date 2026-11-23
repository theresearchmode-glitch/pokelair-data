# Full look-only sweep of the new site, Nov 22 evening (job 4, branch alt/sweep)

Report only: no site code changed. Tested commit: `82d5326b` (claude/design6 as of the job's start).
Clock at start: 5:58 PM (5:58:25) Sun Nov 22, 2026; report written 7:26 PM (7:26:27) (both from `bash docs/rebuild/now.sh`).
Baseline for "new or older": commit `90a13157` (Type Chart finished, committed 9:44 AM). It is the oldest commit in this shallow
clone, so it is the earliest "this morning" build I could test. I rebuilt it in a scratch folder (git archive, same node_modules
and frozen out/) and ran polish-check and the WebKit failures on it too.

## Setup fixes (setup only, no code or tests changed)
1. Playwright 1.49.1 looked for `/opt/pw-browsers/chromium_headless_shell-1148` and the first build failed
   ("Executable doesn't exist"). HH fixed it machine-wide by linking the 1148 paths to the installed 1243 browser. After that
   the build printed `built dist/v2.html (4128 KB; ...)`.
2. WebKit: `npx playwright install webkit` downloaded WebKit 18.2 (build 2104), but it would not start ("Host system is missing
   dependencies"). Fixed with `apt-get update` + `apt-get install -y libwoff1 libevent-2.1-7t64 libgstreamer-gl1.0-0
   libgstreamer-plugins-bad1.0-0 libavif16 libenchant-2-2 libsecret-1-0 libwayland-server0 libmanette-0.2-0 libgles2`.
   After that `webkit.launch()` worked. Note: this is WebKit for Playwright 1.49.1. GitHub's WebKit job installs
   playwright@1.63.0, so it runs a newer WebKit (see the WebKit caution below).

## Builds used (the scripts' headers and test.yml say which)
- `node app/build.mjs --v2 --preview-data` -> qcheck-all, tap-size (as in GitHub's checks).
- `node app/build.mjs --v2 --preview-data --art=../src/v2/art/` -> polish-check. It needs real data and real sprites: with
  TARGET=v2 it injects no data, and the earlier full real-font polish run (decisions.md, 4:08 PM entry) also used bundled data. Both flags together are what the Preview uses.
- `node app/build.mjs --v2 --art=../src/v2/art/` -> the behaviour groups (as in test.yml).

## Results: commands and exact result lines

| Check | Command | Exact result line | Plain meaning |
|---|---|---|---|
| Quality, every page + view | `PAGE=app/dist/v2.html node app/test/qcheck-all.mjs` | `qcheck-all: 27 pages + 15 views x 5 widths x 2 themes, 92 findings, 0 new; 1421s` (also: `(22 known findings no longer seen: remove them with KNOWN=write after a look)`) | Passes. Nothing new beyond the judged list. 22 judged items are gone (fixed or moved). The script doesn't print which, so I didn't list them. |
| Tap sizes | `PAGE=app/dist/v2.html node app/test/tap-size.mjs` | `tap-size: all passed` (43 pass lines, 0 FAIL) | Every named link and button is 24px+ tall and its tap area is 44px+. |
| Polish, all 30 pages, 320-2560 | `TARGET=v2 VIEWS=<all 30 routes> node experiments/polish-check.mjs` | `polish check: spill 19, uneven 22, lone 167, tap 7, size 23, bodyhead 2, lineh 17, glow 9, boxes 9, empty 10, space 217; page errors 0; 631s` | 0 page errors. Findings are listed below by new or older. |
| Polish, same, 9:44 AM baseline | same, on 90a13157 | `polish check: spill 18, uneven 17, lone 159, tap 7, size 9, bodyhead 1, lineh 8, glow 9, boxes 7, empty 10, space 199; page errors 0; 636s` | Since the morning: size +14, lineh +9, uneven +5, lone +8 (net), spill +1, space +18. |
| A-team, Chromium | `PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs A-team` | `behaviour: 139 pass, 0 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 1076s  (adapter v2)` | Same as the last green runs (139/0/4/2). |
| B-build, Chromium | same, B-build | `behaviour: 77 pass, 0 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 625s  (adapter v2)` | Same as baseline (77/0/14). |
| C-battle, Chromium | same, C-battle | `behaviour: 83 pass, 0 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 476s  (adapter v2)` | Same as baseline (83/0). |
| D-meta-shell, Chromium | same, D-meta-shell | `behaviour: 117 pass, 0 FAIL, 42 known bugs, 0 fixed?, 7 skipped; 603s  (adapter v2)` | Same as baseline (117/0/42/7). |
| A-team, WebKit | `BROWSER=webkit ... A-team` (FAILSHOT on) | `behaviour: 134 pass, 5 FAIL, 4 known bugs, 0 fixed?, 2 skipped; 1885s  (webkit, adapter v2)` | 5 FAIL. Re-run alone: 2 repeat (SUG-08, MU-04); SHARE-01, SHARE-03, SHEET-03 pass. |
| B-build, WebKit | same, B-build | `behaviour: 73 pass, 4 FAIL, 14 known bugs, 0 fixed?, 0 skipped; 1253s  (webkit, adapter v2)` | 4 FAIL, all repeat alone. |
| C-battle, WebKit | same, C-battle | `behaviour: 82 pass, 1 FAIL, 0 known bugs, 0 fixed?, 4 skipped; 490s  (webkit, adapter v2)` | X-04, an older Safari-only one (decisions.md, 8:32 AM). |
| D-meta-shell, WebKit | same, D-meta-shell | `behaviour: 117 pass, 0 FAIL, 42 known bugs, 0 fixed?, 7 skipped; 617s  (webkit, adapter v2)` | Same as Chromium. |

Machine load: the full WebKit runs overlapped other helpers' jobs (load average reached 20 on 4 CPUs). That is why I re-ran every WebKit
failure alone before judging it.

## WebKit failures: re-run alone, on today's build and on the 9:44 AM baseline
Commands: `BROWSER=webkit PAGE=app/dist/v2.html ADAPTER=v2 node app/test/behaviour/run.mjs <group> --only=<ids>`, run once in this
worktree and once in the baseline copy (an `--art` build of 90a13157).

| Test | Today, alone | 9:44 AM baseline, alone | Verdict |
|---|---|---|---|
| A SUG-08 "Nothing to fix" card | FAIL `page.setViewportSize: Target page, context or browser has been closed` | FAIL, same | Older (before 9:44 AM). WebKit closes the page; no picture was possible. |
| A MU-04 All 30 threat folds | FAIL `no threat fold to open` | FAIL, same | Older. Picture: pics/nov22/alt/sweep/webkit/A-MU-04.png |
| A SHARE-01, SHARE-03, SHEET-03 | pass | not run | Flaky under load (passed alone) |
| B X-04 sliders | FAIL `Megas slider not at 2: null` | FAIL, same | Older. B-X-04.png |
| B AUTO-04 Megas 0 rebuild | FAIL `My team Megas not 1` | FAIL, same | Older. B-AUTO-04.png |
| B CORES-09 Teams with it | FAIL `filter chip missing /Incineroar ×/` | FAIL, same | Older. B-CORES-09.png |
| B SUGG-15 Mega-over-goal note | FAIL `nothing visible: [data-v2slide="sgmega"] > button[data-v="1"]` | FAIL, same | Older. B-SUGG-15.png |
| C X-04 calc button under finger | FAIL `Rain moved from 423.546875 to 403.546875 px` | FAIL, same | Older (decisions.md 8:32 AM: the same 21px Safari shift) |

Re-run result lines (today): `behaviour: 3 pass, 2 FAIL ...; 44s (webkit)`, `behaviour: 0 pass, 4 FAIL ...; 20s (webkit)`,
`behaviour: 0 pass, 1 FAIL ...; 4s (webkit)`. Baseline: `0 pass, 2 FAIL ...; 10s`, `0 pass, 4 FAIL ...; 20s`, `0 pass, 1 FAIL ...; 4s`.
Meaning: none of the WebKit failures was caused by today's afternoon work.
Caution, I'm unsure: GitHub's WebKit A-team job (newer WebKit via playwright 1.63) was green on HOME-01 at 12:15 PM, and
these A/B failures were never logged there. So some of them may be quirks of this old local WebKit 18.2 rather than real
Safari bugs. Not checked: these tests under playwright 1.63's WebKit or on Sim's PC.
Each FAILSHOT picture is the test's last page: the full My Team page at 1280. It shows the state, not a marked spot.

## Polish-check: findings NEW since the 9:44 AM baseline (checked by diffing the two runs' finding lines)
Pictures are in docs/rebuild/pics/nov22/alt/sweep/ (deviceScaleFactor 2, real data and sprites, the finding outlined in pink).
I looked at each picture myself. "Committed" times are git commit times of the commit that brought in the page.

Real, worth fixing (seen in the pictures):
- **N1 This Week, 960, day (night same rule): weather tiles cut their big numbers.** "9.0%" and "6.0%" are clipped at the tile's
  right edge (+5px spill). At 960 the left column also leaves a large empty area under the two tickets. New today: This Week on the kit
  (8628bbd6, committed 4:15 PM). Picture: n1-weekly-weather-960-day.png
- **N2 Popular Sets, 320, day: source chips overlap.** "Online tournaments" runs 11px past its chip into "Showdown ladder", and
  the three chips wrap unevenly at 400-480 (1/2/2 lines). Usage's chips also wrap unevenly at 480 (1/2/2) and 880-1200 (2+1).
  New today: the chips moved into the kit sentence (Sets/Usage kit work). The baseline had the same uneven wrap on the old
  `.ra-filt` chips at 400-480 but no spill. Picture: n2-sets-sources-320-day.png
- **N3 Popular Sets, 960-1040, day: "Base Speed" 12px past the facts box** (`div.lo-id > div.gs-facts`). New today (Sets loadout,
  c4effea3, committed 12:19 PM, and the kit Sets work). Picture: n3-sets-facts-1000-day.png
- **N4 News, 880, day: the winner's six sits 5 + 1** (Raichu alone on a second row). At 720-800 it is 4 + 2. New today: News on the
  kit (27be137e, committed 5:06 PM). Picture: n4-news-six-880-day.png

Small, need Sim's eye (picture shows the look is mostly fine):
- **N5 Winning Teams, 320-480, day: action links** "Copy for Showdown / Set as Opponent › / Compare ›" wrap 2/2/1 lines, and the
  first two measure 5-7px past their box at 320. Visually they read fine (picture). New today: Winning Teams on the kit (ab2b0fd3,
  committed 11:40 AM). n5-winning-links-320-day.png
- **N6 Events, 1440, day: head counts 115 / 107 / 8 / "this regulation"** sit 3 + 1. At 1120 they are 2 + 1 + 1. "this regulation" is
  a label, not a count, sitting in the counts row. New today: Events on the kit (merged 2:50 PM). n6-events-counts-1440-day.png
- **N7 Type Chart, 960-1200, day: the type chips in "Hitting back"** sit 3 + 1 (e.g. Grass Ice Bug / Steel). Changed after 9:44 AM.
  The exact commit isn't checked: the shallow history only shows a merge touching types.js. n7-types-chips-1000-day.png
- **N8 Kit go button (`.k-go`), 390, day and night: 20.3px**, off the type scale (13/15/16/17/20/22/...). Not new: the kit part already
  measured 20.3px this morning on Speed, Practice, Calc, My Team, Sheet and empty My Team. New today is only its spread: 15 pages now
  (Archetypes, Events, Feedback, Home, News, Not found, Owner, Sets, Winning Teams, Type Chart, Usage, This Week were added).
  One fix in kit.css would cover all of them. n8-kit-go-390-day.png
- **Kit sentence word "Show me" / "New crew?" at 820: 23px** (off scale) on Events, Winning Teams, My Team, Sheet. New on Events
  and Winning Teams; older on My Team/Sheet (Calc's 23px menu word is also older). No picture.
- **Line height under 1.45 on kit notes**: `.k-note` 1.3 at 390 on Events, Winning Teams, This Week (older on My Team/Sheet);
  `.k-hint` 1.4 on Archetypes and Winning Teams; News headline links `a.dp-hl` 1.35 at 390/820; This Week `span.wk2-tw > p` 1.4.
  New on those pages today; the root is the kit's `.k-note` / `.k-hint`. No picture.
- **Events 820/1440: count "115" in the "Show me all" chip is 20px in the body font** (bodyhead). Looks intended as a small count
  beside the word (seen in a picture I didn't keep). New today.
- **Home, day and night: the hero kicker (`.sdh-k`) is flagged as 4 stacked shades**, plus 2 new 'space' items on the Home top
  strip (sd-top paddingLeft, kicker marginLeft). New today (Home Top 10 strip, 89b83db8). Not judged by eye.
- 'lone' items new today that I looked at and judged fine or checker noise: Sets loadout key-value row (Item / Ability / Nature
  then the note row), Winning Teams `p.wt2-pl.big`, Usage `div.us-groups` 3 + 1 at 1120-1360, This Week button rows
  (`wk2-r`, `wk2-rc`, `wk-fr`: inside one button, name + number lines), `k-move` 2 + 1 inside a move button. Also the 3-item
  `.k-sec` head rows (title / sub / link) on News, Sets, Winning Teams, This Week, Events at some widths: a kit pattern, not a lone tile.
- 'space' items new today are mostly auto margins (`.k-sec > .k-link marginLeft` 45-515px, the header nav). That is the known
  false-positive class (HANDOVER: "space on auto margins"). Two that are real off-grid numbers: Feedback `#abtMail ... marginTop`,
  This Week `h3.wk2-sub > button.sg2-tip marginTop 10px` (the same 10-11px `sg2-tip` offset is older on My Team, Sheet, Track).

## Polish-check findings that are OLDER (present at 9:44 AM too), still open
- **O1 How Ratings Work (track), every width: "TOTAL 230×" 3-13px past its box** (13px at 320-640). At 390 the "×" reaches the
  card edge. Picture: o1-track-total-390-day.png
- **O2 Damage Calc, 320: "Sneasler's set" title 10px past its card.** Picture: o2-calc-set-320-day.png
- Gauntlet 320 "Mega Staraptor 4" +4px; Sheet 320 `.ms-n` "53% win rate 10,946 games" +6px.
- Uneven: the Tournaments tab bar (Winning Teams / Events / Archetypes / This Week) wraps 2/1/1/2 at 320-400 (also in the 8:14 AM
  sweep); Calc switches at 400; Meta tier rows `gs-row` (one long name wraps: "Hisuian Arcanine", "Basculegion (F)", "Lycanroc (Dusk)",
  "Alolan Ninetales"); guide slide at 320.
- Tap (phones/tablets, drawn box under 44px): Battle "0 of 4 picked" 26px; Build "How Cores Are Ranked" 18px; Home `.sdt-go` tool
  titles 19-37px. Home's were judged earlier (decisions.md 10:47 AM: its stretched-card link gives 86-110px real tap areas). tap-size
  passes.
- Glow: This Week weather tile labels (`li.wk-tile.wx`) and guide "Top tier" in dark mode. Boxes: Calc photo picture (`pc-pic`),
  Home six/ticket parts, the move-type tag `k-mt` (the element went from span to button today, same finding).
- Empty: My Team / Sheet hero fills 50-58% of its width at 2240-2560.

## Pictures (docs/rebuild/pics/nov22/alt/sweep/)
n1-weekly-weather-960-day.png, n2-sets-sources-320-day.png, n3-sets-facts-1000-day.png, n4-news-six-880-day.png,
n5-winning-links-320-day.png, n6-events-counts-1440-day.png, n7-types-chips-1000-day.png, n8-kit-go-390-day.png,
o1-track-total-390-day.png, o2-calc-set-320-day.png, and webkit/ (A-MU-04, B-X-04, B-AUTO-04, B-CORES-09, B-SUGG-15, C-X-04: the
FAILSHOT full-page pictures of the repeatable WebKit failures).

## What was NOT checked
- qcheck-all's 22 "no longer seen" known findings: not listed (the script only counts them).
- polish-check style checks run only at 390 / 820 / 1440 (its STYLE_W default); layout checks are day only (the script's design).
  I pictured night only for one item (none of the new findings is night-only by the checker).
- No picture for every finding: only the ones listed above; the rest are from the checker's lines and I didn't judge them by eye.
- WebKit failures were not run under playwright 1.63's WebKit (GitHub's) or on Sim's PC, so real Safari bug vs. local-engine quirk
  is unknown for A SUG-08/MU-04 and the four B tests.
- The flaky A SHARE-01, SHARE-03, SHEET-03 (failed under heavy load, passed alone) were run alone once only.
- Not run: tap-once.mjs, v2-minors, overlap, page-lengths, contrast, the other test.yml jobs, iPhone device emulation, odd window
  drags, real touch devices.
- Commits after 82d5326b (other helpers' work landing tonight) are not covered.

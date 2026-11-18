# Lighter first visit (Plans pl-2a): where the bytes and seconds go, and what gets closest to 2.5 s

Look-only. Written Wed Nov 18, 2026, 12:48 AM EST (clock, docs/rebuild/now.sh). No site source changed. Prototypes are test copies
in the scratchpad; one lean build edited `app/parts-v2.json` in this worktree for a moment and put it back (git status clean).

## How it was measured

- Build: `node build.mjs --v2 --art=v2art/ --preview-data --one-art-size` at d6e5084f (claude/design6). Page 3,804,757 bytes.
- Served by a local Node server: gzip -9 for text, no-store, HTTP/1.1. Sprites from `app/src/v2/art` (384 px, the one-size build).
- Headless Chromium (Playwright). Phone 412x823 at DPR 1.75. Fresh context, cache off, every run.
- Throttling through CDP: CPU 4x.
  - Slow 4G: 1.44 Mbps down, 0.675 up, 562 ms latency.
  - 4G: 9 Mbps, 1.5 Mbps, 165 ms.
- 3 runs per case, interleaved across variants. Numbers are medians with [min-max].
- What the columns mean:
  - **buttons**: the first screen's buttons are on screen and painted.
    - Home: the first `.sdh-go` link (Build Me a Team).
    - My Team: the first link or button in `#main`.
    - It is the same moment as "main", 10-25 ms later, in every run.
  - **main**: the loading panel in `#main` is replaced by the page.
  - **longest task**: the Long Tasks API.
  - **bytes**: encoded bytes on the wire (CDP loadingFinished).
- Machine: shared with other helpers.
  - Load average 3.7 at the start (04:38 UTC). It ranged 1.9-7.9 during the runs and was 4.2 at the end, on 4 cores.
  - So run-to-run noise on "main" is about 300 ms.
  - This CPU is faster than the outside review's. The review's 3.8 s for My Team is our 3.0 s, a ratio of about 1.27.
- Tools: `scratchpad/agent-a0c1-firstvisit/tools/`.
  - `fv.cjs`: one run.
  - `batch.sh` and `st.cjs`: interleaved runs and medians.
  - `tap.cjs`: Home, then tap to My Team.
  - `variants.mjs`, `crowdvar.mjs` and `lean2.mjs`: test copies.
  - `crowdart.py`: small crowd files and sheets.
  - `sizes.cjs`: the crowd's drawn sizes.
- Raw data: `scratchpad/agent-a0c1-firstvisit/out/*.jsonl`.

## 1. Where the bytes and seconds go (measured)

### Baseline, today's build

| Case | First paint | Buttons / main | Longest task | Bytes |
|---|---|---|---|---|
| Home, 4G | 916 ms [832-928] | 3,343 / 3,326 [3,126-3,486] | 644 [595-738] | 8,746 KB (crowd 7,423) |
| Home, slow 4G | 2,764 [2,756-2,784] | 8,625 / 8,600 [8,460-8,631] | 549 [547-559] | 8,746 KB (crowd 7,423) |
| My Team, 4G | 884 [760-944] | 2,968 / 2,956 [2,923-3,544] | 510 [447-820] | 1,218 KB |
| My Team, slow 4G | 2,768 [2,768-2,968] | 8,360 / 8,350 [8,322-8,720] | 447 [442-476] | 1,364 KB |

Later interleaved sets measured base again: My Team 4G main 2,997 and 3,012; Home 4G 3,121-3,181. They match.

### What the bytes are (gzip -9, measured from the built file and the CDP byte counts)

| Part | Raw | gzip | Note |
|---|---|---|---|
| HTML in total | 3,716 KB | **948 KB** | brotli 720 KB |
| preview daily data | 1,222 | 250 | Preview only. Largest: results 47, events 48, model 47, practice 35 gz |
| main script | 1,840 | 573 | |
| – of which data tables | 353 | 68 | RESULTS 25, NP_LOGO 17, LEARN 15, ROSTER 12 gz |
| – of which code not used at Home/My Team start | 381 | 121 | The 40 files dropped in the lean prototype |
| CSS | 526 | 92 | The `pages` layer alone is 369 raw / 61 gz |
| static first screen | 99 | 20 | |
| head (font CSS, icons) | 28 | 16 | |
| Fonts | | 106 | Unbounded latin 50, Instrument Sans latin 56 |
| Sprites, Home first screen | | 269 | 12 files at 384 px |
| Sprites, My Team | | 163 on 4G, 310 on slow 4G | More of the lower ones load in time |
| **Herd crowd (Home only)** | | **7,423** | 333 files at 384 px, drawn 17-58 px on a phone |

### Totals

| Page | Total | Without the crowd |
|---|---|---|
| Home | 8.75 MB | 1.34 MB |
| My Team | 1.22-1.36 MB | – |

### What the seconds are

**Slow 4G is bandwidth-bound.** My Team: 1,364 KB at 1.44 Mbps is about 7.8 s of transfer. Main content comes at 8.35 s.
Only fewer bytes before the first draw helps there.

**4G is mostly CPU.** The HTML takes about 1.0-1.2 s to arrive. The other 1.8-2.0 s before main content is the CPU:
- decoding and tokenizing the HTML;
- compiling the 1.8 MB inline script on the main thread;
- the work when the data arrives (see speed-report-nov17.md for the split).

**The crowd does not slow the first screen.** It loads after `load` and after the 14 first-screen pictures.
- Measured, Home, crowd on vs off:
  - 4G: main 3,121 vs 3,082.
  - Slow 4G: main 8,559 vs 8,588.
- That is within the noise.
- Its main-thread cost after main content is 120-260 ms of long tasks in total.

**What the crowd costs:**
- 7.4 MB of data. That matters on phone plans.
- It finishes late:
  - 4G: 15.5 s [15.3-15.7].
  - Slow 4G: 53-60 s.
- Tapping Score My Team 1 s after Home's buttons appear:
  - My Team drew in 429 ms with the crowd loading and 313 ms with no crowd (4G).
  - On slow 4G: 381 vs 290 ms.
  - Small, and in a noisy test.

**It is the number of files, not only the bytes.**
- Making the crowd files 3.4x smaller (384 → 128 px) cut its finish time only from 15.5 s to 13.6 s on 4G.
- Putting the same pictures in 4 sheets cut it to 5.6 s (see change 4).
- Caveat: the local server is HTTP/1.1, 6 connections, so this overstates the cost of each file compared with HTTP/2.
  Which protocol the Claude artifact host uses: not checked.

## 2. The changes that get closest to 2.5 s, within the 511-file cap

The goal is My Team main content 2.5 s on 4G. That is the outside review's measure (3.8 s there; 3.0 s on this machine).

| # | Change | My Team 4G main (measured) | Other measured effect | Files added | Visible? |
|---|---|---|---|---|---|
| 1 | Main script in its own file | 3,012 → 2,748 (−260) | Longest task 545 → 352. Slow 4G 8,519 → 7,871 | +1 | No |
| 2 | Preview data as a .json fetched beside the page (Preview only) | with 1: 2,669 | First paint 0.9 → 0.54 s on 4G, 2.8 → 1.5 s on slow 4G | +1 | No (the loading panel shows sooner) |
| 3 | Load the 40 not-needed-at-start files later | with 1+2: 2,487 (−525 from base) | Slow 4G 8,519 → 7,321 (−1.2 s). −121 KB gz | +1 or more | No, if done right |
| 4 | Crowd from 4 sprite sheets at 128 px | No change (the crowd is after the first screen) | Home 8.75 → 3.3 MB. Crowd done 15.5 → 5.6 s on 4G, 53 → 23 s on slow 4G | +4 (sheets), 333 crowd requests → 4 | **Yes**: crowd sharpness. Needs Sim's yes |
| 5 | Brotli where the host allows | About −0.27 s (Nov 17, noisy) | HTML 948 → 720 KB; slow 4G about −1.3 s | 0 | No |

### Change 1: main script in its own file

- What: `app/build.mjs` writes `v2.js`. The page loads it with a plain `<script src>` at the same spot.
- **No `<link rel=preload>`.**
  - Measured with a preload: slow 4G first paint got worse, 2.8 → 4.8 s. The 584 KB script competed with the HTML and the fonts.
  - The preload scanner finds the tag anyway.
- Saving, measured in two interleaved sets:
  - main −260 and −390 ms on My Team 4G;
  - longest task 508-545 → 334-352 ms;
  - total blocking time −300 to −540 ms;
  - slow 4G −650 ms in the set without a preload.
- The cause: Chrome compiles an external script off the main thread while it streams in.
- Risk: low.
  - The Preview and live publish must carry `v2.js` (file count 354 → 355).
  - The build's static-first-screen step must still work.
  - Repeat visits gain only if the host lets the browser cache `v2.js`. Not checked for the Claude host.
- Visible: no.

### Change 2: Preview data out of the HTML

- What: Preview builds put the 1.17 MB data in `preview.json`, fetched from `<head>`.
- Saving, measured:
  - First paint (the static header and loading panel) 856-904 → 532-556 ms on 4G, and 2.7-2.8 → 1.5 s on slow 4G.
  - Main: −100 to −230 ms on 4G (noise-sized alone). With change 1: −340 to −415 ms.
- It is only a Preview change.
  - The live site does not embed this data. It reads the artifact database instead.
  - So on live, 1+3 are what count. The live store's timing was not measured (no store here).
- Risk: low. Note the `__NP_CLAUDE` hand-over for the iPhone app (build.mjs comment, Nov 12) must keep working.
- Visible: no, except the loading panel appears sooner.

### Change 3: load the code that start does not need later

- The prototype drops 40 files from the build:
  - battle, pokemon, calc, meta, box, winning, events, compare, usage, types, practice, thisweek, track, sets, speed, guide, owner,
    gauntlet, share-slab/tape;
  - 22-auto-build, 44-share-images, 23-coverage, 21-sets, 31-set-edits;
  - the data files for those pages.
  - The full list is in `tools/lean-final.txt`.
- Checked:
  - Home and My Team draw with no errors.
  - My Team's text is identical (hash).
  - Home is missing two move names (Solar Beam, Rock Slide), so one of the dropped files feeds a Home band and must stay.
- It only measures what start would cost without them. A real change has to load them after the first draw, or on the first visit
  to a route.
- Saving, measured, on top of 1+2:
  - −121 KB gzip;
  - My Team 4G 2,669 → 2,487 ms, and 2,582 → 2,636 in the other set (noise-sized there);
  - slow 4G 8,118 → 7,321 and 8,005 → 7,361 (−0.65 to −0.8 s).
- Risk: medium.
  - Routes, search, deep links (#calc...), and `V2.pages` registration.
  - Globals used across files (the prototype found `teamTitleFor`, `evDate` and the core data).
  - It needs a tested loader and a "loading" state per page.
- Visible: no, if done right. A first tap on a lazy page may wait a moment on a slow connection; that wait needs its loading state.

### 1 + 2 + 3 together

**My Team 4G main 2,487 ms [2,451-2,574]** against 3,012 [2,758-3,156] in the same interleaved set: −525 ms. It meets 2.5 s on
this machine. On the outside review's slower machine it would be about 3.2 s: my estimate from the 1.27 ratio, not tested.

Home 4G with 1+2: 2,731-2,785 against 3,149-3,181 base. The lean set was 2,872 and 3,114. It is noisy; the second lean set ran at
load average 7.9.

Reaching 2.5 s on the review's machine as well needs the remaining work cut too: the data-arrival draw and the CSS parse
(estimated from speed-report-nov17.md, not re-traced here).

### Change 4: the herd crowd (Sim chose to keep all 345: every option keeps them)

**4a. Small crowd files in sprite sheets (recommended).**
- The crowd is drawn at 17-58 css px on phones. Measured, `sizes.cjs`:
  - 390@3: max 171 device px, median 81.
  - iPad 820@2: max 248, median 116.
  - 2560@1: max 186.
- Packing the 333 at 128 px tall into 4 webp sheets (q80), measured:
  - 1,996 KB on the wire, against 7,423 KB today;
  - crowd done 5.6 s on 4G (was 13.6 s with the same 128 px files one by one, and 15.5 s today); 23 s on slow 4G (was 45 / 53-60);
  - no long tasks after main (0-71 ms, against 226 with 333 files).
- Files: +4 sheets and 1 small JSON of positions (or put the positions in the script). The total stays near 360 of 511.
- Work:
  - Each crowd member becomes an element showing its part of the sheet (CSS background-position, or a cropped `<canvas>`/`<img>` in
    an `overflow:hidden` box).
  - `V2.sdhPut` must keep feet-at-bottom placement and the same aspect ratio.
- Risk: low to medium. The layout code changes, not the data.
- Visible: **yes**.
  - At 128 px, the nearest crowd members on iPad (up to 248 device px) and big desktop screens would look softer.
  - A middle option: the nearest 30-40 crowd members keep their 384 px file (already on the artifact), the rest come from the sheets.
  - Sim's eye is needed on the sharpness: pictures at 390@3, 820@2 and 1920 before and after.
- Sizes for other choices, measured:
  - 96 px: 1,390 KB in 4 sheets;
  - 192 px one by one: about 3.5 MB (estimate from 102 of 333 files done = 1,087 KB).

**4b. Smaller crowd files, one by one (no sheet).**
- 128 px: 2,164 KB. 96 px: 1,558 KB.
- But 333 more files breaks the 511 cap on the Claude host (346 + 333 = 679). Public host only.
- Crowd finish is little faster on HTTP/1.1 (13.6 / 13.5 s on 4G) because the time is in the file count.

**4c. Policies that keep all 345 but load the crowd later or less often.** Not measured; they decide when the 7.4 MB (or 2 MB with
4a) is spent, not how much.
- Skip or delay the crowd when `navigator.connection.saveData` is on, or `effectiveType` is 2g/3g.
  - Chrome and Android only. iOS Safari has no `navigator.connection`, so iPhones would still load it. My knowledge of browser support,
    not re-checked today.
- Load it when idle (`requestIdleCallback`; Safari needs a timer fallback), or when the hero has been on screen for a moment.
- Visible: yes on those connections; the crowd appears later or not at all there. Needs Sim's yes.

**4d. A cap on the crowd.** Ruled out by Sim's choice (all 345 stay). With 4a it is not needed.

### Change 5: Brotli

Measured Nov 17: HTML 922 → 700 KB, My Team slow 4G −1.3 s. Today 948 → 720 KB. It depends on the host. Whether the Claude
artifact host sends brotli or gzip: not checked.

## 3. Now, or on the public host

| Change | Claude host (Preview / live) now | Public host |
|---|---|---|
| 1 Script in its own file | Yes (+1 file). Repeat-visit caching depends on the host's headers (unsure) | Yes, with a hashed name cached for good (docs/website-performance.md) |
| 2 Preview data as .json | Yes, Preview only | Becomes the dated data files plus the manifest (docs/website-performance.md section 1) |
| 3 Lazy code | Yes, as 1-3 extra files | Yes. Chunks with hashed names |
| 4a Crowd sheets | Yes: the only crowd fix that fits the 511 cap | Yes. Or 4b (individual small files) since there's no cap |
| 4c Crowd policy | Yes (code only) | Yes |
| 5 Brotli | Up to the host, not in our hands (unsure what it does) | Yes (Vercel does it automatically) |

### Not measured here

- The live artifact database's timing (data docs on live).
- HTTP/2 on the real host.
- Real phones.
- Repeat visits.

## Notes

- The earlier speed fixes are already in (each document once, the data-arrival split, the planner steps). The long task is now
  450-650 ms, not the 1 s freeze of Nov 17.
- The hero notes in `stampede-hero.js` say the crowd adds "4.6 MB (7.5 MB with one sprite size)". Measured here: 7,423 KB on the
  one-size build. That matches.
- Housekeeping: an older helper's scratch folders (`scratchpad/fv`, `scratchpad/fv18`, from 01:00-02:30 AM) were briefly
  written into before this helper moved to its own folder. `fv18/site/v2.html` was overwritten with today's build. Its tools
  folder was restored, and nothing in the repo was touched.

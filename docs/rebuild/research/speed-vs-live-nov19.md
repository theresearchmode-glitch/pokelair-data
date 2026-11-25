# Speed: today's live page vs the new site as the switch would publish it (switch-readiness "speed vs today's live site")

Look-only. Written Wed Nov 18, 2026, 8:33 PM Eastern (docs/rebuild/now.sh). No site code, test or data changed. Both pages were built
into scratch copies and measured from the scratchpad. Branch read: claude/design6 at b4b805b2.
Every number below is **measured** (the command and the raw lines are listed) unless it says **not checked** or **unsure**.

## Plain summary
1. **My Team, time to main content: faster (measured).** New site, opened at #team: 2.8 s phone / 3.1 s desktop. Live page, tapping My team as
   soon as Home shows (it has no #team link): 5.4 s / 5.6 s. Same tap path on the new site: 3.4 s / 4.0 s. The ranges do not overlap.
2. **Home, time to main content: about the same on desktop, a little faster on phone (measured; the gap is close to the noise).** The live page
   draws Home first with its built-in Nov 11 numbers: 3.4-3.8 s phone, 3.2-3.4 s desktop. The new site: 2.9 s phone, 3.1-3.7 s desktop.
   With **today's** numbers on screen, the live page reaches Home at 3.9-4.7 s. The new site is faster on that measure in both sets.
3. **Longest task: much shorter (measured).** Live: 1.7-2.0 s, a single freeze, in every case. New: 0.3-0.4 s before main content and 0.4-0.8 s in
   the first 15 s.
4. **Bytes and requests up to main content: fewer (measured).** Up to main content: live 1.0-1.4 MB in 9-21 requests; new 0.82-1.0 MB in 4-11.
   Over the whole visit, **My Team is lighter** (1.1 vs 2.0-2.7 MB) and **Home is heavier** (3.7 vs 1.9 MB). The extra Home bytes are the
   herd crowd's 4 sheets (1.85 MB), which load after the first screen.
5. **Unsure / unknown.**
   - The absolute times. The machine was very busy: load average 10.6-16.8 on 4 cores, against 1.9-7.9 in the Nov 18 report.
   - The pl-2a goal (My Team 2.5 s on 4G): the new site measured 2.8 s phone here. **Whether it meets 2.5 s on a quiet machine: unknown.**
   - Everything about the real claude.ai frame and a real phone (see "What this cannot show").

## The table (5 runs each, interleaved; median [min-max]; ms and KB)

Set 1: every case, 01:19-01:29 UTC. Set 2: Home only, 01:29-01:33 UTC, run because Home at 1280 looked ambiguous.

| Width | Page | Site | Main content | Live: today's data drawn | Longest task before main | Longest task, first 15 s | KB to main | Requests to main | KB whole visit | Requests whole visit |
|---|---|---|---|---|---|---|---|---|---|---|
| 390 | Home (set 1) | live | 3,756 [2,925-3,900] | 4,667 [3,760-4,742] | 1,978 [1,547-2,149] | 1,978 [1,547-2,149] | 1,068 | 10 [9-15] | 1,934 | 38 |
| 390 | Home (set 1) | new | 2,894 [2,428-3,745] | (draws with today's) | 342 [175-371] | 526 [438-753] | 818 | 4 | 3,729 | 55 |
| 390 | Home (set 2) | live | 3,378 [3,103-3,612] | 3,942 [3,660-4,616] | 1,735 [1,579-2,057] | 1,735 | 1,177 | 13 [9-15] | 1,934 | 38 |
| 390 | Home (set 2) | new | 2,909 [2,653-3,380] | (draws with today's) | 278 [233-364] | 629 [510-716] | 818 | 4 | 3,729 | 55 |
| 390 | My Team, tap from Home | live | 5,384 [4,236-6,906] | 4,709 | 2,019 [1,195-2,259] | 2,019 | 1,416 | 21 [15-25] | 2,656 [2,456-2,870] | 61 [55-68] |
| 390 | My Team, tap from Home | new | 3,414 [3,139-3,744] | - | 630 [565-704] | 630 | 956 | 10 | 1,213 | 22 |
| 390 | My Team, opened at #team | new | **2,835 [2,408-3,092]** | - | 326 [241-499] | 373 [326-499] | 818 | 4 | 1,106 | 17 |
| 1280 | Home (set 1) | live | 3,355 [2,970-3,773] | 4,165 [3,493-4,532] | 1,817 [1,623-1,981] | 1,817 | 1,043 | 9 [9-15] | 1,901 | 37 |
| 1280 | Home (set 1) | new | 3,695 [3,171-4,008] | (draws with today's) | 388 [332-531] | 715 [643-1,041] | 818 | 4 | 3,763 | 56 |
| 1280 | Home (set 2) | live | 3,189 [2,780-3,775] | 4,015 [3,065-4,628] | 1,755 [1,645-2,091] | 1,755 | 1,043 | 9 [3-15] | 1,901 | 37 |
| 1280 | Home (set 2) | new | 3,106 [2,951-3,415] | (draws with today's) | 302 [291-341] | 731 [636-832] | 818 | 4 | 3,729 | 55 |
| 1280 | My Team, tap from Home | live | 5,624 [4,867-5,674] | 4,528 | 1,776 [1,662-2,329] | 1,776 | 1,416 | 21 [15-29] | 1,977 [1,785-2,181] | 39 [33-46] |
| 1280 | My Team, tap from Home | new | 3,987 [3,931-4,851] | - | 819 [661-1,228] | 819 | 1,006 | 11 [10-18] | 1,281 | 24 |
| 1280 | My Team, opened at #team | new | **3,059 [2,587-3,403]** | - | 365 [295-523] | 523 [439-604] | 818 | 4 | 1,106 | 17 |

Notes:
- A single number in a KB or request cell means all 5 runs were the same or within a few KB; the full ranges are in the raw file.
- No run had a page error, a failed request, a missed tap or an unfinished request. Checked in `stats.mjs`: "unfinished 0 failed 0 errs 0
  tapErr 0" on every row.

Both pages show the same team when My Team draws: the sample "Sun Tailwind (sample)", Strength Score 92 Top tier, Mega Charizard Y first.
**Checked** on the end-of-run screenshots at 390, `out/live-team-390.png` and `out/new-team-390.png`. So the two pages draw comparable content.

## What was measured, exactly

**Builds (checked):**
- **Live page.** `git archive cb49701 app docs/mascot`, then `git apply docs/rebuild/live/live-v155-fonts.patch`, then `node app/build.mjs`.
  - Result line: "built dist/page.html (3427 KB from 111 parts ...)", "slim: 3427 KB -> 2996 KB".
  - page.html is 3,069,009 bytes, sha256 2d927a0a99b3620b. That is the size and hash the switch runbook (section 4) found to equal live
    version 155, whitespace aside.
  - I used this instead of today's `node app/build.mjs` on design6. **Why:** the live README says live is cb49701 + the fonts patch. design6's
    old-page code has moved on since then. So cb49701 + the patch is what players get today.
  - Served with its 13 fonts/ and the 345 sp/*.webp (from that tree's app/sp).
- **New site.** `cd app && node build.mjs --v2 --public --split --one-art-size --art=v2art/` (runbook 3a), with the Chromium 1148 browsers path.
  - Result lines: "v2 guard: clean", "v2 --split: dist/v2.js 1860 KB", "v2: static first screen 99 KB", "built dist/v2.html (572 KB; ...)".
  - There was no "esbuild not installed" line.
  - Served as index.html + v2.js + 7 fonts/ + v2art/ (app/src/v2/art: 346 sprites + 4 crowd sheets).
- Sizes, gzip -9 (checked with `gzip -9c | wc -c`):
  - Live HTML: 3,069,009 raw, 771,783 gzip.
  - New HTML: 687,487 raw, 133,128 gzip. New v2.js: 1,906,860 raw, 593,600 gzip.

**Data (both pages):** today's out/ answered as the page's db documents, in the same way as `app/test/v2-today.mjs`.
- One document per file. perf comes from data-docs.mjs's perfDoc. A document over 200,000 bytes is split into meta/k + meta/k_2 with
  split-docs.mjs's `split`.
- Each `onSnapshot` answers once, 5 ms after it subscribes.
- A missing document (singles, status) answers `exists: false`.
- `use('user')` gives an id. The account document is empty, so this is a new visitor. Writes are no-ops.
- Both pages got the same document set. The old page subscribes to 15 keys (+ their _2 parts and the account doc: 31 answers). The new page
  subscribes to 16 keys (33 answers).

**Browser and throttling:**
- Playwright 1.49.1 with headless Chromium build 1148 (CI's browser).
- A fresh browser and context for every run, and the CDP `Network.setCacheDisabled`: a cold cache.
- CDP `Emulation.setCPUThrottlingRate` 4.
- CDP `Network.emulateNetworkConditions`: 9 Mbps down, 1.5 Mbps up, 165 ms latency (the "4G" of the Nov 17/18 reports).
- Phone: 390x844, DPR 3, touch, isMobile. Desktop: 1280x800, DPR 1.

**Server:** a local Node http server, HTTP/1.1. Text files (html, js, json, css) are sent gzip -9. Pictures and fonts are sent as they are,
with no-store.

**The measures:**
- **Main content.** Recorded inside the page with a MutationObserver, as the time the condition first became true (navigation start = 0).
  It is the moment the content is in the DOM, not a measured paint.
  - New site: `#main` holds no loading panel, has 200+ characters of text, and the top bar marks the page as current
    (`.np-nav a[href="#home"]` or `a[href="#team"]` with aria-current="page").
  - Live page: the pane `[data-pane="home"]` (or `"report"`, the live page's My team) is shown and has 200+ characters.
- **My Team on the live page.** The live page has no #team link: a new visitor always starts on Home (32-views.js:2 `let view='home'`).
  - So "My Team, tap from Home" = load Home, then click the visible `[data-view="report"]` button (the bottom bar's "My team") at the first
    chance after Home's main content is in, through a 0 ms timer. A long task delays that timer, just as it would delay a real tap.
  - The new site was measured the same way (click `a[href="#team"]`) and also opened directly at #team.
- **Live: today's data drawn.** The first change inside the shown pane after the last db answer. **Approximate:** it assumes the next change
  after the data arrives is the redraw with that data. The new site never shows built-in numbers first; it waits for the data, so its
  "main content" already holds today's data.
- **Longest task.** From the Long Tasks API (buffered).
  - "Before main" = tasks that ended by the main-content time.
  - "First 15 s" = tasks that started in the first 15 s.
- **Bytes and requests.**
  - Bytes = CDP `loadingFinished` encodedDataLength, so compressed bytes plus headers. data: URLs are not counted.
  - "To main" = requests finished by the main-content time. CDP time counts from the first request, which is close to navigation start.
  - "Whole visit" = every request until the network was quiet for 3 s (max 30 s; no run hit the cap). It includes lazy pictures that load on
    their own without scrolling: on Home that is the new site's 4 crowd sheets, 1.85 MB.
  - No scrolling and no other taps.

**Machine (checked, /proc/loadavg at each round):**
- Set 1: 16.57, 11.91, 16.80, 14.16, 10.62, end 14.23.
- Set 2: 11.96-13.67, end 10.74.
- On 4 cores. That is very busy: other sessions were running browsers.
- The runs were interleaved (round by round, each case once per round), so both sites saw the same load. But the absolute times are inflated
  and noisy. Treat differences under about 500 ms as unknown.
- The Nov 18 first-visit report measured My Team 4G at 3.0 s for the old Preview build, at 412x823 DPR 1.75 and load 1.9-7.9. That is a
  different build and setup, so it is not comparable to these numbers.

## What this setup cannot show (not checked)
- **The claude.ai frame.** The real host wraps the page and serves it from its own servers. Not checked:
  - its compression (gzip, brotli or none) and HTTP version (HTTP/2 would cut the cost of each file);
  - whether it caches v2.js between visits (repeat visits; this report is first visits only);
  - the frame's own start-up cost.
  - How fast the real db answers (`onSnapshot` of the real store; the mock answers in 5 ms) and what it does for missing documents.
    The runbook's 1d risk is an 8 s wait if the host never answers for meta/singles and meta/status. If so, the new site's main content would
    be about 8 s on every visit. **Unknown** until the rehearsal.
- **A real phone.** CPU 4x on a server Xeon is not an iPhone or a mid-range Android. Safari's engine was not measured. The network is a
  steady emulated 4G, not a real radio.
- **Paint.** The times are DOM-ready moments. Fonts and pictures may paint later. FCP was recorded in the raw lines:
  - Live: 733-931 ms.
  - New: 590-782 ms.
- **The whole visit.** No scrolling, sheets or other routes. Background work after 15 s is not counted (the planner on My Team).
- **Only 5 runs per case on a loaded machine.** Home is close to the noise. On the 1280 Home, set 1 had the new site slower
  (3,695 vs 3,355) and set 2 had them the same (3,106 vs 3,189). I call it **unknown / about the same**.

## Files
- Tools in the scratchpad (not committed): `scratchpad/speed/tools/run.mjs` (one run), `batch.sh` / `batch-home2.sh` (interleaved sets),
  `stats.mjs` (medians), `peek.mjs` (finding the live page's My team pane).
- Raw: `scratchpad/speed/out/runs.jsonl` (50 lines), `runs-home2.jsonl` (20 lines), `load.txt`, `load-home2.txt`, and end-of-run screenshots
  from a trial set (`out/*-390.png`, `*-1280.png`).
- The scratchpad is `/tmp/claude-0/-home-user-pokelair-data/204a9d61-5900-570f-b954-256bbb6b60d7/scratchpad/`. It may be cleared.

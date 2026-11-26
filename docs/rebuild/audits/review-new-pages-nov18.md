# Fresh-eyes review: The Stampede, The Post Room, The Champions Dispatch (Nov 18)

Written Wed Nov 18, 2026, 12:24 AM (clock: `bash docs/rebuild/now.sh`). Look-only: no site code changed.
Branch reviewed: origin/claude/design6 at 1800cbbe.

Files: app/src/v2/pages/stampede.js, stampede-hero.js, stampede-six.js, stampede-tools.js, stampede-post.js, postroom.js,
post-data.js, dispatch.js, app/src/v2/css/sd-*.css, app/src/data/post.js.

How I checked: I read every file above. I built with `cd app && node build.mjs --v2 --preview-data`, which printed
"v2 guard: clean". Then I ran Playwright 1.63, one browser at a time, on dist/v2.html#home, #gifts and #news. I changed
the data with `window.__ev(...)` and set the time zone and clock per context with `timezoneId` and `page.clock.install`.
The scripts are in the session scratchpad (rv1-rv6.mjs) and are not committed.

## Confirmed (ran it)

### 1. Dispatch links do not check the URL scheme, so a `javascript:` link runs (medium-high)
- Where: app/src/v2/pages/dispatch.js:49 (`V2.dpA`, every headline), :100 (`dp-read` on interviews), :102 (`dp-read` on
  stories), :123 (Fixtures `e.url` from META.calendar). Home's post band uses the same code through
  `V2.dpFront(..., {compact})`.
- What goes wrong: `V2.esc` makes the attribute safe, but the scheme is never checked. A news item with
  `url: 'javascript:...'` gives a live link on #news and on Home. The Post Room keeps only https links (postroom.js:46);
  the Dispatch reads the same POST and keeps every link.
- How confirmed: I added two news items with `url:'javascript:window.__x3=1'` and `'javascript:window.__x4=1'`.
  #home had 2 `javascript:` hrefs and #news had 3. Clicking them set `__x3=1` and `__x4=1`, so the script ran. The same
  test showed that text is escaped: no `<img onerror>` got into the page, and the title `Second "quoted" & <b>bold</b>`
  showed as plain text.
- Today's data is safe: every URL in post.js and all 42 in out/calendar.json start with https://. But
  experiments/post-data-test.mjs (which checks "every news link https") is not in .github/workflows, and the calendar is
  scraped every day with no check like this.
- Fix: make one shared `V2.safeUrl(u)` that returns `u` only when it matches `^https://`, else ''. Use it in dpSrc/dpItem
  (no link means plain text, as dpA already does), dpFix and dpGift. Then the Post Room's filter and this one are the same
  piece. Add the post-data test to CI.

### 2. Post Room and Dispatch give different days left and dates for the same gift (medium; data honesty)
- Where: postroom.js:61-63 (`V2.prDaysLeft`: an approx end counts as the UTC calendar day) against dispatch.js:36-39
  (`V2.dpDay`/`V2.dpLocal`/`V2.dpLeft`: the viewer's local day of the UTC instant, with `approx` ignored). Also
  dispatch.js:106 (the coupon's date range uses local days) against postroom.js:76 and :81 (UTC day when approx).
- Example: the Training Tickets gift. Its end is `2026-11-22T23:59Z` and both start and end are marked approx.
  - Tokyo, Nov 18 12:00 UTC: the Post Room and Home parcel say "4 days left" and "Collect by Nov 22". The Dispatch on the
    same screen time says "5 days left", "One ends in 5 days" and "Nov 11 – Nov 23".
  - Los Angeles, Nov 18 12:00 UTC: the Dispatch coupon says "Nov 10 – Nov 22". The approx start (a UTC day, Nov 11) moves
    back a day. The Post Room label says "Sent Nov 11".
- How confirmed: Playwright with timezoneId Asia/Tokyo and America/Los_Angeles, clock fixed. I read the text of
  `.pr-rub`, `.pr-meta`, `.dp-cpm` and `.dp-pk`.
- Fix: one days-left function and one date reader for the whole family. The Dispatch should use `V2.prG` +
  `V2.prDaysLeft` + `V2.prDate(t, o, g.dayEnd)` instead of dpGift/dpLeft/dpShort for gifts.

### 3. In its last hours, a live gift reads as ended for viewers east of UTC (medium)
- Where: postroom.js:62-63, stampede-post.js:16 (`V2.sdpSlip`), postroom.js:64 (`V2.prRubber`).
- What goes wrong: the approx end is the UTC day (Nov 22) but "today" is the viewer's local day (Nov 23 in Tokyo). For a
  gift that is still live, `prDaysLeft` returns -1, and:
  - the rubber stamp disappears from the parcel on #gifts and Home. In the test, 4 stamps showed for 5 live parcels.
  - the label says "Collect by Nov 22" when it is already Nov 23 for the viewer.
  - the Home code slip would read "-1 days left".
  - meanwhile the Dispatch says "Ends today".
- How confirmed: Tokyo time zone, clock at 2026-11-22T23:00Z. Results: `live: true`, `prDaysLeft: -1`, `prRubber: ''`,
  and `V2.sdpSlip(g)` gave "2 Training Tickets, -1 days left", while `V2.dpLeft` gave 0.
- Fix: clamp a live gift to at least 0 ("Last day"). Better: compare like with like, meaning UTC day against UTC day
  for approx ends, or local against local for exact ends. sdpSlip should treat any `d < 0` the way prRubber treats -1.

### 4. A gift with no `start` is never shown (low-medium)
- Where: post-data.js:35-36. `t(undefined)` is NaN, so the gift is neither live (`NaN <= now` is false) nor past (its
  end is in the future).
- How confirmed: I added `{kind:'item', name:'VP', amount:500, how:'Event Gift', end:'2026-12-20...'}` with no start.
  "500 VP" was missing from #gifts.
- The data test does reject a missing start (post-data-test.mjs:48), but that test is not in CI.
- Fix: treat a missing start as already started (`!(t(x.start) > now)`), or run the data test in CI.

### 5. Empty-number wording (low)
- postroom.js:122-123: with a gift ending today, the big number reads "0 / one ends today". The 0 is the days left, but it
  reads as "0 gifts end today". Suggest "Last day" or "Today" in place of the figure.
- stampede-post.js:18 and :24: when POST is empty, Home says "All 0 Gifts ›" right beside "Nothing at the counter ...
  Every gift so far ›". That is two links to #gifts and one of them counts zero. Hide the count link when it is 0.
- Both confirmed by rendering with `POST = {gifts:[], news:[], series:[]}` and a live gift on its last day.

### 6. Dispatch "N stories this year" disagrees with the kinds listed beside it (low)
- Where: dispatch.js:62-63 and :77. `thisYear` includes maintenance notices but `byType` leaves them out. The page shows
  "67 stories this year · 12 tournaments · 8 battle passes", where the 67 includes maintenance notices.
- Also by reading: "this year" is the viewer's calendar year. In January (the launch month) the masthead will say "No
  stories listed yet this year" until the first January item. The lead summary's "round ... this year" (:91) will name
  the wrong year for a December round.
- Fix: count the same set in both places, and say "in 2026" (the data's year) instead of "this year".

### 7. No crash or blank section with missing data (checked: nothing wrong)
I ran 11 scenarios on #home, #gifts and #news: base, POST empty, POST null, no champion (META.events null), no calendar,
no team, a team of 1, a team of 3 that includes an unknown "Fakemon", a team of 5, `lairRows` returning [], and no team
plus no champion. Every scenario had 0 page errors and 0 "undefined", "NaN", "null" or "[object" in the text. A Pokémon
gift and a series round that are not in the data show their name with no picture, and nothing breaks. Every empty state
has its own sentence.

### 8. Accessibility sweep (checked: nothing wrong)
At 1280 and 390 wide, on all three pages:
- 0 focusable elements inside aria-hidden;
- 0 duplicate ids;
- 0 buttons or links without a name;
- 0 links with target=_blank that lack noopener;
- one h1 per page;
- no sideways scroll.

The tool plates' title links measure 27-30px tall, but `.sdt-go::after` stretches each link over its whole plate
(sd-tools.css:19), so the real tap target is the plate. That is not a defect.

### 9. Listeners and observers (checked: nothing wrong) and redraw cost (low)
- After 20 Home redraws with after(), no new ResizeObserver, IntersectionObserver or addEventListener calls were counted.
  The resize listeners are module-level and the hero's observer is disconnected before it is replaced.
- Measured over 5 runs: `V2.sdTools()` takes 10.5 ms, of which `V2.sdtData()` is 8.8 ms, inside a 47.8 ms Home redraw.
  sdtData runs coreRows over all pairs, bestHitOn, setFor and arData on every redraw with no cache. sdData and sdsPlan
  are cached. Suggest caching sdtData on the same key as sdData (`ratings()` identity plus metaVersion).

## Possible (read only, not run)

### 10. Dispatch reads gifts its own way (low)
- Where: dispatch.js:34. `V2.dpGift` keeps the raw `how`, so the coupon says "Serial Code" (post.js spelling) where the
  Post Room label says "Serial code" (`V2.PR_HOW`).
- It also keeps `code` as given. prG removes white space (postroom.js:37), so a code with a space would copy differently
  from the coupon than from the Post Room.
- Fix: same as 2, use `V2.prG`.

### 11. "the official news" label trusts lookalike hosts (low)
- Where: postroom.js:45. `/pokemon\.com$/` also matches "notpokemon.com", and that host would be labelled "the official
  news".
- Fix: `/(^|\.)(pokemon\.com|pokemon-home\.com|pokemonchampions\.jp)$/`.

### 12. "0 players" in Latest Result (low)
- Where: dispatch.js:115. `homeNum(ev.players)` returns "0" when `players` is missing. The Home tools plate guards this
  (stampede-tools.js:60).
- Fix: leave out the players part when it is missing.

### 13. Duplicate pieces that should be one (low; maintenance)
- Next event: stampede-tools.js:33-34 has its own upcoming filter and its own short-name regex. dispatch.js:44-46
  (`dpNext`, `dpEvShort`, with a different regex), events.js `V2.evCal` and 63-weekly.js `homeNextChip` each do the
  same job. For today's 30 upcoming events the two short names agree (measured: 0 differ), but the rules can drift apart.
- Days left: `V2.prDaysLeft` and `V2.dpLeft`, with three wordings: "last day" (slip), "Last day" (rubber) and "Ends
  today" (Dispatch). See 2 and 3.
- The Copy Code row (code box plus `data-prcopy` button) is written three times: postroom.js:77, stampede-post.js:17 and
  dispatch.js:108.
- Gift reader: `V2.prG` and `V2.dpGift`. See 10.
- stampede-tools.js:28 changes the global `coreUi` for a moment to read the first pair. coreRows has no cache, so this is
  safe today, but a shared `coreRows({kind, sort})` would be cleaner.

### 14. Dead code and TODOs (checked: nothing wrong)
- No TODO, FIXME or console.log in the reviewed files.
- `data-sdgo` and `data-sdtool` have no handler; they are hooks for the behaviour tests (A-team adapter, v2-minors), not
  dead code.
- The motion code (sd-motion.css, `V2.sdhTick`) is off unless `window.NP_SD_MOTION` is set, waiting for Sim's yes, as
  the code says.
- dispatch.js:147: the click handler is `async` but never awaits (nit).

### 15. Privacy (COPPA) (checked: nothing wrong)
No player names, emails or player data appear on the three pages. Winning Teams and Latest Result show the event, date,
player count, record and the six, but no player. The "Source:" links show only host names.

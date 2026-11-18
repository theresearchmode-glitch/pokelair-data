# Behaviour review, Nov 18 night (look-only)

Written Wed Nov 18, 2026, 2:24 AM ET (clock: `bash docs/rebuild/now.sh`). Branch `claude/design6` at `6f891abd`.
No site code changed. Scratch test scripts (Playwright 1.63, Chromium, one browser at a time) were kept outside the repo.

Scope: tonight's commits on
1. `sugs.js` Apply hold on `[data-v2plan]` (adcc7063, e33e7ac7),
2. `six.js` `V2.rmHold` and `team.js` `V2._mtWide` / `mtBeltFit` (58a85889),
3. `build.mjs --split` and the Preview data loader (88326d2b),
4. planner stepping `THR.teamReportG`, `tsOfG`, `prepOfG`, `planFixesG` pre-loops, `planStart` show step (27e7420f).

Builds used: `node build.mjs --v2 --preview-data` (one file, file://), the same with `--split` (served over http by a small
local server), and two "before" builds made in scratch copies: team.js/six.js from `58a85889^`, and the four planner files
(08, 29, 35, 55) from `27e7420f^`.

## Confirmed (ran it)

### C1. Apply's hold undoes any scroll that is not a wheel, touch, pointer or key event (medium)
`app/src/v2/pages/sugs.js:155` (the `if (id) { ... }` hold).
- Scenario: after Apply, the page is scrolled by something other than those four events: a screen reader moving its reading
  cursor or VoiceOver's three-finger swipe, find-in-page jumping to a match, a browser "scroll to text" link, the site's own
  `scrollIntoView` calls. The hold sees the Apply moved and scrolls the page back, every frame, for 5 s (up to 20 s while the
  planner works).
- Ran it: 390 px, 4x CPU, Apply, then `scrollTo(0, 0)` 400 ms later. scrollY read every 200 ms for 2 s:
  `2816 2816 2816 ...` (the page never left the Apply). `V2.rmHold` (`six.js:96`) has the same release list, so the same
  applies after Remove (read only for Remove).
- Checked and fine: a real mouse drag on the page scrollbar in Chromium does send `pointerdown`, so it releases the hold
  (drag went 2816 -> 717 and stayed). Safari's scrollbar behaviour: not tested.
- Real screen-reader behaviour: not tested (no screen reader here); the mechanism is confirmed with a script scroll.
- Fix: also let go on a `scroll` event whose position the hold did not set itself (remember the scrollY after each `scrollBy`;
  any other change means someone else scrolled). Keep the four input events as they are.

### C2. Apply's hold survives leaving My Team and pulls the page down on return (medium)
`app/src/v2/pages/sugs.js:155`. The hold only checks `document.getElementById(id)`; on another page it does nothing but keeps
running, and when My Team comes back within the time it scrolls again.
- Scenario: Apply, then the browser's Back button (toolbar, no DOM event), then Forward within 5 s. The player lands at the
  top of My Team and is dragged down to the old Apply.
- Ran it (390 px): with Apply, back to #meta then forward: My Team at scrollY 2816, and a `scrollTo(0, 0)` there is pulled back
  to 2816 after 600 ms. Control without Apply: My Team at 0, stays at 0.
- `V2.rmHold` is fine here: it calls `off()` the moment its Add spot is missing.
- Fix: stop the hold on route change (`hashchange`/`popstate`, or check `V2.route() !== 'team'`), and stop it when `el` is gone
  (as rmHold does).

### C3. Keyboard Apply drops the focus to `<body>` (medium, accessibility)
`app/src/v2/pages/sugs.js:146-162`: `render()` replaces the tapped button and nothing takes the focus.
- Ran it: focus the first Apply, press Enter. `document.activeElement` is `body` right after and still after the list settles.
  In Chromium the next Tab happens to land on the next Apply (sequential focus starting point), but a screen reader has lost
  its place, and other browsers may start Tab from the top. (Remove does it right: the Add spot gets the focus.)
- Fix: after the hold's first `hold()`, focus the held Apply (or the Undo button in the new bar) with `{preventScroll: true}`.

### C4. abY's cache is keyed by the six names only, but its value depends on the sets (high: same team, different suggestions)
`app/src/app/22-auto-build.js:23` (`k = metaVersion + '#' + CAUT_K + '#' + names...`). `teamX` reads each member's set
(`setOne`) and `teamBasicsX` reads Protect, Fake Out, Tailwind/Trick Room. Shared logic: today's site uses the same planner.
Not new tonight (abY dates from Nov 8); 27e7420f's pre-loop keeps exactly the same calls, so it neither causes nor fixes it.
- Ran it (Incineroar, Garchomp, Sneasler, Kingambit, Basculegion, Sinistcha; then the same six with Protect, Detect, Fake Out,
  Tailwind and Trick Room taken out of their moves):
  - `teamBasicsOf` changes (protectLow 0 -> 1, noFakeOut 0 -> 1) but `abY` returns the cached -0.2309 for both; with the
    cache entry removed it is -0.3706.
  - Suggestions for the custom sets on a fresh page: `Mega Charizard Y for Incineroar`, `Mega Floette for Incineroar + Volcarona
    for Sneasler`, `Mega Salamence for Sinistcha`.
  - Same team and sets, after first planning the popular sets: `Mega Charizard Y for Incineroar`, `Mega Floette for Sinistcha`,
    `Mega Delphox for Sinistcha + Mega Dragonite for Incineroar`.
  - Same as the line above but `abYMemo.clear()` between the two steps: identical to the fresh page. So abY's cache is the only
    cause.
- Plain meaning: what My Team suggests depends on what the player (or Build for Me, which fills the same cache with popular
  sets) looked at earlier, against the rule that changed sets are graded exactly as chosen.
- Fix: put the sets in the key (the same parts `THR.teamReport`'s key uses: item, Ability, moves per member), or key on names
  only where the team is built from `abMember` (popular sets) and skip the cache otherwise. Re-run the walk-forward check if
  Build for Me's choices change.

### C5. A missing Preview data file shows yesterday's built-in numbers with no sign (medium, Preview only)
`app/build.mjs:81-84` (the `--split` loader in head).
- Ran it (served over http): preview.json OK: Strength Score 93. preview.json 404 (HTML body): score 92, no message on the
  page, one `console.warn`. A 404 with a JSON body: score 92 and not even a warning (`r.ok` is not checked, so the error body
  is used as the data). Slow preview.json (5 s): "Getting today's numbers…" until it arrives, then 93. That part is right.
- Plain meaning: if a Preview publish forgets preview.json (or the host answers 404), Sim sees plausible but wrong numbers.
- Fix: `if (!r.ok) throw ...`; on failure show a visible "Preview data missing" line (or keep "Getting today's numbers…")
  rather than answering "not there". Add v2.js and preview.json to the artifact file-list check before sending a link.

### C6. A missing v2.js leaves "Getting today's numbers…" forever (low)
`app/build.mjs:101`. Ran it: the split page served without v2.js shows the static header and the loading line after 8 s,
`window.V2` undefined, nothing tells the player. Fix: an `onerror` on the script tag that swaps the loading line for a short
"The page didn't load. Reload" message, and the file-list check above.

### C7. At 1100 to 1439 wide every redraw moves My Team down 24 px (medium; same kind of bug as the belt flip, other element)
`app/src/v2/pages/monsheet.js:123-127` (`V2.fitWords`). 58a85889 fixed the belt flip below 1100; this one is separate and
older (same result on the `58a85889^` build).
- Ran it: scrolled to 1500, four `V2.redraw()` calls: scrollY `1524, 1548, 1572, 1596` at 1100, 1180 and 1280 (both test
  teams); steady at 390, 700, 1099 and 1440. With `overflow-anchor: none` it stays at 1500.
- Cause, measured: the draw makes the selected Card's move list two across (`.mh-mv`, 88 px), then `fitWords` in after()
  puts it back to one per row (`.mh-mv1`, 112 px). Chrome's scroll anchoring moves the page 24 px each time, after
  `V2.redraw`'s own scroll restore. Every planner `show()` redraw and every Apply/Remove redraw does it.
- Fix: as was done for the belt: remember the last fit per Card and draw `.mh-mv1`/`.mh-mv2` in the HTML, so after() only
  changes it when it really changed.

## Checked and fine (ran it)

- Planner results unchanged by 27e7420f: five teams (the starting team, three sixes, one three-Pokémon team), build before
  vs HEAD: identical hashes of every plan's changes, score, readiness, sureness and the Quick add list, and identical
  Suggestions text. HEAD with `V2.redraw()` every 40 ms during planning: also identical. So no stale or mixed suggestions
  from redraws between steps (a redraw that builds the same report first is the one kept, as the code says).
- The belt row no longer flips on redraw below 1100 (390, 360, 700, 1099: scrollY steady over four redraws and four
  `mtBeltFit()` calls).
- `--split` keeps the static first screen identical to the one-file build (byte-equal `#app` content), even though the build
  opens the page over file:// where preview.json can't be fetched.
- Script order: the Preview loader runs in head before v2.js; the data fetch starts before the main script arrives.
- Apply and Remove holds at once (Apply by a real click, then a Card and Remove activated by script, no pointer events), 1x and
  4x CPU: no back-and-forth; the page moved once and the Add spot ended at 358, focused.
- Listeners and timers: each hold adds four capture listeners and removes the same four (`capture: true` matches); both loops
  end by time at the latest (20 s). No leak found.

## Possible (read only, not confirmed)

- P1. Old cached page with a new v2.js (`build.mjs:101`). `?v=` protects a new page from an old cached script. The other way
  round is not covered: if the host caches the HTML and serves files by path (ignoring `?v=`), an old cached page (its inline
  CSS, static first screen and loader) runs the new script. Whether the artifact host caches the HTML or honours the query
  string: not checked. Low. Fix if needed: put the hash in the file name (`v2.<hash>.js`) and publish the old one beside it
  for a day, or check a build id in v2.js against one in the page and reload once.
- P2. Both holds at once through assistive tech. A synthetic click with no pointer or key event (some screen readers'
  activation) does not release the other hold. In my test they did not fight, but neither hold knows about the other. Low.
  Fix: one shared "current hold" (`V2._hold`) that each new hold stops first.
- P3. `V2._mtWide` is one page-wide value. After a team or score band change (e.g. Apply turns "Needs work" into "Tournament
  ready"), the first draw uses the previous team's fit and after() flips it once (about 30 px, as before the fix). Apply's
  hold covers the Apply case. Low.
- P4. Each hold scroll fires a `scroll` event, which sets `V2.lastScroll`, so the planner's `step()`/`show()` wait 250 ms more
  after each held correction. They only happen when the layout moves; no deadlock seen. Low.
- P5. `V2.ckWinSoon`'s `run()` (`sugs.js`, 27e7420f) keeps re-arming a 150 ms timer while the page scrolls, with no cancel on
  route change. ckWinRefresh only works on data, so it is harmless today. Low.
- P6. Today's (old) site: the planner now yields once per threat. Its `planJobStart` steps in 30 ms slices, so this only adds
  pauses; the values are the same (the v2 hashes above use the same shared generators). Not run on `dist/page.html`.

## Most serious first

1. C4 abY cache by names only: the same team and sets get different suggestions depending on what was looked at before.
2. C1 Apply/Remove holds pull back scrolls made by screen readers, find-in-page and script.
3. C2 Apply's hold survives leaving My Team and drags the page on Forward.
4. C7 1100-1439 wide: every redraw moves My Team 24 px (move list fit, same kind as the belt flip).
5. C3 keyboard Apply leaves the focus on `<body>`.
6. C5 missing preview.json: built-in numbers shown with no sign (Preview).
7. C6 missing v2.js: loading line forever.
8. P1 to P6 possible, low.

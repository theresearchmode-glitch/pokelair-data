# Feature inventory, group D: Meta pages and the site shell

Look-only inventory made Nov 10 2026 for the rebuild. Nothing under `app/` was changed. Sources:
- **Code read:** `app/src/body.html`, `head.html`, and the modules in `app/src/app/` named in each entry (file names without the
  `app/src/app/` prefix). Lines in these modules are very long, so entries name the function or the `data-*` attribute, not line numbers.
- **Rendered and clicked:** `app/dist/page.html` (built Nov 10 22:30, after the last source commit) with the real `out/*.json` data,
  in headless Chromium at 1440×900 (mouse) and 390×900 (touch), light mode, using the harness from `experiments/polish-check.mjs`
  (a copy in the session scratchpad, now deleted). The runs included a "no data" pass (no `meta/*` documents) and a "first visit" pass
  (empty browser storage).
- Each entry says whether it was **seen running** or **read in code only**.
- For saved data (keys, document shapes) the full contract is in `docs/rebuild/saved-data.md`. This file only names the keys a feature
  touches.

How the current site is put together (needed to read the entries): the old renderers (`25-ratings-page.js`, `29-fix-planner.js`
renderMeta, `18-archetypes.js`, `49-events.js`, `63-weekly.js`, `63-method.js`, `64-track.js`, `56-about.js`) draw the HTML. Later
"theme" modules then wrap those functions (`CH.wrap(name, after)` in `61-concept-h-pages.js`) or watch the page with
MutationObservers and **rearrange, restyle or add** to what was drawn: `60/61-concept-h*` (folds, page heads, hot list, sheet
numbers), `65-design-c` (S-tier foil), `66-extras-a` (foil motion, Mega moments, type-themed sheet), `67-sheet-tabs` (sheet tabs),
`70-riso2` (More/Less, dots to commas), `71-manga` (header layout, sentence case, ratings hero art, empty-state art), `72-keep-place`,
`73-desktop-sheet`, `74-arena` and `75-arena-*` (current "arena" look, Filter button, back links, menu colours, dialogs), `76-slide`
(sliding pickers), `97-title-case`. A feature can therefore live in several files; all are listed.

Format of each entry: **ID · name**, then *Sees / does*, *Code*, *Data*, *Test* (steps a person can follow; no CSS class names).

---

## 1. NAV · Navigation and page routing

**NAV-01 · Main page tabs (desktop and tablet)**
- Sees / does: one header row with the logo, then five tabs: Home, Build, My Team (with a live "6/6" count of Pokémon on the team),
  Battle, Meta. The tab of the current page's group is highlighted (all Meta pages, This Week, Track Record and How We Calculate
  highlight Meta; About & Legal highlights nothing). Seen running at 1440.
- Code: `body.html` `nav.tabs`; moved into the header row by `71-manga.js` `MG.chrome`; highlight in `32-views.js` `setView`
  (`VIEW_PARENT`, `GROUPS`); click handler `34-events.js` (`d.view` → `setView`). Count `#tabCount`/`.tc` filled by the render code.
- Data: none.
- Test: at 1440 wide, open Ratings from the menu: "Meta" is highlighted. Add or remove a Pokémon: the "x/6" next to My Team changes.

**NAV-02 · Phone bottom tab bar**
- Sees / does: on phones a fixed bottom bar with Home, Build, My Team (folder icon), Battle, Meta. The "More" button that used to sit
  here is moved into the header (see NAV-03). The bar is lifted when the Claude iPhone app cuts off the bottom of the frame, and
  redrawn after app-made scrolls (iOS drawing bug). Seen running at 390 (visible) and 1440 (hidden).
- Code: `body.html` `nav.bnav`; `60-concept-h.js` `chBrand` (moves `#moreBtn`, adds the My Team icon); `71-manga.js` `MG.chrome`
  (folder icon); `72-keep-place.js` `KP.redrawBars`, host-cut IntersectionObserver (`--hostcut`).
- Data: none.
- Test: at phone width the five tabs show at the bottom and stay put while scrolling; tapping each opens its page; the current
  group's tab is highlighted.

**NAV-03 · The "⋯" menu (More pages and settings)**
- Sees / does: a "⋯" button in the header (aria "More pages and settings") opens a drawer. Top: logo and × close. Then "Theme" with
  Auto / Light / Dark (sliding picker). Then every page in groups, each group in its section colour: Home; Build (Build for Me,
  Build Around a Core); My Team (My Team with count, All Suggestions, Saved Teams, Compare Teams, My Box); Battle (Battle a Team,
  Team Preview Practice, Test Run, Speed Tiers, Damage Calc, Type Chart); Meta (This Week, Pokémon Ratings, Usage, Popular Sets,
  Winning Teams, Events, Archetypes, Track Record, How We Calculate); Info (About & Legal). The current page is highlighted. Closes
  with ×, a tap on the dimmed backdrop, Escape, the browser/phone Back button, or choosing a page. On open, focus moves to the
  current page's row; Tab and Shift+Tab stay inside; on close focus returns to the "⋯" button. The "⋯" button looks "on" while a
  page that is not one of the five main tabs is open. Seen running at both widths (24 page rows).
- Code: `32-views.js` (`MENU` list rebuilds `.sidenav`; `sideOpen`; Escape and `#scrim` handlers; `overlayOpen/overlayClose`);
  `34-events.js` (`#moreBtn`, `#sideClose`); `71-manga.js` `MG.chrome` (moves the theme controls into the drawer); `75-arena-build.js`
  `ARBLD.side` (group colours), `ARBLD.OV/focusTick` (focus in, trap, return).
- Data: none (theme choice: see THEME-02).
- Test: tap "⋯": the drawer lists the 24 pages above in that order with the current page marked. Press Tab repeatedly: focus never
  leaves the drawer. Press Escape: it closes and focus is back on "⋯". Open it again and press the browser Back button: it closes and
  the page underneath is unchanged.

**NAV-04 · Meta section switch: Pokémon | Tournaments**
- Sees / does: on Ratings, Usage, Popular Sets, Winning Teams, Events and Archetypes a two-choice row at the top: "Pokémon" (opens
  Ratings) and "Tournaments" (opens Winning Teams). Usage and Sets count as "Pokémon"; Events and Archetypes as "Tournaments". If it
  overflows it scrolls sideways and centres the selected item. Not shown on This Week, Track Record, How We Calculate, About. Seen
  running.
- Code: `32-views.js` (`GROUPS`, `SUB_OF`, the `.subnav` builder, overflow centring in `setView`).
- Data: none.
- Test: open Events: "Tournaments" is selected; tap "Pokémon": Ratings opens with "Pokémon" selected.

**NAV-05 · Second-level sliders: Rating / Usage / Sets and Winning Teams / Events / Archetypes**
- Sees / does: under NAV-04 a sliding picker (icon in a circle over each name) switches between the pages of the section:
  "Rating · Usage · Sets" on the Pokémon pages and "Winning Teams · Events · Archetypes" on the Tournament pages. The highlight slides
  from the previous choice. Seen running.
- Code: `body.html` (`.seg.teamsw` groups with `data-view`), `76-slide.js` (`SLIDE`, icons `star/bars/list/trophy/cal/layers`),
  `75-arena-meta.js` (arena classes).
- Data: none (slide position kept in memory only).
- Test: on Ratings tap "Usage": the Usage page opens and the highlight moves to Usage; tap "Sets": Popular Sets opens.

**NAV-06 · Back links on sub-pages**
- Sees / does: a "← name" button at the top of pages opened from inside another: This Week → "← Meta", How We Calculate → "← Meta",
  About & Legal → "← Meta", Track Record → "← Pokémon Ratings"; also Saved Teams, Compare, My Box, Coverage (→ My team) and Test Run,
  Practice, Speed, Calc, Types (→ Battle) (outside this group's pages but the same feature). Seen running for the four Meta ones.
- Code: `32-views.js` `BACK` map; `74-arena.js` (adds weekly/method/about).
- Data: none.
- Test: open This Week from the menu; tap "← Meta": Ratings opens.

**NAV-07 · Page switching and page identity**
- Sees / does: every page is one view; switching hides all others, sets the page title (hidden on screen, see BROKEN list), the
  highlighted tabs, the section colour (NAV-11) and records a usage count. Aliases: "battle" → Battle, "build" → My team, "cores" →
  Build. An unknown page name opens Home. Pages that need work render on open (Ratings, Events, Winning Teams, This Week, How We
  Calculate, Track Record, About, …). Seen running.
- Code: `32-views.js` `setView`, `VIEW_ALIAS`, `VIEW_TITLE`, `VIEW_PARENT`, `MAIN_VIEWS`; wrapped by `60-concept-h.js`,
  `61-concept-h-pages.js` (`CH.wrap('setView')` for cores), `63-weekly.js` (weekly), `76-slide.js`.
- Data: writes `localStorage cc2.view` (never read back, see BROKEN-04); `html[data-pg]` attribute.
- Test: from the menu open each Meta page in turn: each opens at its top with the right page highlighted in the menu.

**NAV-08 · Back button and history (no page URLs)**
- Sees / does: each page switch adds a browser history step **without changing the address**, so the phone/browser Back button steps
  back through pages and lands where you were scrolled on that page. Back first closes whatever is open on top (Pokémon info sheet,
  search, menu, feedback, share card, set editor, scouting sheet); opening one of those adds its own history step, closing with × or
  the backdrop removes it quietly. Reloading the page always opens Home. Seen running (Back from Events returned to Ratings; Back
  closed the menu and the info sheet; address had no hash).
- Code: `32-views.js` (`navHist`, `OVERLAYS`, `ovSync`, `popstate` handler, `VIEW_SCROLL`, `history.scrollRestoration='manual'`).
- Data: `history.state` `{npv, ov}`; no hash for pages. The only URL hashes are `#team=` and `#box=` (SHELL-24, SHELL-25).
- Test: open Ratings, scroll half way, open Events, press Back: Ratings shows at the same scroll position. Open a Pokémon sheet, press
  Back: the sheet closes and the page stays.

**NAV-09 · New page opens at its top**
- Sees / does: switching page jumps instantly to the top and re-checks twice (120 ms, 450 ms) in case the page finished drawing later,
  unless you scrolled or the app scrolled on purpose. A short fade-in on page switch (not on first load). Seen running.
- Code: `32-views.js` `setView` (scroll block, `np-sw` class); `72-keep-place.js` (`KP.appAt`, `KP.own`).
- Data: none.
- Test: scroll to the bottom of Ratings, tap "Track Record →": Track Record opens at its top.

**NAV-10 · Keyboard focus stays inside dialogs**
- Sees / does: while a sheet, editor, share card, feedback or Copy for Showdown dialog is open, Tab and Shift+Tab wrap inside it.
  Read in code (seen indirectly for the menu).
- Code: `32-views.js` (Tab handler using `overlayOpen`); `75-arena-build.js` (`ARBLD.OV`, Tab handler, focus return).
- Data: none.
- Test: open a Pokémon sheet with the keyboard (Enter on a row), press Tab many times: focus cycles through the sheet's controls only.

**NAV-11 · Section colours**
- Sees / does: each page group has its own accent colour used by headings marks, fold strips and buttons: Build gold, My team blue,
  Battle red-orange, Meta purple (all Meta pages plus This Week, Track Record, How We Calculate and About), Home pink. The ⋯ menu groups
  carry the same colours. Seen running (`--ar-sec` changed per page: #E8364F Home, #0078BF My team, #E9A800 Build, #F05A28 Battle,
  #7B4BD6 Meta pages).
- Code: `app/src/theme/arena.css` (`html[data-pg=…]` → `--ar-sec`), `32-views.js` (sets `data-pg`), `75-arena-build.js` `ARBLD.side`.
- Data: none.
- Test: open Usage and then Battle: the accent on headings changes from purple to red-orange.

---

## 2. JUMP · Search and jump dialog

**JUMP-01 · Opening the search**
- Sees / does: a header button "Search Pokémon, tools, teams" with a "Ctrl K" hint (desktop); on phones an icon-only button. Also
  opens with Ctrl+K / Cmd+K (toggles open/closed from anywhere, even while typing) and "/" (only when not typing in a field). Seen
  running (button, Ctrl+K, "/").
- Code: `50-jump.js` (`jumpOpen`, keydown handler, `[data-jumpbtn]` click); `body.html` `.jumpbtn`.
- Data: none.
- Test: press Ctrl+K: a search box opens with the cursor in it. Press Ctrl+K again: it closes. Click into the Ratings search box and
  type "/": a slash is typed, the dialog does not open.

**JUMP-02 · Empty search list**
- Sees / does: with nothing typed it lists the first 14 tools, each with a one-line description and a "Tool" label (label hidden on
  phones): Home, My Team, Build for Me, Best additions, Battle Mode, Speed Tiers, Damage Calc, Test Run, Ratings, Meta rankings,
  Teams, Compare Teams, Events, Winning Cores. Seen running.
- Code: `50-jump.js` `JUMP_TOOLS`, `jumpItems` (`slice(0,14)`); `75-arena-build.js` (`CH.wrap('jumpRender')`).
- Data: none.
- Test: open the search without typing: 14 tools are listed, Home first.

**JUMP-03 · Typing a query**
- Sees / does: results for tools (by name or description), saved teams (by name, with their six names) and Pokémon (up to 8, names
  that start with the text first, then by rating), Pokémon rows show the sprite on its type field and "Rated N, #k of N with
  results, Type/Type". Up to 14 results. Accent-insensitive. "Nothing matches. Try a Pokémon, a tool like "speed", or a saved team."
  when empty. Seen running ("garch" → Garchomp 92, Mega Garchomp Z 87, Mega Garchomp 59; "sun" → the saved sample team + Archetypes;
  "zzzq" → nothing matches).
- Code: `50-jump.js` `jumpItems`, `jumpRender`.
- Data: reads saved teams (`S.teams`), ratings.
- Test: type "garch": Garchomp appears first with its rating and types. Type nonsense: the "Nothing matches" line shows.

**JUMP-04 · Choosing a result**
- Sees / does: ↑/↓ move the highlight (screen readers follow it), Enter opens, Escape closes, a click/tap on a row opens, a click on the
  dimmed backdrop closes. A tool opens its page; a saved team opens it as your team (toast "Opened "name"" with Undo) and goes to My
  team; a Pokémon opens Ratings and its info sheet. Focus returns to the search button on close. Seen running (Enter on the saved team
  opened My team with the toast).
- Code: `50-jump.js` (`jumpGo`, `jumpClick` replays the Saved teams "Open" action via a temporary `data-load` button), `34-events.js`
  (`d.load`), `75-arena-build.js` (focus handling).
- Data: loading a saved team changes the current team (`cc2.state`, account doc).
- Test: search "garchomp", press ↓ then Enter: Ratings opens with the second result's sheet on top.

**JUMP-05 · Which tools search can find**
- Sees / does: 19 tools: Home, My team, Build for me, Best additions (= All suggestions), Battle mode, Speed tiers, Damage calc, Test
  run, Ratings, Meta rankings (= Usage), Teams (= Winning teams), Compare teams, Events, Winning cores (= Build around a core), Popular
  sets, Archetypes, Type chart, Saved teams, My box. **Not findable:** This Week, Track Record, How We Calculate, About & Legal, Team
  Preview Practice (see BROKEN-10). Seen running ("week" and "about" find nothing).
- Code: `50-jump.js` `JUMP_TOOLS` (a tool only shows if its page exists).
- Test: search "speed": Speed Tiers is listed.

---

## 3. THEME · Light and dark

**THEME-01 · Day / night button in the header**
- Sees / does: a sun icon in day mode, a moon in night mode, next to "⋯"; one tap switches between explicit Light and Dark (it does not
  return to Auto). Its label says the current state ("Day mode is on. Switch to night mode"). Seen running (tap → Dark, stored "dark").
- Code: `61-concept-h-pages.js` (`#thmBtn`, `chThemeIcon`), `74-arena.js` (moves it before "⋯"); `71-manga.js` `MG.chrome` sets it
  `hidden`, but it still shows (see BROKEN-03).
- Data: `localStorage cc2.theme`.
- Test: tap the sun: the page turns dark and the icon becomes a moon; reload: still dark.

**THEME-02 · Auto / Light / Dark in the menu**
- Sees / does: sliding picker at the top of the ⋯ menu. Auto follows the device setting and the Claude app's own theme; Light and Dark
  override it. Stored per device. Changes apply at once everywhere, including type-coloured fields (which use a separate dark palette)
  and data-health/notes. Seen running (Light pressed).
- Code: `32-views.js` `setTheme`, `lookSync` (`html[data-mode]`, `html[data-look]`, listens to `prefers-color-scheme` and the host's
  `data-theme`), `34-events.js` (`d.thm`), `76-slide.js` (icons auto/sun/moon), `74-arena.js` `AR.dark/AR.mid/AR.on` (dark field
  colours), theme CSS.
- Data: `localStorage cc2.theme` (`auto` | `light` | `dark`, default `auto`).
- Test: choose Auto, switch the computer to dark mode: the site turns dark without reload. Choose Light: it stays light whatever the
  device says.

**THEME-03 · Share images have their own light/dark choice**
- Sees / does: the share card dialog has a "Light · Dark" picker independent of the site theme (defaults to the site's look). See
  WEEK-02. Seen running.
- Code: `61-concept-h-pages.js` (`CH.wrap('openShareCard')`, `data-chshm`, `CH.shareMode`).
- Data: none (in memory).
- Test: in dark site mode open "Share this week", choose Light: the image redraws light.

---

## 4. SHELL · Global parts of every page

**SHELL-01 · Page head, fonts and screen fit**
- Sees / does: tab title "NastyPlot", description for search engines/link previews, favicons (16/32/any, SVG), fonts Unbounded,
  Archivo and Instrument Sans from Google Fonts; the top notch space is only added when the page really fills the screen (not inside
  the Claude app); `claude:viewport-fit-sides` meta. Read in code.
- Code: `app/src/head.html`.
- Data: none (Google Fonts request; mentioned in the Privacy section).
- Test: open the page in a browser tab: the tab reads "NastyPlot" with the logo icon; headings use the slanted Unbounded font.

**SHELL-02 · Header**
- Sees / does: logo lockup "NastyPlot" (left), on desktop the five tabs (NAV-01), then search (JUMP-01), day/night (THEME-01) and "⋯"
  (NAV-03). On phones: logo, search icon, day/night, "⋯". The old eyebrow line and the page title in the header exist but are not
  shown (BROKEN-01, BROKEN-02). Seen running at both widths.
- Code: `body.html` `header.band`; `60-concept-h.js` `chBrand` (logo `CH.lockup`), `71-manga.js` `MG.chrome`, `74-arena.js`,
  `61-concept-h-pages.js`.
- Data: none.
- Test: at 390 and 1440 the header shows the controls listed, in that order, and nothing overflows.

**SHELL-03 · "Data as of" stamps**
- Sees / does: the newest date of any data document, as "Data as of Nov 10" (plus "(N days old)" when over 2 days). It is written into
  the header eyebrow and the menu foot ("Pokémon Champions, Reg M-C, Data as of …") but **neither is visible** today (measured). Visible
  date stamps live on the pages themselves: Ratings kicker "…data as of Nov 10", Home "Data as of …", How We Calculate "Updated today /
  yesterday / Oct 31", Events calendar "checked Nov 10", Winning Teams "updated Nov 10", This Week "Updated …", each sheet data row.
- Code: `02-set-data.js` (`DATA_AT`, `noteDataDate`, `dataDateText`, `showDataDate`), `03-persistence.js` (calls `noteDataDate` per
  document; weekly and calendar excluded), `63-method.js` `npFresh`.
- Data: `updated`/`pulled`/`date` field of each `meta/*` document.
- Test: open Ratings: the line under the switches ends with "data as of" and today's data date.

**SHELL-04 · Data health note (stale data)**
- Sees / does: an amber note "Some data is older than usual: Tournament win rates, last updated Nov 4; Events, last updated Nov 1.
  Everything else is current." when a source is past its usual age (tournament sets/win rates/top teams/win model/track record 2 days,
  events and in-game rankings 3, practice 4, Showdown ladder 45). Shown **only on Home and the Meta pages** (Ratings, Usage, Sets,
  Winning Teams, Events, Archetypes, This Week, Track Record, How We Calculate; not About, not My team/Build/Battle). A missing document
  is not listed. Seen running (stale dates injected; visible on Home/Ratings/Events, not on About/My team).
- Code: `43-data-health.js` (`HEALTH`, `healthStale`, `renderHealth`), `#healthBar` in `body.html`; page scoping in CSS.
- Data: `DATA_AT` (from document dates).
- Test: with a daily source more than 2 days old, open Ratings: the amber note names it and its date; open About: no note.

**SHELL-05 · Regulation banner**
- Sees / does: when the data says a newer regulation has started: "New regulation (Reg M-D) started Nov 8, 2026 — data is rebuilding;
  numbers below are from Reg M-C until there's enough. 3 Reg M-D events so far, switches at 20. The two are never mixed." (or "Seen on
  the Showdown ladder; no Reg X tournaments yet"). When all numbers are from a different regulation than the page was built for:
  "Numbers are from Reg X (started …). Reg M-C results are no longer counted…". Same pages as SHELL-04. Seen running (injected).
- Code: `43-data-health.js` (`PAGE_REG`, `regInfo`, `renderReg`), `#regBar`.
- Data: `meta/perf.reg` (or `META.reg` kept from a thin first day).
- Test: with `meta/perf.reg.now` set to a new regulation, open Home: the banner shows the new regulation, its start date and the
  event count.

**SHELL-06 · Footer**
- Sees / does: logo, tagline "Sharply raise your win rate."; the unofficial/trademark disclaimer (first sentence shown, rest behind
  "More"); "Sources and credits" fold: "Data: Limitless, Victory Road, VR Pastes, Liquipedia (CC BY-SA), Pokémon Showdown, Smogon,
  op.gg, Pikalytics and Showdown Tier. Game data from Pokémon Showdown © Guangcong Luo and contributors (MIT License). Provided as-is
  and may contain mistakes. Free to use, no ads."; "Send feedback" (only for viewers who can save, SHELL-20); links "About & Legal",
  "Privacy", "Contact" (each opens About at that section, ABOUT-03). Seen running.
- Code: `body.html` `footer.legal`; `56-about.js` `footFill`, `DATA_SOURCES`, `[data-about]` handler; `70-riso2.js` (More);
  `75-arena-build.js` (link style); `60-concept-h.js` `chBrand` (logo).
- Data: none.
- Test: scroll to the bottom of any page, open "Sources and credits": the nine sources are listed. Tap "Privacy": About opens with
  the Privacy section open and scrolled into view.

**SHELL-07 · Toasts**
- Sees / does: a short message at the bottom; disappears after 2.2 s, or 6 s when it carries an "Undo" button (team changes such as
  load, remove, apply, clear). Confirmations that start with Saved / Team link copied / Box link copied / Stat points saved / Spread
  saved / Nature saved / Imported / Opened / Deleted / Team cleared show a small Darkrai picture. A box-change toast has its own Undo.
  Seen running ("Team link copied" with Darkrai; "Opened "Sun Tailwind (sample)"" with Undo).
- Code: `06-helpers.js` (`toast`, `TOAST_DK`, `keepUndo`, `#toastUndo` handler), `31-box.js` `toastBox`, `#toast` in `body.html`.
- Data: Undo restores `S.slots`/`S.loadedId` (team) or `S.box`.
- Test: load a winning team over your own: a toast with Undo appears; tap Undo within 6 s: your previous team is back.

**SHELL-08 · Undo bar for applied suggestions**
- Sees / does: "Applied <change> — Undo" above suggestion lists; Undo steps back through up to 8 applied suggestions until the team is
  changed some other way. (Used on My team pages; global component.) Read in code.
- Code: `06-helpers.js` (`undoMark`, `undoTop`, `undoBarHtml`, `undoBarSync`, `[data-undobar]`).
- Data: `ui.undoStack` (memory).
- Test: apply two suggestions, tap Undo twice: the team returns to before the first one.

**SHELL-09 · "?" tip bubbles**
- Sees / does: small "?" buttons next to terms. Tap opens one bubble at a time (title + text), positioned below or above, max 300 px;
  tap the same "?" again, tap outside, press Escape, or scroll the page or any inner box to close. A small Darkrai picture peeks over
  the corner. Tips about a method end with a "How We Calculate →" link that opens that section (NAV/METHOD-05). Fixed tips: readiness,
  spread, rating (with the live "#20 of N" count), bars, tiers, numbers, checklist; many live tips are registered on the fly
  (`tipText`: evsrc, caldates, wktech, wksty, wkfresh, trhow, trearly, npsrc, gauntcalc, mucalc, prsrc…). Seen running ("numbers" tip
  with Darkrai and link).
- Code: `46-onboarding.js` (`TIPS`, `tip`, `tipText`, `closeTip`, click handler), `63-method.js` (`methodTipLink`, `NP_TIP_SEC`),
  `72-keep-place.js` (close on inner scroll).
- Data: none.
- Test: on Ratings tap the "?" next to the page kicker: "How to read our numbers" opens with a "How We Calculate →" link; scroll: it
  closes.

**SHELL-10 · Clear (×) button in search and lookup boxes**
- Sees / does: every search/lookup field gets an × once it has text; tapping it empties the box, keeps the keyboard up and re-runs the
  filter. Seen running (on Ratings, Usage, Winning Teams, Sets, Jump).
- Code: `61-concept-h-pages.js` (`CLR_SEL`, `clrWrap`, `clrSync`, `clrScan`, MutationObserver).
- Data: none.
- Test: type "fire" in the Ratings search, tap ×: the box empties and the full list returns.

**SHELL-11 · Long paragraphs fold to "More / Less"**
- Sees / does: any paragraph over about 150 characters on a page, the info sheet or the footer shows its first sentence and a "More"
  button; "Less" folds it again. Buttons are never hidden behind More. Seen running (footer, About the ratings, sheet).
- Code: `70-riso2.js` `rzTidy`, `.rzmorebtn` handler.
- Data: none.
- Test: open the footer disclaimer: it ends with "More"; tap it: the full text shows and the button reads "Less".

**SHELL-12 · Text style rules applied to everything drawn**
- Sees / does: (a) headings and page/tool names in Title Case ("Speed Tiers", "Where the Data Comes From"; short words lower case;
  Pokémon, team, player names and the tagline untouched); (b) words written in capitals in the copy become sentence case (abbreviations
  like HP, OHKO, VGC, RK9 kept); (c) " · " lists become commas ("label: a, b"), except the footer link row; (d) "Mega X" naming
  everywhere (never "M-X"). Seen running.
- Code: `97-title-case.js` `TCASE`; `71-manga.js` `MG.caps`, `MG.undot`; `70-riso2.js` `rzDots`; `74-arena.js` `AR.mega/AR.nm`.
- Data: none.
- Test: open the ⋯ menu: every page name is in Title Case ("How We Calculate"). Sheet move lists read "Fake Out, Flare Blitz…" with
  commas.

**SHELL-13 · Sliding pickers**
- Sees / does: every one-choice switch with 2-3 choices (or the 4-item My team jump bar) is a rounded track with an icon in a circle
  over each name; the circle slides to the new choice, starting from where that group last was (also when the next page has the same
  switch). Names wrap evenly or not at all. Number choices (Megas 0/1/2) show the digit. Multi-select groups and 5-6 choice groups
  stay plain buttons. Reduced motion: no slide. On Meta pages: Rating/Usage/Sets, Winning Teams/Events/Archetypes, usage source
  (Ranked ladder/Online tournaments/Showdown ladder), sets source (Best data/Tournaments/Showdown), events filter (All/Official/100+
  players), Theme (Auto/Light/Dark), share style (Light/Dark). Seen running.
- Code: `76-slide.js` `SLIDE` (`fits`, `dress`, `scan`, `slideFrom`, `even`, `mem`).
- Data: none (memory).
- Test: on Usage tap "Online tournaments": the circle slides from Ranked ladder to it; the list changes source.

**SHELL-14 · Folds that remember**
- Sees / does: collapsible sections with the logo's two-chevron toggle (up = closed, down = open), title and one-line summary. Most
  remember open/closed per device. On Meta pages: "About the Ratings", "Every Pokémon, by Tier", all ten How We Calculate sections,
  "Events Checked" (Track Record). Not remembered: About & Legal sections, archetype guides, usage rows, the info sheet's inner folds.
  Seen running.
- Code: `60-concept-h.js` `CH.fold`, toggle listener; `61-concept-h-pages.js` `CH.foldNode`, `CH.restyle`.
- Data: `localStorage cc2.chf.<key>` (1/0), keys `lairabout`, `lairboard`, `np_grade` … `np_fresh`, `trevents`.
- Test: open "About the Ratings", reload: it is still open.

**SHELL-15 · "Details" buttons (hidden sample sizes)**
- Sees / does: a small "Details" toggle next to some lists reveals the numbers behind them (games behind each win rate on the Ratings
  top list; team counts behind New Tech on This Week); label switches to "Hide details". Not remembered across reloads. Seen running.
- Code: `15-visual-helpers.js` (`DB_OPEN`, `dbBtn`, `dbAttr`, click handler), content marked `dbsec`.
- Data: none (memory).
- Test: on Ratings tap "Details": each row shows "N wins" and "N games"; tap "Hide details": they go.

**SHELL-16 · Sample-size labels ("Early read", "few games")**
- Sees / does: numbers built on little data carry a plain label: "Early read" on the sheet rating and win rate; "few games, so the
  score is an estimate" legend and a "?" style on board tiles; counts like "29.8k games" or "of 13.8k". Seen running.
- Code: `36-confidence.js` (`basis`, `thinFor`, `basisText`, `basisNum`), used by Ratings, sheet, Usage, Archetypes, This Week.
- Data: game/team counts in the data.
- Test: open a rarely used Pokémon's sheet: the rating shows "Early read".

**SHELL-17 · First-visit welcome card**
- Sees / does: on Home for a first-time visitor: "New Here? How NastyPlot works" with three numbered steps (Get a team, Read your
  scouting report, Plan each match), "The team below is a sample to explore…", buttons "Build me a team", "Copy a top team" (→ Winning
  Teams) and "Got it". Any of them marks the visitor as welcomed; "Got it" removes the card. Seen running (first-visit pass).
- Code: `46-onboarding.js` `welcomeCard` + click handler; placed by `60-concept-h.js` Home render; styled by `75-arena-build.js`
  `ARBLD.home`.
- Data: `localStorage cc2.welcomed`.
- Test: with empty browser storage open the site: the card shows on Home; tap "Got it", reload: it is gone.

**SHELL-18 · What's new card**
- Sees / does: after a release, returning visitors see a one-line fold on Home "What's new: 6 updates: Threat prep, Move accuracy…"
  that opens to the list, with an × to dismiss. Shown for the first visit after the update only (stays for that visit). First-time
  visitors never see it. Current content is from Oct 28 (id `2026-10-28b`). Read in code (test harness pre-marks it seen).
- Code: `53-feedback.js` (`WHATS_NEW`, `whatsNewCard`, `[data-wnewx]`), `74-arena.js` (moves the × beside the fold).
- Data: `localStorage cc2.seenNew`; `sessionStorage np.wnew`.
- Test: set `cc2.welcomed` and an older `cc2.seenNew`, open Home: the card shows; reload: still there in this visit; new visit: gone.

**SHELL-19 · Sample team for new visitors**
- Sees / does: a first-time visitor starts with a real winning team "Sun Tailwind (sample)" (Mega Charizard Y, Whimsicott,
  Basculegion, Kingambit, Garchomp, Sneasler) saved as their first saved team, with a note "This is a sample team, here to show how
  NastyPlot works." and "Build your own" / "Import a team". Seen running (first-visit pass).
- Code: `00-main.js` `DEFAULT_TEAM`, `01-state.js` (initial `S`), `74-arena.js` `AR.isSample`, `AR.sampleNote`, `[data-arimport]`.
- Data: `localStorage cc2.state` / account doc.
- Test: with empty storage, open My team: the sample six and the sample note show.

**SHELL-20 · Feedback and "Report a mistake"**
- Sees / does: "Send feedback" (footer, Home) opens a dialog: title, "We see the page you were on (page name)", kind picker (Something
  broke / Confusing / Idea / I like this / Wrong info; Idea selected), a 1000-character box, "Anonymous — please don't include
  personal info…", Send. "Write a few words first." under 3 characters; "Sending…"; on success the dialog closes with "Thanks! Feedback
  sent." (+ " Personal details were removed." when emails, 9+ digit numbers or @handles were stripped); on failure "Couldn't send. Try
  again in a moment."; without permission "Can't send from here: your access level can't save data.". "Report a mistake" (Pokémon
  sheet, damage calc) opens the same dialog as "Report a mistake" with what was on screen filled in, the message optional. Closes with
  ×, backdrop, Escape, Back. **Both buttons are hidden for viewers who cannot save data** (all test runs: hidden). Dialog seen running
  via a direct call; sending not tested.
- Code: `53-feedback.js` (`FB`, `fbOpen`, `fbMistake`, `fbMisContext`, `fbScrub`, `fbSend`, `FB_KINDS`), `75-arena-build.js`
  `ARBLD.dlg`.
- Data: writes `feedback/<viewer id>` field `m.<random key>` = `{t, k, v, w, d, c?}`.
- Test: as a viewer who can save, open a Pokémon sheet, tap "Report a mistake": the dialog shows the Pokémon's numbers; tap Send: a
  "Thanks! Mistake reported." toast.

**SHELL-21 · Owner-only panels**
- Sees / does: only the site owner sees, on Home, "Feedback — only you see this" (everyone's messages, newest first, with kind, page,
  phone/desktop, person number, date, context) and "What people use — only you see this" (people, visits, % phones, table of pages
  and buttons by people and times). Each loads when opened ("Loading…", "No feedback yet.", "Couldn't load feedback.", "No visits
  counted yet."). Read in code.
- Code: `53-feedback.js` `renderFeedback` (`#fbBox`), `51-usage.js` `usageReport`, `renderUsage` (`#usageBox`); markup in
  `60-concept-h.js` Home.
- Data: reads collections `feedback`, `usage`.
- Test: as owner, open "What people use" on Home: a table of pages and buttons appears.

**SHELL-22 · Anonymous usage counting (invisible)**
- Sees / does: nothing on screen. Counts page views ("view:ratings") and button presses (by id or first data attribute) per visit, up
  to 150 keys, with date and phone/desktop; saved every 30 s and when the tab is hidden. Only for viewers who can save. Read in code.
- Code: `51-usage.js` (`USE`, `track`, `usageFlush`, capture-phase click listener), `setView` calls `track`.
- Data: `usage/<viewer id>` `s.<visit id>` = `{d, w, c}`.
- Test: (owner) use a few pages, wait 30 s, open "What people use": those pages are counted.

**SHELL-23 · Account sync notices**
- Sees / does: teams, box and settings are saved to the viewer's Claude account and kept in step across devices; a change from another
  device arrives live with the toast "Updated from your other device" (or "Your box was updated from your other device"); it waits
  while you are typing in a box. "Storage is full. Delete a saved team." if the account document is full. Saved Teams / My Box say
  "Saved to your Claude account…" or "Saved in this browser only…". Read in code.
- Code: `03-persistence.js` (`flush`, `persist`, `takeRemote`, `waitTyping`, `syncNote`).
- Data: `data/users/<id>/state`, `localStorage cc2.state` (see saved-data.md).
- Test: open the site on two devices, add a Pokémon on one: the other shows the toast and the new Pokémon.

**SHELL-24 · Shared team links (#team=)**
- Sees / does: a link `<site>#team=<code>` opens with a banner "Shared team — <name or first three Pokémon> — Load it / Not now". Load
  it replaces the team (toast "Loaded "name" (N Pokémon)" with Undo) and opens My team; both buttons clear the code from the address.
  Never applied silently. Codes are checked: one per species, only legal abilities and items. Read in code.
- Code: `45-team-links.js` (`teamCode`, `teamLink`, `decodeTeam`, `checkSharedLink`, `applyShared`, `copyTeamLink`, `TL_ART`),
  `00-main.js` (calls `checkSharedLink` on load), `75-arena-build.js` (banner style).
- Data: URL hash or query `team=`.
- Test: open the site with a team link: the banner shows the team's name; tap "Not now": the banner closes, your team is unchanged and
  the address has no `#team=`.

**SHELL-25 · Box links (#box=)**
- Sees / does: a link `<site>#box=<code>` opens My box with the paste field already filled and "A box link with N Pokémon. Add them to
  your box, or replace your box with them." (Add / Replace, both undoable). Read in code.
- Code: `45-team-links.js` (`checkBoxLink`, `decodeBox`, `applyBox`).
- Data: URL hash `box=`, `S.box`.
- Test: open a box link: My box opens with the link pasted and the two buttons ready.

**SHELL-26 · Copy for Showdown**
- Sees / does: every team card (Winning Teams, Events, Home champion, cores, built teams) has "Copy for Showdown". It copies the team
  in Showdown's text format (exact sheet when known; Mega written as base + stone; no invented stat points) and toasts "Copied — paste
  into Showdown's teambuilder" (+ "Some details weren't published — filled with the most common set" or "Moves, items and natures are
  the most common sets from real play"). If the clipboard is blocked, a "Copy for Showdown" dialog shows the text selected to copy by
  hand (× / backdrop / Escape close). Read in code; button seen running.
- Code: `56-showdown-copy.js` (`sdBtn`, `sheetPaste`, `sdCopyText`, `sdSheetOpen`), `75-arena-build.js` `ARBLD.dlg`.
- Data: clipboard.
- Test: on Winning Teams tap "Copy for Showdown" on the first card, paste into a text editor: six Showdown blocks with "Level: 50".

**SHELL-27 · Share card dialog**
- Sees / does: shared dialog for share images (This Week image, the team card/poster from My team). Shows the image, a Light/Dark
  picker (THEME-03), "Save image" (saves through Claude's downloads permission, otherwise a normal download; messages "Saved.", "Not
  saved.", "Saving is not available here. Press and hold the image instead."), "Copy team link" for team cards only, the hint "On a
  phone you can also press and hold the image to save or share it.", × close, backdrop, Escape, Back. Seen running (This Week).
- Code: `44-share-card.js` (`openShareCard`, `closeShare`, `SHARE_KIND`), `61-concept-h-pages.js` (style picker), `66-extras-b.js`
  (team poster choice).
- Data: `claude.use('downloads')`.
- Test: on This Week tap "Share this week": a tall image with Rising/Falling and the week's winner appears; tap Dark: it redraws dark;
  tap Save image: the file "This week in Reg M-C - NastyPlot.png" is offered.

**SHELL-28 · Darkrai on empty screens, tips and confirmations**
- Sees / does: the Darkrai picture (decoration only, no alt text) appears: (1) empty My team (approved Nov 9); (2) peeking on every "?"
  tip bubble; (3) on confirmation toasts (SHELL-07); (4) on empty-state notes of the Saved Teams, My Box, Test Run, Build for Me,
  **Events** and Cores pages; other empty notes show a meta Pokémon instead; (5) empty saved-teams / box blocks in `75-arena-team.js`.
  Never on grades, ratings or data, never on Battle preview. If `window.NP_MASCOT` is missing, a Pokémon sprite or nothing shows. Seen
  running (tip, toast).
- Code: `app/build.mjs` (sets `window.NP_MASCOT` from `docs/mascot/darkrai.webp`), `74-arena.js` `AR.mascot`, empty My team;
  `46-onboarding.js` (tip), `06-helpers.js` `TOAST_DK`, `71-manga.js` `MG.flair` (`MG.DK_PANES`), `75-arena-team.js`.
- Data: none.
- Test: open Events with no event data: the empty note "Tournament results appear here after the next data refresh." has Darkrai.

**SHELL-29 · Loading states**
- Sees / does: "Plotting… loading the latest data." (Usage before data), spinner notes "Working out the best swaps for your team…"
  (All suggestions) and in Build/Compare, "Loading…" in owner panels. Pages render from a built-in data snapshot until live data
  arrives (Ratings then shows the snapshot's date, e.g. "data as of Nov 1"). Seen running (no-data pass).
- Code: `body.html` `#metaSource`, `32-views.js` (coverage), `08-render-all.js` `PLAN_WAIT`, `22-auto-build.js`, `63-compare.js`,
  `16-outside-performance-data.js` (`builtinOk`, built-in tables), `08-render-all.js` `scheduleRender`.
- Data: built-in data tables in `app/src/data/*.js`.
- Test: open the site with no data connection: Ratings still lists Pokémon, with an older "data as of" date.

**SHELL-30 · Double-tap guard**
- Sees / does: right after an action that changes the team or page (apply a plan, save, use a built team, load an event team, add from
  ratings, build around, clear), a second tap within 0.45 s is ignored. Read in code.
- Code: `34-events.js` (`TAP_ACT`, capture-phase listener).
- Data: none.
- Test: double-tap "Add to team" on a sheet quickly: only one Pokémon is added.

**SHELL-31 · Keep your place**
- Sees / does: when a tap redraws part of the page (filters, folds, Apply, Load team, Show more…), the tapped control stays where it was
  on screen instead of jumping away; not for page changes, sheets, search, or "more" buttons that open rows above themselves, and not
  after the reader scrolls. Outside taps and Escape also close "⋯" dropdown menus; tips close when an inner box scrolls. Read in code.
- Code: `72-keep-place.js` (`KP`, capture click listener, `KP.hold`, `KP.recent`, moremenu close), `06-helpers.js` `keepScroll`.
- Data: none.
- Test: on Ratings open the filter and tap the "Fire" chip: the chip stays under your finger while the list below changes.

**SHELL-32 · Motion and effects**
- Sees / does: page fade on switch; a 150 ms ink "impact" flick on main buttons and tappable Pokémon; holographic foil on S-tier cards
  (Ratings top list, board S row, sheet rating box) that follows the pointer on desktop, device tilt where no permission is needed, or
  scroll; "Mega moment" style on Mega cards; all off with reduced motion. Desktop sprite glow is off on mouse screens except feature
  sprites (CLAUDE.md rule; CSS). Read in code; foil seen.
- Code: `32-views.js` (`np-sw`), `71-manga.js` (`mgimp` pointerdown), `65-design-c.js` (`nps`), `66-extras-a.js` (`NX`, `npMega`),
  theme CSS.
- Data: none.
- Test: with "reduce motion" on in the OS, switch pages: no fade; the S cards do not shimmer.

**SHELL-33 · Pokémon art and type colours**
- Sees / does: every Pokémon shows its sprite on a slanted field in its type colours (dual types blend through a middle colour that
  never turns brown/khaki), Megas get a "power-up" contour; Dark and Normal use adjusted colours (slate violet, lilac grey). Sprites are
  the 345 files `sp/*.webp` next to the page (lazy-loaded; must be shipped with every publish, CLAUDE.md). Seen running.
- Code: `15-visual-helpers.js` `sprite`, `SPRITE_ID`; `74-arena.js` `AR.TC_FIX`, `AR.tv`, `AR.dark`, `AR.mid`; `75-arena-meta.js`
  `ARM.paint`, `ARM.run`; `71-manga.js` (contour).
- Data: `sp/<id>.webp` files.
- Test: on Ratings every row's Pokémon stands on its own colour field; Mega Charizard Y has the Mega contour.

**SHELL-34 · A broken part never breaks the page**
- Sees / does: each page part renders inside a guard; if one fails, the rest of the page still shows (error only in the console).
  Untrusted daily data is cleaned (known fields only, numbers coerced, lists capped) before use. Read in code.
- Code: `08-render-all.js` `safe`; cleaners `cleanMeta`, `cleanEvents`, `cleanWeekly`, `cleanCalendar`, `cleanTrack`, `cleanPerf`,
  `cleanTeams`, `cleanHistory`.
- Data: all `meta/*`.
- Test: (developer) feed a malformed `meta/weekly`: This Week shows its empty note; other pages are unaffected.

---

## 5. RATE · Pokémon Ratings page (`ratings`)

**RATE-01 · Page head**
- Sees / does: NAV-04 and NAV-05 switches, then a kicker line "Rated 0–100 from real results: Reg M‑C doubles, 13,826 teams, data as
  of Nov 10" with a "?" ("How to read our numbers"); the big "Pokémon" title is screen-reader only. Then links "How ratings work →"
  (How We Calculate, ratings section) and "Track Record →". Seen running.
- Code: `61-concept-h-pages.js` `CH.wrap('renderLair')` (kicker, `.sr` title, "?" `tip('numbers')`), `63-method.js` (the two links,
  `npLink`), `43-data-health.js` `regInfo` (reg id).
- Data: `meta/perf.updated`, results team count (`RES.teams`).
- Test: open Ratings: the kicker shows the team count and today's data date; tap "How ratings work →": How We Calculate opens with
  the Pokémon Ratings section open.

**RATE-02 · Search**
- Sees / does: "Find a Pokémon or type" box; matches names (case-insensitive substring) or an exact type name ("fire"). Typing opens
  the full board (RATE-07) and hides the top list; count line "38 of 345 match". × clears. Seen running.
- Code: `25-ratings-page.js` (`lairFilter`, input handler on `#lairQ`), `61-concept-h-pages.js` (opens `#chBoard`).
- Data: `ui.lq` (memory).
- Test: type "chomp": only Garchomp forms are listed with "3 of 345 match".

**RATE-03 · Filter button and filters**
- Sees / does: a "Filter" button beside the search (with a count badge when filters are on; stays open while any is on) reveals: 18
  type chips (pick up to two; a third replaces the oldest; a Pokémon must have both), and flags "Megas", "No Megas" (each turns the
  other off), "◆ Hidden gems" (only when any exist), "In my box", plus "Clear" while anything is filtered (clears search too). Seen
  running.
- Code: `74-arena.js` (`CH.wrap('renderLair')` Filter button, `AR.lfOpen`); `25-ratings-page.js` (`data-lty`, `data-lflag`, `lairFilter`).
- Data: `ui.lty`, `ui.lf` (memory; not remembered).
- Test: tap Filter, tap Fire and Flying: only Fire/Flying Pokémon show; the Filter badge says 2; tap Clear: everything returns.

**RATE-04 · Empty results**
- Sees / does: "No Pokémon match. Try clearing a filter." and "0 of 345 match"; with "In my box" and an empty box: "Your box is empty.
  Add the Pokémon you own on My box." Seen running (no match).
- Code: `25-ratings-page.js` `renderLair`.
- Test: search "zzzz": the no-match line shows.

**RATE-05 · Top of the ratings (hot list)**
- Sees / does: shown when not filtering. A tier header (S chip, "90+: 11 Pokémon, ranked among 321 with results", "?" tiers tip,
  "Details"). The #1 Pokémon as a hero card (type colours, big number, rank caption, name, sprite with art). If #1 is tied, one card for
  2 or 3 Pokémon ("Tied for #1 of N with results"); on desktop a lone #1 has the next 2-3 ranks beside it. Then numbered rows: rank "#k",
  sprite on type field, name, "% of teams" with a usage bar, the rating number in its band colour; a tier divider row when the tier
  changes. 20 rows on desktop, 16 on phones. Each row/card opens the info sheet. S cards carry the foil (SHELL-32). Seen running.
- Code: `61-concept-h-pages.js` `chHotHtml`, `#chHot`; `71-manga.js` `MG.ratings` (hero art); `65-design-c.js`, `66-extras-a.js`
  (foil, Mega moments); `75-arena-meta.js` (type fields).
- Data: ratings (`13-rating.js` `ratings`), `src.tour` (share, wins, games).
- Test: open Ratings: Sneasler (or the current #1) leads with its number; the rows are in rating order with "#2", "#3"…; tap a row:
  its sheet opens.

**RATE-06 · Details on the top list**
- Sees / does: "Details" shows each row's win % and "N games" and the rank pill on the hero; "Hide details" hides them. Seen running.
- Code: SHELL-15 with key `hot`.
- Test: tap Details: "51.8% wins, 29.8k games" appears under Sneasler.

**RATE-07 · Every Pokémon, by Tier (board)**
- Sees / does: a fold "Every Pokémon, by Tier · 345 rated, S (90+) to F (under 50)"; opens automatically while searching/filtering.
  Inside: legend "Number = rating ?, ◆ hidden gem, in your box, ? few games, so the score is an estimate"; one row per tier (S 90+,
  A 80+, B 70+, C 60+, D 50+, F <50) with the tier description and count ("Top of the Format: 11"), and tiles (rating number, name, Mega
  named "Mega X", ◆ gem mark, box mark, "?" look for estimates, hover title "Name · rated N · #k… · likely a–b (few games: an
  estimate)"). Long tiers show the first few with "+N more" / "Show fewer" (phones 5, desktop about two rows; everything when filtering).
  The S row has the foil. Remembered open/closed. Seen running.
- Code: `25-ratings-page.js` (`renderLair` board, `lairTile`, `ltName`, `ltnFit`, `data-ltier`), `61-concept-h-pages.js` (fold
  `lairboard`), `75-arena-meta.js` `ARM.polish` (legend), `65-design-c.js` (S foil).
- Data: `cc2.chf.lairboard`; `ui.lopen` (memory).
- Test: open the fold: six tier rows appear; tap "+260 more" on F: all F tiles show and the button reads "Show fewer".

**RATE-08 · About the Ratings (fold)**
- Sees / does: "How they are made, sources and their track record". Inside: the live track record sentence ("in 113 recent events, the
  team with the higher average rating finished higher in 54% of 3,885 head-to-head pairs (50% would be a coin flip). Ratings rank
  single Pokémon…"; only when 200+ pairs), the scale paragraph, four number cells (Pokémon rated, data sources, in S tier, hidden gems),
  a nested "Doubles sources · data from Nov 10" list with one dated line per source, and the long method paragraph (four ingredients,
  pulled toward average, halving presence costs ~10 points, chosen Oct 27, hidden gem rule, saved daily). Remembered. Seen running.
- Code: `25-ratings-page.js` (`ratingTrack`, `#ratingTrack`, `#lairHero` contents), `61-concept-h-pages.js` (fold `lairabout`),
  `74-arena.js` (moves it under the list).
- Data: `meta/events` (track record pairs), `meta/perf.sources`, `cc2.chf.lairabout`.
- Test: open the fold: the four numbers are filled; the track record line shows a percentage and pair count.

**RATE-09 · The rating scale and words (shared logic)**
- Sees / does: every rating reads like a school grade 0-100 (S 90+, A 80s, B 70s, C 60s, D 50s, F under 50), tier colours
  (S gold, A orange, B purple, C blue, D teal, F grey), rank "#k of N Pokémon with tournament results" (ties share a rank; Pokémon with
  no results have no rank), range "likely 80–88", hidden gem ◆ (rare Pokémon that overperform, stable), "trap" (lost more than it won;
  suggestions skip it). Rating inputs past their maximum age are left out; with no live data the built-in snapshot is used. Read in code.
- Code: `25-ratings-page.js` (`LTIERS`, `RS`, `lTier`, `lairRank`, `rankTxt`, `rRange`, `tierChip`), `13-rating.js` (`ratings`,
  `rating`, `isGem`, `isTrap`, `v3Apply`), `16-outside-performance-data.js` (`activePerf`, `PERF_MAXAGE`, `builtinOk`).
- Data: `meta/perf`, `meta/results`, built-in tables.
- Test: a Pokémon shown as 91 is in S, one shown as 79 is in B, in every place it appears (board, top list, sheet, search).

**RATE-10 · Meta map view (retired)** — see DEAD-05. Read in code only.

**RATE-11 · Sleepers section (off)** — see DEAD-06.

### Pokémon info sheet (opened from Ratings and from any page)

**SHEET-01 · Opening and closing**
- Sees / does: tapping any Pokémon (`data-lt` anywhere: Ratings, This Week, Track Record, Home, Usage…) opens a dialog sheet over the
  page; focus moves into it without a focus ring on taps; page behind is locked. Closes with ✕, a tap on the backdrop, Escape, or Back;
  focus returns to what opened it. Keyboard: Enter/Space on Pokémon rows. Seen running.
- Code: `25-ratings-page.js` (`lairSheet`, `lairClose`, `lairOpener`, `[data-lt]`/`[data-lclose]` handler), `61-concept-h-pages.js`
  ("sheet anywhere" moves `#lairSheet` to `<body>`; Enter/Space on `[role=button][data-lt]`), `32-views.js` (Back).
- Data: `ui.lsheet` (memory).
- Test: on This Week tap a Rising Pokémon: its sheet opens; press Escape: it closes and focus is back on that row.

**SHEET-02 · Sheet header**
- Sees / does: sprite on a type-themed hero, rating number with "?" (What a rating means), "S tier, #3 of 321 with results", name,
  type chips, tags Mega / Hidden gem / In your box; S-tier foil. Three numbers: rating (with "Early read" when thin), "% of teams" ("of
  13.8k"), win rate (or "–" under 30 games; coloured up/down/even) with "N games". Desktop has its own two-column layout. Seen running.
- Code: `25-ratings-page.js` `lairSheet`; `61-concept-h-pages.js` `CH.wrap('lairSheet')` (numbers); `66-extras-a.js` (type theme);
  `71-manga.js` `MG.sheet` and `74-arena.js` (hero art); `73-desktop-sheet.js` `DSK.layout`.
- Data: rating, `src.tour`, `RES.teams`.
- Test: open Incineroar: "35% of teams", "51.3% win rate", "27,422 games".

**SHEET-03 · Tabs Info | Meta | Rating**
- Sees / does: three tabs ("Info: stats, types", "Meta: moves, items", "Rating: why, data"); the last chosen tab is remembered on the
  device (first visit: Info); on touch a clear sideways swipe moves to the next tab. Seen running (tabs); swipe read in code.
- Code: `67-sheet-tabs.js` (`LST`, `data-lstab`, swipe handler).
- Data: `localStorage cc2.lstab`.
- Test: choose Rating, close, open another Pokémon: it opens on Rating.

**SHEET-04 · Info tab**
- Sees / does: "Usually" (item, nature, stat points; four moves) with "Full set ›" (jumps to the Meta tab); base stat bars and total;
  abilities with share ("Most used, 100%") and descriptions ("Share of players' sets with each ability, in-game ranked battles.");
  type matchups (2× weak / Resists ½ / Immune, note on abilities); "Speed at Level 50" with seven builds (what players run, no Speed
  points, max, max + nature, Choice Scarf, Tailwind, Trick Room) each "outspeeds N% of the top 30"; "Speed Tiers →". Seen running.
- Code: `67-sheet-tabs.js`.
- Data: Pokémon data, `setFor`, speed maths (`39-damage-calc-speed.js`).
- Test: Incineroar's Info tab lists Intimidate at 100% and "2× weak: Water, Fighting, Ground, Rock".

**SHEET-05 · Meta tab**
- Sees / does: "Typical Set" (Ability with %, Item(s), Nature, Stat points, Moves); move bars with the source ("Moves: in-game ranked
  battles"), item bars (or "N% hold <stone> to Mega Evolve… See Mega X ›" for Pokémon usually Mega-evolved, "Always holds <stone>" for
  Megas), "Brought with" (up to 4 partners: % brought together and games, tap to open that sheet) with its footnote. Seen running.
- Code: `61-concept-h-pages.js` (moves/items/brought with), `25-ratings-page.js` (typical set), `67-sheet-tabs.js` (panel split).
- Data: `setFor`, `RES.tc.bw` (Showdown replays).
- Test: Incineroar's Meta tab shows Fake Out near 98% and Rillaboom under Brought with.

**SHEET-06 · Rating tab**
- Sees / does: "Why It Rates N": four bars (Top-cut presence, Picked by strong players, Converts to top cut, Win rate), each "Top X% of
  Pokémon" with its fact, "?" bars tip, explanation, "Profile: power, typing, tools" fold. Variants: no results ("rough placeholder…
  never above N") and older formula bars. Trap warning. "What the Data Says" rows, each with its date: Same players test, Team preview
  (Showdown replays), Limitless tournaments, Official VGC events, In-game Ranked Doubles (op.gg season), Showdown 1760+, Showdown ladder.
  "Other Tier Lists" (outside sites' letter for this Pokémon, links open a new tab, "not counted in the score"). Links "How ratings work
  →" and "Track Record →". Seen running.
- Code: `25-ratings-page.js` `lairSheet` (bars, evidence `ev`, outside lists), `13-rating.js` (`pilotFor`, `bringLead`),
  `16-outside-performance-data.js` (`perfDateText`, outside lists), `67-sheet-tabs.js`.
- Data: `meta/perf` (tour, official, ingame, smogon, ladder, outside), `meta/results`.
- Test: Incineroar's Rating tab lists "Limitless tournaments 35% of teams" with today's date and an outside tier list link.

**SHEET-07 · Sheet actions**
- Sees / does: "Add to team" (adds to the first empty slot, toast "X added to your team"; replaced by "On your team", "<form> is already
  on your team (one per species)" or "Team full"), "Build around it" (Build for me with this Pokémon locked in), "Popular Sets" (opens
  Popular Sets on this Pokémon), "Report a mistake" (SHELL-20; hidden for viewers who cannot save). Seen running.
- Code: `25-ratings-page.js` (`data-laddteam`, `data-lsets`), `61-concept-h-pages.js` (`fbMisBtn`), build-around handler (Build group).
- Data: `S.slots`, `cc2.setMon`.
- Test: with a free slot, open Volcarona's sheet, tap Add to team: the toast shows and the button becomes "On your team".

---

## 6. META · Usage page (`meta`)

**META-01 · Page head and source line**
- Sees / does: switches, page title "Usage", source line (e.g. "op.gg, official in-game Ranked Doubles, season M-8"; "Limitless team
  sheets, 8,219 teams from 223 Reg M-C tournaments, Oct 13 – Nov 10"; "Showdown ladder 1630+ (Smogon…), Oct 2026, 1,649,648 battles"),
  optional "Last refresh … · Refreshes daily" status line (only if a `meta/status` document exists; none in the test data). Seen running.
- Code: `29-fix-planner.js` `renderMeta`; `61-concept-h-pages.js` (`CH.pagehead`).
- Data: `meta/doubles_ingame`, `meta/doubles_tour`, `meta/doubles`, `meta/status`.
- Test: switch to Online tournaments: the source line names Limitless and a team count.

**META-02 · Data source switch**
- Sees / does: sliding picker Ranked ladder / Online tournaments / Showdown ladder. A source with no data is disabled with the tooltip
  "No data from this source yet"; if the chosen source has none the first available is used. Not remembered (starts on Ranked ladder).
  Seen running.
- Code: `29-fix-planner.js` `renderMeta`, `34-events.js` (`d.src`), `01-state.js` `SRC`, `76-slide.js`.
- Data: `ui.metaSrc` (memory).
- Test: tap Showdown ladder: the list order and source line change.

**META-03 · Search in usage**
- Sees / does: "Find a Pokémon" box filters every rank (not just the top 10), live count "N matches" / "No Pokémon in this list matches
  that"; hides the "rest of the list" button while searching. Seen running.
- Code: `61-concept-h-pages.js` (`chMetaFilter`, `#chMetaQ`, `#chMetaCount`).
- Data: `ui.metaQ` (memory).
- Test: type "zzz": "No Pokémon in this list matches that".

**META-04 · Usage rows**
- Sees / does: rank (medal style for 1-3), sprite, name, trend badge ("▲2 places", "▼1 place", "NEW" with a tooltip "Up 2 places in
  usage rank in a week (#12 → #10). Daily ranks, N days kept." and a small rank sparkline), type chips, usage % with bar, and "N teams"
  (tournament source). Tap a row to expand. Seen running.
- Code: `29-fix-planner.js` `renderMeta`; `18-archetypes.js` `trendFor`, `rankSpark`; `75-arena-meta.js` (type fields).
- Data: source document `top`, `meta/history` (trends).
- Test: on Online tournaments, a row with a trend shows an arrow and "places".

**META-05 · Expanded usage row**
- Sees / does: win rate for this source and its team count; Abilities, Items, Moves, Natures bars "Of N teams"; Checks & counters
  (ladder); Teammates with %; "No set details for this one yet." fallback; "Add to team" (only when not already on the team and a slot
  is free; toasts "X added", "X is already on your team", "Your team is full. Remove a Pokémon first."). Seen running.
- Code: `29-fix-planner.js` `renderMeta` (`stat`, `data-addmeta`), `34-events.js` (`d.addmeta`).
- Data: row fields `ab/it/mv/na/cc/tm/w/teams`, `setFor` fallback.
- Test: open Rillaboom's row on Online tournaments: Grassy Surge and Fake Out bars show "Of 3,133 Teams".

**META-06 · Top 10, then the rest**
- Sees / does: only ranks 1-10 shown; a fold button "Ranks 11–60 · The rest of the list" shows the rest ("Show the top 10 · Fold the
  rest away" to collapse); the "Also ranked 61–N: …" name list and the source note appear with the rest. Seen running.
- Code: `61-concept-h-pages.js` (`#chMetaMore`, `ui.chMetaAll`).
- Data: memory.
- Test: tap "Ranks 11–60": ranks 11+ appear and the button text flips.

**META-07 · Empty and loading states**
- Sees / does: before data "Plotting… loading the latest data."; with no data "Live data appears here when the page is opened in
  Claude." and "No meta data loaded yet."; an empty list "No Pokémon in this list." Seen running (no-data pass).
- Code: `body.html` `#metaSource`, `29-fix-planner.js` `renderMeta`.
- Test: open Usage without data: the two no-data lines show.

---

## 7. SETS · Popular Sets page (`sets`, Pokémon › Sets)

(Reached from Rating/Usage/Sets, the sheet's "Popular Sets", the set editor's "Full popular sets ›", the menu and search. May overlap
with the group that covers Pokémon pages; listed so nothing is lost.)

**SETS-01 · Look up a Pokémon** — combobox "Look up a Pokémon" with suggestions and ×; choosing one shows its sets. Remembered.
  Code: `21-sets.js`, combobox `05-combobox.js`; Data: `localStorage cc2.setMon`. Test: type "Gholdengo", pick it: its sets show and
  stay after reload. (Seen running: field present.)

**SETS-02 · Your team picker** — "Your Team" row of your six as small art tiles; the selected one is marked; tap to show its sets.
  Code: `21-sets.js` (`data-setmon`), `75-arena-meta.js` `ARM.polish`. Test: tap Garchomp in the row: Garchomp's sets show. (Seen.)

**SETS-03 · Default choice** — opens on the remembered Pokémon, else your first team member, else the #1 rated Pokémon; with
  nothing at all: "Look up a Pokémon to see its popular sets." Code: `21-sets.js` `renderSets`. (Read in code.)

**SETS-04 · Set head** — sprite, name, type tags, Mega/Box tags, tier pill "S tier, rated 94, #5 of 321…"; then "Your Mega Charizard
  Y: Drought @ Charizardite Y, moves…" when it is on your team ("(your pick)", "(your moves)" when changed). (Seen.)

**SETS-05 · Source switch and set card** — Best data / Tournaments / Showdown (remembered); card "Doubles" with source/rank line,
  Moves, Item, Ability, Nature bars, Teammates (tap → that Pokémon), source footnote ("From Showdown 1630+ (Mega-specific)… N battles");
  "No data loaded yet" for an empty source. Code: `21-sets.js` (`SET_SRC`, `setCard`, `data-setsrc`), `34-events.js`. Data:
  `localStorage cc2.setSrc`. Test: tap Tournaments: the card's source line changes to tournament data. (Seen.)

---

## 8. TOP · Winning Teams page (`top`)

**TOP-01 · Page head**
- Sees / does: switches, "Winning Teams" title, source line "Top 4 from online tournaments with 32+ players, top 8 from official
  events, updated Nov 10". Seen running.
- Code: `18-archetypes.js` `renderTopTeams` (`ttSourceText`), `61-concept-h-pages.js` pagehead.
- Data: `meta/teams.source/updated`.
- Test: the source line shows today's update date.

**TOP-02 · Team search**
- Sees / does: "Search winning teams" box over all event team sheets (976 teams); suggestions show Pokémon (with sprite) or item / move
  / ability (with a kind tag) and "N teams"; pick with tap or Enter; up to 6 filter chips with ×, and "Clear"; suggestion list says
  "Nothing in the winning teams matches that." when empty. Seen running ("Sitrus" → "Sitrus Berry · Item · 534 teams").
- Code: `49-events.js` (`renderTeamSearch`, `tsTerms`, `tsUi`, `data-tsx`), `05-combobox.js` (`openMenu`, `kb`), `63-weekly.js`
  `kindTag`.
- Data: `meta/events` (all top teams).
- Test: type "Sitrus", press Enter: a chip "Item Sitrus Berry ×" appears.

**TOP-03 · Search results**
- Sees / does: "534 teams match, 52 won their event", "Often with:" chips of the six most common teammates with % (tap adds that
  Pokémon as a filter; shown with 3+ hits), team sheet cards (official first, then by place, then newest) with matched words
  highlighted and sets opened automatically when an item/move/ability is searched; 8 at a time "Show more (N left)"; "No winning team
  has all of these. Remove a filter." The normal list hides while searching. Seen running.
- Code: `49-events.js` `renderTeamSearch`, `teamSheetCard` (shared with EVT-06), `data-tsadd`, `data-tsmore`.
- Data: `meta/events`.
- Test: with the Sitrus Berry filter tap "Sneasler 30%" in Often with: the count drops and both chips show.

**TOP-04 · Your team strip**
- Sees / does: "Your Team" with your six names, checks badge "2/4 checks" with "missing: …" (tooltip lists each check), archetype
  chips (Sun, Grassy Terrain, Tailwind…); "Add six Pokémon on My team to compare." when not full. Seen running.
- Code: `18-archetypes.js` `renderTopTeams` (`miniGrades`, `proChecks`, `archChips`, `teamPlanLabel`).
- Data: current team.
- Test: with six Pokémon the strip shows a checks count; remove one: it asks to add six.

**TOP-05 · Team list**
- Sees / does: grouped by section ("Official Events 32", online…), each card: who (player/place, e.g. "Champion official event"),
  event name and size, the six sprites, checks badge with tooltip, archetype chips, actions (TOP-06). First 3 cards shown with "More
  Winning Teams · Showing the top 3 of 90" (toggle "Show fewer"); within a section a second cap of 5 with "Show N more". Seen running.
- Code: `18-archetypes.js` `renderTopTeams` (`ui.ttMore`, `data-ttmore`), `61-concept-h-pages.js` `chTeamsMore`/`CH.more`.
- Data: `meta/teams`.
- Test: tap "More Winning Teams": more cards appear; tap again ("Show fewer"): back to three.

**TOP-06 · Card actions**
- Sees / does: "Load team" (if you already have Pokémon: inline "Replace your current team? Replace / Cancel"; loads the event's full
  sheet with moves and items when the same team is in Events, else the six names; opens My team; toast with Undo), "Practice against"
  (their six become the Battle opponent; Battle opens; toast "Opponent set: …"), "Compare" (Compare page: your team vs this one),
  "Copy for Showdown" (SHELL-26). Seen running (confirm).
- Code: `34-events.js` (`ttask`, `ttload`, `ttx`), `18-archetypes.js` (`loadTopTeam`, `data-ttvs`), `49-events.js` `loadSheet`,
  `63-compare.js` (`data-cxgo`).
- Data: `S.slots`, `S.opp`, `cc2.state`.
- Test: with a team, tap Load team on a card: the confirm appears; tap Replace: My team shows that six and a toast offers Undo.

**TOP-07 · Empty state** — "Top teams appear here after the next data refresh." (seen in no-data pass).

---

## 9. EVT · Events page (`events`)

**EVT-01 · Page head with counts**
- Sees / does: switches, "Recent tournaments / Events", number cells "113 events, 105 online, 8 official" and a "?" ("What counts as an
  event": online tournaments with 32+ players from the last 30 days (top 8) and official events (top 16)). Seen running.
- Code: `49-events.js` `renderEvents` (`#evSource`, `evSourceText`), `61-concept-h-pages.js` pagehead.
- Data: `meta/events`.
- Test: the three counts show and the "?" explains the rule.

**EVT-02 · Next events calendar**
- Sees / does: "Next Events · 31 on the calendar"; four upcoming events (national events left out): date block, name, date range, city,
  country, type word when not in the name, countdown "Live now" / "Tomorrow" / "in N days" (soon style within 7 days); each row links to
  its Victory Road page in a new tab. "Show all 31" / "Show fewer". "Recent:" up to three finished official events: "<name> results ›"
  opens that event's results, or "· results not in yet". Footer "From Victory Road season calendar, checked Nov 10" ("(N days ago)" when
  over 2) with "?" ("VGC days, in each event's local dates."). Countdown updates at midnight. Hidden while an event is open. Empty:
  "The event calendar appears after the next data refresh." / "No upcoming events listed right now." Seen running.
- Code: `63-weekly.js` (`cleanCalendar`, `CAL`, `calendarHTML`, `CH.wrap('renderEvents')`, `data-calall`, midnight interval).
- Data: `meta/calendar`; `meta/events` for results matching (same city within 3 days).
- Test: the first row's countdown matches days to its start date; tap "Show all 31": all upcoming rows show; tap "Gdańsk Regional
  results ›": that event's standings open.

**EVT-03 · Event filter**
- Sees / does: sliding picker All / Official / 100+ players; resets "Show more". Seen running.
- Code: `49-events.js` (`evUi.filter`, `data-evf`).
- Data: memory.
- Test: tap Official: only events marked OFFICIAL remain.

**EVT-04 · Event list**
- Sees / does: cards (name, OFFICIAL tag, date, players, winner's six sprites each on its type field), 12 at a time with "Show more (101
  left)"; "No events here yet." when a filter leaves nothing. Seen running.
- Code: `49-events.js` `renderEvents` (`data-evopen`, `data-evmore`), `75-arena-meta.js` (sprite fields).
- Test: tap "Show more": 12 more events appear.

**EVT-05 · Event detail**
- Sees / does: "‹ All events", name, "Oct 31, 758 players, Official Pokémon event (Victory Road), top 16" or "Online (Limitless)",
  OFFICIAL tag, "Most brought by the whole field" chips with % (when the data has it), then a team card per placing (1st, 2nd…, record
  when known). The page scrolls to the top. Entry points: list card, calendar "results ›", This Week winners, Home champion. Seen running.
- Code: `49-events.js` (`evUi.open`, `data-evback`), `63-weekly.js` (`data-wkev`, calendar), `74-arena.js` (Home).
- Data: `meta/events` (`top`, `field`).
- Test: open the Gdańsk event: 16 team cards from 1st to 16th; tap "‹ All events": the list returns.

**EVT-06 · Team sheet card (Events and team search)**
- Sees / does: place badge and record, event line (in search results), six sprites (or, after "Sets", each Pokémon's item, Ability,
  nature and four moves), archetype chips; buttons "Load team", "Sets"/"Hide sets", "Practice against", "Compare", "Copy for Showdown".
  "Load team" when you already have a team: first tap changes the label to "Tap again to replace your team" (6 s window), second tap
  loads the exact sheet (moves, items, abilities) and opens My team with "X's team loaded with its moves and items" + Undo. Seen running
  (sets; the two-tap load read in code).
- Code: `49-events.js` (`teamSheetCard`, `evTeam`, `loadSheet`, `ui.evSure`, `data-evsets`, `data-evvs`), `56-showdown-copy.js`.
- Data: `S.slots`, `S.opp`.
- Test: tap Sets on the 1st place card: six item/ability/move blocks show; tap Load team twice: My team opens with those moves.

**EVT-07 · Empty states** — "Tournament results appear here after the next data refresh." (Darkrai, SHELL-28) and the calendar empty
  line (seen in no-data pass).

---

## 10. ARCH · Archetypes page (`arch`, Tournaments › Archetypes)

(Under the Tournaments switch, so listed here; may overlap with another group.)

**ARCH-01 · Archetype list** — "The team styles you'll face most…"; "From the latest 90 top tournament teams."; one fold per style
  (Tailwind, Sun, Grassy Terrain, Rain, Trick Room, Sand, Psychic Terrain, Snow…), sorted by share: name, "49%", "44 of 90 top teams",
  key Pokémon sprites. No data: "Usage numbers appear once top teams load." Code: `42-archetype-guides.js` `renderGuides`,
  `75-arena-meta.js`. Data: `meta/teams`. Seen running.
**ARCH-02 · Inside a guide** — what it does, Key Pokémon, "How to beat it" steps, "What your team has" (your Pokémon with the moves /
  abilities / types that answer it, ✓) or "Nothing on your team directly answers it. One of the ideas above would help." Test: open
  Trick Room: the steps list and your team's answers show. (Read in code.)

---

## 11. WEEK · This Week page (`weekly`)

**WEEK-01 · Head**
- Sees / does: "← Meta", kicker "Meta: last 7 days", title "This Week", "Tournament teams, Nov 4 – 10 against Oct 28 – Nov 3", cells
  "This Week 1,807 teams, 51 events" and "Week before 1,683 teams, 56 events", and the main button "Share this week". Reached only from
  the ⋯ menu (see BROKEN-10). Seen running.
- Code: `63-weekly.js` `renderWeekly` (+ `CH.pagehead`), `74-arena.js` (back link), `75-arena-meta.js` (primary button).
- Data: `meta/weekly` (`a`, `b`).
- Test: the two week ranges and counts show.

**WEEK-02 · Share this week** — opens the share card (SHELL-27) with a 1200-wide image: logo, "This week", date ranges, team counts,
  Rising / Falling with sprites and "▲N points", New tech with kind colours, the week's biggest winner band (or "No big event finished
  this week"), tagline. "Nothing to share yet" toast without data. Code: `63-weekly.js` `buildWeeklyCard`, `#wkShare`; `ARB` palette.
  Seen running.

**WEEK-03 · Pokémon on the move** — "Rising" and "Falling" up to 4 each: sprite, name, "27% → 33% of teams", "▲6 points"; tap → sheet.
  "No Pokémon rose/dropped enough to call it a trend."; "Not enough teams to compare this week (each week needs 200+)." Seen running.

**WEEK-04 · Most used this week** — five tiles (% and name), "Most used this week, % of teams."; tap → sheet. Seen running.

**WEEK-05 · New tech** — "Rising items, moves and abilities, per Pokémon" with "?" and "Details" (shows "(N <Pokémon> teams this week, M
  the week before)"); up to 4 rows with the kind marker (Move teal / Item amber / Ability violet, icon + word), the option name, the
  Pokémon, "38% → 64% of its teams", "▲26 points"; tap → sheet. Empty: "No item, move or ability jumped enough…" / "Needs more teams
  this week." Seen running.

**WEEK-06 · Winners this week** — up to 3 events from the week (official first, then 64+ players by size): name, OFFICIAL tag, date,
  players, winning six; tap → that event's detail on Events. Empty: "No official event or 64+ player event finished this week." / "Event
  results appear after the next data refresh." Seen running.

**WEEK-07 · Team styles** — every style with its % and, only for real changes, "▲ up N points from X%" / "▼ down…"; "% of teams using
  each style" with "?". Even grid (3/4/5 columns from the count). Seen running.

**WEEK-08 · New in top cut** — "First top 8 this regulation" with "?"; up to 4 Pokémon (or Pokémon+item) with "#place, event, N
  players"; tap → sheet; "Nothing new reached a top 8 this week." Seen running.

**WEEK-09 · How we decide what changed** — fold (styled as a fold strip) with the thresholds from the data (teams per week, points,
  standard errors, leave-one-event-out rule) and "Updated …". Seen running.

**WEEK-10 · Empty** — "This week's changes appear after the next data refresh." (seen in no-data pass).

**WEEK-11 · Kind marker (site-wide)** — one marker for Move / Item / Ability / Nature (icon + word + colour, never colour alone), used on
  This Week, the share card and team search. Code: `63-weekly.js` `KIND`, `kindIcon`, `kindTag`.

All WEEK entries: Code `63-weekly.js` (`cleanWeekly`, `WK`, `wkDelta`, `renderWeekly`, click handler `data-wkev`, `#wkShare`),
`75-arena-meta.js`; Data `meta/weekly`, `meta/events`. Test (general): open This Week from the menu; every Pokémon row opens its sheet;
"Share this week" opens the image.

---

## 12. TRACK · Track Record page (`track`, from Ratings)

**TRACK-01 · Head and stats** — "← Pokémon Ratings", "Ratings: checked against later events", "Track Record", "How right have our ratings
  been?", cells "Oct 29 tracking since", "13 days of ratings saved", "34 events checked so far". Seen running.
**TRACK-02 · How the check works** — three steps (Ratings saved each morning → An event is played → Its top 8 compared), "A fair test:
  the ratings never saw these events" with "?". Seen running.
**TRACK-03 · Top-8 teams by the rating we gave** — four bands (Rated 90+, 70–89, 53–69, under 53): "N of M Pokémon made a top 8" and the
  average share bar; "Early: only N events so far" + "?" before 10 events; verdict "Pokémon we rated 90+ were on top-8 teams more than
  20× as often as Pokémon we rated under 53." after. Seen running.
**TRACK-04 · Biggest hits / Biggest misses** — up to 3 each with sprite, name, "Rated 97, on 110 top-8 teams in 34 events, won 10
  events" / "Rated only 54, won <event>" / high ratings with no top 8 (after 5 events); tap → sheet; "None yet." Seen running.
**TRACK-05 · Week by week** — line chart per band once 3+ weeks exist, else "From about <date>: A line for each rating band…". Seen.
**TRACK-06 · Coming as the data grows** — list of what appears later (verdict after 10 events, misses after 5). Read in code.
**TRACK-07 · Events Checked** — remembered fold, newest first, up to 60: name, date, players, official, "ratings from <date>". Seen.
**TRACK-08 · Link and empty** — "How ratings work →"; with no data "Collecting · The first results appear here after the next morning's
  data refresh." Seen (no-data pass).

Code: `64-track.js` (`cleanTrack`, `TR_CUT`, `trRates`, `trBars`, `trLines`, `trMonRow`, `renderTrack`); Data `meta/track`,
`cc2.chf.trevents`. Test: open Track Record from Ratings; the counts match the "Events Checked" fold's length.

---

## 13. METHOD · How We Calculate page (`method`)

**METHOD-01 · Head** — "← Meta", "Reg M‑C doubles · plain words", "How We Calculate", freshness cell "Updated today" (or yesterday /
  date) with "?" (what the numbers are built from), cells "13,826 tournament teams", "39,052 games"; intro "Real results and real damage
  calcs. Tap a part for the working." Seen running.
**METHOD-02 · How to Read Our Numbers** — legend card: Pokémon ratings bands (S 90+ … F <50 in tier colours), Strength Score bands (90+ Top
  tier, 80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic in band colours), what bars, "#20 of N", "likely
  80–88", "%" and Strength Score mean. Seen running.
**METHOD-03 · Ten remembered sections** — Strength Score (equation chips, bands, "A team that beats today's tournament teams half the
  time scores 80", a live "Your team: … → 83 · Tournament ready" line, steps), Ready for the Top Threats, The 7 Team Checks, Pokémon
  Ratings (with "How right have they been? →" to Track Record), Usage, Sets and Sources (the source list with what each is used for and a
  live number), Damage Calc, Speed Tiers, Build Me a Team and Suggestions, What Gets Left Out (themed-cup words, staples alarm),
  Updates and Cross-Checks (data job timing, age limits, safety checks, cross-check, "Data on this page" dates list). A section whose
  data is missing says "This part needs the day's data." Seen running (titles); bodies read in code.
**METHOD-04 · Deep links into a section** — any "How we calculate →" / "How ratings work →" / "How the grade works" link opens the page
  with that section open and scrolled to (seen: Ratings link opened "Pokémon Ratings"). Tips link here too (SHELL-09).
**METHOD-05 · Track Record card** — "Track Record · How right have our ratings been? · Tracking since Oct 29, 34 events checked →". Seen.

Code: `63-method.js` (`NP_SOURCES`, `NP_SECTIONS`, `npLegend`, `npGradeLive`, `npFresh`, `renderMethod`, `npLink`, `ui.msec`,
`CH.gradeWhy` wrapper); Data: `meta/model.games`, `RES.teams`, `DATA_AT`, `meta/track`, current team; `cc2.chf.np_*`. Test: tap "How
ratings work →" on Ratings: How We Calculate opens with "Pokémon Ratings (0–100)" open and in view.

---

## 14. ABOUT · About & Legal page (`about`)

**ABOUT-01 · Head** — "← Meta", kicker "About & legal", "Made by Fans, for Doubles Players", "A team builder for Pokémon Champions VGC
  doubles.", chips Free / No ads / Fan-made / Unofficial. Seen running.
**ABOUT-02 · Eight sections (folds, not remembered), each with an icon** — What NastyPlot Is; Disclaimer & Trademarks (unofficial, artwork
  credit to Pokémon HOME / PokéAPI); Where the Data Comes From ("9 sources, credited and used by their rules": each source linked, what it
  is used for, how its terms are followed; Liquipedia CC BY-SA 3.0 note with links; Pokémon Showdown MIT licence text in a scrollable,
  keyboard-focusable block); No Guarantee; Privacy (no names/emails/cookies/ads/trackers; what is saved: teams under an anonymous ID,
  usage counts, feedback with scrubbing, one anonymous ID, on-device settings, Google Fonts); Player Names (public Masters results, removal
  on request); Removal & Contact; Not for Money. Seen running.
**ABOUT-03 · Show email** — the contact address is not in the page until "Show email" is tapped; then a mailto link and "Copy" (toast
  "Email copied", fallback "Press and hold the address to copy it"). Seen running. (Address deliberately not written in this file.)
**ABOUT-04 · Open at a section** — footer "About & Legal" opens the page at the top; "Privacy" and "Contact" open it with that section
  open and scrolled to. Seen running (Privacy).
**ABOUT-05 · Rules caption used elsewhere** — "Based on our reading of the Reg M-C rules — check the official rules before an event." under
  legality statements on other pages. Code `regNote`. Read in code.

Code: `56-about.js` (`DATA_SOURCES`, `SD_MIT`, `LEGAL_P1`, `legalMail`, `abtSec`, `renderAbout` (drawn once), `aboutOpen`,
`[data-about]`, `[data-abtmail]`, `footFill`, `regNote`), `75-arena-meta.js`. Data: none. Test: tap "Contact" in the footer: About opens
at "Removal & Contact"; tap "Show email": an email link and Copy appear.

---

## 15. Dead, duplicated or broken (measured unless marked)

1. **BROKEN-01 "Data as of" is invisible in the shell.** The header eyebrow ("Pokémon Champions: Regulation M-C, VGC Doubles, bring 6,
   pick 4, Data as of Nov 10") and the menu foot ("Pokémon Champions, Reg M-C, Data as of Nov 10", with the old "Appearance" label) are
   filled but not visible at 390 or 1440 (`checkVisibility` false). Only per-page stamps show.
2. **BROKEN-02 Page title not shown.** `#viewTitle` gets the page name on every switch but is hidden at all tested widths; the per-page
   headings carry the name instead (Ratings' own title is screen-reader only).
3. **BROKEN-03 Two theme controls, conflicting code.** `71-manga.js` sets `#thmBtn` `hidden` ("the Auto / Light / Dark switch is the one
   theme control") but `74-arena.js` re-styles it and it is visible (hidden attribute overridden by CSS). Behaviour is fine; intent is
   unclear. Also `body.html` has two Auto/Light/Dark groups (side foot and a `.tabtheme` in the tabs); both are moved into the menu; only
   one set showed (the other's visibility not checked).
4. **BROKEN-04 Last page is saved but never used.** `cc2.view` is written on every page switch and never read; a reload always opens Home.
   The Privacy text says "the last page you opened" is stored, which is true but has no effect.
5. **DEAD-05 Meta map.** `lairMap`, the Tier board / Meta map switch (`data-lmode`, `cc2.lmode`) and the map's keyboard handler remain,
   but `00-main.js` forces the board and the switch is hidden.
6. **DEAD-06 Sleepers.** `52-sleepers.js` `SHOW_SLEEPERS = false`; the Ratings/Home slot is empty.
7. **DEAD-07 This Week on Home.** `homeWeekTeaser` and `homeNextChip` exist with `WK_HOME = {teaser:false, chip:false}` ("OFF until Sim
   decides").
8. **DEAD-08 Track Record "Games check" card** is built in `renderTrack` (`games` variable) but never put on the page.
9. **DEAD-09 Team Score track record.** `trackRefresh` / `trackLine` in `06-helpers.js` are never called.
10. **BROKEN-10 Search and entry gaps / naming drift.** Jump search cannot find This Week, Track Record, How We Calculate, About & Legal
    or Team Preview Practice, and it uses old names that disagree with the menu and the Word list: "Best additions" (All Suggestions),
    "Battle mode" (Battle a Team), "Ratings" (Pokémon Ratings), "Meta rankings" (Usage), "Teams" (Winning Teams), "Winning cores" (Build
    Around a Core). This Week is reachable only from the ⋯ menu.
11. **DUP-11 Two "show more" layers on Winning Teams**: the page-wide "More Winning Teams · Showing the top 3 of 90" plus a per-section
    "Show N more" cap of 5 inside it.
12. **DUP-12 Two source lists that disagree.** About/footer (`DATA_SOURCES`, 9: Limitless, Victory Road, VR Pastes, Liquipedia, Showdown,
    Smogon, op.gg, Pikalytics, Showdown Tier) vs How We Calculate (`NP_SOURCES`, 8: Limitless, RK9, Showdown replays, Smogon, op.gg,
    Showdowntier, project-red-data, Pikalytics). RK9 and project-red-data are used for numbers (sheet rows say "RK9, read before Nov 1")
    but are not credited in About or the footer; Victory Road / VR Pastes / Liquipedia are not in the method list. Possible credit gap.
13. **BROKEN-13 Claude-only message.** Usage with no data says "Live data appears here when the page is opened in Claude." (public launch
    concern).
14. **ODD-14 About's back link says "← Meta"** and highlights nothing in the tabs; About sits under "Info" in the menu.
15. **ODD-15 Stale What's new.** The card's content and id are from Oct 28 (mentions "Feedback button at the bottom of any page", which is
    hidden for viewers who cannot save).
16. **DEAD-16 Old markup replaced at runtime.** `body.html`'s side menu (Team, Matchup, Coverage, "NastyPlot ratings", "Top teams"…),
    the Ratings `.head` hint and the `#metaTitle` "Doubles meta" text are rebuilt or covered by later modules; the rebuild should take the
    runtime version, not the HTML.
17. **ODD-17 Event team cards show no player name** (place and record only), while Winning Teams cards show "who". Unsure whether on
    purpose (privacy) or an omission.
18. **ODD-18 `meta/status`** is subscribed and drives Usage's "Last refresh" line, but the test data has no such document; unsure whether
    the live database has it.

## 16. Unsure (not verified)

- **Scope overlap:** I included Popular Sets, Archetypes, Track Record and the Pokémon info sheet because they sit inside the Meta
  section; another group may list them too (de-duplicate by ID).
- **Not tested live:** sending feedback, owner-only panels, usage counting, account sync between devices, Save image through the downloads
  permission, shared team/box link banners, the sheet swipe, keyboard Tab trapping in every dialog, the What's new card (harness pre-marks
  it seen). These are from reading the code.
- **Regulation banner** was only seen by injecting data into `meta/perf.reg`; the "numbers are from a different regulation" variant was
  not rendered.
- **Darkrai approvals:** CLAUDE.md says Darkrai was approved for live on the empty My Team, and "every new spot is shown to Sim first".
  The code also shows it on tip bubbles, confirmation toasts and empty notes on Saved Teams, My Box, Test Run, Build, Events and Cores.
  I could not tell from the repo whether those spots were approved.
- **Build freshness:** I used `app/dist/page.html` as built at 22:30 (the only later commit is a .gitignore change) and did not rebuild,
  to avoid touching `app/`.
- **Only light mode** was clicked through; dark mode behaviour is from the code and the theme toggle test.
- Widths tested: 1440 and 390 only (not the odd widths CLAUDE.md asks the rebuild to survive).

## 17. Count per area

| Area | Entries |
|---|---|
| NAV (navigation, routing, history) | 11 |
| JUMP (search) | 5 |
| THEME | 3 |
| SHELL (global parts) | 34 |
| RATE (Ratings page, incl. 2 retired) | 11 |
| SHEET (Pokémon info sheet) | 7 |
| META (Usage) | 7 |
| SETS (Popular Sets) | 5 |
| TOP (Winning Teams) | 7 |
| EVT (Events) | 7 |
| ARCH (Archetypes) | 2 |
| WEEK (This Week) | 11 |
| TRACK (Track Record) | 8 |
| METHOD (How We Calculate) | 5 |
| ABOUT (About & Legal) | 5 |
| **Total** | **128** |
| Dead / duplicated / broken items | 18 |

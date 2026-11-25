# Accessibility deep pass (helper, Nov 16, on check317; top items re-verified on the published check319)

## Accessibility audit (WCAG 2.2 AA) of NastyPlot rebuild, check317.html

**Overall:** the dialogs, landmarks, headings, skip link, route-change focus, reduced motion and 320 px reflow are mostly solid. One finding blocks keyboard users: on every slanted (clip-path) control, the keyboard focus ring cannot be seen. Below that there are a few real WCAG AA failures and a set of smaller items.

**Scope:** 23 routes plus one fake route (it shows Home, confirmed). Widths 390 and 1280, day and night, with all `<details>` closed and then opened. All 16 dialogs were also checked with axe while open. Nothing under /home/user/pokelair-data was edited.

**Where things are:**
- Scripts and raw results: /tmp/claude-0/-home-user-pokelair-data/25f65f15-063e-5621-be2b-3a9994dfed43/scratchpad/agents/a11y2/ (axe-results.json, kb-1280-day.json, con.json, snap-*.yml, sheet-*.yml)
- Screenshots: /tmp/claude-0/-home-user-pokelair-data/25f65f15-063e-5621-be2b-3a9994dfed43/scratchpad/agents/a11y2/shots/

---

### P0, blocker

**1. Keyboard focus is invisible on clip-path (slanted) controls.** WCAG 2.4.7 Focus Visible. All routes, both widths, both themes.
- **Cause:** the global `:focus-visible{outline:3px solid var(--plot);outline-offset:3px}` draws outside the element. The element's own `clip-path` (or an ancestor's) cuts it off completely.
- **Evidence:** I compared a screenshot of each Tab stop focused vs. blurred (box + 10 px). The pixel difference was 0 for:
  - main buttons `.np-btn`: Score My Team, Build Me a Team, Enter Their Six, Set as Opponent, Share as Image, Pokémon Page, Build Around It, Start, Swap Into My Team
  - page tabs `nav.ra-seg a`: Ratings / Usage / Popular Sets; Winning Teams / Events / Archetypes / This Week
  - filter chips `.ra-chip` and `.np-chip`: meta, usage, sets, tournaments, events, speed (11)
  - Home team cards `button.ff` (12)
  - Calc: the Move, Weather and Terrain selects, 5 condition toggles, 30 KO-board buttons `.dc2-kt` and the move cards. Attacker and Defender show only a sliver of ring.
  - Types picker `.tc-tp` (18), Practice mode cards `.pp2-mode`, Method tiles (`summary` in `details.inf-tile`), `.inf-track`
- **Counts of weak or no-change stops:** at 1280 day, calc 39, types 19, home 16, meta 12, speed 11, and others. At 390 night the counts are similar. Method has 11 at 390 vs 3 at 1280.
- **Screenshots** (focused state, no ring):
  - shots/nofocus-day1280-home-1.png (Score My Team)
  - shots/nofocus-day1280-home-2.png (team card)
  - shots/nofocus-day1280-meta-2.png (Ratings tab)
  - shots/calcfocus-1280-selectdc.png (Weather)
  - shots/calcfocus-1280-dcA.png (Attacker, partial)
- **Fix:** move the slanted shape onto a `::before` background layer and leave the element unclipped. Or draw focus inside the shape: inset `box-shadow`, negative `outline-offset`, or `filter: drop-shadow` on an unclipped wrapper.

### P1, WCAG AA (or A) failures

**2. Calc row headers have no name at phone width.** 1.3.1 and 4.1.2. Calc, 390, both themes.
- **Where:** the table "Your best hit on each top threat" (inside a `<details>`).
- **Evidence:**
  - 30 `th[scope=row]` are empty for screen readers (axe `empty-table-header`). The name `<span>` is `display:none` at 390 and the sprite has `alt=""`.
  - ariaSnapshot gives `- rowheader` at 390 and `rowheader "Sneasler"` at 1280.
- **Fix:** hide the span with the `.vh` pattern, not `display:none`, or give the img the Pokémon's name as alt.

**3. Chart lines below 3:1.** 1.4.11 Non-text Contrast. Track, "Week by Week" chart, both themes (the chart card is white in both).
- **Evidence:** against white, the amber line `rgb(255,180,0)` is 1.78:1, green `rgb(34,181,138)` is 2.61:1 and grey `rgb(138,144,166)` is 3.17:1. Purple passes at 3.55:1.
- **Screenshot:** shots/track-chart-day.png
- **Fix:** darken amber and green to at least 3:1, or add a dark outline to the lines.

**4. Text spacing clips or cuts content.** 1.4.12 Text Spacing. Test CSS: line-height 1.5, letter 0.12em, word 0.16em, paragraph 2em.
- Archetypes, 1280: "7 of 90 teams" is cut off at the bottom of the Psychic Terrain card (shots/sp-arch1280.png).
- My Box, 390: names truncate to "Bascule…" (shots/sp-box.png).
- Calc, 390: "Guaranteed OHKO" runs out of the move card (shots/sp-calc.png).
- Build, 390: event name ellipsized (shots/sp-build.png).
- Weekly tiles were flagged by the script but look fine; I dropped them.
- **Fix:** let these boxes grow (`min-height` in place of fixed heights, no `overflow:hidden` or ellipsis on names).

**5. Every route has the same page title.** 2.4.2 Page Titled. 22 of 23 routes.
- **Evidence:** `document.title` is "NastyPlot" everywhere except `#pokemon=kingambit` ("Kingambit: rating, sets and partners · NastyPlot").
- Focus does move to the H1 on each route change, which softens this for screen reader users.
- **Fix:** set the title per route, e.g. "Meta · Ratings · NastyPlot".

**6. Text contrast.** 1.4.3.
- **Events, night, both widths:** the count "113" in the selected "All" chip is 3.87:1 (`rgb(228,224,218)` at 80% alpha on `#3a6080`, 13 px). axe and my pixel check agree. Screenshot shots/v-ev-chip.png.
- **Archetypes, both themes:** "No. 2" / "35 of 90" in white sit over orange with yellow sun rays. Median 3.47:1 at 13 px; white on yellow is 1.82:1. This is marked unsure: the text-shadow helps, and the text is aria-hidden but still visible. Screenshot shots/c-arch-rk.png.

**7. `aria-selected` on links.** 4.1.2. My Team, all widths.
- **Evidence:** the "On this page" nav (`a[data-tmjump]` Matchups / Suggestions / Team Checks) uses `aria-selected`, which links don't support. The current section is therefore not announced. axe rates it critical.
- **Fix:** use `aria-current="location"`.

**8. Visible label not in the accessible name.** 2.5.3 Label in Name (level A).
- **Calc KO board:** 30 buttons show "KO" but are named e.g. "Mega Golisopod: your Mega Charizard Y's Weather Ball does 284–336%, down in one hit. Put it on the table".
- **Saved Teams sheet:** the button showing "Copy for Showdown" is named "Copy Sun Tailwind (sample) for Showdown", so the visible phrase is split.
- **Fix:** start each name with the visible text ("KO: …", "Copy for Showdown: Sun Tailwind (sample)").
- About 400 other axe `label-content-name-mismatch` hits are false positives. Those names already start with the visible label (the Pokémon or event name); axe compares against the whole card text. Dropped.

### P2, minor or partial

- **Slider focus mostly clipped.** The `.np-slide` segments (Stand-Outs / Top 10 …, My Box / Whole Roster) show only two thin vertical edges of the ring. Screenshot shots/fx-slide-focused.png.
- **Tournaments search combobox is incomplete.**
  - Arrow Down does not move through the options, and there is no `aria-activedescendant`.
  - Options are Tab stops instead.
  - Escape leaves `aria-expanded="true"`.
  - Enter picks the first match.
  - No status message after filtering.
- **Import a Team from Home switches the page to `#team` when the sheet opens.** Escape or ✕ leaves the user on My Team with focus on its H1, not back on Home. Opened from My Team, focus returns to the opener correctly. Relevant criteria: 2.4.3 / 3.2.
- **Buttons that look the same to a screen reader:**
  - Pokémon page: "Show ›" ×4 (inside named regions, but ambiguous in a buttons list).
  - Meta at 390: "See All 11 ›" ×2 (S tier and C tier).
  - Fix: add the section to the name, e.g. "Show what beats it".
- **aria-labels drop information that is visible:**
  - Events next-events rows omit the city ("São Paulo, Brazil").
  - Calc move cards omit power and type.
  - Practice pairs omit the game count.
  - Weekly winners omit the player count.
- **Track chart data is not available as text.** The `svg role=img` label only describes the chart, and there is no table.
- **Guide page "Forms strip":** `role=tablist` with plain `div`s (no `role=tab`, not focusable). axe flags `aria-required-children`. This is the design guide only, but the pattern would fail if reused. The real Pokémon pages checked (garchomp, charizard, raichu) don't use it.
- **Night filter chips, selected vs. unselected fill is 2.44:1.** A lighter edge on the selected chip may carry the state (shots/chips-night.png). Unsure.
- **320×256 (400 % zoom):** the sticky header (60 px) and fixed bottom bar (57 px) take 46 % of the height. Focused items are never fully hidden, so 2.4.11 passes, but the bar often half-covers them.

### P3, polish

- "Why This Score?" sheet has no heading.
- The H2 "The Grandstand?" includes the tip button's "?" in its name.
- The Preview data note has `role=status` and repeats on every page (Preview only).
- Track slips say "rated 97, Rated 97" twice in their name.
- Calc KO table has no caption or name.
- Edit Set "Lock" button does not say what it locks.
- Phone targets under 44 px (all pass 2.5.8 through the spacing exception):
  - Tournaments "Set as Opponent" 126×20 and "Compare" 74×20
  - "Game plan" link 130×22, "How It Works" 101×20, "Change on My Team" 151×19, "How Ratings Work" 138×19
  - Battle "Change the four you brought" 103×26
- Events filters, the usage source switch and the Types/Sets look-up change content with no status message. 4.1.3 does not require one because no visible status text is shown.
- The `np-breathe` glow loops forever (4.5 s cycle) on Home and Guide with no pause. It stops under reduced motion and does not flash.

### Verified passing

- **axe:** no other violations on any route, width, theme or details state.
- **Dialogs** (16 sheets: Search, Import, Save, Saved Teams, Edit Set, Log a Game, Showdown Replay, Add to My Box, Never Suggest, All Suggestions, Team Sheet, Share as Image ×2, Why This Score, More, Compare pick):
  - each is `role=dialog`, `aria-modal`, and labelled
  - focus moves in and `#app` becomes inert
  - 40 Tabs never left the sheet
  - Escape closes it and focus returns to the opener (the only exception is Import from Home, above)
- **"?" tips:** Enter opens and focus moves in; Tab goes to the tip's link and then on to the next control on the page; Escape returns to the "?"; `aria-expanded` updates.
- **Navigation:** no keyboard traps (Tab cycles on every route). The skip link is first, visible when focused, and goes to `#main`. A route change moves focus to the H1.
- **Live regions:**
  - Search results announce "3 results" and Arrow Down moves into them.
  - Meta filter count is `role=status`.
  - Calc result is `aria-live="polite"`.
  - Log a Game toast ("Win logged. Undo") is `role=status`.
- **Names:** every control has a name. Saved Teams buttons are told apart ("Open/Compare/Rename/Delete Sun Tailwind (sample)"). Edit Set fields are named, e.g. "Move 1 for Mega Charizard Y".
- **Images and headings:** sprites have `alt=""` with names in text. One H1 per page and no skipped heading levels.
- **Motion and reflow:**
  - Reduced motion: 0 running animations on all routes.
  - 320 px: no page-level horizontal scroll on any route. Only single-axis strips scroll sideways (meta Grandstand rows, chips, home cards, Pokémon page).
- **Contrast and size:**
  - No target under 24 px fails.
  - Focus ring where visible: 4.53:1 day, 9.07:1 night.
  - Night search-field border: 3.39:1.
- **Other:** `lang="en"`. Forced colours (one Meta screenshot) looked fine.

### Not tested / limits

- **Assistive tech and devices:** no real screen reader (NVDA, JAWS, VoiceOver, TalkBack); the accessibility tree and ariaSnapshot were the stand-in. No real iPhone or iPad, and no real browser zoom (emulated by viewport size).
- **Sheet coverage:** the pixel contrast sweep, the 320 reflow and the text-spacing tests did not cover the inside of sheets. axe did run inside them.
- **Contrast sweep quality:** it gave false positives on hidden or decorative text and layout shifts. I checked each flagged item by eye and kept only items 6 and the P2 chip note.
- **Saved Teams:** only one sample team, so I could not see several "Load Team" buttons at once. The naming pattern "Open <team name>" should keep them distinct.
- **"Your Games":** I tested "Log a Game"; I'm unsure whether a separate "Your Games" sheet exists.
- **Not looked at:** hover-only states and drag interactions (2.5.7).

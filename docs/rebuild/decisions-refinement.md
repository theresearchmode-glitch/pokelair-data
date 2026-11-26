# Refinement, glass, fonts and the "no limits" list: decisions (Nov 11)

Source: the redesign chat on Sim's PC, from Sim's question "what else instead of glass then can i do that adds that look of
refinement im chasing" (03:24) to its last answer (03:33), plus its glass test just before. Read in full by the main chat.
Note: that chat worked on its OWN older concept mock-ups (A 99, Threats, Fix it, rounded pills, raw rating 85), not the R2
mock-ups in docs/rebuild/mocks/, and some of its facts were out of date; corrections are marked.

## Decided by Sim (in that chat)
- Fonts (Sim: "lets go with your recommendations"): keep Unbounded, but only at 15px and up (headlines, big numbers, plates,
  the filled button); smaller labels use Instrument Sans. Keep Instrument Sans for body. Inter only if Instrument Sans's
  numbers disappoint. MEASURED Nov 11 (main chat): Instrument Sans has true tabular figures (font-variant-numeric:
  tabular-nums makes every digit 96 px wide at 40 px), so numbers line up; Inter is not needed for numbers.
- Shady Paw is cut (already replaced by Darkrai on Nov 9).

## Glass
| Idea | Decision | Why |
|---|---|---|
| Frosted top bar and phone jump bar | TRY, measured | The one glass use that looked right. Caution the chat understated: a frosted bar re-blurs on every scroll frame, the same kind of cost as the old sprite glow. Built only if experiments/scroll-perf.mjs on Sim's PC shows no slowdown; fallback is today's solid bar at 92%. |
| Lit, softly blurred page behind the info sheet (sheet itself solid) | YES | Lighter than dimming to grey; blur only while the sheet is open (nothing scrolls under it). |
| Glass sheet surface on desktop | NO | The chat's own test: looks grey and smudged on the off-white page. |

## Refinement list
| Idea | Decision | How |
|---|---|---|
| Light and shadow: contact shadow, lit top edge on colour panels, faint floor reflection for the ONE featured Pokémon | YES, minus the reflection | Clearest gain in its before/after. Tried Nov 11: the reflection is cut off by the "Rated · tier" plate that sits on the floor line, so it reads as a glitch; dropped. Lit edge and layered shadows kept. |
| Number typography: tabular digits, units smaller/lighter | YES | font-variant-numeric: tabular-nums on every number; "%", "games", "/ 100" one size down and --ink-2. |
| Strict spacing and alignment | YES (already) | The polish check enforces the 4px grid and edges. |
| Motion quality: short, eased, no bounce | YES (already planned) | Moving prototype. |
| Layered soft shadows on the few floating things (sheet, picked tile, bars) | YES | Two stacked soft shadows replace the single one; nothing else floats. |
| Fine grain on colour panels | NO for now | Invisible at page size in its own test; a full-page noise layer is paint cost for no visible gain. Revisit only on the hero. |
| Finished pressed/hover/focus/loading/empty states | YES | Each component in design-system.md gets all its states. |

## "No limits" list
| Point | Assessment | Decision |
|---|---|---|
| Site says too much at once; My Team 4,270 px | Spirit right, number out of date: today 3,487 px (baseline.json), the R2 mock about 2,300 px | Keep: one job per page, answer first, rest one tap away. |
| Lead with the grade: paste a team, see the score in seconds | Right | Already decided: first-visit action on Home; import in one step. |
| Words: "Handled / Well handled" | Out of date: the word list replaced them (Beats it / Handles it / Shaky / No answer) | Voice idea kept: a little of the "scheming" tone in empty states and headings, never in data labels. |
| Trust in numbers | Right | One ratings source, data date, "why this number": already planned; tests caught HOME-05b. |
| Too many devices; cut the rays except the Home hero | Fair critique | YES: rays only on the Home hero and the one featured panel; box wallpaper and other panels lose them. |
| Five section colours | Our mock-ups already dropped them | Confirmed: no section colours; logo blue for marks, pink for "picked". |
| Dark mode is the weaker half | Fair; our R2 mock-ups draw both, but dark needs its own pass | YES: a dedicated Dusk review per page. |
| Art you don't own; the name "Nasty Plot" | Real launch questions | Launch list (both): check The Pokémon Company's fan-content terms. Not rebuild blockers. |
| Page is very heavy (3.2 MB) | Right: today 2.99 MB after slim | YES for the rebuild: split the page so each section loads when opened (R3 foundation). |
| Test with real players | Right and the most valuable | YES: after the first rebuilt page, 3-5 players use it on their phones; findings before page two. |
| Shareable results | Partly exists today (team links, share image) | YES: redesign the share card as the signature "score object"; highest-value wow item. |
| A page per Pokémon with its own address | Right | YES: matches "every page gets its own address". |
| Search as a main way around | Right | YES: prominent search in the header and on phones. |
| iPad | Real gap: we drew phone and desktop only | YES: iPad (820 and 1024 wide) mock-ups for every page. |
| Saved teams only on the device | Wrong for today (synced to the Claude account), right for a public site without accounts | Public plan: say so plainly, keep export/import and box link prominent. |
| Accessibility | Partly covered (words beside colours, reduced motion, contrast measured) | YES: keyboard pass and screen-reader labels in R3. |
| Missing or old data shown honestly | Partly exists (data dates, early read) | YES, designed as states. |
| Anonymous usage counting | Already exists (usage per anonymous id) | Keep. |
| Help layer for newer players | Partly exists (tips) | YES: one-tap term explanations. |
| Site and home-screen icon | Needed for public launch | Launch list. |
| Other languages | Later | Ideas list. |
| Room lighting follows the team (sun warms, rain cools, Trick Room dims) | Good, cheap (a tint), unique | YES, subtle, on My Team and Battle. |
| Art travels into the sheet | Good | YES in the moving prototype (View Transitions). |
| The score as an object (one badge everywhere) | Good, but as the Strength Score number + band word, not a letter | YES. |
| Team dock on every page | Mixed: useful on Calc/Battle/Ratings, clutter elsewhere | Desktop only, Calc and Battle first, test it. |
| Harmonised type colours | Careful: players read type colours by habit | Tune for contrast only; keep each hue recognisable. |
| One chart style | Right | YES. |
| Custom slanted icon set | Low priority | Ideas list. |
| Hover peeks on desktop | Good | YES. |
| Compact view | Maybe | Ideas list. |
| Shaped loading placeholders, Pokémon fade in | Good | YES; Darkrai stays the loading picture where allowed. |
| Designed 404 and About; print-ready Team Sheet | Good | YES. |

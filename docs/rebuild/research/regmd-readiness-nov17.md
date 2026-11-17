# Reg M-D readiness: date, code inventory, one-switch plan, safety net
Written Tue Nov 17, 2026, 11:00 AM EST (clock: docs/rebuild/now.sh). Look-only: no site code edited, nothing committed.
Branch read: claude/design6 (HEAD 2ccc89a3); main read as origin/main (9f93e296, "Limitless data 2026-11-17").
Every line says **checked** (how) or **not yet checked**.

---------------------------------------------------------------------------------------------------------------------------
## 1. When does Reg M-D start, and what changes?

### Dates
| Fact | Status | Source / how |
|---|---|---|
| Reg M-C ends **Tue Dec 1, 2026, 5:59 PM PST** = 8:59 PM EST = Dec 2, 01:59 UTC | **Checked, official** | pokemon.com "Get Ready for Regulation Set M-C" (published Sep 2): "from Tuesday, September 8 … to Tuesday, December 1, 2026, at 5:59 p.m. PST" |
| Same end date in community sources | Checked | Victory Road rules page ("9 September to 2 December 2026"); pokemonchampionstimer.com ("Dec 2, 2026, 01:59 UTC") |
| Reg M-D start date | **Not announced** (checked today) | champions.pokemon.com/en-us/news (fetched live): last Regulations post is "Regulation M-C Overview", Oct 22. No M-D post. champteams.gg (checked Nov 15): "the Regulation Set M-D rules have not been announced" |
| Expected start: **Dec 2, 2026, about 02:00 UTC = Tue Dec 1, about 9:00 PM EST** | **My inference from the pattern, not confirmed** | Each set began the minute the last ended: M-A→M-B Jun 17 01:59 UTC, M-B→M-C Sep 9 ~02:00 UTC (Bulbapedia table, pokemon.com). Game8 also guesses Dec 2 (speculation) |
| Dates can move | Checked | M-B was extended a week (Sep 2 → Sep 9) by the Aug 5 update (Victory Road, citing champions-news.pokemon-home.com page 776) |
| When the details usually appear | Checked (2 data points) | M-C: teased at Worlds (Aug 30), official post Sep 2, start Sep 8/9 (6 days ahead). M-B: official post on Jun 17, the start day itself. So expect M-D details roughly Nov 24 – Dec 1, possibly on the day |
| Ranked vs tournaments | Checked | Victory Road: online and in-person VGC events "usually follow" the in-game ranked regulation on the same dates, unless announced otherwise |
| Organisers already list Reg M-D events from **Dec 3** | Checked (Limitless upcoming list, today) | London Corviknights Weekly Tour 24 (Dec 3), Talon's Fight Club #112 (Dec 3), Maddo's Cup #14 (Dec 12), Christmas Charity Tour (Dec 19), more weekly |
| **Limitless has no "Regulation Set M-D" format yet; an M-D event is tagged M-C** | **Checked, important** | Limitless format menu lists M-C, M-B, M-A only. The Corviknights Tour 24 page says "Format: Regulation M-D" in its text but its page metadata says "Regulation Set M-C format". Our job sorts events by that tag (see 2c, gap J1) |
| Showdown has no M-D format yet | Checked (raw config/formats.ts, today) | Only "VGC 2026 Reg M-C" (mod champions) and "Reg M-B" (mod championsregmb) |

### What changes
| Item | Status | Source / how |
|---|---|---|
| Legal Pokémon, new Megas, items, rules for M-D | **Not announced** | as above |
| Mega Heatran comes to Champions | **Official tease**: shown at the end of the Champions trailer at the Worlds 2026 closing ceremony, not part of M-C | PokéJungle via champteams.gg; CQ Esports (Sep 2). I did not watch the trailer myself |
| Mega Heatran arrives **with M-D / December** | **Likely, not officially dated.** It is an inference from M-C's end date plus a leak (Centro). CQ Esports' "officially scheduled" headline rests on that inference | CQ Esports text; Insider Gaming (via champteams) |
| Correction to docs/reg-md-plan.md | Our plan says Mega Heatran's M-D arrival is "officially announced". More exact: officially teased; the December/M-D timing is not stated by Pokémon | this research |
| Mega Heatran's Champions Ability | Unknown | CQ Esports, champteams |
| Other legendaries (Mega Latios etc.), Paradox, restricted legendaries | **Rumour / speculation only** | Game8 (guesses Mega Latios; thinks restricted unlikely), champteams ("no official source and no verifiable leak" for restricted) |
| Pattern so far | Checked | No Pokémon ever removed; M-B added 22 Pokémon + 16 Megas; M-C added 24 Pokémon + 6 Megas per pokemon.com (Victory Road counts 29 additions; our own Showdown count was 35 forms incl. Megas); rules unchanged each time (Victory Road, docs/reg-md-research.md) |

Bottom line: M-C ends Dec 1, 8:59 PM EST (official). M-D most likely starts right then, but its date, roster and rules are not out. Expect them in the last week of November or on the day.

---------------------------------------------------------------------------------------------------------------------------
## 2. Where the regulation is hard-coded (inventory)

Counting method (checked): `git grep -o -P "M-C(?![a-z])"` on tracked files (the lookahead drops "M-Charizard"-style names).
| Scope | Occurrences | Files |
|---|---|---|
| app/src (this branch, old + new site code) | **71** | **42** |
| app/src on main (today's live site) | 56 | 32 |
| Root data job *.mjs | 20 | 11 |
| app/test | 15 | 5 |
| experiments | 43 | 12 |
| .github workflows | 3 | 2 |
| app/calc-card.html, app/probe.html (old built copies) | 63 | 2 |
Note: the Nov 17 summary said "65 times in 39 files" and the pre-launch audit said 112; those used other scopes. The 71/42 above is app/src on this branch, exact.

### 2a. Wording (what players read), app/src, by kind (checked line by line)
| Kind | Occ. | Where |
|---|---|---|
| Typed text "Reg M-C" shown on a page or share image | **31** (30 lines, 20 files) | 02-set-data.js:138 (side footer), 08-render-all.js:111 (eyebrow), 19-showdown-paste.js:98, 147 (import messages), 28-home.js:37, 44-share-card.js:46, 44-share-images.js:145, 166, 60-concept-h.js:212, 222, 369, 61-concept-h-pages.js:256, 63-method-data.js:9, 63-weekly-data.js:48, 63-weekly.js:44, 50 (share file name + alt), 66-extras-b.js:54, 74-arena.js:295, body.html:59, 71, 277, v2/pages/home.js:39, method.js:33, pokemon.js:165, share-slab.js:52, 81, share-tape.js:21, thisweek.js:37, 49, 50 |
| Fallbacks used when the data has no reg (`{id:'M-C'}`, `'Reg M-C'`) | **11** | 44-share-images.js:205, 45-team-links.js:85, 60-concept-h.js:337, 61-concept-h-pages.js:104, 115, 74-arena.js:218, 76-team-sheet.js:28, v2/pages/team.js:57, meta.js:61, build.js:10, build-sheet.js:43 |
| Logic tied to the wording | 2 | 19-showdown-paste.js:136 (regex reads back "not on the M-C roster"), 71-manga.js:189 (abbreviation list 'M-C','M-A','M-B': needs 'M-D') |
| Built-in data labels | 3 | data.js:12 (RESULTS source), :15 (PERF_RAW label) |
| Comments only (no effect) | 21 | 16 files, incl. generated headers of items-list.js, move-meta.js, move-acc.js |
| Already reading the data | (no "M-C") | V2.dataNote (shell.js:195), team.js:416/429/431, box.js:137, 06-helpers.js goneNote, 56-about-data.js:55 use REG_NAME / regInfo() |

### 2b. Regulation constants and legality data
| What | Where | Note |
|---|---|---|
| `PAGE_REG = 'M-C'` | app/src/app/24-sheet-data.js:108 (main: 43-data-health.js:17) | "regulation this page's rules are built for"; drives the dataNote/regBar "Numbers are from Reg X" line |
| `REG_NAME = 'Reg M-C'` | 24-sheet-data.js:113 (main: 56-about.js:4) | comment says "switch it here for Reg M-D" |
| `BUILTIN_REG = 'M-C'` | 16-outside-performance-data.js:97 | builtinOk(): built-in RESULTS/PERF_RAW switch off when data reg differs (works) |
| `regInfo()` | 24-sheet-data.js:109 | already reads META.perf.reg / META.reg (id, since, now) |
| Roster, abilities, moves, learnsets, default box, popular sets | app/src/data/data.js (ROSTER, ABIL, MOVES, LEARN, DEFAULT_BOX, SETS) | **hand-built in October, no generator** (checked: no gen-roster script in experiments/) |
| Sprites | `SPRITE_ID` in 15-visual-helpers.js:6, app/sp/*.webp (345), v2 art v2art/*.webp (346) + ART_META | new Pokémon need both sprite and v2 art |
| Legal items | app/src/data/items-list.js `REGMC_ITEMS` (166) ← data/regmc-items.txt via experiments/gen-items-list.mjs (writes the M-C name and file only) | also read by names.mjs, 10-team-strategy.js, 19-showdown-paste.js, tests |
| Legal species check | experiments/legality-check.mjs + experiments/regmc-legal.txt (from MetaVGC, Oct) ; stress-sugs.mjs | M-C only |
| Move meta / accuracy | move-meta.js, move-acc.js from experiments/gen-move-meta.mjs, Showdown pinned 1242c1e (package.json) | re-pin when Showdown has M-D |
| Team legality on the page | 08-render-all.js:310 legalOf (duplicate species + Item Clause) | does not check "item legal in this reg" (checked) |
| Data job name list | roster.json (345 names) | unknown names are left out with a ::warning:: (names.mjs:58); a team with an unknown member drops out of pair/core stats (update.mjs: `m.length < 6`) |

### 2c. Data job (update.mjs and friends)
| What | Where | Status |
|---|---|---|
| Regulation detection | reg.mjs (first step) → out/reg.json → perf.mjs copies it to out/perf.json `reg` (perf.mjs:52) | Works: reads Limitless formats + Showdown replay search for the next id (sdGuess gives gen9championsvgc2026regmd) |
| Site regulation | formats.mjs:35 `SITE_REG = {id:'M-C', sd:'gen9championsvgc2026regmc', since:'2026-09-01'}` | hard-coded |
| Switch rule | formats.mjs:36 `REG_SWITCH = {events:20, players:1200}`; `REG_AUTO_SWITCH=0` holds it | **The Nov 7 "switch on launch day, by date" decision (plan 0.7) is not built** (checked: no date rule in formats.mjs) |
| Event's regulation | formats.mjs:50 `regOf = e => e.f \|\| 'M-C'` (Limitless format tag only) | **Gap J1**: M-D events tagged "M-C" on Limitless (checked, 1 event) would be counted as M-C and reg.mjs would never see M-D |
| Steps that filter by regulation | update.mjs, events.mjs, weekly.mjs (sameReg), replays.mjs, ladder.mjs (activeReg().sd) | ok once reg.json is right |
| Steps that do NOT know the regulation | model.mjs, six.mjs, ctr.mjs, leads.mjs (fed by filtered files: ok), **ratings-snapshot.mjs, scoreboard.mjs, track.mjs** (keep history across days: would grade M-C ratings against M-D events; plan gap G4, not built) | checked by grep: no activeReg/sameReg |
| official.mjs:22 | `REG = 'M-C'`, `REG_START = '2026-09-01'` (env OFFICIAL_REG overrides) | hard-coded |
| sources.mjs | Showdowntier `formats/dmc` (M-C slug; M-D slug not yet checked); Pikalytics `championstournaments` (no regulation in the URL: will mix around the switch until Pikalytics resets, not yet checked) | G1 |
| update.mjs:95 | `(prev.reg \|\| 'M-C') === FORMAT` | default only |
| Text labels | update.mjs:1,79; weekly.mjs:4,108 (doc `src` string shown on the page: "standard Reg M-C events"); practice.mjs:60; crosscheck.mjs:59 | wording in data |
| Tests pinned to M-C | package.json Showdown commit; test.yml:107,170; app/test/run.mjs:390-403 (items); A-team.mjs:323, 826-865 and D-meta-shell.mjs:390, 764 (expect "Reg M-C" text); experiments/reg-test.mjs (detectReg tests, good base) | |
| Main's live data today | origin/main out/reg.json: `{"id":"M-C", "now":null, seen M-C 287 events}` checked Nov 17 | |

### 2d. The 'New regulation' note (V2.dataNote, shell.js:195)
- `r.now` set: "New regulation: Reg X started <date>. Numbers are from Reg <old> until there's enough Reg X data; the two are never mixed."
- `r.id !== PAGE_REG`: "Numbers are from Reg X. Anything new in Reg X may be missing until NastyPlot is updated for it."
- No branch for "switched today" (perf.reg.switched exists in the data but nothing reads it). Shown on Home and Meta pages only.
- Old site: 43-data-health.js renderReg() / #regBar, same two cases.

### 2e. Saved teams and box (checked in code)
| Data | Today | Meets "flag, never delete"? |
|---|---|---|
| Team slots (My Team, saved teams) | normSlots keeps an unknown Pokémon as `{n:'', gone:<name>, gset:<its set>}`; goneNote() says "X isn't legal in Reg …, left out, stays saved"; comes back if a later reg has it (02-set-data.js:104-110, 06-helpers.js:37-40) | **Mostly yes**, but the slot shows as empty, not as a flagged Pokémon |
| **Box** | 02-set-data.js:88 `S.box = S.box.filter(b => byName.has(b) …)`, then snapshot() saves S.box | **No: an illegal box Pokémon is silently deleted on the next save** (gap J2) |
| Opponent, recent opponents, battle log, lead pick | not checked how unknown names are treated | not yet checked |
| Team links / paste | unknown Pokémon skipped with a message (45-team-links.js:85, 19-showdown-paste.js) | fine (input, not saved data) |
| Which regulation a saved team was built for | not stored (pre-launch audit 4) | gap |

---------------------------------------------------------------------------------------------------------------------------
## 3. Plan: the one regulation switch (Sim approved Nov 17)

Principle: the daily data says which regulation is active (perf.json `reg`); the page knows each regulation it was built for
(a profile per regulation); every text reads one helper. Honest limit: the regulation's NAME can come from data, but which
Pokémon are legal, their stats, moves and sprites must ship with the page build: the page can't play a Pokémon it has no data for.

### Conflict to settle first (needs Sim)
- Nov 17 approved proposal: old numbers archived "with a 'Reg M-C' view kept".
- Nov 7 decision 2 (docs/reg-md-plan.md): "M-D only after the switch … no 'last regulation' view."
- My recommendation: archive the files (cheap, nothing lost) but show no M-C view at launch; add one later only if asked. Why: the
  public launch is a month into M-D and a second view adds a control and a data document for little use.

### Steps, in order
**Step 1. Regulation profiles (one file).** `data/regs.json`: per id: name, Showdown id, official start and end (UTC, with
`confirmed: true/false` and source URL), legal species file, legal items file, new Megas, rules (level 50, bring 6 pick 4,
Item Clause, Species Clause, one Mega). M-C filled now (dates checked above); M-D with the expected start, `confirmed:false`.
Build step writes `app/src/data/regs.js` (REGS) for the page. Files: new data/regs.json, data/regs/M-C/{legal,items}.txt
(move regmc-items.txt, experiments/regmc-legal.txt), experiments/gen-items-list.mjs (per reg), app/build.mjs.

**Step 2. Data job reads the profile** (root *.mjs, runs from main):
- formats.mjs: SITE_REG from regs.json; **date guard**: an event dated after its regulation's official end can't count for it,
  whatever its Limitless tag (fixes J1); a name hint (/reg\.?\s*m-?d/i) marks it as the next reg; **date switch** (Sim, Nov 7): on
  the confirmed start date the active reg becomes M-D with 0 events; the 20 events / 1,200 players rule stays as the backstop when
  the date isn't confirmed.
- official.mjs: REG and REG_START from the profile. sources.mjs: per-reg Showdowntier slug, Pikalytics marked "not available yet"
  until its data is the new reg (G1). names.mjs, update.mjs: items list of the active reg; roster.json gains new names.
- perf.mjs: `reg` also carries `prev` ({id, end}) and `switched.on`, for the notice.
- ratings-snapshot.mjs, scoreboard.mjs, track.mjs, weekly.mjs: every saved entry carries `reg`; comparisons only within one reg;
  "since yesterday"/weekly arrows reset at the switch (G4, G6).

**Step 3. Archive per regulation.** On the switch day the job copies the page-facing files to `out/archive/M-C/` with a
manifest (perf, teams, events, track, ratings_log, scoreboard, weekly, history, model, meta_tour/ladder/ingame, official_perf:
about 1.5 MB, checked sizes; replays and matches stay in git history). Never written again. New files start from M-D only.
If Sim wants an M-C view: new `meta/arch_mc_*` documents, which also needs the daily refresh task's key list changed
(that task is outside the repo: not yet checked).

**Step 4. One reader on the page.** In 24-sheet-data.js: `REG()` = id and name from regInfo() (the data), else the build's
profile. `REG_NAME` becomes `regName()`; `PAGE_REG` = the profile the build's roster is for; `BUILTIN_REG` read from data.js's
own header. Replace the 31 typed texts, 11 fallbacks, the paste regex and the 71-manga abbreviation list. Share-image file names
("This week in Reg M-D - NastyPlot.png") follow. Old-site-only files (body.html, 28-home, 60-concept-h…) can be left if the
switch to the new site happens first (which of the 31 are shown on the new site: not yet checked line by line).

**Step 5. Legality per regulation.** ROSTER = every Pokémon we have data for (M-C ∪ M-D); `LEGAL[reg]` set from the profile;
pickers, ratings, Build for Me and suggestions use only the active reg's legal set; a no-longer-legal Pokémon keeps its stats and
sprite so it can be drawn and flagged. Items: `REG_ITEMS[reg]`.

**Step 6. Saved data: flag, never delete.**
- Box: stop filtering at 02-set-data.js:88; illegal entries stay in S.box, shown with a "Not in Reg M-D" mark, left out of
  counts and Build for Me (fixes J2).
- Team slots: a gone Pokémon is shown in its slot with the mark (sprite + name) instead of an empty slot; still left out of
  the score; goneNote kept.
- Saved teams get `reg` at save time; Saved Teams list marks teams from another reg.
- Opponent, recent opponents, log, leads: check and keep names (not yet checked how they behave today).

**Step 7. The notice on the day.** dataNote/regBar gain a `switched` branch, shown from the switch day for 7 days:
"Reg M-D started Dec 2. Every number is Reg M-D only and still thin (N events so far). Pokémon not in Reg M-D are marked on your
teams and box, never deleted." Plus a What's new entry (G12). Wording and look to Sim with pictures first (RULES.md).

**Step 8. Practice switch** on made-up M-D data (M-C + Heatran/Mega Heatran, Ability "not announced yet"), Preview only, phone
and desktop, light and dark, day-one empty states; pictures to Sim.

### Tests that fail before and pass after
| Test | Today | After |
|---|---|---|
| T1 guard: no "M-C" in app/src outside regs.js, comments and an allow-list | fails (31 + 11 + 2 lines) | passes |
| T2 page with meta/perf.reg = M-D: eyebrow, Home band, Team Sheet, share names, import messages say "Reg M-D"; no "M-C" in visible text | fails | passes |
| T3 box round trip: box ['Heatran'] with a roster lacking it → after load + save the stored box still has it, marked | fails (deleted) | passes |
| T4 saved team with a gone Pokémon: after load + save the set is intact; My Team and Saved Teams show the mark | partly passes (kept, but slot shown empty) | passes |
| T5 reg-test.mjs additions: an event tagged "M-C" dated after Dec 2 01:59 UTC is not counted as M-C; on a confirmed start date the active reg is M-D with 0 events | fails (format tag only; 20-event rule only) | passes |
| T6 archive: on a fake switch day out/archive/M-C/ exists with its manifest; ratings_log entries carry reg; track/scoreboard never pair an M-C snapshot with an M-D event | fails | passes |
| T7 notice: perf.reg.switched.on = today → the day-of line shows on Home | fails (no branch) | passes |
| T8 items: an M-D-only item (e.g. a Heatran stone, name unconfirmed) is matched by paste/team sheets under M-D, not under M-C | fails | passes |
Existing tests whose expected text changes to read the regulation: A-team.mjs:323, 826-865; D-meta-shell.mjs:390, 764; run.mjs:402-403.

### This branch vs main
- **This branch (now):** Steps 1, 4, 5, 6, 7 page side, 8, and T1-T4, T7, T8; the pure parts of Step 2 (formats.mjs logic) with
  T5 via experiments/reg-test.mjs on fake data.
- **Needs main** (the daily job and the live data only run from main): Step 2 as wired into the job, Step 3, roster.json and the
  items/legal lists the job reads, official.mjs, sources.mjs, test.yml pins. Each as its own small commit with Sim's go.
- **Before Dec 1 on main, whatever else happens:** the date guard (J1). Without it, M-D events tagged "M-C" on Limitless get mixed
  into M-C numbers from Dec 3.

Size (my estimate, not measured): medium, about 1-2 days of careful work plus tests; roster data for new Pokémon is extra
(see 4).

---------------------------------------------------------------------------------------------------------------------------
## 4. Safety net: switch today's live site (main) to M-D data if the new site isn't live

What happens if we do nothing (checked in code): reg.mjs would see M-D only if Limitless tags events "M-D" (today it doesn't);
then numbers stay M-C until 20 M-D events and 1,200 players (about 12 days last time), then switch on their own; the page's
built-in numbers switch off (builtinOk) and the note says "Numbers are from Reg M-D. Anything new … may be missing"; new Pokémon
are dropped from the data with warnings; every typed "Reg M-C" stays.

Minimum on main, in order:
1. **Now (before Dec 1):** date guard in formats.mjs (J1) + its test in experiments/reg-test.mjs. ~1-2 h. (estimate)
2. **When M-D's date is official:** date switch: M-D start in formats.mjs (or temporarily `REG_SWITCH` = 1 event, 0 players after
   that date); OFFICIAL_REG / REG_START for official.mjs. ~30 min.
3. **When the roster is known:** add new Pokémon/forms by hand to main's data.js (ROSTER, ABIL, MOVES, LEARN), roster.json,
   SPRITE_ID + sp/<id>.webp (app/sprite-ink.py), new stones to data/regmc-items.txt → gen-items-list.mjs; legality list for tests.
   About 30-45 min per Pokémon by hand (estimate): Heatran + Mega Heatran about 1.5 h; a 20-30 Pokémon drop like M-B/M-C is a day
   or more without the roster generator (plan 0.2, not built).
4. **Wording on main:** REG_NAME (56-about.js:4), PAGE_REG (43-data-health.js:17); the main typed "Reg M-C" texts (56 occurrences
   / 32 files on main's app/src, fewer are visible). Minimum: those two constants + Home/eyebrow/footer/team sheet, ~1 h.
5. **Run:** workflow_dispatch the daily job (update.yml has it) → Test NastyPlot page passes → promote.yml moves `live` → the
   6:52 AM refresh copies it. Tests that expect "Reg M-C" text need updating in the same change.

Total (my estimate, not measured): data only, no new Pokémon: about half a day including GitHub runs. With Heatran + Mega
Heatran: about one day. With a large roster drop: 2+ days unless the roster generator is built first.
Recommendation: do step 1 on main now (it protects M-C numbers either way); build the roster generator (plan 0.2) before Dec 1
because both the new site and the safety net need it.

---------------------------------------------------------------------------------------------------------------------------
## 5. Not yet checked (open)
- Showdowntier's M-D slug; when Pikalytics' `championstournaments` switches; whether op.gg in-game ranked data (opgg.mjs) follows
  the regulation.
- How opponent / log / leads / recent opponents treat a Pokémon that leaves the roster.
- Which of the 31 typed texts the new site actually shows.
- The daily refresh task's document list (outside the repo).
- The M-D Showdown id (sdGuess gives gen9championsvgc2026regmd; Showdown named M-C "VGC 2026", so likely, unconfirmed).
- Whether Limitless adds an "M-D" format before Dec 3, or re-tags the listed events.

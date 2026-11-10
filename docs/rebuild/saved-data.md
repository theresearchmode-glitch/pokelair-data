# NastyPlot saved-data contract (for the rebuild)

Look-only map of every piece of data the current site reads or writes, made Nov 10 from the source in
`app/src/app/*.js` (plus `head.html`, `body.html`, `foot.html`, `app/build.mjs`). File:line refers to `app/src/app/` unless
a path is given. Lines in these modules are very long; the line number is where the code sits.

Everything below is **measured by reading the code** (grep for `localStorage`, `sessionStorage`, `LS.get/LS.set`, `claude.use`,
`.doc(`, `.collection(`, `onSnapshot`, `location.hash/search`, `history.*State`, `clipboard`, `downloads`, `fetch`). Nothing was
run in a browser for this map. Where I could not check something, it says **unsure**.

Not used anywhere in the page: IndexedDB, cookies, `fetch`/XHR, BroadcastChannel, `postMessage`, Cache API, `navigator.share`.

---

## 0. The one thing that matters most

Both the database and browser storage belong to **one artifact**. The artifact runtime gives each artifact its own database
("this artifact's database") and its own browser origin, so its own `localStorage`. The live site is
`https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk` (`45-team-links.js:5`, `TL_ART`; also `docs/undo-plan.md:7`).

- **If the rebuild is published as a new artifact (a new URL), every player starts empty**: no account document
  (`data/users/<id>/state`), no `localStorage`, and also no `meta/*` documents until the daily refresh writes there. Old team and
  box links would still point at the old URL.
- So the switch must be a **republish of the same artifact URL**, and the rebuild must read and write the same keys and
  document shapes listed here.
- The Preview artifact is a different artifact with its own database, so testing on the Preview never touches players' real
  saved data (good for safety, but it also means the Preview can't prove the switch keeps real data; use a test account
  that saved data on the live page, or `experiments/sync-logic.mjs`).
- The db capability rules (who may read/write `usage/`, `feedback/`) are declared at publish, not in the repo. A publish that
  passes a new `capabilities` object replaces them; omitting `capabilities` keeps them. See section 5.

---

## 1. Browser storage

### 1.1 How the page reads and writes it

`01-state.js:2` defines the wrapper used by almost everything:

```js
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
          set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
```

So **every value is JSON-encoded** (a string is stored with quotes: `"auto"`, not `auto`). An empty string, missing key, bad JSON
or blocked storage all return the default. Writes never throw. Two places bypass the wrapper but also store JSON:
`np.gl` (`60-concept-h.js:152,156`) and `np.mock` (`98-proposals.js:4`, read only). `sessionStorage` is used raw (not JSON) for
`np.wnew` only.

No key is migrated from an older key name; there are **no old key names still read**. The only migrations are inside the
`cc2.state` value (version fields `boxV`, `megaV`, and the retired `singles` format, see 1.2).

### 1.2 `cc2.state`: the player's whole state (CRITICAL)

| | |
|---|---|
| Holds | The global object `S`, JSON. This is the local copy of everything in the account document (section 2) **plus two fields that exist only here** (`leads`, `recentOpp`). |
| Read | `01-state.js:3` once at load: `let S=LS.get('cc2.state',null)`. Rejected (treated as missing) if `teams`, `box` or `slots` isn't an array (`01-state.js:4`). |
| Default | `01-state.js:5`: `{slots: DEFAULT_TEAM.slots, box: DEFAULT_BOX, teams:[{id:'t'+Date.now(), name: DEFAULT_TEAM.name ('Sun Tailwind (sample)', 00-main.js:37), slots, format:'doubles', saved:Date.now()}], loadedId: <that team's id>, format:'doubles'}` |
| Written | `persist()` `03-persistence.js:29` (`LS.set('cc2.state',S)`), and after account data arrives `03-persistence.js:61` (first load) and `:38` (a change from another device). **`render()` calls `persist()` every time** (`08-render-all.js:92`), so any redraw saves. Other direct `persist()` calls: 18-archetypes, 26-battle-log, 34-events, 36-lanes, 38-gauntlet, 41-replay-import, 47-battle-mode, 48-cores, 49-events, 64-my-record, 74-arena. |
| Cleaning on every load / remote change | `fixSlots()`, `fixTeams()`, `fixLog()` (`02-set-data.js:85-113`), see field table. |

Fields of `S` (all are also in the account document unless marked):

| Field | Shape / example | Rules applied on load (`02-set-data.js`) |
|---|---|---|
| `slots` | 6 slot objects, the team being edited. Slot: `{n:'Garchomp', a:'Rough Skin'\|null, lock:false, mv?:{doubles:['Earthquake','Dragon Claw','Protect','Rock Slide'], singles?:[...]}, it?:{doubles:'Sitrus Berry'}, sp?:{doubles:{nat:'Jolly', v:[2,32,0,0,0,32]}}}` or `sp:{doubles:{nat:'Jolly'\|null, assumed:true}}`. Empty slot = `{n:'',a:null,lock:false}` (`00-main.js:44`). | `normSlots` `:104-109`: max 6, padded to 6; unknown species → blank (its moves/items/sp are dropped); `mv` only names in `mvByName`, 4 per format; `it` strings ≤40 chars; `sp.v` 6 integers 0-32, total ≤66 (`SP_TOTAL`), nature must be in `NATURES`. `mv/it/sp` keep a `singles` sub-key from the retired singles mode "so stored user data is never lost" (`:96-97`). |
| `box` | `['Incineroar','Garchomp',...]` (species names, **order = order added**; box sort "new"/"old" depend on it, `body.html:405`) | `fixTeams` `:88-89`: only known non-Mega names, max 400. Migration `boxV!==2`: `'Rotom'`→`'Rotom-Wash'`, de-duplicate, then `boxV=2`. |
| `teams` | Saved teams, max 10: `{id:'t<base36 time><rand>', name:'Sun Tailwind (sample)', slots:[6 slots], format:'doubles'\|'singles', saved:1762790000000}`. Created `34-events.js:55` (Build for me "save") and `:88` (Save), renamed `:92`, updated `:87`. | `fixTeams` `:85-87`: id must match `/^[\w-]{1,40}$/` (else a new id is made), name ≤40 chars (`'Untitled team'` if empty), slots normalised, `format` kept (singles teams are stored but hidden, `01-state.js:6`). **Only these 5 fields survive.** |
| `loadedId` | id of the saved team open in the editor, or `null` | reset to `null` if no team has that id (`:87`). |
| `format` | always `'doubles'` (forced `01-state.js:6`, `fromDoc` `03-persistence.js:20`) | |
| `maxMega` | `1` or `2` | migration `megaV!==1` → `maxMega=2, megaV=1` (`:90`). Saved as `maxMega===2?2:1` (`03-persistence.js:18`). |
| `megaGoal` | `0`, `1` or `2` (Mega setting; set by `data-megas`, `34-events.js:46`) | if missing: `maxMega===1?1:2` (`:92`); `megaGoal()` defaults to 2 (`:81`). |
| `megaV`, `boxV` | migration markers (`1`, `2`) | keep them, or old migrations run again. |
| `opp` | 6 opponent species for Battle / scouting, `''` for empty: `['Kingambit','','','','','']` | `fixSlots` `:112`: unknown → `''`, padded to 6. Written 18-archetypes.js:86,237; 34-events.js:17,35,36; 38-gauntlet.js:36; 47-battle-mode.js:120; 74-arena.js:443. |
| `excl` | Pokémon never to suggest: `['Amoonguss']` | `:93`: known names, unique, max 100. Written 31-box.js:19, 34-events.js:29. |
| `log` | Logged games, max 400, oldest dropped: `{t:1762790000000, r:'W'\|'L', b:[4 brought, leads first], tm:[your 6], o:[their Pokémon ≤6]}`. Written 26-battle-log.js:39, 38-gauntlet.js:39, 41-replay-import.js:29, 64-my-record.js:67; deleted by `t` (26-battle-log.js:41, 64-my-record.js:69). A record matches a team by species, order ignored (`64-my-record.js` `logKey`). | `fixLog` `:111`: `r` must be W/L, `b` must be an array; unknown names dropped; **only t/r/b/tm/o survive**. |
| `leads` | **local only.** Your chosen lead pair `['Incineroar','Garchomp']` or `null` (`74-arena.js:173-183`) | not cleaned; **not in the account document**. |
| `recentOpp` | **local only.** Up to 5 recent opposing sixes `[['Kingambit',...6]]` (`74-arena.js:430-438`) | not cleaned; **not in the account document**. |

Existing bug found while mapping (measured by reading the code, not tested in a browser): `leads` and `recentOpp` are not in
`snapshot()`/`fromDoc()` (`03-persistence.js:18,20`), and on load with an account the page replaces `S` with `fromDoc(v)`
(`:61`), so for signed-in players these two are **wiped on every page load** (they survive only for players with no account
connection). The rebuild should either add them to the account document or knowingly keep them local, but must not copy the
bug silently.

### 1.3 Settings and view preferences (per device, never synced)

| Key | Holds (JSON) | Read | Written | Default | Notes |
|---|---|---|---|---|---|
| `cc2.theme` | `'auto'`\|`'light'`\|`'dark'` | `32-views.js:51` at load (`setTheme(LS.get('cc2.theme','auto'))`) | `32-views.js:45` (`data-thm` buttons, body.html:55-57, 88-90) | `'auto'` | Sets `<html data-mode>`; `data-look` is derived (`:47-48`). **Only light/dark/auto. No key stores a design theme name (riso / manga / arena / concept-h); those are code modules, not saved settings.** |
| `cc2.view` | last page, e.g. `'report'` | **never read** (`let view='home'`, `32-views.js:2`) | `32-views.js:80` on every page switch | — | Write-only today; the site always opens on Home. |
| `cc2.tview` | `'grid'`\|`'full'` (Your six layout) | `07-render-slots.js:57` on first render | `27-team-page.js:21,23`, `60-concept-h.js:510` | `'grid'` | |
| `cc2.boxSort` | `'az'`\|`'new'`\|`'old'`\|`'rating'`\|`'type'` | `31-box.js:5` | `31-box.js:34` | `'az'` | |
| `cc2.setMon` | Pokémon name for Popular sets, e.g. `'Garchomp'` | `02-set-data.js:116` (`ui.setMon`) | `25-ratings-page.js:172`, `31-box.js:17`, `34-events.js:32,33` | `null` | |
| `cc2.setSrc` | `'ingame'`\|`'tour'`\|`'ladder'` (keys of `SET_SRC`, `21-sets.js:11`) | `21-sets.js:57` first time Sets renders | `34-events.js:34` | `'ingame'` | invalid value ignored |
| `cc2.pool` | `'box'`\|`'boxfill'`\|`'all'` (Suggest from) | `02-set-data.js:116` | `34-events.js:16`, `60-concept-h.js:633` | `'boxfill'` | |
| `cc2.recsrc` | `'box'`\|`'all'` | `02-set-data.js:116` | `34-events.js:49` | `'box'` | |
| `cc2.absrc` | `'box'`\|`'all'` (Build for me source) | `02-set-data.js:116` | `34-events.js:51` | `'box'` | |
| `cc2.lmode` | `'board'`\|`'map'` | `25-ratings-page.js:48` | `25-ratings-page.js:170`; **forced to `'board'` at every start** `99-start.js:5` | `'board'` | Meta map retired Oct 27; effectively constant. |
| `cc2.lstab` | `'info'`\|`'meta'`\|`'rating'` (Pokémon sheet tab) | `67-sheet-tabs.js:12` at load | `67-sheet-tabs.js:78` | `'info'` | |
| `cc2.sprv` | `'track'`\|`'list'` (Speed tiers view) | `65-design-c.js:9` | `65-design-c.js:60` | `'track'` | |
| `cc2.chf.<key>` (family) | `1`/`0`: a fold left open/closed | `60-concept-h.js:271` (`CH.fold`) | `60-concept-h.js:273` (toggle of any `details[data-chf]`) | the fold's own default | Keys seen: `more`, `rfix`, `rgplan`, `rtypes`, `coremore`, `abwin`, `trevents`, `sheet2`, `bmlog`, `bmwatch`, `lairboard`, `lairabout`, `dctable`, `dcset`, `bigplans`, `gintro`, `absets`, `spdsum`, `abhow`, `Back…`/`Lead…` (mk keys), and `np_<section>` for How we calculate (`63-method.js:148`: `np_grade`, `np_ready`, `np_checks`, `np_spread`, `np_fake`, `np_mega`, `np_stack`, `np_w3`, `np_reach`, `np_rating`, `np_data`, `np_calc`, `np_speed`, `np_build`, `np_filter`, `np_fresh`…); plus any key passed to `CH.fold(key…)` / `CH.foldNode` (`61-concept-h-pages.js:7`). |
| `cc2.seg.<key>` (family) | chosen segment | `60-concept-h.js:479` (`thr`), `:483` (`types`) | `60-concept-h.js:466` | `thr`: `'top'`; `types`: `'off'` | `thr`: `'top'`\|`'grid'`\|`'all'`; `types`: `'off'`\|`'def'`. |

### 1.4 First-visit and notice flags

| Key | Holds | Read | Written | Default |
|---|---|---|---|---|
| `cc2.welcomed` | `'1'` once the welcome card was dismissed or a path tapped | `46-onboarding.js:37`, `53-feedback.js:85` | `46-onboarding.js:46` | `''` → welcome card shows |
| `cc2.seenNew` | id of the last What's new seen, e.g. `'2026-10-28b'` (`WHATS_NEW.id`, `53-feedback.js:78`) | `53-feedback.js:85` | `53-feedback.js:86` (first-time visitors are marked seen), `:91`, `:96` | `''` |
| sessionStorage `np.wnew` (raw string) | the What's new id shown during this visit | `53-feedback.js:89` | `:91` set, `:96` removed | `''` |

### 1.5 Caches and scores (per device)

| Key | Holds | Read / written | Default | Notes |
|---|---|---|---|---|
| `np.ckwin` | `{k: <JSON string of data dates, events count/ids, megaGoal, modelOK>, v:{rates:{<check>:[ok,total]}, two, wmed, wq75, se2med}}` | `06-helpers.js:181` / `:195` | `null` → recomputed in idle time | Pure cache; safe to lose (costs a background pass). |
| `np.gl` | sticky grade letters: `{"<teamKey>":"B", ...}`, ≤60 entries; teamKey = sorted `species|item|ability|moves` per member (`60-concept-h.js:149`) | `60-concept-h.js:152` / `:156` (raw `localStorage`, JSON) | `{}` | Stores the old A-F letters, kept only for the player's own teams so a letter doesn't flicker. Tied to the old letter grade; the Strength Score has band words now. Convenience only. |
| `np.practice` | Practice score `{streak, best, played, matched}` (numbers) | `63-practice.js:25` / `:26` | zeros | **Player progress, local only, not synced.** Losing it would reset their Practice record. |
| `np.mock` | comma list of design variants, e.g. `"paths-b"` | `98-proposals.js:4` (read only, nothing writes it) | `['paths-a','short']` | Developer switch; set by hand only. |

---

## 2. Per-user database (account sync)

There is exactly **one** per-user document: **`data/users/<uid>/state`** (`03-persistence.js:60`), `uid = await (await claude.use('user')).id()`.
It is private to that viewer (platform rule for `data/users/`, also hidden from the artifact owner).

Document fields: `slots, box, teams, loadedId, format, maxMega, megaGoal, opp, boxV, excl, megaV, log` (the list in `snapshot()`,
`03-persistence.js:18`) plus **`_dev`**: a random id of the page load that wrote it (`:14`, `:25`). Shapes and cleaning are as in
1.2. `fromDoc()` (`:20`) is the reader: missing arrays fall back (`slots`/`box` to the current local value, others to `[]`),
`teams` capped at 10, `box` only strings.

How sync works (`03-persistence.js:52-65`):

1. Page loads from `cc2.state` (or the sample) and renders immediately.
2. `claude.use('db')` and `claude.use('user')`; if either is `null` or there is no id → "Saved in this browser only" (`syncNote('local')`, `:42-43`, text shown in `#saveWhere` and `#boxSync`). Viewer/Commenter/signed-out players stay local-only.
3. The account copy is read **before** any save (`ref.get()`, `:60`). If it exists, it **replaces local data** (`S=fromDoc(v)`, `:61`) and is written back to `cc2.state`. Local-only changes made before that (e.g. while signed out on this browser) are lost; the account wins. If it does not exist, the local state is uploaded whole (`flush()` → `set`, `:62`, `:25`).
4. Saves: `persist()` → debounce 700 ms → `flush()` (`:22-29`). Each field is compared as JSON against the last saved value and **only changed fields are sent** with `update({...changed, _dev})` (field-level; arrays replace wholesale, per the db contract). One write at a time (`writing`/`pending`). Errors: `quota_exceeded` → toast "Storage is full. Delete a saved team."; `invalid_argument` (document gone) → falls back to a full `set`; `unavailable` → retry in 1.5-2.5 s.
5. Live updates: `ref.onSnapshot` (`:64`); ignores snapshots with `hasPendingWrites`, its own echoes (`_dev===DEV`) and any value this page saved before (`savedHist`, last 30 per field). A field changed elsewhere is taken **unless this device changed that same field and hasn't saved it** (`:37`). While the player is typing in an input, remote changes wait until focus leaves (`:31-35`). Taking `slots`/`loadedId` clears undo (`:39`). Toast: "Updated from your other device" / "Your box was updated from your other device".
6. Size: one document, platform limit 256 KiB. With 400 logged games + 10 teams + 400 box it is roughly 100-130 KB (my estimate, not measured).

Test that already exercises this: `experiments/sync-logic.mjs` (two devices, late load, box links). Also `experiments/typing-sync.mjs`.

No other per-user paths exist (checked: the only `.doc(` calls are `03-persistence.js:51,60`, `51-usage.js:18`, `53-feedback.js:11`).

---

## 3. Shared documents the page reads (`meta/...`)

All are read-only for the page, subscribed live with `onSnapshot` at load (`03-persistence.js:55`):
`doubles, doubles_ingame, doubles_tour, singles, status, teams, history, perf, results, model, events, track, practice, weekly, calendar`.

**Split documents** (`03-persistence.js:44-51`, `split-docs.mjs`): every key is read as `meta/<k>` plus `meta/<k>_2`. When a document
is over 200,000 bytes the refresh splits it; both parts carry `_part:{id:'<name>-<ISO time>', n:1|2}`. The page joins only
when both `_part.id` match: arrays concatenated (part 1 first), plain objects merged, other keys from part 2 win; `_part` removed.
With no or mismatched part 2, part 1 is used alone. `split-docs.mjs` splits: results, doubles_tour, teams, history, model, doubles,
doubles_ingame, events, track, practice, weekly, calendar (not perf, status, singles; the page subscribes to their `_2` anyway).
`noteDataDate` (`02-set-data.js:120`) takes `updated`/`pulled`/`date` for the data-date line (not for weekly/calendar).

Every document passes a cleaner (untrusted data, `01-state.js:15`); a document that fails becomes `null` and the page falls
back to the snapshot built into the page where one exists (`RESULTS`, `PERF_RAW`).

| Doc | Cleaner (file:line) | Fields relied on | Used by |
|---|---|---|---|
| `doubles` (Showdown ladder), `doubles_ingame` (Ranked ladder), `doubles_tour` (tournaments), `singles` | `cleanMeta` `01-state.js:21-27` | `format, kind, source, period, note, battles, updated, top[≤60], more[≤300]`; row `{r, n, u, teams, w, ab, it, mv, na, tm, cc, sp, cs:{it, ab, mv[4], pct}}` (pairs `[name, %]`); optional `smogon:{source, period, battles, usage}`. `cs` = most common complete set (`csOf`, `02-set-data.js:79`). | 02-set-data, 05-combobox, 10-team-strategy, 19-showdown-paste, 21-sets, 29-fix-planner, 36-confidence, 39-damage-calc-speed, 42-archetype-guides, 57-set-tips (`SRC` map `01-state.js:13`) |
| `status` | `cleanStatus` `01-state.js:28` | `lastRun, ok, note, schedule` | 29-fix-planner |
| `teams` | `cleanTeams` `18-archetypes.js:144` | `source, updated, teams[≤90]:{player, event, record, section, mons[6]}` | 02, 18, 34, 38, 42, 56-showdown-copy, 61, 63-compare |
| `history` | `cleanHistory` `18-archetypes.js:212` | `days[-40]:{d, ing{}, tour{}, lad{}}` | 02, 15, 18, 29, 37-home-trends |
| `perf` | `cleanPerf` `01-state.js:12` (needs `tour.rows` ≥20) + `activePerf` `16-outside-performance-data.js:96-115` | parts `tour, adj, ingame, official, smogon, ladder, outside` each with `updated`/`frozen`; top `updated`; `reg:{id:'M-C',…}` (also kept as `META.reg` even when perf fails, `03-persistence.js:56`) | 13-rating, 16, 43-data-health |
| `results` | `cleanResults` `29-fix-planner.js:18-27` | `proven[≥100]: [[6 mons], n, wr]`, `cores[≥100]: [a,b,c,n,wr]`, `pairs{}`/`mons{}` `[games, wr]`, `base` (0.4-0.6), `minCore`, `teams`, `tc:{base, rows}`, `source`, `records` (rest passed through) | as `RES`: 08, 13, 18, 22, 28, 29, 36, 38, 48, 55, 60, 61, 63-method, 75-arena-team |
| `model` | `03-persistence.js:56` (needs `mons`) | `mons, dist, ctr, meanX, pilot, games, team, sixes, leads, calib` | 13, 17, 22, 35-win-model, 52, 60, 63-method |
| `events` | `cleanEvents` `49-events.js:6-19` | `source, updated, dict[]`, `events[≤200]:{id, name, date, players, src, top[≤16]:[player, place, record, [6 sheets [n,i,a,nt,[mv]] as dict indexes]], field}` | 06, 18, 22, 25, 28, 48, 49, 55, 56, 60, 61, 63-compare, 63-weekly, 71-manga, 74-arena |
| `track` | `cleanTrack` `64-track.js:8-20` | `since, snaps, last, top, updated, ev[]` (arrays), `mons, mb, fw, mv` | 63-method, 64-track, 74-arena |
| `practice` | `cleanPractice` `63-practice.js:7-20` | `dict, opp[], rounds[], minR, source, updated, from, to` | 08, 63-practice |
| `weekly` | `cleanWeekly` `63-weekly.js:5-18` | `a, b, enough, updated, up, down, top, tech, sty, styAll, fresh, cutA, th` | 63-weekly |
| `calendar` | `cleanCalendar` `63-weekly.js:155-159` | `ev[]:{n, city, cc, s, e, t, url}, checked/updated, src` | 63-weekly |

Owner-only collection reads: `usage` (`51-usage.js:29`) and `feedback` (`53-feedback.js:66`), each `collection(...).get()`.

---

## 4. URLs, hash and history

The site has **no URL routing for pages.** The page always opens on Home. Page switches add browser history entries without
changing the address: `history.state = {npv:'<view>'}`, and an open overlay adds `{npv, ov:1}` (`32-views.js:57,66,69-73`).
View names (data-pane): `home report build auto teams compare matchup coverage types ratings meta top sets box speed calc gauntlet
arch cores events practice method track weekly about sheet`; aliases `battle→matchup`, `build→report`, `cores→auto`
(`32-views.js:10`); unknown → home.

Share links (both are base64url of UTF-8 JSON, no padding; `tlB64`/`tlUnB64` `45-team-links.js:6-7`):

| Link | Format | Example |
|---|---|---|
| Team link | `<base>#team=<code>`; code = `{v:1, f:'doubles', s:[row...], n?:'team name ≤60'}`; row = `[species, ability?(''=default), [4 moves]?, item?, 'Nature:hp/atk/def/spa/spd/spe' or 'Nature:a' (assumed)]` — later entries only when set (`teamCode` `:8-17`). | `{"v":1,"f":"doubles","s":[["Garchomp"],["Incineroar","Intimidate"]]}` → `https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk#team=eyJ2IjoxLCJmIjoiZG91YmxlcyIsInMiOltbIkdhcmNob21wIl0sWyJJbmNpbmVyb2FyIiwiSW50aW1pZGF0ZSJdXX0` |
| Box link | `<base>#box=<code>`; code = `{v:1, b:[names]}` (`boxCode` `:58`) | `#box=eyJ2IjoxLCJiIjpbIkdhcmNob21wIl19` (`{"v":1,"b":["Garchomp"]}`) |

- `<base>` = the current page address on a non-Claude host (public site later), else `TL_ART` (`teamLinkBase` `:19`).
- Reading (`decodeTeam` `:22-38`, `decodeBox` `:61-65`): accepts a full link, `team=<code>`/`box=<code>` anywhere in the text (code `[A-Za-z0-9_-]{8,}`), or a bare code of 12+ chars. Requires `v===1`. `f` is ignored (old `singles` links open as doubles). One per species, abilities/items checked, no Mega stones; box: known non-Mega names, max 400.
- Opening: `checkSharedLink` (`:48`, from `99-start.js`) reads `location.hash + ' ' + location.search` (so `?team=` also works), shows a "Shared team / Load it / Not now" bar; never applied silently; afterwards the address is cleaned to `location.pathname` (`:52`). `checkBoxLink` (`:83`) reads only `location.hash`, opens My box with the code in the paste field, Add or Replace (both undoable), hash not cleared.
- Pasting: Import box (`34-events.js:43`) tries `decodeTeam` before the Showdown parser; box field `#boxLinkField`.
- **Unsure:** whether claude.ai passes the `#team=` hash through to the sandboxed artifact frame; the code assumes it does. Worth one real test on the live URL before and after the switch.

Other outputs (no storage): clipboard copies (team link `45-team-links.js:44`, box link `:67`, Showdown text `34-events.js:42`, `56-showdown-copy.js:67`, contact email `56-about.js:99`); the share image is saved through `claude.use('downloads')` (`44-share-card.js:90-91`), filename from the team title (`:82`).

---

## 5. Usage and feedback writes, and the privacy rule

Both use the viewer's opaque `user.id()` as the document id and run only if the viewer can write
(`u.can('data.write')!==false` or owner). The page uses only `id()`, `isOwner()` and `can()` from `user` (no `me()`,
`profiles()`, no profile/email scopes; checked by grep).

**`usage/<uid>`** (`51-usage.js`): created as `{s:{}}` (`:19`); every 30 s and when the tab hides,
`update({s:{<random visit id>:{d:'2026-11-10', w:'phone'|'desktop', c:{'visit':1,'view:calc':3,'btn:plan':1,'open:details':1,'feedback:idea':1}}}})`
(`:12-14`). Keys: `view:<page>`, `btn:<element id or first data-attribute NAME>` (not its value), `open:<details class>`,
`feedback:<kind>`, `visit`; max 150 keys per visit, 40 chars each. Nested objects merge, so visits accumulate in one doc.
Owner sees totals in `#usageBox` (`:29-41`).

**`feedback/<uid>`** (`53-feedback.js`): `m:{<random key>:{t:<text ≤1000, scrubbed>, k:'bug'|'confusing'|'idea'|'like'|'mistake', v:<page>, w:'phone'|'desktop', d:'YYYY-MM-DD', c?:<context ≤1200>}}`
(`fbSend` `:49-58`; `set` first time, then `update`). `c` (Report a mistake) is what was on screen: a Pokémon's rating/set lines or
the damage calc text (`fbMisContext` `:21-30`). `fbScrub` (`:42-47`) removes email addresses, phone numbers (9+ digits) and
@handles before saving. The box says "Anonymous — please don't include personal info like your name or email." Owner list:
`#fbBox` (`:65-75`), shows "person N".

Checked against "COPPA: no names or emails collected; feedback stays anonymous":

- OK: no name/email/handle is requested or read from the platform; ids are opaque; dates only (no time) in new feedback; per-user state is private even from the owner.
- **Flag 1 (unsure, must check at publish):** the comments say "the db rules at publish let each viewer write only their own document" and only the owner reads. Those rules are **not in the repo**. The platform default is that signed-in viewers can read shared documents, so without a read rule every feedback message would be readable by any signed-in viewer. The rebuild's publish must keep (or, if passing `capabilities`, restate) rules equivalent to: `feedback` and `usage` read by owner only, `feedback/{self}` and `usage/{self}` writable by the viewer, plus `user` and `downloads`. I could not see the live declaration from here.
- **Flag 2:** free text is only scrubbed for emails, phone numbers and @handles; a child can still type their name (or a name inside a "Wrong info" note). Covered only by the on-screen warning.
- **Flag 3:** team names (saved teams, up to 40 chars; team links carry up to 60) are free text. They stay in the private per-user doc, but a team link puts the name in the URL the player shares.
- **Flag 4 (minor):** `usage/<uid>` and `feedback/<uid>` use the same id, so the owner can link a person's feedback to their usage counts. Pseudonymous, not identifying.
- **Flag 5 (minor):** older feedback messages "carry a full time" (`53-feedback.js:67` comment); new ones store the date only.

---

## 6. The contract for the rebuild

### 6.1 Must be read and written identically (players lose data otherwise)

1. **Same artifact URL** (`5VBfLTR5sM4JU5NswJYyGk`): republish in place; never a new artifact. Keep the db capability rules and `user`/`downloads` capabilities.
2. **`data/users/<uid>/state`**: same path, same 12 field names and shapes (1.2 table), plus tolerate and keep writing `_dev`. Keep field-level `update` of changed fields only, read-before-first-save, the "account wins on first load" rule, `onSnapshot` live merge with echo protection, and wait-while-typing. Keep `boxV:2`/`megaV:1` so the migrations don't re-run. Keep box order. Keep `log` at 400 and entry shape `{t,r,b,tm,o}`; keep saved teams at 10 with `{id,name,slots,format,saved}`; keep `singles` sub-keys and singles teams untouched.
3. **`cc2.state`** in localStorage, JSON of the same object (players not connected to an account have their only copy here).
4. **Team links `#team=` (and `?team=`) and box links `#box=`**: same base64url-JSON `v:1` format, both directions; keep accepting bare codes and full pasted links; keep old `f:'singles'` links opening as doubles.
5. **`np.practice`** (Practice score; local only) and the "first visit" flags `cc2.welcomed`, `cc2.seenNew` (else every returning player sees the welcome card again).
6. **Preferences** players set by hand: `cc2.theme` (`auto/light/dark`), `cc2.pool`, `cc2.recsrc`, `cc2.absrc`, `cc2.setSrc`, `cc2.setMon`, `cc2.boxSort`, `cc2.tview`, `cc2.sprv`, `cc2.lstab`, `cc2.seg.thr`, `cc2.seg.types`, `cc2.chf.*`. Losing these doesn't lose data but resets choices; keep reading them (a renamed control can map its old key).
7. **`meta/*` reading**: same 15 keys, `_2` parts and `_part` join rule, same cleaners (the daily refresh and `split-docs.mjs` write these shapes; tests in `.github/workflows` read them).
8. **`usage/<uid>` and `feedback/<uid>`** shapes, so the owner's existing reports keep adding up.

Safe to drop or change (caches/dev switches): `np.ckwin`, `np.gl`, `np.mock`, `cc2.view` (written, never read), `cc2.lmode`
(forced to `'board'`), sessionStorage `np.wnew`, `history.state {npv, ov}`.

### 6.2 Risks I see

1. **New artifact = empty site for everyone** (section 0). Highest risk.
2. **`render()` is the save trigger.** A rebuild whose new screens change `S` without calling the old `render()` (or `persist()`) will look fine and silently never save. Every write path in the rebuild needs an explicit save, and a test that reloads.
3. **`leads` / `recentOpp` live in `74-arena.js`** (the "arena" design module) and are already lost on load for signed-in players. A rebuild that drops the arena modules drops these features; one that copies the code copies the bug. Decide on purpose (my suggestion, not tested: add both to `snapshot()`/`fromDoc()`).
4. **Theme-named modules hold real behaviour, not just looks.** No storage key is named after riso/manga/arena/concept-h, so there is nothing to keep for the theme names themselves, but these modules write saved data: `74-arena.js` (`leads`, `recentOpp`, `opp`, `cc2.chf.sheet2`), `60-concept-h.js` (`cc2.chf.*`, `cc2.seg.*`, `cc2.pool`, `cc2.tview`, `np.gl`), `65-design-c.js` (`cc2.sprv`), `71-manga.js` (reads `meta/events`). Deleting them as "old themes" would remove functionality.
5. **Cleaners delete data permanently.** `normSlots`, `fixTeams`, `fixLog`, box and `excl` filters drop any name not in the page's roster (`byName`), and the next save writes the shortened list to the account. If the rebuild ships a different roster (renamed form, a regulation change, a typo in the data table), players' teams, box and logged games lose those Pokémon for good on every device. Keep the roster identical, or make the cleaners keep unknown names instead of deleting them.
6. **Dropped extra fields.** `fixTeams` keeps only 5 team fields and `fixLog` only 5 log fields; `fromDoc` only the 12 state fields. If the rebuild adds a field (team notes, pinned, game notes), the **old page** still open on another device will strip it on its next save. During the switch both versions may be open; new fields should live in a new top-level field of the document (untouched by old `fromDoc`), not inside teams/log entries.
7. **Two versions writing the same doc during the switch.** Old tabs keep running old code after the republish (until reload). Field-level updates limit the damage, but any change in a field's shape (e.g. slots) will be overwritten back and forth. Keep shapes; only add.
8. **Local-only players**: Viewer/Commenter/signed-out viewers have data only in `cc2.state` of that artifact origin. Any change of origin/URL loses it, and they can't be warned through the account.
9. **Account wins on first load**: if the rebuild changes the order (e.g. saves before reading the account), the sample team or a stale browser copy could overwrite a player's account. `sync-logic.mjs` tests exactly this; run it against the rebuild.
10. **Size**: one state doc, 256 KiB cap; raising the 10-team / 400-game / 400-box caps could hit `quota_exceeded`.
11. **db rules not in the repo** (5, Flag 1): a publish that passes `capabilities` without the same rules could open everyone's feedback to all signed-in viewers, or block writes.
12. **Unsure**: hash delivery into the artifact frame for `#team=`/`#box=` links; test on the live URL.

### 6.3 Counts

- localStorage: **21** (19 fixed keys + 2 key families `cc2.chf.*`, `cc2.seg.*`); sessionStorage: **1** (`np.wnew`). No IndexedDB or cookies.
- Per-user database: **1** document (`data/users/<uid>/state`, 12 fields + `_dev`; plus 2 local-only fields of `S`).
- Shared reads: **15** `meta/*` documents, each with an optional `_2` part; owner-only reads of 2 collections.
- Per-viewer writes outside `data/users`: **2** (`usage/<uid>`, `feedback/<uid>`).
- Links: **2** formats (`#team=`/`?team=`, `#box=`); history state only, no page routes in the URL.

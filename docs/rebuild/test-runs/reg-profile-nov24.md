# One regulation profile: Reg M-D becomes a one-line change (reg-md-plan.md 0.1 + gap G1). Scout, Nov 24, 5:20–6:32 PM by the clock
**Result: all 12 checks pass after, as all 11 did before (plus the new one). Page text identical under M-C (0 routes differ).**

## Basics
- **Branch:** alt/regprofile, from claude/design6 02605f66.
- **Data:** frozen out/ (0c992f69).
- **Delivery:** nothing pushed. Five commits, one per step:

| Step | Commit | What |
|---|---|---|
| 1. profile | 58adf1d6 | `regulation.json` + formats.mjs reads it |
| 2. page text | 6a87727d | build hands the page `REG_PROFILE`; 29 page files read it |
| 3. sources (G1) | be045fd3 | Showdowntier, Pikalytics, official events, item list, labels |
| 4. tests | dfffb4a6 | new `experiments/reg-profile-test.mjs` + a line in test.yml |
| 5. this report | (last) | |

## How to switch to M-D (the one line)
1. Before Dec 2: add an `"M-D"` entry under `"regs"` with:
   - name, long, sd (Showdown id)
   - since
   - sources: ids or null; null means "not available yet"
   - items file
   - rules
2. On the day, change `"site": "M-C"` to `"site": "M-D"`.
   - M-C's `"end"` stays in the file for good, so events after it count as M-D.
   - The whole file is 20 lines.

## Step 1: inventory (where the regulation was written)
Checked with grep:
- `grep -rno 'M-C' app/src → 89 in 45 files`
- the data job and tests, via the Grep tool.

| Where (file:line, at 02605f66) | Held | Now reads | Done |
|---|---|---|---|
| formats.mjs:47 `SITE_REG` | id, sd, since | regulation.json `site` entry | yes |
| formats.mjs:67 `REG_END` | M-C end | every entry's `end` | yes |
| formats.mjs:71 `regOf` fallback `SITE_REG.id` | format of old saved events | `LEGACY_REG = 'M-C'` (history). **Bug fixed:** after a switch, old M-C events would have counted as M-D | yes |
| reg.mjs:17 `t.f \|\| SITE_REG.id` | same | `LEGACY_REG` | yes |
| app/src/app/24-sheet-data.js:108/113 `PAGE_REG`, `REG_NAME` | 'M-C', 'Reg M-C' | `REG_PROFILE.id` / `.name` (build time) | yes |
| 26 page lines with fallback `typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C'` / `{id: 'M-C'}` | M-C | `REG_PROFILE.name` / `{id: REG_PROFILE.id}` | yes |
| About 40 visible strings in 27 page files (share images, titles, file names, paste messages, info sheets, home, weekly, method, body.html) | "Reg M-C", "REG M-C", "Regulation M-C" | `REG_PROFILE.name` / `.name.toUpperCase()` / `.long`; body.html uses `%REG_NAME%` / `%REG_LONG%`, filled by the build | yes |
| 19-showdown-paste.js:136 the regex reading back "not on the M-C roster" | M-C | any regulation id | yes |
| sources.mjs:34 Showdowntier `formats/dmc` | M-C page | `sources.showdowntier`; the page must say "Regulation <id>" | yes |
| sources.mjs:45 Pikalytics `championstournaments` (no regulation in its address) | an M-C page in practice | `sources.pikalytics`; the sample events must be mostly this regulation's | yes |
| official.mjs:22 `REG 'M-C'`, `REG_START '2026-09-01'` | M-C | `sources.official`, `since` (OFFICIAL_REG env still overrides) | yes |
| perf.mjs:49 Showdowntier link | dmc | profile | yes |
| crosscheck.mjs:59 "Pikalytics Reg M-C" | label | `activeReg().name` | yes |
| practice.mjs:60 fallback 'Reg M-C' | label | `activeReg().name` | yes |
| names.mjs:29 `data/regmc-items.txt` | M-C item list | profile `items`; none listed = no item check (never M-C's list) | yes |
| update.mjs:104 `prev.reg \|\| 'M-C'` | old saved data with no reg field | **left: history** | no |
| ladder.mjs, replays.mjs, events.mjs, weekly.mjs, update.mjs, md-watch.mjs | already `activeReg()` | unchanged | already |
| .github/workflows | comments only, no regulation values | test.yml runs the new test | n/a |
| Tests: A-team.mjs 370/880/883/922, D-meta-shell.mjs 463/842, run.mjs 404/405 | expect the words "Reg M-C" | **left (rule: never change a test to make it pass).** On switch day they will expect M-C and fail. See "What's left" | no |

**Left on purpose (history, genuinely about M-C):**
- `BUILTIN_REG = 'M-C'`: the built-in ratings snapshot is M-C numbers, and the check uses it to refuse them under another regulation.
- app/src/data: the built-in snapshot's "10,209 Reg M-C tournament teams", the item-list comment, the news list's `reg: 'M-C'` gifts, the generator headers.
- The 71-manga.js abbreviation list (old site theme).
- Code comments (12 lines).
- Real event names in the data ("… Reg M-C #82").

## Step 2: the profile
- `regulation.json` (root) holds:
  - `site`
  - per regulation: name, long, sd, since, end, sources {showdowntier, pikalytics, official}, items, rules {format, bring 6, pick 4, level 50, points 0–32, Item Clause}
- **formats.mjs** exports:
  - `REG_FILE`, `REG_PROFILE`, `regProfile(id)`, `regSources(id)`, `sourcePageCheck()`
  - `SITE_REG` and `REG_END`, with the same shape as before
- **Safety:** the module throws if the site entry lacks sd or since.
- **Dry runs:** `REG_PROFILE_FILE=<path>` reads a scratch copy.
- **The build** (app/build.mjs) puts `const REG_PROFILE={…}` first in both pages and fills `%REG_NAME%` / `%REG_LONG%` in static HTML.
- **Rules not wired:** `rules` are in the profile but no page reads them yet. The texts "bring 6, pick 4", "Level 50" and "Points 0–32" stay written in the pages (the same in M-D as far as known). Not checked against M-D's official rules.

## Step 3: outside sources (G1)
- **The rule:** each source reads the ids of the regulation our numbers are built from (`activeReg()`). If the id is null or missing, or the fetched page is about another regulation, the source reports `<source>: not available yet for Reg M-D: <why>` in out/sources.json `problems` and gives no numbers.
- **Official events:** with no id, every event is skipped as "not Pokémon Champions Reg not-available-yet".
- **Checked live (curl, 5:31 PM):**
  - Showdowntier `formats/dmd` answers `dmd 404` today.
  - Its dmc page's title says "VGC 2026 Regulation M-C".
  - Pikalytics' `championstournaments` page names its events "… REG M-C …" (5 of the rows shown).
- **NOT RUN HERE (blocked):** sources.mjs and official.mjs. This session's privacy guard refuses any command that names a file holding the contact email, and both do.
  - Their checks moved into formats.mjs (`sourcePageCheck`, `regSources`), which the new test runs.
  - The two files are edited with plain imports and calls.
  - **HH: please run `node sources.mjs` and `node official.mjs` once (or let the daily job), and check out/sources.json has no new problem lines under M-C.**

## Step 4: proof
### (a) profile = M-C: same page, same results
**Page text, before vs after.** `textdiff.cjs` opens both built pages on each route at 1440 and 390 and compares the page title plus all visible text line by line.

| Page | Routes | Result line | Plain meaning |
|---|---|---|---|
| New site (`--v2 --preview-data`) | 28 | `routes with differences: 0` | every route reads the same before and after |
| Old site | 17 views | `routes with differences: 0` | the same |

- Share images draw on a canvas, so their text isn't in that diff. Their lines were checked by reading the code only.
- Both builds: `v2 guard: clean`.

**Every check, before (02605f66) and after (dfffb4a6).** Same frozen data; each in its own clean copy.

| Check | Before: exit, last line | After: exit, last line |
|---|---|---|
| app/test/run.mjs | 0, `ALL PASSED` | 0, `ALL PASSED` |
| experiments/reg-test.mjs | 0, `all passed` | 0, `all passed` |
| threat-check | 0, `PASS` | 0, `PASS` |
| golden | 0, `10 of 10 known-answer cases pass` | 0, `10 of 10 known-answer cases pass` |
| same-grade | 0, `ALL PASSED` | 0, `ALL PASSED` |
| legality-check | 0, `Mega stones per official team: {"1":110,"2":402}` | 0, `Mega stones per official team: {"1":110,"2":402}` (same) |
| suggest-audit 30 5 | 0, `SUGGESTIONS AUDIT PASSED` | 0, `SUGGESTIONS AUDIT PASSED` |
| v2-minors PART=main1 | 0, `v2-minors (main1):all passed` | 0, `v2-minors (main1):all passed` |
| v2-minors PART=main2 | 0, `v2-minors (main2):all passed` | 0, `v2-minors (main2):all passed` |
| v2-minors PART=groups | 0, `v2-minors (groups):all passed` | 0, `v2-minors (groups):all passed` |
| tap-size | 0, `tap-size: all passed` | 0, `tap-size: all passed` |
| NEW reg-profile-test.mjs | (did not exist) | 0, `all passed` (17 checks) |

- **Setup note:** my first "before" run of v2-minors and tap-size failed with `ENOENT … app/dist/v2.html`. I had skipped the build step GitHub runs first (`node app/build.mjs --v2 --preview-data`, then `PAGE=app/dist/v2.html`). I fixed the setup (not the tests) and re-ran them.
- **The new test can fail.** I put the hard-coded "Reg M-C" back into pokemon.js, and it reported `FAIL no page code writes M-C by hand under an M-D profile (… found: address doesn't match a Pokémon in Reg M-C.…)` and `1 FAILED`. Then I restored the file.

### (b) profile = made-up M-D (scratch copy; regulation.json untouched)
- **The profile used:** id M-D, sd gen9championsvgc2026regmd, since 2026-12-02, sources null.
- **Builds:** `REG_PROFILE_FILE=… node app/build.mjs --v2 --preview-data` → `v2 guard: clean`; the old build also built.
- **Where it says Reg M-D.** `regscan.cjs` scanned every route at 1440 and 390, including titles, alt text and aria-labels:
  - `Build · Reg M-D doubles` (build)
  - `Legal for Reg M-D` and `My team · 6 of 6 · Sun team · Legal for Reg M-D ✓` (team)
  - `Based on our reading of the Reg M-D rules…` (team)
  - `Legal in Reg M-D` and `Pokémon Champions · VGC doubles, Reg M‑D. Rated from 13.6k…` (Pokémon pages)
  - `This address doesn't match a Pokémon in Reg M-D.`
  - About: `…Pokémon Champions VGC doubles (Reg M-D)…`
  - Old site static text: `Pokémon Champions, Reg M-D`, `Team preview: Reg M-D doubles`.
- **What still says M-C, and why.** All of it comes from the data, which is still M-C:
  - Real event names: "Tenki's Cart Weekly #125 - Reg M-C", "Sketch Academy Sunday Regulation M-C Tournament", …
  - `Numbers are from Reg M-C. Anything new in Reg M-C may be missing…`: the banner for exactly this case (data regulation ≠ page regulation). Right.
  - `Limitless team sheets · 8,319 teams from 223 Reg M-C tournaments`: the usage source line, written by the data job. On the day it will say M-D.
  - `Reg M‑C doubles · 13,631 tournament teams?` (Meta): reads the data's regulation (regInfo). Right.
- **In the built code under M-D:** 0 hand-written M-C in page code; the only M-C left is the history listed above (the test enforces it).

## What's left
1. **Tests expect the words "Reg M-C":**
   - A-team.mjs: 370, 880, 883, 922
   - D-meta-shell.mjs: 463, 842
   - run.mjs: 404, 405 (labels only)

   They pass today, and they would fail on switch day. Suggested: let them read the name from regulation.json. That's a test change made before the switch, not to make a failure pass, so it's HH's call.
2. **The M-D entry:** the real sd (year part), since, the sources' ids once those pages exist, and an M-D items file (reg-md-plan 0.4).
3. **`rules`** aren't read by any page yet (bring 6 / pick 4 / level 50 / points stay as text).
4. **sources.mjs and official.mjs** need one real run (blocked here; see step 3).
5. **experiments/gen-items-list.mjs and split-test.mjs** still name `data/regmc-items.txt`. They are tools, not the site.

## Pictures
None: this job changes no looks (the text diff is 0 under M-C).

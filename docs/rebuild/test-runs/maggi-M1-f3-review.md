# Maggi Job M1: Bug review of `alt/f3-claude` (`ba95fd61`)

- **Date:** Thu Nov 26 08:55:18 PM EST 2026
- **Reviewed diff:** `git diff origin/claude/design6...origin/alt/f3-claude` (`23520831` → `ba95fd61`, 8 files, +122 / -27)
- **Report branch:** `alt/maggi-m1-review` (report only, no code changes)
- **What I'd need to know that you haven't told me:** Nothing missing.

## Summary verdict
- **Blockers for tomorrow's 8:30 AM switch:** **None found** (checked via both builds, `v2-public.mjs`, Playwright runtime checks on both builds, and `v2-minors.mjs PART=main1` through line 1168). Both builds compile clean with zero `pageerror`s, no `undefined`/`NaN` in live Home renders, and normal clicks on all Home buttons and receipt bars work.
- **Fix after (before Dec 2 Reg M-D switch):** 4 bugs (3 Reg M-C/M-D transition / zero-data bugs in `pubhome-f3.js`, 1 Claude-vs-public link bug in `V2.f3Link`).
- **Minor:** 3 items (1 weakened assertion in `A-team.mjs`, test-coverage gaps where `__NP_SDHERO` redirected hero checks to the unused Stampede hero, and dead/cache-key edge cases in `pubhome-f3.js`).

---

## Findings

### 1. [fix after — before Dec 2] Reg M-C winning team is not labelled as old Reg M-C after Dec 2 02:00 UTC (`evReg` regex misses 110/114 real events)
- **Where:** `app/src/v2/pages/pubhome-f3.js:18-28,47`
- **Status:** checked (inspected `HEAD:out/events.json` + ran Playwright on Claude build with `Date.now` mocked to `2026-12-02T03:00:00Z`)
- **Proof:**
  - **Input:** `Date.now() = Date.parse('2026-12-02T03:00:00Z')`, `regInfo().id = "M-C"`, latest event in `HEAD:out/events.json` = `"RookideeVGC Qualifier| Prize Shiny Charizard"` (only 4 of 114 events in `HEAD:out/events.json` contain `\(Reg [A-Z]-[A-Z]\)`; the `META.teams` fallback on line 22 also has names like `"2027 Gdańsk Pokémon Regional Championships"` with no `(Reg M-C)`).
  - **Now:** `D.reg` becomes `"M-D"`, `D.evReg` is `""`, `D.old` is `false`. The page renders H1 `"Sharply raise your win rate. Rate your Pokémon Champions team for Reg M-D."` right beside receipt header `"Winning team · RookideeVGC Qualifier| Prize Shiny Charizard · Nov 23 · 46 players"` — showing a Reg M-C winner, Reg M-C ratings, and a Reg M-C Strength Score with no "last Reg M-C" label.
  - **Should:** Fall back `evReg` to `reg` (from `regInfo().id`, the regulation the loaded dataset belongs to) when `ev.name` has no `(Reg X-Y)` tag, so `D.old` is `true` and `lab` prints `"The last Reg M-C winning team"`.

### 2. [fix after] Receipt bar links emit root-relative `/pokemon/<slug>` URLs in the Claude build
- **Where:** `app/src/v2/pages/pubhome-f3.js:32`
- **Status:** checked (ran Playwright on `node app/build.mjs --v2 --preview-data` and compared with `app/src/v2/pages/meta.js:23` and `app/src/v2/shell.js:741-750`)
- **Proof:**
  - **Input:** Claude build (`window.__NP_PUBLIC` is `undefined`). `V2.pubSlug` is still defined in `app/src/v2/kit.js:143` and `app/src/v2/pages/pokemon.js:13`, and `V2.f3Link` only checks `typeof V2.pubSlug === 'function'`.
  - **Now:** Every `.f3-bar` renders `href="/pokemon/charizard-mega-y"` (etc.), whereas `#team` and `#build` stay `#team` and `#build` on the Claude build. Normal left-click still works because `shell.js:248` intercepts `[data-v2mon]`, but middle-click, Cmd/Ctrl+click, "Open link in new tab", or "Copy link address" targets `/pokemon/<slug>` (broken on Claude artifacts and `file://`).
  - **Should:** Gate `/pokemon/${s}` on `window.__NP_PUBLIC` (like `meta.js:23`), or return `#pokemon=${encodeURIComponent(n)}` and let `V2.pubLinks` (`shell.js:745`) rewrite it to `href="/pokemon/${s}" data-h="#pokemon=..."` on the public build only.

### 3. [fix after — before Dec 2] Lead sentence prints `"against 0 real tournament teams"` when `RES` is null or `RES.teams` is 0
- **Where:** `app/src/v2/pages/pubhome-f3.js:37,41`
- **Status:** checked (ran Playwright on Claude build with `RES = null`, matching `app/src/app/03-persistence.js:101` when `builtinOk()` is false on a new regulation before results land)
- **Proof:**
  - **Input:** `RES = null` (or `RES.teams = 0`).
  - **Now:** `.f3-lead` renders `"Add your six. NastyPlot rings it up out of 100 against 0 real tournament teams, then shows its Matchups and exactly what to change."`
  - **Should:** Guard `teams > 0` (matching `stampede-hero.js:41` and `meta.js:93`) and omit `"against 0 real tournament teams"` when `teams` is 0.

### 4. [fix after — before Dec 2] `V2.f3Rate` ignores `V2.unrated(p)` and shows placeholder ratings during a new regulation's first 28 days
- **Where:** `app/src/v2/pages/pubhome-f3.js:12`
- **Status:** checked (ran Playwright on Claude build with `META.reg = META.perf.reg = {id: 'M-D', since: '2026-12-02', now: null}` and `Date.now() = 2026-12-03T12:00:00Z`)
- **Proof:**
  - **Input:** `Beedrill` (`ratings().get('Beedrill').tc === null`, `V2.regYoung() === true`, `V2.unrated(p) === true`).
  - **Now:** `V2.f3Rate('Beedrill')` returns `9` (placeholder rating) instead of `null`.
  - **Should:** Return `null` when `V2.unrated && V2.unrated(byName.get(n))` is true (matching `meta.js`, `pokemon.js:47`, `stampede.js:13`, `sets.js:63`, `usage.js:80`), so the bar renders `–` and `aria-label="<name>, not rated"`.

### 5. [minor — test weakening] `HOME-06` empty-team check dropped `&& b.includes('Battle')`
- **Where:** `app/test/behaviour/A-team.mjs:88`
- **Status:** checked (diff read + ran Playwright on Claude build with empty team `S.slots = blank()`)
- **Proof:**
  - **Input:** Empty team on Home (`team: []`).
  - **Now:** `homeStartButtons()` returns `["Score My Team", "Build Me a Team", "Battle"]`, but `A-team.mjs:88` was changed from `b[0] === 'Build Me a Team' && b.includes('Score My Team') && b.includes('Battle')` to `b[0] === 'Score My Team' && b[1] === 'Build Me a Team'`, dropping the `Battle` check.
  - **Should:** Restore `&& b.includes('Battle')` (or `b.join('|') === 'Score My Team|Build Me a Team|Battle'`).

### 6. [minor — test coverage gap] `__NP_SDHERO` redirects leave Final 3's hero without contrast or short-window checks
- **Where:** `app/test/v2-q19.mjs:36`, `app/test/v2-minors.mjs:436,451,578,861,2188,2207`
- **Status:** checked (diff read + Playwright check of `1000x650` and `393x659` on Claude build)
- **Proof:**
  - `v2-q19.mjs:36` sets `window.__NP_SDHERO = 1`, so headline contrast is only checked on the unused `.sdh-h .l2`, not `.f3-h1` / `.f3-h1s` / `.f3-bar .f3-r`.
  - `v2-minors.mjs:2188` (`393x659`, `430x739`) and `2207` (`1000x650`) set `window.__NP_SDHERO = 1`; `F3-2` (`v2-minors.mjs:1495`) checks `Score My Team` at `390x844, 1280x800, 1366x768, 1440x900, 1920x1080`, not `1000x650`, `393x659`, or `Build Me a Team`. (Checked manually in Playwright: both buttons currently fit above the fold — `1000x650`: 471/463 ≤ 650, `sw: -15`; `393x659`: 376/432 ≤ 602, `sw: 0` — so there is no live failure, only a test gap.)
  - `v2-minors.mjs:578` raised the 390px phone Home height cap from `7.85` to `7.95` screens (comment notes Sim OK for Preview-only data note).
  - `v2-minors.mjs:861` opens a `BrowserContext` (`ph`) without closing it until `b.close()` (test-only).

### 7. [minor — dead code / cache edge case] `V2.f3Seo` unused + `V2._f3` cache ignores Dec 2 clock rollover
- **Where:** `app/src/v2/pages/pubhome-f3.js:16,27,79`
- **Status:** checked (grep across `app/` and `public-site.mjs` + code read)
- **Proof:**
  - `V2.f3Seo` (`pubhome-f3.js:79`) is never called anywhere (`V2.preBlock` calls `V2.pages.home.seo` in `home.js:205`) and hardcodes `Reg M-D.` instead of using `D.reg` like `V2.f3Words` line 36.
  - `V2._f3` (`pubhome-f3.js:16`) is keyed only by `metaVersion`, not `Date.now() >= mdAt`, so a tab left open across Dec 2 02:00 UTC without a data refresh keeps cached `D.reg = 'M-C'` / `D.old = false` while `V2.f3Words` switches to `"for Reg M-D."`.

---

## Checks run

1. **Claude preview build** — checked (ran on `alt/f3-claude` `ba95fd61`, today's `out/`):
   - Command: `node app/build.mjs --v2 --preview-data`
   - Exact result lines:
     - `v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)`
     - `v2: static first screen 99 KB`
     - `built dist/v2.html (4447 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)`
   - Plain meaning: Claude build succeeded cleanly with static first screen and zero guard errors.

2. **Public split build** — checked (ran on `alt/f3-claude` `ba95fd61`, today's `out/`):
   - Command: `node app/build.mjs --v2 --split --one-art-size --art=../src/v2/art/ --public`
   - Exact result lines:
     - `v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)`
     - `v2 --split: dist/v2.js 2061 KB (publish them beside the page)`
     - `v2: static first screen 100 KB`
     - `public: static words for 24 pages (home: Sharply raise your win rate. Rate your Pokémon Champions team before Reg M-D.)`
     - `built dist/v2.html (872 KB; 28 CSS layers, 8 data files, 58 scripts, 62 shared logic files)`
   - Plain meaning: Public build succeeded cleanly and pre-rendered the new combined slogan + Reg M-D H1 into static HTML.

3. **Public build suite (`v2-public.mjs`)** — checked (ran on `alt/f3-claude` `ba95fd61`, today's `out/`):
   - Command: `node app/test/v2-public.mjs`
   - Exact result lines:
     - `pass  public Home: Final 3's hero first, then Top 10, your six, tools rack, post band; no Stampede hero; one h1 ({"hero":1,"top":25,"six":120,"tools":277,"post":699,"old":-1,"h1":1})`
     - `pass  no page errors`
     - `v2-public: all passed`
   - Plain meaning: Public build passes all checks, including the new band-order and single-H1 check, with zero page errors.

4. **`v2-minors.mjs` (`PART=main1`)** — **partial (timed out at ~10 min)** (ran on frozen test data `0c992f6977bc1cecc4e03eb269969a82b99681cf` with `node app/build.mjs --v2 --preview-data`, matching `.github/workflows/test.yml`):
   - Command: `PART=main1 PAGE=app/dist/v2.html node app/test/v2-minors.mjs`
   - Exact result: exited with code `-1` (tool timeout at ~9m51s) after **99 `pass` lines and 0 `FAIL` lines**, reaching `X-05 (Nov 18)` (`v2-minors.mjs:1168`), including `pl-5d` (`v2-minors.mjs:867`, the only check in `main1` modified by this diff).
   - Plain meaning: Every check in `main1` up to line 1168 passed with zero failures; lines 1169–1477 did not finish before the command timeout.

5. **Targeted Playwright proofs on both builds** — checked (custom script on both `--public --split` via local HTTP and `--v2 --preview-data` via `file://`):
   - Exact results: `pageerrors: []` on both builds; verified exact outputs for Findings 1–6 above.

## Not checked / unfinished
- `v2-minors.mjs` `PART=main1` lines 1169–1477 did not finish (hit the ~10 min command timeout after 99/99 passes).
- `v2-minors.mjs` `PART=main2` (where `F3-1`/`F3-2`/`F3-3` live) and `PART=groups` were not run (not requested by M1).
- `app/test/behaviour/A-team.mjs` and `app/test/v2-q19.mjs` were reviewed by diff only, not executed.

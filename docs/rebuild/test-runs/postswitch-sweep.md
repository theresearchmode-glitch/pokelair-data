# Job KK: post-switch sweep (report only), Fri Nov 27, 3:26 AM

## What was swept
- **The live files.** I built them at main 572622d5 with `cd app && node build.mjs --v2 --art=v2art/ --one-art-size --split`.
  - v2.js came out at **3,819,261 bytes**, the live size (checked with `ls -l`).
  - v2.html is 1,005,682 bytes. I served it over http, with `/v2art/` pointing at app/src/v2/art.
- **Today's data.** A db stub (Job T style: `window.__NP_CLAUDE`, `meta/<k>` and `meta/<k>_2` snapshots) gives the page today's documents from origin/main **b7d60ef3** out/.
  - The documents are made with split-docs.mjs DOC_SOURCES, including post and info, and perf = perfDoc(limitless, perf).
  - results, model and events come from out/split/<k>.json + <k>_2.json, as out/split/index.json lists them.
- **Proof the page used today's data, not its built-in copy** (same pages, stub given `{}` as the control):
  - Ratings: "17,804 tournament teams" (built-in: 10,209).
  - Footer: "Data as of Nov 27" (built-in: "Data as of Nov 1 (26 days old)").
  - Events show Nov 26-28 and Dec 5; Track Record weeks run to Nov 23.
- **Coverage.** 12 pages: Home, My Team, Build, Battle, Damage Calc, Ratings, Pokémon (Garchomp), Winning Teams, Events, This Week, News, Track Record.
  - Devices: WebKit iPhone 15, iPhone SE, iPad Pro 11 portrait and landscape; Chromium 1440x900 and 1280x800.
  - Light and dark: 144 shots.
  - Extras (32 shots, WebKit iPhone 15 + Chromium 1440, light and dark):
    - A returning visitor with a saved team ("Morning Six", via the stub's user state).
    - News and Mystery Gifts.
    - Move, Ability and item info sheets.
    - Track Record bands.
    - Spicy picks on (opened by Search, the way Sim would).
- **Checks on every shot:** page errors, console errors, HTTP 400+, sideways scroll, text cut by its box or off screen, a loading/error screen, "Ready for" / "% ready", a nearly empty #main, Reg wording.
  - The checks could fail: a forced 900px h1 and a clipped h1 on Ratings (iPhone SE) were both flagged.
  - The checker does NOT flag stale data. The data was checked by hand (above).

## Result: no problem found that Sim would see
- **Automatic checks:** 144 + 32 shots, 0 flagged (0 errors, 0 failed requests, 0 sideways scroll, nothing cut).
- **I looked at all 12 contact sheets and the 4 extras sheets.** Nothing empty where data should be; dark mode clean.
- **Reg wording:**
  - Home: "before Reg M-D" and "Reg M-D in 5 days". Its line "M-C ends Dec 2, 1:59 AM" is in the test browser's time zone (UTC).
  - Elsewhere "Reg M-C": My Team "Legal for Reg M-C", Build, Garchomp "Reg M-C".
  - No "for Reg M-D" before Dec 2.
- **Returning visitor:** My Team shows "Morning Six", score 44 "Missing a basic", and their six (Incineroar, Rillaboom, Farigiraf, Sneasler, Kingambit, Garchomp). The sample team is not shown.
- **News:** "NO. 69 · LATE EDITION · FRIDAY, NOVEMBER 27, 2026". Top story is "Announcing a Campaign Linked to Pokémon GO!", Nov 25, the newest in post.json. "Regulation Set M-D" is there too.
- **Mystery Gifts:** "2 to claim · live right now", "34 days until one ends", "10 gifts so far".
- **Info sheets:**
  - Fake Out: "65% of tournament teams".
  - Intimidate: 57%, "Teams 4,349 · Pokémon run it 20 · Can have it 25".
  - Sitrus Berry: 53%, "Usual suspects: Incineroar 65% of 2,442 Incineroar run it".
- **Track Record:** the bands are **Rated 90+, 80-89, 70-79, Under 70** (not 80/70/60), weekly to Nov 23. "Oct 29 tracking since · 30 days of ratings saved · 103 events checked".
- **Spicy picks:** on. "Spicy pick 1: +40, 44 -> 84 Tournament ready (Incineroar -> Mega Camerupt, to catch)" and "Spicy: too few games to tell · 3.2% of teams".
  - The +40 is mostly the missing Mega (the Fix line above it: "adds a Mega").

## Short list (minor, nothing blocking)
1. **Home receipt bars link to `/pokemon/<slug>` on the live Claude build.**
   - A plain tap works: it goes to `#pokemon=sneasler`, "The file on Sneasler" (WebKit and Chromium).
   - A long-press "Open in new tab" or a copied link gets a dead address inside the artifact.
   - Already fixed by Maggi M2 (F3-5) in alt/batch9.
2. **Home's countdown line prints the end time in the device's time zone.** In the UTC test browser it says "M-C ends Dec 2, 1:59 AM". Sim in Eastern time should see Dec 1, 8:59 PM. Not checked in an Eastern-time browser.
3. **Track Record bands:** HH's note said 80/70/60; the page uses 90+/80-89/70-79/Under 70. Just noting what is there, not judging which is right.

## Pictures (docs/rebuild/pics/nov27/postswitch/, labelled; no red bands because no problem was found)
- `sheet-<device>-<light|dark>.jpg`: 12 pages per sheet, in order Home · My Team · Build · Battle · Damage Calc · Ratings · Garchomp / Winning Teams · Events · This Week · News · Track Record.
- `extras-<iPhone15|chr1440>-<light|dark>.jpg`: returning team · News · Gifts · info sheets (move/Ability/item) · Track Record · Spicy picks.

## Not checked
- Real devices.
- The live artifact itself: I swept a local build of the same files, which matched the live v2.js byte size.
- Below the first screen, only on Track Record and in the extras.

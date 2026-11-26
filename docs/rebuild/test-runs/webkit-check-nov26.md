# WebKit (Safari's engine) check of tonight's visual changes (HH's Job H), Thu Nov 26, 04:45-04:55 AM Eastern (`date`)
Looked and measured only. Nothing was fixed.

## Setup
- **Build:** design6 b96f3a5e with origin/alt/testrun-fit (b75244a8) and origin/alt/touches-pass3 (1e709b93) merged in locally. That merge is not pushed.
  - The two branches conflicted only in app/test/v2-minors.mjs (both added checks); both sides were kept.
  - Two builds: `node app/build.mjs --v2 --preview-data --art=../src/v2/art/`, and the public `--v2 --split --one-art-size --art=../src/v2/art/ --public`.
- **Engines:** Playwright 1.63.0 WebKit 2359 (scratchpad pwpkg, `PLAYWRIGHT_BROWSERS_PATH=<scratchpad>/pw-webkit`). Chromium 1243 from the same package was used for comparisons.
- **Serving:** over http, since WebKit blocks the web fonts on file://.
  - The preview build was served from app/ on 127.0.0.1:8913.
  - The public build was served from app/dist on 127.0.0.1:8914, with a symlink dist/src -> ../src so the sprites load.
  - Port 8791 was already taken by another server, so it was not used.
- **Devices:** iPhone 390x844 (isMobile, touch, 3x, iPhone UA), iPad 820x1180 and iPad landscape 1180x820 (isMobile, touch, 2x, iPad UA). Each was checked in light and dark.
- **Also checked:** Safari Mac sizes 1280x800 and 1440x900, for the move pills only (see item 1).
- **Every page in every size and theme (checked):**
  - no sideways scroll
  - no text cut by CSS ellipsis
  - no page errors
- **Limits (not checked):** not a real iPhone or iPad. Linux WebKit is not iOS Safari: the fonts and the header blur can differ on a device.

## Items
1. **My Team move pills: PASS.**
   - The pills appear only from 1280px wide: `.pty2-mv{display:none}` under 1280, team-frame.css:322. So on iPhone and iPad (390, 820, 1180) none are shown and none are cut (0 of 24 shown, measured).
   - Safari Mac, WebKit at 1280x800 and 1440x900, light and dark:
     - The sample team has no cut pill.
     - With the 4 longest names put in (Stomping Tantrum, Parabolic Charge, Population Bomb, Kowtow Cleave), none is cut.
     - Kowtow Cleave takes step 1 (font-stretch 87.5%); the other three take step 2 (75%).
   - The glyphs really narrow in WebKit. "Stomping Tantrum" in Instrument Sans measures 117.3px at 100%, 101.5px at 87.5% and 86.8px at 75% (measured with a test span on each device).
   - Picture wk-1 shows the narrowed letters, with Chromium in wk-2.
2. **Speed Tiers at iPad landscape 1180x820: PASS.**
   - The rule applies because the window is under 940 tall.
   - Each label (You, Them, Field, Weather) sits beside its chips: grid-auto-flow is column, and each label's right edge is left of its chips with the two vertically overlapping.
   - No chip is cut. Checked in light and dark (pictures wk-3 and wk-4).
   - On iPhone and iPad portrait the labels sit above the chips, as designed for those widths.
3. **Test Run rows: PASS.**
   - All 20 rows are present, with no overlap between the parts of any row.
   - Row heights:
     - iPad landscape: 77-106px (the 1100-1279 layout from alt/testrun-fit).
     - iPad portrait: 52-98px.
     - iPhone: up to 103px. Rows after the first few are behind "Show more", so they measure 0px.
   - Pictures wk-5 and wk-6.
4. **Track Record: PASS.** All 6 slips are inside the window on every device, with no sideways scroll (picture wk-7).
5. **/pokemon A to Z (public build): PASS, with one question and one minor note.**
   - Fonts load (Instrument Sans and Unbounded), no image is broken, and there is no sideways scroll.
   - The letter tabs sit in even rows: 6 x 4 on iPhone, 12 + 12 on both iPad sizes. The board shows 24 letters.
   - Picture wk-9.
   - **Unsure (both engines; it comes from the static HTML, not from WebKit):** the A to Z page's header has no Day/Night button and no Back button. The Pokémon pages have both. Headers checked on iPad: A to Z shows Home…Meta, Search and My Box; Garchomp shows those plus "Back to Home" and "Auto mode is on…". Picture wk-11. It may be by design (the page is static); I can't tell.
   - **Minor (both engines):** a slanted form chip can poke up to 2.6px past its row's rule line, because of the skew.
     - WebKit at 820: Chesnaught 2.3, Squawkabilly 2.2, Decidueye 0.5.
     - Chromium: Toxtricity 2.6, Chandelure 0.6.
     - Picture wk-12.
6. **Breadcrumb on a Pokémon page (public build, /pokemon/garchomp): PASS.**
   - It reads "Pokémon A to Z › Garchomp" on one line on every device.
   - The link is 112x44, so it meets the tap size. Picture wk-10.
   - Locally, the page's data requests (data/doubles.json and 4 more) return 404, because this server has no daily data. The page drew from its built-in data. Not checked with live data.
7. **Home's red top-10 band at iPad landscape 1180x820: PASS** (the old iPad check item 6 is fixed).
   - The score nearest the right edge ends 22.9px from it (91, Mega Floette); the next is 25.7px (94, Mega Charizard Y).
   - The rank numbers start 22.7px from the left edge, and the heading starts at 24px, so both sides are even.
   - WebKit and Chromium give identical numbers.
   - On iPhone every score ends 16px from the edge, the phone gutter.
   - Picture wk-8.
8. **Event names on Test Run: PASS.**
   - On every device the only cut name shown is "Buenos Aires Special…", which ends at a whole word (with touches-pass3's evShort).
   - On iPhone it wraps as "Buenos Aires / Special…" in the narrow column.

## Ranked fix proposals (nothing fixed)
1. **A to Z header without the Day/Night button (ask first).**
   - Reason: a visitor who lands on /pokemon can't switch the theme there, while every Pokémon page lets them. If it's deliberate (a static page with no script), leave it.
2. **Form chips poking 0.5-2.6px past the rule line (lowest priority).**
   - Reason: Sim has a sharp eye for edges. Room for the skew, for example a small `padding-right` on `.pd-list li` or `margin-right` on the last `.pd-form`, would keep the chips inside the line.
   - This is a look change, so it needs pictures and a yes.

## Scripts (scratch, not committed)
The scripts are .wk.cjs (devices and items), .wkpill.cjs (pills at Mac sizes), .wkband.cjs (top-10 band gaps), .wkpub.cjs (public pages) and .wkcrop.cjs.

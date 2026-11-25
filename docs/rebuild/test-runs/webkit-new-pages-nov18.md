# WebKit (Safari engine) check of the new pages, Nov 18

Written 3:26 AM, Wed Nov 18, 2026 (from `bash docs/rebuild/now.sh`). Look-only: no site code changed.
Code checked: claude/design6 at a90f919d ("Decision log: behaviour review findings"), so it includes the
Post Room Copy Code on the coupon and the post-band heading fix.
This resumes a helper stopped by a machine restart. Its pictures (webkit-*.png without "cur") are from an older build.
The new pictures are webkit-cur-*.png. Every picture has Chromium on the left and WebKit on the right.

## What was run

- Build: `cd app && node build.mjs --v2 --art=../src/v2/art/ --preview-data`, opened from app/dist.
- Engines: Playwright WebKit 26.6 (Safari 26) and Chromium 153, both headless on Linux.
- Pages: Home "The Stampede" (#home), Mystery Gifts (#gifts), News (#news), My Team (#team).
- Sizes: 390x844, 820x1180, 1180x820 and 1440x900, each in light and dark.
- For each page I took a first-screen shot, a full-page shot after scrolling to the bottom, and a dump of every text box's size.
  I then compared the two engines pixel by pixel and box by box.
- Fairness fixes, so only real engine differences show:
  - Chromium's 15px headless scrollbar was hidden; WebKit has none.
  - Both engines got the page from the same in-browser server (https://np.test/), because WebKit loads no web fonts from file://.
  - The herd art (`../src/v2/art/`, `art-s/`) was served too.
  - For the WebKit qcheck run I added an ignored symlink, `app/dist/src -> ../src`, so its server finds the herd art the way
    file:// does. Without it, WebKit's Home hero is a wall of broken-image boxes. That is a test-rig gap, not a site bug.

## Real Safari defects

1. **Stamp perforation draws as dotted rings in WebKit.** Measured on every size and theme, on Home's post band and the Gifts
   Stamp Sheet. Chromium shows a clean scalloped stamp edge. WebKit shows the plain rectangle with a ring of loose white dots
   outside it, which looks broken.
   - Likely CSS: `.pr-st` in `app/src/v2/css/sd-postroom.css` (lines 76-79), `mask: <rect>, <hole x4>; mask-composite: subtract,add,add,add`.
     WebKit composites `subtract` differently: in the old helper's test, a "simple 2 layer" subtract came out as an XOR in WebKit.
     An add-only mask (the old helper's case "k add only") looked the same in both engines. So the fix is a stamp-edge mask that
     only adds layers, for example tiled edge strips whose gradient makes the hole transparent.
   - I'm unsure whether real iOS Safari matches Playwright's Linux WebKit here. It is the same compositing code, so I expect yes,
     but an iPhone look is the proof.
   - Pictures: `webkit-cur-stamp-perforation-home-390.png` (zoom) and `webkit-cur-stamp-sheet-gifts-390-night.png`.
     Old ones: `webkit-stamp-perforation-home-390.png`, `webkit-stamp-perforation-gifts-820.png`, `webkit-mask-composite-test*.png`.
2. **Gifts at 1440: the Copy Code button drops under the code on the first parcel.** Measured: the row is 496px inside.
   - Chromium: code 309.9 + gap 16 + button 168.9 = 494.7, so the button fits beside the code by 1.3px.
   - WebKit: the 26px Unbounded code "LA1CTRA1N1NG27" is 314.0 wide, so 498.9 does not fit and the button wraps.
   - Result: that label grows by about 64px, and the two parcels in the row no longer line up.
   - Likely CSS: `.pr-crow{display:flex;flex-wrap:wrap;justify-content:space-between}` with `.pr-cv{font:800 var(--t26)...;letter-spacing:.04em}`
     (sd-postroom.css lines 36-38). The fit is knife-edge in both engines; WebKit's glyph advance is 4px wider.
   - Other sizes don't differ: the row wraps at 390 and 1180 in both engines and sits side by side at 820 in both.
   - Picture: `webkit-cur-gifts-copycode-wrap-1440.png` (old: `webkit-gifts-copycode-wrap-1440.png`).

## Differences judged harmless (or a Sim call, not a bug)

- **`text-wrap-style: pretty` wraps more lines in Safari 26.** Measured: with `text-wrap-style:auto` forced in WebKit, every
  case below matched Chromium exactly (Home 1180 page height 6517 went back to 6472).
  - The rule is `p,li,small{text-wrap-style:pretty}` in sugs.css line 294, plus `a,button,summary` on line 244.
  - Safari 26 supports `pretty` and balances the whole paragraph. Chromium only fixes the last line.
  - Where it shows:
    - Home 1180, tools band: some tiles go from 2 lines to 3 ("Try your team against the top teams", "The items and moves top
      players run") and the "How We Calculate" text gets 5 lines instead of 4. Tiles in a row still grow together.
    - Home 390 hero paragraph: different line breaks, same line count.
    - News 390 Classifieds: "For Hire" gets one more line, so both ads in that row are 132 tall instead of 112.
    - Gifts 820 and 1180: the "2026 Worlds Outfit Set (red cap and shirt)" stamp name is one line taller.
  - Nothing is clipped. iPhones and iPads on iOS 26 will show the WebKit wrapping, so that's the version Sim sees.
  - Pictures: `webkit-cur-home-tools-wrap-pretty-1180.png`, `webkit-cur-news-classifieds-wrap-pretty-390.png`,
    `webkit-cur-gifts-stamp-name-pretty-820.png` (old: `webkit-home-wrap-1180.png`, `webkit-news-wrap-390.png`).
- **Bottom bar blur (390).** In headless WebKit, the content behind `.np-bar` stays faintly readable ("Mega Charizard Y 94"):
  `backdrop-filter: blur(14px)` is not applied. Playwright's Linux WebKit has no accelerated compositing, and iOS Safari supports
  `-webkit-backdrop-filter`. My guess, not tested on a device: this is the test rig, not the site. Worth a glance on the iPhone.
  Picture: `webkit-cur-bottom-bar-390.png` (old: `webkit-bottom-bar-blur-390.png`).
- **qcheck-only differences.**
  - WebKit adds 18 "OVERLAP 97 x Sneasler / 97 x Rillaboom / 96 x Incineroar" findings at 820, 1280 and 1920.
  - Chromium reports the same plate pairs, in the other order, at other widths. The text line boxes measure the same in both
    engines to 1px, and the shots match.
  - So these are detector noise around the slanted hero plates, not a WebKit layout difference.

## Same in both engines (checked, no WebKit difference)

- Clip-path bands (hero, tools, post band): no pixel difference beyond anti-aliasing.
- svh hero height and the first screen: Score My Team and Build Me a Team are on the first screen at all four sizes in both.
  Pictures: `webkit-cur-home-first-screen-390-same.png`, `webkit-cur-home-first-screen-1440-same.png`.
  Headless has no Safari toolbar, so the real svh-vs-toolbar behaviour can only be seen on the iPhone.
- Herd layering: the same Pokémon in front of and behind the headline in both engines.
- The race (Speed Tiers) and Type Chart rows, parcel tilts (same transform matrix), and The Champions Dispatch paper at 1180.
- Sticky and fixed parts at scroll 0, 1200 and 2400: `.np-head` at 0, `.np-bar` at 787 (390 wide), and My Team's `.np-tabs`
  at 164 then 60 (390) and 76 (1440). Identical in both engines.
- My Team: three-across Hand at 390, the fold and the 1180 Hand. Page heights differ by 1px.
  Pictures: `webkit-cur-team-hand-1180-night-same.png`; old `webkit-team-hand-390-same.png`, `webkit-home-hero-1180-same.png`.
- **Re-checked fixes:**
  - The coupon's Copy Code (now the Post Room's button) is not clipped anywhere. I swept every `.pr-crow` on all four pages at
    the four sizes in both engines, and no ancestor clips the button. The old `webkit-both-dispatch-copycode-clipped-820.png`
    is from before the fix and no longer happens.
  - The post-band heading overlap is fixed: qcheck shows no overlap on "The post is in." in either engine.
- Same in both engines, not WebKit-specific (for triage, not part of this check):
  - On the News coupon at 1180, the code wraps as "LA1CTRA1N1NG / 27".
  - "Mega Charizard Y" in the board tag is clipped by `sds-board`, but only in Chromium (qcheck, 320 and 1280).

## Behaviour tests (WebKit)

Frozen-data art build (out/ from 0c992f69, `node build.mjs --v2 --art=../src/v2/art/`, copied, out/ restored):
`BROWSER=webkit PAGE=<copy> ADAPTER=v2 node app/test/behaviour/run.mjs A-team --only=HOME-01,HOME-06,HOME-07,HOME-10,HOME-10b,HOME-11`
Result line: `behaviour: 6 pass, 0 FAIL, 0 known bugs, 0 fixed?, 0 skipped; 48s  (webkit, adapter v2)`.
Plain meaning: Home's tagline, start buttons, Import, vs panel, sample-team note and empty-slot add all work in Safari's engine.

## qcheck

WebKit: `BROWSER=webkit ROUTES=home,gifts,news,team PAGE=app/dist/v2.html node app/test/qcheck-all.mjs`
Result line: `qcheck-all: 4 pages + 10 views x 5 widths x 2 themes, 132 findings, 132 new; 690s`.

For comparison, the same run in Chromium: `qcheck-all: 4 pages + 10 views x 5 widths x 2 themes, 118 findings, 118 new; 555s`.

Plain meaning:
- "All new" only means `qcheck-known.json` has no entries for these pages yet; it holds 111 entries, none for home, gifts or
  news.
- 112 findings are the same in both engines:
  - Home: overlaps by design (headline over the herd plates, "The Champions" x "Dispatch", "113" x "events"), off-scale fluid
    sizes, and the "All Ratings ›" tap height.
  - Gifts: "CONTENTS" over the name on two labels, and source links 16-19px tall.
  - News: the "All Mystery Gifts ›" tap height.
- WebKit-only: the 18 hero-plate overlap reports above (detector noise), plus "/100" measured at 36.8px instead of 36.2px.
- Chromium-only: 4 "Mega Charizard Y" clips plus "/100" at 36.2px.
- My Team: 0 findings in both engines.

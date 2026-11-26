# The Receipt with WOW: three variants (Job X), Thu Nov 26, 2026, 12:59 PM Eastern (now.sh)
HH's helper, proposing under HH's design authority. **Sim picks; nothing merges without his yes.**
- Branch: alt/public-home-v2, on alt/public-home-v1 63fd71fc.
- Built with `--home=a1|a2|a3` (or `PUBLIC_HOME=a1|a2|a3 node public-site.mjs <dir>`). Every other build is unchanged.
- Data: origin/main 03cd5e41's out/, restored after and not committed. Nothing was published or deployed.

Sim (Nov 26): "i like the receipt but it has no wow factor". Each variant keeps A's words, its h1 and the pink Score My Team on the first
screen at 1440x900 and 390x844. Each pushes ONE idea on the real champion's receipt (Alpensee Tour (Reg M-C) #85, Nov 25: Strength Score 87,
Tournament ready).

## a1. It prints (RECOMMENDED)
- **The idea:** a slim slanted ink till slot ("NastyPlot · Strength Score till", a blinking pink light) sits at the top of the receipt column.
- **What plays, about 2.6 s:**
  1. The paper feeds out from under the slot.
  2. The six lines type in one by one, each with its dot leader and Rating.
  3. The Plot-blue score bar fills (ticks at 60, 70, 80, 90).
  4. The **87 lands huge** with an overshoot.
  5. The red "Reg M-D · Dec 2" stamp **slams** onto the paper, and the paper shakes.
- **How it behaves:**
  - It plays once per visit, starting when today's receipt first draws. A redraw mid-print carries on from where it was, because the delays are offset by the time already played.
  - "Skip the printout" (a real button on the slot) prints it at once.
  - Under reduced motion it shows the printed receipt with no animation.
  - The paper keeps a fixed minimum height, so the blank till before the data arrives and the printed receipt are the same size: nothing moves.
- **Why I recommend it:**
  - Every visitor gets the wow with no effort, and it tells the product's story in order: your six → their Ratings → the score → Reg M-D.
  - It adds the most to the receipt Sim already liked.
  - It stays light: one CSS animation set, no new data.
- **Pictures:**
  - a1-prints-strip-1440.jpg and a1-prints-strip-390.jpg: 7 frames at 0, 450, 900, 1350, 1900, 2450 and 3300 ms. These stand in for the screen recording; no video tool is installed here.
  - a1-prints-reduced.jpg
  - first screens: light and dark, at 1440 and 390

## a2. Your turn
- **The idea:** the front page scores your team.
  - The champion's receipt (left) sits beside an empty "Yours" receipt with six numbered slots.
  - Below them, today's top 12 Pokémon are slanted tiles. Tap one and it drops onto your receipt; tap it on the receipt to take it off.
  - Your receipt prints the live Strength Score and its band, "so far" until all six are in.
- **Real scoring:** the same calls as My Team (memberOf, assignItems, prepOf, proChecks, CH.gradeOf), with each Pokémon on its most common tournament set (rule 20).
- **"Finish on My Team"** opens `#team=<code>` in the site's own team-link format. My Team's banner asks "Replace" before it changes anything.
- **Kept for the visit only:** nothing is saved (privacy rule 22).
- **Weak spots:**
  - The first screen is busier than a1's.
  - At 390 the page is 4.07 screens (the picker adds a screen).
- **Pictures:** a2-yourturn-three-picked.jpg and a2-yourturn-six-picked.jpg; first screens light and dark, at 1440 and 390.

## a3. The long receipt
- **The idea:** one giant thermal receipt down the whole first screen, tilted 2°, with a faint print-line texture.
  - The **87 is printed enormous** across it.
  - It carries the bands strip and "Tournament ready · /100".
  - Its foot turns away under the edge (a 3D curl).
- **The barcode IS the champion's team code:** each character is drawn as a bar. It is a link to `#team=<code>`, so clicking it loads that six (after My Team's "Replace" question).
- **The perforated "Tear here" stub (notched ends) is the page's Score My Team.**
  - When the layout stacks (under 1180 px), the button moves up beside the words, so it stays on the first screen at 390.
  - The stub then keeps a plain link, so only one pink move shows on screen.
- **Weak spots:**
  - It is the tallest first screen: the stub's button ends at 855 px of 900 at 1440x900.
  - The left column has room to spare at 1440.

## Checks (each could fail)
**Basics:**
- `node app/test/v2-guard.mjs`: "v2 guard: clean (...)". It also runs inside every build.
- `SEO_DIST=site-a1|a2|a3 node app/test/seo-check.mjs`: "seo-check: ALL PASSED", exit 0, for each variant, including "3c. exactly one <h1> on all 28 rendered routes (all ok)".

**First screens** (t-scripts/shoot.cjs, 1440x900 and 390x844, light and dark, after the print):
- 0 errors and one h1 in all 12 runs.
- Page length in screens:

  | Variant | 1440 | 390 |
  |---|---|---|
  | a1 | 1.85 | 3.48 |
  | a2 | 1.82 | 4.07 |
  | a3 | 1.98 | 3.72 |

**Every width** (t-scripts/widths.cjs, after the print):
- Widths: 320, 360, 414, 600, 768, 900, 1024, 1180, 1280, 1366, 1600, 1920 and 2560, each in light and dark.
- It checks: no sideways scroll, nothing past the edge, one h1, no errors, no clipped Pokémon name, and that a visible Score My Team exists.
- a1, a2 and a3 each: "failing 0".
- Fixed on the way (failed earlier):
  - names cut at 320-414 and 768-1180;
  - a2 kept two columns on phones;
  - a3's Score My Team was off the first screen on phones and tablets;
  - a3's curl stuck out at 600-1024;
  - stamps were clipped on phones.
- Score My Team's bottom edge at 390x844: a1 463 px, a2 463, a3 393.

**Behaviour** (t-scripts/xcheck.cjs):

| Check | Result |
|---|---|
| a1 CLS, motion on, 1440 | **0.0000** |
| a1 CLS, motion on, 390 | **0.0194** (was 0.137 and 0.312 before the fixed paper height and top-aligned copy) |
| a1 after the print | no running animation, Skip gone, 0 errors |
| a1 Skip at 0.6 s | "still playing false, Skip button false, the 87 opacity 1, stamp opacity 1" |
| a1 reduced motion at 0.3 s | "receipt animations 0, the 87 opacity 1, paper transform none" |
| a2 picks 1-6 | "74 Solid, 72, 77, 77, 78, 79 Solid", each redraw 26-164 ms |
| a2 Finish link | decodes to exactly the six picked ("same as picked: true"); following it shows My Team with its "Replace" banner |
| a2 CLS / errors | 0.0000 / 0; focus stays on the receipt after a pick |
| a3 barcode | "decodes to the champion's six: true (Charizard-Mega-Y, Aerodactyl-Mega, Garchomp, Farigiraf, Sylveon, Kingambit)"; clicking it shows My Team with "Replace" |
| a3 CLS | 0.0000 |

**Not checked:** WebKit / a real iPhone, a screen reader pass, the design-review skill, and the full v2-minors and behaviour tests (no default build changed).

## Found on the way (affects today's public build, not just these variants)
**The public site draws once with its built-in (Nov 1) numbers before today's data arrives.**
- **Checked:** a timeline on the a1 build shows `V2._dataOk` true at 235 ms while META.events is still empty. The day's data swaps in at about 1.1 s.
- **Cause, by code:** shell.js V2.dataReady reads `window.__NP_CLAUDE || window.claude`. On nastyplot.org neither exists: the /data/ loader in 03-persistence.js is a local variable. So "no data store" makes the page ready at once.
- **Effect:** old numbers flash for about 1 s on every public visit. That is part of today's public Home CLS (0.04 at 390, Job W) and the a1/a3 jumps I fixed above.
- **Possible fix (not applied):** in public mode, wait for the /data/ documents like the Claude build waits for the store.

## Pictures (docs/rebuild/pics/nov26/public-home-v2/; labelled; a1's have the green RECOMMENDED band)
- a1-prints-1440-light / -dark, a1-prints-390-light / -dark, a1-prints-strip-1440, a1-prints-strip-390, a1-prints-reduced
- a2-yourturn-1440-light / -dark, a2-yourturn-390-light / -dark, a2-yourturn-three-picked, a2-yourturn-six-picked
- a3-longreceipt-1440-light / -dark, a3-longreceipt-390-light / -dark

## For Sim
1. a1, a2, a3 or a mix? My recommendation is a1: every visitor gets the wow, and it is the receipt he liked, brought to life.
2. If a1: keep a3's working barcode on the printed receipt? It would make the receipt load the champion's six.

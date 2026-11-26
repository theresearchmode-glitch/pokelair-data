# nastyplot.org front page, proposal v1 (Job V), Thu Nov 26, 2026, 11:43 AM Eastern (now.sh)
HH's helper, under HH's design authority **to propose only**. Nothing merges without Sim's pick. Branch alt/public-home-v1, built on
alt/after-batch 802b490c. Data: origin/main 03cd5e41's out/ (today's), restored after and not committed. Nothing was published or deployed.

## Who lands on nastyplot.org, and what the first screen must do
- **Who:** players coming from Google. They type "Pokémon Champions team builder", "team rater" / "Strength Score",
  "Reg M-D tier list", "Pokémon Champions damage calc". Launch week (Dec 2-3 quiet launch) is when people search "Reg M-D" most.
  Many are on phones; some are kids (rule 22: nothing asked of them).
- **The first screen must:**
  1. say in their search words what this is (one h1);
  2. give the one main move (Score My Team) without scrolling, at 1440x900 and at 390x844;
  3. show real proof that the numbers are live (today's data, real teams);
  4. say what Reg M-D changes;
  5. link the tools they came for.
- **Today's front page (The Stampede, checked):**
  - The h1 is "THE POKÉMON CHAMPIONS COACH Sharply raise your win rate." It has no search words except "Pokémon Champions".
  - At 390, the page is 8.41 screens long.
  - Its two buttons and the line saying what NastyPlot is sit below the fold on a phone.
  - Pictures: today-stampede-*.jpg.
  - It stays as the Claude site's Home. These proposals are for the public build only (`--home=a|b`).

## A. The Receipt (RECOMMENDED)
**One creative idea:** your team, checked out like a till receipt. The first screen prints the real receipt of the six that just won a
tournament (today: Alpensee Tour (Reg M-C) #85, Nov 25, 128 players). It shows:
- each Pokémon with its held item and its Rating;
- the total line, **Strength Score 87/100**, with its band word ("Tournament ready");
- the five bands as a slanted plot strip.

A red rubber stamp, "Reg M-D · Dec 2", sits on its corner. The copy beside it says "Add your six" with the pink **Score My Team**.

**h1:** "Rate your Pokémon Champions team *before Reg M-D.*" The ending changes by itself:
- after Dec 2 it reads "for Reg M-D.";
- later it names the current regulation.

**Below the fold:**
- h2 "Pokémon Champions tier list, *right now.*": the top 10 as receipt lines with plot bars. Each line is a real link to /pokemon/<name>.
- h2 "Every tool, *one site.*": Damage Calc, Speed Tiers, Usage Stats, Winning Teams, Test Run, Mystery Gifts.

**Why it isn't "any other site":**
- Tier-list sites all open on a grid of sprites. Calculators open on a form.
- No one else can print a *receipt for a team*, because no one else has a Strength Score.
- The receipt is our receipt motif. The paper is the Dispatch paper, which goes "Lamplight" cream at night.
- The rest is the kit's slanted boxes, Unbounded slanted headline and Plot-blue numbers, with Nasty pink only for the one move and the stamp.

**Why I recommend it:**
1. It sells the product Sim said to focus on (the Strength Score) in the first two seconds.
2. It works on Reg M-D day one, when there is no M-D tier list yet. A team rater still answers "is my team ready?".
3. The proof on screen is real: a real winning six, scored by our own code.

**Weak spots (honest):**
- The receipt is cream on the cream day page, so it separates by shadow and tilt only.
- At 390 the receipt starts below the fold. The main move is above it.

## B. The Tier Wall
**One creative idea:** the live top 10 as slanted white plot bars racing across the PLOT-blue band:
- the length is the Rating;
- the sprite rides the end of its bar;
- the big Unbounded number sits after it;
- #1 is the only Nasty-pink bar.

The h1 and the pink **Score My Team** sit on the left. A red flag says "Reg M-D in 6 days. This list switches to Reg M-D once 20 Reg M-D events are in."

**h1:** "Pokémon Champions tier list, *rated by who wins.*" The kicker reads "Reg M-C · Live tier list · updated 5 h ago".

**Below the fold:**
- h2 "Your six, *on the same scale.*": the five bands in words, and the last champion's six as a box: "87, Strength Score of the six that won …".
- Then Build Me a Team, and the tools row.

**Why it isn't "any other site":**
- Others show tier lists as letter rows (S/A/B) of sprites.
- Ours is a plot: bars with real numbers, our slant and our blue band. The bars come from our "plot bars" motif and The Stampede's band shape.

**Weak spots (honest):**
- It leads with a tier list, and in launch week that list is still Reg M-C's. The flag says so, but the h1 can't honestly say "Reg M-D tier list" until 20 events are in.
- The Strength Score, our real difference, comes second.

## Checks (each could fail)
**Guard:** `node app/test/v2-guard.mjs` printed "v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale,
colours only in tokens.css)". It also runs inside every build.

**seo-check:** `SEO_DIST=site-<x> node app/test/seo-check.mjs` on the real public folder that `public-site.mjs` makes (`PUBLIC_HOME=a|b`). It reported "seo-check: ALL PASSED", exit 0, with 14 PASS lines, including
"3c. exactly one <h1> on all 28 rendered routes (all ok)". Folders checked:
- today's site
- site-a
- site-b

**Load, at 1440x900 and 390x844, light and dark (script t-scripts/shoot.cjs):**
- 0 errors in all 8 runs.
- one h1 in all 8 runs.
- Measured:

| Direction | 1440 | 390 |
|---|---|---|
| A | 1.74 screens | 3.37 screens |
| B | 1.55 screens | 2.86 screens |
| Today (for comparison) | 3.97 screens | 8.41 screens |

**Every width (rule 15), script t-scripts/widths.cjs:**
- Widths 320, 360, 414, 600, 768, 900, 1024, 1180, 1280, 1366, 1600, 1920 and 2560, each in light and dark.
- It checks: no sideways scroll, no element past the edge, one h1, no page error, no clipped Pokémon name.
- A: "failing 0". B: "failing 0".
- Two earlier runs did fail and were fixed:
  - A cut names at 320, 768 and 1180-1366. Fixed by letting a name take two lines, a 1-column list at 1180-1439, and smaller lines under 385.
  - B cut "Mega Charizard Y" at 320 and 360. Fixed with a smaller bar name under 385.

**Main move position:** the pink button's bottom edge is at 437-650 px at every width (inside a 900 px screen). It is above the fold everywhere.

**Not checked:** WebKit / a real iPhone, tap sizes by test (rows are 48-56 px by CSS), keyboard order beyond the focus styles, a design-review skill pass.

## Found on the way (not part of either design)
- **The public "/" has no h1 and no words in its static HTML.** The static first screen is the "Getting today's numbers" panel in both the
  current site and the proposals: `<main>` starts with `section.np-loading`. Google renders JavaScript, so seo-check (which renders) passes.
  A crawler that doesn't run JS sees no headline. Possible fix, not applied: pre-render Home with the day's data at deploy time.
  I first thought the static h1 was "This page didn't load."; that string only runs if v2.js fails. My mistake, corrected here.

## What is on the branch (proposal only)
- **app/src/v2/pages/pubhome.js:** both pages (V2.phA, V2.phB) on the kit's parts (k-kicker and k-h1 classes, V2.kGo, V2.kBtn, V2.kLink) and the site's own data
  (ratedRows, lairRank, homeChamp, CH.gradeOf, mdCountdown, freshAgo). No new data.
- **app/src/v2/css/pubhome.css:** tokens only.
- **tokens.css:** 3 display sizes (--d-pha, --d-phb, --d-phn).
- **home.js:** draws A or B only when `window.NP_HOME` is set.
- **build.mjs:** `--home=a|b` sets it.
- **public-site.mjs:** `PUBLIC_HOME=a|b` passes it through.
- Without the flag, every build is unchanged. Not checked by a full test run: v2-minors and behaviour were not run, because no default build changes. GitHub will run them on the push.

## Pictures (docs/rebuild/pics/nov26/public-home-v1/, labelled; A's labels say RECOMMENDED, on a green band)
- A-receipt-1440-light / -dark, A-receipt-390-light / -dark, A-receipt-1440-light-full (whole page)
- B-tierwall-1440-light / -dark, B-tierwall-390-light / -dark, B-tierwall-1440-light-full
- today-stampede-1440-light, today-stampede-390-light (for comparison)

## For Sim to decide
1. A, B, or neither as the public front page? (Recommendation: A. It shows the Strength Score first and works on Reg M-D day one.)
2. Keep The Stampede's hero art (the crowd) anywhere on the public front page? Neither proposal uses it above the fold.
3. OK to pre-render the public Home with the day's data (so its static HTML has the h1 and words)?

# nastyplot.org Home: Final 3, "Plot Receipt on the night panel" (Job BB), Thu Nov 26, 2026, 2:15 PM Eastern (now.sh)
HH's helper. Sim picked Final 3. Nothing is merged or published.
- **Branch:** alt/public-home-f3, on origin/claude/design6 58137089. Merge batch5 when it lands.
- **Source of truth:** docs/rebuild/mockups/hh-receipt-nov26/index.html?v=11 on alt/t3-pending (F3.png, F3p.png).

## What it is
- **The public build's Home only:** home.js draws `V2.f3Page()` when `window.__NP_PUBLIC`. The Claude build keeps The Stampede until Sim says.
- **Files:**
  - app/src/v2/pages/pubhome-f3.js
  - app/src/v2/css/pubhome-f3.css
  - `--f3-*` tokens in tokens.css: the night panel, rays, halftone, paper, each type's bar colour as Sim saw it, and the ink that reads on it.
  - parts-v2.json and home.js changes.
- **Kept from the mock-up:**
  - The slanted night panel (#14131C) with thin blue/pink rays and halftone.
  - The white zig-zag receipt (edges top and bottom).
  - Each row: name, item and type chip.
  - Each Rating as a type-colour slanted bar running out across the panel, with the Pokémon riding its end. Both glow in the type colour.
  - 87/100 + "Tournament ready", and the "Reg M-D · Dec 2" stamp.
  - The h1 "Rate your Pokémon Champions team *before Reg M-D.*" It becomes "for Reg M-D." from Dec 2 (checked with a Dec 3 clock).
  - Score My Team + Build Me a Team, the Reg M-D line, the type legend.
  - Under 1280 px the bars sit under each name inside the receipt (F3p).
  - On the kit: k-kicker, k-h1, k-lead, V2.kGo, V2.kBtn.
- **Real data, not the mock-up's six:**
  - The latest event winner (homeChamp, the team The Stampede shows) and its Strength Score, from the same calls as My Team.
  - Today that is Alpensee Tour (Reg M-C) #85: 87, Tournament ready. Its items come from the data (Charizardite Y, Aerodactylite).
  - Farigiraf's chip says Normal: its first type. The mock-up said Psychic.
- **Edge cases (checked by serving changed data):**

  | Case | What the receipt shows |
  |---|---|
  | No event winner | Falls back to the top Winning Teams entry: "Winning team · 2027 Latin America … · 652 players", score 77 |
  | Nothing at all | "No winning team in today's data yet. The receipt prints after the next event." No bars, no stamp |
  | From Dec 2 while the data is still M-C | "The last Reg M-C winning team · Alpensee Tour (Reg M-C) #85 …", h1 "…for Reg M-D.", no Dec 2 stamp |

- **Accessibility:**
  - Each bar is a link to its Pokémon's page with aria-label "Mega Charizard Y, Rating 94".
  - Chip words and Ratings use white or ink, whichever reads on that bar. Small words get the higher contrast. Big Ratings are white where they keep 3:1, ink on the light bars, so Fairy's "85" is ink, not the mock-up's white.
  - The legend has a hidden "The bar colours are the types of the winning six" for screen readers.

## Checks (each could fail)
| Check | Result |
|---|---|
| v2-guard | "v2 guard: clean (...)" (it first found 11 issues: names, scale, grid; all fixed) |
| Every width (t-scripts/f3w.cjs): 320, 360, 390, 414, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1600, 1920, 2560 × light/dark | "failing 0" |
| Score My Team bottom edge | 673 px at 1440x900; 492 px at 390x844 |
| WebKit 1.63 (iPhone 15 and iPad Pro 11, portrait and landscape, light and dark) | sw = width, Score My Team on the first screen (492 / 426 / 476 px), 0 bars past the edge, 0 broken pictures, 0 errors |
| CLS, motion on | 0.0000 at 390, 0.0124 at 1440 |
| Reduced motion | "animations in the hero 0", stamp opacity 1 (the printed state) |
| Keyboard | Tab order: Score My Team → Build Me a Team → the six bars, each with a focus ring. Bars are `A` links to /pokemon/<name> |

The every-width check tests: no sideways scroll, no clipped name, item, chip or event line, every bar, Rating, art and stamp inside the panel (wide) or the receipt block (narrow), and no words running under the panel's slanted edge (each line of text measured against the edge at its height).

It failed twice on the way:
1. At 1180 the art and stamp ran past the edge. The wide layout now starts at 1280.
2. At 1280–1600 the lead, the Reg M-D line and "Build Me a Team" ran under the panel edge. The panel moved from 40% to 44%, and those blocks are now capped at `44vw - gutter`.

**GitHub's order** (frozen data 0c992f69), all exit 0:
- v2-public: all passed
- seo-check: ALL PASSED (twice: after v2-public and after the --split build)
- public-build-test: PASS
- pokemon-pages: all passed
- static-pages: all passed
- pub-links: all passed
- security-csp --self-test: PASS
- --split build, then security-csp: "4 hashed inline scripts … 0 CSP violations … XSS blocked"
- privacy-public: all passed
- v2-today: "all passed (28 s)"
- public-site-test (today's data): all passed

**prerender (Job W):** in a scratch worktree, this branch + alt/prerender-home merged cleanly. Public build: `public: static words for 24 pages (home: Rate your Pokémon Champions team before Reg M-D.)`, and prerender-test "all passed":
- "/: one <h1> with real words without scripts (1: ["Rate your Pokémon Champions team before Reg M-D."])"
- the intro line "Add your six. NastyPlot rings it up…"
- the page links and the top 10

Job W's `home.seo` reads the drawn h1 and the `.k-lead` line, so this Home needs no change for it.

**Not done:**
- A screen reader pass by ear (labels checked by code and DOM only).
- The full v2-minors and behaviour suites: the Claude build's Home is unchanged by code.
- A real GitHub run: the commits carry [skip ci] until batch5 is merged in and HH wants the real run.

## Pictures (docs/rebuild/pics/nov26/public-home-f3/, labelled)
- before-/after- × 1440/390 × light/dark: today's public Home (The Stampede) vs Final 3
- after-390-light-full, after-1440-dark-full
- after-webkit-iphone15-light, after-webkit-ipad-landscape-dark

## Notes for HH / Sim
- **Night mode:** the panel (#14131C) sits on the night page (#12121B), so its slanted edge almost disappears. The mock-up does the same; the rays and receipt carry it. Say if Sim wants a lighter panel by night.
- **Tablets (700–1279):** the stacked layout's bars are long (they run the receipt's width). That is like F3p, only wider.

# Pictures on the info sheets + Natures: hand-off for the build (Nov 23)

Designed and mocked up by the "Dossier" chat. Sim approved it. The main chat builds it, one step at a time, with its usual checks.
These are **mock-ups only**: nothing on the site was changed. The mock-ups inject into the published Preview (design6, sheets already
built in `pages/infosheet.js` + `css/infosheet.css`). The scripts in `tools/` are a **reference** for markup and CSS, not code to paste in.

## Sim's decisions (Nov 23, times from the PC's Windows clock, Eastern)
- **Round 1 (pictures), 4:33 PM, Sim: "your recommendations are fantastic. lets polish and move forward":**
  - **Q1 Moves = A, the type seal.** A slanted tile (skewX -10deg, corner 10px, 84px; 64px on phones) in a deeper shade of the move's
    type colour (`color-mix(in srgb, var(--ty-X) 62%, #000)`), the white type symbol (52px) from the existing `#kty-<Type>` sprite
    (type-icons.js, MIT, already approved Nov 21), left of the name inside the tab. The small symbol in the type chip stays.
  - **Q2 Abilities = A, the ID photo.** The Pokémon most often seen with the Ability (the first "Usual suspects" row) as a photo stapled
    to the ID card: a light photo card (#F4F0EA, 92px wide, rotated -3deg, a grey staple on top), the sprite on a pale blue backdrop,
    caption "MOST SEEN" + the Pokémon's name. Decorative (aria-hidden); the name is already in the Usual suspects list.
  - **Q3 Items = our own drawn symbols** in an "evidence bag" (a clear bag with a dashed zip line, rotated 3deg) clipped to the tag.
    **No game item art.** See "Item pictures: the source check" below for why.
- **Round 2 (natures), 4:38 PM+, Sim: "nature sheet looks fantastic"** → the nature sheet is approved.
- **4:42 PM, the Natures page (Q5) approved** (Sim: "yes build the natures page too and your recommendation is good"), under Meta as recommended.

## 1. The picture on each sheet
| Sheet | Picture | Where it comes from | When there's none |
|---|---|---|---|
| Move (case file) | Type seal | `#kty-<Type>` | Typeless moves: no seal (none in Reg M-C today, check) |
| Ability (ID card) | ID photo, "MOST SEEN" | top user from the usage table (`V2.infoUse('ab', n).u[0]`) | Under 50 teams (no Usual suspects): show the fingerprint only, no photo. Don't guess a Pokémon. |
| Item (evidence tag) | Drawn symbol in an evidence bag | new SVG set (below) | An item without a drawing yet: the bag stays out (no empty bag) |
| Nature (psych profile) | ▲ raised stat over ▼ lowered stat | the stat colours `--st-atk` etc. | Neutral natures: one grey tile "▲▼ Speed / cancel out" |

Night mode: all four checked in night (pictures in the folders). The seal, photo card and bag keep their own colours in night.

### Item pictures: the source check (look-only research, Nov 23)
- Every real item icon is © Nintendo / Game Freak / The Pokémon Company. No fan repo or wiki can give permission:
  - Showdown (smogon/pokemon-showdown, smogon/sprites): code MIT; "The sprites themselves are property of Nintendo / Game Freak / The
    Pokémon Company"; asks people to talk to them first. Only source checked that has the new Champions Mega Stones.
  - PokéAPI sprites, msikma/pokesprite (only up to Sword/Shield): the art is not theirs to license.
  - Bulbagarden Archives: "Images should not be direct-linked from other sites" / for Bulbagarden projects. Serebii: not allowed.
  - Ripping from Pokémon HOME / Champions: not an option.
- The Pokémon Company: no general fan-site permission for game art found (pokemon.com/us/legal covers personal, non-commercial fan art).
  Unsure: pokemon.com/terms-of-use couldn't be read (bot wall).
- So, with Sim's ToS rule, **own drawn symbols are the only route with no risk**. Not legal advice.
- Note for Sim (not decided here): the site already shows Pokémon art (sprites/HOME renders), which has the same standing as item art.

### The drawing job (measured from items-list.js: 166 items)
- **81 Mega Stones**: one stone shape, coloured by the Mega's main type (the type colour tokens), maybe the type symbol inside.
- **28 berries**: one berry shape; colour per berry (the type-resist berries in their type colour).
- **57 other items**, which can share shapes: 5 terrain/weather seeds-and-rocks families (Electric/Grassy/Misty/Psychic Seed; Damp/Heat/Icy/Smooth Rock),
  the type-boost items (Charcoal, Mystic Water, Magnet, Spell Tag...), plus ~30 unique drawings (Focus Sash, Life Orb, Leftovers, Sitrus...).
- Rough size: about 40 distinct drawings. One consistent flat style, the site's colours, readable at 48px. Start with the most-used
  ~20 items; the rest show no bag until drawn.
- Samples in the mock: Focus Sash, Sitrus Berry (`tools/mock.cjs`, `IT_DRAW`). Sim should see a sheet of drawings before they ship.

## 2. The Nature sheet ("psych profile"), the fourth case-file kind (approved)
Kicker **"PSYCH PROFILE · NATURE"**. The tab is a **clipboard**: cream paper `#FBF8F0` with faint ruled lines (rgba(0,104,173,.14) every 28px),
a 2px margin line and a skewed pencil underline under the name in the **raised stat's colour**, a metal clip on top (grey gradient),
dark ink in day and night. Giant outlined name behind (as the other kinds). Small stamp, hidden under 700px:
"HITS HARD" (Atk/SpA up), "QUICK TEMPER" (Spe up), "TAKES ITS TIME" (Spe down), "THICK SKIN" (Def/SpD up).
Top to bottom:
1. Tab: picture (▲ ATK / ▼ SPA), kicker, name (t34/t28), sub "Nature" (or "Neutral nature"), share "26% of tournament Pokémon".
   (Round 2 polish: the small ▲/▼ chips under the name were dropped; the picture and the stat strip already say it.)
2. One plain sentence: "Raises Attack by 10% and lowers Sp. Atk by 10%." Neutral: "Raises and lowers the same stat, so it does nothing."
3. Stat strip: Raises, Lowers, Pokémon run it, Teams. Neutral: only Pokémon run it and Teams.
4. "On the field." auto lines (rules in `tools/mock-natures.cjs`, `LINES`): "<Up> ×1.1, <Down> ×0.9. HP is never changed"; Adamant/Modest
   "the usual pick for physical/special attackers"; Speed up "outspeeds the same Pokémon with a neutral Speed nature"; Speed down
   "for Trick Room, where the slower Pokémon moves first"; Def/SpD up "for bulky support Pokémon"; Def/SpD down "rare in doubles".
   Sim should read these lines before they ship.
5. Usual suspects (same component, 50+ uses rule). **Not for neutral natures** (their few users are almost certainly mistakes).
6. Links: "Speed Tiers ›" for Speed natures, else "Try It in the Calc ›"; "All Natures ›" (only once the page exists).
- Share wording: "of tournament **Pokémon**" (a nature belongs to one Pokémon, not a team). Under 20: "Rarely used (on N Pokémon)".
- Opening: every nature name on the site becomes a button (monsheet, pokemon.js:67 Nature row, team.js, sets.js, calc, build sheets),
  like `V2.kAbil`; search finds natures and opens the sheet.

## 3. The Natures page (approved 4:42 PM)
Under Meta (my recommendation: it's meta data, like Usage). "META · NATURES" kicker, headline "Natures.", one line:
"Every nature raises one stat by 10% and lowers another by 10%. Four natures cover 76% of tournament Pokémon."
- **The grid:** 5×5, rows = stat raised (▲ chips), columns = stat lowered (▼ chips). Each square: name, % of Pokémon, "Top: <Pokémon>".
  Fill = the raised stat's colour at opacity sqrt(pct/max) (min .06); white text on the dark ones. Neutral diagonal striped, "changes nothing".
  Every square opens its sheet. Phone: no row-header column; each square gets a 3px left edge in its raised stat's colour; name + % only.
- **The line-up:** the top 12 natures, two columns on desktop, one on phone: rank, name, ▲/▼ chips, top 3 users (sprite, name, %;
  phone: sprite + % only), % of Pokémon.
- Measured length: desktop 2.2 screens (1440), phone 2.95 screens (390).

## 4. Data (measured, `tools/natures.mjs` → `tools/natures-28.json`)
- Source: the raw Online tournament sheets `data/t2/` (field `nt` on each Pokémon), same KEEP filter as meta_tour, last 28 days
  (Oct 21 – Nov 18): **7,870 teams, 47,220 Pokémon, 47,207 with a readable nature**.
- Top: Adamant 26.4%, Modest 22.6%, Timid 14.7%, Jolly 12.5% (= 76.2%), Bold 6.4, Calm 4.0, Careful 3.0, Quiet 2.6, Impish 1.9,
  Sassy 1.9, Brave 1.7, Relaxed 1.7. Everything else under 0.3%.
- Misspellings to fold: "Adament" (9), "Admanant", "adamat", "Adaman", "Modeste"; match case-insensitively.
- Names must go through `canonSet` and `nameOf` (the mock maps "Eternal Flower Floette" → Floette-Eternal, "Indeedee ♀" → Indeedee-F by hand).
- Compute it in update.mjs with the move/item/Ability usage table (same shape: `t`, `N`, top users with totals).
- The 25 names: data.js `SETS.NAT`; the up/down table: 39-damage-calc-speed.js `NAT_UP` / `NAT_DN`.

## 5. Open questions and concerns
2. **Sim: the hand-written "On the field" nature lines** — read before shipping.
3. **Sim: the item drawings** — a sheet of the first ~20 drawn symbols for his OK before any ship.
4. **Unsure: Champions nature rules.** Not checked whether Champions changes anything about natures (e.g. changing one in-game, a cost).
   The ±10% matches what the site already says ("a Speed nature adds 10%"). Check the champions mod / official pages before writing more.
5. **Site bug found on the live Preview (not fixed here):** the Levitate sheet says "Pokémon run it 12" but "Can have it 11", and lists
   **Mega Garchomp Z at 2%** under Levitate users. One of these numbers is wrong (likely Ability names on Mega forms in the usage table).
6. Ability ID photo: when the top user is a Mega form, the photo shows the Mega (that's fine, it is the most seen). Thin Abilities get no photo.
7. Items: the 7 items not in Champions (Safety Goggles, Covert Cloak, Clear Amulet, Loaded Dice, Choice Band/Specs, Assault Vest) aren't in
   items-list.js, so they need no drawing.

## Suggested build order (one change at a time, each with a picture for Sim and its checks)
1. Move type seal. 2. Ability ID photo. 3. Nature data in update.mjs + the Nature sheet + tappable natures + search.
4. Item drawings (after Sim OKs a drawing sheet). 5. The Natures page (approved; its square and line-up open the nature sheets, so it comes after step 3).

## Files
| Path | What |
|---|---|
| `r1-labelled/` | Round 1: picture options (move A/B, ability A/B, drawn items, phone) |
| `r2-labelled/` | Round 2: nature sheet (day, night, phone, neutral) and the Natures page (desktop, night, phone) |
| `tools/mock.cjs` | Round 1 mock (markup + CSS reference) |
| `tools/mock-natures.cjs` | Round 2 mock (nature sheet + page, markup + CSS reference, the LINES rules) |
| `tools/natures.mjs`, `tools/natures-28.json` | Nature usage measurement and its result |
| `tools/pv-shot.cjs` | Serves the downloaded Preview through Playwright (paths on Sim's PC) |

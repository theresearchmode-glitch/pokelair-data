// Item drawings for the item sheet's evidence bag (Dossier step 4, part 1, Nov 23; docs/mockups/sheet-pics-natures-nov23/HANDOFF.md
// "Item pictures: the source check" and "The drawing job"). Sim approved "our own drawn symbols in an evidence bag" (Nov 23, 4:33 PM).
// NO game item art from any source: every drawing here is our own, flat, on a 64 grid: a few solid shapes, a 2px dark outline, at most
// one highlight, readable at 48px. Colours are tokens only (the type colours --ty-*, the weather/terrain colours --arn-k-*, the logo's,
// and the --ia-* set in tokens.css); none change at night (the bag keeps its own colours).
// Not wired into the item sheet yet: Sim OKs the drawing sheet first. An item with no drawing gets no bag (V2.itemArt returns '').
(() => {
  const S = 'stroke:var(--ia-line);stroke-width:2;stroke-linejoin:round;stroke-linecap:round';
  const F = c => `style="fill:${c};${S}"`, INK = 'style="fill:var(--ia-line)"', WH = 'style="fill:var(--ia-white)"';
  const HI = 'style="fill:var(--ia-hi)"', HL = 'style="fill:none;stroke:var(--ia-hi);stroke-width:3;stroke-linecap:round"';
  const DK = c => `color-mix(in srgb,${c} 70%,var(--ia-line))`; // the shade side of the same colour, mixed with the outline ink
  const svg = b => `<svg class="ia" viewBox="0 0 64 64" focusable="false" aria-hidden="true">${b}</svg>`;
  const sym = (ty, x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 256 256" style="fill:var(--on-type)"><use href="#kty-${ty}"/></svg>`;
  // small marks for the seed and rock families: terrain (seeds, ink) and weather (rocks, white on the shade side)
  const MARK = {
    grassy: `<path d="M25 50C25 43 23 37 20 33C26 36 29 42 29 50Z" ${INK}/><path d="M30 50C30 41 31 34 33 27C36 35 35 42 34 50Z" ${INK}/><path d="M38 50C38 43 40 37 44 34C43 40 42 45 42 50Z" ${INK}/>`,
    electric: `<path d="M35 25L24 40H31L28 52L41 35H34L37 25Z" ${INK}/>`,
    psychic: `<circle cx="32" cy="39" r="8" style="fill:none;stroke:var(--ia-line);stroke-width:3"/><circle cx="34" cy="37" r="3" ${INK}/>`,
    misty: `<path d="M21 33q5.5-4 11 0t11 0M21 40q5.5-4 11 0t11 0M21 47q5.5-4 11 0t11 0" style="fill:none;stroke:var(--ia-line);stroke-width:2.5;stroke-linecap:round"/>`,
    rain: `<path d="M40 35C44 41 46 44 46 47A6 6 0 0 1 34 47C34 44 36 41 40 35Z" ${WH}/>`,
    sun: `<path d="M40 34C46 40 47 46 44 50C42 52 38 52 36 50C33 47 35 42 38 40C38 43 40 44 41 42C42 40 41 37 40 34Z" ${WH}/>`,
    snow: `<path d="M40 37V53M33 41L47 49M47 41L33 49" style="fill:none;stroke:var(--ia-white);stroke-width:2.5;stroke-linecap:round"/>`,
    sand: `<circle cx="35" cy="47" r="2.4" ${WH}/><circle cx="42" cy="42" r="2.4" ${WH}/><circle cx="44" cy="50" r="2.4" ${WH}/>`};
  // the shared shapes (HANDOFF "The drawing job"): one Mega Stone, one berry, one seed, one rock; each family member only changes colour and mark
  const SHAPE = {
    // a cut stone in the Mega's main type, the white type symbol in it, and an ink X / Y / Z tag when the Pokémon has more than one Mega
    stone: (ty, letter) => { const c = `var(--ty-${ty})`; return svg(`<path d="M18 8H46L58 24H6Z" ${F(c)}/><path d="M6 24H58L34 58H30Z" ${F(DK(c))}/>`
      + `<path d="M20 11H30L24 21H12Z" ${HI}/>${sym(ty, 22, 25, 21)}`
      + (letter ? `<path d="M42 44H60L57 58H39Z" ${INK}/><text x="49.5" y="55.6" text-anchor="middle" style="fill:var(--ia-white);font:italic 800 12px var(--u);font-synthesis:style">${letter}</text>` : '')); },
    // a round berry with a leaf; a berry that softens a type's hit wears that type's colour and its white symbol
    berry: (c, ty) => svg(`<path d="M32 19L30 12" style="fill:none;${S};stroke-width:3"/><circle cx="32" cy="38" r="20" ${F(c)}/>`
      + `<path d="M32 19C33 10 41 5 50 7C48 15 41 20 32 19Z" ${F('var(--ty-Grass)')}/><path d="M19 33A13 13 0 0 1 26 24" ${HL}/>${ty ? sym(ty, 22, 29, 20) : ''}`),
    // a seed; the terrain seeds carry their terrain's mark, the Miracle Seed sprouts
    seed: (c, mark) => svg((mark === 'sprout' ? `<path d="M32 13V6" style="fill:none;${S};stroke-width:3"/><path d="M32 7C28 1 21 1 18 4C22 9 28 9 32 7Z" ${F('var(--tyn-Grass)')}/><path d="M32 7C36 1 43 1 46 4C42 9 36 9 32 7Z" ${F('var(--tyn-Grass)')}/>` : '')
      + `<path d="M32 12C44 22 48 34 46 45C43 56 21 56 18 45C16 34 20 22 32 12Z" ${F(c)}/><path d="M22 30C23 25 25 21 28 18" ${HL}/>${mark && mark !== 'sprout' ? MARK[mark] : ''}`),
    // a rock in its weather's colour, the shade side carrying the weather's white mark
    rock: (c, mark) => svg(`<path d="M8 46L14 22L30 10L48 14L58 34L50 54L20 56Z" ${F(c)}/><path d="M32 30L58 34L50 54L20 56Z" ${F(DK(c))}/><path d="M17 23L29 14L28 22Z" ${HI}/>${MARK[mark] || ''}`)};
  // one-off drawings (the most-used items that share no shape)
  const ONE = {
    // a knotted sash in Nasty pink: two bands, two tails, the knot
    'Focus Sash': (p => svg(`<path d="M27 35L16 56L23 54L26 60L33 37Z" ${F(DK(p))}/><path d="M31 37L39 59L42 53L48 55L37 35Z" ${F(DK(p))}/>`
      + `<path d="M4 16C14 23 22 26 28 26V37C20 37 12 33 4 28Z" ${F(p)}/><path d="M60 16C50 23 42 26 36 26V37C44 37 52 33 60 28Z" ${F(p)}/>`
      + `<rect x="25" y="22" width="14" height="17" rx="4" ${F(DK(p))}/><path d="M8 22C14 26 19 28 23 29" ${HL}/>`))('var(--logo-pink)'),
    // an orb with a pulse line: power that costs life
    'Life Orb': svg(`<circle cx="32" cy="32" r="24" ${F('var(--ia-orb)')}/><path d="M12 34H22L26 25L31 44L36 20L40 34H52" style="fill:none;stroke:var(--ia-white);stroke-width:3;stroke-linejoin:round;stroke-linecap:round"/>`
      + `<ellipse cx="22" cy="17" rx="7" ry="3.5" transform="rotate(-30 22 17)" ${HI}/>`),
    // an apple core: red skin top and bottom, the bitten middle, two pips
    'Leftovers': svg(`<path d="M32 11C32 7 33 4 35 2" style="fill:none;${S};stroke-width:3"/>`
      + `<path d="M21 12C13 13 11 23 19 26C25 29 25 37 19 41C11 46 14 57 32 57C50 57 53 46 45 41C39 37 39 29 45 26C53 23 51 13 43 12C36 10 28 10 21 12Z" ${F('var(--ia-core)')}/>`
      + `<path d="M21 12C16 12.5 13 16 13.5 20C22 23 42 23 50.5 20C51 16 48 12.5 43 12C36 10 28 10 21 12Z" ${F('var(--ia-apple)')}/>`
      + `<path d="M15 49C16 54 22 57 32 57C42 57 48 54 49 49C40 52 24 52 15 49Z" ${F('var(--ia-apple)')}/>`
      + `<ellipse cx="29" cy="33" rx="1.8" ry="3" ${INK}/><ellipse cx="35" cy="33" rx="1.8" ry="3" ${INK}/><path d="M18 17C19 15 21 14 24 13.5" ${HL}/>`),
    // a scarf in PLOT blue with Nasty pink stripes: the neck loop, two slanted ends, a fringe
    'Choice Scarf': (b => svg(`<path d="M22 30H33L30 52H19Z" ${F(DK(b))}/><path d="M8 14C8 30 56 30 56 14V24C56 42 8 42 8 24Z" ${F(b)}/>`
      + `<path d="M16 28C24 32.5 40 32.5 48 28" ${HL}/><path d="M34 30H48L44 54H30Z" ${F(b)}/>`
      + `<path d="M33 36H47L46.3 40H32.3ZM31.5 45H45.5L44.8 49H30.8Z" style="fill:var(--logo-pink)"/>`
      + `<path d="M32 54L31 59M36 54L35 59M40 54L39 59" style="fill:none;${S}"/>`))('var(--logo-blue)'),
    // a white herb sprig on a green stem
    'White Herb': svg(`<path d="M30 58C30 46 32 34 36 18" style="fill:none;stroke:var(--ia-line);stroke-width:6;stroke-linecap:round"/><path d="M30 58C30 46 32 34 36 18" style="fill:none;stroke:var(--ty-Grass);stroke-width:2.5;stroke-linecap:round"/>`
      + `<path d="M31 46C22 46 14 40 12 32C21 32 28 38 31 46Z" ${F('var(--ia-white)')}/><path d="M33 36C40 34 48 28 50 20C41 21 35 28 33 36Z" ${F('var(--ia-white)')}/>`
      + `<path d="M36 21C31 15 31 9 35 3C40 9 40 15 36 21Z" ${F('var(--ia-white)')}/><path d="M31 53C38 53 44 49 46 43C39 43 33 47 31 53Z" ${F('var(--ia-white)')}/>`),
    // a domed helmet with rock spikes and a visor slit
    'Rocky Helmet': (c => svg(`<path d="M14 30L5 20L20 23ZM22 20L18 6L31 15ZM34 15L39 2L45 17ZM46 22L57 13L52 29Z" ${F(DK(c))}/>`
      + `<path d="M10 44C10 24 20 13 32 13C44 13 54 24 54 44Z" ${F(c)}/><path d="M5 42H59L56 52H8Z" ${F(DK(c))}/>`
      + `<path d="M20 33H44L42 38H22Z" ${INK}/><path d="M16 30C17 24 21 19 26 17" ${HL}/>`))('var(--ty-Rock)'),
    // a feather in the Fairy colour, its shaft and a notch in the vane
    'Fairy Feather': svg(`<path d="M50 6C58 18 54 30 46 36L40 34L42 40C36 46 30 49 22 52C20 40 26 20 50 6Z" ${F('var(--ty-Fairy)')}/>`
      + `<path d="M8 60C20 50 34 32 50 6" style="fill:none;${S}"/><path d="M26 41C28 31 32 23 38 17" ${HL}/>`)};
  // the drawn set: the 20 most-used items on tournament teams (Oct 21 - Nov 18), plus one of each family member Sim should see
  const BERRY = {'Sitrus Berry': ['var(--ia-sitrus)'], 'Chople Berry': ['var(--ty-Fighting)', 'Fighting'], 'Colbur Berry': ['var(--ty-Dark)', 'Dark'], 'Occa Berry': ['var(--ty-Fire)', 'Fire']};
  const SEED = {'Miracle Seed': ['var(--ty-Grass)', 'sprout'], 'Grassy Seed': ['var(--arn-k-grassy)', 'grassy'], 'Psychic Seed': ['var(--arn-k-psychic)', 'psychic'],
    'Electric Seed': ['var(--arn-k-electric)', 'electric'], 'Misty Seed': ['var(--arn-k-misty)', 'misty']};
  const ROCK = {'Damp Rock': ['var(--arn-k-rain)', 'rain'], 'Heat Rock': ['var(--arn-k-sun)', 'sun'], 'Icy Rock': ['var(--arn-k-snow)', 'snow'], 'Smooth Rock': ['var(--arn-k-sand)', 'sand']};
  const STONES = ['Charizardite Y', 'Raichunite Y', 'Floettite', 'Staraptite', 'Salamencite', 'Garchompite Z', 'Golisopite', 'Tyranitarite'];
  // a Mega Stone's type: the Mega's main type, read from the roster (MEGA_STONE, 19-showdown-paste.js), never typed in by hand
  V2.iaMegaType = n => { try { for (const [m, s] of Object.entries(MEGA_STONE)) if (s === n) { const p = byName.get(m); return p && p.t ? p.t[0] : ''; } } catch (e) { /* no roster yet */ } return ''; };
  V2.iaStone = n => { const ty = V2.iaMegaType(n); return ty && typeof V2.TY_ICON === 'object' && V2.TY_ICON[ty] ? SHAPE.stone(ty, (n.match(/ ([XYZ])$/) || [])[1]) : ''; };
  V2.ITEM_SHAPE = SHAPE;
  V2.ITEM_ART = Object.assign({}, ONE);
  for (const [n, [c, ty]] of Object.entries(BERRY)) V2.ITEM_ART[n] = SHAPE.berry(c, ty);
  for (const [n, [c, m]] of Object.entries(SEED)) V2.ITEM_ART[n] = SHAPE.seed(c, m);
  for (const [n, [c, m]] of Object.entries(ROCK)) V2.ITEM_ART[n] = SHAPE.rock(c, m);
  // stones read the roster when first asked (the roster loads with the page's logic), so they are getters
  for (const n of STONES) Object.defineProperty(V2.ITEM_ART, n, {enumerable: true, configurable: true, get: () => V2.iaStone(n)});
  // the drawing for an item, or '' (then the sheet shows no bag). Any Mega Stone uses the one stone shape, so every stone has one
  V2.itemArt = n => { if (!n) return ''; if (typeof V2.kTySprite === 'function') V2.kTySprite(); return V2.ITEM_ART[n] || V2.iaStone(n) || ''; };
})();

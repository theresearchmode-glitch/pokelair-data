// ---------- NastyPlot rating: our own 0-100 score for every legal Pokémon ----------
// Not just popularity. Intrinsic strength (stats, typing against the current meta, the tools it brings) is blended
// with meta evidence (usage and real tournament win rate), so a strong Pokémon few people use still rates well.
const RT_MOVES = {
  doubles: {'Fake Out': 8, 'Tailwind': 8, 'Trick Room': 7, 'Follow Me': 7, 'Rage Powder': 7, 'Spore': 6, 'Icy Wind': 4, 'Electroweb': 4, 'Parting Shot': 4, 'Sleep Powder': 4,
    'Wide Guard': 3, 'Taunt': 3, 'Encore': 3, 'Helping Hand': 2, 'Will-O-Wisp': 2, 'Thunder Wave': 2, 'Snarl': 2, 'U-turn': 2, 'Quick Guard': 2, 'Coaching': 2, 'Pollen Puff': 2}};
const RT_SETUP = ['Swords Dance', 'Dragon Dance', 'Nasty Plot', 'Calm Mind', 'Quiver Dance', 'Shell Smash', 'Bulk Up', 'Shift Gear', 'Belly Drum', 'Victory Dance', 'Coil', 'Tidy Up'];
const RT_ABIL = {'Intimidate': 10, 'Huge Power': 9, 'Pure Power': 9, 'Drizzle': 8, 'Drought': 8, 'Grassy Surge': 8, 'Prankster': 7, 'Psychic Surge': 7, 'Sand Stream': 6, 'Electric Surge': 6,
  'Speed Boost': 6, 'Good as Gold': 6, 'Shadow Tag': 6, 'Snow Warning': 5, 'Unburden': 5, 'Multiscale': 5, 'Adaptability': 5, 'Aerilate': 5, 'Pixilate': 5, 'Regenerator': 5, 'Armor Tail': 5,
  'Misty Surge': 4, 'Refrigerate': 4, 'Galvanize': 4, 'Defiant': 4, 'Magic Guard': 4, 'Swift Swim': 4, 'Chlorophyll': 4, 'Sand Rush': 4, 'Supreme Overlord': 4, 'Sharpness': 4, 'Gale Wings': 4,
  'Queenly Majesty': 4, 'Dazzling': 4, 'Levitate': 3, 'Competitive': 3, 'Tough Claws': 3, 'Sheer Force': 3, 'Technician': 3, 'Thick Fat': 3, 'Friend Guard': 3, 'Storm Drain': 3, 'Lightning Rod': 3,
  'Stamina': 3, 'Slush Rush': 3, 'Mega Sol': 6, 'Aura Guard': 4, 'Flash Fire': 2, 'Water Absorb': 2, 'Volt Absorb': 2, 'Sap Sipper': 2, 'Poison Touch': 2, 'Hospitality': 2, 'Inner Focus': 2};
let ratingCache = {key: null, map: null};
// Combine the outside sources into one evidence score per Pokémon (doubles).
function perfModel(PD, EX) {
  // Weights tuned on held-out data (Oct 23): build the rating without one source, check how well it predicts that source's
  // real win rates. Ladder win rates added nothing for tournament results, so they're shown but not scored.
  const W = Object.assign({pop: .3, ladder: 0, official: 1.3, popLadder: 1, ingame: 1, adj: 'add', adjW: .5}, (typeof PERF_W === 'object' && PERF_W) || {});
  const out = new Map(), all = new Set([...Object.keys(PD.doubles || {}), ...Object.keys(PD.official || {}), ...Object.keys(PD.ladder || {}), ...Object.keys(PD.smogon || {}), ...Object.keys(PD.prd || {}), ...Object.keys(PD.ingame || {}), ...Object.keys(PD.adj || {})]);
  const wmean = T => { let a = 0, b = 0; for (const k in T) { const [, w, n] = T[k]; a += w / 100 * n; b += n; } return b ? a / b : .5; };
  // win-rate deviation, shrunk toward the source average, and the source's spread so sources can be put on one scale
  // A Pokémon on u% of teams often meets itself, which drags its win rate toward the average; divide by (1 - u) to undo that.
  const dev = (T, K) => { const m = wmean(T), D = {}; for (const k in T) { const [u, w, n] = T[k]; D[k] = {d: (w / 100 - m) / (1 - Math.min(.6, u / 100)) * n / (n + K), n}; } return D; };
  const sd = D => { let a = 0, b = 0; for (const k in D) if (D[k].n >= 200) { a += D[k].d ** 2 * D[k].n; b += D[k].n; } return Math.sqrt(a / (b || 1)) || .02; };
  const T = EX.tour ? {} : (PD.doubles || {}), O = EX.official ? {} : (PD.official || {}), mT = wmean(T) * 100, mO = wmean(O) * 100;
  // Limitless team results with each Pokémon's own share of the win: a joint model of every team (teammates and the
  // player's skill accounted for), fit outside the page. b is in log-odds; z-scored here like the other sources.
  const A = EX.tour || W.adj === 'off' ? {} : (PD.adj || {}); let sA = .05;
  { let a = 0, c = 0; for (const k in A) if (A[k][1] >= 200) { a += A[k][0] ** 2 * A[k][1]; c += A[k][1]; } sA = Math.sqrt(a / (c || 1)) || .05; }
  const dT = dev(T, 600), dO = dev(O, 400), sT = sd(dT), sO = sd(dO);
  // ladder: remove the part of each win rate explained by who plays it (average rating), then shrink
  const L = EX.ladder ? {} : (PD.ladder || {}), Lk = Object.keys(L); let dL = {}, sL = .02;
  if (Lk.length > 5) { let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0; for (const k of Lk) { const [u, w, r] = L[k]; sw += u; sx += u * r; sy += u * w; sxx += u * r * r; sxy += u * r * w; }
    const b = (sw * sxy - sx * sy) / (sw * sxx - sx * sx || 1), a = (sy - b * sx) / sw;
    for (const k of Lk) { const [u, w, r] = L[k], n = Math.min(20000, u / 100 * 660000); dL[k] = {d: ((w - (a + b * r)) / 100) * n / (n + 3000), n}; } sL = sd(dL); }
  const pop = u => u > 0 ? Math.max(0, Math.min(100, 50 + 27 * Math.log10(u))) : 0;
  for (const k of all) {
    const zs = []; let N = 0;
    const useAdj = A[k] && W.adj !== 'off';
    if (dT[k] && !(useAdj && W.adj === 'replace')) { zs.push([dT[k].d / sT, 1.0 * dT[k].n / (dT[k].n + 300)]); N += dT[k].n; }
    if (useAdj) { zs.push([A[k][0] / sA, W.adjW * A[k][1] / (A[k][1] + 300)]); if (W.adj === 'replace' || !dT[k]) N += A[k][1]; }
    if (dO[k]) { zs.push([dO[k].d / sO, W.official * dO[k].n / (dO[k].n + 300)]); N += dO[k].n; }
    if (dL[k] && W.ladder > 0) { zs.push([dL[k].d / sL, W.ladder * dL[k].n / (dL[k].n + 3000)]); N += dL[k].n * .05; }
    const wsum = zs.reduce((a, x) => a + x[1], 0), z = wsum ? zs.reduce((a, x) => a + x[0] * x[1], 0) / Math.max(wsum, .6) : 0;
    const perf = Math.max(0, Math.min(100, 50 + 18 * z));
    const pops = [T[k] ? pop(T[k][0]) : pop(.03), O[k] ? pop(O[k][0]) : pop(.03), (EX.smogon || !W.popLadder ? null : PD.smogon && PD.smogon[k] != null ? pop(PD.smogon[k]) : pop(.1)),
      (EX.prd || !W.popLadder ? null : PD.prd && PD.prd[k] != null ? pop(PD.prd[k]) : pop(.03)), (EX.ladder || !W.popLadder ? null : L[k] ? pop(L[k][0]) : pop(.5)),
      (EX.ingame || !W.ingame || !PD.ingame || !Object.keys(PD.ingame).length ? null : pop(PD.ingame[k] != null ? PD.ingame[k] : .02))].filter(x => x != null);
    const popularity = pops.reduce((a, b) => a + b, 0) / pops.length;
    const evidence = (1 - W.pop) * perf + W.pop * popularity, conf = N / (N + 300);
    const t = T[k] || O[k];
    // the games-weighted average win rate of the source wr comes from (tournament sources average well above 50%)
    const wrMean = T[k] ? mT : O[k] ? mO : null;
    out.set(k, {evidence, conf, perf, popularity, usage: t ? t[0] : null, wr: t ? t[1] : null, wrMean, matches: t ? t[2] : null,
      src: {tour: T[k] || null, official: O[k] || null, ladder: L[k] || null, smogon: PD.smogon ? PD.smogon[k] : null, prd: PD.prd ? PD.prd[k] : null, adj: A[k] || null, ingame: PD.ingame && PD.ingame[k] != null ? PD.ingameRank[k] : null}});
  }
  return out;
}
function pctRanks(vals) { const s = vals.slice().sort((a, b) => a - b), n = s.length || 1;
  return vals.map(v => { let lo = 0, hi = s.length; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m] < v) lo = m + 1; else hi = m; } let up = lo; while (up < s.length && s[up] === v) up++; return 100 * ((lo + up) / 2) / n; }); }
// Outside tier lists (fetched Oct 25 2026), shown next to our rating so you can see where others agree or differ.
// Not scored: each is built from the same kinds of data the rating already uses (tournament win rates, play rates, ladder usage).
const OUTSIDE = {date: 'Oct 25, 2026', lists: [
  {k: 'pz', name: 'Pokémon Zone', how: 'tournament win rate', url: 'https://www.pokemon-zone.com/champions/tier-list/', tiers: {4: 'A', 3: 'B', 2: 'C', 1: 'D'}, note: 'lists Pokémon on 6%+ of teams (Megas 1%+)'},
  {k: 'synergy', name: 'PokeSynergy', how: 'tournament play rate + top cuts', url: 'https://pokesynergy.app/tier-list', tiers: {3: 'S', 2: 'A', 1: 'B'}, note: 'lists the ~50 most-played'},
  {k: 'poketools', name: 'PokeTools', how: 'Showdown ladder usage', url: 'https://www.poketools.com/champions-tier-list', tiers: {4: 'S', 3: 'A', 2: 'B', 1: 'C'}, note: 'lists the top 60 by usage'},
  {k: 'showdowntier', name: 'Showdowntier', how: 'Showdown ladder usage + win rate', url: 'https://showdowntier.com/formats/dmc/index.html', tiers: {5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E'}, note: 'lists ~85 Pokémon with 1%+ usage', date: 'Oct 27, 2026'},
  {k: 'suckerpunch', name: 'Suckerpunch', how: 'Limitless win rate tiers', url: 'https://suckerpunch.gg', tiers: {6: 'Awesome', 5: 'Great', 4: 'Good', 3: 'Fine', 2: 'Bad', 1: 'Awful'}, note: 'ranks by tournament win rate', date: 'Oct 27, 2026'}],
  data: {"pz":{"Floette-Mega":4,"Raichu-Mega-Y":4,"Charizard-Mega-Y":4,"Arcanine-Hisui":4,"Gholdengo":4,"Dragonite-Mega":3,"Staraptor-Mega":3,"Tyranitar-Mega":3,"Delphox-Mega":3,"Gengar-Mega":3,"Salamence-Mega":3,"Kingambit":3,"Excadrill":3,"Sneasler":3,"Rillaboom":3,"Incineroar":3,"Archaludon":3,"Raichu-Mega-X":2,"Swampert-Mega":2,"Froslass-Mega":2,"Garchomp-Mega-Z":2,"Gardevoir-Mega":2,"Golisopod-Mega":2,"Basculegion":2,"Indeedee":2,"Grimmsnarl":2,"Garchomp":2,"Milotic":2,"Pelipper":2,"Sinistcha":2,"Sylveon":2,"Volcarona":2,"Farigiraf":2,"Metagross-Mega":1,"Camerupt-Mega":1,"Lucario-Mega-Z":1,"Whimsicott":1,"Indeedee-F":1},"synergy":{"Rillaboom":3,"Sneasler":3,"Incineroar":3,"Raichu-Mega-Y":3,"Salamence-Mega":3,"Charizard-Mega-Y":3,"Gholdengo":3,"Kingambit":3,"Sylveon":3,"Garchomp-Mega-Z":3,"Archaludon":3,"Basculegion":3,"Farigiraf":3,"Pelipper":3,"Venusaur":3,"Floette-Mega":3,"Garchomp":3,"Golisopod-Mega":3,"Arcanine-Hisui":3,"Milotic":3,"Volcarona":3,"Indeedee":3,"Tyranitar-Mega":3,"Indeedee-F":3,"Excadrill":3,"Grimmsnarl":3,"Dragonite-Mega":3,"Toxapex":3,"Corviknight":3,"Basculegion-F":3,"Staraptor":2,"Politoed":2,"Gengar-Mega":2,"Sinistcha":2,"Gardevoir-Mega":2,"Whimsicott":2,"Kommo-o":2,"Torkoal":2,"Swampert":2,"Primarina":2,"Vivillon":2,"Aerodactyl-Mega":2,"Garchomp-Mega":2,"Delphox-Mega":1,"Froslass-Mega":1,"Armarouge":1,"Metagross":1,"Glimmora-Mega":1},"poketools":{"Rillaboom":4,"Sneasler":4,"Incineroar":4,"Salamence-Mega":4,"Kingambit":4,"Basculegion":3,"Indeedee-F":3,"Gholdengo":3,"Archaludon":3,"Golisopod-Mega":3,"Farigiraf":3,"Pelipper":3,"Raichu-Mega-Y":3,"Charizard-Mega-Y":3,"Milotic":3,"Arcanine-Hisui":2,"Floette-Mega":2,"Sylveon":2,"Garchomp":2,"Gardevoir-Mega":2,"Garchomp-Mega-Z":2,"Politoed":2,"Whimsicott":2,"Sinistcha":2,"Volcarona":2,"Gengar-Mega":2,"Armarouge":2,"Metagross-Mega":2,"Staraptor-Mega":2,"Indeedee":2,"Excadrill":1,"Tyranitar-Mega":1,"Swampert-Mega":1,"Grimmsnarl":1,"Torkoal":1,"Froslass-Mega":1,"Kommo-o":1,"Lucario-Mega-Z":1,"Primarina":1,"Pawmot":1,"Delphox-Mega":1,"Annihilape":1,"Blastoise-Mega":1,"Ninetales-Alola":1,"Venusaur":1,"Baxcalibur-Mega":1,"Maushold":1,"Dragonite-Mega":1,"Hatterene":1,"Tyranitar":1,"Ceruledge":1,"Aerodactyl-Mega":1,"Glimmora-Mega":1,"Corviknight":1,"Absol-Mega-Z":1,"Camerupt-Mega":1,"Talonflame":1,"Espathra":1,"Dragapult":1,"Raichu-Mega-X":1},"showdowntier":{"Sneasler":5,"Rillaboom":4,"Incineroar":4,"Garchomp-Mega-Z":4,"Archaludon":4,"Raichu-Mega-Y":4,"Charizard-Mega-Y":4,"Kingambit":4,"Pelipper":4,"Golisopod-Mega":4,"Basculegion":4,"Salamence-Mega":4,"Basculegion-F":4,"Indeedee-F":3,"Farigiraf":3,"Gholdengo":3,"Tyranitar-Mega":3,"Volcarona":3,"Sylveon":3,"Politoed":3,"Venusaur":3,"Floette-Mega":3,"Grimmsnarl":3,"Staraptor-Mega":3,"Excadrill":3,"Gardevoir-Mega":3,"Indeedee":3,"Swampert-Mega":3,"Whimsicott":2,"Sinistcha":2,"Milotic":2,"Torkoal":2,"Gengar-Mega":2,"Arcanine-Hisui":2,"Froslass-Mega":2,"Primarina":2,"Dragonite-Mega":2,"Kommo-o":2,"Armarouge":2,"Metagross-Mega":2,"Glimmora-Mega":2,"Annihilape":2,"Delphox-Mega":2,"Camerupt-Mega":2,"Ninetales-Alola":1,"Lucario-Mega-Z":1,"Aerodactyl-Mega":1,"Corviknight":1,"Blaziken-Mega":1,"Dragapult":1,"Sableye":1,"Talonflame":1,"Blastoise-Mega":1,"Baxcalibur-Mega":1,"Hatterene":1,"Toxapex":1,"Sceptile-Mega":1,"Espathra":1,"Maushold":1,"Rotom-Heat":1,"Rotom-Wash":1,"Hydreigon":1,"Typhlosion-Hisui":1,"Mawile-Mega":1,"Absol-Mega-Z":1,"Pawmot":1,"Ceruledge":1,"Meganium-Mega":1,"Alakazam-Mega":1,"Gallade":1,"Clefable":1,"Drampa-Mega":1,"Tsareena":1,"Zoroark-Hisui":1,"Grapploct":1,"Vivillon":1,"Scovillain-Mega":1,"Meowscarada":1,"Gliscor":1,"Kangaskhan":1,"Greninja-Mega":1,"Chandelure-Mega":1,"Lopunny-Mega":1,"Scrafty":1},"suckerpunch":{"Basculegion-F":6,"Floette-Mega":6,"Annihilape":5,"Gengar-Mega":5,"Kommo-o":5,"Venusaur":5,"Glimmora-Mega":5,"Delphox-Mega":5,"Charizard-Mega-Y":5,"Kingambit":5,"Archaludon":5,"Dragonite-Mega":5,"Raichu-Mega-Y":5,"Arcanine-Hisui":5,"Pyroar-Mega":4,"Toxapex":4,"Hippowdon":4,"Grimmsnarl":4,"Swampert-Mega":4,"Espathra":4,"Staraptor-Mega":4,"Froslass-Mega":4,"Incineroar":4,"Sneasler":4,"Rillaboom":4,"Primarina":4,"Gholdengo":4,"Pelipper":4,"Sinistcha":4,"Garchomp-Mega-Z":4,"Hawlucha-Mega":4,"Basculegion":4,"Sylveon":4,"Excadrill":4,"Politoed":4,"Salamence-Mega":4,"Volcarona":4,"Dragapult":4,"Indeedee":4,"Aerodactyl-Mega":4,"Tyranitar-Mega":4,"Farigiraf":4,"Camerupt-Mega":4,"Milotic":4,"Reuniclus":3,"Rhyperior":3,"Slowbro-Mega":3,"Houndstone":3,"Pidgeot-Mega":3,"Snorlax":3,"Samurott-Hisui":3,"Mamoswine":3,"Meowstic":3,"Scovillain-Mega":3,"Chesnaught-Mega":3,"Palafin":3,"Arcanine":3,"Goodra-Hisui":3,"Scrafty":3,"Krookodile":3,"Abomasnow-Mega":3,"Ceruledge":3,"Wigglytuff":3,"Decidueye-Hisui":3,"Mudsdale":3,"Azumarill":3,"Skarmory-Mega":3,"Vanilluxe":3,"Gliscor":3,"Klefki":3,"Blastoise-Mega":3,"Corviknight":3,"Grapploct":3,"Lycanroc-Dusk":3,"Clefable":3,"Vivillon":3,"Typhlosion-Hisui":3,"Whimsicott":3,"Golisopod-Mega":3,"Armarouge":3,"Metagross-Mega":3,"Hydreigon":3,"Pawmot":3,"Scolipede-Mega":2,"Torterra":2,"Arboliva":2,"Bellibolt":2,"Starmie-Mega":2,"Pikachu":2,"Perrserker":2,"Manectric-Mega":2,"Noivern":2,"Houndoom-Mega":2,"Dragalge-Mega":2,"Chimecho-Mega":2,"Aggron-Mega":2,"Skeledirge":2,"Squawkabilly":2,"Ampharos-Mega":2,"Conkeldurr":2,"Feraligatr-Mega":2,"Vaporeon":2,"Ninetales":2,"Tauros-Paldea-Aqua":2,"Araquanid":2,"Gallade":2,"Clawitzer":2,"Aurorus":2,"Aegislash":2,"Infernape":2,"Orthworm":2,"Golurk-Mega":2,"Persian-Alola":2,"Chandelure-Mega":2,"Slowking-Galar":2,"Heracross-Mega":2,"Gyarados-Mega":2,"Swalot":2,"Altaria":2,"Cofagrigus":2,"Malamar-Mega":2,"Umbreon":2,"Drampa-Mega":2,"Kangaskhan":2,"Empoleon":2,"Mawile-Mega":2,"Torkoal":2,"Rotom-Heat":2,"Blaziken-Mega":2,"Meowscarada":2,"Gardevoir-Mega":2,"Ninetales-Alola":2,"Indeedee-F":2,"Lucario-Mega-Z":2,"Machamp":1,"Heliolisk":1,"Raichu-Alola":1,"Crabominable-Mega":1,"Overqwil":1,"Eelektross-Mega":1,"Vileplume":1,"Beedrill-Mega":1,"Alcremie":1,"Ditto":1,"Oranguru":1,"Toxtricity-Low-Key":1,"Mimikyu":1,"Kleavor":1,"Salazzle":1,"Jolteon":1,"Pincurchin":1,"Steelix-Mega":1,"Lopunny-Mega":1,"Meganium-Mega":1,"Spiritomb":1,"Audino-Mega":1,"Tsareena":1,"Mr. Mime":1,"Zoroark-Hisui":1,"Tinkaton":1,"Maushold":1,"Weavile":1,"Alakazam-Mega":1,"Serperior":1,"Rotom-Wash":1,"Hatterene":1,"Cinderace":1,"Toxtricity":1,"Inteleon":1,"Talonflame":1,"Sirfetch’d":1,"Greninja-Mega":1,"Scizor-Mega":1,"Sceptile-Mega":1,"Baxcalibur-Mega":1,"Absol-Mega-Z":1,"Sableye":1}}};
// Rating blend (doubles): win-rate prior for few-game Pokémon, popularity weight, stats weight, popularity of a Pokémon no source lists.
// (This blend is now only the fallback and the sheet's evidence; the rating itself is RATE_V3 below. The Oct 27 "fitted"
// recipe was retired the same evening: it ordered Pokémon by the win model's per-Pokémon numbers, which put rare picks
// such as Annihilape, Kommo-o and Mega Garchomp above the format's staples.)
const RG = Object.assign({pp0: 40, pp1: .15, wpop: .4, wi: .05, absent: 4}, (typeof RATING_W === 'object' && RATING_W) || {});
function ratings() {
  const key = metaVersion + '|' + ui.metaSrc;
  if (ratingCache.key === key) return ratingCache.map;
  const th = metaThreats(), W = th.reduce((a, o) => a + o.w, 0) || 1;
  const raw = ROSTER.map(p => {
    const st = p.st || [80, 80, 80, 80, 80, 80], ab = metaAbility(p) || bestAbility(p);
    const off = Math.max(st[1], st[3]), bulk = st[0] * (st[2] + st[4]) / 2, spe = st[5];
    // typing against the 30 most-used Pokémon: how hard their STABs hit it, and how many its STABs hit hard
    let dv = 0, ov = 0;
    for (const o of th) { const hit = Math.max(...o.types.map(t => mult(t, p.t, ab, true)));
      dv += o.w * (hit >= 4 ? -2 : hit >= 2 ? -1 : hit >= 1 ? 0 : hit > .3 ? .5 : hit > 0 ? .8 : 1);
      const mine = Math.max(...p.t.map(t => mult(t, o.types, o.ability, true))); ov += o.w * (mine >= 2 ? 1 : mine >= 1 ? .3 : 0); }
    // tools: the best ability it can run, support moves, spread STAB, priority, setup
    const learn = new Set((LEARN[p.n] || []).map(k => MV[k] && MV[k].name).filter(Boolean));
    let tools = Math.max(0, ...p.a.map(a => RT_ABIL[a] || 0));
    const tm = RT_MOVES.doubles; let mvPts = 0; for (const n in tm) if (learn.has(n)) mvPts += tm[n]; tools += Math.min(16, mvPts);
    const L = [...learn].map(n => mvByName.get(n)).filter(Boolean);
    if (L.some(m => m.spread && m.bp >= 60 && p.t.includes(m.type) && m.cat > 0)) tools += 6;
    if (L.some(m => ROLE.prio.includes(m.name) && p.t.includes(m.type))) tools += 3;
    if (RT_SETUP.some(n => learn.has(n))) tools += 4;
    return {p, off, bulk, spe, slowNuke: spe <= 55 && off >= 110, dv: dv / W, ov: ov / W, tools};
  });
  const P = k => pctRanks(raw.map(r => r[k])), pOff = P('off'), pBulk = P('bulk'), pSpe = P('spe'), pDv = P('dv'), pOv = P('ov'), pTools = P('tools');
  const intr0 = raw.map((r, i) => {
    const power = .45 * pOff[i] + .35 * pBulk[i] + .2 * Math.max(pSpe[i], r.slowNuke ? 70 : 0);
    const typing = .55 * pDv[i] + .45 * pOv[i];
    return {power, typing, tools: pTools[i], v: .45 * power + .25 * typing + .30 * pTools[i]}; });
  const pIntr = pctRanks(intr0.map(x => x.v));
  // Evidence from five outside sources (perfdata.js): Limitless tournaments, official VGC events, Showdown ladder win rates
  // (adjusted for the rating of the players using each Pokémon), Smogon 1760+ usage and the top 10% of Showdown replays.
  // Win rates are shrunk toward each source's average for small samples and put on one scale (z-scores); popularity is
  // averaged across sources. Confidence grows with the number of real games behind the numbers.
  const PD = activePerf(), map = new Map(), EX = (typeof PERF_EXCLUDE === 'object' && PERF_EXCLUDE) || {};
  const SRC = PD ? perfModel(PD, EX) : null;
  // Win model (real games, player skill removed): half of each Pokémon's win-rate score, so support Pokémon that strong
  // players run aren't judged only on raw win rates.
  let MP = null; if (typeof modelOK === 'function' && modelOK()) { const ks = Object.keys(META.model.mons).filter(n => byName.has(n)); const pr = pctRanks(ks.map(n => META.model.mons[n])); MP = new Map(ks.map((n, i) => [n, pr[i]])); }
  raw.forEach((r, i) => { const p = r.p, intr = pIntr[i];
    let evidence = 0, conf = 0, usage = null, wr = null, matches = null, perf = null, src = null, pop = null, wrMean = null;
    let popC = null;
    if (SRC && SRC.has(p.n)) { const e = SRC.get(p.n); pop = e.popularity; evidence = e.evidence; conf = e.conf; perf = e.perf; usage = e.usage; wr = e.wr; wrMean = e.wrMean; matches = e.matches; src = e.src; popC = e.popularity;
      // the win model's rank is a 0-100 percentile, while perf is 50 + 18 z: put the model on the same z scale before averaging
      if (MP && MP.has(p.n) && perf != null) perf = .5 * perf + .5 * Math.max(0, Math.min(100, 50 + 18 * probit(Math.max(.01, Math.min(.99, MP.get(p.n) / 100))))); }
    else if (SRC) popC = RG.absent;
    else { const v = viability(p); if (v >= 25) { evidence = v; conf = .5; } }
    const prior = .6 * intr;
    let total, ppV = null;
    // With tournament data: how often a Pokémon is picked is known for every Pokémon from 10,000+ teams, so it
    // always counts in full. Only the win-rate half is shrunk toward a stat-based guess when there are few games.
    // (Before, a Pokémon nobody uses was scored almost entirely on its stats and could outrank proven staples.)
    if (SRC && popC != null) { const pp = ppV = conf * (perf != null ? perf : 50) + (1 - conf) * (RG.pp0 + RG.pp1 * intr);
      evidence = (1 - RG.wpop) * pp + RG.wpop * popC; total = Math.round(Math.max(1, Math.min(99, (1 - RG.wi) * evidence + RG.wi * intr))); }
    else total = Math.round(Math.max(1, Math.min(99, .85 * (conf * evidence + (1 - conf) * prior) + .15 * intr)));
    const proven = usage != null ? usage >= 2 : viability(p) >= 45;
    map.set(p.n, {total, raw: total, win: ppV == null ? null : Math.round(ppV), popAll: popC == null ? null : Math.round(popC), intrinsic: Math.round(intr), power: Math.round(intr0[i].power), typing: Math.round(intr0[i].typing), tools: Math.round(intr0[i].tools),
      evidence: Math.round(evidence), conf: +conf.toFixed(2), band: Math.round(3 + 15 * (1 - conf)), perf: perf == null ? null : Math.round(perf), pop: pop == null ? null : Math.round(pop), usage, wr, wrMean, matches, src, meta: Math.round(evidence), proven}); });
  { let mx = 0; for (const v of map.values()) mx = Math.max(mx, v.raw); const f = mx > 0 ? 95 / mx : 1; for (const v of map.values()) v.total = Math.max(1, Math.min(99, Math.round(v.raw * f))); }
  // The rating itself (v3, Oct 27): proven results among strong players (RATE_V3 below). The numbers above stay for the
  // sheet's evidence rows and as the fallback when no tournament data has loaded at all.
  v3Apply(map);
  ratingCache = {key, map}; return map;
}
// Rating v3 (Oct 27). What a rating means: how strong a Pokémon is in the current format, proven by results.
//  - top-cut share: of the teams that reach top cut at Limitless events, how many use it (bigger events and the last
//    few weeks count more). The core: the best Pokémon are the ones winning teams keep bringing.
//  - picked by strong players: its usage with every team weighted by how likely its player is above the 70th
//    percentile of skill (Elo over every Limitless game), Smogon-style rating-weighted usage.
//  - conversion: how much more (or less) often it reaches top cut than its usage predicts (6 teams of prior).
//  - win rate against the field, shrunk toward average with 1,500 games of prior.
// score = ln(top-cut share) + 0.5 ln(strong-player usage) + ln(conversion) + 8 x shrunk win-rate edge. The best Pokémon
// is 95; halving its presence costs about 10 points. Chosen in experiments/metrics-lab.mjs, which tested every
// candidate (usage, rating-weighted usage, winner-weighted top cuts, top-cut ÷ entries, event wins, Wilson lower-bound
// win rate, skill-adjusted results, results vs top threats, breadth of players, consistency) on two forward tests
// (built before Oct 11 / Oct 17, scored on later events' top cuts) and five outside lists; only rating-weighted usage
// helped. Forward Spearman 0.82 (old recipe 0.73), later top 10 named 14 of 20 (old 6); agreement with PokeSynergy,
// PokeTools and Showdowntier 0.77, with the win-rate lists (Pokémon Zone, Suckerpunch) 0.65. The win model doesn't set
// ratings: its per-Pokémon numbers are noisy for rare picks (it had Annihilape #1).
const RATE_V3 = {lift: 1, wr: 8, rw: .5, K: 1500, slope: 9.5, top: 95};
function v3Evidence(map) { let res = null; try { res = RES; } catch (e) {}
  const tc = res && res.tc && res.tc.rows && Object.keys(res.tc.rows).length >= 50 ? res.tc : null, out = new Map();
  if (tc) { for (const [n, r] of Object.entries(tc.rows)) if (map.has(n) && Array.isArray(r)) out.set(n, {field: +r[0], top: +r[1], lift: +r[2], wr: +r[3], g: +r[4], rw: r[5] != null ? +r[5] : +r[0], base: 100 * (+tc.base || .5), full: true, gs: r[6] != null ? +r[6] : null});
    return out; }
  // before the top-cut data loads: tournament usage and win rate only (conversion unknown, so 1)
  let a = 0, b = 0; for (const v of map.values()) { const t = v.src && v.src.tour; if (t) { a += t[1] * t[2]; b += t[2]; } } const wm = b ? a / b : 50;
  for (const [n, v] of map) { const t = v.src && v.src.tour; if (t && t[0] > 0) out.set(n, {field: t[0], top: t[0], lift: 1, wr: t[1], g: t[2], rw: t[0], base: wm, full: false}); }
  return out; }
// team preview from Showdown replays (shown, not scored until there are enough games): [games, % brought, % led]
function bringLead(p) { let res = null; try { res = RES; } catch (e) {} const br = res && res.tc && res.tc.br; if (!br || !p) return null;
  const k = p.n === 'Floette-Mega' ? 'Floette-Eternal' : p.n.replace(/-Mega(-[XYZ])?$/, ''), r = br[k]; return Array.isArray(r) && r[0] >= 30 ? {g: r[0], b: r[1], l: r[2], forms: k !== p.n} : null; }
function v3Apply(map) { const E = v3Evidence(map); if (E.size < 30) return; const R = RATE_V3, sc = new Map(), edge = e => (e.wr - e.base) / 100 * e.g / (e.g + R.K);
  for (const [n, e] of E) sc.set(n, Math.log(Math.max(1e-4, e.top / 100)) + R.rw * Math.log(Math.max(1e-4, e.rw / 100)) + R.lift * Math.log(Math.max(.2, e.lift)) + R.wr * edge(e));
  const smax = Math.max(...sc.values()), ks = [...sc.keys()], P = f => { const pr = pctRanks(ks.map(n => f(E.get(n)))); return new Map(ks.map((n, i) => [n, Math.round(pr[i])])); };
  const pTop = P(e => e.top), pRw = P(e => e.rw), pLift = P(e => e.lift), pWr = P(edge);
  for (const [n, v] of map) { v.formula = v.total; const e = E.get(n);
    // thin evidence (a handful of games) leans on the same placeholder a never-used Pokémon gets, so being brought twice
    // and missing top cut can't rate below never being tried
    if (e) { const t = R.top + R.slope * (sc.get(n) - smax), fl = Math.min(30, 6 + .24 * (v.intrinsic || 0)), w = e.g / (e.g + 300);
      v.total = Math.max(1, Math.min(99, Math.round(w * t + (1 - w) * Math.max(t, fl)))); v.tc = e; v.band = Math.round(3 + 15 * (1 - e.g / (e.g + R.K)));
      v.parts = {top: pTop.get(n), rw: pRw.get(n), lift: e.full ? pLift.get(n) : null, wr: pWr.get(n)}; }
    // no tournament results: a rough floor from stats, typing and tools, never above the bottom of C
    else { v.total = Math.max(1, Math.min(30, Math.round(6 + .24 * (v.intrinsic || 0)))); v.tc = null; v.band = 18; v.parts = null; } } }
// The "not junk" floor for box-only and off-meta suggestions: the older, lenient score (stats, typing and tools count
// there), so a Pokémon that simply hasn't been tried at events isn't shut out of your own box. The tier list uses total.
function ratingLoose(p) { const r = rating(p); return r.formula != null ? Math.max(r.total, r.formula) : r.total; }
function rating(p) { const r = ratings().get(p.n); return r || {total: 0, intrinsic: 0, power: 0, typing: 0, tools: 0, meta: 0, adj: 0, proven: false}; }
// A strong Pokémon the meta mostly ignores.
// A strong Pokémon the meta mostly ignores, and that hasn't been tried and found wanting (a big sample with a poor win rate rules it out).
// A proven loser: 400+ Limitless games, its own share of team wins clearly negative AND a raw tournament win rate of
// 46.5% or less (both, so supports like Indeedee that lose on paper but enable winning teams aren't caught).
// Suggestions skip these (except off-meta searches); you can still add them yourself.
let trapCache = {key: null, set: null};
function isTrap(p) { if (!p || OFFMETA) return false; const key = metaVersion;
  if (trapCache.key !== key) { const PD = activePerf(), set = new Set();
    if (PD && PD.adj) for (const n in PD.adj) { const [b, g, , lw] = PD.adj[n], t = PD.doubles && PD.doubles[n], wr = lw != null ? lw : (t && t[2] >= 300 ? t[1] : null);
      if (g >= 400 && b <= -.05 && wr != null && wr <= 46.5) set.add(n); }
    trapCache = {key, set}; }
  return trapCache.set.has(p.n); }
// Untested: few tournament games behind it, so it's an idea rather than a proven pick (hidden gems have their own tag).
function ideaTag(p) { const r = rating(p); if (isGem(p) || (r.matches || 0) >= 300 || (r.src && r.src.adj && r.src.adj[1] >= 300)) return '';
  return '<span class="tag idea" title="Few tournament games behind it: an untested idea, not a proven pick">IDEA</span>'; }
// win rates are judged against their source's own average (tournament sources sit well above 50%), not against 50%
// inverse of the standard normal CDF (Acklam's approximation, error < 1e-8): turns a percentile into a z-score
function probit(p) { const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239], b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572], c = [-.007784894002430293, -.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783], d = [.007784695709041462, .3224671290700398, 2.445134137142996, 3.754408661907416];
  if (p < .02425) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - .02425) return -probit(1 - p);
  const q = p - .5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
// Hidden gem (v3): rarely used (under 2% of teams), but with real evidence it overperforms: reaches top cut at least 15%
// more often than its usage predicts, wins more than average, over 300+ games. (The rating itself stays modest for
// these: it measures proven presence. The gem tag and Sleepers are where under-used overperformers show up.)
// It must also hold up when the data is resampled: still a gem in 80%+ of 20 resamples that each drop a random 10% of
// teams (topcut.mjs; stress test Oct 28: Hydreigon passed on the full data but in only 12 of 30 resamples).
const GEM_STABLE = .8;
function isGem(p) { const r = rating(p), e = r.tc; if (r.proven || !e) return false;
  return e.full ? e.g >= 300 && e.lift >= 1.15 && e.wr > e.base + 1 && (e.gs == null || e.gs >= GEM_STABLE) : e.g >= 300 && e.wr > e.base + 2; }


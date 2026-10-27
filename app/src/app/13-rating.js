// ---------- NastyPlot rating: our own 0-100 score for every legal Pokémon ----------
// Not just popularity. Intrinsic strength (stats, typing against the current meta, the tools it brings) is blended
// with meta evidence (usage and real tournament win rate), so a strong Pokémon few people use still rates well.
const RT_MOVES = {
  doubles: {'Fake Out': 8, 'Tailwind': 8, 'Trick Room': 7, 'Follow Me': 7, 'Rage Powder': 7, 'Spore': 6, 'Icy Wind': 4, 'Electroweb': 4, 'Parting Shot': 4, 'Sleep Powder': 4,
    'Wide Guard': 3, 'Taunt': 3, 'Encore': 3, 'Helping Hand': 2, 'Will-O-Wisp': 2, 'Thunder Wave': 2, 'Snarl': 2, 'U-turn': 2, 'Quick Guard': 2, 'Coaching': 2, 'Pollen Puff': 2},
  singles: {'Stealth Rock': 7, 'Spore': 6, 'Recover': 5, 'Slack Off': 5, 'Roost': 4, 'U-turn': 4, 'Volt Switch': 4, 'Parting Shot': 4, 'Knock Off': 4, 'Will-O-Wisp': 4,
    'Synthesis': 3, 'Moonlight': 3, 'Flip Turn': 3, 'Toxic': 3, 'Thunder Wave': 3, 'Rapid Spin': 3, 'Defog': 3, 'Taunt': 3, 'Encore': 3, 'Spikes': 3, 'Trick Room': 2}};
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
  {k: 'poketools', name: 'PokeTools', how: 'Showdown ladder usage', url: 'https://www.poketools.com/champions-tier-list', tiers: {4: 'S', 3: 'A', 2: 'B', 1: 'C'}, note: 'lists the top 60 by usage'}],
  data: {"pz":{"Floette-Mega":4,"Raichu-Mega-Y":4,"Charizard-Mega-Y":4,"Arcanine-Hisui":4,"Gholdengo":4,"Dragonite-Mega":3,"Staraptor-Mega":3,"Tyranitar-Mega":3,"Delphox-Mega":3,"Gengar-Mega":3,"Salamence-Mega":3,"Kingambit":3,"Excadrill":3,"Sneasler":3,"Rillaboom":3,"Incineroar":3,"Archaludon":3,"Raichu-Mega-X":2,"Swampert-Mega":2,"Froslass-Mega":2,"Garchomp-Mega-Z":2,"Gardevoir-Mega":2,"Golisopod-Mega":2,"Basculegion":2,"Indeedee":2,"Grimmsnarl":2,"Garchomp":2,"Milotic":2,"Pelipper":2,"Sinistcha":2,"Sylveon":2,"Volcarona":2,"Farigiraf":2,"Metagross-Mega":1,"Camerupt-Mega":1,"Lucario-Mega-Z":1,"Whimsicott":1,"Indeedee-F":1},"synergy":{"Rillaboom":3,"Sneasler":3,"Incineroar":3,"Raichu-Mega-Y":3,"Salamence-Mega":3,"Charizard-Mega-Y":3,"Gholdengo":3,"Kingambit":3,"Sylveon":3,"Garchomp-Mega-Z":3,"Archaludon":3,"Basculegion":3,"Farigiraf":3,"Pelipper":3,"Venusaur":3,"Floette-Mega":3,"Garchomp":3,"Golisopod-Mega":3,"Arcanine-Hisui":3,"Milotic":3,"Volcarona":3,"Indeedee":3,"Tyranitar-Mega":3,"Indeedee-F":3,"Excadrill":3,"Grimmsnarl":3,"Dragonite-Mega":3,"Toxapex":3,"Corviknight":3,"Basculegion-F":3,"Staraptor":2,"Politoed":2,"Gengar-Mega":2,"Sinistcha":2,"Gardevoir-Mega":2,"Whimsicott":2,"Kommo-o":2,"Torkoal":2,"Swampert":2,"Primarina":2,"Vivillon":2,"Aerodactyl-Mega":2,"Garchomp-Mega":2,"Delphox-Mega":1,"Froslass-Mega":1,"Armarouge":1,"Metagross":1,"Glimmora-Mega":1},"poketools":{"Rillaboom":4,"Sneasler":4,"Incineroar":4,"Salamence-Mega":4,"Kingambit":4,"Basculegion":3,"Indeedee-F":3,"Gholdengo":3,"Archaludon":3,"Golisopod-Mega":3,"Farigiraf":3,"Pelipper":3,"Raichu-Mega-Y":3,"Charizard-Mega-Y":3,"Milotic":3,"Arcanine-Hisui":2,"Floette-Mega":2,"Sylveon":2,"Garchomp":2,"Gardevoir-Mega":2,"Garchomp-Mega-Z":2,"Politoed":2,"Whimsicott":2,"Sinistcha":2,"Volcarona":2,"Gengar-Mega":2,"Armarouge":2,"Metagross-Mega":2,"Staraptor-Mega":2,"Indeedee":2,"Excadrill":1,"Tyranitar-Mega":1,"Swampert-Mega":1,"Grimmsnarl":1,"Torkoal":1,"Froslass-Mega":1,"Kommo-o":1,"Lucario-Mega-Z":1,"Primarina":1,"Pawmot":1,"Delphox-Mega":1,"Annihilape":1,"Blastoise-Mega":1,"Ninetales-Alola":1,"Venusaur":1,"Baxcalibur-Mega":1,"Maushold":1,"Dragonite-Mega":1,"Hatterene":1,"Tyranitar":1,"Ceruledge":1,"Aerodactyl-Mega":1,"Glimmora-Mega":1,"Corviknight":1,"Absol-Mega-Z":1,"Camerupt-Mega":1,"Talonflame":1,"Espathra":1,"Dragapult":1,"Raichu-Mega-X":1}}};
// Rating blend (doubles): win-rate prior for few-game Pokémon, popularity weight, stats weight, popularity of a Pokémon no source lists.
const RG = Object.assign({pp0: 40, pp1: .15, wpop: .4, wi: .05, absent: 4}, (typeof RATING_W === 'object' && RATING_W) || {});
function ratings() {
  const key = S.format + '|' + metaVersion + '|' + ui.metaSrc;
  if (ratingCache.key === key) return ratingCache.map;
  const dbl = S.format === 'doubles', th = metaThreats(), W = th.reduce((a, o) => a + o.w, 0) || 1;
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
    const tm = RT_MOVES[dbl ? 'doubles' : 'singles']; let mvPts = 0; for (const n in tm) if (learn.has(n)) mvPts += tm[n]; tools += Math.min(16, mvPts);
    const L = [...learn].map(n => mvByName.get(n)).filter(Boolean);
    if (dbl && L.some(m => m.spread && m.bp >= 60 && p.t.includes(m.type) && m.cat > 0)) tools += 6;
    if (L.some(m => ROLE.prio.includes(m.name) && p.t.includes(m.type))) tools += 3;
    if (RT_SETUP.some(n => learn.has(n))) tools += 4;
    return {p, off, bulk, spe, slowNuke: spe <= 55 && off >= 110, dv: dv / W, ov: ov / W, tools};
  });
  const P = k => pctRanks(raw.map(r => r[k])), pOff = P('off'), pBulk = P('bulk'), pSpe = P('spe'), pDv = P('dv'), pOv = P('ov'), pTools = P('tools');
  const intr0 = raw.map((r, i) => {
    const power = .45 * pOff[i] + .35 * pBulk[i] + .2 * Math.max(pSpe[i], dbl && r.slowNuke ? 70 : 0);
    const typing = .55 * pDv[i] + .45 * pOv[i];
    return {power, typing, tools: pTools[i], v: .45 * power + .25 * typing + .30 * pTools[i]}; });
  const pIntr = pctRanks(intr0.map(x => x.v));
  // Evidence from five outside sources (perfdata.js): Limitless tournaments, official VGC events, Showdown ladder win rates
  // (adjusted for the rating of the players using each Pokémon), Smogon 1760+ usage and the top 10% of Showdown replays.
  // Win rates are shrunk toward each source's average for small samples and put on one scale (z-scores); popularity is
  // averaged across sources. Confidence grows with the number of real games behind the numbers.
  const PD = activePerf(), map = new Map(), EX = (typeof PERF_EXCLUDE === 'object' && PERF_EXCLUDE) || {};
  const SRC = dbl && PD ? perfModel(PD, EX) : null;
  // Win model (real games, player skill removed): half of each Pokémon's win-rate score, so support Pokémon that strong
  // players run aren't judged only on raw win rates.
  let MP = null; if (dbl && typeof modelOK === 'function' && modelOK()) { const ks = Object.keys(META.model.mons).filter(n => byName.has(n)); const pr = pctRanks(ks.map(n => META.model.mons[n])); MP = new Map(ks.map((n, i) => [n, pr[i]])); }
  raw.forEach((r, i) => { const p = r.p, intr = pIntr[i];
    let evidence = 0, conf = 0, usage = null, wr = null, matches = null, perf = null, rank = null, src = null, pop = null, wrMean = null;
    let popC = null;
    if (SRC && SRC.has(p.n)) { const e = SRC.get(p.n); pop = e.popularity; evidence = e.evidence; conf = e.conf; perf = e.perf; usage = e.usage; wr = e.wr; wrMean = e.wrMean; matches = e.matches; src = e.src; popC = e.popularity;
      // the win model's rank is a 0-100 percentile, while perf is 50 + 18 z: put the model on the same z scale before averaging
      if (MP && MP.has(p.n) && perf != null) perf = .5 * perf + .5 * Math.max(0, Math.min(100, 50 + 18 * probit(Math.max(.01, Math.min(.99, MP.get(p.n) / 100))))); }
    else if (SRC) popC = RG.absent;
    else if (!dbl && PD && PD.singlesRank[p.n]) { rank = PD.singlesRank[p.n]; pop = 100 * (1 - (rank - 1) / PD.singlesTotal);
      evidence = 100 * Math.pow(1 - (rank - 1) / PD.singlesTotal, 1.5); conf = .75; }
    else { const v = viability(p); if (v >= 25) { evidence = v; conf = .5; } }
    const prior = .6 * intr;
    let total, ppV = null;
    // Doubles with tournament data: how often a Pokémon is picked is known for every Pokémon from 10,000+ teams, so it
    // always counts in full. Only the win-rate half is shrunk toward a stat-based guess when there are few games.
    // (Before, a Pokémon nobody uses was scored almost entirely on its stats and could outrank proven staples.)
    if (dbl && SRC && popC != null) { const pp = ppV = conf * (perf != null ? perf : 50) + (1 - conf) * (RG.pp0 + RG.pp1 * intr);
      evidence = (1 - RG.wpop) * pp + RG.wpop * popC; total = Math.round(Math.max(1, Math.min(99, (1 - RG.wi) * evidence + RG.wi * intr))); }
    else total = Math.round(Math.max(1, Math.min(99, .85 * (conf * evidence + (1 - conf) * prior) + .15 * intr)));
    const proven = dbl ? (usage != null ? usage >= 2 : viability(p) >= 45) : (rank != null ? rank <= 60 : viability(p) >= 45);
    map.set(p.n, {total, raw: total, win: ppV == null ? null : Math.round(ppV), popAll: popC == null ? null : Math.round(popC), intrinsic: Math.round(intr), power: Math.round(intr0[i].power), typing: Math.round(intr0[i].typing), tools: Math.round(intr0[i].tools),
      evidence: Math.round(evidence), conf: +conf.toFixed(2), band: Math.round(3 + 15 * (1 - conf)), perf: perf == null ? null : Math.round(perf), pop: pop == null ? null : Math.round(pop), usage, wr, wrMean, matches, rank, src, meta: Math.round(evidence), proven}); });
  { let mx = 0; for (const v of map.values()) mx = Math.max(mx, v.raw); const f = mx > 0 ? 95 / mx : 1; for (const v of map.values()) v.total = Math.max(1, Math.min(99, Math.round(v.raw * f))); }
  ratingCache = {key, map}; return map;
}
function rating(p) { const r = ratings().get(p.n); return r || {total: 0, intrinsic: 0, power: 0, typing: 0, tools: 0, meta: 0, adj: 0, proven: false}; }
// A strong Pokémon the meta mostly ignores.
// A strong Pokémon the meta mostly ignores, and that hasn't been tried and found wanting (a big sample with a poor win rate rules it out).
// A proven loser: 400+ Limitless games, its own share of team wins clearly negative AND a raw tournament win rate of
// 46.5% or less (both, so supports like Indeedee that lose on paper but enable winning teams aren't caught).
// Suggestions skip these unless Fun mode is on; you can still add them yourself.
let trapCache = {key: null, set: null};
function isTrap(p) { if (!p || S.fun || S.format !== 'doubles') return false; const key = metaVersion;
  if (trapCache.key !== key) { const PD = activePerf(), set = new Set();
    if (PD && PD.adj) for (const n in PD.adj) { const [b, g, , lw] = PD.adj[n], t = PD.doubles && PD.doubles[n], wr = lw != null ? lw : (t && t[2] >= 300 ? t[1] : null);
      if (g >= 400 && b <= -.05 && wr != null && wr <= 46.5) set.add(n); }
    trapCache = {key, set}; }
  return trapCache.set.has(p.n); }
// Untested: few tournament games behind it, so it's an idea rather than a proven pick (hidden gems have their own tag).
function ideaTag(p) { if (S.format !== 'doubles') return ''; const r = rating(p); if (isGem(p) || (r.matches || 0) >= 300 || (r.src && r.src.adj && r.src.adj[1] >= 300)) return '';
  return '<span class="tag idea" title="Few tournament games behind it: an untested idea, not a proven pick">IDEA</span>'; }
// win rates are judged against their source's own average (tournament sources sit well above 50%), not against 50%
// inverse of the standard normal CDF (Acklam's approximation, error < 1e-8): turns a percentile into a z-score
function probit(p) { const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239], b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572], c = [-.007784894002430293, -.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783], d = [.007784695709041462, .3224671290700398, 2.445134137142996, 3.754408661907416];
  if (p < .02425) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - .02425) return -probit(1 - p);
  const q = p - .5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
function isGem(p) { const r = rating(p), m = r.wrMean != null && isFinite(r.wrMean) ? r.wrMean : 50; return !r.proven && r.total >= 55 && !(r.matches >= 60 && r.wr < m + 2) && !(r.matches >= 25 && r.wr < m); }


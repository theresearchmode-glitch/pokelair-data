// ---------- team strategy: viability, roles, archetypes ----------
// Built from 2026 Worlds (Reg M-B) top 8, the best M-C tournament teams, and VGC team-building practice.
const SPEED_MOVES = new Set(['Tailwind','Trick Room','Icy Wind','Electroweb','Thunder Wave','Rock Tomb','Nuzzle','Glare','Scary Face','Bulldoze','Sticky Web']);
const REDIRECT_MOVES = new Set(['Follow Me','Rage Powder']);
const WEATHER_SPEED = {'Swift Swim':'Water','Chlorophyll':'Fire','Sand Rush':'Rock','Slush Rush':'Ice'};
const ARCH = {
  rain: {name:'Rain', setAb:['Drizzle'], abAb:['Swift Swim','Rain Dish','Dry Skin','Hydration'], abMv:['Electro Shot','Hurricane','Thunder','Weather Ball'], abN:['Archaludon','Basculegion','Basculegion-F','Golisopod-Mega','Swampert-Mega','Barbaracle-Mega','Blastoise-Mega','Pelipper','Politoed']},
  sun:  {name:'Sun', setAb:['Drought','Mega Sol'], abAb:['Chlorophyll','Solar Power','Flower Gift'], abMv:['Solar Beam','Weather Ball','Eruption'], abN:['Venusaur','Volcarona','Armarouge','Torkoal','Charizard-Mega-Y','Meganium-Mega','Scovillain-Mega']},
  sand: {name:'Sand', setAb:['Sand Stream'], abAb:['Sand Rush','Sand Force'], abMv:[], abN:['Excadrill','Garchomp-Mega','Steelix-Mega','Garganacl']},
  snow: {name:'Snow', setAb:['Snow Warning'], abAb:['Slush Rush','Ice Body'], abMv:['Blizzard','Aurora Veil'], abN:['Baxcalibur-Mega','Baxcalibur','Ninetales-Alola','Froslass-Mega']},
  // terrains (Reg M-C): setters on switch-in, abusers by ability, signature move, matching seed (Unburden Sneasler) or same-type attacks
  psy:  {name:'Psychic Terrain', terrain:true, setAb:['Psychic Surge'], abAb:[], abMv:['Expanding Force'], seed:'Psychic Seed', abN:['Gardevoir-Mega','Armarouge','Hatterene','Indeedee','Indeedee-F','Alakazam-Mega']},
  grassy: {name:'Grassy Terrain', terrain:true, setAb:['Grassy Surge','Seed Sower'], abAb:['Grass Pelt'], abMv:['Grassy Glide'], seed:'Grassy Seed', abN:['Rillaboom','Arboliva','Meganium-Mega']},
  elec: {name:'Electric Terrain', terrain:true, setAb:['Electric Surge'], abAb:['Surge Surfer'], abMv:['Rising Voltage'], seed:'Electric Seed', abN:['Raichu-Mega-X','Pincurchin','Archaludon']},
  misty: {name:'Misty Terrain', terrain:true, setAb:['Misty Surge'], abAb:[], abMv:['Misty Explosion'], seed:'Misty Seed', abN:[]},
  tr:   {name:'Trick Room'},
  tw:   {name:'Tailwind'}
};
const WEATHER_OF = {Drizzle:'rain', Drought:'sun', 'Mega Sol':'sun', 'Sand Stream':'sand', 'Snow Warning':'snow'};
// Terrain setters (abilities) and the type each terrain boosts by 30% for grounded attackers.
const TERRAIN_OF = {'Psychic Surge':'psy', 'Grassy Surge':'grassy', 'Seed Sower':'grassy', 'Electric Surge':'elec', 'Misty Surge':'misty'};
const T_TYPE = {psy: 'Psychic', grassy: 'Grass', elec: 'Electric', misty: null};
const grounded = m => !(m.types || m.p.t).includes('Flying') && m.ability !== 'Levitate';
// How often m's players hold this item (0..1), from the meta sets.
function itemShare(m, item) { if (!item) return 0; const it = (setFor(m.p).it || []).find(([n]) => n === item); return it ? (it[1] == null ? .5 : it[1] / 100) : 0; }
// Abusers of a field condition (weather or terrain) on this team, not counting setters unless they're signature users.
function fieldAbusers(team, key, setters) { const A = ARCH[key];
  return team.filter(m => (!setters.includes(m) || A.abN.includes(m.p.n)) && (A.abAb.includes(m.ability) || A.abN.includes(m.p.n) || A.abMv.some(x => roleMoves(m).has(x)) || itemShare(m, A.seed) >= .25)); }

// Moves a member is assumed to run: the ones you picked, else the moves at least a quarter of players run.
function roleMoves(m) {
  if (m.custom) return new Set((m.moves || []).map(x => x.name));
  const st = setFor(m.p);
  if (st.mv.length) return new Set(st.mv.filter(([, v]) => v == null || v >= 25).map(([n]) => n));
  return new Set(popularMoves(m.p).slice(0, 4).map(x => x.name));
}
function isSlow(p) { return p.sp != null && p.sp <= 60 && p.st && Math.max(p.st[1], p.st[3]) >= 95; }

// Viability 0-100 from in-game rank, tournament use and ladder usage for the current format.
let vCache = new Map();
// Find a row for p in a meta list. Rows often use the base name for a Mega (the in-game data does);
// the row's top item tells which form it really describes. Returns a score multiplier: 1 = this form, .25 = another form.
function rowFor(doc, p) {
  if (!doc || !doc.top) return null;
  // the same Pokémon, or its own Mega / its pre-Mega form. Different forms of a species (Indeedee and Indeedee-F, Rotom
  // forms, Alolan Raichu) are different Pokémon and never share a row.
  const fam = q => q ? (q.m ? ROSTER.find(f => f.b === q.b && !f.m && f.n === q.b) || ROSTER.find(f => f.b === q.b && !f.m && f.n.startsWith(q.b)) || q : q) : null, fp = fam(p);
  const rows = doc.top.filter(t => { if (t.n === p.n) return true; const q = byName.get(t.n); return !!q && (q.m || p.m) && fam(q) === fp; });
  let best = null;
  for (const t of rows) { const rp = byName.get(t.n); if (!rp) continue;
    // a species row with no item data (the in-game list) covers the plain form and its Megas together: share it out by how
    // tournament players split the species, so plain Charizard isn't credited with Mega Charizard's rank
    const sh = (!t.it || !t.it.length) && !rp.m ? formShare(rp, p) : null;
    const scale = sh != null ? Math.max(.25, sh) : (megaFormFor(rp, t).n === p.n ? 1 : .25);
    if (!best || scale > best.scale || (scale === best.scale && t.r < best.t.r)) best = {t, scale}; }
  return best;
}
// p's share of its species (plain form + Megas) in tournament teams, or null when the species has no Mega or no data.
// Regional forms have no Mega of their own, so they're never split with the base form's Megas.
function formShare(row, p) { if (row.n !== row.b || (p.b !== row.b) || (!p.m && p.n !== p.b)) return null;
  const fam = ROSTER.filter(f => f.b === row.b && (f.n === row.n || f.m)); if (fam.length < 2) return null;
  const T = META.doubles_tour, top = T ? [...(T.top || []), ...(T.more || [])] : []; const teams = n => ((top.find(x => x.n === n) || {}).teams) || 0;
  const tot = fam.reduce((a, f) => a + teams(f.n), 0); return tot > 0 ? teams(p.n) / tot : null; }
function viability(p) {
  const key = S.format + '|' + p.n; if (vCache.has(key)) return vCache.get(key);
  let v = 0;
  // top 31 ranks fall from 100 to 31; below that it keeps falling gently (rank 256 ≈ 10) instead of flattening at 30
  const rankScore = (r) => r <= 31 ? 100 - (r - 1) * 2.3 : Math.max(10, 31 - (r - 31) * 21 / 225);
  const usageScore = (u) => u > 0 ? Math.min(100, 20 + u * 2) : 0;
  if (S.format === 'singles') {
    const d = META.singles; const hit = rowFor(d, p); if (hit) v = Math.max(v, rankScore(hit.t.r) * hit.scale);
    const su = d && d.smogon && d.smogon.usage ? (d.smogon.usage.find(x => x[0] === p.n) || [0, 0])[1] : (p.us || 0);
    v = Math.max(v, usageScore(su));
  } else {
    const ig = META.doubles_ingame; const hit = rowFor(ig, p); if (hit) v = Math.max(v, rankScore(hit.t.r) * hit.scale);
    if (ig && ig.more) { const mm = ig.more.find(x => x.n === p.n) || (!p.m && ig.more.find(x => x.n === p.b && !byName.get(p.b + '-Mega'))); if (mm) v = Math.max(v, rankScore(mm.r)); }
    const tour = META.doubles_tour; if (tour && tour.top) { const max = Math.max(...tour.top.map(x => x.teams || 0), 1);
      const tt = tour.top.find(x => x.n === p.n) || (tour.more || []).find(x => x.n === p.n); if (tt && tt.teams) v = Math.max(v, 30 + 70 * tt.teams / max); }
    const d = META.doubles; const u = d && d.top ? ((d.top.find(y => y.n === p.n) || {}).u || 0) : (p.u || 0);
    v = Math.max(v, usageScore(u));
  }
  if (v === 0) v = Math.max(0, Math.min(18, ((p.s || 450) - 450) / 5));
  v = Math.round(v); vCache.set(key, v); return v;
}
// Fun mode: rank Pokémon by raw power and by how well they fix the team, not by how popular they are.
// Meta picks still count, just less, so a niche Pokémon that solves the problem can win the slot.
function rawPower(p) { return Math.max(0, Math.min(60, ((p.s || 450) - 430) / 4)); }
function isMetaPick(p) { return viability(p) >= 45; }
// Normal mode: half popularity, half our rating, so strong unproven Pokémon can win a slot on fit. Fun mode: our intrinsic score, meta picks discounted.
function pickVia(p) { if (!S.fun) return Math.round(.5 * viability(p) + .5 * rating(p).total); return Math.round(.8 * rating(p).intrinsic + (isMetaPick(p) ? -12 : viability(p) < 25 ? 6 : 0)); }
function poolOK(p, min) { return S.fun ? (rating(p).total >= 35 || !!p.m) : viability(p) >= min || rating(p).total >= 62; }
// The ability most players run on p, from the meta data, if it's one p can have.
function metaAbility(p) { const t = metaEntry(p); if (!t || !t.ab || !t.ab.length) return null; const a = t.ab[0][0]; return p.a.includes(a) ? a : null; }
function vLabel(v) { return v >= 70 ? 'Top tier' : v >= 45 ? 'Strong' : v >= 25 ? 'Solid' : v >= 12 ? 'Niche' : 'Fringe'; }

// What the team does: speed control, Fake Out, redirection, Intimidate, active archetypes.
function teamRoles(team) {
  const r = {speed: [], fake: [], redirect: [], intim: [], arch: [], weathers: new Set()};
  const mv = team.map(m => ({m, set: roleMoves(m)}));
  for (const {m, set} of mv) {
    if ([...set].some(x => SPEED_MOVES.has(x))) r.speed.push(m);
    if (set.has('Fake Out')) r.fake.push(m);
    if ([...set].some(x => REDIRECT_MOVES.has(x))) r.redirect.push(m);
    if (m.ability === 'Intimidate') r.intim.push(m);
    if (WEATHER_OF[m.ability]) r.weathers.add(WEATHER_OF[m.ability]);
  }
  r.terrains = new Set(team.filter(m => TERRAIN_OF[m.ability]).map(m => TERRAIN_OF[m.ability]));
  for (const key of ['rain', 'sun', 'sand', 'snow', 'psy', 'grassy', 'elec', 'misty']) {
    const A = ARCH[key];
    const setters = mv.filter(({m}) => A.setAb.includes(m.ability)).map(x => x.m);
    if (!setters.length) continue;
    const abusers = fieldAbusers(team, key, setters);
    r.arch.push({key, name: A.name, setters, abusers, active: abusers.length > 0, terrain: !!A.terrain});
  }
  const trSet = mv.filter(({set}) => set.has('Trick Room')).map(x => x.m);
  if (trSet.length) { const ab = team.filter(m => isSlow(m.p) && !trSet.includes(m)); r.arch.push({key: 'tr', name: 'Trick Room', setters: trSet, abusers: ab, active: ab.length > 0}); }
  const tw = mv.filter(({set}) => set.has('Tailwind')).map(x => x.m);
  if (tw.length) r.arch.push({key: 'tw', name: 'Tailwind', setters: tw, abusers: [], active: true});
  // weather-boosted speed counts as speed control when the team sets that weather
  for (const m of team) { const w = WEATHER_SPEED[m.ability]; if (w && [...r.weathers].some(k => ({rain:'Water',sun:'Fire',sand:'Rock',snow:'Ice'})[k] === w) && !r.speed.includes(m)) r.speed.push(m); }
  return r;
}
// How well a candidate fits the team's active archetypes.
function archFit(p, ability, team, roles) {
  let s = 0; const why = [];
  const set = roleMoves({p});
  for (const a of roles.arch) {
    if (!a.active && a.key !== 'tw') continue;
    if (a.key === 'tr') { if (isSlow(p)) { s += 30; why.push('slow hitter for your Trick Room'); } else if (set.has('Trick Room')) { s += 15; why.push('second Trick Room setter'); }
      else if (p.sp >= 95 && !roles.arch.some(b => b.key === 'tw')) { s -= 25; why.push('fast, so it only helps outside Trick Room'); } continue; }
    if (a.key === 'tw') continue;
    const A = ARCH[a.key];
    if (A.abAb.includes(ability) || A.abN.includes(p.n) || A.abMv.some(x => set.has(x)) || itemShare({p}, A.seed) >= .25) { s += 20; why.push(`fits your ${A.name} (${a.setters.map(x => x.d).join(', ')})`); }
  }
  const myW = WEATHER_OF[ability];
  if (myW && roles.weathers.size && !roles.weathers.has(myW)) { s -= 30; why.push(`its ${ARCH[myW].name.toLowerCase()} clashes with your weather`); }
  const myT = TERRAIN_OF[ability];
  if (myT && roles.terrains && roles.terrains.size && !roles.terrains.has(myT)) { s -= 25; why.push(`its ${ARCH[myT].name} would overwrite yours`); }
  return {s, why};
}


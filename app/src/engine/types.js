// Team type engine: type chart, defensive rating (same rule as the original team type calculator), abilities and offense.
// Shared by the page and the Node tests.
const TYPES = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
// EFF[attacker][defender]
const EFF = (() => {
  const se = {Normal:{Rock:.5,Ghost:0,Steel:.5},Fire:{Fire:.5,Water:.5,Grass:2,Ice:2,Bug:2,Rock:.5,Dragon:.5,Steel:2},Water:{Fire:2,Water:.5,Grass:.5,Ground:2,Rock:2,Dragon:.5},Electric:{Water:2,Electric:.5,Grass:.5,Ground:0,Flying:2,Dragon:.5},Grass:{Fire:.5,Water:2,Grass:.5,Poison:.5,Ground:2,Flying:.5,Bug:.5,Rock:2,Dragon:.5,Steel:.5},Ice:{Fire:.5,Water:.5,Grass:2,Ice:.5,Ground:2,Flying:2,Dragon:2,Steel:.5},Fighting:{Normal:2,Ice:2,Poison:.5,Flying:.5,Psychic:.5,Bug:.5,Rock:2,Ghost:0,Dark:2,Steel:2,Fairy:.5},Poison:{Grass:2,Poison:.5,Ground:.5,Rock:.5,Ghost:.5,Steel:0,Fairy:2},Ground:{Fire:2,Electric:2,Grass:.5,Poison:2,Flying:0,Bug:.5,Rock:2,Steel:2},Flying:{Electric:.5,Grass:2,Fighting:2,Bug:2,Rock:.5,Steel:.5},Psychic:{Fighting:2,Poison:2,Psychic:.5,Dark:0,Steel:.5},Bug:{Fire:.5,Grass:2,Fighting:.5,Poison:.5,Flying:.5,Psychic:2,Ghost:.5,Dark:2,Steel:.5,Fairy:.5},Rock:{Fire:2,Ice:2,Fighting:.5,Ground:.5,Flying:2,Bug:2,Steel:.5},Ghost:{Normal:0,Psychic:2,Ghost:2,Dark:.5},Dragon:{Dragon:2,Steel:.5,Fairy:0},Dark:{Fighting:.5,Psychic:2,Ghost:2,Dark:.5,Fairy:.5},Steel:{Fire:.5,Water:.5,Electric:.5,Ice:2,Rock:2,Steel:.5,Fairy:2},Fairy:{Fire:.5,Fighting:2,Poison:.5,Dragon:2,Dark:2,Steel:.5}};
  const o = {}; TYPES.forEach(a => { o[a] = {}; TYPES.forEach(d => o[a][d] = (se[a][d] ?? 1)); }); return o;
})();
// Abilities that change what hits a Pokémon defensively.
const ABILITY_MODS = {
  'Levitate':{Ground:0}, 'Eelevate':{Ground:0}, 'Earth Eater':{Ground:0},
  'Flash Fire':{Fire:0}, 'Well-Baked Body':{Fire:0},
  'Water Absorb':{Water:0}, 'Storm Drain':{Water:0}, 'Dry Skin':{Water:0, Fire:1.25},
  'Volt Absorb':{Electric:0}, 'Lightning Rod':{Electric:0}, 'Motor Drive':{Electric:0},
  'Sap Sipper':{Grass:0},
  'Thick Fat':{Fire:.5, Ice:.5}, 'Heatproof':{Fire:.5}, 'Water Bubble':{Fire:.5},
  'Purifying Salt':{Ghost:.5}, 'Fluffy':{Fire:2},
};
function mult(atk, types, ability, useAbility = true) {
  let x = 1; for (const t of types) x *= EFF[atk][t];
  if (useAbility && ability && ABILITY_MODS[ability] && ABILITY_MODS[ability][atk] !== undefined) x *= ABILITY_MODS[ability][atk];
  return x;
}
// members: [{types:[..], ability}] ; returns per-type weak/resist counts + rating
function analyze(members, useAbility = true) {
  const rows = TYPES.map(atk => {
    let w = 0, r = 0, imm = 0; const who = [];
    members.forEach((m, i) => { const x = mult(atk, m.types, m.ability, useAbility);
      if (x >= 2) { w++; who.push({i, x}); } else if (x <= .5) { r++; if (x === 0) imm++; } });
    return {atk, w, r, imm, net: r - w, who};
  });
  const excess = rows.reduce((s, t) => s + Math.max(0, t.w - t.r), 0); // leftover weakness count
  const weak = rows.filter(t => t.w > t.r).map(t => t.atk);
  const unresisted = rows.filter(t => t.r === 0).map(t => t.atk);
  const labels = ['Outstanding','Relatively Superior','Above Average','Decent'];
  return {rows, excess, weak, unresisted, rating: members.length ? (labels[excess] || 'Below Average') : '—'};
}
// lower is better
function score(a) { return a.excess * 100 + a.unresisted.length * 10 + a.rows.reduce((s, t) => s + Math.max(0, t.w - t.r + 1) * 0.1, 0); }
function memberFrom(p, ability) { return {name: p.n, types: p.t, ability: ability ?? bestAbility(p), mega: p.m, base: p.b}; }
// Competitive default: a type-changing ability first, then common VGC picks, else the first listed.
const PREFERRED = ['Intimidate','Drizzle','Drought','Sand Stream','Snow Warning','Grassy Surge','Psychic Surge','Electric Surge','Misty Surge','Prankster','Liquid Voice','Good as Gold','Multiscale','Defiant','Supreme Overlord','Mold Breaker','Regenerator','Unseen Fist','Swift Swim','Chlorophyll','Sharpness','Tough Claws','Huge Power','Adaptability','Friend Guard','Armor Tail','Fur Coat','Stamina','Rough Skin','Moxie','Protean','Libero','Speed Boost','Competitive','Unaware','Magic Bounce','Inner Focus','Infiltrator'];
function bestAbility(p) {
  let best = null, bs = 0;
  for (const a of p.a) { const m = ABILITY_MODS[a]; if (!m) continue; const v = Object.values(m).filter(x => x < 1).length; if (v > bs) { bs = v; best = a; } }
  if (best) return best;
  for (const a of PREFERRED) if (p.a.includes(a)) return a;
  return p.a[0];
}
if (typeof module !== 'undefined') module.exports = {TYPES, EFF, ABILITY_MODS, mult, analyze, score, memberFrom, bestAbility};
// ---------- Offense ----------
const ATE = {Aerilate:'Flying', Pixilate:'Fairy', Refrigerate:'Ice', Galvanize:'Electric', Dragonize:'Dragon'};
const BREAKERS = new Set(['Mold Breaker','Teravolt','Turboblaze']);
// Moves that don't threaten through the type chart: fixed damage, counters, and openers.
const NO_COVERAGE = new Set(['Fake Out','First Impression','Seismic Toss','Night Shade','Super Fang','Endeavor','Final Gambit','Counter','Mirror Coat','Metal Burst','Ruination','Psywave','Bide','Nature\'s Madness','Comeuppance']);
const WEATHER = {Drizzle:'Water', 'Primordial Sea':'Water', Drought:'Fire', 'Mega Sol':'Fire', 'Sand Stream':'Rock', 'Snow Warning':'Ice'};
const TERRAIN = {'Grassy Surge':'Grass', 'Psychic Surge':'Psychic', 'Electric Surge':'Electric', 'Misty Surge':'Fairy'};
// Team context: which weather and terrain the team sets itself.
function teamContext(members) {
  const ctx = {weather: null, terrain: null};
  for (const m of members) { if (!ctx.weather && WEATHER[m.ability]) ctx.weather = WEATHER[m.ability]; if (!ctx.terrain && TERRAIN[m.ability]) ctx.terrain = TERRAIN[m.ability]; }
  return ctx;
}
// A move counts as coverage when it is damaging, not on the list above, and has real power (above 40, or variable power).
function isCoverage(m) { return m && m.cat > 0 && !NO_COVERAGE.has(m.name) && (m.bp === 0 || m.bp > 40); }
// moves: [{name,type,cat,bp,sound}] ; returns attacking entries
function attackEntries(member, moves, ctx = {}) {
  const ab = member.ability; const dmg = moves.filter(isCoverage);
  const base = {from: member.name, breaker: BREAKERS.has(ab), scrappy: ab === 'Scrappy' || ab === "Mind's Eye", tinted: ab === 'Tinted Lens'};
  if (!dmg.length) return member.types.map(t => ({...base, type: t, move: 'STAB', stabOnly: true}));
  return dmg.map(m => { let t = m.type; const e = {...base, move: m.name};
    if (m.name === 'Weather Ball' && ctx.weather) t = ctx.weather;
    else if (m.name === 'Terrain Pulse' && ctx.terrain) t = ctx.terrain;
    else if (t === 'Normal' && ATE[ab]) t = ATE[ab];
    if (ab === 'Liquid Voice' && m.sound) t = 'Water';
    if (m.name === 'Freeze-Dry') e.freezeDry = true;
    if (m.name === 'Flying Press') e.flyingPress = true;
    if (m.name === 'Thousand Arrows') e.groundsFlying = true;
    e.type = t; return e; });
}
function hitMult(e, defTypes, defAbility) {
  let x = 1;
  for (const d of defTypes) {
    let f = EFF[e.type][d];
    if (e.scrappy && d === 'Ghost' && (e.type === 'Normal' || e.type === 'Fighting')) f = 1;
    if (e.freezeDry && d === 'Water') f = 2;
    if (e.groundsFlying && d === 'Flying') f = 1;
    if (e.flyingPress) f *= EFF.Flying[d];
    x *= f;
  }
  if (!e.breaker && defAbility && ABILITY_MODS[defAbility] && ABILITY_MODS[defAbility][e.type] !== undefined && !(e.groundsFlying && e.type === 'Ground')) x *= ABILITY_MODS[defAbility][e.type];
  if (e.tinted && x > 0 && x < 1) x *= 2;
  return x;
}
function bestHit(entries, defTypes, defAbility) {
  let best = null;
  for (const e of entries) { const x = hitMult(e, defTypes, defAbility); if (!best || x > best.x) best = {x, e}; }
  return best;
}
// How many of the 18 single types the team hits super effectively.
function offenseCount(entries) { return TYPES.filter(t => entries.some(e => hitMult(e, [t], null) >= 2)).length; }
if (typeof module !== 'undefined') Object.assign(module.exports, {attackEntries, hitMult, bestHit, ATE, teamContext, isCoverage, offenseCount});


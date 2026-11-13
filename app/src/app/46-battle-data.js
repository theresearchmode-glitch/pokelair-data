// ---------- Battle mode: one screen for the 90 seconds of team preview ----------
// Enter their six (or read a screenshot) and everything that matters sits on one phone-sized page: your four and the
// leads, what to watch out for (immunities, Intimidate, Fake Out, redirection, weather), live speed order with Tailwind /
// Trick Room toggles, and damage both ways. It shares their six with Matchup (S.opp), so either page can fill it.
// weather 'auto' = whatever the likely leads set on turn 1 (sun from Mega Charizard Y, rain from Pelipper...)
let bmUi = {tab: 'plan', tw: false, twOpp: false, tr: false, icy: false, weather: 'auto', intMe: false, intThem: false, t0: 0, timer: null};
// best hit with the field toggles: weather/terrain, and -1 Attack on physical moves when that side is Intimidated.
// aMem/dMem: your own member on that side, so its real item and spread are used
function bmHit(aP, moves, dP, weather, intim, aMem, dMem, terrain) {
  let best = null; const A = {p: aP, ...sideDefaults(aP, 'atk', aMem)}, D = {p: dP, ...sideDefaults(dP, 'def', dMem)};
  for (const mv of moves || []) { if (!mv || !mv.bp) continue;
    const r = damage({atk: {...A, boost: intim && mv.cat === 1 ? -1 : 0}, def: D, move: mv, spread: !!mv.spread, weather, terrain: terrain || ''}); if (!r || !r.hp) continue;
    // weigh by what you can count on (accuracy, charging turn, recharge), the same way the hit tables do
    const ch = chargesFirst(mv, weather, A.item), acc = moveAcc(mv, A.ability, weather, D, A.item), val = r.max * acc / 100 * (ch ? .5 : 1) * (mv.recharge ? .7 : 1);
    if (!best || val > best.val) best = {mv, r, val, charge: ch, acc, recharge: !!mv.recharge}; }
  return best; }
// weather: the weather in play (Chlorophyll/Swift Swim/Sand Rush/Slush Rush double Speed in theirs); Unburden's doubled
// speed after its item is used comes back as unb
function bmSpeed(p, me, mem, weather) { const s = likelySpeed(p, me ? mem : null), ab = me && mem ? mem.ability : abilityOf(mem && mem.p ? mem : {p});
  const o = {tw: me ? bmUi.tw : bmUi.twOpp, icy: !me && bmUi.icy, par: !me && bmUi.par}, v = spdCalc(s.v, s.scarf, ab, weather || '', o);
  return {v, s, wxUp: speedMul(ab, weather || '') > 1, ab, unb: ab === 'Unburden' && !s.scarf ? spdCalc(s.v, s.scarf, ab, weather || '', {...o, unb: true}) : null}; }
// What to watch on each of their Pokémon, against your four
const BM_IMMUNE = {Levitate: 'Ground', 'Earth Eater': 'Ground', 'Flash Fire': 'Fire', 'Well-Baked Body': 'Fire', 'Water Absorb': 'Water', 'Storm Drain': 'Water', 'Dry Skin': 'Water',
  'Volt Absorb': 'Electric', 'Lightning Rod': 'Electric', 'Motor Drive': 'Electric', 'Sap Sipper': 'Grass'};
const BM_WEATHER = {Drought: 'sets sun', Drizzle: 'sets rain', 'Sand Stream': 'sets sand', 'Snow Warning': 'sets snow', 'Orichalcum Pulse': 'sets sun',
  'Psychic Surge': 'sets Psychic Terrain', 'Grassy Surge': 'sets Grassy Terrain', 'Electric Surge': 'sets Electric Terrain', 'Misty Surge': 'sets Misty Terrain'};
// plain text (R3, Nov 11): the drawing escapes it
function bmWatch(C, theirs) {
  const dmg = m => memberMoves(m).moves.filter(x => x && x.bp > 0), mvset = m => new Set(memberMoves(m).moves.map(x => x.name));
  const prio = C.filter(m => { const s = mvset(m); return s.has('Fake Out') || ROLE.prio.some(x => s.has(x)); });
  const phys = C.filter(m => dmg(m).some(x => x.cat === 1) && m.p.st[1] >= m.p.st[3]);
  const spreaders = C.filter(m => dmg(m).some(x => x.spread));
  return theirs.map(o => { const out = [], ab = o.ability || '', mv = new Set((o.moves || []).map(x => x.name)), nm = ms => ms.map(m => m.d).join(', ');
    const t = BM_IMMUNE[ab];
    if (t) { const hit = C.filter(m => dmg(m).some(x => x.type === t)); const draw = ['Lightning Rod', 'Storm Drain'].includes(ab);
      if (hit.length) out.push(['hi', `${ab}: ${draw ? 'pulls in and absorbs' : 'immune to'} ${t} moves`, `${nm(hit)}'s ${t} attacks`]); }
    if (ab === 'Intimidate' && phys.length) out.push(['mid', 'Intimidate', `−1 Attack to ${nm(phys)}`]);
    if (mv.has('Fake Out')) out.push(['mid', 'Fake Out', 'can flinch one of your leads turn 1']);
    if (mv.has('Follow Me') || mv.has('Rage Powder')) out.push(['mid', mv.has('Rage Powder') ? 'Rage Powder' : 'Follow Me', 'pulls your single-target attacks']);
    // durations as in the main games (Champions keeps them): Trick Room 5 turns and Tailwind 4, each counting the turn it's used
    if (mv.has('Trick Room')) out.push(['hi', 'Trick Room', 'slow Pokémon move first for the next 4 turns (5 counting the turn it\'s set)']);
    if (mv.has('Tailwind')) out.push(['mid', 'Tailwind', 'their side doubles Speed for the next 3 turns (4 counting the turn it\'s set)']);
    if (ab === 'Prankster') out.push(['mid', 'Prankster', 'status moves go first']);
    if (mv.has('Wide Guard') && spreaders.length) out.push(['mid', 'Wide Guard', `blocks spread moves from ${nm(spreaders)}`]);
    // Quick Guard (+3) blocks priority moves for its side this turn, Fake Out included
    if (mv.has('Quick Guard') && prio.length) out.push(['mid', 'Quick Guard', `blocks priority and Fake Out from ${nm(prio)} for a turn`]);
    // Protect variants that punish contact: Spiky Shield (1/8 damage), Baneful Bunker (poison), King's Shield (−1 Attack)
    for (const [k, w] of [['Spiky Shield', 'hurts contact attackers for 1/8 of their HP'], ['Baneful Bunker', 'poisons contact attackers'], ["King's Shield", 'lowers a contact attacker\'s Attack by 1']])
      if (mv.has(k)) { const ct = C.filter(m => dmg(m).some(x => x.contact)); if (ct.length) out.push(['lo', k, `protects (+4) and ${w}: ${nm(ct)}`]); }
    if (prio.length && (['Armor Tail', 'Queenly Majesty', 'Dazzling'].includes(ab) || ab === 'Psychic Surge')) out.push(['hi', ab, `blocks priority and Fake Out from ${nm(prio)}`]);
    if (BM_WEATHER[ab]) out.push(['lo', ab, BM_WEATHER[ab]]);
    // Sim, Nov 13 (Words Q2 B; shortened by Battle Q2 B): with two or more Mega stones only one can Mega Evolve, so the line says so instead of calling each 'likely'
    if (o.p.m) { const nM = theirs.filter(x => x.p && x.p.m).length; out.push(['lo', 'Mega', nM > 1 ? `one of ${nM === 2 ? 'two' : nM} Megas: only one can evolve` : 'likely their Mega this game']); }
    return {o, out}; }).filter(x => x.out.length); }
// ---------- the Battle plan as data (R3, Nov 11) ----------
// Everything the Battle page works out, with no HTML: which four to bring and who leads, their likely lead, the turn-1 field,
// what to watch on their side, the speed order, priority moves, damage both ways, the verdict from real games and turn one.
// Today's renderBattle draws from it, and so will the rebuild's Battle page. Speed toggles are read from bmUi (bmSpeed).
// Same output as before the split: experiments/same-battle.mjs.
function battlePlan(mine, theirs, ui = bmUi) {
  const dbl = S.format === 'doubles', r = planMatchup(mine, theirs, true), C = r.chosen.map(i => mine[i]);
  const ll = r.B && theirs.length >= 2 ? likelyLead(theirs, r.B) : [];
  // turn-1 field from both sides' leads (yours and their likely lead), used when the weather is on Auto
  const spdOf = x => { const o = x._orig || x, s = likelySpeed(x.p, C.includes(o) ? o : null); return s.scarf ? Math.floor(s.v * 1.5) : s.v; };
  const F1 = typeof turnOneField === 'function' ? turnOneField([...r.lead.map(i => mine[i]), ...(ll.length === 2 ? ll : theirs.slice(0, 2))], spdOf) : {weather: '', terrain: ''};
  const wNow = ui.weather === 'auto' ? (F1.wx != null ? F1.wx : F1.weather) : ui.weather, tNow = F1.terrain || ''; // terrain from the leads stays when you pick a weather by hand (Oct 30 audit)
  // speed: both sides in one order (slowest first under Trick Room), with ties across sides marked
  const rows = [...C.map(m => ({x: m, me: true})), ...theirs.map(o => ({x: o, me: false}))].map(q => ({...q, ...bmSpeed(q.x.p, q.me, q.x, wNow)}));
  rows.sort((a, b) => ui.tr ? a.v - b.v : b.v - a.v); rows.forEach((q, i) => { q.tie = rows.some((o, j) => j !== i && o.v === q.v && o.me !== q.me); });
  // your moves that always drop their Speed (Icy Wind, Electroweb…): the "−1" toggle is the order after you use one
  const spDrop = [...new Set(C.flatMap(m => memberMoves(m).moves.filter(mv => mv && (mv.sec || []).some(s => s[0] >= 100 && s[1] && s[1].spe < 0)).map(mv => mv.name)))];
  // moves that change turn order this battle: their bracket, from the move data (Fake Out +3, Protect +4, Trick Room −7…)
  const prioOf = (x, me) => { const ab = me ? x.ability : abilityOf(x); return (me ? memberMoves(x).moves : (x.moves || [])).filter(Boolean)
    .map(mv => [mv, movePrio(mv, ab, {terrain: tNow})]).filter(([mv, p]) => p !== 0 && !(mv.tg === 'self' && p === 4)).map(([mv, p]) => ({move: mv.name, prio: p, grassy: mv.name === 'Grassy Glide' && p === 1, who: x.d, me})); };
  const prio = [...C.flatMap(m => prioOf(m, true)), ...theirs.flatMap(o => prioOf(o, false))];
  // damage both ways: your best hit on each of theirs (a) and theirs on yours (d), with the Intimidate toggles
  const damage = C.map(m => theirs.map(o => ({a: bmHit(m.p, memberMoves(m).moves, o.p, wNow, ui.intMe, m, null, tNow), d: bmHit(o.p, o.moves, m.p, wNow, ui.intThem, null, m, tNow)})));
  /* from real games (Sim, Nov 8: "absolutely go with the real results"): how six-vs-six matchups like this one have gone in
     real tournaments, in words, and the Pokémon pairs that move it most. No percentage: the verdict is the point. */
  let real = null; try { real = realMatch(mine, theirs) || null; } catch (e) {}
  let turnOne = null; if (dbl) { try { turnOne = turnOneData(mine, theirs, r); } catch (e) {} }
  return {r, chosen: C, lead: r.lead, back: r.back, bench: r.bench, four: [...r.lead, ...r.back].map(i => mine[i].p.n), likelyLead: ll,
    twoMegas: r.chosen.filter(i => mine[i].mega).length > 1, field: F1, weather: wNow, terrain: tNow, watch: bmWatch(C, theirs),
    speed: rows, speedMax: Math.max(...rows.map(q => q.v), 1), spDrop, prio, damage, real, turnOne};
}

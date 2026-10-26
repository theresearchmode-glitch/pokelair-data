// ---------- game plan: the jobs a team needs, weighted by how reliably each member does them ----------
// Research (Oct 2026): of the 20 best-performing Reg M-C teams, 75% carry a reliable Tailwind or Trick Room
// setter (60% Tailwind, 35% Trick Room); the rest win with Fake Out pressure plus priority and self-speed.
// 85% have Fake Out or redirection, 75% a priority attacker, 50% a weather setter, and none mix two weathers.
// In Champions Tailwind lasts 4 turns, Trick Room 5, weather 5 (8 with its rock); the last weather setter in wins.
const ROLE = {
  tw: ['Tailwind'], tr: ['Trick Room'],
  drop: ['Icy Wind', 'Electroweb', 'Thunder Wave', 'Nuzzle', 'Glare', 'Bulldoze', 'Rock Tomb', 'Scary Face'],
  prio: ['Extreme Speed', 'Sucker Punch', 'Aqua Jet', 'Ice Shard', 'Bullet Punch', 'Mach Punch', 'Grassy Glide', 'Shadow Sneak', 'Jet Punch', 'Quick Attack', 'First Impression', 'Accelerock', 'Water Shuriken', 'Vacuum Wave', 'Upper Hand'],
  boost: ['Dragon Dance', 'Quiver Dance', 'Shell Smash', 'Agility', 'Flame Charge', 'Trailblaze', 'Rock Polish', 'Shift Gear'],
  fake: ['Fake Out'], redir: ['Follow Me', 'Rage Powder'], anti: ['Taunt', 'Encore', 'Imprison'],
  haz: ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'], hazrm: ['Rapid Spin', 'Defog', 'Mortal Spin', 'Court Change', 'Tidy Up'],
  pivot: ['U-turn', 'Parting Shot', 'Volt Switch', 'Flip Turn', 'Teleport', 'Chilly Reception', 'Shed Tail'],
};
const SELF_SPEED_AB = new Set(['Unburden', 'Speed Boost']);
const W_TYPE = {sun: 'Fire', rain: 'Water', sand: 'Rock', snow: 'Ice'};
// How reliably m uses one of these moves: 1 if you picked it, else the share of players who run it.
let relCache = new Map();
function relMove(m, names) {
  if (!m.custom) { const k = m.p.n + '|' + names[0] + '|' + names.length; let r = relCache.get(k); if (!r) { r = relMove_(m, names); relCache.set(k, r); } return r; }
  return relMove_(m, names);
}
function relMove_(m, names) {
  if (m.custom) { const x = (m.moves || []).find(y => names.includes(y.name)); return x ? [1, x.name] : [0, null]; }
  let best = [0, null];
  for (const [n, v] of setFor(m.p).mv) if (names.includes(n)) { const r = v == null ? .6 : v / 100; if (r > best[0]) best = [r, n]; }
  if (!best[1] && !setFor(m.p).mv.length) { const x = popularMoves(m.p).slice(0, 4).find(y => names.includes(y.name)); if (x) best = [.5, x.name]; }
  return best;
}
const anyOf = rs => 1 - rs.reduce((a, r) => a * (1 - r), 1);
const pctTxt = r => r >= .995 ? '' : ` ${Math.round(r * 100)}%`;
// Returns {rows, penalty}. rows: [{k, label, st: ok|part|miss|opt, who, note}]. Lower penalty is better.
function gamePlan(team, fmt) {
  fmt = fmt || S.format; const dbl = fmt === 'doubles';
  const has = k => team.map(m => { const [r, mv] = relMove(m, ROLE[k]); return {m, r, mv}; }).filter(x => x.r >= .15).sort((a, b) => b.r - a.r);
  const cov = xs => anyOf(xs.map(x => x.r));
  const who = (xs, n = 3) => xs.slice(0, n).map(x => `${x.m.d}${x.mv ? ' · ' + x.mv : ''}${pctTxt(x.r)}`).join(', ');
  const R = {}; for (const k in ROLE) R[k] = has(k);
  R.self = team.map(m => SELF_SPEED_AB.has(m.ability) ? {m, r: 1, mv: m.ability} : (x => ({m, r: x[0], mv: x[1]}))(relMove(m, ROLE.boost))).filter(x => x.r >= .15);
  // weather: setters, and who benefits (abilities, signature users and moves, plus same-type attackers)
  const setters = team.filter(m => WEATHER_OF[m.ability]).map(m => ({m, w: WEATHER_OF[m.ability]}));
  const kinds = [...new Set(setters.map(x => x.w))];
  const abusersOf = w => { const A = ARCH[w], set = s => roleMoves(s);
    return team.filter(m => (!setters.some(x => x.m === m && x.w === w) || A.abN.includes(m.p.n)) && (A.abAb.includes(m.ability) || A.abN.includes(m.p.n) || A.abMv.some(x => set(m).has(x)) || (m.types || m.p.t).includes(W_TYPE[w]))); };
  const needs = Object.keys(W_TYPE).filter(w => !kinds.includes(w) && team.some(m => ARCH[w].abAb.includes(m.ability) && WEATHER_SPEED[m.ability]));
  const wSpeed = kinds.length === 1 ? anyOf(team.filter(m => WEATHER_SPEED[m.ability] && ({Water: 'rain', Fire: 'sun', Rock: 'sand', Ice: 'snow'})[WEATHER_SPEED[m.ability]] === kinds[0]).map(() => .95)) : 0;
  const c = {tw: cov(R.tw), tr: cov(R.tr), drop: cov(R.drop), prio: cov(R.prio), self: cov(R.self), fake: cov(R.fake), redir: cov(R.redir), anti: cov(R.anti), haz: cov(R.haz), hazrm: cov(R.hazrm), pivot: cov(R.pivot)};
  const fast = Math.min(1, (R.prio.reduce((a, x) => a + x.r, 0) + R.self.reduce((a, x) => a + x.r, 0)) / 2.5);
  const rows = []; let pen = 0;
  const st = (v, ok, part) => v >= ok ? 'ok' : v >= part ? 'part' : 'miss';
  if (dbl) {
    // 1. a way to move first: Tailwind, Trick Room, weather speed, or (weaker) a pile of priority and self-speed
    const opts = [['Tailwind', c.tw, R.tw], ['Trick Room', c.tr, R.tr], ['weather speed', wSpeed * .9, []], ['priority and speed boosts', fast * .5, [...R.prio, ...R.self]]];  // priority alone never fully counts
    const primary = Math.max(...opts.map(o => o[1]));
    const main = opts.filter(o => o[1] >= .3).sort((a, b) => b[1] - a[1]);
    rows.push({k: 'speed', label: 'Speed control', st: st(primary, .6, .3),
      who: main.length ? main.slice(0, 2).map(o => o[2].length ? who(o[2], 2) : o[0] === 'weather speed' ? `${team.filter(m => WEATHER_SPEED[m.ability]).map(m => m.d).join(', ')} in ${ARCH[kinds[0]].name.toLowerCase()}` : o[0]).join('; ') : '',
      note: primary >= .6 ? '' : main.length ? 'Only priority moves. No reliable Tailwind or Trick Room, which 3 of 4 top teams carry.' : 'No Tailwind, Trick Room or weather speed. 3 of 4 top teams carry one.'});
    pen += 55 * (1 - primary);
    // 2. a second option, so one Taunt or one KO on the setter doesn't decide the game
    const modes = [c.tw >= .5, c.tr >= .5, wSpeed >= .5, c.drop >= .5, fast >= .5].filter(Boolean).length;
    rows.push({k: 'backup', label: 'Backup speed', st: modes >= 2 ? 'ok' : modes === 1 && (c.prio >= .5 || c.drop >= .3) ? 'part' : 'miss',
      who: [R.drop.length ? who(R.drop, 2) : '', R.prio.length ? who(R.prio, 2) : ''].filter(Boolean).join('; '),
      note: modes >= 2 ? '' : primary >= .6 ? 'If your setter is Taunted or knocked out, nothing else controls speed.' : 'No second speed option either.'});
    if (modes < 2) pen += 10;
    // 3. Trick Room needs slow hitters to pay off
    if (c.tr >= .4) { const slow = team.filter(m => isSlow(m.p) && !R.tr.some(x => x.m === m && x.r >= .5));
      rows.push({k: 'trfit', label: 'Trick Room attackers', st: slow.length >= 2 ? 'ok' : slow.length ? 'part' : 'miss', who: slow.map(m => m.d).join(', '), note: slow.length >= 2 ? '' : 'Trick Room pays off with 2+ slow, hard-hitting Pokémon.'});
      pen += slow.length >= 2 ? 0 : slow.length ? 8 : 18; }
  } else {
    const scarf = team.map(m => ({m, r: m.mega ? 0 : ((setFor(m.p).it.find(([n]) => n === 'Choice Scarf') || [0, 0])[1] || 0) / 100, mv: 'Choice Scarf'})).filter(x => x.r >= .2);
    const fastMons = team.filter(m => (m.p.sp || 0) >= 100);
    const v = Math.max(cov(scarf), c.prio, c.tr, c.self, Math.min(1, fastMons.length / 2));
    rows.push({k: 'speed', label: 'Speed', st: st(v, .6, .3), who: [who([...scarf, ...R.self, ...R.prio, ...R.tr], 3), fastMons.length ? 'fast: ' + fastMons.slice(0, 3).map(m => m.d).join(', ') : ''].filter(Boolean).join('; '),
      note: v >= .6 ? '' : 'Little to outspeed fast threats: no Scarf, priority or setup speed.'});
    pen += 14 * (1 - v);
    rows.push({k: 'haz', label: 'Stealth Rock', st: st(c.haz, .5, .25), who: who(R.haz, 2), note: c.haz >= .5 ? '' : 'Rocks chip every switch-in.'}); pen += 6 * (1 - c.haz);
    rows.push({k: 'hazrm', label: 'Hazard removal', st: c.hazrm >= .4 ? 'ok' : 'opt', who: who(R.hazrm, 2), note: ''}); pen += 2 * (1 - c.hazrm);
    rows.push({k: 'pivot', label: 'Pivoting', st: c.pivot >= .5 ? 'ok' : 'opt', who: who(R.pivot, 2), note: ''}); pen += 3 * (1 - c.pivot);
  }
  // weather: one setter that the team uses is weather control; two kinds fight each other
  // Two weathers: a real archetype (Pelipper + Mega Charizard Y, 23 of 377 tournament teams) but it wins less (48.8% vs 54.5%).
  if (kinds.length > 1) { const sr = kinds.length === 2 && kinds.includes('sun') && kinds.includes('rain');
    rows.push({k: 'weather', label: 'Weather', st: 'part', who: setters.map(x => `${x.m.d} · ${ARCH[x.w].name}`).join(', '), note: sr ? 'Sun and rain: you can overwrite either opposing weather, but each setter cancels the other, so lead carefully.' : 'Two weathers cancel each other out.'}); pen += sr ? 8 : (dbl ? 25 : 18); }
  else if (kinds.length === 1) { const ab = abusersOf(kinds[0]);
    rows.push({k: 'weather', label: 'Weather', st: ab.length ? 'ok' : 'part', who: (() => { const sn = setters.map(x => x.m.d), others = ab.filter(m => !setters.some(x => x.m === m)), self = ab.some(m => setters.some(x => x.m === m)), w = ARCH[kinds[0]].name.toLowerCase();
      return `${sn.join(', ')} ${self && !others.length ? 'sets and uses ' + w : 'sets ' + w}${others.length ? ' for ' + others.slice(0, 3).map(m => m.d).join(', ') : ''}`; })(), note: ab.length ? '' : 'Nothing on the team uses it.'});
    pen += ab.length ? -(dbl ? 8 : 5) : 10; }
  else if (needs.length) { rows.push({k: 'weather', label: 'Weather', st: 'miss', who: '', note: `${team.filter(m => ARCH[needs[0]].abAb.includes(m.ability)).map(m => m.d).join(', ')} needs ${ARCH[needs[0]].name.toLowerCase()}, and nothing sets it.`}); pen += dbl ? 22 : 15; }
  else { rows.push({k: 'weather', label: 'Weather', st: 'opt', who: '', note: dbl ? 'None. Opposing sun (about 1 in 4 top teams) or rain will control the field.' : 'None. Optional in singles.'}); pen += dbl ? 5 : 0; }
  // terrain (Reg M-C): one setter with users is field control; two terrains overwrite each other
  { const ts = team.filter(m => TERRAIN_OF[m.ability]).map(m => ({m, t: TERRAIN_OF[m.ability]})), tk = [...new Set(ts.map(x => x.t))];
    if (tk.length > 1) { rows.push({k: 'terrain', label: 'Terrain', st: 'part', who: ts.map(x => `${x.m.d} · ${ARCH[x.t].name}`).join(', '), note: 'Two terrains overwrite each other: the last one to switch in wins.'}); pen += 8; }
    else if (tk.length === 1) { const key = tk[0], setM = ts.map(x => x.m), ab = fieldAbusers(team, key, setM).concat(T_TYPE[key] ? team.filter(m => !setM.includes(m) && (m.types || m.p.t).includes(T_TYPE[key]) && grounded(m)) : []);
      const uniq = [...new Set(ab)];
      const selfBlock = key === 'psy' && dbl && c.fake + c.prio >= .5 ? ' Psychic Terrain also blocks your own Fake Out and priority into grounded foes.' : '';
      rows.push({k: 'terrain', label: 'Terrain', st: uniq.length ? 'ok' : 'part', who: (() => { const others = uniq.filter(m => !setM.includes(m)); return `${setM.map(m => m.d).join(', ')} ${others.length ? 'sets ' + ARCH[key].name.toLowerCase() + ' for ' + others.slice(0, 3).map(m => m.d).join(', ') : uniq.length ? 'sets and uses ' + ARCH[key].name.toLowerCase() : 'sets ' + ARCH[key].name.toLowerCase()}`; })(), note: (uniq.length ? '' : 'Nothing else on the team uses it.') + selfBlock});
      pen += uniq.length ? -(dbl ? 5 : 3) : 0; }
    else if (team.some(m => Object.keys(T_TYPE).some(k => itemShare(m, ARCH[k].seed) >= .5))) { const m = team.find(x => Object.keys(T_TYPE).some(k => itemShare(x, ARCH[k].seed) >= .5)); const k = Object.keys(T_TYPE).find(k => itemShare(m, ARCH[k].seed) >= .5);
      rows.push({k: 'terrain', label: 'Terrain', st: 'miss', who: '', note: `${m.d} usually holds a ${ARCH[k].seed}, and nothing sets ${ARCH[k].name.toLowerCase()}.`}); pen += dbl ? 12 : 8; }
  }
  if (dbl) {
    const fr = anyOf([c.fake, c.redir]);
    rows.push({k: 'support', label: 'Fake Out / redirection', st: st(fr, .6, .3), who: who([...R.fake, ...R.redir].sort((a, b) => b.r - a.r), 3), note: fr >= .6 ? '' : '85% of top teams have one.'}); pen += 20 * (1 - fr);
    rows.push({k: 'prio', label: 'Priority attacks', st: c.prio >= .5 ? 'ok' : 'opt', who: who(R.prio, 3), note: ''}); pen += 5 * (1 - c.prio);
    const ans = anyOf([c.anti, c.tr * .6]);
    rows.push({k: 'anti', label: 'Answer to their speed control', st: ans >= .5 ? 'ok' : 'opt', who: [who(R.anti, 2), c.tr >= .5 && c.tw >= .5 ? 'two speed modes' : ''].filter(Boolean).join('; '), note: ans >= .5 ? '' : 'Taunt or Encore stops an opposing Tailwind or Trick Room.'}); pen += 5 * (1 - ans);
    const intim = team.filter(m => m.ability === 'Intimidate'); pen += intim.length ? 0 : 3;
  }
  return {rows, penalty: pen, c};
}


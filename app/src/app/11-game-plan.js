// ---------- game plan: the jobs a team needs, weighted by how reliably each member does them ----------
// Research (Oct 2026): of the 20 best-performing Reg M-C teams, 75% carry a reliable Tailwind or Trick Room
// setter (60% Tailwind, 35% Trick Room); the rest win with Fake Out pressure plus priority and self-speed.
// 85% have Fake Out or redirection, 75% a priority attacker, 50% a weather setter, and none mix two weathers.
// In Champions (as in the main games) Tailwind lasts 4 turns and Trick Room 5, each counting the turn it's used, so 3 and
// 4 more turns of moving; weather 5 (8 with its rock); the last weather setter in wins.
const ROLE = {
  tw: ['Tailwind'], tr: ['Trick Room'],
  // speed control by dropping the foe: Thunder Wave/Nuzzle/Glare (paralysis), Scary Face, plus every attack that always
  // lowers the target's Speed (from the move data: Icy Wind, Electroweb, Bulldoze, Rock Tomb, Drum Beating, Mud Shot, Pounce, Low Sweep…)
  drop: [...new Set(['Icy Wind', 'Electroweb', 'Thunder Wave', 'Nuzzle', 'Glare', 'Bulldoze', 'Rock Tomb', 'Scary Face', 'Drum Beating', 'Mud Shot', 'Pounce', 'Low Sweep',
    ...(typeof MOVE_META === 'object' ? Object.keys(MOVE_META).filter(n => (MOVE_META[n].s || []).some(s => s[0] >= 100 && s[1] && s[1].spe < 0)) : [])])],
  // priority attacks: every attacking move with a positive bracket (from the move data), plus Grassy Glide (only in Grassy Terrain)
  prio: [...new Set(['Extreme Speed', 'Sucker Punch', 'Aqua Jet', 'Ice Shard', 'Bullet Punch', 'Mach Punch', 'Grassy Glide', 'Shadow Sneak', 'Jet Punch', 'Quick Attack', 'First Impression', 'Accelerock', 'Water Shuriken', 'Vacuum Wave', 'Upper Hand',
    ...(typeof MOVE_META === 'object' && typeof MOVES === 'object' ? MOVES.filter(r => r[2] > 0 && (MOVE_META[r[0]] || {}).p > 0 && r[0] !== 'Fake Out' && r[0] !== 'Feint').map(r => r[0]) : [])])],
  boost: ['Dragon Dance', 'Quiver Dance', 'Shell Smash', 'Agility', 'Flame Charge', 'Trailblaze', 'Rock Polish', 'Shift Gear'],
  fake: ['Fake Out'], redir: ['Follow Me', 'Rage Powder'], anti: ['Taunt', 'Encore', 'Imprison'],
  haz: ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'], hazrm: ['Rapid Spin', 'Defog', 'Mortal Spin', 'Court Change', 'Tidy Up'],
  pivot: ['U-turn', 'Parting Shot', 'Volt Switch', 'Flip Turn', 'Teleport', 'Chilly Reception', 'Shed Tail'],
};
const SELF_SPEED_AB = new Set(['Unburden', 'Speed Boost']);
const W_TYPE = {sun: 'Fire', rain: 'Water', sand: 'Rock', snow: 'Ice'};
// abilities that only work in one weather (speed and power), and simple weather checks shared by the auto-build and the plans:
// two different setters cancel each other; a Pokémon needing another weather than the one the team sets is switched off
// abilities that do nothing without their weather. Sand Force isn't here: it's a power bonus, and teams win with Mega Garchomp
// without sand (sweep, Oct 31: requiring a sand setter left Build around Mega Garchomp with no team)
const WEATHER_NEED = {'Swift Swim': 'rain', Chlorophyll: 'sun', 'Solar Power': 'sun', 'Sand Rush': 'sand', 'Slush Rush': 'snow'};
const wxAnd = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1], needsW = a => a.length > 1 ? 'need' : 'needs';
const wxSetsOf = team => [...new Set(team.filter(m => m && WEATHER_OF[m.ability]).map(m => WEATHER_OF[m.ability]))];
const wxNeedsOf = team => [...new Set(team.map(m => m && WEATHER_NEED[m.ability]).filter(Boolean))];
function wxConflict(team) { const s = wxSetsOf(team); return s.length > 1 || (s.length === 1 && wxNeedsOf(team).some(w => w !== s[0])); }
function wxUnmet(team) { const s = wxSetsOf(team); return wxNeedsOf(team).filter(w => !s.includes(w)); }
// who actually uses a weather (Oct 30, Sim: a weather setter needs at least one teammate that uses it)
const WX_AB_USE = {rain: ['Swift Swim', 'Rain Dish', 'Dry Skin', 'Hydration'], sun: ['Chlorophyll', 'Solar Power', 'Leaf Guard', 'Protosynthesis', 'Flower Gift'], sand: ['Sand Rush', 'Sand Force', 'Sand Veil'], snow: ['Slush Rush', 'Ice Body', 'Snow Cloak']};
const WX_MV_USE = {rain: ['Thunder', 'Hurricane', 'Weather Ball', 'Bleakwind Storm', 'Wildbolt Storm', 'Sandsear Storm'], sun: ['Solar Beam', 'Solar Blade', 'Weather Ball', 'Growth', 'Morning Sun', 'Synthesis', 'Moonlight'], sand: ['Shore Up', 'Weather Ball'], snow: ['Blizzard', 'Aurora Veil', 'Weather Ball']};
function wxUses(m, w) { if (!m || !w) return false; if ((WX_AB_USE[w] || []).includes(m.ability)) return true;
  const mv = (m.moves || []).map(x => x && (x.name || x)).filter(Boolean), T = m.types || (m.p && m.p.t) || [];
  if (mv.some(n => (WX_MV_USE[w] || []).includes(n))) return true;
  const hasType = t => (m.moves || []).some(x => x && x.type === t && (+x.bp || 0) > 0);
  if (w === 'rain') return hasType('Water'); if (w === 'sun') return hasType('Fire'); if (w === 'sand') return T.includes('Rock'); if (w === 'snow') return T.includes('Ice');
  return false; }
// setter weathers with nobody else on the team using them
// the setter itself counts only through a move made for the weather (Alolan Ninetales' Aurora Veil, Pelipper's Hurricane), not its own type
const wxMoveUse = (m, w) => (m.moves || []).some(x => x && (WX_MV_USE[w] || []).includes(x.name || x));
function wxIdle(team) { return wxSetsOf(team).filter(w => !team.some(m => m && (WEATHER_OF[m.ability] !== w ? wxUses(m, w) : wxMoveUse(m, w)))); }
// how much the team's own weather helps vs hurts its non-setters: Water attackers in rain (+), Fire in rain (-), and the reverse in sun
function wxNet(team) { const s = wxSetsOf(team); if (s.length !== 1 || !(s[0] === 'rain' || s[0] === 'sun')) return 0; const up = s[0] === 'rain' ? 'Water' : 'Fire', dn = s[0] === 'rain' ? 'Fire' : 'Water';
  let n = 0; for (const m of team) { if (!m || WEATHER_OF[m.ability]) continue; const t = m.types || m.p.t; if (WEATHER_NEED[m.ability] === s[0]) n += 2; if (t.includes(up)) n++; if (t.includes(dn)) n--; } return n; }
// How reliably m uses one of these moves: 1 if you picked it, else the share of players who run it.
let relCache = new Map();
function relMove(m, names) {
  if (!m.custom && !(m._mv && m._mv.length) && !(m.moves && m.moves.length)) { const k = m.p.n + '|' + names[0] + '|' + names.length; let r = relCache.get(k); if (!r) { r = relMove_(m, names); relCache.set(k, r); } return r; }
  return relMove_(m, names);
}
function relMove_(m, names) {
  // judged on the member's actual set: your moves, or the 4 on its card (the popular set) when you haven't changed them.
  // (Before Oct 28, unedited members counted the share of players running each move, so two Pokémon that each run Tailwind
  // 45% of the time could pass speed control together.)
  const own = m._mv && m._mv.length ? m._mv : m.moves && m.moves.length ? m.moves : null;
  if (m.custom || own) { const x = (own || m.moves || []).find(y => y && names.includes(y.name)); return x ? [1, x.name] : [0, null]; }
  let best = [0, null];
  for (const [n, v] of setFor(m.p).mv) if (names.includes(n)) { const r = v == null ? .6 : v / 100; if (r > best[0]) best = [r, n]; }
  if (!best[1] && !setFor(m.p).mv.length) { const x = popularMoves(m.p).slice(0, 4).find(y => names.includes(y.name)); if (x) best = [.5, x.name]; }
  return best;
}
const anyOf = rs => 1 - rs.reduce((a, r) => a * (1 - r), 1);
const pctTxt = r => r >= .995 ? '' : ` ${Math.round(r * 100)}%`;
// Returns {rows, penalty}. rows: [{k, label, st: ok|part|miss|opt, who, note}]. Lower penalty is better.
function gamePlan(team) {
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
  {
    // 1. a way to move first: Tailwind, Trick Room, weather speed, or (weaker) a pile of priority and self-speed
    // Trick Room only controls speed when there are slow Pokémon to use it: with fewer than 2 besides the setters (base
    // Speed 60 or less) it counts as partial at best (real Trick Room teams built like that won 47.9% vs 51.6%, Oct 27)
    const trSlow = team.filter(m => m.p && m.p.st && m.p.st[5] <= 60 && !R.tr.some(x => x.m === m)).length, trEff = trSlow >= 2 ? c.tr : c.tr * .4;
    const opts = [['Tailwind', c.tw, R.tw], ['Trick Room', trEff, R.tr], ['weather speed', wSpeed * .9, []], ['priority and speed boosts', fast * .5, [...R.prio, ...R.self]]];  // priority alone never fully counts
    const primary = Math.max(...opts.map(o => o[1]));
    const main = opts.filter(o => o[1] >= .3).sort((a, b) => b[1] - a[1]);
    // mode: what the row's status rests on, so a gain from priority moves is never described as "speed control"
    rows.push({k: 'speed', label: 'Speed control', st: st(primary, .6, .3), mode: main.length ? main[0][0] : '',
      who: main.length ? main.slice(0, 2).map(o => o[2].length ? who(o[2], 2) : o[0] === 'weather speed' ? `${team.filter(m => WEATHER_SPEED[m.ability]).map(m => m.d).join(', ')} in ${ARCH[kinds[0]].name.toLowerCase()}` : o[0]).join('; ') : '',
      note: primary >= .6 ? '' : c.tr >= .6 && trSlow < 2 ? `Trick Room, but ${trSlow ? 'only one slow Pokémon' : 'no slow Pokémon'} besides the setter to use it.` : (main.length ? 'Only priority moves: no reliable Tailwind or Trick Room.' : 'No Tailwind, Trick Room or weather speed.') + ` Speed control is on ${proLine('speed', '')}.`});
    pen += 55 * (1 - primary);
    // 2. a second option, so one Taunt or one KO on the setter doesn't decide the game
    const modes = [c.tw >= .5, c.tr >= .5, wSpeed >= .5, c.drop >= .5, fast >= .5].filter(Boolean).length;
    rows.push({k: 'backup', label: 'Backup speed', st: modes >= 2 ? 'ok' : modes === 1 && (c.prio >= .5 || c.drop >= .3) ? 'part' : 'miss', prioOnly: modes < 2 && c.drop < .3 && c.prio >= .5,
      who: [R.drop.length ? who(R.drop, 2) : '', R.prio.length ? who(R.prio, 2) : ''].filter(Boolean).join('; '),
      note: modes >= 2 ? '' : primary >= .6 ? 'If your setter is Taunted or knocked out, nothing else controls speed.' : 'No second speed option either.'});
    if (modes < 2) pen += 10;
    // 3. Trick Room needs slow hitters to pay off
    if (c.tr >= .4) { const slow = team.filter(m => isSlow(m.p) && !R.tr.some(x => x.m === m && x.r >= .5));
      rows.push({k: 'trfit', label: 'Trick Room attackers', st: slow.length >= 2 ? 'ok' : slow.length ? 'part' : 'miss', who: slow.map(m => m.d).join(', '), note: slow.length >= 2 ? '' : 'Trick Room pays off with 2+ slow, hard-hitting Pokémon.'});
      pen += slow.length >= 2 ? 0 : slow.length ? 8 : 18; }
  }
  // weather: one setter that the team uses is weather control; two kinds fight each other
  // Two weathers: a real archetype (Pelipper + Mega Charizard Y, 23 of 377 tournament teams) but it wins less (48.8% vs 54.5%).
  if (kinds.length > 1) { const sr = kinds.length === 2 && kinds.includes('sun') && kinds.includes('rain');
    rows.push({k: 'weather', label: 'Weather', st: 'part', who: setters.map(x => `${x.m.d} · ${ARCH[x.w].name}`).join(', '), note: sr ? 'Sun and rain: you can overwrite either opposing weather, but each setter cancels the other, so lead carefully.' : 'Two weathers cancel each other out.'}); pen += sr ? 8 : 25; }
  else if (kinds.length === 1) { const ab = abusersOf(kinds[0]);
    rows.push({k: 'weather', label: 'Weather', st: ab.length ? 'ok' : 'part', who: (() => { const sn = setters.map(x => x.m.d), others = ab.filter(m => !setters.some(x => x.m === m)), self = ab.some(m => setters.some(x => x.m === m)), w = ARCH[kinds[0]].name.toLowerCase();
      return `${sn.join(', ')} ${self && !others.length ? 'sets and uses ' + w : 'sets ' + w}${others.length ? ' for ' + others.slice(0, 3).map(m => m.d).join(', ') : ''}`; })(), note: ab.length ? '' : 'Nothing on the team uses it.'});
    pen += ab.length ? -8 : 10;
    // a Pokémon whose ability needs a different weather (Swift Swim Mega Swampert on a Mega Charizard Y sun team): the team's
    // own weather switches it off (audit, Oct 30)
    { const off = team.filter(m => WEATHER_NEED[m.ability] && WEATHER_NEED[m.ability] !== kinds[0]); if (off.length) { const r = rows[rows.length - 1];
      r.st = 'part'; r.note = (r.note ? r.note + ' ' : '') + `${wxAnd(off.map(m => `${m.d} (${m.ability})`))} ${needsW(off)} ${ARCH[WEATHER_NEED[off[0].ability]].name.toLowerCase()}, but your ${ARCH[kinds[0]].name.toLowerCase()} replaces it.`; pen += 18 * off.length; } } }
  else if (needs.length) { rows.push({k: 'weather', label: 'Weather', st: 'miss', who: '', note: (u => `${wxAnd(u)} ${needsW(u)} ${ARCH[needs[0]].name.toLowerCase()}, and nothing sets it.`)(team.filter(m => ARCH[needs[0]].abAb.includes(m.ability)).map(m => m.d))}); pen += 22; }
  else { rows.push({k: 'weather', label: 'Weather', st: 'opt', who: '', note: 'None. Opposing sun or rain will control the field.'}); pen += 5; }
  // moves that need a weather the team doesn't set: Solar Beam / Solar Blade (two turns without sun), Electro Shot (two turns
  // without rain), Weather Ball (a 50-power Normal move with no weather), Hurricane / Thunder (70% accurate outside rain),
  // Blizzard (70% outside snow)
  { const NEED = {'Solar Beam': ['sun', 'takes two turns without sun'], 'Solar Blade': ['sun', 'takes two turns without sun'], 'Electro Shot': ['rain', 'takes two turns without rain'], 'Weather Ball': ['any', 'is a 50-power Normal move without weather'], Hurricane: ['rain', 'is only 70% accurate without rain'], Thunder: ['rain', 'is only 70% accurate without rain'], Blizzard: ['snow', 'is only 70% accurate without snow']};
    const bad = []; for (const m of team) for (const mv of (m._mv && m._mv.length ? m._mv : m.moves || [])) { const nd = mv && NEED[mv.name]; if (!nd) continue; const ok = nd[0] === 'any' ? kinds.length > 0 : kinds.includes(nd[0]) || (nd[0] === 'sun' && m.ability === 'Mega Sol'); if (!ok) bad.push(`${m.d}'s ${mv.name} ${nd[1]}`); }
    if (bad.length) { const r = rows.find(x => x.k === 'weather'); const txt = bad.join('; ') + ', and nothing on the team sets it.'; if (r) { r.note = (r.note ? r.note + ' ' : '') + txt; if (r.st === 'ok' || r.st === 'opt') r.st = 'part'; } pen += 6 * bad.length; } }
  // terrain (Reg M-C): one setter with users is field control; two terrains overwrite each other
  { const ts = team.filter(m => TERRAIN_OF[m.ability]).map(m => ({m, t: TERRAIN_OF[m.ability]})), tk = [...new Set(ts.map(x => x.t))];
    // seeds judged on the item each member actually holds (your pick, or its team-aware default), against what the team sets
    const seedOf = m => Object.keys(T_TYPE).find(k => m.item && ARCH[k].seed === m.item), fieldT = typeof teamField === 'function' ? teamField(team).t : new Set(tk);
    const deadSeed = team.filter(m => { const k = seedOf(m); return k && !fieldT.has(k); });
    const seedNote = deadSeed.length ? ` ${deadSeed.map(m => `${m.d}'s ${m.item} never activates (nothing sets ${ARCH[seedOf(m)].name})${m.ability === 'Unburden' ? ', so Unburden never triggers' : ''}.`).join(' ')}` : '';
    if (tk.length > 1) { rows.push({k: 'terrain', label: 'Terrain', st: 'part', who: ts.map(x => `${x.m.d} · ${ARCH[x.t].name}`).join(', '), note: 'Two terrains overwrite each other: the last one to switch in wins.'}); pen += 8; }
    else if (tk.length === 1) { const key = tk[0], setM = ts.map(x => x.m), ab = fieldAbusers(team, key, setM).concat(T_TYPE[key] ? team.filter(m => !setM.includes(m) && (m.types || m.p.t).includes(T_TYPE[key]) && grounded(m)) : []);
      const uniq = [...new Set(ab)];
      const selfBlock = key === 'psy' && c.fake + c.prio >= .5 ? ' Psychic Terrain also blocks your own Fake Out and priority into grounded foes.' : '';
      rows.push({k: 'terrain', label: 'Terrain', st: uniq.length && !deadSeed.length ? 'ok' : 'part', who: (() => { const others = uniq.filter(m => !setM.includes(m)); return `${setM.map(m => m.d).join(', ')} ${others.length ? 'sets ' + ARCH[key].name.toLowerCase() + ' for ' + others.slice(0, 3).map(m => m.d).join(', ') : uniq.length ? 'sets and uses ' + ARCH[key].name.toLowerCase() : 'sets ' + ARCH[key].name.toLowerCase()}`; })(), note: (uniq.length ? '' : 'Nothing else on the team uses it.') + selfBlock + seedNote});
      pen += (uniq.length ? -5 : 0) + deadSeed.length * 10; }
    else if (deadSeed.length) { const m = deadSeed[0], k = seedOf(m);
      rows.push({k: 'terrain', label: 'Terrain', st: 'miss', who: '', note: `${m.d} holds a ${ARCH[k].seed}, and nothing sets ${ARCH[k].name.toLowerCase()}.${m.ability === 'Unburden' ? ' The seed never activates, so Unburden never triggers.' : ''}`}); pen += 12; }
  }
  {
    // lead support: Fake Out, redirection or Intimidate (the same three the checklist counts)
    const intimL = team.filter(m => m.ability === 'Intimidate').map(m => ({m, r: 1, mv: 'Intimidate'}));
    const fr = anyOf([c.fake, c.redir, intimL.length ? 1 : 0]);
    rows.push({k: 'support', label: 'Lead support', st: st(fr, .6, .3), who: who([...R.fake, ...R.redir, ...intimL].sort((a, b) => b.r - a.r), 3), note: fr >= .6 ? '' : `${(s => s.charAt(0).toUpperCase() + s.slice(1))(proLine('fake', ''))} have Fake Out, Intimidate or redirection.`}); pen += 20 * (1 - fr);
    rows.push({k: 'prio', label: 'Priority attacks', st: c.prio >= .5 ? 'ok' : 'opt', who: who(R.prio, 3), note: ''}); pen += 5 * (1 - c.prio);
    const ans = anyOf([c.anti, c.tr * .6]);
    rows.push({k: 'anti', label: 'Answer to their speed control', st: ans >= .5 ? 'ok' : 'opt', who: [who(R.anti, 2), c.tr >= .5 && c.tw >= .5 ? 'two speed modes' : ''].filter(Boolean).join('; '), note: ans >= .5 ? '' : 'Taunt or Encore stops an opposing Tailwind or Trick Room.'}); pen += 5 * (1 - ans);
    const intim = team.filter(m => m.ability === 'Intimidate'); pen += intim.length ? 0 : 3;
  }
  // spread moves that also hit your own partner (Earthquake, Discharge, Surf, Bulldoze…): which teammates they'd hit.
  // Information only (no penalty): plenty of teams run Earthquake next to Flying or Levitate partners, or protect the ally.
  try { const notes = []; for (const m of team) for (const mv of (m._mv && m._mv.length ? m._mv : m.moves || [])) { if (!mv || !mv.ally || !mv.bp) continue;
      const hit = team.filter(x => x !== m && typeof allyHit === 'function' && allyHit(mv, x)), safe = team.filter(x => x !== m && !hit.includes(x));
      notes.push(`${m.d}'s ${mv.name} also hits ${hit.length ? hit.map(x => x.d).join(', ') : 'no one on your team'} next to it${hit.length && safe.length ? ` (safe partners: ${safe.map(x => x.d).join(', ')})` : ''}`); }
    if (notes.length) rows.push({k: 'ally', label: 'Hits your own side', st: notes.some(n => !/no one/.test(n)) ? 'opt' : 'ok', who: '', note: notes.join('. ') + '.'}); } catch (e) {}
  return {rows, penalty: pen, c};
}


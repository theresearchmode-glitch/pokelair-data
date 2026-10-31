// ---------- threat preparation: is the team ready for what it will face? ----------
// Descriptive, never a prediction. For each of the top 30 threats (recency-weighted top-cut share), with its common
// tournament set, and your own sets:
//  CHECK   one of yours moves first and OHKOs it, or survives its best hit and OHKOs back
//  COUNTER one of yours takes at most 50% per hit, 2HKOs it, and it can't 2HKO you back
//  IMMUNE  none of its attacks touch you and you 2HKO it
//  SOFT    a fragile 1-on-1 win, a wall, Intimidate, Will-O-Wisp, Wide Guard or Taunt (unless its ability blocks it)
// Support threats (Trick Room, screens, redirection as the main job) are judged by answers to what they do: Taunt,
// Imprison, your own Trick Room, screen breakers, Infiltrator, spread attacks, and KOing them before Trick Room goes up.
// A threat is Well handled (2+ solid answers), Handled (1), Shaky (soft only) or Unanswered; one level lower when it
// beats 4+ of your six 1-on-1. Readiness = the threat-weighted share of points (1 / .8 / .4 / 0).
// Calcs: the page's own damage() with real rolls; your weather/terrain if the team sets one, else the threat's;
// Intimidate (and Defiant/Competitive), self-drops, Sitrus Berry, Focus Sash, Choice Scarf, weather-speed abilities,
// Unburden only when its seed really pops, priority, and the Tailwind / Trick Room the team actually runs.
// Validated Oct 28: 42 hand-checked verdicts against Smogon's Champions calc, and 31,598 real games (better-prepared
// teams did better than player skill alone predicts). See experiments/threat-check.mjs.
const THR = (() => {
  const MVn = n => mvByName.get(n);
  const WEATHER_AB = {Drought: 'sun', Drizzle: 'rain', 'Sand Stream': 'sand', 'Snow Warning': 'snow'};
  const TERRAIN_AB = {'Grassy Surge': 'grassy', 'Electric Surge': 'electric', 'Psychic Surge': 'psychic', 'Misty Surge': 'misty', 'Hadron Engine': 'electric'};
  const WSPEED = {Chlorophyll: 'sun', 'Swift Swim': 'rain', 'Sand Rush': 'sand', 'Slush Rush': 'snow'};
  const SEED = {'Grassy Seed': 'grassy', 'Electric Seed': 'electric', 'Psychic Seed': 'psychic', 'Misty Seed': 'misty'};
  const NO_INTIM = new Set(['Defiant', 'Competitive', 'Clear Body', 'Inner Focus', 'Oblivious', 'Own Tempo', 'Scrappy', 'Guard Dog', 'Mirror Armor', 'Full Metal Body', 'White Smoke', 'Hyper Cutter', 'Contrary']); // Rattled isn't here: the Attack drop still lands (it only adds Speed)
  const PUNISH_INTIM = new Set(['Defiant', 'Competitive', 'Guard Dog', 'Contrary', 'Mirror Armor', 'Rattled']);
  const SETUP = new Set(['Swords Dance', 'Dragon Dance', 'Nasty Plot', 'Calm Mind', 'Quiver Dance', 'Shell Smash', 'Bulk Up', 'Belly Drum', 'Victory Dance', 'Coil', 'Tidy Up', 'Trick Room', 'Tailwind', 'Shift Gear', 'Geomancy']);
  const SELF_DROP = {'Draco Meteor': -2, Overheat: -2, 'Leaf Storm': -2, 'Psycho Boost': -2, 'Fleur Cannon': -2, 'Make It Rain': -1};
  const TAUNT_BLOCK = new Set(['Oblivious', 'Aroma Veil', 'Magic Bounce', 'Good as Gold']);
  const SCREENS = ['Reflect', 'Light Screen', 'Aurora Veil'], REDIR = ['Follow Me', 'Rage Powder'];
  const SCREEN_BREAK = ['Brick Break', 'Psychic Fangs', 'Raging Bull', 'Defog'];
  const SUPPORT = new Set(['Trick Room', 'Reflect', 'Light Screen', 'Aurora Veil', 'Follow Me', 'Rage Powder', 'Helping Hand', 'Tailwind', 'Fake Out', 'Parting Shot', 'Spore', 'Sleep Powder', 'Thunder Wave', 'Encore', 'Taunt', 'Will-O-Wisp', 'Pollen Puff', 'Wide Guard', 'Ally Switch', 'Coaching']);
  const grounded = s => s.item === 'Iron Ball' || (!s.p.t.includes('Flying') && s.ability !== 'Levitate' && s.item !== 'Air Balloon');
  // abilities that block priority moves aimed at their side (Prankster status moves included), and flinch blockers
  const PRIO_BLOCK = new Set(['Armor Tail', 'Queenly Majesty', 'Dazzling']), FLINCH_BLOCK = new Set(['Inner Focus', 'Shield Dust']);
  // a Prankster user's status moves get +1 priority, so they fail into Dark types, priority blockers and a grounded target in
  // Psychic Terrain (a status move from a Pokémon without Prankster isn't affected)
  const pranksterFails = (m, t, field) => m.ability === 'Prankster' && ((t.p.t || []).includes('Dark') || PRIO_BLOCK.has(t.ability) || (!!field && field.terrain === 'psychic' && grounded(t)));
  // real priority brackets from the move data (Fake Out +3, Extreme Speed +2, Sucker Punch +1, Grassy Glide +1 in Grassy Terrain…)
  const prioOf = (mv, field, att) => movePrio(mv, att.ability, {terrain: field.terrain, grounded: grounded(att)});
  // a move's guaranteed (100%) stat changes on the target, e.g. Snarl {spa:-1}, Icy Wind {spe:-1}, Acid Spray {spd:-2}
  const tDrop = mv => { const s = (mv && mv.sec || []).find(x => x[0] >= 100 && x[1]); return s ? s[1] : null; };
  // the attacker's own stat change after using it (Draco Meteor −2 SpA, Superpower −1 Atk/Def, Make It Rain −1 SpA…)
  const selfDrop = mv => { const sb = mv && (mv.self || (MOVE_META[mv.name] || {}).sb); if (!sb) return 0; return mv.cat === 1 ? (sb.atk || 0) : (sb.spa || 0); };
  const isStone = it => !!it && STONE_RE.test(it);
  const pc = x => Math.round(x * 100);
  // a side from a spec (tests, real team sheets): {n, item?, ability?, moves?:[names], nat?, sp?:{hp,atk,def,spa,spd,spe}}
  // Default moves: the 4 most used, plus any attack at least 30% of players run (so a support-first set still carries its attack).
  // What strong players bring: every set on recent top-cut teams (Limitless top 8, official RK9 top 16) for one Pokémon.
  // Threats use this when there are 15+ such sets, so a move casual players like but top players drop doesn't decide a verdict.
  let tcCache = {v: -1, map: null};
  function topCutSets() { if (tcCache.v === metaVersion) return tcCache.map; const map = new Map();
    try { for (const e of (META.events && META.events.events) || []) for (const t of e.top) for (const m of t.mons) {
      let o = map.get(m.n); if (!o) map.set(m.n, o = {n: 0, mv: {}, it: {}, ab: {}, nt: {}}); o.n++;
      for (const v of m.mv) o.mv[v] = (o.mv[v] || 0) + 1; if (m.i) o.it[m.i] = (o.it[m.i] || 0) + 1; if (m.a) o.ab[m.a] = (o.ab[m.a] || 0) + 1; if (m.nt) o.nt[m.nt] = (o.nt[m.nt] || 0) + 1; } } catch (e) {}
    tcCache = {v: metaVersion, map}; return map; }
  const topOf = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
  function topCutSpec(n) { const o = topCutSets().get(n); if (!o || o.n < 15) return null; const p = byName.get(n);
    const mvs = topOf(o.mv).map(([k, c]) => [k, 100 * c / o.n]).filter(([k]) => MVn(k)), moves = mvs.slice(0, 4).map(x => x[0]);
    for (const [k, pct] of mvs) { const mv = MVn(k); if (mv && mv.bp > 0 && pct >= 30 && !moves.includes(k)) moves.push(k); }
    const it = topOf(o.it).map(x => x[0]).find(k => !isStone(k)), ab = topOf(o.ab).map(x => x[0]).find(k => p.a.includes(k)), nt = (topOf(o.nt)[0] || [])[0];
    return {n, moves, item: p.m ? undefined : it, ability: ab, nat: nt && NAT_UP && Object.values(NAT_UP).some(a => a.includes(nt)) ? nt : undefined, sets: o.n}; }
  function side(spec) {
    if (spec.top && !spec.moves) { const ts = topCutSpec(spec.n); if (ts) spec = {...ts, ...Object.fromEntries(Object.entries(spec).filter(([k]) => k !== 'top'))}; }
    const p = byName.get(spec.n); if (!p) throw new Error('unknown ' + spec.n);
    const cs = commonSpread(p), phys = p.st[1] >= p.st[3];
    const nat = spec.nat || (cs && cs.nat) || topNature(p) || (phys ? 'Adamant' : 'Modest');
    const fast = p.st[5] >= 70 || NAT_UP.Spe.includes(nat);
    const sp = spec.sp || (cs ? {hp: cs.hp, atk: cs.atk, def: cs.def, spa: cs.spa, spd: cs.spd, spe: cs.spe}
      : {hp: fast ? 2 : 32, atk: phys ? 32 : 0, def: 0, spa: phys ? 0 : 32, spd: 0, spe: fast ? 32 : 0});
    const ability = spec.ability && p.a.includes(spec.ability) ? spec.ability : (metaAbility(p) || bestAbility(p));
    const item = spec.item != null ? spec.item : (p.m ? (stoneFor(p) || '') : ((topItem(p) || [])[0] || ''));
    let moves; if (spec.moves) moves = spec.moves.map(x => typeof x === 'string' ? MVn(x) : x).filter(Boolean);
    else { const pm = popularMoves(p); moves = pm.slice(0, 4); let mvPct = []; try { mvPct = (setFor(p, 'doubles').mv || []); } catch (e) {}
      for (const [nm, pct] of mvPct) { const mv = MVn(nm); if (mv && mv.bp > 0 && pct >= 30 && !moves.some(x => x.name === nm)) moves.push(mv); } moves = moves.filter(Boolean); }
    return {p, n: p.n, d: p.d || p.n, nat, sp, ability, item, moves, spec};
  }
  // a side from one of your team members (its card moves, its item after team-aware defaults, your spread or the common one)
  function fromMember(m) { const p = m.p, cs = m.spread || commonSpread(p);
    const mv = (m._mv && m._mv.length ? m._mv : (m.moves && m.moves.length ? m.moves : memberMoves(m).moves)).slice(0, 4).filter(Boolean);
    return side({n: p.n, item: m.item || (p.m ? stoneFor(p) : ''), ability: m.ability, moves: mv.map(x => x.name), nat: cs && cs.nat ? cs.nat : undefined,
      sp: cs ? {hp: cs.hp, atk: cs.atk, def: cs.def, spa: cs.spa, spd: cs.spd, spe: cs.spe} : undefined}); }
  const atkObj = (s, boost = 0) => ({p: s.p, sp: s.p.st[1] >= s.p.st[3] ? s.sp.atk : s.sp.spa, spA: s.sp.atk, spS: s.sp.spa, spDef: s.sp.def, nat: s.nat, item: isStone(s.item) ? '' : s.item, ability: s.ability, boost});
  // Intimidate on att. Flower Veil on att's side keeps Grass types from being lowered; White Herb resets the drop once (so it
  // isn't there for a later self-drop: att._whUsed)
  function intimidated(att, foe) { if (!foe || foe.ability !== 'Intimidate') return {atk: 0, spa: 0};
    const a = att.ability; if (['Defiant', 'Guard Dog', 'Contrary'].includes(a)) return {atk: 1, spa: 0};
    if (att._fv) return {atk: 0, spa: 0};
    const r = a === 'Competitive' ? {atk: -1, spa: 2} : NO_INTIM.has(a) ? {atk: 0, spa: 0} : {atk: -1, spa: 0};
    if (r.atk < 0 && att.item === 'White Herb') return {atk: 0, spa: r.spa, wh: true}; return r; }
  const defObj = s => ({p: s.p, hpSp: s.sp.hp, defSp: s.sp.def, spdSp: s.sp.spd, atkSp: s.sp.atk, nat: s.nat, item: isStone(s.item) ? '' : s.item, ability: s.ability, boost: 0});
  function fieldFor(team, t) {
    return {weather: team.map(m => WEATHER_AB[m.ability]).find(Boolean) || WEATHER_AB[t.ability] || '',
      terrain: team.map(m => TERRAIN_AB[m.ability]).find(Boolean) || TERRAIN_AB[t.ability] || '',
      // Fairy Aura / Dark Aura on the field (yours or theirs) boosts every move of that type
      auras: [...team.map(m => m.ability), t.ability].filter(a => /^(Fairy|Dark) Aura$/.test(a || ''))};
  }
  function speedOf(s, field) {
    let v = calcStat(s.p, 'Spe', s.sp.spe, natMul(s.nat, 'Spe'));
    if (s.item === 'Choice Scarf') v = Math.floor(v * 1.5);
    if (WSPEED[s.ability] && field.weather === WSPEED[s.ability]) v *= 2;
    if (s.ability === 'Unburden' && SEED[s.item] && field.terrain === SEED[s.item]) v *= 2;
    if (s.item === 'Iron Ball') v = Math.floor(v / 2);
    return v;
  }
  function hitsToKO(r, r2, sitrus) { if (!r || r.max === 0) return Infinity; const hp = r.hp, a = r.rolls[7], b = r2 ? r2.rolls[7] : (r.next && r.next.rolls ? r.next.rolls : r.rolls)[7];
    if (a >= hp) return r.sash ? 2 : 1; let left = hp - a, n = 1, berry = !!sitrus;
    if (berry && left <= hp / 2) { left += Math.floor(hp / 4); berry = false; }
    while (left > 0 && n < 9) { left -= b; n++; if (left > 0 && berry && left <= hp / 2) { left += Math.floor(hp / 4); berry = false; } } return n; }
  // Chance a move hits (0-100): No Guard always hits; rain makes Hurricane/Thunder sure-hit (sun cuts them to 50%); snow does
  // the same for Blizzard; Compound Eyes ×1.3, Wide Lens ×1.1, Hustle ×0.8 on physical moves.
  const accOf = (mv, att, field, def) => moveAcc(mv, att.ability, field.weather, def ? {ability: def.ability, item: def.item} : null, att.item);
  // a move under this accuracy can't be the reason a Pokémon counts as a solid answer
  const SURE = 85;
  // ext: {atk, spa} stage changes on the attacker from the other side's move (Snarl −1 SpA, Justified +1 Atk…); ext.after = only
  // from the attacker's second hit on (it moved first, so its first hit was normal)
  function bestAttack(att, def, field, ext) {
    let best = null; const st = intimidated(att, def), E = ext || {};
    for (const mv of att.moves) { if (!mv || !mv.bp || mv.cat === 0 || mv.name === 'Fake Out') continue;
      if (mv.vbp === 'counter' || mv.vbp === 'endeavor') continue; // conditional damage, never a planned KO
      const k = mv.cat === 1 ? 'atk' : 'spa', b0 = st[k] + (E.after ? 0 : (E[k] || 0)), bLate = st[k] + (E[k] || 0);
      const base = {def: defObj(def), move: mv, spread: !!mv.spread, weather: field.weather, terrain: field.terrain, auras: field.auras};
      const r = damage({...base, atk: atkObj(att, b0)}); if (!r) continue;
      // its own drop after the hit; White Herb resets it once (unless Intimidate already used the herb), so the second hit is
      // still at full power
      const drop = ['Contrary', 'Clear Body', 'White Smoke', 'Full Metal Body'].includes(att.ability) || (att.item === 'White Herb' && !st.wh) ? 0 : selfDrop(mv);
      // the second hit: the attacker's own drop, the other side's change, the target's own reaction (Weak Armor −1 Def,
      // Stamina +1 Def) and the move's guaranteed drop on the target's defense (Acid Spray −2 SpD, Fire Lash −1 Def…)
      const td = tDrop(mv) || {}, dS = mv.cat === 1 ? 'def' : 'spd';
      let dB = (td[dS] || 0) + (def.ability === 'Weak Armor' && mv.cat === 1 ? -1 : 0) + (def.ability === 'Stamina' ? 1 : 0);
      const late = drop || bLate !== b0 || dB ? damage({...base, def: {...defObj(def), boost: Math.max(-6, Math.min(6, dB))}, atk: atkObj(att, Math.max(-6, Math.min(6, bLate + drop)))}) : null;
      let h = hitsToKO(r, late, def.item === 'Sitrus Berry' && att.ability !== 'Unnerve'), pr = prioOf(mv, field, att), mid = r.rolls[7] / r.hp, acc = r.ohko ? 30 : accOf(mv, att, field, def);
      // a two-turn move that charges first (Electro Shot outside rain, Solar Beam outside sun) loses a turn
      const ch = chargesFirst(mv, field.weather, att.item); if (ch) h += 1;
      // an unreliable move only wins the pick when it needs fewer hits than every reliable one; a move that must recharge
      // (Hyper Beam) only when it's the only KO; a one-hit KO move is never planned on
      const key = h + (acc < SURE ? .6 : 0) + (mv.recharge ? .9 : 0) + (r.ohko ? 5 : 0);
      const tag = [ch ? 'charges first' : '', acc < 100 ? `${acc}% to hit` : '', mv.recharge ? 'must recharge' : ''].filter(Boolean).join(', ');
      if (!best || key < best.key || (key === best.key && (pr > best.pr || (pr === best.pr && (acc > best.acc || (acc === best.acc && mid > best.mid))))))
        best = {mv: mv.name + (tag ? ` (${tag})` : ''), name: mv.name, move: mv, h, key, pr, acc, charge: ch, pct: r.max / r.hp, mid, min: r.min / r.hp, type: r.type, cat: mv.cat}; }
    return best;
  }
  const hasMove = (s, n) => s.moves.some(m => m && m.name === n);
  const hasAny = (s, ns) => s.moves.some(m => m && ns.includes(m.name));
  function teamModes(team) {
    const trSet = team.filter(m => hasMove(m, 'Trick Room')), slow = team.filter(m => m.p.st[5] <= 60 && !hasMove(m, 'Trick Room'));
    return {tr: trSet.length > 0 && slow.length >= 2, tw: team.some(m => hasMove(m, 'Tailwind'))};
  }
  // what one side's hit does to the other's attacking stat: the move's guaranteed drop (Snarl / Spirit Break / Struggle Bug /
  // Mystical Fire −1 SpA, Breaking Swipe / Trop Kick / Lunge −1 Atk) or the target's own ability (Justified +1 Atk from a Dark
  // hit, Thermal Exchange +1 Atk from a Fire hit, Stamina…). Returns {atk, spa} for the side that got hit.
  function hitEffect(o, tgt) { if (!o || !o.move) return null; const e = {atk: 0, spa: 0}, td = tDrop(o.move) || {};
    if (!['Clear Body', 'White Smoke', 'Full Metal Body', 'Mirror Armor'].includes(tgt.ability)) { e.atk += td.atk || 0; e.spa += td.spa || 0;
      if ((td.atk || td.spa) && tgt.ability === 'Defiant') e.atk += 2; if ((td.atk || td.spa) && tgt.ability === 'Competitive') e.spa += 2; }
    // Flower Veil (a Grass type on its side) and White Herb (resets the drop once) cancel the lowering
    if (tgt._fv || tgt.item === 'White Herb') { e.atk = Math.max(0, e.atk); e.spa = Math.max(0, e.spa); }
    if (tgt.ability === 'Justified' && o.type === 'Dark') e.atk += 1; if (tgt.ability === 'Thermal Exchange' && o.type === 'Fire') e.atk += 1;
    return e.atk || e.spa ? e : null; }
  // A duel depends only on the two sets, the team's speed modes, Flower Veil and the field's weather/terrain/auras, so it is
  // cached by those (speed, Oct 28: judging every field you could play on made the scouting report ~60% slower). Results
  // are identical with the cache off (THR.noCache, checked in app/test/run.mjs).
  const duelCache = new Map(), cacheOpt = {off: false};
  // (built every call, never stored on the set, so a changed set can't reuse a stale key)
  const sigOf = s => [s.p ? s.p.n : s.n, s.item || '', s.ability || '', s.nat || '', s.sp ? [s.sp.hp, s.sp.atk, s.sp.def, s.sp.spa, s.sp.spd, s.sp.spe].join('/') : '',
    (s.moves || []).map(x => x ? x.name : '').join('+')].join(':');
  function duel(m, t, modes, field) {
    if (cacheOpt.off) return duel0(m, t, modes, field);
    const k = sigOf(m) + (m._fv ? '#fv' : '') + '>' + sigOf(t) + (t._fv ? '#fv' : '') + '|' + (modes.tr ? 1 : 0) + (modes.tw ? 1 : 0) + '@' + (field.weather || '') + '|' + (field.terrain || '') + '|' + (field.auras || []).slice().sort().join(',');
    let r = duelCache.get(k); if (r) return r; if (duelCache.size > 50000) duelCache.clear(); r = duel0(m, t, modes, field); duelCache.set(k, r); return r; }
  function duel0(m, t, modes, field) {
    let o = bestAttack(m, t, field), d = bestAttack(t, m, field);
    const sm = speedOf(m, field), st = speedOf(t, field);
    const prM = o ? o.pr : 0, prT = d ? d.pr : 0;
    const orders = [['faster', sm > st]]; if (modes.tw) orders.push(['with Tailwind', sm * 2 > st]); if (modes.tr && m.p.st[5] <= 60) orders.push(['under Trick Room', sm < st]);
    let first = false, how = '';
    // Stall (Sableye) always moves last inside its priority bracket, whatever the Speed or Trick Room
    const stM = m.ability === 'Stall', stT = t.ability === 'Stall';
    if (prM > prT) { first = true; how = 'priority'; } else if (prM === prT && stM !== stT) { first = stT; how = stT ? 'it has Stall' : ''; }
    else if (prM === prT) for (const [k, f] of orders) if (f) { first = true; how = k; break; }
    // each side's hit changes the other's later hits (and all of them when it lands first)
    const eT = hitEffect(o, t), eM = hitEffect(d, m);
    if (eT) d = bestAttack(t, m, field, {...eT, after: !first}) || d;
    if (eM) o = bestAttack(m, t, field, {...eM, after: first}) || o;
    const nM = o ? o.h : Infinity, nT = d ? d.h : Infinity;
    // Icy Wind / Electroweb / Rock Tomb…: after the first hit lands the target is −1 Speed, so from turn 2 the order can flip
    const sd = o && o.move ? (tDrop(o.move) || {}).spe : 0, later = first || (!!sd && !prT && stM === stT && sm > Math.floor(st * 2 / (2 - sd)));
    const win = (first && nM <= nT) || (!first && (nM < nT || (later && nM === nT && nM >= 2)));
    return {win, nM, nT, first, how: first ? how : later ? 'after its Speed drop' : '', o, d, sm, st};
  }
  const attacks = t => t.moves.filter(m => m && m.bp > 0 && m.name !== 'Fake Out');
  const physOf = t => { const at = attacks(t); return at.length ? at.filter(m => m.cat === 1).length / at.length : 0; };
  // what a support threat does: Trick Room, screens, redirection. Support-first = 2+ of its 4 most-used moves are support moves
  // and one of them is one of those three jobs (Grimmsnarl, Farigiraf, Indeedee-F, Sinistcha…).
  function supportModes(t) { const top = t.moves.slice(0, 4), sup = top.filter(m => m && SUPPORT.has(m.name)).length;
    const modes = []; if (hasMove(t, 'Trick Room')) modes.push('tr'); if (hasAny(t, SCREENS)) modes.push('screens'); if (hasAny(t, REDIR)) modes.push('redir');
    return {modes, first: modes.length > 0 && sup >= 2}; }
  const MODE_NAME = {tr: 'Trick Room', screens: t => t.moves.filter(m => m && SCREENS.includes(m.name)).map(m => m.name).join(' / '), redir: t => t.moves.filter(m => m && REDIR.includes(m.name)).map(m => m.name).join(' / ')};
  // answers to one support job: [{m, kind: 'solid'|'soft', why}]
  function modeAnswers(team, t, mode, rows, tmodes, field) { const out = [], tauntOK0 = !TAUNT_BLOCK.has(t.ability) && t.item !== 'Mental Herb';
    // priority moves (Prankster Taunt, Fake Out) fail into a grounded target in Psychic Terrain
    const psyBlock = m => field && field.terrain === 'psychic' && grounded(t), tauntWorks = m => tauntOK0 && !pranksterFails(m, t, field);
    for (const m of team) { const du = (rows.find(r => r.m === m) || {}).du;
      const ohko = du && du.nM === 1, two = du && du.nM === 2;
      if (mode === 'tr') {
        if (hasMove(m, 'Taunt') && tauntWorks(m)) out.push({m, kind: 'solid', why: `${m.d} Taunts it before Trick Room goes up (Trick Room moves last)`});
        else if (hasMove(m, 'Imprison') && hasMove(m, 'Trick Room')) out.push({m, kind: 'solid', why: `${m.d}'s Imprison stops its Trick Room`});
        else if (hasMove(m, 'Trick Room') && !tmodes.tr) out.push({m, kind: 'soft', why: `${m.d} can reverse its Trick Room with your own`});
        else if (ohko) out.push({m, kind: 'solid', why: `${m.d} OHKOs it with ${du.o.mv}, ${pc(du.o.min)}⁠–⁠${pc(du.o.pct)}% before Trick Room goes up`});
        else if (two) out.push({m, kind: 'soft', why: `${m.d} 2HKOs it with ${du.o.mv}: with a partner it falls before setting Trick Room twice`});
        else if (hasMove(m, 'Fake Out') && !FLINCH_BLOCK.has(t.ability) && !PRIO_BLOCK.has(t.ability) && t.item !== 'Covert Cloak' && !(t.p.t || []).includes('Ghost') && !psyBlock(m)) out.push({m, kind: 'soft', why: `${m.d}'s Fake Out delays its Trick Room a turn`});
        if (hasMove(m, 'Trick Room') && tmodes.tr && !out.some(x => x.m === m)) out.push({m, kind: 'solid', why: `your own Trick Room team plays under Trick Room anyway; ${m.d} can re-set or reverse it`});
      } else if (mode === 'screens') {
        // Real games (20,000 Showdown replays, Oct 28): screen breakers are rare and barely change results; what decides the game
        // is knocking the screen setter out. So focus fire counts: two Pokémon that each OHKO it take it down in one turn even
        // through one screen (each still does 50%+), and a 2HKO or a Fake Out that delays the first screen is a partial answer.
        const br = m.moves.find(x => x && SCREEN_BREAK.includes(x.name)), ohkos = team.filter(x => { const d = (rows.find(r => r.m === x) || {}).du; return d && d.nM === 1; });
        const foOK = hasMove(m, 'Fake Out') && !FLINCH_BLOCK.has(t.ability) && !PRIO_BLOCK.has(t.ability) && t.item !== 'Covert Cloak' && !(t.p.t || []).includes('Ghost') && !psyBlock(m);
        if (br) out.push({m, kind: 'solid', why: `${m.d}'s ${br.name} removes its screens`});
        else if (m.ability === 'Infiltrator') out.push({m, kind: 'solid', why: `${m.d}'s Infiltrator ignores screens`});
        else if (ohko && ohkos.length >= 2) out.push({m, kind: 'solid', why: `${m.d} OHKOs it with ${du.o.mv}; with ${ohkos.find(x => x !== m).d} it goes down in one turn even through a screen`});
        else if (ohko) out.push({m, kind: 'soft', why: `${m.d} OHKOs it with ${du.o.mv}, but only after the first screen is up`});
        else if (hasMove(m, 'Taunt') && tauntWorks(m)) out.push({m, kind: 'soft', why: `${m.d}'s Taunt stops its second screen`});
        else if (foOK) out.push({m, kind: 'soft', why: `${m.d}'s Fake Out moves before Prankster and delays its first screen a turn`});
        else if (two) out.push({m, kind: 'soft', why: `${m.d} 2HKOs it with ${du.o.mv}: focus it before the screens pile up`});
      } else if (mode === 'redir') {
        const sp = m.moves.find(x => x && x.spread && x.bp >= 60 && x.cat > 0);
        if (sp) out.push({m, kind: 'solid', why: `${m.d}'s ${sp.name} hits both foes, so redirection doesn't stop it`});
        else if (['Stalwart', 'Propeller Tail'].includes(m.ability) || hasMove(m, 'Snipe Shot')) out.push({m, kind: 'solid', why: `${m.d} ignores redirection (${hasMove(m, 'Snipe Shot') ? 'Snipe Shot' : m.ability})`});
        else if (ohko) out.push({m, kind: 'solid', why: `${m.d} OHKOs the redirector with ${du.o.mv}, ${pc(du.o.min)}⁠–⁠${pc(du.o.pct)}%`});
        else if (hasMove(t, 'Rage Powder') && !hasMove(t, 'Follow Me') && (m.p.t.includes('Grass') || m.ability === 'Overcoat' || m.item === 'Safety Goggles')) out.push({m, kind: 'solid', why: `${m.d} is immune to Rage Powder`});
        else if (hasMove(m, 'Taunt') && tauntWorks(m)) out.push({m, kind: 'soft', why: `${m.d}'s Taunt stops its redirection after the first turn`});
      } }
    return out; }
  // The fields a matchup can be played on. Your own weather, terrain and auras are only up when you bring their setter, and
  // you bring 4 of 6, so each is a choice: the "bare" field (only what the threat sets itself) is always one option, and every
  // combination of the weather/terrain your team can set is another. An answer that works on the bare field is solid (you
  // can leave your setter out, which is noted); one that needs your own weather or terrain is a conditional, soft answer.
  function fieldsFor(team, t) {
    const tw = WEATHER_AB[t.ability] || '', tt = TERRAIN_AB[t.ability] || '', tAura = [t.ability].filter(a => /^(Fairy|Dark) Aura$/.test(a || ''));
    const W = [...new Set(team.map(m => WEATHER_AB[m.ability]).filter(Boolean))], T = [...new Set(team.map(m => TERRAIN_AB[m.ability]).filter(Boolean))];
    const ownAura = team.map(m => m.ability).filter(a => /^(Fairy|Dark) Aura$/.test(a || ''));
    const out = [];
    for (const w of ['', ...W]) for (const tr of ['', ...T]) for (const a of ownAura.length ? [false, true] : [false])
      out.push({weather: w || tw, terrain: tr || tt, auras: a ? [...new Set([...ownAura, ...tAura])] : tAura, own: {w, t: tr, aura: a}, bare: !w && !tr && !a});
    return out; }
  // a member's own field: the weather, terrain and aura it sets itself are always up while it's out (Drizzle Pelipper always
  // plays in its rain); everything else your team sets is optional
  const baseKey = m => [WEATHER_AB[m.ability] || '', TERRAIN_AB[m.ability] || '', /^(Fairy|Dark) Aura$/.test(m.ability || '')].join('|');
  const fKey = f => [f.own.w, f.own.t, f.own.aura].join('|');
  const OWN_W = {sun: 'sun', rain: 'rain', sand: 'sand', snow: 'snow'}, OWN_T = {grassy: 'Grassy Terrain', electric: 'Electric Terrain', psychic: 'Psychic Terrain', misty: 'Misty Terrain'};
  // plain words for the own-field parts every field in fs shares: "your sun", "your rain and Psychic Terrain"
  // the own-field parts (not set by m itself) that every field in fs shares: "sun", "rain and Psychic Terrain"
  function ownWords(fs, m) { if (!fs.length) return ''; const mw = WEATHER_AB[m.ability] || '', mt = TERRAIN_AB[m.ability] || '';
    const w = fs.every(f => f.own.w && f.own.w !== mw && f.own.w === fs[0].own.w) ? OWN_W[fs[0].own.w] : '',
      tr = fs.every(f => f.own.t && f.own.t !== mt && f.own.t === fs[0].own.t) ? OWN_T[fs[0].own.t] : '',
      a = fs.every(f => f.own.aura) && !/Aura$/.test(m.ability || '') ? 'Aura teammate' : '';
    return [w, tr, a].filter(Boolean).join(' and '); }
  function vsThreat(team, t, modes, only) {
    const fs = fieldsFor(team, t), R = fs.map(f => vsIn(team, t, modes, only, f)), B = R[fs.findIndex(f => f.bare)], pool = only || team;
    const dShow = R[R.length - 1]; // the field with all your own setters up, for the details shown
    // merge one list of answers, member by member: solid on its own field (only what it sets itself, so always available) =
    // solid; solid only with a teammate's weather/terrain = soft, with the condition; soft anywhere = soft
    const merge = (get) => { const solid = [], soft = [];
      for (const m of pool) { const bi = fs.findIndex(f => fKey(f) === baseKey(m)), base = bi >= 0 ? bi : fs.findIndex(f => f.bare);
        // fields without m's own weather/terrain/aura can't happen while m is out, so they don't count for m
        const mw = WEATHER_AB[m.ability] || '', mt = TERRAIN_AB[m.ability] || '', ma = /^(Fairy|Dark) Aura$/.test(m.ability || '');
        const fits = f => (!mw || f.own.w === mw) && (!mt || f.own.t === mt) && (!ma || f.own.aura);
        const sol = R.map((r, i) => fits(fs[i]) ? get(r).solid.find(y => y.m === m) : null);
        if (sol[base]) { const bad = fs.filter((f, i) => fits(f) && !sol[i]), ow = ownWords(bad, m);
          solid.push(ow ? {...sol[base], why: `${sol[base].why} (only if your ${ow} isn't up: leave its setter out)`, cond: 'without'} : sol[base]); continue; }
        const okI = sol.map((x, i) => x ? i : -1).filter(i => i >= 0);
        if (okI.length) { const x = sol[okI[0]], ow = ownWords(okI.map(i => fs[i]), m); soft.push({...x, kind: 'soft', why: `${x.why} (needs your ${ow || 'teammate\'s weather or terrain'})`, cond: 'needs'}); continue; }
        const sf = [R[base], ...R.filter((r, i) => fits(fs[i]))].map(r => get(r).soft.find(y => y.m === m)).find(Boolean); if (sf) soft.push(sf); }
      return {solid, soft}; };
    let mode = null, solid, softR;
    if (B.per) { const per = B.per.map(j => { const g = r => r.per.find(z => z.k === j.k), mm = merge(g);
        return {k: j.k, name: j.name, solid: mm.solid.map(x => ({...x, role: 'mode'})), soft: mm.soft, level: mm.solid.length >= 2 ? 3 : mm.solid.length === 1 ? 2 : mm.soft.length ? 1 : 0}; });
      mode = per.sort((a, b) => a.level - b.level); solid = mode[0].solid; softR = mode[0].soft; }
    else { const mm = merge(r => r); solid = mm.solid; softR = mm.soft; }
    // a member loses to it only if it loses on every field you could play it on
    const losers = []; for (const m of pool) { const mw = WEATHER_AB[m.ability] || '', mt = TERRAIN_AB[m.ability] || '', ma = /^(Fairy|Dark) Aura$/.test(m.ability || '');
      const L = R.filter((r, i) => (!mw || fs[i].own.w === mw) && (!mt || fs[i].own.t === mt) && (!ma || fs[i].own.aura)).map(r => r.losers.find(y => y.m === m));
      if (L.length && L.every(Boolean)) losers.push(L[0]); }
    const holders = pool.length - losers.length;
    // overloaded: you bring 4, so it overloads you only when fewer than 3 of your Pokémon hold up against it (any 4 you bring
    // then has at least 2 it beats). Adding a Pokémon can only add holders, so it never makes a threat worse.
    // (it depends only on how many hold up, so a team still being built counts as overloaded until 3 of its Pokémon do)
    const overloaded = !only && holders <= 2;
    let level = solid.length >= 2 ? 3 : solid.length === 1 ? 2 : softR.length ? 1 : 0;
    if (overloaded && level > 0 && !mode) level--;
    const warn = []; for (const r of R) for (const x of r.warn) if (!warn.some(y => y.m === x.m)) warn.push(x);
    return {t, field: dShow.field, fields: fs, level, label: ['Unanswered', 'Shaky', 'Handled', 'Well handled'][level], solid, soft: softR, warn, losers, overloaded, holders, mode, rows: dShow.rows};
  }
  function vsIn(team, t, modes, only, field) {
    const rows = [];
    for (const m of (only || team)) {
      // Flower Veil on your side: your Grass types can't have their stats lowered (Intimidate included)
      m._fv = m.p.t.includes('Grass') && team.some(x => x.ability === 'Flower Veil');
      const du = duel(m, t, modes, field), soft = [];
      const tag = du.first && du.how && du.how !== 'faster' ? ' (' + du.how + ')' : '';
      const check = du.win && du.nM === 1 && (du.first || (du.d && du.d.pct < 1)), counter = du.win && du.nM <= 2 && du.d && du.d.pct <= .5 && du.nT >= 3, immune = du.nM <= 2 && !du.d;
      // the answer leans on a move that misses too often (under 85%): it's an answer, but a shaky one
      if ((check || counter || immune) && du.o && du.o.acc < SURE) { soft.push(`${check ? 'OHKOs' : '2HKOs'} with ${du.o.mv}, so it can miss`); }
      else if (check || counter || immune) { rows.push({m, kind: 'solid', role: check ? 'check' : 'counter', du,
        why: check ? (du.first ? `${m.d} moves first${tag} and OHKOs with ${du.o.mv}, ${pc(du.o.min)}⁠–⁠${pc(du.o.pct)}%` : `${m.d} survives its ${du.d.mv} (at most ${pc(du.d.pct)}%) and OHKOs back with ${du.o.mv}, ${pc(du.o.min)}⁠–⁠${pc(du.o.pct)}%`)
          : immune ? `${m.d} is immune to its attacks and 2HKOs with ${du.o.mv}, ${pc(du.o.min)}⁠–⁠${pc(du.o.pct)}%`
          : `${m.d} takes at most ${pc(du.d.pct)}% from ${du.d.mv} and 2HKOs with ${du.o.mv}, ${pc(du.o.min)}⁠–⁠${pc(du.o.pct)}%`}); continue; }
      if (du.win && du.nM <= 2) soft.push(`wins 1-on-1 (${du.nM === 1 ? 'OHKO' : '2HKO'} with ${du.o.mv}${du.first ? ', moves first' + tag : ''}) but takes up to ${pc(du.d ? du.d.pct : 0)}% back`);
      else if (du.d && du.d.pct <= .45 && du.o && du.o.mid >= .3) soft.push(`walls it: takes at most ${pc(du.d.pct)}% from ${du.d.mv}, hits back ~${pc(du.o.mid)}%`);
      const ph = physOf(t);
      if (m.ability === 'Intimidate' && ph >= .5) { if (PUNISH_INTIM.has(t.ability)) rows.push({m, kind: 'warn', du, why: `${m.d}'s Intimidate backfires: ${t.d} has ${t.ability}`}); else if (!NO_INTIM.has(t.ability)) soft.push('Intimidate cuts its physical attacks'); }
      if (hasMove(m, 'Will-O-Wisp') && ph >= .5 && !t.p.t.includes('Fire') && !['Guts', 'Water Veil', 'Water Bubble', 'Flash Fire', 'Good as Gold', 'Magic Bounce'].includes(t.ability) && !pranksterFails(m, t, field) && !(field.terrain === 'misty' && grounded(t))) { const a = moveAcc(MVn('Will-O-Wisp'), m.ability, field.weather, {ability: t.ability, item: t.item}, m.item); soft.push(`Will-O-Wisp cripples it${a < 100 ? ` (${a}% to hit, so it can miss)` : ''}`); }
      if (hasMove(m, 'Wide Guard') && attacks(t).some(x => x.spread)) soft.push('Wide Guard blocks its spread attacks');
      if (hasMove(m, 'Taunt') && t.moves.some(x => x && SETUP.has(x.name)) && !TAUNT_BLOCK.has(t.ability) && !pranksterFails(m, t, field)) soft.push(`Taunt stops its ${t.moves.filter(x => x && SETUP.has(x.name)).map(x => x.name).join('/')}`);
      rows.push(soft.length ? {m, kind: 'soft', why: `${m.d}: ${soft.join('; ')}`, du} : {m, kind: 'none', du});
    }
    let solid = rows.filter(r => r.kind === 'solid'), softR = rows.filter(r => r.kind === 'soft');
    const warn = rows.filter(r => r.kind === 'warn');
    // a member whose Intimidate backfires can still win the 1-on-1: that counts as a soft answer
    for (const r of rows) if (r.kind === 'warn' && r.du && r.du.win && r.du.nM <= 2) softR.push({...r, kind: 'soft', why: `${r.m.d}: wins 1-on-1 with ${r.du.o.mv}`});
    // (each member once: a member whose Intimidate backfires also has a 'warn' row with the same duel)
    const losers = rows.filter(r => r.kind !== 'warn' && r.du && r.du.d && !r.du.win && r.du.nT <= 2 && (!r.du.first || r.du.nT === 1));
    // support-first threats: judged by answers to their job (vsThreat picks the weakest-answered job after merging fields)
    const sm = supportModes(t); let per = null;
    if (sm.first && !only) per = sm.modes.map(k => { const a = modeAnswers(team, t, k, rows, modes, field);
      return {k, name: typeof MODE_NAME[k] === 'function' ? MODE_NAME[k](t) : MODE_NAME[k], solid: a.filter(x => x.kind === 'solid'), soft: a.filter(x => x.kind === 'soft')}; });
    return {field, solid, soft: softR, warn, losers, per, rows};
  }
  const PTS = [0, .4, .8, 1];
  // the threat list: top 30 by recency-weighted top-cut share (results.tc); before that loads, the 30 most used
  let thCache = {key: null, list: null};
  function threatList(n = 30) { let res = null; try { res = RES; } catch (e) {} const tc = res && res.tc && res.tc.rows && Object.keys(res.tc.rows).length >= 50 ? res.tc.rows : null;
    const key = metaVersion + '|' + (tc ? 'tc' : 'u') + '|' + n; if (thCache.key === key) return thCache.list;
    let list = tc ? Object.entries(tc).filter(([k, r]) => byName.has(k) && Array.isArray(r)).sort((a, b) => b[1][1] - a[1][1]).slice(0, n).map(([k, r]) => ({n: k, w: +r[1], src: 'top cut'}))
      : ROSTER.map(p => ({n: p.n, w: U(p)})).filter(x => x.w > 0).sort((a, b) => b.w - a.w).slice(0, n).map(x => ({...x, src: 'usage'}));
    const sides = []; for (const x of list) { try { const s = side({n: x.n, top: true}); sides.push({...s, w: x.w, src: x.src, setSrc: s.spec && s.spec.sets ? `top-cut sets (${s.spec.sets})` : 'all tournament teams'}); } catch (e) {} }
    thCache = {key, list: sides}; return sides; }
  // report for spec arrays (tests, real sheets) or ready-made sides
  function reportSides(team, ths) { const modes = teamModes(team), rows = ths.map(t => vsThreat(team, t, modes)), W = ths.reduce((a, t) => a + t.w, 0) || 1;
    return {score: Math.round(100 * rows.reduce((a, r) => a + r.t.w * PTS[r.level], 0) / W), modes, rows, team, W}; }
  function report(teamSpecs, threatSpecs) { const team = teamSpecs.map(side), ths = threatSpecs ? threatSpecs.map(x => ({...side(x), w: x.w})) : threatList();
    return reportSides(team, ths); }
  // your team, cached by its sets
  const repCache = new Map();
  function teamReport(ms) { if (!ms || !ms.length) return null; const ths = threatList(); if (!ths.length) return null;
    let team; try { team = ms.filter(m => m && m.p).map(fromMember); } catch (e) { return null; }
    const key = thCache.key + '|' + team.map(s => [s.n, s.item, s.ability, s.nat, Object.values(s.sp).join('/'), s.moves.map(m => m.name).join('+')].join(':')).join(';');
    let r = repCache.get(key); if (r) return r; r = reportSides(team, ths); if (repCache.size > 600) repCache.clear(); repCache.set(key, r); return r; }
  function brief(rep) { return {score: rep.score, modes: rep.modes, rows: rep.rows.map(r => ({t: r.t.n, w: +r.t.w.toFixed(3), label: r.label, level: r.level, field: r.field, mode: r.mode ? r.mode.map(x => x.k) : null, solid: r.solid.map(x => x.why), soft: r.soft.map(x => x.why), warn: r.warn.map(x => x.why),
    losers: r.losers.map(x => `${x.m.d} (${x.du.d.mv} ${pc(x.du.d.min)}-${pc(x.du.d.pct)}%, ${x.du.nT === 1 ? 'OHKO' : '2HKO'}, speed ${x.du.st} vs ${x.du.sm})`), overloaded: r.overloaded}))}; }
  function pair(aSpec, dSpec, field) { const a = side(aSpec), d = side(dSpec), out = [];
    for (const mv of a.moves) { if (!mv || !mv.bp || mv.cat === 0) continue; const r = damage({atk: atkObj(a), def: defObj(d), move: mv, spread: !!mv.spread, weather: field.weather || '', terrain: field.terrain || ''});
      if (r) out.push({mv: mv.name, spread: !!mv.spread, min: r.min, max: r.max, hp: r.hp, pct: [+(100 * r.min / r.hp).toFixed(1), +(100 * r.max / r.hp).toFixed(1)], ko: koText(r)}); }
    const S_ = s => ({n: s.n, nat: s.nat, sp: s.sp, ability: s.ability, item: s.item, moves: s.moves.map(m => m.name), spe: speedOf(s, field)});
    return {a: S_(a), d: S_(d), out}; }
  function one(mSpec, tSpec, teamSpecs) { const team = (teamSpecs || [mSpec]).map(side), m = side(mSpec), t = side(tSpec), modes = teamModes(team);
    const r = vsThreat(team, t, modes, [m]), x = r.solid[0] || r.soft[0] || r.warn[0];
    // the numbers shown: the matchup with your whole team's weather and terrain up (as before)
    const du = duel(m, t, modes, fieldFor(team, t));
    return {kind: r.solid.length ? 'solid' : r.soft.length ? 'soft' : r.warn.length ? 'warn' : 'none', why: x ? x.why : '', field: fieldFor(team, t), nM: du.nM, nT: du.nT, first: du.first, how: du.how, sm: du.sm, st: du.st,
      o: du.o && {mv: du.o.mv, name: du.o.name, acc: du.o.acc, charge: !!du.o.charge, min: pc(du.o.min), max: pc(du.o.pct)}, d: du.d && {mv: du.d.mv, name: du.d.name, acc: du.d.acc, min: pc(du.d.min), max: pc(du.d.pct)}}; }
  // one support threat judged as a whole team (phase 2 hand checks)
  function teamVs(teamSpecs, tSpec) { const team = teamSpecs.map(side), t = side(tSpec), r = vsThreat(team, t, teamModes(team));
    return {label: r.label, level: r.level, mode: r.mode ? r.mode.map(x => x.k) : null, solid: r.solid.map(x => x.why), soft: r.soft.map(x => x.why)}; }
  // one line of evidence for a threat row (the best answer, or why it's a problem)
  function evidence(r) { if (r.solid.length) return r.solid[0].why; if (r.soft.length) return r.soft[0].why;
    if (r.mode) return `Nothing on the team answers its ${r.mode[0].name}`;
    const l = r.losers[0]; return l ? `It beats ${r.losers.slice(0, 3).map(x => x.m.d).join(', ')} 1-on-1 (${l.du.d.mv} ${pc(l.du.d.min)}-${pc(l.du.d.pct)}% on ${l.m.d})` : 'No one on the team beats it 1-on-1'; }
  return {side, fromMember, report, reportSides, teamReport, threatList, brief, pair, one, teamVs, vsThreat, teamModes, speedOf, fieldFor, duel, evidence, PTS,
    noCache: off => { cacheOpt.off = !!off; duelCache.clear(); repCache.clear(); }};
})();
if (window.__PL_TEST || window.__THR_EXPOSE) window.THR = THR;
// readiness of any six members (suggestions, saved teams, home card): {score, rows} or null
function readinessOf(ms) { try { const r = THR.teamReport(ms); return r ? r : null; } catch (e) { return null; } }

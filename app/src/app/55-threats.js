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
  const WEATHER_AB = {Drought: 'sun', 'Mega Sol': 'sun', Drizzle: 'rain', 'Sand Stream': 'sand', 'Snow Warning': 'snow'};
  const TERRAIN_AB = {'Grassy Surge': 'grassy', 'Electric Surge': 'electric', 'Psychic Surge': 'psychic', 'Misty Surge': 'misty', 'Hadron Engine': 'electric'};
  const WSPEED = {Chlorophyll: 'sun', 'Swift Swim': 'rain', 'Sand Rush': 'sand', 'Slush Rush': 'snow'};
  const SEED = {'Grassy Seed': 'grassy', 'Electric Seed': 'electric', 'Psychic Seed': 'psychic', 'Misty Seed': 'misty'};
  const NO_INTIM = new Set(['Defiant', 'Competitive', 'Clear Body', 'Inner Focus', 'Oblivious', 'Own Tempo', 'Scrappy', 'Guard Dog', 'Mirror Armor', 'Full Metal Body', 'White Smoke', 'Hyper Cutter', 'Rattled', 'Contrary']);
  const PUNISH_INTIM = new Set(['Defiant', 'Competitive', 'Guard Dog', 'Contrary', 'Mirror Armor', 'Rattled']);
  const SETUP = new Set(['Swords Dance', 'Dragon Dance', 'Nasty Plot', 'Calm Mind', 'Quiver Dance', 'Shell Smash', 'Bulk Up', 'Belly Drum', 'Victory Dance', 'Coil', 'Tidy Up', 'Trick Room', 'Tailwind', 'Shift Gear', 'Geomancy']);
  const SELF_DROP = {'Draco Meteor': -2, Overheat: -2, 'Leaf Storm': -2, 'Psycho Boost': -2, 'Fleur Cannon': -2, 'Make It Rain': -1};
  const TAUNT_BLOCK = new Set(['Oblivious', 'Aroma Veil', 'Magic Bounce', 'Good as Gold']);
  const SCREENS = ['Reflect', 'Light Screen', 'Aurora Veil'], REDIR = ['Follow Me', 'Rage Powder'];
  const SCREEN_BREAK = ['Brick Break', 'Psychic Fangs', 'Raging Bull', 'Defog'];
  const SUPPORT = new Set(['Trick Room', 'Reflect', 'Light Screen', 'Aurora Veil', 'Follow Me', 'Rage Powder', 'Helping Hand', 'Tailwind', 'Fake Out', 'Parting Shot', 'Spore', 'Sleep Powder', 'Thunder Wave', 'Encore', 'Taunt', 'Will-O-Wisp', 'Pollen Puff', 'Wide Guard', 'Ally Switch', 'Coaching']);
  const grounded = s => !s.p.t.includes('Flying') && s.ability !== 'Levitate';
  const prioOf = (mv, field, att) => { if (!mv) return 0; if (mv.name === 'Grassy Glide') return field.terrain === 'grassy' && grounded(att) ? 1 : 0;
    if (mv.name === 'Extreme Speed') return 2; return PRIORITY.has(mv.name) ? 1 : 0; };
  const isStone = it => !!it && STONE_RE.test(it);
  const pc = x => Math.round(x * 100);
  // a side from a spec (tests, real team sheets): {n, item?, ability?, moves?:[names], nat?, sp?:{hp,atk,def,spa,spd,spe}}
  // Default moves: the 4 most used, plus any attack at least 30% of players run (so a support-first set still carries its attack).
  function side(spec) {
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
  function intimidated(att, foe) { if (!foe || foe.ability !== 'Intimidate') return {atk: 0, spa: 0};
    const a = att.ability; if (['Defiant', 'Guard Dog', 'Contrary'].includes(a)) return {atk: 1, spa: 0}; if (a === 'Competitive') return {atk: -1, spa: 2};
    if (NO_INTIM.has(a)) return {atk: 0, spa: 0}; return {atk: -1, spa: 0}; }
  const defObj = s => ({p: s.p, hpSp: s.sp.hp, defSp: s.sp.def, spdSp: s.sp.spd, atkSp: s.sp.atk, nat: s.nat, item: isStone(s.item) ? '' : s.item, ability: s.ability, boost: 0});
  function fieldFor(team, t) {
    return {weather: team.map(m => WEATHER_AB[m.ability]).find(Boolean) || WEATHER_AB[t.ability] || '',
      terrain: team.map(m => TERRAIN_AB[m.ability]).find(Boolean) || TERRAIN_AB[t.ability] || ''};
  }
  function speedOf(s, field) {
    let v = calcStat(s.p, 'Spe', s.sp.spe, natMul(s.nat, 'Spe'));
    if (s.item === 'Choice Scarf') v = Math.floor(v * 1.5);
    if (WSPEED[s.ability] && field.weather === WSPEED[s.ability]) v *= 2;
    if (s.ability === 'Unburden' && SEED[s.item] && field.terrain === SEED[s.item]) v *= 2;
    return v;
  }
  function hitsToKO(r, r2, sitrus) { if (!r || r.max === 0) return Infinity; const hp = r.hp, a = r.rolls[7], b = r2 ? r2.rolls[7] : (r.next && r.next.rolls ? r.next.rolls : r.rolls)[7];
    if (a >= hp) return r.sash ? 2 : 1; let left = hp - a, n = 1, berry = !!sitrus;
    if (berry && left <= hp / 2) { left += Math.floor(hp / 4); berry = false; }
    while (left > 0 && n < 9) { left -= b; n++; if (left > 0 && berry && left <= hp / 2) { left += Math.floor(hp / 4); berry = false; } } return n; }
  function bestAttack(att, def, field) {
    let best = null; const st = intimidated(att, def);
    for (const mv of att.moves) { if (!mv || !mv.bp || mv.cat === 0 || mv.name === 'Fake Out') continue;
      const b0 = mv.cat === 1 ? st.atk : st.spa, base = {def: defObj(def), move: mv, spread: !!mv.spread, weather: field.weather, terrain: field.terrain};
      const r = damage({...base, atk: atkObj(att, b0)}); if (!r) continue;
      const drop = SELF_DROP[mv.name] && !['Contrary', 'Clear Body', 'White Smoke', 'Full Metal Body'].includes(att.ability) ? SELF_DROP[mv.name] : 0;
      const r2 = drop ? damage({...base, atk: atkObj(att, Math.max(-6, b0 + drop))}) : null;
      const h = hitsToKO(r, r2, def.item === 'Sitrus Berry' && att.ability !== 'Unnerve'), pr = prioOf(mv, field, att), mid = r.rolls[7] / r.hp;
      if (!best || h < best.h || (h === best.h && (pr > best.pr || (pr === best.pr && mid > best.mid)))) best = {mv: mv.name, h, pr, pct: r.max / r.hp, mid, min: r.min / r.hp}; }
    return best;
  }
  const hasMove = (s, n) => s.moves.some(m => m && m.name === n);
  const hasAny = (s, ns) => s.moves.some(m => m && ns.includes(m.name));
  function teamModes(team) {
    const trSet = team.filter(m => hasMove(m, 'Trick Room')), slow = team.filter(m => m.p.st[5] <= 60 && !hasMove(m, 'Trick Room'));
    return {tr: trSet.length > 0 && slow.length >= 2, tw: team.some(m => hasMove(m, 'Tailwind'))};
  }
  function duel(m, t, modes, field) {
    const o = bestAttack(m, t, field), d = bestAttack(t, m, field);
    const nM = o ? o.h : Infinity, nT = d ? d.h : Infinity, sm = speedOf(m, field), st = speedOf(t, field);
    const prM = o ? o.pr : 0, prT = d ? d.pr : 0;
    const orders = [['faster', sm > st]]; if (modes.tw) orders.push(['with Tailwind', sm * 2 > st]); if (modes.tr && m.p.st[5] <= 60) orders.push(['under Trick Room', sm < st]);
    let first = false, how = '';
    if (prM > prT) { first = true; how = 'priority'; } else if (prM === prT) for (const [k, f] of orders) if (f) { first = true; how = k; break; }
    return {win: (first && nM <= nT) || (!first && nM < nT), nM, nT, first, how, o, d, sm, st};
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
    const psyBlock = m => field && field.terrain === 'psychic' && grounded(t), tauntWorks = m => tauntOK0 && !(m.ability === 'Prankster' && psyBlock(m));
    for (const m of team) { const du = (rows.find(r => r.m === m) || {}).du;
      const ohko = du && du.nM === 1, two = du && du.nM === 2;
      if (mode === 'tr') {
        if (hasMove(m, 'Taunt') && tauntWorks(m)) out.push({m, kind: 'solid', why: `${m.d} Taunts it before Trick Room goes up (Trick Room moves last)`});
        else if (hasMove(m, 'Imprison') && hasMove(m, 'Trick Room')) out.push({m, kind: 'solid', why: `${m.d}'s Imprison stops its Trick Room`});
        else if (hasMove(m, 'Trick Room') && !tmodes.tr) out.push({m, kind: 'soft', why: `${m.d} can reverse its Trick Room with your own`});
        else if (ohko) out.push({m, kind: 'solid', why: `${m.d} OHKOs it with ${du.o.mv} (${pc(du.o.min)}-${pc(du.o.pct)}%) before Trick Room goes up`});
        else if (two) out.push({m, kind: 'soft', why: `${m.d} 2HKOs it with ${du.o.mv}: with a partner it falls before setting Trick Room twice`});
        else if (hasMove(m, 'Fake Out') && t.ability !== 'Inner Focus' && t.ability !== 'Armor Tail' && !(t.p.t || []).includes('Ghost') && !psyBlock(m)) out.push({m, kind: 'soft', why: `${m.d}'s Fake Out delays its Trick Room a turn`});
        if (hasMove(m, 'Trick Room') && tmodes.tr && !out.some(x => x.m === m)) out.push({m, kind: 'solid', why: `your own Trick Room team plays under Trick Room anyway; ${m.d} can re-set or reverse it`});
      } else if (mode === 'screens') {
        const br = m.moves.find(x => x && SCREEN_BREAK.includes(x.name));
        if (br) out.push({m, kind: 'solid', why: `${m.d}'s ${br.name} removes its screens`});
        else if (m.ability === 'Infiltrator') out.push({m, kind: 'solid', why: `${m.d}'s Infiltrator ignores screens`});
        else if (ohko) out.push({m, kind: 'soft', why: `${m.d} OHKOs it with ${du.o.mv}, but only after the first screen is up`});
        else if (hasMove(m, 'Taunt') && tauntWorks(m)) out.push({m, kind: 'soft', why: `${m.d}'s Taunt stops its second screen`});
      } else if (mode === 'redir') {
        const sp = m.moves.find(x => x && x.spread && x.bp >= 60 && x.cat > 0);
        if (sp) out.push({m, kind: 'solid', why: `${m.d}'s ${sp.name} hits both foes, so redirection doesn't stop it`});
        else if (['Stalwart', 'Propeller Tail'].includes(m.ability) || hasMove(m, 'Snipe Shot')) out.push({m, kind: 'solid', why: `${m.d} ignores redirection (${hasMove(m, 'Snipe Shot') ? 'Snipe Shot' : m.ability})`});
        else if (ohko) out.push({m, kind: 'solid', why: `${m.d} OHKOs the redirector with ${du.o.mv} (${pc(du.o.min)}-${pc(du.o.pct)}%)`});
        else if (hasMove(t, 'Rage Powder') && !hasMove(t, 'Follow Me') && (m.p.t.includes('Grass') || m.ability === 'Overcoat' || m.item === 'Safety Goggles')) out.push({m, kind: 'solid', why: `${m.d} is immune to Rage Powder`});
        else if (hasMove(m, 'Taunt') && tauntWorks(m)) out.push({m, kind: 'soft', why: `${m.d}'s Taunt stops its redirection after the first turn`});
      } }
    return out; }
  function vsThreat(team, t, modes, only) {
    const field = fieldFor(team, t), rows = [];
    for (const m of (only || team)) {
      const du = duel(m, t, modes, field), soft = [];
      const tag = du.first && du.how && du.how !== 'faster' ? ' (' + du.how + ')' : '';
      const check = du.win && du.nM === 1 && (du.first || (du.d && du.d.pct < 1)), counter = du.win && du.nM <= 2 && du.d && du.d.pct <= .5 && du.nT >= 3, immune = du.nM <= 2 && !du.d;
      if (check || counter || immune) { rows.push({m, kind: 'solid', role: check ? 'check' : 'counter', du,
        why: check ? (du.first ? `${m.d} moves first${tag} and OHKOs with ${du.o.mv} (${pc(du.o.min)}-${pc(du.o.pct)}%)` : `${m.d} survives its ${du.d.mv} (at most ${pc(du.d.pct)}%) and OHKOs back with ${du.o.mv} (${pc(du.o.min)}-${pc(du.o.pct)}%)`)
          : immune ? `${m.d} is immune to its attacks and 2HKOs with ${du.o.mv} (${pc(du.o.min)}-${pc(du.o.pct)}%)`
          : `${m.d} takes at most ${pc(du.d.pct)}% from ${du.d.mv} and 2HKOs with ${du.o.mv} (${pc(du.o.min)}-${pc(du.o.pct)}%)`}); continue; }
      if (du.win && du.nM <= 2) soft.push(`wins 1-on-1 (${du.nM === 1 ? 'OHKO' : '2HKO'} with ${du.o.mv}${du.first ? ', moves first' + tag : ''}) but takes up to ${pc(du.d ? du.d.pct : 0)}% back`);
      else if (du.d && du.d.pct <= .45 && du.o && du.o.mid >= .3) soft.push(`walls it: takes at most ${pc(du.d.pct)}% from ${du.d.mv}, hits back ~${pc(du.o.mid)}%`);
      const ph = physOf(t);
      if (m.ability === 'Intimidate' && ph >= .5) { if (PUNISH_INTIM.has(t.ability)) rows.push({m, kind: 'warn', du, why: `${m.d}'s Intimidate backfires: ${t.d} has ${t.ability}`}); else if (!NO_INTIM.has(t.ability)) soft.push('Intimidate cuts its physical attacks'); }
      if (hasMove(m, 'Will-O-Wisp') && ph >= .5 && !t.p.t.includes('Fire') && !['Guts', 'Water Veil', 'Water Bubble', 'Flash Fire', 'Good as Gold', 'Magic Bounce'].includes(t.ability)) soft.push('Will-O-Wisp cripples it');
      if (hasMove(m, 'Wide Guard') && attacks(t).some(x => x.spread)) soft.push('Wide Guard blocks its spread attacks');
      if (hasMove(m, 'Taunt') && t.moves.some(x => x && SETUP.has(x.name)) && !TAUNT_BLOCK.has(t.ability) && !(m.ability === 'Prankster' && field.terrain === 'psychic' && grounded(t))) soft.push(`Taunt stops its ${t.moves.filter(x => x && SETUP.has(x.name)).map(x => x.name).join('/')}`);
      rows.push(soft.length ? {m, kind: 'soft', why: `${m.d}: ${soft.join('; ')}`, du} : {m, kind: 'none', du});
    }
    let solid = rows.filter(r => r.kind === 'solid'), softR = rows.filter(r => r.kind === 'soft');
    const warn = rows.filter(r => r.kind === 'warn');
    // a member whose Intimidate backfires can still win the 1-on-1: that counts as a soft answer
    for (const r of rows) if (r.kind === 'warn' && r.du && r.du.win && r.du.nM <= 2) softR.push({...r, kind: 'soft', why: `${r.m.d}: wins 1-on-1 with ${r.du.o.mv}`});
    const losers = rows.filter(r => r.du && r.du.d && !r.du.win && r.du.nT <= 2 && (!r.du.first || r.du.nT === 1));
    const overloaded = losers.length >= 4;
    // support-first threats: judged by answers to their job (the weakest-answered job decides)
    const sm = supportModes(t); let mode = null;
    if (sm.first && !only) { const per = sm.modes.map(k => { const a = modeAnswers(team, t, k, rows, modes, field), s = a.filter(x => x.kind === 'solid'), f = a.filter(x => x.kind === 'soft');
        return {k, name: typeof MODE_NAME[k] === 'function' ? MODE_NAME[k](t) : MODE_NAME[k], solid: s, soft: f, level: s.length >= 2 ? 3 : s.length === 1 ? 2 : f.length ? 1 : 0}; });
      mode = per.sort((a, b) => a.level - b.level); solid = mode[0].solid.map(x => ({...x, role: 'mode'})); softR = mode[0].soft.map(x => ({...x})); }
    let level = solid.length >= 2 ? 3 : solid.length === 1 ? 2 : softR.length ? 1 : 0;
    if (overloaded && level > 0 && !mode) level--;
    return {t, field, level, label: ['Unanswered', 'Shaky', 'Handled', 'Well handled'][level], solid, soft: softR, warn, losers, overloaded, mode, rows};
  }
  const PTS = [0, .4, .8, 1];
  // the threat list: top 30 by recency-weighted top-cut share (results.tc); before that loads, the 30 most used
  let thCache = {key: null, list: null};
  function threatList(n = 30) { let res = null; try { res = RES; } catch (e) {} const tc = res && res.tc && res.tc.rows && Object.keys(res.tc.rows).length >= 50 ? res.tc.rows : null;
    const key = metaVersion + '|' + (tc ? 'tc' : 'u') + '|' + n; if (thCache.key === key) return thCache.list;
    let list = tc ? Object.entries(tc).filter(([k, r]) => byName.has(k) && Array.isArray(r)).sort((a, b) => b[1][1] - a[1][1]).slice(0, n).map(([k, r]) => ({n: k, w: +r[1], src: 'top cut'}))
      : ROSTER.map(p => ({n: p.n, w: U(p)})).filter(x => x.w > 0).sort((a, b) => b.w - a.w).slice(0, n).map(x => ({...x, src: 'usage'}));
    const sides = []; for (const x of list) { try { sides.push({...side({n: x.n}), w: x.w, src: x.src}); } catch (e) {} }
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
    const du = (r.solid[0] || r.soft[0] || {}).du || duel(m, t, modes, fieldFor(team, t));
    return {kind: r.solid.length ? 'solid' : r.soft.length ? 'soft' : r.warn.length ? 'warn' : 'none', why: x ? x.why : '', field: fieldFor(team, t), nM: du.nM, nT: du.nT, first: du.first, how: du.how, sm: du.sm, st: du.st,
      o: du.o && {mv: du.o.mv, min: pc(du.o.min), max: pc(du.o.pct)}, d: du.d && {mv: du.d.mv, min: pc(du.d.min), max: pc(du.d.pct)}}; }
  // one support threat judged as a whole team (phase 2 hand checks)
  function teamVs(teamSpecs, tSpec) { const team = teamSpecs.map(side), t = side(tSpec), r = vsThreat(team, t, teamModes(team));
    return {label: r.label, level: r.level, mode: r.mode ? r.mode.map(x => x.k) : null, solid: r.solid.map(x => x.why), soft: r.soft.map(x => x.why)}; }
  // one line of evidence for a threat row (the best answer, or why it's a problem)
  function evidence(r) { if (r.solid.length) return r.solid[0].why; if (r.soft.length) return r.soft[0].why;
    if (r.mode) return `Nothing on the team answers its ${r.mode[0].name}`;
    const l = r.losers[0]; return l ? `It beats ${r.losers.slice(0, 3).map(x => x.m.d).join(', ')} 1-on-1 (${l.du.d.mv} ${pc(l.du.d.min)}-${pc(l.du.d.pct)}% on ${l.m.d})` : 'No one on the team beats it 1-on-1'; }
  return {side, fromMember, report, reportSides, teamReport, threatList, brief, pair, one, teamVs, vsThreat, teamModes, speedOf, fieldFor, duel, evidence, PTS};
})();
if (window.__PL_TEST || window.__THR_EXPOSE) window.THR = THR;
// readiness of any six members (suggestions, saved teams, home card): {score, rows} or null
function readinessOf(ms) { try { const r = THR.teamReport(ms); return r ? r : null; } catch (e) { return null; } }

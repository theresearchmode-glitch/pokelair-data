// ---------- turn 1: what your two leads should do into their likely leads ----------
// Built from each side's usual moves, real damage (39-damage-calc-speed.js) and likely speed.
// Fake Out the biggest threat, set speed control when they outspeed you, otherwise take the best KO or the best damage.
// R3 (Nov 11): the logic is turnOneData (plain data and plain text, no HTML); turnOnePlan only draws it. Today's page and the
// rebuild's Battle page both draw from turnOneData, so the plan is worked out in one place. Same output: experiments/same-battle.mjs.
function turnOneData(mine, theirs, r) {
  if (r.lead.length < 2 || theirs.length < 2) return null;
  // one Mega per side (Sim's design review #1, Nov 18: both opposing leads were shown as Megas): only one Pokémon a side can Mega
  // Evolve in a battle, so when both leads of a side are Megas the second is shown and calculated as its base form (same set)
  // the base form: its own entry, or the one form listed under that name ('Floette' is only listed as 'Floette-Eternal')
  const baseP = p => { if (!p || !p.m || typeof byName !== 'object') return null; return byName.get(p.b) || [...byName.values()].find(q => q && !q.m && String(q.n).startsWith(p.b + '-')) || null; };
  const baseOf = x => { const bp = baseP(x && x.p); return bp ? {...x, p: bp, d: bp.d, _orig: x._orig || x} : x; };
  // keep the first Mega; if the other can't be shown as its base form, keep that one as the Mega instead
  const oneMega = arr => { const mi = arr.map((x, i) => x && x.p && x.p.m ? i : -1).filter(i => i >= 0); if (mi.length < 2) return arr;
    const keep = baseP(arr[mi[1]].p) ? mi[0] : baseP(arr[mi[0]].p) ? mi[1] : -1; if (keep < 0) return arr;
    return arr.map((x, i) => mi.includes(i) && i !== keep ? baseOf(x) : x); };
  const opp = oneMega(r.B ? likelyLead(theirs, r.B) : theirs.slice(0, 2));
  const L0 = r.lead.map(i => mine[i]), L = oneMega(L0), names = m => new Set(memberMoves(m).moves.map(x => x.name));
  // your leads use their real items and spreads; the weather/terrain the four leads set is in play for every hit
  const mineM = m => { const o = m && m._orig || m; return L0.includes(o) ? o : L.includes(o) ? o : null; }; // _orig: the pre-Mega stand-in turnOneField passes
  const spe = m => { const s = likelySpeed(m.p, mineM(m)); return s.scarf ? Math.floor(s.v * 1.5) : s.v; };
  // a Cloud Nine / Air Lock lead switches the weather's effects off for every hit and speed (F0.wx)
  const F0 = typeof turnOneField === 'function' ? turnOneField([...L, ...opp], spe) : {}, F = {...F0, weather: F0.wx != null ? F0.wx : F0.weather};
  const hitOn = (a, moves, d) => bestHitOn(a.p, moves, d.p, mineM(a), mineM(d), F);
  // speed in that field: Chlorophyll / Swift Swim / Sand Rush / Slush Rush double in their weather
  const speF = x => spe(x) * (typeof speedMul === 'function' ? speedMul(abilityOf(x), F.weather) : 1);
  // their threat to each of my leads: the hardest single hit
  const danger = opp.map(o => { let worst = null; for (const m of L) { const h = hitOn(o, o.moves || [], m); if (h && (!worst || h.r.max / h.r.hp > worst.pct)) worst = {pct: h.r.max / h.r.hp, h, on: m}; } return {o, worst}; })
    .sort((a, b) => (b.worst ? b.worst.pct : 0) - (a.worst ? a.worst.pct : 0));
  const fast = opp.filter(o => L.some(m => speF(o) > speF(m))).length;
  const lines = [], used = new Set(), mvOf = (m, n) => memberMoves(m).moves.find(x => x && x.name === n) || mvByName.get(n);
  // each action carries its priority bracket (Fake Out +3, Prankster Tailwind +1, Trick Room −7…) for the turn order below
  const pr = (m, n) => movePrio(mvOf(m, n), m.ability, {terrain: F.terrain, grounded: grounded(m)});
  for (const m of L) { const mv = names(m), partner = L.find(x => x !== m);
    if (mv.has('Fake Out') && danger[0] && !used.has('fake')) { used.add('fake'); lines.push([m, `Fake Out ${danger[0].o.d}`, danger[0].worst ? `its ${danger[0].worst.h.mv.name} does up to ${dmgP(100 * danger[0].worst.pct)}% of ${danger[0].worst.on.d}'s HP (${koShort(danger[0].worst.h.r)})` : 'their biggest threat', pr(m, 'Fake Out')]); continue; }
    if (mv.has('Tailwind') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Tailwind', `${fast} of their leads outspeed your side`, pr(m, 'Tailwind')]); continue; }
    if (mv.has('Trick Room') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Trick Room', 'they are faster; Trick Room goes up last this turn (−7) and flips the order from next turn', pr(m, 'Trick Room')]); continue; }
    // attack: prefer a KO, then the most damage; spread moves count both targets; a move that charges first or hits your own
    // partner says so
    // never a move that can KO your own partner (design review #1: Earthquake was planned while it does up to 161% to your Sneasler):
    // such a move is dropped and the next best is planned; one that only dents the partner stays, with its note
    let best = null, pool = memberMoves(m).moves;
    for (let tries = 0; tries < 6; tries++) { best = null;
      for (const o of opp) { const h = hitOn(m, pool, o); if (!h) continue; const pct = h.r.max / h.r.hp, ko = h.r.min >= h.r.hp && !h.charge;
        const hitsAlly = h.mv.ally && allyHit(h.mv, partner);
        const val = (ko ? 2 : 0) + pct * (h.charge ? .3 : 1) * (h.acc / 100) + (h.mv.spread ? .3 : 0) - (hitsAlly ? .4 : 0); if (!best || val > best.val) best = {o, h, pct, ko, val, hitsAlly}; }
      if (best && best.hitsAlly) { const r2 = hitOn(m, [best.h.mv], partner); if (r2 && r2.r.max >= r2.r.hp) { const bad = best.h.mv.name; pool = pool.filter(x => x && x.name !== bad); best = null; continue; } }
      break; }
    if (best) { const nt = hitNote(best.h), ally = best.hitsAlly ? (() => { const r2 = hitOn(m, [best.h.mv], partner); return `; also hits your ${partner.d}${r2 ? ' for up to ' + dmgP(100 * r2.r.max / r2.r.hp) + '% of its HP' : ''}`; })() : '';
      lines.push([m, `${best.h.mv.name} ${best.h.mv.spread ? '(hits both)' : 'into ' + best.o.d}`, `${best.ko ? 'KOs' : 'up to ' + dmgP(100 * best.pct) + '% of its HP, ' + koShort(best.h.r)}${best.h.mv.spread ? ' on ' + best.o.d : ''}${nt ? ' (' + nt + ')' : ''}${ally}`, pr(m, best.h.mv.name)]); }
    else lines.push([m, 'Protect or switch', 'no good attack into these leads', 4]); }
  // turn order: priority bracket first (your planned move; theirs: Fake Out if they carry it), then Speed inside a bracket
  // (Stall always moves last inside its bracket)
  const oPr = o => (o.moves || []).some(x => x && x.name === 'Fake Out') ? 3 : 0;
  const order = [...L, ...opp].map(x => { const me = L.includes(x), ln = me ? lines.find(l => l[0] === x) : null; return {x, s: speF(x), me, p: me ? (ln ? ln[3] || 0 : 0) : oPr(x), st: abilityOf(x) === 'Stall' ? 1 : 0}; })
    .sort((a, b) => b.p - a.p || a.st - b.st || b.s - a.s);
  const theirAct = o => { const d = danger.find(x => x.o === o); if (!d || !d.worst) return null; const fo = oPr(o) === 3;
    return fo ? ['Fake Out', ''] : [`${d.worst.h.mv.name} into ${d.worst.on.d}`, `up to ${dmgP(100 * d.worst.pct)}% of its HP, ${koShort(d.worst.h.r)}`]; }; /* one wording for both lines (audit Nov 15) */
  // the beats, in move order: who moves, their Speed and bracket, the action and one short why (all plain text)
  const beats = order.map(o => { const ln = o.me ? lines.find(l => l[0] === o.x) : null, th = o.me ? null : theirAct(o.x);
    return {x: o.x, me: o.me, speed: o.s, prio: o.p, act: ln ? ln[1] : th ? th[0] : oPr(o.x) === 3 ? 'Fake Out' : 'Unknown move', why: ln ? ln[2] : th ? th[1] : 'no damaging move found into your leads'}; });
  // a speed tie between the two sides in one bracket: either may move first
  beats.forEach((b, i) => { const n = beats[i + 1]; if (n && n.me !== b.me && n.prio === b.prio && n.speed === b.speed) b.why += `${b.why ? '; ' : ''}speed tie with ${n.x.d}: either can go first`; });
  // Fake Out's flinch (design review #1: flinched Pokémon still acted, two Fake Outs and Garchomp still attacked). Fake Out works on
  // turn one only; the target can't move this turn if it hasn't moved yet, unless Inner Focus, Shield Dust, Covert Cloak, a Ghost
  // type, or a priority blocker on its side (Armor Tail, Queenly Majesty, Dazzling; Psychic Terrain for grounded targets) stops it.
  // Your Fake Out aims at their biggest threat (above); theirs is assumed to aim at your lead that threatens them most (their likely
  // target, said as such), a second Fake Out at your other lead.
  const PRIO_BLOCK = ['Armor Tail', 'Queenly Majesty', 'Dazzling'], itemOf = x => x.item || (x._orig && x._orig.item) || '';
  const noFlinch = x => ['Inner Focus', 'Shield Dust'].includes(abilityOf(x)) || ((x.types || x.p.t || []).includes('Ghost')) || itemOf(x) === 'Covert Cloak';
  const blocked = (x, side) => side.some(y => PRIO_BLOCK.includes(abilityOf(y))) || (F.terrain === 'psychic' && grounded(x));
  const threatOf = m => { let v = 0; for (const o of opp) { const h = hitOn(m, memberMoves(m).moves, o); if (h) v = Math.max(v, h.r.max / h.r.hp); } return v; };
  const myByThreat = L.slice().sort((a, b) => threatOf(b) - threatOf(a)); let theirFO = 0;
  const flinched = new Map(), done = new Set();
  for (const b of beats) {
    if (flinched.has(b.x)) { const f = flinched.get(b.x); b.plan = b.act; b.act = 'Flinches'; b.flinch = f.sure ? 'sure' : 'likely';
      b.why = f.sure ? `${f.by}'s Fake Out hits it first: it can't move this turn` : f.tie ? `if ${f.by}'s Fake Out wins the speed tie, it can't move this turn. Planned: ${b.plan}` : `if ${f.by}'s Fake Out hits it first (their likely target), it can't move this turn. Planned: ${b.plan}`; done.add(b.x); continue; }
    if (/^Fake Out\b/.test(b.act)) {
      const t = b.me ? (danger[0] ? danger[0].o : null) : myByThreat[Math.min(theirFO++, myByThreat.length - 1)], side = b.me ? opp : L;
      if (!b.me && t) b.act = `Fake Out ${t.d}`;
      if (t && !done.has(t) && !flinched.has(t) && !noFlinch(t) && !blocked(t, side)) {
        const tb = beats.find(y => y.x === t), tie = tb && tb.prio === b.prio && tb.speed === b.speed; /* a speed tie: either may go first */
        flinched.set(t, {by: (b.me ? 'your ' : '') + b.x.d, sure: b.me && !tie, tie});
        if (!b.me) b.why = `if they have it: ${t.d} flinches and can't move this turn (their likely target). Protect blocks it`; }
      else if (t && !b.me) b.why = done.has(t) ? `${t.d} has already moved: no flinch` : `${t.d} can't be flinched this turn`;
      else if (t && b.me && (done.has(t) || noFlinch(t) || blocked(t, side))) b.why += `; ${t.d} ${done.has(t) ? 'moves first, so it won\'t flinch' : 'can\'t be flinched'}`; }
    done.add(b.x); }
  // a threat that can't act on turn one (your Fake Out stops it, or it uses its own Fake Out) is still a threat from turn two on
  const later = o => oPr(o) === 3 || (flinched.get(o) || {}).sure;
  const warn = danger.filter(x => x.worst && x.worst.pct >= .8).map(x => `${x.o.d}'s ${x.worst.h.mv.name} can KO ${x.worst.on.d}${later(x.o) ? ' from turn 2' : ''}`);
  return {leads: L, opp, beats, warn, field: F0, terrain: F.terrain};
}

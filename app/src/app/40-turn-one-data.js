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
  // the copy is the base form in full: its types and its own Ability (abilityOf falls back to the form's usual one), not a Mega (review, Nov 19)
  const baseOf = x => { const bp = baseP(x && x.p); return bp ? {...x, p: bp, d: bp.d, types: bp.t, ability: (() => { try { return metaAbility(bp) || ''; } catch (e) { return ''; } })(), mega: 0, _orig: x._orig || x} : x; };
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
  // priority blockers (review, Nov 19): Armor Tail, Queenly Majesty and Dazzling on ANY Pokémon of the target's side make priority
  // moves into that side fail (damage() only checks the target's own Ability), unless the user has Mold Breaker (Teravolt,
  // Turboblaze); Psychic Terrain blocks them into a grounded target whatever the Abilities. Such a move is left out, so the next
  // best is planned (for both sides' hits)
  const PRIO_BLOCK = ['Armor Tail', 'Queenly Majesty', 'Dazzling'], MOLD = ['Mold Breaker', 'Teravolt', 'Turboblaze'];
  const prioBlocked = (a, d) => { const side = L.includes(d) ? L : opp; return (!MOLD.includes(abilityOf(a)) && side.some(y => PRIO_BLOCK.includes(abilityOf(y)))) || (F.terrain === 'psychic' && grounded(d)); };
  const hitOn = (a, moves, d) => bestHitOn(a.p, prioBlocked(a, d) ? (moves || []).filter(mv => !mv || movePrio(mv, abilityOf(a), {terrain: F.terrain, grounded: grounded(a)}) <= 0) : moves, d.p, mineM(a), mineM(d), F);
  // speed in that field: Chlorophyll / Swift Swim / Sand Rush / Slush Rush double in their weather
  const speF = x => spe(x) * (typeof speedMul === 'function' ? speedMul(abilityOf(x), F.weather) : 1);
  // their threat to each of my leads: the hardest single hit
  const danger = opp.map(o => { let worst = null; for (const m of L) { const h = hitOn(o, o.moves || [], m); if (h && (!worst || h.r.max / h.r.hp > worst.pct)) worst = {pct: h.r.max / h.r.hp, h, on: m}; } return {o, worst}; })
    .sort((a, b) => (b.worst ? b.worst.pct : 0) - (a.worst ? a.worst.pct : 0));
  const fast = opp.filter(o => L.some(m => speF(o) > speF(m))).length;
  // Fake Out's rules (design review #1; Nov 19 review): it fails into a priority blocker on the target's side (Armor Tail, Queenly
  // Majesty, Dazzling) and against a grounded target in Psychic Terrain; it has no effect on a Ghost type unless the user has Scrappy;
  // Inner Focus, Shield Dust and Covert Cloak take the hit but don't flinch. Mold Breaker (Teravolt, Turboblaze) ignores the
  // Abilities. foFx: 'ok' (flinches), 'none' (fails / no effect), 'hit' (takes the hit, no flinch).
  const itemOf = x => x.item || (x._orig && x._orig.item) || '';
  const foFx = (u, t, tSide) => { const mold = MOLD.includes(abilityOf(u));
    if ((!mold && tSide.some(y => PRIO_BLOCK.includes(abilityOf(y)))) || (F.terrain === 'psychic' && grounded(t))) return 'none';
    if ((t.types || t.p.t || []).includes('Ghost') && abilityOf(u) !== 'Scrappy') return 'none';
    if ((!mold && ['Inner Focus', 'Shield Dust'].includes(abilityOf(t))) || itemOf(t) === 'Covert Cloak') return 'hit';
    return 'ok'; };
  // their Fake Out is only planned when it can flinch one of your leads (second review, Nov 19: with your Farigiraf's Armor Tail up
  // they just attack, so their turn-one KO stays a turn-one KO)
  // Their Fake Out targets are decided up front, fastest first: each aims at your lead that threatens them most among those it can
  // flinch and no other Fake Out has taken; one with no such target attacks instead.
  const threatOf = m => { let v = 0; for (const o of opp) { const h = hitOn(m, memberMoves(m).moves, o); if (h) v = Math.max(v, h.r.max / h.r.hp); } return v; };
  const myByThreat = L.slice().sort((a, b) => threatOf(b) - threatOf(a)), theirFOT = new Map();
  for (const o of opp.filter(o => (o.moves || []).some(x => x && x.name === 'Fake Out')).sort((a, b) => speF(b) - speF(a))) {
    const t = myByThreat.find(t => ![...theirFOT.values()].includes(t) && foFx(o, t, L) === 'ok'); if (t) theirFOT.set(o, t); }
  // their bracket: Fake Out +3 when they use it; otherwise their likely attack's own priority (Extreme Speed +2, Sucker Punch +1,
  // Grassy Glide +1 in Grassy Terrain, Gale Wings…), as yours is (review, Nov 19: it was 0 for every attack)
  const oPr = o => { if (theirFOT.has(o)) return 3; const d = danger.find(x => x.o === o); return d && d.worst ? movePrio(d.worst.h.mv, abilityOf(o), {terrain: F.terrain, grounded: grounded(o)}) : 0; };
  const lines = [], used = new Set(), mvOf = (m, n) => memberMoves(m).moves.find(x => x && x.name === n) || mvByName.get(n);
  // each action carries its priority bracket (Fake Out +3, Prankster Tailwind +1, Trick Room −7…) for the turn order below
  const pr = (m, n) => movePrio(mvOf(m, n), m.ability, {terrain: F.terrain, grounded: grounded(m)});
  for (const m of L) { const mv = names(m), partner = L.find(x => x !== m);
    /* aim only where it flinches, and never at a faster Fake Out user that will already have moved (second review, Nov 19) */
    const fd = mv.has('Fake Out') && !used.has('fake') ? danger.find(d => foFx(m, d.o, opp) === 'ok' && !(theirFOT.has(d.o) && speF(d.o) > speF(m))) : null;
    if (fd) { used.add('fake'); lines.push([m, `Fake Out ${fd.o.d}`, fd.worst ? `its ${fd.worst.h.mv.name} does up to ${dmgP(100 * fd.worst.pct)}% of ${fd.worst.on.d}'s HP (${koShort(fd.worst.h.r)})` : fd === danger[0] ? 'their biggest threat' : 'it can be flinched', pr(m, 'Fake Out'), fd.o]); continue; }
    if (mv.has('Tailwind') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Tailwind', `${fast === 1 ? '1 of their leads outspeeds' : fast + ' of their leads outspeed'} your side`, pr(m, 'Tailwind')]); continue; }
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
  // Tailwind re-orders the rest of the turn (review, Nov 19): from Gen 8 on (Showdown too), the queue is re-sorted by current Speed
  // after every action, so once a side's Tailwind is up, its partner that hasn't moved yet moves at double Speed this same turn.
  // Pokémon Champions follows Gen 9's rules; this re-sort is assumed there, not confirmed in Champions. (Trick Room: −7, so it only
  // flips the order from next turn.) Ties are found as each mover is picked, at the Speed it moves with.
  const cand = [...L, ...opp].map(x => { const me = L.includes(x), ln = me ? lines.find(l => l[0] === x) : null; return {x, s: speF(x), me, p: me ? (ln ? ln[3] || 0 : 0) : oPr(x), st: abilityOf(x) === 'Stall' ? 1 : 0, act: me && ln ? ln[1] : ''}; });
  const twUp = {true: false, false: false}, order = [];
  const cmp = (a, b) => b.p - a.p || a.st - b.st || b.es - a.es;
  while (cand.length) { cand.forEach(c => { c.tw = twUp[c.me]; c.es = c.s * (c.tw ? 2 : 1); }); cand.sort(cmp); const c = cand.shift();
    const n = cand.find(y => y.me !== c.me && y.p === c.p && y.st === c.st && y.es === c.es); if (n) c.tie = n.x;
    order.push(c); if (c.act === 'Tailwind') twUp[c.me] = true; }
  const theirAct = o => { const d = danger.find(x => x.o === o); if (!d || !d.worst) return null; const fo = theirFOT.has(o);
    return fo ? ['Fake Out', ''] : [`${d.worst.h.mv.name} into ${d.worst.on.d}`, `up to ${dmgP(100 * d.worst.pct)}% of its HP, ${koShort(d.worst.h.r)}`]; }; /* one wording for both lines (audit Nov 15) */
  // the beats, in move order: who moves, their Speed and bracket, the action and one short why (all plain text)
  const beats = order.map(o => { const ln = o.me ? lines.find(l => l[0] === o.x) : null, th = o.me ? null : theirAct(o.x);
    const why = ln ? ln[2] : th ? th[1] : 'no damaging move found into your leads';
    return {x: o.x, me: o.me, speed: o.es, prio: o.p, act: ln ? ln[1] : th ? th[0] : theirFOT.has(o.x) ? 'Fake Out' : 'Unknown move', ...(o.tw ? {tw: 1} : {}), _tie: o.tie,
      why: o.tw ? `${why}${why ? '; ' : ''}moves at double Speed: ${o.me ? 'your' : 'their'} Tailwind is already up (Gen 9 turn order, assumed for Champions)` : why}; });
  // a speed tie between the two sides in one bracket: either may move first
  beats.forEach(b => { const n = b._tie ? beats.find(y => y.x === b._tie) : null; delete b._tie; if (n && !(/^Fake Out\b/.test(b.act) && /^Fake Out\b/.test(n.act))) b.why += `${b.why ? '; ' : ''}speed tie with ${n.x.d}: either can go first`; });
  // Fake Out's flinch (design review #1: flinched Pokémon still acted, two Fake Outs and Garchomp still attacked). Fake Out works on
  // turn one only; the target can't move this turn if it hasn't moved yet, unless Inner Focus, Shield Dust, Covert Cloak, a Ghost
  // type, or a priority blocker on its side (Armor Tail, Queenly Majesty, Dazzling; Psychic Terrain for grounded targets) stops it.
  // Your Fake Out aims at their biggest threat (above); theirs is assumed to aim at your lead that threatens them most (their likely
  // target, said as such), a second Fake Out at your other lead.
  const flinched = new Map(), done = new Set();
  // Only a sure flinch (your Fake Out, moving first, no speed tie) replaces a move with 'Flinches'; a flinch that depends on their
  // choice or a speed tie keeps the planned move and says so, so the plan (and Home's plan board) still shows what to click.
  const tieOf = (a, b) => a && b && a.prio === b.prio && a.speed === b.speed;
  const mayNote = (tb, f) => { tb.flinch = 'likely'; tb.why += `${tb.why ? '; ' : ''}${f.tie ? `if ${f.by}'s Fake Out wins the speed tie` : `if ${f.by}'s Fake Out hits it first (their likely target)`}, it can't move this turn`; };
  for (const b of beats) {
    if (flinched.has(b.x)) { const f = flinched.get(b.x);
      if (f.sure) { b.plan = b.act; b.act = 'Flinches'; b.flinch = 'sure'; b.why = `${f.by}'s Fake Out hits it first: it can't move this turn`; done.add(b.x); continue; }
      mayNote(b, f); }
    if (/^Fake Out\b/.test(b.act)) {
      const side = b.me ? opp : L, ln = b.me ? lines.find(l => l[0] === b.x) : null;
      const t = b.me ? (ln && ln[4]) || null : theirFOT.get(b.x) || null;
      if (!b.me && t) b.act = `Fake Out ${t.d}`;
      const fx = t ? foFx(b.x, t, side) : 'none', tb = t ? beats.find(y => y.x === t) : null, tie = tieOf(tb, b), by = (b.me ? 'your ' : '') + b.x.d;
      if (t && fx === 'ok' && (!done.has(t) || tie)) {
        const f = {by, sure: b.me && !tie && b.flinch !== 'likely' && ![...theirFOT].some(([o, u]) => u === b.x && speF(o) >= speF(b.x)), tie}; /* not sure when your Fake Out user may be flinched first (their Fake Out at it is faster or tied) */ if (done.has(t)) mayNote(tb, f); else flinched.set(t, f);
        if (!b.me) b.why = `if they have it: ${t.d} flinches and can't move this turn (their likely target)${tie ? ', if their Fake Out wins the speed tie' : ''}. Protect blocks it${b.flinch === 'likely' && b.why ? '; ' + b.why : ''}`;
        else if (tie) b.why += `${b.why ? '; ' : ''}speed tie with their ${t.d}: it flinches only if your Fake Out goes first`; }
      else if (t) { const why = fx === 'none' ? `Fake Out has no effect on ${t.d} here` : fx === 'hit' ? `${t.d} takes the hit but can't flinch` : `${t.d} has already moved: no flinch`;
        b.why = b.me ? `${b.why}${b.why ? '; ' : ''}${why}` : why; } }
    done.add(b.x); }
  // a threat that can't act on turn one (your Fake Out stops it, or it uses its own Fake Out) is still a threat from turn two on
  const later = o => theirFOT.has(o) || (flinched.get(o) || {}).sure;
  const warn = danger.filter(x => x.worst && x.worst.pct >= .8).map(x => `${x.o.d}'s ${x.worst.h.mv.name} can KO ${x.worst.on.d}${later(x.o) ? ' from turn 2' : ''}`);
  return {leads: L, opp, beats, warn, field: F0, terrain: F.terrain};
}

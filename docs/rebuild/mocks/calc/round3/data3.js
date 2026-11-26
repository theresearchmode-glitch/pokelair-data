// mock-ups round 2 (Sim, Nov 14, 12:3x AM: "uninspired, I want something creative with wow"): real numbers from today's calculator.
// Picks a matchup on a knife edge (some rolls KO, some don't) from your six against the top 30, so the pictures show the hard case.
(() => { const ms = members(), myF = sideField(ms), thr = metaThreats(30).map(x => x.p || x).filter(p => p && p.st);
  const best = thr.map(th => { let b = null; for (const m of ms) { const h = bestHitOn(m.p, m.moves, th, m, null, myF); if (h && (!b || h.r.max / h.r.hp > b.h.r.max / b.h.r.hp)) b = {m, h}; } return b && {n: th.n, a: b.m.p.n, mv: b.h.mv.name, p: 100 * b.h.r.max / b.h.r.hp, lo: 100 * b.h.r.min / b.h.r.hp}; });
  let edge = null; for (const m of ms) for (const th of thr) { if (ms.some(x => x.p.n === th.n)) continue; const h = bestHitOn(m.p, m.moves, th, m, null, myF); if (h && h.r.min < h.r.hp && h.r.max >= h.r.hp && !h.mv.spread) { edge = {a: m.p.n, d: th.n, mv: h.mv.name}; break; } if (edge) break; }
  edge = edge || {a: ms[0].p.n, d: thr[0].n, mv: null};
  dc.a = edge.a; dc.d = edge.d; const A = dcSide('atk', dc.a), D = dcSide('def', dc.d), mvs = dcMoves(A.p); dc.mv = edge.mv || mvs.pop[0].name; const mv = mvByName.get(dc.mv);
  dc.weather = (typeof sideField === 'function' ? sideField(ms).weather : '') || '';
  const ord = dcOrder(A, D, mv, dc.weather, dc.terrain), ctx = dcContext(A, ms);
  const opt = {atk: A, def: D, move: mv, spread: !!mv.spread, weather: dc.weather, terrain: dc.terrain, atkLast: !!ord.last, plusAlly: ctx.plusAlly, party: ctx.party};
  const r = damage(opt), bs = bulkToSurvive(opt), notes = calcNotes(A, D, mv, r, ord, ctx, dc.weather, dc.terrain), nc = notCounted(A, D, mv, r);
  return {A: {n: A.p.n, d: V2.disp(A.p.n), nat: A.nat, item: A.item, ab: A.ability, sp: mv.cat === 2 ? (A.spS ?? A.sp) : (A.spA ?? A.sp), boost: A.boost, src: A.src, t: A.p.t},
    D: {n: D.p.n, d: V2.disp(D.p.n), nat: D.nat, item: D.item, ab: D.ability, hp: D.hpSp, df: D.defSp, sd: D.spdSp, boost: D.boost, src: D.src, t: D.p.t},
    mv: mv.name, mtype: mv.type, cat: mv.cat, spread: !!mv.spread, pop: mvs.pop.map(m => [m.name, m.type]), weather: dc.weather, spd: {a: ord.a, d: ord.d, last: ord.last, tie: ord.tie, pr: ord.pr}, spd: {a: ord.a, d: ord.d, last: ord.last, tie: ord.tie, pr: ord.pr},
    r: {min: r.min, max: r.max, hp: r.hp, lo: 100 * r.min / r.hp, hi: 100 * r.max / r.hp, ko: koText(r), eff: r.eff, type: r.type, rolls: r.rolls || []},
    bulk: bs, notes, nc, mine: ms.map(m => m.p.n), best}; })()

// runs inside the page (window.__ev): real numbers from today's calculator for the mock-ups
(() => { const ms = members(); dc.a = ms[0].p.n; let t = metaThreats(30).map(x => x.p || x); dc.d = (t.find(p => !ms.some(m => m.p.n === p.n)) || byName.get('Incineroar')).n;
  const A = dcSide('atk', dc.a), D = dcSide('def', dc.d), mvs = dcMoves(A.p); dc.mv = (mvs.pop.filter(m => m && (+m.bp || 0) > 0 && m.name !== 'Fake Out')[0] || mvs.pop[0]).name; const mv = mvByName.get(dc.mv);
  if (!dc.wSet) dc.weather = (typeof sideField === 'function' ? sideField(ms).weather : '') || '';
  const ord = dcOrder(A, D, mv, dc.weather, dc.terrain), ctx = dcContext(A, ms);
  const opt = {atk: A, def: D, move: mv, spread: !!mv.spread, weather: dc.weather, terrain: dc.terrain, atkLast: !!ord.last, plusAlly: ctx.plusAlly, party: ctx.party};
  const r = damage(opt), bs = bulkToSurvive(opt), notes = calcNotes(A, D, mv, r, ord, ctx, dc.weather, dc.terrain), nc = notCounted(A, D, mv, r);
  const myF = sideField(ms), thr = t.filter(p => p && p.st).slice(0, 30);
  const grid = ms.map(m => thr.map(th => { const b = bestHitOn(m.p, m.moves, th, m, null, myF); return b ? {p: 100 * b.r.max / b.r.hp, lo: 100 * b.r.min / b.r.hp, mv: b.mv.name} : null; }));
  return {A: {n: A.p.n, d: V2.disp(A.p.n), nat: A.nat, item: A.item, ab: A.ability, sp: mv.cat === 2 ? (A.spS ?? A.sp) : (A.spA ?? A.sp), cat: mv.cat, boost: A.boost, abs: A.p.a, src: A.src},
    D: {n: D.p.n, d: V2.disp(D.p.n), nat: D.nat, item: D.item, ab: D.ability, hp: D.hpSp, df: D.defSp, sd: D.spdSp, boost: D.boost, abs: D.p.a, src: D.src},
    mv: mv.name, mtype: mv.type, spread: !!mv.spread, pop: mvs.pop.map(m => m.name), restN: mvs.rest.length, weather: dc.weather,
    r: {min: r.min, max: r.max, hp: r.hp, lo: 100 * r.min / r.hp, hi: 100 * r.max / r.hp, ko: koText(r), eff: r.eff, type: r.type, hits: r.hits},
    bulk: bs, notes, nc, mine: ms.map(m => m.p.n), thr: thr.map(p => p.n), grid}; })()

// ---------- meta threats: can the team handle what it will actually face? ----------
// Threats are the most-used Pokémon in this format, each with its real ability and most-used moves.
// A threat is answered when one of yours hits it super effectively and isn't hit super effectively back
// (matchup score from headToHead: +1 or better), and covered twice when a second Pokémon can do it too.
let threatCache = {key: null, list: null};
function metaThreats(n = 30) {
  const key = S.format + '|' + metaVersion + '|' + ui.metaSrc;
  if (threatCache.key === key) return threatCache.list;
  const ranked = ROSTER.map(p => ({p, u: U(p)})).filter(x => x.u > 0).sort((a, b) => b.u - a.u).slice(0, n);
  const tot = ranked.reduce((a, x) => a + x.u, 0) || 1;
  const list = ranked.map(x => ({...oppMember(x.p), w: x.u * ranked.length / tot}));  // average weight 1
  const ctx = teamContext([]);
  list.forEach(o => { o._en = attackEntries(o, o.moves.some(isCoverage) ? o.moves : [], ctx); });
  threatCache = {key, list}; return list;
}
// One member against every threat, cached: the same Pokémon with the same moves and field gives the same answer.
let vsCache = new Map();
function vsThreats(m, ctx, useA, th) {
  const mv = (m._mv || memberMoves(m).moves).map(x => x.name).join(',');
  const key = [threatCache.key, m.p.n, useA ? m.ability : '', mv, ctx.weather, ctx.terrain].join('|');
  let r = vsCache.get(key); if (r) return r;
  const en = attackEntries({...m, ability: useA ? m.ability : null}, m._mv || memberMoves(m).moves, ctx);
  r = th.map(o => { const off = bestHit(en, o.types, useA ? o.ability : null), def = bestHit(o._en, m.types, useA ? m.ability : null);
    let v = fScore(off ? off.x : 1) - fScore(def ? def.x : 1);
    if (m.p.sp != null && o.p.sp != null) v += m.p.sp > o.p.sp + 10 ? .25 : m.p.sp + 10 < o.p.sp ? -.25 : 0;
    return {v, off, def}; });
  if (vsCache.size > 4000) vsCache.clear(); vsCache.set(key, r); return r;
}
// Returns {pen, rows:[{o, best, second, hits, who}]}. Lower pen is better.
function threatReport(team, useA = true) {
  const th = metaThreats(); if (!team.length || !th.length) return {pen: 0, rows: []};
  const ctx = teamContext(useA ? team : []);
  const per = team.map(m => vsThreats(m, ctx, useA, th));
  let pen = 0; const rows = [];
  for (let j = 0; j < th.length; j++) { const o = th[j];
    let best = -9, second = -9, hits = 0; const who = [];
    for (let i = 0; i < team.length; i++) { const x = per[i][j]; if (x.v > best) { second = best; best = x.v; } else if (x.v > second) second = x.v;
      if (x.def && x.def.x >= 2) hits++; if (x.v >= 1) who.push(team[i]); }
    if (second === -9) second = -2;
    const p = o.w * (Math.max(0, 1 - best) * 14 + Math.max(0, 1 - second) * 4 + Math.max(0, hits - 2) * 5);
    pen += p; rows.push({o, best, second, hits, who, pen: p});
  }
  return {pen, rows: rows.sort((a, b) => b.pen - a.pen)};
}


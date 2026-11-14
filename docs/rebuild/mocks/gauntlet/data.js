// Test Run mock-ups (Nov 14): the real rows from today's shared logic (38-gauntlet-data.js), worked out exactly as today's
// renderGauntlet does: your six against the top tournament teams, least prepared first. Nothing is saved.
(() => { const ms = members(); if (ms.length < 4) return {err: 'team ' + ms.length}; const T = gauntletTeams(); if (!T.length) return {err: 'no teams'};
  const rows = T.map((t, ix) => { const names = t.mons.filter(n => byName.get(n)); const theirs = names.map(n => byName.get(n)).map(oppMember); if (theirs.length < 4) return null;
    const g = gauntletScore(ms, theirs, true); let pr = null; try { pr = gauntletPrep(ms, names); } catch (e) { pr = null; }
    const un = pr ? pr.you.map((r, j) => r.level === 0 ? j : -1).filter(j => j >= 0) : g.loose;
    return {ix, who: t.who, ev: t.ev || '', names: theirs.map(o => o.p.n), disp: theirs.map(o => o.d), un, yN: pr ? pr.yN : null, tN: pr ? pr.tN : null, n: pr ? pr.n : theirs.length,
      lead: g.r.lead.map(i => ms[i].p.n), back: g.r.back.map(i => ms[i].p.n),
      you: pr ? pr.you.map(r => ({n: r.t.n, d: r.t.d, lv: r.level, label: r.label, ev: THR.evidence(r)})) : [],
      them: pr ? pr.them.map(r => ({n: r.t.n, d: r.t.d, lv: r.level, label: r.label, ev: THR.evidence(r)})) : []}; }).filter(Boolean);
  const edge = x => x.yN == null ? 0 : x.yN - x.tN; rows.sort((a, b) => edge(a) - edge(b));
  return {mine: ms.map(m => m.p.n), mineD: ms.map(m => m.d), rows, more: rows.filter(x => edge(x) >= 2).length, less: rows.filter(x => edge(x) <= -2).length, edge: rows.map(edge)}; })()

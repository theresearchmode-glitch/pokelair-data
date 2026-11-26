// Usage mock-ups (Nov 14): real rows from today's shared logic (29-fix-planner.js metaDoc, trendFor; setFor), Online tournaments.
(() => { ui.metaSrc = 'tour'; const d = metaDoc(); if (!d) return {err: 'no data'};
  const rows = (d.top || []).map(t0 => { const p = byName.get(t0.n), tr = (() => { try { return trendFor(t0.n, t0.r); } catch (e) { return null; } })();
    return {r: t0.r, n: t0.n, d: p ? p.d : t0.n, t: p ? p.t : [], u: +t0.u || 0, teams: t0.teams || null, w: t0.w != null ? +t0.w : null, ab: t0.ab || [], it: t0.it || [], mv: t0.mv || [], na: t0.na || [], tm: t0.tm || [],
      tr: tr ? {txt: tr.txt, cls: tr.cls} : null, mine: members().some(m => m.p.n === t0.n)}; });
  return {source: d.source, battles: d.battles || null, rows, max: Math.max(...rows.map(x => x.u))}; })()

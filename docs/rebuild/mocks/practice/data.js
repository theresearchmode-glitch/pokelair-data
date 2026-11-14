// Team Preview Practice mock-ups (Nov 14): a real round from today's shared logic (63-practice-data.js) with your six. The pick is the
// strong players' four with one swapped (so the reveal shows a near miss), leads = the first two of it. Nothing is saved (score untouched).
(() => { const P = META.practice; if (!P) return null; const save = LS.get('np.practice', null);
  pr.recent = []; const rnd = Math.random; Math.random = () => 0; prStart('mine'); Math.random = rnd; const o = P.opp[pr.oi], t = prTarget();
  const rest = pr.six.filter(n => !t || !t.four.includes(n)), pick = t ? [...t.four.slice(0, 3), rest[0] || t.four[3]] : pr.six.slice(0, 4);
  pr.pick = pick.slice(); pr.lead = pick.slice(0, 2);
  const rates = pr.six.map(n => { const c = o.mons[prBase(n)]; return {n, g: c ? c[0] : 0, b: c ? prPc(c[1], c[0]) : 0, l: c ? prPc(c[2], c[0]) : 0}; });
  const m4 = t ? prSame(pick, t.four) : false, ml = t ? prSame(pr.lead, t.lead) : false; LS.set('np.practice', save);
  return {opp: o.six, n: o.n, six: pr.six.slice(), pick, lead: pr.lead.slice(), target: t, rates, m4, ml, minR: P.minR, from: P.from, to: P.to, score: prScore()}; })()

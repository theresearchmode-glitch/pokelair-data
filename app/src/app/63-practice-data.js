// ---------- Team preview practice (Nov) ----------
// A real opposing six from the Showdown ladder; you pick four to bring and two to lead, then see what strong players chose.
// Data: meta/practice (out/practice.json from practice.mjs): opposing sixes with, for every Pokémon strong players (rated
// minR+) had against that six or one 5 of 6 the same, how often they brought and led it; and rounds (real games) with what
// that player brought and led, and what players with a similar six did against a similar six. Facts about choices, never
// a chance of winning. The score (matching the strong players' four) is kept in this browser only.
// cleanPractice: moved to 05-data-clean.js (R4, Nov 11; shared with the rebuild)
const prBase = n => String(n || '').replace(/-Mega.*$/, '');
const prSame = (a, b) => a.length === b.length && a.every(x => b.some(y => prBase(y) === prBase(x)));
let pr = {step: 'start', mode: null, ri: -1, oi: -1, six: [], pick: [], lead: [], recent: []};
// the score: matching the strong players' four, kept per viewer in this browser
function prScore() { const s = LS.get('np.practice', null); return s && typeof s === 'object' ? {streak: +s.streak || 0, best: +s.best || 0, played: +s.played || 0, matched: +s.matched || 0} : {streak: 0, best: 0, played: 0, matched: 0}; }
function prScoreSave(s) { LS.set('np.practice', s); }
// how many of a six have at least 5 games against this opposing team
function prKnown(o, six) { return six.filter(n => (o.mons[prBase(n)] || [0])[0] >= 5).length; }
function prPickRandom(arr) { const fresh = arr.filter(x => !pr.recent.includes(x)), pool = fresh.length ? fresh : arr; return pool[Math.floor(Math.random() * pool.length)]; }
function prStart(mode) { const P = META.practice; if (!P) return; pr.mode = mode; pr.pick = []; pr.lead = []; pr.step = 'pick';
  if (mode === 'mine') { const mine = members().map(m => m.p.n); if (mine.length !== 6) { pr.mode = 'real'; return prStart('real'); }
    const all = P.opp.map((o, i) => o ? i : -1).filter(i => i >= 0), ok = all.filter(i => prKnown(P.opp[i], mine) >= 4);
    pr.oi = prPickRandom(ok.length ? ok : all); pr.ri = -1; pr.six = mine; pr.recent = [pr.oi, ...pr.recent].slice(0, 25); }
  else { pr.ri = prPickRandom(P.rounds.map((r, i) => i)); const r = P.rounds[pr.ri]; pr.oi = r.o; pr.six = r.mine.slice(); pr.recent = [pr.ri, ...pr.recent].slice(0, 40); } }
// what strong players chose, as the four (and two leads) to match
function prTarget() { const P = META.practice; if (!P) return null; const o = P.opp[pr.oi]; if (!o) return null;
  if (pr.mode === 'real') { const r = P.rounds[pr.ri]; return r ? {kind: 'pair', four: r.pair.four, lead: r.pair.lead, n: r.pair.n, k: r.pair.fourN, kl: r.pair.leadN} : null; }
  const rate = (n, j) => { const c = o.mons[prBase(n)]; return c && c[0] ? c[j] / c[0] : -1; };
  const rows = pr.six.filter(n => (o.mons[prBase(n)] || [0])[0] >= 5).sort((a, b) => rate(b, 1) - rate(a, 1) || (o.mons[prBase(b)][0] - o.mons[prBase(a)][0]));
  if (rows.length < 4) return null; const four = rows.slice(0, 4);
  return {kind: 'rates', four, lead: four.slice().sort((a, b) => rate(b, 2) - rate(a, 2)).slice(0, 2)}; }
function prReveal() { const t = prTarget(), s = prScore(); pr.step = 'reveal'; pr.result = null;
  if (t) { const m4 = prSame(pr.pick, t.four), ml = prSame(pr.lead, t.lead); s.played++; if (m4) { s.matched++; s.streak++; s.best = Math.max(s.best, s.streak); } else s.streak = 0; prScoreSave(s); pr.result = {m4, ml}; } }
const prN = n => (+n || 0).toLocaleString('en-US'), prPc = (a, b) => b ? Math.round(100 * a / b) : 0;
const prDay = t => { try { return new Date(t * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) { return ''; } };

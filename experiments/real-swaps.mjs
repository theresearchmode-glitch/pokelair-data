// d5-sugg (Nov 9, Sim: find what real swaps helped mid-strength teams). Real one-swap pairs: two real sixes (base forms) that
// share 5 Pokémon and differ in one. Pokémon values + player skill learned on one half of the tournaments (additive, ridge);
// the pair's real result is judged only on the OTHER half (skill-adjusted: each game counts result − chance from the players'
// skills). Question: does the learned value gap (in − out) predict which six really did better, and does that hold for strong
// shared fives as well as weak ones? Both halves swapped and pooled. Each six needs 10+ games in the judged half.
// Usage: node experiments/real-swaps.mjs [out.json]
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8'));
const base = n => n.replace(/-Mega.*$/, ''), teams = MT.teams.map(k => k.split('|')), names = [...new Set(teams.flat())], idx = new Map(names.map((n, i) => [n, i])), T = teams.map(t => t.map(n => idx.get(n)));
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1]), nM = names.length, nP = MT.players, sig = x => 1 / (1 + Math.exp(-x));
function fit(gs) { const w = new Float64Array(nM), s = new Float64Array(nP), mw = new Float64Array(nM), vw = new Float64Array(nM), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= 300; t++) { const gw = new Float64Array(nM), gk = new Float64Array(nP);
    for (const g of gs) { let e = s[g[4]] - s[g[5]]; for (const i of T[g[0]]) e += w[i]; for (const i of T[g[1]]) e -= w[i]; const d = sig(e) - g[2]; for (const i of T[g[0]]) gw[i] += d; for (const i of T[g[1]]) gw[i] -= d; gk[g[4]] += d; gk[g[5]] -= d; }
    const n = gs.length, st = (p, gr, m, v, L) => { for (let j = 0; j < p.length; j++) { if (!gr[j] && !p[j]) continue; const q = gr[j] / n + L * p[j] / n; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } };
    st(w, gw, mw, vw, 2); st(s, gk, ms, vs, 1); } return {w, s}; }
const out = [];
for (const h of [0, 1]) { const A = G.filter(g => g[3] % 2 === h), B = G.filter(g => g[3] % 2 !== h); console.error('fit half', h); const {w, s} = fit(A);
  // judged half: per six (base-form key) games and skill-adjusted result
  const six = new Map(); for (const g of B) for (const [t, y, a, b] of [[g[0], g[2], g[4], g[5]], [g[1], 1 - g[2], g[5], g[4]]]) { const k = [...new Set(teams[t].map(base))].sort().join('|'); const o = six.get(k) || {n: 0, adj: 0, raw: 0, mon: teams[t]}; o.n++; o.raw += y; o.adj += y - sig(s[a] - s[b]); six.set(k, o); }
  const S = [...six.entries()].filter(([k, o]) => o.n >= 10 && k.split('|').length === 6), byCore = new Map();
  for (const [k, o] of S) { const b = k.split('|'); for (let i = 0; i < 6; i++) { const core = b.filter((_, j) => j !== i).join('|'); (byCore.get(core) || byCore.set(core, []).get(core)).push({k, o, x: b[i]}); } }
  const wb = n => { const v = names.filter(m => base(m) === n).map(m => w[idx.get(m)]); return v.length ? Math.max(...v) : 0; }; // base form: its best form (a Mega if one is run)
  for (const [core, L] of byCore) { if (L.length < 2) continue; const cs = core.split('|').reduce((a, n) => a + wb(n), 0);
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const P = L[i], Q = L[j], pred = wb(Q.x) - wb(P.x), real = Q.o.adj / Q.o.n - P.o.adj / P.o.n, nn = Math.min(P.o.n, Q.o.n);
      out.push({core, cs, a: P.x, b: Q.x, pred, real, n: nn, h}); } } }
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(out));
const qs = out.map(o => o.cs).sort((a, b) => a - b), t1 = qs[Math.floor(qs.length / 3)], t2 = qs[Math.floor(2 * qs.length / 3)];
const evalSet = (L, lab) => { const M = L.filter(o => Math.abs(o.pred) > 1e-9); let agree = 0, wsum = 0; for (const o of M) { const wt = o.n; wsum += wt; if ((o.pred > 0) === (o.real > 0)) agree += wt; }
  // weighted correlation of predicted vs real
  const W = M.reduce((a, o) => a + o.n, 0), mp = M.reduce((a, o) => a + o.n * o.pred, 0) / W, mr = M.reduce((a, o) => a + o.n * o.real, 0) / W;
  let cxy = 0, cxx = 0, cyy = 0; for (const o of M) { cxy += o.n * (o.pred - mp) * (o.real - mr); cxx += o.n * (o.pred - mp) ** 2; cyy += o.n * (o.real - mr) ** 2; }
  let s = 3; const bs = []; for (let r = 0; r < 500; r++) { let a = 0, ws = 0; for (let k = 0; k < M.length; k++) { s = (s * 16807) % 2147483647; const o = M[s % M.length]; ws += o.n; if ((o.pred > 0) === (o.real > 0)) a += o.n; } bs.push(a / ws); } bs.sort((x, y) => x - y);
  console.log(`${lab}: ${M.length} real swap pairs · value gap picks the better six ${(agree / wsum * 100).toFixed(1)}% (95% ${(bs[12] * 100).toFixed(1)} to ${(bs[487] * 100).toFixed(1)}) · correlation ${(cxy / Math.sqrt(cxx * cyy)).toFixed(3)}`); };
console.log(`# Real one-swap pairs judged on games the values never saw (weighted by the smaller six's games)`);
evalSet(out, 'all'); evalSet(out.filter(o => o.cs < t1), 'weakest third of shared fives'); evalSet(out.filter(o => o.cs >= t1 && o.cs < t2), 'middle third'); evalSet(out.filter(o => o.cs >= t2), 'strongest third');

import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8'));
const base = n => n.replace(/-Mega.*$/, ''), teams = MT.teams.map(k => k.split('|')), names = [...new Set(teams.flat())], idx = new Map(names.map((n, i) => [n, i])), T = teams.map(t => t.map(n => idx.get(n)));
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1]), nM = names.length, nP = MT.players, sig = x => 1 / (1 + Math.exp(-x));
function fit(gs) { const w = new Float64Array(nM), s = new Float64Array(nP), mw = new Float64Array(nM), vw = new Float64Array(nM), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= 300; t++) { const gw = new Float64Array(nM), gk = new Float64Array(nP);
    for (const g of gs) { let e = s[g[4]] - s[g[5]]; for (const i of T[g[0]]) e += w[i]; for (const i of T[g[1]]) e -= w[i]; const d = sig(e) - g[2]; for (const i of T[g[0]]) gw[i] += d; for (const i of T[g[1]]) gw[i] -= d; gk[g[4]] += d; gk[g[5]] -= d; }
    const n = gs.length, st = (p, gr, m, v, L) => { for (let j = 0; j < p.length; j++) { if (!gr[j] && !p[j]) continue; const q = gr[j] / n + L * p[j] / n; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } };
    st(w, gw, mw, vw, 2); st(s, gk, ms, vs, 1); } return {w, s}; }
// f3-lanes (Nov 10, Part 3 of the focus plan): which evidence should back a "swap" suggestion? Same real one-swap pairs as
// real-swaps.mjs (two real sixes sharing 5 Pokémon, base forms), values and skill fitted on one half of the tournaments, the pair
// judged on the OTHER half (skill-adjusted). Three ways to pick the better six, all from the training half only:
//   model  = the fitted Pokémon value gap (as real-swaps.mjs);
//   record = the two sixes' own skill-adjusted training-half records, shrunk toward 0 by K pseudo-games (a six with few games says little);
//   both   = model + record.
// Then the promise check: for the pick, the gap it promises (points of win chance) vs the real gap on the judged half, as a
// least-squares slope (1.0 = honest, 0.4 = promises 2.5x too much). Can't see: sets, spreads, teams with no real neighbours.
// Usage: node experiments/lane-test.mjs [K=40]
const K = +(process.argv[2] || 40), out = [];
for (const h of [0, 1]) { const A = G.filter(g => g[3] % 2 === h), B = G.filter(g => g[3] % 2 !== h); console.error('fit half', h); const {w, s} = fit(A);
  const key = t => [...new Set(teams[t].map(base))].sort().join('|');
  const rec = (gs) => { const m = new Map(); for (const g of gs) for (const [t, y, a, b] of [[g[0], g[2], g[4], g[5]], [g[1], 1 - g[2], g[5], g[4]]]) { const k = key(t); const o = m.get(k) || {n: 0, adj: 0}; o.n++; o.adj += y - sig(s[a] - s[b]); m.set(k, o); } return m; };
  const tr = rec(A), ju = rec(B);
  const S = [...ju.entries()].filter(([k, o]) => o.n >= 10 && k.split('|').length === 6), byCore = new Map();
  for (const [k, o] of S) { const b = k.split('|'); for (let i = 0; i < 6; i++) { const core = b.filter((_, j) => j !== i).join('|'); (byCore.get(core) || byCore.set(core, []).get(core)).push({k, o, x: b[i]}); } }
  const wb = n => { const v = names.filter(m => base(m) === n).map(m => w[idx.get(m)]); return v.length ? Math.max(...v) : 0; };
  const shr = k => { const o = tr.get(k); return o ? o.adj / (o.n + K) : 0; }, trn = k => (tr.get(k) || {n: 0}).n;
  for (const [core, L] of byCore) { if (L.length < 2) continue;
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const P = L[i], Q = L[j];
      // model gap in win-chance points at an even game: logit gap -> about 25 points per logit unit near 50%
      const model = (wb(Q.x) - wb(P.x)) * 25, record = (shr(Q.k) - shr(P.k)) * 100, real = (Q.o.adj / Q.o.n - P.o.adj / P.o.n) * 100;
      out.push({model, record, both: model + record, real, n: Math.min(P.o.n, Q.o.n), trn: Math.min(trn(P.k), trn(Q.k)), h}); } } }
const pick = (L, f, lab) => { const M = L.filter(o => Math.abs(o[f]) > 1e-9); let a = 0, W = 0, sxy = 0, sxx = 0;
  for (const o of M) { W += o.n; if ((o[f] > 0) === (o.real > 0)) a += o.n; const x = Math.abs(o[f]), y = o[f] > 0 ? o.real : -o.real; sxy += o.n * x * y; sxx += o.n * x * x; }
  let sd = 9; const bs = []; for (let r = 0; r < 500; r++) { let aa = 0, ww = 0; for (let k = 0; k < M.length; k++) { sd = (sd * 16807) % 2147483647; const o = M[sd % M.length]; ww += o.n; if ((o[f] > 0) === (o.real > 0)) aa += o.n; } bs.push(aa / ww); } bs.sort((x, y) => x - y);
  const prom = M.reduce((s, o) => s + o.n * Math.abs(o[f]), 0) / W, got = M.reduce((s, o) => s + o.n * (o[f] > 0 ? o.real : -o.real), 0) / W;
  console.log(`${lab.padEnd(34)} n ${String(M.length).padStart(5)} · picks better ${(a / W * 100).toFixed(1)}% (${(bs[12] * 100).toFixed(1)} to ${(bs[487] * 100).toFixed(1)}) · promises ${prom.toFixed(2)} pts, real ${got.toFixed(2)} · slope ${(sxy / sxx).toFixed(2)}`); };
console.log(`# Real one-swap pairs, judged on the half the evidence never saw. K=${K}`);
pick(out, 'model', 'model (value gap)'); pick(out, 'record', 'record (own results, shrunk)'); pick(out, 'both', 'both');
const withRec = out.filter(o => o.trn >= 20); console.log(`-- only pairs where both sixes have 20+ training games (${withRec.length})`);
pick(withRec, 'model', 'model'); pick(withRec, 'record', 'record'); pick(withRec, 'both', 'both');
const big = out.filter(o => Math.abs(o.record) >= 2 && o.trn >= 20); console.log(`-- record says 2+ points apart, 20+ games each (${big.length})`); pick(big, 'record', 'record'); pick(big, 'both', 'both');
console.log('-- model pick by size of its gap'); for (const [lo, hi] of [[0, 1], [1, 2], [2, 4], [4, 99]]) pick(out.filter(o => Math.abs(o.model) >= lo && Math.abs(o.model) < hi), 'model', `model gap ${lo}-${hi} pts`);
console.log('-- model pick when the real records agree / disagree (20+ training games each)');
pick(withRec.filter(o => o.record !== 0 && (o.record > 0) === (o.model > 0)), 'model', 'records agree'); pick(withRec.filter(o => o.record !== 0 && (o.record > 0) !== (o.model > 0)), 'model', 'records disagree');

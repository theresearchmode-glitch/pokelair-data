// d5-sugg (Nov 9): real one-swap pairs scored with the SITE's own model (model.mjs), trained on one half of the tournaments
// and judged on the other (skill-adjusted, as experiments/real-swaps.mjs). Value of a six = Σ Pokémon + Σ pairs + the no-Mega
// team term (sets left out: they differ sheet by sheet). Also tests the model's own uncertainty: z = value gap / √(sd_in² + sd_out²)
// from monSd. Does the model pick the better six when it is sure (|z| large) and only guess when it isn't?
// Usage: node experiments/real-swaps-site.mjs <half0-model.json> <half1-model.json> [out.json]   (models from model.mjs with
//        MATCHES = only even / only odd tournaments, events renumbered)
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8'));
const MD = [JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))];
const teams = MT.teams.map(k => k.split('|')), G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1]), nP = MT.players, sig = x => 1 / (1 + Math.exp(-x));
// player skill for judging: fitted on the TRAINING half only (skill + each Pokémon, as real-swaps.mjs)
const names = [...new Set(teams.flat())], idx = new Map(names.map((n, i) => [n, i])), T = teams.map(t => t.map(n => idx.get(n))), nM = names.length;
function skills(gs) { const w = new Float64Array(nM), s = new Float64Array(nP), mw = new Float64Array(nM), vw = new Float64Array(nM), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= 300; t++) { const gw = new Float64Array(nM), gk = new Float64Array(nP);
    for (const g of gs) { let e = s[g[4]] - s[g[5]]; for (const i of T[g[0]]) e += w[i]; for (const i of T[g[1]]) e -= w[i]; const d = sig(e) - g[2]; for (const i of T[g[0]]) gw[i] += d; for (const i of T[g[1]]) gw[i] -= d; gk[g[4]] += d; gk[g[5]] -= d; }
    const n = gs.length, st = (p, gr, m, v, L) => { for (let j = 0; j < p.length; j++) { if (!gr[j] && !p[j]) continue; const q = gr[j] / n + L * p[j] / n; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } };
    st(w, gw, mw, vw, 2); st(s, gk, ms, vs, 1); } return s; }
const isMega = n => /-Mega/.test(n), out = [];
for (const h of [0, 1]) { const md = MD[h], A = G.filter(g => g[3] % 2 === h), B = G.filter(g => g[3] % 2 !== h); console.error('skills, half', h); const s = skills(A);
  const mon = n => md.mons[n] ?? 0, sd = n => md.monSd[n] ?? .05, pr = (a, b) => md.pairs[a < b ? a + '|' + b : b + '|' + a] ?? 0;
  const x = six => { let v = 0; for (const n of six) v += mon(n); for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) v += pr(six[i], six[j]); if (!six.some(isMega)) v += (md.team && md.team.noMega) || 0; return v; };
  const S = new Map(); for (const g of B) for (const [t, y, a, b] of [[g[0], g[2], g[4], g[5]], [g[1], 1 - g[2], g[5], g[4]]]) { if (teams[t].length !== 6) continue; const k = teams[t].slice().sort().join('|'); const o = S.get(k) || {n: 0, adj: 0, six: teams[t].slice().sort()}; o.n++; o.adj += y - sig(s[a] - s[b]); S.set(k, o); }
  const L = [...S.values()].filter(o => o.n >= 10), byCore = new Map();
  for (const o of L) for (let i = 0; i < 6; i++) { const core = o.six.filter((_, j) => j !== i).join('|'); (byCore.get(core) || byCore.set(core, []).get(core)).push({o, x: o.six[i]}); }
  for (const [core, C] of byCore) { if (C.length < 2) continue; const c5 = core.split('|'), cx = c5.reduce((a, n) => a + mon(n), 0);
    for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) { const P = C[i], Q = C[j], gap = x(Q.o.six) - x(P.o.six), z = gap / Math.sqrt(sd(Q.x) ** 2 + sd(P.x) ** 2);
      out.push({h, core, cx, a: P.x, b: Q.x, gap, z, real: Q.o.adj / Q.o.n - P.o.adj / P.o.n, n: Math.min(P.o.n, Q.o.n)}); } } }
if (process.argv[4]) fs.writeFileSync(process.argv[4], JSON.stringify(out));
const ev = (M, lab) => { M = M.filter(o => Math.abs(o.gap) > 1e-9); if (M.length < 10) { console.log(`${lab}: ${M.length} pairs (too few)`); return; } let a = 0, w = 0; for (const o of M) { w += o.n; if ((o.gap > 0) === (o.real > 0)) a += o.n; }
  let q = 3; const bs = []; for (let r = 0; r < 500; r++) { let x = 0, ws = 0; for (let k = 0; k < M.length; k++) { q = (q * 16807) % 2147483647; const o = M[q % M.length]; ws += o.n; if ((o.gap > 0) === (o.real > 0)) x += o.n; } bs.push(x / ws); } bs.sort((p, r) => p - r);
  console.log(`${lab}: ${M.length} pairs · picks the better six ${(a / w * 100).toFixed(1)}% (95% ${(bs[12] * 100).toFixed(1)} to ${(bs[487] * 100).toFixed(1)})`); };
console.log(`# Real one-swap pairs, site model trained on the other half of the tournaments`);
ev(out, 'all');
const cq = out.map(o => o.cx).sort((p, r) => p - r), c1 = cq[Math.floor(cq.length / 3)], c2 = cq[Math.floor(2 * cq.length / 3)];
ev(out.filter(o => o.cx < c1), 'weakest third of shared fives'); ev(out.filter(o => o.cx >= c1 && o.cx < c2), 'middle third'); ev(out.filter(o => o.cx >= c2), 'strongest third');
for (const [lo, hi] of [[0, .5], [.5, 1], [1, 1.5], [1.5, 99]]) ev(out.filter(o => Math.abs(o.z) >= lo && Math.abs(o.z) < hi), `model's own sureness |z| ${lo} to ${hi === 99 ? 'max' : hi}`);

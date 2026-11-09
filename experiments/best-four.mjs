// Sim's idea (Nov 9): a six is a toolbox; what matters is how well the best FOUR you can bring line up against the opponent.
// Real tournament games (out/matches.json). Cross-fit by tournament halves (even/odd event index):
//   stage 1 (one half): Pokémon values + player skill (additive, ridge), then head-to-head residuals: for every game, the result
//     minus what stage 1 expected, credited to each (my Pokémon, their Pokémon) pair → m(a,b), shrunk n/(n+K).
//   stage 2 (other half, never seen by stage 1), three predictions, each fitted with its own weights:
//     base    k·(Σ my values − Σ theirs) + skill gap
//     +all6   base + β·(avg of m over my six × their six − the same from their side)
//     +best4  base + β·(best 4 of my six vs their six − the same for them)   ← the toolbox idea
//   Judged by log-loss on the judged half; 95% ranges from 1,000 resamples by tournament. Both directions pooled.
// Can't see: sets, moves, damage; which four was really brought (tournament data doesn't record it); best-of-3 rounds are
// counted game by game. Usage: node experiments/best-four.mjs [K=50]
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8')), K = +(process.argv[2] || 50);
const teams = MT.teams.map(k => k.split('|')), names = [...new Set(teams.flat())], idx = new Map(names.map((n, i) => [n, i])), T = teams.map(t => t.map(n => idx.get(n)));
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1] && T[g[0]].length === 6 && T[g[1]].length === 6), nM = names.length, nP = MT.players, sig = x => 1 / (1 + Math.exp(-x));
function fit(gs) { const w = new Float64Array(nM), s = new Float64Array(nP), mw = new Float64Array(nM), vw = new Float64Array(nM), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= 300; t++) { const gw = new Float64Array(nM), gk = new Float64Array(nP);
    for (const g of gs) { let e = s[g[4]] - s[g[5]]; for (const i of T[g[0]]) e += w[i]; for (const i of T[g[1]]) e -= w[i]; const d = sig(e) - g[2]; for (const i of T[g[0]]) gw[i] += d; for (const i of T[g[1]]) gw[i] -= d; gk[g[4]] += d; gk[g[5]] -= d; }
    const n = gs.length, st = (p, gr, m, v, L) => { for (let j = 0; j < p.length; j++) { if (!gr[j] && !p[j]) continue; const q = gr[j] / n + L * p[j] / n; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } };
    st(w, gw, mw, vw, 2); st(s, gk, ms, vs, 1); } return {w, s}; }
const FOURS = []; for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) for (let c = b + 1; c < 6; c++) for (let d = c + 1; d < 6; d++) FOURS.push([a, b, c, d]);
const rows = [];
for (const h of [0, 1]) { const A = G.filter(g => g[3] % 2 === h), B = G.filter(g => g[3] % 2 !== h); console.error('stage 1, half', h); const {w, s} = fit(A);
  const sum = new Float64Array(nM * nM), cnt = new Float64Array(nM * nM);
  for (const g of A) { let e = s[g[4]] - s[g[5]]; for (const i of T[g[0]]) e += w[i]; for (const i of T[g[1]]) e -= w[i]; const r = g[2] - sig(e);
    for (const a of T[g[0]]) for (const b of T[g[1]]) { sum[a * nM + b] += r; cnt[a * nM + b]++; sum[b * nM + a] -= r; cnt[b * nM + a]++; } }
  const m = (a, b) => { const c = cnt[a * nM + b]; return c ? sum[a * nM + b] / (c + K) : 0; };
  const vs6 = (me, op) => { const per = me.map(a => op.reduce((x, b) => x + m(a, b), 0) / 6); return {all: per.reduce((x, y) => x + y, 0) / 6, best: Math.max(...FOURS.map(f => f.reduce((x, i) => x + per[i], 0) / 4))}; };
  for (const g of B) { const ta = T[g[0]], tb = T[g[1]], x = ta.reduce((a, i) => a + w[i], 0) - tb.reduce((a, i) => a + w[i], 0), sk = s[g[4]] - s[g[5]], va = vs6(ta, tb), vb = vs6(tb, ta);
    rows.push({ev: g[3], y: g[2], x, sk, all: va.all - vb.all, best: va.best - vb.best}); } }
// stage 2 fits: logit = a·x + b·sk + c·feature (+ intercept-free); Newton-free Adam on the judged rows of BOTH halves pooled
function fit2(R, f, it = 400) { const p = [0, 0, 0], m = [0, 0, 0], v = [0, 0, 0], lr = .02;
  for (let t = 1; t <= it; t++) { const gr = [0, 0, 0]; for (const r of R) { const z = [r.x, r.sk, f ? f(r) : 0], d = sig(p[0] * z[0] + p[1] * z[1] + p[2] * z[2]) - r.y; for (let j = 0; j < 3; j++) gr[j] += d * z[j]; }
    for (let j = 0; j < 3; j++) { const q = gr[j] / R.length; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } }
  return r => sig(p[0] * r.x + p[1] * r.sk + p[2] * (f ? f(r) : 0)); }
// to avoid scoring on the rows the stage-2 weights were fitted on: fit stage 2 on half-0-judged rows, score half-1-judged, and vice versa
const L = (p, y) => -(y * Math.log(Math.max(1e-9, p)) + (1 - y) * Math.log(Math.max(1e-9, 1 - p)));
const half = rows.map(r => r.ev % 2), per = {base: [], all6: [], best4: []};
for (const h of [0, 1]) { const fitR = rows.filter((r, i) => half[i] === h), scR = rows.filter((r, i) => half[i] !== h);
  const P = {base: fit2(fitR, null), all6: fit2(fitR, r => r.all), best4: fit2(fitR, r => r.best)};
  for (const k of Object.keys(P)) for (const r of scR) per[k].push({ev: r.ev, l: L(P[k](r), r.y), ok: (P[k](r) > .5) === (r.y === 1)}); }
const mean = a => a.reduce((x, y) => x + y.l, 0) / a.length, pick = a => a.filter(x => x.ok).length / a.length;
console.log(`# Best four vs the opponent's six: ${rows.length} real tournament games, every game judged by a model that never saw its tournament`);
for (const k of ['base', 'all6', 'best4']) console.log(`${k.padEnd(5)} log-loss ${mean(per[k]).toFixed(5)} · picks the winner ${(pick(per[k]) * 100).toFixed(2)}%`);
const evs = [...new Set(per.base.map(r => r.ev))], byEv = new Map(); per.base.forEach((r, i) => (byEv.get(r.ev) || byEv.set(r.ev, []).get(r.ev)).push(i));
const cmp = (a, b, lab) => { const d = per[a].map((r, i) => per[b][i].l - r.l); let s = 9; const bs = []; for (let k = 0; k < 1000; k++) { let t = 0, n = 0; for (let j = 0; j < evs.length; j++) { s = (s * 16807) % 2147483647; for (const i of byEv.get(evs[s % evs.length])) { t += d[i]; n++; } } bs.push(t / n); } bs.sort((x, y) => x - y);
  const m = d.reduce((x, y) => x + y, 0) / d.length; console.log(`${lab}: log-loss change ${m.toFixed(5)} (95% ${bs[25].toFixed(5)} to ${bs[974].toFixed(5)}) → ${bs[974] < 0 ? 'BETTER beyond chance' : bs[25] > 0 ? 'WORSE beyond chance' : 'no difference beyond chance'}`); };
cmp('base', 'all6', 'all six vs their six, over base'); cmp('base', 'best4', 'best four vs their six, over base'); cmp('all6', 'best4', 'best four over all six');

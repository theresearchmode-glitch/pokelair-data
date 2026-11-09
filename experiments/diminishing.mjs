// d5-sugg (Nov 9): diminishing returns? Real games only (out/matches.json); no grade, no suggestions. Guess being tested: a strong
// Pokémon adds less to a team that is already strong (so an additive strength model over-promises upgrades for good teams).
// Cross-fit by tournament halves (even/odd event index):
//   stage 1 (one half): additive model, logit P(A wins) = Σ mon(A) − Σ mon(B) + skill(pa) − skill(pb), ridge on both.
//   stage 2 (other half): s = a team's stage-1 sum (centred on the average team); fit
//       logit = k·(sA − sB) + c·(sA² − sB²) + skill offset from stage 1.
//   c < 0 beyond chance = diminishing returns (the higher a team's sum, the less one more unit of strength is worth).
// 95% range: stage 2 resampled by tournament, 400 times, both directions pooled.
// Also reports, from the fit, how much a +1 SD Pokémon upgrade is worth for teams at the 25th, 50th and 75th percentile.
// Can't see: shape beyond a quadratic, and effects smaller than its range. Usage: node experiments/diminishing.mjs
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8'));
const teams = MT.teams.map(k => k.split('|')), names = [...new Set(teams.flat())], idx = new Map(names.map((n, i) => [n, i])), T = teams.map(t => t.map(n => idx.get(n)));
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1] && T[g[0]].length === 6 && T[g[1]].length === 6), nM = names.length, nP = MT.players;
const sig = x => 1 / (1 + Math.exp(-x));
function stage1(gs, it = 300, LM = 2, LS = 1) { const w = new Float64Array(nM), s = new Float64Array(nP), mw = new Float64Array(nM), vw = new Float64Array(nM), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= it; t++) { const gw = new Float64Array(nM), gsk = new Float64Array(nP);
    for (const g of gs) { let e = s[g[4]] - s[g[5]]; for (const i of T[g[0]]) e += w[i]; for (const i of T[g[1]]) e -= w[i]; const d = sig(e) - g[2];
      for (const i of T[g[0]]) gw[i] += d; for (const i of T[g[1]]) gw[i] -= d; gsk[g[4]] += d; gsk[g[5]] -= d; }
    const n = gs.length, step = (p, gr, m, v, L) => { for (let j = 0; j < p.length; j++) { if (!gr[j] && !p[j]) continue; const q = gr[j] / n + L * p[j] / n; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } };
    step(w, gw, mw, vw, LM); step(s, gsk, ms, vs, LS); }
  return {w, s}; }
function stage2(rows, it = 600) { let k = 1, c = 0; const lr = .02; let mk = 0, vk = 0, mc = 0, vc = 0;
  for (let t = 1; t <= it; t++) { let gk = 0, gc = 0; for (const r of rows) { const d = sig(k * r.ds + c * r.dq + r.off) - r.y; gk += d * r.ds; gc += d * r.dq; }
    gk /= rows.length; gc /= rows.length; mk = .9 * mk + .1 * gk; vk = .999 * vk + .001 * gk * gk; mc = .9 * mc + .1 * gc; vc = .999 * vc + .001 * gc * gc;
    k -= lr * (mk / (1 - .9 ** t)) / (Math.sqrt(vk / (1 - .999 ** t)) + 1e-8); c -= lr * (mc / (1 - .9 ** t)) / (Math.sqrt(vc / (1 - .999 ** t)) + 1e-8); }
  return {k, c}; }
const half = h => G.filter(g => g[3] % 2 === h), all = [];
for (const h of [0, 1]) { const A = half(h), B = half(1 - h); console.error(`stage 1 on half ${h} (${A.length} games)`); const {w, s} = stage1(A);
  const sumT = new Map(), sOf = t => { if (!sumT.has(t)) sumT.set(t, T[t].reduce((a, i) => a + w[i], 0)); return sumT.get(t); };
  const used = [...new Set(B.flatMap(g => [g[0], g[1]]))], mu = used.reduce((a, t) => a + sOf(t), 0) / used.length, sd = Math.sqrt(used.reduce((a, t) => a + (sOf(t) - mu) ** 2, 0) / used.length);
  for (const g of B) { const a = (sOf(g[0]) - mu) / sd, b = (sOf(g[1]) - mu) / sd; all.push({ds: a - b, dq: a * a - b * b, off: s[g[4]] - s[g[5]], y: g[2], ev: g[3], a, b, sd}); } }
const fit = stage2(all); const evs = [...new Set(all.map(r => r.ev))], byEv = new Map(); all.forEach(r => (byEv.get(r.ev) || byEv.set(r.ev, []).get(r.ev)).push(r));
const cs = [], ks = []; let sd0 = 5; for (let i = 0; i < 400; i++) { const rs = []; for (let j = 0; j < evs.length; j++) { sd0 = (sd0 * 16807) % 2147483647; rs.push(...byEv.get(evs[sd0 % evs.length])); } const f = stage2(rs, 300); cs.push(f.c); ks.push(f.k); if ((i + 1) % 50 === 0) console.error(`resample ${i + 1}/400`); }
cs.sort((a, b) => a - b); ks.sort((a, b) => a - b); const q = p => cs[Math.floor(p * cs.length)];
console.log(`# Diminishing returns? ${all.length} real games scored (cross-fit by tournament halves), ${evs.length} tournaments`);
console.log(`team strength s in SDs of the additive sum; logit = k·Δs + c·Δ(s²) + player skill`);
console.log(`k = ${fit.k.toFixed(3)} (95% ${ks[10].toFixed(3)} to ${ks[389].toFixed(3)}) · c = ${fit.c.toFixed(4)} (95% ${q(.025).toFixed(4)} to ${q(.975).toFixed(4)}) → ${q(.975) < 0 ? 'DIMINISHING RETURNS beyond chance' : q(.025) > 0 ? 'INCREASING returns beyond chance' : 'within chance (unknown)'}`);
// worth of a +0.5 SD upgrade vs an average opponent, at team percentiles (from the scored teams' s)
const ss = all.flatMap(r => [r.a, r.b]).sort((a, b) => a - b), P = p => ss[Math.floor(p * ss.length)];
for (const p of [.1, .25, .5, .75, .9]) { const s0 = P(p), v = x => fit.k * x + fit.c * x * x, gain = (sig(v(s0 + .5) - v(0)) - sig(v(s0) - v(0))) * 100;
  console.log(`  team at the ${Math.round(p * 100)}th percentile (s ${s0.toFixed(2)}): a +0.5 SD upgrade is worth ${gain.toFixed(2)} win-chance points vs an average team`); }

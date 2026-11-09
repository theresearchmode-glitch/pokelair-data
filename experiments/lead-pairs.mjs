// Doubles synergy (Sim, Nov 9: "doubles is played with 2 pokemon out in the field at a time so the synergy between the two is a
// big factor"). Showdown ladder replays (out/replays.json): single games, both players' ratings, each side's six and the two it
// LED with. Time split: learn on the earliest 70% of games, judge on the latest 30%.
//   base     logit P(side 0 wins) = a·rating gap (Elo scale) + Σ six's Pokémon + Σ lead Pokémon (each alone)
//   +lead pairs   base + a value for each lead PAIR (the two that open on the field together), led 30+ times in training
//   +team pairs   base + a value for each pair on the same six (both on the team), on 30+ training sixes
// Ridge strength for the pair values chosen on the last 1/7 of the training games (never on the judged games), then refit on
// all training games. KEEP-style verdict: the change in log-loss on the judged games, 2,000 resamples of games.
// Usage: node experiments/lead-pairs.mjs
import fs from 'node:fs';
const R = JSON.parse(fs.readFileSync(new URL('../out/replays.json', import.meta.url), 'utf8')).games
  .filter(g => (g.w === 0 || g.w === 1) && Array.isArray(g.r) && g.p && g.p[0] && g.p[1] && g.l && g.l[0] && g.l[1] && g.l[0].length === 2 && g.l[1].length === 2 && g.p[0].length === 6 && g.p[1].length === 6)
  .sort((a, b) => a.t - b.t);
const sig = x => 1 / (1 + Math.exp(-x)), key = (a, b) => a < b ? a + '|' + b : b + '|' + a, cut = Math.floor(R.length * .7), TR = R.slice(0, cut), TE = R.slice(cut);
const pairsOf = six => { const o = []; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) o.push(key(six[i], six[j])); return o; };
function build(train, kind, minN = 30) { const ix = new Map(), add = k => { if (!ix.has(k)) ix.set(k, ix.size); return ix.get(k); }, cnt = new Map();
  if (kind === 'lead') for (const g of train) for (const s of [0, 1]) { const k = key(...g.l[s]); cnt.set(k, (cnt.get(k) || 0) + 1); }
  if (kind === 'team') for (const g of train) for (const s of [0, 1]) for (const k of pairsOf(g.p[s])) cnt.set(k, (cnt.get(k) || 0) + 1);
  const P = new Set([...cnt].filter(([, n]) => n >= minN).map(([k]) => k));
  const feat = (g, s) => { const f = []; for (const n of g.p[s]) f.push(add('M:' + n)); for (const n of g.l[s]) f.push(add('L:' + n));
    if (kind === 'lead') { const k = key(...g.l[s]); if (P.has(k)) f.push(add('P:' + k)); }
    if (kind === 'team') for (const k of pairsOf(g.p[s])) if (P.has(k)) f.push(add('P:' + k)); return f; };
  return {ix, feat, nPairs: P.size}; }
function fit(games, B, lamPair, it = 250) { const rows = games.map(g => ({f0: B.feat(g, 0), f1: B.feat(g, 1), d: Math.LN10 * (g.r[0] - g.r[1]) / 400, y: g.w === 0 ? 1 : 0}));
  const K = B.ix.size, w = new Float64Array(K), m = new Float64Array(K), v = new Float64Array(K), isP = new Uint8Array(K); for (const [k, i] of B.ix) if (k.startsWith('P:')) isP[i] = 1;
  let a = 1, ma = 0, va = 0; const lr = .03, n = rows.length;
  for (let t = 1; t <= it; t++) { const gw = new Float64Array(K); let ga = 0;
    for (const r of rows) { let e = a * r.d; for (const i of r.f0) e += w[i]; for (const i of r.f1) e -= w[i]; const d = sig(e) - r.y; ga += d * r.d; for (const i of r.f0) gw[i] += d; for (const i of r.f1) gw[i] -= d; }
    for (let i = 0; i < K; i++) { const L = isP[i] ? lamPair : 1, g = gw[i] / n + L * w[i] / n; m[i] = .9 * m[i] + .1 * g; v[i] = .999 * v[i] + .001 * g * g; w[i] -= lr * (m[i] / (1 - .9 ** t)) / (Math.sqrt(v[i] / (1 - .999 ** t)) + 1e-8); }
    ga /= n; ma = .9 * ma + .1 * ga; va = .999 * va + .001 * ga * ga; a -= lr * (ma / (1 - .9 ** t)) / (Math.sqrt(va / (1 - .999 ** t)) + 1e-8); }
  return g => { let e = a * Math.LN10 * (g.r[0] - g.r[1]) / 400; for (const i of B.feat(g, 0)) e += w[i] ?? 0; for (const i of B.feat(g, 1)) e -= w[i] ?? 0; return sig(e); }; }
const ll = (p, g) => { const y = g.w === 0 ? 1 : 0, q = Math.min(1 - 1e-6, Math.max(1e-6, p)); return -(y * Math.log(q) + (1 - y) * Math.log(1 - q)); };
const vcut = Math.floor(TR.length * 6 / 7), TRa = TR.slice(0, vcut), VA = TR.slice(vcut), res = {};
for (const kind of ['base', 'lead', 'team']) { let lam = 1;
  if (kind !== 'base') { let best = Infinity; for (const L of [1, 4, 16, 64]) { const B = build(TRa, kind), f = fit(TRa, B, L), s = VA.reduce((x, g) => x + ll(f(g), g), 0) / VA.length; console.error(`${kind} λ ${L}: validation ll ${s.toFixed(5)}`); if (s < best) { best = s; lam = L; } } }
  const B = build(TR, kind), f = fit(TR, B, lam); res[kind] = {lam, nPairs: B.nPairs, per: TE.map(g => ll(f(g), g)), pick: TE.filter(g => (f(g) > .5) === (g.w === 0)).length / TE.length}; console.error(`${kind} done`); }
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
console.log(`# Doubles synergy: ${R.length} ladder games (single games), learned on the first ${TR.length}, judged on the last ${TE.length}`);
for (const k of ['base', 'lead', 'team']) console.log(`${k.padEnd(5)} · log-loss ${mean(res[k].per).toFixed(5)} · picks the winner ${(res[k].pick * 100).toFixed(2)}%${k !== 'base' ? ` · ${res[k].nPairs} pairs, ridge ${res[k].lam}` : ''}`);
for (const k of ['lead', 'team']) { const d = res[k].per.map((x, i) => x - res.base.per[i]); let s = 7; const bs = []; for (let r = 0; r < 2000; r++) { let t = 0; for (let j = 0; j < d.length; j++) { s = (s * 16807) % 2147483647; t += d[s % d.length]; } bs.push(t / d.length); } bs.sort((a, b) => a - b);
  const lo = bs[50], hi = bs[1949]; console.log(`${k === 'lead' ? '+ lead pairs (on the field together)' : '+ team pairs (on the same six)'}: log-loss change ${mean(d).toFixed(5)} (95% ${lo.toFixed(5)} to ${hi.toFixed(5)}) → ${hi < 0 ? 'BETTER beyond chance' : lo > 0 ? 'WORSE beyond chance' : 'no difference beyond chance'}`); }

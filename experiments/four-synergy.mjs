// Sim's toolbox idea on the ladder (Nov 9): replays record the FOUR each player brought and the two they led with.
// Showdown ladder (out/replays.json), single games, both players' ratings. Learn on the earliest 70%, judge on the last 30%.
//   base      a·rating gap + Σ brought Pokémon (each alone) + Σ lead Pokémon (each alone)
//   +lead     base + a value per lead pair (the two on the field together), led 30+ times in training
//   +four     base + a value per pair inside the brought four (6 per side), brought together 30+ times
//   +matchup  base + a value per (my brought Pokémon vs their brought Pokémon), seen 30+ times (antisymmetric)
//   +all      all three
// Ridge for the new values chosen on the last 1/7 of training games, then refit on all training games. Log-loss on judged games,
// 95% ranges from 2,000 resamples of games. Usage: node experiments/four-synergy.mjs
import fs from 'node:fs';
const R = JSON.parse(fs.readFileSync(new URL('../out/replays.json', import.meta.url), 'utf8')).games
  .filter(g => (g.w === 0 || g.w === 1) && Array.isArray(g.r) && g.b && g.b[0] && g.b[1] && g.b[0].length === 4 && g.b[1].length === 4 && g.l && g.l[0] && g.l[1] && g.l[0].length === 2 && g.l[1].length === 2)
  .sort((a, b) => a.t - b.t);
const sig = x => 1 / (1 + Math.exp(-x)), key = (a, b) => a < b ? a + '|' + b : b + '|' + a, cut = Math.floor(R.length * .7), TR = R.slice(0, cut), TE = R.slice(cut);
const pairs4 = f => { const o = []; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) o.push(key(f[i], f[j])); return o; };
// a game → list of [featureKey, sign] for side 0 minus side 1
function feats(g, use) { const F = [];
  for (const [s, sg] of [[0, 1], [1, -1]]) { for (const n of g.b[s]) F.push(['M:' + n, sg]); for (const n of g.l[s]) F.push(['L:' + n, sg]);
    if (use.lead) F.push(['P:' + key(...g.l[s]), sg]); if (use.four) for (const k of pairs4(g.b[s])) F.push(['F:' + k, sg]); }
  if (use.mu) for (const a of g.b[0]) for (const b of g.b[1]) { if (a === b) continue; F.push(a < b ? ['V:' + a + '>' + b, 1] : ['V:' + b + '>' + a, -1]); }
  return F; }
function build(train, use) { const cnt = new Map(); for (const g of train) for (const [k] of feats(g, use)) cnt.set(k, (cnt.get(k) || 0) + 1);
  const ix = new Map(); for (const [k, n] of cnt) if (/^[ML]:/.test(k) || n >= 30) ix.set(k, ix.size); return ix; }
function fit(games, use, lam, it = 250) { const ix = build(games, use), K = ix.size, isNew = new Uint8Array(K); for (const [k, i] of ix) if (!/^[ML]:/.test(k)) isNew[i] = 1;
  const rows = games.map(g => ({f: feats(g, use).filter(([k]) => ix.has(k)).map(([k, s]) => [ix.get(k), s]), d: Math.LN10 * (g.r[0] - g.r[1]) / 400, y: g.w === 0 ? 1 : 0}));
  const w = new Float64Array(K), m = new Float64Array(K), v = new Float64Array(K); let a = 1, ma = 0, va = 0; const lr = .03, n = rows.length;
  for (let t = 1; t <= it; t++) { const gw = new Float64Array(K); let ga = 0;
    for (const r of rows) { let e = a * r.d; for (const [i, s] of r.f) e += s * w[i]; const d = sig(e) - r.y; ga += d * r.d; for (const [i, s] of r.f) gw[i] += d * s; }
    for (let i = 0; i < K; i++) { const L = isNew[i] ? lam : 1, q = gw[i] / n + L * w[i] / n; m[i] = .9 * m[i] + .1 * q; v[i] = .999 * v[i] + .001 * q * q; w[i] -= lr * (m[i] / (1 - .9 ** t)) / (Math.sqrt(v[i] / (1 - .999 ** t)) + 1e-8); }
    ga /= n; ma = .9 * ma + .1 * ga; va = .999 * va + .001 * ga * ga; a -= lr * (ma / (1 - .9 ** t)) / (Math.sqrt(va / (1 - .999 ** t)) + 1e-8); }
  return {nNew: isNew.reduce((x, y) => x + y, 0), p: g => { let e = a * Math.LN10 * (g.r[0] - g.r[1]) / 400; for (const [k, s] of feats(g, use)) { const i = ix.get(k); if (i != null) e += s * w[i]; } return sig(e); }}; }
const ll = (p, g) => { const y = g.w === 0 ? 1 : 0, q = Math.min(1 - 1e-6, Math.max(1e-6, p)); return -(y * Math.log(q) + (1 - y) * Math.log(1 - q)); };
const vcut = Math.floor(TR.length * 6 / 7), TRa = TR.slice(0, vcut), VA = TR.slice(vcut);
const V = {base: {}, lead: {lead: 1}, four: {four: 1}, matchup: {mu: 1}, all: {lead: 1, four: 1, mu: 1}}, res = {};
for (const [name, use] of Object.entries(V)) { let lam = 1;
  if (name !== 'base') { let best = Infinity; for (const L of [4, 16, 64, 256]) { const f = fit(TRa, use, L), s = VA.reduce((x, g) => x + ll(f.p(g), g), 0) / VA.length; console.error(`${name} ridge ${L}: validation ${s.toFixed(5)}`); if (s < best) { best = s; lam = L; } } }
  const f = fit(TR, use, lam); res[name] = {lam, n: f.nNew, per: TE.map(g => ll(f.p(g), g)), pick: TE.filter(g => (f.p(g) > .5) === (g.w === 0)).length / TE.length}; console.error(name, 'done'); }
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
console.log(`# Toolbox test on the ladder: ${R.length} single games with both brought fours, learned on ${TR.length}, judged on the last ${TE.length}`);
for (const k of Object.keys(V)) console.log(`${k.padEnd(8)} log-loss ${mean(res[k].per).toFixed(5)} · picks ${(res[k].pick * 100).toFixed(2)}%${k !== 'base' ? ` · ${res[k].n} new values, ridge ${res[k].lam}` : ''}`);
for (const k of ['lead', 'four', 'matchup', 'all']) { const d = res[k].per.map((x, i) => x - res.base.per[i]); let s = 7; const bs = []; for (let r = 0; r < 2000; r++) { let t = 0; for (let j = 0; j < d.length; j++) { s = (s * 16807) % 2147483647; t += d[s % d.length]; } bs.push(t / d.length); } bs.sort((a, b) => a - b);
  console.log(`${k} vs base: ${mean(d).toFixed(5)} (95% ${bs[50].toFixed(5)} to ${bs[1949].toFixed(5)}) → ${bs[1949] < 0 ? 'BETTER beyond chance' : bs[50] > 0 ? 'WORSE beyond chance' : 'no difference beyond chance'}`); }

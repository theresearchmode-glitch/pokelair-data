// Strength Score, Phase 2 step 2: how much each factor is worth in real games. Uses the factor file from strength-factors.mjs.
// One logistic fit over every real tournament game: logit P(A wins) = skill(A's player) − skill(B's player) + Σ β_k (f_k(A) − f_k(B)),
// players' skills fitted alongside (ridge), so a strong player's wins don't count for their team's features. 95% ranges: 100
// resamples by tournament. Effects reported in win-chance points for one unit of each factor (vs an even game).
// NOTE: x0 comes from a model trained on these same games (fine for sizing; Phase 3 re-checks everything walk-forward, each week
// with a model trained only on earlier games).
// Usage: node experiments/strength-fit.mjs <factors.json> [out.json]
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8'));
const SF = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).F;
// factors, each scaled so 1 unit is meaningful
const FEAT = {
  x0: f => f.x0,                                   // Pokémon + pairs + sets + team terms (model units)
  ready10: f => f.ready / 10,                      // readiness for the top 30 threats, per 10 points
  mega: f => f.mega,                               // has a Mega
  stackOK: f => f.stackOK === 1 ? 1 : 0,           // no major weak spot
  w3OK: f => f.w3OK === 1 ? 1 : 0,                 // weak spots spread out
  off: f => f.off,                                 // types hit super effectively (of 18), per type
  unres: f => f.unres,                             // attacking types nobody resists, per type
  protect: f => f.protect,                         // members with Protect, per member
  items: f => f.itemProblems > 0 ? 1 : 0,          // an item problem
  mixed: f => Math.min(f.phys, f.spec) >= 2 ? 1 : 0, // at least 2 physical and 2 special attackers
  dup3: f => f.dup >= 3 ? 1 : 0                    // 3+ members sharing a type
};
const KEYS = Object.keys(process.env.ONLY ? Object.fromEntries(process.env.ONLY.split(',').map(k => [k, 1])) : FEAT), K = KEYS.length;
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1] && g[7] != null && g[8] != null && SF[g[7]] && SF[g[8]] && !SF[g[7]].err && !SF[g[8]].err);
const rows = G.map(g => ({x: KEYS.map(k => FEAT[k](SF[g[7]]) - FEAT[k](SF[g[8]])), pa: g[4], pb: g[5], r: g[2], ev: g[3]}));
// standardise the differences so one ridge strength suits all
const sd = KEYS.map((_, j) => { const v = rows.map(r => r.x[j]), m = v.reduce((a, b) => a + b, 0) / v.length; return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) || 1; });
for (const r of rows) r.z = r.x.map((v, j) => v / sd[j]);
const nP = MT.players;
const fit = (idx, it = 400) => { const be = new Float64Array(K), s = new Float64Array(nP), mb = new Float64Array(K), vb = new Float64Array(K), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= it; t++) { const gb = new Float64Array(K), gs = new Float64Array(nP);
    for (const i of idx) { const R = rows[i]; let e = s[R.pa] - s[R.pb]; for (let j = 0; j < K; j++) e += be[j] * R.z[j]; const d = 1 / (1 + Math.exp(-e)) - R.r; for (let j = 0; j < K; j++) gb[j] += d * R.z[j]; gs[R.pa] += d; gs[R.pb] -= d; }
    const n = idx.length; for (let j = 0; j < K; j++) { const g = gb[j] / n + .01 * be[j]; mb[j] = .9 * mb[j] + .1 * g; vb[j] = .999 * vb[j] + .001 * g * g; be[j] -= lr * (mb[j] / (1 - .9 ** t)) / (Math.sqrt(vb[j] / (1 - .999 ** t)) + 1e-8); }
    for (let j = 0; j < nP; j++) { if (!gs[j] && !s[j]) continue; const g = gs[j] / n + s[j] / n; ms[j] = .9 * ms[j] + .1 * g; vs[j] = .999 * vs[j] + .001 * g * g; s[j] -= lr * (ms[j] / (1 - .9 ** t)) / (Math.sqrt(vs[j] / (1 - .999 ** t)) + 1e-8); } }
  return [...be].map((b, j) => b / sd[j]); }; // back to per-unit
const all = [...rows.keys()], B0 = fit(all);
const evs = [...new Set(rows.map(r => r.ev))], byEv = new Map(); rows.forEach((r, i) => (byEv.get(r.ev) || byEv.set(r.ev, []).get(r.ev)).push(i));
const BS = []; let q = 9; for (let k = 0; k < +(process.env.RS || 100); k++) { const idx = []; for (let j = 0; j < evs.length; j++) { q = (q * 16807) % 2147483647; idx.push(...byEv.get(evs[q % evs.length])); } BS.push(fit(idx, 200)); console.error(`resample ${k + 1}`); }
const pts = b => (1 / (1 + Math.exp(-b)) - .5) * 100, LAB = {x0: 'Pokémon + pairs + sets (per model unit)', ready10: 'Ready for the top threats (per 10 points)', mega: 'Has a Mega', stackOK: 'No major weak spot', w3OK: 'Weak spots spread out', off: 'Offensive coverage (per type hit super effectively)', unres: 'Types nobody resists (per type)', protect: 'Protect (per member)', items: 'An item problem', mixed: '2+ physical and 2+ special attackers', dup3: '3+ members sharing a type'};
console.log(`# What each factor is worth in real games (${rows.length} games, player skill fitted alongside, ${BS.length} resamples by tournament)\n`);
console.log('| factor | win-chance points per unit | 95% range | verdict |\n|---|---|---|---|');
const res = {}; KEYS.forEach((k, j) => { const v = BS.map(b => b[j]).sort((a, b) => a - b), lo = v[Math.floor(v.length * .025)], hi = v[Math.ceil(v.length * .975) - 1]; res[k] = {beta: B0[j], lo, hi};
  console.log(`| ${LAB[k]} | ${pts(B0[j]) >= 0 ? '+' : ''}${pts(B0[j]).toFixed(2)} | ${pts(lo).toFixed(2)} to ${pts(hi).toFixed(2)} | ${lo > 0 ? 'helps beyond chance' : hi < 0 ? 'hurts beyond chance' : 'within chance (unknown)'} |`); });
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify({games: rows.length, keys: KEYS, res}, null, 1));

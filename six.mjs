// Each six's own record, with player skill and opponent strength taken out (Grade v2, Nov 7; tested in
// experiments/grade-v2.mjs: the grade built this way picked the winner of 56.1% of later games, against 53.6% for the old grade).
// Runs after model.mjs. For every exact six seen in tournament games:
//   P(A wins) = σ( calib·(xA + δA − xB − δB) + sA − sB )
// with x the shipped team model (held fixed), s each player's skill and δ the six's own deviation, both shrunk toward 0
// (δ ~ N(0, 0.1²), s ~ N(0, 0.6²); τ was .35 until Nov 8: with each set counted fully, the scoreboard found .1 as
// good on log-loss as no record at all and a little better at picking winners, at all three date cut-offs), so a few games barely move a six and hundreds of games move it a lot.
// Adds to out/model.json: sixes = {"Mon1|Mon2|…" (sorted): [δ, games]} for sixes with 10+ games. The page adds δ to its own
// team strength for that exact six; every other team is graded on the model alone.
import fs from 'node:fs';
const MF = process.env.MODEL_FILE || 'out/model.json'; // MATCHES / MODEL_FILE: experiments
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || 'out/matches.json', 'utf8')), MD = JSON.parse(fs.readFileSync(MF, 'utf8'));
if (!MD.ships || !MD.mons) { console.log('six: model not shipped, nothing added'); process.exit(0); }
const TAU = .1, SIG_S = .6, ITERS = 300, MIN_G = 10, calib = MD.calib; // 10+ games: keeps meta/model under the 256 KB the page database takes per write
const teams = M.teams.map(k => k.split('|'));
const spF = new Map(); for (const f of Object.keys(MD.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
const xOf = (t, d) => { const m = teams[t]; let v = 0; for (const n of m) v += MD.mons[n] || 0;
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MD.pairs || {})[k] || 0; }
  if (d == null || !M.decks || !M.decks[d]) return v; const has = new Set(M.decks[d].map(f => M.feats[f]));
  for (const n of m) { let u = 0; for (const f of spF.get(n) || []) u += MD.sets[f] * ((has.has(f) ? 1 : 0) - ((MD.setFreq || {})[f] || 0)); const r = (MD.setRange || {})[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; }
  return v; };
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6), X = G.map(g => [xOf(g[0], g[7]), xOf(g[1], g[8])]);
const s = new Float64Array(M.players), dl = new Float64Array(M.teams.length), ms = new Float64Array(M.players), vs = new Float64Array(M.players), md = new Float64Array(M.teams.length), vd = new Float64Array(M.teams.length), gs = new Float64Array(M.players), gd = new Float64Array(M.teams.length);
const lr = .05, b1 = .9, b2 = .999;
for (let it = 1; it <= ITERS; it++) { gs.fill(0); gd.fill(0);
  G.forEach((g, i) => { const eta = calib * (X[i][0] + dl[g[0]] - X[i][1] - dl[g[1]]) + s[g[4]] - s[g[5]], e = (g[2] === 1 ? 1 : 0) - 1 / (1 + Math.exp(-eta)); gs[g[4]] += e; gs[g[5]] -= e; gd[g[0]] += calib * e; gd[g[1]] -= calib * e; });
  for (let j = 0; j < s.length; j++) { const gr = gs[j] - s[j] / (SIG_S * SIG_S); ms[j] = b1 * ms[j] + (1 - b1) * gr; vs[j] = b2 * vs[j] + (1 - b2) * gr * gr; s[j] += lr * (ms[j] / (1 - b1 ** it)) / (Math.sqrt(vs[j] / (1 - b2 ** it)) + 1e-8); }
  for (let j = 0; j < dl.length; j++) { const gr = gd[j] - dl[j] / (TAU * TAU); md[j] = b1 * md[j] + (1 - b1) * gr; vd[j] = b2 * vd[j] + (1 - b2) * gr * gr; dl[j] += lr * (md[j] / (1 - b1 ** it)) / (Math.sqrt(vd[j] / (1 - b2 ** it)) + 1e-8); } }
// one entry per six (the same six can appear under more than one team id): games added up, δ weighted by games
const per = new Map(); const ng = new Map(); for (const g of G) { ng.set(g[0], (ng.get(g[0]) || 0) + 1); ng.set(g[1], (ng.get(g[1]) || 0) + 1); }
for (const [t, n] of ng) { const k = teams[t].slice().sort().join('|'), o = per.get(k) || {g: 0, d: 0}; o.g += n; o.d += dl[t] * n; per.set(k, o); }
const sixes = {}; for (const [k, o] of per) if (o.g >= MIN_G) sixes[k] = [+(o.d / o.g).toFixed(4), o.g];
MD.sixes = sixes; MD.sixesNote = `each six's own record, player skill and opponents taken out (six.mjs): [δ, games]; page strength = model x + δ; τ ${TAU}, ${G.length} games`;
fs.writeFileSync(MF, JSON.stringify(MD));
const top = Object.entries(sixes).sort((a, b) => b[1][1] - a[1][1]).slice(0, 3).map(([k, v]) => `${v[1]} games δ ${v[0]}`);
console.log(`six: ${Object.keys(sixes).length} sixes with ${MIN_G}+ games added to out/model.json (most played: ${top.join(', ')})`);

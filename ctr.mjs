// Matchups learned from real games (Nov 8, Sim: "absolutely go with the real results"). Runs after model.mjs and six.mjs.
// Which Pokémon do well against which, read from every tournament game with each team's strength and each player's skill
// taken out:  P(A wins) = σ( calib·(xA − xB) + sA − sB + Σ_{a∈A, b∈B} c[a][b] ),  c[a][b] = −c[b][a], shrunk toward 0.
// Tested in experiments/counters.mjs at three date cut-offs: against a known opponent it picked later winners about half a
// point better (56.3% → 56.8%) with better-calibrated chances; averaged over the whole field it added nothing, so the page
// uses it only when the opponent is known (Battle: Plan a Match), never in the team grade.
// Adds to out/model.json: ctr = {sp: [Pokémon on 1%+ of teams], v: [c for each pair a<b, in thousandths, row by row]}.
import fs from 'node:fs';
const MF = process.env.MODEL_FILE || 'out/model.json';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || 'out/matches.json', 'utf8')), MD = JSON.parse(fs.readFileSync(MF, 'utf8'));
if (!MD.ships || !MD.mons) { console.log('ctr: model not shipped, nothing added'); process.exit(0); }
const LAM = 300, ITERS = 250, calib = MD.calib, sig = z => 1 / (1 + Math.exp(-z)), teams = M.teams.map(k => k.split('|'));
const spF = new Map(); for (const f of Object.keys(MD.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
const xOf = (t, d) => { const m = teams[t]; let v = 0; for (const n of m) v += MD.mons[n] || 0;
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MD.pairs || {})[k] || 0; }
  if (d == null || !M.decks || !M.decks[d]) return v; const has = new Set(M.decks[d].map(f => M.feats[f]));
  for (const n of m) { let u = 0; for (const f of spF.get(n) || []) u += MD.sets[f] * ((has.has(f) ? 1 : 0) - ((MD.setFreq || {})[f] || 0)); const r = (MD.setRange || {})[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; }
  return v; };
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6), X = G.map(g => calib * (xOf(g[0], g[7]) - xOf(g[1], g[8])));
const cnt = new Map(); for (const g of G) for (const t of [g[0], g[1]]) for (const n of teams[t]) cnt.set(n, (cnt.get(n) || 0) + 1);
const sp = [...cnt].filter(([, c]) => c / (G.length * 2) >= .01).map(([n]) => n).sort(), ix = new Map(sp.map((n, i) => [n, i])), K = sp.length;
const idx = t => teams[t].map(n => ix.get(n)).filter(i => i != null), PI = G.map(g => [idx(g[0]), idx(g[1])]);
// player skill first (so a strong player's wins don't read as a counter), then the matchups with skill held fixed
const S = new Float64Array(M.players); { const m1 = new Float64Array(M.players), v1 = new Float64Array(M.players), gs = new Float64Array(M.players);
  for (let it = 1; it <= 200; it++) { gs.fill(0); G.forEach((g, i) => { const e = (g[2] === 1 ? 1 : 0) - sig(X[i] + S[g[4]] - S[g[5]]); gs[g[4]] += e; gs[g[5]] -= e; });
    for (let j = 0; j < S.length; j++) { const gr = gs[j] - S[j] / .36; m1[j] = .9 * m1[j] + .1 * gr; v1[j] = .999 * v1[j] + .001 * gr * gr; S[j] += .05 * (m1[j] / (1 - .9 ** it)) / (Math.sqrt(v1[j] / (1 - .999 ** it)) + 1e-8); } } }
const C = new Float64Array(K * K); { const m1 = new Float64Array(K * K), v1 = new Float64Array(K * K), gC = new Float64Array(K * K);
  for (let it = 1; it <= ITERS; it++) { gC.fill(0);
    G.forEach((g, i) => { const [A, B] = PI[i]; let z = X[i] + S[g[4]] - S[g[5]]; for (const a of A) for (const b of B) z += C[a * K + b];
      const e = (g[2] === 1 ? 1 : 0) - sig(z); for (const a of A) for (const b of B) { gC[a * K + b] += e; gC[b * K + a] -= e; } });
    for (let a = 0; a < K; a++) for (let b = a + 1; b < K; b++) { const j = a * K + b, gr = (gC[j] - gC[b * K + a]) / 2 - C[j] * LAM; m1[j] = .9 * m1[j] + .1 * gr; v1[j] = .999 * v1[j] + .001 * gr * gr;
      C[j] += .02 * (m1[j] / (1 - .9 ** it)) / (Math.sqrt(v1[j] / (1 - .999 ** it)) + 1e-8); C[b * K + a] = -C[j]; } } }
const v = []; for (let a = 0; a < K; a++) for (let b = a + 1; b < K; b++) v.push(Math.round(C[a * K + b] * 1000));
MD.ctr = {sp, v, lam: LAM, games: G.length};
MD.ctrNote = 'matchups learned from real games (ctr.mjs): c[a][b] in thousandths of a logit for each pair a<b (row by row), c[b][a] = −c[a][b]; used only against a known opponent';
fs.writeFileSync(MF, JSON.stringify(MD));
const top = []; for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) if (C[a * K + b] > 0) top.push([sp[a], sp[b], C[a * K + b]]); top.sort((x, y) => y[2] - x[2]);
console.log(`ctr: ${K} Pokémon, ${v.length} pairs from ${G.length} games; model now ${(JSON.stringify(MD).length / 1024).toFixed(0)} KB; strongest: ${top.slice(0, 4).map(([a, b, c]) => `${a} > ${b} +${(sig(c) * 100 - 50).toFixed(1)}pt`).join(', ')}`);

// Usage: node experiments/skill-vs-team.mjs   (Sim, Nov 9: "could it be that player skill just matters so much?")
// How much does a game depend on the player vs the team? Joint fit (player skill + each Pokémon, additive, ridge) on one half
// of tournaments, then on the OTHER half compare: SD of skill gap vs SD of team gap (logit), and how well each alone predicts.
import fs from 'node:fs';
const MT = JSON.parse(fs.readFileSync('/home/user/pokelair-data/out/matches.json', 'utf8'));
const teams = MT.teams.map(k => k.split('|')), names = [...new Set(teams.flat())], idx = new Map(names.map((n, i) => [n, i])), T = teams.map(t => t.map(n => idx.get(n)));
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1]), nM = names.length, nP = MT.players, sig = x => 1 / (1 + Math.exp(-x));
function fit(gs) { const w = new Float64Array(nM), s = new Float64Array(nP), mw = new Float64Array(nM), vw = new Float64Array(nM), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= 300; t++) { const gw = new Float64Array(nM), gk = new Float64Array(nP);
    for (const g of gs) { let e = s[g[4]] - s[g[5]]; for (const i of T[g[0]]) e += w[i]; for (const i of T[g[1]]) e -= w[i]; const d = sig(e) - g[2]; for (const i of T[g[0]]) gw[i] += d; for (const i of T[g[1]]) gw[i] -= d; gk[g[4]] += d; gk[g[5]] -= d; }
    const n = gs.length, st = (p, gr, m, v, L) => { for (let j = 0; j < p.length; j++) { if (!gr[j] && !p[j]) continue; const q = gr[j] / n + L * p[j] / n; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } };
    st(w, gw, mw, vw, 2); st(s, gk, ms, vs, 1); } return {w, s}; }
const res = {sk: [], tm: []}; let pick = {sk: 0, tm: 0, both: 0, n: 0}, seen = 0, seenBoth = 0;
for (const h of [0, 1]) { const A = G.filter(g => g[3] % 2 === h), B = G.filter(g => g[3] % 2 !== h); console.error('fit half', h); const {w, s} = fit(A);
  const playedA = new Set(A.flatMap(g => [g[4], g[5]]));
  for (const g of B) { const tm = T[g[0]].reduce((a, i) => a + w[i], 0) - T[g[1]].reduce((a, i) => a + w[i], 0); res.tm.push(tm);
    if (playedA.has(g[4]) && playedA.has(g[5])) { const sk = s[g[4]] - s[g[5]]; res.sk.push(sk); seenBoth++;
      pick.n++; if ((sk > 0) === (g[2] === 1)) pick.sk++; if ((tm > 0) === (g[2] === 1)) pick.tm++; if ((sk + tm > 0) === (g[2] === 1)) pick.both++; } } }
const sd = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
console.log(`games where both players also played in the other half: ${seenBoth} of ${res.tm.length}`);
console.log(`spread of the gap (logit SD): player skill ${sd(res.sk).toFixed(3)} · team ${sd(res.tm).toFixed(3)}`);
console.log(`picks the winner (games with both players known): skill alone ${(pick.sk / pick.n * 100).toFixed(1)}% · team alone ${(pick.tm / pick.n * 100).toFixed(1)}% · both ${(pick.both / pick.n * 100).toFixed(1)}%`);

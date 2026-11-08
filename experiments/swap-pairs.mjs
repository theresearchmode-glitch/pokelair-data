// Do our suggestions point the right way? A bigger test (Nov 8, readiness item 3).
// A suggestion says "this six with one Pokémon changed is stronger". Real data has many pairs of sixes that differ by exactly
// one Pokémon, played by different people. For each six, its LATER results are measured after taking out each player's skill
// and the opponent team's strength (both from earlier games only), so what is left is how the six itself did. Then, for every
// pair differing by one Pokémon: does the grade (trained on earlier games only) say which of the two did better?
// Usage: BOARD_MT=<model trained on the first 60%> BOARD_CUT=.6 MATCHES=<file> node experiments/swap-pairs.mjs [minGames=8]
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches.json', 'utf8')), MT = JSON.parse(fs.readFileSync(process.env.BOARD_MT || OUT + 'model_train.json', 'utf8'));
const CUTF = +(process.env.BOARD_CUT || .8), MING = +(process.argv[2] || 8), teams = M.teams.map(k => k.split('|')), calib = MT.calib, sig = z => 1 / (1 + Math.exp(-z));
const spF = new Map(); for (const f of Object.keys(MT.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
const xMon = m => { let v = 0; for (const n of m) v += MT.mons[n] || 0; for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MT.pairs || {})[k] || 0; } return v; };
const ev = M.events, ord = [...ev.keys()].sort((a, b) => ev[a][1] < ev[b][1] ? -1 : 1), lo = Math.floor(ord.length * CUTF), futE = new Set(ord.slice(lo));
// sealed test set (Phase 0, Nov 8): scoring on sealed events needs SEALED=1 (end-of-phase checks only); see experiments/sealed.json
{ const SL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from, n = [...futE].filter(i => ev[i][1] >= SL && !String(ev[i][0]).startsWith('sd-')).length;
  if (n && process.env.SEALED !== '1') { console.error(`refusing: ${n} sealed events (from ${SL}) are in the scored set. Tune on MATCHES=out/matches_dev.json; use SEALED=1 only for an end-of-phase check.`); process.exit(2); }
  if (process.env.SEALED === '1') console.log(`SEALED CHECK: scoring ${n} sealed events`); }
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6), past = G.filter(g => !futE.has(g[3])), fut = G.filter(g => futE.has(g[3]));
// player skill from earlier games (team strength held fixed at the model's value)
const S = new Float64Array(M.players); { const X = past.map(g => calib * (xMon(teams[g[0]]) - xMon(teams[g[1]]))), m1 = new Float64Array(M.players), v1 = new Float64Array(M.players), gs = new Float64Array(M.players);
  for (let it = 1; it <= 200; it++) { gs.fill(0); past.forEach((g, i) => { const e = (g[2] === 1 ? 1 : 0) - sig(X[i] + S[g[4]] - S[g[5]]); gs[g[4]] += e; gs[g[5]] -= e; });
    for (let j = 0; j < S.length; j++) { const gr = gs[j] - S[j] / .36; m1[j] = .9 * m1[j] + .1 * gr; v1[j] = .999 * v1[j] + .001 * gr * gr; S[j] += .05 * (m1[j] / (1 - .9 ** it)) / (Math.sqrt(v1[j] / (1 - .999 ** it)) + 1e-8); } } }
// later results per six (keyed by its six Pokémon), with skill and opponent strength taken out: own strength is set to the
// field average, so the residual (won − expected) is what the six itself added
const xBar = (() => { let s = 0, n = 0; for (const g of past) { s += xMon(teams[g[0]]) + xMon(teams[g[1]]); n += 2; } return s / n; })();
const per = new Map(); for (const g of fut) for (const [a, b, pa, pb, y] of [[g[0], g[1], g[4], g[5], g[2] === 1 ? 1 : 0], [g[1], g[0], g[5], g[4], g[2] === 1 ? 0 : 1]]) {
  const k = teams[a].slice().sort().join('|'), p = sig(calib * (xBar - xMon(teams[b])) + S[pa] - S[pb]), o = per.get(k) || {n: 0, r: 0, v: 0}; o.n++; o.r += y - p; o.v += p * (1 - p); per.set(k, o); }
const six = [...per].filter(([, o]) => o.n >= MING).map(([k, o]) => ({k, ns: k.split('|'), n: o.n, r: o.r / o.n, x: xMon(k.split('|'))}));
// pairs differing by exactly one Pokémon
const bySub = new Map(); six.forEach((s, i) => { for (let j = 0; j < 6; j++) { const key = s.ns.filter((_, q) => q !== j).join('|'); if (!bySub.has(key)) bySub.set(key, []); bySub.get(key).push(i); } });
const pairs = []; for (const ix of bySub.values()) for (let a = 0; a < ix.length; a++) for (let b = a + 1; b < ix.length; b++) pairs.push([six[ix[a]], six[ix[b]]]);
// weight each pair by how much its result can be trusted (fewer games = noisier)
let agree = 0, called = 0, sxy = 0, sxx = 0, syy = 0, sw = 0; const big = [];
for (const [A, B] of pairs) { const dp = A.x - B.x, dr = A.r - B.r, w = 1 / (1 / A.n + 1 / B.n); sw += w; sxy += w * dp * dr; sxx += w * dp * dp; syy += w * dr * dr;
  if (Math.abs(calib * dp) >= .02) { called++; if ((dp > 0) === (dr > 0)) agree++; big.push({dp, dr, w}); } }
console.log(`${six.length} sixes with ${MING}+ later games · ${pairs.length} pairs that differ by exactly one Pokémon`);
console.log(`on the ${called} pairs where the grade sees a real difference, it picks the six that did better ${(agree / Math.max(1, called) * 100).toFixed(1)}% of the time (coin flip 50%)`);
console.log(`weighted correlation between the grade's difference and the real difference: ${(sxy / Math.sqrt(sxx * syy)).toFixed(3)}`);
// a rough 95% band for the agreement rate (pairs share sixes, so this is optimistic)
const p = agree / Math.max(1, called), se = Math.sqrt(p * (1 - p) / Math.max(1, called)); console.log(`(±${(196 * se).toFixed(1)} pts, optimistic since pairs share sixes)`);

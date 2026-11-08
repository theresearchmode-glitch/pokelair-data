// Build for Me's caution, tested on later results (Nov 8, foundation plan Phase 2). Build for Me picks the sixes with the highest
// score; if the grade overrates a Pokémon or a little-played mix, the search will find it. Here every real six with enough LATER
// games (after the dev cut) is scored the way Build for Me scores it, strength minus K × its uncertainty, from a model trained
// before the cut, and compared with how the six really did later with player skill and opponent strength taken out (as in
// swap-pairs.mjs). For each K: the correlation, and how the top 10% / top 5% by score really did (what Build for Me would hand out).
// Also: how sixes with each often-built Pokémon did later vs what the grade expected.
// Usage: MATCHES=out/matches_dev.json BOARD_MT=out/model_dev_site.json BOARD_DATE=2026-10-27 node experiments/build-later.mjs [minGames=6]
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches_dev.json', 'utf8')), MT = JSON.parse(fs.readFileSync(process.env.BOARD_MT || OUT + 'model_dev_site.json', 'utf8'));
const FROM = process.env.BOARD_DATE || '2026-10-27', MING = +(process.argv[2] || 6), SL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from;
const teams = M.teams.map(k => k.split('|')), calib = MT.calib || 1, sig = z => 1 / (1 + Math.exp(-z));
const fut = new Set(M.events.map((e, i) => [e, i]).filter(([e]) => e[1] >= FROM && e[1] < SL && !String(e[0]).startsWith('sd-')).map(([, i]) => i));
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6), past = G.filter(g => !fut.has(g[3]) && M.events[g[3]][1] < FROM), later = G.filter(g => fut.has(g[3]));
const pk = (a, b) => a < b ? a + '|' + b : b + '|' + a;
const xMon = m => { let v = 0; for (const n of m) v += MT.mons[n] || 0; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) v += (MT.pairs || {})[pk(m[i], m[j])] || 0; return v; };
const sdOf = m => { const mx = Math.max(...Object.values(MT.monSd || {0: .1})), p0 = +MT.pairSd0 || .05; let v = 0; for (const n of m) v += ((MT.monSd || {})[n] ?? mx) ** 2;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) v += ((MT.pairSd || {})[pk(m[i], m[j])] ?? p0) ** 2; return Math.sqrt(v) * .7; };
const sixD = m => { const v = (MT.sixes || {})[m.slice().sort().join('|')]; return Array.isArray(v) ? +v[0] : 0; };
// player skill from earlier games (team strength fixed at the model's value)
const S = new Float64Array(M.players); { const X = past.map(g => calib * (xMon(teams[g[0]]) - xMon(teams[g[1]]))), m1 = new Float64Array(M.players), v1 = new Float64Array(M.players), gs = new Float64Array(M.players);
  for (let it = 1; it <= 200; it++) { gs.fill(0); past.forEach((g, i) => { const e = (g[2] === 1 ? 1 : 0) - sig(X[i] + S[g[4]] - S[g[5]]); gs[g[4]] += e; gs[g[5]] -= e; });
    for (let j = 0; j < S.length; j++) { const gr = gs[j] - S[j] / .36; m1[j] = .9 * m1[j] + .1 * gr; v1[j] = .999 * v1[j] + .001 * gr * gr; S[j] += .05 * (m1[j] / (1 - .9 ** it)) / (Math.sqrt(v1[j] / (1 - .999 ** it)) + 1e-8); } } }
// later residual per six: won minus expected, with its own strength set to the field average
const xBar = (() => { let s = 0, n = 0; for (const g of past) { s += xMon(teams[g[0]]) + xMon(teams[g[1]]); n += 2; } return s / n; })();
const per = new Map(); for (const g of later) for (const [a, b, pa, pb, y] of [[g[0], g[1], g[4], g[5], g[2] === 1 ? 1 : 0], [g[1], g[0], g[5], g[4], g[2] === 1 ? 0 : 1]]) {
  const k = teams[a].slice().sort().join('|'), p = sig(calib * (xBar - xMon(teams[b])) + S[pa] - S[pb]), o = per.get(k) || {n: 0, r: 0}; o.n++; o.r += y - p; per.set(k, o); }
const six = [...per].filter(([, o]) => o.n >= MING).map(([k, o]) => { const ns = k.split('|'); return {ns, n: o.n, r: o.r / o.n, x: xMon(ns) + sixD(ns), sd: sdOf(ns)}; });
console.log(`${six.length} real sixes with ${MING}+ later games (from ${FROM}); later result = win rate above what skill and opponents predicted`);
const wcorr = f => { let sw = 0, mx = 0, my = 0; for (const s of six) { sw += s.n; mx += s.n * f(s); my += s.n * s.r; } mx /= sw; my /= sw; let sxy = 0, sxx = 0, syy = 0; for (const s of six) { sxy += s.n * (f(s) - mx) * (s.r - my); sxx += s.n * (f(s) - mx) ** 2; syy += s.n * (s.r - my) ** 2; } return sxy / Math.sqrt(sxx * syy); };
const topR = (f, q) => { const o = six.slice().sort((a, b) => f(b) - f(a)), k = Math.max(5, Math.round(o.length * q)), t = o.slice(0, k), n = t.reduce((a, s) => a + s.n, 0); return {r: t.reduce((a, s) => a + s.r * s.n, 0) / n * 100, n, k}; };
for (const K of [0, .25, .5, 1, 1.5, 2]) { const f = s => s.x - K * s.sd, a = topR(f, .1), b = topR(f, .05);
  console.log(`K ${String(K).padEnd(4)} corr ${wcorr(f).toFixed(3)} · top 10% (${a.k} sixes, ${a.n} games) did ${a.r >= 0 ? '+' : ''}${a.r.toFixed(1)} pts · top 5% (${b.k}) ${b.r >= 0 ? '+' : ''}${b.r.toFixed(1)} pts`); }
// often-built Pokémon: later result of sixes containing it vs all
const all = six.reduce((a, s) => a + s.r * s.n, 0) / six.reduce((a, s) => a + s.n, 0) * 100;
for (const n of (process.env.MONS || 'Annihilape,Archaludon,Basculegion,Glimmora,Garchomp,Kingambit').split(',')) { const s = six.filter(x => x.ns.includes(n)); if (!s.length) continue; const g = s.reduce((a, x) => a + x.n, 0);
  console.log(`  sixes with ${n}: ${s.length} sixes, ${g} later games, did ${(s.reduce((a, x) => a + x.r * x.n, 0) / g * 100).toFixed(1)} pts (all sixes ${all.toFixed(1)}) · model value ${(MT.mons[n] || 0).toFixed(3)}`); }

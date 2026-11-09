// d5-sugg (Nov 9): is the 60-85 "no real gain" partly a PLAYER-SKILL effect in the real-side measure? sugg-real.mjs compares the
// raw win rates of the closest real teams. Suggestions lean to the most popular Pokémon (Kingambit, Basculegion...); popular
// teams are run by every kind of player, so their raw win rate can sit near 50% even if the team is better. Here each neighbour
// game counts as (result − chance from the two players' skills), with skills from one joint fit of player skill + each
// Pokémon (additive, ridge) on all games, so a player isn't credited for their team. Same rows, same neighbours, same rules.
// Usage: node experiments/sugg-skill.mjs <rows.json from sugg-real.mjs>
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8')), R = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const teams = MT.teams.map(k => k.split('|')), names = [...new Set(teams.flat())], idx = new Map(names.map((n, i) => [n, i])), T = teams.map(t => t.map(n => idx.get(n)));
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1]), nM = names.length, nP = MT.players, sig = x => 1 / (1 + Math.exp(-x));
// joint fit (same as diminishing.mjs stage 1, all games)
const w = new Float64Array(nM), s = new Float64Array(nP); { const mw = new Float64Array(nM), vw = new Float64Array(nM), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= 300; t++) { const gw = new Float64Array(nM), gs = new Float64Array(nP);
    for (const g of G) { let e = s[g[4]] - s[g[5]]; for (const i of T[g[0]]) e += w[i]; for (const i of T[g[1]]) e -= w[i]; const d = sig(e) - g[2]; for (const i of T[g[0]]) gw[i] += d; for (const i of T[g[1]]) gw[i] -= d; gs[g[4]] += d; gs[g[5]] -= d; }
    const n = G.length, step = (p, gr, m, v, L) => { for (let j = 0; j < p.length; j++) { if (!gr[j] && !p[j]) continue; const q = gr[j] / n + L * p[j] / n; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } };
    step(w, gw, mw, vw, 2); step(s, gs, ms, vs, 1); if (t % 50 === 0) console.error(`fit ${t}/300`); } }
// per team: games, raw wins, and skill-adjusted wins (result − chance from the players' skills alone)
const tg = new Map(); for (const g of G) for (const [t, y, a, b] of [[g[0], g[2], g[4], g[5]], [g[1], 1 - g[2], g[5], g[4]]]) { const o = tg.get(t) || [0, 0, 0]; o[0]++; o[1] += y; o[2] += y - sig(s[a] - s[b]); tg.set(t, o); }
const base = n => n.replace(/-Mega.*$/, ''), bset = teams.map(t => new Set(t.map(base))), exact = new Map(teams.map((t, i) => [t.slice().sort().join('|'), i]));
const hood = (ns, skip) => { const bs = new Set(ns.map(base)); let n = 0, raw = 0, adj = 0; for (let i = 0; i < bset.length; i++) { if (skip.has(i)) continue; let k = 0; for (const b of bs) if (bset[i].has(b)) k++; if (k >= 5) { const o = tg.get(i); if (o) { n += o[0]; raw += o[1]; adj += o[2]; } } } return {n, raw: n ? raw / n : null, adj: n ? adj / n : null}; };
const band = g => g < 60 ? 'under 60' : g < 85 ? '60-85' : '85+', res = {};
for (const r of R) { if (r.err || r.gBase == null) continue; const s1 = r.sugg.find(x => x.rank === 1); if (!s1) continue; let ns = r.names.slice(), ok = true;
  for (const c of s1.ch) { const [o, n] = c.split(' -> '); const i = ns.indexOf(o); if (i < 0) { ok = false; break; } ns[i] = n; } if (!ok) continue;
  const ti = r.ti, sx = exact.get(ns.slice().sort().join('|')), b0 = hood(r.names, new Set([ti])), b1 = hood(ns, new Set(sx != null ? [ti, sx] : [ti])); if (b0.n < 30 || b1.n < 30) continue;
  (res[band(r.gBase)] = res[band(r.gBase)] || []).push({raw: (b1.raw - b0.raw) * 100, adj: (b1.adj - b0.adj) * 100}); }
const boot = d => { let q = 11; const m = []; for (let i = 0; i < 2000; i++) { let t = 0; for (let j = 0; j < d.length; j++) { q = (q * 16807) % 2147483647; t += d[q % d.length]; } m.push(t / d.length); } m.sort((a, b) => a - b); return `${(d.reduce((a, x) => a + x, 0) / d.length).toFixed(1)} (${m[50].toFixed(1)} to ${m[1949].toFixed(1)})`; };
for (const B of ['under 60', '60-85', '85+']) { const d = res[B] || []; console.log(`${B}: ${d.length} teams · raw win rate change ${boot(d.map(x => x.raw))} · skill-adjusted change ${boot(d.map(x => x.adj))}`); }

// spicy-candidates.mjs (HH, Nov 26 night): research for "Spicy picks" (Sim's fun mode). Low-usage Pokémon that still win.
// Reads out/perf.json: tour.rows = [name, usage %, game win %, games]; adj.rows = [name, own share of the win, ...].
// Games from one team are not independent, so the 95% lower bound (Wilson) uses n = games / 3 (an assumption, stated).
import fs from 'fs';
const p = JSON.parse(fs.readFileSync(process.argv[2] || 'out/perf.json', 'utf8')), adj = new Map(p.adj.rows.map(r => [r[0], r]));
const MAXU = +(process.env.MAXU || 5), MING = +(process.env.MING || 300), DEFL = +(process.env.DEFL || 3);
const lo = (w, n) => { const z = 1.96, d = 1 + z * z / n; return ((w + z * z / (2 * n)) - z * Math.sqrt(w * (1 - w) / n + z * z / (4 * n * n))) / d; };
const rows = p.tour.rows.map(([n, u, w, g]) => ({n, u, w, g, lo: lo(w / 100, g / DEFL) * 100, own: adj.get(n) ? adj.get(n)[1] : null}));
const spicy = rows.filter(r => r.u < MAXU && r.g >= MING).sort((a, b) => b.lo - a.lo);
console.log(`${p.tour.label}\nusage under ${MAXU}%, ${MING}+ games, lower bound with n = games/${DEFL}`);
for (const r of spicy) console.log(`${r.lo > 50 ? 'PROVEN ' : r.w > 50 ? 'MAYBE  ' : '       '} ${r.n} | usage ${r.u}% | wins ${r.w}% | ${r.g} games | low ${r.lo.toFixed(1)} | own share ${r.own}`);

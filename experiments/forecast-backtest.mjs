// forecast-backtest.mjs (HH, Nov 26 night): can a weekly "next week's top cut" forecast beat the plain guess "same as last week"?
// Data: data/index.json + data/t2/<id>.json, Reg M-C events with 32+ players, top cut = placing 8 or better (same rule as events.json).
// Share of a Pokémon in a week = top-cut teams with it / all top-cut teams that week. Weeks start Monday 00:00 UTC.
// Forecasts for week k use weeks < k only. Scored on each week's top 30 Pokémon (by the forecast's own week k-1 share, so nothing peeks).
import fs from 'fs'; import path from 'path';
const R = process.argv[2] || '.', MINP = 32, CUT = 8;
const idx = JSON.parse(fs.readFileSync(path.join(R, 'data/index.json'), 'utf8')).tournaments;
const wk = d => { const t = new Date(d), day = (t.getUTCDay() + 6) % 7; const m = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() - day); return new Date(m).toISOString().slice(0, 10); };
const W = new Map(); // week -> {teams, cnt: Map(mon -> n)}
let used = 0;
for (const [id, v] of Object.entries(idx)) { if (v.f !== 'M-C' || !(v.p >= MINP)) continue;
  let d; try { d = JSON.parse(fs.readFileSync(path.join(R, 'data/t2', id + '.json'), 'utf8')); } catch (e) { continue; }
  const top = (d.e || []).filter(x => x.pl != null && x.pl <= CUT && Array.isArray(x.dk) && x.dk.length); if (!top.length) continue; used++;
  const k = wk(v.d); if (!W.has(k)) W.set(k, {teams: 0, ev: 0, cnt: new Map()}); const o = W.get(k); o.ev++;
  for (const x of top) { o.teams++; for (const n of new Set(x.dk.map(m => m.n))) o.cnt.set(n, (o.cnt.get(n) || 0) + 1); } }
const weeks = [...W.keys()].sort(), share = (k, n) => { const o = W.get(k); return o.teams ? (o.cnt.get(n) || 0) / o.teams : 0; };
console.log(`events used ${used}; weeks ${weeks.length}`); for (const k of weeks) console.log(`  ${k}: ${W.get(k).ev} events, ${W.get(k).teams} top-cut teams`);
const MODELS = {
  naive: (h, n) => share(h.at(-1), n),
  mean3: (h, n) => { const s = h.slice(-3); return s.reduce((a, k) => a + share(k, n), 0) / s.length; },
  ewma: (h, n) => { let f = share(h[0], n); for (const k of h.slice(1)) f = .5 * share(k, n) + .5 * f; return f; },
  trend: (h, n) => { const a = share(h.at(-1), n), b = h.length > 1 ? share(h.at(-2), n) : a; return Math.max(0, a + .5 * (a - b)); },
  // damped: the last week pulled a little toward the 3-week mean (a team-sample-size shrink)
  damped: (h, n) => .6 * share(h.at(-1), n) + .4 * MODELS.mean3(h, n),
};
const MINTEAMS = 40, res = Object.fromEntries(Object.keys(MODELS).map(m => [m, {ae: 0, n: 0, wins: 0}])); let tests = 0, dirHit = {}, dirN = {};
for (let i = 2; i < weeks.length; i++) { const k = weeks[i], h = weeks.slice(0, i); if (W.get(k).teams < MINTEAMS || W.get(h.at(-1)).teams < MINTEAMS) continue; tests++;
  const all = new Set(); for (const x of h.slice(-3)) for (const n of W.get(x).cnt.keys()) all.add(n);
  const pool = [...all].sort((a, b) => share(h.at(-1), b) - share(h.at(-1), a)).slice(0, 30);
  const wkErr = {};
  for (const [m, f] of Object.entries(MODELS)) { let e = 0; for (const n of pool) e += Math.abs(f(h, n) - share(k, n)); wkErr[m] = e / pool.length; res[m].ae += e; res[m].n += pool.length;
    // direction: when the model says up/down vs last week by 2+ points, was the real move the same way?
    for (const n of pool) { const d = f(h, n) - share(h.at(-1), n); if (Math.abs(d) < .02) continue; dirN[m] = (dirN[m] || 0) + 1; if (Math.sign(share(k, n) - share(h.at(-1), n)) === Math.sign(d)) dirHit[m] = (dirHit[m] || 0) + 1; } }
  const best = Object.entries(wkErr).sort((a, b) => a[1] - b[1])[0][0]; res[best].wins++;
  console.log(`week ${k}: mean abs error (points) ` + Object.entries(wkErr).map(([m, e]) => `${m} ${(e * 100).toFixed(2)}`).join(' · ')); }
console.log(`\ntested weeks: ${tests} (a week counts only if it and the week before have ${MINTEAMS}+ top-cut teams)`);
for (const [m, r] of Object.entries(res)) console.log(`${m.padEnd(7)} mean abs error ${(r.ae / r.n * 100).toFixed(2)} pts · best in ${r.wins} week(s) · direction calls ${dirHit[m] || 0}/${dirN[m] || 0}`);

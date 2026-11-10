// f3-lanes (Nov 10, focus plan Part 3): how big are the "real problems" a Fix suggestion would point at, measured on real games?
// Every real team sheet in out/matches.json (moves, items, Abilities), every decided tournament game with both sheets known.
// One logistic fit: win ~ player skill (each player, ridge) + each problem on my side minus on theirs, so a strong player's wins
// don't count for their team's habits. Problems:
//   noMega   no Mega Stone on the six
//   prot<=1, prot2, prot4+   how many of the six run Protect or a Protect-like move (3 is the reference, the usual count)
//   scarfTR  a Trick Room setter and a Choice Scarf on the same six
// Reported in win-chance points at an even game (about 25 per logit unit). Ranges: tournaments resampled (100x).
// Can't see: teams our tools build (not in real games), effects smaller than the range, why a team chose the habit.
// Usage: node experiments/lane-fixes.mjs [boots=100]
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8'));
const teams = MT.teams.map(k => k.split('|'));
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1] && g[7] != null && g[8] != null);
const deckTeam = new Map(); for (const g of G) { deckTeam.set(g[7], g[0]); deckTeam.set(g[8], g[1]); }
const sheet = d => { const t = teams[deckTeam.get(d)], by = new Map(t.map(n => [n, {n, mv: [], i: null, a: null}]));
  for (const fi of MT.decks[d] || []) { const f = MT.feats[fi], m = f.match(/^(.+?)([:@#])(.+)$/); if (!m || !by.has(m[1])) continue; const o = by.get(m[1]);
    if (m[2] === ':') o.mv.push(m[3]); else if (m[2] === '@') o.i = m[3]; else o.a = m[3]; }
  return [...by.values()]; };
const PROT = new Set(['Protect', 'Detect', 'Spiky Shield', "King's Shield", 'Baneful Bunker', 'Silk Trap', 'Burning Bulwark', 'Obstruct', 'Max Guard']);
const F = ['noMega', 'prot<=1', 'prot2', 'prot4+', 'scarfTR'];
const feat = new Map(), counts = Object.fromEntries(F.map(f => [f, 0]));
for (const d of deckTeam.keys()) { const s = sheet(d); if (s.length !== 6) continue; const known = s.filter(m => m.mv.length).length; if (known < 6) continue;
  const mega = s.some(m => /-Mega/.test(m.n) || /ite( [XY])?$/.test(m.i || '') && !/Eviolite/.test(m.i || ''));
  const pc = s.filter(m => m.mv.some(x => PROT.has(x))).length, tr = s.some(m => m.mv.includes('Trick Room')), sc = s.some(m => m.i === 'Choice Scarf');
  const v = [mega ? 0 : 1, pc <= 1 ? 1 : 0, pc === 2 ? 1 : 0, pc >= 4 ? 1 : 0, tr && sc ? 1 : 0]; feat.set(d, v); v.forEach((x, i) => counts[F[i]] += x); }
const GS = G.filter(g => feat.has(g[7]) && feat.has(g[8]));
console.log(`# ${feat.size} complete sheets, ${GS.length} games with both sheets complete. Sheets with each problem:`, Object.entries(counts).map(([k, v]) => `${k} ${v} (${(v / feat.size * 100).toFixed(1)}%)`).join(', '));
const nP = MT.players, sig = x => 1 / (1 + Math.exp(-x));
function fit(gs) { const b = new Float64Array(F.length), s = new Float64Array(nP), mb = new Float64Array(F.length), vb = new Float64Array(F.length), ms = new Float64Array(nP), vs = new Float64Array(nP), lr = .05;
  for (let t = 1; t <= 250; t++) { const gb = new Float64Array(F.length), gk = new Float64Array(nP);
    for (const g of gs) { const A = feat.get(g[7]), B = feat.get(g[8]); let e = s[g[4]] - s[g[5]]; for (let i = 0; i < F.length; i++) e += b[i] * (A[i] - B[i]); const d = sig(e) - g[2];
      for (let i = 0; i < F.length; i++) gb[i] += d * (A[i] - B[i]); gk[g[4]] += d; gk[g[5]] -= d; }
    const n = gs.length, st = (p, gr, m, v, L) => { for (let j = 0; j < p.length; j++) { if (!gr[j] && !p[j]) continue; const q = gr[j] / n + L * p[j] / n; m[j] = .9 * m[j] + .1 * q; v[j] = .999 * v[j] + .001 * q * q; p[j] -= lr * (m[j] / (1 - .9 ** t)) / (Math.sqrt(v[j] / (1 - .999 ** t)) + 1e-8); } };
    st(b, gb, mb, vb, .1); st(s, gk, ms, vs, 1); } return b; }
const main = fit(GS), byT = new Map(); for (const g of GS) (byT.get(g[3]) || byT.set(g[3], []).get(g[3])).push(g);
const tours = [...byT.keys()], BOOT = +(process.argv[2] || 100), bs = F.map(() => []); let sd = 7;
for (let r = 0; r < BOOT; r++) { const gs = []; for (let k = 0; k < tours.length; k++) { sd = (sd * 16807) % 2147483647; gs.push(...byT.get(tours[sd % tours.length])); } const b = fit(gs); b.forEach((x, i) => bs[i].push(x)); if ((r + 1) % 20 === 0) console.error(`boot ${r + 1}/${BOOT}`); }
console.log('# effect on my win chance at an even game (points), skill taken out; 95% range by tournament');
F.forEach((f, i) => { const a = bs[i].slice().sort((x, y) => x - y), lo = a[Math.floor(.025 * a.length)], hi = a[Math.floor(.975 * a.length)];
  console.log(`${f.padEnd(9)} ${(main[i] * 25).toFixed(1).padStart(5)} pts (${(lo * 25).toFixed(1)} to ${(hi * 25).toFixed(1)})   sheets ${counts[f]}`); });

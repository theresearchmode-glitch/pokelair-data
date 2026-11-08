// Is the grade's "likely range" honest? (Nov 8, step 5). The model now says how sure each Pokémon's and pair's number is
// (monSd, pairSd: the spread its fit implies). A team's spread is put together from its six Pokémon and 15 pairs. If those
// spreads are right, teams the model is unsure about should miss their later results by more than chance alone, by about
// the amount the spread says. Per team with 15+ later games:  R = wins − expected wins (against the opponents it really met),
// chance part = Σ p(1−p), model part = (Σ p(1−p) · calib · sd)². We fit k² in  E[R²] = chance + k²·model:  k ≈ 1 means the
// spreads are right; k > 1 means the page should widen them by k. Usage: BOARD_MT=… BOARD_CUT=.7 MATCHES=… node experiments/unsure.mjs
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(process.env.MATCHES || OUT + 'matches.json', 'utf8')), MT = JSON.parse(fs.readFileSync(process.env.BOARD_MT || OUT + 'model_train.json', 'utf8'));
const CUTF = +(process.env.BOARD_CUT || .8), teams = M.teams.map(k => k.split('|')), calib = MT.calib, sig = z => 1 / (1 + Math.exp(-z));
const spF = new Map(); for (const f of Object.keys(MT.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
const xOf = (t, d) => { const m = teams[t]; let v = 0; for (const n of m) v += MT.mons[n] || 0;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MT.pairs || {})[k] || 0; }
  if (d == null || !M.decks[d]) return v; const has = new Set(M.decks[d].map(f => M.feats[f]));
  for (const n of m) { let u = 0; for (const f of spF.get(n) || []) u += MT.sets[f] * ((has.has(f) ? 1 : 0) - ((MT.setFreq || {})[f] || 0)); const r = (MT.setRange || {})[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; } return v; };
const sd0 = MT.pairSd0 || .05, monSd0 = Math.max(...Object.values(MT.monSd || {a: .1}));
const sdOf = t => { const m = teams[t]; let v = 0; for (const n of m) v += ((MT.monSd || {})[n] ?? monSd0) ** 2;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += ((MT.pairSd || {})[k] ?? sd0) ** 2; } return Math.sqrt(v); };
const ev = M.events, ord = [...ev.keys()].sort((a, b) => ev[a][1] < ev[b][1] ? -1 : 1), lo = Math.floor(ord.length * CUTF), futE = new Set(ord.slice(lo));
const fut = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && futE.has(g[3]) && teams[g[0]].length === 6 && teams[g[1]].length === 6);
const T = new Map(); for (const g of fut) { const p = sig(calib * (xOf(g[0], g[7]) - xOf(g[1], g[8])));
  for (const [t, y, q] of [[g[0], g[2] === 1 ? 1 : 0, p], [g[1], g[2] === 1 ? 0 : 1, 1 - p]]) { const o = T.get(t) || {n: 0, R: 0, V: 0}; o.n++; o.R += y - q; o.V += q * (1 - q); T.set(t, o); } }
const rows = [...T].filter(([, o]) => o.n >= 15).map(([t, o]) => ({sd: sdOf(t), R2: o.R * o.R, chance: o.V, model: (o.V * calib * sdOf(t)) ** 2, n: o.n}));
const fitK = rs => { const num = rs.reduce((a, r) => a + (r.R2 - r.chance) * r.model, 0), den = rs.reduce((a, r) => a + r.model * r.model, 0); return Math.sqrt(Math.max(0, num / den)); };
console.log(`teams with 15+ later games: ${rows.length} · their spread (model units): median ${rows.map(r => r.sd).sort((a, b) => a - b)[rows.length >> 1].toFixed(3)}`);
console.log(`k (how much to widen the model's spreads so they match later results): ${fitK(rows).toFixed(2)}`);
// by thirds of spread: the unsure third should miss by more
const s = rows.slice().sort((a, b) => a.sd - b.sd), th = Math.floor(s.length / 3);
for (const [nm, part] of [['surest third', s.slice(0, th)], ['middle third', s.slice(th, 2 * th)], ['least sure third', s.slice(2 * th)]]) {
  const ex = part.reduce((a, r) => a + r.R2 - r.chance, 0) / part.reduce((a, r) => a + r.n * r.n, 0);
  console.log(`  ${nm}: spread ${(part.reduce((a, r) => a + r.sd, 0) / part.length).toFixed(3)} · miss beyond chance ${(Math.sqrt(Math.max(0, ex)) * 100).toFixed(1)} pts of win rate · k ${fitK(part).toFixed(2)}`); }

// The page's CURRENT rating formula, run on older games only: Limitless win/pick rates and the win model rebuilt from
// training events, so its score on the newest events is a fair comparison with experiments/rating-fit.mjs.
// Writes a snippet for experiments/ev.mjs: node experiments/rating-clean.mjs > %TEMP%\clean.js; EVFILE=... node experiments/ev.mjs
import fs from 'node:fs';
const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8')), SPL = JSON.parse(fs.readFileSync('out/model_splits.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
const evD = M.events.map(e => e[1]), order = [...evD.keys()].sort((a, b) => evD[a] < evD[b] ? -1 : 1), TF = +(process.env.TEST_FROM || .8), TT = +(process.env.TEST_TO || 1), cut = new Set(order.slice(Math.floor(order.length * TF), Math.floor(order.length * TT))), before = new Set(order.slice(0, Math.floor(order.length * TF)));
const train = G.filter(g => before.has(g[3]));
const ent = new Map(), w = new Map(), n = new Map();
for (const [A, B, r, ev, pa, pb] of train) for (const [t, p, won] of [[A, pa, r], [B, pb, 1 - r]]) { ent.set(ev + '|' + p, t); for (const m of teams[t]) { n.set(m, (n.get(m) || 0) + 1); w.set(m, (w.get(m) || 0) + won); } }
const cnt = new Map(); for (const t of ent.values()) for (const m of teams[t]) cnt.set(m, (cnt.get(m) || 0) + 1);
const tour = {}; for (const [m, k] of n) tour[m] = [+(100 * (cnt.get(m) || 0) / ent.size).toFixed(3), +(100 * (w.get(m) || 0) / k).toFixed(2), k];
const KEEP_ADJ = process.env.KEEP_ADJ === '1';
process.stdout.write(`(() => { const PD = Object.assign({}, activePerf()); PD.doubles = ${JSON.stringify(tour)}; ${KEEP_ADJ ? '' : 'PD.adj = {};'}
  perfCache = {key: metaVersion, val: PD}; META.model = Object.assign({}, META.model, {mons: ${JSON.stringify(SPL.train)}}); ratingCache = {key: null, map: null};
  const out = {}; for (const p of ROSTER) out[p.n] = {total: rating(p).total}; return out; })()`);

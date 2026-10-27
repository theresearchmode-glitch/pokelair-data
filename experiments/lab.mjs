// Model lab: tries changes to the win model on the same data and the same splits as model.mjs, without writing
// out/model.json. Every choice is made on the validation slice (latest 15% of training events); the held-out test
// events (latest 20%) are scored only for the final report, so the comparison with the shipped model stays honest.
// Usage: node experiments/lab.mjs [config names...]   (no names = run all)
import fs from 'node:fs';
const M = JSON.parse(fs.readFileSync('out/matches.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
const monIx = new Map(), mons = [];
teams.flat().forEach(n => { if (!monIx.has(n)) { monIx.set(n, mons.length); mons.push(n); } });
const pc = new Map(), seen = new Set();
for (const g of G) for (const t of [g[0], g[1]]) { if (seen.has(t)) continue; seen.add(t); const m = teams[t];
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] + '|' + m[j]; pc.set(k, (pc.get(k) || 0) + 1); } }
const pairIx = new Map([...pc].filter(([, n]) => n >= 30).map(([k], i) => [k, i])), pairs = [...pairIx.keys()];
const tf = teams.map(m => { const f = m.map(n => monIx.get(n)), p = [];
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const q = pairIx.get(m[i] + '|' + m[j]); if (q != null) p.push(q); } return {f, p}; });
// set features, exactly as model.mjs
let setNames = [], deckF = [];
{ const cnt = new Map(), used = new Set(); for (const g of G) { used.add(g[7]); used.add(g[8]); }
  for (const d of used) if (d != null) for (const f of M.decks[d]) cnt.set(f, (cnt.get(f) || 0) + 1);
  const keep = new Map([...cnt].filter(([, n]) => n >= 40).map(([f], i) => [f, i])); setNames = [...keep.keys()].map(f => M.feats[f]);
  deckF = M.decks.map(fs_ => fs_.map(f => keep.get(f)).filter(j => j != null)); }
const featSp = setNames.map(f => f.split(/[@:]/)[0]), spFeats = new Map(), freq = new Float64Array(setNames.length);
{ const spDecks = new Map(), fd = new Float64Array(setNames.length), used = new Set(); for (const g of G) { used.add(g[7]); used.add(g[8]); }
  for (const d of used) { if (d == null) continue; for (const sp of new Set(M.decks[d].map(f => M.feats[f].split(/[@:]/)[0]))) spDecks.set(sp, (spDecks.get(sp) || 0) + 1); for (const j of deckF[d]) fd[j]++; }
  setNames.forEach((f, j) => { freq[j] = fd[j] / (spDecks.get(featSp[j]) || 1); if (!spFeats.has(featSp[j])) spFeats.set(featSp[j], []); spFeats.get(featSp[j]).push(j); }); }
// team basics read from each real deck: the moves every member actually ran
const MV = JSON.parse(fs.readFileSync('app/src/data/data.js', 'utf8').match(/const MOVES=(\[[\s\S]*?\]);/)[1]);
const SPREAD = new Set(MV.filter(m => m[5] && m[2] > 0).map(m => m[0]));
const HAS = {tw: ['Tailwind'], tr: ['Trick Room'], drop: ['Icy Wind', 'Electroweb', 'Bulldoze', 'Scary Face', 'String Shot', 'Rock Tomb'], fake: ['Fake Out'], redir: ['Follow Me', 'Rage Powder'], guard: ['Wide Guard', 'Quick Guard'], screens: ['Reflect', 'Light Screen', 'Aurora Veil']};
const STRUCT = ['speed', 'tw', 'tr', 'drop', 'fake', 'redir', 'support', 'spread2', 'mega0', 'mega2', 'guard', 'screens'];
const structCache = new Map();
function structOf(t, d) { const key = t + ',' + d; if (structCache.has(key)) return structCache.get(key);
  const v = new Float64Array(STRUCT.length); if (d == null) { structCache.set(key, null); return null; }
  const fe = M.decks[d].map(f => M.feats[f]), mvBy = new Map(); for (const f of fe) { const i = f.indexOf(':'); if (i < 0) continue; const n = f.slice(0, i); if (!mvBy.has(n)) mvBy.set(n, new Set()); mvBy.get(n).add(f.slice(i + 1)); }
  const any = list => [...mvBy.values()].some(s => list.some(x => s.has(x)));
  const tw = any(HAS.tw), tr = any(HAS.tr), drop = any(HAS.drop), fake = any(HAS.fake), redir = any(HAS.redir);
  const spreadUsers = [...mvBy.values()].filter(s => [...s].some(x => SPREAD.has(x))).length, megas = teams[t].filter(n => /-Mega/.test(n)).length;
  const val = {speed: tw || tr, tw, tr, drop, fake, redir, support: fake || redir, spread2: spreadUsers >= 2, mega0: megas === 0, mega2: megas >= 2, guard: any(HAS.guard), screens: any(HAS.screens)};
  STRUCT.forEach((k, i) => v[i] = val[k] ? 1 : 0); structCache.set(key, v); return v; }
const nP = M.players, evDates = M.events.map(e => e[1]);
const order = [...evDates.keys()].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1), cut = new Set(order.slice(Math.floor(order.length * .8)));
const train = G.filter(g => !cut.has(g[3])), test = G.filter(g => cut.has(g[3]));
const trEv = [...new Set(train.map(g => g[3]))].sort((a, b) => evDates[a] < evDates[b] ? -1 : 1), vcut = new Set(trEv.slice(Math.floor(trEv.length * .85)));
const fitPart = train.filter(g => !vcut.has(g[3])), val = train.filter(g => vcut.has(g[3]));
const day = s => new Date(s + 'T00:00:00Z').getTime() / 864e5;
function fit(games, opt) { const {useSkill = true, usePairs = true, useSets = false, useStruct = false, iters = 250, lb = 40, lp = 150, ls = 15, lc = 60, lt = 20, half = 0, lr = .03, structKeys = null} = opt || {};
  const mk = STRUCT.map(k => !structKeys || structKeys.includes(k) ? 1 : 0);
  const b = new Float64Array(mons.length), q = new Float64Array(pairs.length), s = new Float64Array(nP), c = new Float64Array(setNames.length), z = new Float64Array(STRUCT.length);
  const P = [b, q, s, c, z], Mm = P.map(a => new Float64Array(a.length)), V = P.map(a => new Float64Array(a.length)), L = [lb, lp, ls, lc, lt];
  // recency: a game's weight halves every `half` days before the newest game in this fit (0 = all games equal)
  const last = Math.max(...games.map(g => day(evDates[g[3]]))), W = games.map(g => half ? Math.pow(.5, (last - day(evDates[g[3]])) / half) : 1), Wsum = W.reduce((a, x) => a + x, 0), Wn = games.length / Wsum;
  const dv = new Map(), deckVec = (t, d) => { if (!useSets || d == null) return []; const key = t * 100000 + d; let v = dv.get(key); if (v) return v; v = []; const has = new Set(deckF[d]);
    for (const n of teams[t]) for (const j of (spFeats.get(n) || [])) v.push([j, (has.has(j) ? 1 : 0) - freq[j]]); dv.set(key, v); return v; };
  const x = (t, d) => { let v = 0; for (const j of tf[t].f) v += b[j]; if (usePairs) for (const j of tf[t].p) v += q[j]; for (const [j, w] of deckVec(t, d)) v += c[j] * w;
    if (useStruct) { const sv = structOf(t, d); if (sv) for (let k = 0; k < sv.length; k++) v += z[k] * sv[k] * mk[k]; } return v; };
  for (let it = 1; it <= iters; it++) { const Gr = P.map(a => new Float64Array(a.length));
    for (let gi = 0; gi < games.length; gi++) { const [A, B, r, , pa, pb, , dA, dB] = games[gi]; const eta = x(A, dA) - x(B, dB) + (useSkill ? s[pa] - s[pb] : 0), d = (1 / (1 + Math.exp(-eta)) - r) * W[gi] * Wn;
      for (const j of tf[A].f) Gr[0][j] += d; for (const j of tf[B].f) Gr[0][j] -= d;
      if (usePairs) { for (const j of tf[A].p) Gr[1][j] += d; for (const j of tf[B].p) Gr[1][j] -= d; }
      if (useSkill) { Gr[2][pa] += d; Gr[2][pb] -= d; }
      for (const [j, w] of deckVec(A, dA)) Gr[3][j] += d * w; for (const [j, w] of deckVec(B, dB)) Gr[3][j] -= d * w;
      if (useStruct) { const sa = structOf(A, dA), sb = structOf(B, dB); for (let k = 0; k < STRUCT.length; k++) Gr[4][k] += d * mk[k] * ((sa ? sa[k] : 0) - (sb ? sb[k] : 0)); } }
    const c1 = 1 - .9 ** it, c2 = 1 - .999 ** it;
    for (let k = 0; k < 5; k++) { const a = P[k], g = Gr[k], m = Mm[k], v = V[k];
      for (let j = 0; j < a.length; j++) { const gg = g[j] + 2 * L[k] * a[j]; m[j] = .9 * m[j] + .1 * gg; v[j] = .999 * v[j] + .001 * gg * gg; a[j] -= lr * (m[j] / c1) / (Math.sqrt(v[j] / c2) + 1e-8); } } }
  return {b, q, s, c, z, x}; }
function score(model, games) { let ll = 0, acc = 0;
  for (const [A, B, r, , , , , dA, dB] of games) { const p = 1 / (1 + Math.exp(-(model.x(A, dA) - model.x(B, dB)))); ll -= r * Math.log(p) + (1 - r) * Math.log(1 - p); acc += (p > .5) === (r === 1) ? 1 : 0; }
  return {ll: +(ll / games.length).toFixed(4), acc: +(acc / games.length).toFixed(4)}; }
// every config: the shipped model's settings (shrink k=10) plus one change at a time, then combinations
const BASE = {lb: 40, lp: 150, ls: 15};
const CONFIGS = {
  base: {...BASE}, iters600: {...BASE, iters: 600},
  half14: {...BASE, half: 14}, half21: {...BASE, half: 21}, half35: {...BASE, half: 35},
  struct5: {...BASE, useStruct: true, lt: 5}, struct20: {...BASE, useStruct: true, lt: 20}, struct80: {...BASE, useStruct: true, lt: 80},
  sets200: {...BASE, useSets: true, lc: 200}, sets600: {...BASE, useSets: true, lc: 600}, sets2000: {...BASE, useSets: true, lc: 2000},
  // combinations
  h21mega: {...BASE, half: 21, useStruct: true, lt: 5, structKeys: ['mega0', 'mega2']},
  h21struct: {...BASE, half: 21, useStruct: true, lt: 20},
  h21sets600: {...BASE, half: 21, useSets: true, lc: 600},
  h21sets600mega: {...BASE, half: 21, useSets: true, lc: 600, useStruct: true, lt: 5, structKeys: ['mega0', 'mega2']},
  h14sets600mega: {...BASE, half: 14, useSets: true, lc: 600, useStruct: true, lt: 5, structKeys: ['mega0', 'mega2']},
  h21sets2000mega: {...BASE, half: 21, useSets: true, lc: 2000, useStruct: true, lt: 5, structKeys: ['mega0', 'mega2']},
  h21sets20: {...BASE, half: 21, useSets: true, lc: 20}, h14sets60: {...BASE, half: 14, useSets: true, lc: 60}, h30sets60: {...BASE, half: 30, useSets: true, lc: 60},
  h21sets200: {...BASE, half: 21, useSets: true, lc: 200}, h21sets60: {...BASE, half: 21, useSets: true, lc: 60}, h14sets200: {...BASE, half: 14, useSets: true, lc: 200},
};
const want = process.argv.slice(2), out = {};
for (const [name, cfg] of Object.entries(CONFIGS)) { if (want.length && !want.includes(name)) continue;
  const t0 = Date.now(), m = fit(fitPart, cfg), v = score(m, val); out[name] = {val: v, secs: Math.round((Date.now() - t0) / 1000)};
  if (cfg.useStruct) out[name].struct = Object.fromEntries(STRUCT.map((k, i) => [k, +m.z[i].toFixed(3)]));
  console.log(name, JSON.stringify(out[name])); }
// FINAL=name1,name2 scores those configs (trained on all training events) on the held-out test events
if (process.env.FINAL) for (const name of process.env.FINAL.split(',')) { const cfg = name.startsWith('{') ? JSON.parse(name) : CONFIGS[name];
  const m = fit(train, cfg), t = score(m, test); console.log('TEST', name, JSON.stringify(t), cfg.useStruct ? JSON.stringify(Object.fromEntries(STRUCT.map((k, i) => [k, +m.z[i].toFixed(3)]))) : '');
  // exact log-loss, and the log-loss after the same calibration slope model.mjs fits (what the page actually uses)
  const pts = test.map(([A, B, r, , , , , dA, dB]) => [m.x(A, dA) - m.x(B, dB), r]); let w = 1;
  for (let k = 0; k < 30; k++) { let g = 0, h = 0; for (const [e, r] of pts) { const p = 1 / (1 + Math.exp(-w * e)); g += (p - r) * e; h += p * (1 - p) * e * e; } w -= g / (h || 1); }
  const ll = s => pts.reduce((a, [e, r]) => { const p = 1 / (1 + Math.exp(-s * e)); return a - (r * Math.log(p) + (1 - r) * Math.log(1 - p)); }, 0) / pts.length;
  // a second, independent check: accuracy within each held-out event, so one big event can't carry the result
  const byEv = new Map(); for (const g of test) { const p = 1 / (1 + Math.exp(-(m.x(g[0], g[7]) - m.x(g[1], g[8])))); const e = byEv.get(g[3]) || [0, 0]; e[0] += (p > .5) === (g[2] === 1) ? 1 : 0; e[1]++; byEv.set(g[3], e); }
  const evAcc = [...byEv.values()].map(([a, n]) => a / n);
  console.log('  exact ll', ll(1).toFixed(5), '| calibrated ll', ll(w).toFixed(5), 'slope', w.toFixed(3), '| events where it beats 50%:', evAcc.filter(x => x > .5).length + '/' + evAcc.length); }

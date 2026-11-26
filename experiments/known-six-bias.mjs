// Why are well-known sixes over-rated? Measurement only (Nov 25). Reads WORK/capture.json (experiments/known-six-capture.mjs) and the
// per-window cut files + models in NEW_WORK (experiments/whytest-recheck.mjs).
// 1. Bias by the six's own prior games (games of that exact six in the window's training file): 0, 1-29, 30-99, 100-299, 300+.
//    said = the page's win chance against the field (e = fieldWin(y)), won = real win rate, gap = said - won; also the game-level chance
//    P = sig(calib·(y_A − y_B)) against the real opponent (cause c). 95% event-clustered bootstrap CIs. Best-of-1 and best-of-3,
//    dev (events before experiments/sealed.json 'from') and sealed, separately. Under 300 results = unknown.
// 2. Causes, one at a time, by re-fitting the six's own record (six.mjs's maths, copied here with options) and re-scoring
//    y' = x + mu + share·δ' (x, mu, share from the page):
//    (a) stale records: the record's games weighted by recency (half-life 14 / 30 days);
//    (b) selection: gap for sixes with 30+ prior games by the win rate of their first 20 games;
//    (c) who they meet: the game-level P gap next to the field gap;
//    (d) shrink: τ .05, .03 and no record at all (six.mjs ships τ .1).
// 3. A variant counts only if, tuned on dev, it narrows the 100+ gap on sealed (checked once) without a worse game log-loss.
// Usage: NEW_WORK=<dir> WORK=<dir> node experiments/known-six-bias.mjs
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, WORK = process.env.WORK.replace(/\/?$/, '/'), NEW = process.env.NEW_WORK.replace(/\/?$/, '/');
const C = JSON.parse(fs.readFileSync(WORK + 'capture.json', 'utf8')), M0 = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8'));
const SEAL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from, evDates = M0.events.map(e => e[1]), MIN_N = 300;
const sig = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z)))), day = s => new Date(s + 'T00:00:00Z').getTime() / 864e5;
// six.mjs's fit (TAU .1, SIG_S .6, 300 steps, 10+ games), with a recency half-life option (0 = off, as six.mjs)
function fitSix(MF, MD, {tau = .1, half = 0, minG = 10} = {}) {
  const M = MF, teams = M.teams.map(k => k.split('|')), calib = MD.calib;
  const spF = new Map(); for (const f of Object.keys(MD.sets || {})) { const sp = f.split(/[@:#]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
  const xOf = (t, d) => { const m = teams[t]; let v = 0; for (const n of m) v += MD.mons[n] || 0;
    for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += (MD.pairs || {})[k] || 0; }
    if (d == null || !M.decks || !M.decks[d]) return v; const has = new Set(M.decks[d].map(f => M.feats[f]));
    for (const n of m) { let u = 0; for (const f of spF.get(n) || []) u += MD.sets[f] * ((has.has(f) ? 1 : 0) - ((MD.setFreq || {})[f] || 0)); const r = (MD.setRange || {})[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; }
    return v; };
  const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6), X = G.map(g => [xOf(g[0], g[7]), xOf(g[1], g[8])]);
  const ed = M.events.map(e => day(e[1])), last = Math.max(...G.map(g => ed[g[3]])), W = G.map(g => half ? Math.pow(.5, (last - ed[g[3]]) / half) : 1), Wn = G.length / W.reduce((a, x) => a + x, 0);
  const s = new Float64Array(M.players), dl = new Float64Array(M.teams.length), ms = new Float64Array(M.players), vs = new Float64Array(M.players), md = new Float64Array(M.teams.length), vd = new Float64Array(M.teams.length), gs = new Float64Array(M.players), gd = new Float64Array(M.teams.length);
  const lr = .05, b1 = .9, b2 = .999, SIG_S = .6;
  for (let it = 1; it <= 300; it++) { gs.fill(0); gd.fill(0);
    G.forEach((g, i) => { const eta = calib * (X[i][0] + dl[g[0]] - X[i][1] - dl[g[1]]) + s[g[4]] - s[g[5]], e = ((g[2] === 1 ? 1 : 0) - 1 / (1 + Math.exp(-eta))) * W[i] * Wn; gs[g[4]] += e; gs[g[5]] -= e; gd[g[0]] += calib * e; gd[g[1]] -= calib * e; });
    for (let j = 0; j < s.length; j++) { const gr = gs[j] - s[j] / (SIG_S * SIG_S); ms[j] = b1 * ms[j] + (1 - b1) * gr; vs[j] = b2 * vs[j] + (1 - b2) * gr * gr; s[j] += lr * (ms[j] / (1 - b1 ** it)) / (Math.sqrt(vs[j] / (1 - b2 ** it)) + 1e-8); }
    if (tau > 0) for (let j = 0; j < dl.length; j++) { const gr = gd[j] - dl[j] / (tau * tau); md[j] = b1 * md[j] + (1 - b1) * gr; vd[j] = b2 * vd[j] + (1 - b2) * gr * gr; dl[j] += lr * (md[j] / (1 - b1 ** it)) / (Math.sqrt(vd[j] / (1 - b2 ** it)) + 1e-8); } }
  const per = new Map(), ng = new Map(); for (const g of G) { ng.set(g[0], (ng.get(g[0]) || 0) + 1); ng.set(g[1], (ng.get(g[1]) || 0) + 1); }
  for (const [t, n] of ng) { const k = teams[t].slice().sort().join('|'), o = per.get(k) || {g: 0, d: 0}; o.g += n; o.d += dl[t] * n; per.set(k, o); }
  const out = new Map(); for (const [k, o] of per) if (o.g >= minG) out.set(k, +(o.d / o.g).toFixed(4)); return out; }
// prior games and first-20 win rate per six, from the window's training file
function priors(MF) { const teams = MF.teams.map(k => k.split('|')), ed = MF.events.map(e => e[1]), by = new Map();
  MF.m.forEach((g, i) => { if (g[2] === .5 || g[0] === g[1]) return; for (const [t, w] of [[g[0], g[2]], [g[1], 1 - g[2]]]) { const k = teams[t].slice().sort().join('|'); if (!by.has(k)) by.set(k, []); by.get(k).push([ed[g[3]], i, w]); } });
  const out = new Map(); for (const [k, a] of by) { a.sort((p, q) => p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : p[1] - q[1]); out.set(k, {n: a.length, f20: a.length >= 20 ? a.slice(0, 20).reduce((s, x) => s + x[2], 0) / 20 : null}); } return out; }
const VARS = {base: {tau: .1}, 'no record': {tau: 0}, 'tau .05': {tau: .05}, 'tau .03': {tau: .03}, 'recency 14d': {tau: .1, half: 14}, 'recency 30d': {tau: .1, half: 30}, 'tau .05 + recency 30d': {tau: .05, half: 30}};
const rows = []; let sanity = 0, sanN = 0;
for (const w of C.windows) {
  const MF = JSON.parse(fs.readFileSync(NEW + `matches-${w.from}.json`, 'utf8')), MD = JSON.parse(fs.readFileSync(NEW + `model-${w.from}.json`, 'utf8')), PR = priors(MF);
  const D = {}; for (const [v, o] of Object.entries(VARS)) D[v] = fitSix(MF, MD, o);
  // sanity: the base re-fit reproduces the shipped records (model.sixes, before the page's size guard)
  for (const [k, v] of D.base) if (MD.sixes && MD.sixes[k]) { sanN++; sanity = Math.max(sanity, Math.abs(MD.sixes[k][0] - v)); }
  const fw = y => w.q.reduce((a, v) => a + sig(w.calib * (y - v)), 0) / w.q.length;
  const yOf = (sh, v) => sh.x + sh.mu + sh.share * (D[v].get(sh.key) || 0);
  for (const [ia, ib, r, ev, mode] of w.games) { const A = w.sheets[ia], B = w.sheets[ib]; if (!A || !B) continue;
    for (const [S, O, won] of [[A, B, r], [B, A, 1 - r]]) { const pr = PR.get(S.key) || {n: 0, f20: null}, o = {ev: w.from + ':' + ev, mode, sealed: evDates[ev] >= SEAL, won, n: pr.n, f20: pr.f20, pageY: S.y, pageE: S.e, v: {}};
      for (const v of Object.keys(VARS)) { const y = yOf(S, v), yo = yOf(O, v); o.v[v] = [fw(y), sig(w.calib * (y - yo))]; }
      rows.push(o); } }
  console.log(`  [${w.from}] ${w.games.length} games; record re-fit vs shipped: ${D.base.size} sixes`);
}
// check: the page's own y and e are reproduced by the base variant with the page's own record (share·six.d); and base re-fit ≈ shipped
let dy = 0; for (const w of C.windows) for (const s of w.sheets) if (s) dy = Math.max(dy, Math.abs(s.x + s.mu + s.d - s.y));
const out = [], say = s => { out.push(s); console.log(s); };
say(`checks: max |x + mu + d - page y| = ${dy.toExponential(2)}; base re-fit vs shipped six records: max |diff| ${sanity.toFixed(4)} over ${sanN} sixes`);
const boot = (R, stat, B = 1000) => { const evs = [...new Set(R.map(r => r.ev))], by = new Map(evs.map(e => [e, []])); for (const r of R) by.get(r.ev).push(r);
  let st = 42; const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; }, v = [];
  for (let i = 0; i < B; i++) { const s = []; for (let j = 0; j < evs.length; j++) { const a = by.get(evs[Math.floor(rnd() * evs.length)]); for (const x of a) s.push(x); } const x = stat(s); if (x != null && isFinite(x)) v.push(x); }
  v.sort((p, q) => p - q); return [v[Math.floor(.025 * v.length)], v[Math.floor(.975 * v.length)]]; };
const pc = x => x == null || !isFinite(x) ? '-' : (100 * x).toFixed(1), mean = (R, f) => R.reduce((a, r) => a + f(r), 0) / R.length;
const gapE = (R, v) => mean(R, r => r.v[v][0] - r.won), gapP = (R, v) => mean(R, r => r.v[v][1] - r.won);
const llP = (R, v) => mean(R, r => { const p = Math.min(1 - 1e-9, Math.max(1e-9, r.v[v][1])); return -(r.won ? Math.log(p) : Math.log(1 - p)); });
const BINS = [['0', r => r.n === 0], ['1-29', r => r.n >= 1 && r.n < 30], ['30-99', r => r.n >= 30 && r.n < 100], ['100-299', r => r.n >= 100 && r.n < 300], ['300+', r => r.n >= 300]];
const PARTS = [['single games (best-of-1)', r => r.mode === 'bo1'], ['best-of-3 rounds', r => r.mode === 'bo3']], SPL = [['dev', r => !r.sealed], ['sealed', r => r.sealed]];
const binLine = (R, v, label) => { if (R.length < MIN_N) return `    ${label.padEnd(8)} n=${String(R.length).padStart(5)}  unknown (under ${MIN_N})${R.length ? `  [said ${pc(mean(R, r => r.v[v][0]))}% won ${pc(mean(R, r => r.won))}%]` : ''}`;
  const ce = boot(R, s => gapE(s, v)), cp = boot(R, s => gapP(s, v));
  return `    ${label.padEnd(8)} n=${String(R.length).padStart(5)}  said ${pc(mean(R, r => r.v[v][0]))}% won ${pc(mean(R, r => r.won))}%  field gap ${pc(gapE(R, v))} [${pc(ce[0])}, ${pc(ce[1])}]  |  game P said ${pc(mean(R, r => r.v[v][1]))}%  game gap ${pc(gapP(R, v))} [${pc(cp[0])}, ${pc(cp[1])}]`; };
say('\n=== 1. BIAS BY THE SIX\'S OWN PRIOR GAMES (the page as it is: base record, τ .1) ===');
for (const [pl, pf] of PARTS) for (const [sl, sf] of SPL) { const R = rows.filter(r => pf(r) && sf(r)); say(`  ${pl}, ${sl}: ${R.length} team results`); for (const [bl, bf] of BINS) say(binLine(R.filter(bf), 'base', bl)); }
say('\n=== 2b. SELECTION: sixes with 30+ prior games, by the win rate of their first 20 games (base) ===');
for (const [pl, pf] of PARTS) for (const [sl, sf] of SPL) { const R = rows.filter(r => pf(r) && sf(r) && r.n >= 30 && r.f20 != null); say(`  ${pl}, ${sl}: ${R.length} team results`);
  for (const [bl, bf] of [['first20 <50%', r => r.f20 < .5], ['50-59%', r => r.f20 >= .5 && r.f20 < .6], ['60%+', r => r.f20 >= .6]]) say(binLine(R.filter(bf), 'base', bl)); }
say('\n=== 2a/2d. RE-FITTED RECORDS: gap for sixes with 100+ prior games, and game log-loss on all results (lower is better) ===');
const known = r => r.n >= 100;
for (const [pl, pf] of PARTS) for (const [sl, sf] of SPL) { const R = rows.filter(r => pf(r) && sf(r)), K = R.filter(known); say(`  ${pl}, ${sl}: ${K.length} results of 100+ sixes, ${R.length} results in all`);
  for (const v of Object.keys(VARS)) { const d = v === 'base' ? null : boot(R, s => llP(s, v) - llP(s, 'base'));
    say(`    ${v.padEnd(22)} 100+ field gap ${pc(gapE(K, v))}  game gap ${pc(gapP(K, v))}${K.length >= MIN_N ? ` [${pc(boot(K, s => gapP(s, v))[0])}, ${pc(boot(K, s => gapP(s, v))[1])}]` : ' (unknown)'}  ·  game log-loss ${llP(R, v).toFixed(5)}${d ? ` (minus base ${(llP(R, v) - llP(R, 'base')).toFixed(5)} [${d[0].toFixed(5)}, ${d[1].toFixed(5)}])` : ''}`); } }
// 3. pick on dev (best-of-3 and best-of-1 pooled dev; the variant with the smallest |100+ game gap| whose dev log-loss CI upper bound is <= 0 vs base), check once on sealed
say('\n=== 3. PICKED ON DEV, CHECKED ONCE ON SEALED ===');
const dev = rows.filter(r => !r.sealed), sea = rows.filter(r => r.sealed);
const cand = Object.keys(VARS).filter(v => v !== 'base').map(v => ({v, gap: Math.abs(gapP(dev.filter(known), v)), ll: boot(dev, s => llP(s, v) - llP(s, 'base'))})).filter(c => c.ll[1] <= 0).sort((a, b) => a.gap - b.gap);
say(`  dev candidates (log-loss not worse than base, CI upper bound <= 0): ${cand.map(c => `${c.v} (100+ |game gap| ${pc(c.gap)})`).join('; ') || 'none'}; base 100+ |game gap| ${pc(Math.abs(gapP(dev.filter(known), 'base')))}`);
if (cand.length && cand[0].gap < Math.abs(gapP(dev.filter(known), 'base'))) { const v = cand[0].v, K = sea.filter(known), b = Math.abs(gapP(K, 'base')), n = Math.abs(gapP(K, v));
  const dg = boot(K, s => Math.abs(gapP(s, v)) - Math.abs(gapP(s, 'base'))), dl = boot(sea, s => llP(s, v) - llP(s, 'base'));
  say(`  picked: ${v}. Sealed, once: 100+ game gap base ${pc(gapP(K, 'base'))} -> ${pc(gapP(K, v))} (|gap| change ${pc(n - b)} [${pc(dg[0])}, ${pc(dg[1])}]); game log-loss ${llP(sea, 'base').toFixed(5)} -> ${llP(sea, v).toFixed(5)} (diff ${(llP(sea, v) - llP(sea, 'base')).toFixed(5)} [${dl[0].toFixed(5)}, ${dl[1].toFixed(5)}])`);
} else say('  nothing picked: no variant narrows the dev 100+ gap without a worse dev log-loss');
fs.writeFileSync(WORK + 'result.txt', out.join('\n') + '\n');

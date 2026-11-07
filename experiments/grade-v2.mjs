// Grade v2 experiment (Nov 7, Sim approved: "Grade = how often this six should win; Matchups = what beats it").
// The new grade is one number: how strong this exact six is, as a win chance against the real tournament field.
//   strength = x (the real-games team model: species, pairs, sets; player skill already taken out)
//            + δ (this exact six's own record, read after taking out its players' skill and its opponents' strength,
//                 shrunk toward 0 so a few games barely move it and hundreds of games move it a lot)
// Honest set-up, as in experiments/grade-check.mjs: everything is learned from events before the 80% date cut
// (out/model_train.json was trained on those only), and scored on the later games. The later games are split in two by date:
// how much to trust a team's own record (τ) is chosen on one half and scored on the other, both ways round.
// Compared with: today's site grade (parts saved by grade-check.mjs, GRADE_CHECK_COMP), team strength alone, and team
// strength plus the raw record (no skill taken out).
// Usage: node experiments/grade-v2.mjs [grade-comp.json]       (read-only; GRADE_V2_OUT=file saves the numbers)
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/';
const M = JSON.parse(fs.readFileSync(OUT + 'matches.json', 'utf8')), MT = JSON.parse(fs.readFileSync(OUT + 'model_train.json', 'utf8'));
const comp = process.argv[2] && fs.existsSync(process.argv[2]) ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : null;
const teams = M.teams.map(k => k.split('|')), calib = MT.calib;
// ---- x(team, deck): the model's team strength, as the page computes it (species + pairs + each member's sets, clamped)
const spF = new Map(); for (const f of Object.keys(MT.sets)) { const sp = f.split(/[@:]/)[0]; if (!spF.has(sp)) spF.set(sp, []); spF.get(sp).push(f); }
const xOf = (t, d) => { const m = teams[t]; let v = 0; for (const n of m) v += MT.mons[n] || 0;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const k = m[i] < m[j] ? m[i] + '|' + m[j] : m[j] + '|' + m[i]; v += MT.pairs[k] || 0; }
  if (d == null || !M.decks || !M.decks[d]) return v; const has = new Set(M.decks[d].map(f => M.feats[f]));
  for (const n of m) { let u = 0; for (const f of spF.get(n) || []) u += MT.sets[f] * ((has.has(f) ? 1 : 0) - (MT.setFreq[f] || 0)); const r = MT.setRange[n]; v += r ? Math.max(r[0], Math.min(r[1], u)) : u; }
  return v; };
// ---- the date split (the same as grade-check.mjs)
const ev = M.events, ord = [...ev.keys()].sort((a, b) => ev[a][1] < ev[b][1] ? -1 : 1), lo = Math.floor(ord.length * .8);
const futOrd = ord.slice(lo), half = new Map(futOrd.map((e, i) => [e, i < futOrd.length / 2 ? 'A' : 'B']));
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]), past = G.filter(g => !half.has(g[3])), fut = {A: G.filter(g => half.get(g[3]) === 'A'), B: G.filter(g => half.get(g[3]) === 'B')};
const cutDate = ev[ord[lo]][1];
// ---- fit on past games: each player's skill s and each six's own deviation δ, with the model's x held fixed
//   P(A wins) = σ( calib·(xA + δA − xB − δB) + sA − sB ),  ridge: s ~ N(0, σs²), δ ~ N(0, τ²)
const pastX = past.map(g => [xOf(g[0], g[7]), xOf(g[1], g[8])]);
function fit(tau, sigS = .6, iters = 300) {
  const s = new Float64Array(M.players), dl = new Float64Array(M.teams.length), ms = new Float64Array(M.players), vs = new Float64Array(M.players), md = new Float64Array(M.teams.length), vd = new Float64Array(M.teams.length);
  const gs = new Float64Array(M.players), gd = new Float64Array(M.teams.length), lr = .05, b1 = .9, b2 = .999;
  for (let it = 1; it <= iters; it++) { gs.fill(0); gd.fill(0);
    past.forEach((g, i) => { const [xa, xb] = pastX[i], eta = calib * (xa + dl[g[0]] - xb - dl[g[1]]) + s[g[4]] - s[g[5]], p = 1 / (1 + Math.exp(-eta)), e = (g[2] === 1 ? 1 : 0) - p;
      gs[g[4]] += e; gs[g[5]] -= e; gd[g[0]] += calib * e; gd[g[1]] -= calib * e; });
    for (let j = 0; j < s.length; j++) { const gr = gs[j] - s[j] / (sigS * sigS); ms[j] = b1 * ms[j] + (1 - b1) * gr; vs[j] = b2 * vs[j] + (1 - b2) * gr * gr; s[j] += lr * (ms[j] / (1 - b1 ** it)) / (Math.sqrt(vs[j] / (1 - b2 ** it)) + 1e-8); }
    for (let j = 0; j < dl.length; j++) { const gr = gd[j] - dl[j] / (tau * tau); md[j] = b1 * md[j] + (1 - b1) * gr; vd[j] = b2 * vd[j] + (1 - b2) * gr * gr; dl[j] += lr * (md[j] / (1 - b1 ** it)) / (Math.sqrt(vd[j] / (1 - b2 ** it)) + 1e-8); } }
  return {s, dl}; }
// raw record (no skill taken out), as today's grade reads it: past games per six
const rec = new Map(); for (const g of past) for (const [t, w] of [[g[0], g[2] === 1], [g[1], g[2] !== 1]]) { const o = rec.get(t) || {g: 0, w: 0}; o.g++; o.w += w ? 1 : 0; rec.set(t, o); }
// ---- scoring: in each later game, does the stronger six (by each predictor) win; log-loss with each predictor's best scale
const sig = z => 1 / (1 + Math.exp(-z));
function score(f, gs) { const d = gs.map(g => [f(g[0], g[7]) - f(g[1], g[8]), g[2] === 1 ? 1 : 0]).filter(([x]) => isFinite(x));
  const ll = b => d.reduce((a, [x, y]) => { const p = Math.min(1 - 1e-9, Math.max(1e-9, sig(b * x))); return a - (y ? Math.log(p) : Math.log(1 - p)); }, 0) / d.length;
  let l = 0, h = 20; for (let i = 0; i < 50; i++) { const a = l + (h - l) / 3, c = h - (h - l) / 3; if (ll(a) < ll(c)) h = c; else l = a; }
  let r = 0, n = 0; for (const [x, y] of d) { if (Math.abs(x) < 1e-12) continue; n++; if ((x > 0) === (y === 1)) r++; } return {acc: r / n * 100, ll: ll((l + h) / 2), n}; }
function teamCorr(f, gs) { const T = new Map(); for (const g of gs) for (const [t, d, w] of [[g[0], g[7], g[2] === 1], [g[1], g[8], g[2] !== 1]]) { const o = T.get(t) || {g: 0, w: 0, d}; o.g++; o.w += w ? 1 : 0; T.set(t, o); }
  const R = [...T].filter(([, o]) => o.g >= 10), xs = R.map(([t, o]) => f(t, o.d)), ys = R.map(([, o]) => o.w / o.g), ws = R.map(([, o]) => o.g), W = ws.reduce((a, b) => a + b, 0);
  const mx = xs.reduce((a, x, i) => a + x * ws[i], 0) / W, my = ys.reduce((a, y, i) => a + y * ws[i], 0) / W; let sxy = 0, sxx = 0, syy = 0;
  xs.forEach((x, i) => { sxy += ws[i] * (x - mx) * (ys[i] - my); sxx += ws[i] * (x - mx) ** 2; syy += ws[i] * (ys[i] - my) ** 2; }); return {r: sxy / Math.sqrt(sxx * syy), n: R.length}; }
// ---- the predictors
const P = {};
P['team strength alone (x)'] = (t, d) => xOf(t, d);
P['x + raw record, today\'s blend (g/(g+100))'] = (t, d) => { const o = rec.get(t), x = xOf(t, d); if (!o || o.g < 30) return x; const w = o.g / (o.g + 100), wr = (o.w + 1) / (o.g + 2); return (1 - w) * x + w * Math.log(wr / (1 - wr)) / calib; };
if (comp) { const GMISS = 6, K = 100, rs = wr => Math.min(100, Math.max(0, 70 + (wr - .5) * 200)), clamp = v => Math.min(100, Math.max(0, v));
  P['today\'s site grade'] = t => { const c = comp[t]; if (!c) return NaN; const raw = c.ready - GMISS * c.miss + c.mp, o = rec.get(t); if (!o || o.g < 30) return clamp(raw); const w = o.g / (o.g + K); return clamp((1 - w) * raw + w * rs(o.w / o.g)); }; }
console.log(`cut ${cutDate} · past games ${past.length} · later games: half A ${fut.A.length}, half B ${fut.B.length}`);
const fits = {}; for (const tau of [.05, .1, .2, .35, .6]) { process.stdout.write(`  fitting τ=${tau}…\r`); fits[tau] = fit(tau); }
for (const tau of Object.keys(fits)) P[`NEW: x + own record, skill taken out (τ=${tau})`] = (t, d) => xOf(t, d) + fits[tau].dl[t];
const res = {cutDate, rows: {}};
console.log('\nhigher-scoring six won (%) and log-loss (lower is better, coin flip .6931), on each later half; team-level r (10+ games)');
for (const [k, f] of Object.entries(P)) { const a = score(f, fut.A), bb = score(f, fut.B), all = score(f, [...fut.A, ...fut.B]), c = teamCorr(f, [...fut.A, ...fut.B]);
  res.rows[k] = {A: a, B: bb, all, corr: c};
  console.log(`  ${all.acc.toFixed(1)}%  ll ${all.ll.toFixed(4)}  (A ${a.acc.toFixed(1)}% / B ${bb.acc.toFixed(1)}%)  r ${c.r.toFixed(2)}  ${k}`); }
// τ chosen on one half, scored on the other
for (const [fitH, testH] of [['A', 'B'], ['B', 'A']]) { let best = null; for (const tau of Object.keys(fits)) { const k = `NEW: x + own record, skill taken out (τ=${tau})`, s = res.rows[k][fitH]; if (!best || s.ll < best.s.ll) best = {tau, s, k}; }
  console.log(`τ chosen on half ${fitH}: ${best.tau} → on half ${testH}: ${res.rows[best.k][testH].acc.toFixed(1)}%, ll ${res.rows[best.k][testH].ll.toFixed(4)}`); res['tau_' + fitH] = +best.tau; }
if (process.env.GRADE_V2_OUT) fs.writeFileSync(process.env.GRADE_V2_OUT, JSON.stringify(res, null, 1));

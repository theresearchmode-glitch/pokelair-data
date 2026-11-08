// Plans step d3-count, "counting mistakes" (Nov 8). Read-only checks of how the grade counts a team:
//  1. benched Pokémon: does weighting each Pokémon by how often it's brought / led (rates learned on OTHER games) predict
//     ladder single games better than counting all six equally?  (out/replays.json, model strengths from out/model.json)
//  2. two Megas: do 2-Mega teams do better/worse than the grade expects?  (tournament dev rounds with out/model_dev.json,
//     held out from Oct 27; VGC-Bench team-sheet games: raw head-to-head)
//  3. rounds vs games: strengths fitted on BO1 rounds vs size-matched BO3 rounds, and which predicts ladder single games
//  4. who you beat: does a team's record against strong opponents predict its later results beyond its plain record?
// Usage: node experiments/counting-checks.mjs [vb_games.json]   (writes nothing; prints results)
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const VB = process.argv[2] || '/tmp/claude-0/-home-user-pokelair-data/bb8a70ea-fc62-5abc-aff7-2a45fe47bd82/scratchpad/vb_games.json';
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null, run = k => !ONLY || ONLY.has(k);
const base = n => n.replace(/-Mega.*$/, ''), isMega = n => /-Mega/.test(n), sig = z => 1 / (1 + Math.exp(-z));
const f3 = x => (x >= 0 ? '+' : '') + x.toFixed(3), pct = x => (100 * x).toFixed(1) + '%';
// ---------- logistic regression (Newton) with two-way cluster-robust SEs (Cameron-Gelbach-Miller) ----------
function logit(X, y, cl1, cl2) { const n = y.length, p = X[0].length; let b = new Array(p).fill(0);
  for (let it = 0; it < 30; it++) { const g = new Array(p).fill(0), H = [...Array(p)].map(() => new Array(p).fill(0));
    for (let i = 0; i < n; i++) { const z = X[i].reduce((s, x, j) => s + x * b[j], 0), q = sig(z), w = q * (1 - q);
      for (let j = 0; j < p; j++) { g[j] += (y[i] - q) * X[i][j]; for (let k = 0; k < p; k++) H[j][k] += w * X[i][j] * X[i][k]; } }
    for (let j = 0; j < p; j++) H[j][j] += 1e-9; const d = solve(H, g); b = b.map((v, j) => v + d[j]); if (Math.max(...d.map(Math.abs)) < 1e-9) break; }
  // bread
  const H = [...Array(p)].map(() => new Array(p).fill(0)), sc = []; let ll = 0;
  for (let i = 0; i < n; i++) { const z = X[i].reduce((s, x, j) => s + x * b[j], 0), q = sig(z), w = q * (1 - q); ll += y[i] ? Math.log(q) : Math.log(1 - q);
    sc.push(X[i].map(x => (y[i] - q) * x)); for (let j = 0; j < p; j++) for (let k = 0; k < p; k++) H[j][k] += w * X[i][j] * X[i][k]; }
  const Hi = inv(H), meat = keyf => { const by = new Map(); for (let i = 0; i < n; i++) { const k = keyf(i); const a = by.get(k) || new Array(p).fill(0); sc[i].forEach((v, j) => a[j] += v); by.set(k, a); }
    const Mt = [...Array(p)].map(() => new Array(p).fill(0)); for (const a of by.values()) for (let j = 0; j < p; j++) for (let k = 0; k < p; k++) Mt[j][k] += a[j] * a[k]; return Mt; };
  let Mt; if (cl1) { const A = meat(i => cl1[i]), B = cl2 ? meat(i => cl2[i]) : null, C = cl2 ? meat(i => cl1[i] + '#' + cl2[i]) : null; Mt = A.map((r, j) => r.map((v, k) => v + (B ? B[j][k] - C[j][k] : 0))); } else Mt = meat(i => i);
  const V = mul(mul(Hi, Mt), Hi); return {b, se: b.map((_, j) => Math.sqrt(Math.max(V[j][j], 0))), ll: ll / n}; }
function solve(A, b) { const n = b.length, M = A.map((r, i) => [...r, b[i]]); for (let i = 0; i < n; i++) { let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[m][i])) m = r; [M[i], M[m]] = [M[m], M[i]];
  for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; } } return M.map((r, i) => r[n] / r[i]); }
function inv(A) { const n = A.length; return [...Array(n)].map((_, j) => solve(A, A.map((_, i) => i === j ? 1 : 0))).reduce((R, col, j) => { col.forEach((v, i) => R[i][j] = v); return R; }, [...Array(n)].map(() => new Array(n).fill(0))); }
function mul(A, B) { return A.map(r => B[0].map((_, k) => r.reduce((s, v, j) => s + v * B[j][k], 0))); }
const coefs = (names, r) => names.map((nm, j) => `${nm} ${f3(r.b[j])} ±${(1.96 * r.se[j]).toFixed(3)} (z ${(r.b[j] / r.se[j]).toFixed(1)})`).join('; ');
// ---------- model strengths for base species (ladder replays don't say which Mega was held) ----------
const MJ = rd('model.json'), MD = rd('matches_dev.json'), TEAMS = MD.teams.map(k => k.split('|'));
function baseVals(model) { const s = new Map(), c = new Map(); for (const g of MD.m) for (const t of [g[0], g[1]]) for (const n of TEAMS[t]) { const b = base(n); s.set(b, (s.get(b) || 0) + (model.mons[n] || 0)); c.set(b, (c.get(b) || 0) + 1); }
  const v = new Map([...s].map(([b, x]) => [b, x / c.get(b)])), pr = new Map(), pc = new Map();
  for (const [k, x] of Object.entries(model.pairs)) { const [a, b] = k.split('|').map(base), kk = [a, b].sort().join('|'); pr.set(kk, (pr.get(kk) || 0) + x); pc.set(kk, (pc.get(kk) || 0) + 1); }
  return {v, pair: new Map([...pr].map(([k, x]) => [k, x / pc.get(k)]))}; }
const pairSum = (BV, six) => { let x = 0; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) x += BV.pair.get([six[i], six[j]].sort().join('|')) || 0; return x; };

// ================= 1. benched Pokémon =================
if (run('1')) { console.log('\n=== 1. Benched Pokémon (ladder replays, single games) ===');
  const R = rd('replays.json').games.filter(g => (g.w === 0 || g.w === 1) && g.p[0].length === 6 && g.p[1].length === 6 && g.r && g.r[0] != null && g.r[1] != null);
  const BV = baseVals(MJ), six = g => g.p.map(t => t.map(base)), tk = t => [...t].sort().join('|');
  // cross-fitting: rates for fold-0 games come from fold-1 games and vice versa (fold = hash of game id)
  const fold = g => { let h = 0; for (const ch of g.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h & 1; };
  const rates = [0, 1].map(F => { const on = new Map(), br = new Map(), ld = new Map(); for (const g of R) { if (fold(g) !== F) continue; const S = six(g);
    for (let s = 0; s < 2; s++) { const B = new Set(g.b[s].map(base)), L = new Set(g.l[s].map(base)); for (const n of S[s]) { on.set(n, (on.get(n) || 0) + 1); if (B.has(n)) br.set(n, (br.get(n) || 0) + 1); if (L.has(n)) ld.set(n, (ld.get(n) || 0) + 1); } } }
    // shrink toward the average rate (4/6 brought, 2/6 led) with 20 pseudo-games so rare species don't get extreme weights
    const f = (m, avg) => n => ((m.get(n) || 0) + 20 * avg) / ((on.get(n) || 0) + 20); return {bring: f(br, 4 / 6), lead: f(ld, 2 / 6), on}; });
  const v = n => BV.v.get(n) || 0;
  const rows = R.map(g => { const S = six(g), Rt = rates[1 - fold(g)];
    const side = s => { const t = S[s], eq = t.reduce((a, n) => a + v(n), 0), pr = pairSum(BV, t);
      const wsum = (wf, tot) => { const w = t.map(wf), sw = w.reduce((a, b) => a + b, 0); return t.reduce((a, n, i) => a + v(n) * w[i] * 6 / sw, 0); };
      const led = g.l[s].map(base).reduce((a, n) => a + v(n), 0) * 3; // actual leads (chosen before the game, after team preview), scaled to six
      return {eq, pr, br: wsum(Rt.bring), ld: wsum(Rt.lead), led}; };
    const A = side(0), B = side(1); return {A, B, y: g.w === 0 ? 1 : 0, dr: (g.r[0] - g.r[1]) / 100, k0: tk(S[0]), k1: tk(S[1]), id: g.id}; });
  console.log(`${rows.length} games with both ratings; ${new Set(rows.flatMap(r => [r.k0, r.k1])).size} distinct sixes`);
  const y = rows.map(r => r.y), c1 = rows.map(r => r.k0), c2 = rows.map(r => r.k1);
  const D = (r, f) => f(r.A) - f(r.B);
  const m0 = logit(rows.map(r => [r.dr]), y, c1, c2), m1 = logit(rows.map(r => [r.dr, D(r, s => s.eq + s.pr)]), y, c1, c2);
  console.log('rating only:', coefs(['Δrating/100'], m0), `ll ${m0.ll.toFixed(5)}`);
  console.log('rating + equal six:', coefs(['Δrating/100', 'Δx(all six equal)'], m1), `ll ${m1.ll.toFixed(5)}`);
  for (const [nm, f] of [['bring-rate', s => s.br], ['lead-rate', s => s.ld]]) {
    const m = logit(rows.map(r => [r.dr, D(r, s => s.eq + s.pr), D(r, s => f(s) - s.eq)]), y, c1, c2);
    const mo = logit(rows.map(r => [r.dr, D(r, s => f(s) + s.pr)]), y, c1, c2);
    console.log(`${nm} weighted (rates from the other half): joint ${coefs(['Δrating', 'Δx equal', 'Δ(weighted − equal)'], m)}; weighted alone ll ${mo.ll.toFixed(5)} vs equal ${m1.ll.toFixed(5)} (k ${f3(mo.b[1])} vs ${f3(m1.b[1])})`); }
  // actual leads (pre-game choice): does the strength of the two Pokémon actually led add to the six?
  const ml = logit(rows.map(r => [r.dr, D(r, s => s.eq + s.pr), D(r, s => s.led - s.eq)]), y, c1, c2);
  console.log('actual leads (game-specific, chosen after team preview):', coefs(['Δrating', 'Δx equal', 'Δ(led pair×3 − six)'], ml));
  // pick accuracy, cross-fitted coefficient (fit on one half, score the other), paired by game
  const acc = f => { let ok = 0, n = 0; for (const F of [0, 1]) { const tr = rows.filter(r => fold({id: r.id}) !== F), te = rows.filter(r => fold({id: r.id}) === F); const m = logit(tr.map(r => [r.dr, f(r)]), tr.map(r => r.y));
    for (const r of te) { const z = m.b[0] * r.dr + m.b[1] * f(r); if (z === 0) continue; n++; if ((z > 0) === (r.y === 1)) ok++; } } return ok / n; };
  console.log(`held-out pick rate: rating+equal ${pct(acc(r => D(r, s => s.eq + s.pr)))}, rating+bring-weighted ${pct(acc(r => D(r, s => s.br + s.pr)))}, rating+lead-weighted ${pct(acc(r => D(r, s => s.ld + s.pr)))}`);
  // without ratings (the page has no rating): team-only
  const mt = logit(rows.map(r => [D(r, s => s.eq + s.pr), D(r, s => s.br - s.eq), D(r, s => s.ld - s.eq)]), y, c1, c2);
  console.log('team only, joint:', coefs(['Δx equal', 'Δ(bring-w − eq)', 'Δ(lead-w − eq)'], mt));
  for (const [nm, f] of [['bring', s => s.br], ['lead', s => s.ld]]) { const m = logit(rows.map(r => [D(r, s => s.eq + s.pr), D(r, s => f(s) - s.eq)]), y, c1, c2); console.log(`team only, ${nm} alone:`, coefs(['Δx equal', `Δ(${nm}-w − eq)`], m)); }
  // direct: strength of the often-brought half vs the rarely-brought half of each six (rates from the other half of games)
  { const med = (() => { const a = []; for (const g of R) for (const t of six(g)) for (const n of t) a.push(rates[1 - fold(g)].bring(n)); a.sort((p, q) => p - q); return a[a.length >> 1]; })();
    const X = R.map(g => { const S = six(g), Rt = rates[1 - fold(g)], part = (t, hi) => t.reduce((a, n) => a + ((Rt.bring(n) >= med) === hi ? v(n) : 0), 0); return [(g.r[0] - g.r[1]) / 100, part(S[0], true) - part(S[1], true), part(S[0], false) - part(S[1], false)]; });
    const m = logit(X, y, c1, c2); console.log(`split by bring rate (median ${pct(med)}):`, coefs(['Δrating', 'Δ strength of often-brought', 'Δ strength of rarely-brought'], m)); }
  // species: strength vs bring / lead rate (all games, raw rates)
  const on = new Map(), br = new Map(), ld = new Map(); for (const g of R) { const S = six(g); for (let s = 0; s < 2; s++) { const B = new Set(g.b[s].map(base)), L = new Set(g.l[s].map(base)); for (const n of S[s]) { on.set(n, (on.get(n) || 0) + 1); if (B.has(n)) br.set(n, (br.get(n) || 0) + 1); if (L.has(n)) ld.set(n, (ld.get(n) || 0) + 1); } } }
  const sp = [...on].filter(([n, c]) => c >= 200 && BV.v.has(n)).map(([n, c]) => ({n, c, v: v(n), b: (br.get(n) || 0) / c, l: (ld.get(n) || 0) / c}));
  const corr = (a, b) => { const ma = a.reduce((s, x) => s + x, 0) / a.length, mb = b.reduce((s, x) => s + x, 0) / b.length; let sab = 0, sa = 0, sb = 0; a.forEach((x, i) => { sab += (x - ma) * (b[i] - mb); sa += (x - ma) ** 2; sb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(sa * sb); };
  const rk = a => { const o = a.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]), r = new Array(a.length); o.forEach(([, i], k) => r[i] = k); return r; };
  // bootstrap over species for a range
  const boot = (f, B = 2000) => { const out = []; for (let k = 0; k < B; k++) { const s = sp.map(() => sp[Math.floor(Math.random() * sp.length)]); out.push(f(s)); } out.sort((a, b) => a - b); return [out[Math.floor(B * .025)], out[Math.floor(B * .975)]]; };
  const sc = s => corr(rk(s.map(x => x.v)), rk(s.map(x => x.b))), sl = s => corr(rk(s.map(x => x.v)), rk(s.map(x => x.l)));
  console.log(`${sp.length} species on 200+ ladder sides: Spearman(model strength, bring rate) ${sc(sp).toFixed(2)} [${boot(sc).map(x => x.toFixed(2)).join(', ')}], (strength, lead rate) ${sl(sp).toFixed(2)} [${boot(sl).map(x => x.toFixed(2)).join(', ')}]`);
  const bq = [...sp].sort((a, b) => a.b - b.b), q = bq[Math.floor(bq.length * .25)].b, vq = [...sp].sort((a, b) => b.v - a.v)[Math.floor(sp.length * .33)].v;
  console.log(`inflated? strength in the top third (v ≥ ${vq.toFixed(3)}) but bring rate in the bottom quarter (≤ ${pct(q)}):`);
  for (const s of sp.filter(s => s.v >= vq && s.b <= q).sort((a, b) => b.v - a.v)) console.log(`  ${s.n}: strength ${f3(s.v)}, brought ${pct(s.b)}, led ${pct(s.l)}, ${s.c} sides`);
  console.log('lowest bring rates overall (any strength):', [...sp].sort((a, b) => a.b - b.b).slice(0, 12).map(s => `${s.n} ${pct(s.b)}/${pct(s.l)} (v ${f3(s.v)})`).join(', '));
  // options: does a six that shows 2 different Megas across its games actually switch?
  const by = new Map(); for (const g of R) for (let s = 0; s < 2; s++) { const k = tk(six(g)[s]); const o = by.get(k) || {n: 0, m: new Map()}; o.n++; const mm = g.m[s] ? base(g.m[s]) : '-'; o.m.set(mm, (o.m.get(mm) || 0) + 1); by.set(k, o); }
  const many = [...by.values()].filter(o => o.n >= 5), sw = many.filter(o => [...o.m.keys()].filter(k => k !== '-').length >= 2);
  console.log(`ladder sixes with 5+ games: ${many.length}; ${sw.length} (${pct(sw.length / many.length)}) Mega'd with 2+ different Pokémon across their games; in those, the less-used Mega was used in ${pct(sw.reduce((a, o) => { const c = [...o.m].filter(([k]) => k !== '-').map(([, c]) => c).sort((a, b) => b - a); return a + c.slice(1).reduce((x, y) => x + y, 0); }, 0) / sw.reduce((a, o) => a + o.n, 0))} of games`);
}

// ================= 2. two Megas =================
// x(team) the page's way, mons + pairs (no set features, no six δ): only the two strongest Megas count
function xTeam(model, names, rule = 2) { let x = 0; for (const n of names) x += model.mons[n] || 0;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const a = names[i], b = names[j]; x += model.pairs[a < b ? a + '|' + b : b + '|' + a] || 0; }
  const megas = names.filter(isMega).sort((a, b) => (model.mons[b] || 0) - (model.mons[a] || 0)); for (const n of megas.slice(rule)) x -= model.mons[n] || 0; return x; }
if (run('2')) { console.log('\n=== 2. Two Megas ===');
  const MDV = rd('model_dev.json'), K = MDV.calib || 1, ev = MD.events;
  const G = MD.m.filter(g => g[2] !== .5 && g[0] !== g[1]), test = G.filter(g => ev[g[3]][1] >= '2026-10-27');
  const nm = t => TEAMS[t].filter(isMega).length;
  console.log('Mega count on dev-test teams (team-games):', JSON.stringify([0, 1, 2, 3, 4].map(k => test.reduce((a, g) => a + (nm(g[0]) === k) + (nm(g[1]) === k), 0))));
  // grouped residuals: observed − expected win rate for 2+-Mega teams, model trained before Oct 27 (out-of-sample)
  for (const [lab, games, model, k] of [['held out (model_dev, games from Oct 27)', test, MDV, K], ['all dev games, in-sample (model.json)', G, MJ, MJ.calib]]) {
    const acc = new Map(); for (const g of games) { const p = sig(k * (xTeam(model, TEAMS[g[0]]) - xTeam(model, TEAMS[g[1]])));
      for (const [t, o, w, e] of [[g[0], g[1], g[2], p], [g[1], g[0], 1 - g[2], 1 - p]]) { const c = Math.min(nm(t), 3); const a = acc.get(c) || {n: 0, w: 0, e: 0, by: new Map()}; a.n++; a.w += w; a.e += e; const tt = a.by.get(t) || [0, 0]; tt[0] += w - e; tt[1]++; a.by.set(t, tt); acc.set(c, a); } }
    console.log(lab + ':'); for (const [c, a] of [...acc].sort((p, q) => p[0] - q[0])) { // team-clustered SE of (obs − exp)
      const se = Math.sqrt([...a.by.values()].reduce((s, [r]) => s + r * r, 0)) / a.n; console.log(`  ${c}${c === 3 ? '+' : ''} Megas: ${a.n} team-games, ${a.by.size} teams, won ${pct(a.w / a.n)} vs grade expects ${pct(a.e / a.n)} → ${f3((a.w - a.e) / a.n)} ±${(1.96 * se).toFixed(3)}`); } }
  // which rule predicts held-out games better: count 1, 2 (page) or all Megas? joint coefficient on the 2nd Mega's value
  const y = test.map(g => g[2]), c1 = test.map(g => g[0]), c2 = test.map(g => g[1]);
  const sec = t => { const ms = TEAMS[t].filter(isMega).map(n => MDV.mons[n] || 0).sort((a, b) => b - a); return ms[1] || 0; };
  const r = logit(test.map(g => [xTeam(MDV, TEAMS[g[0]], 1) - xTeam(MDV, TEAMS[g[1]], 1), sec(g[0]) - sec(g[1]), (nm(g[0]) >= 2) - (nm(g[1]) >= 2)]), y, c1, c2);
  console.log('held out joint: ' + coefs(['Δx counting 1 Mega', 'Δ(2nd Mega strength)', 'Δ(has 2+ Megas)'], r) + ' — page rule = 2nd-Mega coef equal to the first');
  for (const rule of [1, 2, 6]) { const m = logit(test.map(g => [xTeam(MDV, TEAMS[g[0]], rule) - xTeam(MDV, TEAMS[g[1]], rule)]), y); console.log(`  count ${rule === 6 ? 'all' : rule} Mega(s): held-out log-loss ${m.ll.toFixed(5)}`); }
  // head-to-head: 2-Mega team vs 1-Mega team, held out
  { let n = 0, w = 0, e = 0; const by = new Map(); for (const g of test) { const a = nm(g[0]), b = nm(g[1]); if (!((a === 2 && b === 1) || (a === 1 && b === 2))) continue; const p = sig(K * (xTeam(MDV, TEAMS[g[0]]) - xTeam(MDV, TEAMS[g[1]]))), two = a === 2;
      const ww = two ? g[2] : 1 - g[2], ee = two ? p : 1 - p; n++; w += ww; e += ee; const t = two ? g[0] : g[1], o = by.get(t) || 0; by.set(t, o + ww - ee); }
    console.log(`  2-Mega vs 1-Mega head-to-head (held out): ${n} games, 2-Mega side won ${pct(w / n)}, grade expected ${pct(e / n)} (±${(196 * Math.sqrt([...by.values()].reduce((s, r) => s + r * r, 0)) / n / 100).toFixed(3)})`); }
  // VGC-Bench team sheets (M-A / M-B): raw head-to-head by number of Mega Stones
  if (fs.existsSync(VB)) { const V = JSON.parse(fs.readFileSync(VB, 'utf8')), VG = (V.games || V).filter(g => g.s && g.s[0].length === 6 && g.s[1].length === 6 && (g.w === 0 || g.w === 1));
    const stones = s => s.filter(x => /ite[XYZ]?$/.test(x.i || '') && !/Eviolite/i.test(x.i)).length, key = s => s.map(x => x.n).sort().join('|');
    for (const f of ['regma', 'regmb', 'regmbbo3', 'all']) { const gs = VG.filter(g => f === 'all' || g.f === f); let n = 0, w = 0; const by = new Map();
      for (const g of gs) { const a = stones(g.s[0]), b = stones(g.s[1]); if (!((a === 2 && b === 1) || (a === 1 && b === 2))) continue; const two = a === 2 ? 0 : 1, ww = g.w === two ? 1 : 0; n++; w += ww; const k = key(g.s[two]); by.set(k, (by.get(k) || 0) + ww - .5); }
      const se = Math.sqrt([...by.values()].reduce((s, r) => s + r * r, 0)) / n; console.log(`  VGC-Bench ${f}: 2-stone vs 1-stone sheets ${n} games (${by.size} 2-stone teams): 2-stone side won ${pct(w / n)} ±${pct(1.96 * se)}`); }
    // options: on 2-stone teams, how often is each stone the one used?
    const by = new Map(); for (const g of VG) for (let s = 0; s < 2; s++) { if (stones(g.s[s]) !== 2) continue; const k = key(g.s[s]); const o = by.get(k) || {n: 0, m: new Map()}; o.n++; const mm = g.m[s] ? base(g.m[s]) : '-'; o.m.set(mm, (o.m.get(mm) || 0) + 1); by.set(k, o); }
    let tot = 0, second = 0, none = 0, teams5 = 0, sw = 0; for (const o of by.values()) { const c = [...o.m].filter(([k]) => k !== '-').map(([, c]) => c).sort((a, b) => b - a); tot += o.n; second += c.slice(1).reduce((a, b) => a + b, 0); none += o.m.get('-') || 0; if (o.n >= 5) { teams5++; if (c.length >= 2) sw++; } }
    console.log(`  2-stone sheets: ${tot} team-games; the less-used stone Mega'd in ${pct(second / tot)}, no Mega in ${pct(none / tot)}; of ${teams5} such teams with 5+ games, ${sw} used both`); }
}

// ================= 3. rounds vs games =================
// own small fit (mons + player skill, ridge), same settings for every subset, so only the data differs
function fitBT(games, nT, {lb = 4, ls = 1.5, iters = 300} = {}) { const names = [...new Set(TEAMS.flat())], ix = new Map(names.map((n, i) => [n, i])), tf = TEAMS.map(t => t.map(n => ix.get(n)));
  const b = new Float64Array(names.length), s = new Float64Array(MD.players), mb = new Float64Array(b.length), vb = new Float64Array(b.length), ms = new Float64Array(s.length), vs = new Float64Array(s.length);
  for (let it = 1; it <= iters; it++) { const gb = new Float64Array(b.length), gs = new Float64Array(s.length);
    for (const g of games) { let z = s[g[4]] - s[g[5]]; for (const j of tf[g[0]]) z += b[j]; for (const j of tf[g[1]]) z -= b[j]; const r = g[2] - sig(z);
      for (const j of tf[g[0]]) gb[j] -= r; for (const j of tf[g[1]]) gb[j] += r; gs[g[4]] -= r; gs[g[5]] += r; }
    const N = games.length; for (let j = 0; j < b.length; j++) { const gg = gb[j] / N + lb * b[j] / N; mb[j] = .9 * mb[j] + .1 * gg; vb[j] = .999 * vb[j] + .001 * gg * gg; b[j] -= .05 * (mb[j] / (1 - .9 ** it)) / (Math.sqrt(vb[j] / (1 - .999 ** it)) + 1e-8); }
    for (let j = 0; j < s.length; j++) { const gg = gs[j] / N + ls * s[j] / N; ms[j] = .9 * ms[j] + .1 * gg; vs[j] = .999 * vs[j] + .001 * gg * gg; s[j] -= .05 * (ms[j] / (1 - .9 ** it)) / (Math.sqrt(vs[j] / (1 - .999 ** it)) + 1e-8); } }
  return Object.fromEntries(names.map((n, i) => [n, b[i]])); }
if (run('3')) { console.log('\n=== 3. Rounds vs games ===');
  const TM = JSON.parse(fs.readFileSync(ROOT + 'data/tour-modes.json', 'utf8')), ev = MD.events;
  const mode = g => { const ph = TM[ev[g[3]][0]]; if (!ph) return null; let r = g[6]; for (const [, n, m] of ph) { if (r <= n) return m; r -= n; } return ph[ph.length - 1][2]; };
  const G = MD.m.filter(g => g[2] !== .5 && g[0] !== g[1]), cnt = {}; for (const g of G) { const m = mode(g) || 'unknown'; cnt[m] = (cnt[m] || 0) + 1; } console.log('dev rounds by mode:', JSON.stringify(cnt));
  const bo1 = G.filter(g => mode(g) === 'BO1'), bo3 = G.filter(g => mode(g) === 'BO3');
  // seeded shuffle
  let seed = +(process.env.SEED || 7); const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648, shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const n = bo1.length, s3 = shuf(bo3), A3 = s3.slice(0, n), B3 = s3.slice(n, 2 * n);
  const F1 = fitBT(bo1), FA = fitBT(A3), FB = fitBT(B3);
  // species seen on 30+ team-games in EACH subset
  const tc = gs => { const c = new Map(); for (const g of gs) for (const t of [g[0], g[1]]) for (const m of TEAMS[t]) c.set(m, (c.get(m) || 0) + 1); return c; };
  const c1 = tc(bo1), cA = tc(A3), cB = tc(B3), sp = [...c1.keys()].filter(m => c1.get(m) >= 60 && (cA.get(m) || 0) >= 60 && (cB.get(m) || 0) >= 60);
  const corr = (a, b) => { const ma = a.reduce((s, x) => s + x, 0) / a.length, mb = b.reduce((s, x) => s + x, 0) / b.length; let sab = 0, sa = 0, sb = 0; a.forEach((x, i) => { sab += (x - ma) * (b[i] - mb); sa += (x - ma) ** 2; sb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(sa * sb); };
  const sd = a => { const m = a.reduce((s, x) => s + x, 0) / a.length; return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length); };
  const v1 = sp.map(m => F1[m]), vA = sp.map(m => FA[m]), vB = sp.map(m => FB[m]);
  console.log(`${n} BO1 rounds (${new Set(bo1.map(g => g[3])).size} events) vs two disjoint random BO3 sets of the same size; ${sp.length} Pokémon on 60+ team-games in all three`);
  console.log(`  strength spread (SD): BO1 ${sd(v1).toFixed(3)}, BO3a ${sd(vA).toFixed(3)}, BO3b ${sd(vB).toFixed(3)}  (BO3 rounds amplify a game edge ~1.5× near 50%)`);
  console.log(`  agreement: BO1 vs BO3a r=${corr(v1, vA).toFixed(2)}, BO1 vs BO3b r=${corr(v1, vB).toFixed(2)}, BO3a vs BO3b r=${corr(vA, vB).toFixed(2)} (noise baseline)`);
  // bootstrap of the gap (BO1 vs BO3 agreement minus BO3 vs BO3 agreement) over species
  { const gaps = []; for (let k = 0; k < 2000; k++) { const ii = sp.map(() => Math.floor(rnd() * sp.length)), p = ii.map(i => v1[i]), a = ii.map(i => vA[i]), b = ii.map(i => vB[i]); gaps.push((corr(p, a) + corr(p, b)) / 2 - corr(a, b)); } gaps.sort((x, y) => x - y); console.log(`  gap (BO1↔BO3 minus BO3↔BO3) 95% range over species [${gaps[50].toFixed(2)}, ${gaps[1949].toFixed(2)}]`); }
  // largest disagreements
  const z = sp.map((m, i) => ({m, d: v1[i] / sd(v1) - (vA[i] + vB[i]) / 2 / sd([...vA, ...vB]), n: c1.get(m)})).sort((a, b) => b.d - a.d);
  console.log('  relatively stronger in BO1:', z.slice(0, 6).map(o => `${o.m} (${o.n})`).join(', ')); console.log('  relatively stronger in BO3:', z.slice(-6).reverse().map(o => `${o.m} (${o.n})`).join(', '));
  // independent check: which fit predicts LADDER single games better? (base species values, both ratings, same rating covariate)
  const R = rd('replays.json').games.filter(g => (g.w === 0 || g.w === 1) && g.p[0].length === 6 && g.p[1].length === 6 && g.r && g.r[0] != null && g.r[1] != null);
  for (const [lab, F] of [['BO1 fit', F1], ['BO3a fit', FA], ['BO3b fit', FB]]) { const BV = baseVals({mons: F, pairs: {}}), X = R.map(g => { const S = g.p.map(t => t.map(base)); return [(g.r[0] - g.r[1]) / 100, S[0].reduce((a, n) => a + (BV.v.get(n) || 0), 0) - S[1].reduce((a, n) => a + (BV.v.get(n) || 0), 0)]; });
    const m = logit(X, R.map(g => g.w === 0 ? 1 : 0), R.map(g => g.p[0].map(base).sort().join('|')), R.map(g => g.p[1].map(base).sort().join('|'))); console.log(`  ladder single games, ${lab}: team coef ${f3(m.b[1])} ±${(1.96 * m.se[1]).toFixed(3)} (z ${(m.b[1] / m.se[1]).toFixed(1)}), ll ${m.ll.toFixed(5)}`); }
}

// ================= 4. who you beat =================
if (run('4')) { console.log('\n=== 4. Who you beat ===');
  const MDV = rd('model_dev.json'), K = MDV.calib || 1, ev = MD.events, G = MD.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
  const x = new Map(); const X = t => { if (!x.has(t)) x.set(t, xTeam(MDV, TEAMS[t])); return x.get(t); };
  const tr = G.filter(g => ev[g[3]][1] < '2026-10-27'), te = G.filter(g => ev[g[3]][1] >= '2026-10-27');
  // per team in train: plain residual (wins − expected) and opponent-weighted residual (each game weighted by opponent x, centered)
  const mx = tr.reduce((a, g) => a + X(g[0]) + X(g[1]), 0) / (2 * tr.length), T = new Map();
  for (const g of tr) for (const [t, o, w] of [[g[0], g[1], g[2]], [g[1], g[0], 1 - g[2]]]) { const p = sig(K * (X(t) - X(o))), a = T.get(t) || {n: 0, r: 0, rs: 0}; a.n++; a.r += w - p; a.rs += (w - p) * (X(o) - mx); T.set(t, a); }
  const rows = []; for (const g of te) for (const [t, o, w] of [[g[0], g[1], g[2]], [g[1], g[0], 1 - g[2]]]) { const a = T.get(t); if (!a || a.n < 8) continue; rows.push({t, y: w, off: K * (X(t) - X(o)), r: a.r / a.n, rs: a.rs / a.n}); }
  // logistic with the model's own prediction as an offset-like input
  const m = logit(rows.map(r => [r.off, r.r, r.rs]), rows.map(r => r.y), rows.map(r => r.t));
  console.log(`${rows.length} held-out team-games from ${new Set(rows.map(r => r.t)).size} teams with 8+ earlier games:`, coefs(['grade logit', 'earlier plain residual', 'earlier residual × opponent strength'], m));
  // simpler: earlier wins split by opponent strength
  const s2 = new Map(); for (const g of tr) for (const [t, o, w] of [[g[0], g[1], g[2]], [g[1], g[0], 1 - g[2]]]) { const p = sig(K * (X(t) - X(o))), a = s2.get(t) || {hi: 0, nh: 0, lo: 0, nl: 0}; if (X(o) >= mx) { a.hi += w - p; a.nh++; } else { a.lo += w - p; a.nl++; } s2.set(t, a); }
  const rows2 = rows.filter(r => { const a = s2.get(r.t); return a.nh >= 4 && a.nl >= 4; }).map(r => { const a = s2.get(r.t); return [r.off, a.hi / a.nh, a.lo / a.nl]; });
  const m2 = logit(rows2, rows.filter(r => { const a = s2.get(r.t); return a.nh >= 4 && a.nl >= 4; }).map(r => r.y), rows.filter(r => { const a = s2.get(r.t); return a.nh >= 4 && a.nl >= 4; }).map(r => r.t));
  console.log(`${rows2.length} held-out team-games (teams with 4+ earlier games vs both stronger and weaker opponents):`, coefs(['grade logit', 'over-performance vs stronger', 'over-performance vs weaker'], m2));
}

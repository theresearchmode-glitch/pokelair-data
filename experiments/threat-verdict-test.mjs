// Do our threat verdicts predict real results? (Nov 8, readiness item 2)
// For each team, the page's own threat report says how ready it is for each top threat: unanswered (0), shaky (1),
// handled (2), well handled (3). In a real tournament game, the opponent brings some of those threats. If the verdicts are
// right, a team that is "shaky" or "unanswered" against the threats the opponent actually has should lose more often than
// its overall strength alone predicts. Per game: our verdict vs their threats (average level over the opponent's Pokémon that
// are on the threat list) for each side, and the gap between the two sides. Fit: win ~ strength gap + a·verdict gap.
// Also the plain count of unanswered/shaky threats the opponent brings. Usage: node experiments/threat-verdict-test.mjs [games=12000]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const NG = +(process.argv[2] || 12000);
const M = rd('matches.json'), L = rd('limitless.json');
const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': process.env.THR_MODEL ? JSON.parse(fs.readFileSync(process.env.THR_MODEL, 'utf8')) : rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const teams = M.teams.map(k => k.split('|'));
/* THR_FROM=YYYY-MM-DD (monthly check, Nov 9): only games from that date (scored by a model trained before it) */
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6 && (!process.env.THR_FROM || M.events[g[3]][1] >= process.env.THR_FROM)).slice(-NG);
const need = [...new Set(G.flatMap(g => [g[0], g[1]]))];
const page = ROOT + `app/thr-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const rep = {}; const t0 = Date.now();
for (let i = 0; i < need.length; i += 100) {
  const ch = need.slice(i, i + 100).map(t => [t, teams[t]]);
  const r = await pg.evaluate(ch => window.__ev(`(()=>{const out={};for(const [t,ns] of ${JSON.stringify(ch)}){try{const ps=ns.map(n=>byName.get(n));if(ps.some(p=>!p))continue;
    const ms=assignItems(ps.map(p=>abMember(p))),R=THR.teamReport(ms);if(!R)continue;const lv={};for(const r of R.rows)lv[r.t.n]=r.level;out[t]={lv,x:teamX(ns,ms)}}catch(e){}}return JSON.stringify(out)})()`), ch);
  Object.assign(rep, JSON.parse(r)); if (i % 1000 === 0) process.stdout.write(`  ${Object.keys(rep).length} / ${need.length} teams · ${Math.round((Date.now() - t0) / 1000)}s\r`);
}
await b.close(); fs.unlinkSync(page);
const calib = (D['meta/model'] || {}).calib || 1, sig = z => 1 / (1 + Math.exp(-z));
// a side's verdict vs the opponent: average level over the opponent's Pokémon that are on its threat list (null if none)
const vs = (a, bt) => { const L = rep[a].lv, xs = teams[bt].filter(n => L[n] != null).map(n => L[n]); return xs.length ? {m: xs.reduce((s, v) => s + v, 0) / xs.length, bad: xs.filter(v => v <= 1).length, n: xs.length} : null; };
const rows = []; for (const g of G) { if (!rep[g[0]] || !rep[g[1]]) continue; const A = vs(g[0], g[1]), B = vs(g[1], g[0]); if (!A || !B) continue;
  rows.push({dx: calib * (rep[g[0]].x - rep[g[1]].x), dm: A.m - B.m, dbad: A.bad - B.bad, y: g[2] === 1 ? 1 : 0}); }
console.log(`\n${rows.length} tournament games where both sides face threats on each other's list`);
// logistic fits with standard errors (Newton), strength gap as an offset-like covariate
function fit(cols) { const X = rows.map(r => [1, r.dx, ...cols.map(c => r[c])]), Y = rows.map(r => r.y), k = X[0].length; let w = Array(k).fill(0); w[1] = 1; let inv;
  for (let it = 0; it < 30; it++) { const g = Array(k).fill(0), H = Array.from({length: k}, () => Array(k).fill(0));
    X.forEach((x, i) => { const p = sig(x.reduce((a, v, j) => a + v * w[j], 0)); for (let a = 0; a < k; a++) { g[a] += (Y[i] - p) * x[a]; for (let c = 0; c < k; c++) H[a][c] += p * (1 - p) * x[a] * x[c]; } });
    const A = H.map((r, i) => [...r, ...Array.from({length: k}, (_, j) => i === j ? 1 : 0)]); for (let i = 0; i < k; i++) { let p = i; for (let r = i + 1; r < k; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]]; const v = A[i][i]; for (let j = 0; j < 2 * k; j++) A[i][j] /= v; for (let r = 0; r < k; r++) if (r !== i) { const f = A[r][i]; for (let j = 0; j < 2 * k; j++) A[r][j] -= f * A[i][j]; } }
    inv = A.map(r => r.slice(k)); const step = inv.map(r => r.reduce((a, v, j) => a + v * g[j], 0)); w = w.map((v, j) => v + step[j]); }
  return {w, se: inv.map((r, j) => Math.sqrt(r[j]))}; }
const pts = c => ((sig(c) - .5) * 100);
const f1 = fit(['dm']); console.log(`one level better on average vs the threats they actually brought (e.g. shaky → handled): ${pts(f1.w[2]) >= 0 ? '+' : ''}${pts(f1.w[2]).toFixed(1)} pts of win chance (±${pts(1.96 * f1.se[2]).toFixed(1)}, 95%), on top of team strength`);
if (process.env.THR_OUT) fs.writeFileSync(process.env.THR_OUT, JSON.stringify({games: G.length, level: pts(f1.w[2]), level95: pts(1.96 * f1.se[2])}));
const f2 = fit(['dbad']); console.log(`each extra shaky/unanswered threat the opponent brings: ${pts(-f2.w[2]) >= 0 ? '−' : '+'}${Math.abs(pts(f2.w[2])).toFixed(1)} pts (±${pts(1.96 * f2.se[2]).toFixed(1)})`);
console.log(`(team strength gap coefficient ${f1.w[1].toFixed(2)}; 1.0 = the model's own scale)`);

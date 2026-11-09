// Does following NastyPlot's battle plan win more? (Nov 8, Sim: "do everything on the list", readiness item 1)
// Showdown ladder replays record both sixes, the four each player brought, the two leads, both ladder ratings and the winner.
// For every game and both players: how many of the four NastyPlot would bring (the page's own planMatchup, run in the built
// page) they actually brought, and whether they led with our pair. Then, allowing for skill (each side's chance from the
// ladder rating gap, the Elo formula), do players who brought our four win more than players who didn't?
// A popularity baseline (bring the four most often brought for those Pokémon) is measured the same way, so we can see
// whether our pick adds anything beyond "do what most people do". Fit: win ~ Elo + a·(our overlap) + b·(popular overlap).
// Usage: node experiments/plan-test.mjs [maxGames=20000] [minRating=0]      (needs app/dist/page.html)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const MAX = +(process.argv[2] || 20000), MIN = +(process.argv[3] || 0), FROM = +(process.env.PLAN_FROM || 0); // PLAN_FROM=<unix s>: only later games; PLAN_MODEL: model file; PLAN_LEADW: lead weight
const L = rd('limitless.json'), R = rd('replays.json');
const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': process.env.PLAN_MODEL ? JSON.parse(fs.readFileSync(process.env.PLAN_MODEL, 'utf8')) : rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const TO = +(process.env.PLAN_TO || 9e9); // PLAN_TO=<unix s>: only earlier games; PLAN_CTRW: weight of real-game matchups in the pick
const games = R.games.filter(g => g.t >= FROM && g.t < TO && Array.isArray(g.r) && Math.min(...g.r) >= MIN && g.p[0].length === 6 && g.p[1].length === 6 && g.b[0].length === 4 && g.b[1].length === 4 && (g.w === 0 || g.w === 1)).slice(0, MAX);
// popularity baseline: bring rate of each Pokémon when it is on the team (whole sample)
const on = new Map(), br = new Map(), ld = new Map();
for (const g of games) for (const s of [0, 1]) { for (const x of g.p[s]) on.set(x, (on.get(x) || 0) + 1); for (const x of g.b[s]) br.set(x, (br.get(x) || 0) + 1); for (const x of g.l[s] || []) ld.set(x, (ld.get(x) || 0) + 1); }
const popFour = six => six.slice().sort((a, c) => (br.get(c) || 0) / (on.get(c) || 1) - (br.get(a) || 0) / (on.get(a) || 1)).slice(0, 4);
const page = ROOT + `app/plan-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
if (process.env.PLAN_CTRW != null) await pg.evaluate(w => window.__ev(`CTR_W = ${w}`), +process.env.PLAN_CTRW);
if (process.env.PLAN_LEADW != null) await pg.evaluate(w => window.__ev(`LEAD_W = ${w}`), +process.env.PLAN_LEADW);
const rows = []; const t0 = Date.now();
for (let i = 0; i < games.length; i += 250) {
  const chunk = games.slice(i, i + 250).map((g, j) => [i + j, g.p, g.b, g.l, g.r, g.w]);
  const r = await pg.evaluate(ch => window.__ev(`(() => { const out = []; const mk = ns => ns.map(n => byName.get(n)).filter(Boolean).map(p => ({...abMember(p), i: -1}));
    for (const [I, P, B, Lz, Rt, W] of ${JSON.stringify(ch)}) for (const s of [0, 1]) { try { const mine = mk(P[s]), theirs = mk(P[1 - s]).map(m => oppMember(m.p)); if (mine.length !== 6 || theirs.length !== 6) continue;
      const plan = planMatchup(mine, theirs, true), four = plan.chosen.map(i => mine[i].p.n), lead = plan.lead.map(i => mine[i].p.n), base = n => n.replace(/-Mega.*$/, '');
      const brought = new Set(B[s].map(base)), led = new Set((Lz[s] || []).map(base));
      out.push([four.filter(n => brought.has(base(n))).length, lead.filter(n => led.has(base(n))).length, Rt[s] - Rt[1 - s], W === s ? 1 : 0, s, I]); } catch (e) {} } return JSON.stringify(out); })()`), chunk);
  for (const x of JSON.parse(r)) rows.push(x);
  // the popularity overlap is computed here (outside the page) for the same rows, in the same order
  if (i % 2500 === 0) process.stdout.write(`  ${Math.min(i + 250, games.length)} / ${games.length} games · ${Math.round((Date.now() - t0) / 1000)}s\r`);
}
await b.close(); fs.unlinkSync(page);
// popularity overlap per row, matched by game index and side
const full = rows.map(x => { const g = games[x[5]], s = x[4], brought = new Set(g.b[s].map(n => n.replace(/-Mega.*$/, ''))); return [x[0], x[1], x[2], x[3], s, popFour(g.p[s]).filter(n => brought.has(n.replace(/-Mega.*$/, ''))).length]; });
const elo = d => 1 / (1 + Math.pow(10, -d / 400)), logit = p => Math.log(p / (1 - p)), sig = z => 1 / (1 + Math.exp(-z));
console.log(`\n${full.length} player-games from ${games.length} ladder games (ratings ${MIN}+)`);
// by how many of our four were brought: games, wins, expected wins from ratings, and the difference
console.log('our four brought  games   won    expected (ratings)  difference');
for (let o = 0; o <= 4; o++) { const S = full.filter(x => x[0] === o); if (!S.length) continue; const w = S.reduce((a, x) => a + x[3], 0) / S.length, e = S.reduce((a, x) => a + elo(x[2]), 0) / S.length;
  console.log(`  ${o}               ${String(S.length).padStart(5)}  ${(w * 100).toFixed(1)}%   ${(e * 100).toFixed(1)}%              ${((w - e) * 100 >= 0 ? '+' : '') + ((w - e) * 100).toFixed(1)} pts`); }
const leadAll = full.filter(x => x[1] === 2), leadNone = full.filter(x => x[1] === 0), d = S => S.reduce((a, x) => a + x[3] - elo(x[2]), 0) / S.length * 100;
console.log(`led with our pair: ${leadAll.length} games, ${d(leadAll).toFixed(1)} pts vs ratings · led with neither: ${leadNone.length}, ${d(leadNone).toFixed(1)} pts`);
// logistic fit: win ~ c·eloLogit + a·ourOverlap + b·popOverlap + intercept, with standard errors
const X = full.map(x => [1, logit(Math.min(.99, Math.max(.01, elo(x[2])))), x[0] - 2, x[5] - 2]), Y = full.map(x => x[3]);
let w = [0, 1, 0, 0]; for (let it = 0; it < 50; it++) { const g = [0, 0, 0, 0], H = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  X.forEach((x, i) => { const p = sig(x.reduce((a, v, j) => a + v * w[j], 0)); for (let a = 0; a < 4; a++) { g[a] += (Y[i] - p) * x[a]; for (let c = 0; c < 4; c++) H[a][c] += p * (1 - p) * x[a] * x[c]; } });
  const inv = (M => { const n = 4, A = M.map((r, i) => [...r, ...Array.from({length: n}, (_, j) => i === j ? 1 : 0)]); for (let i = 0; i < n; i++) { let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]]; const v = A[i][i]; for (let j = 0; j < 2 * n; j++) A[i][j] /= v; for (let r = 0; r < n; r++) if (r !== i) { const f = A[r][i]; for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[i][j]; } } return A.map(r => r.slice(n)); })(H);
  const step = inv.map(r => r.reduce((a, v, j) => a + v * g[j], 0)); w = w.map((v, j) => v + step[j]); if (it === 49) w.se = inv.map((r, j) => Math.sqrt(r[j])); }
const pts = c => ((sig(c) - .5) * 100).toFixed(1);
console.log(`\nallowing for ratings: each extra Pokémon of OUR four brought → ${w[2] >= 0 ? '+' : ''}${pts(w[2])} pts of win chance (±${pts(1.96 * w.se[2])}, 95%)`);
console.log(`                      each extra of the POPULAR four brought → ${w[3] >= 0 ? '+' : ''}${pts(w[3])} pts (±${pts(1.96 * w.se[3])})`);
if (process.env.PLAN_OUT) fs.writeFileSync(process.env.PLAN_OUT, JSON.stringify({rows: full.length, coef: w, se: w.se}));

// Grade accuracy check (Nov 7, Sim: "I want our data more accurate, more trustworthy"). Does the grade predict who wins?
// Honest set-up: tournament events are split by date. The "past" is everything before the cut (the last 20% of events, by date,
// are the "future"). Every team is graded using only the past: team strength from out/model_train.json (trained on events
// before the cut; experiments use it, the page never does), a real record only from past games. Then, in every future game
// between two graded teams: did the higher-graded team win? And over teams with enough future games: do higher grades win more?
// Each part of the grade is measured on its own too (readiness, missed checks, team strength, past record), so we know which
// parts carry the prediction. Known leak, small: readiness is measured against today's top 30 threats.
// Usage: node experiments/grade-check.mjs   (writes out/grade_check.json; read-only otherwise)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), APP = ROOT + 'app/', OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const M = rd('matches.json'), MT = rd('model_train.json'); if (!M || !MT) { console.log('needs out/matches.json and out/model_train.json'); process.exit(1); }
const ev = M.events, ord = [...ev.keys()].sort((a, b) => ev[a][1] < ev[b][1] ? -1 : 1), lo = Math.floor(ord.length * .8), future = new Set(ord.slice(lo)), cutDate = ev[ord[lo]][1];
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
// past record and future games per team (g[2] === 1: the first team won)
const past = new Map(), fut = new Map(), fg = [];
for (const g of G) { const f = future.has(g[3]); for (const [t, w] of [[g[0], g[2] === 1 ? 1 : 0], [g[1], g[2] === 1 ? 0 : 1]]) { const S = f ? fut : past, o = S.get(t) || {g: 0, w: 0}; o.g++; o.w += w; S.set(t, o); } if (f) fg.push(g); }
const need = [...new Set(fg.flatMap(g => [g[0], g[1]]))];
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/model': MT, 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = APP + 'grade-check.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3500);
console.log('model in page is the past-only one:', await pg.evaluate(() => window.__ev('!!(META.model&&META.model.updated&&META.model.updated.startsWith("2026-10-30"))')), '| cut', cutDate, '| future games', fg.length, '| teams to grade', need.length);
const comp = {};
for (let i = 0; i < need.length; i += 100) {
  const chunk = need.slice(i, i + 100).map(t => [t, M.teams[t]]);
  const r = await pg.evaluate(ch => window.__ev(`(()=>{const out={};for(const [t,k] of ${JSON.stringify(ch)}){try{const ps=k.split('|').map(n=>byName.get(n));if(ps.length!==6||ps.some(p=>!p))continue;
    const ms=assignItems(ps.map(p=>abMember(p))),RD=THR.teamReport(ms),CK=proChecks(ms,true),miss=CK?CK.items.filter(x=>!x.skip&&!x.ok&&x.k!=='reach').length:0,mp=CH.modelPts(ms);
    out[t]={ready:RD.score,miss,mp:mp==null?0:mp}}catch(e){}}return JSON.stringify(out)})()`), chunk);
  Object.assign(comp, JSON.parse(r)); if (i % 500 === 0) process.stdout.write(`  graded ${Object.keys(comp).length}\r`);
}
await b.close(); fs.unlinkSync(page);
// the parts and the grade as the site makes it (past record only, the same blend: weight g/(g+100) from 30 games)
const GMISS = 6, K = 100, rs = wr => Math.min(100, Math.max(0, 70 + (wr - .5) * 200)), clamp = v => Math.min(100, Math.max(0, v));
const pr = t => { const p = past.get(t); return p && p.g >= 30 ? p : null; };
const P = {
  'readiness alone': t => comp[t].ready,
  'missed checks alone (fewer is better)': t => -comp[t].miss,
  'team strength alone (real-games model)': t => comp[t].mp,
  'our check (readiness − checks + strength)': t => clamp(comp[t].ready - GMISS * comp[t].miss + comp[t].mp),
  'past real win rate alone (30+ past games, else average)': t => { const p = pr(t); return p ? p.w / p.g : .5; },
  'the grade as on the site (check + past record blended)': t => { const c = comp[t].ready - GMISS * comp[t].miss + comp[t].mp, p = pr(t); if (!p) return clamp(c); const w = p.g / (p.g + K); return clamp((1 - w) * c + w * rs(p.w / p.g)); },
};
const res = {cutDate, futureGames: fg.length, graded: Object.keys(comp).length, games: {}, teams: {}};
const usable = fg.filter(g => comp[g[0]] && comp[g[1]]); res.gamesUsed = usable.length;
for (const [name, f] of Object.entries(P)) { let right = 0, n = 0, ties = 0;
  for (const g of usable) { const a = f(g[0]), c = f(g[1]); if (Math.abs(a - c) < 1e-9) { ties++; continue; } n++; if ((a > c) === (g[2] === 1)) right++; }
  res.games[name] = {acc: +(right / n * 100).toFixed(1), decided: n, ties}; }
// teams with 10+ future games: correlation of each predictor with their future win rate, weighted by games; and top vs bottom third
const T = [...fut].filter(([t, o]) => o.g >= 10 && comp[t]); res.teamsUsed = T.length;
const wcorr = (xs, ys, ws) => { const W = ws.reduce((a, b) => a + b, 0), mx = xs.reduce((a, x, i) => a + x * ws[i], 0) / W, my = ys.reduce((a, y, i) => a + y * ws[i], 0) / W;
  let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { sxy += ws[i] * (x - mx) * (ys[i] - my); sxx += ws[i] * (x - mx) ** 2; syy += ws[i] * (ys[i] - my) ** 2; }); return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0; };
for (const [name, f] of Object.entries(P)) { const xs = T.map(([t]) => f(t)), ys = T.map(([, o]) => o.w / o.g), ws = T.map(([, o]) => o.g);
  const idx = xs.map((x, i) => i).sort((a, c) => xs[a] - xs[c]), third = Math.floor(idx.length / 3), wr = ix => { let w = 0, g = 0; for (const i of ix) { w += ys[i] * ws[i]; g += ws[i]; } return g ? w / g : 0; };
  res.teams[name] = {corr: +wcorr(xs, ys, ws).toFixed(2), bottomThirdWins: +(wr(idx.slice(0, third)) * 100).toFixed(1), topThirdWins: +(wr(idx.slice(-third)) * 100).toFixed(1)}; }
fs.writeFileSync(OUT + 'grade_check.json', JSON.stringify(res, null, 1));
console.log(`\nFuture games used: ${res.gamesUsed} (both teams graded) · teams with 10+ future games: ${res.teamsUsed} · cut ${cutDate}\n`);
console.log('In each future game, did the higher-scoring team win?  (coin flip = 50%)');
for (const [k, v] of Object.entries(res.games)) console.log(`  ${String(v.acc).padStart(5)}%  ${k}  (${v.decided} games, ${v.ties} ties)`);
console.log('\nTeams with 10+ future games: correlation with their future win rate, and win rate of the bottom vs top third');
for (const [k, v] of Object.entries(res.teams)) console.log(`  r=${String(v.corr).padStart(5)}  bottom third ${v.bottomThirdWins}% → top third ${v.topThirdWins}%  ${k}`);

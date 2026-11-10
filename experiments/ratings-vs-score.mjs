// Focus plan f1-ratings (Nov 10): do the Ratings page (each Pokémon's rating, rating(p).total) and the Strength Score's own
// Pokémon values (model.json mons) agree? Spearman rank correlation over Pokémon that have both, on the built page with the live
// model. Also all, and the 40 most used. Lists the biggest disagreements. Usage: node experiments/ratings-vs-score.mjs
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = ROOT + `app/rvs-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const rows = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{const M=META.model.mons,out=[];for(const p of suggestPool()){const v=M[p.n];if(v==null)continue;let r=null;try{r=rating(p).total}catch(e){}if(r==null)continue;out.push({n:p.n,r,v,u:(p.use||p.usage||0)})}return JSON.stringify(out)})()`));
await b.close(); fs.unlinkSync(page);
const rank = a => { const s = a.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]), r = new Array(a.length); s.forEach(([, i], k) => r[i] = k); return r; };
const sp = R => { if (R.length < 5) return null; const a = rank(R.map(x => x.r)), c = rank(R.map(x => x.v)), n = R.length, ma = (n - 1) / 2; let num = 0, da = 0, dc = 0; for (let i = 0; i < n; i++) { num += (a[i] - ma) * (c[i] - ma); da += (a[i] - ma) ** 2; dc += (c[i] - ma) ** 2; } return num / Math.sqrt(da * dc); };
console.log(`${rows.length} Pokémon with both a rating and a score value: rank agreement (Spearman) ${sp(rows).toFixed(2)}`);
const hi = rows.filter(x => x.r >= 70); console.log(`rated 70+: ${hi.length} Pokémon, agreement ${sp(hi)?.toFixed(2)}`);
const rr = rank(rows.map(x => x.r)), vr = rank(rows.map(x => x.v)), d = rows.map((x, i) => ({...x, gap: rr[i] - vr[i]})).sort((a, c) => c.gap - a.gap);
console.log('Rated much higher than the score values them:', d.slice(0, 8).map(x => `${x.n} (rating ${x.r.toFixed(0)}, value ${x.v.toFixed(3)})`).join(', '));
console.log('Valued much higher by the score than rated:', d.slice(-8).reverse().map(x => `${x.n} (rating ${x.r.toFixed(0)}, value ${x.v.toFixed(3)})`).join(', '));

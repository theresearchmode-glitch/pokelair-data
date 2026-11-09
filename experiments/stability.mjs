// Day-to-day stability (Nov 8, foundation plan Phase 1): the model retrains every day, so an unchanged team's grade can move
// overnight. This grades the same teams under two models one day apart (as the daily job would ship them) and reports how much
// the 0-100 rating moves: typical change, the share that move 2+ / 5+ points, and how many change letter.
// Teams: the 400 most played sixes plus recent top-4 teams, typed in without sets (as most people use My Team).
// Usage: STAB_A=out/model_dev_site.json STAB_B=out/model_d28.json node experiments/stability.mjs [out.json]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const MA = process.env.STAB_A || OUT + 'model_dev_site.json', MB = process.env.STAB_B || OUT + 'model_d28.json';
const M = rd('matches_dev.json'), cnt = new Map(); for (const g of M.m) for (const t of [g[0], g[1]]) cnt.set(t, (cnt.get(t) || 0) + 1);
const TEAMS = [...cnt].sort((a, b) => b[1] - a[1]).map(([t]) => M.teams[t].split('|')).filter(t => t.length === 6).slice(0, 400);
for (const t of ((rd('teams.json') || {}).teams || [])) if (t.mons && t.mons.length === 6) TEAMS.push(t.mons);
const L = rd('limitless.json');
async function grades(modelFile) {
  const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': JSON.parse(fs.readFileSync(modelFile, 'utf8')), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
  const page = ROOT + `app/stab-${process.pid}.html`;
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(process.env.STAB_PAGE || ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(4000);
  const r = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{const out=[];for(const ns of ${JSON.stringify(TEAMS)}){try{if(ns.some(n=>!byName.get(n))){out.push(null);continue}out.push(gradeTeam(ns.map(n=>abMember(byName.get(n)))))}catch(e){out.push(null)}}return JSON.stringify(out)})()`));
  await b.close(); fs.unlinkSync(page); return r; }
const A = await grades(MA), B = await grades(MB), L_ = s => s >= 90 ? 'A' : s >= 70 ? 'B' : s >= 30 ? 'C' : s >= 10 ? 'D' : 'F';
const d = A.map((a, i) => a != null && B[i] != null ? {a, b: B[i], d: B[i] - a} : null).filter(Boolean), abs = d.map(x => Math.abs(x.d)).sort((x, y) => x - y);
const q = f => abs[Math.floor(f * (abs.length - 1))], sh = k => (d.filter(x => Math.abs(x.d) >= k).length / d.length * 100).toFixed(1), lc = d.filter(x => L_(x.a) !== L_(x.b)).length;
console.log(`${d.length} teams graded under both models (${MA.split('/').pop()} → ${MB.split('/').pop()})`);
console.log(`typical move ${q(.5).toFixed(1)} points · 90% move under ${q(.9).toFixed(1)} · biggest ${abs.at(-1).toFixed(1)}`);
console.log(`move 2+ points: ${sh(2)}% · move 5+ points: ${sh(5)}% · change letter: ${lc} (${(lc / d.length * 100).toFixed(1)}%)`);
const big = d.map((x, i) => ({...x, ns: TEAMS[i]})).sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, 3);
console.log('biggest moves:', big.map(x => `${x.a.toFixed(0)}→${x.b.toFixed(0)} (${x.ns.join(', ')})`).join(' · '));
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({d, q50: q(.5), q90: q(.9), sh2: +sh(2), sh5: +sh(5), letterChanges: lc}));

// Why could the same sample team show different readiness? Load the page with all data, then with each meta doc missing,
// and at a few moments during load, and print the readiness each time.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), FULL = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'probe2.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
async function run(label, D, delays, mobile) { const ctx = await b.newContext({viewport: mobile ? {width: 390, height: 844} : {width: 1440, height: 900}, isMobile: !!mobile, hasTouch: !!mobile}), pg = await ctx.newPage();
  await pg.addInitScript(([D, delays]) => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), (delays && delays[p]) || 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, [D, delays]);
  await pg.goto('file://' + page); const out = [];
  for (const t of [800, 2500, 6000]) { await pg.waitForTimeout(t - (out.length ? [800, 2500, 6000][out.length - 1] : 0)); out.push(await pg.evaluate(() => { try { return window.__ev('(()=>{const ms=members(),RD=prepOf(ms);return RD?RD.score+"% "+RD.rows.filter(r=>r.level===0).length+"u":"none"})()'); } catch (e) { return 'err ' + e.message; } })); }
  console.log(label.padEnd(34), out.join('  |  ')); await ctx.close(); }
await run('full data, desktop', FULL);
await run('full data, phone', FULL, null, true);
for (const k of Object.keys(FULL)) { const D = {...FULL}; delete D[k]; await run('missing ' + k, D); }
await run('results arrives late (4s)', FULL, {'meta/results': 4000});
await run('doubles_tour arrives late (4s)', FULL, {'meta/doubles_tour': 4000});
await b.close(); fs.unlinkSync(page);

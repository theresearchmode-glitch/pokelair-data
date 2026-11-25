// Opens the built NastyPlot page with the repo's data (same harness as experiments/shots.mjs) and evaluates snippets in it.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright');
const APP = 'C:/Users/simra/code/pl-mascot/app/', OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'shots.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1440, height: 900}})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
for (const c of fs.readFileSync(process.argv[2], 'utf8').split('\n//---\n')) { try { const r = await pg.evaluate(c => window.__ev(c), c); console.log(typeof r === 'string' ? r : JSON.stringify(r)); } catch (e) { console.log('EVALERR', e.message.slice(0, 300)); } await pg.waitForTimeout(1200); }
if (process.env.SHOT) await pg.screenshot({path: process.env.SHOT, fullPage: !process.env.VIEWPORT});
await b.close(); fs.unlinkSync(page);

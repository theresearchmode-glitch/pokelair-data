// Run code inside the built page (with the repo's data) and print the result: node experiments/ev.mjs "<expression>"
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/';
const page = APP + 'ev.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const b = await chromium.launch(), pg = await (await b.newContext()).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(3500);
// the code can also come from a file (EVFILE), for long snippets with data in them
const code = process.env.EVFILE ? fs.readFileSync(process.env.EVFILE, 'utf8') : process.argv[2];
console.log(JSON.stringify(await pg.evaluate(c => window.__ev(c), code), null, 1)); await b.close(); fs.unlinkSync(page);

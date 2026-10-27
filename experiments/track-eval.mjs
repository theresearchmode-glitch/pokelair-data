// Live track records for a model file: Team Score's event-pair accuracy and the ratings' accuracy, computed by the page itself.
// Usage: node experiments/track-eval.mjs <page.html> <model.json>
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
const OUT = fileURLToPath(new URL('../out/', import.meta.url)), SRC = process.argv[2];
const page = SRC.replace(/\.html$/, '.track.html');
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(SRC, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
for (let k = 0; k < 60; k++) { const r = await pg.evaluate(() => window.__ev('tsTrack.res')); if (r) break; await pg.waitForTimeout(1000); }
console.log(JSON.stringify(await pg.evaluate(() => window.__ev('({ts: tsTrack.res, ratings: ratingTrack()})'))));
await b.close();

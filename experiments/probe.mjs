// Evaluate JS inside the built page (with real data and a chosen model): node experiments/probe.mjs <file.js>
// MODEL env picks the model json (default out/model.json). The file's last expression is returned (JSON).
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url)), APP = ROOT + 'app/', rd = f => { try { return JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': JSON.parse(fs.readFileSync(ROOT + (process.env.MODEL || 'out/model.json'), 'utf8')), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'probe.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await b.newPage(); pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
try { console.log(await pg.evaluate(c => JSON.stringify(window.__ev(c), null, 1), fs.readFileSync(process.argv[2], 'utf8'))); } catch (e) { console.log('ERR', e.message); }
await b.close(); fs.unlinkSync(page);

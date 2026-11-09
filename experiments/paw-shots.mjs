// Shady Paw preview screenshots (Sim, Nov 9): the empty My Team on phone (light, dark) and desktop (dark), from the preview build.
// Usage: node experiments/paw-shots.mjs <preview.html> <outdir>
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium, devices} = createRequire(import.meta.url)('playwright');
const [src, outDir] = process.argv.slice(2);
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {};
const D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: (L.updated || '').slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = ROOT + `app/paw-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' + fs.readFileSync(src, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
const runs = [['phone-light', {...devices['iPhone 13'], colorScheme: 'light'}], ['phone-dark', {...devices['iPhone 13'], colorScheme: 'dark'}], ['desk-dark', {viewport: {width: 1280, height: 800}, deviceScaleFactor: 1, colorScheme: 'dark'}]];
for (const [name, o] of runs) {
  const pg = await (await b.newContext(o)).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000);
  await pg.evaluate(() => window.__ev(`S.slots=normSlots([]);S.loadedId=null;render();setView('report');1`)); await pg.waitForTimeout(2000);
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(300);
  const info = await pg.evaluate(() => { const i = document.querySelector('.ar-paw'); return i ? {w: i.getBoundingClientRect().width, ok: i.complete && i.naturalWidth > 0} : null; });
  await pg.screenshot({path: `${outDir}/paw-${name}.png`}); console.log(name, JSON.stringify(info), errs.join(' | '));
}
fs.unlinkSync(page); await b.close();

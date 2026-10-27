// Screenshots of the built page for a design review: node experiments/shots.mjs <outDir> <view,...> [width] [full]
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2], W = +(process.argv[4] || 390), full = process.argv[5] === 'full', b = await chromium.launch();
fs.mkdirSync(dir, {recursive: true});
const page = APP + 'shots.html'; /* next to app/sp, so sprites load like on the published page */ fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const ctx = await b.newContext({viewport: {width: W, height: W < 700 ? 844 : 900}, deviceScaleFactor: 1, isMobile: W < 700, hasTouch: W < 700, colorScheme: process.env.DARK ? 'dark' : 'light'});
const pg = await ctx.newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
// PRE="<code>" runs inside the page first (e.g. to set up saved teams)
if (process.env.PRE) { await pg.evaluate(c => window.__ev(c), process.env.PRE); await pg.waitForTimeout(500); }
for (const v of process.argv[3].split(',')) {
  if (v === 'loadteam') { await pg.evaluate(() => { const b = document.querySelector('[data-abuse],[data-loadev],[data-evload]'); if (b) b.click(); }); await pg.waitForTimeout(800); continue; }
  if (v === 'abbtn') { await pg.evaluate(() => document.getElementById('abBtn').click()); await pg.waitForTimeout(6000); }
  else await pg.evaluate(v => { const b = document.querySelector(`.sidenav [data-view="${v}"]`) || document.querySelector(`[data-view="${v}"]`); if (b) b.click(); }, v);
  await pg.waitForTimeout(v === 'gauntlet' || v === 'coverage' ? 2500 : 700);
  await pg.screenshot({path: `${dir}/${v}_${W}.png`, fullPage: full}); }
await b.close();

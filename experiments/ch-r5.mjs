// Concept H page screenshots + default-view lengths for any set of pages, phone (light + Warm charcoal) and desktop.
// Usage: node experiments/ch-pages.mjs <outDir> <view[,view...]> [--desk]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2], views = (process.argv[3] || 'auto,matchup').split(','), desk = process.argv.includes('--desk'); fs.mkdirSync(dir, {recursive: true});
const page = APP + 'ch-pages.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync('C:/Users/simra/OneDrive/Documents/NastyPlot/nastyplot-concept-h-preview.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
// a real opponent for Battle mode: the runner-up of the latest event with a full top cut
const EV = D['meta/events'], opp = (() => { for (const e of (EV && EV.events) || []) { const t = (e.top || []).find(x => x && x.place === 2 && x.mons && x.mons.length === 6); if (t) return t.mons.map(m => m.n); } return []; })();
const b = await chromium.launch(), errs = [];
for (const scheme of ['light', 'dark']) { const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme}), pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"x"'); } catch (e) {} window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000); const T = scheme === 'dark' ? 'charcoal' : 'light';
  await pg.evaluate(() => window.__ev("try{LS.set('cc2.seenNew',WHATS_NEW.id)}catch(e){};setView('home');renderHome()")); await pg.waitForTimeout(800);
  await pg.evaluate(() => { const d = document.querySelector('details[data-chf="vs"]'); d.open = true; d.scrollIntoView({block: 'start'}); window.scrollBy(0, -70); }); await pg.waitForTimeout(500); await pg.screenshot({path: `${dir}/home-chart_${T}.png`});
  for (const m of ['light', 'dark']) { const url = await pg.evaluate(async m => window.__ev(`(async()=>{CH.shareMode='${m}';const c=await buildShareCard();return c.toDataURL('image/png')})()`), m); fs.writeFileSync(`${dir}/share-card_${m}.png`, Buffer.from(url.split(',')[1], 'base64')); }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page); console.log(errs.length ? errs.join('\n') : 'no page errors');


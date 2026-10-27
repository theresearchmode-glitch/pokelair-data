// How busy the page is while it opens: total time the browser is blocked (long tasks) in the first 8 seconds, and when
// the last one ends. Usage: node experiments/loadtime.mjs <page.html> [view=home] [runs=3]
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const OUT = fileURLToPath(new URL('../out/', import.meta.url)), rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const [src, view = 'home', runs = 3] = process.argv.slice(2), b = await chromium.launch(), res = [];
for (let r = 0; r < +runs; r++) { const ctx = await b.newContext({viewport: {width: 1280, height: 900}}), pg = await ctx.newPage();
  await pg.addInitScript(([D, view]) => { try { localStorage.setItem('cc2.view', JSON.stringify(view)); } catch (e) {}
    window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({type: 'longtask', buffered: true});
    // the real db sends its documents over time; spread them over ~1.5 s like a live load
    let k = 0; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 150 + 140 * (k++)); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, [D, view]);
  await pg.goto('file://' + src); await pg.waitForTimeout(8000);
  res.push(await pg.evaluate(() => ({blockedMs: Math.round(window.__lt.reduce((a, x) => a + x[1], 0)), tasks: window.__lt.length, quietAt: Math.round(Math.max(0, ...window.__lt.map(x => x[0] + x[1])))})));
  await ctx.close(); }
await b.close(); console.log(JSON.stringify(res));

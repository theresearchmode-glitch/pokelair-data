// Screenshots for a visual check: node app/test/shots.mjs <view,...> [width]
import fs from 'node:fs'; import {chromium} from 'playwright';
const APP = new URL('..', import.meta.url).pathname, OUT = APP + '../out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const W = +(process.argv[3] || 390), b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: W, height: W < 700 ? 844 : 1000}, deviceScaleFactor: W < 700 ? 2 : 1, isMobile: W < 700, hasTouch: W < 700, colorScheme: process.env.DARK ? 'dark' : 'light'});
const pg = await ctx.newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + APP + 'dist/test.html'); await pg.waitForTimeout(1500);
for (const v of process.argv[2].split(',')) { if (v === 'more') { await pg.evaluate(() => document.getElementById('moreBtn').click()); await pg.waitForTimeout(500); }
  else { await pg.evaluate(v => (document.querySelector(`.sidenav [data-view="${v}"]`) || document.querySelector(`[data-view="${v}"]`)).click(), v); await pg.waitForTimeout(v === 'gauntlet' || v === 'auto' ? 2500 : 700); }
  await pg.screenshot({path: `/tmp/claude-0/shot_${v}_${W}.png`}); }
await b.close();

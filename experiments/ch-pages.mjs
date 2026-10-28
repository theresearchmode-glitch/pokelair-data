// Concept H page screenshots + default-view lengths for any set of pages, phone (light + Warm charcoal) and desktop.
// Usage: node experiments/ch-pages.mjs <outDir> <view[,view...]> [--desk]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2], views = (process.argv[3] || 'auto,matchup').split(','), desk = process.argv.includes('--desk'); fs.mkdirSync(dir, {recursive: true});
const page = APP + 'ch-pages.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
// a real opponent for Battle mode: the runner-up of the latest event with a full top cut
const EV = D['meta/events'], opp = (() => { for (const e of (EV && EV.events) || []) { const t = (e.top || []).find(x => x && x.place === 2 && x.mons && x.mons.length === 6); if (t) return t.mons.map(m => m.n); } return []; })();
const errs = [], lens = {}, b = await chromium.launch();
const sizes = [[390, 844, 'phone', 'light'], [390, 844, 'phone', 'dark'], ...(desk ? [[1440, 900, 'desktop', 'light'], [1440, 900, 'desktop', 'dark']] : [])];
for (const [w, h, dev, scheme] of sizes) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: w < 700 ? 2 : 1, isMobile: w < 700, hasTouch: w < 700, colorScheme: scheme}), pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(`${dev}/${scheme}: ${e.message}`)); pg.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR_FILE|fonts/.test(m.text())) errs.push(`${dev}/${scheme} console: ${m.text().slice(0, 200)}`); });
  await pg.addInitScript(([D, opp]) => { try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"x"'); localStorage.setItem('cc2.opp', JSON.stringify(opp)); } catch (e) {} window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, [D, opp]);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000);
  await pg.evaluate(() => window.__ev(`(()=>{for(const e of (META.events&&META.events.events)||[]){const t=(e.top||[]).find(x=>x&&x.place===2&&x.mons&&x.mons.length===6);if(t){S.opp=t.mons.map(m=>m.n);break}}persist();try{LS.set('cc2.seenNew',WHATS_NEW.id)}catch(e){}})()`));
  for (const v0 of views) { const v = v0 === 'lair' ? 'ratings' : v0.replace('!', ''); await pg.evaluate(v => window.__ev(`setView(${JSON.stringify(v)});window.scrollTo(0,0)`), v); await pg.waitForTimeout(v === 'auto' || v === 'gauntlet' || v === 'coverage' ? 3500 : 1200);
    if (v0 === 'lair') { await pg.evaluate(() => { const b = document.querySelector('[data-lt="Rillaboom"]'); if (b) b.click(); }); await pg.waitForTimeout(1200); }
    if (v0 === 'auto!') { await pg.evaluate(() => window.__ev('S.box=ROSTER.map(p=>p.n);runAutoBuild()')); await pg.waitForTimeout(9000); await pg.evaluate(() => window.scrollTo(0, 0)); }
    lens[`${dev}/${scheme}/${v0}`] = await pg.evaluate(() => document.documentElement.scrollHeight);
    await pg.screenshot({path: `${dir}/${dev}_${v0.replace('!', '-built')}_${scheme === 'dark' ? 'charcoal' : 'light'}.png`, fullPage: v0 !== 'lair'}); if (v0 === 'lair') await pg.evaluate(() => window.__ev("typeof lairClose==='function'&&lairClose()")); }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);
const out = Object.fromEntries(Object.entries(lens).map(([k, v]) => [k, `${v}px = ${(v / (k.startsWith('phone') ? 844 : 900)).toFixed(1)} screens`]));
fs.writeFileSync(dir + '/lengths.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); console.log(errs.length ? errs.join('\n') : 'no page errors');

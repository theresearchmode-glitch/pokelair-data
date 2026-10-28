// Concept H screenshots + page lengths of the real built page (Home, Team collapsed/expanded, scouting sheet, a tapped
// threat), phone + desktop, light + Warm charcoal. Usage: node experiments/ch-shoot.mjs <outDir>
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2] || 'C:/Users/simra/OneDrive/Documents/NastyPlot/concept-h-built/v2'; fs.mkdirSync(dir, {recursive: true});
const page = APP + 'ch-shoot.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const errs = [], lens = {};
const b = await chromium.launch();
for (const [w, h, dev] of [[390, 844, 'phone'], [1440, 900, 'desktop']]) for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: w < 700 ? 2 : 1, isMobile: w < 700, hasTouch: w < 700, colorScheme: scheme}), pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(`${dev}/${scheme}: ${e.message}`)); pg.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR_FILE|fonts/.test(m.text())) errs.push(`${dev}/${scheme} console: ${m.text().slice(0, 200)}`); });
  await pg.addInitScript(D => { try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2099-01-01"'); } catch (e) {} window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000);
  const ev = c => pg.evaluate(c => window.__ev(c), c), H = () => pg.evaluate(() => document.documentElement.scrollHeight);
  const shot = async (name, full) => { await pg.waitForTimeout(500); await pg.screenshot({path: `${dir}/${dev}_${name}_${scheme === 'dark' ? 'charcoal' : 'light'}.png`, fullPage: !!full}); };
  await ev("setView('home');window.scrollTo(0,0)"); await pg.waitForTimeout(800); lens[`${dev}/${scheme}/home-with-whats-new`] = await H(); await ev("LS.set('cc2.seenNew',WHATS_NEW.id);renderHome()"); await pg.waitForTimeout(400); lens[`${dev}/${scheme}/home`] = await H(); await shot('home', true);
  await ev("setView('build');window.scrollTo(0,0)"); await pg.waitForTimeout(1500);
  await ev("document.querySelectorAll('[data-pane=build] details.chsec').forEach(d=>d.open=false)"); await pg.waitForTimeout(300); lens[`${dev}/${scheme}/team-collapsed`] = await H(); await shot('team-collapsed', true);
  await ev("['chfFix','chfPlan','repFold'].forEach(id=>{const d=document.getElementById(id);if(d)d.open=true})"); await pg.waitForTimeout(500); lens[`${dev}/${scheme}/team-expanded`] = await H(); await shot('team-expanded', true);
  await ev("document.querySelectorAll('[data-pane=build] details.chsec').forEach(d=>d.open=false);window.scrollTo(0,0);chScoutOpen()"); await shot('scout', false);
  await ev("const t=document.querySelector('#chScout [data-chthr]');t&&t.click()"); await pg.waitForTimeout(300); await ev("const d=document.querySelector('#chScout .chdet');d&&d.scrollIntoView({block:'center'})"); await shot('scout-tapped', false);
  await ev('chScoutClose()');
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);
const scr = Object.fromEntries(Object.entries(lens).map(([k, v]) => [k, `${v}px = ${(v / (k.startsWith('phone') ? 844 : 900)).toFixed(1)} screens`]));
fs.writeFileSync(dir + '/lengths.json', JSON.stringify(scr, null, 1)); console.log(JSON.stringify(scr, null, 1)); console.log(errs.length ? errs.join('\n') : 'no page errors');


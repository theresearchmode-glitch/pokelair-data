// Page-tour footage for the 30 s promos: smooth scroll-throughs of every main page (phone, dark and light) plus desktop
// stills/scrolls. Frames are JPEG sequences: <outDir>/<clip>/NNNN.jpg. Usage: node experiments/hype-record2.mjs <outDir> [clip,...]
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2], only = process.argv[3] ? process.argv[3].split(',') : null; fs.mkdirSync(dir, {recursive: true});
const page = APP + 'rec2.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
async function session(scheme, desk) { const ctx = await b.newContext(desk ? {viewport: {width: 1440, height: 900}, deviceScaleFactor: 1.5, colorScheme: scheme} : {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme}), pg = await ctx.newPage();
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"x"'); } catch (e) {} }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3500);
  await pg.addStyleTag({content: '.welcome,#welcomeCard,#wnewCard,.toast,#healthBar,.hfb{display:none!important}'}); return {ctx, pg}; }
const ev = (pg, c) => pg.evaluate(c => window.__ev(c), c);
// one clip: hold, eased scroll down by up to `dist` px, hold
async function tour(pg, name, setup, dist = 1400, k = 60, wait = 600) { if (only && !only.includes(name)) return;
  await ev(pg, setup); await pg.waitForTimeout(wait); await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(200);
  const d = `${dir}/${name}`; fs.mkdirSync(d, {recursive: true}); let n = 0; const shot = () => pg.screenshot({path: `${d}/${String(++n).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 88});
  const max = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight); const total = Math.max(0, Math.min(dist, max));
  for (let i = 0; i < 8; i++) await shot();
  let prev = 0; for (let i = 1; i <= k; i++) { const e = i / k, y = total * (e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2); await pg.evaluate(s => window.scrollBy(0, s), y - prev); prev = y; await shot(); }
  for (let i = 0; i < 8; i++) await shot(); console.log(name, n, 'frames, scrolled', Math.round(total)); }
const TEAM = "S.slots=DEFAULT_TEAM.slots.map(s=>({...s}));fixSlots();render();";
for (const [scheme, desk, sfx] of [['dark', false, ''], ['light', false, '_light'], ['dark', true, '_desk']]) {
  const {ctx, pg} = await session(scheme, desk);
  await tour(pg, 'home' + sfx, "setView('home')", 2200, 70);
  await tour(pg, 'team' + sfx, TEAM + "setView('build')", 1700);
  if (sfx === '') {
    await tour(pg, 'ratings', "setView('ratings')", 1600);
    await tour(pg, 'meta', "setView('meta')", 1400);
    await tour(pg, 'cores', "setView('cores')", 1200);
    await tour(pg, 'topteams', "setView('top')", 1400);
    await tour(pg, 'speed', TEAM + "setView('speed')", 1500);
    await tour(pg, 'calc', TEAM + "setView('calc')", 1300);
    await tour(pg, 'gauntlet', TEAM + "setView('gauntlet')", 1300, 60, 3000);
    await tour(pg, 'matchup', TEAM + "S.opp=['Incineroar','Rillaboom','Sneasler','Kingambit','Salamence-Mega','Basculegion'];render();setView('matchup')", 1800);
    await tour(pg, 'autobuild', TEAM + "ui.abSrc='all';setView('auto');runAutoBuild()", 1600, 60, 6500);
    await tour(pg, 'sets', "setView('sets')", 1200);
    await tour(pg, 'arch', "setView('arch')", 1200);
    await tour(pg, 'saved', TEAM + "S.teams.push({id:'t2',name:'Rain Archaludon',slots:['Pelipper','Archaludon','Basculegion','Kingambit','Incineroar','Rillaboom'].map(n=>({n,a:null,lock:false})),format:'doubles',saved:Date.now()});ui.cmp=[S.teams[0].id,'t2'];render();setView('teams')", 1200);
  }
  if (sfx === '_desk') { await tour(pg, 'ratings_desk', "setView('ratings')", 1200); await tour(pg, 'matchup_desk', TEAM + "S.opp=['Incineroar','Rillaboom','Sneasler','Kingambit','Salamence-Mega','Basculegion'];render();setView('matchup')", 1200); }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);

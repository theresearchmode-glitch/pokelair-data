// High-resolution phone captures of the real page for the hype video (3x pixel density, full-page where useful).
// Usage: node experiments/hype-capture.mjs <outDir>
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2]; fs.mkdirSync(dir, {recursive: true});
const page = APP + 'cap.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
async function session(scheme) { const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: scheme}), pg = await ctx.newPage();
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3500); await pg.evaluate(() => window.__ev("document.querySelectorAll('.welcome,.welcomecard,#welcome').forEach(x=>x.remove());0"));
  // full-page shots: hide the fixed bottom menu (it would float mid-image) and the Sleepers section
  await pg.addStyleTag({content: '.bnav,.sleepers,#lairSleep,.toast,#healthBar{display:none!important}'}); return {ctx, pg}; }
const ev = (pg, c) => pg.evaluate(c => window.__ev(c), c);
const shot = async (pg, name, full) => { await pg.waitForTimeout(700); await pg.screenshot({path: `${dir}/${name}.png`, fullPage: !!full}); console.log('captured', name); };
for (const scheme of ['dark', 'light']) { const {ctx, pg} = await session(scheme); const sfx = scheme === 'dark' ? '' : '_light';
  await ev(pg, "setView('home');window.scrollTo(0,0)"); await shot(pg, 'home' + sfx, true);
  await ev(pg, "setView('build');window.scrollTo(0,0)"); await shot(pg, 'team' + sfx, true);
  if (scheme === 'dark') {
    await ev(pg, "ui.tsbrk=true;render();setView('build');const d=document.querySelector('.tsbrk');d&&(d.open=true);window.scrollTo(0,0)"); await shot(pg, 'breakdown');
    await ev(pg, "S.slots[1]={n:'Pikachu',a:null,lock:false};planCache={key:null,plans:[]};render();setView('build');const s=document.getElementById('sugs');s&&s.scrollIntoView({block:'start'})"); await shot(pg, 'fixplans');
    await ev(pg, "S.slots=DEFAULT_TEAM.slots.map(s=>({...s}));render();ui.abSrc='all';setView('auto');runAutoBuild()"); await pg.waitForTimeout(6000); await ev(pg, "const o=document.getElementById('abOut');o&&o.scrollIntoView({block:'start'})"); await shot(pg, 'build');
    await ev(pg, "ui.abLock='Annihilape';setView('auto');runAutoBuild()"); await pg.waitForTimeout(6000); await ev(pg, "const o=document.getElementById('abOut');o&&o.scrollIntoView({block:'start'})"); await shot(pg, 'buildaround'); await ev(pg, "ui.abLock=null");
    await ev(pg, "setView('calc');window.scrollTo(0,0)"); await shot(pg, 'calc', true);
    await ev(pg, "S.opp=['Incineroar','Rillaboom','Sneasler','Kingambit','Salamence-Mega','Basculegion'];render();setView('matchup');window.scrollTo(0,0)"); await shot(pg, 'battle', true);
    await ev(pg, "setView('speed');window.scrollTo(0,0)"); await shot(pg, 'speed', true);
    await ev(pg, "setView('gauntlet');window.scrollTo(0,0)"); await pg.waitForTimeout(2500); await shot(pg, 'gauntlet', true);
    await ev(pg, "setView('ratings');window.scrollTo(0,0)"); await shot(pg, 'ratings', true);
    await ev(pg, "lairSheet('Annihilape')"); await shot(pg, 'annihilape');
    await ev(pg, "const sh=document.getElementById('lairSheet');sh&&(sh.hidden=true);setView('home');const s=document.querySelector('.sleepers');s&&s.scrollIntoView({block:'start'})"); await shot(pg, 'sleepers');
    await ev(pg, "S.teams.push({id:'t2',name:'Rain Archaludon',slots:['Pelipper','Archaludon','Basculegion','Kingambit','Incineroar','Rillaboom'].map(n=>({n,a:null,lock:false})),format:'doubles',saved:Date.now()});ui.cmp=[S.teams[0].id,'t2'];setView('teams');render();window.scrollTo(0,0)"); await shot(pg, 'compare');
    await ev(pg, "setView('home');jumpOpen();const i=document.getElementById('jumpIn');i.value='char';jumpRender()"); await shot(pg, 'search'); await ev(pg, "jumpClose()");
    await ev(pg, "setView('top');window.scrollTo(0,0)"); await shot(pg, 'teams', true);
  }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);

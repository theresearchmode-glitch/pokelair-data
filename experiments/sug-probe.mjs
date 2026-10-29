// Do suggestions load for a given team on My team? Opens Home first (like a real visit), then My team.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = 'C:/Users/simra/code/pokelair-data/app/', OUT = 'C:/Users/simra/code/pl-h/out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const TEAM = (process.argv[2] || 'Pelipper,Froslass-Mega,Kingambit,Raichu-Mega-Y,Primarina,Sylveon').split(',');
const page = APP + 'sug-probe.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
console.log(await pg.evaluate(t => window.__ev(`(()=>{const T=${JSON.stringify(t)};const miss=T.filter(n=>!byName.get(n));S.slots=T.filter(n=>byName.get(n)).map(n=>({n}));try{fixSlots()}catch(e){};persist();setView('home');render();return 'set '+members().map(m=>m.d).join(', ')+(miss.length?' | unknown: '+miss.join(','):'')})()`), TEAM));
await pg.waitForTimeout(800); await pg.evaluate(() => window.__ev("setView('report')")); await pg.waitForTimeout(2500);
console.log(await pg.evaluate(() => window.__ev(`(()=>{const L=ui.planList||[];return 'plans '+L.length+' | ready '+(prepOf(members())||{}).score+'% | first: '+(L[0]?L[0].ch.map(x=>(x.out?x.out.d+' -> ':'+ ')+x.c.p.d).join(', '):'none')+' | Fix it shows: '+(document.getElementById('chSugOut').innerText.slice(0,140).replace(/\\n/g,' / '))})()`)));
console.log('swaps page (Best additions):', await pg.evaluate(() => window.__ev(`(()=>{setView('coverage');return ''})()`)));
await pg.waitForTimeout(2500); console.log(await pg.evaluate(() => 'recs ' + (window.__ev('(ui.recs||[]).length')) + ' | ' + document.getElementById('recList').innerText.slice(0, 160).replace(/\n/g, ' / ')));
console.log(errs.length ? 'errors: ' + errs.join(' | ') : 'no page errors'); await b.close(); fs.unlinkSync(page);

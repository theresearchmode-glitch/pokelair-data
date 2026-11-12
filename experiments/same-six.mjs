// Same-output check for My Team's six (R4 group "six", Nov 11): the stage (tiles in plan order, lock and × on each tile, empty
// "+ Add a Pokémon" spots), the game plan line, every Pokémon's set card (role, rating, nature, stat points, buttons), Set as lead
// and "Use NastyPlot's pick", lock, remove and Undo, and the add box in an empty spot (live search, the in-box tag, usage %,
// Species Clause note, no matches, Enter adds), on full, partial and stale-lead teams, through today's own buttons.
// Compares the slots, the lead pick, the toast, the stage's HTML, the set card's HTML, Home's plan line and the add list after every step.
// Left out as noise (today's page against itself differs there): the order of class names, the name-fit and spacing marks added a moment after drawing (data-nf, data-rz) and the tile cursor a timer drops in (its place beside the sprite varies), a hidden editor's leftover text.
// Usage: node experiments/same-six.mjs before.html after.html   (DUMP=file.json writes every step)
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path';
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = fileURLToPath(new URL('../out/', import.meta.url)), rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (path.resolve(f)));
const TEAMS = [['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'], ['Pelipper', 'Archaludon', 'Basculegion', 'Incineroar', 'Garchomp', 'Sneasler'],
  ['Kingambit', 'Sinistcha', 'Floette-Mega', 'Torkoal', 'Dragonite'], ['Garchomp', 'Incineroar'], ['Gengar-Mega', 'Kingambit', 'Whimsicott'], ['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom']];
const steps = [];
TEAMS.forEach((t, k) => { steps.push(`TEAM(${JSON.stringify(t)})`); for (let i = 0; i < t.length; i++) steps.push(`SET(${i})`); if (k === 4) steps.push(`S.leads=['Kingambit','Gengar-Mega'];render()`); });
steps.push(`TEAM(${JSON.stringify(TEAMS[0])})`, `SET(5)`, `CLICK({arlead:'Sneasler'})`, `SET(5)`, `SET(1)`, `CLICK({arlead:'Whimsicott'})`, `CLICK({arlead:''})`, `SET(3)`,
  `CLICK({arlead:'Rillaboom'})`, `S.slots[4]={n:'',a:null,lock:false};render()`, `CLICK({lock:3})`, `CLICK({lock:3})`, `CLICK({lock:0})`, `CLICK({chrm:2})`, `$('toastUndo').click()`, `CLICK({chrm:5})`,
  `CLICK({lock:5})`, `TEAM(${JSON.stringify(TEAMS[5])})`, `CLICK({chedit:5})`, {type: 'mega sal'}, {type: 'garch'}, {type: 'zzzq'}, {type: 'hisuian arc'}, {type: 'drag'}, {key: 'ArrowDown'}, {key: 'Escape'},
  {type: 'mega sal', key: 'Enter'}, `CLICK({chrm:5})`, `CLICK({chedit:5})`, {type: 'sal', key: 'Enter'}, `TEAM([])`, `CLICK({chedit:0})`, {type: 'incin', key: 'Enter'});
const b = await chromium.launch(), out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  const page = f.replace(/\.html$/, '.s6-' + process.pid + k + '.html');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const p = await b.newPage({viewport: {width: 1280, height: 900}});
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.box', '[]'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto(pathToFileURL(page).href); await p.waitForTimeout(3500);
  await p.evaluate(() => window.__ev(`window.CLICK=d=>{const x=document.createElement('button');x.type='button';Object.assign(x.dataset,d);document.body.appendChild(x);x.click();x.remove()};
    S.box=['Salamence','Dragonite','Archaludon','Garchomp'];
    window.TEAM=t=>{S.slots=t.map(n=>({n,a:null,lock:false}));while(S.slots.length<6)S.slots.push({n:'',a:null,lock:false});S.leads=null;S.loadedId=null;ui.rzSet=undefined;render();setView('report',false)};
    window.SET=i=>{const e=document.querySelector('.ar-team [data-chset="'+i+'"]');if(e)e.click()};
    window.NORM=h=>(h||'').replace(/[?]r=[0-9]+/g,'').replace(/ data-retry="[0-9]+"/g,'').replace(/ data-arb="1"/g,'').replace(/ data-clr="[^"]*"/g,'').replace(/ data-(nf|rz)="[^"]*"/g,'').replace(/<span class="ar-cursor" aria-hidden="true"><[/]span>/g,'').replace(/ style="[^"]*"/g,'').replace(/ class="([^"]*)"/g,(m,c)=>' class="'+c.split(' ').filter(x=>x&&x!=='in').sort().join(' ')+'"');
    window.SNAP=()=>{const st=document.querySelector('#chTeam .ar-stage'),set=$('rzSet'),menu=document.querySelector('#chEdit .menu'),inp=document.querySelector('#chEdit input[placeholder]'),hp=document.querySelector('[data-pane="home"] .ar-gameplan');
      return JSON.stringify({slots:S.slots,leads:S.leads||null,toast:($('toast')||{}).textContent,stage:NORM(st&&st.outerHTML),set:set&&!set.hidden?NORM(set.outerHTML):null,home:hp?hp.textContent:null,
        edit:$('chEdit')&&!$('chEdit').hidden?(($('chEdit').querySelector('h2,h3')||{}).textContent||''):null,input:inp&&!$('chEdit').hidden?inp.value:null,menu:menu?NORM(menu.innerHTML):null})}`));
  const snaps = [];
  for (const st of steps) { await p.waitForTimeout(650);
    if (typeof st === 'object') { const sel = '#chEdit input[placeholder]';
      if (st.type != null) { await p.fill(sel, ''); await p.type(sel, st.type, {delay: 15}); await p.waitForTimeout(350); }
      if (st.key) { await p.press(sel, st.key); await p.waitForTimeout(600); }
      snaps.push(JSON.stringify(st) + ' ' + await p.evaluate(() => { try { renderHome(); } catch (e) {} return window.__ev('SNAP()'); })); continue; }
    snaps.push(st.slice(0, 40) + ' ' + await p.evaluate(c => window.__ev(`(()=>{try{${c}}catch(e){return 'ERR '+e.message}return ''})()`), st) + await p.evaluate(() => { try { window.__ev('renderHome()'); } catch (e) {} return window.__ev('SNAP()'); })); }
  out[k] = snaps; await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
console.log(`${out.a.length} My Team six steps compared: ${same} identical, ${diff.length} different; last state ${out.a[out.a.length - 1].length} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => { let j = 0; while (j < x.length && x[j] === y[j]) j++; console.log('  step', i, x.slice(0, 50), '\n   a:', x.slice(Math.max(0, j - 150), j + 250), '\n   b:', y.slice(Math.max(0, j - 150), j + 250)); });
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);

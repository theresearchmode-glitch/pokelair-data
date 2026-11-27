// Same-output check for saved teams (R4, Nov 11): runs the same save / update / cancel / open / undo / rename / delete / 10-team-limit
// steps in two builds through today's buttons and compares the saved teams, the open team, what the page shows after each step and
// the Saved Teams list itself (each sort).
// Usage: node experiments/same-saved.mjs before.html after.html   (DUMP=file.json writes every step)
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path';
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = fileURLToPath(new URL('../out/', import.meta.url)), rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (path.resolve(f)));
const b = await chromium.launch(), out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  const page = f.replace(/\.html$/, '.ss.html');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const p = await b.newPage({viewport: {width: 1280, height: 900}});
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto(pathToFileURL(page).href); await p.waitForTimeout(3500);
  const steps = [
    `S.slots=normSlots(TEAM.map(n=>({n,a:null,lock:false})));fixSlots();S.loadedId=null;render()`,
    `$('saveBtn').click()`, `$('saveName').value='Rain One';$('saveNew').click()`,
    `S.slots[0]=normSlots([{n:OTHER,a:null,lock:false}])[0];render()`, `$('saveBtn').click()`, `$('saveName').value='   ';$('saveOver').click()`,
    `$('saveBtn').click()`, `$('saveName').value='  Second  ';$('saveNew').click()`,
    `$('saveBtn').click()`, `$('saveCancel').click()`,
    `CLICK({load:S.teams[0].id})`, `const u=$('toastUndo');if(u)u.click()`, `CLICK({load:S.teams[0].id})`,
    `CLICK({rn:S.teams[0].id})`, `$('rn_'+S.teams[0].id).value='  Renamed  ';CLICK({rnok:S.teams[0].id})`,
    `CLICK({rn:S.teams[0].id})`, `$('rn_'+S.teams[0].id).value='   ';CLICK({rnok:S.teams[0].id})`,
    `CLICK({del:S.teams[1].id})`, `CLICK({delx:1})`, `CLICK({del:S.teams[1].id})`, `CLICK({delok:S.teams[1].id})`,
    `CLICK({delok:S.teams[0].id})`,
    ...Array.from({length: 11}, (_, i) => `$('saveBtn').click();if(!$('saveName'))$('saveBtn').click();$('saveName').value='Team ${i}';$('saveNew').click()`),
    `S.slots=normSlots(TEAM.slice(0,4).map(n=>({n,a:null,lock:false})));fixSlots();S.loadedId=null;render();$('saveBtn').click();if(!$('saveName'))$('saveBtn').click();CLICK({delok:S.teams[2].id});$('saveName').value='Four only';$('saveNew').click()`,
    `ui.sort='name';renderSaved()`, `ui.sort='rating';renderSaved()`, `ui.sort='recent';renderSaved()`,
    `S.loadedId=S.teams[3].id;render();$('saveBtn').click();if(!$('saveName'))$('saveBtn').click();$('saveName').value='Over 3';$('saveOver').click()`,
  ];
  await p.evaluate(() => window.__ev(`window.TEAM=[];for(const e of META.events.events)for(const t of e.top||[])if(!TEAM.length&&t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)))TEAM=t.mons.map(m=>m.n);
    window.OTHER=[...byName.keys()].find(n=>!TEAM.includes(n));
    window.CLICK=d=>{const x=document.createElement('button');x.type='button';Object.assign(x.dataset,d);document.body.appendChild(x);x.click();x.remove()};
    window.SNAP=()=>JSON.stringify({teams:S.teams.map(t=>({id:t.id,name:t.name,slots:t.slots.map(s=>s.n),format:t.format})),order:S.teams.map(t=>t.saved).map((v,i,a)=>a.filter(x=>x<v).length),
      loaded:S.loadedId,slots:S.slots.map(s=>s.n),saving:!!ui.saving,renaming:ui.renaming||null,del:ui.confirmDel||null,undo:!!ui.undo,
      toast:($('toast')||{}).textContent,title:($('teamTitle')||{}).textContent,btn:($('saveBtn')||{}).textContent,count:($('savedCount')||{}).textContent,
      panel:!!$('saveName'),over:!!$('saveOver'),full:!!($('saveNew')&&$('saveNew').disabled),list:($('savedList')||{}).innerHTML})`));
  const snaps = [];
  for (const st of steps) { await p.waitForTimeout(520); snaps.push(await p.evaluate(c => window.__ev(`(()=>{try{${c}}catch(e){return 'ERR '+e.message}return ''})()`) + window.__ev('SNAP()'), st)); }
  // team ids are made from the clock and a random number: number them by first appearance instead
  const ids = new Map(); out[k] = snaps.map(s => { const pre = s.slice(0, s.indexOf('{')), j = JSON.parse(s.slice(pre.length));
    for (const t of j.teams) if (!ids.has(t.id)) ids.set(t.id, 'T' + ids.size);
    let x = s; for (const [id, T] of ids) x = x.split(id).join(T); return x; });
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
console.log(`${out.a.length} save/open/rename/delete steps compared: ${same} identical, ${diff.length} different; last state ${out.a[out.a.length - 1].length} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => console.log('  step', i, '\n   a:', x.slice(0, 400), '\n   b:', y.slice(0, 400)));
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);

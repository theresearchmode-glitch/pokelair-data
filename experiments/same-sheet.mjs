// Same-output check for the Team Sheet: renders the Team Sheet page for real tournament teams (some partial, some with the
// player's own nature and stat points) in two builds and compares the HTML. Usage: node experiments/same-sheet.mjs before.html after.html
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
  out[k] = await p.evaluate(() => window.__ev(`(()=>{ const res=[], E=META.events.events, teams=[];
    for(const e of E) for(const t of e.top||[]) if(t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n))) teams.push(t.mons.map(m=>m.n));
    const pick=teams.filter((_,i)=>i%Math.max(1,Math.floor(teams.length/30))===0).slice(0,30);
    const cases=[...pick.map(t=>[t,null]),...pick.slice(0,6).map(t=>[t.slice(0,2),null]),...pick.slice(6,12).map((t,i)=>[t,{nat:['Adamant','Timid','Modest','Jolly','Bold','Calm'][i],v:[2,32,0,0,0,32]}])];
    for(const [tm,sp] of cases){ S.slots=normSlots(tm.map(n=>({n,a:null,lock:false}))); if(sp){S.slots[0].sp={doubles:{nat:sp.nat,v:sp.v}};} fixSlots(); render(); setView('sheet',false); render();
      const o=document.getElementById('npSheetOut'); res.push([tm.join('/')+(sp?' '+sp.nat:''), o?o.innerHTML:'']); }
    return res; })()`));
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x[1] === out.b[i][1]) same++; else diff.push(x[0]); });
console.log(`${out.a.length} Team Sheets compared: ${same} identical, ${diff.length} different; sheet chars ${out.a.reduce((s, x) => s + x[1].length, 0)}`); diff.slice(0, 4).forEach(d => console.log('  differs:', d));
process.exit(diff.length ? 1 : 0);

// Usage: node experiments/same-team.mjs before.html after.html (e.g. a saved dist/page.html and the new one)
// Same-output check for logic extractions: renders My Team (its Strength Score, and Suggestions once the background planner finishes) for real tournament teams, partial teams and an
// illegal team in two builds and compares the page HTML and the score object.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = new URL('../out/', import.meta.url).pathname, rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (f.startsWith('/') ? f : process.cwd() + '/' + f));
const b = await chromium.launch(); const out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  const page = f.replace(/\.html$/, '.run.html');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const ctx = await b.newContext({viewport: {width: 1280, height: 900}}), p = await ctx.newPage();
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto('file://' + page); await p.waitForTimeout(3500);
  out[k] = await p.evaluate(() => window.__ev(`(async()=>{ const res=[]; const settle=async()=>{for(let i=0;i<400&&(planJob||(planCache.key!==planKeyOf($('useAbil').checked))||(typeof ckWinNeeded==='function'&&ckWinNeeded()));i++){await new Promise(r=>setTimeout(r,25))} render(); await new Promise(r=>setTimeout(r,30)); render();}; const E=META.events.events; const teams=[];
    for(const e of E) for(const t of e.top||[]) if(t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n))) teams.push(t.mons.map(m=>m.n));
    const pick=teams.filter((_,i)=>i%Math.max(1,Math.floor(teams.length/40))===0).slice(0,40);
    const cases=[...pick.map(t=>[t,'six']),...pick.slice(0,10).map(t=>[t.slice(0,3),'three']),...pick.slice(10,14).map(t=>[[t[0],t[0],...t.slice(2)],'dupe'])];
    for(const [tm,kind] of cases){ S.format='doubles'; S.slots=[...tm,'','','','','',''].slice(0,6).map(n=>({n,a:null,lock:false})); fixSlots();
      render(); setView('report',false); render(); await settle();
      const sug=document.getElementById('sugs'); const sugTxt=sug?sug.innerHTML:''; const plTxt=JSON.stringify((ui.planList||[]).map(pl=>pl.ch.map(x=>(x.out?x.out.p.n:'+')+'>'+x.c.p.n)));
      const pane=document.querySelector('[data-pane="report"]'); const G=ui.vsum&&ui.vsum.RD?CH.gradeOf(prepOf(members()),ui.vsum.CK,members()):null;
      res.push([kind+' '+tm.join('/'), sugTxt+'|#|'+plTxt+'|#|'+(pane?pane.innerHTML.replace(/ data-t0="[^"]*"/g,'').replace(/--ph:-?[0-9.]+s/g,'--ph'):''), JSON.stringify(G,(k2,v)=>k2==='CK'?undefined:v)]); }
    return res; })()`));
  await ctx.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0, diff = [];
for (let i = 0; i < out.a.length; i++) { const x = out.a[i], y = out.b[i]; if (x[1] === y[1] && x[2] === y[2]) same++; else { if (!diff.length && process.env.DUMP) { fs.writeFileSync(process.env.DUMP + '.a', x[1] + '\n' + x[2]); fs.writeFileSync(process.env.DUMP + '.b', y[1] + '\n' + y[2]); } diff.push(x[0]); } }
console.log(`${out.a.length} My Team states compared: ${same} identical, ${diff.length} different`); diff.slice(0, 5).forEach(d => console.log('  differs:', d));
const nonEmpty = out.a.filter(x => x[2]).length; console.log(`a score in ${nonEmpty} of them; page chars ${out.a.reduce((s, x) => s + x[1].length, 0)}`);
process.exit(diff.length ? 1 : 0);

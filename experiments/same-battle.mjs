// Usage: node experiments/same-battle.mjs before.html after.html (e.g. a saved dist/page.html and the new one)
// Same-output check for logic extractions: renders Battle for real tournament matchups in two builds and compares the HTML.
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
  out[k] = await p.evaluate(() => window.__ev(`(()=>{ const res=[]; const E=META.events.events; const teams=[];
    for(const e of E) for(const t of e.top||[]) if(t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n))) teams.push(t.mons.map(m=>m.n));
    const pick=teams.filter((_,i)=>i%Math.max(1,Math.floor(teams.length/34))===0).slice(0,34);
    const ui0=JSON.stringify(bmUi);
    for(let i=0;i<pick.length;i++){ const me=pick[i], th=pick[(i+7)%pick.length];
      S.format='doubles'; S.slots=me.map(n=>({n,a:null,lock:false})); fixSlots(); S.opp=[...th];
      for(const st of [{},{weather:'rain',tr:true,intMe:true},{tw:true,icy:true,weather:'sun',intThem:true},{par:true,weather:'',tab:'dmg'}]){
        Object.assign(bmUi,JSON.parse(ui0),st); render(); setView('matchup',false); renderBattle();
        const mine=members(),theirs=oppTeam(),r=planMatchup(mine,theirs,true);
        res.push([me.join('/')+' vs '+th.join('/')+' '+JSON.stringify(st), document.getElementById('bmOut').innerHTML, turnOnePlan(mine,theirs,r)]); }
      S.opp=[th[0],th[1],'','','','']; Object.assign(bmUi,JSON.parse(ui0)); render(); renderBattle(); res.push([me.join('/')+' vs 2', document.getElementById('bmOut').innerHTML,'']); }
    return res; })()`));
  await ctx.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0, diff = [];
for (let i = 0; i < out.a.length; i++) { const x = out.a[i], y = out.b[i]; if (x[1] === y[1] && x[2] === y[2]) same++; else diff.push(x[0]); }
console.log(`${out.a.length} Battle states compared: ${same} identical, ${diff.length} different`); diff.slice(0, 5).forEach(d => console.log('  differs:', d));
const nonEmpty = out.a.filter(x => x[2]).length; console.log(`turn one drawn in ${nonEmpty} of them; Battle body chars ${out.a.reduce((s, x) => s + x[1].length, 0)}`);
process.exit(diff.length ? 1 : 0);

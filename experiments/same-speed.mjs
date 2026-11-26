// Usage: node experiments/same-speed.mjs before.html after.html (e.g. a saved dist/page.html and the new one)
// Same-output check (Nov 13, speedData extraction): renders today's Speed Tiers for real tournament teams under every condition
// and weather in two builds and compares the HTML.
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path';
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = fileURLToPath(new URL('../out/', import.meta.url)), rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (path.resolve(f)));
const b = await chromium.launch(); const out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  const page = f.replace(/\.html$/, '.run.html');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const ctx = await b.newContext({viewport: {width: 1280, height: 900}}), p = await ctx.newPage();
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto(pathToFileURL(page).href); await p.waitForTimeout(3500);
  out[k] = await p.evaluate(() => window.__ev(`(()=>{ const res=[]; const E=META.events.events; const teams=[];
    for(const e of E) for(const t of e.top||[]) if(t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n))) teams.push(t.mons.map(m=>m.n));
    const pick=teams.filter((_,i)=>i%Math.max(1,Math.floor(teams.length/30))===0).slice(0,30); pick.push([]);
    const ui0=JSON.stringify(spdUi);
    for(const me of pick){ S.format='doubles'; S.slots=me.map(n=>({n,a:null,lock:false})); fixSlots(); render();
      for(const st of [{},{tw:true},{twOpp:true},{icy:true},{par:true},{tr:true},{tw:true,tr:true,par:true},{wx:''},{wx:'rain'},{wx:'sun',icy:true},{wx:'sand'},{wx:'snow',twOpp:true}]){
        Object.assign(spdUi,JSON.parse(ui0),st); renderSpeed(); res.push($('spdCtl').innerHTML+' ||| '+$('spdOut').innerHTML); } }
    Object.assign(spdUi,JSON.parse(ui0)); return res; })()`));
  await ctx.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = []; out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push(i); });
console.log(`same-speed: ${out.a.length} speed tiers compared (31 teams incl. empty x 12 condition sets): ${same} identical, ${diff.length} different`);
if (diff.length) { const i = diff[0]; console.log('first difference at', i); let j = 0; while (out.a[i][j] === out.b[i][j]) j++; console.log('A:', out.a[i].slice(Math.max(0, j - 60), j + 700)); console.log('B:', out.b[i].slice(Math.max(0, j - 60), j + 700)); console.log('different cases:', diff.slice(0, 40).join(',')); }
process.exit(diff.length ? 1 : 0);

// Same-output check for "Your games" (R4, Nov 11): logging games with the open six through today's buttons (leads picked, their team
// from Battle mode, a Pokémon removed, wins and losses, Undo), enough games for the insights; compares the log, the panel state
// and the Your games card after every step (times replaced by their order, so two runs compare).
// Usage: node experiments/same-record.mjs before.html after.html   (DUMP=file.json writes every step)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = new URL('../out/', import.meta.url).pathname, rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (f.startsWith('/') ? f : process.cwd() + '/' + f));
const b = await chromium.launch(), out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  const page = f.replace(/\.html$/, '.ss.html');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const p = await b.newPage({viewport: {width: 1280, height: 900}});
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto('file://' + page); await p.waitForTimeout(3500);
  const LG = (r, opp) => [`CLICK({qlopen:1})`, `CLICK({qllead:TQ[0][0]})`, `CLICK({qllead:TQ[0][1]})`, `CLICK({qllead:TQ[0][2]})`, ...(opp ? [`S.opp=${opp}.slice();CLICK({qlbm:1})`, `CLICK({qloppx:0})`] : []), `CLICK({qlres:'${r}'})`];
  const steps = [
    `setView('report');S.log=[];S.slots=normSlots(TQ[0].map(n=>({n,a:null,lock:false})));fixSlots();S.loadedId=null;render()`,
    ...LG('W'), `$('myRec').querySelector('[data-qlundo]').click()`, ...LG('W', 'OPP1'), ...LG('L', 'OPP1'), ...LG('L', 'OPP2'), ...LG('W'), ...LG('L', 'OPP1'),
    `CLICK({qlopen:1})`, `CLICK({qlres:'W'})`, `CLICK({qlopen:1})`, `CLICK({qllead:TQ[0][3]})`, `CLICK({qlres:'L'})`, ...LG('L', 'OPP2'), `CLICK({qlopen:1})`, `CLICK({qlopen:1})`,
    `S.slots=normSlots(TQ[1].map(n=>({n,a:null,lock:false})));fixSlots();render()`, ...LG('W'),
    `S.slots=normSlots(TQ[0].slice(0,5).map(n=>({n,a:null,lock:false})));fixSlots();render()`, `CLICK({qlres:'W'})`,
  ];
  await p.evaluate(() => window.__ev(`window.TQ=[];for(const e of META.events.events)for(const t of e.top||[])if(TQ.length<4&&t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)))TQ.push(t.mons.map(m=>m.n));
    window.OPP1=TQ[2];window.OPP2=TQ[3];
    window.CLICK=d=>{const x=document.createElement('button');x.type='button';Object.assign(x.dataset,d);document.body.appendChild(x);x.click();x.remove()};
    window.NORM=h=>h.replace(/[0-9]{12,14}/g,'T').replace(/[?]r=[0-9]+/g,'').replace(/ data-retry="[0-9]+"/g,'').replace(/ data-arb="1"/g,'').replace(/ style="[^"]*"/g,'');
    window.SNAP=()=>NORM(JSON.stringify({teams:[],log:(S.log||[]).map((x,i)=>({...x,t:i})),ql:{open:ui.ql.open,leads:ui.ql.leads,opp:ui.ql.opp,last:ui.ql.last&&ui.ql.last.r},toast:($('toast')||{}).textContent,card:($('myRec')||{}).innerHTML||''}))`));
  const snaps = [];
  for (const st of steps) { await p.waitForTimeout(520);
    snaps.push(await p.evaluate(c => window.__ev(`(()=>{try{${c}}catch(e){return 'ERR '+e.message}return ''})()`) + window.__ev('SNAP()'), st)); }
  // team ids are made from the clock and a random number: number them by first appearance instead
  const ids = new Map(); out[k] = snaps.map(s => { const pre = s.slice(0, s.indexOf('{')), j = JSON.parse(s.slice(pre.length));
    for (const t of j.teams) if (!ids.has(t.id)) ids.set(t.id, 'T' + ids.size);
    let x = s; for (const [id, T] of ids) x = x.split(id).join(T); return x; });
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
console.log(`${out.a.length} Your games steps compared: ${same} identical, ${diff.length} different; last state ${out.a[out.a.length - 1].length} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => console.log('  step', i, '\n   a:', x.slice(0, 400), '\n   b:', y.slice(0, 400)));
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);

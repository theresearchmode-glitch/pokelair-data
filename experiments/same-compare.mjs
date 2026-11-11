// Same-output check for Compare (R4, Nov 11): opens Compare from My Team, picks team B from event winners, a saved team and a
// pasted team, swaps, changes team A, shows more winners, compares a partial team and a team with itself; compares the whole
// Compare page (headers, picker, What's different, every row, Why these grades, Same on both) after each step, once both
// sides are worked out.
// Usage: node experiments/same-compare.mjs before.html after.html   (DUMP=file.json writes every step)
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
  const steps = [
    `setView('report');S.slots=normSlots(TQ[0].map(n=>({n,a:null,lock:false})));fixSlots();S.loadedId=null;render();cxGo('cur','')`,
    `CLICK({cxset:'B|e:'+W[0]})`, `CLICK({cxswap:1})`, `CLICK({cxswap:1})`, `CLICK({cxpick:'B'})`, `CLICK({cxwmore:1})`, `CLICK({cxset:'B|e:'+W[3]})`,
    `CLICK({cxpick:'A'})`, `CLICK({cxset:'A|s:'+S.teams[0].id})`, `CLICK({cxpick:'B'})`, `$('cxPaste').value='hello';CLICK({cxpaste:'B'})`,
    `$('cxPaste').value=P2;CLICK({cxpaste:'B'})`, `CLICK({cxswap:1})`, `CLICK({cxpick:'A'})`, `CLICK({cxpickx:1})`,
    `S.slots=normSlots(TQ[1].slice(0,4).map(n=>({n,a:null,lock:false})));fixSlots();render();cxGo('cur','e:'+W[1])`,
    `S.slots=normSlots(TQ[0].map(n=>({n,a:null,lock:false})));fixSlots();render();cxGo('cur','e:'+W[2])`, `cxGo('e:'+W[1],'e:'+W[2])`,
    `ui.cx.same=true;renderCompare()`, `cxGo('cur','cur')`, `S.slots=normSlots([]);fixSlots();render();cxGo('cur','e:'+W[0])`,
  ];
  await p.evaluate(() => window.__ev(`window.TQ=[];for(const e of META.events.events)for(const t of e.top||[])if(TQ.length<3&&t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)))TQ.push(t.mons.map(m=>m.n));
    window.W=tsPool().filter(x=>x.t.place===1).map(x=>x.key);
    const k=S.slots;S.slots=normSlots(TQ[2].map(n=>({n,a:null,lock:false})));fixSlots();window.P2=exportPaste();S.slots=k;
    window.CLICK=d=>{const x=document.createElement('button');x.type='button';Object.assign(x.dataset,d);document.body.appendChild(x);x.click();x.remove()};
    window.NORM=h=>h.replace(/[?]r=[0-9]+/g,'').replace(/ data-retry="[0-9]+"/g,'').replace(/ data-arb="1"/g,'').replace(/ style="(?!color)[^"]*"/g,'');
    window.SNAP=()=>JSON.stringify({teams:S.teams.map(t=>({id:t.id})),cx:{A:ui.cx.A,B:ui.cx.B,pick:ui.cx.pick,same:ui.cx.same,wmore:ui.cx.wmore},toast:($('toast')||{}).textContent,out:NORM(($('cxOut')||{}).innerHTML||'')})`));
  const snaps = [];
  for (const st of steps) { await p.waitForTimeout(520);
    await p.evaluate(c => window.__ev(`(()=>{try{${c}}catch(e){return 'ERR '+e.message}return ''})()`), st).then(r => { if (r) snaps.push('ERR ' + r); });
    for (let i = 0; i < 80; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => !document.querySelector('.cxbusy'))) break; }
    await p.waitForTimeout(300); snaps.push(await p.evaluate(() => window.__ev('SNAP()'))); continue;
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
console.log(`${out.a.length} Compare steps compared: ${same} identical, ${diff.length} different; last state ${out.a[out.a.length - 1].length} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => console.log('  step', i, '\n   a:', x.slice(0, 400), '\n   b:', y.slice(0, 400)));
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);

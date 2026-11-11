// Same-output check for the Suggestions controls on today's My Team (R4, Nov 11): Suggest from, Megas on team, Swap my Mega,
// the suggestion cards (Show more, Why?, Apply, the Undo bar, toast Undo), the Protect fix, "Nothing to fix", the Problems and
// Team Checks fold (problem rows, Quick add, Show more / less, the team checks card, the verdict) and the "?" bubbles, through
// today's own buttons, on several teams. After every step it compares the team, the settings, the toast, the "?" bubble and the
// HTML of the whole Suggestions part (#chP1, which holds the fold, #needs, #chkCard and #verdict).
// Usage: node experiments/same-sugctl.mjs before.html after.html   (DUMP=file.json writes every step)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const OUT = new URL('../out/', import.meta.url).pathname, rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const [A, B] = process.argv.slice(2).map(f => (f.startsWith('/') ? f : process.cwd() + '/' + f));
const TEAM = ['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'];
const SAMPLE = ['Charizard-Mega-Y', 'Whimsicott', 'Basculegion', 'Kingambit', 'Garchomp', 'Sneasler'];
const NOMEGA = ['Pelipper', 'Archaludon', 'Basculegion', 'Incineroar', 'Garchomp', 'Sneasler'];
const set = t => `S.slots=normSlots(${JSON.stringify(t)}.map(n=>({n,a:null,lock:false})));ui.undo=null;ui.undoStack=[];render()`;
const steps = [
  set(TEAM), `CLICK({chpool:'all'})`, `CLICK({chpool:'box'})`, `CLICK({chpool:'boxfill'})`, `const s=$('poolSel');s.value='all';s.dispatchEvent(new Event('change',{bubbles:true}))`, `CLICK({chpool:'boxfill'})`,
  `CLICK({megas:'0'})`, `CLICK({megas:'1'})`, `CLICK({megas:'2'})`, `CLICK({chswapm:'1'})`, `CLICK({chswapm:'0'})`,
  `document.querySelector('[data-sugmore]').click()`, `$('chfFix').open=true`, `$('needsMore').click()`, `$('needsMore').click()`,
  `TIP('readiness')`, `TIP('checklist')`, `document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))`,
  `document.querySelector('[data-pane="report"] [data-plan]').click()`, `document.querySelector('[data-undobar]').click()`,
  `CLICK({chpool:'all'})`, `document.querySelector('[data-pane="report"] [data-plan]').click()`, `document.querySelector('[data-pane="report"] [data-plan]').click()`,
  `document.querySelector('[data-undobar]').click()`, `document.querySelector('[data-undobar]').click()`, `CLICK({chpool:'boxfill'})`,
  `document.querySelector('[data-qa]').click()`, `$('toastUndo').click()`, `[...document.querySelectorAll('[data-qa]')].pop().click()`, `document.querySelector('[data-undobar]').click()`,
  `S.slots[0].mv={doubles:['Heat Wave','Solar Beam','Weather Ball','Hurricane']};S.slots[3].mv={doubles:['Encore','Moonblast','Tailwind','Taunt']};render()`, `document.querySelector('[data-protfix]').click()`, `$('toastUndo')&&$('toastUndo').click()`,
  set(SAMPLE), `document.querySelector('[data-sugmore]')&&document.querySelector('[data-sugmore]').click()`, set(NOMEGA), `CLICK({megas:'0'})`, `CLICK({megas:'2'})`, `CLICK({chswapm:'1'})`, `CLICK({chpool:'box'})`, `CLICK({chpool:'boxfill'})`,
  set(TEAM.slice(0, 3)), `CLICK({chswapm:'0'})`, `S.slots[1].lock=true;render()`, set(['Garchomp', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler']),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => `EVT(${i})`), `$('chfFix').open=false`, set(TEAM),
];
const b = await chromium.launch(), out = {};
for (const [k, f] of [['a', A], ['b', B]]) {
  const page = f.replace(/\.html$/, '.sc.html');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(f, 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const p = await b.newPage({viewport: {width: 1280, height: 900}});
  await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2099-01-01"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto('file://' + page); await p.waitForTimeout(3500);
  await p.evaluate(() => window.__ev(`setView('report',false);
    window.CLICK=d=>{const x=document.createElement('button');x.type='button';Object.assign(x.dataset,d);document.body.appendChild(x);x.click();x.remove()};
    window.TIP=k=>{const b=document.querySelector('[data-pane="report"] [data-tip="'+k+'"]');if(b)b.click();return !!b};
    window.EVT=i=>{const E=META.events.events,t=[];for(const e of E)for(const x of e.top||[])if(x.mons&&x.mons.length===6&&x.mons.every(m=>byName.get(m.n)))t.push(x.mons.map(m=>m.n));const q=t[Math.floor(i*t.length/8)];S.slots=normSlots(q.map(n=>({n,a:null,lock:false})));render()};
    window.NORM=h=>h.replace(/[?]r=[0-9]+/g,'').replace(/ style="--d:[^"]*"/g,'');
    window.READY=()=>!planJob&&planCache.key===planKeyOf($('useAbil').checked)&&!ckWin.busy;
    window.SNAP=()=>{const t=$('toast');return JSON.stringify({team:S.slots.map(s=>s.n+(s.lock?'*':'')+(s.mv?':'+JSON.stringify(s.mv):'')),pool:ui.pool,ls:localStorage.getItem('cc2.pool'),mg:[S.megaGoal,S.maxMega],swap:$('swapMega').checked,
      toast:t?t.textContent:'',tip:($('tipPop')||{}).innerText||'',undo:(ui.undoStack||[]).map(x=>x.label),plans:(ui.planList||[]).map(pl=>pl.ch.map(x=>(x.out?x.out.p.n:'+')+'>'+x.c.p.n).join('&')),
      p1:NORM(($('chP1')||{}).innerHTML||''),sugs:NORM(($('sugs')||{}).innerHTML||'')})}`));
  const snaps = [];
  for (const st of steps) {
    const r = await p.evaluate(c => window.__ev(`(()=>{try{${c}}catch(e){return 'ERR '+e.message}return ''})()`), st);
    await p.waitForTimeout(300); for (let i = 0; i < 200; i++) { if (await p.evaluate(() => window.__ev('READY()'))) break; await p.waitForTimeout(100); } await p.waitForTimeout(450);
    snaps.push(r + await p.evaluate(() => window.__ev('SNAP()'))); }
  out[k] = snaps; await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
const errs = out.a.filter(x => x.startsWith('ERR')).length;
console.log(`${out.a.length} Suggestions steps compared: ${same} identical, ${diff.length} different; ${errs} steps threw in both (${out.a.map((x, i) => x.startsWith('ERR') ? i : null).filter(x => x != null).join(',')}); last state ${out.a[out.a.length - 1].length} chars`);
for (const [i, x, y] of diff.slice(0, 3)) { let j = 0; while (j < x.length && x[j] === y[j]) j++; console.log('  step', i, steps[i].slice(0, 80), '\n   a:', x.slice(Math.max(0, j - 150), j + 250), '\n   b:', y.slice(Math.max(0, j - 150), j + 250)); }
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);

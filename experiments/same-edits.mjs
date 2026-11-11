// Same-output check for editing a set (R4, Nov 11): drives today's set editor through Ability, item, moves, nature, stat points
// (good and bad numbers), the reset buttons, lock, remove and Undo in two builds, and compares the six slots, the message, the
// stat-point warning and the whole editor's HTML after every step (minus the page's delayed decorations, see NORM). Usage: node experiments/same-edits.mjs before.html after.html
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

  // PICK(sel,value): set a control and fire its change event, as a tap on a dropdown does
  const steps = [
    `S.slots=normSlots(TEAM.map(n=>({n,a:null,lock:false})));fixSlots();S.loadedId=null;render();chEditOpen(0)`,
    `PICK('#ab0',ALT(0))`, `CLICK({abreset:0})`, `PICK('#ab0',REC(0))`,
    `IT=S.slots.findIndex((x,i)=>MEM(i)&&!MEM(i).p.m);chEditOpen(IT)`, `PICK('[data-iti="'+IT+'"]',OTHERITEM(IT))`, `CLICK({itreset:IT})`, `PICK('[data-iti="'+IT+'"]','')`, `PICK('[data-iti="'+IT+'"]',DEFITEM(IT))`, `PICK('[data-iti="'+IT+'"]',OTHERITEM(IT))`,
    `chEditOpen(2)`, `PICK('[data-mvi="2:0"]',ALTMOVE(2))`, `PICK('[data-mvi="2:3"]','')`, `CLICK({mvreset:2})`, `PICK('[data-mvi="2:1"]','Splash')`,
    `chEditOpen(3)`, `PICK('[data-spnat="3"]','Timid')`, `CLICK({spnatreset:3})`, `PICK('[data-spnat="3"]','Bold')`,
    `PTS(3,[2,32,0,0,0,32])`, `CLICK({spsave2:3})`, `PICK('[data-spnat="3"]','Calm')`, `CLICK({spnatreset:3})`, `CLICK({spptsreset:3})`, `CLICK({spptsreset:3})`,
    `PTS(3,[33,0,0,0,0,0]);CLICK({spsave2:3})`, `PTS(3,[32,32,32,0,0,0]);CLICK({spsave2:3})`, `PTS(3,[1.5,0,0,0,0,0]);CLICK({spsave2:3})`,
    `CLICK({lock:4})`, `CLICK({lock:4})`, `CLICK({lock:5})`,
    `CLICK({clear:5})`, `const u=$('toastUndo');if(u)u.click()`, `CLICK({clear:0})`,
    `chEditOpen(0)`, `ui.fresh=null;render()`,
    // the pickers on more teams: four other tournament teams, then six rarely used Pokémon (no usage data: the "suggested" labels)
    ...[1, 2, 3, 4].map(k => `S.slots=normSlots(TEAMS[${k}].map(n=>({n,a:null,lock:false})));fixSlots();render();chEditOpen(${k})`),
    `S.slots=normSlots(RARE.map(n=>({n,a:null,lock:false})));fixSlots();render();chEditOpen(0)`,
  ];
  await p.evaluate(() => window.__ev(`window.TEAM=[];for(const e of META.events.events)for(const t of e.top||[])if(!TEAM.length&&t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)&&byName.get(m.n).a.length>1))TEAM=t.mons.map(m=>m.n);
    if(!TEAM.length)for(const e of META.events.events)for(const t of e.top||[])if(!TEAM.length&&t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)))TEAM=t.mons.map(m=>m.n);
    window.TEAMS=[];for(const e of META.events.events)for(const t of e.top||[])if(t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)))TEAMS.push(t.mons.map(m=>m.n));TEAMS=TEAMS.filter((_,i)=>i%7===0);
    window.RARE=ROSTER.filter(p=>!p.m&&!U(p)).map(p=>p.n).filter((n,i,a)=>!a.slice(0,i).some(x=>byName.get(x).b===byName.get(n).b)).slice(0,6);
    window.CLICK=d=>{const x=document.createElement('button');x.type='button';Object.assign(x.dataset,d);document.body.appendChild(x);x.click();x.remove()};
    window.PICK=(sel,v)=>{const el=document.querySelector(sel);if(!el)return 'no '+sel;if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=v;el.append(o)}el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}))};
    window.PTS=(i,v)=>v.forEach((n,j)=>{const x=document.querySelector('[data-spi="'+i+':'+j+'"]');if(x){x.value=n;x.dispatchEvent(new Event('input',{bubbles:true}))}});
    window.MEM=i=>memberOf(S.slots[i],i);
    window.REC=i=>metaAbility(MEM(i).p)||bestAbility(MEM(i).p);window.ALT=i=>MEM(i).p.a.find(a=>a!==REC(i))||REC(i);
    window.DEFITEM=i=>defaultItem(MEM(i).p)||'';window.OTHERITEM=i=>itemPool().find(n=>n!==DEFITEM(i)&&!S.slots.some(s=>s.it&&Object.values(s.it).includes(n)))||'';
    window.ALTMOVE=i=>{const m=MEM(i),have=slotMoves(S.slots[i],m.p).names;return (LEARN[m.p.n]||[]).map(k=>MV[k].name).find(n=>!have.includes(n))};
    // today's page decorates the editor a moment after drawing it (arena colours: data-arb and inline style; the clear (x) wrapper
    // around name boxes; sprite reload counters ?r= / data-retry, as sprites are missing offline). Their timing varies between runs, and none of them depends on the edit, so they are left out.
    window.NORM=h=>h.replace(/[?]r=[0-9]+/g,'').replace(/ data-retry="[0-9]+"/g,'').replace(/ data-arb="1"/g,'').replace(/ data-clr="[^"]*"/g,'').replace(/ style="[^"]*"/g,'').replace(/<span class="clrw[^"]*">(<input[^>]*>)<button[^>]*>×<[/]button><[/]span>/g,'$1');
    window.SNAP=()=>JSON.stringify({slots:S.slots,toast:($('toast')||{}).textContent,undo:!!ui.undo,msg:[...document.querySelectorAll('[id^="spmsg"]')].map(x=>x.textContent).join('|'),editor:NORM(($('slots')||{}).innerHTML)})`));
  const snaps = [];
  for (const st of steps) { await p.waitForTimeout(900); snaps.push(await p.evaluate(c => window.__ev(`(()=>{let r='';try{r=(()=>{${c}})()||''}catch(e){return 'ERR '+e.message}return r})()`) + window.__ev('SNAP()'), st)); }
  out[k] = snaps;
  await p.close(); fs.unlinkSync(page);
}
await b.close();
let same = 0; const diff = [];
out.a.forEach((x, i) => { if (x === out.b[i]) same++; else diff.push([i, x, out.b[i]]); });
console.log(`${out.a.length} set-editing steps compared: ${same} identical, ${diff.length} different; editor HTML ${out.a.reduce((s, x) => s + x.length, 0)} chars`);
diff.slice(0, 3).forEach(([i, x, y]) => { let j = 0; while (j < x.length && x[j] === y[j]) j++; console.log('  step', i, '\n   a:', x.slice(Math.max(0, j - 120), j + 200), '\n   b:', y.slice(Math.max(0, j - 120), j + 200)); });
if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(out, null, 1));
process.exit(diff.length ? 1 : 0);

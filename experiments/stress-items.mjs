// Stress test for the items layer: random and adversarial teams through assignItems / itemProblems / itemFixFor.
// Defaults must never break Item Clause, never be dead on the team, never change an item you chose, and a suggested fix
// must clear the problem. Usage: node experiments/stress-items.mjs [teams=3000] [seed=3]
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', N = +(process.argv[2] || 3000), SEED = +(process.argv[3] || 3);
const page = APP + 'stress-items.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const browser = await chromium.launch(), pg = await (await browser.newContext()).newPage();
const pageErrors = []; pg.on('pageerror', e => pageErrors.push(e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(3500);
const res = await pg.evaluate(([N, SEED]) => window.__ev(`(()=>{
let seed=${SEED};const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const pick=a=>a[Math.floor(rnd()*a.length)];
const fails=[],seen=new Map();const fail=(k,x)=>{const n=(seen.get(k)||0)+1;seen.set(k,n);if(n<=4)fails.push({k,x:JSON.stringify(x).slice(0,600)})};
const ITEMS=REGMC_ITEMS.filter(i=>!STONE_RE.test(i));const FIELDY=['Psychic Seed','Grassy Seed','Electric Seed','Misty Seed','Heat Rock','Damp Rock','Smooth Rock','Icy Rock','Choice Scarf'];
const FMOVES=['Trick Room','Sunny Day','Rain Dance','Psychic Terrain','Grassy Terrain','Tailwind','Protect'].map(n=>mvByName.get(n)).filter(Boolean);
const mk=(p,mode)=>{const L=(LEARN[p.n]||[]).map(i=>MV[i]).filter(Boolean);const moves=[...new Set([...Array(4)].map(()=>rnd()<.25?pick(FMOVES):pick(L.length?L:MV)))];
  const m={p,d:p.d||p.n,ability:pick(p.a),moves,_mv:moves};const r=rnd();
  if(!p.m&&r<(mode==='chosen'?.9:mode==='clash'?1:.35))m.heldItem=mode==='clash'?'Sitrus Berry':mode==='fieldy'?pick(FIELDY):pick(ITEMS);
  if(p.m&&rnd()<.2)m.heldItem='Leftovers';return m};
let n=0;const modes=['random','chosen','clash','fieldy','megas','tr'];
for(let i=0;i<${N};i++){const mode=modes[i%modes.length];let pool=ROSTER;if(mode==='megas')pool=ROSTER.filter(p=>p.m);
  const ps=[];while(ps.length<6){const p=pick(pool);if(!ps.some(x=>x.b===p.b))ps.push(p)}
  const ms=ps.map(p=>mk(p,mode));if(mode==='tr')ms[0].moves=ms[0]._mv=[mvByName.get('Trick Room'),...ms[0].moves.slice(0,3)];
  let out;try{out=assignItems(ms)}catch(e){fail('assignItems CRASH '+e,ps.map(p=>p.n));continue}n++;
  if(out.length!==6)fail('length changed',out.length);
  for(let k=0;k<6;k++){const a=ms[k],b=out[k];if(a===b)fail('member object reused (changed in place)',a.p.n);
    if(!a.p.m&&a.heldItem&&b.item!==a.heldItem)fail('chosen item changed',{n:a.p.n,chose:a.heldItem,got:b.item});
    if(a.p.m&&!(b.item&&STONE_RE.test(b.item)))fail('Mega without its stone',{n:a.p.n,item:b.item});
    if(b.itemDefault&&b.item){if(out.some((x,j)=>j!==k&&x.item===b.item))fail('default item breaks Item Clause',{n:b.p.n,item:b.item,team:out.map(x=>x.item)});
      const F=teamField(out),tr=out.some(setsTR);if(itemDeadWhy(b,b.item,out,F,tr))fail('default item is dead on the team',{n:b.p.n,item:b.item,why:itemDeadWhy(b,b.item,out,F,tr)})}
    if(b.itemDefault&&!b.item)fail('no default item found',b.p.n)}
  let probs;try{probs=itemProblems(out)}catch(e){fail('itemProblems CRASH '+e,0);continue}
  for(const pr of probs){if(/undefined|NaN/.test(pr.why))fail('bad text in item problem',pr.why);
    for(const m of pr.ms){let fx;try{fx=itemFixFor(m,out)}catch(e){fail('itemFixFor CRASH '+e,m.p.n);continue}
      if(!fx){fail('no fix offered for a problem item',{n:m.p.n,item:m.item,k:pr.k});continue}
      const out2=out.map(x=>x===m?{...x,item:fx,heldItem:fx}:x);const still=itemProblems(out2).filter(q=>q.ms.includes(out2[out.indexOf(m)])&&q.item===fx);
      if(still.length)fail('the suggested fix is itself a problem',{n:m.p.n,from:m.item,to:fx,still:still.map(q=>q.k)})}}}
return {n,fails,counts:[...seen.entries()]}})()`), [N, SEED]);
console.log(`teams ${res.n}`); console.log('page errors:', pageErrors.length, pageErrors.slice(0, 3));
console.log('failure groups:'); for (const [k, c] of res.counts.sort((a, b) => b[1] - a[1])) console.log(`  ${c}  ${k}`);
for (const f of res.fails) console.log('\n#', f.k, '\n ', f.x);
await browser.close(); fs.unlinkSync(page);
process.exit(res.counts.length ? 1 : 0);

// Stress test for the threat engine (scouting report): random and adversarial teams. Checks: no crash, readiness a whole
// number 0-100, no solid answer that relies on a move under 85% accuracy, no solid answer from a move that does nothing,
// support threats judged by mode, and adding a Pokémon never lowers a threat's level except through the documented
// "overloaded" rule or a change of team mode (Trick Room, etc.).
// Usage: node experiments/stress-threats.mjs [teams=300] [seed=7]
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', N = +(process.argv[2] || 300), SEED = +(process.argv[3] || 7);
const page = APP + 'stress-threats.html';
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
const ths=THR.threatList();const fails=[],seen=new Map();const fail=(k,x)=>{const n=(seen.get(k)||0)+1;seen.set(k,n);if(n<=4)fails.push({k,x:JSON.stringify(x).slice(0,3000)})};
const learn=p=>(LEARN[p.n]||[]).map(i=>MV[i]).filter(Boolean);
const ITEMS=typeof REGMC_ITEMS==='object'?REGMC_ITEMS.filter(i=>!STONE_RE.test(i)):CALC_ITEMS;
const spec=(p,kind)=>{const L=learn(p);let mv;
  if(kind==='status')mv=L.filter(m=>!m.bp||m.cat===0);else if(kind==='inacc')mv=L.filter(m=>m.bp>0&&m.cat>0&&(MOVE_ACC[m.name]||100)<85);else mv=L;
  const moves=[...new Set(Array.from({length:4},()=>mv.length?pick(mv).name:null).filter(Boolean))];
  return {n:p.n,moves:moves.length?moves:undefined,item:p.m?undefined:(rnd()<.5?pick(ITEMS):undefined),ability:pick(p.a)}};
const legal=ROSTER.filter(p=>LEARN[p.n]&&LEARN[p.n].length);
const check=(tag,team)=>{let r;try{r=THR.reportSides(team.map(THR.side),ths)}catch(e){fail(tag+' CRASH '+String(e).slice(0,100),team.map(x=>x.n));return null}
  if(!(Number.isInteger(r.score)&&r.score>=0&&r.score<=100))fail(tag+' score out of range',{s:r.score,team:big.map(x=>x.n)});
  for(const row of r.rows){if(![0,1,2,3].includes(row.level))fail(tag+' bad level',row.level);
    for(const s of row.solid){const du=s.du;if(du&&du.o&&s.role!=='mode'){if(du.o.acc<85)fail(tag+' solid answer on a move under 85%',{m:s.m.n,t:row.t.n,mv:du.o.mv,acc:du.o.acc});if(!(du.o.pct>0))fail(tag+' solid answer doing 0 damage',{m:s.m.n,t:row.t.n,why:s.why})}
      if(/NaN|undefined|Infinity/.test(s.why))fail(tag+' bad text in answer',s.why)}
    for(const s of row.soft)if(/NaN|undefined|Infinity/.test(s.why))fail(tag+' bad text in soft answer',s.why)}
  return r};
let nTeams=0,mono=0,monoDrops=[];
const kinds=['normal','status','inacc','mono','sameType','floaters'];
for(let i=0;i<${N};i++){const kind=kinds[i%kinds.length];let ps;
  if(kind==='mono'){const p=pick(legal);ps=Array(6).fill(p)}
  else if(kind==='sameType'){const ty=pick(['Ghost','Flying','Steel','Fairy','Water','Dragon']);const pool=legal.filter(p=>p.t.includes(ty));ps=Array.from({length:6},()=>pick(pool))}
  else if(kind==='floaters'){const pool=legal.filter(p=>p.t.includes('Flying')||p.a.includes('Levitate'));ps=Array.from({length:6},()=>pick(pool))}
  else ps=Array.from({length:6},()=>pick(legal));
  const team=ps.map(p=>spec(p,kind==='status'?'status':kind==='inacc'?'inacc':'any'));nTeams++;
  // property (you bring 4 of 6): adding a Pokémon, in any slot, never lowers any threat's verdict or the readiness score.
  // Half the pairs are 5 -> 6, the rest a random size k -> k+1 (teams still being built)
  const kk=i%2?5:1+Math.floor(rnd()*5),big=team.slice(0,kk+1);const r6=check(kind,big);if(!r6)continue;
  const out=Math.floor(rnd()*big.length),five=big.filter((x,j)=>j!==out);const r5=check(kind+'-'+kk,five);if(!r5)continue;
  if(r6.score<r5.score)fail('adding a Pokémon lowered readiness',{from:r5.score,to:r6.score,added:big[out].n,team:team.map(x=>x.n)});
  for(let k=0;k<r6.rows.length;k++){const a=r5.rows[k],b=r6.rows[k];mono++;
    if(b.level<a.level){const why=(b.overloaded&&!a.overloaded)?'overloaded':(JSON.stringify(r5.modes)!==JSON.stringify(r6.modes))?'mode change':(a.mode||b.mode)?'support mode':'other';
      monoDrops.push(why);fail('adding a Pokémon lowered a threat level ('+why+')',{t:b.t.n,from:a.level,to:b.level,a:[a.solid.length,a.soft.length,a.losers.length,a.holders],b:[b.solid.length,b.soft.length,b.losers.length,b.holders],added:big[out].n,out,team:big})}}}
const dropCounts={};for(const w of monoDrops)dropCounts[w]=(dropCounts[w]||0)+1;
return {nTeams,nThreats:ths.length,mono,dropCounts,fails,counts:[...seen.entries()]}})()`), [N, SEED]);
console.log(`teams ${res.nTeams} (x2 with the 5-member check), threats ${res.nThreats}, threat rows compared ${res.mono}`);
console.log('page errors:', pageErrors.length, pageErrors.slice(0, 3));
console.log('level drops when a 6th Pokémon is added, by cause:', JSON.stringify(res.dropCounts));
console.log('failure groups:'); for (const [k, c] of res.counts.sort((a, b) => b[1] - a[1])) console.log(`  ${c}  ${k}`);
for (const f of res.fails) console.log('\n#', f.k, '\n ', f.x);
await browser.close(); fs.unlinkSync(page);
process.exit(res.counts.length ? 1 : 0);

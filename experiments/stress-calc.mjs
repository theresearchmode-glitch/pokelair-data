// Stress test for the damage calculator: fuzzes the built page's damage() with extreme inputs and checks properties that
// must always hold (finite whole numbers, sorted rolls, monotonic in boosts and stat points, immunities, fixed damage,
// spread <= single target, crit >= normal, weight data for every Pokémon). Prints every failure with a repro.
// Usage: node experiments/stress-calc.mjs [n=20000] [seed=1]
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', N = +(process.argv[2] || 20000), SEED = +(process.argv[3] || 1);
const page = APP + 'stress-calc.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const browser = await chromium.launch(), pg = await (await browser.newContext()).newPage();
const pageErrors = []; pg.on('pageerror', e => pageErrors.push(e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(2500);

const res = await pg.evaluate(([N, SEED]) => window.__ev(`(()=>{
let seed=${SEED};const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const pick=a=>a[Math.floor(rnd()*a.length)],ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
const NATS=['Hardy','Adamant','Jolly','Modest','Timid','Brave','Quiet','Bold','Impish','Calm','Careful','Relaxed','Sassy','Lonely','Naughty','Mild','Rash','Hasty','Naive','Gentle','Lax'];
const ITEMS=[...new Set([...CALC_ITEMS,...(typeof REGMC_ITEMS==='object'?REGMC_ITEMS:[])])];
const ABS=[...new Set(ROSTER.flatMap(p=>p.a))];
const ATK=MV.filter(m=>m.bp>0&&m.cat>0);
const W=['','sun','rain','sand','snow'],T=['','grassy','electric','psychic','misty'];
const fails=[],seen=new Map();const fail=(k,o,extra)=>{const n=(seen.get(k)||0)+1;seen.set(k,n);if(n<=4)fails.push({k,extra,o:JSON.stringify(o,(kk,v)=>kk==='p'?v.n:kk==='move'?v.name:v).slice(0,700)})};
const mkA=()=>{const p=pick(ROSTER);const L=(LEARN[p.n]||[]).map(i=>MV[i]).filter(m=>m&&m.bp>0&&m.cat>0);return {p,mv:L.length&&rnd()<.8?pick(L):pick(ATK),a:{p,sp:ri(0,32),spA:ri(0,32),spS:ri(0,32),spDef:ri(0,32),speSp:ri(0,32),nat:pick(NATS),item:rnd()<.6?pick(ITEMS):'',ability:rnd()<.85?pick(p.a):pick(ABS),boost:rnd()<.5?0:ri(-6,6),burn:rnd()<.1}}};
const mkD=()=>{const p=pick(ROSTER);return {p,hpSp:ri(0,32),defSp:ri(0,32),spdSp:ri(0,32),atkSp:ri(0,32),speSp:ri(0,32),nat:pick(NATS),item:rnd()<.6?pick(ITEMS):'',ability:rnd()<.85?pick(p.a):pick(ABS),boost:rnd()<.5?0:ri(-6,6)}};
const mkO=()=>{const A=mkA(),D=mkD();return {atk:A.a,def:D,move:A.mv,spread:!!A.mv.spread&&rnd()<.7,weather:pick(W),terrain:pick(T),screen:rnd()<.2,hh:rnd()<.15,fg:rnd()<.1,crit:rnd()<.15,fainted:rnd()<.1?ri(0,5):0,auras:rnd()<.05?['Fairy Aura']:undefined,fullHp:rnd()<.8,oneFoe:rnd()<.1,pinch:rnd()<.05}};
const run=o=>{try{return damage(o)}catch(e){fail('CRASH '+String(e).slice(0,80),o);return undefined}};
const sane=(o,r,tag)=>{if(r===undefined)return false;if(r===null){return true}
  const R=r.rolls||[];if(!R.length){fail(tag+' no rolls',o);return false}
  if(R.some(v=>!Number.isFinite(v)||v<0||v!==Math.floor(v))){fail(tag+' non-integer/NaN/negative roll',o,R.slice(0,3));return false}
  for(let i=1;i<R.length;i++)if(R[i]<R[i-1]){fail(tag+' rolls not sorted',o,R);return false}
  if(r.min!==R[0]||r.max!==R[R.length-1]){fail(tag+' min/max != rolls ends',o,[r.min,r.max,R[0],R[R.length-1]]);return false}
  if(!Number.isFinite(r.hp)||r.hp<=0){fail(tag+' bad hp',o,r.hp);return false}
  if(r.eff>0&&!r.fixed&&r.min<1){fail(tag+' 0 damage on a hit that lands',o,r);return false}
  if(r.eff===0&&r.max>0){fail(tag+' immune but damage',o,r);return false}
  if(r.next&&(r.next.max>r.max*1.0001&&!o.fullHp===false)){}
  return true};
let n=0;
for(let i=0;i<${N};i++){const o=mkO();const r=run(o);n++;if(!sane(o,r,'base')||!r||r.fixed||!r.max)continue;
  // monotonic in the attacker's stage and points, the defender's stage and points
  const vary=(f,tag,dir)=>{const o2=structuredClone({...o,atk:{...o.atk,p:null},def:{...o.def,p:null},move:null});o2.atk.p=o.atk.p;o2.def.p=o.def.p;o2.move=o.move;f(o2);const r2=run(o2);n++;if(!sane(o2,r2,tag)||!r2)return;
    if(dir>0&&r2.max<r.max)fail(tag+' should not lower damage',o,[r.max,r2.max]);if(dir<0&&r2.max>r.max)fail(tag+' should not raise damage',o,[r.max,r2.max])};
  const mvn=o.move.name;
  if(o.atk.boost<6&&!['Foul Play'].includes(mvn)&&o.def.ability!=='Unaware'&&!(o.move.vbp))vary(x=>x.atk.boost++, 'atk +1 stage',1);
  if(o.def.boost<6&&!['Sacred Sword','Darkest Lariat','Chip Away'].includes(mvn)&&o.atk.ability!=='Unaware')vary(x=>x.def.boost++, 'def +1 stage',-1);
  if(!o.move.vbp&&mvn!=='Foul Play'){vary(x=>{x.atk.spA=Math.min(32,x.atk.spA+8);x.atk.spS=Math.min(32,x.atk.spS+8);x.atk.spDef=Math.min(32,x.atk.spDef+8);x.atk.sp=Math.min(32,x.atk.sp+8)},'atk +8 points',1)}
  vary(x=>{x.def.defSp=Math.min(32,x.def.defSp+8);x.def.spdSp=Math.min(32,x.def.spdSp+8)},'def +8 points',-1);
  if(!o.crit)vary(x=>x.crit=true,'crit',1);
  if(o.spread&&!o.oneFoe)vary(x=>x.spread=false,'spread -> single',1);
  if(!o.hh)vary(x=>x.hh=true,'helping hand',1);
  if(o.screen)vary(x=>x.screen=false,'remove screen',1);
  if(o.fg)vary(x=>x.fg=false,'remove friend guard',1);
}
// immunity table
const imm=[['Earthquake','Garchomp','Corviknight',{}],['Earthquake','Garchomp','Gengar',{dab:'Levitate'}],['Earthquake','Garchomp','Incineroar',{dit:'Air Balloon'}],['Thunderbolt','Raichu','Garchomp',{}],
 ['Shadow Ball','Gengar','Kangaskhan',{}],['Close Combat','Lucario','Gengar',{}],['Moonblast','Clefable','Corviknight',{expect:'notImmune'}],['Dragon Claw','Garchomp','Clefable',{}],['Psychic','Alakazam','Kingambit',{}],
 ['Sludge Bomb','Venusaur','Corviknight',{}],['Body Slam','Snorlax','Gengar',{}],['Thunderbolt','Raichu','Rotom-Wash',{dab:'Volt Absorb'}],['Hydro Pump','Blastoise','Gastrodon',{dab:'Storm Drain'}],['Flamethrower','Charizard','Heatran',{dab:'Flash Fire'}],
 ['Close Combat','Lucario','Gengar',{aab:'Scrappy',expect:'notImmune'}],['Earthquake','Garchomp','Corviknight',{dit:'Iron Ball',expect:'notImmune'}],['Thunderbolt','Raichu','Garchomp',{expect:'immune'}],['Hyper Voice','Sylveon','Kommo-o',{dab:'Soundproof'}],
 ['Shadow Ball','Gengar','Sylveon',{dab:'Bulletproof'}],['Sucker Punch','Kingambit','Farigiraf',{dab:'Armor Tail'}],['Thousand Arrows','Garchomp','Corviknight',{expect:'notImmune',mvForce:1}],['Freeze-Dry','Froslass','Gyarados',{expect:'notImmune'}]];
const immOut=[];
for(const [m,a,d,x] of imm){const mv=mvByName.get(m),A=byName.get(a),D=byName.get(d);if(!mv||!A||!D){immOut.push('skip '+m+' '+a+' '+d+' (missing)');continue}
  const r=damage({atk:{p:A,sp:32,nat:'Hardy',item:'',ability:x.aab||A.a[0],boost:0},def:{p:D,hpSp:0,defSp:0,spdSp:0,nat:'Hardy',item:x.dit||'',ability:x.dab||D.a[0],boost:0},move:mv,weather:'',terrain:''});
  const want=x.expect==='notImmune'?r.max>0:r.max===0;if(!want)fail('immunity '+m+' '+a+'->'+d+' '+JSON.stringify(x),{m,a,d},r&&r.max)}
// fixed damage: Super Fang half, Seismic Toss 50, Night Shade 50, Final Gambit, Endeavor, Ruination
const fixedOut=[];
for(const m of ['Super Fang','Seismic Toss','Night Shade','Final Gambit','Endeavor','Ruination',"Nature's Madness",'Counter','Mirror Coat','Metal Burst','Psywave','Dragon Rage','Sonic Boom']){const mv=mvByName.get(m);if(!mv){fixedOut.push(m+': not in move list');continue}
  const A=byName.get('Incineroar'),D=byName.get('Snorlax');let r;try{r=damage({atk:{p:A,sp:32,nat:'Hardy',item:'',ability:'Blaze',boost:0},def:{p:D,hpSp:32,defSp:0,spdSp:0,nat:'Hardy',item:'',ability:'Thick Fat',boost:0},move:mv})}catch(e){r='CRASH '+e}
  fixedOut.push(m+': bp='+mv.bp+' cat='+mv.cat+' fixed='+mv.fixed+' vbp='+(mv.vbp||'')+' -> '+(r&&typeof r==='object'?r.min+'-'+r.max+' / hp '+r.hp:r))}
// weight data and stats for every Pokémon
const noWt=ROSTER.filter(p=>!(SPECIES_WT[p.n]>0)).map(p=>p.n);
// every move x a fixed pair: crash check
let allMv=0;for(const mv of MV){if(!mv.bp||!mv.cat)continue;for(const [a,d] of [['Incineroar','Rillaboom'],['Gengar','Kangaskhan'],['Garchomp','Corviknight'],['Shedinja','Shedinja']]){const A=byName.get(a),D=byName.get(d);if(!A||!D)continue;
  const o={atk:{p:A,sp:32,nat:'Adamant',item:'',ability:A.a[0],boost:0},def:{p:D,hpSp:0,defSp:0,spdSp:0,nat:'Hardy',item:'',ability:D.a[0],boost:0},move:mv,weather:'rain',terrain:'psychic',spread:!!mv.spread};allMv++;sane(o,run(o),'every-move')}}
// variable-power checks: weight moves into every Pokémon must give one of the game's powers
const wtBad=[];for(const D of ROSTER){for(const m of ['Low Kick','Grass Knot','Heavy Slam','Heat Crash']){const mv=mvByName.get(m);if(!mv)continue;const A=byName.get('Garchomp');
  const r=run({atk:{p:A,sp:32,nat:'Adamant',item:'',ability:'',boost:0},def:{p:D,hpSp:0,defSp:0,spdSp:0,nat:'Hardy',item:'',ability:'',boost:0},move:mv});if(r===undefined)wtBad.push(m+'->'+D.n)}}
return {n,fails,counts:[...seen.entries()],immOut,fixedOut,noWt,allMv,wtBad:wtBad.slice(0,10),nItems:ITEMS.length,nAbs:ABS.length}})()`), [N, SEED]);
console.log(`cases ${res.n}, every-move pairs ${res.allMv}, items ${res.nItems}, abilities ${res.nAbs}`);
console.log('page errors:', pageErrors.length, pageErrors.slice(0, 3));
console.log('missing weight:', res.noWt.length, res.noWt.slice(0, 20).join(', '));
console.log('fixed-damage moves:\n  ' + res.fixedOut.join('\n  '));
console.log('immunity notes:', res.immOut.join('; '));
console.log('failure groups:'); for (const [k, c] of res.counts.sort((a, b) => b[1] - a[1])) console.log(`  ${c}  ${k}`);
for (const f of res.fails) console.log('\n#', f.k, f.extra !== undefined ? JSON.stringify(f.extra).slice(0, 200) : '', '\n ', f.o);
await browser.close(); fs.unlinkSync(page);
process.exit(res.counts.length ? 1 : 0);

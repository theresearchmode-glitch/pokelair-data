// Stress test: Fix plans / Build plans on 1,000+ random and adversarial teams, repeated application (convergence),
// and "Build me a team" under many settings. Every suggestion must be legal, keep the Item Clause, never add a Pokémon
// already on the team, deliver what it claims, never crash or produce NaN, and repeated plans must converge.
// Usage: node experiments/stress-sugs.mjs [sugs|conv|build|all] [count]   (exit 1 on any violation)
import fs from 'node:fs'; import {openPage} from './stress-lib.mjs';
const phase = process.argv[2] || 'all', COUNT = +process.argv[3] || 1000;
const legalIds = fs.readFileSync(new URL('./regmc-legal.txt', import.meta.url), 'utf8').split(/\r?\n/).filter(Boolean).map(s => s.toLowerCase().replace(/[^a-z0-9]+/g, ''));
const {ev, errs, close} = await openPage();
// in-page helpers
await ev(`window.SB=(()=>{
  const LEG=new Set(__arg);const id0=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'');
  const baseName=p=>String(p.b||p.n).replace(/-(Alola|Galar|Hisui|Paldea.*|Mega.*|F|M|Eternal|Low-Key|Amped|Small|Large|Super|Midnight|Dusk|Blue|Yellow|White|Wash|Heat|Mow|Frost|Fan|Combat|Blaze|Aqua)$/,'');
  const isLegal=p=>!!p&&LEG.has(id0(baseName(p)));
  let seed=12345;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};const pick=a=>a[Math.floor(rnd()*a.length)];
  const R=ROSTER.slice(),byU=R.slice().sort((a,b)=>U(b)-U(a));
  const ITEMS=(()=>{const s=new Set();for(const p of R){try{(topItems(p).it||[]).forEach(r=>s.add(Array.isArray(r)?r[0]:r))}catch(e){}}return [...s].filter(Boolean)})();
  function randTeam(src,n,maxMega){const t=[];let g=0;while(t.length<n&&g++<500){const p=pick(src);if(t.some(q=>q.b===p.b))continue;if(p.m&&t.filter(q=>q.m).length>=maxMega)continue;t.push(p)}return t}
  const slotsOf=(ps,items)=>ps.map((p,i)=>{const s={n:p.n,a:null,lock:false};if(items&&items[i])s.it={doubles:items[i]};return s});
  function teams(N){seed=12345;const out=[];
    const fast=R.filter(p=>p.st&&p.st[5]>=100&&!p.m).sort((a,b)=>b.st[5]-a.st[5]),trSet=R.filter(p=>!p.m&&(LEARN[p.n]||[]).some(k=>MV[k]&&MV[k].name==='Trick Room'));
    const megas=R.filter(p=>p.m),least=byU.slice().reverse().filter(p=>!p.m);
    const adv=[['identical6',slotsOf(Array(6).fill(byU[0]))],['allMegas',slotsOf(randTeam(megas,6,6))],['sameStoneXY',slotsOf([...R.filter(p=>/Charizard-Mega/.test(p.n)),...randTeam(byU.slice(0,40).filter(p=>!p.m),4,0)])],
      ['dupItem6',slotsOf(randTeam(byU.slice(0,60).filter(p=>!p.m),6,0),Array(6).fill('Leftovers'))],['trAllFast',slotsOf([trSet.sort((a,b)=>b.st[5]-a.st[5])[0],...fast.slice(0,5)])],
      ['rocksNoSetter',slotsOf(randTeam(byU.slice(0,60).filter(p=>!p.m&&!WEATHER_OF[(metaAbility(p)||'')]),6,0),['Damp Rock','Heat Rock','Smooth Rock','Icy Rock','Psychic Seed','Room Service'])],
      ['least6',slotsOf(least.slice(0,6))],['top6',slotsOf(randTeam(byU.slice(0,6),6,2))],['top6b',slotsOf(byU.filter(p=>!p.m).slice(0,6))],['one',slotsOf([byU[0]])],['oneMega',slotsOf([megas[0]])],
      ['threeMegas',slotsOf(randTeam(megas,3,3))],['mega+base',slotsOf([megas[0],byName.get(megas[0].b),...randTeam(byU.slice(0,40),4,0)].filter(Boolean))],['junkNames',[{n:'Missingno'},{n:'Pikachu-Fake'},{n:''},{n:null},{n:42},{}]]];
    for(const [k,s] of adv)out.push({k,s});
    const nR=Math.round(N*.3),nM=Math.round(N*.2),nP=Math.round(N*.2),nI=N-nR-nM-nP;
    for(let i=0;i<nR;i++)out.push({k:'rand6',s:slotsOf(randTeam(R,6,2))});
    for(let i=0;i<nM;i++)out.push({k:'meta6',s:slotsOf(randTeam(byU.slice(0,60),6,2))});
    for(let i=0;i<nP;i++)out.push({k:'partial',s:slotsOf(randTeam(rnd()<.5?R:byU.slice(0,60),1+Math.floor(rnd()*5),2))});
    for(let i=0;i<nI;i++){const ps=randTeam(byU.slice(0,80),6,2);out.push({k:'randItems',s:slotsOf(ps,ps.map(()=>rnd()<.6?pick(ITEMS.slice(0,25)):pick(ITEMS)))})}
    return out}
  function check(team){const v=[];S.slots=JSON.parse(JSON.stringify(team.s));fixSlots();const ms=members();if(!ms.length)return {v,skip:true};
    const pool=suggestPool();let plans;const t0=performance.now();try{plans=planFixes(ms,pool,true)}catch(e){v.push('CRASH planFixes: '+e.message);return {v}}
    const dt=performance.now()-t0;const ip0=itemProblemCount(ms),mg0=megaCount(ms),dup=t=>t.length-new Set(t.map(m=>m.base)).size,dup0=dup(ms);
    const tsBase=plans.tsBase,full=ms.length===6;const spOK=t=>{try{return (gamePlan(t).rows.find(r=>r.k==='speed')||{}).st==='ok'}catch(e){return false}};const sp0=spOK(ms);
    const all=[...plans.map((pl,i)=>({pl,main:true,i})),...(plans.more||[]).map((pl,i)=>({pl,main:false,i}))];
    for(const {pl,main,i} of all){const tag=(main?'plan':'more')+i+' ['+pl.ch.map(x=>(x.out?x.out.p.n:'+')+'>'+x.c.p.n).join(', ')+']';
      if(!isFinite(pl.score))v.push(tag+': score '+pl.score);
      for(const x of pl.ch){const p=x.c.p;if(!isLegal(p))v.push(tag+': not Reg M-C legal '+p.n);if(ms.some(m=>m.base===p.b))v.push(tag+': already on team '+p.n);
        const learn=new Set((LEARN[p.n]||[]).map(k=>MV[k].name));for(const m of x.c.mem.moves||[])if(m&&!learn.has(m.name))v.push(tag+': '+p.n+' cannot learn '+m.name);
        if(x.c.mem.ability&&!p.a.includes(x.c.mem.ability))v.push(tag+': '+p.n+' has no ability '+x.c.mem.ability);
        if(isExcl(p))v.push(tag+': excluded '+p.n);
        if(x.out&&S.slots[x.out.i]&&S.slots[x.out.i].lock)v.push(tag+': swaps out a locked slot')}
      if(pl.team.length>6)v.push(tag+': team of '+pl.team.length);
      if(dup(pl.team)>dup0)v.push(tag+': species clause (two of the same Pokémon)');
      if(megaCount(pl.team)>Math.max(megaGoal(),mg0))v.push(tag+': '+megaCount(pl.team)+' Megas');
      const ip=itemProblemCount(pl.team);if(ip>ip0)v.push(tag+': item problems '+ip0+' -> '+ip);
      if(main&&full&&plans.tsOn&&tsBase!=null){const ts=tsOf(pl.team);if(pl._ts!==undefined&&pl._ts!==ts)v.push(tag+': readiness shown '+pl._ts+' but is '+ts);
        if(ts==null||!isFinite(ts))v.push(tag+': readiness '+ts);
        else if(ts<tsBase+TS_GAIN&&!(ip<ip0)&&!(!sp0&&spOK(pl.team)))v.push(tag+': claims to improve but readiness '+tsBase+' -> '+ts)}}
    return {v,dt,n:all.length,full,tsBase,ip0}}
  function applyFirst(ms,plans){const ts0=plans.tsBase;const rk=x=>{const t=x.team.length===6?tsOf(x.team):null;return t!=null&&ts0!=null&&t<=ts0-5?1:0};
    const ordered=[...plans].map((pl,i)=>({pl,i})).sort((x,y)=>rk(x.pl)-rk(y.pl)||x.i-y.i).map(x=>x.pl);const pl=ordered[0];if(!pl)return null;
    pl.ch.forEach(x=>{S.slots[x.slot]={n:x.c.p.n,a:x.c.mem.ability,lock:false}});return pl}
  function converge(team,maxSteps){S.slots=JSON.parse(JSON.stringify(team.s));fixSlots();const seen=new Set(),hist=[],v=[];
    for(let st=0;st<maxSteps;st++){const ms=members();if(!ms.length)break;const key=ms.map(m=>m.p.n+'@'+(m.item||'')).sort().join('|'); // a loop = the same six with the same items (a plan that swaps a Pokémon back with a better item is progress, Oct 28)
      if(seen.has(key)){v.push('LOOP after '+st+' steps: '+hist.join(' / '));break}seen.add(key);
      let plans;try{plans=planFixes(ms,suggestPool(),true)}catch(e){v.push('CRASH '+e.message);break}
      const ts=ms.length===6?tsOf(ms):null,ip=itemProblemCount(ms);hist.push(key.replace(/\\|/g,',')+' ts='+ts+' ip='+ip);
      const pl=applyFirst(ms,plans);if(!pl)return {v,steps:st,hist,end:'no plan'};
      const ms2=members();if(ms.length===6&&ms2.length===6){const ts2=tsOf(ms2),ip2=itemProblemCount(ms2);
        if(!(ip2<ip)&&ts2!=null&&ts!=null&&ts2<ts)v.push('step '+st+' lowered readiness '+ts+' -> '+ts2+' via '+pl.ch.map(x=>(x.out?x.out.p.n:'+')+'>'+x.c.p.n).join(','))}}
    return {v,steps:maxSteps,hist,end:'max'}}
  function build(cfg){const v=[];const save={abSrc:ui.abSrc,abLock:ui.abLock,goal:S.megaGoal,box:S.box.slice(),excl:S.excl.slice()};
    try{ui.abSrc=cfg.src;ui.abLock=cfg.lock||null;S.megaGoal=cfg.goal;S.box=cfg.box||[];S.excl=cfg.excl||[];usageCache={};
      let res;const t0=performance.now();try{res=addFreshTake(buildBest())}catch(e){return {v:['CRASH buildBest: '+e.message],cfg}}const dt=performance.now()-t0;
      if(!res||!res.teams)return {v:['no result object'],cfg};
      for(const [i,t] of res.teams.entries()){const tag='team'+i+' ['+t.mons.map(m=>m.n).join(',')+']';const ps=t.mons.map(m=>byName.get(m.n));
        if(ps.some(p=>!p))v.push(tag+': unknown Pokémon');if(t.mons.length!==6)v.push(tag+': '+t.mons.length+' members');
        if(new Set(ps.map(p=>p&&p.b)).size!==ps.length)v.push(tag+': species clause');
        const mg=ps.filter(p=>p&&p.m).length;if(mg!==cfg.goal)v.push(tag+': '+mg+' Megas, goal '+cfg.goal+(t.proven?' (proven team)':''));if(mg>2)v.push(tag+': '+mg+' Megas');
        // "Build around it" brings the chosen Pokémon even when it isn't in the box (by design)
        for(const p of ps){if(p&&!isLegal(p))v.push(tag+': illegal '+p.n);if(p&&isExcl(p))v.push(tag+': excluded '+p.n);if(p&&cfg.src==='box'&&!inBox(p)&&p.n!==cfg.lock)v.push(tag+': not in box '+p.n)}
        if(cfg.lock&&!t.mons.some(m=>m.n===cfg.lock))v.push(tag+': missing locked '+cfg.lock);
        const its=t.mons.map(m=>m.it).filter(Boolean);if(new Set(its).size!==its.length)v.push(tag+': item clause '+its.join(','));
        if(!isFinite(t.score))v.push(tag+': score '+t.score);
        try{const tA=assignItems(ps.map(p=>abMember(p)));if(itemProblems(tA).length)v.push(tag+': item problems '+itemProblems(tA).map(x=>x.k+':'+x.item).join(','))}catch(e){v.push(tag+': items crash '+e.message)}
        const ts=tsOf(ps.map(p=>abMember(p)));if(ts==null||!isFinite(ts))v.push(tag+': readiness '+ts);
        if(t.fresh&&ts!=null&&ts<60)v.push(tag+': fresh take ready only '+ts)}
      return {v,cfg,n:res.teams.length,dt,noMega:res.noMega,short:res.short,ts:res.teams.map(t=>tsOf(t.mons.map(m=>abMember(byName.get(m.n)))))}}
    finally{ui.abSrc=save.abSrc;ui.abLock=save.abLock;S.megaGoal=save.goal;S.box=save.box;S.excl=save.excl;usageCache={}}}
  function buildCfgs(N){seed=999;const out=[];const nonMega=R.filter(p=>!p.m);
    for(const goal of [0,1,2])out.push({src:'all',goal});
    for(let i=0;i<N;i++){const goal=pick([0,1,2,2]);const c={src:rnd()<.5?'all':'box',goal};
      if(c.src==='box')c.box=[...new Set(Array.from({length:6+Math.floor(rnd()*40)},()=>ownKey(pick(rnd()<.6?byU.slice(0,80):R))))];
      if(rnd()<.35)c.lock=pick(rnd()<.5?byU.slice(0,40):R).n;
      if(rnd()<.2)c.excl=Array.from({length:5},()=>pick(byU.slice(0,20)).n);
      out.push(c)}
    out.push({src:'box',goal:2,box:[]});out.push({src:'box',goal:2,box:nonMega.slice(0,5).map(ownKey)});out.push({src:'all',goal:2,lock:R.filter(p=>p.m)[0].n});out.push({src:'all',goal:0,lock:R.filter(p=>p.m)[0].n});
    return out}
  return {teams,check,converge,build,buildCfgs,isLegal}})();
  'ok'`, legalIds);
let bad = 0; const report = {};
const log = (...a) => console.log(...a);
if (phase === 'sugs' || phase === 'all') {
  const N = await ev(`SB.teams(${COUNT}).length`); log(`suggestions: ${N} teams`);
  const byKind = {}, viol = []; let plansN = 0, crashes = 0, maxDt = 0, sumDt = 0, ran = 0;
  for (let i = 0; i < N; i += 25) {
    const res = await ev(`SB.teams(${COUNT}).slice(${i},${i + 25}).map(t=>{const r=SB.check(t);return {k:t.k,names:t.s.map(s=>s&&s.n),...r}})`);
    for (const r of res) { const k = byKind[r.k] || (byKind[r.k] = {n: 0, v: 0}); k.n++; if (r.skip) continue; ran++; plansN += r.n || 0; sumDt += r.dt || 0; maxDt = Math.max(maxDt, r.dt || 0);
      if (r.v.length) { k.v++; viol.push({k: r.k, names: r.names, v: r.v}); if (r.v.some(x => x.startsWith('CRASH'))) crashes++; } }
    if (i % 200 === 0) log(`  ${i + res.length}/${N}  violations so far ${viol.length}`); }
  log(`suggestions: ${ran} teams checked, ${plansN} plans validated, avg ${Math.round(sumDt / ran)} ms, max ${Math.round(maxDt)} ms, ${viol.length} teams with violations (${crashes} crashes)`);
  for (const [k, x] of Object.entries(byKind)) log(`  ${k}: ${x.n} teams, ${x.v} with violations`);
  const agg = {}; for (const t of viol) for (const s of t.v) { const key = s.replace(/^(plan|more)\d+ \[[^\]]*\]: /, '').replace(/\d+/g, '#').slice(0, 90); agg[key] = (agg[key] || 0) + 1; }
  log('  violation kinds:'); for (const [k, c] of Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 25)) log(`   ${c}× ${k}`);
  for (const t of viol.slice(0, 12)) log(`   - ${t.k} ${t.names.join(',')}\n       ${t.v.slice(0, 4).join('\n       ')}`);
  report.sugs = {N, ran, plansN, viol}; bad += viol.length; }
if (phase === 'conv' || phase === 'all') {
  const M = Math.min(250, COUNT);
  const sel = await ev(`(()=>{const T=SB.teams(${COUNT});return T.map((t,i)=>i).filter(i=>T[i].k==='rand6'||T[i].k==='meta6'||T[i].k==='partial'||T[i].k==='randItems'||i<14).filter((_, j) => j % Math.max(1, Math.floor(T.length / ${M})) === 0).slice(0, ${M})})()`);
  log(`convergence: ${sel.length} teams, up to 8 applications each`); const viol = []; let steps = 0, ends = {};
  for (let i = 0; i < sel.length; i += 10) { const res = await ev(`(${JSON.stringify(sel.slice(i, i + 10))}).map(j=>{const t=SB.teams(${COUNT})[j];const r=SB.converge(t,8);return {k:t.k,...r}})`);
    for (const r of res) { steps += r.steps; ends[r.end] = (ends[r.end] || 0) + 1; if (r.v.length) viol.push(r); } }
  log(`convergence: ${steps} applications; ended ${JSON.stringify(ends)}; ${viol.length} with problems`);
  for (const r of viol.slice(0, 10)) log(`   - ${r.k}: ${r.v.join(' | ').slice(0, 400)}\n     ${r.hist.slice(-4).join('\n     ')}`);
  report.conv = {viol}; bad += viol.length; }
if (phase === 'build' || phase === 'all') {
  const NB = Math.max(20, Math.round(COUNT / 12));
  const cfgs = await ev(`SB.buildCfgs(${NB})`); log(`build me a team: ${cfgs.length} configurations`); const viol = []; let teams = 0, sumDt = 0, maxDt = 0, empty = 0;
  for (const c of cfgs) { const r = await ev(`SB.build(__arg)`, c); teams += r.n || 0; sumDt += r.dt || 0; maxDt = Math.max(maxDt, r.dt || 0); if (!r.n) empty++; if (r.v.length) viol.push(r); }
  log(`build: ${teams} teams from ${cfgs.length} configs (${empty} gave none), avg ${Math.round(sumDt / cfgs.length)} ms, max ${Math.round(maxDt)} ms, ${viol.length} configs with violations`);
  for (const r of viol.slice(0, 12)) log(`   - ${JSON.stringify(r.cfg).slice(0, 160)}\n       ${r.v.slice(0, 4).join('\n       ')}`);
  report.build = {viol}; bad += viol.length; }
log(`page errors: ${errs.length}${errs.length ? '\n  ' + [...new Set(errs)].slice(0, 8).join('\n  ') : ''}`); bad += errs.length;
fs.writeFileSync(new URL(`./stress-sugs-${phase}.json`, import.meta.url), JSON.stringify(report, null, 1));
await close(); console.log(bad ? `STRESS SUGS: ${bad} problems` : 'STRESS SUGS CLEAN'); process.exit(bad ? 1 : 0);

// ---------- fix planner ----------
function synergy(p,team){let s=0;const t=metaEntry(p);if(t&&t.tm)for(const [n,v] of t.tm){const q=byName.get(n);if(q&&team.some(m=>m.base===q.b))s+=(v==null?20:+v)}
  for(const m of team){const u=metaEntry(m.p);if(u&&u.tm&&u.tm.some(([n])=>{const q=byName.get(n);return q&&q.b===p.b}))s+=15}return s}
function stateScore(team,useA){const a=analyze(team,useA);const ctx=teamContext(useA?team:[]);
  const en=team.flatMap(m=>attackEntries({...m,ability:useA?m.ability:null},m._mv||memberMoves(m).moves,ctx));
  const even=a.rows.filter(t=>t.w>0&&t.w===t.r).length;const quad=a.rows.reduce((s,t)=>s+t.who.filter(o=>o.x>=4).length,0);
  const off=offenseCount(en);return {a,off,s:a.excess*100+a.unresisted.length*45+quad*6+even*3-off*4}}
// How often two Pokémon really share a team: rank in each other's official in-game teammate lists (0 to 16).
let pairCache=new Map();
function pairSyn(a,b){const k=a.p.n<b.p.n?a.p.n+'|'+b.p.n:b.p.n+'|'+a.p.n;let c=pairCache.get(k);if(c===undefined){c=pairSyn_(a,b);pairCache.set(k,c)}return c}
function pairSyn_(a,b){let s=0;const ta=setFor(a.p).tm,tb=setFor(b.p).tm;
  const ia=ta.findIndex(([n])=>{const q=byName.get(n);return q&&(q.n===b.p.n||q.b===b.p.b)}),ib=tb.findIndex(([n])=>{const q=byName.get(n);return q&&(q.n===a.p.n||q.b===a.p.b)});
  if(ia>=0)s+=8-Math.min(7,ia);if(ib>=0)s+=8-Math.min(7,ib);return s}
// Tournament evidence for a pair (doubles): how many real Reg M-C teams ran both, and how they did.
let RES=typeof RESULTS==='object'?RESULTS:null;
// Today's Limitless results (meta/results, written by the daily refresh from the pokelair-data job): used only if it
// looks complete; otherwise the snapshot built into the page stays.
function cleanResults(v){try{if(!v||typeof v!=='object')return null;const ok=Array.isArray(v.proven)&&v.proven.length>=100&&Array.isArray(v.cores)&&v.cores.length>=100&&v.pairs&&typeof v.pairs==='object'&&v.mons&&typeof v.mons==='object'&&+v.base>.4&&+v.base<.6;
  if(!ok)return null;const proven=v.proven.filter(x=>Array.isArray(x)&&Array.isArray(x[0])&&x[0].length===6&&x[0].every(n=>byName.has(n))&&isFinite(+x[2]));
  const cores=v.cores.filter(c=>Array.isArray(c)&&c.length===5&&c.slice(0,3).every(n=>byName.has(n)));return proven.length>=100?{...v,proven,cores,base:+v.base,minCore:+v.minCore||40}:null}catch(e){return null}}
function pairRes(a,b){if(!RES)return null;const k=[a.p.n,b.p.n].sort().join('|');return RES.pairs[k]||null}
// pair counts are put on the old 377-team scale so a common pair scores the same as before, whatever the data size
function tourSyn(a,b){const r=pairRes(a,b);if(!r)return 0;return Math.min(14,3*Math.log2(1+r[0]*377/(RES.teams||377)))+(r[1]-RES.base)*60}
// How a Pokémon did in real tournaments, above or below the field (doubles; shrunk, so rare picks stay near 0).
function monSuccess(p){if(!RES)return 0;const r=RES.mons[p.n];return r?(r[1]-RES.base)*100*(+r[0]||0)/((+r[0]||0)+50):0}
// Weights fitted on real tournament teams vs random usage-weighted teams, checked on held-out tournaments.
// Fitted Oct 2026: 0.82 held-out accuracy telling real tournament teams from random teams of the same Pokémon.
let TV_W={via:.05,syn:1,tsyn:.19,succ:.1,type:.04,plan:.5,threat:.05,mega:6};
// The whole model in one number (higher is better).
function teamValue(team,useA=true){const st=stateScore(team,useA),gp=gamePlan(team),tr=threatReport(team,useA),dbl=S.format==='doubles';
  const v=team.reduce((a,m)=>a+pickVia(m.p),0);let syn=0,tsyn=0;const FM=S.fun?{s:.3,t:0}:{s:1,t:1};
  for(let i=0;i<team.length;i++)for(let j=i+1;j<team.length;j++){syn+=pairSyn(team[i],team[j]);if(dbl)tsyn+=tourSyn(team[i],team[j])}
  const succ=dbl?team.reduce((a,m)=>a+monSuccess(m.p),0):0,megas=team.filter(m=>m.mega).length;
  const W=TV_W,parts={via:v*W.via,syn:syn*W.syn*FM.s,tsyn:tsyn*W.tsyn*FM.t,succ:succ*W.succ*FM.t,type:-st.s*W.type,plan:-gp.penalty*W.plan,threat:-tr.pen*W.threat,mega:(dbl&&team.length>=5&&megas===2?1:0)*W.mega};
  return {score:Object.values(parts).reduce((a,b)=>a+b,0),parts,st,gp,tr}}
// Type balance as the planner and auto-build weigh it. In 377 tournament teams the raw count of leftover weaknesses
// did not separate winners from losers (≈3.9 either way), but stacking did: teams where one type hits 3+ more members
// than resist it won 51% vs 55%, and teams with two or more types that each hit 3+ members won 50%. So stacks cost the most.
function typeShape(a){const maxStack=a.rows.reduce((m,r)=>Math.max(m,r.w-r.r),0),w3=a.rows.filter(r=>r.w>=3).length;return {maxStack,w3}}
// Leftover weaknesses count only lightly: winning tournament teams average 3.9 of them. Stacks (one type hitting 3+ more
// members than resist it, or two types each hitting 3+) and many unresisted types are what tournament results punish.
function typeEmphasis(a){const {maxStack,w3}=typeShape(a);const un=a.unresisted.length;return a.excess*4+un*4+Math.max(0,un-2)*15+Math.max(0,maxStack-2)*35+Math.max(0,w3-1)*25}
// The doubles pillars winning tournament teams almost all have (377 teams, 61 with 70%+ wins):
// speed control (90% of winners: Tailwind, Trick Room or speed drops) and spread damage (2.1 attackers on average).
function spreadUsers(team){return team.filter(m=>{const mv=m._mv&&m._mv.length?m._mv:(m.moves||[]);return mv.slice(0,6).some(x=>x.spread&&x.bp>0&&(!mv.pct||!mv.pct.size||(mv.pct.get(x.name)||0)>=40))}).length}
function pillarCost(team,gp){if(S.format!=='doubles'||team.length<5)return 0;let c=0;
  const sp=(gp.rows.find(r=>r.k==='speed')||{}).st;if(sp!=='ok')c+=sp==='part'?14:30;
  const su=spreadUsers(team);c+=Math.max(0,2-su)*7;return c}
function planFixes(ms,pool,useA,opts){
  const maxMega=megaGoal();const full=ms.length===6;
  const emptyIdx=S.slots.map((s,i)=>byName.get(s.n)?-1:i).filter(i=>i>=0);
  const base=stateScore(ms,useA);
  const swapMega=$('swapMega').checked;
  const canOut=m=>!S.slots[m.i].lock&&(!m.mega||swapMega);
  const rolesBase=teamRoles(ms);
  const cands=pool.filter(p=>!ms.some(m=>m.base===p.b)&&(inBox(p)||poolOK(p,25))).map(p=>{const mm=memberFrom(p,metaAbility(p)||undefined);const pm=runMoves(p);
    return {p,mem:{...mm,i:-1,p,d:p.d,moves:pm,_mv:pm.some(isCoverage)?pm:[]}}});
  const legal=(team)=>team.filter(m=>m.mega).length<=maxMega;
  const singles=[];
  // one change: fill an empty slot, or swap a member (a Mega only for another Mega)
  for(const c of cands){
    if(!full&&emptyIdx.length){const t=[...ms,c.mem];if(legal(t))singles.push({ch:[{out:null,slot:emptyIdx[0],c}],team:t})}
    if(full)for(const m of ms){if(!canOut(m))continue;if(m.mega&&!c.p.m&&!swapMega)continue;
      const t=ms.map(x=>x===m?{...c.mem,i:m.i}:x);if(legal(t))singles.push({ch:[{out:m,slot:m.i,c}],team:t})}}
  // Lower is better: the team's model score (teamValue), plus the type-balance emphasis (typeEmphasis),
  // a cost for losing an active archetype, and a small cost per change so plans stay minimal.
  // Mega goal: every Mega the finished team would still be short of costs a lot, so plans that bring one in rise to the top
  const evalPlan=pl=>{const tv=teamValue(pl.team,useA);let s=-tv.score+typeEmphasis(tv.st.a)+megaShort(pl.team)*35+pillarCost(pl.team,tv.gp);pl.megaShort=megaShort(pl.team);pl.tv=tv;pl.st=tv.st;pl.gp=tv.gp;pl.roles=teamRoles(pl.team);
    for(const a of rolesBase.arch)if(a.active&&a.key!=='tw'&&!pl.roles.arch.some(b=>b.key===a.key&&b.active))s+=20;
    for(const x of pl.ch){const rest=pl.team.filter(m=>m.p!==x.c.p);const v=viability(x.c.p);x.v=v;if(v<12&&!S.fun)s+=15;if(S.fun&&isMetaPick(x.c.p))s+=10;
      const f=archFit(x.c.p,x.c.mem.ability,rest,rolesBase);x.why=f.why;s-=f.s*.2;x.syn=synergy(x.c.p,rest);
      if(x.out)s+=4+(x.out.mega?6:0);if(ui.pool==='boxfill'&&!inBox(x.c.p))s+=12}
    pl.score=s;return pl};
  const basePl=evalPlan({ch:[],team:ms});
  singles.forEach(evalPlan);singles.sort((x,y)=>x.score-y.score);
  if(opts&&opts.singlesOnly)return {singles,basePl,base,full};
  // two changes, built from the strongest single changes
  // best 8 single changes per slot, so two-change plans can combine fixes for different slots
  const bySlot=new Map();for(const s of singles){const k=s.ch[0].out?s.ch[0].out.i:'add';const arr=bySlot.get(k)||[];if(arr.length<(k==='add'?10:5))arr.push(s);bySlot.set(k,arr)}
  const top=[...bySlot.values()].flat(),doubles=[];
  for(let i=0;i<top.length;i++)for(let j=i+1;j<top.length;j++){const A=top[i].ch[0],B=top[j].ch[0];
    if(A.c.p.b===B.c.p.b)continue;
    if(A.out&&B.out){if(A.out===B.out)continue;const t=ms.map(x=>x===A.out?{...A.c.mem,i:x.i}:x===B.out?{...B.c.mem,i:x.i}:x);if(legal(t))doubles.push({ch:[{...A},{...B}],team:t})}
    else if(!A.out&&!B.out&&emptyIdx.length>=2){const t=[...ms,A.c.mem,B.c.mem];if(legal(t))doubles.push({ch:[{...A,slot:emptyIdx[0]},{...B,slot:emptyIdx[1]}],team:t})}}
  doubles.forEach(evalPlan);
  const clean=base.a.excess===0&&!base.a.unresisted.length;
  // a plan must never make the type rating worse, and must beat the current team by a clear margin
  // and must never take away the team's speed control or start a weather clash
  const gpst=(pl,k)=>(pl.gp.rows.find(r=>r.k===k)||{}).st;
  const keepsPlan=pl=>!(gpst(basePl,'speed')==='ok'&&gpst(pl,'speed')!=='ok')&&!(gpst(basePl,'weather')==='ok'&&gpst(pl,'weather')==='miss');
    let all=[...singles,...doubles].filter(pl=>keepsPlan(pl)&&(!full||((pl.st.a.excess<=base.a.excess)&&pl.st.a.unresisted.length<=base.a.unresisted.length&&pl.score<basePl.score-(clean?25:10)))).sort((x,y)=>x.score-y.score);
  // Team Score decides (doubles, with the win model): every plan that ends in a full six is judged by the Team Score it reaches.
  // A plan must raise it by 2+, the highest score leads, and an extra change has to earn 2 more points. The planner's own score
  // only shortlists (the 70 most promising) and breaks ties; the type rules relax to "at most one more weakness, no new stack".
  const tsBase=useTSPick()&&full?tsOf(ms):null;let tsOn=false;
  if(useTSPick()){const sh0=typeShape(base.a).maxStack;
    const short=[...singles,...doubles].filter(pl=>pl.team.length===6&&keepsPlan(pl)&&pl.st.a.excess<=base.a.excess+1&&pl.st.a.unresisted.length<=base.a.unresisted.length+1&&typeShape(pl.st.a).maxStack<=Math.max(2,sh0)&&megaShort(pl.team)<=megaShort(ms)).sort((x,y)=>x.score-y.score).slice(0,70);
    for(const pl of short)if(pl._ts===undefined)pl._ts=tsOf(pl.team);
    if(short.some(pl=>pl._ts!=null)){tsOn=true;
      const ranked=short.filter(pl=>pl._ts!=null&&(tsBase==null||pl._ts>=tsBase+TS_GAIN)).sort((x,y)=>tsKey(y)-tsKey(x)||x.score-y.score);
      all=[...ranked,...all.filter(pl=>pl.team.length<6)]}}
  // pick up to 3 plans that don't share an incoming Pokémon or the same outgoing set
  const out=[],usedIn=new Set();
  for(const pl of all){if(out.length>=3)break;const ins=pl.ch.map(x=>x.c.p.b);if(ins.some(b=>usedIn.has(b)))continue;
    const outs=pl.ch.map(x=>x.out?x.out.i:'e'+x.slot).sort().join();if(out.some(o=>o._outs===outs&&o.ch.length===pl.ch.length&&pl.ch.length===1))continue;
    pl._outs=outs;ins.forEach(b=>usedIn.add(b));out.push(pl)}
  // speed control is the job teams most often lack: if it's missing, make sure one plan fixes it
  const sp=pl=>(pl.gp.rows.find(r=>r.k==='speed')||{}).st;
  if(basePl.gp&&sp(basePl)!=='ok'&&!out.some(pl=>sp(pl)==='ok')){
    // look past the score cutoff: any plan that adds speed control without hurting the type rating
    const pool2=[...singles,...doubles].filter(pl=>keepsPlan(pl)&&sp(pl)==='ok'&&(!tsOn||tsBase==null||pl.team.length<6||(pl._ts!==undefined?pl._ts:(pl._ts=tsOf(pl.team)))==null||pl._ts>=tsBase-3)&&pl.st.a.excess<=Math.max(base.a.excess,full?base.a.excess:base.a.excess+1)&&pl.st.a.unresisted.length<=base.a.unresisted.length+(full?0:1)).sort((x,y)=>x.score-y.score);
    const fix=pool2.find(pl=>!pl.ch.some(x=>out.some(o=>o.ch.some(y=>y.c.p.b===x.c.p.b))))||pool2[0];
    if(fix){if(out.length>=3)out.pop();out.push(fix)}}
  // More ideas: further plans with new incoming Pokémon, then (for a full team) side-grades that keep the type rating and speed control
  const more=[],inSeen=new Set(out.flatMap(pl=>pl.ch.map(x=>x.c.p.b)));
  for(const pl of all){if(more.length>=12)break;const ins=pl.ch.map(x=>x.c.p.b);if(ins.some(b=>inSeen.has(b)))continue;ins.forEach(b=>inSeen.add(b));more.push(pl)}
  if(full){const side=singles.filter(pl=>keepsPlan(pl)&&pl.st.a.excess<=base.a.excess&&pl.st.a.unresisted.length<=base.a.unresisted.length&&pl.score<=basePl.score+60&&megaShort(pl.team)<=megaShort(ms)&&(S.fun?rating(pl.ch[0].c.p).total>=35:ui.pool==='box'?rating(pl.ch[0].c.p).total>=35:rating(pl.ch[0].c.p).total>=50)).sort((x,y)=>(x.score-rating(x.ch[0].c.p).total*.3)-(y.score-rating(y.ch[0].c.p).total*.3));
    for(const pl of side){if(more.length>=18)break;const b=pl.ch[0].c.p.b;if(inSeen.has(b))continue;inSeen.add(b);pl.side=pl.score>=basePl.score-(clean?25:10);more.push(pl)}}
  out.more=more;
  out.base=base;out.rolesBase=rolesBase;out.gp=basePl.gp;out.basePl=basePl;out.baseA=basePl.st.a;out.full=full;out.tsBase=tsBase;out.tsOn=tsOn;
  out.singles=singles.filter(pl=>keepsPlan(pl)&&(full?(pl.st.a.excess<=base.a.excess&&pl.st.a.unresisted.length<=base.a.unresisted.length):pl.st.a.excess<=base.a.excess+1));return out;
}
// Game-plan jobs a plan fills or breaks, in plain words.
const GP_RANK={miss:0,opt:1,part:1,ok:2};
const GP_WORD={speed:'speed control',backup:'backup speed',trfit:'Trick Room attackers',weather:'weather',terrain:'terrain',support:'lead support (Fake Out, Intimidate or redirection)',prio:'priority',anti:'an answer to their speed control',haz:'Stealth Rock',hazrm:'hazard removal',pivot:'pivoting'};
function gpDiff(a,b){if(!a||!b)return [];const out=[];
  for(const r of b.rows){const o=a.rows.find(x=>x.k===r.k);
    if(!o){if(r.st!=='ok'&&r.note)out.push(`<span class="warnline">${esc(r.label)}</span>: ${esc(r.note)}`);continue}
    if(r.k==='prio'&&r.st==='opt')continue;const d=GP_RANK[r.st]-GP_RANK[o.st];
    if(d>0)out.push(`<b>${r.st==='ok'?'Covers':'Improves'} ${esc(GP_WORD[r.k]||r.label)}</b>${r.who?': '+esc(r.who):''}`);
    else if(d<0)out.push(`<span class="warnline">Weakens ${esc(GP_WORD[r.k]||r.label)}</span>${r.note?': '+esc(r.note):''}`)}
  return out}
function renderPlans(ms,a,plans,useA,covered){const el=$('sugs');const full=ms.length===6;
  $('sugTitle').textContent=full?'Fix plans':'Build plans';
  if(!ms.length){el.innerHTML='<div class="empty-note">Add at least one Pokémon to get plans.</div>';return}
  const base=plans.base;const more=plans.more||[],pg=ui.planMore||0,shown=more.slice(0,pg*3),left=more.length-shown.length;
  const moreBtn=`<div class="morebar">${left>0?`<button class="btn" type="button" id="planMoreBtn">More ideas</button><span class="vsub">${left} more plan${left===1?'':'s'}, including side-grades and rarely used picks</span>`:more.length?`<span class="vsub">That's every plan that keeps your type rating and speed control.</span><button class="btn sm" type="button" id="planMoreReset">Show fewer</button>`:''}</div>`;
  if(!plans.length&&!shown.length){el.innerHTML=`<div class="empty-note">${plans.tsOn&&plans.tsBase!=null?`No change from this pool raises the Team Score (${plans.tsBase}) by ${TS_GAIN} or more. Keep this team, or try "Full roster" or unlock a Pokémon.`:base&&base.a.excess===0&&!base.a.unresisted.length?'This team has no type problems, and no change from this pool makes it meaningfully better. Keep it.':'No change from this pool improves the team. Try "Full roster" or unlock a Pokémon.'}</div>`+moreBtn;return}
  // each plan's Team Score next to the current one, from the same win model, so a plan never hides that it makes the team weaker
  const baseTS=(ui.vsum&&ui.vsum.TS)||null,planTS=pl=>{if(!baseTS||pl.team.length!==6)return null;if(pl._ts===undefined)pl._ts=tsOf(pl.team);return pl._ts};
  // plans that would lower the Team Score by 5+ go after the ones that keep or raise it
  const rank=x=>{const t=planTS(x);return t!=null&&t<=baseTS.score-5?1:0};
  const ordered=[...plans].map((pl,i)=>({pl,i})).sort((x,y)=>rank(x.pl)-rank(y.pl)||x.i-y.i).map(x=>x.pl);plans.splice(0,plans.length,...ordered);
  const list=[...plans,...shown];
  el.innerHTML=list.map((pl,k)=>{const st=pl.st;const ts=planTS(pl),dT=ts!=null?ts-baseTS.score:null;
    const fixed=a.rows.filter((t,j)=>t.w>t.r&&!(st.a.rows[j].w>st.a.rows[j].r)).map(t=>t.atk);
    const nowRes=a.rows.filter((t,j)=>t.r===0&&st.a.rows[j].r>0).map(t=>t.atk);
    const newWeak=st.a.rows.filter((t,j)=>t.w>t.r&&!(a.rows[j].w>a.rows[j].r)).map(t=>t.atk);
    const syn=pl.ch.map(x=>{const t=metaEntry(x.c.p);const mates=(t&&t.tm||[]).map(([n])=>byName.get(n)).filter(q=>q&&pl.team.some(m=>m.base===q.b&&m.p!==x.c.p)).map(q=>q.d);return mates.length?`${esc(x.c.p.d)} is often paired with ${esc(mates.slice(0,2).join(' and '))}`:''}).filter(Boolean);
    const roleLines=gpDiff(plans.gp,pl.gp);
    const archLines=pl.ch.flatMap(x=>(x.why||[]).map(w=>`${esc(x.c.p.d)}: ${w}`));
    const lines=[fixed.length?`Fixes the ${fixed.join(', ')} weakness${fixed.length>1?'es':''}`:'',nowRes.length?`Adds a resist to ${nowRes.join(', ')}`:'',...roleLines,...archLines,
      newWeak.length?`New weak spot: ${newWeak.join(', ')}`:'No new weak spots',
      st.off!==covered?`Offense: ${covered} → ${st.off} of 18 types hit super effectively`:`Offense stays at ${covered} of 18 types`,...syn];
    return `<div class="plan${k>=plans.length?' idea':''}"><div class="ph"><span class="pt">${k>=plans.length?(pl.side?'Side-grade':'Idea'):'Plan'} ${k+1} · ${pl.ch.length} change${pl.ch.length>1?'s':''}</span>${dT!=null?`<span class="tsd ${dT>0?'up':dT<0?'dn':''}" title="Team Score ${baseTS.score} → ${ts}">Team Score ${dT>0?'+':dT<0?'−':'±'}${Math.abs(dT)}</span>`:''}<span class="row">${a.excess===st.a.excess?`<span class="pill ${RC(st.a.excess)}">${wsTxt(st.a)}</span>`:`<span class="pill ${RC(a.excess)}">${wsTxt(a)}</span>→<span class="pill ${RC(st.a.excess)}">${wsTxt(st.a)}</span>`}</span></div>
      ${pl.ch.map(x=>`<div class="swap">${x.out?`<span class="out">${esc(x.out.d)}</span> →`:'Add'} ${sprite(x.c.p,'mini')}<span class="in">${esc(x.c.p.d)}</span>${confChip(x.c.p)}<span class="chips">${x.c.p.t.map(t=>chip(t)).join('')}</span>${x.c.p.m?'<span class="tag mega ico" title="Mega Evolution">MEGA</span>':''}${inBox(x.c.p)?'<span class="tag box ico" title="In your box">BOX</span>':ui.pool!=='all'?'<span class="tag catch ico" title="Not in your box yet">TO CATCH</span>':''}${ratingTag(x.c.p)}${isGem(x.c.p)?'<span class="tag offmeta">HIDDEN GEM</span>':ideaTag(x.c.p)}<span class="vsub">${esc(x.c.mem.ability)}${(t=>t?' @ '+esc(t.it[0][0]):'')(topItems(x.c.p))}${U(x.c.p)?` · ${U(x.c.p).toFixed(1)}% usage`:''}</span></div>`).join('')}
      ${(()=>{const L=lines.filter(Boolean),ul=`<ul>${L.map(l=>`<li>${l}</li>`).join('')}</ul>`;return PHONE()&&L.length>2?`<details class="planwhy"><summary>${L.length} reasons</summary>${ul}</details>`:ul})()}
      ${pl.side?'<p class="t2" style="margin:0">A different look: keeps your type rating and speed control without being clearly better.</p>':''}
      <div><button class="btn sm primary" type="button" data-plan="${k}">Apply ${k>=plans.length?'this':'plan '+(k+1)}</button></div></div>`}).join('')+moreBtn;
  ui.planList=list;
}
function renderTrios(ms,useA){const el=$('trios');
  if(S.format!=='singles'||ms.length<4){el.hidden=true;el.innerHTML='';return}
  const tr=[];for(let i=0;i<ms.length;i++)for(let j=i+1;j<ms.length;j++)for(let k=j+1;k<ms.length;k++){const t=[ms[i],ms[j],ms[k]];const a=analyze(t,useA);tr.push({t,a,s:score(a)})}
  tr.sort((x,y)=>x.s-y.s);el.hidden=false;
  el.innerHTML=`<h3 class="lbl" style="margin:4px 0 8px">Strongest picks of 3 (by type matchups)</h3><div class="list">${tr.slice(0,3).map(o=>`<div class="item"><div style="min-width:0"><div class="t1">${o.t.map(m=>esc(m.d)).join(' · ')}</div><div class="t2">${o.a.weak.length?'Weak to '+o.a.weak.join(', '):'No leftover weaknesses'}${o.a.unresisted.length?` · Nothing resists ${o.a.unresisted.join(', ')}`:''}</div></div><span class="pill ${RC(o.a.excess)}">${wsTxt(o.a)}</span></div>`).join('')}</div>`}
function pctBars(arr,limit){return (arr||[]).slice(0,limit).map(([n,v])=>`<div class="bar"><span class="bn" style="--w:${Math.max(0,Math.min(100,+v||0))}%">${esc(n)}</span><span class="bv">${v==null?'':(+v).toFixed(1)+'%'}</span></div>`).join('')}
function stat(title,arr,limit){return arr&&arr.length?`<div class="stat"><h4>${title}</h4>${pctBars(arr,limit)}</div>`:''}
function renderMeta(){
  if(S.format==='doubles'&&!META[SRC[ui.metaSrc]]){const alt=['tour','ladder','ingame'].find(k=>META[SRC[k]]);if(alt)ui.metaSrc=alt}
  document.querySelectorAll('[data-src]').forEach(x=>{const has=!!META[SRC[x.dataset.src]];x.disabled=!has;x.title=has?'':'No data from this source yet'});
  const fmt=S.format,d=metaDoc(),st=META.status;
  $('srcSeg').hidden=fmt==='singles';document.querySelectorAll('[data-src]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.src===ui.metaSrc));
  $('metaTitle').textContent=(fmt==='singles'?'Singles':'Doubles')+' meta';
  if(!d){$('metaSource').textContent='Live data appears here when the page is opened in Claude.';$('metaList').innerHTML='<div class="empty-note">No meta data loaded yet.</div>';$('metaStatus').innerHTML='';return}
  const when=t=>{try{return new Date(t).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch(e){return t}};
  $('metaSource').textContent=`${d.source}${d.period&&!String(d.source).includes(d.period)?' · '+d.period:''}${d.battles?` · ${(+d.battles).toLocaleString()} battles`:''}`;
  $('metaStatus').innerHTML=st?`Last refresh ${esc(when(st.lastRun))}${st.ok===false?' · <span class="bad">failed: '+esc(st.note||'')+'</span>':st.note?' · '+esc(st.note):''} · ${esc(st.schedule||'Refreshes daily')}${fmt==='singles'&&d.smogon?`<br>Usage % from ${esc(d.smogon.source)}, ${esc(d.smogon.period)}.`:''}`:'';
  const kind=d.kind||(fmt==='doubles'?'ladder':'ingame');
  $('metaList').innerHTML=(d.top||[]).map(t0=>{const p=byName.get(t0.n);let t=t0;if(p&&fmt==='doubles'&&!(t0.mv&&t0.mv.length)){const st=setFor(p,'doubles','tour');t={...t0,mv:st.mv,it:st.it,ab:st.ab,na:st.na,tm:st.tm}}const u=kind==='ladder'?t.u:(fmt==='singles'&&p?U(p):null);
    const sets=[t.w?`<div class="stat"><h4>Win rate · ${esc(d.source||'this list')}</h4><div class="pc">${(+t.w).toFixed(1)}%</div></div>`:'',stat('Abilities',t.ab,3),stat('Items',t.it,5),stat('Moves',t.mv,8),stat('Natures',t.na,3),t.cc&&t.cc.length?`<div class="stat"><h4>Checks &amp; counters</h4><div style="font-size:13px">${t.cc.slice(0,5).map(([n,v])=>{const q=byName.get(n);return esc(q?q.d:n)+` <span class="vsub">${(+v).toFixed(0)}</span>`}).join(', ')}</div></div>`:'',
      t.tm&&t.tm.length?`<div class="stat"><h4>Teammates</h4><div style="font-size:13px">${t.tm.slice(0,5).map(([n,v])=>{const q=byName.get(n);return esc(q?q.d:n)+(v!=null?` <span class="vsub">${(+v).toFixed(0)}%</span>`:'')}).join(', ')}</div></div>`:''].join('');
    const add=p&&!members().some(m=>m.base===p.b)&&S.slots.some(s=>!byName.get(s.n))?`<button class="btn sm" type="button" data-addmeta="${esc(t.n)}">Add to team</button>`:'';
    return `<details class="mrow${t.r<=3?' medal m'+t.r:''}"><summary><span class="rk">${t.r}</span>${(p&&sprite(p,'mini'))||'<span class="spr mini"></span>'}<span class="nm">${esc(p?p.d:t.n)}${(()=>{const tr=trendFor(t.n,t.r);return tr?`<span class="trend ${tr.cls}">${tr.txt}</span>`:''})()} <span class="chips" style="display:inline-flex;vertical-align:middle">${p?p.t.map(x=>chip(x)).join(''):''}</span></span><span class="pc">${t.teams?t.teams.toLocaleString()+' teams':u?u.toFixed(1)+'%':''}</span></summary><div class="mbody">${sets||'<div class="none">No set details for this one yet.</div>'}${add?`<div>${add}</div>`:''}</div></details>`}).join('')+(d.more&&d.more.length?`<div class="t2" style="padding:4px 2px">Also ranked ${d.more[0].r}–${d.more[d.more.length-1].r}: ${d.more.slice(0,40).map(m=>{const q=byName.get(m.n);return esc(q?q.d:m.n)}).join(', ')}${d.more.length>40?` and ${d.more.length-40} more`:''}</div>`:'')+(d.note?`<div class="t2" style="padding:0 2px">${esc(d.note)}</div>`:'')||'<div class="empty-note">No Pokémon in this list.</div>';
}
// Ability picker: says plainly which ability most players run and whether you changed it.
function abilBlock(s,i,m){const p=m.p,meta=metaAbility(p),rec=meta||bestAbility(p),st=setFor(p);
  const mine=s.a&&p.a.includes(s.a)&&s.a!==rec;
  const tag=mine?`<span class="tag mine">YOUR PICK</span><button class="linkbtn" type="button" data-abreset="${i}">Use ${esc(rec)}</button>`
    :p.a.length===1?`<span class="tag rec soft">${p.m?'MEGA ABILITY':'ONLY ABILITY'}</span>`
    :meta?`<span class="tag rec" title="Most used in ${esc(srcWord(st.src.ab))} ${S.format}">MOST USED</span>`:`<span class="tag rec soft">SUGGESTED</span><span class="vsub">no usage data</span>`;
  return `<div class="abil"><div class="lblrow"><span class="lbl">Ability</span>${tag}</div>
    <select class="field" id="ab${i}" data-i="${i}" aria-label="Ability for ${esc(p.d)}">${p.a.map(a=>{const pc=abilityPct(p,a);return `<option value="${esc(a)}"${a===m.ability?' selected':''}>${esc(a)}${pc!=null?` (${(+pc).toFixed(pc<1?1:0)}%)`:''}${a===rec?' ★':''}</option>`}).join('')}</select></div>`}
// Every held item players actually run in Champions (from all the usage data loaded), so the picker never offers one the game lacks.
var itemPoolCache;function notStone(n){return n==='Eviolite'||!STONE_RE.test(n)}
function itemPool(){if(!itemPoolCache)itemPoolCache={v:-1,list:[]};if(itemPoolCache.v===metaVersion&&itemPoolCache.list.length)return itemPoolCache.list;const seen=new Map();
  for(const d of [META.doubles_ingame,META.doubles,META.singles,META.doubles_tour])if(d)for(const row of [...(d.top||[]),...(d.more||[])])for(const [n,v] of (row.it||[]))
    if(n&&typeof n==='string'&&notStone(n)&&!/^(nothing|other|none)$/i.test(n))seen.set(n,(seen.get(n)||0)+(+v||0));
  const list=[...seen.keys()].sort((a,b)=>a.localeCompare(b));itemPoolCache={v:metaVersion,list};return list}
// Item picker: the items most players run on it first (with %), then every other item. A Mega's stone can't change.
function itemBlock(s,i,m,clash){const p=m.p;
  const same=x=>x.p.n===p.n;
  const warn=clash&&clash.sc.some(same)?`<div class="itwarn" role="note"><b>Clashes with Trick Room.</b> ${clash.tr.length===1&&same(clash.tr[0])?'It sets Trick Room itself':'Your team sets Trick Room'}, and under it the Scarf makes ${esc(m.d)} move later.</div>`:'';
  if(p.m)return `<div class="abil"><div class="lblrow"><span class="lbl">Item</span><span class="tag rec soft">MEGA STONE</span></div><div class="itfixed">${esc(m.item||'Mega Stone')}</div></div>`;
  const pop=(setFor(p).it||[]).filter(([n])=>n&&notStone(n)).slice(0,8),popN=new Set(pop.map(([n])=>n)),def=defaultItem(p);
  const rest=itemPool().filter(n=>!popN.has(n));if(m.item&&!popN.has(m.item)&&!rest.includes(m.item))rest.unshift(m.item);
  const tag=m.heldItem&&m.heldItem!==def?`<span class="tag mine">YOUR PICK</span><button class="linkbtn" type="button" data-itreset="${i}">Use ${esc(def||'the usual item')}</button>`
    :pop.length?`<span class="tag rec">MOST USED</span>`:`<span class="tag rec soft">NO USAGE DATA</span>`;
  const o=(n,pc)=>`<option value="${esc(n)}"${n===m.item?' selected':''}>${esc(n)}${pc!=null?` (${(+pc).toFixed(+pc<1?1:0)}%)`:''}${n===def?' ★':''}</option>`;
  return `<div class="abil"><div class="lblrow"><span class="lbl">Item</span>${tag}</div>
    <select class="field" id="it${i}" data-iti="${i}" aria-label="Held item for ${esc(p.d)}">${m.item?'':'<option value="" selected>(no item)</option>'}${pop.length?`<optgroup label="Most used in ${S.format}">${pop.map(([n,v])=>o(n,v)).join('')}</optgroup>`:''}${rest.length?`<optgroup label="Other items">${rest.map(n=>o(n,null)).join('')}</optgroup>`:''}</select>${warn}</div>`}
// Moves: four tiles, each a dropdown. Popular moves for this format come first with their usage %.
function movesBlock(s,i,m){const p=m.p,sm=slotMoves(s,p),pm=popularMoves(p);
  const pct=pm.pct||new Map();
  const learn=(LEARN[p.n]||[]).map(k=>MV[k]).filter(Boolean);const popNames=new Set(pm.map(x=>x.name));
  const rest=learn.filter(x=>!popNames.has(x.name)).sort((a,b)=>a.name.localeCompare(b.name));
  const src=pm.src==='other'?`popular ${OTHER()} set`:pm.src==='guess'?'likely moves (no usage data)':pm.src==='sd'?(p.m?'Mega set · Showdown':`${S.format} set · Showdown`):pm.src==='tour'?'tournament set':pm.src==='ladder'?'Showdown set':`popular ${S.format} set`;
  const label=sm.custom?`<span class="tag mine">YOUR SET</span><button class="linkbtn" type="button" data-mvreset="${i}">Reset to popular</button>`:`<span class="tag rec">${src.toUpperCase()}</span>`;
  const opt=(x,cur)=>`<option value="${esc(x.name)}"${x.name===cur?' selected':''}${x.name!==cur&&sm.names.includes(x.name)?' disabled':''}>${esc(x.name)} · ${x.type}${x.cat?' '+(x.bp||'var'):''}${pct.has(x.name)?' · '+(+pct.get(x.name)).toFixed(0)+'%':''}</option>`;
  const tiles=sm.names.map((nm,j)=>{const mv=mvByName.get(nm);
    const sel=`<select class="mvpick" id="mv${i}_${j}" data-mvi="${i}:${j}" aria-label="Move ${j+1} for ${esc(p.d)}"><option value=""${nm?'':' selected'}>(no move)</option>${pm.length?`<optgroup label="${pm.src==='guess'?'Suggested (no usage data)':'Popular in '+(pm.src==='other'?OTHER():S.format)+(pm.src==='sd'?' (Showdown)':'')}">${pm.map(x=>opt(x,nm)).join('')}</optgroup>`:''}<optgroup label="All moves it learns">${rest.map(x=>opt(x,nm)).join('')}</optgroup></select>`;
    return mv?`<div class="mvset" style="--tc:${TC[mv.type]||'#999'}"><span class="nm">${esc(mv.name)}</span><span class="mi">${chip(mv.type)}<span class="bp" title="${mv.cat?(mv.bp?mv.bp+' power':'Power varies'):'Status move'}${pct.has(mv.name)?' · used by '+(+pct.get(mv.name)).toFixed(0)+'%':''}">${mv.cat?(mv.bp||'var'):'—'}${pct.has(mv.name)?` · ${(+pct.get(mv.name)).toFixed(0)}%`:''}</span></span><span class="caret">▾</span>${sel}</div>`
             :`<div class="mvset empty"><span class="nm">Pick a move</span><span class="caret">▾</span>${sel}</div>`}).join('');
  return `<div><div class="lblrow" style="margin-bottom:4px"><span class="lbl">Moves</span>${label}<span class="vsub" style="margin-left:auto">power · % used</span></div><div class="moves">${tiles}</div>
    <button class="linkbtn" type="button" data-fullset="${esc(p.n)}" style="margin-top:6px">Full popular sets ›</button></div>`}
function mcell(x){const c=x===0?'m0':x>=4?'mq':x>=2?'mh':x<1?'m2':'';return `<span class="m ${c}">${x===0?'0':x===.25?'¼':x===.5?'½':x+'×'}</span>`}
function dcell(x){const c=x===0?'m0':x>=4?'m4':x>=2?'m2':x<=.25?'mq':x<=.5?'mh':'';return `<span class="m ${c}">${x===0?'0':x===.25?'¼':x===.5?'½':x===1?'':x+'×'}</span>`}

// ---------- render: everything ----------
let renderQueued=false,planCache={key:null,plans:[]},metaVersion=0;
function scheduleRender(){if(renderQueued)return;renderQueued=true;setTimeout(()=>{renderQueued=false;render()},0)}
// Run one part of the page; if it throws, log it and keep the rest of the page working.
function safe(name,fn){try{fn()}catch(err){try{console.error('Champions Team Coverage: '+name+' failed',err)}catch(e){}}}
function render(){
  pmCache=new Map();vCache=new Map();setCache=new Map();pairCache=new Map();relCache=new Map();persist();renderSlots();
  const useA=$('useAbil').checked;const ms=members();const a=analyze(ms,useA);
  {const empty=!ms.length;const sc=$('startCard');if(sc)sc.hidden=!empty;for(const id of ['defense','fixes']){const e=$(id);if(e)e.hidden=empty}}
  document.querySelectorAll('[data-fmt]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.fmt===S.format));try{document.documentElement.dataset.format=S.format}catch(e){}
  ['funPlan','funAb','funRec'].forEach(id=>{const c=$(id);if(c)c.checked=!!S.fun});try{document.documentElement.dataset.fun=S.fun?'1':''}catch(e){}
  document.querySelectorAll('[data-abfmt]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.abfmt===ui.abFmt));{const c=$('abDistinct');if(c)c.checked=ui.abDistinct;const w=$('abDistinctWrap');if(w)w.hidden=ui.abFmt!=='both'}
  document.querySelectorAll('[data-megas]').forEach(x=>x.setAttribute('aria-pressed',+x.dataset.megas===megaGoal()));
  $('eyebrow').textContent='Pokémon Champions · Regulation M-C · VGC Doubles · bring 6, pick 4';showDataDate();
  const loaded=S.teams.find(t=>t.id===S.loadedId);
  $('teamTitle').textContent=loaded?loaded.name:'Team';document.querySelectorAll('.tc').forEach(tc=>tc.textContent=ms.length?ms.length+'/6':'');
  $('saveBtn').textContent=loaded?'Save changes':'Save team';
  // defense card
  const weakChips=a.rows.filter(t=>t.w>t.r).map(t=>chip(t.atk,t.w-t.r>1?` <b>×${t.w-t.r}</b>`:'')).join('');
  const tied=a.rows.filter(t=>t.w>0&&t.w===t.r).map(t=>chip(t.atk)).join('');
  const PG=ms.length?proGrades(ms,useA):null;
  const CK=ms.length?proChecks(ms,useA):null;
  $('chkCard').innerHTML=`<div class="ckhead vtx"><div><div class="k">Winning-team checklist${CK&&!CK.full?' · so far':''}</div><div class="v">${CK?`${CK.pass} of ${CK.n} checks`:'Add Pokémon to see the checks'}</div></div></div>
     <div class="t2">${S.format==='doubles'?'What recent event winners usually have, measured live from the Events data. A missing check is a gap to know about, not a verdict: plenty of winning teams miss one, and play decides most games. It doesn\'t change the Team Score.':'Type checks for singles. The win-rate numbers come from doubles tournaments, so they are not shown here.'}</div>
     ${CK?`<ul class="cklist">${CK.items.map(x=>`<li>${ckIcon(x)}<div><b>${x.label}</b><div class="t2">${esc(x.ok?x.have:x.miss)}</div>${x.pro?`<div class="ckpro">${x.pro}</div>`:''}</div></li>`).join('')}</ul>`:''}`;
  safe('verdict',()=>renderVerdict(ms,a,PG,CK));safe('team hero',()=>renderTeamHero(ms));
  $('defCard').innerHTML=`<div class="vtx"><div class="k">Defense${PG&&!PG.full?' · so far':''}</div><div class="v">${!ms.length?'—':a.excess?`${a.excess} more weakness${a.excess===1?'':'es'} than resistances`:'Every weakness is covered by a resist'}</div>
     <div class="vsub">${ms.length}/6 Pokémon${PG?` · ${Math.round(PG.danger*100)}% of the top 30 can hit 3+ of yours super effectively`:''}</div></div>
     <div class="kv"><span>More weak than resist</span><div class="chips">${weakChips||'<span class="none">None</span>'}</div>
     <span>Nobody resists</span><div class="chips">${a.unresisted.map(t=>chip(t)).join('')||'<span class="none">None</span>'}</div>
     <span>Even split</span><div class="chips">${tied||'<span class="none">None</span>'}</div>
     ${S.format==='singles'&&ms.length?`<span>Stealth Rock</span><div style="font-size:13px">${ms.filter(m=>srPct(m)>=25).map(m=>`${esc(m.d)} ${srPct(m)}%`).join(', ')||'<span class="none">Nobody takes 25% or more</span>'}</div>`:''}</div>
     <div class="t2">×2 next to a type means 2 more of yours are weak to it than resist it.</div>`;
  safe('trios',()=>renderTrios(ms,useA));
  // offense
  const ctx=teamContext(useA?ms:[]);
  const perMon=ms.map(m=>{const mm=memberMoves(m);return {m,src:mm.src,en:attackEntries({...m,ability:useA?m.ability:null},mm.moves,ctx)}});
  const entries=perMon.flatMap(x=>x.en);
  const stabOnly=perMon.filter(x=>x.src==='stab').map(x=>x.m.d);
  const tRows=TYPES.map(t=>{const hits=perMon.map(x=>({m:x.m,b:bestHit(x.en,[t],null)})).filter(h=>h.b&&h.b.x>=2);
    return {t,hits,best:bestHit(entries,[t],null)}});
  const covered=tRows.filter(r=>r.hits.length).length;
  $('offCard').innerHTML=`<div class="vtx"><div class="k">Offense${PG&&!PG.full?' · so far':''}</div><div class="v">${PG?`2+ of yours hit ${Math.round(PG.se2*100)}% of the top 30 super effectively`:'—'}</div>
     <div class="vsub">${covered}/18 types hit super effectively by at least one of yours</div></div>
     <div class="kv">${PG&&PG.thin.length?`<span>Few answers to</span><div style="font-size:13px">${PG.thin.slice(0,6).map(x=>`${esc(x.o.p.d)}${x.nh?'':' <b style="color:var(--bad)">(none)</b>'}`).join(', ')}<div class="t2">Top meta Pokémon that ${PG.thin.some(x=>x.nh)?'one or none':'only one'} of yours hits super effectively</div></div>`:''}<span>Nobody hits super effectively</span><div class="chips">${tRows.filter(r=>!r.hits.length).map(r=>chip(r.t)).join('')||'<span class="none">None</span>'}</div>
     ${stabOnly.length?`<span>Types only</span><div style="font-size:13px;color:var(--warn)">${esc(stabOnly.join(', '))}: no move data yet, so only their own types are counted</div>`:''}</div>`;
  safe('offense vs meta',()=>renderOffMeta(entries,useA));
  $('offTypes').innerHTML=`<tr><th class="t">Defending type</th><th>Best</th><th class="t">Who hits it super effectively</th></tr>`+tRows.map(r=>{const x=r.best?r.best.x:0;
    return `<tr class="${r.hits.length?'':'prob'}"><td class="t">${chip(r.t)}</td><td>${mcell(x)}</td><td class="who">${r.hits.length?r.hits.map(h=>`${esc(h.m.d)} <span style="opacity:.8">(${esc(h.b.e.move)})</span>`).join(', '):'<span class="no">Nobody</span>'}</td></tr>`}).join('');
  // defense grid
  const head=`<tr><th class="t">Attack</th>${ms.map(m=>`<th title="${esc(m.d)}">${esc(m.d.replace('Mega ','M·').slice(0,12))}</th>`).join('')}<th>Weak</th><th>Resist</th><th>Net</th></tr>`;
  $('grid').innerHTML=head+a.rows.map(t=>`<tr class="${t.w>t.r?'prob':''}"><td class="t">${chip(t.atk)}</td>${ms.map(m=>`<td>${dcell(mult(t.atk,m.types,m.ability,useA))}</td>`).join('')}<td>${t.w||''}</td><td>${t.r||''}</td><td class="net ${t.net>0?'pos':t.net<0?'neg':'zero'}">${t.net>0?'+'+t.net:t.net}</td></tr>`).join('');
  // problems + plans
  safe('game plan',()=>renderGamePlan(ms));
  const pool=suggestPool();
  // Plans only change when the team, pool, settings, box or meta data change, so reuse them otherwise.
  const planKey=JSON.stringify([!!S.fun,S.slots,ui.pool,S.format,megaGoal(),$('swapMega').checked,useA,ui.metaSrc,metaVersion,S.box.join(),S.excl.join(),ui.exclSaved,S.teams.map(t=>t.format+t.slots.map(x=>x.n).join()).join()]);
  let plans=[];
  if(planCache.key===planKey)plans=planCache.plans;
  else safe('fix plans',()=>{ui.planMore=0;plans=ms.length?planFixes(ms,pool,useA):[];
    // hidden gems for Quick add: the same search, scored on power and fit, over strong Pokémon outside the usual meta picks
    if(ms.length&&!S.fun){const gp=pool.filter(p=>!isMetaPick(p)&&((p.s||0)>=470||p.m));try{plans.gems=withFun(()=>planFixes(ms,gp,useA,{singlesOnly:true}))}catch(e){plans.gems=null}}
    planCache={key:planKey,plans}});
  ui.plans=plans;safe('problems',()=>renderProblems(ms,a,tRows,useA,plans));
  if(ui.vProven){const nd=$('needs');if(nd&&nd.innerHTML&&nd.insertAdjacentHTML)nd.insertAdjacentHTML('afterbegin','<div class="t2 provnote">This exact team has won at real events. Treat these as optional tweaks, not problems.</div>')}
  safe('plan cards',()=>renderPlans(ms,a,plans,useA,covered));
  safe('checklist claims',ckWinRefresh);safe('saved teams',renderSaved);safe('box',renderBox);safe('exclude',renderExcl);safe('auto-build',renderAutoBuild);safe('pool',renderPoolCtl);safe('meta',renderMeta);{const lp=document.querySelector('[data-pane="ratings"]');if(lp&&lp.hidden===false)safe('ratings',renderLair)}
  safe('threats',()=>renderThreats(ms,useA));if(typeof view!=='undefined'){if(view==='speed')safe('speed tiers',renderSpeed);if(view==='calc')safe('damage calc',renderCalc);if(view==='gauntlet')safe('gauntlet',renderGauntlet);if(view==='battle')safe('battle',renderBattle);if(view==='cores')safe('cores',renderCores);if(view==='events')safe('events',renderEvents);if(view==='top')safe('team search',renderTeamSearch)}{const cv=document.querySelector('[data-pane="coverage"]');if(cv&&cv.hidden===false)setTimeout(()=>safe('additions',renderRecs),0)}safe('types',renderTypes);safe('matchup',renderMatchup);safe('top teams',renderTopTeams);safe('battle log',renderLog);safe('sets',renderSets);safe('paste',renderPastePanel);safe('home',renderHome);
}
// One-glance verdict for the Team page: how ready the team is, its biggest gap, its biggest threat, and whether it
// matches a real tournament team. The full report folds underneath.
function renderVerdict(ms,a,PG,CK){const el=$('verdict');ui.vProven=false;ui.vsum=null;if(!el)return;if(!ms.length){el.innerHTML='';return}
  const n=ms.length,miss=CK?CK.items.filter(x=>!x.ok):[],thin=PG&&PG.thin?PG.thin:[];
  const rows=[];let best=null;
  if(n>=5&&RES&&Array.isArray(RES.proven)){const names=new Set(ms.map(m=>m.p.n));
    for(const [ns,c,wr] of RES.proven){const k=ns.filter(x=>names.has(x)).length;if(k>=5&&(!best||k>best.k||(k===best.k&&wr>best.wr)))best={k,c,wr}}}
  // real results lead: a team that already won is ready whatever the type chart says; otherwise the checklist decides
  const tr=typeof teamRecord==='function'?teamRecord(ms):null;if(tr)rows.unshift(['Your record',`${tr.w}-${tr.l} with this team (${tr.pct}%)`]);
  const wv=n>=6&&typeof winVsField==='function'?winVsField(ms.map(m=>m.p.n),true):null;
  const TS=n>=6?teamScore({wv}):null;
  let lvl,head;
  if(n<6){lvl='mid';head=`${n} of 6 picked: keep building`}
  else if(!TS){const bs=ms.map(m=>m.p.b),dup=ms.find((m,i)=>bs.indexOf(m.p.b)!==i);lvl=dup?'bad':'mid';head=dup?`Not a legal team: only one ${dup.p.b} (any form) is allowed`:'Team Score is waiting for the win model data'}else{lvl=TS.score>=50?'good':TS.score>=25?'mid':'bad';head=`${TS.score} · ${TS.label}`}
  ui.vsum={lvl,head,best,tr,CK,excess:a.excess,TS};
  if(best)rows.push(['Real results',`${best.k===6?'This exact team':'5 of these 6'} won about ${Math.round(best.wr*100)}% at Limitless events${best.c>1?` (${best.c} players)`:''}`]);
  // how much of this exact combination real players have tried (the score pulls an untried mix toward the average)
  if(wv&&wv.tested!=null)rows.push(['Played together',`${wv.tested} of the 15 pairs on this team have been brought together on 15+ tournament teams${wv.credit<1?`. An untried mix, so its edge over an average team counts ${Math.round(wv.credit*100)}% until real results back it up.`:'.'}`]);
  if(wv&&wv.struct&&wv.struct.miss.length){const m=wv.struct.miss,cap=x=>x.charAt(0).toUpperCase()+x.slice(1);rows.push(['Unproven',`${esc(m.map(cap).join('. '))}. The model learned from teams that ${m.length>1?'have these covered':'have this covered'}, so its edge over an average team counts ${Math.round(wv.struct.c*100)}% here.`])}
  if(CK)rows.push(['Checklist',`${CK.pass} of ${CK.n} checks (advice; not part of the score)`+(miss.length?`: missing ${miss.slice(0,2).map(x=>x.label.toLowerCase()).join(' and ')}`:'')]);
  if(thin.length)rows.push(['Watch out for',thin.slice(0,3).map(x=>esc(x.o.p.d)).join(', ')]);
  rows.push(['Type balance',a.excess?`${a.excess} more weakness${a.excess===1?'':'es'} than resists`+(a.unresisted.length?`; nothing resists ${a.unresisted.slice(0,2).join(', ')}`:''):'every weakness covered']);
  ui.vProven=!!(best&&best.k===6&&best.wr>=.55);el.className='verdict '+lvl;
  const parts=TS?`<div class="tsparts"><div class="tsline"><b>${TS.score}</b><span>${TS.pct!=null?`Stronger than ${TS.score}% of tournament teams from the last 45 days.`:'Based on the win chance against an average tournament team.'} Win chance against an average one: <b>${Math.round(TS.p*100)}%</b>${TS.pYou!=null?` (${Math.round(TS.pYou*100)}% for you, from your battle log)`:''}.${ckWin.wmed!=null?` A typical recent event winner scores ${ckWin.wmed}.`:''}</span></div><div class="tsbar" aria-hidden="true"><i style="--w:${TS.score}%"></i><em style="left:50%">avg</em>${ckWin.wmed!=null&&Math.abs(ckWin.wmed-50)>=8?`<em class="win" style="left:${ckWin.wmed}%">winners</em>`:''}</div></div>`:'';
  el.innerHTML=`<div class="vhead"><span class="vdot" aria-hidden="true"></span><b class="vtitle">${TS?'Team Score '+esc(head):esc(head)}</b></div>${parts}<dl>${rows.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')}</dl>`}
// Team Score, 0-100: where this team's strength (the win model, trained on real games with player skill removed) falls
// among real tournament teams from the last 45 days. 50 = a typical tournament team, 90 = top 10%.
// Tested Oct 26 on held-out events: the checklist and "answers to the meta" added almost nothing to predicting winners
// (checklist +0.0002 log-loss, meta coverage none), so they no longer move the score; they stay as advice. The old blend
// also capped each part at 100, so many odd teams scored a perfect 100. Now 100 means stronger than every recent team.
function teamScore({wv}){if(!wv)return null;const cl=x=>Math.max(0,Math.min(100,Math.round(x)));
  const pct=wv.pct!=null?wv.pct:null;
  // older model data (no team spread shipped yet): fall back to the win chance against an average team
  const score=pct!=null?cl(Math.floor(pct)):cl((wv.p-.35)/.3*100);
  // labels anchored to real event winners scored with their own sets (Oct 27, 118 winners: median 77, top quarter 92+)
  const label=score>=90?'Elite':score>=75?'Winner level':score>=50?'Above average':score>=30?'Playable':'Needs work';
  return {score,label,p:wv.p,pYou:wv.pYou,pct}}
let pmCache=new Map();
// The 4 moves a Pokémon is graded and planned with: its 4 most-used moves, the same 4 its team card shows.
function runMoves(p){const pm=popularMoves(p),r=pm.slice(0,4);r.src=pm.src;r.pct=pm.pct;return r}
function popularMoves(p){const key=S.format+'|'+ui.metaSrc+'|'+metaVersion+'|'+p.n;if(pmCache.has(key))return pmCache.get(key);const r=popularMoves_(p);pmCache.set(key,r);return r}
const AWKWARD=new Set(['Hyper Beam','Giga Impact','Explosion','Self-Destruct','Focus Punch','Solar Beam','Solar Blade','Sky Attack','Meteor Beam','Dream Eater','Belch','Last Resort','Steel Beam','Mind Blown','Head Smash','Blast Burn','Hydro Cannon','Frenzy Plant','Rock Wrecker','Roar of Time','Prismatic Laser','Eternabeam','Shell Trap','Future Sight','Doom Desire','Synchronoise','Burn Up','Double Shock','Outrage','Thrash','Petal Dance','Raging Fury']);
// Most-used moves for p in this format (see setFor), else the other format's, else its strongest attacks.
function popularMoves_(p){const toMoves=a=>a.map(([n])=>mvByName.get(n)).filter(Boolean).slice(0,6);
  const st=setFor(p);let r=toMoves(st.mv);if(r.length){r.src=st.src.mv;r.pct=new Map(st.mv);return r}
  const o=setFor(p,OTHER());r=toMoves(o.mv);if(r.length){r.src='other';r.pct=new Map();return r}
  const learnIdx=LEARN[p.n]||[];const ng=p.a.includes('No Guard');const atk=learnIdx.map(k=>MV[k]).filter(m=>m&&isCoverage(m)&&m.bp>0&&m.bp<=160&&!AWKWARD.has(m.name)&&(ng||!LOW_ACC.has(m.name)));const pow=m=>m.bp*(p.t.includes(m.type)?1.5:1);
  const out=[];for(const t of p.t){const m=atk.filter(x=>x.type===t).sort((x,y)=>y.bp-x.bp)[0];if(m)out.push(m)}
  for(const m of atk.sort((x,y)=>pow(y)-pow(x))){if(out.length>=4)break;if(!out.some(o=>o.type===m.type))out.push(m)}
  out.src='guess';out.pct=new Map();return out}
const OTHER=()=>S.format==='singles'?'doubles':'singles';
function abilityPct(p,a){const x=setFor(p).ab.find(([n])=>n===a);return x?x[1]:null}
// Held items players run: a Mega holds its stone; otherwise the top items for this format.
function topItems(p){const st=setFor(p);return st.it.length?{src:st.src.it,it:st.it.slice(0,2)}:null}
function pcTxt(v){return v!=null?` <span class="vsub">${(+v).toFixed(0)}%</span>`:''}
// Item and nature most players run, shown on the card.
function setRows(p){const st=setFor(p),it=topItems(p),na=st.na.length?st.na.slice(0,2):null;
  if(!it&&!na)return '';
  const tag=src=>src==='sd'?` <span class="vsub" title="Showdown ladder, 1630+ rating">(Showdown)</span>`:'';
  const line=(label,arr,src)=>`<span class="lbl">${label}</span><div><span class="iname">${esc(arr[0][0])}</span>${pcTxt(arr[0][1])}${arr[1]?`<span class="ialt">or ${esc(arr[1][0])}${pcTxt(arr[1][1])}</span>`:''}${tag(src)}</div>`;
  const cs=typeof commonSpread==='function'?commonSpread(p):null;
  const spr=cs?`<span class="lbl">Spread${typeof tip==='function'?tip('spread'):''}</span><div><span class="iname">${cs.hp}/${cs.atk}/${cs.def}/${cs.spa}/${cs.spd}/${cs.spe}</span> <span class="vsub" title="HP/Atk/Def/SpA/SpD/Spe stat points, most common on the Showdown ladder (1630+)">${esc(cs.nat)} · HP/Atk/Def/SpA/SpD/Spe</span></div>`:'';
  return `<div class="itemrow">${it?line('Item',it.it,it.src):''}${na?line('Nature',na,st.src.na):''}${spr}</div>`}
// Each Pokémon is read with the 4 moves on its card (popular set unless you changed them).
function memberMoves(m){const mv=m.moves&&m.moves.length?m.moves:popularMoves(m.p);if(mv.some(isCoverage))return {moves:mv,src:m.custom?'yours':'popular'};return {moves:[],src:'stab'}}
const GP_TAG={ok:['ok','Covered'],part:['mid','Partly'],miss:['hi','Missing'],opt:['lo','Optional']};
function renderGamePlan(ms){const el=$('gplan');if(!el)return;
  if(!ms.length){el.innerHTML='<div class="empty-note">Add Pokémon to see which jobs the team covers.</div>';$('gplanSub').textContent='';return}
  const gp=gamePlan(ms);{let lb='';try{const a=teamArchetype(ms);lb=a?a.label:''}catch(e){}$('gplanSub').innerHTML=(lb?`<span class="archchips">${archChips(lb)}</span>`:'')}
  el.innerHTML=gp.rows.map(r=>{const [c,t]=GP_TAG[r.st];return `<div class="gprow"><span class="gplbl">${esc(r.label)}</span><span class="sev ${c}">${t}</span><div class="gpwho">${r.who?esc(r.who):''}${r.note?`<div class="t2">${esc(r.note)}</div>`:''}</div></div>`}).join('')}

// ---------- render: everything ----------
let renderQueued=false,planCache={key:null,plans:[]},metaVersion=0;
// While the page is opening, the data arrives in up to 11 pieces; a short wait lets pieces that land close together share
// one redraw instead of one each. Nov 1 (load speed): the wait restarts with each new piece (up to 0.7 s after the first one
// waiting), so pieces that trickle in ~150 ms apart share one redraw instead of one each (a full redraw is ~0.3-0.7 s on a phone).
let renderQAt=0,renderQT=0;
// the usage source in use (ui.metaSrc) falls back to one that has data today: tournament, then ladder, then in-game (shared with the rebuild)
function fixMetaSrc(){if(!META[SRC[ui.metaSrc]]){const alt=['tour','ladder','ingame'].find(k=>META[SRC[k]]);if(alt)ui.metaSrc=alt}}
function scheduleRender(){const now=performance.now();if(now>=6000){if(renderQueued)return;renderQueued=true;setTimeout(()=>{renderQueued=false;bgRender()},0);return}
  if(!renderQueued){renderQueued=true;renderQAt=now}clearTimeout(renderQT);renderQT=setTimeout(()=>{renderQueued=false;bgRender()},Math.max(0,Math.min(200,renderQAt+700-now)))}
// Background updates (data arriving, slow checks finishing) wait while someone is typing in a box: a redraw would rebuild the box
// and wipe what they typed (Oct 30 audit). They run as soon as the box loses focus.
function typingNow(){const a=document.activeElement;return !!(a&&(a.tagName==='TEXTAREA'||(a.tagName==='INPUT'&&/^(text|search|)$/.test(a.type||''))))}
let bgWait=false;function bgRender(){if(!typingNow()){render();return}if(bgWait)return;bgWait=true;const go=()=>{document.removeEventListener('focusout',go,true);setTimeout(()=>{bgWait=false;if(typingNow()){bgRender();return}render()},150)};document.addEventListener('focusout',go,true)}
// Run one part of the page; if it throws, log it and keep the rest of the page working.
function safe(name,fn){try{fn()}catch(err){try{console.error('Champions Team Coverage: '+name+' failed',err)}catch(e){}}}
// what the fix plans depend on: the team, pool, settings, box, saved teams and meta data
function planKeyOf(useA){const so=swOutNow();return JSON.stringify([so?[...so].join():'',OFFMETA,S.slots,ui.pool,S.format,megaGoal(),$('swapMega').checked,useA,ui.metaSrc,metaVersion,S.box.join(),S.excl.join(),S.teams.map(t=>t.format+t.slots.map(x=>x.n).join()).join()])}
// plans for the last few teams (Undo, or editing back and forth, reuses them)
const planLRU=new Map();
function planKeep(key,plans){planLRU.delete(key);planLRU.set(key,plans);while(planLRU.size>8)planLRU.delete(planLRU.keys().next().value)}
// The plans being worked out in the background: the same planner (planFixesG), run about 30 ms at a time between frames.
// A newer team replaces it; when it finishes, the page redraws with the plans (from the cache, so that redraw is quick).
let planJob=null;
function planJobStart(key,ms,pool,useA,a){if(planJob&&planJob.key===key)return;
  const job={key};planJob=job;const gems=!OFFMETA;let main=null,gem=null,plans=null,warm=null;
  const fail=(e,what)=>{try{console.error('Champions Team Coverage: '+what+' failed',e)}catch(x){}};
  const step=()=>{if(planJob!==job)return;const t=performance.now();
    try{
      if(!main)main=planFixesG(ms,pool,useA);
      if(!plans){for(;;){const r=main.next();if(r.done){plans=r.value;break}if(performance.now()-t>30){setTimeout(step,0);return}}
        // hidden gems for Quick add: the same search, scored on power and fit, over strong Pokémon outside the usual meta picks
        if(gems){const gp=pool.filter(p=>!isMetaPick(p)&&((p.s||0)>=470||p.m));try{gem=withOffMeta(()=>planFixesG(ms,gp,useA,{singlesOnly:true}))}catch(e){plans.gems=null}}}
      if(gem){try{for(;;){const r=withOffMeta(()=>gem.next());if(r.done){plans.gems=r.value;gem=null;break}if(performance.now()-t>30){setTimeout(step,0);return}}}catch(e){plans.gems=null;gem=null}}
      // then the readiness reports the redraw will look up, so the redraw itself is quick
      if(!warm)warm=planWarmG(ms,plans,a);
      for(;;){let r;try{r=warm.next()}catch(e){break}if(r.done)break;if(performance.now()-t>30){setTimeout(step,0);return}}
    }catch(e){fail(e,'fix plans');plans=[]}
    planJob=null;
    // the team or settings changed without a redraw yet: the next redraw starts over
    if(planKeyOf($('useAbil').checked)!==key)return;
    planCache={key,plans};planKeep(key,plans);
    // redraw with the plans if a page that shows them is open (another page picks them up from the cache when it opens)
    if(typeof view==='undefined'||view==='build'||view==='report'||view==='coverage')planDone()};
  setTimeout(step,0)}
// Readiness reports (cached by THR.teamReport) for the six-Pokémon teams the plan cards, Quick add and the My team suggestions
// look up: worked out here one at a time, so the redraw that shows the plans finds them ready. Only warms the cache; the
// numbers are the same either way.
function* planWarmG(ms,plans,a){const seen=new Set(),warm=function*(team){if(!team||team.length!==6||seen.has(team))return;seen.add(team);prepOf(team);yield};
  for(const pl of [...plans,...(plans.more||[])])yield* warm(pl.team);
  // Quick add: the same keys and shortlists renderProblems / quickPicks use
  const keys=[];const gp=plans.gp?plans.gp:gamePlan(ms);
  if(ms.length>=3)for(const r of gp.rows){const big=r.k==='speed'||r.k==='support'||((r.k==='weather'||r.k==='terrain')&&r.st==='miss')||r.k==='trfit';if(big&&(r.st==='miss'||r.st==='part'))keys.push('gp:'+r.k)}
  if(ms.length>=6&&megaCount(ms)===0)keys.push('mega');
  for(const t of a.rows){if(t.w>t.r)keys.push('weak:'+t.atk);if(t.r===0&&t.w<=t.r)keys.push('unres:'+t.atk)}
  const list=[],keep=ui.plans;ui.plans=plans;
  try{for(const src of [plans,plans.gems])if(src&&src.singles&&src.basePl){const base=src.basePl.score;
    for(const k of keys)list.push(...src.singles.filter(pl=>pl.ch.length===1&&pl.score<base-3&&qaFixes(k,pl,ms)).sort((x,y)=>x.score-y.score).slice(0,20))}}
  finally{ui.plans=keep}
  for(const pl of list)yield* warm(pl.team)}
// While the plans are worked out (they fill in a moment later): what was there stays in place, faded and not tappable, so
// nothing jumps; an empty spot gets a short note. Its buttons can't be tapped, as they belong to the team before the edit.
const PLAN_WAIT='<div class="empty-note abbusy planwait" role="status"><span class="abspin" aria-hidden="true"></span>Working out the best fixes for your team…</div>';
function planStale(el,wait){if(!el)return;if(el.classList.contains('planstale'))return;
  if(el.innerHTML.trim()&&!el.querySelector('.planwait')){el.classList.add('planstale');el.inert=true;el.setAttribute('aria-busy','true')}else el.innerHTML=wait}
function planFresh(el){if(el&&el.classList.contains('planstale')){el.classList.remove('planstale');el.inert=false;el.removeAttribute('aria-busy')}}
function planWait(){ui.quick=[];planStale($('needs'),PLAN_WAIT);planStale($('sugs'),PLAN_WAIT.replace('the best fixes','fix plans'))}
// the parts of the page drawn from the fix plans (render, and planDone when the plans come in)
function plansDraw({ms,a,tRows,useA,covered},plans){
  if(plans.pending){ui.planList=[];safe('plans wait',planWait);return}
  planFresh($('needs'));planFresh($('sugs'));safe('problems',()=>renderProblems(ms,a,tRows,useA,plans));
  if(ui.vProven){const nd=$('needs');if(nd&&nd.innerHTML&&nd.insertAdjacentHTML)nd.insertAdjacentHTML('afterbegin','<div class="t2 provnote">This exact team has won at real events. Treat these as optional tweaks, not problems.</div>')}
  safe('plan cards',()=>renderPlans(ms,a,plans,useA,covered))}
// the plans are ready: redraw, keeping what's on screen where it is if the plans above it grew or shrank (the button you just
// tapped, if you tapped one in the last few seconds; otherwise the first thing on screen)
function planDone(){if(typingNow()){bgRender();return}
  const pane=document.querySelector('[data-pane]:not([hidden])'),c=[];
  let tap=null;try{tap=typeof KP==='object'&&KP.recent?KP.recent():null}catch(e){}
  try{if(!tap&&pane&&(window.scrollY||0)>0)for(const el of pane.querySelectorAll('[id]')){const r=el.getBoundingClientRect();if(r.height&&r.top>=0){c.push([el,r.top]);if(c.length>=8)break}}}catch(e){}
  // nothing else changed since the last redraw (same team and settings): only the parts drawn from the plans are redrawn
  const x=ui.planCtx;if(x&&x.key===planCache.key&&ui.plans&&ui.plans.pending){ui.plans=planCache.plans;plansDraw(x,ui.plans);
    if(typeof CH!=='undefined'){if(view==='build'||view==='report'){CH.stale=false;safe('concept h team',chTeamRender)}else CH.stale=true}}
  else render();
  if(tap){try{if(KP.hold())return}catch(e){}}
  try{for(const [el,top] of c)if(el.isConnected&&el.getClientRects().length){const d=el.getBoundingClientRect().top-top;if(Math.abs(d)>1)window.scrollBy(0,d);break}}catch(e){}}
// Parts of the page that aren't showing (another page, a closed tab) are redrawn when they show, not on every edit: each edit
// used to redraw every page (Oct 31). lazy() runs a part now if it shows, else marks it; lazyFlush() (on a page or tab switch)
// draws the marked parts that now show, with the state at that moment, as a full redraw would have.
const lazyDirty=new Map();
function lazyShown(id){const el=$(id);return !el||!el.closest('[hidden]')}
function lazy(name,id,fn){if(lazyShown(id)){lazyDirty.delete(name);safe(name,fn)}else lazyDirty.set(name,[id,fn])}
function lazyFlush(){for(const [name,[id,fn]] of [...lazyDirty])if(lazyShown(id)){lazyDirty.delete(name);safe(name,fn)}}
// every redraw starts from fresh calculations (shared with the rebuild, R4 Nov 11)
function clearCaches(){pmCache=new Map();vCache=new Map();setCache=new Map();pairCache=new Map();relCache=new Map()}
function render(){
  clearCaches();persist();renderSlots();
  const useA=$('useAbil').checked;const ms=members();const msPlay=playForm(ms);const a=analyze(msPlay,useA);
  {const empty=!ms.length;const sc=$('startCard');if(sc)sc.hidden=!empty;for(const id of ['defense','fixes']){const e=$(id);if(e)e.hidden=empty}}
  document.querySelectorAll('[data-megas]').forEach(x=>x.setAttribute('aria-pressed',+x.dataset.megas===megaGoal()));
  $('eyebrow').textContent='Pokémon Champions · Regulation M-C · VGC Doubles · bring 6, pick 4';showDataDate();
  const loaded=S.teams.find(t=>t.id===S.loadedId);
  $('teamTitle').textContent=loaded?loaded.name:'Team';document.querySelectorAll('.tc').forEach(tc=>tc.textContent=ms.length?ms.length+'/6':'');
  $('saveBtn').textContent=loaded?'Update saved team':'Save team';
  // defense card
  const weakChips=a.rows.filter(t=>t.w>t.r).map(t=>chip(t.atk,t.w-t.r>1?` <b>×${t.w-t.r}</b>`:'')).join('');
  const tied=a.rows.filter(t=>t.w>0&&t.w===t.r).map(t=>chip(t.atk)).join('');
  const PG=ms.length?proGrades(ms,useA):null;
  const CK=ms.length?proChecks(ms,useA):null;
  // threat preparation behind the defense and offense headlines (the same report as the threat card)
  const RDf=ms.length?prepOf(ms):null,RDd=RDf?{over:RDf.rows.filter(r=>r.losers.length>=3),hit:RDf.rows.filter(r=>r.rows.some(x=>x.du&&x.du.nM<=2)).length,noHit:RDf.rows.filter(r=>!r.rows.some(x=>x.du&&x.du.nM<=2)).sort((x,y)=>y.t.w-x.t.w)}:null;
  $('chkCard').innerHTML=`<div class="ckhead vtx"><div><div class="k">Team checks${CK&&!CK.full?' · so far':''}</div><div class="v">${CK?`${CK.pass} of ${CK.n} checks`:'Add Pokémon to see the checks'}</div></div></div>
     <div class="t2">What recent event winners usually have, measured live from the Events data. A missing check is a gap to know about, not a verdict: plenty of winning teams miss one, and play decides most games. A ~ means only partly there, and doesn't count as passed.</div>
     ${CK?(L=>`<ul class="cklist">${L(CK.items.filter(x=>!x.note))}</ul>${CK.items.some(x=>x.note)?`<div class="cknotes"><b>Notes, not counted</b><span>In 38,513 real games, with player skill taken into account, teams with these won no more often.</span></div><ul class="cklist ckn3">${L(CK.items.filter(x=>x.note),1)}</ul>`:''}`)((a,nt)=>a.map(x=>`<li>${ckIcon(x)}<div><b>${x.label}</b><div class="t2">${esc(x.ok?x.have:x.miss)}</div>${x.pro&&!nt?`<div class="ckpro">${x.pro}</div>`:''}</div></li>`).join('')):''}`;
  safe('verdict',()=>renderVerdict(ms,a,PG,CK));safe('team hero',()=>renderTeamHero(ms));
  $('defCard').innerHTML=`<div class="vtx"><div class="k">Defense${PG&&!PG.full?' · so far':''}</div><div class="v">${!ms.length?'—':a.excess?`${a.excess} more weakness${a.excess===1?'':'es'} than resistances`:'Every weakness is covered by a resist'}</div>
     <div class="vsub">${ms.length}/6 Pokémon${RDd?` · ${RDd.over.length} of the top 30 threats beat 3+ of yours 1-on-1${RDd.over.length?` (${RDd.over.slice(0,3).map(r=>esc(r.t.d)).join(', ')}${RDd.over.length>3?` and ${RDd.over.length-3} more`:''})`:''}`:''}</div></div>
     <div class="kv"><span>More weak than resist</span><div class="chips">${weakChips||'<span class="none">None</span>'}</div>
     <span>Nobody resists</span><div class="chips">${a.unresisted.map(t=>chip(t)).join('')||'<span class="none">None</span>'}</div>
     <span>Even split</span><div class="chips">${tied||'<span class="none">None</span>'}</div>
     </div>
     <div class="t2">×2 next to a type means 2 more of yours are weak to it than resist it.</div>${megaPickHtml(ms)}`;
  // offense
  const ctx=teamContext(useA?ms:[]);
  const perMon=ms.map(m=>{const mm=memberMoves(m);return {m,src:mm.src,en:attackEntries({...m,ability:useA?m.ability:null},mm.moves,ctx)}});
  const entries=perMon.flatMap(x=>x.en);
  const stabOnly=perMon.filter(x=>x.src==='stab').map(x=>x.m.d);
  const tRows=TYPES.map(t=>{const hits=perMon.map(x=>({m:x.m,b:bestHit(x.en,[t],null)})).filter(h=>h.b&&h.b.x>=2);
    return {t,hits,best:bestHit(entries,[t],null)}});
  const covered=tRows.filter(r=>r.hits.length).length;
  $('offCard').innerHTML=`<div class="vtx"><div class="k">Offense${PG&&!PG.full?' · so far':''}</div><div class="v">${RDd?`You OHKO or 2HKO ${RDd.hit} of the top 30 threats`:'—'}</div>
     <div class="vsub">${covered}/18 types hit super effectively by at least one of yours</div></div>
     <div class="kv">${RDd&&RDd.noHit.length?`<span>Nothing 2HKOs</span><div style="font-size:13px">${RDd.noHit.slice(0,6).map(r=>esc(r.t.d)).join(', ')}<div class="t2">Top threats none of yours can OHKO or 2HKO with your moves (damage calc against their usual sets)</div></div>`:''}<span>Nobody hits super effectively</span><div class="chips">${tRows.filter(r=>!r.hits.length).map(r=>chip(r.t)).join('')||'<span class="none">None</span>'}</div>
     ${stabOnly.length?`<span>Types only</span><div style="font-size:13px;color:var(--warn)">${esc(stabOnly.join(', '))}: no move data yet, so only their own types are counted</div>`:''}</div>`;
  safe('offense vs meta',()=>renderOffMeta(entries,useA));
  $('offTypes').innerHTML=`<tr><th class="t">Defending type</th><th>Best</th><th class="t">Who hits it super effectively</th></tr>`+tRows.map(r=>{const x=r.best?r.best.x:0;
    return `<tr class="${r.hits.length?'':'prob'}"><td class="t">${chip(r.t)}</td><td>${mcell(x)}</td><td class="who">${r.hits.length?r.hits.map(h=>`${esc(h.m.d)} <span style="opacity:.8">(${esc(h.b.e.move)})</span>`).join(', '):'<span class="no">Nobody</span>'}</td></tr>`}).join('');
  // defense grid
  const head=`<tr><th class="t">Attack</th>${msPlay.map(m=>`<th class="gmon" title="${esc(m.d)}" aria-label="${esc(m.d)}">${sprite(m.p,'mini')||''}<span class="gnm">${esc(m.d.replace('Mega ','M·').slice(0,12))}</span></th>`).join('')}<th class="gwr">Weak</th><th class="gwr">Resist</th><th>Net</th></tr>`;
  $('grid').innerHTML=head+a.rows.map(t=>`<tr class="${t.w>t.r?'prob':''}"><td class="t">${chip(t.atk)}</td>${msPlay.map(m=>`<td>${dcell(mult(t.atk,m.types,m.ability,useA))}</td>`).join('')}<td class="gwr">${t.w||''}</td><td class="gwr">${t.r||''}</td><td class="net ${t.net>0?'pos':t.net<0?'neg':'zero'}">${t.net>0?'+'+t.net:t.net}</td></tr>`).join('');
  // problems + plans
  safe('game plan',()=>renderGamePlan(ms));
  const pool=suggestPool();
  // Plans only change when the team, pool, settings, box or meta data change, so reuse them otherwise.
  const planKey=planKeyOf(useA);
  let plans=[];
  // Fix plans are the slow part (about a third of a second, 3 s on a mid-range phone); they're only shown on the Team page, so
  // other pages skip them and the Team page works them out when it opens: in small slices between frames, so the edit itself
  // paints at once and the plans fill in a moment later (Oct 31). The last few teams' plans are kept, so Undo is instant.
  const onTeam=typeof view==='undefined'||view==='build'||view==='report'||view==='coverage';
  if(planCache.key===null&&planCache.plans&&!planCache.plans.length)planLRU.clear();
  if(planCache.key!==planKey&&planLRU.has(planKey)){ui.plansStale=false;ui.planMore=0;planCache={key:planKey,plans:planLRU.get(planKey)}}
  if(planCache.key===planKey)plans=planCache.plans;
  else if(!onTeam){plans=[];ui.plansStale=true}
  else if(!ms.length){ui.plansStale=false;ui.planMore=0;planCache={key:planKey,plans};planKeep(planKey,plans)}
  else{ui.plansStale=false;if(!planJob||planJob.key!==planKey)ui.planMore=0;planJobStart(planKey,ms,pool,useA,a);plans=[];plans.pending=true}
  ui.plans=plans;ui.planCtx={key:planKey,ms,a,tRows,useA,covered};plansDraw(ui.planCtx,plans);
  if(ckWinNeeded())safe('checklist claims',ckWinRefresh);safe('saved teams',renderSaved);safe('box',renderBox);safe('exclude',renderExcl);lazy('auto-build','abOut',()=>renderAutoBuild());safe('pool',renderPoolCtl);fixMetaSrc();lazy('meta','metaList',()=>renderMeta());{const lp=document.querySelector('[data-pane="ratings"]');if(lp&&lp.hidden===false)safe('ratings',renderLair)}
  lazy('threats','threats',()=>renderThreats(members(),$('useAbil').checked));if(typeof view!=='undefined'){if(view==='speed')safe('speed tiers',renderSpeed);if(view==='calc')safe('damage calc',renderCalc);if(view==='gauntlet')safe('gauntlet',renderGauntlet);if(view==='battle')safe('battle',renderBattle);if(view==='cores')safe('cores',renderCores);if(view==='events')safe('events',renderEvents);if(view==='top')safe('team search',renderTeamSearch);if(view==='practice'&&typeof renderPractice==='function'&&(!META.practice||pr.step==='start'))safe('practice',renderPractice);if(view==='compare')safe('compare',renderCompare)}{const cv=document.querySelector('[data-pane="coverage"]');if(cv&&cv.hidden===false)setTimeout(()=>safe('additions',renderRecs),0)}safe('types',renderTypes);safe('matchup',renderMatchup);lazy('top teams','ttList',()=>renderTopTeams());safe('battle log',renderLog);lazy('sets','sets',()=>renderSets());safe('paste',renderPastePanel);safe('home',renderHome);
}
// The scouting report's header: legal and items first, then how ready the team is for the top threats, the checklist, and
// real results. Facts only: no win chance, no prediction (Oct 28).
function renderVerdict(ms,a,PG,CK){
  const el=$('verdict');ui.vProven=false;ui.vsum=null;if(!el)return;if(!ms.length){el.innerHTML='';return}
  const n=ms.length,miss=CK?CK.items.filter(x=>!x.ok&&!x.skip&&!x.note):[];
  const rows=[];let best=null;
  // a real tournament team with 5+ of these six, brought by 3+ players (one player's team is a result, not a pattern)
  if(n>=5&&RES&&Array.isArray(RES.proven)){const names=new Set(ms.map(m=>m.p.n));
    for(const e of RES.proven){const [ns,c,wr]=e;if(!(c>=3))continue;const k=ns.filter(x=>names.has(x)).length;if(k>=5&&(!best||k>best.k||(k===best.k&&wr>best.wr)))best={k,c,wr,g:e[3]}}}
  const tr=typeof teamRecord==='function'?teamRecord(ms):null;
  // 1. legal and items
  const bs=ms.map(m=>m.p.b),dup=ms.find((m,i)=>bs.indexOf(m.p.b)!==i);
  let ip=[];try{ip=typeof itemProblems==='function'?itemProblems(ms):[]}catch(e){}
  const clause=ip.filter(x=>x.k==='clause'),illegal=!!dup||clause.length>0,mc=megaCount(ms);
  const legalBits=[];if(dup)legalBits.push(`<span class="warnline">Not legal: only one ${esc(dup.p.b)} (any form) is allowed</span>`);
  for(const x of clause)legalBits.push(`<span class="warnline">Not legal: ${esc(x.why)}</span>`);
  for(const x of ip.filter(x=>x.k!=='clause'))legalBits.push(`<span class="warnline">${esc(x.why)}</span>`);
  if(!legalBits.length)legalBits.push(`Legal: every species and item is different${n<6?' so far':''}`);
  legalBits.push(mc>1?`${mc} Megas (you choose one to Mega Evolve each battle)`:mc===1?'1 Mega':'No Mega');
  rows.push(['Legal &amp; items',legalBits.join('<br>')]);
  // 2. threat preparation
  const RD=prepOf(ms);
  if(RD){const un=RD.rows.filter(r=>r.level===0),sh=RD.rows.filter(r=>r.level===1);
    rows.push(['No answer for',un.length?un.slice(0,5).map(r=>esc(r.t.d)).join(', ')+(un.length>5?` and ${un.length-5} more`:''):'None of the top 30']);
    if(sh.length)rows.push(['Shaky against',sh.slice(0,5).map(r=>esc(r.t.d)).join(', ')+(sh.length>5?` and ${sh.length-5} more`:'')])}
  // 3. checklist, real results, your record, type balance
  if(CK)rows.push(['Checklist',`${CK.pass} of ${CK.n} checks`+(miss.length?` · not yet: ${miss.slice(0,2).map(x=>x.label.toLowerCase()).join(' and ')}`:'')]);
  if(best)rows.push(['Real results',`${best.k===6?'This exact team':'5 of these 6'} won about ${Math.round(best.wr*100)}% of games at Limitless events (${best.c} players${best.g?`, ${best.g} games`:''})${best.g&&thinFor(best.g,'record')?' · early read: few games':''}`]);
  if(tr)rows.push(['Your games',`${tr.w}-${tr.l} in games you logged with this six (${tr.pct}%)`]);
  rows.push(['Type balance',a.excess?`${a.excess} more weakness${a.excess===1?'':'es'} than resists`+(a.unresisted.length?`; nothing resists ${a.unresisted.slice(0,2).join(', ')}`:''):'every weakness covered']);
  const score=RD?RD.score:null;
  const lvl=illegal?'bad':n<6?'mid':score==null?'mid':score>=80?'good':score>=65?'mid':'bad';
  const head=illegal?'Not a legal team yet':score==null?`${n} of 6 picked`:n<6?`${n} of 6 picked · ready for ${score}% of the top threats so far`:`Ready for ${score}% of the top 30 threats`;
  ui.vsum={lvl,head,best,tr,CK,excess:a.excess,RD:score==null?null:{score},legal:!illegal};
  ui.vProven=!!(best&&best.k===6&&best.wr>=.55);el.className='verdict '+lvl;
  const chips=[score!=null?`<span class="rchip"><b>${score}%</b> ready${typeof tip==='function'?tip('readiness'):''}</span>`:'',CK?`<span class="rchip"><b>${CK.pass}/${CK.n}</b> checks${typeof tip==='function'?tip('checklist'):''}</span>`:'',`<span class="rchip ${illegal?'bad':'ok'}"><b>${illegal?'Not legal':'Legal'}</b></span>`].join('');
  el.innerHTML=`<div class="vhead"><span class="vdot" aria-hidden="true"></span><b class="vtitle">${esc(head)}${!illegal&&RD&&typeof CH!=='undefined'&&CH.hand(RD)?` · ${CH.handTxt(RD,true)}`:''}</b></div><div class="rchips">${chips}</div><dl>${rows.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')}</dl>${typeof regNote==='function'?regNote():''}`;
  safe('threat card',()=>renderThreatCard(ms,RD))}
// With 2+ Megas, the type chart reads one as the Mega (only one Mega Evolves per battle): pick which
function megaPickHtml(ms){const megas=ms.filter(m=>m.p&&m.p.m);if(megas.length<2)return '';const keep=megas.find(m=>m.p.n===ui.megaPick)||megas[0];
  return `<div class="t2 megapick">Only one Mega Evolves per battle, so the chart reads <b>${esc(keep.d)}</b> as the Mega and the others in base form. Show: ${megas.map(m=>`<button type="button" class="linkbtn" data-megapick="${esc(m.p.n)}" aria-pressed="${m===keep}">${esc(m.d)}</button>`).join(' · ')}</div>`}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-megapick]');if(!b)return;ui.megaPick=b.dataset.megapick;keepScroll(()=>render())});
// Threat preparation card: every top threat, grouped by how ready the team is, each with the calc behind the verdict.
const THR_LV=[['No answer','l0'],['Shaky','l1'],['Handles it','l2'],['Beats it','l3']];
function renderThreatCard(ms,RD){const el=$('thrCard');if(!el)return;if(!RD||!ms.length){el.innerHTML='';return}
  const open=ui.thrOpen||{};
  /* the calc reasons are worked out in 59-matchup-data.js (thrReasons), shared with the new build */
  const det=r=>{const R=thrReasons(r);return `<ul class="thrd">${R.list.map(x=>x.k==='t2'?`<li class="t2">${esc(x.text)}</li>`:`<li class="${x.k}">${esc(x.text)}</li>`).join('')}</ul><div class="t2">Field: ${esc(R.field)} · its usual set: ${esc(R.set)}</div>`};
  const row=r=>{const p=byName.get(r.t.n);return `<details class="thrrow" data-thr="${esc(r.t.n)}"${open[r.t.n]?' open':''}><summary>${p?sprite(p,'mini'):''}<span class="thrn"><b>${esc(r.t.d)}</b><span class="vsub">${pctTxt(+r.t.w)} of top cuts</span></span><span class="thre">${esc(THR.evidence(r))}</span></summary>${det(r)}</details>`};
  const grp=(lv,start)=>{const rs=thrGroup(RD,lv);if(!rs.length)return '';const [lab,c]=THR_LV[lv];
    return `<details class="thrg ${c}"${start?' open':''}><summary><span class="thrl ${c}">${lab}</span> <span class="vsub">${rs.length} threat${rs.length===1?'':'s'}</span></summary>${rs.map(row).join('')}</details>`};
  const un=RD.rows.filter(r=>r.level===0).length;
  el.innerHTML=`<div class="vtx"><div class="k">Threat preparation${ms.length<6?' · so far':''}</div><div class="v">Ready for ${RD.score}% of the top 30 threats</div>
    <div class="vsub">${un?`${un} with no answer`:'Every threat has an answer'} · weighted by how often each makes top cut</div></div>
    ${grp(0,true)}${grp(1,true)}${grp(2,false)}${grp(3,false)}
    <p class="t2">Each verdict is a real damage calc with your sets against the set most players run (one-on-one, average rolls, no crits or misses), with the speed, weather, terrain, Tailwind and Trick Room your team actually has. Doubles adds partners and switches, so treat it as preparation, not a forecast.</p>`}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.classList&&d.classList.contains('thrrow')){ui.thrOpen=ui.thrOpen||{};ui.thrOpen[d.dataset.thr]=d.open}},true);
// (kept for the background win model only; never shown) Team Score, 0-100: where this team's strength (the win model, trained on real games with player skill removed) falls
// among real tournament teams from the last 45 days. 50 = a typical tournament team, 90 = top 10%.
// Tested Oct 26 on held-out events: the checklist and "answers to the meta" added almost nothing to predicting winners
// (checklist +0.0002 log-loss, meta coverage none), so they no longer move the score; they stay as advice. The old blend
// also capped each part at 100, so many odd teams scored a perfect 100. Now 100 means stronger than every recent team.
function teamScore({wv}){if(!wv)return null;const cl=x=>Math.max(0,Math.min(100,Math.round(x)));
  const pct=wv.pct!=null?wv.pct:null;
  // older model data (no team spread shipped yet): fall back to the win chance against an average team
  const score=pct!=null?cl(Math.floor(pct)):cl((wv.p-.35)/.3*100);
  // labels anchored to real event winners scored the same way with their own sets (ckWin, measured live): Winner level =
  // at least what the median recent event winner scores, Elite = what the top quarter of winners score. Before that's
  // measured: the Oct 27 numbers (120 winners, median 83, top quarter 92).
  const wm=ckWin&&ckWin.wmed!=null?ckWin.wmed:83,wq=ckWin&&ckWin.wq75!=null?ckWin.wq75:92;
  const label=score>=wq?'Elite':score>=wm?'Winner level':score>=50?'Above average':score>=30?'Playable':'Needs work';
  // the points taken off for an untried mix or missing basics (score before the cuts minus the score)
  const before=wv.pctRaw!=null?cl(Math.floor(wv.pctRaw)):score,cut=Math.max(0,before-score);
  // Item Clause: two Pokémon holding the same item can't enter a VGC event, so the team scores 0 until that's fixed
  const ill=wv.illegal&&wv.illegal.length?wv.illegal:null;
  if(ill)return {score:0,label:'Illegal: '+ill.map(([it,a])=>`${a.length} hold ${it}`).join(', '),illegal:ill,p:wv.p,pYou:wv.pYou,pct,before,cut:before};
  return {score,label,p:wv.p,pYou:wv.pYou,pct,before,cut}}
let pmCache=new Map();
// The 4 moves a Pokémon is graded and planned with: its 4 most-used moves, the same 4 its team card shows.
function runMoves(p){const pm=popularMoves(p),r=pm.slice(0,4);r.src=pm.src;r.pct=pm.pct;return r}
function popularMoves(p){const key=S.format+'|def|'+metaVersion+'|'+p.n;if(pmCache.has(key))return pmCache.get(key);const r=popularMoves_(p);pmCache.set(key,r);return r}
const AWKWARD=new Set(['Hyper Beam','Giga Impact','Explosion','Self-Destruct','Focus Punch','Solar Beam','Solar Blade','Sky Attack','Meteor Beam','Dream Eater','Belch','Last Resort','Steel Beam','Mind Blown','Head Smash','Blast Burn','Hydro Cannon','Frenzy Plant','Rock Wrecker','Roar of Time','Prismatic Laser','Eternabeam','Shell Trap','Future Sight','Doom Desire','Synchronoise','Burn Up','Double Shock','Outrage','Thrash','Petal Dance','Raging Fury']);
// Most-used moves for p in doubles (see setFor), else its singles set (live fallback: OTHER() is 'singles'), else its strongest attacks.
function popularMoves_(p){const toMoves=a=>a.map(([n])=>mvByName.get(n)).filter(Boolean).slice(0,6);
  const st=defSet(p);let r=toMoves(st.mv);if(r.length){const cs=csOf(p),learn=new Set((LEARN[p.n]||[]).map(k=>MV[k].name));if(cs){const first=cs.mv.map(n=>typeof canonMove==='function'?canonMove(n,p):n).filter(n=>learn.has(n)).map(n=>mvByName.get(n)).filter(Boolean);if(first.length===4)r=[...first,...r.filter(m=>!first.includes(m))].slice(0,6)}r.src=st.src.mv;r.pct=new Map(st.mv);return r}
  const o=setFor(p,OTHER());r=toMoves(o.mv);if(r.length){r.src='other';r.pct=new Map();return r}
  const learnIdx=LEARN[p.n]||[];const ng=p.a.includes('No Guard');const atk=learnIdx.map(k=>MV[k]).filter(m=>m&&isCoverage(m)&&m.bp>0&&m.bp<=160&&!AWKWARD.has(m.name)&&(ng||!LOW_ACC.has(m.name)));const pow=m=>m.bp*(p.t.includes(m.type)?1.5:1);
  const out=[];for(const t of p.t){const m=atk.filter(x=>x.type===t).sort((x,y)=>y.bp-x.bp)[0];if(m)out.push(m)}
  for(const m of atk.sort((x,y)=>pow(y)-pow(x))){if(out.length>=4)break;if(!out.some(o=>o.type===m.type))out.push(m)}
  out.src='guess';out.pct=new Map();return out}
// The format whose sets fill in when doubles has none. The page is doubles only, so this is always singles.
const OTHER=()=>'singles';
function abilityPct(p,a){const x=defSet(p).ab.find(([n])=>n===a);return x?x[1]:null}
// Held items players run: a Mega holds its stone; otherwise the top items in doubles.
function topItems(p){const st=defSet(p);if(!st.it.length)return null;let it=st.it;const cs=csOf(p);if(cs&&cs.it&&!p.m){const c=typeof canonItem==='function'?canonItem(cs.it):cs.it,h=it.find(([n])=>n===c);it=[h||[c,null],...it.filter(([n])=>n!==c)]}return {src:st.src.it,it:it.slice(0,2)}}
function pcTxt(v){return v!=null?` <span class="vsub">${(+v).toFixed(0)}%</span>`:''}
// Item and nature most players run, shown on the card.
function setRows(p,o){const st=setFor(p),it=o&&o.noItem?null:topItems(p),na=st.na.length?st.na.slice(0,2):null;
  if(!it&&!na)return '';
  const tag=src=>src==='sd'?` <span class="vsub" title="Showdown ladder, 1630+ rating">(Showdown)</span>`:'';
  const line=(label,arr,src)=>`<span class="lbl">${label}</span><div><span class="iname">${esc(arr[0][0])}</span>${pcTxt(arr[0][1])}${arr[1]?`<span class="ialt">or ${esc(arr[1][0])}${pcTxt(arr[1][1])}</span>`:''}${tag(src)}</div>`;
  const cs=typeof commonSpread==='function'?commonSpread(p):null;
  const spr=o&&o.noSpread?'':cs?`<span class="lbl">Spread${typeof tip==='function'?tip('spread'):''}</span><div><span class="iname">${cs.hp}/${cs.atk}/${cs.def}/${cs.spa}/${cs.spd}/${cs.spe}</span> <span class="vsub" title="HP/Atk/Def/SpA/SpD/Spe stat points, most common on the Showdown ladder (1630+)">${esc(cs.nat)} · HP/Atk/Def/SpA/SpD/Spe</span></div>`:'';
  // your own nature, once set, leads the row (Oct 30 audit: it kept showing the meta's natures next to your spread)
  const mineN=o&&o.mine?`<span class="lbl">Nature</span><div><span class="iname">${esc(o.mine)}</span> <span class="tag mine">YOURS</span>${na&&na[0][0]!==o.mine?`<span class="ialt">usually ${esc(na[0][0])}${pcTxt(na[0][1])}</span>`:''}</div>`:'';
  return `<div class="itemrow">${it?line('Item',it.it,it.src):''}${mineN||(na?line('Nature',na,st.src.na):'')}${spr}</div>`}
// The spread a team member is played with, and where it comes from: yours (paste, link or set here), assumed (a team sheet
// gave a nature but no points, so the most common spread), or the most common one. One tap opens a small editor.
// Nature and stat points in Edit set (Sim, Nov 6: "i dont even know where to look"): a nature dropdown like Ability (players'
// share and the stat it raises and lowers, ★ most run) that saves on pick, and six labelled stat point boxes with a live total.
function natFx(n){const u=Object.keys(NAT_UP).find(k=>NAT_UP[k].includes(n)),d=Object.keys(NAT_DN).find(k=>NAT_DN[k].includes(n));return u&&d?`+${u} −${d}`:'no change'}
function spreadBlock(s,i,m){const p=m.p,{cs,own,pc,top,nat,ownNat,ownPts,v,sum,order}=natureChoices(s,p),L=['HP','Atk','Def','SpA','SpD','Spe'];
  const opt=n=>`<option value="${esc(n)}"${n===nat?' selected':''}>${esc(n)} · ${natFx(n)}${pc.has(n)?` (${(+pc.get(n)).toFixed(pc.get(n)<1?1:0)}%)`:''}${n===top?' ★':''}</option>`;
  /* two cells, so the Edit set grid pairs Nature | Stat points, then Ability | Item, each at its own height (Nov 7) */
  return `<div class="spnew spnat"><div class="lblrow"><span class="lbl">Nature</span>${ownNat?`<span class="tag mine">YOUR PICK</span><button class="linkbtn" type="button" data-spnatreset="${i}">Use ${esc(top||'most run')}</button>`:top?'<span class="tag rec">MOST RUN</span>':''}</div>
    <select class="field" data-spnat="${i}" aria-label="Nature for ${esc(p.d)}">${order.map(opt).join('')}</select></div>
    <div class="spnew sppts"><div class="lblrow"><span class="lbl">Stat points</span>${ownPts?`<span class="tag mine">YOURS</span><button class="linkbtn" type="button" data-spptsreset="${i}">Use most common</button>`:own&&own.assumed&&cs?'<span class="asm" title="No stat points were set: these are the most common ones, with your nature">assumed</span>':cs?'<span class="tag rec">MOST COMMON</span>':''}<span class="vsub sptot" id="sptot${i}">${sum} of ${SP_TOTAL}</span></div>
    <div class="spgrid">${L.map((l,j)=>`<label><span>${l}</span><input class="field" type="number" min="0" max="32" step="1" inputmode="numeric" data-spi="${i}:${j}" value="${v[j]}" aria-label="${l} stat points for ${esc(p.d)}"></label>`).join('')}</div>
    <div class="spacts"><button class="btn sm ar-btn" style="--edge:var(--ar-blue)" type="button" data-spsave2="${i}">Save stat points</button><span class="vsub" id="spmsg${i}" role="status"></span></div></div>`}
document.addEventListener('change',e=>{const t=e.target;if(!t.matches||!t.matches('[data-spnat]'))return;if(!setNature(+t.dataset.spnat,t.value))return;render();toast('Nature saved')});
document.addEventListener('input',e=>{const t=e.target;if(!t.matches||!t.matches('[data-spi]'))return;const i=t.dataset.spi.split(':')[0];
  const v=[...document.querySelectorAll(`[data-spi^="${i}:"]`)].map(x=>+x.value||0),tot=v.reduce((a,b)=>a+b,0),el=$('sptot'+i);if(el){el.textContent=`${tot} of ${SP_TOTAL}`;el.classList.toggle('over',tot>SP_TOTAL)}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-spsave2],[data-spnatreset],[data-spptsreset]');if(!b)return;
  if(b.dataset.spnatreset!=null){if(!resetNature(+b.dataset.spnatreset))return;render();toast('Using the nature most players run');return}
  if(b.dataset.spptsreset!=null){if(!resetPoints(+b.dataset.spptsreset))return;render();toast('Using the most common stat points');return}
  const i=+b.dataset.spsave2,s=S.slots[i],v=[...document.querySelectorAll(`[data-spi^="${i}:"]`)].map(x=>x.value===''?0:Number(x.value)),msg=$('spmsg'+i),sel=document.querySelector(`[data-spnat="${i}"]`),nat=sel?sel.value:null;
  const bad=savePoints(i,nat,v);if(bad){if(msg)msg.textContent=bad;return}render();toast('Stat points saved')});
document.addEventListener('click',e=>{const b=e.target.closest('[data-spedit],[data-spsave],[data-spclear]');if(!b)return;
  if(b.dataset.spedit!=null){ui.spEdit=b.dataset.spedit===''?null:+b.dataset.spedit;renderSlots();const f=$('spv'+ui.spEdit);if(f)f.focus();return}
  if(b.dataset.spclear!=null){const s=S.slots[+b.dataset.spclear];if(s&&s.sp)delete s.sp[S.format];ui.spEdit=null;render();toast('Using the most common spread');return}
  const i=+b.dataset.spsave,s=S.slots[i],raw=($('spv'+i)||{}).value||'',nat=($('spn'+i)||{}).value,v=raw.split(/[\/\s,]+/).filter(Boolean).map(Number),msg=$('spmsg'+i);
  const bad=v.length!==6||v.some(n=>!Number.isInteger(n)||n<0||n>32)?'Six numbers, 0-32 each':v.reduce((a,b)=>a+b,0)>SP_TOTAL?`${v.reduce((a,b)=>a+b,0)} points: Champions allows ${SP_TOTAL}`:!natOK(nat)?'Pick a nature':'';
  if(bad){if(msg)msg.textContent=bad;return}
  s.sp=Object.assign({},s.sp,{[S.format]:{nat,v}});ui.spEdit=null;render();toast('Spread saved')});
// Each Pokémon is read with the 4 moves on its card (popular set unless you changed them).
function memberMoves(m){const mv=m.moves&&m.moves.length?m.moves:popularMoves(m.p);if(mv.some(isCoverage))return {moves:mv,src:m.custom?'yours':'popular'};return {moves:[],src:'stab'}}
const GP_TAG={ok:['ok','Covered'],part:['mid','Partly'],miss:['hi','Missing'],opt:['lo','Optional']};
function renderGamePlan(ms){const el=$('gplan');if(!el)return;
  if(!ms.length){el.innerHTML='<div class="empty-note">Add Pokémon to see which jobs the team covers.</div>';$('gplanSub').textContent='';return}
  const gp=gamePlan(ms);{let lb='';try{const a=teamArchetype(ms);lb=a?a.label:''}catch(e){}$('gplanSub').innerHTML=(lb?`<span class="archchips">${archChips(lb)}</span>`:'')}
  el.innerHTML=gp.rows.map(r=>{const [c,t]=GP_TAG[r.st];return `<div class="gprow"><span class="gplbl">${esc(r.label)}</span><span class="sev ${c}">${t}</span><div class="gpwho">${r.who?esc(r.who):''}${r.note?`<div class="t2">${esc(r.note)}</div>`:''}</div></div>`}).join('')}

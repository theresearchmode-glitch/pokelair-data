// ---------- render: everything ----------
let renderQueued=false,planCache={key:null,plans:[]},metaVersion=0;
// While the page is opening, the data arrives in up to 11 pieces; a short wait lets pieces that land close together share
// one redraw instead of one each.
function scheduleRender(){if(renderQueued)return;renderQueued=true;setTimeout(()=>{renderQueued=false;bgRender()},performance.now()<6000?90:0)}
// Background updates (data arriving, slow checks finishing) wait while someone is typing in a box: a redraw would rebuild the box
// and wipe what they typed (Oct 30 audit). They run as soon as the box loses focus.
function typingNow(){const a=document.activeElement;return !!(a&&(a.tagName==='TEXTAREA'||(a.tagName==='INPUT'&&/^(text|search|)$/.test(a.type||''))))}
let bgWait=false;function bgRender(){if(!typingNow()){render();return}if(bgWait)return;bgWait=true;const go=()=>{document.removeEventListener('focusout',go,true);setTimeout(()=>{bgWait=false;if(typingNow()){bgRender();return}render()},150)};document.addEventListener('focusout',go,true)}
// Run one part of the page; if it throws, log it and keep the rest of the page working.
function safe(name,fn){try{fn()}catch(err){try{console.error('Champions Team Coverage: '+name+' failed',err)}catch(e){}}}
function render(){
  pmCache=new Map();vCache=new Map();setCache=new Map();pairCache=new Map();relCache=new Map();persist();renderSlots();
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
  $('chkCard').innerHTML=`<div class="ckhead vtx"><div><div class="k">Winning-team checklist${CK&&!CK.full?' · so far':''}</div><div class="v">${CK?`${CK.pass} of ${CK.n} checks`:'Add Pokémon to see the checks'}</div></div></div>
     <div class="t2">What recent event winners usually have, measured live from the Events data. A missing check is a gap to know about, not a verdict: plenty of winning teams miss one, and play decides most games. A ~ means only partly there, and doesn't count as passed.</div>
     ${CK?`<ul class="cklist">${CK.items.map(x=>`<li>${ckIcon(x)}<div><b>${x.label}</b><div class="t2">${esc(x.ok?x.have:x.miss)}</div>${x.pro?`<div class="ckpro">${x.pro}</div>`:''}</div></li>`).join('')}</ul>`:''}`;
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
  const planKey=JSON.stringify([OFFMETA,S.slots,ui.pool,S.format,megaGoal(),$('swapMega').checked,useA,ui.metaSrc,metaVersion,S.box.join(),S.excl.join(),S.teams.map(t=>t.format+t.slots.map(x=>x.n).join()).join()]);
  let plans=[];
  // Fix plans are the slow part (about a third of a second); they're only shown on the Team page, so other pages skip them
  // and the Team page works them out when it opens.
  const onTeam=typeof view==='undefined'||view==='build'||view==='report'||view==='coverage';
  if(planCache.key===planKey)plans=planCache.plans;
  else if(!onTeam){plans=[];ui.plansStale=true}
  else safe('fix plans',()=>{ui.plansStale=false;ui.planMore=0;plans=ms.length?planFixes(ms,pool,useA):[];
    // hidden gems for Quick add: the same search, scored on power and fit, over strong Pokémon outside the usual meta picks
    if(ms.length&&!OFFMETA){const gp=pool.filter(p=>!isMetaPick(p)&&((p.s||0)>=470||p.m));try{plans.gems=withOffMeta(()=>planFixes(ms,gp,useA,{singlesOnly:true}))}catch(e){plans.gems=null}}
    planCache={key:planKey,plans}});
  ui.plans=plans;safe('problems',()=>renderProblems(ms,a,tRows,useA,plans));
  if(ui.vProven){const nd=$('needs');if(nd&&nd.innerHTML&&nd.insertAdjacentHTML)nd.insertAdjacentHTML('afterbegin','<div class="t2 provnote">This exact team has won at real events. Treat these as optional tweaks, not problems.</div>')}
  safe('plan cards',()=>renderPlans(ms,a,plans,useA,covered));
  safe('checklist claims',ckWinRefresh);safe('saved teams',renderSaved);safe('box',renderBox);safe('exclude',renderExcl);safe('auto-build',renderAutoBuild);safe('pool',renderPoolCtl);safe('meta',renderMeta);{const lp=document.querySelector('[data-pane="ratings"]');if(lp&&lp.hidden===false)safe('ratings',renderLair)}
  safe('threats',()=>renderThreats(ms,useA));if(typeof view!=='undefined'){if(view==='speed')safe('speed tiers',renderSpeed);if(view==='calc')safe('damage calc',renderCalc);if(view==='gauntlet')safe('gauntlet',renderGauntlet);if(view==='battle')safe('battle',renderBattle);if(view==='cores')safe('cores',renderCores);if(view==='events')safe('events',renderEvents);if(view==='top')safe('team search',renderTeamSearch)}{const cv=document.querySelector('[data-pane="coverage"]');if(cv&&cv.hidden===false)setTimeout(()=>safe('additions',renderRecs),0)}safe('types',renderTypes);safe('matchup',renderMatchup);safe('top teams',renderTopTeams);safe('battle log',renderLog);safe('sets',renderSets);safe('paste',renderPastePanel);safe('home',renderHome);
}
// The scouting report's header: legal and items first, then how ready the team is for the top threats, the checklist, and
// real results. Facts only: no win chance, no prediction (Oct 28).
function renderVerdict(ms,a,PG,CK){
  const el=$('verdict');ui.vProven=false;ui.vsum=null;if(!el)return;if(!ms.length){el.innerHTML='';return}
  const n=ms.length,miss=CK?CK.items.filter(x=>!x.ok&&!x.skip):[];
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
    rows.push(['Not ready for',un.length?un.slice(0,5).map(r=>esc(r.t.d)).join(', ')+(un.length>5?` and ${un.length-5} more`:''):'None of the top 30']);
    if(sh.length)rows.push(['Shaky against',sh.slice(0,5).map(r=>esc(r.t.d)).join(', ')+(sh.length>5?` and ${sh.length-5} more`:'')])}
  // 3. checklist, real results, your record, type balance
  if(CK)rows.push(['Checklist',`${CK.pass} of ${CK.n} checks`+(miss.length?` · not yet: ${miss.slice(0,2).map(x=>x.label.toLowerCase()).join(' and ')}`:'')]);
  if(best)rows.push(['Real results',`${best.k===6?'This exact team':'5 of these 6'} won about ${Math.round(best.wr*100)}% of games at Limitless events (${best.c} players${best.g?`, ${best.g} games`:''})`]);
  if(tr)rows.push(['Your record',`${tr.w}-${tr.l} with this team (${tr.pct}%)`]);
  rows.push(['Type balance',a.excess?`${a.excess} more weakness${a.excess===1?'':'es'} than resists`+(a.unresisted.length?`; nothing resists ${a.unresisted.slice(0,2).join(', ')}`:''):'every weakness covered']);
  const score=RD?RD.score:null;
  const lvl=illegal?'bad':n<6?'mid':score==null?'mid':score>=80?'good':score>=65?'mid':'bad';
  const head=illegal?'Not a legal team yet':score==null?`${n} of 6 picked`:n<6?`${n} of 6 picked · ready for ${score}% of the top threats so far`:`Ready for ${score}% of the top 30 threats`;
  ui.vsum={lvl,head,best,tr,CK,excess:a.excess,RD:score==null?null:{score},legal:!illegal};
  ui.vProven=!!(best&&best.k===6&&best.wr>=.55);el.className='verdict '+lvl;
  const chips=[score!=null?`<span class="rchip"><b>${score}%</b> ready${typeof tip==='function'?tip('readiness'):''}</span>`:'',CK?`<span class="rchip"><b>${CK.pass}/${CK.n}</b> checks${typeof tip==='function'?tip('checklist'):''}</span>`:'',`<span class="rchip ${illegal?'bad':'ok'}"><b>${illegal?'Not legal':'Legal'}</b></span>`].join('');
  el.innerHTML=`<div class="vhead"><span class="vdot" aria-hidden="true"></span><b class="vtitle">${esc(head)}</b></div><div class="rchips">${chips}</div><dl>${rows.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')}</dl>`;
  safe('threat card',()=>renderThreatCard(ms,RD))}
// With 2+ Megas, the type chart reads one as the Mega (only one Mega Evolves per battle): pick which
function megaPickHtml(ms){const megas=ms.filter(m=>m.p&&m.p.m);if(megas.length<2)return '';const keep=megas.find(m=>m.p.n===ui.megaPick)||megas[0];
  return `<div class="t2 megapick">Only one Mega Evolves per battle, so the chart reads <b>${esc(keep.d)}</b> as the Mega and the others in base form. Show: ${megas.map(m=>`<button type="button" class="linkbtn" data-megapick="${esc(m.p.n)}" aria-pressed="${m===keep}">${esc(m.d)}</button>`).join(' · ')}</div>`}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-megapick]');if(!b)return;ui.megaPick=b.dataset.megapick;keepScroll(()=>render())});
// Threat preparation card: every top threat, grouped by how ready the team is, each with the calc behind the verdict.
const THR_LV=[['Unanswered','l0'],['Shaky','l1'],['Handled','l2'],['Well handled','l3']];
function renderThreatCard(ms,RD){const el=$('thrCard');if(!el)return;if(!RD||!ms.length){el.innerHTML='';return}
  const pc=x=>Math.round(x*100),open=ui.thrOpen||{};
  const det=r=>{const L=[];for(const x of r.solid)L.push(`<li class="ok">${esc(x.why)}</li>`);for(const x of r.soft)L.push(`<li class="part">${esc(x.why)}</li>`);for(const x of r.warn)L.push(`<li class="no">${esc(x.why)}</li>`);
    if(r.losers.length)L.push(`<li class="no">It beats ${r.losers.map(x=>`${esc(x.m.d)} (${esc(x.du.d.mv)} ${pc(x.du.d.min)}-${pc(x.du.d.pct)}%${x.du.nT===1?', OHKO':', 2HKO'}${x.du.first?'':`, speed ${x.du.st} vs ${x.du.sm}`})`).join(', ')} 1-on-1${r.overloaded?`: only ${r.holders} of your Pokémon hold up against it, so any 4 you bring includes at least 2 it beats`:''}</li>`);
    if(r.mode)L.push(`<li class="t2">Judged by its job: ${esc(r.mode.map(x=>x.name).join(' and '))}</li>`);
    if(!L.length)L.push('<li class="no">Nothing on the team beats it 1-on-1 or stops what it does</li>');
    const f=r.field||{};return `<ul class="thrd">${L.join('')}</ul><div class="t2">Field: ${f.weather?esc(f.weather):'no weather'}, ${f.terrain?esc(f.terrain)+' terrain':'no terrain'} · its usual set: ${esc(r.t.moves.slice(0,4).map(m=>m.name).join(', '))}${r.t.item?' @ '+esc(r.t.item):''}</div>`};
  const row=r=>{const p=byName.get(r.t.n);return `<details class="thrrow" data-thr="${esc(r.t.n)}"${open[r.t.n]?' open':''}><summary>${p?sprite(p,'mini'):''}<span class="thrn"><b>${esc(r.t.d)}</b><span class="vsub">${(+r.t.w).toFixed(1)}% of top cuts</span></span><span class="thre">${esc(THR.evidence(r))}</span></summary>${det(r)}</details>`};
  const grp=(lv,start)=>{const rs=RD.rows.filter(r=>r.level===lv).sort((x,y)=>y.t.w-x.t.w);if(!rs.length)return '';const [lab,c]=THR_LV[lv];
    return `<details class="thrg ${c}"${start?' open':''}><summary><span class="thrl ${c}">${lab}</span> <span class="vsub">${rs.length} threat${rs.length===1?'':'s'}</span></summary>${rs.map(row).join('')}</details>`};
  const un=RD.rows.filter(r=>r.level===0).length;
  el.innerHTML=`<div class="vtx"><div class="k">Threat preparation${ms.length<6?' · so far':''}</div><div class="v">Ready for ${RD.score}% of the top 30 threats</div>
    <div class="vsub">${un?`${un} unanswered`:'No unanswered threats'} · weighted by how often each makes top cut</div></div>
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
function popularMoves(p){const key=S.format+'|'+ui.metaSrc+'|'+metaVersion+'|'+p.n;if(pmCache.has(key))return pmCache.get(key);const r=popularMoves_(p);pmCache.set(key,r);return r}
const AWKWARD=new Set(['Hyper Beam','Giga Impact','Explosion','Self-Destruct','Focus Punch','Solar Beam','Solar Blade','Sky Attack','Meteor Beam','Dream Eater','Belch','Last Resort','Steel Beam','Mind Blown','Head Smash','Blast Burn','Hydro Cannon','Frenzy Plant','Rock Wrecker','Roar of Time','Prismatic Laser','Eternabeam','Shell Trap','Future Sight','Doom Desire','Synchronoise','Burn Up','Double Shock','Outrage','Thrash','Petal Dance','Raging Fury']);
// Most-used moves for p in doubles (see setFor), else its singles set (live fallback: OTHER() is 'singles'), else its strongest attacks.
function popularMoves_(p){const toMoves=a=>a.map(([n])=>mvByName.get(n)).filter(Boolean).slice(0,6);
  const st=setFor(p);let r=toMoves(st.mv);if(r.length){r.src=st.src.mv;r.pct=new Map(st.mv);return r}
  const o=setFor(p,OTHER());r=toMoves(o.mv);if(r.length){r.src='other';r.pct=new Map();return r}
  const learnIdx=LEARN[p.n]||[];const ng=p.a.includes('No Guard');const atk=learnIdx.map(k=>MV[k]).filter(m=>m&&isCoverage(m)&&m.bp>0&&m.bp<=160&&!AWKWARD.has(m.name)&&(ng||!LOW_ACC.has(m.name)));const pow=m=>m.bp*(p.t.includes(m.type)?1.5:1);
  const out=[];for(const t of p.t){const m=atk.filter(x=>x.type===t).sort((x,y)=>y.bp-x.bp)[0];if(m)out.push(m)}
  for(const m of atk.sort((x,y)=>pow(y)-pow(x))){if(out.length>=4)break;if(!out.some(o=>o.type===m.type))out.push(m)}
  out.src='guess';out.pct=new Map();return out}
// The format whose sets fill in when doubles has none. The page is doubles only, so this is always singles.
const OTHER=()=>'singles';
function abilityPct(p,a){const x=setFor(p).ab.find(([n])=>n===a);return x?x[1]:null}
// Held items players run: a Mega holds its stone; otherwise the top items in doubles.
function topItems(p){const st=setFor(p);return st.it.length?{src:st.src.it,it:st.it.slice(0,2)}:null}
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
function spreadBlock(s,i,m){const cs=m.spread||(typeof commonSpread==='function'?commonSpread(m.p):null);
  const src=m.spread&&m.spread.assumed?'assumed':m.spread?'yours':'common';
  const tag=src==='assumed'?'<span class="asm" title="The team sheet had no stat points: this is the most common spread with your nature">assumed</span>':src==='yours'?'<span class="vsub">yours</span>':'<span class="asm" title="Most common spread on the Showdown ladder (1630+), so its nature can differ from the tournament natures above; set your own if yours differs">ladder usual</span>';
  const v=cs?`${cs.hp}/${cs.atk}/${cs.def}/${cs.spa}/${cs.spd}/${cs.spe}`:'';
  const open=ui.spEdit===i;
  const ed=open?`<div class="spedit"><input class="field" id="spv${i}" value="${esc(v)}" placeholder="HP/Atk/Def/SpA/SpD/Spe" inputmode="numeric" aria-label="Stat points for ${esc(m.p.d)}, HP/Atk/Def/SpA/SpD/Spe (0-32 each, ${SP_TOTAL} total)">
    <select class="field" id="spn${i}" aria-label="Nature">${NATURES.map(n=>`<option${cs&&cs.nat===n?' selected':''}>${n}</option>`).join('')}</select>
    <button class="btn sm primary" type="button" data-spsave="${i}">Save</button>${m.spread?`<button class="linkbtn" type="button" data-spclear="${i}">Use common</button>`:''}<button class="linkbtn" type="button" data-spedit="">Cancel</button><span class="vsub" id="spmsg${i}"></span></div>`:'';
  if(!cs&&!open)return '';
  return `<div class="itemrow"><span class="lbl">Spread</span><div>${cs?`<span class="iname">${v}</span> <span class="vsub">${esc(cs.nat||'')}</span> ${tag}`:'<span class="none">None</span>'} ${open?'':`<button class="linkbtn" type="button" data-spedit="${i}" aria-expanded="false">Set</button>`}</div>${ed}</div>`}
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

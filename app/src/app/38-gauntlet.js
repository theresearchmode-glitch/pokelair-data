// ---------- Gauntlet: your team against real top tournament teams ----------
let gauntCache={key:null,rows:null};
function gauntletTeams(){const d=META.teams;if(d&&d.teams&&d.teams.length)return d.teams.slice(0,20).map(t=>({who:`${t.player} · ${t.record}`,ev:t.event,mons:t.mons}));
  const pv=RES&&Array.isArray(RES.proven)?RES.proven:[];return pv.slice(0,20).map(x=>({who:`Won ${Math.round(x[2]*100)}% across ${x[1]} entr${x[1]===1?"y":"ies"}`,ev:'Proven team list',mons:x[0]}))}
function gauntletScore(mine,theirs,useA){const r=planMatchup(mine,theirs,useA);let s=0,n=0;for(const i of r.chosen)for(let j=0;j<theirs.length;j++){s+=r.h.M[i][j];n++}
  // their side: how many of their six your four can't handle
  const loose=theirs.map((o,j)=>j).filter(j=>!r.chosen.some(i=>r.h.M[i][j]>=.75));return {r,s:n?s/n:0,loose}}
// Matchup prep (Oct 28): no win percentages. Your six against their six with the threat-preparation engine both ways: how
// ready you are for each of their Pokémon, and how ready they are for each of yours. Their six are built exactly the way
// your own would be with default sets (same moves, abilities and team-aware items), so a mirror reads the same both ways.
// The Battle mode planner still suggests the four to bring and the two to lead.
function gauntletPrep(ms,names){const mine=ms.map(THR.fromMember);
  const theirMs=assignItems(names.map(n=>memberOf({n,a:null,lock:false},-1)).filter(Boolean)),theirs=theirMs.map(THR.fromMember);
  const mm=THR.teamModes(mine),tm=THR.teamModes(theirs);
  const you=theirs.map(t=>THR.vsThreat(mine,{...t,w:1},mm)),them=mine.map(t=>THR.vsThreat(theirs,{...t,w:1},tm));
  return {you,them,yN:you.filter(r=>r.level>=2).length,tN:them.filter(r=>r.level>=2).length,n:theirs.length}}
function renderGauntlet(){const el=$('gauntOut');if(!el)return;const ms=members();if(ms.length<4){el.innerHTML=`<div class="empty-note">Add at least 4 Pokémon on My team to run the gauntlet.${ms.length?` You have ${ms.length}.`:''}<div style="margin-top:12px"><button type="button" class="chghost" data-view="build">Go to My team</button></div></div>`;return}
  const useA=$('useAbil')?$('useAbil').checked:true;const T=gauntletTeams();if(!T.length){el.innerHTML='<div class="empty-note">Top tournament teams load with the daily data. Check back after the next refresh.</div>';return}
  const key=metaVersion+'|'+ui.metaSrc+'|'+megaGoal()+'|'+ms.map(m=>m.p.n+'/'+m.ability+'@'+(m.item||'')+':'+m.moves.map(x=>x.name).join(',')).join('|')+'|'+useA;
  if(gauntCache.key!==key){gauntCache={key,rows:T.map((t,ix)=>{const names=t.mons.filter(n=>byName.get(n));const theirs=names.map(n=>byName.get(n)).map(oppMember);if(theirs.length<4)return null;
      const g=gauntletScore(ms,theirs,useA);let pr=null;try{pr=gauntletPrep(ms,names)}catch(e){pr=null}return {ix,t,theirs,pr,...g}}).filter(Boolean)}}
  const rows=gauntCache.rows,edge=x=>x.pr?x.pr.yN-x.pr.tN:0;
  const more=rows.filter(x=>edge(x)>=2).length,less=rows.filter(x=>edge(x)<=-2).length;
  const lv=['l0','l1','l2','l3'],cell=(r,p)=>`<div class="prepcell">${p?sprite(p,'mini'):''}<div><b>${esc(r.t.d)}</b><span class="lv ${lv[r.level]}">${esc(r.label)}</span><div class="t2">${esc(THR.evidence(r))}</div></div></div>`;
  el.innerHTML=`<p class="t2" style="margin:0 0 8px">Your six against real top tournament teams, with the same calcs as your scouting report: how many of their Pokémon you're ready for, and how many of yours they're ready for. A red <b style="color:var(--bad)">!</b> marks one of theirs you have no answer to. Preparation, not a forecast: the player still decides the game.</p>
  <div class="gsum"><div><b>${more}</b><span>you're better prepared</span></div><div><b>${rows.length-more-less}</b><span>about even</span></div><div><b>${less}</b><span>they're better prepared</span></div></div>
  <div class="glist">${rows.slice().sort((a,b)=>edge(a)-edge(b)).map(x=>{const nm=i=>esc(ms[i].d),pr=x.pr,e=edge(x),c=e>=2?'ok':e<=-2?'hi':'mid';
    const un=pr?pr.you.map((r,j)=>r.level===0?j:-1).filter(j=>j>=0):x.loose;
    return `<div class="gitem"><div class="gtop"><span class="sev ${c}">${pr?`You: ready for ${pr.yN} of their ${pr.n}`:'—'}</span><span class="gwho">${esc(x.t.who)}</span>${pr?`<span class="vsub">Them: ready for ${pr.tN} of your ${ms.length}</span>`:''}<span class="vsub">${esc(x.t.ev||'')}</span></div>
      <div class="gmons">${x.theirs.map((o,j)=>`<span class="gm${un.includes(j)?' loose':''}" title="${esc(o.d)}${pr&&pr.you[j]?': '+esc(pr.you[j].label)+' · '+esc(THR.evidence(pr.you[j])):''}">${sprite(o.p,'mini')||esc(o.d)}</span>`).join('')}</div>
      <div class="t2">Bring <b>${x.r.lead.map(nm).join(' + ')}</b> up front, ${x.r.back.map(nm).join(' + ')} in back.${un.length?` Watch ${un.map(j=>esc(x.theirs[j].d)).join(', ')}.`:''}</div>
      ${pr?`<details class="gprep"><summary>Matchup prep</summary><div class="lbl">You against their six</div><div class="prepgrid">${pr.you.map(r=>cell(r,byName.get(r.t.n))).join('')}</div>
        <div class="lbl" style="margin-top:8px">Their six against yours</div><div class="prepgrid">${pr.them.map(r=>cell(r,byName.get(r.t.n))).join('')}</div></details>`:''}
      <button type="button" class="btn gpractice" data-gaunt="${x.ix}">Practice in Battle mode</button></div>`}).join('')}</div>
  <p class="t2" style="margin-top:10px">Each verdict is a real damage calc with your sets against each team's usual sets, the same as the threat preparation in your scouting report. The suggested four come from the Battle mode planner. Least prepared matchups first.</p>`}document.addEventListener('click',e=>{const b=e.target.closest('[data-gaunt],[data-qlog]');if(!b)return;
  if(b.dataset.gaunt!=null){const x=(gauntCache.rows||[]).find(r=>r.ix===+b.dataset.gaunt);if(!x)return;S.opp=x.t.mons.slice(0,6);while(S.opp.length<6)S.opp.push('');persist();setView('matchup');renderMatchup();toast('Loaded as your opponent');return}
  if(b.dataset.qlog){const ms=members(),theirs=S.opp.map(n=>byName.get(n)).filter(Boolean).map(oppMember);if(ms.length<4||!theirs.length)return;
    const useA=$('useAbil')?$('useAbil').checked:true;const r=planMatchup(ms,theirs,useA);const picks=[...r.lead,...r.back].map(i=>ms[i].p.n);
    if(!Array.isArray(S.log))S.log=[];S.log.push({t:Date.now(),r:b.dataset.qlog,b:picks,tm:ms.map(m=>m.p.n),o:S.opp.filter(Boolean)});if(S.log.length>400)S.log=S.log.slice(-400);
    persist();renderLog();safe('verdict',()=>render());toast((b.dataset.qlog==='W'?'Win':'Loss')+' logged with the suggested four')}});


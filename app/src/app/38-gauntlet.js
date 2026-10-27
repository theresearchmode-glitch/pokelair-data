// ---------- Gauntlet: your team against real top tournament teams ----------
let gauntCache={key:null,rows:null};
function gauntletTeams(){const d=META.teams;if(d&&d.teams&&d.teams.length)return d.teams.slice(0,20).map(t=>({who:`${t.player} · ${t.record}`,ev:t.event,mons:t.mons}));
  const pv=RES&&Array.isArray(RES.proven)?RES.proven:[];return pv.slice(0,20).map(x=>({who:`Won ${Math.round(x[2]*100)}% across ${x[1]} entr${x[1]===1?"y":"ies"}`,ev:'Proven team list',mons:x[0]}))}
function gauntletScore(mine,theirs,useA){const r=planMatchup(mine,theirs,useA);let s=0,n=0;for(const i of r.chosen)for(let j=0;j<theirs.length;j++){s+=r.h.M[i][j];n++}
  // their side: how many of their six your four can't handle
  const loose=theirs.map((o,j)=>j).filter(j=>!r.chosen.some(i=>r.h.M[i][j]>=.75));return {r,s:n?s/n:0,loose}}
function renderGauntlet(){const el=$('gauntOut');if(!el)return;const ms=members();if(ms.length<4){el.innerHTML='<div class="empty-note">Add at least 4 Pokémon on the Team page to run the gauntlet.</div>';return}
  const useA=$('useAbil')?$('useAbil').checked:true;const T=gauntletTeams();if(!T.length){el.innerHTML='<div class="empty-note">Top tournament teams load with the daily data. Check back after the next refresh.</div>';return}
  const key=metaVersion+'|'+ui.metaSrc+'|'+megaGoal()+'|'+ms.map(m=>m.p.n+'/'+m.ability+'@'+(m.item||'')+':'+m.moves.map(x=>x.name).join(',')).join('|')+'|'+useA;
  // Win odds use the same team strength as the Team Score (strengthX), for your six and for theirs, so a higher Team Score
  // always means better odds here. The Battle mode planner still picks the four to bring and flags what nothing handles.
  if(gauntCache.key!==key){let myX=null;try{if(ms.length===6&&S.format==='doubles'&&modelOK()){const nm=ms.map(m=>m.p.n);if(new Set(ms.map(m=>m.p.b)).size===6)myX=strengthX(nm,ms).xRaw}}catch(e){myX=null}
    gauntCache={key,rows:T.map((t,ix)=>{const theirs=t.mons.map(n=>byName.get(n)).filter(Boolean).map(oppMember);if(theirs.length<4)return null;const g=gauntletScore(ms,theirs,useA);
      // their six are built exactly the way your own six would be with default sets (same moves, abilities and
      // team-aware items), so the two sides are measured alike: an identical six is a 50% coin flip
      let pm=null;if(myX!=null&&theirs.length===6){try{const tn=theirs.map(o=>o.p.n);const tm=assignItems(tn.map(n=>memberOf({n,a:null,lock:false},-1)).filter(Boolean));pm=sig(calibK()*(myX-strengthX(tn,tm).xRaw))}catch(e){pm=null}}
      if(pm!=null)g.s=(g.s+(pm-.5)*4)/2;return {ix,t,theirs,pm,...g}}).filter(Boolean)}}
  const rows=gauntCache.rows;const side=x=>x.pm!=null?(x.pm>=.55?1:x.pm<=.45?-1:0):(x.s>=.25?1:x.s<=-.25?-1:0);const fav=rows.filter(x=>side(x)>0).length,bad=rows.filter(x=>side(x)<0).length;
  const v=x=>side(x)>0?['ok','Favored']:side(x)<0?['hi','Unfavored']:['mid','Even'];
  const TSg=ui.vsum&&ui.vsum.TS;
  el.innerHTML=`<p class="t2" style="margin:0 0 8px">A red <b style="color:var(--bad)">!</b> marks a Pokémon nothing in your four handles well. Win chances come from our model${typeof tip==='function'?tip('winmodel'):''}, using the same team strength as your Team Score${TSg?` (<b>${TSg.score}</b>)`:''}: raise the Team Score and these odds rise with it.</p><div class="gsum"><div><b>${fav}</b><span>favored</span></div><div><b>${rows.length-fav-bad}</b><span>even</span></div><div><b>${bad}</b><span>unfavored</span></div></div>
  <div class="glist">${rows.slice().sort((a,b)=>(a.pm!=null&&b.pm!=null?a.pm-b.pm:a.s-b.s)).map(x=>{const [c,t]=v(x);const nm=i=>esc(ms[i].d);
    return `<div class="gitem"><div class="gtop"><span class="sev ${c}">${t}</span><span class="gwho">${esc(x.t.who)}</span>${x.pm!=null?`<span class="tag gpm" title="Win chance from the same model as your Team Score">${Math.round(x.pm*100)}% win chance</span>`:''}<span class="vsub">${esc(x.t.ev||'')}</span></div>
      <div class="gmons">${x.theirs.map((o,j)=>`<span class="gm${x.loose.includes(j)?' loose':''}" title="${esc(o.d)}${x.loose.includes(j)?': nothing in your four handles it well':''}">${sprite(o.p,'mini')||esc(o.d)}</span>`).join('')}</div>
      <div class="t2">Bring <b>${x.r.lead.map(nm).join(' + ')}</b> up front, ${x.r.back.map(nm).join(' + ')} in back.${x.loose.length?` Watch ${x.loose.map(j=>esc(x.theirs[j].d)).join(', ')}.`:''}</div>
      <button type="button" class="btn gpractice" data-gaunt="${x.ix}">Practice in Battle mode</button></div>`}).join('')}</div>
  <p class="t2" style="margin-top:10px">Each row runs the Battle mode planner against that team (type matchups, real damage from each side's usual set, and speed)${modelOK()?', blended with the win model trained on real games':''}. Hardest matchups first.${modelOK()?' '+esc(modelLine()):''}</p>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-gaunt],[data-qlog]');if(!b)return;
  if(b.dataset.gaunt!=null){const x=(gauntCache.rows||[]).find(r=>r.ix===+b.dataset.gaunt);if(!x)return;S.opp=x.t.mons.slice(0,6);while(S.opp.length<6)S.opp.push('');persist();setView('matchup');renderMatchup();toast('Loaded as your opponent');return}
  if(b.dataset.qlog){const ms=members(),theirs=S.opp.map(n=>byName.get(n)).filter(Boolean).map(oppMember);if(ms.length<4||!theirs.length)return;
    const useA=$('useAbil')?$('useAbil').checked:true;const r=planMatchup(ms,theirs,useA);const picks=[...r.lead,...r.back].map(i=>ms[i].p.n);
    if(!Array.isArray(S.log))S.log=[];S.log.push({t:Date.now(),r:b.dataset.qlog,b:picks,tm:ms.map(m=>m.p.n),o:S.opp.filter(Boolean)});if(S.log.length>400)S.log=S.log.slice(-400);
    persist();renderLog();safe('verdict',()=>render());toast((b.dataset.qlog==='W'?'Win':'Loss')+' logged with the suggested four')}});


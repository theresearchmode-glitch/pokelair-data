// ---------- Gauntlet: your team against real top tournament teams ----------
let gauntCache={key:null,rows:null};
function gauntletTeams(){const d=META.teams;if(d&&d.teams&&d.teams.length)return d.teams.slice(0,20).map(t=>({who:`${t.player} · ${t.record}`,ev:t.event,mons:t.mons}));
  const pv=RES&&Array.isArray(RES.proven)?RES.proven:[];return pv.slice(0,20).map(x=>({who:`Won ${Math.round(x[2]*100)}% across ${x[1]} entr${x[1]===1?"y":"ies"}`,ev:'Proven team list',mons:x[0]}))}
function gauntletScore(mine,theirs,useA){const r=planMatchup(mine,theirs,useA);let s=0,n=0;for(const i of r.chosen)for(let j=0;j<theirs.length;j++){s+=r.h.M[i][j];n++}
  // their side: how many of their six your four can't handle
  const loose=theirs.map((o,j)=>j).filter(j=>!r.chosen.some(i=>r.h.M[i][j]>=.75));return {r,s:n?s/n:0,loose}}
function renderGauntlet(){const el=$('gauntOut');if(!el)return;const ms=members();if(ms.length<4){el.innerHTML='<div class="empty-note">Add at least 4 Pokémon on the Team page to run the gauntlet.</div>';return}
  const useA=$('useAbil')?$('useAbil').checked:true;const T=gauntletTeams();if(!T.length){el.innerHTML='<div class="empty-note">Top tournament teams load with the daily data. Check back after the next refresh.</div>';return}
  const key=metaVersion+'|'+ms.map(m=>m.p.n+':'+m.moves.map(x=>x.name).join(',')).join('|')+'|'+useA;
  if(gauntCache.key!==key){gauntCache={key,rows:T.map((t,ix)=>{const theirs=t.mons.map(n=>byName.get(n)).filter(Boolean).map(oppMember);if(theirs.length<4)return null;const g=gauntletScore(ms,theirs,useA);const pm=ms.length===6&&theirs.length===6?winVs(ms.map(m=>m.p.n),theirs.map(o=>o.p.n),ms,theirs):null;if(pm!=null)g.s=(g.s+(pm-.5)*4)/2;return {ix,t,theirs,pm,...g}}).filter(Boolean)}}
  const rows=gauntCache.rows;const fav=rows.filter(x=>x.s>=.25).length,bad=rows.filter(x=>x.s<=-.25).length;
  const v=x=>x.s>=.25?['ok','Favoured']:x.s<=-.25?['hi','Unfavoured']:['mid','Even'];
  el.innerHTML=`<p class="t2" style="margin:0 0 8px">A red <b style="color:var(--bad)">!</b> marks a Pokémon nothing in your four handles well.</p><div class="gsum"><div><b>${fav}</b><span>favoured</span></div><div><b>${rows.length-fav-bad}</b><span>even</span></div><div><b>${bad}</b><span>unfavoured</span></div></div>
  <div class="glist">${rows.slice().sort((a,b)=>a.s-b.s).map(x=>{const [c,t]=v(x);const nm=i=>esc(ms[i].d);
    return `<div class="gitem"><div class="gtop"><span class="sev ${c}">${t}</span><span class="gwho">${esc(x.t.who)}</span>${x.pm!=null?`<span class="tag gpm">Model ${Math.round(x.pm*100)}% to win</span>`:''}<span class="vsub">${esc(x.t.ev||'')}</span></div>
      <div class="gmons">${x.theirs.map((o,j)=>`<span class="gm${x.loose.includes(j)?' loose':''}" title="${esc(o.d)}${x.loose.includes(j)?': nothing in your four handles it well':''}">${sprite(o.p,'mini')||esc(o.d)}</span>`).join('')}</div>
      <div class="t2">Bring <b>${x.r.lead.map(nm).join(' + ')}</b> up front, ${x.r.back.map(nm).join(' + ')} in back.${x.loose.length?` Watch ${x.loose.map(j=>esc(x.theirs[j].d)).join(', ')}.`:''}</div>
      <button type="button" class="btn gpractice" data-gaunt="${x.ix}">Open in Matchup</button></div>`}).join('')}</div>
  <p class="t2" style="margin-top:10px">Each row runs the Matchup planner against that team (type matchups, real damage from each side's usual set, and speed)${modelOK()?', blended with the win model trained on real games':''}. Hardest matchups first.${modelOK()?' '+esc(modelLine()):''}</p>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-gaunt],[data-qlog]');if(!b)return;
  if(b.dataset.gaunt!=null){const x=(gauntCache.rows||[]).find(r=>r.ix===+b.dataset.gaunt);if(!x)return;S.opp=x.t.mons.slice(0,6);while(S.opp.length<6)S.opp.push('');persist();setView('matchup');renderMatchup();toast('Loaded as your opponent');return}
  if(b.dataset.qlog){const ms=members(),theirs=S.opp.map(n=>byName.get(n)).filter(Boolean).map(oppMember);if(ms.length<4||!theirs.length)return;
    const useA=$('useAbil')?$('useAbil').checked:true;const r=planMatchup(ms,theirs,useA);const picks=[...r.lead,...r.back].map(i=>ms[i].p.n);
    if(!Array.isArray(S.log))S.log=[];S.log.push({t:Date.now(),r:b.dataset.qlog,b:picks,tm:ms.map(m=>m.p.n),o:S.opp.filter(Boolean)});if(S.log.length>400)S.log=S.log.slice(-400);
    persist();renderLog();safe('verdict',()=>render());toast((b.dataset.qlog==='W'?'Win':'Loss')+' logged with the suggested four')}});


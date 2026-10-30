// ---------- quick add: up to 3 Pokémon that clearly fix one problem ----------
// Only one-change plans that fix this exact problem, improve the team's model score, and don't hurt the type rating.
function qaFixes(key,pl,ms){const k=key.split(':');
  if(k[0]==='weak'){const r=pl.st.a.rows.find(t=>t.atk===k[1]);return r&&r.w<=r.r}
  if(k[0]==='unres'){const r=pl.st.a.rows.find(t=>t.atk===k[1]);return r&&r.r>0}
  if(k[0]==='mega')return pl.megaShort<megaShort(ms)&&pl.st.a.excess<=((ui.plans.baseA||{}).excess??99)+1;
  if(k[0]==='gp'){const o=(pl.base_gp||ui.plans.gp).rows.find(x=>x.k===k[1]),n=pl.gp.rows.find(x=>x.k===k[1]);if(!(o&&n&&GP_RANK[n.st]>GP_RANK[o.st]))return false;
    const b=ui.plans.baseA;if(!b)return true;const nb=typeShape(pl.st.a),ob=typeShape(b);return pl.st.a.excess<=b.excess+1&&nb.maxStack<=Math.max(2,ob.maxStack)&&nb.w3<=Math.max(1,ob.w3)}
  return false}
function qaReason(key,pl){const x=pl.ch[0],m=pl.team.find(t=>t.p===x.c.p)||x.c.mem,p=x.c.p,k=key.split(':'),bits=[];
  if(k[0]==='weak'||k[0]==='unres'){const v=mult(k[1],p.t,x.c.mem.ability,true);
    if(v<=.5)bits.push(v===0?`Immune to ${k[1]}`:v<=.25?`Takes ¼ from ${k[1]}`:`Resists ${k[1]}`);
    else if(x.out&&mult(k[1],x.out.types,x.out.ability,true)>=2)bits.push(`Replaces ${x.out.d}, who is weak to ${k[1]}`);
    else bits.push(`Takes neutral damage from ${k[1]}`)}
  else if(k[1]==='speed'||k[1]==='backup'){const tw=relMove(m,['Tailwind']),tr=relMove(m,['Trick Room']);const b=tw[0]>=tr[0]?['Tailwind',tw[0]]:['Trick Room',tr[0]];
    if(b[1]>=.3)bits.push(`${b[0]}${b[1]<.995?' '+Math.round(b[1]*100)+'%':''}`);else{const d=relMove(m,ROLE.drop),pr=relMove(m,ROLE.prio);if(d[0]>=.3)bits.push(`${d[1]} ${Math.round(d[0]*100)}%`);else if(pr[0]>=.3)bits.push(`${pr[1]} ${Math.round(pr[0]*100)}%`);else if(WEATHER_SPEED[x.c.mem.ability])bits.push(`${x.c.mem.ability} in weather`)}}
  else if(k[1]==='support'){const f=relMove(m,ROLE.fake),r=relMove(m,ROLE.redir);const b=f[0]>=r[0]?f:r;if(b[1])bits.push(`${b[1]} ${Math.round(b[0]*100)}%`)}
  else if(k[1]==='weather'){const w=WEATHER_OF[x.c.mem.ability];if(w)bits.push(`Sets ${ARCH[w].name.toLowerCase()}`)}
  else if(k[1]==='trfit')bits.push('Slow, hard-hitting Trick Room attacker');
  else if(k[0]==='mega')bits.push(`Brings a Mega (${megaCount(pl.team)} of ${megaGoal()})`);
  // the teammate it's most often paired with
  const rest=pl.team.filter(t=>t.p!==p);let best=null;for(const t of rest){const v=pairSyn({p},t)+tourSyn({p},t);if(v>=8&&(!best||v>best.v))best={t,v}}
  if(best)bits.push(`often paired with ${best.t.d}`);
  return bits.join(' · ')}
function quickPicks(key,plans,ms,used){if(!plans||!plans.singles||!plans.basePl)return [];const base=plans.basePl.score;
  let c=plans.singles.filter(pl=>pl.ch.length===1&&pl.score<base-3&&qaFixes(key,pl,ms)).sort((a,b)=>a.score-b.score);
  // a quick add must ready the team for more of the top threats, and the most prepared result comes first
  // hidden-gem plans (plans.gems) carry no readiness base of their own, so they're judged against the team's
  const tb=plans.tsBase!=null?plans.tsBase:(useTSPick()&&ui.plans&&ui.plans.tsBase!=null?ui.plans.tsBase:null);
  if(tb!=null){c=tsShortlist(c,20);for(const pl of c)if(pl._ts===undefined)pl._ts=tsOf(pl.team);
    c=c.filter(pl=>pl._ts!=null&&pl._ts>=tb+TS_GAIN).sort((a,b)=>(b._ts??-1)-(a._ts??-1)||a.score-b.score);
    const out=[],seen=new Set();for(const pl of c){const b=pl.ch[0].c.p.b;if(seen.has(b)||(used&&used.has(b)))continue;seen.add(b);out.push(pl);if(out.length>=3)break}return out}
  const out=[],seen=new Set();for(const pl of c){const b=pl.ch[0].c.p.b;if(seen.has(b)||(used&&used.has(b)))continue;seen.add(b);out.push(pl);if(out.length>=3)break}
  if(!out.length)return out;const top=base-out[0].score;return out.filter(pl=>base-pl.score>=top*.4)}
// Each Pokémon is shown once across problems (under the first problem it fixes), so the list never repeats itself.
function renderQuick(key,plans,ms,used){const picks=quickPicks(key,plans,ms,used);picks.forEach(pl=>used.add(pl.ch[0].c.p.b));
  // one hidden gem per problem, when a strong off-meta Pokémon fixes it as well
  if(plans&&plans.gems&&picks.length<4){const g=quickPicks(key,plans.gems,ms,used)[0];if(g){g.gem=true;g.gemBase=plans.gems.basePl.score;used.add(g.ch[0].c.p.b);picks.push(g)}}
  if(!picks.length&&quickPicks(key,plans,ms).length)return `<div class="qnone">Fixed by a pick above.</div>`;
  if(!picks.length)return `<div class="qnone">${ui.pool==='box'?'Nothing in your box fixes this cleanly. In Plan settings, set "Pick from" to "box, then fill gaps" to see what to catch.':'No single change fixes this without hurting the team. Check the fix plans for two-change options.'}</div>`;
  return `<div class="qa"><div class="qlbl">Quick add</div><div class="qpicks">${picks.map(pl=>{const x=pl.ch[0],p=x.c.p,i=ui.quick.push(pl)-1,fit=Math.round(plans.basePl.score-pl.score),why=qaReason(key,pl);
    return `<div class="qpick${pl.gem?' gem':''}"><div class="qtop">${sprite(p,'mini')}<span class="qname">${esc(p.d)}</span><span class="chips">${p.t.map(t=>chip(t)).join('')}</span>${p.m?'<span class="tag mega ico" title="Mega Evolution">MEGA</span>':''}${inBox(p)?'<span class="tag box ico" title="In your box">BOX</span>':ui.pool!=='all'?'<span class="tag catch ico" title="Not in your box yet">TO CATCH</span>':''}${pl.gem?'<span class="tag offmeta">HIDDEN GEM</span>':ideaTag(p)}</div>
      ${why?`<div class="qwhy">${esc(why)}</div>`:''}${(()=>{if(ms.length!==6||pl.team.length!==6)return '';const d=threatDiff(ms,pl.team,1).find(x=>x.up);return d?`<div class="qwhy">${d.html}</div>`:''})()}<div class="qact"><button class="btn sm primary" type="button" data-qa="${i}">${x.out?'Swap for '+esc(x.out.d):'Add'}</button>${pl._ts!=null&&(ui.plans&&ui.plans.tsBase!=null)?`<span class="qfit" title="${esc(tsTitle({score:ui.plans.tsBase},{score:pl._ts}))}">Ready ${pl._ts>ui.plans.tsBase?'+':'±'}${pl._ts-ui.plans.tsBase||0}%</span>`:`<span class="qfit" title="Fits what the team is missing. Readiness for the top threats shows once the team has 6">Good fit</span>`}</div></div>`}).join('')}</div></div>`}
function renderProblems(ms,a,tRows,useA,plans){const el=$('needs');ui.quick=[];
  if(!ms.length){el.innerHTML='<div class="empty-note">Add Pokémon to see what the team needs.</div>';const sub=$('needsSub');if(sub)sub.textContent='';return}
  const name=i=>esc(ms[i].d);const out=[];
  // game-plan gaps first: these are the ones beginners miss most
  const gp=plans&&plans.gp?plans.gp:gamePlan(ms);
  if(ms.length>=3)for(const r of gp.rows){const big=r.k==='speed'||r.k==='support'||((r.k==='weather'||r.k==='terrain')&&r.st==='miss')||r.k==='trfit';
    if(big&&(r.st==='miss'||r.st==='part'))out.push([r.st==='miss'?'hi':'mid',r.label,esc(r.note||''),'gp:'+r.k])}
  {const cl=scarfTrClash(ms);if(cl)out.unshift(['hi','Item clash',clashText(cl)])}
  // one Mega is a complete plan (only one can Mega Evolve per battle): only a team with none gets a note (Oct 30 audit)
  {if(ms.length>=6&&megaCount(ms)===0)out.push(['mid','Megas','No Mega on the team. Most winning teams bring one or two Mega options; only one can Mega Evolve each battle.','mega'])}
  a.rows.filter(t=>t.w>t.r).sort((x,y)=>(y.w-y.r)-(x.w-x.r)).forEach(t=>{const weak=t.who.map(o=>name(o.i)+(o.x>=4?' (4×)':''));
    const res=ms.filter(m=>mult(t.atk,m.types,m.ability,useA)<=.5).map(m=>esc(m.d));
    out.push([t.w-t.r>=2?'hi':'mid','Weakness',`${chip(t.atk)} ${t.w} weak (${weak.join(', ')}), ${res.length?`only ${res.length} resist${res.length===1?'s':''} (${res.join(', ')})`:'nothing resists it'}.`,'weak:'+t.atk])});
  a.rows.filter(t=>t.r===0&&t.w<=t.r).forEach(t=>out.push(['mid','Nobody resists',`${chip(t.atk)} Nothing on your team resists it.`,'unres:'+t.atk]));
  a.rows.forEach(t=>t.who.filter(o=>o.x>=4).forEach(o=>{if(!(t.w>t.r))out.push(['mid','4× weak',`${name(o.i)} takes 4× from <span style="white-space:nowrap">${chip(t.atk)}.</span>`])}));
  const gaps=tRows.filter(r=>!r.hits.length).map(r=>chip(r.t));
  if(gaps.length)out.push([gaps.length>=4?'mid':'lo','Offense',`No super-effective hits on ${gaps.slice(0,-1).join(' ')} <span style="white-space:nowrap">${gaps[gaps.length-1]}.</span>`]);
  const even=a.rows.filter(t=>t.w>0&&t.w===t.r).map(t=>chip(t.atk));
  if(even.length)out.push(['lo','Same weak as resist',`${even.join(' ')} One resist covers one weakness. Fine, but one bad switch away.`]);
  const R=teamRoles(ms);const nm=arr=>arr.map(m=>esc(m.d)).join(', ');
  R.arch.filter(x=>x.key!=='tw'&&x.key!=='tr'&&!ARCH[x.key].setAb.some(a=>WEATHER_OF[a])&&!x.active).forEach(x=>out.push(['lo',x.name,`${nm(x.setters)} sets ${x.name}, but nothing else on the team uses it.`]));
  if(!OFFMETA)ms.filter(m=>viability(m.p)<12).forEach(m=>out.push(['mid','Fringe pick',`${esc(m.d)} sees almost no competitive use in ${S.format} right now.`]));
  const good=R.arch.filter(x=>x.active&&x.key!=='tw').map(x=>`${x.name} (${nm(x.setters)} → ${nm(x.abusers)})`);
  if(good.length)out.push(['ok','Game plan',good.join('; ')]);
  // quick add on the first 4 fixable problems, so the list stays readable
  // Each concern is one tappable row; its suggested fixes drop down underneath, so the list stays short.
  const wasOpen=new Set([...(el.querySelectorAll?el.querySelectorAll('details.prob-row[open]'):[])].map(d=>d.dataset.k));
  let qa=0;const used=new Set();const row=([s,l,tx,key])=>{const q=key&&qa++<8?renderQuick(key,plans,ms,used):'';const minor=!q&&(s==='lo'||s==='ok');
    const n=(q.match(/data-qa=/g)||[]).length;
    if(!q||!n)return `<div class="prob-row${minor?' minor':''}"><span class="sev ${s}">${l}</span><div class="pbody"><div class="pmain">${tx}</div>${q}</div></div>`;
    return `<details class="prob-row fold" data-k="${esc(key)}"${wasOpen.has(key)?' open':''}><summary><span class="sev ${s}">${l}</span><div class="pbody"><div class="pmain">${tx}</div></div><span class="fixn">${n} fix${n>1?'es':''}</span></summary><div class="pfix">${q}</div></details>`};
  const real=out.filter(o=>o[0]!=='ok');
  {const sub=$('needsSub');if(sub)sub.textContent=real.length?real.length+' to look at':''}
  // the 4 that matter most up front; the rest one tap away
  const rows=out.map(row),cap=ui.needsAll?rows.length:4,more=rows.length-cap;
  el.innerHTML=(real.length?'':'<div class="prob-row"><span class="sev ok">All clear</span><div>No type problems, and the team has speed control and support.</div></div>')+rows.slice(0,cap).join('')
    +(more>0?`<button type="button" class="btn sm ghost needsmore" id="needsMore">Show ${more} more</button>`:ui.needsAll&&rows.length>4?'<button type="button" class="btn sm ghost needsmore" id="needsMore">Show less</button>':'');
}
function megaFormFor(p,t){if(p.m||!t||!t.it||!t.it.length)return p;const [item,pct]=t.it[0];if(!(pct>=50)||!/ite( [XYZ])?$|inite/.test(item))return p;
  const suf=(item.match(/ ([XYZ])$/)||[])[1];const want=p.b+'-Mega'+(suf?'-'+suf:'');return byName.get(want)||byName.get(p.b+'-Mega')||byName.get(p.b+'-M-Mega')||p}
function renderOffMeta(entries,useA){const d=metaDoc();const wrap=$('offMetaWrap');
  if(!d||!d.top||!entries.length){$('offMetaTitle').textContent='';wrap.hidden=true;return}
  wrap.hidden=false;const src={ingame:'in-game doubles',tour:'tournament',ladder:'Showdown doubles'}[ui.metaSrc];
  $('offMetaTitle').textContent=`Against the top ${Math.min(20,d.top.length)} ${src} Pokémon`;
  const rows=d.top.slice(0,20).map(t=>{let p=byName.get(t.n);if(!p)return null;p=megaFormFor(p,t);
    const ab=p.m?p.a[0]:(t.ab&&t.ab[0]&&t.ab[0][1]>=50?t.ab[0][0]:null);const b=bestHit(entries,p.t,useA?ab:null);return {t,p,ab,b}}).filter(Boolean);
  $('offMeta').innerHTML=`<tr><th class="t">Threat</th><th>Best</th><th class="t">Your best hit</th></tr>`+rows.map(r=>{const x=r.b?r.b.x:0;
    return `<tr class="${x<2?'prob':''}"><td class="t"><span style="font-weight:700">${esc(r.p.d)}</span> <span class="chips" style="display:inline-flex;vertical-align:middle">${r.p.t.map(t=>chip(t)).join('')}</span>${r.ab&&ABILITY_MODS[r.ab]?` <span class="vsub">${esc(r.ab)}</span>`:''}</td><td>${mcell(x)}</td><td class="who">${r.b?`${esc(disp(r.b.e.from))}: ${esc(r.b.e.move)} (${r.b.e.type})`:'—'}</td></tr>`}).join('');
}

document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#needsMore');if(!b)return;ui.needsAll=!ui.needsAll;keepScroll(()=>render())});

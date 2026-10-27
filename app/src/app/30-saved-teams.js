// ---------- saved teams ----------
function renderSaved(){
  {const hs=S.teams.filter(t=>t.format==='singles').length;$('savedCount').textContent=`${S.teams.length-hs}/10`;$('savedCount').title=hs?`${hs} older team${hs>1?'s':''} from a retired mode ${hs>1?'are':'is'} kept and also use${hs>1?'':'s'} a slot`:''}
  // the same Team Score as the Team page, so saved teams can be compared at a glance (teams from the retired singles mode are kept in storage but hidden)
  const order=S.teams.filter(t=>t.format!=='singles').map(t=>{const r=teamRating(t.slots);let ts=null;try{ts=r.ms.length===6?tsInfo(r.ms):null}catch(e){}return {t,r,ts}});
  if(ui.sort==='name')order.sort((x,y)=>x.t.name.localeCompare(y.t.name));
  else if(ui.sort==='rating')order.sort((x,y)=>((y.ts?y.ts.score:-1)-(x.ts?x.ts.score:-1))||x.r.a.excess-y.r.a.excess);
  else order.sort((x,y)=>y.t.saved-x.t.saved);
  ui.cmp=(ui.cmp||[]).filter(id=>id==='cur'||S.teams.some(t=>t.id===id));
  $('savedList').innerHTML=!order.length?'<div class="empty-note">No saved teams yet. Build a team above and tap Save team.</div>':cmpPanel()+order.map(({t,r,ts})=>{
    const names=r.ms.map(m=>m.d).join(' · ')||'Empty';const isLoaded=t.id===S.loadedId;
    const nameCell=ui.renaming===t.id?`<div class="row"><input class="field" id="rn_${t.id}" value="${esc(t.name)}" maxlength="40" style="flex:1"><button class="btn sm primary" data-rnok="${t.id}" type="button">Save</button><button class="btn sm" data-rnx="1" type="button">Cancel</button></div>`
      :`<div class="t1">${esc(t.name)} ${isLoaded?' <span class="tag box">LOADED</span>':''}</div>`;
    const actions=ui.confirmDel===t.id?`<div class="inline-confirm">Delete?<button class="btn sm danger" data-delok="${t.id}" type="button">Delete</button><button class="btn sm" data-delx="1" type="button">Keep</button></div>`
      :`${ts?`<span class="tsd${ts.score>=50?' up':''}" title="Team Score ${ts.score}; win chance against an average team ${(ts.p*100).toFixed(1)}%">Team Score ${ts.score}</span>`:`<span class="vsub">${r.ms.length<6?r.ms.length+'/6 Pokémon':'—'}</span>`}<span class="pill ${r.ms.length?RC(r.a.excess):'bnone'}">${r.ms.length?wsTxt(r.a):'—'}</span><button class="btn sm primary" data-load="${t.id}" type="button">Open</button><button class="btn sm${ui.cmp.includes(t.id)?' on':''}" data-cmp="${t.id}" type="button" aria-pressed="${ui.cmp.includes(t.id)}">Compare</button><button class="btn sm" data-rn="${t.id}" type="button">Rename</button><button class="btn sm danger" data-del="${t.id}" type="button">Delete</button>`;
    return `<div class="item"><div style="min-width:0">${nameCell}<div class="mon-list">${esc(names)}</div></div><div class="row" style="justify-content:flex-end">${actions}</div></div>`}).join('');
}
// ---------- compare two teams side by side ----------
// Pick two saved teams (or one and the team you have open). Each row marks the better side; the head-to-head line is the
// win model's chance for one six against the other, from the same numbers as the Team Score.
function cmpSide(id){if(id==='cur'){const ms=members();return {name:'Your current team',ms}}const t=S.teams.find(x=>x.id===id);return t?{name:t.name,ms:teamRating(t.slots).ms}:null}
function cmpPanel(){const ids=ui.cmp||[];if(!ids.length)return '';
  if(ids.length===1){const a=cmpSide(ids[0]);return `<div class="cmpbox"><b>Compare</b> <span class="t2">${esc(a?a.name:'')} is picked. Pick one more saved team${members().length===6&&ids[0]!=='cur'?', or':''}</span>${members().length===6&&ids[0]!=='cur'?' <button class="btn sm" type="button" data-cmp="cur">Compare with my current team</button>':''} <button class="linkbtn" type="button" data-cmpx="1">Cancel</button></div>`}
  const [A,B]=ids.map(cmpSide);if(!A||!B)return '';
  const info=s=>{const ms=s.ms;let ts=null,ck=null,pr=null,gp=null;try{ts=ms.length===6?tsInfo(ms):null}catch(e){}try{ck=proChecks(ms,true)}catch(e){}try{pr=teamProfile(ms,true)}catch(e){}try{gp=gamePlan(ms.map(m=>m._mv&&m._mv.length?m:{...m,_mv:memberMoves(m).moves}))}catch(e){}
    // speed control in a few words: the first setter ("Whimsicott · Tailwind"), the rest in the hover text
    const sp=gp&&gp.rows.find(r=>r.k==='speed'),first=sp&&sp.who?String(sp.who).split(';')[0].replace(/\s+\d+%$/,'').trim():'';
    return {ts,ck,pr,speed:sp?(sp.st==='ok'?(first||'Yes'):sp.st==='part'?'Partly'+(first?': '+first:''):'None'):'—',speedAll:sp&&sp.who||'',spOK:sp?GP_RANK[sp.st]||0:0}};
  const a=info(A),b=info(B);
  let h2h=null;try{if(A.ms.length===6&&B.ms.length===6)h2h=winVs(A.ms.map(m=>m.p.n),B.ms.map(m=>m.p.n),A.ms,B.ms)}catch(e){}
  // [label, valueA, valueB, which is better: 1 = A, -1 = B, 0 = even]
  const cmp=(x,y,hi)=>x==null||y==null||x===y?0:(hi?x>y:x<y)?1:-1;
  const rows=[['Team Score',a.ts&&a.ts.score,b.ts&&b.ts.score,cmp(a.ts&&a.ts.score,b.ts&&b.ts.score,true)],
    ['Win chance vs an average team',a.ts?(a.ts.p*100).toFixed(1)+'%':'—',b.ts?(b.ts.p*100).toFixed(1)+'%':'—',cmp(a.ts&&a.ts.p,b.ts&&b.ts.p,true)],
    ['Winning-team checklist',a.ck?a.ck.pass+'/'+a.ck.n:'—',b.ck?b.ck.pass+'/'+b.ck.n:'—',cmp(a.ck&&a.ck.pass,b.ck&&b.ck.pass,true)],
    ['Speed control',a.speed,b.speed,cmp(a.spOK,b.spOK,true)],
    ['More weak than resist',a.pr?a.pr.ex:'—',b.pr?b.pr.ex:'—',cmp(a.pr&&a.pr.ex,b.pr&&b.pr.ex,false)],
    ['Types nobody resists',a.pr?a.pr.un:'—',b.pr?b.pr.un:'—',cmp(a.pr&&a.pr.un,b.pr&&b.pr.un,false)],
    ['Types hit super effectively',a.pr?a.pr.off+'/18':'—',b.pr?b.pr.off+'/18':'—',cmp(a.pr&&a.pr.off,b.pr&&b.pr.off,true)],
    ['Answers to the most-used Pokémon',a.pr?a.pr.ans+'/'+a.pr.nThreat:'—',b.pr?b.pr.ans+'/'+b.pr.nThreat:'—',cmp(a.pr&&a.pr.ans,b.pr&&b.pr.ans,true)]];
  const shared=new Set(A.ms.map(m=>m.p.b).filter(x=>B.ms.some(m=>m.p.b===x)));
  const six=s=>`<div class="cmpsix">${s.ms.map(m=>`<span class="cmpm${shared.has(m.p.b)?' sh':''}" title="${esc(m.p.d)}${shared.has(m.p.b)?' (on both teams)':''}">${sprite(m.p,'mini')||esc(m.p.d)}</span>`).join('')}</div>`;
  return `<div class="cmpbox"><div class="cmphd"><b>Side by side</b><button class="linkbtn" type="button" data-cmpx="1">Close</button></div>
    <table class="cmpt"><thead><tr><th></th><th>${esc(A.name)}${six(A)}</th><th>${esc(B.name)}${six(B)}</th></tr></thead><tbody>
    ${rows.map(([l,x,y,w])=>{const tt=l==='Speed control'?[a.speedAll,b.speedAll]:['',''];return `<tr><th scope="row">${l}</th><td class="${w>0?'win':''}"${tt[0]?` title="${esc(tt[0])}"`:''}>${esc(x??'—')}</td><td class="${w<0?'win':''}"${tt[1]?` title="${esc(tt[1])}"`:''}>${esc(y??'—')}</td></tr>`}).join('')}</tbody></table>
    ${h2h!=null?`<p class="t2 cmph2h">Head to head, the win model gives <b>${esc(A.name)}</b> a <b>${Math.round(h2h*100)}%</b> chance against <b>${esc(B.name)}</b> in a single game. It knows the Pokémon, not the matchup play, so treat it as a lean, not a verdict.</p>`:''}
    ${shared.size?`<p class="t2">On both teams (shaded): ${esc(A.ms.filter(m=>shared.has(m.p.b)).map(m=>m.p.d).join(', '))}.</p>`:''}</div>`}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-cmp],[data-cmpx]');if(!b)return;
  if(b.dataset.cmpx){ui.cmp=[];renderSaved();return}const id=b.dataset.cmp;ui.cmp=ui.cmp||[];
  ui.cmp=ui.cmp.includes(id)?ui.cmp.filter(x=>x!==id):[...ui.cmp,id].slice(-2);renderSaved();const l=$('savedList');if(l&&ui.cmp.length===2&&l.scrollIntoView)l.scrollIntoView({block:'start',behavior:'smooth'})});
function renderSavePanel(){
  const p=$('savePanel');if(!ui.saving){p.hidden=true;p.innerHTML='';return}
  const loaded=S.teams.find(t=>t.id===S.loadedId);const full=S.teams.length>=10;
  p.hidden=false;
  p.innerHTML=`<div class="item" style="grid-template-columns:1fr"><div class="lbl">Save this doubles team</div>
    <div class="row"><input class="field" id="saveName" maxlength="40" placeholder="Team name, e.g. Rain Archaludon" value="${esc(loaded?loaded.name:'')}" style="flex:1;min-width:180px">
    ${loaded?`<button class="btn primary" id="saveOver" type="button">Update "${esc(loaded.name)}"</button>`:''}
    <button class="btn ${loaded?'':'primary'}" id="saveNew" type="button" ${full?'disabled':''}>Save as new</button>
    <button class="btn" id="saveCancel" type="button">Cancel</button></div>
    ${full?'<div class="t2" style="color:var(--bad)">You have 10 saved teams. Update an open team or delete one in Saved teams to save a new one.</div>':''}</div>`;
  setTimeout(()=>{const n=$('saveName');if(n){n.focus();n.select()}},30);
}

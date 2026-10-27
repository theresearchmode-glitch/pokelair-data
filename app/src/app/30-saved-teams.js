// ---------- saved teams ----------
function renderSaved(){
  {const hs=S.teams.filter(t=>t.format==='singles').length;$('savedCount').textContent=`${S.teams.length-hs}/10`;$('savedCount').title=hs?`${hs} older team${hs>1?'s':''} from a retired mode ${hs>1?'are':'is'} kept and also use${hs>1?'':'s'} a slot`:''}
  // the same Team Score as the Team page, so saved teams can be compared at a glance (singles teams are stored but hidden)
  const order=S.teams.filter(t=>t.format!=='singles').map(t=>{const r=teamRating(t.slots);let ts=null;try{ts=r.ms.length===6?tsInfo(r.ms):null}catch(e){}return {t,r,ts}});
  if(ui.sort==='name')order.sort((x,y)=>x.t.name.localeCompare(y.t.name));
  else if(ui.sort==='rating')order.sort((x,y)=>((y.ts?y.ts.score:-1)-(x.ts?x.ts.score:-1))||x.r.a.excess-y.r.a.excess);
  else order.sort((x,y)=>y.t.saved-x.t.saved);
  $('savedList').innerHTML=!order.length?'<div class="empty-note">No saved teams yet. Build a team above and tap Save team.</div>':order.map(({t,r,ts})=>{
    const names=r.ms.map(m=>m.d).join(' · ')||'Empty';const isLoaded=t.id===S.loadedId;
    const nameCell=ui.renaming===t.id?`<div class="row"><input class="field" id="rn_${t.id}" value="${esc(t.name)}" maxlength="40" style="flex:1"><button class="btn sm primary" data-rnok="${t.id}" type="button">Save</button><button class="btn sm" data-rnx="1" type="button">Cancel</button></div>`
      :`<div class="t1">${esc(t.name)} ${isLoaded?' <span class="tag box">LOADED</span>':''}</div>`;
    const actions=ui.confirmDel===t.id?`<div class="inline-confirm">Delete?<button class="btn sm danger" data-delok="${t.id}" type="button">Delete</button><button class="btn sm" data-delx="1" type="button">Keep</button></div>`
      :`${ts?`<span class="tsd${ts.score>=50?' up':''}" title="Team Score ${ts.score}; win chance against an average team ${(ts.p*100).toFixed(1)}%">Team Score ${ts.score}</span>`:`<span class="vsub">${r.ms.length<6?r.ms.length+'/6 Pokémon':'—'}</span>`}<span class="pill ${r.ms.length?RC(r.a.excess):'bnone'}">${r.ms.length?wsTxt(r.a):'—'}</span><button class="btn sm primary" data-load="${t.id}" type="button">Open</button><button class="btn sm" data-rn="${t.id}" type="button">Rename</button><button class="btn sm danger" data-del="${t.id}" type="button">Delete</button>`;
    return `<div class="item"><div style="min-width:0">${nameCell}<div class="mon-list">${esc(names)}</div></div><div class="row" style="justify-content:flex-end">${actions}</div></div>`}).join('');
}
function renderSavePanel(){
  const p=$('savePanel');if(!ui.saving){p.hidden=true;p.innerHTML='';return}
  const loaded=S.teams.find(t=>t.id===S.loadedId);const full=S.teams.length>=10;
  p.hidden=false;
  p.innerHTML=`<div class="item" style="grid-template-columns:1fr"><div class="lbl">Save this ${S.format} team</div>
    <div class="row"><input class="field" id="saveName" maxlength="40" placeholder="Team name, e.g. Rain Archaludon" value="${esc(loaded?loaded.name:'')}" style="flex:1;min-width:180px">
    ${loaded?`<button class="btn primary" id="saveOver" type="button">Update "${esc(loaded.name)}"</button>`:''}
    <button class="btn ${loaded?'':'primary'}" id="saveNew" type="button" ${full?'disabled':''}>Save as new</button>
    <button class="btn" id="saveCancel" type="button">Cancel</button></div>
    ${full?'<div class="t2" style="color:var(--bad)">You have 10 saved teams. Update an open team or delete one in Saved teams to save a new one.</div>':''}</div>`;
  setTimeout(()=>{const n=$('saveName');if(n){n.focus();n.select()}},30);
}

// ---------- saved teams ----------
function renderSaved(){
  {const hs=S.teams.filter(t=>t.format==='singles').length;$('savedCount').textContent=`${S.teams.length-hs}/10`;$('savedCount').title=hs?`${hs} older team${hs>1?'s':''} from a retired mode ${hs>1?'are':'is'} kept and also use${hs>1?'':'s'} a slot`:''}
  // the same readiness for the top threats as the Team page, so saved teams can be compared at a glance (teams from the retired singles mode are kept in storage but hidden)
  /* Nov 2: each full six shows the same grade as My team (letter in its band colour, the grade, and the sum underneath) */
  const order=savedRows(ui.sort);
  ui.cmp=(ui.cmp||[]).filter(id=>id==='cur'||S.teams.some(t=>t.id===id));
  $('savedList').innerHTML=!order.length?'<div class="empty-note">No saved teams yet. Build a team above and tap Save team.</div>':cmpPanel()+order.map(({t,r,ts,ck,G,RD})=>{
    const names=r.ms.map(m=>m.d).join(' · ')||'Empty';const isLoaded=t.id===S.loadedId;
    // Concept H card (Oct 29): the six as sprites, the name big, readiness as a badge; Open is the one button, the rest sit in ⋯
    const nameCell=ui.renaming===t.id?`<div class="row svrn"><input class="field" id="rn_${t.id}" value="${esc(t.name)}" maxlength="40" aria-label="Team name"><button class="btn sm primary" data-rnok="${t.id}" type="button">Save</button><button class="btn sm" data-rnx="1" type="button">Cancel</button></div>`
      :`<div class="svhd"><div class="svname">${esc(t.name)}</div>${isLoaded?'<span class="tag box">Open now</span>':''}</div>`;
    const six=`<div class="svsix" aria-label="${esc(names)}">${r.ms.map(m=>`<div class="svm tyacc" style="${tyv(m.p)}" title="${esc(m.d)}">${sprite(m.p)||''}<span>${esc(m.d)}</span></div>`).join('')}${Array.from({length:Math.max(0,6-r.ms.length)},()=>'<div class="svm empty"><i></i><span>Empty</span></div>').join('')}</div>`;
    const stats=`<div class="svstats">${G?CH.gradeBadge(G,RD):ts?`<span class="tsd${ts.score>=75?' up':''}" title="Ready for ${ts.score}% of the top 30 threats (weighted by how often each makes top cut)">${ts.score}% ready</span>`:`<span class="vsub">${r.ms.length<6?r.ms.length+'/6 Pokémon':'—'}</span>`}${ck?`<span class="vsub" title="Winning-team checklist">${ck.pass}/${ck.n} checks</span>`:''}</div>${(g=>g?`<div class="svrec"><span class="chk">Your games</span> <b>${g.w}–${g.l}</b> <span class="t2">with this six</span></div>`:'')(typeof myGames==='function'?myGames(r.ms):null)}`;
    const actions=ui.confirmDel===t.id?`<div class="inline-confirm">Delete ${esc(t.name)}?<button class="btn sm danger" data-delok="${t.id}" type="button">Delete</button><button class="btn sm" data-delx="1" type="button">Keep</button></div>`
      :`<button class="btn sm${ui.cmp.includes(t.id)?' on':''}" data-cmp="${t.id}" type="button" aria-pressed="${ui.cmp.includes(t.id)}" aria-label="Compare ${esc(t.name)}">${ui.cmp.includes(t.id)?'Picked ✓':'Compare'}</button><button class="btn sm primary" data-load="${t.id}" type="button">Open</button>${sdBtn('saved:'+t.id)}<details class="moremenu svmore"><summary class="btn sm" aria-label="More for ${esc(t.name)}">⋯</summary><div class="mmpop">
        <button class="btn ghost" data-rn="${t.id}" type="button">Rename</button><button class="btn ghost danger" data-del="${t.id}" type="button">Delete</button></div></details>`;
    return `<div class="item svt${isLoaded?' on':''}${ui.cmp.includes(t.id)?' cmpon':''}">${nameCell}${six}${goneNote(t.slots)?`<p class="t2 svgone">${goneNote(t.slots)}</p>`:''}<div class="svfoot">${stats}<div class="svacts">${actions}</div></div></div>`}).join('');
}
// ---------- compare two teams side by side ----------
// Pick two saved teams (or one and the team you have open) and the Compare page opens with both (63-compare.js: grade,
// threats, the 7 checks, speed, weather, types and archetype, differences first). Facts only: no head-to-head win chance.
function cmpSide(id){if(id==='cur'){const ms=members();return {name:'Your current team',ms}}const t=S.teams.find(x=>x.id===id);return t?{name:t.name,ms:teamRating(t.slots).ms}:null}
function cmpPanel(){const ids=ui.cmp||[];
  if(!ids.length)return S.teams.filter(t=>t.format!=='singles').length>=2||members().length?'<p class="t2 cmphint">Tap <b>Compare</b> on two teams to see them side by side.</p>':'';
  const a=cmpSide(ids[0]);return `<div class="cmpbox"><b>Compare</b> <span class="t2">${esc(a?a.name:'')} is picked. Pick one more saved team${members().length&&ids[0]!=='cur'?', or':''}</span>${members().length&&ids[0]!=='cur'?' <button class="btn sm" type="button" data-cmp="cur">Compare with my current team</button>':''} <button class="linkbtn" type="button" data-cmpx="1">Cancel</button></div>`}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-cmp],[data-cmpx]');if(!b)return;
  if(b.dataset.cmpx){ui.cmp=[];renderSaved();return}const id=b.dataset.cmp;ui.cmp=ui.cmp||[];
  ui.cmp=ui.cmp.includes(id)?ui.cmp.filter(x=>x!==id):[...ui.cmp,id].slice(-2);
  if(ui.cmp.length===2&&typeof cxGo==='function'){const [x,y]=ui.cmp.map(i=>i==='cur'?'cur':'s:'+i);ui.cmp=[];renderSaved();cxGo(x,y);return}
  renderSaved();const l=$('savedList');if(l&&ui.cmp.length&&l.scrollIntoView)l.scrollIntoView({block:'start',behavior:'smooth'})});
function renderSavePanel(){
  const p=$('savePanel');if(!ui.saving){p.hidden=true;p.innerHTML='';return}
  const loaded=S.teams.find(t=>t.id===S.loadedId);const full=S.teams.length>=10;
  p.hidden=false;
  p.innerHTML=`<div class="item" style="grid-template-columns:1fr"><div class="lbl">Save this doubles team</div>
    <div class="row"><input class="field" id="saveName" maxlength="40" placeholder="Team name, e.g. Rain Archaludon" value="${esc(loaded?loaded.name:'')}" style="flex:1;min-width:180px">
    ${loaded?`<button class="btn primary" id="saveOver" type="button">Update "${esc(loaded.name)}"</button>`:''}
    <button class="btn ${loaded?'':'primary'}" id="saveNew" type="button" ${full?'disabled':''}>Save as new</button>
    <button class="btn" id="saveCancel" type="button">Cancel</button></div>
    ${full?'<div class="t2" style="color:var(--warn)">You have 10 saved teams. Update an open team or delete one in Saved teams to save a new one.</div>':''}</div>`;
  setTimeout(()=>{const n=$('saveName');if(n){n.focus();n.select()}},30);
}

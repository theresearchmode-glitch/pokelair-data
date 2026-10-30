// ---------- box ----------
function renderBox(){
  $('boxCount').textContent=`(${S.box.length})`;
  // sort (Oct 30, Sim): A–Z, by type, newest or oldest added (S.box keeps the order they were added), or by rating
  const so=ui.boxSort||(ui.boxSort=LS.get('cc2.boxSort','az')),TO=Object.keys(TC);{const sc=$('boxSort');if(sc)sc.querySelectorAll('[data-boxsort]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.boxsort===so))}
  const rt=b=>{try{const p=byName.get(b);return p?rating(p).total:0}catch(e){return 0}},ty=b=>{const p=byName.get(b);return p?TO.indexOf(p.t[0])*20+(p.t[1]?TO.indexOf(p.t[1])+1:0):999};
  const cmp={az:(x,y)=>x[1].localeCompare(y[1]),za:(x,y)=>y[1].localeCompare(x[1]),type:(x,y)=>ty(x[0])-ty(y[0])||x[1].localeCompare(y[1]),new:(x,y)=>y[2]-x[2],old:(x,y)=>x[2]-y[2],rating:(x,y)=>rt(y[0])-rt(x[0])||x[1].localeCompare(y[1])}[so]||((x,y)=>x[1].localeCompare(y[1]));
  $('boxList').innerHTML=S.box.length?S.box.map((b,i)=>[b,(byName.get(b)||{}).d||b,i]).sort(cmp).map(([b,dn])=>`<span class="boxchip">${sprite(byName.get(b))||''}<b>${esc(dn)}</b><button class="x" type="button" data-unbox="${esc(b)}" aria-label="Remove ${esc(dn)}">×</button></span>`).join(''):'<span class="none">Your box is empty. Add the Pokémon you own.</span>';
}
function renderPoolCtl(){const ps=$('plsetSum');if(ps)ps.textContent=[{box:'My box only',boxfill:'Box, then fill gaps',all:'Full roster'}[ui.pool],megaGoal()+' Mega'+(megaGoal()===1?'':'s'),S.excl.length?S.excl.length+' never-suggest':''].filter(Boolean).join(' · ');
  document.querySelectorAll('[data-absrc]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.absrc===ui.abSrc));{const n=$('abBoxN');if(n)n.textContent=S.box.length+' in your box'}
  const sel=$('poolSel');if(sel&&sel.value!==ui.pool)sel.value=ui.pool}
function renderExcl(){const el=$('exclList');if(!el)return;
  el.innerHTML=S.excl.map(n=>[n,(byName.get(n)||{}).d||n]).sort((x,y)=>x[1].localeCompare(y[1])).map(([n,dn])=>`<span class="exchip">${esc(dn)}<button class="x" type="button" data-unexcl="${esc(n)}" aria-label="Allow ${esc(dn)} again">×</button></span>`).join('')+(S.excl.length>1?`<button class="linkbtn" type="button" data-unexcl="*">Clear all</button>`:'');
  $('exclNote').textContent=S.excl.length?`${S.excl.length} excluded`:'Nothing excluded'}
$('boxCb').innerHTML=`<input class="field" id="boxAdd" placeholder="Add a Pokémon" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Add a Pokémon to your box">`;
bindMonInput($('setMonIn'),p=>{ui.setMon=p.n;LS.set('cc2.setMon',p.n);$('setMonIn').value='';renderSets()});
bindMonInput($('typeMonIn'),p=>{ui.typesMon=p.n;ui.typesSel=p.t.slice();$('typeMonIn').value='';renderTypes()});
bindMonInput($('exclAdd'),p=>{if(!isExcl(p)){S.excl.push(p.n);toast(`${p.d} won't be suggested${!p.m&&ROSTER.some(q=>q.m&&ownKey(q)===p.n)?' (nor its Mega)':''}`)}$('exclAdd').value='';render()},p=>!isExcl(p));
bindMonInput($('boxAdd'),p=>{if(!inBox(p)){S.box.push(p.n);toast(p.d+' added to your box')}$('boxAdd').value='';render()},p=>!p.m&&!inBox(p));
// Re-rendering replaces whole panels, so the page can briefly get shorter and the browser jumps up.
// Hold the reader where they were: pin the page height during the render, then restore the scroll position.
// If the reader scrolls on their own in that moment, stop correcting so the page never fights them.
let userScrollAt=0;['wheel','touchmove','keydown'].forEach(t=>{try{window.addEventListener(t,()=>{userScrollAt=Date.now()},{passive:true})}catch(e){}});
function keepScroll(fn){const y=window.scrollY||0,b=document.body,t0=Date.now();const pin=v=>{try{if(b)b.style.minHeight=v}catch(e){}};
  try{pin((b?b.offsetHeight:0)+'px')}catch(e){}
  try{fn()}finally{const back=()=>{try{if(userScrollAt<t0&&Math.abs((window.scrollY||0)-y)>2)window.scrollTo(0,y)}catch(e){}};back();
    try{requestAnimationFrame(()=>{back();setTimeout(()=>{back();pin('')},350)})}catch(e){pin('')}}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-boxsort]');if(!b)return;ui.boxSort=b.dataset.boxsort;LS.set('cc2.boxSort',ui.boxSort);renderBox()});
// box changes can be undone too (Oct 30 audit: Reset and × had no way back)
function toastBox(t){const el=$('toast');el.innerHTML=esc(t)+' <button type="button" class="tundo" id="toastBoxUndo">Undo</button>';el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,6000)}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#toastBoxUndo');if(!b||!ui.boxUndo)return;S.box=ui.boxUndo;ui.boxUndo=null;render();toast('Box restored')});

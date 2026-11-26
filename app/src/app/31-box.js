// ---------- box ----------
function renderBox(){
  $('boxCount').textContent=`(${S.box.length})`;
  // sort (Oct 30, Sim): A–Z, by type, newest or oldest added (S.box keeps the order they were added), or by rating
  const so=boxSortNow();{const sc=$('boxSort');if(sc)sc.querySelectorAll('[data-boxsort]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.boxsort===so))}
  $('boxList').innerHTML=S.box.length?boxRows(so).map(([b,dn])=>`<span class="boxchip${byName.get(b)?' tyacc':''}" style="${tyv(byName.get(b))}">${sprite(byName.get(b))||''}<b>${esc(dn)}</b><button class="x" type="button" data-unbox="${esc(b)}" aria-label="Remove ${esc(dn)}">×</button></span>`).join(''):'<span class="none">Your box is empty. Add the Pokémon you own.</span>';
}
function renderPoolCtl(){const ps=$('plsetSum');if(ps)ps.textContent=[{box:'My box',boxfill:'Box + catch',all:'Whole roster'}[ui.pool],megaGoal()+' Mega'+(megaGoal()===1?'':'s'),S.excl.length?S.excl.length+' never-suggest':''].filter(Boolean).join(' · ');
  document.querySelectorAll('[data-absrc]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.absrc===ui.abSrc));{const n=$('abBoxN');if(n)n.textContent=S.box.length+' in your box'}
  const sel=$('poolSel');if(sel&&sel.value!==ui.pool)sel.value=ui.pool}
function renderExcl(){const el=$('exclList');if(!el)return;
  el.innerHTML=S.excl.map(n=>[n,(byName.get(n)||{}).d||n]).sort((x,y)=>x[1].localeCompare(y[1])).map(([n,dn])=>`<span class="exchip">${esc(dn)}<button class="x" type="button" data-unexcl="${esc(n)}" aria-label="Allow ${esc(dn)} again">×</button></span>`).join('')+(S.excl.length>1?`<button class="linkbtn" type="button" data-unexcl="*">Clear all</button>`:'');
  $('exclNote').textContent=S.excl.length?`${S.excl.length} excluded`:'Nothing excluded'}
$('boxCb').innerHTML=`<input class="field" id="boxAdd" placeholder="Add a Pokémon" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Add a Pokémon to your box">`;
bindMonInput($('setMonIn'),p=>{ui.setMon=p.n;LS.set('cc2.setMon',p.n);$('setMonIn').value='';renderSets()});
bindMonInput($('typeMonIn'),p=>{ui.typesAuto=false;ui.typesMon=p.n;ui.typesSel=p.t.slice();$('typeMonIn').value='';renderTypes()});
bindMonInput($('exclAdd'),p=>{if(!isExcl(p)){S.excl.push(p.n);toast(`${p.d} won't be suggested${!p.m&&ROSTER.some(q=>q.m&&ownKey(q)===p.n)?' (nor its Mega)':''}`)}$('exclAdd').value='';render()},p=>!isExcl(p));
bindMonInput($('boxAdd'),p=>{if(boxAdd(p))toast(p.d+' added to your box');$('boxAdd').value='';render()},p=>!p.m&&!inBox(p));
// Re-rendering replaces whole panels, so the page can briefly get shorter and the browser jumps up.
// Hold the reader where they were: pin the page height during the render, then restore the scroll position.
// If the reader scrolls on their own in that moment, stop correcting so the page never fights them. And once 'keep your
// place' (72-keep-place.js) has moved the page to keep the tapped button under the finger, it wins: the two used to take turns
// and the page bounced up and down after Apply (Sim, Nov 7). Not after going to another page either: the old page's place
// used to be put back on the new page (See all suggestions landed near the bottom).
let userScrollAt=0;['wheel','touchmove','keydown'].forEach(t=>{try{window.addEventListener(t,()=>{userScrollAt=Date.now()},{passive:true})}catch(e){}});
function keepScroll(fn){const y=window.scrollY||0,b=document.body,t0=Date.now(),v0=typeof view!=='undefined'?view:'';
  /* a tap a moment ago: keep-your-place holds the tapped control still, so this doesn't also put the old scroll back (Nov 7) */
  let tapped=false;try{tapped=!!(typeof KP==='object'&&KP.last&&t0-KP.last.t0<1000&&KP.recent())}catch(e){}const pin=v=>{try{if(b)b.style.minHeight=v}catch(e){}};
  try{pin((b?b.offsetHeight:0)+'px')}catch(e){}
  try{fn()}finally{const back=()=>{try{if(!tapped&&userScrollAt<t0&&!(KP.movedAt>=t0)&&view===v0&&Math.abs((window.scrollY||0)-y)>2)window.scrollTo(0,y)}catch(e){}};back();
    try{requestAnimationFrame(()=>{back();setTimeout(()=>{back();pin('')},350)})}catch(e){pin('')}}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-boxsort]');if(!b)return;setBoxSort(b.dataset.boxsort);renderBox()});
// box changes can be undone too (Oct 30 audit: Reset and × had no way back)
function toastBox(t){const el=$('toast');el.innerHTML=esc(t)+' <button type="button" class="tundo" id="toastBoxUndo">Undo</button>';el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,6000)}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#toastBoxUndo');if(!b||!ui.boxUndo)return;boxRestore();render();toast('Box restored')});

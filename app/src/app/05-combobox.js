// ---------- combobox ----------
let cbState=null; // {input, items, idx, onPick}
function openMenu(input,items,renderItem,onPick,emptyText){
  closeMenu();
  const menu=document.createElement('div');menu.className='menu';menu.setAttribute('role','listbox');
  menu.innerHTML=items.length?items.map((it,i)=>`<div class="opt" role="option" data-k="${i}" aria-selected="${i===0}">${renderItem(it)}</div>`).join(''):`<div class="emptyopt">${esc(emptyText||'No matches. Try fewer letters.')}</div>`;
  input.parentElement.appendChild(menu);input.setAttribute('aria-expanded','true');
  try{const r=menu.getBoundingClientRect(),W=document.documentElement.clientWidth;if(r.right>W-8){menu.style.left='auto';menu.style.right='0'}const r2=menu.getBoundingClientRect();if(r2.left<8)menu.style.transform=`translateX(${8-r2.left}px)`}catch(e){}
  cbState={input,menu,items,idx:0,onPick};
  menu.addEventListener('mousedown',e=>e.preventDefault());
  menu.addEventListener('click',e=>{const o=e.target.closest('.opt');if(o)pick(+o.dataset.k)});
}
function closeMenu(){if(cbState){cbState.menu.remove();cbState.input.setAttribute('aria-expanded','false');cbState=null}}
function pick(k){if(!cbState)return;const {items,onPick}=cbState;const it=items[k];closeMenu();if(it)onPick(it)}
function moveSel(d){if(!cbState||!cbState.items.length)return;cbState.idx=(cbState.idx+d+cbState.items.length)%cbState.items.length;
  [...cbState.menu.children].forEach((o,i)=>o.setAttribute('aria-selected',i===cbState.idx));cbState.menu.children[cbState.idx].scrollIntoView({block:'nearest'})}
// usage under each name: share of tournament teams (Limitless sheets), else the current format's usage
let useCacheV=-1,useMap=null;
function pickUse(p){if(useCacheV!==metaVersion){useCacheV=metaVersion;useMap=new Map();const d=META.doubles_tour;if(d)[...(d.top||[]),...(d.more||[])].forEach(t=>{if(typeof t.u==='number')useMap.set(t.n,t.u)})}
  if(S.format==='doubles'&&useMap.size)return useMap.get(p.n)||0;try{return U(p)}catch(e){return 0}}
const monOpt=p=>{const u=pickUse(p);return `${sprite(p,'optspr')}<span class="on">${esc(p.d)}</span><span class="chips">${p.t.map(t=>chip(t)).join('')}</span>${inBox(p)?'<span class="tag box ico" title="In your box">BOX</span>':''}<span class="uso" title="Share of tournament teams">${u>=.1?u.toFixed(u>=10?0:1)+'%':u>0?'<0.1%':'–'}</span>`};
function bindMonInput(input,onPick,pool){
  const run=()=>{if(!input.value.trim()){closeMenu();return}const all=searchMon(input.value,40),r=all.filter(p=>!pool||pool(p)).slice(0,8);
    openMenu(input,r,monOpt,onPick,all.length&&!r.length?(all.length===1?all[0].d+' is already here':'Those are already here'):null)};
  input.addEventListener('input',run);input.addEventListener('focus',()=>{if(input.value)run()});
  input.addEventListener('blur',()=>setTimeout(()=>{if(cbState&&cbState.input===input)closeMenu()},120));
  input.addEventListener('keydown',kb);
}
function kb(e){if(!cbState)return;if(e.key==='ArrowDown'){e.preventDefault();moveSel(1)}else if(e.key==='ArrowUp'){e.preventDefault();moveSel(-1)}else if(e.key==='Enter'){e.preventDefault();pick(cbState.idx)}else if(e.key==='Escape'){closeMenu();e.preventDefault();e.__cbEsc=true}}

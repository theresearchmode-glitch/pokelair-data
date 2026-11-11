// ---------- render: slots ----------
// a redraw while someone is typing in a name box must not drop their focus (on phones that closes the keyboard)
// nor what they've typed so far: a name box redrawn while it has text gets the text back, and its list of matches (Nov 7)
function renderSlots(flush){const ae=document.activeElement,fid=ae&&ae.id&&ae.tagName==='INPUT'?ae.id:null,ss=fid?ae.selectionStart:null,se=fid?ae.selectionEnd:null,val=fid?ae.value:'';
  try{renderSlots_(flush)}finally{const x=fid&&document.getElementById(fid);if(x&&x!==ae&&x.offsetParent!==null){try{if(val&&!x.value){x.value=val}x.focus({preventScroll:true});if(ss!=null)x.setSelectionRange(ss,se);if(val)x.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}}}}
// The six set editors live in the edit panel, which shows one of them at a time (or all six for import, export and saving).
// Each redraw draws only the ones showing; the others are drawn when the panel opens on them (slotsFlush), with the team as
// it is then, so an edit redraws one editor instead of six (Oct 31: the six were a third of each edit's time on phones).
let slotGen=0;const slotAt=[];
function slotsShowing(){const ed=$('chEdit'),sl=$('slots');if(!ed||!sl||!ed.contains(sl))return null;if(ed.hidden)return [];
  const k=ed.dataset.slot;return k==null||k==='all'?null:[+k]}
function slotsFlush(){const want=slotsShowing(),sl=$('slots');if(!sl)return;if(!want||want.some(i=>slotAt[i]!==slotGen))renderSlots(true)}
// the ones not showing are drawn in idle moments too, one at a time, so opening the panel usually finds its editor ready
let slotIdleT=0;
function slotsIdle(){if(slotIdleT)return;const go=()=>{slotIdleT=0;const sl=$('slots');if(!sl||sl.children.length!==S.slots.length)return;
    const i=S.slots.findIndex((x,j)=>slotAt[j]!==slotGen);if(i<0)return;safe('set editor',()=>renderSlots_(true,[i]));slotsIdle()};
  slotIdleT=typeof requestIdleCallback==='function'?requestIdleCallback(go,{timeout:1500}):setTimeout(go,300)}
function renderSlots_(flush,only){
  const useA=$('useAbil').checked;let clash=null;try{clash=scarfTrClash(members())}catch(e){}
  if(!flush)slotGen++;
  const sl=$('slots'),want=only||slotsShowing();
  /* first load (Nov 2, load speed): with the edit panel closed, the six set editors start as empty placeholders and are drawn
     in idle moments (slotsIdle) or when the panel opens (slotsFlush), instead of all six before the first page shows */
  if(want&&!want.length&&sl.children.length!==S.slots.length){sl.innerHTML=S.slots.map(()=>'<div class="slot slotwait"></div>').join('');S.slots.forEach((x,i)=>slotAt[i]=-1)}
  const part=want&&sl.children.length===S.slots.length;
  const draw=i=>!part||want.includes(i);
  const html=S.slots.map((s,i)=>draw(i)?slotHtml(s,i,useA,clash):'');
  if(part){want.forEach(i=>{if(slotAt[i]===slotGen&&flush)return;const t=document.createElement('template');t.innerHTML=html[i];sl.children[i].replaceWith(t.content);slotAt[i]=slotGen})}
  else{sl.innerHTML=html.join('');S.slots.forEach((x,i)=>slotAt[i]=slotGen)}
  slotsAfter(part?want:null);if(part&&S.slots.some((x,j)=>slotAt[j]!==slotGen))slotsIdle()}
function slotHtml(s,i,useA,clash){{const m=memberOf(s,i);
    if(!m)return `<div class="slot empty"><div class="sl-top"><span class="sl-num">${i+1}</span><span class="addtok" aria-hidden="true">+</span><div class="cb"><input class="field" id="pk${i}" data-i="${i}" placeholder="Add a Pokémon" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Pokémon for slot ${i+1}"></div></div></div>`;
    const p=m.p;const w=[],r=[];
    TYPES.forEach(t=>{const x=mult(t,p.t,m.ability,useA);if(x>=2)w.push(chip(t,x>=4?' <b>4×</b>':''));else if(x<=.5)r.push(chip(t,x===0?' <b>0</b>':x<=.25?' <b>¼</b>':''))});
    const ti=topItems(p),u=U(p);
    return `<div class="slot tcard${ui.fresh===i?' fresh':''}" id="slot${i}" data-tcard="${i}" style="--tw:${TC[p.t[0]]};--t1:${TC[p.t[0]]};--t2:${TC[p.t[1]||p.t[0]]}">
      <div class="thead">
        <div class="trow"><span class="tnum">${i+1}</span><span class="tgap"></span><button class="lockbtn" type="button" data-lock="${i}" aria-pressed="${!!s.lock}" title="Locked Pokémon are never swapped out by fix plans">${s.lock?'LOCKED':'LOCK'}</button><button class="x" type="button" data-clear="${i}" aria-label="Remove ${esc(p.d)}">×</button></div>
        ${sprite(p,'tspr')||ticon(p.t[0],'wm')}
        <span class="sl-name" title="${esc(p.d)}">${esc(p.d)}</span>
        <div class="sl-sub"><span class="chips">${p.t.map(t=>chip(t)).join('')}</span>${p.m?'<span class="tag mega ico" title="Mega Evolution">Mega</span>':''}${inBox(p)?'<span class="tag box ico" title="In your box">Box</span>':''}${ratingTag(p)}</div>
        ${u?`<div class="tuse" title="${u.toFixed(1)}% of ${S.format} teams"><span class="tbar"><i style="--w:${Math.min(100,u*2).toFixed(0)}%"></i></span><span class="vsub">${u.toFixed(1)}%<span class="tus"> of teams</span><span class="tug"> use</span></span></div>`:''}
        ${m.item?`<div class="titem${m.heldItem?' mine':p.m?'':' asmb'}"${m.heldItem||p.m?'':' title="Assumed: you haven\'t set an item, so this is the one most players run"'}>${esc(m.item)}</div>`:''}${s.lock?'<span class="tlock" title="Locked">LOCKED</span>':''}
      </div>
      <div class="slbody">
      ${m?'':setRows(p,{noItem:true,noSpread:true})}
      ${spreadBlock(s,i,m)}
      ${abilBlock(s,i,m)}
      ${itemBlock(s,i,m,clash)}
      ${modText(m.ability)?`<div class="amod">${modText(m.ability)}</div>`:''}
      ${movesBlock(s,i,m)}
      <details class="slmore"><summary><span class="lbl">Weak</span><span class="sumw">${w.length?w.join(''):'<span class="none">None</span>'}</span></summary><div class="inmore">
      <div class="wr"><span class="lbl">Resists</span><div class="chips">${r.join('')||'<span class="none">None</span>'}</div></div>
      <div class="adesc"><b>${esc(m.ability)}:</b> ${esc((ABIL[m.ability]||'').replace(/Pokemon/g,'Pokémon'))}</div></div></details>
    </div></div>`}}
function slotsAfter(only){
  if(ui.tview==null){try{ui.tview=LS.get('cc2.tview','grid')}catch(e){ui.tview='grid'}}
  {const sl=$('slots');if(sl&&sl.classList)sl.classList.toggle('grid',ui.tview==='grid');document.querySelectorAll('[data-tview]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tview===ui.tview))}
  // Species Clause: a species already on the team (any form) is not offered again
  S.slots.forEach((s,i)=>{if(only&&!only.includes(i))return;const inp=$('pk'+i);if(inp)bindMonInput(inp,p=>{addMon(i,p);ui.fresh=i;render();ui.fresh=null;toast(p.d+' added')},
    p=>!S.slots.some((o,j)=>{const q=j!==i&&byName.get(o.n);return q&&q.b===p.b}))});
}

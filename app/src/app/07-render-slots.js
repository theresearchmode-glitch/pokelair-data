// ---------- render: slots ----------
function renderSlots(){
  const useA=$('useAbil').checked;let clash=null;try{clash=scarfTrClash(members())}catch(e){}
  $('slots').innerHTML=S.slots.map((s,i)=>{const m=memberOf(s,i);
    if(!m)return `<div class="slot empty"><div class="sl-top"><span class="sl-num">${i+1}</span><span class="addtok" aria-hidden="true">+</span><div class="cb"><input class="field" id="pk${i}" data-i="${i}" placeholder="Add a Pokémon" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Pokémon for slot ${i+1}"></div></div></div>`;
    const p=m.p;const w=[],r=[];
    TYPES.forEach(t=>{const x=mult(t,p.t,m.ability,useA);if(x>=2)w.push(chip(t,x>=4?' <b>4×</b>':''));else if(x<=.5)r.push(chip(t,x===0?' <b>0</b>':x<=.25?' <b>¼</b>':''))});
    const ti=topItems(p),u=U(p);
    return `<div class="slot tcard${ui.fresh===i?' fresh':''}" id="slot${i}" data-tcard="${i}" style="--tw:${TC[p.t[0]]};--t1:${TC[p.t[0]]};--t2:${TC[p.t[1]||p.t[0]]}">
      <div class="thead">
        <div class="trow"><span class="tnum">${i+1}</span><span class="tgap"></span><button class="lockbtn" type="button" data-lock="${i}" aria-pressed="${!!s.lock}" title="Locked Pokémon are never swapped out by fix plans">${s.lock?'LOCKED':'LOCK'}</button><button class="x" type="button" data-clear="${i}" aria-label="Remove ${esc(p.d)}">×</button></div>
        ${sprite(p,'tspr')||ticon(p.t[0],'wm')}
        <span class="sl-name" title="${esc(p.d)}">${esc(p.d)}</span>
        <div class="sl-sub"><span class="chips">${p.t.map(t=>chip(t)).join('')}</span>${p.m?'<span class="tag mega ico" title="Mega Evolution">MEGA</span>':''}${inBox(p)?'<span class="tag box ico" title="In your box">BOX</span>':''}${ratingTag(p)}</div>
        ${u?`<div class="tuse" title="${u.toFixed(1)}% of ${S.format} teams"><span class="tbar"><i style="--w:${Math.min(100,u*2).toFixed(0)}%"></i></span><span class="vsub">${u.toFixed(1)}%<span class="tus"> of teams</span><span class="tug"> use</span></span></div>`:''}
        ${m.item?`<div class="titem${m.heldItem?' mine':p.m?'':' asmb'}"${m.heldItem||p.m?'':' title="Assumed: you haven\'t set an item, so this is the one most players run"'}>${esc(m.item)}</div>`:''}${s.lock?'<span class="tlock" title="Locked">LOCKED</span>':''}
      </div>
      <div class="slbody">
      ${setRows(p,{noItem:true,noSpread:true})}
      ${spreadBlock(s,i,m)}
      ${abilBlock(s,i,m)}
      ${itemBlock(s,i,m,clash)}
      ${modText(m.ability)?`<div class="amod">${modText(m.ability)}</div>`:''}
      ${movesBlock(s,i,m)}
      <details class="slmore"><summary><span class="lbl">Weak</span><span class="sumw">${w.length?w.join(''):'<span class="none">None</span>'}</span></summary><div class="inmore">
      <div class="wr"><span class="lbl">Resists</span><div class="chips">${r.join('')||'<span class="none">None</span>'}</div></div>
      <div class="adesc"><b>${esc(m.ability)}:</b> ${esc((ABIL[m.ability]||'').replace(/Pokemon/g,'Pokémon'))}</div></div></details>
    </div></div>`}).join('');
  if(ui.tview==null){try{ui.tview=LS.get('cc2.tview','grid')}catch(e){ui.tview='grid'}}
  {const sl=$('slots');if(sl&&sl.classList)sl.classList.toggle('grid',ui.tview==='grid');document.querySelectorAll('[data-tview]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tview===ui.tview))}
  // Species Clause: a species already on the team (any form) is not offered again
  S.slots.forEach((s,i)=>{const inp=$('pk'+i);if(inp)bindMonInput(inp,p=>{S.slots[i]={n:p.n,a:null,lock:false};ui.fresh=i;render();ui.fresh=null;toast(p.d+' added')},
    p=>!S.slots.some((o,j)=>{const q=j!==i&&byName.get(o.n);return q&&q.b===p.b}))});
}

// Double taps (sweep, Oct 31): right after an action that changes the team or the page, a second tap within half a second is
// ignored, so a double tap can't apply a second plan, save twice, or land on whatever the redraw put under the finger.
const TAP_ACT='[data-plan],[data-absave],[data-abuse],[data-chrm],[data-rec],[data-qa],[data-evload],[data-laddteam],[data-abaround],#clearTeam';
let tapAt=0;
document.addEventListener('click',e=>{const now=Date.now();if(now-tapAt<450){e.stopImmediatePropagation();e.preventDefault();return}
  const b=e.target&&e.target.closest&&e.target.closest(TAP_ACT);if(b)tapAt=now},true);
// ---------- events ----------
document.addEventListener('change',e=>{const t=e.target;
  if(t.id&&/^ab\d$/.test(t.id)){const i=+t.dataset.i;const rec=setAbility(i,t.value);render();
    toast(t.value===rec?`${t.value}: the most-used ability`:`${t.value} set (most players run ${rec})`)}
  else if(t.dataset&&t.dataset.mvi){const [i,j]=t.dataset.mvi.split(':').map(Number);setMove(i,j,t.value)}
  else if(t.dataset&&t.dataset.iti!=null){const i=+t.dataset.iti,s=S.slots[i],p=s&&byName.get(s.n);if(!p)return;const v=t.value;
    const T0=(ui.vsum&&ui.vsum.RD)||null,before=T0?T0.score:null;const def=setItem(i,v);render();
    const T1=(ui.vsum&&ui.vsum.RD)||null,after=T1?T1.score:null,cl=scarfTrClash(members());
    toast(`${v||'No item'}${v===def?': the usual item':''}${before!=null&&after!=null?` · ready for ${before===after?after+'% of the top threats (no change)':before+'% → '+after+'% of the top threats'}`:''}${cl&&v==='Choice Scarf'?' · clashes with Trick Room':''}`)}
  else if(t.id==='poolSel'){ui.pool=['box','boxfill','all'].includes(t.value)?t.value:'boxfill';LS.set('cc2.pool',ui.pool);render();toast({box:'Suggestions only use your box',boxfill:'Your box first, then the best Pokémon to catch',all:'Suggestions use the full roster'}[ui.pool])}
  else if(t.id==='oppTeamSel'){const d=META.teams,tm=d&&d.teams[+t.value];if(tm){S.opp=tm.mons.slice(0,6);while(S.opp.length<6)S.opp.push('');ui.oppFrom={who:tm.player,key:S.opp.slice().sort().join('|')};persist();renderMatchup();toast('Loaded '+tm.player+'’s team as the opponent')}}
  else if(t.id==='useAbil'||t.id==='swapMega'){render();toast(t.id==='swapMega'?(t.checked?'Plans can now swap your Mega':'Your Mega is protected again'):'Plans updated')}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'){if(e.target.id==='saveName'){e.preventDefault();const o=$('saveOver');(o||$('saveNew')).click()}else if(e.target.id&&e.target.id.startsWith('rn_')){e.preventDefault();document.querySelector(`[data-rnok="${e.target.id.slice(3)}"]`).click()}}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(b.id==='moreBtn'){sideOpen(!$('side').classList.contains('open'));return}
  if(d.thm){setTheme(d.thm);return}
  if(b.id==='sideClose'){sideOpen(false);return}
  if(d.view){setView(d.view);return}
  if(d.typesmon){const p=byName.get(d.typesmon);if(p){ui.typesAuto=false;ui.typesMon=p.n;ui.typesSel=p.t.slice();renderTypes()}return}
  if(d.type){const s=ui.typesSel||[];ui.typesMon=null;ui.typesCleared=true;ui.typesSel=s.includes(d.type)?s.filter(x=>x!==d.type):(s.length>=2?[s[1],d.type]:[...s,d.type]);renderTypes();return}
  if(b.id==='typesClear'||d.typesmonx){ui.typesSel=[];ui.typesMon=null;ui.typesCleared=true;const f=$('typeMonIn');if(f)f.value='';renderTypes();return}
  if(d.mvreset!==undefined){const s=S.slots[+d.mvreset];if(s&&s.mv){const before=teamOffense();resetMoves(+d.mvreset);render();const after=teamOffense();toast(`Back to the popular set · Offense ${before===after?'stays at '+after:before+' → '+after} of 18`)}return}
  if(d.unexcl!==undefined){if(d.unexcl==='*'){S.excl=[];toast('Every Pokémon can be suggested again')}else{S.excl=S.excl.filter(n=>n!==d.unexcl);const q=byName.get(d.unexcl);toast(`${q?q.d:d.unexcl} can be suggested again`)}render();return}
  if(d.itreset!==undefined){const s=S.slots[+d.itreset];if(s&&s.it){resetItem(+d.itreset);render();toast('Back to the usual item')}return}
  if(d.abreset!==undefined){if(resetAbility(+d.abreset)){render();toast('Back to the most-used ability')}return}
  if(d.fullset){if(byName.get(d.fullset)){if(typeof chEditClose==='function')chEditClose();ui.setMon=d.fullset;LS.set('cc2.setMon',d.fullset);setView('sets');renderSets()}return}
  if(d.setmon){if(byName.get(d.setmon)){ui.setMon=d.setmon;LS.set('cc2.setMon',d.setmon);renderSets();try{$('sets').scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}}return}
  if(d.setsrc){ui.setSrc=d.setsrc;ui.setSrcLoaded=true;try{LS.set('cc2.setSrc',d.setsrc)}catch(e){}renderSets();return}
  if(d.unopp!==undefined){S.opp[+d.unopp]='';persist();renderMatchup();const f=$('opp'+d.unopp);if(f)f.focus();return}
  if(b.id==='oppClear'){S.opp=['','','','','',''];persist();renderMatchup();return}
  if(d.ttask!==undefined){if(members().length){ui.ttConfirm=+d.ttask;renderTopTeams()}else loadTopTeam(+d.ttask);return}
  if(d.ttload!==undefined){loadTopTeam(+d.ttload);return}
  if(d.ttx){ui.ttConfirm=null;renderTopTeams();return}
  if(b.id==='importBtn'||b.id==='exportBtn'){const m=b.id==='importBtn'?'import':'export';ui.paste=ui.paste===m?null:m;ui.saving=false;renderSavePanel();renderPastePanel();if(m==='import'&&ui.paste){const t=$('pasteIn');if(t)t.focus()}return}
  if(d.pastex){ui.paste=null;renderPastePanel();return}
  if(b.id==='pasteCopy'){const t=$('pasteOut');const txt=t?t.value:'';try{navigator.clipboard.writeText(txt).then(()=>toast('Copied'),()=>{t.select();toast('Press Ctrl+C or Cmd+C to copy')})}catch(err){if(t)t.select();toast('Press Ctrl+C or Cmd+C to copy')}return}
  if(b.id==='pasteLoad'){const raw=($('pasteIn')||{}).value,sh=typeof decodeTeam==='function'?decodeTeam(raw):null;if(sh){applyShared(sh);return}const r=parsePaste(raw);
    if(!r.slots.length){$('pasteNotes').textContent=r.notes.length?r.notes.join('. ')+'.':'No Pokémon found. Paste the team text, one Pokémon per block.';return}
    keepUndo();S.slots=normSlots(r.slots);S.loadedId=null;ui.paste=null;render();{const sk=r.notes.map(n=>{const x=n.match(/^(.+?): skipped (item|move) "(.+?)"/);return x?`${x[3]} (${x[1]})`:null}).filter(Boolean);const skm=r.notes.map(n=>{const x=n.match(/^Skipped "(.+?)": not on the M-C roster/);return x?x[1]:null}).filter(Boolean);toast(`Imported ${r.slots.length} Pokémon`+(skm.length?`. Not in Reg M-C, left out: ${skm.slice(0,3).join(', ')}${skm.length>3?` and ${skm.length-3} more`:''}`:'')+(sk.length?`. Not in Champions, skipped: ${sk.slice(0,3).join(', ')}${sk.length>3?` and ${sk.length-3} more`:''}`:''),true)}return}
  if(d.megas!==undefined){S.megaGoal=Math.max(0,Math.min(2,+d.megas||0));S.maxMega=Math.max(1,S.megaGoal);recCache={key:null,val:null};if(ui.ab&&!ui.ab.busy){if(view==='auto')runAutoBuild();else ui.ab=null}keepScroll(()=>render());toast(S.megaGoal?`Teams aim for ${S.megaGoal} Mega${S.megaGoal>1?'s':''}`:'Teams without Megas: rare (about 1 in 100 tournament teams), and they win about a third of their games');return}
  if(d.clear!==undefined){const was=clearSlot(+d.clear);render();if(was)toast(`Removed ${was.d}`,true)}
  else if(b.id==='abBtn'){runAutoBuild()} // keeps the Build around pick (shown as a chip with × above the button)
  else if(d.recsrc){ui.recSrc=d.recsrc==='all'?'all':'box';LS.set('cc2.recsrc',ui.recSrc);renderRecs()}
  else if(d.rec!==undefined){const pl=(ui.recs||[])[+d.rec];if(!pl)return;const x=pl.ch[0];keepUndo();S.slots[x.slot]={n:x.c.p.n,a:x.c.mem.ability,lock:false};undoMark(x.out?`${x.c.p.d} for ${x.out.d}`:`${x.c.p.d} added`);keepScroll(()=>render());toast(`${x.out?x.out.d+' → ':'Added '}${x.c.p.d}`,true)}
  else if(d.absrc){ui.abSrc=d.absrc==='all'?'all':'box';LS.set('cc2.absrc',ui.abSrc);renderPoolCtl();if(ui.ab&&!ui.ab.busy)runAutoBuild()}
  else if(d.abnext){abNext(d.abnext)}
  else if(d.abuse){const t=abTeam(d.abuse);if(!t)return;keepUndo();S.format='doubles';S.slots=t.mons.map(m=>({n:m.n,a:null,lock:false}));S.loadedId=null;render();setView('build');toast(`Using the built team. Suggestions and the game plan now describe it.`,true)}
  else if(d.absave){const t=abTeam(d.absave);if(!t||S.teams.length>=10)return;{const key=t.mons.map(m=>m.n).sort().join('|'),dup=S.teams.find(x=>x.slots.map(s=>s.n).filter(Boolean).sort().join('|')===key);if(dup){toast(`Already saved as "${dup.name}"`);return}}const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    const name=`${t.label||'Built team'}`.slice(0,40);S.teams.push({id,name,slots:t.mons.map(m=>({n:m.n,a:null,lock:false})),format:d.absave,saved:Date.now()});render();toast(`Saved "${name}"`)}
  else if(d.qa!==undefined){const pl=(ui.quick||[])[+d.qa];if(!pl)return;const x=pl.ch[0];keepUndo();S.slots[x.slot]={n:x.c.p.n,a:x.c.mem.ability,lock:false};undoMark(x.out?`${x.c.p.d} for ${x.out.d}`:`${x.c.p.d} added`);
    keepScroll(()=>render());toast(`${x.out?x.out.d+' → ':'Added '}${x.c.p.d}`,true)}
  else if(d.plan!==undefined){const pl=(ui.planList||ui.plans)[+d.plan];if(!pl)return;applyPlan(pl);
    keepScroll(()=>render());toast(`Applied: ${pl.ch.map(x=>x.c.p.d).join(' and ')}`,true)}
  else if(d.lock!==undefined){toggleLock(+d.lock);render()}
  else if(d.unbox!==undefined){ui.boxUndo=S.box.slice();S.box=S.box.filter(x=>x!==d.unbox);render();const q=byName.get(d.unbox);toastBox(`Removed ${q?q.d:d.unbox} from your box`)}
  else if(b.id==='replanBtn'){vCache=new Map();pmCache=new Map();planCache={key:null,plans:[]};render();toast('Plans refreshed')}
  
  else if(d.addmeta){const p=byName.get(d.addmeta);const j=S.slots.findIndex(s=>!byName.get(s.n));
    if(p&&S.slots.some(s=>{const q=byName.get(s.n);return q&&q.b===p.b}))toast(p.d+' is already on your team');
    else if(p&&j<0)toast('Your team is full. Remove a Pokémon first.');
    else if(p){addMon(j,p);keepScroll(()=>render());toast(p.d+' added')}}
  else if(b.id==='threatsAllBtn'){ui.threatsAll=true;keepScroll(()=>render())}
  else if(b.id==='recMoreBtn'){ui.recMore=(ui.recMore||0)+1;keepScroll(()=>renderRecs())}
  else if(b.id==='recMoreReset'){ui.recMore=0;renderRecs();const l=$('recList');if(l&&l.scrollIntoView)l.scrollIntoView({block:'start'})}
  else if(b.id==='planMoreBtn'){ui.planMore=(ui.planMore||0)+1;keepScroll(()=>render())}
  else if(b.id==='planMoreReset'){ui.planMore=0;render()}
  else if(d.src){ui.metaSrc=d.src;render()}
  else if(d.sort){ui.sort=d.sort;document.querySelectorAll('[data-sort]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.sort===ui.sort));renderSaved()}
  else if(b.id==='clearTeam'){keepUndo();S.slots=Array.from({length:6},blank);S.loadedId=null;render();toast('Team cleared',true)}
  else if(b.id==='boxReset'){if(!ui.boxResetAsk){ui.boxResetAsk=true;b.textContent='Tap again to reset';setTimeout(()=>{ui.boxResetAsk=false;const x=$('boxReset');if(x)x.textContent='Reset box'},3500);return}ui.boxResetAsk=false;b.textContent='Reset box';const was=S.box.slice();S.box=DEFAULT_BOX.slice();ui.boxUndo=was;render();toastBox('Box reset to the default list')}
  else if(b.id==='saveBtn'){ui.saving=!ui.saving;ui.paste=null;renderPastePanel();renderSavePanel()}
  else if(b.id==='saveCancel'){ui.saving=false;renderSavePanel()}
  else if(b.id==='saveOver'||b.id==='saveNew'){const t=saveTeamAs($('saveName').value,b.id==='saveOver');if(!t)return;
    ui.saving=false;renderSavePanel();render();toast(`Saved "${t.name}"`)}
  else if(d.load){const t=openSaved(d.load);render();toast(`Opened "${t.name}"`,true);setView('build')}
  else if(d.rn){ui.renaming=d.rn;ui.confirmDel=null;renderSaved();const f=$('rn_'+d.rn);if(f){f.focus();f.select()}}
  else if(d.rnok){renameSaved(d.rnok,$('rn_'+d.rnok).value);ui.renaming=null;render()}
  else if(d.rnx){ui.renaming=null;renderSaved()}
  else if(d.del){ui.confirmDel=d.del;ui.renaming=null;renderSaved()}
  else if(d.delok){const t=deleteSaved(d.delok);ui.confirmDel=null;render();toast(`Deleted "${t.name}"`)}
  else if(d.delx){ui.confirmDel=null;renderSaved()}
});

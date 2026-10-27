// ---------- events ----------
document.addEventListener('change',e=>{const t=e.target;
  if(t.id&&/^ab\d$/.test(t.id)){const i=+t.dataset.i,m=memberOf(S.slots[i],i);const rec=m&&(metaAbility(m.p)||bestAbility(m.p));S.slots[i].a=t.value===rec?null:t.value;render();
    toast(t.value===rec?`${t.value}: the most-used ability`:`${t.value} set (most players run ${rec})`)}
  else if(t.dataset&&t.dataset.mvi){const [i,j]=t.dataset.mvi.split(':').map(Number);setMove(i,j,t.value)}
  else if(t.dataset&&t.dataset.iti!=null){const i=+t.dataset.iti,s=S.slots[i],p=s&&byName.get(s.n);if(!p)return;const def=defaultItem(p),v=t.value;
    const T0=(ui.vsum&&ui.vsum.TS)||null,before=T0?T0.score:null,p0=T0?T0.p:null;if(!s.it)s.it={};if(!v||v===def)delete s.it[S.format];else s.it[S.format]=v;if(!Object.keys(s.it).length)delete s.it;render();
    const T1=(ui.vsum&&ui.vsum.TS)||null,after=T1?T1.score:null,cl=scarfTrClash(members());
    // the win chance moves much less than the rank: real teams sit close together, so both are shown
    const pc=x=>(x*100).toFixed(1)+'%';
    toast(`${v||'No item'}${v===def?': the usual item':''}${before!=null&&after!=null?` · Team Score ${before===after?'stays at '+after:before+' → '+after}${p0!=null&&T1&&before!==after?` (win chance ${pc(p0)} → ${pc(T1.p)})`:''}`:''}${cl&&v==='Choice Scarf'?' · clashes with Trick Room':''}`)}
  else if(t.id==='poolSel'){ui.pool=['box','boxfill','all'].includes(t.value)?t.value:'boxfill';LS.set('cc2.pool',ui.pool);render();toast({box:'Suggestions only use your box',boxfill:'Your box first, then the best Pokémon to catch',all:'Suggestions use the full roster'}[ui.pool])}
  else if(t.id==='funPlan'||t.id==='funAb'||t.id==='funRec'){S.fun=t.checked;recCache={key:null,val:null};if(ui.ab&&!ui.ab.busy){if(view==='auto')runAutoBuild();else ui.ab=null}keepScroll(()=>render());toast(S.fun?'Fun mode on: niche Pokémon get a real shot':'Fun mode off: back to proven meta picks')}
  else if(t.id==='oppTeamSel'){const d=META.teams,tm=d&&d.teams[+t.value];if(tm){S.opp=tm.mons.slice(0,6);while(S.opp.length<6)S.opp.push('');persist();renderMatchup();toast('Loaded '+tm.player+'’s team as the opponent')}}
  else if(t.id==='abDistinct'){ui.abDistinct=t.checked;LS.set('cc2.abDistinct',ui.abDistinct);if(ui.ab&&!ui.ab.busy)runAutoBuild()}
  else if(t.id==='buildExcl'){ui.abExcl=t.checked;LS.set('cc2.abExcl',ui.abExcl);if(ui.ab&&!ui.ab.busy)runAutoBuild();else renderPoolCtl()}
  else if(t.id==='exclSaved'){ui.exclSaved=t.checked;LS.set('cc2.exclSaved',ui.exclSaved);render();toast(t.checked?'Pokémon on your other-format saved teams are skipped':'Saved-team Pokémon can be suggested again')}
  else if(t.id==='useAbil'||t.id==='swapMega'){render();toast(t.id==='swapMega'?(t.checked?'Plans can now swap your Mega':'Your Mega is protected again'):'Plans updated')}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'){if(e.target.id==='saveName'){e.preventDefault();const o=$('saveOver');(o||$('saveNew')).click()}else if(e.target.id&&e.target.id.startsWith('rn_')){e.preventDefault();document.querySelector(`[data-rnok="${e.target.id.slice(3)}"]`).click()}}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(b.id==='moreBtn'){sideOpen(!$('side').classList.contains('open'));return}
  if(d.thm){setTheme(d.thm);return}
  if(b.id==='sideClose'){sideOpen(false);return}
  if(d.view){setView(d.view);return}
  if(d.typesmon){const p=byName.get(d.typesmon);if(p){ui.typesMon=p.n;ui.typesSel=p.t.slice();renderTypes()}return}
  if(d.type){const s=ui.typesSel||[];ui.typesMon=null;ui.typesCleared=true;ui.typesSel=s.includes(d.type)?s.filter(x=>x!==d.type):(s.length>=2?[s[1],d.type]:[...s,d.type]);renderTypes();return}
  if(b.id==='typesClear'||d.typesmonx){ui.typesSel=[];ui.typesMon=null;ui.typesCleared=true;const f=$('typeMonIn');if(f)f.value='';renderTypes();return}
  if(d.mvreset!==undefined){const s=S.slots[+d.mvreset];if(s&&s.mv){const before=teamOffense();delete s.mv[S.format];if(!Object.keys(s.mv).length)delete s.mv;render();const after=teamOffense();toast(`Back to the popular set · Offense ${before===after?'stays at '+after:before+' → '+after} of 18`)}return}
  if(d.unexcl!==undefined){if(d.unexcl==='*'){S.excl=[];toast('Every Pokémon can be suggested again')}else{S.excl=S.excl.filter(n=>n!==d.unexcl);const q=byName.get(d.unexcl);toast(`${q?q.d:d.unexcl} can be suggested again`)}render();return}
  if(d.itreset!==undefined){const s=S.slots[+d.itreset];if(s&&s.it){delete s.it[S.format];if(!Object.keys(s.it).length)delete s.it;render();toast('Back to the usual item')}return}
  if(d.abreset!==undefined){const s=S.slots[+d.abreset];if(s){s.a=null;render();toast('Back to the most-used ability')}return}
  if(d.fullset){if(byName.get(d.fullset)){ui.setMon=d.fullset;LS.set('cc2.setMon',d.fullset);setView('sets');renderSets()}return}
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
    S.slots=normSlots(r.slots);S.loadedId=null;ui.paste=null;render();toast(`Imported ${r.slots.length} Pokémon`+(r.notes.length?` (${r.notes.length} skipped item${r.notes.length>1?'s':''})`:''));return}
  if(d.megas!==undefined){S.megaGoal=Math.max(0,Math.min(2,+d.megas||0));S.maxMega=Math.max(1,S.megaGoal);recCache={key:null,val:null};if(ui.ab&&!ui.ab.busy){if(view==='auto')runAutoBuild();else ui.ab=null}keepScroll(()=>render());toast(S.megaGoal?`Teams aim for ${S.megaGoal} Mega${S.megaGoal>1?'s':''}`:'Teams without Megas');return}
  if(d.clear!==undefined){S.slots[+d.clear]=blank();render()}
  else if(b.id==='abBtn'){runAutoBuild()}
  else if(d.recsrc){ui.recSrc=d.recsrc==='all'?'all':'box';LS.set('cc2.recsrc',ui.recSrc);renderRecs()}
  else if(d.rec!==undefined){const pl=(ui.recs||[])[+d.rec];if(!pl)return;const x=pl.ch[0];S.slots[x.slot]={n:x.c.p.n,a:x.c.mem.ability,lock:false};keepScroll(()=>render());toast(`${x.out?x.out.d+' → ':'Added '}${x.c.p.d}`)}
  else if(d.absrc){ui.abSrc=d.absrc==='all'?'all':'box';LS.set('cc2.absrc',ui.abSrc);renderPoolCtl();if(ui.ab&&!ui.ab.busy)runAutoBuild()}
  else if(d.abfmt){ui.abFmt=['doubles','singles','both'].includes(d.abfmt)?d.abfmt:'both';LS.set('cc2.abfmt',ui.abFmt);keepScroll(()=>render());if(ui.ab&&!ui.ab.busy)runAutoBuild()}
  else if(d.abnext){abNext(d.abnext)}
  else if(d.abuse){const t=abTeam(d.abuse);if(!t)return;S.format='doubles';S.slots=t.mons.map(m=>({n:m.n,a:null,lock:false}));S.loadedId=null;render();setView('build');toast(`Using the ${FMT(d.abuse).toLowerCase()} team. Fix plans and the game plan now describe it.`)}
  else if(d.absave){const t=abTeam(d.absave);if(!t||S.teams.length>=10)return;const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    const name=`${FMT(d.absave)}: ${t.label}`.slice(0,40);S.teams.push({id,name,slots:t.mons.map(m=>({n:m.n,a:null,lock:false})),format:d.absave,saved:Date.now()});render();toast(`Saved "${name}"`)}
  else if(d.qa!==undefined){const pl=(ui.quick||[])[+d.qa];if(!pl)return;const x=pl.ch[0];S.slots[x.slot]={n:x.c.p.n,a:x.c.mem.ability,lock:false};
    keepScroll(()=>render());toast(`${x.out?x.out.d+' → ':'Added '}${x.c.p.d}`)}
  else if(d.plan!==undefined){const pl=(ui.planList||ui.plans)[+d.plan];if(!pl)return;
    pl.ch.forEach(x=>{S.slots[x.slot]={n:x.c.p.n,a:x.c.mem.ability,lock:false}});
    keepScroll(()=>render());toast(`Applied: ${pl.ch.map(x=>x.c.p.d).join(' and ')}`)}
  else if(d.lock!==undefined){const s=S.slots[+d.lock];s.lock=!s.lock;render()}
  else if(d.unbox!==undefined){S.box=S.box.filter(x=>x!==d.unbox);render()}
  else if(b.id==='replanBtn'){vCache=new Map();pmCache=new Map();planCache={key:null,plans:[]};render();toast('Plans refreshed')}
  
  else if(d.addmeta){const p=byName.get(d.addmeta);const j=S.slots.findIndex(s=>!byName.get(s.n));
    if(p&&S.slots.some(s=>{const q=byName.get(s.n);return q&&q.b===p.b}))toast(p.d+' is already on your team');
    else if(p&&j<0)toast('Your team is full. Remove a Pokémon first.');
    else if(p){S.slots[j]={n:p.n,a:null,lock:false};keepScroll(()=>render());toast(p.d+' added')}}
  else if(b.id==='refreshBtn'||b.id==='refreshBtn2'||b.id==='refreshBtn3'){refreshNow()}
  else if(b.id==='threatsAllBtn'){ui.threatsAll=true;keepScroll(()=>render())}
  else if(b.id==='recMoreBtn'){ui.recMore=(ui.recMore||0)+1;keepScroll(()=>renderRecs())}
  else if(b.id==='recMoreReset'){ui.recMore=0;renderRecs();const l=$('recList');if(l&&l.scrollIntoView)l.scrollIntoView({block:'start'})}
  else if(b.id==='planMoreBtn'){ui.planMore=(ui.planMore||0)+1;keepScroll(()=>render())}
  else if(b.id==='planMoreReset'){ui.planMore=0;render()}
  else if(d.src){ui.metaSrc=d.src;render()}
  else if(d.sort){ui.sort=d.sort;document.querySelectorAll('[data-sort]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.sort===ui.sort));renderSaved()}
  else if(b.id==='clearTeam'){S.slots=Array.from({length:6},blank);S.loadedId=null;render()}
  else if(b.id==='boxReset'){S.box=DEFAULT_BOX.slice();render();toast('Box reset')}
  else if(b.id==='saveBtn'){ui.saving=!ui.saving;ui.paste=null;renderPastePanel();renderSavePanel()}
  else if(b.id==='saveCancel'){ui.saving=false;renderSavePanel()}
  else if(b.id==='saveOver'||b.id==='saveNew'){const name=($('saveName').value||'').trim()||'Untitled team';const slots=JSON.parse(JSON.stringify(S.slots));
    if(b.id==='saveOver'){const t=S.teams.find(t=>t.id===S.loadedId);t.name=name;t.slots=slots;t.format=S.format;t.saved=Date.now()}
    else{if(S.teams.length>=10)return;const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);S.teams.push({id,name,slots,format:S.format,saved:Date.now()});S.loadedId=id}
    ui.saving=false;renderSavePanel();render();toast(`Saved "${name}"`)}
  else if(d.load){const t=S.teams.find(t=>t.id===d.load);S.slots=JSON.parse(JSON.stringify(t.slots));fixSlots();S.loadedId=t.id;S.format='doubles';render();toast(`Opened "${t.name}"`);setView('build')}
  else if(d.rn){ui.renaming=d.rn;ui.confirmDel=null;renderSaved();const f=$('rn_'+d.rn);if(f){f.focus();f.select()}}
  else if(d.rnok){const t=S.teams.find(t=>t.id===d.rnok);const v=$('rn_'+d.rnok).value.trim();if(v)t.name=v;ui.renaming=null;render()}
  else if(d.rnx){ui.renaming=null;renderSaved()}
  else if(d.del){ui.confirmDel=d.del;ui.renaming=null;renderSaved()}
  else if(d.delok){const t=S.teams.find(t=>t.id===d.delok);S.teams=S.teams.filter(x=>x.id!==d.delok);if(S.loadedId===d.delok)S.loadedId=null;ui.confirmDel=null;render();toast(`Deleted "${t.name}"`)}
  else if(d.delx){ui.confirmDel=null;renderSaved()}
});
const TRIGGER_ID='trig_014evvWRoLJicqGyvhYQCStx';  // "NastyPlot data refresh" (formerly PokéLair): rankings, sets, top teams and the rating sources
async function refreshNow(){const btns=[...document.querySelectorAll('.refreshbtn')];const set=(dis,txt)=>btns.forEach(b=>{b.disabled=dis;b.textContent=txt});
  const last=LS.get('cc2.refreshAt',0);if(Date.now()-last<20*60*1000){toast('A refresh is already running. It takes about 10–20 minutes.');return}
  set(true,'Starting…');
  try{const mcp=window.claude&&window.claude.use?await window.claude.use('mcp'):null;
    if(!mcp)throw {code:'unavailable'};
    await mcp.callTool('Claude Code Remote','fire_trigger',{trigger_id:TRIGGER_ID},{cache:false});
    LS.set('cc2.refreshAt',Date.now());set(true,'Refreshing…');toast('Refresh started. Rankings, sets, top teams and ratings update here in about 10–20 minutes.');
    setTimeout(()=>set(false,'Refresh now'),20*60*1000);
  }catch(e){set(false,'Refresh now');
    toast(e&&e.code==='denied'||e&&e.code==='not_granted'?'Refresh needs permission to start your scheduled task.':'Couldn\'t start a refresh here right now.')}}

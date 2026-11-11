// ---------- set edits: the data steps (R4, Nov 11; shared with the new build's Edit Set sheet) ----------
// Each changes S.slots only and returns what the caller needs for its message; the caller redraws and says what changed
// (today's messages stay where they were: 34-events.js, 33-move-edits.js, 08-render-all.js).
function abilRec(p){return metaAbility(p)||bestAbility(p)}
// Ability: the most-used one is stored as "none picked" (null), so a later change in usage moves with it
function setAbility(i,v){const m=memberOf(S.slots[i],i);const rec=m&&abilRec(m.p);S.slots[i].a=v===rec?null:v;return rec}
function resetAbility(i){const s=S.slots[i];if(!s)return false;s.a=null;return true}
// Item: the usual item (or none) is stored as "not set"
function setItem(i,v){const s=S.slots[i],p=s&&byName.get(s.n);if(!p)return null;const def=defaultItem(p);
  if(!s.it)s.it={};if(!v||v===def)delete s.it[S.format];else s.it[S.format]=v;if(!Object.keys(s.it).length)delete s.it;return def}
function resetItem(i){const s=S.slots[i];if(!s||!s.it)return false;delete s.it[S.format];if(!Object.keys(s.it).length)delete s.it;return true}
// Moves: move j of slot i; four names equal to the popular set are stored as "not set". Returns the move it replaced.
function moveSlotSet(i,j,name){const s=S.slots[i],p=byName.get(s.n);
  const sm=slotMoves(s,p);const names=sm.names.slice();const old=names[j];names[j]=name||'';
  const pop=popularMoves(p).slice(0,4).map(x=>x.name);while(pop.length<4)pop.push('');
  const mv={...(s.mv||{})};if(names.join('|')===pop.join('|'))delete mv[S.format];else mv[S.format]=names;
  if(Object.keys(mv).length)s.mv=mv;else delete s.mv;return old}
function resetMoves(i){const s=S.slots[i];if(!s||!s.mv)return false;delete s.mv[S.format];if(!Object.keys(s.mv).length)delete s.mv;return true}
// Nature and stat points (Champions: 0-32 each, SP_TOTAL in all)
function natTop(p){let top=null;try{top=(setFor(p).na[0]||[])[0]}catch(x){}return top}
function setNature(i,nat){const s=S.slots[i];if(!s||!natOK(nat))return false;
  const own=s.sp&&s.sp[S.format];s.sp=Object.assign({},s.sp,{[S.format]:own&&!own.assumed&&own.v?{nat,v:own.v}:{nat,assumed:true}});return true}
function resetNature(i){const s=S.slots[i],own=s&&s.sp&&s.sp[S.format];if(!own)return false;
  if(own.v&&!own.assumed){const top=natTop(byName.get(s.n));s.sp[S.format]={nat:top||own.nat,v:own.v}}else delete s.sp[S.format];return true}
function resetPoints(i){const s=S.slots[i],own=s&&s.sp&&s.sp[S.format];if(!own)return false;const top=natTop(byName.get(s.n));
  if(own.nat&&own.nat!==top)s.sp[S.format]={nat:own.nat,assumed:true};else delete s.sp[S.format];return true}
// what's wrong with six stat point numbers and a nature ('' = fine)
function pointsProblem(v,nat){const tot=v.reduce((a,b)=>a+b,0);
  return v.length!==6||v.some(n=>!Number.isInteger(n)||n<0||n>32)?'Each box takes a whole number, 0-32':tot>SP_TOTAL?`That's ${tot} points; Champions allows ${SP_TOTAL}`:!natOK(nat)?'Pick a nature':''}
function savePoints(i,nat,v){const bad=pointsProblem(v,nat);if(bad)return bad;const s=S.slots[i];s.sp=Object.assign({},s.sp,{[S.format]:{nat,v}});return ''}
// Lock, remove (with Undo) and add
function toggleLock(i){const s=S.slots[i];s.lock=!s.lock;return s.lock}
function clearSlot(i){const was=byName.get(S.slots[i].n);keepUndo();S.slots[i]=blank();return was}
function addMon(i,p){S.slots[i]={n:p.n,a:null,lock:false}}

// ---------- the choices each picker offers (R4, Nov 11): today's editor draws its dropdowns from these, and so does the new one ----------
// Ability: every Ability it can have, with usage %; rec = the most used (or the best guess when there's no usage data)
function abilChoices(s,m){const p=m.p,meta=metaAbility(p),rec=meta||bestAbility(p),st=defSet(p);
  return {meta,rec,st,mine:s.a&&p.a.includes(s.a)&&s.a!==rec,only:p.a.length===1,list:p.a.map(a=>({name:a,pct:abilityPct(p,a)}))}}
// Item: the items most players run on it (with %), then every other item; a Mega's stone is fixed. shown = what it really holds
// (Item Clause can move the usual item to a teammate, Oct 30 audit).
function itemChoices(s,i,m){const p=m.p;if(p.m)return {fixed:m.item||'Mega Stone'};
  const pop=(defSet(p).it||[]).filter(([n])=>n&&notStone(n)).slice(0,8),popN=new Set(pop.map(([n])=>n)),def=defaultItem(p);
  const rest=itemPool().filter(n=>!popN.has(n));if(m.item&&!popN.has(m.item)&&!rest.includes(m.item))rest.unshift(m.item);
  let shown=m.item;if(!m.heldItem){try{const k=JSON.stringify(S.slots)+'|'+metaVersion;if(itemChoices._k!==k){itemChoices._k=k;itemChoices._a=new Map((typeof assignItems==='function'?assignItems(members()):[]).map(x=>[x.i,x.item]))}const a=itemChoices._a.get(m.i);if(a)shown=a}catch(e){}}
  const moved=!m.heldItem&&def&&shown&&shown!==def;
  if(shown&&!popN.has(shown)&&!rest.includes(shown))rest.unshift(shown);
  return {pop,popN,def,rest,shown,moved,mine:!!(m.heldItem&&m.heldItem!==def)}}
// Moves: the four on the card (sm), the popular ones for this format with their % (pm, pct), then every other move it learns
function moveChoices(s,p){const sm=slotMoves(s,p),pm=popularMoves(p),pct=pm.pct||new Map();
  const learn=(LEARN[p.n]||[]).map(k=>MV[k]).filter(Boolean);const popNames=new Set(pm.map(x=>x.name));
  const rest=learn.filter(x=>!popNames.has(x.name)).sort((a,b)=>a.name.localeCompare(b.name));
  const src=pm.src==='other'?`popular ${OTHER()} set`:pm.src==='guess'?'likely moves (no usage data)':pm.src==='sd'?(p.m?'Mega set · Showdown':`${S.format} set · Showdown`):pm.src==='tour'?'tournament set':pm.src==='ladder'?'Showdown set':`popular ${S.format} set`;
  return {sm,pm,pct,rest,src,custom:sm.custom}}
// Nature and stat points: the ones shown (yours, else the most run), each nature with its % (most run first), the six numbers
function natureChoices(s,p){const cs=typeof commonSpread==='function'?commonSpread(p):null,own=s.sp&&s.sp[S.format];
  let na=[];try{na=setFor(p).na||[]}catch(e){}const pc=new Map(na.map(x=>[x[0],x[1]])),top=(na[0]&&na[0][0])||(cs&&cs.nat)||null;
  const nat=(own&&own.nat)||top||'Hardy',ownNat=!!(own&&own.nat&&own.nat!==top),ownPts=!!(own&&!own.assumed&&own.v);
  const pts=ownPts?{hp:own.v[0],atk:own.v[1],def:own.v[2],spa:own.v[3],spd:own.v[4],spe:own.v[5]}:cs,K=['hp','atk','def','spa','spd','spe'];
  const v=K.map(k=>pts?pts[k]:0),sum=v.reduce((a,b)=>a+b,0);
  const order=[...na.map(x=>x[0]).filter(n=>NATURES.includes(n)),...NATURES.filter(n=>!pc.has(n)).sort()];
  return {cs,own,pc,top,nat,ownNat,ownPts,v,sum,order}}

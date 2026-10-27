// ---------- set data: moves, items, abilities, natures, teammates ----------
// Every field comes from the first source that has it, so a gap in one source never hides another's data.
// Best first: the live in-game list (refreshed daily, top Pokémon only), then the official in-game data built
// into this page (every eligible Pokémon), then tournament and Showdown lists. A Mega uses Showdown's
// Mega-specific set first, because the in-game data counts a Mega under its base form.
const FK=f=>f==='singles'?'S':'D';
// Blue and White plumage have no separate in-game file; they share Green's and Yellow's (same abilities).
const SHARED={'Squawkabilly-Blue':'Squawkabilly','Squawkabilly-White':'Squawkabilly-Yellow'};
function gameKey(p){if(SHARED[p.n])return SHARED[p.n];if(!p.m)return p.n;if(p.n==='Meowstic-F-Mega')return 'Meowstic-F';return ownKey(p)}
const hasSet=t=>!!t&&((t.mv&&t.mv.length)||(t.it&&t.it.length)||(t.ab&&t.ab.length));
// A row for exactly this form. Only a Mega may fall back to its base form's row (never Wash Rotom to Rotom).
function findIn(d,p,exact){if(!d||!d.top)return null;const t=d.top.find(t=>t.n===p.n&&hasSet(t));if(t||exact||!p.m)return t||null;
  return d.top.find(t=>t.n===gameKey(p)&&hasSet(t))||null}
const pairsOf=(a,f)=>{const o=[];for(let i=0;i+1<a.length;i+=2){const n=f(a[i]);if(n!=null&&a[i+1]>0)o.push([n,a[i+1]])}return o};
let gameCache=new Map();
function gameRow(p,fmt){const k=FK(fmt)+'|'+p.n;if(gameCache.has(k))return gameCache.get(k);
  const r=typeof SETS==='object'&&SETS[FK(fmt)][gameKey(p)];let o=null;
  if(r)o={n:gameKey(p),partial:!!r[5],mv:r[5]?[]:pairsOf(r[0],i=>MV[i]?MV[i].name:null),it:pairsOf(r[1],i=>SETS.IT[i]),ab:pairsOf(r[2],x=>x),na:pairsOf(r[3],i=>SETS.NAT[i]),tm:r[4].map(i=>ROSTER[i]?[ROSTER[i].n,null]:null).filter(Boolean),shared:!!SHARED[p.n]};
  gameCache.set(k,o);return o}
function sdRow(p,fmt){const k='M'+FK(fmt)+'|'+p.n;if(gameCache.has(k))return gameCache.get(k);
  const r=typeof SETS==='object'&&SETS['M'+FK(fmt)][p.n];let o=null;
  if(r)o={n:p.n,mv:pairsOf(r[0],i=>MV[i]?MV[i].name:null),na:r[1].map(i=>[SETS.NAT[i],null]),tm:r[2].map(i=>ROSTER[i]?[ROSTER[i].n,null]:null).filter(Boolean),it:[],ab:[],u:r[3],raw:r[4],cut:r[5]};
  gameCache.set(k,o);return o}
const STONE_RE=/ite( [XYZ])?$|inite$/;
// Moves under 80% accuracy. Only worth running with No Guard (or the weather that makes them sure-hit).
const LOW_ACC=new Set(['Zap Cannon','Inferno','Dynamic Punch','Grass Whistle','Sing','Supersonic','Hypnosis','Lovely Kiss','Sleep Powder','Stun Spore','Poison Powder','Focus Blast','Iron Tail','Mega Kick','Thunder','Blizzard','Hurricane','Fissure','Guillotine','Horn Drill','Sheer Cold','Sweet Kiss','Dark Void','Magma Storm','Smog','Slam','Submission']);
// Moves a plain form shouldn't inherit from its Mega's set: species-level rows (the in-game data, tournament and
// ladder lists) count Mega users under the plain name, so plain Raichu picked up Mega Raichu Y's No Guard Zap Cannon.
const MEGA_AB_MOVES={'Drought':['Solar Beam','Solar Blade','Weather Ball'],'Mega Sol':['Solar Beam','Solar Blade','Weather Ball'],'Drizzle':['Weather Ball','Thunder','Hurricane'],'Sand Stream':['Weather Ball'],'Snow Warning':['Weather Ball','Blizzard','Aurora Veil']};
const ATE_AB=new Set(['Aerilate','Pixilate','Refrigerate','Galvanize','Dragonize']);
function dropMegaMoves(p,mv){if(p.n!==p.b&&p.n!=='Floette-Eternal')return mv;
  const megaAb=new Set(ROSTER.filter(q=>q.m&&q.b===p.b).flatMap(q=>q.a).filter(a=>!p.a.includes(a)));if(!megaAb.size&&!ROSTER.some(q=>q.m&&q.b===p.b))return mv;
  const bad=n=>{const m=mvByName.get(n);if(megaAb.has('No Guard')&&LOW_ACC.has(n))return true;
    for(const a of megaAb)if(MEGA_AB_MOVES[a]&&MEGA_AB_MOVES[a].includes(n))return true;
    if(m&&m.type==='Normal'&&m.cat>0&&!p.t.includes('Normal')&&[...megaAb].some(a=>ATE_AB.has(a)))return true;return false};
  // a special Mega (Mega Garchomp Z) leaks special attacks into a physical plain form's set, and the reverse
  const st=p.st||[0,0,0,0,0,0],megas=ROSTER.filter(q=>q.m&&q.b===p.b&&q.st);
  const offSide=st[1]-st[3]>=30&&megas.some(q=>q.st[3]>q.st[1])?2:st[3]-st[1]>=30&&megas.some(q=>q.st[1]>q.st[3])?1:0;
  const out=mv.filter(([n])=>{if(bad(n))return false;if(!offSide)return true;const m=mvByName.get(n);return !(m&&m.cat===offSide&&m.bp>0)});return out.length>=3?out:[]}
let setCache=new Map();
// pref: which doubles list leads ('ingame', 'tour' or 'ladder'); defaults to the one picked on the Meta tab.
// fmt 'singles' is still live: the page is doubles only, but singles sets are the fallback when doubles has none (OTHER()).
function setFor(p,fmt,pref){fmt=fmt||S.format;pref=fmt==='singles'?'ingame':(pref||ui.metaSrc);
  const bk=fmt+'|'+pref+'|'+metaVersion;let bucket=setCache.get(bk);if(!bucket){bucket=new Map();setCache.set(bk,bucket)}const hit=bucket.get(p.n);if(hit)return hit;
  const sd=sdRow(p,fmt),gm=gameRow(p,fmt),C=[];
  if(fmt==='singles'){C.push(['live',findIn(META.singles,p,true)]);if(p.m)C.push(['sd',sd]);C.push(['live',findIn(META.singles,p)],['game',gm])}
  else{if(pref!=='ingame')C.push([pref,findIn(META[SRC[pref]],p,true)]);
    C.push(['live',findIn(META[SRC.ingame],p,true)]);if(p.m)C.push(['sd',sd]);C.push(['live',findIn(META[SRC.ingame],p)],['game',gm]);
    for(const k of ['tour','ladder'])if(k!==pref)C.push([k,findIn(META[SRC[k]],p,true)])}
  if(!p.m)C.push(['sd',sd]);
  const learn=new Set((LEARN[p.n]||[]).map(k=>MV[k].name));
  const clean={mv:a=>a.filter(([n])=>learn.has(n)),it:a=>p.m?[]:a.filter(([n])=>!STONE_RE.test(n)||n==='Eviolite'),ab:a=>a.filter(([n])=>p.a.includes(n)),na:a=>a,tm:a=>a.filter(([n])=>byName.has(n)&&n!==p.n)};
  const out={src:{},sd:null,shared:!!(gm&&gm.shared)};
  for(const f of ['mv','it','ab','na','tm']){out[f]=[];for(const [src,row] of C){if(!row||!row[f]||!row[f].length)continue;const v=clean[f](row[f]);if(!v.length)continue;out[f]=v;out.src[f]=src;if(src==='sd')out.sd=row;break}}
  if(!p.m&&out.mv.length&&out.src.mv!=='sd')out.mv=dropMegaMoves(p,out.mv);
  if(p.m){out.it=[[stoneFor(p),null]];out.src.it='mega';out.ab=[[p.a[0],null]];out.src.ab='mega'}
  if(gm&&gm.partial&&out.src.mv!=='sd')out.partial=true;
  bucket.set(p.n,out);return out}
// Words for where a field came from.
function srcWord(src,fmt){return {live:'in-game',game:'in-game',sd:'Showdown 1630+',tour:'tournament',ladder:'Showdown ladder',mega:'',other:(fmt||OTHER())}[src]||''}
// Kept for callers that want "the meta row": the merged set.
function metaEntry(p){return setFor(p)}
const FMT=f=>f==='singles'?'Singles':'Doubles';
const megaGoal=()=>[0,1,2].includes(S.megaGoal)?S.megaGoal:2;
const megaCount=t=>t.filter(m=>m.mega).length;
// Megas the team is still short of: those it has, plus one per open slot, against the goal
const megaShort=(t,slots=6)=>Math.max(0,megaGoal()-megaCount(t)-Math.max(0,slots-t.length));
function fixTeams(){S.teams=(Array.isArray(S.teams)?S.teams:[]).filter(t=>t&&Array.isArray(t.slots)).slice(0,10).map((t,i)=>({
  id:typeof t.id==='string'&&/^[\w-]{1,40}$/.test(t.id)?t.id:'t'+Date.now().toString(36)+i,name:str(t.name,40)||'Untitled team',slots:normSlots(t.slots),format:t.format==='singles'?'singles':'doubles',saved:num(t.saved)||0}));
  if(!S.teams.some(t=>t.id===S.loadedId))S.loadedId=null;
  S.box=(Array.isArray(S.box)?S.box:[]).filter(b=>typeof b==='string'&&byName.has(b)&&!byName.get(b).m).slice(0,400);
  if(S.boxV!==2){S.box=[...new Set(S.box.map(b=>b==='Rotom'?'Rotom-Wash':b))];S.boxV=2}
  if(S.megaV!==1){S.maxMega=2;S.megaV=1}
  // how many Megas the team should carry: plans, additions and Build for me aim for exactly this many
  if(![0,1,2].includes(S.megaGoal))S.megaGoal=S.maxMega===1?1:2;
  S.excl=[...new Set((Array.isArray(S.excl)?S.excl:[]).filter(n=>typeof n==='string'&&byName.has(n)))].slice(0,100)}
// One shape for every team slot, live or saved: a known Pokémon, a string ability, a lock. Moves come from the meta.
// Custom moves are kept per format: {doubles:[4 names], singles:[4 names]}. No entry means "use the popular set".
// The singles entries come from the retired singles mode; they're kept so stored user data is never lost.
function normMv(mv){if(!mv||typeof mv!=='object'||Array.isArray(mv))return null;const o={};
  for(const f of ['doubles','singles']){const a=mv[f];if(!Array.isArray(a))continue;const c=a.slice(0,4).map(x=>typeof x==='string'&&mvByName.has(x)?x:'');while(c.length<4)c.push('');if(c.some(Boolean))o[f]=c}
  return Object.keys(o).length?o:null}
function normSlots(arr){const out=(Array.isArray(arr)?arr:[]).slice(0,6).map(s=>s&&typeof s==='object'?s:{}).map(s=>{const o={n:byName.has(s.n)?s.n:'',a:typeof s.a==='string'?s.a:null,lock:!!s.lock};const mv=o.n&&normMv(s.mv);if(mv)o.mv=mv;
    // held items per format ({doubles:'Sitrus Berry'}), kept only as short plain strings
    if(o.n&&s.it&&typeof s.it==='object'){const it={};for(const f of ['doubles','singles'])if(typeof s.it[f]==='string'&&s.it[f]&&s.it[f].length<=40)it[f]=s.it[f];if(Object.keys(it).length)o.it=it}return o});
  while(out.length<6)out.push(blank());return out}
// Battle log entries: {t: time, r: 'W'|'L', b: the 4 brought (leads first), tm: the team's 6, o: opponent's Pokémon}
function fixLog(){S.log=(Array.isArray(S.log)?S.log:[]).filter(e=>e&&(e.r==='W'||e.r==='L')&&Array.isArray(e.b)).slice(-400).map(e=>({t:+e.t||0,r:e.r,b:e.b.filter(n=>typeof n==='string'&&byName.has(n)).slice(0,4),tm:(Array.isArray(e.tm)?e.tm:[]).filter(n=>typeof n==='string'&&byName.has(n)).slice(0,6),o:(Array.isArray(e.o)?e.o:[]).filter(n=>typeof n==='string'&&byName.has(n)).slice(0,6)}))}
function fixSlots(){S.slots=normSlots(S.slots);S.opp=(Array.isArray(S.opp)?S.opp:[]).slice(0,6).map(n=>typeof n==='string'&&byName.has(n)?n:'');while(S.opp.length<6)S.opp.push('')}
fixSlots();fixTeams();fixLog();
for(const k of ['doubles','doubles_ingame','doubles_tour','singles'])META[k]=cleanMeta(META[k]);
META.teams=cleanTeams(META.teams);META.history=cleanHistory(META.history);
let ui={recSrc:LS.get('cc2.recsrc','box')==='all'?'all':'box',abSrc:LS.get('cc2.absrc','box')==='all'?'all':'box',pool:['box','boxfill','all'].includes(LS.get('cc2.pool',''))?LS.get('cc2.pool',''):'boxfill',setMon:LS.get('cc2.setMon',null),setSrc:'ingame',metaSrc:'ingame',sort:'recent',confirmDel:null,renaming:null,saving:false};

// "Data from …" in the header: the newest date any data document carries.
const DATA_AT={};
function noteDataDate(k,v){try{const t=v&&(v.updated||v.pulled||v.date);const ms=t?Date.parse(String(t).length===10?t+'T12:00:00':t):NaN;if(!isNaN(ms))DATA_AT[k]=ms;showDataDate()}catch(e){}}
function dataDateText(){const ts=Object.values(DATA_AT);if(!ts.length)return '';const last=Math.max(...ts),days=Math.floor((Date.now()-last)/864e5);
  return 'Data from '+new Date(last).toLocaleDateString('en-US',{month:'short',day:'numeric'})+(days>2?' ('+days+' days old)':'')}
function showDataDate(){try{if(typeof renderHealth==='function')renderHealth()}catch(e){}const t=dataDateText();if(!t)return;const el=document.getElementById('eyebrow');
  if(el&&!el.querySelector('.datadate')){const sp=document.createElement('span');sp.className='datadate';el.append(' · ',sp)}
  if(el)el.querySelector('.datadate').textContent=t;const sf=document.getElementById('sideFoot');if(sf)sf.textContent='Pokémon Champions · Reg M-C · '+t}

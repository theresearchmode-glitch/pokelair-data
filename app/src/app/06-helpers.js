// ---------- helpers ----------
function memberOf(s,i){const p=byName.get(s.n);if(!p)return null;const ab=s.a&&p.a.includes(s.a)?s.a:(metaAbility(p)||bestAbility(p));
  const sm=slotMoves(s,p),hi=slotItem(s,p);return {i,p,name:p.n,d:p.d,types:p.t,ability:ab,mega:p.m,base:p.b,moves:sm.moves,custom:sm.custom,item:hi||defaultItem(p),heldItem:hi}}
// Held item: a Mega's stone is fixed; otherwise your pick for this format (s.it[format]) or the item most players run.
function defaultItem(p){try{if(p.m)return stoneFor(p)||'';const t=topItems(p);return t&&t.it[0]?t.it[0][0]:''}catch(e){return ''}}
function slotItem(s,p){if(p.m)return null;const c=s.it&&s.it[S.format];return c&&typeof c==='string'?c:null}
// Choice Scarf works against your own Trick Room: under it the faster Pokémon moves last, so the Scarf only makes its holder slower.
function scarfTrClash(ms){const tr=ms.filter(m=>(m.moves||[]).some(x=>x&&x.name==='Trick Room'));if(!tr.length)return null;
  const sc=ms.filter(m=>m.item==='Choice Scarf');return sc.length?{tr,sc}:null}
function clashText(c){const n=a=>a.map(m=>esc(m.d)).join(', ');const self=c.sc.length===1&&c.tr.length===1&&c.sc[0]===c.tr[0];
  return self?`${n(c.sc)} holds Choice Scarf and sets Trick Room. Once Trick Room is up, the Scarf makes it move later, and it stays locked into Trick Room until it switches. Give it a different item.`
    :`${n(c.sc)} hold${c.sc.length===1?'s':''} Choice Scarf, but ${n(c.tr)} sets Trick Room. Under Trick Room the slowest moves first, so the Scarf makes ${c.sc.length===1?'it':'them'} move later. Pick a different item, or drop Trick Room.`}
// The 4 moves a slot runs in the current format: your edits if you made any, else the popular set.
function slotMoves(s,p){const learn=new Set((LEARN[p.n]||[]).map(k=>MV[k].name));const c=s.mv&&s.mv[S.format];
  if(c){const names=c.map(x=>learn.has(x)?x:'');if(names.some(Boolean))return {names,moves:names.map(x=>mvByName.get(x)).filter(Boolean),custom:true}}
  const pm=popularMoves(p).slice(0,4);const names=pm.map(m=>m.name);while(names.length<4)names.push('');return {names,moves:pm,custom:false}}
const members=()=>S.slots.map(memberOf).filter(Boolean);
// Item Clause (VGC): no two Pokémon may hold the same item. The Team Score (strengthX) reads the team through this: items
// you picked stay as you picked them (two of the same makes the team illegal, see itemClause); a member on its default
// (most-used) item takes the most-used item nobody else on the team holds. Mega Stones are fixed.
// A default is also never an item that can't work on this team (a Terrain Seed nothing activates, Room Service with no
// Trick Room): those only count against a team when you picked them yourself.
function resolveItems(ms){if(!Array.isArray(ms))return ms;const used=new Set();for(const m of ms)if(m&&(m.heldItem||(m.p&&m.p.m))&&m.item)used.add(m.item);
  const ok=it=>it&&!used.has(it)&&itemWorks(ms,it);
  return ms.map(m=>{if(!m||m.heldItem||(m.p&&m.p.m)||!m.item)return m;if(ok(m.item)){used.add(m.item);return m}
    let alt='';try{const t=topItems(m.p);for(const r of (t&&t.it)||[]){const n=Array.isArray(r)?r[0]:r;if(ok(n)){alt=n;break}}}catch(e){}
    if(alt)used.add(alt);return {...m,item:alt,itemAuto:true}})}
function itemWorks(ms,it){if(SEED_T[it])return terrainSet(ms,SEED_T[it]);if(ROCK_W[it])return weatherSet(ms,ROCK_W[it]);if(it==='Room Service')return !!trPlan(ms);return true}
// weather rocks only extend a weather someone on the team sets (by ability or move)
const ROCK_W={'Damp Rock':'rain','Heat Rock':'sun','Smooth Rock':'sand','Icy Rock':'snow'},W_MOVE={rain:'Rain Dance',sun:'Sunny Day',sand:'Sandstorm',snow:'Snowscape'};
const weatherSet=(ms,w)=>(ms||[]).some(m=>m&&((typeof WEATHER_OF==='object'&&WEATHER_OF[m.ability]===w)||mvNames(m).includes(W_MOVE[w])));
const terrainSet=(ms,t)=>(ms||[]).some(m=>m&&(m.ability===t+' Surge'||mvNames(m).includes(t+' Terrain')||(t==='Electric'&&m.ability==='Hadron Engine')));
// Items you picked that break the Item Clause: [[item, [members holding it]]]
function itemClause(ms){const by=new Map();for(const m of ms||[]){const it=m&&m.heldItem;if(!it)continue;if(!by.has(it))by.set(it,[]);by.get(it).push(m)}
  return [...by].filter(([,a])=>a.length>1)}
const mvNames=m=>((m&&m._mv&&m._mv.length?m._mv:m&&m.moves)||[]).map(x=>x&&x.name).filter(Boolean);
// Trick Room plan: who sets it, who is slow enough to use it (base Speed 60 or less, the setter included) and whether the
// team also runs Tailwind (then Trick Room is a second mode, not the plan). Real Limitless teams (Oct 27): teams whose
// only speed control is Trick Room won 47.9% of games with 0-1 slow members vs 50.7% with 2-3.
const TR_SLOW=60;
function trPlan(ms){ms=ms||[];const set=ms.filter(m=>mvNames(m).includes('Trick Room'));if(!set.length)return null;
  return {set,slow:ms.filter(m=>m.p&&m.p.st&&m.p.st[5]<=TR_SLOW),tw:ms.some(m=>mvNames(m).includes('Tailwind')),scarf:ms.filter(m=>m.item==='Choice Scarf')}}
// Items that can't work on this team: a Terrain Seed with nothing that sets its terrain (so it, and an Unburden it was
// meant to trigger, never activate), or Room Service with no Trick Room. [{m, why}]
const SEED_T={'Psychic Seed':'Psychic','Electric Seed':'Electric','Grassy Seed':'Grassy','Misty Seed':'Misty'};
function deadItems(ms){ms=ms||[];const out=[];
  for(const m of ms){const it=m&&m.heldItem;if(!it)continue;
    if(SEED_T[it]&&!terrainSet(ms,SEED_T[it]))out.push({m,why:`${m.d}'s ${it} never activates: nothing on the team sets ${SEED_T[it]} Terrain${m.ability==='Unburden'?' (so Unburden never triggers)':''}`});
    if(ROCK_W[it]&&!weatherSet(ms,ROCK_W[it]))out.push({m,why:`${m.d}'s ${it} does nothing: nothing on the team sets ${ROCK_W[it]==='sun'?'sun':ROCK_W[it]}`});
    if(it==='Room Service'&&!trPlan(ms))out.push({m,why:`${m.d}'s Room Service needs Trick Room, and nothing sets it`})}
  return out}
// Box ownership: every regular form is caught separately (Wash Rotom is not Heat Rotom); a Mega comes from its base form.
const ownKey=p=>p.m?(p.b==='Floette'?'Floette-Eternal':p.b):p.n;
const inBox=p=>!!p&&S.box.includes(ownKey(p));
// Never-suggest list: excluding a Pokémon also excludes its Megas; excluding a Mega excludes only that Mega.
// Where suggestions come from: box only, box first then the roster, or the full roster; minus excluded Pokémon.
function suggestPool(){return (ui.pool==='box'?ROSTER.filter(inBox):ROSTER).filter(p=>!isExcl(p)&&!isTrap(p))}
const isExcl=p=>!!p&&(S.excl.includes(p.n)||(!!p.m&&S.excl.includes(ownKey(p))));
function modText(ab){const m=ABILITY_MODS[ab];if(!m)return'';return Object.entries(m).map(([t,v])=>v===0?`Immune to ${t}`:v<1?`Takes ½ from ${t}`:`Takes ${v}× from ${t}`).join(' · ')}
// Plain words for leftover weaknesses (more of your Pokémon weak to a type than resist it), used on pills.
// Phone layout: shorter lists and folded details so pages don't run on forever.
const PHONE=()=>{try{return !!(window.matchMedia&&window.matchMedia('(max-width:760px)').matches)}catch(e){return false}};
const wsTxt=a=>a.excess?`${a.excess} extra weakness${a.excess>1?'es':''}`:'No extra weaknesses';
const RC=x=>['b0','b1','b2','b3','b4'][Math.min(x,4)];
// Type-shape numbers behind the checklist, measured the same way on 377 real tournament teams (doubles).
// Defense points: type stacks, unresisted types, and how much of the meta hits 3+ of your Pokémon super effectively.
// Offense: share of the meta (usage-weighted top 30) that 2+ of your Pokémon hit super effectively, nudged by type coverage.
function proGrades(ms,useA){const th=metaThreats();if(!ms.length||!th.length)return null;const ctx=teamContext(useA?ms:[]),per=ms.map(m=>vsThreats(m,ctx,useA,th));
  const W=th.reduce((a,o)=>a+o.w,0)||1;let se2=0,danger=0;const thin=[];th.forEach((o,j)=>{const nh=per.filter(x=>x[j].off&&x[j].off.x>=2).length;if(nh>=2)se2+=o.w;else thin.push({o,nh});if(per.filter(x=>x[j].def&&x[j].def.x>=2).length>=3)danger+=o.w});se2/=W;danger/=W;
  const a=analyze(ms,useA),sh=typeShape(a),un=a.unresisted.length;
  const dp=(sh.maxStack>=3?2:sh.maxStack===2?1:0)+(sh.w3>=2?2:sh.w3)+(un>=2?1:0)+(danger>.66?1:danger>.56?.5:0);
  const dg=dp===0?0:dp<=1?1:dp<=2?2:dp<=3.5?3:4;
  const off=offenseCount(ms.flatMap(m=>attackEntries({...m,ability:useA?m.ability:null},m._mv||memberMoves(m).moves,ctx)));
  const oc=se2+(off>=18?.03:off>=17?0:-.05),og=oc>=.782?0:oc>=.747?1:oc>=.673?2:oc>=.577?3:4; // tournament p90/p75/p50/p25 (4-move sets)
  thin.sort((x,y)=>y.o.w-x.o.w);
  return {dg,og,se2,danger,dp,thin,full:ms.length===6}}
// Winning-team checklist: plain yes/no checks for what recent event winners usually have (rates measured live, see proLine).
// No check predicts wins on its own; they flag gaps, not quality.
function proChecks(ms,useA,opts){if(!ms.length)return null;const PG=proGrades(ms,useA);const a=analyze(ms,useA),sh=typeShape(a),out=[];
  const fullMs=ms.map(m=>m._mv&&m._mv.length?m:{...m,_mv:memberMoves(m).moves});
  {let gp=null;try{gp=gamePlan(fullMs)}catch(e){}const sp=gp&&gp.rows.find(r=>r.k==='speed')||{};
    out.push({k:'speed',ok:sp.st==='ok',part:sp.st==='part',label:'Speed control',have:(sp.who||'')+(sp.st==='part'?' (only some sets run it)':''),miss:'No reliable way to change turn order: add Tailwind or Trick Room (or a weather speed core). Icy Wind and Electroweb help, but only as backup.',pro:proLine('speed','97% of event winners')});
    const su=spreadUsers(fullMs);out.push({k:'spread',ok:su>=1,label:'Spread damage',have:su+' Pokémon with moves that hit both foes'+(su===1?' (most teams have 2)':''),miss:'No moves that hit both foes at once.',pro:proLine('spread','97% of event winners')});
    const fi=fullMs.filter(m=>m.ability==='Intimidate'||relMove(m,ROLE.fake)[0]>=.3||relMove(m,ROLE.redir)[0]>=.3).map(m=>m.d);
    out.push({k:'fake',ok:fi.length>0,label:'Lead support',have:fi.join(', ')+' (Fake Out, Intimidate or redirection)',miss:'No Fake Out, Intimidate, Follow Me or Rage Powder to protect your attackers.',pro:proLine('fake','89% of event winners')});
    const mc=megaCount(ms);if(opts&&opts.itemsUnknown&&!mc){const can=ms.filter(m=>ROSTER.some(q=>q.m&&q.b===m.p.b)).map(m=>m.d);
      out.push({k:'mega',skip:true,ok:false,label:'Mega Evolution',have:'',miss:can.length?`Held items aren't listed for this team, so we can't tell which Pokémon Mega Evolved. Could Mega: ${can.join(', ')}.`:'Held items aren\'t listed, and none of these Pokémon can Mega Evolve.',pro:'Not counted'})}
    else out.push({k:'mega',ok:mc>=Math.min(1,megaGoal())||megaGoal()===0,label:'Mega Evolution',have:mc+' Mega'+(mc===1?'':'s')+(mc>1?' (you can only Mega one per game)':''),miss:'No Mega.',pro:proLine('mega','100% of event winners (81% bring 2)')});}
  const worst=a.rows.slice().sort((x,y)=>(y.w-y.r)-(x.w-x.r))[0];
  out.push({k:'stack',ok:sh.maxStack<=2,label:'No major weak spot',have:'No attack type hits 3+ more of yours than resist it',miss:worst?`${worst.atk} hits ${worst.w} of yours and only ${worst.r} resist${worst.r===1?'s':''}.`:'',pro:proLine('stack','91% of event winners')});
  const big=a.rows.filter(r=>r.w>=3).map(r=>r.atk);
  out.push({k:'w3',ok:sh.w3<=1,label:'Weak spots spread out',have:big.length?`Only ${big[0]} hits 3+ of yours`:'No type hits 3+ of yours',miss:`${big.join(' and ')} each hit 3+ of yours.`,pro:proLine('w3','78% of event winners')});
  if(PG){const pc=Math.round(PG.se2*100);out.push({k:'reach',ok:PG.se2>=.6,part:PG.se2>=.55,label:'Pressure on the meta',have:`2+ of yours hit ${pc}% of the top 30 super effectively`,miss:`2+ of yours hit only ${pc}% of the top 30 super effectively${ckWin.se2med!=null?` (recent event winners: ${Math.round(ckWin.se2med*100)}% at the median)`:''}.`,pro:proLine('reach','94% of event winners')})}
  out.forEach(x=>{if(x.part&&!x.ok){x.ok=true;x.soft=true}});const cnt=out.filter(x=>!x.skip);return {items:out,pass:cnt.filter(x=>x.ok).length,n:cnt.length,full:ms.length===6,PG}}
const ckIcon=x=>x.skip?'<span class="ck unk" aria-label="unknown">?</span>':x.soft?'<span class="ck part" aria-label="partly">~</span>':x.ok?'<span class="ck ok" aria-label="yes">✓</span>':x.part?'<span class="ck part" aria-label="partly">~</span>':'<span class="ck no" aria-label="no">✗</span>';
function teamRating(slots){const ms=slots.map(memberOf).filter(Boolean);return {ms,a:analyze(ms,true)}}
// toast(text, true) adds an Undo button (and stays up longer) for changes that replace team members
function toast(t,undo){const el=$('toast');el.innerHTML=esc(t)+(undo&&ui.undo?' <button type="button" class="tundo" id="toastUndo">Undo</button>':'');el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,undo?6000:2200)}
// remember the team before a change, so Undo can put it back
function keepUndo(){ui.undo={slots:JSON.parse(JSON.stringify(S.slots)),loadedId:S.loadedId}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#toastUndo');if(!b||!ui.undo)return;const u=ui.undo;ui.undo=null;
  S.slots=u.slots;fixSlots();S.loadedId=u.loadedId;keepScroll(()=>render());toast('Change undone')});

// How often recent event winners pass each check, measured live from the Events data (each winner's real team and moves),
// so the claims under the checklist stay true as the meta moves. Computed in small idle chunks after the data loads.
let ckWin={key:null,rates:null,two:null,busy:false,wmed:null};
// Before the live rates are measured (or with too few winners), no number is shown: never a stale hard-coded one.
function proLine(k,fb){const r=ckWin.rates&&ckWin.rates[k];if(!r||r[1]<20)return 'most recent event winners';
  return `${Math.round(100*r[0]/r[1])}% of ${r[1]} recent event winners${k==='mega'&&ckWin.two!=null?` (${Math.round(100*ckWin.two/r[1])}% bring 2)`:''}`}
// Team Score's track record, measured live: inside each recent event's top cut, take every pair of teams that finished in
// different places and check whether the one with the higher Team Score finished higher. 50% would mean no better than a
// coin flip. Computed in small idle chunks; refreshed whenever the events, the model or the meta data change.
let tsTrack={key:null,busy:false,res:null};
function trackRefresh(){const E=META.events;if(!E||!modelOK())return;const key=E.updated+'|'+E.events.length+'|'+metaVersion;if(tsTrack.key===key||tsTrack.busy)return;
  tsTrack.busy=true;const evs=E.events.slice();let i=0,agree=0,pairs=0,nev=0;
  const mk=t=>t.mons.map(m=>{const p=byName.get(m.n);const mv=(m.mv||[]).map(x=>mvByName.get(x)).filter(Boolean);const it=!p.m&&m.i&&typeof m.i==='string'?m.i:null;return {...memberFrom(p,p.a.includes(m.a)?m.a:undefined),i:-1,p,d:p.d,moves:mv,_mv:mv,custom:true,heldItem:it,item:it||defaultItem(p),mega:p.m,base:p.b,types:p.t}});
  const step=()=>{const t0=Date.now();try{while(i<evs.length&&Date.now()-t0<15){const ev=evs[i++];
      const sc=(ev.top||[]).filter(t=>t&&t.mons&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n))).map(t=>({pl:t.place,s:tsOf(mk(t))})).filter(x=>x.s!=null);if(sc.length>=2)nev++;
      for(let a=0;a<sc.length;a++)for(let b=a+1;b<sc.length;b++){const A=sc[a],B=sc[b];if(A.pl===B.pl||A.s===B.s)continue;pairs++;if((A.s>B.s)===(A.pl<B.pl))agree++}}}
    catch(e){tsTrack.busy=false;return}
    if(i<evs.length){setTimeout(step,30);return}
    tsTrack={key,busy:false,res:pairs>=200?{acc:agree/pairs,pairs,events:nev}:null};safe('track record',()=>render())};
  setTimeout(step,1200)}
// one plain sentence for the track record, or '' before it's measured
function trackLine(){const r=tsTrack.res;if(!r)return '';return `Track record: in ${r.events} recent events, the team with the higher Team Score finished higher in ${Math.round(r.acc*100)}% of ${r.pairs.toLocaleString('en-US')} head-to-head pairs (50% would be a coin flip).`}
function ckWinRefresh(){const E=META.events;if(!E)return;const key=E.updated+'|'+E.events.length+'|'+metaVersion+'|'+megaGoal()+'|'+modelOK();if(ckWin.key===key||ckWin.busy)return;
  const list=E.events.map(ev=>ev.top[0]).filter(t=>t&&t.place===1&&t.mons.length===6&&t.mons.every(m=>byName.get(m.n)));if(list.length<20)return;
  ckWin.busy=true;const acc={},wts=[],se2s=[];let i=0,two=0,n=0;
  const step=()=>{const t0=Date.now();try{while(i<list.length&&Date.now()-t0<12){const t=list[i++];
      // each winner read with its own moves and held item, as registered
      const ms=t.mons.map(m=>{const p=byName.get(m.n);const mv=m.mv.map(x=>mvByName.get(x)).filter(Boolean);const it=!p.m&&m.i&&typeof m.i==='string'?m.i:null;return {...memberFrom(p,p.a.includes(m.a)?m.a:undefined),i:-1,p,d:p.d,moves:mv,_mv:mv,custom:true,heldItem:it,item:it||defaultItem(p),mega:p.m,base:p.b,types:p.t}});
      if(typeof tsOf==='function'){const t=tsOf(ms);if(t!=null)wts.push(t)}
      const CK=proChecks(ms,true);if(!CK)continue;n++;if(CK.PG&&isFinite(CK.PG.se2))se2s.push(CK.PG.se2);for(const x of CK.items){if(x.skip)continue;const a=acc[x.k]||(acc[x.k]=[0,0]);a[1]++;if(x.ok)a[0]++}if(ms.filter(m=>m.p.m).length===2)two++}}
    catch(e){ckWin.busy=false;return}
    if(i<list.length){setTimeout(step,30);return}
    wts.sort((a,b)=>a-b);se2s.sort((a,b)=>a-b);ckWin={key,rates:acc,two,busy:false,wmed:wts.length>=20?wts[wts.length>>1]:null,wq75:wts.length>=20?wts[Math.floor(wts.length*.75)]:null,se2med:se2s.length>=20?se2s[se2s.length>>1]:null,track:ckWin.track||null};safe('checklist claims',()=>render())};
  setTimeout(step,400)}

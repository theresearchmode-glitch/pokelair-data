// ---------- helpers ----------
function memberOf(s,i){const p=byName.get(s.n);if(!p)return null;const ab=s.a&&p.a.includes(s.a)?s.a:(metaAbility(p)||bestAbility(p));
  const sm=slotMoves(s,p);return {i,p,name:p.n,d:p.d,types:p.t,ability:ab,mega:p.m,base:p.b,moves:sm.moves,custom:sm.custom}}
// The 4 moves a slot runs in the current format: your edits if you made any, else the popular set.
function slotMoves(s,p){const learn=new Set((LEARN[p.n]||[]).map(k=>MV[k].name));const c=s.mv&&s.mv[S.format];
  if(c){const names=c.map(x=>learn.has(x)?x:'');if(names.some(Boolean))return {names,moves:names.map(x=>mvByName.get(x)).filter(Boolean),custom:true}}
  const pm=popularMoves(p).slice(0,4);const names=pm.map(m=>m.name);while(names.length<4)names.push('');return {names,moves:pm,custom:false}}
const members=()=>S.slots.map(memberOf).filter(Boolean);
// Box ownership: every regular form is caught separately (Wash Rotom is not Heat Rotom); a Mega comes from its base form.
const ownKey=p=>p.m?(p.b==='Floette'?'Floette-Eternal':p.b):p.n;
const inBox=p=>!!p&&S.box.includes(ownKey(p));
// Never-suggest list: excluding a Pokémon also excludes its Megas; excluding a Mega excludes only that Mega.
// Pokémon on your saved teams for the other format (their sets are trained for that format).
function savedOther(){const o=S.format==='singles'?'doubles':'singles',set=new Set();S.teams.filter(t=>t.format===o).forEach(t=>t.slots.forEach(x=>{const q=byName.get(x.n);if(q)set.add(ownKey(q))}));return set}
// Where suggestions come from: box only, box first then the roster, or the full roster; minus excluded and (optionally) saved Pokémon.
function suggestPool(){const so=ui.exclSaved?savedOther():null;
  return (ui.pool==='box'?ROSTER.filter(inBox):ROSTER).filter(p=>!isExcl(p)&&!isTrap(p)&&!(so&&so.has(ownKey(p))))}
const isExcl=p=>!!p&&(S.excl.includes(p.n)||(!!p.m&&S.excl.includes(ownKey(p))));
function modText(ab){const m=ABILITY_MODS[ab];if(!m)return'';return Object.entries(m).map(([t,v])=>v===0?`Immune to ${t}`:v<1?`Takes ½ from ${t}`:`Takes ${v}× from ${t}`).join(' · ')}
function srPct(m){if(m.ability==='Magic Guard')return 0;return 12.5*mult('Rock',m.types,null,false)}
function srTag(m){const v=srPct(m);return v>=50?`<span class="sr hi">Rocks ${v}%</span>`:v>=25?`<span class="sr mid">Rocks ${v}%</span>`:''}
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
// Winning-team checklist: plain yes/no checks for what 70%+ win-rate tournament teams (61 of 377) usually have.
// No check predicts wins on its own; they flag gaps, not quality.
function proChecks(ms,useA,opts){if(!ms.length)return null;const PG=proGrades(ms,useA);const a=analyze(ms,useA),sh=typeShape(a),dbl=S.format==='doubles',out=[];
  const fullMs=ms.map(m=>m._mv&&m._mv.length?m:{...m,_mv:memberMoves(m).moves});
  if(dbl){let gp=null;try{gp=gamePlan(fullMs)}catch(e){}const sp=gp&&gp.rows.find(r=>r.k==='speed')||{};
    out.push({k:'speed',ok:sp.st==='ok',part:sp.st==='part',label:'Speed control',have:(sp.who||'')+(sp.st==='part'?' (only some sets run it)':''),miss:'Nothing to change turn order: add Tailwind, Trick Room, Icy Wind or Electroweb.',pro:'All 61 winning teams'});
    const su=spreadUsers(fullMs);out.push({k:'spread',ok:su>=1,label:'Spread damage',have:su+' Pokémon with moves that hit both foes'+(su===1?' (most teams have 2)':''),miss:'No moves that hit both foes at once.',pro:'92% of winning teams'});
    const fi=fullMs.filter(m=>m.ability==='Intimidate'||relMove(m,ROLE.fake)[0]>=.3||relMove(m,ROLE.redir)[0]>=.3).map(m=>m.d);
    out.push({k:'fake',ok:fi.length>0,label:'Lead support',have:fi.join(', ')+' (Fake Out, Intimidate or redirection)',miss:'No Fake Out, Intimidate, Follow Me or Rage Powder to protect your attackers.',pro:'84% of winning teams'});
    const mc=megaCount(ms);if(opts&&opts.itemsUnknown&&!mc){const can=ms.filter(m=>ROSTER.some(q=>q.m&&q.b===m.p.b)).map(m=>m.d);
      out.push({k:'mega',skip:true,ok:false,label:'Mega Evolution',have:'',miss:can.length?`Held items aren't listed for this team, so we can't tell which Pokémon Mega Evolved. Could Mega: ${can.join(', ')}.`:'Held items aren\'t listed, and none of these Pokémon can Mega Evolve.',pro:'Not counted'})}
    else out.push({k:'mega',ok:mc>=Math.min(1,megaGoal())||megaGoal()===0,label:'Mega Evolution',have:mc+' Mega'+(mc===1?'':'s')+(mc>1?' (you can only Mega one per game)':''),miss:'No Mega.',pro:'100% of winning teams (82% bring 2)'});}
  const worst=a.rows.slice().sort((x,y)=>(y.w-y.r)-(x.w-x.r))[0];
  out.push({k:'stack',ok:sh.maxStack<=2,label:'No major weak spot',have:'No attack type hits 3+ more of yours than resist it',miss:worst?`${worst.atk} hits ${worst.w} of yours and only ${worst.r} resist${worst.r===1?'s':''}.`:'',pro:dbl?'90% of winning teams':''});
  const big=a.rows.filter(r=>r.w>=3).map(r=>r.atk);
  out.push({k:'w3',ok:sh.w3<=1,label:'Weak spots spread out',have:big.length?`Only ${big[0]} hits 3+ of yours`:'No type hits 3+ of yours',miss:`${big.join(' and ')} each hit 3+ of yours.`,pro:dbl?'82% of winning teams':''});
  if(PG){const pc=Math.round(PG.se2*100);out.push({k:'reach',ok:PG.se2>=.6,part:PG.se2>=.55,label:'Pressure on the meta',have:`2+ of yours hit ${pc}% of the top 30 super effectively`,miss:`2+ of yours hit only ${pc}% of the top 30 super effectively (winners usually 55%+).`,pro:dbl?'92% of winning teams reach 55%':''})}
  out.forEach(x=>{if(x.part&&!x.ok){x.ok=true;x.soft=true}});const cnt=out.filter(x=>!x.skip);return {items:out,pass:cnt.filter(x=>x.ok).length,n:cnt.length,full:ms.length===6,PG}}
const ckIcon=x=>x.skip?'<span class="ck unk" aria-label="unknown">?</span>':x.soft?'<span class="ck part" aria-label="partly">~</span>':x.ok?'<span class="ck ok" aria-label="yes">✓</span>':x.part?'<span class="ck part" aria-label="partly">~</span>':'<span class="ck no" aria-label="no">✗</span>';
function teamRating(slots){const ms=slots.map(memberOf).filter(Boolean);return {ms,a:analyze(ms,true)}}
function toast(t){const el=$('toast');el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,2200)}

// ---------- damage calc + speed tiers (Champions: level 50, 31 IVs, stat points 0–32 add 1 point each) ----------
const NAT_UP={Atk:['Adamant','Lonely','Naughty','Brave'],Def:['Bold','Impish','Lax','Relaxed'],SpA:['Modest','Mild','Rash','Quiet'],SpD:['Calm','Gentle','Careful','Sassy'],Spe:['Timid','Jolly','Hasty','Naive']};
const NAT_DN={Atk:['Bold','Timid','Modest','Calm'],Def:['Lonely','Hasty','Mild','Gentle'],SpA:['Adamant','Impish','Jolly','Careful'],SpD:['Naughty','Lax','Rash','Naive'],Spe:['Brave','Relaxed','Quiet','Sassy']};
const STAT_IX={HP:0,Atk:1,Def:2,SpA:3,SpD:4,Spe:5};
function natMul(nat,stat){if(!nat)return 1;if((NAT_UP[stat]||[]).includes(nat))return 1.1;if((NAT_DN[stat]||[]).includes(nat))return .9;return 1}
function calcStat(p,stat,sp,mul){const b=p.st[STAT_IX[stat]];if(stat==='HP')return b+75+sp;return Math.floor((b+20+sp)*mul)}
function topNature(p){try{const st=setFor(p,'doubles');return st.na&&st.na.length?st.na[0][0]:null}catch(e){return null}}
function topItem(p){try{const st=setFor(p,'doubles');return st.it&&st.it.length?st.it[0]:null}catch(e){return null}}
const BOOST=s=>s>=0?(2+s)/2:2/(2-s);
// Likely speed from what players run: a +Spe nature means full speed, a −Spe nature means none, else full speed if fast, none if slow.
// The most common real spread for p on the Showdown ladder (Smogon stats): {nat, hp, atk, def, spa, spd, spe, pct}
function commonSpread(p){const d=META.doubles;if(!d)return null;const row=[...(d.top||[]),...(d.more||[])].find(t=>t.n===p.n);if(!row||!row.sp||!row.sp.length)return null;
  const [k,pct]=row.sp[0];const [nat,pts]=k.split(':');const v=pts.split('/').map(Number);if(v.length!==6||v.some(x=>!(x>=0&&x<=32)))return null;
  return {nat,hp:v[0],atk:v[1],def:v[2],spa:v[3],spd:v[4],spe:v[5],pct}}
const spreadText=s=>`${s.nat} ${s.hp}/${s.atk}/${s.def}/${s.spa}/${s.spd}/${s.spe}`;
function likelySpeed(p){const it=topItem(p),cs=commonSpread(p);const scarf=it&&it[0]==='Choice Scarf'&&(it[1]==null||it[1]>=25);
  if(cs){const v=calcStat(p,'Spe',cs.spe,natMul(cs.nat,'Spe'));return {v,scarf,label:`${cs.spe} Speed points, ${cs.nat} (most common spread)`,nat:cs.nat,real:true}}
  const nat=topNature(p);const up=(NAT_UP.Spe).includes(nat),dn=(NAT_DN.Spe).includes(nat);
  const sp=dn?0:(up||p.st[5]>=70)?32:0,mul=up?1.1:dn?.9:1;
  const v=calcStat(p,'Spe',sp,mul);return {v,scarf,label:(dn?'0 Speed points, Speed-lowering nature':up?'32 Speed points, Speed-boosting nature':sp?'32 Speed points':'0 Speed points')+(nat?`, ${nat} (estimated)`:' (estimated)'),nat}}
// ---- speed tiers ----
let spdUi={tw:false,twOpp:false,tr:false,icy:false};
function renderSpeed(){const el=$('spdOut');if(!el)return;
  const mine=members().map(m=>m.p),mineSet=new Set(mine.map(p=>p.n));
  const thr=metaThreats(24).map(x=>x.p||x).filter(p=>p&&p.st&&!mineSet.has(p.n)).slice(0,20);
  const myItem=new Map(members().map(m=>[m.p.n,m.item]));
  const rows=[...mine.map(p=>({p,me:true})),...thr.map(p=>({p,me:false}))].map(r=>{const s={...likelySpeed(r.p)};if(r.me)s.scarf=myItem.get(r.p.n)==='Choice Scarf';let v=s.v;if(s.scarf)v=Math.floor(v*1.5);
    if(r.me&&spdUi.tw)v*=2;if(!r.me&&spdUi.twOpp)v*=2;if(!r.me&&spdUi.icy)v=Math.floor(v*BOOST(-1));return {...r,s,v}});
  rows.sort((a,b)=>spdUi.tr?a.v-b.v:b.v-a.v);
  const tog=(k,t)=>`<button type="button" data-spd="${k}" aria-pressed="${!!spdUi[k]}">${t}</button>`;
  $('spdCtl').innerHTML=`<div class="seg" role="group" aria-label="Speed conditions">${tog('tw','Your Tailwind')}${tog('twOpp','Their Tailwind')}${tog('icy','Their −1 Speed')}${tog('tr','Trick Room')}</div>`;
  if(!mine.length){el.innerHTML='<div class="empty-note">Add Pokémon on the Team page to place them against the top threats.</div>';return}
  const sum=mine.map(p=>{const me=rows.find(r=>r.me&&r.p.n===p.n);const beat=rows.filter(r=>!r.me&&(spdUi.tr?r.v>me.v:r.v<me.v)).length;// speed target: the nearest threat just above you, and the Speed points (same nature) it takes to pass it
    let tip='';if(!spdUi.tr&&!spdUi.tw&&!spdUi.twOpp&&!spdUi.icy){const ls=likelySpeed(p),cs=commonSpread(p),nat=(cs&&cs.nat)||ls.nat,cur=cs?cs.spe:(ls.label.startsWith('32')?32:0),mult=myItem.get(p.n)==='Choice Scarf'?1.5:1;
      const above=rows.filter(r=>!r.me&&r.v>me.v).sort((a,b)=>a.v-b.v)[0];
      if(above){let need=null;for(let sp=cur;sp<=32;sp++){if(Math.floor(calcStat(p,'Spe',sp,natMul(nat,'Spe'))*mult)>above.v){need=sp;break}}
        tip=need!=null?` · <span class="spdtip">${need-cur} more Speed points (${need} total) outspeeds ${esc(above.p.d||above.p.n)}</span>`:` · <span class="spdtip">can't outspeed ${esc(above.p.d||above.p.n)} with this nature</span>`}}
    return `<span class="spdsum"><b>${esc(p.d||p.n)}</b> moves first against ${beat} of ${thr.length}${tip}</span>`}).join('');
  el.innerHTML=`<div class="spdsums">${sum}</div><div class="spdlist">${rows.map((r,i)=>{const tie=rows.some((o,j)=>j!==i&&o.v===r.v&&o.me!==r.me);
    return `<div class="spdrow${r.me?' me':''}"><span class="spdv">${r.v}</span>${sprite(r.p,'spdspr')}<span class="spdn"><b>${esc(r.p.d||r.p.n)}</b>${r.me?' <span class="tag spdme">YOU</span>':''}${tie?' <span class="tag spdtie">TIE</span>':''}<span class="t2">${esc(r.s.label)}${r.s.scarf?' · Choice Scarf':''} · base ${r.p.st[5]}</span></span></div>`}).join('')}</div>
    <p class="t2" style="margin-top:10px">Level 50 with 31 IVs. Natures and items are the most common ones players register; fast Pokémon are assumed to put 32 points in Speed. ${spdUi.tr?'Trick Room: the slowest moves first.':''}</p>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-spd]');if(!b)return;const k=b.dataset.spd;spdUi[k]=!spdUi[k];renderSpeed()});
// ---- damage ----
const TYPE_ITEM={Charcoal:'Fire','Mystic Water':'Water',Magnet:'Electric','Miracle Seed':'Grass','Never-Melt Ice':'Ice','Black Belt':'Fighting','Poison Barb':'Poison','Soft Sand':'Ground','Sharp Beak':'Flying','Twisted Spoon':'Psychic','Silver Powder':'Bug','Hard Stone':'Rock','Spell Tag':'Ghost','Dragon Fang':'Dragon','Black Glasses':'Dark','Metal Coat':'Steel','Fairy Feather':'Fairy','Silk Scarf':'Normal'};
const SKINS={Aerilate:'Flying',Pixilate:'Fairy',Refrigerate:'Ice',Galvanize:'Electric',Dragonize:'Dragon'};
const RESIST_BERRY={'Occa Berry':'Fire','Passho Berry':'Water','Wacan Berry':'Electric','Rindo Berry':'Grass','Yache Berry':'Ice','Chople Berry':'Fighting','Kebia Berry':'Poison','Shuca Berry':'Ground','Coba Berry':'Flying','Payapa Berry':'Psychic','Tanga Berry':'Bug','Charti Berry':'Rock','Kasib Berry':'Ghost','Haban Berry':'Dragon','Colbur Berry':'Dark','Babiri Berry':'Steel','Roseli Berry':'Fairy','Chilan Berry':'Normal'};
// 2–5 hit moves count 3 hits (the usual roll), 5 with Skill Link
const MULTI_HIT={'Bullet Seed':3,'Rock Blast':3,'Icicle Spear':3,'Scale Shot':3,'Tail Slap':3,'Pin Missile':3,'Water Shuriken':3,'Bone Rush':3,'Arm Thrust':3,'Dual Wingbeat':2,'Double Hit':2,'Dragon Darts':2,'Surging Strikes':3,'Triple Axel':3,'Triple Kick':3,'Population Bomb':10,'Bonemerang':2,'Double Kick':2,'Twin Beam':2,'Tachyon Cutter':2,'Dual Chop':2,'Gear Grind':2};
// Triple Axel and Triple Kick hit harder each time (20/40/60, 10/20/30): counted as 3 hits of the middle power
const RISING_HIT={'Triple Axel':40,'Triple Kick':20};
// Move groups for the abilities that boost them. Physical moves make contact unless listed in NONCONTACT.
const NONCONTACT=new Set(['Earthquake','Bulldoze','Rock Slide','Stone Edge','Rock Blast','Rock Tomb','Smack Down','Bullet Seed','Seed Bomb','Icicle Spear','Icicle Crash','Ice Shard','Scale Shot','Gunk Shot','Dragon Darts','Glacial Lance','Precipice Blades','Thousand Arrows','Thousand Waves','Diamond Storm','Pin Missile','Magnet Bomb','Bonemerang','Bone Rush','Shadow Bone','Poltergeist','Sacred Fire','Fling','Explosion','Self-Destruct','Beat Up','Aqua Cutter','Psycho Cut','Salt Cure','Ivy Cudgel','Spirit Shackle','Rock Wrecker','Sky Attack','Leafage','Razor Leaf','Egg Bomb','Barrage','Order Up','Gigaton Hammer','Tera Blast','Mountain Gale']);
const SHARP=new Set(['Aerial Ace','Air Cutter','Air Slash','Aqua Cutter','Behemoth Blade','Bitter Blade','Ceaseless Edge','Cross Poison','Cut','Fury Cutter','Kowtow Cleave','Leaf Blade','Mighty Cleave','Night Slash','Population Bomb','Psyblade','Psycho Cut','Razor Leaf','Razor Shell','Sacred Sword','Slash','Solar Blade','Stone Axe','Tachyon Cutter','X-Scissor']);
const PUNCH=new Set(['Bullet Punch','Comet Punch','Dizzy Punch','Double Iron Bash','Drain Punch','Dynamic Punch','Fire Punch','Focus Punch','Hammer Arm','Headlong Rush','Ice Hammer','Ice Punch','Jet Punch','Mach Punch','Mega Punch','Meteor Mash','Plasma Fists','Power-Up Punch','Rage Fist','Shadow Punch','Sky Uppercut','Surging Strikes','Thunder Punch','Wicked Blow']);
const BITE=new Set(['Bite','Crunch','Fire Fang','Fishious Rend','Hyper Fang','Ice Fang','Jaw Lock','Poison Fang','Psychic Fangs','Thunder Fang']);
const PULSE=new Set(['Aura Sphere','Dark Pulse','Dragon Pulse','Origin Pulse','Terrain Pulse','Water Pulse']);
// moves with a secondary effect that Sheer Force removes for 1.3× power (the common ones)
const SHEER=new Set(['Rock Slide','Iron Head','Flamethrower','Fire Blast','Heat Wave','Ice Beam','Blizzard','Icy Wind','Thunderbolt','Thunder','Discharge','Electroweb','Sludge Bomb','Sludge Wave','Gunk Shot','Poison Jab','Psychic','Earth Power','Shadow Ball','Energy Ball','Flash Cannon','Moonblast','Dark Pulse','Crunch','Air Slash','Bug Buzz','Scald','Fire Punch','Ice Punch','Thunder Punch','Zen Headbutt','Waterfall','Body Slam','Fire Fang','Ice Fang','Thunder Fang','Lava Plume','Muddy Water','Mystical Fire','Lunge','Trop Kick','Breaking Swipe','Snarl','Struggle Bug','Bulldoze','Rock Tomb','Mud Shot','Power-Up Punch','Flame Charge','Trailblaze','Spirit Break','Throat Chop','Liquidation','Crush Claw','Play Rough','Meteor Mash','Iron Tail','Headbutt','Bite','Fake Out','Nuzzle','Ancient Power','Charge Beam','Fiery Dance','Psychic Noise','Hurricane','Scorching Sands','Freeze-Dry','Strange Steam','Upper Hand','Poison Fang','Signal Beam','Water Pulse','Dragon Rush','Stomp','Extrasensory','Sky Attack','Steam Eruption','Esper Wing','Chilling Water','Matcha Gotcha','Mortal Spin','Lumina Crash']);
const isContact=mv=>mv.cat===1&&!NONCONTACT.has(mv.name);
// Type effectiveness of one move into one defender, the same way the type tables read it (hitMult): Scrappy and Mind's Eye,
// Freeze-Dry, Flying Press, Thousand Arrows and Tinted Lens. Defending abilities are applied separately in damage().
function moveEff(mv,type,ab,defTypes){let x=1;
  for(const d of defTypes){let f=EFF[type][d];
    if((ab==='Scrappy'||ab==="Mind's Eye")&&d==='Ghost'&&(type==='Normal'||type==='Fighting'))f=1;
    if(mv.name==='Freeze-Dry'&&d==='Water')f=2;
    if(mv.name==='Thousand Arrows'&&d==='Flying')f=1;
    if(mv.name==='Flying Press')f*=EFF.Flying[d];
    x*=f}
  return x}
// One hit: returns {min,max,hp,rolls} in HP. o = {atk:{p,sp,nat,item,ability,boost}, def:{p,hpSp,defSp,nat,item,ability,boost}, move, spread, weather, screen, hh, fg, crit}
function damage(o){const A=o.atk,D=o.def,mv=o.move;if(!mv||!mv.bp||mv.cat===0)return null;
  let type=mv.type,bp=RISING_HIT[mv.name]||mv.bp;const ab=A.ability||'';
  // Mold Breaker and friends ignore the defender's ability entirely
  const breaker=['Mold Breaker','Teravolt','Turboblaze'].includes(ab),dab=breaker?'':(D.ability||'');
  // these always land a critical hit
  o={...o,crit:!!o.crit||['Flower Trick','Wicked Blow','Surging Strikes','Storm Throw','Frost Breath'].includes(mv.name)};
  if(mv.name==='Weather Ball'&&o.weather){type={sun:'Fire',rain:'Water',sand:'Rock',snow:'Ice'}[o.weather];bp=100}
  // Technician reads the move's own power, before any other boost
  if(ab==='Technician'&&bp<=60)bp=Math.floor(bp*1.5);
  if(type==='Normal'&&SKINS[ab]){type=SKINS[ab];bp=Math.floor(bp*1.2)}
  if(ab==='Liquid Voice'&&mv.sound)type='Water';
  const phys=mv.cat===1;const aStat=mv.name==='Body Press'?'Def':phys?'Atk':'SpA';const dStat=(phys||['Psyshock','Psystrike','Secret Sword'].includes(mv.name))?'Def':'SpD';
  const aPts=aStat==='Atk'?(A.spA??A.sp):aStat==='SpA'?(A.spS??A.sp):aStat==='Def'?(A.spDef??0):A.sp;
  let a=calcStat(A.p,aStat,aPts,natMul(A.nat,aStat)),d=calcStat(D.p,dStat,dStat==='Def'?D.defSp:D.spdSp,natMul(D.nat,dStat));
  const hp=calcStat(D.p,'HP',D.hpSp,1);
  const ab_=A.boost||0;a=Math.floor(a*BOOST(o.crit?Math.max(0,ab_):ab_));d=Math.floor(d*BOOST(o.crit?Math.min(0,D.boost||0):(D.boost||0)));
  if(phys&&['Huge Power','Pure Power'].includes(ab))a*=2;if(phys&&ab==='Hustle')a=Math.floor(a*1.5);
  if(ab==='Solar Power'&&!phys&&o.weather==='sun')a=Math.floor(a*1.5);if(ab==='Water Bubble'&&type==='Water')a*=2;
  if(A.item==='Choice Band'&&phys)a=Math.floor(a*1.5);if(A.item==='Choice Specs'&&!phys)a=Math.floor(a*1.5);
  if(D.item==='Assault Vest'&&dStat==='SpD'&&mv.name!=='Body Press')d=Math.floor(d*1.5);
  if(dab==='Fur Coat'&&dStat==='Def')d*=2;
  if(o.weather==='sand'&&dStat==='SpD'&&D.p.t.includes('Rock'))d=Math.floor(d*1.5);
  if(o.weather==='snow'&&dStat==='Def'&&D.p.t.includes('Ice'))d=Math.floor(d*1.5);
  if(ab==='Tough Claws'&&isContact(mv))bp=Math.floor(bp*1.3);if(ab==='Sharpness'&&SHARP.has(mv.name))bp=Math.floor(bp*1.5);
  if(ab==='Iron Fist'&&PUNCH.has(mv.name))bp=Math.floor(bp*1.2);if(ab==='Strong Jaw'&&BITE.has(mv.name))bp=Math.floor(bp*1.5);
  if(ab==='Mega Launcher'&&PULSE.has(mv.name))bp=Math.floor(bp*1.5);if(ab==='Punk Rock'&&mv.sound)bp=Math.floor(bp*1.3);
  if(ab==='Sheer Force'&&SHEER.has(mv.name))bp=Math.floor(bp*1.3);
  // Supreme Overlord (Kingambit): +10% power for each fainted ally, up to 5
  if(ab==='Supreme Overlord'&&o.fainted)bp=Math.floor(bp*(1+.1*Math.min(5,o.fainted)));
  // terrain: 1.3× for a grounded attacker's matching type; Grassy halves Earthquake/Bulldoze and Misty halves Dragon into grounded targets
  {const gA=grounded({types:A.p.t,ability:ab}),gD=grounded({types:D.p.t,ability:D.ability||''}),T=o.terrain;
    if(gA&&((T==='grassy'&&type==='Grass')||(T==='electric'&&type==='Electric')||(T==='psychic'&&type==='Psychic')))bp=Math.floor(bp*1.3);
    if(gD&&((T==='grassy'&&(mv.name==='Earthquake'||mv.name==='Bulldoze'))||(T==='misty'&&type==='Dragon')))bp=Math.floor(bp/2)}
  if(ab==='Sand Force'&&o.weather==='sand'&&['Rock','Ground','Steel'].includes(type))bp=Math.floor(bp*1.3);
  if((ab==='Steelworker'&&type==='Steel')||(ab==="Dragon's Maw"&&type==='Dragon')||(ab==='Transistor'&&type==='Electric')||(ab==='Rocky Payload'&&type==='Rock'))bp=Math.floor(bp*1.5);
  if(['Blaze','Torrent','Overgrow','Swarm'].includes(ab)&&o.pinch&&type==={Blaze:'Fire',Torrent:'Water',Overgrow:'Grass',Swarm:'Bug'}[ab])a=Math.floor(a*1.5);
  if(TYPE_ITEM[A.item]===type)bp=Math.floor(bp*1.2);
  if(o.hh)bp=Math.floor(bp*1.5);
  let base=Math.floor(Math.floor(22*bp*a/d)/50)+2;
  // type effectiveness, read the same way as the type tables; the defender's ability is kept apart so it can't switch
  // super-effective items (Expert Belt, resist berries, Filter) on or off
  const eff=moveEff(mv,type,ab,D.p.t);let abMul=1;
  {const mods=ABILITY_MODS[dab];if(mods&&mods[type]!=null&&!(mv.name==='Thousand Arrows'&&type==='Ground'))abMul=mods[type]}
  if(eff===0||abMul===0)return {min:0,max:0,hp,eff:0,type,rolls:[0],next:{min:0,max:0}};
  // The game's own order and rounding (Gen 5+): modifiers are 4096ths, "pokeRound" rounds .5 down, and the final
  // modifiers are chained into one number before they're applied. This matches Showdown's damage calculator.
  const pr=x=>(x%1>.5?Math.ceil(x):Math.floor(x)),q=m=>Math.round(m*4096);
  const wMod=o.weather==='sun'?(type==='Fire'?6144:type==='Water'?2048:4096):o.weather==='rain'?(type==='Water'?6144:type==='Fire'?2048:4096):4096;
  // STAB comes from the attacker's own types (a skin or Liquid Voice only counts when the new type is one of them)
  const stabMod=A.p.t.includes(type)?(ab==='Adaptability'?8192:6144):4096;
  // final modifiers, chained (screens, Life Orb, Expert Belt, Tinted Lens, Filter, Multiscale, Fluffy, berries, Friend Guard, ...)
  const fin=[];if(abMul!==1)fin.push(q(abMul));if(o.screen&&!o.crit)fin.push(2732);if(A.item==='Life Orb')fin.push(5324);if(A.item==='Expert Belt'&&eff>1)fin.push(4915);
  if(ab==='Tinted Lens'&&eff<1)fin.push(8192);
  if(eff>1&&['Filter','Solid Rock','Prism Armor'].includes(dab))fin.push(3072);
  if(dab==='Ice Scales'&&!phys)fin.push(2048);if(dab==='Fluffy'&&isContact(mv))fin.push(2048);if(dab==='Punk Rock'&&mv.sound)fin.push(2048);
  if(o.fg)fin.push(3072);if(eff>1&&RESIST_BERRY[D.item]===type)fin.push(2048);if(eff<=1&&D.item==='Chilan Berry'&&type==='Normal')fin.push(2048);
  const chain=list=>list.reduce((c,x)=>Math.round(c*x/4096),4096);
  const burn=A.burn&&phys&&ab!=='Guts';
  const hits=MULTI_HIT[mv.name]===3&&ab==='Skill Link'?5:(MULTI_HIT[mv.name]||1);
  // Multiscale / Shadow Shield halve only the first hit at full HP
  const ms=(dab==='Multiscale'||dab==='Shadow Shield')&&o.fullHp!==false,finA=chain(ms?[...fin,2048]:fin),finB=chain(fin);
  const one=(r,first)=>{let x=base;if(o.spread)x=pr(x*3072/4096);x=pr(x*wMod/4096);if(o.crit)x=Math.floor(x*1.5);
    x=Math.floor(x*r/100);x=pr(x*stabMod/4096);x=Math.floor(x*eff);if(burn)x=Math.floor(x/2);x=pr(x*(first?finA:finB)/4096);return Math.max(1,x)};
  const R=[...Array(16)].map((_,i)=>85+i),rolls=R.map(r=>one(r,true)+one(r,false)*(hits-1)),later=R.map(r=>one(r,false)*hits);
  return {min:rolls[0],max:rolls[15],rolls,hp,eff:eff*abMul,type,hits,next:{min:later[0],max:later[15],rolls:later},sash:D.item==='Focus Sash'&&hits===1&&o.fullHp!==false}}
// Fewest bulk points (HP + the defense the move hits) that survive every roll, keeping the defender's nature.
function bulkToSurvive(o){const mv=o.move;if(!mv||!mv.bp||mv.cat===0)return null;const special=mv.cat===2&&!['Psyshock','Psystrike','Secret Sword'].includes(mv.name);
  const cur=o.def.hpSp+(special?o.def.spdSp:o.def.defSp);
  for(let tot=0;tot<=64;tot++)for(let hp=Math.min(32,tot);hp>=Math.max(0,tot-32);hp--){const df=tot-hp;
    const r=damage({...o,def:{...o.def,hpSp:hp,defSp:special?o.def.defSp:df,spdSp:special?df:o.def.spdSp}});if(r&&r.max<r.hp)return {hp,df,tot,cur,stat:special?'SpD':'Def'}}
  return {none:true}}
// KO odds from the 16 real damage rolls. Later hits use r.next (Multiscale only softens the first); Focus Sash leaves 1 HP.
function koText(r){if(!r)return '';if(r.max===0)return 'No effect';const rolls=r.rolls||[r.min,r.max],nx=r.next||r;
  const k1=rolls.filter(v=>v>=r.hp).length/rolls.length;
  if(r.sash&&k1>0)return k1>=1?'Focus Sash holds at 1 HP, then any hit KOs':`${Math.round(k1*100)}% to OHKO without its Focus Sash; the Sash holds at 1 HP`;
  if(k1>=1)return 'Guaranteed OHKO';if(k1>0)return `${Math.round(k1*100)}% chance to OHKO`;
  if(r.min+nx.min>=r.hp)return 'Guaranteed 2HKO';if(r.max+nx.max>=r.hp)return 'Possible 2HKO';if(r.min+2*nx.min>=r.hp)return 'Guaranteed 3HKO';
  return `${1+Math.ceil((r.hp-r.max)/Math.max(1,nx.max))}HKO or worse`}
// Defaults for a side, from what players run with that Pokémon.
// mem: your own team member when this side is yours, so its chosen item and ability are used (never for an opposing copy)
function sideDefaults(p,role,mem){const nat=topNature(p),it=topItem(p);let ab;try{ab=metaAbility(p)||bestAbility(p)}catch(e){ab=p.a[0]}
  if(mem&&mem.ability&&p.a.includes(mem.ability))ab=mem.ability;
  const st=p.st,phys=st[1]>=st[3],cs=commonSpread(p),item=mem&&mem.heldItem?mem.heldItem:it&&!STONE_RE.test(it[0])?it[0]:'';
  if(cs)return role==='atk'?{nat:cs.nat,sp:phys?cs.atk:cs.spa,spA:cs.atk,spS:cs.spa,spDef:cs.def,item,ability:ab,boost:0,real:true}
    :{nat:cs.nat,hpSp:cs.hp,defSp:cs.def,spdSp:cs.spd,item,ability:ab,boost:0,real:true};
  // no spread data: assume full Defense for Body Press on Pokémon built around their Defense (base 100+)
  return role==='atk'?{nat:nat||(phys?'Adamant':'Modest'),sp:32,spDef:st[2]>=100?32:0,item,ability:ab,boost:0}
    :{nat:nat||'Hardy',hpSp:32,defSp:0,spdSp:0,item,ability:ab,boost:0}}
let dc={dir:'mine',a:null,d:null,mv:null,weather:'',terrain:'',screen:false,hh:false,fg:false,crit:false,spread:null,inv:{}};
const CALC_ITEMS=['','Life Orb','Choice Band','Choice Specs','Choice Scarf','Expert Belt','Assault Vest','Focus Sash','Sitrus Berry','Leftovers',...Object.keys(TYPE_ITEM),...Object.keys(RESIST_BERRY)];
const NATURES=['Hardy','Adamant','Jolly','Modest','Timid','Brave','Quiet','Bold','Impish','Calm','Careful','Relaxed','Sassy','Lonely','Naughty','Mild','Rash','Hasty','Naive','Gentle','Lax'];
function dcSide(role,n){const p=byName.get(n);if(!p)return null;const key=role+':'+n;if(!dc.inv[key]){let mem=null;try{mem=members().find(m=>m.p.n===n)}catch(e){}dc.inv[key]=sideDefaults(p,role,mem)}return {p,...dc.inv[key]}}
function dcMoves(p){const learn=(LEARN[p.n]||[]).map(k=>MV[k]).filter(m=>m.bp>0);let pop=[];try{const mem=members().find(m=>m.p.n===p.n);pop=(mem?mem.moves:popularMoves(p)).filter(m=>m&&m.bp>0)}catch(e){}
  const seen=new Set(pop.map(m=>m.name));return {pop,rest:learn.filter(m=>!seen.has(m.name)).sort((a,b)=>a.name.localeCompare(b.name))}}
function monOptions(sel){const mine=members().map(m=>m.p);let thr=[];try{thr=metaThreats(30).map(x=>x.p||x)}catch(e){}
  const seen=new Set();const grp=(lab,list)=>{const o=list.filter(p=>p&&!seen.has(p.n)&&seen.add(p.n)).map(p=>`<option value="${esc(p.n)}"${p.n===sel?' selected':''}>${esc(p.d||p.n)}</option>`).join('');return o?`<optgroup label="${lab}">${o}</optgroup>`:''};
  return grp('Your team',mine)+grp('Top of the meta',thr)+grp('Everyone',ROSTER.slice().sort((a,b)=>(a.d||a.n).localeCompare(b.d||b.n)))}
function renderCalc(){const el=$('dcOut');if(!el)return;const ms=members();
  if(!dc.a||!byName.get(dc.a))dc.a=(ms[0]&&ms[0].p.n)||'Garchomp';
  if(!dc.d||!byName.get(dc.d)){let t=[];try{t=metaThreats(5).map(x=>x.p||x)}catch(e){}dc.d=(t.find(p=>p.n!==dc.a)||byName.get('Incineroar')||ROSTER[1]).n}
  const A=dcSide('atk',dc.a),D=dcSide('def',dc.d);const mvs=dcMoves(A.p);if(!dc.mv||![...mvs.pop,...mvs.rest].some(m=>m.name===dc.mv))dc.mv=(mvs.pop[0]||mvs.rest[0]||{}).name;
  const mv=mvByName.get(dc.mv);const spread=dc.spread==null?!!(mv&&mv.spread):dc.spread;
  const sel=(id,opts,v)=>`<select class="field" id="${id}">${opts.map(o=>Array.isArray(o)?`<option value="${esc(o[0])}"${o[0]===v?' selected':''}>${esc(o[1])}</option>`:`<option${o===v?' selected':''}>${esc(o)}</option>`).join('')}</select>`;
  const PTS=v=>[...new Set([32,28,24,20,16,12,8,4,0,+v])].sort((a,b)=>b-a).map(x=>[String(x),x===32?'32 (max)':String(x)]);
  // Body Press hits with the attacker's Defense, so the points box (and the stat stage) switch to Defense for it
  const mvC=mvByName.get(dc.mv),bp_=mvC&&mvC.name==='Body Press',aShown=bp_?(A.spDef??0):mvC&&mvC.cat===2?(A.spS??A.sp):(A.spA??A.sp);
  const boosts=[-2,-1,0,1,2].map(x=>[String(x),x>0?'+'+x:String(x)]);
  const r=damage({atk:A,def:D,move:mv,spread,weather:dc.weather,terrain:dc.terrain,fainted:dc.fainted||0,screen:dc.screen,hh:dc.hh,fg:dc.fg,crit:dc.crit});
  const pct=r&&r.hp?[100*r.min/r.hp,100*r.max/r.hp]:null;
  const bar=pct?`<div class="dcbar"><span style="width:${Math.min(100,pct[0]).toFixed(1)}%" class="lo"></span><span style="width:${Math.max(0,Math.min(100,pct[1])-Math.min(100,pct[0])).toFixed(1)}%" class="hi"></span></div>`:'';
  // phones: the result rides along at the top while you change the inputs below
  const stick=pct&&r&&r.max>0?`<button type="button" class="dcstick" id="dcStick" aria-label="Jump to the full result">${sprite(A.p,'dcsts')}<span class="dcsta">→</span>${sprite(D.p,'dcsts')}<span class="dcstx"><b>${pct[0].toFixed(1)}–${pct[1].toFixed(1)}%</b><span>${esc(koText(r))} · ${esc(dc.mv)}</span></span></button>`:mv&&r&&r.max===0?`<button type="button" class="dcstick" id="dcStick">${sprite(A.p,'dcsts')}<span class="dcsta">→</span>${sprite(D.p,'dcsts')}<span class="dcstx"><b>No effect</b><span>${esc(dc.mv)}</span></span></button>`:'';
  el.innerHTML=stick+`<div class="dcgrid">
    <div class="dccol"><h3>Attacker</h3>${sprite(A.p,'dcspr')}
      <label>Pokémon<select class="field" id="dcA">${monOptions(dc.a)}</select></label>
      <label>Move<select class="field" id="dcMv">${mvs.pop.length?`<optgroup label="Its set">${mvs.pop.map(m=>`<option${m.name===dc.mv?' selected':''}>${esc(m.name)}</option>`).join('')}</optgroup>`:''}<optgroup label="Other moves">${mvs.rest.map(m=>`<option${m.name===dc.mv?' selected':''}>${esc(m.name)}</option>`).join('')}</optgroup></select></label>
      <div class="dc2"><label>${bp_?'Defense points (Body Press)':mvC&&mvC.cat===2?'Sp. Atk points':'Attack points'}${sel('dcASp',PTS(aShown),String(aShown))}</label><label>Nature${sel('dcANat',NATURES,A.nat)}</label></div>
      <div class="dc2"><label>Item${sel('dcAIt',CALC_ITEMS.map(x=>[x,x||'None']),A.item)}</label><label>Ability${sel('dcAAb',A.p.a,A.ability)}</label></div>
      <label>${bp_?'Defense stage (Body Press)':'Stat stage (Intimidate = −1)'}${sel('dcABo',boosts,String(A.boost))}</label>
      ${A.ability==='Supreme Overlord'?`<label>Allies fainted (Supreme Overlord: +10% power each)${sel('dcAFt',[0,1,2,3,4,5].map(x=>[String(x),String(x)]),String(dc.fainted||0))}</label>`:''}</div>
    <button type="button" class="btn sm dcswap" id="dcSwap" title="Swap attacker and defender" aria-label="Swap attacker and defender">⇄ Swap</button><div class="dccol"><h3>Defender</h3>${sprite(D.p,'dcspr')}
      <label>Pokémon<select class="field" id="dcD">${monOptions(dc.d)}</select></label>
      <div class="dc2"><label>HP points${sel('dcDHp',PTS(D.hpSp),String(D.hpSp))}</label><label>Nature${sel('dcDNat',NATURES,D.nat)}</label></div>
      <div class="dc2"><label>Def points${sel('dcDDf',PTS(D.defSp),String(D.defSp))}</label><label>Sp. Def points${sel('dcDSd',PTS(D.spdSp),String(D.spdSp))}</label></div>
      <div class="dc2"><label>Item${sel('dcDIt',CALC_ITEMS.map(x=>[x,x||'None']),D.item)}</label><label>Ability${sel('dcDAb',D.p.a,D.ability)}</label></div>
      <label>Stat stage${sel('dcDBo',boosts,String(D.boost))}</label></div></div>
    <div class="dcfield"><div class="seg" role="group" aria-label="Weather">${[['','No weather'],['sun','Sun'],['rain','Rain'],['sand','Sand'],['snow','Snow']].map(([k,t])=>`<button type="button" data-dcw="${k}" aria-pressed="${dc.weather===k}">${t}</button>`).join('')}</div>
      <div class="seg" role="group" aria-label="Terrain" style="margin-top:6px">${[['','No terrain'],['grassy','Grassy'],['electric','Electric'],['psychic','Psychic'],['misty','Misty']].map(([k,t])=>`<button type="button" data-dcterr="${k}" aria-pressed="${dc.terrain===k}">${t}</button>`).join('')}</div>
      <div class="seg segwrap" role="group" aria-label="Field">${[['spread','Hits both foes'],['screen','Screen up'],['hh','Helping Hand'],['fg','Friend Guard'],['crit','Critical hit']].map(([k,t])=>`<button type="button" data-dct="${k}" aria-pressed="${k==='spread'?spread:!!dc[k]}">${t}</button>`).join('')}</div></div>
    <div class="dcres">${!mv?'<div class="empty-note">Pick a damaging move.</div>':!r?'<div class="empty-note">This move does no direct damage.</div>':r.max===0?`<b>No effect.</b> ${esc(D.p.d||D.p.n)} is immune to ${esc(r.type)}.`:
      `<div class="dcbig">${pct[0].toFixed(1)}–${pct[1].toFixed(1)}%</div>${bar}<div><b>${koText(r)}</b> · ${r.min}–${r.max} of ${r.hp} HP${r.hits>1?` · ${r.hits} hits${MULTI_HIT[dc.mv]===3&&r.hits===3?' (2–5)':''}`:''}${r.eff!==1?` · ${r.eff}× ${esc(r.type)}`:''}</div>
      ${(()=>{if(!r||r.max===0)return '';const bs=bulkToSurvive({atk:A,def:D,move:mv,spread,weather:dc.weather,terrain:dc.terrain,screen:dc.screen,hh:dc.hh,fg:dc.fg,crit:dc.crit});if(!bs)return '';if(bs.none)return `<p class="dcbulk">${esc(D.p.d||D.p.n)} can't survive this hit with any spread.</p>`;return `<p class="dcbulk">Fewest points to always survive: <b>${bs.hp} HP / ${bs.df} ${bs.stat}</b> (${bs.tot} total). ${r.max<r.hp?'This spread already survives.':'This spread does not.'}</p>`})()}
      <p class="t2">${esc(A.p.d||A.p.n)} ${aShown} ${mvC&&mvC.cat===2?'SpA':'Atk'} points ${esc(A.nat)}${A.item?' '+esc(A.item):''} · ${esc(dc.mv)}${spread?' (spread)':''} vs ${esc(D.p.d||D.p.n)} ${D.hpSp} HP / ${D.defSp} Def / ${D.spdSp} SpD ${esc(D.nat)}${D.item?' '+esc(D.item):''}${A.real||D.real?' · spreads: most common on the Showdown ladder':''}</p>`}</div>
    ${renderHitTable(ms)}`;dcStickWatch()}
// Your team's best hit on each top threat (each side's usual set).
function bestHitOn(atkP,atkMoves,defP,aMem,dMem){let best=null;const A={p:atkP,...sideDefaults(atkP,'atk',aMem)},D={p:defP,...sideDefaults(defP,'def',dMem)};
  for(const mv of atkMoves){if(!mv||!mv.bp)continue;const r=damage({atk:A,def:D,move:mv,spread:!!mv.spread});if(r&&r.hp&&(!best||r.max>best.r.max))best={mv,r}}return best}
function renderHitTable(ms){if(!ms.length)return '';let thr=[];try{thr=metaThreats(12).map(x=>x.p||x).filter(p=>p&&p.st)}catch(e){}if(!thr.length)return '';
  const cell=b=>{if(!b)return '<td class="dcz">–</td>';const p=100*b.r.max/b.r.hp,lo=100*b.r.min/b.r.hp,c=lo>=100?'k1':p>=100?'k1m':lo>=50?'k2':p>=50?'k2m':'k3';return `<td class="${c}" title="${esc(b.mv.name)}: ${lo.toFixed(0)}–${p.toFixed(0)}%">${p.toFixed(0)}<span>${esc(b.mv.name)}</span></td>`};
  const thH=p=>`<th title="${esc(p.d||p.n)}">${sprite(p,'dcth')}<span>${esc((p.d||p.n).replace(/^Mega /,'M-'))}</span></th>`,rowH=(p,d)=>`<th>${sprite(p,'dcth')}<span>${esc(d||p.d||p.n)}</span></th>`;
  const theirs=dc.dir==='theirs';
  const seg=`<div class="seg" role="group" aria-label="Direction"><button type="button" data-dcdir="mine" aria-pressed="${!theirs}">Your hits on them</button><button type="button" data-dcdir="theirs" aria-pressed="${theirs}">Their hits on you</button></div>`;
  const table=theirs?`<table class="dctab"><thead><tr><th></th>${ms.map(m=>thH(m.p)).join('')}</tr></thead><tbody>${thr.map(t=>{const mv=popularMoves(t);return `<tr>${rowH(t)}${ms.map(m=>cell(bestHitOn(t,mv,m.p,null,m))).join('')}</tr>`}).join('')}</tbody></table>`
    :`<table class="dctab"><thead><tr><th></th>${thr.map(thH).join('')}</tr></thead><tbody>${ms.map(m=>`<tr>${rowH(m.p,m.d)}${thr.map(t=>cell(bestHitOn(m.p,m.moves,t,m,null))).join('')}</tr>`).join('')}</tbody></table>`;
  return `<h3 class="dsub" style="margin-top:22px">${theirs?'Each top threat\'s best hit on your team':'Your best hit on each top threat'}</h3><div style="margin:6px 0 8px">${seg}</div><p class="t2">Max roll, single target unless the move hits both. ${theirs?'Their usual set vs your set and the most common bulk.':'Your set vs their usual set and bulk.'} Green = OHKO range, gold = 2HKO range.${theirs?' A green column is a Pokémon you may need to Protect or switch.':''}</p>
  <div class="tablewrap">${table}</div>`}
document.addEventListener('change',e=>{const t=e.target;if(!t.id||!/^dc/.test(t.id))return;const v=t.value;
  const ak='atk:'+dc.a,dk='def:'+dc.d;
  if(t.id==='dcA'){dc.a=v;dc.mv=null;dc.spread=null}else if(t.id==='dcD'){dc.d=v}else if(t.id==='dcMv'){dc.mv=v;dc.spread=null}
  else if(t.id==='dcASp'){const I=dc.inv[ak],m=mvByName.get(dc.mv);if(m&&m.name==='Body Press')I.spDef=+v;else{I.sp=+v;if(m&&m.cat===2)I.spS=+v;else I.spA=+v}}
  else if(t.id==='dcAFt')dc.fainted=+v||0;else if(t.id==='dcANat')dc.inv[ak].nat=v;else if(t.id==='dcAIt')dc.inv[ak].item=v;else if(t.id==='dcAAb')dc.inv[ak].ability=v;else if(t.id==='dcABo')dc.inv[ak].boost=+v;
  else if(t.id==='dcDHp')dc.inv[dk].hpSp=+v;else if(t.id==='dcDNat')dc.inv[dk].nat=v;else if(t.id==='dcDDf')dc.inv[dk].defSp=+v;else if(t.id==='dcDSd')dc.inv[dk].spdSp=+v;else if(t.id==='dcDIt')dc.inv[dk].item=v;else if(t.id==='dcDAb')dc.inv[dk].ability=v;else if(t.id==='dcDBo')dc.inv[dk].boost=+v;
  renderCalc()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-dcw],[data-dct],[data-dcdir],[data-dcterr],#dcSwap');if(!b)return;if(b.dataset.dcterr!=null){dc.terrain=b.dataset.dcterr;renderCalc();return}if(b.dataset.dcdir){dc.dir=b.dataset.dcdir;keepScroll(()=>renderCalc());return}if(b.id==='dcSwap'){const a=dc.a;dc.a=dc.d;dc.d=a;dc.mv=null;dc.spread=null;renderCalc();return}
  if(b.dataset.dcw!=null)dc.weather=b.dataset.dcw;else{const k=b.dataset.dct;if(k==='spread'){const mv=mvByName.get(dc.mv);const cur=dc.spread==null?!!(mv&&mv.spread):dc.spread;dc.spread=!cur}else dc[k]=!dc[k]}renderCalc()});


// the pinned result hides while the full result is on screen, and taps through to it
let dcObs=null;
function dcStickWatch(){const st=$('dcStick'),res=document.querySelector('#dcOut .dcres');if(dcObs){dcObs.disconnect();dcObs=null}if(!st||!res)return;
  const band=document.querySelector('header.band');if(band)document.documentElement.style.setProperty('--bandh',(getComputedStyle(band).position==='sticky'?band.getBoundingClientRect().height:0)+'px');
  try{dcObs=new IntersectionObserver(es=>{for(const x of es)st.classList.toggle('off',x.isIntersecting)},{threshold:.35});dcObs.observe(res)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#dcStick');if(!b)return;const res=document.querySelector('#dcOut .dcres');if(res)try{res.scrollIntoView({behavior:'smooth',block:'center'})}catch(er){res.scrollIntoView()}});

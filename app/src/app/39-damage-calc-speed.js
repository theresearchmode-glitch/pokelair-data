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
// mem: your own team member, so its real item and (if you set one) its own spread are used instead of the usual ones
function likelySpeed(p,mem){const it=topItem(p),cs=(mem&&mem.spread)||commonSpread(p);const scarf=mem?mem.item==='Choice Scarf':it&&it[0]==='Choice Scarf'&&(it[1]==null||it[1]>=25);
  if(cs){const v=calcStat(p,'Spe',cs.spe,natMul(cs.nat,'Spe'));return {v,scarf,label:`${cs.spe} Speed points, ${cs.nat}${cs.mine?' (your spread)':' (most common spread)'}`,nat:cs.nat,real:true}}
  const nat=topNature(p);const up=(NAT_UP.Spe).includes(nat),dn=(NAT_DN.Spe).includes(nat);
  const sp=dn?0:(up||p.st[5]>=70)?32:0,mul=up?1.1:dn?.9:1;
  const v=calcStat(p,'Spe',sp,mul);return {v,scarf,label:(dn?'0 Speed points, Speed-lowering nature':up?'32 Speed points, Speed-boosting nature':sp?'32 Speed points':'0 Speed points')+(nat?`, ${nat} (estimated)`:' (estimated)'),nat}}
// ---- speed tiers ----
let spdUi={tw:false,twOpp:false,tr:false,icy:false};
function renderSpeed(){const el=$('spdOut');if(!el)return;
  const mine=members().map(m=>m.p),mineSet=new Set(mine.map(p=>p.n));
  const thr=metaThreats(24).map(x=>x.p||x).filter(p=>p&&p.st&&!mineSet.has(p.n)).slice(0,20);
  const myMem=new Map(members().map(m=>[m.p.n,m])),myItem=new Map([...myMem].map(([n,m])=>[n,m.item]));
  const rows=[...mine.map(p=>({p,me:true})),...thr.map(p=>({p,me:false}))].map(r=>{const s={...likelySpeed(r.p,r.me?myMem.get(r.p.n):null)};let v=s.v;if(s.scarf)v=Math.floor(v*1.5);
    if(r.me&&spdUi.tw)v*=2;if(!r.me&&spdUi.twOpp)v*=2;if(!r.me&&spdUi.icy)v=Math.floor(v*BOOST(-1));return {...r,s,v}});
  rows.sort((a,b)=>spdUi.tr?a.v-b.v:b.v-a.v);
  const tog=(k,t)=>`<button type="button" data-spd="${k}" aria-pressed="${!!spdUi[k]}">${t}</button>`;
  $('spdCtl').innerHTML=`<div class="seg" role="group" aria-label="Speed conditions">${tog('tw','Your Tailwind')}${tog('twOpp','Their Tailwind')}${tog('icy','Their −1 Speed')}${tog('tr','Trick Room')}</div>`;
  if(!mine.length){el.innerHTML='<div class="empty-note">Add Pokémon on the Team page to place them against the top threats.</div>';return}
  const sum=mine.map(p=>{const me=rows.find(r=>r.me&&r.p.n===p.n);const beat=rows.filter(r=>!r.me&&(spdUi.tr?r.v>me.v:r.v<me.v)).length;// speed target: the nearest threat just above you, and the Speed points (same nature) it takes to pass it
    let tip='';if(!spdUi.tr&&!spdUi.tw&&!spdUi.twOpp&&!spdUi.icy){const ls=likelySpeed(p,myMem.get(p.n)),cs=(myMem.get(p.n)||{}).spread||commonSpread(p),nat=(cs&&cs.nat)||ls.nat,cur=cs?cs.spe:(ls.label.startsWith('32')?32:0),mult=myItem.get(p.n)==='Choice Scarf'?1.5:1;
      const above=rows.filter(r=>!r.me&&r.v>me.v).sort((a,b)=>a.v-b.v)[0];
      if(above){let need=null;for(let sp=cur;sp<=32;sp++){if(Math.floor(calcStat(p,'Spe',sp,natMul(nat,'Spe'))*mult)>above.v){need=sp;break}}
        tip=need!=null?`<span class="spdtip">${need-cur} more Speed points (${need} total) outspeeds ${esc(above.p.d||above.p.n)}</span>`:`<span class="spdtip">can't outspeed ${esc(above.p.d||above.p.n)} with this nature</span>`}}
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
// Triple Axel and Triple Kick hit harder each time: this much more power per hit (20/40/60, 10/20/30)
const RISING_HIT={'Triple Axel':20,'Triple Kick':10};
// Move groups for the abilities and effects that read them, from Showdown's Champions move data (experiments/calc-check.mjs --lists).
// Physical moves make contact unless listed in NONCONTACT; CONTACT_SP are the special moves that do.
const NONCONTACT=new Set(['Aqua Cutter','Aura Wheel','Barb Barrage','Beak Blast','Bone Rush','Bulldoze','Bullet Seed','Dragon Darts','Drum Beating','Earthquake','Explosion','Feint','Flower Trick','Gigaton Hammer','Grav Apple','Gunk Shot','Ice Shard','Icicle Crash','Icicle Spear','Last Respects','Meteor Assault','Mountain Gale','Petal Blizzard','Pin Missile','Poltergeist','Psycho Cut','Pyro Ball','Raging Fury','Rock Blast','Rock Slide','Rock Tomb','Rock Wrecker','Salt Cure','Sand Tomb','Scale Shot','Seed Bomb','Self-Destruct','Sky Attack','Smack Down','Spirit Shackle','Stone Edge','Triple Arrows','Bonemerang','Thousand Arrows','Thousand Waves','Precipice Blades','Diamond Storm','Glacial Lance','Fling','Beat Up']);
const CONTACT_SP=new Set(['Draining Kiss','Infestation','Petal Dance','Grass Knot','Trump Card']);
const SHARP=new Set(['Aerial Ace','Air Cutter','Air Slash','Aqua Cutter','Bitter Blade','Ceaseless Edge','Cross Poison','Crush Claw','Dire Claw','Dragon Claw','Kowtow Cleave','Leaf Blade','Metal Claw','Night Slash','Population Bomb','Psycho Cut','Razor Shell','Sacred Sword','Shadow Claw','Slash','Solar Blade','Stone Axe','X-Scissor','Behemoth Blade','Mighty Cleave','Psyblade','Tachyon Cutter','Razor Leaf','Cut','Fury Cutter']);
const PUNCH=new Set(['Bullet Punch','Double Shock','Drain Punch','Dynamic Punch','Fire Punch','Focus Punch','Hammer Arm','Headlong Rush','Ice Hammer','Ice Punch','Jet Punch','Mach Punch','Meteor Mash','Rage Fist','Shadow Punch','Thunder Punch','Surging Strikes','Wicked Blow','Sky Uppercut','Power-Up Punch','Mega Punch','Comet Punch','Dizzy Punch']);
const BITE=new Set(['Bite','Crunch','Fire Fang','Ice Fang','Jaw Lock','Poison Fang','Psychic Fangs','Thunder Fang','Fishious Rend','Hyper Fang']);
const PULSE=new Set(['Aura Sphere','Dark Pulse','Dragon Pulse','Terrain Pulse','Water Pulse','Origin Pulse']);
const BULLET=new Set(['Acid Spray','Aura Sphere','Beak Blast','Bullet Seed','Energy Ball','Focus Blast','Pollen Puff','Pyro Ball','Rock Blast','Rock Wrecker','Seed Bomb','Shadow Ball','Sludge Bomb','Syrup Bomb','Weather Ball','Zap Cannon','Electro Ball','Gyro Ball','Mud Bomb','Mist Ball','Octazooka','Magnet Bomb','Egg Bomb','Barrage']);
// moves with a secondary effect, which Sheer Force removes for 1.3× power
const SHEER=new Set(['Acid Spray','Air Slash','Alluring Voice','Ancient Power','Apple Acid','Aqua Step','Aura Wheel','Axe Kick','Barb Barrage','Bite','Bitter Malice','Blaze Kick','Blizzard','Body Slam','Bounce','Breaking Swipe','Bug Buzz','Bulldoze','Burning Jealousy','Ceaseless Edge','Charge Beam','Chilling Water','Cross Poison','Crunch','Crush Claw','Dark Pulse','Dire Claw','Discharge','Dragon Rush','Drum Beating','Dynamic Punch','Earth Power','Eerie Spell','Electro Shot','Electroweb','Energy Ball','Extrasensory','Fake Out','Fiery Dance','Fire Blast','Fire Fang','Fire Lash','Fire Punch','Flame Charge','Flamethrower','Flare Blitz','Flash Cannon','Focus Blast','Grav Apple','Gunk Shot','Heat Wave','Hurricane','Ice Beam','Ice Fang','Ice Punch','Icicle Crash','Icy Wind','Infernal Parade','Inferno','Iron Head','Iron Tail','Lava Plume','Liquidation','Low Sweep','Lumina Crash','Lunge','Matcha Gotcha','Meteor Mash','Moonblast','Mortal Spin','Mountain Gale','Mud Shot','Mud-Slap','Muddy Water','Mystical Fire','Night Daze','Nuzzle','Play Rough','Poison Fang','Poison Jab','Pounce','Psychic','Psychic Noise','Psyshield Bash','Pyro Ball','Rapid Spin','Razor Shell','Rock Slide','Rock Tomb','Salt Cure','Scald','Scorching Sands','Shadow Ball','Shell Side Arm','Skitter Smack','Sky Attack','Sludge Bomb','Sludge Wave','Snarl','Snore','Sparkling Aria','Spirit Break','Spirit Shackle','Steel Wing','Stone Axe','Struggle Bug','Syrup Bomb','Throat Chop','Thunder','Thunder Fang','Thunder Punch','Thunderbolt','Torch Song','Trailblaze','Tri Attack','Triple Arrows','Trop Kick','Upper Hand','Volt Tackle','Water Pulse','Waterfall','Zap Cannon','Zen Headbutt','Zing Zap']);
// priority moves: they fail into Psychic Terrain (grounded target), Queenly Majesty and Armor Tail
const PRIORITY=new Set(['Accelerock','Aqua Jet','Bullet Punch','Extreme Speed','Fake Out','Feint','First Impression','Ice Shard','Jet Punch','Mach Punch','Quick Attack','Shadow Sneak','Sucker Punch','Upper Hand','Vacuum Wave','Water Shuriken']);
// recoil and crash moves (Reckless)
const RECOIL=new Set(['Axe Kick','Brave Bird','Double-Edge','Flare Blitz','Head Smash','High Jump Kick','Light of Ruin','Supercell Slam','Volt Tackle','Wave Crash','Wild Charge','Wood Hammer','Take Down','Head Charge','Submission','Jump Kick']);
const isContact=mv=>(mv.cat===1&&!NONCONTACT.has(mv.name))||CONTACT_SP.has(mv.name);
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
// One hit: returns {min,max,hp,rolls} in HP. o = {atk:{p,sp,nat,item,ability,boost,burn}, def:{p,hpSp,defSp,spdSp,atkSp,nat,item,ability,boost}, move, spread, weather, terrain, screen, hh, fg, crit, fainted}
// The game's own order and rounding (Gen 5+, as Showdown's Champions calculator does it): power, Attack and Defense
// modifiers are each chained in 4096ths and applied once; "pokeRound" rounds .5 down; the final modifiers are chained too.
const ALWAYS_CRIT=['Flower Trick','Wicked Blow','Surging Strikes','Storm Throw','Frost Breath'];
const pokeRound=x=>(x%1>.5?Math.ceil(x):Math.floor(x)),chain4096=list=>list.reduce((c,x)=>x===4096?c:(c*x+2048)>>12,4096),applyMods=(v,list)=>Math.max(1,pokeRound(v*chain4096(list)/4096));
const statStage=(v,s)=>Math.floor(s>=0?v*(2+s)/2:v*2/(2-s));
function damage(o){const A=o.atk,D=o.def,mv=o.move;if(!mv||!mv.bp||mv.cat===0)return null;
  const nm=mv.name,phys=mv.cat===1,ab=A.ability||'',dab0=D.ability||'';
  // Klutz: the holder's item does nothing (Knock Off, Acrobatics and Poltergeist still see it)
  const aIt=ab==='Klutz'?'':(A.item||''),dIt=dab0==='Klutz'?'':(D.item||'');
  // Mold Breaker and friends ignore the defender's ability
  const dab=['Mold Breaker','Teravolt','Turboblaze'].includes(ab)?'':dab0;
  // Cloud Nine / Air Lock switch the weather off; Mega Sol makes the user's own moves act as if the sun were out
  const fw=[ab,dab0].some(x=>x==='Cloud Nine'||x==='Air Lock')?'':(o.weather||''),aw=ab==='Mega Sol'?'sun':fw,T=o.terrain||'';
  const gr=(t,x)=>!t.includes('Flying')&&x!=='Levitate'&&x!=='Eelevate',gA=gr(A.p.t,ab),gD=gr(D.p.t,dab);
  // these always land a critical hit; Shell Armor and Battle Armor block crits
  const crit=(!!o.crit||ALWAYS_CRIT.includes(nm))&&!['Shell Armor','Battle Armor'].includes(dab);
  let type=mv.type,bp=mv.bp,ate=false;
  if(nm==='Weather Ball'&&aw){type={sun:'Fire',rain:'Water',sand:'Rock',snow:'Ice'}[aw];bp*=2}
  else if(nm==='Terrain Pulse'&&gA&&T){type={grassy:'Grass',electric:'Electric',psychic:'Psychic',misty:'Fairy'}[T];bp*=2}
  else if(nm==='Raging Bull')type={'Tauros-Paldea-Combat':'Fighting','Tauros-Paldea-Blaze':'Fire','Tauros-Paldea-Aqua':'Water'}[A.p.n]||type;
  if(!['Weather Ball','Terrain Pulse','Struggle'].includes(nm)){if(type==='Normal'&&SKINS[ab]){type=SKINS[ab];ate=true}else if(ab==='Liquid Voice'&&mv.sound)type='Water'}
  if(nm==='Acrobatics'&&!A.item)bp*=2;if(nm==='Rising Voltage'&&gD&&T==='electric')bp*=2;if((nm==='Stored Power'||nm==='Power Trip')&&A.boost>0)bp+=20*A.boost;
  // type effectiveness, read the same way as the type tables; the defender's ability is kept apart so it can't switch
  // super-effective items (Expert Belt, resist berries, Filter) on or off
  const eff=moveEff(mv,type,ab,D.p.t);let abMul=1;
  {const mods=ABILITY_MODS[dab];if(mods&&mods[type]!=null&&!(nm==='Thousand Arrows'&&type==='Ground'))abMul=mods[type]}
  const hp=calcStat(D.p,'HP',D.hpSp,1),pri=PRIORITY.has(nm);
  if(eff===0||abMul===0||(dab==='Bulletproof'&&BULLET.has(nm))||(dab==='Soundproof'&&mv.sound)||(pri&&(['Queenly Majesty','Armor Tail','Dazzling'].includes(dab)||(T==='psychic'&&gD)))
    ||(nm==='Poltergeist'&&!D.item)||(nm==='Steel Roller'&&!T))return {min:0,max:0,hp,eff:0,type,rolls:[0],next:{min:0,max:0}};
  // Attack and Defense. Foul Play uses the target's own Attack (its points, nature and stage); Body Press the user's Defense.
  const aStat=nm==='Body Press'?'Def':phys?'Atk':'SpA',dStat=(phys||['Psyshock','Psystrike','Secret Sword'].includes(nm))?'Def':'SpD',foul=nm==='Foul Play',S=foul?D:A;
  const aPts=foul?(D.atkSp??0):aStat==='Atk'?(A.spA??A.sp):aStat==='SpA'?(A.spS??A.sp):(A.spDef??0);
  let aB=foul?(D.atkBoost||0):(A.boost||0),dB=D.boost||0;if(nm==='Meteor Beam'||nm==='Electro Shot')aB=Math.max(-6,Math.min(6,aB+(ab==='Contrary'?-1:1)));
  // Unaware ignores the other side's stat stages; a crit ignores the attacker's drops and the defender's boosts
  if(dab==='Unaware')aB=0;if(ab==='Unaware'||['Sacred Sword','Darkest Lariat','Chip Away'].includes(nm))dB=0;if(crit){aB=Math.max(0,aB);dB=Math.min(0,dB)}
  let a=statStage(calcStat(S.p,aStat,aPts,natMul(S.nat,aStat)),aB),d=statStage(calcStat(D.p,dStat,dStat==='Def'?D.defSp:D.spdSp,natMul(D.nat,dStat)),dB);
  if(phys&&ab==='Hustle')a=Math.floor(a*1.5);
  const burned=!!A.burn,am=[];
  if(ab==='Solar Power'&&!phys&&fw==='sun')am.push(6144);
  else if((ab==='Guts'&&burned&&phys)||(o.pinch&&type==={Blaze:'Fire',Torrent:'Water',Overgrow:'Grass',Swarm:'Bug'}[ab]))am.push(6144);
  else if((ab==='Fire Mane'&&type==='Fire')||(ab==='Steelworker'&&type==='Steel')||(ab==="Dragon's Maw"&&type==='Dragon')||(ab==='Rocky Payload'&&type==='Rock'))am.push(6144);
  else if(ab==='Transistor'&&type==='Electric')am.push(5325);
  else if((ab==='Water Bubble'&&type==='Water')||(phys&&(ab==='Huge Power'||ab==='Pure Power')))am.push(8192);
  if((dab==='Thick Fat'&&(type==='Fire'||type==='Ice'))||(dab==='Water Bubble'&&type==='Fire')||(dab==='Purifying Salt'&&type==='Ghost')||(dab==='Heatproof'&&type==='Fire'))am.push(2048);
  if((aIt==='Choice Band'&&phys)||(aIt==='Choice Specs'&&!phys))am.push(6144);
  a=applyMods(a,am);
  if(ab!=='Mega Sol'){if(fw==='sand'&&dStat==='SpD'&&D.p.t.includes('Rock'))d=pokeRound(d*1.5);if(fw==='snow'&&dStat==='Def'&&D.p.t.includes('Ice'))d=pokeRound(d*1.5)}
  const dm=[];if(dStat==='Def'&&dab==='Fur Coat')dm.push(8192);else if(dStat==='Def'&&dab==='Grass Pelt'&&T==='grassy')dm.push(6144);
  if(dIt==='Assault Vest'&&dStat==='SpD')dm.push(6144);d=applyMods(d,dm);
  // move power (b: this hit's own power, which Technician reads)
  const contact=isContact(mv);
  const power=b=>{const m=[];
    if(nm==='Facade'&&burned)m.push(8192);else if(nm==='Expanding Force'&&gA&&T==='psychic')m.push(6144);else if((nm==='Knock Off'&&D.item)||(nm==='Misty Explosion'&&gA&&T==='misty'))m.push(6144);
    else if((nm==='Solar Beam'||nm==='Solar Blade')&&['rain','sand','snow'].includes(aw))m.push(2048);
    if(o.hh)m.push(6144);
    // terrain: 1.3× for a grounded attacker's matching type; Grassy halves Earthquake/Bulldoze and Misty halves Dragon into grounded targets
    if(gA&&((T==='grassy'&&type==='Grass')||(T==='electric'&&type==='Electric')||(T==='psychic'&&type==='Psychic')))m.push(5325);
    if(gD&&((T==='misty'&&type==='Dragon')||(T==='grassy'&&(nm==='Earthquake'||nm==='Bulldoze'))))m.push(2048);
    if((ab==='Technician'&&b<=60)||(ab==='Mega Launcher'&&PULSE.has(nm))||(ab==='Strong Jaw'&&BITE.has(nm))||(ab==='Steely Spirit'&&type==='Steel')||(ab==='Sharpness'&&SHARP.has(nm)))m.push(6144);
    if(ab===type+' Aura'||dab0===type+' Aura')m.push(5448);
    if((ab==='Sheer Force'&&SHEER.has(nm))||(ab==='Sand Force'&&fw==='sand'&&['Rock','Ground','Steel'].includes(type))||(ab==='Tough Claws'&&contact)||(ab==='Punk Rock'&&mv.sound))m.push(5325);
    if(ate)m.push(4915);if((ab==='Reckless'&&RECOIL.has(nm))||(ab==='Iron Fist'&&PUNCH.has(nm)))m.push(4915);
    if(dab==='Dry Skin'&&type==='Fire')m.push(5120);
    // Supreme Overlord (Kingambit): +10% power for each fainted ally, up to 5
    if(ab==='Supreme Overlord'&&o.fainted)m.push([4096,4506,4915,5325,5734,6144][Math.min(5,o.fainted)]);
    if(TYPE_ITEM[aIt]===type)m.push(4915);else if((aIt==='Muscle Band'&&phys)||(aIt==='Wise Glasses'&&!phys))m.push(4505);
    return applyMods(b,m)};
  // hits: 2–5 hit moves count 3 (5 with Skill Link); Parental Bond adds a second hit at 1/4 power (single-target moves).
  // Expanding Force in Psychic Terrain hits both foes, so it takes the spread cut.
  const spread=!!o.spread||(nm==='Expanding Force'&&gA&&T==='psychic');
  const hits0=MULTI_HIT[nm]===3&&ab==='Skill Link'?5:(MULTI_HIT[nm]||1),pb=ab==='Parental Bond'&&hits0===1&&!spread,hits=pb?2:hits0;
  const wMod=aw==='sun'?(type==='Fire'?6144:type==='Water'?2048:4096):aw==='rain'?(type==='Water'?6144:type==='Fire'?2048:4096):4096;
  const baseOf=h=>{let x=Math.floor(Math.floor(22*power(RISING_HIT[nm]?RISING_HIT[nm]*(h+1):bp)*a/d)/50)+2;
    if(spread)x=pokeRound(x*3072/4096);if(pb&&h===1)x=pokeRound(x*1024/4096);if(wMod!==4096)x=pokeRound(x*wMod/4096);if(crit)x=Math.floor(x*1.5);return x};
  // STAB comes from the attacker's own types (a skin or Liquid Voice only counts when the new type is one of them); Protean/Libero give it to every move
  const stab=A.p.t.includes(type),stabMod=stab?(ab==='Adaptability'?8192:6144):(ab==='Protean'||ab==='Libero')?6144:4096;
  // final modifiers, chained (screens, Sniper, Multiscale, Fluffy, Filter, Friend Guard, Expert Belt, Life Orb, berries, ...).
  // Multiscale/Shadow Shield and resist berries only soften the first hit; Infiltrator, Brick Break and Psychic Fangs ignore screens.
  const screen=o.screen&&!crit&&ab!=='Infiltrator'&&!['Brick Break','Psychic Fangs','Raging Bull'].includes(nm);
  const finOf=first=>{const f=[];if(screen)f.push(2732);if(ab==='Sniper'&&crit)f.push(6144);if(ab==='Tinted Lens'&&eff<1)f.push(8192);
    if(first&&(dab==='Multiscale'||dab0==='Shadow Shield')&&o.fullHp!==false)f.push(2048);
    if((dab==='Fluffy'||dab==='Aura Guard')&&contact)f.push(2048);else if(dab==='Punk Rock'&&mv.sound)f.push(2048);if(dab==='Ice Scales'&&!phys)f.push(2048);
    if(eff>1&&(['Filter','Solid Rock'].includes(dab)||dab0==='Prism Armor'))f.push(3072);
    if(o.fg)f.push(3072);if(dab==='Fluffy'&&type==='Fire')f.push(8192);
    if(aIt==='Expert Belt'&&eff>1)f.push(4915);else if(aIt==='Life Orb')f.push(5324);
    if(first&&ab!=='Unnerve'&&RESIST_BERRY[dIt]===type&&(eff>1||type==='Normal'))f.push(2048);
    return chain4096(f)};
  const burn=burned&&phys&&ab!=='Guts'&&nm!=='Facade',FA=finOf(true),FB=finOf(false),H=[...Array(hits)].map((_,h)=>baseOf(h));
  const one=(base,r,fm)=>{let x=Math.floor(base*r/100);x=pokeRound(x*stabMod/4096);x=Math.floor(x*eff);if(burn)x=Math.floor(x/2);return Math.max(1,pokeRound(x*fm/4096))};
  const R=[...Array(16)].map((_,i)=>85+i),rolls=R.map(r=>H.reduce((s,b,h)=>s+one(b,r,h?FB:FA),0)),later=R.map(r=>H.reduce((s,b)=>s+one(b,r,FB),0));
  return {min:rolls[0],max:rolls[15],rolls,hp,eff:eff*abMul,type,hits,next:{min:later[0],max:later[15],rolls:later},sash:dIt==='Focus Sash'&&hits===1&&o.fullHp!==false}}
// Fewest bulk points (HP + the defense the move hits) that survive every roll, keeping the defender's nature.
function bulkToSurvive(o){const mv=o.move;if(!mv||!mv.bp||mv.cat===0)return null;const special=mv.cat===2&&!['Psyshock','Psystrike','Secret Sword'].includes(mv.name);
  const cur=o.def.hpSp+(special?o.def.spdSp:o.def.defSp);
  // within Champions' 66-point total: the other defensive stat keeps its points, so HP + this defense can use the rest
  const room=Math.min(64,66-(special?o.def.defSp:o.def.spdSp));
  for(let tot=0;tot<=room;tot++)for(let hp=Math.min(32,tot);hp>=Math.max(0,tot-32);hp--){const df=tot-hp;
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
  // your own member: your spread if you set one (paste/link), and its item (your pick, or the team-aware default)
  const st=p.st,phys=st[1]>=st[3],cs=(mem&&mem.spread)||commonSpread(p),item=mem&&mem.item&&!STONE_RE.test(mem.item)?mem.item:mem&&mem.heldItem?mem.heldItem:it&&!STONE_RE.test(it[0])?it[0]:'';
  if(cs)return role==='atk'?{nat:cs.nat,sp:phys?cs.atk:cs.spa,spA:cs.atk,spS:cs.spa,spDef:cs.def,item,ability:ab,boost:0,real:true}
    :{nat:cs.nat,hpSp:cs.hp,defSp:cs.def,spdSp:cs.spd,atkSp:cs.atk,item,ability:ab,boost:0,real:true};
  // no spread data: assume full Defense for Body Press on Pokémon built around their Defense (base 100+);
  // a defender's Attack points (for Foul Play) are full on physical attackers
  return role==='atk'?{nat:nat||(phys?'Adamant':'Modest'),sp:32,spDef:st[2]>=100?32:0,item,ability:ab,boost:0}
    :{nat:nat||'Hardy',hpSp:32,defSp:0,spdSp:0,atkSp:phys?32:0,item,ability:ab,boost:0}}
let dc={dir:'mine',a:null,d:null,mv:null,weather:'',terrain:'',screen:false,hh:false,fg:false,crit:false,spread:null,inv:{}};
// Choice Band, Choice Specs and Assault Vest are not in Champions (missing from Showdown's Champions item list, and no
// player in any of our usage data runs them), so the calc doesn't offer them; their math stays in damage().
const CALC_ITEMS=['','Life Orb','Choice Scarf','Expert Belt','Focus Sash','Sitrus Berry','Leftovers',...Object.keys(TYPE_ITEM),...Object.keys(RESIST_BERRY)];
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
  const A=dcSide('atk',dc.a),D=dcSide('def',dc.d);const mvs=dcMoves(A.p);
  // weather follows the attacker until you pick one: its own Drought/Drizzle/..., or your team's weather when it's yours
  if(!dc.wSet){const mine=ms.some(m=>m.p.n===A.p.n);dc.weather=(typeof WEATHER_OF==='object'&&WEATHER_OF[A.ability])||(mine&&typeof sideField==='function'?sideField(ms).weather:'')||''}if(!dc.mv||![...mvs.pop,...mvs.rest].some(m=>m.name===dc.mv))dc.mv=(mvs.pop[0]||mvs.rest[0]||{}).name;
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
// field: {weather, terrain} in play (sun from Drought, etc.), so a lead's weather boost is counted
function bestHitOn(atkP,atkMoves,defP,aMem,dMem,field){let best=null;const A={p:atkP,...sideDefaults(atkP,'atk',aMem)},D={p:defP,...sideDefaults(defP,'def',dMem)};const F=field||{};
  for(const mv of atkMoves){if(!mv||!mv.bp)continue;const r=damage({atk:A,def:D,move:mv,spread:!!mv.spread,weather:F.weather||'',terrain:F.terrain||''});if(r&&r.hp&&(!best||r.max>best.r.max))best={mv,r}}return best}
function renderHitTable(ms){if(!ms.length)return '';let thr=[];try{thr=metaThreats(12).map(x=>x.p||x).filter(p=>p&&p.st)}catch(e){}if(!thr.length)return '';
  const cell=b=>{if(!b)return '<td class="dcz">–</td>';const p=100*b.r.max/b.r.hp,lo=100*b.r.min/b.r.hp,c=lo>=100?'k1':p>=100?'k1m':lo>=50?'k2':p>=50?'k2m':'k3';return `<td class="${c}" title="${esc(b.mv.name)}: ${lo.toFixed(0)}–${p.toFixed(0)}%">${p.toFixed(0)}<span>${esc(b.mv.name)}</span></td>`};
  const thH=p=>`<th title="${esc(p.d||p.n)}">${sprite(p,'dcth')}<span>${esc((p.d||p.n).replace(/^Mega /,'M-'))}</span></th>`,rowH=(p,d)=>`<th>${sprite(p,'dcth')}<span>${esc(d||p.d||p.n)}</span></th>`;
  const theirs=dc.dir==='theirs';
  // each attacker's own weather/terrain counts: yours if your team sets exactly one, theirs from the threat's own ability
  const myF=typeof sideField==='function'?sideField(ms):{},thF=t=>typeof sideField==='function'?sideField([{p:t,ability:abilityOf({p:t})}]):{};
  const seg=`<div class="seg" role="group" aria-label="Direction"><button type="button" data-dcdir="mine" aria-pressed="${!theirs}">Your hits on them</button><button type="button" data-dcdir="theirs" aria-pressed="${theirs}">Their hits on you</button></div>`;
  const table=theirs?`<table class="dctab"><thead><tr><th></th>${ms.map(m=>thH(m.p)).join('')}</tr></thead><tbody>${thr.map(t=>{const mv=popularMoves(t);return `<tr>${rowH(t)}${ms.map(m=>cell(bestHitOn(t,mv,m.p,null,m,thF(t)))).join('')}</tr>`}).join('')}</tbody></table>`
    :`<table class="dctab"><thead><tr><th></th>${thr.map(thH).join('')}</tr></thead><tbody>${ms.map(m=>`<tr>${rowH(m.p,m.d)}${thr.map(t=>cell(bestHitOn(m.p,m.moves,t,m,null,myF))).join('')}</tr>`).join('')}</tbody></table>`;
  return `<h3 class="dsub" style="margin-top:22px">${theirs?'Each top threat\'s best hit on your team':'Your best hit on each top threat'}</h3><div style="margin:6px 0 8px">${seg}</div><p class="t2">Max roll, single target unless the move hits both. ${theirs?'Their usual set vs your set and the most common bulk, in the weather or terrain the attacker sets itself.':`Your set vs their usual set and bulk${myF.weather||myF.terrain?`, in your ${esc(fieldWords(myF))}`:''}.`} Green = OHKO range, gold = 2HKO range.${theirs?' A green column is a Pokémon you may need to Protect or switch.':''}</p>
  <div class="tablewrap">${table}</div>`}
document.addEventListener('change',e=>{const t=e.target;if(!t.id||!/^dc/.test(t.id))return;const v=t.value;
  const ak='atk:'+dc.a,dk='def:'+dc.d;
  if(t.id==='dcA'){dc.a=v;dc.mv=null;dc.spread=null}else if(t.id==='dcD'){dc.d=v}else if(t.id==='dcMv'){dc.mv=v;dc.spread=null}
  else if(t.id==='dcASp'){const I=dc.inv[ak],m=mvByName.get(dc.mv);if(m&&m.name==='Body Press')I.spDef=+v;else{I.sp=+v;if(m&&m.cat===2)I.spS=+v;else I.spA=+v}}
  else if(t.id==='dcAFt')dc.fainted=+v||0;else if(t.id==='dcANat')dc.inv[ak].nat=v;else if(t.id==='dcAIt')dc.inv[ak].item=v;else if(t.id==='dcAAb')dc.inv[ak].ability=v;else if(t.id==='dcABo')dc.inv[ak].boost=+v;
  // Champions caps a Pokémon at 66 stat points in total (32 in any one stat): a change that would pass 66 takes the
  // points from the other two defensive stats, so the defender never shows an illegal spread
  else if(t.id==='dcDHp'||t.id==='dcDDf'||t.id==='dcDSd'){const I=dc.inv[dk],k={dcDHp:'hpSp',dcDDf:'defSp',dcDSd:'spdSp'}[t.id];I[k]=+v;
    let over=I.hpSp+I.defSp+I.spdSp-66;for(const o of ['spdSp','defSp','hpSp']){if(over<=0)break;if(o===k)continue;const take=Math.min(over,I[o]);I[o]-=take;over-=take}}
  else if(t.id==='dcDNat')dc.inv[dk].nat=v;else if(t.id==='dcDIt')dc.inv[dk].item=v;else if(t.id==='dcDAb')dc.inv[dk].ability=v;else if(t.id==='dcDBo')dc.inv[dk].boost=+v;
  renderCalc()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-dcw],[data-dct],[data-dcdir],[data-dcterr],#dcSwap');if(!b)return;if(b.dataset.dcterr!=null){dc.terrain=b.dataset.dcterr;renderCalc();return}if(b.dataset.dcdir){dc.dir=b.dataset.dcdir;keepScroll(()=>renderCalc());return}if(b.id==='dcSwap'){const a=dc.a;dc.a=dc.d;dc.d=a;dc.mv=null;dc.spread=null;renderCalc();return}
  if(b.dataset.dcw!=null){dc.weather=b.dataset.dcw;dc.wSet=true}else{const k=b.dataset.dct;if(k==='spread'){const mv=mvByName.get(dc.mv);const cur=dc.spread==null?!!(mv&&mv.spread):dc.spread;dc.spread=!cur}else dc[k]=!dc[k]}renderCalc()});


// the pinned result hides while the full result is on screen, and taps through to it
let dcObs=null;
function dcStickWatch(){const st=$('dcStick'),res=document.querySelector('#dcOut .dcres');if(dcObs){dcObs.disconnect();dcObs=null}if(!st||!res)return;
  const band=document.querySelector('header.band');if(band)document.documentElement.style.setProperty('--bandh',(getComputedStyle(band).position==='sticky'?band.getBoundingClientRect().height:0)+'px');
  try{dcObs=new IntersectionObserver(es=>{for(const x of es)st.classList.toggle('off',x.isIntersecting)},{threshold:.35});dcObs.observe(res)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#dcStick');if(!b)return;const res=document.querySelector('#dcOut .dcres');if(res)try{res.scrollIntoView({behavior:'smooth',block:'center'})}catch(er){res.scrollIntoView()}});

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
// Iron Ball halves the holder's Speed (applied on top of the stat; Scarf is handled by each caller)
function likelySpeed(p,mem){const r=likelySpeed0(p,mem);if(mem&&mem.item==='Iron Ball')return {...r,v:Math.floor(r.v/2),label:r.label+', Iron Ball halves it'};
  if(mem&&mem.item==='Quick Claw')return {...r,label:r.label+', Quick Claw: 20% chance to move first in its bracket'};return r}
function likelySpeed0(p,mem){const it=topItem(p),cs=(mem&&mem.spread)||commonSpread(p);const scarf=mem?mem.item==='Choice Scarf':it&&it[0]==='Choice Scarf'&&(it[1]==null||it[1]>=25);
  if(cs){const v=calcStat(p,'Spe',cs.spe,natMul(cs.nat,'Spe'));return {v,scarf,label:`${cs.spe} Speed points, ${cs.nat}${cs.assumed?' (your nature, most common spread)':cs.mine?' (your spread)':' (most common spread)'}`,nat:cs.nat,real:true}}
  const nat=topNature(p);const up=(NAT_UP.Spe).includes(nat),dn=(NAT_DN.Spe).includes(nat);
  const sp=dn?0:(up||p.st[5]>=70)?32:0,mul=up?1.1:dn?.9:1;
  const v=calcStat(p,'Spe',sp,mul);return {v,scarf,label:(dn?'0 Speed points, Speed-lowering nature':up?'32 Speed points, Speed-boosting nature':sp?'32 Speed points':'0 Speed points')+(nat?`, ${nat} (estimated)`:' (estimated)'),nat}}
// ---- speed tiers ----
// wx: the weather in play ('auto' = the one your team sets, if exactly one); par: they're paralyzed (×0.5)
let spdUi={tw:false,twOpp:false,tr:false,icy:false,par:false,wx:'auto'};
// One row's speed under the conditions: item (Scarf ×1.5), weather speed ability ×2, Tailwind ×2, −1 stage, paralysis ×0.5.
// Unburden: also the speed once its item is used (×2), shown as a second number.
// The game's order: the stat stage first, then the modifiers chained in 4096ths (rounded once), then paralysis halves it.
function spdCalc(base,scarf,ability,weather,o){let v=base;if(o.icy)v=Math.floor(v*BOOST(-1));
  // o.unb: Unburden active (its item is used), ×2 in the same chain
  const wm=typeof speedMul==='function'?speedMul(ability,weather):1,mods=[scarf?6144:4096,wm>1?8192:4096,o.tw?8192:4096,o.unb?8192:4096];
  let m=4096;for(const x of mods)if(x!==4096)m=(m*x+2048)>>12;if(m!==4096){const y=v*m/4096;v=Math.max(1,y%1>.5?Math.ceil(y):Math.floor(y))}
  if(o.par)v=Math.floor(v*.5);return v}
// turn-order abilities, noted on the speed line: Stall always moves last in its priority bracket (Showdown −0.1, even under
// Trick Room); Quick Draw is a 30% chance to move first in its bracket with an attack (never relied on); Quick Feet needs a status
const spdAbNote=ab=>ab==='Stall'?' · Stall: always moves last in its priority bracket':ab==='Quick Draw'?' · Quick Draw: 30% chance to move first in its bracket (attacks)'
  :ab==='Quick Feet'?' · Quick Feet not counted (only with a status condition)':'';
function renderSpeed(){const el=$('spdOut');if(!el)return;
  const ms=members(),mine=ms.map(m=>m.p),mineSet=new Set(mine.map(p=>p.n));
  const thr=metaThreats(24).map(x=>x.p||x).filter(p=>p&&p.st&&!mineSet.has(p.n)).slice(0,20);
  const myMem=new Map(ms.map(m=>[m.p.n,m])),myItem=new Map([...myMem].map(([n,m])=>[n,m.item]));
  const autoW=typeof sideField==='function'?sideField(ms).weather:'',W=spdUi.wx==='auto'?autoW:spdUi.wx;
  const rows=[...mine.map(p=>({p,me:true})),...thr.map(p=>({p,me:false}))].map(r=>{const mem=r.me?myMem.get(r.p.n):null,s={...likelySpeed(r.p,mem)};
    const ab=mem?mem.ability:abilityOf({p:r.p}),o={tw:r.me?spdUi.tw:spdUi.twOpp,icy:!r.me&&spdUi.icy,par:!r.me&&spdUi.par};
    const v=spdCalc(s.v,s.scarf,ab,W,o),wxUp=typeof speedMul==='function'&&speedMul(ab,W)>1;
    // Unburden: doubled once its item is used (Sneasler's seed or herb), unless Scarf/no item
    const unb=ab==='Unburden'&&!s.scarf?spdCalc(s.v,s.scarf,ab,W,{...o,unb:true}):null;return {...r,s,v,ab,wxUp,unb}});
  rows.sort((a,b)=>spdUi.tr?a.v-b.v:b.v-a.v);
  const tog=(k,t)=>`<button type="button" data-spd="${k}" aria-pressed="${!!spdUi[k]}">${t}</button>`;
  const wxb=(k,t)=>`<button type="button" data-spdwx="${k}" aria-pressed="${spdUi.wx===k}">${t}</button>`;
  $('spdCtl').innerHTML=`<div class="seg segwrap" role="group" aria-label="Speed conditions">${tog('tw','Your Tailwind')}${tog('twOpp','Their Tailwind')}${tog('icy','Their −1 Speed')}${tog('par','They\'re paralyzed')}${tog('tr','Trick Room')}</div>
    <div class="seg segwrap" role="group" aria-label="Weather" style="margin-top:6px">${wxb('auto',autoW?`Your weather (${autoW})`:'Your weather (none)')}${wxb('','No weather')}${wxb('sun','Sun')}${wxb('rain','Rain')}${wxb('sand','Sand')}${wxb('snow','Snow')}</div>`;
  if(!mine.length){el.innerHTML='<div class="empty-note">Add Pokémon on My team to place them against the top threats.<div style="margin-top:12px"><button type="button" class="chghost" data-view="build">Go to My team</button></div></div>';return}
  const sum=mine.map(p=>{const me=rows.find(r=>r.me&&r.p.n===p.n);const beat=rows.filter(r=>!r.me&&((r.ab==='Stall')!==(me.ab==='Stall')?r.ab==='Stall':spdUi.tr?r.v>me.v:r.v<me.v)).length;// speed target: the nearest threat just above you, and the Speed points (same nature) it takes to pass it
    let tip='';if(!spdUi.tr&&!spdUi.tw&&!spdUi.twOpp&&!spdUi.icy&&!spdUi.par&&!me.wxUp){const ls=likelySpeed(p,myMem.get(p.n)),cs=(myMem.get(p.n)||{}).spread||commonSpread(p),nat=(cs&&cs.nat)||ls.nat,cur=cs?cs.spe:(ls.label.startsWith('32')?32:0),mult=myItem.get(p.n)==='Choice Scarf'?1.5:1;
      const above=rows.filter(r=>!r.me&&r.v>me.v).sort((a,b)=>a.v-b.v)[0];
      if(above){let need=null;for(let sp=cur;sp<=32;sp++){if(Math.floor(calcStat(p,'Spe',sp,natMul(nat,'Spe'))*mult)>above.v){need=sp;break}}
        tip=need!=null?`<span class="spdtip">${need-cur} more Speed points (${need} total) outspeeds ${esc(above.p.d||above.p.n)}</span>`:`<span class="spdtip">can't outspeed ${esc(above.p.d||above.p.n)} with this nature</span>`}}
    return `<span class="spdsum"><b>${esc(p.d||p.n)}</b> moves first against ${beat} of ${thr.length}${tip}</span>`}).join('');
  el.innerHTML=`<div class="spdsums">${sum}</div><div class="spdlist">${rows.map((r,i)=>{const tie=rows.some((o,j)=>j!==i&&o.v===r.v&&o.me!==r.me);
    return `<div class="spdrow${r.me?' me':''}"><span class="spdv">${r.v}</span>${sprite(r.p,'spdspr')}<span class="spdn"><b>${esc(r.p.d||r.p.n)}</b>${r.me?' <span class="tag spdme">YOU</span>':''}${tie?' <span class="tag spdtie">TIE</span>':''}<span class="t2">${esc(r.s.label)}${r.s.scarf?' · Choice Scarf':''}${r.wxUp?` · ${esc(r.ab)} ×2 in ${esc(W)}`:''}${r.unb?` · ${r.unb} after its item is used (Unburden)`:''}${spdAbNote(r.ab)} · base ${r.p.st[5]}</span></span></div>`}).join('')}</div>
    <p class="t2" style="margin-top:10px">Level 50 with 31 IVs. Your side uses your items (and your spreads where you set them); theirs <span class="asm" title="Their real spreads and items are hidden">assumed</span> uses the most common natures and items, with fast Pokémon at 32 Speed points. Weather speed abilities (Chlorophyll, Swift Swim, Sand Rush, Slush Rush) double Speed in their weather. ${spdUi.tr?'Trick Room: the slowest moves first.':''}</p>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-spd],[data-spdwx]');if(!b)return;if(b.dataset.spdwx!=null)spdUi.wx=b.dataset.spdwx;else{const k=b.dataset.spd;spdUi[k]=!spdUi[k]}renderSpeed()});
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
// priority attacks (any bracket above 0, from the move data): they fail into Psychic Terrain (grounded target), Queenly
// Majesty, Armor Tail and Dazzling. Hand list kept only as a fallback when the generated data is missing.
const PRIORITY=new Set(typeof MOVE_META==='object'?Object.keys(MOVE_META).filter(n=>MOVE_META[n].p>0):['Accelerock','Aqua Jet','Bullet Punch','Extreme Speed','Fake Out','Feint','First Impression','Ice Shard','Jet Punch','Mach Punch','Quick Attack','Shadow Sneak','Sucker Punch','Upper Hand','Vacuum Wave','Water Shuriken']);
// recoil and crash moves (Reckless)
const RECOIL=new Set(['Axe Kick','Brave Bird','Double-Edge','Flare Blitz','Head Smash','High Jump Kick','Light of Ruin','Supercell Slam','Volt Tackle','Wave Crash','Wild Charge','Wood Hammer','Take Down','Head Charge','Submission','Jump Kick']);
// The reference flags (data/move-meta.js, from Showdown's Champions data) win over the hand lists above, which stay as a
// fallback for any move the generated data doesn't carry.
const MMETA=n=>(typeof MOVE_META==='object'&&MOVE_META[n])||null;
const mFlag=(n,c,fb)=>{const x=MMETA(n);return x?(x.f||'').includes(c):fb.has(n)};
const isContact=mv=>{const x=MMETA(mv.name);return x?(x.f||'').includes('c'):(mv.cat===1&&!NONCONTACT.has(mv.name))||CONTACT_SP.has(mv.name)};
const isSheer=n=>{const x=MMETA(n);return x?!!x.sf:SHEER.has(n)};
const isRecoil=n=>{const x=MMETA(n);return RECOIL.has(n)||!!(x&&x.rc)};
// Priority of a move as it's used: the move's own bracket (Fake Out +3, Protect +4, Helping Hand +5, Follow Me +2,
// Trick Room −7…) plus Prankster (+1 status moves), Gale Wings (+1 Flying at full HP), Triage (+3 healing/draining moves) and
// Grassy Glide (+1 for a grounded user in Grassy Terrain). o: {terrain, grounded, fullHp}
function movePrio(mv,ab,o){if(!mv)return 0;o=o||{};const x=MMETA(mv.name)||{};let p=mv.pr!=null?mv.pr:(x.p||0);
  if(mv.name==='Grassy Glide'&&o.terrain==='grassy'&&o.grounded!==false)p+=1;
  if(ab==='Prankster'&&mv.cat===0)p+=1;if(ab==='Gale Wings'&&mv.type==='Flying'&&o.fullHp!==false)p+=1;
  if(ab==='Triage'&&(((x.f||'').includes('h'))||x.dr))p+=3;return p}
// Two-turn moves: they only hit on turn 1 in their weather (Electro Shot in rain, Solar Beam/Blade in sun) or with Power Herb
function chargesFirst(mv,weather,item){if(!mv||!mv.charge)return false;if(item==='Power Herb')return false;
  if(mv.name==='Electro Shot'&&weather==='rain')return false;if((mv.name==='Solar Beam'||mv.name==='Solar Blade')&&weather==='sun')return false;return true}
// Does a spread move that also hits the user's own ally (Earthquake, Discharge, Surf…) hit this partner?
function allyHit(mv,partner){if(!mv||!mv.ally||!partner||!partner.p)return false;const ab=partner.ability||'',t=partner.types||partner.p.t,it=partner.item||'',ty=mv.type;
  if(ab==='Telepathy')return false;
  if(ty==='Ground'&&(t.includes('Flying')||ab==='Levitate'||it==='Air Balloon'))return false;
  if(ty==='Electric'&&(t.includes('Ground')||['Volt Absorb','Lightning Rod','Motor Drive'].includes(ab)))return false;
  if(ty==='Water'&&['Water Absorb','Storm Drain','Dry Skin'].includes(ab))return false;
  if(ty==='Fire'&&['Flash Fire','Well-Baked Body'].includes(ab))return false;
  if(ty==='Poison'&&t.includes('Steel'))return false;
  try{if(moveEff(mv,ty,'',t)===0)return false}catch(e){}return true}
// species weight (kg) for Low Kick / Grass Knot / Heavy Slam / Heat Crash
const wtOf=p=>(typeof SPECIES_WT==='object'&&p&&SPECIES_WT[p.n])||0;
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
// an item that can't be knocked off: a Mega Stone on its own Pokémon (Knock Off then gets no 1.5× boost)
const fixedItem=D=>{const it=D&&D.item;if(!it||typeof MEGA_STONE!=='object'||!D.p)return false;const base=D.p.n.split('-Mega')[0];
  return Object.entries(MEGA_STONE).some(([k,v])=>v===it&&k.split('-Mega')[0]===base)};
// Aegislash attacks in Blade Forme (Stance Change) and defends in Shield Forme; the roster stores Shield Forme stats
const BLADE_ST=[60,140,50,140,50,60];
const atkForm=A=>A&&A.p&&(A.p.n==='Aegislash'||A.ability==='Stance Change')?{...A,p:{...A.p,st:BLADE_ST}}:A;
// Forecast (Castform) takes the weather's type, Mimicry (Galarian Stunfisk) the terrain's (Showdown: no weather / terrain =
// its own types). weather here is the one in effect (Cloud Nine / Air Lock already applied). null = types unchanged.
function formTypes(p,ab,weather,terrain){if(!p)return null;
  if(ab==='Forecast'&&(p.b||p.n||'').startsWith('Castform'))return [{sun:'Fire',rain:'Water',snow:'Ice'}[weather]||'Normal'];
  if(ab==='Mimicry'&&terrain)return [{electric:'Electric',grassy:'Grass',misty:'Fairy',psychic:'Psychic'}[terrain]];return null}
// Fling: power from the held item (Showdown's item.fling.basePower, Reg M-C items; checked by experiments/fields-audit.mjs).
// Every other legal item flings at 10; a Mega Stone can't be thrown by its Mega and Normal Gem can't be flung at all.
const FLING_BP={'Iron Ball':130,'Hard Stone':100,'Quick Claw':80,'Dragon Fang':70,'Poison Barb':70,'Damp Rock':60,'Heat Rock':60,Leek:60,'Rocky Helmet':60,'Terrain Extender':60,'Sharp Beak':50,'Icy Rock':40,
  'Binding Band':30,'Black Belt':30,'Black Glasses':30,Charcoal:30,'Eject Button':30,"King's Rock":30,'Life Orb':30,'Light Ball':30,'Light Clay':30,Magnet:30,'Metal Coat':30,Metronome:30,'Miracle Seed':30,
  'Mystic Water':30,'Never-Melt Ice':30,'Scope Lens':30,'Shell Bell':30,'Spell Tag':30,'Twisted Spoon':30,'Normal Gem':0};
const flingBp=it=>!it||STONE_RE.test(it)?0:FLING_BP[it]??10;
// Beat Up (Gen 5+): one hit per healthy Pokémon in the party, each with 5 + its base Attack / 10 power (the species on the
// team sheet, so a Mega counts with its base form's Attack). party: the Pokémon brought (user included).
const beatUpBp=party=>party.map(p=>{const b=p&&p.m&&typeof byName==='object'&&byName.get(p.b)||p;return 5+Math.floor(((b&&b.st)||[0,0])[1]/10)});
// Things the calc can't know from the sets (HP left, status, KOs, switching, genders): not counted, and said so under the
// result. One list, also read by experiments/fields-audit.mjs, so keep it JSON (double quotes). [reason, side]:
// a = attacker's ability/item/move, d = defender's, b = either.
const NOT_COUNTED={"Blaze":["only below ⅓ HP","a"],"Torrent":["only below ⅓ HP","a"],"Overgrow":["only below ⅓ HP","a"],"Swarm":["only below ⅓ HP","a"],
  "Marvel Scale":["only with a status condition","d"],"Quick Feet":["only with a status condition","b"],"Moxie":["only after it KOs something","a"],
  "Berserk":["only after a hit drops it below half HP","a"],"Stakeout":["only on a Pokémon that just switched in","a"],"Battle Bond":["only after it KOs something","a"],
  "Electromorphosis":["only after it's been hit","a"],"Metronome":["only when it uses the same move again","a"],"Rivalry":["depends on genders","a"],
  "Merciless":["only on a poisoned target","a"],"Hunger Switch":["form changes every turn","a"],"Spit Up":["needs Stockpile first","a"]};
// Crit chance by stage (Gen 9): +0 = 1/24, +1 = 1/8, +2 = 1/2, +3 or more = always
function critStage(A,mv){const x=MMETA(mv.name)||{};if(ALWAYS_CRIT.includes(mv.name)||x.cr>=9)return 3;let s=(x.cr||1)-1;
  if(A.ability==='Super Luck')s++;const it=A.ability==='Klutz'?'':A.item;if(it==='Scope Lens')s++;if(it==='Leek'&&/^(Farfetch|Sirfetch)/.test((A.p&&(A.p.b||A.p.n))||''))s+=2;return Math.min(3,s)}
const CRIT_TXT=['1/24','1/8','1/2','always'];
function damage(o){let A=atkForm(o.atk),D=o.def;const mv=o.move;if(!mv||!mv.bp||mv.cat===0)return null;
  const nm=mv.name,phys=mv.cat===1,ab=A.ability||'',dab0=D.ability||'';
  // Klutz: the holder's item does nothing (Knock Off, Acrobatics and Poltergeist still see it)
  const aIt=ab==='Klutz'?'':(A.item||''),dIt=dab0==='Klutz'?'':(D.item||'');
  // Mold Breaker and friends ignore the defender's ability
  const dab=['Mold Breaker','Teravolt','Turboblaze'].includes(ab)?'':dab0;
  // Cloud Nine / Air Lock switch the weather off; Mega Sol makes the user's own moves act as if the sun were out
  const fw=[ab,dab0].some(x=>x==='Cloud Nine'||x==='Air Lock')?'':(o.weather||''),aw=ab==='Mega Sol'?'sun':fw,T=o.terrain||'';
  const ta=formTypes(A.p,ab,fw,T),td=formTypes(D.p,dab0,fw,T);if(ta)A={...A,p:{...A.p,t:ta}};if(td)D={...D,p:{...D.p,t:td}}
  // grounded (for terrain): an Air Balloon holder floats, an Iron Ball holder is pulled down even if it flies or levitates
  const gr=(t,x,it)=>it==='Iron Ball'?true:!t.includes('Flying')&&x!=='Levitate'&&x!=='Eelevate'&&it!=='Air Balloon',gA=gr(A.p.t,ab,aIt),gD=gr(D.p.t,dab,dIt);
  // these always land a critical hit; Shell Armor and Battle Armor block crits
  const crit=(!!o.crit||ALWAYS_CRIT.includes(nm)||(MMETA(nm)||{}).cr>=9||critStage(A,mv)>=3)&&!['Shell Armor','Battle Armor'].includes(dab);
  let type=mv.type,bp=mv.bp,ate=false,beatUp=null;
  if(nm==='Weather Ball'&&aw){type={sun:'Fire',rain:'Water',sand:'Rock',snow:'Ice'}[aw];bp*=2}
  else if(nm==='Terrain Pulse'&&gA&&T){type={grassy:'Grass',electric:'Electric',psychic:'Psychic',misty:'Fairy'}[T];bp*=2}
  else if(nm==='Raging Bull')type={'Tauros-Paldea-Combat':'Fighting','Tauros-Paldea-Blaze':'Fire','Tauros-Paldea-Aqua':'Water'}[A.p.n]||type;
  if(!['Weather Ball','Terrain Pulse','Struggle'].includes(nm)){if(type==='Normal'&&SKINS[ab]){type=SKINS[ab];ate=true}else if(ab==='Liquid Voice'&&mv.sound)type='Water'}
  // variable power, by the game's rules (mv.vbp from the move data): weight, weight ratio, HP (both sides at full HP),
  // speed ratio, the target's status (none assumed) and fainted allies
  {const vb=mv.vbp;
    if(vb==='wt'){const w=wtOf(D.p)*(dab==='Heavy Metal'?2:dab==='Light Metal'?.5:1)*(dIt==='Float Stone'?.5:1);bp=w>=200?120:w>=100?100:w>=50?80:w>=25?60:w>=10?40:20}
    else if(vb==='wtr'){const wa=wtOf(A.p)*(ab==='Heavy Metal'?2:ab==='Light Metal'?.5:1)*(aIt==='Float Stone'?.5:1),wd=Math.max(.1,wtOf(D.p)*(dab==='Heavy Metal'?2:dab==='Light Metal'?.5:1)*(dIt==='Float Stone'?.5:1)),r=wa/wd;bp=r>=5?120:r>=4?100:r>=3?80:r>=2?60:40}
    else if(vb==='lowhp')bp=20;else if(vb==='fullhp')bp=nm==='Hard Press'?100:120;else if(vb==='userhp')bp=mv.bp||150;else if(vb==='hex')bp=65;
    else if(vb==='fling')bp=ab==='Klutz'?0:flingBp(A.item);else if(vb==='beatup')beatUp=beatUpBp(o.party&&o.party.length?o.party:[A.p,A.p,A.p,A.p]);
    else if(vb==='respects')bp=Math.min(300,50+50*Math.min(5,o.fainted||0));else if(vb==='punish')bp=60;else if(vb==='ragefist')bp=50;
    else if(vb==='gyro'||vb==='eball'){const sm=it=>it==='Choice Scarf'?1.5:it==='Iron Ball'?.5:1,sA=Math.floor(calcStat(A.p,'Spe',A.speSp??0,natMul(A.nat,'Spe'))*sm(aIt)),sD=Math.floor(calcStat(D.p,'Spe',D.speSp??0,natMul(D.nat,'Spe'))*sm(dIt));
      bp=vb==='gyro'?Math.min(150,Math.floor(25*sD/Math.max(1,sA))+1):(()=>{const r=sA/Math.max(1,sD);return r>=4?150:r>=3?120:r>=2?80:r>=1?60:40})()}}
  // (a Mega always holds its Mega Stone, which callers leave out of the item slot, so its Acrobatics is never doubled)
  if(nm==='Acrobatics'&&!A.item&&!(A.p&&A.p.m))bp*=2;if(nm==='Rising Voltage'&&gD&&T==='electric')bp*=2;if((nm==='Stored Power'||nm==='Power Trip')&&A.boost>0)bp+=20*A.boost;
  // type effectiveness, read the same way as the type tables; the defender's ability is kept apart so it can't switch
  // super-effective items (Expert Belt, resist berries, Filter) on or off
  // an Iron Ball holder is grounded: Ground moves hit its Flying type neutrally and ignore Levitate
  const ironGround=type==='Ground'&&dIt==='Iron Ball';
  const eff=moveEff(mv,type,ab,ironGround?D.p.t.filter(t=>t!=='Flying'):D.p.t);let abMul=1;
  {const mods=ABILITY_MODS[dab];if(mods&&mods[type]!=null&&!((nm==='Thousand Arrows'||ironGround)&&type==='Ground'))abMul=mods[type]}
  // (Gale Wings only gives priority at full HP: o.atkFullHp false = the attacker has taken damage)
  const hp=calcStat(D.p,'HP',D.hpSp,1),pri=movePrio(mv,ab,{terrain:T,grounded:gA,fullHp:o.atkFullHp!==false})>0;
  // Air Balloon: Ground moves miss until the balloon is popped by a hit
  if(eff===0||abMul===0||(dab==='Bulletproof'&&mFlag(nm,'l',BULLET))||(dab==='Soundproof'&&mv.sound)||(pri&&(['Queenly Majesty','Armor Tail','Dazzling'].includes(dab)||(T==='psychic'&&gD)))
    ||(type==='Ground'&&dIt==='Air Balloon'&&nm!=='Thousand Arrows')
    // (a Mega always holds its Mega Stone, which callers leave out of the item slot)
    ||(nm==='Poltergeist'&&!D.item&&!(D.p&&D.p.m))||(nm==='Steel Roller'&&!T))return {min:0,max:0,hp,eff:0,type,rolls:[0],next:{min:0,max:0}};
  if(mv.vbp==='fling'&&!bp)return {min:0,max:0,hp,eff:0,type,rolls:[0],next:{min:0,max:0},fail:'Fling fails: it needs a held item it can throw'};
  // fixed damage: Seismic Toss / Night Shade = the user's level (50); Super Fang / Ruination / Nature's Madness = half the
  // target's current HP (full, then a quarter); one-hit KO moves KO when they land (Sturdy and Ice types vs Sheer Cold are immune)
  // Final Gambit: the user's current HP (full HP assumed), then the user faints
  if(mv.fixed||mv.ohko||mv.vbp==='half'||mv.vbp==='gambit'){
    // (move data stores fixed: 0 for "no fixed damage", so only a positive number is a fixed amount)
    const v=mv.vbp==='gambit'?calcStat(A.p,'HP',A.hpSp??0,1):mv.ohko?((dab==='Sturdy'||(mv.ohko==='Ice'&&D.p.t.includes('Ice')))?0:hp):mv.fixed==='level'?50:typeof mv.fixed==='number'&&mv.fixed>0?mv.fixed:Math.max(1,Math.floor(hp/2));
    const v2=mv.vbp==='half'?Math.max(1,Math.floor((hp-v)/2)):v,rr=Array(16).fill(v),r2=Array(16).fill(v2);
    return {min:v,max:v,rolls:rr,hp,eff:v?1:0,type,hits:1,fixed:true,ohko:!!mv.ohko,next:{min:v2,max:v2,rolls:r2},sash:dIt==='Focus Sash'&&!mv.ohko&&mv.vbp!=='half'&&o.fullHp!==false,band:dIt==='Focus Band'&&!mv.ohko}}
  // Attack and Defense. Foul Play uses the target's own Attack (its points, nature and stage); Body Press the user's Defense.
  const aStat=nm==='Body Press'?'Def':phys?'Atk':'SpA',dStat=(phys||['Psyshock','Psystrike','Secret Sword'].includes(nm))?'Def':'SpD',foul=nm==='Foul Play',S=foul?D:A;
  const aPts=foul?(D.atkSp??0):aStat==='Atk'?(A.spA??A.sp):aStat==='SpA'?(A.spS??A.sp):(A.spDef??0);
  let aB=foul?(D.atkBoost||0):(A.boost||0),dB=D.boost||0;
  // a terrain seed pops as soon as its terrain is up: Grassy/Electric Seed +1 Def, Psychic/Misty Seed +1 SpD (as Smogon's calc)
  {const sd={'Grassy Seed':['grassy','Def'],'Electric Seed':['electric','Def'],'Psychic Seed':['psychic','SpD'],'Misty Seed':['misty','SpD']}[dIt];if(sd&&T===sd[0]&&dStat===sd[1])dB=Math.min(6,dB+1)}
  if(nm==='Meteor Beam'||nm==='Electro Shot')aB=Math.max(-6,Math.min(6,aB+(ab==='Contrary'?-1:1)));
  // Unaware ignores the other side's stat stages; a crit ignores the attacker's drops and the defender's boosts
  if(dab==='Unaware')aB=0;if(ab==='Unaware'||['Sacred Sword','Darkest Lariat','Chip Away'].includes(nm))dB=0;if(crit){aB=Math.max(0,aB);dB=Math.min(0,dB)}
  let a=statStage(calcStat(S.p,aStat,aPts,natMul(S.nat,aStat)),aB),d=statStage(calcStat(D.p,dStat,dStat==='Def'?D.defSp:D.spdSp,natMul(D.nat,dStat)),dB);
  if(phys&&ab==='Hustle')a=Math.floor(a*1.5);
  const burned=!!A.burn,am=[];
  if(ab==='Solar Power'&&!phys&&fw==='sun')am.push(6144);
  // Plus / Minus: 1.5× Sp. Atk when an ally on the field has Plus or Minus (o.plusAlly)
  else if((ab==='Guts'&&burned&&phys)||(o.pinch&&type==={Blaze:'Fire',Torrent:'Water',Overgrow:'Grass',Swarm:'Bug'}[ab])||(o.plusAlly&&!phys&&(ab==='Plus'||ab==='Minus')))am.push(6144);
  else if((ab==='Fire Mane'&&type==='Fire')||(ab==='Steelworker'&&type==='Steel')||(ab==="Dragon's Maw"&&type==='Dragon')||(ab==='Rocky Payload'&&type==='Rock'))am.push(6144);
  else if(ab==='Transistor'&&type==='Electric')am.push(5325);
  else if((ab==='Water Bubble'&&type==='Water')||(phys&&(ab==='Huge Power'||ab==='Pure Power')))am.push(8192);
  if((dab==='Thick Fat'&&(type==='Fire'||type==='Ice'))||(dab==='Water Bubble'&&type==='Fire')||(dab==='Purifying Salt'&&type==='Ghost')||(dab==='Heatproof'&&type==='Fire'))am.push(2048);
  if((aIt==='Choice Band'&&phys)||(aIt==='Choice Specs'&&!phys))am.push(6144);
  // Light Ball doubles Pikachu's Attack and Sp. Atk (any Pikachu form)
  if(aIt==='Light Ball'&&(A.p.b||A.p.n||'').startsWith('Pikachu'))am.push(8192);
  a=applyMods(a,am);
  if(ab!=='Mega Sol'){if(fw==='sand'&&dStat==='SpD'&&D.p.t.includes('Rock'))d=pokeRound(d*1.5);if(fw==='snow'&&dStat==='Def'&&D.p.t.includes('Ice'))d=pokeRound(d*1.5)}
  const dm=[];if(dStat==='Def'&&dab==='Fur Coat')dm.push(8192);else if(dStat==='Def'&&dab==='Grass Pelt'&&T==='grassy')dm.push(6144);
  if(dIt==='Assault Vest'&&dStat==='SpD')dm.push(6144);d=applyMods(d,dm);
  // move power (b: this hit's own power, which Technician reads)
  // Long Reach: its moves don't make contact (no Tough Claws / Fluffy / Rough Skin / Rocky Helmet)
  const contact=isContact(mv)&&ab!=='Long Reach';
  const power=b=>{const m=[];
    if(nm==='Facade'&&burned)m.push(8192);else if(nm==='Expanding Force'&&gA&&T==='psychic')m.push(6144);else if((nm==='Knock Off'&&D.item&&!fixedItem(D))||(nm==='Misty Explosion'&&gA&&T==='misty'))m.push(6144);
    else if((nm==='Solar Beam'||nm==='Solar Blade')&&['rain','sand','snow'].includes(aw))m.push(2048);
    if(o.hh)m.push(6144);
    // terrain: 1.3× for a grounded attacker's matching type; Grassy halves Earthquake/Bulldoze and Misty halves Dragon into grounded targets
    if(gA&&((T==='grassy'&&type==='Grass')||(T==='electric'&&type==='Electric')||(T==='psychic'&&type==='Psychic')))m.push(5325);
    if(gD&&((T==='misty'&&type==='Dragon')||(T==='grassy'&&(nm==='Earthquake'||nm==='Bulldoze'))))m.push(2048);
    if((ab==='Technician'&&b<=60)||(ab==='Mega Launcher'&&mFlag(nm,'u',PULSE))||(ab==='Strong Jaw'&&mFlag(nm,'b',BITE))||(ab==='Steely Spirit'&&type==='Steel')||(ab==='Sharpness'&&mFlag(nm,'k',SHARP)))m.push(6144);
    // Fairy Aura / Dark Aura boost every move of that type on the field, from either side (o.auras: abilities of the other
    // Pokémon on the field, e.g. a partner's Mega Floette)
    if(ab===type+' Aura'||dab0===type+' Aura'||(Array.isArray(o.auras)&&o.auras.includes(type+' Aura')))m.push(5448);
    if((ab==='Sheer Force'&&isSheer(nm))||(ab==='Sand Force'&&fw==='sand'&&['Rock','Ground','Steel'].includes(type))||(ab==='Tough Claws'&&contact)||(ab==='Punk Rock'&&mv.sound)
      // Analytic: 1.3× when the user moves after the target (o.atkLast, decided from Speed by the caller)
      ||(ab==='Analytic'&&o.atkLast))m.push(5325);
    if(ate)m.push(4915);if((ab==='Reckless'&&isRecoil(nm))||(ab==='Iron Fist'&&mFlag(nm,'p',PUNCH)))m.push(4915);
    if(dab==='Dry Skin'&&type==='Fire')m.push(5120);
    // Supreme Overlord (Kingambit): +10% power for each fainted ally, up to 5
    if(ab==='Supreme Overlord'&&o.fainted)m.push([4096,4506,4915,5325,5734,6144][Math.min(5,o.fainted)]);
    // Normal Gem: 1.3× the first Normal-type move (then it's used up)
    if(aIt==='Normal Gem'&&type==='Normal')m.push(5325);
    if(TYPE_ITEM[aIt]===type)m.push(4915);else if((aIt==='Muscle Band'&&phys)||(aIt==='Wise Glasses'&&!phys))m.push(4505);
    return applyMods(b,m)};
  // hits: 2–5 hit moves count 3 (5 with Skill Link); Parental Bond adds a second hit at 1/4 power (single-target moves).
  // Expanding Force in Psychic Terrain hits both foes, so it takes the spread cut; o.oneFoe = only one foe left on the field
  // (the other fainted or isn't there), so a spread move hits at full power (Showdown applies the cut only with 2+ targets).
  const spread=!o.oneFoe&&(!!o.spread||(nm==='Expanding Force'&&gA&&T==='psychic'));
  // Dragon Darts in doubles hits each foe once; both darts hit one target only when the other foe is protected, immune or
  // gone (o.dartsBoth)
  const mhR=(MMETA(nm)||{}).mh,mhN=nm==='Dragon Darts'&&!o.dartsBoth?1:(MULTI_HIT[nm]||(Array.isArray(mhR)?(mhR[1]>=5?3:mhR[1]):(mhR||1)));
  const hits0=beatUp?beatUp.length:mhN===3&&(MULTI_HIT[nm]===3||Array.isArray(mhR))&&ab==='Skill Link'?5:mhN,pb=ab==='Parental Bond'&&hits0===1&&!spread,hits=pb?2:hits0;
  const wMod=aw==='sun'?(type==='Fire'?6144:type==='Water'?2048:4096):aw==='rain'?(type==='Water'?6144:type==='Fire'?2048:4096):4096;
  const baseOf=h=>{let x=Math.floor(Math.floor(22*power(RISING_HIT[nm]?RISING_HIT[nm]*(h+1):beatUp?beatUp[h]:bp)*a/d)/50)+2;
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
    // Friend Guard is the partner's ability, so Mold Breaker (and Teravolt/Turboblaze) ignores it too (Showdown: breakable)
    if(o.fg&&!['Mold Breaker','Teravolt','Turboblaze'].includes(ab))f.push(3072);if(dab==='Fluffy'&&type==='Fire')f.push(8192);
    if(aIt==='Expert Belt'&&eff>1)f.push(4915);else if(aIt==='Life Orb')f.push(5324);
    // Ripen doubles the berry: the hit is halved again (a quarter in all)
    if(first&&ab!=='Unnerve'&&RESIST_BERRY[dIt]===type&&(eff>1||type==='Normal')){f.push(2048);if(dab0==='Ripen')f.push(2048)}
    return chain4096(f)};
  const burn=burned&&phys&&ab!=='Guts'&&nm!=='Facade',FA=finOf(true),FB=finOf(false),H=[...Array(hits)].map((_,h)=>baseOf(h));
  const one=(base,r,fm)=>{let x=Math.floor(base*r/100);x=pokeRound(x*stabMod/4096);x=Math.floor(x*eff);if(burn)x=Math.floor(x/2);return Math.max(1,pokeRound(x*fm/4096))};
  // Disguise (Mimikyu): the first hit only breaks the disguise and costs it 1/8 of its HP
  const disg=dab==='Disguise'&&o.fullHp!==false,dg=Math.floor(hp/8);
  const R=[...Array(16)].map((_,i)=>85+i),rolls=R.map(r=>H.reduce((s,b,h)=>s+(disg&&h===0?dg:one(b,r,h?FB:FA)),0)),later=R.map(r=>H.reduce((s,b)=>s+one(b,r,FB),0));
  return {min:rolls[0],max:rolls[15],rolls,hp,eff:eff*abMul,type,hits,next:{min:later[0],max:later[15],rolls:later},sash:dIt==='Focus Sash'&&hits===1&&o.fullHp!==false,
    band:dIt==='Focus Band',contact,beatUp,bp,crit,critStage:critStage(A,mv),aTypes:ta,dTypes:td}}
// Fewest bulk points (HP + the defense the move hits) that survive every roll, keeping the defender's nature.
function bulkToSurvive(o){const mv=o.move;if(!mv||!mv.bp||mv.cat===0||mv.fixed||mv.ohko||mv.vbp==='half')return null;const special=mv.cat===2&&!['Psyshock','Psystrike','Secret Sword'].includes(mv.name);
  const cur=o.def.hpSp+(special?o.def.spdSp:o.def.defSp);
  // within Champions' 66-point total: the other defensive stat keeps its points, so HP + this defense can use the rest
  const room=Math.min(64,66-(special?o.def.defSp:o.def.spdSp));
  for(let tot=0;tot<=room;tot++)for(let hp=Math.min(32,tot);hp>=Math.max(0,tot-32);hp--){const df=tot-hp;
    const r=damage({...o,def:{...o.def,hpSp:hp,defSp:special?o.def.defSp:df,spdSp:special?df:o.def.spdSp}});if(r&&r.max<r.hp)return {hp,df,tot,cur,stat:special?'SpD':'Def'}}
  return {none:true}}
// KO odds from the 16 real damage rolls. Later hits use r.next (Multiscale only softens the first); Focus Sash leaves 1 HP.
// Focus Band: a 10% chance to hold on at 1 HP from any hit that would KO (never relied on, only noted)
function koText(r){const t=koText0(r);return r&&r.band&&r.max>0&&r.max+(r.next||r).max>=r.hp&&!r.sash?t+' (Focus Band: 10% to hold on at 1 HP)':t}
function koText0(r){if(!r)return '';if(r.max===0)return 'No effect';const rolls=r.rolls||[r.min,r.max],nx=r.next||r;
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
  if(cs)return role==='atk'?{nat:cs.nat,sp:phys?cs.atk:cs.spa,spA:cs.atk,spS:cs.spa,spDef:cs.def,hpSp:cs.hp,item,ability:ab,boost:0,real:true,src:cs.mine&&!cs.assumed?'yours':'assumed'}
    :{nat:cs.nat,hpSp:cs.hp,defSp:cs.def,spdSp:cs.spd,atkSp:cs.atk,item,ability:ab,boost:0,real:true,src:cs.mine&&!cs.assumed?'yours':'assumed'};
  // no spread data: assume full Defense for Body Press on Pokémon built around their Defense (base 100+);
  // a defender's Attack points (for Foul Play) are full on physical attackers
  return role==='atk'?{nat:nat||(phys?'Adamant':'Modest'),sp:32,spDef:st[2]>=100?32:0,item,ability:ab,boost:0,src:'estimated'}
    :{nat:nat||'Hardy',hpSp:32,defSp:0,spdSp:0,atkSp:phys?32:0,item,ability:ab,boost:0,src:'estimated'}}
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
// where a side's points and nature come from: your own spread, or an assumption (the most common spread, or an estimate)
const dcSrc=X=>X&&X.src&&X.src!=='yours'?`<span class="asm" title="${X.src==='estimated'?'No spread data: points and nature are estimated':'Most common spread (or your nature on it); change the boxes to match yours'}">${X.src==='estimated'?'estimated':'assumed'} spread</span>`:'';
// Turn order between the two calc sides (for Analytic and Zoom Lens): each side's likely Speed (your spread for your own
// Pokémon), the item picked here (Choice Scarf ×1.5, Iron Ball ×0.5) and weather speed abilities; no Tailwind or Trick Room.
// Stall always moves last in its bracket; a priority move goes first. last: the attacker moves after the defender.
function dcSpeed(X,weather){let mem=null;try{mem=members().find(m=>m.p.n===X.p.n)}catch(e){}let v=likelySpeed0(X.p,mem).v;if(X.item==='Iron Ball')v=Math.floor(v/2);
  return spdCalc(v,X.item==='Choice Scarf',X.ability,weather||'',{})}
function dcOrder(A,D,mv,weather,terrain){const a=dcSpeed(A,weather),d=dcSpeed(D,weather),pr=movePrio(mv,A.ability,{terrain})>0;
  const sa=A.ability==='Stall',sd=D.ability==='Stall';
  const last=!pr&&!sd&&(sa||a<d),tie=!pr&&sa===sd&&a===d;return {a,d,last,tie,pr,stall:sa!==sd}}
// What the calc knows about the attacker's own side: your team when it's your Pokémon. plusAlly: a teammate has Plus or Minus
// (counted as if it's the partner on the field); party: the Pokémon brought for Beat Up (it and your next three).
function dcContext(A,ms){const me=ms.find(m=>m.p.n===A.p.n);if(!me)return {plusAlly:false,party:null,mine:false};
  const rest=ms.filter(m=>m!==me),pm=rest.find(m=>['Plus','Minus'].includes(m.ability||abilityOf(m)));
  return {mine:true,plusAlly:!!pm,plusBy:pm,party:[me.p,...rest.slice(0,3).map(m=>m.p)],partyN:rest.slice(0,3)}}
const dname=X=>esc(X.p.d||X.p.n);
// Short notes under a calc result for the mechanics counted (or noted) from the sets: turn order, contact damage, recoil,
// crit chance, flinch, type changes and the special moves.
function calcNotes(A,D,mv,r,ord,ctx,weather,terrain){const t=[];if(!r||!mv)return t;const ab=A.ability||'',it=ab==='Klutz'?'':(A.item||''),dab=D.ability||'',dit=dab==='Klutz'?'':(D.item||'');
  if(ab==='Analytic'&&ord){if(ord.pr)t.push('Analytic not counted: a priority move goes first');else if(ord.last)t.push(`Analytic 1.3×: moves after ${dname(D)} (${ord.stall?'Stall':`Speed ${ord.a} vs ${ord.d}`}); in doubles it needs to move last of all four`);
    else if(ord.tie)t.push(`Analytic not counted: Speed tie with ${dname(D)} (${ord.a}), 1.3× only if it moves second`);else t.push(`Analytic not counted: moves before ${dname(D)} (Speed ${ord.a} vs ${ord.d})`)}
  if(['Plus','Minus'].includes(ab)&&mv.cat===2)t.push(ctx.plusAlly?`${esc(ab)} 1.5× Sp. Atk: counts your ${esc(ctx.plusBy.d||ctx.plusBy.p.n)} (${esc(ctx.plusBy.ability||abilityOf(ctx.plusBy))}) as its partner`:`${esc(ab)} not counted: needs a Plus or Minus partner on the field`);
  if(it==='Zoom Lens'&&ord&&(MMETA(mv.name)||{}).a<100)t.push(ord.last?`Zoom Lens: 1.2× accuracy, it moves after ${dname(D)}`:`Zoom Lens: no boost, it moves first`);
  if(r.aTypes)t.push(`${dname(A)} is ${r.aTypes.join('/')} type here (${esc(ab)})`);if(r.dTypes)t.push(`${dname(D)} is ${r.dTypes.join('/')} type here (${esc(dab)})`);
  if(ab==='Long Reach'&&isContact(mv))t.push('Long Reach: no contact');
  if(r.max>0){
    // contact: Rough Skin / Iron Barbs (1/8) and Rocky Helmet (1/6) hurt the attacker; Magic Guard ignores both
    if(r.contact){const c=[];if(['Rough Skin','Iron Barbs'].includes(dab))c.push(`${esc(dab)} 1/8`);if(dit==='Rocky Helmet')c.push('Rocky Helmet 1/6');
      if(c.length)t.push(ab==='Magic Guard'?`no damage back from ${c.map(x=>x.split(' 1/')[0]).join(' or ')} (Magic Guard)`:`contact: ${dname(A)} loses ${c.join(' + ')} of its max HP`)}
    // recoil (a share of the damage dealt; Rock Head and Magic Guard stop it). Steel Beam / Mind Blown cost half the user's HP
    // whatever the damage, which Rock Head doesn't stop.
    const rc=(MMETA(mv.name)||{}).rc;if(rc){if(['Steel Beam','Mind Blown','Chloroblast'].includes(mv.name))t.push(ab==='Magic Guard'?'no HP cost (Magic Guard)':'costs the user half its max HP');
      else if(ab==='Rock Head'||ab==='Magic Guard')t.push(`no recoil (${esc(ab)})`);
      else{const rv=x=>Math.max(1,Math.round(Math.min(x,r.hp)*rc[0]/rc[1]));t.push(`recoil ${rv(r.min)}–${rv(r.max)} HP (${Math.round(100*rc[0]/rc[1])}% of the damage)`)}}
    // crit chance when it's above the usual 1 in 24
    if(!r.crit&&r.critStage>0){const why=[];if((MMETA(mv.name)||{}).cr>1)why.push('high-crit move');if(ab==='Super Luck')why.push('Super Luck');if(it==='Scope Lens')why.push('Scope Lens');if(it==='Leek'&&r.critStage>=2)why.push('Leek');
      t.push(`crit chance ${CRIT_TXT[r.critStage]}${why.length?` (${why.join(', ')})`:''}`)}
    else if(r.crit&&!dc.crit&&r.critStage>=3&&!ALWAYS_CRIT.includes(mv.name)&&!((MMETA(mv.name)||{}).cr>=9))t.push('always a critical hit (crit stage +3)');
    // King's Rock / Stench: 10% flinch on attacks without their own flinch chance (Serene Grace 20%), only if it moves first
    const fl=(it==="King's Rock"||ab==='Stench')&&!((MMETA(mv.name)||{}).s||[]).some(x=>x[3]);
    if(fl&&!['Inner Focus','Shield Dust'].includes(dab))t.push(`${it==="King's Rock"?"King's Rock":'Stench'}: ${ab==='Serene Grace'?20:10}% to flinch if it moves first`)}
  if(mv.vbp==='fling'&&r.max>0)t.push(`Fling: ${r.bp} power from ${esc(it)} (the item is used up)`);
  if(r.beatUp)t.push(`Beat Up: ${r.beatUp.length} hits (${r.beatUp.join('/')} power), one per Pokémon brought${ctx.mine?`: ${dname(A)}${ctx.partyN.map(m=>', '+esc(m.d||m.p.n)).join('')}`:', assuming 4 like it'}, none fainted or statused`);
  if(mv.vbp==='gambit'&&r.max>0)t.push(`Final Gambit: damage equals the user's HP (full HP assumed: ${A.hpSp??0} HP points), then the user faints`);
  return t}
// "Not counted" labels for the attacker's or defender's ability, item or move (NOT_COUNTED)
function notCounted(A,D,mv,r){const out=[],seen=new Set(),add=(k,side)=>{const x=NOT_COUNTED[k];if(!x||seen.has(k)||!(x[1]==='b'||x[1]===side))return;seen.add(k);out.push(`${k} (${x[0]})`)};
  const pinchT={Blaze:'Fire',Torrent:'Water',Overgrow:'Grass',Swarm:'Bug'};
  if(!(pinchT[A.ability]&&r&&r.type!==pinchT[A.ability]))add(A.ability,'a');if(A.ability!=='Klutz')add(A.item,'a');add(mv&&mv.name,'a');
  if(!(D.ability==='Marvel Scale'&&mv&&mv.cat!==1))add(D.ability,'d');return out}
function renderCalc(){const el=$('dcOut');if(!el)return;const ms=members();
  if(!dc.a||!byName.get(dc.a))dc.a=(ms[0]&&ms[0].p.n)||'Garchomp';
  if(!dc.d||!byName.get(dc.d)){let t=[];try{t=metaThreats(5).map(x=>x.p||x)}catch(e){}dc.d=(t.find(p=>p.n!==dc.a)||byName.get('Incineroar')||ROSTER[1]).n}
  const A=dcSide('atk',dc.a),D=dcSide('def',dc.d);const mvs=dcMoves(A.p);
  // weather follows the attacker until you pick one: its own Drought/Drizzle/..., or your team's weather when it's yours
  // (attacker's own setter first, then the defender's, then your team's when the attacker is yours); same for terrain
  if(!dc.wSet){const mine=ms.some(m=>m.p.n===A.p.n);dc.weather=(typeof WEATHER_OF==='object'&&(WEATHER_OF[A.ability]||WEATHER_OF[D.ability]))||(mine&&typeof sideField==='function'?sideField(ms).weather:'')||''}
  if(!dc.tSet){const mine=ms.some(m=>m.p.n===A.p.n),tk=typeof TERRAIN_OF==='object'?(TERRAIN_OF[A.ability]||TERRAIN_OF[D.ability]):'';dc.terrain=(tk&&typeof TERR_DC==='function'?TERR_DC(tk):'')||(mine&&typeof sideField==='function'?sideField(ms).terrain:'')||''}if(!dc.mv||![...mvs.pop,...mvs.rest].some(m=>m.name===dc.mv)){const dmg=mvs.pop.filter(m=>m&&(+m.bp||0)>0&&m.name!=='Fake Out');dc.mv=(dmg[0]||mvs.pop[0]||mvs.rest[0]||{}).name}
  const mv=mvByName.get(dc.mv);const spread=dc.spread==null?!!(mv&&mv.spread):dc.spread;
  const sel=(id,opts,v)=>`<select class="field" id="${id}">${opts.map(o=>Array.isArray(o)?`<option value="${esc(o[0])}"${o[0]===v?' selected':''}>${esc(o[1])}</option>`:`<option${o===v?' selected':''}>${esc(o)}</option>`).join('')}</select>`;
  const PTS=v=>[...new Set([32,28,24,20,16,12,8,4,0,+v])].sort((a,b)=>b-a).map(x=>[String(x),x===32?'32 (max)':String(x)]);
  // Body Press hits with the attacker's Defense, so the points box (and the stat stage) switch to Defense for it
  const mvC=mvByName.get(dc.mv),bp_=mvC&&mvC.name==='Body Press',aShown=bp_?(A.spDef??0):mvC&&mvC.cat===2?(A.spS??A.sp):(A.spA??A.sp);
  const boosts=[-2,-1,0,1,2].map(x=>[String(x),x>0?'+'+x:String(x)]);
  // a Mega always holds its stone (shown, fixed); any other held item not in the short list is still shown as chosen
  const itemSel=(id,X)=>X.p.m?`<select class="field" id="${id}" disabled title="A Mega always holds its Mega Stone"><option>${esc(typeof stoneFor==='function'?stoneFor(X.p):'Mega Stone')}</option></select>`
    :sel(id,(X.item&&!CALC_ITEMS.includes(X.item)?[...CALC_ITEMS,X.item]:CALC_ITEMS).map(x=>[x,x||'None']),X.item);
  const ord=mv?dcOrder(A,D,mv,dc.weather,dc.terrain):null,ctx=dcContext(A,ms);
  const opt={atk:A,def:D,move:mv,spread,weather:dc.weather,terrain:dc.terrain,fainted:dc.fainted||0,screen:dc.screen,hh:dc.hh,fg:dc.fg,crit:dc.crit,atkLast:!!(ord&&ord.last),plusAlly:ctx.plusAlly,party:ctx.party};
  const r=damage(opt);
  const pct=r&&r.hp?[100*r.min/r.hp,100*r.max/r.hp]:null;
  const bar=pct?`<div class="dcbar"><span style="width:${Math.min(100,pct[0]).toFixed(1)}%" class="lo"></span><span style="width:${Math.max(0,Math.min(100,pct[1])-Math.min(100,pct[0])).toFixed(1)}%" class="hi"></span></div>`:'';
  // phones: the result rides along at the top while you change the inputs below
  const stick=pct&&r&&r.max>0?`<button type="button" class="dcstick" id="dcStick" aria-label="Jump to the full result">${sprite(A.p,'dcsts')}<span class="dcsta">→</span>${sprite(D.p,'dcsts')}<span class="dcstx"><b>${pct[0].toFixed(1)}–${pct[1].toFixed(1)}%</b><span>${esc(koText(r))} · ${esc(dc.mv)}</span></span></button>`:mv&&r&&r.max===0?`<button type="button" class="dcstick" id="dcStick">${sprite(A.p,'dcsts')}<span class="dcsta">→</span>${sprite(D.p,'dcsts')}<span class="dcstx"><b>No effect</b><span>${esc(dc.mv)}</span></span></button>`:'';
  el.innerHTML=stick+`<div class="dcgrid">
    <div class="dccol"><h3>Attacker ${dcSrc(A)}</h3>${sprite(A.p,'dcspr')}
      <label>Pokémon<select class="field" id="dcA">${monOptions(dc.a)}</select></label>
      <label>Move<select class="field" id="dcMv">${mvs.pop.length?`<optgroup label="Its set">${mvs.pop.map(m=>`<option${m.name===dc.mv?' selected':''}>${esc(m.name)}</option>`).join('')}</optgroup>`:''}<optgroup label="Other moves">${mvs.rest.map(m=>`<option${m.name===dc.mv?' selected':''}>${esc(m.name)}</option>`).join('')}</optgroup></select></label>
      <div class="dc2"><label>${bp_?'Defense points (Body Press)':mvC&&mvC.cat===2?'Sp. Atk points':'Attack points'}${sel('dcASp',PTS(aShown),String(aShown))}</label><label>Nature${sel('dcANat',NATURES,A.nat)}</label></div>
      <div class="dc2"><label>Item${itemSel('dcAIt',A)}</label><label>Ability${sel('dcAAb',A.p.a,A.ability)}</label></div>
      <label>${bp_?'Defense stage (Body Press)':'Stat stage (Intimidate = −1)'}${sel('dcABo',boosts,String(A.boost))}</label>
      ${A.ability==='Supreme Overlord'?`<label>Allies fainted (Supreme Overlord: +10% power each)${sel('dcAFt',[0,1,2,3,4,5].map(x=>[String(x),String(x)]),String(dc.fainted||0))}</label>`:''}</div>
    <button type="button" class="btn sm dcswap" id="dcSwap" title="Swap attacker and defender" aria-label="Swap attacker and defender">⇄ Swap</button><div class="dccol"><h3>Defender ${dcSrc(D)}</h3>${sprite(D.p,'dcspr')}
      <label>Pokémon<select class="field" id="dcD">${monOptions(dc.d)}</select></label>
      <div class="dc2"><label>HP points${sel('dcDHp',PTS(D.hpSp),String(D.hpSp))}</label><label>Nature${sel('dcDNat',NATURES,D.nat)}</label></div>
      <div class="dc2"><label>Def points${sel('dcDDf',PTS(D.defSp),String(D.defSp))}</label><label>Sp. Def points${sel('dcDSd',PTS(D.spdSp),String(D.spdSp))}</label></div>
      <div class="dc2"><label>Item${itemSel('dcDIt',D)}</label><label>Ability${sel('dcDAb',D.p.a,D.ability)}</label></div>
      <label>Stat stage${sel('dcDBo',boosts,String(D.boost))}</label></div></div>
    <div class="dcfield"><div class="seg" role="group" aria-label="Weather">${[['','No weather'],['sun','Sun'],['rain','Rain'],['sand','Sand'],['snow','Snow']].map(([k,t])=>`<button type="button" data-dcw="${k}" aria-pressed="${dc.weather===k}">${t}</button>`).join('')}</div>
      <div class="seg" role="group" aria-label="Terrain" style="margin-top:6px">${[['','No terrain'],['grassy','Grassy'],['electric','Electric'],['psychic','Psychic'],['misty','Misty']].map(([k,t])=>`<button type="button" data-dcterr="${k}" aria-pressed="${dc.terrain===k}">${t}</button>`).join('')}</div>
      <div class="seg segwrap" role="group" aria-label="Field">${[['spread','Hits both foes'],['screen','Screen up'],['hh','Helping Hand'],['fg','Friend Guard'],['crit','Critical hit']].map(([k,t])=>`<button type="button" data-dct="${k}" aria-pressed="${k==='spread'?spread:!!dc[k]}">${t}</button>`).join('')}</div></div>
    <div class="dcres">${!mv?'<div class="empty-note">Pick a damaging move.</div>':!r?`<div class="empty-note">${mv.vbp==='counter'?`${esc(mv.name)} hits back with ${mv.name==='Metal Burst'||mv.name==='Comeuppance'?'1.5×':'2×'} the damage it takes that turn, so it depends on the hit it receives and isn't calculated here.`:mv.vbp==='endeavor'?'Endeavor cuts the target down to your own HP, so it depends on how much HP you have left.':mv.vbp==='stockpile'?'Not counted: Spit Up needs Stockpile first (its power depends on how many).':mv.cat>0?'This move\'s damage depends on the battle and isn\'t calculated.':'This move does no direct damage.'}</div>`:r.max===0?r.fail?`<b>No effect.</b> ${esc(r.fail)}.`:`<b>No effect.</b> ${esc(D.p.d||D.p.n)} is immune to ${esc(r.type)}.`:
      `<div class="dcbig">${pct[0].toFixed(1)}–${pct[1].toFixed(1)}%</div>${bar}<div><b>${koText(r)}</b> · ${r.min}–${r.max} of ${r.hp} HP${r.hits>1?` · ${r.hits} hits${MULTI_HIT[dc.mv]===3&&r.hits===3?' (2–5)':''}`:''}${r.eff!==1?` · ${r.eff}× ${esc(r.type)}`:''}</div>
      ${(()=>{const t=[],acc=moveAcc(mv,A.ability,dc.weather,D,A.item,A.p.t,!!(ord&&ord.last));
        if(mv.vbp==='wt')t.push(`power from ${esc(D.p.d||D.p.n)}'s weight (${wtOf(D.p)} kg)`);if(mv.vbp==='wtr')t.push(`power from the weight ratio (${wtOf(A.p)} kg vs ${wtOf(D.p)} kg)`);
        if(mv.vbp==='lowhp')t.push('assumes full HP (20 power; more as HP drops)');if(mv.vbp==='userhp')t.push('assumes the user is at full HP (power drops with its HP)');
        {const CN={'Stomping Tantrum':'doubles if the user\'s last move failed','Temper Flare':'doubles if the user\'s last move failed',Payback:'doubles if the user moves after the target',Round:'doubles if an ally used Round first this turn',
          Avalanche:'doubles if the user was hit first this turn',Revenge:'doubles if the user was hit first this turn',Retaliate:'doubles if an ally fainted last turn','Fishious Rend':'doubles if the user moves first','Bolt Beak':'doubles if the user moves first',
          Assurance:'doubles if the target was already hit this turn','Lash Out':'doubles if the user\'s stats were lowered this turn'};if(CN[mv.name])t.push(`listed power; ${CN[mv.name]}`)}if(mv.vbp==='hex')t.push('assumes no status on the target (130 power if it has one)');
        if(mv.fixed==='level')t.push('fixed damage: the user\'s level (50)');if(mv.vbp==='half')t.push('half the target\'s current HP');if(r.ohko)t.push('one-hit KO move: KOs only if it lands');
        if(acc<100)t.push(`${acc}% to hit`);if(chargesFirst(mv,dc.weather,A.item))t.push(mv.name==='Electro Shot'?'charges a turn first unless it\'s raining (or Power Herb)':mv.name==='Solar Beam'||mv.name==='Solar Blade'?'charges a turn first unless the sun is out (or Power Herb)':'charges a turn first (Power Herb skips it)');
        if(mv.recharge)t.push('the user must recharge next turn');if(mv.name==='Dragon Darts')t.push('one dart per foe in doubles (both darts hit one target only if the other foe is protected or gone)');if(D.ability==='Disguise')t.push('Disguise takes the first hit (only 1/8 of its HP)');
        t.push(...calcNotes(A,D,mv,r,ord,ctx,dc.weather,dc.terrain));
        const nc=notCounted(A,D,mv,r);
        return (t.length?`<p class="t2">${t.join(' · ')}</p>`:'')+(nc.length?`<p class="t2">Not counted: ${nc.join('; ')}.</p>`:'')})()}
      ${(()=>{if(!r||r.max===0)return '';const bs=bulkToSurvive(opt);if(!bs)return '';if(bs.none)return `<p class="dcbulk">${esc(D.p.d||D.p.n)} can't survive this hit with any spread.</p>`;return `<p class="dcbulk">Fewest points to always survive: <b>${bs.hp} HP / ${bs.df} ${bs.stat}</b> (${bs.tot} total). ${r.max<r.hp?'This spread already survives.':'This spread does not.'}</p>`})()}
      <p class="t2">${esc(A.p.d||A.p.n)} ${aShown} ${mvC&&mvC.cat===2?'SpA':'Atk'} points ${esc(A.nat)}${A.item?' '+esc(A.item):''} · ${esc(dc.mv)}${spread?' (spread)':''} vs ${esc(D.p.d||D.p.n)} ${D.hpSp} HP / ${D.defSp} Def / ${D.spdSp} SpD ${esc(D.nat)}${D.item?' '+esc(D.item):''}${A.real||D.real?' · spreads: most common on the Showdown ladder':''}${A.p.n==='Aegislash'?' · Aegislash attacks in Blade Forme (Atk/SpA 140)':''}${D.p.n==='Aegislash'?' · Aegislash takes hits in Shield Forme':''}${A.p.formNote||D.p.formNote?' · Palafin in Hero Form':''}${dc.wSet||dc.tSet||!(dc.weather||dc.terrain)?'':' · field set by the Pokémon selected (change it above)'}</p>`}</div>
    ${renderHitTable(ms)}`;dcStickWatch()}
// Your team's best hit on each top threat (each side's usual set).
// field: {weather, terrain} in play (sun from Drought, etc.), so a lead's weather boost is counted
function bestHitOn(atkP,atkMoves,defP,aMem,dMem,field){let best=null;const A={p:atkP,...sideDefaults(atkP,'atk',aMem)},D={p:defP,...sideDefaults(defP,'def',dMem)};const F=field||{};
  // best by what you can count on: a move's damage is weighed by its accuracy, a two-turn move that charges first or a move
  // that must recharge counts for less, so a coin-flip OHKO move or Hyper Beam doesn't outrank a reliable attack
  for(const mv of atkMoves){if(!mv||!mv.bp)continue;const r=damage({atk:A,def:D,move:mv,spread:!!mv.spread,weather:F.weather||'',terrain:F.terrain||'',auras:F.auras});if(!r||!r.hp)continue;
    const ch=chargesFirst(mv,F.weather,A.item),acc=moveAcc(mv,A.ability,F.weather,D,A.item),val=r.max*acc/100*(ch?.5:1)*(mv.recharge?.7:1);
    if(!best||val>best.val)best={mv,r,val,charge:ch,acc,recharge:!!mv.recharge}}return best}
// plain words for what a best hit depends on: "charges first", "70% to hit", "must recharge", "one-hit KO move"
function hitNote(b){if(!b)return '';const t=[];if(b.charge)t.push('charges first');if(b.acc!=null&&b.acc<100)t.push(b.acc+'% to hit');if(b.recharge)t.push('must recharge');if(b.r&&b.r.ohko)t.push('one-hit KO move');return t.join(', ')}
// Chance (0-100) a move hits: No Guard always; rain makes Hurricane/Thunder sure-hit (sun: 50%), snow Blizzard; Compound Eyes ×1.3,
// Wide Lens ×1.1, Hustle ×0.8 on physical moves; the target's Sand Veil / Snow Cloak in their weather ×0.8, Bright Powder ×0.9
// Attacks that never miss (accuracy "true" in Showdown's Champions data): no accuracy modifier touches them
const SURE_HIT=new Set(['Aerial Ace','Aura Sphere','Smart Strike','Clear Smog','Shadow Punch','Flower Trick','Kowtow Cleave','Swift','Magical Leaf','Shock Wave','Magnet Bomb','Vital Throw','Feint Attack','Disarming Voice']);
// One-hit KO moves: 30% (Sheer Cold 20% unless the user is Ice type), and accuracy modifiers don't apply to them
const OHKO_MOVES=new Set(['Fissure','Horn Drill','Sheer Cold','Guillotine']);
// moved: the user moves after the target (Zoom Lens ×1.2, 4915/4096 as Showdown)
function moveAcc(mv,ab,weather,def,item,userTypes,moved){if(!mv)return 100;if(ab==='No Guard'||(def&&def.ability==='No Guard'))return 100;
  if(SURE_HIT.has(mv.name))return 100;if(OHKO_MOVES.has(mv.name)||mv.ohko){const base=(typeof MOVE_ACC==='object'&&MOVE_ACC[mv.name])||30;return mv.name==='Sheer Cold'&&userTypes?(userTypes.includes('Ice')?30:20):base}
  let a=mv.acc||(typeof MOVE_ACC==='object'&&MOVE_ACC[mv.name])||100;
  if(['Hurricane','Thunder'].includes(mv.name)){if(weather==='rain')return 100;if(weather==='sun')a=50}if(mv.name==='Blizzard'&&weather==='snow')return 100;
  if(ab==='Compound Eyes')a*=1.3;if(item==='Wide Lens')a*=1.1;if(item==='Zoom Lens'&&moved)a=a*4915/4096;if(ab==='Hustle'&&mv.cat===1)a*=.8;
  if(def&&((def.ability==='Sand Veil'&&weather==='sand')||(def.ability==='Snow Cloak'&&weather==='snow')))a*=.8;if(def&&def.item==='Bright Powder')a*=.9;
  return Math.min(100,Math.round(a))}
function renderHitTable(ms){if(!ms.length)return '';let thr=[];try{thr=metaThreats(12).map(x=>x.p||x).filter(p=>p&&p.st)}catch(e){}if(!thr.length)return '';
  const cell=b=>{if(!b)return '<td class="dcz">–</td>';const p=100*b.r.max/b.r.hp,lo=100*b.r.min/b.r.hp,c=lo>=100?'k1':p>=100?'k1m':lo>=50?'k2':p>=50?'k2m':'k3';const nt=hitNote(b);return `<td class="${c}" title="${esc(b.mv.name)}: ${lo.toFixed(0)}–${p.toFixed(0)}%${nt?' ('+nt+')':''}">${p.toFixed(0)}<span>${esc(b.mv.name)}${nt?' *':''}</span></td>`};
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
  // once you set a side's points or nature yourself, it's no longer an assumption
  if(/^dcA(Sp|Nat)$/.test(t.id)&&dc.inv[ak])dc.inv[ak].src='yours';if(/^dcD(Hp|Df|Sd|Nat)$/.test(t.id)&&dc.inv[dk])dc.inv[dk].src='yours';
  if(t.id==='dcA'){dc.a=v;dc.mv=null;dc.spread=null;dc.wSet=dc.tSet=false}else if(t.id==='dcD'){dc.d=v;dc.wSet=dc.tSet=false}else if(t.id==='dcMv'){dc.mv=v;dc.spread=null}
  else if(t.id==='dcASp'){const I=dc.inv[ak],m=mvByName.get(dc.mv);if(m&&m.name==='Body Press')I.spDef=+v;else{I.sp=+v;if(m&&m.cat===2)I.spS=+v;else I.spA=+v}}
  else if(t.id==='dcAFt')dc.fainted=+v||0;else if(t.id==='dcANat')dc.inv[ak].nat=v;else if(t.id==='dcAIt')dc.inv[ak].item=v;else if(t.id==='dcAAb')dc.inv[ak].ability=v;else if(t.id==='dcABo')dc.inv[ak].boost=+v;
  // Champions caps a Pokémon at 66 stat points in total (32 in any one stat): a change that would pass 66 takes the
  // points from the other two defensive stats, so the defender never shows an illegal spread
  else if(t.id==='dcDHp'||t.id==='dcDDf'||t.id==='dcDSd'){const I=dc.inv[dk],k={dcDHp:'hpSp',dcDDf:'defSp',dcDSd:'spdSp'}[t.id];I[k]=+v;
    let over=I.hpSp+I.defSp+I.spdSp-66;for(const o of ['spdSp','defSp','hpSp']){if(over<=0)break;if(o===k)continue;const take=Math.min(over,I[o]);I[o]-=take;over-=take}}
  else if(t.id==='dcDNat')dc.inv[dk].nat=v;else if(t.id==='dcDIt')dc.inv[dk].item=v;else if(t.id==='dcDAb')dc.inv[dk].ability=v;else if(t.id==='dcDBo')dc.inv[dk].boost=+v;
  if(t.id)dcRerender(t);else renderCalc()});
// A field button redraws the whole calculator; the button you tapped stays at the same spot on screen (Sim, Oct 30: the page
// jumped about 77px and the numbers seemed to flicker). Runs before the screen paints.
function dcPin(b,fn){const at=['data-dcw','data-dct','data-dcdir','data-dcterr'].find(a=>b.hasAttribute(a)),sel=at?`[${at}="${CSS.escape(b.getAttribute(at))}"]`:(b.id?'#'+b.id:null),top=b.getBoundingClientRect().top,y=scrollY;
  fn();const n=sel&&document.querySelector('#dcOut '+sel);if(n){const d=n.getBoundingClientRect().top-top;if(Math.abs(d)>1)scrollBy(0,d)}else if(Math.abs(scrollY-y)>1)scrollTo(0,y)}
function dcRerender(b){dcPin(b,()=>renderCalc())}
document.addEventListener('click',e=>{const b0=e.target.closest('[data-dcw],[data-dct],[data-dcdir],[data-dcterr],#dcSwap');if(!b0)return;const renderCalc=()=>dcRerender(b0);const b=b0;if(b.dataset.dcterr!=null){dc.terrain=b.dataset.dcterr;dc.tSet=true;renderCalc();return}if(b.dataset.dcdir){dc.dir=b.dataset.dcdir;keepScroll(()=>renderCalc());return}if(b.id==='dcSwap'){const a=dc.a;dc.a=dc.d;dc.d=a;dc.mv=null;dc.spread=null;renderCalc();return}
  if(b.dataset.dcw!=null){dc.weather=b.dataset.dcw;dc.wSet=true}else{const k=b.dataset.dct;if(k==='spread'){const mv=mvByName.get(dc.mv);const cur=dc.spread==null?!!(mv&&mv.spread):dc.spread;dc.spread=!cur}else dc[k]=!dc[k]}renderCalc()});


// the pinned result hides while the full result is on screen, and taps through to it
let dcObs=null;
function dcStickWatch(){const st=$('dcStick'),res=document.querySelector('#dcOut .dcres');if(dcObs){dcObs.disconnect();dcObs=null}if(!st||!res)return;
  const band=document.querySelector('header.band');if(band)document.documentElement.style.setProperty('--bandh',(getComputedStyle(band).position==='sticky'?band.getBoundingClientRect().height:0)+'px');
  // decide right away, before the screen paints, whether the full result is on screen: a redraw (tapping a weather) makes a new
  // bar that would otherwise show for a frame until the observer reports, which flickered at the top (Sim, Oct 30)
  {const r=res.getBoundingClientRect(),vh=innerHeight||document.documentElement.clientHeight,vis=Math.max(0,Math.min(r.bottom,vh)-Math.max(r.top,0));st.style.transition='none';st.classList.toggle('off',r.height>0&&vis/r.height>=.35);void st.offsetWidth;st.style.transition=''}
  try{dcObs=new IntersectionObserver(es=>{for(const x of es)st.classList.toggle('off',x.isIntersecting)},{threshold:.35});dcObs.observe(res)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#dcStick');if(!b)return;const res=document.querySelector('#dcOut .dcres');if(res)try{res.scrollIntoView({behavior:'smooth',block:'center'})}catch(er){res.scrollIntoView()}});

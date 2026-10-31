(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// type colours: bright and clean, each type keeping its own hue (Oct 31: Sim "i hate dull" — the old greys, browns and muted
// purples were lifted; neutral types stay neutral so Normal never reads as Electric or Steel as Flying)
const TC={Normal:'#aba88a',Fire:'#f06428',Water:'#3d82f2',Electric:'#f7c815',Grass:'#46b62e',Ice:'#5ed6d0',Fighting:'#d0352b',Poison:'#a83fc2',Ground:'#e2b14a',Flying:'#8b8af2',Psychic:'#f24f80',Bug:'#9eb81b',Rock:'#c6a53a',Ghost:'#7452b3',Dragon:'#6a3cee',Dark:'#5f4536',Steel:'#9db0cc',Fairy:'#f28cc0'};
// types whose colour reads better with dark ink than white, worked out from the colour itself (no darkening overlays)
const LIGHT=new Set(Object.keys(TC).filter(t=>{const L=h=>{const v=parseInt(h,16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)},c=TC[t],l=.2126*L(c.slice(1,3))+.7152*L(c.slice(3,5))+.0722*L(c.slice(5,7)),ink=.0168;return (l+.05)/(ink+.05)>=1.05/(l+.05)}));
const ticon=(t,cls='tic')=>`<svg class="${cls}" aria-hidden="true"><use href="#ti-${t}"/></svg>`;
const chip=(t,extra='')=>`<span class="ty${LIGHT.has(t)?' lt':''}" style="background:${TC[t]}">${ticon(t)}${t}${extra}</span>`;
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,'').replace(/[^a-z0-9]/g,'');
const REG={Alola:'Alolan',Galar:'Galarian',Hisui:'Hisuian',Paldea:'Paldean'};
function disp(n){
  let m=n.match(/^(.+?)-Mega(?:-([XYZ]))?$/);
  if(m){let b=m[1].replace(/-(M|F)$/,' ($1)');return 'Mega '+b+(m[2]?' '+m[2]:'')}
  if(/^Rotom-/.test(n))return n.split('-')[1]+' Rotom';
  if(n==='Kommo-o')return n;
  m=n.match(/^(.+?)-(Alola|Galar|Hisui)$/);if(m)return REG[m[2]]+' '+m[1];
  m=n.match(/^Tauros-Paldea-(\w+)$/);if(m)return 'Paldean Tauros ('+m[1]+')';
  m=n.match(/^([^-]+)-(.+)$/);if(m)return m[1]+' ('+m[2].replace(/-/g,' ')+')';
  return n;
}
ROSTER.forEach(p=>{p.d=disp(p.n);p.k=norm(p.d)+' '+norm(p.n)+' '+norm(p.n.replace('-Mega',''))+(p.m?' mega':'');p.tok=[norm(p.d),norm(p.n),...p.d.split(/[\s()-]+/).map(norm),...p.n.split('-').map(norm)].filter(Boolean)});
const byName=new Map(ROSTER.map(p=>[p.n,p]));
// Each move also carries its reference mechanics (data/move-meta.js): priority, target, flags, accuracy, secondaries.
// Variable- and fixed-damage moves get a stand-in power so every tool considers them; damage() works out the real number.
const VAR_CALC=new Set(['wt','wtr','lowhp','gyro','eball','half','fullhp','userhp','hex','respects','punish','ragefist','fling','beatup','gambit']);
const MV=MOVES.map(([name,t,cat,bp,sound,spread],i)=>{const x=(typeof MOVE_META==='object'&&MOVE_META[name])||{},f=x.f||'';
  const mv={i,name,type:TYPES[t],cat,bp,sound:x.f!=null||x.t?f.includes('s'):sound,spread:x.t?['allAdjacentFoes','allAdjacent'].includes(x.t):spread,k:norm(name),
    pr:x.p||0,tg:x.t||'',contact:f.includes('c'),charge:f.includes('C'),recharge:f.includes('R'),acc:x.a||100,sec:x.s||[],sheer:!!x.sf,self:x.sb||null,tb:x.tb||null,mh:x.mh||0,ohko:x.o||0,fixed:x.d||0,vbp:x.v||'',ally:x.t==='allAdjacent'};
  if(cat>0&&!bp&&(VAR_CALC.has(mv.vbp)||mv.fixed||mv.ohko))mv.bp=mv.ohko?1:mv.fixed?1:60;return mv});
const mvByName=new Map(MV.map(m=>[m.name,m]));
// The sample a new visitor starts with: a real winning team (48 players brought this exact six at Limitless events and won
// 63% of games; Team Score 93, 7/7 checks on Oct 27), so the first thing anyone sees is a good team, not a fixer-upper.
const DEFAULT_TEAM={name:'Sun Tailwind (sample)',slots:[
 {n:'Charizard-Mega-Y',a:'Drought'},
 {n:'Whimsicott',a:'Prankster'},
 {n:'Basculegion',a:'Adaptability'},
 {n:'Kingambit',a:'Defiant'},
 {n:'Garchomp',a:'Rough Skin'},
 {n:'Sneasler',a:'Unburden'}]};
const blank=()=>({n:'',a:null,lock:false});

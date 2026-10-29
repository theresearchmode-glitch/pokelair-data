(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TC={Normal:'#9a9a7a',Fire:'#e2622a',Water:'#4a7fe0',Electric:'#f2c618',Grass:'#4fa335',Ice:'#7fd0cc',Fighting:'#b8302a',Poison:'#9a3f9a',Ground:'#d6b25a',Flying:'#8f86e3',Psychic:'#ea4f7d',Bug:'#93a51f',Rock:'#b29a3a',Ghost:'#6a5590',Dragon:'#6a3cee',Dark:'#5a4a40',Steel:'#a8a8c2',Fairy:'#e293b6'};
const LIGHT=new Set(['Electric','Ice','Ground','Steel','Fairy','Normal','Bug','Rock']);
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

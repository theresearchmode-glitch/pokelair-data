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
const MV=MOVES.map(([name,t,cat,bp,sound,spread],i)=>({i,name,type:TYPES[t],cat,bp,sound,spread,k:norm(name)}));
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

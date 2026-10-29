// ---------- views ----------
let view='home';
// Five main pages, each with its sections. The first key of a group is the page the main nav opens.
// Regrouped Oct 28: at most 4 sections per page so the row fits a phone. Team opens on the scouting report.
const GROUPS=[['report',[['report','Report'],['build','Edit'],['teams','Saved'],['box','Box']]],
  ['auto',[['auto','Build for me'],['coverage','Swaps'],['cores','Cores']]],
  ['matchup',[['matchup','Team preview'],['gauntlet','Gauntlet'],['speed','Tools']]],
  ['ratings',[['ratings','Tier list'],['meta','Usage'],['top','Teams'],['sets','Sets']]]];
const VIEW_PARENT={};GROUPS.forEach(([g,subs])=>subs.forEach(([v])=>{if(v!==g)VIEW_PARENT[v]=g}));
// pages reached by a switch inside a section: Teams holds Events and Archetypes; Tools holds Damage calc and Type chart
const SUB_OF={events:'top',arch:'top',calc:'speed',types:'speed'},VIEW_ALIAS={battle:'matchup'};Object.assign(VIEW_PARENT,{events:'ratings',arch:'ratings',calc:'matchup',types:'matchup'});
const MAIN_VIEWS=['home',...GROUPS.map(g=>g[0])];
const VIEW_TITLE={home:'Home',report:'Scouting report',build:'Edit team',auto:'Build for me',teams:'Saved teams',matchup:'Team preview',coverage:'Swaps',types:'Type chart',ratings:'Tier list',meta:'Usage',top:'Winning teams',sets:'Popular sets',box:'My box',speed:'Speed tiers',calc:'Damage calc',gauntlet:'Gauntlet',arch:'Archetypes',battle:'Team preview',cores:'Cores',events:'Events'};
// The menu (sidebar on wide screens, "More" sheet on phones) mirrors the same five pages and their sections.
{const nav=document.querySelector('.sidenav');if(nav){const icon={};nav.querySelectorAll('[data-view]').forEach(b=>{const s=b.querySelector('svg');if(s)icon[b.dataset.view]=s.outerHTML});
  const ic=d=>`<svg class="nic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  icon.battle=icon.battle||ic('<circle cx="12" cy="13" r="7.5"/><path d="M12 13V9M10 2.8h4M18.5 6.5l1.5-1.5"/>');
  icon.cores=icon.cores||ic('<circle cx="8" cy="9" r="4"/><circle cx="16" cy="9" r="4"/><circle cx="12" cy="16" r="4"/>');
  icon.events=icon.events||ic('<path d="M4 6h16v14H4z"/><path d="M4 10h16M8 3.5v4M16 3.5v4"/><path d="m10 15 1.5 1.5 3-3"/>');
  const def='<svg class="nic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/></svg>';
  const btn=(v,t)=>`<button type="button" role="tab" data-view="${v}" aria-selected="false">${icon[v]||def}<span class="nl">${t}</span>${v==='report'?'<span class="tc" id="tabCount"></span>':''}</button>`;
  icon.report=icon.report||icon.build;icon.build=ic('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>');
  const NAMES={report:'Team',auto:'Build',matchup:'Matchup',ratings:'Meta'};
  nav.innerHTML=`<div class="sgroup">${btn('home','Home')}</div>`+GROUPS.map(([g,subs])=>`<div class="sgroup"><div class="sgl">${NAMES[g]}</div>${subs.map(([v,t])=>btn(v,t)).join('')}</div>`).join('')}}
// Section tabs at the top of each page in a group (built here so every page in a group shows the same row)
GROUPS.forEach(([g,subs])=>[...subs.map(([v])=>v),...Object.keys(SUB_OF).filter(x=>subs.some(([k])=>k===SUB_OF[x]))].forEach(v=>{const pane=document.querySelector(`[data-pane="${v}"]`);if(!pane)return;const sel=SUB_OF[v]||v;
  const nav=document.createElement('nav');nav.className='subnav';nav.setAttribute('aria-label','Sections');
  nav.innerHTML=subs.map(([k,t])=>`<button type="button" class="sub" data-view="${k}" aria-selected="${k===sel}">${t}</button>`).join('');pane.prepend(nav)}));
// Sidebar: always open on wide screens; a slide-in drawer on narrow ones.
function sideOpen(on){const sd=$('side'),sc=$('scrim'),mb=$('moreBtn');if(!sd)return;try{sd.classList.toggle('open',!!on)}catch(e){}if(sc)sc.hidden=!on;if(mb)mb.setAttribute('aria-expanded',on?'true':'false')}
// Light / dark: Auto follows the device (and the Claude app's own setting); Light and Dark override it. Stored per device.
function setTheme(m){m=['light','dark'].includes(m)?m:'auto';LS.set('cc2.theme',m);try{document.documentElement.dataset.mode=m}catch(e){}
  document.querySelectorAll('[data-thm]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.thm===m));lookSync()}
// data-look = the theme actually showing (light or dark), so the light "daylight" look can be scoped in CSS
function lookSync(){try{const r=document.documentElement,m=r.dataset.mode||'auto',t=r.getAttribute('data-theme');
  const dark=m==='dark'||(m==='auto'&&(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)));r.dataset.look=dark?'dark':'light'}catch(e){}}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',lookSync);new MutationObserver(lookSync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})}catch(e){}
setTheme(LS.get('cc2.theme','auto'));
document.addEventListener('click',e=>{if(e.target&&e.target.id==='scrim')sideOpen(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')sideOpen(false)});
// Back button: each page switch adds a browser history step (no address change), so the phone or browser back button
// steps back through pages. Back first closes anything open on top (a Pokémon sheet, search, the menu, feedback).
let NAV_POP=false;
function navHist(v){if(NAV_POP)return;try{const cur=history.state&&history.state.npv;if(!cur)history.replaceState({npv:v},'');else if(cur!==v)history.pushState({npv:v},'')}catch(e){}}
function overlayOpen(){const ids=['chScout','lairSheet','jump','fbSheet'];for(const id of ids){const el=$(id);if(el&&!el.hidden)return id}const sd=$('side');if(sd&&sd.classList.contains('open'))return 'side';return null}
addEventListener('popstate',e=>{const o=overlayOpen();
  if(o){if(o==='chScout'&&typeof chScoutClose==='function')chScoutClose();else if(o==='lairSheet'&&typeof lairClose==='function')lairClose();else if(o==='jump'&&typeof jumpClose==='function')jumpClose();else if(o==='fbSheet'&&typeof fbClose==='function')fbClose();else if(o==='side')sideOpen(false);
    try{history.pushState({npv:view},'')}catch(er){}return}
  const v=e.state&&e.state.npv;if(!v||v===view)return;NAV_POP=true;try{setView(v)}finally{NAV_POP=false}});
function setView(v,scroll){v=VIEW_ALIAS[v]||v;if(!document.querySelector(`[data-pane="${v}"]`))v='home';view=v;LS.set('cc2.view',v);
  document.querySelectorAll('[data-pane]').forEach(el=>el.hidden=el.dataset.pane!==v);
  const par=VIEW_PARENT[v]||v;const sideHas=!!document.querySelector(`.sidenav [data-view="${v}"]`);document.querySelectorAll('[data-view]').forEach(b=>{const on=b.classList.contains('sub')?b.dataset.view===(SUB_OF[v]||v):(sideHas&&b.closest('.sidenav'))?b.dataset.view===v:b.dataset.view===par;b.setAttribute('aria-selected',on)});
  {const t=$('viewTitle');if(t)t.textContent=VIEW_TITLE[v]||v}
  document.documentElement.dataset.pg=v;
  {const mb=$('moreBtn');if(mb)mb.classList.toggle('on',!MAIN_VIEWS.includes(VIEW_PARENT[v]||v))}
  sideOpen(false);
  requestAnimationFrame(()=>document.querySelectorAll('.subnav').forEach(n=>{if(n.offsetParent===null)return;n.classList.toggle('ovf',n.scrollWidth>n.clientWidth+2);const on=n.querySelector('[aria-selected="true"]');if(on&&n.scrollWidth>n.clientWidth){const l=on.offsetLeft-n.offsetLeft-(n.clientWidth-on.offsetWidth)/2;n.scrollLeft=Math.max(0,l)}}));
  navHist(v);
  if(typeof track==='function')track('view:'+v);
  if((v==='build'||v==='report'||v==='coverage')&&ui.plansStale){ui.plansStale=false;render()}
  document.querySelectorAll('.teamsw [data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===v));
  if(v==='home')safe('home',renderHome);
  if(v==='types')renderTypeChart();
  if(v==='ratings')safe('ratings',renderLair);
  if(v==='coverage')safe('additions',renderRecs);
  try{const sn=document.querySelector(`[data-pane="${v}"] .subnav`),on=sn&&sn.querySelector('.sub[aria-selected="true"]');if(on){const x=on.getBoundingClientRect().left-sn.getBoundingClientRect().left+sn.scrollLeft;sn.scrollLeft=Math.max(0,x-sn.clientWidth/2+on.offsetWidth/2)}}catch(e){}
  if(v==='speed')safe('speed tiers',renderSpeed);
  if(v==='calc')safe('damage calc',renderCalc);
  if(v==='gauntlet')safe('gauntlet',renderGauntlet);
  if(v==='arch')safe('archetypes',renderGuides);
  if(v==='matchup')safe('battle',renderBattle);
  if(v==='cores')safe('cores',renderCores);
  if(v==='events')safe('events',renderEvents);
  if(v==='top')safe('team search',renderTeamSearch);
  if(scroll!==false){try{window.scrollTo({top:0,behavior:'smooth'})}catch(e){}}}

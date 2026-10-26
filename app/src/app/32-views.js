// ---------- views ----------
let view='home';
// Five main pages, each with its sections. The first key of a group is the page the main nav opens.
const GROUPS=[['build',[['build','My team'],['teams','Saved teams'],['box','My box']]],
  ['auto',[['auto','Build for me'],['coverage','Best additions']]],
  ['matchup',[['matchup','Matchup'],['speed','Speed tiers'],['calc','Damage calc'],['gauntlet','Gauntlet']]],
  ['ratings',[['ratings','Ratings'],['meta','Rankings'],['top','Top teams'],['sets','Popular sets'],['types','Type chart']]]];
const VIEW_PARENT={};GROUPS.forEach(([g,subs])=>subs.forEach(([v])=>{if(v!==g)VIEW_PARENT[v]=g}));
const MAIN_VIEWS=['home',...GROUPS.map(g=>g[0])];
const VIEW_TITLE={home:'Home',build:'Team builder',auto:'Build for me',teams:'Saved teams',matchup:'Matchup',coverage:'Best additions',types:'Type chart',ratings:'Ratings',meta:'Meta rankings',top:'Top teams',sets:'Popular sets',box:'My box',speed:'Speed tiers',calc:'Damage calc',gauntlet:'Gauntlet'};
// The menu (sidebar on wide screens, "More" sheet on phones) mirrors the same five pages and their sections.
{const nav=document.querySelector('.sidenav');if(nav){const icon={};nav.querySelectorAll('[data-view]').forEach(b=>{const s=b.querySelector('svg');if(s)icon[b.dataset.view]=s.outerHTML});
  const def='<svg class="nic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/></svg>';
  const btn=(v,t)=>`<button type="button" role="tab" data-view="${v}" aria-selected="false">${icon[v]||def}<span class="nl">${t}</span>${v==='build'?'<span class="tc" id="tabCount"></span>':''}</button>`;
  const NAMES={build:'Team',auto:'Build',matchup:'Matchup',ratings:'Meta'};
  nav.innerHTML=`<div class="sgroup">${btn('home','Home')}</div>`+GROUPS.map(([g,subs])=>`<div class="sgroup"><div class="sgl">${NAMES[g]}</div>${subs.map(([v,t])=>btn(v,t)).join('')}</div>`).join('')}}
// Section tabs at the top of each page in a group (built here so every page in a group shows the same row)
GROUPS.forEach(([g,subs])=>subs.forEach(([v])=>{const pane=document.querySelector(`[data-pane="${v}"]`);if(!pane)return;
  const nav=document.createElement('nav');nav.className='subnav';nav.setAttribute('aria-label','Sections');
  nav.innerHTML=subs.map(([k,t])=>`<button type="button" class="sub" data-view="${k}" aria-selected="${k===v}">${t}</button>`).join('');pane.prepend(nav)}));
// Sidebar: always open on wide screens; a slide-in drawer on narrow ones.
function sideOpen(on){const sd=$('side'),sc=$('scrim'),mb=$('moreBtn');if(!sd)return;try{sd.classList.toggle('open',!!on)}catch(e){}if(sc)sc.hidden=!on;if(mb)mb.setAttribute('aria-expanded',on?'true':'false')}
// Light / dark: Auto follows the device (and the Claude app's own setting); Light and Dark override it. Stored per device.
function setTheme(m){m=['light','dark'].includes(m)?m:'auto';LS.set('cc2.theme',m);try{document.documentElement.dataset.mode=m}catch(e){}
  document.querySelectorAll('[data-thm]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.thm===m))}
setTheme(LS.get('cc2.theme','auto'));
document.addEventListener('click',e=>{if(e.target&&e.target.id==='scrim')sideOpen(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')sideOpen(false)});
function setView(v,scroll){if(!document.querySelector(`[data-pane="${v}"]`))v='home';view=v;LS.set('cc2.view',v);
  document.querySelectorAll('[data-pane]').forEach(el=>el.hidden=el.dataset.pane!==v);
  const par=VIEW_PARENT[v]||v;const sideHas=!!document.querySelector(`.sidenav [data-view="${v}"]`);document.querySelectorAll('[data-view]').forEach(b=>{const on=b.classList.contains('sub')?b.dataset.view===v:(sideHas&&b.closest('.sidenav'))?b.dataset.view===v:b.dataset.view===par;b.setAttribute('aria-selected',on)});
  {const t=$('viewTitle');if(t)t.textContent=VIEW_TITLE[v]||v}
  {const mb=$('moreBtn');if(mb)mb.classList.toggle('on',!MAIN_VIEWS.includes(VIEW_PARENT[v]||v))}
  sideOpen(false);
  if(v==='home')safe('home',renderHome);
  if(v==='types')renderTypeChart();
  if(v==='ratings')safe('ratings',renderLair);
  if(v==='coverage')safe('additions',renderRecs);
  try{const sn=document.querySelector(`[data-pane="${v}"] .subnav`),on=sn&&sn.querySelector('.sub[aria-selected="true"]');if(on){const x=on.getBoundingClientRect().left-sn.getBoundingClientRect().left+sn.scrollLeft;sn.scrollLeft=Math.max(0,x-sn.clientWidth/2+on.offsetWidth/2)}}catch(e){}
  if(v==='speed')safe('speed tiers',renderSpeed);
  if(v==='calc')safe('damage calc',renderCalc);
  if(v==='gauntlet')safe('gauntlet',renderGauntlet);
  if(scroll!==false){try{window.scrollTo({top:0,behavior:'smooth'})}catch(e){}}}

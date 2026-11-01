// ---------- views ----------
let view='home';
// Five main pages, each with its sections. The first key of a group is the page the main nav opens.
// One page per job (Oct 28): Home · Build · My team (centre) · Battle · Meta. Only Meta has a section row
// (Pokémon · Tournaments); everything else is one page. Pages opened from inside a page show a back link instead.
const GROUPS=[['report',[['report','My team']]],['auto',[['auto','Build']]],['matchup',[['matchup','Battle']]],
  ['ratings',[['ratings','Pokémon'],['top','Tournaments']]]];
const VIEW_PARENT={};GROUPS.forEach(([g,subs])=>subs.forEach(([v])=>{if(v!==g)VIEW_PARENT[v]=g}));
// pages reached by a switch inside a section: Pokémon holds Usage and Sets; Tournaments holds Events and Archetypes
const SUB_OF={meta:'ratings',sets:'ratings',events:'top',arch:'top'},VIEW_ALIAS={battle:'matchup',build:'report',cores:'auto'};
Object.assign(VIEW_PARENT,{compare:'report',weekly:'ratings',meta:'ratings',sets:'ratings',events:'ratings',arch:'ratings',teams:'report',box:'report',coverage:'report',gauntlet:'matchup',practice:'matchup',speed:'matchup',calc:'matchup',types:'matchup',track:'ratings',method:'ratings'});
// pages opened from inside another page: a back link to it
const BACK={teams:['report','My team'],compare:['report','My team'],box:['report','My team'],coverage:['report','My team'],gauntlet:['matchup','Battle'],practice:['matchup','Battle'],speed:['matchup','Battle'],calc:['matchup','Battle'],types:['matchup','Battle'],track:['ratings','Pokémon ratings']};
const MAIN_VIEWS=['home',...GROUPS.map(g=>g[0])];
const VIEW_TITLE={home:'Home',report:'My team',build:'My team',auto:'Build',teams:'Saved teams',compare:'Compare teams',matchup:'Battle',coverage:'All suggestions',types:'Type chart',ratings:'Pokémon ratings',meta:'Usage',top:'Winning teams',sets:'Popular sets',box:'My box',speed:'Speed tiers',calc:'Damage calc',gauntlet:'Gauntlet',arch:'Archetypes',battle:'Battle',cores:'Cores',events:'Events',practice:'Practice',method:'How we calculate',track:'Track record',weekly:'This week'};
// the ⋯ menu lists every page, grouped the same way as the bottom bar
const MENU=[['Build',[['auto','Build for me'],['cores','Build around a core']]],['My team',[['report','My team'],['coverage','All suggestions'],['teams','Saved teams'],['compare','Compare teams'],['box','My box']]],
  ['Battle',[['matchup','Battle a team'],['practice','Team preview practice'],['gauntlet','Gauntlet'],['speed','Speed tiers'],['calc','Damage calc'],['types','Type chart']]],
  ['Meta',[['weekly','This week'],['ratings','Pokémon ratings'],['meta','Usage'],['sets','Popular sets'],['top','Winning teams'],['events','Events'],['arch','Archetypes'],['track','Track record'],['method','How we calculate']]]];
// The menu (sidebar on wide screens, "More" sheet on phones) mirrors the same five pages and their sections.
{const nav=document.querySelector('.sidenav');if(nav){const icon={};nav.querySelectorAll('[data-view]').forEach(b=>{const s=b.querySelector('svg');if(s)icon[b.dataset.view]=s.outerHTML});
  const ic=d=>`<svg class="nic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  icon.battle=icon.battle||ic('<circle cx="12" cy="13" r="7.5"/><path d="M12 13V9M10 2.8h4M18.5 6.5l1.5-1.5"/>');
  icon.cores=icon.cores||ic('<circle cx="8" cy="9" r="4"/><circle cx="16" cy="9" r="4"/><circle cx="12" cy="16" r="4"/>');
  icon.practice=icon.practice||ic('<rect x="3.5" y="5" width="7" height="6" rx="1.5"/><rect x="13.5" y="5" width="7" height="6" rx="1.5"/><rect x="3.5" y="13" width="7" height="6" rx="1.5"/><path d="m14 16 2 2 4-4"/>');
  icon.weekly=icon.weekly||ic('<path d="M3 17l5-5 4 4 8-8"/><path d="M14 8h6v6"/>');
  icon.events=icon.events||ic('<path d="M4 6h16v14H4z"/><path d="M4 10h16M8 3.5v4M16 3.5v4"/><path d="m10 15 1.5 1.5 3-3"/>');
  icon.method=icon.method||ic('<path d="M5 3.5h14v17H5z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>');
  icon.track=icon.track||ic('<path d="M4 19.5h16"/><path d="m5 15 4.5-4.5 3.5 3 6-6.5"/><path d="M15 7h4v4"/>');
  icon.compare=icon.compare||ic('<rect x="3.5" y="5" width="7" height="14" rx="1.5"/><rect x="13.5" y="5" width="7" height="14" rx="1.5"/><path d="M12 3v18"/>');
  const def='<svg class="nic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/></svg>';
  const btn=(v,t)=>`<button type="button" role="tab" data-view="${v}" aria-selected="false">${icon[v]||def}<span class="nl">${t}</span>${v==='report'?'<span class="tc" id="tabCount"></span>':''}</button>`;
  icon.report=icon.report||icon.build;icon.build=ic('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>');
  nav.innerHTML=`<div class="sgroup">${btn('home','Home')}</div>`+MENU.map(([g,subs])=>`<div class="sgroup"><div class="sgl">${g}</div>${subs.map(([v,t])=>btn(v,t)).join('')}</div>`).join('')}}
// back links on pages opened from inside another page
Object.entries(BACK).forEach(([v,[to,name]])=>{const pane=document.querySelector(`[data-pane="${v}"]`);if(!pane||pane.querySelector(':scope > .chback'))return;pane.insertAdjacentHTML('afterbegin',`<button type="button" class="chback" data-view="${to}"><span aria-hidden="true">←</span> ${name}</button>`)});
// Section tabs at the top of each page in a group (only where a page has more than one section)
GROUPS.filter(([,subs])=>subs.length>1).forEach(([g,subs])=>[...subs.map(([v])=>v),...Object.keys(SUB_OF).filter(x=>subs.some(([k])=>k===SUB_OF[x]))].forEach(v=>{const pane=document.querySelector(`[data-pane="${v}"]`);if(!pane)return;const sel=SUB_OF[v]||v;
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
const OVERLAYS=['chEdit','chScout','lairSheet','jump','fbSheet','shareBox'];
function overlayOpen(){for(const id of OVERLAYS){const el=$(id);if(el&&!el.hidden)return id}const sd=$('side');if(sd&&sd.classList.contains('open'))return 'side';return null}
function overlayClose(o){if(o==='chEdit'&&typeof chEditClose==='function')chEditClose();else if(o==='chScout'&&typeof chScoutClose==='function')chScoutClose();else if(o==='lairSheet'&&typeof lairClose==='function')lairClose();else if(o==='jump'&&typeof jumpClose==='function')jumpClose();else if(o==='fbSheet'&&typeof fbClose==='function')fbClose();else if(o==='shareBox'){if(typeof closeShare==='function')closeShare();else{const x=$('shareBox');if(x)x.hidden=true}}else if(o==='side')sideOpen(false)}
// Back closes what's open on top (sweep, Oct 31): opening a sheet, the search, the menu or the share card adds its own history
// step, so back closes it even on the first page (it used to leave the app) and the page keeps its scroll position; closing it
// with × or the backdrop takes that step back out quietly.
try{history.scrollRestoration='manual'}catch(e){}
let OV_SKIP=0;
function ovSync(){const o=overlayOpen(),st=history.state||{};try{if(o&&!st.ov)history.pushState({npv:view,ov:1},'');else if(!o&&st.ov){OV_SKIP++;history.back()}}catch(e){}}
setTimeout(()=>{try{const kick=()=>{clearTimeout(ovSync._t);ovSync._t=setTimeout(ovSync,0)};
  const mo=new MutationObserver(rs=>{for(const r of rs){const t=r.target;if(r.type==='childList'?[...r.addedNodes].some(n=>n.id&&OVERLAYS.includes(n.id)):(t.id&&(OVERLAYS.includes(t.id)||t.id==='side'))){kick();return}}});
  mo.observe(document.body,{attributes:true,subtree:true,attributeFilter:['hidden','class'],childList:true})}catch(e){}},0);
addEventListener('popstate',e=>{if(OV_SKIP){OV_SKIP--;return}const o=overlayOpen();
  if(o){overlayClose(o);return}
  const v=e.state&&e.state.npv;if(!v||v===view)return;NAV_POP=true;try{setView(v)}finally{NAV_POP=false}});
function setView(v,scroll){v=VIEW_ALIAS[v]||v;if(!document.querySelector(`[data-pane="${v}"]`))v='home';view=v;LS.set('cc2.view',v);
  document.querySelectorAll('[data-pane]').forEach(el=>el.hidden=el.dataset.pane!==v);
  safe('page parts',lazyFlush);
  const par=VIEW_PARENT[v]||v;const sideHas=!!document.querySelector(`.sidenav [data-view="${v}"]`);document.querySelectorAll('[data-view]').forEach(b=>{const on=b.classList.contains('sub')?b.dataset.view===(SUB_OF[v]||v):(sideHas&&b.closest('.sidenav'))?b.dataset.view===v:b.dataset.view===par;b.setAttribute('aria-selected',on)});
  {const t=$('viewTitle');if(t)t.textContent=VIEW_TITLE[v]||v}
  document.documentElement.dataset.pg=v;
  {const mb=$('moreBtn');if(mb)mb.classList.toggle('on',!MAIN_VIEWS.includes(VIEW_PARENT[v]||v))}
  sideOpen(false);
  requestAnimationFrame(()=>document.querySelectorAll('.subnav').forEach(n=>{if(n.offsetParent===null)return;n.classList.toggle('ovf',n.scrollWidth>n.clientWidth+2);const on=n.querySelector('[aria-selected="true"]');if(on&&n.scrollWidth>n.clientWidth){const l=on.offsetLeft-n.offsetLeft-(n.clientWidth-on.offsetWidth)/2;n.scrollLeft=Math.max(0,l)}}));
  navHist(v);
  if(typeof track==='function')track('view:'+v);
  if((v==='build'||v==='report')&&ui.plansStale){ui.plansStale=false;render()}

  document.querySelectorAll('.teamsw [data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===v));
  if(v==='home')safe('home',renderHome);
  if(v==='types')renderTypeChart();
  if(v==='ratings')safe('ratings',renderLair);
  // All suggestions: the page shows at once; when the suggestions need working out, a short note shows and they fill in
  // a frame later (audit, Oct 30: opening it froze phones for ~3 s)
  if(v==='coverage'){const l=$('recList'),fresh=typeof recKey==='function'&&recCache.key===recKey($('useAbil').checked);
    // then the bigger plans (the slow part), a frame after the swaps
    const plansLater=()=>{if(ui.plansStale)requestAnimationFrame(()=>setTimeout(()=>{if(view==='coverage'&&ui.plansStale){ui.plansStale=false;render()}},0))};
    if(fresh||!l||members().length<2){safe('additions',renderRecs);plansLater()}
    else{l.innerHTML='<div class="empty-note abbusy" role="status"><span class="abspin" aria-hidden="true"></span>Working out the best swaps for your team…</div>';requestAnimationFrame(()=>setTimeout(()=>{if(view==='coverage'){safe('additions',renderRecs);plansLater()}},0))}}
  try{const sn=document.querySelector(`[data-pane="${v}"] .subnav`),on=sn&&sn.querySelector('.sub[aria-selected="true"]');if(on){const x=on.getBoundingClientRect().left-sn.getBoundingClientRect().left+sn.scrollLeft;sn.scrollLeft=Math.max(0,x-sn.clientWidth/2+on.offsetWidth/2)}}catch(e){}
  if(v==='speed')safe('speed tiers',renderSpeed);
  if(v==='calc')safe('damage calc',renderCalc);
  if(v==='gauntlet')safe('gauntlet',renderGauntlet);
  if(v==='practice'&&typeof renderPractice==='function')safe('practice',renderPractice);
  if(v==='arch')safe('archetypes',renderGuides);
  if(v==='matchup')safe('battle',renderBattle);
  if(v==='cores')safe('cores',renderCores);
  if(v==='events')safe('events',renderEvents);
  if(v==='top')safe('team search',renderTeamSearch);
  if(v==='method'&&typeof renderMethod==='function')safe('how we calculate',renderMethod);
  if(v==='track'&&typeof renderTrack==='function')safe('track record',renderTrack);
  if(v==='compare')safe('compare',renderCompare);
  if(scroll!==false){try{window.scrollTo({top:0,behavior:'smooth'})}catch(e){}}}
// Tab stays inside an open sheet or editor (they're modal), wrapping from the last control to the first (sweep, Oct 31)
document.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const o=overlayOpen();if(!o||o==='side'||o==='jump')return;const box=$(o);if(!box)return;
  const f=[...box.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),summary')].filter(x=>x.offsetParent!==null);if(!f.length)return;
  const a=f[0],z=f[f.length-1],act=document.activeElement;if(!box.contains(act)){e.preventDefault();a.focus();return}
  if(e.shiftKey&&act===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&act===z){e.preventDefault();a.focus()}});

const {chromium}=require('playwright');(async()=>{const [page,out]=process.argv.slice(2);const b=await chromium.launch();
for(const [w,th] of [[1440,'day'],[1440,'night'],[390,'day']]){const c=await b.newContext({viewport:{width:w,height:900},deviceScaleFactor:w<700?2:1,hasTouch:w<700}),p=await c.newPage();await p.addInitScript(()=>{window.__PL_TEST=1});
await p.goto('file://'+page+'#sets');await p.waitForTimeout(3000);await p.evaluate(t=>V2.setTheme(t),th);await p.waitForTimeout(400);
await p.evaluate(()=>{const n='Charizard-Mega-Y';
 const bar=(l,v)=>`<li class="lo-r"><span>${l}</span><i class="lo-b"><i style="width:${Math.round(100*v/6)}%"></i></i><b class="u">${v}%</b></li>`;
 const css=`<style>
 .lo-hero{grid-template-columns:260px minmax(0,1fr)!important}
 .lo-set{display:grid;gap:16px}.lo-kv{display:flex;flex-wrap:wrap;gap:8px 24px;margin:0}.lo-kv div{display:grid;gap:2px}.lo-kv small{font:700 13px/1.2 var(--b);letter-spacing:.06em;text-transform:uppercase;color:var(--wr-ink2)}.lo-kv b{font-size:22px;line-height:1.1;color:var(--wr-ink)}.lo-hero .k-card{max-width:240px}
 .lo-hero .k-moves{grid-template-columns:repeat(2,minmax(0,1fr))}
 .lo-also{margin:0;font:500 15px/1.5 var(--b);color:var(--wr-ink2)}.lo-also b{color:var(--wr-ink);font-weight:700}
 .lo-rows{list-style:none;margin:0;padding:0;display:grid;gap:8px;max-width:720px}.lo-r{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr) 64px;align-items:center;gap:16px;font:600 15px/1.3 var(--b)}
 .lo-r b{text-align:right;font-size:20px}.lo-b{display:block;height:10px;transform:skewX(-14deg);background:color-mix(in srgb,var(--k-ink) 8%,transparent)}.lo-b>i{display:block;height:100%;background:var(--k-plot)}
 .lo-mate .k-roster{max-width:880px}
 @media (max-width:699.98px){.lo-hero{grid-template-columns:minmax(0,1fr)!important}.lo-hero .k-moves{grid-template-columns:minmax(0,1fr)}.lo-r{grid-template-columns:minmax(0,1fr) 72px 48px;gap:8px;font-size:13px}.lo-r b{font-size:15px}}
 </style>`;
 const sent=V2.kSent(['Show me',{w:'Mega Charizard Y',menu:true},'from',{w:'best data',on:true},{w:'online tournaments'},{w:'Showdown ladder'}]);
 const hero=`<div class="btg-hero lo-hero"><div>${V2.kCard(n)}</div><div class="lo-set"><div class="lo-kv"><div><small>Item</small><b class="u">Charizardite Y</b></div><div><small>Ability</small><b class="u">Drought</b></div><div><small>Nature</small><b class="u">Timid · Modest</b></div></div>
   ${V2.kMoves([['Heat Wave','99%'],['Protect','99%'],['Weather Ball','93%'],['Solar Beam','51%']])}<p class="lo-also">Also run: <b>Ancient Power</b> 30% · <b>Hurricane</b> 16% · Air Slash 3% · Overheat 2%</p>
   <p>${V2.kGo('BUILD AROUND IT.',{href:'#build'})}</p></div></div>`;
 const tune=`<ul class="lo-rows">${bar('Modest · 2 HP / 32 SpA / 32 Spe',6)}${bar('Timid · 2 HP / 32 SpA / 32 Spe',6)}${bar('Timid · 22 HP / 19 Def / 2 SpA / 23 Spe',4)}</ul><p class="lo-also" style="color:var(--k-ink2)">Showdown ladder 1630+ · 307,430 battles</p>`;
 const mates=`<div class="lo-mate">${V2.kRoster(['Kingambit','Garchomp','Farigiraf','Sneasler','Archaludon','Rillaboom'].map(x=>V2.kCard(x)))}</div>`;
 const html=css+`<div class="ra">${V2.kHead({kicker:'META · THE LOADOUT',h1Html:"How it’s built <em>right now.</em>"})}${sent}`+V2.kPlan(V2.kStep(1,'The loadout.','what strong players run on it',hero)+V2.kStep(2,'The fine-tuning.','stat points, most used first',tune)+V2.kStep(3,'Usually alongside.','its most common teammates',mates))+`</div>`;
 document.querySelector('#main').innerHTML=html; document.querySelectorAll('#main .k-h1 em').forEach(e=>{e.style.fontStyle='inherit';e.style.color='var(--k-plot-text)'}); scrollTo(0,0);});
await p.addStyleTag({content:'.np-bar{display:none!important}'});await p.waitForTimeout(700);
await p.screenshot({path:`${out}-${w}-${th}.png`,fullPage:true});console.log(w,th,await p.evaluate(()=>document.documentElement.scrollHeight));await c.close()}await b.close()})();

const {chromium}=require('playwright');(async()=>{const [page,out]=process.argv.slice(2);const b=await chromium.launch();
for(const th of ['day','night']){const c=await b.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1}),p=await c.newPage();await p.addInitScript(()=>{window.__PL_TEST=1});
await p.goto('file://'+page+'#about');await p.waitForTimeout(2500);await p.evaluate(t=>V2.setTheme(t),th);await p.waitForTimeout(400);
await p.evaluate(()=>{
 const today=[
  ['Home hero, white clip fill 64px','<button class="sdh-b1" style="position:static">Score My Team</button>'],
  ['Home hero, slanted outline 65px','<button class="sdh-b2" style="position:static">Build Me a Team</button>'],
  ['np-btn, dark clip fill 52px','<button class="np-btn">Build Me a Team</button>'],
  ['np-btn (Home six), 59px','<button class="np-btn sds-rb">Open My Team</button>'],
  ['np-btn2, slanted outline 44px, body font','<button class="np-btn2">Load Team</button>'],
  ['k-go, the pink move 60px','<a class="k-go u">PLAN TURN ONE.</a>'],
  ['Build plot, pl-go 67px','<button class="pl-go" style="position:static">HATCH IT.</button>'],
  ['source chips, clip fill 44px','<button class="ra-chip" aria-pressed="true">Online tournaments</button>'],
 ];
 const prop=[
  ['1 · PRIMARY, large (52px): the page\'s ONE pink move, Unbounded slanted, CAPS + full stop','<a class="k-go u" style="font-size:var(--t24);min-height:52px;display:inline-grid;place-items:center">BUILD ME A TEAM.</a>'],
  ['2 · SECONDARY, large (52px): slanted outline, Unbounded, same shape and height as 1','<span style="display:inline-grid;place-items:center;min-height:52px;padding:0 var(--s6);transform:skewX(-10deg);border:3px solid var(--k-ink);color:var(--k-ink)"><span style="display:block;transform:skewX(10deg);font:900 var(--t20)/1 var(--u);font-style:italic;letter-spacing:-.01em">Score My Team</span></span>'],
  ['3 · PRIMARY, small (44px): dark slanted fill, Unbounded 15px (Load Team, Apply, Copy Code)','<span style="display:inline-grid;place-items:center;min-height:44px;padding:0 var(--s4);transform:skewX(-10deg);background:var(--k-chip);color:var(--k-on-chip)"><span style="display:block;transform:skewX(10deg);font:900 var(--t15)/1 var(--u);font-style:italic;letter-spacing:-.01em">Load Team</span></span>'],
  ['4 · SECONDARY, small (44px): slanted outline, Unbounded 15px (Copy for Showdown, Log a Win)','<span style="display:inline-grid;place-items:center;min-height:44px;padding:0 var(--s4);transform:skewX(-10deg);border:3px solid var(--k-ink);color:var(--k-ink)"><span style="display:block;transform:skewX(10deg);font:900 var(--t15)/1 var(--u);font-style:italic;letter-spacing:-.01em">Copy for Showdown</span></span>'],
  ['Links stay links: blue text with ›  (Compare ›, Set as Opponent ›)','<a class="np-link" href="#">Set as Opponent ›</a>'],
 ];
 const row=([l,h])=>`<div style="display:grid;grid-template-columns:360px 1fr;align-items:center;gap:24px;padding:12px 0;border-bottom:1px solid var(--k-rule)"><p style="margin:0;font:600 var(--t15)/1.4 var(--b);color:var(--k-ink2)">${l}</p><div>${h}</div></div>`;
 document.querySelector('#main').innerHTML=`<div style="padding:32px var(--gut);display:grid;grid-template-columns:minmax(0,1fr);gap:32px;max-width:1100px"><section><p class="k-kicker">TODAY · 8 BUTTON LOOKS</p>${today.map(row).join('')}</section><section><p class="k-kicker">PROPOSED · ONE SYSTEM: 2 SIZES × 2 KINDS</p>${prop.map(row).join('')}<p style="margin-top:16px;font:500 var(--t15)/1.5 var(--b);color:var(--k-ink2)">Every button slanted like the logo. One height per size. One font (Unbounded) for buttons, body font for links. The pink move stays one per page.</p></section></div>`;scrollTo(0,0)});
await p.waitForTimeout(600);await p.screenshot({path:`${out}-${th}.png`,fullPage:true});await c.close()}await b.close()})();

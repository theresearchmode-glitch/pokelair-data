// Quality check for one page state: every element contained, no text overlapping text, sizes on the scale, tap targets on touch.
// env: PF (page file), HASH, SETUP (js run in page, may return a promise), ROOT (selector, default #main), WIDTHS, THEMES
const {chromium}=require('playwright');(async()=>{const W=(process.env.WIDTHS||'320,360,390,430,600,820,1024,1100,1280,1440,1920').split(',').map(Number),TH=(process.env.THEMES||'day,night').split(',');
const b=await chromium.launch();let total=0;
for(const th of TH)for(const w of W){const touch=w<1100;const ctx=await b.newContext({viewport:{width:w,height:900},hasTouch:touch,isMobile:touch&&w<700});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{window.__PL_TEST=1});await p.addInitScript(t=>{try{localStorage.setItem('np2.theme',t)}catch(e){}},th);
 await p.goto('file://'+process.env.PF+(process.env.HASH||''));await p.waitForTimeout(2500);
 const SETUP=process.env.SETUPF?require('fs').readFileSync(process.env.SETUPF,'utf8'):process.env.SETUP;if(SETUP){try{await p.evaluate(SETUP)}catch(e){errs.push('setup '+e.message)}await p.waitForTimeout(1200);}
 const r=await p.evaluate(([root,touch])=>{const o=[],R=document.querySelector(root)||document.body,vw=document.documentElement.clientWidth,SC=[13,15,16,17,20,22,24,26,28,34];
  const vis=e=>{const c=getComputedStyle(e);return c.visibility!=='hidden'&&+c.opacity>0.05&&c.display!=='none'};
  const hidden=e=>e.closest('[aria-hidden="true"],.vh,.mc-bg,.mc-giant,.tt-giant,.cxf-ghost,.pbp-vs,.cxf-vs,details:not([open])>*:not(summary)');
  const clipOf=e=>{let c=e.parentElement;while(c&&c!==document.body){const s=getComputedStyle(c);if(/hidden|clip|auto|scroll/.test(s.overflowX)||(s.clipPath&&s.clipPath!=='none'))return c;c=c.parentElement}return null};
  // 1 contained
  for(const e of R.querySelectorAll('*')){if(!vis(e)||e.closest('.np-mon'))continue;const q=e.getBoundingClientRect();if(!q.width||!q.height)continue;
   if(q.right>vw+1||q.left<-1){if(!clipOf(e))o.push('OFFSCREEN '+(e.tagName+'.'+e.className).slice(0,40)+' '+JSON.stringify((e.innerText||'').slice(0,20)));continue}
   if(e.childElementCount===0&&(e.innerText||'').trim()&&!hidden(e)){const c=clipOf(e);if(c){const B=c.getBoundingClientRect();if(q.right>B.right+2||q.left<B.left-2||q.bottom>B.bottom+2)o.push('CLIPPED '+(e.tagName+'.'+e.className).slice(0,30)+' '+JSON.stringify(e.innerText.slice(0,20))+' by '+(c.className+'').slice(0,24))}}}
  // 2 text overlapping text (leaf text elements)
  const T=[...R.querySelectorAll('*')].filter(e=>vis(e)&&!hidden(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>{let q=null;for(const n of e.childNodes){if(n.nodeType!==3||!n.textContent.trim())continue;const rg=document.createRange();rg.selectNodeContents(n);const r=rg.getBoundingClientRect();if(!r.width)continue;q=q?{left:Math.min(q.left,r.left),right:Math.max(q.right,r.right),top:Math.min(q.top,r.top),bottom:Math.max(q.bottom,r.bottom),width:1,height:1}:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}}return {e,q:q||{width:0,height:0}}}).filter(x=>x.q.width>2&&x.q.height>2).slice(0,900);
  for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){const a=T[i],c=T[j];if(a.e.contains(c.e)||c.e.contains(a.e))continue;const ix=Math.min(a.q.right,c.q.right)-Math.max(a.q.left,c.q.left),iy=Math.min(a.q.bottom,c.q.bottom)-Math.max(a.q.top,c.q.top);
   /* two lines of one headline: their font boxes overlap by design (display line-height under the font's box); a real collision overlaps more than a third */ {const ha=a.e.closest('h1,h2,h3');if(ha&&ha===c.e.closest('h1,h2,h3')&&iy<Math.min(a.q.height,c.q.height)/3)continue;}
   if(ix>3&&iy>3)o.push('OVERLAP '+JSON.stringify(a.e.innerText.slice(0,18))+' x '+JSON.stringify(c.e.innerText.slice(0,18)))}
  // 3 sizes
  for(const x of T){const fs=parseFloat(getComputedStyle(x.e).fontSize);if(fs<40&&!SC.some(s=>Math.abs(s-fs)<0.6))o.push('SIZE '+fs.toFixed(1)+'px '+JSON.stringify(x.e.innerText.slice(0,18)))}
  // 4 tap targets
  if(touch)for(const e of R.querySelectorAll('button,a[href],summary,[role=button]')){if(!vis(e)||hidden(e))continue;const q=e.getBoundingClientRect();if(q.width&&q.height&&(q.height<40||q.width<40))o.push('TAP '+Math.round(q.width)+'x'+Math.round(q.height)+' '+JSON.stringify((e.innerText||e.getAttribute('aria-label')||'').slice(0,20)))}
  return [...new Set(o)]},[process.env.ROOT||'#main',touch]);
 const all=[...r,...errs.map(x=>'ERROR '+x)];total+=all.length;console.log(`${th} ${w}: ${all.length?all.length+' findings':'clean'}`+(all.length?'\n  '+all.slice(0,12).join('\n  '):''));await ctx.close()}
console.log('TOTAL',total);await b.close()})();

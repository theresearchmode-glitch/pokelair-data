const {chromium}=require('/home/user/pokelair-data/node_modules/playwright');const fs=require('fs');
const PAGE='/home/user/pokelair-data/.claude/worktrees/agent-a64d1b17feec8bf54/app/dist/v2.html';
// node pic.cjs hash width scheme injects out.png topSelector heightCss [dpr] [click selector]
// shoots a region starting at topSelector's top (minus 16) of heightCss css px, at dpr (default 2)
(async()=>{const [h,w,sch,files,out,sel,hh,dpr,click]=process.argv.slice(2);const b=await chromium.launch();
const c=await b.newContext({viewport:{width:+w,height:844},isMobile:true,hasTouch:true,colorScheme:sch,deviceScaleFactor:+(dpr||2)});
await c.addInitScript(()=>{window.__PL_TEST=1});const p=await c.newPage();
await p.goto('file://'+PAGE);await p.waitForTimeout(1500);await p.evaluate(h=>location.hash=h,h);await p.waitForTimeout(2500);
await p.waitForFunction(()=>!document.querySelector('.sg2-wait'),null,{timeout:60000}).catch(()=>{});await p.waitForTimeout(800);
for(const f of (files||'').split(',').filter(x=>x&&x!=='-')){const t=fs.readFileSync(f,'utf8'); if(f.endsWith('.css')) await p.addStyleTag({content:t}); else {await p.evaluate(t);await p.waitForTimeout(300);}}
await p.waitForTimeout(600);
const H0=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H0;y+=700){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(100);}await p.evaluate(()=>scrollTo(0,0));
if(click){await p.click(click);await p.waitForTimeout(500);}
await p.addStyleTag({content:'header.np-head,.np-dock,.np-bar{display:none!important}.tm-jump{position:static!important}'});await p.waitForTimeout(400);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
let y=0;if(sel&&sel!=='-'){y=await p.evaluate(s=>{const e=document.querySelector(s);return e?Math.max(0,e.getBoundingClientRect().top+scrollY-16):0},sel);}
const ht=hh==='full'?H-y:Math.min(+hh,H-y);
await p.screenshot({path:out,fullPage:true,clip:{x:0,y,width:+w,height:ht}});console.log(out,'y',Math.round(y),'h',ht,'pageH',H,(H/844).toFixed(2));await b.close();})();

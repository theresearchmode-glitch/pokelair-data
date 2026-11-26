const {chromium}=require('/home/user/pokelair-data/node_modules/playwright');const fs=require('fs');
const PAGE='/home/user/pokelair-data/.claude/worktrees/agent-a64d1b17feec8bf54/app/dist/v2.html';
// node sec.cjs hash width scheme "inject1,inject2" [fullshot] [dpr] ; env SEC=selector lists children heights
(async()=>{const [h,w,sch,files,shot,dpr]=process.argv.slice(2);const b=await chromium.launch();
const c=await b.newContext({viewport:{width:+w,height:844},isMobile:true,hasTouch:true,colorScheme:sch,deviceScaleFactor:+(dpr||1)});
await c.addInitScript(()=>{window.__PL_TEST=1});const p=await c.newPage();p.on('console',m=>{if(m.text().startsWith('SW'))console.log(m.text())});
await p.goto('file://'+PAGE);await p.waitForTimeout(1500);
await p.evaluate(h=>location.hash=h,h);await p.waitForTimeout(2500);
await p.waitForFunction(()=>!document.querySelector('.sg2-wait'),null,{timeout:60000}).catch(()=>{});await p.waitForTimeout(800);
for(const f of (files||'').split(',').filter(x=>x&&x!=='-')){const t=fs.readFileSync(f,'utf8'); if(f.endsWith('.css')) await p.addStyleTag({content:t}); else {await p.evaluate(t);await p.waitForTimeout(300);} }
await p.waitForTimeout(600);
const H0=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H0;y+=700){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(100);} await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(400);
const r=await p.evaluate((sel)=>{const H=document.documentElement.scrollHeight;const out=[];
 for(const s of (sel||'').split(';').filter(Boolean)){const root=document.querySelector(s);out.push(['== '+s]);
 if(root)for(const k of root.children){const bb=k.getBoundingClientRect();if(bb.height<2)continue;out.push([k.tagName.toLowerCase()+'.'+[...k.classList].slice(0,3).join('.'),Math.round(bb.top+scrollY),Math.round(bb.height),((k.querySelector('h1,h2,h3')||{}).textContent||k.textContent||'').trim().replace(/\s+/g,' ').slice(0,50)]);}}
 return {H,out};},process.env.SEC||'');
console.log(h,w,sch,files||'-','H',r.H,'screens',(r.H/844).toFixed(2));for(const o of r.out)console.log(o.join(' | '));
if(shot){await p.addStyleTag({content:'header.np-head,.np-dock,.np-bar{display:none!important}'});await p.waitForTimeout(300);await p.screenshot({path:shot,fullPage:true});}
await b.close();})();

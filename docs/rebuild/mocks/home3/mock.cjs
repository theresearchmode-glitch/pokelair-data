// Home round 3 (Fight Night refined): today's real Home numbers (data.js) drawn by render.js (render.js + style.css) inside the Preview page.
const pw=require('playwright'),fs=require('fs');const PAGE=process.argv[2];
const DATA=fs.readFileSync(__dirname+'/data.js','utf8'),R=fs.readFileSync(__dirname+'/render.js','utf8'),CSS=fs.readFileSync(__dirname+'/style.css','utf8');
const J=(process.env.J||'full:night:1440,full:day:1440,full:night:390,full:day:390,empty:night:1440,empty:day:390,full:day:1024,full:night:320').split(',');
(async()=>{const b=await pw.chromium.launch();for(const j of J){const [V,th,w]=j.split(':');const ctx=await b.newContext({viewport:{width:+w,height:900},deviceScaleFactor:+w<700?2:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(th=>{window.__PL_TEST=1;try{localStorage.setItem('np2.theme',th)}catch(e){}},th);
await p.goto('file://'+PAGE+'#home');await p.waitForTimeout(3500);await p.addStyleTag({content:CSS});
const info=await p.evaluate(([DATA,R,V])=>{const X=window.__ev(DATA);document.querySelector('#main').innerHTML=window.__ev('('+R+')')(X,V);return {s:X.s,champ:!!X.champ,ud:X.ud,top:X.top.length}},[DATA,R,V]);await p.waitForTimeout(1200);
const ov=await p.evaluate(()=>{const W=innerWidth,o=[];for(const e of document.querySelectorAll('#main *')){const r=e.getBoundingClientRect();if(r.width&&(r.right>W+1||r.left<-1)&&true)o.push(String(e.className).slice(0,24))}return o.slice(0,5)});
await p.addStyleTag({content:'.np-bar{visibility:hidden}'});await p.screenshot({path:`${__dirname}/h-${V}-${th}-${w}.png`,fullPage:true});console.log(j,JSON.stringify(info),'outside:',JSON.stringify(ov),errs.slice(0,2).join('|'));await ctx.close()}await b.close()})();

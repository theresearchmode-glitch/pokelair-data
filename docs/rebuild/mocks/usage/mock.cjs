// Usage mock-ups (Nov 14): real tournament usage rows (data.js) drawn three ways (render.js + style.css) inside the Preview page.
const pw=require('playwright'),fs=require('fs');const PAGE=process.argv[2];
const DATA=fs.readFileSync(__dirname+'/data.js','utf8'),R=fs.readFileSync(__dirname+'/render.js','utf8'),CSS=fs.readFileSync(__dirname+'/style.css','utf8');
const J=(process.env.J||'A:night:1440,B:night:1440,C:night:1440,A:day:390,B:day:390,C:day:390').split(',');
(async()=>{const b=await pw.chromium.launch();for(const j of J){const [V,th,w]=j.split(':');const ctx=await b.newContext({viewport:{width:+w,height:900},deviceScaleFactor:+w<700?2:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(th=>{window.__PL_TEST=1;try{localStorage.setItem('np2.theme',th)}catch(e){}},th);
await p.goto('file://'+PAGE+'#meta');await p.waitForTimeout(3500);await p.addStyleTag({content:CSS});
const info=await p.evaluate(([DATA,R,V])=>{const X=window.__ev(DATA);document.querySelector('#main').innerHTML=window.__ev('('+R+')')(X,V);return {rows:X.rows&&X.rows.length,err:X.err}},[DATA,R,V]);await p.waitForTimeout(900);
const ov=await p.evaluate(()=>{const W=innerWidth,o=[];for(const e of document.querySelectorAll('#main *')){const r=e.getBoundingClientRect();if(r.width&&(r.right>W+1||r.left<-1))o.push(String(e.className).slice(0,24))}return o.slice(0,5)});
await p.addStyleTag({content:'.np-bar{visibility:hidden}'});await p.screenshot({path:`${__dirname}/u-${V}-${th}-${w}.png`,fullPage:true});console.log(j,JSON.stringify(info),'outside:',JSON.stringify(ov),errs.slice(0,2).join('|'));await ctx.close()}await b.close()})();

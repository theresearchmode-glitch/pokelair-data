const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
const e=[];p.on('pageerror',x=>e.push(x.message));await p.goto('file://'+__dirname+'/sheet3.html');await p.waitForFunction(()=>window.done,null,{timeout:20000}).catch(()=>{});await p.waitForTimeout(300);
const el=await p.$('#S'); if(el) await el.screenshot({path:__dirname+'/raw3-chip.png'});console.log('errors',e.length,e.slice(0,2).join(' | '));await b.close();})();

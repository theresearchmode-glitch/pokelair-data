// What is the LCP element on the Claude build Home on a slow phone, and what loads before it (biggest transfers)
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');const dir=process.argv[2];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{const f=path.join(dir,decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(f)&&fs.statSync(f).isFile()){r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}else{r.writeHead(404);r.end();}});
srv.listen(0,async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const s=await ctx.newCDPSession(p);
await s.send('Network.enable');await s.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6e6/8,uploadThroughput:750e3/8});await s.send('Emulation.setCPUThrottlingRate',{rate:4});
const reqs=[];s.on('Network.loadingFinished',e=>reqs.push(e));const urls={};s.on('Network.responseReceived',e=>{urls[e.requestId]=e.response.url});
await p.addInitScript(()=>{window.__l=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__l.push({t:Math.round(e.startTime),el:e.element?(e.element.tagName+'.'+e.element.className).slice(0,80):'',url:(e.url||'').slice(-60),size:e.size})}).observe({type:'largest-contentful-paint',buffered:true});});
const t0=Date.now();await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`,{waitUntil:'load',timeout:180000});console.log('load event',Date.now()-t0,'ms');await p.waitForTimeout(4000);
console.log('LCP candidates:',JSON.stringify(await p.evaluate(()=>window.__l),null,0));
const big=reqs.map(e=>({u:(urls[e.requestId]||'').replace(/^.*\//,''),kb:Math.round(e.encodedDataLength/1024)})).sort((a,b)=>b.kb-a.kb);
console.log('total KB',big.reduce((a,x)=>a+x.kb,0),'requests',big.length);console.log('biggest:',big.slice(0,10).map(x=>x.u+' '+x.kb+'KB').join(' | '));
await b.close();srv.close();});

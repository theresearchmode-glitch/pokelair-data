// HH's independent LCP check: node measure.cjs <siteDir> <label>. Serves the folder like Cloudflare static assets
// (path, path.html, path/index.html, else 404.html), loads each page 3 times in Chromium, cold cache, Lighthouse-style mobile throttling
// (4x CPU, 150 ms RTT, 1.6 Mbit/s down) and also unthrottled; prints the median LCP, FCP and CLS.
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const dir=process.argv[2],label=process.argv[3];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg','.xml':'application/xml','.txt':'text/plain','.ico':'image/x-icon'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);const c=[p,p+'.html',path.join(p,'index.html')];for(const x of c){const f=path.join(dir,x);if(f.startsWith(dir)&&fs.existsSync(f)&&fs.statSync(f).isFile()){r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});return fs.createReadStream(f).pipe(r);}}r.writeHead(404,{'content-type':'text/html'});fs.createReadStream(path.join(dir,'404.html')).pipe(r);});
const pages=['/','/pokemon','/pokemon/garchomp','/team','/meta'];
srv.listen(0,async()=>{const port=srv.address().port;const b=await chromium.launch();const out=[];
for(const mode of ['mobile','fast'])for(const pg of pages){const L=[],F=[],C=[];for(let i=0;i<3;i++){const ctx=await b.newContext({viewport:mode==='mobile'?{width:390,height:844}:{width:1440,height:900}});const p=await ctx.newPage();
 if(mode==='mobile'){const s=await ctx.newCDPSession(p);await s.send('Network.enable');await s.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6e6/8,uploadThroughput:750e3/8});await s.send('Emulation.setCPUThrottlingRate',{rate:4});}
 await p.addInitScript(()=>{window.__lcp=0;window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});});
 await p.goto(`http://127.0.0.1:${port}${pg}`,{waitUntil:'load',timeout:120000});await p.waitForTimeout(3000);
 const v=await p.evaluate(()=>({l:window.__lcp,c:window.__cls,f:(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime||0}));L.push(v.l);F.push(v.f);C.push(v.c);await ctx.close();}
 const med=a=>a.sort((x,y)=>x-y)[1];out.push(`${label}\t${mode}\t${pg}\tLCP ${Math.round(med(L))}\tFCP ${Math.round(med(F))}\tCLS ${med(C).toFixed(4)}`);console.log(out[out.length-1]);}
await b.close();srv.close();});

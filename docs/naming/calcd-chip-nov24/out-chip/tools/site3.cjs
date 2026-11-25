// Before/after on a scratch copy of the real built page (app/dist/v2.html). "after" swaps the name in the browser only.
const {chromium}=require('playwright'); const fs=require('fs'); const LK=JSON.parse(fs.readFileSync(__dirname+'/lockups3.json'));
const PAGE='file:///home/user/pokelair-data/app/dist/v2.html#home'; const OUT=__dirname+'/raw-site3/'; fs.mkdirSync(OUT,{recursive:true});
async function after(p,k){ await p.evaluate(([L])=>{
  const svg=(h)=>'<svg class="tz-lg" xmlns="http://www.w3.org/2000/svg" viewBox="'+L.vb+'" style="display:block;height:'+h+'px;width:auto" role="img" aria-label="Calc\'d">'+L.inner+'</svg>';
  const mk=(h)=>'<svg class="tz-lg" xmlns="http://www.w3.org/2000/svg" viewBox="'+L.markVb+'" style="display:block;height:'+h+'px;width:auto" role="img" aria-label="Calc\'d">'+L.mark+'</svg>';
  document.querySelectorAll('img.np-lg, .np-lg img').forEach(im=>{const r=im.getBoundingClientRect(), h=r.height||32; if(!r.width) return; im.outerHTML = (r.width/h<1.6) ? mk(Math.round(h*1.25)) : svg(Math.round(h*1.55));});
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())) if(/NastyPlot/.test(n.nodeValue)) n.nodeValue=n.nodeValue.replace(/NastyPlot/g,"Calc'd");
  document.querySelectorAll('[aria-label*="NastyPlot"],[alt*="NastyPlot"]').forEach(e=>{for(const a of ['aria-label','alt']) if(e.getAttribute(a)) e.setAttribute(a,e.getAttribute(a).replace(/NastyPlot/g,"Calc'd"));});
  document.title="Calc'd · Pokémon Champions team builder"; },[LK[k]]); }
(async()=>{const b=await chromium.launch(); const log=[];
for(const [w,h] of [[1440,900],[390,844]]) for(const th of ['day','night']) for(const v of ['before','after']){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,colorScheme:th==='night'?'dark':'light'});
  await ctx.addInitScript(t=>{try{localStorage.setItem('np2.theme',t)}catch(e){}},th);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(PAGE); await p.waitForTimeout(2500); await p.evaluate(()=>document.fonts.ready);
  if(v==='after') await after(p,'A'); await p.waitForTimeout(400);
  const id=`${w}-${th}-${v}`; await p.screenshot({path:OUT+id+'-home.png'});
  const f=await p.$('footer.np-foot'); if(f){await f.scrollIntoViewIfNeeded(); await f.screenshot({path:OUT+id+'-footer.png'});}
  const tl=await p.evaluate(()=>[document.title,document.body.innerText.match(/NastyPlot/g)?.length||0, document.documentElement.getAttribute('data-theme')||document.documentElement.className]);
  log.push(id+' title="'+tl[0]+'" visible NastyPlot left='+tl[1]+' theme='+tl[2]+' errors='+errs.length); await ctx.close();}
console.log(log.join('\n')); await b.close();})();

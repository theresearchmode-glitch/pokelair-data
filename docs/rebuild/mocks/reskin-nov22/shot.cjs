// Shared runner for the reskin direction mock-ups (helper hM, Nov 22). Run from the copy's root after a --v2 --preview-data build:
//   PAGE=$PWD/app/dist/v2.html node docs/rebuild/mocks/reskin-nov22/shot.cjs <hash> <out-prefix> [inject.js|-] [1440:day,1440:night,390:day]
// It opens the real page, runs the inject file inside the site's closure (test hook __ev; needs window.__PL_TEST), prints each height.
// node shot.cjs <hash> <outprefix> [inject.js] [modes e.g. 1440:day,1440:night,390:day]
const {chromium}=require(require('path').resolve('node_modules/playwright'));const fs=require('fs');
(async()=>{const [hash,out,inj,modes='1440:day,1440:night,390:day']=process.argv.slice(2);const page=process.env.PAGE;
const b=await chromium.launch();
for(const md of modes.split(',')){const [w,th]=md.split(':');const W=+w;
const c=await b.newContext({viewport:{width:W,height:900},deviceScaleFactor:W<700?2:1,hasTouch:W<700});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__PL_TEST=1});
await p.goto('file://'+page+'#'+hash);await p.waitForTimeout(2500);await p.evaluate(t=>V2.setTheme(t),th);await p.waitForTimeout(300);
if(inj&&inj!=='-'){await p.evaluate(c=>window.__ev(c),fs.readFileSync(inj,'utf8'));}
await p.addStyleTag({content:'.np-bar{display:none!important}'});await p.waitForTimeout(900);
await p.evaluate(()=>scrollTo(0,0));
const h=await p.evaluate(()=>document.documentElement.scrollHeight);
const broken=await p.evaluate(()=>[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.getBoundingClientRect().width>0).map(i=>i.src.slice(-40)));
await p.screenshot({path:`${out}-${w}-${th}.png`,fullPage:true});
console.log(w,th,'height',h,'screens',(h/900).toFixed(1),'broken',broken.length,broken.slice(0,3).join(' '),errs.length?'ERR '+errs.join('|').slice(0,200):'');await c.close()}
await b.close()})();

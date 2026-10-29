import fs from 'node:fs'; import {chromium} from 'playwright';
const [,,html,out,W="0",NW="1"]=process.argv;const w=+W,nw=+NW; fs.mkdirSync(out,{recursive:true}); const FPS=30;
const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
await pg.goto('file://'+html); const T=await pg.evaluate(()=>window.ready); const N=Math.round(T*FPS);
fs.writeFileSync(out+'/../cues.json',JSON.stringify(await pg.evaluate(()=>cues())));
const t0=Date.now();
for(let i=w;i<N;i+=nw){ if(fs.existsSync(`${out}/${String(i).padStart(5,"0")}.jpg`)) continue; await pg.evaluate(t=>seek(t),i/FPS); await pg.screenshot({path:`${out}/${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92}); if(i%300==0) console.log(i,'/',N,((Date.now()-t0)/1000|0)+'s'); }
await b.close(); console.log('done',N);

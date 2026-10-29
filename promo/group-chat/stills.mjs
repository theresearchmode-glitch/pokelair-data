import {chromium} from 'playwright';
const [,,html,out,...ts]=process.argv; const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:1});
pg.on('console',m=>console.log('console',m.text())); pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('file://'+html); const T=await pg.evaluate(()=>window.ready); console.log('total',T);
for(const t of ts){ await pg.evaluate(t=>seek(t),+t); await pg.screenshot({path:`${out}/s_${t}.jpg`,type:'jpeg',quality:85}); }
await b.close();

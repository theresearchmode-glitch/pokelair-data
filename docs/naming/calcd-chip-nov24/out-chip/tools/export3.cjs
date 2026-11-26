const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+__dirname+'/sheet3.html');await p.waitForFunction(()=>window.done);
const o=await p.evaluate(()=>{const W=word3();return {A:{vb:'-22 -64 '+(W.w+44)+' '+(W.h+88),inner:sticker2(W.draw,{edge:16,line:7,dx:4,dy:5}),mark:sticker2(C2.small),markVb:'-26 -30 176 176'}};});
require('fs').writeFileSync(__dirname+'/lockups3.json',JSON.stringify(o));console.log('ok');await b.close();})();

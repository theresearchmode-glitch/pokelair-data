const {chromium}=require('playwright'); const fs=require('fs'); const L=JSON.parse(fs.readFileSync(__dirname+'/lockups3.json')).A;
const html=`<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Unbounded;font-weight:800;src:url(/home/user/pokelair-data/app/src/v2/fonts/unbounded-latin.woff2)}@font-face{font-family:'Instrument Sans';font-weight:400 700;src:url(/home/user/pokelair-data/app/src/v2/fonts/instrument-sans-latin.woff2)}
body{margin:0}#c{position:relative;width:1200px;height:630px;background:#17161A;overflow:hidden;font-family:'Instrument Sans';color:#F7F5F0}
.s{position:absolute;top:-40px;bottom:-40px;transform:skewX(-14deg)}.mid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px}
h1{margin:0;font:italic 800 46px/1.1 Unbounded}h1 span{color:#5CB8F0}.sub{font:600 22px/1.5 'Instrument Sans';color:#CFCBD8}
</style><div id="c"><div class="s" style="left:-150px;width:240px;background:#E8364F"></div><div class="s" style="left:110px;width:38px;background:#0078BF"></div>
<div class="s" style="right:-150px;width:240px;background:#0078BF"></div><div class="s" style="right:110px;width:38px;background:#E8364F"></div>
<div class="mid"><svg viewBox="${L.vb}" height="230">${L.inner}</svg><div class="sub">Pokémon Champions team builder</div></div></div>`;
fs.writeFileSync(__dirname+'/card3.html',html);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:630}});await p.goto('file://'+__dirname+'/card3.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await (await p.$('#c')).screenshot({path:__dirname+'/og-calcd-chip2-1200x630.png'});console.log('ok');await b.close();})();

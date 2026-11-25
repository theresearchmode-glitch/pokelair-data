// Side-by-side of the 512px render against the two 4x upscales. Usage: node upcmp.cjs <scratchDir>
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const S = process.argv[2], uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(S, f)).toString('base64');
const cols = [['Original', '512px, what the mock-ups use now', 'home/903.png'], ['Upscaled, model A', '2048px, "anime" model', 'up/903-anime.png'], ['Upscaled, model B', '2048px, general model', 'up/903-plus.png']];
const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap">
<style>*{box-sizing:border-box;margin:0}body{width:1500px;background:#FBFAF7;font:500 16px/1.4 "Instrument Sans",system-ui,sans-serif;color:#17161A;padding:36px 40px 40px}
h1{font-weight:700;font-size:28px;letter-spacing:-.02em}p{color:#48454F;margin-top:6px}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:24px}.c b{display:block;font-weight:700;font-size:17px}.c span{color:#48454F;font-size:14px}
.v{margin-top:10px;height:460px;border-radius:10px;background:linear-gradient(150deg,#C9DDF3,#EBC6DE);background-size:cover;position:relative;overflow:hidden}
.v i{position:absolute;inset:0;background-repeat:no-repeat}</style>
<h1>Sharper art test: Sneasler</h1><p>Top row: the whole Pokémon at hero size (520px wide on a sharp screen). Bottom row: the face, enlarged, where softness shows most.</p>
<div class="g">${cols.map(c => `<div class="c"><b>${c[0]}</b><span>${c[1]}</span><div class="v"><i style="background-image:url(${uri(c[2])});background-size:460px 460px;background-position:center"></i></div></div>`).join('')}</div>
<div class="g">${cols.map(c => `<div class="c"><div class="v"><i style="background-image:url(${uri(c[2])});background-size:1500px 1500px;background-position:-470px -250px"></i></div></div>`).join('')}</div>`;
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  const f = path.join(S, 'out', 'upcmp.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 1500, height: 900}, deviceScaleFactor: 2})).newPage();
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
  await pg.screenshot({path: path.join(S, 'out', 'nastyplot-sharper-art-test.png'), fullPage: true}); await b.close();
})();

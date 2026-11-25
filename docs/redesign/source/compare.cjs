// Before / after sheets. Usage: node compare.cjs <outDir>
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const OUT = process.argv[2], uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64');
const sheets = [['home', 'Home', 'current-home.png', 'nastyplot-home-v3.png'], ['myteam', 'My Team', 'current-myteam.png', 'nastyplot-myteam-concept.png']];
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  for (const [id, title, before, after] of sheets) {
    const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap">
<style>*{box-sizing:border-box;margin:0}body{width:1640px;background:#E9E7E2;font:500 16px/1.4 "Instrument Sans",system-ui,sans-serif;color:#17161A;padding:36px 40px 44px}
h1{font:700 30px/1.1 "Instrument Sans",sans-serif;letter-spacing:-.02em}p{color:#5B5862;margin-top:6px}
.g{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:26px;align-items:start}
.c b{display:block;font:700 15px/1 "Instrument Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}.c b span{font-weight:500;letter-spacing:0;text-transform:none;color:#5B5862;margin-left:10px}
img{display:block;width:100%;border-radius:10px;box-shadow:0 20px 50px -24px rgba(30,20,50,.5)}</style>
<h1>NastyPlot ${title}: before and after</h1><p>Left is the page as it is today. Right is a design concept, not a working page. Both show the same data (Nov 8) at the same width.</p>
<div class="g"><div class="c"><b>Before <span>today's page</span></b><img src="${uri(before)}"></div><div class="c"><b>After <span>redesign concept</span></b><img src="${uri(after)}"></div></div>`;
    const f = path.join(OUT, 'compare-' + id + '.html'); fs.writeFileSync(f, html);
    const pg = await (await b.newContext({viewport: {width: 1640, height: 900}, deviceScaleFactor: 1.25})).newPage();
    await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
    console.log(id, await pg.evaluate(() => document.documentElement.scrollHeight));
    await pg.screenshot({path: path.join(OUT, 'nastyplot-before-after-' + id + '.png'), fullPage: true}); await pg.close();
  }
  await b.close();
})();

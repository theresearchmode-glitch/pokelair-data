const {chromium} = require('/home/user/pokelair-data/node_modules/playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 420, height: 400}});
 for (const [src, out, txt] of JSON.parse(process.argv[2])) {
  const d = fs.readFileSync(src).toString('base64');
  await p.setContent(`<body style="margin:0;background:#fff"><div id=w style="display:inline-block"><div style="padding:8px 10px;background:${/RECOMMENDED/.test(txt) ? "#0B6B2E" : "#111"};color:#fff;font:700 34px/1.35 system-ui,sans-serif;max-width:2400px">${txt}</div><img src="data:image/png;base64,${d}" style="display:block"></div></body>`);
  await p.locator('#w').screenshot({path: out}); }
 await b.close(); })();

// Serves the downloaded Preview files through Playwright's router (no server), opens a page, screenshots it.
const {chromium} = require('C:/Users/simra/code/pl-pcrun/node_modules/playwright'); const fs = require('fs'), path = require('path');
const D = 'C:/Users/simra/AppData/Local/Temp/claude/469e588db1a22171/bb823294-4095-4fd5-ba18-59326258ebc4/scratchpad/info-sheets/preview2/';
const T = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.jpg': 'image/jpeg'};
module.exports.open = async (b, w, h, hash) => { const c = await b.newContext({viewport: {width: w, height: h}, hasTouch: w < 700, deviceScaleFactor: w < 700 ? 2 : 1});
  await c.route('https://np.local/**', r => { const u = new URL(r.request().url()), f = path.join(D, decodeURIComponent(u.pathname)); if (fs.existsSync(f) && fs.statSync(f).isFile()) r.fulfill({body: fs.readFileSync(f), contentType: T[path.extname(f)] || 'application/octet-stream'}); else r.fulfill({status: 404, body: ''}); });
  const p = await c.newPage(); await p.goto('https://np.local/foundation.html' + hash); await p.waitForTimeout(4000); return {c, p}; };
if (require.main === module) (async () => { const [hash, out, w = 1440] = process.argv.slice(2); const b = await chromium.launch(); const {p} = await module.exports.open(b, +w, 900, hash);
  await p.screenshot({path: out, fullPage: true}); console.log(await p.evaluate(() => [document.title, document.documentElement.scrollHeight, window.__NP_PVFAIL || 'ok'].join(' | '))); await b.close(); })();


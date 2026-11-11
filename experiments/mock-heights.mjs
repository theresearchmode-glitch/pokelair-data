// Rebuild mock-up page heights (rule: docs/rebuild/design-system.md section 9). Default state, day mode, three sizes.
import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const OUT = fileURLToPath(new URL('../docs/rebuild/mocks/out/', import.meta.url));
const PAGES = (process.argv[2] || 'myteam,mybox,firstvisit').split(','), SIZES = [['phone',390,844],['ipad',820,1180],['desktop',1440,900]];
const b = await chromium.launch(), res = {};
for (const p of PAGES) for (const [k, w, h] of SIZES) {
  const pg = await (await b.newContext({viewport: {width: w, height: h}})).newPage();
  await pg.goto('file://' + OUT + p + '.html#light'); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}); await pg.waitForTimeout(300);
  (res[p] ||= {})[k] = await pg.evaluate(() => ({h: document.documentElement.scrollHeight, side: document.documentElement.scrollWidth - innerWidth,
    out: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(e).position !== 'absolute'; }).length}));
  await pg.close(); }
await b.close(); console.log(JSON.stringify(res));

// Zero-visual-change pixel comparator (job 19 / job 14 Part D; manual Playwright run).
// Screenshots all 29 routes at 390x844 and 1440x900, day and night, from OLD_PAGE vs NEW_PAGE,
// and fails if any pixel differs beyond anti-aliasing tolerance (channel diff > 2 on > 0.1% of pixels).
// Usage: OLD_PAGE=app/dist/v2-old.html NEW_PAGE=app/dist/v2-new.html node experiments/same-pixels.mjs
import fs from 'node:fs';
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const resolvePage = p => (p.startsWith('/') ? p : ROOT + p);

const OLD_PAGE = process.env.OLD_PAGE ? resolvePage(process.env.OLD_PAGE) : '';
const NEW_PAGE = process.env.NEW_PAGE ? resolvePage(process.env.NEW_PAGE) : '';
if (!OLD_PAGE || !NEW_PAGE || !fs.existsSync(OLD_PAGE) || !fs.existsSync(NEW_PAGE)) {
  throw new Error('Provide existing OLD_PAGE and NEW_PAGE env vars (e.g. OLD_PAGE=app/dist/v2-old.html NEW_PAGE=app/dist/v2-new.html)');
}

const ROUTES = [
  '#home', '#team', '#build', '#battle', '#calc', '#speed', '#types', '#practice', '#gauntlet',
  '#meta', '#usage', '#sets', '#tournaments', '#weekly', '#events', '#archetypes', '#natures',
  '#track', '#method', '#gifts', '#compare', '#box', '#about', '#about=priv', '#feedback',
  '#pokemon=Incineroar', '#pokemon=Garchomp', '#pokemon=Charizard-Mega-Y', '#notfound'
];
const VIEWPORTS = [
  {name: '390', width: 390, height: 844},
  {name: '1440', width: 1440, height: 900}
];
const THEMES = ['day', 'night'];
const CHANNEL_TOL = +(process.env.CHANNEL_TOL || 2);
const MAX_DIFF_RATIO = +(process.env.MAX_DIFF_RATIO || 0.001);

const browser = await chromium.launch();
let failed = 0;
try {
  const cmpPage = await browser.newPage();

  async function diffPngs(bufA, bufB) {
    const a64 = bufA.toString('base64');
    const b64 = bufB.toString('base64');
    return cmpPage.evaluate(async ({a64, b64, tol}) => {
      const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + src; });
      const [ia, ib] = await Promise.all([load(a64), load(b64)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return {mismatchSize: true, wA: ia.width, hA: ia.height, wB: ib.width, hB: ib.height};
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
      const g = c.getContext('2d');
      g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data;
      g.clearRect(0, 0, c.width, c.height);
      g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
      let diff = 0; const total = c.width * c.height;
      for (let i = 0; i < da.length; i += 4) {
        if (Math.abs(da[i] - db[i]) > tol || Math.abs(da[i + 1] - db[i + 1]) > tol || Math.abs(da[i + 2] - db[i + 2]) > tol || Math.abs(da[i + 3] - db[i + 3]) > tol) diff++;
      }
      return {diff, total, ratio: diff / total};
    }, {a64, b64, tol: CHANNEL_TOL});
  }

  async function snap(filePath, route, vp, theme) {
    const ctx = await browser.newContext({viewport: {width: vp.width, height: vp.height}, deviceScaleFactor: 1});
    const pg = await ctx.newPage();
    await pg.addInitScript(th => {
      localStorage.setItem('cc2.welcomed', '"1"');
      localStorage.setItem('np2.theme', th);
    }, theme);
    await pg.goto('file://' + filePath + route, {waitUntil: 'load', timeout: 25000});
    await pg.waitForTimeout(500);
    await pg.evaluate(() => document.fonts && document.fonts.ready);
    const buf = await pg.screenshot({fullPage: false});
    await ctx.close();
    return buf;
  }

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      for (const route of ROUTES) {
        const [a, b] = await Promise.all([snap(OLD_PAGE, route, vp, theme), snap(NEW_PAGE, route, vp, theme)]);
        const d = await diffPngs(a, b);
        const ok = !d.mismatchSize && d.ratio <= MAX_DIFF_RATIO;
        if (!ok) {
          failed++;
          console.log(`FAIL ${vp.name} ${theme} ${route}: ${JSON.stringify(d)}`);
        }
      }
    }
  }
  console.log(`Checked ${ROUTES.length * VIEWPORTS.length * THEMES.length} views: ${failed ? failed + ' FAILED' : 'ALL PASS'}`);
  if (failed) process.exitCode = 1;
} finally {
  await browser.close();
}

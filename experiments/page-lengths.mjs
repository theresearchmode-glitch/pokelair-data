// Page lengths (Nov 22, Sim: find a desktop length rule): every page's height at 390, 1280, 1440 and 1920 wide, day theme,
// in "screens" (height / window height), for the build given. Run it on two builds (before the reskin and now) to compare.
//   PAGE=app/dist/v2.html OUT=lengths-now.json node experiments/page-lengths.mjs     (a --v2 --preview-data --art=../src/v2/art/ build)
import {chromium} from 'playwright'; import path from 'node:path'; import fs from 'node:fs';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'), OUT = process.env.OUT || 'lengths.json';
const R = ['home','build','team','battle','calc','practice','gauntlet','speed','types','meta','usage','sets','archetypes','tournaments','events','weekly','news','gifts','track','method','about','feedback','box','pokemon=Garchomp','compare'];
const W = [[390, 844], [1280, 800], [1440, 900], [1920, 1080]];
const b = await chromium.launch(), res = {};
for (const [w, h] of W) { const c = await b.newContext({viewport: {width: w, height: h}, hasTouch: w < 700}), p = await c.newPage();
  await p.addInitScript(() => { window.__PL_TEST = 1; });
  for (const r of R) { await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(2000);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    /* how much of the width the content uses: the widest block inside #main vs the window */
    const used = await p.evaluate(() => { const m = document.querySelector('#main'); if (!m) return 0; let mx = 0; for (const e of m.querySelectorAll('section,article,div')) { const q = e.getBoundingClientRect(); if (q.height > 200) mx = Math.max(mx, q.width); } return Math.round(100 * mx / innerWidth); });
    (res[r] = res[r] || {})[w] = {px: H, screens: +(H / h).toFixed(2), widthUsed: used}; console.log(w, r, H, (H / h).toFixed(2), used + '%'); }
  await c.close(); }
fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); await b.close(); console.log('wrote', OUT);

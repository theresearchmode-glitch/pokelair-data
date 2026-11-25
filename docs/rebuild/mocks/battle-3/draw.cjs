// Battle, three fresh directions (Nov 22, round 2; the concept file runs after shared.js): drawn INSIDE the built page with the site's real parts (kit header, kit cards, move tickets,
// the Pokémon page's damage bars and two-tone section bars, real sprites, real numbers), then screenshotted. Mock-up only:
// nothing in the app changes. Usage: node draw.cjs <built v2.html> <out prefix> <concept file> [tags]
// The concept file exports {css, html} as a function source run in the page (it gets the data object D).
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
const D = require('../battle-2/data.cjs');
(async () => {
  const [page, out, conceptFile, only] = process.argv.slice(2), concept = fs.readFileSync(path.join(__dirname, 'shared.js'), 'utf8') + '\n' + fs.readFileSync(path.resolve(conceptFile), 'utf8'), b = await chromium.launch();
  const runs = [[1440, 'day', 'd'], [1440, 'night', 'n'], [390, 'day', 'p'], [390, 'night', 'pn']].filter(r => !only || only.split(',').includes(r[2]));
  for (const [w, th, tag] of runs) {
    const c = await b.newContext({viewport: {width: w, height: 900}, deviceScaleFactor: w < 700 ? 2 : 1, hasTouch: w < 700}), p = await c.newPage();
    await p.addInitScript(() => { window.__PL_TEST = 1; });
    await p.goto('file://' + page + '#battle'); await p.waitForTimeout(3000);
    await p.evaluate(opp => window.__ev(`S.opp = ${JSON.stringify(opp)}; V2.redraw()`), D.theirSix); await p.waitForTimeout(600);
    await p.evaluate(t => V2.setTheme(t), th); await p.waitForTimeout(300);
    await p.evaluate(([src, D]) => { const html = window.__ev('(function (D) {' + src + '\n})(' + JSON.stringify(D) + ')'); const m = document.querySelector('#main'); m.innerHTML = html;
      V2.kTySprite && V2.kTySprite(); V2.kFit && V2.kFit(m); window.__after && window.__after(); scrollTo(0, 0); }, [concept, D]);
    await p.waitForTimeout(900);
    await p.screenshot({path: `${out}-${tag}.png`, fullPage: true});
    console.log(tag, w, th, 'page height', await p.evaluate(() => document.documentElement.scrollHeight)); await c.close();
  }
  await b.close();
})();

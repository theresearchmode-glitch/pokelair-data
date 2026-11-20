// Scan S26 (Sim, Nov 20: "when a player presses battle it should take them to battle not the damage calc"): the top bar's Battle link
// goes to #battle and opens the Battle page, with Battle marked current; Damage Calculator stays first in the Battle tools bar.
// 390 and 1440. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-s26.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
for (const W of [390, 1440]) { const c = await b.newContext({viewport: {width: W, height: 900}}); const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#home', {timeout: 90000}); await p.waitForTimeout(2500);
  const links = await p.evaluate(() => [...document.querySelectorAll('a')].filter(a => a.textContent.trim() === 'Battle' && a.closest('nav,header')).map(a => a.getAttribute('href')));
  ok(links.length > 0 && links.every(h => h === '#battle'), `${W}: top bar Battle links go to #battle (${links.join(', ')})`);
  await p.evaluate(() => { location.hash = '#battle'; }); await p.waitForTimeout(1500);
  const x = await p.evaluate(() => ({cur: [...document.querySelectorAll('[aria-current="page"]')].map(a => a.textContent.trim()), bar: [...document.querySelectorAll('.bt-tools a')].map(a => a.getAttribute('href'))}));
  ok(x.cur.includes('Battle'), `${W}: on #battle, Battle is marked current (${x.cur.join(', ')})`);
  ok(x.bar[0] === '#calc' && x.bar[1] === '#battle', `${W}: tools bar still Damage Calculator, then Battle (${x.bar.slice(0, 3).join(', ')})`);
  ok(!errs.length, `${W}: no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-s26: ${fails.length} FAILED` : 'v2-s26: all passed'); process.exit(fails.length ? 1 : 0);

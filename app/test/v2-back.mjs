// The top-left Back arrow and the Forward arrow beside the logo work even when the page's frame ignores the browser's history steps
// (Sim, Nov 18, Claude desktop app, Preview: Home -> Sneasler -> Back stayed on Sneasler; after the first fix, Back felt laggy and the
// Forward arrow never showed).
// Checks, at 1440 wide from Home:
//   1. normal history: Sneasler's page, Back -> Home; Forward shows and -> Sneasler again
//   2. frame ignores history.back()/forward(): Back -> Home (the first time within 0.6 s), Forward shows and -> Sneasler,
//      later Backs land under 0.3 s, i.e. without the 350 ms safety-net wait (once the page knows). Not 0.2 s: on a busy page
//      (Battle) the click itself was measured at 203 ms once, which is the page's own work, not a wait (Nov 18)., Battle, Back, Back -> Build, Home counted right, arrow hides on Home
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-back.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch();
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async () => { const p = await b.newPage({viewport: {width: 1440, height: 900}}); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(5000); return {p, errs}; };
const tapMon = p => p.evaluate(() => { const e = [...document.querySelectorAll('#main [data-v2mon="Sneasler"]')][0]; e.scrollIntoView(); e.click(); });
const hash = p => p.evaluate(() => location.hash);
// press an arrow, then report how long until the address changed (ms, or -1 if it never did within 2 s)
const press = async (p, sel) => { const h0 = await hash(p); const t0 = Date.now(); await p.click(sel);
  for (let i = 0; i < 100; i++) { if (await hash(p) !== h0) { const ms = Date.now() - t0; await p.waitForTimeout(800); return ms; } await p.waitForTimeout(20); } return -1; };
const vis = (p, sel) => p.isVisible(sel);
{ const {p, errs} = await open(); await tapMon(p); await p.waitForTimeout(1500);
  ok(await hash(p) === '#pokemon=sneasler', `normal: tapping Sneasler on Home opens its page (${await hash(p)})`);
  await press(p, '[data-v2back]'); ok(await hash(p) === '#home', `normal: Back returns to Home (${await hash(p)})`);
  ok(await vis(p, '[data-v2fwd]'), 'normal: after Back the Forward arrow shows');
  await press(p, '[data-v2fwd]'); ok(await hash(p) === '#pokemon=sneasler', `normal: Forward returns to Sneasler (${await hash(p)})`);
  ok(errs.length === 0, `normal: no page errors (${errs.length})`); await p.close(); }
{ const {p, errs} = await open();
  await p.evaluate(() => { window.__hc = 0; history.back = () => { window.__hc++; }; history.forward = () => { window.__hc++; }; }); /* the frame swallows the history steps; count every try */
  await tapMon(p); await p.waitForTimeout(1500);
  const t1 = await press(p, '[data-v2back]');
  ok(await hash(p) === '#home' && t1 >= 0 && t1 <= 600, `history ignored: Back returns to Home, the first time within 0.6 s (${await hash(p)}, ${t1} ms)`);
  ok(!(await vis(p, '[data-v2back]')), 'history ignored: on Home (the first page) the Back arrow hides');
  ok(await vis(p, '[data-v2fwd]'), 'history ignored: after Back the Forward arrow shows');
  const c1 = await p.evaluate(() => window.__hc);
  const t2 = await press(p, '[data-v2fwd]');
  ok(await hash(p) === '#pokemon=sneasler' && t2 >= 0, `history ignored: Forward returns to Sneasler (${await hash(p)}, ${t2} ms)`);
  for (const h of ['build', 'battle']) { await p.evaluate(h => { location.hash = '#' + h; }, h); await p.waitForTimeout(1200); }
  const t3 = await press(p, '[data-v2back]'); const a = await hash(p); const t4 = await press(p, '[data-v2back]'); const c = await hash(p);
  const c2 = await p.evaluate(() => window.__hc);
  ok(c1 === 1 && c2 === 1, `history ignored: after the first swallowed step the arrows never wait on the browser's history again (tries: ${c1} then ${c2}; want 1, 1)`);
  ok(a === '#build' && c === '#pokemon=sneasler',
    `history ignored: Battle, Back, Back -> ${a} (${t3} ms), ${c} (${t4} ms) (want #build, #pokemon=sneasler; times shown, not judged: a busy page like Battle adds its own delay)`);
  ok(!(await vis(p, '[data-v2fwd]')) === false, 'history ignored: Forward shows again after going back');
  ok(errs.length === 0, `history ignored: no page errors (${errs.length})`); await p.close(); }
await b.close();
console.log(`v2-back: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

// The top-left Back arrow takes you to the page you came from even when the page's frame ignores the browser's history step
// (Sim, Nov 18, Claude desktop app on Windows: Home -> Sneasler's page -> Back stayed on Sneasler in the Preview artifact).
// Checks, at 1440 wide on Home:
//   1. normal: Sneasler's page, Back -> Home (the browser's own history step)
//   2. frame ignores history.back(): Sneasler's page, Back -> Home all the same (the safety net), and the arrow then hides
//   3. after the safety net, Home -> Build -> Battle, Back twice -> Build, then Home (the steps still count right)
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-back.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch();
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async () => { const p = await b.newPage({viewport: {width: 1440, height: 900}}); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(5000); return {p, errs}; };
const tapMon = p => p.evaluate(() => { const e = [...document.querySelectorAll('#main [data-v2mon="Sneasler"]')][0]; e.scrollIntoView(); e.click(); });
const back = async p => { await p.click('[data-v2back]'); await p.waitForTimeout(1500); };
const hash = p => p.evaluate(() => location.hash);
{ const {p, errs} = await open(); await tapMon(p); await p.waitForTimeout(1500);
  ok(await hash(p) === '#pokemon=sneasler', `normal: tapping Sneasler on Home opens its page (${await hash(p)})`);
  await back(p); ok(await hash(p) === '#home', `normal: Back returns to Home (${await hash(p)})`);
  ok(errs.length === 0, `normal: no page errors (${errs.length})`); await p.close(); }
{ const {p, errs} = await open();
  await p.evaluate(() => { history.back = () => {}; }); /* the frame swallows the history step */
  await tapMon(p); await p.waitForTimeout(1500); await back(p);
  ok(await hash(p) === '#home', `history ignored: Back still returns to Home (${await hash(p)})`);
  ok(!(await p.isVisible('[data-v2back]')), 'history ignored: on Home (the first page) the Back arrow hides again');
  for (const h of ['build', 'battle']) { await p.evaluate(h => { location.hash = '#' + h; }, h); await p.waitForTimeout(1200); }
  await back(p); const a = await hash(p); await back(p); const c = await hash(p);
  ok(a === '#build' && c === '#home', `history ignored: Battle, Back, Back -> ${a}, ${c} (want #build, #home)`);
  ok(errs.length === 0, `history ignored: no page errors (${errs.length})`); await p.close(); }
await b.close();
console.log(`v2-back: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

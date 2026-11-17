// Folds keep the visitor's open/closed choice through a redraw, and linked pages don't jump on a redraw (code review A1-I3, A1-I4,
// Nov 17). A redraw happens on Day/Night, Lock, data arriving, a sent feedback message... Checks:
//   1. V2.morph on a bare fold: the visitor's choice survives a redraw; the page still wins when its own wish changes
//   2. My Team: an opened "more pass" fold (Team Checks) stays open after a redraw
//   3. About opened from a link (#about=contact): open another row, scroll to the top, redraw -> no jump, the row stays open,
//      and the linked row the visitor closed stays closed
//   4. How We Calculate opened from a link: scroll to the top, redraw -> no jump
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-folds.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const go = async h => { await p.goto('file://' + PAGE + h); await p.waitForTimeout(2500); };
const tick = () => p.waitForTimeout(400);

await go('#home');
const u = await p.evaluate(async () => {
  const mk = open => { const t = document.createElement('template'); t.innerHTML = `<details${open ? ' open' : ''}><summary>x</summary>y</details>`; return t.content.firstChild; };
  const d = mk(false); document.body.append(d); const w = () => new Promise(r => setTimeout(r, 50));
  d.querySelector('summary').click(); await w(); // the visitor opens it
  V2.morph(d, mk(false)); const a = d.open;      // redraw, page unchanged -> stays open
  V2.morph(d, mk(true)); const b2 = d.open;      // page now wants it open -> open
  V2.morph(d, mk(false)); const c = d.open;      // page changes its mind -> closes
  const e = mk(false); document.body.append(e); V2.morph(e, mk(true)); const f = e.open; // never touched: the page decides
  d.remove(); e.remove(); return {a, b2, c, f}; });
ok(u.a === true, 'morph: an opened fold stays open when the page redraws unchanged');
ok(u.b2 === true && u.c === false, 'morph: the page still opens and closes a fold when its own wish changes');
ok(u.f === true, 'morph: a fold the visitor never touched follows the page');

await go('#team');
const t = await p.evaluate(async () => { const d = document.querySelector('#app details.tm-ckok'); if (!d) return {skip: 1};
  d.querySelector('summary').click(); await new Promise(r => setTimeout(r, 50)); V2.redraw(); await new Promise(r => setTimeout(r, 100));
  return {open: document.querySelector('#app details.tm-ckok').open}; });
ok(!t.skip, 'My Team: the Team Checks "more pass" fold is on the page (sample six)');
if (!t.skip) ok(t.open, 'My Team: an opened Team Checks fold stays open after a redraw');

await go('#about=contact'); await tick();
const a = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
  const what = document.getElementById('abt-what'), con = document.getElementById('abt-contact'); if (!what || !con) return {skip: 1};
  if (!con.open) return {skip: 2}; what.querySelector('summary').click(); con.querySelector('summary').click(); await w(50); scrollTo(0, 0); await w(50); V2.redraw(); await w(300);
  return {y: Math.round(scrollY), what: document.getElementById('abt-what').open, con: document.getElementById('abt-contact').open}; });
ok(!a.skip, 'About: the rows are on the page, the linked row open' + (a.skip === 2 ? ' (linked row was not open)' : ''));
if (!a.skip) { ok(a.y < 20, `About: no jump to the linked row on a redraw (scrollY ${a.y})`);
  ok(a.what, 'About: a row the visitor opened stays open'); ok(!a.con, 'About: the linked row the visitor closed stays closed'); }

await go('#home'); const k = await p.evaluate(() => V2.MTH && V2.MTH[V2.MTH.length - 1][1].slice(-1)[0][0]);
await go('#method=' + k); await tick();
const m = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const y0 = Math.round(scrollY); scrollTo(0, 0); await w(50); V2.redraw(); await w(300); return {y0, y: Math.round(scrollY)}; });
ok(m.y0 > 50, `How We Calculate: a link still scrolls to its part on arrival (scrollY ${m.y0})`);
ok(m.y < 20, `How We Calculate: no jump back to the linked part on a redraw (scrollY ${m.y})`);

await b.close();
console.log(`v2-folds: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

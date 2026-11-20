// Scan S17 (Nov 20): a new visitor (box = the untouched sample box, no pool chosen) opens Build on Whole Roster, and the built team never
// says "All six are in your box" (it may still name the one Mega to catch); a player who edited their box, or who chose My Box before, still starts on My Box (as before). 390 and 1440.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-s17.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const open = async (W, prep) => { const c = await b.newContext({viewport: {width: W, height: 900}}); const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#home', {timeout: 90000}); await p.waitForTimeout(2500);
  if (prep) { await p.evaluate(prep); await p.reload(); await p.waitForTimeout(2500); }
  await p.evaluate(() => { location.hash = '#build'; }); await p.waitForTimeout(1500); return [p, errs, c]; };
const slideVal = p => p.evaluate(() => ({src: window.__ev('ui.abSrc'), on: [...document.querySelectorAll('[data-v2slide="bdsrc"] [aria-pressed="true"], [data-v2slide="bdsrc"] [aria-checked="true"], [data-v2slide="bdsrc"] [aria-selected="true"]')].map(x => x.textContent.trim())}));
for (const W of [390, 1440]) {
  let [p, errs, c] = await open(W); let v = await slideVal(p);
  ok(v.src === 'all', `${W} new visitor: Build starts on Whole Roster (ui.abSrc ${v.src}; shown ${v.on.join() || '?'})`);
  await p.click('[data-bdgo]').catch(() => {}); await p.waitForFunction(() => window.__ev('!!(ui.ab && !ui.ab.busy)'), null, {timeout: 120000}).catch(() => {}); await p.waitForTimeout(800);
  const txt = await p.evaluate(() => document.body.innerText); ok(!/All six are in your box/i.test(txt), `${W} new visitor: the built team does not say "All six are in your box" (the sample box)`);
  ok(!errs.length, `${W} new visitor: no page errors (${errs.length})`); await c.close();
  [p, errs, c] = await open(W, () => window.__ev('(()=>{S.box=S.box.slice(1);persist()})()')); v = await slideVal(p);
  ok(v.src === 'box', `${W} edited box: Build starts on My Box (${v.src})`); await c.close();
  [p, errs, c] = await open(W, () => { localStorage.setItem('cc2.absrc', JSON.stringify('box')); }); v = await slideVal(p);
  ok(v.src === 'box', `${W} chose My Box before: stays My Box (${v.src})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-s17: ${fails.length} FAILED` : 'v2-s17: all passed'); process.exit(fails.length ? 1 : 0);

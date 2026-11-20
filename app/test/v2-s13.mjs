// Scan S13 (Nov 20): opening Compare with a team on My Team starts with My Team as Team A (Team B still to pick); with an empty My Team,
// both sides start empty. cxGo from elsewhere still sets both sides. 390 and 1440. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-s13.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
for (const W of [390, 1440]) for (const empty of [false, true]) { const c = await b.newContext({viewport: {width: W, height: 900}}); const p = await c.newPage();
  await p.addInitScript(() => { window.__PL_TEST = 1; }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(2500);
  if (empty) { await p.evaluate(() => window.__ev('(()=>{S.slots=[];fixSlots();S.loadedId=null;render()})()')); await p.waitForTimeout(400); }
  await p.evaluate(() => { location.hash = '#compare'; }); await p.waitForTimeout(1800);
  const x = await p.evaluate(() => ({A: window.__ev('ui.cx.A'), B: window.__ev('ui.cx.B'), heads: [...document.querySelectorAll('.cx2-head, .cx2-qp')].map(h => h.classList.contains('empty') || h.classList.contains('cx2-qp') ? 'empty' : 'filled') /* Q84 S31: an empty Team B is the quick-winners box (.cx2-qp) */}));
  const tag = `${W}${empty ? ' empty My Team' : ''}`;
  if (!empty) ok(x.A === 'cur' && !x.B && x.heads[0] === 'filled' && x.heads[1] === 'empty', `${tag}: Team A is My Team, Team B to pick (${x.A}/${x.B}; ${x.heads.join(', ')})`);
  else ok(!x.A && !x.B, `${tag}: both sides empty (${x.A}/${x.B})`);
  ok(!errs.length, `${tag}: no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-s13: ${fails.length} FAILED` : 'v2-s13: all passed'); process.exit(fails.length ? 1 : 0);

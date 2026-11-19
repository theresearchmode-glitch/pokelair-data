// Compare Teams shows event names cleaned (Sim's design review #22: 'raw event name with promo text and emoji'): every event
// winner offered in the picker, once picked as Team B, shows its event in the heading without emoji or prize text, through the
// same cleaner as the rest of the site (V2.evTitle). It could fail: the heading used the raw name before the fix.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-cxev.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}}); await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#compare', {timeout: 90000}); await p.waitForTimeout(3500);
const r = await p.evaluate(() => window.__ev(`(() => { const out = []; const E = META.events.events;
  for (const ev of E.slice(0, 60)) { const t = (ev.top || [])[0]; if (!t) continue; const key = ev.id + '#0';
    const R = cxResolve('e:' + key); if (!R) continue; const html = V2.cxHead('B', R), d = document.createElement('div'); d.innerHTML = html;
    const sub = (d.querySelector('.cx2-nm span') || {}).textContent || ''; out.push({raw: ev.name, sub}); }
  return out; })()`));
await b.close();
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const emoji = /[\p{Extended_Pictographic}]/u, prize = /\b(cash prizes?|prize pool|usd)\b|\$\s?\d/i;
const dirty = r.filter(x => emoji.test(x.raw) || prize.test(x.raw));
ok(r.length >= 10, `${r.length} event winners resolved for Compare`);
ok(dirty.length > 0, `${dirty.length} of them have emoji or prize text in the raw name (so this test can fail)`);
const bad = r.filter(x => emoji.test(x.sub) || prize.test(x.sub));
ok(!bad.length, `no Compare heading shows emoji or prize text (${bad.length}${bad.length ? ', e.g. "' + bad[0].sub + '"' : ''})`);
console.log(`v2-cxev: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

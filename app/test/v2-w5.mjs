// W5 (Sim, Nov 19): News shows each item on its official page's date, the UTC date (checked on the official pages from an Eastern-time
// browser: page 877 at 2026-11-18T02:00Z prints 11/18, 830 at 08-28T16:00Z prints 08/28, 816 at 08-30T22:00Z prints 08/30). So the same
// page opened in Honolulu, New York and Tokyo shows the same date on every headline. Before W5 each reader saw their own day.
//   PAGE=app/dist/v2.html node app/test/v2-w5.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'); const b = await chromium.launch(); const fails = [];
const ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const read = async tz => { const c = await b.newContext({viewport: {width: 1280, height: 900}, timezoneId: tz}), p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#news', {timeout: 90000}); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({kick: [...document.querySelectorAll('#main .dp-k, #main .nw2-k, #main .nw2-kk')].map(e => e.textContent.trim()) /* Nov 22: News on the kit: the lead's kicker .nw2-k, In brief's .nw2-kk */,
    f: [V2.dpShort('2026-11-18T02:00:00Z'), V2.dpShort('2026-08-28T16:00:00Z'), V2.dpShort('2026-08-30T22:00:00Z'), V2.dpShort('2026-11-18')]}));
  await c.close(); return r; };
const H = await read('Pacific/Honolulu'), N = await read('America/New_York'), T = await read('Asia/Tokyo');
for (const [tz, r] of [['Honolulu', H], ['New York', N], ['Tokyo', T]])
  ok(r.f.join('|') === 'Nov 18|Aug 28|Aug 30|Nov 18', `${tz}: the official pages' dates (877 Nov 18, 830 Aug 28, 816 Aug 30) and a plain day as written (${r.f.join(', ')})`);
ok(N.kick.length >= 3, `News shows headlines with dates (${N.kick.length})`);
const diff = N.kick.map((k, i) => k !== H.kick[i] || k !== T.kick[i] ? `${H.kick[i]} / ${k} / ${T.kick[i]}` : '').filter(Boolean);
ok(!diff.length && H.kick.length === N.kick.length && T.kick.length === N.kick.length, `every headline date reads the same in Honolulu, New York and Tokyo (${diff.length} differ${diff.length ? ', e.g. ' + diff[0] : ''})`);
await b.close(); console.log(`v2-w5: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

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
    const sub = (d.querySelector('.cx2-nm span') || {}).textContent || '';
    /* both teams picked: the face-off halves (compare-faceoff.js) show the same line (QA, Nov 19: they printed the raw name) */
    out.push({raw: ev.name, sub, key}); }
  return out; })()`));
// Nov 19 review: the cleaner keeps real names whole, and a top team's event (' · N players') is cleaned too
const keep = await p.evaluate(() => [["5 $ to 1st｜Pokexiaotian's Weekly Pokemon Battle#1", "Pokexiaotian's Weekly Pokemon Battle #1"], ["Weekly (Reg M-C)", "Weekly (Reg M-C)"], ["Cup (Top 8 Cash)", "Cup (Top 8 Cash)"], ["The $ Cup", "The $ Cup"], ["Open Champions League #6 (20 USD to 1st)", "Open Champions League #6"], ["⛩️$30 VGC Champions Tournament Ep 35!⛩️", "VGC Champions Tournament Ep 35!"], ["⛩️Chadweezy95 $60 VGC Champions Tourny Ep 37!⛩️", "Chadweezy95 VGC Champions Tourny Ep 37!"], ["Rising Stars - Finale ₹10,000 cash prize", "Rising Stars - Finale"], ["Maddo's Cup #13 | 100€ for the Winner | Reg M-C", "Maddo's Cup #13 · Reg M-C"]].map(([a, w]) => [a, V2.evTitle(a).replace(/\u00a0/g, ' '), w]));
const tsub = await p.evaluate(() => V2.cxSub({sub: '5-1 · Amyverse VGC Champions Arena #19 ❤️ Cash Prize! · 81 players', ev: 'Amyverse VGC Champions Arena #19 ❤️ Cash Prize! · 81 players'}));
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const emoji = /[\p{Extended_Pictographic}]/u, prize = /\b(cash prizes?|prize pool|usd)\b|\$\s?\d/i;
const dirty = r.filter(x => emoji.test(x.raw) || prize.test(x.raw));
ok(r.length >= 10, `${r.length} event winners resolved for Compare`);
ok(dirty.length > 0, `${dirty.length} of them have emoji or prize text in the raw name (so this test can fail)`);
const bad = r.filter(x => emoji.test(x.sub) || prize.test(x.sub));
/* both teams picked: the face-off (compare-faceoff.js) shows the same line (QA, Nov 19: it printed the raw name); checked on the page */
const faces = [];
for (const x of r.filter(x => emoji.test(x.raw) || prize.test(x.raw)).slice(0, 4)) {
  const q = await b.newPage({viewport: {width: 1280, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#compare', {timeout: 90000}); await q.waitForTimeout(3000);
  await q.evaluate(k => window.__ev(`ui.cx.A = 'cur'; ui.cx.B = 'e:${k}'; V2.redraw()`), x.key);
  await q.waitForFunction(() => document.querySelector('.cxf-half.b .cxf-id p'), null, {timeout: 60000}).catch(() => {});
  faces.push({raw: x.raw, face: await q.evaluate(() => (document.querySelector('.cxf-half.b .cxf-id p') || {}).textContent || '')}); await q.close(); }
const badF = faces.filter(x => !x.face || emoji.test(x.face) || prize.test(x.face));
ok(!bad.length, `no Compare heading (one team picked, and both: the face-off) shows emoji or prize text (${bad.length}${bad.length ? ', e.g. "' + bad[0].sub + '"' : ''})`);
ok(faces.length > 0 && !badF.length, `with both teams picked, the face-off heading shows the cleaned name (${faces.length} checked${badF.length ? ', e.g. "' + badF[0].face + '"' : ''})`);
for (const [a, got, want] of keep) ok(got === want, `the cleaner keeps the real name: "${a}" -> "${got}" (want "${want}")`);
ok(tsub.replace(/\u00a0/g, ' ') === '5-1 · Amyverse VGC Champions Arena #19 · 81 players', `a top team's event keeps its player count and loses the prize text ("${tsub}")`);
await b.close();
console.log(`v2-cxev: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

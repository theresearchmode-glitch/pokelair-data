// Small fixes from the code review (Nov 17), one check each; every check fails on the build before its fix.
//   A1-M1  Matchups never says "Ready for every top threat" (word list: answers, not readiness)
//   A1-M2  Build's "Copy for Showdown" uses the shared copy with its fallback (it failed where the clipboard API is blocked)
//   A1-M3  Build's Save says "for this visit" when the browser can't keep it (it always said "Saved")
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-minors.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path'; import fs from 'node:fs';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
ok(!/Ready for every top threat/.test(fs.readFileSync(PAGE, 'utf8')), 'A1-M1: the page never says "Ready for every top threat"');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#build'); await p.waitForTimeout(2500);
await p.getByRole('button', {name: 'Build Me a Team'}).first().click();
await p.waitForSelector('[data-bdcopy]', {timeout: 30000}).catch(() => {});
const has = await p.$('[data-bdcopy]');
ok(!!has, 'Build made a team with its Copy and Save buttons');
const toastAfter = async fn => { await p.evaluate(() => document.querySelectorAll('.np-toast').forEach(t => t.remove())); await fn(); await p.waitForTimeout(500);
  return p.evaluate(() => [...document.querySelectorAll('.np-toast')].map(t => t.textContent).join(' | ')); };
if (has) {
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => true; });
  const t1 = await toastAfter(() => p.click('[data-bdcopy]'));
  ok(/copied/i.test(t1), `A1-M2: with the clipboard API blocked, Copy still copies through the fallback (toast: ${t1.slice(0, 60)})`);
  await p.evaluate(() => window.__ev('V2.canStore = false'));
  const t2 = await toastAfter(() => p.click('[data-bdsave]'));
  ok(/for this visit/.test(t2), `A1-M3: Save says "for this visit" when the browser can't keep it (toast: ${t2.slice(0, 80)})`); }
await p.goto('file://' + PAGE + '#meta'); await p.waitForTimeout(2500);
const im = await p.evaluate(() => { const i = [...document.querySelectorAll('img[src*=".webp"]')]; return {n: i.length, a: i.filter(x => x.decoding === 'async').length}; });
ok(im.n > 0 && im.a === im.n, `B-I6 (part): every sprite decodes off the main thread (${im.a} of ${im.n} on Meta)`);
const m8 = await p.evaluate(() => window.__ev(`(() => { V2.ql.opp = ['Charizard']; const b = document.createElement('button'); b.dataset.ygopp = 'Charizard-Mega-Y'; document.body.append(b); b.click(); b.remove(); return V2.ql.opp.join(','); })()`));
ok(m8 === 'Charizard', `A1-M8: Their Team in the game log takes one of each Pokémon (Charizard, then Mega Charizard Y: ${m8})`);
const m6 = await p.evaluate(() => window.__ev(`(() => { const T = META.teams && META.teams.teams; if (!T || !T.length) return 'no teams'; const keep = T[0].mons; T[0].mons = [...keep.slice(0, 5), 'Notamon']; const b = document.createElement('button'); b.dataset.wtvs = '0'; document.body.append(b); b.click(); b.remove(); T[0].mons = keep; return S.opp.filter(Boolean).join(','); })()`));
ok(!/Notamon/.test(m6), `A1-M6: an unknown name from a winning team never reaches their six (${m6.slice(0, 60)})`);
await b.close();
console.log(`v2-minors: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

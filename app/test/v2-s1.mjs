// Site scan S1 + S24 (Nov 20): Team Checks never shows the bare fallback line "most recent event winners" (the proof line shows only
// once it has a measured number), never "Ready for only ..." / "not ready for" (word list: Matchups, "No answer"), never "only 0 resist".
// V2.wl is checked directly on the raw check sentences, then My Team is read at 390 and 1440, sample team and a weaker team, light and dark.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-s1.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const WEAK = `(()=>{const names=['Snorlax','Drampa','Politoed','Vivillon','Corviknight','Hippowdon'];S.slots=names.map(n=>{const b=blank();b.n=n;return b;});fixSlots();S.loadedId=null;render();})()`;
const BAD = [/most recent event winners/i, /Ready for only/i, /not ready for/i, /only 0 resist/i];
const run = async (W, th, weak) => { const phone = W < 700, c = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})});
  const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(3000);
  if (weak) { await p.evaluate(s => window.__ev(s), WEAK); await p.waitForTimeout(500); }
  await p.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {}); await p.waitForTimeout(800);
  const tag = `${th} ${W}${weak ? ' weaker team' : ''}`;
  if (W === 1440 && th === 'light' && !weak) { const w = await p.evaluate(() => [
      V2.wl('Ready for only 63% of the top 30 threats; not ready for Rillaboom, Kingambit and 2 more (recent event winners: 80% at the median).'),
      V2.wl('Ground hits 3 of yours and only 0 resist.'), V2.wl('Ground hits 3 of yours and only 1 resists.')]);
    ok(!/Ready for/.test(w[0]) && /no answer to Rillaboom/.test(w[0]) && /(Beats or handles only|Matchups 63%)/.test(w[0]), `wl: miss line in Matchups words ("${w[0]}")`);
    ok(w[1] === 'Ground hits 3 of yours and none resist.' && w[2] === 'Ground hits 3 of yours and only 1 resists.', `wl: "none resist" only for 0 ("${w[1]}" / "${w[2]}")`); }
  const x = await p.evaluate(() => { const ck = [...document.querySelectorAll('#tm-ck li, .sg2-ck li, ul.tm-ck li')]; return {n: ck.length, txt: ck.map(li => li.innerText).join('\n'),
    smalls: ck.flatMap(li => [...li.querySelectorAll('small')].map(s => s.innerText.trim())).filter(Boolean)}; });
  ok(x.n > 0, `${tag}: Team Checks rows found (${x.n})`);
  const hit = BAD.filter(r => r.test(x.txt)).map(String); ok(!hit.length, `${tag}: no retired or fallback wording in Team Checks (${hit.join(', ') || 'none'})`);
  ok(x.smalls.every(s => !/^most recent event winners$/i.test(s)), `${tag}: no lone fallback proof line (${x.smalls.length} small lines)`);
  ok(!errs.length, `${tag}: no page errors (${errs.length})`); await c.close(); };
for (const th of ['light', 'dark']) for (const W of [390, 1440]) for (const weak of [false, true]) await run(W, th, weak);
await b.close(); console.log(fails.length ? `v2-s1: ${fails.length} FAILED` : 'v2-s1: all passed'); process.exit(fails.length ? 1 : 0);

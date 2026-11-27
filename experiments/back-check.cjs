// Back button check (Nov 12, Sim's request): walks Home > Build > My Team > My Box > Meta > Battle > Home, scrolling on each, then presses
// the top bar's Back six times; each press must land on the previous page at the scroll it was left at; the button is hidden at the start.
// Usage: node experiments/back-check.cjs <built page, e.g. the Preview build foundation.html or app/dist/v2.html>
const pw = require('playwright'), F = process.argv[2];
(async () => { for (const eng of ['chromium', 'webkit']) for (const w of [390, 1440]) { const b = await pw[eng].launch(), p = await b.newPage({viewport: {width: w, height: 844}}); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + F + '#home'); await p.waitForTimeout(2500);
  const seq = [['nav', 'build'], ['nav', 'team'], ['box', 'box'], ['nav', 'meta'], ['nav', 'battle'], ['logo', 'home']], seen = [];
  const where = () => p.evaluate(() => ({h: location.hash, y: Math.round(scrollY)}));
  await p.evaluate(() => scrollTo(0, 500)); await p.waitForTimeout(350); seen.push(await where());
  for (const [how, k] of seq) {
    const sel = how === 'logo' ? '.np-head .logo' : how === 'box' ? '.np-boxlink' : (w < 700 ? `.np-bar a[href="#${k}"]` : `.np-nav a[href="#${k}"]`);
    await p.click(sel); await p.waitForTimeout(700); const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    await p.evaluate(y => scrollTo(0, y), Math.min(400, Math.max(0, H))); await p.waitForTimeout(350); seen.push(await where()); }
  const got = []; let bad = 0;
  for (let i = seen.length - 2; i >= 0; i--) { const vis = await p.evaluate(() => { const b = document.querySelector('.np-goback'); return b && !b.hidden; }); if (!vis) { got.push('BUTTON HIDDEN'); bad++; break; }
    await p.click('.np-goback'); await p.waitForTimeout(700); const r = await where(); const ok = r.h === seen[i].h && Math.abs(r.y - seen[i].y) <= 2; if (!ok) bad++; got.push(`${r.h} y${r.y}${ok ? '' : ` (want ${seen[i].h} y${seen[i].y})`}`); }
  const hiddenAtStart = await p.evaluate(() => { const b = document.querySelector('.np-goback'); return !b || b.hidden; });
  console.log(`${eng} ${w}: forward ${seen.map(s => s.h + ' y' + s.y).join(' > ')}\n   back ${got.join(' > ')}\n   ${bad ? bad + ' WRONG' : 'all right'}; button hidden at the start: ${hiddenAtStart}; page errors ${errs.length}${errs[0] ? ' ' + errs[0] : ''}`); await b.close(); } })();

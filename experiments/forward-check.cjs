// Forward button check (Nov 12, Sim asked): Back x3 then Forward x3 must return to the same pages and scroll; Forward hides at the end and after a new step; a sheet leftover step is skipped in the travel direction. Usage: node experiments/forward-check.cjs <built page>
const pw = require('playwright'), F = process.argv[2];
(async () => { for (const eng of ['chromium', 'webkit']) for (const w of [1440, 390]) { const b = await pw[eng].launch(), p = await b.newPage({viewport: {width: w, height: 844}}); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const st = () => p.evaluate(() => ({h: location.hash, y: Math.round(scrollY), back: !document.querySelector('.np-goback').hidden, fwd: !document.querySelector('.np-gofwd').hidden, fl: document.querySelector('.np-gofwd').getAttribute('aria-label')}));
  const nav = async k => { await p.click(w < 700 ? `.np-bar a[href="#${k}"]` : `.np-nav a[href="#${k}"]`); await p.waitForTimeout(700); const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight); await p.evaluate(y => scrollTo(0, y), Math.min(300, Math.max(0, H))); await p.waitForTimeout(350); };
  await p.goto('file://' + F + '#home'); await p.waitForTimeout(2500); const s0 = await st(); let bad = [];
  if (s0.fwd) bad.push('forward shown at start');
  await nav('build'); await nav('team'); await nav('meta'); const top = await st();
  const backs = []; for (let i = 0; i < 3; i++) { await p.click('.np-goback'); await p.waitForTimeout(700); backs.push(await st()); }
  if (!backs[2].fwd) bad.push('forward not shown after going back'); const lab = backs[2].fl;
  const fw = []; for (let i = 0; i < 3; i++) { await p.click('.np-gofwd'); await p.waitForTimeout(700); fw.push(await st()); }
  const end = fw[2]; if (end.h !== top.h || Math.abs(end.y - top.y) > 2) bad.push(`forward ended at ${end.h} y${end.y}, want ${top.h} y${top.y}`); if (end.fwd) bad.push('forward still shown at the end');
  if (fw[0].h !== '#build') bad.push('first forward went to ' + fw[0].h);
  await p.click('.np-goback'); await p.waitForTimeout(700); await nav('build'); const after = await st(); if (after.fwd) bad.push('forward still shown after a new step');
  // sheet case: open a sheet on Home, go to My Team from inside it, back twice, forward twice
  await nav('home'); await p.evaluate(() => V2.openMon('Kingambit')); await p.waitForTimeout(600);
  await p.evaluate(() => { V2.closeSheet(true); location.hash = '#team'; }); await p.waitForTimeout(800);
  await p.click('.np-goback'); await p.waitForTimeout(900); const sb = await st();
  await p.click('.np-gofwd').catch(() => {}); await p.waitForTimeout(900); const sf = await st();
  if (sb.h !== '#home') bad.push('sheet case: Back went to ' + sb.h); if (sf.h !== '#team') bad.push('sheet case: Forward went to ' + sf.h + ' (stuck?)');
  console.log(`${eng} ${w}: back ${backs.map(x => x.h + ' y' + x.y).join(' > ')} | forward label "${lab}" | forward ${fw.map(x => x.h + ' y' + x.y).join(' > ')} | sheet case back ${sb.h}, forward ${sf.h} | ${bad.length ? 'WRONG: ' + bad.join('; ') : 'all right'} | errors ${errs.length}`); await b.close(); } })();

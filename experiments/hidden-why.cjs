// Why does c13 call a control "hidden-focusable"? (Nov 12, for the PC's WebKit-only report on My Team: 7 at 320/390/820.)
// 1) For each control the page hides (closed fold, [hidden]/[inert], display none, visibility hidden, opacity 0), prints the
//    reason and whether a SCRIPT can focus it (that is what c13 tests).
// 2) Walks the page with real key presses (Alt+Tab in WebKit, Tab in Chromium) and counts how often focus lands on one.
// If (1) finds some and (2) finds none, the report comes from script focus only, not from anything a keyboard user meets.
// Usage: node experiments/hidden-why.cjs app/dist/v2.html [view=team] [width=390]
const pw = require('playwright'), path = require('path');
const f = path.resolve(process.argv[2] || 'app/dist/v2.html'), VIEW = process.argv[3] || 'team', W = +(process.argv[4] || 390);
const why = () => { const ctl = 'a[href],button,summary,input,select,textarea,[role=button],[tabindex]:not([tabindex="-1"])', out = [];
  const reason = e => { if (e.closest('[hidden],[inert]')) return 'inside [hidden]/[inert]'; const d = e.closest('details:not([open])');
    if (d && !(e.closest('summary') && e.closest('summary').parentElement === d)) return 'inside a closed fold';
    for (let a = e; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a);
      if (cs.display === 'none') return 'display:none on ' + a.tagName + '.' + a.className; if (cs.visibility === 'hidden') return 'visibility:hidden on ' + a.tagName + '.' + a.className;
      if (cs.contentVisibility === 'hidden') return 'content-visibility:hidden on ' + a.className; if (+cs.opacity === 0) return 'opacity 0 on ' + a.tagName + '.' + String(a.className).slice(0, 40); }
    return null; };
  for (const e of document.querySelectorAll(ctl)) { if (e.disabled || e.tabIndex < 0 || e.closest('.vh')) continue; const r = reason(e); if (!r) continue; e.setAttribute('data-hw', '1');
    const was = document.activeElement; let got = false; try { e.focus({preventScroll: true}); got = document.activeElement === e; } catch (x) {}
    if (got) out.push((e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 34) + ' <- ' + r); if (was && was.focus) was.focus(); }
  return out; };
(async () => { for (const eng of ['webkit', 'chromium']) { const b = await pw[eng].launch(); const p = await b.newPage({viewport: {width: W, height: 900}, hasTouch: W < 1100});
  await p.goto('file://' + f + '#' + VIEW); await p.waitForTimeout(3500);
  const r = await p.evaluate(why); console.log(eng + ': script focus reaches ' + r.length + ' hidden controls' + (r.length ? '\n  ' + r.join('\n  ') : ''));
  await p.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); scrollTo(0, 0); });
  const seen = new Set(); let hits = 0;
  for (let i = 0; i < 400; i++) { await p.keyboard.press(eng === 'webkit' ? 'Alt+Tab' : 'Tab');
    const k = await p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; if (!a.dataset.k) a.dataset.k = String(Math.random());
      return [a.dataset.k, a.hasAttribute('data-hw'), (a.innerText || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 30)]; });
    if (!k) continue; if (seen.has(k[0]) && seen.size > 5) break; seen.add(k[0]); if (k[1]) { hits++; console.log('  Tab landed on a hidden control: ' + k[2]); } }
  console.log(eng + ': real key walk ' + seen.size + ' stops, ' + hits + ' on hidden controls'); await b.close(); } })();

// Form errors reach the field (Sim's design review, Nov 19, #6 "Form errors easy to miss"; the non-visual part only).
// Import a Team (plain text), Edit Set (a stat point box at 99, and a total over the limit) and Send Feedback (empty): after the
// error the field in error has aria-invalid="true", its aria-describedby names text that explains the error, and keyboard focus
// is on that field (not left on the button). Fixing the value takes aria-invalid and the error link off again. The messages
// themselves are unchanged (same words, same place; Edit Set closed with a bad box still says so in its toast).
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-formerr.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch();
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
// the field's state: aria-invalid, the text its aria-describedby names, and whether it has the focus
const st = (p, sel) => p.evaluate(s => { const f = document.querySelector(s); if (!f) return null;
  const ids = (f.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  return {inv: f.getAttribute('aria-invalid'), desc: ids.map(i => (document.getElementById(i) || {}).textContent || '').join(' ').trim(), focus: document.activeElement === f}; }, sel);
// Sim's W3b A (Nov 19): what shows on screen: the field (or the slanted box around it) has a 2px edge in the error colour, the line that
// explains it is in the error colour, bold, with a '!' before it; fixed, both are back to normal
const look = (p, sel, noteSel) => p.evaluate(([sel, noteSel]) => { const f = document.querySelector(sel), n = document.querySelector(noteSel); if (!f || !n) return null;
  const box = f.closest('.np-field') || f, bs = getComputedStyle(box), ns = getComputedStyle(n), mark = getComputedStyle(n, '::before').content;
  const probe = document.createElement('i'); probe.style.color = 'var(--bad-text)'; document.body.append(probe); const bad = getComputedStyle(probe).color; probe.remove();
  return {edge: parseFloat(bs.borderTopWidth) >= 2 && bs.borderTopColor === bad, text: ns.color === bad && +ns.fontWeight >= 700, mark: mark === '"!"'}; }, [sel, noteSel]);
const lookOn = l => !!(l && l.edge && l.text && l.mark), lookOff = l => !!(l && !l.edge && !l.text && !l.mark);
const toast = p => p.evaluate(() => [...document.querySelectorAll('.np-toast')].map(t => t.textContent).join(' | '));
for (const W of [390, 1440]) {
  const p = await b.newPage({viewport: {width: W, height: 900}}); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(5000);

  // ---- Import a Team: plain text
  await p.evaluate(() => window.__ev('V2.openImport()')); await p.waitForTimeout(700);
  await p.fill('[data-impin]', 'hello there, this is not a team'); await p.click('[data-impgo]'); await p.waitForTimeout(400);
  let s = await st(p, '[data-impin]'), note = await p.evaluate(() => (document.querySelector('[data-impnote]') || {}).textContent || '');
  ok(/doesn't look like a team/.test(note), `${W} Import: the note under the box still explains it (${note.slice(0, 40)}...)`);
  ok(s && s.inv === 'true', `${W} Import: the box has aria-invalid="true" (${s && s.inv})`);
  ok(s && /doesn't look like a team/.test(s.desc), `${W} Import: aria-describedby names the explanation ("${s && s.desc.slice(0, 40)}")`);
  ok(s && s.focus, `${W} Import: the focus is on the box (${s && s.focus})`);
  { const l = await look(p, '[data-impin]', '[data-impnote]'); ok(lookOn(l), `${W} Import: a red edge on the box and the line in red with '!' (${JSON.stringify(l)})`); }
  await p.focus('[data-impin]'); await p.keyboard.type(' x'); await p.waitForTimeout(200); s = await st(p, '[data-impin]');
  ok(s && s.inv == null && !s.desc, `${W} Import: typing again clears aria-invalid and the error link (${s && s.inv}, "${s && s.desc}")`);
  { const l = await look(p, '[data-impin]', '[data-impnote]'); ok(lookOff(l), `${W} Import: typing again takes the red off (${JSON.stringify(l)})`); }
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);

  // ---- Edit Set: a box at 99, then a total over the limit
  await p.evaluate(() => window.__ev('V2.openEdit(0)')); await p.waitForTimeout(900);
  const box = j => `.ed2 [data-ed="pt"][data-j="${j}"]`, orig = await p.evaluate(() => [...document.querySelectorAll('.ed2 [data-ed="pt"]')].map(x => x.value));
  await p.fill(box(1), '99'); await p.click('.ed2 [data-ed="ptsave"]'); await p.waitForTimeout(400);
  s = await st(p, box(1)); const s0 = await st(p, box(0)), msg = await p.evaluate(() => (document.querySelector('[data-ed-msg]') || {}).textContent || '');
  ok(/whole number, 0-32/.test(msg), `${W} Edit Set: the line beside Save still explains it (${msg})`);
  ok(s && s.inv === 'true', `${W} Edit Set 99: that box has aria-invalid="true" (${s && s.inv})`);
  ok(s0 && s0.inv == null, `${W} Edit Set 99: a box that is fine is not marked (${s0 && s0.inv})`);
  ok(s && /whole number, 0-32/.test(s.desc), `${W} Edit Set 99: aria-describedby names the explanation ("${s && s.desc}")`);
  ok(s && s.focus, `${W} Edit Set 99: the focus is on that box (${s && s.focus})`);
  { const l = await look(p, box(1), '[data-ed-msg]'); ok(lookOn(l), `${W} Edit Set 99: a red edge on that box and the line in red with '!' (${JSON.stringify(l)})`); }
  await p.fill(box(1), orig[1]); await p.waitForTimeout(200); s = await st(p, box(1));
  ok(s && s.inv == null && !s.desc, `${W} Edit Set 99: putting a good number back clears it (${s && s.inv}, "${s && s.desc}")`);
  for (let j = 0; j < 6; j++) await p.fill(box(j), '32');
  await p.click('.ed2 [data-ed="ptsave"]'); await p.waitForTimeout(400);
  const all = await Promise.all([0, 1, 2, 3, 4, 5].map(j => st(p, box(j))));
  ok(all.every(x => x && x.inv === 'true'), `${W} Edit Set total: all six boxes have aria-invalid="true" (${all.map(x => x && x.inv).join(',')})`);
  ok(all[0] && /Champions allows/.test(all[0].desc), `${W} Edit Set total: aria-describedby names the explanation ("${all[0] && all[0].desc}")`);
  ok(all[0] && all[0].focus, `${W} Edit Set total: the focus is on the first box (${all[0] && all[0].focus})`);
  for (let j = 0; j < 6; j++) await p.fill(box(j), orig[j]);
  await p.waitForTimeout(200); const fixed = await Promise.all([0, 1, 2, 3, 4, 5].map(j => st(p, box(j))));
  ok(fixed.every(x => x && x.inv == null && !x.desc), `${W} Edit Set total: back under the limit clears all six (${fixed.map(x => x && x.inv).join(',')})`);
  await p.fill(box(1), '99'); await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  const tt = await toast(p);
  ok(/stat points weren't saved: Each box takes a whole number, 0-32/.test(tt), `${W} Edit Set closed with 99: the toast still says so (${tt.slice(0, 60)}...)`);

  // ---- Send Feedback: empty
  await p.goto('file://' + PAGE + '#feedback'); await p.waitForTimeout(2500);
  const has = await p.evaluate(() => !!document.getElementById('fbText2')); ok(has, `${W} Feedback: the page has its box (${has})`);
  if (has) { await p.click('[data-fbsend2]'); await p.waitForTimeout(400); s = await st(p, '#fbText2');
    const fm = await p.evaluate(() => (document.querySelector('[data-fbmsg2]') || {}).textContent || '');
    ok(/Write a few words first/.test(fm), `${W} Feedback: the line beside Send still explains it (${fm})`);
    ok(s && s.inv === 'true', `${W} Feedback: the box has aria-invalid="true" (${s && s.inv})`);
    ok(s && /Write a few words first/.test(s.desc), `${W} Feedback: aria-describedby names the explanation ("${s && s.desc}")`);
    ok(s && s.focus, `${W} Feedback: the focus is on the box (${s && s.focus})`);
    { const l = await look(p, '#fbText2', '[data-fbmsg2]'); ok(lookOn(l), `${W} Feedback: a red edge on the slanted box and the line in red with '!' (${JSON.stringify(l)})`); }
    await p.keyboard.type('ab'); await p.waitForTimeout(150); s = await st(p, '#fbText2');
    ok(s && s.inv === 'true', `${W} Feedback: still marked while under three letters (${s && s.inv})`);
    await p.keyboard.type('cd'); await p.waitForTimeout(150); s = await st(p, '#fbText2');
    ok(s && s.inv == null && !s.desc, `${W} Feedback: a few words clear it (${s && s.inv}, "${s && s.desc}")`);
    { const l = await look(p, '#fbText2', '[data-fbmsg2]'); ok(lookOff(l), `${W} Feedback: a few words take the red off (${JSON.stringify(l)})`); } }
  ok(errs.length === 0, `${W}: no page errors (${errs.join('; ').slice(0, 120)})`); await p.close(); }
await b.close();
console.log(`v2-formerr: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

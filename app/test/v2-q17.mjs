// My Team on phones: every "Mega" label reads clearly. Sim's Q17 A (Nov 19) fixed "Mega" written in blue straight over the sprite art
// (hard to read on orange Charizard) by putting it on the score plate's dark slanted plate. Nov 21: the My Team frame (Sim approved)
// replaced those Cards: in Your six "Mega" sits on its own small line above the name, beside the picture, not over it, and the plate
// is gone. The need stays the same, so this test now checks it on the frame (rewritten Nov 21; the old plate checks retired with the Cards).
// At 320, 360, 390 and 430 (the frame's phone row of six taps), light and dark, for the sample team and a team with two Megas: every
// visible "Mega" label in Your six and in the tapped Pokémon's bar
//   - reads at least 4.5:1 against the solid colour behind it (the first opaque background up its parents; a picture or gradient
//     behind it counts as a fail, since then the contrast can't be told),
//   - does not overlap the row's sprite picture (the Q17 problem),
//   - stays inside its row (or bar): the word itself, measured with a text range.
// Can fail: checked Nov 21 by breaking the page in the browser (the label moved onto the sprite; the label in a light grey): both fail.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q17.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const TEAMS = {sample: null, twoMegas: ['Charizard-Mega-Y', 'Whimsicott', 'Garchomp', 'Raichu-Mega-Y', 'Basculegion', 'Kingambit']};
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
let labels = 0, rowLabels = 0; const low = [], over = [], out = [], noFrame = [];
for (const th of ['light', 'dark']) for (const W of [320, 360, 390, 430]) for (const [tn, mons] of Object.entries(TEAMS)) {
  const p = await b.newPage({viewport: {width: W, height: 900}, colorScheme: th}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(2000);
  if (mons) { await p.evaluate(m => window.__ev(`S.slots = ${JSON.stringify(m)}.map(n => ({n, a: null, lock: false})); fixSlots(); V2.redraw()`), mons); await p.waitForTimeout(800); }
  if (process.env.Q17_BREAK) await p.addStyleTag({content: process.env.Q17_BREAK}); /* only to prove the test can fail */
  const r = await p.evaluate(() => {
    const rgb = s => (s.match(/[\d.]+/g) || []).map(Number), lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    /* the solid colour behind an element: the first parent (or itself) with an opaque background colour; a background picture or gradient
       on the way means the colour behind the text isn't one solid colour */
    const behind = e => { for (let x = e; x; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.backgroundImage && cs.backgroundImage !== 'none') return {img: x.className || x.tagName};
      const c = rgb(cs.backgroundColor); if (c.length === 3 || (c.length === 4 && c[3] === 1)) return {c: c.slice(0, 3)}; } return {c: [255, 255, 255]}; };
    const frame = !!document.querySelector('#main .mtf-rows');
    /* Nov 22: the war room (Sim approved Nov 21) draws each of the six as a kit card: "Mega" is its small form line (.k-form) above the name;
       the bar's name (h2) is visually hidden on phones (kept for screen readers), so a label that isn't drawn (1px clip) is not counted */
    const shown = x => { const q = x.getBoundingClientRect(); return x.getClientRects().length && q.width > 2 && q.height > 2 && !x.closest('[style*="clip"]') && getComputedStyle(x.closest('h2') || x).clipPath === 'none'; };
    const ls = [...document.querySelectorAll('#main .mtf-row .k-form, #main .mtf-row .nm .mg, #main .mtf-sum .mtf-nav h2 .mg')].filter(x => !x.classList.contains('none') && (!x.matches('.k-form') || x.textContent.trim() === 'Mega') && shown(x));
    return {frame, labels: ls.map(x => { const cs = getComputedStyle(x), box = x.closest('.mtf-row, .mtf-nav'), c = box.getBoundingClientRect(), L = (() => { const g = document.createRange(); g.selectNodeContents(x); return g.getBoundingClientRect(); })() /* the word itself (the label is a full-width block) */, bh = behind(x);
      const pic = x.closest('.mtf-row') ? x.closest('.mtf-row').querySelector('img') : null, P = pic && pic.getClientRects().length ? pic.getBoundingClientRect() : null;
      const ov = P ? Math.max(0, Math.min(L.right, P.right) - Math.max(L.left, P.left)) * Math.max(0, Math.min(L.bottom, P.bottom) - Math.max(L.top, P.top)) : 0;
      return {name: x.parentElement.textContent.trim(), row: !!x.closest('.mtf-row'), txt: x.textContent.trim(), ratio: bh.c ? ratio(rgb(cs.color), bh.c) : 0, img: bh.img || '', overlap: Math.round(ov),
        dbg: `${Math.round(L.left)}-${Math.round(L.right)} in ${Math.round(c.left)}-${Math.round(c.right)}`, inside: L.left >= c.left - 0.5 && L.right <= c.right + 0.5 && L.top >= c.top - 0.5 && L.bottom <= c.bottom + 0.5}; })}; });
  const tag = `${th} ${W} ${tn}`;
  if (!r.frame) noFrame.push(tag);
  for (const l of r.labels) { labels++; if (l.row) rowLabels++;
    if (l.txt !== 'Mega' || l.ratio < 4.5) low.push(`${tag} ${l.name}: ${l.img ? 'a picture or gradient behind it (' + l.img + ')' : l.ratio.toFixed(2) + ':1'}${l.txt !== 'Mega' ? ' text "' + l.txt + '"' : ''}`);
    if (l.overlap > 0) over.push(`${tag} ${l.name}: ${l.overlap} px² over the sprite`);
    if (!l.inside) out.push(`${tag} ${l.name}${l.row ? "" : " (bar)"} (word ${l.dbg})`); }
  await p.close(); }
/* each view has the sample team's 1 Mega (Mega Charizard Y) or the other team's 2 in Your six: 8 x 1 + 8 x 2 = 24 */
ok(!noFrame.length && rowLabels >= 24, `enough Mega labels to tell (${rowLabels} in Your six, ${labels} with the tapped Pokémon's bar, over 16 views; the frame drawn in every view${noFrame.length ? ', missing in ' + noFrame[0] : ''})`);
ok(!low.length, `every Mega label reads at least 4.5:1 on the solid colour behind it (${low.length} below${low.length ? ', e.g. ' + low[0] : ''})`);
ok(!over.length, `no Mega label sits over its sprite (${over.length} over${over.length ? ', e.g. ' + over[0] : ''})`);
ok(!out.length, `every Mega label stays inside its row or bar (${out.length} out${out.length ? ": " + out.join("; ") : ""})`);
await b.close(); console.log(`v2-q17: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

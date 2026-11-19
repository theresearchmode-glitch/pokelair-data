// Home copy (Sim's Q23 A, Nov 19: "keep every playful headline, add one plain line under the unclear ones"):
//   under "Call six out of the herd."  -> "Build your six, see its Strength Score, and plan each match."
//   under "Same herd. Twelve tools."   -> "Every tool uses the same N rated Pokémon: speed, types, damage, top teams and more.",
//                                         N being the Ratings plate's own count (today's lairRows), never typed
//   the post band's plain line shows on phones too (a short one there: "Gift codes and Pokémon Champions news."; hidden before)
// At 320, 390, 768, 1280 and 1920 wide, day and night: each line exists right under its heading, is visible, sits inside its band's
// content box (and above the plates it introduces), its text doesn't spill out of its own box, it's Instrument Sans 15 or 17px upright,
// readable on its band (contrast 4.5+), and the page doesn't scroll sideways. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-q23.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const SIX = 'Build your six, see its Strength Score, and plan each match.';
const POST_L = 'Gift codes before they run out, and the news from Pokémon Champions, carried in by one of the herd.', POST_S = 'Gift codes and Pokémon Champions news.';
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const miss = [], text = [], vis = [], box = [], style = [], low = [], side = []; let views = 0, count = null;
for (const night of [false, true]) for (const W of [320, 390, 768, 1280, 1920]) {
  const p = await b.newPage({viewport: {width: W, height: W < 700 ? 844 : 900}}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#home', {timeout: 90000}); await p.waitForTimeout(2500);
  if (night) { await p.evaluate(() => V2.setTheme('night')); await p.waitForTimeout(300); }
  const n = await p.evaluate(() => window.__ev('lairRows().length')); if (count == null) count = n;
  const TOOLS = `Every tool uses the same ${Number(n).toLocaleString('en-US')} rated Pokémon: speed, types, damage, top teams and more.`;
  const r = await p.evaluate(([SIX, TOOLS, POST]) => {
    const rgb = s => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number), lum = c => { const [R, G, B] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * R + .7152 * G + .0722 * B; };
    const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const one = (name, hSel, want, bandSel, bgOf, below) => { const h = document.querySelector(hSel), band = document.querySelector(bandSel);
      const el = [...(band ? band.querySelectorAll('p') : [])].find(e => e.getClientRects().length && e.innerText.trim() === want);
      if (!h || !el) return {name, missing: true, texts: band ? [...band.querySelectorAll('p')].filter(e => e.getClientRects().length).map(e => e.innerText.trim()).slice(0, 4) : []};
      const E = el.getBoundingClientRect(), H = h.getBoundingClientRect(), B = band.getBoundingClientRect(), cs = getComputedStyle(el), bs = getComputedStyle(band);
      const L = B.left + parseFloat(bs.paddingLeft), R = B.right - parseFloat(bs.paddingRight), o = {name};
      // right under its heading; from 1100 wide the post band's line stands beside its heading instead, as it always has (brief)
      o.under = (E.top >= H.bottom - 1 && E.top - H.bottom <= 48) || (name === 'post' && innerWidth >= 1100 && E.top < H.bottom && E.bottom > H.top);
      // the post line is tilted with its band from 1100 wide: its outer box grows a few pixels past its column (4px allowed)
      const tl = name === 'post' && innerWidth >= 1100 ? 4 : 0.5;
      o.inside = E.left >= L - tl && E.right <= R + tl && E.top >= B.top && E.bottom <= B.bottom;
      const rg = document.createRange(); rg.selectNodeContents(el); o.spill = [...rg.getClientRects()].some(x => x.width && (x.left < E.left - 0.5 || x.right > E.right + 0.5)) || el.scrollWidth > el.clientWidth + 1;
      if (below) { const g = band.querySelector(below); if (g && g.getClientRects().length) o.overlap = E.bottom > g.getBoundingClientRect().top + 0.5; }
      o.seen = E.width > 0 && E.height > 0 && cs.visibility === 'visible' && +cs.opacity > 0.5;
      o.font = cs.fontFamily; o.size = parseFloat(cs.fontSize); o.ital = cs.fontStyle; o.cr = Math.round(cr(rgb(cs.color), rgb(bgOf(band))) * 100) / 100; return o; };
    return {side: document.documentElement.scrollWidth > innerWidth, lines: [
      one('six', '#main #sds-h', SIX, '#main .sds-line', () => getComputedStyle(document.querySelector('#main .sd-six')).backgroundColor, null),
      one('tools', '#main #sdt-h', TOOLS, '#main .sdt', s => getComputedStyle(s).backgroundColor, '.sdt-grid'),
      one('post', '#main #sdpH', POST, '#main .sdp', s => getComputedStyle(s, '::before').backgroundColor, '.sdp-cols')]}; }, [SIX, TOOLS, W < 700 ? POST_S : POST_L]);
  views++; const tag = `${night ? 'night' : 'day'} ${W}`; if (r.side) side.push(tag);
  for (const o of r.lines) { const t = `${tag} ${o.name}`;
    if (o.missing) { miss.push(`${t} (shown: ${JSON.stringify(o.texts)})`); continue; }
    if (!o.under) text.push(`${t}: not right under its heading`); if (!o.seen) vis.push(t);
    if (!o.inside || o.spill || o.overlap) box.push(`${t}: inside ${o.inside}, spills ${o.spill}, over the plates ${!!o.overlap}`);
    if (!/Instrument Sans/.test(o.font) || ![15, 17].includes(o.size) || o.ital !== 'normal') style.push(`${t}: ${o.size}px ${o.ital} ${o.font}`);
    if (!(o.cr >= 4.5)) low.push(`${t}: ${o.cr}`); }
  await p.close(); }
ok(views === 10 && count > 0, `10 views checked (5 widths, day and night); the count comes from today's ratings (lairRows: ${count})`);
ok(!miss.length, `the three plain lines are there, with the approved words (and the live count) (${miss.length} missing${miss.length ? ', e.g. ' + miss[0] : ''})`);
ok(!text.length, `each line sits right under its heading (${text.length}${text.length ? ', e.g. ' + text[0] : ''})`);
ok(!vis.length, `each line is visible (${vis.length} hidden${vis.length ? ': ' + vis.join(', ') : ''})`);
ok(!box.length, `each line stays inside its band, above the plates, its words inside its own box (${box.length}${box.length ? ', e.g. ' + box[0] : ''})`);
ok(!style.length, `each line is body type: Instrument Sans, 15 or 17px, upright (${style.length} off${style.length ? ', e.g. ' + style[0] : ''})`);
ok(!low.length, `each line reads on its band: contrast 4.5 or more (${low.length} low${low.length ? ', e.g. ' + low[0] : ''})`);
ok(!side.length, `no sideways scroll (${side.length ? side.join(', ') : 'none'})`);
await b.close(); console.log(`v2-q23: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

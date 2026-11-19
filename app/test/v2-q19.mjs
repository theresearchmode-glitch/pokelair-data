// Q30 (Sim, Nov 19, 11:08 AM) replaced Q19's glow with the logo's sticker letters: each letter has a black outline, then a white sticker
// edge. What touches the letters is the outline, so the ring measured is 1-2px outside the glyphs (the outline), not 1-4px (that
// reached the white edge, 1.3:1, which is not what sits next to the letters). Below: the original Q19 description, ring changed to 1-2px.
// Home hero (Sim's Q19 A, Nov 19): line 2 of the headline ("your win rate.", #9BDCFF) must reach at least 3:1 (the rule for big text) against
// what is really behind it, crowd included, at 320-2560, light and dark. Read from pixels: one screenshot of the headline as shown, one with the
// headline's text made transparent (its band-blue glow stays, since it is part of what sits behind the words). Line 2's glyph pixels are the
// pixels that match its colour and change when the text is hidden. The background is the ring 1-4px outside the glyphs, read from the hidden shot.
// The top-rated front row stands IN FRONT of the words (by design), so its pixels are no background: a third shot with the front row hidden
// marks them, and they are left out. The headline is cut into 16 x 16px cells; in each cell holding at least 20 glyph pixels, the ring's mean luminance gives the cell's contrast.
// The worst cell must be 3:1 or more. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q19.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const lab = await b.newPage();
const measure = (a, h, f, w, ht, col, R, C) => lab.evaluate(async ([a, h, f, w, ht, col, R, C]) => {
  const px = async u => { const im = new Image(); im.src = u; await im.decode(); const c = new OffscreenCanvas(w, ht), x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, w, ht).data; };
  const A = await px('data:image/png;base64,' + a), B = await px('data:image/png;base64,' + h), F = await px('data:image/png;base64,' + f);
  const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }, Y = (r, g, bl) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(bl);
  const M = new Uint8Array(w * ht); let n = 0;
  for (let i = 0; i < w * ht; i++) { const k = i * 4, near = Math.abs(A[k] - col[0]) <= 8 && Math.abs(A[k + 1] - col[1]) <= 8 && Math.abs(A[k + 2] - col[2]) <= 8,
    moved = Math.abs(A[k] - B[k]) + Math.abs(A[k + 1] - B[k + 1]) + Math.abs(A[k + 2] - B[k + 2]) > 12; if (near && moved) { M[i] = 1; n++; } }
  const D = new Uint8Array(w * ht); // the ring: within R px of a glyph pixel, not a glyph pixel
  for (let y = 0; y < ht; y++) for (let x = 0; x < w; x++) if (M[y * w + x]) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const X = x + dx, Yy = y + dy; if (X >= 0 && Yy >= 0 && X < w && Yy < ht && !M[Yy * w + X]) D[Yy * w + X] = 1; }
  for (let i = 0; i < w * ht; i++) { const k = i * 4; if (Math.abs(B[k] - F[k]) + Math.abs(B[k + 1] - F[k + 1]) + Math.abs(B[k + 2] - F[k + 2]) > 12) D[i] = 0; } // a front-row pixel
  const Lt = Y(...col); let worst = 99, at = null, cells = 0;
  for (let cy = 0; cy < ht; cy += C) for (let cx = 0; cx < w; cx += C) { let g = 0, s = 0, m = 0;
    for (let y = cy; y < Math.min(ht, cy + C); y++) for (let x = cx; x < Math.min(w, cx + C); x++) { const i = y * w + x; if (M[i]) g++; if (D[i]) { const k = i * 4; s += Y(B[k], B[k + 1], B[k + 2]); m++; } }
    if (g < 20 || !m) continue; cells++; const cr = (Lt + .05) / (s / m + .05); if (cr < worst) { worst = cr; at = [cx, cy]; } }
  return {n, cells, worst, at}; }, [a, h, f, w, ht, col, R, C]);
const res = [];
for (const th of ['light', 'dark']) for (const W of [320, 390, 820, 1280, 1440, 1920, 2560]) {
  const p = await b.newPage({viewport: {width: W, height: W < 500 ? 844 : 900}, colorScheme: th}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#home', {timeout: 90000}); await p.waitForTimeout(2500);
  const info = await p.evaluate(() => { const h = document.querySelector('.sdh-h'), r = h.getBoundingClientRect(), c = getComputedStyle(h.querySelector('.l2')).color.match(/\d+/g).map(Number);
    return {x: 0, y: Math.max(0, Math.floor(r.top)), w: innerWidth, h: Math.min(innerHeight, Math.ceil(r.bottom)) - Math.max(0, Math.floor(r.top)), col: c.slice(0, 3)}; });
  const clip = {x: 0, y: info.y, width: info.w, height: info.h};
  const shown = (await p.screenshot({clip})).toString('base64');
  await p.addStyleTag({content: '.sdh-h,.sdh-h .l1,.sdh-h .l2{color:transparent!important}'}); await p.waitForTimeout(200);
  const hidden = (await p.screenshot({clip})).toString('base64');
  await p.addStyleTag({content: '.sdh-front{visibility:hidden!important}'}); await p.waitForTimeout(200);
  const front = (await p.screenshot({clip})).toString('base64');
  const m = await measure(shown, hidden, front, info.w, info.h, info.col, 2, 16); res.push({th, W, ...m});
  console.log(`  ${th} ${W}: line 2 ${info.col.join(',')}, ${m.n} glyph px, ${m.cells} cells, worst ${m.worst.toFixed(2)}:1 at ${m.at}`);
  await p.close(); }
const bad = res.filter(r => !(r.cells >= 10 && r.worst >= 3)), lo = res.reduce((a, r) => r.worst < a.worst ? r : a);
ok(!bad.length, `Home headline line 2 reaches 3:1 against what is behind it (crowd included), worst 16px cell, 320-2560, light and dark (Sim's Q19 A): lowest ${lo.worst.toFixed(2)}:1 (${lo.th} ${lo.W}), ${bad.length} of ${res.length} sizes below${bad.length ? ', e.g. ' + bad.map(r => `${r.th} ${r.W} ${r.worst.toFixed(2)}`).slice(0, 4).join('; ') : ''}`);
await b.close(); console.log(`v2-q19: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

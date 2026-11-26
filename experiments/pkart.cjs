// Look-only: for each Pokémon and width, where the hero art's box and its drawn (non-transparent) pixels sit against the window,
// and whether the page scrolls sideways. Uses a canvas to find the real opaque pixels (file access allowed for the canvas read).
const {chromium} = require('/home/user/pokelair-data/node_modules/playwright');
const PF = process.env.PF, MONS = (process.env.MONS || 'garchomp').split(','), W = process.env.WIDTHS.split(',').map(Number), TH = (process.env.THEMES || 'day').split(',');
(async () => { const b = await chromium.launch({args: ['--allow-file-access-from-files']});
  for (const th of TH) for (const m of MONS) for (const w of W) {
    const ctx = await b.newContext({viewport: {width: w, height: 900}, hasTouch: w < 1100}); const p = await ctx.newPage();
    await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th);
    await p.goto('file://' + PF + '#pokemon=' + m); await p.waitForTimeout(2200);
    const r = await p.evaluate(async () => { const i = document.querySelector('#main .pk-card .k-art'); if (!i) return {err: 'no art'}; await i.decode().catch(() => {});
      const q = i.getBoundingClientRect(), vw = document.documentElement.clientWidth, nw = i.naturalWidth, nh = i.naturalHeight;
      const s = Math.min(q.width / nw, q.height / nh), dw = nw * s, dh = nh * s, dx = q.left + (q.width - dw) / 2, dy = q.top + (q.height - dh);
      let ox0 = 0, ox1 = nw - 1, alpha = 'n/a'; try { const c = document.createElement('canvas'); c.width = nw; c.height = nh; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, nw, nh).data;
        let a = nw, z = -1; for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) if (d[(y * nw + x) * 4 + 3] > 8) { if (x < a) a = x; if (x > z) z = x; } ox0 = a; ox1 = z; alpha = 'ok'; } catch (e) { alpha = 'tainted'; }
      const pl = dx + ox0 * s, pr = dx + (ox1 + 1) * s, card = i.closest('.k-card').getBoundingClientRect();
      return {vw, box: [Math.round(q.left), Math.round(q.right)], drawn: [Math.round(dx), Math.round(dx + dw)], pixels: [Math.round(pl), Math.round(pr)], card: [Math.round(card.left), Math.round(card.right)], alpha,
        cut: Math.max(0, Math.round(-pl)) + Math.max(0, Math.round(pr - vw)), sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth, ovx: getComputedStyle(document.body).overflowX + '/' + getComputedStyle(document.documentElement).overflowX}; });
    console.log(`${th} ${m} ${w}: ${JSON.stringify(r)}`); await ctx.close(); }
  await b.close(); })();

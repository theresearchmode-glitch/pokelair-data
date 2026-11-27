// Permanent regression test for the Claude artifact host wrapper bug (Nov 27, Job M8).
// The Claude host wraps index.html in an unlayered <style> block (docs/maggi/files/host-wrapper-head.html on alt/maggi-jobs).
// Because NastyPlot's CSS lives in @layer, unlayered host styles win unless app/build.mjs emits its unlayered revert-layer block.
// Compares unwrapped vs host-wrapped dist/v2.html at 390x844 and 1440x900, light and dark:
//   - computed body background-color, color, font-family, font-size
//   - computed :root color-scheme, padding-top, padding-bottom
//   - full-page screenshot byte-for-byte PNG match (same Chromium renderer, reducedMotion: 'reduce')
// Before each shot every image is made eager, loaded and decoded, fonts ready, two frames painted (Job NN: async-decoded sprites
// below the fold under a drop-shadow differed by timing when art was present; 3 of 10 runs failed before, 0 of 10 after).
// Fails on any difference.
// Usage: node experiments/host-wrapper-test.mjs  (or PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs)
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.resolve(ROOT, process.env.PAGE || 'app/dist/v2.html');

// Exact host wrapper head from docs/maggi/files/host-wrapper-head.html (alt/maggi-jobs).
const HOST_HEAD = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>';

if (!process.env.PAGE || !fs.existsSync(PAGE)) {
  const b = spawnSync(process.execPath, [path.join(ROOT, 'app/build.mjs'), '--v2', '--preview-data'], {cwd: ROOT, encoding: 'utf8'});
  if (b.status !== 0) { console.error('host-wrapper-test: build failed:\n' + (b.stderr || b.stdout)); process.exit(1); }
}

const WRAPPED = path.join(path.dirname(PAGE), 'v2-host-wrapped.html');
fs.writeFileSync(WRAPPED, HOST_HEAD + fs.readFileSync(PAGE, 'utf8') + '</body></html>', 'utf8');

let fails = 0, passes = 0;
const ok = (cond, msg) => { console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); cond ? passes++ : fails++; };

const CASES = [
  {w: 390, h: 844, theme: 'day', scheme: 'light'},
  {w: 390, h: 844, theme: 'night', scheme: 'dark'},
  {w: 1440, h: 900, theme: 'day', scheme: 'light'},
  {w: 1440, h: 900, theme: 'night', scheme: 'dark'},
];

const readStyles = () => {
  const bs = getComputedStyle(document.body);
  const rs = getComputedStyle(document.documentElement);
  return {
    bodyBg: bs.backgroundColor,
    bodyColor: bs.color,
    bodyFont: bs.fontFamily,
    bodySize: bs.fontSize,
    rootScheme: rs.colorScheme,
    rootPadTop: rs.paddingTop,
    rootPadBot: rs.paddingBottom,
  };
};

const b = await chromium.launch();
try {
  const capture = async (file, {w, h, theme, scheme}) => {
    const ctx = await b.newContext({
      viewport: {width: w, height: h},
      isMobile: w < 700,
      hasTouch: w < 700,
      colorScheme: scheme,
      reducedMotion: 'reduce',
    });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await p.addInitScript(th => {
      try {
        localStorage.setItem('np2.theme', th);
        localStorage.setItem('cc2.theme', JSON.stringify(th === 'night' ? 'dark' : 'light'));
      } catch (e) {}
    }, theme);
    await p.goto('file://' + file + '#home', {timeout: 60000});
    await p.waitForTimeout(2500);
    await p.evaluate(() => document.fonts && document.fonts.ready);
    await p.waitForTimeout(300);
    // Settle every image before the shot (Job NN, Nov 27): Home's sprites are loading="lazy" decoding="async", and a full-page
    // screenshot grows the viewport to the whole page, so below-the-fold sprites started loading DURING the capture and were
    // drawn (or not) by timing, which made the two shots differ by a sprite's pixels. Both shots get the same treatment:
    // every lazy image is made eager, then we wait until every image is complete and decoded (repeating while the set changes),
    // fonts are ready, and two frames have painted.
    const settle = await p.evaluate(async () => {
      const frame = () => new Promise(r => requestAnimationFrame(() => r()));
      let rounds = 0, last = '';
      for (; rounds < 20; rounds++) {
        const imgs = [...document.images];
        imgs.forEach(i => { if (i.loading === 'lazy') i.loading = 'eager'; });
        await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.addEventListener('load', r, {once: true}); i.addEventListener('error', r, {once: true}); })));
        await Promise.all(imgs.map(i => i.naturalWidth ? i.decode().catch(() => {}) : null));
        if (document.fonts) await document.fonts.ready;
        await frame(); await frame();
        const now = [...document.images].map(i => (i.currentSrc || i.src) + (i.complete ? '' : '?')).join('|');
        if (now === last && [...document.images].every(i => i.complete)) break;
        last = now;
      }
      return {rounds, imgs: document.images.length, incomplete: [...document.images].filter(i => !i.complete).length};
    });
    if (settle.incomplete) errs.push(`images never settled: ${settle.incomplete}/${settle.imgs} incomplete after ${settle.rounds} rounds`);
    const styles = await p.evaluate(readStyles);
    const png = await p.screenshot({fullPage: true, animations: 'disabled'});
    await ctx.close();
    return {styles, png, errs};
  };

  const diffPngs = async (pngA, pngB) => {
    const p = await b.newPage();
    try {
      return await p.evaluate(async ([a64, b64]) => {
        const loadImg = s => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + s; });
        const [ia, ib] = await Promise.all([loadImg(a64), loadImg(b64)]);
        if (ia.width !== ib.width || ia.height !== ib.height) return {sizeDiff: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`, diffPx: -1, totalPx: ia.width * ia.height};
        const W = ia.width, H = ia.height;
        const get = img => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, W, H).data; };
        const da = get(ia), db = get(ib);
        let diffPx = 0, maxDelta = 0, first = null;
        for (let i = 0; i < da.length; i += 4) {
          const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]), Math.abs(da[i + 3] - db[i + 3]));
          if (d > 0) {
            diffPx++;
            if (d > maxDelta) maxDelta = d;
            if (!first) { const px = i / 4; first = {x: px % W, y: Math.floor(px / W), a: [da[i], da[i + 1], da[i + 2]], b: [db[i], db[i + 1], db[i + 2]]}; }
          }
        }
        return {w: W, h: H, diffPx, totalPx: W * H, pct: +(100 * diffPx / (W * H)).toFixed(4), maxDelta, first};
      }, [pngA.toString('base64'), pngB.toString('base64')]);
    } finally { await p.close(); }
  };

  for (const c of CASES) {
    const label = `${c.w}x${c.h} ${c.scheme}`;
    const u = await capture(PAGE, c);
    const w = await capture(WRAPPED, c);
    const styleDiffs = [];
    for (const k of Object.keys(u.styles)) {
      if (u.styles[k] !== w.styles[k]) styleDiffs.push(`${k}: unwrapped=${JSON.stringify(u.styles[k])} vs wrapped=${JSON.stringify(w.styles[k])}`);
    }
    ok(!u.errs.length && !w.errs.length && !styleDiffs.length,
      `${label} styles match (${styleDiffs.length ? styleDiffs.join('; ') : `bodyBg=${w.styles.bodyBg}, rootScheme=${w.styles.rootScheme}`}${u.errs.length || w.errs.length ? '; errs=' + [...u.errs, ...w.errs].join('|') : ''})`);
    const sameBytes = Buffer.compare(u.png, w.png) === 0;
    const px = sameBytes ? {diffPx: 0, pct: 0, maxDelta: 0} : await diffPngs(u.png, w.png);
    ok(px.diffPx === 0,
      `${label} full-page screenshot pixel-identical (${px.diffPx === 0 ? `${u.png.length} B, 0 differing pixels` : `${px.sizeDiff || `${px.diffPx}/${px.totalPx} px (${px.pct}%), maxDelta=${px.maxDelta}, first=${JSON.stringify(px.first)}`}`})`);
  }
} finally {
  await b.close();
  fs.rmSync(WRAPPED, {force: true});
}

console.log(fails ? `host-wrapper-test: ${fails} FAILED (${passes} passed)` : `host-wrapper-test: ALL ${passes} PASSED`);
process.exit(fails ? 1 : 0);

// Permanent regression test for the Claude artifact host wrapper bug (Nov 27, Jobs M8, M9, M10).
// The Claude host wraps index.html in an unlayered <style> block (docs/maggi/files/host-wrapper-head.html on alt/maggi-jobs).
// Because NastyPlot's CSS lives in @layer, unlayered host styles win unless app/build.mjs emits its unlayered revert-layer block.
// Compares unwrapped vs host-wrapped dist/v2.html:
//   - computed body background-color, color, font-family, font-size
//   - computed :root color-scheme, padding-top, padding-bottom
//   - full-page screenshot pixel diff via in-browser <canvas> (0 differing pixels required)
// Usage:
//   node experiments/host-wrapper-test.mjs                         (Chromium: 390x844 & 1440x900, light & dark, #home)
//   PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs   (CI mode, uses existing build)
//   BROWSER=webkit PAGE=app/dist/v2.html node experiments/host-wrapper-test.mjs
//     (WebKit: core 5 pages on iPhone 15, iPhone SE, iPad Pro 11 + extra 7 pages on iPhone 15 & iPad Pro 11, light & dark)
//   Optional filters: SET=core|extra|all, DEVICES=..., ROUTES=...
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium, webkit, devices} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.resolve(ROOT, process.env.PAGE || 'app/dist/v2.html');
const BROWSER = (process.env.BROWSER || 'chromium').toLowerCase();
const SET = (process.env.SET || 'all').toLowerCase();
const ENGINE = BROWSER === 'webkit' ? webkit : chromium;

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

// Full saved 6-Pokémon team for #team and Spicy picks (matches cc2.state shape in app/test/v2-saved.mjs).
const SAVED_SLOTS = [
  {n: 'Incineroar', a: 'Intimidate', lock: false},
  {n: 'Rotom-Wash', a: null, lock: true},
  {n: 'Garchomp', a: 'Rough Skin', lock: false, mv: {doubles: ['Earthquake', 'Dragon Claw', 'Protect', 'Rock Slide']}, it: {doubles: 'Sitrus Berry'}, sp: {doubles: {nat: 'Jolly', v: [2, 32, 0, 0, 0, 32]}}},
  {n: 'Ninetales-Alola', a: null, lock: false},
  {n: 'Kingambit', a: null, lock: false},
  {n: 'Basculegion-F', a: null, lock: false},
];
const SAVED_STATE = JSON.stringify({
  slots: SAVED_SLOTS,
  box: ['Incineroar', 'Rotom-Wash', 'Garchomp', 'Ninetales-Alola', 'Kingambit', 'Basculegion-F', 'Whimsicott', 'Farigiraf'],
  teams: [{id: 'tSaved1', name: 'Rain Check', slots: SAVED_SLOTS, format: 'doubles', saved: 1762790000000}],
  loadedId: 'tSaved1',
  format: 'doubles', maxMega: 2, megaGoal: 1, megaV: 1, boxV: 2,
  leads: ['Incineroar', 'Garchomp'],
});

const VIEW_DEFS = {
  '#home': {hash: '#home', label: '#home'},
  '#team': {hash: '#team', label: '#team'},
  '#meta': {hash: '#meta', label: '#meta'},
  '#pokemon=Garchomp': {hash: '#pokemon=Garchomp', label: '#pokemon=Garchomp'},
  '#battle': {hash: '#battle', label: '#battle'},
  '#build': {hash: '#build', label: '#build'},
  '#box': {hash: '#box', label: '#box'},
  '#track': {hash: '#track', label: '#track'},
  'search': {hash: '#home', label: 'Search open', after: async p => {
    await p.evaluate(() => { if (window.V2 && V2.openSearch) V2.openSearch(); });
    await p.waitForTimeout(400);
  }},
  'spicy': {hash: '#team', label: '#team (Spicy picks on)', spicy: true, after: async p => {
    await p.waitForFunction(() => window.V2 && V2.spicy && V2.spicy.key === V2.spKey(), null, {timeout: 20000}).catch(() => {});
    await p.waitForTimeout(400);
  }},
  '#method': {hash: '#method', label: '#method'},
  '#about': {hash: '#about', label: '#about'},
};

const CORE_ROUTES = ['#home', '#team', '#meta', '#pokemon=Garchomp', '#battle'];
const EXTRA_ROUTES = ['#build', '#box', '#track', 'search', 'spicy', '#method', '#about'];

const devEntry = name => {
  const dev = devices[name];
  if (!dev) throw new Error(`Unknown Playwright device: ${name}`);
  return {label: `${name} (${dev.viewport.width}x${dev.viewport.height})`, ctxOpts: {...dev}};
};

const THEMES = [
  {theme: 'day', scheme: 'light'},
  {theme: 'night', scheme: 'dark'},
];

// Build the list of {vp, th, view} jobs to run.
const JOBS = [];
if (BROWSER !== 'webkit') {
  const vps = [
    {label: '390x844', ctxOpts: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}},
    {label: '1440x900', ctxOpts: {viewport: {width: 1440, height: 900}, isMobile: false, hasTouch: false}},
  ];
  const rs = process.env.ROUTES ? process.env.ROUTES.split(',').map(s => s.trim()).filter(Boolean) : ['#home'];
  for (const vp of vps) for (const th of THEMES) for (const r of rs) JOBS.push({vp, th, view: VIEW_DEFS[r] || {hash: r, label: r}});
} else if (process.env.ROUTES || process.env.DEVICES) {
  const vps = (process.env.DEVICES ? process.env.DEVICES.split(',').map(s => s.trim()).filter(Boolean) : ['iPhone 15', 'iPad Pro 11']).map(devEntry);
  const rs = (process.env.ROUTES ? process.env.ROUTES.split(',').map(s => s.trim()).filter(Boolean) : EXTRA_ROUTES);
  for (const vp of vps) for (const th of THEMES) for (const r of rs) JOBS.push({vp, th, view: VIEW_DEFS[r] || {hash: r, label: r}});
} else {
  if (SET === 'core' || SET === 'all') {
    for (const vp of ['iPhone 15', 'iPhone SE', 'iPad Pro 11'].map(devEntry))
      for (const th of THEMES) for (const r of CORE_ROUTES) JOBS.push({vp, th, view: VIEW_DEFS[r]});
  }
  if (SET === 'extra' || SET === 'all') {
    for (const vp of ['iPhone 15', 'iPad Pro 11'].map(devEntry))
      for (const th of THEMES) for (const r of EXTRA_ROUTES) JOBS.push({vp, th, view: VIEW_DEFS[r]});
  }
}

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

const b = await ENGINE.launch();
try {
  const capture = async (file, ctxOpts, {theme, scheme}, view) => {
    const ctx = await b.newContext({
      ...ctxOpts,
      colorScheme: scheme,
      reducedMotion: 'reduce',
    });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await p.addInitScript(([th, st, sp]) => {
      try {
        localStorage.setItem('np2.theme', th);
        localStorage.setItem('cc2.theme', JSON.stringify(th === 'night' ? 'dark' : 'light'));
        localStorage.setItem('cc2.welcomed', '"1"');
        localStorage.setItem('cc2.state', st);
        if (sp) localStorage.setItem('np2.spicy', '1');
        else localStorage.removeItem('np2.spicy');
      } catch (e) {}
    }, [theme, SAVED_STATE, !!view.spicy]);
    await p.goto('file://' + file + view.hash, {timeout: 60000});
    await p.waitForTimeout(2500);
    if (view.after) await view.after(p);
    await p.evaluate(() => document.fonts && document.fonts.ready);
    await p.waitForTimeout(300);
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

  if (BROWSER === 'webkit' && JOBS.length) {
    const j0 = JOBS[0];
    const a1 = await capture(PAGE, j0.vp.ctxOpts, j0.th, j0.view);
    const a2 = await capture(PAGE, j0.vp.ctxOpts, j0.th, j0.view);
    const base = Buffer.compare(a1.png, a2.png) === 0 ? {diffPx: 0, pct: 0, maxDelta: 0} : await diffPngs(a1.png, a2.png);
    console.log(`  INFO  webkit same-file baseline (${j0.vp.label} ${j0.th.scheme} ${j0.view.label}): ${base.diffPx} differing pixels (maxDelta=${base.maxDelta})`);
  }

  for (const {vp, th, view} of JOBS) {
    const label = `${BROWSER} ${vp.label} ${th.scheme} ${view.label}`;
    const u = await capture(PAGE, vp.ctxOpts, th, view);
    const w = await capture(WRAPPED, vp.ctxOpts, th, view);
    const styleDiffs = [];
    for (const k of Object.keys(u.styles)) {
      if (u.styles[k] !== w.styles[k]) styleDiffs.push(`${k}: unwrapped=${JSON.stringify(u.styles[k])} vs wrapped=${JSON.stringify(w.styles[k])}`);
    }
    ok(!u.errs.length && !w.errs.length && !styleDiffs.length,
      `${label} styles match (${styleDiffs.length ? styleDiffs.join('; ') : `bodyBg=${w.styles.bodyBg}, rootScheme=${w.styles.rootScheme}`}${u.errs.length || w.errs.length ? '; errs=' + [...u.errs, ...w.errs].join('|') : ''})`);
    const sameBytes = Buffer.compare(u.png, w.png) === 0;
    const px = sameBytes ? {diffPx: 0, pct: 0, maxDelta: 0} : await diffPngs(u.png, w.png);
    ok(px.diffPx === 0,
      `${label} screenshot pixel-identical (${px.diffPx === 0 ? `${u.png.length} B, 0 differing pixels` : `${px.sizeDiff || `${px.diffPx}/${px.totalPx} px (${px.pct}%), maxDelta=${px.maxDelta}, first=${JSON.stringify(px.first)}`}`})`);
  }
} finally {
  await b.close();
  fs.rmSync(WRAPPED, {force: true});
}

console.log(fails ? `host-wrapper-test (${BROWSER}): ${fails} FAILED (${passes} passed)` : `host-wrapper-test (${BROWSER}): ALL ${passes} PASSED`);
process.exit(fails ? 1 : 0);

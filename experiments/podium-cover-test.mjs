// Checks whether any Home tools-rack sprite in .sdt-ra .sdt-pod or .sdt-bt .sdt-vs
// is covered along its top edge by another element (e.g. the Damage Calculator tile .sdt-dc above it).
// Usage:
//   node experiments/podium-cover-test.mjs
//   PAGE=app/dist/v2.html BROWSERS=webkit,chromium node experiments/podium-cover-test.mjs
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium, webkit, devices} from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.resolve(ROOT, process.env.PAGE || 'app/dist/v2.html');

// Exact host wrapper head from docs/maggi/files/host-wrapper-head.html (alt/maggi-jobs).
const HOST_HEAD = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>';

if (!process.env.PAGE || !fs.existsSync(PAGE)) {
  const b = spawnSync(process.execPath, [path.join(ROOT, 'app/build.mjs'), '--v2', '--preview-data'], {cwd: ROOT, encoding: 'utf8'});
  if (b.status !== 0) { console.error('podium-cover-test: build failed:\n' + (b.stderr || b.stdout)); process.exit(1); }
}
for (const dir of ['art', 'art-s']) {
  const dst = path.join(path.dirname(PAGE), dir);
  const src = path.join(ROOT, 'app/src/v2', dir);
  if (!fs.existsSync(dst) && fs.existsSync(src)) {
    try { fs.symlinkSync(src, dst); } catch (e) {}
  }
}

const WRAPPED = path.join(path.dirname(PAGE), 'v2-podium-wrapped.html');
fs.writeFileSync(WRAPPED, HOST_HEAD + fs.readFileSync(PAGE, 'utf8') + '</body></html>', 'utf8');

const BROWSER_LIST = (process.env.BROWSERS || 'webkit,chromium').split(',').map(s => s.trim()).filter(Boolean);
const WRAP_MODES = process.env.WRAPPED === '0' ? ['unwrapped'] : process.env.WRAPPED === '1' ? ['wrapped'] : ['unwrapped', 'wrapped'];
const THEMES = [
  {theme: 'day', scheme: 'light'},
  {theme: 'night', scheme: 'dark'},
];

const WEBKIT_CASES = [
  {name: 'iPhone 15', opts: {...devices['iPhone 15']}},
  {name: 'iPhone SE', opts: {...devices['iPhone SE']}},
  {name: 'iPad Pro 11 portrait', opts: {...devices['iPad Pro 11']}},
  {name: 'iPad Pro 11 landscape', opts: {...devices['iPad Pro 11 landscape']}},
];

const CHROMIUM_CASES = [
  {name: '390x844', opts: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}},
  {name: '430x932', opts: {viewport: {width: 430, height: 932}, isMobile: true, hasTouch: true}},
  {name: '700x900', opts: {viewport: {width: 700, height: 900}}},
  {name: '1100x900', opts: {viewport: {width: 1100, height: 900}}},
  {name: '1440x900', opts: {viewport: {width: 1440, height: 900}}},
];

const inspectSprites = () => {
  const describeEl = el => {
    if (!el) return 'null';
    const tag = el.tagName.toLowerCase();
    const id = el.id ? '#' + el.id : '';
    const cls = typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/).join('.')
      : '';
    const card = el.closest && el.closest('.sdt-p');
    const cardCls = card ? ' [in .' + [...card.classList].filter(c => c.startsWith('sdt-')).join('.') + ']' : '';
    return tag + id + cls + cardCls;
  };

  const results = [];
  const imgs = [...document.querySelectorAll('.sdt-ra .sdt-pod img, .sdt-bt .sdt-vs img')];
  for (let idx = 0; idx < imgs.length; idx++) {
    const img = imgs[idx];
    const mon = img.closest('.np-mon');
    const card = img.closest('.sdt-p');
    if (!card) continue;
    // Scroll the card to the middle of the viewport so fixed header/footer bars don't interfere.
    const cr0 = card.getBoundingClientRect();
    window.scrollBy(0, cr0.top - Math.max(180, Math.floor(window.innerHeight * 0.35)));
    const r = img.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    const cardLabel = card.classList.contains('sdt-ra') ? 'Ratings(.sdt-ra)' : 'Battle(.sdt-bt)';
    const alt = img.getAttribute('alt') || img.getAttribute('src') || ('img#' + idx);
    const box = {
      left: +r.left.toFixed(1),
      top: +r.top.toFixed(1),
      right: +r.right.toFixed(1),
      bottom: +r.bottom.toFixed(1),
      width: +r.width.toFixed(1),
      height: +r.height.toFixed(1),
    };

    // Sample points along the top edge (top + 1px, top + 3px, top + 6px) across the sprite width.
    const yOffsets = [1, 3, 6].filter(dy => dy < r.height);
    const steps = 9;
    let overlapCount = 0;
    let outsideOverlapCount = 0;
    const covered = [];

    for (const dy of yOffsets) {
      const y = r.top + dy;
      if (y < 0 || y >= window.innerHeight) continue;
      for (let s = 1; s < steps; s++) {
        const x = r.left + (r.width * s) / steps;
        if (x < 0 || x >= window.innerWidth) continue;
        const stack = document.elementsFromPoint(x, y);
        // Any element in the stack outside this sprite's .np-mon (and outside html/body/main/section/grid)
        const others = stack.filter(el => el !== img && (!mon || !mon.contains(el)) && el.closest && el.closest('.sdt-p'));
        const outsideCard = stack.filter(el => {
          const c = el.closest && el.closest('.sdt-p');
          return c && c !== card;
        });
        if (others.length > 0) overlapCount++;
        if (outsideCard.length > 0) outsideOverlapCount++;
        if (others.length > 0) {
          const top = document.elementFromPoint(x, y);
          const isSelf = top === img || (mon && mon.contains(top));
          if (!isSelf) {
            // Check if covered by a sibling sprite in the same stage vs another tile/element
            const topCard = top && top.closest && top.closest('.sdt-p');
            const sameStageOtherMon = !!(topCard === card && top && top.closest && top.closest('.np-mon') && top.closest('.np-mon') !== mon);
            covered.push({
              x: +x.toFixed(1),
              y: +y.toFixed(1),
              dy,
              top: describeEl(top),
              outsideCard: topCard !== card,
              sameStageOtherMon,
              stack: stack.slice(0, 5).map(describeEl),
            });
          }
        }
      }
    }

    // Fail if covered by anything other than a sibling sprite inside the same stage (or report all covers).
    const externalCovers = covered.filter(c => !c.sameStageOtherMon);
    results.push({
      card: cardLabel,
      sprite: alt,
      box,
      overlapCount,
      outsideOverlapCount,
      externalCovers,
      siblingCovers: covered.filter(c => c.sameStageOtherMon).length,
    });
  }
  return results;
};

let passes = 0, fails = 0;
const failDetails = [];

for (const browserName of BROWSER_LIST) {
  const launcher = browserName === 'webkit' ? webkit : chromium;
  const deviceList = browserName === 'webkit' ? WEBKIT_CASES : CHROMIUM_CASES;
  const b = await launcher.launch({headless: true});
  try {
    for (const dev of deviceList) {
      for (const th of THEMES) {
        for (const wrapMode of WRAP_MODES) {
          const file = wrapMode === 'wrapped' ? WRAPPED : PAGE;
          const label = `${browserName} | ${dev.name} | ${th.scheme} | ${wrapMode}`;
          const ctx = await b.newContext({
            ...dev.opts,
            colorScheme: th.scheme,
            reducedMotion: 'reduce',
          });
          const p = await ctx.newPage();
          const errs = [];
          p.on('pageerror', e => errs.push(String(e)));
          await p.addInitScript(t => {
            try {
              localStorage.setItem('np2.theme', t);
              localStorage.setItem('cc2.theme', JSON.stringify(t === 'night' ? 'dark' : 'light'));
            } catch (e) {}
          }, th.theme);
          await p.goto('file://' + file + '#home', {timeout: 60000});
          await p.waitForTimeout(2000);
          await p.evaluate(() => document.fonts && document.fonts.ready);
          await p.waitForTimeout(200);
          const sprites = await p.evaluate(inspectSprites);
          await ctx.close();

          const bad = sprites.filter(s => s.externalCovers.length > 0);
          const overlaps = sprites.reduce((a, s) => a + (s.outsideOverlapCount > 0 ? 1 : 0), 0);
          const ok = errs.length === 0 && sprites.length > 0 && bad.length === 0;
          if (ok) {
            passes++;
            console.log(`  PASS  ${label} (${sprites.length} sprites, ${overlaps} overlap another tile, 0 covered)`);
          } else {
            fails++;
            console.log(`  FAIL  ${label} (${sprites.length} sprites, ${bad.length} covered${errs.length ? ', errs=' + errs.join('|') : ''})`);
            for (const s of bad) {
              const first = s.externalCovers[0];
              const line = `        sprite=${s.card} "${s.sprite}" box=${JSON.stringify(s.box)} covered at (${first.x},${first.y}, dy=${first.dy}) by ${first.top} (${s.externalCovers.length} pts)`;
              console.log(line);
              failDetails.push(`${label} -> ${line.trim()}`);
            }
          }
        }
      }
    }
  } finally {
    await b.close();
  }
}

try { fs.unlinkSync(WRAPPED); } catch (e) {}
console.log(`\npodium-cover-test: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);

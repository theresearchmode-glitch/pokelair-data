// Sheet jitter on phones (Sim, Nov 12, iPhone: an info sheet "flashes rapidly" after scrolling up and down). Fakes iOS's
// visualViewport while the app's bars shrink/grow (no keyboard) and while a keyboard is open, and reads --kb, which sets an open
// sheet's bottom and height on phones. With no text box focused --kb must stay 0px; with a text box in a sheet focused and a
// keyboard-sized viewport, --kb must be > 0 (the keyboard fix of Nov 11 still works).
// Usage: node app/build.mjs --v2 && node experiments/v2-kb-jitter.mjs [page.html]
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path'; import {createRequire} from 'node:module';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), require = createRequire(import.meta.url);
let pw; try { pw = require(path.join(ROOT, 'node_modules/playwright')); } catch (e) { pw = require('playwright'); }
const file = process.argv[2] || path.join(ROOT, 'app/dist/v2.html');
const b = await pw.chromium.launch(), p = await b.newPage({viewport: {width: 390, height: 844}});
await p.addInitScript(() => { const fake = {h: null, top: 0}, vv = window.visualViewport;
  window.__vv = (h, top) => { fake.h = h; fake.top = top; vv.dispatchEvent(new Event('resize')); vv.dispatchEvent(new Event('scroll')); };
  Object.defineProperty(vv, 'height', {get: () => fake.h == null ? innerHeight : fake.h}); Object.defineProperty(vv, 'offsetTop', {get: () => fake.top}); });
await p.goto(pathToFileURL(path.resolve(file)).href + '#sheet'); await p.waitForTimeout(2500);
const kb = () => p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--kb').trim());
const seen = new Set();
for (const [h, top] of [[780, 0], [844, 0], [760, 30], [844, 0], [800, 12], [844, 0]]) { await p.evaluate(([h, t]) => window.__vv(h, t), [h, top]); await p.waitForTimeout(60); seen.add(await kb()); }
const bars = [...seen];
// keyboard: My Box's "Add a Pokémon" opens a sheet with a name box; focus it, then shrink the viewport like a keyboard
await p.goto(pathToFileURL(path.resolve(file)).href + '#box'); await p.waitForTimeout(2500);
await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find(x => /Add a Pok/.test(x.textContent)); if (e) e.click(); }); await p.waitForTimeout(600);
const typed = await p.evaluate(() => { const i = document.querySelector('.np-sheet input[type="text"], .np-sheet input[type="search"], .np-sheet input:not([type]), .np-sheet textarea'); if (!i) return false; i.focus(); return document.activeElement === i; });
let kbOpen = 'n/a'; if (typed) { await p.evaluate(() => window.__vv(500, 0)); await p.waitForTimeout(80); kbOpen = await kb(); }
await b.close();
const okBars = bars.length === 1 && bars[0] === '0px', okKb = !typed || (parseInt(kbOpen) > 0);
console.log(`bars moving, no text box focused: --kb values seen ${JSON.stringify(bars)} ${okBars ? 'OK (stays 0px)' : 'FAIL (sheet would jump)'}`);
console.log(`text box focused, keyboard-sized viewport: --kb ${kbOpen} ${typed ? (okKb ? 'OK' : 'FAIL') : '(no text box in the open sheet; not tested)'}`);
process.exit(okBars && okKb ? 0 : 1);

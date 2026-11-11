// First-visit My Team mock-up (R2): real top six ratings + today's underdog from the site, upscaled art, logo.
// node experiments/make-firstvisit.mjs  -> docs/rebuild/mocks/out/firstvisit.html + PNGs (desktop/phone x light/dusk)
import fs from 'node:fs'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
import {open, closeAll} from '../app/test/behaviour/harness.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), MOCKS = ROOT + 'docs/rebuild/mocks/', OUT = MOCKS + 'out/';
const helpers = fs.readFileSync(ROOT + 'app/src/app/15-visual-helpers.js', 'utf8'), i0 = helpers.indexOf('SPRITE_ID =');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(ROOT + 'app/src/data/logos.js', 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const art = n => { const id = SPRITE_ID[n]; const f = ROOT + `docs/rebuild/art/up1024/${id}.webp`; if (!id || !fs.existsSync(f)) throw new Error('no art for ' + n); return 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64'); };
const UNDERDOG = process.env.UNDERDOG || 'Flapple'; // Sim, Nov 11: Flapple first
const {ui, close} = await open({});
const s = JSON.parse(await ui.peek(`JSON.stringify((()=>{const one=p=>{const r=rating(p);return {n:p.n,d:p.d,r:RS(r.total),u:r.usage};};
  return {top:[...byName.values()].map(one).sort((a,b)=>b.r-a.r||b.u-a.u).slice(0,6),under:one(byName.get(${JSON.stringify(UNDERDOG)}))};})())`));
await close(); await closeAll();
// today's site saves to the Claude account; the public site (January) will say "saved on this device only"
const NOTE = process.env.PUBLIC ? 'Your team is saved on this device only. No account, no name, no email.' : 'Your team saves to your Claude account, so it follows you to your other devices. No name or email is collected.';
const D = {top: s.top.map(t => ({...t, img: art(t.n)})), under: {...s.under, img: art(s.under.n)}, note: NOTE, logo: sb.NP_SVG.hdrL, logoD: sb.NP_SVG.hdrD};
fs.writeFileSync(OUT + 'firstvisit.html', fs.readFileSync(MOCKS + 'firstvisit.tpl.html', 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(D) + ';'));
fs.copyFileSync(MOCKS + 'tokens.css', OUT + 'tokens.css');
console.log('top six', s.top.map(t => `${t.d} ${t.r}`).join(', '), '| underdog', s.under.d, s.under.r);
const b = await chromium.launch();
for (const [layout, w, h] of [['desktop', 1440, 900], ['phone', 390, 844]]) for (const theme of ['light', 'dusk']) {
  const pg = await (await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2})).newPage();
  await pg.goto('file://' + OUT + 'firstvisit.html#' + theme); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}); await pg.waitForTimeout(500);
  await pg.screenshot({path: OUT + `firstvisit-${layout}-${theme}.png`, fullPage: true}); await pg.close(); }
await b.close();

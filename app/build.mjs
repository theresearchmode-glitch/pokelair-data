// Builds the PokéLair page from src/ (parts.json lists the order). Output: dist/page.html, published as the artifact.
import fs from 'node:fs';
import {perfDoc} from './data-docs.mjs';
const parts = JSON.parse(fs.readFileSync(new URL('./parts.json', import.meta.url)));
import {fileURLToPath} from 'node:url';
// fileURLToPath works on Windows too (URL.pathname gives "/C:/..." there)
const dir = fileURLToPath(new URL('.', import.meta.url));
// Faster first load (Nov 2): the big data tables in src/data/*.js are written as `const X=<JSON>;`. A browser reads the same
// data from a JSON.parse('...') string much faster than from a JS object literal (it skips the full JavaScript parser), so
// each such line of 20 KB or more is rewritten that way. Only lines that are exactly `const NAME=<valid JSON>;` change, and
// the value is checked to come back identical; anything else is left alone. `node app/build.mjs --no-json-parse` turns it off.
const asJsonParse = (src) => process.argv.includes('--no-json-parse') ? src : src.split('\n').map(l => {
  const m = /^const ([A-Za-z_$][\w$]*)=(.*);$/.exec(l); if (!m || m[2].length < 20000) return l;
  let v; try { v = JSON.parse(m[2]); } catch (e) { return l; }
  const lit = "'" + m[2].replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(new RegExp('\\u2028', 'g'), '\\u2028').replace(new RegExp('\\u2029', 'g'), '\\u2029') + "'";
  if (/<\/script/i.test(lit) || JSON.stringify(JSON.parse(Function('return ' + lit)())) !== JSON.stringify(v)) return l;
  return `const ${m[1]}=JSON.parse(${lit});`; }).join('\n');
// Colour manga theme (Nov 4, Sim approved): src/theme/*.css are appended after polish.css inside the same <style> block.
// They write `@R` for a selector prefix strong enough to win over the older light/dark blocks without !important.
// `@C` (color.css) is one step stronger again, so the colour pass wins over manga.css without more !important.
// `@A` (arena*.css, Champions arena redesign, Nov 5) adds three more ids to `@C`, so arena wins over every older layer, including
// the older rules that carry an id of their own (#saveBtn, #homeOut, #lairSheet...).
// The rebuild's second build (R3, Nov 11; docs/rebuild/r3-foundation.md): node app/build.mjs --v2 writes dist/v2.html from
// parts-v2.json and stops; today's dist/page.html is not touched. CSS goes into cascade layers (tokens, base, components, shell,
// pages) so no selector ever needs to out-shout another. The data files and SPRITE_ID are shared with today's page.
if (process.argv.includes('--v2')) {
  /* --public: the build for real visitors (the live site at the switch, the public site in January). It leaves out the test hook
     (eval, code review C-I5), and pairs with no --preview-data, so the demo routes (#guide, #sheet, #team-empty; A1-M5) stay out too. */
  const PUBLIC = process.argv.includes('--public'); if (PUBLIC && process.argv.includes('--preview-data')) { console.error('--public and --preview-data do not mix'); process.exit(1); }
  // guard rails first: the build stops if the new CSS breaks the design rules (app/test/v2-guard.mjs)
  { const {spawnSync} = await import('node:child_process'); const g = spawnSync(process.execPath, [dir + 'test/v2-guard.mjs'], {stdio: 'inherit'}); if (g.status !== 0) process.exit(1); }
  const P = JSON.parse(fs.readFileSync(dir + 'parts-v2.json', 'utf8')), rd = f => fs.readFileSync(dir + f, 'utf8').replace(/\n$/, '');
  const layers = P.css.map(([n]) => n).join(', ');
  // code review C3 (Nov 15): /* */ comments are dropped from the shipped CSS (69 KB of 490), as the live build does; the source keeps them.
  // `--keep-comments` keeps them. JS comments are dropped by esbuild further down (code review B-I1).
  const noCom = c => process.argv.includes('--keep-comments') ? c : c.replace(/\/\*[\s\S]*?\*\//g, '');
  const css = `@layer ${layers};\n` + P.css.map(([n, f]) => `@layer ${n} {\n${noCom(rd(f))}\n}`).join('\n');
  const helpers = rd('src/app/15-visual-helpers.js'), i0 = helpers.indexOf('SPRITE_ID ='), sprite = helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1);
  JSON.parse(sprite); // fails the build if the shared sprite table ever stops being plain JSON
  const meta = fs.existsSync(dir + 'src/v2/art/meta.json') ? rd('src/v2/art/meta.json') : '{}';
  // today's logic (P.logic, in today's order) is one closure: 00-main.js opens it, so the v2 shell and pages go inside it and it is
  // closed after the first draw. 15-visual-helpers.js brings SPRITE_ID itself when it is included.
  const L = P.logic || [], hasIds = L.some(f => f.endsWith('15-visual-helpers.js'));
  if (L.length && !L[0].endsWith('00-main.js')) throw new Error('parts-v2.json logic must start with src/app/00-main.js (it opens the closure)');
  /* code review C-I3 (Nov 16): the bundle is one closure, so two top-level functions with the same name silently let the later file win.
     The only ones allowed are the four hooks bridge.js answers for today's shared logic (render, scheduleRender, safe, toast); bridge.js is a
     v2 script, so it always comes after the logic. Any other duplicate stops the build. */
  { const BRIDGE = new Set(['render', 'scheduleRender', 'safe', 'toast']), where = new Map();
    for (const f of [...L, ...P.scripts]) for (const m of rd(f).matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) { if (!where.has(m[1])) where.set(m[1], []); where.get(m[1]).push(f); }
    const bad = [...where].filter(([n, fs]) => fs.length > 1 && !(BRIDGE.has(n) && fs.length === 2 && fs[1].endsWith('v2/bridge.js')));
    if (bad.length) { console.error('duplicate top-level functions: ' + bad.map(([n, fs]) => n + ' (' + fs.join(', ') + ')').join('; ')); process.exit(1); } }
  const js = P.data.map(f => asJsonParse(rd(f))).join('\n') + (hasIds ? '' : `\nconst SPRITE_ID=${sprite};`) + `\nconst ART_META=${meta};\n` + L.map(rd).join('\n') + '\n' + P.scripts.filter(f => !(PUBLIC && f.endsWith('test-hook.js'))).map(rd).join('\n') + '\nV2.draw();' + (L.length ? '\n})();' : '');
  // where the pictures live: art/ beside the page by default; --art=<folder>/ when published next to other files (the redesign artifact)
  const artArg = (process.argv.find(x => x.startsWith('--art=')) || '').slice(6), artTag = artArg ? `<script>window.NP_ART=${JSON.stringify(artArg)};${process.argv.includes('--one-art-size') ? 'window.NP_ONE_ART=1;' : ''}</script>\n` : '';
  // --one-art-size (Nov 17): Claude-hosted builds (Preview, live artifact) use the 384px sprites only: an artifact holds at most 511 files,
  // too few for both sizes (346 + 346). The public site (January) keeps both sizes (sprites A).
  // --preview-data (redesign artifact only): a copy of today's daily data (out/*.json) answers the page's data requests, so a
  // preview shows the same numbers as the live site. Never used for the live site, which reads its own daily data.
  // Nov 12 (Sim's iPhone: no Strength Score, '#7 of 228' instead of '#7 of 321'): inside the Claude app window.claude can't be
  // replaced, so the data is also handed over as window.__NP_CLAUDE, which the page reads first.
  let prevTag = '';
  if (process.argv.includes('--preview-data')) { const o = f => { try { return JSON.parse(fs.readFileSync(dir + '../out/' + f, 'utf8')); } catch (e) { return null; } }, L = o('limitless.json') || {};
    const D = {'meta/results': L.results, 'meta/perf': perfDoc(L, o('perf.json')), /* Nov 15: all of out/perf.json as the morning refresh writes it (ratings-snapshot.mjs); with adj alone the page fell back to its built-in Nov 1 ratings */ 'meta/doubles_tour': o('meta_tour.json'), 'meta/teams': o('teams.json'), 'meta/calendar': o('calendar.json'), 'meta/weekly': o('weekly.json'), 'meta/model': o('model.json'), 'meta/doubles': o('meta_ladder.json'), 'meta/events': o('events.json'), 'meta/track': o('track.json'), 'meta/history': o('history.json'), 'meta/practice': o('practice.json'), 'meta/doubles_ingame': o('meta_ingame.json')};
    // privacy (Sim's review item 19, Nov 11): no real player name goes into the Preview's page source. Each name becomes the same
    // neutral stand-in everywhere it appears ("Player 12"), so matching a team to its own sets still works; none is shown on screen.
    { const ids = new Map(), anon = n => typeof n === 'string' && n ? (ids.has(n) || ids.set(n, 'Player ' + (ids.size + 1)), ids.get(n)) : n;
      for (const e of (D['meta/events'] || {}).events || []) for (const t of e.top || []) if (Array.isArray(t)) t[0] = anon(t[0]);
      for (const t of ((D['meta/teams'] || {}).teams || [])) if (t && 'player' in t) t.player = anon(t.player);
      for (const r of ((D['meta/weekly'] || {}).fresh || [])) if (Array.isArray(r)) r[5] = anon(r[5]); /* This Week's new-in-top-cut rows carry the player (never shown) */ }
    prevTag = `<script>window.__NP_PREVIEW=1;(()=>{const D=JSON.parse(${JSON.stringify(JSON.stringify(D)).replace(/</g, '\\u003c')}) /* JSON.parse reads faster than an object literal (code review B-m5) */;const real=window.claude,w={use:async n=>{if(n==='db')return {doc:q=>({onSnapshot:cb=>{setTimeout(()=>cb({exists:!!D[q],data:()=>D[q]}),5);return()=>{}},get:async()=>({exists:false}),set:async()=>{},update:async()=>{}})};return real&&real.use?real.use(n):null}};window.__NP_CLAUDE=w;try{window.claude=w}catch(e){}})();</script>\n`; }
  // fonts (Sim, Nov 11: privacy): hosted by NastyPlot itself, never Google's servers. fonts/ beside the page by default;
  // --fonts=<folder>/ when the files live elsewhere (as --art). The build fails if a Google Fonts link ever comes back.
  const fontsArg = (process.argv.find(x => x.startsWith('--fonts=')) || '').slice(8) || 'fonts/', fontCss = rd('src/v2/fonts/fonts.css').split('FONTS/').join(fontsArg);
  let head = rd(P.head); if (!head.includes('<!--NP-FONTS')) throw new Error('src/v2/head.html lost its <!--NP-FONTS--> marker');
  /* speed audit Nov 16 (Meta desktop shifted 0.110 on every first load when the fonts arrived): the two Latin files every page uses are
     preloaded, so the browser fetches them at once instead of after the page's scripts */
  const preload = ['unbounded-latin.woff2', 'instrument-sans-latin.woff2'].map(f => `<link rel="preload" href="${fontsArg}${f}" as="font" type="font/woff2" crossorigin>`).join('');
  head = head.replace(/<!--NP-FONTS[^>]*-->/, `${preload}<style>\n${fontCss}</style>`);
  /* the new logo's icons (Nov 16): generated by experiments/gen-logo-sly.mjs */
  if (head.includes('<!--NP-ICONS')) head = head.replace(/<!--NP-ICONS[^>]*-->/, fs.existsSync(dir + 'src/v2/icons.html') ? rd('src/v2/icons.html').trim() : ''); if (/fonts\.(googleapis|gstatic)\.com/.test(head)) throw new Error('a Google Fonts link is back in the v2 head');
  /* code review B-I1 (Nov 17): the scripts ship without comments and spare whitespace (esbuild, whitespace only: no renaming, so
     nothing that looks a name up changes). About 300 KB of comments came along before. --keep-comments skips it; without esbuild
     installed the page ships as before. */
  let jsOut = js; if (!process.argv.includes('--keep-comments')) { let esb = null; try { esb = (await import('node:module')).createRequire(import.meta.url)('esbuild'); } catch (e) { console.log('v2: esbuild not installed, scripts ship unminified'); }
    if (esb) jsOut = esb.transformSync(js, {loader: 'js', minifyWhitespace: true, charset: 'utf8', legalComments: 'none'}).code; }
  const page = head.replace('<meta charset="utf-8">', m => m + artTag + prevTag) + `\n<style>\n${css}\n</style>\n` + rd(P.body) + `\n<script>\n${jsOut}\n</script>\n</body></html>\n`;
  fs.mkdirSync(dir + 'dist', {recursive: true}); fs.writeFileSync(dir + 'dist/v2.html', page);
  /* Sim, Nov 16 (B-I3, option B): a static first screen. A phone used to show a blank page for about 2 s while the script ran (first paint
     2,016 -> 628 ms measured at 4x CPU with the header already in the HTML). The build opens the page it just made, copies the header and
     the phone bar the script draws (current-page marks removed: the right one is set by the first draw), and puts them in #app, so the
     same header shows at once and the first draw replaces it with no visible change. Skipped with --no-static or without Playwright. */
  if (!process.argv.includes('--no-static')) { let chromium = null; try { ({chromium} = await import('playwright')); } catch (e) { console.log('v2: playwright not installed, no static first screen'); }
    if (chromium) { const b = await chromium.launch(), pg = await b.newPage({viewport: {width: 1280, height: 900}});
      try { await pg.goto('file://' + dir + 'dist/v2.html#home'); await pg.waitForFunction(() => document.querySelector('#app .np-head'), null, {timeout: 15000});
        const parts = await pg.evaluate(() => { const g = s => { const e = document.querySelector('#app ' + s); if (!e) return ''; const c = e.cloneNode(true); c.querySelectorAll('[aria-current]').forEach(x => x.removeAttribute('aria-current')); return c.outerHTML; };
          return g('.np-skip') + g('.np-head') + '<main class="np-main" id="main">' + (window.V2 && V2.loadingHtml ? V2.loadingHtml() : '') + '</main>' + g('.np-bar'); }); /* pre-launch 2b (Nov 17): the loading panel from the first paint (slow 4G showed an empty page for ~3 s) */
        if (parts.includes('np-head') && page.includes('<div id="app"></div>')) { fs.writeFileSync(dir + 'dist/v2.html', page.replace('<div id="app"></div>', `<div id="app">${parts}</div>`)); console.log(`v2: static first screen ${(parts.length / 1024).toFixed(0)} KB`); }
      } catch (e) { console.log('v2: static first screen skipped (' + String(e.message).slice(0, 80) + ')'); } finally { await b.close(); } } }
  // the font files beside the built page (fonts/ is the default place the page reads them from)
  fs.mkdirSync(dir + 'dist/fonts', {recursive: true}); for (const f of fs.readdirSync(dir + 'src/v2/fonts')) if (f.endsWith('.woff2')) fs.copyFileSync(dir + 'src/v2/fonts/' + f, dir + 'dist/fonts/' + f);
  console.log(`built dist/v2.html (${(page.length / 1024).toFixed(0)} KB; ${P.css.length} CSS layers, ${P.data.length} data files, ${P.scripts.length} scripts${(P.logic || []).length ? `, ${P.logic.length} shared logic files` : ''})`);
  process.exit(0); }
const themeCss = s => s.replace(/@A/g, '@C:not(#_d):not(#_e):not(#_f)').replace(/@C/g, '@R:not(#_c)').replace(/@R/g, ':root:not(#_a):not(#_b)');
let out = parts.map(p => { const s = fs.readFileSync(dir + p, 'utf8').replace(/\n$/, ''); return /^src\/data\/.*\.js$/.test(p) ? asJsonParse(s) : /^src\/theme\/.*\.css$/.test(p) ? themeCss(s) : s; }).join('\n');
// Smaller page (Nov 1, load speed): whole-line // comments inside the app's plain <script> blocks are dropped, about 150 KB
// (57 KB gzipped, 10% of the download) that the phone no longer downloads or parses. Only lines that are nothing but a comment
// go; code, strings and the battle-log text block (<script type="text/plain">) are untouched. Checked by comparing an
// esbuild-minified copy of the scripts before and after (identical). `node app/build.mjs --keep-comments` keeps them.
let dropped = 0;
// The same for /* */ comments in the <style> block (about 10 KB gzipped more).
if (!process.argv.includes('--keep-comments')) {
  out = out.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => '<script>' + code.split('\n').filter(l => { const c = /^\s*\/\/[^\n]*$/.test(l); if (c) dropped++; return !c; }).join('\n') + '</script>');
  out = out.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => '<style>' + css.replace(/\/\*[\s\S]*?\*\//g, () => { dropped++; return ''; }) + '</style>'); }
// Darkrai on empty and loading screens (Sim, Nov 9; "just a pokemon we like", not a mascot; approved for live Nov 9). One small
// <script> sets window.NP_MASCOT to docs/mascot/darkrai.webp (PokeAPI HOME render 491, inked with app/sprite-ink.py); the app shows
// it only where window.NP_MASCOT is set (74-arena.js: the empty My Team).
{ const img = fs.readFileSync(dir + '../docs/mascot/darkrai.webp').toString('base64'), at = out.indexOf('<script');
  if (at < 0) throw new Error('no <script> in page'); out = out.slice(0, at) + `<script>window.NP_MASCOT='data:image/webp;base64,${img}';</script>` + out.slice(at); }
fs.mkdirSync(dir + 'dist', {recursive: true});
fs.writeFileSync(dir + 'dist/page.html', out);
console.log(`built dist/page.html (${(out.length / 1024).toFixed(0)} KB from ${parts.length} parts${dropped ? `, ${dropped} comment lines dropped` : ''})`);
// Lighter page (Sim, Nov 5): drop CSS that can never match and minify (see slim.mjs). `--no-slim` skips it.
if (!process.argv.includes('--no-slim')) await import('./slim.mjs');

// Builds the PokéLair page from src/ (parts.json lists the order). Output: dist/page.html, published as the artifact.
import fs from 'node:fs';
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
  // guard rails first: the build stops if the new CSS breaks the design rules (app/test/v2-guard.mjs)
  { const {spawnSync} = await import('node:child_process'); const g = spawnSync(process.execPath, [dir + 'test/v2-guard.mjs'], {stdio: 'inherit'}); if (g.status !== 0) process.exit(1); }
  const P = JSON.parse(fs.readFileSync(dir + 'parts-v2.json', 'utf8')), rd = f => fs.readFileSync(dir + f, 'utf8').replace(/\n$/, '');
  const layers = P.css.map(([n]) => n).join(', ');
  const css = `@layer ${layers};\n` + P.css.map(([n, f]) => `@layer ${n} {\n${rd(f)}\n}`).join('\n');
  const helpers = rd('src/app/15-visual-helpers.js'), i0 = helpers.indexOf('SPRITE_ID ='), sprite = helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1);
  JSON.parse(sprite); // fails the build if the shared sprite table ever stops being plain JSON
  const meta = fs.existsSync(dir + 'src/v2/art/meta.json') ? rd('src/v2/art/meta.json') : '{}';
  // today's logic (P.logic, in today's order) is one closure: 00-main.js opens it, so the v2 shell and pages go inside it and it is
  // closed after the first draw. 15-visual-helpers.js brings SPRITE_ID itself when it is included.
  const L = P.logic || [], hasIds = L.some(f => f.endsWith('15-visual-helpers.js'));
  if (L.length && !L[0].endsWith('00-main.js')) throw new Error('parts-v2.json logic must start with src/app/00-main.js (it opens the closure)');
  const js = P.data.map(f => asJsonParse(rd(f))).join('\n') + (hasIds ? '' : `\nconst SPRITE_ID=${sprite};`) + `\nconst ART_META=${meta};\n` + L.map(rd).join('\n') + '\n' + P.scripts.map(rd).join('\n') + '\nV2.draw();' + (L.length ? '\n})();' : '');
  // where the pictures live: art/ beside the page by default; --art=<folder>/ when published next to other files (the redesign artifact)
  const artArg = (process.argv.find(x => x.startsWith('--art=')) || '').slice(6), artTag = artArg ? `<script>window.NP_ART=${JSON.stringify(artArg)};</script>\n` : '';
  // --preview-data (redesign artifact only): a copy of today's daily data (out/*.json) answers the page's data requests, so a
  // preview shows the same numbers as the live site. Never used for the live site, which reads its own daily data.
  // Nov 12 (Sim's iPhone: no Strength Score, '#7 of 228' instead of '#7 of 321'): inside the Claude app window.claude can't be
  // replaced, so the data is also handed over as window.__NP_CLAUDE, which the page reads first.
  let prevTag = '';
  if (process.argv.includes('--preview-data')) { const o = f => { try { return JSON.parse(fs.readFileSync(dir + '../out/' + f, 'utf8')); } catch (e) { return null; } }, L = o('limitless.json') || {};
    const D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': o('meta_tour.json'), 'meta/teams': o('teams.json'), 'meta/model': o('model.json'), 'meta/doubles': o('meta_ladder.json'), 'meta/events': o('events.json')};
    // privacy (Sim's review item 19, Nov 11): no real player name goes into the Preview's page source. Each name becomes the same
    // neutral stand-in everywhere it appears ("Player 12"), so matching a team to its own sets still works; none is shown on screen.
    { const ids = new Map(), anon = n => typeof n === 'string' && n ? (ids.has(n) || ids.set(n, 'Player ' + (ids.size + 1)), ids.get(n)) : n;
      for (const e of (D['meta/events'] || {}).events || []) for (const t of e.top || []) if (Array.isArray(t)) t[0] = anon(t[0]);
      for (const t of ((D['meta/teams'] || {}).teams || [])) if (t && 'player' in t) t.player = anon(t.player); }
    prevTag = `<script>window.__NP_PREVIEW=1;(()=>{const D=${JSON.stringify(D).replace(/</g, '\\u003c')};const real=window.claude,w={use:async n=>{if(n==='db')return {doc:q=>({onSnapshot:cb=>{setTimeout(()=>cb({exists:!!D[q],data:()=>D[q]}),5);return()=>{}},get:async()=>({exists:false}),set:async()=>{},update:async()=>{}})};return real&&real.use?real.use(n):null}};window.__NP_CLAUDE=w;try{window.claude=w}catch(e){}})();</script>\n`; }
  // fonts (Sim, Nov 11: privacy): hosted by NastyPlot itself, never Google's servers. fonts/ beside the page by default;
  // --fonts=<folder>/ when the files live elsewhere (as --art). The build fails if a Google Fonts link ever comes back.
  const fontsArg = (process.argv.find(x => x.startsWith('--fonts=')) || '').slice(8) || 'fonts/', fontCss = rd('src/v2/fonts/fonts.css').split('FONTS/').join(fontsArg);
  let head = rd(P.head); if (!head.includes('<!--NP-FONTS')) throw new Error('src/v2/head.html lost its <!--NP-FONTS--> marker');
  head = head.replace(/<!--NP-FONTS[^>]*-->/, `<style>\n${fontCss}</style>`); if (/fonts\.(googleapis|gstatic)\.com/.test(head)) throw new Error('a Google Fonts link is back in the v2 head');
  const page = head.replace('<meta charset="utf-8">', m => m + artTag + prevTag) + `\n<style>\n${css}\n</style>\n` + rd(P.body) + `\n<script>\n${js}\n</script>\n</body></html>\n`;
  fs.mkdirSync(dir + 'dist', {recursive: true}); fs.writeFileSync(dir + 'dist/v2.html', page);
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

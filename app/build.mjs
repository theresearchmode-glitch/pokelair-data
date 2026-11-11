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
  const P = JSON.parse(fs.readFileSync(dir + 'parts-v2.json', 'utf8')), rd = f => fs.readFileSync(dir + f, 'utf8').replace(/\n$/, '');
  const layers = P.css.map(([n]) => n).join(', ');
  const css = `@layer ${layers};\n` + P.css.map(([n, f]) => `@layer ${n} {\n${rd(f)}\n}`).join('\n');
  const helpers = rd('src/app/15-visual-helpers.js'), i0 = helpers.indexOf('SPRITE_ID ='), sprite = helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1);
  JSON.parse(sprite); // fails the build if the shared sprite table ever stops being plain JSON
  const meta = fs.existsSync(dir + 'src/v2/art/meta.json') ? rd('src/v2/art/meta.json') : '{}';
  const js = P.data.map(f => asJsonParse(rd(f))).join('\n') + `\nconst SPRITE_ID=${sprite};\nconst ART_META=${meta};\n` + P.scripts.map(rd).join('\n') + '\nV2.draw();';
  // where the pictures live: art/ beside the page by default; --art=<folder>/ when published next to other files (the redesign artifact)
  const artArg = (process.argv.find(x => x.startsWith('--art=')) || '').slice(6), artTag = artArg ? `<script>window.NP_ART=${JSON.stringify(artArg)};</script>\n` : '';
  const page = artTag + rd(P.head) + `\n<style>\n${css}\n</style>\n` + rd(P.body) + `\n<script>\n${js}\n</script>\n</body></html>\n`;
  fs.mkdirSync(dir + 'dist', {recursive: true}); fs.writeFileSync(dir + 'dist/v2.html', page);
  console.log(`built dist/v2.html (${(page.length / 1024).toFixed(0)} KB; ${P.css.length} CSS layers, ${P.data.length} data files, ${P.scripts.length} scripts)`);
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

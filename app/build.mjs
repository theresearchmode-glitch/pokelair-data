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
const themeCss = s => s.replace(/@C/g, '@R:not(#_c)').replace(/@R/g, ':root:not(#_a):not(#_b)');
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
fs.mkdirSync(dir + 'dist', {recursive: true});
fs.writeFileSync(dir + 'dist/page.html', out);
console.log(`built dist/page.html (${(out.length / 1024).toFixed(0)} KB from ${parts.length} parts${dropped ? `, ${dropped} comment lines dropped` : ''})`);

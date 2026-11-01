// Builds the PokéLair page from src/ (parts.json lists the order). Output: dist/page.html, published as the artifact.
import fs from 'node:fs';
const parts = JSON.parse(fs.readFileSync(new URL('./parts.json', import.meta.url)));
import {fileURLToPath} from 'node:url';
// fileURLToPath works on Windows too (URL.pathname gives "/C:/..." there)
const dir = fileURLToPath(new URL('.', import.meta.url));
let out = parts.map(p => fs.readFileSync(dir + p, 'utf8').replace(/\n$/, '')).join('\n');
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

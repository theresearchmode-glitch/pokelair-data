// Builds the PokéLair page from src/ (parts.json lists the order). Output: dist/page.html, published as the artifact.
import fs from 'node:fs';
const parts = JSON.parse(fs.readFileSync(new URL('./parts.json', import.meta.url)));
const dir = new URL('.', import.meta.url).pathname;
const out = parts.map(p => fs.readFileSync(dir + p, 'utf8').replace(/\n$/, '')).join('\n');
fs.mkdirSync(dir + 'dist', {recursive: true});
fs.writeFileSync(dir + 'dist/page.html', out);
console.log(`built dist/page.html (${(out.length / 1024).toFixed(0)} KB from ${parts.length} parts)`);

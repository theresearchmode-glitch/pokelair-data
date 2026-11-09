// Darkrai is part of the normal build since Sim approved it for live (Nov 9; see app/build.mjs). This script is kept so older
// commands still work: it only copies dist/page.html to <out.html>. Usage: node app/preview-mascot.mjs <out.html>
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const dir = fileURLToPath(new URL('.', import.meta.url));
const out = process.argv[2]; if (!out) { console.error('usage: node app/preview-mascot.mjs <out.html>'); process.exit(1); }
fs.copyFileSync(dir + 'dist/page.html', out);
console.log(`copied dist/page.html -> ${out} (Darkrai is in the normal build)`);

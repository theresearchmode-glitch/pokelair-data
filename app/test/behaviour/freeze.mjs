// Freeze today's data into fixture/ so behaviour tests only fail when the CODE breaks (CLAUDE.md: code tests run on a frozen
// snapshot). Re-freeze on purpose only (e.g. after Reg M-D), never to make a failing test pass: node app/test/behaviour/freeze.mjs
import fs from 'node:fs'; import zlib from 'node:zlib'; import {fileURLToPath} from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url)), OUT = HERE + '../../../out/';
const FILES = ['limitless', 'meta_tour', 'teams', 'model', 'meta_ladder', 'meta_ingame', 'history', 'events', 'weekly', 'track', 'practice', 'calendar'];
for (const f of FILES) { const b = fs.readFileSync(OUT + f + '.json'); fs.writeFileSync(HERE + 'fixture/' + f + '.json.gz', zlib.gzipSync(b, {level: 9})); }
fs.writeFileSync(HERE + 'fixture/FROZEN.txt', `Frozen ${new Date().toISOString()} from out/ (${FILES.length} files)\n`);
console.log('frozen', FILES.length, 'files');

// Freeze today's data into fixture/ so behaviour tests only fail when the CODE breaks (CLAUDE.md: code tests run on a frozen
// snapshot). Re-freeze on purpose only (e.g. after Reg M-D), never to make a failing test pass: node app/test/behaviour/freeze.mjs
import fs from 'node:fs'; import zlib from 'node:zlib'; import {fileURLToPath} from 'node:url';
import {eachPlayer, anonymiser} from '../player-fields.mjs';
const HERE = fileURLToPath(new URL('.', import.meta.url)), OUT = HERE + '../../../out/';
const FILES = ['limitless', 'meta_tour', 'teams', 'model', 'meta_ladder', 'meta_ingame', 'history', 'events', 'weekly', 'track', 'practice', 'calendar'];
// privacy (code review C-C2, Nov 17): no real player name is committed; each becomes the same "Player N" stand-in in every file
const anon = anonymiser();
for (const f of FILES) { const d = JSON.parse(fs.readFileSync(OUT + f + '.json', 'utf8')); eachPlayer(d, anon); fs.writeFileSync(HERE + 'fixture/' + f + '.json.gz', zlib.gzipSync(Buffer.from(JSON.stringify(d)), {level: 9})); }
fs.writeFileSync(HERE + 'fixture/FROZEN.txt', `Frozen ${new Date().toISOString()} from out/ (${FILES.length} files)\n`);
console.log('frozen', FILES.length, 'files');

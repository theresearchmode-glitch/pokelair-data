// No real player names (privacy, Sim Nov 10-11; code review C-C2, Nov 17). Checks the committed test fixture and, when given,
// a built page's embedded Preview data. Every player field must be an ID or a neutral "Player N" stand-in (player-fields.mjs).
// Prints counts only, never a name. Exit 1 if anything is left.
//   node app/test/no-names.mjs                       fixture only
//   node app/test/no-names.mjs app/dist/v2.html      fixture + that page (a --split build: the preview.json beside it)
import fs from 'node:fs'; import zlib from 'node:zlib'; import {fileURLToPath} from 'node:url';
import {eachPlayer, OK} from './player-fields.mjs';
const HERE = fileURLToPath(new URL('.', import.meta.url)), FX = HERE + 'behaviour/fixture/';
let bad = 0, seen = 0; const where = {};
const scan = (label, data) => eachPlayer(data, v => { seen++; if (!OK(v)) { bad++; where[label] = (where[label] || 0) + 1; } });
for (const f of fs.readdirSync(FX).filter(f => f.endsWith('.json.gz'))) scan('fixture/' + f, JSON.parse(zlib.gunzipSync(fs.readFileSync(FX + f)).toString('utf8')));
const page = process.argv[2];
/* a --split Preview build (Nov 18) keeps its data in preview.json beside the page: the check reads that file (or a .json given directly) */
const pvFile = page && (page.endsWith('.json') ? page : /fetch\("preview\.json/.test(fs.readFileSync(page, 'utf8')) ? page.replace(/[^/\\]*$/, 'preview.json') : null);
if (pvFile) scan(pvFile, JSON.parse(fs.readFileSync(pvFile, 'utf8')));
else if (page) { const h = fs.readFileSync(page, 'utf8'), m = h.match(/const D=(\{.*?\});const real=/s), j = h.match(/const D=JSON\.parse\(((?:"(?:[^"\\]|\\.)*"))\)/s);
  if (j) scan(page, JSON.parse(JSON.parse(j[1].replace(/\\u003c/g, '<')))); else if (m) scan(page, JSON.parse(m[1].replace(/\\u003c/g, '<'))); else console.log(page + ': no embedded Preview data (the live build reads its data at run time)'); }
console.log(`no-names: ${seen} player fields checked, ${bad} not an ID or stand-in` + (bad ? ' in ' + JSON.stringify(where) : ''));
process.exit(bad ? 1 : 0);

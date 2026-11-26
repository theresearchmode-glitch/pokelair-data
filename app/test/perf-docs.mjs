// The behaviour tests and the live-site suite feed the page the same "meta/perf" document the daily job stores (all of perf.json,
// not only adj), so rating and Strength Score tests run the production path (code review C-I2, Nov 17). Fails if a test harness
// drops the extra parts again. No browser needed.   node app/test/perf-docs.mjs
import {DOCS} from './behaviour/harness.mjs';
import {perfDoc} from '../data-docs.mjs';
import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('../../', import.meta.url)), rd = f => JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8'));
const P = DOCS['meta/perf'], want = Object.keys(rd('perf.json')).filter(k => k !== 'updated');
const miss = P ? want.filter(k => !(k in P)) : want;
const live = perfDoc(rd('limitless.json'), rd('perf.json')), missLive = want.filter(k => !(k in live));
console.log(`perf-docs: behaviour fixture "meta/perf" has ${want.length - miss.length} of ${want.length} perf.json parts${miss.length ? ' (missing ' + miss.join(', ') + ')' : ''}; built doc has ${want.length - missLive.length}`);
process.exit(miss.length || missLive.length ? 1 : 0);

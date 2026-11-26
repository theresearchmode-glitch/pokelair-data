// Every script in the repo must at least parse (Kip job 36 A #1, Nov 25: a merge left names.mjs with a second NAT_LIST
// declaration; it imported by update.mjs, so the daily data job would have crashed after the switch, and no test noticed).
// Run: node experiments/syntax-check.mjs   (exit 1 lists every file that doesn't parse)
import {execFileSync, spawnSync} from 'node:child_process';
const files = execFileSync('git', ['ls-files', '*.mjs', ':!node_modules'], {encoding: 'utf8'}) /* no shell: Windows cmd.exe passed the quotes through (Kip job 39) */.split('\n').filter(Boolean);
const bad = files.filter(f => spawnSync(process.execPath, ['--check', f], {encoding: 'utf8'}).status !== 0);
for (const f of bad) console.log('  FAIL  does not parse: ' + f + ' :: ' + spawnSync(process.execPath, ['--check', f], {encoding: 'utf8'}).stderr.split('\n').find(l => /Error/.test(l)));
console.log(bad.length ? `syntax-check: ${bad.length} of ${files.length} scripts don't parse` : `syntax-check: all ${files.length} scripts parse`);
process.exit(bad.length ? 1 : 0);

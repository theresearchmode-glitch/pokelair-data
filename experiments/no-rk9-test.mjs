// RK9 data is not kept (Sim, Nov 25: RK9's terms, rk9.gg/terms 5.3(3), forbid automated extraction). Fails if data/rk9 is back
// or any script reads it. Run: node experiments/no-rk9-test.mjs
import fs from 'node:fs'; import {execSync} from 'node:child_process';
let bad = 0; const ok = (c, m) => { console.log(`${c ? 'pass' : 'FAIL'} ${m}`); if (!c) bad++; };
ok(!fs.existsSync('data/rk9'), 'no data/rk9 folder');
const hits = execSync("git grep -l -e 'data/rk9' -- '*.mjs' '*.js' '*.yml' ':!experiments/no-rk9-test.mjs' || true", {encoding: 'utf8'}).trim();
ok(!hits, `no script, page file or workflow reads data/rk9${hits ? ': ' + hits.split('\n').join(', ') : ''}`);
// the frozen whole-field table made from RK9 (out/official_perf.json; Sim's OK Nov 25). Checked in git, not on disk: CI's frozen
// Nov 9 test data (an old commit's out/) still carries a copy.
ok(!execSync('git ls-tree --name-only HEAD out/official_perf.json', {encoding: 'utf8'}).trim() /* HEAD, not the index: CI's frozen-data checkout stages the old copy */, 'out/official_perf.json is not in the repo');
const rd = execSync("git grep -l -E \"['\\\"]official_perf\\.json['\\\"]\" -- '*.mjs' '*.js' ':!experiments/no-rk9-test.mjs' ':!experiments/probe-report.mjs' || true", {encoding: 'utf8'}).trim();
ok(!rd, `no data job or page file reads it${rd ? ': ' + rd.split('\n').join(', ') : ''}`);
process.exit(bad ? 1 : 0);

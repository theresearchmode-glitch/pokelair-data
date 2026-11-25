// RK9 data is not kept (Sim, Nov 25: RK9's terms, rk9.gg/terms 5.3(3), forbid automated extraction). Fails if data/rk9 is back
// or any script reads it. Run: node experiments/no-rk9-test.mjs
import fs from 'node:fs'; import {execSync} from 'node:child_process';
let bad = 0; const ok = (c, m) => { console.log(`${c ? 'pass' : 'FAIL'} ${m}`); if (!c) bad++; };
ok(!fs.existsSync('data/rk9'), 'no data/rk9 folder');
const hits = execSync("git grep -l -e 'data/rk9' -- '*.mjs' '*.js' '*.yml' ':!experiments/no-rk9-test.mjs' || true", {encoding: 'utf8'}).trim();
ok(!hits, `no script, page file or workflow reads data/rk9${hits ? ': ' + hits.split('\n').join(', ') : ''}`);
process.exit(bad ? 1 : 0);

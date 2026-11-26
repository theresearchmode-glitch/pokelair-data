// This Week (#weekly) direction mock-up (helper hM, Nov 22). Option A (recommended): the slope. Option B: movers as roster cards.
// Run from the copy's root after a --v2 --preview-data build: node docs/rebuild/mocks/reskin-nov22/weekly-mock.cjs <out folder>
const {execFileSync} = require('child_process'), fs = require('fs'), path = require('path'), out = process.argv[2] || '.';
const dir = __dirname, inj = path.join(dir, 'weekly-mock.inject.js'), env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')};
const run = (pre, f) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), 'weekly', path.join(out, pre), f], {env}).toString());
run('weekly-A', inj);
const b = path.join(out, 'weekly-B.inject.js'); fs.writeFileSync(b, "window.WKOPT='B';\n" + fs.readFileSync(inj, 'utf8')); run('weekly-B', b);
run('weekly-today', '-');

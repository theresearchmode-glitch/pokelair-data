// How We Calculate (#method) direction mock-up (helper hM, Nov 22). B (recommended): one grid. A: four plan steps.
// Run from the copy's root after a --v2 --preview-data build: node docs/rebuild/mocks/reskin-nov22/method-mock.cjs <out folder>
const {execFileSync} = require('child_process'), fs = require('fs'), path = require('path'), out = process.argv[2] || '.';
const dir = __dirname, inj = path.join(dir, 'method-mock.inject.js'), env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')};
const run = (pre, f) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), 'method', path.join(out, pre), f], {env}).toString());
run('method-A', inj);
const b = path.join(out, 'method-B.inject.js'); fs.writeFileSync(b, "window.MTOPT='B';\n" + fs.readFileSync(inj, 'utf8')); run('method-B', b);
run('method-today', '-');

// Ratings (#meta) ROUND 2 (helper hM, Nov 22; Sim: "make it less boring ... i dont want the big piles of lists"). A (recommended): the stairs.
// B: the podium + tiles. Run from the copy's root after a --v2 --preview-data build: node docs/rebuild/mocks/reskin-nov22/meta2-mock.cjs <out folder>
const {execFileSync} = require('child_process'), fs = require('fs'), path = require('path'), out = process.argv[2] || '.', dir = __dirname;
const env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')}, inj = path.join(dir, 'meta2-mock.inject.js');
const run = (pre, f) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), 'meta', path.join(out, pre), f], {env}).toString());
run('meta2-A', inj); const b = path.join(out, 'meta2-B.inject.js'); fs.writeFileSync(b, "window.RAOPT='B';\n" + fs.readFileSync(inj, 'utf8')); run('meta2-B', b);

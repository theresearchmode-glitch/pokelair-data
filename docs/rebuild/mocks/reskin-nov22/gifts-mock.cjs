// Mystery Gifts (#gifts) direction mock-up (helper hM, Nov 22): Sim's PC mock "kept as drawn" on the kit, the code-wrap fix, real data.
// Run from the copy's root after a --v2 --preview-data build: node docs/rebuild/mocks/reskin-nov22/gifts-mock.cjs <out folder>
const {execFileSync} = require('child_process'), path = require('path'), out = process.argv[2] || '.', dir = __dirname;
const env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')};
const run = (pre, f) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), 'gifts', path.join(out, pre), f], {env}).toString());
run('gifts-kit', path.join(dir, 'gifts-mock.inject.js')); run('gifts-today', '-');

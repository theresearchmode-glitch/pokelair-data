// Page not found (#nonsense) direction mock-up (helper hM, Nov 22): Wrong turn + the underdog on the kit, real data.
// Run from the copy's root after a --v2 --preview-data build: node docs/rebuild/mocks/reskin-nov22/notfound-mock.cjs <out folder>
const {execFileSync} = require('child_process'), path = require('path'), out = process.argv[2] || '.', dir = __dirname;
const env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')};
const run = (pre, f) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), 'nonsense', path.join(out, pre), f], {env}).toString());
run('notfound-kit', path.join(dir, 'notfound-mock.inject.js')); run('notfound-today', '-');

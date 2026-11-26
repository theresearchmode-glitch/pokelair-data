// Owner page (#owner) direction mock-up (helper hM, Nov 22): plain in the kit; today is drawn as owner by setting V2.OWN (see owner-mock.inject.js), real data.
// Run from the copy's root after a --v2 --preview-data build: node docs/rebuild/mocks/reskin-nov22/owner-mock.cjs <out folder>
const {execFileSync} = require('child_process'), path = require('path'), out = process.argv[2] || '.', dir = __dirname;
const env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')};
const run = (pre, f) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), 'owner', path.join(out, pre), f], {env}).toString());
run('owner-kit', path.join(dir, 'owner-mock.inject.js')); run('owner-today', '-');

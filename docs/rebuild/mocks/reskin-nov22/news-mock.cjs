// News (#news) direction mock-up (helper hM, Nov 22): Sim's PC mock "kept as drawn" on the kit, with small fixes, real data.
// Run from the copy's root after a --v2 --preview-data build: node docs/rebuild/mocks/reskin-nov22/news-mock.cjs <out folder>
const {execFileSync} = require('child_process'), path = require('path'), out = process.argv[2] || '.', dir = __dirname;
const env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')};
const run = (pre, f) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), 'news', path.join(out, pre), f], {env}).toString());
run('news-kit', path.join(dir, 'news-mock.inject.js')); run('news-today', '-');

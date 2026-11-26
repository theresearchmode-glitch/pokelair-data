// Ratings (#meta) direction mock-up (helper hM, Nov 22; Sim's top priority). A (recommended): the scoreboard. B: the podium.
// Plus one picture of a way in from Home (meta-home-entry.inject.js). Run from the copy's root after a --v2 --preview-data build:
//   node docs/rebuild/mocks/reskin-nov22/meta-mock.cjs <out folder>
const {execFileSync} = require('child_process'), fs = require('fs'), path = require('path'), out = process.argv[2] || '.', dir = __dirname;
const env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')}, inj = path.join(dir, 'meta-mock.inject.js');
const run = (hash, pre, f, m) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), hash, path.join(out, pre), f, ...(m ? [m] : [])], {env}).toString());
run('meta', 'meta-A', inj);
const b = path.join(out, 'meta-B.inject.js'); fs.writeFileSync(b, "window.RAOPT='B';\n" + fs.readFileSync(inj, 'utf8')); run('meta', 'meta-B', b);
run('meta', 'meta-today', '-', '1440:day,390:day'); run('home', 'home-entry', path.join(dir, 'meta-home-entry.inject.js'), '1440:day');

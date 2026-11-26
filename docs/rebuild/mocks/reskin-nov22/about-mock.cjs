// About (#about) direction mock-up (helper hM, Nov 22). A (recommended): the receipt. B: six cards.
// Run from the copy's root after a --v2 --preview-data build: node docs/rebuild/mocks/reskin-nov22/about-mock.cjs <out folder>
const {execFileSync} = require('child_process'), fs = require('fs'), path = require('path'), out = process.argv[2] || '.';
const dir = __dirname, inj = path.join(dir, 'about-mock.inject.js'), env = {...process.env, PAGE: process.env.PAGE || path.resolve('app/dist/v2.html')};
const run = (pre, f) => console.log(execFileSync('node', [path.join(dir, 'shot.cjs'), 'about', path.join(out, pre), f], {env}).toString());
run('about-A', inj);
const b = path.join(out, 'about-B.inject.js'); fs.writeFileSync(b, "window.ABOPT='B';\n" + fs.readFileSync(inj, 'utf8')); run('about-B', b);
run('about-today', '-');

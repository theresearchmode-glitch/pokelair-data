// Moves edits made directly to the published page back into app/src.
// Usage: node experiments/port-page.mjs <old page.html> <new page.html>
// The old page must equal what app/build.mjs builds from the current sources (checked first). Every changed block of
// lines is located in the source part that produced it and replaced there; a block that spans two parts is reported
// and left alone, so nothing is ever written to the wrong file.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const appDir = fileURLToPath(new URL('../app/', import.meta.url));
const parts = JSON.parse(fs.readFileSync(appDir + 'parts.json', 'utf8'));
const body = s => { s = s.replace(/\r\n/g, '\n'); const i = s.indexOf('<title>NastyPlot'); if (i < 0) throw new Error('no <title>NastyPlot in page'); return s.slice(i).replace(/\s*<\/body>\s*<\/html>\s*$/, ''); };
const srcs = parts.map(p => fs.readFileSync(appDir + p, 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, ''));
const built = srcs.join('\n'), oldP = body(fs.readFileSync(process.argv[2], 'utf8')), newP = body(fs.readFileSync(process.argv[3], 'utf8'));
const b0 = built.slice(built.indexOf('<title>NastyPlot'));
if (b0.replace(/\s+$/, '') !== oldP.replace(/\s+$/, '')) { console.error('The old page is not what the current sources build. Stopping.'); process.exit(1); }
const pre = built.slice(0, built.indexOf('<title>NastyPlot')).split('\n').length - 1; // lines before <title> in the build
const A = oldP.split('\n'), B = newP.split('\n');
// line ranges of each part in the build
const starts = []; let ln = 0; for (const s of srcs) { starts.push(ln); ln += s.split('\n').length; }
const partOf = line => { let k = 0; while (k + 1 < starts.length && starts[k + 1] <= line) k++; return k; };
// greedy diff with re-sync on the next identical line (edits here are sparse)
const hunks = []; let i = 0, j = 0;
while (i < A.length || j < B.length) {
  if (i < A.length && j < B.length && A[i] === B[j]) { i++; j++; continue; }
  let found = null;
  for (let d = 1; d < 400 && !found; d++) for (let a = 0; a <= d; a++) { const ii = i + a, jj = j + (d - a); if (ii < A.length && jj < B.length && A[ii] === B[jj] && A[ii].trim().length > 3) { found = [ii, jj]; break; } }
  if (!found) found = [A.length, B.length];
  hunks.push({a0: i, a1: found[0], b0: j, b1: found[1]}); [i, j] = found; }
const touched = new Map(); let ok = 0, skipped = 0;
// bottom-up, so applying one block never shifts the line numbers of the blocks above it
for (const h of hunks.slice().reverse()) {
  const bl0 = h.a0 + pre, bl1 = Math.max(h.a0, h.a1 - 1) + pre, k = partOf(bl0);
  if (h.a1 > h.a0 && partOf(bl1) !== k) { console.log('SKIP (spans two parts):', parts[k], h); skipped++; continue; }
  const lines = (touched.get(k) || srcs[k]).split('\n'), at = bl0 - starts[k];
  const oldBlock = A.slice(h.a0, h.a1).join('\n');
  if (lines.slice(at, at + (h.a1 - h.a0)).join('\n') !== oldBlock && h.a1 > h.a0) { console.log('SKIP (no match):', parts[k], h); skipped++; continue; }
  lines.splice(at, h.a1 - h.a0, ...B.slice(h.b0, h.b1));
  touched.set(k, lines.join('\n')); ok++;
}
console.log(`hunks applied ${ok}, skipped ${skipped}`);
// keep each file's own trailing-newline style
for (const [k, txt] of touched) { const raw = fs.readFileSync(appDir + parts[k], 'utf8'); fs.writeFileSync(appDir + parts[k], txt + (raw.endsWith('\n') ? '\n' : '')); console.log('wrote', parts[k]); }

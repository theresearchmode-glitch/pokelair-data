// One-off (Nov 18, split of the one-spelling fix): data/t keeps each Pokémon's key from the day its event was fetched, so 16
// teams in 16 events before Nov 9 still read an oddly spelled Mega Stone as the base form ("raichunite y" -> Raichu), while
// data/t2 (read with today's lkey) has the Mega. This re-keys those entries from data/t2 with names.mjs lkey, so usage, win rates,
// pairs and history (built from data/t) agree with matches.json and the sets page. Rows whose player or length differ are skipped.
// Run from the repo root: node experiments/rekey-t.mjs (dry run) or node experiments/rekey-t.mjs --write
import fs from 'node:fs'; const {lkey} = await import(process.cwd() + '/names.mjs');
const WRITE = process.argv[2] === '--write';
let files = 0, diffs = [], mism = 0;
for (const f of fs.readdirSync('data/t')) { const T = JSON.parse(fs.readFileSync('data/t/' + f)); let T2; try { T2 = JSON.parse(fs.readFileSync('data/t2/' + f)); } catch (e) { continue; }
  if (T.e.length !== T2.e.length) { mism++; continue; } let ch = 0;
  T.e.forEach((r, k) => { const dk = T2.e[k].dk || []; if (r[0] !== T2.e[k].nm || r[3].length !== dk.length) { if (r[3].length) mism++; return; }
    const nk = dk.map(m => lkey({name: m.n, item: m.i})); if (nk.some((x, j) => x !== r[3][j])) { ch++; diffs.push([f, k, r[3].filter((x, j) => x !== nk[j]).join(','), nk.filter((x, j) => x !== r[3][j]).join(','), T.d.slice(0, 10)]); r[3] = nk; } });
  if (ch) { files++; if (WRITE) fs.writeFileSync('data/t/' + f, JSON.stringify(T)); } }
console.log('files', files, 'entries', diffs.length, 'mismatch', mism); for (const d of diffs) console.log(d.join(' | '));

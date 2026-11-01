// Rebuilds the snapshot built into the page (PERF_RAW in app/src/data/data.js) from out/perf.json, so the fallback the
// page uses without its database is the same data the daily job makes, with each part's date.
// Usage: node experiments/build-perf-raw.mjs [perf.json]
import fs from 'node:fs';
const P = JSON.parse(fs.readFileSync(process.argv[2] || 'out/perf.json', 'utf8')), f = 'app/src/data/data.js', s = fs.readFileSync(f, 'utf8');
const keep = {updated: P.updated}; for (const k of ['tour', 'official', 'ladder', 'smogon', 'ingame', 'adj', 'outside']) if (P[k]) keep[k] = P[k];
const i = s.indexOf('const PERF_RAW='), j = s.indexOf('\n', i);
if (i < 0) throw new Error('PERF_RAW not found');
fs.writeFileSync(f, s.slice(0, i) + 'const PERF_RAW=' + JSON.stringify(keep) + ';' + s.slice(j));
console.log(`PERF_RAW: ${Object.keys(keep).join(', ')} (updated ${P.updated})`);

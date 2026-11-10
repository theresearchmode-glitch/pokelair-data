// Keeps every daily data document under the page's storage limit (262,144 bytes per document) without dropping anything.
// Nov 10: meta/results grew past it (263,734 bytes, about +3 KB a day) and the morning refresh was refused, so the site kept
// yesterday's winning cores and proven teams. Model (229 KB) and events (232 KB) were close behind.
// For each document the refresh writes, if its JSON is over LIMIT (200,000 bytes, leaving room to grow) it is split in two:
// whole top-level keys, or the tail of the biggest array, move to part 2 until part 1 fits. Both parts carry the same
// _part stamp; the page (03-persistence.js metaJoin) joins them back in order. Writes out/split/<doc>.json + <doc>_2.json and
// out/split/index.json (which documents are split, their sizes). The source files are not changed (tests read them as they are).
// Exits 1 (and the Data health step reports it) if a document would need more than two parts.
import fs from 'node:fs';
const LIMIT = 200000, HARD = 262144, B = x => Buffer.byteLength(JSON.stringify(x));
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
// the page document <- the file the morning refresh reads (same list as the refresh's step 3; results = limitless.json "results")
const DOCS = {results: () => (rd('limitless.json') || {}).results, doubles_tour: () => rd('meta_tour.json'), teams: () => rd('teams.json'), history: () => rd('history.json'),
  model: () => rd('model.json'), doubles: () => rd('meta_ladder.json'), doubles_ingame: () => rd('meta_ingame.json'), events: () => rd('events.json'), track: () => rd('track.json'),
  practice: () => rd('practice.json'), weekly: () => rd('weekly.json'), calendar: () => rd('calendar.json')};
export function split(doc, limit = LIMIT) {
  const a = {...doc}, b = {}; let guard = 0;
  while (B(a) > limit && guard++ < 200) {
    const keys = Object.keys(a).filter(k => k !== '_part').sort((x, y) => B(a[y]) - B(a[x])); const k = keys[0]; if (!k) break;
    const over = B(a) - limit, v = a[k];
    if (Array.isArray(v) && v.length > 1 && B(v) > over) { // move the tail of this array, just enough
      let n = Math.max(1, Math.ceil(v.length * over / B(v))); while (n < v.length && B(v.slice(0, v.length - n)) > B(v) - over - 2) n++;
      b[k] = v.slice(v.length - n).concat(b[k] || []); a[k] = v.slice(0, v.length - n);
    } else if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 1 && B(v) > over) { // move some keys of this object
      const inner = Object.keys(v).sort((x, y) => B(v[y]) - B(v[x])), keep = {...v}, mv = {}; for (const ik of inner) { if (B(keep) <= B(v) - over - 2) break; mv[ik] = keep[ik]; delete keep[ik]; }
      a[k] = keep; b[k] = {...(b[k] || {}), ...mv};
    } else { b[k] = v; delete a[k]; } }
  return {a, b};
}
// the page's join (kept identical to joinParts in app/src/app/03-persistence.js), used here to prove the split loses nothing
export function join(a, b) { const o = {...a}; for (const k in b) { if (k === '_part') continue; const x = o[k], y = b[k]; o[k] = Array.isArray(x) && Array.isArray(y) ? x.concat(y) : x && y && typeof x === 'object' && typeof y === 'object' && !Array.isArray(x) ? {...x, ...y} : y; } delete o._part; return o; }
// same content regardless of key order (moving a key to part 2 changes where it sits in the object, not what it holds)
export const canon = x => JSON.stringify(x, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(q => [q, v[q]])) : v);
if (process.argv[1] && process.argv[1].endsWith('split-docs.mjs')) {
  fs.rmSync('out/split', {recursive: true, force: true}); fs.mkdirSync('out/split', {recursive: true});
  const index = {limit: LIMIT, hard: HARD, made: new Date().toISOString(), split: {}, sizes: {}}; let bad = 0;
  for (const [name, get] of Object.entries(DOCS)) { const doc = get(); if (!doc || typeof doc !== 'object') continue; const n = B(doc); index.sizes[name] = n;
    if (n <= LIMIT) continue;
    const {a, b} = split(doc), id = `${name}-${index.made}`; a._part = {id, n: 1}; b._part = {id, n: 2};
    const same = canon(join(a, b)) === canon(doc), sa = B(a), sb = B(b);
    if (!same || sa > HARD || sb > HARD) { bad++; console.log(`::error::split-docs: ${name} (${n} bytes) can't be split into two parts that fit (${sa} + ${sb}, joins back the same: ${same})`); continue; }
    fs.writeFileSync(`out/split/${name}.json`, JSON.stringify(a)); fs.writeFileSync(`out/split/${name}_2.json`, JSON.stringify(b));
    index.split[name] = {bytes: n, parts: [sa, sb]}; console.log(`split-docs: ${name} ${n} bytes -> ${sa} + ${sb} (joins back identical)`); }
  fs.writeFileSync('out/split/index.json', JSON.stringify(index, null, 1));
  if (!Object.keys(index.split).length) console.log('split-docs: every document fits in one part');
  process.exit(bad ? 1 : 0);
}

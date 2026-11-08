// The sealed test set (Nov 8, foundation plan Phase 0). Writes out/matches_dev.json: out/matches.json without the sealed
// events (tournaments on or after experiments/sealed.json "from"), for every tuning experiment (MATCHES=out/matches_dev.json).
// Also says how many sealed games have built up so far, i.e. how precise an end-of-phase check would be today.
// Usage: node experiments/sealed.mjs
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), S = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8'));
const M = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8')), sealed = new Set(M.events.map((e, i) => [e, i]).filter(([e]) => e[1] >= S.from && !String(e[0]).startsWith('sd-')).map(([, i]) => i));
const keep = M.m.filter(g => !sealed.has(g[3])), sg = M.m.filter(g => sealed.has(g[3]) && g[2] !== .5);
fs.writeFileSync(ROOT + 'out/matches_dev.json', JSON.stringify({...M, m: keep, sealedFrom: S.from}));
// a pick rate of ~56% on n games is known to about ±1.96·√(p(1−p)/n)
const se = n => n ? (196 * Math.sqrt(.25 / n)).toFixed(1) : '—';
console.log(`sealed set: tournaments from ${S.from} · ${sealed.size} events, ${sg.length} decided games so far (a pick rate on them is good to about ±${se(sg.length)} pts)`);
console.log(`out/matches_dev.json written: ${keep.length} games (sealed games left out)`);
export {};

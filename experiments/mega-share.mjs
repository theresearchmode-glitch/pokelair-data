// How many Megas real tournament teams bring (Q13d, Nov 18): the same teams update.mjs counts (standard events of the active
// regulation, a full six, 3+ games), split by how many Mega options each six holds. update.mjs writes the same split to
// out/limitless.json as results.megaN = [0, 1, 2, 3+]; this re-counts it from data/ to check that number.
// Run: node experiments/mega-share.mjs
import fs from 'node:fs';
import {offFormat, oddEvents, activeReg, sameReg} from '../formats.mjs';
import {lmap} from '../names.mjs';
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const FORMAT = activeReg().id, index = readJSON('data/index.json', {tournaments: {}});
const KEEP0 = Object.keys(index.tournaments).filter(id => sameReg(index.tournaments[id], FORMAT) && !offFormat(index.tournaments[id].name)), ODD = oddEvents(KEEP0, id => readJSON(`data/t/${id}.json`, null));
const E = []; for (const id of KEEP0.filter(id => !ODD.has(id))) { const T = readJSON(`data/t/${id}.json`, null); if (!T) continue;
  for (const [, w, l, ks] of T.e) { const m = [...new Set(ks)]; if (m.length === 6 && w + l >= 3) E.push(m); } }
const MG = [0, 0, 0, 0]; let n6 = 0;
for (const ks of E) { const m = [...new Set(ks.map(lmap).filter(Boolean))]; if (m.length < 6) continue; n6++; MG[Math.min(3, m.filter(x => /-Mega/.test(x)).length)]++; }
const out = readJSON('out/limitless.json', {});
console.log(`teams ${E.length} (out/limitless.json: ${out.teams}); full sixes after names ${n6}; Megas 0/1/2/3+: ${MG.join(' / ')}; 2 Megas: ${(100 * MG[2] / n6).toFixed(1)}%`);
if (out.results && out.results.megaN) console.log(`out/limitless.json results.megaN: ${out.results.megaN.join(' / ')}`);

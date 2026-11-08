// Abilities test (Nov 8, Sim approved "all of your suggestions"): rebuild out/matches.json's game list with each player's
// ability as a set feature too ("Sneasler#Unburden"), from the stored team sheets, for the same events. Writes
// out/matches_ab.json (experiments only; the daily job is unchanged until the scoreboard says abilities help).
// Usage: node experiments/matches-ab.mjs
import fs from 'node:fs';
import {lkey, lmap} from '../names.mjs';
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const M0 = readJSON('out/matches.json'), ids = M0.events.map(e => e[0]);
const V2 = ids.map(id => { const T = readJSON(`data/t2/${id}.json`, null); return T ? {id, ...T} : null; }).filter(Boolean).sort((a, b) => new Date(a.d) - new Date(b.d));
const nameOf = m => lmap(lkey({name: m.n, item: m.i}));
const teamIx = new Map(), teams = [], players = new Map(), plist = [], M = [], featIx = new Map(), feats = [], deckIx = new Map(), decks = [];
const fix = f => { if (!featIx.has(f)) { featIx.set(f, feats.length); feats.push(f); } return featIx.get(f); };
const dix = (ns, dk) => { const f = []; dk.forEach((m, i) => { if (m.i) f.push(fix(ns[i] + '@' + m.i)); if (m.a) f.push(fix(ns[i] + '#' + m.a.replace(/\b\w/g, c => c.toUpperCase()))); for (const x of new Set(m.mv)) f.push(fix(ns[i] + ':' + x)); });
  const k = f.sort((a, b) => a - b).join(','); if (!deckIx.has(k)) { deckIx.set(k, decks.length); decks.push(f); } return deckIx.get(k); };
const tix = ns => { const k = [...ns].sort().join('|'); if (!teamIx.has(k)) { teamIx.set(k, teams.length); teams.push(k); } return teamIx.get(k); };
const pix = k => { if (!players.has(k)) { players.set(k, plist.length); plist.push(k); } return players.get(k); };
V2.forEach((T, ti) => { const P = readJSON(`data/p/${T.id}.json`, []); if (!P.length) return; const by = new Map();
  for (const p of T.e) { if (p.dk.length !== 6) continue; const ns = p.dk.map(nameOf); if (ns.some(n => !n)) continue; by.set(p.id, {t: tix(ns), pl: pix(p.id ? 'id:' + String(p.id).toLowerCase() : p.nm.toLowerCase().trim()), d: dix(ns, p.dk)}); }
  for (const [r, a, b, win] of P) { const A = by.get(a), B = by.get(b); if (!A || !B) continue; const res = win === a ? 1 : win === b ? 0 : .5; M.push([A.t, B.t, res, ti, A.pl, B.pl, r, A.d, B.d]); } });
fs.writeFileSync('out/matches_ab.json', JSON.stringify({updated: new Date().toISOString(), events: V2.map(T => [T.id, T.d.slice(0, 10), T.p]), teams, players: plist.length, feats, decks, m: M}));
console.log(`games ${M.length} (was ${M0.m.length}), events ${V2.length} (was ${M0.events.length}), features ${feats.length} (was ${M0.feats.length}), abilities ${feats.filter(f => f.includes('#')).length}`);

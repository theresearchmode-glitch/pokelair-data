// Player names out of every saved file (Sim, Nov 10: no real names stored; each player is an ID number, pid.mjs).
// Runs at the start of the daily job, before anything else reads the files: the first run converts what was saved before
// the switch; after that it finds nothing to change (safe to run any number of times). Needs NP_PID_KEY, like the downloads.
//   data/t, data/t2, data/p    Limitless standings, team sheets and pairings: the account becomes pid(account)
//   data/official, data/rk9    official events: the full name becomes an ID plus keyed name words (pk); country dropped;
//                              Liquipedia's page text replaced by its placements with keyed names
//   out/*.json                 any value that is a known name becomes that player's ID (teams, events, weekly, official)
// Prints counts only, never a name. `node scrub-names.mjs --check` changes nothing and exits 1 if anything is left.
import fs from 'node:fs';
import {pid, opid, okeys, isPid, hasKey} from './pid.mjs';
import {parseLiquipedia} from './official.mjs';

const CHECK = process.argv.includes('--check');
const J = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
let files = 0, values = 0; const left = {};
const save = (f, d, n) => { if (!n) return; values += n; files++; if (CHECK) left[f.replace(/\/[^/]+$/, '/*')] = (left[f.replace(/\/[^/]+$/, '/*')] || 0) + n; else fs.writeFileSync(f, JSON.stringify(d)); };
const list = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith('.json')).map(f => `${d}/${f}`) : [];
if (!hasKey()) { console.log('::error::scrub-names: NP_PID_KEY is missing (add it under the repository\'s Settings > Secrets and variables > Actions)'); process.exit(1); }

// every name we convert, mapped to its ID, for the out/ files built from them (display names map to the account's ID)
const lim = new Map(), off = new Map();
const L = (raw, id) => { const s = String(raw ?? '').trim(); if (s && !isPid(s)) lim.set(s.toLowerCase(), id); return id; };
const O = raw => { const s = String(raw ?? '').trim(); if (!s || isPid(s)) return s; const id = opid(s); off.set(s.toLowerCase(), id); return id; };

// Limitless (a pairing's winner is an account, or a result code: '0' a draw, '-1' no result; accounts can be short numbers)
const RESULT = new Set(['0', '-1']);
for (const f of list('data/t2')) { const d = J(f); if (!d || !Array.isArray(d.e)) continue; let n = 0;
  for (const p of d.e) { const acct = p.id || p.nm; const id = pid(acct); if (p.id !== id && p.id) { L(p.id, id); p.id = id; n++; } if (p.nm !== id && p.nm) { L(p.nm, id); p.nm = id; n++; } }
  save(f, d, n); }
for (const f of list('data/t')) { const d = J(f); if (!d || !Array.isArray(d.e)) continue; let n = 0;
  for (const r of d.e) if (r[0] && !isPid(r[0])) { r[0] = L(r[0], pid(r[0])); n++; } save(f, d, n); }
for (const f of list('data/p')) { const d = J(f); if (!Array.isArray(d)) continue; let n = 0;
  for (const r of d) { for (const k of [1, 2]) if (r[k] && !isPid(r[k])) { r[k] = pid(r[k]); n++; }
    if (r[3] != null && !isPid(r[3]) && !RESULT.has(String(r[3]))) { r[3] = pid(r[3]); n++; } }
  save(f, d, n); }

// official events (Victory Road cache, frozen RK9 files)
for (const f of [...list('data/official'), ...list('data/rk9')]) { const d = J(f); if (!d) continue; let n = 0;
  if (Array.isArray(d.teams)) for (const t of d.teams) { if (t.player && !isPid(t.player)) { t.pk = okeys(t.player); t.player = O(t.player); n++; } if ('country' in t) { delete t.country; n++; } }
  if (f.endsWith('liquipedia.json')) for (const k of Object.keys(d)) { const e = d[k]; if (e && e.wt) { const Q = parseLiquipedia(e.wt); e.q = {players: Q.players, sdate: Q.sdate, place: [...Q.place].map(([nm, r]) => [okeys(nm), r])}; delete e.wt; n++; } }
  save(f, d, n); }
// whole-field files: every map keyed by "name [cc]" (teams, records)
for (const f of list('data/rk9/field')) { const d = J(f); if (!d) continue; let n = 0;
  for (const key of Object.keys(d)) { const m = d[key]; if (!m || typeof m !== 'object' || Array.isArray(m)) continue; const ks = Object.keys(m); if (!ks.some(k => /\s\[[a-z]{2}\]$/i.test(k))) continue;
    const T = {}; for (const k of ks) { if (isPid(k)) { T[k] = m[k]; continue; } T[O(k.replace(/\s*\[[a-z]{2}\]\s*$/i, ''))] = m[k]; n++; } d[key] = T; }
  save(f, d, n); }

// out/: values equal to a converted name; an unknown name in a player field still becomes an ID (never left as text)
const PLAYER_KEYS = new Set(['player', 'who']);
const swap = (v, k, official) => { const s = String(v).trim(), low = s.toLowerCase();
  if (!s || isPid(s)) return null; if (official && off.has(low)) return off.get(low); if (lim.has(low)) return lim.get(low); if (off.has(low)) return off.get(low);
  return PLAYER_KEYS.has(k) ? (official ? opid(s) : pid(s)) : null; };
for (const f of ['out/teams.json', 'out/events.json', 'out/weekly.json', 'out/official.json']) { const d = J(f); if (!d) continue; let n = 0;
  const walk = (o, official) => { if (Array.isArray(o)) { o.forEach((x, i) => { if (typeof x === 'string' && i === 0 && o.length === 4 && Array.isArray(o[3])) { const r = swap(x, 'player', official); if (r) { o[0] = r; n++; } } else walk(x, official); }); return; }
    if (!o || typeof o !== 'object') return; const off2 = official || o.section === 'Official events' || o.src === 'official' || o.off === 1;
    for (const k of Object.keys(o)) { const v = o[k];
      if (typeof v === 'string' && PLAYER_KEYS.has(k)) { const r = swap(v, k, off2); if (r) { if (off2 && k === 'player' && f === 'out/official.json') o.pk = o.pk || okeys(v); o[k] = r; n++; } }
      else if (k === 'country' && off2) { delete o[k]; n++; }
      else if (typeof v === 'object') walk(v, off2); } };
  walk(d, f === 'out/official.json');
  // weekly "new in top cut" rows: [kind, Pokémon, item, count, event, player, place, day, size]
  if (f === 'out/weekly.json' && Array.isArray(d.fresh)) for (const r of d.fresh) if (Array.isArray(r) && typeof r[5] === 'string') { const x = swap(r[5], 'who', false); if (x) { r[5] = x; n++; } }
  // the official file's check notes used to name players ("#3 Name: ..."): keep the placement only
  if (f === 'out/official.json' && Array.isArray(d.checks)) for (const c of d.checks) for (const a of [c.flags, c.notes]) if (Array.isArray(a)) a.forEach((x, i) => { const m = String(x).match(/^(#\d+) (?!player:)[^:]+: (.*)$/); if (m && !/^#\d+ (sheet|Liquipedia)/.test(x)) { a[i] = `${m[1]}: ${m[2]}`; n++; } });
  save(f, d, n); }
{ const f = 'out/official_compare.json', d = J(f); let n = 0;
  if (d && Array.isArray(d.events)) for (const e of d.events) if (Array.isArray(e.examples)) e.examples.forEach((x, i) => { if (/^#\d+ player: (?!a different player$)/.test(x)) { e.examples[i] = x.replace(/^(#\d+) player: .*$/, '$1 player: a different player'); n++; } });
  save(f, d, n); }

if (CHECK) { console.log(values ? `scrub-names --check: ${values} names left in ${files} files: ${JSON.stringify(left)}` : 'scrub-names --check: no names left'); process.exit(values ? 1 : 0); }
console.log(values ? `scrub-names: ${values} names turned into IDs in ${files} files` : 'scrub-names: nothing to change');

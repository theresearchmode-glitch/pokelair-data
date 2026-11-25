// Switch-day regulation guard (Nov 24): checks every out/*.json file against activeReg().id.
// Replaces any file stamped with a different regulation (or unstamped after a switch) with its empty state.
// Never touches data/ (raw saved events).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {activeReg, readReg, SITE_REG} from './formats.mjs';

export const EXEMPT = new Set(['reg.json', 'calendar.json', 'skips.json', 'official_perf.json',
  /* every regulation's history in one file (job 8 byReg): emptying them would lose M-C's history for good (Scout's review, Nov 24) */
  'ratings_log.json', 'scoreboard.json']);

export function emptyFor(file, reg, sd = '', now = new Date().toISOString()) {
  const day = now.slice(0, 10);
  switch (file) {
    case 'limitless.json': return {reg, updated: now, tournaments: 0, teams: 0, games: 0, base: 0.5, adj: {label: '', rows: []}, tour: {label: '', split: true, updated: day, rows: [], megas: []}, results: {source: '', teams: 0, base: 0.5, minCore: 40, mons: {}, pairs: {}, cores: [], proven: [], records: []}};
    case 'meta_tour.json': return {reg, format: 'doubles', kind: 'tour', source: '', period: '', updated: now, note: '', top: [], more: []};
    case 'info.json': return {reg, N: 0, source: '', period: '', mv: {}, it: {}, ab: {}, ntN: 0, nt: {}};
    case 'teams.json': return {reg, source: '', updated: now, teams: []};
    case 'history.json': return {reg, days: []};
    case 'matches.json': return {reg, updated: now, events: [], teams: [], players: 0, feats: [], decks: [], m: []};
    case 'replays.json': return {reg, updated: now, format: sd, source: '', games: []};
    case 'replays_bo3.json': return {reg, updated: now, format: sd ? sd + 'bo3' : '', source: '', games: []};
    case 'practice.json': return {reg, updated: now, source: '', from: null, to: null, minR: 1300, roundR: 1450, dict: [], opp: [], rounds: []};
    case 'official.json': return {reg, updated: now, source: '', attribution: '', events: [], checks: []};
    case 'official_compare.json': return {reg, previous: 'none', events: [], pass: true, summary: 'regulation switched'};
    case 'events.json': return {reg, updated: now, source: '', dict: [], events: []};
    case 'weekly.json': return {reg, v: 1, updated: now, src: '', th: {}, a: {from: '', to: '', ev: 0, n: 0}, b: {from: '', to: '', ev: 0, n: 0}, enough: false, cutA: 0, up: [], down: [], top: [], tech: [], sty: {up: [], down: []}, styAll: [], fresh: []};
    case 'model.json': return {reg, updated: now, ships: false, games: 0, events: 0, mons: {}, pairs: {}, sets: {}, team: {}, sixes: {}, leads: {}};
    case 'meta_ladder.json': return {reg, format: 'doubles', kind: 'ladder', month: null, source: '', period: '', battles: 0, updated: now, note: '', top: [], more: [], usage1760: null};
    case 'meta_ingame.json': return {reg, format: 'doubles', kind: 'ingame', source: '', period: '', updated: now, top: [], more: []};
    case 'sources.json': return {reg, updated: now, problems: []};
    case 'perf.json': return {updated: day, reg: (() => { try { const r = activeReg(); return {id: reg, name: r.name, since: r.since}; } catch (e) { return {id: reg}; } })()}; /* the banner keeps its name and start date (Scout's review) */
    case 'crosscheck.json': return {reg, updated: now, checks: []};
    case 'ratings_log.json': return {reg, updated: now, days: []};
    case 'scoreboard.json': return {reg, updated: now, today: null, history: []};
    case 'track.json': return {reg, v: 1, updated: now, since: null, snaps: 0, last: null, top: 8, ev: [], mons: [], mb: [[0, 0], [0, 0], [0, 0], [0, 0]], fw: [], mv: null};
    default: return null;
  }
}

export function stampOf(doc) {
  if (!doc || typeof doc !== 'object') return null;
  if (typeof doc.reg === 'string' && doc.reg) return doc.reg;
  if (doc.reg && typeof doc.reg === 'object' && typeof doc.reg.id === 'string' && doc.reg.id) return doc.reg.id;
  return null;
}

export function guardOut({outDir = 'out', regFile = path.join(outDir, 'reg.json'), log = console.log} = {}) {
  const RG = activeReg(regFile), rawReg = readReg(regFile);
  const switched = !!(rawReg && rawReg.switched) || RG.id !== SITE_REG.id; /* not a hard-coded 'M-C' (Scout's review) */
  const lines = [], emptied = [], unknown = [];
  if (!fs.existsSync(outDir)) return {reg: RG.id, lines, emptied, unknown};
  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.json')).sort();
  for (const f of files) {
    if (EXEMPT.has(f)) { const ln = `ok ${f}`; lines.push(ln); log(ln); continue; }
    const empty = emptyFor(f, RG.id, RG.sd);
    if (!empty) { const ln = `unknown ${f}`; lines.push(ln); unknown.push(f); log(ln); continue; }
    const fp = path.join(outDir, f);
    let doc = null; try { doc = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
    const st = stampOf(doc);
    const bad = st ? st !== RG.id : switched;
    if (bad) {
      /* never lose data: the file is copied to out/archive/<its regulation>/ first (kept once; the page never reads archive/) */
      try { const ad = path.join(outDir, 'archive', st || (rawReg && rawReg.switched && rawReg.switched.from) || 'old'), af = path.join(ad, f); if (!fs.existsSync(af)) { fs.mkdirSync(ad, {recursive: true}); fs.copyFileSync(fp, af); } } catch (e) {}
      try { fs.writeFileSync(fp, JSON.stringify(empty)); } catch (e) { const ln = `could not empty ${f} (${e.message})`; lines.push(ln); log(ln); continue; } /* never stops the run */
      const ln = `emptied ${f} (was ${st || 'unstamped'})`;
      lines.push(ln); emptied.push(f); log(ln);
    } else {
      const ln = `ok ${f}`; lines.push(ln); log(ln);
    }
  }
  return {reg: RG.id, lines, emptied, unknown};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try { guardOut(); } catch (e) { console.log(`::warning::reg-guard: ${e.message}`); } /* the guard must never stop the daily job (Scout's review) */
}

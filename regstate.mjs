// Thin-data counts for the active regulation (Phase 0.8, Nov 24): writes out/regstate.json
// ({reg, day, events, players, games, since, updated}) so pages can show "Day N of Reg M-D: X events so far".
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {activeReg, readReg} from './formats.mjs';

const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };

export function buildRegState({regObj, rawReg, matches, today} = {}) {
  const RG = regObj || activeReg();
  const R = rawReg !== undefined ? rawReg : readReg();
  const d = today || new Date().toISOString().slice(0, 10);
  const since = (RG && RG.since) || d;
  const t0 = Date.parse(since + 'T12:00:00Z'), t1 = Date.parse(d + 'T12:00:00Z');
  const day = isFinite(t0) && isFinite(t1) ? Math.max(1, Math.floor((t1 - t0) / 864e5) + 1) : 1;
  const mOk = matches && (!matches.reg || matches.reg === RG.id);
  const seen = R && R.seen && R.seen[RG.id];
  const events = mOk && Array.isArray(matches.events) ? matches.events.length : (seen ? +seen.events || 0 : 0);
  const players = mOk && typeof matches.players === 'number' ? matches.players : (seen ? +seen.players || 0 : 0);
  const games = mOk && Array.isArray(matches.m) ? matches.m.length : 0;
  const updated = today ? `${today}T12:00:00.000Z` : new Date().toISOString();
  return {reg: RG.id, day, events, players, games, since, updated};
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const nowArg = (process.argv.find(x => x.startsWith('--now=')) || '').slice(6) || undefined;
  const out = buildRegState({matches: rd('out/matches.json'), today: nowArg});
  fs.writeFileSync('out/regstate.json', JSON.stringify(out));
  console.log(`regstate: ${out.reg} day ${out.day} (since ${out.since}), ${out.events} events, ${out.players} players, ${out.games} games`);
}

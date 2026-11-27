// Backup source coordinator for update.mjs (Job 17, off by default unless BACKUP_SOURCES=1).
// Reuses md-watch.mjs's 2-day stale alarm threshold and formats.mjs's strict regulation rules (never mixes regulations).
import {sameReg, offFormat} from '../formats.mjs';

const DAY = 864e5;
const normTitle = s => String(s || '').toLowerCase()
  .replace(/pok[eé]mon/g, '')
  .replace(/\bvgc\b/g, '')
  .replace(/championships?/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

// Detect whether the primary source (Limitless) is down, empty, or stale (>= staleDays old, matching md-watch.mjs's 2-day alarm).
export function primaryStatus({list, index, format, today, staleDays = 2}) {
  const todayIso = today || new Date().toISOString().slice(0, 10);
  const tours = (index && index.tournaments) || {};
  const dates = Object.values(tours)
    .filter(t => t && (!format || sameReg(t, format)))
    .map(t => String(t.d || '').slice(0, 10))
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  const newest = dates.length ? dates[dates.length - 1] : null;
  const ageDays = newest ? Math.floor((Date.parse(todayIso) - Date.parse(newest)) / DAY) : null;
  if (list === null) return {ok: false, reason: 'down', newest, ageDays};
  if (Array.isArray(list) && list.length === 0) return {ok: false, reason: 'empty', newest, ageDays};
  if (ageDays === null || ageDays >= staleDays) return {ok: false, reason: 'stale', newest, ageDays};
  return {ok: true, reason: 'ok', newest, ageDays};
}

// Prevent double-counting when the same event appears in two sources (e.g. Limitless + Victory Road):
// matches by exact id, OR normalized event name + date within 1 day (handles UTC vs local timezone shifts).
export function isDuplicateEvent(cand, existingIndex) {
  const tours = (existingIndex && existingIndex.tournaments) || {};
  if (!cand || !cand.id) return true;
  if (tours[cand.id]) return true;
  const cName = normTitle(cand.name);
  const cTime = Date.parse(String(cand.date || '').slice(0, 10) + 'T12:00:00Z');
  if (!cName || !isFinite(cTime)) return false;
  for (const t of Object.values(tours)) {
    if (!t || !t.name) continue;
    const tTime = Date.parse(String(t.d || '').slice(0, 10) + 'T12:00:00Z');
    if (!isFinite(tTime) || Math.abs(cTime - tTime) > DAY) continue;
    const tName = normTitle(t.name);
    if (!tName) continue;
    if (cName === tName || cName.includes(tName) || tName.includes(cName)) return true;
  }
  return false;
}

// Fetch normalized tournaments, standings, and pairings from ranked backup adapters.
// Returns {tournaments, standingsById, pairingsById, used, errors}.
export async function fetchBackupEvents({format, sdFormat, index, adapters, maxFetch = 20, fetchFn, log = console.log}) {
  const tournaments = [], standingsById = new Map(), pairingsById = new Map(), used = [], errors = [];
  const workingIndex = {tournaments: {...((index && index.tournaments) || {})}};
  let remaining = maxFetch;
  for (const adapter of adapters || []) {
    if (remaining <= 0) break;
    try {
      const rawList = await adapter.listTournaments({format, sdFormat, fetchFn});
      const valid = (Array.isArray(rawList) ? rawList : []).filter(t => {
        if (!t || !t.id || !t.date) return false;
        if (!sameReg({f: t.format || format, d: t.date}, format)) return false;
        if (offFormat(t.name)) return false;
        if (isDuplicateEvent(t, workingIndex)) return false;
        return true;
      }).slice(0, remaining);
      let added = 0;
      for (const t of valid) {
        try {
          const s = await adapter.getStandings(t, {fetchFn});
          if (!Array.isArray(s) || !s.length) continue;
          const p = adapter.getPairings ? await adapter.getPairings(t, {fetchFn}) : [];
          tournaments.push(t);
          standingsById.set(t.id, s);
          pairingsById.set(t.id, Array.isArray(p) ? p : []);
          workingIndex.tournaments[t.id] = {d: t.date, p: t.players, name: t.name, f: t.format || format};
          remaining--;
          added++;
        } catch (err) {
          errors.push(`${adapter.name}:${t.id}: ${err.message}`);
        }
      }
      if (added) used.push(`${adapter.name}(${added})`);
    } catch (err) {
      errors.push(`${adapter.name}: ${err.message}`);
      log(`::warning::backup source ${adapter.name} failed: ${err.message}`);
    }
  }
  return {tournaments, standingsById, pairingsById, used, errors};
}

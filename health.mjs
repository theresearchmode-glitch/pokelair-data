// Data health check, run last in the daily job: fails (so GitHub emails you) when a source has stopped updating.
// The data is already saved by then; this only raises the alarm. Daily sources may be 2 days old (op.gg and RK9 3);
// monthly ones (Smogon) 40 days past the end of their month. Then it prints the cross-check summary (crosscheck.mjs)
// and warns, without failing, when several staples disagree with an outside source.
import fs from 'node:fs';
const now = Date.now(), problems = [], DAY = 864e5;
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
// a date ("2026-10-31", an ISO time) or a month ("2026-09", counted from the end of that month)
const age = v => { const s = String(v || ''); if (/^\d{4}-\d{2}$/.test(s)) { const [y, m] = s.split('-').map(Number); return (now - Date.UTC(y, m, 1)) / DAY; } const t = Date.parse(s.length === 10 ? s + 'T12:00:00Z' : s); return isNaN(t) ? NaN : (now - t) / DAY; };
const old = (label, v, days) => { const a = age(v); if (!(a <= days)) problems.push(`${label}: ${isNaN(a) ? 'no date' : `data from ${String(v).slice(0, 10)}, ${Math.floor(a)} days old (limit ${days})`}`); };
const check = (file, label, days, field = 'updated') => { const d = rd(file); if (!d) { problems.push(`${label}: ${file} missing or unreadable`); return; } old(label, d[field], days); };
check('limitless.json', 'Limitless tournaments', 2);
check('meta_tour.json', 'Tournament sets', 2);
check('model.json', 'Win model', 2);
check('meta_ingame.json', 'op.gg in-game rankings', 3);
check('official.json', 'RK9 official events (top 64)', 3);
check('official_perf.json', 'RK9 official events (whole field)', 3);
check('meta_ladder.json', 'Smogon monthly ladder stats', 40, 'month');
check('sources.json', 'Outside sources', 2);
check('crosscheck.json', 'Cross-check', 2);
check('perf.json', 'Ratings inputs', 2);
check('ratings_log.json', 'Ratings snapshots', 2, 'updated');
check('events.json', 'Events', 3);
check('scoreboard.json', 'Ratings scoreboard', 3);
// every part of the ratings inputs, by the date of its own data
const PF = rd('perf.json');
if (PF) { const want = {tour: ['Limitless table', 2], adj: ['Limitless win shares', 2], ingame: ['op.gg order', 3], official: ['Official events table', 3], smogon: ['Smogon 1760+ usage', 40], prd: ['project-red-data replays', 2], ladder: ['Showdowntier ladder', 3]};
  for (const [k, [label, days]] of Object.entries(want)) { if (!PF[k]) { problems.push(`Ratings inputs: no ${label} (${k})`); continue; } old(`Ratings inputs, ${label}`, PF[k].updated, days); }
  for (const L of (PF.outside && PF.outside.lists) || []) old(`Outside tier list ${L.name}`, L.date, 3);
  if (!PF.outside) problems.push('Ratings inputs: no outside tier lists'); }
const S = rd('sources.json'); if (S && S.problems && S.problems.length) console.log(`::warning::Outside sources with problems today: ${S.problems.join(' | ')}`);
// the newest tournament should be recent too (catches Limitless returning nothing new)
try { const idx = JSON.parse(fs.readFileSync('data/index.json', 'utf8')); const last = Math.max(...Object.values(idx.tournaments).map(t => Date.parse(t.d)));
  if ((now - last) / DAY > 4) problems.push(`Limitless: newest tournament is ${Math.floor((now - last) / DAY)} days old`); } catch (e) { problems.push('Limitless index unreadable'); }
// cross-check summary
const X = rd('crosscheck.json');
if (X) for (const c of X.checks || []) { if (c.skipped) { console.log(`cross-check ${c.id}: skipped (${c.skipped})`); continue; }
  console.log(`cross-check ${c.id}: ${c.flagged} of ${c.rows.length} beyond tolerance${c.staplesFlagged.length ? ` · staples: ${c.staplesFlagged.join(', ')}` : ''}`);
  if (c.staplesFlagged.length > 3) console.log(`::warning::Cross-check ${c.id}: ${c.staplesFlagged.length} of the 12 most used Pokémon disagree with ${c.theirs} (${c.staplesFlagged.join(', ')}). Known differences: ${c.known}`); }
if (problems.length) { for (const p of problems) console.log(`::error::${p}`); process.exit(1); }
console.log('data health: all sources current');

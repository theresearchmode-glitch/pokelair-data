// Data health check, run last in the daily job: fails (so GitHub emails you) when a source has stopped updating.
// The data is already saved by then; this only raises the alarm.
import fs from 'node:fs';
const now = Date.now(), problems = [];
const check = (file, label, days, field = 'updated') => { let d; try { d = JSON.parse(fs.readFileSync('out/' + file, 'utf8')); } catch (e) { problems.push(`${label}: ${file} missing or unreadable`); return; }
  const t = Date.parse(d[field]); const age = (now - t) / 864e5; if (!(age <= days)) problems.push(`${label}: last updated ${isNaN(age) ? 'never' : Math.floor(age) + ' days ago'}`); };
check('limitless.json', 'Limitless tournaments', 2);
check('meta_tour.json', 'Tournament sets', 2);
check('model.json', 'Win model', 2);
check('meta_ingame.json', 'op.gg in-game rankings', 3);
check('official.json', 'RK9 official events', 3);
check('meta_ladder.json', 'Showdown ladder stats', 45);
check('perf.json', 'Ratings inputs (tournament table, in-game order)', 2);
check('ratings_log.json', 'Ratings snapshots', 2, 'updated');
check('events.json', 'Events', 3);
check('scoreboard.json', 'Ratings scoreboard', 3);
// the ratings inputs must actually carry both tables
try { const pf = JSON.parse(fs.readFileSync('out/perf.json', 'utf8')); if (!pf.tour) problems.push('Ratings inputs: no tournament table'); if (!pf.ingame) problems.push('Ratings inputs: no in-game order'); } catch (e) {}
// the newest tournament should be recent too (catches Limitless returning nothing new)
try { const idx = JSON.parse(fs.readFileSync('data/index.json', 'utf8')); const last = Math.max(...Object.values(idx.tournaments).map(t => Date.parse(t.d)));
  if ((now - last) / 864e5 > 4) problems.push(`Limitless: newest tournament is ${Math.floor((now - last) / 864e5)} days old`); } catch (e) { problems.push('Limitless index unreadable'); }
if (problems.length) { for (const p of problems) console.log(`::error::${p}`); process.exit(1); }
console.log('data health: all sources current');

// Data health gate, run last in the daily job, after the data is committed: good data is already saved, this only raises
// the alarm. It fails the job (GitHub emails the repo owner, and the "Daily data problem" issue is opened or refreshed by
// the next workflow step) when a file the page relies on is missing, unreadable, the wrong shape or size, or older than its
// limit. Each file is judged by the date of its own data, not the day the job ran:
//   daily sources (Limitless, tournament sets, top teams, win model, ratings inputs, weekly digest) 2 days;
//   op.gg, official events, events, the scoreboard and the event calendar 3 days; replays practice 4 days;
//   Smogon's monthly ladder stats 40 days past the end of their month.
// A single failed day therefore never alerts: the previous day's file is still within its limit. Two failed days in a row do.
// Then it prints the cross-check summary (crosscheck.mjs) and warns, without failing, when several staples disagree with an
// outside source.
// Output: the console (::error:: / ::warning:: lines), a table in the job summary ($GITHUB_STEP_SUMMARY), and the same text in
// $HEALTH_REPORT (a markdown file the issue step posts). Exit 1 when anything critical is wrong.
// Dry runs: node health.mjs [--root=<folder with out/ and data/>] [--now=2026-11-10]
import fs from 'node:fs'; import path from 'node:path';
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const ROOT = arg('root') || '.', now = arg('now') ? Date.parse(arg('now') + 'T12:00:00Z') : Date.now(), DAY = 864e5;
const problems = [], rows = [];
const size = f => { try { return fs.statSync(path.join(ROOT, 'out', f)).size; } catch (e) { return -1; } };
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
// a date ("2026-10-31", an ISO time) or a month ("2026-09", counted from the end of that month)
const age = v => { const s = String(v || ''); if (/^\d{4}-\d{2}$/.test(s)) { const [y, m] = s.split('-').map(Number); return (now - Date.UTC(y, m, 1)) / DAY; } const t = Date.parse(s.length === 10 ? s + 'T12:00:00Z' : s); return isNaN(t) ? NaN : (now - t) / DAY; };
const old = (label, v, days) => { const a = age(v); if (!(a <= days)) { problems.push(`${label}: ${isNaN(a) ? 'no date' : `data from ${String(v).slice(0, 10)}, ${Math.floor(a)} days old (limit ${days})`}`); return false; } return true; };
const arr = (x, min = 1) => Array.isArray(x) && x.length >= min;
// file, label, max age in days, where its data date is, size bounds (bytes), and a shape test (true = fine, or a reason)
const FILES = [
  ['limitless.json', 'Limitless tournaments', 2, d => d.updated, [50e3, 5e6], d => !!(d.results && typeof d.results === 'object' && d.adj && +d.teams > 0) || 'no results, win shares or team count'],
  ['meta_tour.json', 'Tournament sets', 2, d => d.updated, [5e3, 2e6], d => arr(d.top, 10) || 'fewer than 10 Pokémon'],
  ['teams.json', 'Top teams', 2, d => d.updated, [2e3, 2e6], d => arr(d.teams, 5) || 'fewer than 5 teams'],
  ['history.json', 'Usage history', 2, d => arr(d.days) && d.days[d.days.length - 1].d, [1e3, 2e6], d => arr(d.days, 2) || 'fewer than 2 days'],
  ['model.json', 'Win model', 2, d => d.updated, [5e3, 2e6], d => !!(d.mons && typeof d.mons === 'object') || 'no Pokémon'],
  ['meta_ingame.json', 'op.gg in-game rankings', 3, d => d.updated, [1e3, 1e6], d => arr(d.top, 10) || 'fewer than 10 Pokémon'],
  ['meta_ladder.json', 'Smogon monthly ladder stats', 40, d => d.month, [5e3, 2e6], d => arr(d.top, 10) || 'fewer than 10 Pokémon'],
  ['events.json', 'Events', 3, d => d.updated, [10e3, 5e6], d => arr(d.events, 5) || 'fewer than 5 events'],
  ['official.json', 'Official events (Victory Road + VR Pastes, top 64)', 3, d => d.updated, [1e3, 5e6], d => Array.isArray(d.events) || 'no event list'],
  ['perf.json', 'Ratings inputs', 2, d => d.updated, [5e3, 2e6], d => !!(d.tour && d.adj) || 'no Limitless table'],
  ['practice.json', 'Team preview practice', 4, d => d.updated, [5e3, 2e6], d => arr(d.rounds, 20) || 'fewer than 20 games'],
  ['weekly.json', 'This week vs last week', 2, d => d.updated, [200, 1e6], d => d.v === 1 || 'unknown version'],
  ['calendar.json', 'Event calendar', 3, d => d.checked || d.updated, [200, 1e6], d => Array.isArray(d.ev) || 'no event list'],
  ['track.json', 'Ratings track record', 2, d => d.updated, [200, 1e6], d => d.v === 1 || 'unknown version'],
  ['sources.json', 'Outside sources', 2, d => d.updated, [200, 2e6], () => true],
  ['crosscheck.json', 'Cross-check', 2, d => d.updated, [200, 2e6], d => Array.isArray(d.checks) || 'no checks'],
  ['ratings_log.json', 'Ratings snapshots', 2, d => d.updated, [200, 5e6], d => arr(d.days) || 'no snapshots'],
  ['scoreboard.json', 'Ratings scoreboard', 3, d => d.updated, [200, 2e6], () => true]];
for (const [file, label, days, dateOf, [lo, hi], shape] of FILES) {
  const n = size(file), d = n < 0 ? null : rd(file); let date = '', status = 'ok', why = '';
  if (n < 0) { status = 'missing'; why = 'file missing'; }
  else if (!d) { status = 'broken'; why = 'does not parse as JSON'; }
  else { try { date = String(dateOf(d) || ''); } catch (e) {} let s; try { s = shape(d); } catch (e) { s = 'unexpected shape'; }
    if (s !== true) { status = 'broken'; why = s; }
    else if (n < lo || n > hi) { status = 'broken'; why = `size ${(n / 1024).toFixed(1)} KB, expected ${(lo / 1024).toFixed(1)} KB – ${(hi / 1048576).toFixed(1)} MB`; } }
  if (status !== 'ok') problems.push(`${label}: ${file} ${why}`);
  else if (!old(label, date, days)) status = 'stale';
  const a = age(date); rows.push({label, file, date: date.slice(0, 10), age: isNaN(a) ? '' : Math.max(0, Math.floor(a)), days, status, why}); }
// official_perf.json (every team and match of the official events) is frozen since RK9 reads stopped on Nov 1: not checked
// for freshness; perf.mjs marks it frozen and the page drops it 28 days after its newest event.
// every part of the ratings inputs, by the date of its own data
const PF = rd('perf.json');
if (PF) { const want = {tour: ['Limitless table', 2], adj: ['Limitless win shares', 2], ingame: ['op.gg order', 3], official: ['Official events table (frozen)', 28], smogon: ['Smogon 1760+ usage', 40], ladder: ['Showdowntier ladder', 3]};
  for (const [k, [label, days]] of Object.entries(want)) { if (!PF[k]) { if (k === 'official') {} /* retired Nov 1 (RK9 terms): expected to be absent, no warning (Nov 7) */ else problems.push(`Ratings inputs: no ${label} (${k})`); continue; }
    if (k === 'official' && PF[k].frozen) { const a = age(PF[k].asOf || PF[k].updated); if (a > 21) console.log(`::warning::Ratings inputs: the frozen official-events table (newest event ${PF[k].asOf}) leaves the page in ${Math.max(0, Math.ceil(28 - a))} days; no permitted whole-field source yet`); continue; }
    old(`Ratings inputs, ${label}`, PF[k].updated, days); }
  for (const L of (PF.outside && PF.outside.lists) || []) old(`Outside tier list ${L.name}`, L.date, 3);
  if (!PF.outside) problems.push('Ratings inputs: no outside tier lists'); }
const S = rd('sources.json'); if (S && S.problems && S.problems.length) console.log(`::warning::Outside sources with problems today: ${S.problems.join(' | ')}`);
// the newest tournament should be recent too (catches Limitless returning nothing new while the file still gets a new date)
try { const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/index.json'), 'utf8')); const last = Math.max(...Object.values(idx.tournaments).map(t => Date.parse(t.d)));
  if ((now - last) / DAY > 4) problems.push(`Limitless: newest tournament is ${Math.floor((now - last) / DAY)} days old (limit 4)`); } catch (e) { problems.push('Limitless index (data/index.json) unreadable'); }
// the event calendar should list something still to come (catches Victory Road's calendar page changing shape)
{ const C = rd('calendar.json'); if (C && Array.isArray(C.ev)) { const today = new Date(now).toISOString().slice(0, 10);
  if (!C.ev.some(e => String(e.e || e.s || '') >= today)) problems.push('Event calendar: no upcoming events listed'); } }
// cross-check summary
const X = rd('crosscheck.json');
if (X) for (const c of X.checks || []) { if (c.skipped) { console.log(`cross-check ${c.id}: skipped (${c.skipped})`); continue; }
  if (c.id === 'official-vs-liquipedia') { console.log(`cross-check ${c.id}: ${c.flagged} of ${c.rows.length} events with a disagreement${c.flagged ? ' · ' + c.rows.filter(r => r.flags.length).map(r => `${r.n}: ${r.flags.slice(0, 3).join('; ')}`).join(' | ') : ''}`);
    if (c.staplesFlagged.length) console.log(`::warning::Official events: Liquipedia disagrees with Victory Road on placements or dates (${c.staplesFlagged.join(', ')}). See out/crosscheck.json.`); continue; }
  console.log(`cross-check ${c.id}: ${c.flagged} of ${c.rows.length} beyond tolerance${c.staplesFlagged.length ? ` · staples: ${c.staplesFlagged.join(', ')}` : ''}`);
  // infoOnly: two sources measuring different player groups (crosscheck.mjs) can't agree by design: information, not a warning
  if (c.infoOnly) { if (c.staplesFlagged.length) console.log(`cross-check ${c.id} (information, different player groups by design): ${c.staplesFlagged.length} staples differ`); continue; }
  if (c.staplesFlagged.length > 3) console.log(`::warning::Cross-check ${c.id}: ${c.staplesFlagged.length} of the 12 most used Pokémon disagree with ${c.theirs} (${c.staplesFlagged.join(', ')}). Known differences: ${c.known}`); }
// page storage limit (Nov 10): every document the morning refresh writes must fit in 262,144 bytes. split-docs.mjs splits any
// document over 200,000 bytes into two parts; alarm when a part (or an unsplit document) passes 240,000, before the refresh fails.
{ const X = rd('split/index.json');
  if (!X) problems.push('split-docs: out/split/index.json missing (the page-size guard did not run)');
  else { for (const [doc, n] of Object.entries(X.sizes || {})) { const sp = X.split && X.split[doc]; const parts = sp ? sp.parts : [n];
      parts.forEach((b, i) => { if (b > 240000) problems.push(`page storage: ${doc}${sp ? ' part ' + (i + 1) : ''} is ${b} bytes (limit 262,144; needs a third part or less data)`); }); }
    rows.push({label: 'Page storage (' + (Object.keys(X.split || {}).length ? 'split in two: ' + Object.entries(X.split).map(([d, v]) => `${d} ${v.parts.map(b => Math.round(b / 1024) + ' KB').join(' + ')}`).join(', ') : 'every document fits in one part') + ')', file: 'split/index.json', date: String(X.made || '').slice(0, 10), age: 0, days: 2, status: problems.some(p => p.startsWith('page storage')) ? 'broken' : 'ok', why: ''}); } }
// steps skipped two runs in a row (Nov 7): skip.mjs records every skipped step in out/skips.json. One flaky day stays quiet;
// the same step skipped today and yesterday is a step that has stopped working, so it raises the "Daily data problem" issue
// (the ratings snapshot failed quietly on Nov 6 because a skipped step only printed a warning).
{ const SK = rd('skips.json'), today = new Date(now).toISOString().slice(0, 10), yday = new Date(now - DAY).toISOString().slice(0, 10);
  const on = d => new Set(((SK && SK.runs) || []).filter(r => r.day === d).flatMap(r => r.steps || []));
  const t = on(today), y = on(yday); for (const st of t) if (y.has(st)) problems.push(`Daily job: the "${st}" step was skipped two days in a row (${yday} and ${today}); see the run log for why`); }
// the report: what's wrong first, then every file with its data date
const day = new Date(now).toISOString().slice(0, 10), ICON = {ok: '✅', stale: '🟠 stale', missing: '❌ missing', broken: '❌ broken'};
const md = [problems.length ? `## ❌ Daily data problem (${day})\n\nThe page keeps showing the last good data and says so on Home and Meta, but these need a look:\n\n${problems.map(p => `- ${p}`).join('\n')}\n`
  : `## ✅ Daily data healthy (${day})\n`,
  '| Source | File | Data date | Days old | Limit | Status |', '|---|---|---|---|---|---|',
  ...rows.map(r => `| ${r.label} | \`${r.file}\` | ${r.date || '—'} | ${r.age === '' ? '—' : r.age} | ${r.days} | ${ICON[r.status]}${r.why ? ' · ' + r.why : ''} |`),
  '', 'Good data from today was committed before this check ran; a broken source keeps its previous file.'].join('\n');
try { if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n'); } catch (e) {}
try { if (process.env.HEALTH_REPORT) fs.writeFileSync(process.env.HEALTH_REPORT, md + '\n'); } catch (e) {}
if (!process.env.GITHUB_STEP_SUMMARY) console.log('\n' + md + '\n');
if (problems.length) { for (const p of problems) console.log(`::error::${p}`); process.exit(1); }
console.log('data health: all sources current');

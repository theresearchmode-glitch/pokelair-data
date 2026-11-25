// Data health gate, run last in the daily job, after the data is committed: good data is already saved, this only raises
// the alarm. It fails the job (GitHub emails the repo owner, and the "Daily data problem" issue is opened or refreshed by
// the next workflow step) when a file the page relies on is missing, unreadable, the wrong shape or size, or older than its
// limit. Each file is judged by the date of its own data, not the day the job ran (see FRESHNESS_SPEC below for every out/
// file's limit and where each number comes from).
// A single failed day therefore never alerts: the previous day's file is still within its limit. Two failed days in a row do.
// Then it prints the cross-check summary (crosscheck.mjs) and warns, without failing, when several staples disagree with an
// outside source.
// Output: the console (::error:: / ::warning:: lines), a table + source-age summary line in the job summary
// ($GITHUB_STEP_SUMMARY), and the same text in $HEALTH_REPORT (a markdown file the issue step posts). Exit 1 when anything critical is wrong.
// Dry runs: node health.mjs [--root=<folder with out/ and data/>] [--now=2026-11-10]
import fs from 'node:fs'; import path from 'node:path';
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const ROOT = arg('root') || '.', now = arg('now') ? Date.parse(arg('now') + 'T12:00:00Z') : Date.now(), DAY = 864e5;
const problems = [], rows = [];
const statOf = f => { try { return fs.statSync(path.join(ROOT, 'out', f)); } catch (e) { return null; } };
const size = f => { const st = statOf(f); return st ? st.size : -1; };
const mtimeIso = f => { const st = statOf(f); return st ? new Date(st.mtimeMs).toISOString() : ''; };
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const RG = rd('reg.json'), RS = rd('regstate.json'), REG = (RG && RG.id) || 'M-C';
const regDay = (() => { if (RS && RS.reg === REG && typeof RS.day === 'number') return RS.day; const s = RG && RG.since; if (!s) return 999;
  const t0 = Date.parse(s + 'T12:00:00Z'); return isFinite(t0) ? Math.max(1, Math.floor((now - t0) / DAY) + 1) : 999; })();
const inLaunch = regDay >= 1 && regDay <= 14, todayIso = new Date(now).toISOString().slice(0, 10);
const stampOf = d => d && (typeof d.reg === 'string' ? d.reg : (d.reg && typeof d.reg.id === 'string' ? d.reg.id : null));
// a date ("2026-10-31", an ISO time) or a month ("2026-09", counted from the end of that month)
const age = v => { const s = String(v || ''); if (/^\d{4}-\d{2}$/.test(s)) { const [y, m] = s.split('-').map(Number); return (now - Date.UTC(y, m, 1)) / DAY; } const t = Date.parse(s.length === 10 ? s + 'T12:00:00Z' : s); return isNaN(t) ? NaN : (now - t) / DAY; };
const old = (label, v, days) => { const a = age(v); if (!(a <= days)) { problems.push(`${label}: ${isNaN(a) ? 'no date' : `data from ${String(v).slice(0, 10)}, ${Math.floor(a)} days old (limit ${days})`}`); return false; } return true; };
const arr = (x, min = 1) => Array.isArray(x) && x.length >= min;
const rlDays = d => d && (d.byReg ? d.byReg[REG] : d.days);

// One freshness table for EVERY out/ file:
// [file, label, maxDays, dateOf, [minBytes, maxBytes], shapeFn, thinRule, basis, opts]
//   basis: where maxDays comes from (daily job + 1d buffer, monthly Smogon lag, paused/frozen source, etc.)
//   opts: {paused?, frozen?, optional?, skipRegCheck?, noAgeCheck?}
const FILES = [
  ['reg.json', 'Active regulation', 2, d => d.checked, [40, 1e6], d => !!(d.id && d.since) || 'no regulation id/since', [40, d => !!d.id], 'daily reg.mjs + 1d buffer', {skipRegCheck: true}],
  ['regstate.json', 'Regulation day counts', 2, d => d.updated, [40, 1e5], d => typeof d.day === 'number' || 'no day count', [40, d => typeof d.day === 'number'], 'daily regstate.mjs + 1d buffer'],
  ['limitless.json', 'Limitless tournaments', 2, d => d.updated, [50e3, 5e6], d => !!(d.results && typeof d.results === 'object' && d.adj && +d.teams > 0) || 'no results, win shares or team count', [20, d => !!(d.results && typeof d.results === 'object' && d.adj)], 'daily update.mjs + 1d buffer'],
  ['meta_tour.json', 'Tournament sets', 2, d => d.updated, [5e3, 2e6], d => arr(d.top, 10) || 'fewer than 10 Pokémon', [20, d => Array.isArray(d.top)], 'daily update.mjs + 1d buffer'],
  ['info.json', 'Info sheets (moves/items/abilities/natures)', 2, (d, f) => d.updated || mtimeIso(f), [1e3, 5e6], d => !!(d.mv && typeof d.N === 'number') || 'missing mv/N', [20, d => !!(d.mv && typeof d.N === 'number')], 'daily update.mjs + 1d buffer'],
  ['teams.json', 'Top teams', 2, d => d.updated, [2e3, 2e6], d => arr(d.teams, 5) || 'fewer than 5 teams', [20, d => Array.isArray(d.teams)], 'daily update.mjs + 1d buffer'],
  ['history.json', 'Usage history', 2, d => (arr(d.days) && d.days[d.days.length - 1].d) || (inLaunch ? d.updated || (RG && RG.checked) || todayIso : ''), [1e3, 2e6], d => arr(d.days, 2) || 'fewer than 2 days', [20, d => Array.isArray(d.days)], 'daily update.mjs + 1d buffer'],
  ['matches.json', 'Game-level matches', 2, d => d.updated, [5e3, 20e6], d => Array.isArray(d.m) || 'no match array', [20, d => Array.isArray(d.m)], 'daily update.mjs + 1d buffer'],
  ['model.json', 'Win model', 2, d => d.updated, [5e3, 2e6], d => !!(d.mons && typeof d.mons === 'object') || 'no Pokémon', [80, d => !!(d.mons && typeof d.mons === 'object')], 'daily model.mjs + 1d buffer'],
  ['replays.json', 'Showdown ladder replays', 3, d => d.updated, [1e3, 15e6], d => Array.isArray(d.games) || Array.isArray(d) || 'no games list', [20, d => Array.isArray(d.games) || Array.isArray(d)], 'daily replays.mjs (optional step, 2d+1d buffer)', {optional: true}],
  ['replays_bo3.json', 'Showdown Bo3 replays', 4, d => d.updated, [100, 60e6] /* Nov 25: the real file is 30.3 MB on main; 15 MB failed every daily run */, d => Array.isArray(d.games) || Array.isArray(d) || 'no games list', [20, d => Array.isArray(d.games) || Array.isArray(d)], 'daily Bo3 replays (optional, lower volume)', {optional: true}],
  ['meta_ingame.json', 'op.gg in-game rankings (paused Nov 18: op.gg terms)', 9999, d => d.updated, [20, 1e6], d => Array.isArray(d.top) || 'no top list', [20, d => Array.isArray(d.top)], 'paused Nov 18 (op.gg terms)', {paused: true, skipRegCheck: true}],
  ['meta_ladder.json', 'Smogon monthly ladder stats', 40, d => d.month || (inLaunch ? d.updated || (RG && RG.checked) || todayIso : ''), [5e3, 2e6], d => arr(d.top, 10) || 'fewer than 10 Pokémon', [20, d => Array.isArray(d.top)], 'Smogon monthly dump (30d month + 10d publish lag)'],
  ['events.json', 'Events', 3, d => d.updated, [10e3, 5e6], d => arr(d.events, 5) || 'fewer than 5 events', [20, d => Array.isArray(d.events)], 'daily events.mjs (2d+1d buffer)'],
  ['official.json', 'Official events (Victory Road + VR Pastes, top 64)', 3, d => d.updated, [1e3, 5e6], d => Array.isArray(d.events) || 'no event list', [20, d => Array.isArray(d.events)], 'daily official.mjs (external Victory Road + Liquipedia)'],
  ['official_compare.json', 'Official events compare', 3, (d, f) => d.updated || mtimeIso(f), [40, 2e6], d => typeof d.pass === 'boolean' || 'no pass flag', [20, d => typeof d.pass === 'boolean'], 'daily official.mjs check', {optional: true}],
  ['official_perf.json', 'Official events whole-field (frozen Nov 1: RK9 terms)', 9999, (d, f) => d.updated || d.asOf || mtimeIso(f), [100, 5e6], d => typeof d === 'object' || 'unreadable', null, 'frozen Nov 1 (rk9.gg/terms 5.3)', {frozen: true, optional: true, skipRegCheck: true}],
  ['perf.json', 'Ratings inputs', 2, d => d.updated, [5e3, 2e6], d => !!(d.tour && d.adj) || 'no Limitless table', [20, d => !!(d.reg && d.reg.id === REG)], 'daily perf.mjs + 1d buffer'],
  ['practice.json', 'Team preview practice', 4, d => d.updated, [5e3, 2e6], d => arr(d.rounds, 20) || 'fewer than 20 games', [20, d => Array.isArray(d.rounds)], 'daily practice.mjs (needs replay volume, 4d limit)'],
  ['weekly.json', 'This week vs last week', 2, d => d.updated, [200, 1e6], d => d.v === 1 || 'unknown version', [20, d => d.v === 1], 'daily weekly.mjs + 1d buffer'],
  ['calendar.json', 'Event calendar', 3, d => d.checked || d.updated, [200, 1e6], d => Array.isArray(d.ev) || 'no event list', null, 'daily calendar.mjs (Victory Road season page)', {skipRegCheck: true}],
  ['track.json', 'Ratings track record', 2, d => d.updated, [200, 1e6], d => d.v === 1 || 'unknown version', [20, d => d.v === 1], 'daily track.mjs + 1d buffer'],
  ['sources.json', 'Outside sources', 2, d => d.updated, [200, 2e6], () => true, [20, () => true], 'daily sources.mjs (Showdowntier + Pikalytics)'],
  ['crosscheck.json', 'Cross-check', 2, d => d.updated, [200, 2e6], d => Array.isArray(d.checks) || 'no checks', [20, d => Array.isArray(d.checks)], 'daily crosscheck.mjs + 1d buffer'],
  ['ratings_log.json', 'Ratings snapshots', 2, d => d.updated, [200, 5e6], d => arr(rlDays(d)) || 'no snapshots', [20, d => Array.isArray(rlDays(d))], 'daily ratings-snapshot.mjs + 1d buffer', {skipRegCheck: true}],
  ['scoreboard.json', 'Ratings scoreboard', 3, d => d.updated, [200, 2e6], () => true, [20, () => true], 'daily scoreboard.mjs (2d+1d buffer)', {skipRegCheck: true}],
  ['post.json', 'News & Mystery Gifts', 3, d => d.checked || d.updated, [40, 1e6], d => typeof d === 'object' || 'unreadable', [40, d => typeof d === 'object'], 'daily post-news.mjs (on branches with post-news)', {optional: true, skipRegCheck: true, noAgeCheck: !fs.existsSync(new URL('./post-news.mjs', import.meta.url))} /* Nov 25: no job writes post.json on main yet, so its age can't fail the daily run until post-news.mjs is in this job */],
  ['skips.json', 'Skipped-step log', 9999, (d, f) => d.updated || mtimeIso(f), [2, 1e6], d => Array.isArray(d.runs) || 'no runs list', null, 'written only when a step skips', {optional: true, noAgeCheck: true, skipRegCheck: true}],
];

for (const [file, label, days, dateOf, [lo, hi], shape, thinRule, basis, opts = {}] of FILES) {
  const n = size(file), d = n < 0 ? null : rd(file); let date = '', status = 'ok', why = '';
  if (n < 0) {
    if (opts.optional) { rows.push({label, file, date: '', age: '', days, basis, status: 'absent', why: 'optional / not present'}); continue; }
    status = 'missing'; why = 'file missing';
  } else if (!d) { status = 'broken'; why = 'does not parse as JSON'; }
  else { try { date = String(dateOf(d, file) || ''); } catch (e) {} let s; try { s = shape(d); } catch (e) { s = 'unexpected shape'; }
    const st = stampOf(d);
    if (st && st !== REG && !opts.skipRegCheck) { status = 'broken'; why = `wrong regulation (${st}, expected ${REG})`; }
    else if (s === true && n >= lo && n <= hi) { /* ok */ }
    else if (inLaunch && thinRule && n >= thinRule[0] && n <= hi && thinRule[1](d) === true) { status = 'thin'; why = `day ${regDay} of ${REG}, data building`; }
    else if (s !== true) { status = 'broken'; why = s; }
    else { status = 'broken'; why = `size ${(n / 1024).toFixed(1)} KB, expected ${(lo / 1024).toFixed(1)} KB – ${(hi / 1048576).toFixed(1)} MB`; } }
  if (status !== 'ok' && status !== 'thin') problems.push(`${label}: ${file} ${why}`);
  else if (opts.paused) { status = 'paused'; why = why || basis; }
  else if (opts.frozen) { status = 'frozen'; why = why || basis; }
  else if (!opts.noAgeCheck && !old(label, date, days)) status = 'stale';
  const a = age(date); rows.push({label, file, date: date.slice(0, 10), age: isNaN(a) ? '' : Math.max(0, Math.floor(a)), days, basis, status, why}); }
// official_perf.json (every team and match of the official events) is frozen since RK9 reads stopped on Nov 1: not checked
// for freshness; perf.mjs marks it frozen and the page drops it 28 days after its newest event.
// every part of the ratings inputs, by the date of its own data
const PF = rd('perf.json');
if (PF) { const want = {tour: ['Limitless table', 2], adj: ['Limitless win shares', 2], ingame: ['op.gg order (paused Nov 18)', 9999], official: ['Official events table (frozen)', 28], smogon: ['Smogon 1760+ usage', 40], ladder: ['Showdowntier ladder', 3]};
  for (const [k, [label, days]] of Object.entries(want)) { if (!PF[k]) { if (k === 'official' || k === 'ingame' || inLaunch) {} /* retired Nov 1, paused Nov 18, or thin in first 14 days */ else problems.push(`Ratings inputs: no ${label} (${k})`); continue; }
    if (k === 'official' && PF[k].frozen) { const a = age(PF[k].asOf || PF[k].updated); if (a > 21) console.log(`::warning::Ratings inputs: the frozen official-events table (newest event ${PF[k].asOf}) leaves the page in ${Math.max(0, Math.ceil(28 - a))} days; no permitted whole-field source yet`); continue; }
    old(`Ratings inputs, ${label}`, PF[k].updated, days); }
  for (const L of (PF.outside && PF.outside.lists) || []) old(`Outside tier list ${L.name}`, L.date, 3);
  if (!PF.outside && !inLaunch) problems.push('Ratings inputs: no outside tier lists'); }
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
    const spDate = String(X.made || '').slice(0, 10), spStale = !old('Page storage (split/index.json)', X.made, 2), spAge = age(X.made);
    const spStatus = problems.some(p => p.startsWith('page storage')) ? 'broken' : spStale ? 'stale' : 'ok';
    rows.push({label: 'Page storage (' + (Object.keys(X.split || {}).length ? 'split in two: ' + Object.entries(X.split).map(([d, v]) => `${d} ${v.parts.map(b => Math.round(b / 1024) + ' KB').join(' + ')}`).join(', ') : 'every document fits in one part') + ')', file: 'split/index.json', date: spDate, age: isNaN(spAge) ? '' : Math.max(0, Math.floor(spAge)), days: 2, basis: 'daily split-docs.mjs + 1d buffer', status: spStatus, why: ''}); } }
// steps skipped two runs in a row (Nov 7): skip.mjs records every skipped step in out/skips.json. One flaky day stays quiet;
// the same step skipped today and yesterday is a step that has stopped working, so it raises the "Daily data problem" issue
// (the ratings snapshot failed quietly on Nov 6 because a skipped step only printed a warning).
{ const SK = rd('skips.json'), today = new Date(now).toISOString().slice(0, 10), yday = new Date(now - DAY).toISOString().slice(0, 10);
  const on = d => new Set(((SK && SK.runs) || []).filter(r => r.day === d).flatMap(r => r.steps || []));
  const t = on(today), y = on(yday); for (const st of t) if (y.has(st)) problems.push(`Daily job: the "${st}" step was skipped two days in a row (${yday} and ${today}); see the run log for why`); }
// One summary line listing every source's age (for the job summary)
const ageSummary = 'Source ages (days): ' + rows.filter(r => r.status !== 'absent').map(r => {
  const k = r.file.replace(/\.json$/, '');
  if (r.status === 'paused' || r.status === 'frozen') return `${k}=${r.age === '' ? '?' : r.age}d(${r.status})`;
  return `${k}=${r.age === '' ? '—' : r.age + 'd'}/${r.days >= 9999 ? '∞' : r.days + 'd'}`;
}).join(', ');
// the report: what's wrong first, then the one-line age summary, then every file with its data date and limit basis
const day = new Date(now).toISOString().slice(0, 10), ICON = {ok: '✅', thin: '🟡 thin', stale: '🟠 stale', paused: '⏸️ paused', frozen: '❄️ frozen', absent: '➖ optional', missing: '❌ missing', broken: '❌ broken'};
const md = [problems.length ? `## ❌ Daily data problem (${day})\n\nThe page keeps showing the last good data and says so on Home and Meta, but these need a look:\n\n${problems.map(p => `- ${p}`).join('\n')}\n`
  : `## ✅ Daily data healthy (${day})\n`,
  ageSummary, '',
  '| Source | File | Data date | Days old | Limit | Basis | Status |', '|---|---|---|---|---|---|---|',
  ...rows.map(r => `| ${r.label} | \`${r.file}\` | ${r.date || '—'} | ${r.age === '' ? '—' : r.age} | ${r.days >= 9999 ? 'paused/frozen' : r.days} | ${r.basis} | ${ICON[r.status]}${r.why ? ' · ' + r.why : ''} |`),
  '', 'Good data from today was committed before this check ran; a broken source keeps its previous file.'].join('\n');
try { if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n'); } catch (e) {}
try { if (process.env.HEALTH_REPORT) fs.writeFileSync(process.env.HEALTH_REPORT, md + '\n'); } catch (e) {}
if (!process.env.GITHUB_STEP_SUMMARY) console.log('\n' + md + '\n');
if (problems.length) { for (const p of problems) console.log(`::error::${p}`); process.exit(1); }
console.log('data health: all sources current');

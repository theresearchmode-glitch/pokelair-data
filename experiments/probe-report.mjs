// Prints a probe run's results as GitHub annotations (::notice::), readable through the API when logs and artifacts
// aren't reachable. Usage: node probe-report.mjs <topic> [log file]   (run from the folder holding out/)
import fs from 'node:fs';
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
const esc = s => String(s).replace(/%/g, '%25').replace(/\r/g, '').replace(/\n/g, '%0A');
const note = (title, lines) => console.log(`::notice title=${title}::${esc([].concat(lines).join('\n').slice(0, 3800))}`);
const t = process.argv[2];
if (t === 'log') { const L = fs.existsSync(process.argv[3]) ? fs.readFileSync(process.argv[3], 'utf8').split('\n').filter(Boolean) : ['(no log)']; for (let i = 0; i < L.length && i < 250; i += 25) note(`log ${process.argv[3].split('/').pop()} ${i / 25 + 1}`, L.slice(i, i + 25)); }
if (t === 'official') { const O = rd('official_perf.json'); if (!O) note('official', 'no official_perf.json'); else {
  note('official summary', [O.label, `teams ${O.teams}, matches ${O.matches}`, ...O.events.map(e => `${e.date} ${e.name}: ${e.lists}/${e.players} lists, ${e.matches} matches`), `waiting: ${O.waiting.join('; ')}`]);
  note('official top 40', O.rows.slice(0, 40).map(r => r.join(' | '))); } }
if (t === 'sources') { const S = rd('sources.json') || {}; note('sources problems', S.problems && S.problems.length ? S.problems : ['none']);
  for (const k of ['sdt', 'pika', 'prd']) { const s = S[k]; if (!s) { note(`source ${k}`, 'missing'); continue; }
    note(`source ${k}`, [`date ${s.date} ${s.dataDate ? 'dataDate ' + s.dataDate : ''} ${s.from ? s.from + '..' + s.to : ''} battles ${s.battles || ''} teams ${s.teams || ''} rows ${s.rows.length} unmapped ${(s.miss || []).join(', ')}`,
      ...s.rows.slice(0, 25).map(r => `${r.n} u=${r.u} w=${r.w ?? r.wr ?? ''} ${r.r || r.g || ''} ${r.tier || ''}`),
      ...(s.sets ? Object.entries(s.sets).slice(0, 8).map(([n, v]) => `${n}: it ${(v.it || []).map(x => x.join(' ')).join(', ')} | mv ${(v.mv || []).slice(0, 4).map(x => x.join(' ')).join(', ')}`) : [])]); } }
if (t === 'perf') { const P = rd('perf.json') || {}, ML = rd('meta_ladder.json');
  note('perf parts', Object.entries(P).map(([k, v]) => `${k}: ${v && typeof v === 'object' ? `${v.updated || ''} · ${v.label || ''} · ${(v.rows || v.names || v.lists || []).length}` : v}`));
  if (P.smogon) note('smogon 1760 top 20', P.smogon.rows.slice(0, 20).map(r => r.join(' ')));
  if (ML) note('meta_ladder', `${ML.month} ${ML.updated} usage1760 ${ML.usage1760 ? ML.usage1760.rows.length : 'none'}`);
  if (P.outside) note('outside', P.outside.lists.map(L => `${L.k} ${L.date} ${JSON.stringify(L.tiers)} ${JSON.stringify(Object.entries(P.outside.data[L.k]).slice(0, 25))}`)); }
if (t === 'cross') { const X = rd('crosscheck.json'); if (!X) note('cross', 'none'); else for (const c of X.checks.slice(0, 9)) {
  if (c.skipped) { note(`cross ${c.id}`, 'skipped: ' + c.skipped); continue; }
  note(`cross ${c.id}`, [`${c.flagged}/${c.rows.length} flagged; win avg ${JSON.stringify(c.winAverage)}; missing here ${JSON.stringify(c.missingHere)}`,
    ...c.rows.map(r => `${r.n} ours ${r.ours} theirs ${r.theirs} du ${r.du ?? ''} w ${r.wOurs ?? ''}/${r.wTheirs ?? ''} dw ${r.dw ?? ''} it ${r.itOurs ?? ''}/${r.itTheirs ?? ''} mv ${r.mvOurs ?? ''}/${r.mvTheirs ?? ''} ${r.flags.join(',')}`)]); } }

// Reg M-D watcher and Limitless alarm (Nov 24; game plan "watcher"). Read-only: it never changes the site or the data. Run daily by
// .github/workflows/md-watch.yml (and on demand); the workflow opens or closes the GitHub issues from the report this writes.
//   1. Reg M-D spotted: looks in three places, a few requests a day in all:
//      - Showdown: the raw config/formats.ts of smogon/pokemon-showdown (default branch) for a Champions format of the next regulation
//        ("Reg M-D" in a format name, or its id gen9championsvgc<year>regmd);
//      - Limitless: ONE page of the newest VGC tournaments (the API reg.mjs already uses; its limit is 50 requests per 5 minutes) for a
//        tournament whose format is the next regulation;
//      - the official news list (the in-game news feed post-news.mjs reads) for a title naming the next regulation.
//      Each place found gets its own issue "Reg M-D spotted: <where>", opened once (the workflow skips a title that exists, open or closed).
//   2. Limitless alarm: "Limitless data paused since <date>" when Limitless doesn't answer, or the newest saved tournament
//      (data/index.json) is 2+ days old; the workflow closes it when data flows again.
// The next regulation is worked out, not typed: formats.mjs nextRegIds(the active one) -> "M-D" today.
// Writes WATCH_REPORT (JSON, default watch-report.json): {next, spotted: [{where, title, body}], paused: null | {title, body}, notes}.
// Dry runs (no network for the faked part, nothing opened; WATCH_DRY=1 also prints each issue it WOULD open or close):
//   WATCH_FAKE_FOUND=showdown,limitless,news   pretend each place shows the next regulation
//   WATCH_FAKE_LIMITLESS=down | stale           pretend Limitless doesn't answer | its newest event is 5 days old
import fs from 'node:fs';
import {activeReg, nextRegIds, sdGuess, regName} from './formats.mjs';
import {FEED} from './post-news.mjs';
const UA = {'User-Agent': 'pokelair-data (personal team-builder stats)'}, out = process.env.WATCH_REPORT || 'watch-report.json';
const fake = new Set(String(process.env.WATCH_FAKE_FOUND || '').split(',').filter(Boolean)), fakeL = process.env.WATCH_FAKE_LIMITLESS || '';
async function get(url, json = true) { const c = new AbortController(), to = setTimeout(() => c.abort(), 30000);
  try { const r = await fetch(url, {headers: UA, signal: c.signal}); if (!r.ok) throw new Error(`${url} ${r.status}`); return json ? await r.json() : await r.text(); } finally { clearTimeout(to); } }
const act = activeReg(), next = nextRegIds(act.id)[0], today = new Date().toISOString().slice(0, 10), y = +today.slice(0, 4);
const R = {next: next || null, checked: today, spotted: [], paused: null, notes: []};
if (!next) { R.notes.push(`no next regulation after ${act.id}`); fs.writeFileSync(out, JSON.stringify(R, null, 1)); process.exit(0); }
const nextName = regName(next), ids = [y, y + 1].map(yr => sdGuess(next, yr)), letter = next.replace('-', ''); // "MD"
const nameRe = new RegExp(`Reg(ulation)?\\s*${next.replace('-', '\\s*-?\\s*')}\\b`, 'i');                          // Reg M-D, Regulation M-D
const spot = (where, detail, link) => R.spotted.push({where, title: `${nextName} spotted: ${where}`,
  body: `${detail}\n\n${link ? `Where: ${link}\n\n` : ''}Found by md-watch.mjs on ${today} (it only reads; nothing on the site or in the data changed). ` +
    `Next: docs/reg-md-plan.md Phase 1 (roster generator experiments/gen-roster.mjs, sprites experiments/add-sprites.mjs).`});
// 1a. Showdown's formats file (one request)
if (fake.has('showdown')) spot('Showdown', `FAKE (dry run): Showdown's formats list has "[Gen 9 Champions] VGC 2026 ${nextName}".`, 'https://github.com/smogon/pokemon-showdown/blob/master/config/formats.ts');
else try { const t = await get('https://raw.githubusercontent.com/smogon/pokemon-showdown/master/config/formats.ts', false);
  const lines = t.split('\n').filter(l => /name:\s*["']\[Gen 9 Champions\]/i.test(l) && (nameRe.test(l) || ids.some(i => l.toLowerCase().includes(i))));
  if (lines.length) spot('Showdown', `Showdown's formats list now has: ${lines.map(l => l.trim()).join(' | ')}`, 'https://github.com/smogon/pokemon-showdown/blob/master/config/formats.ts');
  else R.notes.push(`Showdown formats.ts: no ${nextName} format`); } catch (e) { R.notes.push(`Showdown formats.ts not read (${e.message})`); }
// 1b + 2. Limitless: one page of the newest tournaments (one request)
let list = null;
if (fakeL === 'down') R.notes.push('FAKE (dry run): Limitless did not answer');
else try { list = await get('https://play.limitlesstcg.com/api/tournaments?game=VGC&limit=100&page=1'); if (!Array.isArray(list)) throw new Error('not a list'); }
  catch (e) { R.notes.push(`Limitless not reached (${e.message})`); list = null; }
if (fake.has('limitless')) spot('Limitless', `FAKE (dry run): 3 Limitless VGC tournaments are marked ${next}.`, 'https://play.limitlesstcg.com/tournaments?game=VGC');
else if (list) { const md = list.filter(t => String(t && t.format || '').toUpperCase() === next);
  if (md.length) spot('Limitless', `${md.length} Limitless VGC tournament${md.length === 1 ? ' is' : 's are'} marked ${next}: ${md.slice(0, 5).map(t => `${t.name} (${String(t.date).slice(0, 10)}, ${t.players} players)`).join('; ')}`, 'https://play.limitlesstcg.com/tournaments?game=VGC');
  else R.notes.push(`Limitless: none of the newest ${list.length} tournaments is marked ${next}`); }
// 1c. the official news lists (two requests: the Champions in-game news feed post-news.mjs reads, and news.pokemon-home.com, where
//     the Dec 2 patch notes were posted); a post whose TITLE names the next regulation
const NEWS = [FEED, 'https://news.pokemon-home.com/en/json/list.json'];
if (fake.has('news')) spot('official news', `FAKE (dry run): the official news list has "Regulation ${next} begins …".`, 'https://news.pokemon-home.com/');
else { const hit = []; let n = 0;
  for (const u of NEWS) try { const f = await get(u), items = Array.isArray(f) ? f : (f && (f.data || f.list || f.items)) || []; n += items.length;
      for (const i of items) if (nameRe.test(String(i && i.title || ''))) hit.push({t: i.title, link: i.link || u}); }
    catch (e) { R.notes.push(`official news ${u} not read (${e.message})`); }
  if (hit.length) spot('official news', `The official news names ${nextName}: ${hit.slice(0, 3).map(h => `"${h.t}"`).join(' | ')}`, hit[0].link);
  else R.notes.push(`official news: ${n} posts in ${NEWS.length} lists, no title names ${nextName}`); }
// 2. Limitless alarm: no answer, or the newest saved tournament is 2+ days old
/* data/index.json is written by the daily job on main (the branch scheduled workflows run on); WATCH_INDEX reads another copy (tests) */
const IDX = process.env.WATCH_INDEX || 'data/index.json';
let newest = null; try { newest = Object.values(JSON.parse(fs.readFileSync(IDX, 'utf8')).tournaments || {}).map(t => String(t.d || '').slice(0, 10)).filter(Boolean).sort().pop() || null; } catch (e) {}
if (fakeL === 'stale') newest = new Date(Date.now() - 5 * 864e5).toISOString().slice(0, 10);
const age = newest ? Math.floor((Date.parse(today) - Date.parse(newest)) / 864e5) : null, down = fakeL === 'down' || !list;
if (down || age === null || age >= 2) { const since = newest || 'unknown';
  R.paused = {title: `Limitless data paused since ${since}`, body: `${down ? 'Limitless did not answer today (one request to its tournaments API).' : `No new Limitless event since ${since} (${age} days; the alarm starts at 2).`}` +
    `\n\nNewest saved tournament: ${since} (${IDX}). Checked ${today} by md-watch.mjs; this issue closes by itself when data flows again.` +
    `\nBackup plan: docs/rebuild/gameplan-detail-nov25.md (Limitless backup).`}; }
else R.notes.push(`Limitless: newest saved tournament ${newest} (${age} day${age === 1 ? '' : 's'} old)`);
fs.writeFileSync(out, JSON.stringify(R, null, 1));
console.log(`md-watch: next ${next}; spotted ${R.spotted.map(s => s.where).join(', ') || 'nothing'}; Limitless ${R.paused ? 'PAUSED' : 'ok'}`); R.notes.forEach(n => console.log('  ' + n));
if (process.env.WATCH_DRY === '1') { for (const s of R.spotted) console.log(`\n--- WOULD OPEN (once; skipped if an issue with this title exists): ${s.title}\n${s.body}`);
  console.log(R.paused ? `\n--- WOULD OPEN OR UPDATE: ${R.paused.title}\n${R.paused.body}` : '\n--- WOULD CLOSE any open "Limitless data paused since …" issue (data flows)'); }

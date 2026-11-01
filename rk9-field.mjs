// Official events, whole field (after rk9.mjs): every Masters team list and every Masters match of each finished Reg M-C
// Regional/International on RK9. From them, each Pokémon's share of teams and its match win rate across the whole field,
// the ratings' official-events row (out/official_perf.json; perf.mjs puts it in out/perf.json as "official").
//   data/rk9/field/<slug>.json  {slug, name, date, rid, pod, players, teams: {player key: [6 names]}, rec: {player key: [w, l, t]}, rounds}
// A finished event's lists and pairings don't change, so each is fetched once. Team lists are one request per player
// (RK9_FIELD_MAX per run, default 1500, about 30 minutes at RK9's pace); a big backlog finishes over the next runs.
// The top 64 already read by rk9.mjs are reused. Only events with 95%+ of their team lists read are counted.
import fs from 'node:fs';
import {get, readJSON, text, dec, parseTeam, parseRoster, pkey, callCount, REG_ACTIVE} from './rk9-lib.mjs';
import {inRegWindow} from './formats.mjs';
const MAX = +(process.env.RK9_FIELD_MAX || 1500), MIN_COVER = .95;
fs.mkdirSync('data/rk9/field', {recursive: true});
const index = readJSON('data/rk9/index.json', {events: {}});
const slugs = Object.keys(index.events).filter(s => index.events[s].done && !index.events[s].skip && inRegWindow(index.events[s].date, REG_ACTIVE)).sort((a, b) => (index.events[b].date || '') < (index.events[a].date || '') ? -1 : 1);
let fetched = 0;
const save = (f, F) => fs.writeFileSync(f, JSON.stringify(F));
// the VGC roster of an event: the one whose team lists hold six Pokémon (TCG and GO rosters are skipped)
async function findRoster(slug) {
  const ev = await get('/event/' + slug);
  for (const rid of [...new Set([...ev.matchAll(/href="\/roster\/([A-Za-z0-9-]+)"/g)].map(m => m[1]))]) {
    const r = await get('/roster/' + rid); if (!/\/teamlist\/public\//.test(r)) continue;
    const players = parseRoster(r); if (!players.length) continue;
    const t = parseTeam(await get(players[0].tl)); if (t.mons.length === 6) return {rid, players}; }
  return null; }
// every Masters match: rounds come from the pairings page's tabs, each round's tables from its own fragment
async function pairings(rid) {
  const main = await get('/pairings/' + rid);
  const pod = (main.match(/id="P(\d+)-tab"[^>]*>\s*Masters/) || [])[1]; if (pod == null) throw new Error('no Masters pairings');
  const rounds = Math.max(0, ...[...main.matchAll(new RegExp(`id="P${pod}R(\\d+)-tab"`, 'g'))].map(m => +m[1]));
  const rec = {}, add = (k, i) => { (rec[k] = rec[k] || [0, 0, 0])[i]++; }; let matches = 0, open = 0;
  for (let rnd = 1; rnd <= rounds; rnd++) { const h = await get(`/pairings/${rid}?pod=${pod}&rnd=${rnd}`);
    for (const blk of h.split(/<div class="row row-cols-3 match/).slice(1)) {
      const cells = [...blk.matchAll(/class="col-5 text-center player player([12])([^"]*)">([\s\S]*?)<\/div>/g)].map(m => {
        const nm = (m[3].match(/<span class="name">([\s\S]*?)<\/span>/) || [])[1]; if (!nm) return null;
        const t = text(nm).join(' '), c = t.match(/^(.*?)\s*\[([A-Za-z]{2,3})\]\s*$/);
        return {k: c ? pkey(c[1], c[2]) : pkey(t, ''), win: /\bwinner\b/.test(m[2]), lose: /\bloser\b/.test(m[2])}; }).filter(Boolean);
      if (cells.length !== 2) continue;  // a bye, or an empty table
      if (!/^[^"]*\bcomplete\b/.test(blk)) { open++; continue; }
      const [a, b] = cells; matches++;
      if (a.win && !b.win) { add(a.k, 0); add(b.k, 1); } else if (b.win && !a.win) { add(b.k, 0); add(a.k, 1); } else { add(a.k, 2); add(b.k, 2); } } }
  return {pod: +pod, rounds, rec, matches, open}; }
for (const slug of slugs) { const E = index.events[slug], f = `data/rk9/field/${slug}.json`; let F = readJSON(f, null);
  if (F && F.complete) continue;
  if (fetched >= MAX) { console.log(`rk9-field: ${slug} waits for the next run (budget ${MAX} used)`); continue; }
  try {
    const R = await findRoster(slug); if (!R) { console.log(`rk9-field: ${slug} has no VGC roster`); continue; }
    if (!F || F.rid !== R.rid) F = {slug, name: E.name, date: E.date, rid: R.rid, teams: {}};
    F.players = R.players.length;
    const keyOf = p => pkey(`${p.first} ${p.last}`, p.country), seen = new Map();
    for (const p of R.players) seen.set(keyOf(p), (seen.get(keyOf(p)) || 0) + 1);
    // the top 64 rk9.mjs already read (matched by standing)
    const top = readJSON(`data/rk9/${slug}.json`, {teams: []}), bySt = new Map(top.teams.map(t => [t.st, t]));
    for (const p of R.players) { const k = keyOf(p); if (seen.get(k) > 1 || F.teams[k]) continue; const t = bySt.get(p.st); if (t && t.mons.length === 6) F.teams[k] = t.mons.map(m => m.n || '?' + m.sp); }
    for (const p of R.players) { const k = keyOf(p); if (seen.get(k) > 1 || F.teams[k]) continue; if (fetched >= MAX) break;
      try { const t = parseTeam(await get(p.tl)); fetched++; if (t.mons.length === 6) F.teams[k] = t.mons.map(m => m.n || '?' + m.sp); else F.teams[k] = null; }
      catch (e) { console.log('rk9-field: list', k, e.message); if (/ 40[034]$/.test(e.message)) F.teams[k] = null; }  // a list RK9 doesn't serve isn't asked for again
      if (fetched % 50 === 0) save(f, F); }
    F.dupes = [...seen.values()].filter(v => v > 1).reduce((a, v) => a + v, 0);  // players sharing a name and country (left out)
    if (!F.rec) { const P = await pairings(R.rid); if (!P.open && P.matches) { F.rec = P.rec; F.pod = P.pod; F.rounds = P.rounds; F.matches = P.matches; } else console.log(`rk9-field: ${slug} pairings not final (${P.open} open, ${P.matches} done)`); }
    const read = Object.keys(F.teams).length;
    F.complete = !!F.rec && read >= R.players.length - F.dupes;
    save(f, F);
    console.log(`rk9-field: ${E.name} (${E.date}): ${read}/${R.players.length} lists, ${F.matches || 0} matches over ${F.rounds || 0} rounds${F.complete ? '' : ' (not finished yet)'}`);
  } catch (err) { console.log('rk9-field skip', slug, err.message); if (F) save(f, F); } }
// out/official_perf.json: the rating input, same rows as the other tournament tables: [name, % of teams, match win %, matches]
const evs = slugs.map(s => readJSON(`data/rk9/field/${s}.json`, null)).filter(F => F && F.rec && F.players && Object.values(F.teams).filter(Boolean).length >= MIN_COVER * F.players);
const U = {}, unk = new Set(); let N = 0, M = 0, matched = 0, withTeam = 0;
for (const F of evs) { M += F.matches;
  for (const [k, mons] of Object.entries(F.teams)) { if (!mons) continue; N++; const r = F.rec[k]; if (r) matched++;
    for (const n of new Set(mons)) { if (n[0] === '?') { unk.add(n.slice(1)); continue; } const o = U[n] = U[n] || [0, 0, 0, 0]; o[0]++; if (r) { o[1] += r[0]; o[2] += r[1]; o[3] += r[2]; } } }
  withTeam += Object.keys(F.rec).length; }
const rows = Object.entries(U).map(([n, [t, w, l, d]]) => { const g = w + l + d; return [n, +(100 * t / N).toFixed(2), g ? +(100 * (w + d / 2) / g).toFixed(1) : 0, g]; }).sort((a, b) => b[1] - a[1]);
const day = d => d, dates = evs.map(F => F.date).sort();
const out = {updated: new Date().toISOString(), events: evs.map(F => ({name: F.name, date: F.date, players: F.players, lists: Object.values(F.teams).filter(Boolean).length, matches: F.matches})),
  waiting: slugs.filter(s => !evs.some(F => F.slug === s)).map(s => index.events[s].name),
  label: evs.length ? `RK9 · ${evs.length} official VGC events (Regionals/Internationals, ${day(dates[0])} – ${day(dates[dates.length - 1])}), all ${N.toLocaleString('en-US')} Masters teams, ${M.toLocaleString('en-US')} matches` : '',
  teams: N, matches: M, split: true, rows, megas: []};
fs.writeFileSync('out/official_perf.json', JSON.stringify(out));
console.log(`rk9-field: ${evs.length} events counted, ${N} teams, ${M} matches, ${matched}/${N} teams found in the pairings, ${callCount()} requests this run${unk.size ? ', unmapped: ' + [...unk].join(', ') : ''}`);
console.log('rk9-field: top 8 ' + rows.slice(0, 8).map(r => `${r[0]} ${r[1]}% / ${r[2]}% of ${r[3]}`).join(' · '));

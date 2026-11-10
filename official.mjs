// Official events (step 4): open team sheets of finished official VGC events (Regionals, Internationals, Specials, Worlds)
// in the current regulation, Masters division only. Replaces rk9.mjs (RK9's terms, rk9.gg/terms 5.3, forbid automated
// data extraction). Sources, each read politely (our User-Agent, at most one request a second per site, cached):
//   Victory Road   victoryroad.pro, WordPress REST API: the event page lists Masters standings (placement, player,
//                  country, the six Pokémon) and links each team's open team sheet on VR Pastes
//   VR Pastes      vrpastes.com, Victory Road's paste site (robots.txt: Allow /, crawl-delay 1). Its pages fill in the team
//                  in the browser from the site's own JSON backend (vrpaste-backend.vercel.app/api/paste/<id>, no
//                  robots.txt), so that JSON is read, one paste a second: species, item, ability, nature, moves
//                  (open team sheets hide stat points). The server-rendered page is the fallback when it has the team.
//   Liquipedia     liquipedia.net/pokemon, MediaWiki API only (one batched query a run, 2 s apart, never HTML pages):
//                  checks placements, player count and start date. Text CC-BY-SA 3.0 (attribution in the output).
// Writes out/official.json (same shape rk9.mjs wrote: events[{name, date, players, teams[{player, st, mons[{n,i,a,nt,mv}]}]}]),
// puts each event's top 8 at the front of out/teams.json, keeps data/official/ (one file per event; pastes are read once),
// and out/official_compare.json (every run's check of the new output against the previous out/official.json).
// Fail-safe: if the new output disagrees with the previous file beyond the gate, or shrinks, the previous file is kept.
//   OFFICIAL_TOP    teams kept per event (default 64, as rk9.mjs)
//   OFFICIAL_CACHE  replay folder: answer requests from <dir>/<sha1(url)>.txt and never touch the network (tests)
import fs from 'node:fs'; import crypto from 'node:crypto';
import {readJSON, dec, ROSTER, mapMon, validItem, bad} from './names.mjs';
import {opid, okeys, keyScore} from './pid.mjs';
export const UA = 'NastyPlot data job (github.com/theresearchmode-glitch/pokelair-data; simran.jsbagga@gmail.com)';
const TOP = +(process.env.OFFICIAL_TOP || 64), REG = process.env.OFFICIAL_REG || 'M-C', REG_START = '2026-09-01', CACHE = process.env.OFFICIAL_CACHE || '';
const DIR = 'data/official', VR = 'https://victoryroad.pro/wp-json/wp/v2/pages', LQ = 'https://liquipedia.net/pokemon/api.php';
const GAP = {'victoryroad.pro': 1100, 'www.vrpastes.com': 1100, 'vrpaste-backend.vercel.app': 1100, 'liquipedia.net': 2100}, GAP0 = process.env.GAP != null ? +process.env.GAP : null;  /* GAP=0 only for the offline stress test */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const last = {}; let calls = 0;
const key = u => crypto.createHash('sha1').update(u).digest('hex').slice(0, 24) + '.txt';
// one request at a time per site, GAP ms apart; 429/5xx wait (Retry-After when given) and retry twice
async function get(url) {
  if (CACHE) { const f = `${CACHE}/${key(url)}`; if (!fs.existsSync(f)) throw new Error('not in cache: ' + url); return fs.readFileSync(f, 'utf8'); }
  const host = new URL(url).host, wait = (last[host] || 0) + (GAP0 != null ? GAP0 : GAP[host] || 1100) - Date.now(); if (wait > 0) await sleep(wait);
  for (let k = 0; k < 3; k++) { last[host] = Date.now(); calls++;
    const r = await fetch(url, {headers: {'User-Agent': UA, 'Accept-Encoding': 'gzip'}});
    if (r.ok) return r.text();
    if (r.status === 429 || r.status >= 500) { await sleep(Math.min(120, +(r.headers.get('retry-after') || 30)) * 1000); continue; }
    throw new Error(url + ' ' + r.status); }
  throw new Error(url + ' failed'); }
const strip = h => dec(String(h || '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
// "2027 Puebla Regional Championships" -> the official name "2027 Puebla Pokémon Regional Championships"
const offName = t => t.replace(/ (Regional|International|Special|World) Championships$/, ' Pokémon $1 Championships');
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
// "24–25 October 2026", "31 October – 1 November 2026", "7 March 2027" -> first day, YYYY-MM-DD
export function startDate(s) { const m = String(s).replace(/\s+/g, ' ').match(/^(\d{1,2})(?: ([A-Za-z]+))?(?: ?[–-] ?\d{1,2})?(?: ([A-Za-z]+))? (\d{4})/); if (!m) return null;
  const mo = MONTHS.indexOf((m[2] || m[3] || '').toLowerCase()); if (mo < 0) return null;
  let y = +m[4]; if (m[2] && m[3] && mo > MONTHS.indexOf(m[3].toLowerCase())) y--;  // "30 December – 2 January 2027"
  return `${y}-${String(mo + 1).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`; }
// A Victory Road event page: infobox facts and the Masters standings (every table before the Seniors/Juniors part)
export function parseEventPage(html) {
  const info = {}; for (const m of html.matchAll(/<tr><th[^>]*>([^<]+)<\/th><th[^>]*>([\s\S]*?)<\/th><\/tr>/g)) info[strip(m[1])] = strip(m[2]);
  const cut = html.search(/<h[1-4][^>]*>[^<]*(?:<[^>]+>)*[^<]*(Senior|Junior)/); const M = cut > 0 ? html.slice(0, cut) : html;
  const rows = new Map();
  for (const t of M.matchAll(/<table class="infobox2[^"]*">([\s\S]*?)<\/table>/g)) {
    const head = strip((t[1].match(/<thead>([\s\S]*?)<\/thead>/) || [])[1]); if (!/Player/.test(head) || !/Team/.test(head) || !/OTS/.test(head)) continue;
    for (const r of t[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)) { const td = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(x => x[1]); if (td.length < 7) continue;
      const st = parseInt(strip(td[0]), 10); if (!(st > 0) || rows.has(st)) continue;
      rows.set(st, {st, rec: strip(td[1]), country: (td[2].match(/title="([^"]+)"/) || [])[1] || '', player: strip(td[3].split(/<br\s*\/?>/)[0]),
        sprites: [...td[5].matchAll(/<img [^>]*title="([^"]+)"[^>]*class="champsprite"/g)].map(x => dec(x[1])), paste: ((td[6].match(/vrpastes\.com\/([A-Za-z0-9_-]+)/) || [])[1]) || null}); } }
  const ma = s => { const m = String(s || '').match(/([\d,]+)\s*(?:players\s*)?\(?MA\b/); return m ? +m[1].replace(/,/g, '') : null; };
  return {info, date: startDate(info.Date || ''), masters: ma(info.Attendance), capacity: ma(info.Capacity), game: info.Videogame || '', season: info.Season || '', rows: [...rows.values()].sort((a, b) => a.st - b.st)}; }
// The six Pokémon from the event page's sprite titles ("Charizard Mega Y", "Arcanine Hisui", "Kommo O") as roster names
export function spriteName(t) { const s = String(t).trim(), d = s.replace(/ /g, '-');
  for (const c of [d, d.replace(/-O$/, '-o'), d.replace(/-Mega-?([XYZ])?$/, (_, x) => '-Mega' + (x ? '-' + x : ''))]) if (ROSTER.has(c)) return c;
  const b = s.split(' ')[0]; return ROSTER.has(b) ? b : null; }
const NATURES = new Set(['Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty', 'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax', 'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive', 'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash', 'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky']);
// A VR Pastes open team sheet (server-rendered HTML): per Pokémon the item and species images, "Ability:", four moves
// (each after its type icon), the nature. Returns null when the page has no team yet (a client-side loading shell).
export function parsePaste(html) {
  const t = dec(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<img[^>]*alt="([^"]*)"[^>]*src="[^"]*\/(items|pokemons|pokemon|types)\/[^"]*"[^>]*>/g, '\n\u0001$2:$1\n').replace(/<[^>]+>/g, '\n')).split('\n').map(s => s.trim()).filter(Boolean);
  const mons = []; let item = '';
  for (let i = 0; i < t.length; i++) {
    if (t[i].startsWith('\u0001items:')) { item = t[i].slice(7); continue; }
    if (!/^\u0001pokemons?:/.test(t[i])) continue;
    const sp = t[i].replace(/^\u0001pokemons?:/, ''); let j = i + 1, a = '', nt = ''; const mv = [];
    if (t[j] === 'Ability:') { a = t[j + 1] || ''; j += 2; }
    for (; j < t.length && !/^\u0001(pokemons?|items):/.test(t[j]); j++) {
      if (t[j].startsWith('\u0001types:')) { if (mv.length < 4 && t[j + 1] && t[j + 1][0] !== '\u0001') mv.push(t[++j]); continue; }
      if (NATURES.has(t[j]) && !nt) { nt = t[j]; break; } }
    mons.push({sp, it: item, n: mapMon(sp, item), i: validItem(item), a, nt, mv}); item = ''; i = j; }
  const title = strip((html.match(/<title>([^<]*)/) || [])[1]);
  return mons.length === 6 && mons.every(m => m.a && m.mv.length) ? {title, mons} : null; }
// The same sheet from VR Pastes' JSON backend: {teams: [{species, item, ability, nature, moves}]}
export function parsePasteJson(j) { const T = j && Array.isArray(j.teams) ? j.teams : [];
  const mons = T.map(t => ({sp: t.species || t.name, it: t.item || '', n: mapMon(t.species || t.name, t.item || ''), i: validItem(t.item), a: t.ability || '', nt: t.nature || '', mv: (t.moves || []).filter(Boolean).slice(0, 4)}));
  return mons.length === 6 && mons.every(m => m.a && m.mv.length) && !j.is_encrypted ? {title: j.title || '', mons} : null; }
async function readPaste(id) { let X = null;
  try { X = parsePasteJson(JSON.parse(await get(`https://vrpaste-backend.vercel.app/api/paste/${id}?lang=english`))); } catch (e) { console.log(`official: paste ${id} (JSON) ${e.message}`); }
  if (!X) { try { X = parsePaste(await get(`https://www.vrpastes.com/${id}`)); } catch (e) {} }
  return X; }
// ---- Liquipedia: placements, player count and start date (wikitext through the API) ----
const lqTitle = name => { const m = name.match(/^(\d{4}) (.+?) (Regional|International|Special|World) Championships$/); if (!m) return null;
  return `Pokemon_Championships/${m[3] === 'World' ? 'World' : m[3]}/${m[2].replace(/ /g, '_')}/${m[1]}/VGC`; };
export function parseLiquipedia(wt) {
  const g = k => (wt.match(new RegExp(`\\|${k}=([^\\n|]*)`)) || [])[1] || null;
  const place = new Map(), norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const part of wt.split('{{Slot|place=').slice(1)) { const m = part.match(/^(\d+)(?:-(\d+))?/); if (!m) continue;
    for (const o of part.split(/\{\{Slot\||\n==/)[0].matchAll(/\{\{Opponent\|([^|}]+)/g)) place.set(o[1].trim(), [+m[1], +(m[2] || m[1])]); }
  // top cut from the bracket: the last round is the final; the round before, the semifinals
  const R = {}; for (const m of wt.matchAll(/\|R(\d+)M(\d+)=\{\{Match([\s\S]*?)\n\}\}/g)) { const os = [...m[3].matchAll(/opponent\d=\{\{SoloOpponent\|([^|}]+)[^}]*?score=([^|}]*)/g)].map(x => [x[1].trim(), x[2].trim()]);
    if (os.length === 2) (R[+m[1]] = R[+m[1]] || []).push(os); }
  const win = ([a, b]) => { const s = x => x[1] === 'w' ? 1e3 : x[1] === 'l' ? -1 : +x[1] || 0; return s(a) > s(b) ? [a[0], b[0]] : s(b) > s(a) ? [b[0], a[0]] : null; };
  const rs = Object.keys(R).map(Number).sort((a, b) => b - a);
  if (rs.length >= 2 && R[rs[0]].length === 1) { const f = win(R[rs[0]][0]); if (f) { place.set(f[0], [1, 1]); place.set(f[1], [2, 2]); }
    if (R[rs[1]].length === 2) for (const m of R[rs[1]]) { const w = win(m); if (w) place.set(w[1], [3, 4]); }
    if (rs.length >= 3 && R[rs[2]].length === 4) for (const m of R[rs[2]]) { const w = win(m); if (w && !place.has(w[1])) place.set(w[1], [5, 8]); } }
  return {players: g('player_number') ? +g('player_number') : null, sdate: g('sdate'), place}; }
// ---- the run ----
const nkey = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
// The same person written two ways (pid.mjs keyScore): player names are never stored (Sim, Nov 10), only an ID and keyed
// versions of the name's words, which still tell two spellings of one person apart from two people. Used only next to
// another key (same placement, or best of a list). a and b: a name (in memory, straight from a download) or stored keys.
export const personScore = (a, b) => keyScore(a, b);
export const samePerson = (a, b) => personScore(a, b) > 0;
// the best match among [keys, value] pairs (highest score), or undefined
export const findPerson = (pairs, name, min = 1) => { let best, bs = min - 1; for (const [k, v] of pairs) { const sc = personScore(k, name); if (sc > bs) { bs = sc; best = v; } } return best; };
// Liquipedia's page reduced to what the checks use, with names turned into keys (the page text itself is not kept)
const lqStore = Q => ({players: Q.players, sdate: Q.sdate, place: [...Q.place].map(([n, r]) => [okeys(n), r])});
async function run() {
  fs.mkdirSync(DIR, {recursive: true});
  const index = readJSON(`${DIR}/index.json`, {events: {}});
  const now = new Date(), season = now.getUTCMonth() >= 8 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  // 1) the season's event pages (one request); only new or edited pages are read again
  let list; try { list = JSON.parse(await get(`${VR}?search=${season}&per_page=100&_fields=id,slug,modified,title`)); if (!Array.isArray(list)) throw new Error('not a page list'); }
  catch (e) { console.log(`::warning::official: Victory Road page list unavailable (${e.message}); kept the previous out/official.json`); return; }
  const pages = list.map(p => ({slug: p.slug, modified: p.modified, title: strip(p.title && p.title.rendered)})).filter(p => /^\d{4} .+ (Regional|International|Special|World) Championships$/.test(p.title));
  for (const p of pages) { const E = index.events[p.slug];
    if (E && E.modified === p.modified && (E.done || E.skip || !E.failed)) continue;  /* unchanged page: read again only to retry failed pastes */
    try { const j = JSON.parse(await get(`${VR}?slug=${p.slug}&_fields=id,slug,modified,title,content`))[0]; if (!j) continue;
      const P = parseEventPage(j.content.rendered);
      const base = {title: p.title, name: offName(p.title), modified: p.modified, date: P.date, players: P.masters};
      if (!/Champions/.test(P.game) || !new RegExp(`Regulation Set ${REG}\\b`).test(P.season)) { index.events[p.slug] = {...base, skip: `not Pokémon Champions Reg ${REG}`}; continue; }
      if (!P.date || P.date < REG_START) { index.events[p.slug] = {...base, skip: 'before Reg ' + REG}; continue; }
      const rows = P.rows.filter(r => r.st <= TOP);
      if (rows.length < Math.min(TOP, 16) || !rows.every(r => r.paste)) { index.events[p.slug] = {...base, done: false, note: `no Masters standings with team sheets yet (${rows.length} rows)`}; continue; }
      // pastes: read once each; a team keeps its parsed sheet while its paste link is unchanged
      const prev = readJSON(`${DIR}/${p.slug}.json`, {teams: []}), had = new Map(prev.teams.map(t => [t.paste, t]));
      const teams = []; let failed = 0;
      for (const r of rows) { let T = had.get(r.paste);
        if (!T) { const X = await readPaste(r.paste); if (X) T = {mons: X.mons}; else console.log(`official: paste ${r.paste} (${p.slug} #${r.st}) not readable yet`); }
        if (!T) { failed++; continue; }
        teams.push({st: r.st, player: opid(r.player), pk: okeys(r.player), rec: r.rec, paste: r.paste, sprites: r.sprites.map(spriteName), mons: T.mons}); }
      fs.writeFileSync(`${DIR}/${p.slug}.json`, JSON.stringify({slug: p.slug, name: base.name, date: P.date, players: P.masters, capacity: P.capacity, teams}));
      index.events[p.slug] = {...base, done: !failed, teams: teams.length, failed};
      console.log(`official: ${base.name} (${P.date}), ${P.masters} Masters, ${teams.length}/${rows.length} team sheets${failed ? `, ${failed} to retry next run` : ''}`);
    } catch (e) { console.log(`official: ${p.slug} skipped: ${e.message}`); } }
  fs.writeFileSync(`${DIR}/index.json`, JSON.stringify(index));
  // 2) Liquipedia check, one batched API query for the events not yet confirmed (an event is re-checked for 14 days)
  const evSlugs = Object.keys(index.events).filter(s => index.events[s].teams && !index.events[s].skip);
  const lq = readJSON(`${DIR}/liquipedia.json`, {});
  const want = evSlugs.filter(s => { const L = lq[s]; return !L || (!L.missing && (Date.now() - Date.parse(index.events[s].date + 'T12:00:00Z')) / 864e5 < 14 && L.fetched !== now.toISOString().slice(0, 10)); });
  const titles = new Map(want.map(s => [lqTitle(index.events[s].title), s]).filter(x => x[0]));
  if (titles.size) { try {
    const url = `${LQ}?action=query&prop=revisions&rvprop=content|timestamp&rvslots=main&format=json&formatversion=2&redirects=1&titles=${[...titles.keys()].join('|')}`;
    const J = JSON.parse(await get(url)), norm = t => t.replace(/ /g, '_');
    const back = new Map(((J.query && J.query.redirects) || []).map(r => [norm(r.to), norm(r.from)]));
    for (const pg of (J.query && J.query.pages) || []) { const t = norm(pg.title), s = titles.get(t) || titles.get(back.get(t)); if (!s) continue;
      lq[s] = pg.missing ? {missing: true, title: t} : {title: t, rev: pg.revisions[0].timestamp, fetched: now.toISOString().slice(0, 10), q: lqStore(parseLiquipedia(pg.revisions[0].slots.main.content))}; }
    fs.writeFileSync(`${DIR}/liquipedia.json`, JSON.stringify(lq));
  } catch (e) { console.log(`official: Liquipedia check skipped: ${e.message}`); } }
  // 3) the output, newest first, and its checks
  const evs = evSlugs.map(s => ({s, E: readJSON(`${DIR}/${s}.json`, null)})).filter(x => x.E && x.E.teams.length).sort((a, b) => b.E.date < a.E.date ? -1 : 1);
  const checks = [];
  // players: Victory Road's attendance; when its page gives none, Liquipedia's player count, else the venue's Masters capacity
  for (const {s, E} of evs) { const L = lq[s], Q = L && L.q ? L.q : L && L.wt ? lqStore(parseLiquipedia(L.wt)) : null;
    E.playersFrom = E.players != null ? 'Victory Road' : Q && Q.players != null ? 'Liquipedia' : E.capacity != null ? 'Victory Road (capacity)' : '';
    if (E.players == null) E.players = Q && Q.players != null ? Q.players : E.capacity != null ? E.capacity : null;
    const c = {event: E.name, date: E.date, players: E.players, playersFrom: E.playersFrom, teams: E.teams.length, flags: []};
    for (const t of E.teams) { const a = t.mons.map(m => m.n).sort().join(), b = t.sprites.slice().sort().join(); if (a !== b) c.flags.push(`#${t.st}: sheet ${a} vs page ${b}`); }
    if (!L || L.missing || !Q) c.liquipedia = L && L.missing ? 'no Liquipedia page' : 'not checked';
    else { c.liquipedia = {title: L.title, rev: L.rev, players: Q.players, sdate: Q.sdate, placed: 0, agree: 0};
      // player counts differ by a few between sites (late drops, who counts a no-show): a note within 1% (at least 3), a flag beyond
      if (Q.players != null && E.playersFrom === 'Victory Road' && Q.players !== E.players) (Math.abs(Q.players - E.players) > Math.max(3, .01 * E.players) ? c.flags : (c.notes = c.notes || [])).push(`players: Victory Road ${E.players}, Liquipedia ${Q.players}`);
      if (Q.sdate && Q.sdate !== E.date) c.flags.push(`start date: Victory Road ${E.date}, Liquipedia ${Q.sdate}`);
      for (const t of E.teams) { const r = findPerson(Q.place, t.pk || t.player, 2); if (!r) continue;  /* across a whole list, no loose (score 1) matches */ c.liquipedia.placed++; if (t.st >= r[0] && t.st <= r[1]) c.liquipedia.agree++; else c.flags.push(`#${t.st}: Liquipedia places ${r[0] === r[1] ? r[0] : r.join('–')}`); } }
    checks.push(c); }
  const out = {updated: now.toISOString(), source: `Victory Road + VR Pastes · official VGC events (Masters top ${TOP}) · checked against Liquipedia`,
    attribution: 'Standings and team sheets: Victory Road (victoryroad.pro, vrpastes.com). Placement check: Liquipedia (liquipedia.net), CC-BY-SA 3.0.',
    events: evs.map(({E}) => ({name: E.name, date: E.date, players: E.players, teams: E.teams.map(t => ({player: opid(t.player), pk: okeys(t.pk || t.player), st: t.st, mons: t.mons.map(m => ({n: m.n || m.sp, i: m.i, a: m.a, nt: m.nt, mv: m.mv}))}))})),
    checks};
  // 4) gate: the new file against the previous out/official.json, team by team (same event date and placement)
  const prev = readJSON('out/official.json', null), cmp = compare(prev, out);
  fs.writeFileSync('out/official_compare.json', JSON.stringify(cmp));
  console.log(`official: vs previous file (${cmp.previous}): ${cmp.summary}`);
  const prevTeams = prev ? (prev.events || []).reduce((a, e) => a + (e.teams || []).length, 0) : 0, newTeams = out.events.reduce((a, e) => a + e.teams.length, 0);
  if (!out.events.length) { console.log('::warning::official: no events read; kept the previous out/official.json'); return; }
  if (prevTeams && newTeams < prevTeams * .8) { console.log(`::warning::official: only ${newTeams} teams (had ${prevTeams}); kept the previous out/official.json`); return; }
  if (!cmp.pass) { console.log(`::warning::official: the new sheets disagree with the previous file beyond the gate (${cmp.summary}); kept the previous out/official.json`); return; }
  fs.writeFileSync('out/official.json', JSON.stringify(out));
  // each event's top 8 at the front of out/teams.json (as rk9.mjs did)
  const T = readJSON('out/teams.json', {teams: []}), off = [];
  for (const e of out.events.slice(0, 4)) for (const t of e.teams.filter(t => t.st <= 8 && t.mons.every(m => ROSTER.has(m.n)))) off.push({player: t.player, event: `${e.name} · ${e.players} players`, record: `#${t.st} · official`, section: 'Official events', mons: t.mons.map(m => m.n)});
  T.teams = [...off, ...(T.teams || []).filter(t => t.section !== 'Official events')].slice(0, 90);
  T.source = (T.source || '').replace(/ \+ (RK9|Victory Road) official events.*$/, '') + (off.length ? ' + Victory Road official events (top 8)' : '');
  fs.writeFileSync('out/teams.json', JSON.stringify(T));
  const flagged = checks.filter(c => c.flags.length);
  console.log(`official: ${out.events.length} events, ${newTeams} teams, ${calls} requests${bad.items ? `, ${bad.items} items not on the Reg ${REG} list left blank` : ''}; checks: ${flagged.length ? flagged.map(c => `${c.event}: ${c.flags.length} (${c.flags.slice(0, 2).join('; ')})`).join(' | ') : 'all agree'}`);
  if (flagged.some(c => c.flags.some(f => /Liquipedia places|players:|start date/.test(f)))) console.log('::warning::official: Liquipedia disagrees with Victory Road on some placements, player counts or dates (see out/official.json checks)'); }
// Per team (matched by event date + placement): player (by ID and name keys), six Pokémon, and each Pokémon's item, ability, nature, moves.
export function compare(A, B) {
  const r = {previous: A ? A.source || 'unknown' : 'none', events: [], pass: true};
  if (!A) { r.summary = 'no previous file'; return r; }
  const tot = {teams: 0, player: 0, six: 0, mons: 0, item: 0, ability: 0, nature: 0, moves: 0};
  for (const b of B.events) { const a = (A.events || []).find(e => e.date === b.date && nkey(e.name.replace(/Pokémon /, '')) === nkey(b.name.replace(/Pokémon /, ''))); if (!a) continue;
    const E = {event: b.name, players: [a.players, b.players], teams: 0, player: 0, six: 0, mons: 0, item: 0, ability: 0, nature: 0, moves: 0, examples: []};
    const byS = new Map(a.teams.map(t => [t.st, t]));
    for (const t of b.teams) { const o = byS.get(t.st); if (!o) continue; E.teams++;
      if (samePerson(o.pk || o.player, t.pk || t.player)) E.player++; else if (E.examples.length < 8) E.examples.push(`#${t.st} player: a different player`);
      const six = o.mons.map(m => m.n).sort().join() === t.mons.map(m => m.n).sort().join(); if (six) E.six++; else if (E.examples.length < 8) E.examples.push(`#${t.st} six: ${o.mons.map(m => m.n).join('/')} vs ${t.mons.map(m => m.n).join('/')}`);
      for (const m of t.mons) { const p = o.mons.find(x => x.n === m.n); if (!p) continue; E.mons++;
        for (const [k, f] of [['item', 'i'], ['ability', 'a'], ['nature', 'nt']]) { if ((p[f] || '') === (m[f] || '')) E[k]++; else if (E.examples.length < 8) E.examples.push(`#${t.st} ${m.n} ${k}: ${p[f] || '—'} vs ${m[f] || '—'}`); }
        if ((p.mv || []).slice().sort().join() === (m.mv || []).slice().sort().join()) E.moves++; else if (E.examples.length < 8) E.examples.push(`#${t.st} ${m.n} moves: ${(p.mv || []).join('/')} vs ${(m.mv || []).join('/')}`); } }
    for (const k in tot) tot[k] += E[k]; r.events.push(E); }
  r.total = tot; const pc = (x, n) => n ? +(100 * x / n).toFixed(1) : null;
  r.rates = {player: pc(tot.player, tot.teams), six: pc(tot.six, tot.teams), item: pc(tot.item, tot.mons), ability: pc(tot.ability, tot.mons), nature: pc(tot.nature, tot.mons), moves: pc(tot.moves, tot.mons)};
  // the gate: 95%+ of placements name the same player and 98%+ of teams hold the same six; sets 97%+ the same
  r.pass = !tot.teams || (r.rates.player >= 95 && r.rates.six >= 98 && ['item', 'ability', 'nature', 'moves'].every(k => r.rates[k] >= 97));
  r.summary = tot.teams ? `${tot.teams} teams in ${r.events.length} events: player ${r.rates.player}%, six Pokémon ${r.rates.six}%, items ${r.rates.item}%, abilities ${r.rates.ability}%, natures ${r.rates.nature}%, moves ${r.rates.moves}% (${tot.mons} Pokémon)` : 'no overlapping events';
  return r; }
if (process.argv[1] && process.argv[1].endsWith('official.mjs')) { try { await run(); } catch (e) { console.log(`::warning::official: ${e.message}; kept the previous out/official.json`); process.exitCode = 1; } }

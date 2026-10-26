// Official events (step 4): open team sheets from RK9 for Reg M-C VGC Regionals/Internationals.
// For each finished event since the regulation started, keeps the top 64 team lists (species, item, ability, nature, moves)
// in data/rk9/, writes out/official.json, and puts each event's top 8 at the front of out/teams.json.
import fs from 'node:fs';
const SITE = 'https://www.rk9.gg', REG_START = '2026-09-01', TOP = +(process.env.RK9_TOP || 64), GAP = 1200;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const dec = s => s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const text = h => dec(h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '\n')).split('\n').map(x => x.trim()).filter(Boolean);
let calls = 0;
async function get(path) { if (calls++) await sleep(GAP);
  for (let k = 0; k < 3; k++) { const r = await fetch(SITE + path, {headers: {'User-Agent': 'Mozilla/5.0 (pokelair-data; personal team-builder stats)'}});
    if (r.ok) return r.text(); if (r.status === 429 || r.status >= 500) { await sleep(20000); continue; } throw new Error(path + ' ' + r.status); }
  throw new Error(path + ' failed'); }
fs.mkdirSync('data/rk9', {recursive: true});
const ROSTER = new Set(readJSON('roster.json', []));
const STONE = /^(.*?)(?:ite|inite|onite)( [XYZ])?$/;
// RK9 species text -> PokéLair name
function mapMon(species, item) {
  let n = species.replace(/\s+/g, ' ').trim(), form = '';
  const m = n.match(/^(.*?) \[(.*)\]$/); if (m) { n = m[1]; form = m[2]; }
  n = n.replace(/'/g, '’');
  const F = form.toLowerCase();
  if (/female/.test(F)) n += '-F';
  else if (/alolan/.test(F)) n += '-Alola'; else if (/galarian/.test(F)) n += '-Galar'; else if (/hisuian/.test(F)) n += '-Hisui';
  else if (/paldean/.test(F)) n = 'Tauros-Paldea' + (/aqua/.test(F) ? '-Aqua' : /blaze/.test(F) ? '-Blaze' : '-Combat');
  else if (/(wash|heat|frost|fan|mow) rotom/.test(F)) n = 'Rotom-' + F.match(/(wash|heat|frost|fan|mow)/)[1].replace(/^./, c => c.toUpperCase());
  else if (/dusk/.test(F)) n += '-Dusk'; else if (/midnight/.test(F)) n += '-Midnight'; else if (/low key/.test(F)) n += '-Low-Key';
  else if (/eternal/.test(F)) n += '-Eternal';
  const st = item && item !== 'Eviolite' ? item.match(STONE) : null;
  if (st && item !== 'Eviolite') { const s = st[2] ? st[2].trim() : ''; const base = n.replace(/-F$/, '');
    for (const c of [n + '-Mega' + (s ? '-' + s : ''), base + '-Mega' + (s ? '-' + s : ''), base + '-F-Mega', n + '-Mega', n.split('-')[0] + '-Mega' + (s ? '-' + s : '')]) if (ROSTER.has(c)) return c; }
  if (ROSTER.has(n)) return n; const b = n.split('-')[0]; return ROSTER.has(b) ? b : null; }
function parseTeam(html) { const t = text(html); const out = []; let date = null;
  const di = t.findIndex(x => /^\d{4}-\d{2}-\d{2} at /.test(x)); if (di >= 0) date = t[di].slice(0, 10);
  const end = t.findIndex((x, i) => i > di && /^(FR|IT|DE|ES|JP|KO|SC|TC)$/.test(x) && t[i + 1] === 'Ability:');
  const L = t.slice(0, end > 0 ? end - 1 : t.length);
  for (let i = 0; i < L.length; i++) if (L[i] === 'Ability:' && (L[i - 1] === 'EN' || L[i - 2] === 'EN')) {
    const species = L[i - 1] === 'EN' ? L[i - 2] : L[i - 1], ability = L[i + 1], item = L[i + 2] === 'Held Item:' ? L[i + 3] : '', nat = L[i + 4] === 'Stat Alignment:' ? L[i + 5] : '';
    const mv = []; for (let j = i + 6; j < L.length && mv.length < 4 && L[j + 1] !== 'EN' && L[j] !== 'EN'; j++) mv.push(L[j]);
    out.push({sp: species, n: mapMon(species, item), i: item, a: ability, nt: nat, mv}); }
  return {date, mons: out}; }
// 1) finished events since the regulation started
const evHtml = await get('/events/pokemon');
const slugs = [...new Set([...evHtml.matchAll(/href="\/event\/(pokemon-[a-z0-9-]+)"/g)].map(m => m[1]))].filter(s => /-20(2[7-9]|[3-9]\d)$/.test(s));
const index = readJSON('data/rk9/index.json', {events: {}});
for (const slug of slugs) { if (index.events[slug] && index.events[slug].done) continue;
  try { const ev = await get('/event/' + slug); const name = (ev.match(/<title>([^<]*)/) || [, slug])[1].replace(/ - RK9$/, '').trim();
    const rosters = [...new Set([...ev.matchAll(/href="\/roster\/([A-Za-z0-9-]+)"/g)].map(m => m[1]))];
    let found = null;
    for (const rid of rosters) { const r = await get('/roster/' + rid); if (!/\/teamlist\/public\//.test(r)) continue;
      const rows = [...r.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c => c[1]));
      const players = rows.filter(c => c.length >= 8).map(c => ({first: text(c[1])[0] || '', last: text(c[2])[0] || '', country: text(c[3])[0] || '', div: text(c[4])[0] || '',
        trainer: text(c[5])[0] || '', tl: (c[6].match(/href="(\/teamlist\/public\/[^"]+)"/) || [])[1], st: parseInt(text(c[7])[0], 10)}))
        .filter(p => p.tl && p.div === 'Masters' && p.st > 0).sort((a, b) => a.st - b.st);
      if (!players.length) continue;
      const first = parseTeam(await get(players[0].tl));
      if (!first.date || first.mons.length !== 6) continue;  // TCG and GO lists have no Pokémon sets
      found = {rid, players, first}; break; }
    if (!found) { index.events[slug] = {name, done: false, note: 'no VGC team lists yet'}; continue; }
    if (found.first.date < REG_START) { index.events[slug] = {name, done: true, skip: 'before Reg M-C'}; continue; }
    const teams = [];
    for (const p of found.players.slice(0, TOP)) { const T = p === found.players[0] ? found.first : parseTeam(await get(p.tl));
      if (T.mons.length === 6) teams.push({player: `${p.first} ${p.last}`.trim(), country: p.country, st: p.st, mons: T.mons}); }
    fs.writeFileSync(`data/rk9/${slug}.json`, JSON.stringify({slug, name, date: found.first.date, players: found.players.length, teams}));
    index.events[slug] = {name, date: found.first.date, players: found.players.length, done: true};
    console.log(`rk9: ${name} (${found.first.date}), ${found.players.length} Masters, kept top ${teams.length}`);
  } catch (err) { console.log('rk9 skip', slug, err.message); } }
fs.writeFileSync('data/rk9/index.json', JSON.stringify(index));
// 2) outputs
const evs = Object.keys(index.events).filter(s => index.events[s].done && !index.events[s].skip).map(s => readJSON(`data/rk9/${s}.json`, null)).filter(Boolean).sort((a, b) => b.date < a.date ? -1 : 1);
const miss = new Set(); evs.forEach(e => e.teams.forEach(t => t.mons.forEach(m => { if (!m.n) miss.add(m.sp); })));
fs.writeFileSync('out/official.json', JSON.stringify({updated: new Date().toISOString(), source: 'RK9 open team sheets · official VGC events (Masters top ' + TOP + ')',
  events: evs.map(e => ({name: e.name, date: e.date, players: e.players, teams: e.teams.map(t => ({player: t.player, st: t.st, mons: t.mons.map(m => ({n: m.n || m.sp, i: m.i, a: m.a, nt: m.nt, mv: m.mv}))}))}))}));
const T = readJSON('out/teams.json', {teams: []});
const off = []; for (const e of evs.slice(0, 4)) for (const t of e.teams.filter(t => t.st <= 8 && t.mons.every(m => m.n))) off.push({player: t.player, event: `${e.name} · ${e.players} players`, record: `#${t.st} · official`, section: 'Official events', mons: t.mons.map(m => m.n)});
T.teams = [...off, ...(T.teams || []).filter(t => t.section !== 'Official events')].slice(0, 90);
T.source = (T.source || '').replace(/ \+ RK9.*$/, '') + (off.length ? ' + RK9 official events (top 8)' : '');
fs.writeFileSync('out/teams.json', JSON.stringify(T));
console.log(`rk9: ${evs.length} events, ${off.length} official top-8 teams${miss.size ? ', unmapped: ' + [...miss].join(', ') : ''}`);

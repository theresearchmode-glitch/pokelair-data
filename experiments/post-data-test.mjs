// Mystery Gifts and news data check (Nov 18): app/src/data/post.js (POST), the data behind The Post Room (#gifts), The Champions
// Dispatch (#news) and Home's post band. Checks:
//   gifts: id unique, kind/how/name set, a Pokémon's `mon` is a name in the site's data, at least one https `src`, no op.gg or
//          Serebii source (their terms forbid copying), every code has 1 official source or 2+ outlets on the list that counts
//          (different sites; docs/legal-sources.md), start and end present and parse, start before end, every `approx` field is explained in `note`.
//          a code only on a gift that had not ended when the list was checked (9d: past codes are dropped).
//          no src on a login or code redemption site (9e: in-game steps only).
//   news:  id unique, date parses, type and title set, url is https.
//   only Mystery Gifts (Sim, Nov 18): every gift's `how` is 'Serial Code' or 'Event Gift'.
//   series: dates parse, start before end, `mon` is null or a name in the site's data (the round's prize; not a gift), no `gift` link.
// It then feeds itself broken copies (an empty gift, a code with one outlet, start after end, an http news link, ...) and
// fails unless each one is caught: a check that can't fail proves nothing.
// Usage: node experiments/post-data-test.mjs            (POST_FILE=path checks another copy of post.js)
import fs from 'node:fs'; import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const file = process.env.POST_FILE || new URL('app/src/data/post.js', root);
const load = f => { const c = {}; vm.runInNewContext(fs.readFileSync(f, 'utf8') + ';this.POST = POST;', c); return c.POST; };
const siteData = fs.readFileSync(new URL('app/src/data/data.js', root), 'utf8');
const OFFICIAL = /(^|\.)(pokemon-home\.com|pokemon\.com|pokemon\.co\.jp|pokemonchampions\.jp)$/;
const BANNED = /(^|\.)(op\.gg|serebii\.net)$/;
// login and code redemption sites: never linked (Sim, Nov 18, 9e: in-game steps only; no login pages on a site kids use)
const LOGIN = /(^|\.)(app\.pokemonchampions\.jp|rewards\.pokemon\.com|club\.pokemon\.com|accounts\.nintendo\.com|join\.pokemon\.com)$/;
// the outlets that count toward the 2-outlet rule for codes (docs/legal-sources.md, "Codes: the 2-outlet rule"; Sim, Nov 18, 9b)
const OUTLETS = ['nintendolife.com', 'nintendoeverything.com', 'levelup.com', 'criticalhits.com.br', 'vice.com', 'insider-gaming.com'];
const KINDS = ['pokemon', 'item'], HOWS = ['Event Gift', 'Serial Code']; // only Mystery Gifts (Sim, Nov 18: "just mystery gifts")
const host = u => { try { const x = new URL(u); return x.protocol === 'https:' ? x.hostname.replace(/^www\./, '') : null; } catch (e) { return null; } };
const parses = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) && !Number.isNaN(Date.parse(s));

function check(P) {
  const bad = [], say = (c, m) => { if (!c) bad.push(m); };
  if (!P || typeof P !== 'object') return ['POST missing'];
  say(parses(P.checked), 'checked is not an ISO date');
  say(Array.isArray(P.gifts) && P.gifts.length > 0, 'gifts is empty');
  say(Array.isArray(P.news) && P.news.length > 0, 'news is empty');
  const ids = new Set();
  for (const [i, g] of (P.gifts || []).entries()) {
    const at = `gift ${g && g.id || '#' + i}`;
    if (!g || typeof g !== 'object') { bad.push(`${at}: not an entry`); continue; }
    say(typeof g.id === 'string' && /^g-/.test(g.id) && !ids.has(g.id), `${at}: id missing, not g-..., or repeated`); ids.add(g.id);
    say(KINDS.includes(g.kind), `${at}: kind "${g.kind}" not pokemon/item`);
    say(HOWS.includes(g.how), `${at}: how "${g.how}" is not a Mystery Gift (Serial Code or Event Gift only)`);
    say(typeof g.name === 'string' && g.name.trim(), `${at}: no name`);
    say(Number.isInteger(g.amount) && g.amount > 0, `${at}: amount is not a whole number above 0`);
    if (g.kind === 'pokemon') say(typeof g.mon === 'string' && siteData.includes(JSON.stringify(g.mon)), `${at}: mon "${g.mon}" is not a name in the site's data`);
    const src = Array.isArray(g.src) ? g.src : [], hosts = src.map(host);
    say(src.length > 0, `${at}: no src`);
    say(hosts.every(Boolean), `${at}: a src is not an https URL`);
    say(!hosts.some(h => h && BANNED.test(h)), `${at}: src from op.gg or Serebii (terms forbid copying)`);
    say(!hosts.some(h => h && LOGIN.test(h)), `${at}: src links a login or code redemption site (9e: in-game steps only)`);
    if ('code' in g) say(!(parses(g.end) && parses(P.checked) && Date.parse(g.end) < Date.parse(P.checked)), `${at}: keeps the code of a gift that had ended when the list was checked (Sim, Nov 18, 9d: past codes are dropped)`);
    if ('code' in g) {
      const outlets = new Set(hosts.filter(h => h && OUTLETS.includes(h)));
      say(typeof g.code === 'string' && /^[A-Z0-9]{4,20}$/.test(g.code), `${at}: code "${g.code}" is not 4-20 capital letters/digits`);
      say(hosts.some(h => h && OFFICIAL.test(h)) || outlets.size >= 2, `${at}: code has neither an official source nor 2+ outlets that count (${outlets.size})`);
    }
    say(parses(g.start), `${at}: start "${g.start}" does not parse`);
    say(parses(g.end), `${at}: end "${g.end}" does not parse`);
    if (parses(g.start) && parses(g.end)) say(Date.parse(g.start) < Date.parse(g.end), `${at}: start is not before end`);
    for (const f of g.approx || []) say(['start', 'end'].includes(f) && typeof g.note === 'string' && g.note.length > 20, `${at}: approx ${f} not explained in note`);
    for (const f of ['nature', 'ability']) if (f in g) say(typeof g[f] === 'string' && g[f], `${at}: empty ${f}`);
    if ('moves' in g) say(Array.isArray(g.moves) && g.moves.length >= 1 && g.moves.length <= 4 && g.moves.every(m => typeof m === 'string' && m), `${at}: moves not 1-4 names`);
  }
  const nids = new Set();
  for (const [i, n] of (P.news || []).entries()) {
    const at = `news ${n && n.id || '#' + i}`;
    if (!n || typeof n !== 'object') { bad.push(`${at}: not an entry`); continue; }
    say(typeof n.id === 'string' && n.id && !nids.has(n.id), `${at}: id missing or repeated`); nids.add(n.id);
    say(parses(n.date), `${at}: date "${n.date}" does not parse`);
    if ('updated' in n) say(parses(n.updated), `${at}: updated does not parse`);
    say(typeof n.type === 'string' && n.type, `${at}: no type`);
    say(typeof n.title === 'string' && n.title.trim() && !/[<>]/.test(n.title), `${at}: title empty or has markup`);
    say(!!host(n.url), `${at}: url "${n.url}" is not https`);
    say(!(host(n.url) && LOGIN.test(host(n.url))), `${at}: url links a login or code redemption site (9e)`);
    say(!('summary' in n) && !('img' in n), `${at}: summary/img present but no licence found for them`);
  }
  for (const s of P.series || []) {
    const at = `series ${s.id}`;
    say(parses(s.entry) && parses(s.start) && parses(s.end) && Date.parse(s.start) < Date.parse(s.end), `${at}: dates missing, unparsable or start not before end`);
    say(!('gift' in s), `${at}: links a gift, but competition prizes are not Mystery Gifts (series rounds carry mon only)`);
    say(s.mon === null || (typeof s.mon === 'string' && siteData.includes(JSON.stringify(s.mon))), `${at}: mon "${s.mon}" is not a name in the site's data`);
    say(!!host(s.src), `${at}: src not https`);
  }
  return bad;
}

let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const P = load(file), found = check(P);
console.log(`post.js: ${P.gifts.length} gifts, ${P.news.length} news, ${(P.series || []).length} series rounds`);
for (const m of found) console.log('    ' + m);
ok(found.length === 0, `the data passes every check (${found.length} problems)`);

console.log('the checks can fail (each broken copy must be caught):');
const base = load(new URL('app/src/data/post.js', root)); // broken copies are always made from the repo's post.js
const clone = () => JSON.parse(JSON.stringify(base)), one = g => g.find(x => x.code);
const broken = {
  'an empty gift': c => c.gifts.push({}),
  'a gift with no src': c => { delete c.gifts[0].src; },
  'a gift from op.gg': c => c.gifts[0].src.push('https://op.gg/pokemon-champions/gift'),
  'a code with one outlet': c => { const g = one(c.gifts); g.src = [g.src.find(u => !OFFICIAL.test(host(u)))]; },
  'a code whose second outlet is Analytics Insight': c => { const g = one(c.gifts); g.src = ['https://www.nintendolife.com/a', 'https://www.analyticsinsight.net/b']; },
  'a code from two sites not on the outlet list': c => { const g = one(c.gifts); g.src = ['https://example.com/a', 'https://example.org/b']; },
  'a code with two links on the same outlet': c => { const g = one(c.gifts); g.src = ['https://www.nintendolife.com/a', 'https://nintendolife.com/b']; },
  'a date that does not parse': c => { c.gifts[1].end = 'Nov 22'; },
  'a missing start': c => { delete c.gifts[2].start; },
  'start after end': c => { const g = c.gifts[3]; [g.start, g.end] = [g.end, g.start]; },
  'a Pokémon not in the site data': c => { c.gifts.find(x => x.kind === 'pokemon').mon = 'Missingno'; },
  'a Battle Pass gift': c => { c.gifts[0].how = 'Battle Pass'; },
  'a Competition Prize gift': c => { c.gifts[1].how = 'Competition Prize'; },
  'a past gift that keeps its code': c => { const g = c.gifts.find(x => Date.parse(x.end) < Date.parse(c.checked) && x.how === 'Serial Code'); g.code = 'OLDC0DE1'; g.src = ['https://www.nintendolife.com/a', 'https://nintendoeverything.com/b']; },
  'a gift linking the code redemption site': c => c.gifts[0].src.push('https://serial-web-front.app.pokemonchampions.jp/?lng=10'),
  'news linking the rewards site': c => { c.news[0].url = 'https://rewards.pokemon.com/'; },
  'an empty news entry': c => c.news.push({}),
  'an http news link': c => { c.news[0].url = c.news[0].url.replace('https:', 'http:'); },
  'news with no date': c => { delete c.news[0].date; },
  'a series round linking a gift': c => { c.series[0].gift = c.gifts[0].id; },
  'a series prize not in the site data': c => { c.series[0].mon = 'Missingno'; },
  'empty POST': c => { c.gifts = []; c.news = []; }
};
for (const [name, f] of Object.entries(broken)) {
  const c = clone(); try { f(c); } catch (e) { ok(false, `${name}: could not make the broken copy (${e.message})`); continue; }
  const b = check(c); ok(b.length > 0, `${name}: caught (${b[0] || 'nothing'})`); }

console.log(fails ? `FAILED: ${fails}` : 'ALL PASS');
process.exit(fails ? 1 : 0);

// Upcoming events (step 5c): out/calendar.json, the official VGC calendar (Worlds, Internationals, Regionals, Special
// Championships, Premier Ball Leagues and official online Global Challenges) with VGC dates, city, country and a link.
// Source: Victory Road's season calendar (victoryroad.pro/<season>-season-calendar/), read once a day through the site's
// public WordPress REST API. Its robots.txt allows this (it disallows only /wp-admin/ and a bot trap) and the site publishes
// no terms that forbid it. RK9 is NOT used here: its terms forbid automated extraction. pokemon.com's events pages aren't
// read either (its terms bar automated use and bulk downloads; it sits behind a bot check).
// Victory Road lists the VGC days (e.g. Las Vegas 5–6 Dec), the official site lists the whole weekend with TCG (4–6 Dec):
// on Nov 1, 2026 every one of the 27 events on the official list had the same end date and city on Victory Road.
// If the fetch or the parse fails, yesterday's file stays (its "checked" date tells the page how old it is).
// Run: node calendar.mjs   (CAL_FILE=<saved API JSON> parses a saved copy instead, for testing)
import fs from 'node:fs';
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const API = 'https://victoryroad.pro/wp-json/wp/v2/pages', CAP = 50 * 1024, DAY = 864e5, KEEP_PAST = 45;
const dec = s => String(s || '').replace(/&#8211;|&ndash;/g, '–').replace(/&#8217;|&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;|&#160;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));
const txt = h => dec(String(h || '').replace(/<br\s*\/?>/gi, ' / ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
// the flag images are named by ISO 3166 alpha-3; the page wants alpha-2 (for the country's name in the viewer's language)
const CC = {USA: 'US', CAN: 'CA', MEX: 'MX', BRA: 'BR', ARG: 'AR', CHL: 'CL', PER: 'PE', COL: 'CO', GBR: 'GB', DEU: 'DE', FRA: 'FR', ITA: 'IT', ESP: 'ES', PRT: 'PT', NLD: 'NL', BEL: 'BE',
  POL: 'PL', CZE: 'CZ', AUT: 'AT', CHE: 'CH', SWE: 'SE', NOR: 'NO', DNK: 'DK', FIN: 'FI', IRL: 'IE', AUS: 'AU', NZL: 'NZ', JPN: 'JP', KOR: 'KR', TWN: 'TW', HKG: 'HK', SGP: 'SG', MYS: 'MY',
  PHL: 'PH', THA: 'TH', IDN: 'ID', IND: 'IN', ZAF: 'ZA', ARE: 'AE', SAU: 'SA', TUR: 'TR', CHN: 'CN'};
const MON = {jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12};
const mo = s => MON[String(s || '').slice(0, 3).toLowerCase()] || 0;
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
// "13–15 Aug 2027", "31 Oct–1 Nov 2026", "24 Oct 2026"; anything vaguer ("December 2026 (TBC)", "TBD") is left out
function dates(s) { s = dec(s).replace(/\s+/g, ' ').trim(); let m;
  if ((m = s.match(/^(\d{1,2})(?: ([A-Za-z]{3,9}))? ?[–-] ?(\d{1,2}) ([A-Za-z]{3,9}) (\d{4})$/))) { const em = mo(m[4]), sm = m[2] ? mo(m[2]) : em, y = +m[5]; if (!em || !sm) return null;
    return {s: iso(sm > em ? y - 1 : y, sm, +m[1]), e: iso(y, em, +m[3])}; }
  if ((m = s.match(/^(\d{1,2}) ([A-Za-z]{3,9}) (\d{4})$/))) { const mm = mo(m[2]); return mm ? {s: iso(+m[3], mm, +m[1]), e: iso(+m[3], mm, +m[1])} : null; }
  return null; }
const valid = d => d && !isNaN(new Date(d.s + 'T12:00:00Z')) && !isNaN(new Date(d.e + 'T12:00:00Z')) && d.e >= d.s && (new Date(d.e) - new Date(d.s)) / DAY <= 7;
// which sections count: official circuit events only (Victory Road's own events, ladders and side events are skipped)
function kindOf(sec, name) { const s = sec.toLowerCase(), n = name.toLowerCase();
  if (/world championships/.test(s)) return 'worlds';
  if (/international/.test(s)) return 'international';
  if (/global ladder|official online/.test(s)) return /global challenge/.test(n) ? 'online' : null;
  if (/north america|europe|latin america|oceania|asia-pacific|regional-level|national/.test(s)) return /premier ball league/.test(n) ? 'pbl' : /\bsc\b|special/.test(n) ? 'sc' : /master ball league|championships \(|series grand/.test(n) ? 'national' : 'regional';
  return null; }
function parse(html, pageUrl) { const out = []; let sec = '';
  const h = String(html || '').replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '');
  const re = /<h([23])[^>]*>([\s\S]*?)<\/h\1>|<tr[^>]*>([\s\S]*?)<\/tr>/g; let m;
  while ((m = re.exec(h))) { if (m[2] != null) { sec = txt(m[2]); continue; }
    const td = [...m[3].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(x => x[1]); if (td.length < 2) continue;
    const d = dates(txt(td[0])); if (!d || !valid(d)) continue;
    const parts = txt(td[1]).split(/\s*\/\s*/).map(x => x.trim()).filter(Boolean); if (!parts.length) continue;
    const t = kindOf(sec, parts[0]); if (!t) continue; const name = parts[0].replace(/ SC$/, ' Special Championship').slice(0, 70);
    const a3 = (td[1].match(/flags\/([A-Z]{3})-flag/) || [])[1] || '', href = (td[1].match(/href="([^"]+)"/) || [])[1] || '';
    // the city: the second part ("São Paulo", "Tampines, Singapore"), else the name without "Regional"/"SC"
    const city = (parts[1] || name.replace(/ (Regional|Special Championships?)$/i, '')).slice(0, 50);
    out.push({n: name, city: t === 'online' ? 'Online' : city, cc: CC[a3] || '', s: d.s, e: d.e, t, url: /^https:\/\/victoryroad\.pro\//.test(href) ? href : pageUrl}); }
  return out; }
async function getJSON(url) { const r = await fetch(url, {headers: {'User-Agent': 'pokelair-data (personal team-builder; daily calendar check)', Accept: 'application/json'}}); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }
// seasons run September to August and are named after the year they end in; the page also lists last/next season early
const now = new Date(), season = now.getUTCFullYear() + (now.getUTCMonth() >= 7 ? 1 : 0);
let pages = [];
if (process.env.CAL_FILE) { const p = readJSON(process.env.CAL_FILE, null); if (p) pages.push(Array.isArray(p) ? p[0] : p); }
else for (const y of [season, season + 1]) { try { const r = await getJSON(`${API}?slug=${y}-season-calendar&_fields=id,modified,link,content`); if (Array.isArray(r) && r[0]) pages.push(r[0]); } catch (e) { console.log(`calendar: ${y} season page not read (${e.message})`); } }
const seen = new Set(), ev = [];
for (const p of pages) for (const e of parse(p && p.content && p.content.rendered, (p && p.link) || 'https://victoryroad.pro/')) { const k = e.n + '|' + e.s; if (seen.has(k)) continue; seen.add(k); ev.push(e); }
const today = now.toISOString().slice(0, 10), cut = new Date(now - KEEP_PAST * DAY).toISOString().slice(0, 10);
const keep = ev.filter(e => e.e >= cut).sort((a, b) => a.s < b.s ? -1 : a.s > b.s ? 1 : a.n < b.n ? -1 : 1);
const prev = readJSON('out/calendar.json', null), prevUp = prev && Array.isArray(prev.ev) ? prev.ev.filter(e => e.e >= today).length : 0, up = keep.filter(e => e.e >= today).length;
// fail-safe: nothing parsed, or far fewer upcoming events than yesterday, means the page changed shape: keep yesterday's file
if (!up || (prevUp >= 6 && up < prevUp * .5)) { console.log(`::warning::calendar: ${up} upcoming events parsed (had ${prevUp}); kept the existing file`); process.exit(0); }
const doc = {v: 1, updated: now.toISOString(), checked: today, src: {name: 'Victory Road season calendar', url: (pages[0] && pages[0].link) || 'https://victoryroad.pro/', modified: String((pages[0] && pages[0].modified) || '').slice(0, 19)},
  note: 'VGC days; Regionals often start a day earlier for other games', ev: keep};
while (Buffer.byteLength(JSON.stringify(doc)) > CAP && doc.ev.length > 10) doc.ev.pop();
fs.writeFileSync('out/calendar.json', JSON.stringify(doc));
console.log(`calendar: ${up} upcoming, ${keep.length - up} recent past, ${Math.round(Buffer.byteLength(JSON.stringify(doc)) / 1024)} KiB`);

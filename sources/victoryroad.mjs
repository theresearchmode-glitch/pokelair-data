// Backup adapter: Victory Road (victoryroad.pro WP REST API) + VR Pastes JSON backend (vrpaste-backend.vercel.app).
// Returns the exact tournament / standings / pairings shapes update.mjs expects (pairings are empty: VR has no pairings).
// Uses politeFetch from http.mjs; raw player handles stay in memory only (update.mjs hashes them via pid() before saving).
import {politeFetch} from '../http.mjs';

const VR_PAGES = 'https://victoryroad.pro/wp-json/wp/v2/pages';
const VR_PASTE_API = 'https://vrpaste-backend.vercel.app/api/paste';
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const AMP = String.fromCharCode(38);
const ENT = {amp: AMP, lt: '<', gt: '>', quot: '"', '#039': "'"};
const dec = s => String(s || '')
  .replace(new RegExp(AMP + '#(\\d+);', 'g'), (_, n) => String.fromCharCode(+n))
  .replace(new RegExp(AMP + '(amp|lt|gt|quot|#039);', 'g'), (_, k) => ENT[k] || '');
const strip = h => dec(String(h || '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

export function parseVrDate(s) {
  const m = String(s || '').replace(/\s+/g, ' ').match(/^(\d{1,2})(?: ([A-Za-z]+))?(?: ?[–-] ?\d{1,2})?(?: ([A-Za-z]+))? (\d{4})/);
  if (!m) return null;
  const mo = MONTHS.indexOf((m[2] || m[3] || '').toLowerCase());
  if (mo < 0) return null;
  let y = +m[4];
  if (m[2] && m[3] && mo > MONTHS.indexOf(m[3].toLowerCase())) y--;
  return `${y}-${String(mo + 1).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}T12:00:00.000Z`;
}

export function parseVrRecord(rec) {
  const m = String(rec || '').match(/(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?/);
  return m ? {wins: +m[1], losses: +m[2], ties: m[3] ? +m[3] : 0} : {wins: 0, losses: 0, ties: 0};
}

export function parseVrEventHtml(html) {
  const info = {};
  for (const m of String(html || '').matchAll(/<tr><th[^>]*>([^<]+)<\/th><th[^>]*>([\s\S]*?)<\/th><\/tr>/g)) {
    info[strip(m[1])] = strip(m[2]);
  }
  const cut = String(html || '').search(/<h[1-4][^>]*>[^<]*(?:<[^>]+>)*[^<]*(Senior|Junior)/);
  const body = cut > 0 ? html.slice(0, cut) : String(html || '');
  const rows = new Map();
  for (const t of body.matchAll(/<table class="infobox2[^"]*">([\s\S]*?)<\/table>/g)) {
    const head = strip((t[1].match(/<thead>([\s\S]*?)<\/thead>/) || [])[1]);
    if (!/Player/.test(head) || !/Team/.test(head) || !/OTS/.test(head)) continue;
    for (const r of t[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
      const td = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(x => x[1]);
      if (td.length < 7) continue;
      const st = parseInt(strip(td[0]), 10);
      if (!(st > 0) || rows.has(st)) continue;
      rows.set(st, {
        st,
        rec: strip(td[1]),
        player: strip(td[3].split(/<br\s*\/?>/)[0]),
        paste: ((td[6].match(/vrpastes\.com\/([A-Za-z0-9_-]+)/) || [])[1]) || null,
      });
    }
  }
  const ma = s => { const m = String(s || '').match(/([\d,]+)\s*(?:players\s*)?\(?MA\b/); return m ? +m[1].replace(/,/g, '') : null; };
  const regMatch = String(info.Season || '').match(/Regulation(?:\s+Set)?\s+([A-Z]-[A-Z])\b/i);
  return {
    date: parseVrDate(info.Date || ''),
    players: ma(info.Attendance) || ma(info.Capacity) || rows.size,
    game: info.Videogame || '',
    format: regMatch ? regMatch[1].toUpperCase() : '',
    rows: [...rows.values()].sort((a, b) => a.st - b.st),
  };
}

export function parseVrPasteToDecklist(j) {
  if (!j || j.is_encrypted || !Array.isArray(j.teams)) return [];
  return j.teams.slice(0, 6).map(t => ({
    name: String(t.species || t.name || ''),
    item: String(t.item || ''),
    ability: String(t.ability || ''),
    attacks: Array.isArray(t.moves) ? t.moves.filter(Boolean).slice(0, 4).map(String) : [],
    tera: String(t.teraType || t.tera || ''),
    nature: String(t.nature || ''),
  })).filter(m => m.name);
}

async function fetchJson(url, fetchFn) {
  const fn = fetchFn || politeFetch;
  const r = await fn(url, {headers: {'Accept-Encoding': 'gzip'}});
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}

export const victoryRoadAdapter = {
  name: 'victoryroad',
  async listTournaments({format, fetchFn, season}) {
    const yr = season || (new Date().getUTCMonth() >= 8 ? new Date().getUTCFullYear() + 1 : new Date().getUTCFullYear());
    const list = await fetchJson(`${VR_PAGES}?search=${yr}&per_page=100&_fields=id,slug,modified,title`, fetchFn);
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const p of list) {
      const title = strip(p && p.title && p.title.rendered);
      if (!/^\d{4} .+ (Regional|International|Special|World) Championships$/.test(title)) continue;
      const detail = await fetchJson(`${VR_PAGES}?slug=${encodeURIComponent(p.slug)}&_fields=id,slug,modified,title,content`, fetchFn);
      const page = Array.isArray(detail) ? detail[0] : detail;
      if (!page || !page.content || !page.content.rendered) continue;
      const parsed = parseVrEventHtml(page.content.rendered);
      if (!/Champions/i.test(parsed.game)) continue;
      if (format && parsed.format && parsed.format !== format) continue;
      if (!parsed.date || !parsed.rows.length) continue;
      out.push({
        id: `vr_${p.slug}`,
        date: parsed.date,
        players: parsed.players,
        name: title.replace(/ (Regional|International|Special|World) Championships$/, ' Pokémon $1 Championships'),
        format: parsed.format || format,
        _rows: parsed.rows,
      });
    }
    return out;
  },
  async getStandings(t, {fetchFn}) {
    const standings = [];
    for (const r of (t._rows || [])) {
      if (!r.paste) continue;
      try {
        const j = await fetchJson(`${VR_PASTE_API}/${encodeURIComponent(r.paste)}?lang=english`, fetchFn);
        const decklist = parseVrPasteToDecklist(j);
        if (decklist.length !== 6) continue;
        standings.push({
          player: r.player,
          placing: r.st,
          record: parseVrRecord(r.rec),
          decklist,
        });
      } catch (e) {
        // Skip unreadable individual paste; caller enforces min-standing checks
      }
    }
    return standings;
  },
  async getPairings() {
    return [];
  },
};

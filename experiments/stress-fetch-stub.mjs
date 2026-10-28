// Replaces fetch for the pipeline stress test (node --import this file). STUB_MODE:
//  down    every request fails (network error)
//  500     every request answers HTTP 500
//  html    every request answers 200 with an HTML error page (r.json() throws)
//  empty   every request answers 200 with [] (or an empty page)
//  glitch  Limitless lists the newest known tournaments as brand new, but their standings come back empty and their
//          pairings fail: the transient half-outage that must never wipe data already on disk
import fs from 'node:fs';
const mode = process.env.STUB_MODE || 'down';
const res = (status, body, type = 'application/json') => new Response(typeof body === 'string' ? body : JSON.stringify(body), {status, headers: {'content-type': type}});
globalThis.fetch = async (url) => { url = String(url);
  if (mode === 'down') throw new TypeError('fetch failed (stub: network down)');
  if (mode === '500') return res(500, 'Internal Server Error', 'text/plain');
  if (mode === 'html') return res(200, '<!doctype html><html><body>Service temporarily unavailable</body></html>', 'text/html');
  if (mode === 'empty') return /\.json|api/.test(url) ? res(200, []) : res(200, '<html></html>', 'text/html');
  if (mode === 'glitch') {
    if (/limitlesstcg\.com\/api\/tournaments\?/.test(url)) { if (!/page=1(&|$)/.test(url)) return res(200, []);
      const idx = JSON.parse(fs.readFileSync('data/index.json', 'utf8')); const ids = Object.entries(idx.tournaments).sort((a, b) => String(b[1].d).localeCompare(String(a[1].d))).slice(0, 5);
      return res(200, ids.map(([id, t]) => ({id, name: t.name, date: new Date(Date.now() - 864e5).toISOString(), players: t.p, format: 'M-C', game: 'VGC'}))); }
    if (/\/standings/.test(url)) return res(200, []);
    if (/\/pairings/.test(url)) return res(502, 'Bad Gateway', 'text/plain');
    return res(503, 'Service Unavailable', 'text/plain'); }
  throw new Error('unknown stub mode ' + mode); };

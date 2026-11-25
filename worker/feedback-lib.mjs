// Feedback Worker helpers (Nov 25): split out of feedback.mjs because Cloudflare treats every named export of the
// Worker's main file as an entry point and refuses plain values (wrangler dev: "Incorrect type for map entry 'MAX_BODY_BYTES'").
// Cloudflare Worker: anonymous feedback endpoint (/api/feedback) for nastyplot.org.
// Accepts ONLY POST JSON {text <= 2000, page <= 40, kind <= 20} + Turnstile token in header `CF-Turnstile-Response` (or `X-Turnstile-Token`).
// Stores ONLY (at, page, kind, text) in D1 — NEVER IP, user-agent, headers, cookies, or viewer IDs.
const ALLOWED_KINDS = new Set(['bug', 'confusing', 'idea', 'like', 'mistake']);

// ---------- server-side guards (Nov 25): size, origin, and no contact details kept ----------
// Size: the body is read as text with a hard cap BEFORE JSON parsing, so a huge or never-ending body is refused early
// (Content-Length can be missing or wrong, so it is checked and then the real byte count is checked too). 16 KB is far above
// the largest valid body (2,000 characters of text, up to 4 bytes each in UTF-8, plus the JSON around it).
export const MAX_BODY_BYTES = 16384;
// Origin: browsers send Origin on every POST, so a request from another site carries that site's Origin and is refused.
// A request with no Origin at all (not a browser) still needs a valid Turnstile token. Set REQUIRE_ORIGIN = "1" to refuse
// those too. ALLOWED_ORIGINS (comma-separated) overrides the list below.
export const DEFAULT_ORIGINS = ['https://nastyplot.org', 'https://www.nastyplot.org'];
export function originAllowed(request, env = {}) {
  const list = typeof env.ALLOWED_ORIGINS === 'string' && env.ALLOWED_ORIGINS.trim()
    ? env.ALLOWED_ORIGINS.split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean) : DEFAULT_ORIGINS;
  const origin = request.headers.get('Origin'), site = request.headers.get('Sec-Fetch-Site');
  if (site && site !== 'same-origin' && site !== 'none') return false; // a browser says another site sent it
  if (origin == null || origin === '') return env.REQUIRE_ORIGIN !== '1';
  return list.includes(origin.replace(/\/+$/, ''));
}
export async function readCapped(request, max = MAX_BODY_BYTES) {
  const len = request.headers.get('Content-Length');
  if (len != null && len !== '' && (!/^\d+$/.test(len) || +len > max)) return {tooBig: true};
  if (!request.body) return {text: ''};
  const reader = request.body.getReader(), parts = []; let n = 0;
  for (;;) { const {done, value} = await reader.read(); if (done) break;
    n += value.byteLength; if (n > max) { try { await reader.cancel(); } catch (e) {} return {tooBig: true}; }
    parts.push(value); }
  const buf = new Uint8Array(n); let o = 0; for (const p of parts) { buf.set(p, o); o += p.byteLength; }
  return {text: new TextDecoder().decode(buf)};
}
// Contact details: kids use the site, so feedback never stores an email address or a phone number, even one typed into the
// text by mistake. They are replaced before storing; everything else in the message is kept as typed.
// Emails: plain (name@site.com) and spelled out (name at gmail dot com, name(at)site(dot)org, name [at] site [dot] net).
const TLD = '(?:com|net|org|edu|gov|io|co|uk|us|ca|au|de|fr|es|it|nl|jp|br|me|info|biz|app|dev|gg)';
const AT = '(?:@|\\s*[\\(\\[\\{]\\s*at\\s*[\\)\\]\\}]\\s*|\\s+at\\s+)', DOT = '(?:\\.|\\s*[\\(\\[\\{]\\s*dot\\s*[\\)\\]\\}]\\s*|\\s+dot\\s+)';
const EMAIL_RE = new RegExp(`[a-z0-9][a-z0-9._%+-]*${AT}[a-z0-9-]+(?:${DOT}[a-z0-9-]+)*${DOT}${TLD}\\b`, 'gi');
const EMAIL_PLAIN_RE = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/gi;
// Phones: a run of digits with phone separators (space, dash, dot, brackets, a leading +) holding 10 to 15 digits, or a
// local 7-digit number written 555-1234 / 555.1234. Commas and slashes are not phone separators, so "13,631", "252/4/0" and
// stat spreads stay. A run of plain numbers with spaces can look like a phone and is removed too: losing a number is safer
// than keeping a phone number.
const PHONE_RE = /(?:\+\s?)?(?:\(\s?\d+\s?\)[\s.-]?)?\d(?:[\s.()-]{0,3}\d){9,14}(?!\d)/g;
const PHONE7_RE = /(?<![\d.,/])\b\d{3}[-.]\d{4}\b(?![\d.,/%])/g;
export function scrubContact(text) {
  let t = String(text || ''), emails = 0, phones = 0;
  t = t.replace(EMAIL_RE, () => { emails++; return '[email removed]'; }).replace(EMAIL_PLAIN_RE, () => { emails++; return '[email removed]'; });
  t = t.replace(PHONE_RE, m => { const d = m.replace(/\D/g, '').length; if (d < 10 || d > 15) return m; phones++; return '[phone removed]'; });
  t = t.replace(PHONE7_RE, () => { phones++; return '[phone removed]'; });
  return {text: t, emails, phones};
}

export async function verifyTurnstile(token, secret, fetchImpl = fetch) {
  if (!token || typeof token !== 'string' || !secret) return false;
  const r = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({secret, response: token}).toString(),
  });
  if (!r.ok) return false;
  const j = await r.json();
  return !!(j && j.success);
}

export function validateFeedback(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {error: 'Invalid JSON body'};
  const keys = Object.keys(body);
  if (keys.some(k => k !== 'text' && k !== 'page' && k !== 'kind')) return {error: 'Unexpected fields'};
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const page = typeof body.page === 'string' ? body.page.trim() : '';
  const kind = typeof body.kind === 'string' ? body.kind.trim() : '';
  if (text.length < 3 || text.length > 2000) return {error: 'text must be 3..2000 chars'};
  if (!page || page.length > 40) return {error: 'page must be 1..40 chars'};
  if (!kind || kind.length > 20 || !ALLOWED_KINDS.has(kind)) return {error: 'invalid kind'};
  return {ok: {text, page, kind}};
}


// ---------- anonymous counts (/api/count, Nov 25; queue item 4: marketing's baseline from the quiet launch) ----------
// The page sends {"k":"teamcheck"} when a full team gets its Strength Score (once per distinct six per page load, decided in the
// browser). Only a daily total is kept: one row per (day, event name) with n = n + 1. No IP, user agent, headers, cookies, referrer,
// time of day or any id is read or stored. Event names come from this allow-list; anything else is refused.
export const COUNT_KEYS = new Set(['teamcheck']);
// the largest valid body is 17 bytes ({"k":"teamcheck"}); 256 leaves room for spaces and a longer future name, nothing more
export const COUNT_MAX_BYTES = 256;
export function validateCount(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {error: 'Invalid JSON body'};
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== 'k') return {error: 'Unexpected fields'};
  if (typeof body.k !== 'string' || !COUNT_KEYS.has(body.k)) return {error: 'invalid k'};
  return {ok: {k: body.k}};
}
export const COUNT_SQL = 'INSERT INTO counts (day, k, n) VALUES (?, ?, 1) ON CONFLICT(day, k) DO UPDATE SET n = n + 1';

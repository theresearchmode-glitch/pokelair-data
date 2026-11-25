// Cloudflare Worker: anonymous feedback endpoint (/api/feedback) for nastyplot.org.
// Accepts ONLY POST JSON {text <= 2000, page <= 40, kind <= 20} + Turnstile token in header `CF-Turnstile-Response` (or `X-Turnstile-Token`).
// Stores ONLY (at, page, kind, text) in D1 — NEVER IP, user-agent, headers, cookies, or viewer IDs.
const ALLOWED_KINDS = new Set(['bug', 'confusing', 'idea', 'like', 'mistake']);

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/feedback') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', {status: 405});
      let body;
      try { body = await request.json(); } catch (e) { return Response.json({error: 'Invalid JSON'}, {status: 400}); }
      const v = validateFeedback(body);
      if (v.error) return Response.json({error: v.error}, {status: 400});
      const token = request.headers.get('CF-Turnstile-Response') || request.headers.get('X-Turnstile-Token') || '';
      const human = await verifyTurnstile(token, env.TURNSTILE_SECRET);
      if (!human) return Response.json({error: 'Verification failed'}, {status: 403});
      const at = new Date().toISOString().slice(0, 10);
      await env.DB.prepare('INSERT INTO feedback (at, page, kind, text) VALUES (?, ?, ?, ?)')
        .bind(at, v.ok.page, v.ok.kind, v.ok.text)
        .run();
      return Response.json({ok: true}, {status: 201});
    }
    if (url.pathname.startsWith('/data/')) {
      const res = await env.ASSETS.fetch(request);
      return res.status === 404 ? new Response('Not Found', {status: 404}) : res;
    }
    return env.ASSETS.fetch(request);
  },
};

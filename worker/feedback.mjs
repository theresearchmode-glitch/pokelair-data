// Cloudflare Worker: anonymous feedback endpoint (/api/feedback) for nastyplot.org.
// Accepts ONLY POST JSON {text <= 2000, page <= 40, kind <= 20} + Turnstile token in header `CF-Turnstile-Response` (or `X-Turnstile-Token`).
// Stores ONLY (at, page, kind, text) in D1 — NEVER IP, user-agent, headers, cookies, or viewer IDs.
// Only `export default` here: the helpers live in feedback-lib.mjs (Cloudflare accepts only entry points as named exports).
import {originAllowed, readCapped, scrubContact, verifyTurnstile, validateFeedback} from './feedback-lib.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/feedback') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', {status: 405});
      if (!originAllowed(request, env)) return Response.json({error: 'Forbidden origin'}, {status: 403});
      const raw = await readCapped(request);
      if (raw.tooBig) return Response.json({error: 'Body too large'}, {status: 413});
      let body;
      try { body = JSON.parse(raw.text); } catch (e) { return Response.json({error: 'Invalid JSON'}, {status: 400}); }
      const v = validateFeedback(body);
      if (v.error) return Response.json({error: v.error}, {status: 400});
      const token = request.headers.get('CF-Turnstile-Response') || request.headers.get('X-Turnstile-Token') || '';
      const human = await verifyTurnstile(token, env.TURNSTILE_SECRET);
      if (!human) return Response.json({error: 'Verification failed'}, {status: 403});
      const at = new Date().toISOString().slice(0, 10);
      await env.DB.prepare('INSERT INTO feedback (at, page, kind, text) VALUES (?, ?, ?, ?)')
        .bind(at, v.ok.page, v.ok.kind, scrubContact(v.ok.text).text)
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

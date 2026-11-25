// Cloudflare Worker: anonymous feedback endpoint (/api/feedback) for nastyplot.org.
// Also /api/count: POST {"k":"teamcheck"} adds 1 to that day's total (D1 table counts); see feedback-lib.mjs.
// Accepts ONLY POST JSON {text <= 2000, page <= 40, kind <= 20} + Turnstile token in header `CF-Turnstile-Response` (or `X-Turnstile-Token`).
// Stores ONLY (at, page, kind, text) in D1 — NEVER IP, user-agent, headers, cookies, or viewer IDs.
// Only `export default` here: the helpers live in feedback-lib.mjs (Cloudflare accepts only entry points as named exports).
import {originAllowed, readCapped, scrubContact, verifyTurnstile, validateFeedback, validateCount, COUNT_MAX_BYTES, COUNT_SQL} from './feedback-lib.mjs';

/* Kip job 34 #5: anything unexpected on an /api/ address (a body cut off mid-way, D1 or the rate limiter failing) answers a plain
   503 with no details, instead of an uncaught error. Pages and data files go straight to the assets. */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) { /* only /api/* runs this Worker (run_worker_first); anything else, if it ever arrives, is the assets' answer */
      const res = await env.ASSETS.fetch(request);
      return url.pathname.startsWith('/data/') && res.status === 404 ? new Response('Not Found', {status: 404}) : res; }
    try { return await api(request, env, url); } catch (e) { return Response.json({error: 'Try again later'}, {status: 503}); }
  },
};
async function api(request, env, url) {
    if (url.pathname === '/api/feedback') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', {status: 405});
      if (!originAllowed(request, env)) return Response.json({error: 'Forbidden origin'}, {status: 403});
      const raw = await readCapped(request);
      if (raw.tooBig) return Response.json({error: 'Body too large'}, {status: 413});
      let body;
      try { body = JSON.parse(raw.text); } catch (e) { return Response.json({error: 'Invalid JSON'}, {status: 400}); }
      const v = validateFeedback(body);
      if (v.error) return Response.json({error: v.error}, {status: 400});
      /* Workers rate limit (Nov 25: the free plan's one WAF rule is Cloudflare's leaked-credential check, so the limit lives here).
         The key is the sender's IP, held only by Cloudflare's limiter for its 60 s window; we never store or log it. No binding = no limit. */
      if (env.FEEDBACK_RL && typeof env.FEEDBACK_RL.limit === 'function') {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const {success} = await env.FEEDBACK_RL.limit({key: 'fb:' + ip});
        if (!success) return Response.json({error: 'Too many messages; try again in a minute'}, {status: 429});
      }
      const token = request.headers.get('CF-Turnstile-Response') || request.headers.get('X-Turnstile-Token') || '';
      const human = await verifyTurnstile(token, env.TURNSTILE_SECRET, fetch, env);
      if (!human) return Response.json({error: 'Verification failed'}, {status: 403});
      const at = new Date().toISOString().slice(0, 10);
      await env.DB.prepare('INSERT INTO feedback (at, page, kind, text) VALUES (?, ?, ?, ?)')
        .bind(at, v.ok.page, v.ok.kind, scrubContact(v.ok.text).text)
        .run();
      return Response.json({ok: true}, {status: 201});
    }
    // anonymous daily totals (Nov 25): POST {"k":"teamcheck"} only; stores (day, k) and n + 1, nothing else. No GET: no public stats.
    if (url.pathname === '/api/count') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', {status: 405, headers: {Allow: 'POST'}});
      if (!originAllowed(request, env)) return Response.json({error: 'Forbidden origin'}, {status: 403});
      const raw = await readCapped(request, COUNT_MAX_BYTES);
      if (raw.tooBig) return Response.json({error: 'Body too large'}, {status: 413});
      let body;
      try { body = JSON.parse(raw.text); } catch (e) { return Response.json({error: 'Invalid JSON'}, {status: 400}); }
      const v = validateCount(body);
      if (v.error) return Response.json({error: v.error}, {status: 400});
      /* Kip job 34 #4: counts get a Workers rate limit too (30 a minute per sender; the key is held only by Cloudflare's limiter) */
      if (env.COUNT_RL && typeof env.COUNT_RL.limit === 'function') {
        const {success} = await env.COUNT_RL.limit({key: 'cnt:' + (request.headers.get('CF-Connecting-IP') || 'unknown')});
        if (!success) return new Response(null, {status: 429});
      }
      const day = new Date().toISOString().slice(0, 10);
      await env.DB.prepare(COUNT_SQL).bind(day, v.ok.k).run();
      return new Response(null, {status: 204});
    }
    return Response.json({error: 'Not found'}, {status: 404});
}

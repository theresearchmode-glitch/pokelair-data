// Tests for the anonymous feedback Worker, D1 schema, wrangler.toml, and public feedback POST (Node 22, no network).
// Usage: node experiments/feedback-worker-test.mjs
import fs from 'node:fs';
import worker, {validateFeedback, verifyTurnstile} from '../worker/feedback.mjs';

let failed = 0;
const check = (id, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ': ' + detail : ''}`);
  if (!ok) failed++;
};

// W1-W5: strict body validation (only text, page, kind)
check('W1-reject-extra-field', !!validateFeedback({text: 'Calc off', page: 'calc', kind: 'bug', ip: '1.2.3.4'}).error);
check('W2-reject-legacy-fields', !!validateFeedback({text: 'Calc off', page: 'calc', kind: 'bug', w: 'phone', d: '2026-11-24'}).error);
check('W3-reject-long-text', !!validateFeedback({text: 'x'.repeat(2001), page: 'calc', kind: 'idea'}).error);
check('W4-reject-bad-kind', !!validateFeedback({text: 'Calc off', page: 'calc', kind: 'spam'}).error);
check('W5-accept-valid', !!validateFeedback({text: 'Calc off on Mega Sol', page: 'calc', kind: 'mistake'}).ok);

// W6-W10: Worker fetch behavior, Turnstile verification, D1 4-column privacy, /data/ 404
{
  const bound = [];
  const env = {
    TURNSTILE_SECRET: 'test-secret',
    DB: {prepare: sql => ({bind: (...args) => ({run: async () => { bound.push({sql, args}); }})})},
    ASSETS: {fetch: async req => new Response('Not Found', {status: 404})},
  };
  const getRes = await worker.fetch(new Request('https://nastyplot.org/api/feedback', {method: 'GET'}), env);
  check('W6-get-405', getRes.status === 405, `status=${getRes.status}`);

  const origFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({success: false}), {status: 200});
    const badTok = await worker.fetch(new Request('https://nastyplot.org/api/feedback', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'CF-Turnstile-Response': 'bad'},
      body: JSON.stringify({text: 'Broken button', page: 'team', kind: 'bug'}),
    }), env);
    check('W7-turnstile-fail-403', badTok.status === 403 && bound.length === 0, `status=${badTok.status}`);

    globalThis.fetch = async () => new Response(JSON.stringify({success: true}), {status: 200});
    const okReq = new Request('https://nastyplot.org/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Turnstile-Response': 'good-token',
        'CF-Connecting-IP': '203.0.113.9',
        'User-Agent': 'SensitiveUA/1.0',
      },
      body: JSON.stringify({text: 'Broken button', page: 'team', kind: 'bug'}),
    });
    const okRes = await worker.fetch(okReq, env);
    check('W8-d1-stores-only-4-cols',
      okRes.status === 201 && bound.length === 1 && bound[0].args.length === 4 &&
      /^\d{4}-\d{2}-\d{2}$/.test(bound[0].args[0]) &&
      bound[0].args[1] === 'team' && bound[0].args[2] === 'bug' && bound[0].args[3] === 'Broken button',
      JSON.stringify(bound[0] && bound[0].args));

    const data404 = await worker.fetch(new Request('https://nastyplot.org/data/missing.json'), env);
    check('W9-data-missing-404', data404.status === 404, `status=${data404.status}`);
  } finally {
    globalThis.fetch = origFetch;
  }
}

// W10-W12: schema.sql, wrangler.toml (Job 19 app/dist), and client __NP_PUBLIC gating
{
  const schema = fs.readFileSync('worker/schema.sql', 'utf8');
  const cols = [...schema.matchAll(/^\s+(\w+)\s+(?:INTEGER|TEXT)/gm)].map(m => m[1]);
  check('W10-schema-4-data-cols', cols.join(',') === 'id,at,page,kind,text', cols.join(','));

  const toml = fs.readFileSync('wrangler.toml', 'utf8');
  check('W11-wrangler-app-dist',
    toml.includes('directory = "./app/dist"') &&
    toml.includes('main = "worker/feedback.mjs"') &&
    toml.includes('"/api/feedback"') && toml.includes('"/data/*"'));

  const fb2 = fs.readFileSync('app/src/v2/pages/feedback.js', 'utf8');
  const fb1 = fs.readFileSync('app/src/app/53-feedback.js', 'utf8');
  check('W12-client-public-turnstile',
    fb2.includes('window.__NP_PUBLIC') && fb2.includes('CF-Turnstile-Response') && fb2.includes('__npTurnstileCb') &&
    fb1.includes('window.__NP_PUBLIC') && fb1.includes('CF-Turnstile-Response') && fb1.includes('__npTurnstileCb'));
}

console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
if (failed) process.exit(1);

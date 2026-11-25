// Tests for the server-side guards in worker/feedback.mjs: contact clean-up, body size cap, origin check.
// Run: node experiments/feedback-guard-test.mjs   (Node 22, no network: D1 and Turnstile are mocked)
import worker from '../worker/feedback.mjs'; import {scrubContact, originAllowed, readCapped, MAX_BODY_BYTES} from '../worker/feedback-lib.mjs';

let fails = 0, n = 0;
const ok = (cond, name) => { n++; if (cond) console.log('PASS', name); else { fails++; console.log('FAIL', name); } };

// ---------- G1: emails are removed ----------
const emailCases = [
  'mail me at kid.player99@gmail.com please',
  'my email is Kid_Player+vgc@school.k12.us',
  'kidplayer at gmail dot com',
  'kidplayer(at)gmail(dot)com',
  'kidplayer [at] yahoo [dot] co [dot] uk',
  'kidplayer {at} outlook {dot} net',
  'reach me: someone@some-site.xyz',
];
for (const c of emailCases) {
  const r = scrubContact(c);
  ok(!/gmail|yahoo|outlook|school|some-site/i.test(r.text) && r.text.includes('[email removed]') && r.emails >= 1, `G1 email removed: ${JSON.stringify(c)} -> ${JSON.stringify(r.text)}`);
}

// ---------- G2: phone numbers are removed ----------
const phoneCases = [
  'call 555-123-4567 ok', 'call (555) 123-4567', 'text +1 555 123 4567', '+44 20 7946 0958 is my number',
  'my cell 5551234567', 'number 555.123.4567', 'call me 555-1234', '+33 6 12 34 56 78',
];
for (const c of phoneCases) {
  const r = scrubContact(c);
  ok(r.text.includes('[phone removed]') && r.phones >= 1 && (r.text.match(/\d/g) || []).length <= 1, `G2 phone removed: ${JSON.stringify(c)} -> ${JSON.stringify(r.text)}`);
}

// ---------- G3: game numbers and normal words are kept exactly ----------
const keep = [
  'Incineroar 252/4/0 spread with 13,631 uses',
  'Rating 87 at Worlds 2025, top cut at 128 players',
  'Speed tier 31 IVs, 252+ Spe hits 200 exactly',
  'Played at home on 2026-11-25, went 6-2 then 3-1',
  'Flutter Mane at 44.5% usage, 1.5x damage',
  'Sets: 4/0/252/0/0/252, HP 175, 0.75 spread',
  'I was at regionals and the stream dot matrix was cool',
  'Pokemon at worlds is fun',
];
for (const c of keep) {
  const r = scrubContact(c);
  ok(r.text === c && r.emails === 0 && r.phones === 0, `G3 kept as typed: ${JSON.stringify(c)}${r.text === c ? '' : ' -> ' + JSON.stringify(r.text)}`);
}

// ---------- G4: speed on a hostile 2,000-character text (no runaway regex) ----------
{
  const t0 = performance.now();
  scrubContact('a.'.repeat(1000)); scrubContact('1 '.repeat(1000)); scrubContact('a at b dot '.repeat(180)); scrubContact('-'.repeat(1999) + '1');
  const ms = performance.now() - t0;
  ok(ms < 250, `G4 hostile inputs scrubbed in ${ms.toFixed(1)} ms (< 250)`);
}

// ---------- helpers for the endpoint ----------
function mockEnv(extra = {}) {
  const calls = [];
  return {calls, env: {TURNSTILE_SECRET: 's', ...extra,
    DB: {prepare: sql => ({bind: (...a) => ({run: async () => { calls.push({sql, a}); return {success: true}; }})})},
    ASSETS: {fetch: async () => new Response('asset')}}};
}
globalThis.fetch = async () => new Response(JSON.stringify({success: true}), {status: 200});
const post = (body, headers = {}) => new Request('https://nastyplot.org/api/feedback', {method: 'POST',
  headers: {'Content-Type': 'application/json', 'CF-Turnstile-Response': 'tok', ...headers}, body});
const good = JSON.stringify({text: 'Great site, email me kid@gmail.com or call 555-123-4567', page: 'home', kind: 'like'});

// ---------- G5: stored text is cleaned ----------
{
  const m = mockEnv();
  const res = await worker.fetch(post(good, {Origin: 'https://nastyplot.org'}), m.env);
  const stored = m.calls[0] && m.calls[0].a[3];
  ok(res.status === 201 && m.calls.length === 1 && stored === 'Great site, email me [email removed] or call [phone removed]', `G5 stored text cleaned: ${res.status} ${JSON.stringify(stored)}`);
  ok(m.calls[0] && m.calls[0].a.length === 4, 'G5b still exactly 4 values stored');
}

// ---------- G6: size cap ----------
{
  const big = JSON.stringify({text: 'x'.repeat(MAX_BODY_BYTES), page: 'home', kind: 'idea'});
  const m = mockEnv();
  const res = await worker.fetch(post(big), m.env);
  ok(res.status === 413 && m.calls.length === 0, `G6 oversize body (Content-Length) -> 413, nothing stored (got ${res.status})`);
  // a body with no Content-Length (streamed) is capped by its real byte count
  const stream = new ReadableStream({start(c) { for (let i = 0; i < 40; i++) c.enqueue(new TextEncoder().encode('y'.repeat(1024))); c.close(); }});
  const req = new Request('https://nastyplot.org/api/feedback', {method: 'POST', body: stream, duplex: 'half', headers: {'CF-Turnstile-Response': 'tok'}});
  ok(req.headers.get('Content-Length') == null, 'G6b streamed request really has no Content-Length');
  const m2 = mockEnv();
  const res2 = await worker.fetch(req, m2.env);
  ok(res2.status === 413 && m2.calls.length === 0, `G6c streamed 40 KB body without Content-Length -> 413 (got ${res2.status})`);
  const lie = await readCapped(new Request('https://x/', {method: 'POST', body: 'z'.repeat(20000), headers: {'Content-Length': 'abc'}}));
  ok(lie.tooBig === true, 'G6d a non-number Content-Length is refused');
  // just under the cap still works (multi-byte text near the 2,000-character limit)
  const m3 = mockEnv();
  const res3 = await worker.fetch(post(JSON.stringify({text: '🎉'.repeat(1000), page: 'home', kind: 'like'})), m3.env);
  ok(res3.status === 201 && m3.calls.length === 1, `G6e largest valid emoji body passes (got ${res3.status})`);
}

// ---------- G7: origin check ----------
{
  for (const [h, want, name] of [
    [{Origin: 'https://evil.example'}, 403, 'foreign Origin'],
    [{Origin: 'https://nastyplot.org.evil.example'}, 403, 'look-alike Origin'],
    [{Origin: 'null'}, 403, 'Origin null (sandboxed frame)'],
    [{Origin: 'https://nastyplot.org', 'Sec-Fetch-Site': 'cross-site'}, 403, 'Sec-Fetch-Site cross-site'],
    [{Origin: 'https://nastyplot.org', 'Sec-Fetch-Site': 'same-site'}, 403, 'Sec-Fetch-Site same-site (another subdomain)'],
    [{Origin: 'https://nastyplot.org'}, 201, 'own Origin'],
    [{Origin: 'https://www.nastyplot.org', 'Sec-Fetch-Site': 'same-origin'}, 201, 'www Origin + same-origin'],
    [{}, 201, 'no Origin (allowed by default; Turnstile still required)'],
  ]) {
    const m = mockEnv();
    const res = await worker.fetch(post(good, h), m.env);
    ok(res.status === want && m.calls.length === (want === 201 ? 1 : 0), `G7 ${name} -> ${want} (got ${res.status})`);
  }
  const m = mockEnv({REQUIRE_ORIGIN: '1'});
  const res = await worker.fetch(post(good), m.env);
  ok(res.status === 403 && m.calls.length === 0, `G7 REQUIRE_ORIGIN=1 and no Origin -> 403 (got ${res.status})`);
  const m2 = mockEnv({ALLOWED_ORIGINS: 'https://preview.pages.dev, http://localhost:8787'});
  const r2 = await worker.fetch(post(good, {Origin: 'http://localhost:8787'}), m2.env);
  const r3 = await worker.fetch(post(good, {Origin: 'https://nastyplot.org'}), m2.env);
  ok(r2.status === 201 && r3.status === 403, `G7 ALLOWED_ORIGINS replaces the default list (${r2.status}, ${r3.status})`);
  ok(originAllowed(new Request('https://x/', {headers: {Origin: 'https://nastyplot.org/'}}), {}) === true, 'G7 trailing slash on Origin tolerated');
}

// ---------- G8: order: a foreign origin is refused before Turnstile is ever called ----------
{
  let called = 0; const saved = globalThis.fetch;
  globalThis.fetch = async () => { called++; return new Response('{"success":true}'); };
  await worker.fetch(post(good, {Origin: 'https://evil.example'}), mockEnv().env);
  await worker.fetch(post(JSON.stringify({text: 'x'.repeat(20000), page: 'a', kind: 'idea'})), mockEnv().env);
  globalThis.fetch = saved;
  ok(called === 0, `G8 Turnstile not called for refused origin / oversize body (calls: ${called})`);
}

// G9 (Nov 25, SEO audit under wrangler dev): Cloudflare refuses a Worker main file with named exports that aren't entry points
// ("Incorrect type for map entry 'MAX_BODY_BYTES'"); the main file may only `export default`
{ const fsm = await import('node:fs'); const src = fsm.readFileSync(new URL('../worker/feedback.mjs', import.meta.url), 'utf8');
  const named = src.split('\n').filter(l => /^export\s+(?!default\b)/.test(l));
  ok(!named.length, `G9 worker/feedback.mjs has only \`export default\` (named exports: ${named.map(l => l.slice(0, 40)).join(' | ') || 'none'})`); }

console.log(fails ? `${fails} of ${n} FAILED` : `ALL PASSED (${n})`);
process.exit(fails ? 1 : 0);

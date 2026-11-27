// Tests for the anonymous Team check counter in the Worker (/api/count, Nov 25; queue item 4): allow-list, 400/403/405/413,
// a daily total only (the bound values are exactly [day, k]), the real UPSERT run on the real schema in SQLite, and wrangler.toml
// sending /api/count to the Worker. Run: node experiments/count-worker-test.mjs   (Node 22, no network)
import fs from 'node:fs';
import worker from '../worker/feedback.mjs';
import * as lib from '../worker/feedback-lib.mjs';

let fails = 0, n = 0;
const ok = (cond, name) => { n++; if (cond) console.log('PASS', name); else { fails++; console.log('FAIL', name); } };

// a fake D1 that records every statement and its bound values
function fakeEnv(extra = {}) {
  const calls = [];
  return {calls, env: {...extra,
    DB: {prepare: sql => ({bind: (...a) => ({run: async () => { calls.push({sql, a}); return {success: true}; }})})},
    ASSETS: {fetch: async () => new Response('<!doctype html>page', {status: 200})}}};
}
const post = (body, headers = {}) => new Request('https://nastyplot.org/api/count', {method: 'POST',
  headers: {'Content-Type': 'text/plain;charset=UTF-8', Origin: 'https://nastyplot.org', ...headers}, body});
const GOOD = '{"k":"teamcheck"}';
const today = () => new Date().toISOString().slice(0, 10);

// C1: a valid count is stored as exactly [day, k] and nothing else, even with an IP, user agent, referrer and cookie on the request
{
  const m = fakeEnv();
  const res = await worker.fetch(post(GOOD, {'CF-Connecting-IP': '203.0.113.9', 'User-Agent': 'SensitiveUA/1.0', Referer: 'https://nastyplot.org/team', Cookie: 'a=b'}), m.env);
  const c = m.calls[0];
  ok(res.status === 204 && m.calls.length === 1, `C1 valid {"k":"teamcheck"} -> 204, one statement (got ${res.status}, ${m.calls.length})`);
  ok(c && JSON.stringify(c.a) === JSON.stringify([today(), 'teamcheck']), `C1b bound values are exactly [day, k] (${JSON.stringify(c && c.a)})`);
  ok(c && /^INSERT INTO counts \(day, k, n\) VALUES \(\?, \?, 1\) ON CONFLICT\(day, k\) DO UPDATE SET n = n \+ 1$/.test(c.sql), `C1c the statement is the daily UPSERT (${c && c.sql})`);
  const all = JSON.stringify(m.calls);
  ok(!/203\.0\.113|SensitiveUA|Referer|nastyplot\.org\/team|a=b/.test(all), 'C1d no IP, user agent, referrer or cookie reaches the database');
  ok((await res.text()) === '', 'C1e the answer says nothing (no totals given back)');
}

// C2: the allow-list: other names, extra fields, wrong types, not an object -> 400, nothing stored
for (const [body, name] of [
  ['{"k":"visit"}', 'unknown event name'], ['{"k":"TEAMCHECK"}', 'name in other case'], ['{"k":"teamcheck","team":"Garchomp"}', 'extra field (team data)'],
  ['{"k":"teamcheck","id":"abc"}', 'extra field (an id)'], ['{"k":1}', 'number'], ['{"k":["teamcheck"]}', 'array value'], ['["teamcheck"]', 'array body'],
  ['{}', 'empty object'], ['null', 'null'], ['"teamcheck"', 'bare string'], ['{"k":"teamcheck"', 'broken JSON'], ['', 'empty body'],
  ['{"__proto__":{"k":"teamcheck"}}', '__proto__ trick'],
]) {
  const m = fakeEnv();
  const res = await worker.fetch(post(body), m.env);
  ok(res.status === 400 && m.calls.length === 0, `C2 ${name} -> 400, nothing stored (got ${res.status})`);
}

// C3: GET and other methods are refused (no public stats endpoint), with the database untouched
for (const method of ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']) {
  const m = fakeEnv();
  const res = await worker.fetch(new Request('https://nastyplot.org/api/count', {method}), m.env);
  ok(res.status === 405 && m.calls.length === 0, `C3 ${method} /api/count -> 405 (got ${res.status})`);
}

// C4: the same origin check as feedback
for (const [h, want, name] of [
  [{Origin: 'https://evil.example'}, 403, 'foreign Origin'], [{Origin: 'null'}, 403, 'Origin null'],
  [{Origin: 'https://nastyplot.org', 'Sec-Fetch-Site': 'cross-site'}, 403, 'Sec-Fetch-Site cross-site'],
  [{Origin: 'https://www.nastyplot.org', 'Sec-Fetch-Site': 'same-origin'}, 204, 'www Origin, same-origin'],
]) {
  const m = fakeEnv();
  const res = await worker.fetch(post(GOOD, h), m.env);
  ok(res.status === want && m.calls.length === (want === 204 ? 1 : 0), `C4 ${name} -> ${want} (got ${res.status})`);
}
{ const m = fakeEnv({REQUIRE_ORIGIN: '1'});
  const res = await worker.fetch(new Request('https://nastyplot.org/api/count', {method: 'POST', body: GOOD}), m.env);
  ok(res.status === 403 && m.calls.length === 0, `C4 REQUIRE_ORIGIN=1 and no Origin -> 403 (got ${res.status})`); }

// C5: size cap (a count body is tiny: refused well before feedback's 16 KB)
{
  ok(lib.COUNT_MAX_BYTES <= 1024, `C5 the count cap is small (${lib.COUNT_MAX_BYTES} bytes)`);
  const m = fakeEnv();
  const res = await worker.fetch(post('{"k":"teamcheck"}' + ' '.repeat(2000)), m.env);
  ok(res.status === 413 && m.calls.length === 0, `C5b a 2 KB body -> 413 (got ${res.status})`);
  const stream = new ReadableStream({start(c) { for (let i = 0; i < 8; i++) c.enqueue(new TextEncoder().encode(' '.repeat(128))); c.close(); }});
  const req = new Request('https://nastyplot.org/api/count', {method: 'POST', body: stream, duplex: 'half', headers: {Origin: 'https://nastyplot.org'}});
  const m2 = fakeEnv(); const r2 = await worker.fetch(req, m2.env);
  ok(req.headers.get('Content-Length') == null && r2.status === 413 && m2.calls.length === 0, `C5c a streamed 1 KB body without Content-Length -> 413 (got ${r2.status})`);
}

// C6: the real statement on the real schema (SQLite, the engine D1 runs): three counts in a day are one row with n = 3,
// another day is its own row, and the table holds only day, k and n
{
  const {DatabaseSync} = await import('node:sqlite');
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync('worker/schema.sql', 'utf8'));
  const d1 = {prepare: sql => ({bind: (...a) => ({run: async () => db.prepare(sql).run(...a)})})};
  const env = {DB: d1, ASSETS: {fetch: async () => new Response('')}};
  for (let i = 0; i < 3; i++) await worker.fetch(post(GOOD), env);
  db.prepare(lib.COUNT_SQL).run('2026-12-01', 'teamcheck');
  const rows = db.prepare('SELECT day, k, n FROM counts ORDER BY day').all().map(r => ({...r}));
  const cols = db.prepare("SELECT name FROM pragma_table_info('counts')").all().map(r => r.name);
  ok(cols.join(',') === 'day,k,n', `C6 table counts has only day, k, n (${cols.join(',')})`);
  ok(rows.length === 2 && rows.some(r => r.day === today() && r.k === 'teamcheck' && r.n === 3) && rows.some(r => r.day === '2026-12-01' && r.n === 1),
    `C6b three counts today are one row with n = 3; another day is its own row (${JSON.stringify(rows)})`);
  const fb = db.prepare("SELECT name FROM pragma_table_info('feedback')").all().map(r => r.name);
  ok(fb.join(',') === 'id,at,page,kind,text', `C6c the feedback table is unchanged (${fb.join(',')})`);
}

// C7: wrangler.toml sends /api/count to the Worker (otherwise the static assets answer it with the page)
{
  const toml = fs.readFileSync('wrangler.toml', 'utf8');
  const m = toml.match(/^run_worker_first\s*=\s*(\[.*\])\s*$/m), list = m ? JSON.parse(m[1]) : [];
  ok(list.includes('/api/count') && list.includes('/api/feedback') && !list.some(p => p.startsWith('/data')), `C7 run_worker_first is ${JSON.stringify(list)}`);
}

// C8: the Worker's main file still has only `export default` (Cloudflare refuses other named exports; same rule as G9)
{ const src = fs.readFileSync('worker/feedback.mjs', 'utf8'), named = src.split('\n').filter(l => /^export\s+(?!default\b)/.test(l));
  ok(!named.length, `C8 worker/feedback.mjs has only \`export default\` (${named.length} named)`); }

console.log(fails ? `${fails} of ${n} FAILED` : `ALL PASSED (${n})`);
process.exit(fails ? 1 : 0);

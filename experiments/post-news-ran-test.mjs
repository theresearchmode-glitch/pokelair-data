// post-news.mjs `ran` timestamp test (Job 46, Nov 25).
// Checks:
//   1. Successful run writes a fresh ISO `ran` timestamp into out/post.json while leaving `checked` untouched.
//   2. Failed fetch (bad JSON / broken feed) does NOT refresh `ran`: preserves previous `ran` if one existed.
//   3. Failed fetch with no prior out/post.json writes no `ran`.
// Run: node experiments/post-news-ran-test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {load} from '../post-news.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'post-news-ran-'));
let fails = 0;
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails++; };

const src0 = fs.readFileSync(path.join(ROOT, 'app/src/data/post.js'), 'utf8');
const P0 = load(src0);
const feedOf = news => ({hash: 'x', list: news.map(n => ({id: Number(n.id.slice(1)), title: n.title, infoKind: n.kind, stAt: Date.parse(n.date) / 1000, endAt: Date.parse(n.date) / 1000 + 864e3, banner: '/en/img/x.png', link: new URL(n.url).pathname}))});

const run = (feed, oldDoc = null) => {
  const pf = path.join(tmp, 'post.js'), ff = path.join(tmp, 'feed.json'), sf = path.join(tmp, 'suggest.json'), df = path.join(tmp, 'post.json');
  fs.writeFileSync(pf, src0);
  fs.writeFileSync(ff, typeof feed === 'string' ? feed : JSON.stringify(feed));
  fs.rmSync(sf, {force: true});
  fs.rmSync(df, {force: true});
  if (oldDoc !== null) fs.writeFileSync(df, JSON.stringify(oldDoc));
  const r = spawnSync(process.execPath, [path.join(ROOT, 'post-news.mjs')], {
    env: {...process.env, FEED_FILE: ff, POST_FILE: pf, SUGGEST_FILE: sf, POST_OUT: df},
    encoding: 'utf8'
  });
  return {code: r.status, doc: fs.existsSync(df) ? JSON.parse(fs.readFileSync(df, 'utf8')) : null};
};

// 1. Successful run writes fresh ISO `ran` and keeps `checked` unchanged
{
  const t0 = Date.now() - 2000;
  const r = run(feedOf(P0.news));
  const ranMs = r.doc && typeof r.doc.ran === 'string' ? Date.parse(r.doc.ran) : NaN;
  ok(r.code === 0 && Number.isFinite(ranMs) && ranMs >= t0 && r.doc.checked === P0.checked,
    `1. successful run writes fresh ISO ran and preserves checked (code=${r.code}, ran=${r.doc && r.doc.ran}, checked=${r.doc && r.doc.checked})`);
}

// 2. Failed fetch preserves previous `ran` (never refreshes it)
{
  const oldRan = '2026-11-20T09:07:00.000Z';
  const r = run('<html>outage</html>', {checked: P0.checked, ran: oldRan, gifts: [], series: [], held: [], news: []});
  ok(r.code === 1 && r.doc && r.doc.ran === oldRan && r.doc.checked === P0.checked,
    `2. failed fetch preserves previous ran without refreshing (code=${r.code}, ran=${r.doc && r.doc.ran})`);
}

// 3. Failed fetch with no prior out/post.json writes no `ran`
{
  const r = run('<html>outage</html>', null);
  ok(r.code === 1 && r.doc && !('ran' in r.doc),
    `3. failed fetch with no prior post.json writes no ran (code=${r.code}, hasRan=${r.doc && ('ran' in r.doc)})`);
}

fs.rmSync(tmp, {recursive: true, force: true});
console.log(fails ? `post-news-ran-test: ${fails} FAILED` : 'post-news-ran-test: ALL PASSED');
process.exit(fails ? 1 : 0);

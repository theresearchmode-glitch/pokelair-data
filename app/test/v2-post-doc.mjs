// The daily Mystery Gifts and news document, meta/post (Nov 18, switch blocker 5 / D3: News and Gifts updated only on a republish).
// The page reads meta/post through the data loader (03-persistence.js META_KEYS) and V2.postTake (post-data.js). Checks, each able to fail:
//   PD-1  a headline and a gift that exist ONLY in the document (made up here, not in post.js) show on #news and #gifts
//   PD-2  with no document (meta/post missing) the pages show post.js's own list
//   PD-3  a malformed document (not an object, news not a list, entries with no title or date, an empty list) falls back to post.js's list,
//         with no page error and no "This page didn't load"
//   PD-4  a document link that is not https (javascript:, http:) never becomes a link; its headline still shows as plain text
//   PD-5  a --preview-data build carries meta/post as the other daily documents (only checked when PAGE is one and out/post.json exists)
// The document is handed to the page by wrapping its data store (window.__NP_CLAUDE / window.claude) before the page runs: meta/post answers
// with the test's document; every other document answers as the build would (the Preview's copy, or "not there").
// Usage: PAGE=app/dist/v2.html node app/test/v2-post-doc.mjs      (any --v2 build; a --preview-data one also runs PD-5)
import {chromium} from 'playwright'; import path from 'node:path'; import fs from 'node:fs'; import vm from 'node:vm';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'), root = path.resolve(import.meta.dirname, '../..');
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const src = fs.readFileSync(path.join(root, 'app/src/data/post.js'), 'utf8'), ctx = {}; vm.runInNewContext(src + ';this.POST = POST;', ctx); const POST = ctx.POST;
const newest = POST.news.slice().sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
const FAKE = 'Made-Up Test Headline 7731 For The Daily Document', FAKE_GIFT = 'Test Parcel 4417';
ok(!src.includes(FAKE) && !src.includes(FAKE_GIFT), 'the made-up headline and gift are not in post.js (so only the document can show them)');
const day = 864e5, iso = t => new Date(t).toISOString().replace('.000Z', 'Z'), now = Date.now();
const good = () => ({checked: iso(now), gifts: POST.gifts.concat([{id: 'g-test-parcel', kind: 'item', item: 'Training Ticket', name: FAKE_GIFT, amount: 3, how: 'Event Gift',
    start: iso(now - day), end: iso(now + 5 * day), src: ['https://champions-news.pokemon-home.com/en/page/999.html']}]), series: POST.series,
  news: [{id: 'n99901', date: iso(now - 3600e3), type: 'Announcement', kind: 7, title: FAKE, url: 'https://champions-news.pokemon-home.com/en/page/999.html'}].concat(POST.news)});

const b = await chromium.launch();
// open a page with meta/post answering `doc` (undefined = not there); returns what the pages show
async function look(doc, hashes = ['#news', '#gifts']) {
  const c = await b.newContext({viewport: {width: 1280, height: 900}}), q = await c.newPage(), errs = [];
  q.on('pageerror', e => errs.push(String(e.message || e)));
  await q.addInitScript(DOC => { window.__PL_TEST = 1;
    const wrap = base => ({use: async n => { if (n !== 'db') return base && base.use ? base.use(n) : null; const d = base && base.use ? await base.use('db') : null;
      return {doc: k => k === 'meta/post' ? {onSnapshot: cb => { setTimeout(() => cb({exists: DOC !== undefined, data: () => DOC}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}
        : d ? d.doc(k) : {onSnapshot: cb => { setTimeout(() => cb({exists: false, data: () => null}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}}; }});
    let inner = null; const outer = () => wrap(inner);
    Object.defineProperty(window, '__NP_CLAUDE', {configurable: true, get: outer, set: v => { inner = v; }}); }, doc);
  const out = {errs};
  for (const h of hashes) { await q.goto('file://' + PAGE + h); await q.waitForTimeout(2200);
    out[h] = await q.evaluate(() => ({text: (document.querySelector('#main') || document.body).innerText, hrefs: [...document.querySelectorAll('#main a[href]')].map(a => a.getAttribute('href'))})); }
  await c.close(); return out; }
const failed = r => r.errs.length || /didn’t load|didn't load/.test(r['#news'].text + r['#gifts'].text);

// PD-1
{ const r = await look(good());
  ok(r['#news'].text.includes(FAKE) && r['#news'].hrefs.includes('https://champions-news.pokemon-home.com/en/page/999.html'), `PD-1: #news shows the headline that is only in the document, linked to its source (${r['#news'].text.includes(FAKE)})`);
  ok(r['#gifts'].text.includes(FAKE_GIFT), `PD-1: #gifts shows the gift that is only in the document (${r['#gifts'].text.includes(FAKE_GIFT)})`);
  ok(!failed(r), `PD-1: no page error (${r.errs.join('; ') || 'none'})`); }
// PD-2
{ const r = await look(undefined);
  ok(!r['#news'].text.includes(FAKE) && r['#news'].text.includes(newest.title), `PD-2: no document: #news shows post.js's newest story ("${newest.title.slice(0, 50)}") and not the made-up one`);
  ok(!failed(r), `PD-2: no page error (${r.errs.join('; ') || 'none'})`); }
// PD-3
for (const [name, doc] of [['a string', 'not a document'], ['a list', [1, 2, 3]], ['news not a list', {gifts: [], news: 'x'}], ['no gifts', {news: good().news}],
  ['entries with no title or date', {gifts: [], news: [{id: 'n1'}, {id: 'n2', title: FAKE}, null, 7]}], ['an empty news list', {checked: iso(now), gifts: [], series: [], news: []}], ['null', null]]) {
  const r = await look(doc, ['#news']);
  ok(!r.errs.length && !/didn.t load/.test(r['#news'].text) && r['#news'].text.includes(newest.title) && !r['#news'].text.includes(FAKE),
    `PD-3: a malformed document (${name}) falls back to post.js's list with no error (${r.errs.join('; ') || 'no error'})`); }
// PD-4
{ const d = good(); d.news[0].url = 'javascript:alert(1)'; d.news.splice(1, 0, {id: 'n99902', date: iso(now - 7200e3), type: 'Announcement', kind: 7, title: 'Plain Http Test Story 5521', url: 'http://champions-news.pokemon-home.com/en/page/998.html'});
  const r = await look(d, ['#news']), h = r['#news'].hrefs;
  ok(r['#news'].text.includes(FAKE) && r['#news'].text.includes('Plain Http Test Story 5521') && !h.some(u => /^(javascript|http):/i.test(u)),
    `PD-4: javascript: and http: links never become links; both headlines still show (${h.filter(u => !/^https:/i.test(u) && !u.startsWith('#')).join(', ') || 'no bad links'})`); }
// PD-5
{ const html = fs.readFileSync(PAGE, 'utf8'), pv = html.includes('__NP_PREVIEW=1'), have = fs.existsSync(path.join(root, 'out/post.json'));
  if (pv && have) { const m = /const D=JSON\.parse\(("(?:[^"\\]|\\.)*")\)/.exec(html), pj = path.join(path.dirname(PAGE), 'preview.json');
    const D = m ? JSON.parse(JSON.parse(m[1])) : fs.existsSync(pj) ? JSON.parse(fs.readFileSync(pj, 'utf8')) : {}, doc = D['meta/post'], file = JSON.parse(fs.readFileSync(path.join(root, 'out/post.json'), 'utf8'));
    ok(doc && Array.isArray(doc.news) && JSON.stringify(doc) === JSON.stringify(file), `PD-5: the Preview build carries meta/post, identical to out/post.json (${doc ? doc.news.length + ' stories' : 'missing'})`); }
  else console.log(`  skip  PD-5: ${pv ? 'no out/post.json' : 'not a --preview-data build'}`); }
await b.close();
console.log(fails.length ? `FAILED: ${fails.length}` : 'ALL PASS'); process.exit(fails.length ? 1 : 0);

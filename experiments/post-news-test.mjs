// post-news.mjs check (Nov 18; morning questions 9a/9c): the daily read of the official news feed. No network: it feeds the script
// saved feeds made from today's post.js. Checks:
//   - today's feed (every story post.js has) adds nothing; a feed with two new stories adds exactly those two, newest first, as
//     headline / date / type / link only, on the official host over https; post.js still loads and passes post-data-test's rules
//   - a new Campaign or Championships item is a gift SUGGESTION only (out/post-suggest.json), never a gift in post.js; Battle Pass
//     and Online Competition items are news only (Sim, Nov 18: the Gifts page is Mystery Gifts only)
//   - POST.checked (when a person last checked the gift list) is not touched
//   - fail safe: a feed that isn't a list, items with unknown fields, an off-site or http link, a title with markup: post.js unchanged,
//     exit 1 (or the bad item skipped); the script never names the code redemption site
// Usage: node experiments/post-news-test.mjs
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {execFileSync} from 'node:child_process';
import {load} from '../post-news.mjs';
const root = new URL('../', import.meta.url).pathname, tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'post-news-'));
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const src0 = fs.readFileSync(path.join(root, 'app/src/data/post.js'), 'utf8'), P0 = load(src0);
const feedOf = news => ({hash: 'x', list: news.map(n => ({id: Number(n.id.slice(1)), title: n.title, infoKind: n.kind, stAt: Date.parse(n.date) / 1000, endAt: Date.parse(n.date) / 1000 + 864e3, banner: '/en/img/x.png', link: new URL(n.url).pathname}))});
const run = (feed, extra = {}) => { const pf = path.join(tmp, 'post.js'), ff = path.join(tmp, 'feed.json'), sf = path.join(tmp, 'suggest.json');
  fs.writeFileSync(pf, src0); fs.writeFileSync(ff, typeof feed === 'string' ? feed : JSON.stringify(feed)); fs.rmSync(sf, {force: true});
  let code = 0, out = ''; try { out = execFileSync('node', [path.join(root, 'post-news.mjs')], {env: {...process.env, FEED_FILE: ff, POST_FILE: pf, SUGGEST_FILE: sf, ...extra}, encoding: 'utf8', stdio: 'pipe'}); }
  catch (e) { code = e.status; out = String(e.stdout) + String(e.stderr); }
  return {code, out, src: fs.readFileSync(pf, 'utf8'), sug: fs.existsSync(sf) ? JSON.parse(fs.readFileSync(sf, 'utf8')) : null}; };
const dataTest = pf => { try { execFileSync('node', [path.join(root, 'experiments/post-data-test.mjs')], {env: {...process.env, POST_FILE: pf}, stdio: 'pipe'}); return true; } catch (e) { return false; } };

// 1. today's feed: nothing new
{ const r = run(feedOf(P0.news)); ok(r.code === 0 && r.src === src0 && !r.sug, `today's feed (${P0.news.length} stories, all in post.js) changes nothing (exit ${r.code}; ${r.out.trim().split('\n')[0]})`); }
// 2. two new stories (one a Battle Pass item, one a Campaign item), plus today's
{ const t = Date.parse('2026-11-25T02:00:00Z') / 1000, feed = feedOf(P0.news);
  feed.list.unshift({id: 901, title: 'Season M-9 Battle <i>Passes</i>​', infoKind: 16, stAt: t, endAt: t + 9e5, banner: '/en/img/a.png', link: '/en/page/901.html'},
    {id: 902, title: 'A New Mystery Gift Campaign', infoKind: 6, stAt: t + 3600, endAt: t + 9e5, banner: '/en/img/b.png', link: '/en/page/902.html'});
  const r = run(feed), P = load(r.src), top = P.news.slice(0, 2);
  ok(r.code === 0 && P.news.length === P0.news.length + 2 && top[0].id === 'n902' && top[1].id === 'n901', `two new stories are added at the top, newest first (${top.map(n => n.id).join(', ')}; ${P.news.length} stories)`);
  ok(top[1].title === 'Season M-9 Battle Passes' && top[1].type === 'Battle Pass' && top[0].type === 'Campaign' && top[0].url === 'https://champions-news.pokemon-home.com/en/page/902.html'
    && top.every(n => Object.keys(n).join() === 'id,date,type,kind,title,url'), `each is headline, date, type and link only; markup and invisible spaces taken out of titles (${JSON.stringify(top[1])})`);
  ok(P.gifts.length === P0.gifts.length && JSON.stringify(P.gifts) === JSON.stringify(P0.gifts) && P.checked === P0.checked, 'no gift is added or changed, and POST.checked is left alone');
  ok(r.sug && r.sug.length === 1 && r.sug[0].id === 'n902', `only the Campaign item is suggested as a possible gift, for a person to check; the Battle Pass item is news only (${r.sug && r.sug.map(x => x.id)})`);
  const pf = path.join(tmp, 'after.js'); fs.writeFileSync(pf, r.src); ok(dataTest(pf), 'the updated post.js passes experiments/post-data-test.mjs');
  const again = path.join(tmp, 'feed2.json'); fs.writeFileSync(again, JSON.stringify(feed)); const pf2 = path.join(tmp, 'post.js'); fs.writeFileSync(pf2, r.src);
  execFileSync('node', [path.join(root, 'post-news.mjs')], {env: {...process.env, FEED_FILE: again, POST_FILE: pf2, SUGGEST_FILE: path.join(tmp, 's2.json')}, stdio: 'pipe'});
  ok(fs.readFileSync(pf2, 'utf8') === r.src, 'run twice on the same feed: the second run adds nothing'); }
// 3. fail safe
for (const [name, feed] of [['not JSON', '<html>blocked</html>'], ['not a list', {hash: 'x', message: 'moved'}], ['items with other fields', {list: [{uid: 1, name: 'x'}, {uid: 2, name: 'y'}]}]]) {
  const r = run(feed); ok(r.code === 1 && r.src === src0, `fail safe, ${name}: exit 1 and post.js kept as it is (exit ${r.code})`); }
{ const feed = feedOf(P0.news); feed.list.unshift({id: 903, title: 'Off-site', infoKind: 7, stAt: 1.8e9, link: 'https://example.com/x.html'}, {id: 904, title: 'Plain http', infoKind: 7, stAt: 1.8e9, link: 'http://champions-news.pokemon-home.com/en/page/904.html'},
    {id: 905, title: 'Unknown kind', infoKind: 99, stAt: 1.8e9, link: '/en/page/905.html'});
  const r = run(feed); ok(r.code === 0 && r.src === src0, `an off-site link, an http link or an unknown category is skipped, never added (exit ${r.code})`); }
const code = fs.readFileSync(path.join(root, 'post-news.mjs'), 'utf8');
ok(!/serial-web|redeem|redemption-api|rewards\.pokemon/i.test(code.replace(/^\/\/.*$/gm, '')), 'the script never calls the code redemption site or its API');
ok(/from '\.\/http\.mjs'/.test(code) && /politeFetch\(FEED/.test(code), 'it reads the feed through http.mjs (the one NastyPlot-data User-Agent, paced)');
fs.rmSync(tmp, {recursive: true, force: true});
console.log(fails ? `FAILED: ${fails}` : 'ALL PASS'); process.exit(fails ? 1 : 0);

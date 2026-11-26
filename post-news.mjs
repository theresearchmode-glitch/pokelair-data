// The Champions Dispatch's news, from the official in-game news feed, once a day (Sim, Nov 18: morning questions 9a and 9c,
// "recommend for all is good"). Source and terms: docs/legal-sources.md ("Official in-game news feed").
//   News: automatic. New feed items are added to POST.news in app/src/data/post.js as headline, date, type and link only (no
//         article text, no banner images: no licence found for either).
//   Gifts: suggested only. A new item in a gift-giving category (6 Campaign, 14 Championships) is written to out/post-suggest.json
//         for a person to check; this script never writes a gift into post.js. (Sim, Nov 18: the Gifts page shows only Mystery Gifts,
//         Serial Code and Event Gift; Battle Pass 16 and Online Competition 13 items are news only.)
//   Codes: manual. Shared codes are almost never in the feed; a person adds each one with 2 reputable outlets (or an official post),
//         following the rule in docs/legal-sources.md. The code redemption site/API is never called.
// Fail safe: if the feed can't be read or its shape is not what we know, post.js is left as it is and the script exits 1 (the daily
// job's `|| node skip.mjs` then keeps yesterday's list and says so).
// One request a day, with the daily job's User-Agent (http.mjs, NastyPlot-data/1.0 with the repo and a contact address).
//   node post-news.mjs              read the feed, update post.js and out/post-suggest.json
//   node post-news.mjs --dry        print what would change, write nothing
//   FEED_FILE=path node post-news.mjs   read a saved feed instead of the network (tests: experiments/post-news-test.mjs)
//   POST_FILE=path                  the post.js to update (default app/src/data/post.js); SUGGEST_FILE=path (default out/post-suggest.json)
//   POST_OUT=path                   the daily document (default out/post.json)
// The daily document (Nov 18, switch blocker 5 / D3): post.js is built into the page, so a new headline in it reached players only on a
// republish. Every run also writes out/post.json, the same shape as POST (checked, gifts, series, held, news) from post.js as it stands
// after the run; the morning refresh stores it as meta/post and the page reads it (03-persistence.js META_KEYS 'post' -> V2.postTake in
// post-data.js), falling back to the built-in POST when it is missing or broken. When the feed can't be read, out/post.json is still
// written from the unchanged post.js (yesterday's news, plus any gift a person added) and the script exits 1 as before. A document over
// 200,000 bytes (split-docs.mjs's limit) is not written: yesterday's file stays. Wired in .github/workflows/update.yml (design branch).
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
import {politeFetch} from './http.mjs';

export const FEED = 'https://champions-news.pokemon-home.com/en/json/list.json';
export const BASE = 'https://champions-news.pokemon-home.com';
// the feed's category numbers (documented in the official site's own JSON; docs/rebuild/research/mystery-gift-sources-nov18.md) and the
// words post.js uses for them ('Online Competition' -> 'Tournament', 'News' (notice) -> 'Announcement')
export const TYPES = {3: 'Maintenance', 4: 'Update', 6: 'Campaign', 7: 'Announcement', 11: 'Ranked Battles', 12: 'Regulations', 13: 'Tournament',
  14: 'Championships', 15: 'Roster', 16: 'Battle Pass', 17: 'Offline Event', 18: 'Issue'};
export const GIFT_KINDS = [6, 14]; // may hold a Mystery Gift (event gift); suggested for a person to check, never added automatically

// the feed's items, whatever the wrapper ({list: [...]}, {data: [...]}, or a bare array); null if the shape is not what we know
export function items(j) { const a = Array.isArray(j) ? j : j && (j.list || j.data || j.items); return Array.isArray(a) ? a : null; }
const clean = t => String(t == null ? '' : t).replace(/<[^>]*>/g, '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
const iso = s => { const n = Number(s); if (!Number.isFinite(n) || n <= 0) return null; return new Date(n < 1e12 ? n * 1000 : n).toISOString().replace('.000Z', 'Z'); };
// one feed item -> one POST.news entry (or null when a field we need is missing or not safe)
export function toNews(x) { if (!x || typeof x !== 'object') return null;
  const id = String(x.id == null ? '' : x.id).replace(/\D/g, ''), kind = Number(x.infoKind), title = clean(x.title), date = iso(x.stAt);
  let url = ''; try { const u = new URL(String(x.link || ''), BASE); url = u.protocol === 'https:' && u.hostname === new URL(BASE).hostname ? u.href : ''; } catch (e) { url = ''; }
  if (!id || !title || !date || !url || !TYPES[kind]) return null;
  // a balance change filed under Maintenance (kind 3) is labelled Update, so it reads as the news it is (Nov 18)
  return {id: 'n' + id, date, type: kind === 3 && /balance/i.test(title) ? 'Update' : TYPES[kind], kind, title, url}; }

// what changes: the new news entries (newest first) and the gift suggestions; problems = items that could not be read
export function plan(feed, POST) { const list = items(feed); if (!list) return {error: 'the feed is not a list of items (its shape changed?)'};
  const have = new Set((POST.news || []).map(n => n.id)), problems = [], add = [], suggest = [];
  for (const x of list) { const n = toNews(x); if (!n) { problems.push(JSON.stringify(x).slice(0, 120)); continue; }
    if (have.has(n.id)) continue; have.add(n.id); add.push(n); if (GIFT_KINDS.includes(n.kind)) suggest.push({...n, why: 'a ' + n.type + ' item may give an event gift: a person reads the page and adds it to post.js only if it is a Mystery Gift'}); }
  if (list.length && problems.length === list.length) return {error: 'no feed item could be read (its fields changed?)'};
  add.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return {add, suggest, problems}; }

// write the new entries at the top of POST.news in post.js's text, one line each as the file already has them
export function writeNews(src, add) { if (!add.length) return src;
  const at = src.indexOf('  news: [\n'); if (at < 0) throw new Error('post.js has no "  news: [" line');
  const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  const lines = add.map(n => `    {id: ${q(n.id)}, date: ${q(n.date)}, type: ${q(n.type)}, kind: ${n.kind}, title: ${q(n.title)}, url: ${q(n.url)}},\n`).join('');
  const i = at + '  news: [\n'.length, rest = src.slice(i);
  /* into an empty list the last new line must not end with a comma before "]" (fine in JS, but post.js keeps none) */
  return src.slice(0, i) + (/^\s*\]/.test(rest) ? lines.replace(/,\n$/, '\n') : lines) + rest; }
export const load = src => { const c = {}; vm.runInNewContext(src + ';this.POST = POST;', c); return c.POST; };
// the daily document meta/post: POST's own keys, news links https only (a non-https one is dropped; the page checks again with V2.safeUrl)
export const DOC_LIMIT = 200000;
export function postDoc(P) { const https = u => { try { return new URL(String(u)).protocol === 'https:'; } catch (e) { return false; } };
  return {checked: P.checked || null, gifts: P.gifts || [], series: P.series || [], held: P.held || [], news: (P.news || []).filter(n => n && https(n.url))}; }
function writeDoc(P, file) { const j = JSON.stringify(postDoc(P)), n = Buffer.byteLength(j);
  if (n > DOC_LIMIT) { console.error(`post-news: out/post.json would be ${n} bytes (limit ${DOC_LIMIT}); yesterday's file kept`); return false; }
  fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, j); console.log(`post-news: ${path.basename(file)} written (${n} bytes, ${postDoc(P).news.length} stories, ${(P.gifts || []).length} gifts)`); return true; }

async function main() { const root = path.dirname(fileURLToPath(import.meta.url)), dry = process.argv.includes('--dry');
  const postFile = process.env.POST_FILE || path.join(root, 'app/src/data/post.js'), sugFile = process.env.SUGGEST_FILE || path.join(root, 'out/post-suggest.json'),
    docFile = process.env.POST_OUT || path.join(root, 'out/post.json');
  /* the feed failed or changed shape: post.js is kept, and the daily document is still written from it (yesterday's list) */
  const keep = why => { console.error(`post-news: ${why}; post.js kept as it is`); if (!dry) { try { writeDoc(load(fs.readFileSync(postFile, 'utf8')), docFile); } catch (e) { console.error(`post-news: out/post.json not written (${e.message})`); } } process.exit(1); };
  let feed; try { feed = process.env.FEED_FILE ? JSON.parse(fs.readFileSync(process.env.FEED_FILE, 'utf8'))
    : await politeFetch(FEED, {headers: {Accept: 'application/json'}}).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }
  catch (e) { keep(`the feed could not be read (${e.message})`); }
  const src = fs.readFileSync(postFile, 'utf8'), P = load(src), p = plan(feed, P);
  if (p.error) keep(p.error);
  const out = writeNews(src, p.add), after = load(out); /* the written file must still load and hold every old story plus the new ones */
  if (after.news.length !== P.news.length + p.add.length) keep('the written post.js did not read back');
  console.log(`post-news: ${p.add.length} new ${p.add.length === 1 ? 'story' : 'stories'}, ${p.suggest.length} gift ${p.suggest.length === 1 ? 'suggestion' : 'suggestions'} to check, ${p.problems.length} unreadable items`);
  for (const n of p.add) console.log(`  + ${n.date.slice(0, 10)} ${n.type}: ${n.title}`);
  for (const x of p.problems) console.log(`  ? ${x}`);
  if (dry) return;
  if (p.add.length) fs.writeFileSync(postFile, out); writeDoc(after, docFile); /* POST.checked is left alone: it is when a person last checked the gift list (the Post Room's note) */
  if (p.suggest.length) { fs.mkdirSync(path.dirname(sugFile), {recursive: true}); let old = []; try { old = JSON.parse(fs.readFileSync(sugFile, 'utf8')); } catch (e) {}
    const ids = new Set(old.map(x => x.id)); fs.writeFileSync(sugFile, JSON.stringify(old.concat(p.suggest.filter(x => !ids.has(x.id))), null, 1)); } }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();

// New-page sync (switch readiness Nov 18, Tests 3 and 5): after the switch the new page must read the same synced data the live page
// reads today. Both builds are opened with ONE fake data store that answers with today's daily documents (out/, mapped to meta/* as
// the morning refresh writes them, as experiments/c13-check.mjs does) and a signed-in account. Checks, each able to fail:
//   SY-1  the new page subscribes to every meta/* document the live page subscribes to (it may read more, e.g. meta/post), and reads
//         the same account document (data/users/<id>/state)
//   SY-2  the numbers both pages work from agree: the ratings (every rated Pokémon's rating and its tournament use, wins and games, in
//         order), the tournament team count, the data date
//   SY-3  those numbers come from the store, not from what was built into the page: the store's documents are changed (a made-up
//         date; two Pokémon's numbers swapped in meta/perf), and both pages must move the same way
// The live page is today's build (dist/page.html, `node app/build.mjs`); the new one is dist/v2.html from `node app/build.mjs --v2`
// (any non-public build: the test needs the page's test hook, window.__ev with window.__PL_TEST set).
// Usage: node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-sync.mjs     (OLD=... NEW=... to point at other builds)
import {chromium} from 'playwright'; import {perfDoc} from '../data-docs.mjs'; import path from 'node:path'; import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OLD = path.resolve(process.env.OLD || path.join(ROOT, 'app/dist/page.html')), NEW = path.resolve(process.env.NEW || path.join(ROOT, 'app/dist/v2.html'));
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {};
// the daily documents, as the refresh task writes them (the mapping of app/test/run.mjs and the behaviour harness, plus practice and post)
const DOCS = {'meta/results': L.results, 'meta/perf': perfDoc(L, rd('perf.json')), 'meta/doubles_tour': rd('meta_tour.json'),
  'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'),
  'meta/events': rd('events.json'), 'meta/history': rd('history.json'), 'meta/track': rd('track.json'), 'meta/weekly': rd('weekly.json'),
  'meta/calendar': rd('calendar.json'), 'meta/practice': rd('practice.json'), 'meta/post': rd('post.json')};
for (const k of Object.keys(DOCS)) if (DOCS[k] == null) delete DOCS[k];
ok(Object.keys(DOCS).length >= 8, `today's daily documents found in out/ (${Object.keys(DOCS).length}: ${Object.keys(DOCS).map(k => k.slice(5)).join(', ')})`);
for (const [f, n] of [[OLD, 'live page (dist/page.html)'], [NEW, 'new page (dist/v2.html)']]) if (!fs.existsSync(f)) { console.log(`  FAIL  ${n} not built: ${f}`); process.exit(1); }

// the old page has no test hook of its own: add it at the hook point the behaviour harness uses (harness.mjs)
const tmp = path.join(ROOT, `app/dist/_sync-old-${process.pid}.html`);
{ const h = fs.readFileSync(OLD, 'utf8'); ok(h.includes('render();setView(view,false);'), 'the live page has its hook point (render();setView(view,false);)');
  fs.writeFileSync(tmp, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + h.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);')); }
process.on('exit', () => { try { fs.unlinkSync(tmp); } catch (e) {} });

const b = await chromium.launch();
// open one page with the store; returns the documents it subscribed to and what it works from
async function look(file, docs) {
  const c = await b.newContext({viewport: {width: 1280, height: 900}}), p = await c.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  await p.addInitScript(D => { window.__PL_TEST = 1; window.__SYNC_READ = [];
    const snap = (k, v) => ({exists: v != null, data: () => v, metadata: {}});
    const doc = k => ({onSnapshot: cb => { window.__SYNC_READ.push('sub ' + k); setTimeout(() => cb(snap(k, D[k])), 5); return () => {}; },
      get: async () => { window.__SYNC_READ.push('get ' + k); return snap(k, D[k]); }, set: async () => {}, update: async () => {}});
    const store = {use: async n => n === 'db' ? {doc} : n === 'user' ? {id: async () => 'u-sync-test'} : null};
    /* the new page reads window.__NP_CLAUDE first, then window.claude; give both the same store (a Preview build's own __NP_CLAUDE is replaced) */
    Object.defineProperty(window, '__NP_CLAUDE', {configurable: true, get: () => store, set: () => {}}); window.claude = store; }, docs);
  await p.goto('file://' + file + '#home'); await p.waitForTimeout(3500);
  const r = await p.evaluate(() => { const ev = window.__ev; if (typeof ev !== 'function') return {hook: false, read: window.__SYNC_READ};
    const f = s => { try { return ev(s); } catch (e) { return 'ERR ' + String(e.message || e).slice(0, 80); } };
    return {hook: true, read: [...new Set(window.__SYNC_READ)].sort(),
      rat: f('JSON.stringify(lairRows().filter(x => x.r && x.r.tc).map(x => x.p.n + " " + Math.round(x.r.total * 100) / 100 + " " + JSON.stringify(x.r.src && x.r.src.tour)))'),
      teams: f('String((RES && RES.teams) || "")'), date: f('dataDateText()')}; });
  await c.close(); return Object.assign(r, {errs}); }

const o = await look(tmp, DOCS), n = await look(NEW, DOCS);
ok(o.hook && n.hook, `both pages answer the test hook (live ${o.hook}, new ${n.hook}; the new build must not be --public; errors: ${o.errs.concat(n.errs).join(' | ') || 'none'})`);
if (!o.hook || !n.hook) { await b.close(); process.exit(1); }
ok(!o.errs.length && !n.errs.length, `no page errors (live: ${o.errs.join(' | ') || 'none'}; new: ${n.errs.join(' | ') || 'none'})`);
const subs = x => x.read.filter(s => /^sub meta\//.test(s)).map(s => s.slice(4).replace(/_2$/, '')), so = [...new Set(subs(o))], sn = new Set(subs(n));
const missing = so.filter(k => !sn.has(k));
ok(so.length >= 8 && !missing.length, `SY-1 the new page subscribes to every daily document the live page does (live ${so.length}, new ${sn.size}; missing on new: ${missing.join(', ') || 'none'}; new only: ${[...sn].filter(k => !so.includes(k)).join(', ') || 'none'})`);
const acc = x => x.read.filter(s => /data\/users\//.test(s)).map(s => s.replace(/^(sub|get) /, ''));
ok(acc(o).length && JSON.stringify([...new Set(acc(o))]) === JSON.stringify([...new Set(acc(n))]), `SY-1 both read the same account document (live ${[...new Set(acc(o))].join(', ') || 'none'}; new ${[...new Set(acc(n))].join(', ') || 'none'})`);
const nr = s => { try { return JSON.parse(s); } catch (e) { return []; } }, ro = nr(o.rat), rn = nr(n.rat);
ok(ro.length > 50 && o.rat === n.rat, `SY-2 the ratings agree (${ro.length} rated Pokémon on live, ${rn.length} on new; first difference: ${ro.findIndex((x, i) => x !== rn[i]) < 0 && ro.length === rn.length ? 'none' : (() => { const i = ro.findIndex((x, i) => x !== rn[i]); return '#' + (i + 1) + ' ' + ro[i] + ' vs ' + rn[i]; })()})`);
ok(o.teams && o.teams === n.teams, `SY-2 the tournament team count agrees (live ${o.teams}, new ${n.teams})`);
ok(o.date && o.date === n.date, `SY-2 the data date agrees (live "${o.date}", new "${n.date}")`);

// SY-3: change the store and both must follow.
// (a) a made-up date (40 days ago) on every daily document;
// (b) meta/perf made fresh (dated today: the pages use a ratings part only within its age limit, else the built-in snapshot) with the
//     first Pokémon's numbers in its tournament and teammate-adjusted lists swapped with the 30th's, so the ratings can only follow
//     if the page reads the store. A fresh copy WITHOUT the swap is opened too, so the change is the swap's, not the date's.
const copy = () => JSON.parse(JSON.stringify(DOCS)), D2 = copy(), old = new Date(Date.now() - 40 * 864e5).toISOString().slice(0, 10), today = new Date().toISOString().slice(0, 10);
for (const k of Object.keys(D2)) if (D2[k] && typeof D2[k] === 'object' && !Array.isArray(D2[k]) && 'updated' in D2[k]) D2[k].updated = old;
const o2 = await look(tmp, D2), n2 = await look(NEW, D2);
ok(o2.date !== o.date && o2.date === n2.date, `SY-3 a changed data date reaches both pages the same way (live "${o.date}" -> "${o2.date}", new "${n.date}" -> "${n2.date}")`);
const fresh = () => { const D = copy(), P = D['meta/perf']; if (P) { P.updated = today; for (const k of ['tour', 'adj']) if (P[k]) P[k].updated = today; } return D; };
const D3 = fresh(), D4 = fresh(); let swapped = '';
{ const P = D4['meta/perf'], parts = P ? ['tour', 'adj'].filter(k => P[k] && Array.isArray(P[k].rows) && P[k].rows.length > 30) : [];
  for (const k of parts) { const rows = P[k].rows, a = rows[0], z = rows[29]; swapped = swapped || a[0] + ' with ' + z[0]; rows[0] = [a[0], ...z.slice(1)]; rows[29] = [z[0], ...a.slice(1)]; }
  if (parts.length) swapped += ' in meta/perf ' + parts.join(' and '); }
const o3 = await look(tmp, D3), n3 = await look(NEW, D3), o4 = await look(tmp, D4), n4 = await look(NEW, D4);
ok(o3.rat === n3.rat, `SY-3 with a fresh meta/perf the ratings still agree (live ${nr(o3.rat).length}, new ${nr(n3.rat).length} rated)`);
ok(swapped && o4.rat !== o3.rat && n4.rat !== n3.rat && o4.rat === n4.rat, `SY-3 swapped numbers (${swapped || 'no lists found in meta/perf'}) move the ratings on both pages the same way (live changed: ${o4.rat !== o3.rat}, new changed: ${n4.rat !== n3.rat}, agree: ${o4.rat === n4.rat})`);
await b.close();
console.log(`v2-sync: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

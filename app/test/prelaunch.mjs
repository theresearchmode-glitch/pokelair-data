// Pre-launch checks (Nov 2): the "Data as of" date, the amber "older than usual" note (stale doc -> note on Home and Meta,
// fresh -> none, missing doc -> no error), and anonymous feedback / usage (nothing identifying stored, the note shows).
// Uses the built page (run app/build.mjs first; app/test/run.mjs does). Usage: node app/test/prelaunch.mjs
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('..', import.meta.url)), OUT = APP + '../out/';
const page = APP + 'dist/prelaunch-test.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), DAY = 864e5, iso = ms => new Date(ms).toISOString();
// every document dated today, so the test means the same on any day
const fresh = () => { const now = Date.now(), d = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: iso(now).slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/practice': rd('practice.json'), 'meta/track': rd('track.json')};
  for (const k of ['meta/doubles_tour', 'meta/teams', 'meta/model', 'meta/doubles_ingame', 'meta/events', 'meta/practice', 'meta/track', 'meta/doubles']) if (d[k]) d[k] = {...d[k], updated: iso(now)};
  return d; };
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const b = await chromium.launch();
async function open(D, {width = 390, scheme = 'light'} = {}) {
  const ctx = await b.newContext({viewport: {width, height: 844}, isMobile: width < 700, hasTouch: width < 700, colorScheme: scheme}), pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { window.__store = {}; const S = window.__store;
    const doc = p => ({get: async () => ({exists: p in S, data: () => S[p]}), set: async d => { S[p] = JSON.parse(JSON.stringify(d)); },
      update: async d => { if (!(p in S)) throw Object.assign(new Error('missing'), {code: 'invalid_argument'}); const m = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') m(a[k], b[k]); else a[k] = JSON.parse(JSON.stringify(b[k])); } }; m(S[p], d); },
      onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }});
    window.claude = {use: async n => n === 'db' ? {doc, collection: c => ({get: async () => ({docs: Object.keys(S).filter(k => k.startsWith(c + '/')).map(k => ({id: k, data: () => S[k]}))})})}
      : n === 'user' ? {isOwner: () => false, can: () => true, id: async () => 'viewer_7f3a9c'} : null};
    try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {} }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(2500);
  return {pg, ctx, errs, ev: c => pg.evaluate(c => window.__ev(c), c)}; }
const shown = (pg, sel) => pg.$eval(sel, e => !e.hidden && getComputedStyle(e).display !== 'none' && e.getClientRects().length > 0).catch(() => false);

console.log('\n== data date and the "older than usual" note');
{ const {pg, ctx, errs, ev} = await open(fresh());
  await ev("setView('home')"); await pg.waitForTimeout(300);
  ok(await pg.$eval('#healthBar', e => e.hidden), 'fresh data: no note');
  ok(/data as of [A-Z][a-z]{2} \d{1,2}/.test(await pg.textContent('#homeOut')), 'phone Home shows "data as of <date>"');
  ok(/^Data as of /.test(await ev('dataDateText()')), 'the data date reads "Data as of …" (header, side menu)');
  await ev("setView('ratings')"); await pg.waitForTimeout(400);
  ok(/data as of [A-Z][a-z]{2} \d{1,2}/.test(await pg.textContent('[data-pane="ratings"]')), 'Meta ratings head shows "data as of <date>"');
  ok(!errs.length, 'no page errors ' + errs.join(' | ')); await ctx.close(); }
for (const scheme of ['light', 'dark']) {
  const D = fresh(), now = Date.now(); D['meta/model'] = {...D['meta/model'], updated: iso(now - 9 * DAY)}; D['meta/teams'] = {...D['meta/teams'], updated: iso(now - 4 * DAY)}; delete D['meta/practice'];
  const {pg, ctx, errs, ev} = await open(D, {scheme});
  await ev("setView('home')"); await pg.waitForTimeout(300);
  const t = await pg.textContent('#healthBar'), day = new Date(now - 9 * DAY).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  ok(await shown(pg, '#healthBar'), `${scheme}: stale doc -> note shows on Home`);
  ok(/^Some data is older than usual:/.test(t) && t.includes(`Win model, last updated ${day}`) && /Top teams, last updated/.test(t), `${scheme}: note names each stale source and its date ("${t.slice(0, 110)}…")`);
  ok(!/Team preview practice/.test(t), `${scheme}: a missing document is not listed and breaks nothing`);
  const c = await pg.$eval('#healthBar', e => { const s = getComputedStyle(e); return [s.borderTopColor, s.backgroundColor, s.color]; });
  ok(!c.some(x => { const m = x.match(/\d+/g).map(Number); return m[0] > 180 && m[1] < 90 && m[2] < 90; }), `${scheme}: amber, not red (${c.join(' / ')})`);
  await ev("setView('meta')"); await pg.waitForTimeout(300); ok(await shown(pg, '#healthBar'), `${scheme}: note shows on the Meta pages`);
  await ev("setView('calc')"); await pg.waitForTimeout(300); ok(!(await shown(pg, '#healthBar')), `${scheme}: note stays off the tool pages (calc)`);
  ok(!errs.length, 'no page errors ' + errs.join(' | ')); await ctx.close(); }

console.log('\n== anonymous feedback and usage');
{ const {pg, ctx, errs, ev} = await open(fresh());
  await ev("setView('calc')"); await pg.waitForTimeout(300);
  await pg.click('.legal .fbbtn'); await pg.waitForTimeout(200);
  ok(await shown(pg, '#fbAnon') && (await pg.textContent('#fbAnon')).trim() === "Anonymous — please don't include personal info like your name or email.", 'the anonymity note shows under the box');
  ok(!(await pg.$('#fbSheet input[type="email"], #fbSheet input[type="tel"], #fbSheet input[name*="name" i], #fbSheet input[name*="contact" i]')), 'no field asks for contact details');
  await pg.fill('#fbText', 'Calc says 45.2 - 53.1% but should KO. Mail me at kid.player@example.com or +1 (555) 123-4567, I am @ashk on discord. Incineroar @ Sitrus Berry');
  await pg.click('#fbSend'); await pg.waitForTimeout(400);
  const st = await pg.evaluate(() => window.__store['feedback/viewer_7f3a9c']), m = st && Object.values(st.m || {});
  ok(m && m.length === 1, 'message saved (the document path is the viewer\'s opaque id, as the db rules need)');
  const e = m && m[0];
  ok(e && Object.keys(e).sort().join() === 'd,k,t,v,w', `stored fields are only text, kind, page, phone/desktop, date (${e && Object.keys(e).sort().join()})`);
  ok(e && /^\d{4}-\d{2}-\d{2}$/.test(e.d), `date only, no time (${e && e.d})`);
  ok(e && !JSON.stringify(e).includes('viewer_7f3a9c') && !JSON.stringify(st).includes('viewer_7f3a9c'), 'no viewer id inside the document');
  ok(e && !/example\.com|555|@ashk/.test(e.t) && /\[email removed\]/.test(e.t) && /\[number removed\]/.test(e.t) && /\[handle removed\]/.test(e.t), 'email, phone number and @handle removed before saving');
  ok(e && /45\.2 - 53\.1%/.test(e.t) && /Incineroar @ Sitrus Berry/.test(e.t), 'damage numbers and "Mon @ Item" are kept');
  ok(Object.keys(st.m)[0].length >= 10, 'message key is random, not a timestamp (a time in base 36 is 8 characters)');
  // report a mistake: same anonymity
  await ev("lairSheet('Incineroar')"); await pg.waitForTimeout(300); await pg.click('#lairSheet .fbmis'); await pg.waitForTimeout(200);
  ok(await shown(pg, '#fbAnon'), 'the note shows on Report a mistake too');
  await pg.click('#fbSend'); await pg.waitForTimeout(400);
  { const x = Object.values((await pg.evaluate(() => window.__store['feedback/viewer_7f3a9c'])).m).find(v => v.k === 'mistake'); ok(x && Object.keys(x).sort().join() === 'c,d,k,t,v,w' && /^\d{4}-\d{2}-\d{2}$/.test(x.d), 'mistake report stores only the on-screen context plus the same fields'); }
  await ev("lairClose()");
  // usage counts
  await ev("setView('meta');setView('calc');usageFlush()"); await pg.waitForTimeout(400);
  const u = await pg.evaluate(() => window.__store['usage/viewer_7f3a9c']);
  ok(u && Object.keys(u).join() === 's', `usage doc holds only per-visit counts (${u && Object.keys(u).join()})`);
  const v = u && Object.values(u.s)[0];
  ok(v && Object.keys(v).sort().join() === 'c,d,w' && /^\d{4}-\d{2}-\d{2}$/.test(v.d) && Object.values(v.c).every(n => typeof n === 'number'), 'each visit: counts, date, phone/desktop only');
  ok(u && !JSON.stringify(u).includes('viewer_7f3a9c'), 'no viewer id inside the usage document');
  // privacy page matches
  await ev("aboutOpen('priv')"); await pg.waitForTimeout(300);
  const pv = await pg.textContent('#abt-priv');
  ok(/Anonymous/.test(pv) && /date \(not the time\)/.test(pv) && /removed before it's saved/.test(pv) && /no first- or last-visit dates/.test(pv) && /same anonymous ID/.test(pv), 'Privacy page describes exactly what is kept');
  ok(!errs.length, 'no page errors ' + errs.join(' | ')); await ctx.close(); }
await b.close(); fs.unlinkSync(page);
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);

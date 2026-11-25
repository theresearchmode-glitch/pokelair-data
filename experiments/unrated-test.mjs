// Not rated yet (Sim, Nov 25, 6:52 AM): on a new regulation's early days (Reg M-D from Dec 2), a Pokémon with no tournament results for
// that regulation shows "Not rated yet": no number, no tier, no rank, until it has results. Before this, with no results ratings() fell back
// to stats and Gyarados showed "97 S tier #1 right now".
// Two parts:
//  1. day one: the page is put in Reg M-D's first day with no results (META.reg / META.perf.reg = {id: 'M-D', since: '2026-12-02'}; the
//     built-in M-C snapshot is then refused by builtinOk(), and RES is emptied), then #meta, #home, #pokemon=Gyarados, #box and #sets are
//     visited at 390 and 1440. Fails if the visible text (or a button's spoken label) gives any single Pokémon a rating, a tier or a rank.
//  2. today (the page's own Reg M-C data): V2.unrated is false for every Pokémon, V2.noRatings is false, and the Meta page still shows tiers
//     and "#1 right now" (so the day-one checks above could fail).
//   PAGE=app/dist/v2.html node experiments/unrated-test.mjs   (a --v2 build; exit 1 on any failure)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
let fails = 0; const ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails++; };
const b = await chromium.launch();
const DAY1 = `(() => { const R = {id: 'M-D', since: '2026-12-02'}; META.reg = R; META.perf = {reg: R}; META.results = null; RES = null; metaVersion++;
  S.box = ['Gyarados'].concat((S.box || []).filter(n => n !== 'Gyarados')); return 'ok'; })()`;
// what a rating looks like in words: "97", "S tier", "#1 right now", "#3 of 40", "Rated 97", "Why it rates 97"
const BAD = [[/\b[SABCDF]\s*tier\b/, 'a tier'], [/#\d+ right now/i, '"#N right now"'], [/right now\s*#?1\b/i, 'a #1'], [/#\d+ of \d+/, 'a rank "#N of M"'],
  [/\brated\s+(number\s+)?\d+(?!\s*[–-])/i, '"rated N"'], [/\brates\s+\d/i, '"rates N"'], [/\bThe top 10\b/i, 'the top 10'], [/\bThe four highest rated\b/i, 'the four highest rated']];
const scan = async q => q.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const main = document.querySelector('#main') || document.body;
  return {text: main.innerText, labels: [...main.querySelectorAll('[aria-label]')].filter(vis).map(e => e.getAttribute('aria-label')).join('\n')}; });
const open = async (w, hash, fake) => { const ctx = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 900}}); const q = await ctx.newPage();
  const errs = []; q.on('pageerror', e => errs.push(String(e.message || e)));
  await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#about', {timeout: 90000}); await q.waitForTimeout(2500);
  if (fake) await q.evaluate(c => window.__ev(c), DAY1);
  await q.evaluate(h => { location.hash = h; }, hash); await q.waitForTimeout(1500); return {q, ctx, errs}; };

console.log('Day one of Reg M-D, no results:');
for (const w of [390, 1440]) for (const h of ['#meta', '#home', '#pokemon=Gyarados', '#box', '#sets']) {
  const {q, ctx, errs} = await open(w, h, true);
  const st = await q.evaluate(() => window.__ev(`JSON.stringify({none: typeof V2.noRatings === 'function' ? V2.noRatings() : 'missing', gy: (rating(byName.get('Gyarados')) || {}).total, reg: (regInfo() || {}).id})`));
  const {text, labels} = await scan(q), hits = [];
  for (const [re, what] of BAD) { const m = re.exec(text); if (m) hits.push(`${what} in the text: "…${text.slice(Math.max(0, m.index - 40), m.index + 30).replace(/\s+/g, ' ')}…"`);
    const n = re.exec(labels); if (n) hits.push(`${what} in a spoken label: "…${labels.slice(Math.max(0, n.index - 50), n.index + 30).replace(/\s+/g, ' ')}…"`); }
  ok(!hits.length && !errs.length, `${h} at ${w}: no rating, tier or rank for an unrated Pokémon ${st}${hits.length ? '\n          ' + hits.slice(0, 4).join('\n          ') : ''}${errs.length ? '\n          page error: ' + errs.slice(0, 2).join(' | ') : ''}`);
  if (h === '#pokemon=Gyarados') { ok(/Not rated yet/.test(text) && !/\b97\b/.test(text), `${h} at ${w}: Gyarados says "Not rated yet", never 97`);
    ok(!/against the \d+ Pokémon with tournament results/.test(text) && !/#\d+ of \d+ with/.test(text), `${h} at ${w}: no claim of tournament results that don't exist`); }
  await ctx.close(); }

console.log('Today (the page\'s own Reg M-C data): unchanged');
{ const {q, ctx, errs} = await open(1440, '#meta', false);
  const r = JSON.parse(await q.evaluate(() => window.__ev(`JSON.stringify({has: typeof V2.unrated === 'function', none: typeof V2.noRatings === 'function' ? V2.noRatings() : null,
    young: typeof V2.regYoung === 'function' ? V2.regYoung() : null, unr: typeof V2.unrated === 'function' ? ROSTER.filter(p => V2.unrated(p)).map(p => p.n) : null, n: ROSTER.length,
    reg: regInfo(), rated: lairRows().length, same: typeof V2.ratedRows === 'function' ? V2.ratedRows().map(x => x.p.n).join() === lairRows().map(x => x.p.n).join() : null})`)));
  ok(r.has && r.none === false && r.young === false && Array.isArray(r.unr) && r.unr.length === 0 && r.same === true,
    `every one of ${r.n} Pokémon is rated as before (${JSON.stringify({reg: r.reg, noRatings: r.none, regYoung: r.young, unrated: r.unr && r.unr.slice(0, 5), sameRows: r.same})})`);
  const {text} = await scan(q);
  ok(/#1 right now/.test(text) && /\b[SA] tier\b/.test(text), 'the Meta page still shows "#1 right now" and tiers (so the day-one checks can fail)');
  /* the live site's own regulation line (out/reg.json: M-C since Sep 1, day 86 today): still past the first 28 days, so nothing changes */
  const r2 = JSON.parse(await q.evaluate(() => window.__ev(`(() => { META.reg = {id: 'M-C', since: '2026-09-01'}; metaVersion++;
    return JSON.stringify({reg: regInfo(), young: typeof V2.regYoung === 'function' ? V2.regYoung() : null, unr: typeof V2.unrated === 'function' ? ROSTER.filter(p => V2.unrated(p)).length : null}); })()`)));
  ok(r2.young === false && r2.unr === 0, `with the live regulation line (Reg M-C since Sep 1) nobody is unrated (${JSON.stringify(r2)})`);
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''));
  await ctx.close(); }
await b.close();
console.log(fails ? `unrated test: ${fails} FAILED` : 'unrated test: all passed');
process.exit(fails ? 1 : 0);

// Behaviour snapshot for refactors: builds the page, opens it with the same mocked data as app/test/run.mjs, and records
// what every view shows (its text), plus Build for me, Best additions, the Gauntlet and the damage calc after their
// buttons run. Compare two snapshots to prove a cleanup changed nothing a user can see.
// Usage: node experiments/snapshot.mjs out.json      then: node experiments/snapshot.mjs --diff a.json b.json
import fs from 'node:fs'; import {execFileSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
if (process.argv[2] === '--diff') {
  const A = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), B = JSON.parse(fs.readFileSync(process.argv[4], 'utf8')); let n = 0;
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) { if (A[k] === B[k]) continue; n++;
    const a = A[k] || '', b = B[k] || ''; let i = 0; while (i < a.length && a[i] === b[i]) i++;
    console.log(`DIFF ${k}\n  before: …${a.slice(Math.max(0, i - 80), i + 160).replace(/\n/g, ' | ')}\n  after:  …${b.slice(Math.max(0, i - 80), i + 160).replace(/\n/g, ' | ')}`); }
  console.log(n ? `${n} view(s) differ` : 'IDENTICAL'); process.exit(0); }
const {chromium} = await import('playwright');
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/';
execFileSync('node', [APP + 'build.mjs'], {stdio: 'ignore'});
const page = APP + 'dist/snap.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const browser = await chromium.launch(), ctx = await browser.newContext({viewport: {width: 1280, height: 900}}), pg = await ctx.newPage();
// a fixed clock, so "N days old" and dates read the same in both runs
await pg.addInitScript(D => { const T = Date.parse('2026-10-27T16:00:00Z'), RD = Date; window.Date = class extends RD { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } };
  window.claude = {use: async n => { await new Promise(r => setTimeout(r, 20));
    if (n === 'db') return {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})};
    if (n === 'user') return {id: async () => 'u_snap', isOwner: () => true}; return null; }}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const snap = {}, go = v => pg.evaluate(v => { const b = document.querySelector(`.sidenav [data-view="${v}"]`) || document.querySelector(`[data-view="${v}"]`); if (b) b.click(); }, v);
const text = v => pg.evaluate(v => { const p = document.querySelector(`[data-pane="${v}"]`); return p ? p.innerText : ''; }, v);
for (const v of ['home', 'build', 'matchup', 'speed', 'calc', 'gauntlet', 'arch', 'coverage', 'types', 'ratings', 'meta', 'cores', 'top', 'events', 'sets', 'teams', 'box']) {
  await go(v); await pg.waitForTimeout(v === 'gauntlet' || v === 'coverage' ? 2500 : 500); snap[v] = await text(v); }
await go('build'); await pg.waitForTimeout(300); snap['build:verdict'] = await pg.evaluate(() => (document.getElementById('verdict') || {}).textContent || '');
snap['build:plans'] = await pg.evaluate(() => (document.getElementById('sugs') || {}).textContent || '');
await go('auto'); await pg.waitForTimeout(300); await pg.evaluate(() => { const b = document.getElementById('abBtn'); if (b) b.click(); }); await pg.waitForTimeout(6000);
snap['auto:built'] = await pg.evaluate(() => (document.getElementById('abOut') || {}).innerText || '');
fs.writeFileSync(process.argv[2] || 'snapshot.json', JSON.stringify(snap, null, 1)); console.log('saved', Object.keys(snap).length, 'views');
await browser.close();

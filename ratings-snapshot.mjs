// Daily ratings snapshot (step 8, after the data and model): every Pokémon's NastyPlot rating as the page computes it
// today, kept for 120 days in out/ratings_log.json. scoreboard.mjs later checks each snapshot against the tournament
// games played AFTER it was taken, which the ratings could not have seen: the fairest test of whether they're right.
// Needs Playwright (installed by the op.gg step); if it's missing the step just skips.
import fs from 'node:fs'; import {execFileSync} from 'node:child_process';
const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
let chromium; try { ({chromium} = await import('playwright')); } catch (e) { console.log('ratings snapshot: playwright not installed, skipped'); process.exit(0); }
execFileSync('node', ['app/build.mjs'], {stdio: 'ignore'});
const page = 'app/dist/snapshot-ratings.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync('app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const L = rd('limitless.json'), D = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + process.cwd() + '/' + page); await pg.waitForTimeout(4000);
const r = await pg.evaluate(() => window.__ev('Object.fromEntries(ROSTER.map(p => [p.n, rating(p).total]))')); await b.close(); fs.unlinkSync(page);
const log = rd('ratings_log.json') || {days: []}, d = new Date().toISOString().slice(0, 10);
log.days = [...log.days.filter(x => x.d !== d), {d, r}].slice(-120); log.updated = new Date().toISOString();
fs.writeFileSync('out/ratings_log.json', JSON.stringify(log)); console.log(`ratings snapshot: ${Object.keys(r).length} Pokémon saved for ${d} (${log.days.length} days kept)`);

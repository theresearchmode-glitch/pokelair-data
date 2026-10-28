// Find which corrupted meta document causes bad text: swaps one document at a time from a dumped set into the good data.
// Usage: node experiments/stress-bisect.mjs <dump.json>
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const BAD = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const page = APP + 'stress-bisect.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
const diff = (a, b2, path = '', out = []) => { if (out.length > 12) return out; if (a && b2 && typeof a === 'object' && typeof b2 === 'object' && Array.isArray(a) === Array.isArray(b2)) { for (const k of new Set([...Object.keys(a), ...Object.keys(b2)])) diff(a[k], b2[k], path + '.' + k, out); } else if (JSON.stringify(a) !== JSON.stringify(b2)) out.push(path + ': ' + JSON.stringify(a).slice(0, 40) + ' -> ' + JSON.stringify(b2).slice(0, 40)); return out; };
for (const k of Object.keys(D)) {
  const docs = {...D, [k]: BAD[k]}; const ctx = await b.newContext(), pg = await ctx.newPage();
  await pg.addInitScript(docs => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: docs[p] !== undefined, data: () => docs[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, docs);
  await pg.goto('file://' + page); await pg.waitForTimeout(2000); const found = [];
  for (const v of ['home', 'build', 'teams', 'ratings', 'gauntlet']) { await pg.evaluate(v => window.__ev(`setView('${v}')`), v); await pg.waitForTimeout(v === 'gauntlet' ? 1500 : 300);
    const t = await pg.evaluate(() => (document.querySelector('main').innerText.match(/.{0,40}\bNaN\b.{0,20}/g) || []).slice(0, 2)); if (t.length) found.push(v + ': ' + t.join(' | ')); }
  if (found.length) { console.log(k, found.join(' ; ')); console.log('   changes:', diff(D[k], BAD[k]).join('\n            ')); }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page);

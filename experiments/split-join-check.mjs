// Page-storage split check (Nov 10): the page must join two-part daily documents back into exactly the original data.
// Loads the built page with the daily documents served the way the morning refresh will store them (out/split parts where a
// document is split) and compares what the page holds (META.<doc>) with the whole files. Also: a part 2 from another day
// (stamp mismatch) must be ignored. Usage: node split-docs.mjs && node experiments/split-join-check.mjs  (needs app/dist/page.html)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('..', import.meta.url).pathname, rd = f => JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8'));
const X = rd('split/index.json'), WHOLE = {results: rd('limitless.json').results, model: rd('model.json'), events: rd('events.json')};
const canon = x => JSON.stringify(x, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(q => [q, v[q]])) : v);
const docs = (stale, whole) => { const D = {}; for (const k of Object.keys(WHOLE)) { if (X.split[k] && !whole) { D['meta/' + k] = rd(`split/${k}.json`); const b = rd(`split/${k}_2.json`); if (stale) b._part = {id: 'yesterday', n: 2}; D['meta/' + k + '_2'] = b; } else D['meta/' + k] = WHOLE[k]; } return D; };
const page = ROOT + `app/sj-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(); let fails = 0;
// what the page holds for a set of documents (the page cleans some, e.g. events, so compare page with page, not page with file)
async function held(D) { const ctx = await b.newContext(), pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000); const out = {}; for (const k of Object.keys(WHOLE)) out[k] = await pg.evaluate(k => JSON.stringify(window.__ev(`META[${JSON.stringify(k)}]`)), k); await ctx.close(); return {out, errs}; }
const base = await held(docs(false, true));
const part1Only = {}; for (const k of Object.keys(WHOLE)) if (X.split[k]) { const a = rd(`split/${k}.json`); delete a._part; part1Only['meta/' + k] = a; } else part1Only['meta/' + k] = WHOLE[k];
const baseStale = await held(part1Only);
for (const stale of [false, true]) { const {out, errs} = await held(docs(stale)), ref = stale ? baseStale : base;
  for (const k of Object.keys(WHOLE)) { const ok = out[k] && out[k] !== 'null' && canon(JSON.parse(out[k])) === canon(JSON.parse(ref.out[k])); if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${k}${X.split[k] ? ' (split)' : ''}${stale ? ' with a stale part 2: same as part 1 alone' : ': same as the whole file'}`); }
  if (errs.length) { fails++; console.log('FAIL page errors:', errs.slice(0, 3).join(' | ')); } }
await b.close(); fs.unlinkSync(page); console.log(fails ? `${fails} failed` : 'split-join check: all good'); process.exit(fails ? 1 : 0);

// A partial team's Strength Score says "so far" everywhere it shows, as My Team does (code review A1-I5 + A2-CROSS, Nov 17).
// Uses the sample six cut to its first 3 Pokémon:
//   Compare's score cell: "so far" + "3 of 6 picked"
//   Tale of the Tape: the team's score line says "so far"; the Strength Score bar labels it "so far" and calls no team "ahead"
//   Home (The Stampede, Nov 18): the Strength Score report's band word says "so far" and shows no rank line (the old Home's
//     score belt, .fn-belt, is gone; the report card in the six band, stampede-six.js .sds-rc, is where Home shows the score now)
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-partial.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
const r = await p.evaluate(() => window.__ev(`(() => {
  const full = members(); if (full.length < 6) return {skip: 'sample six not loaded'};
  const gr = ms => CH.gradeOf(prepOf(ms), proChecks(ms, true), ms), ms3 = full.slice(0, 3), G3 = gr(ms3), G6 = gr(full);
  if (!G3 || !G3.partial) return {skip: 'no partial score for 3 Pokemon'};
  const txt = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\\s+/g, ' '); };
  const cell = txt(CX2.grade(G3)), cell6 = txt(CX2.grade(G6));
  const half = txt(V2.cxfHalf('A', {name: 'Test', sub: '', slots: S.slots.slice(0, 3)}, {G: G3}));
  const tape = txt(V2.cxfTape({G: G3}, {G: G6}));
  return {cell, cell6, half, tape}; })()`));
if (r.skip) { console.log('v2-partial: skipped, ' + r.skip); process.exit(1); }
ok(/so far/.test(r.cell) && /3 of 6 picked/.test(r.cell), `Compare: a 3-Pokémon team's score says "so far" and "3 of 6 picked" (${r.cell.trim().slice(0, 60)})`);
ok(!/so far/.test(r.cell6), 'Compare: a full six has no "so far"');
ok(/so far/.test(r.half), 'Tale of the Tape: the partial team\'s score line says "so far"');
ok(/so far/.test(r.tape) && !/ahead/.test(r.tape), 'Tale of the Tape: the Strength Score bar labels the partial team "so far" and calls no one ahead');
const rcText = () => p.evaluate(() => { const e = document.querySelector('#app .sds-rc'); return e ? {w: (e.querySelector('.sds-w') || {}).textContent || '', rk: (e.querySelector('.sds-rk') || {}).textContent || '', n: (e.querySelector('.sds-n') || {}).textContent || ''} : null; });
await p.evaluate(() => { location.hash = '#home'; }); await p.waitForTimeout(1500);
const rc6 = await rcText();
await p.evaluate(() => window.__ev(`(() => { S.slots = S.slots.map((s, i) => i < 3 ? s : blank()); V2.redraw(); })()`)); await p.waitForTimeout(1500);
const rc3 = await rcText();
ok(rc6 && /\d/.test(rc6.n) && !/so far/.test(rc6.w) && /of tournament teams/.test(rc6.rk), `Home (control): the full six's Strength Score report has a number, no "so far" and its rank line (${JSON.stringify(rc6)})`);
ok(rc3 && /\d/.test(rc3.n) && /so far/.test(rc3.w) && !rc3.rk, `Home: a 3-Pokémon team's Strength Score report says "so far" and shows no rank line (${JSON.stringify(rc3)})`);
await b.close();
console.log(`v2-partial: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);

// The Strength Score's number, band word and band colour come from the one number shown (rounded), with no sticky band (Sim, Nov 16,
// batch 10A; code review A2-I2 + A2-I3). Checks the band edges 59.5 / 69.5 / 79.5 / 89.5, a team whose last band was lower, and the
// sample six on My Team (number, word and colour agree). Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-shown-score.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(3000);
const r = await p.evaluate(() => window.__ev(`(() => { const ms = members();
  const edges = [59.5, 69.5, 79.5, 89.5].map(s => Math.round(s) + ' · ' + CH.wordOf(s) + ' · ' + CH.grade(s));
  CH.sticky(ms, 79); const st = CH.sticky(ms, 80.6);
  const G = CH.gradeOf(prepOf(ms), proChecks(ms, true), ms), n = Math.round(G.s);
  const shown = document.querySelector('#app .np-score b'), word = document.querySelector('#app .np-score .w span');
  return {edges, st, n, band: G.band, word: G.word, gb: CH.grade(n), gw: CH.wordOf(n), shownN: shown && shown.textContent.trim(), shownW: word && word.textContent.trim()}; })()`));
await b.close();
ok(r.edges.join(' | ') === '60 · Needs work · D | 70 · Solid · C | 80 · Tournament ready · B | 90 · Top tier · A', `band edges agree with the number shown: ${r.edges.join(' | ')}`);
ok(r.st === 'B', `no sticky band: a team last seen at 79 and now at 80.6 is in band B (got ${r.st})`);
ok(r.band === r.gb && r.word === r.gw, `the sample six: number ${r.n}, word "${r.word}", band ${r.band} all agree`);
ok(String(r.shownN) === String(r.n) && r.shownW && r.shownW.startsWith(r.gw), `My Team shows ${r.shownN} · ${r.shownW}`);
console.log(`v2-shown-score: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
